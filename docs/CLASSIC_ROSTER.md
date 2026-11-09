# Classic roster audit

Reviewed all 54 playable Classic fighters on November 8, 2026. Each
fighter launched through the regular Classic setup and was sampled on the
portrait export canvas. Ability samples used seed 2406 and an opponent
with extra HP to give moves room to appear. Each row records the design
decision for that fighter, based on the sampled frame and its render and
ability paths.

The shared black arena, pixel title, ability meter, and dark-color contrast
adjustment apply across Classic. The image scan checked 86 local image
references in the shared arena renderer. Those files were present and the
browser audit reported zero page or asset errors. Train needed a recognizable
engine. Its previous renderer drew a rectangle directly on the canvas.
The existing generated sheets still supply art where they read clearly,
including the light-theme variants and the large weapon sprites.

| Fighter | Decision | Review |
| --- | --- | --- |
| Sword | Keep | The large blade and windup or strike meter identify the active move. |
| Duplicator | Keep | The crown and shrinking copies distinguish the original from its clones. |
| Orbital | Keep | The orbiters and live satellite count make its power readable. |
| Unarmed | Revisit | Give its bounce-to-power ramp a short body cue alongside the damage and speed readout. |
| Slammy | Revisit | Give the contact slam a brief grounded squash and radial burst to separate it from Unarmed. |
| Vampire | Keep | The fangs and moving latch already give it a clear attack silhouette. |
| Turret | Revisit | Make the turret deployment silhouette larger than the small orange dot at spawn. |
| Flash | Revisit | Give the speed phase a recognizable dash trail with a clear return to normal speed. |
| Reactor | Keep | The blue core and expanding discharge already separate its charge from impact. |
| Sniper | Revisit | Bring up the rifle edge and make its single aimed shot stand out among the guns. |
| Draftmaster | Keep | The alternating gun and sword silhouettes identify the equipped weapon. |
| Blue Sun | Contrast fixed | The dark core now has a readable edge and title. The eight cyan rays already carry the attack. |
| Black Hole | Contrast fixed | Keep the crossed cyan and violet rings. The dark body and title needed a visible edge. |
| Tripwire | Revisit | Give a completed wire a distinct line treatment from Cobwebs and Lazer. |
| Hydrogen Bomb | Keep | The radiation emblem, fuse clock, and warning sound carry the countdown. |
| Necromancer | Keep | The lifted skull and soldier emergence already tell the summon story. |
| Poison | Revisit | Make the poisoned opponent visibly different from a Virus carrier during damage ticks. |
| Spikey | Keep | Large white spikes show the contact points without competing with the orb. |
| Snake | Contrast fixed | The connected tail identifies the body. Give growth a dedicated reveal if it is hard to spot in a clip. |
| Virus | Keep | The textured core and growing infection already identify the mechanic. |
| Shrapnel | Keep | The orange body and angular fragments clearly show wall-triggered attacks. |
| Cobwebs | Keep | The wall-anchored white strands work as a readable boss counter. |
| Apple | Keep | The apple projectile already reads separately from the thrower. |
| Absorber | Keep | The pink pulse and acquired-ability readout tell the viewer what changed. |
| Batman | Keep | The mask and batarangs give it a readable identity. |
| Ying Yang | Contrast fixed | Its title needed contrast in both phases. Keep the monochrome identity. |
| Cowboy | Keep | The hat, rope, and three lasso poses already telegraph the trap. |
| Hive Ball | Updated | Honeycomb casing, winged bees, active swarm count, buzz, and sting. |
| Zeus | Keep | The gold nodes and bright chain lightning are visually distinct. |
| Glass Ball | Revisit | Increase shard edge contrast where the shards leave the body. |
| Pistol | Keep | The compact sidearm and paired shots distinguish it from longer guns. |
| Shotgun | Keep | The wider weapon and spread are readable as a group. |
| Rifle | Revisit | Emphasize the five-shot cadence to distinguish it from Sniper. |
| Sawball | Keep | The two rotating saws already describe the contact area. |
| Cutter | Keep | The red zone and live boundary make the hazard readable. |
| Trident | Keep | The blue spear and tether distinguish its flight from the recall. |
| Lazer | Revisit | Give the live laser edge a stronger cue relative to completed paths. |
| Charger | Contrast fixed | Brighten the title and dark body edge. A stronger teleport arrival is a later option. |
| Parasites | Contrast fixed | The body is more visible. Differentiate attached carriers from nearby debris next. |
| Grappler | Contrast fixed | The grappling gun is readable. The dark name and orb edge needed contrast. |
| Train | Updated | Steel and brass body, three bounce lights, locomotive, steam, moving wheels, rails, and whistle. |
| Snowball | Updated | Faceted ice shell and a softer frost ribbon so the frozen target reads through it. |
| Jackpot | Revisit | Make the spin and payout easier to follow between damage events. |
| Boxer | Updated | Red corner wraps, staged punch arcs, and a windup, jab, and recovery readout. |
| Artist | Updated | Palette body, paint stroke keyed to the summon, and distinct brush and release cues. |
| Monster | Updated | Green jaw and stone fists on the live gloves, with a low growl and heavier contact. |
| Fairy | Updated | Violet wings, a readable wand, a star-shaped shot, and a chime. |
| Commander | Contrast fixed | The dark title and body edge are readable. Give the two drone roles distinct silhouettes next. |
| WDC | Updated | Three damageable summons, portal, disintegrator, mining, and market. |
| One Punch Man | Updated | A dodge with recovery, jab, barrage, flying glove, and Serious Punch. |
| Gojo | Added | Limitless guard, red and blue merge, and Hollow Purple. |
| John Rod | Added | Stick-figure silhouette, rotating rods, and a collapsing Final Wrap. |
| One Above All | Added | Pearl orbits, a Convergence Ring, and a cursor with a pixel burst. |
| Knight | Added | Steel blade, shield ring, and a radial bash impact. |

## Signature moves

The next pass gives every original fighter a signature keyed to its live
combat events. Snowball’s Avalanche is covered in the [combat style guide](CLASSIC_STYLE.md#roster-pass).
These cues use the same frame and sound paths for ordinary play and export.
Tells travel with their fighter, contact accents stay at the contact point,
and ongoing effects use the live path or status. Existing dedicated clips
such as the bomb siren and the lasso crack are kept where they carry the move.

| Fighter | Signature | Read on the canvas and in the mix |
| --- | --- | --- |
| Sword | Steel Crescent | A blade draw leads to a crescent from the real swing or a narrow poke. A second edge marks deflection. |
| Duplicator | Mirror Bud | A pink bridge opens between parent and child, followed by three staggered pops. |
| Orbital | Satellite Lock | A pitched lock confirms a new satellite. A rotating diamond marks one spent on contact. |
| Unarmed | Kinetic Knuckle | Rear chevrons mark the bounce ramp; a compact, low strike marks body damage. |
| Slammy | Faultline Slam | A grounded plate primes the body, then a split fracture and heavy crack follow contact. |
| Vampire | Crimson Lockjaw | Teeth close at the latch. A stream leads from the victim to Vampire on each drain. |
| Turret | Sentry Deployment | Three supports unfold around a mounted core with a mechanical startup. |
| Flash | Lightning Step | A bolt opens the speed burst. Tapering afterimages follow the orb’s actual path. |
| Reactor | Core Breach | Side gauges fill; four bright gates split at release, and a separate accent marks the wave reaching a victim. |
| Sniper | Needle Shot | A small scope tells the aim. One straight report and crosshair mark launch and contact. |
| Draftmaster | Arsenal Shift | A folded blade tell reads differently from the sidearm flash and mechanical ready click. |
| Blue Sun | Corona Volley | Light travels down the eight live ray origins. A short electrical tick marks each nearby hit. |
| Black Hole | Event Horizon | Three violet spirals contract at the actual arena center. The pull can be read without a sound on each fractional damage tick. |
| Tripwire | Tripline Snap | End clamps and a dashed filament mark the wire. A tight zigzag marks a trip. |
| Hydrogen Bomb | Critical Countdown | Rim ticks recede while the siren runs. Three warning wedges and hot fragments mark detonation. |
| Necromancer | Bone Muster | Rising glyphs and a low chant lead into soldier emergence at the summon points. |
| Poison | Venom Bloom | Purple bubbles appear on actual application and drift around the poisoned victim. |
| Spikey | Briar Nail | A bright triangular edge grows from the wall anchor toward the exact tip. |
| Snake | Shed and Strike | Newly added tail scales peel outward; head and tail contacts turn in opposite directions. |
| Virus | Patient Zero | Square cells spread from contact and accumulate around the active infection arcs. |
| Shrapnel | Splinter Charge | One wall blast and a fan of fragments stand out from individual fragment hits. |
| Cobwebs | Silk Hitch | Woven strands reach the live anchor. A hexagonal knot marks the strand catching a victim. |
| Apple | Orchard Toss | Leaves follow the toss. A green plus marks healing, while a red bite marks damage. |
| Absorber | Prism Intake | A closing shutter takes on the color of the ability just acquired. |
| Batman | Nightwing Rebound | A folded wing accompanies the paired throw; one wing cut identifies contact. |
| Ying Yang | Twin Temper | Opposite arcs roll over each other, paired with a rising and falling tone. |
| Cowboy | Rodeo Knot | Rope twists out on each real throw, settles when loose, and shrinks on a catch. |
| Hive Ball | Honeycomb Swarm | Hexagonal cells open around the hive. One sharp sting distinguishes contact from the swarm buzz. |
| Zeus | Thunder Tribunal | Three bolts travel toward the real talisman points. Local forked strikes follow damage. |
| Glass Ball | Prism Shatter | Beveled translucent shards turn away from the wall with a short glass chime. |
| Pistol | Double Tap | Two compact flashes and cracks follow the two actual shots. |
| Shotgun | Scatter Bloom | The bright fan uses the live pellet angles and leaves a broader impact mark. |
| Rifle | Five-Round Rebound | Five short muzzle traces match the burst. The allowed ricochets use a thin chevron and metallic ping. |
| Sawball | Twin Tooth Grind | A jagged tooth edge throws sparks at disc contact and tightens on a hit. |
| Cutter | Redline Shear | Red hatching follows the existing zone edge. A double shear marks a damage tick inside it. |
| Trident | Tidepin Recall | Three tines and a water curl distinguish the throw, pin, return, and catch. |
| Lazer | Live Red Trace | The live segment has a bright terminal and direction mark. Replacing the beam clears the old terminal. |
| Charger | Phase Crash | Four brackets contract during charge. The arrival leaves a short streak and square fragments on damage. |
| Parasites | Burrow Clamp | An opening jaw precedes the latch, then a low clicking pulse marks the attached carrier. |
| Grappler | Winch Hook | A narrow cable and angled hook distinguish its launch and latch from other shots. |
| Train | Third Bell Express | Brass ties mark the laid rail. Steam and a whistle mark engine release. |
| Jackpot | Golden Seven | Three reel windows show the spin. A real jackpot makes a gold seven and a short payout chord. |
| Boxer | Red Corner Combo | Hand brackets telegraph the draw, a curved streak follows the glove, and a star marks contact. |
| Artist | Living Brushwork | The brush sketch and release splash take the color of the real summon. |
| Monster | Stonejaw Crush | A low growl and stone edges lead into a broad, chipped impact. |
| Fairy | Wand Comet | A comet with trailing stars and a chime marks release; one star lands on contact. |
| Commander | Drone Crossfire | The scout has a narrow blue hull; the heavier missile drone has swept amber wings and a lower report. |

## Once-per-duel powers

The signature moves above describe the animation and sound of ordinary
combat. These specials add a separate attack with its own tell, hitbox,
and recovery. Each of the 48 original fighters can spend its special once
per duel. The newer fighters use the form, charge, and move systems in the
[Classic combat style guide](CLASSIC_STYLE.md).

| Fighter | Special | What the opponent has to read |
| --- | --- | --- |
| Sword | Slipstream | One dash can sidestep a hit or close the gap for 17 damage along the dash path. |
| Blue Sun | Solar Prominence | A bright rim expands from the caster and knocks back fighters caught by its edge for 28 damage. |
| Black Hole | Binary Crush | Twin gravity wells narrow toward the mark. Getting caught in their path deals 34 damage. |
| Pistol | Ricochet Relay | Two placed coins redirect shots through the marked area in sequence for 24 damage. |
| Shotgun | Breach Wave | A wide pressure front shoves away fighters it catches for 27 damage. |
| Rifle | Suppressing Grid | Three parallel rails fire in sequence. A hit deals 29 damage and turns the target off its course. |
| Sniper | Dead Drop | A wall shot lands inside a marked circle for 31 damage. |
| Draftmaster | Crosscut | Two long firing lanes cross the mark at different angles. Contact deals 26 damage. |
| Turret | Battery Sweep | Deployed sentries and wall positions cover the mark in a three-lane volley for 25 damage. |
| Commander | Pincer Order | Drones or wall positions deliver three staggered strikes along a marked approach for 29 damage. |
| Duplicator | Duplex Ambush | Five mirror cells spring around the marked spot. Contact scrambles movement. |
| Orbital | Satellite Fall | Five satellites collapse inward across the mark. A hit pulls toward the collapse. |
| Unarmed | Meteor Knuckle | A committed body rush launches a fighter caught in its path. |
| Slammy | Faultline | A heavy expanding fracture knocks the opponent away from the strike. |
| Vampire | Crimson Tithe | A close lunge steals health and slows the opponent on contact. |
| Flash | Thunder Run | A short tell leads into a long speed burst. Contact scrambles movement. |
| Reactor | Core Implosion | A blue rim contracts around a marked point and pulls a fighter toward it. |
| Tripwire | Tripline Gauntlet | Four staggered lines cover parallel routes. A trip slows the opponent. |
| Hydrogen Bomb | Thermal Front | A wide pressure front expands from the center of the arena before the main fuse expires. |
| Necromancer | Grave Procession | Five summoning sites erupt along an arena line in order. |
| Poison | Venom Garden | A cluster of purple blooms restricts the exit. Contact slows movement. |
| Spikey | Briar Bastion | A thorn shield absorbs a solid blow and knocks nearby attackers back. |
| Snake | Coil Crush | Three moving tail points squeeze toward the mark and slow on contact. |
| Virus | Glitch Bloom | A pixelated vortex turns movement, then scrambles a fighter caught in the collapse. |
| Shrapnel | Splinter Battery | Five cuts fan inward from the nearest wall. |
| Cobwebs | Web Convergence | A closing web pulls its victim in and slows the escape. |
| Apple | Golden Orchard | A leaf guard counters a solid blow and restores health on the first hit. |
| Absorber | Prism Reversal | A prism absorbs a heavy blow, then sends back an inward pulse. |
| Batman | Nightwing Pincer | Two angled cuts converge on the mark and scramble movement on contact. |
| Ying Yang | Eclipse Exchange | Two opposed bodies spiral around the caster and pull on contact. |
| Cowboy | Dead Man’s Loop | Three lasso zones tighten in sequence and slow a caught fighter. |
| Hive Ball | Royal Swarm | Seven moving hex cells spiral around the mark and slow a fighter they catch. |
| Zeus | Thunder Crown | Three staggered bolts run in from the wall toward the marked area. |
| Glass Ball | Glass Cathedral | Five narrow shards cross the mark from offset origins. |
| Sawball | Twin Mills | Two large, moving saw hitboxes sweep around the orb. |
| Cutter | Arena Bisection | Two long cuts cross through the arena center. |
| Trident | Undertow Impale | Three parallel tines sweep the aim line and pull on contact. |
| Lazer | Redline Beam | A long tell gives way to one thick, fast wall beam. |
| Charger | Phase Break | A tight charge telegraphs a fast rush and strong knockback. |
| Parasites | Host Takeover | A clamp field draws the opponent in, then drains and slows on contact. |
| Grappler | Anchor Winch | A wide pull centered on Grappler gathers the opponent before the snap. |
| Train | Runaway Express | A long, wide body charge throws a fighter off the track. |
| Snowball | Whiteout Front | A snow rim spreads from the nearest wall and slows on contact. |
| Jackpot | House Edge | Three staggered reel zones threaten the marked lane. |
| Boxer | Bell Ringer | A short, wide punch rush does heavy damage up close. |
| Artist | Wet Paint | Three broad brush cuts leave openings between their strokes. Contact scrambles movement. |
| Monster | Mountain Breaker | Three heavy eruptions open around a nearby marked fighter and throw them back. |
| Fairy | Falling Stars | Five staggered starfalls cover a cross around the mark. |
