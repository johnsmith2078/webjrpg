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
      return Number(min || 0);
    }
  };
}

function setup(enemyId) {
  const state = createInitialState(1);
  state.player.maxHp = 999;
  state.player.hp = 999;
  state.player.atk = 10;
  startCombat(state, enemyId);
  state.combat.enemyHp = 999;
  return state;
}

function testEvasionDodgesPlayerAttack() {
  const rng = makeRng();
  const s = setup("wolf");
  // Force: next physical attack should be dodged.
  s.combat.enemyEvasionReady = 1;
  const before = s.combat.enemyHp;
  resolveCombatAction(s, rng, "attack");
  assert(s.combat.enemyHp === before, "闪避应让本次攻击落空 (敌人HP不变)");
}

function testFocusDoesNotBypassEvasion() {
  const rng = makeRng();
  const s = setup("wolf");
  s.flags.skills_learned_focus = true;
  resolveCombatAction(s, rng, "skill:focus");
  // Force: next physical attack should be dodged (after the enemy turn re-roll).
  s.combat.enemyEvasionReady = 1;
  const before = s.combat.enemyHp;
  resolveCombatAction(s, rng, "attack");
  assert(s.combat.enemyHp === before, "凝神不应提供必中 (闪避准备时仍应落空)");
}

function testFocusTeaDoesNotBypassEvasion() {
  const rng = makeRng();
  const s = setup("wolf");
  s.inventory.focus_tea = 1;
  resolveCombatAction(s, rng, "use:focus_tea");
  // Force: next physical attack should be dodged (after the enemy turn re-roll).
  s.combat.enemyEvasionReady = 1;
  const before = s.combat.enemyHp;
  resolveCombatAction(s, rng, "attack");
  assert(s.combat.enemyHp === before, "凝神茶不应提供必中 (闪避准备时仍应落空)");
}

function main() {
  testEvasionDodgesPlayerAttack();
  testFocusDoesNotBypassEvasion();
  testFocusTeaDoesNotBypassEvasion();
  console.log("PASS: evasion_focus");
}

try {
  main();
} catch (e) {
  console.error("FAIL:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
