# TESTS KNOWLEDGE BASE

**Domain:** Verification & Simulation

## OVERVIEW
Integration tests running in Node.js environment to verify game flow and logic without a browser.

## STRUCTURE
```
tests/
├── playthrough.mjs   # Main simulation script (The "Golden Path")
├── playthrough_seeds.mjs # Stability test: run playthrough across many seeds
├── class_paths.mjs   # Branch tests for Mage/Engineer/Warrior crafting paths
├── run_all.mjs       # Convenience runner (class_paths + playthrough + seeds)
├── test_seed.html    # Browser-based seed verification
└── test_state.html   # Browser-based state verification
```

## WORKFLOW
1. **Simulation**: `playthrough.mjs` simulates a player making choices.
2. **Assertions**: Uses simple `assert` functions to verify state changes.
3. **Execution**:
   - `node tests/playthrough.mjs`
   - `node tests/playthrough.mjs 123 --silent`
   - `node tests/class_paths.mjs`
   - `node tests/playthrough_seeds.mjs 20 1000` (N seeds, seed base)
   - `node tests/playthrough_seeds.mjs --seeds 20 --seed-base 1000`
   - `node tests/run_all.mjs`
   - `node tests/run_all.mjs --seeds 50 --seed-base 2000`

## CONVENTIONS
- **Node Compatibility**: Tests import modules. Ensure modules don't reference `window` at top level.
- **Deterministic**: Use fixed seeds to ensure reproducible runs.
