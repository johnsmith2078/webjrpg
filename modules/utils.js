export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function deepCopy(x) {
  return JSON.parse(JSON.stringify(x));
}

export function nowId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function hasAllFlags(state, flags) {
  if (!Array.isArray(flags) || flags.length === 0) return true;
  for (const f of flags) {
    if (!state.flags[f]) return false;
  }
  return true;
}
