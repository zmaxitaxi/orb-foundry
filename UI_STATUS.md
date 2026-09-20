# Orb Foundry UI Status

## Purpose

This is the handoff document for agents working on setup controls, menus, gameplay HUDs, canvas composition, responsive layouts, previews, and browser-facing presentation.

UI work may display simulation state but must not change gameplay outcomes. Keep gameplay decisions in `src/simulation.js`.

## Primary Ownership

- `src/main.js`: menu, setup dialog, mode selection, roster/team controls, launch flow, runtime loop, preview, and `render_game_to_text`.
- `src/social-renderer.js`: dedicated recording canvas, Orb Race boards, long-form camera, matchup text, HUD stats, projectiles, effects, and winner presentation.
- `src/renderer.js`: shared arena and Classic drawing helpers.
- `src/social.js`: export formats, captions, stat summaries, and presentation metadata.
- `src/presentation.js`: cosmetic themes and visual profiles.
- `src/presentation-timeline.js`: deterministic intro/callout timing.
- `styles.css`: menu and setup styling only; the recorded game is drawn on canvas.
- `index.html`: application shell and browser entry cache key.

## Current Player Flow

`Menu → profile/setup → Social Battle canvas → winner → preview`

The recorder captures only `#socialCanvas`. Browser chrome, menus, setup controls, and developer tools must remain outside the exported video.

## Setup UI

The setup currently supports:

- Gameplay mode selection.
- Classic's registry-driven 48-orb roster in two independent team pickers; each team can select multiple orb IDs and copies.
- Classic per-team-orb Regular/Slow/Fast speed, fading-trail, solid-trail, collision-damage, and quantity controls.
- Classic per-team-orb size control: `classicTeamOptions[teamIndex][orbId].orbScale` with MINI, COMPACT, REGULAR, LARGE, and EXTRA LARGE; REGULAR is the default. The legacy `classicOrbOptions[orbId].orbScale` field remains supported for old URLs.
- Classic's presentation-only black arena toggle and Hydrogen Bomb health control (1–1,000,000).
- World Cup country selection.
- Orb Race and Classic team builders with per-orb quantities.
- Per-orb scaling-damage, fading-trail, solid-trail, orb-size, and supported combo toggles.
- Short-race and long-race selection.
- Up to 50 Orb Race layers and preset autofill based on final-layer health.
- Optional target message, target announcement, and classic matchup announcement toggles.
- Optional tilted layer and selected tilted-layer index.
- Arena modifier, arena geometry, cosmetic background, seed, export format, and FPS.
- Compact `?cfg=` settings links.

The Orb Race picker is intentionally wide and grid-based because the roster is large. Preserve each orb's existing card appearance and option expansion behavior.

## Canvas Formats

- Portrait: 1080×1920.
- Square crop: 1080×1020.
- Landscape crop: 1920×1024.
- Orb Race long form: 1920×1080.

### Portrait Orb Race

- Two equal stacked boards.
- Large launch chamber, numbered layers, and contained checkerboard finish band.
- Matchup name/`VS` treatment between boards.
- Top-team stats at upper-left and bottom-team stats at lower-right.
- Numbers use fit-to-box typography for very large values.

### Long-form Orb Race

- Two tall tracks side by side inside one composition.
- A single smooth camera follows the leading racer; a trailing racer may leave the viewport.
- Seven layers are intended to remain readable at once.
- Layer cards are slim rectangles with visible white gaps.
- Headers stay visually fixed in the composition while the race world pans.
- Visible number-wall coordinates must match the simulation's collision coordinates exactly.

## Current Visual Contracts

- Cream background, strong black outlines, bold condensed-looking text, bright solid orb colors, and pixel-style assets.
- Race numbers must remain fully visible inside their predetermined boxes.
- Cleared layers render blank white with no remaining number or line.
- The checkered finish pattern stays contained inside its finish box.
- Avoid modal popups and race cards during gameplay.
- For three or more team members, use grouped team names and aggregate simultaneous damage-per-second rather than tall per-orb stat stacks.
- Commander, Shrapnel, Absorber, Architect, Snowball, Draftmaster, Berserker, Godzilla, Black Hole, Meteor, Jackpot, Batman, Flash, and other special racers have custom drawing paths. Do not replace them with generic symbols without checking their renderer branches.

## Recent UI State

- Commander renders a full-radius orb and its red/blue support drones hover above it.
- Absorber uses a pink core, absorbed-color ring, actual absorbed-orb badges, and Black Hole-specific HUD/effects when applicable.
- Long-form cards and bounce surfaces are aligned, with restrained camera movement.
- Sniper displays damage and total shots while respecting the scaling-damage visibility option.
- The setup dialog maintains its scroll position when opening lower roster options.

## Browser Cache Contract

Browser modules use explicit `?v=` query strings. When changing a browser-loaded module, update the relevant import chain and the `index.html` entry key. The current entry lineage is `20260811-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio3-race-blue-sun1-team-colors3-footer-copy6-race-hud1-virus-health1-classic-top-stats1-side-footer-checkers1-longform-blue-sun3-necro-teleport-batman-batarang1-batman-grapple3-reactor-blue1-split-border1-classic-boss-health-apple-hive3-no-health-control`; supporting imports retain their own intentionally independent lineages, including Orb Race `20260806-speed-profile4`.

Do not blindly replace unrelated cache keys; update only the affected chain and adjust the corresponding assertion in `tests/social.test.mjs`.

## UI Testing Responsibilities

- Renderer, captions, audio lookup integration, and export helpers: `tests/social.test.mjs`.
- Setup normalization and URL round trips: `tests/features.test.mjs`.
- Use Playwright Chromium against a local HTTP server after canvas/setup changes.
- Check the relevant DOM/runtime state, `render_game_to_text`, page errors, console errors, asset responses, and the actual `#socialCanvas` dimensions.

## Orb Race Long-Form Side Footer (2026-08-11)

- Long-form Orb Race no longer places `Like & Subscribe!` or `#OrbBattleGroundSimulator` over the finish band. Team 1 copy is in the outer left margin and Team 2 copy is in the outer right margin; portrait finish copy is unchanged.
- The long-form checker flag uses 48 columns for a denser finish-line pattern. The live social-renderer/entry cache lineage ends in `side-footer-checkers1`.
- `node --check` and `node --test tests/social.test.mjs` pass. Playwright evidence is in `artifacts/design-qa/longform-side-footer-checkers1-correct/` with no browser error file. Full `npm test` is 85/86 because the existing unrelated `tests/simulation.test.mjs:1111` top-wall-hit threshold still fails.

## Orb Race Reactor Blue Theme (2026-08-11)

- Reactor's body and charge ring now start at its blue theme color and ramp toward the existing light-blue accent as charge increases. Reactor HUD/title text remains blue.
- The live social-renderer/entry cache lineage ends in `reactor-blue1`.
- Focused social tests and Playwright verification pass; the capture is in `artifacts/design-qa/reactor-blue1/` with no browser error file. Full `npm test` passes 93/93.

## Orb-Themed Arena Borders (2026-08-11)

- Orb Race portrait boards and long-form tracks now use each team’s primary orb theme for its outer frame, so the two arena halves are immediately distinguishable without changing layer or finish-line outlines.
- Classic’s shared arena perimeter is split into two equal color runs using the two fighters’ orb themes; the existing Classic team-color toggle restores the neutral border when disabled.
- Added renderer helper coverage for race team border colors and Classic orb-theme/fallback colors. Advanced the live entry/social-renderer cache lineage to `...-reactor-blue1-split-border1`.
- Verification: `node --check src/social-renderer.js`, `node --check src/main.js`, and `node --test tests/social.test.mjs` pass. Playwright captures are in `artifacts/design-qa/split-border1-race-distinct/` and `artifacts/design-qa/split-border1-classic/` with no reported browser errors. The current full suite is 91/93 because of unrelated shared-worktree failures in `tests/features.test.mjs` and `tests/ui-setup.test.mjs`.

## Classic Orb Foundry Top Stat HUD (2026-08-10)

- Classic's top matchup band now shows Slammy `DAMAGE`, Unarmed `DAMAGE · SPEED`, and Duplicator `DUPLICATES` on the corresponding team side. The existing Orb Race HUD path is unchanged.
- Verification: `node --check src/social-renderer.js`, `node --check src/main.js`, `node --test tests/social.test.mjs`, and `npm test` pass. The available in-app browser could not reach the local static server and Chrome was unavailable for the visual smoke test; a direct renderer check emitted all three expected labels.
- Screenshots are useful for spacing/overlap checks but do not replace state assertions.

## UI Agent Checklist

1. Read `AGENTS.md`, this file, and the newest relevant `progress.md` entries.
2. Inspect both portrait and long-form branches before changing shared race geometry.
3. Keep canvas coordinates and simulation coordinates aligned through shared helpers.
4. Preserve the recording boundary: only `#socialCanvas` belongs in the video.
5. Check names, stats, ability bars, numbers, and checkerboards for overlap at 1080×1920 and 1920×1080.
6. Update cache keys and tests.
7. Run `npm test` and a minimal Playwright smoke test.
8. Append a dated entry to `progress.md`.

## Orb Race Tournament Wizard and Responsive Bracket Preview (2026-08-11)

- Tournament setup is a three-page flow under `#raceTournamentPanel`: Page 1 (`#raceTournamentWizardPage1`) owns title, bracket size, seeding mode, and recording scope; Page 2 (`#raceTournamentWizardPage2`) owns the generic unique roster; Page 3 (`#raceTournamentWizardPage3`) owns the bracket preview, recording plans, shared layer presets, and local save/resume controls.
- Tournament is a peer Orb Race format (`#tournamentRaceButton`). While selected, the normal `#raceTeamBuilder`, `#raceLayerToolbar`, `#raceOptionToolbar`, `#raceLayerFields`, non-tournament setup wrapper, seed field, and global setup actions are hidden. The Page 3 `START TOURNAMENT RECORDING` action is the only launch action exposed by the wizard.
- The roster auto-fills deterministically to the selected size using the stable `ORB_RACER_IDS` order while retaining user edits. `#raceTournamentEntrantCount` reports `selected / bracket size`; launch remains disabled until the count is exact. The visible ordered seed list was intentionally removed to make the roster wide and easier to access; internal `raceTournamentSeedOrder` and legacy custom-seeding URL fields remain supported.
- The interactive setup preview consumes the shared `tournamentBracketLayout()` graph. Every entrant or winner is a separate `.race-tournament-node-card` containing only a compact theme-colored orb mark and one name; two source nodes connect orthogonally into one destination node, with no combined matchup/VS card. Unresolved slots are exactly `???`; known marks and winner/advancing node borders use the orb theme color. `OPEN SAVED BRACKET` can select a concrete saved matchup and expose `#raceTournamentRecordMatchButton` for portrait short-form recording without duplicating Media’s canvas topology.
- Portrait and landscape are separate reflows of the same data: `tournamentPreviewMode` selects the portrait card spacing or genuinely wide landscape columns; `#raceTournamentPortraitPreviewButton` and `#raceTournamentLandscapePreviewButton` switch them. Each layout honors left/right/center match topology so outer rounds converge on the centered final. The preview defaults to landscape because the wide layout is the interactive/long-form composition. `#raceTournamentZoomOut`, `#raceTournamentZoomReset`, and `#raceTournamentZoomIn` provide bounded preview pan/zoom access without changing saved gameplay state.
- Exact setup/preview DOM contract: `#raceTournamentPageIndicator`, `#raceTournamentWizardNext1`, `#raceTournamentWizardBack2`, `#raceTournamentWizardNext2`, `#raceTournamentWizardBack3`, `#raceTournamentRoundSelection`, `#raceTournamentRecordRoundButton`, `#raceTournamentRecordTournamentButton`, `#raceTournamentSaveButton`, `#raceTournamentResumeButton`, `#raceTournamentClearButton`, `#raceTournamentOpenBracketButton`, and `#raceTournamentStorageStatus`.
- Cache lineage: the entry script is `20260812-orb-race-tournament-nodes2-fairy-frost3` and the setup stylesheet is `20260812-orb-race-tournament-nodes2-classic-ui1`; concurrent renderer/audio/tournament module keys remain unchanged. Focused UI/social/tournament tests pass, and the elevated Chromium wizard smoke verifies 64-entry portrait/landscape reflow, 127 separate nodes, 126 connectors, orb marks, exact `???` labels, concrete match recording visibility, zoom, save/reopen, `render_game_to_text`, and zero console/page errors.

## Classic Team Picker (2026-08-10)

- Classic now mirrors Orb Race's two-team setup shape: each side has the full registry-driven roster, selected orb IDs retain selection order, and each selected ID can have multiple copies through `classicTeamOptions[teamIndex][orbId].count` (maximum 50).
- Team-specific options round-trip through compact Classic-only URL keys `ct` and `ci`; `classicOrbOptions` remains a compatibility projection for older callers. The scale field is `classicTeamOptions[teamIndex][orbId].orbScale` with MINI `0.55`, COMPACT `0.75`, REGULAR `1`, LARGE `1.25`, and EXTRA LARGE `1.5`.
- Explicitly empty teams are preserved while editing and sharing; the last checked orb is no longer forced back on after deselection. Orb Race selection behavior and keys remain unchanged.
- The browser dependency chain uses the current `20260810-classic-team-announcer1-sword-poke1` lineage, including the live `social.js` import used by the renderer.

## UI/Config Audit (2026-08-08)

- Audited the live `CLASSIC_ORBS` registry and setup wiring: exactly 48 Classic IDs are exposed, with stable IDs and a strict 1v1 selection.
- Confirmed Classic option normalization and compact URL round trips for per-orb speed/trails/collision settings, black theme, and Hydrogen Bomb health; Classic fields remain isolated from Orb Race team option keys.
- `node --test tests/ui-setup.test.mjs tests/features.test.mjs`: passed. `npm test`: 24 passed, 0 failed.
- In-app browser smoke confirmed the page loads, the 48-card roster renders, and selected Classic controls accept Fast speed, both trail toggles, collision damage, Hydrogen health 777, and black-theme selection. Root Chat is responsible for the final Playwright launch/reload smoke test.
- No UI/config application source changes were required in this audit; no gameplay, renderer, or audio files were touched.

## Classic Picker Scroll + Size Contract (2026-08-08)

- Classic selection changes now capture and restore the shared `.setup-panel` scroll position, and Classic option toggles reuse the same `restoreSetupDialogScroll` helper and scroll-container ownership as Orb Race.
- The exact Gameplay handoff field is `classicOrbOptions[orbId].orbScale`: MINI `0.55`, COMPACT `0.75`, REGULAR `1`, LARGE `1.25`, EXTRA LARGE `1.5`. `src/main.js` passes the complete `classicOrbOptions` object unchanged into `createSimulation`; Gameplay should retain/apply this Classic field without changing `raceTeamOptions[teamIndex][orbId].orbScale`.
- Added focused UI/config coverage for scroll restoration and all five Classic size choices, plus compact URL round trips. Gameplay/renderer/audio files were not edited.

## Classic Web-Ball and Arena-Size Handoff (2026-08-09)

- Classic setup now includes `#arenaSizeSelect` with `standard` (default) and `large` (`LARGE SQUARE · MORE ROOM`). The selected value is passed as `arenaSize` to `createSimulation`, preserved in setup restoration, and round-tripped through compact URL key `az`.
- `window.__ORB_FOUNDRY__.getState()` exposes `arenaSize` and `arenaSizeLabel`; `render_game_to_text().match` exposes both plus Classic `launchAngle`, Boxer `punchHand`/`punchGloves`, and each permanent wall-ball entity's `linePhase`, `segments`, and `borderNodes`.
- The renderer uses `sim.arenaBounds` for the visible square wall, so the large option's 8px physics boundary and visible boundary remain aligned. Lazer/Webball/Tripwire paths are permanent persisted segments; Cobweb remains a visible orb-to-wall fan.
- Minimal Playwright verification confirmed both arena-size options, large-state propagation, one canvas, no page errors, no failed requests, and no console warnings/errors. No screenshot is required for this contract.

## Classic Team Naming, Announcer Splicing, and Identity Outlines (2026-08-10)

- Classic team titles now follow Orb Race naming: one or two unique orb names join with `+`; larger selections collapse matching categories such as `WEAPON ORBS`; four or more category/name parts collapse to `EVERYONE`. Copy counts remain in the title (`2× SWORD`) and the same display parts are exposed through `sim.classicTeamDisplayParts` and `render_game_to_text`.
- Classic launch audio uses the existing exact Classic orb-name clips plus Orb Race's generated `race-plus`, category, `intro-race-everyone`, `race-versus`, and `race-pick-your-winner` clips. `CombatAudio.playClassicMatchup()` is called by the existing intro-card timeline, so Classic and Orb Race share the proven splice timing without new fallback audio.
- Team titles use saturated identity colors, and every Classic orb receives a persistent outer outline: Team 1 electric royal blue `#0057ff`, Team 2 red `#e11d48`. The blue is intentionally distinct from Orb Race cyan/speed blue and from orb theme fills.
- Browser cache lineage advanced consistently to `20260810-classic-team-announcer1-sword-poke1`; Orb Race's `20260806-speed-profile4` lineage remains untouched.
- Focused `features`, `classic-audio`, and `ui-setup` tests pass 13/13. Root Chat should perform the final Playwright visual check for the two-team title strip and colored orb outlines.

## Classic Team Identity Toggle (2026-08-10)

- Classic setup now includes `#classicTeamColors`, defaulting to checked. Unchecking `TEAM 1 / TEAM 2 COLORS + OUTLINES` removes both team identity rings and Team 1/Team 2 matchup-title colors; orb theme fills remain unchanged.
- The setting is normalized as `classicTeamColors` and serializes only when disabled as compact Classic key `tc: 0`, preserving legacy URL defaults. `render_game_to_text` exposes `classicTeamColorsEnabled` and nullable `classicTeams[].outlineColor`.
- The affected browser chain is `20260810-classic-team-announcer1-sword-poke2-team-colors1`; the setup stylesheet is `20260810-classic-team-colors1`. Orb Race keys and identity rendering remain unchanged.
- Focused `features`, `ui-setup`, and renderer-contract tests pass. Full `npm test` passes all 59 tests. Browser smoke confirmed disabled `tc: 0` URL persistence/reload, both visual states, and zero browser diagnostic logs.

## Orb Race Footer Copy (2026-08-10)

- Portrait Orb Race finish bands center `Like & Subscribe!` for both teams and show tiny `#OrbBattleGroundSimulator` copy beneath it.
- Long-form Orb Race keeps `FINISH` and the checkerboard uncluttered, placing the centered CTA and hashtag in each track's reserved bottom footer area so the copy remains legible at 1920×1080.
- Cache lineage is `20260810-classic-cutter-overlap-health6-team-colors1-footer-copy3`; `styles.css` remains on `20260810-classic-team-colors1`.
- Verification: `npm test` passes 79/79. In-app browser smoke verified Orb Race portrait and long-form canvases at `1080×1920` and `1920×1080`, with an empty browser diagnostic log.

## Orb Race Lane HUD Metrics (2026-08-10)

- Long-form lane headers now keep Slammy's damage visible and add Unarmed's speed plus Duplicator's duplicate count beside their existing damage line at the top of the lane. Portrait stat HUD behavior remains unchanged and already exposes the same metrics.
- The live social-renderer/entry cache lineage is `20260810-classic-trapper-ropes-virus-full1-team-colors1-footer-copy6-race-hud1-virus-health1`; simulation, renderer, social, and Orb Race import keys remain on their current lineages.
- `node --check` and `node --test tests/social.test.mjs` pass. Full `npm test` currently reports five concurrent Classic gameplay failures in `tests/classic-rework.test.mjs` (Cutter/Blue Sun assertions); no HUD test failures were observed. Browser smoke was attempted but the available in-app browser could not reach the local static server, and no Chrome connection was available.

## Classic Reactor Blue Theme (2026-08-11)

- Classic Reactor now uses the blue primary `#168cff` and light-blue accent `#9de9ff` from the shared Orb Race identity, including profile/setup preview colors and Classic runtime title/effect colors.
- Its Classic charge ramp starts blue and brightens toward the light-blue accent; no green Reactor theme remains in the Classic registry or charge state.
- Affected browser imports and the entry script use the `classic-reactor-blue2` cache suffix. Focused feature/rework tests pass, and elevated Playwright setup verification reports blue computed colors with zero browser errors. Evidence: `artifacts/design-qa/reactor-classic-blue2-setup-page.png`.

## Orb Race Tournament Setup and Session Coordinator (2026-08-11)

- Orb Race now exposes three peer format buttons in `#raceLengthPicker`: `#shortFormRaceButton`, `#longFormRaceButton`, and `#tournamentRaceButton`. Tournament is selected by `selectedRaceFormat === "tournament"`; it hides `#raceTeamBuilder`, `#raceLayerToolbar`, `#raceOptionToolbar`, and the normal `#raceLayerFields`, then shows the generic unique entrant roster in `#raceTournamentPanel`.
- Tournament setup IDs are `#raceTournamentSize`, `#raceTournamentSeedingMode`, `#raceTournamentRecordingScope`, `#raceTournamentTitle`, `#raceTournamentRoundList`, `#raceTournamentLayerCount`, `#raceTournamentFinalLayerHealth`, and `#raceTournamentLayerFields`. Recording scope is `each-match`, `whole-round`, or `whole-tournament`; individual matches force 1080×1920 portrait and 3 layers, while the two landscape scopes force 1920×1080 Long Race and allow 3 or 5 shared layers. Generated values are copied into every match through `raceTournament.matchSettings.layerStrengths`.
- Canonical normalized `raceTournament` fields include `size`, `entrants`, `entrantIds`, `selectedEntrantIds`, `seedingMode`, `seedOrder`, `recordingScope`, `recordingSelection`, `roundsToRecord`, `selectedRoundIds`, `selectedRoundIndices`, `landscapeLayerCount`, `sharedLayerValues`, `title`, and `matchSettings { format, width, height, layerCount, layerStrengths, finalLayerHealth }`. Compact URL data stays under `rt`; dormant legacy top-level `tournament` and Orb Race solid-trail `t` remain isolated.
- Local storage uses `orb-foundry.race-tournament.v1` with `{ version, savedAt, raceTournament, tournamentState, snapshot }`. `tournamentState` is full validated `serializeOrbRaceTournament()` JSON; resume deserializes it and arms the main-level session coordinator so the next launch hydrates the same bracket/current match. `OPEN BRACKET` lists pending/completed match IDs and `REQUEST INDIVIDUAL RECORDING` exposes the selected request through `__ORB_FOUNDRY__` and `render_game_to_text`.
- `finishBattle()` keeps the authoritative `sim.raceTournament` between matches, waits through the winner/advancement tail, continues selected-round/whole-tournament recorder segments, and starts the next eligible hydrated matchup. `window.__ORB_FOUNDRY__.getState()` and `render_game_to_text()` expose tournament settings, snapshot, recording request, and restore warnings.
- The saved/open setup bracket consumes the full hydrated `tournamentState` when available. Each entrant and winner is a separate `.race-tournament-node-card` with an orb mark and name; unresolved nodes are exactly `???`, while completed winners and known advancing output nodes use `ORB_RACERS[orbId].color` for their node border. This is setup-only bracket metadata and does not duplicate Media's canvas topology.
- Browser entry cache lineage for this UI patch ends in `20260812-orb-race-tournament-nodes2-fairy-frost3`; its current module imports preserve the concurrent presentation/renderer/audio/tournament keys. Stylesheet lineage ends in `20260812-orb-race-tournament-nodes2-classic-ui1`.
- Verification: current `npm test` passes 145/145; focused config/UI/tournament tests pass; elevated Playwright setup/bracket smoke confirms the third format, hidden team builder, 3/5 landscape switch, 64-entry portrait and landscape reflow, 127 node cards, 126 connectors, full local save/open/resume path, orb marks, `???` unresolved slots, and zero console/page errors. The bundled web-game client remains blocked by macOS Chromium `bootstrap_check_in` permission.

## Tournament Matchup Recording Launch (2026-08-12)

- `#raceTournamentRecordMatchButton` now launches the selected concrete first-round matchup instead of only setting a status string. The UI uses `prepareOrbRaceTournamentMatchRecording()` to clone the full bracket, keeps the authoritative/saved state untouched, hydrates the prepared state through the existing session-key path, and closes setup into the Social Battle screen.
- Specific matchup recordings force `portrait` / `1080×1920`, exactly three shared layers, and a fresh bracket-intro timeline. `TournamentRecordingCoordinator` receives the selected match ID and opens the recorder segment with the selected orb metadata; a single-match guard stops after the matchup result instead of auto-advancing the clone into the next recording.
- `tournamentRecordingRequest` exposes `matchId`, `leftOrbId`, `rightOrbId`, `format`, `dimensions`, and `layerCount` through both `window.__ORB_FOUNDRY__.getState()` and `render_game_to_text()`. Existing saved tournament snapshots remain the request source and are not overwritten by the recording clone.
- Entry cache lineage advanced to `20260812-orb-race-tournament-match-recording2`; the shared `orb-race-tournament.js` import remains on `20260812-orb-race-tournament-match-recording1`.
- Verification: focused UI/tournament tests pass 28/28, full `npm test` passes 147/147, and elevated Chromium Playwright completed the actual Page 3 node selection → record-specific click path: setup closed, Social Battle opened, recorder state was `recording`, selected match/entrant IDs matched in both runtime inspection APIs, portrait format and 3-layer state were present, with zero console/page errors.

## Tournament Recording Controls (2026-08-12)

- Page 3 #raceTournamentRecordRoundButton and #raceTournamentRecordTournamentButton now launch real landscape MediaRecorder sessions immediately. They use the normalized selected-round/whole-tournament scope, shared 3/5 layer settings, 1920×1080 output, and the existing TournamentRecordingCoordinator.
- Tournament match-result events are recorded at the UI boundary, while finishBattle() waits through the winner/conclusion tail before continuing or stopping. Direct Page 3 requests do not auto-advance after their selected output; normal launches retain the existing hydrated-session progression.
- Stopping a tournament recording finalizes its active coordinator segment before MediaRecorder.stop(). recordingResult is exposed through window.__ORB_FOUNDRY__.getState() and render_game_to_text() with scope, filename, dimensions/layer metadata, and a blob-free availability flag. The download action uses the coordinator filename.
- Browser contract: selected-round produces long-landscape / 1920×1080 / 3-or-5 shared layers and a ...-round.mp4 download; whole-tournament produces the same canvas format and a ...-tournament.mp4 download. The existing specific-match action remains portrait 1080×1920 with 3 layers.
- Entry cache key is now 20260812-orb-race-tournament-recording-workflows1; no renderer, simulation, audio, or recorder module was changed.
- Verification: focused UI/social tests pass 10/10; full npm test passes 155/155; node --check src/main.js passes. Elevated Playwright starts/stops/downloads both selected-round and whole-tournament outputs, reaches EXPORT READY with preview media, reports completed segment metadata, and shows zero console/page errors. The required bundled web-game client also completed its smoke capture under artifacts/design-qa/orb-race-tournament-ui/web-game-client/.

## Tournament Continuous Recording Handoff (2026-08-12)

- Selected-round and whole-tournament flows now identify themselves as continuous recording scopes. `queueNextTournamentMatch()` passes `preserveTournamentRecording: true` while the existing `MediaRecorder` is recording, including when a selected-round run crosses into another selected round; `startSocialRecording()` only appends the next match through the existing coordinator session and never calls `MediaRecorder.start()` again.
- Long-form transitions expose `tournamentTransition` through `socialRenderer.draw()`, `window.__ORB_FOUNDRY__.getState()`, and `render_game_to_text()`. The contract is `{ type: "orb-race-tournament-transition", mode: "pan-to-next", fromMatchId, toMatchId, progress, elapsedMs, interMatchPanDurationMs: 2750, staticBracketDwellMs: 0, restartIntro: false, preserveRecorder: true }`. Media/Rendering should consume this metadata for the continuous camera pan and retain existing canvas/renderer ownership.
- Individual matchup recording remains `mode: "full-intro"` with `staticBracketDwellMs: 1200` and `1080×1920`/three-layer output. Interactive bracket focus now uses the same `2750ms` matchup zoom contract; long-form pan-to-next is also `2750ms`.
- The main loop avoids resetting the generic presentation timeline, zoom cue guard, or recording visual flag during a continuous transition. Direct continuous requests can also advance through non-selected preliminary matches until an included selected round is reached.
- Browser entry cache lineage is `20260812-orb-race-tournament-pan2750-workflows7`. No gameplay, renderer, audio, or recorder-module file was changed in this UI/orchestration slice.

## Tournament Continuous Recording Verification Refresh (2026-08-12)

- Final UI/orchestration verification is green: `npm test` passes 160/160 and the focused UI/social tests pass 11/11.
- Elevated Chromium verified both Page 3 landscape recording controls through real recorder start, stop, preview, and MP4 download with zero console/page errors. The 64-entry wizard smoke also verified scroll preservation, separate-node portrait/landscape previews, and selected-match launch.

## 2026-08-12 · Tournament matchup start gate

- Long-form tournament introductions now use one exact 2.75-second pre-fight window: 1.0 second of camera motion followed by a 1.75-second centered matchup hold. The obsolete 1.2-second static pre-dwell is zeroed for this orchestration path.
- The first long-form matchup's bracket timestamps are aligned to that 2.75-second window. For later matchups, the completed winner/bracket state remains authoritative while the existing recorder captures the pan and hold; the next simulation is hydrated only after the transition ends.
- During a later-match handoff, tournament stepping, next-match audio, announcer playback, recorder-segment opening, and next-match gameplay remain gated. At release, the committed tournament clock advances to the next match's battle boundary, then the hydrated match and its recorder segment start. The same `MediaRecorder` remains in `recording` state throughout.
- Browser entry cache lineage is `20260812-tournament-matchup-gate1`; no renderer, simulation, audio, or recorder module was changed in this UI/orchestration slice.

## 2026-08-12 · Tournament 64-entry camera contract audit

- The UI tournament coordinator now preserves the gameplay-owned camera contract: every initial/individual matchup uses a full intro with `activeMatchId`/`toMatchId`, while a continuous selected-round or whole-tournament handoff is created only when the hydrated next match advertises an authoritative `camera-pan` with matching `fromMatchId` and `toMatchId`.
- The initial long-form match is normalized to one second of continuous bracket-to-matchup motion followed by a stationary `1.75s` hold. Queued handoffs retain the same `MediaRecorder`, pass the transition into the hydrated launch, and explicitly call `startSocialRecording({ transitionOverride })` so the next match cannot silently restart a generic intro.
- The interactive Page 3 camera exposes `data-camera-duration="2750"`, `data-camera-motion-duration="1000"`, `data-camera-hold-duration="1750"`, continuous fractional progress, and active/from/to preview IDs. It uses the same full-intro behavior for selected preview/individual recordings; only long-form continuation uses `pan-to-next`.
- The entry cache key is now `20260812-super-x-cage3-boss2-cowboy-cigar2-bombs3-timefreeze2-tournament64focus1-camera2`; concurrent renderer, presentation, gameplay, audio, and recorder keys were left unchanged. No canvas connector styling was changed.
- Verification: `node --check src/main.js`; focused UI/presentation/tournament/social coverage passes `71/71` after the source-contract refresh. The official elevated web-game client passed and its screenshot was inspected. A focused elevated Playwright 64-entry audit reported `127` node cards, `126` connectors, preview camera motion `1000ms` plus hold `1750ms`, initial `full-intro` IDs `null → round-1-match-1`, battle at `2.75s`, and zero console/page errors.
- A deterministic low-health UI coordinator smoke reached `round-1-match-2` with the same recorder still recording and exposed `fromMatchId: round-1-match-1`, `toMatchId: round-1-match-2`, `motionProgress: 0.97`, `preserveRecorder: true`, and no console/page errors. The 64-entry state/presentation regression remains green in the focused/full suites.
