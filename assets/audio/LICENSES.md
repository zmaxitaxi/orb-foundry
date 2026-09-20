# Audio Licenses

## HeyGen Announcer

The files in `assets/audio/announcer/` were generated for this project through
the authenticated HeyGen Video Agent on June 15, 2026.

- Video Agent voice reference: `voice_xgrpvs`
- Video ID: `b20c6ad7620a43268a42c14952276c2d`
- Session: https://app.heygen.com/video-agent/4a7e039b6a5645029e51aa9c31be404e
- Source reel: `assets/audio/source/heygen-announcer-reel.mp4`
- Derived assets: 23 mono 44.1 kHz PCM WAV cues in `assets/audio/announcer/`
- Modification: the generated reel was split into isolated countdown, fighter
  name, match-state, and winner cues; no third-party music or sound effects were
  added.

The direct HeyGen speech endpoint was unavailable on the connected free-tier
account, so the Video Agent generated a grouped clean voice reel and supplied
the cue sheet used for extraction. Usage remains subject to the terms of the
authenticated HeyGen account that generated the reel.

## Wise HeyGen Announcer

The replacement calm, wise announcer reel was requested through HeyGen Video
Agent on June 17, 2026.

- Session: https://app.heygen.com/video-agent/91e971687e6a44d987bf543c53872dbf
- Source reels: `assets/audio/source/heygen-wise-announcer-reel.mp4` and
  `assets/audio/source/heygen-wise-announcer-reel-part2.mp4`
- Derived assets: 70 mono 44.1 kHz PCM WAV full-line cues documented in
  `assets/audio/announcer/wise/README.md`
- Naming changes: `ice` is spoken as Frost, and `aegis` is spoken as Aegon.
- Runtime behavior: `src/audio.js` first looks for the new `wise/` clips and
  falls back to the June 15 extracted clips when a replacement clip is missing.
- User-supplied World Cup country standalones added on June 28, June 29,
  June 30, July 1, July 2, and July 3, 2026 are preserved under
  `assets/audio/source/world-cup-announcer-*` and promoted into the same
  `wise/` announcer set for spliced country intros.

The direct HeyGen speech endpoint returned `plan_upgrade_required` on the
connected account, so the Video Agent reel is the active production path for the
replacement voice.

## Procedural Game Audio

Hazard, ambience, and fallback combat sounds are generated at
runtime with Web Audio oscillators, filtered noise, resonators, and gain
envelopes in `src/audio.js`. They are original procedural output created for
this project, require no attribution, and are routed through the same compressor
to speakers and the recording `MediaStreamDestination`.

## Generated Orb Race Announcers

The 149 generated Orb Race and Classic Orb Foundry announcement clips in
`assets/audio/announcer/generated-race/` use the locally generated male/robotic
macOS Alex voice at rate 175, matching the original local X-to-the-X cue. They
are encoded as mono 24 kHz, 96 kbps MP3 clips. Source copies are preserved under
`assets/audio/source/race-announcer-generated/`; the previous generated source
set is preserved under
`assets/audio/source/race-announcer-generated-samantha-20260724/`. Rerun
`npm run audio:generate-race-announcements` to regenerate the full set, or
`npm run audio:generate-race-counts` to regenerate the complete numbered cue
set (One–Ten and the 15–50, 60, 70, 80, 90, and 100 milestones), or `npm run audio:generate-drill-combos` to regenerate only the nine
Drill combo cues, `npm run audio:generate-orbital-combos` to regenerate the
eleven Orbital combo cues, or `npm run audio:generate-count-milestones` to
regenerate only the 15–50 and 60–100 count milestones. These clips are original
local generated output and carry no third-party attribution requirement.

The generated Orb Race `race-pick-your-winner.mp3` cue includes a 350 ms
pre-speech pause. The previous supplied Hale clip remains preserved in the
historical `wise/` and `race-announcer-20260714/` locations.

## Generated Classic Announcers

Classic Orb Foundry now uses the same locally generated macOS Alex voice and
rate-175, mono 24 kHz, 96 kbps MP3 pipeline as Orb Race for every orb-name
cue. Shared established IDs live in `assets/audio/announcer/generated-race/`
with source copies under `assets/audio/source/race-announcer-generated/`.
The previous six Daniel WAV
weapon-name cues remain preserved in `assets/audio/announcer/generated-classic/`
with their original source set. These clips are original local generated output
and carry no third-party attribution requirement.

The 23 newer Classic-only names are generated with the same Alex settings by
`npm run audio:generate-classic-overhaul`. Their active clips live in
`assets/audio/announcer/generated-classic-overhaul/` and their byte-identical
source copies plus generation manifest live in
`assets/audio/source/classic-announcer-20260807/`.

## User-Supplied Race Announcer Clips

The files `assets/audio/announcer/wise/race-flash.mp3`,
`assets/audio/announcer/wise/race-batman.mp3`,
`assets/audio/announcer/wise/race-versus.mp3`,
`assets/audio/announcer/wise/race-lazer.mp3`, and
`assets/audio/announcer/wise/race-phi.mp3`,
`assets/audio/announcer/wise/race-sticky.mp3`, and
`assets/audio/announcer/wise/race-grower.mp3`,
`assets/audio/announcer/wise/race-group-motion.mp3`, and
`assets/audio/announcer/wise/race-group-math.mp3`,
`assets/audio/announcer/wise/race-group-growth.mp3`,
`assets/audio/announcer/wise/race-group-weapon.mp3`, and
`assets/audio/announcer/wise/race-group-superhero.mp3`,
`assets/audio/announcer/wise/race-gravity.mp3`,
`assets/audio/announcer/wise/race-jackpot.mp3`, and
`assets/audio/announcer/wise/race-boomerang.mp3`, and
`assets/audio/announcer/wise/race-mines.mp3`,
`assets/audio/announcer/wise/race-quadratic.mp3`,
`assets/audio/announcer/wise/race-pi.mp3`,
`assets/audio/announcer/wise/race-integral.mp3`, and
`assets/audio/announcer/wise/race-prime.mp3`, and
`assets/audio/announcer/wise/race-speed-impact.mp3`, and
`assets/audio/announcer/wise/race-meteor.mp3`, and
`assets/audio/announcer/wise/race-black-hole.mp3` were copied from local user
downloads supplied between July 14 and July 18, 2026. They are used as Orb Race announcer
intros, its race-only Versus cue, and its Motion Orbs/Math Orbs group cues. The
original download pages and license terms were not provided in this session;
confirm rights and attribution requirements before public distribution.

## User-Supplied Combat Samples

The files in `assets/audio/effects/` were copied from local user downloads on
June 15, 2026 and are now routed through the Web Audio mixer and recording
stream as primary combat effects.

| Game asset | Source filename | Runtime use |
| --- | --- | --- |
| `match-finale.wav` | `ScreenRecording_06-23-2026 13-39-31_1.mov` | Sole end-of-match victory cue, replacing knockout and orb-specific winner audio |
| `chrono-time-stop.wav` | `ScreenRecording_06-23-2026 16.MOV` | Chrono Time Stop activation |
| `orb-hit.wav` | `ScreenRecording_06-23-2026 15.MOV` | Standard weapon hit, replacing the sword-swing sample |
| `cinder-burn-tick.wav` | `ScreenRecording_06-23-2026 14-06-51_1.MOV` | Each successful Cinder burn-damage tick |
| `critical-hit.wav` | `ScreenRecording_06-23-2026 18.mov` | Backstab and critical-hit cue |
| `norway-world-cup-action.wav` | `ScreenRecording_06-30-2026 11.mov` | Norway-only World Cup pickup and soccer-ball use cue |
| `usa-world-cup-action.wav` | `ScreenRecording_06-30-2026 12.mov` | USA-only World Cup pickup and soccer-ball use cue |
| `england-world-cup-action.wav` | `ScreenRecording_06-30-2026 13.mov` | England-only World Cup pickup and soccer-ball use cue |
| `argentina-world-cup-action.wav` | `ScreenRecording_06-30-2026 14.MOV` | Argentina-only World Cup pickup and soccer-ball use cue |
| `france-world-cup-pickup.wav` | `ScreenRecording_07-04-2026 09-33-54_1.mov` | France-only World Cup powerup pickup cue |
| `portugal-world-cup-pickup.wav` | `ScreenRecording_06-30-2026 10-43-48_1.mov` | Portugal-only World Cup powerup pickup cue |
| `spain-world-cup-action.wav` | `ScreenRecording_07-01-2026 20-36-29_1.mov` | Spain-only World Cup pickup and soccer-ball use cue |
| `world-cup-ko.wav` | `ScreenRecording_07-01-2026 20-37-11_1.mov` | World Cup-only knockout cue |
| `hex-magic-burst.mp3` | `humordome-magic-burst-452852.mp3` | Hex Arcane Burst |
| `aegis-surge.mp3` | `freesound_community-shield-guard-6963.mp3` | Aegis Surge activation |

## User-Supplied Race Sample

The file `assets/audio/effects/race-math-bounce.mp3` was copied from the local
user download `freesound_community-dark-choir-01-87395.mp3` on July 14, 2026.
It is used for Fibonacci, Xˣ, and golden-ratio racer bounces, limited to the
first second at runtime. The original download page and license terms were not
provided in this session; confirm rights and attribution requirements before
public distribution.

## User-Supplied Race Effects

The active file `assets/audio/effects/race-layer-break.mp3` now uses the local
user download `loud_metal_clang_#2-1784919606548.mp3` from July 24, 2026. The
previous `Metalic_clanging_sou_#4-1784918140226.mp3` source remains preserved in
the same source archive. The active cue plays whenever an Orb Race number layer
is destroyed, including direct impacts and ranged layer damage. The original
download pages and license terms were not provided in this session; confirm
rights and attribution requirements before public distribution.

The file `assets/audio/effects/race-math-power.mp3` was copied from the local
user download `ancient_asian_guitar_#4-1784918317713.mp3` on July 24, 2026.
It is used for X-to-the-X, Quadratic, and Factorial number-line bounces. The
original download page and license terms were not provided in this session;
confirm rights and attribution requirements before public distribution.

The file `assets/audio/effects/race-vampire-bounce.mp3` was copied from the
local user download `alesiadavina-female-vampire-attack-hiss-sound-effect-dark-sfx-552126.mp3`
on July 29, 2026. It is used for Vampire's number-line bounce, while top- and
side-wall bounces retain the standard Orb Race collision cue and layer-breaking
impacts retain the metallic layer-break cue. The original download page and
license terms were not provided in this session; confirm rights and attribution
requirements before public distribution.

The active files `assets/audio/effects/race-draft-rifle-fire.mp3`,
`assets/audio/effects/race-draft-shotgun-fire.mp3`, and
`assets/audio/effects/race-draft-pistol-fire.mp3` were copied from the local
user downloads `flutie8211-gun-shot-and-echo-549910.mp3`,
`alice_soundz-gun-shot-sound-effect-224087.mp3`, and
`freesound_community-9mm-pistol-shoot-short-reverb-7152.mp3`, respectively,
on July 29, 2026. They play for Draftmaster's rifle, shotgun, and pistol
fire events. The original download pages and license terms were not provided
in this session; confirm rights and attribution requirements before public
distribution.

The original download pages and license terms were not provided in this session.
Confirm the rights and attribution requirements before public distribution.

## User-Supplied Classic Punch and Vampire Effects

The active files `assets/audio/effects/classic-boxer-punch.mp3` and
`assets/audio/effects/classic-vampire-hiss.mp3` were copied from the user's local
downloads on August 10, 2026. Their original files are preserved under
`assets/audio/source/classic-effects-20260810/` alongside the earlier Trident
throw source. They route to Classic Boxer ability starts and Vampire latch
starts; Classic wall/body rebounds use the existing `orb-collision-pop.mp3`
sample. The original download pages and license terms were not provided in this
session; confirm rights and attribution requirements before public distribution.

## User-Supplied Pancake And Artist Race Effects (2026-08-05)

The active files `assets/audio/effects/race-pancake-impact.mp3`,
`race-monster-growl.mp3`, `race-fairy-sparkle.mp3`, `race-thunder.mp3`, and
`race-monster-footsteps.mp3` were copied from the local user downloads
`universfield-cartoon-splat-310479.mp3`,
`dragon-studio-monster-growl-390285.mp3`,
`humordome-fairy-sparkle-451414.mp3`,
`universfield-loud-thunder-192165.mp3`, and
`audiopapkin-monster-footsteps-on-gravel-295850.mp3`, respectively, on August
5, 2026. Their original filenames are preserved in
`assets/audio/source/race-effects-20260805/` and they are routed to Pancake
landings, Monster/Fairy summons, Monster steps/attacks, and Artist Storm
strikes. The existing `forge-item-pickup.mp3` sample is reused for Bloom's
completed drawing drop. The original download pages and license terms were
not provided in this session; confirm rights and attribution requirements
before public distribution.

## User-Supplied Classic Trident And Hydrogen Effects (2026-08-10)

The active `assets/audio/effects/classic-trident-throw.mp3`, reversed recall copy
`assets/audio/effects/classic-trident-recall.mp3`, and preserved source
`assets/audio/source/classic-effects-20260810/floraphonic-swing-whoosh-5-198498.mp3`
were copied from the user download `floraphonic-swing-whoosh-5-198498.mp3` on
August 10, 2026. The original clip is used when Classic Trident launches its
thrown weapon; the recall copy is the same user-supplied clip reversed with
FFmpeg's `areverse` filter. Classic Hydrogen Bomb reuses the existing siren, explosion, and
ear-ringing files for its countdown → detonation → flash sequence. The original
download page and license terms were not provided in this session; confirm
rights and attribution requirements before public distribution.

## Libraries Reviewed

The following reputable libraries were reviewed on June 15, 2026. No files from
them were downloaded or included:

| Library | License finding | Source |
| --- | --- | --- |
| Kenney | Asset-page game assets are CC0; attribution is optional. | https://kenney.nl/support |
| Pixabay | Uses the Pixabay Content License, which allows free use and adaptation but is not equivalent to public domain and includes prohibited uses. | https://pixabay.com/service/license-summary/ |
| OpenGameArt | Hosts multiple licenses. Every individual asset and attribution notice must be checked; CC0 requires no credit, while CC-BY requires attribution and change notices. | https://opengameart.org/content/faq |

Procedural combat audio remains self-contained, deterministic, small, and free
from per-file attribution risk.
