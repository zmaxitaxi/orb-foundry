export type ContestKind = "deadline" | "projectiles" | "draw" | "classic" | "state";

export type Contest = {
  kind: ContestKind;
  title: string;
  mark: string;
  rule: string;
  /** A single fuse length, in seconds. Drawn as a clock, never as a bounce. */
  seconds?: number;
  /** A fuse that moves, in seconds. Drawn as a clock, never as a bounce. */
  span?: { from: number; to: number };
};

const CLASSIC: Contest = {
  kind: "classic",
  title: "Last team alive",
  mark: "last alive",
  rule: "The winner is the last living team. This dial counts layer clears, so a classic fight stays off the chart.",
};

const RULES: Record<string, Contest> = {
  "hydrogen-bomb": {
    kind: "deadline",
    title: "60s fuse",
    mark: "60s fuse",
    seconds: 60,
    rule: "At 60 seconds every layer is set to 0. A bounce count is not a clock.",
  },
  "antimatter-bomb": {
    kind: "deadline",
    title: "Shrinking fuse",
    mark: "shrinking fuse",
    span: { from: 15, to: 5 },
    rule: "The body stays 0 until detonation. The fuse shortens from 15 seconds toward 5.",
  },
  "tsar-bomb": {
    kind: "deadline",
    title: "90s fuse",
    mark: "90s fuse",
    seconds: 90,
    rule: "A 90-second fuse, then the blast. The body hit stays 0 until then.",
  },
  "time-bomb": {
    kind: "deadline",
    title: "Pulse clock",
    mark: "pulse clock",
    rule: "The body stays 0 until the blast. Pulses and freezes run on a clock.",
  },
  poison: {
    kind: "deadline",
    title: "0.1s pulses",
    mark: "0.1s pulses",
    rule: "Ticks pulse every 0.1 seconds. The body hit is 0, so the pulse is off the bounce axis.",
  },
  progressive: {
    kind: "deadline",
    title: "Timer",
    mark: "timer",
    rule: "Damage climbs on a timer. This dial does not convert that timer into bounces.",
  },
  drill: projectile("Drill shots add the hits. The body is not the bounce sum."),
  lazer: projectile("The beam is the hit. This dial leaves that beam off the bounce axis."),
  boomerang: projectile("The returning weapon deals the damage. The body is the launcher."),
  mines: projectile("Thrown bombs deal the damage. The body line stays blank."),
  meteor: projectile("Meteors deal the damage. The body line stays blank."),
  orbital: projectile("Orbiter contacts land on the line. The body is not the sum."),
  bouncer: projectile("The mini orbs land the hits. The body line stays blank."),
  "blue-sun": projectile("Lasers hit the line. The body ramp is not the score."),
  "purple-sun": projectile("Beams scale with power level. The body does not take the +1 ramp."),
  "phase-three-sun": projectile("The phase-three beam is the damage. The body hit is 0."),
  "phase-two-sun": projectile("The phase-two beam is the damage. The body hit is 0."),
  turret: projectile("Turret shots add the hits. The body ramp is not the score."),
  parasite: projectile("Each attached parasite adds a hit the body line does not count."),
  snake: projectile("The grounded tail deals the damage. The body hit is 0."),
  sniper: projectile("The shot is the damage. A bounce only shortens the cooldown."),
  snowball: projectile("The hit grows on its own rule. It is not the plain body ramp."),
  commander: projectile("Drone bombs and missiles deal the damage."),
  shrapnel: projectile("A broken layer throws fragments. Those fragments are the extra hits."),
  ricochet: projectile("Every third bounce fires a shot. That shot sits outside the body sum."),
  grappler: projectile("The grapple supplies the hit. The body starts at 0."),
  artists: projectile("Painting supplies the damage. The body starts at 0."),
  rain: projectile("Rain hits the layer. The body hit is 0."),
  miner: projectile("The drill eats the layer by progress. The body hit is 0."),
  scissor: projectile("The split pieces deal the damage. The body hit is 0."),
  random: {
    kind: "draw",
    title: "Seeded roll",
    mark: "seeded roll",
    rule: "Each hit is a seeded roll. One line would be one seed.",
  },
  breaker: {
    kind: "draw",
    title: "Crit roll",
    mark: "crit roll",
    rule: "The plain body hit is 1. A crit removes half the layer, and the crit is a roll.",
  },
  professor: {
    kind: "draw",
    title: "Copied formula",
    mark: "copied formula",
    rule: "The body stays 0 until a formula is copied. The copy decides the hit.",
  },
  copycat: {
    kind: "draw",
    title: "Copied ability",
    mark: "copied ability",
    rule: "The body starts at 0, then uses the damage of the orb it copied.",
  },
  roulette: {
    kind: "draw",
    title: "Copied ability",
    mark: "copied ability",
    rule: "It copies another orb on a timer, then uses that ability’s damage.",
  },
  hacker: {
    kind: "draw",
    title: "Seeded hack",
    mark: "seeded hack",
    rule: "Each hack applies one seeded outcome. One line would be one seed.",
  },
  "ying-yang": {
    kind: "state",
    title: "Mode switch",
    mark: "mode switch",
    rule: "Speed and damage trade modes. The hit depends on which mode is active.",
  },
  lag: {
    kind: "state",
    title: "Glitch channel",
    mark: "glitch",
    rule: "The body hit is 0. The glitch channel deals the damage.",
  },
  whirlwind: {
    kind: "state",
    title: "Line sweep",
    mark: "line sweep",
    rule: "The body hit is 0. Damage comes from contacts along the line.",
  },
  rgb: {
    kind: "state",
    title: "Color mode",
    mark: "color mode",
    rule: "The bonus depends on the color mode, so the hit is not one bounce rule.",
  },
  "reality-bomb": {
    kind: "state",
    title: "Summoned team",
    mark: "summons",
    rule: "The body hit is 0. Summoned Slammies deal their own 1 + 2n.",
  },
  "all-in-one": {
    kind: "state",
    title: "Active window",
    mark: "active window",
    rule: "Damage scales by a power that rises only while the window is active.",
  },
  "black-hole": {
    kind: "state",
    title: "Held total",
    mark: "held total",
    rule: "Hits stay at 1 until the singularity returns the drained total.",
  },
  vampire: {
    kind: "state",
    title: "Steal",
    mark: "steal",
    rule: "A rising percent is taken from the hit, so the number depends on the other fighter.",
  },
  needle: {
    kind: "state",
    title: "Pierce",
    mark: "pierce",
    rule: "The hit passes through layers. A layer-health sum would understate it.",
  },
  critical: {
    kind: "state",
    title: "Crit multiplier",
    mark: "crit multiplier",
    rule: "A critical multiplier lands on the hit. It is not a fixed bounce rule.",
  },
  countdown: {
    kind: "state",
    title: "Countdown blast",
    mark: "countdown",
    rule: "The countdown drops on each bounce, and a blast lands when it reaches 0.",
  },
};

function projectile(rule: string): Contest {
  return { kind: "projectiles", title: "Projectiles", mark: "projectiles", rule };
}

const FALLBACK: Contest = {
  kind: "state",
  title: "Off the bounce axis",
  mark: "—",
  rule: "The body hit is not a bounce count, so this dial leaves it off the chart.",
};

export function contestFor(id: string, family: string): Contest {
  if (family === "classic") return CLASSIC;
  return RULES[id] ?? FALLBACK;
}

export function contestBridge(left: Contest, right: Contest): string {
  if (left.kind === "classic" && right.kind === "classic") {
    return "Both win by being the last living team. This dial counts layer clears, so it does not rank them.";
  }
  if (left.kind === "deadline" && right.kind === "deadline") {
    return "Both are clocks. A bounce chart has no seconds on its axis.";
  }
  if (left.kind === "projectiles" && right.kind === "projectiles") {
    return "Both deal their damage off the body. This dial only scores body hits.";
  }
  if (left.kind === "draw" && right.kind === "draw") {
    return "Both depend on a roll or a copy. One line would be one seed.";
  }
  if (left.kind === "state" && right.kind === "state") {
    return "Each follows its own state. One bounce line would flatten that state.";
  }
  return "These rules are not on one scale. The dial names them and does not rank them.";
}
