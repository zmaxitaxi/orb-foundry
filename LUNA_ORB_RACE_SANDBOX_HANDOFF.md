# Luna implementation brief: Orb Race sandbox ability composition

Implement the gameplay half of Orb Foundry's Orb Race sandbox architecture. Do not redesign the settings model or introduce combo orb IDs—the data/UI/simulation spawning/audio metadata seams already exist.

## Read first

- `AGENTS.md`
- `progress.md`
- `src/orb-race.js`
- `src/simulation.js`
- `src/audio.js`
- `src/main.js`
- `src/social-renderer.js`
- relevant Orb Race blocks in `tests/features.test.mjs`, `tests/simulation.test.mjs`, and `tests/social.test.mjs`

## Existing architecture you must preserve

- Stable base IDs remain unchanged. Splodey is still the stable ID `mines`, Lazer is still `lazer`, and Speedster is still `speed`.
- `raceTeamOptions[teamIndex][orbId].count` is an integer from 1–50. `createSimulation` already expands it into independent fighters with `raceCopyIndex`.
- `raceTeamOptions[teamIndex][orbId].comboAbilities` stores borrowed stable ability IDs.
- Allowed combo ability IDs are exported as `ORB_RACE_COMBO_ABILITY_IDS`: `speed`, `gravity`, `fibonacci`, `lazer`, `mines`, `grower`, and `sticky`.
- Every racer has `raceAbilityIds`, beginning with its base `raceOrbId` followed by borrowed abilities.
- Use `raceHasAbility(racer, abilityId)` for composable mechanics. Do not create names like `fibonacci-speedster` or clone `ORB_RACERS` definitions.
- Simulation events automatically inherit `raceAbilityIds`. Existing event types route to existing sound samples. `samplePlanForEvent` already recognizes a borrowed Fibonacci ability for math-bounce audio.
- Seeded fixed-step determinism is mandatory. Use only `sim.raceRng`/the simulation RNG for gameplay randomness.
- Legacy URLs without counts or combo abilities must remain one copy with only the base ability.

## Required gameplay implementation

Refactor only the seven composable abilities out of direct base-ID coupling. A base orb and a borrowed version must execute the same ability rule, state transition, projectiles, visuals, and audio event. Preserve every other orb's behavior.

1. **Speedster ability (`speed`)**
   - Every qualifying bounce increases speed.
   - It must work when borrowed by Fibonacci, Lazer, Splodey, Grower, Sticky, or Gravity.
   - A Splodey with Speedster should move/ramp quickly while still dealing damage only through bombs.

2. **Gravity ability (`gravity`)**
   - Every qualifying bounce increases gravity level and changes real arc physics.
   - Borrowing Gravity must not replace the base orb's damage/weapon rule.

3. **Fibonacci ability (`fibonacci`)**
   - Treat Fibonacci as the racer's damage-scaling policy.
   - A Sticky + Fibonacci must use Fibonacci-scaled damage for every legitimate sticky damage tick.
   - A Lazer + Fibonacci must use Fibonacci-scaled beam damage.
   - Projectile-only bases such as Splodey should apply Fibonacci scaling to their weapon damage, not body collisions.
   - Ensure only qualifying ramp bounces advance the Fibonacci sequence once. Sticky ticks, beam ticks, projectile travel, and duplicate audio events must not advance it.

4. **Lazer ability (`lazer`)**
   - Borrowing Lazer adds the rotating beam while retaining the base orb's body/weapon behavior.
   - A base Lazer remains projectile-only for body collisions, but a non-Lazer base that borrows Lazer retains its normal body damage unless its own base rule is projectile-only.
   - Beam damage should use the composed damage policy (including Fibonacci when present).

5. **Splodey ability (`mines`)**
   - Borrowing Splodey adds the existing timed bomb volley and independent bomb projectiles.
   - Bomb count/damage ramp on qualifying bounces exactly as base Splodey does.
   - A base Splodey remains projectile-only; another base borrowing Splodey keeps its original collision rule and gains bombs.

6. **Grower ability (`grower`)**
   - Every qualifying bounce increases visual/physical scale using the existing Grower increment.
   - Borrowing Grower must not change the racer's base color, symbol, announcement, or stable ID.

7. **Sticky ability (`sticky`)**
   - Borrowing Sticky adds the existing predetermined stick levels/tick behavior.
   - Sticky ticks must emit `race-sticky-tick` and use the composed damage policy.
   - Sticky damage ticks do not count as bounces, advance ability ramps, or create bounce/trail effects.

## Refactor guidance

- Introduce small helpers in `simulation.js`, for example:
  - `raceUsesProjectileOnlyBodyDamage(racer)` based on the **base** orb ID;
  - `advanceRaceDamagePolicy(racer, orb, context)` for normal/Fibonacci scaling;
  - `composedRaceDamage(racer, channel)` for body, beam, sticky, and bomb channels;
  - `advanceComposableRaceAbilities(sim, racer, orb, bounceContext)` called exactly once per qualifying bounce.
- Keep base-identity-only visuals and announcements checking `raceOrbId`; switch gameplay ability checks to `raceHasAbility`.
- Initialize all state required by borrowed abilities for every fighter, not only when the base ID matches. Dormant state is acceptable and deterministic.
- Timed abilities (Lazer/Splodey) must be advanced once per racer per fixed step. Do not start multiple timers because the ability appears in both base and borrowed lists.
- All projectiles must retain owner fighter/team identity so quantities of the same base orb behave independently.
- For 10+ fighters, make no physics rule depend on DOM order or render frame rate.

## Audio requirements

- Reuse existing samples and event names. Do not generate new combo audio.
- Emit the original ability event when a borrowed ability activates (`race-laser-hit`, `race-mine-drop`, `race-mine-explosion`, `race-sticky-tick`, `race-gravity-change`, and normal/math `race-bounce`).
- Include `raceAbilityId` when one event needs to identify the ability responsible; the shared event builder already includes `raceAbilityIds`.
- Rate limiting must continue to distinguish independent same-type racers through fighter/orb IDs. Five Splodeys must not globally silence one another's bomb/bounce cues.

## Renderer/HUD requirements

- Keep the base orb's color, symbol, name, and announcement.
- Add a compact `COMBO: SPEED + FIB + …` HUD line only when borrowed abilities exist; fit or truncate safely for teams with many racers.
- Render borrowed Lazer, Splodey projectiles, Grower scale, and Sticky effects using the existing visual functions. Convert renderer ability guards from base-ID checks only where needed to show a borrowed ability.
- Team labels should retain quantity formatting such as `5× SPLODEY`. Teams with multiple base types continue using existing grouping rules.
- Total team damage/sec must include every independently spawned copy and every active borrowed projectile/beam/tick channel.

## Tests to add

- Five Splodeys create five independent fighters, independent bomb timers/projectiles, deterministic positions, and aggregate DPS.
- Same seed plus the same counts/combos produces an identical event stream and winner.
- Fibonacci + Speedster gets Fibonacci damage and Speedster movement ramp.
- Lazer + Fibonacci beam uses Fibonacci damage; body collision remains Lazer projectile-only.
- Sticky + Fibonacci ticks Fibonacci damage without advancing bounce/ability counters.
- Splodey + Speedster fires bombs and gains speed; body collision still does zero.
- Gravity + Grower simultaneously changes gravity level and scale once per qualifying bounce.
- Borrowed Lazer/Splodey/Sticky effects render and emit their original audio events.
- Legacy settings/URLs still produce one base-only fighter.
- Quantity and combo URL round trips remain exact.
- Winner selection works with unequal team quantities.
- Run `npm test` and a browser smoke with 5× Splodey versus 3× Sticky + Fibonacci.

## Completion rules

- Update browser cache-busting query versions consistently.
- Update `progress.md` with mechanics completed and any unresolved interaction decisions.
- Do not modify unrelated modes or generated production assets.
- Report the exact `npm test` result and browser console result.
