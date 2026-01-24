import { DATA } from "./data.js";
import { hasAllFlags, nowId } from "./utils.js";

function hasEnoughGold(state, amt) {
  const n = Number(state.player && state.player.gold ? state.player.gold : 0);
  return n >= Number(amt || 0);
}

function hasEnoughItem(state, itemId, qty) {
  if (!itemId) return true;
  const n = Number(state.inventory && state.inventory[itemId] ? state.inventory[itemId] : 0);
  return n >= Number(qty || 0);
}

export function checkRequirements(state, req) {
  if (!req || typeof req !== "object") return { ok: true };
  if (req.flags) {
    if (!hasAllFlags(state, req.flags)) return { ok: false, reason: "条件不足" };
  }
  if (typeof req.gold === "number") {
    if (!hasEnoughGold(state, req.gold)) return { ok: false, reason: "钱不够" };
  }
  if (req.item) {
    const q = typeof req.qty === "number" ? req.qty : 1;
    if (!hasEnoughItem(state, req.item, q)) return { ok: false, reason: "道具不足" };
  }
  return { ok: true };
}

export function applyOps(state, rng, ops, lines) {
  let startCombat = null;
  let endGame = false;

  for (const op of ops || []) {
    if (!op || typeof op !== "object") continue;
    if (op.op === "gainItem") {
      const item = op.item;
      const qty = Number(op.qty || 1);
      state.inventory[item] = Number(state.inventory[item] || 0) + qty;
      const name = (DATA.items[item] && DATA.items[item].name) || item;
      lines.push({ id: nowId(), type: "system", text: `获得：${name} x${qty}` });
    }
    if (op.op === "loseItem") {
      const item = op.item;
      const qty = Number(op.qty || 1);
      state.inventory[item] = Number(state.inventory[item] || 0) - qty;
      if (state.inventory[item] <= 0) delete state.inventory[item];
      const name = (DATA.items[item] && DATA.items[item].name) || item;
      lines.push({ id: nowId(), type: "system", text: `失去：${name} x${qty}` });
    }
    if (op.op === "gainGold") {
      const amt = Number(op.amt || 0);
      state.player.gold += amt;
      lines.push({ id: nowId(), type: "system", text: `获得 ${amt} 钱。` });
    }
    if (op.op === "spendGold") {
      const amt = Number(op.amt || 0);
      state.player.gold = Math.max(0, Number(state.player.gold || 0) - amt);
      lines.push({ id: nowId(), type: "system", text: `花费 ${amt} 钱。` });
    }
    if (op.op === "setFlag") {
      state.flags[op.flag] = true;
    }
    if (op.op === "clearFlag") {
      delete state.flags[op.flag];
    }
    if (op.op === "advanceTime") {
      state.timeMin += Number(op.min || 0);
    }
    if (op.op === "heal") {
      const amt = Number(op.amt || 0);
      if (amt > 0) {
        const before = Number(state.player.hp || 0);
        state.player.hp = Math.min(Number(state.player.maxHp || 0), before + amt);
        lines.push({ id: nowId(), type: "system", text: `恢复 ${state.player.hp - before} 点体力。` });
      }
    }
    if (op.op === "startCombat") {
      startCombat = op.enemy;
    }
    if (op.op === "endGame") {
      endGame = true;
    }
  }

  return { startCombat, endGame };
}

export function rollEventId(state, rng) {
  const weighted = [];
  const priorityOnce = [];
  for (const [id, ev] of Object.entries(DATA.events)) {
    if (ev.at !== state.location) continue;
    if (ev.requirements) {
      const check = checkRequirements(state, ev.requirements);
      if (!check.ok) continue;
    }

    if (ev.once) {
      const seen = state.seenEvents && typeof state.seenEvents === "object" ? Number(state.seenEvents[id] || 0) : 0;
      if (seen <= 0) {
        priorityOnce.push({ id, p: Number(ev.priority || 0) });
        continue;
      }
    }

    const w = ev.w || 0;
    if (w > 0) weighted.push({ id, w });
  }

  if (priorityOnce.length > 0) {
    priorityOnce.sort((a, b) => (b.p - a.p) || a.id.localeCompare(b.id));
    return priorityOnce[0].id;
  }

  return rng.pickWeighted(weighted);
}

export function applyEvent(state, rng, eventId) {
  const ev = DATA.events[eventId];
  if (!ev) {
    return { lines: [{ id: nowId(), type: "system", text: "（事件缺失）" }], startCombat: null, endGame: false };
  }

  const lines = [];
  for (const t of ev.text || []) {
    lines.push({ id: nowId(), type: "narration", text: t });
  }

  if (!state.seenEvents || typeof state.seenEvents !== "object") {
    state.seenEvents = {};
  }
  state.seenEvents[eventId] = Number(state.seenEvents[eventId] || 0) + 1;

  const { startCombat, endGame } = applyOps(state, rng, ev.ops || [], lines);

  let prompt = null;
  if (ev.prompt && typeof ev.prompt === "object") {
    const title = typeof ev.prompt.title === "string" ? ev.prompt.title : "";
    const choices = Array.isArray(ev.prompt.choices) ? ev.prompt.choices : [];
    prompt = {
      eventId,
      title,
      choices: choices
        .filter((c) => c && typeof c === "object" && typeof c.id === "string")
        .map((c) => {
          const req = c.requires || null;
          const check = checkRequirements(state, req);
          return {
            id: c.id,
            label: String(c.label || c.id),
            disabled: !check.ok,
            disabledReason: check.ok ? "" : check.reason,
            ops: Array.isArray(c.ops) ? c.ops : []
          };
        })
    };
  }

  return { lines, startCombat, endGame, prompt };
}
