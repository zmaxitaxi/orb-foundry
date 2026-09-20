# Orb Race new-orb asset prompts

Generated 2026-08-14 with GPT Image. Each prompt requested an original pixel-art sheet on a flat neon-green chroma background so the project helper could preserve crisp black outlines and transparent corners. The shipped runtime uses the normalized `final/` files with nearest-neighbor drawing.

## Rain cloud

> Original pixel-art game asset sheet on a flat neon-green chroma background: four evenly spaced horizontal frames of a compact gray-blue rain cloud. Frame 1 is an idle cloud, frame 2 has light rain, frame 3 has heavy rain with many blue drops, and frame 4 has heavy rain with a bright icy outline. Transparent-ready, crisp black pixel outline, no text, no orb, no watermark, nearest-neighbor style.

- Source: `source/rain-cloud-sheet-source.png`
- Runtime final: `final/rain-cloud-sheet.png`
- Frames: 4, horizontal strip

## Hacker computer

> Original pixel-art game asset sheet on a flat neon-green chroma background: four horizontal frames of a small retro computer and keyboard oriented to face left, with two tiny detached hands typing. Show frame-to-frame typing motion and green/cyan Matrix-style glyphs rising from the keyboard. Black pixel outlines, transparent-ready, no person, body, orb, text, or watermark, nearest-neighbor style.

- Source: `source/hacker-computer-sheet-source.png`
- Runtime final: `final/hacker-computer-sheet.png`
- Frames: 4, horizontal strip

## Miner shovel and jackhammer

> Original pixel-art game asset sheet on a flat neon-green chroma background: six horizontal frames of a miner accessory animation. The first frames show a dirty low-level shovel and hard hat digging, the middle frames show an upgraded metal shovel, and the final frames show a chunky jackhammer drill with the miner mounted and bobbing. Black pixel outlines, transparent-ready, no orb, body, text, or watermark, nearest-neighbor style.

- Source: `source/miner-jackhammer-sheet-source.png`
- Runtime final: `final/miner-jackhammer-sheet.png`
- Frames: 6, horizontal strip

## Cleanup and QA

The generated sources were passed through the installed chroma-key helper with the key color `#00ff00`, soft matte, despill, and a transparent threshold. The final files were checked as RGBA PNGs with transparent corners and alpha values spanning 0–255. See `manifest.json` and `alpha-validation.json` for dimensions and measured alpha evidence.
