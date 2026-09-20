# Classic visual refresh v4

The body and point pair were each generated with GPT Image on a flat neon-green chroma key and visually inspected. The image service rejected direct inpainting of the body, so v4 composes the two authored GPT-generated pixel layers without redrawing them. The points’ bases overlap the generated body’s first opaque top rows, producing one connected transparent runtime body asset. It was cleaned with `remove_chroma_key.py` and is rendered nearest-neighbor.

## Authored prompts

- Batman body: “Original pixel-art game sprite on flat neon green chroma-key. One front-facing circular game orb, bold black pixel outline, with two tall triangular pointed fins protruding from the top edge. The orb's upper half is a solid black superhero-style mask with tiny white eye slits. The middle band is warm tan and empty for later HP text. A gold utility belt with square pouches wraps near the lower third. Everything below the belt is solid black and part of the same orb. No human, no cape, no logo, no text, no extra objects, no shadow outside the orb. Crisp chunky pixels, centered square source.”
- Point pair: “Original pixel-art accessory on a flat neon green chroma-key background: exactly two small plain black triangular points, left and right, each with a thin dark outline, intended to peek above a circular game orb. Simple geometric triangles only, no ear anatomy, no fur, no character, no orb, no face, no text, no extra details.”

## Processing

The authored point crops were placed over the generated body’s upper mask edge, with their bases overlapping the body. The RGB source was then processed with:

`remove_chroma_key.py --auto-key corners --soft-matte --spill-cleanup`
