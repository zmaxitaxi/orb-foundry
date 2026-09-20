**Comparison Target**

- Source visual truth: `/Users/maxli/Downloads/ScreenRecording_06-15-2026 10-35-13_1.mov`
- Source capture: `artifacts/source-video-thumbnail.png`
- Implementation screenshots:
  - `artifacts/orb-foundry-final-desktop.png`
  - `artifacts/orb-foundry-final-mobile.png`
- Combined comparison: `artifacts/orb-foundry-video-comparison.png`
- Viewports: 1440x1000 desktop and 390x844 mobile
- State: active Hex-versus-Gravis combat with no hazards

**Evidence**

- macOS Quick Look captured the supplied 17.622-second portrait recording.
- The source and mobile implementation were normalized into one side-by-side comparison image.
- Both show a light, undecorated combat field with one dark border, compact colored balls,
  bold HP inside the balls, and oversized class weapons.
- The implementation keeps the complete 960x560 arena visible and places unique class art
  beside each fighter stat line immediately below it.
- Browser verified portrait, square, and landscape export canvases at 1080x1920,
  1080x1080, and 1920x1080.
- Browser verified 390x844 without horizontal overflow and reported no console warnings
  or errors.
- A landscape recording finalized into the export preview successfully.

**Focused Comparison**

- No additional crop was required. At the normalized comparison size, the arena border,
  HP numerals, ball outlines, weapon scale, announcement strip, and stat symbols are all
  directly readable.

**Findings**

- No actionable P0, P1, or P2 visual mismatches remain.
- The source places elemental labels around the arena, while Orb Foundry uses a branded
  header and stat dock. This is an intentional product treatment that preserves the
  source's class-symbol and combat-information hierarchy.
- The source is embedded inside a social app recording with large black margins. Orb
  Foundry correctly uses those pixels for its recording studio and export presentation.

**Required Fidelity Surfaces**

- Fonts and typography: bold HP and condensed combat labels remain readable at desktop
  and mobile sizes.
- Spacing and layout rhythm: the full arena, announcement, and stat dock do not overlap
  or clip in any export format.
- Colors and visual tokens: cream field, dark border, class colors, and ink UI preserve
  the source contrast while matching Orb Foundry's existing palette.
- Image quality and asset fidelity: stat symbols use the project's real class artwork;
  no placeholder glyphs or generated stand-ins are used.
- Copy and content: combat announcements, fighter names, stats, recording state, and
  export metadata are coherent and complete.

**Patches Made**

- Increased standard orb radius from 25 to 42 and crowd radius from 20 to 32.
- Increased weapon reach by a global 2.13 scale and weapon rotation by 1.75x.
- Increased movement speed from 396/354 to 594/531 units per second.
- Added exact 500 ms presentation-only pauses for weapon hits, shield blocks,
  and invulnerability blocks.
- Replaced the social arena's nested walls and overtime decoration with one thin border.
- Changed the default hazard preset to none.
- Reduced orb outline thickness and changed impact flash to an outer ring so HP stays
  readable.
- Added larger unique class-art symbols to the fighter stat panels.
- Added and updated speed, sizing, contact-density, pause, block, symbol, and layout tests.

**Implementation Checklist**

- Automated tests pass.
- Desktop and mobile Browser playtests pass.
- Portrait, square, and landscape export dimensions pass.
- Recording finalization and console checks pass.

final result: passed

# Classic Orb Foundry Weapon/Title Design QA

Source visual truth:

- `/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/codex-clipboard-cd13f5bf-efe7-42b7-b65a-0019cbd37c3a.png`
- User-supplied Earclacks fight screenshot in the active request.

Implementation evidence: live in-app-browser Classic matches at the 1080 × 1920 portrait export format, including Potion vs Katana and Bow vs Unarmed.

## Comparison evidence

- Weapon handles/pivots overlap the orb edge and the weapon revolves independently around the orb.
- Weapon sprites are rendered with hard nearest-neighbor pixels and black pixel outlines at the requested enlarged scale.
- Matchup names use title case, condensed heavy lettering, black outlines, inline weapon icons, and an outlined white `VS` immediately above the arena.
- The arena is a narrower centered white square with a fourteen-pixel black frame and cream surrounding space.
- Bow displays one attached bow, one-arrow starting state, and the new larger transparent pixel-arrow projectile without projectile flooding.

## Findings

No actionable P0, P1, or P2 defects remained in the verified title, arena, attachment, or Bow cadence surfaces.

- [P3] The supplied title reference uses a proprietary/unknown display face. The implementation uses the closest locally available condensed heavy stack (`Impact`, `Haettenschweiler`, `Arial Narrow Bold`) and reproduces its outline, scale, capitalization, and placement.

## Primary interactions checked

- Loaded a deterministic Classic Bow vs Unarmed URL.
- Started the match through the setup dialog.
- Verified the title composition, enlarged rotating bow, handle attachment, fixed `ARROWS: 1` starting state, and stable browser rendering.
- Verified the complete automated suite after the visual and cadence changes.

final result: passed

## Classic Orb Foundry 1v1 Rework (2026-07-27)

Source visual truth:

- `/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/codex-clipboard-b9bbc750-0216-4c2c-b1b1-b27c8e95e962.png`
- `/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/codex-clipboard-a8049dad-de82-4dea-8a79-c34659701b4c.png`
- `/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/codex-clipboard-51140742-4ac7-4c58-b26e-67c3fc3ed1e5.png`
- `/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/codex-clipboard-7c2ec4a4-849a-4276-81aa-de9d6300e60b.png`

Playwright verification used the dedicated 1080 × 1920 social canvas.

- The Classic roster contains exactly the approved 11 orbs and setup remains permanently 1v1.
- The title uses the installed Impact display face, colored fills, heavy black outlines, compact weapon icons, and a centered outlined `VS`.
- The arena is a narrower centered white square with a ten-pixel black border and cream surround.
- Generated weapon sprites use hard nearest-neighbor pixels and transparent backgrounds. They preserve native aspect ratios, stay compact, and rotate around the orb rather than replacing or rotating the orb body.
- Bow hugs the orb perimeter as a compact curved attachment. Sword, Axe, Dagger, and Katana extend outward from the edge; Potion remains unstretched.
- Solid orb colors, black outlines, bold black health values, one signature stat per fighter, and the subtle Orb Foundry watermark remain legible without overlap.
- Playwright reported no browser console warnings or errors.
- Automated verification: 16 tests passed, 0 failed.

final result: passed

## Orb Race Physics And Finish-Band Correction (2026-07-13)

Source visual truth: `/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/codex-clipboard-00d92151-55e6-4bf3-a64e-a7e6d2b63429.png`

Implementation screenshot: in-app Browser social-export preview at the local Orb Foundry URL.

Viewport: 1280 × 720 browser viewport; 1080 × 1920 portrait export.

State: seeded Orb Race with Orbital and Drill racers at upper-right launch and during a number-wall rebound.

**Findings**

- [P1] The earlier race motion followed a preset travel value and only drew an apparent bounce.
  Fix: replaced it with deterministic per-racer position and velocity, gravity, top/side wall restitution, number-wall collision restitution, and speed clamping modeled on Orb Foundry's bounded orb physics.
- [P1] The two race boards were not the same height and the checkerboard could overpaint its finish slot.
  Fix: both boards now use the same 650 px race-card height; the lower 75% of the finish band is clipped checkerboard while the upper 25% is white.
- [P2] Number-wall labels did not read as strongly as the supplied reference.
  Fix: retained the 900-weight fitted type and verified the heavy, centered numerals in the browser-rendered board.

**Comparison evidence**

- Full view: both boards are equal size, use the same launch region, and preserve the reference's stacked white number walls and black outline rhythm.
- Focused finish region: the white 25% lead-in and contained checkerboard fill align to the finish rectangle without overflow.
- Focused motion region: a launched orb begins at upper-right, falls under gravity, reverses its vertical velocity at a number wall, and continues upward from the resulting physical rebound rather than following a scripted arc.

**Required fidelity surfaces**

- Fonts and typography: number values are heavy, centered, high-contrast, and remain legible at the full portrait scale.
- Spacing and layout rhythm: both boards are equal height with even wall rows and a consistent inter-board gap.
- Colors and tokens: white lead-in, black-and-white checkerboard, dark borders, and active racer color retain the reference hierarchy.
- Image quality and asset fidelity: race elements are live native-canvas gameplay entities; no source image asset is replaced.
- Copy and content: damage, bounce, and special-orb counters remain positioned at their requested corners.

**Implementation Checklist**

- [x] Replace preset race travel with deterministic physical rebound.
- [x] Equalize race-card heights.
- [x] Contain the 75% checkerboard inside the final band after a 25% white lead-in.
- [x] Verify simulation rebound behavior and full automated suite.

final result: passed

## Full-Portrait Race Expansion (2026-07-13)

Source visual truth: `/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/codex-clipboard-00d92151-55e6-4bf3-a64e-a7e6d2b63429.png`

Implementation evidence: in-app-browser social export preview, 1080 × 1920 portrait canvas.

- The portrait export surface is now a true 1080 × 1920 (9:16) canvas.
- Race cards are widened to 86% of the canvas (up to 930 px); the lead card is 700 px tall and the second card is exactly 1.25× smaller.
- Both racers launch from the upper-right corner toward the first numbered boundary.
- Each collision now has a visible rebound arc, driven by the simulation's deterministic `raceBounceFlash` state.
- Top-racer stats stay upper-left; second-racer stats stay lower-right. The active number wall and checkerboard finish remain clear at the expanded scale.
- The in-app browser completed a full race/export with no console warnings or errors.

final result: passed

## Corner-stat expansion (2026-07-13)

Source visual truth: `/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/codex-clipboard-00d92151-55e6-4bf3-a64e-a7e6d2b63429.png`

Implementation evidence: browser-rendered enlarged two-card Orb Race at 1280 × 720, running state.

- Enlarged the boxed race cards and their launch areas.
- Superseded by the full-portrait expansion below: both racers now launch from the upper-right, while the stat placement remains top-left and bottom-right.
- The numbered boundaries and checkerboard finish remain dominant and readable.
- Browser console warnings/errors: none.

final result: passed
# Announcer And Impact Pass

- Automated simulation, feature, social, audio-plan, presentation-timeline, and
  recorder tests pass.
- All 23 HeyGen-derived announcer files validate as mono 44.1 kHz 16-bit PCM WAV.
- Browser local smoke verification loaded `Orb Foundry`, opened the recording
  setup, started and stopped a short local recording, and reported no console
  errors.
- In-app Browser Web Audio playback signoff remains limited because this Browser
  runtime reports `AudioContext` and `webkitAudioContext` as unavailable.

# Imported Combat Sample Pass

- Automated simulation, feature, social, sample-manifest, and sample-event
  mapping tests pass.
- All six runtime MP3 files validate with `afinfo`.
- Browser loaded the updated `src/audio.js?v=20260615-sample-sfx1` module and
  completed a no-console-error setup/recording smoke test.
- Real listening QA should be done in a normal browser with Web Audio support.
# Orb Race Design QA

Source visual truth: `/var/folders/xy/qnnz362x33553z6k534cx26h0000gn/T/codex-clipboard-388f6d6c-dcf3-489a-859c-d1d7e42e3ea7.png`

Implementation screenshot: `/private/tmp/orb-race-implementation.png`

Viewport: 1280 × 720 browser viewport; portrait social canvas.

State: Orb Race running with Orbital and Drill racers after several bounces. The source is a taller mobile capture while the implementation is the app’s fixed portrait social-export surface, so the review compares the two visible race-card regions rather than their surrounding browser frames.

## Comparison evidence

- Full view: both source and implementation show two independent vertical race boards with a large damage label, a white launch space, stacked number boundaries, a colored active layer, and a checkerboard finish.
- Focused board comparison: implementation preserves the heavy black horizontal borders, centered large wall values, black-and-white finish cadence, split-color orb treatment, and per-orb growth callouts. It intentionally uses the app’s compact social canvas rather than duplicating the source’s full-phone crop.

## Findings

No actionable P0, P1, or P2 differences.

- [P3] The source has more vertical breathing room around each board because it is a tall mobile capture. The implementation uses a compact two-board composition to fit the existing social-export canvas; this is an intentional product constraint.

## Required fidelity surfaces

- Fonts and typography: heavy high-contrast monospace display treatment is used consistently for damage, layer values, racer names, and stats. Values remain readable without clipping at the verified viewport.
- Spacing and layout rhythm: cards share a centered width, consistent thick borders, evenly divided layer rows, a clear midpoint `VS`, and a stable finish band.
- Colors and tokens: cream background, white lanes, black borders, cyan/purple/magenta/gold racer accents, and translucent active-layer fills match the supplied visual language.
- Image quality and asset fidelity: the target contains no external logo, illustration, or photographic asset required by the app. Race marks are dynamic canvas game entities, rendered at native canvas resolution without raster scaling artifacts.
- Copy and content: `DAMAGE`, wall strengths, racer names, special-orb counters, and finish state map directly to the requested race rules.

## Primary interactions checked

- Switched Gameplay Mode to `ORB RACE · NUMBER WALLS`.
- Verified the four-orb roster and all three numeric wall-strength controls are visible.
- Started a race and verified damage growth, active wall updates, orbital ring growth, drill counter/penetration visual, checkerboard finish, and browser console warnings/errors (none).

## Implementation checklist

- [x] Replace King of the Hill picker/setup with Orb Race.
- [x] Add deterministic bounce, damage, wall, special-orb, and finish rules.
- [x] Add per-wall strength configuration and URL serialization.
- [x] Render the reference-inspired two-card race presentation.
- [x] Add automated coverage and run the full suite.

final result: passed

## Orb Race Blue Sun long-form boundary QA (2026-08-11)

- Long-form active Blue Sun frame: `artifacts/design-qa/blue-sun-longform-final/t3.png`.
- Portrait regression frame: `artifacts/design-qa/blue-sun-portrait-final/blue-sun-portrait.png`.
- Standard Playwright client frame: `artifacts/design-qa/blue-sun-longform-final-client/shot-0.png`.
- The long-form frame now shows complete cyan ray glow/end-caps at the top camera boundary; the ray body remains inside the race board and portrait rendering remains unchanged. Browser error manifests are empty for the dedicated captures.
- Remaining known test issue: the unrelated existing `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion keeps the workspace suite at `85/86`; focused Classic/features/social coverage is `73/73`.

## Orb Race Blue Sun indefinite long-form rays (2026-08-11)

- `artifacts/design-qa/blue-sun-longform-final/t3.png` now shows rays continuing across the virtual number-line cards to the actual lane frame instead of stopping at an invisible barrier.
- The portrait regression at `artifacts/design-qa/blue-sun-portrait-final/blue-sun-portrait.png` remains physically wall-bounded.
- Dedicated Playwright error manifests are empty; focused Classic/features/social tests pass `73/73`.

## Orb Race Blue Sun physical number-line contact correction (2026-08-11)

- The prior all-ray extension was corrected after visual review. In the final long-form frame, only rays that hit the cleared/virtual `top-wall` continue to the visible lane boundary. Rays that hit the actual number layer stop at that layer and show the contact cap; side-wall rays stop at the real frame.
- Final long-form evidence: `artifacts/design-qa/blue-sun-longform-final/t3.png`; portrait regression: `artifacts/design-qa/blue-sun-portrait-final/blue-sun-portrait.png`; standard client: `artifacts/design-qa/blue-sun-longform-final-client/shot-0.png`.
- All dedicated browser error manifests are empty. Focused social coverage passes; the full suite remains `85/86` because of the unrelated `tests/simulation.test.mjs:1111` top-wall-hit threshold assertion.
