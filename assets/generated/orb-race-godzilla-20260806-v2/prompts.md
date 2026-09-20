# Godzilla Animation Sheet V2 Prompt

Use case: stylized-concept
Asset type: browser game pixel-art sprite sheet for a deterministic 2D canvas game

Primary request: Create an original pixel-art upright charcoal-blue reptilian kaiju animation sheet for Orb Foundry. This is an original monster design with no copied film, game, comic, or trademarked character art. Keep one consistent full-body side-facing creature in every cell, facing right, with a heavy tail, bright electric-blue dorsal plates, amber eye, cream claws, charcoal scales, and steel-gray belly.

Scene/backdrop: a perfectly flat solid #00ff00 chroma-key background only. No floor, shadow, gradient, texture, border, labels, or text. Use generous empty padding inside every cell.

Composition: exact 4 columns by 4 rows in one square sheet, 16 equal cells. Never let a tail, foot, dorsal plate, beam, crack, glow, or any other pixel cross a cell boundary. Do not place detached monsters or duplicate body parts between cells.

Animation rows:

1. WALK: four smooth, readable walking poses with a clear alternating leg lift. One leg is planted while the opposite knee and foot visibly lift, then the legs exchange roles. Include a subtle body bob and tail counter-sway while preserving the same feet baseline.
2. TAIL-SMACK: neutral, tail pulled back, tail sweeping forward, and follow-through. Feet stay planted and the tail remains fully visible.
3. STOMP: neutral, knee lifts high, foot drives down into the number-line ground with a visible crack burst, and recoil. This replaces the former claw-swipe attack; do not draw claw attacks.
4. ATOMIC-BREATH-DOWN: neutral, head lifts, mouth glows cyan, and a cyan-white atomic beam points vertically downward from the mouth to the ground with a readable impact flare. Do not use a sideways beam.

Style/medium: crisp high-detail pixel art with hard pixel clusters, clean silhouettes, nearest-neighbor friendly edges, dramatic blue rim light, restrained glow, and readable forms at small canvas sizes. Keep proportions and facing consistent across the full sheet.

Avoid: cropped feet, cropped tails, edge-touching pixels, inconsistent scale, multiple creatures in a cell, 3D rendering, photorealism, diagonal top-down perspective, green subject pixels, smoke, explosions, watermark, or text.

Runtime preprocessing: the chroma source is converted to RGBA with soft matte/despill cleanup. The live sheet is then processed per cell: small disconnected edge noise is removed, each frame is alpha-cropped, scaled with nearest-neighbor only when needed, centered, and bottom-aligned inside a transparent safety margin. The raw alpha-converted sheet remains beside the padded runtime sheet for inspection.
