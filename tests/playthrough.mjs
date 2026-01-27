import { createInitialState } from "../modules/state.js";
import { createGame } from "../modules/game.js";
import { DATA } from "../modules/data.js";
import { listAvailableRecipes, canCraft } from "../modules/crafting.js";
import { derivePlayerStats } from "../modules/stats.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

let DESIRED_CLASS_ID = null;

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

function canSeeRecipe(state, recipeId) {
  return listAvailableRecipes(state).some((r) => r.id === recipeId);
}

function tryCraft(game, recipeId) {
  const s = game.getState();
  const recipe = DATA.recipes[recipeId];
  if (!recipe) return false;
  if (!canSeeRecipe(s, recipeId)) return false;
  if (!canCraft(s, recipe)) return false;
  game.handleChoice("craft");
  game.handleChoice(`craft:${recipeId}`);
  return true;
}

function craftUntil(game, recipeId, itemId, targetQty) {
  const recipe = DATA.recipes[recipeId];
  if (!recipe) return;
  for (let i = 0; i < 50; i++) {
    const s = game.getState();
    if (countItem(s, itemId) >= targetQty) return;
    if (!canSeeRecipe(s, recipeId)) return;
    if (!canCraft(s, recipe)) return;
    game.handleChoice("craft");
    game.handleChoice(`craft:${recipeId}`);
  }
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
  if (s.prompt.title === "起源" && DESIRED_CLASS_ID) {
    c = choices.find((x) => x.id === DESIRED_CLASS_ID && !x.disabled);
  }
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
  const derived = derivePlayerStats(s);
  const maxHp = Number(derived.maxHp || s.player.maxHp || 20);
  const healSkillThreshold = Math.max(10, Math.floor(maxHp * 0.25));
  const consumeThreshold = Math.max(12, Math.floor(maxHp * 0.35));
  if (
    s.combat &&
    // heal_light uses SP (limited per fight); save it for when it matters.
    s.player.hp <= healSkillThreshold &&
    s.flags.skills_learned_heal_light &&
    (s.player.sp || 0) >= 1 &&
    (!s.combat.skillCooldowns || !s.combat.skillCooldowns.heal_light)
  ) {
    game.handleChoice("skill:heal_light");
    return;
  }
  if (s.player.hp <= consumeThreshold && (s.inventory.health_potion || 0) > 0) {
    game.handleChoice("use:health_potion");
    return;
  }
  if (s.player.hp <= consumeThreshold && (s.inventory.onigiri || 0) > 0) {
    game.handleChoice("use:onigiri");
    return;
  }
  if (s.player.hp <= healSkillThreshold && (s.inventory.herbs || 0) > 0) {
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
    "mine_warlord",
    "works_guardian",
    "heart_pump_guardian",
    "possessed_tree"
  ]);
  const evasionEnemies = new Set(["shadow_beast", "wolf", "clockwork_spider", "fog_skulker"]);
  for (let i = 0; i < 200; i++) {
    const st = game.getState();
    if (!st.combat) return;
    lastEnemy = st.combat.enemyId;
    maybeHeal(game);
    if (game.getState().combat) {
      const cs = game.getState();
      const enemyId = cs.combat ? cs.combat.enemyId : null;
      const isTough = !!enemyId && toughEnemies.has(enemyId);
      const isBoss =
        enemyId === "crystal_overseer" ||
        enemyId === "clockwork_titan" ||
        enemyId === "mine_warlord" ||
        enemyId === "heart_pump_guardian";
      // Boss fights are tuned to assume some resource usage; keep the test stable by spending defensively here.
      const useConsumables = (isBoss || isTough) && !cs.flags.class_mage;

      // If cursed, prioritize purify to cleanse (stabilizes curse-using enemies).
      if (cs.combat && cs.flags.cursed && canPurify(cs) && cs.flags.skills_learned_purify && !cs.combat.usedPurify) {
        game.handleChoice("skill:purify");
      } else

      // Boss charge/break mechanic: if boss is charging, prefer to interrupt with bound_charm; otherwise defend.
      if (cs.combat && cs.combat.enemyCharge > 0 && (cs.inventory.bound_charm || 0) > 0 && !cs.combat.enemyStun) {
        game.handleChoice("use:bound_charm");
      } else if (cs.combat && cs.combat.enemyCharge > 0) {
        game.handleChoice("defend");
      } else

      // Summon stacks: clear them with sweep/explosive/stun to reduce incoming pressure.
      if (cs.combat && (cs.combat.enemySummonStacks || 0) >= 2 && cs.flags.skills_learned_sweep && (cs.player?.sp || 0) >= 2 && (!cs.combat.skillCooldowns || !cs.combat.skillCooldowns.sweep)) {
        game.handleChoice("skill:sweep");
      } else if (cs.combat && (cs.combat.enemySummonStacks || 0) >= 2 && (cs.inventory.explosive_trap || 0) > 0) {
        game.handleChoice("use:explosive_trap");
      } else if (cs.combat && (cs.combat.enemySummonStacks || 0) >= 2 && (cs.inventory.bound_charm || 0) > 0 && !cs.combat.enemyStun) {
        game.handleChoice("use:bound_charm");
      } else

      // Evasion enemies: use focus to ensure hit if available.
      if (
        cs.combat &&
        enemyId &&
        evasionEnemies.has(enemyId) &&
        (!cs.combat.statusEffects || !cs.combat.statusEffects.crit_boost) &&
        cs.flags.skills_learned_focus &&
        (cs.player?.sp || 0) >= 1 &&
        (!cs.combat.skillCooldowns || !cs.combat.skillCooldowns.focus)
      ) {
        game.handleChoice("skill:focus");
      } else if (
        cs.combat &&
        enemyId &&
        evasionEnemies.has(enemyId) &&
        (!cs.combat.statusEffects || !cs.combat.statusEffects.crit_boost) &&
        (cs.inventory.focus_tea || 0) > 0
      ) {
        game.handleChoice("use:focus_tea");
      } else

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
      } else if (
        cs.combat &&
        (isBoss || isTough || (enemyId && evasionEnemies.has(enemyId))) &&
        cs.flags.skills_learned_deploy_turret &&
        (cs.player.en || 0) >= 4 &&
        (!cs.combat.statusEffects || !cs.combat.statusEffects.turret) &&
        (!cs.combat.skillCooldowns || !cs.combat.skillCooldowns.deploy_turret)
      ) {
        game.handleChoice("skill:deploy_turret");
      } else if (
        cs.combat &&
        (isBoss || isTough || (enemyId && evasionEnemies.has(enemyId))) &&
        cs.flags.skills_learned_shock_swarm &&
        (cs.player.en || 0) >= 3 &&
        (!cs.combat.statusEffects || !cs.combat.statusEffects.swarm) &&
        (!cs.combat.skillCooldowns || !cs.combat.skillCooldowns.shock_swarm)
      ) {
        game.handleChoice("skill:shock_swarm");
      } else if (cs.combat && enemyId === "shrine_guardian" && canPurify(cs) && !cs.combat.usedPurify) {
        game.handleChoice("skill:purify");
      } else if (cs.combat && isTough && canPurify(cs) && !cs.combat.usedPurify) {
        game.handleChoice("skill:purify");
      } else if (
        cs.combat &&
        useConsumables &&
        cs.flags.skills_learned_mana_shield &&
        (cs.player.hp || 0) <= 14 &&
        (cs.player.mp || 0) >= 4 &&
        (!cs.combat.statusEffects || !cs.combat.statusEffects.mana_shield) &&
        (!cs.combat.skillCooldowns || !cs.combat.skillCooldowns.mana_shield)
      ) {
        game.handleChoice("skill:mana_shield");
      } else if (
        cs.combat &&
        cs.flags.skills_learned_fireball &&
        (cs.player.mp || 0) >= 4 &&
        (!cs.combat.skillCooldowns || !cs.combat.skillCooldowns.fireball)
      ) {
        game.handleChoice("skill:fireball");
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
  const snap = snapshot(game.getState());
  throw new Error(`战斗未在上限步数内结束 (enemy=${lastEnemy})\n${JSON.stringify(snap, null, 2)}`);
}

export function runPlaythrough(opts = {}) {
  const seed = Number.isFinite(opts.seed) ? opts.seed : Number(opts.seed || 123);
  const silent = !!opts.silent;
  const classId = typeof opts.classId === "string" ? String(opts.classId) : null;
  const ending = typeof opts.ending === "string" ? String(opts.ending) : "seal";
  const ch3Ending = typeof opts.ch3Ending === "string" ? String(opts.ch3Ending) : "reset";

  DESIRED_CLASS_ID = classId;

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

  // Keep route later needs thieves_tools to open the lockyard chest.
  if (ending === "keep") {
    doUntil(
      game,
      () => countItem(game.getState(), "thieves_tools") >= 1,
      () => {
        game.handleChoice("explore");
        resolvePromptIfAny(game);
        resolveCombat(game);
      },
      120,
      "获得盗贼工具"
    );
  }

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

  // Mage prep: craft runic staff BEFORE shrine is cleansed (avoids triggering crystal_overseer).
  if (game.getState().flags.class_mage && !game.getState().flags.has_runic_staff) {
    // runic_staff: cedar_wood x4 + mana_crystal x2
    // warding_robe: cedar_wood x2 + mana_crystal x1 + spirit_stone x1
    // total for the full early mage package: cedar_wood x6 + mana_crystal x3 + spirit_stone x1
    if (countItem(game.getState(), "cedar_wood") < 6) {
      doUntil(
        game,
        () => countItem(game.getState(), "cedar_wood") >= 6,
        () => {
          game.handleChoice("explore");
          resolvePromptIfAny(game);
          resolveCombat(game);
        },
        200,
        "补杉木(法师套装)"
      );
    }

    travelTo(game, "forest_path");
    travelTo(game, "crystal_cave");
    doUntil(
      game,
      () => countItem(game.getState(), "mana_crystal") >= 3 && countItem(game.getState(), "spirit_stone") >= 1,
      () => {
        game.handleChoice("explore");
        resolvePromptIfAny(game);
        resolveCombat(game);
      },
      200,
      "收集材料(法师套装)"
    );
    game.handleChoice("craft");
    game.handleChoice("craft:craft_runic_staff");
    assert(game.getState().flags.has_runic_staff, "制作符文法杖后应有 has_runic_staff");

    if (!game.getState().flags.has_warding_robe) {
      game.handleChoice("craft");
      game.handleChoice("craft:stitch_warding_robe");
      assert(game.getState().flags.has_warding_robe, "缝制护法长袍后应有 has_warding_robe");
    }

    // Continue route from forest_path.
    travelTo(game, "forest_path");
  }

  // Engineer prep: craft scrap pistol BEFORE shrine is cleansed (avoids triggering clockwork_titan).
  if (game.getState().flags.class_engineer && !game.getState().flags.has_scrap_pistol) {
    if (countItem(game.getState(), "cedar_wood") < 2) {
      doUntil(
        game,
        () => countItem(game.getState(), "cedar_wood") >= 2,
        () => {
          game.handleChoice("explore");
          resolvePromptIfAny(game);
          resolveCombat(game);
        },
        200,
        "补杉木(工程师手枪)"
      );
    }

    travelTo(game, "forest_path");
    travelTo(game, "ancient_lab");
    doUntil(
      game,
      () => countItem(game.getState(), "scrap_metal") >= 5,
      () => {
        game.handleChoice("explore");
        resolvePromptIfAny(game);
        resolveCombat(game);
      },
      200,
      "收集废金属(工程师手枪)"
    );
    game.handleChoice("craft");
    game.handleChoice("craft:assemble_scrap_pistol");
    assert(game.getState().flags.has_scrap_pistol, "组装废铁手枪后应有 has_scrap_pistol");

    // Continue route from forest_path.
    travelTo(game, "forest_path");
  }

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

  if (game.getState().flags.class_warrior) {
    game.handleChoice("craft");
    game.handleChoice("craft:forge_heavy_blade");
    assert(game.getState().flags.has_heavy_blade, "锻造重剑后应有 has_heavy_blade");
  }
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
  const herbTarget = game.getState().flags.class_mage || game.getState().flags.class_engineer ? 25 : 3;
  doUntil(
    game,
    () => countItem(game.getState(), "herbs") >= herbTarget,
    () => {
      game.handleChoice("travel");
      game.handleChoice("travel:forest_path");
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
      game.handleChoice("travel");
      game.handleChoice("travel:village");
    },
    200,
    "补苦草"
  );

  // Mage/Engineer stability: prep boss consumables (warding_talisman / focus_tea / extra bound_charm).
  if (game.getState().flags.class_mage || game.getState().flags.class_engineer) {
    travelTo(game, "forest_path");
    travelTo(game, "old_shrine");
    doUntil(
      game,
      () => countItem(game.getState(), "paper_charm") >= 12,
      () => {
        game.handleChoice("explore");
        resolvePromptIfAny(game);
        resolveCombat(game);
      },
      200,
      "补纸符(法师补给)"
    );

    travelTo(game, "forest_path");
    travelTo(game, "village");

    craftUntil(game, "bind_charm", "bound_charm", 4);
    craftUntil(game, "enchant_warding_talisman", "warding_talisman", 4);
    craftUntil(game, "craft_focus_tea", "focus_tea", 2);
  }

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

  // Mage power curve: after clearing crystal_overseer, grind enough mana_crystal for attunement.
  if (game.getState().flags.class_mage) {
    for (const rid of ["attune_mana_1", "attune_mana_2"]) {
      const recipe = DATA.recipes[rid];
      if (!recipe) continue;
      if (!canSeeRecipe(game.getState(), rid)) continue;
      if (!canCraft(game.getState(), recipe)) {
        doUntil(
          game,
          () => canCraft(game.getState(), recipe),
          () => {
            game.handleChoice("explore");
            resolvePromptIfAny(game);
            resolveCombat(game);
          },
          200,
          `补材料(${rid})`
        );
      }
      tryCraft(game, rid);
    }
  }

  // 9.5) 备一件基础护甲：降低后续 Boss 战的波动
  if (game.getState().flags.class_engineer) {
    // plate_armor: iron_ingot x2 + iron_ore x2
    if (!game.getState().flags.has_plate_armor) {
      travelTo(game, "forest_path");
      travelTo(game, "old_shrine");
      travelTo(game, "abandoned_mine");
      doUntil(
        game,
        () => countItem(game.getState(), "iron_ore") >= 8,
        () => {
          game.handleChoice("explore");
          resolvePromptIfAny(game);
          resolveCombat(game);
        },
        300,
        "补铁矿石(工程师板甲)"
      );
      travelTo(game, "old_shrine");
      travelTo(game, "forest_path");
      travelTo(game, "village");

      craftUntil(game, "refine_iron", "iron_ingot", 2);
      game.handleChoice("craft");
      game.handleChoice("craft:forge_plate_armor");
    }
    assert(game.getState().flags.has_plate_armor, "工程师应能准备板甲用于后续战斗");
  } else {
    if (!game.getState().flags.has_warding_robe) {
      game.handleChoice("craft");
      game.handleChoice("craft:stitch_warding_robe");
    }
    assert(game.getState().flags.has_warding_robe, "应能制作护法长袍用于后续战斗");
  }

  // Mage ramp: convert spare mana_crystal into maxMp (boss-focused).
  if (game.getState().flags.class_mage) {
    for (const rid of ["attune_mana_1", "attune_mana_2", "attune_mana_3"]) {
      tryCraft(game, rid);
    }
  }

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

  if (ending === "keep") {
    game.handleChoice("prompt:keep");
    assert(!game.getState().gameOver, "选择 keep 后不应 gameOver");
    assert(game.getState().flags.ending_keep, "选择 keep 后应设置 ending_keep");
    assert(game.getState().flags.ch2_route_opened, "选择 keep 后应设置 ch2_route_opened");

    // --- Chapter 2 ---
    travelTo(game, "fogback_waystation");
    assert(game.getState().location === "fogback_waystation", "应到达 fogback_waystation");
    game.handleChoice("explore");
    resolvePromptIfAny(game);
    resolveCombat(game);
    assert(game.getState().flags.ch2_rust_opened, "驿站事件后应设置 ch2_rust_opened");
    const stAfterWaystation = game.getState();
    const gotWaystationKit =
      countItem(stAfterWaystation, "fogback_waystation_mail") > 0 ||
      countItem(stAfterWaystation, "fogback_waystation_robe") > 0 ||
      countItem(stAfterWaystation, "fogback_waystation_harness") > 0;
    assert(gotWaystationKit, "职业分支：驿站应获得一件职业装备");
    if (stAfterWaystation.flags.class_warrior) {
      assert(countItem(stAfterWaystation, "fogback_waystation_mail") >= 1, "战士分支应获得驿站链甲");
      assert(stAfterWaystation.flags.skills_learned_sweep, "战士分支应学会横扫");
    }
    if (stAfterWaystation.flags.class_mage) {
      assert(countItem(stAfterWaystation, "fogback_waystation_robe") >= 1, "法师分支应获得驿站长袍");
    }
    if (stAfterWaystation.flags.class_engineer) {
      assert(countItem(stAfterWaystation, "fogback_waystation_harness") >= 1, "工程师分支应获得驿站束具");
    }

    travelTo(game, "rust_channel");
    travelTo(game, "lockyard");
    assert(game.getState().location === "lockyard", "应到达 lockyard");
    game.handleChoice("explore");
    resolvePromptIfAny(game);
    resolveCombat(game);
    assert(game.getState().flags.opened_lockyard_chest, "打开暗箱后应设置 opened_lockyard_chest");
    assert(countItem(game.getState(), "repeating_crossbow") >= 1, "暗箱应获得 repeating_crossbow");

    travelTo(game, "rust_channel");
    travelTo(game, "lower_works");
    assert(game.getState().location === "lower_works", "应到达 lower_works");
    game.handleChoice("explore");
    resolvePromptIfAny(game);
    resolveCombat(game);
    assert(game.getState().flags.defeated_works_guardian, "应击败 works_guardian");
    assert(countItem(game.getState(), "pump_key") >= 1, "应获得 pump_key");

    // --- Chapter 3 ---
    travelTo(game, "mist_well");
    assert(game.getState().location === "mist_well", "应到达 mist_well");
    game.handleChoice("explore");
    resolvePromptIfAny(game);
    resolveCombat(game);

    travelTo(game, "paper_atrium");
    assert(game.getState().location === "paper_atrium", "应到达 paper_atrium");
    const stoneBefore = countItem(game.getState(), "spirit_stone");
    game.handleChoice("explore");
    resolvePromptIfAny(game);
    resolveCombat(game);
    assert(game.getState().flags.ch3_imprint_done, "刻印后应设置 ch3_imprint_done");
    assert(
      game.getState().flags.skills_learned_stealth || game.getState().flags.skills_learned_counter,
      "刻印后应学会 stealth 或 counter"
    );
    assert(countItem(game.getState(), "spirit_stone") < stoneBefore, "刻印应消耗灵石");

    travelTo(game, "blacklight_heart");
    assert(game.getState().location === "blacklight_heart", "应到达 blacklight_heart");
    game.handleChoice("explore");
    resolvePromptIfAny(game);
    resolveCombat(game);
    assert(game.getState().flags.defeated_heart_pump_guardian, "应击败 heart_pump_guardian");

    game.handleChoice("explore");
    assert(!!game.getState().prompt, "黑光心室应弹出第三章结局选择");
    const choice = ch3Ending === "bind" ? "bind" : ch3Ending === "smash" ? "smash" : "reset";
    game.handleChoice(`prompt:${choice}`);
    assert(game.getState().gameOver, "第三章结局后应 gameOver");
    if (choice === "reset") assert(game.getState().flags.ending_ch3_reset, "应设置 ending_ch3_reset");
    if (choice === "bind") assert(game.getState().flags.ending_ch3_bind, "应设置 ending_ch3_bind");
    if (choice === "smash") assert(game.getState().flags.ending_ch3_smash, "应设置 ending_ch3_smash");
  } else {
    game.handleChoice("prompt:seal");
    assert(game.getState().gameOver, "选择结局后应 gameOver");
  }

  const final = snapshot(game.getState());
  if (!silent) {
    console.log("PASS: 全流程通关测试");
    console.log(JSON.stringify(final, null, 2));
  }
  DESIRED_CLASS_ID = null;
  return final;
}

function main() {
  const argv = process.argv.slice(2);
  let seed = 123;
  let classId = null;
  let silent = false;
  let ending = "seal";
  let ch3Ending = "reset";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--silent") {
      silent = true;
    } else if (a === "--class") {
      classId = argv[i + 1] ? String(argv[i + 1]) : null;
      i++;
    } else if (a === "--ending") {
      ending = argv[i + 1] ? String(argv[i + 1]) : "seal";
      i++;
    } else if (a === "--ch3-ending") {
      ch3Ending = argv[i + 1] ? String(argv[i + 1]) : "reset";
      i++;
    } else if (!a.startsWith("-")) {
      const n = Number(a);
      if (Number.isFinite(n)) seed = n;
    }
  }
  return runPlaythrough({ seed, silent, classId, ending, ch3Ending });
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
