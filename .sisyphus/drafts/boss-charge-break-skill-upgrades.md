# Draft: Boss Charge/Break + Skill Upgrades

## Requirements (confirmed)
- Implement mechanics:
  - Boss charging mechanic with telegraph.
  - Boss break/weakness window mechanic.
  - Interactions:
    - `bound_charm` interrupts charging.
    - `defend` reduces charged damage.
  - Skill upgrade mechanism.
- Work within current codebase conventions:
  - Combat logic in `modules/combat.js` (has `defend`, `enemyStun`, `statusEffects`, `ward` reduction, skill application).
  - `bound_charm` currently applies `enemyStun`.
  - NPC services exist and can grant items/gold/skills; can be extended to apply skill upgrades.
- Deterministic test stability is critical:
  - Avoid introducing new RNG calls, or strictly control them.
  - Seeded tests exist and must remain stable.
- Skill upgrades must be accessible in gameplay (NPC services OK) and must measurably affect combat.

## Existing Code/Content Findings (confirmed)
- Combat:
  - `modules/combat.js`:
    - Combat state includes `defending`, `enemyStun`, `enemyAtkDown`, `enemyAtkBonus`, `enraged`, and `statusEffects` for player-side buffs (`ward`, `stealth`, `crit_boost`, etc.).
    - `defend` sets `c.defending=true` and provides `bonusDef=2` during enemy damage calculation.
    - `ward` reduces incoming damage by `floor(enemy.atk * 0.5)`.
    - Enemy attack damage consumes RNG via `damage()` which calls `rng.nextInt(0, 2)`.
    - `bound_charm` is a combat item (`combat.type: "stun"`) that sets `c.enemyStun` and also deals small RNG-based damage.
    - Boss-specific deterministic enrage exists for `works_guardian` and `heart_pump_guardian` (no extra RNG) in `modules/combat.js`.
- Enemies:
  - `modules/data.js` defines bosses:
    - `works_guardian` traits: `["heavy_attack"]`.
    - `heart_pump_guardian` traits: `["heavy_attack", "curses", "summon"]`.
  - `story.md` already describes `heavy_attack` as telegraphed (“它开始蓄力。” next turn heavy hit) and counters (`defend`, `warding_talisman`, `stealth`, `bound_charm`, etc.).
- NPC services:
  - `modules/events.js` implements `{ op: "npcService" }` and supports `service.gives.item/items/gold/skill`.
  - Equipment upgrade services already exist under `DATA.npcs.blacksmith.dialogues.services.*` in `modules/data.js`.
  - `modules/upgrades.js` currently supports equipment swap-on-consume for services (`consumeItemsWithUnequip`, `autoEquipFromGiven`).
- Skills:
  - Skills are data-driven in `modules/data.js` under `skills`.
  - Learned skills are stored as flags: `flags.skills_learned_<skillId>`.
  - Combat skill effects are implemented in `modules/combat.js::handleSkill`.
- Tests & RNG:
  - RNG is deterministic mulberry32 in `modules/seed.js`.
  - Integration tests include `tests/playthrough.mjs`, `tests/playthrough_seeds.mjs`, and `tests/upgrades.mjs`.
  - `tests/upgrades.mjs` validates NPC service-driven equipment upgrade behavior.

## Open Questions
- Charge cadence: should bosses with `heavy_attack` charge on a fixed turn cycle (e.g., every 3 enemy turns), based on HP thresholds, or both?
- Break trigger: should break/weakness window be triggered only by interrupting a charge (`bound_charm`), or also by specific player skills/items (e.g., `explosive_trap`), or by a deterministic “break gauge” threshold?
- Break effect: should it be (A) increased damage taken, (B) reduced enemy defense, (C) enemy skip-turn, or (D) a combination?
- Skill upgrade scope: which skills must be upgradable in v1 (all learned skills, or a curated subset tied to chapters 2/3)?
- Upgrade acquisition UX: do you prefer upgrades as NPC services only, or also as craftable “tomes/charms” recipes?

## Scope Boundaries
- INCLUDE: mechanics (charge + telegraph), break/weakness window, interactions with `bound_charm` and `defend`, skill upgrade mechanism integrated into gameplay, tests updates/additions, RNG determinism mitigations.
- EXCLUDE: full implementation of `curses` and `summon` traits beyond what is strictly needed to support the new boss mechanics (unless explicitly requested).
