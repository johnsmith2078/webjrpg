import { createRng } from "./seed.js";
import { DATA } from "./data.js";
import { deriveUnlocked, createInitialState } from "./state.js";
import { saveState } from "./save.js";
import { rollEventId, applyEvent, applyOps } from "./events.js";
import { checkRequirements } from "./events.js";
import { startCombat, isInCombat, resolveCombatAction } from "./combat.js";
import { craft, listAvailableRecipes, canCraft } from "./crafting.js";
import { locationTargets, travel } from "./world.js";
import { nowId } from "./utils.js";

export function createGame({ state }) {
  let s = state;
  let rng = createRng(s.rng);

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
    syncDerived();
    saveState(s);
  }

  function newGame(seed) {
    s = createInitialState(seed);
    rng = createRng(s.rng);
    pushIntroIfNeeded();
    syncDerived();
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
    const beforeHp = s.player.hp;
    const beforeMp = Number(s.player.mp || 0);
    const beforeEn = Number(s.player.en || 0);

    s.player.hp = Math.min(s.player.maxHp, s.player.hp + 8);
    if (s.player.maxMp !== undefined) s.player.mp = Math.min(s.player.maxMp, Number(s.player.mp || 0) + 5);
    if (s.player.maxEn !== undefined) s.player.en = Math.min(s.player.maxEn, Number(s.player.en || 0) + 5);
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
    craft(s, recipeId);
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
    if (heal <= 0) {
      s.log.push({ id: nowId(), type: "system", text: "没有任何效果。" });
      persist();
      api.notify();
      return;
    }
    s.inventory[itemId] = qty - 1;
    if (s.inventory[itemId] <= 0) delete s.inventory[itemId];
    const before = s.player.hp;
    s.player.hp = Math.min(s.player.maxHp, s.player.hp + heal);
    s.timeMin += 5;
    s.log.push({ id: nowId(), type: "system", text: `你使用了「${item.name}」，恢复 ${s.player.hp - before} 点体力。` });
    persist();
    api.notify();
  }

  function dropItem(itemId) {
    if (s.gameOver) return;
    if (!itemId) return;
    const qty = Number(s.inventory[itemId] || 0);
    if (qty <= 0) return;
    s.inventory[itemId] = qty - 1;
    if (s.inventory[itemId] <= 0) delete s.inventory[itemId];
    const name = (DATA.items[itemId] && DATA.items[itemId].name) || itemId;
    s.log.push({ id: nowId(), type: "system", text: `丢弃：${name} x1` });
    persist();
    api.notify();
  }

  function choices() {
    if (s.gameOver) {
      return [
        { id: "new", label: "重新开始", kind: "action" },
        { id: "settings", label: "存档 / 导出", kind: "action", tone: "secondary" }
      ];
    }

    if (isInCombat(s)) {
      const usable = Object.entries(s.inventory)
        .filter(([id, qty]) => {
          if (qty <= 0) return false;
          const it = DATA.items[id];
          if (!it) return false;
          if (it.heal) return true;
          if (it.combat) return true;
          return false;
        })
        .map(([id]) => id);
      const useChoices = usable.slice(0, 3).map((id) => ({
        id: `use:${id}`,
        label: `使用：${DATA.items[id].name}`,
        kind: "combat"
      }));
      const skillChoices = [];
      if (s.flags.skills_learned_purify && !s.combat.usedPurify) {
        skillChoices.push({ id: "skill:purify", label: "破邪斩", kind: "combat" });
      }
      if (s.flags.skills_learned_focus && (!s.combat.skillCooldowns?.focus || s.combat.skillCooldowns.focus === 0)) {
        skillChoices.push({ id: "skill:focus", label: "凝神", kind: "combat" });
      }
      if (s.flags.skills_learned_sweep && (!s.combat.skillCooldowns?.sweep || s.combat.skillCooldowns.sweep === 0)) {
        skillChoices.push({ id: "skill:sweep", label: "横扫", kind: "combat" });
      }
      if (s.flags.skills_learned_heal_light && (!s.combat.skillCooldowns?.heal_light || s.combat.skillCooldowns.heal_light === 0)) {
        skillChoices.push({ id: "skill:heal_light", label: "微光治愈", kind: "combat" });
      }
      if (s.flags.skills_learned_stealth && (!s.combat.skillCooldowns?.stealth || s.combat.skillCooldowns.stealth === 0)) {
        skillChoices.push({ id: "skill:stealth", label: "隐身", kind: "combat" });
      }
      if (s.flags.skills_learned_power_strike && (!s.combat.skillCooldowns?.power_strike || s.combat.skillCooldowns.power_strike === 0)) {
        skillChoices.push({ id: "skill:power_strike", label: "强力击", kind: "combat" });
      }
      if (s.flags.skills_learned_fireball && (!s.combat.skillCooldowns?.fireball || s.combat.skillCooldowns.fireball === 0)) {
        skillChoices.push({ id: "skill:fireball", label: "火球术", kind: "combat" });
      }
      if (s.flags.skills_learned_deploy_turret && (!s.combat.skillCooldowns?.deploy_turret || s.combat.skillCooldowns.deploy_turret === 0)) {
        skillChoices.push({ id: "skill:deploy_turret", label: "部署炮塔", kind: "combat" });
      }

      return [
        { id: "attack", label: "攻击", kind: "combat" },
        { id: "defend", label: "防御", kind: "combat" },
        ...skillChoices,
        ...useChoices,
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

    const mode = s.ui.mode;
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

    // main
    const questChoices = [];
    if (s.quests && Object.keys(s.quests).length > 0) {
      questChoices.push({ id: "quests", label: "任务", kind: "action" });
    }
    
    return [
      { id: "explore", label: "探索", kind: "action" },
      { id: "travel", label: "出发", kind: "action" },
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
    if (id === "back") return setMode("main");
    if (id === "new") return newGame(Date.now());

    if (id.startsWith("travel:")) return doTravel(id.slice("travel:".length));
    if (id.startsWith("craft:")) return doCraft(id.slice("craft:".length));

    if (id.startsWith("use:")) {
      const itemId = id.slice("use:".length);
      if (isInCombat(s)) return combatAction(id);
      return useItem(itemId);
    }

    if (id === "skill:purify") {
      if (isInCombat(s)) return combatAction(id);
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
        const has = state.inventory[objective.item] || 0;
        complete = has >= objective.qty;
        questState.progress[objKey] = { current: has, target: objective.qty, complete };
      } else if (objective.type === "craft") {
        complete = state.flags[quest.recipe] || false;
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
      syncDerived();
      persist();
      api.notify();
    },
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
