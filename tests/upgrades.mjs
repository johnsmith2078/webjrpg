import { createInitialState } from "../modules/state.js";
import { applyOps } from "../modules/events.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function runService(state, npcId, serviceId) {
  const lines = [];
  applyOps(state, {}, [{ op: "npcService", npc: npcId, service: serviceId }], lines);
  return lines;
}

function testUpgradeWeaponSwapsEquipment() {
  const state = createInitialState(123);
  state.inventory.iron_blade = 1;
  state.inventory.monster_fang = 2;
  state.inventory.iron_ingot = 1;
  state.player.gold = 50;
  state.equipment.weapon = "iron_blade";

  runService(state, "blacksmith", "upgrade_weapon");

  assert(!state.inventory.iron_blade, "升级后不应保留 iron_blade");
  assert(Number(state.inventory.master_blade || 0) === 1, "升级后应获得 master_blade");
  assert(state.equipment.weapon === "master_blade", "升级武器应替换已装备武器");
  assert(state.player.gold === 40, "升级武器应扣除 10 金币");
}

function testUpgradeArmorSwapsEquipment() {
  const state = createInitialState(123);
  state.inventory.warding_robe = 1;
  state.inventory.paper_ash = 2;
  state.inventory.spirit_stone = 1;
  state.player.gold = 50;
  state.equipment.armor = "warding_robe";

  runService(state, "works_machinist", "upgrade_warding_robe");

  assert(!state.inventory.warding_robe, "升级后不应保留 warding_robe");
  assert(Number(state.inventory.warding_robe_lined || 0) === 1, "升级后应获得 warding_robe_lined");
  assert(state.equipment.armor === "warding_robe_lined", "升级防具应替换已装备防具");
  assert(state.player.gold === 40, "升级防具应扣除 10 金币");
}

function main() {
  testUpgradeWeaponSwapsEquipment();
  testUpgradeArmorSwapsEquipment();
  console.log("PASS: upgrades");
}

try {
  main();
} catch (e) {
  console.error("FAIL:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
