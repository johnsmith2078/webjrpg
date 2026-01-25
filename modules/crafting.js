import { DATA } from "./data.js";
import { hasAllFlags, nowId } from "./utils.js";

export function listAvailableRecipes(state) {
  const out = [];
  for (const [id, r] of Object.entries(DATA.recipes)) {
    const req = r.requirements;
    if (req && req.flags && !hasAllFlags(state, req.flags)) continue;
    
    if (r.hiddenIf && r.hiddenIf.flags && hasAllFlags(state, r.hiddenIf.flags)) continue;
    
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
      if (r.effects.stats.maxMp) {
        const inc = Number(r.effects.stats.maxMp);
        state.player.maxMp += inc;
        state.player.mp += inc;
      }
      if (r.effects.stats.maxEn) {
        const inc = Number(r.effects.stats.maxEn);
        state.player.maxEn += inc;
        state.player.en += inc;
      }
    }
  }
  state.timeMin += Number(r.timeCostMin || 15);
  
  const outputItems = Object.entries(r.outputs || {}).map(([itemId, qty]) => {
    const itemName = DATA.items[itemId]?.name || itemId;
    return `${itemName} x${qty}`;
  }).join("、");
  
  const inputItems = Object.entries(r.inputs || {}).map(([itemId, qty]) => {
    const itemName = DATA.items[itemId]?.name || itemId;
    return `${itemName} x${qty}`;
  }).join("、");
  
  state.log.push({ id: nowId(), type: "system", text: `制作完成：${r.name}` });
  if (inputItems) {
    state.log.push({ id: nowId(), type: "system", text: `消耗：${inputItems}` });
  }
  if (outputItems) {
    state.log.push({ id: nowId(), type: "system", text: `获得：${outputItems}` });
  }
  
  if (r.effects) {
    if (r.effects.setFlag) {
      const flagName = r.effects.setFlag;
      if (flagName === "has_iron_blade") {
        state.flags.skills_learned_purify = true;
        state.log.push({ id: nowId(), type: "rare", text: "铁刃在手，你感到力量涌动。破邪斩已准备就绪。" });
      } else if (flagName === "has_master_blade") {
        state.log.push({ id: nowId(), type: "rare", text: "神刃成！传说中的武器认你为主。" });
      }
    }
    if (r.effects.stats) {
      if (r.effects.stats.atk) {
        state.log.push({ id: nowId(), type: "system", text: `攻击力 +${r.effects.stats.atk}` });
      }
      if (r.effects.stats.def) {
        state.log.push({ id: nowId(), type: "system", text: `防御力 +${r.effects.stats.def}` });
      }
      if (r.effects.stats.maxMp) {
        state.log.push({ id: nowId(), type: "system", text: `法力上限 +${r.effects.stats.maxMp}` });
      }
      if (r.effects.stats.maxEn) {
        state.log.push({ id: nowId(), type: "system", text: `能量上限 +${r.effects.stats.maxEn}` });
      }
    }
  }
}
