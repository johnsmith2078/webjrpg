import { createInitialState } from "../modules/state.js";
import { createGame } from "../modules/game.js";
import { derivePlayerStats } from "../modules/stats.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function main() {
  const state = createInitialState(123);
  state.inventory.runic_staff = 1;
  state.inventory.warding_robe = 1;

  const game = createGame({ state });

  game.equipItem("runic_staff");
  game.equipItem("warding_robe");

  const s1 = game.getState();
  const d1 = derivePlayerStats(s1);

  assert(s1.equipment.weapon === "runic_staff", "应装备 runic_staff 作为武器");
  assert(s1.equipment.armor === "warding_robe", "应装备 warding_robe 作为防具");
  assert(d1.maxMp >= 20, "符文法杖 + 护法长袍 + 奥术共鸣 应显著提升法力上限");
  assert((d1.bonuses || []).includes("奥术共鸣"), "应触发 奥术共鸣 组合效果");

  // Dropping last copy of an equipped item should auto-unequip.
  game.dropItem("runic_staff");
  const s2 = game.getState();
  assert(!s2.equipment.weapon, "丢弃最后一把武器后应自动卸下 weapon 槽");
}

try {
  main();
  console.log("PASS: equipment");
} catch (e) {
  console.error("FAIL: equipment", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
