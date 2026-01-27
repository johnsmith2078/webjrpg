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

function testFocusMakesSureHit() {
  const rng = makeRng();
  const s = setup("wolf");
  s.flags.skills_learned_focus = true;
  s.combat.enemyEvasionReady = 1;
  resolveCombatAction(s, rng, "skill:focus");
  const before = s.combat.enemyHp;
  resolveCombatAction(s, rng, "attack");
  assert(s.combat.enemyHp < before, "凝神后应必中 (敌人HP应下降)");
}

function testFocusTeaMakesSureHit() {
  const rng = makeRng();
  const s = setup("wolf");
  s.inventory.focus_tea = 1;
  s.combat.enemyEvasionReady = 1;
  resolveCombatAction(s, rng, "use:focus_tea");
  const before = s.combat.enemyHp;
  resolveCombatAction(s, rng, "attack");
  assert(s.combat.enemyHp < before, "凝神茶后应必中 (敌人HP应下降)");
}

function main() {
  testEvasionDodgesPlayerAttack();
  testFocusMakesSureHit();
  testFocusTeaMakesSureHit();
  console.log("PASS: evasion_focus");
}

try {
  main();
} catch (e) {
  console.error("FAIL:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
