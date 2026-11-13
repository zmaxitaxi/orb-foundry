# Battle Lab

## Design brief

- Visual thesis: a calm glass workbench in warm silver and graphite, with the
  existing black Classic arena as its dominant visual.
- Content plan: immediate playable workspace, challenge builder and presets,
  replay timeline and event inspector, then an optional engineering overview.
- Interaction thesis: immediate press feedback; direct timeline scrubbing;
  interruptible spring motion for the inspector's segmented control. Respect
  reduced motion, reduced transparency, and increased contrast.
- Design source: [Apple Design by Emil Kowalski](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md).

## Scope

Build a static `lab.html` entry point with versioned share links, all Classic
fighters, exact 120 Hz stepping, event navigation, inspection overlays, local
saved challenges, portable JSON, and deterministic replay verification. Reuse
the production simulation and renderer. Keep the recorded battle's look and
behavior unchanged. Apply the same restrained interface system to the existing menu,
profiles, setup, recording controls, and preview.

## Architecture

- `battle-lab-model.js`: validated, versioned challenge contracts and links.
- `battle-lab-replay.js`: deterministic stepping, bounded checkpoints, complete
  event collection, replay fingerprints, and exact seeks.
- `battle-lab-worker.js`: cancellable preparation and replay requests away
  from the UI thread.
- `battle-lab.js`: DOM flow, playback controls, rendering, local persistence,
  import/export, and accessibility.
- `apple-ui.css` / `battle-lab.css`: shared interface tokens and the workbench.

The simulation remains the source of gameplay rules. Overlays only inspect
existing geometry. Playback speed, UI motion, and sound never alter a result.
Engine versions scope reproducibility; unsupported versions are rejected
explicitly. Saved challenges remain on the current browser. Share links
contain their inputs and work independently of that storage.

## Replay and challenge contract

- Schema version 1; engine identity `classic-071700f` refers to the unchanged
  rules baseline. Renderer, sound, and DOM updates do not change that identity.
- A challenge contains two stable fighter IDs, an integer seed, square/circle
  arena, two starting HP values, and a display name. The lab accepts all 65
  current Classic fighters. HP is bounded to 1–2,000 for this inspection tool.
- Links use a bounded UTF-8 base64url `challenge` parameter. Unknown schemas or
  engines are rejected visibly. Imported JSON is bounded to 2 MB and never
  evaluated as code. Names are rendered as text, not executable markup.
- Preparation runs to a real result or a 90-second analysis limit. A limit
  never invents a winner. Checkpoints occur every 480 steps (four seconds).
- The event observer is a WeakMap outside simulation state. It captures events
  before the rolling presentation buffer is trimmed; it does not add gameplay
  state. Structured clones preserve Sets and actor aliases; seeking restores
  the RNG prototype and state before advancing the remaining fixed steps.
- Fresh verification compares diagnostic state and event fingerprints. It is
  scoped to this rules version and runtime; it is neither cryptographic nor a
  promise of bit-for-bit floating-point equivalence across browser engines.
- Portable replay JSON stores the challenge, event log, and expected proof;
  importing reruns the authoritative inputs rather than trusting supplied
  state. Saved challenges are a bounded local library, not an online account.
- Shared links begin paused at step zero. Recorder links carry the same seed,
  fighters, arena shape, and per-team HP, with the recorder's intro restored.

## Interface and motion

Home, profiles, lab, setup, tournament controls, recorder, preview, About, and
Course Study use the same light/dark CSS materials. Theme persists locally and
initially follows the OS. Blur has solid alternatives for reduced transparency;
reduced motion removes transitions and freezes the decorative home demo.

The home preview is a muted instance of the production Classic engine. It stops
when hidden. The lab renders the complete square arena with additional camera
padding for WDC, sabers, Kratos, and Ben 10. Overlays share that transform.
Recorded pixels still come only from the dedicated `socialCanvas`; DOM glass,
menus, overlays, and website transitions remain outside the capture.

Motion includes short page entrances, interruptible screen changes, spring
segmented tabs, direct timeline scrubbing, native dialog entry/exit, menu
reveals, and small hover/press cues. No decorative website motion affects rules.

## Original effects

`src/original-sfx.js` defines 62 original PCM designs and material-based voices
for procedural events. `npm run audio:generate-original` regenerates all WAVs,
measurements, and the listening reel in `assets/audio/effects/original-v1/`.
The live sample manifest uses only those WAVs. Old recordings stay archived.
Spoken announcements use one Alex palette matching the Luke reference family. Luke’s original MP3 is preserved byte-for-byte; 314 cue IDs resolve to 276 phrases across every mode. `npm run audio:generate-announcer` regenerates the other phrases, with text, voice settings, and hashes preserved under `assets/audio/source/single-voice-20261112/`. Historic source palettes remain exported for compatibility; `ANNOUNCER_ASSETS` is the live single-voice manifest.

The live Web Audio graph still handles spatial panning, voice budgets, category
volume, ducking, looping sirens, and the recorder's audio destination. Movement,
windup, and impact have separate envelopes. Paper, metal, sand, rubber, crystal,
fire, body hits, and energy use distinct designs.

## David's Course Study integration

The original work is [commit 0f47d3a](https://github.com/zmaxitaxi/orb-foundry/commit/0f47d3ae16f936c270e794612f49a4ad810bffc8).
The static `study.html` uses his 121-entry catalog directly and shares the pure
`barrier`, `curve`, `contest`, and `courses` models from `site/src/lib/`.
`npm run study:sync` strips their TypeScript into checked-in browser ES modules.
The site needs no build to run; that command is only for explicitly syncing
changes to David's models. The separate Next.js site remains intact.

The dial is a November 8 analytical snapshot, not a live race or an upload
schedule. It assumes equal contact rates, excludes projectile/path effects,
keeps fuses in seconds, and leaves Classic off the bounce ranking. That boundary
is visible in the UI. Model results and live Battle Lab outcomes are distinct.

## Verification

```sh
npm test
python3 -m http.server 4173
npm run qa:browser-smoke
npm run qa:battle-lab
npm run qa:site
```

Node checks include challenge URL/recorder round trips, exact seeks across
checkpoint boundaries, full event capture, RNG/Set restoration, time limits,
known course calculations, original PCM regeneration, audio bounds, and live
material routing. Playwright covers sharing in a fresh mobile context, stepping,
saves, import mismatches, cancellation, themes, navigation, course controls,
all 62 sample decodes, the actual audio graph/recording stream, and a real
1080×1920 video preview. Screenshots are supplementary; state and errors are
asserted. Production upload/publishing is not part of these checks.

Hosting is separate from implementation: the files run on an HTTP static
server. No public deployment or externally available share URL is implied by
local preview. See [website flow](WEBSITE_FLOW.md) and [new orb ideas](ORB_IDEAS.md).

## Final visual direction

The user loosened the Apple requirement in favor of a distinct Orb Foundry
identity with taste and simplicity. `foundry-ui.css` adds warm copper, graphite
glass, tighter controls, and a separate Racer green. The two-mode homepage uses
a spring switch, real muted Classic/Racer demos, and a small pointer depth cue.
No framework migration was needed. The Apple skill remains a foundation for
clarity, direct controls, and accessibility, not a fixed visual template.

The user then requested a more flamboyant motion layer. `site-effects.js` and
`site-effects.css` add moving outline type, floating particles, orbit rings,
reactive color glows, and letter entrances behind page content. These are DOM
layers, not gameplay canvases. Reduced motion makes the backdrop static, higher
contrast removes it, and hidden tabs pause its animations.
