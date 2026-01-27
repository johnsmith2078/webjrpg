import { createInitialState } from "../modules/state.js";
import { startCombat, resolveCombatAction } from "../modules/combat.js";
import { applyOps } from "../modules/events.js";

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

function fireballDamage(state, rng) {
  startCombat(state, "bandit");
  state.combat.enemyHp = 999;
  const before = state.combat.enemyHp;
  resolveCombatAction(state, rng, "skill:fireball");
  return before - state.combat.enemyHp;
}

function testFireballUpgradeTier1IncreasesDamage() {
  const rng = makeRng();

  const base = createInitialState(1);
  base.flags.skills_learned_fireball = true;
  base.player.maxMp = 20;
  base.player.mp = 20;
  const dmg0 = fireballDamage(base, rng);

  const up = createInitialState(1);
  up.flags.skills_learned_fireball = true;
  up.player.maxMp = 20;
  up.player.mp = 20;
  up.player.gold = 999;
  up.inventory.mana_crystal = 2;
  up.inventory.ink_resin = 1;
  applyOps(up, {}, [{ op: "npcService", npc: "works_machinist", service: "upgrade_skill_fireball_t1" }], []);
  assert(Number(up.skillUpgrades.fireball || 0) >= 1, "应获得 fireball T1 升级");
  const dmg1 = fireballDamage(up, rng);

  assert(dmg1 > dmg0, `火球术 T1 应提高伤害 (t0=${dmg0}, t1=${dmg1})`);
}

function main() {
  testFireballUpgradeTier1IncreasesDamage();
  console.log("PASS: skill_upgrades");
}

try {
  main();
} catch (e) {
  console.error("FAIL:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
