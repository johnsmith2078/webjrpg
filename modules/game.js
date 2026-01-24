import { createRng } from "./seed.js";
import { DATA } from "./data.js";
import { deriveUnlocked, createInitialState } from "./state.js";
import { saveState } from "./save.js";
import { rollEventId, applyEvent, applyOps } from "./events.js";
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
    persist();
    api.notify();
  }

  function rest() {
    if (s.gameOver) return;
    const before = s.player.hp;
    s.player.hp = Math.min(s.player.maxHp, s.player.hp + 8);
    s.timeMin += 30;
    s.log.push({ id: nowId(), type: "system", text: `你稍作休息，恢复了 ${s.player.hp - before} 点体力。` });
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
    const res = travel(s, toId);
    if (!res.ok) {
      s.log.push({ id: nowId(), type: "system", text: res.reason });
    } else {
      const loc = DATA.locations[s.location];
      s.log.push({ id: nowId(), type: "narration", text: `你抵达：${loc.name}` });
      s.log.push({ id: nowId(), type: "narration", text: loc.desc });
    }
    s.ui.mode = "main";
    persist();
    api.notify();
  }

  function doCraft(recipeId) {
    if (s.gameOver) return;
    craft(s, recipeId);
    persist();
    api.notify();
  }

  function combatAction(action) {
    if (!isInCombat(s)) return;
    resolveCombatAction(s, rng, action);
    // time passes per round
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
      return [
        { id: "attack", label: "攻击", kind: "combat" },
        { id: "defend", label: "防御", kind: "combat" },
        ...(s.flags.has_iron_blade && s.combat && !s.combat.usedPurify
          ? [{ id: "skill:purify", label: "破邪斩", kind: "combat" }]
          : []),
        ...useChoices,
        { id: "flee", label: "逃跑", kind: "combat", tone: "secondary" }
      ];
    }

    if (s.prompt) {
      const list = s.prompt.choices.map((c) => ({
        id: `prompt:${c.id}`,
        label: c.label,
        disabled: !!c.disabled,
        sub: c.disabledReason || "",
        kind: "action"
      }));
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
    return [
      { id: "explore", label: "探索", kind: "action" },
      { id: "travel", label: "出发", kind: "action" },
      { id: "craft", label: "制作", kind: "action" },
      { id: "rest", label: "休息", kind: "action", tone: "secondary" }
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

    if (isInCombat(s)) return combatAction(id);
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
