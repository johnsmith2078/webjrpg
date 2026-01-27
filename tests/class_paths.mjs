import { createInitialState } from "../modules/state.js";
import { createGame } from "../modules/game.js";
import { derivePlayerStats } from "../modules/stats.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function countItem(state, id) {
  return Number(state.inventory[id] || 0);
}

function doUntil(game, pred, stepFn, limit, label) {
  for (let i = 0; i < limit; i++) {
    if (pred()) return i;
    stepFn();
  }
  throw new Error(`超出步数上限：${label}`);
}

function resolvePrompt(game, chooser) {
  const s = game.getState();
  if (!s.prompt) return;
  const choices = s.prompt.choices || [];
  const picked = chooser ? chooser(s.prompt) : null;
  const target = picked ? choices.find((c) => c.id === picked && !c.disabled) : choices.find((c) => !c.disabled);
  if (target) {
    game.handleChoice(`prompt:${target.id}`);
    return;
  }
  game.handleChoice("prompt:close");
}

function travelTo(game, id) {
  game.handleChoice("travel");
  game.handleChoice(`travel:${id}`);
  resolvePrompt(game);
}

function maybeHeal(game) {
  const s = game.getState();
  if (s.player.hp <= 10 && (s.inventory.onigiri || 0) > 0) {
    game.handleChoice("use:onigiri");
    return;
  }
  if (s.player.hp <= 8 && (s.inventory.herbs || 0) > 0) {
    game.handleChoice("use:herbs");
  }
}

function resolveCombat(game, strategy) {
  const s = game.getState();
  if (!s.combat) return;
  let lastEnemy = null;
  for (let i = 0; i < 200; i++) {
    const st = game.getState();
    if (!st.combat) return;
    lastEnemy = st.combat.enemyId;
    maybeHeal(game);
    if (!game.getState().combat) continue;

    const act = strategy ? strategy(game.getState()) : null;
    if (act) {
      game.handleChoice(act);
    } else {
      game.handleChoice("attack");
    }

    if (game.getState().gameOver) {
      throw new Error(`战斗失败：游戏结束 (enemy=${lastEnemy})`);
    }
  }
  throw new Error("战斗未在上限步数内结束");
}

function setupToOrigins(game, classId) {
  doUntil(
    game,
    () => game.getState().flags.heard_rumor_shrine,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game);
    },
    120,
    "获得传闻"
  );

  doUntil(
    game,
    () => countItem(game.getState(), "cedar_wood") >= 5,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game);
    },
    200,
    "收集杉木"
  );

  game.handleChoice("craft");
  game.handleChoice("craft:make_firepit");
  assert(game.getState().flags.has_firepit, "制作石火坑后应有 has_firepit");

  doUntil(
    game,
    () => !!game.getState().flags[`class_${classId}`],
    () => {
      game.handleChoice("explore");
      resolvePrompt(game, (p) => (p.title === "起源" ? classId : null));
      resolveCombat(game);
    },
    60,
    "选择职业"
  );
}

function runMagePath() {
  const seed = 222;
  const state = createInitialState(seed);
  const game = createGame({ state });

  setupToOrigins(game, "mage");
  assert(game.getState().flags.class_mage, "应选择法师职业");
  assert(game.getState().flags.skills_learned_fireball, "法师应解锁火球术");

  doUntil(
    game,
    () => game.getState().timeMin >= 30,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game);
    },
    60,
    "推进到 30 分钟"
  );

  travelTo(game, "forest_path");
  travelTo(game, "crystal_cave");
  assert(game.getState().location === "crystal_cave", "法师应能到达水晶洞窟");

  doUntil(
    game,
    () => countItem(game.getState(), "mana_crystal") >= 2,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game, (s) => {
        if (!s.combat) return null;
        const cd = s.combat.skillCooldowns && s.combat.skillCooldowns.fireball ? s.combat.skillCooldowns.fireball : 0;
        if (s.flags.skills_learned_fireball && cd === 0 && (s.player.mp || 0) >= 4) return "skill:fireball";
        return "attack";
      });
    },
    200,
    "收集法力水晶"
  );

  assert(!game.getState().flags.shrine_cleansed, "分支测试不应提前净化神社");
  assert(!game.getState().flags.defeated_crystal_overseer, "未净化神社前不应触发晶域监视者战斗");

  travelTo(game, "forest_path");
  travelTo(game, "village");
  doUntil(
    game,
    () => countItem(game.getState(), "cedar_wood") >= 4,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game);
    },
    120,
    "补杉木"
  );
  game.handleChoice("craft");
  game.handleChoice("craft:craft_runic_staff");
  assert(game.getState().flags.has_runic_staff, "制作符文法杖后应有 has_runic_staff");
  assert(countItem(game.getState(), "runic_staff") >= 1, "应获得符文法杖");
  assert(derivePlayerStats(game.getState()).maxMp >= 15, "制作符文法杖应提升法力上限");
}

function runEngineerPath() {
  const seed = 333;
  const state = createInitialState(seed);
  const game = createGame({ state });

  setupToOrigins(game, "engineer");
  assert(game.getState().flags.class_engineer, "应选择工程师职业");
  assert(game.getState().flags.skills_learned_deploy_turret, "工程师应解锁部署炮塔");

  doUntil(
    game,
    () => game.getState().timeMin >= 30,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game);
    },
    60,
    "推进到 30 分钟"
  );

  travelTo(game, "forest_path");
  travelTo(game, "ancient_lab");
  assert(game.getState().location === "ancient_lab", "工程师应能到达远古实验室");

  doUntil(
    game,
    () => countItem(game.getState(), "scrap_metal") >= 5,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game, (s) => {
        if (!s.combat) return null;
        const enemyId = s.combat.enemyId;
        const cd = s.combat.skillCooldowns && s.combat.skillCooldowns.deploy_turret ? s.combat.skillCooldowns.deploy_turret : 0;
        const cdSwarm = s.combat.skillCooldowns && s.combat.skillCooldowns.shock_swarm ? s.combat.skillCooldowns.shock_swarm : 0;

        // Evasion enemies: lean on DoT and defend to stabilize.
        if (enemyId === "clockwork_spider") {
          if (s.flags.skills_learned_deploy_turret && cd === 0 && (s.player.en || 0) >= 4) return "skill:deploy_turret";
          if (s.flags.skills_learned_shock_swarm && cdSwarm === 0 && (s.player.en || 0) >= 3) return "skill:shock_swarm";
          return "defend";
        }

        if (s.flags.skills_learned_deploy_turret && cd === 0 && (s.player.en || 0) >= 4) return "skill:deploy_turret";
        if (s.flags.skills_learned_shock_swarm && cdSwarm === 0 && (s.player.en || 0) >= 3) return "skill:shock_swarm";
        return "attack";
      });
    },
    200,
    "收集废金属"
  );

  assert(!game.getState().flags.shrine_cleansed, "分支测试不应提前净化神社");
  assert(!game.getState().flags.defeated_clockwork_titan, "未净化神社前不应触发发条巨像战斗");

  travelTo(game, "forest_path");
  travelTo(game, "village");
  doUntil(
    game,
    () => countItem(game.getState(), "cedar_wood") >= 2,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game);
    },
    120,
    "补杉木"
  );
  game.handleChoice("craft");
  game.handleChoice("craft:assemble_scrap_pistol");
  assert(game.getState().flags.has_scrap_pistol, "组装废铁手枪后应有 has_scrap_pistol");
  assert(countItem(game.getState(), "scrap_pistol") >= 1, "应获得废铁手枪");
}

function runWarriorPath() {
  const seed = 444;
  const state = createInitialState(seed);
  const game = createGame({ state });

  setupToOrigins(game, "warrior");
  assert(game.getState().flags.class_warrior, "应选择战士职业");
  assert(game.getState().flags.skills_learned_power_strike, "战士应解锁强力击");

  // 先做点饭团，降低随机战斗波动
  doUntil(
    game,
    () => countItem(game.getState(), "rice") >= 3,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game);
    },
    120,
    "收集米"
  );

  while (countItem(game.getState(), "rice") > 0) {
    game.handleChoice("craft");
    game.handleChoice("craft:cook_rice");
  }
  assert(countItem(game.getState(), "onigiri") >= 2, "应至少有 2 个饭团");

  // 推进到可进入废矿
  doUntil(
    game,
    () => game.getState().timeMin >= 90,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game);
    },
    160,
    "推进到 90 分钟"
  );

  travelTo(game, "forest_path");
  travelTo(game, "old_shrine");
  travelTo(game, "abandoned_mine");
  assert(game.getState().location === "abandoned_mine", "战士应能到达废矿");

  doUntil(
    game,
    () => countItem(game.getState(), "iron_ore") >= 6,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game);
    },
    200,
    "收集铁矿石"
  );

  travelTo(game, "old_shrine");
  travelTo(game, "forest_path");
  travelTo(game, "village");

  doUntil(
    game,
    () => countItem(game.getState(), "cedar_wood") >= 5,
    () => {
      game.handleChoice("explore");
      resolvePrompt(game);
      resolveCombat(game);
    },
    200,
    "补杉木"
  );

  game.handleChoice("craft");
  game.handleChoice("craft:forge_iron_blade");
  assert(game.getState().flags.has_iron_blade, "锻铁刃后应有 has_iron_blade");
  assert(countItem(game.getState(), "iron_blade") >= 1, "应获得铁刃");
  game.handleChoice("craft");
  game.handleChoice("craft:forge_heavy_blade");
  assert(game.getState().flags.has_heavy_blade, "锻造重剑后应有 has_heavy_blade");
  assert(countItem(game.getState(), "heavy_blade") >= 1, "应获得重剑");
}

function main() {
  runMagePath();
  runEngineerPath();
  runWarriorPath();
  console.log("PASS: 职业分支基础测试");
}

try {
  main();
} catch (e) {
  console.error("FAIL:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
