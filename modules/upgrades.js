import { DATA } from "./data.js";
import { clamp, nowId } from "./utils.js";
import { derivePlayerStats, getItemSlot } from "./stats.js";

function ensureEquipmentState(state) {
  if (!state.equipment || typeof state.equipment !== "object") {
    state.equipment = { weapon: null, armor: null };
    return;
  }
  if (!("weapon" in state.equipment)) state.equipment.weapon = null;
  if (!("armor" in state.equipment)) state.equipment.armor = null;
}

export function consumeItemsWithUnequip(state, items, lines) {
  ensureEquipmentState(state);
  const inv = state.inventory && typeof state.inventory === "object" ? state.inventory : (state.inventory = {});
  const unequippedSlots = new Set();

  for (const [itemId, qty] of Object.entries(items || {})) {
    const q = Number(qty || 0);
    if (!itemId || q <= 0) continue;
    inv[itemId] = Number(inv[itemId] || 0) - q;
    if (inv[itemId] <= 0) delete inv[itemId];

    if (Number(inv[itemId] || 0) > 0) continue;

    let removed = false;
    if (state.equipment.weapon === itemId) {
      state.equipment.weapon = null;
      unequippedSlots.add("weapon");
      removed = true;
    }
    if (state.equipment.armor === itemId) {
      state.equipment.armor = null;
      unequippedSlots.add("armor");
      removed = true;
    }
    if (removed) {
      const name = DATA.items[itemId]?.name || itemId;
      lines.push({ id: nowId(), type: "system", text: `已卸下：${name}（已无该物品）` });
    }
  }

  return unequippedSlots;
}

export function autoEquipFromGiven(state, itemIds, preferSlot, lines) {
  ensureEquipmentState(state);
  const ids = Array.isArray(itemIds) ? itemIds.filter(Boolean) : [];
  if (ids.length === 0) return;

  // Prefer equipping into the slot we just unequipped.
  const candidates = ids
    .map((id) => ({ id, it: DATA.items[id], slot: getItemSlot(DATA.items[id]) }))
    .filter((x) => !!x.it && !!x.slot);

  let picked = null;
  if (preferSlot) {
    picked = candidates.find((c) => c.slot === preferSlot) || null;
  }
  if (!picked) picked = candidates[0] || null;
  if (!picked) return;

  if (picked.slot === "weapon" && state.equipment.weapon) return;
  if (picked.slot === "armor" && state.equipment.armor) return;

  state.equipment[picked.slot] = picked.id;
  lines.push({ id: nowId(), type: "system", text: `装备：${picked.it.name}` });

  const after = derivePlayerStats(state);
  if (state.player) {
    state.player.hp = clamp(Number(state.player.hp || 0), 0, Number(after.maxHp || state.player.maxHp || 20));
    state.player.mp = Math.min(Number(state.player.mp || 0), Number(after.maxMp || state.player.maxMp || 0));
    state.player.en = Math.min(Number(state.player.en || 0), Number(after.maxEn || state.player.maxEn || 0));
  }
}
