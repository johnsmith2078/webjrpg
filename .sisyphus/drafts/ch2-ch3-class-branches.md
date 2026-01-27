# Draft: Ch2/Ch3 Class-Specific Branches

## Requirements (confirmed)
- Add class-specific branches in Chapter 2 and Chapter 3 (keep-route).
- Keep `story.md` as truth source; mirror content/data in `modules/data.js`.
- Use existing event system: `once`/`priority`, `prompt` choices with `requires` / `requirements`.
- Avoid new mechanics / engine changes unless strictly necessary.
- Keep tests deterministic across seeds and classes; update tests accordingly.

## Repo Facts (confirmed)
- Class is represented by flags on `state.flags`: `class_warrior`, `class_mage`, `class_engineer`.
- Prompt requirements support `flags`, `gold`, `item`+`qty`, `items`.
- If an event has both `startCombat` and `prompt`, explore() will start combat and still set prompt; so boss-prep must move `startCombat` into prompt choice ops.

## Candidate Changes (proposed)
- `modules/data.js`:
  - Add `prompt` to `ch2_waystation_intro` with 3 class-gated choices that grant new class gear (new item IDs).
  - Change `blacklight_heart_boss` to be a prompt (class-gated prep choices) and move `startCombat` into choice ops.
  - Add new item IDs under `DATA.items`.
- `story.md`:
  - Update Act 6 (`ch2_waystation_intro`) to document prompt + gear outcomes.
  - Update Act 11 (`blacklight_heart_boss`) to document prompt prep choices before combat.
  - Add any new item IDs / flags to the reference sections if appropriate.
- `tests/`:
  - Update `tests/playthrough.mjs` to handle new prompt titles deterministically and assert class gear gained.
  - Ensure seed-sweep tests cover keep-route for each class (likely via `tests/playthrough_seeds.mjs --class ... --ending keep`).

## Open Questions
- Exact IDs and stats for the three new class gear items (weapon vs armor; stat budget; tags like magic/tech/rare).
- Whether to unlock a warrior-only skill (candidate: existing `sweep`) at the waystation.
- Whether boss-prep should also be class-gated to grant different consumables per class, or keep a shared set.

## Scope Boundaries
- INCLUDE: prompt-based narrative branches in Ch2 and Ch3 keep-route; new items; test updates.
- EXCLUDE: new opcodes, new UI modes, new combat mechanics, new state schema fields.
