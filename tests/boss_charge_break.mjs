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
  const state = createInitialState(123);
  state.player.maxHp = 999;
  state.player.hp = 999;
  state.player.atk = 10;
  state.player.def = 0;
  startCombat(state, enemyId);
  state.combat.enemyHp = 999;
  return state;
}

function hpLossAfter(state, rng, action) {
  const before = Number(state.player.hp || 0);
  resolveCombatAction(state, rng, action);
  return before - Number(state.player.hp || 0);
}

function enemyHpLossAfter(state, rng, action) {
  const before = Number(state.combat.enemyHp || 0);
  resolveCombatAction(state, rng, action);
  return before - Number(state.combat.enemyHp || 0);
}

function testDefendReducesChargedHit() {
  const rng = makeRng();

  const a = setup("works_guardian");
  a.combat.enemyCharge = 1;
  const lossAttack = hpLossAfter(a, rng, "attack");

  const b = setup("works_guardian");
  b.combat.enemyCharge = 1;
  const lossDefend = hpLossAfter(b, rng, "defend");

  assert(lossDefend > 0, "防御测试应受到伤害");
  assert(lossAttack > 0, "攻击测试应受到伤害");
  assert(lossDefend < lossAttack, `防御应减少蓄力伤害 (defend=${lossDefend}, attack=${lossAttack})`);
}

function testBoundCharmInterruptsChargeAndOpensBreak() {
  const rng = makeRng();
  const s = setup("works_guardian");
  s.inventory.bound_charm = 1;
  s.combat.enemyCharge = 1;
  resolveCombatAction(s, rng, "use:bound_charm");
  assert(Number(s.combat.enemyCharge || 0) === 0, "缚符应打断蓄力 (enemyCharge=0)");
  assert(Number(s.combat.enemyBroken || 0) > 0, "缚符打断后应进入破绽窗口 (enemyBroken>0)");
}

function testBreakIncreasesDamage() {
  const rng = makeRng();
  const a = setup("works_guardian");
  const dmgNormal = enemyHpLossAfter(a, rng, "attack");

  const b = setup("works_guardian");
  b.combat.enemyBroken = 2;
  const dmgBreak = enemyHpLossAfter(b, rng, "attack");

  assert(dmgNormal > 0, "普通攻击应造成伤害");
  assert(dmgBreak > dmgNormal, `破绽窗口应提高伤害 (normal=${dmgNormal}, break=${dmgBreak})`);
}

function main() {
  testDefendReducesChargedHit();
  testBoundCharmInterruptsChargeAndOpensBreak();
  testBreakIncreasesDamage();
  console.log("PASS: boss_charge_break");
}

try {
  main();
} catch (e) {
  console.error("FAIL:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
