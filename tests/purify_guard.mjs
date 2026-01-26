import { createInitialState } from "../modules/state.js";
import { createGame } from "../modules/game.js";
import { startCombat } from "../modules/combat.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function setupState() {
  const state = createInitialState(0);
  state.flags.skills_learned_purify = true;
  state.equipment.weapon = null;
  startCombat(state, "bandit");
  return state;
}

function testPurifyDisabledNoWeapon() {
  const state = setupState();
  const game = createGame({ state });
  const choices = game.choices();
  const purify = choices.find((c) => c.id === "skill:purify");

  assert(purify, "应显示破邪斩选项");
  assert(purify.disabled, "无可用武器时破邪斩应被禁用");
  assert(purify.sub && purify.sub.length > 0, "禁用时应显示原因提示");
}

function testPurifyDoesNotConsumeTurnWhenDisabled() {
  const state = setupState();
  const game = createGame({ state });
  const beforeTime = state.timeMin;

  game.handleChoice("skill:purify");

  assert(state.timeMin === beforeTime, "禁用的破邪斩不应消耗回合");
}

try {
  testPurifyDisabledNoWeapon();
  testPurifyDoesNotConsumeTurnWhenDisabled();
  console.log("PASS: purify_guard");
} catch (e) {
  console.error("FAIL: purify_guard", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
