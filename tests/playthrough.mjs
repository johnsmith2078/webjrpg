import { createInitialState } from "../modules/state.js";
import { createGame } from "../modules/game.js";
import { DATA } from "../modules/data.js";
import { derivePlayerStats } from "../modules/stats.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function snapshot(state) {
  const derived = derivePlayerStats(state);
  const inv = Object.entries(state.inventory)
    .filter(([, q]) => q > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));
  const flags = Object.entries(state.flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .sort();
  return {
    timeMin: state.timeMin,
    location: state.location,
    hp: `${state.player.hp}/${derived.maxHp}`,
    atk: derived.atk,
    def: derived.def,
    gold: state.player.gold,
    equipment: state.equipment || null,
    inv,
    flags,
    gameOver: state.gameOver,
    inCombat: !!state.combat,
    enemy: state.combat ? state.combat.enemyId : null
  };
}

function canPurify(state) {
  const weaponId = state.equipment && state.equipment.weapon ? state.equipment.weapon : null;
  const weapon = weaponId ? DATA.items[weaponId] : null;
  const combat = weapon && weapon.combat && typeof weapon.combat === "object" ? weapon.combat : null;
  return !!(combat && Array.isArray(combat.allowsSkills) && combat.allowsSkills.includes("purify"));
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

function resolvePromptIfAny(game) {
  const s = game.getState();
  if (!s.prompt) return;
  const choices = s.prompt.choices || [];

  // Prefer deterministic options for certain prompts.
  // Keep choices that are beneficial for progression (loot/power).
  let c = null;
  if (s.prompt.title === "岔路") {
    c = choices.find((x) => x.id === "long" && !x.disabled);
  }
  if (s.prompt.title === "流浪者") {
    c = choices.find((x) => x.id === "buy_rare" && !x.disabled) || choices.find((x) => x.id === "ask_fate" && !x.disabled);
  }
  if (!c) c = choices.find((x) => !x.disabled);
  if (c) {
    game.handleChoice(`prompt:${c.id}`);
    return;
  }
  game.handleChoice("prompt:close");
}

function travelTo(game, id) {
  game.handleChoice("travel");
  game.handleChoice(`travel:${id}`);
  resolvePromptIfAny(game);
}

function maybeHeal(game) {
  const s = game.getState();
  if (
    s.combat &&
    // heal_light uses SP (limited per fight); save it for when it matters.
    s.player.hp <= 10 &&
    s.flags.skills_learned_heal_light &&
    (s.player.sp || 0) >= 1 &&
    (!s.combat.skillCooldowns || !s.combat.skillCooldowns.heal_light)
  ) {
    game.handleChoice("skill:heal_light");
    return;
  }
  if (s.player.hp <= 12 && (s.inventory.health_potion || 0) > 0) {
    game.handleChoice("use:health_potion");
    return;
  }
  if (s.player.hp <= 12 && (s.inventory.onigiri || 0) > 0) {
    game.handleChoice("use:onigiri");
    return;
  }
  if (s.player.hp <= 10 && (s.inventory.herbs || 0) > 0) {
    game.handleChoice("use:herbs");
  }
}

function resolveCombat(game) {
  const s = game.getState();
  if (!s.combat) return;
  // 简单策略：低血先吃饭团，否则一直攻击。
  let lastEnemy = null;
  const toughEnemies = new Set([
    "cursed_miner",
    "crystal_golem",
    "crystal_overseer",
    "clockwork_titan",
    "mine_warlord"
  ]);
  for (let i = 0; i < 200; i++) {
    const st = game.getState();
    if (!st.combat) return;
    lastEnemy = st.combat.enemyId;
    maybeHeal(game);
    if (game.getState().combat) {
      const cs = game.getState();
      const enemyId = cs.combat ? cs.combat.enemyId : null;
      const isTough = !!enemyId && toughEnemies.has(enemyId);
      const isBoss = enemyId === "crystal_overseer" || enemyId === "clockwork_titan" || enemyId === "mine_warlord";
      // Boss fights are tuned to assume some resource usage; keep the test stable by spending defensively here.
      const useConsumables = isBoss;

      if (cs.combat && enemyId === "shrine_guardian" && (cs.inventory.bound_charm || 0) > 0) {
        game.handleChoice("use:bound_charm");
      } else if (
        cs.combat &&
        useConsumables &&
        (cs.inventory.warding_talisman || 0) > 0 &&
        (!cs.combat.statusEffects || !cs.combat.statusEffects.ward)
      ) {
        game.handleChoice("use:warding_talisman");
      } else if (
        cs.combat &&
        useConsumables &&
        (cs.inventory.focus_tea || 0) > 0 &&
        (!cs.combat.statusEffects || !cs.combat.statusEffects.crit_boost)
      ) {
        game.handleChoice("use:focus_tea");
      } else if (
        cs.combat &&
        useConsumables &&
        (cs.inventory.bound_charm || 0) > 0 &&
        !cs.combat.enemyStun
      ) {
        game.handleChoice("use:bound_charm");
      } else if (cs.combat && enemyId === "shrine_guardian" && canPurify(cs) && !cs.combat.usedPurify) {
        game.handleChoice("skill:purify");
      } else if (cs.combat && isTough && canPurify(cs) && !cs.combat.usedPurify) {
        game.handleChoice("skill:purify");
      } else if (
        cs.combat &&
        cs.flags.skills_learned_power_strike &&
        !isBoss &&
        (cs.player.sp || 0) >= 2 &&
        (!cs.combat.skillCooldowns || !cs.combat.skillCooldowns.power_strike)
      ) {
        game.handleChoice("skill:power_strike");
      } else if (
        cs.combat &&
        enemyId === "mine_warlord" &&
        (cs.player.hp || 0) <= 10 &&
        (cs.inventory.onigiri || 0) === 0 &&
        (cs.inventory.herbs || 0) === 0
      ) {
        game.handleChoice("defend");
      } else {
        game.handleChoice("attack");
      }
    }
    if (game.getState().gameOver) {
      const snap = snapshot(game.getState());
      throw new Error(`战斗失败：游戏结束 (enemy=${lastEnemy})\n${JSON.stringify(snap, null, 2)}`);
    }
  }
  throw new Error("战斗未在上限步数内结束");
}

export function runPlaythrough(opts = {}) {
  const seed = Number.isFinite(opts.seed) ? opts.seed : Number(opts.seed || 123);
  const silent = !!opts.silent;

  const state = createInitialState(seed);
  const game = createGame({ state });

  // 0) 初始断言
  assert(game.getState().location === "village", "初始位置应为 village");

  // 1) 在村里刷：听到神社传闻 + 收集杉木做石火坑
  doUntil(
    game,
    () => game.getState().flags.heard_rumor_shrine,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
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
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    200,
    "收集杉木"
  );
  game.handleChoice("craft");
  game.handleChoice("craft:make_firepit");
  assert(game.getState().flags.has_firepit, "制作石火坑后应有 has_firepit");

  // 1.2) 触发村长对话并接受任务
  // resolvePromptIfAny 会默认选第一个可用选项 (ask_shrine)，这正是我们想要的
  doUntil(
    game,
    () => game.getState().flags.met_elder,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    120,
    "触发村长对话"
  );
  assert(game.getState().quests["elder_wisdom"], "应触发村长智慧任务");

  // 1.5) 备足一些恢复品（饭团）
  doUntil(
    game,
    () => countItem(game.getState(), "rice") >= 5,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    120,
    "收集米"
  );
  // 把米都做成饭团
  while (countItem(game.getState(), "rice") > 0) {
    game.handleChoice("craft");
    game.handleChoice("craft:cook_rice");
  }
  assert(countItem(game.getState(), "onigiri") >= 4, "应至少有 4 个饭团");

  // 2) 解锁并前往杉径
  doUntil(
    game,
    () => game.getState().timeMin >= 30,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    60,
    "推进到 30 分钟"
  );
  travelTo(game, "forest_path");
  assert(game.getState().location === "forest_path", "应到达 forest_path");

  // 2.1) 触发草药师对话并接受任务
  doUntil(
    game,
    () => game.getState().flags.met_herbalist,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    120,
    "触发草药师对话"
  );
  assert(game.getState().quests["herbalist_collection"], "应触发草药采集任务");

  // 3) 在杉径刷苦草
  doUntil(
    game,
    () => countItem(game.getState(), "herbs") >= 1,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    120,
    "收集苦草"
  );

  // 4) 前往古神社并刷纸符
  travelTo(game, "old_shrine");
  assert(game.getState().location === "old_shrine", "应到达 old_shrine");

  doUntil(
    game,
    () => countItem(game.getState(), "paper_charm") >= 1,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    120,
    "获得纸符"
  );

  // 5) 制作“缚符”（回归测试：这里不能崩）
  const beforeCharm = countItem(game.getState(), "paper_charm");
  const beforeHerbs = countItem(game.getState(), "herbs");
  game.handleChoice("craft");
  game.handleChoice("craft:bind_charm");
  assert(game.getState().flags.charm_bound, "制作缚符后应有 charm_bound");
  assert(countItem(game.getState(), "paper_charm") === beforeCharm - 1, "缚符应消耗 纸符 x1");
  assert(countItem(game.getState(), "herbs") === beforeHerbs - 1, "缚符应消耗 苦草 x1");
  assert(countItem(game.getState(), "bound_charm") >= 1, "应获得 道具：缚符");

  // 6) 解锁废矿 (>=90min) 并获取铁矿石
  doUntil(
    game,
    () => game.getState().timeMin >= 90,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    120,
    "推进到 90 分钟"
  );

  travelTo(game, "abandoned_mine");
  assert(game.getState().location === "abandoned_mine", "应到达 abandoned_mine");

  // 6.1) 触发铁匠对话（需要在村庄，所以先不触发，等回村）

  doUntil(
    game,
    () => countItem(game.getState(), "iron_ore") >= 3,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    200,
    "收集铁矿石"
  );

  // 7) 锻铁刃：需要杉木 2
  if (countItem(game.getState(), "cedar_wood") < 2) {
    game.handleChoice("travel");
    game.handleChoice("travel:old_shrine");
    game.handleChoice("travel");
    game.handleChoice("travel:forest_path");
    game.handleChoice("travel");
    game.handleChoice("travel:village");
    
    // 回村后尝试触发铁匠
    doUntil(
      game,
      () => game.getState().flags.met_blacksmith,
      () => {
        game.handleChoice("explore");
        resolvePromptIfAny(game);
        resolveCombat(game);
      },
      120,
      "触发铁匠对话"
    );
    assert(game.getState().quests["blacksmith_mastery"], "应触发锻造大师任务");

    doUntil(
      game,
      () => countItem(game.getState(), "cedar_wood") >= 2,
      () => {
        game.handleChoice("explore");
        resolvePromptIfAny(game);
        resolveCombat(game);
      },
      120,
      "补杉木"
    );
  } else {
    // 即使木头够了，也要回村找铁匠
    game.handleChoice("travel");
    game.handleChoice("travel:old_shrine");
    game.handleChoice("travel");
    game.handleChoice("travel:forest_path");
    game.handleChoice("travel");
    game.handleChoice("travel:village");
    
    doUntil(
      game,
      () => game.getState().flags.met_blacksmith,
      () => {
        game.handleChoice("explore");
        resolvePromptIfAny(game);
        resolveCombat(game);
      },
      120,
      "触发铁匠对话"
    );
    assert(game.getState().quests["blacksmith_mastery"], "应触发锻造大师任务");
  }

  game.handleChoice("craft");
  game.handleChoice("craft:forge_iron_blade");
  assert(game.getState().flags.has_iron_blade, "锻铁刃后应有 has_iron_blade");
  assert(derivePlayerStats(game.getState()).atk >= 5, "锻铁刃应提升攻击");
  assert(countItem(game.getState(), "iron_blade") >= 1, "应获得 道具：铁刃");

  // 8) 回到古神社刷出守护者并击败
  if (game.getState().location === "village") {
    travelTo(game, "forest_path");
  }
  travelTo(game, "old_shrine");

  assert(game.getState().location === "old_shrine", "此时应在 old_shrine");
  assert(game.getState().flags.charm_bound, "此时应有 charm_bound");
  assert(game.getState().flags.has_iron_blade, "此时应有 has_iron_blade");

  // Boss 前保证满血
  while (game.getState().player.hp < game.getState().player.maxHp) {
    game.handleChoice("rest");
  }

  let sawGuardian = false;
  doUntil(
    game,
    () => game.getState().flags.shrine_cleansed,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      if (game.getState().combat && game.getState().combat.enemyId === "shrine_guardian") {
        sawGuardian = true;
      }
      resolveCombat(game);
    },
    60,
    "击败神社守"
  );
  assert(sawGuardian, "应至少触发一次 shrine_guardian 战斗");
  assert(countItem(game.getState(), "shrine_relic") >= 1, "击败神社守应掉落 神社遗物");

  // 8.5) Boss 连战前补给
  travelTo(game, "forest_path");
  travelTo(game, "old_shrine");
  travelTo(game, "abandoned_mine");
  doUntil(
    game,
    () => countItem(game.getState(), "iron_ore") >= 4,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    200,
    "补铁矿石"
  );
  travelTo(game, "old_shrine");
  travelTo(game, "forest_path");
  travelTo(game, "village");

  if (countItem(game.getState(), "cedar_wood") < 3) {
    doUntil(
      game,
      () => countItem(game.getState(), "cedar_wood") >= 3,
      () => {
        game.handleChoice("explore");
        resolvePromptIfAny(game);
        resolveCombat(game);
      },
      120,
      "补杉木"
    );
  }

  game.handleChoice("craft");
  game.handleChoice("craft:forge_heavy_blade");
  assert(game.getState().flags.has_heavy_blade, "锻造重剑后应有 has_heavy_blade");
  doUntil(
    game,
    () => countItem(game.getState(), "rice") >= 8,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    200,
    "补米"
  );
  while (countItem(game.getState(), "rice") > 0) {
    game.handleChoice("craft");
    game.handleChoice("craft:cook_rice");
  }
  doUntil(
    game,
    () => countItem(game.getState(), "herbs") >= 3,
    () => {
      game.handleChoice("travel");
      game.handleChoice("travel:forest_path");
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
      game.handleChoice("travel");
      game.handleChoice("travel:village");
    },
    120,
    "补苦草"
  );

  // 9) 击败分支首领：晶域监视者
  travelTo(game, "forest_path");
  travelTo(game, "crystal_cave");
  assert(game.getState().location === "crystal_cave", "应到达 crystal_cave");
  while (game.getState().player.hp < game.getState().player.maxHp) game.handleChoice("rest");
  doUntil(
    game,
    () => game.getState().flags.defeated_crystal_overseer,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    60,
    "击败晶域监视者"
  );

  // 9.5) 备一件基础护甲：降低后续 Boss 战的波动
  if (!game.getState().flags.has_warding_robe) {
    game.handleChoice("craft");
    game.handleChoice("craft:stitch_warding_robe");
  }
  assert(game.getState().flags.has_warding_robe, "应能制作护法长袍用于后续战斗");

  // 10) 击败分支首领：发条巨像
  travelTo(game, "forest_path");
  travelTo(game, "ancient_lab");
  assert(game.getState().location === "ancient_lab", "应到达 ancient_lab");
  while (game.getState().player.hp < game.getState().player.maxHp) game.handleChoice("rest");
  doUntil(
    game,
    () => game.getState().flags.defeated_clockwork_titan,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    60,
    "击败发条巨像"
  );

  // 11) 击败分支首领：矿脉督战者
  travelTo(game, "forest_path");
  travelTo(game, "old_shrine");
  travelTo(game, "abandoned_mine");
  assert(game.getState().location === "abandoned_mine", "应到达 abandoned_mine");
  while (game.getState().player.hp < game.getState().player.maxHp) game.handleChoice("rest");
  doUntil(
    game,
    () => game.getState().flags.defeated_mine_warlord,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    80,
    "击败矿脉督战者"
  );

  // 12) 前往山口并触发结局
  travelTo(game, "old_shrine");
  travelTo(game, "mountain_pass");
  assert(game.getState().location === "mountain_pass", "应到达 mountain_pass");

  // 触发结局事件（会弹出 prompt），选择封印结局。
  game.handleChoice("explore");
  assert(!!game.getState().prompt, "山口应弹出结局选择");
  game.handleChoice("prompt:seal");
  assert(game.getState().gameOver, "选择结局后应 gameOver");

  const final = snapshot(game.getState());
  if (!silent) {
    console.log("PASS: 全流程通关测试");
    console.log(JSON.stringify(final, null, 2));
  }
  return final;
}

function main() {
  const seedArg = process.argv.slice(2).find((x) => !x.startsWith("-"));
  const seed = seedArg ? Number(seedArg) : 123;
  const silent = process.argv.includes("--silent");
  return runPlaythrough({ seed, silent });
}

const isMain = (() => {
  const self = fileURLToPath(import.meta.url);
  const entry = process.argv[1] ? path.resolve(process.argv[1]) : "";
  return entry === self;
})();

if (isMain) {
  try {
    main();
  } catch (e) {
    console.error("FAIL:", e && e.stack ? e.stack : e);
    process.exitCode = 1;
  }
}
