# Maximize Difficulty While Keeping Seeded Tests Passing (Normal-Player Playthrough)

## Context

### Original Request
- Increase gameplay difficulty (harder fights, more attrition, fewer grind exploits) while keeping all tests passing, including seeded sweep stability.
- Rewrite test playthrough to model “normal player” behavior (no consumable stockpiling), while remaining deterministic.
- Prefer data-first tuning (`modules/data.js`) and avoid RNG stream shape changes unless tests are updated.

### Key Repo Facts (verified)
- RNG: deterministic PRNG in `modules/seed.js`; the global RNG state is shared across explore/combat/event selection.
- Event selection consumes RNG once per explore via `modules/events.js:rollEventId()` → `rng.pickWeighted()`.
- Combat consumes RNG on many turns (e.g., `modules/combat.js:damage()` uses `rng.nextInt(0,2)`), so **changes that increase/decrease number of combat turns shift the RNG stream and can change subsequent events**.
- Rest: `modules/game.js:rest()` currently heals hp+8 mp+5 en+5 and costs +30 minutes; it is otherwise free.
- Economy: combat rewards fixed gold via `modules/combat.js:awardVictory()` reading `DATA.enemies[enemyId].gold`; crafting supports `outputs: { gold: N }` via `modules/crafting.js:craft()`.
- Exploit loop confirmed: `sell_ore` recipe in `modules/data.js` (3 `iron_ore` → 2 gold) enables ore→gold conversion.
- Tests to update:
  - `tests/playthrough.mjs` currently hoards (herbs=25 for mage/engineer; crafts `bound_charm` x4, `warding_talisman` x4, `focus_tea` x2; rests to full before bosses).
  - `tests/economy_quests.mjs` asserts current `sell_ore` yield.
  - `tests/crit_focus.mjs` asserts exact damage numbers; **do not change `DATA.enemies.bandit.def`** (or any combat math used by that test).

### High-Risk Changes + Safer Alternatives
- High risk: increasing enemy HP/DEF broadly (lengthens fights → changes RNG stream → can cascade into different event sequences and step-cap failures).
  - Safer: primarily increase enemy ATK / special deterministic pressure (more damage taken) while keeping HP/DEF changes minimal.
- High risk: adding hard costs/locks to rest (can brick runs that rely on pre-boss healing).
  - Safer: reduce per-rest healing and/or increase rest time cost; keep rest available everywhere.
- High risk: changing event weights `DATA.events[*].w` (can make doUntil loops hit limits).
  - Safer: keep weights largely intact; prefer economy tuning and deterministic rules in tests.

### Decision Point (required)
**[DECISION NEEDED] Test “Normal Player” prep policy**
- Option A (recommended default): bounded prep allowed.
  - Before any boss: allow crafting up to `bound_charm<=2`, `warding_talisman<=1`, `focus_tea<=1`, `explosive_trap<=1`.
  - General carry caps: `herbs<=6`, `onigiri<=6`, `health_potion<=4`.
  - No grinding purely to raise these caps.
- Option B: strict no-prep (true “no stockpiling”).
  - Only craft/collect consumables when immediately needed; carry caps near 0–1.

This decision affects how aggressive the difficulty knobs can be without making seed sweeps flaky.

## Task Dependency Graph

| Task | Depends On | Reason |
|------|------------|--------|
| Task 1 | None | Establish baseline, ensure current tests are green before tuning |
| Task 2 | Task 1 | Implement “normal player” test policy against known-good baseline |
| Task 3 | Task 2 | Update specific hoarding steps and assertions once policy scaffolding exists |
| Task 4 | Task 2 | Difficulty tuning should be paired with the new test behavior (no-hoard) |
| Task 5 | Task 4 | Rest tuning should be calibrated after baseline enemy/economy tuning is set |
| Task 6 | Task 4 | Optional anti-grind mechanics only if economy tuning alone is insufficient |
| Task 7 | Task 4 | Update economy test expectations after sell-rate changes |
| Task 8 | Tasks 3,4,5,7 | Full verification requires all changes in place |
| Task 9 | Task 8 | Only tune upward once the suite is stable at the initial targets |

## Parallel Execution Graph

Wave 1 (Start immediately):
├── Task 1: Baseline test run (no dependencies)
└── Task 2: Implement normal-player policy scaffold in `tests/playthrough.mjs` (depends on Task 1)

Wave 2 (After Wave 1 completes):
├── Task 3: Remove hoarding + adjust playthrough route (depends: Task 2)
└── Task 4: Data-first difficulty tuning in `modules/data.js` (depends: Task 2)

Wave 3 (After Wave 2 completes):
├── Task 5: Rest tuning in `modules/game.js` (depends: Task 4)
├── Task 7: Update `tests/economy_quests.mjs` (depends: Task 4)
└── Task 6: Optional anti-grind (depends: Task 4)

Wave 4 (After Wave 3 completes):
└── Task 8: Run full suite + seed sweeps (depends: Tasks 3,4,5,7)

Wave 5 (After Wave 4 completes):
└── Task 9: Iterative “push difficulty” loop (depends: Task 8)

Critical Path: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 8
Estimated Parallel Speedup: ~25% (Task 3 and Task 4 can be developed in parallel once policy is set)

## Tasks

### Task 1: Establish Baseline (Before Any Changes)
**Description**: Confirm the repo is currently green and capture baseline timing/failure modes.

**Files/Functions to inspect (no changes)**:
- `tests/run_all.mjs`
- `tests/playthrough_seeds.mjs`

**Delegation Recommendation:**
- Category: `quick` - read/run existing scripts, collect baseline
- Skills: [`git-master`] - useful for clean diffs + verifying touched files during execution

**Skills Evaluation:**
- INCLUDED `git-master`: helps keep changes atomic and auditable.
- OMITTED `agent-browser`: no browser automation needed.
- OMITTED `frontend-ui-ux`: no UI work.
- OMITTED `dev-browser`: no interactive browser testing.
- OMITTED `typescript-programmer`: repo is vanilla JS; not TS-specific.
- OMITTED `python-programmer`: not a Python task.
- OMITTED `svelte-programmer`: not a Svelte project.
- OMITTED `golang-tui-programmer`: not Go/TUI.
- OMITTED `python-debugger`: not Python.
- OMITTED `data-scientist`: no data pipeline.
- OMITTED `prompt-engineer`: no prompting work.

**Depends On**: None

**Acceptance Criteria**:
- `node tests/run_all.mjs` exits 0
- `node tests/playthrough_seeds.mjs 20 1000` exits 0
- Note baseline wall-clock runtime and any near-cap loops (200 combat actions, doUntil limits)

### Task 2: Add “Normal Player” Policy Scaffold to Playthrough
**Description**: Centralize policy in `tests/playthrough.mjs` so future tuning changes only alter caps/heuristics, not the whole script.

**Implementation Steps** (in `tests/playthrough.mjs`):
- Add a `NORMAL_PLAYER_POLICY` object defining:
  - carry caps (`herbs`, `onigiri`, `health_potion`, and combat consumables)
  - grinding limits (max explores in a location without progressing a flag milestone)
  - rest rules (when to rest; when *not* to rest)
- Add helper functions:
  - `wantItem(state, itemId)` returning false when at/above cap
  - `craftUpTo(game, recipeId, itemId, cap)` that crafts only up to cap and only if inputs already available
  - `shouldRest(state, context)` (e.g., pre-boss, or HP under threshold)
- Update `resolvePromptIfAny(game)` to handle specific prompts deterministically in line with policy:
  - `title === "游商"`: default to `leave` unless a required resource is missing *and* below cap
  - `title === "不祥"`: choose `cleanse` only if gold>=cost and curse is meaningfully dangerous under new tuning
  - Keep existing special-cases (`起源`, `岔路`, `流浪者`) but ensure they don’t force hoarding

**Why this order**: test policy should be explicit before gameplay tuning; otherwise tuning changes get conflated with ad-hoc test edits.

**Delegation Recommendation:**
- Category: `unspecified-low` - non-trivial integration test rewrite
- Skills: [`git-master`] - keep edits contained; assist with bisectability

**Skills Evaluation:**
- INCLUDED `git-master`: helps manage intertwined test changes safely.
- OMITTED `agent-browser`: tests are Node-based.
- OMITTED `frontend-ui-ux`: not UI.
- OMITTED `dev-browser`: not needed.
- OMITTED `typescript-programmer`: JS-only.
- OMITTED `python-programmer`: not Python.
- OMITTED `svelte-programmer`: not Svelte.
- OMITTED `golang-tui-programmer`: not Go.
- OMITTED `python-debugger`: not Python.
- OMITTED `data-scientist`: not data processing.
- OMITTED `prompt-engineer`: not LLM prompting.

**Depends On**: Task 1

**Acceptance Criteria**:
- `node tests/playthrough.mjs 123 --silent` exits 0 (baseline behavior unchanged yet)
- New policy constants exist and are referenced (no dead config)
- No new RNG calls or dependency additions

### Task 3: Rewrite Playthrough to Avoid Hoarding (Minimal but Complete)
**Description**: Remove explicit stockpiling loops and replace with bounded, just-in-time prep.

**Primary Edits** (in `tests/playthrough.mjs`):
- Remove/replace:
  - the `herbTarget = 25` branch and the doUntil loop that farms herbs to that target
  - `craftUntil(..., 4)` / `craftUntil(..., 4)` / `craftUntil(..., 2)` for boss consumables
- Replace with:
  - small caps from Task 2 (Decision Option A/B)
  - crafting only when approaching a boss and only up to cap
- Keep “must-have” gates intact:
  - ensure `bind_charm` craft still happens and still asserts input consumption
  - ensure required location unlocks still occur within doUntil limits
- Adjust resting behavior:
  - keep pre-boss rest *allowed* (normal player behavior), but prevent “rest to full after every small fight”

**Why this order**: this is the minimum change set to stop hoarding while still covering the full storyline.

**Delegation Recommendation:**
- Category: `unspecified-low`
- Skills: [`git-master`] - keep deltas readable; ensure seed sweeps still apply cleanly

**Skills Evaluation:**
- INCLUDED `git-master`: supports safe refactors.
- OMITTED `agent-browser`: no browser.
- OMITTED `frontend-ui-ux`: no UI.
- OMITTED `dev-browser`: no browser.
- OMITTED `typescript-programmer`: JS-only.
- OMITTED `python-programmer`: not Python.
- OMITTED `svelte-programmer`: not Svelte.
- OMITTED `golang-tui-programmer`: not Go.
- OMITTED `python-debugger`: not Python.
- OMITTED `data-scientist`: not data.
- OMITTED `prompt-engineer`: not prompting.

**Depends On**: Task 2

**Acceptance Criteria**:
- `tests/playthrough.mjs` contains **no** explicit “farm to 25 herbs” behavior
- `node tests/playthrough.mjs 123 --silent` exits 0
- Inventory snapshots during playthrough never exceed configured caps for the capped items

### Task 4: Data-First Difficulty Tuning (Enemy Pressure + Economy)
**Description**: Increase difficulty primarily by raising damage pressure and reducing grind profit, while minimizing RNG-stream-shape disruption.

**Files/Functions to change**:
- `modules/data.js`:
  - `DATA.enemies.*` (avoid changing `bandit.def`)
  - `DATA.recipes.sell_ore`
  - Optional: `DATA.events.village_trader` prices (only if tests stop auto-buying)

**Default Numeric Targets (v1)**

Enemy ATK (prefer ATK-only deltas; keep HP/DEF mostly stable):
- Early:
  - `bandit.atk`: 2 → 3
  - `wolf.atk`: 2 → 3
  - `oni_wisp.atk`: 3 → 4
- Mid:
  - `shadow_beast.atk`: 3 → 4
  - `cursed_miner.atk`: 4 → 5
  - `crystal_golem.atk`: 4 → 5
  - `clockwork_spider.atk`: 3 → 4
- Bosses:
  - `shrine_guardian.atk`: 4 → 5
  - `crystal_overseer.atk`: 4 → 5
  - `clockwork_titan.atk`: 6 → 7
  - `mine_warlord.atk`: 5 → 6

Enemy Gold (reduce non-boss grind profit; keep boss rewards meaningful):
- Reduce gold rewards by ~25% for non-boss roamers (round down, minimum 1).
- Keep story bosses within ±0–10% unless trader/service costs are also raised.

Ore→Gold minting (remove the “sell ore” exploit):
- `sell_ore` recipe: `inputs.iron_ore` stays 3; `outputs.gold`: 2 → 1
- `sell_ore` `timeCostMin`: 5 → 10 (so selling is a choice, not a free click)

Optional (only after tests stop auto-buying from trader):
- `village_trader` prices +1 gold across the board (herbs 2→3, charm 3→4, iron 5→6, wood 1→2)

**Why these knobs**:
- ATK increases raise attrition without necessarily lengthening fights (lower risk of RNG stream cascade vs HP/DEF buffs).
- Gold reductions and sell-rate nerf attack infinite-economy loops directly.

**Delegation Recommendation:**
- Category: `unspecified-high` - balancing across interconnected systems
- Skills: [`git-master`] - keep tuning commits reviewable and reversible

**Skills Evaluation:**
- INCLUDED `git-master`: essential for managing risky balance edits.
- OMITTED `agent-browser`: not needed.
- OMITTED `frontend-ui-ux`: no UI.
- OMITTED `dev-browser`: no browser.
- OMITTED `typescript-programmer`: JS data edits.
- OMITTED `python-programmer`: not Python.
- OMITTED `svelte-programmer`: not Svelte.
- OMITTED `golang-tui-programmer`: not Go.
- OMITTED `python-debugger`: not Python.
- OMITTED `data-scientist`: simple numeric tuning.
- OMITTED `prompt-engineer`: not prompting.

**Depends On**: Task 2

**Acceptance Criteria**:
- `node tests/crit_focus.mjs` exits 0 (guard against accidental combat-math regressions)
- `node tests/playthrough.mjs 123 --silent` exits 0 under the new normal-player policy

### Task 5: Rest Nerf (Attrition Without Hard Locks)
**Description**: Reduce free recovery so exploration/combat decisions matter more.

**Files/Functions to change**:
- `modules/game.js:rest()`

**Default Numeric Targets (v1)**
- Heal per rest:
  - hp: +8 → +5
  - mp: +5 → +3
  - en: +5 → +3
- Time cost: 30 → 45 minutes

**Notes**
- Do *not* add a gold/item cost in v1 (high risk of bricking runs); reserve that for an optional v2.

**Delegation Recommendation:**
- Category: `quick` - single-function numeric change
- Skills: [`git-master`] - ensure change is isolated

**Skills Evaluation:**
- INCLUDED `git-master`: keeps the edit clean.
- OMITTED `agent-browser`: no browser.
- OMITTED `frontend-ui-ux`: no UI.
- OMITTED `dev-browser`: no browser.
- OMITTED `typescript-programmer`: JS.
- OMITTED `python-programmer`: not Python.
- OMITTED `svelte-programmer`: not Svelte.
- OMITTED `golang-tui-programmer`: not Go.
- OMITTED `python-debugger`: not Python.
- OMITTED `data-scientist`: no.
- OMITTED `prompt-engineer`: no.

**Depends On**: Task 4

**Acceptance Criteria**:
- `node tests/playthrough.mjs 123 --silent` exits 0
- Seed sweep (`node tests/playthrough_seeds.mjs 20 1000`) exits 0

### Task 6: Optional Anti-Grind Mechanic (Only If Needed)
**Description**: Add a deterministic penalty for excessive time spent grinding, without adding RNG calls.

**Trigger condition**: Even after Task 4+5, a player can still trivially grind gold/resources and outscale difficulty.

**Option 6A (preferred): time-based enemy ATK bonus, no HP changes**
- Implement in `modules/combat.js:startCombat()` or enemy-damage path:
  - compute `threatTier = clamp(floor((state.timeMin - 120)/120), 0, 3)`
  - apply `enemyAtkBonus += threatTier` (already exists in combat state)
  - do **not** increase enemy HP/DEF

**Why**: discourages long grinding; minimal RNG stream interaction (same number of calls).

**Delegation Recommendation:**
- Category: `unspecified-low` - small engine change with system-wide impact
- Skills: [`git-master`] - manage risk

**Skills Evaluation:**
- INCLUDED `git-master`: safety.
- OMITTED `agent-browser`: no.
- OMITTED `frontend-ui-ux`: no.
- OMITTED `dev-browser`: no.
- OMITTED `typescript-programmer`: JS.
- OMITTED `python-programmer`: no.
- OMITTED `svelte-programmer`: no.
- OMITTED `golang-tui-programmer`: no.
- OMITTED `python-debugger`: no.
- OMITTED `data-scientist`: no.
- OMITTED `prompt-engineer`: no.

**Depends On**: Task 4

**Acceptance Criteria**:
- All tests still pass, especially seed sweeps
- No new RNG calls introduced

### Task 7: Update Minimal Economy Tests
**Description**: Keep unit/integration expectations consistent with the new economy.

**Files to change**:
- `tests/economy_quests.mjs:testSellOre()` expected gold

**Change**:
- Update `assert(next.player.gold === 2, ...)` to match the new `sell_ore` yield (default v1: 1).

**Delegation Recommendation:**
- Category: `quick`
- Skills: [`git-master`]

**Skills Evaluation:**
- INCLUDED `git-master`: keeps change minimal.
- OMITTED `agent-browser`: no.
- OMITTED `frontend-ui-ux`: no.
- OMITTED `dev-browser`: no.
- OMITTED `typescript-programmer`: JS.
- OMITTED `python-programmer`: no.
- OMITTED `svelte-programmer`: no.
- OMITTED `golang-tui-programmer`: no.
- OMITTED `python-debugger`: no.
- OMITTED `data-scientist`: no.
- OMITTED `prompt-engineer`: no.

**Depends On**: Task 4

**Acceptance Criteria**:
- `node tests/economy_quests.mjs` exits 0

### Task 8: Full Verification (Including Seed Sweeps)
**Description**: Prove determinism and stability after difficulty + test policy changes.

**Commands**:
- `node tests/run_all.mjs`
- `node tests/playthrough_seeds.mjs 20 1000`
- `node tests/run_all.mjs --seeds 50 --seed-base 2000`

**Delegation Recommendation:**
- Category: `quick`
- Skills: [`git-master`]

**Skills Evaluation:**
- INCLUDED `git-master`: helps correlate failures to commits.
- OMITTED `agent-browser`: no.
- OMITTED `frontend-ui-ux`: no.
- OMITTED `dev-browser`: no.
- OMITTED `typescript-programmer`: JS.
- OMITTED `python-programmer`: no.
- OMITTED `svelte-programmer`: no.
- OMITTED `golang-tui-programmer`: no.
- OMITTED `python-debugger`: no.
- OMITTED `data-scientist`: no.
- OMITTED `prompt-engineer`: no.

**Depends On**: Tasks 3,4,5,7

**Acceptance Criteria**:
- All commands exit 0
- Seed sweeps report 0 failures
- No loop hits per-combat 200 action cap

### Task 9: “Push Difficulty Until the Edge” Tuning Loop
**Description**: Iteratively increase difficulty in controlled increments while preserving 0-failure seed sweeps.

**Process**
1. Start from v1 targets (Task 4+5).
2. Increase difficulty in *one dimension at a time*:
   - Step A: +1 ATK on one tier of enemies (mid or bosses)
   - Step B: reduce rest healing by 1 (hp/mp/en) or +5 minutes
   - Step C: further reduce non-boss gold by ~10%
3. After each step, run:
   - `node tests/playthrough_seeds.mjs --seeds 20 --seed-base 1000`
4. Stop when:
   - any seed fails, or
   - combats start flirting with 200-action cap, or
   - doUntil loops approach their limits.
5. Back off the last change by one notch and lock the tuning.

**Delegation Recommendation:**
- Category: `ultrabrain` - balancing with deterministic constraints and brittle caps
- Skills: [`git-master`] - required to manage iterative tuning safely

**Skills Evaluation:**
- INCLUDED `git-master`: essential during iterative tuning.
- OMITTED `agent-browser`: no.
- OMITTED `frontend-ui-ux`: no.
- OMITTED `dev-browser`: no.
- OMITTED `typescript-programmer`: JS.
- OMITTED `python-programmer`: no.
- OMITTED `svelte-programmer`: no.
- OMITTED `golang-tui-programmer`: no.
- OMITTED `python-debugger`: no.
- OMITTED `data-scientist`: no.
- OMITTED `prompt-engineer`: no.

**Depends On**: Task 8

**Acceptance Criteria**:
- After final tuning, `node tests/run_all.mjs --seeds 50 --seed-base 2000` exits 0
- Difficulty is measurably higher vs baseline:
  - Average rests per run increases, or
  - Gold at end-of-run is lower, or
  - HP lows observed more often in snapshots

## Commit Strategy

- Commit 1: “tests: implement normal-player playthrough policy”
  - Files: `tests/playthrough.mjs`
  - Verify: `node tests/playthrough.mjs 123 --silent`
- Commit 2: “balance: nerf ore-to-gold and increase enemy pressure”
  - Files: `modules/data.js`
  - Verify: `node tests/crit_focus.mjs` + `node tests/playthrough.mjs 123 --silent`
- Commit 3: “balance: reduce rest recovery”
  - Files: `modules/game.js`
  - Verify: `node tests/playthrough_seeds.mjs 20 1000`
- Commit 4: “tests: update economy expectations”
  - Files: `tests/economy_quests.mjs`
  - Verify: `node tests/economy_quests.mjs`

## Success Criteria

Functional
- The game is harder in the intended ways:
  - more damage pressure in fights
  - weaker free recovery via rest
  - reduced profitability of repeatable ore/gold loops
- No added dependencies.

Determinism + Tests
- `node tests/run_all.mjs` exits 0
- `node tests/playthrough_seeds.mjs --seeds 50 --seed-base 2000` exits 0
- Playthrough test policy enforces “normal player” caps (no consumable stockpiling)
