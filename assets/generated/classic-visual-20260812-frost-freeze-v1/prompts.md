# Classic Frost freeze overlay — GPT Image prompt

Generated with the built-in GPT image workflow on 2026-08-12. The source and
final are preserved in this versioned folder and rendered with nearest-neighbor
sampling.

> Original pixel-art game asset sheet on a perfectly flat neon green #00ff00 chroma-key background. Create a 4-frame horizontal sheet for a circular Frost Ball status overlay, not an orb body and not a character. Each equal square frame contains only a blue-white icy rim and a few crystalline frost spikes surrounding an empty transparent center so game-drawn HP remains unobstructed. Frame 1 is a light frost edge, frame 2 has more ice crystals, frame 3 is a vivid frozen blue-white rim, and frame 4 is a settled crystalline rim. Use crisp nearest-neighbor pixel art, dark blue outlines, pale cyan highlights, generous padding, no text, no orb, no floor, no shadow, no background except the flat chroma field.

The generator returned an RGBA image with transparent corners and center. The
runtime final therefore keeps the generated alpha rather than applying a matte
cleanup pass that could damage the fine ice edge.
