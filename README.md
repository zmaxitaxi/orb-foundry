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
[`docs/YOUTUBE_PUBLISHING.md`](docs/YOUTUBE_PUBLISHING.md). The publisher is
designed for a hosted runner so it can operate while the development computer
is offline. Its video-ready allowlist must be populated before scheduled uploads
can be enabled.

Validate the current contract with:

```bash
npm run youtube:validate
```

Run a safe local publishing plan without rendering or uploading:

```bash
npm run youtube:publish -- --dry-run --slot=noon-short --date=2026-09-19
```

The hosted workflow in `.github/workflows/youtube-publishing.yml` renders a
morning batch, uploads the videos privately with YouTube publish times, and
lets YouTube release them at noon and 3 PM Pacific once the three YouTube OAuth
Actions secrets documented in
[`docs/YOUTUBE_PUBLISHING.md`](docs/YOUTUBE_PUBLISHING.md) are configured.

Each batch enforces the quality contract: two-day orb cooldowns, optional
multi-orb teams, 25-second Shorts, 60-second long-form videos, close deterministic
matchups, 500-HP minimum layers, ascending layer health for short-form, and no
more than three layers in each Short. If a long-form race ends before a minute
has been recorded, a fresh seeded race with the same matchup starts immediately
and recording continues through its winner reveal.

YouTube metadata uses readable orb/group names in `{left} VS {right}` titles
(for example, `Splodey VS Jackpot`). Each description asks “Who will break the
{layerHealth} HP layer first, {left} or {right}?” and then includes the required
`#physics #shorts #simulation #satisfying` hashtags.

Every battle recording also requires announcer coverage. Cue selection uses the
battle's semantic context—mode, matchup shape, phase, and actual split state—so
normal battles use the standard announcer, split announcer clips are used only
for genuinely split/team presentations, and specialized cues fall back to a
generic announcer when their context or asset is unavailable. Selection is
deterministic rather than random. The publisher now blocks an upload unless
announcer assets were loaded and the recording proves an announcer sequence with
at least one spoken cue. Generation is preflighted from those same requirements
before the browser recorder starts, and the final artifact is checked again;
anything that does not fit is never uploaded.

## Test

```bash
npm test
```
