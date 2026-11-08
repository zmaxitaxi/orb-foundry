# Character showcase

Catalog for the site in `site/`. Each fighter has a damage rule and a picture. The lab reads these rules as a barrier sum.

`characters.json` is the index. Image paths in that file are relative to this folder.

- `images/stick/` is the stick-figure fighter from the racer cards. One SVG per character, named by id.
- `images/animated/` is the cel-shaded portrait with the attack in the background. One file per character.
- `images/portraits/` is the smaller semi-realistic set. Only the characters that have one include a `portrait` path.

`mode` is `orb-race` or `classic`. `id` matches `ORB_RACERS` or `CLASSIC_ORBS`. Race Absorber is `roulette`. Classic Cowboy is `trapper`. Classic Snowball is `frost-ball`. Race Artist is `artists`.

`n` in a formula is the bounce count. Math damage caps at 1×10²¹.

The Batman picture is an original night-cape fighter and is lettered NIGHT CAPE. The Godzilla picture is an original reptile wrestler and is lettered KAIJU.
