import { DATA } from "./data.js";

export function locationTargets(state) {
  const loc = DATA.locations[state.location];
  if (!loc) return [];
  const connections = Array.isArray(loc.connections) ? loc.connections : [];
  const targets = [];
  for (const id of connections) {
    if (state.unlocked[id]) targets.push(id);
  }
  targets.sort();
  return targets;
}

export function travel(state, toId) {
  const targets = locationTargets(state);
  if (!targets.includes(toId)) return { ok: false, reason: "这条路走不通。" };
  state.location = toId;
  state.discovered[toId] = true;
  state.timeMin += 10;
  return { ok: true };
}
