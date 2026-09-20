# Classic Visual Identity v2

The following original GPT Image prompts were used for the transparent weapon/accessory sheets. The green background was removed locally with `remove_chroma_key.py`; source sheets remain preserved beside each final.

## Shotgun

“Create an original pixel-art weapon sprite sheet for a browser game. Show one compact, distinct double-barrel shotgun only, with a dark steel receiver, warm brown stock, brass fittings, thick crisp black pixel outline, and a readable muzzle. Arrange exactly three equal square cells in one horizontal row: ready, firing with a bright muzzle flash, and reload with a small action cue. No orb, hand, character, text, shadow, or extra objects. Use a perfectly flat vivid chroma green background #00ff00 for later key removal, generous padding, and nearest-neighbor pixel art. Keep the shotgun silhouette clearly different from a tactical rifle.”

## Rifle

“Create an original pixel-art weapon sprite sheet for a browser game. Show one long tactical rifle only, with a dark graphite body, angular stock, top scope, magazine, and slim barrel, thick crisp black pixel outline, and a clearly different silhouette from a double-barrel shotgun. Arrange exactly three equal square cells in one horizontal row: ready, firing with a bright muzzle flash, and reload with a small action cue. No orb, hand, character, text, shadow, or extra objects. Use a perfectly flat vivid chroma green background #00ff00 for later key removal, generous padding, and nearest-neighbor pixel art.”

## Monster fists

“Create an original pixel-art accessory sprite sheet for a browser game: two detached oversized scaly monster fists with short cuff/forearm pieces, accessory only, no head, torso, legs, orb, character, text, or background detail. Arrange exactly three equal square cells in one horizontal row: guarded fists, one fist extended in a punch, and impact with a small dust cue. Use dark olive scales, bronze claws, thick crisp black pixel outlines, readable silhouette at large scale, flat #00ff00 chroma background, generous padding, and nearest-neighbor pixel art.”

## Necromancer arrows

“Create an original pixel-art projectile sprite sheet for a browser game: one large straight arrow with a wooden shaft, dark feather fletching, and a sharp silver triangular head, projectile only. Arrange exactly three equal square cells in one horizontal row: normal arrow, purple magic-charged arrow, and impact burst. No orb, hand, character, text, or background detail. Use thick crisp black pixel outlines, transparent-ready flat #00ff00 chroma background, generous padding, and nearest-neighbor pixel art. Keep the arrow head pointing right in every cell.”

## Straight sniper ammunition

“Create an original pixel-art ammunition sheet for a browser game with exactly two equal square cells in one horizontal row. Cell one is a small straight silver sniper bullet; cell two is a larger straight silver sniper bullet. Both must have a pointed nose facing right, a clean cylindrical body, dark outline, no curve, no casing, no orb, no text, no background detail. Use a perfectly flat #00ff00 chroma background, generous padding, and nearest-neighbor pixel art.”

## Sniper matte cleanup note

An edit was attempted to remove the matte from the existing dedicated Sniper sheet, but the generated edit baked a checkerboard into the RGB pixels. It is preserved as `source/sniper-weapons-alpha-edit.png` for provenance only. The runtime final was instead produced from the preserved same-fighter source with the installed local key-removal helper, so the black matte is not loaded.
