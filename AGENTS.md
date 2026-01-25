# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-25
**Type:** Browser-based RPG (Vanilla JS)

## OVERVIEW
"WebJRPG" is a text-based role-playing game running entirely in the browser using ES Modules.
No build step required. Relies on `story.md` as the single source of truth for narrative and game data.

## STRUCTURE
```
./
├── modules/          # Game engine, logic, and state management
├── tests/            # Integration scripts and test runners
├── story.md          # DESIGN DOC & TRUTH SOURCE (Read this first!)
├── main.js           # App bootstrap
└── index.html        # Entry point
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| **Game Design** | `story.md` | Logic/Data MUST match this file |
| **Content/Data** | `modules/data.js` | Items, enemies, recipes, events |
| **Game Loop** | `modules/game.js` | Input handling, turn resolution |
| **UI Rendering** | `modules/ui.js` | DOM manipulation |
| **State Schema** | `modules/state.js` | Initial state structure |

## CONVENTIONS
- **ES Modules**: Use `import/export` syntax. No webpack/babel.
- **Vanilla JS**: No frameworks (React/Vue). Direct DOM manipulation in `ui.js`.
- **Data-Driven**: Logic should be generic; content lives in `data.js`.
- **State Passing**: Functions rarely hold state; pass `state` object as argument.

## ANTI-PATTERNS
- **Global State**: Avoid `window` globals. Use passed `state` object.
- **Hardcoded Strings**: Move display text to `data.js` or `story.md`.
- **Complex UI**: Keep DOM structure simple (see `index.html`).

## COMMANDS
```bash
# Run Development
# Open index.html in browser

# Run Integration Tests
node tests/playthrough.mjs

# Run Playthrough With Explicit Seed (silent)
node tests/playthrough.mjs 123 --silent

# Run Branch Path Tests (Mage/Engineer/Warrior)
node tests/class_paths.mjs

# Run Playthrough Across Many Seeds (N seeds, seed base)
node tests/playthrough_seeds.mjs 20 1000

# Run Playthrough Across Many Seeds (flag form)
node tests/playthrough_seeds.mjs --seeds 20 --seed-base 1000

# Run All Tests (convenience)
node tests/run_all.mjs

# Run All Tests (custom seed sweep)
node tests/run_all.mjs --seeds 50 --seed-base 2000
```
