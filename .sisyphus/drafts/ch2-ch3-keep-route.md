# Draft: Ch2/Ch3 Keep-Route Alignment

## Requirements (confirmed)
- Update `story.md` to match `story_ch2_ch3.md` for Chapter 2/3 keep-route narrative beats.
- Treat `story.md` as the single source of truth; logic/data must align to it.
- Align/implement game logic for Chapter 2/3 keep-route using repo patterns:
  - Data tables: `modules/data.js`
  - Ops handled: `modules/events.js`
  - Travel unlock: `modules/state.js` + `modules/world.js`
  - Combat victory flags: `modules/combat.js`
  - Tests: `tests/*.mjs`
- No new dependencies; planning only (no code changes in this session).

## Known Current State (from user)
- `modules/data.js` already has Ch2/Ch3 scaffolding:
  - Locations: `fogback_waystation`, `rust_channel`, `lockyard`, `lower_works`, `mist_well`, `paper_atrium`, `blacklight_heart` (with unlock flags)
  - Events: `pass_ending` sets `ending_keep` + `ch2_route_opened` (no endGame);
    `ch2_waystation_intro`, `lockyard_chest`, `lower_works_guardian`, `ch3_mist_well_intro`, `paper_atrium_imprint`, `blacklight_heart_boss`, `ch3_ending`
  - Enemies: `works_guardian`, `heart_pump_guardian`

## Potential Mismatches / Gaps (to resolve)
- `story.md` unlock rules:
  - Says `mountain_pass` unlock requires `shrine_cleansed` + 3 boss flags
  - Code currently unlocks `mountain_pass` by `shrine_cleansed` only; `pass_ending` requires `shrine_cleansed` only
- `lockyard_chest` choice design:
  - `story_ch2_ch3.md` describes a 'cursed' cost vs detour/time trade
  - Current event has only open/leave and no cursed/time system
- Flag registry drift:
  - `story.md` lacks flag `defeated_works_guardian` but code uses it
- `spirit_stone` consumption:
  - `paper_atrium_imprint` and `ch3_ending` require `spirit_stone` but ops do not consume it; decision needed per updated `story.md`
- Tests:
  - `tests/playthrough.mjs` ends via `prompt:seal`; needs deterministic coverage for keep route + Ch2/Ch3 completion (`prompt:reset`/`bind`/`smash`) while keeping existing seal path coverage

## Open Questions
- Is `spirit_stone` intended to be consumed (single-use) at `paper_atrium_imprint` and/or at `ch3_ending`, or is it a key item that persists?

## Scope Boundaries
- INCLUDE: Updating narrative spec + aligning data/events/unlocks/combat flags + expanding deterministic tests for keep-route.
- EXCLUDE: New dependencies; unrelated refactors; adding new chapters/routes beyond keep-route Ch2/Ch3.
