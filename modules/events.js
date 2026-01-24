import { DATA } from "./data.js";
import { hasAllFlags, nowId } from "./utils.js";

export function rollEventId(state, rng) {
  const weighted = [];
  for (const [id, ev] of Object.entries(DATA.events)) {
    if (ev.at !== state.location) continue;
    if (ev.requirements && ev.requirements.flags) {
      if (!hasAllFlags(state, ev.requirements.flags)) continue;
    }
    const w = ev.w || 0;
    if (w > 0) weighted.push({ id, w });
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
