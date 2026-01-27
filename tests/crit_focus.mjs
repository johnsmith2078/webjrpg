import { createInitialState } from "../modules/state.js";
import { startCombat, resolveCombatAction } from "../modules/combat.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function makeRng() {
  return {
    nextFloat() {
      return 0.99;
    },
    nextInt(min) {
      return Math.ceil(min);
    }
  };
}

function setupState() {
  const state = createInitialState(0);
  state.player.atk = 10;
  state.player.def = 0;
  state.player.maxHp = 999;
  state.player.hp = 999;
  startCombat(state, "bandit");
  state.combat.enemyHp = 999;
  return state;
}

function dealDamage(state, rng, action) {
  const before = state.combat.enemyHp;
  resolveCombatAction(state, rng, action);
  return before - state.combat.enemyHp;
}

function testFocusSkillDamageBoost() {
  const state = setupState();
  const rng = makeRng();

  resolveCombatAction(state, rng, "skill:focus");
  const dmg = dealDamage(state, rng, "attack");
  assert(dmg === 13, `凝神(35%)应造成 13 伤害，实际 ${dmg}`);
}

function testFocusTeaDamageBoost() {
  const state = setupState();
  const rng = makeRng();

  state.inventory.focus_tea = 1;
  resolveCombatAction(state, rng, "use:focus_tea");
  const dmg = dealDamage(state, rng, "attack");
  assert(dmg === 15, `凝神茶(50%)应造成 15 伤害，实际 ${dmg}`);
}

function testFocusPowerStrikeDamageBoost() {
  const state = setupState();
  const rng = makeRng();

  resolveCombatAction(state, rng, "skill:focus");
  const dmg = dealDamage(state, rng, "skill:power_strike");
  assert(dmg === 21, `凝神叠加强力击应造成 21 伤害，实际 ${dmg}`);
}

try {
  testFocusSkillDamageBoost();
  testFocusTeaDamageBoost();
  testFocusPowerStrikeDamageBoost();
  console.log("PASS: crit_focus");
} catch (e) {
  console.error("FAIL: crit_focus", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
