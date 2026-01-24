import { createInitialState } from "./state.js";

const KEY = "sisyphus_jrpg_save_v1";

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, state }));
  } catch (_) {
    // ignore
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.state) return null;
    return parsed.state;
  } catch (_) {
    return null;
  }
}

export function loadOrInitState() {
  const s = loadState();
  if (s && s.version === 5) return s;
  // seed from URL ?seed=...
  const url = new URL(window.location.href);
  const seedParam = url.searchParams.get("seed") || "";
  return createInitialState(seedParam || Date.now());
}

export function exportState(state) {
  return JSON.stringify({ version: 1, state }, null, 2);
}

export function importState(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== "object" || !parsed.state) {
    throw new Error("Invalid save JSON");
  }
  return parsed.state;
}
