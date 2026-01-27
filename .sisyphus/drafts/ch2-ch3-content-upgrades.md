# Draft: Ch2/Ch3 Content + Upgrades

## Requirements (confirmed)
- Add more recipes (equipment + consumables).
- Add more small enemies + new drop materials.
- Increase combat density in Chapter 2/3 locations.
- Increase boss difficulty.
- Add an equipment upgrade module as a real module file (e.g. `modules/upgrades.js`) and integrate it via existing flows (likely blacksmith NPC service).

## Constraints (confirmed)
- Plan only: no code edits; no new dependencies.
- Preserve deterministic test stability across seeds.
- Prefer data-driven changes in `modules/data.js`; only touch engine where necessary.
- When increasing boss difficulty, avoid changing RNG consumption patterns drastically.

## Existing Context (user-provided)
- Blacksmith service exists: `DATA.npcs.blacksmith.dialogues.services.upgrade_weapon` (iron_blade + mats + gold -> master_blade).
- `npcService` currently consumes items without unequipping if item was equipped.
- Combat traits: only `evasion` implemented (semantics: skip enemy attack); `heavy_attack`/`curses`/`summon`/`high_def` are stubbed.
- Chapter 2/3 route exists and is tested.
- Oracle recommendation: prefer upgraded item variants vs per-item upgrade levels; implement missing traits with clear telegraphs; add repeatable combat events in ch2/ch3.

## Research Findings
- (pending) Explore agent: repo-specific patterns for content tables, encounters, bosses, traits.
- (pending) Librarian agent: best practices for deterministic RNG when adding content.

## Scope Boundaries
- INCLUDE: new IDs for items/enemies/recipes/events/flags needed for the requested content and upgrade module.
- EXCLUDE: new dependencies; major engine rewrites; changes that significantly alter RNG call counts in core loops.

## Open Questions
- Which existing bosses should be buffed (all chapter bosses, or only ch2/ch3 end bosses)?
- Any preferred theme for new items/materials/enemies in ch2/ch3 (rust-channel/lockyard/lower-works/mist-well/paper-atrium/blacklight-heart)?
- Should upgrade system cover only weapons initially, or weapons + armor + trinkets from day one?
