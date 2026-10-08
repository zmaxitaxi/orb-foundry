import {
  ORB_RACE_COMBO_NAMES,
  raceAbilityIdsFor,
  raceComboAnnouncerCueFor,
  raceTeamDisplayParts,
} from "./orb-race.js?v=20261008-purple-sun-title1";
import {
  classicTeamDisplayParts,
} from "./classic-orbs.js?v=20260812-classic-health-reactor-batman-fairy-zeus-frost-snowball1";

export const ANNOUNCER_NAMES = Object.freeze({
  sword: "Sword",
  duplicator: "Duplicator",
  orbital: "Orbital",
  unarmed: "Unarmed",
  slammy: "Slammy",
  vampire: "Vampire",
  turret: "Turret",
  flash: "Flash",
  reactor: "Reactor",
  sniper: "Sniper",
  draftmaster: "Draftmaster",
  "blue-sun": "Blue Sun",
  "black-hole": "Black Hole",
  tripwire: "Tripwire",
  "hydrogen-bomb": "Hydrogen Bomb",
  necromancer: "Necromancer",
  poison: "Poison",
  spikey: "Spikey",
  snake: "Snake",
  virus: "Virus",
  shrapnel: "Shrapnel",
  cobwebs: "Cobwebs",
  apple: "Apple",
  absorber: "Absorber",
  batman: "Batman",
  "ying-yang": "Ying Yang",
  trapper: "Cowboy",
  "hive-ball": "Hive Ball",
  zeus: "Zeus",
  "glass-ball": "Glass Ball",
  pistol: "Pistol",
  shotgun: "Shotgun",
  rifle: "Rifle",
  sawball: "Sawball",
  cutter: "Cutter",
  trident: "Trident",
  lazer: "Lazer",
  charger: "Charger",
  parasites: "Parasites",
  grappler: "Grappler",
  train: "Train",
  "frost-ball": "Snowball",
  jackpot: "Jackpot",
  boxer: "Boxer",
  artist: "Artist",
  monster: "Monster",
  fairy: "Fairy",
  commander: "Commander",
});

export const ANNOUNCER_TYPES = Object.freeze(Object.keys(ANNOUNCER_NAMES));
export const WORLD_CUP_ANNOUNCER_NAMES = Object.freeze({
  france: "France",
  argentina: "Argentina",
  australia: "Australia",
  brazil: "Brazil",
  canada: "Canada",
  "cabo-verde": "Cabo Verde",
  usa: "USA",
  colombia: "Colombia",
  "congo-dr": "Congo",
  egypt: "Egypt",
  england: "England",
  ghana: "Ghana",
  mexico: "Mexico",
  morocco: "Morocco",
  sweden: "Sweden",
  bosnia: "Bosnia",
  japan: "Japan",
  paraguay: "Paraguay",
  germany: "Germany",
  portugal: "Portugal",
  croatia: "Croatia",
  "ivory-coast": "Ivory Coast",
  norway: "Norway",
  belgium: "Belgium",
  senegal: "Senegal",
  austria: "Austria",
  spain: "Spain",
  algeria: "Algeria",
  switzerland: "Switzerland",
});

export const RACE_ANNOUNCER_NAMES = Object.freeze({
  duplicator: "Duplicator",
  speed: "Speedster",
  orbital: "Orbital",
  drill: "Drill",
  fibonacci: "Fibonacci",
  "x-squared": "X Squared",
  flash: "Flash",
  batman: "Batman",
  lazer: "Lazer",
  phi: "Golden Ratio",
  sticky: "Sticky",
  grower: "Grower",
  unarmed: "Unarmed",
  slammy: "Slammy",
  "super-slammy": "Super Slammy",
  piercer: "Piercer",
  "ying-yang": "Ying Yang",
  poison: "Poison",
  "hydrogen-bomb": "Hydrogen Bomb",
  "antimatter-bomb": "Antimatter Bomb",
  "time-bomb": "Time Bomb",
  "reality-bomb": "Reality Bomb",
  "tsar-bomb": "Tsar Bomb",
  "all-in-one": "All In One",
  breaker: "Breaker",
  "square-root": "Square Root",
  progressive: "Progressive",
  random: "Random",
  twins: "Twins",
  scissor: "Scissor",
  lag: "Lag",
  whirlwind: "Whirlwind",
  rgb: "R G B",
  "x-power": "X to the X",
  "super-x-power": "Super X to the X",
  lucas: "Lucas Sequence",
  professor: "Professor",
  gravity: "Gravity",
  jackpot: "Jackpot",
  boomerang: "Boomerang",
  mines: "Splodey",
  magnet: "Magnet",
  factorial: "Factorial",
  prime: "Prime",
  integral: "Integral",
  quadratic: "Quadratic",
  pi: "Pi",
  ricochet: "Ricochet Cannon",
  sawblade: "Sawblade",
  meteor: "Meteor",
  "black-hole": "Black Hole",
  godzilla: "Godzilla",
  "speed-impact": "Slow",
  centy: "Centy",
  infinity: "Infinity",
  charger: "Charger",
  bouncer: "Bouncer",
  "blue-sun": "Blue Sun",
  "purple-sun": "Purple Sun",
  "phase-three-sun": "The Sun",
  "phase-two-sun": "Phase Two Sun",
  trifecta: "Trifecta",
  gravitator: "Gravitator",
  snake: "Snake",
  vampire: "Vampire",
  cubed: "Cubed",
  double: "Double",
  tripler: "Tripler",
  turret: "Turret",
  leech: "Leech",
  crusher: "Crusher",
  berserker: "Berserker",
  reactor: "Reactor",
  parasite: "Parasite",
  draftmaster: "Draftmaster",
  needle: "Needle",
  multiplier: "Multiplier",
  sniper: "Sniper",
  snowball: "Snowball",
  countdown: "Countdown",
  copycat: "Copycat",
  critical: "Critical",
  commander: "Commander",
  shrapnel: "Shrapnel",
  roulette: "Absorber",
  architect: "Architect",
  "100x": "100X",
  grappler: "Grappler",
  artists: "Artist",
  pancake: "Pancake",
  tree: "Tree",
  sylvester: "Sylvester",
  tetration: "Tetration",
  rain: "Rain",
  hacker: "Hacker",
  miner: "Miner",
});

export const RACE_GROUP_ANNOUNCER_NAMES = Object.freeze({
  math: "Math Orbs",
  superhero: "Superhero Orbs",
  weapon: "Weapon Orbs",
  growth: "Growth Orbs",
  motion: "Motion Orbs",
  "power-math": "Very Powerful Math Orbs",
  bombs: "Bombs",
  suns: "Sun Orbs",
});

const LOCAL_GENERATED_RACE_WAV_IDS = new Set([
  "centy",
  "infinity",
  "charger",
  "bouncer",
  "blue-sun",
  "snake",
  "vampire",
  "cubed",
  "double",
  "tripler",
  "group-power-math",
  "combo-fibonacci-tripler",
  "turret",
  "leech",
  "crusher",
  "berserker",
  "reactor",
  "parasite",
  "draftmaster",
  "buffed",
  "lag",
  "whirlwind",
  "rgb",
]);
const generatedRaceAnnouncement = (id) => (
  `generated-race/race-${id}.${LOCAL_GENERATED_RACE_WAV_IDS.has(id) ? "wav" : "mp3"}`
);
const generatedRaceComboAnnouncement = (key) => generatedRaceAnnouncement(`combo-${key.replace("+", "-")}`);

export const RACE_ANNOUNCER_COUNT_NAMES = Object.freeze({
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
  15: "Fifteen",
  20: "Twenty",
  25: "Twenty Five",
  30: "Thirty",
  35: "Thirty Five",
  40: "Forty",
  45: "Forty Five",
  50: "Fifty",
  60: "Sixty",
  70: "Seventy",
  80: "Eighty",
  90: "Ninety",
  100: "One Hundred",
});

export const RACE_COUNT_ANNOUNCER_ASSETS = Object.freeze(Object.fromEntries(
  Object.keys(RACE_ANNOUNCER_COUNT_NAMES).map((count) => [
    `race-count-${count}`,
    generatedRaceAnnouncement(`count-${count}`),
  ]),
));

export const RACE_COMBO_ANNOUNCER_ASSETS = Object.freeze(Object.fromEntries(
  Object.keys(ORB_RACE_COMBO_NAMES).map((key) => [
    raceComboAnnouncerCueFor(key.split("+")),
    generatedRaceComboAnnouncement(key),
  ]),
));

// Orb Race has a self-contained generated announcement palette. Keeping it
// separate from the classic and World Cup manifests prevents those modes from
// changing when the race voice set is refreshed.
export const RACE_GENERATED_ANNOUNCER_ASSETS = Object.freeze({
  ...Object.fromEntries(Object.keys(RACE_ANNOUNCER_NAMES).map((racerId) => [
    `intro-race-${racerId}`,
    generatedRaceAnnouncement(racerId),
  ])),
  ...Object.fromEntries(Object.keys(RACE_GROUP_ANNOUNCER_NAMES).map((groupId) => [
    `intro-race-group-${groupId}`,
    generatedRaceAnnouncement(`group-${groupId}`),
  ])),
  ...RACE_COUNT_ANNOUNCER_ASSETS,
  ...RACE_COMBO_ANNOUNCER_ASSETS,
  "intro-race-everyone": generatedRaceAnnouncement("everyone"),
  "race-plus": generatedRaceAnnouncement("plus"),
  "race-versus": generatedRaceAnnouncement("versus"),
  "race-pick-your-winner": generatedRaceAnnouncement("pick-your-winner"),
  "race-buffed": generatedRaceAnnouncement("buffed"),
  // Classic Boss has its own Alex cue; it must not inherit the Buffed protocol.
  "race-boss": generatedRaceAnnouncement("boss"),
  "race-target-10000": generatedRaceAnnouncement("target-10000"),
  "race-target-100000": generatedRaceAnnouncement("target-100000"),
  "race-target-500000": generatedRaceAnnouncement("target-500000"),
  "race-target-1000000": generatedRaceAnnouncement("target-1000000"),
  "race-target-10000000": generatedRaceAnnouncement("target-10000000"),
  "race-target-500000000": generatedRaceAnnouncement("target-500000000"),
  "race-target-1000000000": generatedRaceAnnouncement("target-1000000000"),
  "race-target-1000000000000000000": generatedRaceAnnouncement("target-1000000000000000000"),
});

export const ANNOUNCER_ASSET_VERSION = "20260825-tsar-all-in-one1";
export const ANNOUNCER_PLAYBACK_GAIN = 1.15;
export const VERSUS_ANNOUNCER_PLAYBACK_GAIN = 3.4;
export const ANNOUNCER_DUCK_GAINS = Object.freeze({
  effects: 0.18,
  ambience: 0.1,
  music: 0.2,
});
export const ANNOUNCER_DUCK_RELEASE_SECONDS = 0.18;
export const RACE_MATH_POWER_GAIN = 1.9;
export const RACE_MATH_POWER_DUCK_GAIN = 0.015;
export const RACE_MATH_POWER_DUCK_RELEASE_SECONDS = 0.24;

export function announcerPlaybackGainForCue(cue) {
  return ["versus", "race-versus"].includes(cue) ? VERSUS_ANNOUNCER_PLAYBACK_GAIN : ANNOUNCER_PLAYBACK_GAIN;
}

export function raceAnnouncerCountCueFor(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 1 || numericValue > 100) return null;
  const count = Math.floor(numericValue);
  return RACE_COUNT_ANNOUNCER_ASSETS[`race-count-${count}`] ? `race-count-${count}` : null;
}

export function raceTargetAnnouncerCueFor(value) {
  const cue = `race-target-${Math.round(Number(value) || 0)}`;
  return RACE_GENERATED_ANNOUNCER_ASSETS[cue] ? cue : null;
}

const CLASSIC_ANNOUNCER_SOURCE_IDS = Object.freeze({
  sword: "sword",
  duplicator: "duplicator",
  orbital: "orbital",
  unarmed: "unarmed",
  slammy: "slammy",
  vampire: "vampire",
  turret: "turret",
  flash: "flash",
  reactor: "reactor",
  sniper: "sniper",
  draftmaster: "draftmaster",
  "blue-sun": "blue-sun",
  "black-hole": "black-hole",
  "hydrogen-bomb": "hydrogen-bomb",
  poison: "poison",
  snake: "snake",
  shrapnel: "shrapnel",
  absorber: "roulette",
  batman: "batman",
  "ying-yang": "ying-yang",
  lazer: "lazer",
  charger: "charger",
  parasites: "parasite",
  grappler: "grappler",
  jackpot: "jackpot",
  artist: "artists",
  commander: "commander",
  sawball: "sawblade",
  "frost-ball": "snowball",
});

const CLASSIC_OVERHAUL_ANNOUNCER_IDS = Object.freeze([
  "tripwire",
  "necromancer",
  "spikey",
  "virus",
  "cobwebs",
  "apple",
  "trapper",
  "hive-ball",
  "zeus",
  "glass-ball",
  "pistol",
  "shotgun",
  "rifle",
  "sawball",
  "cutter",
  "trident",
  "parasites",
  "train",
  "boxer",
  "artist",
  "monster",
  "fairy",
]);

const CLASSIC_OVERHAUL_ANNOUNCER_ASSETS = Object.freeze(Object.fromEntries(
  CLASSIC_OVERHAUL_ANNOUNCER_IDS.map((classicId) => [
    `intro-${classicId}`,
    `generated-classic-overhaul/${classicId === "trapper" ? "classic-cowboy" : `classic-${classicId}`}.mp3`,
  ]),
));

export const INTRO_ANNOUNCER_ASSETS = Object.freeze({
  ...Object.fromEntries(
    Object.entries(CLASSIC_ANNOUNCER_SOURCE_IDS)
      .map(([classicId, raceId]) => [
        `intro-${classicId}`,
        RACE_GENERATED_ANNOUNCER_ASSETS[`intro-race-${raceId}`] || generatedRaceAnnouncement(raceId),
      ])
      .filter(([, asset]) => Boolean(asset)),
  ),
  ...CLASSIC_OVERHAUL_ANNOUNCER_ASSETS,
});

const WORLD_CUP_ANNOUNCER_ASSET_OVERRIDES = Object.freeze({
  colombia: "wise/world-cup-ghana.mp3",
  ghana: "wise/world-cup-colombia.mp3",
  portugal: "wise/world-cup-croatia.mp3",
  croatia: "wise/world-cup-portugal.mp3",
});

export const WORLD_CUP_INTRO_ANNOUNCER_ASSETS = Object.freeze(Object.fromEntries(
  Object.keys(WORLD_CUP_ANNOUNCER_NAMES).map((countryId) => [
    `intro-country-${countryId}`,
    WORLD_CUP_ANNOUNCER_ASSET_OVERRIDES[countryId] ?? `wise/world-cup-${countryId}.mp3`,
  ]),
));

export const RACE_INTRO_ANNOUNCER_ASSETS = Object.freeze(Object.fromEntries(
  [
    ...Object.entries(RACE_GENERATED_ANNOUNCER_ASSETS)
      .filter(([cue]) => cue.startsWith("intro-race-")),
  ],
));

const DISABLED_ANNOUNCER_CUES = new Set();

export const LEGACY_ANNOUNCER_ASSETS = Object.freeze({
  "legacy-three": "three.wav",
  "legacy-two": "two.wav",
  "legacy-one": "one.wav",
  "legacy-fight": "fight.wav",
  "legacy-overtime": "overtime.wav",
  "legacy-versus": "versus.wav",
  "legacy-fire": "cinder.wav",
  "legacy-ice": "frost.wav",
  "legacy-wizard": "hex.wav",
  "legacy-time": "chrono.wav",
  "legacy-volta": "volta.wav",
  "legacy-venom": "venom.wav",
  "legacy-gravis": "gravis.wav",
  "legacy-aegis": "aegis.wav",
});

export const ANNOUNCER_ASSETS = Object.freeze({
  three: "wise/three.wav",
  two: "wise/two.wav",
  one: "wise/one.wav",
  fight: "wise/fight.wav",
  versus: "wise/versus.wav",
  "pick-your-winner": "wise/pick-your-winner.wav",
  overtime: "wise/overtime.wav",
  ...INTRO_ANNOUNCER_ASSETS,
  ...WORLD_CUP_INTRO_ANNOUNCER_ASSETS,
  ...RACE_INTRO_ANNOUNCER_ASSETS,
  ...RACE_COUNT_ANNOUNCER_ASSETS,
  "race-plus": RACE_GENERATED_ANNOUNCER_ASSETS["race-plus"],
  "race-versus": RACE_GENERATED_ANNOUNCER_ASSETS["race-versus"],
  "race-pick-your-winner": RACE_GENERATED_ANNOUNCER_ASSETS["race-pick-your-winner"],
  "race-buffed": RACE_GENERATED_ANNOUNCER_ASSETS["race-buffed"],
  "race-boss": RACE_GENERATED_ANNOUNCER_ASSETS["race-boss"],
  ...Object.fromEntries(Object.keys(RACE_GENERATED_ANNOUNCER_ASSETS)
    .filter((cue) => cue.startsWith("race-target-"))
    .map((cue) => [cue, RACE_GENERATED_ANNOUNCER_ASSETS[cue]])),
  "world-cup-pick-your-winner": "wise/world-cup-pick-your-winner.mp3",
  ...LEGACY_ANNOUNCER_ASSETS,
});

export const ANNOUNCER_FALLBACKS = Object.freeze({
  three: "legacy-three",
  two: "legacy-two",
  one: "legacy-one",
  fight: "legacy-fight",
  versus: "legacy-versus",
  "pick-your-winner": null,
  overtime: "legacy-overtime",
  ...Object.fromEntries(ANNOUNCER_TYPES.map((type) => [
    `intro-${type}`,
    Object.hasOwn(LEGACY_ANNOUNCER_ASSETS, `legacy-${type}`) ? `legacy-${type}` : null,
  ])),
  ...Object.fromEntries(Object.keys(WORLD_CUP_ANNOUNCER_NAMES).map((countryId) => [
    `intro-country-${countryId}`,
    null,
  ])),
  ...Object.fromEntries(Object.keys(RACE_ANNOUNCER_NAMES).map((racerId) => [
    `intro-race-${racerId}`,
    null,
  ])),
  ...Object.fromEntries(Object.keys(RACE_GROUP_ANNOUNCER_NAMES).map((groupId) => [
    `intro-race-group-${groupId}`,
    null,
  ])),
  ...Object.fromEntries(Object.keys(RACE_COUNT_ANNOUNCER_ASSETS).map((cue) => [cue, null])),
  ...Object.fromEntries(Object.keys(ORB_RACE_COMBO_NAMES).map((key) => [
    raceComboAnnouncerCueFor(key.split("+")),
    null,
  ])),
  "intro-race-everyone": null,
  "race-plus": null,
  "race-pick-your-winner": null,
  "race-versus": null,
  "race-buffed": null,
  "race-boss": null,
  ...Object.fromEntries(Object.keys(RACE_GENERATED_ANNOUNCER_ASSETS)
    .filter((cue) => cue.startsWith("race-target-"))
    .map((cue) => [cue, null])),
  "world-cup-pick-your-winner": "pick-your-winner",
});

export const SAMPLE_ASSETS = Object.freeze({
  "match-finale": "match-finale.wav",
  "chrono-time-stop": "chrono-time-stop.wav",
  "weapon-hit": "fantasy-sword-hit.mp3",
  "weapon-clash": "sword-clash-241729.mp3",
  "orb-collision": "orb-collision-pop.mp3",
  "race-math-bounce": "race-math-bounce.mp3",
  "race-math-power": "race-math-power.mp3",
  "race-vampire-bounce": "race-vampire-bounce.mp3",
  "race-pancake-impact": "race-pancake-impact.mp3",
  "race-monster-growl": "race-monster-growl.mp3",
  "race-fairy-sparkle": "race-fairy-sparkle.mp3",
  "race-thunder": "race-thunder.mp3",
  "race-monster-footsteps": "race-monster-footsteps.mp3",
  "race-godzilla-tail-smack": "race-godzilla-tail-smack.wav",
  "race-godzilla-beam-charge": "race-godzilla-beam-charge.wav",
  "race-draft-rifle-fire": "race-draft-rifle-fire.mp3",
  "race-draft-shotgun-fire": "race-draft-shotgun-fire.mp3",
  "race-draft-pistol-fire": "race-draft-pistol-fire.mp3",
  "race-layer-break": "race-layer-break.mp3",
  "race-drill": "race-drill.mp3",
  "hydrogen-bomb-siren": "hydrogen-bomb-siren.mp3",
  "hydrogen-bomb-explosion": "hydrogen-bomb-explosion.mp3",
  "hydrogen-bomb-ear-ringing": "hydrogen-bomb-ear-ringing.mp3",
  "classic-trident-throw": "classic-trident-throw.mp3",
  "classic-trident-recall": "classic-trident-recall.mp3",
  "classic-boxer-punch": "classic-boxer-punch.mp3",
  "classic-vampire-hiss": "classic-vampire-hiss.mp3",
  "classic-necromancer-summon": "classic-necromancer-summon.mp3",
  "classic-trapper-throw": "classic-trapper-throw.mp3",
  "classic-trapper-caught": "classic-trapper-caught.mp3",
  "classic-snowball-freeze": "classic-snowball-freeze.mp3",
  "jackpot-slot-spinning": "jackpot-slot-spinning.mp3",
  "jackpot-slot-lever": "jackpot-slot-lever.mp3",
  "forge-item-pickup": "forge-item-pickup.mp3",
  "france-world-cup-pickup": "france-world-cup-pickup.wav",
  "norway-world-cup-action": "norway-world-cup-action.wav",
  "usa-world-cup-action": "usa-world-cup-action.wav",
  "england-world-cup-action": "england-world-cup-action.wav",
  "argentina-world-cup-action": "argentina-world-cup-action.wav",
  "portugal-world-cup-pickup": "portugal-world-cup-pickup.wav",
  "spain-world-cup-action": "spain-world-cup-action.wav",
  "world-cup-ko": "world-cup-ko.wav",
  "world-cup-card-use": "world-cup-card-use.mp3",
  "cinder-burn-tick": "cinder-burn-tick.wav",
  "critical-hit": "critical-hit.wav",
  "hex-magic-burst": "hex-magic-burst.mp3",
  "aegis-rush": "aegis-surge.mp3",
  "meteor-horn": "meteor-horn.mp3",
  "meteor-strike": "meteor-strike.mp3",
  "black-hole-impact": "black-hole-impact.mp3",
  "black-hole-teleport": "black-hole-teleport.mp3",
  "race-lag-glitch": "race-lag-glitch.mp3",
});

export const MATCH_FINALE_DURATION_SECONDS = 3.47;
export const MATCH_FINALE_RECORDING_TAIL_MS = 1_200;
export const SAMPLE_ASSET_VERSION = "20260825-tsar-all-in-one1";

const METAL_FOUNDATION = Object.freeze({
  layers: [
    [1860, 620, 0.045, 0.032, "sine"],
    [1180, 490, 0.085, 0.026, "triangle"],
    [735, 310, 0.14, 0.022, "sine"],
  ],
  noises: [[0.052, 0.04, 3100, 1.8, "bandpass"]],
});

const ORB_SIGNATURES = Object.freeze({
  sword: {
    name: "forged-edge",
    layers: [[510, 190, 0.2, 0.024, "triangle"], [1280, 420, 0.07, 0.014, "sine"]],
    noises: [[0.18, 0.025, 1550, 0.65, "highpass"]],
  },
  bow: {
    name: "bow-string",
    layers: [[138, 64, 0.26, 0.04, "sine"], [1760, 520, 0.08, 0.026, "triangle"]],
    noises: [[0.13, 0.035, 3900, 0.75, "highpass"]],
  },
  potion: {
    name: "tonic-vial",
    layers: [[2480, 760, 0.075, 0.025, "triangle"], [640, 260, 0.16, 0.014, "sine"]],
    noises: [[0.16, 0.024, 2100, 1.1, "bandpass"]],
  },
  axe: {
    name: "cleaver-impact",
    layers: [[2340, 1840, 0.22, 0.024, "sine"], [3150, 2200, 0.12, 0.015, "sine"]],
    noises: [[0.075, 0.028, 4700, 2.6, "bandpass"]],
  },
  dagger: {
    name: "dagger-whirl",
    layers: [[1960, 1960, 0.035, 0.022, "sine"], [370, 890, 0.25, 0.018, "triangle"]],
    noises: [[0.095, 0.016, 1200, 5.5, "bandpass"]],
  },
  katana: {
    name: "katana-slice",
    layers: [[420, 980, 0.24, 0.022, "sine"], [840, 1510, 0.2, 0.014, "triangle"]],
    noises: [[0.11, 0.018, 2300, 4.2, "bandpass"]],
  },
  duplicator: {
    name: "duplicate-pop",
    layers: [[510, 920, 0.11, 0.018, "triangle"], [1020, 1540, 0.08, 0.012, "sine"]],
    noises: [[0.06, 0.012, 2600, 1.4, "bandpass"]],
  },
  orbital: {
    name: "orbital-contact",
    layers: [[860, 1320, 0.1, 0.02, "sine"], [1320, 860, 0.12, 0.014, "triangle"]],
    noises: [[0.045, 0.012, 3200, 1.8, "bandpass"]],
  },
  unarmed: {
    name: "unarmed-impact",
    layers: [[164, 72, 0.18, 0.038, "sine"], [620, 210, 0.12, 0.02, "triangle"]],
    noises: [[0.075, 0.026, 980, 0.8, "lowpass"]],
  },
  grower: {
    name: "growth-swell",
    layers: [[220, 640, 0.22, 0.026, "triangle"], [520, 1040, 0.16, 0.014, "sine"]],
    noises: [[0.1, 0.014, 1400, 1.2, "bandpass"]],
  },
  slammy: {
    name: "slam-impact",
    layers: [[112, 44, 0.28, 0.05, "sine"], [520, 180, 0.18, 0.028, "triangle"]],
    noises: [[0.14, 0.034, 720, 0.7, "lowpass"]],
  },
  fire: {
    name: "flame-forged",
    layers: [[510, 190, 0.2, 0.024, "triangle"], [1280, 420, 0.07, 0.014, "sine"]],
    noises: [[0.18, 0.025, 1550, 0.65, "highpass"]],
  },
  ice: {
    name: "crystal-frost",
    layers: [[2340, 1840, 0.22, 0.024, "sine"], [3150, 2200, 0.12, 0.015, "sine"]],
    noises: [[0.075, 0.028, 4700, 2.6, "bandpass"]],
  },
  wizard: {
    name: "runic-arcane",
    layers: [[420, 980, 0.24, 0.022, "sine"], [840, 1510, 0.2, 0.014, "triangle"]],
    noises: [[0.11, 0.018, 2300, 4.2, "bandpass"]],
  },
  time: {
    name: "clockwork-temporal",
    layers: [[1960, 1960, 0.035, 0.022, "sine"], [370, 890, 0.25, 0.018, "triangle"]],
    noises: [[0.095, 0.016, 1200, 5.5, "bandpass"]],
  },
  volta: {
    name: "storm-fork",
    layers: [[138, 64, 0.26, 0.04, "sine"], [1760, 520, 0.08, 0.026, "triangle"]],
    noises: [[0.13, 0.035, 3900, 0.75, "highpass"]],
  },
  venom: {
    name: "toxic-blade",
    layers: [[2480, 760, 0.075, 0.025, "triangle"], [640, 260, 0.16, 0.014, "sine"]],
    noises: [[0.16, 0.024, 2100, 1.1, "bandpass"]],
  },
  gravis: {
    name: "gravity-mace",
    layers: [[92, 38, 0.34, 0.052, "sine"], [460, 170, 0.2, 0.022, "triangle"]],
    noises: [[0.12, 0.03, 620, 0.7, "lowpass"]],
  },
  aegis: {
    name: "viking-ram",
    layers: [[680, 420, 0.3, 0.036, "sine"], [1370, 880, 0.22, 0.024, "sine"]],
    noises: [[0.075, 0.022, 2800, 2.2, "bandpass"]],
  },
  mirage: {
    name: "glass-decoy",
    layers: [[1840, 1120, 0.16, 0.018, "sine"], [2520, 1710, 0.1, 0.012, "triangle"]],
    noises: [[0.06, 0.018, 5200, 3.4, "bandpass"]],
  },
  echo: {
    name: "resonance-blade",
    layers: [[620, 930, 0.18, 0.022, "sine"], [930, 620, 0.18, 0.016, "sine"]],
    noises: [[0.07, 0.014, 1800, 4.8, "bandpass"]],
  },
  forge: {
    name: "tempered-hammer",
    layers: [[155, 92, 0.25, 0.04, "triangle"], [760, 330, 0.16, 0.025, "sine"]],
    noises: [[0.16, 0.032, 1250, 0.8, "lowpass"]],
  },
  static: {
    name: "static-spike",
    layers: [[1760, 220, 0.18, 0.03, "triangle"], [3120, 740, 0.07, 0.02, "sine"]],
    noises: [[0.18, 0.034, 4700, 0.65, "highpass"]],
  },
  shade: {
    name: "shadow-dash",
    layers: [[210, 84, 0.2, 0.024, "sine"], [980, 420, 0.1, 0.016, "triangle"]],
    noises: [[0.11, 0.018, 760, 1.2, "lowpass"]],
  },
});

const EVENT_SOUNDS = Object.freeze({
  "orb-race-tournament-zoom": {
    signature: "tournament-matchup-zoom",
    category: "effects",
    rateLimit: 0.12,
    layers: [[180, 780, 0.42, 0.034, "sine"], [360, 1480, 0.34, 0.022, "triangle"], [920, 2140, 0.18, 0.012, "sine"]],
    noises: [[0.24, 0.018, 2300, 1.1, "bandpass"]],
  },
  "wall-hit": {
    signature: "resonant-wall-bounce",
    gain: 1.42,
    rateLimit: 0.048,
    layers: [[210, 430, 0.14, 0.036, "triangle"], [820, 520, 0.18, 0.023, "sine"], [1580, 2280, 0.07, 0.017, "sine"], [2760, 1820, 0.045, 0.012, "triangle"]],
    noises: [[0.06, 0.026, 1850, 1.45, "bandpass"], [0.026, 0.012, 4800, 2.4, "highpass"]],
  },
  impact: {
    signature: "orb-body-bounce",
    gain: 1.5,
    rateLimit: 0.044,
    layers: [[124, 70, 0.2, 0.049, "sine"], [360, 740, 0.15, 0.036, "triangle"], [1180, 720, 0.17, 0.019, "sine"], [2200, 1480, 0.055, 0.013, "triangle"]],
    noises: [[0.075, 0.038, 880, 0.75, "lowpass"], [0.04, 0.018, 2850, 1.8, "bandpass"], [0.022, 0.011, 5200, 2.2, "highpass"]],
  },
  "arcane-burst": { signature: "arcane-detonation", layers: [[190, 860, 0.36, 0.045, "sine"], [470, 1320, 0.3, 0.025, "triangle"]], noises: [[0.22, 0.03, 1800, 1.2, "bandpass"]] },
  "arcane-burst-hit": { signature: "arcane-impact", layers: [[920, 260, 0.16, 0.03, "triangle"], [170, 75, 0.16, 0.025, "sine"]] },
  "time-stop": { signature: "clock-lock", layers: [[2100, 2100, 0.045, 0.026, "sine"], [270, 54, 0.46, 0.04, "triangle"]], noises: [[0.28, 0.022, 950, 5.5, "bandpass"]] },
  "time-release": { signature: "temporal-release", layers: [[72, 620, 0.3, 0.032, "triangle"], [330, 1200, 0.23, 0.016, "sine"]] },
  "volta-bolt-fired": { signature: "electric-charge", layers: [[320, 1280, 0.24, 0.036, "triangle"], [1040, 620, 0.09, 0.018, "sine"]], noises: [[0.14, 0.03, 4200, 0.8, "highpass"]] },
  "volta-bolt-bounce": { signature: "electric-ricochet", layers: [[1560, 760, 0.11, 0.032, "triangle"], [2440, 1320, 0.06, 0.018, "sine"]] },
  "volta-bolt-hit": { signature: "electric-impact", layers: [[1760, 145, 0.28, 0.045, "triangle"], [84, 46, 0.25, 0.032, "sine"]], noises: [[0.18, 0.04, 3600, 0.7, "highpass"]] },
  "ranged-fired": { signature: "ranged-launch", layers: [[260, 740, 0.16, 0.028, "triangle"], [1480, 980, 0.08, 0.018, "sine"]] },
  "ranged-hit": { signature: "ranged-impact", layers: [[190, 84, 0.2, 0.032, "sine"], [1120, 220, 0.12, 0.018, "triangle"]], noises: [[0.1, 0.026, 3200, 0.75, "highpass"]] },
  "crossbow-arrow-hit": { signature: "arrow-impact", layers: [[170, 62, 0.18, 0.034, "sine"], [1740, 380, 0.1, 0.018, "triangle"]] },
  "potion-aoe": { signature: "tonic-burst", layers: [[420, 1180, 0.24, 0.028, "sine"], [920, 1840, 0.12, 0.018, "triangle"]], noises: [[0.12, 0.024, 2200, 0.9, "bandpass"]] },
  "classic-bow-fired": {
    signature: "classic-bow-volley",
    fighterType: "bow",
    layers: [[1420, 210, 0.12, 0.03, "triangle"], [2160, 780, 0.07, 0.018, "sine"]],
    noises: [[0.08, 0.022, 4200, 0.72, "highpass"]],
  },
  "classic-arrow-hit": {
    signature: "classic-arrow-impact",
    fighterType: "bow",
    layers: [[1820, 240, 0.09, 0.022, "triangle"], [210, 74, 0.15, 0.025, "sine"]],
    noises: [[0.05, 0.016, 3400, 1.3, "bandpass"]],
  },
  "classic-bow-hit": {
    signature: "classic-bow-impact",
    fighterType: "bow",
    layers: [[1820, 240, 0.09, 0.022, "triangle"], [210, 74, 0.15, 0.025, "sine"]],
    noises: [[0.05, 0.016, 3400, 1.3, "bandpass"]],
  },
  "classic-potion-thrown": {
    signature: "classic-potion-toss",
    fighterType: "potion",
    layers: [[390, 920, 0.2, 0.02, "sine"], [1260, 760, 0.14, 0.016, "triangle"]],
    noises: [[0.06, 0.012, 2400, 1.4, "bandpass"]],
  },
  "classic-potion-buff": {
    signature: "classic-potion-buff",
    fighterType: "potion",
    layers: [[520, 1120, 0.24, 0.026, "triangle"], [940, 1880, 0.18, 0.018, "sine"]],
    noises: [[0.12, 0.018, 3100, 1.1, "highpass"]],
  },
  "classic-potion-hit": {
    signature: "classic-potion-impact",
    fighterType: "potion",
    layers: [[280, 1020, 0.2, 0.026, "triangle"], [1120, 460, 0.16, 0.018, "sine"]],
    noises: [[0.12, 0.022, 2300, 1.4, "bandpass"]],
  },
  "classic-potion-triangle-spawn": {
    signature: "classic-potion-triangle",
    fighterType: "potion",
    layers: [[760, 1380, 0.16, 0.018, "sine"], [1180, 1760, 0.12, 0.012, "triangle"]],
  },
  "classic-slice-scheduled": {
    signature: "classic-slice-windup",
    fighterType: "katana",
    layers: [[1260, 1960, 0.24, 0.016, "sine"]],
    noises: [[0.16, 0.014, 4100, 2.6, "bandpass"]],
  },
  "classic-slice-hit": {
    signature: "classic-delayed-slice",
    fighterType: "katana",
    layers: [[2820, 620, 0.12, 0.03, "triangle"], [1720, 310, 0.1, 0.018, "sine"]],
    noises: [[0.07, 0.022, 5200, 2.8, "highpass"]],
  },
  "classic-duplicate": {
    signature: "classic-duplicate-pop",
    fighterType: "duplicator",
    layers: [[380, 920, 0.2, 0.026, "triangle"], [760, 1520, 0.16, 0.016, "sine"]],
    noises: [[0.1, 0.018, 2600, 1.5, "bandpass"]],
  },
  "classic-orbital-hit": {
    signature: "classic-orbital-contact",
    fighterType: "orbital",
    layers: [[980, 420, 0.12, 0.024, "sine"], [1640, 760, 0.08, 0.016, "triangle"]],
  },
  "classic-orbital-growth": {
    signature: "classic-orbital-growth",
    fighterType: "orbital",
    layers: [[420, 1320, 0.22, 0.022, "triangle"], [760, 1960, 0.16, 0.014, "sine"]],
  },
  "classic-growth": {
    signature: "classic-growth",
    fighterType: "grower",
    layers: [[180, 740, 0.28, 0.026, "triangle"], [460, 1380, 0.2, 0.016, "sine"]],
    noises: [[0.13, 0.018, 1600, 1.2, "bandpass"]],
  },
  "classic-slam": {
    signature: "classic-slam",
    fighterType: "slammy",
    gain: 1.18,
    layers: [[98, 34, 0.32, 0.055, "sine"], [620, 160, 0.2, 0.03, "triangle"]],
    noises: [[0.16, 0.038, 680, 0.68, "lowpass"]],
  },
  "classic-body-hit": {
    signature: "classic-body-hit",
    layers: [[150, 58, 0.2, 0.04, "sine"], [720, 220, 0.12, 0.022, "triangle"]],
    noises: [[0.09, 0.028, 920, 0.8, "lowpass"]],
  },
  "poison-applied": { signature: "corrosive-hiss", layers: [[590, 210, 0.2, 0.022, "triangle"]], noises: [[0.24, 0.03, 2450, 0.7, "highpass"]] },
  "burn-applied": { signature: "ignition", layers: [[720, 230, 0.2, 0.028, "triangle"]], noises: [[0.26, 0.034, 1750, 0.55, "highpass"]] },
  "hailstorm-cast": { signature: "icy-wind", layers: [[1460, 410, 0.38, 0.026, "sine"], [2510, 1720, 0.25, 0.018, "sine"]], noises: [[0.32, 0.032, 4100, 1.3, "highpass"]] },
  "hailstorm-hit": { signature: "ice-fracture", layers: [[2820, 760, 0.12, 0.03, "sine"], [1840, 1240, 0.09, 0.018, "triangle"]], noises: [[0.08, 0.028, 5200, 2.8, "bandpass"]] },
  "gravity-lock": { signature: "gravity-lock", layers: [[118, 31, 0.55, 0.055, "sine"], [390, 64, 0.38, 0.026, "triangle"]], noises: [[0.24, 0.025, 480, 0.8, "lowpass"]] },
  "collision-hit": { signature: "body-ram", metal: true, fighterType: "aegis", gain: 1.08, layers: [[126, 54, 0.28, 0.042, "sine"], [710, 260, 0.16, 0.026, "triangle"]], noises: [[0.12, 0.028, 920, 0.8, "lowpass"]] },
  "aegis-rush": { signature: "berserker-rush", layers: [[155, 760, 0.46, 0.046, "sine"], [420, 1420, 0.38, 0.03, "sine"], [920, 1840, 0.28, 0.018, "triangle"]] },
  "invulnerable-block": { signature: "energy-deflection", layers: [[1320, 760, 0.16, 0.026, "sine"], [720, 1120, 0.13, 0.014, "triangle"]] },
  "last-stand": { signature: "last-stand-surge", layers: [[96, 420, 0.38, 0.036, "sine"], [720, 1440, 0.24, 0.022, "triangle"]], noises: [[0.18, 0.024, 1800, 1.4, "bandpass"]] },
  "mirage-decoy": { signature: "decoy-shimmer", layers: [[1860, 2540, 0.26, 0.02, "sine"], [720, 1320, 0.18, 0.012, "triangle"]] },
  "mirage-decoy-hit": { signature: "glass-fakeout", layers: [[2600, 900, 0.16, 0.026, "sine"], [1800, 420, 0.11, 0.014, "triangle"]], noises: [[0.12, 0.02, 5200, 2.8, "bandpass"]] },
  "echo-queued": { signature: "resonance-queued", layers: [[420, 840, 0.22, 0.016, "sine"]] },
  "echo-replay": { signature: "resonance-replay", layers: [[840, 320, 0.24, 0.026, "sine"], [1260, 620, 0.16, 0.014, "triangle"]] },
  "forge-heat-pickup": { signature: "heat-pickup", layers: [[310, 680, 0.14, 0.018, "triangle"]], noises: [[0.08, 0.018, 1400, 0.8, "highpass"]] },
  "world-cup-pickup": { signature: "world-cup-pickup", layers: [[360, 760, 0.15, 0.02, "triangle"]], noises: [[0.07, 0.015, 1600, 0.9, "highpass"]] },
  "world-cup-ball-hit": { signature: "soccer-ball-impact", layers: [[180, 92, 0.2, 0.032, "sine"], [720, 260, 0.13, 0.018, "triangle"]] },
  "world-cup-card-hit": { signature: "referee-card-impact", layers: [[1320, 480, 0.12, 0.024, "triangle"], [2480, 960, 0.08, 0.014, "sine"]], noises: [[0.065, 0.018, 3600, 2.1, "bandpass"]] },
  "forge-temper": { signature: "weapon-temper", layers: [[110, 70, 0.38, 0.04, "sine"], [880, 440, 0.2, 0.026, "triangle"]], noises: [[0.18, 0.028, 900, 0.75, "lowpass"]] },
  "static-charge": { signature: "wall-charge", layers: [[1080, 1840, 0.11, 0.018, "triangle"]] },
  "static-charged": { signature: "fully-charged", layers: [[620, 2100, 0.2, 0.028, "triangle"], [2480, 820, 0.08, 0.018, "sine"]] },
  "static-zap": { signature: "chain-zap", layers: [[2200, 120, 0.22, 0.034, "triangle"], [1120, 320, 0.12, 0.018, "sine"]], noises: [[0.16, 0.032, 4700, 0.6, "highpass"]] },
  "shade-phase": { signature: "shade-phase", layers: [[180, 54, 0.34, 0.026, "sine"], [620, 260, 0.16, 0.014, "triangle"]], noises: [[0.12, 0.018, 760, 1.1, "lowpass"]] },
  "hazard-bumper": { signature: "bumper", layers: [[240, 460, 0.1, 0.026, "triangle"]] },
  "hazard-portal": { signature: "portal", layers: [[210, 940, 0.24, 0.03, "sine"], [690, 280, 0.2, 0.016, "triangle"]] },
  "hazard-speed": { signature: "speed", layers: [[420, 820, 0.13, 0.024, "triangle"]] },
});

const SAMPLE_EVENT_SOUNDS = Object.freeze({
  victory: { sample: "match-finale", category: "announcer", gain: 1, maxDuration: MATCH_FINALE_DURATION_SECONDS, rateRange: [1, 1] },
  "time-stop": { sample: "chrono-time-stop", gain: 0.9, rateLimit: 0.2, maxDuration: 3.74, rateRange: [1, 1] },
  "weapon-hit": { sample: "weapon-hit", gain: 0.82, rateLimit: 0.07, maxDuration: 0.74, rateRange: [0.97, 1.03] },
  "weapon-clash": { sample: "weapon-clash", gain: 0.72, rateLimit: 0.12, maxDuration: 0.32, rateRange: [0.96, 1.03] },
  impact: { sample: "orb-collision", gain: 0.88, rateLimit: 0.08, maxDuration: 2.14, rateRange: [0.98, 1.02] },
  "forge-heat-pickup": { sample: "forge-item-pickup", gain: 0.76, rateLimit: 0.12, maxDuration: 1.56, rateRange: [0.99, 1.01] },
  "world-cup-pickup": { sample: "forge-item-pickup", gain: 0.8, rateLimit: 0.12, maxDuration: 1.56, rateRange: [0.99, 1.01] },
  "world-cup-card-use": { sample: "world-cup-card-use", gain: 0.92, rateLimit: 0.08, maxDuration: 3.36, rateRange: [0.99, 1.01] },
  "world-cup-ball-hit": { sample: "critical-hit", gain: 1.65, rateLimit: 0.045, maxDuration: 1.3, rateRange: [1, 1] },
  "world-cup-card-hit": { sample: "critical-hit", gain: 1.65, rateLimit: 0.045, maxDuration: 1.3, rateRange: [1, 1] },
  "classic-critical": { sample: "critical-hit", gain: 1.62, rateLimit: 0.045, maxDuration: 1.3, rateRange: [1, 1] },
  "race-speed-impact": { sample: "critical-hit", gain: 1.65, rateLimit: 0.045, maxDuration: 1.3, rateRange: [1, 1] },
  "world-cup-ko": { sample: "world-cup-ko", gain: 1.38, rateLimit: 0.12, maxDuration: 1.28, rateRange: [1, 1] },
  "race-bounce": { sample: "orb-collision", gain: 0.72, rateLimit: 0.075, maxDuration: 0.54, rateRange: [0.98, 1.02] },
  // Lazer's interval hit is a real bounce cue. Keep it unsuppressed and allow
  // a burst budget so a level-100 beam can layer one pop per 0.01-second hit.
  "race-laser-tick": { sample: "orb-collision", gain: 0.72, rateLimit: 0, maxDuration: 0.54, rateRange: [0.98, 1.02], allowBurst: true },
  "race-layer-break": { sample: "race-layer-break", gain: 1.08, rateLimit: 0.1, rateRange: [1, 1] },
  "race-mine-explosion": { sample: "orb-collision", gain: 0.72, rateLimit: 0, maxDuration: 0.54, rateRange: [0.98, 1.02] },
  "race-sticky-tick": { sample: "orb-collision", gain: 0.66, rateLimit: 0, maxDuration: 0.54, rateRange: [0.98, 1.02] },
  // Twins emit one event for each healing line contact. Reuse the existing
  // Forge pickup sample and leave the route unsuppressed so every heal tick
  // has a clear, deterministic pickup cue.
  "race-twins-heal": { sample: "forge-item-pickup", gain: 0.9, rateLimit: 0, maxDuration: 1.56, rateRange: [0.99, 1.01] },
  "race-math-bounce": { sample: "race-math-bounce", gain: 0.72, rateLimit: 0.075, maxDuration: 1, rateRange: [1, 1] },
  "race-vampire-bounce": { sample: "race-vampire-bounce", gain: 0.86, rateLimit: 0.075, rateRange: [0.98, 1.02] },
  "race-math-power": {
    sample: "race-math-power",
    gain: RACE_MATH_POWER_GAIN,
    rateLimit: 0.075,
    maxDuration: 1,
    rateRange: [1, 1],
    priorityEffects: true,
  },
  // Poison and Lag both deal discrete number-line ticks. Use the regular
  // bounce pop for every tick and keep the route unsuppressed at the tick
  // cadence so the sound stays aligned with each expanding ring.
  "race-poison-tick": { sample: "orb-collision", gain: 0.72, rateLimit: 0, maxDuration: 0.54, rateRange: [0.98, 1.02] },
  "race-lag-glitch-tick": { sample: "orb-collision", gain: 0.72, rateLimit: 0, maxDuration: 0.54, rateRange: [0.98, 1.02] },
  "race-rain-start": { sample: "black-hole-teleport", gain: 0.58, rateLimit: 0.2, maxDuration: 0.5, rateRange: [1, 1] },
  "race-rain-drop": { sample: "orb-collision", gain: 0.5, rateLimit: 0, maxDuration: 0.32, rateRange: [1.05, 1.12] },
  "race-hacker-result": { sample: "race-lag-glitch", gain: 0.84, rateLimit: 0.08, maxDuration: 1.8, rateRange: [1, 1] },
  "race-hacker-slammy-spawn": { sample: "forge-item-pickup", gain: 0.58, rateLimit: 0.12, maxDuration: 1.56, rateRange: [1, 1] },
  "race-miner-attach": { sample: "race-drill", gain: 0.56, rateLimit: 0.2, maxDuration: 0.5, rateRange: [1, 1] },
  "race-miner-upgrade": { sample: "forge-item-pickup", gain: 0.68, rateLimit: 0.2, maxDuration: 1.56, rateRange: [1, 1] },
  "race-miner-drill-tick": { sample: "race-drill", gain: 0.42, rateLimit: 0.18, maxDuration: 0.5, rateRange: [1, 1] },
  "race-miner-layer-break": { sample: "race-layer-break", gain: 0.94, rateLimit: 0.1, maxDuration: 1.2, rateRange: [1, 1] },
  "race-ying-yang-switch": { sample: "black-hole-teleport", gain: 0.82, rateLimit: 0.1, maxDuration: 0.5, offset: 0, rateRange: [1, 1] },
  "race-hydrogen-bomb-countdown-start": { sample: "hydrogen-bomb-siren", gain: 0.78, rateLimit: 0, loop: true, rateRange: [1, 1] },
  "race-hydrogen-bomb-explosion": { sample: "hydrogen-bomb-explosion", gain: 1.12, rateLimit: 0, maxDuration: 5.5, rateRange: [1, 1] },
  "race-hydrogen-bomb-flash-start": { sample: "hydrogen-bomb-ear-ringing", gain: 0.78, rateLimit: 0, maxDuration: 4, rateRange: [1, 1] },
  "race-tsar-bomb-countdown-start": { sample: "hydrogen-bomb-siren", gain: 0.82, rateLimit: 0, loop: true, rateRange: [1, 1] },
  "race-tsar-bomb-reactor-hit": { sample: "black-hole-impact", gain: 1.08, rateLimit: 0.1, maxDuration: 2.4, rateRange: [1.08, 1.14] },
  "race-tsar-bomb-explosion": { sample: "hydrogen-bomb-explosion", gain: 1.16, rateLimit: 0, maxDuration: 5.5, rateRange: [1, 1] },
  "race-tsar-bomb-flash-start": { sample: "hydrogen-bomb-ear-ringing", gain: 0.8, rateLimit: 0, maxDuration: 4, rateRange: [1, 1] },
  "race-all-in-one-activate": { sample: "race-math-power", gain: 1.0, rateLimit: 0.1, maxDuration: 1, rateRange: [1, 1] },
  "race-all-in-one-hydrogen-countdown-start": { sample: "hydrogen-bomb-siren", gain: 0.82, rateLimit: 0, loop: true, rateRange: [1, 1] },
  "race-all-in-one-hydrogen-explosion": { sample: "hydrogen-bomb-explosion", gain: 1.16, rateLimit: 0, maxDuration: 5.5, rateRange: [1, 1] },
  "race-all-in-one-hydrogen-flash-start": { sample: "hydrogen-bomb-ear-ringing", gain: 0.8, rateLimit: 0, maxDuration: 4, rateRange: [1, 1] },
  "race-antimatter-detonation": { sample: "hydrogen-bomb-explosion", gain: 1.08, rateLimit: 0.08, maxDuration: 5.5, rateRange: [1, 1] },
  "race-antimatter-orb-destroy": { sample: "hydrogen-bomb-ear-ringing", gain: 0.92, rateLimit: 0.08, maxDuration: 4, rateRange: [1, 1] },
  // Time Bomb's midnight uses the same temporal-lock cue as Classic's time orb.
  "race-time-bomb-midnight": { sample: "chrono-time-stop", gain: 0.9, rateLimit: 0.2, maxDuration: 3.74, rateRange: [1, 1] },
  "race-reality-spawn": { sample: "black-hole-teleport", gain: 0.72, rateLimit: 0.12, maxDuration: 0.5, rateRange: [1, 1] },
  "race-lag-glitch-start": { sample: "race-lag-glitch", gain: 0.9, rateLimit: 0.12, maxDuration: 1.8, rateRange: [1, 1] },
  "race-copycat-roulette-start": { sample: "jackpot-slot-spinning", gain: 0.82, rateLimit: 0, maxDuration: 1.03, rateRange: [1, 1] },
  "race-rgb-cycle": { sample: "jackpot-slot-spinning", gain: 0.82, rateLimit: 0, maxDuration: 1.03, rateRange: [1, 1] },
  "classic-hydrogen-bomb-countdown-start": { sample: "hydrogen-bomb-siren", gain: 0.78, rateLimit: 0, loop: true, rateRange: [1, 1] },
  "classic-hydrogen-bomb-flash-start": { sample: "hydrogen-bomb-ear-ringing", gain: 0.78, rateLimit: 0, maxDuration: 4, rateRange: [1, 1] },
  "race-drill": { sample: "race-drill", gain: 0.88, rateLimit: 0.08, maxDuration: 0.5, rateRange: [1, 1] },
  "race-jackpot-spin": { sample: "jackpot-slot-spinning", gain: 0.9, rateLimit: 0, maxDuration: 1.03, rateRange: [1, 1] },
  "race-jackpot-lever": { sample: "jackpot-slot-lever", gain: 0.94, rateLimit: 0, maxDuration: 1.03, rateRange: [1, 1] },
  "race-jackpot-result-jackpot": { sample: "forge-item-pickup", gain: 0.9, rateLimit: 0, maxDuration: 1.56, rateRange: [1, 1] },
  "race-jackpot-result-bust": { sample: "world-cup-ko", gain: 1.38, rateLimit: 0, maxDuration: 1.28, rateRange: [1, 1] },
  "race-meteor-horn": { sample: "meteor-horn", gain: 1.08, rateLimit: 0.1, maxDuration: 2.2, rateRange: [1, 1] },
  "race-meteor-strike": { sample: "meteor-strike", gain: 1.08, rateLimit: 0.24, maxDuration: 2.6, rateRange: [0.98, 1.02] },
  "race-meteor-pass": { sample: "meteor-strike", gain: 0.86, rateLimit: 0.24, maxDuration: 2.6, rateRange: [0.98, 1.02] },
  "race-berserker-horn": { sample: "meteor-horn", gain: 1.08, rateLimit: 0.1, maxDuration: 2.2, rateRange: [1, 1] },
  "race-black-hole-impact": { sample: "black-hole-impact", gain: 1.12, rateLimit: 0.2, maxDuration: 4.73, rateRange: [1, 1] },
  "race-black-hole-teleport-out": { sample: "black-hole-teleport", gain: 0.88, rateLimit: 0.1, maxDuration: 0.5, offset: 0, rateRange: [1, 1] },
  "race-black-hole-teleport-in": { sample: "black-hole-teleport", gain: 0.88, rateLimit: 0.1, maxDuration: 0.5, offset: 0.5, rateRange: [1, 1] },
  "race-charger-teleport": { sample: "black-hole-teleport", gain: 0.82, rateLimit: 0.08, maxDuration: 0.5, offset: 0, rateRange: [1, 1] },
  "race-charger-slam": { sample: "critical-hit", gain: 1.45, rateLimit: 0.08, maxDuration: 1.3, rateRange: [1, 1] },
  "race-bouncer-spawn": { sample: "forge-item-pickup", gain: 0.42, rateLimit: 0.06, maxDuration: 0.42, rateRange: [1.12, 1.18] },
  "race-blue-sun-start": { sample: "black-hole-impact", gain: 1.05, rateLimit: 0, maxDuration: 4.73, rateRange: [1, 1] },
  "race-blue-sun-hit": { sample: "cinder-burn-tick", gain: 0.54, rateLimit: 0.12, maxDuration: 0.32, rateRange: [1.08, 1.12] },
  "race-purple-sun-start": { sample: "black-hole-impact", gain: 1.12, rateLimit: 0, maxDuration: 4.73, rateRange: [0.92, 0.96] },
  "race-purple-sun-hit": { sample: "cinder-burn-tick", gain: 0.62, rateLimit: 0.12, maxDuration: 0.32, rateRange: [0.8, 0.86] },
  "race-phase-three-sun-start": { sample: "race-thunder", gain: 1.08, rateLimit: 0, maxDuration: 2.4, rateRange: [0.9, 0.96] },
  "race-phase-three-sun-hit": { sample: "cinder-burn-tick", gain: 0.72, rateLimit: 0.12, maxDuration: 0.32, rateRange: [1.02, 1.1] },
  "race-phase-two-sun-start": { sample: "race-thunder", gain: 0.92, rateLimit: 0, maxDuration: 2.4, rateRange: [1.02, 1.08] },
  "race-phase-two-sun-hit": { sample: "cinder-burn-tick", gain: 0.68, rateLimit: 0.12, maxDuration: 0.32, rateRange: [0.9, 0.98] },
  "race-trifecta-shockwave": { sample: "black-hole-impact", gain: 0.72, rateLimit: 0.12, maxDuration: 1.2, rateRange: [1.08, 1.16] },
  "race-gravitator-pull": { sample: "black-hole-teleport", gain: 0.48, rateLimit: 0.16, maxDuration: 0.5, rateRange: [0.86, 0.94] },
  "race-professor-spin": { sample: "jackpot-slot-spinning", gain: 0.84, rateLimit: 0, maxDuration: 1.03, rateRange: [1, 1] },
  // Scissor uses the same sword-slice sample as the held sword, but keeps a
  // dedicated event so the slow full-frame split animation stays audible.
  "race-scissor-split": { sample: "weapon-hit", gain: 0.92, rateLimit: 0, maxDuration: 0.74, rateRange: [0.98, 1.02] },
  "race-snake-grow": { sample: "forge-item-pickup", gain: 0.36, rateLimit: 0.08, maxDuration: 0.36, rateRange: [1.08, 1.14] },
  "race-snake-split": { sample: "black-hole-teleport", gain: 0.78, rateLimit: 0.1, maxDuration: 0.5, offset: 0, rateRange: [1, 1] },
  "race-vampire-steal": { sample: "cinder-burn-tick", gain: 0.5, rateLimit: 0.1, maxDuration: 0.32, rateRange: [0.78, 0.84] },
  "race-turret-spawn": { sample: "forge-item-pickup", gain: 0.48, rateLimit: 0.08, maxDuration: 0.42, rateRange: [1.08, 1.14] },
  "race-turret-fire": { sample: "orb-collision", gain: 0.48, rateLimit: 0.045, maxDuration: 0.22, rateRange: [1.18, 1.24] },
  "race-turret-hit": { sample: "orb-collision", gain: 0.68, rateLimit: 0.04, maxDuration: 0.54, rateRange: [0.92, 0.98] },
  "race-leech-tick": { sample: "cinder-burn-tick", gain: 0.48, rateLimit: 0.05, maxDuration: 0.32, rateRange: [0.72, 0.8] },
  "race-crusher-impact": { sample: "race-layer-break", gain: 0.76, rateLimit: 0.075, maxDuration: 0.8, rateRange: [0.72, 0.8] },
  "race-berserker-rage": { sample: "forge-item-pickup", gain: 0.5, rateLimit: 0.1, maxDuration: 0.42, rateRange: [0.72, 0.8] },
  "race-reactor-explosion": { sample: "black-hole-impact", gain: 1.08, rateLimit: 0.1, maxDuration: 2.4, rateRange: [1.08, 1.14] },
  "race-parasite-spawn": { sample: "black-hole-teleport", gain: 0.52, rateLimit: 0.08, maxDuration: 0.5, offset: 0, rateRange: [1.18, 1.24] },
  "race-parasite-tick": { sample: "orb-collision", gain: 0.62, rateLimit: 0.08, maxDuration: 0.54, rateRange: [0.96, 1.02] },
  "race-draft-upgrade": { sample: "forge-item-pickup", gain: 0.68, rateLimit: 0.06, maxDuration: 0.56, rateRange: [1, 1] },
  "race-draft-sword-swing": { sample: "weapon-hit", gain: 0.86, rateLimit: 0, maxDuration: 0.74, rateRange: [0.98, 1.02] },
  "race-draft-sword-hit": { sample: "orb-collision", gain: 0.72, rateLimit: 0, maxDuration: 0.54, rateRange: [0.92, 0.98] },
  "race-draft-rifle-fire": { sample: "race-draft-rifle-fire", gain: 0.84, rateLimit: 0.05, rateRange: [1, 1] },
  "race-grappler-fire": { sample: "race-draft-rifle-fire", gain: 0.78, rateLimit: 0.05, rateRange: [1, 1] },
  "race-grappler-ricochet": { sample: "orb-collision", gain: 0.54, rateLimit: 0.05, maxDuration: 0.4, rateRange: [1.06, 1.14] },
  "race-grappler-hit": { sample: "race-meteor-strike", gain: 0.92, rateLimit: 0.08, maxDuration: 2.6, rateRange: [0.96, 1.02] },
  "race-grappler-pull-start": { sample: "black-hole-teleport", gain: 0.68, rateLimit: 0.1, maxDuration: 0.5, rateRange: [1, 1] },
  "race-grappler-pull-end": { sample: "critical-hit", gain: 0.92, rateLimit: 0.08, maxDuration: 1.3, rateRange: [0.96, 1.02] },
  "race-artist-paint-start": { sample: "forge-item-pickup", gain: 0.56, rateLimit: 0.1, maxDuration: 1.56, rateRange: [1.02, 1.08] },
  "race-artist-painting-hit": { sample: "race-layer-break", gain: 0.78, rateLimit: 0.08, maxDuration: 1.2, rateRange: [1, 1] },
  "race-artist-heal": { sample: "forge-item-pickup", gain: 0.7, rateLimit: 0.12, maxDuration: 1.56, rateRange: [1.02, 1.08] },
  "race-artist-storm-strike": { sample: "critical-hit", gain: 0.84, rateLimit: 0.08, maxDuration: 1.3, rateRange: [1.02, 1.08] },
  "race-artist-summon-start": { sample: "hex-magic-burst", gain: 0.62, rateLimit: 0.1, maxDuration: 0.95, rateRange: [1.02, 1.08] },
  "race-artist-summon-attack": { sample: "hex-magic-burst", gain: 0.72, rateLimit: 0.06, maxDuration: 0.95, rateRange: [0.94, 1.04] },
  "race-pancake-flip": { sample: "orb-collision", gain: 0.58, rateLimit: 0.08, maxDuration: 0.54, rateRange: [0.9, 0.98] },
  "race-pancake-stack": { sample: "orb-collision", gain: 0.52, rateLimit: 0.1, maxDuration: 0.54, rateRange: [1.02, 1.08] },
  "race-pancake-stack-spawn": { sample: "orb-collision", gain: 0.44, rateLimit: 0.1, maxDuration: 0.54, rateRange: [1.08, 1.16] },
  "race-pancake-patch-create": { sample: "orb-collision", gain: 0.34, rateLimit: 0.12, maxDuration: 0.54, rateRange: [0.94, 1] },
  "race-pancake-butter-patch-create": { sample: "orb-collision", gain: 0.34, rateLimit: 0.12, maxDuration: 0.54, rateRange: [0.94, 1] },
  "race-pancake-patch-tick": { sample: "orb-collision", gain: 0.3, rateLimit: 0.14, maxDuration: 0.54, rateRange: [0.88, 0.96] },
  "race-pancake-hold-tick": { sample: "orb-collision", gain: 0.32, rateLimit: 0.14, maxDuration: 0.54, rateRange: [0.9, 0.98] },
  // Pancake keeps a soft collision read for butter impacts. Do not reuse the
  // meteor/explosion sample here: Pancake should never sound like a critical
  // hit or an explosive orb.
  "race-pancake-butter-meteor": { sample: "orb-collision", gain: 0.58, rateLimit: 0.12, maxDuration: 0.54, rateRange: [0.92, 0.98] },
  "race-pancake-butter-strike": { sample: "orb-collision", gain: 0.68, rateLimit: 0.12, maxDuration: 0.54, rateRange: [0.98, 1.04] },
  "race-pancake-butter-pass": { sample: "orb-collision", gain: 0.44, rateLimit: 0.12, maxDuration: 0.54, rateRange: [0.92, 1] },
  "race-tree-roots-start": { sample: "black-hole-impact", gain: 0.78, rateLimit: 0.1, maxDuration: 4.73, rateRange: [0.9, 0.98] },
  "race-tree-root-tick": { sample: "black-hole-teleport", gain: 0.42, rateLimit: 0.14, maxDuration: 0.5, rateRange: [0.86, 0.94] },
  "race-tree-roots-end": { sample: "black-hole-teleport", gain: 0.56, rateLimit: 0.1, maxDuration: 0.5, offset: 0.5, rateRange: [1.02, 1.08] },
  "race-draft-shotgun-fire": { sample: "race-draft-shotgun-fire", gain: 0.84, rateLimit: 0.05, rateRange: [1, 1] },
  "race-draft-pistol-fire": { sample: "race-draft-pistol-fire", gain: 0.84, rateLimit: 0.05, rateRange: [1, 1] },
  "race-draft-hit": { sample: "orb-collision", gain: 0.62, rateLimit: 0.04, maxDuration: 0.42, rateRange: [0.96, 1.02] },
  "race-sniper-fire": { sample: "race-draft-rifle-fire", gain: 0.9, rateLimit: 0.08, maxDuration: 0.72, rateRange: [0.92, 0.96] },
  "race-sniper-hit": { sample: "orb-collision", gain: 0.78, rateLimit: 0.04, maxDuration: 0.45, rateRange: [0.86, 0.92] },
  "race-sniper-ricochet": { sample: "orb-collision", gain: 0.58, rateLimit: 0.06, maxDuration: 0.4, rateRange: [1.04, 1.12] },
  "race-ricochet-bounce": { sample: "orb-collision", gain: 0.62, rateLimit: 0.04, maxDuration: 0.36, rateRange: [1.06, 1.14] },
  "race-commander-bombs": { sample: "forge-item-pickup", gain: 0.38, rateLimit: 0.08, maxDuration: 0.4, rateRange: [0.9, 0.96] },
  "race-commander-missile": { sample: "race-draft-rifle-fire", gain: 0.82, rateLimit: 0.08, maxDuration: 0.72, rateRange: [0.78, 0.84] },
  "race-commander-bomb-hit": { sample: "orb-collision", gain: 0.74, rateLimit: 0.04, maxDuration: 0.54, rateRange: [0.88, 0.94] },
  "race-commander-missile-hit": { sample: "meteor-strike", gain: 0.88, rateLimit: 0.1, maxDuration: 1.1, rateRange: [1.08, 1.14] },
  "race-commander-drone-hit": { sample: "orb-collision", gain: 0.52, rateLimit: 0.03, maxDuration: 0.36, rateRange: [1.1, 1.18] },
  "race-shrapnel-wall": { sample: "orb-collision", gain: 0.5, rateLimit: 0.04, maxDuration: 0.32, rateRange: [1.12, 1.2] },
  "race-shrapnel-burst": { sample: "race-layer-break", gain: 0.86, rateLimit: 0.08, maxDuration: 0.8, rateRange: [0.88, 0.94] },
  "race-shrapnel-hit": { sample: "orb-collision", gain: 0.46, rateLimit: 0.025, maxDuration: 0.3, rateRange: [1.16, 1.24] },
  "race-roulette-absorb": { sample: "black-hole-teleport", gain: 0.78, rateLimit: 0.08, maxDuration: 0.5, offset: 0, rateRange: [1.08, 1.14] },
  "race-architect-build-start": { sample: "weapon-hit", gain: 0.52, rateLimit: 0.12, maxDuration: 0.4, rateRange: [0.82, 0.9] },
  "race-architect-build": { sample: "forge-item-pickup", gain: 0.62, rateLimit: 0.08, maxDuration: 0.48, rateRange: [0.94, 1] },
  "race-architect-bounce": { sample: "orb-collision", gain: 0.68, rateLimit: 0.04, maxDuration: 0.4, rateRange: [1.04, 1.12] },
  "race-snowball-drain": { sample: "orb-collision", gain: 0.42, rateLimit: 0.1, maxDuration: 0.36, rateRange: [0.82, 0.9] },
  "race-countdown-blast": { sample: "critical-hit", gain: 0.96, rateLimit: 0.08, maxDuration: 0.8, rateRange: [0.88, 0.94] },
  "race-critical-hit": { sample: "critical-hit", gain: 0.9, rateLimit: 0.05, maxDuration: 0.65, rateRange: [0.96, 1.04] },
  "race-finish": { sample: "world-cup-ko", gain: 1.38, rateLimit: 0.12, maxDuration: 1.28, rateRange: [1, 1] },
  "burn-tick": { sample: "cinder-burn-tick", gain: 0.78, rateLimit: 0.08, maxDuration: 1.3, rateRange: [0.98, 1.02] },
  "arcane-burst": { sample: "hex-magic-burst", gain: 0.86, rateLimit: 0.16, maxDuration: 0.95, rateRange: [0.98, 1.02] },
  "aegis-rush": { sample: "aegis-rush", gain: 0.9, rateLimit: 0.18, maxDuration: 1.05, rateRange: [0.98, 1.01] },
});

// Gameplay emits the Pancake horn event so a future supplied horn can be
// added without changing simulation or renderer contracts. It intentionally
// has no sample asset and therefore produces no fetch, 404, or synthesized
// fallback until a real clip is installed.
export const FUTURE_AUDIO_ROUTE_CONTRACTS = Object.freeze({
  "race-pancake-butter-horn": Object.freeze({
    sample: null,
    status: "awaiting-user-supplied-clip",
  }),
});

// Classic's combat mix is intentionally sparse while its replacement library is
// being produced. Each simulation event has one replaceable sample slot. A null
// slot is fully silent (including synthesized fallback audio), and assigning an
// asset id here enables only that replacement without touching Orb Race or
// World Cup routing.
const CLASSIC_REPLACEMENT_SAMPLES = Object.freeze({
  "weapon-clash": "weapon-clash",
  "weapon-hit": null,
  // Classic body contacts and wall rebounds use the same supplied orb bounce
  // sample, while Orb Race keeps its existing event-specific mix below.
  impact: "orb-collision",
  "wall-hit": "orb-collision",
  "classic-bow-fired": null,
  "classic-bow-hit": "orb-collision",
  "classic-potion-thrown": null,
  "classic-potion-hit": "orb-collision",
  "classic-slice-hit": "orb-collision",
  "classic-body-hit": "orb-collision",
  "classic-slam": "orb-collision",
  "classic-orbital-hit": "orb-collision",
  "classic-punch-hit": "orb-collision",
  "classic-critical": "critical-hit",
  "classic-draftmaster-sword-hit": "orb-collision",
  "classic-blue-sun-hit": "orb-collision",
  "classic-arrow-hit": "orb-collision",
  // Classic ability starts that have a fighter-specific route below remain
  // eligible for that route, but the generic Forge pickup cue is intentionally
  // silent. This keeps guns, Trident, and every other Orb Foundry ability from
  // borrowing a Forge sound when no dedicated sample is selected.
  "classic-ability-start": null,
  "classic-projectile-fired": "race-draft-pistol-fire",
  "classic-projectile-hit": "orb-collision",
  "classic-trident-recall": "classic-trident-recall",
  "classic-hazard-spawn": "race-layer-break",
  "classic-dot-tick": "orb-collision",
  "classic-heal": null,
  "classic-hydrogen-detonate": "hydrogen-bomb-explosion",
  "classic-hydrogen-bomb-countdown-start": "hydrogen-bomb-siren",
  "classic-hydrogen-bomb-flash-start": "hydrogen-bomb-ear-ringing",
  "classic-bounce-damage": "orb-collision",
  "classic-snake-growth": null,
  "classic-minion-hit": "orb-collision",
  knockout: "world-cup-ko",
});

export const CLASSIC_AUDIO_POLICY = Object.freeze({
  enabledEventTypes: Object.freeze(
    [...new Set([
      ...Object.entries(CLASSIC_REPLACEMENT_SAMPLES)
        .filter(([, sample]) => Boolean(sample))
        .map(([type]) => type),
      // These event types can resolve through classicSampleRouteFor even when
      // their generic replacement slot is silent.
      "classic-ability-start",
      "classic-trapper-throw",
      "classic-trapper-caught",
      "classic-trident-recall",
      "classic-freeze",
      "classic-apple-collected",
      "classic-sword-deflect",
      "classic-slice-hit",
      "classic-zeus-thunder",
      "weapon-hit",
    ])],
  ),
  replacementSamples: CLASSIC_REPLACEMENT_SAMPLES,
});

function classicAudioEventEnabled(event = {}) {
  const fighterType = event.fighterType || event.sourceType || event.classicOrbId;
  if (event.gameplayMode === "classic" && fighterType === "frost-ball" && event.type !== "classic-freeze") return false;
  return event.gameplayMode !== "classic"
    || CLASSIC_AUDIO_POLICY.enabledEventTypes.includes(event.type);
}

function classicSampleRouteFor(event = {}) {
  if (event.gameplayMode !== "classic") return null;
  const fighterType = event.fighterType || event.sourceType || event.classicOrbId;
  if (fighterType === "frost-ball") {
    if (event.type !== "classic-freeze") return null;
    return { sample: "classic-snowball-freeze", gain: 0.9, rateLimit: 0.12, maxDuration: 1.4, rateRange: [0.96, 1.04] };
  }
  if (event.type === "classic-trapper-throw") {
    return { sample: "classic-trapper-throw", gain: 0.86, rateLimit: 0.04, maxDuration: 1.2, offset: 1.5, rateRange: [0.96, 1.04] };
  }
  if (event.type === "classic-trapper-caught") {
    return { sample: "classic-trapper-caught", gain: 0.92, rateLimit: 0.04, maxDuration: 0.9, rateRange: [0.96, 1.04] };
  }
  if (event.type === "classic-trident-recall") {
    return { sample: "classic-trident-recall", gain: 0.92, rateLimit: 0.08, maxDuration: 1.4, rateRange: [0.96, 1.04] };
  }
  if (event.type === "classic-apple-collected") {
    return event.friendly
      ? { sample: "forge-item-pickup", gain: 0.88, rateLimit: 0.08, maxDuration: 1.56, rateRange: [0.99, 1.01] }
      : { sample: "cinder-burn-tick", gain: 0.78, rateLimit: 0.08, maxDuration: 0.32, rateRange: [0.98, 1.02] };
  }
  if (event.type === "classic-sword-deflect") {
    return { sample: "weapon-hit", gain: 0.96, rateLimit: 0.04, maxDuration: 0.74, rateRange: [0.97, 1.03] };
  }
  if (
    ["classic-slice-hit", "classic-draftmaster-sword-hit"].includes(event.type)
    && ["sword", "draftmaster"].includes(fighterType)
  ) {
    // Sword contact is the one Classic damage route that keeps its dedicated
    // blade sample. Other orb damage remains on the shared bounce cue.
    return { sample: "weapon-hit", gain: 0.96, rateLimit: 0.04, maxDuration: 0.74, rateRange: [0.97, 1.03] };
  }
  if (event.type === "classic-zeus-thunder") {
    // One event is emitted per Zeus cast, so the long thunder sample is never
    // multiplied by the three visual talisman nodes.
    return { sample: "race-thunder", gain: 1.12, rateLimit: 0.9, maxDuration: 2.4, rateRange: [0.92, 1.02] };
  }
  if (event.type === "weapon-hit") {
    return ["sword", "draftmaster"].includes(fighterType)
      ? { sample: "weapon-hit", gain: 0.96, rateLimit: 0.04, maxDuration: 0.74, rateRange: [0.97, 1.03] }
      : null;
  }
  if (event.type === "classic-projectile-hit" && event.projectileKind === "saw") {
    // Sawball's blade contact is a weapon impact, not the generic orb pop.
    // The existing sword-hit sample gives the large disc contact a readable
    // metallic cue without adding a new missing-file route.
    return { sample: "weapon-hit", gain: 0.94, rateLimit: 0.04, maxDuration: 0.74, rateRange: [0.97, 1.03] };
  }
  if (event.type === "classic-dot-tick" && event.dotKind === "trap") {
    return { sample: "classic-trapper-caught", gain: 0.82, rateLimit: 0, maxDuration: 0.9, rateRange: [0.96, 1.04] };
  }
  if (event.type === "classic-dot-tick" && event.dotKind === "vampire-latch") {
    // Vampire drains once per fixed tick. Keep the hiss on each tick instead
    // of only the initial latch cue.
    return { sample: "classic-vampire-hiss", gain: 0.9, rateLimit: 0, maxDuration: 1.4, rateRange: [0.96, 1.02] };
  }
  if (event.type === "classic-ability-start") {
    if (fighterType === "boxer") {
      return { sample: "classic-boxer-punch", gain: 0.96, rateLimit: 0.12, maxDuration: 0.9, rateRange: [0.96, 1.04] };
    }
    if (fighterType === "vampire") {
      if (event.abilityKind !== "vampire" || event.latchPhase !== "latched" || event.latched === false) return null;
      return { sample: "classic-vampire-hiss", gain: 0.9, rateLimit: 0.3, maxDuration: 1.4, rateRange: [0.96, 1.02] };
    }
    if (fighterType === "blue-sun") {
      // Match Orb Race's established Blue Sun charge cue while keeping this
      // route Classic-specific and event-driven.
      return { sample: "black-hole-impact", gain: 1.05, rateLimit: 0.28, maxDuration: 4.73, rateRange: [1, 1] };
    }
    if (fighterType === "necromancer") {
      // The supplied spell-casting clip belongs only to the skull-lift
      // summon start. Minion arrows remain silent and no generic magic cue is
      // layered over the other Necromancer phases.
      if (event.abilityKind !== "summon") return null;
      return { sample: "classic-necromancer-summon", gain: 0.88, rateLimit: 0.2, maxDuration: 1.25, rateRange: [0.96, 1.02] };
    }
    if (fighterType === "flash") {
      return { sample: "race-thunder", gain: 1.08, rateLimit: 0.28, maxDuration: 1.05, rateRange: [1.08, 1.16] };
    }
    if (fighterType === "black-hole") {
      return { sample: "black-hole-teleport", gain: 1.02, rateLimit: 0.28, maxDuration: 1.1, rateRange: [0.94, 1.02] };
    }
    if (fighterType === "reactor") {
      // Reactor's countdown should preserve the complete supplied impact
      // sample; truncating it to the opening hit made the charge feel cut
      // short in Classic Orb Foundry.
      return { sample: "black-hole-impact", gain: 0.86, rateLimit: 0.22, maxDuration: 4.73, rateRange: [1.1, 1.18] };
    }
    if (fighterType === "hydrogen-bomb") {
      return { sample: "hydrogen-bomb-siren", gain: 0.72, rateLimit: 1, maxDuration: 1.4, rateRange: [1, 1] };
    }
  }
  if (event.type === "classic-projectile-fired") {
    if (fighterType === "trident") {
      return { sample: "classic-trident-throw", gain: 0.92, rateLimit: 0.08, maxDuration: 1.4, rateRange: [0.96, 1.04] };
    }
    // Necromancer minion arrows are intentionally silent. The summon cue is
    // still routed from classic-ability-start; firing every minion arrow
    // should not layer a magic burst on top of the visual bow release.
    if (fighterType === "necromancer") return null;
    if (["sniper", "rifle"].includes(fighterType)) {
      return { sample: "race-draft-rifle-fire", gain: 0.96, rateLimit: 0.06, maxDuration: 0.72, rateRange: [0.98, 1.03] };
    }
    if (fighterType === "shotgun") {
      return { sample: "race-draft-shotgun-fire", gain: 1, rateLimit: 0.08, maxDuration: 0.85, rateRange: [0.98, 1.02] };
    }
  }
  if (event.type === "classic-minion-hit") {
    return { sample: "orb-collision", gain: 0.64, rateLimit: 0.05, maxDuration: 0.54, rateRange: [0.94, 1.04] };
  }
  return null;
}

function raceDraftFireSampleKey(event = {}) {
  if (event.type !== "race-draft-fire") return null;
  const gunTier = Math.max(0, Math.min(2, Math.floor(Number(event.gunTier) || 0)));
  return [
    "race-draft-pistol-fire",
    "race-draft-rifle-fire",
    "race-draft-shotgun-fire",
  ][gunTier];
}

const ARTIST_AUDIO_SILENT_EVENT_TYPES = new Set([
  "race-artist-paint-start",
  "race-artist-heal",
]);

function artistAudioDisabledForEvent(event = {}) {
  if (ARTIST_AUDIO_SILENT_EVENT_TYPES.has(event.type)) return true;
  if (event.type === "race-bounce" && eventHasRaceAbility(event, "artists")) return true;
  if (event.type === "race-artist-painting-hit") {
    return String(event.paintingName || "").toUpperCase() !== "BLOOM";
  }
  if (event.type === "race-artist-summon-start") {
    return !["fairy", "monster"].includes(String(event.kind || "").toLowerCase());
  }
  if (["race-artist-summon-attack", "race-artist-summon-step"].includes(event.type)) {
    return String(event.kind || "").toLowerCase() !== "monster";
  }
  return false;
}

function artistAnnouncerCueDisabled(cue) {
  return DISABLED_ANNOUNCER_CUES.has(cue);
}

function emptyAnnouncerPlayback() {
  return {
    sequences: 0,
    requestedCues: [],
    spokenCues: [],
    fallbackCues: [],
  };
}

function customRaceSampleRouteFor(event = {}) {
  if (["race-hacker-copy-spawn", "race-hacker-child-bounce"].includes(event.type)) {
    const childOrbId = event.copiedOrbId || event.childOrbId || event.raceOrbId;
    if (childOrbId === "hydrogen-bomb") return null;
    const childSamples = {
      sniper: "race-draft-rifle-fire",
      rifle: "race-draft-rifle-fire",
      shotgun: "race-draft-shotgun-fire",
      pistol: "race-draft-pistol-fire",
      draftmaster: "race-draft-rifle-fire",
      vampire: "race-vampire-bounce",
      fibonacci: "race-math-bounce",
      "x-power": "race-math-power",
      "super-x-power": "race-math-power",
      sylvester: "race-math-power",
      tetration: "race-math-power",
      godzilla: "race-monster-growl",
      meteor: "meteor-strike",
      "black-hole": "black-hole-impact",
    };
    const sample = childSamples[childOrbId] || "orb-collision";
    return {
      sample,
      gain: event.type === "race-hacker-copy-spawn" ? 0.82 : 0.68,
      rateLimit: event.type === "race-hacker-copy-spawn" ? 0.08 : 0.075,
      maxDuration: sample === "race-math-power" ? 1 : 0.8,
      rateRange: [1, 1],
    };
  }
  if (event.type === "race-godzilla-step") {
    return { sample: "race-monster-footsteps", gain: 1.04, rateLimit: 0.18, maxDuration: 1.1, rateRange: [0.88, 0.98] };
  }
  if (event.type === "race-godzilla-impact") {
    const kind = String(event.kind || "").toLowerCase();
    if (kind === "tail-swipe") {
      return { sample: "race-godzilla-tail-smack", gain: 1.12, rateLimit: 0.22, maxDuration: 1.2, rateRange: [0.92, 1.02] };
    }
    if (kind === "stomp" && event.attack === true) {
      return { sample: "race-monster-footsteps", gain: 1.08, rateLimit: 0.18, maxDuration: 1.1, rateRange: [0.86, 0.96] };
    }
    if (kind === "heavy-landing") {
      return { sample: "race-monster-footsteps", gain: 1.18, rateLimit: 0.2, maxDuration: 1.1, rateRange: [0.78, 0.88] };
    }
  }
  if (event.type === "race-godzilla-look-up") {
    return { sample: "race-monster-growl", gain: 1.16, rateLimit: 0.4, maxDuration: 2.2, rateRange: [0.82, 0.92] };
  }
  if (event.type === "race-godzilla-charge") {
    return { sample: "race-godzilla-beam-charge", gain: 1.08, rateLimit: 0.9, maxDuration: 2.2, rateRange: [0.96, 1.02] };
  }
  if (event.type === "race-godzilla-atomic-breath") {
    return { sample: "race-thunder", gain: 1.12, rateLimit: 0.9, maxDuration: 2.4, rateRange: [0.92, 1.02] };
  }
  if (event.type === "race-artist-summon-start") {
    const kind = String(event.kind || "").toLowerCase();
    if (kind === "monster") {
      return { sample: "race-monster-growl", gain: 1, rateLimit: 0.1, maxDuration: 2.2, rateRange: [0.98, 1.02] };
    }
    if (kind === "fairy") {
      return { sample: "race-fairy-sparkle", gain: 0.9, rateLimit: 0.1, maxDuration: 1.8, rateRange: [0.98, 1.02] };
    }
  }
  if (["race-artist-summon-attack", "race-artist-summon-step"].includes(event.type)
    && String(event.kind || "").toLowerCase() === "monster") {
    return { sample: "race-monster-footsteps", gain: 0.92, rateLimit: 0.22, maxDuration: 1.1, rateRange: [0.94, 1.02] };
  }
  if (event.type === "race-artist-storm-strike") {
    return { sample: "race-thunder", gain: 1, rateLimit: 0.08, maxDuration: 2.4, rateRange: [0.98, 1.02] };
  }
  if (event.type === "race-artist-painting-hit"
    && String(event.paintingName || "").toUpperCase() === "BLOOM") {
    return { sample: "forge-item-pickup", gain: 0.9, rateLimit: 0.12, maxDuration: 1.56, rateRange: [1, 1] };
  }
  return null;
}

export function soundPlanForEvent(event = {}) {
  if (event.gameplayMode === "classic") return null;
  if (!classicAudioEventEnabled(event)) return null;
  const base = event.type === "weapon-hit"
    ? { signature: "metal-weapon-hit", metal: true }
    : event.type === "classic-body-hit" && event.fighterType === "slammy"
      ? EVENT_SOUNDS["classic-slam"]
      : EVENT_SOUNDS[event.type];
  if (!base) return null;
  const id = Number(event.id) || 1;
  const hash = hashValue(id);
  const pitchVariation = 1 + ((hash % 17) - 8) * 0.0045;
  const volumeVariation = 1 + (((hash >>> 8) % 9) - 4) * 0.018;
  const fighterType = base.fighterType || event.fighterType || event.sourceType || "";
  const signature = ORB_SIGNATURES[fighterType];
  const includeOrbSignature =
    signature && (base.metal || event.type === "weapon-hit");
  const layerSets = [
    ...(base.metal ? [METAL_FOUNDATION.layers] : []),
    base.layers || [],
    ...(includeOrbSignature ? [signature.layers] : []),
  ];
  const noiseSets = [
    ...(base.metal ? [METAL_FOUNDATION.noises] : []),
    base.noises || [],
    ...(includeOrbSignature ? [signature.noises] : []),
  ];
  const gain = Number(base.gain) || 1;
  const layers = layerSets.flat().map(([start, end, duration, volume, wave], index) => ({
    startFrequency: Math.max(20, start * pitchVariation * (1 + index * 0.002)),
    endFrequency: Math.max(20, end * pitchVariation),
    duration,
    volume: volume * volumeVariation * gain,
    wave,
    delay: index * 0.006,
    attack: Math.min(0.008, duration * 0.12),
  }));
  const noises = noiseSets.flat().map(([duration, volume, frequency, q, filterType], index) => ({
    duration,
    volume: volume * volumeVariation * gain,
    frequency: frequency * pitchVariation,
    q,
    filterType,
    offset: ((hash >>> (10 + index * 3)) % 260) / 1000,
    delay: index * 0.004,
  }));
  const eventX = Number(event.x);
  return {
    category: base.category || "effects",
    signature: includeOrbSignature ? `${base.signature}+${signature.name}` : base.signature,
    fighterType: fighterType || null,
    pan: Number.isFinite(eventX) ? Math.max(-0.72, Math.min(0.72, (eventX / 960) * 1.44 - 0.72)) : 0,
    layers,
    noises,
    noise: noises[0] || null,
    rateLimit: base.rateLimit ?? (["weapon-hit", "collision-hit", "impact", "wall-hit"].includes(event.type) ? 0.032 : 0),
  };
}

export function samplePlanForEvent(event = {}) {
  if (!classicAudioEventEnabled(event)) return null;
  if (artistAudioDisabledForEvent(event)) return null;
  if (
    event.gameplayMode === "classic"
    && event.type === "classic-projectile-fired"
    && (event.fighterType || event.sourceType || event.classicOrbId) === "necromancer"
  ) return null;
  // A knockout is immediately followed by a victory event. Use the dedicated
  // World Cup KO clip for every mode and prevent a second finale cue from layering.
  if (event.type === "victory") return null;
  const pancakeEvent = event.raceOrbId === "pancake"
    || event.raceAbilityId === "pancake"
    || (Array.isArray(event.raceAbilityIds) && event.raceAbilityIds.includes("pancake"));
  if (pancakeEvent && ["race-critical-hit", "race-reactor-explosion"].includes(event.type)) return null;
  if (event.type === "race-bounce" && event.raceOrbId === "speed-impact") return null;
  if (event.type === "race-bounce" && event.layerBroken) return null;
  const powerMathRaceBounce = event.type === "race-bounce"
    && event.surface === "number-line"
    && ["x-power", "super-x-power", "quadratic", "factorial", "centy", "infinity", "100x", "sylvester", "tetration", "square-root"].some((abilityId) => eventHasRaceAbility(event, abilityId));
  const mathRaceBounce = event.type === "race-bounce"
    && event.surface === "number-line"
    && ["fibonacci", "x-power", "super-x-power", "phi", "factorial", "prime", "integral", "quadratic", "pi", "cubed", "double", "tripler", "centy", "infinity", "100x", "sylvester", "tetration"]
      .some((abilityId) => eventHasRaceAbility(event, abilityId));
  const vampireRaceBounce = event.type === "race-bounce"
    && event.surface === "number-line"
    && eventHasRaceAbility(event, "vampire");
  const draftFireSample = raceDraftFireSampleKey(event);
  const customRaceSample = customRaceSampleRouteFor(event);
  const customClassicSample = classicSampleRouteFor(event);
  const classicReplacement = event.gameplayMode === "classic"
    ? CLASSIC_AUDIO_POLICY.replacementSamples[event.type]
    : null;
  const base = customClassicSample
    || customRaceSample
    || (classicReplacement
      ? {
      ...(SAMPLE_EVENT_SOUNDS[event.type] || {}),
      sample: classicReplacement,
      gain: SAMPLE_EVENT_SOUNDS[event.type]?.gain ?? 1,
      rateRange: SAMPLE_EVENT_SOUNDS[event.type]?.rateRange || [1, 1],
      }
      : countryWorldCupSampleEvent(event)
        || knockoutSampleEvent(event)
        || jackpotOutcomeSampleEvent(event)
        || (draftFireSample ? SAMPLE_EVENT_SOUNDS[draftFireSample] : null)
        || (vampireRaceBounce ? SAMPLE_EVENT_SOUNDS["race-vampire-bounce"] : null)
      || (powerMathRaceBounce ? SAMPLE_EVENT_SOUNDS["race-math-power"] : null)
        || (mathRaceBounce ? SAMPLE_EVENT_SOUNDS["race-math-bounce"] : null)
        || SAMPLE_EVENT_SOUNDS[event.type]);
  if (!base) return null;
  const id = Number(event.id) || `${event.type}:${event.fighterId || ""}:${event.targetId || ""}`;
  const hash = hashValue(`${base.sample}:${id}`);
  const [minRate, maxRate] = base.rateRange || [1, 1];
  const rateMix = (hash % 1000) / 999;
  const eventX = Number(event.x);
  return {
    category: base.category || "effects",
    sample: base.sample,
    signature: `sample:${base.sample}`,
    pan: Number.isFinite(eventX) ? Math.max(-0.72, Math.min(0.72, (eventX / 960) * 1.44 - 0.72)) : 0,
    gain: (Number(base.gain) || 1) * (1 + (((hash >>> 10) % 7) - 3) * 0.015),
    playbackRate: minRate + rateMix * (maxRate - minRate),
    maxDuration: base.maxDuration || 0,
    loop: base.loop === true,
    offset: event.type === "race-ying-yang-switch"
      ? (event.mode === "speed" ? 0 : 0.5)
      : base.offset || 0,
    rateLimit: base.rateLimit || 0,
    ...(base.allowBurst ? { allowBurst: true } : {}),
    ...(base.priorityEffects ? { priorityEffects: true } : {}),
    ...(base.duckNonAnnouncer ? { duckNonAnnouncer: true } : {}),
  };
}

export function eventHasRaceAbility(event = {}, abilityId) {
  return event.raceAbilityId === abilityId
    || event.raceOrbId === abilityId
    || (Array.isArray(event.raceAbilityIds) && event.raceAbilityIds.includes(abilityId));
}

export function samplePlaybackCountForEvent(event = {}) {
  if (event.type !== "race-bounce") return 1;
  return 1 + Math.max(0, Math.floor(Number(event.orbiterHits) || 0));
}

const WORLD_CUP_COUNTRY_ACTION_SAMPLES = Object.freeze({
  france: Object.freeze({
    pickup: "france-world-cup-pickup",
    pickupGain: 0.9,
    maxDuration: 1.65,
  }),
  norway: Object.freeze({
    pickup: "norway-world-cup-action",
    ballUse: "norway-world-cup-action",
    pickupGain: 0.9,
    ballUseGain: 0.96,
    maxDuration: 1.83,
  }),
  usa: Object.freeze({
    pickup: "usa-world-cup-action",
    ballUse: "usa-world-cup-action",
    pickupGain: 0.9,
    ballUseGain: 0.96,
    maxDuration: 2.96,
  }),
  england: Object.freeze({
    pickup: "england-world-cup-action",
    ballUse: "england-world-cup-action",
    pickupGain: 0.9,
    ballUseGain: 0.96,
    maxDuration: 1.61,
  }),
  argentina: Object.freeze({
    pickup: "argentina-world-cup-action",
    ballUse: "argentina-world-cup-action",
    pickupGain: 0.9,
    ballUseGain: 0.96,
    maxDuration: 1,
  }),
  portugal: Object.freeze({
    pickup: "portugal-world-cup-pickup",
    pickupGain: 0.9,
    maxDuration: 1.69,
  }),
  spain: Object.freeze({
    pickup: "spain-world-cup-action",
    ballUse: "spain-world-cup-action",
    pickupGain: 9,
    ballUseGain: 0.96,
    maxDuration: 1.08,
  }),
});

function countryWorldCupSampleEvent(event = {}) {
  const config = WORLD_CUP_COUNTRY_ACTION_SAMPLES[event.countryId];
  if (!config) return null;
  const sample =
    event.type === "world-cup-pickup"
      ? config.pickup
      : event.type === "world-cup-ball-use"
        ? config.ballUse
        : null;
  if (!sample) return null;
  return Object.freeze({
    sample,
    gain: event.type === "world-cup-ball-use" ? (config.ballUseGain ?? 0.96) : (config.pickupGain ?? 0.9),
    rateLimit: 0.08,
    maxDuration: config.maxDuration ?? 1.83,
    rateRange: [1, 1],
  });
}

function knockoutSampleEvent(event = {}) {
  if (event.type !== "knockout") return null;
  return SAMPLE_EVENT_SOUNDS["world-cup-ko"];
}

function jackpotOutcomeSampleEvent(event = {}) {
  if (event.type !== "race-jackpot-result") return null;
  if (event.outcome === "jackpot") return SAMPLE_EVENT_SOUNDS["race-jackpot-result-jackpot"];
  if (event.outcome === "unlucky") return SAMPLE_EVENT_SOUNDS["race-jackpot-result-bust"];
  return null;
}

export function announcerCueForEvent(event = {}) {
  if (event.type === "forge-overtime") return "overtime";
  return null;
}

export function announcerIntroSequence(leftType, rightType) {
  if (!ANNOUNCER_NAMES[leftType] || !ANNOUNCER_NAMES[rightType] || leftType === rightType) return null;
  return [`intro-${leftType}`, "race-versus", `intro-${rightType}`, "race-pick-your-winner"];
}

export function worldCupAnnouncerIntroSequence(leftCountryId, rightCountryId) {
  if (
    !WORLD_CUP_ANNOUNCER_NAMES[leftCountryId] ||
    !WORLD_CUP_ANNOUNCER_NAMES[rightCountryId] ||
    leftCountryId === rightCountryId
  ) return null;
  return [
    `intro-country-${leftCountryId}`,
    "versus",
    `intro-country-${rightCountryId}`,
    "world-cup-pick-your-winner",
  ];
}

export function raceAnnouncerIntroSequence(leftRacerId, rightRacerId, { includePrompt = true } = {}) {
  if (
    !RACE_ANNOUNCER_NAMES[leftRacerId] ||
    !RACE_ANNOUNCER_NAMES[rightRacerId] ||
    leftRacerId === rightRacerId
  ) return null;
  const sequence = [
    `intro-race-${leftRacerId}`,
    "race-versus",
    `intro-race-${rightRacerId}`,
  ];
  if (includePrompt) sequence.push("race-pick-your-winner");
  return sequence;
}

export function raceTeamAnnouncerIntroSequence(
  leftTeam,
  rightTeam,
  { includePrompt = true, includeMatchup = true, targetCue = null } = {},
) {
  const left = raceTeamAnnouncerCues(leftTeam);
  const right = raceTeamAnnouncerCues(rightTeam);
  const sequence = includeMatchup && left?.length && right?.length
    ? [...left, "race-versus", ...right]
    : [];
  if (targetCue) sequence.push(targetCue);
  else if (includePrompt) sequence.push("race-pick-your-winner");
  return sequence.length ? sequence : null;
}

// Classic uses the Orb Race team-announcement splice exactly: each selected
// orb name is separated by the generated `+` clip, grouped categories use the
// generated category clips, and four or more category/name parts collapse to
// the generated EVERYONE clip. Only the orb-name clips come from the Classic
// roster, so its established voice identities remain intact.
export function classicTeamAnnouncerIntroSequence(
  leftTeam,
  rightTeam,
  { includePrompt = true, includeMatchup = true } = {},
) {
  const left = classicTeamAnnouncerCues(leftTeam);
  const right = classicTeamAnnouncerCues(rightTeam);
  const sequence = includeMatchup && left?.length && right?.length
    ? [...left, "race-versus", ...right]
    : [];
  if (includePrompt) sequence.push("race-pick-your-winner");
  return sequence.length ? sequence : null;
}

function classicTeamAnnouncerCues(team) {
  const orbIds = Array.isArray(team) ? team : team?.orbIds;
  const options = Array.isArray(team) ? null : team?.options || team?.classicTeamOptions || null;
  const parts = classicTeamDisplayParts(orbIds, options);
  if (!parts.length) return null;
  return parts.flatMap((part, index) => {
    if (part.kind !== "orb" || part.orbIds.length !== 1) {
      return [
        ...(index > 0 ? ["race-plus"] : []),
        part.announcerCue,
        ...(part.orbIds.some((orbId) => options?.[orbId]?.boss === true) ? ["race-boss"] : []),
      ];
    }
    const count = Number(options?.[part.id]?.count);
    const announcementCount = Number.isFinite(count) ? Math.floor(count) : null;
    const countCue = announcementCount > 1 ? raceAnnouncerCountCueFor(announcementCount) : null;
    return [
      ...(index > 0 ? ["race-plus"] : []),
      ...(countCue ? [countCue] : []),
      part.announcerCue,
      ...(options?.[part.id]?.boss === true ? ["race-boss"] : []),
    ];
  });
}

function raceTeamAnnouncerCues(team) {
  const orbIds = Array.isArray(team) ? team : team?.orbIds;
  const options = Array.isArray(team) ? null : team?.options || team?.raceTeamOptions || null;
  const parts = raceTeamDisplayParts(orbIds);
  if (!parts.length) return null;
  return parts.flatMap((part, index) => {
    if (part.kind !== "orb" || part.orbIds.length !== 1) {
      return [
        ...(index > 0 ? ["race-plus"] : []),
        part.announcerCue,
      ];
    }
    const count = Number(options?.[part.id]?.count);
    const announcementCount = Number.isFinite(count) ? Math.floor(count) : null;
    const countCue = announcementCount > 1 ? raceAnnouncerCountCueFor(announcementCount) : null;
    const orbCue = raceComboAnnouncerCueFor(raceAbilityIdsFor(part.id, options?.[part.id])) || part.announcerCue;
    const buffedCue = options?.[part.id]?.buffed === true ? "race-buffed" : null;
    return [
      ...(index > 0 ? ["race-plus"] : []),
      ...(countCue ? [countCue] : []),
      orbCue,
      ...(buffedCue ? [buffedCue] : []),
    ];
  });
}

export async function loadAnnouncerAssets({
  fetcher,
  decode,
  manifest = ANNOUNCER_ASSETS,
  baseUrl = "./assets/audio/announcer/",
  cacheKey = ANNOUNCER_ASSET_VERSION,
} = {}) {
  if (typeof fetcher !== "function" || typeof decode !== "function") return { buffers: new Map(), failures: Object.keys(manifest) };
  const buffers = new Map();
  const failures = [];
  const cacheSuffix = cacheKey ? `?v=${encodeURIComponent(cacheKey)}` : "";
  await Promise.all(Object.entries(manifest).map(async ([cue, filename]) => {
    try {
      const response = await fetcher(`${baseUrl}${filename}${cacheSuffix}`);
      if (!response?.ok) throw new Error(`Unable to load ${filename}`);
      const buffer = await decode(await response.arrayBuffer());
      buffers.set(cue, buffer);
    } catch {
      failures.push(cue);
    }
  }));
  return { buffers, failures };
}

export async function loadSampleAssets({
  fetcher,
  decode,
  manifest = SAMPLE_ASSETS,
  baseUrl = "./assets/audio/effects/",
  cacheKey = SAMPLE_ASSET_VERSION,
} = {}) {
  if (typeof fetcher !== "function" || typeof decode !== "function") return { buffers: new Map(), failures: Object.keys(manifest) };
  const buffers = new Map();
  const failures = [];
  const cacheSuffix = cacheKey ? `?v=${encodeURIComponent(cacheKey)}` : "";
  await Promise.all(Object.entries(manifest).map(async ([sample, filename]) => {
    try {
      const response = await fetcher(`${baseUrl}${filename}${cacheSuffix}`);
      if (!response?.ok) throw new Error(`Unable to load ${filename}`);
      const buffer = await decode(await response.arrayBuffer());
      buffers.set(sample, buffer);
    } catch {
      failures.push(sample);
    }
  }));
  return { buffers, failures };
}

function hashValue(value) {
  let hash = typeof value === "number" ? value >>> 0 : 2166136261;
  if (typeof value !== "number") {
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

export class CombatAudio {
  constructor({ fetcher = globalThis.fetch?.bind(globalThis), announcerBaseUrl, sampleBaseUrl } = {}) {
    this.context = null;
    this.enabled = true;
    this.lastEventId = 0;
    this.masterGain = null;
    this.categoryGains = {};
    this.nonAnnouncerGain = null;
    this.priorityEffectsGain = null;
    this.recordingDestination = null;
    this.ambienceNodes = [];
    this.noiseBuffer = null;
    this.announcerBuffers = new Map();
    this.announcerFailures = [];
    this.announcerLoadPromise = null;
    this.announcerAssetsReady = false;
    this.announcerPlayback = emptyAnnouncerPlayback();
    this.sampleBuffers = new Map();
    this.sampleFailures = [];
    this.sampleLoadPromise = null;
    this.hydrogenSirenSource = null;
    this.hydrogenSirenGain = null;
    this.hydrogenSirenRequested = false;
    this.fetcher = fetcher;
    this.announcerBaseUrl = announcerBaseUrl || "./assets/audio/announcer/";
    this.sampleBaseUrl = sampleBaseUrl || "./assets/audio/effects/";
    this.lastPlayed = new Map();
    this.voiceStarts = [];
    this.duckUntil = 0;
    this.mathPowerDuckUntil = 0;
    this.mathPowerDuckReleaseUntil = 0;
    this.volumes = { master: 0.82, effects: 0.78, ambience: 0.13, music: 0.32, announcer: 1 };
    this.categoriesEnabled = { effects: true, ambience: true, music: true, announcer: true };
  }

  async unlock() {
    if (!this.context) this.createGraph();
    if (!this.context) return false;
    if (this.context.state === "suspended") await this.context.resume();
    if (!this.ambienceNodes.length) this.startAmbience();
    if (!this.announcerLoadPromise) this.loadAnnouncer();
    if (!this.sampleLoadPromise) this.loadSamples();
    await Promise.all([
      this.announcerLoadPromise.catch(() => 0),
      this.sampleLoadPromise.catch(() => 0),
    ]);
    if (this.hydrogenSirenRequested) this.playHydrogenSiren({ type: "race-hydrogen-bomb-countdown-start", id: 0 });
    return this.context.state === "running";
  }

  createGraph() {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = this.volumes.master;
    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 14;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.22;
    this.masterGain.connect(compressor);
    compressor.connect(this.context.destination);
    this.recordingDestination = this.context.createMediaStreamDestination();
    compressor.connect(this.recordingDestination);
    this.nonAnnouncerGain = this.context.createGain();
    this.nonAnnouncerGain.gain.value = 1;
    this.nonAnnouncerGain.connect(this.masterGain);
    this.priorityEffectsGain = this.context.createGain();
    this.priorityEffectsGain.gain.value = this.categoriesEnabled.effects ? this.volumes.effects : 0;
    this.priorityEffectsGain.connect(this.masterGain);
    this.noiseBuffer = this.createNoiseBuffer();

    for (const category of ["effects", "ambience", "music", "announcer"]) {
      const gain = this.context.createGain();
      gain.gain.value = this.categoriesEnabled[category] ? this.volumes[category] : 0;
      gain.connect(category === "announcer" ? this.masterGain : this.nonAnnouncerGain);
      this.categoryGains[category] = gain;
    }
  }

  async loadAnnouncer() {
    if (!this.context || this.announcerLoadPromise) return this.announcerLoadPromise;
    this.announcerLoadPromise = loadAnnouncerAssets({
      fetcher: this.fetcher,
      baseUrl: this.announcerBaseUrl,
      decode: (data) => this.context.decodeAudioData(data.slice(0)),
    }).then(({ buffers, failures }) => {
      this.announcerBuffers = buffers;
      this.announcerFailures = failures;
      this.announcerAssetsReady = true;
      return buffers.size;
    });
    return this.announcerLoadPromise;
  }

  async loadSamples() {
    if (!this.context || this.sampleLoadPromise) return this.sampleLoadPromise;
    this.sampleLoadPromise = loadSampleAssets({
      fetcher: this.fetcher,
      baseUrl: this.sampleBaseUrl,
      decode: (data) => this.context.decodeAudioData(data.slice(0)),
    }).then(({ buffers, failures }) => {
      this.sampleBuffers = buffers;
      this.sampleFailures = failures;
      return buffers.size;
    });
    return this.sampleLoadPromise;
  }

  announcerRecordingSnapshot() {
    return {
      assetsReady: this.announcerAssetsReady,
      loadedCueCount: this.announcerBuffers.size,
      failedCueCount: this.announcerFailures.length,
      sequences: this.announcerPlayback.sequences,
      requestedCueCount: this.announcerPlayback.requestedCues.length,
      spokenCueCount: this.announcerPlayback.spokenCues.length,
      fallbackCueCount: this.announcerPlayback.fallbackCues.length,
      requestedCues: [...this.announcerPlayback.requestedCues],
      spokenCues: this.announcerPlayback.spokenCues.map((cue) => ({ ...cue })),
      fallbackCues: [...this.announcerPlayback.fallbackCues],
      splitAnnouncerUsed: false,
      presentationWasSplit: false,
    };
  }

  reset({ preserveAnnouncerPlayback = false } = {}) {
    this.hydrogenSirenRequested = false;
    this.stopHydrogenSiren();
    this.lastEventId = 0;
    this.lastPlayed.clear();
    if (!preserveAnnouncerPlayback) this.announcerPlayback = emptyAnnouncerPlayback();
    this.mathPowerDuckUntil = 0;
    this.mathPowerDuckReleaseUntil = 0;
    if (this.nonAnnouncerGain && this.context) {
      this.nonAnnouncerGain.gain.cancelScheduledValues(this.context.currentTime);
      this.nonAnnouncerGain.gain.setTargetAtTime(1, this.context.currentTime, 0.02);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.hydrogenSirenRequested = false;
      this.stopHydrogenSiren();
    }
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(enabled ? this.volumes.master : 0, this.context.currentTime, 0.02);
  }

  setVolumes(values = {}) {
    for (const key of Object.keys(this.volumes)) {
      if (values[key] === undefined) continue;
      this.volumes[key] = Math.max(0, Math.min(1, Number(values[key]) || 0));
    }
    if (!this.context) return;
    this.masterGain.gain.setTargetAtTime(this.enabled ? this.volumes.master : 0, this.context.currentTime, 0.02);
    for (const category of Object.keys(this.categoryGains)) this.restoreCategoryGain(category, 0.02);
    this.restorePriorityEffectsGain(0.02);
  }

  setCategoryEnabled(category, enabled) {
    if (!(category in this.categoriesEnabled)) return;
    this.categoriesEnabled[category] = enabled;
    if (this.context) this.restoreCategoryGain(category, 0.02);
    if (category === "effects" && this.context) this.restorePriorityEffectsGain(0.02);
  }

  restoreCategoryGain(category, timeConstant = 0.04) {
    const gain = this.categoryGains[category];
    if (!gain) return;
    gain.gain.setTargetAtTime(
      this.categoriesEnabled[category] ? this.volumes[category] : 0,
      this.context.currentTime,
      timeConstant,
    );
  }

  restorePriorityEffectsGain(timeConstant = 0.04) {
    if (!this.priorityEffectsGain) return;
    this.priorityEffectsGain.gain.setTargetAtTime(
      this.categoriesEnabled.effects ? this.volumes.effects : 0,
      this.context.currentTime,
      timeConstant,
    );
  }

  consume(events) {
    for (const event of events) {
      if (event.id <= this.lastEventId) continue;
      this.lastEventId = event.id;
      if ([
        "race-hydrogen-bomb-explosion",
        "race-tsar-bomb-explosion",
        "race-all-in-one-hydrogen-explosion",
        "classic-hydrogen-detonate",
      ].includes(event.type)) {
        this.hydrogenSirenRequested = false;
        this.stopHydrogenSiren();
      }
      if (!this.enabled) continue;
      const announcerCue = announcerCueForEvent(event);
      if (announcerCue) this.playAnnouncer(announcerCue);
      const playbackCount = samplePlaybackCountForEvent(event);
      const initialSoundInstance = Number.isFinite(Number(event.soundInstance))
        ? Math.max(0, Math.floor(Number(event.soundInstance)))
        : 0;
      for (let index = 0; index < playbackCount; index += 1) {
        this.play({ ...event, soundInstance: initialSoundInstance + index });
      }
    }
  }

  play(eventOrType) {
    const event = typeof eventOrType === "string" ? { type: eventOrType, id: 1 } : eventOrType;
    if ([
      "race-hydrogen-bomb-explosion",
      "race-tsar-bomb-explosion",
      "race-all-in-one-hydrogen-explosion",
      "classic-hydrogen-detonate",
    ].includes(event.type)) {
      this.hydrogenSirenRequested = false;
      this.stopHydrogenSiren();
    }
    if ([
      "race-hydrogen-bomb-countdown-start",
      "race-tsar-bomb-countdown-start",
      "race-all-in-one-hydrogen-countdown-start",
      "classic-hydrogen-bomb-countdown-start",
    ].includes(event.type)) {
      if (!this.enabled) return false;
      this.hydrogenSirenRequested = true;
      return this.playHydrogenSiren(event);
    }
    if (!this.context || this.context.state !== "running") return false;
    const samplePlan = samplePlanForEvent(event);
    if (samplePlan && this.sampleBuffers.has(samplePlan.sample)) return this.playSample(samplePlan, event);
    const plan = soundPlanForEvent(event);
    if (!plan || !this.categoriesEnabled[plan.category]) return false;
    const now = this.context.currentTime;
    const raceVoiceId = event.fighterId || event.sourceId || event.orbId;
    const rateKey = event.type?.startsWith("race-") && raceVoiceId
      ? `${event.type}:${plan.fighterType || "base"}:${raceVoiceId}`
      : `${event.type}:${plan.fighterType || "base"}`;
    if (plan.rateLimit && now - (this.lastPlayed.get(rateKey) ?? -Infinity) < plan.rateLimit) return false;
    if (!this.reserveVoices(plan.layers.length + plan.noises.length)) return false;
    this.lastPlayed.set(rateKey, now);
    for (const layer of plan.layers) this.playLayer(layer, plan.category, plan.pan);
    for (const noise of plan.noises) this.playNoise(noise, plan.category, plan.pan);
    return true;
  }

  playHydrogenSiren(event = {}) {
    if (
      !this.enabled
      || !this.context
      || this.context.state !== "running"
      || !this.categoriesEnabled.effects
      || this.hydrogenSirenSource
    ) return Boolean(this.hydrogenSirenSource);
    const plan = samplePlanForEvent({
      ...event,
      type: "race-hydrogen-bomb-countdown-start",
      // The shared loop sample is defined in the Race event table. When a
      // Classic countdown requests it, bypass Classic's allow-list for this
      // normalized lookup while keeping the public event Classic-specific.
      gameplayMode: event.gameplayMode === "classic" ? "orb-race" : event.gameplayMode,
    });
    if (!plan) return false;
    const buffer = this.sampleBuffers.get(plan.sample);
    if (!buffer) {
      if (!this.sampleLoadPromise) this.loadSamples();
      this.sampleLoadPromise?.then(() => {
        if (this.hydrogenSirenRequested) this.playHydrogenSiren(event);
      });
      return false;
    }
    if (!this.reserveVoices(1, { allowBurst: plan.allowBurst === true })) return false;
    const now = this.context.currentTime;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = 0;
    source.loopEnd = buffer.duration;
    source.playbackRate.value = Math.max(0.25, plan.playbackRate || 1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(Math.max(0.0001, plan.gain), now + 0.035);
    source.connect(gain);
    this.connectVoice(gain, "effects", 0);
    source.onended = () => {
      if (this.hydrogenSirenSource !== source) return;
      this.hydrogenSirenSource = null;
      this.hydrogenSirenGain = null;
    };
    this.hydrogenSirenSource = source;
    this.hydrogenSirenGain = gain;
    source.start(now, 0);
    return true;
  }

  stopHydrogenSiren() {
    const source = this.hydrogenSirenSource;
    const gain = this.hydrogenSirenGain;
    this.hydrogenSirenSource = null;
    this.hydrogenSirenGain = null;
    if (!source || !this.context) return false;
    const now = this.context.currentTime;
    try {
      gain?.gain.cancelScheduledValues(now);
      gain?.gain.setTargetAtTime(0.0001, now, 0.018);
      source.stop(now + 0.075);
    } catch {
      // A source may have ended between event consumption and the stop call.
    }
    return true;
  }

  playSample(plan, event = {}) {
    if (!plan || !this.categoriesEnabled[plan.category]) return false;
    const buffer = this.sampleBuffers.get(plan.sample);
    if (!buffer) return false;
    const now = this.context.currentTime;
    const raceVoiceId = event.fighterId || event.sourceId || event.orbId;
    const rateKey = event.type?.startsWith("race-") && raceVoiceId
      ? `${event.type}:${plan.sample}:${raceVoiceId}:${event.soundInstance || 0}`
      : `${event.type}:${plan.sample}`;
    if (plan.rateLimit && now - (this.lastPlayed.get(rateKey) ?? -Infinity) < plan.rateLimit) return false;
    if (!this.reserveVoices(1, { allowBurst: plan.allowBurst === true })) return false;
    this.lastPlayed.set(rateKey, now);

    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    const offset = Math.max(0, Math.min(plan.offset || 0, Math.max(0, buffer.duration - 0.01)));
    const availableDuration = Math.max(0.03, (buffer.duration - offset) / Math.max(0.25, plan.playbackRate || 1));
    const duration = plan.maxDuration ? Math.min(plan.maxDuration, availableDuration) : availableDuration;
    const fadeIn = Math.min(0.012, duration * 0.12);
    const fadeOut = Math.min(0.055, duration * 0.28);
    source.buffer = buffer;
    source.playbackRate.value = Math.max(0.25, plan.playbackRate || 1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(Math.max(0.0001, plan.gain), now + fadeIn);
    gain.gain.setValueAtTime(Math.max(0.0001, plan.gain), now + Math.max(fadeIn, duration - fadeOut));
    gain.gain.linearRampToValueAtTime(0.0001, now + duration);
    source.connect(gain);
    this.connectVoice(gain, plan.priorityEffects ? "priority-effects" : plan.category, plan.pan);
    if (plan.duckNonAnnouncer) this.duckForMathPower(duration);
    source.start(now, offset);
    source.stop(now + duration + 0.025);
    return true;
  }

  playMatchup(leftType, rightType) {
    return this.playAnnouncerSequence(announcerIntroSequence(leftType, rightType));
  }

  playClassicMatchup(
    leftTeam,
    rightTeam,
    { includePrompt = true, includeMatchup = true } = {},
  ) {
    return this.playAnnouncerSequence(classicTeamAnnouncerIntroSequence(leftTeam, rightTeam, {
      includePrompt,
      includeMatchup,
    }));
  }

  playWorldCupMatchup(leftCountryId, rightCountryId) {
    return this.playAnnouncerSequence(worldCupAnnouncerIntroSequence(leftCountryId, rightCountryId));
  }

  playRaceMatchup(
    leftTeam,
    rightTeam,
    { includePrompt = true, includeMatchup = true, targetCue = null } = {},
  ) {
    const hasTeamContext = [leftTeam, rightTeam].some((value) => (
      Array.isArray(value) || (value && typeof value === "object" && Array.isArray(value.orbIds))
    ));
    const sequence = hasTeamContext
      ? raceTeamAnnouncerIntroSequence(leftTeam, rightTeam, {
        includePrompt,
        includeMatchup,
        targetCue,
      })
      : raceAnnouncerIntroSequence(leftTeam, rightTeam, { includePrompt });
    return this.playAnnouncerSequence(sequence);
  }

  playAnnouncerSequence(sequence) {
    if (!sequence) return false;
    const playableSequence = sequence.filter((cue) => !artistAnnouncerCueDisabled(cue));
    if (!playableSequence.length) return false;
    this.announcerPlayback.sequences += 1;
    let delay = 0;
    let played = false;
    for (const [index, cue] of playableSequence.entries()) {
      const fallback = ANNOUNCER_FALLBACKS[cue];
      const buffer = this.announcerBuffers.get(cue) || (fallback ? this.announcerBuffers.get(fallback) : null);
      played = this.playAnnouncer(cue, delay) || played;
      const duration = buffer?.duration || 0.7;
      delay += duration + (index === sequence.length - 2 ? 0.38 : 0.16);
    }
    return played;
  }

  playAnnouncer(cue, delay = 0) {
    if (artistAnnouncerCueDisabled(cue)) return false;
    this.announcerPlayback.requestedCues.push(cue);
    if (!this.enabled || !this.context || this.context.state !== "running" || !this.categoriesEnabled.announcer) return false;
    const fallbackCue = ANNOUNCER_FALLBACKS[cue];
    const primaryBuffer = this.announcerBuffers.get(cue);
    const buffer = primaryBuffer || this.announcerBuffers.get(fallbackCue);
    if (!buffer) {
      this.announcerPlayback.fallbackCues.push(cue);
      this.playAnnouncerFallback(cue, delay);
      return false;
    }
    this.announcerPlayback.spokenCues.push({
      requestedCue: cue,
      resolvedCue: primaryBuffer ? cue : fallbackCue,
    });
    const startAt = this.context.currentTime + Math.max(0, Number(delay) || 0);
    const source = this.context.createBufferSource();
    const voiceGain = this.context.createGain();
    source.buffer = buffer;
    voiceGain.gain.value = announcerPlaybackGainForCue(cue);
    source.connect(voiceGain);
    voiceGain.connect(this.categoryGains.announcer);
    this.duckFor(Math.max(0.45, delay + buffer.duration + 0.08));
    source.start(startAt);
    return true;
  }

  playAnnouncerFallback(cue, delay = 0) {
    const hash = hashValue(cue);
    const root = 150 + (hash % 5) * 18;
    const emphatic = cue === "fight";
    const duration = emphatic ? 0.34 : 0.22;
    this.duckFor(delay + duration + 0.12);
    [
      { startFrequency: root * 2, endFrequency: root, duration, volume: emphatic ? 0.055 : 0.035, wave: "triangle", delay, attack: 0.006 },
      { startFrequency: root * 3.02, endFrequency: root * 1.5, duration: duration * 0.86, volume: 0.022, wave: "sine", delay: delay + 0.018, attack: 0.004 },
    ].forEach((layer) => this.playLayer(layer, "announcer", 0));
  }

  duckFor(duration) {
    const now = this.context.currentTime;
    this.duckUntil = Math.max(this.duckUntil, now + duration);
    for (const category of ["effects", "ambience", "music"]) {
      const gain = this.categoryGains[category]?.gain;
      if (!gain || !this.categoriesEnabled[category]) continue;
      const base = this.volumes[category];
      const ducked = base * ANNOUNCER_DUCK_GAINS[category];
      gain.cancelScheduledValues(now);
      gain.setValueAtTime(Math.min(gain.value, base), now);
      gain.linearRampToValueAtTime(ducked, now + 0.035);
      gain.setValueAtTime(ducked, this.duckUntil);
      gain.linearRampToValueAtTime(base, this.duckUntil + ANNOUNCER_DUCK_RELEASE_SECONDS);
    }
  }

  duckForMathPower(duration) {
    const gain = this.nonAnnouncerGain?.gain;
    if (!gain || !this.context) return;
    const now = this.context.currentTime;
    const previousDuckUntil = this.mathPowerDuckUntil;
    const previousReleaseUntil = this.mathPowerDuckReleaseUntil;
    const previousDuration = Math.max(0.001, previousReleaseUntil - previousDuckUntil);
    const currentGain = now < previousDuckUntil
      ? RACE_MATH_POWER_DUCK_GAIN
      : now < previousReleaseUntil
        ? RACE_MATH_POWER_DUCK_GAIN + (1 - RACE_MATH_POWER_DUCK_GAIN)
          * ((now - previousDuckUntil) / previousDuration)
        : 1;
    this.mathPowerDuckUntil = Math.max(previousDuckUntil, now + Math.max(0.08, Number(duration) || 0));
    this.mathPowerDuckReleaseUntil = this.mathPowerDuckUntil + RACE_MATH_POWER_DUCK_RELEASE_SECONDS;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(currentGain, now);
    gain.linearRampToValueAtTime(RACE_MATH_POWER_DUCK_GAIN, now + 0.02);
    gain.setValueAtTime(RACE_MATH_POWER_DUCK_GAIN, this.mathPowerDuckUntil);
    gain.linearRampToValueAtTime(
      1,
      this.mathPowerDuckUntil + RACE_MATH_POWER_DUCK_RELEASE_SECONDS,
    );
  }

  reserveVoices(count, { allowBurst = false } = {}) {
    const now = this.context.currentTime;
    this.voiceStarts = this.voiceStarts.filter((time) => now - time < 0.5);
    const voiceBudget = allowBurst ? 128 : 44;
    if (this.voiceStarts.length + count > voiceBudget) return false;
    for (let index = 0; index < count; index += 1) this.voiceStarts.push(now);
    return true;
  }

  playLayer(layer, category, pan = 0) {
    const now = this.context.currentTime + layer.delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = layer.wave;
    oscillator.frequency.setValueAtTime(layer.startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(layer.endFrequency, now + layer.duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, layer.volume), now + layer.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + layer.duration);
    oscillator.connect(gain);
    this.connectVoice(gain, category, pan);
    oscillator.start(now);
    oscillator.stop(now + layer.duration + 0.025);
  }

  playNoise(noise, category, pan = 0) {
    if (!this.noiseBuffer) return;
    const now = this.context.currentTime + noise.delay;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = noise.filterType;
    filter.frequency.setValueAtTime(noise.frequency, now);
    filter.Q.setValueAtTime(noise.q, now);
    gain.gain.setValueAtTime(Math.max(0.0001, noise.volume), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + noise.duration);
    source.connect(filter);
    filter.connect(gain);
    this.connectVoice(gain, category, pan);
    source.start(now, Math.min(noise.offset, this.noiseBuffer.duration - noise.duration));
    source.stop(now + noise.duration + 0.025);
  }

  connectVoice(node, category, pan = 0) {
    const destination = category === "priority-effects"
      ? this.priorityEffectsGain
      : this.categoryGains[category];
    if (!destination) return false;
    if (typeof this.context.createStereoPanner !== "function" || Math.abs(pan) < 0.01) {
      node.connect(destination);
      return true;
    }
    const panner = this.context.createStereoPanner();
    panner.pan.value = pan;
    node.connect(panner);
    panner.connect(destination);
    return true;
  }

  createNoiseBuffer() {
    const frameCount = Math.ceil(this.context.sampleRate * 0.65);
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate);
    const channel = buffer.getChannelData(0);
    let state = 0x6d2b79f5;
    for (let index = 0; index < frameCount; index += 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      channel[index] = (state / 4294967296) * 2 - 1;
    }
    return buffer;
  }

  startAmbience() {
    if (!this.context || this.ambienceNodes.length) return;
    const oscillator = this.context.createOscillator();
    const overtone = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sine";
    overtone.type = "sine";
    oscillator.frequency.value = 43;
    overtone.frequency.value = 86.4;
    gain.gain.value = 0.025;
    oscillator.connect(gain);
    overtone.connect(gain);
    gain.connect(this.categoryGains.ambience);
    oscillator.start();
    overtone.start();
    this.ambienceNodes.push(oscillator, overtone, gain);
  }

  getRecordingStream() {
    return this.recordingDestination?.stream || null;
  }
}
