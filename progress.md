Original prompt: Add a way to simulate 100+ tournaments so I can see which orbs are the weakest and which are strongest

## Friday YouTube Planning Fallback (2026-10-16)

- Friday's 16-orb tournament reserves most of the 24-orb daily roster and leaves the other race slots as 1v1s. On 2026-10-16 the noon long-form's closest finished duel missed the close-battle gate, and that throw aborted all four videos before any upload.
- The capped search now keeps that closest finished battle as a bounded fallback. Duration, layer, roster, announcer, and Friday tournament rules are unchanged. A slot that still cannot be planned no longer cancels the rest of the batch.

## Single-Match Video Duration (2026-09-24)

- Replaced the rematch-based minimum-duration behavior for YouTube races. Each
  export now preserves one matchup and uses its deterministic preflight duration
  to set an action playback rate, keeping the race itself on screen for at least
  25 seconds (Shorts) or 60 seconds (long-form); only the brief winner reveal
  follows the race.
- Expanded generated long-form courses to 50 ascending layers, while Shorts
  retain the three-layer cap. Race progression waits until its recorder is live,
  and the upload gate checks both measured race-action time and an exactly-one-
  matchup counter before allowing upload.
- This supersedes the rematch approach recorded in the Sep 22–23 entries below.
- Verification: `npm test` passes 183/183; `npm run youtube:validate` passes; the required Playwright browser client completed with no console/page errors. Local production-format exports passed the exact YouTube artifact gate: Short = 27.47s total / 26.26s race action / one matchup / three layers; long-form = 64.24s total / 63.01s race action / one matchup / 50 layers. Inspected representative frames across both clips; no repeated matchup or padded winner screen appeared. No upload was attempted.

## Long-Form YouTube Action Minimum (2026-09-22)

- Long-form Orb Race recordings now start a deterministic-seed rematch with the same matchup if a race ends before the one-minute recording threshold. Recording stays continuous until a final race completes, removing the long held winner screen while retaining its short finale tail.
- Rematch simulation resets preserve the initial announcer proof across the continuous recording. Added replay count to exported browser state and advanced the audio/page cache keys.
- Updated the YouTube publishing quality contract and README to describe the action-filled minimum.

## Short-Form YouTube Action Minimum (2026-09-23)

- Extended the continuous seeded Orb Race rematch rule to Shorts as well as long-form recordings. Any non-tournament race that ends before its configured minimum duration restarts with the same matchup while recording remains active, avoiding a held winner screen.
- Extracted and tested the rematch gate and deterministic replay-seed calculation; tournament recording boundaries, previews, and non-racing modes keep their existing behavior. Updated the upload contract and browser cache key.
- Verification: `npm test` passes 183/183; `npm run youtube:validate` passes. A local portrait export with a shortened three-second test minimum performed four rematches and recorded 5.06 seconds including the final reveal; frame inspection showed race activity across the minimum rather than a held end screen. No upload was attempted.

## Pancake Single-Body Visual (2026-08-06)

- Removed the visible multi-pancake pile while preserving Pancake’s gameplay stack count and damage state in simulation/HUD data.
- Advanced the browser cache lineage to `20260806-pancake-no-stack1`.

## Orb Race Consistent Very-Strong Math Arc (2026-08-06)

- Kept `speedMode: "regular"` on the shared Duplicator baseline, but restored `slow` to the previous math profiles: power math uses 0.49 travel speed, Fibonacci-class math uses 0.52, with the former reduced movement scale and gravity.
- `very-strong-math-slow` now applies the shared old Infinity-style slow travel profile consistently to every math ID: 0.12 horizontal travel speed, shared low gravity, the same high vertical height as the normal long arc, and a longer time aloft before landing.
- Advanced simulation, renderer, orb registry, and page-entry cache keys to `20260806-speed-profile4`.

## Orb Race Shared Regular Speed Baseline (2026-08-06)

- Corrected `speedMode: "regular"` so it uses Duplicator's shared baseline travel speed, arc, and gravity for every ordinary orb. Fibonacci and other math orbs no longer inherit their old orb-specific slow profile while in Regular mode.
- `slow` and `very-strong-math-slow` remain explicit deterministic overrides, while speed abilities and the existing buffed/stable-ID contracts remain unchanged.
- Updated the setup tooltip and browser cache keys; no renderer/audio state contract changed.

## Orb Race Per-Orb Buffed Toggle UI (2026-08-06)

- Added a visible `BUFFED` checkbox to every generated Orb Race orb card. The existing normalized `raceTeamOptions[team][orb].buffed` field, team `(BUFFED)` display label, URL serialization, and announcer state are reused unchanged.
- Setup restore/read now persists the checkbox for selected and unselected orb cards, and the browser entry cache key is `20260806-buffed-toggle1`.
- UI/Media handoff: no new renderer or audio contract is required; existing `raceBuffed` state and buffed team naming remain the integration surface.

## Godzilla Event Audio (2026-08-06)

- Added deterministic `race-godzilla-step` events for the walk cycle and marked tail/stomp attack impacts so presentation audio can distinguish walking from attacks without double-playing footsteps.
- Added original generated `race-godzilla-tail-smack.wav` and `race-godzilla-beam-charge.wav` effects. Their reproducible sources, generator, and mappings are preserved in `assets/audio/source/race-effects-20260806/`; active copies live in `assets/audio/effects/`.
- Godzilla footsteps and stomp landings reuse the supplied monster-footsteps clip, look-up uses the supplied monster-growl clip as a slowed roar, and atomic-breath release uses the supplied thunder clip.
- Advanced the audio/module cache lineage to `20260806-godzilla-audio1` and the page entry to `20260806-buffed-toggle2-godzilla-audio1`. Verification: `npm test` passes all 23 tests, including deterministic event assertions, generated WAV parity, manifest checks, and route coverage.

## Godzilla V2 Walk, Stomp, Downward Beam, And Buffed Announcer (2026-08-06)

- Generated a new original 4×4 Godzilla artboard in `assets/generated/orb-race-godzilla-20260806-v2/` with lifted alternating walk legs, tail-smack frames, a knee-lift stomp sequence, and a vertical atomic-breath beam that lands on the number line. Preserved the chroma source, raw alpha sheet, padded runtime sheet, prompt, manifest, and alpha validation.
- Added per-cell connected-component cleanup and nearest-neighbor padding to keep detached pixels from neighboring frames out of the live render. The renderer now prefers the v2 full-body sheet, uses the stomp row instead of claw attacks, and only uses the legacy standalone beam when the v2 sheet is unavailable.
- Kept Godzilla's seeded wander speed/cycle variation and wall-turn state, corrected post-turn velocity, and added regression coverage for stomp attack events, transparent frame margins, the downward beam contract, and deterministic replay.
- Generated the Alex `Buffed` cue at `assets/audio/announcer/generated-race/race-buffed.wav`, preserved its AIFF source and manifest under `assets/audio/source/race-announcer-alex-20260806/`, and added it to buffed Orb Race team announcement sequences.
- Advanced the entry/module cache keys to `20260806-speed-toggle2-godzilla2`, `20260806-godzilla-animation2`, and `20260806-buffed-announcer1`. Verification: `npm test` passes all 23 tests; MCP Playwright loaded the v2 sheet and Buffed WAV with 200 responses, `render_game_to_text()` reported Godzilla's downward breath and wall turns, and the browser reported zero console errors. The bundled Chromium capture client remained blocked by the local macOS `bootstrap_check_in` permission error, so the MCP Playwright fallback was used.

## Orb Race Per-Orb Speed Toggle UI (2026-08-06)

- Added a visible `SPEED` selector to every generated Orb Race orb card with `REGULAR`, `SLOW`, and `VERY STRONG MATH ORB SLOW` options. Existing simulation speed profiles, stable IDs, URL serialization, and default normalization remain unchanged.
- Setup restore/read now persists the selected `speedMode` for each orb, including unselected cards that become active later. Updated stale Prime/Multiplier picker descriptions and advanced the main-entry cache key to `20260806-speed-toggle1`.
- UI/Media handoff: no renderer/audio changes are required; the selected value is already exposed through normalized `raceTeamOptions[team][orb].speedMode` and fighter `raceSpeedMode` state.

## Pancake Outline Refinement (2026-08-06)

- Thinned the black pancake body border while preserving the orange fill, taller proportions, and stack readability.
- Advanced the browser cache lineage to `20260806-pancake-outline1`.

## Orb Race Random Absorber And Math Damage Sequences (2026-08-06)

- Absorber now makes a seeded random roll across the complete approved pool on every timed absorption. Repeats are allowed, while `raceAbilityIds` remains a composed set and repeated abilities continue to increment `raceRouletteAbsorbLevels` for their existing scaling behavior; Multiplier and Math Orbs remain excluded.
- Prime now deals the nth prime for its nth qualifying bounce (`2, 3, 5, 7, 11, ...`) and counts each sequence hit in `racePrimeHits`, with deterministic high-count protection at the shared math damage cap.
- Multiplier now advances in whole steps (`1× → 2× → 3× → 4× ...`) after each qualifying bounce; scaling-disabled races retain the existing fixed 1× behavior.
- UI/Media handoff: `raceRouletteAbsorbHistory` may contain repeated ability IDs; use `raceRouletteAbsorbLevels[id]` for the current repeated-absorption level and keep the existing `race-roulette-absorb` event contract.

## Pancake, Turret, And Blue Sun Physics (2026-08-06)

- Pancake syrup and butter patches now remain for their five-second damage window but are removed from replay/render state when the shared team lane advances; the pancake stack was tightened to be less wide and more vertically substantial.
- Turret bodies are now orange-only with the black shooter mounted along the orb edge. Each projectile exits from that mounted angle, records its launch direction, and bounces from the chamber side/top walls before reaching the active number line.
- Blue Sun now stores eight physical laser segments per active frame. Each ray stops at its first side-wall, top-wall, or number-line collision, and only rays that hit the number line apply damage. The orb body ramps from dark to blue as power levels increase.
- Advanced the browser cache lineage to `20260806-pancake-turret-bluesun1` and added simulation/renderer regression coverage for patch cleanup, turret launch vectors, and collision-bounded Blue Sun lasers.

## Orb Race Speed Modes And Buffed Titles (2026-08-06)

- Added the per-orb `speedMode` setting with stable values `regular`, `slow`, and `very-strong-math-slow`; missing/legacy values normalize to `regular` and remain compatible with existing compact settings URLs. `regular` preserves each orb's existing movement class, `slow` applies a deterministic slower profile, and `very-strong-math-slow` applies only to the strongest math IDs (`x-power`, `quadratic`, `factorial`, `centy`, `infinity`, and `100x`). The strongest profile uses 0.12 normalized travel speed, 0.5 gravity, a 0.035 short arc, and a 0.25 fixed-step movement scale, producing roughly ten bounces across the chamber while falling slowly.
- Added the per-orb `buffed` boolean option. Team titles now append ` (BUFFED)` (for example `FIBONACCI (BUFFED)`), and fighter/team replay state retains `raceSpeedMode` and `raceBuffed` without changing stable fighter IDs or gameplay damage.
- Media/Rendering handoff: add buffed race announcer cues `intro-race-fibonacci-buffed` and `intro-race-centy-buffed`, and route a matchup with both flags to the spoken sequence `FIBONACCI BUFFED vs CENTY BUFFED` (using the existing prompt/versus timing contract). The Gameplay state exposes `raceTeamOptions[team][orb].buffed`, `raceTeams[].name`, `fighters[].raceBuffed`, and `fighters[].raceSpeedMode` for that integration.

## New Race Audio And Announcer Coverage (2026-08-05)

- Added Alex announcements for the new Pancake and Tree orb IDs and restored the Artist announcement in the live Orb Race manifest.
- Added the supplied Pancake impact, Monster growl/footsteps, Fairy sparkle, and Thunder clips as preserved race effects; Bloom now uses the existing Forge drop clip. Monster walking emits deterministic step events so footsteps play between stomps/attacks.
- Advanced browser audio/cache lineage to `20260805-race-audio1` and retained the earlier Artist generic-event mute for non-requested painting/heal/body-bounce cues.

## Permanent Pancake Patches And Generic Audio (2026-08-05)

- Pancake syrup and butter marks now remain visible in the replay state and renderer instead of expiring or switching the display to only the newest patch family. The existing five-second damage window is preserved for balance.
- Pancake bounces, flips, stacks, and patch creation now use the generic orb-collision cue; the supplied splat is no longer routed, and Pancake no longer plays Forge pickup or weapon-clash/sword audio. Bloom retains its explicit Forge drop cue.
- Advanced the browser/audio cache lineage to `20260805-pancake-audio2` and `20260805-race-effects2`.

## Singular Artist Label (2026-08-05)

- Changed the player-facing Orb Race name from `ARTISTS` to `ARTIST` while preserving the stable `artists` ID, URL compatibility, simulation state fields, and asset filenames.
- Updated the announcer display name and advanced the browser cache lineage to `20260805-artist-singular1`.

## Pancake Splat Cutoff And Artist Audio Mute (2026-08-05)

- Restored the original pancake syrup/butter splat design: each patch is centered on the number line, with the line clipping its upper half and the lower half remaining visible below the layer-health row.
- Muted all Artist gameplay event sounds and removed the Artist announcer cue from the live manifest without deleting the assets, so the routes can be restored later; advanced the browser cache lineage to `20260805-artist-audio-off3`.

## Absorber Ability UI And Effects (2026-08-05)

- Audited Absorber's full timed pool: Bombs (`mines`), Speed, Sticky, Orbiters (`orbital`), Meteor, Slammy, Reactor, Black Hole, and Weapon Orbs (`drill`) already enter the composed simulation ability set and retain their deterministic gameplay effects.
- Added Absorber HUD metrics for every absorbed ability, including Reactor charge/blast damage, Slam damage, Meteor small/giant damage, and Black Hole singularity progress; absorbed attributes use their source orb theme colors and the full absorbed history remains visible.
- Added the missing Reactor blast render dispatch for Absorber, plus clear absorbed Speed streaks, Sticky hold marks, and Slammy impact/rage accents. Existing absorbed Mines, Drill, Meteor, Orbital, and Black Hole projectile/effect paths remain driven by `raceHasAbility`.
- Added Reactor as a visible single-orb ability bar and exposed Absorber's active ability IDs/levels through `render_game_to_text`.
- Added a compact three-column long-form header grid so all nine active ability labels and values remain readable on the narrow 16:9 tracks.
- Advanced the browser entry cache lineage to `20260805-orb-race-absorber-ui1`.

## Artist Spawn, Storm Air, And Pancake Landing Readability (2026-08-05)

- Fixed generated Fairy and Monster placement after the 1.5-second Artist reveal: the sprite sheets now stay centered through the facing transform, so each summon appears in the same fixed step as the completed drawing; Monster continues its deterministic fall and lands on the number line while Fairy remains airborne.
- Moved the regenerated gray-only Thunder cloud above the active layer and retained the blue lightning strike down to the layer surface. Bloom remains ground-anchored and its expanding translucent yellow burst outlines the other active Artist assets.
- Pancake stacks and their marks now share the same chamber-edge guard, keeping a wall-side landing visibly aligned. Syrup/butter splats retain the hard number-line cutoff; the renderer shows the newest patch family so a landing reads as syrup or butter, not both at once. The HUD patch count includes both patch types.
- Advanced the browser entry cache lineage to `20260805-orb-race-artists-pancake12`, clamped the airborne Storm cloud inside the board crop while retaining its above-line strike spacing, and capped the rendered pancake pile at three pancakes.
- Verification: `npm test` passes all 23 tests. Playwright captures cover neutral Artist sketches, completed Bloom/Storm, Fairy and Monster summons, grounded Monster fall-in, and Pancake syrup/butter landings; inspected screenshots show no page or console errors.

## Artist Reveal And Pancake Landing Polish (2026-08-05)

- Reused the existing generated syrup-patch cell from `assets/generated/orb-race-media-20260804/final/pancake-sheet.png` and added a separate original, chroma-keyed four-variant butter-patch sheet at `assets/generated/orb-race-media-20260805-pancake-patches/`, preserving the source, prompt, manifest, and alpha validation.
- Pancake landings now leave both deterministic syrup and butter patches below the number-line cutoff, with the butter visibly seated against the line beneath the pancake; pancake travel uses a seeded multi-direction pattern instead of a strict left/right alternation.
- Artist reveals now run for exactly 1.5 seconds as a larger cartoon cloud of colored squiggles drawn by an animated brush. After the reveal, Bloom and Storm use their generated assets, while Fairy and Monster use the generated animated sheets; Monster falls in, Fairy can hover, and both mirror after wall turns.
- Advanced the browser entry cache lineage to `20260805-orb-race-artists-pancake6`.
- Verification: `npm test` passes all 23 tests; fresh cache-busted Playwright Pancake and Artist captures use the v6 modules, all required media requests return 200, and both runs report zero console errors.

## Orb Race HUD Cleanup (2026-08-05)

- Made Artists HUD lines fit the available stat column and reserve the adjacent ability-bar space, shrinking text only when necessary.
- Removed Draftmaster's `UPGRADE IN` countdown line and suppressed ability progress bars for teams with two or more orbs.
- Replaced Commander count/generic damage HUD text with bomb-damage and missile-damage lines, using active projectile values and a pre-first-shot fallback without changing simulation rules.
- Advanced the browser entry cache lineage to `20260805-orb-race-artists-pancake3`.

## Orb Race Media Pack And Event Audio (2026-08-04)

- Generated original pixel-art media with chroma-keyed RGBA finals for Grappler, Artists, Pancake, and Tree in `assets/generated/orb-race-media-20260804/`; preserved sources, prompts, manifest, and alpha validation alongside the finals.
- Wired sprite-sheet rendering, deterministic Grappler rope/pull visuals, Artist painting/growth/character frames, Pancake flipping/stacks/patches/butter, Tree transformation/roots/leech labels, and compact portrait/long-form HUD lines against the live Gameplay fields with compatibility fallbacks.
- Added deterministic event audio routes for Grappler, Artists, Pancake, and Tree using existing effects. Pancake's future butter-horn route is explicitly null until a real clip is supplied, so it cannot produce a missing-file request; Pancake/Tree announcer clips were not fabricated because no local announcer-generation workflow was available in this task.
- Added manifest/alpha/sprite-contract and audio-route tests. Verification: `npm test` passes all 23 tests; Playwright Chromium captured Grappler/Artists and Pancake/Tree active/fade states with no page or console errors. Fixed Tree rendering to keep roots visible across all declared number-line slots during ROOTS and its fade.

## Orb Race Visual Readability Pass (2026-08-04)

- Added the generated v2 effect sheets in `assets/generated/orb-race-media-20260804-v2/`: Monster's brick-wall impact sequence, Fairy's downward ground projectile, and Tree's recognizable face/root-piercing animation with preserved sources, prompts, manifest, and alpha validation.
- Enlarged and ground-anchored Pancake stacks, enlarged syrup patches, enlarged Bloom/Storm visuals, and aligned Fairy/Monster frames so their feet meet the number line. Storm strikes now draw a bright bolt and impact exactly to the layer.
- Sunrise is centered at 5× scale, emits a visible burn readout on the layer, and adds a glow pass to active Artist drawings. Monster attacks use the generated falling-wall frames, while Fairy attacks use the generated downward projectile effect.
- Tree's first three transformation frames retain the tree-face design, and the rooted effect now adds visible tendrils through every declared layer with a 2-second fade.
- Verification pending: `npm test` and fresh Playwright captures for Pancake, Artists, and Tree.

## Orb Race Media Follow-up (2026-08-04)

- Fixed generated Pancake sheet seams by using integral cell bounds and visible-content crops; Pancake bodies are larger, layer-bottom anchored, and follow the fixed-step travel arc. Stack layers now use staggered flip phases, preserve the butter read on both visible faces, and draw independent non-main stacks on their own arcs.
- Enlarged syrup patches and made each number line a hard visual cutoff: syrup is centered at the landing line, but only the portion below that line is rendered. The active Pancake is repainted above the patch so the pancake remains seated on top of the layer.
- Removed Pancake-tagged critical-hit and reactor-explosion audio; butter meteor/strike events use the regular collision cue instead. Artist multiplier labels remain removed, and Tree continues to use the generated tree asset directly without a procedural orb overlay.
- Advanced the browser entry cache lineage to `20260804-orb-race-media5`.
- Verification: `npm test` passes all 23 tests. Fresh Playwright captures show the clipped syrup, grounded Pancake, visible Fairy/Bloom/Storm/Monster media, and Tree roots crossing every declared layer without page/console error artifacts.
- Restored the full horizontal silhouette of Pancake's round top/underside cells after removing the last source-edge crop, and advanced the browser entry cache lineage to `20260804-orb-race-media6`.
- Clamped oversized Pancake visuals inside the chamber edges so the complete round face remains visible when the physics center reaches a wall; browser cache lineage is now `20260804-orb-race-media7`.
- Removed the detached left-edge component from the underside Pancake cell at render time while preserving the full main circle; browser cache lineage is now `20260804-orb-race-media8`.
- Media9 resets Pancake to one rendered pancake even while Gameplay retains stack fields for damage compatibility: the generated buttered face is the only grounded face, the underside has no manual butter overlay, and airborne flips use the generated horizontal side-profile cell along the deterministic arc. Syrup remains clipped below the number line, Solar's generated alpha bottom is anchored to the layer, Artist paintings fall back per style while sheets load, and the generated Artist attack/tree sheets remain live. Tree continues to render its generated rooted-tree frame as the orb asset itself with no procedural orb underneath.
- Added an Artist active-painting compatibility fallback for snapshots that omit the transient painting position; the renderer now uses the live Artist orb position/layer so the generated drawing remains visible instead of resolving to NaN canvas coordinates.
- Media10 corrects the Pancake airborne read: the generated side-profile cell is rotated edge-on into a vertical line while following the existing deterministic flip arc; grounded faces remain full circles.
- Media11 grounds the Fairy/Monster feet and Bloom soil using the generated cell alpha bottoms, restores Solar's correct ground anchor while increasing its visibility, removes per-drawing labels, and scales Pancake down 1.5×. Pancake now eases from a vertical edge into a flattened oval surface pose during the final half of each flip instead of presenting a front-facing circle.
- Media12 uses per-frame alpha anchors so Fairy/Monster walking and attack frames, Bloom growth, and Storm lightning stay planted on the number-line surface. Pancake's landing face now grows from the edge profile during the turn, preserving a smaller flat-disk landing pose without snapping to a full front-facing circle.
- Media13 preserves Pancake's final opaque rim column and adds a wall-side guard, keeps Monster's intact→cracked→falling wall punch visible between simulation snapshots, caps visible Artist duplicates at two (Solar at one) with Solar rendered behind foreground drawings, and temporarily renders only the Tree orb asset at 3× its prior footprint while roots remain paused.
- Media14 crops the dormant lower root component out of the standalone Tree-face asset while preserving its source aspect ratio, so the enlarged Tree is a single clean orb visual.
- Media15 tightens the Tree crop to the clean face-only region and keeps the asset aspect ratio, removing the detached lower strip from the enlarged orb.
- Media16 increases the Pancake wall-side safety margin without changing its rendered size or aspect ratio, keeping the full buttered rim inside the chamber while syrup remains subject to the number-line cutoff.

## Orb Race New Racer Setup UI (2026-08-04)

- Added registry-driven Grappler, Artists, Pancake, and Tree cards to both Orb Race team pickers with concise descriptions while preserving quantity, size, trail, scaling-damage, combo, and shareable URL controls.
- Added contained text layout for long racer names/descriptions in the wide multi-column roster and exposed current Grappler, Artists, Pancake, and Tree state through `window.render_game_to_text`.
- Advanced the browser entry cache lineage to `20260804-orb-roster-ui1` without changing newer imported module lineages.
- Verification: `npm test` passes all 23 tests; Playwright setup smoke covered both pickers, option persistence, launch, restart, generated-URL reload, and browser/page error capture with no errors.

## New Orb Alex Announcements (2026-08-03)

- Added generated Alex announcer entries for the new 100X, Grappler, and Artists Orb Race racers; active and preserved source copies use the existing local speech/FFmpeg pipeline.
- Added all three stable IDs to the Orb Race announcer manifest and advanced the announcer/page cache lineage to `20260803-new-orb-announcements1`.
- Verification: regenerated all three clips; `npm test` passes all 19 tests; Playwright rendered a live 100X vs Artists race with no page/console errors; all three cache-busted MP3 endpoints returned `200 audio/mpeg` with non-empty bytes.

## Absorber Ability Handoff (2026-08-02)

- Fixed timed Absorber grants so Sticky initializes its level-one hold/tick state and Meteor initializes its damage, burn, apex, and cooldown state when the ability is absorbed; both continue through the existing `raceHasAbility(...)` dispatch and deterministic seeded progression.
- Absorbed Speed now receives the same baseline travel state as a Speed combo, repeated absorbed categories retain their deterministic levels, and duplicate source colors fall back to the source accent so every absorbed ability remains visible in the color ring.
- Added deterministic simulation coverage proving Absorber activates and scales Sticky and Meteor, including repeatable absorption history and Meteor projectile/giant-meteor events.
- Verification: `npm test` passes all 19 tests; Playwright Chromium verified the browser-side Absorber run with Sticky ticks, Meteor small shots, a giant meteor, and no console or page errors.

## Commander Orb And Absorber (2026-08-02)

- Generated and chroma-keyed a standalone Commander orb asset at `assets/generated/orb-race-tactical-20260802/final/commander-orb.png`; the original green-screen source and manifest are preserved beside it.
- Constrained Commander drones and their dropped weapons to the active number-wall lane, and enlarged the bomb/missile visuals with deterministic theme glows for clearer impacts.
- Renamed Roulette to the player-facing `ABSORBER` while preserving stable ID `roulette` for saved links and replays; added pink styling, absorbed-orb color palettes, orbiting source badges, damage HUD text, and wrapped absorbed-orb history display.
- Verification: `npm test` passes all 19 tests; Playwright Chromium captured live Commander and Absorber races with no page/console error artifacts.

## Absorber Source Visuals (2026-08-02)

- Removed the generated roulette-wheel icon from Absorber's live renderer; Absorber now uses an icon-free pink core with its absorbed-color ring.
- Absorber's orbiting history badges now render through each source orb's renderer, so absorbed Meteor uses the actual Meteor art rather than a generic letter badge.
- Absorbed Meteor projectiles, burns, and horn visuals now render for Absorber because those effects follow `raceHasAbility` instead of only the primary racer ID.
- Advanced browser cache lineage to `20260802-absorber-visuals1`; regression checks cover the renderer contracts.
- Verification: `npm test` passes all 19 tests; seeded Absorber/Meteor Playwright captures show the icon-free Absorber and actual Meteor badge with no page or console error artifacts.

## Absorber Black Hole UI (2026-08-02)

- Added Absorber's Black Hole `SINGULARITY`/`POWER` HUD line and the purple singularity charge bar when Black Hole is absorbed.
- Reused the Black Hole teleport/suction effects and actual active Black Hole body for Absorber, while preserving the pink absorbed-color ring and history badges.
- Added the same singularity progress readout to long-form headers and advanced browser cache lineage to `20260802-absorber-blackhole1`.
- Verification: `npm test` passes all 19 tests; the seeded Playwright capture shows Absorber's singularity bar and active Black Hole suction visuals without a page or console error artifact.

## Orbital Combo Alex Announcements (2026-08-02)

- Refreshed all eleven Orbital combo-name announcements with the local Alex voice: Speed, Gravity, Fibonacci, Lazer, Splodey, Grower, Sticky, Slammy, Poison, Drill, and Tripler Orbital.
- Preserved active/source MP3 copies through `npm run audio:generate-orbital-combos` and advanced the announcer/page cache lineage to `20260802-orbital-combo-alex1`.
- Verification: regenerated all eleven clips; `npm test` passes all 19 tests; Playwright rendered a live SPEEDORBITAL vs Gravity race with no page/console errors; all eleven cache-busted MP3 endpoints returned `200 audio/mpeg` with non-empty bytes.

## Long-Race Layer Bounce Alignment (2026-07-31)

- Fixed long-form number-wall placement so each visible layer starts on the same world coordinate as the simulation's corresponding bounce line; the old renderer placed every card one full layer step too low and left an invisible collision surface above it.
- Added a renderer geometry regression for the first and later layer tops and advanced the browser cache lineage to `20260731-tactical-assets8`.
- Verification: `npm test` passes all 19 tests; Playwright captured a 13-layer long race with the first visible cards aligned to the active bounce line and no page/console error artifact.

## Sniper Damage And Shot Counter HUD (2026-07-31)

- Restored Sniper's live damage and total shots-fired counter in the Orb Race HUD, using its projectile damage value and `raceSniperShots` state.
- Preserved the existing scaling-damage setting: disabling scaling damage hides only Sniper's damage line while keeping the shot counter visible.
- Advanced the browser entry/module cache lineage to `20260731-tactical-assets7`.
- Verification: `npm test` passes all 19 tests; Playwright Chromium captured Sniper at `DAMAGE: 31.3` and `SHOTS: 1` after a deterministic shot, with no page/console error artifact.

## Tactical Orb Assets, Drone Flight, And Snowball Wall Compression (2026-07-31)

- Generated and chroma-keyed standalone Roulette, Shrapnel, and Architect orb assets; preserved the original green-screen sources and recorded all six tactical assets in `assets/generated/orb-race-tactical-20260731/manifest.json`.
- Added standalone orb rendering with simple canvas fallbacks/details: Shrapnel gets clear crack lines and oversized shard trails, Architect gets a centered hammer, and Roulette uses the generated roulette wheel.
- Roulette absorption now draws the actual absorbed orb model along a larger deterministic suction vortex and records/display the absorbed orb names in the HUD.
- Commander drones now sweep through the active arena using deterministic positions shared by simulation, text state, and renderer; their tactical sprites are rendered at 3× visual size.
- Snowball team walls now visually shrink in height as Snowball grows while keeping their lower edge on the canonical number line in both portrait and long-form boards.
- Advanced the browser entry cache lineage to `20260731-tactical-assets6` after the final HUD spacing adjustment.
- Verification: `npm test` passes all 19 tests; Playwright Chromium captures show the standalone tactical sprites, a real Multiplier orb traveling through Roulette's enlarged suction vortex, clean absorbed-orb HUD text, Commander drones sweeping away from the orb, and Snowball's grown body with shortened number walls. No Playwright page/console error artifact was produced.

## Orb Race Tactical-Orb Announcements (2026-07-31)

- Added generated Alex announcer clips for the four current Tactical Orb additions: Commander, Shrapnel, Roulette, and Architect; active files and source copies use the existing `race-announcer-generated` pipeline.
- Added all four stable racer IDs to the Orb Race announcer manifest and advanced the announcer/page cache lineage to `20260731-new-orb-announcements1`.
- Verification: regenerated all four clips; `npm test` passes all 19 tests; Playwright rendered a live Commander vs Roulette race with no page/console errors; all four cache-busted MP3 endpoints returned `200 audio/mpeg` with non-empty bytes.

## Snowball Roll, Growth, And Generated Orb Asset (2026-07-31)

- Added a generated icy pixel-art Snowball orb with an alpha-cutout final asset at `assets/generated/orb-race-simple-20260731/final/snowball-orb.png`; the chroma-key source is preserved beside it.
- Snowball now tracks deterministic roll rotation from ground distance traveled and tumbles while falling between layers, so the orb visibly spins during the full movement sequence.
- Increased drain-based growth to a readable `0.25%` scale gain per stolen damage point, while retaining the existing layer-size cap and continuous drain rules.
- Added asset, rotation, and growth regressions and advanced browser cache lineage to `20260731-snowball-roll1`.
- Verification: `npm test` passes all 19 tests; the cache-busted Playwright Chromium capture shows Snowball using the generated sprite at 106% size with non-zero roll rotation and no page/console error artifact.

## Sniper, Draftmaster, And Berserker Presentation Pass (2026-07-31)

- Removed Sniper's generated cell matte, gave its rifle a deterministic sweep aim, and removed Sniper shot damage/rate/hit HUD text.
- Draftmaster's sword now returns to guard after the layer slice, and its gun spins with translucent ghost passes for a short reload flourish between shots.
- Restored Berserker to the original simple orb silhouette and reserved the procedural fire for full rage.
- Added renderer/simulation regressions and advanced the browser cache lineage to `20260731-sniper-draftmaster-berserker1`.
- Verification: `npm test` passes all 19 tests; focused social tests pass; Playwright Chromium captured Sniper and Draftmaster with no error artifacts.

## Orb Race New-Orb And Count Announcements (2026-07-31)

- Added generated Alex announcements for Needle, Multiplier, Sniper, Snowball, Countdown, Copycat, and Critical; the previous 288-byte silent placeholders were replaced with real MP3 clips and preserved source copies.
- Added generated Alex count cues for 60, 70, 80, 90, and 100. The announcement router can recognize these milestones without changing the current 50-copy gameplay/setup cap.
- Added the seven new orb IDs to the Orb Race announcer manifest, expanded count routing through 100, and advanced the browser/audio cache lineage to `20260731-announcer-audio1`.
- Verification: `npm test` passes all 19 tests; Playwright rendered a live Needle vs Critical race with no page/console errors, and all seven orb plus five count MP3 endpoints returned `200 OK` with non-empty audio bytes.

## Seven Simple Orb Race Characters (2026-07-31)

- Added stable `needle`, `multiplier`, `sniper`, `snowball`, `countdown`, `copycat`, and `critical` roster IDs with bright solid palettes, setup descriptions, grouping/name support, per-orb options, URL serialization, and compact HUD stats.
- Added deterministic fixed-step abilities: Needle's tiny 35% next-layer pierce and +2 ramp; Multiplier's +0.25× bounce ramp; Sniper's projectile-only five-second power shots; Snowball's hit growth and layer-reset size; Countdown's tenth-hit 25× blast; Copycat's strongest-opponent +1 damage; and Critical's seeded +5%-per-bounce 10× crits.
- Generated and alpha-normalized a new two-cell pixel Sniper rifle/ammo sheet under `assets/generated/orb-race-simple-20260731/`. Other new racers use intentionally simple procedural emblems so their mechanics remain instantly readable.
- Reused the existing rifle, collision, and critical-hit samples for Sniper fire/impact, Countdown blasts, and Critical hits. Added the new states to replay snapshots, text export, team damage-per-second aggregation, and deterministic comparisons.
- Added registry/URL, mechanic activation, projectile-only damage, layer interaction, seeded critical, replay determinism, renderer asset, and audio-route coverage. Advanced browser/audio cache lineage to `20260731-simple-orbs1`.
- Verification: `npm test` passes all 19 tests after updating the page-entry cache assertion to `20260731-simple-orbs1`. The generated Sniper sheet was visually inspected at source resolution and reports an RGBA alpha channel. The required Playwright client was attempted, but this managed macOS sandbox denied Chromium's Mach rendezvous and also denied opening a local HTTP listener; no browser screenshot was claimed from that failed run.

## Parasite Smooth Layer Fall (2026-07-31)

- Parasites now preserve their current Y position when their team clears a wall, retarget the next layer, and continue falling with gravity instead of respawning at the course top.
- Added a deterministic transition test covering the old-wall position, in-flight state, and next-layer landing; advanced the browser cache lineage to `20260731-parasite-layer-fall1`.
- Verification: `npm test` passes all 19 tests; Playwright Chromium verified a Parasite + Speedster team entering layer 1 with no page or console error artifacts.

## Berserker Draftmaster Scale And Axe Contact Lock (2026-07-30)

- Matched the generated Berserker character canvas to Draftmaster’s 175% visual footprint so both heavyweight orbs read at the same size in the race.
- Scaled and repositioned the axe with Draftmaster’s weapon anchors, then matched the sword’s contact-timed swing: the axe reaches the layer at the impact frame and stays locked there until the next swing.
- Added locked-state replay/UI fields, regression coverage, and advanced the browser cache lineage to `20260730-berserker-scale-axe-lock1`.
- Verification: `npm test` passes all 19 tests; Playwright Chromium compared both heavyweight orbs and verified the locked axe state with no page or console error artifacts.

## Draftmaster Muzzle Bullets And Sword Contact Lock (2026-07-30)

- Draftmaster bullets now spawn at a scaled point in front of the mounted gun muzzle instead of at the orb center; fire events preserve the deterministic origin for replay/debug state.
- Draftmaster's sword now completes its downward motion at the number-line contact frame, freezes at the contact angle until the next swing, and reports the locked state in replay/UI state.
- Advanced the browser cache lineage to `20260730-draftmaster-muzzle-lock1` and added muzzle-origin and contact-lock regression coverage.

## Viking Berserker Assets And Draftmaster Pistol Cleanup (2026-07-30)

- Generated a new pixel-art Viking Berserker calm state and a separate rage state with larger horns, fire, glowing eyes, and red/orange rage details. Removed the chroma background and shipped the transparent assets at `assets/generated/orb-race-viking-20260730/final/berserker-viking-calm.png` and `assets/generated/orb-race-viking-20260730/final/berserker-viking-rage.png`.
- Orb Race now uses the generated Viking artwork for Berserker while retaining the procedural drawing as a loading/error fallback; the generated rage sprite supplies its own flame halo.
- Cropped the Draftmaster pistol source cell before drawing it, removing the detached rifle-colored fragment while leaving the rifle and shotgun upgrade cells unchanged.
- Advanced the browser cache lineage to `20260730-berserker-viking-pistol2` and added source-crop and generated-PNG regression coverage.
- Verification: `npm test` passes all 19 tests; Playwright Chromium verified Draftmaster, Berserker calm, and Berserker rage captures with no page or console error artifacts.

## Berserker Rage Presentation And Orb Race Blank-Frame Guard (2026-07-30)

- Added a deterministic Berserker rage meter that fills while its team trails by more than ten percent, grows the hat and rear fire with rage, plays the existing Meteor horn at 100%, then reveals the axe for a Draftmaster-style clockwise swing and layer impact.
- Added replay/text state for the horn, rage activation, axe visibility, and swing count, and routed the Berserker horn event to the existing `meteor-horn` sample.
- Hardened Orb Race team-member resolution against a transient missing `memberIds`/fighter snapshot so a partial board cannot abort the rest of the canvas render. Advanced the browser cache lineage to `20260730-berserker-rage1` so existing tabs load the repaired renderer.
- Verification: `npm test` passes all 19 suites; Playwright Chromium verified the 500/1,000/2,000 portrait race at 60 FPS with no console or page errors.

## Draftmaster Showcase And Crusher Crack Cleanup (2026-07-30)

- Locked Draftmaster’s generated gun and projectile firing angle to 225° (the midpoint between 180° and 270°), so the mounted gun stays aimed consistently while bullets remain independent visible projectiles.
- Scaled the generated Draftmaster orb/cape, sword, gun, and ammo visuals to 175%, rendered the equipment after the orb mask so every selected asset stays readable, and added a temporary upgrade callout above the orb: blue Speed, red Damage, and yellow Projectile +1.
- Added separate deterministic blue bullet-impact and red sword-impact effects using the generated `impact-collision.png` and `impact-critical.png` assets. Crusher cracks now clear as soon as its shared team advances to the next layer.
- Advanced the browser entry and renderer cache key to `20260730-draftmaster-showcase1` and added fixed-angle, impact, and crack-cleanup regression coverage.
- Verification: `npm test` passes all 19 suites. Playwright Chromium captured the 225° gun, independent highlighted ammo, the color-coded Damage callout, and the red sword-impact frame with no console or page errors.

## Draftmaster Gun Scale And Powerup HUD (2026-07-29)

- Doubled the Draftmaster gun overlay dimensions while keeping the sword, orb, and gun hand anchor unchanged so the firearm reads clearly in the portrait race card.
- Replaced Draftmaster's generic damage/D-P-S HUD with compact `POWERUP: ...` and `UPGRADE IN: ...` lines. The simulation now preserves the most recently selected Damage, Projectile, or Speed upgrade for renderer/replay/text state.
- Advanced the browser entry and simulation/renderer cache key to `20260729-draftmaster-powerup1`.
- Verification: `npm test` passes all 19 tests; the required Playwright Chromium race capture shows the enlarged rifle and `POWERUP: PROJECTILE` / `UPGRADE IN` HUD with no page or console error artifact.

## Setup 60 FPS Scroll Fix (2026-07-29)

- Prevented the invisible 60 FPS radio input from scrolling the outer setup dialog to the bottom when its visible label is clicked; the inner setup panel now keeps its current position while the dialog stays anchored at the top.
- Added focus/change handling and advanced the page cache key to `20260729-fps-scroll1`.
- Verification: `npm test` passes all 19 tests; Playwright confirmed 30→60 FPS and 60→30 FPS switching, panel scroll-up recovery, and no page or console errors.

## Draftmaster Foreground Weapon Visibility (2026-07-29)

- Rendered the Draftmaster sword and gun in the foreground with outward hand anchors, then repainted only the orb center so neither weapon disappears behind the orb or obscures its face.
- Advanced the browser entry/renderer cache key to `20260729-draftmaster-weapons2`.

## Draftmaster Handed Weapons And Clockwise Sword Swing (2026-07-29)

- Repositioned Draftmaster’s sword to the right hand and mirrored the gun into the left hand, shrinking both overlays and placing their inner portions behind the cape/orb.
- Changed the sword pose to rotate clockwise from an up-right guard into a downward layer strike, with the contact effect following the right-side impact point.
- Added deterministic sword-pose regression coverage and advanced the browser entry/renderer cache key to `20260729-draftmaster-weapons1`.

## Orb Race Heavyweight Ability Pass (2026-07-29)

- Berserker rage now rises only when its team is more than 10% of the active wall behind the opponent, never falls, caps at 100, and reveals the existing Orb Foundry pixel axe for deterministic 10× layer strikes every two seconds.
- Crusher no longer changes gravity or arc height. Its increasing weight bleeds a larger deterministic fraction into the next layer, while impact cracks are larger, darker, and permanent.
- Reactor no longer shows a charge percentage in the race HUD; its body interpolates from black to light blue as charge reaches 100%, its explosion expands across the board, and its effect carries a small presentation-only shake cue.
- Turret rotation and firing cadence are slower without changing its stable ID or duration ramp. Replay state includes the new Berserker axe fields, and browser cache lineage advances to `20260729-race-heavyweights2`.
- Verification: `npm test` passes all 19 tests. Playwright Chromium verified page load, Orb Race launch with Berserker/Reactor selected, stable runtime IDs, and no console/page errors.

## Draftmaster Weapons, Cape, And Turret Scale (2026-07-29)

- Split Draftmaster's deterministic combat cadence into a visible sword swing every two seconds and an angled gun volley every three seconds; sword damage now lands on its contact frame instead of being implied by the orb body.
- Enlarged the sword, firearm, and spawned Turret visuals. Replaced the layered cape construction with a generated three-tier character sheet where the orb and wrapping cape are one continuous asset, then doubled the separate sword and gun overlays.
- Generated and alpha-normalized a new three-tier pixel-ammo sheet for pistol, rifle, and shotgun rounds. Draftmaster bullets are larger, preserve their firing angle, and render the correct ammo tier.
- Restored the old fantasy sword-hit sample for sword swings, added explicit swing/hit audio routes, replay/text state, cadence tests, generated-asset metadata, and renderer cache key `20260729-draftmaster-caped2`.
- Verification: `npm test` passes all 19 tests. Playwright rendered the combined character, enlarged weapon overlays, and enlarged spawned turrets at 1080×1920 with no console or page errors.

## Orb Race Parasite And Draftmaster Firearm Audio (2026-07-29)

- Replaced Parasite's recurring damage-tick cue with the existing regular `orb-collision` damage sample; its separate spawn cue is unchanged.
- Added the supplied rifle, shotgun, and pistol clips as `race-draft-rifle-fire.mp3`, `race-draft-shotgun-fire.mp3`, and `race-draft-pistol-fire.mp3`, preserving all original downloads under `assets/audio/source/race-effects-20260729/`.
- Routed Draftmaster's `race-draft-fire` event by `gunTier`: tier 0 pistol, tier 1 rifle, and tier 2 shotgun. Reused the current shared browser/audio cache key `20260729-draftmaster-combat1` and added routing/manifest regressions.
- Verification: `npm test` passes all 19 tests; Playwright rendered a live Draftmaster vs Parasite race through the firing state with no page or console errors, and all three new MP3 endpoints returned `200 OK`.

## Orb Race Turret Orange Presentation (2026-07-29)

- Made Turret’s orb body and accent the same orange, removed the on-orb barrel/center emblem, and kept the separate spawned turret weapons unchanged.
- Added renderer/color/symbol regression coverage and advanced the Orb Race browser cache key to `20260729-turret-orange1`.

## Orb Race Seven-Orb Expansion (2026-07-29)

- Registered Turret, Leech, Crusher, Berserker, Reactor, Parasite, and Draftmaster with stable Orb Race IDs, palettes, setup descriptions, and existing team/grouping support.
- Generated and alpha-normalized original pixel assets for Crusher's rocky shell and Draftmaster's modular sword, gun, and cape upgrade tiers under `assets/generated/orb-race-expansion-20260729/`.
- Added audible Alex announcer WAVs for all seven new racers in both the live generated-race folder and the preserved announcer source folder.
- Added deterministic gameplay and replay state for timed turrets with bouncing bombs, Sticky-style Leech holds, weighted Crusher arcs and cracks, behind-state Berserker rage, charged Reactor blasts, ramping Parasite spawns, and seeded three-path Draftmaster upgrades.
- Added procedural visuals for Turret, Leech, Berserker, Reactor, and Parasite, plus generated Crusher and Draftmaster sprites, projectiles, impact effects, HUD metrics, text export state, event audio, and team damage-per-second aggregation.
- Preserved the three-or-more-orb HUD contract by showing only orb count and total simultaneous team damage per second, preventing tall rosters from clipping beyond the recorded canvas.
- Added URL round-trip, activation, projectile, ramp, seeded upgrade, replay, announcer integrity, and event-audio tests. Advanced browser/audio cache keys to `20260729-race-expansion1`.
- Verification: `npm test` passes all 19 tests. Playwright rendered a seeded seven-orb match at 1080×1920, loaded both generated PNGs and all seven non-empty WAV announcements, and reported no console or page errors.

## Orb Race Vampire Bounce Sound (2026-07-29)

- Added the supplied vampire attack hiss as `assets/audio/effects/race-vampire-bounce.mp3` and preserved the original download under `assets/audio/source/race-effects-20260729/`.
- Routed the cue only for Vampire `race-bounce` events on the number line; top- and side-wall bounces retain the standard collision sound, and layer-breaking impacts retain the metallic break cue.
- Advanced the browser entry, audio module, and sample cache key to `20260729-vampire-bounce-audio1` and added manifest/routing regressions.

## Orb Race Setup Options Scroll Fix (2026-07-29)

- Kept the Orb Race setup dialog’s inner panel as the only scrolling surface when selecting a lower-list orb or opening its options; the outer dialog no longer jumps to the bottom and hides the selection context.
- Restored the existing panel position after option expansion, bumped the setup styles cache key, and verified the behavior with a focused Playwright interaction capture.

## Orb Race Tilted Holes, Persistent Snake Tails, And Charger Bounce Ramp (2026-07-29)

- A tilted wall now advances to the next lane when either half reaches zero, while retaining the independent left/right health values for replay and compatibility state. This lets an orb that reaches the opening pass through instead of falling indefinitely below the active wall.
- Snake tail size increased to 0.55 of the parent radius so airborne tail segments reach the number line; splitting now preserves the parent’s visible full tail while using a separate deterministic cycle counter for future splits.
- Charger slams now run through the existing bounce progression path, incrementing bounce count, damage, and interval ramp before applying the slam payload. The existing charger event gains bounce metadata without changing its stable orb ID.
- Advanced the simulation/renderer import cache keys to `20260729-tilted-snake-charge1` while preserving the active Orbital combo/audio cache lineage; added tilted-hole, persistent-tail, tail-size, and charger-ramp coverage.

## Orbital Combo Naming And Announcer Audio (2026-07-29)

- Added a shared Orbital naming registry: every two-ability Orbital combo uses a recognizable companion stem followed by `ORBITAL`, covering Speed, Gravity, Fibonacci, Lazer, Splodey, Grower, Sticky, Slammy, Poison, Drill, and Tripler.
- Added generated combo announcer assets for all eleven Orbital pairings, preserving active/source MP3 copies and keeping the earlier Fibonacci + Tripler WAV source compatible.
- Added `npm run audio:generate-orbital-combos`; it uses the Alex/FFmpeg pipeline and smoothly splices the existing Alex base clips when the local speech backend returns an empty file.
- Advanced the browser/module and announcer cache key to `20260729-orbital-combo-audio1`; Orbital combo title, reversed-order, sequence, and asset-integrity regressions cover the new convention.
- Verification: `npm test` passes all 19 tests; the cache-busted Playwright Chromium race check renders `SPEEDORBITAL` with `raceAbilityIds: ["orbital", "speed"]` and no page or console errors.

## Orb Race Ten-Orb Expansion (2026-07-29)

- Added Centy, Infinity, Charger, Bouncer, Blue Sun, Snake, Vampire, Cubed, Double, and Tripler as stable Orb Race contenders across the registry, team picker, grouping/name generation, URL settings, social renderer, replay text, winner presentation, and team damage aggregation.
- Added deterministic fixed-step mechanics for percentage-of-layer Centy hits, display-infinite Infinity damage, Charger teleport slams, self-expiring Bouncer minis, Blue Sun's eight rotating cyan lasers and post-ability cooldown, recursively splitting Snake bodies, Vampire damage steal, and the Cubed/Double/Tripler math ramps.
- Corrected percentage progression order so Centy actually opens at 1% and Vampire opens at 0% steal; the number-line bounce advances those values for the following impact while side/top-wall bounces keep their normal progression behavior.
- Classified Centy and Infinity as Very Powerful Math Orbs with the power-math audio/physics path. Added generated announcements for every new orb, the power-math group, and the Fibonacci/Orbital/Tripler pair combinations, preserving both live and source WAVs.
- Added Fibonacci + Orbital, Fibonacci + Tripler, and Orbital + Tripler combo titles and announcer clips while retaining the base-orb IDs and existing two-ability combination settings contract.
- Expanded deterministic tests for initial and follow-up percentage damage, quintillion-plus Infinity damage, every new ability, Bouncer lifetime cleanup, repeating Snake lineage, Blue Sun's projectile-only body contract and cooldown, team selection/URL round trips, combo normalization, announcer assets, and replay equality.
- Advanced browser cache keys to `20260729-race-expansion2`.

## Classic Radius Weapons, Impact Pause, And Replacement Audio Seam (2026-07-29)

- Unified each Classic weapon's visible attachment point and collision pivot at the orb radius. Melee handles sit five pixels under the orb so the body masks them naturally; Bow orbits outside the rim and uses a centered tangential clash capsule matching its visible curve.
- Kept the deterministic 1.75× movement/rotation profile and completed the requested impact language: the damaging weapon alone flips 180° and reverses direction on a hit, both weapons flip on a block, the simulation pauses for 0.1 seconds, and the victim becomes background tan while its health number stays visible.
- Enlarged Bow's deterministic arrow radius and rendered pixel projectile, enlarged title weapon icons, strengthened the orb's black outline, and kept Bow growth limited to one +2 progression per successful volley even if multiple arrows from that volley connect.
- Reworked Classic combat audio into explicit per-event replacement slots. Only `weapon-clash` is enabled now; all other Classic combat sources are silent with no synthesized fallback layered underneath. New rights-cleared samples can be installed by filling the null slots in `CLASSIC_AUDIO_POLICY`, without changing simulation events or affecting Orb Race/World Cup.
- Fixed `render_game_to_text` so Classic projectiles are no longer overwritten by the World Cup projectile list. Playwright verified the enlarged Bow arrow in flight, the tan hit-pause frame, reversed direction state, zero browser/page errors, and zero failed assets.
- Verification: `npm test` passes all 19 tests. The Classic Playwright smoke used the required web-game client plus focused live Sword/Bow, Bow/Unarmed, and Sword/Unarmed checks.
- TODO: replace each remaining null Classic audio slot only when its final rights-cleared sample is ready; the routing architecture is prepared.

## Orb Race Fibonacci Phi Emblem (2026-07-29)

- Replaced the live Fibonacci orb emblem with a clean, transparent black phi vector based on the newly supplied reference image; the earlier supplied PNG remains preserved as the original source reference.
- Added asset regression coverage for the active SVG emblem and advanced the page/social-renderer cache key to `20260729-fibo-symbol3` while preserving the newer shared Orb Race module key for the other modules.

## Orb Race Math Cap + Single Stacked Orbital Ring (2026-07-29)

- Raised the shared formula-orb damage cap to 1 sextillion, extended the power-math ramps that previously stopped below the cap, and kept the HUD `(MAX)` marker tied to the shared limit with full grouped-number formatting.
- Orbital now keeps one 25-slot ring. Orbiters after the first 25 stack into the existing visible slots instead of creating additional rings; a full ring uses 0.32 parent-radius satellites so adjacent bodies nearly touch.
- Reused the existing Orbital fighter ID, bounce/contact event metadata, audio-event flow, and URL/settings contracts; no child orb IDs or new URL fields were added.
- Advanced browser import cache keys to `20260729-orbital-stack1` and verified `npm test` plus the minimal Playwright Chromium page/state/console check with no page or console errors.

## Orb Race Fibonacci/Weapon Visuals (2026-07-28)

- Added the supplied Fibonacci symbol image to the Orb Race orb emblem, enlarged Drill projectiles, and made Poison damage emit only short-lived expanding/fading rings instead of persistent layer bubbles.
- Made Splodey bombs smaller and seeded each volley with randomized launch offsets and upward velocities so bombs rise above Splodey before falling under gravity.
- Advanced the browser cache key to `20260728-race-orb-visuals1`; the supplied Fibonacci asset is preserved in both live and source folders.

## Orb Race Power-Math Bounce Mix (2026-07-28)

- Removed the non-announcer ducking from the powerful math-orb guitar bounce. Effects, ambience, and music now remain audible while the boosted, priority-routed guitar cue still plays for its first second; announcer routing is unchanged.
- Advanced the browser/audio cache key to `20260728-race-math-mix1` and updated the audio regression to verify that power-math hits leave the non-announcer bus untouched.
- Verification: `npm test` passes; the minimal Playwright Chromium smoke/state check renders with no page or console errors.

## Orb Race Speedster/Flash Layer Ceilings (2026-07-28)

- Speedster, Flash, and their existing speed-trait compositions now calculate a top-wall-reaching launch arc from the active lane on every layer instead of reusing the opening-lane height.
- Long-form simulations use the previous number-wall boundary as the current lane's virtual ceiling. It remains a normal `top-wall` progression event without restoring damage or physics to a cleared layer.
- Threaded the existing social format into simulation creation without adding URL fields or orb IDs, and added fixed-step deterministic coverage for lower-layer Speedster/Flash arcs and portrait compatibility.
- Advanced the browser entry/import cache key to `20260728-race-layer-ceiling1` so the long-form physics path is loaded consistently.

## Orb Race Tilted Layer Piece Health (2026-07-28)

- Tilted number walls now keep independent left/right health per race team while ordinary layers and teammate sharing retain their existing health contract.
- Damage targets the contacted tilted piece, a single broken piece disappears without advancing the lane, and the layer advances only after both pieces reach zero.
- Added piece-level break events, replay capture state, renderer values/colors, deterministic fixed-step coverage, and preserved the existing Speedster/Flash tilted-wall glitch as a whole-wall special case.
- Advanced the browser entry and simulation/renderer import cache key to `20260728-race-tilted-health1`.
- Verification: `npm test` passes all 19 suites; the minimal Playwright Chromium smoke/state check passes with no page or console errors.

## Orb Race Count Milestone Announcements (2026-07-28)

- Added generated Alex number cues for 15, 20, 25, 30, 35, 40, 45, and 50; the existing Ten cue remains the 10-copy milestone.
- Exact milestone counts now prepend their number cue before the orb/combo announcement, while non-milestone counts between them remain unnumbered.
- Added `npm run audio:generate-count-milestones`, expanded the generated announcement set to 112 clips, and advanced the audio/page cache key to `20260728-race-count-audio1`.
- `npm test` passes all 17 tests; the cache-busted Playwright Chromium smoke check renders the app with no page or console errors.

## Orbital Cyan Theme (2026-07-28)

- Changed only the Orb Race Orbital palette to cyan `#00d8e8` with a light-cyan accent `#8ef0ff`; Classic Orb Foundry’s existing palette was left unchanged.
- Advanced the browser module cache key to `20260728-orbital-cyan1` and updated the Orbital color regression.

## Orb Race Orbital Line-Contact Effects (2026-07-28)

- Each visible Orbital satellite that crosses the active number line now emits the existing `race-bounce` event with its impact position and unique sound instance, so the standard bounce sample plays for every contact without inventing child orb IDs.
- The same contacts enqueue the renderer’s existing expanding/fading bounce circle at the satellite’s actual position and scale; parent Orbital bounces keep their existing effect and aggregate audio behavior.
- Added deterministic effect-position and audio-consumption regressions while preserving current damage, contact-index, and replay contracts.

## Orbital Dark Blue Theme (2026-07-28)

- Changed Orbital’s main color to dark blue `#123b72` with a readable light-blue accent `#7aa9e6` in both Orb Race and Classic Orb Foundry, including satellite bodies, rings, setup previews, and winner text.
- Added the color regression update and advanced the browser module cache key to `20260728-orbital-dark-blue1`.

## Orb Race Orbital Visible Contact Damage (2026-07-28)

- Orbital payload damage now resolves on deterministic fixed-step entry into the exact visible satellite/number-line contact, so spread-out orbiters deal their own scaled damage as they cross the line instead of waiting for a stacked parent-bounce multiplier.
- Kept the parent's stable fighter ID, current-contact indices, `raceOrbitalLineHits` summary, race-bounce events, and team DPS contract; satellite contacts expose their stable index as event metadata without creating child orb IDs.
- Advanced browser cache keys to `20260728-orbital-contact-indices2` and added deterministic spread-contact coverage.

## Orb Race Orbital Contact-Derived Damage (2026-07-28)

- Orbital bounce damage and team damage/sec now retain the exact satellite indices touching the active line from the same progressive 25-per-ring geometry used by rendering, instead of relying on a formation-independent scalar count.
- Preserved the legacy `raceOrbitalLineHits` summary for UI/replay compatibility while deriving live damage from the contact-index list.
- Advanced browser cache keys to `20260728-orbital-contact-indices1` and added exact-contact regression coverage.

## Orb Race Orbital Progressive Spread (2026-07-28)

- Orbital now uses 25 satellites per ring. Partial rings distribute their current satellites around the circle as they are gained, preserving the earlier spread-out growth behavior; satellite 26 begins the overlapping second ring.
- Advanced browser cache keys to `20260728-orbital-circle3` and added progressive-spread regressions.

## Orb Race Circular Orbital Rendering (2026-07-28)

- Orbital satellites now render with one shared pixel scale for both axes, keeping each deterministic ring circular around the parent in portrait and long-form layouts while preserving the simulation’s normalized contact geometry.
- Advanced browser cache keys to `20260728-orbital-circle2` and added circular-coordinate/rendering regressions.

## Orb Race Orbital Weapon Rings (2026-07-28)

- Orbital no longer deals direct bounce damage. Its scaled damage is applied only by satellite orbs touching the active number line, and team damage/sec now uses the current touching-satellite count instead of multiplying by the total orbiter count.
- Orbital satellites use a shared deterministic 50-per-ring geometry. The fifty-first satellite begins an overlapping ring, and the renderer and line-contact physics consume the same positions without creating new orb IDs.
- Advanced browser cache keys to `20260728-orbital-weapon-rings1` and added simulation/replay/renderer regressions for weapon damage, line contact, team DPS, and overlapping rings.

## Orb Race Drill Two-Second Cooldown (2026-07-27)

- Reduced the deterministic Drill launch interval from three seconds to two seconds for base and composed Drill racers; contact-only spawning and drag scaling remain unchanged.
- Advanced browser cache keys to `20260727-drill-two-second-cooldown1` and updated cadence regressions.

## Orb Race Long-Form Drill Contact Launches (2026-07-27)

- Long Race headers now include the current Drill `DRAG` value alongside the existing damage metric.
- Drill projectiles only spawn while the main orb is touching the active number layer; ready timers wait through midair travel, including the opening launch path.
- Advanced browser cache keys to `20260727-drill-contact-longform1` and added deterministic simulation/long-form HUD regressions.

## Orb Race Drill Drag Scaling (2026-07-27)

- Drill `DRAG` now derives from the deterministic bounce count for both base and composed Drill racers, so the visible stat continues scaling even when damage scaling is disabled.
- Drill projectile speed uses the same fixed-step drag ramp on number-line and wall bounces; no new orb IDs or URL fields were added.
- Advanced browser cache keys to `20260727-drill-drag-scaling1` and added simulation/HUD regressions.

## Orb Race Weapon Combo Payload Damage (2026-07-27)

- Projectile-only body damage now follows composed abilities, so combos containing Drill, Lazer, Splodey, or Poison cannot deal direct number-line bounce damage while their ranged/timed channels remain active.
- Weapon combo HUDs show the composed damage value plus the weapon metric (`DRAG`, `LAZER`, `BOMBS`, or `POISON`). Slammy remains a damage-value ramp; its damage now powers Drill projectiles and Splodey bombs without adding body bounce damage to a weapon combo.
- Advanced browser cache keys to `20260727-weapon-combo-damage1` and added simulation/HUD regressions.

## Orb Race Drill Combo Announcements (2026-07-27)

- Added names and generated Alex announcer clips for all nine Drill pairings: `SPEEDDRILL`, `GRAVDRILL`, `FIBODRILL`, `LAZERDRILL`, `DRILLPLODEY`, `GROWDRILL`, `STICKDRILL`, `SLAMDRILL`, and `POISONDRILL`.
- Drill combo selection now resolves to its generated combo cue instead of the base-orb fallback; reversed ability order still shares the same unordered title, colors, and clip.
- Added `npm run audio:generate-drill-combos`, expanded the generated combo manifest to 45 pairings, and advanced browser/announcer cache keys to `20260727-drill-combo-audio1`.
- `npm test` passes all 17 tests; the required Playwright Chromium smoke check renders the app with no page or console errors.

## Orb Race Drill Combo Ability (2026-07-27)

- Drill is now a composable trait in the existing Orb Race combo registry. Eligible combo orbs can borrow its timer-based piercing projectiles, while base Drill keeps its stable ID and projectile-only body damage contract.
- Borrowed Drill initializes and advances the existing three-second timer, slows future projectiles after number-line bounces, contributes projectile DPS, renders in portrait/long-form output, and keeps the existing `race-drill` audio event identity. Unnamed Drill pairs use the existing stable-label and base-announcement fallback, so no new orb IDs or audio clips are required.
- Advanced browser module cache keys to `20260727-drill-combo-audio1`; added settings/URL, deterministic simulation, HUD, and renderer regressions.

## Orb Race Sticky Fast Tick Cadence (2026-07-27)

- Sticky now applies damage every 0.05 seconds, doubling the cadence to 20 deterministic ticks per second. The Sticky audio event cadence uses the same interval so damage and event streams remain aligned.
- Per-tick level scaling and `level × 0.1` hold durations remain unchanged; the faster cadence intentionally increases total damage during each hold. Browser simulation cache keys advanced to `20260727-sticky-fast-ticks1`.
- Added cadence and total-damage regression assertions; `npm test` passes all 17 tests and the minimal Playwright Chromium smoke check reports no page or console errors.

## Orb Race Sticky Level Damage Scaling (2026-07-27)

- Sticky timed damage now preserves the earlier level-one value of 2 damage, then follows a `level + 2` per-tick ramp for level 2 and above: level 7 = 9, level 15 = 17, and level 20 = 22.
- Hold duration remains `level × 0.1` seconds, team damage-per-second reporting uses the same scaled tick amount, and Fibonacci/combo damage composition remains intact.
- When `SCALING DAMAGE` is disabled, Sticky keeps its existing fixed base tick damage and does not use the level ramp.
- Advanced simulation browser cache keys to `20260727-sticky-level-scaling1` and added exact level 7/15/20 regression coverage.

## Orb Race Duplicator Number-Line Threshold (2026-07-27)

- Duplicator now creates a child every 12 number-line bounces. Side-wall and top-wall hits still advance the normal bounce state used by other orb abilities, but never advance Duplicator's duplication counter.
- Main and child orb counters are initialized and captured independently so stable IDs, replay state, seeded randomness, and independent duplicate behavior remain unchanged.
- Updated the race picker and long-form descriptor copy to call out the 12 number-line bounce threshold, and advanced browser cache keys to `20260727-duplicator-12-bounces1`.

## Orb Race Sticky Damage Tick Rate (2026-07-27)

- Sticky now treats its composed damage value as the amount of each deterministic 0.1-second damage tick instead of applying that value as a per-second rate. A level-one hold therefore deals 2 total damage over its 0.1-second duration; level-two lasts 0.2 seconds and delivers two ticks using its current composed damage, preserving Fibonacci/combo scaling.
- The fixed-step physics applies the final partial tick at hold expiry so level-duration totals are not lost to 1/120-second rounding. Team damage-per-second reporting now reflects the increased active Sticky rate, while bounce counters, ability levels, trails, and event identity remain unchanged.
- Advanced browser module cache keys to `20260727-sticky-damage-rate1` and added level-one/level-two deterministic damage regression coverage.

## Orb Race Hide Damage Stat When Scaling Is Off (2026-07-27)

- Orb Race HUDs now omit generic `DAMAGE`/`WEAPON DAMAGE` lines when the selected racer has `SCALING DAMAGE` disabled; ability-specific metrics such as `SPEED`, `FIBO`, `GRAVITY LEVEL`, and `STICK LEVEL` remain visible.
- Long-form team headers also suppress `DAMAGE/SEC` when every member has scaling damage disabled, while mixed teams retain their aggregate damage line.
- Added portrait HUD coverage and advanced the browser entry/cache key to `20260727-race-no-scaling-damage-hud1`.

## Classic Impact And Hit Visual Removal (2026-07-27)

- Removed Classic Orb Foundry impact, clash, collision, ranged-hit, knockout, and body-hit markers, including the generated impact PNGs, clash cross, hit flash, and impact screen shake; combat events, hit-stop timing, damage, and audio remain unchanged.
- Kept the shared impact presentation available to Orb Race and World Cup modes, and advanced the Classic browser module cache key to `20260727-classic-no-hit-visuals1`.
- Added renderer coverage for the Classic-only effect filter. The browser gameplay check recorded zero generic impact PNG draws, showed health changing during Sword vs Bow combat, and reported no page or console errors.

## Classic Orb Racer Voice And Intro Splice (2026-07-27)

- Generated Sword, Bow, Potion, Axe, Dagger, and Katana callouts with the exact Orb Racer Alex/rate-175/24 kHz mono/96 kbps MP3 pipeline; regenerated the six active/source pairs as real encoded clips and added a minimum-size regression so placeholder files cannot pass.
- Classic Orb Foundry now uses the Orb Racer voice set for all eleven orb names and splices `orb → race-versus → orb → race-pick-your-winner` at runtime, matching Orb Race.
- Added `npm run audio:generate-classic-race-voice`, advanced the audio module and announcer cache key to `20260727-classic-race-voice2`, and preserved the former Daniel WAV set.

## Orb Race Finish-Loser Particle Burst (2026-07-27)

- When a team crosses the finish line, every opposing orb now receives one deterministic burst using the existing 12-particle layer-break effect, colored by its orb or combo theme.
- Losing orbs disappear into the burst, while portrait and long-form renderers animate the particles through the post-finish recording tail so they disperse and fade instead of freezing.
- Added deterministic finish-effect coverage, advanced browser module cache keys to `20260727-race-finish-explosion1`, and verified `npm test` plus Playwright Chromium portrait/long-form captures with no page or console errors.

## Orb Race Trillion Walls, Math Caps, And Per-Orb Sizing (2026-07-27)

- Expanded each editable Orb Race number-wall strength from 1,000,000,000 to 1,000,000,000,000 while keeping the maximum number of walls at 50.
- Expanded formula-orb damage to a shared 1,000,000,000,000,000 cap and mark capped math damage as `(MAX)` in the race HUD.
- Added `raceTeamOptions[teamIndex][orbId].orbScale`, with Full, Compact, and Mini controls per selected orb. The existing global `raceOrbScale` remains the legacy/default fallback, so old URLs and deterministic quantity/team contracts continue to work.
- Advanced browser module cache keys to `20260727-race-trillion-scale1` and added normalization, simulation, renderer, URL, and UI coverage for the new limits and per-orb size overrides.

## Orb Race Numbered Announcements (2026-07-24)

- Generated Alex count cues for One through Ten, preserving active clips and matching source copies under the race announcer asset folders.
- Single-orb race teams with 2–10 copies now prepend the configured copy count before the existing orb or combo announcement; a single copy keeps the existing announcement, counts above ten remain unnumbered for now, and group/Everyone announcements are unchanged.
- Added `npm run audio:generate-race-counts`, advanced the browser/announcer cache key to `20260724-race-count-announcements1`, and verified all ten clips load in Playwright with no console or page errors.

## Orb Race Power-Math Guitar Mix (2026-07-24)

- Boosted the supplied guitar string hit for X-to-the-X, Quadratic, and Factorial number-line bounces, keeping playback capped at the first second.
- Routed that guitar through a priority effects bus so it stays full-volume while the ordinary effects, ambience, and music bus drops to 1.5% for the hit; announcer audio remains untouched.
- Advanced browser/module, announcer, and sample cache keys to `20260724-math-power-audio1`.
- Added overlap-safe gain automation, focused audio-routing assertions, and verified `npm test` plus a Playwright Chromium smoke check with no page or console errors.

## Orb Race Long-Form Header Density (2026-07-24)

- Long-form headers now omit ability descriptions for repeated copies of the same orb and for teams with five or more balls; the damage/countdown line moves into the freed header row.
- Two different orb types with fewer than five members retain their combined ability descriptions. Browser/module/announcer cache key advanced to `20260724-race-longform-descriptions1`.

## Orb Race Hydrogen Countdown HUD (2026-07-24)

- Restored Hydrogen Bomb's visible `xx.xxxS` timer with millisecond precision in portrait stats and long-form headers, without a label.
- The countdown uses the existing deterministic `raceHydrogenCountdownElapsed` state and red Hydrogen warning text; damage text and cooldown/ability bars remain hidden.

## Orb Race Hydrogen Flash Audio (2026-07-24)

- Extended the deterministic Hydrogen Bomb white flash from two seconds to four seconds. The bomber remains held during the flash and falls through the cleared course only after the full window.
- Added the supplied ear-ringing sample as `race-hydrogen-bomb-flash-start`, capped to the four-second flash while preserving the explosion sample and countdown-siren stop event.
- Preserved the source asset under `assets/audio/source/race-effects-20260724/`, registered the live effect as `hydrogen-bomb-ear-ringing.mp3`, and advanced the sample cache key to `20260724-hydrogen-bomb-flash-audio1`.

## Orb Race Hydrogen Bomb Announcer (2026-07-24)

- Added `Hydrogen Bomb` to the stable Orb Race announcer-name registry and generated its local Alex intro cue alongside the existing countdown siren. The active/source pair is `race-hydrogen-bomb.mp3`.

## Orb Race Hydrogen Presentation And Explosion Audio (2026-07-24)

- Hydrogen Bomb now uses the supplied round radiation image as its complete ball body; the source PNG remains unchanged while the renderer uses its exact upper square to omit only the screenshot watermark area. Hydrogen no longer renders countdown or damage HUD text, and its visible matchup/header text uses the red warning color.
- The bomber remains stationary during the four-second white flash, then falls visibly through the cleared course and crosses the finish line before the normal race finish/victory state.
- Registered the supplied `soundreality-explosion-fx-343683.mp3` as `hydrogen-bomb-explosion.mp3`, played by `race-hydrogen-bomb-explosion` after the countdown siren stops; sample cache version is `20260724-hydrogen-bomb-explosion1`.
- `npm test` passes all feature, simulation, and social/audio suites. Playwright was attempted through the required client, but this environment blocks HTTP server binding and Chromium startup with permission errors.

## Orb Race Layer-Break Particle Visibility (2026-07-24)

- Enlarged and accelerated deterministic layer-break particles so bursts travel substantially farther from the impact, remain visible for 2.6 seconds, and fade gradually instead of disappearing in under a second.
- Added contrast keylines around each particle and alternate combo particles between the two composed orb theme colors; the shared browser/announcer cache key is now `20260724-race-particles1` and the current sample cache remains `20260724-hydrogen-bomb-siren1`.

## Orb Race Bold Outer Frame (2026-07-24)

- Increased the outer portrait and long-form Orb Race box outlines and draw the portrait perimeter last so layer cards, finish graphics, and effects cannot soften it; inset number-card borders remain lighter for hierarchy.
- Advanced the shared browser/announcer cache key to `20260724-race-bold-frame1`; the current sample cache remains `20260724-hydrogen-bomb-siren1`.

## Orb Race Ability HUD And Power Math Tuning (2026-07-24)

- Hydrogen Bomb has no damage stat or cooldown/ability bar; its supplied radiation-symbol PNG is preserved byte-for-byte and used as the orb emblem.
- Ying Yang modes are mutually exclusive: speed mode always exposes 1 damage and only its independent speed ramp, while damage mode restores unboosted movement and only its independent damage ramp.
- The strongest current math set is X-power (`n^n`), Quadratic (`2^n`), and Factorial (`n!`). Keep these stable IDs on the `race-math-power` guitar bounce cue and give them the slightly slower power-math movement tuning than Fibonacci, Golden Ratio, Prime, Integral, and Pi.

## Orb Race Hydrogen Bomb Countdown (2026-07-24)

- Added stable base ID `hydrogen-bomb` with zero direct bounce damage and no composable ability. Its deterministic fixed-step timer emits `race-hydrogen-bomb-countdown-start` at 60 seconds of race time, then `race-hydrogen-bomb-explosion` with a four-second flash window.
- The explosion clears every team layer, removes all non-bomber racers without creating new fighter IDs, and lets the Hydrogen Bomb fall through the cleared course before emitting the normal Orb Race finish/victory events. Ranged/projectile damage remains distinct from this direct-bounce finish path.
- Renderer support uses the supplied yellow/black radiation-symbol image and a full-canvas white flash. Media/rendering should consume the countdown-start event as a looped `hydrogen-bomb-siren.mp3` sample and stop it on the explosion event; the explosion now plays the dedicated `hydrogen-bomb-explosion.mp3` sample.
- Preserved the supplied siren source under `assets/audio/source/race-effects-20260724/` and registered the shipped effect under `assets/audio/effects/hydrogen-bomb-siren.mp3`.

## Orb Race Announcer Voice Refresh (2026-07-24)

- Regenerated all 79 Orb Race announcements—base orbs, groups, combos, Hydrogen Bomb, and shared race cues—with the original local macOS `Alex` voice at rate `175`, matching the old male/robotic X-to-the-X cue; the supplied `wise/` clips remain untouched. The generated files are mono 24 kHz MP3s encoded at 96 kbps so short one-word cues remain valid assets.
- Preserved the previous generated source set under `assets/audio/source/race-announcer-generated-samantha-20260724/`; no external voice upload is needed.
- The generated `race-pick-your-winner` cue retains a 350 ms pre-speech pause; browser/announcer cache key advanced to `20260724-race-alex-hydrogen1`.

## Orb Race Pick-Your-Winner Pause (2026-07-24)

- Added a 350 ms pre-speech pause to the generated Orb Race `race-pick-your-winner` announcement so the cue enters cleanly after the matchup announcements.
- Regenerated the active clip and its preserved source copy with the existing Samantha/FFmpeg pipeline; the runtime mapping and Classic/World Cup prompts are unchanged.

## Orb Race Combo Naming, Ying Yang Modes, And Layer-Break Particles (2026-07-24)

- Added the 15 new two-ability names for Slammy and Poison: `SPEEDSLAMMY`, `GRAVSLAMMY`, `FIBSLAMMY`, `LAZSLAMMY`, `SLAMPLODEY`, `GROWSLAMMY`, `STICKSLAMMY`, `SPEEDPOISON`, `GRAVPOISON`, `POISONACCI`, `LAZERPOISON`, `POISONPLODEY`, `GROWPOISON`, `STICKPOISON`, and `SLAMPOISON`, bringing the registry to all 36 unordered two-ability pairs.
- Combo titles follow the established readable-stem convention: keep recognizable ability stems, reorder them at the seam when that makes a cleaner mashup, and store one unordered key so reversed selections share the same title, colors, and announcer cue. Generated audio uses `npm run audio:generate-combos`; active clips live in `assets/audio/announcer/generated-race/` with matching source copies in `assets/audio/source/race-announcer-generated/`.
- Slammy's HUD now uses the generic `DAMAGE` label. Ying Yang switches its HUD stat, text theme, and gradual number-layer tint between black damage mode and white speed mode; only the active mode's boost ramps.
- Number-layer destruction now emits deterministic 12-particle bursts at the impact coordinates. The bursts are carried through replay state and rendered as small outward-flying particles; the shared browser/announcer cache key is `20260724-race-announcer-style1` and the current sample cache is `20260724-hydrogen-bomb-siren1`.

## Orb Race Generated Pick-Your-Winner Announcement (2026-07-24)

- Replaced the Orb Race `race-pick-your-winner` runtime cue with a locally generated Samantha announcement; Classic and World Cup winner prompts remain unchanged.
- Preserved the generated active/source pair under `assets/audio/announcer/generated-race/` and `assets/audio/source/race-announcer-generated/`, and advanced the announcer/browser cache key to `20260724-race-pick-winner-audio1`.
- Added the cue to the existing deterministic race-announcement generator so it can be regenerated with `npm run audio:generate-new-orbs`; the historical supplied clip remains preserved.

## Orb Race Layer Break Sound Replacement (2026-07-24)

- Replaced the active `race-layer-break.mp3` cue with the supplied `loud_metal_clang_#2-1784919606548.mp3` clip.
- Preserved the previous metallic clang and the new source copy under `assets/audio/source/race-effects-20260724/`.
- Advanced the sample/module cache key to `20260724-race-layer-break2`; the existing layer-break event routing and one-cue-on-destruction behavior are unchanged.

## Orb Race Theme HUD And Gradual Layer Tint (2026-07-24)

- Combo HUD lines now use the theme color of the attribute they describe, so a Speed + Sticky combo renders `SPEED` blue and `STICK LEVEL` orange; non-combo lines retain the base orb theme.
- Number layers now interpolate from white toward the team orb theme as their configured health is depleted in both portrait and long-form race renderers, with configured layer strengths carried in simulation state for accurate custom courses.
- Added renderer regressions for per-attribute colors and progressive layer tinting; kept the shared browser module cache key at the concurrent `20260724-race-new-orb-audio1` version.

## Orb Race Math Power And New Orb Audio (2026-07-24)

- Routed the supplied `ancient_asian_guitar_#4-1784918317713.mp3` as `race-math-power.mp3` for the three fastest-growing formula racers: X-to-the-X (`n^n`), Quadratic (`2^n`), and Factorial (`n!`). Fibonacci, Golden Ratio, Prime, Integral, and Pi retain the choir math bounce cue; X² retains the standard bounce cue.
- Added the existing burn-tick sample to `race-poison-tick` with a short, rate-limited mix so Poison’s timed layer damage has audible feedback without flooding the recording.
- Added `race-ying-yang-switch` audio routing that alternates the Black Hole warp sample’s departure and arrival halves whenever Ying Yang changes modes.
- Preserved the guitar source under `assets/audio/source/race-effects-20260724/` and advanced browser/sample cache keys to `20260724-race-math-audio1`.

## Orb Race New Orb Announcer Audio (2026-07-24)

- Generated and registered the four missing base announcers: Unarmed, Slammy, Ying Yang, and Poison.
- Active clips live under `assets/audio/announcer/generated-race/`; byte-identical source copies are preserved under `assets/audio/source/race-announcer-generated/`.
- Added `npm run audio:generate-new-orbs` for deterministic regeneration with the existing Samantha/FFmpeg audio pipeline; announcer cache keys advanced to `20260724-race-new-orb-audio1`.

## Orb Race Compact Stat HUD (2026-07-24)

- Replaced combo stat cards with exactly two ability metrics, removing generic damage and explicit `COMBO:` text; labels now include `FIBO`, `GRAVITY LEVEL`, and `STICK LEVEL`.
- Multi-orb stat columns no longer print each orb name, and duplicate-heavy teams collapse to their unique metric pairs. Quadratic now shows `DAMAGE` plus its current `QUADRATIC: X^n` stage.
- Added renderer regressions for Speedster + Sticky, Fibonacci + Gravity, compact multi-orb teams, name removal, and Quadratic HUD output; module cache keys advanced to `20260724-race-stats-fix2` while retaining the shared audio asset version.
- Browser-smoked the dedicated `#socialCanvas` with Speedster + Sticky versus Orbital; the canvas emitted `SPEED` and `STICK LEVEL` metrics with no `COMBO:` label, no stat-card orb names, and zero console errors.

## Orb Race Layer Break Sound (2026-07-24)

- Added the supplied metallic clang as `race-layer-break.mp3` and preserved the original download under `assets/audio/source/race-effects-20260724/`.
- Layer health now emits one `race-layer-break` event when a positive-health number layer reaches zero, covering direct impacts, projectiles, and timed/ranged damage.
- Breaking number-line impacts use the metallic cue instead of stacking the ordinary bounce cue; browser/sample cache keys advanced to `20260724-race-layer-break1`.
- Added simulation and audio-routing regressions.

## Orb Race Unarmed, Slammy, Ying Yang, And Poison (2026-07-24)

- Added stable base IDs `unarmed`, `slammy`, `ying-yang`, and `poison` without changing fighter ID generation or quantity expansion. Unarmed is gray and gains the normal +1 damage and Speedster movement ramp on every qualifying bounce. Slammy adds a +2 damage ramp per qualifying bounce and is registered as a composable ability. Ying Yang alternates between black damage mode and white/black-outline speed mode every five simulation seconds; its damage and speed counters ramp independently and it intentionally has no cooldown bar. Poison is purple, has zero direct body damage, and applies a layer poison that starts at 0 DPS and increases by 1 DPS on each number-line bounce; Poison is also composable.
- Renderer state handoff: use `raceYingYangMode`, `raceYingYangDamageLevel`, and `raceYingYangSpeedLevel` for Ying Yang presentation; use `racePoisonLayerIndex`, `racePoisonActiveDamage`, and `racePoisonTotal` for Poison effects. Poison emits `race-poison-applied` on each number-line bounce and `race-poison-tick` while its active layer DPS is nonzero. All events retain `raceAbilityIds` and base `raceOrbId` identity.
- Announcer clips for Unarmed, Slammy, Ying Yang, and Poison are now generated and registered. No Slammy/Poison combo clips were added because no combo titles have been assigned. Unarmed and Slammy reuse the existing `race-bounce`/orb-collision treatment; Poison has a dedicated `race-poison-tick` treatment, and Ying Yang has a warp cue on state switches.

## Orb Race Combo-Only Color Splits (2026-07-24)

- Removed the team-member color fallback from orb bodies. Only racers with two composed abilities now render as split-color combo orbs; separate base orbs such as Speedster + Duplicator remain solid in their own colors.
- Added a regression for base-orb teams and advanced browser cache keys to `20260724-race-color-fix1`.

## Orb Race Layer Destruction Bounce And Zero-Layer Cleanup (2026-07-22)

- Restored one rebound impulse when an orb's direct number-line impact depletes the layer; ranged destruction still leaves the orb falling through.
- Black Hole suction now advances immediately past a zero-health active layer, and portrait/long-form renderers omit every zero-health layer instead of drawing an empty `0` card.
- Added deterministic simulation and renderer regressions; browser cache keys advanced to `20260722-race-layer-fix1`.
- The Playwright client remains unavailable because `playwright` is not installed; headless Chrome/CDP verified direct rebound (`raceVy < 0`), ranged fall-through (`raceVy = 0`), zero-health cleanup, and no console errors.

## Orb Race Grower Growth Rate Adjustment (2026-07-22)

- Set Grower growth to `4%` per number-line bounce (`+0.04` normalized scale); its layer-aware cap and top-of-box placement remain unchanged.
- Advanced browser cache keys to `20260722-race-grower4` and updated the fixed-step regression expectation.

## Orb Race Grower Tenfold Growth And Box Ceiling (2026-07-22)

- Increased Grower growth from `+0.02` to `+0.2` scale per bounce.
- Made the growth cap depend on the active layer’s distance to the top of the race box, so lower layers can grow beyond the first-layer cap while still fitting between the box top and active number line.
- Re-seated Grower after each number-line growth event and aligned portrait rendering with the simulation radius, preventing the enlarged orb from drawing through a number line. Browser cache keys advanced to `20260722-race-grower1`.
- Added lower-layer, top-box, post-growth placement, and renderer-radius regressions. The Playwright client was unavailable because `playwright` is not installed; headless Chrome/CDP verification passed with no console errors.

## Orb Race Combo Title Names And Color Mixing (2026-07-22)

- Added the requested names for all 21 two-ability combinations, including `FIBPLODEY`, `STICKONACCI`, `GROWPLODEY`, and `STICKPLODEY`; reversed selection order resolves to the same title.
- Combo title text now uses the two ability colors at the name seam in both portrait matchup titles and landscape track headers; winner text uses the same palette.
- Added feature and renderer regressions and verified portrait and landscape combo canvases in headless Chrome with no console errors. The shared browser cache key remains `20260722-race-combo-audio1`.

## Orb Race Combo Announcer Audio (2026-07-22)

- Added generated names and announcer cues for all 21 unique two-ability combinations, including Speedynacci.
- Reversed base/borrowed ability order reuses the same combo clip; three-or-more ability stacks retain the base-orb announcement.
- Generated mono MP3 source/active pairs with the local Samantha voice and added `npm run audio:generate-combos` for regeneration.
- Bumped browser/audio cache keys to `20260722-race-combo-audio1` and added intro-sequence and asset-integrity coverage.
- `npm test` passes all three suites; all changed JavaScript modules pass `node --check`.

## Orb Race Cleared-Wall Fall-Through And Grower Cap (2026-07-22)

- Cleared number layers now disappear immediately for every member of a team. All active orbs use the next layer as their only physical floor, and the old transition fields remain inert for replay/state compatibility.
- Increased Grower’s scale gain from `+0.01` to `+0.02` per main-orb bounce and capped it at the top-chamber diameter limit (`2.722222...` scale), including Grower as a composed ability.
- Added regressions for shared multi-orb fall-through, no cleared-wall rebound, faster growth, and the stable cap. Preserved the checkout’s current shared race import/cache key.
- `npm test` passes all three suites. Browser-smoked direct fixed-step physics and a rendered multi-orb Orb Race through headless Chrome/CDP with no console issues.

## Orb Race Combo Orb Color Split (2026-07-22)

- Combo ability bodies now split into two deterministic vertical color halves; Fibonacci + Splodey renders Fibonacci green on the left and Splodey orange on the right.
- Two-orb team loadouts also share the selected member colors across each orb body when two distinct team colors are available.
- Added renderer regression coverage, advanced browser cache keys to `20260722-race-sandbox25`, and verified the live combo canvas with no new console errors.

## Orb Race Sandbox Composable Ability Mechanics (2026-07-22)

- Completed the seven composable Orb Race abilities without adding orb IDs: Speedster, Gravity, Fibonacci, Lazer, Splodey, Grower, and Sticky now compose through `raceHasAbility(...)` while preserving base identity for color, symbol, name, announcement, and projectile-only body rules.
- Added deterministic fixed-step movement/damage composition, borrowed beams/bomb volleys/sticky ticks, Fibonacci channel damage, gravity arc changes, Grower scale, per-copy projectile ownership, replay state, and aggregate quantity/team DPS. Sticky ticks and other timed/projectile effects do not advance bounce policies.
- Routed borrowed ability events through the existing audio event/sample contracts and preserved per-fighter race sound rate limits. Added the compact combo HUD for both individual and collapsed quantity teams, with safe truncation.
- Added regressions for five-copy independence, deterministic event streams and winners, unequal-quantity winners, all listed ability combinations, legacy URLs, borrowed renderer paths, and audio routing. Browser cache keys advanced to `20260722-race-sandbox24`.
- Browser-smoked 5× Splodey + Speedster versus 3× Sticky + Fibonacci through headless Chrome/CDP: the live canvas rendered the quantity teams and active channels with zero console errors or warnings. No interaction decisions remain unresolved.

## Orb Race Sandbox Loadouts And Combo Architecture (2026-07-22)

- Extended each selected Orb Race type with a deterministic quantity (`count`, 1–50) and expanded quantities into independent simulation fighters with stable copy indices; team labels format a single repeated type as `5× SPLODEY`.
- Added reusable combo-trait metadata for Speedster, Gravity, Fibonacci, Lazer, Splodey, Grower, and Sticky. Eligible base racers now store `raceAbilityIds`, and `raceHasAbility(...)` is the gameplay seam for Luna's composition refactor—no combo orb IDs were introduced.
- Added setup controls for per-orb amounts and borrowed-ability toggles, persisted both through the existing compact settings/URL options object, exposed them in `render_game_to_text`, and added a compact combo HUD line.
- Enriched race events with composed ability IDs. Borrowed Fibonacci already selects the existing math-bounce sample, and audio rate limiting now keys all race sounds per fighter so repeated same-type racers do not silence each other.
- Added `LUNA_ORB_RACE_SANDBOX_HANDOFF.md` with the exact mechanics, audio, renderer, determinism, and test work Luna should complete.
- Added settings, normalization, quantity expansion, event metadata, audio-routing, and URL round-trip regressions. `npm test` passes all three suites.
- Browser-smoked 5× Splodey + Speedster versus 3× Sticky + Fibonacci: setup controls render correctly, URL state contains the counts/traits, simulation text exposes five and three independent copies, team labels include quantities, and the browser console reports zero errors/warnings.

## Orb Race Length Presets And Open Long-Form Start (2026-07-22)

- Replaced the single long-form shortcut with explicit Short Race (portrait, 3 layers) and Long Race (16:9, 50 layers) presets; custom layer strengths and counts remain editable after choosing a preset.
- Removed the pale center gutter divider between long-form tracks.
- Removed the horizontal opening rule between the launch chamber and first number wall while retaining the board sides and the remaining number-card borders.
- Added setup markup and renderer regression coverage and advanced browser cache keys to `race-length21`.
- Browser-smoked Short → Long with Speedster vs Orbital: presets resolve to portrait/3 and 1920×1080/50 respectively, the canvas has no opening rule or center divider, and the console is clean. `npm test` passes all three suites.

## Long-Form Canonical Physics And Discrete Leader Camera (2026-07-22)

- Fixed the root physics compression: every Orb Race now uses the original three-layer portrait lane height, while races with more layers extend the same physical course downward instead of squeezing walls into the normalized portrait span.
- Routed racer floors, finish triggers, lasers, drills, batarangs, bombs, boomerangs, mines, Meteor projectiles, bouncing weapons, orbital wall hits, and Godzilla wall/finish positions through shared canonical layer geometry. Three-layer launch positions, velocities, gravity, arcs, wall response, and finish placement remain unchanged.
- Preserved the explicit broken-wall rebound transition: racers launch upward from the cleared wall, physically fall through its former position, and collide with the next full-spacing wall.
- Reworked long-form projection for extended simulation Y and made its single shared camera derive only from the leading team's discrete layer index; bounce arcs, raceY, effects, duplicates, impacts, and the lagging track cannot move the camera target. After a winner exists, leader selection uses `winningRaceTeamIndex`.
- Kept the side-by-side shortened boards, slim inset cards, and equal card spacing unchanged; bumped browser cache keys to `race-longform20`.
- Added regressions for format-independent shared physics, canonical 50-layer spacing, broken-wall rebound then physical fall, extended world mapping, bounce-stable scalar camera targeting, lagging-team isolation, and winner-follow selection. `npm test` passes all three suites.
- Headless-Chrome/CDP smoke verified a live, non-duplicator Speedster vs Orbital 50-layer race at layer 8: the dedicated 1920×1080 canvas retained the shortened side-by-side boards, slim inset cards, full visible arcs, and shared framing with no console warnings/errors. The bundled Playwright client and in-app browser session were unavailable, so the repository's existing Chrome/CDP test pattern was used. TODO: none.

## Long-Form Leader Camera And Rebound Mapping (2026-07-22)

- Replaced independent long-form track cameras with one deterministic, monotonic camera that follows the leading/winning team and eases downward slowly; a trailing track is allowed to remain behind.
- Corrected long-form world-Y mapping so the full upward and downward arc is visible across the chamber, gaps, and number walls instead of clamping an orb above the previous wall (the source of horizontal-only-looking motion).
- Slimmed layer cards with matched card/gap spacing, slightly larger horizontal insets, and shorter chamber/finish proportions; bumped browser cache keys to `race-longform18`.
- Added a modest top/bottom margin so the long-form board is shorter than the full canvas, while keeping both boards identical; cache key advanced to `race-longform19`.
- Verified a non-duplicator Speedster vs Orbital browser smoke path renders vertical rebound trails with no console warnings/errors; full `npm test` passes all three suites.

## Long-Form Slim Layer Cards (2026-07-22)
- Reworked each long-form track as one continuous outer box with inset slim number cards and generous white spacing between cards.
- Cleared layers now disappear without stale card borders or numbers; remaining layers stay centered inside the box.
- Corrected long-form world mapping so a racer’s full ballistic arc remains visible on every layer instead of clamping below the active line and appearing stuck.
- Long-form impact flashes are suppressed and Orb Race board translation remains disabled, eliminating presentation camera shake.
- Refreshed browser cache keys to `race-longform17`.

## Long-Form Camera And Layer Window (2026-07-22)
- Removed Orb Race board translation on impact; long-form tracks no longer shake from bounce or impact events.
- Added independent eased cameras for the two side-by-side tracks. Cameras hold their position for three layer breaks, then glide to the next group.
- Tuned the long-form viewport to show roughly seven number layers at a time, with small white gaps between rows and a continuous frame around the header/chamber.
- Kept the shared fixed-step racer physics and explicit old-wall rebound before descent; presentation camera movement cannot alter simulation state.
- Refreshed browser cache keys to `race-longform16`.

## Long-Form Layer Rebound And Camera Stability (2026-07-22)
- Kept the 16:9 Orb Race composition on two equal side-by-side boards with thin numbered walls, a large launch chamber, fixed outlined headers, and a bounded finish checkerboard.
- Added explicit per-orb transition state so a cleared wall produces a real rebound before an orb switches to the next layer; team members no longer fall through a shared wall when another orb clears it first.
- Kept the camera target shared between both tracks and eased it every frame, so descent follows the racers smoothly without impact-driven board shaking.
- Refreshed browser cache keys to `race-longform11`; `npm test` passes all three suites.

## Orb Race Long-Form Export (2026-07-22)
- Added a backward-compatible `race-landscape` social format at exactly 1920×1080 for YouTube long-form videos.
- Orb Race now supports 1–50 configurable number layers; the Long Form profile switches to 16:9 and pre-populates 50 editable number-wall fields while layer counts and strengths round-trip through `cfg` URLs. Legacy three-layer links remain unchanged.
- Added a side-by-side long-form renderer with centered race columns, fixed name/stat headers, camera-following layer scroll, cleared-wall blanking, and bounded finish checkerboards. Existing portrait/square/landscape race presentation remains intact.
- Added settings, simulation, geometry, format, and deterministic custom-layer tests; refreshed browser cache keys.

## Meteor Damage Ramp (2026-07-17)
- Added a deterministic time-based Meteor damage multiplier that increases by 2% per battle second.
- Applied the multiplier to the live Meteor damage display, tiny meteors, giant summons, and five-second burn patches.
- Added simulation coverage for multiplier progression and later giant-meteor damage; refreshed browser cache keys.
- `npm test` passes all three suites.

## Meteor Apex Throws And Giant Damage Scaling (2026-07-17)
- Small meteors now launch when Meteor crosses the top of its physical arc instead of spawning from arbitrary positions during flight.
- Giant Meteor starts at 500 damage and doubles on every subsequent summon (100% per-use ramp).
- Added apex-launch state/event coverage, 500 → 1000 summon assertions, and refreshed browser cache keys.
- `npm test` passes all three suites.

## Meteor Damage Channels (2026-07-17)
- Kept the Meteor body non-damaging while exposing separate scalable small-meteor, giant-meteor, and burn-DPS values in simulation state, replay metadata, and the HUD.
- Burn DPS now follows Meteor's effective bounce/time damage ramp continuously.
- Added small-meteor scaling assertions and refreshed browser cache keys to meteor10.
- `npm test` passes all three suites.

## Meteor HUD Damage Labels (2026-07-17)
- Removed burn-DPS text from Meteor’s HUD and text-state presentation while retaining scalable burn simulation logic.
- Meteor now visibly reports only Small and Big damage values.
- Refreshed browser cache keys to meteor11; `npm test` passes all three suites.

## Meteor Stacked Damage HUD (2026-07-17)
- Stacked Meteor’s Small and Big damage labels vertically instead of placing them on one line.
- Refreshed browser cache keys to meteor12; `npm test` passes all three suites.

## Meteor Per-Bounce Small Damage (2026-07-17)
- Small Meteor damage now follows Meteor’s full effective damage value, increasing on every bounce instead of staying rounded at 1 for multiple early bounces.
- Preserved the non-damaging Meteor body and scalable burn channel; refreshed cache keys to meteor13.
- `npm test` passes all three suites.

## Meteor Orb Race (2026-07-17)
- Added the deterministic Meteor racer with continuous seeded tiny-meteor launches and a 15-second giant-meteor ability that pierces every number layer.
- Added generated pixel assets for the meteor orb, tiny/giant meteors, and calling horn, plus the supplied horn and impact audio samples.
- Added horn/strike/pass simulation events, HUD counters, projectiles, layer effects, team damage/sec aggregation, roster grouping, announcer fallback, cache-busting, URL roster coverage, and deterministic replay tests.
- Enlarged and froze the giant meteor, switched layer impacts to a critical-hit visual without repeated sound, skipped cleared walls, and added five-second seeded fire patches with burn damage.
- Restored the supplied meteor impact sample for number-line strikes, added impact-frame flash/shake, changed the summon meter to orange, and kept the giant projectile alive until its full radius clears the finish.
- Meteor now uses seeded random horizontal spawn positions and launch directions so separate seeds can start on either side while replays remain identical.
- Added the supplied Meteor announcer clip to the stable `meteor` racer ID.
- Preserved the source copy and bumped the race audio cache version.

## Generated Ricochet Gun Spin Sheet (2026-07-17)

- Added a generated four-frame pixel gun sheet for Ricochet. The orb body remains fixed while the mounted weapon selects the generated orientations and eases through each 90° spin.

## Ricochet Quarter-Turn Mount Animation (2026-07-17)

- Ricochet's mounted gun now holds its angle and eases through a 90° spin every three seconds; Sawblade keeps its slower continuous mount rotation.

## Foreground Rotating Race Weapons (2026-07-17)

- Ricochet and Sawblade mounted weapon sprites now render over their orb bodies and rotate slowly around the attachment point; projectile physics and hit behavior are unchanged.

## Integral Fill Ends At Number Line (2026-07-17)

- Anchored the progressive Integral shading baseline to the active number-line boundary so the fill cannot bleed through the line.

## Progressive Integral Trace (2026-07-17)

- Removed the forward integral preview; the shaded arc now grows progressively from the seeded landing point using only sampled orb positions and clears on the next landing.

## Complete Integral Arc Preview And Hero Top-Wall Arcs (2026-07-17)

- Integral now extends its sampled line with a deterministic physics preview through the next landing, so the full arc is visible instead of only the trail behind the orb.
- Speedster and Flash use a top-wall-reaching launch arc and record the solid top-bar rebound.

## Landing-Started Integral Traces And Restored Hero Arcs (2026-07-17)

- Integral traces now begin at a number-line landing and continue through the next physical arc; the trace resets to the next landing point.
- Restored Speedster and Flash to their original right-start, leftward full-height arcs.

## Live Integral Arc And Opposed Slow Starts (2026-07-17)

- Integral now samples its actual deterministic flight path, shades beneath that path, and clears the trace on number-line landing.
- SLOW's HUD now shows damage only.
- Racers sharing a speed class alternate deterministic starting edges; slow-math Quadratic starts right and Pi starts left.

## Billion-Point Race Walls And Integral Arc (2026-07-17)

- Increased Orb Race number-wall normalization and setup limits to 1,000,000,000, with width-fitted rendering for comma-formatted values.
- Made Compact (0.75×) the default Orb Race orb size while preserving explicit Full and Mini selections in share links.
- Added a deterministic integral trajectory overlay: a curved path, baseline, and translucent shaded area under the arc on the active race layer.

## Quadratic, Pi, and Speed Impact Orb (2026-07-17)

- Added the supplied Orb Race announcer clips in order: Quadratic, Pi, Integral, Prime.
- Quadratic is mapped to the growing-per-bounce `quadratic` racer, separately from X² and Xˣ.
- Added the supplied Slow announcer clip to the stable `speed-impact` racer ID.
- Preserved the source copy and bumped the race audio cache version.

- Added the `quadratic` racer with exponent-based damage and a live base/superscript emblem that advances every bounce; Xˣ now uses the same centered exponent treatment.
- Added the `pi` racer with the deterministic π digit multiplier ramp (`1×3 = 3`, `3×1 = 3`, `3×4 = 12`, …), a live multiplier stat, and the supplied Pi symbol artwork.
- Replaced Anchor in the active roster with the slow-falling `speed-impact` racer displayed as SLOW in a gray palette; it starts at 50 damage and gains 100 per bounce.
- Added critical impact events, critical-hit audio routing, deterministic box shake, and fading crack effects for SLOW number-line landings.

## Splodey Simultaneous Bomb Volleys

- Splodey now releases every bomb in a volley on the same simulation tick while retaining the seeded horizontal spread and ramped count/damage.
- Added a simulation regression assertion and recorded the change. TODO: none.

## Number-Line Rebound Transition

- Racers now receive their normal bounce impulse when they break a number line, then fall toward the newly active lower layer instead of passing through immediately.
- Added regression coverage for the rebound-before-descent transition. TODO: none.

## Factorial, Prime, Integral, Ricochet, and Sawblade Orbs

- Added five stable Orb Race IDs with math scaling (Factorial, Prime, Integral) and deterministic mounted weapon projectiles (Ricochet, Sawblade).
- Generated and added pixel-art weapon sheets at `assets/race/generated/ricochet-weapons.png` and `assets/race/generated/sawblade-weapons.png`; mounts remain attached to their orbs while fired projectiles ricochet inside the active layer.
- Added roster details, HUD counters, replay state, team damage aggregation, and deterministic simulation hooks. TODO: add dedicated announcer recordings if desired.

## Jackpot Unlucky Audio Guard

- Jackpot result events now use the player-facing `unlucky` outcome label for low rolls.
- The World Cup KO cue is only mapped to explicit `unlucky` results; neutral, medium/cash, and internal tier labels are silent.
- Bumped the browser/audio cache key and added social audio regression coverage. TODO: none.

## Orb Race Wall Ramps And Opening Weapons

- Number-wall, top-wall, and side-wall impacts now advance Orb Race ramp progression for every racer, including damage/level/ability ramps and the existing Speedster/Flash behavior.
- Jackpot starts with an opening slot roll, while Boomerang and Drill each launch one deterministic opening projectile on the first simulation step.
- Splodey mine explosions now use the Orb Race bounce sample, with one sound plan per number-line impact.
- Bumped browser/audio cache keys and added simulation/social regression coverage. Full test suite passed.

## Splodey Race Announcer

- Added the supplied Splodey clip to the stable `mines` Orb Race racer ID.
- Preserved the source copy and bumped the race announcer cache version.
- TODO: none for this request.

## Jackpot Outcome Audio Once Per Spin

- Routed the Forge pickup and World Cup KO samples through the single `race-jackpot-result` event, so jackpot and unlucky stingers play once when the resolved reels are shown instead of repeating on every number-line hit. Cash results remain silent for these outcome stingers; slot spin and lever cues are unchanged.
- Bumped browser/audio cache keys and added social audio regression coverage for jackpot, bust, cash, and legacy hit events.
- TODO: none for this request.

## Gravity, Jackpot, And Boomerang Announcers

- Added the supplied Orb Race announcer clips in order: Gravity, Jackpot, Boomerang.
- Preserved the source copies and bumped the race audio cache version.
- TODO: none for this request.

## Remove Drill Launch Sound

- Removed the dedicated `race-drill` sample from the active audio manifest and event routing; Drill gameplay and announcer cues remain unchanged.
- Bumped the audio cache version.
- TODO: none for this request.

## Growth, Weapon, And Superhero Group Announcers

- Replaced the Orb Race Growth, Weapon, and Superhero group cues with the three supplied clips in that order.
- Preserved the previous group source files and bumped the race-team cache version.
- TODO: none for this request.

## Motion And Math Group Announcers

- Replaced the Orb Race Motion Orbs group cue with the first supplied clip and Math Orbs group cue with the second.
- Preserved the previous group source files and bumped the race-team cache version.
- TODO: none for this request.

## Orb Race Team Builder

- Replaced the Orb Race 1v1 picker with independent Team 1/top-track and Team 2/bottom-track builders. Selection order is preserved, and every selected orb exposes per-orb fading trail, solid trail, and scaling-damage controls.
- Added deterministic shared-track team simulation: teammates remain independent physical orbs but contribute damage to the same layer health, share finish progress, and win when any teammate crosses the checkered flag.
- Added team HUD rules: one or two members retain individual stat columns; larger teams show orb count and rolling total damage per second. Matchup and winner/export names use fitted team labels with reusable math, superhero, weapon, growth, and motion group naming.
- Added stitched team introductions using the exact supplied Plus clip, existing individual orb clips, generated group-name cues, race Versus, and Pick Your Winner. Added the previously missing X-to-the-X name cue.
- Added URL, grouping, per-orb option, shared-damage, deterministic outcome, winner, HUD, winner-palette, and announcement regression coverage.
- `npm test` passes: 3 suites passed, 0 failed. All modified JavaScript modules pass `node --check`, and the announcer manifest parses as valid JSON.
- The standalone web-game Playwright client was attempted but remains unavailable because the project does not install `playwright`. In-app browser QA covered setup selection/options, URL restoration, live two- and three-member race rendering, fitted matchup names, side-by-side and aggregate stats, team winner metadata/caption, and clean console output.
- TODO: none for this request.

## Sticky And Grower Race Announcers

- Added the supplied clips to the Orb Race announcer roster: first Sticky, second Grower.
- Extended the race-only stitched intro manifest and cache version.
- TODO: none for this request.

## Orb Race Versus, Lazer, And Golden Ratio Announcers

- Added a race-only Versus clip, plus Lazer and Golden Ratio announcer clips; Classic and World Cup retain the shared Versus cue.
- Extended the race-only stitched intro manifest and cache version.
- TODO: none for this request.

## Flash And Batman Race Announcers

- Added the supplied clips to the Orb Race announcer roster: first Flash, second Batman.
- Extended the race-only stitched intro asset manifest and cache version.
- TODO: none for this request.

## Math Racer Choir Bounce Effect

- Added the supplied `freesound_community-dark-choir-01-87395.mp3` as the math racer bounce sample.
- Fibonacci, Xˣ, and golden ratio bounces use only the first second; X² and all other race racers retain the orb-collision sample.
- TODO: none for this request.

## X Squared And Fibonacci Race Announcers

- Imported the two supplied July 14 clips into the race announcer roster: first Fibonacci, second X Squared.
- Extended the race-only stitched intro and cache version; other modes remain unchanged.
- `npm test` passes: 3 suites passed, 0 failed; modified modules pass `node --check` and the announcer manifest is valid JSON.
- Browser smoke verified the math racer matchup renders as X² vs Fibonacci, the app loads `main.js?v=20260714-race-announcer3`, and no console warnings or errors were reported.
- TODO: none for this request.

## Race-Only Pick-Your-Winner Cue

- Imported the supplied 2026-07-14 prompt and replaced the final stitched cue only for Orb Race intros.
- Classic and World Cup continue using their existing shared prompts.
- `npm test` passes: 3 suites passed, 0 failed; modified modules pass `node --check` and the announcer manifest is valid JSON.
- Browser smoke verified Orb Race loads `main.js?v=20260714-race-announcer2`, launches a live race, and reports no console warnings or errors.
- TODO: none for this request.

## Announcer Ducking

- Strengthened announcer ducking so effects, ambience, and music stay clearly underneath the complete scheduled announcement sequence, then restore with a short release after the final clip.
- Added regression coverage for the duck profile and release timing.
- `npm test` passes: 3 suites passed, 0 failed; `src/audio.js` passes `node --check`.
- Browser smoke verified a live Orbital vs Drill race with no console warnings or errors and the updated canvas remained readable during recording.
- TODO: none for this request.

## Orb Race Announcer Stitching

- Imported the four supplied July 13 ElevenLabs clips as preserved source files and live race announcer assets: Duplicator, Speedster, Orbital, and Drill in the requested order.
- Added a race-only runtime splice: selected racer, Versus, selected racer, Pick your winner.
- `npm test` passes: 3 suites passed, 0 failed.
- Browser smoke verified a seeded Orbital vs Drill race preview with no console warnings or errors; the live page loaded the new versioned audio/main entry points.
- TODO: none for this request.

## Orb Race Card Expansion

- Enlarged the Orb Race cards, added true corner-to-center launch trajectories, and moved top-racer stats to the upper-left / bottom-racer stats to the lower-right as requested.
- Verified the revised running canvas through the in-app browser with no console warnings or errors.
- Note: a later `npm test` run reaches a pre-existing social-audio roster mismatch: the six current `CLASS_DEFS` entries all resolve to one weapon-hit signature, but the social test expects six unique legacy signatures. This is outside the race-card rendering change and was not modified here.

## Orb Race Full-Portrait Expansion

- Changed the primary social-export surface to 1080 × 1920 (9:16), including the canvas markup, portrait format metadata, and regression expectation.
- Increased race-card width to 86% of the full portrait, made the lead card 700 px tall, and made the second card exactly 1.25× smaller.
- Moved both race launches to the upper-right corner and made the deterministic bounce-flash state render as a clear upward rebound arc.
- Verified JavaScript syntax and the focused simulation suite; completed an in-app-browser race/export with no console warnings or errors.
- TODO: none for this request. The known unrelated `npm test` social-audio roster mismatch remains documented above.

## Orb Race Physics And Finish-Band Correction

- Replaced the preset race-travel animation with seeded Orb Foundry-style physics: per-racer position/velocity, gravity, wall restitution, number-wall collision rebound, and bounded speed.
- Added a regression assertion that a racer reaches its first number wall, reverses vertical velocity, and continues upward under real physics.
- Made both portrait race cards equal height. The finish band is now 25% white with a clipped, neatly contained checkerboard in the remaining 75%.
- Kept the number values at fitted 900 weight and verified the full 1080 × 1920 presentation in the in-app Browser.
- `npm test` passes: 3 suites passed, 0 failed.
- TODO: none for this request.

## Orb Race Bounce, Duplicate, Drill, And HUD Polish

- Increased race restitution and added seeded lateral impulses at ceiling and number-wall rebounds, preventing the vertical bounce loop while retaining deterministic outcomes.
- Added a setup and shareable-URL `ORB SIZE` option (full, compact, mini); the selected scale now drives race collision bounds and canvas rendering.
- Replaced the Duplicator's damage multiplier with independently simulated child orbs. Every orb can bounce, gain its own damage, and create another child after its own fourth bounce (capped at 32 active children for runtime safety).
- Replaced instant driller damage with moving, visible drill projectiles that cross each number layer in order and damage it as they pass.
- Removed the bounces line from the race HUD and positioned racer names to the left and right of `VS`.
- Added regression coverage for independent duplicate movement/bounces, drill projectile travel and pierce damage, orb-size physics, lateral motion, and size URL round trips.
- `npm test` passes: 3 suites passed, 0 failed.
- Browser visual verification could not reconnect to the existing local 4173 process from the in-app Browser session; renderer and simulation regression coverage passed.

## Orb Race Slower Neutral Wall Rebounds

- Reduced race gravity, launch speed, and top speed so Orb Race plays at a calmer pace.
- Changed left/right, ceiling, and number-wall rebound restitution to 1.0: wall collisions reverse direction without adding momentum, while the initial seeded horizontal velocity carries orbs from left to right.
- Tripled the Duplicator cadence from every 4 to every 12 bounces and updated the setup copy.
- Added a regression assertion that a non-Speed racer rebounds from the left wall with exactly its launch horizontal speed.
- `npm test` passes: 3 suites passed, 0 failed.

## Orb Race Audio, Names, And Finish Cleanup

- Renamed the displayed race roster to Speedster, Drill, Duplicator, and Orbital while preserving the stable racer IDs.
- Mapped every `race-bounce` event to the shipped orb-collision sample, with a short rate limit to prevent audio overload from child orbs.
- Added a `race-finish` event mapped to the shipped World Cup KO sample; the normal victory event remains silent so the KO does not layer with a second finale sound.
- Removed the centered `FINISHES!` canvas winner popup from Orb Race.
- Updated social/audio and simulation regressions for the renamed roster and race sound events.
- `npm test` passes: 3 suites passed, 0 failed.

## Orb Race Constant Rebounds, Flag Finish, And Solid Orbs

- Kept race collisions fully elastic so horizontal and vertical rebound momentum is preserved between the ceiling and number wall.
- Split final-wall clearance from victory: racers now arm their finish run when all numbers are cleared and only win after an orb crosses into the checkerboard portion of the finish band.
- Updated race replay frames with the new armed-to-finish state.
- Made main orbs, duplicate orbs, and orbiters render in one solid racer color instead of the former split palette.
- Added a regression test proving that clearing all layers does not finish the race until the checkerboard is crossed.
- `npm test` passes: 3 suites passed, 0 failed.

## Orb Race Fixed Momentum Correction

- Replaced gravity-driven race motion with fixed diagonal velocity vectors. Every wall, ceiling, and number-wall collision now only reverses direction, preserving each orb's travel-speed magnitude.
- Speedster retains a slightly higher fixed starting speed; it no longer accelerates after bounces, keeping all racer movement stable and readable.
- Child duplicates inherit their parent's fixed travel speed, and the replay state now preserves this speed setting.
- Added a regression assertion that an Orbital racer keeps exactly the same total velocity magnitude after bouncing.
- `npm test` passes: 3 suites passed, 0 failed.

## Orb Race Mode

- Replaced the King of the Hill picker path with Orb Race: two deterministic racers bounce on configurable number walls and the first through the checkerboard finish wins.
- Added Duplicator, Speed, Orbital, and Drill racers. Every bounce raises main-orb damage; duplicate counts, speed, one-damage orbiters, and penetrating drills progress deterministically.
- Rebuilt the social canvas around the supplied reference: stacked number walls, active-color row, checkerboard finish, split-color orbs, large damage callouts, and live special counters.
- Added URL round-trip and simulation coverage for race setup, bounce damage, duplication, speed, orbiters, drills, deterministic replay, and winning.
- `npm test` passes (3 files, 3 passed). In-app-browser verification passed with no console warnings/errors. `design-qa.md` records the reference comparison and has `final result: passed`.

## King Of The Hill Mode (In Progress)

- Added a dedicated King of the Hill contender registry with six color orbs and five math orbs, plus reusable deterministic contender normalization/selection shared with World Cup.
- Added hill occupancy scoring, math multipliers, continuous-hold resets, per-contender targets, deterministic center-seeking movement, fortification charge, collision resistance, and the King of the Hill win condition.
- Added setup roster controls, URL settings fields, central hill rendering, contender symbols/colors, fortification ring, score bars, target scores, multiplier state, and contested HUD presentation.
- TODO: finish regression tests, run the full suite, and complete Playwright screenshot/state verification.
- Added focused tests for base scoring, contested scoring lockout, hold/multiplier activation and reset, all target differences, 70%/35% fortification resistance, fortify reset, deterministic outcomes, URL round trips, winner selection, and social winner palettes.
- Live testing found and fixed a permanent contested-center stalemate by adding deterministic outward contested pressure; three sampled seeded matches now finish within 180 simulated seconds.
- Full `npm test` suite passes (3 files, 3 passed, 0 failed).
- The standalone web-game Playwright client remains unavailable because the `playwright` package is not installed. Completed the visual pass through the installed in-app browser instead: roster setup, central hill, contender symbols/palettes, live score/target bars, fortification ring, `2× ACTIVE`, `CONTESTED`, and zero console warnings/errors were all verified.
- TODO: none for this feature.

## Orb Physics Rebound And Idle Decay

- Removed classic-mode homing acceleration, so orbs no longer steer toward opponents or decoys. Intentional abilities and King of the Hill's hill-seeking movement remain unchanged.
- Increased wall and orb collision restitution, including the stationary-overlap separation impulse, for more forceful rebounds.
- Added a brief post-orb-collision momentum-retention window; otherwise orbs now gradually lose velocity. This applies to Classic and World Cup movement while preserving World Cup's no-gravity rule.
- Added regression coverage for no homing, idle momentum decay, stronger wall/orb rebounds, and collision momentum retention.
- Full `npm test` suite passes (3 files, 3 passed, 0 failed).
- The standalone Playwright client is unavailable because the project has no `playwright` package. Completed the visual pass through the in-app browser instead: a Classic Cinder vs Frost fight ran cleanly through an extended exchange, the arena rendered normally, and the browser console reported no warnings or errors.
- TODO: none for this change.

## Colombia And Ghana Announcer Swap

- Swapped the live World Cup intro announcer mapping so Colombia now uses the current Ghana announcer clip and Ghana now uses the current Colombia announcer clip.
- Kept the underlying archived/source MP3 files untouched so the source history remains accurate; only the country-to-asset lookup changed.
- Bumped the live `audio.js` import key and the page entry-script cache key so a refresh pulls the swapped mapping immediately.
- Updated the social/audio regression assertions to lock the new Colombia/Ghana asset routing in place.

## Portugal And Croatia Announcer Swap

- Swapped the live World Cup intro announcer mapping so Portugal now uses the current Croatia announcer clip and Croatia now uses the current Portugal announcer clip.
- Kept the underlying archived/source MP3 files untouched so the source history remains accurate; only the country-to-asset lookup changed.
- Bumped the live `audio.js` import key and the page entry-script cache key so a refresh pulls the swapped mapping immediately.
- Updated the social/audio regression assertions to lock the new Portugal/Croatia asset routing in place.

## France Pickup Cue

- Extracted the supplied `ScreenRecording_07-04-2026 09-33-54_1.mov` audio into `assets/audio/effects/france-world-cup-pickup.wav`.
- Archived the original recording under `assets/audio/source/world-cup-effects-20260704/france-pickup-source.mov`.
- France now uses this custom sample only when picking up a World Cup powerup; France ball-use audio remains unchanged, matching the Portugal-style pickup-only path.
- Added a small reusable native helper at `scripts/extract_wav.swift` to convert future screen recordings into mono 44.1 kHz WAV effects using macOS media frameworks.
- Bumped the effect cache key and live `audio.js` / `main.js` import keys again so browsers fetch the new France pickup behavior immediately.
- Full `npm test` suite passes.
- Live smoke verified the page loads `main.js?v=20260704-world-cup-france-pickup1`, World Cup mode still opens cleanly with no console warnings or errors, and `france-world-cup-pickup.wav` returns `200 OK` from the local preview server.
- While this change was in progress, the workspace already advanced its live cache key from a Canada pass to a Morocco pass. The France update preserved those unrelated changes and moved forward from the latest visible key instead of reverting them.

## Morocco Announcer

- Imported the supplied Morocco (`16_41_06`) ElevenLabs MP3 into the live World Cup announcer asset folder.
- Archived the source clip under `assets/audio/source/world-cup-announcer-20260704/morocco.mp3`.
- Added Morocco to the World Cup announcer registry and manifest so it splices through the normal `country -> versus -> country -> pick your winner` intro flow.
- Bumped the live audio/page cache keys so refreshes pull the updated Morocco announcer registry immediately.
- Updated one stale effect-cache assertion in `tests/social.test.mjs` to match the repo’s current `SAMPLE_ASSET_VERSION`.
- Full automated test suite passes.

## Canada Announcer

- Imported the supplied Canada (`16_37_27`) ElevenLabs MP3 into the live World Cup announcer asset folder.
- Archived the source clip under `assets/audio/source/world-cup-announcer-20260704/canada.mp3`.
- Added Canada to the World Cup announcer registry and manifest so it splices through the normal `country -> versus -> country -> pick your winner` intro flow.
- Bumped the live audio/page cache keys so refreshes pull the updated Canada announcer registry immediately.
- Full automated test suite passes.

## Canada World Cup Orb

- Added Canada to the World Cup country roster with matching name, palette, and generated flag asset support.
- Created `assets/generated/world-cup/flags/canada.png` as a local HUD-ready Canada flag and registered it in the generated manifest plus asset-prep script.
- Extended World Cup roster tests to include Canada and verified a Ghana vs Canada matchup path.
- Full automated test suite passes.

## Ghana And Colombia Announcers

- Imported the supplied Ghana (`18_11_29`) and Colombia (`18_11_34`) ElevenLabs MP3s into the existing July 3 World Cup announcer batch.
- Preserved both source clips under `assets/audio/source/world-cup-announcer-20260703/` and promoted them into the live wise announcer set as `world-cup-ghana.mp3` and `world-cup-colombia.mp3`.
- Extended `src/audio.js`, the wise announcer manifest, and regression tests so both countries stay in the normal `country -> versus -> country -> pick your winner` splice flow and remain byte-identical to their preserved source files.
- Bumped both the `audio.js` import query and the page entry-script cache key again so refreshes pull the new Ghana/Colombia announcer registry immediately.
- Full `npm test` suite passes.
- Live smoke verified the page loads `main.js?v=20260703-world-cup-announcer26-ghana-colombia`, World Cup mode shows both Ghana and Colombia, console logs are clean, and both new announcer MP3 URLs return `200 OK` from the local preview server.

## Cabo Verde And Argentina Announcers

- Added new World Cup announcer standalones for Cabo Verde and Argentina using the fresh July 3 ElevenLabs batch.
- Preserved exact source copies under `assets/audio/source/world-cup-announcer-20260703/` and promoted them into the live wise announcer set as `world-cup-cabo-verde.mp3` and `world-cup-argentina.mp3`.
- Extended `src/audio.js`, the wise announcer manifest, and regression tests so both countries stay in the normal `country -> versus -> country -> pick your winner` splice flow and remain byte-identical to their preserved source files.
- Bumped both the `audio.js` import query and the page entry-script cache key so refreshes pull the new announcer registry immediately.
- Full `npm test` suite passes.
- Live smoke verified the World Cup setup now shows both Argentina and Cabo Verde, the page loads `main.js?v=20260703-world-cup-announcer22-cabo-argentina`, console logs are clean, and both new announcer MP3 URLs return `200 OK` from the local preview server.
- Assumption used: the message metadata only exposed one of the two attached July 3 MP3s, so the visible `18_01_36` file was mapped to Cabo Verde per the user's note, and the adjacent same-batch `18_01_26` file was mapped to Argentina.

## Egypt And Australia Announcers

- Imported the supplied Egypt (`18_02_52`) and Australia (`18_02_37`) ElevenLabs MP3s into the live World Cup announcer asset folder.
- Archived both source clips under `assets/audio/source/world-cup-announcer-20260703/`.
- Added Egypt and Australia to the World Cup announcer registry and manifest so they splice through the normal `country -> versus -> country -> pick your winner` intro flow.
- Full automated test suite passes.

## World Cup Legacy Finale Layer Removed

- Found the surviving old KO sound at its real source: each final hit emits both `knockout` and `victory`, and the generic `victory` event was playing `match-finale.wav` immediately after the custom World Cup KO clip.
- Suppressed the generic match-finale sample for World Cup victory events, leaving the supplied `world-cup-ko.wav` as the only end-of-match audio in World Cup mode.
- Kept the existing match-finale cue for classic battles.
- Found that `index.html` still loaded `main.js` with an older June 30 cache tag; bumped the page entry-script version so refreshes cannot retain the previous audio router.
- Added regression coverage for the paired World Cup knockout/victory routing and both live cache layers.
- Verified the newly attached MOV is byte-identical to the archived source used for the replacement clip.
- Confirmed the actual World Cup event pair now resolves to only `world-cup-ko` (no `match-finale`), the full test suite passes, and a live in-app browser launch reports no warnings or errors.
- The standard web-game Playwright client remains unavailable because its Playwright package is not installed; live verification was completed through the in-app browser instead.

## Old KO Files Physically Replaced

- Replaced the old announcer KO files on disk — `assets/audio/announcer/wise/knockout.wav` and `assets/audio/announcer/ko.wav` — with the exact same WAV bytes as `assets/audio/effects/world-cup-ko.wav`.
- Verified all three KO WAVs now share the same SHA-256 hash, so there is no distinct old KO audio file left in the project.
- Bumped the announcer and main audio import cache keys again so any stale KO asset URLs are invalidated on reload.
- Full automated test suite passes after the asset replacement.

## World Cup KO WAV Re-Extracted

- Re-extracted `assets/audio/effects/world-cup-ko.wav` directly from `ScreenRecording_07-01-2026 20-37-11_1.mov` to overwrite any stale or wrong KO file on disk.
- Bumped the effect cache key and live audio import key again so browsers fetch the new KO WAV instead of reusing a cached older file.
- Full automated test suite passes after the KO asset refresh.

## Old KO Asset References Removed

- Removed the old announcer KO asset and fallback references from the runtime manifest so the app no longer loads or points at `wise/knockout.wav` / `ko.wav`.
- Bumped the live audio import key again so browsers reload the announcer/effects manifest without the old KO path.
- Kept the custom `world-cup-ko.wav` replacement clip as the only active KO sound path.
- Full automated test suite passes after removing the old KO references.

## World Cup KO Custom Clip And Spain Pickup 10x

- Restored the World Cup-only KO replacement clip so World Cup knockouts use the supplied `world-cup-ko.wav` again instead of silence or a stale older effect.
- Increased Spain's World Cup pickup gain to 10× the original pickup mix while leaving Spain's ball-use mix unchanged.
- Bumped both the effect cache key and live audio import key again so browsers fetch the updated KO/pickup behavior immediately.
- Full automated test suite passes after the restore and gain increase.

## World Cup KO Removed Again And Spain Pickup 5x

- Removed the World Cup knockout sample hook again so World Cup KOs no longer play that replacement clip.
- Increased Spain's World Cup pickup mix to 5× the prior pickup gain while leaving Spain's ball-use mix at its previous level.
- Bumped the live audio import and effect cache key so browsers reload the updated routing and louder Spain pickup sample.
- Full automated test suite passes after the change.

## Spain Pickup Cache Bust And KO Boost

- Fixed the underlying live-build issue for Spain pickup audio by adding cache-busting to effect-asset fetches, not just announcer fetches.
- Bumped the live `audio.js` import key again so browsers reload the updated effect-loader behavior immediately.
- Increased the World Cup KO replacement sample gain so the new custom KO clip hits harder in battle.
- Full automated test suite passes after the effect-cache refresh and KO mix boost.

## World Cup KO Cue Restore

- Restored the World Cup-only knockout sample routing to use the supplied `world-cup-ko.wav` clip from `ScreenRecording_07-01-2026 20-37-11_1.mov`.
- Classic-mode knockouts still do not use this custom World Cup KO sample.
- Full automated test suite passes after restoring the World Cup KO replacement.

## Spain Pickup Refresh

- Confirmed the Spain World Cup pickup/action audio was already wired to `spain-world-cup-action.wav` in the runtime and covered by regression tests.
- Bumped the live `audio.js` import cache key in `main.js` so browsers pull the updated audio module instead of reusing the stale pre-Spain bundle.
- Full automated test suite passes after the refresh-only change.

## World Cup KO Cue Removed

- Removed the World Cup-only knockout sample routing, so World Cup KOs no longer play the extra supplied KO sound.
- Left all other World Cup audio behavior unchanged, including country announcers, pickup cues, and card/ball hit sounds.
- Full automated test suite passes after removing the KO hook.

## Algeria And Switzerland Announcers

- Imported the supplied Algeria (`03_45_16`) and Switzerland (`03_45_07`) ElevenLabs MP3s into the live World Cup announcer asset folder.
- Archived both source clips under `assets/audio/source/world-cup-announcer-20260702b/`.
- Added Algeria and Switzerland to the World Cup announcer registry and manifest so they splice through the normal `country -> versus -> country -> pick your winner` intro flow.
- Full automated test suite passes.
- Web-game browser smoke remains tooling-blocked in this environment because the Playwright package for the skill client is still unavailable.

## Austria And Spain Announcers

- Imported the supplied Austria (`03_41_31`) and Spain (`03_41_24`) ElevenLabs MP3s into the live World Cup announcer asset folder.
- Archived both source clips under `assets/audio/source/world-cup-announcer-20260702/`.
- Added Austria and Spain to the World Cup announcer registry and manifest so they splice through the normal `country -> versus -> country -> pick your winner` intro flow.
- Full automated test suite passes.
- Web-game browser smoke remains tooling-blocked in this environment because the Playwright package for the skill client is still unavailable.

## Spain Pickup And World Cup KO Cue

- Extracted the supplied `ScreenRecording_07-01-2026 20-36-29_1.mov` audio into `assets/audio/effects/spain-world-cup-action.wav`.
- Extracted the supplied `ScreenRecording_07-01-2026 20-37-11_1.mov` audio into `assets/audio/effects/world-cup-ko.wav`.
- Archived both originals under `assets/audio/source/world-cup-effects-20260701/`.
- Spain now uses this custom sample when picking up a World Cup powerup and when using the homing soccer ball, following the same country-specific action-sound path as England and the USA.
- World Cup knockouts now use the supplied `world-cup-ko.wav` sample while classic-mode knockout audio behavior remains unchanged.

## Belgium And Senegal Announcer Correction

- Corrected the July 1, 2026 World Cup announcer mapping after the user clarified the first clip is Senegal and the second clip is Belgium.
- Replaced the live and archived `world-cup-senegal` asset with the `17_41_16` source clip and the live and archived `world-cup-belgium` asset with the `17_41_07` source clip.
- Updated the announcer manifest source-order metadata and exact-match tests to reflect the corrected country assignment.
- Full automated test suite passes after the swap.

## Belgium And Senegal Announcers

- Imported the supplied Belgium (`17_41_16`) and Senegal (`17_41_07`) ElevenLabs MP3s into the live World Cup announcer asset folder.
- Archived both source clips under `assets/audio/source/world-cup-announcer-20260701/`.
- Added Belgium and Senegal to the World Cup announcer registry and manifest so they splice through the normal `country -> versus -> country -> pick your winner` intro flow.
- Full automated test suite passes.
- Web-game browser smoke is still limited in this environment by the missing Playwright browser binary, but the announcer asset/tests are green.

## Portugal Pickup Cue

- Extracted the supplied `ScreenRecording_06-30-2026 10-43-48_1.mov` audio into `assets/audio/effects/portugal-world-cup-pickup.wav`.
- Archived the original recording under `assets/audio/source/world-cup-effects-20260630/portugal-pickup-source.mov`.
- Portugal now uses this custom sample only when picking up a World Cup powerup; its soccer-ball use audio remains unchanged.
- Full automated test suite passes.
- Browser smoke launched Orb Foundry cleanly with no console warnings or errors after the Portugal pickup audio update.

## Eight-Country World Cup Expansion

- Added Belgium, Senegal, Spain, Austria, Australia, Egypt, Switzerland, and Algeria to the World Cup country registry.
- Downloaded and validated eight new Flagcdn PNG assets, then wired them into the runtime manifest and asset-prep script.
- Added ordered winner-text palettes for all eight so post-match country text still blends through flag colors.
- Extended the World Cup feature coverage to 28 countries total and added deterministic matchup checks for the four requested pairs.
- Updated browser cache-bust query strings so the expanded roster shows up after refresh in the live app.
- Full automated test suite passes, and spot-checked new flags for Senegal, Egypt, and Algeria render correctly on disk.

## Small World Cup Pickup Text Restored

- Restored the compact in-arena pickup text for World Cup items, such as `ATTACK ↑`, `DEFENSE ↑`, and `HEALTH ↑`.
- Kept the larger social-overlay pickup banners disabled; only the small local pickup feedback returned.
- Verified with `node --check src/renderer.js` and the full `npm test` suite; all tests pass.

## World Cup Battle Title And Trophy

- Added a centered `World Cup Battle` title row at the top of the World Cup HUD.
- Created and wired a local pixel trophy sprite so the title renders with a small World Cup trophy beside it.
- Kept the implementation deterministic and crisp in-game rather than relying on generated text/image layers at runtime.
- Verified with `node --check src/social-renderer.js`, `node --check src/renderer.js`, and the full `npm test` suite; all tests pass.

## Colombia And Ghana World Cup Orbs

- Added Colombia and Ghana to the World Cup country registry, including flag palettes for winner-text blending.
- Downloaded and validated the new Colombia and Ghana flag PNGs, then wired them into the generated-world-cup manifest and asset-prep script.
- Extended the World Cup feature coverage to 30 countries total and added deterministic matchup coverage for the Colombia/Ghana pair.
- Updated cache-bust query strings so the expanded roster appears after refresh in the live app.
- Full automated test suite passes, and both new flag assets were visually spot-checked on disk.

## Portugal And Croatia Announcer Reconfirm

- Re-imported the user-confirmed Portugal clip from `17_53_28` and the Croatia clip from `17_53_14` directly from Downloads back into the announcer source archive and live World Cup announcer assets.
- Verified the active Portugal and Croatia MP3s are byte-for-byte identical to those two supplied files.
- Full automated test suite passes.

## Argentina Pickup And Ball Cue

- Extracted the supplied `ScreenRecording_06-30-2026 14.MOV` audio into `assets/audio/effects/argentina-world-cup-action.wav`.
- Archived the original recording under `assets/audio/source/world-cup-effects-20260630/argentina-action-source.mov`.
- Argentina now uses this custom sample when picking up a World Cup powerup and when using the homing soccer ball, using the same country-specific action-sound path as Norway, the USA, and England.
- Full automated test suite passes.
- Browser smoke launched Orb Foundry cleanly with no console warnings or errors after the Argentina audio update.

## England Pickup And Ball Cue

- Extracted the supplied `ScreenRecording_06-30-2026 13.mov` audio into `assets/audio/effects/england-world-cup-action.wav`.
- Archived the original recording under `assets/audio/source/world-cup-effects-20260630/england-action-source.mov`.
- England now uses this custom sample when picking up a World Cup powerup and when using the homing soccer ball, using the same country-specific action-sound path as Norway and the USA.
- Full automated test suite passes.
- Browser smoke launched Orb Foundry cleanly with no console warnings or errors after the England audio update.

## USA Pickup And Ball Cue

- Extracted the supplied `ScreenRecording_06-30-2026 12.mov` audio into `assets/audio/effects/usa-world-cup-action.wav`.
- Archived the original recording under `assets/audio/source/world-cup-effects-20260630/usa-action-source.mov`.
- USA now uses this custom sample when picking up a World Cup powerup and when using the homing soccer ball, using the same country-specific action-sound path as Norway.
- Full automated test suite passes.
- Browser smoke launched Orb Foundry cleanly with no console warnings or errors after the USA audio update.

## Norway Pickup And Ball Cue

- Extracted the supplied `ScreenRecording_06-30-2026 11.mov` audio into `assets/audio/effects/norway-world-cup-action.wav`.
- Archived the original recording under `assets/audio/source/world-cup-effects-20260630/norway-action-source.mov`.
- Norway now uses this custom sample when picking up a World Cup powerup and when using the homing soccer ball; all other countries keep their existing audio behavior.
- Full automated test suite passes.
- Browser smoke launched Orb Foundry cleanly with no console warnings or errors after the Norway audio update.

## Ivory Coast And Norway Announcer Clips

- Added the supplied `18_02_32` clip as Ivory Coast and the supplied `18_02_24` clip as Norway.
- Archived exact source copies under `assets/audio/source/world-cup-announcer-20260630` and promoted them into the live World Cup announcer set.
- Extended announcer manifest/test coverage so Ivory Coast and Norway must remain byte-identical to the supplied files and stay in the normal World Cup splice order.
- Full automated test suite passes.
- Browser QA confirmed both countries appear in the live World Cup roster and found no console warnings or errors during setup and match launch.

## Portugal And Croatia Announcer Clips

- Added the supplied `17_53_28` clip as Portugal and the supplied `17_53_14` clip as Croatia.
- Archived exact source copies under `assets/audio/source/world-cup-announcer-20260630` and promoted them into the live World Cup announcer set.
- Extended announcer manifest/test coverage so Portugal and Croatia must remain byte-identical to the supplied files and stay in the normal World Cup splice order.
- Full automated test suite passes.
- Browser QA launched a Portugal vs Croatia World Cup match, confirmed both countries render correctly in the live matchup view, and found no console warnings or errors.

## Paraguay And Germany Announcer Clips

- Added the supplied 17_57_58 clip as Paraguay and the supplied 17_57_46 clip as Germany.
- Wired both existing World Cup countries into matchup announcement sequences.
- Archived exact source copies, recorded checksums, and added regression coverage preventing cue swaps.
- Full automated test suite passes.
- Browser QA launched a Germany–Paraguay match, confirmed both countries render correctly, and found no console warnings or errors.

## Twelve-Country World Cup Expansion

- Added Argentina, Cabo Verde, Netherlands, Morocco, Portugal, Croatia, Germany, Paraguay, Norway, Ivory Coast, Mexico, and Ecuador to the World Cup country registry.
- Added ordered flag-color palettes so post-match winner text blends through each new country's colors.
- New countries inherit the existing selection, seeded matchup, circular-flag rendering, hearts, stats, pickups, and URL-settings flows.

## Louder Versus Announcer

- Raised only the `versus` cue from 1.4× to 1.7×, then doubled it to 3.4× playback gain.
- Left country names and the `pick your winner` prompt at their existing volume.
- Added regression coverage to preserve the stronger versus mix.

## True 9:16 Social Export

- Changed the default portrait export from 1080 × 1100 to true 9:16 at 1080 × 1920.
- Vertically centered the complete names, square arena, and status-bar composition within the taller frame.
- Updated setup, live recording, and preview metadata to identify the preset as `9:16 PORTRAIT`.
- Preserved the existing square and landscape presets.
- Added exact dimension, aspect-ratio, containment, and vertical-centering coverage.
- Full automated test suite passes.
- Browser QA confirmed the live canvas reports 1080 × 1920 with CSS aspect ratio `1080 / 1920`; full-page visual inspection passed with no console warnings or errors.

## Homing Ball Critical-Hit Audio

- Routed `world-cup-ball-hit` through the existing `critical-hit.wav` sample at the emphasized critical-hit gain.
- Kept soccer-ball launch/use behavior and its existing visual/procedural impact signature unchanged.

## Projectile Impact Frames And Pause

- Added a shared 70 ms projectile hit-stop presentation for homing soccer-ball and Volta ricochet-bolt impacts.
- Kept World Cup card projectiles on their stronger existing 120 ms critical pause.
- Marked homing-ball effects as collision impacts and Volta-bolt effects as regular impacts so both render Orb Foundry impact-frame sprites.

## Stackable Damage Drinks

- Damage Drinks now add permanent, unlimited +0.1× attack stacks instead of acting as a one-time 1.1× flag.
- Attack progression is deterministic: one drink = 1.1×, two = 1.2×, three = 1.3×, and so on.
- Soccer-ball and red-card damage use the complete accumulated multiplier; two drinks make a red card deal 24 damage before defense.
- Added stack count to live text state and replay fighter snapshots, while retaining the persistent attack ring.
- Updated pickup copy to `PERMANENT +0.1×`.
- Full automated test suite passes.
- Browser QA naturally reached two Damage Drink stacks and visibly showed `ATTACK 1.2×` in the live HUD with no console warnings or errors.

## Pickup-Only World Cup Damage

- World Cup orb-on-orb collisions now transfer momentum without dealing damage or emitting damage-hit events.
- Doubled the default pickup spawn cadence: the opening pickup arrives in 0.7–1.1 seconds and later pickups every 1.2–1.8 seconds, subject to the existing three-pickup cap.
- Added a global-only `WORLD CUP PICKUP SPAWN RATE` multiplier to the Balance Laboratory, with settings/URL/export persistence and a validated 0.25×–4× range.
- Damage Drink now grants a permanent 1.1× attack multiplier for the match.
- The permanent multiplier applies to damaging pickup projectiles: soccer balls deal 11 instead of 10 and red cards deal 22 instead of 20.
- Replaced the obsolete collision-damage HUD readout with `ATTACK 1.0×/1.1×` and updated setup/recording copy to explain pickup-only damage.
- Full automated test suite passes.
- Browser QA applied a 2× Lab spawn-rate multiplier, launched World Cup mode, confirmed a dense active pickup field and the new attack HUD, and found no console warnings or errors.

## World Cup Card Critical Impacts

- Yellow- and red-card impacts now play Orb Foundry's `critical-hit.wav` sample at the same emphasized gain as backstabs.
- Both card impacts trigger a 120ms critical hit-stop followed by a 0.52x slow-motion highlight window.
- Card hits now render the critical impact frame instead of the standard collision impact.
- Added focused coverage for the card-hit sample, presentation pause, slow-motion highlight strength, and critical impact visuals.
- Full automated test suite passes.
- Browser QA launched a World Cup match with active card items/projectiles and no console warnings or errors.

## World Cup Country Announcements

- Replaced only the USA and Japan country cues with the newly supplied clips: `17_22_25` is USA and `17_22_32` is Japan.
- Preserved byte-identical source copies, recorded their SHA-256 hashes in the announcer manifest, and left all other active country audio unchanged.
- Replaced only the Congo and England cues in the next audio pass: `17_22_48` is Congo and `17_22_59` is England; preserved copies and hashes match their active files.
- Replaced only the Sweden and Bosnia cues in the next audio pass: `17_23_08` is Sweden and `17_23_14` is Bosnia; preserved copies and hashes match their active files.
- Applied the latest user-confirmed mappings only: France (`17_21_58`) and Sweden (`17_23_08`). No other country audio was changed in this pass.
- Verified the active France and Sweden MP3s are byte-for-byte identical to those two supplied files; both decode cleanly.
- Announcer/social tests pass. The complete suite currently has an unrelated pre-existing World Cup yellow-card stun timing failure in `tests/features.test.mjs:158`.
- Replaced the World Cup prompt with the explicitly supplied `2026-06-26T22_26_46` `pick your winner` clip.
- World Cup matchups now splice the selected left country, the existing `versus` clip, the selected right country, and `pick your winner` at runtime.
- Re-enabled the matchup announcement timeline in World Cup mode while retaining the classic orb announcement flow.
- Preserved the supplied originals under `assets/audio/source/world-cup-announcer-20260628` and documented their order in the announcer manifest.
- Full automated test suite passes, including country sequence and asset-presence coverage.
- Browser QA launched France vs Brazil, confirmed the World Cup canvas renders correctly, and found no console warnings or errors. Audio cache keys were bumped after correcting the clip mapping.
- The standalone web-game Playwright client is unavailable in this workspace; rendered QA used the in-app browser instead.

## World Cup Flag And Combat HUD Refresh

- Removed the dark/color/cream medallion borders from country fighters and winner icons; World Cup orbs now render as the circular flag alone.
- Moved the ten-heart health display out of the top panels and attached it directly above each country orb.
- Loaded the existing pixel-heart PNG in the arena renderer instead of falling back to placeholder blocks.
- Added rising, fading pixel feedback for World Cup items, including `ATTACK ↑`, `HEALTH ↑`, and `DEFENSE ↑`.
- Replaced the bottom status text with each fighter's live damage and defense values.
- Centralized World Cup combat stats so the readout matches boosted collision damage and shin-guard immunity.
- Full automated test suite passes. Rendered browser QA was attempted, but starting the localhost server was blocked by the current Codex usage limit; the standalone Playwright dependency is also absent.
- Follow-up: moved the ten pixel hearts from above the moving country orbs to compact rows directly beneath each country name in the top name band.
- Added a translucent pixel victory stamp in the middle of the field after battle completion, using the winning country/orb name followed by `ORB WINS`.
- Refined the stamp to natural-case `<Country> wins` copy and evenly blended its character runs through each winning country's ordered flag palette (for example `Fran` blue, `ce w` white, `ins` red).

## World Cup Collision Mode

- Added an additive `world-cup` gameplay mode without removing or replacing classic Orb Foundry systems.
- Added structured country data for France, Sweden, USA, Bosnia, England, Congo DR, Brazil, and Japan.
- Browser-sourced and normalized all eight flag assets from Wikimedia-rendered flag files.
- Promoted the approved modern polished pixel direction into production assets: striped pitch reference, ten-heart HUD sprite, two energy drinks, shin guards, homing soccer ball, yellow card, and red card.
- World Cup battles use collision-first damage, country flag medallions, a responsive top heart HUD, and a separate bottom status dock.
- Added modular pickup spawning with a three-pickup cap, readable glow, 11-second despawn, and 4.2–6.8 second spawn rhythm.
- Implemented 1.1x ten-second collision damage boost, 1.5-heart healing, five-second immunity, one-heart homing ball, 3.5-second stun, and automatic two-heart red-card damage.
- Routed every World Cup pickup collection through the existing Forge pickup sample.
- Added deterministic state output for World Cup pickups, projectiles, country IDs, immunity, and damage-boost timers.
- Added focused tests for config round-tripping, country assignment, weapon suppression, boosted collisions, healing, immunity, yellow/red cards, homing ball damage, pickup spawning, and pickup audio.
- Full automated test suite passes.
- Browser QA passed on desktop and 390×844 mobile with clean console logs.
- Classic Cinder vs Frost rendered regression smoke also passed after the World Cup changes.

## World Cup Follow-up Ideas

- Optional: add country-specific announcer clips and a dedicated World Cup intro/countdown package.
- Optional: tune pickup weights and collision damage from longer tournament samples.
- Optional: add more countries by extending `WORLD_CUP_COUNTRIES`; no gameplay rewrite is required.

## Guaranteed Glowing Homing Ball

- Fixed the player-facing discoverability gap where weighted randomness could hide the soccer-ball pickup for an entire short match.
- Every World Cup match now opens with a homing ball at the exact midfield center between 1.4 and 2.2 seconds; later pickups continue using the balanced weighted pool.
- Strengthened the ball pickup treatment with a larger cyan aura, two cream pulse rings, and eight rotating pixel sparks.
- Preserved the existing pickup flow: collect, orbit briefly, launch toward the opponent, home in, and deal exactly one heart.
- Added focused assertions for the guaranteed type, midfield placement, and one-time opening override.
- Full automated suite passes and Browser QA visibly confirmed the glowing ball at midfield with no console warnings or errors.

## Complete KO Audio Capture

- Extended the automatic post-winner recording tail from 0.9 seconds to 3.75 seconds.
- Centralized the 3.47-second match-finale duration so playback and recording timing stay aligned.
- Added a regression assertion covering the complete finale cue duration.
- Browser QA completed a Glass Cannon recording: the match reached COMPLETE, stayed recording through the finale tail, then opened a 34.4-second MP4 preview with no console warnings or errors.
- The full test command remains blocked by pre-existing Aegis shield and shield-block hit-stop assertion failures. The dedicated Playwright client is unavailable because its `playwright` package is not installed; in-app Browser QA completed successfully instead.

## Progress

- Inspected the existing deterministic tournament engine and cream UI.
- Chose a Web Worker batch runner so large samples do not freeze the interface.
- Ranking will use match win rate first, then championship rate and average wins as tie-breakers.
- Added deterministic batch seed derivation, report aggregation, and a module worker for 100-1,000 tournaments.
- Added the Meta Lab screen, all-class roster controls, progress/cancel controls, strongest/weakest findings, and rankings table.
- Added automated aggregation tests and browser-game text/time hooks.
- Verified a real 100-tournament run twice with identical results: Venom 91.7% match win rate and 77 titles; Gravis 13.8% and 0 titles.
- Verified 1,000-run cancellation, desktop layout, exact 390x844 mobile layout, contained table scrolling, and a clean browser console.

## TODO

- No required work remains for this feature.
- Optional future improvement: export Meta Lab results as CSV or compare two balance presets side by side.

## Per-Fight Random Spawn Positions

- Added a fresh spawn seed for every launched fight, independent from the configured match seed.
- Fighters now begin on a randomized mirrored ring around the arena center, preserving equal wall distance and fair separation.
- Spawn layouts remain reproducible when an explicit spawn seed is supplied for tests or debugging.
- Added regression coverage for variation, reproducibility, and two-fighter symmetry.
- Feature, simulation, and social tests pass.
- Browser QA launched the same Cinder versus Volta seed twice and confirmed visibly different mirrored starting diagonals with no console warnings or errors.
- The standalone web-game Playwright client remains unavailable because this workspace does not include its `playwright` dependency; in-app Browser QA completed instead.

## Orb Speed Balance Lab Control

- Added `orbSpeed` as a Balance Lab multiplier with the same global/class-specific behavior as existing combat tuning controls.
- Orb speed now affects each fighter's baseline movement velocity in newly created simulations while preserving deterministic tests when the same balance settings are used.
- Updated cache-busting imports so the in-app browser loads the new Balance Lab schema.
- Added regression coverage for sanitizing and applying the speed multiplier.
- Feature, simulation, and social tests pass.
- Browser QA confirmed the `ORB SPEED` control appears in the Balance Lab at the default value with no console warnings or errors.

## Weapon Clash Physics And Audio

- Added weapon-to-weapon collision detection for armed orbs using their actual weapon segments and widths.
- Weapon clashes emit a dedicated `weapon-clash` event/effect, briefly pause live hit-stop-enabled fights, and rebound the two owning orbs away from the clash.
- Increased the clash pause from 85ms to 150ms in gameplay and from 140ms to 220ms in Social Battle presentation so clashes read more clearly.
- Tightened clash geometry so a weapon cannot clash while it is actually hitting an orb body or contacting protected/base space behind the orb.
- Gravity/stun-locked fighters are excluded from clash rebound so control abilities still preserve their exact placement and damage windows.
- Added the supplied sword clash MP3 as `assets/audio/effects/sword-clash-241729.mp3` and mapped it to the `weapon-clash` sample event.
- Updated Social Battle presentation pause timing so clashes get a short 140ms catch instead of a full damage-hit freeze.
- Added regression tests for clash event/effect/rebound/pause behavior, body-hit-not-clash behavior, and audio sample mapping.
- Feature, simulation, and social tests pass.
- Browser QA loaded `20260625-weapon-clash1`, started a Cinder vs Frost recording, confirmed the live canvas rendered with no console warnings/errors, and saved screenshot evidence to `/private/tmp/social-battle-weapon-clash-qa.png`.
- The standalone web-game Playwright client remains unavailable because this workspace does not include its `playwright` dependency; in-app Browser QA completed instead.

## Gravity-Based Orb Physics

- Replaced per-frame constant-speed normalization with force-based orb movement.
- Added downward gravity, air drag, wall restitution/friction, speed caps, and a mild nearest-opponent acceleration so orbs arc naturally but still re-engage.
- Added minimum wall rebound energy to prevent gravity-induced floor chatter.
- Kept `baselineSpeed` as a tuning/cap reference instead of a value that is forcibly maintained every frame.
- Added regression coverage showing upward-moving orbs lose upward velocity under gravity.
- Updated deterministic fixture tolerances where one frame of gravity/drag now affects portal speed, and froze the hailstorm target fixture so it remains a pure damage test.
- Engagement validation across eight 20-second four-orb simulations produced 316 damage contacts and 75 weapon clashes, exceeding the existing 100-contact threshold.
- Feature, simulation, and social tests pass.
- Browser QA loaded `20260625-gravity-physics1`, started a Cinder vs Frost recording, confirmed the live canvas rendered with no console warnings/errors, and saved screenshot evidence to `/private/tmp/social-battle-gravity-physics-qa.png`.
- The standalone web-game Playwright client remains unavailable because this workspace does not include its `playwright` dependency; in-app Browser QA completed instead.

## Bouncy Wall And Orb Momentum

- Increased wall restitution and minimum rebound energy so orbs bounce to a more noticeable height after wall/floor impacts.
- Reduced tangent friction on wall impacts so bounces carry more sideways momentum.
- Increased orb-on-orb collision restitution while preserving balanced total momentum for equal-mass impacts.
- Added a separation impulse for overlapping orbs so low-speed body contacts still kick apart visibly.
- Added regression coverage for floor bounce height, stronger orb collision rebound, and overlap separation bounce.
- Engagement validation across eight 20-second four-orb simulations produced 306 damage contacts and 102 weapon clashes.
- Feature, simulation, and social tests pass.
- Updated cache-busting imports to `20260625-bouncy-momentum1`.
- The standalone web-game Playwright client remains unavailable because this workspace does not include its `playwright` dependency.

## Lighter Gravity And Stronger Impact Momentum

- Reduced orb gravity from 620 to 280 so upward arcs last longer and orbs can occasionally reach the top wall.
- Increased wall restitution and vertical/horizontal minimum rebound energy so wall/floor impacts create visibly larger bounces.
- Increased orb-on-orb collision restitution, overlap separation impulse, weapon clash rebound, and weapon-hit recoil.
- Raised the speed cap so wall/orb/weapon impulses survive long enough to read on screen.
- Added deterministic coverage that top-wall hits happen sometimes but do not dominate wall bounces.
- Engagement validation across eight 20-second four-orb simulations produced 281 damage contacts, 81 weapon clashes, 326 wall hits, and 5 top-wall hits.
- Feature, simulation, and social tests pass.
- Updated cache-busting imports to `20260625-light-gravity-momentum1`.
- The standalone web-game Playwright client remains unavailable because this workspace does not include its `playwright` dependency.

## Controlled Velocity And Rare Top-Wall Hits

- Raised gravity back up from 280 to 470 so orbs fall faster and do not hover in the air.
- Added a hard velocity cap of roughly 2.1x each orb's tuned baseline speed, applied immediately after physics, wall bounces, orb collisions, weapon clashes, and weapon hits.
- Reduced wall/orb/clash impulse tuning from the previous very-high-momentum pass while keeping bounces visibly strong.
- Removed weapon-hit speed gain: weapon hits can redirect/dampen motion but no longer add velocity.
- Updated tests so weapon hits are isolated from body collisions and assert no velocity gain.
- Updated top-wall coverage so normal simulations require top-wall contact to be very rare, while a high-momentum fixture proves top-wall collision still works and respects the cap.
- Engagement validation across eight 20-second four-orb simulations produced 325 damage contacts, 70 weapon clashes, 407 wall hits, 0 top-wall hits, and a max sampled speed of 832.
- Feature, simulation, and social tests pass.
- Updated cache-busting imports to `20260625-controlled-velocity1`.
- The standalone web-game Playwright client remains unavailable because this workspace does not include its `playwright` dependency.

## Simplified Pixel Weapons And Viking Ram

- Removed runtime loading and cream-background cutout logic for the detailed mood-board weapon and effect PNGs.
- Rebuilt all seven armed classes with one deterministic chunky pixel style: bold dark outline, compact silhouettes, minimal shading, and class-specific palettes.
- Replaced Venom's whip with a poison sword while preserving the existing three-stack poison mechanic.
- Removed Aegon's orbiting shield and frontal block behavior.
- Added a pixel viking helmet to Aegon's orb and made direct orb collisions his attack, with per-target hit cooldowns and collision analytics.
- Renamed Aegon's timed state to Berserker Rush; it grants five seconds of invulnerability and double collision damage every 20 seconds.
- Updated profile, HUD, social announcement, winning-method, audio signature, replay, and analytics language for the new weapons and mechanics.
- Updated focused tests and verified the complete test suite passes.
- Tuned Aegon's collision damage to 5.5 after a 140-match mixed-opponent sample landed at an even 50% win rate; Berserker Rush deals 11 collision damage.
- Desktop Browser QA confirmed the menu helmet, updated profile, simplified Cinder sword, unarmed helmeted Aegon, and a clean console.
- The Browser surface began enforcing a user-level localhost block before the final fresh battle/mobile capture, so those rendered checks remain incomplete.

## TODO

- Re-run a fresh live battle and mobile viewport capture when localhost Browser access is available again.

## Balance Patch

- Applied the requested first-pass balance changes for Venom, Gravis, Glacia, and Hex.
- Added focused tests for Glacia's deeper slow, Hex's 18-damage burst, Venom's three-stack poison cap, and Gravis pulling from 150 pixels away.
- Focused simulation and feature tests pass.
- Ran a deterministic 1,000-tournament validation sample with seed 2406 and no hazards:
  - Venom: 88.0% match win rate, 678 titles.
  - Hex: 58.1%, 142 titles.
  - Cinder: 48.3%, 64 titles.
  - Chrono: 43.7%, 40 titles.
  - Aegis: 42.3%, 42 titles.
  - Volta: 39.0%, 29 titles.
  - Glacia: 26.9%, 5 titles.
  - Gravis: 12.2%, 0 titles.
- The requested first pass improves Glacia and slightly trims Venom, but the tournament meta remains substantially imbalanced.

## TODO

- A future second balance pass should target Venom's poison uptime and redesign Gravis's pull advantage using matchup data.

## Visual Verification

- Reloaded the app in Browser and confirmed the updated class summaries fit cleanly in the match configuration screen.
- Launched a live Venom versus Gravis match and confirmed both updated weapons render, poison events reach the combat feed, and damage updates the HUD.
- Browser console remained clear of warnings and errors during the smoke test.

## Five-Orb Expansion And Last Stand

- Added Mirage, Echo, Forge, Static, and Shade as playable classes with native colors, two-letter marks, profile copy, setup roster entries, social metadata, procedural weapon visuals, procedural audio signatures, battle stats, announcements, highlights, and URL/settings support.
- Added Mirage decoys that can absorb weapon hits without dealing direct damage and subtly pull targeting through deterministic decoy targets.
- Added Echo delayed replay hits at reduced damage after successful weapon hits.
- Added Forge-only heat drops, heat collection, a heat resource bar, and temporary tempered weapon boosts.
- Added Static wall-bounce charge, charged HUD states, and a stun-enhanced chain zap on a charged strike.
- Added Shade backstab pressure, phase visuals, short pursuit speed, and phase damage mitigation after a successful backstab.
- Added deterministic last stand for every orb below 25% HP while alive, triggering once with class-matching conservative buffs, arena aura, social export bar treatment, announcement, and highlight support.
- Improved ability dock resource rendering with charged, almost-ready, active, and last-stand stripe/ring treatments.
- Added focused tests for new class roster/settings flow, Forge-only heat pickup, Static wall charge/zap, Echo delayed replay, Mirage decoy absorption, Shade phase, last stand single-trigger behavior, and new resource HUD data.
- `npm test` passes.
- Browser QA:
  - Local server: `http://localhost:5173`.
  - Verified app identity/title, nonblank DOM, new roster visibility, and no console warnings/errors.
  - Captured menu screenshot showing Mirage, Echo, Forge, Static, and Shade in the roster.
  - Launched a deterministic Mirage vs Forge Social Battle, verified the 1080x1100 export canvas, visible Forge heat drops/resource bar, procedural weapons, and clean console.
  - Let the fight continue until both fighters entered last stand; screenshot confirmed low-health aura/ring treatment and striped last-stand ability bars in social export.
  - After the final cache-key edit, reloaded the app and confirmed `main.js` and `styles.css` both load with `20260625-orb-expansion1`; console remained clean.
- Remaining tuning notes:
  - New classes use procedural pixel weapons rather than new generated PNG weapon assets.
  - New announcer matchup/winner clips fall back to existing procedural/legacy announcer behavior until recorded WAVs are generated.
  - Browser QA could not use `window.render_game_to_text` because this surface did not expose it during the run, so validation used DOM state, canvas screenshots, and console logs.

## Random Brackets And Ability Reworks

- Strengthened tournament randomization by mixing a dedicated bracket seed for every tournament while preserving reproducibility.
- Verified 1,000 eight-class tournaments cover all 105 possible first-round pairing patterns.
- Venom faced every other class between 129 and 167 times in that sample, so it is not locked to a fixed opponent.
- Reworked Glacia:
  - 30-second cooldown.
  - Five-second hailstorm covering exactly 30% of the playable arena.
  - Deals five damage per second to opponents inside.
  - Added persistent visuals, replay state, combat-feed events, sound, and hailstorm analytics.
- Reworked Gravis:
  - 45-second cooldown.
  - Pulls the nearest enemy into weapon range.
  - Freezes that enemy for five seconds while Gravis remains able to attack.
  - Added lock visuals, combat-feed events, sound, and gravity-lock analytics.
- Focused tests and syntax checks pass.
- New deterministic 1,000-tournament sample, seed 2406 with no hazards:
  - Venom: 85.3% match win rate, 614 titles.
  - Glacia: 59.2%, 159 titles.
  - Hex: 51.5%, 108 titles.
  - Cinder: 40.5%, 40 titles.
  - Chrono: 39.5%, 31 titles.
  - Aegis: 36.6%, 32 titles.
  - Volta: 31.5%, 14 titles.
  - Gravis: 22.5%, 2 titles.
- Browser QA confirmed:
  - The hailstorm renders as a contained pixel-art zone without obscuring the playfield.
  - Hailstorm cast and five-damage tick messages appear in the live combat feed.
  - Gravis's cooldown resets after activation and pulled targets remain damageable.
  - Post-match analytics show hailstorm casts/hits/damage and gravity locks/freeze time.
  - The browser console remained clear.

## Seeded Match Roster Selection

- Matches now shuffle an oversized selected class pool with the match seed before choosing fighter slots.
- Selecting all eight classes for a four-orb match produces four random unique classes instead of always taking the first four.
- The same seed reproduces the same roster for rematches and shared links.
- Selecting exactly as many classes as fighter slots preserves the chosen order.
- Browser QA with all eight classes, four slots, and seed 2407 selected Volta, Aegis, Chrono, and Gravis; the browser console remained clear.

## Social Battle Video Generator

- Added a dedicated two-fighter Social Battle mode with portrait, square, and
  landscape 1080p export canvases at 30 or 60 FPS.
- Added simple high-contrast fighter spheres, oversized existing pixel weapons,
  tracked health bars, damage/status feedback, bottom ability docks, passive
  labels, versus/countdown cards, announcements, and winner cards.
- Added deterministic presentation-only camera motion, hit-stop, screen shake,
  highlight slow motion, and late-match pacing without changing fixed simulation
  steps or RNG.
- Added a layered procedural Web Audio mixer with deterministic pitch variation,
  compressor limiting, category volumes, ambience, and recording-stream routing.
- Added MediaRecorder start/stop/cancel/retry/preview/download flow, useful
  filenames, captions, match metadata, and browser fallback messaging.
- Added developer toggles for the social mode, capture, motion, flashes, damage
  numbers, cards, and sound categories.
- Created an editable Canva broadcast source:
  https://www.canva.com/d/5RPoDUyT72EjpGc
- Added procedural-audio licensing notes and reviewed Kenney, Pixabay, and
  OpenGameArt licensing without downloading third-party files.
- Added focused social, recorder, audio scheduling, export dimension, HUD,
  highlight, URL, and deterministic result tests.
- Browser QA verified portrait, square, and landscape exports, 30/60 FPS,
  manual finalization, a 56.9-second full square recording, the exact 390x844
  mobile viewport, and a clean console.

## TODO

- The Codex in-app Browser can preview generated WebM blobs but intentionally
  blocks filesystem downloads. Normal Chrome download behavior remains available
  through the verified `DOWNLOAD WEBM` control.

## Bounce Audio And Intro Hook

- Added `assets/audio/announcer/wise/who-will-win.wav` and registered it as a first-class announcer cue.
- Social battle intros now play the full matchup clip, pause briefly, then ask "Who will win?" before the fight proceeds.
- If a matchup clip is missing, the legacy stitched-name fallback still runs and the question cue is scheduled after it.
- Retuned wall and orb-body bounce procedural audio into fuller resonant profiles with slightly calmer rate limits to avoid chatter during dense collisions.
- Bumped local module cache keys so file-based browser sessions pick up the new audio wiring.
- `node --test tests/*.test.mjs` passes.

## ElevenLabs Announcer Replacement

- Replaced the 67 active wise announcer clips from `/Users/maxli/Downloads/ElevenLabs_2026-06-25T05_36_42_Adam - Deep English Story Voice_pvc_sp90_s100_sb75_se10_b_m2.mp3`.
- Preserved the source as `assets/audio/source/elevenlabs-adam-wise-announcer-reel.mp3`.
- Added `scripts/split-elevenlabs-announcer.mjs` so the reel can be regenerated into the expected full-line matchup, winner, fight, overtime, and "Who will win?" WAV files.
- Kept the existing intro behavior: matchup clip first, then "Who will win?" after a short pause.
- Bumped the file-based browser cache key to `20260625-elevenlabs-announcer1`.
- `node --test tests/*.test.mjs` passes.

## ElevenLabs Announcer Timing Fix

- Corrected the early ElevenLabs split so `who-will-win.wav` no longer includes `Cinder wins`.
- Shifted winner windows back into alignment: `fire-wins.wav` now starts at the isolated Cinder wins line.
- Moved the matchup section start earlier so `fire-vs-ice.wav` maps to Cinder versus Frost instead of skipping ahead.
- Added an announcer asset cache key so the browser fetches the regenerated WAVs instead of reusing stale same-name files.
- `node --test tests/*.test.mjs` passes.

## ElevenLabs Announcer Segment Fix

- Replaced equal-spaced matchup splitting with explicit detected speech segments from the ElevenLabs reel.
- The active mapping now starts matchups at `11.357s`, so `fire-vs-ice.wav` is the first matchup line instead of a shifted later line.
- Merged the known split lines, including `fire-vs-aegis.wav` and the late Aegon matchup lines, so Aegon no longer drifts into the next orb label.
- Bumped announcer cache key to `20260625-elevenlabs-announcer4`.
- Computer Use confirmed the local browser/app surfaces, but Codex itself is blocked from Computer Use inspection. Browser direct `file://` navigation was blocked, and starting a localhost verification server was rejected by the environment usage/approval limit, so runtime Browser verification could not be completed here.
- `node --test tests/*.test.mjs` passes.

## Winner Announcer Cue Fix

- Victory events now resolve to the winner-specific announcer clip, such as `fire-wins`, `ice-wins`, or `aegis-wins`.
- Winner clips are scheduled after the existing finale sample instead of during the opening intro.
- The social intro still plays only the matchup clip followed by `who-will-win`.
- Bumped announcer cache key to `20260625-elevenlabs-announcer5`.
- Computer Use confirmed Chrome is on the local Orb Foundry page after refresh; existing exported preview videos remain baked and need retry/regeneration to include the new audio flow.
- `node --test tests/*.test.mjs` passes.

## Captioned Announcer Restoration

- Retired the uncaptioned ElevenLabs long-reel split for matchup and winner clips because timing drift shifted orb names.
- Restored all matchup and winner WAVs from the captioned HeyGen source reels using `scripts/split-wise-announcer.mjs`.
- Kept `who-will-win.wav` as a standalone ElevenLabs extraction, separate from all winner lines.
- Fixed legacy fallback mappings so Volta, Venom, Gravis, and Aegon no longer point to the next orb's old clip.
- Added `frost.wav` and `frost-wins.wav` fallback clips so Frost no longer falls back to Glacia.
- Bumped announcer cache key to `20260625-captioned-announcer1`.
- Verified the exact manifest mappings for the reported problem chain: Frost -> Hex, Hex -> Chrono, Chrono -> Volta, Volta -> Venom, Venom -> Gravis, Gravis -> Aegon are now correct as pairings rather than shifted names.
- `node --test tests/*.test.mjs` passes.

## Standalone Who Will Win Clip

- Replaced `assets/audio/announcer/wise/who-will-win.wav` directly from `/Users/maxli/Downloads/ElevenLabs_2026-06-25T18_15_51_Adam - Deep English Story Voice_pvc_sp90_s100_sb75_se10_b_m2.mp3`.
- Preserved the source as `assets/audio/source/elevenlabs-adam-who-will-win.mp3`.
- Bumped announcer cache key to `20260625-who-will-win2`.
- Computer Use confirmed the ElevenLabs page shows the standalone text `Who will win?`.
- `node --test tests/*.test.mjs` passes.

## Louder Bounce Audio

- Increased wall bounce gain and added an extra bright transient layer plus highpass texture.
- Increased orb-body bounce gain and added a punchier low thump, brighter snap layer, and third noise texture.
- Kept bounce rate limits above weapon-hit chatter while allowing slightly quicker bounce feedback.
- Computer Use confirmed Chrome is on the local Orb Foundry page and refresh was sent; current exported previews remain baked until retry/new export.
- `node --test tests/*.test.mjs` passes.

## Generated Impact Frames

- Generated three production pixel impact sprites with Creative Production direction: regular weapon contact, critical/knockout rupture, and direct collision shockwave.
- Normalized every sprite to a transparent shared-scale PNG with hard pixel edges, five-color palettes, and nearest-neighbor fitting.
- Replaced the universal 500ms presentation freeze with event-specific timing: 65ms regular, 75ms clash, 90ms collision/block, 120ms critical, and 180ms knockout.
- Added a renderer-owned real-time impact jolt that decays while deterministic simulation time is frozen.
- Routed regular, critical, collision, clash, block, and knockout effects to their matching generated sprite.
- Prevented finishing blows from stacking a regular/collision spark over the critical knockout frame.
- Added timing, priority, sprite-routing, file-existence, alpha, and palette validation.
- `node --test tests/*.test.mjs` and JavaScript syntax checks pass.
- Browser QA was blocked because the in-app Browser security policy rejected reloading the local `file://` game; no alternate browser route was attempted.

## Photo Weapon Hitbox Fit

- Reduced all photo weapon sprite scales so each trimmed sprite's forward tip
  aligns with the simulated weapon segment length instead of the oversized
  social-poster treatment.
- Added a social renderer test guard that checks every weapon profile's
  `lengthScale * (1 - anchorX)` stays within 1% of the gameplay hitbox reach.
- Bumped Social Battle module cache keys to `photo-weapons2`.
- Verified the current Chrono versus Volta URL in the in-app Browser:
  reloaded the page, launched a fresh recording, captured live gameplay, and
  confirmed the console stayed clear.

## Viral UI And Arena Modifiers

- Added deterministic Arena Modifier setup options:
  - Standard.
  - Tiny Cage with real smaller collision bounds and visible in-arena cage.
  - Sudden Death with lower HP and harder hits.
  - Overdrive with faster movement, faster weapon spin, and shorter hit rhythm.
  - Glass Cannon with lower HP and much higher weapon damage.
- Arena modifiers now survive compact shared URLs and are included in
  `render_game_to_text`, preview metadata, and internal state.
- Added Social Battle win probability meter, comeback chip, Tiny Cage/modifier
  badge, low-health danger styling, event-driven big moment labels, and winner
  HYPE SCORE.
- Added tests for modifier URL round-trips, Tiny Cage bounds, modifier stat
  changes, win probability, danger big-moment labeling, and hype score.
- Browser QA:
  - Loaded a fresh `viral-ui2` tab.
  - Selected Tiny Cage in setup.
  - Launched Chrono versus Volta.
  - Confirmed odds meter, Tiny Cage badge/bounds, and HYPE SCORE winner card
    rendered with no current-module console errors.
  - Checked 390px mobile viewport canvas sizing with no current-module console
    errors.

## Flat Social Battle Presentation

- Replaced floating health bars and class initials with live HP numbers inside
  flat, solid-color social-mode orbs.
- Removed the social arena grid, decorative floor, orb glow, motion trails,
  weapon bloom, orbit arcs, and combat zoom.
- The social compositor now shows the complete arena at a fixed scale in a
  smaller upper-stage frame.
- Replaced the ability-card dock with compact damage, hit, backstab, and
  class-specific stat panels.
- Added original outlined pixel-weapon silhouettes for every class while
  preserving deterministic collision endpoints.
- Created an editable Canva weapon reference board:
  https://www.canva.com/d/yD2swZEf2Fim2fR
- The supplied watermarked stock reference was not imported or shipped.
- Added a focused compact-stat test; all simulation, feature, and social tests
  pass.

## TODO

- No required work remains for the flat Social Battle presentation.
- Browser QA verified Cinder, Glacia, Hex, and Venom weapon silhouettes,
  fixed full-arena framing, native HP numerals, compact stat panels, desktop
  layout, the exact 390x844 viewport, recording finalization, and a clean
  console.

## Fixed High-Speed Combat And Overtime Presentation

- Removed the match `1X`, `2X`, and `4X` time-scale controls.
- Doubled physical orb movement from 132 to 264 units per second, and from 118
  to 236 for eight-orb matches.
- Removed hidden late-match Social Battle time acceleration; presentation
  hit-stop and highlight slow motion remain.
- Shrunk the Social Battle arena to half its previous width again and attached
  the fighter stat panels directly beneath it.
- Added a frozen `FIGHT` card after the countdown.
- Added an `OVERTIME` announcement at the deterministic 90-second boundary.
- Overtime changes the social arena to rust heat, dark edge pressure, warning
  corner blocks, and an amber double border.
- Created an editable Canva FIGHT / OVERTIME reference:
  https://www.canva.com/d/qLH__puinkCEzHg
- Added focused tests for doubled baseline speeds, one-time overtime activation,
  and the social overtime announcement.

## TODO

- No required work remains for this update.
- Browser QA confirmed the speed controls are absent, countdown flows through
  `2`, `1`, `FIGHT`, and live combat, stats sit immediately under the compact
  arena, overtime has both announcement and persistent warning states, the
  exact 390x844 viewport does not overflow, recording finalizes, and the
  console remains clean.

## Arena Visibility And Impact Pass

- Reversed the earlier half-width Social Battle arena treatment:
  - Portrait arena width increased from roughly 484 to 972 export pixels.
  - Square arena width increased from roughly 470 to 952 export pixels.
  - Landscape arena width increased from 500 to 1,120 export pixels.
- Increased the on-site canvas preview size per export format so the arena
  remains readable instead of shrinking the whole portrait canvas to one
  desktop viewport.
- Added deterministic weapon-hit recoil without changing damage values.
- Added regular-hit presentation emphasis: short hit-stop, screen shake, and
  directional slash feedback. Slow motion remains reserved for major moments.
- Reworked procedural impact audio with filtered deterministic noise
  transients, stronger metallic oscillator layers, and left/right placement
  based on the collision position.
- Added focused tests for all three Social Battle layouts, hit recoil and event
  positions, impact noise, and stereo placement.
- All feature, simulation, and social tests pass.

## Verification Note

- The supplied recording was identified as a 17.622-second, 1170x2532 portrait
  video with one audio track.
- This Codex session could not decode frames from the source movie, and the
  in-app Browser rejected local app access due current desktop permissions.
- Visual signoff is therefore recorded as blocked in `design-qa.md`; automated
  behavior and layout geometry are verified.

## Arcade Announcer And Material Impact Pass

- Generated a 23-cue announcer reel with HeyGen Video Agent and extracted local
  fighter, countdown, match-state, and winner WAVs.
- Added a deterministic presentation timeline for fighter callouts, versus,
  `3 · 2 · 1`, `FIGHT!`, and the transition into live simulation.
- Added foundry rings, sparks, diagonal FIGHT treatment, restrained camera
  impact, reduced-motion behavior, and flash-reduction behavior.
- Rebuilt combat audio around metallic resonators, filtered physical transients,
  deterministic stereo placement, orb-specific signatures, announcer ducking,
  polyphony limits, and recording-stream routing.
- Enriched simulation events with fighter/source/target types and positions
  without changing deterministic match logic.
- Added class-specific hit visuals for fire, ice, arcane, time, electricity,
  poison, gravity, and shield impacts.
- Added an announcer category toggle and volume control.
- Added focused tests for cue uniqueness, missing-asset fallback, distinct orb
  signatures, Aegis audio, event metadata, and recorded audio-track merging.

## Imported Combat Sample Pass

- Imported the supplied MP3 effects into `assets/audio/effects/` and mapped them
  to weapon collisions, Hex Arcane Burst, Aegis Surge, Volta stun hits, status
  impacts, and backstabs.
- Added sample-buffer loading to the Web Audio mixer so imported effects are
  captured in exported recordings and gracefully fall back to procedural sounds
  if a file fails to load.
- Added deterministic pitch/gain variation, stereo placement, rate limiting, and
  focused tests for sample manifests and event mappings.

## TODO

- Re-run real listening QA in a normal browser because the in-app Browser used
  for smoke testing reports no `AudioContext` support.
- Re-run portrait, square, landscape, reduced-motion, flash-reduction, Cinder,
  Aegis Surge, and recorded WebM visual checks in a browser with Web Audio
  support.

## Video-Paced Combat Scale And Hit-Stop Pass

- Increased standard orb radius from 25 to 42 and eight-orb radius from 20 to 32.
- Increased all weapon lengths and widths by 1.42 while keeping damage tuning unchanged.
- Increased standard and crowd movement speeds to 396 and 354 units per second,
  exactly 1.5x the previous values.
- Added an exact 500 ms presentation-only pause for weapon hits, backstabs, shield
  blocks, and invulnerability blocks. Simulation time, fixed steps, RNG, and outcomes
  remain deterministic.
- Simplified the social arena to its background and one thin perimeter line, and made
  the default hazard preset `NONE`.
- Reduced flat-orb outlines, enlarged and emboldened internal HP, and changed hit flash
  to an outer ring so HP remains readable during pauses.
- Added larger unique source-art class symbols beside every fighter stat line.
- Kept the complete arena visible in portrait, square, and landscape exports.
- The same 24-seed, 30-second sample increased from 17.375 to 31.958 average weapon
  contacts, with average blocks increasing from 0.833 to 1.875.
- Added focused tests for movement speed, orb and weapon sizing, contact density,
  hit-stop, block-stop, class-symbol coverage, deterministic outcomes, and export layout.
- Browser QA passed at 1440x1000 and 390x844 with no horizontal overflow or console
  warnings/errors.
- Browser verified 1080x1920 portrait, 1080x1080 square, and 1920x1080 landscape
  canvases and successfully finalized a landscape WebM preview.
- Quick Look captured the supplied recording, and the final side-by-side comparison is
  saved at `artifacts/orb-foundry-video-comparison.png`.

## TODO

- No required work remains for this pass.

## Viral Winner UI And Stat Alignment Pass

- Shrunk Chrono's pixel glaive visual scale so the source-art weapon no longer
  overreaches its gameplay hitbox.
- Fixed Social Battle stat panels by clipping panel contents and resetting the
  stat grid to left-aligned fitted text after the ability resource bar.
- Removed public HYPE display from the end-card/export metadata while leaving the
  score in developer/debug state hooks.
- Rebuilt the final winner card as a podium reveal with a crowned winner, crossed-out
  loser, final HP, win-method label, and compact battle stats.
- Browser QA verified the fixed stat alignment in the annotated Cinder vs Aegis tiny
  cage setup, the new winner podium in a fast Glass Cannon export, no public HYPE
  metadata, and Chrono's smaller glaive in a Chrono vs Volta run.
- Node tests passed with `node --test tests/*.test.mjs`.

## Hype Podium Badge Pass

- Added the current HYPE score to the first-place podium block on the winner screen.
- Kept HYPE out of the export preview metadata/cards.
- Node tests passed with `node --test tests/*.test.mjs` and `node --check src/social-renderer.js`.
- Browser QA for this tiny follow-up was blocked by the browser security policy for
  the local `127.0.0.1:4173` target, so no browser workaround was attempted.

## Comeback Meter Side Placement Pass

- Moved the COMEBACK chip under the left or right side of the win-probability
  meter based on the comeback fighter id, with a small class-color strip on the chip.
- Node tests passed with `node --test tests/*.test.mjs` and `node --check src/social-renderer.js`.
- Browser QA could not be completed because the in-app browser API returned no active
  or listed tabs for the open local page.

## Cropped Download Canvas Pass

- Cropped the Social Battle export presets so downloaded WebMs end just below
  the orb stat panels instead of including the old blank lower tail.
- Kept the arena/title/stat composition and dedicated MediaRecorder flow intact.
- Added a layout regression guard that limits leftover bottom margin for every
  export format.
- Node tests passed with `node --test tests/*.test.mjs`; syntax checks passed.
- Geometry check reports bottom margins of 57px portrait, 43px square, and 55px
  landscape.
- Visual Playwright smoke QA was blocked because the local web-game client could
  not resolve its `playwright` dependency in this workspace.

## Native MP4 Download Pass

- Changed Social Battle recording negotiation from WebM to native MP4, preferring
  H.264 Baseline with AAC and falling back to the browser's generic MP4 encoder.
- Kept the single-segment recorder start so the complete battle is finalized into
  one seekable file rather than truncating after an early media fragment.
- Changed download filenames and setup support copy to MP4, and bumped module cache
  keys so returning browsers do not retain the old WebM recorder.
- WebM-only browsers now retain the existing preview-only battle path instead of
  receiving a WebM file mislabeled as MP4.
- Node syntax checks and `node --test tests/*.test.mjs` pass with zero failures.
- Browser QA completed a 33-second Glass Cannon fight through native recording,
  winner finalization, and export preview with no console warnings or errors.
- The preview reported the full 33.0-second duration and exposed the MP4 download
  control. The separate Chrome extension was unavailable, so cross-browser codec
  coverage remains to be repeated when that connection is restored.

## Generated Pixel Sprite Asset Pass

- Generated and normalized a production PNG sprite set for Cinder, Frost, Hex,
  Chrono, Volta, Venom, Gravis, Aegon's helmet, the shared hit spark, and the
  Aegon collision impact.
- Saved final transparent sprites in `assets/generated/orb-foundry-pixel-set/final`
  with a manifest and review sheet at
  `assets/generated/orb-foundry-pixel-set/review/orb-foundry-generated-sprite-contact-sheet.png`.
- Replaced procedural weapon, helmet, and hit-spark rendering with image-based
  sprite rendering anchored to the existing gameplay hitboxes.
- Kept Venom's poison stacking while converting his visual weapon to a poison
  sword, and kept Aegon unarmed with viking-helmet visuals plus collision damage.
- Node syntax checks and `npm test` pass.
- Browser QA passed for Cinder vs Frost and Venom vs Aegon, with no console
  warnings/errors and generated sprites visible in live combat.

## Spliced ElevenLabs Announcer Intro Pass

- Replaced matchup-sentence audio with 15 standalone ElevenLabs clips: all 13
  orb names, `versus`, and `pick your winner`.
- Intro playback now assembles `left orb` + `versus` + `right orb`, then pauses
  briefly before `pick your winner`.
- Removed victory announcer cues and winner assets from the active manifest; the
  existing nonverbal match-finale sample still plays at battle end.
- Preserved the supplied MP3 sources under
  `assets/audio/source/elevenlabs-announcer-20260626` and documented their exact
  mapping in the wise-announcer manifest.
- `node --test tests/*.test.mjs` passes. All 15 WAV assets decode cleanly and
  return HTTP 200 from the local server.
- Interactive browser QA could not run because neither the in-app browser view
  nor the Chrome extension bridge was available in this session.

## Corrected Announcer Mapping And Combat SFX Pass

- Corrected the supplied announcer order to Mirage, Echo, Cinder, Frost, Hex,
  Chrono, Aegon, Volta, Venom, Gravis, Forge, Static, and Shade.
- Recorded the timestamp-to-name mapping in the announcer manifest and bumped
  the announcer/main cache keys.
- Replaced standard weapon-hit audio with `fantasy-sword-hit.mp3` and added
  `forge-item-pickup.mp3` for `forge-heat-pickup` events. Both originals are
  preserved under `assets/audio/source/effects-20260626`.
- Full Node test suite passes. Chrome smoke QA loaded every corrected announcer
  asset and both new effect assets successfully from the local server.

## Louder Announcer Pass

- Raised the announcer category from 0.92 to 1.0 and added a 1.15x gain stage
  specifically to spoken announcer clips.
- Left combat effects, ambience, and music gains unchanged; the existing master
  compressor continues to contain peaks for playback and recordings.

## Impact Frame Continuation Verification

- Re-read the project handoff, README, current simulation, presentation, and
  impact-frame implementation before making changes.
- Confirmed all feature, simulation, and social tests pass with `npm test`.
- Confirmed syntax checks pass for simulation, renderer, social renderer,
  social presentation, audio, and main application modules.
- Verified regular, critical, and collision impact PNGs retain alpha and their
  expected 96x96, 128x128, and 128x96 dimensions.
- Verified finishing blows emit the knockout before the trailing weapon-hit and
  the critical knockout frame's higher priority prevents replacement by the
  regular frame.
- No code defect was reproducible, so no gameplay or presentation code was
  changed in this continuation pass.
- Rendered browser QA remains blocked: the desktop sandbox declined permission
  to bind the local HTTP server after the session's elevated-execution allowance
  was exhausted, and no existing in-app Browser tab or server was available.

## TODO

- Re-run a live browser battle and inspect regular, collision, critical, clash,
  and knockout impact frames once localhost server access is available.

## World Cup Zero-Gravity And Delayed Item Use

- World Cup orb movement now bypasses both downward gravity and opponent-seeking acceleration while classic-mode physics remain unchanged.
- World Cup orb-on-orb restitution and minimum separation impulses were raised for visibly harder rebounds.
- The soccer ball, yellow card, and red card now orbit their collecting orb for exactly two seconds before activation.
- All World Cup pickups still use the supplied Forge item-pickup sample; red/yellow card activation now uses the supplied `virtual_vibes-pop-tap-click-fx-383733.mp3` as `world-cup-card-use.mp3`.
- Added deterministic text-state coverage for pending item type and activation countdown.
- Added regression tests for zero World Cup gravity/attraction, stronger collision rebound, delayed ball/card activation, pickup audio, and card-use audio.
- `npm test` passes with all feature, simulation, and social tests green.
- In-app Browser QA ran seed 1, visually confirmed a yellow card orbiting France before use, confirmed the later stun state, and found no console warnings or errors.
- The standalone web-game Playwright client remains unavailable because the workspace does not install Playwright; in-app Browser QA completed instead.

## TODO

- No required work remains for this World Cup gameplay/audio pass.

## Faster World Cup Pickups And Referee Audio

- Shortened the first World Cup pickup delay from 2.4–3.6 seconds to 1.4–2.2 seconds.
- Shortened the recurring pickup rhythm from 4.2–6.8 seconds to 2.4–3.6 seconds while preserving the existing three-pickup field cap.
- Added the supplied `virtual_vibes-pop-tap-click-fx-383733.mp3` as `orb-collision-pop.mp3` and made it the sample for orb-on-orb impact events.
- Replaced the red/yellow card activation sample with the supplied `freesound_community-referee-whistle-blow-gymnasium-6320.mp3`.
- Added regression assertions for both pickup timing windows, collision sample routing, card-whistle routing, and sample asset loading.
- `npm test` passes with all feature, simulation, and social tests green.
- In-app Browser QA confirmed the updated World Cup build renders active pickups and collision damage correctly with no console warnings or errors.
- The standalone web-game Playwright client remains unavailable because the workspace does not install Playwright; in-app Browser QA completed instead.

## TODO

- No required work remains for this pickup/audio tuning pass.

## Homing Yellow And Red Cards

- Yellow and red cards now follow the same two-second orbit-to-throw flow as the soccer ball, then launch as visible homing projectiles.
- Yellow-card impacts stun the target for 3.5 seconds; red-card impacts deal exactly two hearts (20 HP).
- At the time of this pass, shin guards blocked red-card damage at impact time; the later stacking-defense pass below supersedes that behavior.
- Added card-specific trails, glow, rotation, impact labels, critical presentation, and impact audio feedback.
- Added deterministic regression coverage for card launch, homing impact, stun duration, exact red-card damage, immunity, and impact audio.
- `npm test` and JavaScript syntax checks pass.
- In-app Browser QA confirmed the World Cup match launches and renders active card pickups with no console errors.

## TODO

- No required work remains for the homing-card pass.

## Louder Versus Cue

- Raised only the shared `versus` announcer cue from 1.15x to 1.4x playback gain, so the increase applies to both classic Orb Foundry and World Cup matchup sequences.
- Kept every other announcer cue at the existing 1.15x gain and bumped the audio cache key.
- Added regression coverage for the cue-specific gain selection; the full `npm test` suite and audio syntax check pass.
- A fresh browser smoke test could not run because permission to bind the localhost test server was declined after the current Codex usage allowance was reached. This audio-only change has no rendering or gameplay impact.

## TODO

- Optionally audition the 1.4x versus level in-browser and fine-tune by ear if a different emphasis is desired.

## Faster Projectiles And Stacking Shin Guards

- Raised World Cup projectile base speeds to 650 px/s for the soccer ball and 600 px/s for yellow/red cards.
- Added a global-only `WORLD CUP PROJECTILE SPEED` multiplier to the Balance Lab, including validation, JSON import/export, share-link persistence, and deterministic simulation state.
- Replaced five-second, 100% shin-guard immunity with permanent stacking damage reduction: one guard divides incoming damage by 1.1, two by 1.2, and each additional guard adds another 0.1 to the divisor.
- Updated the World Cup status dock to display defense as a multiplier and added a persistent cyan defense ring around protected country orbs.
- Added regression coverage for configurable projectile speed, global-only Balance Lab sanitization, permanent defense stacks, exact reduced damage, and non-expiring behavior.
- Full tests and module syntax checks pass. In-app Browser QA confirmed the new Lab control is readable, accepts a 1.5x value, and produces no console errors.
- The standalone web-game Playwright client remains unavailable because this workspace does not install Playwright; in-app Browser QA completed instead.

## TODO

- No required work remains for this projectile-speed and shin-guard balance pass.

## Rarer Healing Drinks And Shin Guards

- Reduced the green healing drink weight from 1.15 to 0.65 and the shin-guard weight from 0.82 to 0.42.
- Their resulting shares of weighted random spawns are now about 14.4% and 9.3%, down from about 21.3% and 15.2%.
- Left the overall World Cup pickup timer and arena pickup cap unchanged.
- Added regression assertions for both rarity ceilings; the full automated test suite and syntax checks pass.
- In-app Browser smoke testing loaded the cache-busted build with no console errors. The standalone game test client remains unavailable because Playwright is not installed in the workspace.

## TODO

- No required work remains for this pickup-rarity adjustment.

## Shorter Yellow-Card Stun

- Reduced the yellow-card stun from 3.5 seconds to 2.5 seconds; the later throwable rebalance below supersedes this with a 1.5-second stun.
- Centralized the duration so gameplay, pickup copy, impact text, and emitted event metadata stay synchronized.
- Updated deterministic tests for the exact impact duration; the full automated suite and syntax checks pass.
- In-app Browser smoke testing loaded the cache-busted build with no console errors. The standalone client remains unavailable because Playwright is not installed.

## TODO

- No required work remains for this stun-duration adjustment.

## World Cup Throwable Rebalance

- Yellow cards now stun for 1.5 seconds and deal five damage (half a heart) before attack and defense multipliers.
- Soccer balls and red cards now each deal 15 damage (1.5 hearts) before multipliers.
- Centralized all three damage values and the yellow-card stun duration so simulation, pickup labels, impact feedback, and event metadata stay synchronized.
- Updated deterministic coverage for raw damage, stacked attack boosts, shin-guard reduction, and exact stun duration.
- Full tests and syntax checks pass; the cache-busted build loads in the in-app Browser with no console errors.
- The standalone game test client remains unavailable because Playwright is not installed in the workspace.

## TODO

- No required work remains for this throwable balance pass.

## Removed Pickup And Hit Popups

- Removed the floating popup text from powerup pickups and enemy-hit effects in the arena renderer.
- Kept the non-text visuals intact, including pickup flashes, projectile impact frames, rings, and other effect sprites.
- Verified with `node --check src/renderer.js` and the full `npm test` suite; all tests pass.
- The standalone web-game Playwright client remains unavailable because `playwright` is not installed in the workspace.

## Removed World Cup Pickup Banner Overlay

- Removed the World Cup pickup-specific social overlay hooks that showed the large centered `... PICKED UP` banner and the matching lower pickup callout strip.
- Added a runtime guard in `main.js` so `world-cup-pickup` events explicitly clear and skip social overlay banners even if stale helper logic were ever reintroduced.
- Bumped the `index.html` and `main.js` cache-bust versions so the browser stops serving the older banner code.
- Left other social highlights intact, including homing-ball and card announcements.
- Verified with `node --check src/social.js`, `node --check src/main.js`, and the full `npm test` suite; all tests pass.

## Removed All World Cup Item Popups

- Extended the social-overlay removal to World Cup projectile-hit events too, so pickup, homing-ball-hit, and yellow/red-card-hit events no longer produce the centered big-moment banner or the lower callout strip.
- Added a broader runtime guard in `main.js` that clears and skips those overlays for `world-cup-pickup`, `world-cup-ball-hit`, and `world-cup-card-hit`.
- Bumped the module cache-bust versions again so the browser loads the updated `social.js`/`main.js` pair.
- Verified with syntax checks and the full `npm test` suite; all tests pass.

## Simpler World Cup Top HUD

- Reverted the top-of-arena World Cup HUD to a simpler presentation: country name on each side, a centered `VS`, and the heart row directly underneath each name.
- Removed the top HUD flag squares and country-code line so the layout matches the earlier minimal screenshot more closely.
- Verified with `node --check src/social-renderer.js` and the full `npm test` suite; all tests pass.
- The standalone Playwright visual loop remains unavailable in this workspace because `playwright` is not installed locally.

## Small Flags Above Country Names

- Added compact rectangular country flags above each World Cup country name in the top HUD while preserving the simpler names-plus-hearts layout.
- Reused the existing loaded flag assets and rendered them as clipped banners instead of the previous large square flag blocks.
- Verified with `node --check src/social-renderer.js` and the full `npm test` suite; all tests pass.

## Homing Ball Uses Card Impact Frames

- Switched the World Cup homing soccer ball from the collision impact-frame family to the same critical impact-frame family used by yellow and red cards.
- Kept the existing homing-ball timing, hit-stop duration, and critical-hit audio mix unchanged; only the impact-frame style changed.
- Verified with syntax checks for `simulation.js`, `renderer.js`, and `social.js`, plus the full `npm test` suite; all tests pass.

## Stronger Homing Ball Pause And Shake

- Updated the homing-ball hit presentation to use the same stronger critical pause and screen-shake profile as yellow/red cards.
- The homing ball now uses a 120ms presentation pause with 0.78 shake strength instead of the subtler projectile pause.
- Verified with `node --check src/social.js` and the full `npm test` suite; all tests pass.

## TODO

- No required work remains for this popup-removal pass.

## Circle Arena Option

- Added a persistent `arenaShape` setting with `square` default and a new `circle` option in the match setup dialog.
- Kept arena modifiers separate from geometry, so combinations like `tiny + circle` work without removing the current square behavior.
- Updated simulation spawning, fighter wall collision, Volta bolt bounce, World Cup projectile culling, pickups, heat drops, portal exits, decoys, and gravity-lock repositioning to respect curved arena walls.
- Added circular masking and wall rendering in the arena renderer, plus social/export labeling for circle runs.
- Added regression coverage for arena-shape URL/settings round-tripping, circle spawn containment, and circle wall reflection.
- `npm test` passes, and in-app browser smoke confirmed the new shape selector shows both `square` and `circle` with no console warnings or errors during launch.

## World Cup Pickup Damage Lab Control

- Added a new global-only Balance Lab control: `WORLD CUP PICKUP DAMAGE`.
- Wired the new multiplier through Balance settings sanitization, persistence, and live text-state output.
- World Cup soccer-ball, yellow-card, and red-card damage now scale by the lab multiplier before shin-guard defense and still stack with permanent attack-drink boosts.
- Added regression coverage for settings round-tripping, global-only sanitization, and scaled soccer-ball damage.
- Full `npm test` suite passes.

## Combat Damage Ramps

- Reworked Classic Orb Foundry combat around a standard per-class `progression` contract: lower opening damage, +1 weapon/ram damage per successful hit, and either escalating ability damage or ability rate.
- Converted Cinder burn, Frost hailstorm, Hex burst, Volta bolt, Venom poison, Static zap, and Echo replay timing to consume the live ramp values; cooldown-based abilities now cast faster as their ability rate grows.
- Replaced the two large ability panels beneath the social arena with simple orb-colored `Damage` and `Ability` / `Ability rate` text readouts.
- Added regression coverage for weapon, ability-damage, and ability-rate progression. Full `npm test` suite passes.
- The bundled web-game Playwright client remains unavailable because this workspace has no `playwright` package. In-app browser verification confirmed the readouts start at the expected lower values, rise after hits, and emit no console warnings or errors.

## Faster Standard Combat, No Backstabs

- Removed the backstab multiplier, event, impact effect, analytics, tournament counter, social highlight/scoring paths, and the dedicated critical-hit audio route. Rear weapon contacts now resolve as ordinary weapon hits.
- Raised default two-orb speed from 396 to 594, eight-orb speed from 354 to 531, weapon reach scale from 1.42 to 2.13, and weapon rotation speed by a 1.75× global multiplier.
- Updated combat, audio, presentation, tournament, and tuning regression coverage to lock in the new behavior. Full `npm test` suite passes.
- The web-game Playwright client is still unavailable without a local `playwright` package. In-app browser verification showed the longer, faster weapon arcs in a live Cinder vs Frost battle with no console warnings or errors.

## Neutral Weapon Orb Roster

- Generated six new GPT pixel-art orb sources on bright #00ff00 chroma-key backgrounds: Sword, Crossbow, Potion, Axe, Scythe, and Staff.
- Removed the key with the installed imagegen helper, then applied deterministic five-color palette cleanup, nearest-neighbor scaling, shared 192×96 normalization, a shared x=88/y=48 weapon anchor, and a reviewed contact sheet.
- Stored composites, weapon-only battle sprites, source cutouts, manifest metadata, and contact-sheet review under `assets/generated/orb-foundry-weapon-orbs/`.
- Added the six canonical visible roster IDs and neutral metadata in `src/simulation.js` and `src/presentation.js`; legacy IDs remain non-enumerable compatibility aliases for older test/tournament data.
- Routed menu cards, profile views, setup cards, generated weapon rendering, social weapon icons, audio signatures, social HUD labels, captions, and asset-path tests through the weapon roster.
- `npm test` passes; all modified modules pass `node --check`.
- Local HTTP/browser smoke pass completed on port 4173: menu, Sword profile, six-orb setup, live Potion vs Sword battle, and export preview were inspected; browser logs reported no warnings or errors.

## Ranged Crossbow And Potion Combat

- Restored the legacy elemental roster as selectable, enumerable classes alongside the six neutral weapon orbs; legacy profiles, atlas crops, generated weapons, and audio metadata remain available.
- Crossbow and Potion now have zero melee weapon damage while retaining blocking weapon silhouettes. Crossbow fires arrows; Potion throws flasks that burst in an AOE on wall/orb impact.
- Ranged intervals shorten deterministically after each impact. Added ranged projectile state, analytics, replay capture fields, social HUD labels, announcements, captions, audio cues, renderer effects, and text-state output.
- Added simulation and social regression coverage for no melee damage, deterministic ranged firing, interval acceleration, Potion multi-orb AOE, legacy roster validity, labels, and export metadata.
- `npm test` passes: 3 suites passed. In-app browser smoke verified the 19-entry roster, expanded setup, live Crossbow vs Potion combat, ranged impacts, export-ready preview, and zero console warnings/errors.

## Orb Race: Unlimited Growth And Bounce Effects

- Removed gameplay caps for Duplicator children and Orbital satellites; orbital satellites now distribute around a complete visible orbit ring.
- Drill triangles now cross the course at a steady rate (about five seconds), dealing continuous 1 damage per second for the first drill and scaling with each additional drill.
- Added expanding, two-second fading rings at every race bounce and kept normal racers in the fixed corridor from the top wall to the first number line until their layers are cleared.
- Added regression coverage for drill damage/effect expiry and the fixed vertical bounce corridor. Full `npm test` suite passes.

## Orb Race: Descending Fixed-Height Bounce Lanes

- Restored per-layer downward race progress: clearing a number wall moves the racer into the next lower lane.
- Each lane keeps the original top-wall-to-first-line bounce height, so racers cannot rebound farther upward than the opening lane permits.
- Added simulation coverage for both lower-lane progression and the fixed maximum bounce height. Full `npm test` suite passes.
- The standalone Playwright pass could not run because this workspace has no local `playwright` package.

## Orb Race: Cleared Boards And Speedster Growth

- Cleared number layers now remain blank white, with no leftover border or number; only the current and future layers draw.
- Speedster now gains unbounded speed and bounce height at every number-wall impact, with the track boundary as its only ceiling.
- Race bounce audio is keyed by the actual orb ID, so independently bouncing duplicate orbs each receive the collision sound instead of sharing one rate limit.
- Enlarged the center matchup names and removed the rendered trails from drill triangles.
- Added regression coverage for Speedster growth and child-orb bounce identifiers. Full `npm test` suite passes.
- The required web-game Playwright client was attempted but remains blocked because `playwright` is not installed in this workspace.

## Orb Race: Ballistic Rebounds

- Replaced the invisible per-lane ceiling with gravity-driven rebound impulses. Intact number lines launch racers upward; the only ceiling is the visible top board edge.
- A broken number line no longer produces a rebound: racers physically fall through its blank space to the next active layer.
- Duplicator now spawns every 10 bounces, orbiters retain a fixed size and overlap around their ring, and bounce rings expand only from 1× to 1.5× the orb radius.
- Updated progression and momentum regression coverage. Full `npm test` suite passes.
- The required web-game Playwright client was attempted but is unavailable because this workspace has no local `playwright` package.

## Orb Race: Wall Progression And Drill Audio

- Side-wall impacts now count as progression bounces: they raise the next number-line damage, grow class effects, emit the bounce effect/audio, and leave number-layer health unchanged until a real number-line impact.
- Drill cadence now scales slowly with all bounce types: every 3 bounces initially, every 2 after 18 bounces, then every bounce after 36. Added the supplied drill-start MP3 as `assets/audio/effects/race-drill.mp3` and play it on every launched drill.
- Orbital impacts now multiply parent damage by its full orb count, so each orbiter contributes the same damage as the parent orb.
- Added coverage for vertical-wall growth, Orbital payload damage, shortened drill cadence, and the new audio asset. Full `npm test` suite passes.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Position-Based Orbital Damage

- Replaced the all-orbiters multiplier with a position-based collision check shared with the visible orbital ring geometry. The parent deals its normal impact damage; only satellite circles overlapping the active number line add another parent-damage instance.
- Added per-impact `orbiterHits` event data and regression coverage proving touching orbiters deal damage while orbiters elsewhere on the ring do not.
- Bumped the app entry cache key to load the new race audio/rules. Full `npm test` suite passes.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Orbital Contact Audio And Pixel Drills

- A race-bounce event now plays one orb-collision sample for the parent plus each satellite actually touching the number line; every simultaneous contact receives a distinct audio rate-limit key.
- Drill launch audio is trimmed to its first 0.5 seconds. Drill projectiles now render as outlined pixel-art tools with colored body, bit, and highlight details.
- Drills leave small accent-colored expanding rings at regular intervals and move at 80% of normal speed (1.25× slower) while inside a number wall.
- Added coverage for contact-sound fan-out, drill sample duration, slowed tunneling, and projectile ring trails. Full `npm test` suite passes.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Math And Persistent-Effect Roster

- Added X² (bounce count squared damage), Fibonacci (sequence damage), Grower (physical size growth), Lazer (constant scaling beam), and Sticky (ground DPS with a 0.1s initial stick that grows by 0.05s each bounce) to the race roster and setup picker.
- Speedster now gains only travel speed at each bounce and retains fixed number-line damage. Other racers retain deterministic damage scaling; math damage values override the normal linear value.
- Added an opt-in fading-orb-trails control, threaded through simulation, replay capture, setup UI, and shareable settings URLs.
- Added renderer support for the Lazer beam and race trails, plus HUD stat lines for the new racers.
- Added URL/settings and simulation regression coverage for every new rule. Full `npm test` suite passes.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Sticky Tick Isolation And Full Trails

- Sticky ground-DPS ticks now only reduce the current number layer. They do not increment bounce/damage progression, change Sticky's duration, fire any ability, emit bounce effects, or add movement-trail points.
- Fading movement trails now render at the active orb's full size and persist for 1.2 seconds instead of shrinking quickly.
- Added regression coverage for Sticky tick isolation. Full `npm test` suite passes.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Rotating Lazer, Flash, And Damage Toggle

- Lazer now renders a rotating red beam; Flash gains one speed and one damage level per bounce.
- Added Xˣ and Golden Ratio racers with power-based damage formulas.
- Sticky uses deterministic completed-stick durations: 0.1s, then 0.2s, then 0.3s, without wall bounces advancing the sequence.
- Restored and tested the visible top-wall rebound at launch.
- Added a shareable Scaling Damage toggle; disabling it keeps racers at base damage while preserving movement and special visuals.
- Updated setup/HUD roster labels and regression coverage. Full `npm test` suite passes.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Tracked Top-Wall Bounces

- Restored the visible top boundary as a solid race wall that reverses orb velocity and records a normal progression bounce for every orb.
- Top-wall impacts now advance bounce-based abilities/damage and emit `race-bounce` events with `surface: "top-wall"` for consistent audio/effects.
- Added regression coverage for top-wall bounce counting and event emission.

## Orb Race: Solid Top Rebounds And Beam Impacts

- Number-wall launches now intentionally travel past the top boundary so every racer, including Speedster, strikes the visible solid wall with upward velocity and rebounds rather than merely turning at a zero-speed apex.
- Sticky now holds for its predetermined duration (first 0.1 seconds), then immediately receives its upward launch; it does not remain grounded or wait to fall before the next bounce.
- Lazer now raycasts its rotating deep-red beam to the active number line or the outer board border. It damages only on a number-line hit and creates its expanding ring at that beam impact, never at the orb's own bounce point.
- Added top-wall, timed Sticky release, Lazer ray/border, and Lazer impact-ring regression coverage. Full `npm test` suite passes.
- The required web-game Playwright client could not run because this workspace has no local `playwright` package.

## Orb Race: Board Rendering Repair

- Restored the full race presentation after a canvas render exception stopped drawing at the first board: `drawRaceBoard` now receives the active simulation before rendering Lazer geometry.
- Both racer boards, their orbs, stats, and the central versus matchup render again. Bumped the entry/module cache key so already-open browsers fetch the repaired renderer.
- Added a renderer integration regression test that verifies both boards receive the live simulation and the central matchup is drawn. Full `npm test` suite passes.
- The required web-game Playwright client remains blocked because `playwright` is not installed locally.

## Orb Race: Batman And Batarangs

- Added Batman to the selectable/default race roster. Every fifth Batman bounce launches a deterministic batarang that descends through number layers while rebounding between the side borders.
- Batarangs start with Batman's current damage and gain one additional damage per border rebound, applying their stacked damage continuously while inside an uncleared number layer.
- Added black-and-gold batarang visuals, a Batman orb emblem, and a centered lightning-bolt emblem for Flash; the race HUD tracks Batman's total throws.
- Bumped the browser entry/module cache key and added regression coverage for fifth-bounce throws, side rebounds, stacking batarang damage, layer damage, and roster settings. Full `npm test` suite passes.
- The required web-game Playwright client could not run because `playwright` is not installed locally.

## Orb Race: Lane-Bound Batarangs And Symbol Polish

- Batarangs are now much larger, use a bat-shaped silhouette, and physically ricochet inside the active race box: top wall, side walls, and the current number line all stack their damage. They cannot pass through an uncleared number line.
- Updated Batman to a yellow oval bat badge and Flash to the red circular lightning emblem from the supplied visual references. Drill projectiles now render as the requested dark-green downward triangle.
- Reduced Grower's size gain to 1.2% per bounce. Fibonacci, Xˣ, and Golden Ratio now use both lower travel speed and slower bounce-path time progression than standard racers.
- Added coverage for batarang lane restriction/stacking, reduced Grower scaling, and the slower math-orb motion. Full `npm test` suite passes.
- The required web-game Playwright client could not run because `playwright` is not installed locally.

## Orb Race: Exact Sprite Assets And Directed Lazer

- Copied the supplied Batman, batarang, Flash, and drill PNGs into `assets/race/` and render those exact source images as the race sprites instead of recreated vector artwork.
- Fibonacci, Xˣ, and Golden Ratio retain slower motion but now use a much greater horizontal launch component, creating longer arcs. Grower now gains 0.1 scale per bounce.
- Lazer now has only a subtle slow wobble and flips its beam direction with horizontal travel: rightward means upward; leftward means downward into the number line.
- Race trails start near-solid, then fade smoothly through the trail; social-export text now uses heavier weights and black outlines throughout.
- Bumped the cache key and added coverage for longer math arcs, Grower’s new growth, and directed Lazer rays. Full `npm test` suite passes.
- The required web-game Playwright client could not run because `playwright` is not installed locally.

## Orb Race: Lower Arcs And Number-Line Progression

- Corrected Grower to the requested 0.1% size increase per bounce (`+0.001` scale), rather than a 0.1 full-scale increase.
- Reworked launch physics so standard orbs leave clearance under the visible top wall; top/side impacts remain physical but no longer increase orb damage, abilities, duplicates, or orbiters. Batarangs likewise only stack on a number-line hit.
- Sticky now launches on a longer, faster side-to-side arc that stays under the top wall and crosses the board over roughly two to three jumps. Fibonacci, Xˣ, and Golden Ratio now use lower gravity to hover while retaining their slower movement.
- The supplied image-editing service rejected a transparency conversion, so a local alpha-mask fallback preserved the supplied black batarang silhouette and removed its white/checkerboard backing into `assets/race/batarang-transparent.png`.
- Bumped the cache key and added regression coverage for non-ramping wall impacts, top-wall clearance, Sticky’s long jump, batarang number-line-only stacking, and Grower’s 0.1% growth. Full `npm test` suite passes.
- The required web-game Playwright client could not run because `playwright` is not installed locally.

## Orb Race: Natural Laser Turns And Long-Arcs Palette

- Lazer now carries a persistent beam angle that turns at a bounded rate toward its up/down state after each horizontal reversal, with only a subtle wobble. This replaces the previous instantaneous direction flip.
- Drill and Lazer contact bounces continue their progression but deal zero direct number-wall damage; only their drill and beam projectiles damage layers.
- Every racer now launches into the same long, gravity-controlled side-to-side arc previously reserved for Sticky, while Fibonacci, Xˣ, and Golden Ratio retain their lower-gravity slow hover behavior.
- Updated every standard racer palette (Batman and Flash untouched) to high-contrast, solid bright colors that carry through the board, HUD, and export presentation.
- Added regression coverage for smooth Lazer state transitions, projectile-only impact damage, and shared long arcs. Full `npm test` suite passes.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Hero Power-Ups And Restored Speed Arcs

- Restored the earlier steep, wall-reaching arc for Speedster and Flash only. Their side and top wall collisions now count as ramp bounces; all other racers remain number-line-only.
- Lazer now makes a complete directional spin before settling into its next up/down targeting state, preserving the directional beam goal while making reversals visibly continuous.
- Flash triggers a deterministic five-second 5× speed/damage ramp at every 50-speed milestone and now leaves yellow lightning traces even when ordinary trails are disabled.
- Batman's tenth, twentieth, and later tenth batarang throws spread a black cape and release ten deterministic black bomb projectiles, each snapshotting Batman's current damage.
- Added center markings for X², Fibonacci, Xˣ, and Golden Ratio. Drill artwork is tightly triangle-clipped at render time, eliminating the supplied source image's light backdrop. The sound button now reserves space for `MUTE`, preventing the clipped `M` control glyph.
- Added simulation coverage for wall-ramp progression, Flash charging/trails, and Batman bomb bursts. Full `npm test` suite passes.
- The requested drill-background cleanup used the image editing workflow, but the local chroma-key helper cannot run because Pillow is unavailable. The renderer-side clip provides the visible transparent result without changing the supplied drill shape.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Shared Arcs, Cape Wings, And Supercharge Trail

- Speedster and Flash now share the same long horizontal launch arc as the rest of the roster; their top/side progression hooks remain active whenever those surfaces are contacted.
- Lazer's reversal still completes a full revolution-plus-target transition so the beam naturally settles into its left/down or right/up state.
- Batman is now a solid yellow orb with a black extracted symbol. The supplied wing reference is stored as `assets/race/batwing-source.png`, background-extracted at render time, and mirrored on both sides during the cape ability.
- Bomb impacts now create orange fading rings on the active number line. Bomb and supercharge details were removed from the ability-stat text.
- Replaced Flash's ordinary always-on lightning with a generated blue trail sprite that appears only during the five-second supercharge window.
- Hardened the sound control typography/width to prevent the clipped M glyph and its protruding shadow artifacts.
- Full `npm test` suite passes; cache keys bumped to `race-visual-polish1`.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: 180-Degree Laser And Batarang Explosions

- Laser direction changes now take the shortest exact 180° path between its downward-left and upward-right states, at a gradual bounded turn rate with only a tiny wobble.
- Flash always keeps its normal orb-circle trail. During supercharge, the generated blue lightning sprite overlays those circles with a natural aspect ratio instead of replacing or smushing them.
- Batman's yellow orb retains a black theme/accent and black center symbol. Each individual batarang now triggers the cape-and-ten-black-bomb burst after its tenth number-line bounce, with current-damage snapshots and orange fading impact rings.
- Tightened the generic orb-preview typography and sound-control typography to eliminate the malformed M glyph/shadow spikes.
- Full `npm test` suite passes; cache keys bumped to `race-visual-polish2`.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Full Laser Revolutions And Batarang Consumption

- Each batarang now disappears immediately after its tenth number-line bounce as the ten-bomb cape drop begins; its explosion remains damage-scaled and emits the orange impact effects.
- Batman's race HUD damage/number text is forced black while the orb remains solid yellow with its black emblem.
- Laser reversals now accelerate and brake through one full clockwise 360° revolution before settling, rather than taking a short 180° path.
- Swapped the canvas/CSS display font to bold Trebuchet MS with ligatures disabled to eliminate the malformed M shape.
- Full `npm test` suite passes; cache keys bumped to `race-visual-polish3`.
- The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Ability Bars, Levelled Sticky Damage, And Solid Trails

- Slowed Fibonacci, Xˣ, and Golden Ratio gravity/movement further so the math roster hovers longer and advances at a calmer pace. Grower now gains exactly 1% scale per number-line bounce.
- Added four-segment (25% increments) ability bars for Flash and Batman. Flash advances only outside an active supercharge, while Batman advances on each batarang explosion; HUD labels omit internal bomb/supercharge wording.
- Lazer now rotates continuously clockwise through 360° every five seconds. Flash's supercharged trail is now blue lightning only, with the regular orb after-image removed during the boost.
- Sticky now reports and advances deterministic stick levels, emits a collision sound event for every 0.1-second damage tick, and keeps its timed rebound behavior. A new Solid Sticky/Grower Trails setting is available in setup and shareable URLs; solid trails render as opaque outlined orb echoes.
- Full `npm test` suite passes. The required web-game Playwright client was attempted but remains unavailable because `playwright` is not installed locally.

## Orb Race: Bounce-Charged Speedforce And Bat Bomb Meters

- Repositioned the Flash/Batman meters outside the boards: top racers charge in the top-right, bottom racers in the bottom-left, leaving damage and stat copy unobstructed.
- Replaced four-step instant fills with continuous 2%-per-eligible-bounce charge. Twenty-five bounces reaches 50%; Flash bounces during supercharge are excluded, and activation resets Speedforce to zero.
- Batman's Bat Bombs meter now fills from Batman's own bounces and resets when the bomb-drop ability activates. Labels now read `SPEEDFORCE` and `BAT BOMBS`.
- Added regression coverage for gradual charge, supercharge reset/lockout, Batman reset, and the 25-bounce halfway point. Full `npm test` suite passes; the required Playwright client was attempted but cannot run because `playwright` is not installed locally.

## Orb Race: Tighter Ability-Meter Placement

- Reduced the vertical offset for both meters so they sit immediately outside their board borders, aligned with the surrounding stat words while keeping the top-right/bottom-left placement.

## Orb Race: Everyone Team Cue

- Teams that resolve to four or more display parts now collapse to the `EVERYONE` label. The deterministic race intro uses the supplied Everyone clip for that single team cue, followed by the normal versus and winner prompt sequence.
- `EVERYONE` renders with a repeating rainbow palette in the matchup HUD and winner/export message, while retaining the existing black outline treatment.
- Copied the supplied Everyone MP3 byte-for-byte into both the source archive and active announcer manifest, with cache keys and regression coverage updated.

## Orb Race: Finish Labels And Team Damage Totals

- Added translucent gray `Like & Subscribe!` text above the top board's checker finish and `@OrbBattleGrounds` above the bottom board's finish.
- Batman's Bat Bomb meter now charges at 10% per eligible bounce, reaching 50% after five bounces and 100% after ten before resetting on the existing bomb activation.
- Team `DAMAGE/SEC` now represents simultaneous line impact: it sums each member's current damage, all duplicator orbs, every orbital orb, and active drill projectile DPS instead of only the previous one-second damage history.
- Added simulation and renderer regression coverage; full `npm test` suite passes.
- The required web-game Playwright client was attempted, but `playwright` is not installed locally, so screenshot/browser-loop verification remains unavailable in this environment.

## Orb Race: Boomerang, Magnet, Mines, Gravity, Jackpot, And Anchor

- Added six stable racers to the shared Orb Race registry and roster/team picker. Each supports per-orb fading trails, solid trails, scaling-damage overrides, shareable URL settings, team grouping, matchup naming, winner presentation, and social export.
- Boomerang launches a large pixel projectile every five number-line bounces. It remains inside the active layer, damages the wall on its outbound and return crossings, and reports its launch count in the HUD.
- Magnet applies a distance-scaled physical pull toward the active number line while preserving normal collisions. Its live pull and magnetic field rings are visible in the HUD and on the orb.
- Mines drops and arms a mine every four number-line bounces. Armed mines follow layer progression, burst on the next active wall, disappear after triggering, and render as dark bombs with colored impact rings.
- Gravity cycles actual acceleration through normal, low, and reversed states every three number-line bounces. Its active state is shown in the HUD and remains independent from damage scaling.
- Jackpot uses the race's seeded RNG for repeatable critical-hit sequences. Critical hits deal 4x current damage, reset the visible meter, increment the win counter, and create a bright coin/spark impact.
- Anchor uses slower horizontal motion and a low physical arc. Proximity to the active line charges its meter; leaving drains it, and a full charge makes the next hit deal 3x current damage before resetting.
- Extended simultaneous team damage calculations to include the new charged/projectile contributions, and extended deterministic replay snapshots with every new mechanic and projectile.
- Added coverage for registry normalization, team selection/grouping, URL round trips, all six activations, projectile/layer collisions, magnet and gravity physics, seeded Jackpot sequences, Anchor charge/reset/drain, per-orb settings, team damage totals, deterministic replay, HUD/social rendering, and winner selection.
- Full `npm test` suite passes; browser module cache keys were bumped to `20260715-race-orbs1`.
- The required standalone Playwright client still cannot start because `playwright` is not installed locally. An in-app browser fallback successfully built a six-racer matchup, completed a deterministic export, rendered the grouped winner/caption and new HUD elements without overlap, and reported no console warnings or errors.

## Orb Race: Generated Weapon Art And Ramping Ability Rework

- Generated four new pixel-art sources with GPT Image Creation, chroma-keyed them into transparent PNGs, and integrated the exact outputs into the roster and race canvas: a large cyan/gold boomerang, a dark orange-core proximity mine, a magenta/cyan horseshoe magnet, and a cash-and-coins Jackpot burst.
- Boomerang and Mines now deal projectile-only damage. Their first number-line bounce launches one damage-1 weapon; every later bounce increases both the launch count and weapon damage by one when scaling is enabled.
- Boomerangs now use Batman-like box ricochets, damage only on number-line contact, ramp their own projectile damage, and disappear cleanly after ten damaging bounces without an explosion. Mines fall like Bat Bombs and burst immediately on the current active line with the generated pixel mine and orange impact ring.
- Replaced Jackpot's chance meter with a deterministic three-reel slot machine. It spins every five seconds and selects equal-probability Unlucky (1x), Medium (2x), or Lucky (10x) damage; Lucky line hits render the generated cash explosion.
- Reworked Gravity into an accumulating level: every number-line bounce raises real downward acceleration and reduces the physical launch arc, producing progressively quicker, lower jumps. Removed the letter-style center icons from the reworked racers; Magnet uses the generated horseshoe artwork instead.
- Updated simultaneous team damage aggregation, replay/text state, setup copy, HUD stats, project assets, and cache keys. Full `npm test` coverage passes.
- The standalone Playwright helper remains unavailable because the project has no local `playwright` package. The in-app browser fallback completed a five-racer export using the generated art: the three-reel Lucky result, large ricocheting boomerangs, Magnet emblem/field, blank Gravity center with level HUD, team names, and both boards rendered without overlap or console warnings/errors.

## Orb Race: Independent Jackpot Reels And Boomerang Tuning

- Replaced Jackpot's drawn meter with exact GPT Image Creation outputs: a transparent three-window gold/red pixel slot cabinet, a separate animated red-knob lever, and a three-cell skull/coin/rainbow-diamond symbol sheet. The source chroma renders are preserved alongside the cleaned runtime PNGs.
- Jackpot now waits for its five-second cooldown, visibly spins three independent seeded reels, pulls and returns the lever, and commits the product of three equal-probability `0.5x`, `2x`, or `10x` results. The same seed reproduces the complete reel sequence.
- Products above `10x` enter rainbow Jackpot mode, add the existing generated cash asset to bounces, and replace the orb trail with money. Products above `5x` through `10x` add cash impacts without a money trail. Products below `5x` tint the machine red, show skulls, and add no cash effect.
- Boomerang still launches on every number-line bounce, begins with a one-projectile volley, gains one projectile per volley every ten bounces, uses a smaller sprite/collision radius, and disappears after three damaging number-line bounces. Its orb body remains projectile-only.
- Removed bounce height from Speedster's HUD and updated setup copy, replay/text state, team damage aggregation, generated-asset coverage, and browser cache keys.
- `node --check` passes for the modified runtime modules. `npm test` passes: 3 suites passed, 0 failed.
- The standalone web-game Playwright client was attempted but remains blocked by the missing local `playwright` package. The in-app browser fallback completed a deterministic 1080x1920 Jackpot-versus-Boomerang export; the generated machine, independent reel symbols, lever, rainbow `50x` result, money trail, three-hit Boomerangs, HUD spacing, and winner preview rendered with no console warnings or errors.
- TODO: none for this request.

## Orb Race: Enlarged Jackpot, Batman Boomerang, And Splodey

- Enlarged Jackpot's generated slot machine by 50% while preserving multi-member HUD fitting. Each dynamic skull/coin/rainbow result is clipped inside its own reel window, and the external status is now cooldown-only rather than duplicating the roll result.
- Reworked the generated lever animation so its base remains vertical and its handle travels downward during the pull instead of rotating sideways.
- Rebuilt Boomerang around Batman's batarang contract: one Batman-sized projectile launches every five orb bounces, uses the same horizontal/vertical ricochet physics, gains one damage on every damaging number-line bounce, and expires after ten damaging hits. It never triggers Batman's cape, bomb drop, or explosion.
- Preserved the stable `mines` ID and URL compatibility while rebranding the racer to Splodey. Splodey no longer uses the generated mine sprite or bounce-triggered volleys; it throws one physical black ball every three seconds, the ball follows a visible seeded arc before bursting on the active wall, and Splodey's real launch arc is higher than standard racers.
- Widened two-member stat-column spacing after visual QA exposed cramped Boomerang/Splodey damage labels. Updated setup copy, HUD names/stats, replay/text cooldown state, cache keys, and deterministic regression coverage.
- `node --check` passes for all modified runtime modules. `npm test` passes: 3 suites passed, 0 failed.
- The standalone web-game Playwright client remains unavailable because the project has no local `playwright` package. The in-app browser fallback completed a deterministic 1080x1920 Jackpot versus Boomerang + Splodey export: the enlarged inset reels, black airborne bomb, matched Boomerang scale, higher Splodey arc, separated team stats, matchup/winner copy, and cache-refreshed assets rendered with no console warnings or errors.

## Orb Race: Inset Jackpot Reels, Ramped Splodey Volleys, And Piercing Boomerangs

- Refit Jackpot's three dynamic symbols to the measured white-window bounds in the generated cabinet (20.3% left inset, 31% top inset, 17.9% window width, and 42% window height), keeping every result and multiplier inside its matching white square.
- Splodey now drops a staggered physical volley every three seconds. The volley begins at one bomb and gains one additional independently visible black bomb per orb bounce; the stable `mines` ID remains unchanged.
- Boomerang HUD/setup copy no longer describes the weapon as a Bat-rang. Its projectiles now pass through and damage every numbered layer they cross, ricochet at the race-box ends, ramp on each layer penetration, and expire after 15 damaging crossings—1.5 times Batman's 10-hit Batarang lifetime—with no explosion.
- Updated cache keys and deterministic simulation/social coverage. `npm test` passes all three suites.
- In-app browser QA completed a deterministic Jackpot versus Boomerang + Splodey full-portrait export. The skull results and multiplier labels were contained inside all three cabinet windows, the ramped black bombs appeared as distinct falling projectiles, piercing Boomerangs crossed the lower walls, the renamed HUD copy fit, and the browser console contained no warnings or errors.
- TODO: none for this request.

## Orb Race: Wide Splodey Bomb Fan And Jackpot Machine Audio

- Expanded Splodey's timed volley from a half-width fan to a full deterministic −1-to-+1 horizontal velocity spread. The center bombs drop near the orb while the outer bombs disperse toward opposite sides of the race box; volley size still gains one bomb per bounce.
- Archived the supplied original one-second stereo MP3s under `assets/audio/source/jackpot-effects-20260715/` and added runtime copies for the slot reels and lever.
- Jackpot roll startup now emits separate deterministic lever-pull and reel-spin events. The provided lever clip plays as the handle pulls down, while the provided spinning clip plays during the visible reel animation and is included in recordings.
- Updated the sample manifest/cache key, browser module cache keys, and regression coverage for asset presence, audio routing, event emission, and wide bomb dispersion. `npm test` passes all three suites.
- The required standalone Playwright client remains blocked by its missing local dependency. In-app browser smoke QA completed a Jackpot-versus-Splodey full-portrait export with the refreshed modules and slot cabinet, and reported no console warnings or errors.

## Orb Race: Jackpot Outcome Audio

- Jackpot number-line hits now emit an outcome-specific cue: the Forge pickup sample for a true Jackpot hit, and the World Cup KO sample for an Unlucky/Bust hit. Cash/Medium outcomes keep the normal bounce audio without adding either stinger.
- Added deterministic simulation and audio-plan assertions for both outcome events, refreshed browser cache keys, and confirmed `npm test` passes all three suites.

## Setup UI: Wider Orb Race Roster Picker

- Expanded the setup dialog from a narrow 760px cap to a responsive 1180px cap, with viewport-safe margins so the team roster can use desktop width without changing the recorded portrait canvas.
- Increased team-panel gutters, orb-row height, icon size, label columns, and option spacing so the larger roster is easier to scan and uses the new horizontal space evenly.
- Preserved the single-column team layout below the existing mobile breakpoint and refreshed only the stylesheet cache key. `npm test` passes all three suites.
- In-app browser QA at desktop width showed both team columns expanded cleanly with no overlap or console warnings.

## Setup UI: Multi-Column Orb Cards

- Restored the original compact orb-card proportions and icon sizes while keeping the setup dialog full-width on desktop.
- Changed each team roster from a single vertical stack to a responsive card grid: two columns at normal desktop widths, three columns on very wide displays, and one column on mobile. Team 1 and Team 2 remain separate, so selection order and per-orb options are unchanged.
- Browser QA measured a 1256px dialog with two 268px card columns per team, 19 cards rendered per roster, and no console warnings.

## Orb Race: Black Hole Singularity

- Added the stable `black-hole` Orb Race contender to the shared roster and weapon grouping, including picker normalization, team naming, HUD/export stats, and URL-compatible settings.
- Black Hole keeps a one-damage base hit. After an eight-second cooldown it teleports to the arena center for five seconds, drains 50 damage per second from each remaining numbered layer, accumulates that damage as power, and grows visually with the absorbed total before returning to its exact saved position.
- Added deterministic replay fields, suction start/end events, live team damage-per-second contribution, a center-locked active physics state, and regression coverage for activation, all-layer suction, growth, cooldown/return, base damage, and seeded repeatability.
- Generated and chroma-keyed a pixel-art black-hole sprite at `assets/race/generated/black-hole-orb.png`, wired it into the picker and social renderer with a pulsing singularity ring, and added a `SINGULARITY` ability meter plus a Black Hole announcer fallback cue.
- Refreshed browser cache keys to `20260717-meteor14`. `npm test` passes all three suites.

## Orb Race: Black Hole Suction Damage And Teleport Polish

- Black Hole now starts at one damage and promotes the cumulative amount drained from the three number walls into its next normal bounce damage. Suction strength starts at 50 per second and increases by 25 per singularity use; the absorbed damage persists after the return teleport.
- Reworked singularity movement into deterministic departure/arrival phases. The orb hides briefly, appears at the center at four-times normal size with a subtle breathing pulse, then returns to its saved track position and launches left or right using the simulation RNG.
- Added generated pixel-art wispy number streams for each remaining layer and a chroma-keyed teleport twinkle mark. Streams are clipped per live layer so they disappear as the corresponding wall clears; the previous purple/dashed ring is gone.
- Removed Black Hole cooldown/power/ability meters from the visible stats, leaving damage as the only Black Hole stat. Added the supplied impact and teleport samples, including first/second-half teleport playback segments, and refreshed browser/audio cache keys to `20260717-black-hole2`.
- Added asset/audio routing and deterministic suction, teleport, damage-promotion, and second-use ramp coverage. `npm test` passes all three suites.
- Browser smoke check loaded the Orb Race setup and portrait recording; generated Black Hole visuals rendered without console errors. The standalone Playwright client could not run because its local `playwright` package is unavailable, so the in-app browser was used for the screenshot check.

## Orb Race: Black Hole Ability Bar And Number Suction

- Restored Black Hole's `SINGULARITY` charge bar beside the existing Flash/Batman/Meteor ability bars while keeping cooldown and power out of the damage stats.
- Extended departure and return vanish windows to one full second, with the same deterministic teleport audio segmentation and arrival marks.
- Replaced the generated suction-stream sprite with deterministic number particles: two streams per live number wall, each digit grows toward the center and fades into the singularity; cleared walls stop emitting immediately.
- Updated Black Hole timing/visual regression coverage and refreshed browser/audio cache keys to `20260717-black-hole3`. `npm test` passes all three suites.

## Orb Race: Black Hole Cooldown Meter

- Fixed the Black Hole bar filter so its `SINGULARITY` cooldown bar actually renders beside the other ability bars.
- Black Hole now uses a 12-second cooldown and begins at 50% charge, causing the first singularity to trigger after six seconds. Subsequent uses reset to the full cooldown.
- Added regression assertions for the initial six-second cooldown/50% fill and refreshed browser/audio cache keys to `20260717-black-hole5`.

## Black Hole Announcer (2026-07-18)

- Added the supplied Gael clip to the stable `black-hole` racer ID.
- Preserved the source copy and bumped the browser/audio cache version.

## Orb Race: Meteor Opening Cooldown Charge

- Meteor's `METEOR SUMMON` bar now starts half full with 7.5 seconds remaining on its first 15-second summon cooldown, matching Black Hole's opening charge behavior.
- Subsequent giant-meteor summons still reset to the full 15-second cooldown and refill continuously from zero.
- Added deterministic regression coverage for Meteor's initial cooldown and 50% bar state, and refreshed browser/audio cache keys to `20260717-black-hole6`.

## Orb Race: Godzilla Walker

- Added the stable `godzilla` racer as the first non-bouncing Orb Race contender. Godzilla walks on the current number wall, alternates animated stomps and tail/claw swipes, falls through cleared walls, and deals a double-stomp heavy landing on the next layer.
- Added a deterministic atomic-breath state machine: look up, glowing dorsal charge, bend, then five seconds of 1000-DPS downward breath on a 15-second cooldown. Each completed beam doubles the next beam, and contacted layers retain ten seconds of blue burn damage equal to the current stomp value.
- Generated, chroma-keyed, and preserved six GPT image assets: separate head, torso/arms, tail, legs, atomic-breath, and ground-burn sprites under `assets/race/generated/godzilla/`, with untouched sources under `assets/race/generated/godzilla-source/`.
- Added articulated canvas animation, impact-frame shake, white wall-hit flicker, generated burn rendering, an `ATOMIC BREATH` ability bar, Godzilla-specific HUD damage channels, replay/text-state fields, team damage aggregation, roster/grouping, URL coverage, and deterministic simulation tests.
- Refreshed browser/audio cache keys to `20260718-godzilla1`.
- Verified the live portrait canvas in the in-app browser: the four-part walker, downward atomic beam, burn residue, impact ring, full cooldown bar, wall-hit flash, and billion-strength wall typography render together without console warnings or errors. `npm test` passes all three suites.

## Orb Race: Godzilla Rig + Drill Cadence (2026-07-19)

- Replaced the combined Godzilla legs sprite with separate generated left/right leg assets. The renderer now anchors the head, torso, tail socket, and planted feet to one shared skeleton, animating stride and tail motion with positional offsets so pieces stay connected without rotating the character apart.
- Removed the regular yellow stomp flash; normal Godzilla impacts use the existing cyan impact treatment while heavy layer breaks retain the stronger white impact frame.
- Reworked Drill firing to a fixed three-second timer. Number-line bounces no longer shorten the cooldown; instead each bounce reduces the speed of newly launched drills until the configured minimum. Drills still slow while crossing a number wall and keep their deterministic damage/trail behavior.
- Restored `assets/audio/effects/race-drill.mp3` to the sample manifest and `race-drill` event routing, refreshed browser/audio cache keys to `20260719-godzilla-drill1`, and updated the roster copy and deterministic tests.
- Verified a live Godzilla-versus-Drill portrait race in the in-app browser with no console warnings or errors. `npm test` passes all three suites.

## Orb Race: Drill Drag HUD (2026-07-19)

- Simplified Drill's special HUD stat to a single `DRAG` value; the launch count and raw speed are no longer displayed.
- Added deterministic `raceDrillDrag`, which increments with every Drill bounce while the underlying projectile speed continues to slow, and included it in replay/text state.
- Refreshed browser cache keys to `20260719-godzilla-drill2` and added simulation/social HUD assertions.

## Orb Race: Speedster Damage Scaling (2026-07-19)

- Speedster now gains normal scaled number-line damage on every bounce while preserving its uncapped speed and arc-height ramps. The existing scaling-damage toggle still controls both ramps.
- Updated the roster copy to `+SPEED +DAMAGE EVERY BOUNCE`, refreshed cache keys to `20260719-speedster-damage1`, and updated the deterministic speed-ramp regression.

## Orb Race: Reference Portrait Course Layout (2026-07-20)

- Reworked the Orb Race presentation to match the supplied portrait race-card reference: narrower centered boards, larger cream margins, and a taller inter-board matchup area.
- Stacked the two team names vertically around a centered `VS`, preserving team colors and rainbow Everyone rendering. Number layers, active tint, stat placement, and checkered finish remain unchanged.
- Refreshed browser/audio cache keys to `20260720-race-card-layout1`.

## Orb Race: Expanded Finish Flag + Original Announcements (2026-07-22)

- Centralized the portrait board geometry in `orb-race.js` so renderer sections and race finish physics share the same chamber, layer-stack, label-band, and checkerboard bounds.
- Expanded the finish area with a dedicated gray-label band above a clipped checkered flag; the label and pattern are separated by a bold divider and stay inside equal-sized boards.
- Number walls now use an explicit heavy display face with a black keyline and fit-to-box sizing, including values through `1,000,000,000`.
- Added original local voice announcements for Magnet, Factorial, Ricochet, Sawblade, and Godzilla, with preserved source copies and deterministic race intro mapping.
- Refreshed browser/audio cache keys to `20260722-race-finish-announcements1`; added layout, billion-number, and generated-announcement regression coverage.

## Orb Race: Godzilla + Black Hole Announcer Clips (2026-07-22)

- Replaced the empty placeholder WAVs with non-empty spoken MP3 clips for Magnet, Factorial, Ricochet, Sawblade, Godzilla, and Black Hole; preserved source copies under `assets/audio/source/race-announcer-custom/`.
- Mapped the valid clips into the race announcer manifest and refreshed browser/audio cache keys to `20260722-race-finish-announcements3`.

## Orb Race: Fully Generated Announcement Palette (2026-07-22)

- Generated a complete 37-clip Orb Race voice set covering every orb, every group, Everyone, Plus, and Versus; the existing Pick Your Winner clip remains unchanged.
- Stored generated clips under `assets/audio/announcer/generated-race/` with preserved source copies under `assets/audio/source/race-announcer-generated/`.
- Scoped the generated manifest to Orb Race only and refreshed browser/audio cache keys to `20260722-race-finish-announcements4`.

## Classic Orb Foundry: 1v1 Setup Contract (2026-07-27)

- Added the dedicated 11-orb Classic registry contract to setup and URL normalization, with `Sword vs Bow` as the safe default and legacy Classic IDs rejected during decoding.
- Classic setup now always requires exactly two contenders, displays the complete new roster, preserves click selection order, and uses bright solid roster previews for Sword, Bow, Potion, Axe, Dagger, Katana, Duplicator, Orbital, Unarmed, Grower, and Slammy.
- Fixed Classic launches to use the deterministic match seed for opening state, kept World Cup and Orb Race setup behavior independent, exposed the complete Classic progression state through `render_game_to_text`, and refreshed browser cache keys to `20260727-classic-rework5`.

## Classic Orb Foundry: Pixel Weapon + Presentation Pass (2026-07-27)

- Completed the deterministic 11-orb Classic combat rework, including fixed mirrored spawns, isolated lower-arc physics, hit/block progression, Bow and Potion projectiles, Axe criticals, Katana delayed slices, Duplicator lineage, Orbital contacts, and the three weaponless scaling fighters.
- Generated six original low-resolution pixel weapon assets, keyed them to transparent PNGs, and switched rendering to nearest-neighbor sampling with compact orbiting attachments that preserve each sprite's aspect ratio.
- Updated Bow so projectile impacts remain one damage and no longer increase future volley size; blocks remain its arrow-count progression path.
- Tightened the portrait composition with a narrower arena, ten-pixel border, and Impact-based outlined matchup title matching the supplied condensed display treatment.
- Added a complete Classic-only announcer palette and distinct event audio routes without changing the Orb Race announcement manifest.
- Added focused registry, settings, physics, combat, lineage, deterministic replay, rendering-asset, and audio coverage. `npm test` passes all 16 tests.

## Classic Orb Foundry: Orbiting Weapon + Bow Volley Correction (2026-07-27)

- Re-anchored every armed Classic sprite at its handle/pivot on the orb edge while preserving independent weapon rotation, so the weapon revolves around a non-rotating orb instead of floating beside it.
- Doubled the visible weapon scale from the prior compact pass, retained nearest-neighbor sampling, and kept Potion's original aspect ratio.
- Generated an original large pixel-art Bow arrow with GPT Image, removed its chroma key, and installed the transparent nearest-neighbor asset at `assets/generated/classic-weapon-rework/final/bow-arrow.png`.
- Fixed Bow's modern Classic cadence path so missing legacy interval fields can no longer produce `NaN` cooldowns and a projectile flood. Bow now fires one deterministic volley every 1.5 seconds, starts at one arrow, and only gains arrows from blocks.
- Tightened the portrait title/arena composition around the supplied reference: title-case condensed names, outlined `VS`, weapon icons between the names, a centered 930-pixel arena, and a fourteen-pixel black frame.
- Added a Bow cadence regression covering finite cooldowns, bounded volley count, one active starting arrow, and no arrow-count increase from projectile hits.
- Re-ran the complete test suite: 16 tests passed, 0 failed.

## Classic Orb Foundry: True Weapon Orbit + Accurate Hit Capsules (2026-07-27)

- Split weapon transforms into an orbital rotation around the orb center, a handle translation to the orb edge, and a separate sprite-orientation rotation. The handle now traces the same circular path as the simulation weapon angle while the orb itself remains unrotated.
- Moved Classic weapon render scale, sprite orientation, orbital inset, collision reach, and collision width into the shared weapon definitions. Rendering and simulation now consume the same geometry instead of maintaining mismatched visual and collision constants.
- Tightened Sword, Dagger, and Katana hit capsules around their narrow blades while preserving the wider Axe head, Bow guard, and Potion body. Enlarged visuals now receive matching collision reach without treating the entire transparent sprite rectangle as damaging.
- Restored Bow hit progression: every successful arrow impact adds two arrows to the next volley, while blocks continue adding one. The fixed 1.5-second firing cadence remains finite and prevents the former frame-by-frame projectile flood.
- Disabled highlight and countdown arena shake for Classic only; Orb Race and World Cup presentation shake remain unchanged.
- Advanced the Classic browser cache key to `20260727-classic-rework5`.
- Added deterministic coverage for arrow-hit progression and shared handle/collision geometry. Playwright verified a live Sword vs Bow match with true changing weapon angles, progression from 1 to 65 arrows, stable arena framing, and no console/page error artifacts. `npm test`: 17 passed, 0 failed.

## Orb Race Catch-Up Zoom Reverted (2026-07-27)

- Removed the experimental long-form zoom/recentering behavior at the user's request.
- Restored the prior fixed-scale, monotonic shared camera that follows only the leading/winning racer's discrete layer progress; a sufficiently distant trailing racer may leave the frame.
- Removed the zoom presentation constants, renderer state, scaling transform, cache key, and dedicated zoom tests.
- Verified the restored 50-layer Speedster vs Fibonacci presentation in Playwright with no browser errors. `npm test`: 17 passed, 0 failed.

## Orb Race Long-Form Layer Presets + Target Intro (2026-07-28)

- Added final-layer presets for 10,000; 100,000; 500,000; 1 million; 10 million; 500 million; 1 billion; and 1 quintillion.
- Added a reusable preset builder that combines the selected layer count and final health into a monotonic, editable number-wall progression. The default 13-layer 10,000 course exactly follows `10, 25, 50, 100, 150, 250, 500, 1,000, 1,500, 2,000, 3,000, 5,000, 10,000`.
- Long Race now opens the 16:9 preset builder with Number of Layers and Final Layer Health controls. Manual wall edits remain supported and switch the selector to Custom.
- Raised the deterministic layer-health limit to one quintillion and preserved the existing compact URL schema; quintillion courses round-trip through shared settings URLs.
- Replaced the long-form “Pick your winner” audio tail with a recorded-canvas intro question: `WHO WILL BREAK / [TARGET] LAYER / FIRST?`. Short-form Orb Race keeps its existing announcement sequence.
- Added regression coverage for every preset target, monotonic generation, the reference 10,000 course, quintillion URL serialization, long-form announcement routing, target typography, and setup markup.
- Playwright verified the 13-layer Speedster vs Fibonacci intro at 1920×1080 with the target overlay visible and no console/page errors. `npm test`: 17 passed, 0 failed.

## Orb Race Intro Options + Tilted Layer (2026-07-28)

- Added independent Orb Race setup toggles for the long-form target message, the spoken target-layer question, and the classic team matchup announcement. Short races retain the independent matchup toggle and their existing Pick Your Winner tail.
- Generated and preserved eight original target-question clips covering every final-layer preset from 10,000 through one quintillion.
- Added an optional shared-health two-piece tilted number wall with a selectable 1-based layer control for both short and long races.
- The active tilted wall now uses a deterministic V-shaped physical surface. Contacts receive a modest slope-directed rebound while damage, team sharing, clearing, and replay behavior continue through the existing number-wall rules.
- Added the Speedster/Flash 20K easter egg: a qualifying contact glitches through the selected tilted wall, resets the speed counter to 20,000, and emits a deterministic event. A losing Speedster or Flash displays `SPEED: -1`.
- Extended compact settings URLs, cache keys, audio manifests, and automated tests for the new settings, announcer routing, generated clips, tilted collision, glitch behavior, and deterministic replay.

## Classic Orb Foundry: Radius Orbit + Impact Direction Polish (2026-07-28)

- Moved the shared Classic weapon pivot to the orb radius and changed the canvas layer order so the orb naturally masks the base of each handle while the blade, bow, or bottle orbits outside it.
- Strengthened the solid black orb and weapon edge treatment, switched live health numbers to the same condensed Impact-style stack used by the matchup title, enlarged title weapon icons, and increased Bow projectile rendering from 58 to 86 pixels without stretching its generated asset.
- Added deterministic 180-degree impact flips. A damaging weapon hit reverses only the attacker; a weapon block reverses both participants. The flip eases across the shared 0.1-second Classic impact pause before rotation resumes in the opposite direction.
- Added the matching 0.1-second victim treatment: the struck orb becomes the cream arena-background color while its centered black health number stays visible.
- Increased Classic lateral movement and weapon rotation by 1.75× while retaining the lower vertical launch and floor-rebound arc. Orb Race physics remain unchanged.
- Fixed Bow volley progression so all arrows still deal one damage and a successful volley adds two arrows only once, even if several arrows from that volley connect in the same frame.
- Added a Classic audio policy with an explicit event allowlist and replacement-sample slots. The current Classic effects mix now keeps only the weapon-block sample; announcements and every non-Classic mode retain their independent routing.
- Added focused coverage for hit/block flips, pause timing, victim flash state, speed scaling, per-volley Bow progression, and the replacement-ready audio policy. Playwright verified the 1080×1920 Sword vs Bow canvas, generated assets, title treatment, enlarged arrows, runtime text state, and a clean browser console.

## Orb Race Snake Ground Slither (2026-07-30)

- Changed Snake and its existing split children to deterministic ground-track movement on the active number line. Snake bodies now deal zero bounce damage and continue to fall through cleared layers when the team is ready to finish.
- Snake tails grow one segment every 0.5 seconds, deal two damage per tail segment every 0.25 seconds while touching the line, and retain the existing full-tail split cadence and generated child-ID format.
- Added a faster deterministic tail wiggle, grounded tail contact positioning, long-form path transformation, and tail damage in the Orb Race HUD. Tail hits reuse the existing `race-bounce` audio-event route.
- Added simulation coverage for grounded movement, zero body damage, 0.5-second growth, ramping tail damage, split continuity, child growth, and renderer coverage for animated tail motion.

## Orb Race Top-Wall, Draftmaster, and Berserker Tuning (2026-07-30)

- Speedster and Flash now retain a guaranteed top-wall launch arc, including when a composed Gravity ability would otherwise shorten the arc. Long-form lower lanes continue to target the previous layer's virtual ceiling without reviving cleared walls.
- Draftmaster speed upgrades now shorten the upgrade, sword, and gun cooldowns by 10% per speed level, capped at a 50% cooldown reduction. Timed race events expose the actual cooldown used.
- Berserker now gains 20 rage per qualifying bounce once the opponent is at least 10% ahead on the active layer. Rage decays at 10 points per second when it is no longer behind; its existing two-point damage ramp remains separate from the faster rage counter.
- Added deterministic coverage for the Gravity-composed Speedster top-wall guarantee, the inclusive Berserker threshold and decay, and Draftmaster speed cooldown scaling.

## Orb Race Berserker Rage Lead Gate (2026-07-30)

- Berserker rage now remains intact while tied, trailing, or ahead by less than 10%. The existing accelerated decay begins only after the Berserker's team is at least 10% ahead on the active layer or has advanced beyond the opponent's layer.
- Added regression coverage for the no-decay sub-threshold lead and the exact 10% decay gate.

## Orb Race Persistent Berserker Axe (2026-07-30)

- Once Berserker completes its full-rage horn activation, the axe remains equipped even if rage later decays. It continues its existing two-second swing cadence instead of being hidden or re-triggering the horn when rage refills.
- Added deterministic coverage for the persistent axe and continued swing cadence after the 10% winning lead starts rage decay.

## Orb Race Draftmaster HUD Upgrade Meter (2026-07-30)

- Draftmaster's race stat text now includes current damage, movement speed, and the number of projectiles in its active gun volley alongside the selected powerup and next-upgrade timer.
- Added Draftmaster to the existing side ability-meter path used by Batman and Flash. The segmented bar fills from the same deterministic, speed-scaled upgrade schedule without adding simulation state or changing stable IDs/URLs.
- Added renderer coverage for the five Draftmaster stat lines and the half-filled upgrade meter.

## Orb Race Sniper, Snowball, And Ying Yang Mechanics (2026-07-31)

- Sniper now starts with a 1.5-second firing interval, shortens it by 0.05 seconds per orb bounce down to 0.25 seconds, scales the next shot's damage by 1.25× after every shot, ricochets projectiles from side walls, and lets each bullet pierce one additional number layer. Ricochets, hits, and pierces remain deterministic events and use the existing collision audio treatment.
- Snowball no longer deals body bounce damage. It rolls on the active number line, continuously drains health beginning at 2 damage per second with a deterministic 1.08× time ramp capped at 1,000 DPS, grows from the amount stolen, and falls through a cleared layer before rolling on the next one. Drain ticks use the existing race effect/audio pipeline.
- Ying Yang now retains both accumulated damage and speed ramps across its five-second phase switches. The active phase still determines which counter advances, while both counters remain active in physics, damage, and HUD stats.
- Added simulation, replay-state, HUD, and audio-route regression coverage; stable racer IDs, quantity expansion, URL settings, and fixed-step seeded behavior remain unchanged.

## Orb Race Tactical Orbs (2026-07-31)

- Added Commander, Shrapnel, Roulette, and Architect as stable Orb Race racers, and reworked the existing `ricochet` ID into Ricochet Cannon. Commander, Shrapnel, Architect, and Ricochet Cannon are grouped as Weapon Orbs; Roulette is grouped as a Growth Orb because it accumulates a seeded ability kit after every cleared layer.
- Commander now carries two independently orbiting drones: the red drone fires ramping bomb volleys and the blue drone fires slower massive missiles. Drone contact, bombs, and missiles each own their damage and deterministic audio events.
- Shrapnel now sheds falling fragments on side/top-wall hits and releases a much larger debris burst when it breaks a number layer. Fragments use seeded spread and damage the next active layer after the break.
- Ricochet Cannon keeps one live projectile at a time. Its shot doubles damage on every side/top-wall touch, disappears on the number-line impact, and preserves the stable `ricochet` URL/settings identity.
- Roulette absorbs its first seeded ability at five seconds and then one every ten seconds from Bombs, Speed, Sticky, Orbiters, Meteor, Slammy, Reactor, Black Hole, Math Orbs, and Weapon Orbs. Absorptions add the existing ability ID to its composed kit and initialize the matching deterministic state.
- Architect performs a 1.5-second hammer animation and completes one structure every two seconds. Ramps, bumpers, and angled platforms are simulation objects with deterministic positions and real collision responses.
- Generated and chroma-keyed original pixel sprite sheets for Commander, Shrapnel, Roulette, and Architect under `assets/generated/orb-race-tactical-20260731/`, with source preservation and a generation manifest.
- Added HUD, long-form descriptions, social-canvas sprites/effects, event audio routes, replay/text state, team DPS accounting, group naming, URL round-trip coverage, and deterministic mechanic tests. Browser cache keys now use `20260731-tactical-orbs1`.
- Kept tactical racers visually at their full configured orb radius and moved Commander's two deterministic support drones into a hovering formation above the main orb; added a formation regression and advanced browser cache lineage to `20260731-commander-formation1`.

## Architect Bouncer-Only Build (2026-07-31)

- Architect now builds only the existing bouncing `bumper` structure (the requested bouncer), removing ramp and platform variants without changing the stable Architect ID, build cadence, seeded placement, structure IDs, or collision contract.
- Updated the tactical description and added regression coverage proving every Architect structure and build event is a bouncer/bumper.

## Orb Race Roulette Timed Absorption (2026-07-31)

- Roulette no longer waits for layer clears. Its first seeded absorption occurs at 5 seconds, then repeats every 10 seconds; the timer is deterministic, preserved in replay state, and keeps the existing composed-ability initialization and audio events.

## Orb Race Shrapnel Volley Scaling (2026-07-31)

- Shrapnel wall volleys now start at 3 fragments and layer-break bursts at 14, adding one fragment per qualifying bounce until each volley reaches the hard maximum of 75. Fragment IDs, seeded spread, damage, and existing events remain unchanged.
- Added regression coverage for the deterministic count ramp and the 75-fragment cap.

## Long-Race Layer-Break Rebound Coverage (2026-07-31)

- Confirmed and protected the existing long-form direct-impact path: the orb that breaks a layer rebounds from that impact, then can contact the previous layer's virtual ceiling as an additional top-wall bounce while the cleared layer remains gone.
- Ranged layer destruction continues to fall through without a rebound, preserving the existing damage-channel contract.

## Long-Race Infinity Breaker Rebound (2026-07-31)

- Fixed the long-form breaker transition so a direct layer-breaking orb, including Infinity, gets a real upward fixed-step arc before falling through the cleared boundary into the next active lane. The next lane's virtual ceiling no longer clamps the orb immediately after the break.
- Added Infinity coverage proving it progresses one layer at a time and cannot visually/physically pierce through successive layers. Ranged layer removal remains fall-through behavior.

## Orb Race 100X, Grappler, And Artists (2026-08-02)

- Added stable `100x`, `grappler`, and `artists` Orb Race IDs. 100X uses the powerful-math movement/audio treatment and its deterministic bounce damage is capped by the existing math limit; Grappler and Artists remain projectile-only weapon orbs with zero body bounce damage.
- Grappler fires a Sniper-angle hook with deterministic wall ricochets, massive line damage, a fixed-step pull toward the hook impact, renderer cable/hook visuals, and existing race-event audio routing.
- Artists selects one of five seeded painting recipes with damage tiers of 1, 2, 5, 100, and 1,000, then renders a deterministic brush/cloud painting animation and short-lived completed-paint effects on a 1.5-second cadence.
- Corrected the tilted Speedster/Flash layer-break path so it advances the logical layer without assigning a lower-layer Y position. The orb keeps its impact position and receives the normal direct-break rebound, allowing fixed-step physics to carry it through the cleared wall while the next layer remains independent.
- Added URL/registry, mechanic, replay, and no-teleport regression coverage. `npm test`: 19 passed, 0 failed.

## Orb Race Artist Ramp And Tilted Threshold (2026-08-02)

- Artist paintings now spend 0.5 seconds in a visible cloud-and-brush drawing phase before the completed painting appears, use a 2-second cooldown, and multiply five-point base-damage gains from both orb bounces and completed drawings through the selected 1×/2×/5×/100×/1,000× painting tier.
- Lowered the tilted Speedster/Flash easter-egg trigger and reset threshold from 20,000 to 1,500 while keeping its fixed-step no-teleport layer transition.

## Orb Race Artist Ramp Reverted (2026-08-02)

- Artist base damage now increases by only 1 per qualifying bounce. Completed drawings no longer add a separate damage increment; the 0.5-second reveal and 2-second cooldown remain unchanged.

## Orb Race Grappler, Artists, Pancake, And Tree Gameplay (2026-08-04)

- Grappler now fires a seeded anchor-targeted hook/rope projectile. A line attachment deals its current massive damage (5,000 initially, then 1.5× per attached hit up to the shared math ceiling), exposes anchor/rope/pull state, and releases a fixed-step launch with player-facing speed 1,200 and bounded physics momentum.
- Artists now replace Cosmos with Fairy while preserving the 1×/2×/5×/100×/1,000× painting tiers. Painting damage is `(1 + qualifying bounces) × tier`; completed drawings have explicit five-second lifetimes with a one-second fade. Bloom heals 10% of its attack damage after the hit, capped at original layer health; Storm schedules three deterministic lightning strikes; Fairy and Monster create deterministic walking summons that attack on a 0.75-second cadence and expire after five seconds.
- Added stable Pancake and Tree racers to the registry, growth category, settings URL normalization, team naming, quantity expansion, and replay state. Pancake uses independent fixed-step flip stacks: every completed flip counts once, line hold is exactly 1.5 seconds, patches last five seconds, stack damage is `1 × 2^(pancakes - 1)` through three pancakes, capped stacks spawn independent stacks at the next five-flip milestone, and every ten flips launches a giant no-burn butter meteor with the `pancake-butter-horn` event/sample slot.
- Tree enters ROOTS after five qualifying number-line bounces for five seconds. Root DPS per uncleared layer is `120 × current tree damage × 1.5^(roots activation - 1)`, ticked every 0.25 seconds; ROOTS ticks do not increment bounces, and the root render state fades for two seconds after release.
- Added deterministic simulation/replay coverage for Grappler anchors and launch, Artist healing/drawings/storm/summons, Pancake holds/stacks/patches/butter, Tree all-layer drain/fade, same-seed replay, and Pancake/Tree URL round trips. `npm test`: 23 passed, 0 failed.

## Orb Race Pancake Leech Damage And Syrup (2026-08-05)

- Pancake line holds now use the fast Leech-style damage model: a deterministic 0.05-second tick, level ramp, and explicit `racePancakeLineTickDamage`/`racePancakeLineDamagePerSecond` state. The fixed 1.5-second hold remains non-recursive.
- Syrup patches remain separate five-second poison-style damage-over-time surfaces, ticking at the poison cadence with `damageModel: "poison"`, `surface: "poisoned-layer"`, and poison-tagged tick events.
- Removed Pancake butter meteor traversal, damage, horn, and strike/pass event generation. Empty compatibility fields remain in replay state for the concurrent render seam but never contain projectiles or counts.
- Restored the missing Sunrise recipe so Artists retain the required five deterministic painting tiers `[1, 2, 5, 100, 1000]` with Fairy at the fourth entry.

## Orb Race Artist Cooldown (2026-08-05)

- Doubled the deterministic Artist painting cooldown from 2 seconds to 4 seconds; painting damage, drawing lifetime, and summon behavior are unchanged.

## Orb Race Bloom Damage Support (2026-08-05)

- Bloom no longer heals number layers. While a Bloom drawing is alive, `raceArtistBloomDamageMultiplier` is `1.5`, and subsequently created non-Bloom painting drawings, Storm strikes, and Fairy/Monster summons snapshot that 1.5× damage support; Bloom itself remains unboosted.
- Added replay state and deterministic coverage for Bloom expiry, no-heal behavior, and boosted Storm damage. The legacy healing field remains a zero-valued compatibility field.

## Orb Race Absorber Pool (2026-08-05)

- Removed Multiplier/Math Orbs from Absorber's timed pool. Absorber now cycles through Bombs (`mines`), Speed, Sticky, Orbiters (`orbital`), Meteor, Slammy, Reactor, Black Hole, and Weapon Orbs (`drill`).

## Orb Race Artist Lifecycle Tuning (2026-08-05)

- Artist painting starts now use a deterministic three-second cooldown.
- Fairy and Monster summons remain active for ten seconds, retaining their fixed-step walking, attack cadence, and expiry events.
- Storm now schedules deterministic lightning strikes across the full five-second cloud lifetime at its existing 0.18-second cadence instead of stopping after three strikes; strike IDs are unique per drawing.
- Bloom's yellow burst reaches the chamber edge at 0.72 seconds and completes its fade/despawn at 0.85 seconds, so its damage-support state ends with the visible Bloom drawing.

## Orb Race Storm Visual Strike Lanes (2026-08-05)

- Storm retains its continuous gameplay lightning schedule, but the renderer now shows only the latest three active bolts per cloud.
- Each visible bolt uses one of three deterministic lanes beneath its source Storm cloud, sharing the cloud's measured center and vertical geometry instead of starting from a generic chamber position.
- Restored a bright three-bolt visual fallback for every live Storm cloud, so the bolts remain visible between fixed-step strike records; moved the cloud slightly higher and extended each bolt visibly down to the number line.

## Classic Setup And Share Contract (2026-08-07)

- Rebuilt Classic setup from the live `CLASSIC_ORBS` registry, preserving a strict ordered 1v1 selection and exposing per-selected-orb Regular/Slow/Fast speed, fading trail, solid trail, and collision-damage controls without adding quantities.
- Added the presentation-only black arena toggle plus customizable Hydrogen Bomb health (1–1,000,000; default 100), including normalization, safe fallbacks, launch wiring, and compact share-URL round trips isolated from Orb Race keys.
- Simplified setup copy, added responsive multi-column roster cards, dynamic orb marks/colors, and focused config/UI coverage. Playwright verified all 48 cards, option selection, Hydrogen health 777, black-theme launch state, 1080×1920 canvas, and zero browser/page errors.
- Focused config checks and `tests/ui-setup.test.mjs` pass. The full suite still contains concurrent stale Classic-registry/simulation expectations and a cache-key assertion owned by the gameplay/media integration passes.

## Classic UI/Config Audit (2026-08-08)

- Rechecked the live registry and setup contract after concurrent gameplay/media work: exactly 48 Classic cards render, stable IDs are preserved, and selection remains fixed at 1v1 with no quantity control.
- Confirmed selected-orb speed, fading-trail, solid-trail, and collision-damage controls, plus black-theme and Hydrogen Bomb health normalization/share round trips. Orb Race keys remain on their existing schema and cache lineage.
- `node --test tests/ui-setup.test.mjs tests/features.test.mjs` and `npm test` pass (`24/24`). No UI/config application source changes were required; `UI_STATUS.md` records the audit and the root Chat owns the final Playwright launch/reload smoke test.

## Classic Picker Scroll + Size Contract (2026-08-08)

- Mirrored Orb Race's shared `.setup-panel` scroll restoration for Classic selection and option toggles, preserving the user's position while lower roster cards and expanded options are used.
- Added the Classic-only `classicOrbOptions[orbId].orbScale` selector with exactly MINI `0.55`, COMPACT `0.75`, REGULAR `1`, LARGE `1.25`, and EXTRA LARGE `1.5`; REGULAR is the default and the value round-trips through compact Classic URLs without adding Classic fields to Orb Race URLs.
- Advanced the owned UI/config cache lineage to `20260808-classic-picker-size1`, documented the Gameplay handoff in `UI_STATUS.md`, and added focused settings/source coverage. Browser validation confirmed all 48 cards, scroll preservation, option restoration, launch, and URL reload with no page or console errors.

## Classic Dedicated Weapon Pack Completion (2026-08-08)

- Completed the Classic weapon audit without changing simulation rules. Sawball uses its dedicated large circular-saw asset at the live `classicSawballDiscs` geometry, Trident uses its dedicated generated three-pronged asset with the handle tucked into the orb edge and the head clearly outside, and Grappler uses dedicated generated gun and fired-hook assets while Gameplay continues to own rope/anchor geometry.
- Added the Grappler hook to the versioned source/final manifest and exact prompt record, routed `grappler-ammo` through the generated hook crop, and suppressed the legacy generic weapon bar for dedicated Classic accessory fighters so it cannot double-render or cover centered HP.
- Documented all 48 Classic IDs as dedicated generated held/accessory weapon, explicitly authorized Draftmaster-family reuse, generated actor/projectile/effect, or plain orb/no-held-weapon. Browser cache lineage is `20260808-classic-weapons4`.
- Focused media tests cover manifest/source/final integrity, alpha-backed crop helpers, Grappler hook routing, Sawball 2.6r geometry, Trident attachment scale, and dedicated-weapon mappings. Fresh 1080×1920 Playwright captures were run for Sawball/Trident, Grappler/Turret, Rifle/Draftmaster, and Vampire/Lazer with zero page/console errors; final paths are recorded under `artifacts/design-qa/`.

## Classic Boxer Reference Gloves And Smoke Trail (2026-08-08)

- Generated and inspected a new original three-frame red glove sheet in `assets/generated/classic-media-20260808-boxer-v3/`, using the supplied screenshot only as a composition reference. Each frame preserves an empty center for the simple renderer-owned Boxer orb and centered HP, with gloves stacked above/below the orb and mirrored toward the opponent.
- Updated Classic Boxer rendering to use the v3 sheet, bright red orb color, radius-scaled stacked composition, and deterministic smoke puffs sampled from `classicPunchGloves`. World-space glove samples are converted back to the fighter-local canvas before drawing, and smoke trails fade to zero exactly two seconds after each sampled punch path; no simulation rules changed.
- Added manifest/prompt/alpha tests and the `classicBoxerSmokeAlpha` expiry helper. The later browser renderer lineage is `20260809-classic-webball1`; focused media/audio tests pass, and Playwright QA capture `artifacts/design-qa/boxer-reference-punch-v5.png` shows the visible trail while expiry timing is covered by helper assertions.

## Classic Dedicated Weapon Asset Pass (2026-08-08)

- Kept every Classic fighter body as a full solid-color orb and moved weapon identity into separate nearest-neighbor pixel assets.
- Added dedicated GPT Image assets for Sawball's large twin physical saws, Trident's held/thrown trident, Grappler's held gun and distinct fired hook, and Turret's cannon under `assets/generated/classic-weapons-20260808/`.
- Pistol, Shotgun, and Rifle remain the only authorized shared family, using distinct Draftmaster gun/ammo crops. Other non-weapon abilities remain procedural effects rather than reused weapon art.
- Updated the source/final manifest, exact prompts, renderer mappings, social asset assertions, and browser cache lineage to `20260808-classic-weapons4`; enlarged and offset Trident so only its handle base is occluded by the full orb.

## Classic Orb Identity Visuals (2026-08-09)

- Added a renderer-only Classic color bridge to the Orb Racer registry for shared identities, including Flash, Charger, Parasites, Artist, Turret, Absorber, and the other stable overlaps; Classic physics and IDs remain unchanged.
- Replaced the Necromancer soldier silhouette with a gray MINI-scale orb and oversized procedural bow-and-arrow art. Spawned Classic Turrets and the Turret fighter now render as plain orange balls with no cannon/symbol overlay.
- Integrated the visual pass into the shared newer browser lineage `20260809-classic-webball1`; focused social tests pass, and the in-app browser capture showed the Necromancer soldiers, large bows/arrows, and plain orange Turrets with no console errors.

## Classic Web-Ball Persistence, Shared Launch, and Arena Size (2026-08-09)

- Modern Classic fighters now launch from one seeded random heading, so both balls leave the opening in the same deterministic direction; Orb Race and legacy Classic spawn contracts remain unchanged.
- Lazer, Webball, Laser, and Tripwire keep one stable permanent entity per owner. A segment starts at the first wall hit, follows the orb until the next wall closes it, and the next segment starts only at the following wall. Completed diagonal segments remain visible. Cobweb remains a separate persistent orb-to-wall fan with visible border nodes.
- Boxer is a physical non-chasing orb. Its nearest hand is selected deterministically at punch start, and only that directional glove can hit during the active punch window. Sawball discs expose solid physical collision state and separate target on disc impact.
- Classic gun overlays are 2× larger, their projectiles are 3× larger, and gun/trident/sword aim follows the live opponent. The new deterministic `arenaSize` setting supports STANDARD SIZE and LARGE SQUARE, persists through `?cfg=az`, and is exposed in simulation/render text state.
- Added focused wall-ball, launch-heading, Boxer, Sawball, renderer-path, arena-bounds, and settings URL regressions. Full `npm test` passes all 37 tests.

## Classic Turret Splodey Bombs (2026-08-09)

- Classic Turret projectiles now use Orb Racer Splodey's exact black mine silhouette: the same normalized `0.012` size, dark outline, and orange highlight, while remaining owned by the existing Classic projectile physics.
- In Classic Black mode, only those Turret projectile bodies switch to white; their outline, highlight, motion, and collision behavior remain unchanged. Focused social tests and both normal/Black in-app browser captures pass with no console or page errors.
- Advanced the browser entry/import chain to `20260809-classic-turret-splodey1` so the updated renderer cannot be served from the prior `classic-webball1` cache.

## Classic Trident, Necromancer, Cobweb, Spikey, and Blue Sun Corrections (2026-08-09)

- Trident throws now use explicit `outbound → stuck-wall`/`stuck-orb` → `returning` state. A directional wall or orb contact deals once, exposes `stickUntil`/`stuckRemaining`, holds for exactly 3 seconds, then returns; the thrown sprite shares `classicTridentDimensions` with the held model.
- Necromancer now summons two visible 1 HP soldiers. Soldiers patrol on seeded non-homing vectors, fire fixed-aim `necromancer-arrow` entities with `tracking: false` and radius 4, and expose HP for renderer text.
- Cobweb now creates one permanent orb-to-wall connector per wall bounce at the exact contact point. Spikey now creates permanent wall-mounted physical triangle entities with deterministic tip/base geometry and 3 damage.
- Classic Blue Sun now creates eight seeded random wall-bounded laser entities instead of a target-following beam. Orb Race Blue Sun also keeps seeded random laser angles fixed during each activation and includes them in replay/text state.
- Added focused Classic and Orb Race regressions for trident stick phases, 1 HP/non-tracking minions and arrows, one-connector Cobwebs, wall Spikey geometry, random Blue Sun rays, same-seed outputs, and renderer contracts. Advanced browser cache lineage to `20260809-classic-hazards2`.

## Classic Cutter, Reactor, and Arena Size Correction (2026-08-10)

- Cutter now exposes an exact wall-to-wall horizontal connector with `lineStart`/`lineEnd`, `geometry: "wall-to-wall-half-plane"`, and a dark translucent crimson lower-zone fill (`#9f123944`) distinct from health-loss red (`lineColor: "#ff2738"`). The renderer fills only the active chamber below the line and draws the line between the actual simulation walls.
- Classic Reactor now creates an explicit `growing-blue-circle` entity with fixed-step `startedAt`/`duration`, `maxRadius`, and the Orb Race blue fill/stroke palette (`#168cff44` / `#9de9ff`). Its existing damage radius and damage timing are unchanged.
- LARGE arena size now uses the full 720×720 collision canvas (standard remains the 672×672 inset chamber), so the option changes physics space rather than only adding a yellow boundary outline. The social layout keeps title/arena spacing intact because the allocated export square is unchanged.
- Added deterministic Cutter/Reactor state assertions, exact large-arena bounds coverage, updated render-text fields, and advanced browser cache lineage to `20260810-classic-cutter-reactor-arena1`.

## Classic Boxer, Gun, Necromancer, Snake, and Absorber Refinement (2026-08-09)

- Matched Classic Pistol/Shotgun/Rifle gun attachments to Orb Racer's `1.75` weapon scale, doubled the Classic projectile render scale, and tightened the Sniper source crop so its generated matte/black box is not drawn.
- Extended Boxer and Monster gloves to the live radius-scaled `classicPunchReach`, making the same distance contract govern punch eligibility, hit geometry, and the remote glove's visual endpoint. Their smoke is now a cloud of deterministic radial particles with a 0.5-second fade.
- Enlarged and lifted the Necromancer skull through the existing `classicEntities` summon phases and added the purple charge/summon glow. Snake now grows its rear oval on each wall bounce, and Absorber is a plain pink Classic orb with its pink/white absorber animation.
- Suppressed Classic +health/-health markers for web-ball variants and Vampire leech ticks while retaining centered HP. Shared Orb Racer identity palettes remain the renderer-only source for overlapping Classic IDs.
- Advanced the browser cache chain to `20260810-classic-boxer-reach1`. Focused Classic/media tests and 1080×1920 Playwright canvas captures passed without page/console errors; artifacts are under `artifacts/design-qa/`. The latest full `npm test` passes 41/41; no Cutter code was changed in this media pass.

## Classic Cutter/Train Ricochet Paths and Reactor Expansion (2026-08-10)

- Extended the persistent single-path wall-ball contract to Cutter (`cutter-zone`) and Train (`train-track`). Both keep one stable entity per owner, start each segment at the exact wall contact, follow the owner orb diagonally, close at the next wall, and retain completed segments permanently. Train’s three-wall-bounce projectile launch and damage remain separate from its permanent rail path.
- Cutter now preserves its distinct crimson `#9f123944` below-line zone and `#ff2738` connector while using the active diagonal path for zone damage. Train rails render from the same exact segment endpoints instead of a synthesized horizontal/vertical track.
- Classic Reactor now separates its unchanged damage radius from a larger whole-arena-style `maxRadius` and uses the Orb Race-style 1.1-second growing blue circle fade (`#168cff44` / `#9de9ff`).
- Added parameterized Cutter/Train wall-contact regressions, permanent-rail coverage, render-text path fields, nullable entity-timer serialization guards, and advanced browser cache lineage to `20260810-classic-webball-cutter-reactor2`. Full `npm test` passes 41/41; Playwright state/console verification found live Cutter and Train paths, the expanded Reactor blast, and zero console/page/request errors.

## Classic Cutter Smallest Zone Correction (2026-08-10)

- Cutter keeps completed wall-contact segments in deterministic simulation/replay state, while only the newest active/latest segment owns the translucent area and visible thin red line. Starting a new segment therefore removes the previous area and previous red connector from the renderer.
- The active/latest Cutter line is extended through the arena rectangle and clipped into two half-planes; the smaller polygon is selected deterministically and exposed as `zoneSide`, `zoneArea`, `zoneAreaFraction`, `zoneSegmentId`, and `zonePolygon`. Damage uses the same selected side as the renderer.
- Removed Cutter's laser-style glow and endpoint clamps, reduced its configured line width to `2`, added focused state/renderer regressions, and advanced the browser cache lineage to `20260810-classic-cutter-smallest-zone1`.

## Classic Monster, Bullets, Spikey, Cutter, and Vampire Correction (2026-08-10)

- Monster now shares Boxer's physical non-chasing movement, solid body separation, nearest-hand punch selection, delayed punch phases, and directional glove hitbox contract. Added a direct regression proving pursuit leaves the opponent velocity unchanged before impact.
- Generic Classic `projectile` rounds and named gun/arrow/round entities now carry `bounces: false` and are removed on their first wall contact instead of reflecting. Added a wall-expiry regression; Hive bees and Parasite carriers retain their specialized traversal behavior.
- Spikey rendering consumes its exact gameplay `spikeTip`/`spikeBase` wall geometry, uses a white spike with dark outline in Classic black mode and a black spike with light outline in white mode, and no longer floats away from the contacted wall. Sawball's existing twin saw discs remain solid physical objects with separate disc collision state.
- Vampire latches now expose fixed-step wiggle state, keep bodies tangent during the hold, and launch the target away from Vampire on duration-complete release through `classic-vampire-release` (`launchAngle`, `launchSpeed`, `launched`). Cutter retains completed paths for replay but visually draws only the current `zoneSegmentId`, so its prior red line disappears when the next line is created.
- Added focused Monster, non-ricocheting bullet, Vampire wiggle/launch, and renderer-contract regressions; the next browser cache lineage is `20260810-classic-monster-latch1`.

## Classic Boxer/Gun/Health Visual Follow-up (2026-08-09)

- Boxer and Monster retain the generated stacked guard composition from `assets/generated/classic-media-20260808-boxer-v3/final/boxer-gloves-sheet.png`; only the active glove travels outward. Punch eligibility/reach is now close-range (`5.7r` distance cap, `5.2r` visual reach cap), the angle/reach are captured at swing start, and the glove does not home while flying. The existing smoke cloud remains radius-scaled and fades to zero after `0.5s`.
- Pistol, Shotgun, and Rifle keep the explicitly authorized Draftmaster equipment family, but their attached guns now use the compact `CLASSIC_GUN_ORB_RENDER_SCALE = 0.9` mount. Shotgun rounds are direct red rectangles with yellow square tops at the existing shell footprint; pistol/rifle rounds preserve the source aspect ratio and render at `0.75×` instead of being stretched.
- Parasites now match the Orb Racer brown carrier/olive-spot orb and parasite design. Snake tails are rendered as separate growth-scaled ovals, smallest at the far end and largest near the orb. Spikey and Virus spikes sit on the orb border, and the Classic LARGE portrait arena expands to `82%` of canvas width while standard remains `71%`.
- Web damage markers are no longer suppressed or accumulated. Events sourced by Laser/Lazer/Webball/Tripwire/Cobwebs/Cutter/Train normalize to individual readable `-1` hits without merging; Vampire latch/leech suppression remains unchanged, and centered HP is unaffected.
- Browser cache lineage is `20260810-classic-visual-proportions1` across the Classic entry/import chain. Focused Classic/social tests pass, full `npm test` passes `43/43`, and fresh 1080×1920 Playwright canvas captures with zero page/console errors are saved at `artifacts/design-qa/classic-boxer-visual-proportions.png`, `classic-pistol-visual-proportions.png`, `classic-shotgun-visual-proportions.png`, `classic-rifle-visual-proportions.png`, `classic-parasites-visual-proportions.png`, `classic-snake-visual-proportions.png`, `classic-spikey-visual-proportions.png`, and `classic-virus-visual-proportions.png`.

## Classic Weapon Recoil, Trident Recall, Summon Combat, and Blue Sun Orbit (2026-08-10)

- Shotgun and Draftmaster now launch themselves backwards from the shot aim with deterministic self-only recoil state/event data; the opposing orb is not pulled or moved.
- Trident starts at exactly 2× the owner's baseline speed, gains outbound momentum, remains a single active physical entity, and recalls by visibly moving back after its three-second wall/orb hold. Duplicate throws are blocked until the entity reaches the owner.
- Artist and Necromancer minions now carry team, health, physical, and target state and participate in nearest-opponent selection. Guns, Vampire, Boxer, and Monster can damage them; their fixed-aim attacks can damage those opposing fighters.
- Vampire remains fixed during its latch while the target wiggles on a tangent arc. Blue Sun now emits exactly eight equal-size rotating orbit lasers with deterministic seeded phase and local segment endpoints.
- Added same-seed recoil/recall/orbit tests and minion interaction coverage. Gameplay changes are in simulation/replay state only; the renderer/audio/UI chats must consume the documented fields/events. Browser cache bump remains an integration follow-up because this ownership slice did not edit the entry/UI files.

## Classic Visual Identity v2 (2026-08-09)

- Added the versioned GPT Image pack at `assets/generated/classic-visual-20260810-v2/`: dedicated distinct Shotgun and Rifle sheets, scaly Monster fists, oversized Necromancer arrows, and straight pistol/rifle ammunition. Chroma sources, transparent finals, alpha validation, rejected Sniper edit, and exact prompts are recorded in the pack manifest and `MEDIA.md`.
- Classic rendering now mounts the generated gun sheets at the compact Orb Racer relationship, keeps shell caps/noses pointed in travel direction, uses aspect-correct straight bullets, spins reloads around each gun's own mount, and gives Monster its own generated fists plus rim fins/scales.
- Boxer and Monster punch gloves track the live opponent for the short capped punch; their smoke remains a deterministic cloud that fades after 0.5 seconds. Necromancer's upper-right skull follows its owner through lift/charge/summon, and its arrow projectiles use the generated 2× arrow sheet.
- Set full-size default controls (`raceOrbScale = 1`), Classic black theme default, and large portrait arena width to `95%`. Cutter's red fill waits for line completion; web damage markers remain separate per-hit `±1` labels and fade over 0.5 seconds. Spikey/virus/parasite/snake identity refinements remain renderer-only.

## Classic Blue Sun Rays, Weapon Contact, and Announcement Freeze (2026-08-09)

- Blue Sun now emits eight seeded rotating cyan rays from the orb center. Each ray is geometrically unbounded until its first wall or opposing physical fighter/minion contact, with deterministic `stopsAt`, endpoint, direction, and contact state; it no longer follows one selected opponent.
- Cutter clears its active translucent damage polygon as soon as a wall closes the current segment. Completed line history remains deterministic, while only a newly dragging segment owns the current damage zone.
- Added deterministic physical rebound for attached swords/guns/tridents and their gun/trident entities, plus five extra trident contact damage. Modern Classic announcement-enabled battles hold positions/velocities for two seconds and expose upright sword/trident and opponent-facing gun/punch poses.
- Added focused Blue Sun, Cutter, weapon-contact, trident-contact, and announcement freeze tests. `tests/classic-rework.test.mjs` passes 35/35 and `npm test` passes 48/48; minimal Playwright Chromium verification reports zero console/page/request errors. Renderer/audio/UI integration remains a handoff: consume the documented simulation fields/events without changing Orb Race.

## Classic Boxer, Monster, Gun Reload, and Arrow Correction (2026-08-09)

- Cropped the approved Boxer sheet to its real alpha bounds so the two guarded gloves are oversized and readable beside the full orb. The guarded pair rotates around the orb toward the opponent; only Boxer’s live punch hand extends to the Gameplay punch endpoint, and the smoke cloud fades after `0.5s`.
- Monster now renders its dedicated generated scaly fist pair as a static guard accessory, with the same opponent-facing orbital rotation but no visual punch flight. Its renderer-owned fins/scales and centered HP remain visible on the plain orb.
- Pistol/Shotgun/Rifle reloads reuse the ready weapon cell and perform an eased rapid `7π` spin around the mounted gun center. Generated reload frames are not loaded at runtime.
- Shotgun shells are compact red rectangles with yellow square caps, rotated from live projectile velocity; Pistol/Rifle bullets preserve straight source aspect ratio at `0.75×`. Necromancer keeps its old bow but now fires the first normal cell of the generated arrow sheet.
- Advanced the browser chain to `20260810-classic-visual-identity4`. Playwright 1080×1920 captures are under `artifacts/design-qa/classic-visual-identity4-*`; all reported zero page/console/request errors. Full `npm test` is green at `48/48`.

## Classic Announcement Pause Removed (2026-08-09)

- Removed the modern Classic announcement simulation pause. Fighters now move, collide, and use abilities from the first fixed step; `classicAnnouncementFreezeUntil` is `0` and `classicAnnouncementFrozen` is always false.
- Preserved the deterministic two-second opening weapon pose through `classicAnnouncementPoseUntil`, then clear `classicAnnouncementActive` and emit `classic-announcement-finished` with `simulationPaused: false`. Replay state includes the pose deadline.
- `node --test tests/classic-rework.test.mjs` passes 35/35.

## Classic Opening Spacing and Moving Vampire Latch (2026-08-09)

- Widened modern Classic opening slots to 25% and 75% of the arena width at the existing 46% vertical slot. Both fighters still receive the same seeded launch direction, leaving ample deterministic visual separation without changing speed or Orb Race.
- Kept the announcement pose presentation-only: `classicAnnouncementFreezeUntil: 0` and `classicAnnouncementFrozen: false` let movement, abilities, collisions, and damage begin on the first fixed step while the two-second pose fields remain available to rendering/audio.
- Vampire now follows the leeched target’s fixed-step movement for the full latch, preserves exact body tangency with deterministic arena-edge pair clamping, and retains the target wiggle/release launch. Follow state is replayed through `classicLatchFollowTargetId`, `classicLatchFollowVx/Vy`, `classicLatchFollowDistance`, `classicLatchFollowAnchorX/Y`, and `classicLatchLastTargetBaseX/Y`.
- Fired gun rounds no longer physically clash with held gun segments, so attached guns cannot block bullet damage; sword/trident and other allowed weapon-object rebounds remain unchanged.
- Added focused follow/bullet regressions. `node --test tests/classic-rework.test.mjs` passes 36/36; `npm test` passes 49/49. Minimal Playwright Chromium verification reports one canvas, a working launch/render-text seam, and zero console/page/request errors.

## Classic Boxer/Monster Glove Scale Correction (2026-08-10)

- Reduced the shared Boxer/Monster glove render footprint to `0.75×` while retaining radius scaling, opponent-facing rotation, stacked guard placement, and Boxer’s live punch reach.
- The renderer contract test now asserts the `gloveScale` value, and the `identity5-gloves/boxer-monster.png` capture confirms both smaller glove pairs with no browser errors.

## Classic Gun Contact, Pistol Volley, and Punch Trigger Correction (2026-08-10)

- Pistol now fires one deterministic `pistol-ammo` round, enters its reload animation, and fires the second round exactly `0.25` seconds later. Both rounds share one volley sequence while `classicGunConsecutiveShot`, `classicGunConsecutiveCount`, `classicGunConsecutiveNextAt`, `classicGunTargetId`, and per-shot `classic-gun-fire` events expose the burst timing to Media/UI. Rifle rounds expose `maxWallBounces: 2`, reflect on the first two wall contacts, emit `classic-projectile-wall-bounce`, and expire on the next wall contact; the nullable max-bounce handling no longer accidentally expires Trident at its first wall stick.
- Replaced the old held-gun centerline approximation with an oriented-rectangle state matching the renderer’s compact Pistol/Shotgun/Rifle profiles and `0.9` scale. `classicWeaponObjects` still exposes visual offsets, rectangle dimensions, rotation, recoil/reload state, and collision radius, but guns no longer participate in physical rebound; sword/trident weapon contact remains enabled and fired rounds cannot be intercepted by a gun.
- Boxer and Monster now use a radius-scaled proximity trigger: being out of range does not consume the ability cooldown, and the first in-range fixed step starts the delayed punch aimed at the target with the closer glove. Added range/hand-selection and gun visual-contact regressions.
- Focused Classic tests pass 39/39; full `npm test` passes 52/52. Renderer/audio/UI files were not modified.

## Classic Trident Throw and Impact Explosion (2026-08-10)

- Hid the held Trident while its live projectile is outbound, stuck to a wall/orb, or returning, leaving one visible weapon that follows the deterministic throw state.
- Reworked the orb-stab feedback into a dense 44-particle red/gray explosion with expanding shock rings, central flash, and a slower 1.55-second fade.
- Advanced the browser cache lineage to `20260810-classic-trident-impact1`; the standard Playwright smoke loaded the cache-busted app without page, console, or request errors.
- Added renderer-contract assertions and verified `npm test` at 52/52. Targeted phase screenshot capture remains a browser-harness limitation, not a game/runtime error.

## Classic Cutter Fill and Gun Contact Correction (2026-08-10)

- Restored Cutter’s translucent red smallest-half-plane state after a wall closes the current line. The newest completed segment retains `zonePolygon`, `zoneArea`, `zoneAreaFraction`, `zoneSegmentId`, and `zoneSide` while waiting. During the next line, `previousZonePolygon` and `previousZoneSegmentId` keep that fill visible while the new thin connector follows the orb; the renderer replaces the fill only when the new line closes.
- Removed physical rebound from all gun objects and gun rounds. Oriented gun geometry remains available for visual alignment, while `classic-weapon-physical-bounce` continues only for sword/trident contacts.
- Added regressions for completed Cutter fill retention, no gun rebound even with overlapping visible rectangles, and the Pistol two-shot timing/replay contract. Focused Classic tests pass 39/39; full `npm test` passes 52/52; minimal Playwright Chromium smoke reports one canvas, a live render-text seam, and zero console/page/request errors.

## Classic Cutter Fill Hold During Next Line (2026-08-10)

- Added deterministic `previousZonePolygon`/`previousZoneSegmentId` state so Cutter’s completed translucent red area remains visible while the next red connector is being drawn, then swaps to the new smallest half-plane on the closing wall.
- Added replay coverage for the prior-fill lifecycle and a minimal renderer integration; Orb Race and unrelated UI/audio files were left untouched.
- Focused Classic tests pass 39/39; full `npm test` passes 52/52; minimal Playwright Chromium smoke reports one canvas, a live render-text seam, and zero console/page/request errors.

## Classic Trident Circular Impact Burst (2026-08-10)

- Replaced Trident’s square impact shards with a wide 64-particle circular red/gray explosion, using bright outlines/glow for clear dark-mode visibility.
- Enlarged the red shock ring and gray echo ring and kept the white/red center flash anchored to the exact orb hit location. The burst remains deterministic and fades over 1.55 seconds.
- Advanced the cache lineage to `20260810-classic-trident-explosion2`; full `npm test` passes 52/52. Fresh Playwright relaunch was blocked by the local server-port escalation environment.

## Classic Cutter Polygon Damage and Trident Throw Speed (2026-08-10)

- Cutter damage now uses strict center inclusion in the current clipped `zonePolygon`, so the thin red connector is only a boundary and cannot deal laser-style damage outside the selected smallest area. `classicCutterZoneContainsPoint` exposes the same deterministic contract for gameplay tests and replay consumers.
- While Cutter draws its next segment, the renderer keeps both the previous completed red boundary and its translucent fill visible alongside the new connector. The prior line/fill is replaced only when the new segment closes.
- Trident outbound launch speed is now `3×` baseline (1.5× the previous `2×` launch), with `2.1×` baseline outbound acceleration and a `6×` cap; three-second stick and visual recall behavior are unchanged.

## Classic Gun Round Deflection Restore (2026-08-10)

- Restored physical deflection for fired gun rounds: bullets now rebound from one another and from active sword/trident segments or thrown tridents with deterministic `classic-weapon-physical-bounce` events. Held gun silhouettes remain visual-only, so they never block or deflect incoming bullets.
- Added same-seed regressions for bullet–bullet, bullet–sword, and bullet–trident deflection, plus the held-gun non-interception contract. The resolver runs before projectile damage when a round enters a weapon hitbox, preventing a weapon deflection from becoming an orb hit in the same fixed step.

## Classic Circular Projectile Impacts and Complete Announcer Roster (2026-08-10)

- Replaced Trident's orb-hit rings and square shards with a deterministic `64`-circle burst that expands and fades over `0.82s`; orb and bullet impacts are fully red, while Trident wall sticks use dark/light brown circles. No impact variant draws rings, gray pixels, or shard rectangles.
- Routed the same red burst from recent `classic-projectile-hit` events for bullet-like Classic rounds, and routed the brown variant from the exact `wallContact` carried by `classic-trident-stick`. The renderer-only effect does not alter damage or physics.
- Regenerated the 23 newer Classic-only Alex announcers with the existing macOS Alex/FFmpeg pipeline and wired every current Classic ID through the live intro manifest. Active files are under `assets/audio/announcer/generated-classic-overhaul/`, with preserved source copies and manifest under `assets/audio/source/classic-announcer-20260807/`.
- Advanced the cache lineage to `20260810-classic-impact-audio3`; focused audio/social tests and full `npm test` pass `53/53`. A fresh browser smoke was attempted but the local environment refused HTTP server port binding, so no new screenshot is claimed for this revision.

## Classic Vampire Latch and Physical Blade/Trident Collision (2026-08-10)

- Fixed modern Classic Vampire follow drift by removing the latch wiggle offset exactly once before rebuilding the tangent pair. The leeched orb now wiggles in place relative to Vampire while both bodies continue translating with the target's fixed-step velocity; repeated target evaluation stops after the first successful latch.
- Set the Classic Sword's normal swing damage to `5`. Added physical body blocking for sword segments and held tridents, plus harmless rebound from wall-stuck `trident-ammo`; the existing weapon physical-bounce event carries the contact geometry and damage-free wall-trident contract.
- Added focused regressions for Vampire lane stability, five-damage sword swings, sword/trident body blocking, and harmless wall-stuck trident rebounds. Renderer/audio/UI files were not modified.

## Classic Blue Sun, Boxer, Health Markers, and Aimed Swords (2026-08-10)

- Blue Sun's eight simulation-owned `blue-sun-laser` entities are now the sole Classic ray renderer. The duplicate local fan was removed; each ray remains evenly distributed, rotates from its seeded base angle, follows its physical contact endpoint, and uses the Orb Racer cyan palette.
- Classic generic ability/heal/snake routes no longer fall back to `forge-item-pickup`. Fighter-specific routes remain available, while gun and Trident ability starts are silent until a dedicated sample exists. Orb Race-only Forge routes are unchanged.
- Boxer punch state keeps the closest hand selected at punch start. The renderer leaves the other glove in guard position; only an explicitly active fist flies to the captured punch segment. Deliberately dual-active fists still resolve independently at five damage each.
- Classic HP feedback now creates one marker per explicit health event, including separate Pistol `-3` rounds, separate web `-1` ticks, and every simultaneous marker without a storage or draw cap. Markers remain centered above the owning orb and fade over 0.5 seconds.
- Sword and Draftmaster sword accessories use the dedicated `assets/generated/classic-weapon-rework/final/sword.png` asset, mounted over the orb like gun accessories, aimed from the live opponent direction, and animated with smooth idle/swing offsets. Browser cache lineage is `20260810-classic-blue-sun-sword-markers1`.
- Focused audio/Classic/social suites pass 46/46; full repository verification follows this entry.
- Verification: elevated Playwright Chromium smoke passed against `http://127.0.0.1:4173/index.html?mode=classic` with one canvas, `#socialCanvas`, and `render_game_to_text` present; zero console errors, page errors, or failed requests. The generated picker capture is `artifacts/design-qa/classic-blue-sun-sword-markers1-smoke.png`. Full `npm test` currently reports 54 passing and one unrelated existing Orb Race `top-wall hits should remain bounded at the higher movement speed` failure in `tests/simulation.test.mjs:1106`.

## Classic Multi-Team Picker and Empty-Team Editing (2026-08-10)

- Replaced Classic's fixed two-orb setup with an Orb Racer-style two-team picker. Each team exposes the full Classic roster, preserves selection order, and supports independent per-orb quantities and options through `classicTeamOptions[teamIndex][orbId]`.
- Classic team state serializes in compact URL keys `ct` and `ci`, while legacy `classes`/`classicOrbOptions` remain supported. Explicitly empty teams now survive normalization and URL reloads, so deselecting the last orb no longer forces it back on while configuring a matchup.
- Kept legacy direct `createSimulation({ classes, count })` behavior compatible while explicit team settings use deterministic team-column spawn slots and interleaved team assignments. The browser cache chain remains on `20260810-classic-blue-sun-sword-markers1`.
- Verification: focused setup/features tests pass; `npm test` passes all 55 tests. Browser smoke confirmed clearing Team 1, setting Team 1 Turret quantity to 3 and FAST speed, launching, and reloading the generated `ct`/`ci` URL restored the exact selections and options. Browser diagnostic logs were empty.

## Classic Vampire Latch Wiggle And Orb Race Turret Cadence (2026-08-10)

- Restored the Vampire's visible wiggle as a deterministic angular oscillation of the latched target around Vampire's moving anchor. `classicLatchBaseAngle` preserves the contact axis, `classicLatchAngle` exposes the current wiggled direction, body separation remains exact, both bodies still move and rebound from walls, and the embedded fang endpoints are recomputed from the live angle.
- Changed Orb Race Turret deployment to a flat four-second interval and updated the cadence regression; turret lifetime ramping and firing behavior are unchanged.
- Added a regression that checks relative target/Vampire motion during the latch, plus the replay field for the base angle. Focused Classic coverage remains deterministic.

## Classic Vampire Latch Contact and Counterattack Lock (2026-08-10)

- Rebuilt modern Vampire latch positioning around one fixed contact axis. The target's prior wiggle offset is restored once per fixed step, then the target rotates around Vampire's moving anchor by a small deterministic angle while the pair remains exactly separated and normal movement/square-wall rebound continue. Same-step duplicate pose application is deduplicated through `classicLatchWallSidesAt`; wall contacts emit `classic-vampire-latch-wall-bounce` and are replayed with the latch wall counters.
- Added embedded fang geometry for Media: `classicLatchFangs[].x1/y1` → `x2/y2` (also `visibleX1/Y1` → `visibleX2/Y2`) is the short exposed segment at the target circumference; `fullX1/Y1`, `fullX2/Y2`, `base`, and `tip` retain complete directional geometry. `contactPoint`, `targetId`, `embedded`, `hiddenLength`, and `visibleLength` make the visual attachment explicit.
- Locked the active latch target from swinging, firing, or damaging Vampire. Attack phases are cancelled, newly spawned target-side projectiles/minion attacks are suppressed, and the central damage path rejects late target-sourced damage while preserving target movement/wall physics and Vampire drain/heal.
- Updated focused Classic regressions for embedded fangs, wall-aware paired rebound, replay fields, and target-side shotgun/Boxer suppression. `node --test tests/classic-rework.test.mjs` passes 43/43; full `npm test` passes 56/56. Minimal Playwright Chromium smoke reports one canvas, a live `render_game_to_text` function, and zero console/page/request errors; no screenshot was needed.

## Classic Blue Sun Rays, Smooth Health Markers, and Held Swords (2026-08-10)

- Fixed the Classic Blue Sun renderer’s coordinate transform: each of the eight evenly spaced simulation-owned rays now follows its true outward angle, begins at the orb rim, rotates smoothly, and ends at the first wall/orb contact. The duplicate local fan remains removed; cyan rays use a dark outline, bright core, and small contact cap.
- Classic health markers now use a 0.9-second eased rise/fade. Each event remains an individual marker, follows the owning orb above its body, and uses deterministic vertical stacking plus soft upward easing so rapid `-#`/`+#` feedback stays readable instead of popping away.
- Sword and Draftmaster sword rendering now crops the transparent sprite padding, draws a visible edge-held handle and guard, mounts the hilt inside the orb rim, and preserves smooth target-facing swing offsets.
- Browser cache lineage is `20260810-classic-blue-sun-health-sword2`; no new image assets were needed. Focused Classic/audio/social coverage passes 47/47, full `npm test` passes 56/56.
- Required Playwright client and targeted live capture report no page/console/request errors. Visual evidence: `artifacts/design-qa/classic-blue-sun-health-sword2/blue-sun-ray-frame-fixed.png`; client evidence: `artifacts/design-qa/classic-blue-sun-health-sword2-client-final/`.

## Classic Team Naming, Announcer Splicing, and Identity Outlines (2026-08-10)

- Added Classic team display parts that mirror Orb Race: two-orb names join with `+`, larger selections use shared category labels, and four or more category/name parts use `EVERYONE`; copy counts remain visible in titles.
- Added `classicTeamAnnouncerIntroSequence()` and `CombatAudio.playClassicMatchup()`. Classic uses its dedicated orb-name clips, then the exact Orb Race `+`, category, `EVERYONE`, `VERSUS`, and `Pick Your Winner` clips through the existing intro-card timeline.
- Added top Classic team titles and persistent outer identity rings. Team 1 is electric royal blue `#0057ff`, deliberately separated from Orb Race cyan/speed blue; Team 2 is red `#e11d48`.
- Exposed Classic team names/display parts/outline colors through `render_game_to_text`, updated focused audio/features/UI coverage, and advanced the browser chain to `20260810-classic-team-announcer1-sword-poke1` (preserving the concurrent Sword/Poke suffix).
- Focused settings/audio/UI tests pass 13/13. Full repository and final Playwright verification remain for the handoff.

## Classic Sword Poke and Blue Sun Damage Markers (2026-08-10)

- Reworked regular Sword and Draftmaster sword presentation to use the dedicated sword sprite as a Trident-style, edge-held accessory. The handle starts outside the orb rim, remains opponent-facing, and the hilt/HP are not covered by the orb body.
- Regular Sword alternates a deterministic `5`-damage swing and a `3`-damage extended poke. Windup, active, and follow-through phases update `classicSwordSegment` and only the active segment resolves hits. Draftmaster alternates its existing swing with the same `3`-damage poke mode.
- Added Blue Sun to the discrete Classic damage-marker source set, so every `classic-blue-sun-hit` is displayed as its own `-1` marker with the existing smooth rise/fade treatment.
- Advanced the browser cache lineage to `20260810-classic-team-announcer1-sword-poke1` while preserving the concurrent team-announcer lineage.
- Verification: focused Classic/social suites pass `45/45`; full `npm test` passes `59/59`. Playwright live captures report zero page/console/request errors. Evidence is in `artifacts/design-qa/classic-sword-poke1-live-start.png`, `artifacts/design-qa/classic-blue-sun-sword-poke1-live.png`, and `artifacts/design-qa/classic-blue-sun-sword-poke1-marker-frame.png`.

## Classic Sword Hilt Crop and Top-Layer Fix (2026-08-10)

- Expanded the sword source crop so the complete diagonal blade and lower-right hilt/handle are rendered; the previous shallow crop discarded the hilt.
- Moved Sword and Draftmaster sword rendering to a post-fighter top layer and anchored each sprite by its hilt just outside the orb rim. The weapon now overlays the orb rather than being covered by it while keeping the centered HP readable.
- Advanced the cache lineage to `20260810-classic-team-announcer1-sword-poke2`.
- Verification: focused Classic/social suites pass `45/45`; full `npm test` passes `59/59`; required Playwright smoke and live Sword captures report zero page/console/request errors. Evidence: `artifacts/design-qa/classic-sword-poke2-live.png` and `artifacts/design-qa/classic-sword-poke2-live-1s.png`.

## Classic Team Identity Toggle (2026-08-10)

- Added the Classic-only `classicTeamColors` option, enabled by default in setup. Unchecking `TEAM 1 / TEAM 2 COLORS + OUTLINES` removes both the electric-blue/red team title colors and the persistent team outline rings; each orb keeps its own theme color.
- The disabled state round-trips through compact Classic URL key `tc: 0`; legacy links without `tc` retain the enabled default. `render_game_to_text` exposes `classicTeamColorsEnabled` and reports `outlineColor: null` when disabled.
- Updated the shared social renderer and ArenaRenderer option path without changing Orb Race identity styling. Advanced the affected browser chain from the concurrent `20260810-classic-team-announcer1-sword-poke2` lineage to `20260810-classic-team-announcer1-sword-poke2-team-colors1`; the stylesheet uses `20260810-classic-team-colors1`.
- Focused features/UI setup and renderer-contract tests pass. Full `npm test` passes all 59 tests. Browser smoke confirmed disabled `tc: 0` URL persistence/reload, no-color and enabled-color renders, and zero browser diagnostic logs.

## Classic and Orb Race Turret Single-Instance Fix (2026-08-10)

- Changed modern Classic Turret from wall-bounce spawning to one timer-driven physical deployment every four seconds. `classicTurretNextSpawnAt` and `classicTurretSpawnCount` are initialized and replayed; active Turret entities expose `physical`, `solid`, `collisionMode: "physical-turret"`, `spawnMode`, `spawnInterval`, and expiry state. Turrets now block opposing orb bodies without dealing contact damage, and wall bounces cannot create duplicates.
- Hardened Orb Race Turret scheduling so expired/legacy duplicate entries are coalesced and a new deployment waits for the active instance to expire. `raceTurrets` never exposes more than one active object; `startedAt` is included for deterministic cadence inspection while the existing lifetime ramp and projectile behavior remain intact.
- Necromancer/Artist minion deaths now emit `classic-minion-defeated` without generic `knockout` events or knockout effects, so minion deaths do not trigger KO audio or slowdown presentation. Fighter KO behavior is unchanged.
- Added focused regressions for timer-vs-bounce spawning, solid Turret body rebound, single-instance lifetime/coalescing, replay fields, and minion KO-effect isolation. `tests/classic-rework.test.mjs` passes 45/45 and `tests/simulation.test.mjs` passes. `npm test` currently reports 59 passing suites/tests and one unrelated concurrent `tests/social.test.mjs` renderer-source assertion (`arrowTip` regex) failure; no renderer or social files were changed here.

## Classic Sniper, Hydrogen, Virus, Parasite And Damage Audio Fix (2026-08-10)

- Removed the generated arrow from the Necromancer minion's held silhouette. It now draws only its bow; `necromancer-arrows-sheet.png` is used only by fired projectile entities.
- Reworked Sniper to the full-cell Orb Racer-style held pose using the dedicated same-fighter sheet `assets/generated/orb-race-simple-20260731/final/sniper-weapons.png`; its keyed alpha keeps the rifle visible on the black theme. `sniper-ammo` maps to the straight bullet asset/cell at the rifle-sized projectile scale. Hydrogen Bomb now owns the full clipped `hydrogen-bomb-symbol.png` body, with centered HP drawn above it.
- Replaced the old Virus buds with the supplied bright lime body and dark outlined membrane/funnel rim design. Parasite specs are spread across the full body and persistent parasite DOT carriers are rendered at `1.25×` on the target rim while following the target, keeping the latch visible.
- Added Virus and Parasite to discrete Classic health-marker classification so each DOT appears as a coherent individual `-1` above the damaged orb with eased rise/fade. All Classic damage routes now use the existing `orb-collision` bounce sample; gun-fire routes remain gun-specific.
- Advanced the cache chain to `20260810-classic-sniper-hydrogen-virus-audio2` / `...-team-colors1` after switching Sniper to the keyed Orb Racer same-fighter sheet. Verification: `node --check` passed for changed renderer/social/audio modules and `npm test` passes all 60 tests. Fresh elevated Playwright Chromium captures reported zero console, page, or failed-request errors: `artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-sniper-vs-unarmed.png`, `artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-hydrogen-vs-virus.png`, `artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-virus-vs-unarmed.png`, `artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-parasites-vs-unarmed.png`, `artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-parasites-latch-marker.png`, and `artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-necromancer-vs-unarmed.png`.

## Classic Trident Throw Audio, Hydrogen Sequence, and Lazer Marker Quantization (2026-08-10)

- Copied the supplied `floraphonic-swing-whoosh-5-198498.mp3` into the preserved source archive at `assets/audio/source/classic-effects-20260810/floraphonic-swing-whoosh-5-198498.mp3` and the active runtime file `assets/audio/effects/classic-trident-throw.mp3`. Classic Trident projectile launches now use this cue without changing gun or Forge routes.
- Classic Hydrogen Bomb now emits one deterministic `classic-hydrogen-bomb-countdown-start` event, loops the existing Hydrogen siren for the 60-second countdown, then emits `classic-hydrogen-detonate` for the explosion and `classic-hydrogen-bomb-flash-start` for the existing four-second ear-ringing aftershock. Orb Race Hydrogen routing remains unchanged.
- Continuous Classic wall-beam damage (`laser`, `lazer`, `webball`, and `tripwire`) now accumulates fractional fixed-step damage and displays one `-1` only per full health point, preventing rapid phantom stacks while preserving every discrete Spikey/Parasite/Vampire transaction.
- Added audio, simulation, and social regressions for the Trident sample, Hydrogen event sequence, and Lazer marker remainder behavior. Browser cache lineage is `20260810-classic-trident-hydrogen-lazer-audio3` / `...-team-colors3`.

## Classic Lazer Duplicate Marker Fix (2026-08-10)

- Fixed the paired-event seam in Classic health feedback: one Lazer line entry emits both `classic-laser-pass` and a matching `classic-dot-tick`, and the renderer now treats that pair as one damage transaction. A one-health pass therefore produces exactly one `-1`, with no phantom positive residual marker.
- Added a focused social regression for the paired events and verified the live Lazer-vs-Hydrogen trace with Playwright. Evidence: `artifacts/design-qa/classic-trident-hydrogen-lazer-audio1-lazer-hydrogen-marker-fixed.png`.

## Classic Laser Passes, Reactor Radius, Cumulative Turrets, and Solid Summons (2026-08-10)

- Changed Classic Lazer from continuous 0.1-second damage to one `-1` health transaction per line entry. `lineTouchingTargetIds` suppresses repeat damage while a target remains on a permanent line, then allows a new hit after the target leaves and re-enters. The existing `classic-dot-tick` audio/marker seam is emitted once per pass, alongside `classic-laser-pass` for explicit gameplay consumers.
- Matched Reactor's actual damage radius to the final visible growing blue circle through `reactor-blast.visualStartRadius`, `damageRadius`, and `maxRadius` (`damageRadius === maxRadius`).
- Reworked Classic and Orb Race Turrets to accumulate permanent deployments indefinitely while preserving one timer spawn every four seconds and zero wall-bounce spawns. No burst or active-instance coalescing remains.
- Added physical body descriptors for Necromancer soldiers and Artist summons. They repel opposing fighter bodies through `classic-minion-physical-bounce`, keep their HP and deterministic movement, and remain destroyable through the existing minion damage/death path without fighter KO effects.
- Focused verification: `node --test tests/classic-rework.test.mjs` passes 47/47; `node --test tests/simulation.test.mjs` passes. Full `npm test` and minimal Playwright verification remain for handoff.

## Classic Necromancer Arrows, Destruction Bursts, and Monster Punch Parity (2026-08-10)

- Loaded the generated normal Necromancer arrow cell into every minion bow, behind the minion orb so the arrow head stays visibly seated in the bow while the orb HP remains clear. Both nocked and fired arrows use the existing transparent `assets/generated/classic-visual-20260810-v2/final/necromancer-arrows-sheet.png` at the new 2× render scale.
- Added the `classic-destruction-burst` visual effect for main Classic fighters and disposable minion orbs. It is a deterministic, filled-circle particle explosion in the destroyed entity's color/accent, with no new gameplay damage, KO audio, or generic minion knockout event.
- Unified Monster's Classic ability metadata and renderer with Boxer: same `1.5s` cadence, phase timings, selected hand, target-facing reach, active glove endpoint, and smoke trail. Monster's generated scaly fists and green orb skin remain its distinct presentation.
- Advanced the browser cache chain to `20260810-classic-destruction-necromancer-monster1` / `...-team-colors1`. Focused Classic/social tests pass, and full `npm test` passes all 64 tests.

## Classic Punch, Bounce, Blue Sun Charge, Vampire, and Health Marker Timing (2026-08-10)

- Added the user-supplied `soraatwod-punch-416719.mp3` as `assets/audio/effects/classic-boxer-punch.mp3`; Classic Boxer ability starts now use the supplied punch instead of the old critical-hit cue.
- Added the supplied Vampire hiss as `assets/audio/effects/classic-vampire-hiss.mp3` for Classic Vampire latch starts. Source copies and byte-size mappings are preserved in `assets/audio/source/classic-effects-20260810/manifest.json`.
- Classic `impact` and `wall-hit` now route to the existing `orb-collision-pop.mp3` bounce sample for orb-to-orb and orb-to-wall rebounds. Classic Blue Sun ability starts reuse the established Orb Race `black-hole-impact` charge cue; Orb Race routes remain unchanged.
- Classic health markers remain per-event, stay fully visible for `0.5s`, and now fade smoothly to zero at `1.0s`.
- Advanced the browser/audio cache lineage to `20260810-classic-punch-bounce-sun-vampire1` with renderer/social variant `...-team-colors1`.
- Verification: focused audio/social tests pass 5/5, `tests/classic-rework.test.mjs` passes 53/53, and full `npm test` passes 68/68. Playwright smoke and targeted Boxer/Vampire/Blue Sun captures report zero console errors, page errors, or failed requests. Evidence: `artifacts/design-qa/classic-punch-bounce-sun-vampire1-client/` and `artifacts/design-qa/classic-punch-bounce-sun-vampire1-targeted/`.

## Classic Blue Sun Rate Cap and One-Second Leech Ticks (2026-08-10)

- Blue Sun's eight permanent rotating rays now share a deterministic per-target rolling one-second budget. A target standing in overlapping rays receives no more than `3` total damage per second, while ray geometry and separate `classic-blue-sun-hit` events remain unchanged; capped ray attempts advance their fixed-step cooldown without emitting zero-damage markers.
- Vampire teeth now select only the nearest living fighter or summon. Vampire latch damage and leech are `3`/second, with exactly one HP transaction and marker seam per second for the five-second hold. Vampire heals the actual damage dealt and can overheal; `classicOverheal` keeps `health`/`classicCoreHealth` and replay/UI state coherent.
- Parasites retain `0.5` damage/second but now tick once per second after attachment. DOT and health events expose interval, resulting health, damage/heal amounts, net delta, and marker data for deterministic rendering/audio consumption.
- Added focused regressions for Blue Sun's aggregate cap, Vampire's exact five `±3` ticks and overheal, nearest-target fang selection, and Parasite's one-second cadence. Renderer/audio/UI files were not changed.

## Classic Hazard Tick and Target Contact Corrections (2026-08-10)

- Applied one-second fixed-step damage ticks to active Classic Cobweb connectors, Cutter zones, Tripwire lines, and Blue Sun rays. Existing event seams remain stable: wall hazards emit `classic-dot-tick` with health/timing/marker state, while Blue Sun emits `classic-blue-sun-hit` with the same marker fields and preserves its aggregate `3` damage-per-second cap.
- Nerfed Trident's total orb/minion impact to `20` by keeping `5` contact damage and reducing the throw component to `15`; the projectile event still reports `contactDamage: 5`.
- Changed Classic Snake tail resolution to select only the nearest currently touching segment for each target and emit a single offensive-only `snake-tail` hit. Added `classicSnakeTailContact` replay state; contacting the tail does not create reciprocal body damage to Snake.
- Added deterministic tracker target state: Snake is exposed as `targetPart: "head"`; non-duplicate Duplicator/Necromancer fighters are prioritized, with physically touching summons/duplicates allowed to intercept. `targetPart` and `targetPriority` are retained on tracking entities and projectile snapshots.

## Classic Vampire Latch, Absorber Models, and Necromancer Bow Animation (2026-08-10)

- Vampire's Classic hiss now only resolves after the simulation has entered `latchPhase: "latched"`; the latched overlay hides the approach fangs while the drain and per-hit markers remain visible. Necromancer minion arrow releases no longer play the summon/magic shot sound.
- Absorber now stores its selected source orb, persistent absorption history, animation start/end, and sequence in the deterministic fighter snapshot. Its Classic renderer animates the actual selected orb model spiraling into the pink Absorber core, and the social dock lists the history below `LIKE & SUBSCRIBE`.
- Generated a four-frame GPT Image bow/arrow strip for Necromancer minions at `assets/generated/classic-necromancer-bow-20260810-v1/final/necromancer-bow-animation-sheet.png`; preserved chroma source, exact prompt, manifest, and alpha validation are in the same versioned folder. The four frames are ready, draw, release, and reload, rendered nearest-neighbor. Minion release/reload timing follows Gameplay's deterministic `lastShotAt` and `nextShotAt`; separate fired arrows render at `2.5×` scale.
- Advanced the browser cache lineage to `20260810-classic-vampire-absorber-necromancer2` / `...-team-colors1`. Focused audio, Classic simulation, and social tests pass; full `npm test` passes 73/73.
- Playwright evidence: `artifacts/design-qa/classic-vampire-absorber-necromancer2-targeted/vampire-latched-no-fangs.png`, `absorber-model-history.png`, and `necromancer-bow-release.png`, plus the required client smoke folder `artifacts/design-qa/classic-vampire-absorber-necromancer2-client/`. All reported zero page errors, console errors, and failed requests.
- Boxer/Monster impacts now expose `classicPunchActiveHands`; the impact window extends both glove hitboxes and assigns at most one distinct nearby enemy per hand. Added focused regressions for all four tick streams, Snake contact selection, tracking priority/head targeting, Trident total damage, and two-hand Boxer hits. `tests/classic-rework.test.mjs` passes 57/57.

## Classic Boxer Full-Reach Impact Correction (2026-08-10)

- Locked Boxer/Monster punch direction and the complete target-distance reach at launch, removing mid-swing retargeting that made the guard glove twitch or made the visual endpoint disagree with gameplay.
- Replaced the narrow shoulder-to-tip impact test with a deterministic capsule matching the generated fist footprint. Only `punchingHand: true` gloves resolve damage, so a guard glove cannot deal invisible hits; armed two-fist swings produce two configured damage events/markers on two visible contacts, including one living orb, while nearby Necromancer/Artist minions use the same geometry.
- Preserved the shared `classicPunchDouble`/`classicPunchLandedCount` two-fist critical state, anchored each hit marker to the closest point on the landed capsule, and added focused regression coverage for normal one-hand damage, armed two-hand damage, stable angle/reach, distinct fighter/minion contacts, and guard-glove stability. No renderer, audio, or UI files changed.

## Classic Vampire Tick Audio, Boxer Two-Hit Criticals, and Necromancer Scale (2026-08-10)

- Every Classic Vampire `classic-dot-tick` with `dotKind: "vampire-latch"` now routes the supplied `classic-vampire-hiss` sample without rate-limit suppression, preserving one cue for every one-second Gameplay damage tick. The initial latched ability cue remains gated to the latched state.
- Boxer and Monster now count successful single-fist punches in `classicPunchLandedCount`. After two landed punches, the next committed punch sets `classicPunchDouble`, keeps both opponent-facing gloves active through wind-up/extension/impact, deals `5 + 5 = 10` when both land, resets the cycle, and emits one `classic-critical` event that uses the existing `critical-hit` sample. Missed punches do not consume the armed critical.
- The existing generated Necromancer four-frame bow sheet remains the source; no new GPT asset was needed. `CLASSIC_NECROMANCER_BOW_RENDER_SCALE = 2` doubles the held bow sheet and `CLASSIC_NECROMANCER_ARROW_RENDER_SCALE = 5` doubles the prior `2.5×` fired/nocked arrow scale. Nearest-neighbor rendering and transparent source/final assets are unchanged at `assets/generated/classic-necromancer-bow-20260810-v1/`.
- Added render-text fields for `punchDouble` and `punchLandedCount`, plus focused audio and deterministic cycle regressions. Browser cache lineage is `20260810-classic-vampire-boxer-crit-necromancer3` with renderer/social variant `...-team-colors1`.
- Verification: `node --test tests/classic-audio.test.mjs tests/classic-rework.test.mjs tests/social.test.mjs` passes 64/64 and `npm test` passes 74/74. Required client smoke is under `artifacts/design-qa/classic-vampire-boxer-crit-necromancer3-client/`; targeted visual evidence is `artifacts/design-qa/classic-vampire-boxer-crit-necromancer3-targeted/vampire-latched-tick.png`, `boxer-double-critical.png`, and `necromancer-bow-arrow-2x.png`. Playwright reported zero console errors, page errors, or failed requests.

## Classic Vampire Opposite-Direction Release (2026-08-10)

- Restored the post-latch throw: release now uses the live Vampire-to-target center vector, launches the target away at its configured constant speed, and preserves Vampire's pre-release velocity instead of copying the target's new throw direction back onto Vampire.
- Added a deterministic regression proving the target separates along the away vector while Vampire keeps its own motion. Updated `GAMEPLAY_STATUS.md`; no renderer, audio, or UI files changed.

## Classic Cutter Retained Damage Zone and Gun Projectile Balance (2026-08-10)

- Fixed Cutter's damage transition: while a replacement line is being dragged, the prior completed polygon remains the authoritative damage area and keeps its existing one-second timer. The new polygon takes over only when its line closes; connector-only contact remains harmless.
- Added regression coverage for retained-area damage and the full HP/marker tick fields. Increased Pistol bullet radius from `4` to `5` (1.25×) for both shots and raised Shotgun shell damage from `3` to `5`. No renderer, audio, or UI files changed.

## Classic Double-Punch Marker Consolidation and Necromancer Bow Aspect (2026-08-10)

- Kept the two underlying five-damage `classic-punch-hit` events for a Boxer/Monster critical, but grouped same-target critical contacts into one Classic health marker with delta `-10`. The presentation-only `classic-critical` event no longer participates in marker accounting, eliminating duplicate `-5` labels and the false `+10` residual.
- Reduced the Necromancer minion arrow render scale from `5` to `3.75` (`0.75×`) for both nocked and fired arrows. Bow render scale remains `2`, while width now derives from the generated frame's native aspect ratio so the bow is not stretched.
- Advanced the browser cache lineage to `20260810-classic-vampire-boxer-marker-necromancer4` / `...-team-colors1`. Focused audio/Classic/social coverage passes `66` tests and full `npm test` passes `76/76`.
- Playwright client smoke is under `artifacts/design-qa/classic-vampire-boxer-marker-necromancer4-client/`; targeted Boxer double-critical and Necromancer bow/arrow captures are `artifacts/design-qa/classic-vampire-boxer-marker-necromancer4-targeted/boxer-double-critical.png` and `necromancer-bow-arrow-075x.png`. Both targeted and client runs reported zero console errors, page errors, and failed requests.

## Classic Health Marker Timing and Overlapping Cutter Areas (2026-08-10)

- Centralized Classic `+HP`/`-HP` presentation timing in `HEALTH_MARKER_TIMING`: markers stay fully visible for `0.5s`, rise smoothly, then ease-fade to zero at `1.0s`. The contract is shared by every Classic orb and both damage/heal directions; no marker storage cap was added.
- Added `classicCutterZoneGeometriesFor(...)`, which derives one smallest-half-plane geometry for every completed wall-to-wall Cutter segment. Gameplay damage now checks the union of all completed areas, so overlapping zones remain active without double-counting a target inside both. The renderer fills every retained area and draws every authoritative segment.
- Cutter line endpoints continue to come directly from Gameplay's exact `lineStartWallContact`/`lineEndWallContact` wall coordinates; focused tests assert every segment starts and closes on the arena border, matching Spikey's planted geometry.
- Cache lineage is `20260810-classic-cutter-overlap-health1` with renderer/social variant `...-team-colors1` across the live browser entry/import chain.
- Verification: focused Classic/social coverage passes `62` tests and full `npm test` passes `76/76`. Targeted Playwright evidence is `artifacts/design-qa/classic-cutter-overlap-health1-targeted/cutter-overlapping-areas.png` and `health-marker-mid-fade.png`; both captures reported zero console errors, page errors, or failed requests. The standard web-game client was also attempted against the alternate local QA port; its UI-only click path could not reach the hidden setup launch control, so the direct `__ORB_FOUNDRY__.launch` capture was used for the gameplay evidence.

## Classic Cutter Lifecycle and Summon Target Damage Correction (2026-08-10)

- Kept `classicCutterZoneGeometriesFor(...)` as a replay/overlap-analysis history helper, while the live renderer and damage path now use `classicCutterVisibleZoneGeometriesFor(...)`: the newest completed fill is shown while waiting, the prior fill is held only during the replacement drag, and older areas disappear when the replacement closes.
- Reworked Cutter's one-second hazard tick to scan every opposing combatant in the selected polygon instead of only the first tracked fighter. This includes Necromancer soldiers and Duplicator clones, emits one `classic-dot-tick` per target with the existing health/marker fields, and advances one shared tick clock per second.
- Advanced the live cache lineage to `20260810-classic-cutter-overlap-health2` with renderer/social variant `...-team-colors1` across `index.html` and the Classic import chain.
- Added lifecycle and summon-target regressions. Focused Classic/social coverage passes `63/63`; full `npm test` passes `77/77`.
- Browser smoke evidence: `artifacts/design-qa/classic-cutter-overlap-health2-targeted/cutter-health2-smoke.png`, `cutter-area-after-first-line.png`, `cutter-area-after-second-line.png`, `cutter-necromancer-soldier.png`, and `cutter-duplicator-clone.png`. The cache2 smoke reported zero console errors, page errors, or failed requests.

## Classic Cutter Boundary Lifecycle and Spikey Wall Planting (2026-08-10)

- Cutter's red boundary now follows the same visible lifecycle as its fill: only the current segment, or the one retained boundary during an active replacement drag, is drawn. Once an area is replaced, its red connector is removed with it instead of leaving historical red lines behind.
- Cutter preserves its configured `2` damage/second but resolves it as one `-1` transaction every `0.5s`. The per-target loop covers opposing fighters, Necromancer soldiers, and Duplicator clones without bundling the damage into a single `-2` marker.
- Spikey wall triangles now store their wide base exactly at `wallContact`/the arena border. The renderer uses the gameplay tip-to-base geometry, so top, bottom, left, and right spikes are visibly planted on the border instead of floating inward.
- Browser cache lineage is `20260810-classic-cutter-overlap-health4` with renderer/social variant `...-team-colors1` across the live entry/import chain.
- Verification: targeted Classic/social coverage passes `64/64`; full `npm test` passes `78/78`. Playwright captured `artifacts/design-qa/classic-cutter-overlap-health4-targeted/cutter-health4-smoke.png` and `spikey-wall-planted.png`; both reported zero console errors, page errors, and failed requests. The Spikey frame shows wall bases coincident with the inner arena border on all four sides.

## Classic Visible Wall Attachment Correction (2026-08-10)

- The default Classic collision arena retains its 24px physics safety padding, but the social canvas shows the full 720px square border. Added the render-only `classicVisibleArenaPointFor(...)` projection for wall-attached Spikey and Cutter geometry, mapping default collision edges to the actual visible frame without changing simulation coordinates or collision rules.
- Spikey triangles now render their wide base directly on the visible gray arena border. Cutter polygons and red boundary segments use the same projection, so both the red fill and its wall endpoints meet the border instead of stopping one padding-width inside.
- Custom inset arenas keep their own coordinates; only the default padded square is projected. Added deterministic renderer tests for the default corners/edges and the unchanged custom-arena behavior.
- Browser cache lineage is `20260810-classic-cutter-overlap-health5` with renderer/social variant `...-team-colors1` across the live entry/import chain.
- Verification: targeted Classic/social coverage passes `65/65`; full `npm test` passes `79/79`. Standard-arena Playwright captures `artifacts/design-qa/classic-cutter-overlap-health5-targeted/spikey-wall-planted.png` and `cutter-health5-smoke.png` show no wall gap; both reported zero console errors, page errors, and failed requests.

## Classic Cutter One-Second Damage and Shared Health Fade (2026-08-10)

- Cutter now applies exactly `-1 HP` every second while an opposing orb or summon is inside the active red area. Its Classic definition is `dps: 1` with `tickInterval: 1`, and the existing all-target scan remains in place for fighters, Necromancer soldiers, and Duplicator clones.
- The Cutter scheduler now sets `nextTickAt = sim.time + tickInterval` after a processed tick. Overdue timers no longer catch up through multiple fixed steps, eliminating rapid same-frame `-1` stacks.
- All Classic orb health feedback continues through the shared marker renderer: a `0.5s` hold, smooth upward movement, and fade to zero by `1.0s`, positioned above the owning orb for both damage and healing.
- Advanced the live browser cache chain to `20260810-classic-cutter-overlap-health6` / `...-team-colors1`. Focused Classic/social tests pass `65/65`, full `npm test` passes `79/79`, and Playwright saved `artifacts/design-qa/classic-cutter-overlap-health6-targeted/cutter-health6-smoke.png` with zero page, console, or failed-request errors.

## Orb Race Footer Copy (2026-08-10)

- Orb Race portrait finish bands now center `Like & Subscribe!` for both teams and add tiny `#OrbBattleGroundSimulator` text beneath it. Long-form tracks keep the `FINISH`/checker band clear and place the same centered CTA plus hashtag in their reserved bottom footer space.
- Preserved board and track geometry; only footer copy placement and legibility changed. Advanced the live entry/social-renderer cache lineage to `20260810-classic-cutter-overlap-health6-team-colors1-footer-copy3`; the setup CSS key remains `20260810-classic-team-colors1`.
- `npm test` passes all 79 tests. Browser smoke at `http://127.0.0.1:4173/index.html` verified Orb Race portrait and long-form canvases (`1080×1920` and `1920×1080`), with no browser diagnostic logs.

## Classic Trapper Lasso Cage, Virus Body, Cobweb Clock, and Shrapnel Pass (2026-08-10)

- Replaced the incomplete first Trapper lasso frame with a fully closed generated loop and preserved the three-cell sheet through the chroma-key cleanup pipeline. The runtime draws three overlapping loops as a rough circle, moves them toward a caught target, tightens them through the generated medium/small frames, and visibly wiggles the constrained target.
- Trapper Gameplay now owns one grouped `trap` entity (`lassoCount: 3`) with `3` damage per second and a strict one-second timer. Cobweb uses the same no-catch-up timer behavior as Cutter, so delayed fixed steps cannot replay a burst of damage ticks. `classic-dot-tick` events and shared health markers remain the presentation seam.
- Replaced the old procedural Virus detail with the generated complete lime Virus body; centered HP remains rendered above it. Shrapnel projectile rendering now uses the dedicated existing shard cell and a 2× visual scale.
- Asset sources/finals/prompts/manifest: `assets/generated/classic-visual-20260810-v4/`. Browser cache lineage: `20260810-classic-cobweb-trapper-virus-shrapnel2` / renderer `...-team-colors1` / entry `...-footer-copy5`.
- Verification: `node --test tests/classic-rework.test.mjs` passes 64/64; `node --test tests/social.test.mjs` passes; Playwright captures under `artifacts/design-qa/classic-trapper-virus-v4/` have no console/page/request errors.

## Classic Independent Trapper Ropes, Throw Animation, and Full Virus HP (2026-08-10)

- Added GPT-generated four-frame lasso accessory sheet at `assets/generated/classic-visual-20260810-v5/` (source/final/prompts/manifest preserved). Frames are wind-up, swing, throw, and deployed; transparent final uses nearest-neighbor rendering.
- Reworked Trapper from one grouped cage into three separate seeded lasso entities. Each has a separated anchor, staggered throw phase, thick rope from the live Trapper orb, and its own loop. Caught targets are held with only a slight side-to-side wiggle and receive one `3` damage transaction per second.
- Added a top-layer held-lasso pass so Trapper visibly holds the first lasso during wind-up like other weapon orbs. Added lasso phase/index/group/anchor fields to `render_game_to_text` for browser QA.
- Virus now uses the generated body as the full orb silhouette, with no orb underneath. Shared health markers use a Virus visual-radius clearance so Cutter/Cobweb DOT feedback remains above the generated rim and stays individually readable.
- Cache lineage: `20260810-classic-trapper-ropes-virus-full1-team-colors1-footer-copy6-race-hud1-virus-health1` (renderer `...-team-colors1`). Focused tests pass 65/65. Playwright evidence: `artifacts/design-qa/classic-trapper-ropes-virus-full1/`; zero console/page/request errors.

## Orb Race Lane HUD Metrics (2026-08-10)

- Long-form Orb Race lane headers now keep Slammy's damage visible and add Unarmed's speed plus Duplicator's duplicate count beside their existing damage line at the top of each lane. Portrait HUD behavior remains unchanged and already exposes the same metrics.
- The live social-renderer/entry cache lineage remains `20260810-classic-trapper-ropes-virus-full1-team-colors1-footer-copy6-race-hud1-virus-health1`; simulation, renderer, social, and Orb Race import keys remain on their current lineages.
- `node --check` and `node --test tests/social.test.mjs` pass. Full `npm test` currently has five unrelated concurrent Classic gameplay failures in `tests/classic-rework.test.mjs` (Cutter/Blue Sun assertions). The available in-app browser could not reach the local static server for the visual smoke check, and no Chrome connection was available.

## Classic Trapper Circular Lasso Scale and Independent Placement (2026-08-10)

- Replaced the stretched v5 lasso runtime with the GPT-generated v6 sheet at `assets/generated/classic-visual-20260810-v6/`. The final uses four transparent square cells padded at native pixel size; the renderer now preserves each cell's aspect ratio.
- Trapper anchors are independently seeded-random points across the usable arena instead of evenly fanned, with a placement margin and separation large enough to keep the enlarged circles fully inside the arena without intertwining. Lassos do not track an opponent while flying; each remains at its chosen anchor. A caught orb gets a dedicated circular rope wrap around its body, while the owner-to-lasso rope remains separate and visible.
- Deployed lasso loops are twice the previous diameter and held lassos are 3× larger with a 2.5-turn wind-up spin. Cache lineage advanced to `20260810-classic-trapper-lasso-v6-random1-team-colors1-footer-copy6-race-hud1-virus-health1`.
- Added asset metadata/source assertions and deterministic placement/renderer coverage. Cache-busted Playwright captures are in `artifacts/design-qa/classic-trapper-lasso-v6-random1/`; the Trapper/Virus run reported zero console errors, page errors, and failed requests. `npm test` passes 84/84.

## Classic Generated Lasso Wraps and Truthful Recurring Damage Markers (2026-08-10)

- Replaced the remaining procedural Trapper rings with the generated v6 lasso artwork. Deployed and caught loops use the square padded sheet's deployed frame, widen deliberately by `1.18×`, and stay level; the separate owner rope still connects every lasso back to Trapper.
- Health markers now use explicit event amounts instead of normalizing recurring sources to `-1`: Blue Sun `-5`, Vampire/Necromancer/Snake/Trapper configured tick values, and Cutter's configured whole tick are visible above the target. Fractional Lazer/Cobweb/Cutter events continue to accumulate to one whole-value marker, with the existing smooth upward motion and `0.5s` hold / `1.0s` fade.
- Advanced the cache chain to `20260810-classic-trapper-lasso-v6-random1-health-values1-team-colors2-footer-copy6-race-hud1-virus-health1` (renderer `...-team-colors2`) and added focused marker coverage for Blue Sun, Vampire, Cutter, Necromancer, Snake, and Trapper.
- Verification: `npm test` passes 84/84. Fresh cache-busted Playwright evidence is in `artifacts/design-qa/classic-trapper-lasso-v6-health-values1/`; Trapper/Virus lasso phases and Cobweb/Virus health loaded with zero console errors, page errors, or failed requests.

## Classic Orb Foundry Top Stat HUD (2026-08-10)

- Orb Foundry Classic's top matchup band now shows compact side-aligned metrics for the selected primary fighters: Slammy damage, Unarmed damage plus current speed, and Duplicator duplicate count. Orb Race headers are unchanged.
- Advanced the live entry/social-renderer cache lineage to `20260810-classic-trapper-lasso-v6-random1-health-values1-team-colors2-footer-copy6-race-hud1-virus-health1-classic-top-stats1`; other module keys remain on their current independent lineages.
- `node --check src/social-renderer.js`, `node --check src/main.js`, `node --test tests/social.test.mjs`, and `npm test` pass (`84/84`). The available in-app browser could not reach the local static server and Chrome was unavailable for visual smoke testing; a direct renderer check emitted `DAMAGE: 5`, `DAMAGE: 4 · SPEED: 445.5`, and `DUPLICATES: 3`.

## Classic Lasso, Necromancer, Sword, and Parasite Follow-up (2026-08-10)

- Reduced Trapper's held-lasso wind-up to `1.25` turns for a slower spin. Kept the three seeded, independent lasso anchors and native-aspect generated frames.
- Widened Classic destruction feedback into a quick `0.52s` burst with `72` circular particles and `1.5×` spread; no ring or shard geometry was added.
- Added the supplied `universfield-spell-casting-229208.mp3` as the Necromancer summon cue. Only the skull-lift `classic-ability-start` event routes it; minion bow releases remain silent. The active paths are `assets/audio/source/classic-effects-20260810/universfield-spell-casting-229208.mp3` and `assets/audio/effects/classic-necromancer-summon.mp3`, with the source/runtime relationship in the audio manifest.
- Necromancer soldiers now reveal from the ground in staged half, three-quarter, and full clips over one second. Sword/Draftmaster overlays are mounted at the orb edge, poke forward, and share a two-pass slash sweep with Gameplay collision segments.
- Parasite hits now remain independent and unlimited: every visible carrier has five hidden health, physical perimeter orbit/wall bounce behavior, and opposing projectiles/weapons can destroy it while removing its DOT immediately.
- Updated Classic cache lineage: `20260810-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2` / renderer-social `...-team-colors3`. Regression coverage now includes summon-only audio, emergence stages, quick/wide destruction, sword poses, and multiple parasite carrier cleanup.
- Playwright QA evidence is in `artifacts/design-qa/classic-followup-20260810-v4/` (Trapper at 5.15/5.80/6.40s, Necromancer at 6.25/7.80/8.35s, Sword attack frames, and a deterministic seed-4 Parasite carrier at 7.10/7.80s). The cache-busted browser loaded the complete new module chain with zero console errors, page errors, failed requests, or render-text failures. Focused Classic/audio/social tests pass; full `npm test` is blocked only by the unrelated existing `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion.

## Classic Trapper Throw, Catch, and Damage Audio (2026-08-11)

- Added the user-supplied Trapper throw clip (`assets/audio/source/classic-effects-20260810/u_bnbrkm8sva-yeehaw-1-203838.mp3` → `assets/audio/effects/classic-trapper-throw.mp3`) and catch clip (`assets/audio/source/classic-effects-20260810/freesound_community-mixed-whip-crack-1-102825.mp3` → `assets/audio/effects/classic-trapper-caught.mp3`). The source files are preserved byte-for-byte and listed in the v3 audio manifest.
- Gameplay now emits one `classic-trapper-throw` event per lasso when its wind-up ends and the throw begins, plus one `classic-trapper-caught` event when a lasso first tightens around a target. The existing one-second `classic-dot-tick`/`dotKind: "trap"` event routes to `orb-collision` with no audio rate suppression, so every trap damage transaction gets the shared damage cue.
- Live cache lineage advanced to `20260810-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio1` (renderer/social/entry suffixes preserved); `SAMPLE_ASSET_VERSION` includes `trapper-audio1`.
- Verification: focused Classic/audio/social tests pass `76/76`. Full `npm test` passes `85/86`; the only failure remains the unrelated pre-existing `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion. Standard web-game client evidence is `artifacts/design-qa/classic-trapper-audio-client/shot-0.png` and `state-0.json`; targeted Trapper gameplay/audio evidence is `artifacts/design-qa/classic-trapper-audio-targeted/trapper-audio-0580cs.png` and `result.json`, with zero console/page/request errors.

## Classic Trapper Yeehaw Offset (2026-08-11)

- Browser-decoded the preserved 6.29-second Yeehaw source and found the first strong vocal onset at about `1.5s`; the opening playback was only the pre-Yeehaw lead-in.
- Updated the `classic-trapper-throw` audio plan to start the unchanged runtime clip at `offset: 1.5` while retaining its `1.2s` playback cap. Catch and per-tick damage routing remain unchanged.
- Advanced the live cache lineage to `20260810-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio2` and `SAMPLE_ASSET_VERSION` to `trapper-audio2`. Added a regression for the offset. Focused coverage remains `76/76`; full `npm test` remains `85/86` due only to the unrelated existing `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion.

## Classic Trapper Whip-Crack Damage Audio (2026-08-11)

- Changed Trapper `dotKind: "trap"` damage ticks to play the second supplied whip-crack clip (`classic-trapper-caught`) instead of `orb-collision`. The route remains `rateLimit: 0`, so every one-second trap damage transaction plays it.
- Advanced the live cache lineage to `20260810-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio3` and `SAMPLE_ASSET_VERSION` to `trapper-audio3`; the Yeehaw throw still starts at `offset: 1.5`.
- Focused Classic/audio/social coverage remains `76/76`; targeted browser verification confirms catch and trap damage both resolve to `classic-trapper-caught` with no browser errors.

## Orb Race Long-Form Side Footer and Dense Finish Flag (2026-08-11)

- Moved `Like & Subscribe!` and `#OrbBattleGroundSimulator` out of the long-form finish band and into the outer side margins: Team 1 uses the left margin and Team 2 uses the right margin. Portrait Orb Race finish copy is unchanged.
- Increased the long-form finish flag from 32 to 48 checker columns while preserving the existing finish geometry and camera behavior.
- Advanced the live social-renderer/entry cache lineage to `20260810-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio3-team-colors3-footer-copy6-race-hud1-virus-health1-classic-top-stats1-side-footer-checkers1`.
- Focused social tests and syntax checks pass. Playwright evidence is in `artifacts/design-qa/longform-side-footer-checkers1-correct/shot-0.png` and `state-0.json`, with no browser error file. Full `npm test` is `85/86`; the only failure is the unrelated existing `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion.

## Orb Race Blue Sun Rotation Isolation (2026-08-11)

- Restored Orb Race Blue Sun to eight evenly spaced rotating cyan rays without changing the current Classic/Orb Foundry Blue Sun entity path. A seeded phase is shared across the eight base angles, then each ray rotates at `1.8 rad/s`; the endpoint and layer damage are recalculated from the same rotating direction.
- Added `raceBlueSunLaserStartedAt` replay state and regression assertions for equal angular gaps plus smooth rotation. Advanced the browser import lineage to `...-audio3-race-blue-sun1` across the simulation/import chain.
- Focused Classic/features/social coverage passes `73/73`. Standard client and targeted Orb Race captures are under `artifacts/design-qa/orb-race-blue-sun1-client/` and `artifacts/design-qa/orb-race-blue-sun1-targeted/`; the preserved Orb Foundry capture is under `artifacts/design-qa/orb-foundry-blue-sun-preserved1/`. All browser runs reported zero diagnostics. Full `npm test` remains `85/86` due only to the existing unrelated `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion.

## Orb Race Long-Form Blue Sun Boundary Overflow (2026-08-11)

- Fixed the long-form Blue Sun visual boundary: active rays now get a live radius-based overflow above the non-physical camera/header clip, so their cyan cores, glow, and top-wall end-caps remain whole instead of appearing cut off. Simulation endpoints and collision/damage rules are unchanged.
- Portrait keeps its original world-rectangle clip. Long-form uses the parent lane clip, adds wall end-caps for top/side contacts, and derives overflow from the active Blue Sun scale through `raceLongformBlueSunOverflowFor(...)`.
- Bumped the live social-renderer/entry cache lineage to `...-side-footer-checkers1-longform-blue-sun1` and added focused social regression coverage for the two clip modes and overflow contract.
- Verification: focused Classic/features/social coverage passes `73/73`; standard client and dedicated Playwright captures report zero console/page/request errors. Evidence: `artifacts/design-qa/blue-sun-longform-final/t3.png` (long-form), `artifacts/design-qa/blue-sun-portrait-final/blue-sun-portrait.png` (portrait), and `artifacts/design-qa/blue-sun-longform-final-client/shot-0.png` (standard client). Full `npm test` remains `85/86` due only to the unrelated `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion.

## Orb Race Long-Form Blue Sun Indefinite Rays (2026-08-11)

- Corrected the interpretation of the long-form request: Blue Sun rays no longer stop at the current simulation layer's virtual number line or top wall. Each visual ray continues along its live direction through the lane until it reaches the actual outer board frame.
- The simulation's physical wall-bounded segments and layer-damage accounting remain untouched; this is a long-form rendering-only extension. Portrait remains wall-bounded.
- Cache lineage advanced to `...-side-footer-checkers1-longform-blue-sun2`. Added deterministic renderer coverage for extending a ray through a virtual wall to the visible viewport edge.
- Playwright evidence: `artifacts/design-qa/blue-sun-longform-final/t3.png` and `artifacts/design-qa/blue-sun-portrait-final/blue-sun-portrait.png`, with empty browser error manifests. Focused coverage remains `73/73`; full `npm test` remains `85/86` because of the unrelated `tests/simulation.test.mjs:1111` threshold assertion.

## Orb Race Long-Form Blue Sun Physical Number-Line Contact (2026-08-11)

- Superseded the previous all-ray visual extension. Only the simulation's long-form `top-wall` hit is treated as the cleared/virtual barrier and extended to the visible lane; `number-line` hits still stop exactly on the active number layer and retain their contact cap, while side-wall hits retain their outer-frame endpoint.
- No simulation or damage changes. Added `raceBlueSunLongformShouldExtendThroughBarrier(...)` coverage for the three boundary types and advanced the browser chain to `...-side-footer-checkers1-longform-blue-sun3`.
- Fresh long-form, portrait, and standard-client captures are under `artifacts/design-qa/blue-sun-longform-final/`, `artifacts/design-qa/blue-sun-portrait-final/`, and `artifacts/design-qa/blue-sun-longform-final-client/`; all browser error manifests are empty. Focused coverage is green; full `npm test` remains `85/86` due only to the unrelated `tests/simulation.test.mjs:1111` threshold assertion.

## Classic Batman Orb, Necromancer Teleport, Trident Recall, and Weapon QA (2026-08-11)

- Added the GPT-generated complete Batman orb body at `assets/generated/classic-batman-orb-20260811-v1/final/batman-orb.png` with preserved chroma source, prompt, and manifest. It replaces the old Classic Batman symbol and is also used by Orb Race; HP remains a centered game-drawn overlay. Batman batarangs are doubled in both render paths.
- Replaced Necromancer minion ground clipping with the existing Black Hole teleport burst behind a smooth one-second full-minion reveal. The minion HP remains hidden until the reveal completes.
- Added the reversed `classic-trident-recall.mp3` from the supplied Trident throw clip, mapped to `classic-trident-recall`. Sawball blade contacts now use the existing sword-hit sample. Rifle's generated weapon flips on its local Y axis only, keeping its aim direction intact.
- Bumped browser cache keys through `...necro-teleport-batman-batarang1`, `...necro-teleport-batman-rifle1`, and `...trident-recall1`. Focused audio/social tests and Playwright QA are green; evidence is in `artifacts/design-qa/classic-batman-necro-rifle-20260811/` with zero browser diagnostics. `npm test` remains blocked by the unrelated pre-existing `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion; simulation rules were not edited.

## Orb Race Batman Defensive Grapple (2026-08-11)

- Batman now reacts to a fresh opposing Orb Race weapon-start event, including opening Boomerang/Batarang launches. The defensive grapple chooses a seeded endpoint once, fires/pulls Batman along that fixed rope with no tracking, then resumes normal movement; it has a strict `10s` cooldown and emits `race-batman-grapple-fire` / `race-batman-grapple-end` events.
- The renderer reuses the user-authorized Orb Race batarang model at `assets/race/batarang-transparent.png`, draws the grapple hook at twice the current batarang size, and composites a black interior with a white outline plus a visible black/white rope and launcher collar. Batman's game-owned body/HP remain unobscured.
- Advanced the cache lineage to `...-batman-batarang1-batman-grapple3` across the live entry, simulation, renderer, social-renderer, and social imports. Added deterministic simulation/source coverage for cooldown, fixed endpoint/no tracking, opening threats, render-text fields, and the accessory pass.
- Dynamic portrait and long-form Playwright evidence is in `artifacts/design-qa/batman-grapple-20260811/` (`portrait-firing.png`, `longform-firing.png`, matching JSON state, and `diagnostics.json`). The final run reported zero console errors, page errors, or failed requests. The standard web-game client remains blocked by macOS Chromium's `bootstrap_check_in` permission; the elevated custom Playwright capture was used instead.

## Orb Race Reactor Blue Theme (2026-08-11)

- Reactor's body and charge ring now start at its blue theme color instead of black and ramp toward the existing light-blue accent as charge increases. Reactor HUD/title text remains blue.
- Advanced the live social-renderer/entry cache lineage to `20260811-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio3-race-blue-sun1-team-colors3-footer-copy6-race-hud1-virus-health1-classic-top-stats1-side-footer-checkers1-longform-blue-sun3-necro-teleport-batman-batarang1-batman-grapple3-reactor-blue1`.
- Focused social tests and the Reactor Playwright capture pass; evidence is in `artifacts/design-qa/reactor-blue1/shot-0.png` and `state-0.json` with no browser error file. Full `npm test` passes 93/93.

## Classic Orb Foundry Reactor Blue Theme (2026-08-11)

- Changed Classic Reactor's registry color and accent to the same blue/light-blue pair used by Orb Race (`#168cff` / `#9de9ff`), so the Orb Foundry profile card, setup preview, and Classic identity styling no longer use green.
- Changed the Classic Reactor charge ramp to start at blue and brighten toward the light-blue accent instead of starting green.
- Advanced the affected browser module and entry cache lineage with `classic-reactor-blue2`.
- Added focused registry and runtime assertions. `node --check` and `node --test tests/features.test.mjs tests/classic-rework.test.mjs` pass; elevated Playwright setup verification reports blue computed title/orb colors and zero page or console errors. Evidence: `artifacts/design-qa/reactor-classic-blue2-setup-page.png`.

## Orb-Themed Arena Borders (2026-08-11)

- Orb Race portrait boards and long-form tracks now use each team’s primary orb theme for the outer frame, making the two halves of the arena visually distinct while leaving layer and finish-line outlines neutral.
- Classic’s shared arena perimeter is split into two equal color runs based on the two fighters’ orb themes; the existing Classic team-color toggle keeps the neutral border when disabled.
- Added focused helper assertions for race team border colors and Classic theme/fallback colors. Advanced the live entry/social-renderer cache lineage to `20260811-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio3-race-blue-sun1-team-colors3-footer-copy6-race-hud1-virus-health1-classic-top-stats1-side-footer-checkers1-longform-blue-sun3-necro-teleport-batman-batarang1-batman-grapple3-reactor-blue1-split-border1`.
- Verification: `node --check src/social-renderer.js`, `node --check src/main.js`, and `node --test tests/social.test.mjs` pass. Playwright captures are in `artifacts/design-qa/split-border1-race-distinct/` and `artifacts/design-qa/split-border1-classic/` with no reported browser errors. The current full suite is 91/93 because of unrelated shared-worktree failures in `tests/features.test.mjs` and `tests/ui-setup.test.mjs`.

## Classic Per-Orb Health + Hive/Apple Asset Split (2026-08-11)

- Historical note: the interim per-card `ORB HEALTH` controls were removed in the follow-up rollback below; the Classic setup now has no health input and starts fighters at `100` HP.

## Classic Health Controls Removed (2026-08-11)

- Removed all orb-health inputs from the Classic setup cards. New matches now use the fixed default of `100` HP; health normalization remains only for backwards-compatible direct/shared configuration data.
- Added per-orb Boss protocol. The card toggle appends `BOSS` to the orb's Classic announcement/title and schedules `race-boss` after the orb cue. `race-boss` aliases the verified `race-buffed` generated sample until a dedicated Boss recording exists.
- Generated and inspected the corrected Hive/Apple asset pack in `assets/generated/classic-hive-apple-20260811-v1/`. Hive's runtime generated asset is now the bee attack (`final/hive-bee-projectile.png`), not a honeycomb body; Apple’s generated art (`final/apple-orb-projectile.png`) is projectile-only. Both are transparent RGBA finals with alpha validation; the prior honeycomb final is preserved but unwired.
- Hive bees are now radius `10`, track their seeded target, and deal `3` damage. Apple throws now travel to a seeded random destination inside the arena every three seconds. Cache lineage: `classic-boss-health-apple-hive2`.

## Classic Cowboy and Generated Glass/Zeus/Frost/Fairy Media (2026-08-11)

- Renamed the visible Classic `TRAPPER` announcement to `COWBOY` while retaining stable ID `trapper`; generated Alex audio is wired at `classic-cowboy.mp3` and the intro cue remains replay-compatible.
- Added the GPT Image pack `assets/generated/classic-visual-20260811-v1/` with transparent, nearest-neighbor finals for Glass drops, Zeus Greek lightning circles, Frost trail frames, and Fairy accessories. Sources, prompts, manifest, and alpha validation are preserved beside the runtime finals.
- Renderer wiring: Glass shards use authored sheet frames; Zeus throws three animated Greek discs from the fighter to seeded nodes; Frost uses age/fade-selected snowflake and snow-patch frames; Fairy crops the generated wing pair into separate left/right sprites, flaps them while moving, and draws the tiara and target-facing wand independently.
- Simulation wiring: direct Fairy casts now create deterministic homing `fairy-ammo`; Hive bees are half speed and 3× scale; Apple's thrown projectile is 2× larger; Zeus stores throw origin/duration for the visual launch. Monster glove rendering uses the same authored-facing crop for both fists so both point at the opponent.
- Added manifest/asset/source assertions and renderer contract coverage for the new sheets, separate Fairy wing crops, Fairy casts, Zeus throw state, and Hive/Apple tuning. Cache lineage advanced to `...-classic-visual1`. Focused Classic audio/rework/social coverage passes `91/91`; full `npm test` passes `101/101`. Playwright evidence is in `artifacts/design-qa/classic-visual-20260811/` with zero console/page/request errors and all four new final sheets loaded by the live browser.

## Classic Health, Reactor, Batman, Fairy, Zeus, Glass, and Frost Media Pass (2026-08-11)

- Classic setup now exposes an individual HP field on every orb card, defaulting to `100` and clamped to the supported positive range. The configured value is carried into the match and rendered as centered fighter HP, including custom-health Hydrogen Bomb and special orbs.
- Reactor now uses its full verified 4.73-second impact sample and its body/charge ramp starts blue before brightening as the blast charges.
- Batman now uses the single connected GPT-authored orb body at `assets/generated/classic-visual-20260811-v4/final/batman-orb-with-ears.png`: the mask, tan face, utility belt, black lower half, smirk, and two pointy top triangles are one transparent runtime asset, so the ears are part of the orb silhouette rather than an overlay behind it. Source layers, prompt notes, manifest, and alpha validation remain in the versioned v2/v4 packs.
- Fairy uses separate generated wing sides, tiara, wand, and enlarged projectile frames; Zeus uses generated chain-lightning frames and smaller Greek discs; Glass drops are enlarged; Frost suppresses stale train-track visuals in favor of the generated fading snow trail.
- Advanced the browser cache lineage to `20260811-classic-health-reactor-batman-fairy-zeus-frost2`. Focused Classic/UI/social/audio coverage passes `101/101`; the complete suite passes `103/103`. Live Batman/Fairy browser evidence is in `artifacts/design-qa/classic-health-reactor-batman-fairy-zeus-frost2-client/batman-fairy-live-browser.png` with no page, console, or request errors.

## Classic Cowboy Trap Timeout and Virus Green Spread (2026-08-11)

- Cowboy lassos now begin a deterministic seven-second timeout when they reach their deployed anchors. Unsnared traps emit `classic-trapper-expired` and are removed; caught traps retain their existing catch/tick lifecycle.
- Virus contacts now expose cumulative green coverage, widening target-centered arcs, and retained contact zones in replay/event state so Media can render the green surface spreading across the touched orb. Expiry clears the overlay state.
- Focused Classic gameplay coverage passes 89/89. Renderer/audio/UI files were intentionally left untouched; the exact state contract is recorded in `GAMEPLAY_STATUS.md`.

## Classic Glass Shard Contact and Compact Dispersion (2026-08-11)

- Glass shards now deal exactly `-2` on first contact with an opposing orb/minion, emit the existing coherent `classic-projectile-hit` marker, and disappear immediately after that contact.
- Reduced seeded tangent offset, direction spread, flight speed, and flight duration so shards stay close to the wall-bounce origin while remaining visibly dispersed. Added focused contact/removal and compact-dispersion coverage; renderer/audio/UI files were not changed.

## 2026-08-11 — Orb Race tournament state layer

- Added the pure deterministic `src/orb-race-tournament.js` bracket module for optional 4/8/16/32/64 entrant Orb Race tournaments, including two-sided seed topology, deterministic random/custom ordering, match advancement, champion state, presentation timestamps, and individual-match/whole-round recording segments.
- Canonical tournament aliases are now preserved in state: `seedingMode`, `seedOrder`, `recordingScope: "each-match" | "whole-round" | "whole-tournament"`, and internal `recordingSegmentScope: "each-match" | "whole-round"`; the legacy `seeding` and `recordingScopeLegacy: "individual-match"` fields remain for migration.
- Added `tests/orb-race-tournament.test.mjs` covering all sizes, 64-seed connections, deterministic shuffle, duplicate validation, advancement/champion selection, recording boundaries, and presentation timing. Simulation state and replay snapshot wiring are complete; rendering remains owned by the UI/Media chats.

## 2026-08-11 — Orb Race tournament runtime, recording, and resume contract

- Integrated the active tournament matchup into `createSimulation` without changing ordinary Orb Race setup. `raceTournament` is a config object; `raceTournamentState` is the separate versioned live/save-state input for subsequent matches.
- Tournament matches now use shared deterministic layer values: three layers for individual short portrait recordings, and configurable three or five layers for selected-round/whole-tournament long landscape recordings. The five-layer default reuses the existing Long Race autofill preset.
- Added recording format/dimensions, selected round IDs/indices, queue entries, and segment boundaries to tournament state. Added versioned JSON save/resume, validation, cloning, and read-only matchup view APIs.
- `stepSimulation` advances tournament presentation time, waits for the bracket intro/zoom before race physics, finalizes a match once, and continues result/advancement/next-match presentation phases after the simulation finishes. Added focused tests for layer plans, serialization, match 1→2 hydration, gating, and deterministic replay.

## 2026-08-11 — Orb Race tournament format/setup UI

- Reworked Orb Race setup so Tournament is a third peer format beside Short Race and Long Race. Tournament hides the regular two-team builder and exposes a unique entrant roster, guided 4/8/16/32/64 single-elimination settings, custom/random seed order, title, selected rounds, and local bracket controls.
- Added normalized `raceTournament` recording presets: each-match forces portrait/3 layers; selected-round and whole-tournament force Long Race landscape while allowing an explicit 3- or 5-layer shared autofill. Added compact `rt` URL fields for title, scope/selection, rounds, layer count, values, and final health.
- Main UI now retains the live tournament state between match launches, respects recording segment boundaries, exposes bracket/request state through `__ORB_FOUNDRY__` and `render_game_to_text`, and stores full versioned serialized bracket state under `orb-foundry.race-tournament.v1`.
- Updated `src/config.js`, `src/main.js`, `index.html`, `styles.css`, `tests/features.test.mjs`, `tests/ui-setup.test.mjs`, `tests/social.test.mjs`, and `UI_STATUS.md`. The active cache suffix is `format-save1`.
- Verification: current `npm test` passes 133/133; elevated Playwright setup, launch, 3/5-layer, full save/resume, and bracket-preview smoke passes with zero console/page errors. The bundled web-game client is blocked by macOS Chromium bootstrap permission.

## 2026-08-11 — Orb Race saved bracket entrant display

- Updated the setup `OPEN BRACKET` preview to consume the full saved/live tournament state when available, so pending and completed matchups show their known entrant names rather than generic match IDs.
- Unresolved matchup slots render exactly `???`; completed winners and advancing output nodes receive a border from the corresponding Orb Race theme color. The setup preview remains separate from Media's canvas bracket topology.
- Added source-level UI coverage for full-state bracket consumption, unknown-slot text, winner styling, and the saved-state fallback path.
- Bumped only the browser entry key from `...bracket3` to `...bracket4` after preserving the concurrent renderer/audio/module cache lineage.
## 2026-08-11 — Tournament adjacent-match zoom polish

- Tournament bracket zoom now keeps the active matchup centered while retaining the nearest matchup above and below in the same bracket column; edge matchups keep the single available neighbor without moving the active camera anchor or crossing to the opposite bracket side.
- Unresolved bracket destinations render exactly `???`, result highlights use the advancing orb's theme color, and each matchup plays one deterministic zoom-in cue on entering its bracket zoom.
- Added middle/edge/opposite-side crop assertions and renderer/audio coverage. `npm test` passes 133/133; Playwright tournament smoke verified the landscape three-layer launch with no console or page errors.

## 2026-08-11 — Classic Fairy, Frost, and Batman presentation cleanup

- Removed the generated white artboard guides at runtime by adding explicit nearest-neighbor sheet crops for the Fairy accessory cells and Frost trail frames. Fairy now uses separate aspect-stable left/right wing sprites, alternates upright flap poses while moving, keeps the newest tiara above the orb, and draws the wand at the orb edge over the wings. Fairy rings are true circles attached to the orb rim instead of stretched ellipses.
- Frost-owned legacy `train-track` replay entities now share the generated Frost trail renderer, so Frost cannot regress to train rails; frame selection still follows the deterministic age/fade state.
- Batman's connected v4 orb body remains the full generated orb, with a white perimeter outline drawn before the centered HP pass. Updated the live Classic module chain to `classic-health-reactor-batman-fairy-zeus-frost3` and left Tournament presentation/recording code untouched.
- Verification: `node --test tests/social.test.mjs` passes, including separator-safe crop bounds, independent Fairy poses, Frost fallback routing, and Batman outline contracts. Full `npm test` and browser smoke remain to be run for this pass.

## 2026-08-11 — Orb Race tournament card bracket reflow

- Replaced the tournament export's dot-and-floating-label presentation with rounded rectangular bracket cards. First-round entries and later-round match positions now share the same card geometry, with orb visual + name inside resolved cards and exact `???` inside unresolved cards.
- Added independent portrait and landscape reflow so long-form `1920 × 1080` brackets use their horizontal space instead of scaling/cropping the portrait composition. Orthogonal connectors retain gameplay-provided seed/match topology, including the right-side ordering.
- Kept the active matchup centered during eased `1.75s` zoom while showing same-column neighbors above/below. The camera now uses one cached layout, stable full/zoom rectangles, and an unrounded quintic smootherstep for continuous pan/scale; renderer fallback reads gameplay's authoritative intro/zoom/conclusion durations. Winner advancement uses deterministic destination-local dust before filling the next card with the winner's theme-color border; loser cards continue to grayscale/fade and the champion lands in the centered final card.
- Updated browser cache lineage to `20260811-orb-race-tournament-zoom3` (presentation), `...-zoom3-fairy-frost3` (renderer), and `...-controls2-fairy-frost3` (page entry). Tournament-only canvases now remove the UI outer frame through `data-tournament="true"`; normal exports retain their frame. The renderer also tolerates current-match-only gameplay snapshots. No Classic media paths were changed.
- Verification: focused presentation/social suites pass `21/21`; live portrait/landscape bracket and intermediate zoom captures were inspected under `artifacts/design-qa/` with no browser console/page errors. Full `npm test` is green at `140/140`.

## 2026-08-11 — Orb Race tournament wizard, preview, and conclusion state

- Strengthened the dependency-light tournament state layer with deterministic unique roster auto-selection (`selectOrbRaceTournamentEntrants` and wizard-default aliases), pure read-only recording previews for a concrete matchup, selected round, or whole tournament, and explicit shared 3/5-layer landscape plans. Preview requests report portrait versus wide landscape dimensions without mutating the authoritative bracket.
- Tournament saves now retain completed `results` records and normalized presentation timing. Standard zoom is `1.75s` (clamped to `1.5..2`), conclusion is exactly `1s`, and reduced-motion equivalents are deterministic. The authoritative result phase exposes destination `???`, dust-out, and winner fade-in progress; no winner travel-along-line state is emitted.
- Bracket data keeps unknown entrant/output labels exactly `???` and exposes card metadata/source-target connections for the coordinating renderer/UI chats. Landscape rendering should reflow to a genuinely wide 16:9 bracket rather than stretch or crop the portrait topology.
- Added focused deterministic tests for wizard selection, preview purity/format selection, save/resume results, timing/reduced motion, unknown slots, and match hydration. Renderer/UI/audio files remain untouched.
- Verification: focused tournament tests pass 15/15, full `npm test` passes 140/140, and a headless Playwright page/console smoke check passes with `render_game_to_text` available and no console/page errors.

## 2026-08-11 — Orb Race tournament three-page wizard and wide preview

- Replaced the single Tournament setup panel with an accessible three-page wizard: preset, unique entrant roster/custom seed order, and interactive bracket preview. Tournament remains a third Orb Race format and hides ordinary team/setup controls while selected.
- The preview now defaults to a genuinely wide landscape reflow for interactive/Long Race use, while retaining an intentional portrait reflow button. Both layouts use rounded orb/name cards as bracket nodes and clean orthogonal connectors; the preview adds bounded zoom controls and preserves the shared setup-panel scroll owner.
- Follow-up reflow uses each match’s left/right/center topology: outer semifinals feed inward to a centered championship card in both portrait and landscape, rather than placing every round in one left-to-right column. `OPEN SAVED BRACKET` reconstructs a full bracket even for preset-only saves.
- Saved/open brackets use full hydrated state when available, show exact `???` future slots, and expose portrait `Record This Matchup` only for concrete selected pairings. Resume returns directly to Page 3 with the saved title and bracket size.
- Fixed draft preview factory wiring to pass normalized tournament fields at the module contract boundary, preserving selected bracket sizes instead of falling back to eight entrants. Added source assertions for the wizard/preview contract and preserved the live main entry lineage at `20260811-orb-race-tournament-cards4-fairy-frost3`; the setup stylesheet now uses `20260811-orb-race-tournament-cards2-classic-ui1`.
- Verification: `node --check src/main.js`, focused UI/social tests, full `npm test` (140/140), and elevated Playwright Chromium wizard smoke pass. The smoke confirms Page 1→2→3, `4 / 4` auto-selection, scroll position preservation, 3-card/4-entrant bracket, wide preview, 125% zoom, concrete-match action, save/resume, `render_game_to_text`, and zero console/page errors. Capture: `artifacts/design-qa/orb-race-tournament-ui/bracket-preview-wizard.png`.

## 2026-08-11 — Orb Race tournament layer preset and round selection contract

- Added `buildOrbRaceTournamentLayerPreset(layerCount, finalLayerHealth)` plus `buildTournamentLayerPreset`/`buildSharedTournamentLayerPreset` aliases. Valid 3- and 5-wall presets are deterministic, monotonic, and always end at the normalized target; long-form tournament normalization and recording previews use the same helper.
- Added `normalizeOrbRaceTournamentRoundSelection(input, size)` for canonical `round-#`, `round-of-*`, quarterfinal/semifinal/championship labels, indices, and `roundsToRecord`. Selected-round subsets remain mutable and serializable; only whole-tournament intentionally expands to every round.
- Explicit wall arrays remain post-preset manual overrides. Added focused tournament and feature assertions for 3/5 target autofill, deterministic parity, manual override behavior, mutable selection, and URL round trips. UI/main/renderer files were intentionally not changed; UI should call the shared preset helper when count or target changes. Combined gameplay/features coverage passes 18/18; the full shared-worktree run is currently blocked only by existing `tests/social.test.mjs` and `tests/ui-setup.test.mjs` cache/markup assertions.
## 2026-08-12 — Tournament bracket node topology

- Rebuilt the Orb Race tournament preview around the shared deterministic bracket graph: every entrant/winner is its own rounded node, two source nodes feed one destination node, and both sides converge into the centered championship branch.
- Added independent portrait and landscape reflow, compact orb marks beside entrant names, exact `???` future nodes, and removed the old combined `ORB VS ORB` match cards.
- Kept the 1.75-second quintic camera move focused on the active source pair, destination, and neighboring matchup context.
- Fixed snapshot-only previews so seeded entrant ID arrays resolve to real orb cards instead of appearing as unknown nodes.
- Playwright verified the three-page wizard, separate-node topology, portrait/landscape switching, pan/zoom, save/reopen, match selection, and zero console/page errors.

## 2026-08-12 — Tournament node content and 64-entry browser QA

- Tournament preview nodes now contain only a compact orb mark plus the orb name; known marks use the Orb Race palette/symbol or the existing picker asset, while future nodes remain exactly `???`. Removed stale combined-match/VS CSS and helper markup.
- The UI graph wrapper now hydrates full tournament entrants when available and reconstructs seeded entrant cards for snapshot-only bracket opens. Match focus frames both source nodes, the destination node, and nearest same-column context without rebuilding the stable graph.
- `node --test tests/ui-setup.test.mjs tests/orb-race-tournament-presentation.test.mjs` passes 30/30. Elevated Playwright smoke verified 64 entrants, 127 nodes, 126 orthogonal connectors, portrait and landscape reflow, orb marks, selection/recording, save/open/resume, and zero console/page errors. Entry/style cache keys advanced to `20260812-orb-race-tournament-nodes2`.

## 2026-08-12 — Tournament “Record This Matchup” gameplay seam

- Added the pure `prepareOrbRaceTournamentMatchForRecording` clone helper plus compatibility aliases. It prepares a concrete pending/active first-round match as a short portrait `1080×1920` recording with exactly three shared layers, fresh intro timestamps, and one active recording segment, without mutating the authoritative bracket.
- Incomplete competing active matches are demoted to pending only in the clone; completed results and bracket advancement remain intact. Focused tournament coverage passes 19/19. The final shared-worktree `npm test` run is 146/147 because `tests/ui-setup.test.mjs` currently expects the concurrent UI source text `PORTRAIT MATCH RECORDING REQUESTED`, which is absent from the current `src/main.js`; no UI file was changed in this gameplay slice.

## 2026-08-12 — Tournament recording end-to-end boundaries

- Normalized tournament conclusion timing to `1.75s` and kept the deterministic `0.55s` next-match gap.
- Fixed state recording plans so selected matchup, selected round, and whole-tournament runs close the correct segment boundary; whole-tournament is now one continuous segment with all match IDs.
- Hardened `TournamentRecordingCoordinator` round selection and added `onMatchResult`/`shouldContinueAfterMatch` helpers. Focused tournament/state/coordinator coverage passes 46/46.

## 2026-08-12 — Tournament matchup recording action wired end to end

- Completed the UI action from a selected concrete bracket node through `prepareOrbRaceTournamentMatchRecording()`, the preserved tournament session key, Social Battle launch, and `TournamentRecordingCoordinator.onMatchIntro()`. The request now carries both selected orb IDs and the fixed portrait/3-layer recording contract.
- Added a single-match recording guard in the main lifecycle so the selected clone stops after its result and does not schedule a later bracket matchup; the saved/authoritative tournament remains the source snapshot and is not mutated by the recording clone.
- Updated the focused UI assertions and the browser entry cache key to `20260812-orb-race-tournament-match-recording2`; documented the runtime/render inspection contract in `UI_STATUS.md`.
- Verification: `node --test tests/ui-setup.test.mjs tests/orb-race-tournament.test.mjs` passes 28/28; `npm test` passes 147/147; elevated Chromium Playwright completed the actual Page 3 selection and record-specific click flow with setup closed, recorder active, selected IDs matching in `getState()` and `render_game_to_text()`, portrait `1080×1920`, three layers, and no console/page errors.

## 2026-08-12 — Portrait bracket fit and record-from-menu correction

- Fixed the remaining setup-close race in `Record This Matchup`: recording launched from the main menu now sets the return origin to the game before closing the dialog, so the selected tournament recording stays on Social Battle instead of being returned to the menu.
- Reflowed portrait-only bracket margins across 6%–95% of the 1080×1920 canvas, preserving the approved landscape measurements while giving portrait rounds more vertical separation. Portrait connectors now use dedicated thin 0.8–1.9px strokes; landscape retains its prior connector weights.
- Rounded tournament cards clip their entire icon/name content and deterministically shorten labels with an ellipsis when required, preventing text from crossing a card or connector at dense 16/32/64-entry scales.
- Browser verification selected and recorded a concrete 16-entry matchup with the setup closed, recorder active, matching runtime IDs, portrait format, three layers, and zero console/page errors. Capture: `artifacts/design-qa/orb-race-tournament-ui/portrait-record-match.png`.

## 2026-08-12 — Tournament portrait focus, finish, and announcement timing

- Preserved the landed portrait bracket reflow and added explicit per-card text-fit metadata consumed by the rounded-card renderer. Labels are clipped to their cards and deterministically ellipsized; portrait connectors remain in the thin 0.8–1.9px contract while landscape is unchanged.
- Tightened only portrait tournament camera padding/fit so the active source pair and destination are the final centered focus after the smooth 1.75-second zoom, with adjacent same-column context retained. The interactive portrait preview uses the matching closer scale.
- Removed the tournament-only extra black finish separator/outline under the checkerboard; ordinary Orb Race finish borders are unchanged. Deferred tournament matchup announcer playback until the simulation presentation enters `battle`, after bracket zoom completes, with a stable per-match key.
- Updated cache lineage to `portrait-fit2` across the tournament presentation, renderer/main seam, and page entry. Focused presentation/social tests pass 23/23; full `npm test` passes 147/147. Fresh Playwright capture was blocked by the browser tool usage limit; existing QA evidence remains `artifacts/design-qa/orb-race-tournament-ui/portrait-record-match.png`.

## 2026-08-12 — Tournament tighter matchup camera and direct winner reveal

- Expanded portrait rounded-card width/height and name sizing into the surrounding whitespace while retaining clipped text and the separate-node topology. Portrait connector strokes are now visibly heavier (`1.6–3.2px`, active `2.2–4.4px`); landscape layout measurements remain on the approved profile.
- Added shared tighter camera padding/fit helpers for portrait and long-form landscape. The single continuous eased camera still centers the active source pair plus destination and adjacent same-column context.
- Reworked the conclusion renderer to stay zoomed: the destination `???` dusts/fades away, the loser desaturates, and the winner fades into the destination card with its orb-color border. No winner travel sprite is drawn. The gameplay recording tail now honors the normalized `1.75s` tournament conclusion.
- Cache lineage is `20260812-orb-race-tournament-portrait-fit3` across the presentation/renderer/main/page seams. Focused tournament presentation, state, and social suites pass `49/49`. The required Playwright client ran with escalation; its smoke capture was the default Classic flow, so root will perform the tournament-specific visual QA capture.

## 2026-08-12 — Tournament landscape recording controls

- Wired Page 3 Record Selected Round and Record Entire Tournament actions into a shared main-level recording workflow. Both actions now normalize the wizard settings, hydrate a fresh or resumable tournament session, close setup, and start the actual canvas MediaRecorder through TournamentRecordingCoordinator.
- Added result-event/conclusion-boundary handling so each-match, selected-round, and whole-tournament segments stop or continue at the correct lifecycle boundary. Manual Stop finalizes the active tournament segment before the recorder flushes, and download filenames preserve the coordinator’s scope-aware metadata.
- Exposed a blob-free recordingResult snapshot through __ORB_FOUNDRY__ and render_game_to_text for output status and automation checks. Existing specific-match portrait recording remains intact.
- Updated UI source assertions and the browser entry cache key to 20260812-orb-race-tournament-recording-workflows1. No gameplay, renderer, audio, or recorder module was edited.
- Verification: full npm test passes 155/155; focused UI/social tests pass 10/10; node --check src/main.js passes. Elevated Chromium Playwright started, stopped, previewed, and downloaded both selected-round and whole-tournament MP4 outputs with completed metadata and zero console/page errors. The required bundled web-game client smoke also completed.

## 2026-08-12 — Tournament recording and conclusion polish

- Verified the actual recording controls end to end: selected matchup starts a `1080×1920` each-match recording; selected round and whole tournament start `1920×1080` long-form recordings with their correct coordinator scopes.
- Expanded small portrait brackets to use the available width and height, increased label room, and strengthened portrait connector strokes while retaining density-aware scaling for 16/32/64-entry brackets.
- Kept the long-form 1.75-second camera move tightly framed on the active matchup and preserved the side-by-side long-race handoff.
- Fixed the finished-match clock handoff so the deterministic 1.75-second conclusion continues advancing while MediaRecorder remains active. The zoomed conclusion keeps the loser grayscale, fades/dusts the `???` destination, then fades the winner directly into that card.
- Advanced browser cache lineage through `recording-workflows5`, `portrait-fit4`, and `conclusion4`. Playwright verified all three real recording actions, correct canvas dimensions/scopes, the live conclusion phase, and zero console/page errors.

## 2026-08-12 — Continuous tournament recording transitions

- Preserved one active MediaRecorder across selected-round and whole-tournament matchup queueing. The next match is appended through the existing coordinator session; `launchBattle()` receives an explicit `preserveTournamentRecording` flag so cross-round hydration cannot cancel an active long-form recorder.
- Added a UI-owned `tournamentTransition` contract for Media/Rendering: `pan-to-next`, source/target match IDs, continuous progress, no intro restart, no static dwell, and a `2750ms` pan duration. Individual matchup recordings retain the full `1200ms` static bracket dwell and portrait contract.
- Continuous launches keep the presentation timeline active, retain the zoom cue guard, and draw with the recorder flag while the next hydrated simulation is created. Direct selected-round requests continue through non-selected preliminary matchups instead of stalling.
- Updated the interactive preview zoom to `2750ms`, entry cache lineage to `20260812-orb-race-tournament-pan2750-workflows7`, and UI source assertions.
- Verification: `node --check src/main.js` passed; `node --test tests/ui-setup.test.mjs` passed 10/10. Full npm and browser workflow verification remain to be run after this patch.

## 2026-08-12 — Long-form tournament direct camera pans

- Long-form tournament follow-up matches now transition directly from the zoomed conclusion into the next matchup with a single continuous eased camera transform. The full-bracket intro is not replayed between matchups, the camera never resets to overview, and the next source pair/destination becomes the centered focus after the transition.
- Standardized the long-form pan to exactly `2.75s`, matching the extended animated intro contract. The pure timeline still exposes the approved `winner-advance` conclusion before the `next-match-pan` renderer phase; portrait individual-match recordings continue to use their full intro.
- Tightened landscape focused target fitting so 8-entry and larger long-form pans remain visually zoomed while retaining adjacent bracket context. The transform is continuous and unrounded at 30/60 FPS; reduced motion remains deterministic.
- Cache lineage advanced to `20260812-orb-race-tournament-pan2750-focus2` across `index.html`, `main.js`, `social-renderer.js`, and tournament presentation imports.
- Verification: focused presentation/state/social tests pass `54/54`; full `npm test` passes `160/160`. Root-owned tournament Playwright visual QA remains the final bracket/export screenshot authority.

## 2026-08-12 — Continuous recording verification refresh

- `npm test` passes 160/160, including the shared tournament presentation/coordinator timing suite and the UI continuity assertion.
- Elevated Chromium verified selected-round and whole-tournament Page 3 controls through real recorder start, stop, preview, and MP4 download with zero console/page errors. The 64-entry wizard smoke also verified scroll preservation, separate-node portrait/landscape previews, and selected-match launch.

## 2026-08-12 — Tournament long-form animated intro handoff

- Kept the static bracket dwell at `1.2s` and extended the default/migrated animated matchup intro to `2.75s`. Long-form selected-round and whole-tournament recording now gives only the first included matchup the full intro; each later included matchup starts a direct deterministic `2.75s` camera pan at the preceding conclusion boundary. Individual matchup recordings still receive their own full intro.
- Canonicalized restored camera-pan timing to `2.75s`, including saves carrying legacy `1.75s` zoom/pan values. Added explicit match/segment timeline metadata, intro modes, transition endpoints/progress, included-match tracking, and camera-pan counts for recorder/media consumers.
- Verification: focused tournament state/presentation tests pass `53/53`; `npm test` passes `160/160`; Playwright smoke loaded the app, found `render_game_to_text`, and reported no console or page errors.

## 2026-08-12 — Super X^X^X and Caged Orb Racer

- Added the stable `super-x-power` racer, displayed as `SUPER X^X^X`, with a nested capped bounce-damage policy, black/purple double ring, centered game-owned HP, HUD label, picker detail, and generated Alex announcement.
- Added explicit per-orb `caged` and `cageDuration` settings. Caged racers begin in the generated hanging cave, move left/right only, cannot damage layers or fire abilities, and release through deterministic `race-cage-release` timing into the normal bounce arc. Cage geometry and state are replay/text-snapshot friendly; the cage has no gameplay damage path.
- Corrected Cowboy's cigar crop orientation by mirroring the authored accessory in its target-facing local frame, placing the lit end outward.
- Kept Orb Foundry Boss announcement semantics: `race-boss` remains a real cue alias to the validated Buffed Alex recording, appended only when the per-orb Boss option is selected.
- Generated/cleaned/validated cage art under `assets/generated/orb-race-cage-20260812/`; active audio is under `assets/audio/announcer/generated-race/race-super-x-power.mp3` with source preservation under `assets/audio/source/race-announcer-generated/`.
- Focused suites (`features`, `simulation`, `social`, `classic-audio`) pass; the follow-up full suite and targeted browser QA are recorded in the next bullet.
- Follow-up QA wired the visible Cage Time control into `readSetup()` and advanced the live cache lineage to `20260812-super-x-cage2-cowboy-cigar2`. Targeted Playwright captured `artifacts/design-qa/super-x-cage2/active.png` with Super X^X^X inside its hanging cage and `released.png` after the deterministic 3-second release; state snapshots confirm `raceCageActive: true → false`, and browser console/page errors were empty.

## 2026-08-12 — Super X^X display and dedicated Boss cue

- Corrected the public Orb Race presentation for stable ID `super-x-power` to **SUPER X^X** everywhere: racer name, picker detail, render-game text, HUD line, emblem, and Alex announcement script `Super X to the X.`. The nested x^(x^x) gameplay rule remains unchanged.
- Generated a separate Alex Boss clip from `Boss.` at `assets/audio/announcer/generated-race/race-boss.mp3` with the preserved source at `assets/audio/source/race-announcer-generated/race-boss.mp3`. Orb Foundry's Boss option now routes to this clip instead of reusing `race-buffed`.
- Added `--boss-only` to `scripts/generate-race-announcements.mjs` and advanced the live browser cache lineage to `20260812-super-x-cage3-boss2-cowboy-cigar2`.
- Verification: focused feature/simulation/social/classic-audio suites pass 7/7 files; both regenerated clips are valid 24 kHz mono MP3s. Full npm and browser smoke verification follows this entry.

## 2026-08-12 — Root QA for continuous tournament camera handoff

- Verified an actual 1920×1080 whole-tournament recording in Playwright. The recorder remained active while the presentation moved directly from `round-1-match-1` to `round-1-match-2` through the `camera-pan` phase, with an exact `2.75s` duration and observed continuous progress from approximately `0.158` to `0.942`.
- Inspected mid-pan and near-complete frames: the bracket stayed zoomed, moved smoothly to the next centered matchup, and did not restart at the full-bracket overview. Browser console and page-error collections were empty.
- Final verification: `npm test` passes `160/160`.

## 2026-08-12 — Media: exact tournament pan/hold and committed result

- Split the tournament intro/handoff presentation envelope into exactly `1.0s` eased camera motion plus `1.75s` stationary centered matchup visibility. Initial intro no longer adds a separate full-bracket dwell.
- Normalized externally supplied tournament frames in `SocialBattleRenderer`; raw `camera-pan` no longer bypasses the focused camera, and a premature battle phase remains bracket-visible until `battleAt`.
- Derived committed result cards without mutating authoritative state, preserving the winner in place of `???`, loser grayscale, and winner-colored border through the next pan.
- Focused presentation/social tests pass `32/32`. Full suite passes `162/163`; the remaining failure is the concurrent root-owned main/UI continuity assertion in `tests/ui-setup.test.mjs:291`.
- Required standard Playwright client completed and its Classic smoke screenshot was inspected. TODO: root workflow should capture the actual long-form tournament mid-pan and hold frames after landing the main/state cache seam.
- Root's targeted tournament capture found the remaining live seam: the explicit UI transition was ignored whenever no `tournamentFrame` was supplied. `SocialBattleRenderer` now prioritizes active `presentation.tournamentTransition` over the frozen simulation conclusion and synthesizes the target-match pan/hold frame directly. A regression samples both `500ms` camera motion and `1800ms` centered hold while simulation presentation is intentionally frozen on the prior conclusion.
- Corrected the follow-up camera-speed bug by deriving intro elapsed seconds from the tournament clock rather than treating a one-second phase's normalized progress as progress across `2.75s`. Added explicit `matchup-hold` normalization for both full intro and direct pan. Focused media/presentation coverage passes `33/33` with exact `0.5s`, `1.0s`, and `1.8s` assertions.

## 2026-08-12 — Tournament intro clock and focused-hold verification

- Finalized the tournament matchup envelope as exactly `1.0s` of eased camera movement followed by `1.75s` completely stationary on the centered matchup. Inter-match travel begins from the previous focused scale and cannot zoom back out to the full bracket.
- Corrected the browser renderer's clock-domain mapping so the one-second phase is no longer compressed into roughly one third of a second. `matchup-hold` now retains the destination camera rather than falling back to an overview.
- Kept the prior winner committed in the bracket during handoff, deferred the next announcer/gameplay launch until the full hold completes, and preserved one active MediaRecorder across the transition.
- Advanced browser cache lineage through `index.html`, `main.js`, `social-renderer.js`, and tournament presentation imports.
- Verification: `npm test` passes `164/164`. A live 1920×1080 Playwright tournament recorded a handoff with the camera still moving at `0.70s`, stationary at `1.74s`, and gameplay visible only after `2.75s`; recorder continuity held and browser console/page errors were empty.

## 2026-08-12 — Cowboy cigarette accessory

- Reused the supplied/reference-identical generated Cowboy accessory atlas; no new GPT image generation was needed.
- Added deterministic `classicTrapperCigarSourceRect` cropping and a target-facing nearest-neighbor cigarette overlay in the Classic renderer. The hat and stable `trapper`/Cowboy identity remain unchanged, and centered HP stays readable.
- Advanced the live cache lineage with `cowboy-cigar1` across the renderer, social renderer, main entry, and index script.
- Verification: focused Classic/media tests pass `96/96`; the fresh Playwright Cowboy matchup capture is `artifacts/design-qa/classic-cowboy-cigarette1/cowboy-matchup.png`, with clean browser diagnostics.

## 2026-08-12 — Glass reduction, full Spikey contact, and vertical Speedster ramps

- Reduced Glass Ball's deterministic wall-shatter count by 50% to `3–5` shards (down from `5–10`), keeping the existing seeded dispersion, compact wall-local flight, and one-hit `-2` contact behavior.
- Spikey's gameplay state now explicitly labels its existing triangle geometry as `damageCoverage: "full-triangle"` and `damageContactMode: "tip-to-base"`; the same configured `3` damage applies from the sharp tip through the body to the blunt wall-mounted base.
- Orb Race Speedster, Speed combos, Flash, and Unarmed now keep `raceTravelSpeed`/horizontal velocity fixed while accumulating `raceVerticalSpeed` and `raceVerticalSpeedGain`. The accumulated vertical launch speed is used after line and wall bounces. In long form, only this family bypasses the cleared previous-layer virtual ceiling and targets the real arena top wall.
- Added focused coverage for 3–5 Glass shards, tip/body/base Spikey damage, horizontal-speed stability, vertical-speed ramps, long-form arena-top contact, and replay preservation. Renderer/UI ownership remains unchanged.
- Verification: focused Classic + simulation suites pass `93/93`; `npm test` reaches `163/165` because unrelated concurrent UI/media assertions are stale (`super-x-power` roster snapshots and a `main.js` cache-key expectation in `tests/features.test.mjs`/`tests/social.test.mjs`). Bundled Playwright smoke on local HTTP completed with no console/page errors; the required smoke capture was visually inspected.

## 2026-08-12 — Orb Race Antimatter, Time, and Reality Bombs

- Added stable Orb Race IDs `antimatter-bomb`, `time-bomb`, and `reality-bomb` to the picker, registry, weapon group, settings normalization, team announcer routing, and replay state. Their Alex clips are `assets/audio/announcer/generated-race/race-antimatter-bomb.mp3`, `race-time-bomb.mp3`, and `race-reality-bomb.mp3`, with preserved sources under `assets/audio/source/race-announcer-generated/`; all three were regenerated as real non-silent 24 kHz mono MP3s.
- Antimatter Bomb now runs a deterministic 15-second cycle. Each detonation clears the target's active layer and emits a wide fading dust burst; the second detonation removes one opponent orb and leaves that orb's colored dust fade. The renderer shows a live centered countdown, collapse pulse, and post-collapse burst ring.
- Time Bomb now runs a deterministic 15-second cycle. At midnight it freezes opposing racers for five seconds and one-shots all remaining opposing layers. Its HUD switches from the countdown to the remaining freeze time during the freeze window.
- Reality Bomb uses the generated faceted red crystal body at `assets/generated/orb-race-reality-bomb-20260812/final/reality-bomb.png`, cleaned from the preserved chroma source with transparent corners and nearest-neighbor rendering. Every five seconds it deterministically chooses a non-bomb Orb Race ID for its team, starts it as a gray orb, and fades the real orb design in over three seconds while the spawned orb uses the owner's layer/physics contract.
- Orb Foundry Hydrogen Bomb now always shows a `BOMB xx.xS` timer above its matchup name, including before the countdown event has started. Bomb simulation events route to existing validated hydrogen/black-hole effects without adding missing audio files.
- Updated browser cache lineage to `20260812-super-x-cage3-boss2-bombs1` across the live entry/import graph. Focused simulation/social suites pass; full `npm test` and browser QA are the remaining final checks for this entry.

## 2026-08-12 — Orb Race Bomb Body Visual Refinement

- Antimatter Bomb now renders as a large black bomb with only a centered red numeric countdown; its deterministic collapse/pop and fading dust remain separate effects.
- Time Bomb now renders as a full cream clock face with tick marks and animated hour/minute hands driven by the 15-second cycle. Reality Bomb uses its generated faceted crystal directly as the entire orb body, with no generic circle underneath.
- Advanced the browser cache lineage to `20260812-super-x-cage3-boss2-cowboy-cigar2-bombs2` and added source-contract checks for the three bomb body treatments.
- Verification: full `npm test` remains green at 165/165; elevated Playwright captures under `artifacts/design-qa/race-bombs-20260812/` show the corrected bodies with zero console errors, page errors, or failed requests.

## 2026-08-12 — Orb Race Time Bomb Reuses Classic Time-Stop Cue

- Routed `race-time-bomb-midnight` to the existing `chrono-time-stop` sample used by Classic's `time-stop` event, preserving the full temporal-lock cue instead of the short teleport effect.
- Documented the Time Bomb pulse/freeze contract: the midnight event remains a screen-wide deterministic pulse, freezes only reached opposing racers for five seconds, and does not clear their layers; Antimatter clears its own layer and removes an opponent orb only on its second detonation.
- Advanced the browser cache lineage to `20260812-super-x-cage3-boss2-cowboy-cigar2-bombs3-timefreeze2` across the live import chain.

## 2026-08-12 — Orb Race Time Bomb Reach and Two-Piece Tilted Physics

- Extended the Orb Race Time Bomb pulse to normalized radius `2`, covering the full short-form and long-form arena. A pulse-reached opponent now has a complete deterministic stop gate: body physics, owned projectiles, abilities, and cooldowns pause together, and absolute cooldown timestamps are shifted with fixed-step time so no shot fires immediately on release.
- Reworked the optional two-piece tilted layer around its existing stable state. Left/right health stays independent; one zero-health piece opens while the other remains rendered/physical, and the shared layer advances only after both pieces are cleared. Racers falling through an open half use a serialized `raceLayerIndexOverride` and continuous gravity to reach the next layer without teleporting.
- Tilted contacts now use the same V slopes as the renderer, with `raceTiltedLayerSurfaceNormal(x)` and radius-offset contact geometry. Rebound velocity reflects over the contacted piece's normal, so the layer no longer behaves like a straight horizontal wall.
- Added deterministic simulation coverage for short/long Time Bomb reach, frozen sniper projectile/cooldown state, tilted normals, independent-piece clearing, open-half fall-through, and replay equivalence. Renderer/UI files were not changed.

## 2026-08-12 — Orb Race Tournament 64-entry deterministic handoffs

- Strengthened `src/orb-race-tournament.js` so the live state and replay snapshot explicitly carry `selectedMatchId`, focused/current/active match IDs, round/match indices, and direct handoff `fromMatchId`/`toMatchId` identity. Handoff state is now also mirrored in `presentationHold` and recording timelines, with hydration backfills for older valid saves.
- Confirmed the complete 64-entry long-form path: the first matchup uses the full intro, every one of the 62 non-final handoffs uses a direct `camera-pan` of exactly `1s`, then a stationary `matchup-hold` of exactly `1.75s`, and no pan exposes a zoom-out/overview phase. Completed output nodes and winners remain committed across round boundaries.
- Added a same-seed full-bracket regression that hydrates during a conclusion handoff, samples camera-pan/hold/battle phases, verifies 63 results and one continuous recording segment, and compares the final snapshot/champion. Renderer/UI styling was not changed.

## 2026-08-12 — Orb Race Tournament 64-entry focused camera and connector restyle

- Tightened the deterministic selected-match camera in `src/orb-race-tournament-presentation.js` while preserving the exact one-second eased motion, 1.75-second hold, centered active matchup, and adjacent same-column context. Added 64-entry portrait/landscape tests for midpoint movement, exact endpoints, and direct handoffs that never zoom back out.
- Restyled `src/social-renderer.js` bracket connectors to use the shared muted purple/gray palette and screen-stable widths. Each source card still exits independently, joins its own side's vertical spine, and enters a separate winner card; the center final keeps its symmetric two-sided convergence.
- Live Playwright QA is captured at `artifacts/design-qa/orb-race-tournament-focus-20260812/` for 64-entry portrait and landscape overview, half-pan, focused hold, and late-hold frames. Browser diagnostics are clean. The page entry uses the concurrent `...timefreeze2-tournament64focus1-camera2` cache key; the renderer graph remains `...timefreeze2-tournament64focus1` with presentation import `...intro-clock4-64focus1`.
- UI integration note: `src/main.js` still contains a separate legacy `2750ms` transition constant from concurrent UI work; the gameplay authority is the serialized `1000ms` camera pan plus `1750ms` hold contract documented in `GAMEPLAY_STATUS.md`.

## 2026-08-12 — UI tournament camera handoff audit

- Corrected the UI-side 64-entry tournament seam so first/individual match intros carry explicit active/to IDs, and continuous long-form handoffs trust the next match's authoritative camera-pan from/to IDs instead of synthesizing a generic transition.
- Fixed queued hydration to preserve the existing recorder and pass the pan transition through the next launch/recorder handoff. The UI preview now uses one continuous 1s camera move plus a stationary 1.75s hold, with fractional DOM progress and preview camera IDs.
- Updated the entry cache key to `20260812-super-x-cage3-boss2-cowboy-cigar2-bombs3-timefreeze2-tournament64focus1-camera2`. UI tests and focused browser QA passed; no renderer, gameplay, audio, recorder, or connector styling files were changed.
- Live low-health UI smoke reached the second matchup without restarting MediaRecorder: `round-1-match-1 → round-1-match-2`, `preserveRecorder: true`, with continuous motion progress observed at `0.97` and clean browser diagnostics.

## 2026-08-12 — Classic Apple contact cleanup and Sword combo hits

- Classic Apple throws now disappear immediately after touching a fighter instead of lingering as collected entities. Flight contact is deterministic; Apple-versus-Apple consumption heals once for `+3` and suppresses duplicate same-step heal/damage markers, while non-Apple opponents retain `-5`.
- Classic Sword uses a widened visible-width segment, one-hit-per-target-per-swing state, stronger forward pushback, and a landed-hit combo recovery so consecutive attacks can chain when the target remains in range.
- Added focused Apple lifecycle/Apple-vs-Apple and Sword hit-width/combo regressions. Renderer/audio/UI ownership remains unchanged; state/event fields are documented in `GAMEPLAY_STATUS.md`.
- Verification complete: `node --test tests/classic-rework.test.mjs` `95/95`, `node --test tests/simulation.test.mjs` passed, `node --test tests/classic-audio.test.mjs` passed, `npm test` `172/172`, and the minimal Playwright smoke returned `render_game_to_text` with no console/page errors.

## 2026-08-12 — Classic Apple, Blue Sun, Frost, Duplicator, Cutter, and Batman tuning

- Enlarged Classic Apple throws to radius `36` (1.5×), shortened their deterministic landing window to `0.3–1.1s`, and kept them present until `10s` after spawn even after collection.
- Nerfed Blue Sun to one damage per ray per half-second while preserving its eight-ray cadence and independent overlapping-ray ticks.
- Changed Frost from periodic trail DPS to one flat `-3` entry hit, with explicit fixed-step freeze/release state for targets inside the trail.
- Set Duplicator duplicate health to `50` and removed Cutter's three-area cap. Cutter now retains an unbounded list of completed red damage areas, expiring each independently after `8s`; active lines and overlap stacking remain deterministic.
- Enlarged only Classic Batman's batarang state radius to `15` (3×); Orb Race batarang/boomerang sizing remains unchanged.
- Added/updated focused Classic assertions for the new contracts. Verification: Classic suite `93/93`, full `npm test` `170/170`, and elevated Playwright smoke passed with a clean console/page-error buffer.

## 2026-08-12 — Frost trail/freeze visuals, Absorber UI, and Classic combat audio

- Rewired Frost's legacy `train-track` hazard to the generated four-frame Frost trail sheet and added the GPT-generated four-frame `frozen-orb-overlay` rim. Frozen targets receive a subtle blue glaze while the center remains clear for game-drawn HP; the overlay persists until the deterministic freeze state releases.
- Added one-shot `classic-freeze` events/audio on trail entry, owner/opponent Apple pickup routing (`forge-item-pickup`/`cinder-burn-tick`), dedicated sword slice hit routing, Trident throw coverage, and one long Zeus thunder cue per three-node cast. Sword/Draftmaster bullet deflections now show a short in-place slash window.
- Classic Absorber's current and complete absorption history is visible above the orb and in render-game text, with persistent labels/color accents so each absorbed effect remains represented.
- Added focused manifest/alpha, simulation event, audio-plan, and renderer source-contract assertions. Browser cache lineage advanced to `...-frost-freeze-absorber-audio2`; `SAMPLE_ASSET_VERSION` advanced to `20260812-classic-frost-freeze-absorber-audio2`.
- Focused verification: `classic-rework` `92/92`, `classic-audio` `4/4`, `social` `1/1` test file; full `npm test` passes `170/170`. Elevated Playwright captures from `scripts/qa-classic-frost-freeze-absorber-audio2.mjs` are stored under `artifacts/design-qa/classic-frost-freeze-absorber-audio2/` with clean console, page-error, and request-failure diagnostics.

## 2026-08-12 — Classic Apple marker cleanup, Sword blade contact, and Zeus triangle

- Friendly Apple collection no longer exposes the healed orb as `classic-apple-collected.targetId`; `collectorId` is the explicit collection target and `classic-heal` remains the only marker transaction. Opponent Apple hits still expose `targetId` and `-5` damage.
- Apple cadence is now two seconds and thrown Apples are radius `54` (1.5× the prior 36px throw). Contact disappearance and the ten-second uncollected expiry remain fixed-step deterministic.
- Sword's blade capsule widened to `0.72 × radius`; new physical blade contacts deal `3` damage with `contactSource: "sword-blade"`, while active swing/poke hit deduplication and consecutive combo attacks remain intact.
- Zeus uses a seeded random center/orientation for a closed equilateral triangle of lightning nodes and ticks `10` damage once per second. Formation and damage state are exposed for renderer/audio consumers.

## 2026-08-12 — Classic Frost, Apple heal, Zeus shock, and Cutter line lifetime

- Frost is now intentionally silent. Its existing deterministic freeze event remains available to the presentation layer, but `classic-freeze` no longer resolves to a sound sample. The generated Frost trail now has a stronger fading cyan/blue snow streak with snowflake particles, and frozen targets receive a larger icy wrap, blue glaze, and falling snowflakes while velocity remains zero until release.
- Friendly Apple collection reuses the World Cup `green-energy-drink` presentation burst, including its expanding ring, outward particles, and `+3 HP` label. It is cosmetic and does not create a second heal transaction or audio event.
- Zeus damage keeps its single `classic-dot-tick`/negative health marker and now writes a short target-owned electrification pulse. The renderer flashes the orb white, draws a compact skeleton silhouette and crackling arcs behind centered HP, then deterministically returns to the orb color.
- Cutter's red wall connector now draws from the retained area-owned line geometry as long as the matching damage polygon is alive, including when segment IDs are unavailable or the replacement line is being drawn. The connector disappears only with its area lifecycle.
- Cache lineage advanced to `20260812-super-x-cage3-boss2-cowboy-cigar2-bombs3-timefreeze2-frost-silent-zeus-electro-apple-heal1`; `SAMPLE_ASSET_VERSION` matches this silent-Frost/audio presentation pass. No new raster or audio assets were needed.
- Focused Classic audio/rework/social suites pass; full `npm test` is the final verification for this entry.

## 2026-08-12 — Classic Frost renamed Snowball; dense trail and Zeus cast polish

- Kept the stable Classic simulation ID `frost-ball` and its Frost physics, freeze timing, damage, and trail gameplay unchanged. The public name is now **SNOWBALL**, its announcer is the existing Orb Racer Snowball Alex clip, and the body uses the Orb Racer Snowball sprite with deterministic rolling rotation.
- Generated and wired a dense near-solid four-frame ice/snow trail: `assets/generated/classic-visual-20260812-frost-trail-v2/final/frost-trail.png`. The preserved chroma source, exact GPT Image prompt, manifest, and alpha validation are in the same versioned folder. The renderer adds a thick continuous blue-white under-ribbon, ice shards, snow patches, and fading snow particles; the old train/rail visual and all Frost/Snowball Classic audio routes are suppressed.
- Zeus now throws a visible hand-held lightning bolt into the three-node chain cast, with deterministic flickering center forks. Zeus damage writes a target-owned amount/sequence stamp so every chain tick gets a readable `-N` marker even after the short event ring rotates; the existing cast still uses one long thunder sample.
- Advanced the live cache lineage to `20260812-super-x-cage3-boss2-cowboy-cigar2-bombs3-timefreeze2-frost-trail-v2-zeus-hand-marker2` and the Classic orb registry lineage to `20260812-classic-health-reactor-batman-fairy-zeus-frost-snowball1`.
- Verification: `npm test` passes `173/173`. Elevated Playwright QA is under `artifacts/design-qa/classic-frost-freeze-absorber-audio2/`; `frost-vs-absorber.png` shows the Snowball body and dense trail, `zeus-vs-sword.png` shows the hand/center lightning and `-5`, and `diagnostics.json` reports no console errors, page errors, or failed requests.

## 2026-08-12 — Snowball trail uses supplied seamless ice strip

- Replaced the generated Frost trail texture with the exact user-supplied four-frame RGBA strip at `assets/generated/classic-visual-20260812-frost-trail-v3/final/frost-trail.png`; the byte-identical preserved source, provenance note, manifest, and alpha validation remain in that versioned folder.
- Snowball trail frames now preserve their full authored 543×724 cells and are drawn at overlapping scale. A rounded world-space ribbon connects every fixed-step trail stamp to the moving Snowball, while a final local bridge closes the newest stamp to the orb, so turns and frame changes cannot expose gaps.
- Advanced the live cache lineage to `...frost-trail-v3-zeus-hand-marker3`. Snowball/Frost gameplay, freeze physics, damage, and the stable `frost-ball` ID remain unchanged.
- Focused renderer/social checks pass `101/101` and full `npm test` passes `173/173` after the asset swap. Elevated Playwright QA loaded the v3 asset with zero console/page/request errors; the inspected capture is `artifacts/design-qa/classic-frost-freeze-absorber-audio2/frost-vs-absorber.png`.

## 2026-08-13 — Orb Race Antimatter one-target detonation cadence

- Antimatter now keeps an explicit deterministic `raceAntimatterDestroyedTargetIds` list so detonation two and every later detonation remove at most one eligible opposing orb, in stable fighter-ID order; a second blast cannot perform a team-wide kill.
- The first two cooldowns remain 15 seconds. Once detonation two completes, `raceAntimatterCooldownSeconds` switches to 5 seconds for every subsequent blast. Detonation and destroy events expose the active/next cooldown and whether the bomb also broke its active layer; `raceAntimatterLayerBreaks` counts those breaks.
- Added a multi-target simulation regression for one-target-per-blast, post-second 5-second cadence, layer-break state, and deterministic target order. Renderer/UI/audio ownership remains unchanged; UI/Media should read the new per-racer cooldown field for the post-second countdown.

## 2026-08-13 — Orb Race Copycat independent seeded roulette

- Copycat now draws roulette choices from an independent per-racer seeded stream derived from match seed, spawn seed, and fighter index. Its first copied orb varies across seeds instead of depending on a fixed pool position or shared RNG consumption.
- Same-seed simulations still produce identical roulette sequences, while different opponents cannot change Copycat's choices by consuming the shared race RNG. `raceCopycatRandomState` is captured for replay; roulette/transform events identify `selectionMode: "seeded-random"`.
- Added focused coverage for same-seed replay, different-seed first-choice variation, and independence from other racers. Renderer/UI/audio ownership remains unchanged.

## 2026-08-13 — Orb Race Copycat return, baseline damage, and tilted clip fix

- Fixed Copycat's Black Hole transition: when the five-second copy ends before the longer singularity lifecycle, the saved position/velocity is restored immediately and an interrupted teleport-in event marks the deterministic return. Copycat no longer remains locked at the arena center during its next roulette.
- Copycat's original form is now zero-bounce damage. Copied abilities reset their own channels; Meteor starts at one damage and no longer inherits a prior Super X^X-sized value. RGB HUD text now includes current speed beside its color.
- Speedster and Flash 1.5K tilted-wall glitches now teleport beneath the tilted wall without damaging either tilted piece or creating a fake rebound. Added regressions for original Copycat damage, math-to-Meteor reset, Black Hole return, and both Speedster/Flash clip paths.
- Verification: `node --test tests/simulation.test.mjs` passed and the final `npm test` run passed `173/173`, including the RGB HUD renderer contract. Minimal Playwright verification loaded `index.html`, exposed `render_game_to_text`, and reported no browser errors.

## 2026-08-13 — Orb Race Reality, Lag hacker orb, Copycat, Whirlwind, and RGB

- Added deterministic gameplay/presentation seams for Reality Bomb's Slammy-only five-second summons and ten-second own/opponent layer rewrites, Copycat's two-second roulette and five-second copied ability, Whirlwind's six-orb orbit and bounce multipliers, and RGB's six-color five-second cycle with per-color stat gains.
- Generated the final Lag orb with GPT Image as a black orb with neon green hacker/glitch bands, removed the flat chroma background, validated alpha/corners, and wired it into `src/social-renderer.js`. Source, prompt, manifest, and validation are under `assets/generated/orb-race-lag-20260813-hacker/`.
- Added the supplied Lag glitch effect to the preserved audio source/effect folders and routed `race-lag-glitch-start`. Generated valid Alex WAV announcements for Lag, Whirlwind, and RGB with preserved source copies.
- Updated browser cache lineage to `20260813-reality-lag-copycat-whirlwind-rgb2`. Focused suites pass: `tests/simulation.test.mjs`, `tests/social.test.mjs`, and `tests/features.test.mjs`; the later v3 audio/cache pass completes full `npm test` at `173/173`.

## 2026-08-13 — Lag hacker palette and RGB/Copycat roulette audio

- Replaced the first Lag sprite with a stricter GPT Image v2 asset: a near-black orb with vivid neon-green hacker scanlines and digital glitch fragments. The transparent RGBA source/final, exact prompt, manifest, and alpha evidence are under `assets/generated/orb-race-lag-20260813-hacker-v2/`; the live renderer now cache-busts that v2 path.
- Added the existing Jackpot slot-spin sample to Copycat's `race-copycat-roulette-start` and RGB's `race-rgb-cycle` events. Each visual roulette/cycle starts one cue; the 0.2-second Copycat frame changes remain silent.
- Browser cache lineage advanced to `20260813-reality-lag-copycat-whirlwind-rgb3`. Focused simulation/social suites pass, and elevated Playwright QA under `artifacts/design-qa/orb-race-lag-20260813/` reports no console errors, page errors, or failed requests.

## 2026-08-13 — Orb Race Whirlwind satellites, random copies, and bomb cleanup

- Whirlwind now mirrors Orbital's contact model: the carrier orb remains zero-damage, while six rotating mini-orbs independently damage the number line on contact. Each satellite contact emits its own deterministic `race-bounce` event and contributes separately to the damage-rate HUD.
- Reality Bomb's summoned Slammy children now retain independent physical damage and a per-child bounce ramp instead of inheriting the carrier's zero-damage body policy. `render_game_to_text` exposes each child's damage and bounce count.
- Copycat roulette now avoids immediate repeats across visual frames and transformation cycles, and Copycat's HUD reads `COPIED: <orb name>` from the active/visible copied orb. RGB chooses a seeded random non-repeating color on each five-second cycle instead of advancing a fixed sequence.
- Lag's generated hacker sprite is rendered as a square, undistorted asset at the normal orb scale. Antimatter/Time Bombs do not accumulate generic trails; detonation and orb-destruction paths clear stale trails and transient effects before creating the current dust burst.
- Antimatter Bomb and Time Bomb ordinary bounces now remain explicitly zero damage in both their public `raceDamage` state and composed body damage; their timer/pulse channels remain the only damage paths.
- Cache lineage advanced to `20260813-reality-lag-copycat-whirlwind-rgb4`. `npm test` passes `173/173`. Fresh Playwright captures under `artifacts/design-qa/orb-race-specials-20260813/` report no console errors, page errors, or failed requests; the inspected Whirlwind, Copycat, Reality Slammy, and Antimatter frames reflect the updated state.

## 2026-08-13 — Snowball fixed trail direction and freeze audio

- Snowball/Frost trail entities now capture `laidAngle` at the fixed-step where each patch is placed. Classic rendering uses that stored heading for each trail cell rather than the Snowball owner's later velocity, so turning Snowball no longer rotates already-laid trail art. The existing continuous path/ribbon remains intact.
- Added the supplied `tanweraman-ice-freezing-445024.mp3` as `assets/audio/effects/classic-snowball-freeze.mp3`, with the original source and manifest preserved under `assets/audio/source/classic-snowball-freeze-20260813/`. It routes only the deterministic `classic-freeze` event when a new opposing target becomes frozen; trail, wall, and bounce events remain silent.
- Browser cache lineage advanced to `20260813-snowball-fixed-trail1` across the live Classic import/sample graph. Focused simulation/social/audio checks and the full suite were run after the change.

## 2026-08-13 — Orb Race playback recovery and Pancake anchor removal

- Removed the long-form renderer-only Pancake `groundY`/hold-layer anchor. Pancake stacks and the active Pancake now seat against the racer's live layer; syrup and butter patches continue to use their explicit patch `layerIndex`.
- Made Orb Race rendering recover sparse/restored team slots from live fighters, preventing a blank long-form canvas or a missing side when a browser snapshot contains incomplete `raceTeams` metadata.
- Recorder/audio setup no longer gates fixed-step simulation startup, so preview-only and slow audio-unlock paths begin playing immediately. Advanced the browser module cache lineage to `20260813-orb-race-playback1`.
- Verification: focused social assertions and full `npm test` pass; the minimal Playwright long-form Pancake smoke advanced simulation time with no console/page/request errors.

## 2026-08-13 — Long-form Time Bomb vs Reality Bomb playback

- Fixed a long-form-only `ReferenceError` in `drawRaceLongformHeader`: Reality Bomb now uses the supplied deterministic simulation time for its `NEXT SHIFT` header instead of calling a missing helper.
- Portrait rendering was not changed. Added a social-renderer regression assertion for the Reality Bomb long-form header; the direct Playwright matchup check now renders both lanes with no console, page, or request errors.

## 2026-08-13 — Tournament recording starts automatically and opens download preview

- Normal Orb Race Tournament launch now goes through the same explicit recording workflow as the selected-round/whole-tournament controls. The configured scope is handed to `TournamentRecordingCoordinator` before the first matchup starts; each-match auto-queues the next independent clip, while selected-round and whole-tournament stop at their requested boundary.
- Fixed preview continuation so a completed selected round cannot accidentally advance into later rounds. The existing export dialog now opens only after the selected scope or champion conclusion, with recording scope and match count shown in its metadata. `getState().screen` reports `social-preview` while that download page is open.
- `SocialBattleRecorder` now prefers MP4 but falls back to standards-supported WebM instead of forcing Chromium into preview-only mode. Tournament filenames and the download button follow the actual container (`.mp4` or `.webm`).
- Verification: focused tournament presentation/UI tests pass; full `npm test` passes `174/174`. Elevated Playwright QA under `artifacts/design-qa/tournament-recording-20260813/` starts a real whole-tournament recorder, carries all three match IDs through one segment, opens the export dialog after the champion, downloads `orb-foundry-tournament-4-round-1-semifinals-match-1-speed-vs-sticky-tournament.mp4`, and reports no console/page/request errors.

- Selected-round QA under `artifacts/design-qa/tournament-recording-20260813-whole-round/` records both first-round matches in one segment, opens the export dialog at the selected-round boundary, and downloads `orb-foundry-tournament-4-round-1-semifinals-match-1-speed-vs-sticky-round.mp4` with no console/page/request errors.

## 2026-08-13 — Antimatter post-second countdown uses five seconds

- Antimatter's third detonation cycle and every later cycle now expose the active five-second cooldown consistently in both the race HUD duration line and the large red countdown centered inside the bomb. The first two cycles remain fifteen seconds.
- Added a shared renderer helper and regression coverage for the 15-second pre-threshold state, the 5-second post-second state, and the visible `4.5S` countdown calculation. Advanced the live renderer/main cache lineage to `20260813-antimatter-countdown1/2`.
- Browser QA captured `artifacts/design-qa/antimatter-third-blast-20260813.png` after two detonations; it showed `DETONATION 4.4S`, center text `4.4`, and live state `raceAntimatterCooldownSeconds: 5`, with no console/page/request errors.

## 2026-08-14 — Poison and Lag tick rings/audio; Alex pronunciation refresh

- Poison's discrete layer ticks now carry an explicit `tick` marker on their existing expanding `raceBounceEffects` rings. Lag now emits the same expanding ring at each successful glitch tick; the gameplay tick cadence and damage values remain unchanged.
- `race-poison-tick` and `race-lag-glitch-tick` both route to the existing `orb-collision` bounce sample with no rate suppression, keeping one pop synchronized to each tick.
- Regenerated the Alex announcements with explicit phonetic speech: Fibonacci uses `Fee buh naa chee.` and Splodey uses `Splodee.`. Active/source files are `assets/audio/announcer/generated-race/race-fibonacci.mp3` and `race-mines.mp3`; hashes and spoken text are recorded in the announcer manifest.
- Advanced the live cache lineage to `20260814-poison-lag-ticks2-pronunciation1`. Focused simulation and social suites pass; full `npm test` and browser smoke remain part of final verification.

## 2026-08-14 — Orb Race Poison tick stacks and Lag cadence

- Reworked Poison from a single ramped damage channel into deterministic one-damage tick stacks: bounce one arms one tick, bounce two arms two ticks, and each cadence emits one event/ring per tick while preserving zero direct bounce damage.
- Reworked Lag to keep its two-second glitch duration, tick every `0.5s`, increase the seeded trigger chance by `10%` after each successful glitch, and quadruple per-tick damage on each later glitch. Active channels now contribute correctly to team damage/sec.
- Added replay/render state and HUD coverage for Poison tick count/per-tick damage and Lag cadence/chance/damage fields; the existing poison/lag tick audio-event routes remain intact.
- Verification: `node --test tests/simulation.test.mjs` passed; full `npm test` passed `174/174`; required Playwright client and extended Poison/Lag state smoke both passed with clean browser diagnostics.

## 2026-08-14 — Orb Race new math, weather, hacker, and miner roster

- Added Sylvester and Tetration math racers plus Rain, Hacker, and Miner utility racers to the registry, settings round-trip, Alex announcer map, HUD, renderer, and deterministic simulation snapshot.
- Rain schedules 100 five-damage drops over a five-second storm and doubles the next storm’s damage. Hacker types for three seconds every five seconds and resolves seeded blue/red/yellow/orange/black outcomes. Miner locks to a number layer for a 20-second shovel upgrade, then drills the layer down over five seconds before falling through.
- Generated and wired original GPT Image accessory sheets for the rain cloud, Hacker computer/typing hands, and Miner shovel/jackhammer. Source/final/prompt/manifest/alpha evidence lives under `assets/generated/orb-race-new-orbs-20260814-v1/`; all finals are RGBA with transparent corners and nearest-neighbor rendering.
- Generated valid Alex MP3 announcements for all five new IDs through the existing local generation script. The first sandbox speech pass produced header-only files; native macOS audio access was used to regenerate them and `afinfo` verified non-zero audio frames/durations.
- Updated cache lineage to `20260814-new-orbs4`; focused simulation/social/feature suites and full `npm test` pass `174/174`.
- Browser QA captured [Rain](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814/rain-active.png), [Hacker](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814/hacker-typing.png), and [Miner](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814/miner-drilling.png) at 1080×1920. [Diagnostics](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814/diagnostics.json) reports zero console errors, page errors, or failed requests.

## 2026-08-14 — Orb Race new-orb visual and audio refinement

- Miner now uses the complete generated miner/jackhammer sprite with the generic orb removed, a 2× larger draw footprint, and a faster visual jackhammer cadence. Simulation timing remains deterministic: 20 seconds to upgrade and five seconds to break a layer.
- Added the dedicated GPT Image Hacker hoodie-orb animation. The preserved 2×2 source is normalized into a four-frame horizontal strip at `assets/generated/orb-race-new-orbs-20260814-v2/final/hacker-orb-animation-sheet.png`; the renderer turns the hoodie toward the computer and cycles typing poses during the hack. The generated computer is now 2× larger.
- Hacker black outcomes expose a spawned `raceHackerHydrogenBomb` child (`raceOrbId: "hydrogen-bomb"`, `spawned: true`) and render the actual Hydrogen Bomb orb symbol with its countdown, rather than a timer-only circle.
- Rain's generated cloud is 3× larger and fixed to a stable ceiling anchor, independent of the orb's movement. A progress bar replaces the Rain damage/READY HUD text.
- Removed audio from `race-hacker-start`; the glitch sound plays only on `race-hacker-result`. Sylvester and Tetration number-line bounces use the boosted `race-math-power` cue.
- Cache lineage remains `20260814-new-orbs4`. New source, prompt, manifest, and alpha evidence are in `assets/generated/orb-race-new-orbs-20260814-v2/`; focused tests were added for the visual and audio contracts.
- Final visual evidence: [Hacker typing](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v2/hacker-typing-final.png), [Miner drilling](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v2/miner-drilling-final.png), and [Rain active](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v2/rain-active-final.png). Final diagnostics report zero console/page/request errors; `npm test` passes `174/174`.

## 2026-08-14 — Hacker child-orb separation and native Miner framing

- Hacker now idles on the generated forward-facing hoodie frame and uses only the generated typing frame during a hack, flipped toward the currently targeted opponent. The Hacker draw footprint is doubled while the computer remains a separate facing accessory.
- Copy and Hydrogen outcomes now create explicit `raceHackerSpawnedOrbs` children. Each child has its own normalized position, velocity, layer-aware floor, bounce counter, and renderer body; Hydrogen’s countdown follows its independent bomb orb instead of staying attached to Hacker. The copied orb replaces the former marker circle.
- Miner’s six-frame jackhammer strip is rendered at its native per-frame aspect ratio rather than being stretched wide. Its shovel/drill progress bar is doubled in width and height while simulation timings remain unchanged.
- Added render-text and deterministic simulation coverage for Hacker facing/child state and independent child motion. Cache lineage is `20260814-new-orbs4`.
- Live QA captures: [Hacker idle](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v3/hacker-idle.png), [Hacker typing/child](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v3/hacker-typing-or-child.png), and [Miner native aspect](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v3/miner-native.png). The inspected browser run reported no console or page errors.

## 2026-08-14 — Hacker legacy computer removal

- Removed the old standalone `hackerComputerSheet` draw from the live renderer. Hacker’s generated v2 typing frame is now the sole computer/typing visual, preventing the legacy computer from being layered over the new hoodie orb.
- Cache lineage advanced to `20260814-new-orbs4`; focused tests and a fresh browser typing capture were run against the updated import graph.
- Fresh post-removal capture: [Hacker typing v4](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v4-hacker-typing.png), with no console or page errors.

## 2026-08-14 — Hacker child presentation inheritance and Miner layer contact

- Removed the remaining live dependency on the old Hacker computer concept. Hacker keeps one forward-facing generated hoodie pose and mirrors that pose only toward the current hack target; no idle/typing asset swap is drawn. The old v1 computer source remains archived with `runtime: false` metadata for provenance.
- Hacker-spawned copy/Hydrogen orbs now copy the source race presentation state through a tolerant `race*` adapter and render through the normal special-orb path. Orange-outcome Slammy helpers in `raceRealitySpawns[]` use that same path, preserving copied UI, weapons, rings, bomb countdowns, and other effects while each child keeps independent deterministic physics. Hydrogen children immediately emit the existing looped countdown-siren event.
- Miner’s generated sheet is alpha-cropped per frame and bottom-anchored to the active number line. Drill frame cadence is five times faster with continuous horizontal jackhammer shifting; attached Miner vertical motion is clamped to the line so no sprite padding or bob makes it float or sink through the surface. Gameplay upgrade/drill durations remain unchanged.
- Cache lineage advanced to `20260814-hacker-children-miner5`. Focused simulation/social tests and full `npm test` pass 174/174. Fresh browser QA under `artifacts/design-qa/orb-race-new-orbs-20260814-v5/` includes Hacker forward/facing/Slammy-child and Miner planted/drilling captures plus clean diagnostics.

## 2026-08-14 — Hacker computer pose, copied-orb ramps, and Miner cadence

- Hacker now uses the generated v2 computer-facing/typing frame only during an active hack (`frame 3`), with its target-facing mirror preserved; idle uses the forward hoodie frame. The archived standalone v1 computer remains runtime-disabled.
- The parent HUD now replaces its single `HACK: ...` line with the newest outcome, so a copy reads only `HACK: COPY`. Hacker copy children render no text below them. Their source scale/ramp state is carried into an independent child, with copied Orbital satellites visible immediately, Whirlwind satellites rotating independently, and grower/Whirlwind/Orbital ramps advancing on child bounces.
- Miner’s jackhammer sprite now cycles on a deterministic `time * 240` frame clock (10× the original authoring cadence) with matching rapid jackhammer shift; the authoritative 20-second upgrade and five-second drill timings are unchanged.
- Cache lineage advanced to `20260814-hacker-children-miner6`. Focused simulation/social suites pass, and the fresh `orb-race-new-orbs-20260814-v5` Hacker/Miner captures report no console, page, or request errors.

## 2026-08-14 — Hacker child abilities and Miner drill correction

- Separated Miner’s presentation clocks: the shovel frames now advance at `time * 240`, while the drill/jackhammer frames intentionally return to the slower `time * 24` cadence. Attached Miner artwork is alpha-cropped, aspect-preserving, and embedded at the shared dynamic layer surface; the enlarged progress meter remains above the character.
- Miner now guarantees the active layer reaches zero at the end of the five-second drill contract, resolves/falls through immediately, and moves down with the top-to-bottom layer shrink rather than remaining pinned above the wall.
- Hacker now shows each completed hack result above the parent in the Draftmaster-style callout font/outline with a deterministic fade. Hydrogen’s child countdown is shown above Hacker, while the spawned child itself uses the actual Hydrogen Bomb orb and follows the normal countdown/explosion event path without destroying the Hacker carrier.
- Copied Hacker children now run a tolerant source-ability dispatch after independent physics. Sniper copies fire real source bullets and damage the Hacker team’s layers; copied visual/UI/ramp state follows the source. Hacker/Reality Slammy children render as actual red Slammy orbs, ramp damage/scale on their own bounces, and no longer inherit Hacker’s black pulse or hollow proxy treatment.
- Cache lineage is `20260814-hacker-children-miner8`. Focused `tests/social.test.mjs` and `tests/simulation.test.mjs` pass. Playwright evidence is in `artifacts/design-qa/orb-race-new-orbs-20260814-v7/` with clean browser diagnostics.

## 2026-08-16 — Orb Race Bombs class and new deterministic orb mechanics

- Added the `BOMBS` class/title/announcer route for `hydrogen-bomb`, `antimatter-bomb`, `time-bomb`, and `reality-bomb`. Multiple bomb IDs collapse to the single `BOMBS` title and `intro-race-group-bombs` Alex cue; individual bomb selections retain their own names.
- Added `breaker`, `square-root`, `progressive`, and `random` to the stable Orb Race registry, settings IDs, simulation state, HUD, renderer emblems, replay fields, and live render-text output. Breaker is fixed 1 damage with +1 percentage point crit chance per bounce and half-of-original-layer-HP-plus-one crits; Square Root roots each active layer hit (including exactly two HP) and breaks at/below one; Progressive boosts 1 → 5 → 25 ... every 15 seconds, then every 5 seconds after use two; Random rolls 1..X and increases X by 5 on every bounce.
- Added focused regression coverage for all four mechanics, BOMBS team display parts, generated announcement manifests, and the existing Orbital combo cue convention (`intro-race-combo-speed-orbital`).
- Generated real Alex MP3 clips with non-zero decoded frames for `race-group-bombs`, `race-breaker`, `race-square-root`, `race-progressive`, and `race-random`, preserving matching source copies. Existing bomb clips were regenerated through the same workflow.
- Advanced browser/import/audio cache lineage to `20260817-miner-anchored1` for the Miner visual follow-up. Shovel animation now advances at one-third its prior cadence, attached Miner art is bottom-anchored to the moving layer surface, and a broken layer keeps the Miner in a non-drilling falling state. Focused and full test results plus fresh Miner QA are recorded below.

## 2026-08-17 — Miner visible layer contact and continuous drilling

- Miner’s authoritative dig surface starts at the visible active number-line edge and moves to the next line as the layer shrinks, so its bottom-anchored sprite stays planted. The shovel frame cadence is now `time * 40`, frame 0 excludes the detached far-right alpha sliver, and a broken layer immediately retargets the next active wall without a falling state.
- Cache lineage advanced to `20260817-miner-continuous2`. Focused suites and full `npm test` pass 174/174. The required browser client reports no page/console errors. Caged-Miner QA reached planted, drilling, and next-layer states with no falling state: [planted](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-continuous-planted.png), [drilling](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-continuous-drilling.png), and [continuous next layer](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-continuous-next-layer.png). The client smoke screenshot is [client smoke](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/miner-client-continuous2-final/shot-1.png).

## 2026-08-17 — Miner slower shovel and jackhammer presentation

- Slowed the shovel frame clock another 3× from `40` to `40 / 3`. Slowed drill-frame cycling and its bob/side shift 3× as well (`24 / 3` and `12 / 3`), without changing deterministic gameplay upgrade or layer-drill durations.
- Tightened the remaining per-frame source crops around the authored Miner silhouette, removing disconnected edge specks from the shovel and drill frames while preserving the generated source asset.
- Cache lineage advanced to `20260817-miner-slower3`. Focused suites and full `npm test` pass 174/174. The required browser client and caged-Miner QA report no page/console errors; Miner remains planted, continues in `drill` after each layer break, and never enters `falling`. Final captures: [planted](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-slower3-crop2-planted.png), [drilling](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-slower3-crop2-drilling.png), and [next layer](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-slower3-crop2-next-layer.png). [Client smoke](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/miner-client-slower3-crop2/shot-1.png).

## 2026-08-17 — Purple Sun

- Added stable Orb Race ID `purple-sun`, displayed as `PURPLE SUN` and announced as `Purple Sun`. It follows Blue Sun's timed power-cycle, power-level HUD, and strong-math pacing, but uses a purple theme and emits one large, straight downward beam instead of eight rotating beams.
- The deterministic simulation keeps the beam projectile-only: it has no ordinary bounce damage, resolves the active layer intersection from the orb's current center to the number-line surface, applies beam damage over time, and advances its damage after each completed active cycle. Replay/render text exposes active state, color charge, power level, beam damage, and normalized beam endpoints.
- Renderer/HUD work is in `src/social-renderer.js`: the body color ramps through the purple theme with power level (and smooth charge progress), the beam is clipped to the active board and ends at the actual number-line surface, and the HUD mirrors Blue Sun's `POWER LEVEL` text while reporting beam damage. `src/main.js`, `src/renderer.js`, `src/config.js`, `src/social.js`, `src/simulation.js`, `src/audio.js`, `src/orb-race.js`, and `index.html` use cache lineage `20260817-purple-sun2`.
- Generated valid Alex announcement clips through the local race-announcement workflow: active `assets/audio/announcer/generated-race/race-purple-sun.mp3` and preserved source `assets/audio/source/race-announcer-generated/race-purple-sun.mp3`. Both are non-silent MPEG audio files; no GPT image asset was needed because the requested visual is a Blue Sun-style code-rendered beam.
- Verification: `node --test tests/simulation.test.mjs`, `node --test tests/social.test.mjs tests/features.test.mjs`, and full `npm test` pass. Playwright QA at 1080×1920 is recorded in [active-beam shot](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/purple-sun-race-20260817-high-layers/shot-0.png), [purple cooldown shot](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/purple-sun-race-20260817-high-layers/shot-1.png), with normalized active-beam state in [state-0](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/purple-sun-race-20260817-high-layers/state-0.json). The inspected browser run had no page, console, or asset errors.

## 2026-08-17 — Purple Sun purple theme and eight-beam equivalence

- Changed the Purple Sun registry theme to dark/bright purple and made its HUD use the same `POWER LEVEL` text as Blue Sun. Its body now ramps through the purple palette by power level, with the existing charge progress providing a smooth intra-level transition.
- Set one Purple Sun beam to `8 × Blue Sun's per-laser damage` at level one, and scaled every subsequent power gain by the same factor. Purple Sun remains projectile-only and still uses the actual downward number-line intersection.
- Bumped browser/audio cache lineage to `20260817-purple-sun2`. Focused simulation/social tests cover purple theme colors, power-level body scaling, matching HUD text, and exact eight-beam damage equivalence; full `npm test` passes 174/174.

## 2026-08-17 — Purple Sun laser HUD and Pancake syrup profile

- Replaced Purple Sun's generic weapon-damage HUD line with `LASER: <beam>/SEC`, keeping the matching Blue Sun-style `POWER LEVEL` line below it. Its projectile-only eight-beam-equivalent simulation damage is unchanged.
- Reworked Pancake contact damage to a minimal `1 damage/second` while a stack rests on the number line. Syrup patches start at `2 damage/second` (two baseline Parasites), and each patch records deterministic damage/duration/parasite-equivalent scales that grow with Pancake flips and stack damage. Butter landings still leave butter only.
- Syrup patch rendering now uses those scales for a visibly larger mark while preserving the line cutoff and active-layer cleanup behavior.
- Advanced the browser/import/audio cache lineage to `20260817-purple-sun3`. Focused simulation/social/feature tests pass; full `npm test` and live 1080×1920 QA are recorded below.
- Live QA: [Purple Sun laser HUD](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/purple-sun-race-20260817-laser-hud/shot-0.png) shows `LASER: 8000/SEC` and `POWER LEVEL: 1`; [Pancake syrup profile](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/pancake-syrup-profile-20260817/shot-0.png) shows the clipped syrup mark after the first landing. Both Playwright runs produced no page, console, request, or asset-error files.

## 2026-08-17 — Purple Sun impact rings and Square Root two-health exception

- Purple Sun now emits a deterministic three-ring purple expanding-circle effect at each active beam/number-line contact. The effect is anchored to the simulation beam endpoint, fades over `0.72s`, and is rendered independently of the beam body.
- Square Root continues to apply `sqrt(current layer health)` damage, but its only exception is exactly `2 HP`, where it applies `1.46` damage and leaves a sub-one remainder; the next contact breaks that remainder. The √ cue remains emitted on every qualifying bounce.
- Advanced the browser/import/audio cache lineage to `20260817-purple-sun4`. Focused simulation/social tests and full `npm test` pass 174/174.
- Live QA: [Purple Sun impact rings](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/purple-sun-race-20260817-impact-rings/shot-0.png) shows the purple beam, expanding contact rings, and `LASER: 8000/SEC` HUD at 1080×1920; the Playwright run produced no page, console, request, or asset-error file.

## 2026-08-17 — Square Root remainder, Lazer interval ramp, Twins, and Scissor

- Corrected Square Root to replace each active layer with its mathematical square root instead of applying the root as damage. A 10,000 HP layer now becomes 100 HP (9,900 removed), a 100 HP layer becomes 10 HP, and sub-one values break on the next hit; the established exact-two-HP exception remains covered.
- Reworked Lazer so the body remains upright while only its single beam rotates. Beam damage is one discrete damage point per contact tick; interval progression is `1.0s → 0.9s → 0.8s ...`, clamped at `0.00000001s`, and the first contact waits for the full interval rather than damaging at time zero.
- Added deterministic `twins`: two blue, independently rendered/simulated bodies. The away twin teleports after five seconds, heals the opponent’s active layer by its current damage for ten seconds while increasing its damage, then returns; the home twin keeps bouncing and scaling.
- Added deterministic `scissor`: zero normal damage, first number-line contact splits the active layer into two equal tilted pieces and emits `race-scissor-split`. The renderer shows a native three-frame closed/open/impact scissors animation at the split point and suppresses the generic zero-damage HUD line.
- Generated/cleaned Scissor asset: source `/Users/maxli/.codex/generated_images/019f5dea-5bae-7f93-88d0-cb62c6178ecc/exec-035f6c7a-dfab-4927-9988-266f90627756.png`; final `/Users/maxli/Documents/ball-battle-simulator/assets/generated/orb-race-scissor-20260817-v1/final/scissor-sheet.png`; prompt/manifest/alpha validation are in the same versioned folder. Final is RGBA with transparent corners and three equal 724×724 frames.
- Cache lineage advanced to `20260817-twins-scissor-laser12` across the browser import/audio graph. Focused simulation/social/feature suites pass; full `npm test` and browser QA are recorded with this entry.
- Final verification: `npm test` passes 174/174 and the affected modules pass `node --check`. Inspected 1080×1920 captures cover [Square Root 10K](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-twins-scissor-20260817/square-root-10k.png), [Lazer rotation/timing](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-twins-scissor-20260817/lazer-rotating-beam.png), [Twins healing](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-twins-scissor-20260817/twins-healing-visit.png), and corrected [Scissor impact](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-twins-scissor-20260817/scissor-impact-fixed.png). Browser diagnostics are clean; the Scissor fix prevents the opponent’s board from inheriting the owner’s tilted-layer geometry.

## 2026-08-17 — Lazer and Sun impact-ring pass

- Lightened Purple Sun's base Orb Race theme to `#a855f7` while retaining its bright `#f0abfc` accent. Removed the white center marker from Purple Sun beam impacts; the beam still ends at the deterministic number-line intersection and its purple rings remain visible.
- Added deterministic expanding-circle impacts to Blue Sun's eight physical ray contacts and to Lazer's beam contact/ticks. Lazer starts with two rings and gains additional rings as its `0.01` interval level falls, capped at eight; more frequent ticks therefore produce denser impact feedback without changing damage.
- Lazer's interval level is now the source of truth for the HUD and replay seam (`1.00 → 0.99 → … → 0.00000001`), while the orb body stays upright and only the beam rotates. Square Root remains on the strong-math bounce cue.
- Twins' visiting blue orb now runs the regular fixed-step bounce solver on the opponent's side and heals only on its own number-line contacts during the ten-second visit; it returns to the owner's side afterward.
- Added valid Alex announcements: [Twins](/Users/maxli/Documents/ball-battle-simulator/assets/audio/announcer/generated-race/race-twins.mp3) and [Scissor](/Users/maxli/Documents/ball-battle-simulator/assets/audio/announcer/generated-race/race-scissor.mp3), with preserved source copies in `/Users/maxli/Documents/ball-battle-simulator/assets/audio/source/race-announcer-generated/`.
- Browser QA: [Purple Sun](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-impact-rings-20260817/purple-sun-active.png), [Blue Sun](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-impact-rings-20260817/blue-sun-active.png), [Lazer contact rings](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-impact-rings-20260817/lazer-impact.png), and [Twins visit](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-impact-rings-20260817/twins-visit.png) were inspected at 1080×1920. [Diagnostics](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-impact-rings-20260817/diagnostics.json) reports no console, page, or request errors.
- Cache lineage advanced to `20260817-twins-scissor-laser12`. `npm test` passes 174/174; focused simulation/social suites pass.

## 2026-08-17 — Twins opponent-lane healing render

- Corrected the visiting Twins presentation so the healing child is no longer drawn inside the owner’s board. After both portrait boards or long-form tracks are painted, `src/social-renderer.js` composites the child into the simulated opponent team’s track using that track’s own world transform, clipping, trail, bounce effects, and healing indicator. The owner board keeps only the home Twin while the visiting Twin remains a separate blue body.
- At teleport, `src/simulation.js` now enters the child beside the opponent’s current position, on the opponent’s current vertical path, with the opponent’s current velocity. The child remains an independent fixed-step physics body and heals only on its own opponent-lane number-line contacts. `race-twins-teleport` now records target lane and entry/target coordinates for replay and QA.
- Added simulation assertions for opponent-lane entry and near-opponent placement, plus renderer assertions for post-board portrait/long-form compositing and a direct visiting-entry helper check. Cache lineage remains `20260817-twins-scissor-laser12`.
- Live QA: [Twins healing on opponent board](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-impact-rings-20260817/twins-visit.png) shows the home Twin in the upper board and the healing Twin beside the opponent orb in the lower board. Browser diagnostics remain clean.

## 2026-08-17 — Twins healing cue and separated colors

- Routed every deterministic `race-twins-heal` contact to the existing `forge-item-pickup` sample with no additional rate suppression, so each healing tick has an audible Forge pickup cue.
- While the Twins are separated, the home/damage Twin uses a red body and the visiting/healing Twin uses a green body. Both return to their normal blue visual when the healing visit ends.
- Advanced the browser/import/audio cache lineage to `20260817-twins-scissor-laser12`; focused and full test results are recorded after verification.
- Verification: `node --test tests/social.test.mjs`, `node --test tests/simulation.test.mjs`, and `npm test` all pass (174/174). The clean browser capture is [Twins separated colors](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-impact-rings-20260817/twins-visit.png); diagnostics report no console, page, or request errors.

## 2026-08-17 — Twins random healing entry and stale visual reset

- Changed the visiting Twin to enter the opponent's active lane at a deterministic seeded random point with its own heading and bounce arc. It no longer spawns beside, follows, or inherits the opponent's position/velocity; it remains a separate physics body and heals on its own number-line contacts.
- Every healing teleport and return clears the child's previous trail points, impact rings, rebound state, sticky/freeze state, and bounce flash before rendering the new visit. Bounce and damage ramps are preserved, while newly generated effects during the current visit remain visible.
- `race-twins-teleport` now includes `spawnMode: "random-opponent-lane"` and `independent: true`; `raceTwinTeleportCount` remains monotonic. Entry coordinates use `sim.raceRng` for deterministic replay.
- Cache lineage advanced to `20260817-twins-scissor-laser12`. Focused simulation/social tests cover seeded in-lane entry, independent motion/healing, and removal of stale injected trail/effect history on the second teleport.
- Verification: focused simulation/social suites pass; full `npm test` and clean Playwright/visual Twins QA are recorded with this entry.

## 2026-08-17 — Separated red Twin damage boost

- The red home Twin now deals `2×` its normal scaled layer-contact damage while the pair is separated. The green visiting Twin remains healing-only and keeps its independent opponent-lane bounce behavior.
- HUD and `render_game_to_text` expose the doubled red damage value; paired Twins remain unchanged.
- Cache lineage remains `20260817-twins-scissor-laser12`. Focused simulation/social tests cover paired versus separated impacts; `npm test` passes 174/174.
- Live QA: `artifacts/design-qa/orb-race-impact-rings-20260817/twins-visit.png` shows the red damage Twin and green healing Twin with clean browser diagnostics.

## 2026-08-17 — Square Root displayed-two-health break fix

- Added `squareRootDamageForLayerHealth` as a separate low-health rule. Mathematical square-root damage remains unchanged above two health; any actual remainder at or below two health uses `1.46`, including `sqrt(3) ≈ 1.732` even though the HUD rounds it to `2`.
- The exact sequence `9 → 3 → sqrt(3) → 0.272 → 0` now clears the layer on the next bounce after the 1.46 landing, with the normal `race-layer-break` event. Existing exact-two-health and 10,000-health cases remain covered.
- Cache lineage advanced to `20260817-twins-scissor-laser12`.

## 2026-08-17 — Scissor split persistence across layer transitions

- Removed the global-current-layer filter from tilted-piece lookup and renderer compositing. Every split layer now retains its own piece health; a surviving half cannot regrow when Scissor advances.
- Scissor physics remains scoped to the current layer, so after falling through a broken half it only splits the new layer it reaches.
- Added a deterministic simulation regression for split → half break → fall → split next layer. Cache lineage advanced to `20260817-twins-scissor-laser12`; `npm test` passes 174/174.

## 2026-08-17 — Lazer edge attachment and Scissor physical-layer camera follow

- Lazer's ray now begins at the orb perimeter and exposes its origin/attachment metadata, while its angular integration remains smooth at one complete orbit per five seconds.
- Changed Lazer's initial damage interval to `0.75s`; each qualifying bounce reduces the interval by `0.01s`, retaining the minimum clamp and matching impact-ring scaling.
- Kept every live Scissor half per layer in the physical/rendered tilted-layer map. An untouched half can still receive a bounce and break after Scissor has advanced through the other half; a later Scissor split only affects the layer it reaches.
- Long-form camera progress now follows member-level layer overrides, allowing the camera to follow a leading Scissor/winning orb even while a previous split half remains intact.
- Added deterministic simulation/social regressions for the new Laser contract, persistent-half interaction, and member-aware long-form camera progress. Cache lineage is `20260817-twins-scissor-laser12`.

## 2026-08-17 — Lazer interval levels and tilted-layer underside physics

- Slowed Lazer's continuous rotation to an exact eight-second revolution. The underlying damage interval now starts at `0.1s` and decreases by `0.001s` per bounce, while the HUD/replay level is discrete (`1 → 2 → 3`) and no longer displays seconds.
- Added an unsuppressed `race-laser-tick` bounce-sound route with a burst voice budget so each rapid interval hit can overlap its own bounce cue.
- Added persistent tilted-piece underside collision handling. When a racer is below a surviving split half, the piece now owns the physical bounce and damage contact; Slammy no longer bounces from a generic top wall without damaging the tilted layer.
- Added focused simulation/social audio regressions. Cache lineage is `20260817-twins-scissor-laser12`; full verification follows after the focused suite and browser smoke run.

## 2026-08-18 — Lucas, Phase Three Sun, and Professor

- Added Lucas (`Lₙ`) with deterministic Lucas-sequence damage, Phase Three Sun with eight oversized yellow rays at 2× Blue Sun damage and 1.25× per-use beam growth, and Professor with seeded five-second random math-form transformations.
- Added Alex announcers and event routes for all three IDs, regenerated the existing new-orb Alex clips through the same valid local voice pipeline, and advanced the browser/audio cache lineage to `20260818-lucas-phase-three-professor1`.
- Added picker descriptions, HUD/replay state, renderer visuals, Phase Three Sun impact effects, Professor form proxying, and focused roster/audio/render assertions. No new GPT image assets were needed.
- Verification: `node --test tests/simulation.test.mjs tests/features.test.mjs tests/social.test.mjs` and `npm test` both pass 174/174. Playwright captures are in `artifacts/design-qa/orb-race-lucas-phase-three-professor1/`, `...-active/`, and `artifacts/design-qa/orb-race-professor-20260818/`; no console/page/request error files were produced.

## 2026-08-20 — Professor roulette, Sun Orbs, Trifecta, and Gravitator

- Professor now runs a seeded five-form roulette with a visible 0.2-second ball cycle, then commits a random math orb for five seconds; the pool includes Lucas, Sylvester, Tetration, Super X^X, and the existing math forms rather than falling back to Quadratic.
- Renamed the stable `phase-three-sun` display to THE SUN and added Phase Two Sun (orange eight-beam sun with a three-second 25%-damage burn), Trifecta (zero body damage plus a one-third-health shockwave every third layer hit), and Gravitator (pull charge followed by deterministic wall-to-layer shuttling).
- Added the SUN ORBS group and Alex announcements/routes for The Sun, Phase Two Sun, Trifecta, Gravitator, and the group announcement. Generated clips live under `assets/audio/announcer/generated-race/` with preserved source copies under `assets/audio/source/race-announcer-generated/`.
- Added renderer/HUD/replay presentation for roulette balls, Phase Two burn/lasers, Trifecta shockwaves, and Gravitator pull state. Cache lineage is `20260820-professor-suns-trifecta-gravitator2`.
- Focused simulation, feature, and social suites pass. Playwright QA captured `artifacts/design-qa/orb-race-new-orbs-tournament-portrait.png` and `artifacts/design-qa/orb-race-professor-new-orbs.png`; browser console/page diagnostics reported zero errors.

## 2026-08-20 — Sun layer clipping and fixed Trifecta thirds

- Sun, Phase Two Sun, and Phase Three Sun rays now share a physical layer clip derived from the simulation's `hitLayer`/`layerIndex`; thick beam caps stop at the contacted number line instead of visually bleeding through it. Wall/viewport contacts retain their existing behavior.
- Trifecta shockwaves now use each layer's original maximum strength divided by three, so every layer takes exactly three shockwaves to break rather than repeatedly dividing the remaining health. Trifecta is included in the very-strong math speed profile.
- Browser/import/audio cache lineage is `20260824-sun-ray-rgb-professor2`. Focused simulation/social tests and the full `npm test` suite pass 174/174.
- Live Playwright QA: `artifacts/design-qa/sun-trifecta1/phase-two-battle.png` and `sun-battle.png` capture active Phase Two/The Sun beams at 5.2s; `phase-two-battle` reports `phaseTwoSunActive: true` and `trifectaShockwaves: 2`. The browser reported zero console errors. The bundled game client remained blocked by macOS Chromium `bootstrap_check_in`; official Playwright completed the capture.

## 2026-08-24 — Long-form Sun alignment, RGB roulette, and Professor variety

- Fixed the long-form transform seam for all Sun variants. The Sun, Phase Two Sun, and Purple Sun now use the same normalized ray endpoint mapping as Blue Sun, preserving orb attachment and physical layer contact in the reflowed 1920×1080 tracks.
- Added seeded RGB color roulette for the last one second of each five-second cycle: five 0.2-second visual frames, then a committed non-repeating color. RGB now uses the Speedster-style speed ramp and a 2× Grower ramp; Grower itself advances at `0.05` per bounce (1.25×).
- Professor now uses the very-strong math speed profile and a seeded Fisher–Yates shuffle of its full math pool for each roulette spin, so it no longer deterministically lands on `x^x` first. Reality Bomb children are independent full-size Slammy racers and retain Slammy damage/scale behavior.
- Cache lineage advanced to `20260824-sun-ray-rgb-professor2`. Focused simulation/social suites pass; live evidence is in `artifacts/design-qa/sun-ray-rgb-professor2/` for Phase Two Sun, The Sun, and Purple Sun. Playwright reported zero console errors.

## 2026-08-24 — RGB wall reflection, Gravitator layer pull, and new Orb Race roster

- Hardened RGB side-wall physics to reflect excess horizontal travel through the wall boundary instead of clamping a high-speed orb to the edge, removing the visible lag/teleport stutter. The behavior remains deterministic and preserves the normal bounce event.
- Reworked Gravitator so the active number-line offset follows the orb's contact and eases toward it in shared team state. The orb remains under normal fixed-step physics; the layer, renderer, long-form track, replay frame, and pull event now move together.
- Added Super Slammy (`super-slammy`, dark red, +5 damage per bounce), Lucas Sequence (`lucas`, stable replay ID with dark-green `Lₙ` presentation and Lucas damage), and Piercer (`piercer`, dark gray, +0.2 damage per hit and a full live-layer sweep on every number-line contact). Added picker groups, HUD descriptions, replay fields, and focused deterministic tests.
- Generated valid Alex announcements through `scripts/generate-race-announcements.mjs --new-orbs-only`: `assets/audio/announcer/generated-race/race-super-slammy.mp3`, `race-lucas.mp3`, and `race-piercer.mp3`, with preserved source copies under `assets/audio/source/race-announcer-generated/`. The new clips were validated as decodable non-header-only MP3s.
- Cache lineage advanced to `20260824-gravitator-shuttle1`. Focused feature/social/simulation suites and full `npm test` pass `174/174`. Fresh Playwright validation loaded the new import/audio graph with zero console errors and captured [RGB vs Gravitator in battle](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/rgb-gravitator-new-orbs1/rgb-gravitator-in-battle.png); the browser requested the new announcers and cache-busted modules successfully.

## 2026-08-24 — Gravitator reaches a stable top-wall shuttle

- Gravitator now pulls its active number line monotonically toward the arena ceiling, with a radius-based stopping distance that remains physically valid in both portrait and long-form lanes.
- Its launch arc uses the pulled line and a small deterministic overshoot so the orb visibly contacts the top wall, then rebounds repeatedly between that wall and the pulled layer. Pull events expose the target offset and `shuttleLocked` state; no orb-position overwrite or teleport is used.
- Added regression coverage for continued pull, a real ceiling chamber, repeated top-wall and number-line contacts, and the stable shuttle lock. Cache lineage is `20260824-gravitator-shuttle1`.
- Verification: `npm test` passes 174/174. Playwright QA captured the live [RGB vs Gravitator canvas](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/rgb-gravitator-shuttle1/rgb-gravitator-live-canvas.png) with zero console errors and cache-busted module requests.

## 2026-08-25 — Tsar Bomb, Piercer ramp, and All In One

- Added Orb Race `tsar-bomb` and `all-in-one` registrations, picker descriptions, compact black/white/red HUD treatments, replay state, and cache-busted imports. Tsar Bomb has a 90-second Hydrogen-style detonation with a Reactor pulse every 8 seconds and zero ordinary bounce damage. All In One composes the current roster, powers up every 15 seconds for 5 seconds, applies a `×10`-per-contact ramp on both wall and number-line bounces, and carries its own Hydrogen-style countdown.
- Changed Piercer's per-contact damage gain from `+0.2` to `+0.75` while retaining its full live-layer sweep.
- Added/generated valid Alex announcements for Tsar Bomb and All In One through `scripts/generate-race-announcements.mjs --new-orbs-only`; live clips are under `assets/audio/announcer/generated-race/` and preserved generated sources are under `assets/audio/source/race-announcer-generated/`. Bomb lifecycle routes use the existing Hydrogen siren/explosion/flash samples; Tsar reactor uses the black-hole impact cue and All In One activation uses the math-power cue.
- Focused suites pass: `node --test tests/simulation.test.mjs tests/features.test.mjs tests/social.test.mjs`. Full `npm test` and Playwright browser smoke remain the final verification step for this entry.

## 2026-09-20 — Document deterministic announcer routing

- Documented announcer coverage as a requirement for every YouTube battle recording.
- Defined context-aware routing: standard announcer cues for ordinary battles,
  split-wise cues only for genuinely split/team presentations, and specialized
  mode/matchup/phase cues only when their context matches.
- Documented deterministic generic fallback behavior so a missing specialized
  clip does not silently remove announcer coverage.

## 2026-09-20 — Cap Shorts at three layers

- Reduced the automated Short layer profile to three ascending layers and added
  a validated `maximumShortLayers` contract so future configuration changes
  cannot exceed the requested cap.
- Updated the YouTube publishing documentation, README quality summary, and
  publishing tests to cover the three-layer maximum.

## 2026-09-20 — Make the YouTube upload checklist mandatory

- Added a per-upload checklist covering the original two-day cooldown,
  allowlisted roster, multi-orb support, duration minimums, close-battle gate,
  500-HP floor, ascending layers, and the three-layer Short maximum.
- Added a hard announcer gate: the exporter waits for announcer assets, records
  announcer proof in metadata, and refuses to upload unless an announcer
  sequence with at least one spoken cue was captured. Split-wise audio remains
  valid only for a genuinely split presentation.
- Added a defense-in-depth artifact validator before transcoding/upload so a
  mismatched duration, layer profile, metadata contract, run tag, or announcer
  proof stops the run.

## 2026-09-20 — Preflight compliant YouTube generation

- Added a generation-side contract check before the browser recorder starts:
  the selected roster, two non-empty teams, close-battle result, duration,
  ascending layer profile, HP floor, and announcer requirements must already
  match the approved plan.
- Kept the runtime artifact gate as a second safety check, so an unexpected
  recording mismatch still stops the slot before transcode or upload.

## 2026-09-20 — Reliable scheduled YouTube quality pipeline

- Changed the YouTube workflow to render a morning batch, upload videos privately, and set YouTube `publishAt` timestamps for noon and 3:00 PM Pacific. This avoids missing a slot when GitHub Actions starts late.
- Added deterministic daily roster windows and a two-day orb cooldown, with optional 1v1 and 2v2 team formats. Plans are quality-gated by a deterministic Orb Race preflight that requires a finished close battle.
- Added 25-second Short and 60-second long-form minimum recording durations, 500-HP minimum layer validation, ascending layer profiles, and higher shared layer HP for stronger estimated matchups.
- Extended exports and metadata for multi-orb teams and added the contract to `docs/YOUTUBE_PUBLISHING.md`, `README.md`, and `config/youtube-publishing.json`.
- Full `npm test` passes all 181 tests. Playwright browser smoke loaded the updated app with no console/page errors, and `npm run youtube:validate` confirms the three-slot contract is valid.

## 2026-09-20 — Add manual YouTube batch recovery

- Added a `batch` manual-dispatch option so a missed scheduled run can render and upload all three daily videos immediately while preserving run-tag duplicate protection.
- Hardened hosted video export with CI-safe Chromium flags, retryable profile cleanup, consistent YouTube artifact roots, informative upload errors, and the required YouTube resumable-upload protocol.
- Verified recovery run `35542850153` uploaded three videos successfully and scheduled them for September 21 at 12:00 PM/3:00 PM Pacific.
