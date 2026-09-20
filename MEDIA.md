# Orb Foundry Media Status

## Purpose

This is the handoff document for agents working on sprites, generated art, audio samples, announcer clips, recording, transcoding, and media manifests.

Media playback and visuals must consume deterministic simulation events/state without changing gameplay outcomes.

## Primary Ownership

- `src/audio.js`: announcer manifests, event-to-sample routing, Web Audio graph, mixer behavior, clip splicing, and recording-stream audio.
- `src/social-renderer.js`: loading and drawing runtime sprites/effects on the social canvas.
- `src/recorder.js`: `MediaRecorder` lifecycle and final browser preview/download.
- `src/social.js`: export dimensions, captions, stats, and metadata.
- `assets/audio/`: active announcer and effect files.
- `assets/audio/source/`: preserved original or generated audio sources.
- `assets/generated/`: generated sprite sources, transparent finals, review sheets, and manifests.
- `assets/race/`: older live Orb Race assets and source copies.
- `scripts/`: announcer generation, battle export, transcoding, upload, and posting workflows.

## Current Audio State

- Classic has a dedicated announcer roster for every current fighter; shared Race clips cover established identities and the Alex-generated Classic-overhaul pack covers the newer IDs.
- Orb Race has name clips for its large stable-ID roster, group names, combo names, team counts, target-layer announcements, `versus`, `plus`, `everyone`, and `pick your winner`.
- `roulette` is announced as **Absorber** while retaining its stable ID.
- Recent Alex voice additions include Commander, Shrapnel, Absorber, Architect, Needle, Multiplier, Sniper, Snowball, Countdown, Copycat, Critical, 100X, Grappler, and Artists.
- Orb Race effect routing includes collisions, layer breaks, drills, bombs, missiles, projectiles, critical hits, slot-machine outcomes, Meteor, Black Hole, Draftmaster weapons, hydrogen bomb, and special character events.
- Missing announcer clips fall back to short procedural callout stingers rather than blocking the match.
- Audio is presentation-only and must not influence simulation timing or winner selection.

## Orb Race Tournament Separate-Node Bracket (2026-08-12)

- Rebuilt the export-canvas and interactive preview bracket in `src/orb-race-tournament-presentation.js`, `src/social-renderer.js`, and `src/main.js` as rounded rectangular Orb Racer-themed cards. Every entrant is its own card, and every match result is a separate winner/destination card; there is no card containing both competitors. Exact `???` is used for unresolved destinations.
- Each non-final match has exactly two source-card IDs and one distinct destination-card ID in `layout.topology`. Orthogonal source-to-destination paths recurse from the outer left/right seed halves into the centered championship node; right-side fallback pairing mirrors from the outside inward while gameplay `sourceNodeIds`/`sourceMatchIds` remain authoritative.
- Portrait `1080 × 1920` and long-form landscape `1920 × 1080` use independent column/card reflow. Landscape is not a stretched portrait crop; its wider columns keep names legible across 4/8/16/32/64 entrant brackets. Existing gameplay `sourceNodeIds`/`sourceMatchIds` remain authoritative, including reversed right-side first-round order.
- Zoom uses the shared source/destination graph and keeps the active two source cards plus destination centered while including the nearest same-column matchup above/below; edge matchups include the available neighbor. The `1.75s` move uses one cached layout, stable start/end camera rectangles, and a continuous quintic smootherstep for fractional pan/scale at both 30 and 60 FPS; the existing one-shot `orb-race-tournament-zoom` audio cue remains presentation-only.
- Advancement now fades the destination `???` card into deterministic local dust while the winner travels along the connector, then fills the destination card with the winner's Orb Race theme-color border. Losers continue through the grayscale/fade state; champion presentation uses the center final card.
- Cache lineage is `20260812-orb-race-tournament-nodes2` for the presentation import, `...-nodes2-fairy-frost3` for both the renderer import and main renderer seam, and `...-nodes2-fairy-frost3` for the page entry. Tournament canvases set `data-tournament="true"` so the UI-only outer canvas frame is removed without changing normal exports. No new raster assets were required; existing Orb Race orb visuals are reused only as the card icons.
- Focused coverage: `tests/orb-race-tournament-presentation.test.mjs` and `tests/social.test.mjs` pass, including separate-node topology for 4/8/16/32/64, mirrored right-side pairing, card bounds, independent landscape reflow, deterministic dust, `???`, edge/middle zoom neighbors, winner color, and zoom cue behavior.

### Portrait camera, finish, and announcement follow-up (2026-08-12)

- Preserved the approved landscape bracket and tightened only the portrait export camera: the active source pair and destination remain the exact camera center, while the nearest same-column context stays in frame with less unused padding. The interactive portrait preview uses the matching closer focus scale.
- Portrait cards expose deterministic `textFit` metadata (`labelMaxWidth`, minimum font size, ellipsis overflow, and rounded-card clipping) from `src/orb-race-tournament-presentation.js`; `drawTournamentCard()` consumes that contract so long names cannot escape their node.
- Tournament finish bands omit the extra black finish separator/outline because the checkerboard already fills the finish field. Ordinary Orb Race finishes retain their existing border. The explicit helper is `raceTournamentFinishBorderVisible()` in `src/social-renderer.js`.
- Matchup announcer playback is deferred until Gameplay's tournament presentation reaches `battle`, after the 1.75-second zoom; the one-shot bracket zoom cue remains separate and deterministic. Per-match keys prevent repeat announcements.
- Browser cache lineage is now `20260812-orb-race-tournament-portrait-fit2` for the tournament presentation import, `...-portrait-fit2-fairy-frost3` for renderer/main, and `20260812-orb-race-tournament-match-recording3-portrait-fit2` for the page entry.
- Focused presentation/social tests pass 23/23 and the full suite passes 147/147. The inspected portrait evidence is `artifacts/design-qa/orb-race-tournament-ui/portrait-record-match.png`; a fresh Playwright capture was not possible in this pass because the browser tool reported its usage limit.

### Camera motion refinement (2026-08-11)

- `tournamentCameraTransform` now interpolates one stable full-bracket camera and one stable matchup camera with an unrounded quintic smootherstep. The cached bracket layout is not rebuilt during frames; the active matchup remains centered with same-column neighbors visible at the endpoint.
- The renderer tolerates `currentMatch`-only gameplay snapshots and reads authoritative per-match intro/zoom/conclusion durations. Zoom audio remains a one-shot presentation cue.

The current page/audio entry lineage is `20260803-new-orb-announcements1`. `src/audio.js` currently imports Orb Race data using `20260802-absorber-blackhole1`.

## Current Generated Visual Assets

Important active generated sets include:

- `assets/generated/classic-weapon-rework/`: transparent pixel sword, bow, bow arrow, potion, axe, dagger, and katana.
- `assets/generated/orb-race-tactical-20260731/`: Commander drone/projectile sheet, Shrapnel, Absorber/Roulette, and Architect sheets plus preserved sources/manifest.
- `assets/generated/orb-race-tactical-20260802/`: standalone Commander orb source/final/manifest.
- `assets/generated/orb-race-simple-20260731/`: Sniper weapon sheet and Snowball orb.
- `assets/generated/orb-race-expansion-20260729/`: Crusher and Draftmaster assets.
- `assets/generated/orb-race-viking-20260730/`: Berserker calm/rage assets.
- `assets/race/generated/`: Godzilla, Black Hole, Meteor, Ricochet, Sawblade, and related source/final assets.

The renderer uses nearest-neighbor drawing for pixel assets. Final PNGs should have real alpha; do not ship chroma backgrounds or white mattes.

## Asset Preservation Contract

- Keep the original downloaded/generated source in a `source/` directory.
- Store chroma-keyed or cleaned runtime PNGs in `final/` where a versioned generated set uses that convention.
- Record the prompt/source/final relationship in that set's `manifest.json`.
- Validate alpha edges and inspect the image at original resolution.
- Do not overwrite unrelated generated assets or production artifacts.
- Do not copy third-party sprites, logos, footage, or audio without rights-cleared user-supplied sources. Recreate the requested visual language with original assets.

## Announcer Workflow

- Stable racer IDs are mapped to spoken names in `RACE_ANNOUNCER_NAMES` in `src/audio.js`.
- Combo and group announcements use the Orb Race helpers instead of hand-building names in `main.js`.
- Generated source clips are preserved under `assets/audio/source/race-announcer-generated/`.
- Active clips live under the matching announcer runtime folder.
- Confirm the file extension expected by `LOCAL_GENERATED_RACE_WAV_IDS`; most newer clips are MP3, while selected locally generated entries remain WAV.
- After adding a clip, update the manifest/lookup, cache key, and audio tests, then verify the cache-busted URL returns non-empty audio with the expected MIME type.

## Effect-Audio Workflow

1. Simulation emits a stable event with the data needed for routing.
2. `samplePlanForEvent(...)` in `src/audio.js` selects the sample and playback options.
3. Audio playback may crop a clip or adjust gain/rate, but must not mutate simulation state.
4. Preserve supplied originals under `assets/audio/source/`.
5. Add routing and asset-existence assertions in `tests/social.test.mjs` or the focused audio suite.

## Recording and Production

- The browser records the dedicated canvas and Web Audio stream.
- Supported outputs include portrait, square, landscape, and 1920×1080 Orb Race long form.
- `npm run battle:export` creates a deterministic local export.
- `npm run battle:transcode`, `battle:upload`, and `battle:post` are production workflows with external side effects. Do not run them during normal verification.
- FFmpeg and Chrome paths may require `FFMPEG_PATH` and `CHROME_PATH`.
- Never commit credentials, access tokens, or generated production posts.

## Media Testing Responsibilities

- Asset existence, alpha, announcer manifests, sample routing, captions, and export helpers: `tests/social.test.mjs` and `tests/classic-audio.test.mjs`.
- Run `npm test` after manifest, route, or cache changes.
- Use Playwright through the local HTTP server to confirm affected assets return `200`, audio files are non-empty, and there are no page/console errors.
- For canvas art, inspect the actual `#socialCanvas` at the affected resolution.

## Media Agent Checklist

1. Read `AGENTS.md`, this file, and the newest relevant `progress.md` entries.
2. Reuse existing assets when appropriate; generate new originals when the user asks for new art.
3. Preserve source files and update manifests.
4. Remove chroma/mattes, validate alpha, and use nearest-neighbor rendering.
5. Route sounds from simulation events rather than gameplay timers in the DOM.
6. Update browser/audio cache keys and tests.
7. Run `npm test` and a focused Playwright asset/audio check.
8. Append a dated entry to `progress.md`.

## Classic media pass 2026-08-08

Generated and inspected with the built-in image generator, then keyed with the installed `remove_chroma_key.py` helper:

- Boxer v2 source is preserved at `assets/generated/classic-media-20260808/source/boxer-gloves-sheet-chroma-v2.png`; the replacement v3 source is `assets/generated/classic-media-20260808-boxer-v3/source/boxer-gloves-sheet-chroma.png`.
- Boxer runtime: `assets/generated/classic-media-20260808-boxer-v3/final/boxer-gloves-sheet.png` (three 512×1024 nearest-neighbor frames: guarded, extended, impact). Each frame places one oversized red glove above and one below an empty center so the renderer-owned red orb and centered HP remain visible. The renderer mirrors the stacked gloves toward the opponent and draws a deterministic smoky punch trail from world-space glove samples converted to the fighter-local canvas; the original two-second trail window was superseded by the 0.5-second particle fade documented below.
- Necromancer source: `assets/generated/classic-media-20260808/source/necromancer-skull-sheet-chroma-v2.png`.
- Necromancer runtime: `assets/generated/classic-media-20260808/final/necromancer-skull-sheet.png` (three 591px nearest-neighbor frames: lowered, raised, glowing summon). It contains only the skull relic and skeletal hands; the purple orb body and HP remain renderer-drawn.
- Exact generator prompts and alpha validation are in `assets/generated/classic-media-20260808/prompts.md` and `manifest.json`. The first full-character generations remain preserved as rejected sources and are not loaded.

Renderer integration consumes only presentation state already owned by Gameplay: `fighter.radius`, `health`, `classicPunchPhase`, `classicPunchStartedAt`, `classicAbilityActiveUntil`, `classicSummonPhase`, `classicSummonStartedAt`, `classicLatchPhase`, `classicLatchTargetId`, `classicLatchUntil`, `classicLatchAngle`, `classicEntities`, and `classicDots`. All glove, smoke, skull, Vampire-teeth, overlay, and HP sizes derive from `fighter.radius` for MINI through EXTRA LARGE profiles. Classic fighters always use a flat solid orb with a black outline; special assets are accessories drawn around it and centered HP is drawn last.

Cobweb and Lazer/Webball are intentionally separate geometries: Cobweb draws multiple white spokes from each persistent wall anchor to the moving orb endpoint; Lazer/Webball draws exactly one active neon-purple ricochet leg from Gameplay's `previousWallContact` to `nextWallContact`, with endpoint treatments. Vampire adds a target-facing latch tether, red drain particles, and keeps health text above decoration.

Classic audio now routes Boxer ability starts to `critical-hit`, Necromancer ability/projectile starts to `hex-magic-burst`, and `classic-minion-hit` to `orb-collision`. `SAMPLE_ASSET_VERSION` is `20260808-classic-media1`; no new audio files or missing-file URLs were introduced.

Gameplay contract note for Lead: the current `src/simulation.js` references `startClassicBoxerPunch`, `startClassicNecromancerSummon`, and `updateClassicNecromancerSummonState`, but those function definitions are not present in the checked-out source. The renderer safely animates from the exposed phase/timestamp fields and falls back to radius-scaled idle frames; Gameplay should land those state transitions for event-synchronized punch/summon timing. Minion movement/velocity is likewise consumed when exposed and otherwise renders an idle walk cycle without changing simulation.

## Classic weapon media pass 2026-08-08

Dedicated generated weapon pack:

- Sawball source: `assets/generated/classic-weapons-20260808/source/sawball-blade-chroma.png`.
- Sawball runtime: `assets/generated/classic-weapons-20260808/final/sawball-blade.png` (1254×1254 RGBA, transparent corners, 762517 transparent pixels, 8049 partial-alpha pixels). The renderer mounts two very large instances at opposite orb edges and rotates them in opposite directions. It no longer loads `assets/race/generated/sawblade-weapons.png`.
- Trident source: `assets/generated/classic-weapons-20260808/source/trident-weapon-chroma.png`.
- Trident runtime: `assets/generated/classic-weapons-20260808/final/trident-weapon.png` (1254×1254 RGBA, transparent corners, 1428038 transparent pixels, 11332 partial-alpha pixels). The same dedicated weapon is used for the aimed held trident and its recalled projectile.
- Manifest and exact prompts: `assets/generated/classic-weapons-20260808/manifest.json` and `assets/generated/classic-weapons-20260808/prompts.md`.

Exact Sawball prompt: “Create an original pixel-art weapon asset for a browser game: one large, unmistakable circular saw blade, weapon only, centered on a square canvas. Thick crisp black pixel outline, many readable silver metallic teeth, a dark charcoal iron ring, and a brass hub. No orb, no handle, no character, no text, no shadow, and no other objects. Make the blade silhouette large enough to render at roughly 1.6 times the diameter of the plain orb when mounted. Use a perfectly flat vivid chroma green background `#00ff00` for later key removal, with a nearest-neighbor pixel-art look.”

Exact Trident prompt: “Create an original pixel-art weapon asset for a browser game: a single unmistakable three-pronged trident, weapon only, centered horizontally so it can aim toward an opponent. Thick crisp black pixel outline, cyan-silver metal prongs with a dark teal handle and small gold collar, readable silhouette at small size, generous padding around the entire weapon. No orb, no hand, no character, no text, no shadows, no other objects. Place it on a perfectly flat vivid chroma green background `#00ff00` for later key removal. Square canvas, nearest-neighbor pixel-art look.”

Pistol, Shotgun, and Rifle are the sole explicitly authorized asset reuse: they use the generated Draftmaster gun sheet at `assets/generated/orb-race-expansion-20260729/final/draftmaster-equipment.png` and its distinct ammo sheet at `assets/generated/orb-race-expansion-20260729/final/draftmaster-ammo.png`. `src/renderer.js` crops the pistol/rifle/shotgun weapon cells, aims them from `classicGunAimAngle`, and uses `classicGunPhase`/firing/reload timestamps for recoil, muzzle flash, and reload ghosts. Their orb bodies remain simple solid orbs with centered HP. Trident, Sawball, Boxer, and Necromancer do not reuse those gun assets.

Classic weapon audit (current renderer):

- Vampire: deliberate procedural white fangs/tether in `drawClassicVampireOverlay`, using the exact Gameplay latch angle and target distance. This is not reused weapon art because the teeth bases/tips must remain attached to the orb and update with the live latch transform; the overlay is translated to `fighter.x/fighter.y` and the HP remains in the game-drawn orb.
- Sniper: `assets/generated/orb-race-simple-20260731/final/sniper-weapons.png` (the dedicated same-fighter generated Sniper sheet).
- Draftmaster: simple `CLASS_DEFS.draftmaster.color` orb plus its dedicated generated equipment sheet `assets/generated/orb-race-expansion-20260729/final/draftmaster-equipment.png`; no Classic runtime mapping to the caped-orb body remains. Sword and gun draw as separate aimed/animated accessories.
- Pistol / Shotgun / Rifle: the explicitly authorized Draftmaster equipment/ammo family above, with distinct source crops for each gun/ammo type.
- Sawball: `assets/generated/classic-weapons-20260808/final/sawball-blade.png`, mounted twice from `fighter.classicSawballDiscs` at the Gameplay 2.6r center distance and 1.6r disc radius.
- Trident: `assets/generated/classic-weapons-20260808/final/trident-weapon.png`, used for the attached weapon and recalled projectile.
- Grappler: `assets/generated/classic-weapons-20260808/final/grappler-gun.png`; the deterministic projectile/rope geometry remains simulation-owned.
- Grappler projectile: `assets/generated/classic-weapons-20260808/final/grappler-hook.png`; this separate GPT-generated hook rides the deterministic projectile while the rope remains a live code-drawn segment.
- Turret: `assets/generated/classic-weapons-20260808/final/turret-cannon.png`, used for the attached fighter cannon and spawned turret hazard.
- Boxer: `assets/generated/classic-media-20260808-boxer-v3/final/boxer-gloves-sheet.png` with renderer smoke trail; Necromancer: `assets/generated/classic-media-20260808/final/necromancer-skull-sheet.png`.

Complete current 48-ID Classic registry classification (no ID is silently omitted):

- Dedicated generated held/accessory weapon: `sword` → `assets/generated/classic-weapon-rework/final/sword.png`; `vampire` → deliberate procedural latch fangs/tether (the teeth must follow the live latch transform, so no unrelated sprite is reused); `turret` → `assets/generated/classic-weapons-20260808/final/turret-cannon.png`; `sniper` → `assets/generated/orb-race-simple-20260731/final/sniper-weapons.png`; `draftmaster` → `assets/generated/orb-race-expansion-20260729/final/draftmaster-equipment.png`; `necromancer` → `assets/generated/classic-media-20260808/final/necromancer-skull-sheet.png`; `sawball` → `assets/generated/classic-weapons-20260808/final/sawball-blade.png`; `trident` → `assets/generated/classic-weapons-20260808/final/trident-weapon.png`; `grappler` → `assets/generated/classic-weapons-20260808/final/grappler-gun.png` plus `assets/generated/classic-weapons-20260808/final/grappler-hook.png`; `boxer` → `assets/generated/classic-media-20260808-boxer-v3/final/boxer-gloves-sheet.png`.
- Explicitly authorized reuse only: `pistol`, `shotgun`, and `rifle` use the Draftmaster gun family at `assets/generated/orb-race-expansion-20260729/final/draftmaster-equipment.png` and distinct ammo at `assets/generated/orb-race-expansion-20260729/final/draftmaster-ammo.png`, as specifically requested by the user.
- Generated actor/projectile/effect presentation, not held weapon art: `batman` batarang, `snake` tail, `shrapnel` fragments, `hive-ball` bees, `zeus` lightning, `glass-ball` shards, `artist` drawings, `monster` and `fairy` generated summon actors, and `commander` drones. These remain effect/entity visuals; their plain orb bodies and centered HP are still renderer-owned.
- Plain solid orb with no held weapon (effects, hazards, or state rings remain code-drawn): `duplicator`, `orbital`, `unarmed`, `slammy`, `flash`, `reactor`, `blue-sun`, `black-hole`, `tripwire`, `hydrogen-bomb`, `poison`, `spikey`, `virus`, `cobwebs`, `apple`, `absorber`, `ying-yang`, `trapper`, `cutter`, `lazer`, `charger`, `parasites`, `train`, `frost-ball`, and `jackpot`.

Non-held effects such as Blue Sun beams, lightning, potion triangles, poison clouds, and Black Hole fields remain procedural/effect overlays rather than orb weapons. No unapproved asset reuse was introduced for the audit.

The renderer/browser cache lineage is now `20260809-classic-orb-identity1` in `index.html`, `src/main.js`, `src/social-renderer.js`, and the renderer import (the audio import retains its verified `20260808-classic-boxer1` lineage). Dedicated weapon alpha and crop helpers plus the 0.5-second Boxer smoke alpha helper are covered by the social renderer media tests. Trident is mounted with only its handle butt beneath the full orb so its large three-pronged head remains readable outside the orb. QA capture `artifacts/design-qa/boxer-reference-punch-v5.png` shows the stacked reference composition and visible smoke; expiry timing is asserted directly by `classicBoxerSmokeAlpha` tests.

## Classic Visual Refinement Follow-up (2026-08-09)

- No new GPT Image files were needed for this pass. The renderer reuses the already approved Boxer v3 glove sheet and Necromancer v2 skull sheet, plus the explicitly authorized Draftmaster equipment/ammo family for Pistol, Shotgun, and Rifle. All fighter bodies remain renderer-owned solid orbs with centered HP.
- Classic gun attachments now use Orb Racer's exact `1.75` gun scale (`CLASSIC_GUN_RENDER_SCALE`); the three authorized gun orbs keep their aimed/firing/reload states. Classic ammo uses `CLASSIC_GUN_PROJECTILE_RENDER_SCALE = 6`, twice the previous Classic projectile scale, while Grappler's hook keeps its dedicated smaller hook route. The Sniper sheet is drawn through `classicSniperWeaponSourceRect(...)`, which crops the source matte/black box before rendering.
- Boxer and Monster consume the live `classicPunchReach` and `classicPunchGloves` state. The active generated glove extends to the opponent-distance hit segment, so the same reach determines both punch eligibility and visible contact. Smoke is rendered as a deterministic cloud of overlapping radial puffs sampled from the glove path; each puff reaches zero opacity at 0.5 seconds through `classicBoxerSmokeAlpha`.
- Necromancer's skull entity is rendered at a radius-derived `4r` destination, follows the Gameplay lift/charge/summon coordinates, and adds a purple ring/glow/particle burst during charge and summon. Snake consumes `classicSnakeTailGrowth`, increasing its rear ellipse on every wall bounce from a small oval toward the established circular segment. Absorber is a plain pink orb with a renderer-owned pink/white absorber ring animation, while shared Classic identities continue to take their Orb Racer palette bridge from `CLASSIC_RACE_VISUAL_IDS`.
- Health delta markers remain suppressed for `laser`, `lazer`, `webball`, `tripwire`, `cobwebs`, and Vampire latch/leech updates; centered HP remains visible. Browser cache lineage for the pass is `20260810-classic-monster-latch1` in the updated Classic renderer/social/main entry chain.
- 1080×1920 canvas QA artifacts: `artifacts/design-qa/classic-boxer-reach1.png`, `classic-monster-reach1.png`, `classic-necromancer-reach1.png`, `classic-pistol-fired-reach1.png`, `classic-rifle-reach1.png`, `classic-sniper-crop-reach1.png`, `classic-snake-reach1.png`, and `classic-absorber-reach1.png`. Playwright canvas captures reported no page/console errors. The shared `window.render_game_to_text()` helper still has an unrelated null `stickUntil.toFixed()` edge case for non-trident Classic entities; it is recorded for the Gameplay/Main owner rather than changed in this media pass.

## Classic Compact Weapon/Marker Pass (2026-08-09)

This follow-up supersedes the earlier gun/marker scale notes above:

- Boxer/Monster continue using `assets/generated/classic-media-20260808-boxer-v3/final/boxer-gloves-sheet.png` in the stacked guard layout. Only the selected punch glove leaves the stack. Gameplay now commits `classicPunchAngle` and `classicPunchReach` at punch start; the renderer uses that fixed path with a `5.7r` close-range eligibility cap and `5.2r` reach cap. Smoke remains the generated-glove trail treatment and fades at `0.5s` via `classicBoxerSmokeAlpha`.
- `CLASSIC_GUN_ORB_RENDER_SCALE = 0.9` applies only to the authorized Pistol/Shotgun/Rifle attachments; Draftmaster/Grappler/Turret keep `CLASSIC_GUN_RENDER_SCALE = 1.75`. Shotgun ammo is a code-rendered red rectangle with a yellow square top at the existing shell footprint. Pistol and Rifle ammo preserve the Draftmaster source crop aspect ratio and apply `CLASSIC_SNIPER_PROJECTILE_SCALE = 0.75`, eliminating the stretched rectangle treatment.
- Parasites use the Orb Racer visual contract: a brown plain orb with four olive spots and brown/olive spotted parasite carriers. Snake tails use separate ovals whose sizes grow from a tiny far-end segment toward the orb; the oval ratio gradually fills to the established near-orb circle as growth reaches `1`. Spikey/Virus tips attach at `0.86r` and end at `1.08r`, keeping the spikes along the orb boundary.
- `socialBattleLayout(..., "portrait", "large")` uses an `0.82` width ratio; standard portrait remains `0.71`. The renderer passes `sim.arenaSize` so the Classic LARGE option is visibly larger in the social canvas without changing the square geometry.
- `CLASSIC_WEB_DAMAGE_TYPES` covers `laser`, `lazer`, `webball`, `tripwire`, `cobwebs`, `cutter`, and `train`. A matching event normalizes each damage marker to `-1`/`+1` and bypasses marker merging, while Vampire leech markers remain intentionally suppressed. This keeps repeated web damage legible instead of displaying cumulative `-30` labels.

QA captures for this pass are under `artifacts/design-qa/`: `classic-boxer-visual-proportions.png`, `classic-pistol-visual-proportions.png`, `classic-shotgun-visual-proportions.png`, `classic-rifle-visual-proportions.png`, `classic-parasites-visual-proportions.png`, `classic-snake-visual-proportions.png`, `classic-spikey-visual-proportions.png`, and `classic-virus-visual-proportions.png`. The required Playwright client smoke is in `artifacts/design-qa/web-game-client-visual-proportions/`; all focused and full tests were green with no page/console errors.

## Classic Visual Identity v2 (2026-08-09)

Generated and inspected a new original pixel-art accessory pack with GPT Image. Exact prompts, source/final paths, rejected edit provenance, frame names, and alpha counts are in `assets/generated/classic-visual-20260810-v2/prompts.md` and `manifest.json`.

- Shotgun: `assets/generated/classic-visual-20260810-v2/final/shotgun-sheet.png`, three nearest-neighbor cells for ready/firing/reload. It is a distinct double-barrel silhouette.
- Rifle: `assets/generated/classic-visual-20260810-v2/final/rifle-sheet.png`, three nearest-neighbor cells for ready/firing/reload. It is a distinct scoped tactical-rifle silhouette.
- Monster fists: `assets/generated/classic-visual-20260810-v2/final/monster-fists-sheet.png`, three detached scaly-fist frames. Monster keeps a plain orb body with renderer-owned rim fins/scales; the generated fists are the only replacement for its glove accessory.
- Necromancer arrows: `assets/generated/classic-visual-20260810-v2/final/necromancer-arrows-sheet.png`, normal/magic/impact frames. The arrow is a generated projectile and is rendered at 2× the former minion scale; the Necromancer skull remains at the upper-right and follows the Gameplay-owned lift offsets.
- Straight ammunition: `assets/generated/classic-visual-20260810-v2/final/sniper-ammo-sheet.png`, separate pistol/rifle cells with right-facing straight noses. Renderer preserves their source aspect ratio and applies the requested `0.75` size factor.
- Sniper transparency repair: `assets/generated/classic-visual-20260810-v2/final/sniper-weapons.png` is keyed from the preserved same-fighter source. The GPT matte-removal edit is retained only as `source/sniper-weapons-alpha-edit.png` because it baked a checkerboard and is not loaded.

The renderer consumes `fighter.radius`, `classicGunAimAngle`, `classicGunPhase`, `classicPunchPhase`, `classicPunchAngle`, `classicPunchReach`, `classicPunchGloves`, `classicSummonPhase`, `classicSummonStartedAt`, and the deterministic Classic entities. Boxer and Monster gloves now retarget the live opponent during the short punch, so the visual endpoint follows the same target used by the punch contract while remaining capped at the close-range maximum. Reload spinning is local to each gun mount rather than orbiting the orb. Cutter's red zone is drawn only after `activeLine === false`. Health markers for web-ball/gun damage remain individual `±1` events with a 0.5-second opacity fade.

Defaults were also aligned with the latest product request: Orb Race and Classic controls select full-size orbs (`raceOrbScale = 1`, Classic regular profile), Classic uses the black theme by default, and `socialBattleLayout(..., "portrait", "large")` allocates `95%` of portrait width. Spikey triangles and Virus membrane buds are attached to the orb rim; Parasite uses the Orb Racer palette/details and its thrown carrier is 3× larger. All orb bodies and centered HP remain renderer-owned plain orbs.

## Classic Boxer, Monster, Gun Reload, and Arrow Correction (2026-08-09)

This is the latest media/rendering contract for the requested Boxer/Monster and gun pass. No new GPT Image files were generated in this correction; it uses the approved transparent finals below.

- Boxer uses `assets/generated/classic-media-20260808-boxer-v3/final/boxer-gloves-sheet.png`. The renderer crops the authored glove alpha bounds with `classicBoxerGloveSourceRect(...)`, keeps two oversized gloves outside/overlapping the full orb in the guarded stacked composition, and rotates that stack around the orb toward the live opponent. Only the Gameplay-selected Boxer hand leaves the stack for a short punch; the smoke cloud is deterministic and fades to zero after `0.5s`.
- Monster uses its own generated scaly accessory `assets/generated/classic-visual-20260810-v2/final/monster-fists-sheet.png`, plus the existing renderer-owned rim fins/scales. Monster always renders the guard pair—no punch flight or punch animation is borrowed visually—but the pair rotates around the orb to face the opponent. The plain orb body and centered HP remain visible.
- Pistol/Shotgun/Rifle gun bodies still use the explicitly authorized Draftmaster family, but reloading no longer selects generated reload artwork. `drawClassicGunOverlay(...)` reuses the ready frame and rapidly spins the mounted weapon around its own center (`7π` eased sweep), matching the Orb Racer Draftmaster reload presentation without orbiting the orb.
- Shotgun ammo is a compact direct red rectangular shell with a yellow square cap, using `CLASSIC_SHOTGUN_PROJECTILE_SCALE = 1.8`. `drawClassicEntities(...)` derives the shell rotation from live `vx/vy`, so every cap points along its actual spread trajectory. Pistol/Rifle generated straight ammunition preserves source aspect ratio and uses `CLASSIC_SNIPER_PROJECTILE_SCALE = 0.75`; the sniper crop excludes the old black matte.
- Necromancer keeps the existing minion bow accessory. Its projectile route now uses the first (`normal`) cell from `assets/generated/classic-visual-20260810-v2/final/necromancer-arrows-sheet.png`; magic/impact cells are not selected for ordinary shots. The upper-right skull lift/glow behavior is unchanged.
- The browser import chain is cache-busted as `20260810-classic-visual-identity4` in `index.html`, `src/main.js`, `src/social-renderer.js`, `src/renderer.js`, `src/simulation.js`, `src/config.js`, `src/presentation.js`, and the renderer test import. The 1080×1920 canvas captures are `artifacts/design-qa/classic-visual-identity4-boxer-guard.png`, `classic-visual-identity4-boxer-active.png`, `classic-visual-identity4-monster-static.png`, `classic-visual-identity4-shotgun-shell.png`, and `classic-visual-identity4-necromancer-arrow.png`; each Playwright run reported no page, console, or failed-request errors.
- Regression coverage includes the alpha-bounded Boxer crop, static Monster guard contract, velocity-aligned named gun projectiles, compact shotgun scale, ready-frame-only reload selection, in-place reload spin, and generated first-cell Necromancer arrow routing. `npm test` passes `48/48`.

## Classic Sniper, Hydrogen, Virus, Parasite And Damage Audio Fix (2026-08-10)

- Necromancer minions now render one clean bow only. The generated `assets/generated/classic-visual-20260810-v2/final/necromancer-arrows-sheet.png` remains reserved for the separately fired `necromancer-arrow` projectile, so the minion body no longer carries a bow-plus-arrow/three-arrow silhouette.
- Sniper now uses the explicitly requested Orb Racer-style held weapon from the dedicated same-fighter sheet `assets/generated/orb-race-simple-20260731/final/sniper-weapons.png` at the radius-relative `classicSniperHeldPose(...)` scale. Its fired round uses the straight right-facing bullet cell from `assets/generated/classic-visual-20260810-v2/final/sniper-ammo-sheet.png`, preserves source aspect ratio, and shares the rifle projectile size rather than stretching into a curved strip.
- Classic Hydrogen Bomb now uses `assets/race/hydrogen-bomb-symbol.png` as its complete clipped circular body. The supplied upper square is cropped before drawing, the generic orb is not drawn underneath, and centered HP is applied as the final renderer layer.
- Virus now follows the supplied lime/olive membrane reference with dark outlined funnel-like rim protrusions and distributed interior marks. Parasite bodies use one shared spread-out green-spec design; attached parasite dots are rendered at `1.25×` carrier size from persistent `classicDots`, follow the target's live position, and stay outside the target HP label so a latch remains visible after the launch entity expires.
- Classic damage events (`classic-body-hit`, slam, bow/potion/slice, orbital, punch, sword, Blue Sun, projectile, DOT, and minion-hit) route to the existing `orb-collision` bounce sample. Gun firing keeps its existing Pistol/Rifle/Shotgun launch samples; Hydrogen detonation keeps its dedicated detonation cue.
- Cache lineage is `20260810-classic-sniper-hydrogen-virus-audio2` with the renderer/social variant `20260810-classic-sniper-hydrogen-virus-audio2-team-colors1` across the browser import chain and announcer version. Focused source/audio/social regressions cover bow-only minions, full-cell Sniper pose, straight Sniper ammo, Hydrogen body ownership, Virus/Parasite marker classification, persistent latch rendering, and shared damage audio.
- Verification: `npm test` passes all 60 tests. Fresh elevated Playwright Chromium captures reported zero console, page, or failed-request errors: [Sniper vs Unarmed](artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-sniper-vs-unarmed.png), [Hydrogen Bomb vs Virus](artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-hydrogen-vs-virus.png), [Virus vs Unarmed](artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-virus-vs-unarmed.png), [Parasites vs Unarmed](artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-parasites-vs-unarmed.png), [Parasites latch marker frame](artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-parasites-latch-marker.png), and [Necromancer vs Unarmed](artifacts/design-qa/classic-sniper-hydrogen-virus-audio2-necromancer-vs-unarmed.png). The frames visually confirm centered HP, the Virus membrane silhouette, discrete `-1` Virus feedback, enlarged green-specked parasite carriers on the target rim with a discrete `-1`, the Hydrogen symbol crop, and the bow-only Necromancer minion.

## Classic Boxer/Monster Glove Scale Correction (2026-08-10)

- Reduced both Boxer and Monster's generated glove accessories to `0.75×` of the prior rendered width/height through the shared `gloveScale` multiplier in `drawClassicBoxerGloves`.
- The reduction preserves the existing radius-relative mount, stacked guard composition, opponent-facing rotation, and Boxer-only live punch endpoint. Monster remains a static two-glove guard accessory.
- Regression coverage asserts the shared `const gloveScale = 0.75` contract. The browser QA capture is `artifacts/design-qa/identity5-gloves/boxer-monster.png` (no page/console/request errors).

## Classic Trident Throw and Impact Explosion (2026-08-10)

- The held Trident overlay now checks the live `trident-ammo` phase and disappears from the fighter during `outbound`, `stuck-wall`, `stuck-orb`, and `returning`; the separately rendered projectile remains the only visible trident until recall completes.
- Orb impacts now use a deterministic `44`-shard red/gray explosion with an expanding red shock ring, dashed gray echo ring, central flash, varied square shards, and a `1.55s` fade. The burst remains renderer-only and does not change Trident physics or damage.
- Advanced the Classic browser chain to `20260810-classic-trident-impact1`. The required web-game Playwright smoke produced `artifacts/design-qa/trident-impact1-smoke/shot-0.png` with no page/console/request errors; the targeted phase harness was interrupted before producing a new impact frame.
- Regression coverage asserts the thrown-phase hand hide, burst duration, particle count, and fade behavior. `npm test` passes `52/52`.

## Classic Trident Circular Impact Burst (2026-08-10)

- Replaced the square Trident impact shards with `64` large circular red/gray particles. They travel to a wider radius than the struck orb, use bright outlines and glow, and remain readable against the black Classic arena.
- The impact now has a larger red shock ring, a bright dashed gray echo ring, and a layered white/red circular flash at the exact orb-contact point. The deterministic `1.55s` fade and live throw/recall hand hide are unchanged.
- Advanced the browser chain to `20260810-classic-trident-explosion2`. `npm test` passes `52/52`; a fresh Playwright server launch was attempted but blocked by the local-port escalation environment, so no new screenshot is claimed for this revision.

## Classic Circular Projectile Impacts and Complete Announcer Roster (2026-08-10)

- Replaced the Trident orb-hit rings, gray shards, and square fragments with a deterministic `64`-circle burst that expands and fades over `0.82s`. Orb and bullet impacts use a fully red palette; Trident wall sticks use a separate dark-brown/light-brown palette. Both variants are filled circles only—no rings, gray pixels, or shard geometry—and are drawn from the `classic-projectile-hit` / `classic-trident-stick` event positions.
- The red burst is shared by Classic bullet-like projectile hits (`pistol-ammo`, `shotgun-ammo`, `rifle-ammo`, `draftmaster-ammo`, `sniper-ammo`, `shrapnel`, `batarang`, `fairy-ammo`, Necromancer arrows, bees, parasites, train rounds, commander rounds, charger, and the generic projectile). Trident wall impacts use the exact `wallContact` point supplied by Gameplay.
- Generated real Alex announcers for all 23 newer Classic-only IDs: Tripwire, Necromancer, Spikey, Virus, Cobwebs, Apple, Trapper, Hive Ball, Zeus, Glass Ball, Pistol, Shotgun, Rifle, Sawball, Cutter, Trident, Parasites, Train, Frost Ball, Boxer, Artist, Monster, and Fairy. Active files are in `assets/audio/announcer/generated-classic-overhaul/`; preserved sources and the manifest are in `assets/audio/source/classic-announcer-20260807/`.
- Wired the complete Classic roster through `INTRO_ANNOUNCER_ASSETS`, restored dedicated Classic clips where a shared Race alias previously masked a newer name, and advanced the browser/audio cache lineage to `20260810-classic-impact-audio3`. Focused audio/social tests and `npm test` pass `53/53`; a fresh browser smoke was blocked by the local environment refusing HTTP server port binding.

## Classic Blue Sun, Boxer, Health Markers, and Aimed Swords (2026-08-10)

- No new image assets were needed. The dedicated sword runtime remains `assets/generated/classic-weapon-rework/final/sword.png`; it is now used by both Sword and Draftmaster as an edge-mounted, opponent-facing accessory with smooth swing offsets. Pistol/Shotgun/Rifle continue using the explicitly authorized Draftmaster family.
- Classic Blue Sun now renders only its eight Gameplay-owned `blue-sun-laser` entities. The duplicate local fan was removed, and entity rays use `laserColor`/`glowColor` (`#22e9ff`/`#a6f8ff`) with the same evenly distributed rotating/contact endpoint contract as Orb Racer.
- `classic-ability-start`, `classic-heal`, and `classic-snake-growth` no longer route through the Forge pickup sample for Classic. Race-only Forge routes remain untouched; guns and Trident therefore produce no Forge pickup sound in Orb Foundry.
- HP marker ingestion now preserves every explicit health event with no `.slice()` storage/draw cap. Pistol rounds remain separate `-3` labels, web variants remain separate `-1` labels, and simultaneous changes are allowed to overlap while following the owning orb above its body.
- Boxer punch selection is locked to the closest hand at punch start. Only the selected glove uses the flying punch endpoint; the guard glove stays in its reference pose. A deliberately dual-active state still allows two independent five-damage hits.
- Cache lineage for this pass is `20260810-classic-blue-sun-sword-markers1` across the browser entry/import chain and announcer asset version. Focused audio/Classic/social coverage is 46/46; no new missing-file routes were introduced.
- Verification: elevated Playwright Chromium smoke passed against `http://127.0.0.1:4173/index.html?mode=classic` with one canvas, `#socialCanvas`, and `render_game_to_text` present; zero console errors, page errors, or failed requests. The generated picker capture is `artifacts/design-qa/classic-blue-sun-sword-markers1-smoke.png`. Full `npm test` currently reports 54 passing and one unrelated existing Orb Race `top-wall hits should remain bounded at the higher movement speed` failure in `tests/simulation.test.mjs:1106`.

## Classic Blue Sun Rays, Smooth Health Markers, and Held Swords (2026-08-10)

- Blue Sun now draws exactly eight entity-owned rays from the orb rim to the exact first wall/orb contact. The renderer undoes the entity-local rotation before using the world endpoint vector, preventing the prior all-horizontal/double-rotated appearance. Rays remain evenly distributed, continuously rotate, and use the Orb Racer cyan treatment with a dark under-stroke and contact cap.
- Health marker presentation is now an eased upward travel followed by a smooth opacity fade over 0.9 seconds. There is still no marker storage/draw cap; each Pistol `-3`, web `-1`, and heal `+` event remains independent and is positioned above the owning orb.
- Sword and Draftmaster sword accessories use the existing `assets/generated/classic-weapon-rework/final/sword.png`, cropped through `classicSwordSourceRect`, with a visible handle/guard mounted at the orb edge and live target-facing swing offsets.
- Cache lineage for this media pass is `20260810-classic-blue-sun-health-sword2`. Focused Classic/audio/social coverage is 47/47 and full `npm test` passes 56/56.
- Playwright client and targeted Blue Sun capture completed with zero page, console, or failed-request errors. Evidence: `artifacts/design-qa/classic-blue-sun-health-sword2/blue-sun-ray-frame-fixed.png` and `artifacts/design-qa/classic-blue-sun-health-sword2-client-final/`.

## Classic Target-Facing Sword Swing/Poke and Blue Sun Markers (2026-08-10)

- Regular Sword and Draftmaster's sword now use the dedicated `assets/generated/classic-weapon-rework/final/sword.png` as an edge-held accessory. The handle begins at the outer orb rim (`1.02r`) and the guard/hilt remains outside the orb, so the orb body and centered HP stay readable while the weapon tracks the nearest opponent.
- Regular Sword alternates deterministic target-facing attacks: a smooth swing whose active window deals `5`, then an extended straight poke whose active window deals `3`. The simulation exposes `classicSwordPhase`, `classicSwordAttackMode`, `classicSwordAngle`, `classicSwordDamage`, and `classicSwordSegment`; only the active segment can damage. Draftmaster keeps its existing swing damage roll and alternates to the same `3`-damage poke behavior.
- Blue Sun remains driven solely by its eight simulation-owned `blue-sun-laser` entities. Its `classic-blue-sun-hit` events are now in the discrete Classic marker classification, so each beam tick produces an individual upward/fading `-1` marker rather than a merged health delta.
- Cache lineage is `20260810-classic-team-announcer1-sword-poke1` across the browser entry/import chain and announcer asset version. No new image asset was needed for this pass.
- Regression coverage includes the edge-held sword pose, target-facing swing/poke alternation, `5`/`3` damage windows, Blue Sun discrete markers, and source/cache contracts. Focused Classic/social suites pass `45/45`; full `npm test` passes `59/59`.
- Browser evidence: `artifacts/design-qa/classic-sword-poke1-live-start.png`, `artifacts/design-qa/classic-blue-sun-sword-poke1-live.png`, `artifacts/design-qa/classic-blue-sun-sword-poke1-marker-frame.png`, and the required client smoke under `artifacts/design-qa/classic-sword-poke1-client/`. Playwright reported zero page errors, console errors, or failed requests.

## Classic Sword Hilt Crop and Top-Layer Fix (2026-08-10)

- Restored the complete diagonal sword cell by expanding `classicSwordSourceRect(...)` to retain the lower-right hilt/handle instead of cropping at the blade halfway point.
- Sword sprites are now anchored by their hilt just outside the orb rim, with the guard/handle bridging the rim and the blade extending toward the opponent. Sword and Draftmaster sword passes run after all Classic fighter bodies, so the orb cannot cover the weapon; centered HP remains visible.
- Advanced the browser/cache lineage to `20260810-classic-team-announcer1-sword-poke2`. No new asset was generated; the existing dedicated sword sprite remains the source.
- Added crop, hilt-distance, and post-fighter-layer regression assertions. Focused Classic/social coverage remains `45/45`; full `npm test` passes `59/59`.
- Required Playwright client smoke: `artifacts/design-qa/classic-sword-poke2-client/`. Live visual QA: `artifacts/design-qa/classic-sword-poke2-live.png` and `artifacts/design-qa/classic-sword-poke2-live-1s.png`; zero page, console, or failed-request errors.

## Classic Trident Throw and Hydrogen Sequence Audio (2026-08-10)

- The supplied `floraphonic-swing-whoosh-5-198498.mp3` is preserved at `assets/audio/source/classic-effects-20260810/floraphonic-swing-whoosh-5-198498.mp3` and served at `assets/audio/effects/classic-trident-throw.mp3`. `classic-projectile-fired` events from `fighterType: "trident"` resolve only to this sample, with a short rate-limit so one throw produces one whoosh.
- Classic Hydrogen now has an explicit presentation event contract: `classic-hydrogen-bomb-countdown-start` (`countdownSeconds: 60`) starts the existing looping `hydrogen-bomb-siren`; `classic-hydrogen-detonate` stops it and plays `hydrogen-bomb-explosion`; `classic-hydrogen-bomb-flash-start` plays `hydrogen-bomb-ear-ringing` for the four-second aftershock. The existing Orb Race event names and routes are unchanged.
- Classic continuous wall-beam marker feedback quantizes fractional `classic-dot-tick` damage for `laser`, `lazer`, `webball`, and `tripwire` into one visible `-1` per full health point. Discrete damage/heal markers and their smooth rise/fade behavior are unchanged.
- The renderer deduplicates the paired `classic-laser-pass` + `classic-dot-tick` records emitted for one Lazer line entry, eliminating duplicate `-1` labels and the misleading positive residual created by counting both records.
- Browser cache lineage for the combined audio/marker pass is `20260810-classic-trident-hydrogen-lazer-audio3` with the renderer variant `...-team-colors3` across the entry/import chain.
- Source/license note: the Trident clip is user-supplied; its download page and license terms were not provided. See `assets/audio/LICENSES.md` before public distribution.

## Classic Necromancer Arrows, Destruction Bursts, and Monster Punch Parity (2026-08-10)

- Necromancer minions now visibly load the generated normal arrow cell from `assets/generated/classic-visual-20260810-v2/final/necromancer-arrows-sheet.png` into each bow. The arrow is cropped from the vertical `normal/magic/impact` sheet, rendered horizontally behind the minion orb, and uses `CLASSIC_NECROMANCER_ARROW_RENDER_SCALE = 2` for both nocked and fired arrows. The original source/chroma file and frame manifest remain at `assets/generated/classic-visual-20260810-v2/source/necromancer-arrows-sheet-chroma.png` and `assets/generated/classic-visual-20260810-v2/manifest.json`.
- Classic fighter and disposable minion destruction now create `classic-destruction-burst` effects: deterministic filled circular particles expand and fade using the destroyed orb/minion's color and accent. Minions still avoid generic `knockout` events/audio; the burst is a separate visual-only seam, while main fighter KO behavior remains intact.
- Monster now uses the exact Boxer punch contract: shared `boxer` ability kind, `1.5s` interval, identical retract/extend/impact/recover phase durations, nearest-hand selection, capped reach, live target angle, flying active glove, and punch smoke trail. Monster retains its generated scaly-fist art and green orb skin.
- Renderer/social/simulation cache lineage is `20260810-classic-destruction-necromancer-monster1` with renderer variant `...-team-colors1` across the live entry/import chain. Focused source, simulation, and social regressions cover loaded arrows, 2× scale, both destruction paths, and Monster parity.

## Classic Punch, Bounce, Blue Sun Charge, Vampire, and Health Marker Timing (2026-08-10)

- Preserved the supplied `soraatwod-punch-416719.mp3` at `assets/audio/source/classic-effects-20260810/soraatwod-punch-416719.mp3` and served it as `assets/audio/effects/classic-boxer-punch.mp3`. Classic Boxer ability starts now use this clip instead of the old critical-hit cue; Orb Race routes are unchanged.
- Promoted the previously supplied Vampire hiss from `assets/audio/source/race-effects-20260729/alesiadavina-female-vampire-attack-hiss-sound-effect-dark-sfx-552126.mp3` into the Classic source archive at `assets/audio/source/classic-effects-20260810/alesiadavina-female-vampire-attack-hiss-sound-effect-dark-sfx-552126.mp3` and serve it as `assets/audio/effects/classic-vampire-hiss.mp3` for Classic Vampire latch starts.
- Classic `impact` and `wall-hit` events now use the existing `orb-collision-pop.mp3` bounce sample, covering orb-to-orb and orb-to-wall rebounds without changing Orb Race mixing. Classic Blue Sun ability starts reuse the established Orb Race `black-hole-impact` charge cue.
- Classic `+HP`/`-HP` markers remain individual and centered above their owning orb, stay fully visible for `0.5s`, then ease-fade to zero at `1.0s`.
- The source/runtime mappings and byte sizes are recorded in `assets/audio/source/classic-effects-20260810/manifest.json`; supplied-source rights remain unverified in `assets/audio/LICENSES.md`.
- Browser/audio cache lineage is `20260810-classic-punch-bounce-sun-vampire1` with renderer/social variant `...-team-colors1`.
- Verification: focused audio/social tests pass 5/5, `tests/classic-rework.test.mjs` passes 53/53, and full `npm test` passes 68/68. Playwright smoke and targeted Boxer/Vampire/Blue Sun captures report zero console errors, page errors, or failed requests. Evidence: `artifacts/design-qa/classic-punch-bounce-sun-vampire1-client/` and `artifacts/design-qa/classic-punch-bounce-sun-vampire1-targeted/`.

## Classic Vampire Latch, Absorber Models, and Necromancer Bow Animation (2026-08-10)

- Vampire hiss audio is now explicitly gated to `classic-ability-start` events whose `abilityKind` is `vampire`, `latchPhase` is `latched`, and `latched` is true. The generic Necromancer minion `classic-projectile-fired` route is silent, while the Necromancer summon cue remains available on `classic-ability-start`.
- Vampire's visual overlay still anchors at `fighter.x/y`, but returns before drawing any teeth once the Gameplay latch state is active. The latched drain/health markers remain the visual confirmation of contact.
- Classic Absorber now records `classicAbsorbedOrbId`, `classicAbsorptionHistory`, `classicAbsorptionStartedAt`, `classicAbsorbingUntil`, and `classicAbsorptionSequence`. During the 1.15-second absorption window, the renderer draws the actual absorbed Classic orb model (including its dedicated details) on a pink converging path. The history is exposed below the CTA as `ABSORBED: ...` in `drawClassicStatDock` and `render_game_to_text`.
- Generated bow/reload asset pack: source `assets/generated/classic-necromancer-bow-20260810-v1/source/necromancer-bow-animation-sheet-chroma.png`, transparent final `assets/generated/classic-necromancer-bow-20260810-v1/final/necromancer-bow-animation-sheet.png`, exact prompt `assets/generated/classic-necromancer-bow-20260810-v1/prompts.md`, and manifest `assets/generated/classic-necromancer-bow-20260810-v1/manifest.json`. It is a four-cell horizontal GPT Image sheet: ready/nocked, draw, release, and reload. Alpha validation confirmed RGBA output, transparent corners, and opaque subject pixels; nearest-neighbor rendering is enforced.
- Necromancer soldiers use the generated sheet for their bow accessory and derive the frame from the deterministic `lastShotAt`/`nextShotAt` state. Fired arrow projectiles remain the separate generated arrow asset and are now `2.5×` the base render scale (1.25× the previous 2× scale).
- Browser lineage is `20260810-classic-vampire-absorber-necromancer2` with renderer/social variant `...-team-colors1` across the live entry/import chain.
- Verification: `npm test` passes 73/73. Required client evidence is in `artifacts/design-qa/classic-vampire-absorber-necromancer2-client/`; focused visual evidence is `artifacts/design-qa/classic-vampire-absorber-necromancer2-targeted/vampire-latched-no-fangs.png`, `absorber-model-history.png`, and `necromancer-bow-release.png`. Playwright reported zero console errors, page errors, and failed requests.

## Classic Vampire Tick Audio, Boxer Two-Hit Criticals, and Necromancer Scale (2026-08-10)

- Every Classic Vampire `classic-dot-tick` with `dotKind: "vampire-latch"` now routes the supplied `classic-vampire-hiss` sample without rate-limit suppression, preserving one cue for every one-second Gameplay damage tick. The initial latched ability cue remains gated to the latched state.
- Boxer and Monster now count successful single-fist punches in `classicPunchLandedCount`. After two landed punches, the next committed punch sets `classicPunchDouble`, keeps both opponent-facing gloves active through wind-up/extension/impact, deals `5 + 5 = 10` when both land, resets the cycle, and emits one `classic-critical` event that uses the existing `critical-hit` sample. Missed punches do not consume the armed critical.
- The existing generated Necromancer four-frame bow sheet remains the source; no new GPT asset was needed. `CLASSIC_NECROMANCER_BOW_RENDER_SCALE = 2` doubles the held bow sheet and `CLASSIC_NECROMANCER_ARROW_RENDER_SCALE = 5` doubles the prior `2.5×` fired/nocked arrow scale. Nearest-neighbor rendering and transparent source/final assets are unchanged at `assets/generated/classic-necromancer-bow-20260810-v1/`.
- Added render-text fields for `punchDouble` and `punchLandedCount`, plus focused audio and deterministic cycle regressions. Browser cache lineage is `20260810-classic-vampire-boxer-crit-necromancer3` with renderer/social variant `...-team-colors1`.
- Verification: `node --test tests/classic-audio.test.mjs tests/classic-rework.test.mjs tests/social.test.mjs` passes 64/64 and `npm test` passes 74/74. Required client smoke is under `artifacts/design-qa/classic-vampire-boxer-crit-necromancer3-client/`; targeted visual evidence is `artifacts/design-qa/classic-vampire-boxer-crit-necromancer3-targeted/vampire-latched-tick.png`, `boxer-double-critical.png`, and `necromancer-bow-arrow-2x.png`. Playwright reported zero console errors, page errors, or failed requests.

## Classic Double-Punch Marker Consolidation and Necromancer Bow Aspect (2026-08-10)

- A Boxer/Monster two-fist critical still emits two deterministic `classic-punch-hit` damage events for gameplay/audio, but Classic health feedback now groups the same-target critical contacts into one visible `-10` transaction. The presentation-only `classic-critical` announcement is excluded from marker accounting, preventing the old `-5`, `-5`, `-10`, and misleading `+10` residual stack.
- Necromancer minion arrows are now rendered at `3.75×`, exactly `0.75×` of the prior `5×` pass, for both nocked and fired arrow cells. The generated bow remains at its requested `2×` scale, but its width is derived from the generated frame's native aspect ratio instead of the previous independent width/height pair, so the bow is no longer stretched.
- No asset was regenerated: the existing transparent GPT Image bow sheet remains at `assets/generated/classic-necromancer-bow-20260810-v1/final/necromancer-bow-animation-sheet.png`, with source/prompt/manifest preserved beside it.
- Browser cache lineage is `20260810-classic-vampire-boxer-marker-necromancer4` with renderer/social variant `...-team-colors1` across the live entry/import chain.
- Verification: focused audio/Classic/social coverage passes `66` tests and full `npm test` passes `76/76`. The required Playwright client smoke is under `artifacts/design-qa/classic-vampire-boxer-marker-necromancer4-client/`; targeted Boxer and Necromancer captures are `artifacts/design-qa/classic-vampire-boxer-marker-necromancer4-targeted/boxer-double-critical.png` and `necromancer-bow-arrow-075x.png`. All browser captures reported zero console errors, page errors, and failed requests.

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

- Cutter now owns a strict `1` damage-per-second cadence (`dps: 1`, `tickInterval: 1`). While an opposing fighter or summon remains inside the active red polygon, Gameplay emits exactly one `classic-dot-tick` with `amount: 1` per second, including for Necromancer soldiers and Duplicator clones.
- Overdue Cutter timers now reschedule from the current simulation time instead of incrementing through a stale backlog. A delayed frame or newly entered area therefore produces one current `-1` transaction and waits a full second for the next one; it cannot burst six rapid ticks into the marker stream.
- The existing shared `HEALTH_MARKER_TIMING` contract remains the renderer path for every Classic orb and both damage/heal directions: `0.5s` fully visible hold, eased upward travel, and complete fade at `1.0s`. The Classic arena invokes `drawClassicHealthMarkers(...)` once for the whole fighter roster, so Cutter uses the same readable fade as every other orb.
- Advanced the browser cache lineage to `20260810-classic-cutter-overlap-health6` with renderer/config variants `...-team-colors1`; all live Classic imports and the renderer test import use the new key.
- Verification: focused Classic/social coverage passes `65/65`; full `npm test` passes `79/79`. Playwright loaded the health6 module chain, saved `artifacts/design-qa/classic-cutter-overlap-health6-targeted/cutter-health6-smoke.png`, and reported zero console errors, page errors, or failed requests.

## Classic Independent Trapper Ropes, Throw Animation, and Full Virus HP (2026-08-10)

- Generated and visually inspected a new four-cell Trapper accessory sheet with one complete closed loop in each cell: wind-up, swing, throw, and deployed. Source: `assets/generated/classic-visual-20260810-v5/source/trapper-lasso-animation-sheet-chroma.png`; cleaned final: `assets/generated/classic-visual-20260810-v5/final/trapper-lasso-animation-sheet.png`; prompt and cell manifest: `assets/generated/classic-visual-20260810-v5/prompts.md` and `assets/generated/classic-visual-20260810-v5/manifest.json`. The generated white cell dividers were removed locally; the source remains preserved.
- Trapper now spawns three separate deterministic lasso entities with seeded, separated anchors, staggered wind-up/swing/throw timing, a thick two-tone rope from the live Trapper orb to each lasso, and one closed loop per entity. A caught target is constrained with a slight lateral wiggle only; the loop and rope follow that target and tick `3` damage per second without merging the three visuals into one cage.
- The first lasso is drawn on the top accessory layer during wind-up so Trapper visibly holds it like the gun/Trident weapon overlays; queued lasso entities stay hidden until their own throw begins.
- Virus now uses `assets/generated/classic-visual-20260810-v4/final/virus-orb.png` as the complete orb body with no simple orb underneath. Centered HP remains game-drawn. The shared health marker renderer gives the generated Virus rim extra clearance, so Cutter/Cobweb and other DOT `-1` markers still follow the Virus cleanly above its silhouette.
- Render text exposes lasso phase/index/group/anchor/target fields for deterministic QA. Browser cache lineage is `20260810-classic-trapper-ropes-virus-full1-team-colors1-footer-copy6-race-hud1-virus-health1`; the underlying renderer chain is `...-team-colors1`.
- Verification: focused Classic/social coverage passes 65/65. Full Playwright evidence is in `artifacts/design-qa/classic-trapper-ropes-virus-full1/`: `trapper-virus-windup.png`, `trapper-virus-throwing.png`, `trapper-virus-deployed.png`, `trapper-virus-caught.png`, `cobweb-virus-health.png`, and `cutter-virus.png`. Captures loaded the new cache chain with zero console errors, page errors, or failed requests.

## Classic Trapper Circular Lasso Scale and Independent Placement (2026-08-10)

- Generated and inspected the v6 lasso accessory source/final: `assets/generated/classic-visual-20260810-v6/source/trapper-lasso-animation-sheet-chroma.png`, `assets/generated/classic-visual-20260810-v6/final/trapper-lasso-animation-sheet.png`, with exact prompt and manifest in the same folder. The cleaned final is padded into four square 724px cells without scaling the generated pixels; this removes the former rectangular-cell stretch.
- Deployed Trapper traps now use a native-aspect animation during wind-up/throw and a procedural perfect circular rope for the stationary trap. The deployed diameter is `3.64 × entity.radius`, exactly twice the previous `1.82 × radius` diameter. Caught targets receive a separate rope circle around their current body, with the existing owner-to-lasso rope still visible.
- Each lasso anchor now uses its own seeded random point across the usable arena interior rather than a three-spoke radial fan. The random anchor margin and separation are derived from the enlarged loop radius so circles stay fully inside the arena without intertwining. `tracking: false` is recorded on the entities; the lasso stays at its random anchor and only the caught target follows the tightening wrap. The held lasso uses the random throw angle, a 3× accessory scale (`5.16 × fighter.radius`), four generated frames, and 2.5 rotations during wind-up.
- Updated browser cache lineage to `20260810-classic-trapper-lasso-v6-random1-team-colors1-footer-copy6-race-hud1-virus-health1` (renderer `...-team-colors1`) across the live entry/import chain.
- Focused tests cover independent seeded angles, no target tracking, square-cell asset metadata, native-aspect rendering, circular wrap geometry, and the enlarged scales. Fresh Trapper/Virus Playwright captures are in `artifacts/design-qa/classic-trapper-lasso-v6-random1/` (`trapper-virus-windup.png`, `trapper-virus-throwing.png`, `trapper-virus-deployed.png`, `trapper-virus-caught.png`, and `cobweb-virus.png`); the cache-busted run reported zero console errors, page errors, and failed requests.

## Classic Lasso Artwork and Per-Tick Health Values (2026-08-10)

- The v6 generated lasso sheet is now used for stationary deployed loops and caught-target wraps as well as wind-up/throw frames. The old procedural brown-circle fallback is removed; deployed and caught loops use frame 3 with a deliberate `1.18×` horizontal widening while preserving the padded square source cells and nearest-neighbor edges. The owner-to-lasso rope remains a separate thick two-tone strand.
- Classic health markers now preserve explicit gameplay event amounts. Blue Sun displays `-5`, Vampire/Necromancer/Snake/Trapper retain their configured damage per tick, and Cutter retains its configured whole tick instead of being mislabeled `-1`; fractional Lazer/Cobweb/Cutter-style events still aggregate until a whole point is available, then show one truthful whole-value marker. The shared `0.5s` hold / `1.0s` fade contract remains unchanged.
- Cache lineage is now `20260810-classic-trapper-lasso-v6-random1-health-values1-team-colors2-footer-copy6-race-hud1-virus-health1` with renderer `...-team-colors2` across the live entry/import chain.
- Verification: `npm test` passes 84/84. Fresh cache-busted Playwright evidence is in `artifacts/design-qa/classic-trapper-lasso-v6-health-values1/` (`trapper-virus-windup.png`, `trapper-virus-throwing.png`, `trapper-virus-deployed.png`, `trapper-virus-caught.png`, `cobweb-virus.png`, and final matchup captures); the run loaded the new import chain with zero console errors, page errors, or failed requests.

## Classic Trapper Lasso Cage, Virus Body, Cobweb Clock, and Shrapnel Pass (2026-08-10)

- Generated and inspected the corrected Trapper lasso sheet with a genuinely closed first/left loop. Source: `assets/generated/classic-visual-20260810-v4/source/trapper-lasso-sheet-chroma.png`; transparent final: `assets/generated/classic-visual-20260810-v4/final/trapper-lasso-sheet.png`; exact prompts and cell manifest: `assets/generated/classic-visual-20260810-v4/prompts.md` and `assets/generated/classic-visual-20260810-v4/manifest.json`.
- Generated the original Virus body from the supplied silhouette reference, removed the magenta chroma background, and inspected the final alpha edges. Source: `assets/generated/classic-visual-20260810-v4/source/virus-orb-chroma.png`; final: `assets/generated/classic-visual-20260810-v4/final/virus-orb.png`. HP remains a centered game-drawn label; the asset is the complete lime body with rim protrusions.
- Trapper now creates one deterministic three-lasso cage entity. Three closed loop cells form a rough circle, tighten around a caught fighter/minion, constrain and wiggle the target, and deal one `3` damage transaction each second. Cobweb’s generic scheduler now resets its next tick from current simulation time, preventing stale-clock bursts.
- Classic Shrapnel projectiles use the dedicated shard cell from `assets/generated/orb-race-tactical-20260731/final/shrapnel-sheet.png` at roughly twice the prior visible length. No new Shrapnel source was generated because the existing dedicated asset was explicitly requested.
- Browser lineage is `20260810-classic-cobweb-trapper-virus-shrapnel2` with renderer/social variants `...-team-colors1` and `...-footer-copy5`. Focused Classic/social tests pass; Playwright evidence is `artifacts/design-qa/classic-trapper-virus-v4/trapper-virus.png` and `cobweb-virus.png`, with zero console errors, page errors, or failed requests.

## Classic Lasso, Necromancer, Sword, and Parasite Follow-up (2026-08-10)

- The held Trapper lasso now turns `1.25` revolutions through its wind-up instead of the previous `2.5`, preserving the generated v6 sheet's native aspect and the three independent random throws.
- Classic destruction bursts are now intentionally wide and brief: `0.52s`, `72` filled circular particles, and `1.5×` spread. They share the orb/bullet impact palette and do not add rings or shards.
- The supplied summon audio is preserved at `assets/audio/source/classic-effects-20260810/universfield-spell-casting-229208.mp3`, served as `assets/audio/effects/classic-necromancer-summon.mp3`, and listed in `assets/audio/source/classic-effects-20260810/manifest.json`. It routes only from the Necromancer `classic-ability-start` summon event; minion arrow releases and other Necromancer phases remain silent. During the lift, the generated skull accessory is the only summon accessory over the simple purple orb/HP; minions begin their own ground reveal after the lift.
- Necromancer soldiers expose a clipped half-body, three-quarter-body, then full-body reveal over exactly one second. Their seeded movement and shot clocks stay deterministic, while HP is drawn only once the soldier is fully visible.
- Sword and Draftmaster sword overlays now mount at `1.34r` at the orb edge, use a forward extension for poke attacks, and use a shared two-pass sine sweep for the definitive back-and-forth slash. Gameplay collision segments consume the same angles and reach.
- Parasite hits create independent, unbounded `classic-parasite` carriers. Each carrier is a physical five-health entity that orbits its host perimeter, clamps/reverses at walls, renders the full parasite design above the host, and can be destroyed by an opposing projectile/weapon; its DOT is removed in the same fixed step. Carrier HP is intentionally not displayed.
- Current cache lineage is `20260810-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2` with renderer/social suffix `...-team-colors3`; focused tests cover audio routing, emergence phases, destruction sizing, sword geometry, and multiple carrier removal.

QA evidence for this pass is in `artifacts/design-qa/classic-followup-20260810-v4/`: Trapper wind-up/deploy/caught frames, Necromancer skull-lift and staged minion frames, Sword attack frames, and a deterministic seed-4 Parasite carrier frame. The fresh Playwright run loaded the cache-busted `main.js`, `simulation.js`, `audio.js`, `social-renderer.js`, `renderer.js`, `social.js`, `config.js`, and `classic-orbs.js` chain with zero console errors, page errors, failed requests, or render-text failures. Focused Classic/audio/social tests are green; the workspace-wide suite still has one unrelated pre-existing `tests/simulation.test.mjs:1111` top-wall-hit threshold failure.

## Classic Trapper Throw, Catch, and Damage Audio (2026-08-11)

- Preserved the supplied throw clip at `assets/audio/source/classic-effects-20260810/u_bnbrkm8sva-yeehaw-1-203838.mp3` and served it unchanged as `assets/audio/effects/classic-trapper-throw.mp3` (201216 bytes). It plays once for each lasso's deterministic transition into `trapPhase: "throwing"`.
- Preserved the supplied catch clip at `assets/audio/source/classic-effects-20260810/freesound_community-mixed-whip-crack-1-102825.mp3` and served it unchanged as `assets/audio/effects/classic-trapper-caught.mp3` (39840 bytes). It plays once when an individual lasso first assigns `trapTargetId` and enters `trapState: "tightening"`; re-catching after release can announce again.
- Every Trapper `classic-dot-tick` with `dotKind: "trap"` routes to the existing `orb-collision-pop.mp3` shared damage/bounce cue. Its audio plan deliberately uses `rateLimit: 0`, so each one-second `3 HP` trap transaction can be heard without hiding a tick behind the previous cue.
- Simulation events are `classic-trapper-throw` and `classic-trapper-caught`; the existing `classic-dot-tick` event remains the damage seam. Source/runtime byte identity and the new mappings are recorded in `assets/audio/source/classic-effects-20260810/manifest.json` (`classic-effects-20260810-v3`). Supplied-source rights remain unverified in `assets/audio/LICENSES.md`.
- Advanced the live cache lineage to `20260810-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio1`, with renderer/social and entry variants carrying the existing `team-colors3`, footer, race-HUD, virus-health, and Classic-top-stats suffixes. `SAMPLE_ASSET_VERSION` now includes `trapper-audio1`.
- Verification: focused Classic/audio/social tests pass `76/76`. Full `npm test` passes `85/86`; the only remaining failure is the known unrelated `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion. Standard client evidence is in `artifacts/design-qa/classic-trapper-audio-client/`; targeted Trapper evidence and audio-plan output are in `artifacts/design-qa/classic-trapper-audio-targeted/` (`trapper-audio-0580cs.png`, `result.json`). The cache-busted targeted browser run reported zero console errors, page errors, and failed requests.

## Classic Trapper Yeehaw Offset (2026-08-11)

- Audio analysis of the preserved 6.29-second source located the first strong Yeehaw onset at approximately `1.5s`; the previous `0s` route only played the opening lead-in before the vocal.
- `classic-trapper-throw` now keeps the full source/runtime MP3 unchanged but sets the Web Audio `offset` to `1.5`, with the existing `1.2s` duration cap. The catch and trap-damage routes are unchanged.
- Advanced the browser/sample cache lineage to `20260810-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio2`; `SAMPLE_ASSET_VERSION` now includes `trapper-audio2`.
- Added an audio-plan regression asserting the `1.5s` offset. Focused Classic/audio/social coverage remains green at `76/76`; full `npm test` remains `85/86` because of the unrelated existing `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion.

## Classic Trapper Whip-Crack Damage Audio (2026-08-11)

- Trapper damage ticks now use the same `classic-trapper-caught` sample as a lasso catch, so the supplied whip crack plays for every `classic-dot-tick` with `dotKind: "trap"`. The route remains uncapped (`rateLimit: 0`) and does not change the one-second Gameplay damage cadence.
- Advanced the live cache lineage to `20260810-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio3`; `SAMPLE_ASSET_VERSION` now includes `trapper-audio3`. The Yeehaw throw offset remains `1.5s`.
- Focused Classic/audio/social coverage remains `76/76`. The targeted browser plan check reports `classic-trapper-caught` for both catch and trap damage with no console, page, or request errors.

## Orb Race Blue Sun Rotation Isolation (2026-08-11)

- Restored Orb Race Blue Sun's presentation contract independently from Classic/Orb Foundry: one seeded phase creates eight evenly spaced ray bases, and every active ray advances by the shared `1.8 rad/s` rotation speed. The physical endpoint still recomputes against the first wall/number-line contact each fixed step, so damage follows the rotating beams.
- Classic `blue-sun-laser` entities and their current evenly distributed/contact-bounded renderer were not changed. Only the `raceBlueSun*` path was updated; the browser chain is cache-busted with `...-audio3-race-blue-sun1`.
- Added Orb Race regression coverage for equal angular gaps and smooth per-frame rotation while keeping the seeded base phase stable. Focused Classic/features/social coverage passes `73/73`.
- Targeted captures: `artifacts/design-qa/orb-race-blue-sun1-targeted/blue-sun-rotating-start.png` and `blue-sun-rotating-followup.png`; the preserved Classic path is captured at `artifacts/design-qa/orb-foundry-blue-sun-preserved1/blue-sun-classic-current.png`. Both cache-busted runs reported zero console errors, page errors, and failed requests. Full `npm test` remains `85/86` because of the unrelated existing `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion.

## Orb Race Long-Form Blue Sun Boundary Overflow (2026-08-11)

- Long-form Blue Sun rays now retain the simulation-owned wall endpoints while reserving a radius-aware visual overflow above the camera/header boundary. This keeps the cyan outline, glow, and wall end-cap complete instead of slicing the ray at the non-physical viewport clip. Side and bottom board boundaries remain clipped by the outer race frame.
- `raceBlueSunLaserClipModeFor(...)` keeps portrait rays isolated to their world rectangle; long-form rays rely on the parent lane clip. `raceLongformBlueSunOverflowFor(...)` derives the overflow from the live Blue Sun orb scale, and wall end-caps are drawn for top/side contacts as well as number-line contacts.
- No new raster assets were needed. The live social-renderer/entry cache lineage is `...-side-footer-checkers1-longform-blue-sun1`.
- Focused Classic/features/social coverage passes `73/73`; `npm test` remains `85/86` only because of the unrelated existing `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion. Final Playwright evidence is in `artifacts/design-qa/blue-sun-longform-final/` and portrait regression evidence is in `artifacts/design-qa/blue-sun-portrait-final/`; both report empty browser error lists. The required standard client evidence is `artifacts/design-qa/blue-sun-longform-final-client/shot-0.png`.

## Orb Race Long-Form Blue Sun Indefinite Rays (2026-08-11)

- Long-form Blue Sun visuals now extrapolate each active ray through the simulation's virtual number-line/top-wall endpoint and continue it to the actual visible lane rectangle. Virtual barriers no longer stop or cap the ray; only the real outer board frame clips it.
- Gameplay remains unchanged: the simulation still uses its wall-bounded segments for layer damage. Portrait rendering keeps the original physical endpoint behavior.
- Advanced the social-renderer/entry cache lineage to `...-side-footer-checkers1-longform-blue-sun2`. The live extension helper is `raceBlueSunLongformEndpointFor(...)` with regression coverage for continuing a ray through a virtual wall.
- Updated QA evidence: `artifacts/design-qa/blue-sun-longform-final/t3.png` visibly carries rays across multiple long-form layer cards, while `artifacts/design-qa/blue-sun-portrait-final/blue-sun-portrait.png` remains unchanged. Both dedicated browser error manifests are empty.

## Orb Race Long-Form Blue Sun Physical Number-Line Contact (2026-08-11)

- Supersedes the previous all-ray extension: only a long-form `hitSurface: "top-wall"` ray, which is the cleared/virtual ceiling, continues through the viewport. A ray whose simulation hit is the real active number line keeps its exact physical endpoint and visible contact cap; a side-wall hit does the same.
- Gameplay and damage remain unchanged. The renderer uses `raceBlueSunLongformShouldExtendThroughBarrier(...)` to distinguish the virtual top barrier from the visible number-line and outer side-frame contacts. Portrait keeps its existing world-bound behavior.
- Advanced the live social-renderer/entry cache lineage to `...-side-footer-checkers1-longform-blue-sun3`. Regression coverage asserts top-wall extension and preserves number-line/side-wall endpoints.
- Fresh evidence: `artifacts/design-qa/blue-sun-longform-final/t3.png`, `artifacts/design-qa/blue-sun-portrait-final/blue-sun-portrait.png`, and `artifacts/design-qa/blue-sun-longform-final-client/shot-0.png`; dedicated captures report empty browser error lists. Focused social tests pass; full `npm test` remains `85/86` because of the unrelated `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion.

## Classic Batman Orb, Necromancer Teleport, Trident Recall, and Weapon QA (2026-08-11)

- Generated and inspected the original Batman orb body with the built-in GPT image workflow. The source is `assets/generated/classic-batman-orb-20260811-v1/source/batman-orb-chroma.png`; the cleaned RGBA final is `assets/generated/classic-batman-orb-20260811-v1/final/batman-orb.png`; the exact prompt and processing manifest are `assets/generated/classic-batman-orb-20260811-v1/prompt.md` and `manifest.json`. The final has transparent corners, a white pixel outline, dark circular body, angular mask, and gold utility belt, with no HP/text baked into the art.
- The generated Batman orb is now the complete body in Classic and Orb Race. Both renderers draw the game-owned HP after the body pass, centered over the mask/belt area. Classic Batman batarangs are 2× larger and Orb Race batarangs use the same 2× scale; the existing Orb Race symbol remains only as a fallback while the new asset loads.
- Necromancer soldiers no longer use the staged ground clip. The existing transparent `assets/race/generated/black-hole-teleport.png` now renders behind the complete minion during its emergence, with a smooth one-second reveal and no HP until the minion is fully visible.
- The user-supplied Trident throw clip remains preserved at `assets/audio/source/classic-effects-20260810/floraphonic-swing-whoosh-5-198498.mp3`. `assets/audio/effects/classic-trident-recall.mp3` is a separately encoded reverse of the throw clip (FFmpeg `areverse`) and routes from `classic-trident-recall`. Sawball `classic-projectile-hit`/`projectileKind: "saw"` now routes to the existing `weapon-hit` sword-impact sample. Rifle's held generated sheet flips only on its local vertical axis so its muzzle still aims at the opponent.
- Browser cache lineage is `20260811-...-necro-teleport-batman-batarang1` for the entry/social path, `...-necro-teleport-batman-rifle1` for the renderer, and `...-trident-recall1` for audio. Focused audio/social tests pass. Playwright evidence is under `artifacts/design-qa/classic-batman-necro-rifle-20260811/` (`classic-batman-orb-batarang.png`, `classic-necromancer-teleport-minion.png`, `classic-rifle-held-orientation.png`, and `orb-race-batman-batarang.png`); it reported zero console errors, page errors, or failed requests. Full `npm test` still has the known unrelated `tests/simulation.test.mjs:1111` top-wall-hit threshold failure; no simulation files were changed in this pass.

## Orb Race Batman Defensive Grappler (2026-08-11)

- No new GPT image was generated for this request. Per the user's explicit reuse instruction, the grapple hook uses the existing Orb Race batarang asset: `assets/race/batarang-transparent.png`.
- `src/simulation.js` owns the deterministic `raceBatmanGrapple` state, seeded fixed target, opening/fresh threat cursor, and `10s` cooldown. `src/social-renderer.js` owns the rope, launcher collar, black interior/white outline compositing, and 2× batarang-model hook in portrait and long-form canvases. Centered Batman body/HP rendering remains separate.
- QA evidence: `artifacts/design-qa/batman-grapple-20260811/portrait-firing.png`, `longform-firing.png`, matching `*.json`, and `diagnostics.json`. Cache lineage is `...-batman-batarang1-batman-grapple3`.

## Classic Per-Orb Health, Boss Announcements, Hive Bees, and Apple Projectiles (2026-08-11)

- Historical note: the interim per-card `ORB HEALTH` controls were removed in the follow-up rollback below. Classic setup now exposes no health input and starts fighters at `100` HP.

### Health control rollback (2026-08-11)

The setup UI now removes all orb-health inputs entirely. Newly started Classic fighters use the fixed default of `100` HP; the normalized per-orb health fields and legacy Hydrogen key remain only as non-UI compatibility data for previously encoded settings.
- `BOSS ANNOUNCEMENT` appends `BOSS` to the Classic display name and inserts a semantic `race-boss` announcer cue after that orb's name. Until a dedicated Boss recording is supplied, `race-boss` safely aliases the existing generated `race-buffed` clip and therefore makes no missing-file request.
- Hydrogen Bomb now derives `maxHealth` from its own card, so custom values are also the centered game-owned HP rendered over the generated bomb-symbol orb. All other Classic fighters use their own per-card health independently.
- GPT Image asset pack: source/final/prompt/manifest/alpha records are in `assets/generated/classic-hive-apple-20260811-v1/`. The generated bee final is `final/hive-bee-projectile.png`; it is the Hive's large tracked attack and keeps the Hive body as a plain Classic orb. The generated Apple final is `final/apple-orb-projectile.png`; it is used only by the Apple projectile thrown toward a seeded in-arena destination every three seconds. The earlier honeycomb body concept (`final/hive-orb.png`) is preserved as unwired provenance after the user clarified the asset split.
- Hive attacks now spawn with radius `10` (2× the previous bee radius), track the selected fighter/minion target, and deal `3` damage on contact. Apple throws now choose deterministic seeded destinations inside the current arena and travel to/land there before applying the existing owner heal/opponent damage behavior.
- Browser lineage advanced to `...-classic-boss-health-apple-hive2` across the changed Classic module chain. Focused coverage includes per-orb health/Boss normalization and cue order, Hydrogen custom health, deterministic Apple destinations, Hive damage/radius/tracking, asset roles, and the absence of the global setup field.

## Classic Cowboy, Glass, Zeus, Frost, and Fairy Visual Pass (2026-08-11)

- The stable Classic ID remains `trapper` for saved settings and replay compatibility, while the visible name and Alex announcer are now **Cowboy**. The generated clip is `assets/audio/announcer/generated-classic-overhaul/classic-cowboy.mp3`; the preserved source copy is `assets/audio/source/classic-announcer-20260807/classic-cowboy.mp3`. The runtime cue maps `intro-trapper` to the Cowboy clip without changing the stable ID.
- GPT Image sources, transparent runtime finals, exact prompts, and alpha validation are versioned in `assets/generated/classic-visual-20260811-v1/`: `final/glass-drops.png`, `final/zeus-greek-circles.png`, `final/frost-trail.png`, and `final/fairy-accessories.png`. The matching chroma sources are in `source/`, with prompt text in `prompts.md`, frame/role metadata in `manifest.json`, and RGBA/corner checks in `alpha-validation.json`.
- Glass Ball now uses the four-frame generated glass-drop sheet for its spawned shards. Zeus's three deterministic thrown circles animate from the Zeus origin to their seeded destinations and use the Greek talisman sheet with a generated chain-link trail. Frost Ball uses the four-frame snowflake/snow-patch trail with age/fade-driven frame selection.
- Fairy keeps the existing orb body, but its generated accessory sheet is split into independent left and right wing crops. The wings flap between authored up/down frames while moving; the tiara remains above the orb, and the wand is aimed toward the live opponent. Direct Fairy state now emits homing `fairy-ammo` casts with a short wand-cast window. No combined wing sticker is drawn over the orb.
- Gameplay tuning in this pass makes Hive bees half speed and 3× their former radius/scale, makes Apple's thrown projectile 2× larger, and keeps both generated assets attack/projectile-only so the orb bodies remain game-drawn.
- Monster's two generated glove positions consume one shared authored-facing crop and rotate together toward the opponent, so the fists no longer point in opposing directions. Existing punch/smoke behavior is unchanged.
- Browser module cache lineage advanced through `...-classic-visual1` for the live renderer/audio/simulation/social import chain. Focused Classic audio/rework/social coverage passes `91/91`, and the full repository suite passes `101/101`. Playwright evidence is in `artifacts/design-qa/classic-visual-20260811/` (`fairy-zeus.png`, `fairy-zeus-cast.png`, `glass-frost.png`, and `diagnostics.json`); the live browser requested all four new finals with zero console errors, page errors, or failed requests.
## Classic Health Controls, Reactor Audio, and Batman Body Refresh (2026-08-11)

- Classic setup now renders an individual `HP` number input inside every orb card's `ORB OPTIONS` panel. `normalizeClassicOrbHealth` clamps values to `1–1,000,000`, defaults new cards to `100`, and `readSetup()` serializes each selected team/orb independently. Simulation fighter `maxHealth` and centered Classic HP text consume the selected card value, including Hydrogen Bomb.
- Reactor's Classic body/ring ramps from `#168cff` toward `#9de9ff` using the deterministic `classicReactorCharge`; its explosion route now plays the complete `assets/audio/effects/black-hole-impact.mp3` sample (`maxDuration: 4.73`) instead of the prior shortened cut.
- Generated/inspected visual assets are in `assets/generated/classic-visual-20260811-v2/`: Batman body/point pair/batarang, Fairy 8-cell accessories, Fairy 4-cell projectile, and Zeus 4-cell chain lightning. The integrated Batman body is in the versioned `assets/generated/classic-visual-20260811-v4/` pack: `final/batman-orb-with-ears.png`, with source, exact GPT prompts, manifest, and alpha validation alongside it. Its pointy triangles are authored GPT-generated layers connected to the body silhouette; HP remains game-drawn over the tan center. The image service rejected direct inpainting, so the final uses the two inspected GPT-generated layers composited and chroma-key cleaned, not procedural ear geometry.
- Fairy renders independent left/right upright wing frames with flap timing, an enlarged tiara, edge-mounted wand, and a generated enlarged projectile. Zeus uses smaller Greek circles with a blue generated chain-lightning overlay. Glass drops use the 2× visual scale, and stale Frost train-track entities are suppressed so Frost uses its generated snow trail.
- Browser cache lineage is `20260811-classic-health-reactor-batman-fairy-zeus-frost2`. Focused setup/audio/social tests pass after the integrated Batman v4 asset swap; the official browser client smoke capture is under `artifacts/design-qa/classic-health-reactor-batman-fairy-zeus-frost2-client/` and has no reported browser errors. Targeted custom Playwright was attempted but the standalone shell could not resolve the environment's Playwright package; existing project evidence remains under `artifacts/design-qa/classic-visual-20260811/`.

## Classic Fairy/Frost/Batman Matte and Attachment Cleanup (2026-08-11)

- Kept the generated finals unchanged and fixed their runtime crops at the shared sheet-frame boundary. `assets/generated/classic-visual-20260811-v2/final/fairy-accessories.png` now uses explicit art bounds for the six wing poses, the v2 tiara, and the v2 wand, so the opaque white artboard separators never enter the canvas. Wings remain independent left/right sprites, preserve their source aspect ratio, flap between upright poses, and the tiara/wand stay above/at the orb edge.
- `assets/generated/classic-visual-20260811-v1/final/frost-trail.png` now uses separator-safe frame crops. A Frost-owned legacy `train-track` replay entity is routed into the same generated snowflake/snow-patch renderer instead of being skipped or falling through to the generic train rail.
- Batman continues to use the complete connected generated body at `assets/generated/classic-visual-20260811-v4/final/batman-orb-with-ears.png`; both Classic and Orb Race social renderers now use that body, add a clean white perimeter outline after the body, and keep centered game-owned HP above it. No new image generation was required in this cleanup.
- Added pure crop helpers and media contract coverage in `tests/social.test.mjs`. Browser cache lineage advanced to `20260811-classic-health-reactor-batman-fairy-zeus-frost3` through `src/renderer.js`, `src/social-renderer.js`, `src/main.js`, and `index.html` while preserving the completed Tournament bracket modules.

## Classic Cowboy Cigarette Accessory (2026-08-12)

- Added the supplied Cowboy cigarette to the live Classic presentation using the existing generated accessory atlas: source `assets/generated/classic-trapper-20260807/source/trapper-accessories-chroma.png` and cleaned RGBA final `assets/generated/classic-trapper-20260807/final/trapper-accessories.png`. The supplied reference is byte-identical to the preserved chroma source, so no duplicate image generation was needed.
- Added `classicTrapperCigarSourceRect(...)` to crop the cigar's authored content bounds (`994,447,396,162`) from the two-item atlas instead of scaling its empty half-cell. The cigarette is drawn with nearest-neighbor pixels as a separate target-facing accessory after the Cowboy orb body and before centered HP remains visible.
- The hat/body design and stable `trapper` ID are unchanged; the transparent cigar is cosmetic only and does not affect collision, damage, or announcer behavior. The live browser chain is cache-busted with `cowboy-cigar1` through `src/renderer.js`, `src/social-renderer.js`, `src/main.js`, and `index.html`.
- QA capture: `artifacts/design-qa/classic-cowboy-cigarette1/cowboy-matchup.png` visibly shows the hat and cigarette on Cowboy at game scale. The cache-busted Playwright run reported zero console errors, page errors, and failed requests; `state.json` preserves the runtime text snapshot.

## Orb Race Super X^X, Boss Cue, and Caged Racer (2026-08-12)

- Added stable Orb Race ID `super-x-power`, displayed as **SUPER X^X**. Its nested gameplay policy still reads as x^(x^x), remains capped by `ORB_RACE_MAX_MATH_DAMAGE`, and uses the generated black/purple theme with a two-pass black ring around the plain game-drawn orb. The centered HP remains renderer-owned.
- Generated the Alex announcement from the exact script `Super X to the X.`. Active and preserved source files are `assets/audio/announcer/generated-race/race-super-x-power.mp3` and `assets/audio/source/race-announcer-generated/race-super-x-power.mp3`; `RACE_GENERATED_ANNOUNCER_ASSETS["intro-race-super-x-power"]` resolves to the active clip.
- Added a dedicated Alex Boss announcement from the exact script `Boss.`. Active and preserved source files are `assets/audio/announcer/generated-race/race-boss.mp3` and `assets/audio/source/race-announcer-generated/race-boss.mp3`; `race-boss` is now distinct from the Buffed protocol clip and is used when an Orb Foundry orb has the Boss option enabled.
- Added per-orb Orb Race settings `caged: boolean` and `cageDuration: 0–60` seconds, defaulting to a five-second cage only when explicitly selected. Settings URLs preserve explicit cage values while legacy defaults remain compact. The simulation exposes `raceCaged`, `raceCageActive`, `raceCageRemaining`, `raceCageDuration`, and deterministic cage geometry on fighters.
- Caged fighters move only horizontally between the cage's inner side bounds, emit `race-cage-bounce`, cannot use abilities or damage number walls, and emit `race-cage-release` at the exact fixed-step expiry before resuming a normal bounce arc. The cage is indestructible presentation art, not a damageable gameplay entity.
- GPT Image source/final/prompt/manifest/alpha records are versioned in `assets/generated/orb-race-cage-20260812/`. The generated final is `final/cage.png`, cleaned from `source/cage-chroma.png` with the installed chroma-key helper; transparent corners and center were validated. `src/social-renderer.js` loads it with nearest-neighbor rendering and draws it behind the orb/HP for all racer bodies.
- Cache lineage for this correction is `20260812-super-x-cage3-boss2-cowboy-cigar2` through the live entry, simulation, Orb Race, audio, social-renderer, and Classic renderer chains. Focused feature/simulation/social/audio tests cover URL round trips, cage asset alpha metadata, Super X^X registry/audio/ring contracts, distinct Boss cue routing, cage isolation/release, and outward-facing cigar orientation. The prior targeted Playwright canvas frames remain `artifacts/design-qa/super-x-cage2/active.png` and `released.png`; both have empty browser error collections.

## Orb Race Bomb Roster (2026-08-12)

### Generated Reality Bomb body

- Prompt/source: `assets/generated/orb-race-reality-bomb-20260812/prompt.txt` and `source/reality-bomb-chroma.png` (original GPT Image pixel-art faceted ruby crystal orb on flat `#00ff00` chroma).
- Runtime final: `assets/generated/orb-race-reality-bomb-20260812/final/reality-bomb.png`.
- Manifest/alpha record: `assets/generated/orb-race-reality-bomb-20260812/manifest.json` and `alpha-validation.json`. The final is RGBA, 1254×1254, nearest-neighbor, with all four corners `[0,0,0,0]`; no text or HP is baked into the asset.
- Ownership: the full Reality Bomb body is this generated orb asset; HP, countdown, spawned gray-to-real fade, and team assignment remain game/render state.

### New Alex announcements

- Exact generated clips: `assets/audio/announcer/generated-race/race-antimatter-bomb.mp3`, `race-time-bomb.mp3`, and `race-reality-bomb.mp3`.
- Preserved source copies: `assets/audio/source/race-announcer-generated/race-antimatter-bomb.mp3`, `race-time-bomb.mp3`, and `race-reality-bomb.mp3`.
- Generator: `scripts/generate-race-announcements.mjs --bombs-only`, macOS Alex voice, 24 kHz mono MP3. These were re-run with the local speech entitlement after a header-only export was detected; each final is now larger than 10 KB and contains decoded speech frames.

### Renderer/audio contracts

- Simulation fields consumed: `raceAntimatterCountdownElapsed`, `raceAntimatterDetonationCount`, `raceAntimatterCollapseProgress`, `raceAntimatterDustEffects`, `raceAntimatterOpponentDestroyed`, `raceTimeBombCycleElapsed`, `raceTimeBombFreezeUntil`, `raceTimeBombCycleCount`, `raceRealityNextSpawnAt`, `raceRealitySpawnSequence`, and `raceRealitySpawns`.
- Deterministic events: `race-antimatter-detonation`, `race-antimatter-orb-destroy`, `race-time-bomb-midnight`, and `race-reality-spawn`. They route to existing `hydrogen-bomb-explosion`, `hydrogen-bomb-ear-ringing`, `chrono-time-stop`, and `black-hole-teleport` samples through `src/audio.js`; Time Bomb's midnight reuses the Classic `time-stop` cue.
- `src/social-renderer.js` draws Antimatter as only a large black bomb with a centered red countdown; its collapse/pop motion and fading dust remain outside the body. Time Bomb is a full cream clock face with deterministic hour/minute hands driven by its 15-second cycle. Reality Bomb uses the generated crystal directly as the complete orb body (no generic circle underneath), and its three-second gray-to-generated-orb spawn fade remains separate. The Classic name dock draws Hydrogen Bomb's `BOMB xx.xS` timer above the name.
- Browser cache lineage: `20260812-super-x-cage3-boss2-cowboy-cigar2-bombs3-timefreeze2` for the updated `index.html`, `main.js`, `simulation.js`, `config.js`, `renderer.js`, `audio.js`, and `social-renderer.js` import chain.

### Validation

- `tests/simulation.test.mjs`: first/second Antimatter detonation, target orb removal, Time Bomb midnight pulse/freeze, and seeded Reality spawn/fade.
- `tests/social.test.mjs`: generated asset alpha/manifest, all three Alex files, HUD/renderer contracts, cache lineage, bomb event sample routing, and Classic/Time Bomb reuse of `chrono-time-stop`.

## Orb Race Tournament 64-entry focused camera and connector restyle (2026-08-12)

- `tournamentMatchupZoomPadding(...)` now gives the selected matchup a tighter focused crop while retaining both same-column neighbor matchups. Landscape 64-entry targets use the available 16:9 width more aggressively; portrait keeps the active pair centered with the adjacent branch context. The camera still uses one continuous transform: exactly `1.0s` of motion followed by the existing `1.75s` stationary hold.
- Bracket connections expose `spineX`, `connectorColors`, and `connectorStrokeSpace: "screen"` from `src/orb-race-tournament-presentation.js`. Each pair exits its two source cards into a shared orthogonal vertical spine and enters a separate winner card. `src/social-renderer.js` renders them as screen-stable muted purple/gray strokes (`#8b8298` / `#8a69b8`) instead of heavy black lines; card outlines remain independent.
- No new raster or audio assets were needed. Live 64-entry evidence is under `artifacts/design-qa/orb-race-tournament-focus-20260812/`: `portrait64-overview.png`, `portrait64-pan-half.png`, `portrait64-focused-hold.png`, and matching landscape frames. `diagnostics.json` reports zero console errors, page errors, or failed requests.
- Browser cache lineage for the changed render graph is `20260812-super-x-cage3-boss2-cowboy-cigar2-bombs3-timefreeze2-tournament64focus1-camera2` at the page entry, with the renderer graph at `...timefreeze2-tournament64focus1`; the shared presentation import is `20260812-orb-race-tournament-intro-clock4-64focus1`.
- Focused verification: `tests/orb-race-tournament-presentation.test.mjs` and `tests/social.test.mjs` pass `35/35`, including 64-entry midpoint/end camera transforms, no-zoom-out handoffs, source-to-spine topology, thin stroke metadata, and cache/import contracts.

## Orb Race Tournament Camera and Card Reveal (2026-08-12)

- Portrait tournament cards now reclaim the available column whitespace: the 1080×1920 layout uses larger rounded cards, a larger name font, and clipped/ellipsized content while preserving two source cards feeding one destination card. Portrait connector strokes were raised to a readable `1.6–3.2px` range (`2.2–4.4px` for active paths); the approved landscape card layout remains otherwise unchanged.
- Added deterministic `tournamentMatchupZoomPadding(...)` and `tournamentMatchupZoomTargetScale(...)` helpers. The export renderer and interactive preview use the tighter fit for both formats, keep the active matchup centered, and retain same-column context.
- Tournament conclusions remain on the zoomed camera. The destination `???` card dusts/fades out and the winner fades directly into that card with its theme-colored border; the renderer no longer draws a winner travel sprite. Gameplay/recording conclusion timing is `1.75s`, and `finishBattle()` keeps the recorder open through that full conclusion window.
- Browser cache lineage advanced to `20260812-orb-race-tournament-portrait-fit3` (`main` entry `...match-recording3-portrait-fit3`, renderer `...portrait-fit3-fairy-frost3`). Focused presentation/state/social tests pass; the required browser client ran successfully outside the sandbox, while the captured smoke frame was the default Classic menu flow rather than a tournament bracket. Root-owned tournament visual QA remains the authoritative bracket capture.

## Orb Race Tournament Continuous Long-Form Camera Pan (2026-08-12)

- Long-form tournament follow-up matchups now use one continuous camera interpolation from the already zoomed result to the next matchup. The renderer does not redraw the full-bracket intro or reset to overview between matches; `tournamentCameraTransitionTransform(...)` eases center and scale together over exactly `2.75s`, preserving bracket context and ending on the next matchup.
- The pure presentation contract keeps the approved `winner-advance` conclusion phase, adds the `next-match-pan` render phase, and treats restored/legacy `1.75s` input as compatible while enforcing the fixed `2.75s` long-form transition duration. Portrait individual-match recordings retain the full animated intro.
- Landscape focused framing now uses a tighter height fit so the camera remains meaningfully zoomed (`scale > 1`) while still containing the source pair, destination, and adjacent branch context. Reduced motion remains deterministic and bypasses the cosmetic camera path.
- Live import lineage is `20260812-orb-race-tournament-pan2750-focus2` (`...-fairy-frost3` renderer, `...-workflows7` entry). No new raster/audio assets were needed; the one-shot zoom cue and existing tournament conclusion audio timing remain unchanged.
- Verification: focused presentation/state/social coverage passes `54/54`; full `npm test` passes `160/160`. Root-owned tournament Playwright visual QA remains the authoritative capture pass for the shared bracket UI/export canvas.

## Tournament one-second pan and centered matchup hold (2026-08-12)

- Tournament presentation now uses one exact `2.75s` envelope with `1.0s` of quintic eased camera motion followed by a stationary `1.75s` centered matchup hold. The initial bracket-to-matchup move and every long-form result-to-next-match move share this split; the camera cannot drift during the hold.
- Fixed the invisible matchup handoff by normalizing supplied `camera-pan`, `bracket-zoom`, and `battle` frames before rendering. Raw UI camera-pan frames no longer bypass the focused bracket camera, and an early `battle` label remains on the bracket transition/hold until its authoritative `battleAt` boundary.
- Added a presentation-only committed-result snapshot. The prior winner is written into a derived bracket during the next pan without mutating tournament state, so the destination never flashes back to `???`; the loser remains grayscale and the resolved winner card keeps the winner's Orb Race theme border.
- Renderer-to-presentation cache lineage is `20260812-orb-race-tournament-pan1000-hold1750-committed1`. Focused tournament presentation/social coverage passes `32/32`; full coverage passes `162/163`, with the sole failure in the concurrent root-owned `tests/ui-setup.test.mjs` assertion for a missing `main.js` `preserveTournamentRecording` source string.
- The required standard Playwright client ran against the live local server and its screenshot was inspected at `artifacts/design-qa/tournament-pan1000-hold1750-media-client/shot-0.png`. It exercised the default Classic menu flow; root-owned tournament workflow QA remains the authoritative transition capture.
- Follow-up root Playwright exposed that the UI-owned `presentation.tournamentTransition` was being ignored while the old simulation remained in conclusion. The renderer now gives that explicit transition first priority, targets `toMatchId`, derives camera progress from `elapsedMs / 1000`, derives hold progress after `1000ms`, and preserves the committed winner/loser visual state. The renderer import lineage is `20260812-orb-race-tournament-transition-priority2`.
- A second live timing audit found that one-second phase progress had been incorrectly reinterpreted as progress across the whole `2.75s` envelope. Renderer gameplay frames now derive elapsed seconds from tournament clock minus the intro/transition start. At `0.5s` the camera is exactly halfway, at `1.0s` it is exactly focused, and at `1.8s` it remains stationary in the hold. Raw `matchup-hold` maps to the focused full-intro or direct-pan path and cannot revert to the full bracket. Cache lineage is `20260812-orb-race-tournament-intro-clock4`.

## Classic Frost freeze overlay, Absorber UI, and combat audio (2026-08-12)

- Frost's generated trail remains `assets/generated/classic-visual-20260811-v1/final/frost-trail.png`; the legacy `train-track` entity name is now routed to that sheet whenever its owner is `frost-ball`, so Frost cannot regress to railroad rails. Generic Train entities keep their existing renderer path.
- Generated frozen-state overlay: `assets/generated/classic-visual-20260812-frost-freeze-v1/final/frozen-orb-overlay.png`, with preserved source `source/frozen-orb-overlay-source.png`, exact prompt in `prompts.md`, manifest, and alpha validation in the same versioned folder. It is a four-frame transparent icy rim with an empty center; the renderer adds a low-opacity cyan glaze and draws the game-owned HP afterward. `classicFrostFrozen`/`classicFrostSlowUntil` drive the overlay for the full freeze lifetime.
- Frost emits one deterministic `classic-freeze` event per target entry, not once per fixed step. No dedicated freeze recording was supplied in the workspace, so the event uses the existing full `chrono-time-stop.wav` cue (`chrono-time-stop`) as the closest freeze sound without inventing a missing file.
- Apple collection now routes `classic-apple-collected` to `forge-item-pickup.mp3` for the Apple owner and `cinder-burn-tick.wav` for an opponent. Sword/Draftmaster `classic-slice-hit`/sword-hit events use `fantasy-sword-hit.mp3`; Trident throws continue to use `classic-trident-throw.mp3` and Zeus emits one `classic-zeus-thunder` event per three-node cast, routed to one `race-thunder.mp3` cue rather than three thunders.
- Classic Absorber keeps its complete `classicAbsorptionHistory`, renders an `ABSORBING ...` label during the current model pull, an `ABSORBED: ...` label after each completed absorption, and persistent color-coded effect arcs. The render-game text/UI seam exposes the same history and labels so every absorbed effect remains visible while the simulation's absorbed projectile ability continues to resolve deterministically.
- Sword/Draftmaster bullet deflections now carry a deterministic `0.34s` `classic-sword-deflect` window; the renderer sweeps the held sword in place with a bright slash and the audio route uses the sword-hit cue. This presentation state does not change the projectile outcome or fixed-step rules.
- Cache lineage for this pass is `20260812-super-x-cage3-boss2-cowboy-cigar2-bombs3-timefreeze2-tournament64focus1-camera2-frost-freeze-absorber-audio2` at the entry and matching simulation/renderer/social imports; `SAMPLE_ASSET_VERSION` is `20260812-classic-frost-freeze-absorber-audio2`.
- Verification: `tests/classic-rework.test.mjs` passes `92/92`, `tests/classic-audio.test.mjs` passes `4/4`, and `tests/social.test.mjs` passes `1/1` file with the new frozen asset/alpha, audio-route, one-shot freeze/Zeus, absorber, and cache assertions.
- Full verification passes `npm test` at `170/170`. The focused elevated Playwright harness is `scripts/qa-classic-frost-freeze-absorber-audio2.mjs`; it captured [Frost vs Absorber](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/classic-frost-freeze-absorber-audio2/frost-vs-absorber.png) and [Zeus vs Sword](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/classic-frost-freeze-absorber-audio2/zeus-vs-sword.png), loaded the frozen overlay with no failed requests, and recorded zero console/page errors in [diagnostics.json](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/classic-frost-freeze-absorber-audio2/diagnostics.json).

## Classic Frost, Apple heal, Zeus shock, and Cutter line lifetime (2026-08-12)

- Frost's generated `frost-trail` remains the source sprite, but its renderer now adds a visible directional blue snow streak with fading snowflake particles. A frozen target gets a stronger blue glaze and wrap ring, the four-frame generated icy overlay at a larger scale, and deterministic snowflakes falling over the orb; gameplay already holds its velocity at zero until freeze release.
- Frost is silent by contract in this pass: `classic-freeze` remains a deterministic state/event for visuals but is excluded from `CLASSIC_AUDIO_POLICY` and `classicSampleRouteFor`, so no freeze audio plays.
- Friendly Apple collection pushes the existing World Cup `world-cup-pickup`/`green-energy-drink` effect with a `+3 HP` label, matching the established expanding ring and particle treatment without duplicating healing or audio.
- Zeus's existing `classic-dot-tick` event remains the only thunder damage marker. Successful chain-lightning damage also sets `classicZeusElectrifiedStartedAt`, `classicZeusElectrifiedUntil`, and `classicZeusElectrifiedSourceId`; the renderer uses those fields to flash white, show a skeleton silhouette, and draw short electric arcs before restoring the orb palette and centered HP.
- Cutter now derives fallback red connector paths directly from each live zone's `line` geometry. Retained areas and their lines share the same expiry lifecycle, including during replacement-line drawing; no red connector can outlive its damage area or disappear while the area is still active.
- Changed modules/cache lineage: [src/simulation.js](/Users/maxli/Documents/ball-battle-simulator/src/simulation.js), [src/renderer.js](/Users/maxli/Documents/ball-battle-simulator/src/renderer.js), [src/audio.js](/Users/maxli/Documents/ball-battle-simulator/src/audio.js), [src/social-renderer.js](/Users/maxli/Documents/ball-battle-simulator/src/social-renderer.js), [src/main.js](/Users/maxli/Documents/ball-battle-simulator/src/main.js), [index.html](/Users/maxli/Documents/ball-battle-simulator/index.html); lineage `...frost-silent-zeus-electro-apple-heal1`.
- Focused contracts are covered in [tests/classic-rework.test.mjs](/Users/maxli/Documents/ball-battle-simulator/tests/classic-rework.test.mjs), [tests/classic-audio.test.mjs](/Users/maxli/Documents/ball-battle-simulator/tests/classic-audio.test.mjs), and [tests/social.test.mjs](/Users/maxli/Documents/ball-battle-simulator/tests/social.test.mjs). No new GPT asset or audio file was introduced.

## Classic Snowball presentation and Zeus lightning (2026-08-12)

### Snowball asset and identity

- Stable gameplay identity remains `frost-ball`; only Classic presentation text, announcer, and body art changed. The display name is `SNOWBALL`, the announcer cue resolves to the existing `intro-race-snowball` Alex clip, and Frost's original Orb Foundry physics/gameplay contract remains authoritative.
- Orb Racer body asset reused by explicit user request: `assets/generated/orb-race-simple-20260731/final/snowball-orb.png`. `src/renderer.js` renders it as the complete Classic body, rotates it deterministically, and keeps game-owned HP centered/readable; it does not alter simulation radius or movement.

### Generated Frost trail v2

- GPT Image prompt/source: `assets/generated/classic-visual-20260812-frost-trail-v2/prompts.md` and `source/frost-trail-source.png`.
- Runtime final: `assets/generated/classic-visual-20260812-frost-trail-v2/final/frost-trail.png`.
- Manifest and alpha evidence: `assets/generated/classic-visual-20260812-frost-trail-v2/manifest.json` and `alpha-validation.json`. The final is RGBA, 2172×724, four horizontal frames, with transparent corners and nearest-neighbor rendering.
- Ownership: the sheet is the Frost/Snowball trail effect only. A thick renderer under-ribbon and fading snow particles make it read as a continuous ice path; the legacy train-track visual is not used for a Frost owner. Frozen-target overlays remain separate and preserve the center for HP.

### Zeus renderer/audio seam

- `classicZeusDamageMarkerAmount`, `classicZeusDamageMarkerAt`, and `classicZeusDamageMarkerSequence` are target-owned presentation stamps. `src/social-renderer.js` uses them as a deterministic fallback when the fixed-size event ring has already rotated, preventing missing or cumulative Zeus health labels.
- `ArenaRenderer.drawClassicZeusHandLightning` draws the hand-held launch bolt; `drawClassicZeusLightningPath` supplies deterministic flickering center/fork paths. The three-node chain still routes one long `classic-zeus-thunder` sample, with no per-frame or per-node audio spam.
- Classic Snowball/Frost audio is intentionally silent in this pass, including legacy bounce, ability, hazard, freeze, and trail routes; the shared audio policy recognizes the stable `frost-ball` ID even though the public presentation says Snowball.

### Cache and validation

- Live import lineage: `20260812-super-x-cage3-boss2-cowboy-cigar2-bombs3-timefreeze2-frost-trail-v2-zeus-hand-marker2`; Classic orb registry lineage: `20260812-classic-health-reactor-batman-fairy-zeus-frost-snowball1`.
- `npm test` passes `173/173`. Playwright evidence: [Snowball/Frost capture](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/classic-frost-freeze-absorber-audio2/frost-vs-absorber.png), [Zeus capture](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/classic-frost-freeze-absorber-audio2/zeus-vs-sword.png), and [diagnostics](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/classic-frost-freeze-absorber-audio2/diagnostics.json).

## Snowball supplied trail strip (2026-08-12)

- Exact user-supplied source: `assets/generated/classic-visual-20260812-frost-trail-v3/source/frost-trail-reference.png`.
- Runtime final: `assets/generated/classic-visual-20260812-frost-trail-v3/final/frost-trail.png`. Both files are byte-identical RGBA PNGs at 2172×724, with four 543×724 horizontal frames and transparent corners. Provenance is recorded in `prompts.md`; no new generated replacement was introduced.
- `src/renderer.js` uses the full frame cells without the previous inset crop, scales the supplied cells with nearest-neighbor, and draws a rounded continuous ribbon through the fixed trail positions plus a last-mile bridge to the moving Snowball. This keeps the authored ice/snow texture while guaranteeing a smooth trail with no visible gaps.
- Cache lineage is `...frost-trail-v3-zeus-hand-marker3`. The stable `frost-ball` simulation and its Frost physics remain unchanged; only the Snowball trail presentation changed.

## Orb Race Reality, Lag, Copycat, Whirlwind, and RGB (2026-08-13)

- Added the new Orb Race IDs `reality-bomb`, `lag`, `copycat`, `whirlwind`, and `rgb` to the live registry/presentation path. Reality Bomb summons Slammy helpers every five seconds and applies a deterministic ten-second layer rewrite: its own layers use `0.8×`, the opponent uses `1.1×`, and the renderer keeps fading before/after layer values as a cosmetic shift effect.
- Lag's body is an original GPT Image pixel-art orb with the requested classic black-and-green hacker treatment. The corrected v2 prompt and source are `assets/generated/orb-race-lag-20260813-hacker-v2/PROMPT.md` and `assets/generated/orb-race-lag-20260813-hacker-v2/source/lag-orb.png`; runtime final: `assets/generated/orb-race-lag-20260813-hacker-v2/final/lag-orb.png`; manifest and alpha evidence are in the same folder. The final is RGBA with transparent corners and nearest-neighbor rendering. The renderer keeps the orb visually planted through the active number layer and adds green glitch bands only during the deterministic glitch window.
- Lag has a seeded 10% on-layer glitch chance. Each glitch starts at two seconds/10 damage per second and doubles both duration and damage on the next glitch; fixed-step tick accumulation prevents frame-size-dependent double ticks. The supplied `/Users/maxli/Downloads/kave_msri-glitch-sfx-312910.mp3` is preserved at `assets/audio/source/race-effects-20260813/kave_msri-glitch-sfx-312910.mp3` and routed as `race-lag-glitch-start` through `assets/audio/effects/race-lag-glitch.mp3`.
- Copycat now waits two seconds, visually roulettes through a seeded permitted ability pool every `0.2s` for one second, then owns the copied visual/ability/UI for five seconds before immediately starting the next roulette. Whirlwind starts with six gray hex-orbit satellites and zero body damage; number-line hits multiply rotation speed by `1.125×` and damage by `1.2×`. RGB cycles through red/yellow/green/cyan/blue/magenta every five seconds and applies its color-specific bounce stat bonuses.
- New non-silent Alex announcement clips for the three newly introduced presentation IDs are preserved as both live assets and sources: `assets/audio/announcer/generated-race/race-lag.wav`, `race-whirlwind.wav`, and `race-rgb.wav`, with matching files under `assets/audio/source/race-announcer-generated/`.
- Copycat retains its existing valid Alex clip at `assets/audio/announcer/generated-race/race-copycat.mp3` with the preserved source at `assets/audio/source/race-announcer-generated/race-copycat.mp3`; Reality Bomb's existing `race-reality-bomb.mp3` clip is also present and covered by the announcer manifest.
- Cache lineage for the live graph is `20260813-reality-lag-copycat-whirlwind-rgb3` across the browser entry/import seams. The existing Jackpot slot-spin sample is routed once at each Copycat roulette start and each RGB five-second color-cycle event; it does not fire on intermediate visual frames.

## Orb Race Whirlwind/Copycat/RGB/Antimatter follow-up (2026-08-13)

- `src/simulation.js` exports `raceWhirlwindOrbPosition` and keeps six satellite positions in the same normalized geometry used by the renderer. `raceWhirlwindLineContactIndices`, `raceWhirlwindLineHitIndices`, and the related layer index/new-contact fields are snapshot-safe presentation state; only satellite contacts apply damage.
- Reality Bomb's `raceRealitySpawns` remain the existing deterministic physical child seam, now with `raceDamage` owned by each `raceRealitySpawn` Slammy and exposed in `src/main.js` text state. The parent Reality Bomb still owns layer rewrites and has zero body bounce damage.
- `src/social-renderer.js` resolves Copycat's HUD label from `raceCopycatActiveAbilityId`/`raceCopycatVisualOrbId` through `ORB_RACERS`, and uses the shared Whirlwind position helper. The Lag final remains `assets/generated/orb-race-lag-20260813-hacker-v2/final/lag-orb.png`; its runtime draw is a square `2.36×radius` placement with nearest-neighbor sampling.
- Antimatter and Time Bomb are excluded from generic trail sampling. Antimatter detonation resets stale trails/bounce effects before its current dust effect, and a destroyed target's old transient visual arrays are cleared before the target dust burst.
- Both bomb IDs also remain zero-damage for ordinary bounce/body composition; timer detonation, pulse freeze, and the existing explicit infinite-damage window are separate channels.
- Browser cache lineage is now `20260813-reality-lag-copycat-whirlwind-rgb4` across entry/import/sample seams. The existing Jackpot slot-spin sample remains one-shot per roulette/cycle event.
- Focused and full verification: `node --test tests/simulation.test.mjs`, `node --test tests/social.test.mjs`, and `npm test` (`173/173`). Playwright evidence is in `artifacts/design-qa/orb-race-specials-20260813/` and `artifacts/design-qa/orb-race-lag-20260813/`; both diagnostics files contain no console/page/request failures.

## Snowball fixed trail direction and freeze audio (2026-08-13)

- `src/simulation.js` stores `laidAngle` on every Classic `frost-trail` entity at spawn. `src/renderer.js` consumes that value through `classicFrostTrailAngleFor`, so the supplied Snowball trail frames keep the direction in which they were laid even after Snowball turns; the continuous ribbon/path bridge is preserved.
- Supplied freeze cue: [classic-snowball-freeze.mp3](/Users/maxli/Documents/ball-battle-simulator/assets/audio/effects/classic-snowball-freeze.mp3). Preserved source: [tanweraman-ice-freezing-445024.mp3](/Users/maxli/Documents/ball-battle-simulator/assets/audio/source/classic-snowball-freeze-20260813/tanweraman-ice-freezing-445024.mp3). Provenance and active mapping are recorded in [manifest.json](/Users/maxli/Documents/ball-battle-simulator/assets/audio/source/classic-snowball-freeze-20260813/manifest.json).
- The cue is routed only from a new `classic-freeze` event entry; the stable `frost-ball` identity remains silent for trail placement, wall contact, and ordinary bounce events so the sound does not repeat every fixed step.
- Cache lineage: `20260813-snowball-fixed-trail1`. Focused tests cover stored trail headings, legacy fallback, source contracts, and the freeze sample route.

## Poison/Lag tick presentation and Alex pronunciation (2026-08-14)

- Poison's per-tick expanding rings are explicitly tagged with `tick: true`; Lag glitch ticks now create the same normalized ring at the layer contact point. The renderer's existing `drawRaceBounceEffects` path expands and fades each ring without a new sprite or asset.
- Audio routes `race-poison-tick` and `race-lag-glitch-tick` to `orb-collision` with `rateLimit: 0`, so every emitted layer tick gets the requested bounce sound.
- Regenerated Alex clips with syllable overrides in `scripts/generate-race-announcements.mjs`: `Fee buh naa chee.` for `race-fibonacci.mp3` and `Splodee.` for the stable `mines`/Splodey ID. Both active files and preserved sources contain decoded MP3 frames; the pronunciation/hash record is in `assets/audio/announcer/wise/manifest.json`.
- Cache lineage: `20260814-poison-lag-ticks2-pronunciation1`. No new image asset was needed.

## Orb Race Sylvester, Tetration, Rain, Hacker, and Miner (2026-08-14)

- Added stable Orb Race IDs `sylvester`, `tetration`, `rain`, `hacker`, and `miner`. Sylvester uses the deterministic sequence `2, 3, 7, 43, ...` and renders `sₙ₊₁`; Tetration uses the capped base-two `a^^b` ladder. Their ordinary body damage and movement remain deterministic and replay-safe.
- Rain has a five-second pre-cooldown, then exactly 100 seeded-position drops over five seconds. Each drop damages the opponent's active number layer for 5, the rain channel cannot restart while active, and each completed use doubles the next drop value. The carrier body remains a zero-damage utility orb.
- Hacker begins a three-second typing hack every five seconds. The outcome is selected from the five requested seeded outcomes (blue slow, red infinite next layer bounce, yellow opponent copy marker, orange ten Slammy helpers, or black Hydrogen Bomb). Matrix symbols, computer/typing frames, outcome color, and the Hydrogen Bomb countdown are presentation state; the existing deterministic event stream carries the result.
- Miner attaches to the active layer, exposes a shovel-to-jackhammer progress meter over 20 seconds, then drills the attached wall down over exactly five seconds. Renderer geometry shrinks the layer from its top edge toward the number line before Miner falls through; Miner’s carrier body remains zero ordinary bounce damage.
- GPT Image assets (source/final/prompt/manifest/alpha evidence) are versioned in `assets/generated/orb-race-new-orbs-20260814-v1/`: `rain-cloud-sheet.png` (4 frames), `hacker-computer-sheet.png` (4 frames), and `miner-jackhammer-sheet.png` (6 frames). Runtime mapping is in `src/social-renderer.js` with nearest-neighbor sampling and transparent corners validated.
- Alex announcements are valid non-silent MP3s at `assets/audio/announcer/generated-race/race-sylvester.mp3`, `race-tetration.mp3`, `race-rain.mp3`, `race-hacker.mp3`, and `race-miner.mp3`, with preserved source copies in `assets/audio/source/race-announcer-generated/`. Event audio routes use existing cleared race samples for rain, Matrix hacks, Slammy/Hydrogen spawns, and Miner drilling.
- Browser cache lineage for the new graph is `20260814-new-orbs4`; `SAMPLE_ASSET_VERSION` uses the same lineage. Remaining integration note: Hacker’s copy outcome is currently represented by a deterministic copied-orb state/visual marker and outcome contract; deeper ability mirroring can be added without changing the event schema.

## Orb Race new-orb visual pass (2026-08-14)

- Miner now renders as the complete generated miner/jackhammer character, with no generic orb body underneath. Its shovel/jackhammer sheet is drawn at 2× the previous visual size; the drill bob/frame cadence is faster while the deterministic 20-second upgrade and five-second layer break rules remain unchanged.
- Hacker now uses a dedicated original GPT Image hoodie-orb sheet: `assets/generated/orb-race-new-orbs-20260814-v2/source/hacker-orb-animation-grid-source.png` is the preserved 2×2 source, and `assets/generated/orb-race-new-orbs-20260814-v2/final/hacker-orb-animation-sheet.png` is the four-frame horizontal runtime strip. Frames cover front, left turn, right turn, and typing. The oversized generated computer remains a separate accessory and is rendered at 2× its prior size while the hoodie orb turns toward it during the three-second hack.
- Hacker's black outcome now creates an explicit `raceHackerHydrogenBomb` child state with `raceOrbId: "hydrogen-bomb"` and `spawned: true`. The renderer draws the actual Hydrogen Bomb orb symbol with its countdown below it; the old substitute timer circle is gone. Detonation still hands off to the existing Hydrogen Bomb simulation event/flash path.
- Rain's generated cloud is 3× its prior visual size and is anchored to a stable ceiling position instead of following the Rain orb. A visual recharge/storm progress bar is drawn below the cloud; Rain HUD no longer exposes ordinary damage or the `READY` label.
- Hacker start events remain gameplay-visible but intentionally have no audio route. Only `race-hacker-result` plays the glitch cue after the three-second hack completes. Sylvester and Tetration now use the boosted strong-math `race-math-power` bounce cue on number-line hits.
- Browser cache lineage advanced to `20260814-new-orbs4`; the v2 Hacker asset manifest and alpha evidence are in `assets/generated/orb-race-new-orbs-20260814-v2/`. Focused tests cover the v2 frame contract, HUD suppression, hydrogen child state, completed-hack audio, and strong-math routes.
- Verification: `npm test` passes `174/174`. Focused tests cover Sylvester/Tetration values, all five Hacker outcomes, the exact 100-drop/damage-doubling Rain cycle, and Miner’s attach/20-second upgrade/5-second drill. Playwright evidence is in `artifacts/design-qa/orb-race-new-orbs-20260814/`; Rain, Hacker, and Miner captures loaded with zero console/page/request errors.
- Final visual evidence: [Hacker typing](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v2/hacker-typing-final.png), [Miner drilling](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v2/miner-drilling-final.png), and [Rain active](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v2/rain-active-final.png). Final diagnostics report zero console errors, page errors, and failed requests.

## Orb Race Hacker/Miner follow-up (2026-08-14)

- `src/social-renderer.js` uses Hacker frame 0 for idle and frame 3 for hacking, flipping only the typing frame toward `raceHackerFacing`. The legacy standalone computer sprite is no longer drawn; the generated v2 typing frame is the sole computer/typing artwork. The four-frame RGBA asset remains `assets/generated/orb-race-new-orbs-20260814-v2/final/hacker-orb-animation-sheet.png`, with its preserved 2×2 source and manifest in the same versioned folder.
- Hacker copy and Hydrogen outcomes are represented by `raceHackerSpawnedOrbs[]` children, while the ten orange-outcome Slammy helpers use the existing `raceRealitySpawns[]` child seam. Each child is serialized in `src/simulation.js`, moves with deterministic normalized wall/floor bounces, and is rendered through the source orb's full special-orb path; Hydrogen carries its independent countdown. No child uses the parent’s position as an attachment.
- `drawRaceMinerOrb` derives each jackhammer frame width from the sheet’s native per-frame aspect ratio. The doubled progress bar uses `4.5×radius` width and `0.26×radius` height; no sprite stretching is introduced.
- Cache lineage is `20260814-new-orbs4`. Focused simulation/social tests cover child creation, independent motion, native frame sizing, forward/typing frame selection, and removal of the old computer draw. Live captures are [Hacker idle](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v3/hacker-idle.png), [Hacker typing/child](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v3/hacker-typing-or-child.png), and [Miner native aspect](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v3/miner-native.png).
- Post-removal verification: [Hacker typing v4](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v4-hacker-typing.png) shows only the generated v2 typing/computer frame; browser diagnostics reported no console or page errors.

## Orb Race Hacker children and Miner correction (2026-08-14)

- Miner shovel presentation now advances on its own fast `time * 240` frame clock; the completed jackhammer/drill uses the deliberately slower `time * 24` cadence. The generated six-frame sheet keeps its native aspect ratio, and attached frames are clipped/embedded at the live shrinking layer surface instead of floating above it. The progress meter is enlarged to `min(88% of board width, 9×radius)`.
- Miner gameplay now clears any final layer remainder when the five-second drill reaches 100%, resolves the layer immediately, emits the layer-break event, and transitions Miner to the deterministic fall-through state. The authoritative surface interpolates from the top of the active layer to the number line as drill progress advances, so the renderer and physics share the same descent.
- Hacker outcome labels are rendered above the Hacker with the Draftmaster callout treatment (`HACK`, `COPY`, `SLAMMYS`, `HYDROGEN BOMB`, etc.) and a deterministic 1.8-second fade. Hydrogen's active child exposes its countdown above Hacker rather than placing a second label below the spawned bomb. The spawned Hydrogen uses the actual Hydrogen Bomb symbol, normal countdown event, explosion event/flash, and preserves the Hacker carrier when the child detonates.
- Hacker copy children are independent temporary racers: they inherit source visuals/UI/ramp state, use the source-specific ability update dispatch, bounce against the Hacker-owned layer array, and emit source events/projectiles (including Sniper fire). Orange Slammy children are real red Slammy bodies with their own bounce damage and scale ramp; they do not draw Hacker's black pulse or hollow proxy body.
- Browser cache lineage for this correction is `20260814-hacker-children-miner8` across the live import graph and generated sprite URL. Focused simulation/social tests cover copied weapon abilities, Slammy damage/scale, Hydrogen detonation/preservation, Miner descent/layer break, Hacker callouts/timer, and native Miner framing.
- Latest Playwright evidence: [Hacker child](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v7/hacker-child.png), [Miner planted](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v7/miner-planted.png), [Miner drilling](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v7/miner-drilling.png), and [diagnostics](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v7/diagnostics.json). Diagnostics report no console errors, page errors, or failed requests.

## Orb Race Hacker child inheritance and Miner planting (2026-08-14)

- Hacker now renders one generated forward-facing hoodie frame. During a hack that same frame mirrors toward `raceHackerFacing`; there is no idle/typing pose swap and no standalone computer sprite in the live runtime. The former computer concept remains preserved as `runtime: false` provenance in `assets/generated/orb-race-new-orbs-20260814-v1/manifest.json`.
- Hacker copy children inherit the source orb's race-prefixed presentation/UI state through a tolerant copied-state adapter. The renderer sends each child through the normal special-orb draw path, so copied guns, rings, particles, timers, and HUD entries follow the copied ID. Child motion remains independent and deterministic; child bounce/copy events route source-appropriate audio. Hydrogen children emit `race-hydrogen-bomb-countdown-start` immediately and use the normal looping siren lifecycle.
- Miner uses per-frame alpha bounds from the generated six-frame sheet, preserves each authored frame aspect ratio, and bottom-anchors attached shovel/jackhammer content to the active number-line surface. The drill frames cycle at five times the previous visual cadence with horizontal jackhammer shifting; attached vertical bob is suppressed so the tool never lifts off or sinks through the line. Gameplay timing remains deterministic at 20 seconds to upgrade and five seconds to drill a layer.
- Cache lineage is now `20260814-hacker-children-miner5` across the browser/import/sample graph. The focused simulation/social suites and full `npm test` pass 174/174. Fresh 1080×1920 QA captures are [Hacker forward](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v5/hacker-forward.png), [Hacker target-facing](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v5/hacker-facing.png), [Hacker Slammy children](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v5/hacker-child.png), [Miner planted](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v5/miner-planted.png), and [Miner drilling](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v5/miner-drilling.png). [Diagnostics](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-new-orbs-20260814-v5/diagnostics.json) reports no console errors, page errors, or failed requests.

## Orb Race Purple Sun media contract (2026-08-17)

- Stable registry/presentation ID: `purple-sun`; public title and Alex announcement: `THE FUCKING PURPLE SUN`. This is a Blue Sun-style Orb Race racer with a single large purple downward beam. The registry theme is dark/bright purple (`#1d0b3d` → `#d8b4fe`); the body ramps by power level like Blue Sun, with `racePurpleSunCharge` smoothing the first transition.
- No generated image is used for the body or beam. `src/social-renderer.js` draws the plain orb and a nearest-neighbor-safe clipped beam from `racePurpleSunBeam.startX/startY` to its number-line `endX/endY`; the beam has a dark-purple silhouette, bright core, pulse, and surface contact. This keeps the beam continuous and physically aligned without adding an asset that would need cropping or transparency cleanup.
- State/render seam: `src/simulation.js` owns `racePurpleSunActive`, `racePurpleSunActiveUntil`, `racePurpleSunNextReadyAt`, `racePurpleSunCharge`, `racePurpleSunPowerLevel`, `racePurpleSunBeamDamage`, and normalized `racePurpleSunBeam`. `src/main.js` exposes those fields to `render_game_to_text`; the renderer/HUD consumes them without changing deterministic physics.
- Audio: Alex clip `assets/audio/announcer/generated-race/race-purple-sun.mp3`, with preserved source copy at `assets/audio/source/race-announcer-generated/race-purple-sun.mp3`. Event routes `race-purple-sun-start` and `race-purple-sun-hit` reuse existing rights-cleared samples; `ANNOUNCER_ASSET_VERSION` and `SAMPLE_ASSET_VERSION` are `20260817-purple-sun4`.
- Browser cache lineage is `20260817-purple-sun4` across `index.html`, `src/main.js`, `src/simulation.js`, `src/social-renderer.js`, `src/renderer.js`, `src/audio.js`, `src/config.js`, `src/social.js`, and `src/orb-race.js`. Purple Sun's primary HUD line is `LASER: <beam>/SEC`, followed by `POWER LEVEL`, with no generic weapon-damage line. Focused simulation/social/feature tests cover identity, purple theme, projectile-only behavior, timed activation, beam intersection, eight-beam damage equivalence, power-level color/HUD scaling, impact rings, and valid announcement mapping.

## Pancake damage profile and Purple Sun HUD (2026-08-17)

- Pancake direct line contact is now intentionally light at `1 damage/second`. A fresh syrup patch starts at `2 damage/second`, explicitly matching two baseline Parasite channels, and records `parasiteEquivalent`, `damageScale`, `durationScale`, `durationSeconds`, and `totalDamage` in state/events. Later flip and stack progression increases both patch damage and lifetime; butter landings remain syrup-free.
- The live Pancake renderer uses the deterministic damage/duration scales to enlarge syrup marks while retaining the number-line cutoff. Purple Sun reports its single beam as `LASER: <beam>/SEC` rather than `WEAPON DAMAGE`.
- Cache lineage is `20260817-purple-sun4`. No new raster assets were required; existing generated Pancake patch and Purple Sun presentation assets remain the runtime sources.
- QA: [active beam](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/purple-sun-race-20260817-high-layers/shot-0.png), [purple body after charge](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/purple-sun-race-20260817-high-layers/shot-1.png), and [render state](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/purple-sun-race-20260817-high-layers/state-0.json). The inspected 1080×1920 Playwright run loaded the beam and audio manifest with no page, console, or request errors.

## 2026-08-14 — Hacker computer-facing pose and copied-orb visual inheritance

- Runtime Hacker sprite: `assets/generated/orb-race-new-orbs-20260814-v2/final/hacker-orb-animation-sheet.png?v=20260814-hacker-children-miner6`. Frame 0 is the forward idle hoodie orb; frame 3 is the generated computer-facing/typing pose used only during an active hack and mirrored toward `raceHackerFacing`. The old v1 computer sheet remains preserved but `runtime: false`.
- Hacker’s parent HUD keeps a single replacement line (`HACK: READY`, `HACK: COPY`, `HACK: SLAMMYS`, etc.). Copied child orbs intentionally draw no text below their bodies. Source `raceOrbScale`, ability IDs, live ramps, weapons, rings, timers, and special effects are copied through the tolerant adapter; copied Orbital children start with visible satellites, and copied Whirlwind children advance their own rotation/ramp.
- Miner’s authored six-frame jackhammer strip uses a six-times-slower-than-original `Math.floor(time * 40) % 3` shovel cadence; jackhammer frames retain their faster drilling motion. When attached, the cropped sprite’s bottom is anchored exactly to the simulation’s moving layer surface (`y + radius`), so it stays planted as the wall shrinks. After a break, Miner retargets the next active wall and continues drilling without a falling pose. This is visual-only; simulation remains 20 seconds to upgrade and five seconds per layer.
- Cache lineage for browser modules, sprite URLs, and audio manifests is `20260814-hacker-children-miner6`.

## Orb Race Bombs class and deterministic utility orbs (2026-08-16)

- Added the `BOMBS` Orb Race display/announcement class for the four stable bomb IDs: `hydrogen-bomb`, `antimatter-bomb`, `time-bomb`, and `reality-bomb`. When a team contains multiple bomb IDs, the title and announcer use one `BOMBS` cue (`intro-race-group-bombs`) instead of repeating individual bomb names; a single bomb remains individually addressable.
- Added stable IDs `breaker`, `square-root`, `progressive`, and `random`. Breaker deals fixed 1 damage and starts at 1% crit chance, gaining 1 percentage point per bounce; a crit now deals half of the active layer's configured maximum HP plus one. Square Root applies the mathematical square root to the active layer on each number-line hit, including a two-HP layer, and cleanly breaks values at or below one. Square Root is included in the very-strong-math speed profile. Progressive starts at 1 damage, multiplies by 5 every 15 seconds, and switches to a 5-second interval after its second boost. Random rolls deterministic damage from 1 through its current maximum and increases that maximum by 5 on every bounce.
- Renderer/HUD additions are in `src/social-renderer.js`: Square Root uses a centered `√` emblem on the white theme; Breaker exposes only `CRIT CHANCE`; Progressive and Random expose their cooldown/range state without reusing generic scaling HUD lines. The live `render_game_to_text` seam in `src/main.js` exposes all four states for QA and recording inspection.
- Generated non-silent Alex clips through `scripts/generate-race-announcements.mjs`. Active files: `assets/audio/announcer/generated-race/race-group-bombs.mp3`, `race-breaker.mp3`, `race-square-root.mp3`, `race-progressive.mp3`, and `race-random.mp3`. Preserved source copies are in `assets/audio/source/race-announcer-generated/` with the same filenames. Existing bomb clips were regenerated and remain available for individual selections.
- Orbital combo announcements continue to use the actual generated combo title stem (for example, `intro-race-combo-speed-orbital`), not a generic “orb + orbital” splice. The existing combo route and audio asset mapping remain unchanged.
- Browser/import/audio cache lineage is `20260817-miner-slower3`. Square Root remains covered by the prior impact QA, and Miner now uses the slower shovel/drill clocks, exact moving-layer bottom anchor, detached-pixel crop, and continuous next-layer drilling after a break. Focused and full test results for this pass are recorded in `progress.md`.
- Final QA for this pass: `npm test` is green at 174/174; the required Playwright client and a caged-Miner browser run report no page/console errors. Inspected captures show Miner planted on the active line, drilling, and continuing on the next layer without a falling pose: `/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-continuous-planted.png`, `/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-continuous-drilling.png`, and `/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-continuous-next-layer.png`. The detached frame-0 alpha component remains excluded by the renderer crop; the generated source itself is preserved unchanged.
- Slower-cadence QA supersedes the prior captures: `40 / 3` shovel frames, `24 / 3` drill frames/bob, and `12 / 3` jackhammer shift. The remaining disconnected edge components are excluded by the frame crops; final inspected captures are `/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-slower3-crop2-planted.png`, `/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-slower3-crop2-drilling.png`, and `/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-miner-layer-20260817-slower3-crop2-next-layer.png`.

## Orb Race Square Root, Lazer, Twins, and Scissor (2026-08-17)

- Square Root now replaces the active layer health with its mathematical square root on every number-line hit: `10,000 → 100`, `100 → 10`, and so on. The applied damage is the removed remainder, not the root value; the existing exact-two-HP presentation exception remains deterministic and values at or below one break cleanly.
- Lazer keeps the orb body upright while its single beam rotates slowly through `raceLaserAngle`. Its damage remains exactly `1` per tick; progression reduces `raceLaserDamageInterval` from one second by `0.1s` per qualifying bounce, clamped to `0.00000001s`. A new beam contact waits for the complete interval before applying its first tick.
- Twins uses two independently simulated blue bodies. The main twin follows normal bounce physics and damage scaling. Every five seconds the second twin teleports to the opponent’s active layer, heals by its current damage once per second for ten seconds while continuing its damage ramp, then returns to the owner’s active layer. Renderer state is `raceTwinOrb`, `raceTwinHealing`, `raceTwinHealingUntil`, and the teleport/heal event stream.
- Scissor is a zero-body-damage utility orb. Its first active-layer contact creates the existing deterministic two-piece tilted-layer geometry, giving each piece half of the pre-split health. The generated scissors animation is rendered at the split point and uses three native square frames (closed, open, impact) without stretching.
- Generated Scissor asset pipeline: source `/Users/maxli/.codex/generated_images/019f5dea-5bae-7f93-88d0-cb62c6178ecc/exec-035f6c7a-dfab-4927-9988-266f90627756.png`; chroma source `assets/generated/orb-race-scissor-20260817-v1/source/scissor-sheet-chroma.png`; runtime final `assets/generated/orb-race-scissor-20260817-v1/final/scissor-sheet.png`; prompt, manifest, and alpha validation are in `assets/generated/orb-race-scissor-20260817-v1/`. Prompt requires an original pixel-art horizontal three-frame sheet of oversized silver/red-handled scissors, exactly three equal square frames on `#00ff00`, no orb, character, text, or background; final rendering is nearest-neighbor with transparent corners.
- Runtime integration: `src/simulation.js` owns the layer math/timers/child state/events, `src/orb-race.js` owns `twins`/`scissor` registry and groups, and `src/social-renderer.js` owns upright Lazer beam presentation, two-body Twins drawing, Scissor frame selection, and split HUD. Browser cache lineage is `20260817-twins-scissor-laser12`.
- Verification: full `npm test` passes 174/174; `node --check` passes for `src/simulation.js`, `src/social-renderer.js`, and `src/main.js`. Playwright QA was inspected at 1080×1920 for [Square Root 10K](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-twins-scissor-20260817/square-root-10k.png), [rotating Lazer](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-twins-scissor-20260817/lazer-rotating-beam.png), [Twins healing visit](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-twins-scissor-20260817/twins-healing-visit.png), and the corrected [Scissor split](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-twins-scissor-20260817/scissor-impact-fixed.png). The final Scissor rerun reports no console errors, page errors, or failed requests; the opponent board stays untilted while the Scissor-owned board shows the generated scissors and two tilted halves.

## Lazer and Sun impact-ring media contract (2026-08-17)

- Purple Sun now uses the lighter `#a855f7` base with `#f0abfc` accent. Its beam remains a single clipped downward stroke ending at the simulation-provided number-line intersection; the terminal white center marker was removed, leaving only the expanding purple impact rings.
- Blue Sun emits a three-ring `blueSunImpact` effect at each of its eight physical ray contacts. Lazer emits `laserImpact` effects on contact and every discrete damage tick; `ringCount` is derived from `raceLaserIntervalLevel`, increases as the interval falls in `0.01` steps, and caps at eight.
- Renderer seam: `src/social-renderer.js` consumes `purpleSunImpact`, `blueSunImpact`, and `laserImpact` through the shared `drawRaceBounceEffects` ring renderer. Lazer HUD uses `INTERVAL: <level> SEC`; no generic damage line is shown. Square Root continues to route its normal race bounce to `race-math-power`.
- Twins' away orb now uses normal fixed-step physics on the opponent lane and emits `race-twins-heal` on its own number-line bounces; the owner/home orb remains independently simulated.
- Announcement assets are valid Alex MP3s at `assets/audio/announcer/generated-race/race-twins.mp3` and `race-scissor.mp3`; preserved source copies are in `assets/audio/source/race-announcer-generated/`. Cache lineage is `20260817-twins-scissor-laser12`.
- Verification: `npm test` passes 174/174, including focused interval/ring monotonicity, impact event, Twins physics/healing, Scissor timing, and announcer asset checks. Inspected 1080×1920 Playwright captures: `artifacts/design-qa/orb-race-impact-rings-20260817/purple-sun-active.png`, `blue-sun-active.png`, `lazer-impact.png`, and `twins-visit.png`; `diagnostics.json` reports no console, page, or request errors.

## Twins opponent-lane media contract (2026-08-17)

- The healing Twin is a separate blue orb body, not an owner-board afterimage. `raceTwinOrb.raceTeamIndex` is the authoritative opponent-track target; portrait rendering uses the opponent board after both boards have been painted, and long-form rendering uses the opponent track’s transformed world rectangle. This prevents the target board fill from hiding the child or leaving duplicate Twins on the owner side.
- `src/simulation.js` places the visiting child at a seeded random point in the opponent’s active lane with an independent heading and bounce arc, then continues normal independent bounce physics. The child heals the opponent only on its own number-line contacts. The `race-twins-teleport` event records `targetTeamIndex`, `targetX`, `targetY`, `entryX`, and `entryY` for deterministic replay/QA.
- Renderer tests cover post-board compositing, opponent-lane selection, no owner-board duplication, long-form support, and the visiting-entry adapter. Simulation tests cover lane, random entry, independent bounces, stale visual-history clearing, and healing events. Browser evidence: `artifacts/design-qa/orb-race-impact-rings-20260817/twins-visit.png` shows the home Twin in the upper board and the independent healing Twin in the lower-board opponent lane.
- Browser cache lineage remains `20260817-twins-scissor-laser12`; no new image/audio asset was required.

## Twins healing cue and separation colors (2026-08-17)

- `race-twins-heal` reuses the shipped `assets/audio/effects/forge-item-pickup.mp3` route (`forge-item-pickup`) with `rateLimit: 0`, matching each healing contact rather than introducing a new sample.
- `src/social-renderer.js` tints only the separated home/damage Twin red (`#ef4444`) and visiting/healing Twin green (`#22c55e`), while the ordinary together state remains the Orb Race blue design.
- Cache lineage: `20260817-twins-scissor-laser12`.
- Verification: focused social/simulation suites and `npm test` pass 174/174. The separated red/green Twins are visible in `artifacts/design-qa/orb-race-impact-rings-20260817/twins-visit.png`; the browser diagnostics are clean.

## Twins separated damage boost (2026-08-17)

- When the Twins split, the red home Twin is now the dedicated damage body and deals `2×` its normal scaled layer-contact damage. The green visiting Twin remains a healing-only body with its existing independent bounce physics.
- The separated red Twin HUD and `render_game_to_text` now report the doubled damage value; paired Twins retain their normal damage value.
- Cache lineage advanced to `20260817-twins-scissor-laser12`. Focused simulation/social tests cover paired versus separated impact values and doubled layer depletion.
- QA: [Twins separated damage](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/orb-race-impact-rings-20260817/twins-visit.png) visibly shows the red Twin state with doubled damage HUD; diagnostics remain clean.

## Twins random healing entry and visual-history reset (2026-08-17)

- The visiting Twin now enters the opponent's active lane at a deterministic seeded random point with its own heading and bounce arc. It no longer spawns beside, follows, or inherits the opponent's position/velocity; it remains a separate physics body and continues healing on its own number-line contacts.
- Every healing teleport and return calls `resetRaceTwinVisualHistory`, clearing prior trail points, impact rings, rebound state, sticky/freeze state, and bounce flash before the new visit is rendered. Accumulated bounce and damage ramps remain intact. This prevents the second visit from replaying stale effects while allowing fresh impacts to appear during the new visit.
- State/event contract: `race-twins-teleport` now reports `spawnMode: "random-opponent-lane"` and `independent: true`; `raceTwinTeleportCount` remains monotonic for replay validation. The random entry uses `sim.raceRng`, so it is deterministic for a seed.
- Cache lineage advanced to `20260817-twins-scissor-laser12` across the browser/import/audio graph. Focused simulation/social assertions cover random in-lane entry, independent motion, healing, and stale-history removal on the second teleport.
- Verification: `node --test tests/simulation.test.mjs` and `node --test tests/social.test.mjs` pass; the full `npm test` and clean Playwright/visual Twins QA are recorded with this entry.

## Scissor persistent split layers (2026-08-17)

- Scissor tilted pieces are now stored and rendered per layer instead of being filtered through only the latest global split index. A surviving half remains visible and physical after Scissor falls through the opposite half.
- Physics still uses only the orb's current layer for contact, so a later Scissor impact can split the new layer without reopening, regrowing, or recutting the previous layer.
- Added a deterministic regression covering split → half break → fall → next-layer split. Cache lineage advanced to `20260817-twins-scissor-laser12`; `npm test` passes 174/174.

## Square Root low-health break rule (2026-08-17)

- Added the separate `squareRootDamageForLayerHealth` helper in `src/simulation.js`. It keeps the mathematical square-root remainder above two health, but applies the dedicated `1.46` damage rule to the entire sub-two-health tail (including the actual `sqrt(3) = 1.732...` state that is displayed as `2`).
- This fixes the concrete `9 → 3 → displayed 2 → 0` path: the `3` bounce leaves `sqrt(3)`, the next bounce removes `1.46` and leaves a sub-one remainder, and the following bounce consumes that remainder and emits the normal layer-break event.
- Added a simulation regression covering the exact path and preserving the existing exact-two-health and 10,000-health square-root behavior. Cache lineage advanced to `20260817-twins-scissor-laser12`.

## Lazer edge attachment and Scissor physical-layer camera follow (2026-08-17)

- Orb Race Lazer now starts its physical/rendered ray at the orb perimeter, exposes the orb center/edge attachment in `getRaceLaserRay`, and keeps a smooth continuous angular turn at one full orbit every five seconds.
- Lazer's damage clock now begins at `0.75s` and removes `0.01s` per qualifying bounce, clamped to the existing minimum interval. Impact-ring counts use the new baseline so the first accelerated level is readable instead of immediately maxing out.
- Tilted Scissor pieces remain persistent per layer for both physics and rendering. A live half remains interactable and damageable after Scissor advances through the open half; the long-form renderer keeps that piece visible even when the team-level active index has moved on.
- Long-form camera leader progress now considers member `raceLayerIndexOverride` values, so Scissor or another winning member can move the camera through an open tilted half while the untouched half remains physical.
- Added focused Laser interval/edge/orbit assertions, surviving-half physics coverage, and long-form camera-progress coverage. Browser cache lineage is `20260817-twins-scissor-laser12`.

## Lazer interval levels and persistent tilted-layer collision (2026-08-17)

- Lazer now rotates continuously at one complete orbit every `8s`. Its physical damage clock starts at `0.1s`; each bounce advances the discrete HUD level (`1 → 2 → 3`) and subtracts `0.001s` from the underlying interval, clamped at `0.00000001s`. The HUD no longer displays seconds and instead reports `INTERVAL LEVEL: <level>`.
- Every `race-laser-tick` routes to the existing `orb-collision` bounce sample with no rate limit and an expanded burst voice budget, so rapid interval hits can audibly overlap one cue per hit.
- Surviving Scissor halves above a racer's current lane are now physical underside collisions. Slammy and other orbs can bounce from and damage those live tilted pieces rather than hitting the generic top-wall branch; dead halves remain open.
- Added simulation/audio/social regressions for level/interval separation, eight-second rotation, per-tick audio, and Slammy's surviving-half bounce. Cache lineage advanced to `20260817-twins-scissor-laser12`.

## Lucas, Phase Three Sun, and Professor (2026-08-18)

- Added the stable Orb Race IDs `lucas`, `phase-three-sun`, and `professor` to the registry, picker, math/weapon groups, replay text, and export cache graph. Lucas uses the deterministic Lucas integer sequence (`2, 1, 3, 4, 7, 11...`) and renders its `Lₙ` emblem in a dark-red orb.
- Phase Three Sun uses Blue Sun's eight-ray physical intersection model with yellow beams, twice Blue Sun's per-ray damage, 2× beam width, and a 1.25× beam-scale increase after each completed laser window. Its timed start/hit/end events are `race-phase-three-sun-start`, `race-phase-three-sun-hit`, and `race-phase-three-sun-end`.
- Professor chooses a seeded random math form from its deterministic pool every five seconds, visually proxies that math orb while active, uses that form's damage/UI behavior, and returns to roulette after the five-second form expires. The `race-professor-spin` event is presentation-only and keeps the choice replay-safe.
- Alex announcer clips are live and preserve their generated sources: `assets/audio/announcer/generated-race/race-lucas.mp3`, `race-phase-three-sun.mp3`, and `race-professor.mp3`; source copies are in `assets/audio/source/race-announcer-generated/`. Existing new-orb clips were regenerated through the same local Alex pipeline so they remain valid non-silent MP3s.
- Audio routes include Phase Three Sun charge/hit and Professor roulette cues. No GPT image asset was required for these three orb bodies; they remain native Orb Race orb designs. Browser/import/audio cache lineage is `20260818-lucas-phase-three-professor1`.
- Focused simulation, feature, and social tests cover the Lucas sequence, Phase Three Sun timing/damage/beam growth, Professor seeded form selection, announcement files, HUD hooks, and cache-busted imports.
- Live Playwright QA is captured at `artifacts/design-qa/orb-race-lucas-phase-three-professor1/shot-2.png` with state snapshots in the same folder and no error files. The six-second Phase Three Sun active-beam check is `artifacts/design-qa/orb-race-lucas-phase-three-professor1-active/shot-0.png` (`phaseThreeSunActive: true`, 8 rays, 2,000 damage per ray); Professor transformation QA is `artifacts/design-qa/orb-race-professor-20260818/shot-0.png` (`FORM: DOUBLE`, one seeded spin). Elevated Chromium was needed because the sandbox denied macOS browser bootstrap; the rerun completed cleanly.

## 2026-08-20 — New Orb Race media contract

- `professor` renders `raceProfessorRouletteVisualOrbId` during a deterministic one-second roulette (five 0.2-second frames) and then proxies the committed math orb; HUD reads the active form and spin count.
- `phase-three-sun` keeps its stable ID but announces/renders as THE SUN. `phase-two-sun` uses orange Blue-Sun geometry plus a three-second burn effect; `trifecta` uses a yellow shockwave after three layer contacts; `gravitator` uses purple pull/lock rings.
- New Alex files: `assets/audio/announcer/generated-race/race-phase-two-sun.mp3`, `race-trifecta.mp3`, `race-gravitator.mp3`, and `race-group-suns.mp3`. `race-phase-three-sun.mp3` was regenerated for THE SUN. Source copies are preserved in `assets/audio/source/race-announcer-generated/`.
- Audio routes: `race-phase-two-sun-start`, `race-phase-two-sun-hit`, `race-trifecta-shockwave`, and `race-gravitator-pull`; cache lineage is `20260820-professor-suns-trifecta-gravitator2` across browser imports, samples, announcers, and sprite URLs.
- QA: `artifacts/design-qa/orb-race-new-orbs-tournament-portrait.png` shows the updated roster/bracket; `artifacts/design-qa/orb-race-professor-new-orbs.png` is the social canvas capture. No GPT images were needed because these are native Orb Race body/effect treatments. Playwright reported zero console errors.

## Sun beam contacts and Trifecta shockwaves (2026-08-20)

- `drawRaceBlueSunLasers`, `drawRacePhaseTwoSunLasers`, and `drawRacePhaseThreeSunLasers` now call the shared `clipRaceSunLaserToLayer` helper. `raceSunLaserLayerClipRectFor` maps a `hitLayer` ray to the physical `raceLayerLineY` boundary so gradients, wide strokes, and round caps cannot paint through a number layer.
- Trifecta's fixed-third contract is gameplay-owned: `raceLayerOriginalStrengths`/team originals are preferred, with `raceLayerStrengths` and current health as tolerant fallbacks. It is registered in `RACE_VERY_STRONG_MATH_ORB_IDS` for the `0.12` travel-speed profile.
- Renderer tests cover the layer clip rectangle and non-layer fallback; simulation tests cover 900 → 600 → 300 → 0 after three Trifecta shockwaves and the very-strong speed profile. Cache lineage is `20260824-gravitator-shuttle1`.
- QA evidence: `artifacts/design-qa/sun-trifecta1/phase-two-battle.png` and `artifacts/design-qa/sun-trifecta1/sun-battle.png` show active rays terminating at the first layer; official Playwright found zero console errors. The bundled game Playwright client was unavailable because macOS denied Chromium `bootstrap_check_in`.

## Sun ray alignment, RGB roulette, and Professor randomness (2026-08-24)

- Long-form rendering now applies the same normalized Blue Sun intersection transform to The Sun (`phase-three-sun`), Phase Two Sun, and Purple Sun. Every variant transforms its ray endpoints through the active track's world rectangle, so the rendered origin remains attached to the orb and the layer endpoint remains aligned after portrait-to-long-form reflow. The shared layer clipping contract remains unchanged.
- RGB now has a deterministic one-second visual roulette during the final second of each five-second color cycle. It advances a seeded non-repeating sequence every 0.2s, exposes `raceRgbRouletteVisualColorIndex` to the renderer, then commits the final color and applies its color-specific ramp. Speed and growth ramps are active for RGB; RGB growth is 2× the normal growth increment.
- Grower’s per-bounce growth increment is now `0.05` (1.25× the prior `0.04`). Professor is in the very-strong math speed profile and shuffles its complete math pool with the seeded race RNG per spin, avoiding the old fixed-first `x^x` result while preserving deterministic replay.
- Reality Bomb’s spawned helpers are independent full-size Slammy racers (`raceOrbId: "slammy"`, `raceMiniScale: 1`) with normal Slammy layer damage/ramp behavior; they are no longer hollow Slammy Grower hybrids.
- Cache lineage is `20260824-gravitator-shuttle1`. Source contracts and focused tests cover the long-form endpoint transforms, RGB roulette fallback/visual index, Grower increment, Professor seeded variety/speed, and Reality Bomb child identity.
- Live evidence: [Phase Two Sun long-form](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/sun-ray-rgb-professor2/phase-two-sun-longform-active.png), [The Sun active long-form](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/sun-ray-rgb-professor2/phase-three-sun-active-longform.png), and [Purple Sun long-form](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/sun-ray-rgb-professor2/purple-sun-longform-active.png). All three captures show beams attached to their orb and stopping at the active layer; Playwright reported zero console errors and all requested static assets returned 200.

## RGB, Gravitator, Super Slammy, Lucas Sequence, and Piercer (2026-08-24)

- RGB side-wall rendering consumes reflected overshoot from the deterministic physics state. This prevents high-speed side contacts from visually sticking at the wall or appearing to teleport. No new image asset was required; RGB remains the native themed orb with seeded color roulette.
- Gravitator now owns a shared `raceGravitatorLayerPullOffsets` array on its team. `src/simulation.js` eases the active layer toward the orb contact while `src/social-renderer.js` applies the same offset to portrait/long-form layer lines and effects. `race-gravitator-pull` events and replay frames preserve the offset/progress fields.
- New native Orb Race designs: `super-slammy` is dark red with +5 damage per bounce; stable `lucas` now presents as the dark-green Lucas Sequence with `Lₙ`; `piercer` is dark gray and sweeps all live layers while gaining +0.2 damage per contact. HUD descriptors are in `src/social-renderer.js`; no GPT image asset was needed for these simple orb identities.
- Generated Alex announcement assets: `assets/audio/announcer/generated-race/race-super-slammy.mp3`, `assets/audio/announcer/generated-race/race-lucas.mp3`, and `assets/audio/announcer/generated-race/race-piercer.mp3`. Preserved generated source copies are `assets/audio/source/race-announcer-generated/race-super-slammy.mp3`, `race-lucas.mp3`, and `race-piercer.mp3`. All are decodable non-silent MP3s after running `node scripts/generate-race-announcements.mjs --new-orbs-only` with the local Alex voice pipeline.
- Browser/import/audio cache lineage: `20260824-gravitator-shuttle1`. Focused simulation, features, and social tests cover roster IDs, announcer files, RGB wall reflection, Gravitator layer pull state, Super Slammy ramp, and Piercer all-layer damage.

## Gravitator shuttle refinement (2026-08-24)

- Gravitator's active layer now moves monotonically toward the ceiling until a radius-based chamber remains; the physical orb keeps its normal fixed-step motion.
- The pulled-layer launch arc is ceiling-aware and includes a small deterministic overshoot, producing repeated top-wall → pulled-number-line bounces without overlap or double-bounce clamping. Pull events include `targetOffset` and `shuttleLocked` for replay/HUD consumers.
- Simulation coverage verifies the physical chamber and repeated contacts. Cache lineage is `20260824-gravitator-shuttle1`; QA evidence is the live [RGB vs Gravitator canvas](/Users/maxli/Documents/ball-battle-simulator/artifacts/design-qa/rgb-gravitator-shuttle1/rgb-gravitator-live-canvas.png).

## Tsar Bomb, Piercer ramp, and All In One (2026-08-25)

- Added the stable Orb Race IDs `tsar-bomb` and `all-in-one`. Tsar Bomb is a black/red 90-second countdown orb with no ordinary bounce damage, a Reactor-style pulse on its own active layer every 8 seconds, and a Hydrogen-style mass detonation/flash at the end of the countdown. All In One is a black/white orb that composes the current Orb Race roster, activates every 15 seconds for 5 seconds, and ramps its active contact power by `×10` per bounce on both walls and number lines. Its embedded Hydrogen-style countdown is independent and uses the same deterministic detonation path.
- Piercer's damage ramp is now `+0.75` per number-line contact while preserving its all-live-layer sweep.
- Alex announcement assets are live and source-preserved at `assets/audio/announcer/generated-race/race-tsar-bomb.mp3`, `assets/audio/announcer/generated-race/race-all-in-one.mp3`, `assets/audio/source/race-announcer-generated/race-tsar-bomb.mp3`, and `assets/audio/source/race-announcer-generated/race-all-in-one.mp3`. The generated clips were decoded/validated after the local speech pipeline was run outside the sandbox; no header-only files remain.
- New event routes use `hydrogen-bomb-siren`/`hydrogen-bomb-explosion`/`hydrogen-bomb-ear-ringing` for the bomb lifecycle, `black-hole-impact` for Tsar reactor pulses, and `race-math-power` for All In One activation. Renderer HUD/replay fields expose the countdown, reactor cadence, active window, and multiplier without replacing the orb's centered identity.
- Browser cache lineage is `20260825-tsar-all-in-one1` across `index.html`, `main.js`, simulation, renderer, social, Orb Race, audio, and generated race announcement lookup.
- Focused simulation/features/social coverage verifies the new roster, 90-second/8-second Tsar timing, All In One ability composition and active `×10` contact ramp, Piercer's `+0.75` progression, announcer files, renderer HUD hooks, and event-to-sample routes.
