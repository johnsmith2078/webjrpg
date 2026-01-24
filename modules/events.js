import { DATA } from "./data.js";
import { hasAllFlags, nowId } from "./utils.js";

export function rollEventId(state, rng) {
  const weighted = [];
  const priorityOnce = [];
  for (const [id, ev] of Object.entries(DATA.events)) {
    if (ev.at !== state.location) continue;
    if (ev.requirements && ev.requirements.flags) {
      if (!hasAllFlags(state, ev.requirements.flags)) continue;
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

  let startCombat = null;
  let endGame = false;

  for (const op of ev.ops || []) {
    if (!op || typeof op !== "object") continue;
    if (op.op === "gainItem") {
      const item = op.item;
      const qty = Number(op.qty || 1);
      state.inventory[item] = Number(state.inventory[item] || 0) + qty;
      const name = (DATA.items[item] && DATA.items[item].name) || item;
      lines.push({ id: nowId(), type: "system", text: `获得：${name} x${qty}` });
    }
    if (op.op === "setFlag") {
      state.flags[op.flag] = true;
    }
    if (op.op === "advanceTime") {
      state.timeMin += Number(op.min || 0);
    }
    if (op.op === "startCombat") {
      startCombat = op.enemy;
    }
    if (op.op === "endGame") {
      endGame = true;
    }
  }

  return { lines, startCombat, endGame };
}
