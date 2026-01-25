import { DATA } from "./data.js";

export function recordItemGain(state, itemId, qty) {
  if (!state || !state.quests) return;
  const amount = Number(qty || 0);
  if (!itemId || amount <= 0) return;

  for (const [questId, quest] of Object.entries(DATA.quests || {})) {
    const questState = state.quests[questId];
    if (!questState || !questState.started || questState.completed) continue;
    if (!quest.objectives) continue;

    for (const objective of quest.objectives) {
      if (objective.type !== "collect") continue;
      if (objective.countMode !== "acquire") continue;
      if (objective.item !== itemId) continue;

      if (!questState.progress) questState.progress = {};
      const objKey = `${questId}_${objective.type}_${objective.item || objective.location || objective.enemy}`;
      const target = Number(objective.qty || objective.count || 1);
      const existing = questState.progress[objKey];
      if (!existing) {
        const current = Number(state.inventory[itemId] || 0);
        questState.progress[objKey] = { current, target, complete: current >= target };
        continue;
      }
      const prev = Number(existing.current || 0);
      const next = prev + amount;
      questState.progress[objKey] = { current: next, target, complete: next >= target };
    }
  }
}
