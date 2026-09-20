# Canva Handoff

## Social Battle Broadcast Source

Editable design: https://www.canva.com/d/5RPoDUyT72EjpGc

View-only design: https://www.canva.com/d/6NneuYid4r_YQ-K

Design ID: `DAHMn1OAmX4`

Local visual source: `assets/concepts/orb-foundry-social-battle-concept.png`

The editable portrait source establishes the phone-size hierarchy for:

- High-contrast class emblems and colored orb silhouettes.
- Large pixel weapons as the primary class-identification layer.
- Centered moving health labels.
- Bottom ability, passive, resource, and cooldown panels.
- Match timer, seed, ability announcements, and winner treatment.

The runtime recreates these elements in canvas code so health, cooldowns,
weapons, effects, and camera framing stay synchronized with deterministic state.
Canva remains the editable art-direction source for future transparent weapon,
emblem, status-icon, and border-atlas exports.

## Flat Pixel Weapon Board

Editable design: https://www.canva.com/d/yD2swZEf2Fim2fR

View-only design: https://www.canva.com/d/zQo1QC6xh21NtE0

Design ID: `DAHMqDlZgdI`

This original eight-weapon reference board defines the simplified Social Battle
look: square-pixel silhouettes, flat fills, dark outlines, one highlight color,
and no glow, gradients, bloom, or particles. The supplied watermarked stock
reference was used only as broad visual direction and was not imported,
traced, or shipped.

The runtime draws equivalent pixel weapons in code because each visible weapon
must continue to terminate at the deterministic collision segment. Canva
remains the editable source for palette and silhouette iteration.

## Fight And Overtime Reference

Editable design: https://www.canva.com/d/qLH__puinkCEzHg

View-only design: https://www.canva.com/d/aFNDMdkSwbpME5E

Design ID: `DAHMqRUHnjw`

This board defines the transition from the frozen countdown to the `FIGHT` card
and from normal combat into forge overtime. Normal combat keeps the cream-and-
ink arena. Overtime adds flat rust heat, dark edge pressure, amber-and-charcoal
corner blocks, and a double warning border without obscuring fighters or
weapons. The runtime recreates the treatment in canvas code at the
deterministic 90-second overtime boundary.

Editable concept: https://www.canva.com/d/RYGN-6UBKsilTzG

View-only concept: https://www.canva.com/d/OkyUsUihcQHPp-q

Design ID: `DAHMZ7ZX8Bk`

## Orb Sprite Atlas

> Archived reference only. The Social Battle-only product no longer loads or
> displays these detailed orb assets. Static UI orbs are flat CSS components,
> and in-arena fighters are code-drawn with live HP numerals.

Editable atlas: https://www.canva.com/d/haBRAsdhVp6DoKn

View-only atlas: https://www.canva.com/d/Xhcsg5nMHpHIox6

Design ID: `DAHMZ4z3rrE`

Exported game asset: `assets/canva/orb-atlas.png`

The game crops Cinder, Glacia, Hex, and Chrono from this atlas and removes the
black background in an offscreen canvas. This keeps the Canva source editable
while the shipped renderer retains transparent sprites and unchanged hitboxes.
The same atlas now supplies the roster-card and match-setup orb previews.

## Expansion Sprite Atlas

> Archived reference only. This atlas is retained for historical design
> provenance and is not part of the active runtime.

Editable atlas: https://www.canva.com/d/qGhDCR7EVXVOxQa

View-only atlas: https://www.canva.com/d/WSAEHVDctczJotl

Design ID: `DAHMaKDZAwY`

Exported game asset: `assets/canva/orb-atlas-expansion.png`

The expansion atlas supplies the isolated Canva-style orb silhouettes for
Volta, Venom, Gravis, and Aegis. Runtime weapons remain procedural because their
rendered endpoints must exactly match deterministic collision segments:

- Volta: yellow/cobalt lightning core and Lightning Hammer; charged hits release a code-rendered ricochet bolt.
- Venom: emerald toxic core and segmented Poison Whip.
- Gravis: magenta armored core and dense Gravity Mace.
- Aegis: cyan steel core and broad directional shield with a five-second surge aura.

The renderer chroma-keys the black atlas background in an offscreen canvas.
Roster, setup, award, analytics, and in-arena previews use the same exported
source so class identity stays consistent across every surface.

The original Canva concept establishes the revised Orb Foundry combat language:

- Orb bodies bounce without dealing damage.
- Every class has one clearly readable 360-degree orbiting weapon.
- Cinder uses an Ember Sword with flame accents and burn damage.
- Glacia uses a Frost Scythe with cyan ice geometry and slow.
- Hex uses a Rune Staff that charges mana and becomes empowered.
- Chrono uses an Hour Glaive that keeps attacking during Time Stop.
- Weapon arcs, hit callouts, health, cooldowns, and mana remain legible
  without covering the arena.
- Bumpers, portals, ice floors, and speed pads use code-drawn pixel geometry so
  activation effects stay aligned with deterministic hazard bounds.
- The compact live feed sits against the arena edge and collapses on mobile.
- Replay transport appears inside the arena only during recorded playback.
- Bracket, balance, and developer controls live outside the playfield.

## Cream Theme Texture Source

Editable environment swatch: https://www.canva.com/d/M6oRcFxW1h_ou8a

View-only environment swatch: https://www.canva.com/d/pa3EJy1WQjHuGOB

Design ID: `DAHMaoqrdOw`

The five-panel Canva source establishes low-contrast decorative motifs for
Cream Foundry, Botanical Conservatory, Frost Laboratory, Arcane Library, and
Solar Workshop. Runtime backgrounds remain code-native so they resize cleanly,
stay sharp on canvas, and cannot affect deterministic physics. The Canva file
is the editable art-direction source for future texture exports.
