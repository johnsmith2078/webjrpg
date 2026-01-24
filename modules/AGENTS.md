# MODULES KNOWLEDGE BASE

**Domain:** Core Game Engine & Logic

## OVERVIEW
Contains all game logic, state management, and data definitions. Pure logic separated from UI.

## STRUCTURE
```
modules/
├── data.js           # Content definitions (Items, Enemies, Recipes)
├── game.js           # Main Coordinator & Loop
├── state.js          # State Schema & Initializer
├── combat.js         # Combat Resolution
├── crafting.js       # Crafting Logic
├── events.js         # Event Triggering & Resolution
├── world.js          # Travel & Location Logic
├── ui.js             # DOM Rendering (The only file touching DOM)
└── save.js           # Persistence (localStorage)
```

## CONVENTIONS
- **State Immutability**: While not strictly enforced, functions should treat state as mutable but predictable.
- **Dependency Injection**: `DATA` is imported; `state` is passed.
- **Op Codes**: Events use operation objects (`{ op: "gainItem", ... }`) to modify state, handled in `events.js`.

## ANTI-PATTERNS
- **Direct DOM Access**: ONLY `ui.js` may touch `document` or `window`.
- **Logic in Data**: `data.js` should contain objects, not functions (use ops).
