import { createInitialState } from "../modules/state.js";
import { createGame } from "../modules/game.js";
import { applyOps } from "../modules/events.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function testSpendGold() {
  const state = createInitialState(123);
  state.player.gold = 10;
  const lines = [];
  applyOps(state, null, [{ op: "spendGold", amt: 3 }], lines);
  assert(state.player.gold === 7, "spendGold should deduct exactly once");
}

function testSellOre() {
  const state = createInitialState(123);
  state.flags.met_blacksmith = true;
  state.inventory.iron_ore = 3;
  state.player.gold = 0;

  const game = createGame({ state });
  game.handleChoice("craft");
  game.handleChoice("craft:sell_ore");

  const next = game.getState();
  assert(next.player.gold === 1, "sell_ore should add gold");
  assert(!next.inventory.gold, "gold should not be stored in inventory");
}

function testCraftObjective() {
  const state = createInitialState(123);
  state.flags.met_blacksmith = true;
  state.flags.has_iron_blade = true;
  state.inventory.iron_ingot = 2;
  state.inventory.monster_fang = 2;
  state.inventory.spirit_stone = 1;
  state.quests = { blacksmith_mastery: { started: true, progress: {} } };

  const game = createGame({ state });
  game.handleChoice("craft");
  game.handleChoice("craft:forge_master_blade");

  const next = game.getState();
  assert(next.flags.crafted_forge_master_blade, "crafted flag should be set");
  assert(next.quests.blacksmith_mastery.completed, "craft objective should complete");
}

try {
  testSpendGold();
  testSellOre();
  testCraftObjective();
  console.log("PASS: economy_quests");
} catch (e) {
  console.error("FAIL: economy_quests", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
