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
- 60 FPS recording by default, with a 30 FPS option
- Orb Race course presets for Sprint, Power Gate, and the tilted Bank Shot
- Optional presentation-only highlight emphasis

When more than two classes are selected, the seed chooses the same reproducible
pair every time. Legacy tournament and ordinary match links are normalized into
this two-fighter Social Battle flow.

Choose an Orb Race course preset to fill in the wall health and tilt settings.
Those values can be edited and shared with the seed. Landscape races follow
each lane independently and keep wall progress and the Hydrogen Bomb fuse
visible. Classic matches show the current ability below the arena, including
Sword's attack phase and Orbital's live satellite count.

In Classic setup, **Load WDC vs One Punch Man** selects both fighters and
prepares a portrait recreation of the reference Short. The reference sequence
uses authored timing for the three summons, the shop, and the wall escape.
Clear **Play the reference sequence** to use the same roster in a seeded duel.
The reference option is saved with share links.

In seeded Classic fights, WDC lifts out of the arena while a 100 HP summon
fights. Each cycle draws Unarmed, the Exoelectric Disintegrator, and Emerald
once. Emerald mines gems on wall rebounds and sells them at the market.
One Punch Man starts at 1 HP and automatically dodges incoming damage with
no cooldown or charge limit. From 36 seconds on, the fight ends in a draw
if only One Punch Man remains on both teams. Distance and charge determine
when a normal punch, barrage, flying-glove shockwave, or Serious Punch is
available. The seed gives recent moves less weight when it picks an attack.

Gojo, John Rod, One Above All, and Knight are available in the Classic roster.
Their abilities include Limitless and Hollow Purple, Final Wrap, Convergence
Ring, and Shield Bash. Charge, contact, and defense have separate sound cues
on the same audio track used for recordings.

Ben 10 cycles through a seeded bag of five aliens. XLR8 dodges and circles
opponents into a tornado. Heatblast sweeps a wide flame blast. Diamondhead
guards and charges for 32 damage. Four Arms grabs and throws opponents into
the wall, leaving a dent in its outline. Cannonbolt grows to a third of the
arena width and hits for 30. On its first breakout, it cuts a gap in the
wall, rolls outside, and returns on the opposite side. The dent and gap stay
visible for the rest of the fight.

Darth Vader holds an opponent for four Force choke damage ticks, throws a
returning lightsaber, and winds up for a 34-damage close strike. Luke
Skywalker uses a gap-closing Force Vault, a damaging Saber Lunge, and a
two-hit combo. Saber paths fade in the arena and leave short-lived scorch
marks where they touch the walls. WDC's three summons have their own bodies
and weapons in live fights and the authored showcase.
Snowball packs snow on wall bounces and launches a ricocheting Avalanche
every third bounce. The shards deal damage on contact.

The 48 original Classic fighters each have a separate once-per-fight power.
Sword spends Slipstream to dodge a strike or dash into attack range. Blue
Sun releases an expanding Solar Prominence, Black Hole converges twin
gravity wells, and the gun fighters have separate firing patterns. Windups
show where to move, and only contact with the live attack deals damage. The
[Classic roster](docs/CLASSIC_ROSTER.md#once-per-duel-powers) lists every power.

One-on-one Classic fights open from a seeded diagonal. The fighters circle
inward, then the first clash sends them apart sideways at about twice their
normal speed before the boost fades.

Classic defaults to a black arena, a white frame, pixel matchup titles, and
ability meters. Team colors and the light arena are optional. The
[Classic direction](docs/FUTURE.md#classic-direction) describes the visual
standard and the next channel experiment. See the
[Classic combat style guide](docs/CLASSIC_STYLE.md) for the move design and
recording criteria.

## Visual Language

Most fighters use the flat Social Battle treatment:

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

The daily batch prepares one Classic Orb Foundry Short and one long-form
video for each of the noon and 3 PM Pacific slots. Both formats favor the
nine newer fighters, can choose any Classic orb except Grappler, and use
one square and one circle. Use `--source=orb-race` for a manual Orb Racer
Short or `--arena-shape=circle` or `--arena-shape=square` to pick a Classic
arena for a manual run.

Each Orb Foundry video preflights one completed fight with distinct
signature action and a close finish. Shorts need 25 seconds of action.
Long form uses the 1920 × 1080 **ORB RACE LONG FORM** preset and needs at
least two minutes. Friday's 3 PM long form is one boss at three times its
base HP against three challengers, with at least four minutes of action.
A normal winner must finish at 40% HP or less. One Punch Man's 1 HP
duels qualify through repeated dodges, late pressure, and varied landed
attacks. The exported fight must match the preflight's winner, remaining
HP, and finish time.

Orb Racer Shorts preflight one matchup with up to three ascending layers
of at least 500 HP. A finished race can play at a deterministic slower
rate to reach the action minimum. The planner can use the closest valid
finished race when it runs out of close candidates. Each slot reports its
own result so a failed candidate in one slot leaves the other available.

YouTube metadata uses readable orb/group names in `{left} VS {right}` titles
(for example, `Splodey VS Jackpot`). Orb Race matchup descriptions ask “Who
will break the {layerHealth} HP layer first, {left} or {right}?” Orb Foundry
uses a fight-specific prompt with `#physics #simulation #satisfying`.
Shorts also use `#shorts`.

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

## Future

The exploration of later picture tools, competition records, models, a
single operation across the channel and the lab, and a sustainable
study-and-show lives in [`docs/FUTURE.md`](docs/FUTURE.md).

## Test

```bash
npm test
```
