import { DATA } from "./data.js";
import { clamp, nowId } from "./utils.js";

function damage(atk, def, rng) {
  const roll = rng.nextInt(0, 2);
  return Math.max(0, atk + roll - def);
}

export function startCombat(state, enemyId) {
  const e = DATA.enemies[enemyId];
  state.combat = {
    enemyId,
    enemyHp: e.hp,
    defending: false
  };
  const name = e.name || enemyId;
  state.log.push({ id: nowId(), type: "rare", text: `「${name}」现身了。` });
}

export function isInCombat(state) {
  return !!state.combat;
}

export function resolveCombatAction(state, rng, action) {
  const c = state.combat;
  if (!c) return;

  const e = DATA.enemies[c.enemyId];
  const enemyName = e.name || c.enemyId;
  const log = [];

  const a = (action || "").toLowerCase();
  c.defending = false;

  if (a === "attack") {
    const dmg = damage(state.player.atk, e.def, rng);
    c.enemyHp = clamp(c.enemyHp - dmg, 0, 9999);
    log.push({ id: nowId(), type: "system", text: `你造成了 ${dmg} 点伤害。` });
  } else if (a === "defend") {
    c.defending = true;
    log.push({ id: nowId(), type: "system", text: "你稳住呼吸，摆出防御姿态。" });
  } else if (a.startsWith("use:")) {
    const itemId = a.slice("use:".length);
    const qty = Number(state.inventory[itemId] || 0);
    const item = DATA.items[itemId];
    const heal = item ? Number(item.heal || 0) : 0;
    if (!itemId || qty <= 0) {
      log.push({ id: nowId(), type: "system", text: "你没有这个。" });
    } else if (heal <= 0) {
      log.push({ id: nowId(), type: "system", text: "没有任何效果。" });
    } else {
      state.inventory[itemId] = qty - 1;
      const before = state.player.hp;
      state.player.hp = clamp(state.player.hp + heal, 0, state.player.maxHp);
      log.push({ id: nowId(), type: "system", text: `你使用了「${item.name}」，恢复 ${state.player.hp - before} 点体力。` });
    }
  } else if (a === "flee") {
    const ok = rng.nextFloat() < 0.35;
    if (ok) {
      log.push({ id: nowId(), type: "system", text: "你趁雾遁走。" });
      state.combat = null;
      state.log.push(...log);
      return { ended: true, won: false, fled: true };
    }
    log.push({ id: nowId(), type: "system", text: "雾不肯放你走。" });
  } else {
    log.push({ id: nowId(), type: "system", text: "请选择：攻击 / 防御 / 使用道具 / 逃跑" });
  }

  // enemy defeated
  if (c.enemyHp <= 0) {
    log.push({ id: nowId(), type: "narration", text: `「${enemyName}」倒下了。` });
    state.combat = null;
    awardVictory(state, e, log);
    state.log.push(...log);
    return { ended: true, won: true, fled: false };
  }

  // enemy turn
  const bonusDef = c.defending ? 2 : 0;
  const enemyDmg = damage(e.atk, state.player.def + bonusDef, rng);
  state.player.hp = clamp(state.player.hp - enemyDmg, 0, state.player.maxHp);
  log.push({ id: nowId(), type: "system", text: `「${enemyName}」对你造成 ${enemyDmg} 点伤害。` });

  if (state.player.hp <= 0) {
    log.push({ id: nowId(), type: "rare", text: "你倒下了。杉雾合拢。" });
    state.gameOver = true;
    state.combat = null;
    state.log.push(...log);
    return { ended: true, won: false, fled: false };
  }

  state.log.push(...log);
  return { ended: false };
}

function awardVictory(state, enemy, log) {
  const gold = Number(enemy.gold || 0);
  if (gold) {
    state.player.gold += gold;
    log.push({ id: nowId(), type: "system", text: `获得 ${gold} 钱。` });
  }
  if (enemy.loot && typeof enemy.loot === "object") {
    for (const [itemId, qty] of Object.entries(enemy.loot)) {
      const q = Number(qty || 0);
      if (q <= 0) continue;
      state.inventory[itemId] = Number(state.inventory[itemId] || 0) + q;
      const name = (DATA.items[itemId] && DATA.items[itemId].name) || itemId;
      log.push({ id: nowId(), type: "system", text: `获得：${name} x${q}` });
    }
  }
  if (enemy === DATA.enemies.shrine_guardian) {
    state.flags.shrine_cleansed = true;
    log.push({ id: nowId(), type: "rare", text: "神社的铃声终于回到了正音。" });
  }
}
