# Orb Race Hacker v2 asset prompt

Generated 2026-08-14 with GPT Image. The source is preserved as the original generated 2x2 grid; the runtime final is a four-frame horizontal strip made by cropping the four equal panels without resampling. The final is RGBA with transparent corners and is drawn with nearest-neighbor sampling.

## Hacker hoodie orb animation

> Use case: game asset sprite sheet. Asset type: original pixel-art Orb Race character animation sheet. Create a clean 2x2 sprite sheet with exactly four equal square panels, no panel borders or grid lines. Each panel contains one complete spherical dark hacker orb wearing an oversized black hooded sweatshirt/hoodie, with the hood clearly surrounding the orb and a vivid neon-green inner rim and tiny green glitch accents. The orb remains a simple round orb with no humanoid torso, arms, legs, face, text, logo, or extra characters. Four animation poses: (1) front-facing idle hoodie orb, (2) turning left toward a nearby computer, (3) turning right back toward the arena, (4) leaned toward the computer with two tiny gloved hands typing. Keep every orb fully inside its panel with generous transparent-looking padding and consistent scale. Render as crisp high-quality pixel art with thick black pixel outlines, readable at small game scale, flat lighting. Put the complete sheet on a perfectly uniform solid #00ff00 chroma-key background for local removal. No shadows, gradients, texture, reflections, watermark, or text. Do not use #00ff00 in the subject.

- Source: `source/hacker-orb-animation-grid-source.png`
- Runtime final: `final/hacker-orb-animation-sheet.png`
- Frames: 4, horizontal strip after deterministic 2x2 panel extraction
- Runtime mapping: `src/social-renderer.js` → `hackerOrbSheet`

## Cleanup and QA

The generated source already contained transparent RGBA corners (`(0,0,0,0)`); no opaque background was loaded into the game. The panel extraction preserved alpha, dimensions, and nearest-neighbor pixels. `alpha-validation.json` records the final alpha/extrema and frame geometry.
