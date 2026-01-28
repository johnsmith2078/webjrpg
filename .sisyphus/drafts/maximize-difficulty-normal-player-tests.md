# Draft: Maximize Difficulty + Normal-Player Tests

## Requirements (confirmed)
- Goal: maximize difficulty while keeping all tests passing; update tests/playthrough to reflect normal-player behavior (no consumable stockpiling).
- Determinism: seeded RNG (`modules/seed.js`); avoid RNG stream shape changes unless tests updated.
- Difficulty knobs: enemy stats/traits, rest heal, event weights, crafting/economy loops.
- Known exploit loops: repeatable combat + free rest (infinite gold); ore->gold via `sell_ore`; herbs->gold and herbs->consumables; rice->onigiri.
- Existing tests currently hoard/stack: herbs target 25; craft `bound_charm` x4, `warding_talisman` x4, `focus_tea` x2, etc.
- Current balance context: focus shifted away from crit/sure-hit to damage boost; fog DoT exists for enemies with trait `fog`; `fog_mask` immune; `fogward` blocks DoT.
- Rest is strong/free except time: hp+8 mp+5 en+5 for 30 min (`modules/game.js`).
- Playthrough test caps: per-combat 200 actions; doUntil caps; seed sweeps must have 0 failures.

## Technical Decisions (proposed, not yet confirmed)
- Prefer data-first tuning via `modules/data.js` (enemy definitions, recipes, event weights) over deep refactors.
- Avoid introducing new RNG calls; change numeric tuning and deterministic gating instead.

## Repo Findings (observed)
- Rest is implemented in `modules/game.js` as `rest()` and is currently hp+8, mp+5, en+5, time+30min.
- Combat gold/loot is awarded in `modules/combat.js` via `awardVictory()`; gold is a flat `DATA.enemies[enemyId].gold`.
- `sell_ore` exists as a craft recipe in `modules/data.js` (3 iron_ore -> 2 gold, 5 min) and also as an NPC service under `DATA.npcs.blacksmith.dialogues.services.sell_ore`.
- Event selection uses `rng.pickWeighted()` in `modules/events.js:rollEventId()`; changing combat length changes RNG consumption (player/enemy attacks consume RNG), which can shift later event rolls.
- Main playthrough hoards heavily in `tests/playthrough.mjs`:
  - herbTarget is 25 for mage/engineer (`tests/playthrough.mjs` sets `herbTarget` based on class)
  - crafts `bound_charm` to 4, `warding_talisman` to 4, `focus_tea` to 2 via `craftUntil()`
  - rests to full HP before bosses via loops calling `game.handleChoice("rest")`.
- `tests/economy_quests.mjs` asserts `sell_ore` yields exactly 2 gold today (will need updating if sell rate changes).

## Open Questions
- How strict should “no stockpiling” be in tests: zero long-term reserves, or small bounded prep allowed?
- Should “maximize difficulty” preserve current win rates across seed sweeps, or accept increased flakiness risk (not allowed)?

## Scope Boundaries
- INCLUDE: difficulty tuning + exploit mitigation; test rewrite for normal-player policy; keep determinism and seed sweeps.
- EXCLUDE: removing/relaxing seed sweeps; adding deps; deep engine refactors unless necessary for deterministic caps.
