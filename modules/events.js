import { DATA } from "./data.js";
import { recordItemGain } from "./quests.js";
import { hasAllFlags, nowId } from "./utils.js";
import { derivePlayerStats } from "./stats.js";

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
  if (req.items) {
    for (const [id, qty] of Object.entries(req.items)) {
      const q = Number(qty || 1);
      if (!hasEnoughItem(state, id, q)) return { ok: false, reason: "道具不足" };
    }
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
      recordItemGain(state, item, qty);
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
      lines.push({ id: nowId(), type: "system", text: `获得 ${amt} 金币。`, });
    }
    if (op.op === "spendGold") {
      const amt = Number(op.amt || 0);
      state.player.gold = Math.max(0, Number(state.player.gold || 0) - amt);
      lines.push({ id: nowId(), type: "system", text: `花费 ${amt} 金币。`, });
    }
    if (op.op === "spendGold") {
      const amt = Number(op.amt || 0);
      state.player.gold = Math.max(0, Number(state.player.gold || 0) - amt);
      lines.push({ id: nowId(), type: "system", text: `花费 ${amt} 金币。`, });
    }
    if (op.op === "setFlag") {
      state.flags[op.flag] = true;
    }
    if (op.op === "clearFlag") {
      delete state.flags[op.flag];
    }
    if (op.op === "log") {
      lines.push({ id: nowId(), type: "narration", text: op.text });
    }
    if (op.op === "advanceTime") {
      state.timeMin += Number(op.min || 0);
    }
    if (op.op === "heal") {
      const amt = Number(op.amt || 0);
      const derived = derivePlayerStats(state);
      state.player.hp = Math.min(Number(state.player.maxHp || 20), state.player.hp + amt);
      lines.push({ id: nowId(), type: "system", text: `恢复了 ${amt} 点体力。` });
    }
    if (op.op === "npcService") {
      const npcId = op.npc;
      const serviceId = op.service;
      const npc = DATA.npcs && DATA.npcs[npcId];
      const services = npc && (npc.services || (npc.dialogues && npc.dialogues.services));
      const service = services && services[serviceId];
      if (!service) {
        lines.push({ id: nowId(), type: "system", text: "服务不存在。" });
        continue;
      }
      // Check cost
      if (typeof service.cost === "number" && service.cost > 0) {
        if (!hasEnoughGold(state, service.cost)) {
          lines.push({ id: nowId(), type: "system", text: "钱不够。" });
          continue;
        }
        if (service.cost > 0) {
          state.player.gold = Math.max(0, Number(state.player.gold || 0) - service.cost);
          lines.push({ id: nowId(), type: "system", text: `花费 ${service.cost} 钱。` });
        }
      }
      // Consume input items
      if (service.requires && service.requires.items) {
        for (const [itemId, qty] of Object.entries(service.requires.items)) {
          state.inventory[itemId] = Number(state.inventory[itemId] || 0) - Number(qty);
          if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
        }
      }
      // Give output items
      if (service.gives) {
        if (service.gives.item) {
          const qty = service.gives.qty || 1;
          state.inventory[service.gives.item] = Number(state.inventory[service.gives.item] || 0) + qty;
          recordItemGain(state, service.gives.item, qty);
          const name = DATA.items[service.gives.item]?.name || service.gives.item;
          lines.push({ id: nowId(), type: "system", text: `获得：${name} x${qty}` });
        }
        if (service.gives.items) {
          for (const [itemId, qty] of Object.entries(service.gives.items)) {
            state.inventory[itemId] = Number(state.inventory[itemId] || 0) + Number(qty);
            recordItemGain(state, itemId, qty);
            const name = DATA.items[itemId]?.name || itemId;
            lines.push({ id: nowId(), type: "system", text: `获得：${name} x${qty}` });
          }
        }
        if (service.gives.gold) {
          state.player.gold += Number(service.gives.gold);
          lines.push({ id: nowId(), type: "system", text: `获得 ${service.gives.gold} 金币。` });
        }
        if (service.gives.skill) {
          state.flags[`skills_learned_${service.gives.skill}`] = true;
          const skillName = DATA.skills[service.gives.skill]?.name || service.gives.skill;
          lines.push({ id: nowId(), type: "system", text: `学会了：${skillName}` });
        }
      }
      // Log service name
      if (service.name) {
        lines.push({ id: nowId(), type: "system", text: `使用了服务：${service.name}` });
      }
    }
    if (op.op === "startQuest") {
      const qId = op.quest;
      if (!state.quests) state.quests = {};
      if (!state.quests[qId]) {
        state.quests[qId] = { started: true, progress: {} };
        const qName = (DATA.quests && DATA.quests[qId] && DATA.quests[qId].name) || qId;
        lines.push({ id: nowId(), type: "system", text: `接受任务：${qName}` });
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
    if (ev.at !== state.location && ev.at !== "random") continue;
    if (ev.requirements) {
      const check = checkRequirements(state, ev.requirements);
      if (!check.ok) continue;
    }

    if (ev.once) {
      const seen = state.seenEvents && typeof state.seenEvents === "object" ? Number(state.seenEvents[id] || 0) : 0;
      if (seen <= 0) {
        priorityOnce.push({ id, p: Number(ev.priority || 0) });
        continue;
      } else {
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
