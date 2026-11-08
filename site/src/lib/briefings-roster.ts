import type { Briefing, BriefingLink } from "./briefings";

function wiki(slug: string, label: string): BriefingLink {
  return { href: `https://en.wikipedia.org/wiki/${slug}`, label };
}

const CLASSIC =
  "Classic is the last living team. ";

export const ROSTER: Record<string, Briefing> = {
  duplicator: {
    what: "Duplicator starts at 1 damage and adds 1 on every bounce, and it also copies itself. A copy is another body on the same team, working the same layers.",
    characteristic:
      "One ramp is arithmetic. Copies turn it into a team. The catalog copies on a fixed bounce interval. More bodies mean more contacts per second of travel, which is a rate the barrier sum does not count. The sum only adds the damage rule. The copies are why a seeded race can look faster than that sum.",
    matters:
      "Copying on a schedule is a branching process: each individual has offspring, and the population is the sum of a tree. Branching processes are how demographers model family names dying out and how physicists model a chain reaction. The expected size grows geometrically when each parent averages more than one child.",
    links: [
      wiki("Branching_process", "Branching process"),
      wiki("Exponential_growth", "Exponential growth"),
    ],
  },
  speed: {
    what: "Speedster adds 1 damage per bounce, and its travel speed also rises after each bounce. The hit is the ordinary +1 ramp. The special part is how quickly it gets back to the layer.",
    characteristic:
      "Two fighters with the same damage rule can finish at different clock times if one travels faster. The lab's bounce count gives them the same number on purpose, so the speed is visible as the thing the count leaves out. Contacts are the currency of the sum. Seconds are the currency of the video.",
    matters:
      "Speed is distance over time. If the distance between hits shrinks or the pace rises, the hit rate rises. A Poisson process is the mathematical version of 'events arriving at a rate.' Changing that rate without changing the size of each event is a separate lever from changing the damage formula.",
    links: [
      wiki("Speed", "Speed"),
      wiki("Poisson_point_process", "Poisson point process"),
    ],
  },
  orbital: {
    what: "Orbital does the usual +1 on a bounce, and it also keeps smaller orbiters that can touch the layer on their own.",
    characteristic:
      "The body and the orbiters are two contact streams. A barrier sum of the body hit undercounts the race whenever an orbiter lands a hit the body did not. Orbit radius and period decide how often that extra contact happens.",
    matters:
      "An orbit is a path that repeats under a central pull. Kepler's laws describe the period of a planet. A clockwork of several orbiters is a dynamical system, and small changes in timing can move a hit onto the layer or past it. That sensitivity is why the seeded arena, not the closed-form sum, is the check.",
    links: [
      wiki("Orbit", "Orbit"),
      wiki("Kepler%27s_laws_of_planetary_motion", "Kepler's laws"),
    ],
  },
  drill: {
    what: "Drill adds 1 per bounce and throws drill projectiles. It also copies itself on a short interval, so the team grows while the projectiles add extra hits.",
    characteristic:
      "Projectiles are damage that does not require the body to be touching the layer at that instant. Counting only body bounces misses them. Copies multiply both the bodies and the streams of drills.",
    matters:
      "A projectile's path is ballistics: position, velocity, and the pull of whatever forces the arena applies. Superposition lets you add the body's hits and the drills' hits when they do not interfere. When they crowd the same layer, the sum is no longer a simple addition of averages.",
    links: [
      wiki("Projectile_motion", "Projectile motion"),
      wiki("Superposition_principle", "Superposition"),
    ],
  },
  trifecta: {
    what: "The body hit stays 0. Every third hit removes one third of that layer's original maximum.",
    characteristic:
      "Two quiet hits, then a large one. The average per hit is one ninth of the layer, but the timing is lumpy. A course can end on the big hit or sit just short of it. Thresholds like that make a smooth curve a poor summary.",
    matters:
      "A rule that fires every kth event is a periodic sampler. In signal processing, sampling can hide a rhythm or reveal one. One third, three times, would clear a layer if the thirds did not overlap and nothing else interfered. The race is where you check that arithmetic against the actual layer.",
    links: [
      wiki("Sampling_(signal_processing)", "Sampling"),
      wiki("Periodic_function", "Periodic patterns"),
    ],
  },
  gravitator: {
    what: "Gravitator adds 1 per bounce, then attaches to a layer and pulls. The pull is an extra way to spend the layer's health, on top of the contact hit.",
    characteristic:
      "Attachment changes the problem from a series of bounces into a hold. While it is stuck, travel speed stops mattering and the pull's rate matters. A short grab on a thick layer does less than a long grab.",
    matters:
      "Gravity in physics is an attraction that depends on mass and distance. The card is a game version of a force that acts over time, which is an impulse: force multiplied by how long it is applied. Impulse is the change in momentum.",
    links: [
      wiki("Gravity", "Gravity"),
      wiki("Impulse_(physics)", "Impulse"),
    ],
  },
  grower: {
    what: "Grower adds 1 per bounce, and the body gets bigger as the bounces accumulate.",
    characteristic:
      "A larger body can meet the layer, and other orbs, more often. Size is a contact-rate effect. The damage added per bounce stays the gentle +1. The growth is why the video can look stronger than the +1 formula suggests.",
    matters:
      "Surface area and cross-section control how often an object is hit. In kinetic theory, a larger particle collides more often at the same speed. Allometry is the study of how a living thing's properties scale when its size changes. Bigger is not a multiplier on the formula. It is a multiplier on the chances to use the formula.",
    links: [
      wiki("Kinetic_theory_of_gases", "Kinetic theory and collision rate"),
      wiki("Allometry", "Allometry"),
    ],
  },
  lazer: {
    what: "The body hit stays at 1. A beam hits the layer, and that beam comes more often after every bounce.",
    characteristic:
      "The damage number on the body barely moves. The rate of the beam is the growing part. Two fighters with a hit of 1 can have completely different clock times if one of them fires a beam on a shrinking interval.",
    matters:
      "A laser is light kept in step, so the waves add instead of washing out. The card's beam is not a laboratory laser. The idea worth keeping is a signal whose frequency rises. Frequency is how often an event repeats, and it is independent of the size of each event.",
    links: [
      wiki("Frequency", "Frequency"),
      wiki("Laser", "Laser, the physical device"),
    ],
  },
  sticky: {
    what: "Sticky adds 1 per bounce and also ticks damage while it is stuck to the ground or the layer.",
    characteristic:
      "A bounce is a moment. A tick is a rate while a condition holds. The longer the stick lasts, the more the ticks matter, and a formula that only sums bounces will miss them. Leech watches the same kind of hold.",
    matters:
      "Integrating a rate over time is how a speed becomes a distance and how a dose becomes an exposure. The tick is a piecewise constant rate. Its integral is the rate times the duration. That is the first integral a calculus course asks for.",
    links: [
      wiki("Integral", "Integral"),
      wiki("Exposure_(photography)#Radiant_exposure", "Exposure as a rate times time"),
    ],
  },
  unarmed: {
    what: "Unarmed adds 1 damage per bounce and also ramps its speed. There is no projectile and no trick hit. The growth is the plain ramp, twice: once in damage, once in pace.",
    characteristic:
      "It is a baseline. Other cards are easier to read when you can say what they add beyond this. If a fancy fighter loses to Unarmed on the bounce sum, the fancy part was not helping the count you were using.",
    matters:
      "A baseline is the comparison in an experiment. Without it, a number has no meaning. Randomized trials call the baseline the control arm. Here the control is a fighter whose rule is only 'add 1, and go a bit faster.'",
    links: [
      wiki("Scientific_control", "Scientific control"),
      wiki("Treatment_and_control_groups", "Treatment and control"),
    ],
  },
  piercer: {
    what: "Each hit on the number line adds 0.75, and the hit passes through layers instead of stopping on the first one.",
    characteristic:
      "Pierce changes the geometry of a hit. A fighter who must finish layer 1 before touching layer 2 spends bounces in order. A pierce can tax several layers on one contact. The 0.75 is a gentle slope. The pierce is the part that can reorder the work.",
    matters:
      "In radiation and ballistics, the stopping power of a material is how much energy a particle loses per distance. A particle that does not stop is still losing energy along a track. Linear energy transfer is the measured version of that idea.",
    links: [
      wiki("Stopping_power_(particle_radiation)", "Stopping power"),
      wiki("Linear_energy_transfer", "Linear energy transfer"),
    ],
  },
  "ying-yang": {
    what: "Ying Yang switches between a speed mode and a damage mode. Damage level rises while the damage mode is on. The hit follows that level rather than a single formula of n.",
    characteristic:
      "The state is part of the fighter. Two runs with the same bounce count can differ if they spent different fractions of the race in damage mode. A summary that ignores the mode is averaging two machines.",
    matters:
      "A system with a few modes and rules for switching is a finite-state machine, and, if the switches are random, a Markov chain. The race version is closer to a schedule. Control engineering calls the choice of mode a switched system. Stability depends on how long each mode is active.",
    links: [
      wiki("Finite-state_machine", "Finite-state machine"),
      wiki("Markov_chain", "Markov chain"),
    ],
  },
  poison: {
    what: "The body hit is 0. Poison ticks, the ticks grow by 1 after each bounce, and they pulse every tenth of a second.",
    characteristic:
      "This is a rate, not a contact. Ten pulses a second, with a rising size, means the clock matters as much as the bounce count. A barrier sum in bounces leaves the winner open in the same way a fuse does, unless you convert pulses into a time.",
    matters:
      "A dose is concentration times time, or amount per pulse times the number of pulses. Pharmacologists plot that as exposure. A tick that grows by 1 each bounce is an arithmetic series sampled on a fixed clock. Multiply the two and you have the total delivered.",
    links: [
      wiki("Area_under_the_curve_(pharmacokinetics)", "Exposure as area under a curve"),
      wiki("Arithmetic_progression", "Arithmetic progression"),
    ],
  },
  "hydrogen-bomb": {
    what: "The body hit is 0. After 60 seconds every layer is set to 0 and the other team is destroyed. Nothing about the bounce count clears a layer before that.",
    characteristic:
      "The rule is a deadline. A climber wins if its layers are gone before the fuse ends. The climber loses if it is still working at 60 seconds. The lab's bounce sum leaves this race open on purpose, because a bounce is not a second.",
    matters:
      "In physics, 'hydrogen bomb' names a fusion weapon, a device that releases energy by joining light nuclei. This card does not describe such a device. It describes a waiting time. Survival analysis calls a fixed waiting time a censoring deadline: the race can end because the work finished, or because the clock did.",
    links: [
      wiki("Survival_analysis", "Survival analysis"),
      wiki("Nuclear_fusion", "Nuclear fusion, the physics name"),
    ],
  },
  "antimatter-bomb": {
    what: "The body hit is 0 until detonation. The fuse starts at 15 seconds and shortens toward 5. When it detonates, the waiting is over.",
    characteristic:
      "A fuse that gets shorter is a deadline you can move. Comparing it with a climber is a region, not a single number: long courses and slow climbers fall on the bomb's side of the region, short courses on the climber's side.",
    matters:
      "Antimatter is real. It is the same particles as ordinary matter with the opposite charge, and contact between them converts mass to energy, E = mc². The card uses the word for a shrinking timer. The timer is the model. The physics article is the place to read what the word means outside the race.",
    links: [
      wiki("Antimatter", "Antimatter"),
      wiki("Mass%E2%80%93energy_equivalence", "Mass–energy equivalence"),
    ],
  },
  "time-bomb": {
    what: "The body hit is 0 until a midnight blast. The card is a clock, drawn as a face with hands, and the blast is tied to that clock rather than to a bounce.",
    characteristic:
      "Clock time and bounce count run on different axes. A fighter who bounces quickly can do a lot of work before midnight. A fighter who bounces slowly may still be on the first layers when the blast arrives.",
    matters:
      "A hazard that arrives at a scheduled time is the simplest survival model: an event at a fixed time, independent of how much work is left. Competing risks are what you have when the work and the clock can each end the story. The one that happens first is the one you record.",
    links: [
      wiki("Survival_analysis", "Survival analysis"),
      wiki("Failure_rate", "Hazard and failure rate"),
    ],
  },
  "reality-bomb": {
    what: "The body hit is 0. The card summons Slammies, and those summons hit for 1 + 2n, Slammy's ramp.",
    characteristic:
      "The damage belongs to the summons, not to the body. A count of the body's bounces is the wrong denominator. You want the summons' bounce counts, each on the arithmetic ramp.",
    matters:
      "Delegating work to copies is a branching process again, with a known offspring rule. Summing 1 + 2n over each child's contacts is an arithmetic series applied to a random family tree. The expectation can be written in closed form. A single seeded run is one draw from that tree.",
    links: [
      wiki("Branching_process", "Branching process"),
      wiki("Arithmetic_progression", "Arithmetic progression"),
    ],
  },
  "tsar-bomb": {
    what: "The body hit is 0 for 90 seconds, and then a blast clears the layers. The wait is longer than Hydrogen Bomb's 60 seconds.",
    characteristic:
      "A longer fuse gives the climber more time. Moving the fuse from 60 to 90 is exactly the experiment a survival model asks for: same climber, same course, a different deadline. The winner can flip without any change to the climber's formula.",
    matters:
      "Tsar Bomba is the name of a historical nuclear test, the largest ever detonated. This card does not describe that device. It describes a 90-second deadline in a race. The historical article is background for the name. The model on this site is the deadline.",
    links: [
      wiki("Tsar_Bomba", "Tsar Bomba, the historical test"),
      wiki("Survival_analysis", "Survival analysis"),
    ],
  },
  "all-in-one": {
    what: "While a window is active, body damage is multiplied by a power that grows tenfold on each bounce. Outside the window the multiplier is 1.",
    characteristic:
      "A factor of 10 each bounce is an order of magnitude per contact. The window is the part that makes it conditional. A short active window on a thick layer can do less than a long window on a thin one. The product of 'how steep' and 'how long' is the interaction.",
    matters:
      "Multiplicative growth by tens is a logarithmic scale. Earthquakes, sound, and acidity are already reported that way, because addition on the log scale is multiplication in the original units. A windowed multiplier is a gated process: the interesting parameter is the duty cycle, the fraction of time the gate is open.",
    links: [
      wiki("Logarithmic_scale", "Logarithmic scale"),
      wiki("Duty_cycle", "Duty cycle"),
    ],
  },
  breaker: {
    what: "The ordinary body hit is 1. A critical hit instead removes half of the layer's original maximum, plus 1.",
    characteristic:
      "Most hits are small. Some hits are half a layer. The average depends on how often the crit happens. A rare large hit has a high variance: two races with the same crit chance can look very different, which is why a single upload is an anecdote.",
    matters:
      "A coin flip that usually does nothing and sometimes does a lot is a Bernoulli trial with a skewed payoff. The expected damage is the small hit times its probability plus the large hit times its probability. Variance is large when one outcome is rare and huge. That is the same shape as insurance losses.",
    links: [
      wiki("Bernoulli_trial", "Bernoulli trial"),
      wiki("Expected_value", "Expected value"),
      wiki("Variance", "Variance"),
    ],
  },
  progressive: {
    what: "A timer, not a bounce, deals the damage. It starts at 1 and climbs as the timer runs.",
    characteristic:
      "Bounces are the wrong unit. Two seconds of progress can happen with no bounce at all if the body is held in place. The chart of bounces-to-clear does not have a point for this fighter until you translate the timer into the arena's clock.",
    matters:
      "A quantity that increases with time is the integral of its rate. If the rate itself increases, the total is curved. That is uniformly accelerated motion in another costume: distance is a quadratic function of time when acceleration is constant.",
    links: [
      wiki("Equations_of_motion", "Equations of motion"),
      wiki("Integral", "Integral of a rate"),
    ],
  },
  random: {
    what: "Each hit is a seeded roll from 1 up to a maximum, and that maximum grows after every bounce. The same seed gives the same rolls again.",
    characteristic:
      "One race is one sample. Across seeds, the same matchup is a distribution. The mean of a fair roll from 1 to M is (M+1)/2, so the growing cap pulls the average up. The width of the distribution also grows, which is why a single YouTube upload can surprise you.",
    matters:
      "A seed makes a pseudorandom generator reproducible. That is what lets a lab rerun a study. The law of large numbers says the average of many races approaches the expected value. A single race does not. Reporting the seed is part of the method, the same way a paper reports its sample.",
    links: [
      wiki("Pseudorandom_number_generator", "Pseudorandom generator"),
      wiki("Law_of_large_numbers", "Law of large numbers"),
      wiki("Expected_value", "Expected value"),
    ],
  },
  lag: {
    what: "The body hit is 0. A separate glitch channel deals the damage. The body can be touching a layer and still not be the thing that hurts it.",
    characteristic:
      "Channels matter. Body, glitch, beam, and tick are different pipes. A model that adds 'the hit' without naming the pipe will assign Lag's work to the wrong event.",
    matters:
      "Latency is the delay between a cause and its effect. In networks, the damage of lag is that the state you see is stale. In statistics, a lagged variable is a predictor taken from an earlier time. Both ideas are about the clock, not about a bigger number.",
    links: [
      wiki("Latency_(engineering)", "Latency"),
      wiki("Lag_operator", "Lag in a time series"),
    ],
  },
  twins: {
    what: "Twins add 1 per bounce, and the hit is shared with a twin body. Two bodies carry one damage rule.",
    characteristic:
      "Sharing means you should not double-count. If both bodies report the same hit, adding them overstates the layer's loss. If each body contacts on its own and each applies the hit, then two streams are real. The card's wording, 'shared,' says to check which of those the arena does before fitting a rate.",
    matters:
      "Double counting is a standard error in data cleaning. In probability, identical twins in a sample are correlated observations: they are not two independent draws. Correlation reduces the effective sample size. Treating them as independent makes a study look more precise than it is.",
    links: [
      wiki("Double_counting_(fallacy)", "Double counting"),
      wiki("Correlation", "Correlation"),
    ],
  },
  scissor: {
    what: "The body hit is 0. The fighter splits, and the pieces deal the damage.",
    characteristic:
      "As with Drill's copies, the count that matters is the pieces' contacts. A body that never scores can still win through what it sheds. The barrier sum of body bounces would say this fighter never finishes.",
    matters:
      "Fragmentation is a partition of one object into many. Conservation laws say the pieces add back to the original mass and charge. Damage does not have to conserve that way: many small hits can exceed the hit the intact body would have dealt. That is a superlinear effect of breaking apart.",
    links: [
      wiki("Partition_of_a_set", "Partition"),
      wiki("Conservation_law", "Conservation laws"),
    ],
  },
  whirlwind: {
    what: "The body hit is 0. Damage comes from contacts along the line the whirlwind travels, not from a single bounce formula.",
    characteristic:
      "Path length becomes the exposure. A whirlwind that sweeps more of the layer, or sweeps more often, does more, even when a per-bounce number stays flat. Geometry is doing the work the formula refuses to do.",
    matters:
      "A line integral adds a quantity along a path. Work in physics is the line integral of force. If the 'force' here is a contact rate along the track, the total damage is that integral. A straight crossing and a swirling path of the same duration are different integrals.",
    links: [
      wiki("Line_integral", "Line integral"),
      wiki("Work_(physics)", "Work along a path"),
    ],
  },
  rgb: {
    what: "The hit is 1 plus a bonus that depends on a color mode, and the body grows. Color is a state. Growth is a size change.",
    characteristic:
      "Read the mode before you read the number. A bonus that flips with color makes the sequence of hits a schedule, not a formula of n alone. Growth, as with Grower, changes how often contact happens.",
    matters:
      "RGB is a way to specify color as three intensities, red, green, and blue, added as light. The arithmetic of adding light is linear in those intensities. The card's bonus is a game state that borrowed the name. The useful lesson is that a label ('red') can be a variable in the damage function.",
    links: [
      wiki("RGB_color_model", "RGB color model"),
      wiki("State_variable", "State variable"),
    ],
  },
  flash: {
    what: "Flash adds 1 per bounce. On a full charge, the next ramp is multiplied by 5.",
    characteristic:
      "Most bounces are ordinary. The charged one is a spike. Averages hide spikes. A course that ends just before a charge looks mild. A course that includes it jumps. The interval between charges is the period of that spike.",
    matters:
      "A multiplier that usually equals 1 and sometimes equals 5 is a mixture. The mean is a weighted average of the two regimes. The variance stays high if the spike is rare. That is the same warning as Breaker's crit: do not summarize a spiked process by one race.",
    links: [
      wiki("Mixture_distribution", "Mixture distribution"),
      wiki("Expected_value", "Expected value"),
    ],
  },
  batman: {
    what: "The body adds 1 per bounce, and batarangs add extra hits. The picture is lettered NIGHT CAPE. It is an original design for this roster, not a copy of a film costume.",
    characteristic:
      "The extra projectiles are on their own timer. Body bounces and projectile hits are two series. Adding only the +1 ramp describes the body and misses the rangs. A short course may be decided by whichever stream lands first.",
    matters:
      "Several independent streams of events, added together, are a superposition of point processes. If each stream is Poisson, the sum is Poisson with the rates added. That theorem is why a total hit rate can be estimated from the pieces. It fails if the streams suppress each other.",
    links: [
      wiki("Poisson_point_process", "Poisson point process"),
      wiki("Superposition_principle", "Superposition"),
    ],
  },
  boomerang: {
    what: "The projectile's damage equals the bounce count. The body is the launcher. The returning weapon is the hit.",
    characteristic:
      "A throw that comes back can hit twice on one launch. Counting launches undercounts if you forget the return. The damage number tracks the bounce count, so later throws are individually heavier, which is a ramp carried by an object rather than by the body.",
    matters:
      "A returning path is a closed trajectory. In mechanics, a boomerang's lift and spin make a curved flight. The card does not simulate that airflow. It uses the idea of a projectile whose path is not a straight line, so one action can produce more than one contact.",
    links: [
      wiki("Boomerang", "Boomerang"),
      wiki("Trajectory", "Trajectory"),
    ],
  },
  magnet: {
    what: "Magnet adds 1 per bounce and pulls nearby orbs. The pull changes where everyone else is, which changes who hits the layer next.",
    characteristic:
      "This is an interaction, not a bigger personal hit. A magnet can speed an ally into the layer or drag an opponent off a good line. The +1 formula will not show that. The seeded arena will.",
    matters:
      "A magnet produces a field, and a force appears on other magnetic things in that field. Newton's third law says the pull is mutual. In a many-body simulation, forces that depend on distance couple the equations, so you cannot solve one orb's path first and the others after.",
    links: [
      wiki("Magnetic_field", "Magnetic field"),
      wiki("Newton%27s_laws_of_motion", "Newton's laws"),
      wiki("N-body_problem", "The n-body problem"),
    ],
  },
  mines: {
    what: "Splodey throws bombs. A bomb deals damage equal to the bounce count at the throw.",
    characteristic:
      "The hit is detached from the body and delayed until the bomb lands. Bounce count at the throw, not at the landing, is the number on the card. A fast climber can throw several bombs before the first one lands.",
    matters:
      "A delayed effect is a lag. The damage observed now was decided by the state at an earlier time. Time-series models write that with a lag operator. If you regress the landing on the current bounce count, you are using the wrong timestamp.",
    links: [
      wiki("Lag_operator", "Lag operator"),
      wiki("Time_series", "Time series"),
    ],
  },
  gravity: {
    what: "Gravity adds 1 per bounce, and a gravity level rises. The level is a strength of pull that accumulates.",
    characteristic:
      "The +1 is the familiar ramp. The level is a second state variable. Pull changes trajectories, so it changes contact rates for everyone in range. As with Magnet, the personal damage formula is the small part of the story.",
    matters:
      "Newtonian gravity is proportional to mass and inversely proportional to the square of distance. An inverse-square law is steep nearby and gentle far away. A 'level' that rises is a game simplification of a field strength. The inverse-square article is the deeper version.",
    links: [
      wiki("Newton%27s_law_of_universal_gravitation", "Newton's law of gravitation"),
      wiki("Inverse-square_law", "Inverse-square law"),
    ],
  },
  jackpot: {
    what: "Jackpot adds 1 per bounce, plus whatever the slot machine rolls. The roll is an extra random term on top of the ramp.",
    characteristic:
      "The ramp is predictable. The slot is a distribution. Over many races the average slot contribution approaches its expected value, and any one video can land in the tail. A leaderboard that treats one jackpot as the fighter's strength is fitting noise.",
    matters:
      "A slot outcome is a discrete random variable. The expected value is the sum of each prize times its probability. Variance tells you how wild the machine is. The house edge is what remains when the expected payout is below the stake. Here the 'stake' is a bounce, and the prize is extra damage.",
    links: [
      wiki("Expected_value", "Expected value"),
      wiki("Variance", "Variance"),
    ],
  },
  ricochet: {
    what: "The body adds 1 per bounce. Every third bounce fires a shot, and that shot doubles when it comes off a wall.",
    characteristic:
      "The period is 3: two quiet bounces, one shot. Doubling on a bounce off a wall means the arena's geometry is inside the damage. A wide room and a narrow room are different machines for the same fighter. The barrier sum, which ignores walls, cannot see the doubling.",
    matters:
      "A ricochet is a reflection. The angle in equals the angle out only in the ideal case. Coefficient of restitution says how much speed survives the bounce. Doubling the damage on a reflection is a game rule, not an energy law. Real reflections lose energy unless something adds it back.",
    links: [
      wiki("Reflection_(physics)", "Reflection"),
      wiki("Coefficient_of_restitution", "Coefficient of restitution"),
    ],
  },
  commander: {
    what: "Commander adds 1 per bounce and fields drones that drop bombs and fire missiles. The body is a carrier. The drones are the extra contact streams.",
    characteristic:
      "Count the drones' clocks separately from the body's bounces. A missile on a cooldown can outpace a body that has to travel back to the layer. This is the same two-stream lesson as Batman and Drill, with a different timer.",
    matters:
      "A carrier plus independent agents is a hierarchical model. The parent's state sets the number of agents. Each agent has its own rate. The total rate is a sum, which is why hierarchical counts often end up Poisson or negative binomial when the number of agents is itself random.",
    links: [
      wiki("Hierarchical_database_model", "Hierarchy, the organizing idea"),
      wiki("Poisson_distribution", "Poisson distribution"),
    ],
  },
  shrapnel: {
    what: "Shrapnel adds 1 per bounce. When a layer breaks, it throws fragments that deal further damage.",
    characteristic:
      "The fragments are a bonus that fires on a layer transition, not on a bounce. Fighters who break layers sooner see that bonus sooner. A model that ignores the moment a layer dies will miss a burst right at the boundary.",
    matters:
      "Fragmentation distributes one event's energy across many pieces. In statistics, a compound distribution is a sum of a random number of random sizes. The layer break is the event that draws the number of fragments. The total extra damage is the compound sum.",
    links: [
      wiki("Compound_probability_distribution", "Compound distribution"),
      wiki("Fragmentation_(weaponry)", "Fragmentation, the physical picture"),
    ],
  },
  roulette: {
    what: "Absorber copies another orb's ability on a timer, then deals damage by that ability's rule. Between copies, its own body is not the interesting part. The stable id in the data is roulette. The name on the card is Absorber.",
    characteristic:
      "The fighter's distribution is a mixture of whoever is in the match. A roster of steep math orbs makes Absorber steep. A roster of flat hits makes it flat. Ranking Absorber across videos with different casts mixes different random variables.",
    matters:
      "Absorption and mimicry are mixture models: the law of the outcome depends on a hidden label, here the copied orb. The marginal distribution averages over the labels. Conditioning on the label gives a simpler law. The race record should include the copied id, or the average is not interpretable.",
    links: [
      wiki("Mixture_model", "Mixture model"),
      wiki("Conditional_probability", "Conditional probability"),
    ],
  },
  architect: {
    what: "Architect adds 1 per bounce and also builds things. The build has its own progress, and what it builds contributes damage beyond the +1.",
    characteristic:
      "A build is a project with a duration. Interrupting it wastes the partial progress. Completed builds are the ones that enter the damage sum. This is a race between a construction timer and the layer's remaining health.",
    matters:
      "Progress over time, with a payoff only at completion, is a deadline problem in operations research. The expected value of a project equals the payoff times the chance it finishes, minus the wasted effort when it does not. Partial credit changes that arithmetic. This card pays on completion.",
    links: [
      wiki("Operations_research", "Operations research"),
      wiki("Expected_value", "Expected value"),
    ],
  },
  sawblade: {
    what: "Sawblade adds 1 per bounce and fires saw shots on their own count.",
    characteristic:
      "Another two-stream fighter. The body's ramp is easy. The shots are a second rate. If the shots scale with the bounce count, later shots dominate, and the early race understates the fighter.",
    matters:
      "Periodic firing is a pulse train. Fourier analysis treats a pulse train as a stack of pure frequencies, which is more than this card needs. The piece worth keeping: a regular extra hit every k seconds adds a term proportional to time, on top of whatever the body does per bounce.",
    links: [
      wiki("Pulse_wave", "Pulse train"),
      wiki("Rate_(mathematics)", "Rate"),
    ],
  },
  meteor: {
    what: "The body adds 1 per bounce. Meteors fall with damage that scales off that growing hit.",
    characteristic:
      "The meteors are a multiplier on an already increasing number, so the extra stream steepens as the ramp steepens. Early meteors are small. Later ones carry the current bounce's weight. Timing the falls is part of the result.",
    matters:
      "A meteor in astronomy is the light from a grain hitting the atmosphere. The word on the card means a falling strike whose size tracks another variable. In regression, that is an interaction: the extra damage is a product of 'a meteor happened' and 'the ramp is currently this big.'",
    links: [
      wiki("Meteoroid", "Meteoroid"),
      wiki("Interaction_(statistics)", "Interaction"),
    ],
  },
  "black-hole": {
    what: "Hits stay at 1 until a singularity returns the total it has drained. Small hits, then a repayment of what was held back.",
    characteristic:
      "The average can look ordinary while the path is a long quiet stretch and a spike. A layer may survive the 1-point hits and then vanish when the drained total comes back. Course length decides whether the spike arrives in time.",
    matters:
      "A black hole in physics is a region where gravity is strong enough that light does not leave. Hawking's later work argued they are not perfectly black. The card is not that object. It is a reservoir model: store, then release. Reservoirs, capacitors, and integrals are the same pattern. The outflow can exceed any of the inflows.",
    links: [
      wiki("Black_hole", "Black hole"),
      wiki("Capacitor", "A reservoir you can measure"),
    ],
  },
  godzilla: {
    what: "The body adds 1 per bounce, and stomp, swipe, and a beam add more while they are firing. The picture is lettered KAIJU. It is an original animal design for this roster.",
    characteristic:
      "Three extra moves plus a body ramp. Each move has its own duration. A beam that fires for a long window can matter more than many +1 bounces. The barrier sum of body contacts is a lower bound, not the race.",
    matters:
      "Several attack modes with their own clocks are competing risks inside one fighter: at each moment, one of the modes is what is actually connecting. A multi-state model gives each mode a rate. The total damage is the sum of rate times size over the time spent in each mode.",
    links: [
      wiki("Competing_risks", "Competing risks"),
      wiki("Multi-state_model", "Multi-state model"),
    ],
  },
  charger: {
    what: "Charger adds 1 per bounce, and the time between charges gets shorter, down toward a minimum.",
    characteristic:
      "A shrinking interval is an increasing frequency. Damage per charge can stay at the +1 family while damage per second rises. There is a floor on the interval, so the frequency approaches a limit instead of becoming infinite.",
    matters:
      "A process whose rate increases and then saturates is a bounded growth curve, the same shape as a charging capacitor or a learning curve with a ceiling. The differential equation dx/dt = r (L − x) relaxes toward the limit L. The card's minimum interval is that limit.",
    links: [
      wiki("Exponential_decay", "Relaxation toward a limit"),
      wiki("RC_circuit", "A charge that approaches a ceiling"),
    ],
  },
  bouncer: {
    what: "Bouncer adds 1 per bounce and releases mini orbs that score their own hits.",
    characteristic:
      "The minis are offspring with their own contact process. If they use a simpler hit than the parent, the parent's formula still does not describe the team. Add the streams, or simulate them.",
    matters:
      "A parent plus children is a branching process with two types. Multi-type branching processes track a vector of counts. The growth rate is the largest eigenvalue of the mean matrix. That is the linear-algebra version of 'how fast does this family tree expand.'",
    links: [
      wiki("Branching_process", "Branching process"),
      wiki("Eigenvalues_and_eigenvectors", "Eigenvalues"),
    ],
  },
  "blue-sun": {
    what: "Blue Sun adds 1 per bounce and fires lasers that touch the layer.",
    characteristic:
      "The lasers are a line attack. A line can cross a layer even when the body is elsewhere, so the contact rate is not the body's bounce rate. Beam duration times a tick rate is the extra exposure.",
    matters:
      "A line of sight is a geometric condition: the segment from source to target meets the layer. Computational geometry spends its time on exactly these tests. Once the test passes, the damage is back to a rate times time.",
    links: [
      wiki("Line_segment", "Line segment"),
      wiki("Collision_detection", "Collision detection"),
    ],
  },
  "purple-sun": {
    what: "Beams deal damage according to a power level. The body does not take the usual +1 ramp.",
    characteristic:
      "Ignoring the body ramp means a bounce-count chart of +1 fighters is the wrong comparison. Power level is the state. If the level rises on a timer, the beam is a step function of time.",
    matters:
      "Power in physics is energy per time. A higher power for the same duration delivers more energy. The card's 'power level' is a discrete version of that dial. Step functions are how engineers approximate a knob that clicks rather than turns smoothly.",
    links: [
      wiki("Power_(physics)", "Power"),
      wiki("Step_function", "Step function"),
    ],
  },
  "phase-three-sun": {
    what: "The body hit is 0. Damage is a phase-three beam. The sun cards are a family of beams at different phases, not a body that ramps.",
    characteristic:
      "Phase here means a stage in a cycle. A beam that exists only in one phase is off for the rest of the cycle. Duty cycle, the fraction of the cycle spent on, multiplies the average damage.",
    matters:
      "Phases of matter, and phases of a cycle, are different uses of one English word. This card means a stage in a sequence. The three-body problem and stellar evolution also talk about phases of a star's life. The race rule is narrower: a beam with a stage, and a body that contributes 0.",
    links: [
      wiki("Duty_cycle", "Duty cycle"),
      wiki("Stellar_evolution", "Phases of a star, for the name"),
    ],
  },
  "phase-two-sun": {
    what: "The body hit is 0. Damage is the phase-two beam, a different stage from The Sun's phase-three beam.",
    characteristic:
      "Compare the two suns by the beam's size and by how long that phase lasts, not by body bounces. If phase two is shorter and stronger, the better course depends on whether the fight is over inside that window.",
    matters:
      "A phase shift moves a waveform along the time axis without changing its shape. If two beams are the same shape offset in time, their totals match over a long window and differ over a short one. That is another version of the site's main lesson: the horizon you measure on changes the winner.",
    links: [
      wiki("Phase_(waves)", "Phase of a wave"),
      wiki("Duty_cycle", "Duty cycle"),
    ],
  },
  snake: {
    what: "The body hit is 0. A tail that lies on the ground deals the damage.",
    characteristic:
      "Contact is distributed along a length. A longer grounded tail is a longer exposure. Curling the tail off the layer turns the damage off without changing any bounce formula, because the formula was never on the body.",
    matters:
      "A measure along a curve is a line integral again. Biologists who study a real snake's strike are measuring a different thing, a fast extension. The card is about a region that persists on the ground, which is closer to a hazard area than to a single bite.",
    links: [
      wiki("Line_integral", "Line integral"),
      wiki("Measure_(mathematics)", "Measure, the size of a set"),
    ],
  },
  vampire: {
    what: "A percent of the hit is stolen, and that percent rises after every bounce. The steal is taken out of the hit rather than added on top as a separate rule.",
    characteristic:
      "If steal is a share of damage that would have happened anyway, it rearranges who receives it and may not increase the total. If it is an extra share, it is a growing multiplier. The card says the percent is taken from the hit. Read a replay before treating it as free damage.",
    matters:
      "A percentage skim is a tax. The cumulative take from a growing base is a series. In ecology, a parasite that removes a fraction of a host's gain is modeled as a reduction in the host's growth rate. Raising the fraction each step is a time-varying rate, which usually has no single closed form until you write the product.",
    links: [
      wiki("Percentage", "Percentage"),
      wiki("Parasitism", "Parasitism"),
    ],
  },
  turret: {
    what: "Turret adds 1 per bounce and fires shots from a turret on its own timer.",
    characteristic:
      "The turret does not need the body to be in contact. Its rate is a property of the emplacement. Body travel and turret fire are independent clocks, and the faster clock dominates a long fight.",
    matters:
      "Two independent clocks are two point processes. Independence is a strong assumption: it means knowing one clock's recent clicks does not help you predict the other's. When it holds, variances add. When the turret only fires after a bounce, the clocks are dependent and the variances do not add that way.",
    links: [
      wiki("Independence_(probability_theory)", "Independence"),
      wiki("Poisson_point_process", "Poisson point process"),
    ],
  },
  leech: {
    what: "Leech adds 1 per bounce. A leech level follows how long it has held, in the same family of rules as Sticky's hold.",
    characteristic:
      "The hold duration is the hidden variable. A brief touch stays near the +1 ramp. A long attach lets the level climb, so the same fighter is mild or severe depending on whether the arena lets it stay stuck.",
    matters:
      "State that accumulates during a condition and resets when the condition ends is an integrator with a gate. Capacitors, exposure, and 'time on task' are all that circuit. The output is the integral of the input over the intervals when the gate was open.",
    links: [
      wiki("Integral", "Integral"),
      wiki("Leech", "Leech, the animal the name comes from"),
    ],
  },
  crusher: {
    what: "Crusher adds 1 per bounce and adds more as its weight rises.",
    characteristic:
      "Weight is a state that makes later hits larger. If weight rises with time or with bounces, the hit is a ramp of a ramp, which bends upward. A constant weight would only shift the +1 line.",
    matters:
      "Weight is the force of gravity on a mass. Pressure is that force spread over an area. A rising weight on a fixed area is a rising pressure. In the card, 'weight' is the name of a multiplier that accumulates. The physical articles explain the words. The race uses them as a growing bonus.",
    links: [
      wiki("Weight", "Weight"),
      wiki("Pressure", "Pressure"),
    ],
  },
  berserker: {
    what: "Berserker adds 1 per bounce, and it adds more while it is trailing by 10% of the layer.",
    characteristic:
      "The bonus is conditional on the score. A fighter who is ahead does not get it. A fighter who is behind does. That feedback can stabilize a race, pulling a loser back, or it can make the lead oscillate if both sides have a similar rule.",
    matters:
      "A bonus that turns on below a threshold is a control law, like a thermostat. Feedback control is the engineering subject built on that idea. In sports models, a comeback bonus is state-dependent. The probability of winning is then not a fixed strength. It is a function of the current deficit.",
    links: [
      wiki("Control_theory", "Control theory"),
      wiki("Feedback", "Feedback"),
    ],
  },
  reactor: {
    what: "Reactor adds 1 per bounce and releases a charged blast. The charge is stored, then spent.",
    characteristic:
      "Storage and release, like Black Hole's quieter cousin. The blast's size depends on how long the reactor charged. A fight that ends during the charge misses the blast entirely.",
    matters:
      "A nuclear reactor, unlike a weapon, is a controlled chain reaction used to boil water and turn turbines. The card borrows the idea of a store that later discharges. Capacitors and flywheels are the clean mechanical versions: energy in, energy out, with a loss along the way.",
    links: [
      wiki("Nuclear_reactor", "Nuclear reactor"),
      wiki("Capacitor", "Capacitor"),
    ],
  },
  parasite: {
    what: "Parasite adds 1 per bounce, and each attached parasite adds further damage.",
    characteristic:
      "The count of attachments is the multiplier. A parasite that never sticks is just the +1 ramp. A parasite that stacks is a growing team sitting on one host. Duration of each attachment decides whether the stack pays.",
    matters:
      "In epidemiology, a parasite load is a count per host. The SIR models and their cousins track how that count spreads between hosts. On this card the 'hosts' are layers or orbs the parasite grips. The load is a state variable, and damage is a function of the load.",
    links: [
      wiki("Parasitism", "Parasitism"),
      wiki("Compartmental_models_in_epidemiology", "Compartmental models"),
    ],
  },
  draftmaster: {
    what: "Draftmaster adds 1 per bounce and fires drafted bullets. The bullets are an extra stream on top of the ramp.",
    characteristic:
      "Same two-clock pattern as Turret and Commander. If the gun's cooldown shortens with bounces, the bullet stream steepens while the body ramp stays linear. Late in a long course the bullets are the race.",
    matters:
      "A draft in engineering is a drawn plan. A draft in sport is a selection from a pool. Either reading fits a card that 'drafts' its shots. The measurable part is a renewal process: after each shot, a cooldown draws a wait, then the next shot happens. The rate is the reciprocal of the mean wait.",
    links: [
      wiki("Renewal_theory", "Renewal theory"),
      wiki("Rate_(mathematics)", "Rate"),
    ],
  },
  needle: {
    what: "Needle pierces. The body does not take the usual +1 ramp. The hit is the pierce itself.",
    characteristic:
      "Turning off the ramp means you cannot compare Needle with Slammy on the bounce chart of +1 fighters. Pierce, as with Piercer, can charge several layers in one pass. The value of that depends on how the layers are stacked.",
    matters:
      "A needle in manufacturing is a tool that concentrates force on a small area, raising pressure. Pressure is force over area. The card's pierce is the game version: the interaction is with multiple layers along a line, which puts it back in the company of stopping power and track length.",
    links: [
      wiki("Pressure", "Pressure"),
      wiki("Stopping_power_(particle_radiation)", "Stopping power"),
    ],
  },
  multiplier: {
    what: "The hit is scaled by a multiplier instead of taking the usual +1 each bounce. The growth is multiplicative.",
    characteristic:
      "Adding 1 is arithmetic. Multiplying is geometric. A multiplier that stays above 1 reaches large hits in few steps and makes the +1 ramp irrelevant. A multiplier that can drop below 1 can also stall.",
    matters:
      "Geometric sequences are the discrete form of exponential growth. The log of a geometric sequence is arithmetic, which is why scientists plot growth on a log axis to see a straight line. If the line bends, the growth is not a constant multiplier.",
    links: [
      wiki("Geometric_progression", "Geometric progression"),
      wiki("Logarithmic_scale", "Logarithmic scale"),
    ],
  },
  sniper: {
    what: "Damage is the shot, not a body ramp. Bounces shorten the cooldown before the next shot.",
    characteristic:
      "Accuracy is not in the formula. The formula is a hit size and a shrinking wait. More bounces mean more frequent shots. A fighter who bounces in place charges the gun faster than one that spends time traveling, which is an interaction between movement and fire rate.",
    matters:
      "A cooldown is a refractory period, the same word physiology uses for a nerve that cannot fire again yet. Shortening it raises the maximum firing rate. The maximum rate is the reciprocal of the cooldown. That one-line conversion is worth memorizing.",
    links: [
      wiki("Refractory_period_(physiology)", "Refractory period"),
      wiki("Rate_(mathematics)", "Rate as a reciprocal of a wait"),
    ],
  },
  snowball: {
    what: "Snowball grows, and the hit is not the plain +1 ramp. Size and damage both accumulate.",
    characteristic:
      "A growing body plus a growing hit is positive feedback: the current size makes the next gain larger. Positive feedback runs away until a ceiling, a collision, or the end of the layer stops it. Classic Snowball is a different card, a frost trail in the last-team-standing mode.",
    matters:
      "The snowball effect is the everyday name for compounding. In differential equations, dy/dt = ky is the continuous version, with solution y = y₀ e^{kt}. When the data curve upward on a linear axis and straighten on a log axis, this is the family you are looking at.",
    links: [
      wiki("Snowball_effect", "Snowball effect"),
      wiki("Exponential_growth", "Exponential growth"),
    ],
  },
  countdown: {
    what: "A blast multiplier applies when the countdown lands. Until that moment the ordinary hit is not the point of the card.",
    characteristic:
      "The race has a spike at a scheduled bounce or time. Finishing before the spike means the multiplier never matters. Lasting past it means one event can outweigh the rest of the fight. Report whether the countdown completed.",
    matters:
      "A point mass of probability at one time is a deterministic event inside an otherwise random race. Survival curves jump at that time. In reliability, a planned inspection or a warranty deadline has the same shape: nothing, and then a known event.",
    links: [
      wiki("Survival_function", "Survival function"),
      wiki("Dirac_delta_function", "A spike at one instant"),
    ],
  },
  copycat: {
    what: "The body starts at 0. After it copies another orb, it uses that orb's damage. Before the copy, it is idle.",
    characteristic:
      "Like Professor and Absorber, the identity is borrowed. The time spent at 0 is a delay. The value of the copy depends on the cast. A copy of a fuse is still a fuse. A copy of Fibonacci becomes Fibonacci from that moment's bounce count.",
    matters:
      "Imitation is a covariate shift: the distribution of outcomes changes when the thing you copy changes. Models that assume one fixed strength cannot represent a fighter whose strength is a pointer to someone else. Store the pointer.",
    links: [
      wiki("Conditional_probability", "Conditional probability"),
      wiki("Mixture_model", "Mixture model"),
    ],
  },
  critical: {
    what: "A critical multiplier applies to the hit, and the card is off the plain +1 ramp. The ordinary bounce growth is not the rule. The multiplier is.",
    characteristic:
      "If the crit is random, the race is a distribution. If it is on a schedule, it is a spike train. Either way, one video is one draw. The mean across seeds is the number a ranking would need, and this site does not pretend a single upload is that mean.",
    matters:
      "Critical points in mathematics are where a derivative is zero, a peak or a valley. The card uses the gaming sense: a rare heavier hit. Those are different ideas that share a word. The gaming one is a mixture distribution. The calculus one is the start of optimization.",
    links: [
      wiki("Mixture_distribution", "Mixture distribution"),
      wiki("Critical_point_(mathematics)", "Critical point, the other meaning"),
    ],
  },
  grappler: {
    what: "The body starts at 0. A grapple supplies the hit, so the fighter does nothing until the grapple connects.",
    characteristic:
      "Connection is a precondition. Range, timing, and whether the target is still there decide if the formula ever runs. A barrier sum that assumes a contact on a schedule will overstate a grappler who spends the race whiffing.",
    matters:
      "A condition that must hold before a process starts is a hurdle model: one probability of clearing the hurdle, then a separate distribution for the size. Hurdle models are used for counts that are often zero. Grappler's damage is often zero for exactly that reason.",
    links: [
      wiki("Zero-inflated_model", "Extra zeros"),
      wiki("Conditional_probability", "Conditional probability"),
    ],
  },
  artists: {
    what: "The race Artist starts at 0 body damage. Painting deals the damage, and that damage rises when scaling is on. The stable id is artists. Classic Artist, a different card, summons creatures instead.",
    characteristic:
      "A toggle for scaling means two regimes. With scaling off, paint is a flat effect. With scaling on, it grows. Comparing videos without noting the toggle mixes the regimes, the same mistake as mixing short courses with long ones.",
    matters:
      "A switch that changes the growth rate is an interaction between a setting and time. In a regression, that is a product term: damage depends on time, on the switch, and on time times the switch. Leaving the product out forces one slope onto both settings.",
    links: [
      wiki("Interaction_(statistics)", "Interaction"),
      wiki("Linear_regression", "Linear regression"),
    ],
  },
  pancake: {
    what: "Pancake adds 1 per bounce. Syrup and butter patches sit on the layer and tick.",
    characteristic:
      "The patches are a surface effect with a duration. A layer can keep taking ticks after the body has bounced away. Area covered times tick rate times duration is the extra damage.",
    matters:
      "A patch that persists is a residence time. In environmental science, a contaminant on a surface delivers a dose equal to concentration times the time it stays. The same product, rate times time, is the integral hiding inside Sticky, Poison, and this card.",
    links: [
      wiki("Residence_time", "Residence time"),
      wiki("Integral", "Integral"),
    ],
  },
  tree: {
    what: "Tree adds 1 per bounce. After a charge, roots drain every layer, not just the current one.",
    characteristic:
      "Draining every layer is a global effect. Fighters who must chew the front layer never touch the back of the stack until the front is gone. Roots skip that order. The charge time is the wait before the skip happens.",
    matters:
      "A delay and then a system-wide effect is a pipeline: fill, then discharge everywhere. In graph theory, a tree is a connected graph with no cycles, which is also where the name comes from. The card's roots are closer to a broadcast: one event, many targets.",
    links: [
      wiki("Tree_(graph_theory)", "Tree, in graph theory"),
      wiki("Broadcasting_(networking)", "Broadcast"),
    ],
  },
  rain: {
    what: "The body hit is 0. Rain itself hits the layer. The body can miss and the layer can still be taking damage.",
    characteristic:
      "Weather on the layer is an area rate. It does not care about the body's bounce count. A barrier sum in bounces has nothing to add up. A rate times the fight's duration does.",
    matters:
      "Rainfall is measured as a depth over an area over a time, a flux. Flux is how much crosses a surface per time. Integrating flux over the fight gives the total. That sentence is the whole model, and it is the same sentence as exposure, ticks, and beams.",
    links: [
      wiki("Flux", "Flux"),
      wiki("Precipitation", "Precipitation"),
    ],
  },
  hacker: {
    what: "The body hit is 0. Each hack applies one seeded outcome. The menu of outcomes is the rule. The seed picks which one happens.",
    characteristic:
      "Same seed, same hacks, same race. A different seed is a different distribution, not a contradiction. Report the seed with the result. Averaging unlike outcomes into one 'Hacker strength' hides the menu.",
    matters:
      "A seeded choice from a menu is a random variable with a finite support. Information theory would measure the menu by its entropy: more equally likely outcomes means more uncertainty. A hack that is usually nothing and rarely enormous has low entropy and high variance. Both numbers belong in the description.",
    links: [
      wiki("Random_seed", "Random seed"),
      wiki("Entropy_(information_theory)", "Entropy"),
    ],
  },
  miner: {
    what: "The body hit is 0. A drill eats the current layer by progress, a fraction completed rather than a hit size.",
    characteristic:
      "Progress is a bar from 0 to 1. Damage per second depends on how fast the bar fills, not on a bounce formula. A thicker layer is a longer bar if progress is measured in health, or the same bar if progress is measured in fraction. Those two readings disagree, so the implementation decides.",
    matters:
      "Completion time for a job is the workload divided by the speed. That quotient is the start of queueing theory. If the drill's speed is constant, time is proportional to the layer's health. If the speed rises as the drill 'warms up,' time is the integral of 1/speed.",
    links: [
      wiki("Queueing_theory", "Queueing theory"),
      wiki("Work_(physics)", "Work and the time to finish it"),
    ],
  },
  sword: {
    what: "Classic mode: the last living team wins. A swing deals 5. An extended poke deals 3.",
    characteristic:
      "Two moves, two sizes. The swing is the heavier, shorter commitment. The poke reaches. Which one lands more often is a question about spacing, and spacing is not in the damage numbers. Both numbers are flat. Neither grows with time.",
    matters:
      "Flat damage means the total is the count of swings times 5 plus the count of pokes times 3. That is a linear combination. The fight's randomness sits entirely in the counts. A Poisson count of swings makes the total damage a scaled Poisson, whose variance equals its mean times 25 for the swing part.",
    links: [
      wiki("Linear_combination", "Linear combination"),
      wiki("Poisson_distribution", "Poisson distribution"),
    ],
  },
  tripwire: {
    what: `${CLASSIC} Tripwire leaves wires on the walls. A wire deals 1 damage per second.`,
    characteristic:
      "One per second is a rate of 1. Standing in a wire for 10 seconds is 10 damage, with no roll. Coverage and duration are the whole model. Extra wires add rates if a fighter can touch more than one.",
    matters:
      "A constant hazard rate is the exponential distribution's fingerprint: the chance of having survived an extra second does not depend on how long you have already survived. Memorylessness is that property. It is a good model for a wire and a bad model for wear and tear.",
    links: [
      wiki("Exponential_distribution", "Exponential distribution"),
      wiki("Memorylessness", "Memorylessness"),
    ],
  },
  necromancer: {
    what: `${CLASSIC} Two soldiers at 1 health each, and arrows that deal 3.`,
    characteristic:
      "The soldiers are extra bodies with almost no health. They add targets and they add arrows. An arrow's 3 is flat. The value of the soldiers is the extra firing rate and the extra bodies the opponent has to answer.",
    matters:
      "Summoning a fixed number of units is a deterministic branch, not a random one. The total arrow damage is 3 times the number of arrows that land. If each soldier fires as a Poisson process, two soldiers are a Poisson process with twice the rate, but only while both are alive. The rate drops when one dies.",
    links: [
      wiki("Poisson_point_process", "Poisson point process"),
      wiki("Rate_(mathematics)", "Rate"),
    ],
  },
  spikey: {
    what: `${CLASSIC} Spikes on the walls deal 3 damage when they connect. They stay in place.`,
    characteristic:
      "A permanent hazard is a region of the arena, not a cooldown. Fighters who bounce off walls meet it. Fighters who stay in the middle do not. Arena size and bounce angle decide the contact rate.",
    matters:
      "A spatial hazard is a field over the arena. The damage a path receives is the line integral of that field along the path. Two paths of equal length can differ if one hugs the wall and one does not. Geometry again, in front of the number 3.",
    links: [
      wiki("Scalar_field", "A value at every point"),
      wiki("Line_integral", "Line integral"),
    ],
  },
  virus: {
    what: `${CLASSIC} Contact damage stacks: 1, then 2, then onward, inside 5-second windows.`,
    characteristic:
      "Hits inside the window add a step. Waiting out the window can reset the stack. Bursting contacts is stronger than spreading the same contacts out. The clock and the bounce count interact.",
    matters:
      "A stack that grows when events cluster is a burst model. Network traffic and neural firing both come in bursts. The 5-second window is a bin. Counts per bin are how a point process gets turned into a time series a spreadsheet can hold.",
    links: [
      wiki("Burst_transmission", "Bursts"),
      wiki("Time_series", "Time series"),
    ],
  },
  cobwebs: {
    what: `${CLASSIC} Webs deal 1 damage per second while a fighter is in them.`,
    characteristic:
      "Same rate mathematics as Tripwire, different placement. A web in the center catches a different set of paths from a wire on the wall. One per second is the easy part. Where it sits is the model.",
    matters:
      "Exposure equals intensity times time in the region. If a fighter's motion is a random walk, the time spent in a region has a known family of distributions. Occupancy time is the name. The damage is 1 times that occupancy.",
    links: [
      wiki("Random_walk", "Random walk"),
      wiki("Residence_time", "Residence time"),
    ],
  },
  apple: {
    what: `${CLASSIC} Every 2 seconds the owner gains 3 health and the opponent loses 5.`,
    characteristic:
      "Healing and damage on one clock. Net, the opponent is down 5 and the owner is up 3, every 2 seconds, if both effects land. The fight length in seconds, divided by 2, is the number of ticks. Bounce count is irrelevant.",
    matters:
      "Two simultaneous flows are a system of rates. The difference, 5 minus the opponent's healing if any, is the net rate. Population models write birth minus death the same way. A constant net rate gives a straight line in time. The fight ends when one side hits zero, which is a first-passage time.",
    links: [
      wiki("First-hitting-time_model", "First-passage time"),
      wiki("Rate_(mathematics)", "Rate"),
    ],
  },
  absorber: {
    what: `${CLASSIC} Absorbs one seeded opponent ability. The race-mode Absorber is a different card, id roulette, and it copies on a repeating timer. This one takes one seeded ability.`,
    characteristic:
      "One draw from the opponent's kit. The seed picks which ability. Across seeds, this fighter's behavior is a sample of the metagame it was placed in. A fixed strength does not exist apart from the opponent.",
    matters:
      "Sampling one item from a list is a discrete uniform draw if the list is fair, or a weighted draw if it is not. The resulting ability is a random effect. Mixed models are the statistical tool for 'an outcome that depends on which group you landed in.'",
    links: [
      wiki("Discrete_uniform_distribution", "Discrete uniform distribution"),
      wiki("Random_effects_model", "Random effects"),
    ],
  },
  trapper: {
    what: `${CLASSIC} Cowboy throws three lassos. A lasso deals 4 damage per second while it holds.`,
    characteristic:
      "Three holds, each at 4 per second. If they overlap on one target, the rates add. If a lasso misses, that stream is zero. The interesting random variable is how many of the three connect, and how long each hold lasts.",
    matters:
      "A count of successes in a fixed number of tries is a binomial random variable, when each try has the same chance and they do not interfere. Overlapping lassos can interfere, which breaks the binomial assumption. Checking independence is the scientific habit. The 4 per second is the easy arithmetic after that.",
    links: [
      wiki("Binomial_distribution", "Binomial distribution"),
      wiki("Independence_(probability_theory)", "Independence"),
    ],
  },
  "hive-ball": {
    what: `${CLASSIC} Bees deal 3 per hit. The ball is a source of many small identical hits.`,
    characteristic:
      "Total damage is 3 times the number of bee hits. The randomness is the count. A swarm that keeps producing bees is a rate. A swarm with a fixed number of bees is a sum of their individual contacts.",
    matters:
      "Many small identical contributions are why the normal distribution appears: the central limit theorem says a sum of independent pieces, under mild conditions, looks bell-shaped. Three damage times a roughly normal count is still roughly normal. One huge crit would not be.",
    links: [
      wiki("Central_limit_theorem", "Central limit theorem"),
      wiki("Poisson_distribution", "Poisson distribution"),
    ],
  },
  zeus: {
    what: `${CLASSIC} Lightning deals 10 damage per second while it is on the target.`,
    characteristic:
      "Ten per second is a high constant rate. Duration is the variable. A one-second strike is 10. A five-second strike is 50. There is no growth inside the strike. Lengthening it is the only way it scales.",
    matters:
      "Real lightning is a brief, enormous current. The card is a steady 10 per second, which is a different shape: a rectangular pulse. Energy in a rectangular pulse is power times duration. That product is the model, and it is exact when the rate does not flicker.",
    links: [
      wiki("Lightning", "Lightning"),
      wiki("Power_(physics)", "Power"),
    ],
  },
  "glass-ball": {
    what: `${CLASSIC} The ball breaks into 3 to 5 shards. Each shard deals 2.`,
    characteristic:
      "The total is 2 times the number of shards, and that number is only 3, 4, or 5. The spread is small: totals 6, 8, or 10. Compared with a crit that sometimes deals half a layer, this randomness is narrow. A single match will not land far from the middle.",
    matters:
      "A small discrete range is a distribution you can write in one line. If the three values are equally likely, the mean is 8 damage and you can compute the variance by hand. Narrow variance means one video is a decent estimate. Wide variance means it is not. Glass Ball is the narrow case.",
    links: [
      wiki("Variance", "Variance"),
      wiki("Discrete_uniform_distribution", "Discrete uniform distribution"),
    ],
  },
  pistol: {
    what: `${CLASSIC} Two shots, 5 damage each.`,
    characteristic:
      "The budget is fixed: at most 10, and only if both shots land. Missing is the random part. There is no ramp and no timer beyond the shots existing.",
    matters:
      "A fixed number of trials with a hit-or-miss outcome is binomial. Expected damage is 5 times 2 times the chance a shot lands. If you do not know that chance, one duel does not estimate it well. Two shots is a very small sample.",
    links: [
      wiki("Binomial_distribution", "Binomial distribution"),
      wiki("Sample_size_determination", "Sample size"),
    ],
  },
  shotgun: {
    what: `${CLASSIC} A wide spread of pellets at 4 damage each.`,
    characteristic:
      "Spread trades a sure single hit for several chances to hit. At close range many pellets connect. At long range few do. Distance is inside the expected damage, even though 4 looks like a constant.",
    matters:
      "A cone of pellets is a geometric probability: the chance a pellet meets a target depends on the solid angle. Expected damage falls with distance even when each pellet's damage does not. Confusing the conditional damage ('if it hits, 4') with the average damage is a classic mistake.",
    links: [
      wiki("Expected_value", "Expected value"),
      wiki("Solid_angle", "Solid angle"),
    ],
  },
  rifle: {
    what: `${CLASSIC} Five rounds. A round can bounce off a wall twice.`,
    characteristic:
      "Five is the budget of shots. Each shot can become more than one contact because of the ricochets. Wall spacing changes the number of contacts per round. The damage model is incomplete until the arena size is specified.",
    matters:
      "A budget of trials plus a random number of effects per trial is a compound distribution. The total is a sum of five random contact counts. The mean is five times the mean contacts per round. The variance is larger than a model that pretends every round hits exactly once.",
    links: [
      wiki("Compound_probability_distribution", "Compound distribution"),
      wiki("Reflection_(physics)", "Reflection"),
    ],
  },
  sawball: {
    what: `${CLASSIC} Two saws, 5 damage each time one connects.`,
    characteristic:
      "Two persistent hazards rather than a magazine of shots. As long as a saw is in contact, the 5s accumulate. Overlap, spinning speed, and path decide the contact rate.",
    matters:
      "A periodic contact, like a blade hitting once per revolution, is a rate equal to the rotation frequency. Damage per second is 5 times contacts per second. Changing the spin changes the rate and does not change the 5. Separate those levers when you compare saws with guns.",
    links: [
      wiki("Frequency", "Frequency"),
      wiki("Rate_(mathematics)", "Rate"),
    ],
  },
  cutter: {
    what: `${CLASSIC} Inside a red zone, 2 damage every half second.`,
    characteristic:
      "The zone is the model. Two damage on a half-second clock is 4 per second while inside, and 0 outside. Time in the zone, measured in half-seconds, times 2, is the total.",
    matters:
      "A region with a constant hazard is the exponential clock again, if you care about time-to-death, or a plain product if the zone deals fixed ticks. Occupancy time is the random input. The 2 and the 0.5 are constants you can factor out.",
    links: [
      wiki("Residence_time", "Residence time"),
      wiki("Exponential_distribution", "Exponential distribution"),
    ],
  },
  trident: {
    what: `${CLASSIC} A throw deals 20 and then sticks for 3 seconds.`,
    characteristic:
      "20 is the impact. The stick is a follow-up whose value depends on what 'sticks' does during those 3 seconds. If the stick holds a fighter in a hazard, the 20 is not the whole cost. If the stick only prevents movement, the 20 is the damage and the 3 seconds are control.",
    matters:
      "An impact plus a duration is two terms with different units. Adding them directly is a type error. Convert the duration into damage by multiplying by whatever rate applies during the hold, then add the 20. Units are part of the model.",
    links: [
      wiki("Dimensional_analysis", "Units and dimensional analysis"),
      wiki("Impulse_(physics)", "Impulse"),
    ],
  },
  parasites: {
    what: `${CLASSIC} A latch deals 2 damage per second. This is the classic swarmer, distinct from the race-mode Parasite card.`,
    characteristic:
      "Each latch is an independent 2-per-second stream while it holds. Two latches are 4 per second if both are attached and their damage stacks. The count of current latches is the state.",
    matters:
      "A count of attachments times a rate is a linear function of the load. In epidemiology that load is the parasite burden. If latches fall off at random, the count is a birth-death process, and the damage is a random rate. The mean damage follows the mean count. The variance needs the whole process.",
    links: [
      wiki("Birth%E2%80%93death_process", "Birth–death process"),
      wiki("Parasitism", "Parasitism"),
    ],
  },
  train: {
    what: `${CLASSIC} After three wall bounces, the train deals 10.`,
    characteristic:
      "The hit is gated on a count of wall contacts. A fighter who never meets a wall never pays the 10. Arena size and starting angle decide how fast those three bounces arrive. The 10 itself does not grow.",
    matters:
      "A counter that fires at a threshold is a renewal: every three wall hits, one payout. The time between payouts is the time to collect three events. If wall hits are irregular, that waiting time has the distribution of a sum of three gaps, a classic exercise in renewal theory.",
    links: [
      wiki("Renewal_theory", "Renewal theory"),
      wiki("Convolution", "Sum of waiting times"),
    ],
  },
  "frost-ball": {
    what: `${CLASSIC} A frost trail deals 3 when a fighter enters it, and the trail can freeze. This is Classic Snowball. The race-mode Snowball is a different card, a growing body.`,
    characteristic:
      "Entry deals a flat 3. Freeze changes the opponent's motion afterward, which changes future contact rates. The 3 is the small, countable part. The freeze is a control effect whose damage shows up later, in hits the frozen fighter fails to avoid.",
    matters:
      "A status that alters future rates is a state change in a multi-state model. The value of a freeze is not on the damage number. It is in the difference between the path the opponent would have taken and the path they take while frozen. Causal inference calls that a contrast between two potential outcomes.",
    links: [
      wiki("Multi-state_model", "Multi-state model"),
      wiki("Causal_inference", "Causal inference"),
    ],
  },
  boxer: {
    what: `${CLASSIC} A punch cycles through retract, extend, impact, and recover. Impact is the part that deals damage. The other phases are the cost in time.`,
    characteristic:
      "Duty cycle again. A long recovery means fewer impacts per second. Speeding the cycle raises the rate without changing the damage of one impact. Reading one punch's damage and ignoring the cycle length will overrate a slow fist and underrate a fast one.",
    matters:
      "A repeating cycle of phases is a periodic function. The long-run rate is the reward per cycle divided by the length of the cycle. That quotient is the start of renewal reward theory, and it is the right average for a fight that lasts many punches.",
    links: [
      wiki("Duty_cycle", "Duty cycle"),
      wiki("Renewal_theory", "Renewal reward"),
    ],
  },
  artist: {
    what: `${CLASSIC} Summons a Monster, a Fairy, or a Soldier. The summon does the fighting. Race-mode Artist, id artists, is the painting card and does not use this rule.`,
    characteristic:
      "Three possible additions to the team, one of them chosen. Monster's fists, Fairy's tracking, and a soldier's attacks are different rate models. The seed that picks the summon is part of the result. Across seeds, Classic Artist is a mixture of three fighters.",
    matters:
      "A random choice among three known distributions is a mixture with three components. The overall mean is the weighted average of the three means. The overall variance is larger than the average of the variances, because the choice itself adds spread. That extra spread has a name: the law of total variance.",
    links: [
      wiki("Mixture_distribution", "Mixture distribution"),
      wiki("Law_of_total_variance", "Law of total variance"),
    ],
  },
  monster: {
    what: `${CLASSIC} Fists deal 5. Monster is also what Classic Artist can summon. As its own card, the fist is the rule.`,
    characteristic:
      "Flat 5 per connecting fist. The rate of fists is the open question, and it depends on range and on the punch cycle if it has one. Total damage is 5 times the number of fists that land.",
    matters:
      "A constant size times a random count is a scaled count distribution. If fists land as a Poisson process, damage over a fixed time is a scaled Poisson. The mean and the variance of a Poisson are equal, so after scaling by 5 the variance is 25 times the mean count. Big flat hits make a noisy total.",
    links: [
      wiki("Poisson_distribution", "Poisson distribution"),
      wiki("Expected_value", "Expected value"),
    ],
  },
  fairy: {
    what: `${CLASSIC} A wand tracks a target and deals magic damage. Fairy is also a summon Classic Artist can call.`,
    characteristic:
      "Tracking removes the need to aim, so the contact rate stays high as the target moves. The open number is the wand's damage and its fire rate. A homing attack converts what would have been misses into hits, which raises the effective rate without raising the damage per hit.",
    matters:
      "A pursuit curve is the path of a pursuer who always heads toward a moving target. Dogs, missiles, and this wand are the same geometry. The curve is longer than a straight line, and the time to intercept depends on the speed ratio. If the wand is faster than the target, intercept is certain. The damage is whatever the rule assigns at intercept.",
    links: [
      wiki("Pursuit_curve", "Pursuit curve"),
      wiki("Homing_(missile_guidance)", "Homing guidance"),
    ],
  },
};
