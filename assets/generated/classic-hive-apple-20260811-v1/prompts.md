# Classic Hive + Apple assets v1

Generated 2026-08-11 with the built-in GPT image workflow. All sources use a flat `#00ff00` chroma field, then the local chroma-key helper produced the transparent finals. Runtime drawing uses nearest-neighbor sampling.

## Hive bee attack

Prompt: “Original pixel-art game asset, a single large golden honey bee attack projectile shown in clean side/front three-quarter view, chunky readable bee body with bright yellow and warm amber bands, small translucent blue wings, black pixel outline, crisp nearest-neighbor pixel edges, centered with generous transparent-safe padding, no text, no numbers, no hive, no honeycomb, no extra bees, no shadow, no floor, no background except a perfectly flat neon green #00ff00 chroma-key field. Make the bee silhouette unmistakable at small size and suitable as a projectile sprite that can point toward a target.”

- Source: `source/hive-bee-projectile-chroma.png`
- Final: `final/hive-bee-projectile.png`
- Runtime role: Hive's tracked attack; Hive itself is a plain Classic orb.

## Apple projectile

Prompt: “Original pixel-art game asset, a single large bright red apple front-facing, rounded apple silhouette, shallow top dimple, brown stem and green leaf, thick black pixel outline, red/crimson shading, clean open center for a game-owned impact marker, no text, no characters, no extra apples, no shadow, no floor, generous transparent-safe padding, flat neon green #00ff00 chroma-key background, crisp nearest-neighbor pixel edges.”

- Source: `source/apple-orb-projectile-chroma.png`
- Final: `final/apple-orb-projectile.png`
- Runtime role: Apple orb's seeded projectile thrown to a random in-arena destination every three seconds.

## Unwired earlier source

The earlier honeycomb concept remains preserved at `source/hive-orb-chroma.png` / `final/hive-orb.png` for provenance only. It is intentionally not loaded: the user clarified that Hive is an orb and its generated asset should be the bee attack, not a honeycomb body.
