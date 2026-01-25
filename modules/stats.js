import { DATA } from "./data.js";

function num(x) {
  return Number.isFinite(Number(x)) ? Number(x) : 0;
}

export function getItemSlot(item) {
  if (!item || typeof item !== "object") return null;
  if (item.slot === "weapon" || item.slot === "armor") return item.slot;
  const tags = Array.isArray(item.tags) ? item.tags : [];
  if (tags.includes("weapon")) return "weapon";
  if (tags.includes("armor")) return "armor";
  return null;
}

export function isEquipableItemId(itemId) {
  const it = DATA.items[itemId];
  return !!getItemSlot(it);
}

export function derivePlayerStats(state) {
  const p = state && state.player ? state.player : {};
  const out = {
    atk: num(p.atk),
    def: num(p.def),
    maxHp: num(p.maxHp),
    maxMp: num(p.maxMp),
    maxEn: num(p.maxEn),
    bonuses: []
  };

  const equip = state && state.equipment ? state.equipment : {};
  const equippedIds = [equip.weapon, equip.armor].filter(Boolean);
  const equippedItems = equippedIds.map((id) => DATA.items[id]).filter(Boolean);

  for (const it of equippedItems) {
    const s = it.stats && typeof it.stats === "object" ? it.stats : null;
    if (!s) continue;
    if (s.atk) out.atk += num(s.atk);
    if (s.def) out.def += num(s.def);
    if (s.maxHp) out.maxHp += num(s.maxHp);
    if (s.maxMp) out.maxMp += num(s.maxMp);
    if (s.maxEn) out.maxEn += num(s.maxEn);
  }

  const tagCounts = new Map();
  for (const it of equippedItems) {
    const tags = Array.isArray(it.tags) ? it.tags : [];
    for (const t of tags) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
  }

  const combos = DATA.equipmentBonuses && Array.isArray(DATA.equipmentBonuses.tagCombos) ? DATA.equipmentBonuses.tagCombos : [];
  for (const combo of combos) {
    if (!combo || typeof combo !== "object") continue;
    const needTag = combo.tag;
    const needCount = num(combo.count || 0);
    if (!needTag || needCount <= 0) continue;
    if ((tagCounts.get(needTag) || 0) < needCount) continue;

    const s = combo.stats && typeof combo.stats === "object" ? combo.stats : null;
    if (s) {
      if (s.atk) out.atk += num(s.atk);
      if (s.def) out.def += num(s.def);
      if (s.maxHp) out.maxHp += num(s.maxHp);
      if (s.maxMp) out.maxMp += num(s.maxMp);
      if (s.maxEn) out.maxEn += num(s.maxEn);
    }
    if (combo.name) out.bonuses.push(String(combo.name));
  }

  return out;
}

export function getEquippedItemId(state, slot) {
  if (!state || !state.equipment) return null;
  if (slot !== "weapon" && slot !== "armor") return null;
  return state.equipment[slot] || null;
}

export function getEquippedItem(state, slot) {
  const id = getEquippedItemId(state, slot);
  return id ? DATA.items[id] : null;
}
