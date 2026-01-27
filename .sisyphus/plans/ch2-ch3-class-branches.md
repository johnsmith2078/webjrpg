# Ch2/Ch3 Class-Specific Branches (Keep Route)

## Context

### Original Request
Add class-specific branching content for Chapter 2 and Chapter 3 (keep-route), by:
- Adding a class-specific prompt to `ch2_waystation_intro` that grants unique class gear (new item IDs) and optionally a warrior-only skill unlock.
- Adding a class-specific prompt to `blacklight_heart_boss` that grants prep consumables then starts combat.
- Keeping tests deterministic across seeds/classes.

### Current Implementation References (baseline)
- Keep-route narrative + IDs: `story.md` (Act 6–Act 11) `story.md#L351`.
- Keep-route locations unlock rules: `modules/data.js#L61`.
- `ch2_waystation_intro` current: `modules/data.js#L823`.
- `blacklight_heart_boss` current: `modules/data.js#L939`.
- `ch3_ending` prompt and priority ladder: `modules/data.js#L952`.
- Prompt mechanics and requirements keys: `modules/events.js#L17`.
- Explore loop sets both `startCombat` and `prompt` if present: `modules/game.js#L211`.
- Keep-route playthrough assertions: `tests/playthrough.mjs#L854`.

### Constraints / Guardrails
- `story.md` remains truth source; `modules/data.js` mirrors it.
- No new engine mechanics/opcodes; only data/prompt/flags/items.
- Use `once` + `priority` for beats; use `requirements` and choice `requires` for gating.
- Avoid prompt+combat overlap: for boss prep, move `startCombat` into prompt choice ops (not event ops).

## Work Objectives

### Core Objective
Introduce meaningful class-specific choices in Ch2 and Ch3 keep-route via prompts, while preserving the existing keep-route progression and deterministic test suite.

### Concrete Deliverables
- `story.md`: Act 6 and Act 11 updated to describe the new class-specific prompts and outcomes.
- `modules/data.js`:
  - `ch2_waystation_intro` converted to a prompt event (still `once/priority`) granting class gear.
  - `blacklight_heart_boss` converted to a prompt event that starts combat from the chosen prompt option.
  - 3 new class gear items added to `DATA.items`.
- `tests/playthrough.mjs` updated to deterministically resolve new prompts and assert the new branch outcomes.
- Optional: extend `tests/run_all.mjs` to also run keep-route seed sweeps for `--class warrior`.

## New IDs (Proposed)

### New Items (add to `DATA.items`)
Use keep-route themed IDs and reuse existing equipment system (no auto-equip opcodes):
- `fogback_waystation_mail` (armor, warrior-oriented)
- `fogback_waystation_robe` (armor, mage-oriented)
- `fogback_waystation_harness` (armor, engineer-oriented)

Suggested stat budgets (tune as needed; keep modest to avoid breaking balance):
- `fogback_waystation_mail`: `stats: { def: 2, maxHp: 3 }`
- `fogback_waystation_robe`: `stats: { def: 1, maxMp: 4 }`
- `fogback_waystation_harness`: `stats: { def: 1, maxEn: 4 }`

Suggested tags (optional but consistent with existing tag-combo system):
- mail: `tags: ["armor", "rare"]`
- robe: `tags: ["armor", "magic", "rare"]`
- harness: `tags: ["armor", "tech", "rare"]`

### New Flags (Optional)
Avoid new flags unless needed for tests/debug. Preferred approach: assert inventory/skills directly.

If a flag is desired for boss-prep verification (optional):
- `ch3_heart_prepped` (generic) or `ch3_heart_prepped_<class>` (more specific)

### Skill Unlock (Optional)
Warrior-only unlock at the waystation using existing skill definition:
- set `skills_learned_sweep = true` (skill exists in `modules/data.js#L1609`).

## Verification Strategy

Project already has deterministic integration tests.

Primary commands:
```bash
node tests/playthrough.mjs --silent
node tests/playthrough.mjs --silent --ending keep
node tests/playthrough_seeds.mjs --seeds 20 --seed-base 1000 --ending keep
node tests/playthrough_seeds.mjs --seeds 20 --seed-base 1000 --class mage --ending keep
node tests/playthrough_seeds.mjs --seeds 20 --seed-base 1000 --class engineer --ending keep
node tests/run_all.mjs
```

## TODOs (Numbered, Step-by-Step)

### 1) Define the branch content and IDs in `story.md`

**What to edit**
- Update Act 6 (雾背驿站 / `ch2_waystation_intro`) in `story.md` to change “sets `ch2_rust_opened`” into:
  - `ch2_waystation_intro` becomes `(once/priority, prompt)`.
  - Prompt offers 3 class-specific options (warrior/mage/engineer) that each grant a unique gear item (the three new IDs).
  - Warrior option may additionally unlock `sweep` (explicitly call out it’s a skill flag).
  - Keep: still sets `ch2_rust_opened = true`.

- Update Act 11 (黑光心室 / `blacklight_heart_boss`) in `story.md` to:
  - Make it `(once/priority, prompt)`.
  - Prompt offers 3 class-specific preparation options that grant small consumables then starts combat `heart_pump_guardian`.
  - Explicitly state “prep happens before combat”.

**References to follow**
- Existing keep-route section: `story.md#L351`.
- Existing prompt beat style: `story.md#L410` (Ch3 ending prompt text).

**Acceptance criteria**
- `story.md` explicitly lists the new prompt choices and references the exact new item IDs.
- No new mechanics described beyond items/flags/consumables.

### 2) Add the class-gear prompt to `ch2_waystation_intro` in `modules/data.js`

**What to edit**
- In `DATA.events.ch2_waystation_intro` (`modules/data.js#L823`):
  - Keep `once: true`, `priority: 10`, `requirements: { flags: ["ch2_route_opened"] }`.
  - Keep existing narrative `text` and `ops` that set `ch2_rust_opened` (and `advanceTime`).
  - Add `prompt`:
    - `title`: recommend `"驿站"` (new; not used elsewhere).
    - `choices` (in this order):
      1. `id: "take_warrior_kit"` requires `{ flags: ["class_warrior"] }` → `gainItem fogback_waystation_mail` (+ optional `setFlag skills_learned_sweep`)
      2. `id: "take_mage_kit"` requires `{ flags: ["class_mage"] }` → `gainItem fogback_waystation_robe`
      3. `id: "take_engineer_kit"` requires `{ flags: ["class_engineer"] }` → `gainItem fogback_waystation_harness`
      4. Optional `id: "leave"` (no requires), no ops

**Why this structure**
- Prompt choices are gated by class flags; only one of the three kit choices will be enabled, so tests can auto-pick deterministically.

**References to follow**
- Prompt shape: `modules/data.js#L900` (`paper_atrium_imprint`).
- Choice gating with `requires`: `modules/data.js#L913` and `modules/events.js#L25`.

**Acceptance criteria**
- Running keep-route playthrough produces a prompt at `fogback_waystation` and selecting it grants exactly one class-appropriate gear item.

### 3) Add new class gear items to `DATA.items` in `modules/data.js`

**What to edit**
- Add 3 item definitions under `DATA.items` (near other equipment items):
  - `fogback_waystation_mail` (armor)
  - `fogback_waystation_robe` (armor)
  - `fogback_waystation_harness` (armor)

Each should include:
- `name` (CN), `tags`, `slot: "armor"`, `stats`, and `desc`.

**References to follow**
- Existing armor definitions: `modules/data.js#L168` and `modules/data.js#L169`.

**Acceptance criteria**
- Items appear in inventory UI and can be equipped (manual verification in browser).

### 4) Convert `blacklight_heart_boss` into a prep prompt that starts combat from the choice

**What to edit**
- In `DATA.events.blacklight_heart_boss` (`modules/data.js#L939`):
  - Replace current `ops: [{ op: "startCombat"... }, { op: "advanceTime"... }]` with a `prompt` that contains the combat start.
  - Keep `once: true`, `priority: 10`, and `requirements: { flags: ["ch3_imprint_done"] }`.
  - Recommended prompt:
    - `title`: `"心室"` (distinct from ending prompt title `"黑光"`)
    - `choices` (in this order):
      1. `id: "prep_warrior"` requires `{ flags: ["class_warrior"] }` → grant small consumables + `startCombat heart_pump_guardian` + `advanceTime 10`
      2. `id: "prep_mage"` requires `{ flags: ["class_mage"] }` → grant small consumables + `startCombat ...` + `advanceTime 10`
      3. `id: "prep_engineer"` requires `{ flags: ["class_engineer"] }` → grant small consumables + `startCombat ...` + `advanceTime 10`
      4. `id: "charge"` (no requires) → `startCombat ...` + `advanceTime 10`
  - Suggested consumables to grant (all already exist):
    - warrior: `warding_talisman x1`, `focus_tea x1`
    - mage: `health_potion x1`, `warding_talisman x1`
    - engineer: `warding_talisman x1`, `explosive_trap x1`

**Why this structure**
- Avoids the engine edge case where both combat and prompt are set from a single explore (see `modules/game.js#L233`).
- Allows tests to assert “prompt resolved, then combat begins” deterministically.

**References to follow**
- Prompt-to-combat from choice ops works because `choosePrompt` runs `applyOps` and then starts combat: `modules/game.js#L1214`.

**Acceptance criteria**
- When exploring `blacklight_heart`, the player sees a prompt before combat; selecting a choice starts combat.
- No state exists where both `state.prompt` and `state.combat` are active simultaneously after the explore step.

### 5) Update `tests/playthrough.mjs` for deterministic prompt resolution + new assertions

**What to edit**
- In `resolvePromptIfAny` (`tests/playthrough.mjs#L87`):
  - Optionally add a deterministic preference for the new prompt titles (recommended, but should not be strictly required if gating is correct):
    - If `title === "驿站"`: pick class kit choice (by checking enabled and matching class flag if needed).
    - If `title === "心室"`: pick class prep choice.
- In keep-route flow (`tests/playthrough.mjs#L864` onward):
  - After `fogback_waystation` explore + `resolvePromptIfAny`, assert the correct gear item is present based on `state.flags.class_*`.
  - At `blacklight_heart` step, after `game.handleChoice("explore")` + `resolvePromptIfAny(game)` and before `resolveCombat(game)`:
    - Assert `game.getState().combat` exists and `enemyId === "heart_pump_guardian"`.
    - Optionally assert the prep items were granted (but beware that `resolveCombat` may consume them; keep asserts before combat resolution).
  - If warrior sweep unlock is implemented, assert `skills_learned_sweep` for warrior in the keep-route.

**Why these asserts**
- Ensures the new class-specific branches are actually executed, not silently skipped.
- Directly verifies the prompt-before-combat ordering.

**Acceptance criteria**
- `node tests/playthrough.mjs --silent --ending keep` passes.
- `node tests/playthrough_seeds.mjs --seeds 20 --seed-base 1000 --class mage --ending keep` passes.
- `node tests/playthrough_seeds.mjs --seeds 20 --seed-base 1000 --class engineer --ending keep` passes.

### 6) (Optional but recommended) Extend `tests/run_all.mjs` to cover `--class warrior --ending keep`

**What to edit**
- Add an additional `run("node", ["tests/playthrough_seeds.mjs", ... "--class", "warrior", "--ending", "keep"])`.

**Acceptance criteria**
- `node tests/run_all.mjs` continues to pass.

## Self-Review Checklist (manual, before marking done)
- Prompt gating: for each new prompt, exactly one class option is enabled when a class flag is set.
- Boss event: `blacklight_heart_boss` does not set `startCombat` in event ops.
- No new opcodes.
- New item IDs referenced consistently in both `story.md` and `modules/data.js`.
