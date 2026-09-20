# Repository Guidelines

## Workspace Snapshot

- Product name: Orb Foundry. It is a static browser application for deterministic, portrait-first Social Battle recordings; there is no bundler, framework, or build step.
- The active player flow is `Menu → profile/setup → Social Battle canvas → winner → preview`. The main runtime is `index.html` plus `src/main.js` and `styles.css`.
- This checkout is effectively an initial/uncommitted workspace: do not infer project conventions from Git history. Preserve unrelated existing work and generated assets.
- `README.md` documents the product-facing contract; `progress.md` is the chronological implementation log. Consult those before changing behavior that may look historical or intentionally dormant.

## Project Structure & Module Organization

- `src/` contains the browser application. Keep simulation rules in `simulation.js`, mode data in `world-cup.js`, UI flow in `main.js`, and canvas drawing in `renderer.js` or `social-renderer.js`.
- Important module ownership: `simulation.js` owns fixed-step physics, seeded randomness, abilities, hazards, projectiles, events, victory, and mode rules; `config.js` owns normalized settings, feature flags, balance overrides, and compact `?cfg=` URL serialization; `main.js` owns UI flow; `presentation.js`/`presentation-timeline.js` own cosmetic themes and deterministic intro timing; `renderer.js` and `social-renderer.js` own gameplay/export canvas drawing; `audio.js` owns event-to-sample mapping and the Web Audio graph; `social.js` owns captions/stats/highlights/export metadata; `recorder.js` owns the `MediaRecorder` lifecycle.
- The public simulation seam is primarily `createSimulation(...)` plus repeated `stepSimulation(sim, dt)`. Keep gameplay rules there and let render/audio/recording consume state and events.
- `tests/` holds Node test files (`*.test.mjs`) for simulation, features, and social/export behavior.
- `assets/` contains shipped audio, generated sprites, flags, and design sources. `artifacts/` and `outputs/` contain generated previews and production artifacts; avoid editing them unless regenerating an asset.
- `scripts/` contains export, transcoding, upload, and social-posting utilities. The app entry points are `index.html` and `styles.css`.

### Active Modes and Registries

- `classic` is the normal two-fighter combat mode. `world-cup` uses the country registry and pickups. `orb-race` uses racer IDs and number-wall/finish physics.
- `king-of-hill` has simulation and renderer support, but `config.js` currently normalizes that input to `orb-race`; do not assume it is a selectable/shareable product mode without changing the settings/UI contract and tests together.
- Current combat class IDs are `sword`, `crossbow`, `potion`, `axe`, `scythe`, `staff`, plus legacy IDs `fire`, `ice`, `wizard`, `time`, `volta`, `venom`, `gravis`, `aegis`, `mirage`, `echo`, `forge`, `static`, and `shade`.
- Current Orb Race IDs are `duplicator`, `speed`, `orbital`, `drill`, `x-squared`, `fibonacci`, `grower`, `lazer`, `sticky`, `x-power`, `phi`, `flash`, and `batman`. Preserve stable IDs when changing display names or announcer assets.
- World Cup and King of the Hill registries expose their own stable IDs; use their normalizers/selectors rather than duplicating validation in `main.js`.

## Build, Test, and Development Commands

- `python3 -m http.server 4173` — serve the static app locally, then open `http://localhost:4173`.
- `npm test` — run all Node test suites (`tests/*.test.mjs`). Run this before handing off code.
- `npm run battle:export` — record a deterministic social battle to `artifacts/daily-battles/`.
- `npm run battle:transcode`, `npm run battle:upload`, and `npm run battle:post` — production media steps; use only when the required local tools and credentials are configured.
- The exporter uses local headless Chrome; set `CHROME_PATH` when Chrome is not at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Transcoding needs FFmpeg; set `FFMPEG_PATH` when it is not on `PATH`.
- `battle:post` is an external side-effecting workflow: it records WebM, creates MP4, uploads to S3-compatible storage, and publishes through the Instagram Graph API. Never run it during ordinary verification and never commit its credentials or generated media.
- Browser verification must use Playwright, preferably Playwright Chromium, against the local HTTP server. Keep the check minimal: verify the page loads, assert the relevant runtime/DOM state, and collect console and page errors. Screenshots are optional evidence, not a required step. Do not silently substitute Chrome/CDP or manual inspection; if Playwright is unavailable, report the blocker and the fallback explicitly.

## Coding Style & Naming Conventions

Use ES modules and four-space indentation. Prefer `const`, immutable exported configuration (`Object.freeze`), and small focused functions. Use camelCase for variables and functions, PascalCase for classes, and kebab-case for asset IDs (for example, `"yellow-card"`). Keep simulation deterministic: obtain randomness from the simulation RNG and do not add time- or DOM-dependent behavior to rules code. No formatter or linter is configured, so match surrounding style and avoid unrelated reformatting.

## Testing Guidelines

Add assertions in the matching existing suite: physics/rules in `simulation.test.mjs`, settings and mode behavior in `features.test.mjs`, and captions/audio/render helpers in `social.test.mjs`. Test both the new behavior and deterministic repeatability when a seed is involved. Name tests through clear surrounding block comments or assertion messages; the repository uses Node's built-in `node:test` runner and strict assertions.

## Commit & Pull Request Guidelines

This checkout has no commit history, so no established commit convention can be inferred. Use concise imperative subjects such as `Add rivalry roster picker`. Keep each commit focused. Pull requests should explain player-facing changes, list test commands run, link any issue, and include screenshots or exported-video evidence for visual/canvas changes. Do not commit credentials, access tokens, or generated production media unless explicitly requested.

## Simulation and Asset Contracts

- The simulation advances at `1 / 120` seconds in the browser and tests. Use `SeededRandom` and the simulation seed for gameplay randomness; do not use `Math.random()`, wall-clock time, or DOM state in rules code.
- Themes, export format/FPS, hit-stop, screen shake, highlight slow motion, and audio are presentation concerns and must not alter a deterministic outcome. Balance overrides are the intentional exception and must be sanitized through `config.js`.
- `src/tournament.js` and `src/tournament-worker.js` are dormant batch-analysis infrastructure. They are not imported by the product flow; changes there need focused tests and should not re-enable old tournament UI accidentally.
- `index.html` and several browser imports use explicit `?v=...` query strings so static hosting refreshes changed modules/assets. When changing a browser-loaded module or audio manifest, bump the relevant entry/import cache key consistently. Node tests import the same files without query strings.
- Keep original audio/design sources in their source folders, update the live asset manifest/lookup, and avoid editing generated `artifacts/` or `outputs/` unless regenerating an artifact is the requested change.

## Testing Notes

- For new modes or shareable setup fields, test `normalizeSettings`, `settingsToUrl`, and `settingsFromUrl` round trips in `features.test.mjs`.
- For deterministic mechanics, compare two simulations with identical options after the same fixed-step sequence and assert the changed event/state directly, not only the final winner.
- For visual/audio/export changes, run `npm test` and a minimal Playwright browser smoke test through the local HTTP server. Check the relevant runtime/DOM state, browser console, page errors, and asset URLs after cache-key changes; capture screenshots only when they materially help diagnose a visual issue.

## Change Checklist

- First identify whether a change belongs to simulation, settings/URL state, presentation/rendering, audio, or recording; keep those boundaries intact.
- Preserve stable IDs, deterministic seeds, and legacy URL decoding unless the task explicitly changes compatibility.
- Add or update the matching test before handoff, then run `npm test`.
- For canvas/export changes, verify the actual dedicated `#socialCanvas` at the affected format and check that menus, setup, and browser chrome remain outside the recording.
