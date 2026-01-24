# TESTS KNOWLEDGE BASE

**Domain:** Verification & Simulation

## OVERVIEW
Integration tests running in Node.js environment to verify game flow and logic without a browser.

## STRUCTURE
```
tests/
├── playthrough.mjs   # Main simulation script (The "Golden Path")
├── test_seed.html    # Browser-based seed verification
└── test_state.html   # Browser-based state verification
```

## WORKFLOW
1. **Simulation**: `playthrough.mjs` simulates a player making choices.
2. **Assertions**: Uses simple `assert` functions to verify state changes.
3. **Execution**: `node tests/playthrough.mjs`

## CONVENTIONS
- **Node Compatibility**: Tests import modules. Ensure modules don't reference `window` at top level.
- **Deterministic**: Use fixed seeds to ensure reproducible runs.
