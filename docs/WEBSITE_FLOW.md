# Orb Foundry website flow

The site has three tasks: watch and investigate a Classic battle, understand an
Orb Race rule, or make a recording. Each surface has one primary action.
The battle renderer and rules remain independent from website appearance.

## Pages

| Destination | Purpose | Primary action |
| --- | --- | --- |
| Home — `index.html` | Animated Foundry/Racer switch, live muted demos, and separate tool routes. Classic profiles and developer tools expand on demand. | Open Battle Lab |
| Battle Lab — `lab.html` | Configure two fighters, seed, and arena; watch or inspect an exact replay. | Run |
| Shared challenge — `lab.html?challenge=…` | Open versioned inputs independently of local storage, paused at zero. | Play |
| Course Study — `study.html` | David's bounce model, catalog, and course presets. Dial, Roster, and Courses are tabs. | Change the dial |
| Recorder — `index.html?record=1` or `index.html?cfg=…` | Output setup, battle recording, result, and downloadable preview. | Record |
| About — `about.html` | Architecture, reproducibility, model boundaries, original audio, and source. | Open Battle Lab |

All pages above are implemented. Fighter selection, local saves, import,
sharing, setup, tuning, and video preview are sheets/states, not extra routes.
About and GitHub are quiet footer links. Theme is one icon in the page header.
Rare actions stay in More/Tools. No account is needed.

## Journeys

1. Home → Battle Lab → Run → pause/scrub → Replay → Share.
2. Shared link → paused matchup → Play → change inputs → Run → Share a new link.
3. Battle Lab → More → Record this match → Recorder setup → record → preview → download.
4. Home → Course Study → change pair/health → inspect rule or preset → copy link.
5. Home → Fighters → profile → Record → setup.
6. Home/Lab/Study → About → demo, architecture, or source.
7. Lab → More → Save → More → Saved challenges → reopen.

## Screen budgets

- Home: one selected mode, product name, one sentence, real preview, and two relevant routes. Foundry opens Lab/Record; Racer opens Race Studio/Course Study.
- Lab setup: two fighters, seed, arena, Run. Health/name stay under Advanced.
- Replay: transport, timeline, events, optional overlays and verification.
- Recorder: complete battle canvas in view; output settings beside/below it.
- Study: two orbs, health dial, course; chart with its assumptions visible.
- About: short explanation, one architecture diagram, source links and audio.

## Recovery and accessibility

Unsupported challenge versions show an inline explanation and allow a current
preset. Copy failures leave a manual link. Storage is explicitly local and
portable JSON is available. Import errors do not execute supplied data.
Dialogs restore focus; tabs support arrow keys; every input has a label.
Reduced motion, reduced transparency, and increased contrast are respected.

## Source integration and future work

David's original Next.js pages remain in `site/`. The main static site shares
his pure math models and catalog through Course Study rather than introducing a
second frontend runtime. Presets and catalog are labeled as the November 8 model
snapshot; they do not overwrite current publishing settings or Classic design.

A public hosting decision remains separate. Once hosted, use one origin for all
four HTML entry points so challenge links, source explanations, and recordings
stay in the same journey. A future measured run archive can connect predictions
to real seed/course outcomes; no prediction-accuracy claim is made today.
