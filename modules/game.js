import { createRng } from "./seed.js";
import { DATA } from "./data.js";
import { deriveUnlocked, createInitialState } from "./state.js";
import { saveState } from "./save.js";
import { rollEventId, applyEvent, applyOps } from "./events.js";
import { checkRequirements } from "./events.js";
import { startCombat, isInCombat, resolveCombatAction } from "./combat.js";
import { craft, listAvailableRecipes, canCraft } from "./crafting.js";
import { locationTargets, travel } from "./world.js";
import { derivePlayerStats, getItemSlot } from "./stats.js";
import { nowId } from "./utils.js";

export function createGame({ state }) {
  let s = state;
  let rng = createRng(s.rng);

  function ensureEquipmentState() {
    if (!s.equipment || typeof s.equipment !== "object") {
      s.equipment = { weapon: null, armor: null };
      migrateLegacyEquipment();
      return;
    }
    if (!("weapon" in s.equipment)) s.equipment.weapon = null;
    if (!("armor" in s.equipment)) s.equipment.armor = null;
  }

  function itemScore(itemId) {
    const it = DATA.items[itemId];
    if (!it) return -1;
    const s = it.stats && typeof it.stats === "object" ? it.stats : {};
    const combat = it.combat && typeof it.combat === "object" ? it.combat : {};
    return Number(s.atk || 0) + Number(s.def || 0) + Number(s.maxHp || 0) * 0.05 + Number(s.maxMp || 0) * 0.05 + Number(s.maxEn || 0) * 0.05 + Number(combat.damageBonus || 0);
  }

  function migrateLegacyEquipment() {
    // Legacy saves may not have equipment slots; pick a reasonable default from inventory.
    const inv = s.inventory && typeof s.inventory === "object" ? s.inventory : {};
    const candidates = Object.entries(inv)
      .filter(([, q]) => Number(q || 0) > 0)
      .map(([id]) => id);

    const weapons = candidates.filter((id) => getItemSlot(DATA.items[id]) === "weapon");
    const armors = candidates.filter((id) => getItemSlot(DATA.items[id]) === "armor");

    if (!s.equipment.weapon && weapons.length > 0) {
      weapons.sort((a, b) => itemScore(b) - itemScore(a) || a.localeCompare(b));
      s.equipment.weapon = weapons[0];
    }
    if (!s.equipment.armor && armors.length > 0) {
      armors.sort((a, b) => itemScore(b) - itemScore(a) || a.localeCompare(b));
      s.equipment.armor = armors[0];
    }
  }

  function syncDerived() {
    s.unlocked = deriveUnlocked(s);
  }

  function pushIntroIfNeeded() {
    if (s.log.length > 0) return;
    s.log.push({ id: nowId(), type: "narration", text: "烛火不肯熄灭。" });
    s.log.push({ id: nowId(), type: "narration", text: "窗外，杉雾贴着门缝爬行。" });
    s.log.push({ id: nowId(), type: "system", text: "你的手懂得劳作，你的呼吸懂得祈祷。" });
  }

  function persist() {
    s.rng = rng.exportState();
    ensureEquipmentState();
    syncDerived();
    saveState(s);
  }

  function newGame(seed) {
    s = createInitialState(seed);
    rng = createRng(s.rng);
    ensureEquipmentState();
    pushIntroIfNeeded();
    syncDerived();
    persist();
    api.notify();
  }

  function logStatDelta(before, after) {
    if (!before || !after) return;
    const parts = [];
    if (before.atk !== after.atk) parts.push(`攻击 ${before.atk} -> ${after.atk}`);
    if (before.def !== after.def) parts.push(`防御 ${before.def} -> ${after.def}`);
    if (before.maxHp !== after.maxHp) parts.push(`生命上限 ${before.maxHp} -> ${after.maxHp}`);
    if (before.maxMp !== after.maxMp) parts.push(`法力上限 ${before.maxMp} -> ${after.maxMp}`);
    if (before.maxEn !== after.maxEn) parts.push(`能量上限 ${before.maxEn} -> ${after.maxEn}`);
    if (parts.length > 0) {
      s.log.push({ id: nowId(), type: "system", text: `属性变化：${parts.join("，")}` });
    }

    const beforeBonuses = new Set(Array.isArray(before.bonuses) ? before.bonuses : []);
    const afterBonuses = Array.isArray(after.bonuses) ? after.bonuses : [];
    for (const name of afterBonuses) {
      if (!beforeBonuses.has(name)) {
        s.log.push({ id: nowId(), type: "rare", text: `组合生效：${name}` });
      }
    }
  }

  function equipItemCore(itemId, { persistNotify }) {
    if (s.gameOver) return;
    ensureEquipmentState();
    if (!itemId) return;

    const qty = Number(s.inventory[itemId] || 0);
    const it = DATA.items[itemId];
    const slot = getItemSlot(it);
    if (!it || qty <= 0) {
      s.log.push({ id: nowId(), type: "system", text: "你没有这个。" });
      if (persistNotify) {
        persist();
        api.notify();
      }
      return;
    }
    if (!slot) {
      s.log.push({ id: nowId(), type: "system", text: "这不是装备。" });
      if (persistNotify) {
        persist();
        api.notify();
      }
      return;
    }

    const before = derivePlayerStats(s);
    const prev = s.equipment[slot];
    s.equipment[slot] = itemId;
    const after = derivePlayerStats(s);

    if (s.player) {
      s.player.hp = Math.min(Number(s.player.hp || 0), Number(after.maxHp || s.player.maxHp || 0));
      s.player.mp = Math.min(Number(s.player.mp || 0), Number(after.maxMp || s.player.maxMp || 0));
      s.player.en = Math.min(Number(s.player.en || 0), Number(after.maxEn || s.player.maxEn || 0));
    }

    if (prev && prev !== itemId) {
      const prevName = DATA.items[prev]?.name || prev;
      s.log.push({
        id: nowId(),
        type: "system",
        text: `替换${slot === "weapon" ? "武器" : "防具"}：${prevName} -> ${it.name}`
      });
    } else {
      s.log.push({ id: nowId(), type: "system", text: `装备：${it.name}` });
    }

    logStatDelta(before, after);

    if (persistNotify) {
      persist();
      api.notify();
    }
  }

  function equipItem(itemId) {
    if (s.gameOver) return;
    ensureEquipmentState();
    if (isInCombat(s)) {
      s.log.push({ id: nowId(), type: "system", text: "战斗中无法更换装备。" });
      persist();
      api.notify();
      return;
    }
    if (s.prompt) {
      s.log.push({ id: nowId(), type: "system", text: "你还没做出选择。" });
      persist();
      api.notify();
      return;
    }
    equipItemCore(itemId, { persistNotify: true });
  }

  function unequipSlot(slot) {
    if (s.gameOver) return;
    ensureEquipmentState();
    if (slot !== "weapon" && slot !== "armor") return;
    if (isInCombat(s)) {
      s.log.push({ id: nowId(), type: "system", text: "战斗中无法更换装备。" });
      persist();
      api.notify();
      return;
    }
    if (s.prompt) {
      s.log.push({ id: nowId(), type: "system", text: "你还没做出选择。" });
      persist();
      api.notify();
      return;
    }

    const cur = s.equipment[slot];
    if (!cur) return;
    const before = derivePlayerStats(s);
    s.equipment[slot] = null;
    const after = derivePlayerStats(s);
    if (s.player) {
      s.player.hp = Math.min(Number(s.player.hp || 0), Number(after.maxHp || s.player.maxHp || 0));
      s.player.mp = Math.min(Number(s.player.mp || 0), Number(after.maxMp || s.player.maxMp || 0));
      s.player.en = Math.min(Number(s.player.en || 0), Number(after.maxEn || s.player.maxEn || 0));
    }
    const name = DATA.items[cur]?.name || cur;
    s.log.push({ id: nowId(), type: "system", text: `卸下：${name}` });
    logStatDelta(before, after);
    persist();
    api.notify();
  }

  function explore() {
    if (s.gameOver) return;
    if (s.prompt) {
      s.log.push({ id: nowId(), type: "system", text: "你还没做出选择。" });
      persist();
      api.notify();
      return;
    }
    const evId = rollEventId(s, rng);
    if (!evId) {
      s.log.push({ id: nowId(), type: "system", text: "四下无声。" });
      s.timeMin += 10;
      trackExplorationProgress(s);
      checkQuestProgress(s);
      persist();
      api.notify();
      return;
    }
    const res = applyEvent(s, rng, evId);
    s.log.push(...res.lines);
    // baseline time cost
    s.timeMin += 10;
    if (res.startCombat) {
      startCombat(s, res.startCombat);
    }
    if (res.prompt) {
      s.prompt = res.prompt;
    }
    if (res.endGame) {
      s.gameOver = true;
      s.log.push({ id: nowId(), type: "rare", text: "（终）" });
    }
    trackExplorationProgress(s);
    checkQuestProgress(s);
    persist();
    api.notify();
  }

  function rest() {
    if (s.gameOver) return;
    const derived = derivePlayerStats(s);
    const maxHp = Number(derived.maxHp || s.player.maxHp || 0);
    const maxMp = Number(derived.maxMp || s.player.maxMp || 0);
    const maxEn = Number(derived.maxEn || s.player.maxEn || 0);
    const beforeHp = s.player.hp;
    const beforeMp = Number(s.player.mp || 0);
    const beforeEn = Number(s.player.en || 0);

    s.player.hp = Math.min(maxHp, s.player.hp + 8);
    if (s.player.maxMp !== undefined) s.player.mp = Math.min(maxMp, Number(s.player.mp || 0) + 5);
    if (s.player.maxEn !== undefined) s.player.en = Math.min(maxEn, Number(s.player.en || 0) + 5);
    s.timeMin += 30;

    const healedHp = s.player.hp - beforeHp;
    const healedMp = Number(s.player.mp || 0) - beforeMp;
    const healedEn = Number(s.player.en || 0) - beforeEn;
    const parts = [];
    if (healedHp > 0) parts.push(`体力 +${healedHp}`);
    if (healedMp > 0) parts.push(`法力 +${healedMp}`);
    if (healedEn > 0) parts.push(`能量 +${healedEn}`);
    s.log.push({ id: nowId(), type: "system", text: `你稍作休息。${parts.join("，") || "你感觉好多了。"}` });
    persist();
    api.notify();
  }

  function setMode(mode) {
    s.ui.mode = mode;
    persist();
    api.notify();
  }

  function doTravel(toId) {
    if (s.gameOver) return;
    if (s.prompt) {
      s.log.push({ id: nowId(), type: "system", text: "你还没做出选择。" });
      persist();
      api.notify();
      return;
    }

    const fromId = s.location;
    const res = travel(s, toId);
    if (!res.ok) {
      s.log.push({ id: nowId(), type: "system", text: res.reason });
    } else {
      const loc = DATA.locations[s.location];
      s.log.push({ id: nowId(), type: "narration", text: `你抵达：${loc.name}` });
      s.log.push({ id: nowId(), type: "narration", text: loc.desc });

      // A Dark Room-ish: returning home can trigger special beats.
      if (s.location === "village") {
        triggerArrivalEvents(fromId, s.location);
      }
    }
    s.ui.mode = "main";
    persist();
    api.notify();
  }

  function triggerArrivalEvents(fromId, toId) {
    const candidates = [];
    for (const [eventId, ev] of Object.entries(DATA.events)) {
      if (!ev || typeof ev !== "object") continue;
      if (!ev.onArrive) continue;
      if (ev.at !== toId) continue;
      if (Array.isArray(ev.from) && ev.from.length > 0 && !ev.from.includes(fromId)) continue;

      if (ev.requirements) {
        const check = checkRequirements(s, ev.requirements);
        if (!check.ok) continue;
      }

      if (ev.once) {
        const seen = s.seenEvents && typeof s.seenEvents === "object" ? Number(s.seenEvents[eventId] || 0) : 0;
        if (seen > 0) continue;
      }

      candidates.push({ eventId, priority: Number(ev.priority || 0) });
    }

    if (candidates.length === 0) return;
    candidates.sort((a, b) => (b.priority - a.priority) || a.eventId.localeCompare(b.eventId));
    const picked = candidates[0].eventId;

    const res = applyEvent(s, rng, picked);
    s.log.push(...res.lines);
    if (res.startCombat) startCombat(s, res.startCombat);
    if (res.prompt) s.prompt = res.prompt;
    if (res.endGame) {
      s.gameOver = true;
      s.log.push({ id: nowId(), type: "rare", text: "（终）" });
    }
  }

  function doCraft(recipeId) {
    if (s.gameOver) return;
    ensureEquipmentState();
    const recipe = DATA.recipes[recipeId];
    craft(s, recipeId);

    if (recipe && recipe.outputs && typeof recipe.outputs === "object") {
      for (const itemId of Object.keys(recipe.outputs)) {
        const slot = getItemSlot(DATA.items[itemId]);
        if (!slot) continue;
        if (Number(s.inventory[itemId] || 0) > 0) {
          equipItemCore(itemId, { persistNotify: false });
        }
      }
    }
    checkQuestProgress(s);
    persist();
    api.notify();
  }

  function combatAction(action) {
    if (!isInCombat(s)) return;
    const result = resolveCombatAction(s, rng, action);
    checkQuestProgress(s);
    s.timeMin += 5;
    persist();
    api.notify();
  }

  function useItem(itemId) {
    if (s.gameOver) return;
    if (!itemId) return;
    const item = DATA.items[itemId];
    const qty = Number(s.inventory[itemId] || 0);
    const heal = item ? Number(item.heal || 0) : 0;
    if (!item || qty <= 0) {
      s.log.push({ id: nowId(), type: "system", text: "你没有这个。" });
      persist();
      api.notify();
      return;
    }
    
    // Combat-only items cannot be used outside combat
    if (item.combat) {
      const combatTypeNames = {
        stun: "缚符",
        explosive: "爆炸陷阱",
        ward: "护身符",
        focus: "凝神茶"
      };
      const typeName = combatTypeNames[item.combat.type] || "战斗道具";
      s.log.push({ id: nowId(), type: "system", text: `「${item.name}」是${typeName}，只能在战斗中使用。` });
      persist();
      api.notify();
      return;
    }
    
    if (heal <= 0) {
      s.log.push({ id: nowId(), type: "system", text: "没有任何效果。" });
      persist();
      api.notify();
      return;
    }
    s.inventory[itemId] = qty - 1;
    if (s.inventory[itemId] <= 0) delete s.inventory[itemId];
    const before = s.player.hp;
    const derived = derivePlayerStats(s);
    s.player.hp = Math.min(Number(derived.maxHp || s.player.maxHp || 0), s.player.hp + heal);
    s.timeMin += 5;
    s.log.push({ id: nowId(), type: "system", text: `你使用了「${item.name}」，恢复 ${s.player.hp - before} 点体力。` });
    persist();
    api.notify();
  }

  function dropItem(itemId) {
    if (s.gameOver) return;
    if (!itemId) return;
    ensureEquipmentState();
    const qty = Number(s.inventory[itemId] || 0);
    if (qty <= 0) return;

    const before = qty === 1 ? derivePlayerStats(s) : null;

    s.inventory[itemId] = qty - 1;
    if (s.inventory[itemId] <= 0) delete s.inventory[itemId];

    if (qty === 1) {
      let removed = false;
      if (s.equipment.weapon === itemId) {
        s.equipment.weapon = null;
        removed = true;
      }
      if (s.equipment.armor === itemId) {
        s.equipment.armor = null;
        removed = true;
      }
      if (removed) {
        const name = DATA.items[itemId]?.name || itemId;
        s.log.push({ id: nowId(), type: "system", text: `已卸下：${name}（已无该物品）` });
        const after = derivePlayerStats(s);
        if (s.player) {
          s.player.hp = Math.min(Number(s.player.hp || 0), Number(after.maxHp || s.player.maxHp || 0));
          s.player.mp = Math.min(Number(s.player.mp || 0), Number(after.maxMp || s.player.maxMp || 0));
          s.player.en = Math.min(Number(s.player.en || 0), Number(after.maxEn || s.player.maxEn || 0));
        }
        logStatDelta(before, after);
      }
    }
    const name = (DATA.items[itemId] && DATA.items[itemId].name) || itemId;
    s.log.push({ id: nowId(), type: "system", text: `丢弃：${name} x1` });
    persist();
    api.notify();
  }


  function getLocationNPCs(state) {
    const npcs = [];
    const loc = state.location;
    if (!loc) return npcs;
    
    for (const [npcId, npc] of Object.entries(DATA.npcs || {})) {
      if (!npc || typeof npc !== 'object') continue;
      if (npc.location !== loc) continue;
      if (npc.location === 'random') continue;
      
      // Check requirements
      if (npc.requirements) {
        const check = checkRequirements(state, npc.requirements);
        if (!check.ok) continue;
      }
      
      npcs.push({ id: npcId, name: npc.name, npc });
    }
    
    return npcs;
  }

  function getSkillStatus(skillId) {
    const skill = DATA.skills[skillId];
    if (!skill) return { ok: false, reason: "技能不可用" };
    const cooldown = Number(s.combat?.skillCooldowns?.[skillId] || 0);
    if (cooldown > 0) return { ok: false, reason: `冷却 ${cooldown} 回合` };
    const mp = Number(s.player?.mp || 0);
    const en = Number(s.player?.en || 0);
    const sp = Number(s.player?.sp || 0);
    if (skill.mpCost && mp < Number(skill.mpCost)) return { ok: false, reason: "法力不足" };
    if (skill.enCost && en < Number(skill.enCost)) return { ok: false, reason: "能量不足" };
    if (skill.cost && sp < Number(skill.cost)) return { ok: false, reason: "技能点不足" };
    return { ok: true, reason: "" };
  }

  function getPurifyStatus() {
    if (s.combat?.usedPurify) return { ok: false, reason: "本场已用" };
    const weaponId = s.equipment?.weapon;
    const weapon = weaponId ? DATA.items[weaponId] : null;
    const allows = !!(weapon && weapon.combat && Array.isArray(weapon.combat.allowsSkills) && weapon.combat.allowsSkills.includes("purify"));
    if (!allows) return { ok: false, reason: "需要可用武器" };
    return { ok: true, reason: "" };
  }

  function choices() {
    if (s.gameOver) {
      return [
        { id: "new", label: "重新开始", kind: "action" },
        { id: "settings", label: "存档 / 导出", kind: "action", tone: "secondary" }
      ];
    }

    const mode = s.ui.mode || "main";

    if (isInCombat(s) && !mode.startsWith("combat_items")) {
      const usable = Object.entries(s.inventory)
        .filter(([id, qty]) => {
          if (qty <= 0) return false;
          const it = DATA.items[id];
          if (!it) return false;
          if (it.heal) return true;
          // Only items with combat.type are usable as items in combat
          // Equipment has combat.allowsSkills but no combat.type
          // skill_boost is not a direct-use type (passive effect)
          if (it.combat && it.combat.type && it.combat.type !== "skill_boost") return true;
          return false;
        })
        .map(([id]) => id);
      
      // Categorize items for better UX
      const categorized = {
        heal: [],      // 回复类 💊
        damage: [],    // 伤害类 💥
        defense: [],   // 防御类 🛡️
        buff: []       // 增益类 ⚡
      };
      
      for (const id of usable) {
        const it = DATA.items[id];
        if (it.heal) {
          categorized.heal.push({ id, name: it.name, heal: it.heal });
        } else if (it.combat) {
          const type = it.combat.type;
          if (type === "stun" || type === "explosive") {
            categorized.damage.push({ id, name: it.name, type });
          } else if (type === "ward") {
            categorized.defense.push({ id, name: it.name, turns: it.combat.turns });
          } else if (type === "focus") {
            categorized.buff.push({ id, name: it.name, turns: it.combat.turns });
          }
        }
      }
      
      // Generate categorized choices with visual grouping
      const useChoices = [];
      
      // Category: 回复类
      if (categorized.heal.length > 0) {
        useChoices.push({ id: "cat:heal_header", label: "━━━ 回复类 💊 ━━━", kind: "category_header", disabled: true });
        for (const item of categorized.heal) {
          useChoices.push({ id: `use:${item.id}`, label: `  ${item.name} (+${item.heal})`, kind: "combat" });
        }
      }
      
      // Category: 伤害类
      if (categorized.damage.length > 0) {
        useChoices.push({ id: "cat:damage_header", label: "━━━ 伤害类 💥 ━━━", kind: "category_header", disabled: true });
        for (const item of categorized.damage) {
          const typeName = item.type === "stun" ? "晕眩" : "爆炸";
          useChoices.push({ id: `use:${item.id}`, label: `  ${item.name} (${typeName})`, kind: "combat" });
        }
      }
      
      // Category: 防御类
      if (categorized.defense.length > 0) {
        useChoices.push({ id: "cat:defense_header", label: "━━━ 防御类 🛡️ ━━━", kind: "category_header", disabled: true });
        for (const item of categorized.defense) {
          useChoices.push({ id: `use:${item.id}`, label: `  ${item.name} (${item.turns}回合)`, kind: "combat" });
        }
      }
      
      // Category: 增益类
      if (categorized.buff.length > 0) {
        useChoices.push({ id: "cat:buff_header", label: "━━━ 增益类 ⚡ ━━━", kind: "category_header", disabled: true });
        for (const item of categorized.buff) {
          useChoices.push({ id: `use:${item.id}`, label: `  ${item.name} (${item.turns}回合)`, kind: "combat" });
        }
      }
      const skillChoices = [];
      const pushSkill = (id, label, statusOverride) => {
        const status = statusOverride || getSkillStatus(id);
        skillChoices.push({
          id: `skill:${id}`,
          label,
          kind: "combat",
          disabled: !status.ok,
          sub: status.reason || ""
        });
      };
      if (s.flags.skills_learned_purify) {
        pushSkill("purify", "破邪斩", getPurifyStatus());
      }
      if (s.flags.skills_learned_focus) {
        pushSkill("focus", "凝神");
      }
      if (s.flags.skills_learned_sweep) {
        pushSkill("sweep", "横扫");
      }
      if (s.flags.skills_learned_heal_light) {
        pushSkill("heal_light", "微光治愈");
      }
      if (s.flags.skills_learned_stealth) {
        pushSkill("stealth", "隐身");
      }
      if (s.flags.skills_learned_power_strike) {
        pushSkill("power_strike", "强力击");
      }
      if (s.flags.skills_learned_war_cry) {
        pushSkill("war_cry", "战吼");
      }
      if (s.flags.skills_learned_fireball) {
        pushSkill("fireball", "火球术");
      }
      if (s.flags.skills_learned_arcane_drain) {
        pushSkill("arcane_drain", "奥术汲取");
      }
      if (s.flags.skills_learned_deploy_turret) {
        pushSkill("deploy_turret", "部署炮塔");
      }
      if (s.flags.skills_learned_shock_swarm) {
        pushSkill("shock_swarm", "电弧蜂群");
      }

       return [
        { id: "attack", label: "攻击", kind: "combat" },
        { id: "defend", label: "防御", kind: "combat" },
        ...skillChoices,
        ...(useChoices.length > 0 ? [{ id: "items", label: "物品", kind: "combat" }] : []),
        { id: "flee", label: "逃跑", kind: "combat", tone: "secondary" }
      ];
    }

    if (s.prompt) {
      const list = s.prompt.choices.map((c) => {
        let disabled = !!c.disabled;
        let sub = c.disabledReason || "";
        
        if (c.requires) {
          const check = checkRequirements(s, c.requires);
          if (!check.ok) {
            disabled = true;
            const reqs = [];
            if (c.requires.gold) reqs.push(`${c.requires.gold} 钱`);
            if (c.requires.item) {
              const q = typeof c.requires.qty === "number" ? c.requires.qty : 1;
              const name = DATA.items[c.requires.item]?.name || c.requires.item;
              reqs.push(`${name} x${q}`);
            }
            if (c.requires.items) {
              for (const [id, qty] of Object.entries(c.requires.items)) {
                const name = DATA.items[id]?.name || id;
                reqs.push(`${name} x${qty}`);
              }
            }
            sub = reqs.length > 0 ? `需要：${reqs.join(", ")}` : check.reason;
          }
        }

        return {
          id: `prompt:${c.id}`,
          label: c.label,
          disabled: disabled,
          sub: sub,
          kind: "action"
        };
      });
      return [...list, { id: "prompt:close", label: "暂时离开", kind: "action", tone: "secondary" }];
    }

    if (mode === "travel") {
      const targets = locationTargets(s).map((id) => ({
        id: `travel:${id}`,
        label: `前往：${DATA.locations[id].name}`,
        kind: "travel"
      }));
      return [...targets, { id: "back", label: "返回", kind: "action", tone: "secondary" }];
    }
    if (mode === "craft") {
      const recs = listAvailableRecipes(s);
      const list = recs.map((r) => {
        const ok = canCraft(s, r);
        const needs = Object.entries(r.inputs || {})
          .map(([iid, q]) => `${DATA.items[iid]?.name || iid} ${s.inventory[iid] || 0}/${q}`)
          .join(", ");
        return {
          id: `craft:${r.id}`,
          label: `${r.name}`,
          sub: needs,
          disabled: !ok,
          kind: "craft"
        };
      });
      return [...list, { id: "back", label: "返回", kind: "action", tone: "secondary" }];
    }

    if (mode === "talk") {
      const npcs = getLocationNPCs(s);
      const list = npcs.map((n) => ({
        id: "talk:" + n.id,
        label: "与" + n.name + "交谈",
        kind: "talk"
      }));
      return [...list, { id: "back", label: "返回", kind: "action", tone: "secondary" }];
    }

    if (mode === "npc_talk") {
      const npcId = s.ui.talkingTo;
      const npc = npcId ? DATA.npcs[npcId] : null;
      if (!npc) {
        return [{ id: "back", label: "返回", kind: "action", tone: "secondary" }];
      }
      
      const choices = [];
      
      // Greeting options
      if (npc.dialogues && npc.dialogues.greeting) {
        for (let i = 0; i < npc.dialogues.greeting.length; i++) {
          choices.push({
            id: "npc_talk:greeting:" + i,
            label: "打招呼",
            sub: npc.dialogues.greeting[i].substring(0, 20) + "...",
            kind: "dialogue"
          });
        }
      }
      
      // List services (back-compat: some data defines services under dialogues.services)
      const services = npc.services || (npc.dialogues && npc.dialogues.services);
      if (services) {
        for (const [serviceId, service] of Object.entries(services)) {
          if (service?.gives?.skill && s.flags[`skills_learned_${service.gives.skill}`]) {
            continue;
          }
          const canUse = checkRequirements(s, service.requires || {}).ok;
          const costText = service.cost > 0 ? "（" + service.cost + "金币）" : "";
          const desc = service.description || "";
          choices.push({
            id: "npc_talk:service:" + serviceId,
            label: service.name + costText,
            sub: desc,
            disabled: !canUse,
            kind: "service"
          });
        }
      }
      
      // Goodbye option
      choices.push({ id: "npc_talk:goodbye", label: "告别离开", kind: "dialogue", tone: "secondary" });
      
       return choices;
    }

    // Combat items submenu modes
    if (isInCombat(s) && mode === "combat_items") {
      const usable = Object.entries(s.inventory)
        .filter(([id, qty]) => {
          if (qty <= 0) return false;
          const it = DATA.items[id];
          if (!it) return false;
          if (it.heal) return true;
          if (it.combat && it.combat.type && it.combat.type !== "skill_boost") return true;
          return false;
        })
        .map(([id]) => id);
      
      // Categorize items
      const categorized = { heal: [], damage: [], defense: [], buff: [] };
      
      for (const id of usable) {
        const it = DATA.items[id];
        if (it.heal) {
          categorized.heal.push({ id, name: it.name, heal: it.heal });
        } else if (it.combat) {
          const type = it.combat.type;
          if (type === "stun" || type === "explosive") {
            categorized.damage.push({ id, name: it.name, type });
          } else if (type === "ward") {
            categorized.defense.push({ id, name: it.name, turns: it.combat.turns });
          } else if (type === "focus") {
            categorized.buff.push({ id, name: it.name, turns: it.combat.turns });
          }
        }
      }
      
      const choices = [];
      if (categorized.heal.length > 0) {
        choices.push({ id: "combat_cat:heal", label: "💊 回复类", kind: "combat_category" });
      }
      if (categorized.damage.length > 0) {
        choices.push({ id: "combat_cat:damage", label: "💥 伤害类", kind: "combat_category" });
      }
      if (categorized.defense.length > 0) {
        choices.push({ id: "combat_cat:defense", label: "🛡️ 防御类", kind: "combat_category" });
      }
      if (categorized.buff.length > 0) {
        choices.push({ id: "combat_cat:buff", label: "⚡ 增益类", kind: "combat_category" });
      }
      choices.push({ id: "back", label: "返回", kind: "combat", tone: "secondary" });
      return choices;
    }
    
    if (isInCombat(s) && mode === "combat_items_heal") {
      const usable = Object.entries(s.inventory)
        .filter(([id, qty]) => qty > 0 && DATA.items[id]?.heal)
        .map(([id]) => id);
      return [
        ...usable.map(id => ({
          id: `use:${id}`,
          label: `${DATA.items[id].name} (+${DATA.items[id].heal})`,
          kind: "combat"
        })),
        { id: "back", label: "返回", kind: "combat", tone: "secondary" }
      ];
    }
    
    if (isInCombat(s) && mode === "combat_items_damage") {
      const usable = Object.entries(s.inventory)
        .filter(([id, qty]) => {
          if (qty <= 0) return false;
          const it = DATA.items[id];
          return it?.combat?.type === "stun" || it?.combat?.type === "explosive";
        })
        .map(([id]) => id);
      return [
        ...usable.map(id => ({
          id: `use:${id}`,
          label: `${DATA.items[id].name}`,
          kind: "combat"
        })),
        { id: "back", label: "返回", kind: "combat", tone: "secondary" }
      ];
    }
    
    if (isInCombat(s) && mode === "combat_items_defense") {
      const usable = Object.entries(s.inventory)
        .filter(([id, qty]) => qty > 0 && DATA.items[id]?.combat?.type === "ward")
        .map(([id]) => id);
      return [
        ...usable.map(id => ({
          id: `use:${id}`,
          label: `${DATA.items[id].name} (${DATA.items[id].combat.turns}回合)`,
          kind: "combat"
        })),
        { id: "back", label: "返回", kind: "combat", tone: "secondary" }
      ];
    }
    
    if (isInCombat(s) && mode === "combat_items_buff") {
      const usable = Object.entries(s.inventory)
        .filter(([id, qty]) => qty > 0 && DATA.items[id]?.combat?.type === "focus")
        .map(([id]) => id);
      return [
        ...usable.map(id => ({
          id: `use:${id}`,
          label: `${DATA.items[id].name} (${DATA.items[id].combat.turns}回合)`,
          kind: "combat"
        })),
        { id: "back", label: "返回", kind: "combat", tone: "secondary" }
      ];
    }

    // main
    const questChoices = [];
    if (s.quests && Object.keys(s.quests).length > 0) {
      questChoices.push({ id: "quests", label: "任务", kind: "action" });
    }

    // Check if there are NPCs at current location
    const npcsAtLocation = getLocationNPCs(s);
    const hasNPCs = npcsAtLocation.length > 0;
    
    return [
      { id: "explore", label: "探索", kind: "action" },
      { id: "travel", label: "出发", kind: "action" },
      ...(hasNPCs ? [{ id: "talk", label: "交谈", kind: "action" }] : []),
      { id: "craft", label: "制作", kind: "action" },
      { id: "rest", label: "休息", kind: "action", tone: "secondary" },
      ...questChoices
    ];
  }

  function handleChoice(id) {
    if (!id) return;

    if (id.startsWith("prompt:")) {
      const choiceId = id.slice("prompt:".length);
      return choosePrompt(choiceId);
    }
    if (id === "explore") return explore();
    if (id === "rest") return rest();
    if (id === "travel") return setMode("travel");
    if (id === "craft") return setMode("craft");
    if (id === "back") {
      // Combat items mode: return to combat
      if (isInCombat(s)) return setMode("combat");
      // Normal mode: return to main
      return setMode("main");
    }
    if (id === "new") return newGame(Date.now());

    if (id.startsWith("travel:")) return doTravel(id.slice("travel:".length));
    if (id.startsWith("craft:")) return doCraft(id.slice("craft:".length));
    if (id === "talk") {
      const npcs = getLocationNPCs(s);
      if (npcs.length === 1) {
        s.ui.talkingTo = npcs[0].id;
        setMode("npc_talk");
      } else {
        setMode("talk");
      }
      return;
    }
    if (id.startsWith("talk:")) {
      s.ui.talkingTo = id.slice("talk:".length);
      setMode("npc_talk");
      return;
    }
    if (id.startsWith("npc_talk:")) {
      const choiceId = id.slice("npc_talk:".length);
      return handleNPCTalk(choiceId);
    }

    // Combat items mode switching
    if (id === "items" && isInCombat(s)) {
      return setMode("combat_items");
    }
    if (id.startsWith("combat_cat:") && isInCombat(s)) {
      const category = id.slice("combat_cat:".length);
      const modeMap = {
        heal: "combat_items_heal",
        damage: "combat_items_damage",
        defense: "combat_items_defense",
        buff: "combat_items_buff"
      };
      if (modeMap[category]) {
        return setMode(modeMap[category]);
      }
    }
    if (id === "back" && isInCombat(s)) {
      return setMode("combat");
    }

    if (id.startsWith("use:")) {
      const itemId = id.slice("use:".length);
      if (isInCombat(s)) return combatAction(id);
      return useItem(itemId);
    }

    if (id === "skill:purify") {
      if (isInCombat(s)) {
        const status = getPurifyStatus();
        if (!status.ok) {
          s.log.push({ id: nowId(), type: "system", text: status.reason || "你现在做不到。" });
          persist();
          api.notify();
          return;
        }
        return combatAction(id);
      }
      return;
    }

    if (id === "quests") {
      return showQuests();
    }

    if (isInCombat(s)) return combatAction(id);
  }
  
  function showQuests() {
    let hasActive = false;
    let hasCompleted = false;

    for (const [questId, quest] of Object.entries(DATA.quests)) {
      const qState = s.quests && s.quests[questId];
      if (qState && qState.started && !qState.completed) {
        if (!hasActive) {
          s.log.push({ id: nowId(), type: "system", text: "=== 进行中的任务 ===" });
          hasActive = true;
        }
        s.log.push({ id: nowId(), type: "rare", text: `${quest.name}` });
        s.log.push({ id: nowId(), type: "system", text: quest.description });

        if (quest.objectives) {
          for (const obj of quest.objectives) {
            const objKey = `${questId}_${obj.type}_${obj.item || obj.location || obj.enemy}`;
            const prog = qState.progress[objKey] || { current: 0, target: obj.qty || obj.count || 1 };
            
            let statusText = "";
            if (prog.complete) {
              statusText = " [已完成]";
            } else {
              statusText = ` (${prog.current}/${prog.target})`;
            }
            
            s.log.push({
              id: nowId(),
              type: "system",
              text: `  - ${obj.description || "目标"}${statusText}`
            });
          }
        }
      }
    }

    for (const [questId, quest] of Object.entries(DATA.quests)) {
      const qState = s.quests && s.quests[questId];
      if (qState && qState.completed) {
        if (!hasCompleted) {
          s.log.push({ id: nowId(), type: "system", text: "=== 已完成的任务 ===" });
          hasCompleted = true;
        }
        s.log.push({ id: nowId(), type: "system", text: `${quest.name} [完成]` });
      }
    }

    if (!hasActive && !hasCompleted) {
      s.log.push({ id: nowId(), type: "system", text: "你还没有接到任何任务。先去和村民聊聊吧。" });
    } else {
      s.log.push({ id: nowId(), type: "system", text: "任务会自动更新进度，继续探索吧。" });
    }
    
    persist();
    api.notify();
  }

  function handleNPCTalk(choiceId) {
    if (!s.ui.talkingTo) return setMode('main');
    
    const npcId = s.ui.talkingTo;
    const npc = DATA.npcs[npcId];
    if (!npc) {
      s.ui.talkingTo = null;
      setMode('main');
      return;
    }
    
    if (choiceId === 'back' || choiceId === 'goodbye') {
      s.log.push({ id: nowId(), type: 'system', text: '你告别了' + npc.name + '。' });
      s.ui.talkingTo = null;
      setMode('main');
      persist();
      api.notify();
      return;
    }
    
    // Handle greeting
    if (choiceId.startsWith('greeting:')) {
      const idx = parseInt(choiceId.slice('greeting:'.length), 10);
      if (npc.dialogues && npc.dialogues.greeting[idx]) {
        s.log.push({ id: nowId(), type: 'narration', text: npc.dialogues.greeting[idx] });
      }
      persist();
      api.notify();
      return;
    }
    
    // Handle service
    if (choiceId.startsWith('service:')) {
      const serviceId = choiceId.slice('service:'.length);
      const services = npc.services || (npc.dialogues && npc.dialogues.services);
      const service = services && services[serviceId];
      if (!service) {
        setMode('main');
        return;
      }
      
      const check = checkRequirements(s, service.requires || {});
      if (!check.ok) {
        s.log.push({ id: nowId(), type: 'system', text: '条件不足，无法使用此服务。' });
        persist();
        api.notify();
        return;
      }
      
      const lines = [];
      applyOps(s, s.rng, [{ op: 'npcService', npc: npcId, service: serviceId }], lines);
      s.log.push(...lines);
      checkQuestProgress(s);

      s.ui.talkingTo = null;
      setMode('main');
      persist();
      api.notify();
      return;
    }
    
    // Default case: unhandled choice
    s.log.push({ id: nowId(), type: 'system', text: '（当前没有更多选项）' });
    persist();
    api.notify();
  }

  function checkQuestProgress(state) {
    if (!state.quests) state.quests = {};
    
    for (const [questId, quest] of Object.entries(DATA.quests)) {
      // Only check progress for started, uncompleted quests
      if (!state.quests[questId] || !state.quests[questId].started || state.quests[questId].completed) continue;
      
      updateQuestObjectives(state, questId, quest);
    }
  }
  
  function trackExplorationProgress(state) {
    if (!state.quests) return;
    const currentLocation = state.location;

    for (const [questId, quest] of Object.entries(DATA.quests)) {
      const questState = state.quests[questId];
      if (!questState || !questState.started || questState.completed) continue;
      if (!quest.objectives) continue;

      if (!questState.progress) questState.progress = {};

      for (const objective of quest.objectives) {
        if (objective.type !== "explore") continue;
        if (objective.location !== currentLocation) continue;
        const objKey = `${questId}_${objective.type}_${objective.item || objective.location || objective.enemy}`;

        const prev = Number(questState.progress[objKey]?.current || 0);
        const next = prev + 1;
        questState.progress[objKey] = { current: next, target: objective.count, complete: next >= objective.count };
      }
    }
  }
  
  function updateQuestObjectives(state, questId, quest) {
    const questState = state.quests[questId];
    if (!questState || !questState.started) return;

    if (!questState.progress) questState.progress = {};
    
    let allComplete = true;
    
    for (const objective of quest.objectives) {
      let complete = false;
      const objKey = `${questId}_${objective.type}_${objective.item || objective.location || objective.enemy}`;
      
      if (objective.type === "collect") {
        const target = Number(objective.qty || objective.count || 1);
        if (objective.countMode === "acquire") {
          let current = Number(questState.progress[objKey]?.current || 0);
          if (!questState.progress[objKey]) {
            current = Number(state.inventory[objective.item] || 0);
          }
          complete = current >= target;
          questState.progress[objKey] = { current, target, complete };
        } else {
          const has = Number(state.inventory[objective.item] || 0);
          complete = has >= target;
          questState.progress[objKey] = { current: has, target, complete };
        }
      } else if (objective.type === "craft") {
        const craftedFlag = objective.recipe ? `crafted_${objective.recipe}` : null;
        complete = craftedFlag ? !!state.flags[craftedFlag] : false;
        questState.progress[objKey] = { current: complete ? 1 : 0, target: 1, complete };
      } else if (objective.type === "defeat") {
        complete = state.flags[`defeated_${objective.enemy}`] || false;
        questState.progress[objKey] = { current: complete ? 1 : 0, target: 1, complete };
      } else if (objective.type === "explore") {
        const current = Number(questState.progress[objKey]?.current || 0);
        complete = current >= objective.count;
        questState.progress[objKey] = { current, target: objective.count, complete };
      }
      
      if (!complete) allComplete = false;
      
      if (complete && !questState.progress[objKey]?.complete) {
        state.log.push({ id: nowId(), type: "rare", text: `任务目标完成：${objective.description || objective.type}` });
      }
    }
    
    if (allComplete) {
      completeQuest(state, questId, quest);
    }
  }
  
  function completeQuest(state, questId, quest) {
    state.log.push({ id: nowId(), type: "rare", text: `任务完成：${quest.name}` });
    
    if (quest.rewards.gold) {
      state.player.gold += quest.rewards.gold;
      state.log.push({ id: nowId(), type: "system", text: `获得奖励：${quest.rewards.gold} 金币` });
    }
    
    if (quest.rewards.items) {
      for (const [itemId, qty] of Object.entries(quest.rewards.items)) {
        state.inventory[itemId] = (state.inventory[itemId] || 0) + qty;
        const itemName = DATA.items[itemId]?.name || itemId;
        state.log.push({ id: nowId(), type: "system", text: `获得奖励：${itemName} x${qty}` });
      }
    }
    
    if (quest.rewards.flags) {
      for (const [flag, value] of Object.entries(quest.rewards.flags)) {
        state.flags[flag] = value;
      }
    }
    
    state.quests[questId].completed = true;
  }

  function choosePrompt(choiceId) {
    if (!s.prompt) return;
    if (choiceId === "close") {
      s.log.push({ id: nowId(), type: "system", text: "你把话咽回肚子里。" });
      s.prompt = null;
      persist();
      api.notify();
      return;
    }
    const c = (s.prompt.choices || []).find((x) => x.id === choiceId);
    if (!c) return;
    if (c.disabled) {
      s.log.push({ id: nowId(), type: "system", text: "现在还做不到。" });
      persist();
      api.notify();
      return;
    }

    const lines = [];
    const { startCombat: enemyId, endGame } = applyOps(s, rng, c.ops || [], lines);
    s.log.push(...lines);
    if (enemyId) startCombat(s, enemyId);
    if (endGame) {
      s.gameOver = true;
      s.log.push({ id: nowId(), type: "rare", text: "（终）" });
    }
    s.prompt = null;
    persist();
    api.notify();
  }

  // init
  pushIntroIfNeeded();
  syncDerived();
  persist();

  const listeners = new Set();
  const api = {
    getState: () => s,
    getRng: () => rng,
    choices,
    handleChoice,
    newGame,
    setMode,
    useItem,
    dropItem,
    importState(nextState) {
      s = nextState;
      rng = createRng(s.rng);
      ensureEquipmentState();
      syncDerived();
      persist();
      api.notify();
    },
    equipItem,
    unequipSlot,
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    notify() {
      for (const fn of listeners) fn();
    }
  };
  return api;
}
