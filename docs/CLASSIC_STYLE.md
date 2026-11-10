# Classic combat style

One Punch Man and WDC set the bar for Classic. You should be able to follow a fight with the sound off and recognize the same moves with your eyes closed. The channel references and the reasons for this direction are in [Future plan](FUTURE.md#classic-direction). The [roster audit](CLASSIC_ROSTER.md) tracks individual fighters.

## Build the move around what happens

1. **Tell.** Give the move a short, recognizable pose, shape, or sound before it commits. A transformation should show what is about to change. A defense should show when it is available and when it is recovering.
2. **Travel.** Draw the blade, projectile, dash, or tether from the live simulation. Show where it comes from, where it is headed, and how the opponent can escape. Use real paths for afterimages and saber cuts.
3. **Payoff.** Time the strongest sound and shape to damage, a dodge, a block, or a meaningful wall contact. Misses get travel and recovery cues. They leave the HP display and hit effects alone.
4. **Recovery.** Let scars, particles, and echoes decay in place while the fighters keep moving. Leave enough space between large beats for viewers to follow both fighters.

Keep the black square, thin white border, centered health, and color-coded ability readout. Give each fighter an identity through geometry, timing, and sound. A gun, a paint summon, and a ground slam should read differently in grayscale. Use the arena's full space for long moves while keeping the centers of both orbs readable. Check muted playback and the 9:16 recording canvas at phone size.

## Simulation and recording

- Pick moves from range, threats, cooldowns, or seeded variation. Keep the same result and move sequence when replaying a seed. Avoid damage changes during a presentation-only pass. In a regular one-on-one opening, start on a seeded diagonal and follow an inward orbit. The physical clash sends both fighters sideways with a brief boost, then they return to their ordinary movement.
- Run combat in the fixed-step simulation. Emit cues at the step that starts, connects, blocks, ricochets, or resolves. The renderer, HUD, and audio should agree about the current state.
- Use the existing controls for reduced motion, flash reduction, and effects volume. Keep short sounds distinct even when several moves overlap.
- Verify an ordinary Classic fight through the same 9:16 canvas used for export. Inspect a tell, a clean hit, an evasion or miss, and the fading aftermath before choosing a seed for a video.

## Roster pass

- **Original fighters** keep their regular moves and gain a separate power that recharges 12 seconds after recovery. Commit to a readable path, hazard, or counter. Aiming can track during the early tell and should settle before a placed strike lands. Bind the visuals and sound to that same attack's geometry and timing.
- **Sword** can spend its one shared defensive dash on a Slipstream sidestep. Its attacking Slipstream can recur after cooldown and damages opponents along its real path.
- **Blue Sun and Black Hole** make opposite shapes. Solar Prominence expands from the Sun's live position. Binary Crush pulls toward a point as two wells converge. Give each room to read as a distinct event even when normal shots are still visible.
- **Gun fighters** change the threat on the field when their powers are ready. Use ricochet sockets, a pressure wave, staggered firing lanes, a marked drop, crossed fire, or deployed support depending on the fighter. Draw the lanes or marks before the strongest sound.
- **One Punch Man** evades hostile damage without spending a charge or waiting on a cooldown. The body moves and leaves a brief echo when a dodge begins. A mirror stalemate ends in a draw after 36 seconds.
- **Snowball** builds Avalanche from wall bounces. Snow packs on the first two contacts and fans out as ricocheting shards on the third. The opponent stays in motion.
- **Ben 10** telegraphs each Omnitrix change and uses a seeded bag of distinct forms. XLR8's tornado follows the live opponent. Heatblast's cast is a wide, short fire beam with a rising flame roar. Diamondhead's crystal shield leads into a 32-damage charge. Four Arms reaches out, grips, and throws. Bend the frame itself at the wall collision. Cannonbolt's enlarged roll hitbox matches its silhouette and deals 30 on contact. Its first breakout removes a section of the frame and returns it from the opposite wall. Keep both outline changes through the end of the fight and in replay frames.
- **Vader and Luke** use the same blade geometry for hits and rendering. Draw the entire hilt outside the body and show the hand closing around its grip. Vader reaches toward the opponent with his free hand, holds it in place for four damage ticks, and lets go. The returning throw and the slower 34-damage single strike have different tells. Luke uses a Force Vault to close space, a Saber Lunge to cut across a gap, and a two-hit combo up close. Saber trails fade in open space. Wall contacts leave a dark scorch with a short ember glow.
- **WDC** gives each summon a silhouette that identifies its move. Unarmed wears wraps and a headband. Exoelectric has a glowing emitter. Emerald has a faceted miner crest. Keep the weapon and health readable in both the live and authored fights.
- Keep bodies simple. Put motion and recognizable shapes on weapons and form silhouettes. The two lightsabers use distinct swing, movement, and return sounds.

## Eight additional move sets

- **Magneto:** give the halo visible metal plates, two guard charges, and a
  clear opening into a three-shard fan. Rail Spear uses marked lanes that
  settle before the staggered metal launches.
- **Kratos:** draw chain links from the hand to the actual blade tip. Only a
  connected chain pulls the opponent into the slam. Give the rotating
  returning axe a cold edge and a separate return and catch sound.
- **Doctor Strange:** keep the two portal rims visibly separated. Both
  projectiles and one unrestrained body can pass through; the exit angle
  rotates their real velocity. Mandala damage follows its expanding rim.
- **Gambit:** cards tumble while flying and settle when lodged. Corner arcs
  show the live blast radius and charge before detonation. The staff combo
  has wooden contact sounds and a separate two-swing silhouette.
- **Rubber:** attach the stretch to an actual wall point. Deform the body
  before the launch and use the body's swept path for damage. Extended
  fists have visible knuckles at their live contact tips.
- **Pinball:** bumpers move fighters through physical collision. Their light
  and bell follow a bank; combo charges come from contact, not a timer.
  Bumpers respect frozen and held fighters.
- **Origami:** use fold lines and a distinct paper-plane body. Boomerangs
  have separate outward and returning contacts. Crane wings turn along
  their flight paths. Sound like paper and air, with no generic gun sample.
- **Sand Pharaoh:** show the exit before the body reforms. Leave the shell
  where the body was at departure; it can intercept a hostile projectile.
  Staff strikes and scarabs use real paths, with restrained sand aftermath.

These fighters use weighted seeded move choices. Range and available
objects affect the pool, and recent moves receive less weight. Shared
dash charges remain independent of their repeating attacks.
