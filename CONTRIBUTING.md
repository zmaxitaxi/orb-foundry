# Contributing to Orb Foundry

Orb Foundry is a static browser application. Keep gameplay rules deterministic,
keep the module ownership described in `AGENTS.md`, and record meaningful
player-facing changes in `progress.md`.

## Before a major change is pushed

1. Make the smallest focused change that completes the feature or fix.
2. Add or update the matching Node test suite.
3. Run `npm test`.
4. For canvas, audio, or export changes, run a minimal Playwright smoke check
   against the local HTTP server and record the relevant evidence in
   `progress.md`.
5. Use a concise imperative commit subject, such as `Add Orb Race roster picker`.

Major changes should be committed and pushed as their own commit so the GitHub
history remains a useful development record. Keep generated recordings,
browser traces, and production exports out of commits; preserve reusable
runtime assets and design sources under `assets/`.

## Local development

```bash
python3 -m http.server 4173
npm test
```

Open `http://localhost:4173` in a browser for the app. See `README.md` for
recording and publishing commands, and `progress.md` for the implementation
history.
