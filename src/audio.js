import {
  ORB_RACE_COMBO_NAMES,
  raceAbilityIdsFor,
  raceComboAnnouncerCueFor,
  raceTeamDisplayParts,
} from "./orb-race.js?v=20261108-arena-cut1";
import {
  classicTeamDisplayParts,
} from "./classic-orbs.js?v=20261110-shared-lunge1";
import { classicSignatureSoundFor, classicSignatureSuppressesGenericSample } from "./classic-signatures.js?v=20261110-shared-lunge1";
import { CLASSIC_POWER_MOVES } from "./classic-powers.js?v=20261109-classic-publish1";
import { classicShowcaseSoundFor } from "./classic-showcase-audio.js?v=20261110-shared-lunge1";

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
  wdc: "WDC",
  "one-punch-man": "One Punch Man",
  gojo: "Gojo",
  "john-rod": "John Rod",
  "one-above-all": "One Above All",
  knight: "Knight",
  "ben-10": "Ben 10",
  "darth-vader": "Darth Vader",
  "luke-skywalker": "Luke Skywalker",
  magneto: "Magneto",
  kratos: "Kratos",
  "doctor-strange": "Doctor Strange",
  gambit: "Gambit",
  rubber: "Rubber",
  pinball: "Pinball",
  origami: "Origami",
  "sand-pharaoh": "Sand Pharaoh",
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

export const ANNOUNCER_ASSET_VERSION = "20261110-shared-lunge1";
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
  "intro-wdc": "classic-local/wdc.mp3",
  "intro-one-punch-man": "classic-local/one-punch-man.mp3",
  "intro-gojo": "classic-local/gojo.mp3",
  "intro-john-rod": "classic-local/john-rod.mp3",
  "intro-one-above-all": "classic-local/one-above-all.mp3",
  "intro-knight": "classic-local/knight.mp3",
  "intro-ben-10": "classic-local/ben-10.mp3",
  "intro-darth-vader": "classic-local/darth-vader.mp3",
  "intro-luke-skywalker": "classic-local/luke-skywalker.mp3",
  ...Object.fromEntries(["magneto", "kratos", "doctor-strange", "gambit", "rubber", "pinball", "origami", "sand-pharaoh"]
    .map((id) => [`intro-${id}`, `classic-local/${id}.mp3`])),
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
  "classic-luke-swing": "classic-luke-swing.mp3",
  "classic-luke-reverse": "classic-luke-reverse.mp3",
  "classic-luke-vault": "classic-luke-vault.mp3",
  "classic-luke-lunge": "classic-luke-lunge.mp3",
  "classic-luke-evade": "classic-luke-evade.mp3",
  "classic-vader-swing": "classic-vader-swing.mp3",
  "classic-vader-throw": "classic-vader-throw.mp3",
  "classic-vader-return": "classic-vader-return.mp3",
  "classic-omnitrix-dial": "classic-omnitrix-dial.mp3",
  "classic-omnitrix-transform": "classic-omnitrix-transform.mp3",
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
export const SAMPLE_ASSET_VERSION = "20261108-classic-sabers1";

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

const WDC_CUE_SOUNDS = Object.freeze({
  bounce: { signature: "wdc-bounce", rateLimit: .042, layers: [[274, 126, .072, .16, "sine"], [830, 550, .035, .043, "triangle"]], noises: [[.022, .025, 2260, 1.4, "bandpass"]] },
  portal: { signature: "wdc-portal", layers: [[66, 151, .59, .15, "sine", 0, .095], [128, 292, .52, .072, "triangle", .025, .16], [657, 413, .34, .048, "sine", .18, .063]], noises: [[.51, .074, 950, 1.35, "bandpass", .02, .13], [.13, .045, 3300, 1.8, "bandpass", .29]] },
  summon: { signature: "wdc-summon", layers: [[371, 143, .16, .13, "sine"], [832, 616, .22, .079, "sine", .026], [1260, 1120, .27, .037, "triangle", .058]], noises: [[.18, .058, 1980, .88, "bandpass"]] },
  recall: { signature: "wdc-recall", layers: [[440, 112, .28, .106, "triangle"], [806, 210, .18, .03, "sine", .045]], noises: [[.24, .049, 1380, .95, "bandpass", 0, .045]] },
  windup: { signature: "wdc-punch-windup", noises: [[.142, .083, 1480, .9, "bandpass", 0, .023], [.062, .040, 4150, .85, "highpass", .036]] },
  punch: { signature: "wdc-punch", layers: [[178, 52, .14, .30, "sine"], [412, 92, .061, .126, "triangle"]], noises: [[.092, .16, 1770, 1.1, "bandpass"], [.033, .10, 4600, .85, "highpass"]] },
  serious: { signature: "wdc-serious-punch", priorityEffects: true, layers: [[109, 32, .39, .36, "sine"], [415, 72, .19, .14, "triangle"], [76, 27, .47, .15, "sine", .08, .039]], noises: [[.10, .21, 2360, .82, "bandpass"], [.33, .13, 620, .78, "lowpass", .023]] },
  charge: { signature: "wdc-exoelectric-charge", layers: [[76, 276, .75, .12, "triangle", 0, .18], [351, 1860, .64, .058, "sine", .055, .22], [582, 2300, .42, .034, "triangle", .20, .17]], noises: [[.57, .070, 1930, 1.7, "bandpass", .11, .11]] },
  beam: { signature: "wdc-exoelectric-beam", priorityEffects: true, layers: [[103, 36, .76, .26, "sine"], [257, 57, .61, .13, "sawtooth", .018, .035], [523, 139, .43, .083, "triangle", .036, .015]], noises: [[.78, .24, 710, .84, "lowpass", 0, .021], [.50, .10, 2380, 1.2, "bandpass", .013, .052], [.11, .11, 4140, .9, "highpass"]] },
  "beam-hit": { signature: "wdc-beam-scorch", layers: [[146, 49, .14, .12, "triangle"]], noises: [[.17, .11, 1800, .8, "bandpass"]] },
  mine: { signature: "wdc-mine", rateLimit: .05, layers: [[842, 515, .090, .11, "triangle"], [1560, 1100, .12, .071, "sine", .020], [2260, 1680, .14, .046, "sine", .074]], noises: [[.058, .13, 3110, 1.9, "bandpass"]] },
  pickaxe: { signature: "wdc-pickaxe-clink", layers: [[1300, 680, .11, .11, "triangle"], [2670, 2130, .097, .079, "sine"]], noises: [[.044, .1, 3700, 1.4, "bandpass"]] },
  sell: { signature: "wdc-sell", layers: [[784, 782, .13, .116, "sine"], [1175, 1170, .16, .109, "sine", .062], [1568, 1555, .30, .10, "triangle", .116], [2360, 2310, .20, .043, "sine", .132]] },
  pay: { signature: "wdc-pay", layers: [[1390, 1160, .12, .11, "triangle"]] },
  bag: { signature: "wdc-bag", noises: [[.24, .074, 1660, .65, "highpass"]] },
  "wall-break": { signature: "wdc-wall-break", layers: [[156, 61, .21, .17, "sine"]], noises: [[.32, .22, 2070, .8, "bandpass"], [.25, .085, 4700, 1.6, "highpass"]] },
  escape: { signature: "wdc-escape", layers: [[440, 880, .22, .085, "triangle"]], noises: [[.15, .030, 1190, 1.2, "bandpass"]] },
});

const PULSE_CUE_SOUNDS = Object.freeze({
  windup: WDC_CUE_SOUNDS.windup,
  punch: WDC_CUE_SOUNDS.punch,
  serious: WDC_CUE_SOUNDS.serious,
  "serious-windup": { signature: "pulse-serious-windup", layers: [[77, 188, .21, .145, "triangle", 0, .085], [417, 875, .17, .069, "sine", .028, .08]], noises: [[.19, .10, 1780, 1.23, "bandpass", 0, .064]] },
  "barrage-windup": { signature: "pulse-barrage-windup", layers: [[232, 618, .14, .074, "triangle", 0, .048]], noises: [[.13, .069, 1970, 1.0, "bandpass"]] },
  "barrage-swing": { signature: "pulse-barrage-swing", rateLimit: .058, noises: [[.082, .11, 1870, 1.32, "bandpass", 0, .012]] },
  "barrage-hit": { signature: "pulse-barrage-hit", rateLimit: .067, layers: [[155, 57, .095, .21, "sine"]], noises: [[.062, .115, 2380, 1.02, "bandpass"]] },
  "shockwave-windup": { signature: "pulse-shockwave-windup", layers: [[92, 264, .25, .11, "sine", 0, .10], [446, 1132, .19, .047, "triangle", .042, .10]], noises: [[.22, .07, 2210, 1.3, "bandpass", .025, .07]] },
  shockwave: { signature: "pulse-shockwave-launch", priorityEffects: true, layers: [[166, 50, .26, .23, "sine"], [740, 124, .18, .095, "triangle"]], noises: [[.21, .16, 1610, .85, "bandpass", 0, .009]] },
  "shockwave-hit": { signature: "pulse-shockwave-impact", layers: [[117, 44, .22, .26, "sine"], [437, 185, .10, .097, "triangle"]], noises: [[.125, .16, 2460, .88, "bandpass"]] },
  "shockwave-wall": { signature: "pulse-shockwave-wall", layers: [[184, 65, .15, .118, "sine"]], noises: [[.13, .10, 1830, .81, "bandpass"]] },
  dodge: { signature: "pulse-sidestep", layers: [[927, 292, .14, .052, "triangle", .012, .028]], noises: [[.16, .12, 2630, 1.23, "bandpass", 0, .041], [.068, .053, 4760, 1.1, "highpass", .039]] },
  "dash-dodge": { signature: "classic-dash-dodge", layers: [[1260, 355, .15, .063, "triangle"]], noises: [[.17, .11, 3540, 1.18, "bandpass", 0, .03]] },
  "dash-windup": { signature: "classic-dash-windup", layers: [[280, 640, .10, .033, "sine", 0, .035]], noises: [[.09, .037, 1850, 1.2, "bandpass", 0, .03]] },
  "dash-lunge": { signature: "classic-dash-lunge", layers: [[670, 155, .20, .066, "triangle"], [120, 55, .12, .06, "sine"]], noises: [[.21, .15, 2250, 1.08, "bandpass", 0, .015], [.07, .045, 4900, .9, "highpass"]] },
  limitless: { signature: "pulse-limitless", layers: [[1168, 687, .23, .11, "sine"], [1990, 1630, .29, .081, "sine", .019], [2780, 2260, .18, .048, "triangle", .048]], noises: [[.16, .095, 5100, 1.4, "highpass"]] },
  "purple-merge": { signature: "pulse-purple-merge", layers: [[293, 728, .90, .072, "sine", 0, .27], [949, 733, .79, .079, "sine", .09, .24], [140, 365, .63, .061, "triangle", .22, .16]], noises: [[.62, .058, 2280, 2.2, "bandpass", .20, .16]] },
  "hollow-purple": { signature: "pulse-hollow-purple", priorityEffects: true, layers: [[146, 42, .65, .24, "sine"], [668, 164, .47, .118, "triangle", 0, .016], [1160, 396, .35, .047, "sine", .024, .028]], noises: [[.63, .21, 1040, .92, "lowpass", 0, .029], [.34, .11, 3020, .98, "bandpass"]] },
  "purple-hit": { signature: "pulse-purple-impact", layers: [[225, 57, .20, .18, "sine"]], noises: [[.21, .14, 2000, .83, "bandpass"]] },
  "rod-cycle": { signature: "pulse-rod-cycle", layers: [[1280, 824, .11, .095, "triangle"], [2060, 1340, .16, .062, "sine", .099], [1540, 870, .18, .082, "triangle", .223]], noises: [[.25, .068, 3520, 1.4, "bandpass", .062, .048]] },
  wrap: { signature: "pulse-wrap-fold", layers: [[368, 171, .26, .13, "triangle"], [1330, 690, .22, .08, "triangle", .082]], noises: [[.27, .104, 2160, 1.1, "bandpass", 0, .05]] },
  "wrap-hit": { signature: "pulse-wrap-hit", layers: [[184, 52, .22, .23, "sine"], [1490, 839, .11, .10, "triangle"]], noises: [[.14, .17, 2930, 1.6, "bandpass"]] },
  convergence: { signature: "pulse-convergence", layers: [[494, 496, .85, .087, "sine", 0, .17], [741, 747, .77, .082, "sine", .14, .22], [1090, 1120, .57, .071, "sine", .35, .23]], noises: [[.64, .039, 3860, 1.6, "bandpass", .27, .17]] },
  "convergence-lock": { signature: "pulse-convergence-lock", layers: [[1570, 1542, .135, .078, "sine"], [1770, 1760, .14, .064, "triangle", .105], [2360, 2335, .19, .045, "sine", .22]] },
  "convergence-hit": { signature: "pulse-convergence-edit", priorityEffects: true, layers: [[152, 47, .35, .215, "sine"], [1420, 363, .19, .105, "triangle", .04]], noises: [[.34, .14, 4330, 1.35, "highpass", .026, .05]] },
  "shield-ready": { signature: "pulse-shield-ready", layers: [[710, 908, .26, .08, "sine", 0, .047], [1590, 1400, .23, .058, "sine", .048]] },
  "shield-bash": { signature: "pulse-shield-bash", layers: [[116, 47, .22, .22, "sine"], [648, 265, .18, .095, "triangle"]], noises: [[.17, .116, 1610, 1.05, "bandpass"]] },
  "shield-block": { signature: "pulse-shield-block", layers: [[740, 605, .33, .12, "triangle"], [1550, 1470, .29, .091, "sine", .010]], noises: [[.097, .16, 3000, 1.22, "bandpass"]] },
  "steel-hit": { signature: "pulse-steel-hit", layers: [[1117, 690, .19, .125, "triangle"], [2380, 1840, .22, .072, "sine"]], noises: [[.076, .12, 3580, 1.1, "bandpass"]] },
  "lateral-clash": { signature: "classic-lateral-clash", rateLimit: .25, layers: [[162, 45, .19, .14, "sine"], [590, 198, .11, .078, "triangle"]], noises: [[.13, .12, 2340, 1.03, "bandpass"]] },
  "snow-pack": { signature: "avalanche-pack", noises: [[.11, .095, 1450, .82, "bandpass"]], layers: [[464, 630, .10, .05, "triangle"]] },
  "snow-release": { signature: "avalanche-release", layers: [[186, 64, .28, .16, "sine"], [1510, 840, .22, .059, "triangle"], [2040, 1110, .24, .040, "triangle", .035]], noises: [[.30, .16, 3180, .92, "bandpass"]] },
  "omnitrix-tell": { signature: "omnitrix-dial", layers: [[620, 620, .095, .095, "triangle"], [810, 810, .09, .084, "triangle", .125], [1080, 1080, .10, .078, "sine", .25]] },
  "omnitrix-transform": { signature: "omnitrix-transform", priorityEffects: true, layers: [[145, 490, .35, .14, "sawtooth", 0, .045], [622, 1760, .38, .097, "triangle", .04, .063], [1320, 820, .35, .07, "sine", .16]], noises: [[.25, .085, 2630, 1.3, "bandpass"]] },
  "omnitrix-reset": { signature: "omnitrix-reset", layers: [[758, 745, .10, .10, "triangle"], [421, 400, .15, .09, "triangle", .114]] },
  "alien-windup": { signature: "omnitrix-attack-ready", layers: [[257, 516, .16, .073, "sine", 0, .051]] },
  xlr8: { signature: "xlr8-zip", layers: [[1740, 370, .17, .076, "triangle"]], noises: [[.21, .12, 3350, 1.2, "bandpass", 0, .024]] },
  "xlr8-dodge": { signature: "xlr8-evade", layers: [[605, 2340, .08, .075, "triangle"], [2250, 480, .17, .060, "sine", .047]], noises: [[.16, .11, 4560, .90, "highpass"]] },
  "xlr8-tornado": { signature: "xlr8-tornado", layers: [[277, 940, .48, .07, "triangle", 0, .11], [511, 813, .40, .052, "sine", .13, .13]], noises: [[.76, .18, 1710, 1.1, "bandpass", 0, .17], [.48, .10, 3430, 1.2, "bandpass", .12, .14]] },
  "xlr8-tornado-hit": { signature: "xlr8-tornado-contact", rateLimit: .14, layers: [[385, 98, .14, .115, "triangle"]], noises: [[.13, .10, 2650, 1.0, "bandpass"]] },
  heatblast: { signature: "heatblast-flare", priorityEffects: true, layers: [[116, 49, .47, .14, "triangle"]], noises: [[.56, .20, 800, .89, "lowpass", 0, .055], [.49, .13, 2150, .90, "bandpass", .035, .065]] },
  "heatblast-hit": { signature: "heatblast-contact", rateLimit: .14, layers: [[174, 48, .16, .12, "sine"]], noises: [[.15, .13, 1830, .90, "bandpass"]] },
  diamondhead: { signature: "diamondhead-crystal-charge", layers: [[1340, 571, .25, .09, "triangle"], [2200, 1300, .23, .069, "sine", .029]], noises: [[.26, .086, 2200, 1.17, "bandpass", 0, .035]] },
  "diamond-guard": { signature: "diamondhead-guard", layers: [[1040, 935, .25, .13, "triangle"], [2290, 2060, .30, .083, "sine", .022]], noises: [[.088, .12, 4970, 1.3, "highpass"]] },
  "diamond-charge-hit": { signature: "diamondhead-crystal-impact", priorityEffects: true, layers: [[158, 40, .32, .24, "sine"], [1720, 461, .25, .11, "triangle"]], noises: [[.25, .19, 2930, 1.24, "bandpass"]] },
  "four-arms": { signature: "four-arms-reach", layers: [[182, 98, .19, .12, "triangle"]], noises: [[.17, .10, 1760, 1.06, "bandpass", 0, .03]] },
  "four-arms-grab": { signature: "four-arms-grip", layers: [[147, 55, .21, .15, "sine"]], noises: [[.14, .11, 1170, .91, "bandpass"]] },
  "four-arms-throw": { signature: "four-arms-throw", layers: [[261, 82, .20, .16, "triangle"]], noises: [[.27, .15, 2150, 1.07, "bandpass", 0, .028]] },
  "four-arms-wall-hit": { signature: "four-arms-wall-crater", priorityEffects: true, layers: [[123, 27, .38, .25, "sine"], [593, 87, .22, .12, "triangle"]], noises: [[.28, .21, 974, .94, "lowpass"], [.13, .13, 3530, 1.3, "bandpass", .025]] },
  cannonbolt: { signature: "cannonbolt-roll", layers: [[74, 156, .28, .105, "triangle", 0, .035], [123, 260, .25, .074, "sawtooth", .040]], noises: [[.37, .14, 850, .78, "lowpass"]] },
  "cannonbolt-exit": { signature: "cannonbolt-wall-break", priorityEffects: true, layers: [[145, 32, .32, .21, "sine"], [437, 88, .18, .092, "triangle"]], noises: [[.22, .18, 1280, .96, "bandpass"], [.19, .12, 3490, 1.15, "bandpass", .045]] },
  "cannonbolt-enter": { signature: "cannonbolt-reentry", layers: [[109, 412, .22, .14, "triangle"], [249, 608, .20, .062, "sine", .04]], noises: [[.22, .13, 2090, 1.07, "bandpass"]] },
  "roll-hit": { signature: "cannonbolt-hit", layers: [[160, 36, .26, .22, "triangle"]], noises: [[.18, .17, 1350, 1.13, "bandpass"]] },
  "saber-tell": { signature: "saber-hilt-charge", layers: [[121, 160, .18, .087, "sawtooth", 0, .031], [344, 265, .23, .054, "triangle", .018]] },
  "force-tell": { signature: "force-choke-tell", layers: [[89, 58, .31, .124, "sine", 0, .086], [150, 118, .27, .080, "triangle", .045]], noises: [[.27, .066, 650, 1.1, "lowpass"]] },
  "force-grip": { signature: "force-choke-grip", layers: [[110, 47, .38, .145, "triangle"], [244, 131, .35, .06, "sine", .028]], noises: [[.30, .085, 560, 1.1, "lowpass"]] },
  "force-choke-tick": { signature: "force-choke-tick", rateLimit: .12, layers: [[118, 52, .127, .13, "triangle"], [241, 122, .097, .046, "sine"]], noises: [[.093, .067, 1130, 1.28, "bandpass"]] },
  "force-release": { signature: "force-choke-release", layers: [[204, 43, .26, .18, "sine"]], noises: [[.20, .14, 1400, 1.1, "bandpass"]] },
  "force-vault": { signature: "luke-force-vault", layers: [[276, 852, .24, .08, "triangle", 0, .05]], noises: [[.20, .085, 1960, 1.0, "bandpass"]] },
  "saber-lunge": { signature: "luke-saber-lunge", layers: [[285, 136, .22, .11, "sawtooth", 0, .02]], noises: [[.16, .10, 2760, 1.13, "bandpass"]] },
  "luke-evade": { signature: "luke-evade", rateLimit: .18, layers: [[840, 680, .11, .075, "triangle"]], noises: [[.10, .062, 3300, 1.16, "bandpass"]] },
  "saber-swing": { signature: "saber-sweep", layers: [[288, 111, .23, .12, "sawtooth", 0, .041], [480, 200, .20, .065, "triangle", .014]], noises: [[.16, .09, 2180, 1.32, "bandpass"]] },
  "saber-follow-through": { signature: "saber-reverse-sweep", layers: [[160, 350, .19, .12, "sawtooth", 0, .035], [386, 584, .15, .066, "triangle", .022]], noises: [[.16, .10, 2960, 1.27, "bandpass"]] },
  "saber-hit": { signature: "saber-spark-contact", layers: [[186, 55, .17, .15, "triangle"], [1760, 620, .18, .085, "triangle"]], noises: [[.095, .135, 3550, 1.22, "bandpass"]] },
  "vader-windup": { signature: "vader-heavy-windup", layers: [[107, 172, .36, .106, "sawtooth", 0, .14], [77, 49, .37, .09, "sine"]], noises: [[.22, .045, 880, 1.3, "bandpass", .08, .05]] },
  "vader-heavy-hit": { signature: "vader-heavy-saber-impact", priorityEffects: true, layers: [[136, 34, .29, .235, "sine"], [1510, 620, .19, .107, "sawtooth", .012]], noises: [[.135, .168, 3310, 1.13, "bandpass"], [.22, .116, 825, 1.09, "lowpass"]] },
  "saber-throw": { signature: "saber-throw-spin", layers: [[266, 128, .24, .13, "sawtooth", 0, .033], [237, 121, .24, .083, "sawtooth", .115, .045], [203, 102, .27, .068, "triangle", .237, .051]] },
  "saber-return": { signature: "saber-return-spin", layers: [[127, 304, .27, .10, "sawtooth", 0, .062], [180, 392, .19, .059, "triangle", .12]] },
  "saber-catch": { signature: "saber-catch", layers: [[332, 93, .11, .12, "sawtooth"]], noises: [[.07, .068, 2500, 1.06, "bandpass"]] },
  "saber-wall-scorch": { signature: "saber-wall-scorch", rateLimit: .15, noises: [[.15, .10, 3570, 1.28, "bandpass"], [.075, .066, 4700, .96, "highpass", .025]] },
});

const CLASSIC_CRAFT_SOUNDS = Object.freeze({
  "snow-bank": { signature: "avalanche-bank", rateLimit: .115, layers: [[1470, 970, .11, .077, "triangle"]], noises: [[.082, .079, 4900, 1.2, "highpass"]] },
  "snow-shard-hit": { signature: "avalanche-shard-hit", rateLimit: .078, layers: [[840, 320, .14, .11, "triangle"]], noises: [[.10, .123, 3050, 1.2, "bandpass"]] },
  bee: { signature: "hive-wing-buzz", rateLimit: .14, layers: [[193, 272, .21, .074, "triangle", 0, .025], [392, 542, .16, .045, "sawtooth", .014, .035]], noises: [[.17, .046, 1770, 1.35, "bandpass"]] },
  "bee-hit": { signature: "hive-sting", rateLimit: .08, layers: [[590, 205, .09, .097, "triangle"]], noises: [[.059, .075, 2240, 1.5, "bandpass"]] },
  "fairy-ammo": { signature: "fairy-wand-chime", rateLimit: .10, layers: [[1290, 1615, .16, .077, "sine"], [2180, 2000, .24, .064, "sine", .044], [2610, 1940, .24, .035, "triangle", .088]] },
  "fairy-ammo-hit": { signature: "fairy-wand-spark", rateLimit: .08, layers: [[2140, 1290, .13, .083, "sine"], [552, 204, .085, .079, "triangle"]], noises: [[.09, .07, 3380, 1.1, "bandpass"]] },
  train: { signature: "train-whistle", priorityEffects: true, layers: [[291, 330, .51, .10, "triangle", 0, .072], [369, 396, .42, .087, "sine", .026, .064], [92, 51, .44, .15, "sine", .064]], noises: [[.42, .095, 1110, .9, "bandpass", .024, .072], [.12, .12, 1550, 1.22, "bandpass", .30]] },
  "train-hit": { signature: "train-metal-thud", rateLimit: .13, layers: [[118, 39, .26, .23, "sine"], [786, 462, .16, .079, "triangle"]], noises: [[.20, .12, 2130, .88, "bandpass"]] },
  "train-track": { signature: "train-track-clack", rateLimit: .19, layers: [[262, 158, .077, .081, "triangle"]], noises: [[.056, .063, 1730, 1.6, "bandpass"]] },
  "classic-artist-drawing": { signature: "artist-brush", rateLimit: .13, noises: [[.27, .061, 1510, 1.7, "bandpass", 0, .032], [.18, .047, 2200, 1.3, "bandpass", .24, .049], [.19, .062, 1780, 1.8, "bandpass", .59, .054]] },
  "classic-artist-drawing-complete": { signature: "artist-paint-pop", layers: [[243, 86, .17, .15, "sine"], [812, 598, .21, .077, "triangle", .026], [1590, 1340, .22, .040, "sine", .058]], noises: [[.097, .076, 1370, .91, "bandpass"]] },
  "monster-windup": { signature: "monster-growl", rateLimit: .09, layers: [[102, 62, .21, .096, "sawtooth", 0, .04]], noises: [[.17, .062, 560, .89, "lowpass", .008, .027]] },
  "monster-hit": { signature: "monster-heavy-fist", rateLimit: .063, layers: [[111, 36, .23, .25, "sine"], [260, 92, .11, .10, "triangle"]], noises: [[.13, .14, 1060, .85, "bandpass"]] },
});

function classicCraftSoundFor(event) {
  if (event.gameplayMode !== "classic") return null;
  if (event.type === "classic-projectile-wall-bounce" && event.projectileKind === "snow-shard") {
    return CLASSIC_CRAFT_SOUNDS["snow-bank"];
  }
  if (event.type === "classic-projectile-hit" && event.projectileKind === "snow-shard" && event.amount <= 0) {
    return null;
  }
  if (event.type === "classic-projectile-fired") return CLASSIC_CRAFT_SOUNDS[event.projectileKind];
  if (event.type === "classic-projectile-hit") return CLASSIC_CRAFT_SOUNDS[`${event.projectileKind}-hit`];
  if (event.type === "classic-hazard-spawn" && event.hazardKind === "train-track") return CLASSIC_CRAFT_SOUNDS["train-track"];
  if (event.fighterType === "monster") {
    if (event.type === "classic-boxer-punch-start") return CLASSIC_CRAFT_SOUNDS["monster-windup"];
    if (event.type === "classic-punch-hit") return CLASSIC_CRAFT_SOUNDS["monster-hit"];
  }
  return CLASSIC_CRAFT_SOUNDS[event.type];
}

const EVENT_SOUNDS = Object.freeze({
  "race-hydrogen-fuse-second": {
    signature: "hydrogen-fuse-tick",
    rateLimit: 0.12,
    layers: [[830, 620, 0.095, 0.21, "triangle"], [1660, 1240, 0.055, 0.055, "sine"]],
  },
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
  "race-bounce": { sample: "orb-collision", gain: 0.52, rateLimit: 0.075, maxDuration: 0.45, rateRange: [0.98, 1.02] },
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
      "classic-wdc-cue",
      "classic-pulse-cue",
      "classic-power-cue",
      "classic-showcase-cue",
      "classic-artist-drawing",
      "classic-artist-drawing-complete",
      "classic-boxer-punch-start",
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
  if (event.gameplayMode === "classic" && fighterType === "ben-10" && event.type === "classic-projectile-fired") return false;
  if (event.gameplayMode === "classic" && fighterType === "frost-ball" && event.type !== "classic-freeze"
    && !["classic-pulse-cue", "classic-power-cue"].includes(event.type) && !classicCraftSoundFor(event)) return false;
  if (event.gameplayMode === "classic" && fighterType === "one-punch-man" && event.type === "classic-punch-hit") return false;
  return event.gameplayMode !== "classic"
    || CLASSIC_AUDIO_POLICY.enabledEventTypes.includes(event.type);
}

const CLASSIC_MOTION_SAMPLES = Object.freeze({
  "force-vault": ["classic-luke-vault", 0.82],
  "saber-lunge": ["classic-luke-lunge", 0.77],
  "luke-evade": ["classic-luke-evade", 0.85],
  "saber-throw": ["classic-vader-throw", 0.86],
  "saber-return": ["classic-vader-return", 0.80],
  "omnitrix-tell": ["classic-omnitrix-dial", 0.77],
  "omnitrix-transform": ["classic-omnitrix-transform", 0.88],
});

function classicSampleRouteFor(event = {}) {
  if (event.gameplayMode !== "classic") return null;
  const fighterType = event.fighterType || event.sourceType || event.classicOrbId;
  if (event.type === "classic-pulse-cue") {
    let motion = CLASSIC_MOTION_SAMPLES[event.cue];
    if (event.cue === "saber-swing") {
      motion = fighterType === "darth-vader" ? ["classic-vader-swing", 0.85]
        : event.strike === 2 ? ["classic-luke-reverse", 0.86] : ["classic-luke-swing", 0.85];
    }
    if (motion) return { sample: motion[0], gain: motion[1], rateLimit: 0.065, rateRange: [0.985, 1.015] };
  }
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
    if (fighterType === "sniper" || (fighterType === "rifle" && !event.projectileKind)) {
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

function contactPanForEvent(event) {
  if (event.type === "race-layer-break" || event.type === "race-hydrogen-fuse-second") {
    if (event.raceTeamIndex === 0) return -0.35;
    if (event.raceTeamIndex === 1) return 0.35;
  }
  const x = Number(event.x);
  const width = ["classic-wdc-cue", "classic-pulse-cue", "classic-power-cue"].includes(event.type) ? 720 : 960;
  return Number.isFinite(x) ? Math.max(-0.72, Math.min(0.72, (x / width) * 1.44 - 0.72)) : 0;
}

const CLASSIC_POWER_RELEASES = Object.freeze({
  "blue-sun": { layers: [[152, 46, .48, .23, "sine"], [630, 1380, .53, .096, "triangle", .055, .15], [1820, 920, .38, .085, "sine", .10]], noises: [[.58, .13, 2900, 1.15, "bandpass", .01, .105]] },
  "black-hole": { layers: [[83, 39, .65, .21, "sine", 0, .10], [150, 48, .48, .13, "triangle", .18, .12], [67, 25, .38, .19, "sine", .43]], noises: [[.66, .16, 590, .95, "lowpass", .02, .26], [.28, .14, 1230, .95, "bandpass", .46]] },
  sword: { layers: [[419, 1080, .19, .10, "triangle", 0, .028], [1630, 530, .23, .091, "sine", .036]], noises: [[.26, .15, 3250, 1.07, "bandpass", 0, .029]] },
  pistol: { layers: [[1750, 1660, .13, .112, "triangle"], [2470, 1550, .16, .083, "sine", .10], [222, 65, .20, .139, "triangle", .20]], noises: [[.07, .123, 3990, 1.04, "bandpass"], [.10, .13, 3220, 1.02, "bandpass", .19]] },
  shotgun: { layers: [[109, 30, .28, .28, "sine"], [438, 120, .22, .105, "triangle"]], noises: [[.30, .225, 1190, .89, "bandpass"], [.17, .113, 630, 1.1, "lowpass", .06]] },
  rifle: { layers: [[331, 124, .13, .13, "triangle"], [410, 135, .13, .12, "triangle", .15], [504, 167, .17, .10, "sawtooth", .30]], noises: [[.10, .12, 2760, 1.22, "bandpass"], [.11, .11, 3120, 1.2, "bandpass", .15], [.15, .13, 3400, 1.1, "bandpass", .30]] },
  sniper: { layers: [[1430, 182, .32, .117, "sawtooth", 0, .075], [187, 39, .33, .21, "sine", .16]], noises: [[.37, .17, 2570, 1.22, "bandpass", .04, .08]] },
  draftmaster: { layers: [[233, 58, .24, .18, "triangle"], [1580, 645, .26, .112, "sine", .19]], noises: [[.10, .13, 2890, 1.08, "bandpass"], [.23, .14, 3870, 1.34, "bandpass", .17, .04]] },
  turret: { layers: [[124, 375, .17, .124, "square", 0, .068], [298, 71, .24, .14, "triangle", .16], [309, 84, .25, .12, "triangle", .34]], noises: [[.36, .14, 1800, 1.26, "bandpass", .14, .11]] },
  commander: { layers: [[162, 394, .26, .13, "triangle", 0, .06], [241, 68, .29, .16, "sine", .25], [104, 41, .32, .14, "sine", .47]], noises: [[.38, .14, 1310, .93, "lowpass", .10, .07], [.32, .13, 2700, 1.10, "bandpass", .31]] },
});

function classicPowerSoundFor(event) {
  if (event.type !== "classic-power-cue" || event.gameplayMode !== "classic") return null;
  const profile = CLASSIC_POWER_MOVES[event.fighterType];
  if (!profile) return null;
  const tone = profile.tone || 330;
  const voice = { signature: `${event.fighterType}-power-${event.phase}`, rateLimit: 0.10 };
  if (event.phase === "charge" || event.phase === "guard") {
    const length = Math.min(0.81, profile.windup);
    return { ...voice,
      layers: [[tone * .54, tone * 1.35, length, .12, "triangle", 0, length * .35],
        [tone * 2.15, tone * 2.05, .11, .060, "sine", length * .53]],
      noises: event.phase === "guard" ? [[.13, .12, 3800, 1.15, "bandpass"]] : [],
    };
  }
  if (event.phase === "evade") {
    return { ...voice, layers: [[1020, 2160, .14, .095, "triangle"]], noises: [[.18, .127, 4050, 1.06, "bandpass", 0, .028]] };
  }
  if (event.phase === "hit") {
    return { ...voice, priorityEffects: true,
      layers: [[137, 37, .27, .21, "sine"], [tone * 1.64, tone * .62, .18, .11, "triangle"]],
      noises: [[.19, .16, Math.min(5500, 1700 + tone * 1.45), 1.08, "bandpass"]],
    };
  }
  if (event.phase !== "release") return null;
  const release = CLASSIC_POWER_RELEASES[event.fighterType] || {
    layers: [[Math.max(65, tone * .52), Math.max(36, tone * .16), .28, .18, "triangle"],
      [tone * 1.36, tone * .7, .29, .085, profile.kind === "orbit" || profile.kind === "field" ? "sine" : "sawtooth", .04, .05]],
    noises: [[.32, .15, 790 + tone * 2, .99, "bandpass", .015, .045]],
  };
  return { ...voice, ...release, priorityEffects: true };
}

export function soundPlanForEvent(event = {}) {
  const cueSounds = event.type === "classic-wdc-cue" ? WDC_CUE_SOUNDS
    : event.type === "classic-pulse-cue" ? PULSE_CUE_SOUNDS : null;
  const craftSound = classicShowcaseSoundFor(event) || classicCraftSoundFor(event);
  const signatureSound = classicSignatureSoundFor(event);
  const powerSound = classicPowerSoundFor(event);
  if (event.gameplayMode === "classic" && !cueSounds && !craftSound && !signatureSound && !powerSound) return null;
  if (!classicAudioEventEnabled(event) && !craftSound && !signatureSound && !powerSound) return null;
  let cue = event.cue;
  if (cue === "saber-tell" && event.move === "force-choke") cue = "force-tell";
  if (event.move === "vader-sweep") {
    if (cue === "saber-tell") cue = "vader-windup";
    if (cue === "saber-hit") cue = "vader-heavy-hit";
  }
  if (cue === "saber-swing" && event.strike === 2) cue = "saber-follow-through";
  const base = powerSound || craftSound || signatureSound || (cueSounds
    ? cueSounds[cue]
    : event.type === "weapon-hit"
      ? { signature: "metal-weapon-hit", metal: true }
      : event.type === "classic-body-hit" && event.fighterType === "slammy"
        ? EVENT_SOUNDS["classic-slam"]
        : EVENT_SOUNDS[event.type]);
  if (!base) return null;
  const id = Number(event.id) || 1;
  const hash = hashValue(id);
  const fusePitch = event.type === "race-hydrogen-fuse-second"
    ? 2 ** ((3 - Math.max(1, Math.min(3, Number(event.remainingSecond) || 3))) / 6)
    : 1;
  const pitchVariation = (1 + ((hash % 17) - 8) * 0.0045) * fusePitch;
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
  const layers = layerSets.flat().map(([start, end, duration, volume, wave, delay, attack], index) => ({
    startFrequency: Math.max(20, start * pitchVariation * (1 + index * 0.002)),
    endFrequency: Math.max(20, end * pitchVariation),
    duration,
    volume: volume * volumeVariation * gain,
    wave,
    delay: delay ?? index * 0.006,
    attack: attack ?? Math.min(0.008, duration * 0.12),
  }));
  const noises = noiseSets.flat().map(([duration, volume, frequency, q, filterType, delay, attack], index) => ({
    duration,
    volume: volume * volumeVariation * gain,
    frequency: frequency * pitchVariation,
    q,
    filterType,
    offset: ((hash >>> (10 + index * 3)) % 260) / 1000,
    delay: delay ?? index * 0.004,
    ...(attack ? { attack } : {}),
  }));
  return {
    category: base.category || "effects",
    signature: includeOrbSignature ? `${base.signature}+${signature.name}` : base.signature,
    fighterType: fighterType || null,
    pan: contactPanForEvent(event),
    layers,
    noises,
    noise: noises[0] || null,
    ...(base.priorityEffects ? { priorityEffects: true } : {}),
    rateLimit: base.rateLimit ?? (["weapon-hit", "collision-hit", "impact", "wall-hit"].includes(event.type) ? 0.032 : 0),
  };
}

export function samplePlanForEvent(event = {}) {
  if (!classicAudioEventEnabled(event)) return null;
  if (classicCraftSoundFor(event)) return null;
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
  if (!customClassicSample && (classicSignatureSoundFor(event) || classicSignatureSuppressesGenericSample(event))) return null;
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
  const layerProgress = event.type === "race-layer-break" && event.layerCount > 1
    ? Math.max(0, Math.min(1, (Number(event.layerIndex) || 0) / (event.layerCount - 1)))
    : 0;
  const progressPitch = 2 ** (Math.round(layerProgress * 4) / 12);
  return {
    category: base.category || "effects",
    sample: base.sample,
    signature: `sample:${base.sample}`,
    pan: contactPanForEvent(event),
    gain: (Number(base.gain) || 1) * (1 + (((hash >>> 10) % 7) - 3) * 0.015),
    playbackRate: (minRate + rateMix * (maxRate - minRate)) * progressPitch,
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

const ASSET_LOAD_CONCURRENCY = 3;

function assetResponseShouldRetry(response) {
  if (!response || response.ok === true) return true;
  const status = Number(response.status);
  if (!Number.isFinite(status) || status === 0) return true;
  return status === 408 || status === 429 || status >= 500;
}

// Headless Chromium rejects decodeAudioData when hundreds of announcer files
// are fetched and decoded at once. Keep only a few decodes in flight, then
// retry the cues that failed after that pass has gone idle.
export async function loadAudioAssetMap({
  fetcher,
  decode,
  manifest = {},
  baseUrl = "",
  cacheKey = "",
  concurrency = ASSET_LOAD_CONCURRENCY,
  attempts = 1,
  retryDelayMs = 0,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
} = {}) {
  if (typeof fetcher !== "function" || typeof decode !== "function") {
    return { buffers: new Map(), failures: Object.keys(manifest || {}), permanentFailures: Object.keys(manifest || {}) };
  }
  const buffers = new Map();
  const permanentFailures = [];
  const cacheSuffix = cacheKey ? `?v=${encodeURIComponent(cacheKey)}` : "";
  const attemptLimit = Math.max(1, Number(attempts) || 1);
  const workerCount = Math.max(1, Number(concurrency) || 1);
  let pending = Object.entries(manifest || {});

  async function loadOne(cue, filename) {
    const url = `${baseUrl}${filename}${cacheSuffix}`;
    let response = null;
    try {
      response = await fetcher(url);
      if (!response?.ok) throw new Error(`Unable to load ${filename}`);
      const bytes = await response.arrayBuffer();
      const buffer = await decode(bytes?.slice ? bytes.slice(0) : bytes);
      if (!buffer) throw new Error(`Unable to decode ${filename}`);
      buffers.set(cue, buffer);
      return "loaded";
    } catch {
      return response && response.ok !== true && !assetResponseShouldRetry(response) ? "permanent" : "retry";
    }
  }

  for (let attempt = 0; attempt < attemptLimit && pending.length; attempt += 1) {
    if (attempt > 0) await sleep(Math.max(0, Number(retryDelayMs) || 0) * attempt);
    const queue = pending;
    const retryable = [];
    const workers = Math.min(workerCount, queue.length);
    await Promise.all(Array.from({ length: workers }, async () => {
      while (queue.length) {
        const next = queue.shift();
        if (!next) return;
        const outcome = await loadOne(next[0], next[1]);
        if (outcome === "retry") retryable.push(next);
        else if (outcome === "permanent") permanentFailures.push(next[0]);
      }
    }));
    pending = retryable;
  }

  return {
    buffers,
    failures: [...permanentFailures, ...pending.map(([cue]) => cue)],
    permanentFailures,
  };
}

export async function loadAnnouncerAssets({
  fetcher,
  decode,
  manifest = ANNOUNCER_ASSETS,
  baseUrl = "./assets/audio/announcer/",
  cacheKey = ANNOUNCER_ASSET_VERSION,
  concurrency = ASSET_LOAD_CONCURRENCY,
  attempts = 1,
  retryDelayMs = 0,
  sleep,
} = {}) {
  return loadAudioAssetMap({
    fetcher,
    decode,
    manifest,
    baseUrl,
    cacheKey,
    concurrency,
    attempts,
    retryDelayMs,
    sleep,
  });
}

export async function loadSampleAssets({
  fetcher,
  decode,
  manifest = SAMPLE_ASSETS,
  baseUrl = "./assets/audio/effects/",
  cacheKey = SAMPLE_ASSET_VERSION,
  concurrency = ASSET_LOAD_CONCURRENCY,
  attempts = 1,
  retryDelayMs = 0,
  sleep,
} = {}) {
  return loadAudioAssetMap({
    fetcher,
    decode,
    manifest,
    baseUrl,
    cacheKey,
    concurrency,
    attempts,
    retryDelayMs,
    sleep,
  });
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
  constructor({
    fetcher = globalThis.fetch?.bind(globalThis),
    announcerBaseUrl,
    sampleBaseUrl,
    announcerManifest = null,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    announcerLoadConcurrency = ASSET_LOAD_CONCURRENCY,
    announcerLoadAttempts = 4,
    announcerRetryDelayMs = 50,
    announcerEnsureAttempts = 4,
    announcerPlaybackRetries = 6,
  } = {}) {
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
    this.announcerPermanentFailures = new Set();
    this.announcerLoadPromise = null;
    this.announcerLoading = null;
    this.announcerLoadAttempted = false;
    this.announcerAssetsReady = false;
    this.announcerPlayback = emptyAnnouncerPlayback();
    this.announcerRetryGeneration = 0;
    this.announcerRetryChain = Promise.resolve();
    this.sampleBuffers = new Map();
    this.sampleFailures = [];
    this.sampleLoadPromise = null;
    this.hydrogenSirenSource = null;
    this.hydrogenSirenGain = null;
    this.hydrogenSirenRequested = false;
    this.fetcher = fetcher;
    this.announcerBaseUrl = announcerBaseUrl || "./assets/audio/announcer/";
    this.announcerManifest = announcerManifest;
    this.sampleBaseUrl = sampleBaseUrl || "./assets/audio/effects/";
    this.sleep = sleep;
    this.announcerLoadConcurrency = announcerLoadConcurrency;
    this.announcerLoadAttempts = announcerLoadAttempts;
    this.announcerRetryDelayMs = announcerRetryDelayMs;
    this.announcerEnsureAttempts = announcerEnsureAttempts;
    this.announcerPlaybackRetries = announcerPlaybackRetries;
    this.lastPlayed = new Map();
    this.voiceStarts = [];
    this.duckUntil = 0;
    this.mathPowerDuckUntil = 0;
    this.mathPowerDuckReleaseUntil = 0;
    this.volumes = { master: 0.82, effects: 0.78, ambience: 0.13, music: 0.32, announcer: 1 };
    this.categoriesEnabled = { effects: true, ambience: true, music: true, announcer: true };
  }

  async unlock({ announcerAttempts = this.announcerLoadAttempts } = {}) {
    if (!this.context) this.createGraph();
    if (!this.context) return false;
    await this.resumeRunning();
    if (!this.ambienceNodes.length) this.startAmbience();
    await this.loadAnnouncer({ attempts: announcerAttempts });
    if (!this.sampleLoadPromise) this.loadSamples();
    if (this.sampleLoadPromise) await Promise.resolve(this.sampleLoadPromise).catch(() => 0);
    if (this.hydrogenSirenRequested) this.playHydrogenSiren({ type: "race-hydrogen-bomb-countdown-start", id: 0 });
    return this.context.state === "running";
  }

  async resumeRunning({ attempts = 6, delayMs = this.announcerRetryDelayMs } = {}) {
    if (!this.context) return false;
    const limit = Math.max(1, Number(attempts) || 1);
    for (let attempt = 0; attempt < limit; attempt += 1) {
      if (this.context.state === "running") return true;
      try {
        if (typeof this.context.resume === "function") await this.context.resume();
      } catch {
        // Headless Chromium can reject resume until its audio service is ready.
      }
      if (this.context.state === "running") return true;
      await this.waitForContextState(delayMs * (attempt + 1));
    }
    return this.context.state === "running";
  }

  waitForContextState(delayMs) {
    const timeoutMs = Math.max(0, Number(delayMs) || 0);
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        this.context?.removeEventListener?.("statechange", onState);
        resolve();
      };
      const onState = () => {
        if (this.context?.state === "running") finish();
      };
      this.context?.addEventListener?.("statechange", onState);
      Promise.resolve(this.sleep(timeoutMs)).then(finish);
    });
  }

  announcerAssetManifest() {
    return this.announcerManifest || ANNOUNCER_ASSETS;
  }

  retryableAnnouncerFailures() {
    const source = this.announcerAssetManifest();
    return this.announcerFailures.filter((cue) => !this.announcerPermanentFailures.has(cue) && source[cue]);
  }

  hasAnnouncerCue(cue) {
    if (artistAnnouncerCueDisabled(cue)) return true;
    if (this.announcerBuffers.has(cue)) return true;
    const fallback = ANNOUNCER_FALLBACKS[cue];
    return Boolean(fallback && this.announcerBuffers.has(fallback));
  }

  announcerReadyFor(cues = []) {
    return this.context?.state === "running"
      && this.announcerAssetsReady === true
      && this.announcerBuffers.size > 0
      && cues.every((cue) => this.hasAnnouncerCue(cue));
  }

  async ensureAnnouncerCues(cues = []) {
    const required = [...new Set((Array.isArray(cues) ? cues : [cues]).filter((cue) => (
      typeof cue === "string" && cue && !artistAnnouncerCueDisabled(cue)
    )))];
    for (let attempt = 0; attempt < this.announcerEnsureAttempts; attempt += 1) {
      await this.unlock({ announcerAttempts: this.announcerLoadAttempts });
      if (this.announcerReadyFor(required)) return true;
      if (attempt + 1 < this.announcerEnsureAttempts) await this.sleep(this.announcerRetryDelayMs * (attempt + 1));
    }
    return this.announcerReadyFor(required);
  }

  whenAnnouncerSettled() {
    return Promise.resolve(this.announcerRetryChain).catch(() => {});
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

  async loadAnnouncer({ attempts = this.announcerLoadAttempts } = {}) {
    if (!this.context) return 0;
    if (this.announcerLoading) return this.announcerLoading;
    this.announcerLoading = this.loadAnnouncerPass(attempts);
    try {
      return await this.announcerLoading;
    } finally {
      this.announcerLoading = null;
    }
  }

  async loadAnnouncerPass(attempts) {
    if (this.announcerLoadPromise) {
      try {
        await this.announcerLoadPromise;
      } catch {
        // A rejected pass must not block the next retry.
      }
    }
    const source = this.announcerAssetManifest();
    const retryable = this.announcerLoadAttempted
      ? this.retryableAnnouncerFailures()
      : Object.keys(source);
    if (this.announcerLoadAttempted && retryable.length === 0) {
      this.announcerAssetsReady = true;
      return this.announcerBuffers.size;
    }
    const manifest = Object.fromEntries(retryable.filter((cue) => source[cue]).map((cue) => [cue, source[cue]]));
    this.announcerLoadAttempted = true;
    if (!Object.keys(manifest).length) {
      this.announcerAssetsReady = true;
      return this.announcerBuffers.size;
    }
    const loadPromise = loadAnnouncerAssets({
      fetcher: this.fetcher,
      baseUrl: this.announcerBaseUrl,
      manifest,
      attempts,
      concurrency: this.announcerLoadConcurrency,
      retryDelayMs: this.announcerRetryDelayMs,
      sleep: this.sleep,
      decode: (data) => this.context.decodeAudioData(data?.slice ? data.slice(0) : data),
    }).then(({ buffers, failures, permanentFailures }) => {
      for (const [cue, buffer] of buffers) this.announcerBuffers.set(cue, buffer);
      for (const cue of permanentFailures || []) this.announcerPermanentFailures.add(cue);
      const missing = new Set((failures || []).filter((cue) => !this.announcerBuffers.has(cue)));
      for (const cue of this.announcerPermanentFailures) {
        if (!this.announcerBuffers.has(cue)) missing.add(cue);
      }
      this.announcerFailures = [...missing];
      this.announcerAssetsReady = true;
      return this.announcerBuffers.size;
    });
    this.announcerLoadPromise = loadPromise;
    return loadPromise;
  }

  async loadSamples() {
    if (!this.context || this.sampleLoadPromise) return this.sampleLoadPromise;
    this.sampleLoadPromise = loadSampleAssets({
      fetcher: this.fetcher,
      baseUrl: this.sampleBaseUrl,
      attempts: 3,
      concurrency: this.announcerLoadConcurrency,
      retryDelayMs: this.announcerRetryDelayMs,
      sleep: this.sleep,
      decode: (data) => this.context.decodeAudioData(data?.slice ? data.slice(0) : data),
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
    this.announcerRetryGeneration += 1;
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
    const rateKey = ["classic-wdc-cue", "classic-pulse-cue", "classic-power-cue"].includes(event.type)
      ? `${event.type}:${plan.signature}:${raceVoiceId || "base"}`
      : event.type?.startsWith("race-") && raceVoiceId
      ? `${event.type}:${plan.fighterType || "base"}:${raceVoiceId}`
      : `${event.type}:${plan.fighterType || "base"}`;
    if (plan.rateLimit && now - (this.lastPlayed.get(rateKey) ?? -Infinity) < plan.rateLimit) return false;
    if (!this.reserveVoices(plan.layers.length + plan.noises.length, { allowBurst: plan.priorityEffects === true })) return false;
    this.lastPlayed.set(rateKey, now);
    const bus = plan.priorityEffects ? "priority-effects" : plan.category;
    for (const layer of plan.layers) this.playLayer(layer, bus, plan.pan);
    for (const noise of plan.noises) this.playNoise(noise, bus, plan.pan);
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
    if (!this.enabled || !this.categoriesEnabled.announcer) return false;
    if (this.speakAnnouncer(cue, delay)) return true;
    if (!this.context) return false;
    this.scheduleAnnouncerRetry(cue, delay);
    return false;
  }

  speakAnnouncer(cue, delay = 0) {
    if (!this.enabled || !this.context || this.context.state !== "running" || !this.categoriesEnabled.announcer) return false;
    const fallbackCue = ANNOUNCER_FALLBACKS[cue] || null;
    const primaryBuffer = this.announcerBuffers.get(cue);
    const buffer = primaryBuffer || (fallbackCue ? this.announcerBuffers.get(fallbackCue) : null);
    if (!buffer) return false;
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

  scheduleAnnouncerRetry(cue, delay) {
    const generation = this.announcerRetryGeneration;
    const job = async () => {
      if (generation !== this.announcerRetryGeneration) return;
      let remainingDelay = Math.max(0, Number(delay) || 0);
      const retries = Math.max(1, Number(this.announcerPlaybackRetries) || 1);
      for (let attempt = 0; attempt < retries; attempt += 1) {
        if (generation !== this.announcerRetryGeneration) return;
        await this.resumeRunning({ attempts: 2, delayMs: this.announcerRetryDelayMs });
        if (generation !== this.announcerRetryGeneration) return;
        if (!this.hasAnnouncerCue(cue)) {
          await this.loadAnnouncer({ attempts: Math.min(2, this.announcerLoadAttempts) }).catch(() => 0);
        }
        if (generation !== this.announcerRetryGeneration) return;
        if (this.speakAnnouncer(cue, remainingDelay)) return;
        remainingDelay = 0;
        await this.sleep(this.announcerRetryDelayMs * (attempt + 1));
      }
      if (generation !== this.announcerRetryGeneration) return;
      this.announcerPlayback.fallbackCues.push(cue);
      if (this.enabled && this.context?.state === "running" && this.categoriesEnabled.announcer) {
        this.playAnnouncerFallback(cue, 0);
      }
    };
    this.announcerRetryChain = Promise.resolve(this.announcerRetryChain).catch(() => {}).then(job);
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
    const peak = Math.max(0.0001, noise.volume);
    gain.gain.setValueAtTime(noise.attack ? 0.0001 : peak, now);
    if (noise.attack) gain.gain.exponentialRampToValueAtTime(peak, now + noise.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + noise.duration);
    source.connect(filter);
    filter.connect(gain);
    this.connectVoice(gain, category, pan);
    const availableOffset = Math.max(0, this.noiseBuffer.duration - noise.duration);
    source.loop = noise.duration > this.noiseBuffer.duration;
    source.start(now, Math.min(noise.offset, availableOffset));
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
