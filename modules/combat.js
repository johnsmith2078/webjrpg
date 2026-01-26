import { DATA } from "./data.js";
import { recordItemGain } from "./quests.js";
import { clamp, nowId } from "./utils.js";
import { derivePlayerStats } from "./stats.js";

function damage(atk, def, rng, bonus, critMultiplier) {
  const roll = rng.nextInt(0, 2);
  const base = Math.max(0, atk + roll + Number(bonus || 0) - def);
  const mult = Number.isFinite(critMultiplier) ? critMultiplier : 1;
  return Math.floor(base * mult);
}

function getCritMultiplier(combat) {
  return combat && combat.statusEffects && combat.statusEffects.crit_boost > 0 ? 2 : 1;
}

export function startCombat(state, enemyId) {
  const e = DATA.enemies[enemyId];
  state.combat = {
    enemyId,
    enemyHp: e.hp,
    defending: false,
    enemyStun: 0,
    usedPurify: false,
    skillCooldowns: {},
    enemyAtkDown: 0,
    swarmDamage: 0,
    turretDamage: 0,
    statusEffects: {
      focus: 0,
      ward: 0,
      stealth: 0,
      crit_boost: 0,
      weaken: 0,
      swarm: 0,
      turret: 0,
      mana_shield: 0
    }
  };
  
  if (!state.player) {
    state.player = { hp: 20, maxHp: 20, mp: 10, maxMp: 10, en: 10, maxEn: 10, atk: 1, def: 0, gold: 0, sp: 3 };
  }
  if (state.player.maxMp === undefined) state.player.maxMp = 10;
  if (state.player.maxEn === undefined) state.player.maxEn = 10;
  if (state.player.mp === undefined) state.player.mp = Number(state.player.maxMp || 10);
  if (state.player.en === undefined) state.player.en = Number(state.player.maxEn || 10);

  state.player.sp = 3;
  const derived = derivePlayerStats(state);
  state.player.mp = Number(derived.maxMp || state.player.maxMp || 10);
  state.player.en = Number(derived.maxEn || state.player.maxEn || 10);
  state.player.hp = clamp(Number(state.player.hp || 0), 0, Number(derived.maxHp || state.player.maxHp || 20));
  
  const name = e.name || enemyId;
  state.log.push({ id: nowId(), type: "rare", text: `「${name}」现身了。` });
}

export function isInCombat(state) {
  return !!state.combat;
}

export function resolveCombatAction(state, rng, action) {
  const c = state.combat;
  if (!c) return;

  if (!c.statusEffects || typeof c.statusEffects !== "object") {
    c.statusEffects = {};
  }
  if (c.statusEffects.turret === undefined) c.statusEffects.turret = 0;
  if (c.statusEffects.mana_shield === undefined) c.statusEffects.mana_shield = 0;
  if (c.turretDamage === undefined) c.turretDamage = 0;
  if (c.statusEffects.mana_shield > 0 && Number(state.player?.mp || 0) <= 0) {
    c.statusEffects.mana_shield = 0;
  }

  const e = DATA.enemies[c.enemyId];
  const enemyName = e.name || c.enemyId;
  const log = [];

  const derived = derivePlayerStats(state);
  const effAtk = Number(derived.atk || 0);
  const effDef = Number(derived.def || 0);
  const weaponId = state.equipment && state.equipment.weapon ? state.equipment.weapon : null;
  const weapon = weaponId ? DATA.items[weaponId] : null;
  const weaponCombat = weapon && weapon.combat && typeof weapon.combat === "object" ? weapon.combat : {};

  const a = (action || "").toLowerCase();
  c.defending = false;

  for (const [effect, duration] of Object.entries(c.statusEffects)) {
    if (effect === "swarm" || effect === "turret" || effect === "mana_shield") continue;
    if (duration > 0) {
      c.statusEffects[effect] = duration - 1;
    }
  }
  
  for (const [skill, cooldown] of Object.entries(c.skillCooldowns)) {
    if (cooldown > 0) {
      c.skillCooldowns[skill] = cooldown - 1;
    }
  }

  if (a === "attack") {
    let weaponBonus = Number(weaponCombat.damageBonus || 0);
    if (weaponCombat.damageBonusVs && weaponCombat.damageBonusVs[c.enemyId]) {
      weaponBonus += Number(weaponCombat.damageBonusVs[c.enemyId] || 0);
    }
    const isCrit = c.statusEffects.crit_boost > 0;
    const dmg = damage(effAtk, e.def, rng, weaponBonus, getCritMultiplier(c));
    c.enemyHp = clamp(c.enemyHp - dmg, 0, 9999);
    
    if (isCrit) {
      log.push({ id: nowId(), type: "rare", text: `暴击！你造成了 ${dmg} 点伤害。` });
    } else {
      log.push({ id: nowId(), type: "system", text: `你造成了 ${dmg} 点伤害。` });
    }
  } else if (a === "defend") {
    c.defending = true;
    log.push({ id: nowId(), type: "system", text: "你稳住呼吸，摆出防御姿态。" });
  } else if (a.startsWith("skill:")) {
    const skillId = a.slice("skill:".length);
    const skillResult = handleSkill(state, skillId, rng, log);
    if (skillResult && skillResult.ended !== undefined) {
      return skillResult;
    }
  } else if (a.startsWith("use:")) {
    const itemId = a.slice("use:".length);
    const qty = Number(state.inventory[itemId] || 0);
    const item = DATA.items[itemId];
    const heal = item ? Number(item.heal || 0) : 0;
    if (!itemId || qty <= 0) {
      log.push({ id: nowId(), type: "system", text: "你没有这个。" });
    } else if (item && item.combat && item.combat.type === "stun") {
      const turns = Number(item.combat.turns || 1);
      state.inventory[itemId] = qty - 1;
      if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
      c.enemyStun = Math.max(c.enemyStun, turns);
      const charmDmg = 1 + rng.nextInt(0, 2);
      c.enemyHp = clamp(c.enemyHp - charmDmg, 0, 9999);
      log.push({ id: nowId(), type: "rare", text: `你掷出「${item.name}」。符火灼伤 ${charmDmg} 点，敌人动作一滞。` });
    } else if (item && item.combat && item.combat.type === "explosive") {
      state.inventory[itemId] = qty - 1;
      if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
      const [min, max] = item.combat.damage;
      const dmg = min + rng.nextInt(0, max - min);
      c.enemyHp = clamp(c.enemyHp - dmg, 0, 9999);
      log.push({ id: nowId(), type: "rare", text: `爆炸陷阱！造成了 ${dmg} 点范围伤害。` });
    } else if (item && item.combat && item.combat.type === "ward") {
      log.push({ id: nowId(), type: "rare", text: `「${item.name}」发出微光，你感到安全。` });
      state.inventory[itemId] = qty - 1;
      if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
      c.statusEffects.ward = Math.max(c.statusEffects.ward || 0, item.combat.turns || 2);
    } else if (item && item.combat && item.combat.type === "focus") {
      state.inventory[itemId] = qty - 1;
      if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
      c.statusEffects.crit_boost = Math.max(c.statusEffects.crit_boost, item.combat.turns);
      log.push({ id: nowId(), type: "rare", text: `「${item.name}」的香气让你专注。` });
    } else if (heal > 0) {
      state.inventory[itemId] = qty - 1;
      if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
      const before = state.player.hp;
      const derived = derivePlayerStats(state);
      state.player.hp = clamp(state.player.hp + heal, 0, Number(derived.maxHp || state.player.maxHp || 20));
      log.push({ id: nowId(), type: "system", text: `你使用了「${item.name}」，恢复 ${state.player.hp - before} 点体力。` });
    } else {
      log.push({ id: nowId(), type: "system", text: "没有任何效果。" });
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

  if (c.statusEffects.turret > 0 && c.enemyHp > 0) {
    const tick = Math.max(1, Number(c.turretDamage || 1));
    c.enemyHp = clamp(c.enemyHp - tick, 0, 9999);
    c.statusEffects.turret = Math.max(0, c.statusEffects.turret - 1);
    log.push({ id: nowId(), type: "rare", text: `炮塔连射，造成 ${tick} 点伤害。` });
  }

  if (c.statusEffects.swarm > 0 && c.enemyHp > 0) {
    const tick = Math.max(1, Number(c.swarmDamage || 1));
    c.enemyHp = clamp(c.enemyHp - tick, 0, 9999);
    c.statusEffects.swarm = Math.max(0, c.statusEffects.swarm - 1);
    log.push({ id: nowId(), type: "rare", text: `电弧蜂群撕咬，造成 ${tick} 点伤害。` });
  }

  // enemy defeated
  if (c.enemyHp <= 0) {
    log.push({ id: nowId(), type: "narration", text: `「${enemyName}」倒下了。` });
    const defeatedId = c.enemyId;
    state.combat = null;
    awardVictory(state, defeatedId, e, log);
    state.log.push(...log);
    return { ended: true, won: true, fled: false };
  }

  if (c.enemyStun > 0) {
    c.enemyStun -= 1;
    log.push({ id: nowId(), type: "system", text: `「${enemyName}」踉跄了一下。` });
    state.log.push(...log);
    return { ended: false };
  }

  if (c.statusEffects.stealth > 0 && rng.nextFloat() < 0.8) {
    log.push({ id: nowId(), type: "system", text: `你巧妙地避开了「${enemyName}」的攻击。` });
    state.log.push(...log);
    return { ended: false };
  }

  const traits = e.traits || [];
  if (traits.includes("evasion") && rng.nextFloat() < 0.3) {
    log.push({ id: nowId(), type: "system", text: `「${enemyName}」灵巧地闪避了。` });
    state.log.push(...log);
    return { ended: false };
  }

  const bonusDef = c.defending ? 2 : 0;
  const cursedPenalty = state.flags.cursed ? 1 : 0;
  const wardReduction = c.statusEffects.ward > 0 ? Math.floor(e.atk * 0.5) : 0;
  const atkDebuff = c.statusEffects.weaken > 0 ? Number(c.enemyAtkDown || 0) : 0;
  const enemyAtk = Math.max(1, Number(e.atk || 0) - atkDebuff);
  const enemyDmg = Math.max(1, damage(enemyAtk, effDef + bonusDef, rng, cursedPenalty) - wardReduction);
  let hpDamage = enemyDmg;
  let mpAbsorb = 0;
  let absorbTarget = 0;
  const shieldRatio = Math.min(1, Math.max(0, Number(DATA.skills.mana_shield?.shield_ratio || 0.8)));
  const hasShield = c.statusEffects.mana_shield > 0 && Number(state.player.mp || 0) > 0 && shieldRatio > 0;

  if (hasShield) {
    absorbTarget = Math.ceil(enemyDmg * shieldRatio);
    mpAbsorb = Math.min(Number(state.player.mp || 0), absorbTarget);
    hpDamage = enemyDmg - mpAbsorb;
    state.player.mp = Math.max(0, Number(state.player.mp || 0) - mpAbsorb);
    if (mpAbsorb < absorbTarget) {
      c.statusEffects.mana_shield = 0;
    }
  }

  state.player.hp = clamp(state.player.hp - hpDamage, 0, Number(derived.maxHp || state.player.maxHp || 20));

  if (hasShield) {
    const prefix = c.statusEffects.ward > 0 ? "护身符削减后，" : "";
    log.push({ id: nowId(), type: "system", text: `${prefix}魔法盾吸收 ${mpAbsorb} 点伤害，你受到 ${hpDamage} 点伤害。` });
    if (mpAbsorb < absorbTarget) {
      log.push({ id: nowId(), type: "rare", text: "法力耗尽，魔法盾破碎。" });
    }
  } else if (c.statusEffects.ward > 0) {
    log.push({ id: nowId(), type: "system", text: `护身符抵挡了部分伤害，你受到 ${enemyDmg} 点伤害。` });
  } else {
    log.push({ id: nowId(), type: "system", text: `「${enemyName}」对你造成 ${enemyDmg} 点伤害。` });
  }

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

function handleSkill(state, skillId, rng, log) {
  const c = state.combat;
  if (!c) return;

  const skill = DATA.skills[skillId];
  if (!skill) {
    log.push({ id: nowId(), type: "system", text: "未知的技能。" });
    return { ended: false };
  }

  if (c.skillCooldowns[skillId] > 0) {
    log.push({ id: nowId(), type: "system", text: `技能冷却中 (${c.skillCooldowns[skillId]} 回合)。` });
    return { ended: false };
  }

  if (skill.mpCost && (state.player.mp || 0) < skill.mpCost) {
    log.push({ id: nowId(), type: "system", text: "法力不足。" });
    return { ended: false };
  }

  if (skill.enCost && (state.player.en || 0) < skill.enCost) {
    log.push({ id: nowId(), type: "system", text: "能量不足。" });
    return { ended: false };
  }

  if (skill.cost && (state.player.sp || 0) < skill.cost) {
    log.push({ id: nowId(), type: "system", text: "技能点不足。" });
    return { ended: false };
  }

  if (skillId === "purify") {
    const weaponId = state.equipment && state.equipment.weapon ? state.equipment.weapon : null;
    const weapon = weaponId ? DATA.items[weaponId] : null;
    const combat = weapon && weapon.combat && typeof weapon.combat === "object" ? weapon.combat : null;
    const allows = !!(combat && Array.isArray(combat.allowsSkills) && combat.allowsSkills.includes("purify"));
    if (!allows) {
      log.push({ id: nowId(), type: "system", text: "你现在做不到。" });
    } else if (c.usedPurify) {
      log.push({ id: nowId(), type: "system", text: "这一招已经用过了。" });
    } else {
      c.usedPurify = true;
      const e = DATA.enemies[c.enemyId];
      const base = 3;
      const bonus = (c.enemyId === "oni_wisp" || c.enemyId === "shrine_guardian") ? 5 : 0;
      let dmg = base + bonus + rng.nextInt(0, 2);
      
      if (state.flags.cursed) {
        dmg *= 2;
        log.push({ id: nowId(), type: "rare", text: "诅咒之力加持，伤害翻倍！" });
      }
      
      dmg = Math.floor(dmg * getCritMultiplier(c));
      c.enemyHp = clamp(c.enemyHp - dmg, 0, 9999);
      log.push({ id: nowId(), type: "rare", text: `破邪斩！你造成了 ${dmg} 点伤害。` });
      if (state.flags.cursed) {
        delete state.flags.cursed;
        log.push({ id: nowId(), type: "system", text: "你身上的不祥像灰一样剥落。" });
      }
    }
  } else if (skillId === "focus") {
    c.statusEffects.focus = Math.max(c.statusEffects.focus, skill.duration);
    c.statusEffects.crit_boost = Math.max(c.statusEffects.crit_boost, skill.duration);
    log.push({ id: nowId(), type: "rare", text: "你凝神聚力，感知变得敏锐。" });
  } else if (skillId === "sweep") {
    const e = DATA.enemies[c.enemyId];
    const derived = derivePlayerStats(state);
    const baseDmg = Math.floor(Number(derived.atk || 0) * (skill.damage_percent / 100));
    const dmg = damage(baseDmg, e.def, rng, 0, getCritMultiplier(c));
    c.enemyHp = clamp(c.enemyHp - dmg, 0, 9999);
    log.push({ id: nowId(), type: "rare", text: `横扫！你造成了 ${dmg} 点范围伤害。` });
  } else if (skillId === "heal_light") {
    let healAmt = skill.heal_amount;
    const hasHerb = (state.inventory.mystic_herb || 0) > 0;
    
    if (hasHerb) {
      state.inventory.mystic_herb = Number(state.inventory.mystic_herb) - 1;
      if (state.inventory.mystic_herb <= 0) delete state.inventory.mystic_herb;
      
      state.player.maxHp += 10;
      healAmt *= 2;
      log.push({ id: nowId(), type: "rare", text: "消耗神秘草药！生命上限提升，治愈效果翻倍！" });
    }

    const before = state.player.hp;
    const derived = derivePlayerStats(state);
    const maxHp = Number(derived.maxHp || state.player.maxHp || 20);
    state.player.hp = clamp(state.player.hp + healAmt, 0, maxHp);
    log.push({ id: nowId(), type: "system", text: `微光治愈！恢复了 ${state.player.hp - before} 点体力。` });
  } else if (skillId === "stealth") {
    c.statusEffects.stealth = Math.max(c.statusEffects.stealth, skill.duration);
    log.push({ id: nowId(), type: "rare", text: "你融入阴影，身形变得模糊。" });
  } else if (skillId === "power_strike") {
    const e = DATA.enemies[c.enemyId];
    const derived = derivePlayerStats(state);
    const baseAtk = Math.floor(Number(derived.atk || 0) * 1.6);
    const dmg = damage(baseAtk, e.def, rng, 0, getCritMultiplier(c));
    c.enemyHp = clamp(c.enemyHp - dmg, 0, 9999);
    log.push({ id: nowId(), type: "rare", text: `强力击！你造成了 ${dmg} 点伤害。` });
  } else if (skillId === "war_cry") {
    const duration = Number(skill.duration || 2);
    const atkDown = Number(skill.atk_down || 1);
    c.statusEffects.weaken = Math.max(c.statusEffects.weaken, duration);
    c.enemyAtkDown = Math.max(Number(c.enemyAtkDown || 0), atkDown);
    log.push({ id: nowId(), type: "rare", text: "你怒吼震慑，敌人的气势被压制了。" });
  } else if (skillId === "fireball") {
    const e = DATA.enemies[c.enemyId];
    const derived = derivePlayerStats(state);
    const base = Number(skill.base_damage || 2);
    const mpScale = Number(skill.mp_scale || 0);
    const maxMp = Number(derived.maxMp || state.player.maxMp || 0);
    const mpBonus = Math.floor(maxMp * mpScale);
    const baseAtk = Math.max(0, base + mpBonus);
    const dmg = Math.max(1, damage(baseAtk, e.def, rng, 0, getCritMultiplier(c)));
    c.enemyHp = clamp(c.enemyHp - dmg, 0, 9999);
    log.push({ id: nowId(), type: "rare", text: `火球术！法力越盛，爆炎越猛（受护甲压制）。造成 ${dmg} 点魔法伤害。` });
  } else if (skillId === "mana_shield") {
    c.statusEffects.mana_shield = Math.max(Number(c.statusEffects.mana_shield || 0), 1);
    log.push({ id: nowId(), type: "rare", text: "魔法盾展开，法力替你承伤。" });
  } else if (skillId === "deploy_turret") {
    const derived = derivePlayerStats(state);
    const base = Number(skill.tick_base || 1);
    const scale = Number(skill.atk_scale || 0);
    const tick = Math.max(1, Math.floor(base + Number(derived.atk || 0) * scale));
    const duration = Number(skill.duration || 2);
    c.statusEffects.turret = Math.max(Number(c.statusEffects.turret || 0), duration);
    c.turretDamage = Math.max(Number(c.turretDamage || 0), tick);
    log.push({ id: nowId(), type: "rare", text: `炮塔启动，持续射击（每回合 ${tick} 点伤害）。` });
  } else if (skillId === "shock_swarm") {
    const derived = derivePlayerStats(state);
    const base = Number(skill.tick_base || 1);
    const scale = Number(skill.atk_scale || 0);
    const tick = Math.max(1, Math.floor(base + Number(derived.atk || 0) * scale));
    const duration = Number(skill.duration || 2);
    c.statusEffects.swarm = Math.max(c.statusEffects.swarm, duration);
    c.swarmDamage = Math.max(Number(c.swarmDamage || 0), tick);
    log.push({ id: nowId(), type: "rare", text: `你释放电弧蜂群，缠绕着敌人（每回合 ${tick} 点伤害）。` });
  }

  if (skill.cooldown > 0) {
    c.skillCooldowns[skillId] = skill.cooldown;
  }
  if (skill.mpCost) {
    state.player.mp = Math.max(0, Number(state.player.mp || 0) - Number(skill.mpCost || 0));
  }
  if (skill.enCost) {
    state.player.en = Math.max(0, Number(state.player.en || 0) - Number(skill.enCost || 0));
  }
  if (skill.cost) {
    state.player.sp = (state.player.sp || 0) - skill.cost;
  }
}

function awardVictory(state, enemyId, enemy, log) {
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
      recordItemGain(state, itemId, q);
      const name = (DATA.items[itemId] && DATA.items[itemId].name) || itemId;
      log.push({ id: nowId(), type: "system", text: `获得：${name} x${q}` });
    }
  }
  
  state.flags[`defeated_${enemyId}`] = true;
  
  if (enemyId === "shrine_guardian") {
    state.flags.shrine_cleansed = true;
    log.push({ id: nowId(), type: "rare", text: "神社的铃声终于回到了正音。" });
  }
}
