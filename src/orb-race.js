import { normalizeContenderIds, selectContenderIds } from "./contenders.js";

export const ORB_RACE_MODE = "orb-race";
export const ORB_RACE_LAYER_COUNT = 3;
export const ORB_RACE_MAX_LAYER_COUNT = 50;
export const ORB_RACE_MAX_LAYER_STRENGTH = 1_000_000_000_000_000_000;
export const ORB_RACE_MAX_MATH_DAMAGE = 1_000_000_000_000_000_000_000;
export const ORB_RACE_DEFAULT_LAYERS = Object.freeze([18, 48, 110]);
export const ORB_RACE_FINAL_LAYER_PRESETS = Object.freeze([
  Object.freeze({ value: 10_000, label: "10,000" }),
  Object.freeze({ value: 100_000, label: "100,000" }),
  Object.freeze({ value: 500_000, label: "500,000" }),
  Object.freeze({ value: 1_000_000, label: "1 MILLION" }),
  Object.freeze({ value: 10_000_000, label: "10 MILLION" }),
  Object.freeze({ value: 500_000_000, label: "500 MILLION" }),
  Object.freeze({ value: 1_000_000_000, label: "1 BILLION" }),
  Object.freeze({ value: 1_000_000_000_000_000_000, label: "1 QUINTILLION" }),
]);
export const ORB_RACE_LONGFORM_DEFAULT_LAYER_COUNT = 13;
export const ORB_RACE_LONGFORM_DEFAULT_TARGET = 10_000;
export const ORB_RACE_LONGFORM_DEFAULT_LAYERS = Object.freeze(
  buildRaceLayerPreset(
    ORB_RACE_LONGFORM_DEFAULT_LAYER_COUNT,
    ORB_RACE_LONGFORM_DEFAULT_TARGET,
  ),
);
export const ORB_RACE_ORB_SCALES = Object.freeze([1, 0.75, 0.55]);
export const ORB_RACE_DEFAULT_ORB_SCALE = 1;
export const ORB_RACE_MAX_ORB_COPIES = 50;
export const ORB_RACE_CAGE_DEFAULT_DURATION_SECONDS = 5;
export const ORB_RACE_CAGE_MIN_DURATION_SECONDS = 0;
export const ORB_RACE_CAGE_MAX_DURATION_SECONDS = 60;
// The race renderer and physics use the same normalized board geometry. Keeping
// the values here prevents the checkerboard, finish trigger, and layer lines
// from drifting apart as the portrait canvas is resized.
export const ORB_RACE_PRESENTATION = Object.freeze({
  logicalWidth: 1080,
  logicalHeight: 1920,
  boardWidthFraction: 0.62,
  boardMaxWidth: 700,
  boardHeightFraction: 0.34,
  boardMaxHeight: 650,
  boardTopMargin: 0.08,
  boardMinTop: 150,
  boardGapFraction: 0.11,
  boardMinGap: 116,
  orbChamberFraction: 0.25,
  layerStackFraction: 0.57,
  finishFraction: 0.18,
  finishLabelFraction: 0.36,
  checkerColumns: 24,
});
export const ORB_RACE_LONGFORM_PRESENTATION = Object.freeze({
  logicalWidth: 1920,
  logicalHeight: 1080,
  trackWidthFraction: 0.31,
  trackWidthMax: 720,
  trackGapFraction: 0.06,
  trackGapMin: 64,
  boardTopMarginFraction: 0.05,
  boardBottomMarginFraction: 0.05,
  headerHeightFraction: 0.145,
  headerHeightMin: 122,
  // Long-form boards use a deliberately shallow viewport: seven number
  // walls remain readable at once while the camera advances in small, calm
  // groups instead of chasing every bounce.
  visibleLayerCount: 7,
  // Retained as a compatibility hint for older exports. Long-form now uses a
  // single continuous camera rather than per-track stepped cameras.
  cameraStepLayers: 3,
  worldLayerHeightFraction: 0.075,
  worldLayerHeightMin: 54,
  // The white space between cards matches their short side exactly in the
  // renderer, keeping every number wall visually separated without making
  // the full race box unnecessarily tall.
  worldLayerGapFraction: 0.075,
  worldLayerGapMin: 20,
  chamberHeightFraction: 2.5,
  finishHeightFraction: 1.0,
  // Keep each number wall close to the outer race frame while preserving a
  // readable white margin around the card.
  layerInsetFraction: 0.04,
  cameraFocusFraction: 0.46,
  cameraEase: 0.045,
  checkerColumns: 32,
});
export const ORB_RACE_DEFAULT_TEAMS = Object.freeze([
  Object.freeze(["duplicator"]),
  Object.freeze(["orbital"]),
]);
export const ORB_RACE_OPTION_DEFAULTS = Object.freeze({
  fadingTrails: false,
  solidTrails: false,
  scalingDamage: true,
  count: 1,
  orbScale: ORB_RACE_DEFAULT_ORB_SCALE,
  speedMode: "regular",
  buffed: false,
  caged: false,
  cageDuration: ORB_RACE_CAGE_DEFAULT_DURATION_SECONDS,
  comboAbilities: Object.freeze([]),
});
export const ORB_RACE_SPEED_MODES = Object.freeze([
  Object.freeze({
    id: "regular",
    label: "REGULAR",
    description: "Use Duplicator's standard movement speed, arc, and gravity",
  }),
  Object.freeze({
    id: "slow",
    label: "SLOW",
    description: "Use a slower movement profile",
  }),
  Object.freeze({
    id: "very-strong-math-slow",
    label: "VERY STRONG MATH ORB SLOW",
    description: "Math orbs keep a high arc while moving very slowly",
  }),
]);
export const ORB_RACE_SPEED_MODE_IDS = Object.freeze(ORB_RACE_SPEED_MODES.map(({ id }) => id));
export const ORB_RACE_DEFAULT_SPEED_MODE = "regular";
export const ORB_RACE_EVERYONE_LABEL = "EVERYONE";
export const ORB_RACE_RAINBOW_PALETTE = Object.freeze([
  "#ff3654",
  "#ff8b20",
  "#ffd21a",
  "#25ed73",
  "#168cff",
  "#a64dff",
]);
// Artists use a small deterministic palette instead of external image assets.
// The renderer treats these as painting recipes, not additional orb IDs, so
// replay state and URL selections remain keyed only by the stable "artists"
// racer ID.
export const ORB_RACE_ARTIST_PAINTINGS = Object.freeze([
  Object.freeze({
    name: "BLOOM",
    damage: 2,
    style: "bloom",
    colors: Object.freeze(["#86efac", "#22c55e", "#f472b6", "#fef08a"]),
  }),
  Object.freeze({
    name: "STORM",
    damage: 5,
    style: "storm",
    colors: Object.freeze(["#0f172a", "#38bdf8", "#a5f3fc", "#fef08a"]),
  }),
  Object.freeze({
    name: "FAIRY",
    damage: 100,
    style: "fairy",
    colors: Object.freeze(["#f0abfc", "#c084fc", "#fef3c7", "#a7f3d0"]),
  }),
  Object.freeze({
    name: "MONSTER",
    damage: 1000,
    style: "monster",
    colors: Object.freeze(["#7f1d1d", "#ef4444", "#facc15", "#111827"]),
  }),
]);

export const ORB_RACERS = Object.freeze({
  duplicator: racer("duplicator", "DUPLICATOR", "#ff2bd6", "#ffd21a", "D", "DUPES", 12),
  speed: racer("speed", "SPEEDSTER", "#168cff", "#8ef0ff", "S", "SPEED", 0),
  orbital: racer("orbital", "ORBITAL", "#00d8e8", "#8ef0ff", "O", "ORBITERS", 0),
  drill: racer("drill", "DRILL", "#35e866", "#0f7a31", "DR", "DRAG", 3),
  "x-squared": racer("x-squared", "X²", "#ff3654", "#ffe26b", "X²", "SQUARE", 0),
  fibonacci: racer("fibonacci", "FIBONACCI", "#25ed73", "#d8ff5c", "F", "FIB", 0),
  sylvester: racer("sylvester", "SYLVESTER", "#74111c", "#ff7a86", "sₙ₊₁", "SYLVESTER", 0),
  // Keep the stable `lucas` ID for saved links/replays while using the new
  // player-facing Lucas Sequence design and dark-green palette.
  lucas: racer("lucas", "LUCAS SEQUENCE", "#14532d", "#86efac", "Lₙ", "LUCAS", 0),
  tetration: racer("tetration", "TETRATION", "#5d2b82", "#e7c6ff", "a^^b", "TETRATION", 0),
  professor: racer("professor", "PROFESSOR", "#f0f0f0", "#ffd21a", "P", "MATH FORM", 0),
  trifecta: racer("trifecta", "TRIFECTA", "#f59e0b", "#fff3a3", "△", "SHOCKWAVE", 0),
  gravitator: racer("gravitator", "GRAVITATOR", "#4c1d95", "#c4b5fd", "G", "GRAVITY PULL", 0),
  grower: racer("grower", "GROWER", "#a7f52f", "#eaff94", "G", "SIZE", 0),
  lazer: racer("lazer", "LAZER", "#ff2d73", "#ff9bc0", "L", "BEAM", 0),
  sticky: racer("sticky", "STICKY", "#ff8b20", "#ffe092", "ST", "STICK", 0),
  unarmed: racer("unarmed", "UNARMED", "#808080", "#d1d5db", "", "DAMAGE + SPEED", 0),
  slammy: racer("slammy", "SLAMMY", "#ef4444", "#fca5a5", "SL", "SLAM DAMAGE", 0),
  "super-slammy": racer("super-slammy", "SUPER SLAMMY", "#7f1d1d", "#f87171", "SS", "SLAM +5 DAMAGE", 0),
  piercer: racer("piercer", "PIERCER", "#374151", "#d1d5db", "P", "PIERCE ALL LAYERS", 0),
  "ying-yang": racer("ying-yang", "YING YANG", "#090909", "#ffffff", "☯", "MODE", 0),
  poison: racer("poison", "POISON", "#8b5cf6", "#d8b4fe", "", "POISON", 0),
  "hydrogen-bomb": racer("hydrogen-bomb", "HYDROGEN BOMB", "#ffd400", "#242024", "☢", "COUNTDOWN", 0),
  "antimatter-bomb": racer("antimatter-bomb", "ANTIMATTER BOMB", "#17131f", "#ff5d8f", "A", "15S → 5S DETONATION", 0),
  "time-bomb": racer("time-bomb", "TIME BOMB", "#17202b", "#ffcf5a", "◷", "MIDNIGHT FREEZE", 0),
  "reality-bomb": racer("reality-bomb", "REALITY BOMB", "#8f1426", "#ff9b9b", "R", "REALITY SHIFT", 0),
  "tsar-bomb": racer("tsar-bomb", "TSAR BOMB", "#090909", "#ff3b30", "☢", "90S + REACTOR", 0),
  "all-in-one": racer("all-in-one", "ALL IN ONE", "#080808", "#ffffff", "∞", "ALL ABILITIES", 0),
  breaker: racer("breaker", "BREAKER", "#8f1d2c", "#ff7183", "!", "CRIT CHANCE", 0),
  "square-root": racer("square-root", "SQUARE ROOT", "#ffffff", "#222222", "√", "ROOT DAMAGE", 0),
  progressive: racer("progressive", "PROGRESSIVE", "#2367c8", "#9fd4ff", "P", "DAMAGE TIMER", 0),
  random: racer("random", "RANDOM", "#7c3aed", "#f0abfc", "?", "RANDOM DAMAGE", 0),
  lag: racer("lag", "LAG", "#050805", "#39ff14", "L", "GLITCH", 0),
  twins: racer("twins", "TWINS", "#168cff", "#8ef0ff", "2", "TWIN DAMAGE", 0),
  scissor: racer("scissor", "SCISSOR", "#7d8793", "#e9eef5", "✂", "SPLIT", 0),
  whirlwind: racer("whirlwind", "WHIRLWIND", "#a7e8f2", "#94a3b8", "W", "WHIRL SPEED", 0),
  rgb: racer("rgb", "RGB", "#ff3b8d", "#ffffff", "RGB", "COLOR MODE", 0),
  "x-power": racer("x-power", "Xˣ", "#a64dff", "#f1b6ff", "Xˣ", "POWER", 0),
  "super-x-power": racer("super-x-power", "SUPER X^X", "#15151b", "#b98cff", "Xˣ", "SUPER POWER", 0),
  phi: racer("phi", "GOLDEN RATIO", "#ffd326", "#fff39b", "φ", "PHI", 0),
  factorial: racer("factorial", "FACTORIAL", "#ff6b35", "#ffe2b8", "n!", "FACTORIAL", 0),
  prime: racer("prime", "PRIME", "#00b894", "#b8ffe8", "P", "PRIME HITS", 0),
  integral: racer("integral", "INTEGRAL", "#7b61ff", "#d8d0ff", "∫", "AREA", 0),
  quadratic: racer("quadratic", "QUADRATIC", "#00b7ff", "#b7f1ff", "x¹", "EXPONENT", 0),
  pi: racer("pi", "PI", "#ff4f9a", "#ffd2e6", "π", "PI DIGIT", 0),
  flash: racer("flash", "FLASH", "#ff3c2f", "#ffe45c", "⚡", "SPEED", 0),
  batman: racer("batman", "BATMAN", "#ffd21a", "#080808", "BAT", "BATARANGS", 5),
  boomerang: racer("boomerang", "BOOMERANG", "#00c9ff", "#fff06a", "", "BOOMERANGS", 5),
  magnet: racer("magnet", "MAGNET", "#ff3fa4", "#7df9ff", "", "PULL", 0),
  mines: racer("mines", "SPLODEY", "#ff701f", "#ffe45c", "", "BOMBS", 0),
  gravity: racer("gravity", "GRAVITY", "#7d4dff", "#9cf7ff", "", "GRAVITY LEVEL", 1),
  jackpot: racer("jackpot", "JACKPOT", "#ffd400", "#ff3b30", "", "SLOT MACHINE", 0),
  "speed-impact": racer("speed-impact", "SLOW", "#8b949e", "#d8dee4", "", "IMPACT DAMAGE", 0),
  ricochet: racer("ricochet", "RICOCHET CANNON", "#19d3ff", "#d8fbff", "", "CANNON DAMAGE", 3),
  commander: racer("commander", "COMMANDER", "#243b7a", "#ffd24a", "", "DRONES", 0),
  shrapnel: racer("shrapnel", "SHRAPNEL", "#ff7a00", "#d7d9de", "", "FRAGMENTS", 0),
  // Keep roulette as the stable ID for saved links and replays; Absorber is
  // the player-facing name for the pink ability-eating orb.
  roulette: racer("roulette", "ABSORBER", "#ff2aa6", "#ffd1ed", "", "ABSORBED", 0),
  architect: racer("architect", "ARCHITECT", "#ffd21a", "#334155", "", "BUILDS", 0),
  sawblade: racer("sawblade", "SAWBLADE", "#ff9f1c", "#fff0bd", "", "SAWBLADE SHOTS", 4),
  meteor: racer("meteor", "METEOR", "#191919", "#ff4a1f", "", "METEORS", 0),
  "black-hole": racer("black-hole", "BLACK HOLE", "#090617", "#d45cff", "", "POWER", 0),
  godzilla: racer("godzilla", "GODZILLA", "#171c22", "#19c7ff", "", "STOMP", 0),
  centy: racer("centy", "CENTY", "#ffffff", "#202020", "%", "PERCENT", 0),
  infinity: racer("infinity", "INFINITY", "#050505", "#ffffff", "∞", "DAMAGE", 0),
  charger: racer("charger", "CHARGER", "#0b5d32", "#5dff9a", "C", "CHARGE", 0),
  bouncer: racer("bouncer", "BOUNCER", "#ff4fb8", "#ffd1eb", "B", "MINI ORBS", 0),
  "blue-sun": racer("blue-sun", "BLUE SUN", "#050505", "#00eaff", "", "POWER LEVEL", 0),
  "purple-sun": racer("purple-sun", "PURPLE SUN", "#a855f7", "#f0abfc", "", "POWER LEVEL", 0),
  "phase-three-sun": racer("phase-three-sun", "THE SUN", "#d8a800", "#fff36b", "III", "POWER LEVEL", 0),
  "phase-two-sun": racer("phase-two-sun", "PHASE TWO SUN", "#f97316", "#ffd166", "II", "POWER LEVEL", 0),
  snake: racer("snake", "SNAKE", "#164b2b", "#8aff8a", "S", "TAIL", 0),
  vampire: racer("vampire", "VAMPIRE", "#7d0c19", "#ff6577", "☻", "DAMAGE STEAL", 0),
  cubed: racer("cubed", "CUBED", "#8854ff", "#dac7ff", "x³", "CUBE", 0),
  double: racer("double", "DOUBLE", "#00a8ff", "#b8ebff", "×2", "DOUBLE", 0),
  tripler: racer("tripler", "TRIPLER", "#ff8a00", "#ffe0a6", "×3", "TRIPLE", 0),
  turret: racer("turret", "TURRET", "#ff7a00", "#ff7a00", "", "TURRET TIME", 0),
  leech: racer("leech", "LEECH", "#155d27", "#77d66a", "", "LEECH LEVEL", 0),
  crusher: racer("crusher", "CRUSHER", "#515860", "#b8c0c8", "", "WEIGHT", 0),
  berserker: racer("berserker", "BERSERKER", "#e11d2e", "#ff9a6b", "", "RAGE", 0),
  reactor: racer("reactor", "REACTOR", "#168cff", "#9de9ff", "", "REACTOR", 0),
  parasite: racer("parasite", "PARASITE", "#6b4f2a", "#79a83b", "", "SPAWN", 0),
  draftmaster: racer("draftmaster", "DRAFTMASTER", "#3556a8", "#d6b85a", "DM", "UPGRADES", 0),
  needle: racer("needle", "NEEDLE", "#f7f7f7", "#424242", "⌁", "PIERCE", 0),
  multiplier: racer("multiplier", "MULTIPLIER", "#15d67f", "#baffdd", "×", "MULTIPLIER", 0),
  sniper: racer("sniper", "SNIPER", "#6ea23a", "#d7ff8a", "⌖", "SHOT DAMAGE", 0),
  snowball: racer("snowball", "SNOWBALL", "#eafcff", "#70d9ff", "❄", "SIZE", 0),
  countdown: racer("countdown", "COUNTDOWN", "#ff3b30", "#ffd24a", "10", "COUNTDOWN", 0),
  copycat: racer("copycat", "COPYCAT", "#ff74c8", "#7ee8ff", "C", "COPIED DAMAGE", 0),
  critical: racer("critical", "CRITICAL", "#ffd21a", "#ff4b2b", "!", "CRIT CHANCE", 0),
  "100x": racer("100x", "100X", "#f43f5e", "#fecdd3", "100×", "100X DAMAGE", 0),
  grappler: racer("grappler", "GRAPPLER", "#0f766e", "#99f6e4", "G", "GRAPPLE DAMAGE", 0),
  artists: racer("artists", "ARTIST", "#f97316", "#fef08a", "✎", "PAINTING", 0),
  pancake: racer("pancake", "PANCAKE", "#d6a15d", "#fff1bd", "🥞", "FLIPS + STACK", 0),
  tree: racer("tree", "TREE", "#16a34a", "#bbf7d0", "🌳", "ROOTS", 0),
  rain: racer("rain", "RAIN", "#345b82", "#b9efff", "☔", "RAIN DAMAGE", 0),
  hacker: racer("hacker", "HACKER", "#050905", "#39ff14", "⌨", "HACKS", 0),
  miner: racer("miner", "MINER", "#78502e", "#f4d35e", "⛏", "DRILL PROGRESS", 0),
});

export const ORB_RACER_IDS = Object.freeze(Object.keys(ORB_RACERS));

// All In One is intentionally composed from the current roster. Keeping this
// list derived means adding a future Orb Race ability automatically makes it
// available during the next five-second power window without inventing a
// second, drifting ability registry.
export const ORB_RACE_ALL_IN_ONE_ABILITY_IDS = Object.freeze(
  ORB_RACER_IDS.filter((id) => id !== "all-in-one"),
);

// Combo abilities deliberately reuse stable Orb Race IDs. They are traits on
// an existing racer, never synthesized orb definitions, so renderers,
// announcers, winner text, and old URLs continue to identify the base orb.
export const ORB_RACE_COMBO_ABILITIES = Object.freeze({
  speed: comboAbility("speed", "SPEEDSTER", "+speed ramp", ["race-bounce"]),
  gravity: comboAbility("gravity", "GRAVITY", "increasing gravity", ["race-gravity-change"]),
  fibonacci: comboAbility("fibonacci", "FIBONACCI", "Fibonacci damage", ["race-bounce"]),
  lazer: comboAbility("lazer", "LAZER", "rotating damage beam", ["race-laser-hit"]),
  mines: comboAbility("mines", "SPLODEY", "ramping bomb volleys", ["race-mine-drop", "race-mine-explosion"]),
  grower: comboAbility("grower", "GROWER", "size ramp", ["race-bounce"]),
  sticky: comboAbility("sticky", "STICKY", "timed ground damage", ["race-sticky-tick"]),
  slammy: comboAbility("slammy", "SLAMMY", "extra damage ramp", ["race-bounce"]),
  poison: comboAbility("poison", "POISON", "ramping poison damage", ["race-poison-tick"]),
  drill: comboAbility("drill", "DRILL", "piercing drill projectiles", ["race-drill"]),
  orbital: comboAbility("orbital", "ORBITAL", "line-touching orbiters", ["race-bounce"]),
  tripler: comboAbility("tripler", "TRIPLER", "triples damage every bounce", ["race-bounce"]),
});
export const ORB_RACE_COMBO_ABILITY_IDS = Object.freeze(Object.keys(ORB_RACE_COMBO_ABILITIES));

// Orbital combos use one consistent mash-up rule: take a recognizable short
// stem from the companion ability and append ORBITAL. Keeping the stems in a
// registry makes future Orbital pair names, color seams, and announcer files
// follow the same convention instead of becoming one-off titles.
export const ORB_RACE_ORBITAL_COMBO_STEMS = Object.freeze({
  speed: "SPEED",
  gravity: "GRAV",
  fibonacci: "FIB",
  lazer: "LAZER",
  mines: "SPLODEY",
  grower: "GROW",
  sticky: "STICK",
  slammy: "SLAM",
  poison: "POISON",
  drill: "DRILL",
  tripler: "TRIP",
});

const orbitalComboNames = Object.fromEntries(
  Object.entries(ORB_RACE_ORBITAL_COMBO_STEMS).map(([abilityId, stem]) => {
    const colorIds = [abilityId, "orbital"];
    return [
      raceComboKey(colorIds),
      comboName(`${stem}ORBITAL`, colorIds, stem.length),
    ];
  }),
);

// Combo names are deliberately keyed by the unordered ability pair. The
// colorIds order is the visual order used inside the mashed title, which can
// differ from the selection order when a name reads better that way.
export const ORB_RACE_COMBO_NAMES = Object.freeze({
  "speed+gravity": comboName("SPEEDAVITY", ["speed", "gravity"], 5),
  "speed+fibonacci": comboName("SPEEDYNACCI", ["speed", "fibonacci"], 5),
  "speed+lazer": comboName("SPEEDLAZER", ["speed", "lazer"], 5),
  "speed+mines": comboName("SPEEDPLODEY", ["speed", "mines"], 5),
  "speed+grower": comboName("SPEEDGROWER", ["speed", "grower"], 5),
  "speed+sticky": comboName("SPEEDSTICK", ["speed", "sticky"], 5),
  "gravity+fibonacci": comboName("GRAVIBONACCI", ["gravity", "fibonacci"], 5),
  "gravity+lazer": comboName("GRAVILAZER", ["gravity", "lazer"], 5),
  "gravity+mines": comboName("GRAVPLODEY", ["gravity", "mines"], 4),
  "gravity+grower": comboName("GRAVGROWER", ["gravity", "grower"], 4),
  "gravity+sticky": comboName("GRAVISTICKY", ["gravity", "sticky"], 5),
  "fibonacci+lazer": comboName("FIBOLAZER", ["fibonacci", "lazer"], 4),
  "fibonacci+mines": comboName("FIBPLODEY", ["fibonacci", "mines"], 3),
  "fibonacci+grower": comboName("FIBOGROWER", ["fibonacci", "grower"], 4),
  "fibonacci+sticky": comboName("STICKONACCI", ["sticky", "fibonacci"], 5),
  "lazer+mines": comboName("LAZPLODEY", ["lazer", "mines"], 3),
  "lazer+grower": comboName("LAZERGROWER", ["lazer", "grower"], 5),
  "lazer+sticky": comboName("LAZERSTICK", ["lazer", "sticky"], 5),
  "mines+grower": comboName("GROWPLODEY", ["grower", "mines"], 4),
  "mines+sticky": comboName("STICKPLODEY", ["sticky", "mines"], 5),
  "grower+sticky": comboName("GROWSTICKY", ["grower", "sticky"], 4),
  // New combo names keep the first ability's recognizable stem and append a
  // short signature for the second ability. A reversed selection resolves to
  // this same unordered key, so each pair has one title and one announcer.
  "speed+slammy": comboName("SPEEDSLAMMY", ["speed", "slammy"], 5),
  "gravity+slammy": comboName("GRAVSLAMMY", ["gravity", "slammy"], 4),
  "fibonacci+slammy": comboName("FIBSLAMMY", ["fibonacci", "slammy"], 3),
  "lazer+slammy": comboName("LAZSLAMMY", ["lazer", "slammy"], 3),
  "mines+slammy": comboName("SLAMPLODEY", ["slammy", "mines"], 4),
  "grower+slammy": comboName("GROWSLAMMY", ["grower", "slammy"], 4),
  "sticky+slammy": comboName("STICKSLAMMY", ["sticky", "slammy"], 5),
  "speed+poison": comboName("SPEEDPOISON", ["speed", "poison"], 5),
  "gravity+poison": comboName("GRAVPOISON", ["gravity", "poison"], 4),
  "fibonacci+poison": comboName("POISONACCI", ["poison", "fibonacci"], 6),
  "lazer+poison": comboName("LAZERPOISON", ["lazer", "poison"], 5),
  "mines+poison": comboName("POISONPLODEY", ["poison", "mines"], 6),
  "grower+poison": comboName("GROWPOISON", ["grower", "poison"], 4),
  "sticky+poison": comboName("STICKPOISON", ["sticky", "poison"], 5),
  "slammy+poison": comboName("SLAMPOISON", ["slammy", "poison"], 4),
  "speed+drill": comboName("SPEEDDRILL", ["speed", "drill"], 5),
  "gravity+drill": comboName("GRAVDRILL", ["gravity", "drill"], 4),
  "fibonacci+drill": comboName("FIBODRILL", ["fibonacci", "drill"], 4),
  "lazer+drill": comboName("LAZERDRILL", ["lazer", "drill"], 5),
  "mines+drill": comboName("DRILLPLODEY", ["drill", "mines"], 5),
  "grower+drill": comboName("GROWDRILL", ["grower", "drill"], 4),
  "sticky+drill": comboName("STICKDRILL", ["sticky", "drill"], 5),
  "slammy+drill": comboName("SLAMDRILL", ["slammy", "drill"], 4),
  "poison+drill": comboName("POISONDRILL", ["poison", "drill"], 6),
  "fibonacci+tripler": comboName("FIBOTRIPLER", ["fibonacci", "tripler"], 4),
  ...orbitalComboNames,
});

export const ORB_RACE_GROUPS = Object.freeze([
  group("power-math", "VERY POWERFUL MATH ORBS", ["centy", "infinity", "100x"]),
  group("math", "MATH ORBS", ["x-squared", "fibonacci", "sylvester", "lucas", "tetration", "professor", "x-power", "super-x-power", "phi", "factorial", "prime", "integral", "quadratic", "pi", "jackpot", "cubed", "double", "tripler", "multiplier", "countdown", "critical", "breaker", "square-root", "progressive", "random", "trifecta"]),
  group("superhero", "SUPERHERO ORBS", ["flash", "batman"]),
  group("bombs", "BOMBS", ["hydrogen-bomb", "antimatter-bomb", "time-bomb", "reality-bomb", "tsar-bomb", "all-in-one"]),
  group("suns", "SUN ORBS", ["blue-sun", "purple-sun", "phase-two-sun", "phase-three-sun"]),
  group("weapon", "WEAPON ORBS", ["drill", "lazer", "boomerang", "mines", "ricochet", "commander", "shrapnel", "architect", "sawblade", "meteor", "black-hole", "godzilla", "slammy", "super-slammy", "piercer", "poison", "bouncer", "turret", "crusher", "reactor", "draftmaster", "needle", "sniper", "grappler", "artists", "lag", "rain", "hacker", "miner", "scissor"]),
  group("growth", "GROWTH ORBS", ["duplicator", "orbital", "grower", "roulette", "snake", "vampire", "leech", "parasite", "snowball", "copycat", "pancake", "tree", "twins"]),
  group("motion", "MOTION ORBS", ["speed", "sticky", "magnet", "gravity", "gravitator", "speed-impact", "unarmed", "ying-yang", "charger", "berserker", "whirlwind", "rgb"]),
]);

export function normalizeOrbRacers(value, fallback = ["duplicator", "orbital"]) {
  return normalizeContenderIds(value, ORB_RACERS, fallback);
}

export function selectOrbRacers(value, count = 2, seed = 1) {
  return selectContenderIds(value, ORB_RACERS, count, seed, ["duplicator", "orbital"]);
}

export function normalizeRaceTeams(value, fallback = ORB_RACE_DEFAULT_TEAMS) {
  const source = Array.isArray(value) ? value : fallback;
  return Array.from({ length: 2 }, (_, teamIndex) => {
    const rawTeam = Array.isArray(source[teamIndex]) ? source[teamIndex] : fallback[teamIndex];
    const team = [...new Set(rawTeam.filter((id) => Object.hasOwn(ORB_RACERS, id)))];
    if (team.length) return team;
    return [...(fallback[teamIndex] || ORB_RACE_DEFAULT_TEAMS[teamIndex])];
  });
}

export function normalizeRaceTeamOptions(value, teams = ORB_RACE_DEFAULT_TEAMS, legacy = {}) {
  const normalizedTeams = normalizeRaceTeams(teams);
  const legacyOrbScale = normalizeRaceOrbScale(legacy.orbScale, ORB_RACE_DEFAULT_ORB_SCALE);
  return normalizedTeams.map((team, teamIndex) => Object.fromEntries(team.map((orbId) => {
    const raw = value?.[teamIndex]?.[orbId] || {};
    const normalized = {
      fadingTrails: raw.fadingTrails === true || (raw.fadingTrails == null && legacy.fadingTrails === true),
      solidTrails: raw.solidTrails === true || (raw.solidTrails == null && legacy.solidTrails === true),
      scalingDamage: raw.scalingDamage == null
        ? legacy.scalingDamage !== false
        : raw.scalingDamage !== false,
      count: normalizeRaceOrbCount(raw.count),
      orbScale: raw.orbScale == null
        ? legacyOrbScale
        : normalizeRaceOrbScale(raw.orbScale, legacyOrbScale),
      speedMode: normalizeRaceSpeedMode(raw.speedMode ?? raw.raceSpeedMode),
      buffed: raw.buffed === true || raw.raceBuffed === true,
      comboAbilities: normalizeRaceComboAbilities(raw.comboAbilities, orbId),
    };
    if (raw.caged === true || raw.raceCaged === true) normalized.caged = true;
    if (raw.cageDuration != null || raw.raceCageDuration != null) {
      normalized.cageDuration = normalizeRaceCageDuration(raw.cageDuration ?? raw.raceCageDuration);
    }
    return [orbId, normalized];
  })));
}

export function normalizeRaceCageDuration(value, fallback = ORB_RACE_CAGE_DEFAULT_DURATION_SECONDS) {
  const safeFallback = Number.isFinite(Number(fallback))
    ? Math.max(ORB_RACE_CAGE_MIN_DURATION_SECONDS, Math.min(ORB_RACE_CAGE_MAX_DURATION_SECONDS, Number(fallback)))
    : ORB_RACE_CAGE_DEFAULT_DURATION_SECONDS;
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(ORB_RACE_CAGE_MIN_DURATION_SECONDS, Math.min(ORB_RACE_CAGE_MAX_DURATION_SECONDS, number))
    : safeFallback;
}

export function normalizeRaceSpeedMode(value, fallback = ORB_RACE_DEFAULT_SPEED_MODE) {
  const aliases = {
    "very-strong-math-orb-slow": "very-strong-math-slow",
    "math-slow": "very-strong-math-slow",
    "very-slow": "very-strong-math-slow",
  };
  const normalized = aliases[value] || value;
  const safeFallback = ORB_RACE_SPEED_MODE_IDS.includes(fallback)
    ? fallback
    : ORB_RACE_DEFAULT_SPEED_MODE;
  return ORB_RACE_SPEED_MODE_IDS.includes(normalized) ? normalized : safeFallback;
}

export function normalizeRaceOrbCount(value, fallback = 1) {
  const number = Math.floor(Number(value));
  const safeFallback = Math.max(1, Math.min(ORB_RACE_MAX_ORB_COPIES, Math.floor(Number(fallback) || 1)));
  return Number.isFinite(number)
    ? Math.max(1, Math.min(ORB_RACE_MAX_ORB_COPIES, number))
    : safeFallback;
}

export function normalizeRaceComboAbilities(value, baseOrbId = null) {
  if (!Object.hasOwn(ORB_RACE_COMBO_ABILITIES, baseOrbId)) return [];
  const source = Array.isArray(value) ? value : [];
  return [...new Set(source.filter((id) => (
    id !== baseOrbId && Object.hasOwn(ORB_RACE_COMBO_ABILITIES, id)
  )))];
}

export function raceAbilityIdsFor(baseOrbId, options = {}) {
  if (!Object.hasOwn(ORB_RACERS, baseOrbId)) return [];
  return [baseOrbId, ...normalizeRaceComboAbilities(options.comboAbilities, baseOrbId)];
}

export function raceComboTitleFor(value) {
  const ids = [...new Set((Array.isArray(value) ? value : []).filter((id) => (
    Object.hasOwn(ORB_RACE_COMBO_ABILITIES, id)
  )))];
  if (ids.length !== 2) return null;
  return ORB_RACE_COMBO_NAMES[raceComboKey(ids)] || null;
}

export function raceComboAnnouncerCueFor(value) {
  const ids = [...new Set((Array.isArray(value) ? value : []).filter((id) => (
    Object.hasOwn(ORB_RACE_COMBO_ABILITIES, id)
  )))];
  if (ids.length !== 2 || !ORB_RACE_COMBO_NAMES[raceComboKey(ids)]) return null;
  return `intro-race-combo-${raceComboKey(ids).replace("+", "-")}`;
}

export function raceOrbDisplayName(orbId, options = {}) {
  const definition = ORB_RACERS[orbId];
  if (!definition) return "";
  const abilityIds = raceAbilityIdsFor(orbId, options);
  const comboTitle = raceComboTitleFor(abilityIds);
  const label = comboTitle?.name || (abilityIds.length > 1
    ? abilityIds.map((abilityId) => ORB_RACE_COMBO_ABILITIES[abilityId]?.label || ORB_RACERS[abilityId]?.name).filter(Boolean).join(" + ")
    : definition.name);
  const count = normalizeRaceOrbCount(options?.count);
  const buffedLabel = options?.buffed === true ? " (BUFFED)" : "";
  return `${count > 1 ? `${count}× ` : ""}${label}${buffedLabel}`;
}

export function raceHasAbility(racer, abilityId) {
  if (racer?.raceOrbId === "copycat" && racer?.raceCopycatActiveAbilityId === abilityId) return true;
  if (racer?.raceOrbId === "all-in-one") {
    return racer.raceAllInOneActive === true
      && Array.isArray(racer.raceAbilityIds)
      && racer.raceAbilityIds.includes(abilityId);
  }
  return Array.isArray(racer?.raceAbilityIds)
    ? racer.raceAbilityIds.includes(abilityId)
    : racer?.raceOrbId === abilityId;
}

export function raceTeamMemberCount(teams, options) {
  return normalizeRaceTeams(teams).reduce((total, team, teamIndex) => (
    total + team.reduce((teamTotal, orbId) => (
      teamTotal + normalizeRaceOrbCount(options?.[teamIndex]?.[orbId]?.count)
    ), 0)
  ), 0);
}

export function raceTeamDisplayParts(value) {
  const ids = [...new Set((Array.isArray(value) ? value : []).filter((id) => Object.hasOwn(ORB_RACERS, id)))];
  const bombGroup = ORB_RACE_GROUPS.find((definition) => definition.id === "bombs");
  if (ids.length >= 2 && bombGroup && ids.every((id) => bombGroup.orbIds.includes(id))) {
    return [{
      kind: "group",
      id: bombGroup.id,
      label: bombGroup.label,
      orbIds: ids,
      order: 0,
      announcerCue: `intro-race-group-${bombGroup.id}`,
    }];
  }
  if (ids.length <= 2) {
    return ids.map((orbId, index) => ({
      kind: "orb",
      id: orbId,
      label: ORB_RACERS[orbId].name,
      orbIds: [orbId],
      order: index,
      announcerCue: `intro-race-${orbId}`,
    }));
  }
  const consumed = new Set();
  const parts = [];
  for (const definition of ORB_RACE_GROUPS) {
    const matches = ids.filter((id) => definition.orbIds.includes(id));
    if (matches.length < 2) continue;
    const order = Math.min(...matches.map((id) => ids.indexOf(id)));
    matches.forEach((id) => consumed.add(id));
    parts.push({
      kind: "group",
      id: definition.id,
      label: definition.label,
      orbIds: matches,
      order,
      announcerCue: `intro-race-group-${definition.id}`,
    });
  }
  ids.forEach((orbId, index) => {
    if (consumed.has(orbId)) return;
    parts.push({
      kind: "orb",
      id: orbId,
      label: ORB_RACERS[orbId].name,
      orbIds: [orbId],
      order: index,
      announcerCue: `intro-race-${orbId}`,
    });
  });
  const orderedParts = parts.sort((left, right) => left.order - right.order);
  if (orderedParts.length >= 4) {
    return [{
      kind: "everyone",
      id: "everyone",
      label: ORB_RACE_EVERYONE_LABEL,
      orbIds: ids,
      order: 0,
      announcerCue: "intro-race-everyone",
    }];
  }
  return orderedParts;
}

export function raceTeamDisplayName(value, options = null) {
  const ids = [...new Set((Array.isArray(value) ? value : []).filter((id) => Object.hasOwn(ORB_RACERS, id)))];
  if (ids.length === 1) {
    return raceOrbDisplayName(ids[0], options?.[ids[0]]);
  }
  return raceTeamDisplayParts(ids).map((part) => (
    part.kind === "orb" ? raceOrbDisplayName(part.id, options?.[part.id]) : part.label
  )).join(" + ");
}

export function normalizeRaceLayerCount(value, fallback = ORB_RACE_LAYER_COUNT) {
  const number = value == null || value === "" ? NaN : Math.floor(Number(value));
  const safeFallback = Math.max(1, Math.min(ORB_RACE_MAX_LAYER_COUNT, Math.floor(Number(fallback) || ORB_RACE_LAYER_COUNT)));
  return Number.isFinite(number)
    ? Math.max(1, Math.min(ORB_RACE_MAX_LAYER_COUNT, number))
    : safeFallback;
}

export function normalizeRaceFinalLayerTarget(value, fallback = ORB_RACE_LONGFORM_DEFAULT_TARGET) {
  const number = Math.floor(Number(value));
  const safeFallback = Math.max(
    1,
    Math.min(ORB_RACE_MAX_LAYER_STRENGTH, Math.floor(Number(fallback) || ORB_RACE_LONGFORM_DEFAULT_TARGET)),
  );
  return Number.isFinite(number)
    ? Math.max(1, Math.min(ORB_RACE_MAX_LAYER_STRENGTH, number))
    : safeFallback;
}

export function buildRaceLayerPreset(count, finalLayerHealth) {
  const layerCount = normalizeRaceLayerCount(count, ORB_RACE_LONGFORM_DEFAULT_LAYER_COUNT);
  const target = normalizeRaceFinalLayerTarget(finalLayerHealth);
  if (layerCount === 1) return [target];
  const reference = [10, 25, 50, 100, 150, 250, 500, 1000, 1500, 2000, 3000, 5000, 10000];
  const scale = target / reference[reference.length - 1];
  let previous = 1;
  const layers = Array.from({ length: layerCount }, (_, index) => {
    if (index === layerCount - 1) return target;
    const position = index * (reference.length - 1) / (layerCount - 1);
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.min(reference.length - 1, Math.ceil(position));
    const fraction = position - lowerIndex;
    const lower = reference[lowerIndex];
    const upper = reference[upperIndex];
    const interpolated = lower === upper
      ? lower
      : lower * Math.pow(upper / lower, fraction);
    const value = Math.max(previous, Math.min(target, niceRaceLayerValue(interpolated * scale)));
    previous = value;
    return value;
  });
  layers[layers.length - 1] = target;
  return layers;
}

export function normalizeRaceLayers(value, fallback = ORB_RACE_DEFAULT_LAYERS, count = null) {
  const fallbackValues = Array.isArray(fallback) && fallback.length ? fallback : ORB_RACE_DEFAULT_LAYERS;
  const source = Array.isArray(value) && value.length ? value : fallbackValues;
  // Keep the original three-wall helper contract when callers do not pass a
  // count. Settings/simulation provide an explicit count for custom courses.
  const layerCount = normalizeRaceLayerCount(count, ORB_RACE_LAYER_COUNT);
  return Array.from({ length: layerCount }, (_, index) => {
    const raw = source[index] ?? source[source.length - 1] ?? fallbackValues[index] ?? fallbackValues[fallbackValues.length - 1] ?? 1;
    const number = Math.floor(Number(raw));
    const safeNumber = Number.isFinite(number) ? number : Number(fallbackValues[index] ?? 1);
    return Math.max(1, Math.min(ORB_RACE_MAX_LAYER_STRENGTH, safeNumber));
  });
}

function niceRaceLayerValue(value) {
  const safe = Math.max(1, Number(value) || 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(safe)));
  const normalized = safe / magnitude;
  const steps = [1, 1.5, 2, 2.5, 3, 5, 7.5, 10];
  const nearest = steps.reduce((best, step) => (
    Math.abs(step - normalized) < Math.abs(best - normalized) ? step : best
  ), steps[0]);
  return Math.max(1, Math.round(nearest * magnitude));
}

export function normalizeRaceOrbScale(value, fallback = ORB_RACE_DEFAULT_ORB_SCALE) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return ORB_RACE_ORB_SCALES.reduce((closest, scale) => (
    Math.abs(scale - number) < Math.abs(closest - number) ? scale : closest
  ), ORB_RACE_ORB_SCALES[0]);
}

export function orbRaceBoardLayout(width, height) {
  const safeWidth = Math.max(1, Number(width) || ORB_RACE_PRESENTATION.logicalWidth);
  const safeHeight = Math.max(1, Number(height) || ORB_RACE_PRESENTATION.logicalHeight);
  const boardWidth = Math.min(
    safeWidth * ORB_RACE_PRESENTATION.boardWidthFraction,
    ORB_RACE_PRESENTATION.boardMaxWidth,
  );
  const boardHeight = Math.min(
    safeHeight * ORB_RACE_PRESENTATION.boardHeightFraction,
    ORB_RACE_PRESENTATION.boardMaxHeight,
  );
  const gap = Math.max(
    ORB_RACE_PRESENTATION.boardMinGap,
    safeHeight * ORB_RACE_PRESENTATION.boardGapFraction,
  );
  const boardX = (safeWidth - boardWidth) / 2;
  const topY = Math.max(
    ORB_RACE_PRESENTATION.boardMinTop,
    safeHeight * ORB_RACE_PRESENTATION.boardTopMargin,
  );
  return Object.freeze({
    boardWidth,
    boardHeight,
    boardX,
    topY,
    gap,
    boards: Object.freeze([
      Object.freeze({ x: boardX, y: topY, width: boardWidth, height: boardHeight }),
      Object.freeze({ x: boardX, y: topY + boardHeight + gap, width: boardWidth, height: boardHeight }),
    ]),
  });
}

export function orbRaceBoardSections(rect, layerCount = ORB_RACE_LAYER_COUNT) {
  const safeRect = rect || {};
  const width = Math.max(1, Number(safeRect.width) || 1);
  const height = Math.max(1, Number(safeRect.height) || 1);
  const topHeight = height * ORB_RACE_PRESENTATION.orbChamberFraction;
  const finishHeight = height * ORB_RACE_PRESENTATION.finishFraction;
  const finishLabelHeight = finishHeight * ORB_RACE_PRESENTATION.finishLabelFraction;
  const checkerHeight = Math.max(1, finishHeight - finishLabelHeight);
  const layersHeight = Math.max(1, height - topHeight - finishHeight);
  const count = Math.max(1, Math.floor(Number(layerCount) || ORB_RACE_LAYER_COUNT));
  return Object.freeze({
    width,
    height,
    topHeight,
    layersHeight,
    layerHeight: layersHeight / count,
    finishHeight,
    finishY: height - finishHeight,
    finishLabelHeight,
    checkerHeight,
    checkerY: height - finishHeight + finishLabelHeight,
  });
}

export function orbRaceLongformLayout(width, height) {
  const safeWidth = Math.max(1, Number(width) || ORB_RACE_LONGFORM_PRESENTATION.logicalWidth);
  const safeHeight = Math.max(1, Number(height) || ORB_RACE_LONGFORM_PRESENTATION.logicalHeight);
  const gap = Math.max(
    ORB_RACE_LONGFORM_PRESENTATION.trackGapMin,
    safeWidth * ORB_RACE_LONGFORM_PRESENTATION.trackGapFraction,
  );
  const trackWidth = Math.min(
    safeWidth * ORB_RACE_LONGFORM_PRESENTATION.trackWidthFraction,
    ORB_RACE_LONGFORM_PRESENTATION.trackWidthMax,
  );
  const margin = Math.max(1, (safeWidth - trackWidth * 2 - gap) / 2);
  const boardTopMargin = safeHeight * ORB_RACE_LONGFORM_PRESENTATION.boardTopMarginFraction;
  const boardBottomMargin = safeHeight * ORB_RACE_LONGFORM_PRESENTATION.boardBottomMarginFraction;
  const trackHeight = Math.max(1, safeHeight - boardTopMargin - boardBottomMargin);
  const headerHeight = Math.max(
    ORB_RACE_LONGFORM_PRESENTATION.headerHeightMin,
    trackHeight * ORB_RACE_LONGFORM_PRESENTATION.headerHeightFraction,
  );
  return Object.freeze({
    width: safeWidth,
    height: safeHeight,
    margin,
    gap,
    headerHeight,
    tracks: Object.freeze([
      Object.freeze({ x: margin, y: boardTopMargin, width: trackWidth, height: trackHeight, worldY: headerHeight }),
      Object.freeze({ x: margin + trackWidth + gap, y: boardTopMargin, width: trackWidth, height: trackHeight, worldY: headerHeight }),
    ]),
  });
}

export function formatOrbRaceNumber(value) {
  const rounded = Math.max(0, Math.ceil(Number(value) || 0));
  if (Number.isFinite(rounded) && rounded >= 1_000_000_000_000_000_000_000) {
    return rounded.toLocaleString("en-US", { useGrouping: true, maximumFractionDigits: 0 });
  }
  return rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function racer(id, name, color, accent, symbol, statLabel, duplicateEvery) {
  return Object.freeze({
    id,
    name,
    color,
    accent,
    symbol,
    statLabel,
    duplicateEvery,
    palette: Object.freeze([color, accent]),
  });
}

function comboAbility(id, label, description, audioEvents) {
  return Object.freeze({
    id,
    label,
    description,
    audioEvents: Object.freeze([...audioEvents]),
  });
}

function comboName(name, colorIds, splitAt) {
  return Object.freeze({
    name,
    colorIds: Object.freeze([...colorIds]),
    splitAt,
  });
}

function raceComboKey(ids) {
  return [...ids]
    .sort((left, right) => ORB_RACE_COMBO_ABILITY_IDS.indexOf(left) - ORB_RACE_COMBO_ABILITY_IDS.indexOf(right))
    .join("+");
}

function group(id, label, orbIds) {
  return Object.freeze({ id, label, orbIds: Object.freeze([...orbIds]) });
}
