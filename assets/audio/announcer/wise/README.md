# Spliced Announcer Intros

The active battle intro is assembled at runtime from four standalone ElevenLabs
clips: the left orb name, `versus`, the right orb name, and `pick your winner`.
Short gaps are added between the first three clips, with a slightly longer pause
before the audience prompt.

The 13 orb clips use the user-confirmed order recorded in `manifest.json`:
Mirage, Echo, Cinder, Frost, Hex, Chrono, Aegon, Volta, Venom, Gravis, Forge,
Static, and Shade. The separate `versus` and `pick your winner` clips remain
shared by every matchup. Originals are preserved in
`assets/audio/source/elevenlabs-announcer-20260626`.

World Cup intros use the same runtime splice and the shared `versus.wav`: the
left country, `versus`, the right country, then the supplied World Cup
`pick your winner` prompt. France, Brazil, USA, Congo, England, Sweden, Bosnia,
and Japan are available. Their originals are preserved in
`assets/audio/source/world-cup-announcer-20260628`.

Orb Race intros use that same splice workflow with the supplied racer clips:
the selected left racer, `versus`, the selected right racer, then `pick your
winner`. The six original race clips are preserved in
`assets/audio/source/race-announcer-20260713` and mapped in the order
Duplicator, Speedster, Orbital, and Drill.

Orb Race uses a separate `race-pick-your-winner.mp3` prompt, supplied on
2026-07-14, so its final stitched cue does not replace the Classic or World
Cup prompt.

The July 14 math racer clips map the first supplied file to Fibonacci and the
second to X Squared. They are preserved in
`assets/audio/source/race-announcer-20260714`.

The July 14 expansion clips map the first supplied file to Flash and the second
to Batman. They are preserved in the same dated source directory.

The latest July 14 race clips map the first supplied file to the Orb Race-only
Versus cue, the second to Lazer, and the third to Golden Ratio. They are also
preserved in the same dated source directory. Classic and World Cup continue
using the shared `versus.wav` cue.

The latest supplied clips map the first file to Sticky and the second to
Grower. They are preserved in the same dated source directory.

The latest group clips map the first file to Motion Orbs and the second to Math
Orbs. The previous group source files remain preserved; the active group cues
are `race-group-motion.mp3` and `race-group-math.mp3`.

The follow-up group clips map the first file to Growth Orbs, the second to
Weapon Orbs, and the third to Superhero Orbs. Their previous source files are
also preserved.

The July 15 racer clips map the first file to Gravity, the second to Jackpot,
and the third to Boomerang. They are preserved in the same dated source
directory.

The supplied July 15 Splodey clip is mapped to the stable `mines` racer ID and
is preserved in the same dated source directory.

The July 17 math clips map to the quadratic, pi, integral, and prime racer IDs
in that order. Their source copies are preserved in the same dated directory.

The latest July 17 clip is mapped to the stable `speed-impact` racer displayed
as Slow. Its source copy is preserved in the same dated directory.

The latest July 17 Adam Stone clip is mapped to the stable `meteor` racer. Its
source copy is preserved in the same dated directory.

The July 18 Gael clip is mapped to the stable `black-hole` racer. Its source
copy is preserved in the same dated directory.

Additional user-confirmed World Cup country clips are preserved in the dated
source folders through `assets/audio/source/world-cup-announcer-20260703`,
including the latest Cabo Verde and Argentina standalone intros.

The latest user-confirmed standalone mappings are `17_22_25` for USA and
`17_22_32` for Japan. Their active files are byte-identical to the preserved
source copies; hashes are recorded in `manifest.json`.

The next confirmed mappings are `17_22_48` for Congo and `17_22_59` for
England. Their active and preserved source files are likewise byte-identical.

The following confirmed mappings are `17_23_08` for Sweden and `17_23_14` for
Bosnia, again with byte-identical active and preserved source files.

Winner voice lines are not loaded or played. The existing nonverbal match-finale
sample remains active at the end of a battle.

See `manifest.json` for the exact filename-to-line mapping.
