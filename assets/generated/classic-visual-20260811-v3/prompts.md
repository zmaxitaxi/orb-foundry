# Classic visual refresh v3

The built-in GPT Image requests for the v2 Batman body and point-pair asset were retained as the authored source art. A direct inpainting request to merge the points into the body was rejected by the image service, so the shipped v3 source combines those two GPT-generated layers without hand-drawing or changing their pixel shapes. The combined RGB source uses a flat `#00ff00` key and was cleaned with `remove_chroma_key.py`. The authored points overlap the first opaque top row of the body, so they are part of one runtime body asset rather than a procedural overlay.

## Source prompts

- Body: “Original pixel-art game sprite on flat neon green chroma-key. One front-facing circular game orb, bold black pixel outline, with two tall triangular pointed fins protruding from the top edge. The orb's upper half is a solid black superhero-style mask with tiny white eye slits. The middle band is warm tan and empty for later HP text. A gold utility belt with square pouches wraps near the lower third. Everything below the belt is solid black and part of the same orb. No human, no cape, no logo, no text, no extra objects, no shadow outside the orb. Crisp chunky pixels, centered square source.”
- Points: “Original pixel-art accessory on a flat neon green chroma-key background: exactly two small plain black triangular points, left and right, each with a thin dark outline, intended to peek above a circular game orb. Simple geometric triangles only, no ear anatomy, no fur, no character, no orb, no face, no text, no extra details.”

## Processing

The authored point pair was alpha-cropped and placed so its bases overlap the generated body’s top mask edge. The combined source was passed through:

`remove_chroma_key.py --auto-key corners --soft-matte --spill-cleanup`

The final is rendered with nearest-neighbor sampling and contains no HP/text; the game draws centered HP after the body pass.
