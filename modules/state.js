import { normalizeSeed } from "./seed.js";
import { DATA } from "./data.js";

export function createInitialState(seedInput) {
  const seed = normalizeSeed(seedInput);
  return {
    version: 7,
    seed,
    rng: { s: seed >>> 0 },
    timeMin: 0,

    location: "village",
    discovered: { village: true },
    unlocked: { village: true },

    player: {
      hp: 20,
      maxHp: 20,
      mp: 10,
      maxMp: 10,
      en: 10,
      maxEn: 10,
      atk: 3,
      def: 1,
      gold: 0,
      sp: 3
    },

    equipment: {
      weapon: null,
      armor: null
    },
    inventory: {},
    flags: {},

    seenEvents: {},

    prompt: null,

    ui: {
      mode: "main", // main | travel | craft | inventory | settings
      modal: null
    },

    combat: null,
    gameOver: false,
    log: []
  };
}

export function deriveUnlocked(state) {
  const out = { village: true };
  for (const [id, loc] of Object.entries(DATA.locations)) {
    if (isUnlocked(state, loc.unlock)) out[id] = true;
  }
  return out;
}

export function isUnlocked(state, rule) {
  if (!rule || rule.type === "start") return true;
  if (rule.type === "time") return state.timeMin >= (rule.afterMin || 0);
  if (rule.type === "flag") return !!state.flags[rule.flag];
  if (rule.type === "item") {
    const inv = state.inventory && typeof state.inventory === "object" ? state.inventory : {};
    const q = Number(rule.qty || 1);
    return Number(inv[rule.item] || 0) >= q;
  }
  if (rule.type === "all" && Array.isArray(rule.of)) {
    return rule.of.every((r) => isUnlocked(state, r));
  }
  return false;
}
