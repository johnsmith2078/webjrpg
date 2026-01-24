import { mountApp } from "./modules/ui.js";
import { loadOrInitState } from "./modules/save.js";
import { createGame } from "./modules/game.js";

const state = loadOrInitState();
const game = createGame({ state });
mountApp({ game });
