import { DATA } from "./data.js";
import { hasAllFlags, nowId } from "./utils.js";

export function listAvailableRecipes(state) {
  const out = [];
  for (const [id, r] of Object.entries(DATA.recipes)) {
    const req = r.requirements;
    if (req && req.flags && !hasAllFlags(state, req.flags)) continue;
    out.push({ id, ...r });
  }
  return out;
}

export function canCraft(state, recipe) {
  for (const [itemId, qty] of Object.entries(recipe.inputs || {})) {
    if (Number(state.inventory[itemId] || 0) < Number(qty || 0)) return false;
  }
  return true;
}

export function craft(state, recipeId) {
  const r = DATA.recipes[recipeId];
  if (!r) {
    state.log.push({ id: nowId(), type: "system", text: "配方不存在。" });
    return;
  }
  if (!canCraft(state, r)) {
    state.log.push({ id: nowId(), type: "system", text: "材料不足。" });
    return;
  }
  for (const [itemId, qty] of Object.entries(r.inputs || {})) {
    state.inventory[itemId] = Number(state.inventory[itemId] || 0) - Number(qty || 0);
    if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
  }
  for (const [itemId, qty] of Object.entries(r.outputs || {})) {
    state.inventory[itemId] = Number(state.inventory[itemId] || 0) + Number(qty || 0);
  }
  if (r.effects) {
    if (r.effects.setFlag) state.flags[r.effects.setFlag] = true;
    if (r.effects.stats) {
      if (r.effects.stats.atk) state.player.atk += Number(r.effects.stats.atk);
      if (r.effects.stats.def) state.player.def += Number(r.effects.stats.def);
      if (r.effects.stats.maxHp) {
        const inc = Number(r.effects.stats.maxHp);
        state.player.maxHp += inc;
        state.player.hp += inc;
      }
    }
  }
  state.timeMin += Number(r.timeCostMin || 15);
  state.log.push({ id: nowId(), type: "system", text: `制作完成：${r.name}` });
}
