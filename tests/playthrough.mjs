import { createInitialState } from "../modules/state.js";
import { createGame } from "../modules/game.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function snapshot(state) {
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
    hp: `${state.player.hp}/${state.player.maxHp}`,
    atk: state.player.atk,
    def: state.player.def,
    gold: state.player.gold,
    inv,
    flags,
    gameOver: state.gameOver,
    inCombat: !!state.combat,
    enemy: state.combat ? state.combat.enemyId : null
  };
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
  // Prefer a deterministic choice: first enabled.
  const c = (s.prompt.choices || []).find((x) => !x.disabled);
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
  if (s.player.hp <= 10 && (s.inventory.onigiri || 0) > 0) {
    game.handleChoice("use:onigiri");
    return;
  }
  if (s.player.hp <= 8 && (s.inventory.herbs || 0) > 0) {
    game.handleChoice("use:herbs");
  }
}

function resolveCombat(game) {
  const s = game.getState();
  if (!s.combat) return;
  // 简单策略：低血先吃饭团，否则一直攻击。
  for (let i = 0; i < 200; i++) {
    const st = game.getState();
    if (!st.combat) return;
    maybeHeal(game);
    if (game.getState().combat) {
      const cs = game.getState();
      if (cs.combat && cs.combat.enemyId === "shrine_guardian" && (cs.inventory.bound_charm || 0) > 0) {
        game.handleChoice("use:bound_charm");
      } else if (cs.combat && cs.combat.enemyId === "shrine_guardian" && cs.flags.has_iron_blade && !cs.combat.usedPurify) {
        game.handleChoice("skill:purify");
      } else {
        game.handleChoice("attack");
      }
    }
    if (game.getState().gameOver) {
      throw new Error("战斗失败：游戏结束");
    }
  }
  throw new Error("战斗未在上限步数内结束");
}

function main() {
  const seed = 123;
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
    120,
    "收集杉木"
  );
  game.handleChoice("craft");
  game.handleChoice("craft:make_firepit");
  assert(game.getState().flags.has_firepit, "制作石火坑后应有 has_firepit");

  // 1.5) 备足一些恢复品（饭团）
  doUntil(
    game,
    () => countItem(game.getState(), "rice") >= 3,
    () => {
      game.handleChoice("explore");
      resolvePromptIfAny(game);
      resolveCombat(game);
    },
    120,
    "收集米"
  );
  game.handleChoice("craft");
  game.handleChoice("craft:cook_rice");
  game.handleChoice("craft");
  game.handleChoice("craft:cook_rice");
  game.handleChoice("craft");
  game.handleChoice("craft:cook_rice");
  assert(countItem(game.getState(), "onigiri") >= 2, "应至少有 2 个饭团");

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

  doUntil(
    game,
    () => countItem(game.getState(), "iron_ore") >= 2,
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
  }

  game.handleChoice("craft");
  game.handleChoice("craft:forge_iron_blade");
  assert(game.getState().flags.has_iron_blade, "锻铁刃后应有 has_iron_blade");
  assert(game.getState().player.atk >= 5, "锻铁刃应提升攻击");
  assert(countItem(game.getState(), "iron_blade") >= 1, "应获得 道具：铁刃");

  // 8) 回到古神社刷出守护者并击败
  travelTo(game, "old_shrine");

  assert(game.getState().location === "old_shrine", "此时应在 old_shrine");
  assert(game.getState().flags.charm_bound, "此时应有 charm_bound");
  assert(game.getState().flags.has_iron_blade, "此时应有 has_iron_blade");

  // Boss 前保证满血
  if (game.getState().player.hp < game.getState().player.maxHp) {
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

  // 9) 前往山口并触发结局
  travelTo(game, "mountain_pass");
  assert(game.getState().location === "mountain_pass", "应到达 mountain_pass");

  // 触发结局事件（会弹出 prompt），选择封印结局。
  game.handleChoice("explore");
  assert(!!game.getState().prompt, "山口应弹出结局选择");
  game.handleChoice("prompt:seal");
  assert(game.getState().gameOver, "选择结局后应 gameOver");

  const final = snapshot(game.getState());
  console.log("PASS: 全流程通关测试");
  console.log(JSON.stringify(final, null, 2));
}

try {
  main();
} catch (e) {
  console.error("FAIL:", e && e.stack ? e.stack : e);
  process.exitCode = 1;
}
