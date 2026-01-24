// Deterministic PRNG with exportable state.
// mulberry32: small, fast, decent for games.

export function normalizeSeed(seed) {
  if (typeof seed === "number" && Number.isFinite(seed)) {
    return seed >>> 0;
  }
  if (typeof seed === "string") {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  return 0;
}

export function createRng(seedOrState) {
  const s =
    seedOrState && typeof seedOrState === "object" && typeof seedOrState.s === "number"
      ? seedOrState.s >>> 0
      : normalizeSeed(seedOrState);

  let state = s >>> 0;

  function nextU32() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }

  return {
    nextFloat() {
      return nextU32() / 4294967296;
    },
    nextInt(min, max) {
      const a = Math.ceil(min);
      const b = Math.floor(max);
      if (b < a) return a;
      const r = nextU32();
      return a + (r % (b - a + 1));
    },
    pick(list) {
      if (!Array.isArray(list) || list.length === 0) return null;
      return list[this.nextInt(0, list.length - 1)];
    },
    pickWeighted(weighted) {
      // weighted: [{id, w}] or [[id,w]]
      let total = 0;
      for (const row of weighted) {
        const w = Array.isArray(row) ? row[1] : row.w;
        if (typeof w === "number" && w > 0) total += w;
      }
      if (total <= 0) return null;
      let roll = this.nextInt(1, total);
      for (const row of weighted) {
        const id = Array.isArray(row) ? row[0] : row.id;
        const w = Array.isArray(row) ? row[1] : row.w;
        if (typeof w !== "number" || w <= 0) continue;
        roll -= w;
        if (roll <= 0) return id;
      }
      return Array.isArray(weighted[weighted.length - 1])
        ? weighted[weighted.length - 1][0]
        : weighted[weighted.length - 1].id;
    },
    exportState() {
      return { s: state >>> 0 };
    },
    importState(st) {
      if (!st || typeof st.s !== "number") throw new Error("Invalid RNG state");
      state = st.s >>> 0;
    }
  };
}
