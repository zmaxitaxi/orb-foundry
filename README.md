# Orb Foundry

Orb Foundry is a deterministic Social Battle recorder. Choose a roster and
seed, run a two-orb fight, and export the dedicated canvas as a social-ready
MP4.

## Player Flow

`Menu → fighter profile or Play → Social Battle setup → Record Fight → battle → winner → preview`

The setup includes:

- Fighter roster
- Deterministic seed
- Non-damaging arena hazards
- Cosmetic arena theme
- True 9:16 portrait export at 1080 × 1920, plus square and landscape presets
- 30 or 60 FPS recording
- Optional presentation-only highlight emphasis

When more than two classes are selected, the seed chooses the same reproducible
pair every time. Legacy tournament and ordinary match links are normalized into
this two-fighter Social Battle flow.

## Visual Language

Every visible orb uses the flat Social Battle treatment:

- Solid class color
- Dark circular outline
- Small highlight block
- Two-letter class mark in menus and setup
- Live HP number inside each in-arena orb

The detailed Canva orb atlases are retained only as archived design sources.
The Social Battle runtime does not load them.

## Architecture

- `src/simulation.js`: fixed-step physics, deterministic RNG, abilities, hazards, events, and victory state
- `src/social-renderer.js`: dedicated social compositor and export layouts
- `src/renderer.js`: shared arena drawing used internally by the social compositor
- `src/recorder.js`: MediaRecorder lifecycle and MP4 creation
- `src/social.js`: export presets, captions, compact stats, and highlight classification
- `src/main.js`: menu, profiles, setup, recording flow, preview, feature gates, and balance controls
- `src/config.js`: Social Battle-only settings normalization and compact URL serialization
- `src/audio.js`: imported combat samples, metallic procedural fallback audio,
  buffered HeyGen announcer cues, mixer ducking, and recording-stream routing
- `src/presentation-timeline.js`: deterministic versus/countdown/FIGHT cue clock

`src/tournament.js` and `src/tournament-worker.js` remain dormant for possible
future reuse. They are not imported, initialized, or reachable from the product.

## Determinism

Simulation advances at `1 / 120` seconds. Themes, export formats, recording
frame rate, screen shake, hit-stop, and highlight slow motion alter presentation
only. The same seed, roster, hazards, and balance values produce the same
simulation result.

After 90 seconds, forge overtime steers living fighters toward their nearest
opponent. At 180 and 240 seconds it increases weapon reach and power. Overtime
never removes health directly.

## Recording

Social Battle records only `#socialCanvas`; menus, setup, developer controls,
browser chrome, and unused page space are excluded. The export canvas is cropped
to the title, arena, and orb stat panels. Supported browsers receive an MP4
preview, retry, share-link, and download flow. Unsupported environments retain a
playable preview-only battle.

The intro freezes simulation through the fighter callouts, `3 · 2 · 1`, and
`FIGHT!`. Announcer WAVs load asynchronously into Web Audio and share the
recording graph. Missing files fall back to short procedural callout stingers
without blocking a match.

## Run

Serve this directory over HTTP:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Daily Instagram Battle

Export one random two-orb Social Battle:

```bash
npm run battle:export
```

Export and post it to Instagram:

```bash
npm run battle:post
```

The daily command runs the complete production flow:

```text
record WebM -> transcode MP4 -> upload MP4 -> publish Instagram Reel
```

The exporter uses local Chrome in headless mode and writes video plus metadata
under `artifacts/daily-battles/`. Set `CHROME_PATH` if Chrome is not at
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. The MP4
transcode needs `ffmpeg`; set `FFMPEG_PATH` if it is not on PATH.

Instagram posting uses the Meta Graph API and needs environment variables:

- `IG_USER_ID`: Instagram professional account ID
- `IG_ACCESS_TOKEN`: access token with publishing permissions
- `S3_BUCKET`: bucket for hosted battle videos
- `S3_ACCESS_KEY_ID`: object-storage access key
- `S3_SECRET_ACCESS_KEY`: object-storage secret key
- `S3_PUBLIC_BASE_URL`: public HTTPS base URL for the bucket or CDN
- `S3_REGION`: storage region, or `auto` for Cloudflare R2
- `S3_ENDPOINT`: optional S3-compatible endpoint, such as Cloudflare R2
- `S3_PREFIX`: optional object prefix, defaults to `orb-foundry/daily-battles`

Captions use `ORB 1 vs ORB 2` plus `#weaponballs #orb #simulation`.

## Daily YouTube Publishing

The approved daily YouTube schedule and metadata contract lives in
[`config/youtube-publishing.json`](config/youtube-publishing.json), with the
activation requirements documented in
[`docs/YOUTUBE_PUBLISHING.md`](docs/YOUTUBE_PUBLISHING.md). The separate
external scheduler initiates daily publishing; GitHub Actions is manual-only.
Changes to this repository do not automatically edit the external scheduler's
own settings. Its video-ready allowlist must be populated before uploads run.

Validate the current contract with:

```bash
npm run youtube:validate
```

Run a safe local publishing plan without rendering or uploading:

```bash
npm run youtube:publish -- --dry-run --slot=noon-short --date=2026-09-19
```

The manual workflow in `.github/workflows/youtube-publishing.yml` can validate
or run a batch on demand. The external scheduler should prepare four private
uploads: one Short and one long-form at noon, and one Short and one long-form
at 3 PM Pacific. Friday's 3 PM long-form is a 16-entrant whole-tournament
recording titled `{N} Entrant Orb Tournament`; one Short per day has a 50%
chance to use the approved Orb Foundry black, outline-free large-square format.
Long-form slots stay Orb Race.
Configure credentials in the environment that actually runs each workflow, as
documented in [`docs/YOUTUBE_PUBLISHING.md`](docs/YOUTUBE_PUBLISHING.md).

Each batch enforces the quality contract: two-day orb cooldowns, optional
multi-orb teams, 25-second Shorts, 60-second long-form videos, close deterministic
matchups, 500-HP minimum layers, ascending layer health for short-form, and no
more than three layers in an Orb Race Short. If a race ends before its
action-duration minimum at normal speed, the same single matchup is recorded at
a deterministic slow-motion rate so its live race action fills the duration.
Long-form courses expand to 50 ascending layers; every regular battle video
records exactly one matchup, then only a brief winner reveal. Friday's tournament
records the entire bracket for at least two minutes and validates every match
ID, champion, and one announcer sequence per match. Continuous tournament
recordings keep that announcer proof when the next match starts. Orb Foundry Shorts preflight a single close
Classic battle and verify their black square visual settings before upload. A
duration or matchup-count check rejects a regular battle if the action is short
or a second matchup appears.
If the capped search cannot find a battle inside the close-match gate, that
slot keeps the closest finished candidate as a bounded fallback and still
uploads it. Unfinished and runaway candidates are not promoted. The preflight
uses the same normalized race options the exporter records, so a fast battle
is slowed to the action minimum instead of being planned against a slower
default. A finished battle that still cannot meet that duration is rejected.
A slot that still cannot be planned does not cancel the other slots in the batch.

YouTube metadata uses readable orb/group names in `{left} VS {right}` titles
(for example, `Splodey VS Jackpot`). Orb Race matchup descriptions ask “Who
will break the {layerHealth} HP layer first, {left} or {right}?” Orb Foundry
Shorts and tournament videos use source-appropriate prompts; all include the
required `#physics #shorts #simulation #satisfying` hashtags.

Every battle recording also requires announcer coverage. Cue selection uses the
battle's semantic context—mode, matchup shape, phase, and actual split state—so
normal battles use the standard announcer, split announcer clips are used only
for genuinely split/team presentations, and specialized cues fall back to a
generic announcer when their context or asset is unavailable. Selection is
deterministic rather than random. The publisher now blocks an upload unless
announcer assets were loaded and the recording proves an announcer sequence with
at least one spoken cue. Headless export retries transient announcer fetch,
decode, and AudioContext resume failures, and waits until that battle's cues
are buffered before recording. Generation is preflighted from those same requirements
before the browser recorder starts, and the final artifact is checked again;
anything that does not fit is never uploaded.

## Test

```bash
npm test
```
