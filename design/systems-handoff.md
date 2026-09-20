# Orb Foundry Systems Handoff

## Product Boundary

Social Battle is the only playable mode. Tournament, Meta Lab, ordinary match,
post-match analytics, and replay UI are disconnected from the product.
Tournament source modules remain dormant and must not be imported by
`src/main.js`.

## Determinism

- Simulation advances at `1 / 120` seconds.
- `SeededRandom` owns all reproducible roster and combat choices.
- Shared URLs serialize the Social Battle seed, roster, hazards, theme, export
  options, feature gates, and balance multipliers.
- Legacy tournament and ordinary-match settings normalize to `mode: "match"`,
  `count: 2`, `social.enabled: true`, and `tournament: null`.

## Runtime Boundaries

`src/simulation.js` owns physics, hazards, abilities, analytics, events, and
victory state. It has no DOM or canvas dependencies.

`src/social-renderer.js` owns the dedicated export canvas. It reads resolved
simulation state and uses the shared `ArenaRenderer` in simple, flat-orb mode.
Live HP numerals are presentation only.

`src/recorder.js` owns MediaRecorder state and never mutates simulation state or
RNG. `src/audio.js` routes its procedural mix to both the device and recording
stream.

`src/main.js` owns menu, profiles, setup, recording controls, preview, balance,
and developer settings. It does not orchestrate tournaments or standard matches.

## Visual Assets

Static orb previews are CSS components using class color, dark outline, one
highlight block, and a two-letter class mark. Archived Canva atlases are not
loaded by the Social Battle runtime. Weapons remain code-drawn so visible
endpoints continue to match deterministic collision geometry.

## Feature Gates

Developer Mode can adjust hazards, additional classes, balance access,
shareable links, Social Battle presentation effects, recording, intro cards,
flash reduction, and audio categories. Social Battle itself cannot be disabled.
