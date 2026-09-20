# Orb Foundry UI Handoff

## Primary Flow

`Menu → fighter profile or Record Fight → setup → Social Battle → preview`

No Tournament, Meta Lab, ordinary Match, New Match, bracket, analytics, or
replay controls belong in the active product.

## Orb Component

All static fighter representations use one flat component:

- Solid class color
- Dark circular outline
- Small upper-left highlight block
- Centered class mark: `CI`, `GL`, `HX`, `CH`, `VO`, `VE`, `GR`, or `AE`
- No texture, gradient, glow, bloom, or detailed illustration

The active arena replaces the class mark with current HP. Archived Canva atlases
are reference material only.

## Main Menu

- Warm cream drafting-paper surface
- Eight responsive flat orb buttons
- `Record Fight` as the primary action
- Balance Lab, Developer Mode, and theme selection as secondary tools
- At `390 × 844`, the primary action appears before the two-column fighter grid

## Fighter Profile

- One reusable template driven by `ORB_PROFILES`
- Flat hero orb, class name, weapon, ability, foundry record, strengths,
  weaknesses, combat stats, and one Social Battle rating
- Back, previous, next, dots, keyboard arrows, and `Record with this orb`

## Social Battle Studio

- Compact toolbar with Home, Link, Lab, Dev, Pause, and Sound
- Dedicated export canvas as the dominant surface
- Recording state, progress, New Setup, and Stop + Preview controls
- Cropped portrait, square, and landscape layouts preserve the complete arena
  while ending just below the orb stat panels

## Motion

- Screen transitions: `240ms`, horizontal slide plus fade
- Menu orb float: roughly `3.1s`, staggered per class
- Profile orb float: roughly `3.6s`
- Reduced-motion mode removes decorative floating and transition duration
