import {
  ARENA,
  CLASS_DEFS,
  RACE_LAYER_HEIGHT,
  RACE_ORB_RADIUS,
  RACE_ORBITAL_SATELLITE_RADIUS_SCALE,
  RACE_WHIRLWIND_SATELLITE_COUNT,
  RACE_WHIRLWIND_SATELLITE_RADIUS_SCALE,
  RACE_SNAKE_TAIL_RADIUS_SCALE,
  getRaceLaserRay,
  raceCommanderDronePosition,
  raceLayerLineY,
  raceOrbitalOrbPosition,
  raceWhirlwindOrbPosition,
  RACE_BOMB_CYCLE_SECONDS,
  RACE_ANTIMATTER_POST_SECOND_COOLDOWN_SECONDS,
  RACE_TIME_BOMB_PULSE_SECONDS,
  RACE_TIME_BOMB_PULSE_EXPANSION_SECONDS,
  RACE_TSAR_BOMB_COUNTDOWN_SECONDS,
  RACE_RGB_COLORS,
  RACE_SCISSOR_ANIMATION_SECONDS,
  raceLaserIntervalLevelFor,
} from "./simulation.js?v=20260825-tsar-all-in-one1";
import {
  ArenaRenderer,
  PIXEL_WEAPON_PROFILES,
  classicVisualColorFor,
} from "./renderer.js?v=20260825-tsar-all-in-one1";
import { SOCIAL_FORMATS, buildAbilityHud, buildBattleStats } from "./social.js?v=20260924-single-match-duration1";
import { WORLD_CUP_COUNTRIES, WORLD_CUP_MODE, worldCupCombatStats } from "./world-cup.js?v=20260703-world-cup-countries3";
import { KING_OF_HILL_CONTENDERS, KING_OF_HILL_MODE } from "./king-of-hill.js";
import {
  ORB_RACE_EVERYONE_LABEL,
  ORB_RACE_MAX_MATH_DAMAGE,
  ORB_RACE_MODE,
  ORB_RACE_PRESENTATION,
  ORB_RACE_LONGFORM_PRESENTATION,
  ORB_RACE_RAINBOW_PALETTE,
  ORB_RACE_ARTIST_PAINTINGS,
  ORB_RACERS,
  formatOrbRaceNumber,
  orbRaceBoardLayout,
  orbRaceBoardSections,
  orbRaceLongformLayout,
  raceComboTitleFor,
  raceHasAbility,
  raceTeamDisplayName,
} from "./orb-race.js?v=20260825-tsar-all-in-one1";
import {
  CLASSIC_ORBS,
  classicTeamDisplayName,
  classicTeamOutlineColorFor,
} from "./classic-orbs.js?v=20260812-classic-health-reactor-batman-fairy-zeus-frost-snowball1";
import {
  TOURNAMENT_CONNECTOR_COLORS,
  TOURNAMENT_PRESENTATION_TIMING,
  tournamentAdvancementDust,
  tournamentBracketLayout,
  tournamentCameraTransitionTransform,
  tournamentCameraTransform,
  tournamentConclusionVisualState,
  tournamentChampionPosition,
  tournamentLoserVisualState,
  tournamentMatchupZoomRect,
  tournamentMatchupZoomPadding,
  tournamentMatchupZoomTargetScale,
  tournamentLongformPanDuration,
  tournamentMatchupIntroVisualState,
  tournamentPresentationAtTime,
  tournamentRoundLabel,
  tournamentWithCommittedResult,
} from "./orb-race-tournament-presentation.js?v=20260812-orb-race-tournament-intro-clock4-64focus1";

const TAU = Math.PI * 2;
const METEOR_BURN_SECONDS = 5;
const RACE_HYDROGEN_TEXT_COLOR = "#e11d48";
const RACE_HYDROGEN_BOMB_COUNTDOWN_SECONDS = 60;
const RACE_HYDROGEN_BOMB_FLASH_SECONDS = 4;
const SOCIAL_RACE_CACHE_KEY = "20260825-tsar-all-in-one1";
const RACE_TWIN_HEALING_COLOR = "#22c55e";
const RACE_TWIN_HEALING_ACCENT = "#86efac";
const RACE_TWIN_DAMAGE_COLOR = "#ef4444";
const RACE_TWIN_DAMAGE_ACCENT = "#fca5a5";
const RACE_SNAKE_TAIL_WIGGLE_SPEED = 22;
const RACE_SNAKE_TAIL_WIGGLE_AMPLITUDE = 0.008;
const RACE_SNAKE_TAIL_WIGGLE_DRIFT = 0.004;
const PIXEL_FONT = "Trebuchet MS, Arial, sans-serif";
const CLASSIC_TITLE_FONT = "Impact, Haettenschweiler, Arial Narrow Bold, sans-serif";
const CLASSIC_CTA_FONT = "Arial Black, Impact, Haettenschweiler, Arial Narrow Bold, sans-serif";
const RACE_NUMBER_FONT = "Arial Black, Impact, Trebuchet MS, Arial, sans-serif";
function raceLayerPullOffsetFor(racer, layerIndex) {
  const offsets = racer?.raceGravitatorLayerPullOffsets;
  if (!Array.isArray(offsets)) return 0;
  return Number(offsets[Math.max(0, Math.floor(Number(layerIndex) || 0))]) || 0;
}

function raceLayerLineYForRenderer(racer, layerIndex) {
  return raceLayerLineY(layerIndex) + raceLayerPullOffsetFor(racer, layerIndex);
}
// The Miner sheet contains transparent padding that varies per frame. Crop
// each authored frame by its alpha bounds before drawing so the boots/drill
// can be planted on the number line without stretching the artwork.
const RACE_MINER_ALPHA_BOUNDS = Object.freeze([
  // Frame 0 contains a disconnected opaque sliver at the far-right/bottom
  // edge. Keep the authored Miner intact while excluding that stray pixel
  // cluster from the runtime source crop.
  Object.freeze({ x: 16, y: 223, width: 335, height: 401 }),
  Object.freeze({ x: 0, y: 264, width: 350, height: 368 }),
  Object.freeze({ x: 26, y: 222, width: 336, height: 402 }),
  Object.freeze({ x: 24, y: 170, width: 314, height: 477 }),
  Object.freeze({ x: 39, y: 29, width: 293, height: 634 }),
  Object.freeze({ x: 42, y: 84, width: 288, height: 478 }),
]);
// Keep both Miner animation clocks deterministic while making the authored
// motion substantially calmer at export scale. These are presentation-only;
// the 20-second shovel upgrade and five-second layer drill rules are unchanged.
const RACE_MINER_SHOVEL_FRAME_RATE = 40 / 3;
const RACE_MINER_DRILL_FRAME_RATE = 24 / 3;
const RACE_MINER_DRILL_SHIFT_RATE = 12 / 3;
export const ORB_RACE_LONGFORM_CHECKER_COLUMNS = 48;
// These entities apply repeated wall/web damage. The set is used only when a
// render frame misses the explicit event and has to infer a transaction from
// the health delta. Explicit event amounts always win, so a five-damage Blue
// Sun tick remains -5 instead of being mislabeled as -1.
const CLASSIC_WEB_DAMAGE_TYPES = new Set([
  "laser",
  "lazer",
  "webball",
  "tripwire",
  "cobwebs",
  "cobweb",
  "cutter",
  "train",
  "spikey",
  "spike",
  "vampire",
  "vampire-latch",
  "parasites",
  "parasite",
  "virus",
  "blue-sun",
  "snake",
  "trapper",
  "trap",
  "necromancer",
]);
// Continuous wall beams apply fractional fixed-step damage. Keep their
// feedback truthful: accumulate the fractional ticks and emit one `-1` only
// after a full point of health has actually been removed. When a whole tick
// carries more than one point (for example Cutter's current 2 DPS), retain
// that whole amount as one `-2` marker. Discrete hits use their event amount.
const CLASSIC_CONTINUOUS_WEB_DAMAGE_TYPES = new Set([
  "laser",
  "lazer",
  "webball",
  "tripwire",
  "cutter-zone",
  "train-track",
  "cobweb",
  "trap",
]);
const RACE_COMBO_HUD_LABELS = Object.freeze({
  speed: "SPEED",
  gravity: "GRAVITY LEVEL",
  fibonacci: "FIBO",
  lazer: "INTERVAL",
  mines: "BOMBS",
  grower: "SIZE",
  sticky: "STICK LEVEL",
  poison: "POISON",
  drill: "DRAG",
  orbital: "ORBITERS",
  tripler: "TRIPLE",
});
const RACE_ABSORBER_SOURCE_TO_ABILITY = Object.freeze({
  mines: "mines",
  speed: "speed",
  sticky: "sticky",
  orbital: "orbital",
  meteor: "meteor",
  slammy: "slammy",
  reactor: "reactor",
  "black-hole": "black-hole",
  drill: "drill",
});
const RACE_ABSORBER_ABILITY_IDS = new Set(Object.values(RACE_ABSORBER_SOURCE_TO_ABILITY));
const RACE_ABSORBER_ABILITY_BAR_IDS = new Set(["meteor", "black-hole", "reactor"]);
const RACE_WEAPON_COMBO_ABILITY_IDS = new Set(["drill", "lazer", "mines", "poison"]);
const RACE_MATH_DAMAGE_IDS = new Set([
  "x-squared",
  "fibonacci",
  "x-power",
  "super-x-power",
  "phi",
  "factorial",
  "prime",
  "integral",
  "quadratic",
  "pi",
  "centy",
  "infinity",
  "100x",
  "cubed",
  "double",
  "tripler",
]);
const RACE_REACTOR_EFFECT_SECONDS = 1.1;
const DRAFTMASTER_SWORD_REST_ANGLE = -0.08;
const DRAFTMASTER_SWORD_SWING_START_ANGLE = -0.12;
const DRAFTMASTER_SWORD_SWING_END_ANGLE = 2.36;
const DRAFTMASTER_SWORD_IMPACT_RATIO = 0.32 / 0.54;
// The supplied axe sprite's grip is at its lower-right corner and its blade
// points toward the upper-left. Rotating the sprite by roughly -135 degrees
// puts that blade straight down into the number wall in canvas coordinates.
const BERSERKER_AXE_REST_ANGLE = -2.36;
const BERSERKER_AXE_SWING_START_ANGLE = -3.1;
const BERSERKER_AXE_SWING_END_ANGLE = BERSERKER_AXE_REST_ANGLE;
const DRAFTMASTER_VISUAL_SCALE = 1.75;
const DRAFTMASTER_GUN_SCALE = DRAFTMASTER_VISUAL_SCALE;
const DRAFTMASTER_BULLET_SCALE = DRAFTMASTER_VISUAL_SCALE;
const DRAFTMASTER_UPGRADE_CALLOUT_SECONDS = 1.8;
const DRAFTMASTER_UPGRADE_SECONDS = 3;
const DRAFTMASTER_COOLDOWN_REDUCTION_PER_SPEED_LEVEL = 0.1;
const DRAFTMASTER_MIN_COOLDOWN_SCALE = 0.5;
const RACE_DRAFT_UPGRADE_LABELS = Object.freeze({
  damage: "DAMAGE",
  projectile: "PROJECTILE",
  speed: "SPEED",
});
const RACE_DRAFT_UPGRADE_COLORS = Object.freeze({
  damage: "#e53935",
  projectile: "#f4c430",
  speed: "#2f80ed",
});

function raceRenderEffectLifetime(effect) {
  const lifetime = Number(effect?.lifetime);
  return Number.isFinite(lifetime) && lifetime > 0 ? lifetime : 2;
}

export function raceRenderOrbRadius(width, scale = 1, minimum = 12) {
  return Math.max(
    minimum,
    Math.max(0, Number(width) || 0) * RACE_ORB_RADIUS * (Number(scale) || 1),
  );
}

export function draftmasterSwordPose(racer = null, time = 0) {
  const swingStartedAt = Number(racer?.raceDraftSwordSwingStartedAt);
  const swingUntil = Number(racer?.raceDraftSwordSwingUntil);
  const impactAt = Number(racer?.raceDraftSwordImpactAt);
  const hasSwing = Number.isFinite(swingStartedAt)
    && Number.isFinite(swingUntil)
    && swingStartedAt >= 0
    && swingUntil > swingStartedAt;
  const impactIsInSwing = Number.isFinite(impactAt)
    && impactAt >= swingStartedAt
    && impactAt < swingUntil;
  const now = Number(time) || 0;
  const impactTime = hasSwing
    ? impactIsInSwing
      ? impactAt
      : swingStartedAt + (swingUntil - swingStartedAt) * DRAFTMASTER_SWORD_IMPACT_RATIO
    : Number.POSITIVE_INFINITY;
  const contacted = hasSwing && now >= impactTime && now < swingUntil;
  const returning = contacted && now > impactTime;
  const swinging = hasSwing && now >= swingStartedAt && now < impactTime;
  const swingProgress = swinging
    ? Math.max(0, Math.min(1, (now - swingStartedAt) / (impactTime - swingStartedAt)))
    : contacted ? 1 : 0;
  const easedSwing = 1 - ((1 - swingProgress) ** 3);
  const returnProgress = returning
    ? Math.max(0, Math.min(1, (now - impactTime) / (swingUntil - impactTime)))
    : 0;
  const easedReturn = 1 - ((1 - returnProgress) ** 3);
  return {
    swinging,
    contacted,
    returning,
    swingProgress,
    angle: swinging
      ? DRAFTMASTER_SWORD_SWING_START_ANGLE
        + easedSwing * (DRAFTMASTER_SWORD_SWING_END_ANGLE - DRAFTMASTER_SWORD_SWING_START_ANGLE)
      : returning
        ? DRAFTMASTER_SWORD_SWING_END_ANGLE
          + easedReturn * (DRAFTMASTER_SWORD_REST_ANGLE - DRAFTMASTER_SWORD_SWING_END_ANGLE)
        : contacted ? DRAFTMASTER_SWORD_SWING_END_ANGLE : DRAFTMASTER_SWORD_REST_ANGLE,
  };
}

export function draftmasterGunReloadPose(racer = null, time = 0) {
  const startedAt = Number(racer?.raceDraftGunSpinStartedAt);
  const spinUntil = Number(racer?.raceDraftGunSpinUntil);
  const now = Number(time) || 0;
  const spinning = Number.isFinite(startedAt)
    && Number.isFinite(spinUntil)
    && startedAt >= 0
    && spinUntil > startedAt
    && now >= startedAt
    && now < spinUntil;
  if (!spinning) {
    return { spinning: false, progress: 0, rotation: 0 };
  }
  const progress = Math.max(0, Math.min(1, (now - startedAt) / (spinUntil - startedAt)));
  const eased = progress * progress * (3 - 2 * progress);
  return {
    spinning: true,
    progress,
    // Three and a half turns in a 0.3-second reload makes the weapon read as
    // a fast flourish; the renderer adds translucent ghost passes on top.
    rotation: eased * Math.PI * 7,
  };
}

export function berserkerAxePose(racer = null, time = 0) {
  const swingStartedAt = Number(racer?.raceBerserkerAxeSwingStartedAt);
  const swingUntil = Number(racer?.raceBerserkerAxeSwingUntil);
  const impactAt = Number(racer?.raceBerserkerAxeImpactAt);
  const hasSwing = Number.isFinite(swingStartedAt)
    && Number.isFinite(swingUntil)
    && swingStartedAt >= 0
    && swingUntil > swingStartedAt;
  const impactIsInSwing = Number.isFinite(impactAt)
    && impactAt >= swingStartedAt
    && impactAt <= swingUntil;
  const now = Number(time) || 0;
  const lockedAtContact = racer?.raceBerserkerAxeSwingLocked === true;
  const contacted = lockedAtContact || (hasSwing && impactIsInSwing && now >= impactAt);
  const swingEnd = impactIsInSwing ? impactAt : swingUntil;
  const swinging = hasSwing && !contacted && now >= swingStartedAt && now < swingEnd;
  const swingProgress = swinging
    ? Math.max(0, Math.min(1, (now - swingStartedAt) / (swingEnd - swingStartedAt)))
    : contacted ? 1 : 0;
  const easedSwing = 1 - ((1 - swingProgress) ** 3);
  return {
    swinging,
    contacted,
    swingProgress,
    angle: swinging || contacted
      ? BERSERKER_AXE_SWING_START_ANGLE
        + easedSwing * (BERSERKER_AXE_SWING_END_ANGLE - BERSERKER_AXE_SWING_START_ANGLE)
      : BERSERKER_AXE_REST_ANGLE,
  };
}

export function draftmasterGunDimensions(radius, gunLevel = 0) {
  const safeRadius = Math.max(0, Number(radius) || 0);
  const level = Math.min(2, Math.max(0, Math.floor(Number(gunLevel) || 0)));
  return {
    width: safeRadius * (3.05 + level * 0.24) * DRAFTMASTER_GUN_SCALE,
    height: safeRadius * (1.86 + level * 0.1) * DRAFTMASTER_GUN_SCALE,
  };
}

export function draftmasterGunSourceRect(spriteWidth, spriteHeight, gunLevel = 0) {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  const level = Math.min(2, Math.max(0, Math.floor(Number(gunLevel) || 0)));
  const cellWidth = width / 4;
  const cellHeight = height / 2;
  const column = level === 0 ? 2 : level === 1 ? 3 : 0;
  const row = level === 2 ? 1 : 0;
  return {
    x: column * cellWidth,
    y: row * cellHeight,
    // The generated pistol cell has a narrow rifle fragment at its far edge.
    // Crop only that tier's source rectangle; rifle and shotgun use their full
    // cells so their silhouettes remain unchanged.
    width: level === 0 ? cellWidth * 0.82 : cellWidth,
    height: cellHeight,
  };
}

export function sniperWeaponSourceRect(spriteWidth, spriteHeight, cell = 0) {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  const cellWidth = width / 2;
  const safeCell = Math.max(0, Math.min(1, Math.floor(Number(cell) || 0)));
  // The generated sheet has a thin dark matte around each square cell. Crop
  // that edge at the draw seam so it cannot appear as a box around the rifle.
  const inset = Math.min(cellWidth * 0.03, height * 0.03);
  return {
    x: safeCell * cellWidth + inset,
    y: inset,
    width: cellWidth - inset * 2,
    height: height - inset * 2,
  };
}

export function raceOrbSplitColors(def, racer = null) {
  const abilityColors = [...new Set([
    def?.id,
    ...(Array.isArray(racer?.raceAbilityIds) ? racer.raceAbilityIds : []),
  ].map((id) => ORB_RACERS[id]?.color).filter(Boolean))];
  return abilityColors.length >= 2 ? abilityColors.slice(0, 2) : null;
}

export function raceTitleSegmentsFor(team, title) {
  const comboMember = (team?.members || []).find((member) => raceComboTitleFor(member?.raceAbilityIds));
  const comboTitle = comboMember ? raceComboTitleFor(comboMember.raceAbilityIds) : null;
  if (!comboTitle) return null;
  const titleText = String(title || "");
  const comboStart = titleText.indexOf(comboTitle.name);
  const colors = comboTitle.colorIds.map((abilityId) => ORB_RACERS[abilityId]?.color).filter(Boolean);
  if (comboStart < 0 || colors.length < 2) return null;
  const comboEnd = comboStart + comboTitle.name.length;
  return [
    { text: titleText.slice(0, comboStart), color: colors[0] },
    { text: titleText.slice(comboStart, comboStart + comboTitle.splitAt), color: colors[0] },
    { text: titleText.slice(comboStart + comboTitle.splitAt, comboEnd), color: colors[1] },
    { text: titleText.slice(comboEnd), color: colors[1] },
  ].filter((segment) => segment.text);
}

const RACE_LONGFORM_DESCRIPTORS = Object.freeze({
  duplicator: "dupes every 12 number-line bounces",
  speed: "+speed every bounce",
  orbital: "line-touching orbiter damage",
  drill: "drills pierce each layer",
  "x-squared": "bounce damage squared",
  fibonacci: "adds previous two numbers",
  grower: "grows every bounce",
  lazer: "constant scaling beam",
  sticky: "sticks and damages the line",
  unarmed: "+damage +speed every bounce",
  slammy: "extra damage every bounce",
  "super-slammy": "+5 damage every bounce",
  piercer: "+0.75 damage; sweeps every layer",
  "ying-yang": "damage mode ↔ speed mode every 5 seconds",
  poison: "one more 1-damage poison tick every bounce",
  "hydrogen-bomb": "clears every layer",
  "antimatter-bomb": "15-second first blast, then 5-second layer dust + orb detonation",
  "time-bomb": "midnight freezes opponents for 5 seconds",
  "reality-bomb": "spawns a random team orb every 5 seconds",
  "tsar-bomb": "90-second detonation + reactor blast every 8 seconds",
  "all-in-one": "all abilities ×10 per active bounce every 15 seconds",
  "100x": "100× damage every bounce",
  grappler: "hooks the line for massive damage",
  artists: "paints a random weapon every 2 seconds",
  pancake: "flips, stacks, and rains giant butter",
  tree: "roots into every uncleared number layer",
  "x-power": "x to the bounce power",
  "super-x-power": "super x power",
  phi: "multiplies by 1.618",
  factorial: "multiplies by n!",
  prime: "prime hits deal double",
  integral: "area under the arc",
  quadratic: "x¹ → x² → x³",
  pi: "multiplies by each π digit",
  flash: "+speed and +damage every bounce",
  batman: "stacking batarangs every 5 bounces",
  boomerang: "pierces layers on return",
  magnet: "pulls toward the number line",
  mines: "wide bomb volleys",
  gravity: "gravity rises every bounce",
  jackpot: "three-reel multiplier",
  "speed-impact": "massive impact damage",
  ricochet: "one cannon shot doubles on every wall ricochet",
  commander: "two orbiting weapon drones",
  shrapnel: "wall fragments + layer-break debris",
  roulette: "absorbs a seeded orb ability at 5S, then every 10S",
  architect: "builds bouncing bumpers",
  sawblade: "rotating sawblade shots",
  meteor: "small meteors + giant summon",
  "black-hole": "sucks numbers from every layer",
  godzilla: "tail smacks, stomps, and atomic breath",
  centy: "percent of each layer",
  infinity: "infinite damage",
  charger: "teleport slam interval ramps",
  bouncer: "spawns tiny bouncing weapons",
  "blue-sun": "eight seeded random cyan lasers",
  snake: "slithers on the line; tail grows every 0.5 seconds",
  vampire: "steals damage every bounce",
  cubed: "bounce damage cubed",
  double: "doubles damage every bounce",
  tripler: "triples damage every bounce",
  turret: "turrets fire bouncing bombs",
  leech: "drains the line with longer holds",
  crusher: "heavier impacts crack the wall",
  berserker: "rage grows while trailing",
  reactor: "charges a massive blue blast",
  parasite: "spawns line-draining parasites",
  draftmaster: "drafts a new upgrade every 3 seconds",
  needle: "tiny piercing hits damage the next layer",
  multiplier: "adds 0.25× every bounce",
  sniper: "one power shot every 5 seconds",
  snowball: "grows until each layer breaks",
  countdown: "10 hits trigger a 25× blast",
  copycat: "roulette-copies a seeded orb for 5 seconds",
  "reality-bomb": "rewrites layer strengths every 10 seconds + summons Slammy",
  lag: "10% glitch chance ramps 10% each time; damage quadruples every 0.5s",
  whirlwind: "six orbiters accelerate after each layer hit",
  twins: "one blue twin damages while the other heals for 10 seconds",
  scissor: "splits the current layer into two tilted halves",
  rgb: "cycles six bounce-stat colors",
  critical: "critical chance rises every bounce",
});
const RACE_SPRITE_URLS = Object.freeze({
  batman: new URL("../assets/race/batman-symbol.png", import.meta.url).href,
  batmanOrb: new URL("../assets/generated/classic-visual-20260811-v4/final/batman-orb-with-ears.png", import.meta.url).href,
  batwing: new URL("../assets/race/batwing-source.png", import.meta.url).href,
  batarang: new URL("../assets/race/batarang-transparent.png", import.meta.url).href,
  flash: new URL("../assets/race/flash-symbol.png", import.meta.url).href,
  flashTrail: new URL("../assets/race/flash-supercharge-trail.png", import.meta.url).href,
  drill: new URL("../assets/race/drill-triangle.png", import.meta.url).href,
  boomerang: new URL("../assets/race/boomerang-generated.png", import.meta.url).href,
  magnet: new URL("../assets/race/magnet-generated.png", import.meta.url).href,
  jackpotCash: new URL("../assets/race/jackpot-cash-explosion.png", import.meta.url).href,
  jackpotSlotMachine: new URL("../assets/race/jackpot-slot-machine.png", import.meta.url).href,
  jackpotSlotLever: new URL("../assets/race/jackpot-slot-lever.png", import.meta.url).href,
  jackpotSlotSymbols: new URL("../assets/race/jackpot-slot-symbols.png", import.meta.url).href,
  impactCollision: new URL("../assets/generated/orb-foundry-impact-frames/final/impact-collision.png", import.meta.url).href,
  impactCritical: new URL("../assets/generated/orb-foundry-impact-frames/final/impact-critical.png", import.meta.url).href,
  fibonacciSymbol: new URL("../assets/race/fibonacci-symbol.svg?v=20260729-fibo-symbol3", import.meta.url).href,
  piSymbol: new URL("../assets/race/pi-symbol.png", import.meta.url).href,
  ricochetWeapons: new URL("../assets/race/generated/ricochet-weapons.png", import.meta.url).href,
  sawbladeWeapons: new URL("../assets/race/generated/sawblade-weapons.png", import.meta.url).href,
  ricochetGunSpinSheet: new URL("../assets/race/generated/ricochet-gun-spin-sheet-source.png", import.meta.url).href,
  commanderTactical: new URL("../assets/generated/orb-race-tactical-20260731/final/commander-sheet.png", import.meta.url).href,
  commanderOrb: new URL("../assets/generated/orb-race-tactical-20260802/final/commander-orb.png", import.meta.url).href,
  shrapnelTactical: new URL("../assets/generated/orb-race-tactical-20260731/final/shrapnel-sheet.png", import.meta.url).href,
  rouletteTactical: new URL("../assets/generated/orb-race-tactical-20260731/final/roulette-sheet.png", import.meta.url).href,
  architectTactical: new URL("../assets/generated/orb-race-tactical-20260731/final/architect-sheet.png", import.meta.url).href,
  shrapnelOrb: new URL("../assets/generated/orb-race-tactical-20260731/final/shrapnel-orb.png", import.meta.url).href,
  architectOrb: new URL("../assets/generated/orb-race-tactical-20260731/final/architect-orb.png", import.meta.url).href,
  meteorOrb: new URL("../assets/race/generated/meteor-orb-source.png", import.meta.url).href,
  meteorTiny: new URL("../assets/race/generated/meteor-tiny-source.png", import.meta.url).href,
  meteorGiant: new URL("../assets/race/generated/meteor-giant-source.png", import.meta.url).href,
  meteorHorn: new URL("../assets/race/generated/meteor-horn-source.png", import.meta.url).href,
  meteorFire: new URL("../assets/race/generated/meteor-fire-source.png", import.meta.url).href,
  hydrogenBombSymbol: new URL("../assets/race/hydrogen-bomb-symbol.png", import.meta.url).href,
  realityBomb: new URL("../assets/generated/orb-race-reality-bomb-20260812/final/reality-bomb.png?v=20260812-bombs2", import.meta.url).href,
  blackHoleOrb: new URL("../assets/race/generated/black-hole-orb.png", import.meta.url).href,
  blackHoleTeleport: new URL("../assets/race/generated/black-hole-teleport.png", import.meta.url).href,
  godzillaHead: new URL("../assets/race/generated/godzilla/head.png", import.meta.url).href,
  godzillaBody: new URL("../assets/race/generated/godzilla/body.png", import.meta.url).href,
  godzillaTail: new URL("../assets/race/generated/godzilla/tail.png", import.meta.url).href,
  godzillaLeftLeg: new URL("../assets/race/generated/godzilla/left-leg.png", import.meta.url).href,
  godzillaRightLeg: new URL("../assets/race/generated/godzilla/right-leg.png", import.meta.url).href,
  godzillaBreath: new URL("../assets/race/generated/godzilla/atomic-breath.png", import.meta.url).href,
  godzillaBurn: new URL("../assets/race/generated/godzilla/atomic-burn.png", import.meta.url).href,
  godzillaAnimation: new URL("../assets/generated/orb-race-godzilla-20260806/final/godzilla-animation-sheet.png?v=20260806-godzilla1", import.meta.url).href,
  godzillaAnimationV2: new URL("../assets/generated/orb-race-godzilla-20260806-v2/final/godzilla-animation-sheet.png?v=20260806-godzilla2", import.meta.url).href,
  crusherRock: new URL("../assets/generated/orb-race-expansion-20260729/final/crusher-rock.png", import.meta.url).href,
  draftmasterEquipment: new URL("../assets/generated/orb-race-expansion-20260729/final/draftmaster-equipment.png", import.meta.url).href,
  draftmasterAmmo: new URL("../assets/generated/orb-race-expansion-20260729/final/draftmaster-ammo.png", import.meta.url).href,
  draftmasterCapedOrb: new URL("../assets/generated/orb-race-expansion-20260729/final/draftmaster-caped-orb.png", import.meta.url).href,
  berserkerVikingCalm: new URL("../assets/generated/orb-race-viking-20260730/final/berserker-viking-calm.png", import.meta.url).href,
  berserkerVikingRage: new URL("../assets/generated/orb-race-viking-20260730/final/berserker-viking-rage.png", import.meta.url).href,
  sniperWeapons: new URL("../assets/generated/orb-race-simple-20260731/final/sniper-weapons.png", import.meta.url).href,
  snowballOrb: new URL("../assets/generated/orb-race-simple-20260731/final/snowball-orb.png", import.meta.url).href,
  grapplerSheet: new URL("../assets/generated/orb-race-media-20260804/final/grappler-sheet.png?v=20260804-orb-race-media1", import.meta.url).href,
  artistsPaintings: new URL("../assets/generated/orb-race-media-20260804/final/artists-paintings.png?v=20260805-artists-assets1", import.meta.url).href,
  artistsGrowthStorm: new URL("../assets/generated/orb-race-media-20260804/final/artists-growth-storm.png?v=20260805-artists-assets1", import.meta.url).href,
  pancakeSyrup: new URL("../assets/generated/orb-race-media-20260804/final/pancake-sheet.png?v=20260805-pancake-syrup1", import.meta.url).href,
  pancakeButterPatch: new URL("../assets/generated/orb-race-media-20260805-pancake-patches/final/butter-patch.png?v=20260805-pancake-butter1", import.meta.url).href,
  treeRootsTransform: new URL("../assets/generated/orb-race-media-20260804/final/tree-roots-transform.png?v=20260804-orb-race-media1", import.meta.url).href,
  treeRootsPiercing: new URL("../assets/generated/orb-race-media-20260804-v2/final/tree-roots-piercing.png?v=20260804-orb-race-media2", import.meta.url).href,
  artistFairy: new URL("../assets/generated/orb-race-media-20260805-procedural-artists/fairy-sprite.png?v=20260805-artists1", import.meta.url).href,
  artistMonster: new URL("../assets/generated/orb-race-media-20260805-procedural-artists/monster-sprite.png?v=20260805-artists1", import.meta.url).href,
  thunderCloud: new URL("../assets/generated/orb-race-media-20260805-thunder-cloud/final/thunder-cloud.png?v=20260805-thunder-cloud1", import.meta.url).href,
  classicTrapperAccessories: new URL("../assets/generated/classic-trapper-20260807/final/trapper-accessories.png?v=20260807-classic-overhaul1", import.meta.url).href,
  orbRaceCage: new URL("../assets/generated/orb-race-cage-20260812/final/cage.png?v=20260812-super-x-cage3-boss2-cowboy-cigar2-bombs2", import.meta.url).href,
  lagOrb: new URL("../assets/generated/orb-race-lag-20260813-hacker-v2/final/lag-orb.png?v=20260813-lag-hacker2", import.meta.url).href,
  rainCloudSheet: new URL("../assets/generated/orb-race-new-orbs-20260814-v1/final/rain-cloud-sheet.png?v=20260825-tsar-all-in-one1", import.meta.url).href,
  minerJackhammerSheet: new URL("../assets/generated/orb-race-new-orbs-20260814-v1/final/miner-jackhammer-sheet.png?v=20260825-tsar-all-in-one1", import.meta.url).href,
  hackerOrbSheet: new URL("../assets/generated/orb-race-new-orbs-20260814-v2/final/hacker-orb-animation-sheet.png?v=20260825-tsar-all-in-one1", import.meta.url).href,
  scissorSheet: new URL("../assets/generated/orb-race-scissor-20260817-v1/final/scissor-sheet.png?v=20260825-tsar-all-in-one1", import.meta.url).href,
});
const raceSprites = new Map();
const raceTransparentSprites = new Map();

function raceSprite(id) {
  if (typeof Image === "undefined" || !RACE_SPRITE_URLS[id]) return null;
  if (!raceSprites.has(id)) {
    const image = new Image();
    image.src = RACE_SPRITE_URLS[id];
    raceSprites.set(id, image);
  }
  const image = raceSprites.get(id);
  return image.complete && image.naturalWidth ? image : null;
}

function drawRaceCage(ctx, racer, x, y, radius, rect) {
  if (!racer?.raceCageActive) return;
  const image = raceSprite("orbRaceCage");
  if (!image) return;
  const width = Math.max(radius * 7.6, Number(racer.raceCageRight - racer.raceCageLeft) * rect.width * 1.08);
  const height = Math.max(radius * 7.6, Number(racer.raceCageBottom - racer.raceCageTop) * rect.height * 1.12);
  const centerX = rect.x + Number(racer.raceCageCenterX || 0.5) * rect.width;
  const centerY = rect.y + Number(racer.raceCageCenterY || 0.17) * rect.height;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 0.98;
  ctx.drawImage(image, centerX - width * 0.5, centerY - height * 0.5, width, height);
  ctx.restore();
}

function raceTransparentSprite(id, mode) {
  if (typeof document === "undefined") return null;
  if (raceTransparentSprites.has(id)) return raceTransparentSprites.get(id);
  const source = raceSprite(id);
  if (!source) return null;
  const canvas = document.createElement("canvas");
  canvas.width = source.naturalWidth;
  canvas.height = source.naturalHeight;
  const context = canvas.getContext("2d");
  context.drawImage(source, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    if (mode === "batman") {
      const foreground = red > 120 && green > 80 && blue < 150;
      pixels[index] = 8;
      pixels[index + 1] = 8;
      pixels[index + 2] = 8;
      pixels[index + 3] = foreground ? 255 : 0;
    } else if (mode === "batwing") {
      const foreground = red < 100 && green < 100 && blue < 100;
      pixels[index] = 5;
      pixels[index + 1] = 5;
      pixels[index + 2] = 5;
      pixels[index + 3] = foreground ? 255 : 0;
    } else if (mode === "flash-trail") {
      const chromaKey = red > 175 && green < 145 && blue > 150;
      pixels[index + 3] = chromaKey ? 0 : 255;
    } else if (mode === "race-magenta") {
      const chromaKey = red > 175 && blue > 175 && green < 120;
      pixels[index + 3] = chromaKey ? 0 : 255;
    }
  }
  context.putImageData(imageData, 0, 0);
  raceTransparentSprites.set(id, canvas);
  return canvas;
}

function formatCombatValue(value) {
  const rounded = Math.round((Number(value) || 0) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatRaceMultiplier(value) {
  const rounded = Math.round((Number(value) || 0) * 1000) / 1000;
  return String(rounded);
}

const RACE_LAYER_MAX_THEME_TINT = 0.82;

function raceHexColorToRgb(value) {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(value || "").trim());
  if (!match) return null;
  const hex = match[1].length === 3
    ? match[1].split("").map((digit) => `${digit}${digit}`).join("")
    : match[1];
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function raceRgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function raceLayerColorFor(themeColor, health, maxHealth) {
  const theme = raceHexColorToRgb(themeColor) || { r: 237, g: 27, b: 212 };
  const maximum = Math.max(1, Number(maxHealth) || 1);
  const current = Math.max(0, Math.min(maximum, Number(health) || 0));
  const damageProgress = 1 - current / maximum;
  const tint = damageProgress * RACE_LAYER_MAX_THEME_TINT;
  return raceRgbToHex({
    r: 255 + (theme.r - 255) * tint,
    g: 255 + (theme.g - 255) * tint,
    b: 255 + (theme.b - 255) * tint,
  });
}

export function raceThemeColorForRacer(racer, fallback = "#111111") {
  if (racer?.raceOrbId === "ying-yang") {
    return racer.raceYingYangMode === "speed" ? "#ffffff" : "#090909";
  }
  return ORB_RACERS[racer?.raceOrbId]?.color || fallback;
}

export function raceArenaBorderColorForTeam(team, fallback = "#080808") {
  const primary = team?.members?.[0] || (team?.raceOrbId ? team : null);
  return raceThemeColorForRacer(primary, fallback);
}

export function raceRenderTeamSlots(sim) {
  const configuredTeams = Array.isArray(sim?.raceTeams) && sim.raceTeams.length
    ? sim.raceTeams
    : [];
  const fighters = Array.isArray(sim?.fighters) ? sim.fighters : [];
  return Array.from({ length: 2 }, (_, teamIndex) => {
    const configured = configuredTeams[teamIndex];
    if (configured) return configured;
    const members = fighters.filter((fighter) => fighter.raceTeamIndex === teamIndex);
    if (!members.length) return null;
    const orbIds = [...new Set(members.map((fighter) => fighter.raceOrbId).filter(Boolean))];
    const primary = members[0];
    return {
      id: `race-team-${teamIndex + 1}`,
      index: teamIndex,
      orbIds,
      memberIds: members.map((fighter) => fighter.id),
      name: raceTeamDisplayName(orbIds),
      raceLayerStrengths: [...(primary.raceLayerStrengths || sim.raceLayerStrengths || [])],
      raceLayerIndex: primary.raceLayerIndex,
      raceLayerHealth: [...(primary.raceLayerHealth || sim.raceLayerStrengths || [])],
      raceReadyToFinish: primary.raceReadyToFinish,
      raceFinished: primary.raceFinished,
      raceDamagePerSecond: primary.raceDamage,
    };
  });
}

function classicArenaBorderColorForFighter(fighter, fallback) {
  if (fighter?.type === "boxer") return "#e51b23";
  return classicVisualColorFor(fighter?.type, fallback);
}

export function classicArenaBorderColorsFor(sim) {
  const fighters = Array.isArray(sim?.fighters) ? sim.fighters : [];
  return [
    classicArenaBorderColorForFighter(fighters[0], "#168cff"),
    classicArenaBorderColorForFighter(fighters[1], "#ff3b5c"),
  ];
}

export function drawSplitArenaBorder(ctx, rect, firstColor, secondColor, lineWidth = 5) {
  const safeLineWidth = Math.max(1, Number(lineWidth) || 1);
  const x = Number(rect?.x) || 0;
  const y = Number(rect?.y) || 0;
  const width = Math.max(0, Number(rect?.width) || 0);
  const height = Math.max(0, Number(rect?.height) || 0);
  ctx.save();
  ctx.lineJoin = "miter";
  ctx.lineCap = "butt";
  // A dark keyline keeps both colored runs legible against bright arenas and
  // black-mode backgrounds while the colored stroke remains the visible edge.
  ctx.strokeStyle = "#080808";
  ctx.lineWidth = safeLineWidth + Math.max(2, safeLineWidth * 0.7);
  ctx.strokeRect(x, y, width, height);
  ctx.lineWidth = safeLineWidth;
  ctx.strokeStyle = firstColor || "#168cff";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
  ctx.strokeStyle = secondColor || "#ff3b5c";
  ctx.beginPath();
  ctx.moveTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.restore();
}

export function drawThemedArenaBorder(ctx, rect, color, lineWidth = 6) {
  const safeLineWidth = Math.max(1, Number(lineWidth) || 1);
  const x = Number(rect?.x) || 0;
  const y = Number(rect?.y) || 0;
  const width = Math.max(0, Number(rect?.width) || 0);
  const height = Math.max(0, Number(rect?.height) || 0);
  ctx.save();
  ctx.strokeStyle = "#080808";
  ctx.lineWidth = safeLineWidth + Math.max(2, safeLineWidth * 0.7);
  ctx.strokeRect(x, y, width, height);
  ctx.strokeStyle = color || "#080808";
  ctx.lineWidth = safeLineWidth;
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}

export function raceReactorColorFor(racer) {
  const progress = Math.max(0, Math.min(1, (Number(racer?.raceReactorCharge) || 0) / 100));
  const theme = raceHexColorToRgb(ORB_RACERS.reactor?.color) || { r: 22, g: 140, b: 255 };
  const accent = raceHexColorToRgb(ORB_RACERS.reactor?.accent) || { r: 157, g: 233, b: 255 };
  return raceRgbToHex({
    r: theme.r + (accent.r - theme.r) * progress,
    g: theme.g + (accent.g - theme.g) * progress,
    b: theme.b + (accent.b - theme.b) * progress,
  });
}

export function raceBlueSunBodyColorFor(racer) {
  const powerLevel = Math.max(1, Number(racer?.raceBlueSunPowerLevel) || 1);
  const progress = Math.max(0, Math.min(1, (powerLevel - 1) / 9));
  return raceRgbToHex({
    r: 5 * (1 - progress),
    g: 5 + (168 - 5) * progress,
    b: 5 + (255 - 5) * progress,
  });
}

export function racePhaseThreeSunBodyColorFor(racer) {
  const powerLevel = Math.max(1, Number(racer?.racePhaseThreeSunPowerLevel) || 1);
  const progress = Math.max(0, Math.min(1, (powerLevel - 1) / 9));
  return raceRgbToHex({
    r: 196 + (255 - 196) * progress,
    g: 144 + (226 - 144) * progress,
    b: 0 + 32 * progress,
  });
}

export function racePhaseTwoSunBodyColorFor(racer) {
  const powerLevel = Math.max(1, Number(racer?.racePhaseTwoSunPowerLevel) || 1);
  const progress = Math.max(0, Math.min(1, (powerLevel - 1) / 9));
  return raceRgbToHex({
    r: 249,
    g: 115 + 80 * progress,
    b: 22 + 36 * progress,
  });
}

export function racePurpleSunBodyColorFor(racer) {
  const powerLevel = Math.max(1, Number(racer?.racePurpleSunPowerLevel) || 1);
  const powerProgress = Math.max(0, Math.min(1, (powerLevel - 1) / 9));
  // Keep the turn gradual inside the first charge cycle, while using the same
  // level-based ramp contract as Blue Sun for later power increases.
  const chargeProgress = Math.max(0, Math.min(1, Number(racer?.racePurpleSunCharge) || 0));
  const progress = Math.max(0, Math.min(1, Math.max(powerProgress, powerProgress + chargeProgress / 9)));
  const theme = raceHexColorToRgb(ORB_RACERS["purple-sun"]?.color) || { r: 168, g: 85, b: 247 };
  const purple = raceHexColorToRgb(ORB_RACERS["purple-sun"]?.accent) || { r: 240, g: 171, b: 252 };
  return raceRgbToHex({
    r: theme.r + (purple.r - theme.r) * progress,
    g: theme.g + (purple.g - theme.g) * progress,
    b: theme.b + (purple.b - theme.b) * progress,
  });
}

function raceTextColorForRacer(racer, fallback = "#111111") {
  return racer?.raceOrbId === "hydrogen-bomb"
    ? RACE_HYDROGEN_TEXT_COLOR
    : raceThemeColorForRacer(racer, fallback);
}

function raceLayerMaxHealthFor(sim, team, index) {
  const configuredValues = [team?.raceLayerStrengths, sim?.raceLayerStrengths];
  for (const values of configuredValues) {
    const configured = Number(values?.[index]);
    if (Number.isFinite(configured) && configured > 0) return configured;
  }
  return Math.max(1, Number(team?.raceLayerHealth?.[index]) || 1);
}

export function snowballLayerHeightFor(teamOrMembers, baseHeight) {
  const members = Array.isArray(teamOrMembers)
    ? teamOrMembers
    : teamOrMembers?.members?.length
      ? teamOrMembers.members
      : teamOrMembers
        ? [teamOrMembers]
        : [];
  const snowball = members.find((racer) => racer?.raceOrbId === "snowball");
  const height = Math.max(0, Number(baseHeight) || 0);
  if (!snowball || height <= 0) return height;
  const size = Math.max(1, Number(snowball.raceSnowballSize) || 1);
  // Snowball's growing body consumes the visual vertical room of each wall.
  // Keep the wall's bottom edge on the canonical number line while its top
  // edge retreats, so the falling orb and the shortened wall still meet.
  return height * Math.max(0.35, 1 / size);
}

function raceAbilityIdsForHud(racer) {
  const source = Array.isArray(racer?.raceAbilityIds) && racer.raceAbilityIds.length
    ? racer.raceAbilityIds
    : [racer?.raceOrbId];
  return [...new Set(source.filter(Boolean))];
}

function raceHasMathDamage(racer) {
  return raceAbilityIdsForHud(racer).some((abilityId) => RACE_MATH_DAMAGE_IDS.has(abilityId));
}

function formatRaceDamageValue(racer, value) {
  if (racer?.raceOrbId === "infinity") return "∞";
  const numeric = Number(value) || 0;
  const formatted = Number.isInteger(numeric)
    ? formatOrbRaceNumber(numeric)
    : formatCombatValue(numeric);
  return `${formatted}${raceHasMathDamage(racer) && numeric >= ORB_RACE_MAX_MATH_DAMAGE ? " (MAX)" : ""}`;
}

function raceDrillDragFor(racer) {
  const bounceCount = Math.max(0, Math.floor(Number(racer?.raceBounces) || 0));
  const trackedDrag = Number(racer?.raceDrillDrag);
  return Number.isFinite(trackedDrag)
    ? Math.max(0, trackedDrag, bounceCount)
    : bounceCount;
}

function raceLaserIntervalLabelFor(racer) {
  return String(raceLaserIntervalLevelFor(racer));
}

function raceAbilityMetricLine(racer, abilityId) {
  const label = RACE_COMBO_HUD_LABELS[abilityId];
  if (!label) return "";
  const value = abilityId === "speed"
    ? formatCombatValue(racer.raceDisplaySpeed ?? racer.raceSpeed)
    : abilityId === "gravity"
      ? formatCombatValue(racer.raceGravityLevel || 0)
      : abilityId === "fibonacci"
        ? formatRaceDamageValue(racer, racer.raceDamage)
        : abilityId === "lazer"
        ? `LEVEL ${raceLaserIntervalLabelFor(racer)}`
          : abilityId === "mines"
            ? formatCombatValue(racer.raceMineLevel || 1)
            : abilityId === "grower"
              ? `${Math.round((racer.raceOrbScale || 1) * 100)}%`
              : abilityId === "sticky"
                ? formatCombatValue(racer.raceStickyLevel || 1)
                : abilityId === "poison"
                  ? racePoisonHudMetricFor(racer)
                  : abilityId === "drill"
                    ? formatCombatValue(raceDrillDragFor(racer))
                    : abilityId === "orbital"
                      ? formatCombatValue(racer.raceOrbiters || 0)
                      : abilityId === "tripler"
                        ? formatRaceDamageValue(racer, racer.raceDamage)
                    : null;
  return value == null ? "" : `${label}: ${value}`;
}

function raceWeaponComboAbilityIdFor(abilityIds) {
  return abilityIds.find((abilityId) => RACE_WEAPON_COMBO_ABILITY_IDS.has(abilityId)) || null;
}

function racePoisonHudMetricFor(racer) {
  const rawTicks = racer?.racePoisonActiveTicks == null
    ? racer?.racePoisonActiveDamage
    : racer.racePoisonActiveTicks;
  const ticks = Math.max(0, Math.floor(Number(rawTicks) || 0));
  const damagePerTick = Math.max(0, Number(racer?.racePoisonDamagePerTick) || 1);
  const tickLabel = ticks === 1 ? "TICK" : "TICKS";
  return `${formatCombatValue(ticks)} ${tickLabel} × ${formatCombatValue(damagePerTick)}`;
}

function raceRouletteAbsorbedOrbLabels(racer) {
  const history = Array.isArray(racer?.raceRouletteAbsorbedOrbHistory)
    ? racer.raceRouletteAbsorbedOrbHistory
    : [];
  if (!history.length) return ["NONE"];
  return history.map((orbId) => ORB_RACERS[orbId]?.name || String(orbId).toUpperCase());
}

function raceAbsorberSourceIdsFor(racer) {
  const history = Array.isArray(racer?.raceRouletteAbsorbedOrbHistory)
    ? racer.raceRouletteAbsorbedOrbHistory
    : [];
  return history.filter(Boolean);
}

function raceAbsorberAbilityIdsFor(racer) {
  const historyIds = raceAbsorberSourceIdsFor(racer)
    .map((sourceId) => RACE_ABSORBER_SOURCE_TO_ABILITY[sourceId] || sourceId)
    .filter((abilityId) => RACE_ABSORBER_ABILITY_IDS.has(abilityId));
  const activeIds = Array.isArray(racer?.raceAbilityIds)
    ? racer.raceAbilityIds.filter((abilityId) => RACE_ABSORBER_ABILITY_IDS.has(abilityId))
    : [];
  return [...new Set([...historyIds, ...activeIds])];
}

function raceAbsorberColorsFor(racer) {
  const storedColors = Array.isArray(racer?.raceRouletteAbsorbedColors)
    ? racer.raceRouletteAbsorbedColors
    : [];
  const historyColors = raceAbsorberSourceIdsFor(racer)
    .map((orbId) => ORB_RACERS[orbId]?.color)
    .filter(Boolean);
  return [...new Set([...storedColors, ...historyColors])].slice(0, 8);
}

function raceAbsorberHudLinesFor(racer) {
  const labels = raceRouletteAbsorbedOrbLabels(racer);
  if (labels.length <= 1) return [`ABSORBED: ${labels[0]}`];
  const lines = [];
  let line = "";
  for (const label of labels) {
    const next = line ? `${line} · ${label}` : label;
    if (line && next.length > 29) {
      lines.push(`ABSORBED: ${line}`);
      line = label;
    } else {
      line = next;
    }
  }
  if (line) lines.push(`ABSORBED: ${line}`);
  return lines;
}

function raceAbsorberBlackHoleHudLineFor(racer) {
  if (!raceHasAbility(racer, "black-hole")) return "";
  const progress = Math.round(Math.max(0, Math.min(100, Number(racer?.raceBlackHoleAbilityProgress) || 0)));
  const power = formatCombatValue(racer?.raceBlackHolePower || 0);
  return `SINGULARITY: ${progress}% · POWER: ${power}`;
}

function raceAbsorberAbilityHudLineFor(racer, abilityId) {
  if (!raceHasAbility(racer, abilityId)) return "";
  if (abilityId === "black-hole") return raceAbsorberBlackHoleHudLineFor(racer);
  if (abilityId === "meteor") {
    const small = formatCombatValue(racer?.raceMeteorSmallDamage || racer?.raceDamage || 0);
    const giant = formatCombatValue(racer?.raceMeteorGiantDamage || 0);
    return `METEOR: ${small} · BIG: ${giant}`;
  }
  if (abilityId === "slammy") {
    return `SLAM DAMAGE: ${formatRaceDamageValue(racer, racer?.raceDamage)}`;
  }
  if (abilityId === "reactor") {
    const charge = Math.round(Math.max(0, Math.min(100, Number(racer?.raceReactorCharge) || 0)));
    return `REACTOR: ${charge}% · BLAST: ${formatCombatValue(racer?.raceReactorDamage || 0)}`;
  }
  return raceAbilityMetricLine(racer, abilityId);
}

function raceAbsorberHudEntriesFor(racer, baseColor) {
  const entries = [];
  for (const abilityId of raceAbsorberAbilityIdsFor(racer)) {
    const text = raceAbsorberAbilityHudLineFor(racer, abilityId);
    if (!text) continue;
    const def = ORB_RACERS[abilityId];
    entries.push({
      text,
      color: def?.accent || def?.color || baseColor,
      abilityId,
    });
  }
  return entries;
}

function raceAbsorberLongformTokensFor(racer) {
  return raceAbsorberAbilityIdsFor(racer).map((abilityId) => {
    const def = ORB_RACERS[abilityId];
    let value = "";
    if (abilityId === "mines") value = formatCombatValue(racer?.raceMineLevel || 1);
    else if (abilityId === "speed") value = formatCombatValue(racer?.raceDisplaySpeed ?? racer?.raceSpeed);
    else if (abilityId === "sticky") value = formatCombatValue(racer?.raceStickyLevel || 1);
    else if (abilityId === "orbital") value = formatCombatValue(racer?.raceOrbiters || 0);
    else if (abilityId === "meteor") value = `${formatCombatValue(racer?.raceMeteorSmallDamage || racer?.raceDamage || 0)}/${formatCombatValue(racer?.raceMeteorGiantDamage || 0)}`;
    else if (abilityId === "slammy") value = formatRaceDamageValue(racer, racer?.raceDamage);
    else if (abilityId === "reactor") value = `${Math.round(Math.max(0, Math.min(100, Number(racer?.raceReactorCharge) || 0)))}%`;
    else if (abilityId === "black-hole") value = `${Math.round(Math.max(0, Math.min(100, Number(racer?.raceBlackHoleAbilityProgress) || 0)))}%`;
    else if (abilityId === "drill") value = formatCombatValue(raceDrillDragFor(racer));
    return {
      label: abilityId === "mines"
        ? "BOMBS"
        : abilityId === "speed"
          ? "SPEED"
          : abilityId === "sticky"
            ? "STICK"
            : abilityId === "orbital"
              ? "ORBS"
              : abilityId === "meteor"
                ? "METEOR"
                : abilityId === "slammy"
                  ? "SLAM"
                  : abilityId === "reactor"
                    ? "REACTOR"
                    : abilityId === "black-hole"
                      ? "BLACK HOLE"
                      : "DRAG",
      value,
      color: def?.accent || def?.color || "#858585",
    };
  }).filter((token) => token.value);
}

function raceAbsorberCompactHudEntriesFor(racer, baseColor) {
  const tokens = raceAbsorberLongformTokensFor(racer);
  const entries = [];
  for (let index = 0; index < tokens.length; index += 4) {
    const group = tokens.slice(index, index + 4);
    entries.push({
      text: group.map((token) => `${token.label}: ${token.value}`).join(" · "),
      color: group[0]?.color || baseColor,
    });
  }
  return entries;
}

function raceCommanderProjectileDamageFor(racer, kind) {
  const persistentDamage = kind === "bomb"
    ? racer?.raceCommanderBombDamage
    : racer?.raceCommanderMissileDamage;
  if (Number.isFinite(Number(persistentDamage))) return Number(persistentDamage);
  const projectiles = Array.isArray(racer?.raceCommanderProjectiles)
    ? racer.raceCommanderProjectiles
    : [];
  const latestProjectile = [...projectiles]
    .reverse()
    .find((projectile) => projectile?.kind === kind && Number.isFinite(Number(projectile.damage)));
  if (latestProjectile) return Number(latestProjectile.damage);

  // Commander currently stores authoritative damage on each spawned
  // projectile. Keep the pre-first-shot HUD useful without changing gameplay;
  // persistent fields above take precedence when Gameplay exposes them.
  const bounces = Math.max(0, Math.floor(Number(racer?.raceBounces) || 0));
  return kind === "bomb"
    ? 1 + bounces
    : 50 * (1 + Math.floor(bounces / 3));
}

function raceCommanderHudLinesFor(racer) {
  if (racer?.raceScalingDamageEnabled === false) return [];
  return [
    `BOMB DAMAGE: ${formatRaceDamageValue(racer, raceCommanderProjectileDamageFor(racer, "bomb"))}`,
    `MISSILE DAMAGE: ${formatRaceDamageValue(racer, raceCommanderProjectileDamageFor(racer, "missile"))}`,
  ];
}

function raceBaseSpecialLine(racer) {
  const id = racer?.raceOrbId;
  switch (id) {
    case "duplicator": return `DUPLICATES: ${racer.raceDuplicates || 0}`;
    case "speed": return `SPEED: ${formatCombatValue(racer.raceDisplaySpeed ?? racer.raceSpeed)}`;
    case "orbital": return `ORBS: ${racer.raceOrbiters || 0}`;
    case "drill": return `DRAG: ${formatCombatValue(raceDrillDragFor(racer))}`;
    case "grower": return `SIZE: ${Math.round((racer.raceOrbScale || 1) * 100)}%`;
    case "lazer": {
      return `INTERVAL LEVEL: ${raceLaserIntervalLabelFor(racer)}`;
    }
    case "twins": return `TWIN DAMAGE: ${formatCombatValue(raceTwinDamageForDisplay(racer))}${racer.raceTwinHealing ? " · HEALING" : ""}`;
    case "scissor": return `SPLITS: ${racer.raceScissorSplitCount || 0}`;
    case "sticky": return `STICK LEVEL: ${racer.raceStickyLevel || 1}`;
    case "unarmed": return `SPEED: ${formatCombatValue(racer.raceDisplaySpeed ?? racer.raceSpeed)}`;
    case "poison": return `POISON: ${racePoisonHudMetricFor(racer)}`;
    case "x-squared": return `X²: ${formatCombatValue(racer.raceDamage)}`;
    case "fibonacci": return `FIBO: ${formatCombatValue(racer.raceDamage)}`;
    case "sylvester": return `Sₙ₊₁: ${formatCombatValue(racer.raceDamage)}`;
    case "lucas": return `Lₙ: ${formatCombatValue(racer.raceDamage)}`;
    case "tetration": return `A^^B: ${formatCombatValue(racer.raceDamage)}`;
    case "super-slammy": return `DAMAGE: ${formatCombatValue(racer.raceDamage)}`;
    case "piercer": return `DAMAGE: ${formatCombatValue(racer.raceDamage)} · SWEEP`;
    case "professor": {
      const formId = racer.raceProfessorRouletteVisualOrbId || racer.raceProfessorActiveOrbId;
      return `FORM: ${formId ? (ORB_RACERS[formId]?.name || formId) : "READY"}`;
    }
    case "trifecta": return `HITS: ${racer.raceTrifectaLayerHits || 0}/3 · SHOCKWAVES: ${racer.raceTrifectaShockwaveCount || 0}`;
    case "gravitator": return `PULL: ${Math.round((racer.raceGravitatorPullLevel || 0) * 100)}%${racer.raceGravitatorAttached ? " · LOCKED" : ""}`;
    case "x-power": return `Xˣ: ${formatCombatValue(racer.raceDamage)}`;
    case "super-x-power": return `X^X: ${formatCombatValue(racer.raceDamage)}`;
    case "phi": return `φ: ${formatCombatValue(racer.raceDamage)}`;
    case "flash": return `SPEED: ${formatCombatValue(racer.raceDisplaySpeed ?? racer.raceSpeed)}`;
    case "batman": return `BATS: ${racer.raceBatarangs || 0} · GRAPPLE: ${Number(racer.raceBatmanGrappleCooldown) > 0 ? `${Number(racer.raceBatmanGrappleCooldown).toFixed(1)}S` : "READY"}`;
    case "boomerang": return `BOOMERANG LEVEL: ${racer.raceBoomerangLevel || 0}`;
    case "magnet": return `PULL: ${formatCombatValue(racer.raceMagnetPull)}`;
    case "mines": return `BOMBS: ${racer.raceMineLevel || 1}`;
    case "gravity": return `GRAVITY LEVEL: ${racer.raceGravityLevel || 0}`;
    case "jackpot": return `MULTIPLIER: ${formatRaceMultiplier(racer.raceJackpotMultiplier ?? 1)}×`;
    case "quadratic": return `QUADRATIC: X^${Math.max(1, (racer.raceBounces || 0) + 1)}`;
    case "pi": return `PI DIGIT: ${racer.raceBounces ? "314159265358979323846264338327950288419716939937510"[(racer.raceBounces - 1) % 51] : 3}`;
    case "speed-impact": return "";
    case "factorial": return `N!: ${Math.max(1, (racer.raceBounces || 0) + 1)}`;
    case "prime": return `PRIME HITS: ${racer.racePrimeHits || 0}`;
    case "integral": return `AREA: ${formatCombatValue(racer.raceIntegralCharge || 0)}`;
    case "ricochet": return `CANNON: ${formatCombatValue(racer.raceRicochetProjectiles?.[0]?.damage || 1)}`;
    case "commander": return "";
    case "shrapnel": return `FRAGMENTS: ${racer.raceShrapnelFragmentsSpawned || 0}`;
    case "roulette": return `ABSORBED: ${raceRouletteAbsorbedOrbLabels(racer).join(" · ")}`;
    case "architect": return `BUILDS: ${racer.raceArchitectBuilds || 0}`;
    case "sawblade": return `BLADES: ${racer.raceSawbladeShots || 0}`;
    case "black-hole": return `POWER: ${formatCombatValue(racer.raceBlackHolePower || 0)}`;
    case "centy": return `PERCENT: ${(racer.raceCentyPercent || 1).toFixed(1)}%`;
    case "infinity": return "";
    case "charger": return `INTERVAL: ${(racer.raceChargerInterval || 1.5).toFixed(2)}S`;
    case "bouncer": return `MINI ORBS: ${(racer.raceBouncerOrbs || []).length}`;
    case "blue-sun": return `POWER LEVEL: ${racer.raceBlueSunPowerLevel || 1}`;
    case "purple-sun": return `POWER LEVEL: ${racer.racePurpleSunPowerLevel || 1}`;
    case "phase-three-sun": return `POWER LEVEL: ${racer.racePhaseThreeSunPowerLevel || 1} · SIZE: ${Math.round((racer.racePhaseThreeSunLaserScale || 1) * 100)}%`;
    case "phase-two-sun": return `POWER LEVEL: ${racer.racePhaseTwoSunPowerLevel || 1} · BURN: 25% / 3S`;
    case "snake": return `TAIL: ${racer.raceSnakeTailOrbs || 0} · DMG: ${formatCombatValue(racer.raceSnakeTailDamage || 0)}/HIT · SNAKES: ${(racer.raceSnakeOrbs || []).length + 1}`;
    case "vampire": return `STEAL: ${Math.round((racer.raceVampireStealPercent || 0) * 100)}%`;
    case "cubed": return `CUBE: ${formatCombatValue(racer.raceDamage || 1)}`;
    case "double": return `DOUBLE: ${formatCombatValue(racer.raceDamage || 1)}`;
    case "tripler": return `TRIPLE: ${formatCombatValue(racer.raceDamage || 1)}`;
    case "turret": return `TURRET TIME: ${(racer.raceTurretDuration || 3).toFixed(1)}S`;
    case "leech": return `LEECH LEVEL: ${racer.raceLeechLevel || 1}`;
    case "crusher": return `WEIGHT: ${racer.raceCrusherWeight || 1}`;
    case "berserker": return "";
    case "reactor": return "";
    case "parasite": return `SPAWN: ${(racer.raceParasiteInterval || 2).toFixed(2)}S`;
    case "draftmaster": return `D${racer.raceDraftDamageLevel || 0} · P${racer.raceDraftProjectileLevel || 0} · S${racer.raceDraftSpeedLevel || 0}`;
    case "needle": return `PIERCED: ${formatCombatValue(racer.raceNeedlePiercedDamage || 0)}`;
    case "multiplier": return `MULTIPLIER: ${formatRaceMultiplier(racer.raceMultiplier || 1)}×`;
    case "sniper": return "";
    case "snowball": return `DRAIN: ${formatCombatValue(racer.raceSnowballDamagePerSecond || 2)}/SEC · SIZE: ${Math.round((racer.raceSnowballSize || 1) * 100)}%`;
    case "countdown": return `COUNTDOWN: ${racer.raceCountdown ?? 10}`;
    case "100x": return `100X: ${formatRaceDamageValue(racer, racer.raceDamage)}`;
    case "grappler": return `SPEED: ${formatCombatValue(racer.raceDisplaySpeed ?? racer.raceSpeed)}`;
    case "artists": return `DRAWING: ${racer.raceArtistPaintingName || "READY"}`;
    case "pancake": return `FLIPS: ${racer.racePancakeFlipCount || 0} · PATCHES: ${(racer.racePancakePatches || []).length + (racer.racePancakeButterPatches || []).length}`;
    case "tree": return racer.raceTreeRootsActive
      ? `ROOTS: ${(Number(racer.raceTreeRootsTimer) || 0).toFixed(1)}S · LEECH: ${formatCombatValue(racer.raceTreeRootDamagePerLayer || 0)}`
      : `CHARGE: ${racer.raceTreeCharge || 0}/5`;
    case "copycat": {
      const copiedOrbId = racer.raceCopycatActiveAbilityId || racer.raceCopycatVisualOrbId;
      const copiedOrbName = copiedOrbId
        ? (ORB_RACERS[copiedOrbId]?.name || String(copiedOrbId).toUpperCase())
        : "NONE";
      return `COPIED: ${copiedOrbName}`;
    }
    case "reality-bomb": return `SLAMMYS: ${racer.raceRealitySlammyCount || 0} · SHIFTS: ${racer.raceRealityShiftCount || 0}`;
    case "tsar-bomb": return `DETONATION: ${raceTsarBombCountdownLineFor(racer)} · REACTOR: ${formatCombatValue(racer.raceTsarBombReactorDamage || 0)}`;
    case "all-in-one": return `POWER: ${racer.raceAllInOneActive ? "ACTIVE" : "CHARGING"} · ×${Math.max(1, Number(racer.raceAllInOnePowerMultiplier) || 1)}`;
    case "breaker": return `CRIT CHANCE: ${Math.round(Number(racer.raceBreakerCritChance) || 1)}%`;
    case "square-root": return `ROOT HITS: ${racer.raceSquareRootHits || 0}`;
    case "progressive": return `NEXT ×5: ${(Number(racer.raceProgressiveCooldown) || 0).toFixed(1)}S`;
    case "random": return `MAX: ${formatCombatValue(racer.raceRandomMaxDamage || 1)} · LAST: ${formatCombatValue(racer.raceRandomLastDamage || 1)}`;
    case "lag": return `GLITCH: ${racer.raceLagGlitchCount || 0} · ${racer.raceLagGlitchActive ? `${formatCombatValue(racer.raceLagGlitchDamagePerTick ?? racer.raceLagGlitchDamagePerSecond)}/${formatCombatValue(racer.raceLagGlitchTickInterval || 0.5)}S` : "READY"}`;
    case "whirlwind": return `WHIRL: ${formatCombatValue(racer.raceWhirlwindDamage || 0)} · HITS: ${racer.raceWhirlwindHits || 0}`;
    case "rgb": return `COLOR: ${(raceRgbColorFor(racer)?.id || "red").toUpperCase()} · SPEED: ${formatCombatValue(racer.raceDisplaySpeed ?? racer.raceSpeed)}`;
    case "rain": return "RAIN";
    case "hacker": {
      return `HACK: ${racer.raceHackerOutcomeLabel || "READY"}`;
    }
    case "miner": return `DRILL: ${racer.raceMinerState.toUpperCase()} · ${Math.round((racer.raceMinerState === "drill" ? racer.raceMinerDrillProgress : racer.raceMinerUpgradeProgress) * 100)}%`;
    case "critical": return `CRIT: ${Math.round((racer.raceCriticalChance || 0.05) * 100)}%`;
    default: return "";
  }
}

function raceRgbColorFor(racer) {
  const rouletteValue = racer?.raceRgbRouletteVisualColorIndex;
  const rouletteIndex = Number(rouletteValue);
  const hasRouletteIndex = rouletteValue !== null
    && rouletteValue !== undefined
    && rouletteValue !== ""
    && Number.isFinite(rouletteIndex);
  const index = Math.max(0, Math.min(
    RACE_RGB_COLORS.length - 1,
    Math.floor(hasRouletteIndex ? rouletteIndex : (Number(racer?.raceRgbColorIndex) || 0)),
  ));
  return RACE_RGB_COLORS[index] || RACE_RGB_COLORS[0];
}

function raceLongformTopStatLineFor(racer) {
  if (racer?.raceOrbId === "duplicator") {
    return `DUPLICATES: ${racer.raceDuplicates || 0}`;
  }
  if (racer?.raceOrbId === "unarmed") {
    return `SPEED: ${formatCombatValue(racer.raceDisplaySpeed ?? racer.raceSpeed)}`;
  }
  return "";
}

function raceDraftmasterHudLines(racer, simTime = 0) {
  const upgrade = RACE_DRAFT_UPGRADE_LABELS[racer?.raceDraftLastUpgrade] || "WAITING";
  const projectileLevel = Math.max(0, Math.floor(Number(racer?.raceDraftProjectileLevel) || 0));
  const projectileCount = projectileLevel >= 2 ? 3 : 1;
  return [
    raceDamageHudLineFor(racer),
    `SPEED: ${formatCombatValue(racer?.raceDisplaySpeed ?? racer?.raceSpeed)}`,
    `PROJECTILE #: ${projectileCount}`,
    `POWERUP: ${upgrade}`,
  ].filter(Boolean);
}

function raceDraftmasterAbilityProgress(racer, simTime = 0) {
  const speedLevel = Math.max(0, Number(racer?.raceDraftSpeedLevel) || 0);
  const cooldownScale = Math.max(
    DRAFTMASTER_MIN_COOLDOWN_SCALE,
    1 - speedLevel * DRAFTMASTER_COOLDOWN_REDUCTION_PER_SPEED_LEVEL,
  );
  const cooldown = DRAFTMASTER_UPGRADE_SECONDS * cooldownScale;
  const remaining = Math.max(0, (Number(racer?.raceDraftNextUpgradeAt) || 0) - (Number(simTime) || 0));
  return Math.max(0, Math.min(100, (1 - remaining / cooldown) * 100));
}

function raceDamageHudLineFor(racer) {
  if (["rain", "hacker", "breaker", "square-root", "scissor", "lazer", "phase-three-sun", "phase-two-sun", "professor", "trifecta", "tsar-bomb"].includes(racer?.raceOrbId)) return "";
  if (racer?.raceScalingDamageEnabled === false) return "";
  if (racer?.raceOrbId === "purple-sun") {
    return `LASER: ${formatCombatValue(racer.racePurpleSunBeamDamage || 8000)}/SEC`;
  }
  if (racer?.raceOrbId === "phase-three-sun") {
    return `LASER: ${formatCombatValue(racer.racePhaseThreeSunDamagePerLaser || 2000)}/SEC`;
  }
  if (racer?.raceOrbId === "phase-two-sun") {
    return `LASER: ${formatCombatValue(racer.racePhaseTwoSunDamagePerLaser || 1000)}/SEC`;
  }
  const displayedDamage = racer?.raceOrbId === "meteor"
    ? racer.raceMeteorDamage ?? racer.raceDamage
    : racer?.raceOrbId === "sniper"
      ? racer.raceSniperDamage
      : racer?.raceOrbId === "grappler"
        ? racer.raceGrapplerDamage
        : racer?.raceOrbId === "artists"
          ? racer.raceArtistPaintingDamage
            : racer?.raceOrbId === "pancake"
              ? racer.racePancakeStackDamage ?? racer.raceDamage
            : racer?.raceOrbId === "lag" && racer.raceLagGlitchActive
              ? racer.raceLagGlitchDamagePerTick ?? racer.raceLagGlitchDamagePerSecond
            : racer?.raceOrbId === "whirlwind"
              ? racer.raceWhirlwindDamage
            : racer?.raceOrbId === "tree" && racer.raceTreeRootsActive
              ? racer.raceTreeRootDamagePerLayer ?? racer.raceDamage
      : racer?.raceOrbId === "twins"
        ? raceTwinDamageForDisplay(racer)
      : racer?.raceDamage;
  const damageLabel = racer?.raceOrbId === "artists"
    ? "PAINT DAMAGE"
    : racer?.raceOrbId === "pancake"
      ? "PANCAKE DAMAGE"
      : racer?.raceOrbId === "tree" && racer.raceTreeRootsActive
        ? "ROOT DAMAGE"
        : ["boomerang", "mines", "orbital", "bouncer", "blue-sun", "turret", "parasite", "grappler", "lag", "whirlwind"].includes(racer?.raceOrbId)
      ? "WEAPON DAMAGE"
      : "DAMAGE";
  return `${damageLabel}: ${formatRaceDamageValue(racer, displayedDamage)}`;
}

function raceTwinDamageForDisplay(racer) {
  const baseDamage = Number(racer?.raceDamage) || 0;
  return baseDamage * (racer?.raceTwinHealing === true ? 2 : 1);
}

function raceSniperHudLinesFor(racer) {
  const shots = Math.max(0, Math.floor(Number(racer?.raceSniperShots) || 0));
  return [
    raceDamageHudLineFor(racer),
    `SHOTS: ${shots}`,
  ].filter(Boolean);
}

function raceHydrogenCountdownLineFor(racer) {
  const elapsed = Math.max(0, Number(racer?.raceHydrogenCountdownElapsed) || 0);
  const remaining = Math.max(0, RACE_HYDROGEN_BOMB_COUNTDOWN_SECONDS - elapsed);
  return `${remaining.toFixed(3)}S`;
}

function raceTsarBombCountdownLineFor(racer) {
  const elapsed = Math.max(0, Number(racer?.raceTsarBombCountdownElapsed) || 0);
  const remaining = Math.max(0, RACE_TSAR_BOMB_COUNTDOWN_SECONDS - elapsed);
  return `${remaining.toFixed(1)}S`;
}

export function raceAntimatterCooldownSecondsFor(racer) {
  const detonationCount = Number(racer?.raceAntimatterDetonationCount) || 0;
  if (detonationCount >= 2) return RACE_ANTIMATTER_POST_SECOND_COOLDOWN_SECONDS;
  const configuredCooldown = Number(racer?.raceAntimatterCooldownSeconds);
  return Number.isFinite(configuredCooldown) && configuredCooldown > 0
    ? configuredCooldown
    : RACE_BOMB_CYCLE_SECONDS;
}

export function raceAntimatterCountdownLineFor(racer) {
  const elapsed = Math.max(0, Number(racer?.raceAntimatterCountdownElapsed) || 0);
  const cooldownSeconds = raceAntimatterCooldownSecondsFor(racer);
  return String(Math.max(0, cooldownSeconds - elapsed).toFixed(1)) + "S";
}

function raceTimeBombCountdownLineFor(racer, simTime = 0) {
  const elapsed = Math.max(0, Number(racer?.raceTimeBombCycleElapsed) || 0);
  const frozen = Number(racer?.raceTimeBombFreezeUntil) > Number(simTime);
  return frozen
    ? Math.max(0, Number(racer.raceTimeBombFreezeUntil) - Number(simTime)).toFixed(1) + "S"
    : String(Math.max(0, RACE_BOMB_CYCLE_SECONDS - elapsed).toFixed(1)) + "S";
}

function raceRealityCountdownLineFor(racer, simTime = 0) {
  const nextAt = Number(racer?.raceRealityNextShiftAt);
  const remaining = Number.isFinite(nextAt)
    ? Math.max(0, nextAt - Number(simTime))
    : RACE_BOMB_CYCLE_SECONDS;
  return "NEXT SHIFT " + remaining.toFixed(1) + "S";
}

function raceHudLinesFor(racer, simTime = 0) {
  if (!racer?.raceOrbId) return [];
  if (racer.raceOrbId === "hydrogen-bomb") return [raceHydrogenCountdownLineFor(racer)];
  if (racer.raceOrbId === "antimatter-bomb") return [
    "DETONATION " + raceAntimatterCountdownLineFor(racer),
    "BLASTS: " + (Number(racer.raceAntimatterDetonationCount) || 0),
  ];
  if (racer.raceOrbId === "time-bomb") return [
    "MIDNIGHT " + raceTimeBombCountdownLineFor(racer, simTime),
    "FREEZE: " + (Number(racer.raceTimeBombCycleCount) || 0),
  ];
  if (racer.raceOrbId === "reality-bomb") return [
    raceRealityCountdownLineFor(racer, simTime),
    "SLAMMYS: " + (Number(racer.raceRealitySlammyCount) || 0),
  ];
  if (racer.raceOrbId === "tsar-bomb") return [
    "DETONATION " + raceTsarBombCountdownLineFor(racer),
    `REACTOR: ${formatCombatValue(racer.raceTsarBombReactorDamage || 0)} · EVERY 8S`,
  ];
  if (racer.raceOrbId === "all-in-one") return [
    `POWER: ${racer.raceAllInOneActive ? "ACTIVE" : "CHARGING"} · ×${Math.max(1, Number(racer.raceAllInOnePowerMultiplier) || 1)}`,
    `BOMB: ${Math.max(0, RACE_TSAR_BOMB_COUNTDOWN_SECONDS - (Number(racer.raceAllInOneHydrogenCountdownElapsed) || 0)).toFixed(1)}S`,
  ];
  if (racer.raceOrbId === "draftmaster") return raceDraftmasterHudLines(racer, simTime);
  if (racer.raceOrbId === "sniper") return raceSniperHudLinesFor(racer);
  if (racer.raceOrbId === "commander") return raceCommanderHudLinesFor(racer);
  // Hacker's active result and Hydrogen countdown are rendered directly above
  // the generated Hacker sprite, matching Draftmaster's upgrade callout. Do
  // not duplicate those lines in the lower lane HUD.
  if (racer.raceOrbId === "hacker") return [];
  if (["grappler", "artists", "pancake", "tree", "copycat", "lag", "whirlwind", "rgb", "rain", "miner", "purple-sun", "phase-three-sun", "phase-two-sun", "professor", "trifecta", "gravitator"].includes(racer.raceOrbId)) {
    return [raceDamageHudLineFor(racer), raceBaseSpecialLine(racer)].filter(Boolean);
  }
  if (racer.raceOrbId === "roulette") {
    return [
      raceDamageHudLineFor(racer),
      ...raceAbsorberAbilityIdsFor(racer).map((abilityId) => raceAbsorberAbilityHudLineFor(racer, abilityId)),
      ...raceAbsorberHudLinesFor(racer),
    ].filter(Boolean);
  }
  const abilityIds = raceAbilityIdsForHud(racer);
  const comboAbilityIds = abilityIds.filter((abilityId) => Object.hasOwn(RACE_COMBO_HUD_LABELS, abilityId));
  const weaponAbilityId = raceWeaponComboAbilityIdFor(abilityIds);
  if (abilityIds.length >= 2 && weaponAbilityId) {
    return [raceDamageHudLineFor(racer), raceAbilityMetricLine(racer, weaponAbilityId)].filter(Boolean);
  }
  if (comboAbilityIds.length >= 2) {
    return comboAbilityIds.slice(0, 2).map((abilityId) => raceAbilityMetricLine(racer, abilityId)).filter(Boolean);
  }

  if (racer.raceOrbId === "ying-yang") {
    return [
      raceDamageHudLineFor(racer),
      `SPEED: ${formatCombatValue(racer.raceDisplaySpeed ?? racer.raceSpeed)}`,
    ].filter(Boolean);
  }
  const displayedDamage = racer?.raceOrbId === "meteor"
    ? racer.raceMeteorDamage ?? racer.raceDamage
    : racer?.raceDamage;
  const meteorSmallDamage = racer?.raceMeteorSmallDamage ?? Math.max(1, Math.round(displayedDamage || 0));
  const meteorGiantDamage = racer?.raceMeteorGiantDamage ?? 500;
  if (racer?.raceOrbId === "godzilla") {
    return [
      `STOMP: ${formatCombatValue(racer.raceGodzillaStompDamage || 50)}`,
      `BEAM: ${formatCombatValue(racer.raceGodzillaBeamDamagePerSecond || 1000)}/SEC`,
    ];
  }
  if (racer?.raceOrbId === "meteor") {
    return [
      `SMALL: ${formatCombatValue(meteorSmallDamage)}`,
      `BIG: ${formatCombatValue(meteorGiantDamage)}`,
    ];
  }
  if (racer?.raceOrbId === "blue-sun") {
    return [
      `LASER: ${formatCombatValue(racer.raceBlueSunDamagePerLaser || 1000)}/SEC`,
      `POWER LEVEL: ${racer.raceBlueSunPowerLevel || 1}`,
    ];
  }
  if (racer?.raceOrbId === "purple-sun") {
    return [
      `LASER: ${formatCombatValue(racer.racePurpleSunBeamDamage || 8000)}/SEC`,
      `POWER LEVEL: ${racer.racePurpleSunPowerLevel || 1}`,
    ];
  }
  if (racer?.raceOrbId === "phase-three-sun") {
    return [
      `LASER: ${formatCombatValue(racer.racePhaseThreeSunDamagePerLaser || 2000)}/SEC`,
      `POWER LEVEL: ${racer.racePhaseThreeSunPowerLevel || 1}`,
    ];
  }
  if (racer?.raceOrbId === "phase-two-sun") {
    return [
      `LASER: ${formatCombatValue(racer.racePhaseTwoSunDamagePerLaser || 1000)}/SEC`,
      `BURN: 25% / 3S`,
    ];
  }
  if (racer?.raceOrbId === "professor") {
    return [
      `FORM: ${racer.raceProfessorRouletteVisualOrbId
        ? (ORB_RACERS[racer.raceProfessorRouletteVisualOrbId]?.name || racer.raceProfessorRouletteVisualOrbId)
        : racer.raceProfessorActiveOrbId
          ? (ORB_RACERS[racer.raceProfessorActiveOrbId]?.name || racer.raceProfessorActiveOrbId)
          : "READY"}`,
      `SPINS: ${racer.raceProfessorSpinCount || 0}`,
    ];
  }

  if (abilityIds.length >= 2 && comboAbilityIds.length === 1) {
    return [raceDamageHudLineFor(racer), raceAbilityMetricLine(racer, comboAbilityIds[0])].filter(Boolean);
  }

  return [
    raceDamageHudLineFor(racer),
    raceBaseSpecialLine(racer),
  ].filter(Boolean).slice(0, 2);
}

function raceHudColorForRacer(racer, fallback = "#111111") {
  if (racer?.raceOrbId === "batman") return "#050505";
  return raceTextColorForRacer(racer, fallback);
}

function raceHudEntriesFor(racer, simTime = 0) {
  if (!racer?.raceOrbId) return [];
  const baseColor = raceHudColorForRacer(racer);
  if (racer.raceOrbId === "sniper") {
    return raceSniperHudLinesFor(racer).map((text) => ({ text, color: baseColor }));
  }
  if (racer.raceOrbId === "commander") {
    return raceCommanderHudLinesFor(racer).map((text) => ({ text, color: baseColor }));
  }
  if (racer.raceOrbId === "roulette") {
    const absorberEntries = raceAbsorberHudEntriesFor(racer, baseColor);
    const colors = raceAbsorberColorsFor(racer);
    return [
      raceDamageHudLineFor(racer)
        ? { text: raceDamageHudLineFor(racer), color: baseColor }
        : null,
      ...absorberEntries,
      ...raceAbsorberHudLinesFor(racer).map((text, index) => ({
        text,
        color: colors[index % Math.max(1, colors.length)] || baseColor,
      })),
    ].filter((entry) => entry?.text);
  }
  // These bombers have compact countdown/power HUDs. Keep that readout ahead
  // of the generic combo renderer so All In One's full ability list cannot
  // replace it with an arbitrary weapon metric or base-damage line.
  if (racer.raceOrbId === "tsar-bomb" || racer.raceOrbId === "all-in-one") {
    return raceHudLinesFor(racer, simTime).map((text) => ({ text, color: baseColor }));
  }
  const abilityIds = raceAbilityIdsForHud(racer);
  const comboAbilityIds = abilityIds.filter((abilityId) => Object.hasOwn(RACE_COMBO_HUD_LABELS, abilityId));
  const weaponAbilityId = raceWeaponComboAbilityIdFor(abilityIds);
  if (abilityIds.length >= 2 && weaponAbilityId) {
    const text = raceAbilityMetricLine(racer, weaponAbilityId);
    return [
      { text: raceDamageHudLineFor(racer), color: baseColor },
      text ? { text, color: ORB_RACERS[weaponAbilityId]?.color || baseColor } : null,
    ].filter((entry) => entry?.text);
  }
  if (comboAbilityIds.length >= 2) {
    return comboAbilityIds.slice(0, 2)
      .map((abilityId) => {
        const text = raceAbilityMetricLine(racer, abilityId);
        return text
          ? { text, color: ORB_RACERS[abilityId]?.color || baseColor }
          : null;
      })
      .filter(Boolean);
  }
  if (abilityIds.length >= 2 && comboAbilityIds.length === 1) {
    const text = raceAbilityMetricLine(racer, comboAbilityIds[0]);
    return [
      { text: raceDamageHudLineFor(racer), color: baseColor },
      text ? { text, color: ORB_RACERS[comboAbilityIds[0]]?.color || baseColor } : null,
    ].filter(Boolean);
  }
  return raceHudLinesFor(racer, simTime).map((text) => ({ text, color: baseColor }));
}

function drawTrackedText(ctx, text, x, y, spacing) {
  const characters = Array.from(String(text));
  const widths = characters.map((character) => ctx.measureText(character).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, characters.length - 1) * spacing;
  const alignment = ctx.textAlign;
  let cursor = alignment === "right" ? x - totalWidth : alignment === "center" ? x - totalWidth / 2 : x;
  ctx.textAlign = "left";
  characters.forEach((character, index) => {
    ctx.strokeText(character, cursor, y);
    ctx.fillText(character, cursor, y);
    cursor += widths[index] + spacing;
  });
  ctx.textAlign = alignment;
  return totalWidth;
}

function drawRainbowText(ctx, text, x, y) {
  const characters = Array.from(String(text));
  const widths = characters.map((character) => ctx.measureText(character).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  const alignment = ctx.textAlign;
  let cursor = alignment === "right" ? x - totalWidth : alignment === "center" ? x - totalWidth / 2 : x;
  ctx.textAlign = "left";
  characters.forEach((character, index) => {
    ctx.fillStyle = ORB_RACE_RAINBOW_PALETTE[index % ORB_RACE_RAINBOW_PALETTE.length];
    ctx.strokeText(character, cursor, y);
    ctx.fillText(character, cursor, y);
    cursor += widths[index];
  });
  ctx.textAlign = alignment;
  return totalWidth;
}

function drawTextSegments(ctx, segments, x, y) {
  const widths = segments.map((segment) => ctx.measureText(segment.text).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  const alignment = ctx.textAlign;
  let cursor = alignment === "right" ? x - totalWidth : alignment === "center" ? x - totalWidth / 2 : x;
  ctx.textAlign = "left";
  segments.forEach((segment, index) => {
    ctx.fillStyle = segment.color;
    ctx.strokeText(segment.text, cursor, y);
    ctx.fillText(segment.text, cursor, y);
    cursor += widths[index];
  });
  ctx.textAlign = alignment;
  return totalWidth;
}

export function socialBattleLayout(width, height, formatId = null, arenaSizeId = "standard") {
  if (formatId === "portrait" || (!formatId && height / width > 1.35)) {
    const namesHeight = 132;
    const abilityHeight = 92;
    const sectionGap = 22;
    const widthRatio = arenaSizeId === "large" ? 0.95 : 0.71;
    const arenaSize = Math.min(
      Math.round(width * widthRatio),
      height - namesHeight - abilityHeight - sectionGap * 2 - 48,
    );
    const compositionY = 410;
    const arenaY = compositionY + namesHeight + sectionGap;
    const arenaX = Math.round((width - arenaSize) / 2);
    return {
      names: { x: arenaX + 38, y: compositionY, width: arenaSize - 76, height: namesHeight },
      arena: { x: arenaX, y: arenaY, width: arenaSize, height: arenaSize },
      announcement: { x: arenaX + 52, y: arenaY + arenaSize / 2 - 42, width: arenaSize - 104, height: 84 },
      abilities: { x: arenaX, y: arenaY + arenaSize + sectionGap, width: arenaSize, height: abilityHeight },
    };
  }
  if (formatId === "landscape" || (!formatId && width / height > 1.35)) {
    const arenaY = 96;
    const abilityHeight = 72;
    const arenaSize = Math.min(width - 120, height - arenaY - 16 - abilityHeight - 20);
    const arenaX = Math.round((width - arenaSize) / 2);
    return {
      names: { x: arenaX, y: 20, width: arenaSize, height: 64 },
      arena: { x: arenaX, y: arenaY, width: arenaSize, height: arenaSize },
      announcement: { x: arenaX + 54, y: arenaY + arenaSize / 2 - 38, width: arenaSize - 108, height: 76 },
      abilities: { x: arenaX, y: arenaY + arenaSize + 16, width: arenaSize, height: abilityHeight },
    };
  }
  const arenaY = 108;
  const abilityHeight = 82;
  const arenaSize = Math.min(width - 80, height - arenaY - 18 - abilityHeight - 20);
  const arenaX = Math.round((width - arenaSize) / 2);
  return {
    names: { x: arenaX, y: 24, width: arenaSize, height: 68 },
    arena: { x: arenaX, y: arenaY, width: arenaSize, height: arenaSize },
    announcement: { x: arenaX + 46, y: arenaY + arenaSize / 2 - 38, width: arenaSize - 92, height: 76 },
    abilities: { x: arenaX, y: arenaY + arenaSize + 18, width: arenaSize, height: abilityHeight },
  };
}

export function raceLongformSideCopyLayout(layout, track, trackIndex) {
  const canvasWidth = Math.max(1, Number(layout?.width) || 1920);
  const trackX = Number(track?.x) || 0;
  const trackWidth = Math.max(1, Number(track?.width) || 1);
  const isLeftTrack = Number(trackIndex) === 0;
  const sideStart = isLeftTrack ? 0 : trackX + trackWidth;
  const sideEnd = isLeftTrack ? trackX : canvasWidth;
  const sideWidth = Math.max(1, sideEnd - sideStart);
  const padding = Math.min(28, Math.max(12, sideWidth * 0.08));
  return {
    x: sideStart + sideWidth / 2,
    y: (Number(track?.y) || 0)
      + (Number(track?.height) || 0)
      - Math.max(52, (Number(layout?.headerHeight) || 122) * 0.38),
    width: Math.max(1, sideWidth - padding * 2),
    lineGap: Math.max(14, Math.min(26, sideWidth * 0.1)),
    sideStart,
    sideEnd,
  };
}

export function classicMatchupTitleLayout(ctx, leftName, rightName, {
  width = 1080,
  safeWidth = width * 0.92,
  maxFontSize = Math.min(84, width * 0.12),
  minFontSize = Math.max(18, width * 0.026),
  gapRatio = 0.2,
  leftIcon = null,
  rightIcon = null,
} = {}) {
  const left = String(leftName || "").toUpperCase();
  const right = String(rightName || "").toUpperCase();
  const vs = "VS";
  const safe = Math.max(1, Number(safeWidth) || width * 0.92);
  const floorFontSize = Math.max(1, Number(minFontSize) || 18);
  let fontSize = Math.max(floorFontSize, Number(maxFontSize) || floorFontSize);
  const iconMetrics = (icon, size) => {
    if (!icon) return null;
    const widthRatio = Number(icon.widthRatio ?? icon.width ?? 1.16);
    const heightRatio = Number(icon.heightRatio ?? icon.height ?? 1.1);
    return {
      width: Math.max(0, widthRatio) * size,
      height: Math.max(0, heightRatio) * size,
    };
  };
  const measureAt = (size, compact = false) => {
    ctx.font = `900 ${size}px ${CLASSIC_TITLE_FONT}`;
    const gap = Math.max(compact ? 2 : 6, size * gapRatio);
    const iconLeft = iconMetrics(leftIcon, size);
    const iconRight = iconMetrics(rightIcon, size);
    const segments = [
      { kind: "left-text", text: left, width: ctx.measureText(left).width, height: size },
    ];
    if (iconLeft) segments.push({ kind: "left-icon", text: "", ...iconLeft });
    segments.push({ kind: "vs", text: vs, width: ctx.measureText(vs).width, height: size });
    if (iconRight) segments.push({ kind: "right-icon", text: "", ...iconRight });
    segments.push({ kind: "right-text", text: right, width: ctx.measureText(right).width, height: size });
    let cursor = 0;
    for (const [index, segment] of segments.entries()) {
      segment.x = cursor;
      segment.y = -segment.height / 2;
      cursor += segment.width;
      if (index < segments.length - 1) cursor += gap;
    }
    const totalWidth = cursor;
    const height = Math.max(...segments.map((segment) => segment.height), size);
    return {
      gap,
      segments,
      totalWidth,
      height,
      leftWidth: segments.find((segment) => segment.kind === "left-text").width,
      vsWidth: segments.find((segment) => segment.kind === "vs").width,
      rightWidth: segments.find((segment) => segment.kind === "right-text").width,
    };
  };

  let measurements = measureAt(fontSize);
  while (measurements.totalWidth > safe && fontSize > floorFontSize) {
    fontSize = Math.max(floorFontSize, fontSize - 2);
    measurements = measureAt(fontSize);
  }
  // The named floor is a readability target, not permission to overlap. If an
  // unusually long future roster still exceeds the safe width, keep shrinking
  // with condensed gaps until the measured group fits.
  while (measurements.totalWidth > safe && fontSize > 1) {
    fontSize = Math.max(1, fontSize - 1);
    measurements = measureAt(fontSize, true);
  }

  const startX = (width - measurements.totalWidth) / 2;
  const segment = (kind) => {
    const found = measurements.segments.find((item) => item.kind === kind);
    return found ? { ...found, x: startX + found.x } : null;
  };
  const leftSegment = segment("left-text");
  const leftIconSegment = segment("left-icon");
  const vsSegment = segment("vs");
  const rightIconSegment = segment("right-icon");
  const rightSegment = segment("right-text");
  return {
    left,
    right,
    vs,
    fontSize,
    gap: measurements.gap,
    totalWidth: measurements.totalWidth,
    safeWidth: safe,
    groupX: startX,
    groupWidth: measurements.totalWidth,
    groupCenter: startX + measurements.totalWidth / 2,
    groupBounds: {
      x: startX,
      y: -measurements.height / 2,
      width: measurements.totalWidth,
      height: measurements.height,
    },
    segments: [leftSegment, leftIconSegment, vsSegment, rightIconSegment, rightSegment].filter(Boolean),
    leftSegment,
    leftIconSegment,
    vsSegment,
    rightIconSegment,
    rightSegment,
    leftX: leftSegment.x,
    vsX: vsSegment.x,
    rightX: rightSegment.x,
    leftWidth: measurements.leftWidth,
    vsWidth: measurements.vsWidth,
    rightWidth: measurements.rightWidth,
  };
}

export function classicAbsorberHistoryLabelFor(sim) {
  const labels = [];
  for (const fighter of sim?.fighters || []) {
    if (fighter.type !== "absorber") continue;
    const history = Array.isArray(fighter.classicAbsorptionHistory)
      ? fighter.classicAbsorptionHistory
      : fighter.classicAbsorbedOrbId || fighter.classicAbsorbedAbility
        ? [fighter.classicAbsorbedOrbId || fighter.classicAbsorbedAbility]
        : [];
    for (const sourceId of history) {
      const normalized = String(sourceId || "").toLowerCase();
      if (!normalized) continue;
      labels.push(CLASSIC_ORBS[normalized]?.name || normalized.replace(/-/g, " ").toUpperCase());
    }
  }
  return labels.length ? `ABSORBED: ${labels.join(" · ")}` : "";
}

function classicTopStatLineFor(fighter) {
  if (!fighter?.type) return "";
  const damage = formatCombatValue(fighter.damage);
  if (fighter.type === "slammy") return `DAMAGE: ${damage}`;
  if (fighter.type === "unarmed") {
    const speed = Number.isFinite(Number(fighter.baselineSpeed))
      ? Number(fighter.baselineSpeed)
      : Math.hypot(Number(fighter.vx) || 0, Number(fighter.vy) || 0);
    return `DAMAGE: ${damage} · SPEED: ${formatCombatValue(speed)}`;
  }
  if (fighter.type === "duplicator") {
    const duplicates = Math.max(
      0,
      Number(fighter.classicDuplicateSequence ?? fighter.classicDuplicateGeneration) || 0,
    );
    return `DUPLICATES: ${formatCombatValue(duplicates)}`;
  }
  return "";
}

export function classicCtaLayout(ctx, {
  width = 1080,
  safeWidth = width * 0.92,
  maxFontSize = 64,
  minFontSize = 18,
  gapRatio = 0.22,
} = {}) {
  const runs = ["LIKE", "&", "SUBSCRIBE"];
  const safe = Math.max(1, Number(safeWidth) || width * 0.92);
  const floorFontSize = Math.max(1, Number(minFontSize) || 18);
  let fontSize = Math.max(floorFontSize, Number(maxFontSize) || floorFontSize);
  const measureAt = (size, compact = false) => {
    ctx.font = `900 ${size}px ${CLASSIC_CTA_FONT}`;
    const gap = Math.max(compact ? 4 : 8, size * gapRatio);
    const segments = runs.map((text) => ({
      kind: text === "&" ? "ampersand" : text.toLowerCase(),
      text,
      width: ctx.measureText(text).width,
      height: size,
    }));
    let cursor = 0;
    for (const [index, segment] of segments.entries()) {
      segment.x = cursor;
      segment.y = -size / 2;
      cursor += segment.width;
      if (index < segments.length - 1) cursor += gap;
    }
    return { gap, segments, totalWidth: cursor, height: size };
  };
  let measured = measureAt(fontSize);
  while (measured.totalWidth > safe && fontSize > floorFontSize) {
    fontSize = Math.max(floorFontSize, fontSize - 1);
    measured = measureAt(fontSize);
  }
  while (measured.totalWidth > safe && fontSize > 1) {
    fontSize = Math.max(1, fontSize - 1);
    measured = measureAt(fontSize, true);
  }
  const startX = (width - measured.totalWidth) / 2;
  const segments = measured.segments.map((segment) => ({
    ...segment,
    x: startX + segment.x,
  }));
  return {
    phrase: "LIKE & SUBSCRIBE",
    fontSize,
    gap: measured.gap,
    totalWidth: measured.totalWidth,
    safeWidth: safe,
    groupX: startX,
    groupWidth: measured.totalWidth,
    groupCenter: startX + measured.totalWidth / 2,
    segments,
  };
}

export function abilityBarLayout(fighter, rect, simTime = 0) {
  const hud = buildAbilityHud(fighter, simTime);
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    name: hud.name,
    progress: Math.max(0, Math.min(1, hud.progress ?? 0)),
    label: hud.label,
    passive: Boolean(hud.passive),
    active: Boolean(hud.active),
    almostReady: Boolean(hud.almostReady),
    charged: Boolean(hud.charged),
    lastStand: Boolean(hud.lastStand),
  };
}

export function winnerFieldMessage(sim) {
  if (!sim?.finished || !sim.winner) return "";
  const country = WORLD_CUP_COUNTRIES[sim.winner.countryId];
  return `${country?.name || sim.winningRaceTeamName || sim.winner.name} wins`;
}

export function winnerFieldSegments(sim) {
  const message = winnerFieldMessage(sim);
  if (!message) return [];
  const country = WORLD_CUP_COUNTRIES[sim.winner.countryId];
  const hillContender = KING_OF_HILL_CONTENDERS[sim.winner.hillContenderId];
  const raceOrb = ORB_RACERS[sim.winner.raceOrbId];
  const winningTeam = Number.isInteger(sim.winningRaceTeamIndex)
    ? sim.raceTeams?.[sim.winningRaceTeamIndex]
    : null;
  const winningRaceTeam = winningTeam
    ? {
      ...winningTeam,
      members: (winningTeam.memberIds || [])
        .map((memberId) => sim.fighters.find((fighter) => fighter.id === memberId))
        .filter(Boolean),
    }
    : { members: [sim.winner] };
  const winningTitle = sim.winningRaceTeamName || sim.winner.name;
  const comboTitleSegments = raceTitleSegmentsFor(winningRaceTeam, winningTitle);
  if (comboTitleSegments) {
    return [
      ...comboTitleSegments,
      { text: " wins", color: comboTitleSegments.at(-1).color },
    ];
  }
  const teamPalette = winningTeam?.orbIds
    .map((orbId) => ORB_RACERS[orbId]?.color)
    .filter(Boolean);
  const palette = country?.palette
    || hillContender?.palette
    || (sim.winningRaceTeamName === ORB_RACE_EVERYONE_LABEL ? ORB_RACE_RAINBOW_PALETTE : null)
    || (teamPalette?.length ? teamPalette : null)
    || raceOrb?.palette
    || [CLASS_DEFS[sim.winner.type]?.color || "#fff4cf"];
  const characters = Array.from(message);
  if (sim.winningRaceTeamName === ORB_RACE_EVERYONE_LABEL) {
    return characters.map((character, index) => ({
      text: character,
      color: ORB_RACE_RAINBOW_PALETTE[index % ORB_RACE_RAINBOW_PALETTE.length],
    }));
  }
  const segmentCount = Math.min(palette.length, characters.length);
  const segments = [];
  let cursor = 0;
  for (let index = 0; index < segmentCount; index += 1) {
    const remainingCharacters = characters.length - cursor;
    const remainingSegments = segmentCount - index;
    const length = Math.ceil(remainingCharacters / remainingSegments);
    segments.push({ text: characters.slice(cursor, cursor + length).join(""), color: palette[index] });
    cursor += length;
  }
  return segments;
}

export function raceFinishLabelForIndex(racerIndex) {
  return "Like & Subscribe!";
}

export const ORB_RACE_FOOTER_TAG = "#OrbBattleGroundSimulator";

// Long-form transforms place a race ray in the shared world coordinate space
// and the parent track already clips that world to the visible lane. Applying
// a second clip to the tall world rectangle here can cut a beam's glow/cap at
// the transformed world edge, making Blue Sun look like it hits an invisible
// barrier. Portrait boards still use the local board clip for isolation.
export function raceBlueSunLaserClipModeFor(racer) {
  return racer?.raceLongform === true ? "viewport" : "world";
}

export function raceLongformBlueSunOverflowFor(trackWidth, members = []) {
  const width = Math.max(1, Number(trackWidth) || 1);
  const blueSunRadii = members
    .filter((member) => member?.raceOrbId === "blue-sun")
    .map((member) => raceRenderOrbRadius(width, member.raceOrbScale, 15));
  if (!blueSunRadii.length) return 0;
  // Include the outlined core and glow at a top-wall contact. The outer board
  // frame still clips the sides and bottom; only the non-physical long-form
  // camera/header boundary gets enough room for a complete ray end-cap.
  return Math.max(18, width * 0.02, ...blueSunRadii.map((radius) => radius * 0.9));
}

// Tournament long-form exports may intentionally use the compact three-layer
// board. Keep the existing chamber, walls, finish label, and border geometry;
// only the checker field is allowed to continue into the otherwise unused
// interior below the normal finish band.
export function raceLongformTournamentCheckerFillEnabled({
  format = "portrait",
  tournament = false,
  layerCount = 5,
} = {}) {
  return format === "race-landscape" && tournament === true && Number(layerCount) === 3;
}

// Tournament finish bands are already completely filled by the checkerboard.
// Keep the normal finish outline for every other race, but omit the extra
// black rule in tournament captures so the checker field meets the board
// frame cleanly.
export function raceTournamentFinishBorderVisible({ tournament = false } = {}) {
  return tournament !== true;
}

export function raceLongformTournamentCheckerRect({
  format = "portrait",
  tournament = false,
  layerCount = 5,
  track = {},
  finishY = 0,
  finishHeight = 0,
  labelFraction = 0.46,
} = {}) {
  const x = Number(track.x) || 0;
  const y = Number(finishY) || 0;
  const width = Math.max(0, Number(track.width) || 0);
  const safeFinishHeight = Math.max(0, Number(finishHeight) || 0);
  const safeLabelFraction = Number.isFinite(Number(labelFraction))
    ? Math.max(0, Math.min(1, Number(labelFraction)))
    : 0.46;
  const normalHeight = safeFinishHeight * (1 - safeLabelFraction);
  const checkerY = y + safeFinishHeight * safeLabelFraction;
  const trackBottom = (Number(track.y) || 0) + Math.max(0, Number(track.height) || 0);
  const enabled = raceLongformTournamentCheckerFillEnabled({ format, tournament, layerCount });
  return {
    x,
    y: checkerY,
    width,
    height: enabled ? Math.max(normalHeight, trackBottom - checkerY) : normalHeight,
    trackBottom,
    extended: enabled,
  };
}

export function raceLongformTournamentCheckerTileSize(width, requestedColumns = ORB_RACE_LONGFORM_CHECKER_COLUMNS) {
  const columns = Math.max(1, Math.floor(Number(requestedColumns) || ORB_RACE_LONGFORM_CHECKER_COLUMNS));
  return Math.max(1, Math.floor((Number(width) || 0) / columns));
}

export function raceLongformTournamentCheckerGridFor(width, height, requestedColumns = ORB_RACE_LONGFORM_CHECKER_COLUMNS) {
  const safeWidth = Math.max(1, Number(width) || 1);
  const safeHeight = Math.max(1, Number(height) || 1);
  const tileSize = raceLongformTournamentCheckerTileSize(safeWidth, requestedColumns);
  return {
    tileSize,
    columns: Math.ceil(safeWidth / tileSize),
    rows: Math.ceil(safeHeight / tileSize),
    tileWidth: tileSize,
    tileHeight: tileSize,
  };
}

export function raceBlueSunLongformEndpointFor(
  centerX,
  centerY,
  physicalEndX,
  physicalEndY,
  viewportRect,
) {
  const cx = Number(centerX) || 0;
  const cy = Number(centerY) || 0;
  const ex = Number(physicalEndX) || cx;
  const ey = Number(physicalEndY) || cy;
  const rect = viewportRect || {};
  const x = Number(rect.x) || 0;
  const y = Number(rect.y) || 0;
  const width = Math.max(0, Number(rect.width) || 0);
  const height = Math.max(0, Number(rect.height) || 0);
  const dx = ex - cx;
  const dy = ey - cy;
  if ((Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) || width <= 0 || height <= 0) {
    return { x: ex, y: ey };
  }
  const candidates = [];
  if (dx > 1e-6) candidates.push((x + width - cx) / dx);
  if (dx < -1e-6) candidates.push((x - cx) / dx);
  if (dy > 1e-6) candidates.push((y + height - cy) / dy);
  if (dy < -1e-6) candidates.push((y - cy) / dy);
  const distance = candidates
    .filter((candidate) => Number.isFinite(candidate) && candidate > 0)
    .sort((left, right) => left - right)[0];
  return Number.isFinite(distance) && distance > 0
    ? { x: cx + dx * distance, y: cy + dy * distance }
    : { x: ex, y: ey };
}

export function raceBlueSunLongformShouldExtendThroughBarrier(laser) {
  return laser?.hitSurface === "top-wall";
}

// Rays are drawn after the number walls so their glow can sit over the orb,
// but a layer hit must never paint into the solid wall below its contact.
// Return a world-space clip rect for the active layer's top surface; the
// simulation-provided endpoint remains authoritative for physics and impact
// markers.
export function raceSunLaserLayerClipRectFor(rect, laser) {
  if (!laser?.hitLayer || !rect) return null;
  const x = Number(rect.x) || 0;
  const y = Number(rect.y) || 0;
  const width = Math.max(0, Number(rect.width) || 0);
  const height = Math.max(0, Number(rect.height) || 0);
  const layerIndex = Math.max(0, Math.floor(Number(laser.layerIndex) || 0));
  const layerY = y + raceLayerLineY(layerIndex) * height;
  return {
    x,
    y,
    width,
    height: Math.max(0, Math.min(height, layerY - y)),
    layerY,
  };
}

function clipRaceSunLaserToLayer(ctx, rect, laser) {
  const clip = raceSunLaserLayerClipRectFor(rect, laser);
  if (!clip) return null;
  ctx.beginPath();
  ctx.rect(clip.x, clip.y, clip.width, clip.height);
  ctx.clip();
  return clip;
}

// Shared by every Classic orb's damage and healing transaction. Keeping the
// timing in one contract prevents special orb renderers from disappearing
// markers early or leaving them stacked indefinitely.
export const HEALTH_MARKER_TIMING = Object.freeze({
  holdSeconds: 0.5,
  riseSeconds: 0.72,
  lifetimeSeconds: 1,
});

// The generated Virus silhouette intentionally extends beyond the simulation
// radius with its rim protrusions. Keep its shared Cutter/Cobweb/other DOT
// markers above the visible silhouette while preserving the same timing and
// target-following behavior used by every other Classic orb.
export function classicHealthMarkerRadiusFor(fighter) {
  const radius = Math.max(0, Number(fighter?.radius) || 0);
  return fighter?.type === "virus" ? radius * 1.32 : radius;
}

export function classicHealthMarkerOpacity(ageSeconds) {
  const age = Math.max(0, Number(ageSeconds) || 0);
  if (age <= HEALTH_MARKER_TIMING.holdSeconds) return 1;
  if (age >= HEALTH_MARKER_TIMING.lifetimeSeconds) return 0;
  const progress = (age - HEALTH_MARKER_TIMING.holdSeconds)
    / (HEALTH_MARKER_TIMING.lifetimeSeconds - HEALTH_MARKER_TIMING.holdSeconds);
  const smoothFade = progress * progress * (3 - 2 * progress);
  return Math.max(0, 1 - smoothFade);
}

export function classicHealthMarkerRise(ageSeconds) {
  const age = Math.max(0, Number(ageSeconds) || 0);
  const progress = Math.min(1, age / HEALTH_MARKER_TIMING.riseSeconds);
  // Ease-out motion gives every marker a readable launch and a soft settle
  // before its opacity fade completes.
  return 1 - Math.pow(1 - progress, 3);
}

export function classicHealthDeltaLabel(delta) {
  const amount = Number(delta) || 0;
  const absolute = Math.abs(amount);
  const rounded = Math.round(absolute * 10) / 10;
  const value = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${amount >= 0 ? "+" : "-"}${value}`;
}

export class SocialBattleRenderer {
  constructor(canvas, { format = "portrait" } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    Object.keys(RACE_SPRITE_URLS).forEach((id) => { raceSprite(id); });
    this.arenaCanvas = document.createElement("canvas");
    this.arenaCanvas.width = ARENA.width;
    this.arenaCanvas.height = ARENA.height;
    this.arenaRenderer = new ArenaRenderer(this.arenaCanvas, {
      simpleOrbs: true,
      flatOrbs: true,
      orbHealthNumbers: true,
      blankFloor: true,
      simpleWalls: true,
      arenaBorder: false,
      pixelWeapons: true,
      motionTrails: false,
      loadOrbSprites: true,
    });
    this.format = "portrait";
    this.raceLongformCameraY = 0;
    this.raceLongformCameraTargetY = 0;
    this.raceLongformCameraSimTime = -1;
    this.raceLongformCameraSimulation = null;
    this.raceFinishExplosionSimulation = null;
    this.raceFinishExplosionStartTimes = new Map();
    this.classicMarkerSimulation = null;
    this.classicMarkerLastTime = -1;
    this.classicPreviousHealth = new Map();
    this.classicHealthMarkers = [];
    this.classicHealthMarkerEventIds = new Set();
    this.classicContinuousHealthRemainders = new Map();
    this.classicZeusMarkerSequences = new Map();
    this.tournamentLayoutCacheKey = "";
    this.tournamentLayoutCache = null;
    this.setFormat(format);
  }

  setTheme(themeId) {
    this.arenaRenderer.setTheme(themeId);
  }

  setFormat(formatId) {
    const format = SOCIAL_FORMATS[formatId] || SOCIAL_FORMATS.portrait;
    this.format = format.id;
    this.canvas.dataset.format = format.id;
    if (this.canvas.width !== format.width) this.canvas.width = format.width;
    if (this.canvas.height !== format.height) this.canvas.height = format.height;
    this.canvas.style.aspectRatio = `${format.width} / ${format.height}`;
    this.ctx.imageSmoothingEnabled = false;
    if (this.format !== "race-landscape") {
      this.raceLongformCameraY = 0;
      this.raceLongformCameraTargetY = 0;
      this.raceLongformCameraSimTime = -1;
      this.raceLongformCameraSimulation = null;
    }
  }

  draw(sim, presentation = {}) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.canvas.dataset.tournament = sim.gameplayMode === ORB_RACE_MODE && Boolean(
      sim.raceTournament?.enabled
        || presentation.tournamentBracket
        || presentation.raceTournamentState
        || sim.raceTournamentState
        || sim.raceTournamentPresentation,
    );
    const motion = presentation.options || {};
    const classicBlackTheme = sim.gameplayMode === "classic" && motion.classicBlackTheme === true;
    const classicTeamColors = sim.gameplayMode === "classic" && motion.classicTeamColors !== false;
    this.arenaRenderer.setOptions({
      simpleOrbs: true,
      flatOrbs: true,
      orbHealthNumbers: ![WORLD_CUP_MODE, KING_OF_HILL_MODE].includes(sim.gameplayMode),
      blankFloor: true,
      simpleWalls: true,
      arenaBorder: false,
      pixelWeapons: true,
      motionTrails: sim.gameplayMode === "classic" && (sim.fighters || []).some((fighter) => (
        fighter.classicFadingTrailsEnabled || fighter.classicSolidTrailsEnabled
      )),
      damageNumbers: false,
      flashReduction: motion.flashReduction === true,
      classicBlackTheme,
      classicTeamColors,
    });
    if (sim.gameplayMode === ORB_RACE_MODE) {
      ctx.clearRect(0, 0, width, height);
      this.drawOrbRace(ctx, sim, presentation, width, height);
      return;
    }
    this.raceLongformCameraY = 0;
    this.raceLongformCameraTargetY = 0;
    this.raceLongformCameraSimTime = -1;
    this.raceLongformCameraSimulation = null;
    this.arenaRenderer.draw(sim);

    ctx.clearRect(0, 0, width, height);
    this.updateClassicHealthMarkers(sim);
    this.drawBackground(ctx, width, height, sim.gameplayMode, classicBlackTheme);
    const layout = this.layout(width, height, sim);
    const classicShakeDisabled = sim.gameplayMode === "classic";
    const highlightShake = !classicShakeDisabled && motion.screenShake !== false && presentation.highlight
      ? presentation.highlight.strength * Math.min(width, height) * 0.006
      : 0;
    const impact = sim.gameplayMode === "classic" ? null : presentation.impactFrame;
    const impactAge = impact ? Math.max(0, (presentation.now || 0) - impact.startedAt) : 0;
    const impactProgress = impact ? Math.min(1, impactAge / Math.max(1, impact.duration)) : 1;
    const impactShake = motion.screenShake !== false && !motion.reducedMotion && impact
      ? impact.shake * (1 - impactProgress) * Math.min(width, height) * 0.008
      : 0;
    const shakePhase = Math.floor(impactAge / 16);
    const presentationImpact = classicShakeDisabled || motion.reducedMotion
      ? 0
      : presentation.phase === "countdown"
        ? Math.pow(1 - (presentation.phaseProgress || 0), 3) * Math.min(width, height) * 0.008
        : 0;
    this.drawArena(ctx, layout.arena, {
      shakeX: (highlightShake ? Math.sin(sim.time * 97) * highlightShake : 0)
        + (impactShake ? (shakePhase % 2 === 0 ? impactShake : -impactShake) : 0)
        + presentationImpact,
      shakeY: (highlightShake ? Math.cos(sim.time * 83) * highlightShake * 0.65 : 0)
        + (impactShake ? (shakePhase % 3 === 0 ? -impactShake * 0.55 : impactShake * 0.35) : 0)
        - presentationImpact * 0.45,
      overtime: sim.overtimeStarted,
      sim,
      classicBlackTheme,
      classicTeamColors,
    });
    if (sim.finished && sim.gameplayMode !== "classic") this.drawWinnerFieldText(ctx, sim, layout.arena);
    if (sim.gameplayMode === WORLD_CUP_MODE) {
      this.drawWorldCupHud(ctx, sim, layout.names);
      this.drawWorldCupStatusDock(ctx, sim, layout.abilities);
    } else if (sim.gameplayMode === KING_OF_HILL_MODE) {
      this.drawKingOfHillHud(ctx, sim, layout.names);
      this.drawKingOfHillStatusDock(ctx, sim, layout.abilities);
    } else {
      this.drawFighterNames(ctx, sim, layout.names, classicBlackTheme, classicTeamColors);
      this.drawClassicStatDock(ctx, sim, layout.abilities, classicBlackTheme);
    }
    if (presentation.phase === "countdown" && sim.gameplayMode !== "classic") {
      this.drawCountdown(ctx, presentation.countdown, presentation.phaseProgress || 0, width, height, motion);
    }
  }

  drawOrbRace(ctx, sim, presentation, width, height) {
    const tournamentSource = sim.raceTournament
      || presentation.tournamentBracket
      || presentation.raceTournamentState
      || sim.raceTournamentState
      || sim.raceTournamentPresentation?.tournament
      || (presentation.options?.raceTournament ? {
        ...presentation.options.raceTournament,
        enabled: presentation.options.raceTournament.enabled !== false,
      } : null);
    if (tournamentSource?.enabled !== false && (presentation.tournamentBracket || presentation.raceTournamentState || sim.raceTournament || sim.raceTournamentState || sim.raceTournamentPresentation || presentation.options?.raceTournament)) {
      const tournamentFrame = this.tournamentFrameForRender(sim, presentation, tournamentSource);
      if (tournamentFrame?.phase !== "match" || tournamentFrame?.raceVisible === false) {
        ctx.clearRect(0, 0, width, height);
        this.drawOrbRaceTournamentBracket(ctx, sim, presentation, width, height, tournamentSource, tournamentFrame);
        return;
      }
    }
    ctx.fillStyle = "#f7f0e5";
    ctx.fillRect(0, 0, width, height);
    if (this.raceFinishExplosionSimulation !== sim) {
      this.raceFinishExplosionSimulation = sim;
      this.raceFinishExplosionStartTimes = new Map();
    }
    const visualNow = Number.isFinite(Number(presentation.now)) ? Number(presentation.now) : null;
    const rawTeams = raceRenderTeamSlots(sim);
    const teams = rawTeams.slice(0, 2).map((team, teamIndex) => {
      if (!team) return null;
      const memberIds = Array.isArray(team.memberIds) ? team.memberIds : [];
      const membersById = memberIds
        .map((id) => sim.fighters.find((fighter) => fighter.id === id))
        .filter(Boolean);
      const resolvedTeamIndex = Number.isInteger(team.index) ? team.index : teamIndex;
      const members = membersById.length
        ? membersById
        : sim.fighters.filter((fighter) => fighter.raceTeamIndex === resolvedTeamIndex);
      return {
        ...team,
        raceLayerHealth: Array.isArray(team.raceLayerHealth)
          ? team.raceLayerHealth
          : [...(sim.raceLayerStrengths || [])],
        members,
      };
    });
    const motion = presentation.options || {};
    const reactorShake = sim.fighters
      .flatMap((racer) => [
        ...(racer.raceReactorEffects || []),
        ...(racer.raceTsarBombReactorEffects || []),
      ])
      .reduce((strongest, effect) => {
        const age = Math.max(0, Number(effect.age) || 0);
        const strength = age < 0.35
          ? Math.max(0, Number(effect.shake) || 0.35) * (1 - age / 0.35)
          : 0;
        return Math.max(strongest, strength);
      }, 0);
    const shakeAmount = motion.screenShake === false || motion.reducedMotion
      ? 0
      : reactorShake * Math.min(width, height) * 0.004;
    ctx.save();
    ctx.translate(
      shakeAmount ? Math.sin(sim.time * 113) * shakeAmount : 0,
      shakeAmount ? Math.cos(sim.time * 97) * shakeAmount * 0.62 : 0,
    );
    if (this.format === "race-landscape") {
      this.drawRaceLongform(ctx, sim, teams, presentation, width, height, visualNow);
      this.drawRaceTimeBombPulses?.(ctx, sim, teams, width, height);
      ctx.restore();
      if (typeof this.drawRaceHydrogenExplosionFlash === "function") {
        this.drawRaceHydrogenExplosionFlash(ctx, sim, width, height);
      }
      return;
    }
    const layout = orbRaceBoardLayout(width, height);
    layout.boards.forEach((board, index) => {
      const team = teams[index];
      if (!team) return;
      this.drawRaceBoard(ctx, sim, team, board, sim.time, index, visualNow);
    });
    // A healing Twin is a real second physics body on the opponent's lane.
    // Draw it after both boards have painted their layers so the target board
    // cannot cover the visiting orb, and use that board's coordinate system.
    this.drawRaceVisitingTwins?.(ctx, teams, layout.boards, sim.time, visualNow);
    if (teams.length === 2 && teams.every(Boolean)) this.drawRaceMatchup(
      ctx,
      teams,
      width,
      layout.topY + layout.boardHeight + layout.gap * 0.5,
      layout.gap,
    );
    this.drawRaceTimeBombPulses?.(ctx, sim, teams, width, height, layout);
    ctx.restore();
    if (typeof this.drawRaceHydrogenExplosionFlash === "function") {
      this.drawRaceHydrogenExplosionFlash(ctx, sim, width, height);
    }
  }

  drawOrbRaceTournamentBracket(ctx, sim, presentation, width, height, tournamentSource, tournamentFrame = {}) {
    return this.drawTournamentBracketScene(ctx, sim, presentation, width, height, tournamentSource, tournamentFrame);
  }

  tournamentFrameForRender(sim, presentation, tournamentSource) {
    const uiTransition = presentation.tournamentTransition;
    if (uiTransition?.active !== false && uiTransition?.toMatchId) {
      const elapsedMs = Math.max(0, Number(uiTransition.elapsedMs) || 0);
      const introVisual = tournamentMatchupIntroVisualState({ elapsed: elapsedMs / 1000 });
      const targetMatch = this.tournamentMatchForPresentation(tournamentSource, {
        matchId: uiTransition.toMatchId,
      });
      const lastResult = sim.raceTournament?.lastResult || tournamentSource?.lastResult || {};
      return {
        ...uiTransition,
        phase: "next-match-pan",
        phaseProgress: introVisual.totalProgress,
        easedProgress: introVisual.easedCameraProgress,
        zoomProgress: 1,
        matchupHoldProgress: introVisual.holdProgress,
        matchupHolding: introVisual.holding,
        longformTransitionActive: true,
        longformTransitionProgress: introVisual.cameraProgress,
        longformTransitionDuration: introVisual.duration,
        transitionFromMatchId: uiTransition.fromMatchId,
        transitionToMatchId: uiTransition.toMatchId,
        matchId: uiTransition.toMatchId,
        roundIndex: targetMatch?.roundIndex ?? 0,
        matchIndex: targetMatch?.matchIndex ?? 0,
        winnerId: lastResult.advancingEntrantId || lastResult.advancingOrbId || sim.raceTournament?.advancingOrbId || null,
        loserId: lastResult.eliminatedEntrantId || lastResult.eliminatedOrbId || sim.raceTournament?.eliminatedOrbId || null,
        bracketVisible: true,
        matchupVisible: true,
        raceVisible: false,
      };
    }
    if (presentation.tournamentFrame?.phase) {
      const supplied = presentation.tournamentFrame;
      const rawPhase = supplied.phase;
      const suppliedTransition = supplied.cameraTransition || supplied.transition || {};
      const suppliedTimestamps = supplied.timestamps || sim.raceTournament?.presentationTimestamps || {};
      const cameraPanIntro = supplied.introMode === "camera-pan" || suppliedTransition.type === "camera-pan";
      const mappedPhase = rawPhase === "camera-pan"
        ? "next-match-pan"
        : rawPhase === "matchup-hold" ? cameraPanIntro ? "next-match-pan" : "zoom-in"
        : rawPhase === "bracket-zoom" ? "zoom-in"
          : rawPhase === "battle" ? "match"
            : rawPhase;
      if (["zoom-in", "next-match-pan"].includes(mappedPhase)) {
        const simClock = Number(sim.raceTournament?.clock);
        const startAt = mappedPhase === "next-match-pan"
          ? Number(suppliedTransition.startAt ?? suppliedTimestamps.transitionStartAt ?? suppliedTimestamps.introBracketAt)
          : Number(suppliedTimestamps.bracketZoomAt ?? suppliedTimestamps.introBracketAt ?? suppliedTransition.startAt);
        const localPhaseProgress = Math.max(0, Math.min(1, Number(supplied.phaseProgress) || 0));
        const introElapsed = Number.isFinite(simClock) && Number.isFinite(startAt)
          ? Math.max(0, simClock - startAt)
          : rawPhase === "matchup-hold"
            ? TOURNAMENT_PRESENTATION_TIMING.cameraPanSeconds
              + localPhaseProgress * TOURNAMENT_PRESENTATION_TIMING.matchupHoldSeconds
            : localPhaseProgress * TOURNAMENT_PRESENTATION_TIMING.cameraPanSeconds;
        const introVisual = tournamentMatchupIntroVisualState({ elapsed: introElapsed });
        return {
          ...supplied,
          phase: mappedPhase,
          phaseProgress: introVisual.totalProgress,
          zoomProgress: mappedPhase === "zoom-in" ? introVisual.cameraProgress : 1,
          matchupHoldProgress: introVisual.holdProgress,
          matchupHolding: introVisual.holding,
          longformTransitionActive: mappedPhase === "next-match-pan",
          longformTransitionProgress: mappedPhase === "next-match-pan" ? introVisual.cameraProgress : 0,
          longformTransitionDuration: mappedPhase === "next-match-pan" ? introVisual.duration : null,
          bracketVisible: true,
          matchupVisible: true,
          raceVisible: false,
        };
      }
      return { ...supplied, phase: mappedPhase };
    }
    const gameplayPresentation = sim.raceTournament?.presentation || sim.raceTournamentPresentation;
    if (gameplayPresentation?.phase) {
      const rawPhase = gameplayPresentation.phase;
      const phaseMap = {
        "intro-bracket": "bracket",
        "bracket-zoom": "zoom-in",
        battle: "match",
        result: "loser-fade",
        conclusion: "winner-advance",
        advancement: "winner-advance",
        "next-match": "bracket",
        "camera-pan": "next-match-pan",
        "matchup-hold": "zoom-in",
        "champion-conclusion": "champion",
      };
      const timestamps = gameplayPresentation.timestamps || sim.raceTournament?.presentationTimestamps || {};
      const now = Number(sim.raceTournament?.clock);
      const timestampStart = Number(timestamps.introBracketAt);
      const safeNow = Number.isFinite(now) ? now : Number(sim.time) || 0;
      const safeStart = Number.isFinite(timestampStart) ? timestampStart : 0;
      const conclusionStart = Number(timestamps.conclusionAt ?? timestamps.resultAt);
      const conclusionDuration = Number(timestamps.conclusionDuration) || 1.75;
      const safeConclusionStart = Number.isFinite(conclusionStart)
        ? conclusionStart
        : Number(timestamps.advancementAt);
      const transition = gameplayPresentation.cameraTransition
        || gameplayPresentation.transition
        || timestamps.cameraTransition
        || null;
      const battleAt = Number(timestamps.battleAt ?? gameplayPresentation.battleAt);
      const waitingForBattle = rawPhase === "battle" && Number.isFinite(battleAt) && safeNow < battleAt;
      const cameraPanIntro = gameplayPresentation.introMode === "camera-pan" || transition?.type === "camera-pan";
      const isCameraPan = rawPhase === "camera-pan"
        || (rawPhase === "matchup-hold" && cameraPanIntro)
        || (waitingForBattle && cameraPanIntro);
      const longformPanDuration = tournamentLongformPanDuration({
        zoomDuration: transition?.duration
          || timestamps.cameraPanDuration
          || timestamps.zoomDuration
          || TOURNAMENT_PRESENTATION_TIMING.zoomInSeconds,
      });
      const phase = isCameraPan
        ? "next-match-pan"
        : rawPhase === "matchup-hold" || waitingForBattle ? "zoom-in" : (phaseMap[rawPhase] || rawPhase);
      const phaseStart = phase === "bracket"
        ? Number(timestamps.introBracketAt)
        : phase === "zoom-in" ? Number(timestamps.bracketZoomAt)
          : phase === "match" ? Number(timestamps.battleAt)
            : phase === "loser-fade" ? Number.isFinite(Number(timestamps.resultAt))
              ? Number(timestamps.resultAt)
              : safeConclusionStart
              : phase === "winner-advance" ? safeConclusionStart
                : phase === "next-match-pan"
                  ? Number(transition?.startAt ?? timestamps.transitionStartAt ?? timestamps.introBracketAt)
                : Number(timestamps.championConclusionAt);
      const duration = phase === "bracket"
        ? Number(timestamps.bracketIntroDuration) || 1.2
        : phase === "zoom-in"
          ? Number(timestamps.zoomDuration) || TOURNAMENT_PRESENTATION_TIMING.zoomInSeconds
          : phase === "loser-fade"
            ? conclusionDuration
            : phase === "winner-advance"
              ? conclusionDuration
              : phase === "next-match-pan"
                ? longformPanDuration
              : phase === "champion" ? 2 : 1;
      const rawProgress = Number.isFinite(phaseStart)
        ? Math.max(0, Math.min(1, (safeNow - phaseStart) / Math.max(0.001, duration)))
        : 0;
      const introElapsed = Number.isFinite(phaseStart) ? Math.max(0, safeNow - phaseStart) : 0;
      const introVisual = tournamentMatchupIntroVisualState({ elapsed: introElapsed });
      const progress = ["zoom-in", "next-match-pan"].includes(phase)
        ? introVisual.totalProgress
        : rawProgress;
      const conclusionState = gameplayPresentation.conclusion || {};
      const conclusionProgress = ["loser-fade", "winner-advance"].includes(phase)
        ? Number.isFinite(Number(conclusionState.progress))
          ? Math.max(0, Math.min(1, Number(conclusionState.progress)))
          : rawPhase === "result"
            ? Math.min(1, progress)
            : Math.min(1, progress)
        : 0;
      const conclusionVisual = tournamentConclusionVisualState(conclusionProgress);
      const activeMatch = this.tournamentMatchForPresentation(tournamentSource, gameplayPresentation);
      return {
        ...gameplayPresentation,
        phase,
        phaseProgress: progress,
        easedProgress: progress,
        bracketProgress: phase === "bracket" ? progress : 1,
        zoomProgress: phase === "bracket" ? 0 : phase === "zoom-in" ? introVisual.cameraProgress : 1,
        matchupHoldProgress: ["zoom-in", "next-match-pan"].includes(phase) ? introVisual.holdProgress : phase === "match" ? 1 : 0,
        matchupHolding: ["zoom-in", "next-match-pan"].includes(phase) && introVisual.holding,
        loserProgress: phase === "next-match-pan"
          ? 1
          : ["loser-fade", "winner-advance"].includes(phase)
            ? conclusionVisual.loserProgress
            : ["champion", "complete"].includes(phase) ? 1 : 0,
        winnerProgress: phase === "winner-advance" ? conclusionVisual.winnerFadeInProgress : ["champion", "complete", "next-match-pan"].includes(phase) ? 1 : 0,
        conclusionProgress,
        dustOutProgress: phase === "next-match-pan"
          ? 1
          : Number.isFinite(Number(conclusionState.dustOutProgress))
          ? Number(conclusionState.dustOutProgress)
          : conclusionVisual.dustOutProgress,
        winnerFadeInProgress: phase === "next-match-pan"
          ? 1
          : Number.isFinite(Number(conclusionState.winnerFadeInProgress))
          ? Number(conclusionState.winnerFadeInProgress)
          : conclusionVisual.winnerFadeInProgress,
        championProgress: phase === "champion" ? progress : phase === "complete" ? 1 : 0,
        raceVisible: phase === "match",
        bracketVisible: true,
        matchupVisible: phase !== "bracket",
        longformTransitionActive: phase === "next-match-pan",
        longformTransitionProgress: phase === "next-match-pan" ? introVisual.cameraProgress : 0,
        longformTransitionDuration: phase === "next-match-pan" ? longformPanDuration : null,
        transitionFromMatchId: transition?.fromMatchId || timestamps.transitionFromMatchId || null,
        transitionToMatchId: transition?.toMatchId || timestamps.transitionToMatchId || activeMatch?.id || null,
        roundIndex: activeMatch?.roundIndex ?? sim.raceTournament?.currentRoundIndex ?? 0,
        matchIndex: activeMatch?.matchIndex ?? 0,
        matchId: gameplayPresentation.matchId || activeMatch?.id || null,
        winnerId: sim.raceTournament?.advancingOrbId || sim.raceTournament?.lastResult?.advancingEntrantId || null,
        loserId: sim.raceTournament?.eliminatedOrbId || sim.raceTournament?.lastResult?.eliminatedOrbId || null,
        championId: sim.raceTournament?.championId || sim.raceTournament?.championOrbId || null,
        _timestampStart: safeStart,
      };
    }
    return tournamentPresentationAtTime({
      tournament: tournamentSource,
      elapsed: presentation.tournamentElapsed ?? presentation.tournamentTime ?? sim.time ?? 0,
      matchDuration: presentation.tournamentMatchDuration ?? 8,
      reducedMotion: presentation.options?.reducedMotion === true,
      roundIndex: presentation.tournamentRoundIndex,
      matchIndex: presentation.tournamentMatchIndex,
      winnerId: presentation.tournamentWinnerId,
      loserId: presentation.tournamentLoserId,
      championId: presentation.tournamentChampionId,
      completed: presentation.tournamentCompleted === true,
    });
  }

  drawTournamentBracketScene(ctx, sim, presentation, width, height, tournamentSource, tournamentFrame = {}) {
    const entrantValues = tournamentSource?.entrants
      || tournamentSource?.entrantIds
      || tournamentSource?.selectedEntrantIds
      || tournamentSource?.seedOrder
      || [];
    const sourceTournament = tournamentSource?.tournament || tournamentSource?.bracket
      ? tournamentSource
      : {
        ...tournamentSource,
        entrants: entrantValues.map((entrant) => (
          typeof entrant === "string"
            ? { id: entrant, orbId: entrant, type: entrant, name: entrant }
            : entrant
        )),
      };
    const frame = tournamentFrame?.phase
      ? tournamentFrame
      : tournamentPresentationAtTime({
        tournament: sourceTournament,
        elapsed: presentation.tournamentElapsed ?? 0,
        matchDuration: presentation.tournamentMatchDuration ?? sim.time,
        reducedMotion: presentation.options?.reducedMotion === true,
      });
    const committedMatchId = frame.phase === "next-match-pan"
      ? frame.transitionFromMatchId || frame.cameraTransition?.fromMatchId || frame.transition?.fromMatchId
      : frame.matchId;
    const tournament = tournamentWithCommittedResult(sourceTournament, {
      matchId: committedMatchId,
      winnerId: frame.winnerId
        || sourceTournament.advancingOrbId
        || sourceTournament.lastResult?.advancingEntrantId
        || sourceTournament.lastResult?.advancingOrbId,
    });
    const layoutKey = this.tournamentLayoutCacheKeyFor(tournament, width, height);
    const layout = layoutKey === this.tournamentLayoutCacheKey && this.tournamentLayoutCache
      ? this.tournamentLayoutCache
      : tournamentBracketLayout({
        width,
        height,
        size: tournament.size,
        tournament,
        padding: Math.max(10, Math.min(width, height) * 0.018),
      });
    if (layout !== this.tournamentLayoutCache) {
      this.tournamentLayoutCacheKey = layoutKey;
      this.tournamentLayoutCache = layout;
    }
    const activeMatch = this.tournamentMatchForPresentation(tournament, frame);
    const activeRoundIndex = Number.isInteger(Number(frame.roundIndex))
      ? Number(frame.roundIndex)
      : activeMatch?.roundIndex ?? 0;
    const activeMatchIndex = Number.isInteger(Number(frame.matchIndex))
      ? Number(frame.matchIndex)
      : activeMatch?.matchIndex ?? 0;
    const zoom = tournamentMatchupZoomRect(layout, {
      roundIndex: activeRoundIndex,
      matchIndex: activeMatchIndex,
      padding: tournamentMatchupZoomPadding({
        nodeSize: layout.nodeSize,
        portrait: height >= width,
      }),
    });
    const zoomProgress = frame.phase === "zoom-in" || frame.phase === "match" || frame.phase === "loser-fade" || frame.phase === "winner-advance"
      ? Math.max(0, Math.min(1, frame.zoomProgress ?? 1))
      : frame.phase === "champion" || frame.phase === "complete" ? 1 : 0;
    const portraitTournament = height >= width;
    const targetScale = tournamentMatchupZoomTargetScale({
      width,
      height,
      zoomRect: zoom,
      portrait: portraitTournament,
    });
    const transitionFromMatchId = frame.transitionFromMatchId
      || frame.cameraTransition?.fromMatchId
      || frame.transition?.fromMatchId
      || null;
    const transitionFromMatch = transitionFromMatchId
      ? this.tournamentMatchForPresentation(tournament, { matchId: transitionFromMatchId })
      : null;
    const transitionFromZoom = transitionFromMatch
      ? tournamentMatchupZoomRect(layout, {
        roundIndex: transitionFromMatch.roundIndex,
        matchIndex: transitionFromMatch.matchIndex,
        padding: tournamentMatchupZoomPadding({
          nodeSize: layout.nodeSize,
          portrait: portraitTournament,
        }),
      })
      : null;
    const transitionStartScale = transitionFromZoom
      ? tournamentMatchupZoomTargetScale({
        width,
        height,
        zoomRect: transitionFromZoom,
        portrait: portraitTournament,
      })
      : targetScale;
    const camera = frame.phase === "next-match-pan" && transitionFromZoom
      ? tournamentCameraTransitionTransform({
        fromZoomRect: transitionFromZoom,
        toZoomRect: zoom,
        width,
        height,
        progress: frame.longformTransitionProgress ?? frame.phaseProgress ?? 0,
        // Travel between two focused matchups without ever backing out to a
        // wider bracket view. A tighter destination may zoom in further, but
        // the one-second handoff is never allowed to zoom out.
        startScale: transitionStartScale,
        endScale: Math.max(transitionStartScale, targetScale),
      })
      : tournamentCameraTransform({
        layout,
        zoomRect: zoom,
        width,
        height,
        progress: zoomProgress,
        targetScale,
      });

    ctx.save();
    ctx.fillStyle = "#f7f0e5";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFittedFont(ctx, "ORB RACE TOURNAMENT", width * 0.86, 900, Math.max(22, width * 0.045), 14, RACE_NUMBER_FONT);
    ctx.fillText("ORB RACE TOURNAMENT", width * 0.5, Math.max(26, layout.margins.top * 0.34));
    const roundLabel = activeMatch?.roundLabel || tournamentRoundLabel(layout.size, activeRoundIndex);
    ctx.fillStyle = "#5b5148";
    setFittedFont(ctx, roundLabel, width * 0.7, 900, Math.max(12, width * 0.022), 9, PIXEL_FONT);
    ctx.fillText(roundLabel, width * 0.5, Math.max(42, layout.margins.top * 0.7));
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.clip();
    ctx.translate(camera.panX, camera.panY);
    ctx.scale(camera.scale, camera.scale);

    const stateById = this.tournamentEntryVisualState(tournament, frame);
    ctx.lineJoin = "miter";
    for (const connection of layout.connections) {
      const isActive = this.tournamentConnectionIsActive(connection, activeMatch, frame);
      ctx.save();
      const connectorColors = layout.connectorColors || TOURNAMENT_CONNECTOR_COLORS;
      ctx.strokeStyle = isActive ? connectorColors.active : connectorColors.neutral;
      ctx.globalAlpha = isActive ? 0.92 : 0.68;
      const logicalWidth = isActive
        ? layout.activeConnectorWidth || Math.max(1.1, layout.nodeSize * 0.08)
        : layout.connectorWidth || Math.max(0.8, layout.nodeSize * 0.05);
      // The bracket is rendered inside a scaled camera. Keep connector
      // weight stable in the exported pixels so a 64-entry focused crop has
      // the same quiet hairline quality as the full overview.
      ctx.lineWidth = layout.connectorStrokeSpace === "screen"
        ? logicalWidth / Math.max(1, Number(camera.scale) || 1)
        : logicalWidth;
      ctx.beginPath();
      connection.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    const conclusionActive = ["loser-fade", "winner-advance"].includes(frame.phase) && activeMatch;
    const conclusionProgress = conclusionActive
      ? Math.max(0, Math.min(1, Number(frame.conclusionProgress ?? (
        frame.phase === "loser-fade"
          ? Number(frame.phaseProgress || 0) * 0.5
          : 0.5 + Number(frame.phaseProgress || 0) * 0.5
      ))))
      : 0;
    const conclusionVisual = tournamentConclusionVisualState(conclusionProgress);
    const dustOutProgress = Math.max(0, Math.min(1, Number(frame.dustOutProgress ?? conclusionVisual.dustOutProgress)));
    const winnerFadeInProgress = Math.max(0, Math.min(1, Number(frame.winnerFadeInProgress ?? conclusionVisual.winnerFadeInProgress)));
    const advancingTarget = conclusionActive
      ? this.tournamentTargetNode(layout, tournament, activeMatch)
      : null;
    const conclusionDestinationId = frame.conclusion?.destinationNodeId
      || frame.timestamps?.destinationNodeId
      || activeMatch?.targetMatchId
      || activeMatch?.targetNodeId
      || null;
    for (const node of layout.nodes) {
      const isActive = activeMatch && (
        node.sourceMatchId === activeMatch.id
        || node.id === activeMatch.id
        || node.id === `match-r${activeRoundIndex}-m${activeMatchIndex}`
        || (activeMatch.sourceNodeIds || []).includes(node.sourceNodeId)
      );
      const highlighted = this.tournamentEntryIsHighlighted(node, activeMatch, frame);
      const highlightColor = this.tournamentWinnerHighlightColor(node.entrant, tournament, frame);
      const visual = stateById.get(node.entrantId) || { opacity: 1, grayscale: 0 };
      const destinationPlaceholder = Boolean(conclusionActive && (
        advancingTarget?.id === node.id
        || node.sourceMatchId === conclusionDestinationId
        || node.id === conclusionDestinationId
        || node.sourceMatchId === activeMatch?.targetMatchId
        || node.id === activeMatch?.targetNodeId
      ));
      this.drawTournamentCard(ctx, node, layout, sim.time, {
        ...visual,
        active: Boolean(isActive),
        highlighted,
        highlightColor,
        forceUnknown: destinationPlaceholder,
        contentOpacity: destinationPlaceholder ? 1 - dustOutProgress : 1,
      });
    }

    if (conclusionActive) {
      const winnerId = frame.winnerId || tournament.advancingOrbId || tournament.lastResult?.advancingOrbId;
      const winnerNode = this.tournamentWinnerNode(layout, tournament, activeMatch, winnerId);
      const targetNode = this.tournamentTargetNode(layout, tournament, activeMatch);
      if (targetNode) {
        const dust = tournamentAdvancementDust(targetNode.id, 18);
        ctx.save();
        ctx.globalAlpha = (1 - dustOutProgress) * 0.9;
        ctx.fillStyle = "#7d7268";
        for (const particle of dust) {
          const px = targetNode.rect.x + particle.x * targetNode.rect.width
            + particle.driftX * targetNode.rect.width * conclusionProgress;
          const py = targetNode.rect.y + particle.y * targetNode.rect.height
            + particle.driftY * targetNode.rect.height * conclusionProgress;
          const size = Math.max(1, particle.size * Math.min(targetNode.rect.width, targetNode.rect.height));
          ctx.fillRect(px, py, size, size);
        }
        ctx.restore();
        // The winner is revealed directly inside the destination card. There
        // is intentionally no travel sprite: the camera is already centered
        // on this matchup and the result reads as a clean card transition.
        const winnerEntrant = winnerNode?.entrant || this.tournamentEntrantForId(tournament, winnerId);
        if (winnerEntrant && winnerFadeInProgress > 0) {
          this.drawTournamentCard(ctx, targetNode, layout, sim.time, {
            entrant: winnerEntrant,
            highlighted: true,
            highlightColor: this.tournamentWinnerHighlightColor(winnerEntrant, tournament, frame),
            contentOpacity: winnerFadeInProgress,
          });
        }
      }
    }

    if (frame.phase === "champion" || frame.phase === "complete") {
      const championId = frame.championId || tournament.championId || tournament.championOrbId;
      const championEntrant = this.tournamentEntrantForId(tournament, championId);
      if (championEntrant) {
        const champion = tournamentChampionPosition(layout);
        ctx.save();
        ctx.shadowColor = "#f4c430";
        ctx.shadowBlur = Math.max(8, layout.nodeSize * 1.8);
        this.drawTournamentCard(ctx, layout.centerFinal || {
          x: champion.x,
          y: champion.y,
          cardWidth: layout.finalCardWidth,
          cardHeight: layout.finalCardHeight,
          rect: {
            x: champion.x - layout.finalCardWidth / 2,
            y: champion.y - layout.finalCardHeight / 2,
            width: layout.finalCardWidth,
            height: layout.finalCardHeight,
          },
          label: "CHAMPION",
        }, layout, sim.time, {
          entrant: championEntrant,
          highlighted: true,
          highlightColor: this.tournamentWinnerHighlightColor(championEntrant, tournament, frame) || "#f4c430",
        });
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "#111111";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        setFittedFont(ctx, "CHAMPION", width * 0.32, 900, Math.max(14, layout.labelFontSize * 1.3), 10, RACE_NUMBER_FONT);
        ctx.fillText("CHAMPION", champion.x, champion.y + layout.finalCardHeight * 0.95);
        ctx.restore();
      }
    }
    ctx.restore();

  }

  tournamentLayoutCacheKeyFor(tournament, width, height) {
    const rounds = (tournament?.rounds || tournament?.bracket?.rounds || []).map((round) => (
      (round?.matches || []).map((match) => ({
        id: match?.id || null,
        sourceNodeIds: match?.sourceNodeIds || [],
        sourceMatchIds: match?.sourceMatchIds || [],
        winnerEntrantId: match?.winnerEntrantId || match?.resolvedEntrantId || match?.entrantId || match?.winnerId || null,
        outputNodeId: match?.outputNode?.id || null,
      }))
    ));
    const entrants = (tournament?.entrants || tournament?.entrantIds || tournament?.selectedEntrantIds || tournament?.seedOrder || []).map((entrant) => (
      typeof entrant === "string"
        ? entrant
        : [entrant?.id, entrant?.orbId, entrant?.raceOrbId, entrant?.type, entrant?.slot, entrant?.seedSlot]
    ));
    return JSON.stringify({ width, height, size: tournament?.size, entrants, seedSlots: tournament?.seedSlots || [], rounds });
  }

  drawTournamentCard(ctx, node, layout, time, visual = {}) {
    const rect = node.cardRect || node.rect;
    if (!rect) return;
    const width = Number(rect.width) || layout.cardWidth || 40;
    const height = Number(rect.height) || layout.cardHeight || 20;
    const radius = Math.max(3, Math.min(10, height * 0.22));
    const entrant = visual.forceUnknown ? null : visual.entrant || node.entrant || null;
    const opacity = Math.max(0, Math.min(1, Number(visual.opacity ?? 1)));
    const contentOpacity = Math.max(0, Math.min(1, Number(visual.contentOpacity ?? 1)));
    ctx.save();
    ctx.globalAlpha = opacity;
    if (visual.grayscale > 0) ctx.filter = `grayscale(${Math.round(Math.max(0, Math.min(1, visual.grayscale)) * 100)}%)`;
    ctx.fillStyle = visual.active ? "#fff4c9" : "#fffdf8";
    ctx.strokeStyle = visual.highlighted && visual.highlightColor
      ? visual.highlightColor
      : "#111111";
    ctx.lineWidth = Math.max(1.2, Math.min(3.2, height * (visual.highlighted ? 0.11 : 0.075)));
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(rect.x, rect.y, width, height, radius);
    else ctx.rect(rect.x, rect.y, width, height);
    ctx.fill();
    ctx.stroke();
    // Portrait brackets can contain six rounds in only 1080 logical pixels.
    // Clip every icon/name to its own rounded card so even unusually long
    // custom labels can never bleed into a connector or neighboring card.
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(rect.x + 1, rect.y + 1, Math.max(1, width - 2), Math.max(1, height - 2), Math.max(2, radius - 1));
    else ctx.rect(rect.x + 1, rect.y + 1, Math.max(1, width - 2), Math.max(1, height - 2));
    ctx.clip();
    ctx.globalAlpha *= contentOpacity;
    if (entrant) {
      const iconRadius = Math.max(3.2, Math.min(height * 0.31, width * 0.105));
      const iconX = rect.x + Math.max(height * 0.46, iconRadius + 3);
      this.drawTournamentOrbMark(ctx, iconX, node.y, iconRadius, entrant, time);
      const def = ORB_RACERS[entrant?.orbId || entrant?.raceOrbId || entrant?.type];
      const label = String(def?.name || node.label || entrant?.name || entrant?.type || "???").toUpperCase();
      const labelX = iconX + iconRadius + Math.max(3, height * 0.16);
      const maxWidth = Math.max(10, rect.x + width - labelX - Math.max(3, height * 0.2));
      ctx.fillStyle = "#111111";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      setFittedFont(
        ctx,
        label,
        Math.min(maxWidth, Number(node.textFit?.labelMaxWidth) || maxWidth),
        900,
        node.labelFontSize || layout.labelFontSize,
        Number(node.textFit?.minFontSize)
          || (layout.portrait ? Math.max(3.5, height * 0.12) : Math.max(5, height * 0.2)),
        PIXEL_FONT,
      );
      let fittedLabel = label;
      while (fittedLabel.length > 3 && ctx.measureText(fittedLabel).width > maxWidth) {
        fittedLabel = `${fittedLabel.slice(0, -2).trimEnd()}…`;
      }
      ctx.fillText(fittedLabel, labelX, node.y);
    } else {
      ctx.fillStyle = "#4b443d";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      setFittedFont(ctx, "???", width * 0.72, 900, Math.max(8, height * 0.45), 6, PIXEL_FONT);
      ctx.fillText("???", node.x, node.y);
    }
    ctx.restore();
  }

  drawTournamentOrbEntry(ctx, node, layout, time, visual = {}) {
    this.drawTournamentCard(ctx, node, layout, time, visual);
  }

  drawTournamentOrbMark(ctx, x, y, radius, entrant, time = 0) {
    const id = entrant?.orbId || entrant?.raceOrbId || entrant?.type;
    const def = ORB_RACERS[id];
    if (def) {
      this.drawRaceOrbUnit(ctx, def, x, y, radius, { raceOrbId: id }, time);
      return;
    }
    ctx.save();
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.arc(x, y, radius + 1.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = entrant?.color || "#9b8f83";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  tournamentMatchForPresentation(tournament, frame = {}) {
    const requestedId = frame.matchId || tournament.activeMatchId || tournament.currentMatchId;
    for (const round of tournament.rounds || tournament.bracket?.rounds || []) {
      const match = (round.matches || []).find((candidate) => candidate.id === requestedId);
      if (match) return match;
    }
    const roundIndex = Number(frame.roundIndex ?? tournament.currentRoundIndex ?? tournament.currentRound ?? 0);
    const matchIndex = Number(frame.matchIndex ?? tournament.currentMatch ?? 0);
    return tournament.rounds?.[roundIndex]?.matches?.[matchIndex]
      || tournament.bracket?.rounds?.[roundIndex]?.matches?.[matchIndex]
      || (tournament.currentMatch && (!requestedId || tournament.currentMatch.id === requestedId)
        ? tournament.currentMatch
        : null);
  }

  tournamentEntrantForId(tournament, id) {
    if (!id) return null;
    return (tournament.entrants || []).find((entrant) => entrant.id === id || entrant.orbId === id || entrant.type === id) || null;
  }

  tournamentEntryVisualState(tournament, frame = {}) {
    const result = new Map();
    const loserId = frame.loserId || tournament.eliminatedOrbId || tournament.lastResult?.eliminatedOrbId;
    if (loserId && (frame.phase === "loser-fade" || frame.phase === "winner-advance" || frame.phase === "next-match-pan" || frame.phase === "champion")) {
      const visual = tournamentLoserVisualState(frame.loserProgress ?? frame.phaseProgress ?? 1);
      for (const entrant of tournament.entrants || []) {
        if (entrant.id === loserId || entrant.orbId === loserId || entrant.type === loserId) result.set(entrant.id, visual);
      }
    }
    return result;
  }

  tournamentEntryIsHighlighted(node, activeMatch, frame = {}) {
    if (!activeMatch) return false;
    const resultPhase = ["loser-fade", "winner-advance", "next-match-pan", "champion", "complete"].includes(frame.phase);
    const winnerId = frame.winnerId || frame.championId;
    if (resultPhase && winnerId) {
      const currentSource = frame.phase === "next-match-pan" && activeMatch
        ? (activeMatch.sourceNodeIds || []).includes(node.sourceNodeId)
          || activeMatch.left?.entrantId === node.entrantId
          || activeMatch.right?.entrantId === node.entrantId
        : false;
      return currentSource
        || node.entrantId === winnerId
        || node.entrant?.orbId === winnerId
        || node.entrant?.type === winnerId;
    }
    const sourceIds = activeMatch.sourceNodeIds || [];
    return sourceIds.includes(node.sourceNodeId) || activeMatch.left?.entrantId === node.entrantId || activeMatch.right?.entrantId === node.entrantId || (
      frame.phase === "champion" && frame.championId === node.entrantId
    );
  }

  tournamentWinnerHighlightColor(entrant, tournament, frame = {}) {
    if (!entrant) return null;
    const resultPhase = ["loser-fade", "winner-advance", "next-match-pan", "champion", "complete"].includes(frame.phase);
    if (!resultPhase) return null;
    const winnerId = frame.winnerId
      || frame.championId
      || tournament.lastResult?.advancingOrbId
      || tournament.championId
      || tournament.championOrbId;
    if (!winnerId) return null;
    const matchesWinner = entrant.id === winnerId || entrant.orbId === winnerId || entrant.type === winnerId;
    if (!matchesWinner) return null;
    return ORB_RACERS[entrant.orbId || entrant.type]?.color || entrant.color || "#f4c430";
  }

  tournamentConnectionIsActive(connection, activeMatch, frame = {}) {
    if (!activeMatch) return false;
    const sourceIds = activeMatch.sourceNodeIds || [];
    const sourceMatchIds = activeMatch.sourceMatchIds || [];
    const connectionNodeMatches = (id) => {
      if (sourceIds.includes(id) || sourceMatchIds.includes(id)) return true;
      const node = this.tournamentLayoutCache?.nodes?.find((candidate) => (
        candidate.id === id || candidate.sourceNodeId === id || candidate.sourceMatchId === id
      ));
      return Boolean(node && (sourceIds.includes(node.sourceNodeId) || sourceMatchIds.includes(node.sourceMatchId)));
    };
    return connectionNodeMatches(connection.from) || connectionNodeMatches(connection.to)
      || sourceMatchIds.includes(connection.from) || sourceMatchIds.includes(connection.to)
      || connection.to === activeMatch.id || connection.from === activeMatch.id
      || frame.phase === "champion";
  }

  tournamentWinnerNode(layout, tournament, activeMatch, winnerId) {
    const winner = this.tournamentEntrantForId(tournament, winnerId);
    if (!winner) return null;
    const sourceNodeId = (activeMatch.sourceNodeIds || []).find((nodeId) => {
      const entry = layout.nodes.find((node) => node.id === nodeId || node.sourceNodeId === nodeId);
      return entry?.entrantId === winner.id;
    });
    return sourceNodeId
      ? layout.nodes.find((node) => node.id === sourceNodeId || node.sourceNodeId === sourceNodeId)
      : null;
  }

  tournamentTargetNode(layout, tournament, activeMatch) {
    const targetId = activeMatch.targetMatchId || activeMatch.targetNodeId;
    return layout.matchNodesBySourceId?.get(targetId)
      || layout.nodes.find((node) => node.id === targetId)
      || null;
  }

  drawRaceHydrogenExplosionFlash(ctx, sim, width, height) {
    const activeFlash = sim.raceHydrogenBombExploded
      ? Number(sim.raceHydrogenBombExplosionElapsed) || 0
      : sim.raceTsarBombExploded
        ? Number(sim.raceTsarBombExplosionElapsed) || 0
        : (sim.fighters || []).find((racer) => racer.raceAllInOneHydrogenExploded)
          ?.raceAllInOneHydrogenExplosionElapsed;
    if (!Number.isFinite(Number(activeFlash)) || Number(activeFlash) >= RACE_HYDROGEN_BOMB_FLASH_SECONDS) return;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  drawRaceTimeBombPulses(ctx, sim, teams, width, height, portraitLayout = null) {
    const activeBombs = (sim.fighters || []).filter((racer) => (
      racer.raceOrbId === "time-bomb"
      && racer.raceTimeBombPulseActive === true
    ));
    if (!activeBombs.length) return;
    const positions = new Map();
    if (this.format === "race-landscape") {
      const layout = orbRaceLongformLayout(width, height);
      const cameraY = Number(this.raceLongformCameraY) || 0;
      layout.tracks.forEach((track, index) => {
        const team = teams[index];
        const racer = team?.members?.find((member) => member.raceOrbId === "time-bomb");
        if (!racer) return;
        const layerCount = Math.max(1, team.raceLayerHealth?.length || sim.raceLayerCount || 3);
        const metrics = this.longformWorldMetrics(track, layout, layerCount);
        const worldYForSimY = (member, value) => this.longformWorldYForSimY(member, value, metrics);
        const transformed = this.transformLongformRacer(racer, worldYForSimY, metrics.totalWorldHeight);
        const worldRect = {
          x: track.x,
          y: track.y + layout.headerHeight - cameraY,
          width: track.width,
          height: metrics.totalWorldHeight,
        };
        positions.set(racer.id, {
          x: worldRect.x + worldRect.width * (Number(transformed.raceX) || 0.5),
          y: worldRect.y + worldRect.height * (Number(transformed.raceY) || 0.2),
        });
      });
    } else {
      const layout = portraitLayout || orbRaceBoardLayout(width, height);
      activeBombs.forEach((racer) => {
        const teamIndex = Number.isInteger(racer.raceTeamIndex) ? racer.raceTeamIndex : 0;
        const board = layout.boards?.[teamIndex];
        if (!board) return;
        positions.set(racer.id, {
          x: board.x + board.width * (Number(racer.raceX) || 0.5),
          y: board.y + board.height * (Number(racer.raceY) || 0.2),
        });
      });
    }
    for (const racer of activeBombs) {
      const position = positions.get(racer.id);
      if (!position) continue;
      const elapsed = Math.max(0, Number(racer.raceTimeBombPulseElapsed) || 0);
      const progress = Math.max(0, Math.min(1, elapsed / Math.max(0.01, RACE_TIME_BOMB_PULSE_SECONDS)));
      const expansion = Math.max(0, Math.min(1, elapsed / RACE_TIME_BOMB_PULSE_EXPANSION_SECONDS));
      const radius = Math.hypot(width, height) * 0.98 * expansion;
      const alpha = Math.max(0, 1 - progress);
      ctx.save();
      // This pass is deliberately outside each track/board clip. The pulse
      // is a screen-wide time-stop wave, so boxes and number walls cannot
      // truncate it as it reaches the opposing orbs.
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255, 207, 90, 0.055)";
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffe08a";
      ctx.lineWidth = Math.max(3, Math.min(width, height) * 0.0045) * (1 - progress * 0.35);
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawRaceLongform(ctx, sim, teams, presentation, width, height, visualNow = null) {
    const layout = orbRaceLongformLayout(width, height);
    const layerCount = Math.max(
      1,
      ...teams.map((team) => team?.raceLayerHealth?.length || sim.raceLayerCount || 3),
    );
    const sharedMetrics = this.longformWorldMetrics(layout.tracks[0], layout, layerCount);
    const leaderIndex = this.longformLeaderIndex(
      teams,
      Number.isInteger(sim.winningRaceTeamIndex)
        ? sim.winningRaceTeamIndex
        : Number.isInteger(sim.winner?.raceTeamIndex) ? sim.winner.raceTeamIndex : null,
    );
    const cameraMax = Math.max(0, sharedMetrics.totalWorldHeight - sharedMetrics.viewportHeight);
    const desiredTarget = this.longformCameraTargetForTeam(teams[leaderIndex], sharedMetrics);
    const isReplay = this.raceLongformCameraSimulation !== sim
      || this.raceLongformCameraSimTime < 0
      || sim.time < this.raceLongformCameraSimTime;
    if (isReplay || !Number.isFinite(this.raceLongformCameraY)) {
      this.raceLongformCameraY = 0;
      this.raceLongformCameraTargetY = 0;
    }
    // Camera intent is derived only from the leader's completed layer count.
    // raceY, trails, bounces, impacts, and trailing-track state cannot move it.
    this.raceLongformCameraTargetY = Math.max(
      this.raceLongformCameraTargetY,
      desiredTarget,
    );
    this.raceLongformCameraY += (
      this.raceLongformCameraTargetY - this.raceLongformCameraY
    ) * ORB_RACE_LONGFORM_PRESENTATION.cameraEase;
    this.raceLongformCameraY = Math.max(
      0,
      Math.min(cameraMax, this.raceLongformCameraY),
    );
    this.raceLongformCameraSimTime = sim.time;
    this.raceLongformCameraSimulation = sim;
    layout.tracks.forEach((track, index) => {
      const team = teams[index];
      if (!team) return;
      this.drawRaceLongformTrack(
        ctx,
        sim,
        team,
        track,
        layout,
        index,
        this.raceLongformCameraY,
        visualNow,
        presentation,
      );
    });
    // Long-form has independent vertical worlds per track. The visiting Twin
    // must be composited after both worlds, using the opponent's transformed
    // world rectangle rather than the owner's track rectangle.
    this.drawRaceLongformVisitingTwins?.(ctx, sim, teams, layout, this.raceLongformCameraY, visualNow);
    if (Number(presentation.raceTargetPrompt) > 0) {
      this.drawRaceLongformTargetPrompt(
        ctx,
        presentation.raceTargetPrompt,
        width,
        height,
      );
    }
  }

  drawRaceLongformTargetPrompt(ctx, target, width, height) {
    const centerX = width * 0.5;
    const centerY = height * 0.57;
    const maxWidth = Math.min(width * 0.72, 1320);
    const lines = [
      { text: "WHO WILL BREAK", color: "#ffffff", maxSize: 78, height: 94 },
      { text: `${formatOrbRaceNumber(target)} LAYER`, color: "#ff1818", maxSize: 104, height: 122 },
      { text: "FIRST?", color: "#14ef45", maxSize: 86, height: 102 },
    ];
    const totalHeight = lines.reduce((sum, line) => sum + line.height, 0);
    let y = centerY - totalHeight * 0.5;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const line of lines) {
      let fontSize = line.maxSize;
      ctx.font = `900 ${fontSize}px ${RACE_NUMBER_FONT}`;
      while (fontSize > 34 && ctx.measureText(line.text).width > maxWidth - 48) {
        fontSize -= 2;
        ctx.font = `900 ${fontSize}px ${RACE_NUMBER_FONT}`;
      }
      const textWidth = Math.min(maxWidth, ctx.measureText(line.text).width + 48);
      const x = centerX - textWidth * 0.5;
      ctx.fillStyle = "#050505";
      ctx.fillRect(x, y, textWidth, line.height);
      ctx.strokeStyle = "#050505";
      ctx.lineWidth = Math.max(5, fontSize * 0.075);
      ctx.fillStyle = line.color;
      ctx.strokeText(line.text, centerX, y + line.height * 0.5);
      ctx.fillText(line.text, centerX, y + line.height * 0.5);
      y += line.height;
    }
    ctx.restore();
  }

  drawRaceTiltedLayer(ctx, x, y, width, height, health, fillColor) {
    const angle = Math.PI / 14;
    const gap = Math.max(3, width * 0.014);
    const pieceWidth = (width - gap) * 0.5;
    const depth = Math.min(height * 0.6, Math.tan(angle) * pieceWidth);
    const bodyHeight = height - depth;
    const pieceHealth = Array.isArray(health) ? health : [health, health];
    const pieceColors = Array.isArray(fillColor) ? fillColor : [fillColor, fillColor];
    const pieces = [
      {
        points: [
          [x, y],
          [x + pieceWidth, y + depth],
          [x + pieceWidth, y + depth + bodyHeight],
          [x, y + bodyHeight],
        ],
        centerX: x + pieceWidth * 0.5,
        centerY: y + bodyHeight * 0.5 + depth * 0.5,
        rotation: angle,
      },
      {
        points: [
          [x + width - pieceWidth, y + depth],
          [x + width, y],
          [x + width, y + bodyHeight],
          [x + width - pieceWidth, y + depth + bodyHeight],
        ],
        centerX: x + width - pieceWidth * 0.5,
        centerY: y + bodyHeight * 0.5 + depth * 0.5,
        rotation: -angle,
      },
    ];
    pieces.forEach((piece, pieceIndex) => {
      const currentHealth = Math.max(0, Number(pieceHealth[pieceIndex]) || 0);
      if (currentHealth <= 0) return;
      const value = formatOrbRaceNumber(currentHealth);
      ctx.save();
      ctx.beginPath();
      piece.points.forEach(([pointX, pointY], index) => {
        if (index === 0) ctx.moveTo(pointX, pointY);
        else ctx.lineTo(pointX, pointY);
      });
      ctx.closePath();
      ctx.fillStyle = pieceColors[pieceIndex] || "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = Math.max(3, width * 0.004);
      ctx.stroke();
      ctx.translate(piece.centerX, piece.centerY);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = "#050505";
      setFittedFont(ctx, value, pieceWidth * 0.72, 900, Math.round(bodyHeight * 0.68), 10, RACE_NUMBER_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = Math.max(1.5, width * 0.002);
      ctx.strokeText(value, 0, 0);
      ctx.fillText(value, 0, 0);
      ctx.restore();
    });
  }

  longformWorldMetrics(track, layout, layerCount) {
    const viewportHeight = Math.max(1, track.height - layout.headerHeight);
    const worldLayerHeight = Math.max(
      ORB_RACE_LONGFORM_PRESENTATION.worldLayerHeightMin,
      viewportHeight * ORB_RACE_LONGFORM_PRESENTATION.worldLayerHeightFraction,
    );
    const worldLayerGap = Math.max(
      ORB_RACE_LONGFORM_PRESENTATION.worldLayerGapMin,
      worldLayerHeight,
      viewportHeight * ORB_RACE_LONGFORM_PRESENTATION.worldLayerGapFraction,
    );
    const worldLayerStep = worldLayerHeight + worldLayerGap;
    const chamberHeight = worldLayerHeight * ORB_RACE_LONGFORM_PRESENTATION.chamberHeightFraction;
    const finishHeight = worldLayerHeight * ORB_RACE_LONGFORM_PRESENTATION.finishHeightFraction;
    return {
      layerCount,
      viewportHeight,
      worldLayerHeight,
      worldLayerStep,
      chamberHeight,
      finishHeight,
      totalWorldHeight: chamberHeight + layerCount * worldLayerStep + finishHeight,
      simLayerHeight: RACE_LAYER_HEIGHT,
    };
  }

  longformWorldLayerTopForIndex(index, metrics) {
    const safeIndex = Math.max(0, Math.floor(Number(index) || 0));
    return metrics.chamberHeight + safeIndex * metrics.worldLayerStep;
  }

  longformWorldYForSimY(racer, value, metrics) {
    const y = Math.max(0, Number(value) || 0);
    const chamberNorm = ORB_RACE_PRESENTATION.orbChamberFraction;
    const simLineForIndex = (index) => chamberNorm + index * metrics.simLayerHeight;
    const worldLineForIndex = (index) => metrics.chamberHeight + index * metrics.worldLayerStep;
    const worldYForGlobalSimY = (valueY) => {
      const safeY = Math.max(0, Number(valueY) || 0);
      if (safeY <= chamberNorm) {
        return (safeY / Math.max(0.001, chamberNorm)) * metrics.chamberHeight;
      }
      const layerPosition = (safeY - chamberNorm) / Math.max(0.001, metrics.simLayerHeight);
      const index = Math.max(0, Math.min(metrics.layerCount - 1, Math.floor(layerPosition)));
      const progress = Math.max(0, Math.min(1, layerPosition - index));
      const start = worldLineForIndex(index);
      const end = worldLineForIndex(index + 1);
      return start + (end - start) * progress;
    };
    if (racer?.raceReadyToFinish || racer?.raceLayerIndex >= metrics.layerCount) {
      const finishNorm = simLineForIndex(metrics.layerCount);
      const finishWorld = worldLineForIndex(metrics.layerCount);
      if (y < finishNorm) return worldYForGlobalSimY(y);
      const finishProgress = Math.max(
        0,
        Math.min(1, (y - finishNorm) / Math.max(0.001, ORB_RACE_PRESENTATION.finishFraction)),
      );
      return finishWorld + finishProgress * metrics.finishHeight;
    }
    return worldYForGlobalSimY(y);
  }

  longformTeamProgress(team) {
    const layerCount = Math.max(1, team?.raceLayerHealth?.length || 1);
    const members = Array.isArray(team?.members) && team.members.length
      ? team.members
      : [team];
    const memberProgress = members.reduce((best, member) => Math.max(
      best,
      Number.isInteger(member?.raceLayerIndexOverride)
        ? Number(member.raceLayerIndexOverride)
        : Number(member?.raceLayerIndex) || 0,
    ), 0);
    return Math.max(
      0,
      Math.min(
        layerCount,
        Math.max(Math.floor(Number(team?.raceLayerIndex) || 0), Math.floor(memberProgress)),
      ),
    );
  }

  longformLeaderIndex(teams, winningTeamIndex = null) {
    if (Number.isInteger(winningTeamIndex)) {
      return Math.max(0, Math.min(teams.length - 1, winningTeamIndex));
    }
    return teams.reduce((bestIndex, team, index) => (
      this.longformTeamProgress(team) > this.longformTeamProgress(teams[bestIndex])
        ? index
        : bestIndex
    ), 0);
  }

  longformCameraTargetForTeam(team, metrics) {
    const progressY = metrics.chamberHeight
      + this.longformTeamProgress(team) * metrics.worldLayerStep;
    const cameraMax = Math.max(0, metrics.totalWorldHeight - metrics.viewportHeight);
    return Math.max(
      0,
      Math.min(
        cameraMax,
        progressY - metrics.viewportHeight * ORB_RACE_LONGFORM_PRESENTATION.cameraFocusFraction,
      ),
    );
  }

  drawRaceLongformTrack(
    ctx,
    sim,
    team,
    track,
    layout,
    trackIndex,
    cameraY = 0,
    visualNow = null,
    presentation = {},
  ) {
    const members = team.members?.length ? team.members : [team];
    const primary = members[0];
    const def = ORB_RACERS[primary?.raceOrbId];
    const themeColor = raceThemeColorForRacer(primary, def?.color || "#ed1bd4");
    const layerCount = Math.max(1, team.raceLayerHealth?.length || sim.raceLayerCount || 3);
    const metrics = this.longformWorldMetrics(track, layout, layerCount);
    const {
      viewportHeight,
      worldLayerHeight,
      worldLayerGap,
      worldLayerStep,
      chamberHeight,
      finishHeight,
      totalWorldHeight,
    } = metrics;
    const visualLayerHeight = snowballLayerHeightFor(members, worldLayerHeight);
    const worldYForSimY = (racer, value) => this.longformWorldYForSimY(racer, value, metrics);
    const layerInset = Math.max(
      12,
      track.width * ORB_RACE_LONGFORM_PRESENTATION.layerInsetFraction,
    );
    const layerX = track.x + layerInset;
    const layerWidth = Math.max(1, track.width - layerInset * 2);
    const worldRect = {
      x: track.x,
      y: track.y + layout.headerHeight - cameraY,
      width: track.width,
      height: totalWorldHeight,
    };
    const tournamentFinish = sim.raceTournament?.enabled === true
      || sim.raceTournamentState?.enabled === true
      || presentation.options?.raceTournament?.enabled === true;
    const blueSunOverflow = raceLongformBlueSunOverflowFor(track.width, members);
    const contentTop = track.y + layout.headerHeight;
    const clipTop = Math.max(track.y, contentTop - blueSunOverflow);
    this.drawRaceLongformHeader(ctx, team, members, track, layout.headerHeight, trackIndex, sim.time);
    ctx.save();
    ctx.beginPath();
    ctx.rect(track.x, clipTop, track.width, track.y + track.height - clipTop);
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(track.x, track.y + layout.headerHeight, track.width, viewportHeight);

    const chamberY = worldRect.y;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(track.x, chamberY, track.width, chamberHeight);

    const activeLayer = Math.max(0, Math.min(layerCount - 1, team.raceLayerIndex || 0));
    for (let index = 0; index < layerCount; index += 1) {
      const layerPullOffset = raceLayerPullOffsetFor(primary, index);
      const y = worldRect.y + this.longformWorldLayerTopForIndex(index, metrics)
        + (layerPullOffset / Math.max(0.001, RACE_LAYER_HEIGHT)) * metrics.worldLayerStep;
      const persistentTiltedHealth = Array.isArray(team.raceTiltedLayerHealth?.[index])
        ? team.raceTiltedLayerHealth[index]
        : null;
      const hasPersistentTiltedPiece = persistentTiltedHealth?.some((pieceHealth) => (
        Math.max(0, Number(pieceHealth) || 0) > 0
      )) === true;
      if (
        (index < activeLayer && !hasPersistentTiltedPiece)
        || ((Number(team.raceLayerHealth?.[index]) || 0) <= 0 && !hasPersistentTiltedPiece)
      ) {
        // Cleared walls intentionally leave no card, number, or separator
        // behind. The outer box remains one continuous white field.
        continue;
      } else {
        const active = index === activeLayer && !team.raceFinished;
        const health = Math.max(0, Number(team.raceLayerHealth?.[index]) || 0);
        const layerColor = raceLayerColorFor(
          themeColor,
          health,
          raceLayerMaxHealthFor(sim, team, index),
        );
        const miner = members.find((racer) => (
          racer.raceOrbId === "miner"
          && racer.raceMinerAttached
          && Number(racer.raceMinerLayerIndex) === index
          && racer.raceMinerState === "drill"
        ));
        const minerShrink = miner
          ? Math.max(0, Math.min(0.96, Number(miner.raceMinerDrillProgress) || 0))
          : 0;
        const drawY = y + visualLayerHeight * minerShrink;
        const drawHeight = visualLayerHeight * (1 - minerShrink);
        if (drawHeight <= 0.5) continue;
        const teamTiltedHealth = persistentTiltedHealth ? [...persistentTiltedHealth] : null;
        if (teamTiltedHealth) {
          const tiltedHealth = teamTiltedHealth;
          const tiltedColors = tiltedHealth.map((pieceHealth) => pieceHealth > 0
            ? raceLayerColorFor(themeColor, pieceHealth, raceLayerMaxHealthFor(sim, team, index))
            : "#ffffff");
          this.drawRaceTiltedLayer(
            ctx,
            layerX,
            y,
            layerWidth,
            visualLayerHeight,
            tiltedHealth,
            tiltedColors,
          );
          continue;
        }
        ctx.fillStyle = layerColor;
        ctx.fillRect(layerX, drawY, layerWidth, drawHeight);
        if (active) {
          const integral = members.find((racer) => racer.raceOrbId === "integral");
          if (integral) this.drawRaceLongformIntegral(ctx, integral, {
            ...worldRect,
            x: layerX,
            width: layerWidth,
          }, drawY, drawHeight, worldYForSimY);
        }
        members
          .filter((racer) => raceHasAbility(racer, "meteor"))
          .forEach((racer) => this.drawRaceMeteorBurns(ctx, racer, {
            ...worldRect,
            x: layerX,
            width: layerWidth,
          }, index, drawY, drawHeight, sim.time));
        members
          .filter((racer) => racer.raceOrbId === "godzilla")
          .forEach((racer) => this.drawRaceGodzillaBurns(ctx, racer, {
            ...worldRect,
            x: layerX,
            width: layerWidth,
          }, index, drawY, drawHeight, sim.time));
        if (health > 0) {
          const value = formatOrbRaceNumber(health);
          setFittedFont(ctx, value, layerWidth * 0.86, 900, Math.round(drawHeight * 0.46), 18, RACE_NUMBER_FONT);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.lineWidth = Math.max(2, track.width * 0.0025);
          ctx.strokeStyle = "#080808";
          ctx.fillStyle = "#050505";
          ctx.strokeText(value, layerX + layerWidth / 2, drawY + drawHeight / 2);
          ctx.fillText(value, layerX + layerWidth / 2, drawY + drawHeight / 2);
        }
        this.drawRaceRealityLayerShift(
          ctx,
          sim.fighters.find((racer) => racer.raceOrbId === "reality-bomb")?.raceRealityLayerShiftEffects,
          team.index,
          index,
          layerX,
          drawY,
          layerWidth,
          drawHeight,
        );
        ctx.strokeStyle = "#080808";
        ctx.lineWidth = Math.max(3, track.width * 0.004);
        ctx.strokeRect(layerX, drawY, layerWidth, drawHeight);
      }
    }

    ctx.strokeStyle = "#080808";
    ctx.lineWidth = Math.max(3, track.width * 0.004);
    // The header and launch chamber share the outer surface. The opening wall
    // now owns a complete rectangle outline like every later wall.
    ctx.beginPath();
    ctx.moveTo(track.x, chamberY);
    ctx.lineTo(track.x, chamberY + chamberHeight);
    ctx.moveTo(track.x + track.width, chamberY);
    ctx.lineTo(track.x + track.width, chamberY + chamberHeight);
    ctx.stroke();
    const finishY = worldRect.y + chamberHeight + layerCount * worldLayerStep;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(track.x, finishY, track.width, finishHeight);
    ctx.fillStyle = "#686868";
    ctx.globalAlpha = 0.7;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFittedFont(ctx, "FINISH", track.width * 0.75, 900, Math.max(22, finishHeight * 0.25), 14, RACE_NUMBER_FONT);
    ctx.fillText("FINISH", track.x + track.width / 2, finishY + finishHeight * 0.26);
    ctx.globalAlpha = 1;
    const checkerRect = raceLongformTournamentCheckerRect({
      format: this.format,
      tournament: tournamentFinish,
      layerCount,
      track,
      finishY,
      finishHeight,
    });
    this.drawRaceCheckerboard(
      ctx,
      checkerRect.x,
      checkerRect.y,
      checkerRect.width,
      checkerRect.height,
      ORB_RACE_LONGFORM_CHECKER_COLUMNS,
      checkerRect.extended,
    );
    if (raceTournamentFinishBorderVisible({ tournament: tournamentFinish })) {
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = Math.max(3, track.width * 0.004);
      ctx.strokeRect(track.x, finishY, track.width, finishHeight);
    }

    members.forEach((racer) => {
      const transformed = this.transformLongformRacer(racer, worldYForSimY, totalWorldHeight);
      transformed.raceLongform = true;
      transformed.raceLongformViewportRect = {
        x: track.x,
        y: clipTop,
        width: track.width,
        height: Math.max(0, track.y + track.height - clipTop),
      };
      const memberDef = ORB_RACERS[racer.raceOrbId];
      const orbRadius = raceRenderOrbRadius(track.width, racer.raceOrbScale, 15);
      const orbX = worldRect.x + worldRect.width * (Number.isFinite(transformed.raceX) ? transformed.raceX : 0.88);
      const orbY = worldRect.y + worldRect.height * (Number.isFinite(transformed.raceY) ? transformed.raceY : 0.08);
      this.drawRaceTrail(ctx, transformed, memberDef, worldRect, orbRadius);
      this.drawRaceBounceEffects(ctx, transformed, memberDef, worldRect, orbRadius, true, visualNow);
      this.drawRaceLaser(ctx, sim, transformed, worldRect, orbRadius);
      this.drawRaceOrb(ctx, transformed, memberDef, orbX, orbY, orbRadius, sim.time, worldRect);
      this.drawRaceScissorSplitEffects(ctx, transformed, worldRect, orbRadius);
      this.drawRaceDrillProjectiles(ctx, transformed, memberDef, worldRect, orbRadius);
      this.drawRaceBatarangProjectiles(ctx, transformed, memberDef, worldRect, orbRadius);
      this.drawRaceBatmanGrapple(ctx, transformed, worldRect, orbRadius);
      this.drawRaceBoomerangProjectiles(ctx, transformed, memberDef, worldRect, orbRadius);
      this.drawRaceMines(ctx, transformed, memberDef, worldRect, orbRadius);
      this.drawRaceGrappler(ctx, transformed, memberDef, worldRect, orbRadius);
      this.drawRaceExpansionEffects(ctx, transformed, memberDef, worldRect, orbRadius, sim.time);
      this.drawRaceRicochetProjectiles(ctx, transformed, worldRect, orbRadius);
      this.drawRaceSawbladeProjectiles(ctx, transformed, worldRect, orbRadius);
      this.drawRaceTacticalEffects(ctx, transformed, worldRect, orbRadius, sim.time);
      this.drawRaceBatBombs(ctx, transformed, worldRect, orbRadius);
      this.drawRaceMeteorProjectiles(ctx, transformed, worldRect, orbRadius);
      this.drawRaceMeteorHorn(ctx, transformed, orbX, orbY, orbRadius, sim.time);
    });
    ctx.restore();

    // One continuous board frame: the header and race chamber share the same
    // white surface, so there is no horizontal rule separating the name from
    // the launch area. The vertical edges and outer top/bottom remain crisp.
    drawThemedArenaBorder(
      ctx,
      track,
      themeColor,
      Math.max(6, track.width * 0.008),
    );

    // Long-form tracks keep the shallow FINISH/checker band dedicated to the
    // finish line. Put the CTA and hashtag in the outer side margin instead,
    // where they remain visible without covering race content.
    this.drawRaceLongformSideCopy(ctx, layout, track, trackIndex);
  }

  drawRaceLongformSideCopy(ctx, layout, track, trackIndex) {
    const copyLayout = raceLongformSideCopyLayout(layout, track, trackIndex);
    const label = raceFinishLabelForIndex(trackIndex);
    const tag = ORB_RACE_FOOTER_TAG;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#686868";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(1, copyLayout.width * 0.006);
    ctx.globalAlpha = 0.84;
    setFittedFont(
      ctx,
      label,
      copyLayout.width,
      900,
      Math.min(32, Math.max(18, copyLayout.width * 0.12)),
      10,
      RACE_NUMBER_FONT,
    );
    ctx.strokeText(label, copyLayout.x, copyLayout.y);
    ctx.fillText(label, copyLayout.x, copyLayout.y);
    ctx.globalAlpha = 0.72;
    setFittedFont(
      ctx,
      tag,
      copyLayout.width,
      900,
      Math.min(20, Math.max(10, copyLayout.width * 0.07)),
      8,
      RACE_NUMBER_FONT,
    );
    ctx.strokeText(tag, copyLayout.x, copyLayout.y + copyLayout.lineGap);
    ctx.fillText(tag, copyLayout.x, copyLayout.y + copyLayout.lineGap);
    ctx.restore();
  }

  transformLongformRacer(racer, worldYForSimY, totalWorldHeight) {
    const transformY = (value) => Math.max(0, Math.min(1, worldYForSimY(racer, value) / totalWorldHeight));
    const mapPoint = (point) => ({ ...point, y: transformY(point.y) });
    const transformed = { ...racer, raceY: transformY(racer.raceY) };
    transformed.raceTrail = (racer.raceTrail || []).map(mapPoint);
    transformed.raceBounceEffects = (racer.raceBounceEffects || []).map(mapPoint);
    transformed.raceIntegralPath = (racer.raceIntegralPath || []).map(mapPoint);
    transformed.raceDuplicateOrbs = (racer.raceDuplicateOrbs || []).map((duplicate) => ({
      ...duplicate,
      raceY: transformY(duplicate.raceY),
    }));
    [
      "raceDrillProjectiles",
      "raceBatarangProjectiles",
      "raceBoomerangProjectiles",
      "raceMineProjectiles",
      "raceRicochetProjectiles",
      "raceSawbladeProjectiles",
      "raceBatBombs",
      "raceMeteorProjectiles",
      "raceMeteorGiantProjectiles",
      "raceTurrets",
      "raceTurretBombs",
      "raceParasites",
      "raceDraftBullets",
      "raceDraftImpactEffects",
      "raceSniperBullets",
      "raceGrapplerProjectiles",
      "racePancakeStacks",
      "racePancakePatches",
      "racePancakeButterPatches",
      "racePancakeButterMeteors",
      "raceArtistDrawings",
      "raceArtistSummons",
    ].forEach((key) => {
      transformed[key] = (racer[key] || []).map((projectile) => ({ ...projectile, y: transformY(projectile.y) }));
    });
    const artistGroundYFor = (layerIndex) => transformY(
      raceLayerLineY(Math.max(0, Math.floor(Number(layerIndex) || 0))),
    );
    transformed.raceArtistDrawings = (racer.raceArtistDrawings || []).map((drawing) => ({
      ...drawing,
      y: transformY(drawing.y),
      groundY: artistGroundYFor(drawing.layerIndex ?? racer.raceLayerIndex),
    }));
    transformed.raceArtistPaintingEffects = (racer.raceArtistPaintingEffects || []).map((effect) => ({
      ...effect,
      y: transformY(effect.y),
      groundY: artistGroundYFor(effect.layerIndex ?? racer.raceLayerIndex),
    }));
    transformed.raceArtistSummons = (racer.raceArtistSummons || []).map((summon) => ({
      ...summon,
      y: transformY(summon.y),
      groundY: artistGroundYFor(summon.layerIndex ?? racer.raceLayerIndex),
    }));
    transformed.raceArtistStormStrikes = (racer.raceArtistStormStrikes || []).map((strike) => ({
      ...strike,
      groundY: artistGroundYFor(strike.layerIndex ?? racer.raceLayerIndex),
    }));
    transformed.raceTreeRootLayerGroundYs = Array.from({
      length: Math.max(1, racer.raceLayerHealth?.length || 3),
    }, (_, layerIndex) => artistGroundYFor(layerIndex));
    transformed.racePancakeStacks = (racer.racePancakeStacks || []).map((stack) => ({
      ...stack,
      y: transformY(stack.y),
    }));
    transformed.raceGrapplerPull = racer.raceGrapplerPull
      ? {
        ...racer.raceGrapplerPull,
        startY: transformY(racer.raceGrapplerPull.startY),
        targetY: transformY(racer.raceGrapplerPull.targetY),
      }
      : null;
    transformed.raceGrapplerAnchor = racer.raceGrapplerAnchor
      ? { ...racer.raceGrapplerAnchor, y: transformY(racer.raceGrapplerAnchor.y) }
      : null;
    transformed.raceGrapplerRope = racer.raceGrapplerRope
      ? {
        ...racer.raceGrapplerRope,
        y1: transformY(racer.raceGrapplerRope.y1),
        y2: transformY(racer.raceGrapplerRope.y2),
      }
      : null;
    transformed.raceBatmanGrapple = racer.raceBatmanGrapple
      ? {
        ...racer.raceBatmanGrapple,
        startY: transformY(racer.raceBatmanGrapple.startY),
        targetY: transformY(racer.raceBatmanGrapple.targetY),
        anchorY: transformY(racer.raceBatmanGrapple.anchorY),
      }
      : null;
    transformed.racePancakeActiveStack = racer.racePancakeActiveStack
      ? {
        ...racer.racePancakeActiveStack,
        y: transformY(racer.racePancakeActiveStack.y),
      }
      : null;
    transformed.raceBlueSunLasers = (racer.raceBlueSunLasers || []).map((laser) => ({
      ...laser,
      startY: transformY(laser.startY),
      endY: transformY(laser.endY),
    }));
    // All Sun variants share Blue Sun's normalized intersection geometry. The
    // long-form board stretches the simulation vertically, so every ray and
    // Purple Sun's beam must cross the same y transform as the orb itself.
    const transformSunLaser = (laser) => ({
      ...laser,
      startY: transformY(laser.startY),
      endY: transformY(laser.endY),
    });
    transformed.racePhaseThreeSunLasers = (racer.racePhaseThreeSunLasers || []).map(transformSunLaser);
    transformed.racePhaseTwoSunLasers = (racer.racePhaseTwoSunLasers || []).map(transformSunLaser);
    transformed.racePurpleSunBeam = racer.racePurpleSunBeam
      ? transformSunLaser(racer.racePurpleSunBeam)
      : null;
    transformed.raceArtistActivePainting = racer.raceArtistActivePainting
      ? {
        ...racer.raceArtistActivePainting,
        y: transformY(racer.raceArtistActivePainting.y),
        groundY: artistGroundYFor(racer.raceArtistActivePainting.layerIndex ?? racer.raceLayerIndex),
      }
      : null;
    transformed.raceCrusherCracks = (racer.raceCrusherCracks || []).map(mapPoint);
    transformed.raceReactorEffects = (racer.raceReactorEffects || []).map(mapPoint);
    transformed.raceTsarBombReactorEffects = (racer.raceTsarBombReactorEffects || []).map(mapPoint);
    transformed.raceBlackHoleTeleportMarks = (racer.raceBlackHoleTeleportMarks || []).map(mapPoint);
    transformed.raceSnakePath = (racer.raceSnakePath || []).map(mapPoint);
    transformed.raceSnakeOrbs = (racer.raceSnakeOrbs || []).map((snake) => ({
      ...snake,
      raceY: transformY(snake.raceY),
      raceSnakePath: (snake.raceSnakePath || []).map(mapPoint),
    }));
    transformed.raceRealitySpawns = (racer.raceRealitySpawns || []).map((spawn) => ({
      ...spawn,
      raceY: transformY(spawn.raceY),
    }));
    transformed.raceHackerSpawnedOrbs = (racer.raceHackerSpawnedOrbs || []).map((child) => ({
      ...child,
      raceY: transformY(child.raceY),
    }));
    if (racer.raceHackerHydrogenBomb) {
      transformed.raceHackerHydrogenBomb = {
        ...racer.raceHackerHydrogenBomb,
        raceY: transformY(racer.raceHackerHydrogenBomb.raceY),
      };
    }
    transformed.raceAntimatterDustEffects = (racer.raceAntimatterDustEffects || []).map((effect) => ({
      ...effect,
      y: transformY(effect.y),
    }));
    return transformed;
  }

  drawRaceLongformHeader(ctx, team, members, track, headerHeight, trackIndex, simTime = 0) {
    const name = team.name || raceTeamDisplayName(team.orbIds);
    const primary = ORB_RACERS[team.orbIds?.[0]];
    const themeColor = raceTextColorForRacer(members?.[0], primary?.color || "#111111");
    const descriptors = members.map((racer) => (
      RACE_LONGFORM_DESCRIPTORS[racer.raceOrbId] || ORB_RACERS[racer.raceOrbId]?.statLabel || "race ability"
    ));
    const seenOrbIds = new Set();
    const hasDuplicateBalls = members.some((racer) => {
      const orbId = racer?.raceOrbId;
      if (!orbId || seenOrbIds.has(orbId)) return Boolean(orbId);
      seenOrbIds.add(orbId);
      return false;
    });
    const absorber = members.length === 1 && members[0]?.raceOrbId === "roulette" ? members[0] : null;
    const showDescriptor = members.length < 5 && !hasDuplicateBalls && !absorber;
    const hydrogenCountdownLine = members.length === 1 && members[0]?.raceOrbId === "hydrogen-bomb"
      ? raceHydrogenCountdownLineFor(members[0])
      : "";
    const hideDamage = Boolean(hydrogenCountdownLine);
    const hasScalingDamage = members.some((racer) => racer?.raceScalingDamageEnabled !== false);
    const damageLine = hideDamage || !hasScalingDamage
      ? ""
      : members.length > 1
        ? `DAMAGE/SEC: ${formatCombatValue(team.raceDamagePerSecond)}`
        : raceDamageHudLineFor(members[0]);
    const drillMembers = members.filter((racer) => raceHasAbility(racer, "drill"));
    const drillLine = drillMembers.length
      ? `DRAG: ${formatCombatValue(Math.max(...drillMembers.map((racer) => raceDrillDragFor(racer))))}`
      : "";
    const blackHoleMembers = members.filter((racer) => raceHasAbility(racer, "black-hole"));
    const blackHoleLine = blackHoleMembers.length
      ? `SINGULARITY: ${Math.round(Math.max(...blackHoleMembers.map((racer) => racer.raceBlackHoleAbilityProgress || 0)))}%`
      : "";
    const longformTopStatLine = members.length === 1
      ? raceLongformTopStatLineFor(members[0])
      : "";
    const specialCountdownLine = members.length === 1 && members[0]?.raceOrbId === "antimatter-bomb"
      ? "DETONATION " + raceAntimatterCountdownLineFor(members[0])
      : members.length === 1 && members[0]?.raceOrbId === "time-bomb"
        ? "MIDNIGHT " + raceTimeBombCountdownLineFor(members[0], simTime)
        : members.length === 1 && members[0]?.raceOrbId === "reality-bomb"
          ? raceRealityCountdownLineFor(members[0], simTime)
          : members.length === 1 && members[0]?.raceOrbId === "tsar-bomb"
            ? "DETONATION " + raceTsarBombCountdownLineFor(members[0])
            : members.length === 1 && members[0]?.raceOrbId === "all-in-one"
              ? `POWER ${members[0].raceAllInOneActive ? "ACTIVE" : "CHARGING"} · BOMB ${Math.max(0, RACE_TSAR_BOMB_COUNTDOWN_SECONDS - (Number(members[0].raceAllInOneHydrogenCountdownElapsed) || 0)).toFixed(1)}S`
          : "";
    const statLines = hydrogenCountdownLine || specialCountdownLine
      ? [hydrogenCountdownLine || specialCountdownLine]
      : absorber
        ? [damageLine].filter(Boolean)
        : [[damageLine, longformTopStatLine, drillLine, blackHoleLine].filter(Boolean).join(" · ")].filter(Boolean);
    const descriptorLine = showDescriptor
      ? members.length > 1
        ? `(${descriptors.join(" + ")})`
        : `(${descriptors[0]})`
      : "";
    ctx.save();
    ctx.fillStyle = "#ffffff";
    const headerY = track.y || 0;
    ctx.fillRect(track.x, headerY, track.width, headerHeight);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#080808";
    ctx.fillStyle = themeColor;
    const nameSize = Math.min(54, headerHeight * 0.34);
    setFittedFont(ctx, name, track.width * 0.9, 900, nameSize, 16, PIXEL_FONT);
    const titleSegments = raceTitleSegmentsFor(team, name);
    if (titleSegments) {
      drawTextSegments(ctx, titleSegments, track.x + track.width / 2, headerY + 10);
    } else {
      ctx.strokeText(name, track.x + track.width / 2, headerY + 10);
      ctx.fillText(name, track.x + track.width / 2, headerY + 10);
    }
    const infoSize = Math.max(17, Math.min(27, headerHeight * 0.18));
    const descriptorY = headerY + 14 + nameSize + 3;
    if (descriptorLine) {
      setFittedFont(ctx, descriptorLine, track.width * 0.9, 900, infoSize, 12, PIXEL_FONT);
      ctx.fillStyle = themeColor;
      ctx.strokeText(descriptorLine, track.x + track.width / 2, descriptorY);
      ctx.fillText(descriptorLine, track.x + track.width / 2, descriptorY);
    }
    if (statLines.length) {
      const statsStartY = descriptorLine ? descriptorY + infoSize + 2 : descriptorY;
      const statsSize = absorber
        ? Math.min(infoSize, Math.max(13, headerHeight * 0.105))
        : infoSize;
      const statsSpacing = absorber ? Math.max(12, statsSize * 0.94) : statsSize;
      statLines.forEach((statLine, index) => {
        const statY = statsStartY + index * statsSpacing;
        setFittedFont(ctx, statLine, track.width * 0.92, 900, statsSize, 11, PIXEL_FONT);
        // A pale outline keeps the gray stat legible over a bright chamber, while
        // the narrow dark pass preserves the heavy block-break lettering.
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#ffffff";
        ctx.strokeText(statLine, track.x + track.width / 2, statY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#080808";
        ctx.fillStyle = hydrogenCountdownLine ? themeColor : "#858585";
        ctx.strokeText(statLine, track.x + track.width / 2, statY);
        ctx.fillText(statLine, track.x + track.width / 2, statY);
      });
      if (absorber) {
        const tokens = raceAbsorberLongformTokensFor(absorber);
        const tokenColumns = Math.min(3, Math.max(1, tokens.length));
        const tokenRows = Math.max(1, Math.ceil(tokens.length / tokenColumns));
        const tokenTop = statsStartY + statsSize + 3;
        const tokenWidth = track.width / tokenColumns;
        const tokenHeight = Math.max(12, (headerHeight - (tokenTop - headerY) - 3) / tokenRows);
        tokens.forEach((token, index) => {
          const column = index % tokenColumns;
          const row = Math.floor(index / tokenColumns);
          const tokenX = track.x + tokenWidth * (column + 0.5);
          const tokenY = tokenTop + tokenHeight * row + tokenHeight * 0.55;
          const text = `${token.label} ${token.value}`;
          setFittedFont(ctx, text, tokenWidth * 0.9, 900, Math.min(13, tokenHeight * 0.76), 8, PIXEL_FONT);
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#ffffff";
          ctx.strokeText(text, tokenX, tokenY);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#080808";
          ctx.fillStyle = token.color;
          ctx.strokeText(text, tokenX, tokenY);
          ctx.fillText(text, tokenX, tokenY);
        });
      }
    }
    ctx.restore();
  }

  drawRaceLongformIntegral(ctx, racer, rect, layerY, layerHeight, worldYForSimY) {
    const path = Array.isArray(racer.raceIntegralPath) ? racer.raceIntegralPath : [];
    if (path.length < 2) return;
    const points = path.map((point) => ({
      x: rect.x + rect.width * Math.max(0, Math.min(1, Number(point.x) || 0)),
      y: rect.y + worldYForSimY(racer, point.y),
    }));
    const first = points[0];
    const last = points.at(-1);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(first.x, layerY);
    points.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.lineTo(last.x, layerY);
    ctx.closePath();
    ctx.fillStyle = "#7b61ff44";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.strokeStyle = "#5a42d6";
    ctx.lineWidth = Math.max(3, rect.width * 0.003);
    ctx.stroke();
    ctx.restore();
  }

  drawRaceMatchup(ctx, teams, width, y, gap) {
    const left = ORB_RACERS[teams[0].orbIds[0]];
    const right = ORB_RACERS[teams[1].orbIds[0]];
    const leftThemeColor = raceTextColorForRacer(teams[0].members?.[0], left?.color || "#111111");
    const rightThemeColor = raceTextColorForRacer(teams[1].members?.[0], right?.color || "#111111");
    const leftName = teams[0].name || raceTeamDisplayName(teams[0].orbIds);
    const rightName = teams[1].name || raceTeamDisplayName(teams[1].orbIds);
    const nameSize = Math.max(28, Math.min(62, gap * 0.24));
    const vsSize = Math.max(22, Math.min(42, gap * 0.17));
    const lineGap = Math.max(5, nameSize * 0.1);
    const totalHeight = nameSize * 2 + vsSize + lineGap * 2;
    const topNameY = y - totalHeight / 2 + nameSize / 2;
    const vsY = topNameY + nameSize / 2 + lineGap + vsSize / 2;
    const bottomNameY = vsY + vsSize / 2 + lineGap + nameSize / 2;
    const nameWidth = width * 0.82;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#080808";
    setFittedFont(ctx, leftName, nameWidth, 900, nameSize, 18, PIXEL_FONT);
    ctx.textAlign = "center";
    ctx.fillStyle = leftThemeColor;
    if (leftName === ORB_RACE_EVERYONE_LABEL) {
      drawRainbowText(ctx, leftName, width / 2, topNameY);
    } else if (raceTitleSegmentsFor(teams[0], leftName)) {
      drawTextSegments(ctx, raceTitleSegmentsFor(teams[0], leftName), width / 2, topNameY);
    } else {
      ctx.strokeText(leftName, width / 2, topNameY);
      ctx.fillText(leftName, width / 2, topNameY);
    }
    setFittedFont(ctx, rightName, nameWidth, 900, nameSize, 18, PIXEL_FONT);
    ctx.fillStyle = rightThemeColor;
    if (rightName === ORB_RACE_EVERYONE_LABEL) {
      drawRainbowText(ctx, rightName, width / 2, bottomNameY);
    } else if (raceTitleSegmentsFor(teams[1], rightName)) {
      drawTextSegments(ctx, raceTitleSegmentsFor(teams[1], rightName), width / 2, bottomNameY);
    } else {
      ctx.strokeText(rightName, width / 2, bottomNameY);
      ctx.fillText(rightName, width / 2, bottomNameY);
    }
    ctx.font = `900 ${vsSize}px ${PIXEL_FONT}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#111111";
    ctx.strokeText("VS", width / 2, vsY);
    ctx.fillText("VS", width / 2, vsY);
    ctx.restore();
  }

  drawRaceRealityLayerShift(ctx, effects, teamIndex, layerIndex, x, y, width, height) {
    const activeEffects = (effects || []).filter((effect) => (
      Number(effect?.teamIndex) === Number(teamIndex)
      && Number(effect?.layerIndex) === Number(layerIndex)
      && Number(effect?.age) < Number(effect?.lifetime || 1)
    ));
    for (const effect of activeEffects) {
      const remaining = Math.max(0, 1 - (Number(effect.age) || 0) / Math.max(0.001, Number(effect.lifetime) || 1));
      const from = formatOrbRaceNumber(Math.max(0, Number(effect.from) || 0));
      ctx.save();
      ctx.globalAlpha = Math.min(0.9, remaining * 0.9);
      ctx.fillStyle = "#fff7ed";
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = "#7c2d12";
      ctx.strokeStyle = "#fff7ed";
      ctx.lineWidth = Math.max(1.5, width * 0.0025);
      setFittedFont(ctx, from, width * 0.82, 900, Math.round(height * 0.6), 12, RACE_NUMBER_FONT);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText(from, x + width / 2, y + height / 2);
      ctx.fillText(from, x + width / 2, y + height / 2);
      ctx.restore();
    }
  }

  drawRaceBoard(ctx, sim, team, rect, time, racerIndex, visualNow = null) {
    const members = team.members?.length ? team.members : [team];
    const primary = members[0];
    if (!primary?.raceOrbId || !Array.isArray(team.raceLayerHealth)) return;
    const def = ORB_RACERS[primary.raceOrbId];
    if (!def) return;
    const themeColor = raceThemeColorForRacer(primary, def?.color || "#ed1bd4");
    const sections = orbRaceBoardSections(rect, team.raceLayerHealth.length);
    const {
      topHeight,
      layerHeight: baseLayerHeight,
      finishHeight,
      finishY,
      finishLabelHeight,
      checkerHeight,
      checkerY,
    } = sections;
    const layerHeight = snowballLayerHeightFor(members, baseLayerHeight);
    const integralMember = members.find((racer) => racer.raceOrbId === "integral");
    const tournamentFinish = sim.raceTournament?.enabled === true
      || sim.raceTournamentState?.enabled === true;
    ctx.save();
    ctx.strokeStyle = "#080808";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    for (let index = 0; index < team.raceLayerHealth.length; index += 1) {
      const persistentTiltedHealth = Array.isArray(team.raceTiltedLayerHealth?.[index])
        ? team.raceTiltedLayerHealth[index]
        : null;
      const hasPersistentTiltedPiece = persistentTiltedHealth?.some((pieceHealth) => (
        Math.max(0, Number(pieceHealth) || 0) > 0
      )) === true;
      if (
        (index < team.raceLayerIndex && !hasPersistentTiltedPiece)
        || ((Number(team.raceLayerHealth[index]) || 0) <= 0 && !hasPersistentTiltedPiece)
      ) continue;
      const y = rect.y + topHeight + baseLayerHeight * (index + 1) - layerHeight
        + raceLayerPullOffsetFor(primary, index) * rect.height;
      const active = index === team.raceLayerIndex && !team.raceFinished;
      const layerHealth = Math.max(0, Number(team.raceLayerHealth[index]) || 0);
      const layerColor = raceLayerColorFor(
        themeColor,
        layerHealth,
        raceLayerMaxHealthFor(sim, team, index),
      );
      const miner = members.find((racer) => (
        racer.raceOrbId === "miner"
        && racer.raceMinerAttached
        && Number(racer.raceMinerLayerIndex) === index
        && racer.raceMinerState === "drill"
      ));
      const minerShrink = miner
        ? Math.max(0, Math.min(0.96, Number(miner.raceMinerDrillProgress) || 0))
        : 0;
      const drawY = y + layerHeight * minerShrink;
      const drawHeight = layerHeight * (1 - minerShrink);
      if (drawHeight <= 0.5) continue;
      const teamTiltedHealth = persistentTiltedHealth ? [...persistentTiltedHealth] : null;
      if (teamTiltedHealth) {
        const tiltedHealth = teamTiltedHealth;
        const tiltedColors = tiltedHealth.map((pieceHealth) => pieceHealth > 0
          ? raceLayerColorFor(themeColor, pieceHealth, raceLayerMaxHealthFor(sim, team, index))
          : "#ffffff");
        this.drawRaceTiltedLayer(
          ctx,
          rect.x,
          y,
          rect.width,
          layerHeight,
          tiltedHealth,
          tiltedColors,
        );
        continue;
      }
      ctx.fillStyle = layerColor;
      ctx.fillRect(rect.x, drawY, rect.width, drawHeight);
      if (active) {
        if (integralMember) this.drawRaceIntegralArc(ctx, integralMember, rect, drawY, drawHeight);
      }
      members
        .filter((racer) => raceHasAbility(racer, "meteor"))
        .forEach((racer) => this.drawRaceMeteorBurns(ctx, racer, rect, index, drawY, drawHeight, time));
      members
        .filter((racer) => racer.raceOrbId === "godzilla")
        .forEach((racer) => this.drawRaceGodzillaBurns(ctx, racer, rect, index, drawY, drawHeight, time));
      if (active && members.some((racer) => racer.raceOrbId === "godzilla" && racer.raceBounceFlash > 0)) {
        const flash = Math.max(...members
          .filter((racer) => racer.raceOrbId === "godzilla")
          .map((racer) => racer.raceBounceFlash || 0));
        ctx.save();
        ctx.globalAlpha = Math.min(0.88, flash / 0.18);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(rect.x, y, rect.width, layerHeight);
        ctx.restore();
      }
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = Math.max(4, rect.width * 0.008);
      ctx.strokeRect(rect.x, drawY, rect.width, drawHeight);
      ctx.fillStyle = "#050505";
      const layerValue = formatOrbRaceNumber(layerHealth);
      // Number walls are the focal point of the Block Breaker format. Use a
      // dedicated heavy face and a small black keyline so trillion-scale values
      // stay legible without touching either border.
      setFittedFont(ctx, layerValue, rect.width * 0.82, 900, Math.round(drawHeight * 0.65), 12, RACE_NUMBER_FONT);
      ctx.lineWidth = Math.max(1.5, rect.width * 0.0025);
      ctx.strokeStyle = "#080808";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText(layerValue, rect.x + rect.width / 2, drawY + drawHeight / 2);
      ctx.fillText(layerValue, rect.x + rect.width / 2, drawY + drawHeight / 2);
      this.drawRaceRealityLayerShift(
        ctx,
        sim.fighters.find((racer) => racer.raceOrbId === "reality-bomb")?.raceRealityLayerShiftEffects,
        team.index,
        index,
        rect.x,
        drawY,
        rect.width,
        drawHeight,
      );
    }
    const finishAbsoluteY = rect.y + finishY;
    const checkerAbsoluteY = rect.y + checkerY;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(rect.x, finishAbsoluteY, rect.width, finishHeight);
    const finishLabel = raceFinishLabelForIndex(racerIndex);
    ctx.save();
    ctx.globalAlpha = 0.68;
    ctx.fillStyle = "#686868";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFittedFont(
      ctx,
      finishLabel,
      rect.width * 0.84,
      900,
      Math.max(16, finishLabelHeight * 0.5),
      10,
      RACE_NUMBER_FONT,
    );
    ctx.fillText(finishLabel, rect.x + rect.width / 2, finishAbsoluteY + finishLabelHeight * 0.34);
    ctx.globalAlpha = 0.72;
    setFittedFont(
      ctx,
      ORB_RACE_FOOTER_TAG,
      rect.width * 0.76,
      900,
      Math.max(10, finishLabelHeight * 0.24),
      8,
      RACE_NUMBER_FONT,
    );
    ctx.fillText(ORB_RACE_FOOTER_TAG, rect.x + rect.width / 2, finishAbsoluteY + finishLabelHeight * 0.78);
    ctx.restore();
    // Keep a dedicated label band above the flag. The separator and clipping
    // guarantee the checker pattern can never run through the text.
    if (raceTournamentFinishBorderVisible({ tournament: tournamentFinish })) {
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = Math.max(2, rect.width * 0.004);
      ctx.beginPath();
      ctx.moveTo(rect.x, checkerAbsoluteY);
      ctx.lineTo(rect.x + rect.width, checkerAbsoluteY);
      ctx.stroke();
    }
    this.drawRaceCheckerboard(ctx, rect.x, checkerAbsoluteY, rect.width, checkerHeight);
    if (raceTournamentFinishBorderVisible({ tournament: tournamentFinish })) {
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = Math.max(4, rect.width * 0.008);
      ctx.strokeRect(rect.x, finishAbsoluteY, rect.width, finishHeight);
    }

    for (const racer of members) {
      const memberDef = ORB_RACERS[racer.raceOrbId];
      const orbRadius = raceRenderOrbRadius(rect.width, racer.raceOrbScale);
      const orbX = rect.x + rect.width * (Number.isFinite(racer.raceX) ? racer.raceX : 0.88);
      const orbY = rect.y + rect.height * (Number.isFinite(racer.raceY) ? racer.raceY : 0.09);
      this.drawRaceTrail(ctx, racer, memberDef, rect, orbRadius);
      this.drawRaceBounceEffects(ctx, racer, memberDef, rect, orbRadius, false, visualNow);
      this.drawRaceLaser(ctx, sim, racer, rect, orbRadius);
      this.drawRaceOrb(ctx, racer, memberDef, orbX, orbY, orbRadius, time, rect);
      this.drawRaceScissorSplitEffects(ctx, racer, rect, orbRadius);
      this.drawRaceDrillProjectiles(ctx, racer, memberDef, rect, orbRadius);
      this.drawRaceBatarangProjectiles(ctx, racer, memberDef, rect, orbRadius);
      this.drawRaceBatmanGrapple(ctx, racer, rect, orbRadius);
      this.drawRaceBoomerangProjectiles(ctx, racer, memberDef, rect, orbRadius);
      this.drawRaceMines(ctx, racer, memberDef, rect, orbRadius);
      this.drawRaceGrappler(ctx, racer, memberDef, rect, orbRadius);
      this.drawRaceExpansionEffects(ctx, racer, memberDef, rect, orbRadius, sim.time);
      this.drawRaceRicochetProjectiles(ctx, racer, rect, orbRadius);
      this.drawRaceSawbladeProjectiles(ctx, racer, rect, orbRadius);
      this.drawRaceTacticalEffects(ctx, racer, rect, orbRadius, sim.time);
      this.drawRaceBatBombs(ctx, racer, rect, orbRadius);
      this.drawRaceMeteorProjectiles(ctx, racer, rect, orbRadius);
      this.drawRaceMeteorHorn(ctx, racer, orbX, orbY, orbRadius, sim.time);
    }

      this.drawRaceTeamStats(ctx, team, members, rect, racerIndex, sim.time);
    const primaryAbilityBarIds = new Set([
      "batman",
      "flash",
      "jackpot",
      "meteor",
      "black-hole",
      "godzilla",
      "draftmaster",
      "artists",
      "reactor",
    ]);
    const abilityMembers = members.flatMap((racer) => {
      if (racer.raceOrbId === "roulette") {
        return raceAbsorberAbilityIdsFor(racer)
          .filter((abilityId) => RACE_ABSORBER_ABILITY_BAR_IDS.has(abilityId))
          .map((abilityId) => ({ racer, abilityId }));
      }
      return primaryAbilityBarIds.has(racer.raceOrbId)
        ? [{ racer, abilityId: racer.raceOrbId }]
        : [];
    });
    abilityMembers.forEach(({ racer, abilityId }, index) => {
      if (abilityId === "jackpot") {
        this.drawRaceSlotMachine(ctx, racer, ORB_RACERS[abilityId], rect, racerIndex, sim.time, index, abilityMembers.length);
      } else {
        if (members.length > 1) return;
        this.drawRaceAbilityBar(ctx, racer, ORB_RACERS[abilityId], rect, racerIndex, index, abilityMembers.length, sim.time);
      }
    });

    // Keep the outer race box visually dominant and draw it last so layers,
    // finish graphics, and effects cannot soften or cover its perimeter.
    drawThemedArenaBorder(
      ctx,
      rect,
      themeColor,
      Math.max(7, rect.width * 0.012),
    );
    ctx.restore();
  }

  raceFinishExplosionAge(racer, effect, visualNow) {
    const baseAge = Math.max(0, Number(effect.age) || 0);
    if (!Number.isFinite(visualNow)) return baseAge;
    if (!(this.raceFinishExplosionStartTimes instanceof Map)) {
      this.raceFinishExplosionStartTimes = new Map();
    }
    const key = effect.finishExplosionId || `${racer?.id || "racer"}:finish`;
    let startedAt = this.raceFinishExplosionStartTimes.get(key);
    if (!Number.isFinite(startedAt)) {
      startedAt = visualNow;
      this.raceFinishExplosionStartTimes.set(key, startedAt);
    }
    return Math.max(baseAge, (visualNow - startedAt) / 1000);
  }

  drawRaceBounceEffects(ctx, racer, def, rect, orbRadius, suppressScreenFlash = false, visualNow = null) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    for (const effect of racer.raceBounceEffects || []) {
      const effectAge = effect.finishExplosion
        ? this.raceFinishExplosionAge(racer, effect, visualNow)
        : Math.max(0, Number(effect.age) || 0);
      const progress = Math.max(0, Math.min(1, effectAge / raceRenderEffectLifetime(effect)));
      const alpha = Math.round((1 - progress) * 210).toString(16).padStart(2, "0");
      const centerX = rect.x + effect.x * rect.width;
      const centerY = rect.y + effect.y * rect.height;
      const impactRings = effect.purpleSunImpact || effect.laserImpact || effect.blueSunImpact
        || effect.phaseTwoSunImpact || effect.phaseTwoSunBurn;
      if (!impactRings) {
        ctx.strokeStyle = `${effect.color || def?.color || "#ed1bd4"}${alpha}`;
        ctx.lineWidth = Math.max(2, orbRadius * (0.16 + (1 - progress) * 0.12));
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          orbRadius * (effect.scale || 1) * (1 + progress * 0.5),
          0,
          TAU,
        );
        ctx.stroke();
      }
      if (impactRings) {
        const ringCount = Math.max(1, Math.min(8, Math.floor(Number(effect.ringCount) || 3)));
        ctx.save();
        ctx.lineCap = "round";
        for (let ring = 0; ring < ringCount; ring += 1) {
          const delay = ring * 0.18;
          const ringProgress = Math.max(0, Math.min(1, (progress - delay) / Math.max(0.01, 1 - delay)));
          if (ringProgress <= 0) continue;
          const ringAlpha = Math.round((1 - ringProgress) * 235).toString(16).padStart(2, "0");
          const laserImpactScale = effect.laserImpact ? 1.2 : 1;
          const ringRadius = orbRadius * laserImpactScale * (
            0.34 + ringProgress * (1.35 + ring * 0.3) + (effect.scale || 1) * 0.15
          );
          const ringColors = effect.purpleSunImpact
            ? ["#c084fc", "#f3e8ff"]
            : effect.blueSunImpact
              ? ["#00d9ff", "#d9fbff"]
              : effect.phaseTwoSunImpact || effect.phaseTwoSunBurn
                ? ["#f97316", "#ffd166"]
              : ["#ff3b5c", "#ffc2ca"];
          ctx.strokeStyle = `${ringColors[ring % ringColors.length]}${ringAlpha}`;
          ctx.lineWidth = Math.max(
            effect.laserImpact ? 3.5 : 2.5,
            orbRadius * (effect.laserImpact ? 0.18 - ringProgress * 0.05 : 0.13 - ringProgress * 0.045),
          );
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, TAU);
          ctx.stroke();
        }
        ctx.restore();
      }
      if (effect.layerBreak && Array.isArray(effect.particles)) {
        const centerX = rect.x + effect.x * rect.width;
        const centerY = rect.y + effect.y * rect.height;
        const particleLifetime = Math.max(0.82, Number(effect.lifetime) || 0.82);
        const particleProgress = Math.max(0, Math.min(1, effectAge / particleLifetime));
        const particleColors = raceOrbSplitColors(def, racer)
          || [effect.color || def?.accent || def?.color || "#ed1bd4"];
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - particleProgress * 0.9);
        effect.particles.forEach((particle, particleIndex) => {
          const distance = (Number(particle.speed) || 0.04) * effectAge;
          const particleX = centerX + Math.cos(particle.angle || 0) * distance * rect.width;
          const particleY = centerY
            + Math.sin(particle.angle || 0) * distance * rect.height
            + rect.height * 0.024 * effectAge * effectAge;
          const size = Math.max(3.5, orbRadius * (Number(particle.size) || 0.16) * (1 - particleProgress * 0.2));
          const particleColor = particleColors[particleIndex % particleColors.length];
          const particleRgb = raceHexColorToRgb(particleColor);
          const particleLuminance = particleRgb
            ? (particleRgb.r * 299 + particleRgb.g * 587 + particleRgb.b * 114) / 1000
            : 0;
          ctx.beginPath();
          ctx.arc(particleX, particleY, size, 0, TAU);
          ctx.fillStyle = particleColor;
          ctx.fill();
          ctx.strokeStyle = particleLuminance > 170 ? "#080808" : "#ffffff";
          ctx.lineWidth = Math.max(1.5, size * 0.22);
          ctx.stroke();
        });
        ctx.restore();
      }
      if (effect.spark) {
        const centerX = rect.x + effect.x * rect.width;
        const centerY = rect.y + effect.y * rect.height;
        const inner = orbRadius * (0.7 + progress * 0.25);
        const outer = orbRadius * (1.12 + progress * 0.38);
        for (let ray = 0; ray < 8; ray += 1) {
          const angle = ray / 8 * TAU;
          ctx.beginPath();
          ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
          ctx.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer);
          ctx.stroke();
        }
      }
      if (effect.squareRoot) {
        const centerX = rect.x + effect.x * rect.width;
        const centerY = rect.y + effect.y * rect.height;
        const symbolY = centerY - orbRadius * (1.28 + progress * 1.05);
        const symbolSize = Math.max(18, orbRadius * (1.12 - progress * 0.16));
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.font = `900 ${symbolSize}px ${PIXEL_FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = Math.max(2, symbolSize * 0.12);
        ctx.strokeStyle = "#080808";
        ctx.fillStyle = "#ffffff";
        ctx.strokeText("√", centerX, symbolY);
        ctx.fillText("√", centerX, symbolY);
        ctx.restore();
      }
      if (effect.cash) {
        const cash = raceSprite("jackpotCash");
        if (cash) {
          const centerX = rect.x + effect.x * rect.width;
          const centerY = rect.y + effect.y * rect.height;
          const size = orbRadius * (3.5 + progress * 1.2);
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - progress);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(cash, centerX - size / 2, centerY - size / 2, size, size);
          ctx.restore();
        }
      }
      if (effect.cracks) {
        const centerX = rect.x + effect.x * rect.width;
        const centerY = rect.y + effect.y * rect.height;
        const reach = orbRadius * (1.1 + progress * 0.9);
        const impactSprite = raceSprite("impactCritical");
        if (impactSprite) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - progress);
          ctx.imageSmoothingEnabled = false;
          const impactSize = orbRadius * (2.4 + progress * 1.5);
          ctx.drawImage(impactSprite, centerX - impactSize / 2, centerY - impactSize / 2, impactSize, impactSize);
          ctx.restore();
        }
        ctx.save();
        ctx.strokeStyle = `#080808${alpha}`;
        ctx.lineWidth = Math.max(2, orbRadius * 0.09);
        for (let branch = 0; branch < 7; branch += 1) {
          const angle = -Math.PI * 0.9 + branch * Math.PI * 0.3;
          const mid = reach * 0.45;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(angle) * mid, centerY + Math.sin(angle) * mid);
          ctx.lineTo(
            centerX + Math.cos(angle + 0.12) * reach,
            centerY + Math.sin(angle + 0.12) * reach,
          );
          ctx.stroke();
        }
        ctx.restore();
      }
      if (effect.critical) {
        const centerX = rect.x + effect.x * rect.width;
        const centerY = rect.y + effect.y * rect.height;
        const impactSprite = raceSprite("impactCritical");
        if (impactSprite) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - progress);
          ctx.imageSmoothingEnabled = false;
          const impactSize = orbRadius * (3.1 + progress * 1.1);
          ctx.drawImage(impactSprite, centerX - impactSize / 2, centerY - impactSize / 2, impactSize, impactSize);
          ctx.restore();
        }
      }
      if (effect.butter) {
        const centerX = rect.x + effect.x * rect.width;
        const centerY = rect.y + effect.y * rect.height;
        const impactSize = orbRadius * (3.2 + progress * 1.2);
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.roundRect(
          centerX - impactSize * 0.34,
          centerY - impactSize * 0.2,
          impactSize * 0.68,
          impactSize * 0.4,
          impactSize * 0.08,
        );
        ctx.fill();
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.roundRect(
          centerX - impactSize * 0.29,
          centerY - impactSize * 0.16,
          impactSize * 0.58,
          impactSize * 0.32,
          impactSize * 0.06,
        );
        ctx.fill();
        ctx.restore();
      }
      if (!suppressScreenFlash && effect.impactFrames && progress < 0.18) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 202, 72, ${(1 - progress / 0.18) * 0.24})`;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  drawRaceTrail(ctx, racer, def, rect, orbRadius) {
    for (const point of racer.raceTrail || []) {
      const progress = Math.max(0, Math.min(1, point.age / 1.2));
      const alpha = Math.round(240 * Math.pow(1 - progress, 1.35)).toString(16).padStart(2, "0");
      const x = rect.x + point.x * rect.width;
      const y = rect.y + point.y * rect.height;
      if (point.money) {
        const cash = raceSprite("jackpotCash");
        const size = orbRadius * (1.7 - progress * 0.35);
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress);
        if (cash) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(cash, x - size, y - size, size * 2, size * 2);
        } else {
          ctx.fillStyle = "#16a34a";
          ctx.font = `900 ${size * 1.35}px ${PIXEL_FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("$", x, y);
        }
        ctx.restore();
      } else if (point.solid) {
        // Solid trails are deliberately opaque orb-sized echoes. They are used
        // by Sticky and Grower to make the repeated path read as one continuous
        // chain, instead of the translucent after-image used by the global trail.
        const size = orbRadius * (point.scale || 1);
        ctx.fillStyle = def?.color || "#ed1bd4";
        ctx.strokeStyle = "#080808";
        ctx.lineWidth = Math.max(2, size * 0.12);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, TAU);
        ctx.fill();
        ctx.stroke();
      } else if (point.lightning) {
        const size = orbRadius * (point.scale || 1);
        const sprite = raceTransparentSprite("flashTrail", "flash-trail");
        if (sprite) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - progress);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(sprite, x - size * 1.2, y - size * 0.82, size * 2.4, size * 1.64);
          ctx.restore();
        }
      } else {
        ctx.fillStyle = `${def?.color || "#ed1bd4"}${alpha}`;
        ctx.beginPath();
        ctx.arc(x, y, orbRadius * (point.scale || 1), 0, TAU);
        ctx.fill();
      }
    }
  }

  drawRaceLaser(ctx, sim, racer, rect, orbRadius) {
    if (!raceHasAbility(racer, "lazer") || racer.raceReadyToFinish) return;
    const ray = getRaceLaserRay(sim, racer);
    const startX = rect.x + ray.startX * rect.width;
    const startY = rect.y + ray.startY * rect.height;
    const endX = rect.x + ray.endX * rect.width;
    const endY = rect.y + ray.endY * rect.height;
    ctx.save();
    ctx.strokeStyle = "#450000";
    ctx.lineWidth = Math.max(7, orbRadius * 0.38);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.strokeStyle = "#970000";
    ctx.lineWidth = Math.max(3, orbRadius * 0.18);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.strokeStyle = "#df1010";
    ctx.lineWidth = Math.max(1.5, orbRadius * 0.07);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  }

  drawRaceScissorSplitEffects(ctx, racer, rect, orbRadius) {
    const effects = Array.isArray(racer?.raceScissorSplitEffects)
      ? racer.raceScissorSplitEffects
      : [];
    if (!effects.length) return;
    const sprite = raceSprite("scissorSheet");
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    for (const effect of effects) {
      const lifetime = Math.max(0.1, Number(effect.lifetime) || RACE_SCISSOR_ANIMATION_SECONDS);
      const progress = Math.max(0, Math.min(1, (Number(effect.age) || 0) / lifetime));
      const x = rect.x + (Number(effect.x) || 0.5) * rect.width;
      const y = rect.y + (Number(effect.y) || 0.25) * rect.height;
      const size = Math.min(rect.width * 0.84, orbRadius * 7.8) * (0.88 + progress * 0.12);
      const alpha = Math.max(0, 1 - progress * 0.9);
      const frame = Math.min(2, Math.floor(progress * 3));
      ctx.save();
      ctx.globalAlpha = alpha;
      if (!this.drawRaceSheetFrame(ctx, "scissorSheet", 3, frame, x, y, size, size)) {
        ctx.strokeStyle = "#f1f5f9";
        ctx.lineWidth = Math.max(3, orbRadius * 0.14);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - size * 0.24, y - size * 0.34);
        ctx.lineTo(x + size * 0.24, y + size * 0.34);
        ctx.moveTo(x + size * 0.24, y - size * 0.34);
        ctx.lineTo(x - size * 0.24, y + size * 0.34);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawRaceTwinHealingIndicator(ctx, owner, twin, twinX, twinY, childRadius, time) {
    if (!owner?.raceTwinHealing) return;
    const radius = childRadius / 0.92;
    ctx.save();
    ctx.strokeStyle = "#a7f3d0";
    ctx.lineWidth = Math.max(2, radius * 0.08);
    ctx.setLineDash([radius * 0.18, radius * 0.14]);
    ctx.beginPath();
    ctx.arc(
      twinX,
      twinY,
      childRadius * 1.18 + Math.sin((Number(time) || 0) * 8) * radius * 0.05,
      0,
      TAU,
    );
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#a7f3d0";
    ctx.font = `900 ${Math.max(10, radius * 0.34)}px ${PIXEL_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", twinX, twinY - childRadius * 1.34);
    ctx.restore();
  }

  drawRaceTwinChild(ctx, owner, twin, def, twinX, twinY, radius, time) {
    const childRadius = radius * 0.92;
    const visualDef = owner?.raceTwinHealing === true
      ? { ...def, color: RACE_TWIN_HEALING_COLOR, accent: RACE_TWIN_HEALING_ACCENT }
      : def;
    ctx.save();
    ctx.globalAlpha = 0.96;
    this.drawRaceOrbUnit(ctx, visualDef, twinX, twinY, childRadius, twin, time);
    this.drawRaceTwinHealingIndicator(ctx, owner, twin, twinX, twinY, childRadius, time);
    ctx.restore();
  }

  visitingRaceTwinEntries(teams) {
    const entries = [];
    for (const team of teams || []) {
      for (const owner of team?.members || []) {
        const twin = owner?.raceTwinOrb;
        if (owner?.raceOrbId !== "twins" || owner?.raceTwinHealing !== true || !twin) continue;
        entries.push({ owner, twin });
      }
    }
    return entries;
  }

  drawRaceVisitingTwins(ctx, teams, boards, time, visualNow = null) {
    for (const { owner, twin } of this.visitingRaceTwinEntries(teams)) {
      const targetTeamIndex = Number.isInteger(Number(twin.raceTeamIndex))
        ? Number(twin.raceTeamIndex)
        : (Number(owner.raceTeamIndex) === 0 ? 1 : 0);
      const targetBoard = boards?.[targetTeamIndex];
      if (!targetBoard) continue;
      const def = ORB_RACERS[owner.raceOrbId] || ORB_RACERS.twins;
      const radius = raceRenderOrbRadius(targetBoard.width, owner.raceOrbScale);
      const childRadius = radius * 0.92;
      const x = targetBoard.x + targetBoard.width * (
        Number.isFinite(Number(twin.raceX)) ? Number(twin.raceX) : 0.5
      );
      const y = targetBoard.y + targetBoard.height * (
        Number.isFinite(Number(twin.raceY)) ? Number(twin.raceY) : 0.1
      );
      ctx.save();
      ctx.beginPath();
      ctx.rect(targetBoard.x, targetBoard.y, targetBoard.width, targetBoard.height);
      ctx.clip();
      this.drawRaceTrail(ctx, twin, def, targetBoard, childRadius);
      this.drawRaceBounceEffects(ctx, twin, def, targetBoard, childRadius, false, visualNow);
      this.drawRaceTwinChild(ctx, owner, twin, def, x, y, radius, time);
      ctx.restore();
    }
  }

  drawRaceLongformVisitingTwins(ctx, sim, teams, layout, cameraY = 0, visualNow = null) {
    const layerCount = Math.max(
      1,
      ...teams.map((team) => team?.raceLayerHealth?.length || sim.raceLayerCount || 3),
    );
    for (const { owner, twin } of this.visitingRaceTwinEntries(teams)) {
      const targetTeamIndex = Number.isInteger(Number(twin.raceTeamIndex))
        ? Number(twin.raceTeamIndex)
        : (Number(owner.raceTeamIndex) === 0 ? 1 : 0);
      const targetTrack = layout.tracks?.[targetTeamIndex];
      const targetTeam = teams[targetTeamIndex];
      if (!targetTrack || !targetTeam) continue;
      const metrics = this.longformWorldMetrics(targetTrack, layout, layerCount);
      const worldYForSimY = (racer, value) => this.longformWorldYForSimY(racer, value, metrics);
      const transformed = this.transformLongformRacer(
        twin,
        worldYForSimY,
        metrics.totalWorldHeight,
      );
      transformed.raceLongform = true;
      const contentTop = targetTrack.y + layout.headerHeight;
      const clipTop = Math.max(targetTrack.y, contentTop - raceLongformBlueSunOverflowFor(targetTrack.width, [owner]));
      const worldRect = {
        x: targetTrack.x,
        y: targetTrack.y + layout.headerHeight - cameraY,
        width: targetTrack.width,
        height: metrics.totalWorldHeight,
      };
      const radius = raceRenderOrbRadius(targetTrack.width, owner.raceOrbScale, 15);
      const x = worldRect.x + worldRect.width * (
        Number.isFinite(Number(transformed.raceX)) ? Number(transformed.raceX) : 0.5
      );
      const y = worldRect.y + worldRect.height * (
        Number.isFinite(Number(transformed.raceY)) ? Number(transformed.raceY) : 0.1
      );
      const def = ORB_RACERS[owner.raceOrbId] || ORB_RACERS.twins;
      ctx.save();
      ctx.beginPath();
      ctx.rect(targetTrack.x, clipTop, targetTrack.width, targetTrack.y + targetTrack.height - clipTop);
      ctx.clip();
      this.drawRaceTrail(ctx, transformed, def, worldRect, radius);
      this.drawRaceBounceEffects(ctx, transformed, def, worldRect, radius, true, visualNow);
      this.drawRaceTwinChild(ctx, owner, transformed, def, x, y, radius, sim.time);
      ctx.restore();
    }
  }

  drawRaceTwinsOrb(ctx, racer, def, x, y, radius, time, rect) {
    const twin = racer?.raceTwinOrb;
    const damageDef = racer?.raceTwinHealing === true
      ? { ...def, color: RACE_TWIN_DAMAGE_COLOR, accent: RACE_TWIN_DAMAGE_ACCENT }
      : def;
    const childRadius = radius * 0.92;
    const fallbackSide = racer?.raceTeamIndex % 2 === 0 ? 1 : -1;
    const twinX = rect.x + (
      Number.isFinite(Number(twin?.raceX))
        ? Number(twin.raceX)
        : Math.max(0.04, Math.min(0.96, (Number(racer?.raceX) || 0.5) + fallbackSide * 0.075))
    ) * rect.width;
    const twinY = rect.y + (
      Number.isFinite(Number(twin?.raceY))
        ? Number(twin.raceY)
        : (Number(racer?.raceY) || 0.1)
    ) * rect.height;
    const child = twin || {
      ...racer,
      raceTwinChild: true,
      raceDamage: racer?.raceDamage || 1,
      raceX: 0.5,
      raceY: 0.1,
    };
    // While healing, the child is composited by drawRaceVisitingTwins after
    // both team boards. Drawing it here would put it back on the owner's
    // board and the later target-board fill would hide or duplicate it.
    if (!racer?.raceTwinHealing) {
      this.drawRaceTwinChild(ctx, racer, child, def, twinX, twinY, radius, time);
    }
    this.drawRaceOrbUnit(ctx, damageDef, x, y, radius, racer, time);
  }

  drawRaceTeamStats(ctx, team, members, rect, racerIndex, simTime = 0) {
    const roster = Array.isArray(members) ? members : [];
    if (roster.length <= 2) {
      roster.forEach((racer, index) => {
        this.drawRaceStats(ctx, racer, ORB_RACERS[racer.raceOrbId], rect, racerIndex, index, roster.length, simTime);
      });
      return;
    }
    const teamColor = raceTextColorForRacer(
      roster[0],
      ORB_RACERS[team?.orbIds?.[0]]?.color || "#111111",
    );
    const hasScalingDamage = roster.some((racer) => racer?.raceScalingDamageEnabled !== false);
    const lines = [
      { text: `ORBS: ${roster.length}`, color: teamColor },
      ...(hasScalingDamage
        ? [{ text: `TOTAL DAMAGE/SEC: ${formatCombatValue(team?.raceDamagePerSecond || 0)}`, color: teamColor }]
        : []),
    ];
    const anchorX = racerIndex === 0 ? rect.x : rect.x + rect.width;
    const anchorY = racerIndex === 0 ? rect.y - 15 : rect.y + rect.height + 14;
    ctx.save();
    ctx.font = `900 ${Math.max(15, rect.height * 0.054)}px ${PIXEL_FONT}`;
    ctx.textAlign = racerIndex === 0 ? "left" : "right";
    ctx.textBaseline = racerIndex === 0 ? "bottom" : "top";
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#080808";
    lines.forEach((line, index) => {
      const y = racerIndex === 0
        ? anchorY - (lines.length - 1 - index) * rect.height * 0.06
        : anchorY + index * rect.height * 0.06;
      const text = typeof line === "string" ? line : line.text;
      ctx.fillStyle = typeof line === "string"
        ? teamColor
        : line.color || teamColor;
      ctx.strokeText(text, anchorX, y);
      ctx.fillText(text, anchorX, y);
    });
    ctx.restore();
  }

  drawRaceAbilityBar(ctx, racer, def, rect, racerIndex, slotIndex = 0, slotCount = 1, simTime = 0) {
    const abilityId = def?.id || racer?.raceOrbId;
    const primaryBarIds = ["batman", "flash", "meteor", "black-hole", "godzilla", "draftmaster", "artists", "reactor"];
    const absorbedBlackHole = racer?.raceOrbId === "roulette"
      && abilityId === "black-hole"
      && raceHasAbility(racer, "black-hole");
    if (!def || (!primaryBarIds.includes(abilityId) && !absorbedBlackHole)) return;
    const rawProgress = abilityId === "meteor"
      ? racer.raceMeteorAbilityProgress
      : abilityId === "black-hole"
        ? racer.raceBlackHoleAbilityProgress
        : abilityId === "godzilla"
          ? racer.raceGodzillaAbilityProgress
          : abilityId === "draftmaster"
            ? raceDraftmasterAbilityProgress(racer, simTime)
            : abilityId === "artists"
              ? racer.raceArtistAbilityProgress
              : abilityId === "reactor"
                ? racer.raceReactorCharge
                : racer.raceAbilityProgress;
    const progress = Math.max(0, Math.min(100, Number(rawProgress) || 0));
    const segments = 4;
    const barWidth = Math.min(rect.width * (slotCount > 1 ? 0.22 : 0.34), slotCount > 1 ? 190 : 260);
    const barHeight = Math.max(10, rect.height * 0.042);
    const slotGap = Math.max(6, rect.width * 0.008);
    const x = racerIndex === 0
      ? rect.x + rect.width - (slotCount - slotIndex) * barWidth - (slotCount - slotIndex - 1) * slotGap
      : rect.x + slotIndex * (barWidth + slotGap);
    // Keep the meter just beyond the board edge, alongside the existing stat
    // copy instead of floating in the open space above/below the race box.
    const outsideGap = Math.max(6, rect.height * 0.01);
    const absorberTopBar = racer?.raceOrbId === "roulette" && racerIndex === 0;
    const y = racerIndex === 0
      ? absorberTopBar
        ? rect.y + Math.max(outsideGap, rect.height * 0.045)
        : rect.y - barHeight - outsideGap
      : rect.y + rect.height + outsideGap;
    ctx.save();
    ctx.lineWidth = Math.max(2, rect.width * 0.004);
    ctx.strokeStyle = "#080808";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = abilityId === "meteor"
      ? "#ff7a18"
      : abilityId === "black-hole"
        ? "#d45cff"
        : abilityId === "godzilla"
          ? "#20d9ff"
          : abilityId === "artists"
            ? "#f97316"
            : abilityId === "reactor"
              ? "#168cff"
              : def.color;
    ctx.fillRect(x, y, barWidth * progress / 100, barHeight);
    ctx.strokeRect(x, y, barWidth, barHeight);
    for (let index = 0; index < segments; index += 1) {
      const segmentX = x + index * barWidth / segments;
      if (index > 0) {
        ctx.beginPath();
        ctx.moveTo(segmentX, y);
        ctx.lineTo(segmentX, y + barHeight);
        ctx.stroke();
      }
    }
    const labelFontSize = Math.max(12, rect.height * (slotCount > 1 ? 0.032 : 0.042));
    ctx.textAlign = racerIndex === 0 ? "right" : "left";
    ctx.textBaseline = racerIndex === 0 ? "bottom" : "top";
    ctx.fillStyle = abilityId === "batman"
      ? "#050505"
      : abilityId === "meteor"
        ? "#ff7a18"
        : abilityId === "black-hole"
          ? "#d45cff"
          : abilityId === "godzilla"
            ? "#20d9ff"
            : abilityId === "artists"
              ? "#f97316"
              : abilityId === "reactor"
                ? "#168cff"
                : def.color;
    const label = abilityId === "batman"
      ? "BAT BOMBS"
      : abilityId === "meteor"
        ? "METEOR SUMMON"
      : abilityId === "black-hole"
        ? "SINGULARITY"
        : abilityId === "godzilla"
          ? "ATOMIC BREATH"
          : abilityId === "draftmaster"
            ? "UPGRADES"
            : abilityId === "artists"
              ? "PAINTING"
              : abilityId === "reactor"
                ? "REACTOR BLAST"
                : "SPEEDFORCE";
    const displayLabel = racer?.raceOrbId === "roulette"
      ? abilityId === "black-hole" ? "SINGULARITY" : abilityId === "reactor" ? "REACTOR" : "METEOR"
      : label;
    if (typeof ctx.measureText === "function") {
      setFittedFont(ctx, displayLabel, barWidth * 0.96, 900, labelFontSize, 8, PIXEL_FONT);
    } else {
      ctx.font = `900 ${labelFontSize}px ${PIXEL_FONT}`;
    }
    const labelY = racerIndex === 0 ? y - 5 : y + barHeight + 5;
    const labelX = racerIndex === 0 ? x + barWidth : x;
    ctx.strokeText(displayLabel, labelX, labelY);
    ctx.fillText(displayLabel, labelX, labelY);
    ctx.restore();
  }

  drawRaceSlotMachine(ctx, racer, def, rect, racerIndex, time, slotIndex = 0, slotCount = 1) {
    const slotGap = Math.max(6, rect.width * 0.008);
    const availableSlotWidth = (rect.width - Math.max(0, slotCount - 1) * slotGap) / Math.max(1, slotCount);
    const width = Math.min(
      rect.width * (slotCount > 1 ? 0.34 : 0.48),
      slotCount > 1 ? 300 : 375,
      availableSlotWidth,
    );
    const height = width * 0.42;
    const gap = Math.max(6, rect.height * 0.01);
    const x = racerIndex === 0
      ? rect.x + rect.width - (slotCount - slotIndex) * width - (slotCount - slotIndex - 1) * slotGap
      : rect.x + slotIndex * (width + slotGap);
    const y = racerIndex === 0 ? rect.y - height - gap : rect.y + rect.height + gap;
    const spinning = time < (racer.raceJackpotSpinUntil || 0);
    const cycle = ["unlucky", "medium", "lucky"];
    const slots = spinning
      ? [0, 1, 2].map((index) => cycle[(Math.floor(time * 24) + index) % cycle.length])
      : racer.raceJackpotSlots || ["neutral", "neutral", "neutral"];
    const multiplierBySlot = { unlucky: 0.5, medium: 2, lucky: 10 };
    const bodyWidth = width * 0.86;
    const bodyHeight = height;
    const machine = raceSprite("jackpotSlotMachine");
    const lever = raceSprite("jackpotSlotLever");
    const symbols = raceSprite("jackpotSlotSymbols");
    // Exact normalized bounds of the three white windows in the generated cabinet.
    const reelTop = y + bodyHeight * 0.31;
    const reelHeight = bodyHeight * 0.42;
    const reelStartX = x + bodyWidth * 0.203;
    const reelGap = bodyWidth * 0.027;
    const reelWidth = bodyWidth * 0.179;
    ctx.save();
    if (machine) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(machine, x, y, bodyWidth, bodyHeight);
    } else {
      ctx.fillStyle = "#8b1212";
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = Math.max(3, width * 0.014);
      ctx.fillRect(x, y, bodyWidth, bodyHeight);
      ctx.strokeRect(x, y, bodyWidth, bodyHeight);
    }
    if (!spinning && racer.raceJackpotTier === "bust") {
      ctx.save();
      ctx.globalAlpha = 0.38;
      ctx.fillStyle = "#e11d48";
      ctx.fillRect(x, y, bodyWidth, bodyHeight);
      ctx.restore();
    }
    slots.forEach((slotId, index) => {
      const reelX = reelStartX + index * (reelWidth + reelGap);
      ctx.save();
      ctx.beginPath();
      ctx.rect(reelX, reelTop, reelWidth, reelHeight);
      ctx.clip();
      ctx.fillStyle = spinning ? "#fff6b5" : "#ffffff";
      ctx.fillRect(reelX, reelTop, reelWidth, reelHeight);
      if (symbols) {
        const symbolIndex = cycle.indexOf(slotId);
        if (symbolIndex >= 0) {
          const sourceWidth = symbols.naturalWidth / 3;
          ctx.drawImage(
            symbols,
            symbolIndex * sourceWidth,
            0,
            sourceWidth,
            symbols.naturalHeight,
            reelX,
            reelTop,
            reelWidth,
            reelHeight,
          );
        }
      }
      if (!spinning && racer.raceJackpotTier === "jackpot") {
        ctx.save();
        ctx.globalAlpha = 0.32;
        ctx.fillStyle = `hsl(${(Math.round(time * 180) + index * 110) % 360} 100% 55%)`;
        ctx.fillRect(reelX, reelTop, reelWidth, reelHeight);
        ctx.restore();
      }
      const value = multiplierBySlot[slotId] ?? 1;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = Math.max(2, height * 0.025);
      ctx.font = `900 ${Math.max(11, reelHeight * 0.32)}px ${PIXEL_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.strokeText(`${formatRaceMultiplier(value)}×`, reelX + reelWidth / 2, reelTop + reelHeight - 1);
      ctx.fillText(`${formatRaceMultiplier(value)}×`, reelX + reelWidth / 2, reelTop + reelHeight - 1);
      ctx.restore();
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = Math.max(2, height * 0.022);
      ctx.strokeRect(reelX, reelTop, reelWidth, reelHeight);
    });
    const tier = racer.raceJackpotTier || "neutral";
    ctx.lineWidth = Math.max(3, height * 0.04);
    ctx.strokeStyle = tier === "jackpot"
      ? `hsl(${Math.round(time * 180) % 360} 95% 55%)`
      : tier === "bust" ? "#ef233c" : tier === "cash" ? "#ffd400" : "#080808";
    ctx.strokeRect(x, y, bodyWidth, bodyHeight);
    if (!spinning && tier === "bust") {
      ctx.font = `900 ${Math.max(14, height * 0.28)}px ${PIXEL_FONT}`;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#080808";
      ctx.textBaseline = "middle";
      ctx.strokeText("☠", x + bodyWidth * 0.075, y + bodyHeight * 0.5);
      ctx.fillText("☠", x + bodyWidth * 0.075, y + bodyHeight * 0.5);
      ctx.strokeText("☠", x + bodyWidth * 0.925, y + bodyHeight * 0.5);
      ctx.fillText("☠", x + bodyWidth * 0.925, y + bodyHeight * 0.5);
    }
    const spinProgress = spinning
      ? Math.max(0, Math.min(1, 1 - ((racer.raceJackpotSpinUntil - time) / 0.8)))
      : 0;
    const leverPull = spinning ? Math.sin(spinProgress * Math.PI) : 0;
    const leverHeight = bodyHeight * 0.95;
    const leverWidth = leverHeight * 0.47;
    const leverAnchorX = x + bodyWidth + leverWidth * 0.12;
    const leverAnchorY = y + bodyHeight * 0.86;
    ctx.save();
    ctx.translate(leverAnchorX, leverAnchorY);
    const pulledLeverHeight = leverHeight * (1 - leverPull * 0.58);
    if (lever) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(lever, -leverWidth * 0.5, -pulledLeverHeight, leverWidth, pulledLeverHeight);
    } else {
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = Math.max(4, leverWidth * 0.12);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -pulledLeverHeight * 0.72);
      ctx.stroke();
      ctx.fillStyle = "#ef233c";
      ctx.beginPath();
      ctx.arc(0, -pulledLeverHeight * 0.78, leverWidth * 0.22, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    const cooldown = Math.max(0, racer.raceJackpotCooldown || 0);
    const label = spinning
      ? "SPINNING"
      : `NEXT SPIN: ${cooldown.toFixed(1)}S`;
    ctx.font = `900 ${Math.max(12, rect.height * 0.033)}px ${PIXEL_FONT}`;
    ctx.textAlign = racerIndex === 0 ? "right" : "left";
    ctx.textBaseline = racerIndex === 0 ? "bottom" : "top";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#080808";
    ctx.fillStyle = def.color;
    const labelX = racerIndex === 0 ? x + width : x;
    const labelY = racerIndex === 0 ? y - 5 : y + height + 5;
    ctx.strokeText(label, labelX, labelY);
    ctx.fillText(label, labelX, labelY);
    ctx.restore();
  }

  drawRaceStats(ctx, racer, def, rect, racerIndex, slotIndex = 0, slotCount = 1, simTime = 0) {
    const berserkerHud = racer?.raceOrbId === "berserker";
    const absorberHud = racer?.raceOrbId === "roulette";
    const baseColor = raceHudColorForRacer(racer, def?.color || "#111111");
    const lines = absorberHud
      ? [
        raceDamageHudLineFor(racer)
          ? { text: raceDamageHudLineFor(racer), color: baseColor }
          : null,
        ...raceAbsorberCompactHudEntriesFor(racer, baseColor),
      ].filter(Boolean)
      : raceHudEntriesFor(racer, simTime)
        .filter((line) => !berserkerHud || !String(line?.text || "").startsWith("RAGE:"));
    const draftmasterHud = racer?.raceOrbId === "draftmaster";
    const artistsHud = racer?.raceOrbId === "artists";
    const columnWidth = rect.width * (slotCount > 1 ? 0.56 : 0.31);
    const anchorX = racerIndex === 0
      ? rect.x + slotIndex * columnWidth
      : rect.x + rect.width - (slotCount - 1 - slotIndex) * columnWidth;
    const anchorY = racerIndex === 0 ? rect.y - 15 : rect.y + rect.height + 14;
    const artistsBarWidth = Math.min(
      rect.width * (slotCount > 1 ? 0.22 : 0.34),
      slotCount > 1 ? 190 : 260,
    );
    const artistsTextMaxWidth = artistsHud
      ? Math.max(
        96,
        slotCount > 1
          ? columnWidth * 0.92
          : rect.width - artistsBarWidth - Math.max(14, rect.width * 0.03),
      )
      : null;
    const absorberTextMaxWidth = absorberHud
      ? rect.width * (slotCount > 1 ? 0.72 : 0.92)
      : null;
    const maxFontSize = Math.max(
      draftmasterHud || absorberHud ? 11 : 14,
      rect.height * (
        draftmasterHud
          ? 0.042
          : absorberHud
            ? 0.042
            : slotCount > 1 ? 0.047 : 0.065
      ),
    );
    ctx.save();
    ctx.font = `900 ${maxFontSize}px ${PIXEL_FONT}`;
    ctx.textAlign = racerIndex === 0 ? "left" : "right";
    ctx.textBaseline = racerIndex === 0 ? "bottom" : "top";
    ctx.lineWidth = draftmasterHud ? 3 : 4;
    ctx.strokeStyle = "#080808";
    lines.forEach((line, index) => {
      const spacing = rect.height * (
        draftmasterHud
          ? 0.045
          : absorberHud
            ? 0.045
            : slotCount > 1 ? 0.052 : 0.07
      );
      const y = racerIndex === 0 ? anchorY - (lines.length - 1 - index) * spacing : anchorY + index * spacing;
      if (artistsHud) {
        setFittedFont(
          ctx,
          line.text,
          artistsTextMaxWidth,
          900,
          maxFontSize,
          Math.max(10, Math.floor(maxFontSize * 0.55)),
          PIXEL_FONT,
        );
      } else if (absorberHud) {
        setFittedFont(
          ctx,
          line.text,
          absorberTextMaxWidth,
          900,
          maxFontSize,
          Math.max(10, Math.floor(maxFontSize * 0.5)),
          PIXEL_FONT,
        );
      }
      ctx.fillStyle = line.color || raceHudColorForRacer(racer, def?.color || "#111111");
      ctx.strokeText(line.text, anchorX, y);
      ctx.fillText(line.text, anchorX, y);
    });
    ctx.restore();
    if (berserkerHud) {
      this.drawRaceBerserkerRageBar(ctx, racer, rect, racerIndex, slotIndex, slotCount);
    }
  }

  drawRaceCheckerboard(
    ctx,
    x,
    y,
    width,
    height,
    requestedColumns = ORB_RACE_PRESENTATION.checkerColumns,
    squareTiles = false,
  ) {
    const columns = Math.max(
      1,
      Math.floor(Number(requestedColumns) || ORB_RACE_PRESENTATION.checkerColumns),
    );
    if (squareTiles) {
      const grid = raceLongformTournamentCheckerGridFor(width, height, columns);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
      for (let row = 0; row < grid.rows; row += 1) {
        for (let column = 0; column < grid.columns; column += 1) {
          ctx.fillStyle = (row + column) % 2 === 0 ? "#ffffff" : "#050505";
          ctx.fillRect(
            x + column * grid.tileSize,
            y + row * grid.tileSize,
            grid.tileSize,
            grid.tileSize,
          );
        }
      }
      ctx.restore();
      return;
    }
    const rows = Math.max(1, Math.round(columns * height / width));
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        ctx.fillStyle = (row + column) % 2 === 0 ? "#ffffff" : "#050505";
        ctx.fillRect(x + column * cellWidth, y + row * cellHeight, cellWidth + 0.5, cellHeight + 0.5);
      }
    }
    ctx.restore();
  }

  drawRaceIntegralArc(ctx, racer, rect, layerY, layerHeight) {
    const path = Array.isArray(racer.raceIntegralPath) ? racer.raceIntegralPath : [];
    if (path.length < 2) return;
    const baseline = layerY;
    const points = path.map((point) => ({
      x: rect.x + rect.width * Math.max(0, Math.min(1, Number(point.x) || 0)),
      y: rect.y + rect.height * Math.max(0, Math.min(1, Number(point.y) || 0)),
    }));
    const first = points[0];
    const last = points[points.length - 1];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(first.x, baseline);
    points.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.lineTo(last.x, baseline);
    ctx.lineTo(first.x, baseline);
    ctx.closePath();
    ctx.fillStyle = "#7b61ff44";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.strokeStyle = "#5a42d6";
    ctx.lineWidth = Math.max(3, rect.width * 0.004);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(first.x, baseline);
    ctx.lineTo(last.x, baseline);
    ctx.strokeStyle = "#08080899";
    ctx.lineWidth = Math.max(2, rect.width * 0.0025);
    ctx.stroke();
    ctx.restore();
  }

  drawRaceGodzillaBurns(ctx, racer, rect, layerIndex, layerY, layerHeight, time) {
    const burns = (racer.raceGodzillaBurns || []).filter((burn) => burn.layerIndex === layerIndex);
    if (!burns.length) return;
    const fire = raceSprite("godzillaBurn");
    if (!fire) return;
    for (const burn of burns) {
      const remaining = Math.max(0, burn.until - time);
      const fade = Math.min(1, remaining / 0.7, (10 - remaining) / 0.3 + 0.01);
      const width = rect.width * 0.42;
      const height = Math.max(24, layerHeight * 0.5);
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(0.92, fade * (0.82 + Math.sin(time * 9) * 0.08)));
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        fire,
        rect.x + rect.width * 0.5 - width * 0.5,
        layerY - height * 0.72,
        width,
        height,
      );
      ctx.restore();
    }
  }

  drawRaceGodzillaDownwardBreath(ctx, racer, x, feetY, radius, time, rect, spriteY, spriteHeight, direction) {
    const beam = raceSprite("godzillaBreath");
    if (!beam) return;
    const mouthX = x + direction * spriteHeight * 0.27;
    const mouthY = spriteY - spriteHeight * 0.23;
    const groundY = Math.min(rect.y + rect.height, feetY + radius * 0.08);
    const topY = mouthY + spriteHeight * 0.04;
    const beamHeight = Math.max(radius * 2.2, groundY - topY + radius * 0.22);
    const beamWidth = Math.max(radius * 1.16, Math.min(rect.width * 0.075, radius * 1.8));
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    ctx.globalAlpha = Math.max(0.76, Math.min(1, 0.88 + Math.sin(time * 24) * 0.08));
    ctx.imageSmoothingEnabled = false;
    ctx.shadowColor = "#16c8ff";
    ctx.shadowBlur = Math.max(4, radius * 0.55);
    ctx.drawImage(beam, mouthX - beamWidth * 0.5, topY, beamWidth, beamHeight);
    ctx.restore();
  }

  drawRaceGodzilla(ctx, racer, x, feetY, radius, time, rect) {
    const animationV2 = raceSprite("godzillaAnimationV2");
    const animation = animationV2 || raceSprite("godzillaAnimation");
    if (!animation) {
      this.drawRaceGodzillaLegacy(ctx, racer, x, feetY, radius, time, rect);
      return;
    }

    const phase = racer.raceGodzillaAbilityPhase || "idle";
    const attackKind = time < (racer.raceGodzillaAttackUntil || 0)
      ? racer.raceGodzillaAttackKind
      : "none";
    const falling = racer.raceGodzillaFalling === true;
    const direction = racer.raceGodzillaDirection < 0 ? -1 : 1;
    const attackDuration = 0.86;
    const attackProgress = attackKind !== "none"
      ? Math.max(0, Math.min(1, 1 - ((racer.raceGodzillaAttackUntil - time) / attackDuration)))
      : 0;
    let row = 0;
    let frame = falling ? 0 : Math.floor(
      time * 7.5 + (Number(racer.raceGodzillaWalkCycleOffset) || 0),
    ) % 4;
    if (attackKind === "tail") {
      row = 1;
      frame = Math.min(3, Math.floor(attackProgress * 4));
    } else if (attackKind === "stomp") {
      row = 2;
      frame = Math.min(3, Math.floor(attackProgress * 4));
    } else if (phase !== "idle") {
      // V2's fourth row is explicitly ground-facing. The legacy sheet's
      // fallback is still paired with the standalone vertical beam below.
      row = 3;
      const phaseDuration = phase === "look-up"
        ? 0.8
        : phase === "charge"
          ? 1.25
          : phase === "bend"
            ? 0.7
            : 5;
      const phaseProgress = Math.max(
        0,
        Math.min(1, 1 - ((racer.raceGodzillaAbilityPhaseUntil - time) / phaseDuration)),
      );
      frame = phase === "look-up"
        ? Math.min(1, Math.floor(phaseProgress * 2))
        : phase === "fire"
          ? 2
          : Math.min(2, 1 + Math.floor(phaseProgress * 2));
    }

    const spriteHeight = Math.max(radius * 5.35, rect.height * 0.22);
    const spriteWidth = spriteHeight * (animation.naturalWidth / 4) / (animation.naturalHeight / 4);
    const bottomRatio = 0.94;
    const spriteY = feetY - spriteHeight * (bottomRatio - 0.5);
    const charging = phase === "charge" || phase === "bend" || phase === "fire";
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    if (charging) {
      ctx.shadowColor = "#20d9ff";
      ctx.shadowBlur = Math.max(5, radius * (0.8 + Math.sin(time * 18) * 0.14));
    }
    ctx.translate(x, 0);
    ctx.scale(direction, 1);
    this.drawRaceSheetGridCell(
      ctx,
      animation,
      frame,
      row,
      4,
      4,
      0,
      spriteY,
      spriteWidth,
      spriteHeight,
      0,
      1,
    );
    ctx.restore();

    if (!animationV2 && phase === "fire" && (racer.raceGodzillaBreathDirection || "down") === "down") {
      this.drawRaceGodzillaDownwardBreath(
        ctx,
        racer,
        x,
        feetY,
        radius,
        time,
        rect,
        spriteY,
        spriteHeight,
        direction,
      );
    }
  }

  drawRaceGodzillaLegacy(ctx, racer, x, feetY, radius, time, rect) {
    const head = raceSprite("godzillaHead");
    const body = raceSprite("godzillaBody");
    const tail = raceSprite("godzillaTail");
    const leftLeg = raceSprite("godzillaLeftLeg");
    const rightLeg = raceSprite("godzillaRightLeg");
    if (!head || !body || !tail || !leftLeg || !rightLeg) return;

    const phase = racer.raceGodzillaAbilityPhase || "idle";
    const attackKind = time < (racer.raceGodzillaAttackUntil || 0)
      ? racer.raceGodzillaAttackKind
      : "none";
    const attackDuration = 0.86;
    const attackProgress = attackKind !== "none"
      ? Math.max(0, Math.min(1, 1 - ((racer.raceGodzillaAttackUntil - time) / attackDuration)))
      : 0;
    const attackCurve = Math.sin(attackProgress * Math.PI);
    const walking = phase === "idle" && attackKind === "none" && !racer.raceGodzillaFalling;
    const walk = walking ? Math.sin(time * TAU / 1.44) : 0;
    const direction = racer.raceGodzillaDirection || (racer.raceVx < 0 ? -1 : 1);
    const bodyLift = walking ? Math.abs(walk) * radius * 0.1 : 0;
    const charging = phase === "charge";
    const firing = phase === "fire";
    const bending = phase === "bend" || firing;
    const lookUp = phase === "look-up";
    const glowPulse = charging || firing ? 0.75 + Math.sin(time * 18) * 0.22 : 0;
    // Keep every part on a shared, non-rotating skeleton. The head is shifted
    // with the torso during charge/bend, and the tail is translated around an
    // overlapping socket; neither can swing away and reveal a gap.
    const bodyDrop = bending ? radius * 0.34 : -bodyLift;
    const tailSwing = attackKind === "tail" ? attackCurve : walk * 0.18;
    const stride = walking ? Math.sin(time * TAU / 1.44) : 0;
    const headShiftX = (lookUp ? -0.12 : bending ? 0.08 : 0) * radius;
    const headShiftY = (lookUp ? -0.08 : bending ? 0.16 : 0) * radius + bodyDrop;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    ctx.translate(x, feetY);
    ctx.scale(direction, 1);
    ctx.imageSmoothingEnabled = false;
    if (charging || firing) {
      ctx.shadowColor = "#25dcff";
      ctx.shadowBlur = radius * (0.7 + glowPulse * 0.9);
      ctx.filter = `brightness(${1.18 + glowPulse * 0.55}) saturate(${1.25 + glowPulse})`;
    }

    ctx.save();
    ctx.translate(-radius * 1.36 + tailSwing * radius * 0.13, -radius * 3.55 + bodyDrop);
    ctx.drawImage(tail, -radius * 0.05, -radius * 0.58, radius * 4.95, radius * 2.15);
    ctx.restore();

    const legSize = radius * 2.38;
    const leftLegBottomRatio = 1139 / 1254;
    const rightLegBottomRatio = 1177 / 1254;
    const drawPlantedLeg = (sprite, offsetX, bottomRatio) => {
      const footBottom = -legSize * bottomRatio;
      ctx.drawImage(sprite, offsetX - legSize * 0.5, footBottom, legSize, legSize);
    };
    // Both feet are bottom-anchored to feetY. Stride is a smooth floor slide,
    // so stepping never lifts a foot off the number line or leaves a gap.
    ctx.save();
    drawPlantedLeg(leftLeg, -radius * (0.64 - stride * 0.13), leftLegBottomRatio);
    drawPlantedLeg(rightLeg, radius * (0.48 + stride * 0.13), rightLegBottomRatio);
    ctx.restore();

    ctx.save();
    ctx.translate(0, -radius * 3.1 + bodyDrop);
    ctx.drawImage(body, -radius * 1.7, -radius * 1.7, radius * 3.4, radius * 3.4);
    ctx.restore();

    ctx.save();
    // This full-image offset overlaps the torso's neck at every phase. The
    // look-up and bend poses are position changes, not free rotations.
    ctx.translate(headShiftX, headShiftY);
    ctx.drawImage(head, -radius * 0.18, -radius * 5.36, radius * 2.7, radius * 2.7);
    ctx.restore();
    ctx.filter = "none";
    ctx.shadowBlur = 0;
    ctx.restore();

    if (firing) {
      const beam = raceSprite("godzillaBreath");
      if (beam) {
        const mouthX = x + direction * radius * 1.5;
        const mouthY = feetY - radius * 4.05 + bodyDrop;
        const beamHeight = Math.max(radius * 2.1, feetY - mouthY + radius * 0.35);
        const beamWidth = Math.max(radius * 1.15, rect.width * 0.075);
        ctx.save();
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.clip();
        ctx.globalAlpha = 0.9 + Math.sin(time * 24) * 0.08;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          beam,
          mouthX - beamWidth * 0.5,
          mouthY,
          beamWidth,
          beamHeight,
        );
        ctx.restore();
      }
    }
    ctx.restore();
  }

    drawRaceOrb(ctx, racer, def, x, y, radius, time, rect) {
    if (racer.raceAntimatterOpponentDestroyed === true) {
      if ((racer.raceAntimatterDustEffects || []).length) {
        this.drawRaceAntimatterDustEffects(ctx, racer, rect, radius);
      }
      return;
    }
    if (
      (racer.raceDestroyedByHydrogenBomb
        || racer.raceDestroyedByTsarBomb
        || racer.raceDestroyedByAllInOne
        || racer.raceFinishExploded)
      && !(racer.raceAntimatterDustEffects || []).length
    ) return;
    if (racer.raceOrbId === "charger" && racer.raceChargerVisible === false) return;
    drawRaceCage(ctx, racer, x, y, radius, rect);
    if (racer.raceOrbId === "twins") {
      this.drawRaceTwinsOrb(ctx, racer, def, x, y, radius, time, rect);
      return;
    }
    if (racer.raceOrbId === "godzilla") {
      this.drawRaceGodzilla(ctx, racer, x, y, radius, time, rect);
      return;
    }
    if (racer.raceOrbId === "pancake") {
      this.drawRacePancakeOrb(ctx, racer, x, y, radius, time, rect);
      return;
    }
    if (racer.raceOrbId === "tree") {
      this.drawRaceTreeOrb(ctx, racer, x, y, radius, time);
      return;
    }
    if (racer.raceOrbId === "hacker") {
      this.drawRaceHackerOrb(ctx, racer, x, y, radius, rect, time);
      return;
    }
    if (racer.raceOrbId === "miner") {
      this.drawRaceMinerOrb(ctx, racer, x, y, radius, rect, time);
      return;
    }
    const copycatVisualId = racer.raceOrbId === "copycat"
      ? (racer.raceCopycatVisualOrbId || racer.raceCopycatActiveAbilityId)
      : null;
    const professorVisualId = racer.raceOrbId === "professor"
      ? (racer.raceProfessorRouletteVisualOrbId || racer.raceProfessorActiveOrbId)
      : null;
    const visualOrbId = professorVisualId || copycatVisualId;
    const visualDef = visualOrbId && ORB_RACERS[visualOrbId]
      ? ORB_RACERS[visualOrbId]
      : def;
    const visualRacer = visualOrbId && ORB_RACERS[visualOrbId]
      ? { ...racer, raceOrbId: visualOrbId }
      : racer;
    if (racer.raceOrbId === "batman" && racer.raceBatCapeUntil > time) {
      this.drawRaceBatWings(ctx, x, y, radius);
    }
    if (racer.raceOrbId === "magnet") {
      const pulse = 1 + Math.sin(time * 5) * 0.08;
      ctx.save();
      ctx.strokeStyle = `${def.accent}aa`;
      ctx.lineWidth = Math.max(2, radius * 0.11);
      for (let ring = 0; ring < 2; ring += 1) {
        ctx.beginPath();
        ctx.arc(x, y, radius * pulse * (1.35 + ring * 0.34), 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (raceHasAbility(racer, "gravity")) {
      const level = Math.max(0, racer.raceGravityLevel || 0);
      ctx.save();
      ctx.strokeStyle = def.accent;
      ctx.lineWidth = Math.max(2, radius * 0.1);
      for (let line = -1; line <= 1; line += 1) {
        const lineX = x + line * radius * 0.54;
        const length = radius * (0.45 + Math.min(1.2, level * 0.045));
        ctx.beginPath();
        ctx.moveTo(lineX, y - radius * 1.42);
        ctx.lineTo(lineX, y - radius * 1.42 + length);
        ctx.lineTo(lineX - radius * 0.13, y - radius * 1.42 + length - radius * 0.14);
        ctx.moveTo(lineX, y - radius * 1.42 + length);
        ctx.lineTo(lineX + radius * 0.13, y - radius * 1.42 + length - radius * 0.14);
        ctx.stroke();
      }
      ctx.restore();
    }
    const hasBlackHoleAbility = raceHasAbility(racer, "black-hole");
    if (hasBlackHoleAbility) this.drawRaceBlackHoleEffects(ctx, racer, rect, radius, time);
    this.drawRaceAbsorbedAbilityEffects(ctx, racer, rect, x, y, radius, time);
    if (hasBlackHoleAbility && racer.raceBlackHoleVisible === false) return;
    if (racer.raceOrbId === "blue-sun") this.drawRaceBlueSunLasers(ctx, racer, rect, x, y, radius, time);
    if (racer.raceOrbId === "purple-sun") this.drawRacePurpleSunBeam(ctx, racer, rect, x, y, radius, time);
    if (racer.raceOrbId === "phase-three-sun") this.drawRacePhaseThreeSunLasers(ctx, racer, rect, x, y, radius, time);
    if (racer.raceOrbId === "phase-two-sun") this.drawRacePhaseTwoSunLasers(ctx, racer, rect, x, y, radius, time);
    if (racer.raceOrbId === "snake") this.drawRaceSnakeTail(ctx, racer, def, rect, radius, time);
    if (racer.raceOrbId === "super-x-power") {
      this.drawRaceSuperXPowerRing(ctx, x, y, radius, time);
    }
    if (racer.raceOrbId === "draftmaster") {
      this.drawRaceDraftmasterCharacter(ctx, racer, x, y, radius);
      this.drawRaceDraftmasterOrbMask(ctx, racer, x, y, radius);
      this.drawRaceDraftmasterWeapons(ctx, racer, x, y, radius, time, rect);
      this.drawRaceDraftmasterUpgradeCallout(ctx, racer, x, y, radius, time);
      return;
    }
    if (racer.raceOrbId === "berserker") {
      this.drawRaceBerserkerFire(ctx, racer, x, y, radius, time);
    }
    if (["commander", "shrapnel", "roulette", "architect"].includes(racer.raceOrbId)) {
      this.drawRaceTacticalOrb(ctx, racer, x, y, radius, time, rect);
    } else if (racer.raceOrbId === "berserker") {
      this.drawRaceBerserkerOrb(ctx, racer, x, y, radius);
    } else {
      this.drawRaceOrbUnit(ctx, visualDef, x, y, radius, visualRacer, time);
    }
    if (racer.raceOrbId === "all-in-one" && racer.raceAllInOneActive) {
      const pulse = 1 + Math.sin(time * 10) * 0.035;
      ctx.save();
      ctx.globalAlpha = 0.78;
      ctx.strokeStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = Math.max(4, radius * 0.18);
      ctx.lineWidth = Math.max(2, radius * 0.075);
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.18 * pulse, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    if (racer.raceOrbId === "professor" && Number(racer.raceProfessorRouletteUntil) > time) {
      this.drawRaceProfessorRoulette(ctx, racer, x, y, radius, time);
    }
    if (racer.raceOrbId === "trifecta" && Number(racer.raceTrifectaShockwaveUntil) > time) {
      this.drawRaceTrifectaShockwave(ctx, racer, x, y, radius, time);
    }
    if (racer.raceOrbId === "gravitator") {
      this.drawRaceGravitatorField(ctx, racer, x, y, radius, time);
    }
    if (racer.raceOrbId === "rain") this.drawRaceRainOrb(ctx, racer, x, y, radius, rect, time);
    if (racer.raceOrbId === "hacker") this.drawRaceHackerOrb(ctx, racer, x, y, radius, rect, time);
    if (racer.raceOrbId === "miner") this.drawRaceMinerOrb(ctx, racer, x, y, radius, rect, time);
    if (racer.raceOrbId === "whirlwind") {
      this.drawRaceWhirlwindOrbiters(ctx, racer, x, y, radius, time);
    }
    if (racer.raceOrbId === "lag" && racer.raceLagGlitchActive) {
      this.drawRaceLagGlitchOverlay(ctx, racer, x, y, radius, time);
    }
    if (racer.raceOrbId === "berserker") {
      this.drawRaceBerserkerAxe(ctx, racer, x, y, radius, time);
      this.drawRaceBerserkerHorn(ctx, racer, x, y, radius, time);
    }
    // Mounted weapons sit on top of the orb body so their attachment and
    // slow idle rotation stay readable in the portrait render.
    this.drawRaceWeaponMount(ctx, visualRacer.raceOrbId, x, y, radius, time);
    this.drawRaceSniperWeapon(ctx, visualRacer, x, y, radius);
    if (racer.raceOrbId === "antimatter-bomb" || racer.raceOrbId === "time-bomb") {
      this.drawRaceBombEffects(ctx, racer, x, y, radius, rect, time);
    }
    if ((racer.raceAntimatterDustEffects || []).length) {
      this.drawRaceAntimatterDustEffects(ctx, racer, rect, radius);
    }
    for (const spawn of racer.raceRealitySpawns || []) {
      const spawnDef = ORB_RACERS[spawn.raceOrbId];
      if (!spawnDef) continue;
      const spawnRadius = radius * (Number(spawn.raceMiniScale) || 0.82);
      const spawnX = rect.x + (Number(spawn.raceX) || 0.5) * rect.width;
      const spawnY = rect.y + (Number(spawn.raceY) || 0.2) * rect.height;
      const progress = Math.max(0, Math.min(1, Number(spawn.raceSpawnProgress) || 0));
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#9ca3af";
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = Math.max(2, spawnRadius * 0.12);
      ctx.beginPath();
      ctx.arc(spawnX, spawnY, spawnRadius, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = progress;
      this.drawRaceOrbUnit(ctx, spawnDef, spawnX, spawnY, spawnRadius, spawn, time);
      ctx.restore();
    }
    const drawAttachedUnit = (unitX, unitY, unitRadius) => {
      if (racer.raceOrbId === "berserker") {
        this.drawRaceBerserkerOrb(ctx, racer, unitX, unitY, unitRadius);
      } else {
        this.drawRaceOrbUnit(ctx, def, unitX, unitY, unitRadius, racer, time);
      }
    };
    for (const duplicate of racer.raceDuplicateOrbs || []) {
      drawAttachedUnit(
        rect.x + duplicate.raceX * rect.width,
        rect.y + duplicate.raceY * rect.height,
        radius,
      );
    }
    for (const mini of racer.raceBouncerOrbs || []) {
      drawAttachedUnit(
        rect.x + mini.raceX * rect.width,
        rect.y + mini.raceY * rect.height,
        radius * (mini.raceMiniScale || 0.36),
      );
    }
    for (const snake of racer.raceSnakeOrbs || []) {
      drawAttachedUnit(
        rect.x + snake.raceX * rect.width,
        rect.y + snake.raceY * rect.height,
        radius,
      );
    }
    if (raceHasAbility(racer, "orbital")) {
      const orbiters = Math.max(0, Math.floor(Number(racer.raceOrbiters) || 0));
      if (orbiters > 0) {
        const ring = raceOrbitalOrbPosition(racer, 0, time);
        ctx.save();
        ctx.strokeStyle = `${def.color}99`;
        ctx.lineWidth = Math.max(2, radius * 0.1);
        ctx.beginPath();
        ctx.arc(x, y, ring.ringRadius * rect.width, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      for (let index = 0; index < orbiters; index += 1) {
        const position = raceOrbitalOrbPosition(racer, index, time);
        ctx.fillStyle = def.color;
        ctx.beginPath();
        ctx.arc(
          x + position.offsetX * rect.width,
          y + position.offsetY * rect.width,
          Math.max(2, radius * RACE_ORBITAL_SATELLITE_RADIUS_SCALE),
          0,
          TAU,
        );
        ctx.fill();
      }
    }
  }

  drawRaceSheetFrame(ctx, spriteId, frameCount, frameIndex, x, y, width, height, flip = false) {
    const sprite = raceSprite(spriteId);
    if (!sprite) return false;
    const sourceWidth = Number(sprite.naturalWidth || sprite.width) || 1;
    const sourceHeight = Number(sprite.naturalHeight || sprite.height) || 1;
    const frames = Math.max(1, Math.floor(Number(frameCount) || 1));
    const frameWidth = sourceWidth / frames;
    const index = Math.max(0, Math.min(frames - 1, Math.floor(Number(frameIndex) || 0)));
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(
      sprite,
      frameWidth * index,
      0,
      frameWidth,
      sourceHeight,
      -width / 2,
      -height / 2,
      width,
      height,
    );
    ctx.restore();
    return true;
  }

  drawRaceRainOrb(ctx, racer, x, y, radius, rect, time = 0) {
    const active = racer?.raceRainActive === true;
    const activeProgress = Math.max(0, Math.min(1, Number(racer?.raceRainElapsed) / 5));
    const nextStartAt = Number(racer?.raceRainNextStartAt);
    const rechargeProgress = Number.isFinite(nextStartAt)
      ? Math.max(0, Math.min(1, 1 - (nextStartAt - Number(time)) / 5))
      : 0;
    const progress = active ? activeProgress : rechargeProgress;
    const frame = active ? Math.min(3, Math.floor(activeProgress * 4)) : 0;
    // Rain is an arena hazard, not a hat that follows the orb. Keep the cloud
    // at a stable ceiling anchor so its falling field reads as one persistent
    // weather system while the Rain orb continues moving independently.
    const cloudX = rect.x + rect.width * 0.5;
    const cloudY = rect.y + rect.height * 0.12;
    const cloudWidth = radius * 7.65;
    const cloudHeight = radius * 3.75;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    if (active) {
      this.drawRaceSheetFrame(
        ctx,
        "rainCloudSheet",
        4,
        frame,
        cloudX,
        cloudY,
        cloudWidth,
        cloudHeight,
      );
    }
    const barWidth = Math.min(rect.width * 0.62, radius * 6.6);
    const barHeight = Math.max(5, radius * 0.16);
    const barY = cloudY + cloudHeight * 0.57;
    ctx.fillStyle = "rgba(4, 18, 38, 0.82)";
    ctx.fillRect(cloudX - barWidth * 0.5, barY, barWidth, barHeight);
    ctx.fillStyle = active ? "#51d9ff" : "#87b7d6";
    ctx.fillRect(cloudX - barWidth * 0.5, barY, barWidth * progress, barHeight);
    ctx.strokeStyle = "#d9f7ff";
    ctx.lineWidth = Math.max(1.5, radius * 0.035);
    ctx.strokeRect(cloudX - barWidth * 0.5, barY, barWidth, barHeight);
    ctx.restore();
  }

  drawRaceHackerChildOrb(ctx, child, ownerRadius, rect, time = 0) {
    const def = ORB_RACERS[child?.raceOrbId];
    if (!def) return;
    const childX = rect.x + (Number(child.raceX) || 0.5) * rect.width;
    const childY = rect.y + (Number(child.raceY) || 0.2) * rect.height;
    const sourceRadiusScale = Number(child.raceHackerSourceRadiusScale);
    const childRadius = ownerRadius * (
      Number.isFinite(sourceRadiusScale) && sourceRadiusScale > 0
        ? sourceRadiusScale
        : (Number(child.raceMiniScale) || 0.9)
    );
    const spawnProgress = child.raceRealitySpawn
      ? Math.max(0, Math.min(1, Number(child.raceSpawnProgress) || 0))
      : 1;
    const hydrogenExploded = child.raceHydrogenExploded === true;
    const explosionProgress = hydrogenExploded
      ? Math.max(0, Math.min(
        1,
        (Number(child.raceHydrogenExplosionElapsed) || 0) / 0.42,
      ))
      : 0;
    const renderRadius = childRadius * (hydrogenExploded
      ? Math.max(0.12, 1 - explosionProgress * 0.88)
      : 1);
    ctx.save();
    ctx.globalAlpha *= spawnProgress * (hydrogenExploded ? 1 - explosionProgress : 1);
    // Route every spawned child through the same special-orb renderer as its
    // source. This keeps weapon mounts, rings, timers, particles, and copied
    // UI in sync instead of maintaining a second incomplete visual switch.
    // A Hacker copying Hacker is the only recursive case; keep that one on the
    // guarded child-effects fallback.
    if (child.raceRealitySpawn && child.raceOrbId === "slammy") {
      // Reality/Hacker Slammys are real red Slammy orbs. Do not route them
      // through the Hacker carrier visual or its black pulse; only the
      // Slammy's own red impact treatment belongs on this child.
      const slammy = { ...child, raceAbilityIds: ["slammy"] };
      this.drawRaceOrbUnit(ctx, def, childX, childY, renderRadius, slammy, time);
      this.drawRaceAbsorbedAbilityEffects(ctx, slammy, rect, childX, childY, renderRadius, time);
    } else if (child.raceOrbId === "hacker") {
      this.drawRaceOrbUnit(ctx, def, childX, childY, renderRadius, child, time);
      this.drawRaceHackerChildEffects(ctx, child, childX, childY, childRadius, rect, time);
    } else {
      this.drawRaceOrb(ctx, child, def, childX, childY, renderRadius, time, rect);
    }
    const uiLines = ["copy", "hydrogen-bomb"].includes(child.raceHackerChildKind)
      ? []
      : raceHudEntriesFor(child, time).map((entry) => entry?.text || entry).filter(Boolean).slice(0, 3);
    if (!uiLines.length) {
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = `900 ${Math.max(8, childRadius * 0.2)}px ${PIXEL_FONT}`;
    ctx.lineWidth = Math.max(1.5, childRadius * 0.035);
    ctx.strokeStyle = "#080808";
    uiLines.forEach((line, index) => {
      const labelY = childY + childRadius * (1.22 + index * 0.26);
      ctx.fillStyle = index === 0 && child.raceHackerChildKind === "copy"
        ? "#ffd21a"
        : raceHudColorForRacer(child, def.color || "#ffffff");
      ctx.strokeText(line, childX, labelY);
      ctx.fillText(line, childX, labelY);
    });
    ctx.restore();
    ctx.restore();
  }

  drawRaceHackerChildEffects(ctx, child, x, y, radius, rect, time = 0) {
    const orbId = child?.raceOrbId;
    if (!orbId) return;
    this.drawRaceHackerChildSniperBullets(ctx, child, rect, radius);
    const def = ORB_RACERS[orbId];
    if (def) {
      this.drawRaceDrillProjectiles(ctx, child, def, rect, radius);
      this.drawRaceBatarangProjectiles(ctx, child, def, rect, radius);
      this.drawRaceBoomerangProjectiles(ctx, child, def, rect, radius);
      this.drawRaceMines(ctx, child, def, rect, radius);
      this.drawRaceGrappler(ctx, child, def, rect, radius);
    }
    this.drawRaceRicochetProjectiles(ctx, child, rect, radius);
    this.drawRaceSawbladeProjectiles(ctx, child, rect, radius);
    this.drawRaceTacticalEffects(ctx, child, rect, radius, time);
    this.drawRaceMeteorProjectiles(ctx, child, rect, radius);
    if (orbId === "sniper") this.drawRaceSniperWeapon(ctx, child, x, y, radius);
    if (orbId === "draftmaster") {
      this.drawRaceDraftmasterWeapons(ctx, child, x, y, radius, time, rect);
    }
    if (orbId === "ricochet" || orbId === "sawblade") {
      this.drawRaceWeaponMount(ctx, orbId, x, y, radius, time);
    }
    if (orbId === "blue-sun") this.drawRaceBlueSunLasers(ctx, child, rect, x, y, radius, time);
    if (orbId === "purple-sun") this.drawRacePurpleSunBeam(ctx, child, rect, x, y, radius, time);
    if (orbId === "phase-three-sun") this.drawRacePhaseThreeSunLasers(ctx, child, rect, x, y, radius, time);
    if (orbId === "phase-two-sun") this.drawRacePhaseTwoSunLasers(ctx, child, rect, x, y, radius, time);
    if (orbId === "super-x-power") this.drawRaceSuperXPowerRing(ctx, x, y, radius, time);
    if (orbId === "whirlwind") this.drawRaceWhirlwindOrbiters(ctx, child, x, y, radius, time);
    if (orbId === "lag" && child.raceLagGlitchActive) {
      this.drawRaceLagGlitchOverlay(ctx, child, x, y, radius, time);
    }
  }

  drawRaceHackerChildSniperBullets(ctx, child, rect, radius) {
    if (child?.raceOrbId !== "sniper") return;
    const sprite = raceSprite("sniperWeapons");
    if (!sprite) return;
    const source = sniperWeaponSourceRect(sprite.naturalWidth, sprite.naturalHeight, 1);
    for (const bullet of child.raceSniperBullets || []) {
      const bulletX = rect.x + (Number(bullet.x) || 0.5) * rect.width;
      const bulletY = rect.y + (Number(bullet.y) || 0.2) * rect.height;
      const size = Math.max(12, rect.width * (Number(bullet.radius) || 0.018) * 3.4);
      const width = size * 2.8;
      const height = width * source.height / Math.max(1, source.width);
      ctx.save();
      ctx.translate(bulletX, bulletY);
      ctx.rotate(Number.isFinite(Number(bullet.angle)) ? Number(bullet.angle) : Math.PI / 2);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        sprite,
        source.x,
        source.y,
        source.width,
        source.height,
        -width * 0.5,
        -height * 0.5,
        width,
        height,
      );
      ctx.restore();
    }
  }

  drawRaceHackerOrb(ctx, racer, x, y, radius, rect, time = 0) {
    const children = racer.raceHackerSpawnedOrbs || [];
    const slammyChildren = racer.raceRealitySpawns || [];
    const facing = Number(racer.raceHackerFacing) < 0 ? -1 : 1;
    // Hacker uses the generated forward hoodie frame while idle and the
    // generated computer-facing/typing frame during a hack. Only the typing
    // frame mirrors toward the selected target; the old standalone computer
    // sprite is never layered over the orb.
    const hacking = racer.raceHackerPhase === "typing";
    const frame = hacking ? 3 : 0;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    this.drawRaceSheetFrame(
      ctx,
      "hackerOrbSheet",
      4,
      frame,
      x,
      y,
      radius * 5.1,
      radius * 5.1,
      hacking && facing < 0,
    );
    this.drawRaceHackerCallout(ctx, racer, x, y, radius, time);
    this.drawRaceHackerHydrogenCallout(ctx, racer, x, y, radius);
    for (const child of children) {
      this.drawRaceHackerChildOrb(ctx, child, radius, rect, time);
    }
    for (const spawn of slammyChildren) {
      this.drawRaceHackerChildOrb(ctx, spawn, radius, rect, time);
    }
    if (!(racer.raceHackerSymbols || []).length && !children.length && !slammyChildren.length) {
      ctx.restore();
      return;
    }
    for (const symbol of racer.raceHackerSymbols || []) {
      const symbolX = rect.x + Number(symbol.x || 0.5) * rect.width;
      const symbolY = rect.y + Number(symbol.y || 0.2) * rect.height;
      const alpha = Math.max(0, 1 - (Number(symbol.age) || 0) / Math.max(0.1, Number(symbol.lifetime) || 2.8));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = symbol.color || racer.raceHackerOutcomeColor || "#39ff14";
      ctx.strokeStyle = "#041004";
      ctx.lineWidth = Math.max(1, radius * 0.025);
      ctx.font = `900 ${Math.max(10, radius * 0.35)}px ${PIXEL_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText(symbol.char || "0", symbolX, symbolY);
      ctx.fillText(symbol.char || "0", symbolX, symbolY);
    }
    ctx.restore();
  }

  drawRaceMinerOrb(ctx, racer, x, y, radius, rect, time = 0) {
    if (racer?.raceOrbId !== "miner") return;
    const drilling = racer.raceMinerState === "drill"
      && racer.raceMinerFallThrough !== true;
    const shovelFrame = racer.raceMinerAttached === true
      ? Math.floor(time * RACE_MINER_SHOVEL_FRAME_RATE) % 3
      : 0;
    const state = drilling
      ? 3 + (Math.floor(time * RACE_MINER_DRILL_FRAME_RATE) % 3)
      : shovelFrame;
    const bob = drilling ? Math.sin(time * RACE_MINER_DRILL_FRAME_RATE) * radius * 0.18 : 0;
    const shift = drilling ? Math.sin(time * RACE_MINER_DRILL_SHIFT_RATE) * radius * 0.16 : 0;
    // Frame changes and the horizontal jackhammer shift communicate constant
    // digging. Keep an attached Miner bottom-anchored; vertical bob would
    // visibly lift the drill/boots off the authoritative number-line surface.
    const planted = racer.raceMinerAttached === true || drilling;
    const verticalShift = planted ? 0 : bob;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    const sprite = raceSprite("minerJackhammerSheet");
    if (sprite) {
      const sourceCellWidth = Number(sprite.naturalWidth || sprite.width) / 6;
      const sourceHeight = Number(sprite.naturalHeight || sprite.height);
      const bounds = RACE_MINER_ALPHA_BOUNDS[state] || RACE_MINER_ALPHA_BOUNDS[0];
      const sourceScaleX = sourceCellWidth / 362;
      const sourceScaleY = sourceHeight / 724;
      const sourceX = state * sourceCellWidth + bounds.x * sourceScaleX;
      const sourceY = bounds.y * sourceScaleY;
      const sourceWidth = bounds.width * sourceScaleX;
      const sourceContentHeight = bounds.height * sourceScaleY;
      // Preserve the authored frame's aspect and existing visual scale while
      // cropping transparent padding. Attached Miner frames are bottom
      // anchored to the exact orb/layer contact point, so boots and drill
      // never float above or get cut by the number line.
      // The authored Miner is a tall character, not an orb-sized icon. Keep
      // its source aspect ratio intact while giving the complete shovel/drill
      // silhouette enough presence to read at portrait export scale.
      const contentHeight = radius * 8.8 * (bounds.height / 724);
      const contentWidth = contentHeight * sourceWidth / Math.max(1, sourceContentHeight);
      const layerY = y + radius;
      // The feet/drill tip sit exactly on the moving layer surface. The
      // simulation moves this surface downward as the drill removes the wall;
      // using it as the sprite's bottom edge keeps the Miner visibly planted
      // instead of sinking deep into or floating above the layer.
      const drawBottom = racer.raceMinerAttached
        ? layerY
        : drilling
          ? layerY
          : y + contentHeight * 0.5;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        sprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceContentHeight,
        x - contentWidth * 0.5 + shift,
        drawBottom - contentHeight + verticalShift,
        contentWidth,
        contentHeight,
      );
    }
    const progress = drilling
      ? Number(racer.raceMinerDrillProgress) || 0
      : Number(racer.raceMinerUpgradeProgress) || 0;
    const barWidth = Math.min(rect.width * 0.88, radius * 9);
    const barY = Math.max(rect.y + 5, y - radius * 4.8);
    const barHeight = Math.max(8, radius * 0.34);
    ctx.fillStyle = "rgba(10,10,10,0.82)";
    ctx.fillRect(x - barWidth / 2, barY, barWidth, barHeight);
    ctx.fillStyle = drilling ? "#39e6ff" : "#f4d35e";
    ctx.fillRect(x - barWidth / 2, barY, barWidth * Math.max(0, Math.min(1, progress)), barHeight);
    ctx.restore();
  }

  drawRaceBombEffects(ctx, racer, x, y, radius, rect, time = 0) {
    // The bomb bodies own their complete visual treatment. This hook remains
    // as a stable call site for future detonation effects but deliberately
    // does not paint a second ring or countdown over the orb face.
  }

  drawRaceAntimatterDustEffects(ctx, racer, rect, radius) {
    for (const effect of racer.raceAntimatterDustEffects || []) {
      const age = Math.max(0, Number(effect.age) || 0);
      const lifetime = Math.max(0.1, Number(effect.lifetime) || 1);
      const progress = Math.min(1, age / lifetime);
      const centerX = rect.x + (Number(effect.x) || 0.5) * rect.width;
      const centerY = rect.y + (Number(effect.y) || 0.5) * rect.height;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - progress);
      for (const particle of effect.particles || []) {
        const distance = Number(particle.speed) * age * rect.width;
        const size = Math.max(2, radius * Number(particle.size || 0.14));
        const px = centerX + Math.cos(Number(particle.angle) || 0) * distance;
        const py = centerY + Math.sin(Number(particle.angle) || 0) * distance + age * age * rect.height * 0.08;
        ctx.fillStyle = effect.color || "#ff5d8f";
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
      ctx.restore();
    }
  }

  drawRaceSuperXPowerRing(ctx, x, y, radius, time = 0) {
    ctx.save();
    ctx.strokeStyle = "#050509";
    ctx.lineWidth = Math.max(4, radius * 0.16);
    ctx.shadowColor = "#b98cff";
    ctx.shadowBlur = Math.max(3, radius * 0.16);
    ctx.beginPath();
    ctx.arc(x, y, radius * (1.17 + Math.sin(time * 2.4) * 0.012), 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#2a2535";
    ctx.lineWidth = Math.max(2, radius * 0.045);
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.27, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  drawRaceAbsorbedAbilityEffects(ctx, racer, rect, x, y, radius, time = 0) {
    const hasSpeed = raceHasAbility(racer, "speed");
    const hasSticky = raceHasAbility(racer, "sticky");
    const hasSlammy = raceHasAbility(racer, "slammy");
    if (!hasSpeed && !hasSticky && !hasSlammy) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    if (hasSpeed) {
      const direction = Number(racer?.raceVx) < 0 ? -1 : 1;
      const speed = Math.min(1.4, Math.max(0.45, Math.abs(Number(racer?.raceVx) || 0) * 0.7));
      ctx.save();
      ctx.globalAlpha = 0.55 + Math.sin(time * 15) * 0.1;
      ctx.strokeStyle = "#168cff";
      ctx.shadowColor = "#8ef0ff";
      ctx.shadowBlur = Math.max(5, radius * 0.28);
      ctx.lineCap = "round";
      for (let streak = 0; streak < 3; streak += 1) {
        const startX = x - direction * radius * (1.08 + streak * 0.34);
        const startY = y - radius * (0.48 - streak * 0.34);
        const length = radius * (0.8 + speed * 0.65);
        ctx.lineWidth = Math.max(2, radius * (0.07 - streak * 0.012));
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX - direction * length, startY - radius * 0.08);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (hasSticky && Number(racer?.raceStickyUntil) > time) {
      const layerY = rect.y + raceLayerLineYForRenderer(racer, racer.raceLayerIndex) * rect.height;
      const remaining = Math.max(0, racer.raceStickyUntil - time);
      const duration = Math.max(0.1, Number(racer.raceStickyDuration) || 0.1);
      const alpha = Math.max(0.38, Math.min(0.9, remaining / duration));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#ff8b20";
      ctx.shadowColor = "#ffe092";
      ctx.shadowBlur = Math.max(5, radius * 0.34);
      ctx.lineWidth = Math.max(4, radius * 0.2);
      ctx.beginPath();
      ctx.moveTo(x - radius * 1.35, layerY + radius * 0.22);
      ctx.quadraticCurveTo(x, layerY - radius * 0.18, x + radius * 1.35, layerY + radius * 0.22);
      ctx.stroke();
      ctx.fillStyle = "#ff8b20";
      for (let dot = -1; dot <= 1; dot += 1) {
        ctx.beginPath();
        ctx.arc(x + dot * radius * 0.78, layerY + radius * 0.18, Math.max(3, radius * 0.13), 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    if (hasSlammy) {
      const pulse = 0.86 + Math.sin(time * 12) * 0.12;
      ctx.save();
      ctx.globalAlpha = 0.62;
      ctx.strokeStyle = "#ef4444";
      ctx.shadowColor = "#fca5a5";
      ctx.shadowBlur = Math.max(5, radius * 0.3);
      ctx.lineWidth = Math.max(3, radius * 0.11);
      ctx.beginPath();
      ctx.arc(x, y, radius * (1.22 + pulse * 0.13), 0, TAU);
      ctx.stroke();
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = ray / 8 * TAU + time * 0.6;
        const inner = radius * 1.25;
        const outer = radius * (1.58 + pulse * 0.14);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
        ctx.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawRaceBlueSunLasers(ctx, racer, rect, x, y, radius, time) {
    if (!racer.raceBlueSunActive) return;
    const lasers = Array.isArray(racer.raceBlueSunLasers) ? racer.raceBlueSunLasers : [];
    if (!lasers.length) return;
    ctx.save();
    if (raceBlueSunLaserClipModeFor(racer) === "world") {
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.clip();
    }
    const longform = raceBlueSunLaserClipModeFor(racer) === "viewport";
    for (const laser of lasers) {
      const startX = rect.x + Number(laser.startX || 0) * rect.width;
      const startY = rect.y + Number(laser.startY || 0) * rect.height;
      const physicalEndX = rect.x + Number(laser.endX || 0) * rect.width;
      const physicalEndY = rect.y + Number(laser.endY || 0) * rect.height;
      const extendsThroughVirtualBarrier = longform
        && raceBlueSunLongformShouldExtendThroughBarrier(laser);
      const longformEnd = extendsThroughVirtualBarrier
        ? raceBlueSunLongformEndpointFor(
          x,
          y,
          physicalEndX,
          physicalEndY,
          racer.raceLongformViewportRect,
        )
        : { x: physicalEndX, y: physicalEndY };
      const endX = longformEnd.x;
      const endY = longformEnd.y;
      const physicalWallContact = !extendsThroughVirtualBarrier && (
        laser.hitLayer
        || laser.hitSurface === "top-wall"
        || laser.hitSurface === "side-wall"
      );
      ctx.save();
      clipRaceSunLaserToLayer(ctx, rect, laser);
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, "#00eaff");
      gradient.addColorStop(0.7, "#00a8ff");
      gradient.addColorStop(1, physicalWallContact ? "#e8ffff" : "rgba(0,234,255,0.7)");
      ctx.shadowColor = "#00eaff";
      ctx.shadowBlur = Math.max(8, radius * 0.5);
      ctx.strokeStyle = "#001318";
      ctx.lineWidth = Math.max(8, radius * 0.55);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.shadowBlur = Math.max(4, radius * 0.24);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(4, radius * 0.3);
      ctx.stroke();
      if (physicalWallContact) {
        ctx.shadowBlur = Math.max(7, radius * 0.4);
        ctx.fillStyle = laser.hitLayer ? "#e8ffff" : "rgba(0,234,255,0.7)";
        ctx.strokeStyle = "#00a8ff";
        ctx.lineWidth = Math.max(2, radius * 0.12);
        ctx.beginPath();
        ctx.arc(endX, endY, Math.max(5, radius * 0.34), 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawRacePhaseThreeSunLasers(ctx, racer, rect, x, y, radius, time) {
    if (!racer?.racePhaseThreeSunActive) return;
    const lasers = Array.isArray(racer.racePhaseThreeSunLasers) ? racer.racePhaseThreeSunLasers : [];
    if (!lasers.length) return;
    const scale = Math.max(1, Number(racer.racePhaseThreeSunLaserScale) || 1);
    ctx.save();
    if (raceBlueSunLaserClipModeFor(racer) === "world") {
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.clip();
    }
    const longform = raceBlueSunLaserClipModeFor(racer) === "viewport";
    for (const laser of lasers) {
      const startX = rect.x + Number(laser.startX || 0) * rect.width;
      const startY = rect.y + Number(laser.startY || 0) * rect.height;
      const physicalEndX = rect.x + Number(laser.endX || 0) * rect.width;
      const physicalEndY = rect.y + Number(laser.endY || 0) * rect.height;
      const extendsThroughVirtualBarrier = longform && raceBlueSunLongformShouldExtendThroughBarrier(laser);
      const longformEnd = extendsThroughVirtualBarrier
        ? raceBlueSunLongformEndpointFor(x, y, physicalEndX, physicalEndY, racer.raceLongformViewportRect)
        : { x: physicalEndX, y: physicalEndY };
      const endX = longformEnd.x;
      const endY = longformEnd.y;
      const physicalWallContact = !extendsThroughVirtualBarrier && (
        laser.hitLayer || laser.hitSurface === "top-wall" || laser.hitSurface === "side-wall"
      );
      ctx.save();
      clipRaceSunLaserToLayer(ctx, rect, laser);
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, "#fff59a");
      gradient.addColorStop(0.72, "#ffd21a");
      gradient.addColorStop(1, physicalWallContact ? "#fffbe0" : "rgba(255,210,26,0.76)");
      ctx.shadowColor = "#ffd21a";
      ctx.shadowBlur = Math.max(12, radius * 0.72 * Math.min(4, scale));
      ctx.strokeStyle = "#4a2800";
      ctx.lineWidth = Math.max(14, radius * 1.1 * scale);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.shadowBlur = Math.max(7, radius * 0.6 * Math.min(4, scale));
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(8, radius * 0.62 * scale);
      ctx.stroke();
      if (physicalWallContact) {
        ctx.shadowBlur = Math.max(10, radius * 0.55 * Math.min(4, scale));
        ctx.fillStyle = laser.hitLayer ? "#fffbe0" : "rgba(255,210,26,0.76)";
        ctx.strokeStyle = "#d8a800";
        ctx.lineWidth = Math.max(3, radius * 0.18 * scale);
        ctx.beginPath();
        ctx.arc(endX, endY, Math.max(7, radius * 0.48 * scale), 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawRacePhaseTwoSunLasers(ctx, racer, rect, x, y, radius, time) {
    if (!racer?.racePhaseTwoSunActive) return;
    const lasers = Array.isArray(racer.racePhaseTwoSunLasers) ? racer.racePhaseTwoSunLasers : [];
    if (!lasers.length) return;
    ctx.save();
    if (raceBlueSunLaserClipModeFor(racer) === "world") {
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.clip();
    }
    const longform = raceBlueSunLaserClipModeFor(racer) === "viewport";
    for (const laser of lasers) {
      const startX = rect.x + Number(laser.startX || 0) * rect.width;
      const startY = rect.y + Number(laser.startY || 0) * rect.height;
      const physicalEndX = rect.x + Number(laser.endX || 0) * rect.width;
      const physicalEndY = rect.y + Number(laser.endY || 0) * rect.height;
      const extendsThroughVirtualBarrier = longform && raceBlueSunLongformShouldExtendThroughBarrier(laser);
      const longformEnd = extendsThroughVirtualBarrier
        ? raceBlueSunLongformEndpointFor(x, y, physicalEndX, physicalEndY, racer.raceLongformViewportRect)
        : { x: physicalEndX, y: physicalEndY };
      const endX = longformEnd.x;
      const endY = longformEnd.y;
      const physicalWallContact = !extendsThroughVirtualBarrier && (
        laser.hitLayer || laser.hitSurface === "top-wall" || laser.hitSurface === "side-wall"
      );
      ctx.save();
      clipRaceSunLaserToLayer(ctx, rect, laser);
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, "#fff7c2");
      gradient.addColorStop(0.72, "#ff8a1f");
      gradient.addColorStop(1, physicalWallContact ? "#fff0c2" : "rgba(249,115,22,0.78)");
      ctx.lineCap = "round";
      ctx.shadowColor = "#f97316";
      ctx.shadowBlur = Math.max(10, radius * 0.62);
      ctx.strokeStyle = "#4a1d05";
      ctx.lineWidth = Math.max(12, radius * 0.95);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.shadowBlur = Math.max(6, radius * 0.42);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(7, radius * 0.55);
      ctx.stroke();
      if (physicalWallContact) {
        ctx.fillStyle = laser.hitLayer ? "#fff0c2" : "rgba(249,115,22,0.76)";
        ctx.strokeStyle = "#f97316";
        ctx.lineWidth = Math.max(2, radius * 0.14);
        ctx.beginPath();
        ctx.arc(endX, endY, Math.max(6, radius * 0.42), 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawRaceProfessorRoulette(ctx, racer, x, y, radius, time) {
    const ids = Array.isArray(racer?.raceProfessorRouletteOrbIds)
      ? racer.raceProfessorRouletteOrbIds
      : [];
    if (!ids.length) return;
    const startedAt = Number(racer.raceProfessorRouletteStartedAt) || time;
    const progress = Math.max(0, Math.min(1, (time - startedAt) / 1));
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = "#ffd21a";
    ctx.lineWidth = Math.max(2, radius * 0.08);
    ctx.setLineDash([radius * 0.18, radius * 0.1]);
    ctx.beginPath();
    ctx.arc(0, 0, radius * (1.42 + progress * 0.1), -Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.setLineDash([]);
    ids.forEach((id, index) => {
      const def = ORB_RACERS[id];
      if (!def) return;
      const angle = -Math.PI / 2 + index * TAU / ids.length + progress * TAU * 0.7;
      const miniRadius = Math.max(4, radius * 0.17);
      const miniX = Math.cos(angle) * radius * 1.55;
      const miniY = Math.sin(angle) * radius * 1.55;
      ctx.fillStyle = def.color || "#ffffff";
      ctx.strokeStyle = def.accent || "#111111";
      ctx.lineWidth = Math.max(1, radius * 0.035);
      ctx.beginPath();
      ctx.arc(miniX, miniY, miniRadius, 0, TAU);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  drawRaceTrifectaShockwave(ctx, racer, x, y, radius, time) {
    const remaining = Math.max(0, Number(racer.raceTrifectaShockwaveUntil) - time);
    const progress = 1 - Math.min(1, remaining / 0.9);
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = "#fbbf24";
    ctx.shadowColor = "#f59e0b";
    ctx.shadowBlur = Math.max(8, radius * 0.55);
    ctx.lineWidth = Math.max(3, radius * (0.18 - progress * 0.06));
    ctx.beginPath();
    ctx.arc(0, 0, radius * (0.7 + progress * 4.8), 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  drawRaceGravitatorField(ctx, racer, x, y, radius, time) {
    const pull = Math.max(0, Math.min(1, Number(racer?.raceGravitatorPullLevel) || 0));
    if (pull <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.28 + pull * 0.38;
    ctx.strokeStyle = "#c4b5fd";
    ctx.shadowColor = "#8b5cf6";
    ctx.shadowBlur = Math.max(8, radius * 0.5);
    ctx.lineWidth = Math.max(2, radius * 0.06);
    for (let ring = 0; ring < 3; ring += 1) {
      const wobble = Math.sin(time * 2.2 + ring) * radius * 0.08;
      ctx.beginPath();
      ctx.arc(0, 0, radius * (1.28 + ring * 0.32) + wobble, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRacePurpleSunBeam(ctx, racer, rect, x, y, radius, time = 0) {
    if (!racer?.racePurpleSunActive || !racer?.racePurpleSunBeam) return;
    const beam = racer.racePurpleSunBeam;
    const startX = rect.x + Number(beam.startX || 0.5) * rect.width;
    const startY = rect.y + Number(beam.startY || 0) * rect.height;
    const endX = rect.x + Number(beam.endX || 0.5) * rect.width;
    const endY = rect.y + Number(beam.endY || 0) * rect.height;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    const pulse = 1 + Math.sin((Number(time) || 0) * 8) * 0.035;
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, "#e879f9");
    gradient.addColorStop(0.62, "#c084fc");
    gradient.addColorStop(1, beam.hitLayer ? "#f5d0fe" : "#9333ea");
    ctx.lineCap = "round";
    ctx.shadowColor = "#c084fc";
    ctx.shadowBlur = Math.max(12, radius * 0.72);
    ctx.strokeStyle = "#25003c";
    ctx.lineWidth = Math.max(14, radius * 1.42 * pulse);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.shadowBlur = Math.max(7, radius * 0.38);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(9, radius * 0.98 * pulse);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  }

  drawRaceSnakeTail(ctx, racer, def, rect, radius, time = 0) {
    const drawTail = (orb) => {
      const path = Array.isArray(orb.raceSnakePath) ? orb.raceSnakePath : [];
      const count = Math.max(0, Math.floor(Number(orb.raceSnakeTailOrbs) || 0));
      if (!count || !path.length) return;
      for (let index = 0; index < count; index += 1) {
        const pathIndex = Math.max(0, path.length - 1 - (index + 1) * 5);
        const point = path[pathIndex];
        const tailRadius = Math.max(2.5, radius * RACE_SNAKE_TAIL_RADIUS_SCALE);
        const phase = (Number(time) || 0) * RACE_SNAKE_TAIL_WIGGLE_SPEED
          - index * 0.9
          + (Number(orb.raceSnakeSequence) || 0) * 0.7;
        const wiggleY = Math.sin(phase) * RACE_SNAKE_TAIL_WIGGLE_AMPLITUDE;
        const wiggleX = Math.cos(phase * 0.92) * RACE_SNAKE_TAIL_WIGGLE_DRIFT;
        const pointX = Math.max(0, Math.min(1, point.x + wiggleX));
        const pointY = point.y + wiggleY;
        ctx.fillStyle = "#080808";
        ctx.beginPath();
        ctx.arc(rect.x + pointX * rect.width, rect.y + pointY * rect.height, tailRadius + 1.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = def.color;
        ctx.beginPath();
        ctx.arc(rect.x + pointX * rect.width, rect.y + pointY * rect.height, tailRadius, 0, TAU);
        ctx.fill();
      }
    };
    drawTail(racer);
    (racer.raceSnakeOrbs || []).forEach(drawTail);
  }

  drawRaceBlackHoleEffects(ctx, racer, rect, radius, time = 0) {
    const centerX = rect.x + rect.width * 0.5;
    const centerY = rect.y + rect.height * (
      ORB_RACE_PRESENTATION.orbChamberFraction + ORB_RACE_PRESENTATION.layerStackFraction * 0.5
    );
    const marks = racer.raceBlackHoleTeleportMarks || [];
    const teleport = raceSprite("blackHoleTeleport");
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    for (const mark of marks) {
      const progress = Math.max(0, Math.min(1, mark.age / 1.2));
      const alpha = (1 - progress) * 0.82;
      if (!teleport) continue;
      const markSize = radius * (2.1 + progress * 0.9);
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        teleport,
        rect.x + mark.x * rect.width - markSize * 0.5,
        rect.y + mark.y * rect.height - markSize * 0.5,
        markSize,
        markSize,
      );
    }
    ctx.globalAlpha = 1;
    if (racer.raceBlackHoleActive) {
      const layerCount = Math.max(1, racer.raceLayerHealth?.length || 3);
      const layerHeight = ORB_RACE_PRESENTATION.layerStackFraction / layerCount;
      for (let layerIndex = 0; layerIndex < layerCount; layerIndex += 1) {
        const layerHealth = Math.max(0, Number(racer.raceLayerHealth?.[layerIndex]) || 0);
        if (layerHealth <= 0) continue;
        const lineY = rect.y + rect.height * (
          ORB_RACE_PRESENTATION.orbChamberFraction + layerHeight * (layerIndex + 0.5)
        );
        const digits = formatOrbRaceNumber(layerHealth).replace(/,/g, "") || "0";
        for (const side of [-1, 1]) {
          for (let trailIndex = 0; trailIndex < 5; trailIndex += 1) {
            const phase = (time * 0.38 + layerIndex * 0.19 + trailIndex * 0.17 + (side > 0 ? 0.47 : 0)) % 1;
            const progress = Math.max(0, Math.min(1, phase));
            const xNorm = side < 0 ? 0.04 + progress * 0.43 : 0.96 - progress * 0.43;
            const x = rect.x + xNorm * rect.width;
            const y = lineY + Math.sin(time * 4 + trailIndex * 1.7 + layerIndex) * rect.height * 0.008 * (1 - progress);
            const size = Math.max(11, radius * (0.48 + progress * 1.05));
            const digitIndex = (Math.floor(time * 8 + trailIndex + layerIndex * 3) + trailIndex) % digits.length;
            const digit = digits[digitIndex];
            ctx.save();
            ctx.globalAlpha = Math.max(0.16, 0.86 - progress * 0.74);
            ctx.font = `900 ${size}px ${PIXEL_FONT}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineWidth = Math.max(1.5, size * 0.08);
            ctx.strokeStyle = "#080808";
            ctx.fillStyle = "#d45cff";
            ctx.strokeText(digit, x, y);
            ctx.fillText(digit, x, y);
            ctx.restore();
          }
        }
      }
    }
    ctx.restore();
  }

  drawRaceSheetCell(ctx, sprite, cellIndex, cellCount, x, y, width, height = width, rotation = 0, alpha = 1) {
    if (!sprite) return;
    const sourceWidth = sprite.naturalWidth / cellCount;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(
      sprite,
      cellIndex * sourceWidth,
      0,
      sourceWidth,
      sprite.naturalHeight,
      -width * 0.5,
      -height * 0.5,
      width,
      height,
    );
    ctx.restore();
  }

  drawRaceSheetGridCell(
    ctx,
    sprite,
    column,
    row,
    columns,
    rows,
    x,
    y,
    width,
    height = width,
    rotation = 0,
    alpha = 1,
  ) {
    if (!sprite) return;
    const sourceWidth = sprite.naturalWidth / columns;
    const sourceHeight = sprite.naturalHeight / rows;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(
      sprite,
      Math.max(0, Math.min(columns - 1, column)) * sourceWidth,
      Math.max(0, Math.min(rows - 1, row)) * sourceHeight,
      sourceWidth,
      sourceHeight,
      -width * 0.5,
      -height * 0.5,
      width,
      height,
    );
    ctx.restore();
  }

  drawRaceTacticalOrb(ctx, racer, x, y, radius, time = 0, rect = null) {
    const id = racer.raceOrbId;
    const spriteId = id === "commander" ? "commanderTactical"
      : id === "shrapnel" ? "shrapnelTactical"
      : id === "roulette" ? "rouletteTactical"
      : "architectTactical";
    const sprite = raceSprite(spriteId);
    // Absorber's standalone roulette wheel is intentionally not rendered.
    // Its identity comes from the pink core, absorbed-color ring, and the
    // actual orb visuals orbiting it after each absorption.
    const orbSprite = id === "roulette" ? null : raceSprite(`${id}Orb`);
    const cellCount = id === "commander" ? 5 : id === "architect" ? 6 : 4;
    const def = ORB_RACERS[id];
    const absorbedBlackHoleActive = id === "roulette"
      && raceHasAbility(racer, "black-hole")
      && racer.raceBlackHoleActive === true;
    ctx.save();
    ctx.fillStyle = def?.color || "#243b7a";
    ctx.strokeStyle = "#050505";
    ctx.lineWidth = Math.max(2.5, radius * 0.13);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    if (id === "roulette") {
      this.drawRaceAbsorberColorRing(ctx, racer, x, y, radius, time);
    }

    if (absorbedBlackHoleActive) {
      // During the singularity window Absorber temporarily takes on the
      // actual Black Hole body, while its pink ring and absorbed badges remain
      // visible as the owner/ability history.
      this.drawRaceOrbUnit(ctx, ORB_RACERS["black-hole"], x, y, radius, racer, time);
    } else if (id === "commander" && orbSprite) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(orbSprite, x - radius * 1.16, y - radius * 1.16, radius * 2.32, radius * 2.32);
      ctx.restore();
    } else if (id === "commander") {
      this.drawRaceSheetCell(ctx, sprite, 0, cellCount, x, y, radius * 2.7, radius * 2.7);
    } else if (id === "roulette") {
      this.drawRaceAbsorberCore(ctx, x, y, radius, time);
    } else if (orbSprite) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(orbSprite, x - radius * 1.16, y - radius * 1.16, radius * 2.32, radius * 2.32);
      ctx.restore();
    } else {
      this.drawRaceTacticalSimpleOrb(ctx, id, x, y, radius, time);
    }

    if (id === "shrapnel") {
      this.drawRaceShrapnelCracks(ctx, x, y, radius);
    } else if (id === "architect") {
      this.drawRaceArchitectHammer(ctx, x, y, radius, time);
    }

    if (id === "commander") {
      for (let index = 0; index < 2; index += 1) {
        const position = raceCommanderDronePosition(racer, index, time);
        const droneX = rect ? rect.x + position.x * rect.width : x;
        const droneY = rect ? rect.y + position.y * rect.height : y - radius * 1.8;
        const tilt = Math.sin(time * 2.2 + index * Math.PI) * 0.08;
        const visualScale = 3;
        if (sprite) {
          this.drawRaceSheetCell(
            ctx,
            sprite,
            index + 1,
            5,
            droneX,
            droneY,
            radius * 1.38 * visualScale,
            radius * 1.16 * visualScale,
            tilt,
          );
        } else {
          ctx.save();
          ctx.fillStyle = index === 0 ? "#e11d48" : "#168cff";
          ctx.strokeStyle = "#080808";
          ctx.lineWidth = Math.max(2, radius * 0.09);
          ctx.beginPath();
          ctx.arc(droneX, droneY, radius * 0.68 * visualScale, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }
    } else if (id === "roulette") {
      this.drawRaceAbsorberBadges(ctx, racer, x, y, radius, time);
      this.drawRaceRouletteAbsorption(ctx, racer, x, y, radius, time);
    } else if (id === "architect" && racer.raceArchitectPendingType) {
      const start = Number(racer.raceArchitectBuildStartedAt) || time;
      const progress = Math.max(0, Math.min(1, (time - start) / 1.5));
      const frame = Math.floor(progress * 8) % 2 ? 1 : 2;
      this.drawRaceSheetCell(
        ctx,
        sprite,
        frame,
        6,
        x + radius * 1.2,
        y - radius * 1.25,
        radius * 2.1,
        radius * 2.1,
        Math.sin(progress * Math.PI * 8) * 0.24,
      );
    }
  }

  drawRaceTacticalSimpleOrb(ctx, id, x, y, radius, time = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = id === "shrapnel" ? "#ff7a00" : id === "architect" ? "#ffd21a" : "#f026c8";
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = Math.max(2, radius * 0.12);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.96, 0, TAU);
    ctx.fill();
    ctx.stroke();
    if (id === "roulette") {
      ctx.strokeStyle = "#ffd24a";
      ctx.lineWidth = Math.max(2, radius * 0.08);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.7, 0, TAU);
      ctx.stroke();
      for (let slot = 0; slot < 12; slot += 1) {
        const angle = slot / 12 * TAU + time * 0.35;
        ctx.strokeStyle = slot % 2 ? "#151515" : "#f04444";
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * radius * 0.08, Math.sin(angle) * radius * 0.08);
        ctx.lineTo(Math.cos(angle) * radius * 0.68, Math.sin(angle) * radius * 0.68);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffd24a";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.14, 0, TAU);
      ctx.fill();
    } else if (id === "architect") {
      this.drawRaceArchitectHammer(ctx, 0, 0, radius, time, true);
    } else {
      this.drawRaceShrapnelCracks(ctx, 0, 0, radius, true);
    }
    ctx.restore();
  }

  drawRaceAbsorberCore(ctx, x, y, radius, time = 0) {
    const pulse = 0.76 + Math.sin(time * 4.8) * 0.06;
    ctx.save();
    ctx.strokeStyle = "#ffd1ed";
    ctx.lineWidth = Math.max(2, radius * 0.075);
    ctx.globalAlpha = 0.86;
    ctx.beginPath();
    ctx.arc(x, y, radius * pulse, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "#fff1fa";
    ctx.shadowColor = "#ff2aa6";
    ctx.shadowBlur = Math.max(5, radius * 0.26);
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.13, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawRaceShrapnelCracks(ctx, x, y, radius, local = false) {
    ctx.save();
    if (!local) ctx.translate(x, y);
    ctx.strokeStyle = "#4a1b08";
    ctx.lineWidth = Math.max(2, radius * 0.07);
    ctx.lineCap = "round";
    const cracks = [
      [[-0.62, -0.2], [-0.25, -0.06], [-0.08, -0.34], [0.16, -0.21]],
      [[0.58, 0.2], [0.3, 0.08], [0.12, 0.32], [-0.03, 0.26]],
      [[-0.16, 0.65], [-0.08, 0.34], [0.18, 0.2]],
    ];
    for (const crack of cracks) {
      ctx.beginPath();
      crack.forEach(([pointX, pointY], index) => {
        if (index === 0) ctx.moveTo(radius * pointX, radius * pointY);
        else ctx.lineTo(radius * pointX, radius * pointY);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRaceArchitectHammer(ctx, x, y, radius, time = 0, local = false) {
    ctx.save();
    if (!local) ctx.translate(x, y);
    ctx.rotate(-0.18 + Math.sin(time * 2.2) * 0.025);
    ctx.lineCap = "round";
    ctx.strokeStyle = "#4a2a12";
    ctx.lineWidth = Math.max(3, radius * 0.12);
    ctx.beginPath();
    ctx.moveTo(radius * 0.02, -radius * 0.1);
    ctx.lineTo(radius * 0.25, radius * 0.66);
    ctx.stroke();
    ctx.fillStyle = "#ff9f1c";
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = Math.max(2, radius * 0.07);
    ctx.beginPath();
    ctx.roundRect(
      -radius * 0.58,
      -radius * 0.35,
      radius * 1.16,
      radius * 0.34,
      radius * 0.08,
    );
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawRaceAbsorberColorRing(ctx, racer, x, y, radius, time = 0) {
    const colors = raceAbsorberColorsFor(racer);
    const ringColors = colors.length ? colors : [ORB_RACERS.roulette?.color || "#ff2aa6"];
    const ringRadius = radius * 1.17;
    const rotation = time * 0.18;
    ctx.save();
    ctx.lineCap = "butt";
    ctx.lineWidth = Math.max(7, radius * 0.18);
    ctx.strokeStyle = "#080808";
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, TAU);
    ctx.stroke();
    const gap = Math.min(0.035, 0.008 + 0.003 * ringColors.length);
    ringColors.forEach((color, index) => {
      const start = rotation + index / ringColors.length * TAU + gap;
      const end = rotation + (index + 1) / ringColors.length * TAU - gap;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = Math.max(5, radius * 0.18);
      ctx.beginPath();
      ctx.arc(x, y, ringRadius, start, end);
      ctx.stroke();
    });
    ctx.restore();
  }

  drawRaceAbsorberBadges(ctx, racer, x, y, radius, time = 0) {
    const sourceIds = raceAbsorberSourceIdsFor(racer).slice(0, 8);
    if (!sourceIds.length) return;
    const badgeRadius = Math.max(6, radius * 0.23);
    const orbitRadius = radius * 1.48;
    ctx.save();
    sourceIds.forEach((sourceId, index) => {
      const source = ORB_RACERS[sourceId] || ORB_RACERS.speed;
      const angle = time * 0.22 + index / sourceIds.length * TAU - Math.PI / 2;
      const badgeX = x + Math.cos(angle) * orbitRadius;
      const badgeY = y + Math.sin(angle) * orbitRadius;
      // Render the source through its real orb renderer. This keeps an
      // absorbed Meteor visibly meteor-shaped instead of turning every
      // ability into a generic colored letter badge.
      ctx.save();
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, TAU);
      ctx.clip();
      this.drawRaceOrbUnit(
        ctx,
        source,
        badgeX,
        badgeY,
        badgeRadius * 0.9,
        {
          raceOrbId: sourceId,
          raceAbilityIds: [sourceId],
          raceReactorCharge: sourceId === "reactor" ? racer.raceReactorCharge : 0,
          raceSnowballRotation: time * 2,
        },
        time,
      );
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = Math.max(2, badgeRadius * 0.18);
      ctx.shadowColor = source.color || "#ff2aa6";
      ctx.shadowBlur = Math.max(4, badgeRadius * 0.45);
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, TAU);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }

  drawRaceRouletteAbsorption(ctx, racer, x, y, radius, time = 0) {
    if (!(Number(racer?.raceRouletteAbsorbingUntil) > time)) return;
    const remaining = Math.max(0, racer.raceRouletteAbsorbingUntil - time);
    const duration = 1.2;
    const progress = 1 - Math.min(1, remaining / duration);
    const sourceId = racer.raceRouletteAbsorbedOrbId
      || racer.raceRouletteAbsorbedOrbHistory?.at(-1)
      || "speed";
    const sourceDef = ORB_RACERS[sourceId] || ORB_RACERS.speed;
    const sourceX = x + radius * 4.5 * (1 - progress);
    const sourceY = y - radius * 2.7 * (1 - progress) + Math.sin(time * 10) * radius * 0.12;
    const sourceRadius = radius * (1.65 - progress * 0.88);
    const suctionRadius = radius * (1.85 + Math.sin(time * 12) * 0.1);
    ctx.save();
    ctx.globalAlpha = 0.86;
    ctx.strokeStyle = sourceDef.accent || sourceDef.color || "#ffd24a";
    ctx.lineWidth = Math.max(3, radius * 0.1);
    ctx.shadowColor = sourceDef.color || "#f026c8";
    ctx.shadowBlur = Math.max(8, radius * 0.42);
    for (let ring = 0; ring < 3; ring += 1) {
      const ringRadius = suctionRadius * (1 + ring * 0.3);
      ctx.beginPath();
      ctx.arc(x, y, ringRadius, time * 2.2 + ring * 1.4, time * 2.2 + ring * 1.4 + Math.PI * 1.45);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.quadraticCurveTo(
      x + radius * 2.4,
      y - radius * 1.9,
      x,
      y,
    );
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = Math.max(0.2, 1 - progress * 0.55);
    this.drawRaceOrbUnit(
      ctx,
      sourceDef,
      sourceX,
      sourceY,
      sourceRadius,
      { raceOrbId: sourceId, raceSnowballRotation: time * 2 },
      time,
    );
    ctx.restore();
  }

  drawRaceShrapnelShardTrail(ctx, x, y, size, rotation, burst = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = burst ? 0.95 : 0.82;
    ctx.lineCap = "round";
    ctx.strokeStyle = burst ? "#fff7d6" : "#ffb347";
    ctx.lineWidth = Math.max(2, size * 0.12);
    ctx.shadowColor = "#ff7a00";
    ctx.shadowBlur = Math.max(6, size * 0.42);
    ctx.beginPath();
    ctx.moveTo(-size * 1.35, 0);
    ctx.lineTo(-size * 0.18, 0);
    ctx.stroke();
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#ff7a00";
    ctx.lineWidth = Math.max(1.5, size * 0.06);
    ctx.beginPath();
    ctx.moveTo(size * 0.98, 0);
    ctx.lineTo(-size * 0.16, -size * 0.4);
    ctx.lineTo(-size * 0.46, 0);
    ctx.lineTo(-size * 0.16, size * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawRaceCommanderProjectile(ctx, sprite, projectile, x, y, radius) {
    const missile = projectile.kind === "missile";
    const color = missile ? "#168cff" : "#ef233c";
    const rotation = Math.atan2(projectile.vy, projectile.vx) - Math.PI / 2;
    const width = radius * (missile ? 3.65 : 2.2);
    const height = radius * (missile ? 4.55 : 2.2);
    const glowRadius = Math.max(width, height) * 0.58;
    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = Math.max(10, radius * 0.72);
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, TAU);
    ctx.fill();
    ctx.restore();
    if (sprite) {
      this.drawRaceSheetCell(ctx, sprite, missile ? 4 : 3, 5, x, y, width, height, rotation);
      return;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = Math.max(2, radius * 0.12);
    if (missile) {
      ctx.beginPath();
      ctx.moveTo(0, -height * 0.5);
      ctx.lineTo(width * 0.36, height * 0.24);
      ctx.lineTo(0, height * 0.5);
      ctx.lineTo(-width * 0.36, height * 0.24);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, width * 0.46, 0, TAU);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawRaceTacticalEffects(ctx, racer, rect, radius, time = 0) {
    if (!["commander", "shrapnel", "architect"].includes(racer.raceOrbId)) return;
    const spriteId = racer.raceOrbId === "commander" ? "commanderTactical"
      : racer.raceOrbId === "shrapnel" ? "shrapnelTactical"
      : "architectTactical";
    const sprite = raceSprite(spriteId);
    const cellCount = racer.raceOrbId === "commander" ? 5 : racer.raceOrbId === "architect" ? 6 : 4;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    if (racer.raceOrbId === "commander") {
      for (const projectile of racer.raceCommanderProjectiles || []) {
        const x = rect.x + projectile.x * rect.width;
        const y = rect.y + projectile.y * rect.height;
        this.drawRaceCommanderProjectile(ctx, sprite, projectile, x, y, radius);
      }
    } else if (racer.raceOrbId === "shrapnel") {
      for (const fragment of racer.raceShrapnelFragments || []) {
        const x = rect.x + fragment.x * rect.width;
        const y = rect.y + fragment.y * rect.height;
        const size = radius * (fragment.burst ? 2.35 : 1.72);
        const rotation = Math.atan2(fragment.vy, fragment.vx) + Math.PI / 2;
        this.drawRaceShrapnelShardTrail(ctx, x, y, size * 0.74, rotation, fragment.burst);
        this.drawRaceSheetCell(ctx, sprite, fragment.burst ? 3 : 1, cellCount, x, y, size, size, rotation);
      }
    } else {
      const cellForType = { ramp: 3, bumper: 4, platform: 5 };
      for (const structure of racer.raceArchitectStructures || []) {
        const x = rect.x + structure.x * rect.width;
        const y = rect.y + structure.y * rect.height;
        const width = rect.width * (structure.type === "bumper" ? 0.12 : 0.25);
        this.drawRaceSheetCell(ctx, sprite, cellForType[structure.type], cellCount, x, y, width, structure.type === "bumper" ? width : width * 0.48, structure.angle || 0);
      }
    }
    ctx.restore();
  }

  drawRaceWeaponMount(ctx, orbId, x, y, radius, time = 0) {
    const spriteId = orbId === "ricochet"
      ? "ricochetGunSpinSheet"
      : orbId === "sawblade" ? "sawbladeWeapons" : null;
    if (!spriteId) return;
    const sprite = orbId === "ricochet"
      ? raceTransparentSprite(spriteId, "race-magenta")
      : raceSprite(spriteId);
    if (!sprite) return;
    if (orbId === "ricochet") {
      const spin = this.raceRicochetMountFrame(time);
      const cellWidth = sprite.width / 2;
      const cellHeight = sprite.height / 2;
      const inset = Math.max(2, Math.round(Math.min(cellWidth, cellHeight) * 0.008));
      const frameX = spin.frame % 2;
      const frameY = Math.floor(spin.frame / 2);
      const sourceX = frameX * cellWidth + inset;
      const sourceY = frameY * cellHeight + inset;
      const sourceWidth = cellWidth - inset * 2;
      const sourceHeight = cellHeight - inset * 2;
      const size = radius * 2.55;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(x, y);
      ctx.rotate(spin.rotation);
      ctx.drawImage(
        sprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        -size * 0.5,
        -size * 0.5,
        size,
        size,
      );
      ctx.restore();
      return;
    }
    const source = { x: 148, y: 320, width: 425, height: 395 };
    const width = radius * 1.72;
    const height = radius * 1.56;
    const rotation = time * 0.38;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(
      sprite,
      source.x,
      source.y,
      source.width,
      source.height,
      -radius * 0.28,
      -height * 0.5,
      width,
      height,
    );
    ctx.restore();
  }

  drawRaceSniperWeapon(ctx, racer, x, y, radius) {
    if (racer?.raceOrbId !== "sniper") return;
    const sprite = raceSprite("sniperWeapons");
    if (!sprite) return;
    const source = sniperWeaponSourceRect(sprite.naturalWidth, sprite.naturalHeight, 0);
    const width = radius * 4.4;
    const height = width * source.height / source.width;
    const angle = Number.isFinite(racer.raceSniperGunAngle) ? racer.raceSniperGunAngle : Math.PI / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.imageSmoothingEnabled = false;
    // The orb overlaps the stock and grip, making the gun read as attached
    // while the long barrel stays pointed into the lower half of the chamber.
    ctx.drawImage(
      sprite,
      source.x,
      source.y,
      source.width,
      source.height,
      -width * 0.38,
      -height * 0.5,
      width,
      height,
    );
    ctx.restore();
  }

  drawRaceBerserkerFire(ctx, racer, x, y, radius, time) {
    const rage = Math.max(0, Math.min(100, Number(racer?.raceBerserkerRage) || 0));
    const enraged = racer?.raceBerserkerRageActive === true || rage >= 100;
    if (!enraged) return;
    const intensity = rage / 100;
    const fire = raceTransparentSprite("meteorFire", "race-magenta");
    ctx.save();
    ctx.globalAlpha = 0.25 + intensity * 0.7;
    for (let index = 0; index < 3; index += 1) {
      const pulse = 1 + Math.sin(time * 8 + index * 1.7) * 0.09;
      const width = radius * (1.1 + intensity * 0.92) * pulse;
      const height = radius * (1.45 + intensity * 1.85) * pulse;
      const flameX = x + (index - 1) * radius * (0.62 + intensity * 0.24);
      const flameY = y + radius * (0.82 + Math.sin(time * 5 + index) * 0.06);
      ctx.save();
      ctx.translate(flameX, flameY);
      if (index === 0) ctx.scale(-1, 1);
      ctx.imageSmoothingEnabled = false;
      if (fire) {
        ctx.drawImage(fire, -width * 0.5, -height * 0.72, width, height);
      } else {
        ctx.fillStyle = index === 1 ? "#ffd166" : "#e11d2e";
        ctx.strokeStyle = "#5b1018";
        ctx.lineWidth = Math.max(2, radius * 0.08);
        ctx.beginPath();
        ctx.moveTo(0, -height * 0.72);
        ctx.lineTo(width * 0.42, height * 0.1);
        ctx.lineTo(width * 0.16, height * 0.04);
        ctx.lineTo(width * 0.24, height * 0.62);
        ctx.lineTo(-width * 0.2, height * 0.16);
        ctx.lineTo(-width * 0.42, height * 0.48);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  drawRaceBerserkerOrb(ctx, racer, x, y, radius) {
    // Berserker returns to the original simple red orb silhouette. Rage is
    // communicated by the fire drawn behind it, not by a helmet or alternate
    // character sprite.
    this.drawRaceOrbUnit(ctx, ORB_RACERS.berserker, x, y, radius, racer, 0);
  }

  drawRaceBerserkerVikingOrbLegacy(ctx, racer, x, y, radius) {
    const rage = Math.max(0, Math.min(100, Number(racer?.raceBerserkerRage) || 0));
    const intensity = rage / 100;
    const enraged = racer?.raceBerserkerRageActive === true || rage >= 100;
    const vikingSprite = raceSprite(enraged ? "berserkerVikingRage" : "berserkerVikingCalm");
    if (vikingSprite) {
      // Use Draftmaster's exact character destination scale so the two
      // heavyweight orb designs occupy the same visual footprint. The rage
      // source itself has a larger flame silhouette, so rage still reads as
      // the more aggressive state without changing the shared scale.
      const spriteSize = radius * 3.78 * DRAFTMASTER_VISUAL_SCALE;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        vikingSprite,
        x - spriteSize * 0.5,
        y - spriteSize * 0.5,
        spriteSize,
        spriteSize,
      );
      ctx.restore();
      return;
    }
    const helmetScale = enraged ? 1.12 + intensity * 0.34 : 0.96;
    const bodyColor = enraged ? "#cf2638" : "#9f2735";
    const bodyShade = enraged ? "#7f1728" : "#6d1d2a";
    const helmetColor = enraged ? "#53131b" : "#303943";
    const helmetShade = enraged ? "#2b0c12" : "#171d25";
    const metalColor = enraged ? "#ffb52e" : "#9da7b3";
    const eyeColor = enraged ? "#ffd35a" : "#ff6b4a";
    ctx.save();
    ctx.translate(x, y);

    // The red body and helmet are drawn as one silhouette so Berserker reads
    // as a character orb instead of a generic orb with a floating accessory.
    ctx.fillStyle = "#080808";
    ctx.beginPath();
    ctx.arc(0, 0, radius + 3, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.clip();
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    ctx.fillStyle = bodyShade;
    ctx.beginPath();
    ctx.arc(radius * 0.2, radius * 0.48, radius * 0.72, 0, TAU);
    ctx.fill();
    ctx.fillStyle = enraged ? "#f14b42" : "#c33a42";
    ctx.beginPath();
    ctx.arc(-radius * 0.28, -radius * 0.24, radius * 0.25, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.scale(helmetScale, helmetScale);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = Math.max(2, radius * 0.095);

    // Horns are part of the helmet silhouette. Their tips grow and gain a
    // hot red edge only when the rage state is active.
    ctx.fillStyle = metalColor;
    for (const side of [-1, 1]) {
      const hornBaseX = side * radius * 0.48;
      const hornTipX = side * radius * (enraged ? 1.15 : 0.88);
      const hornTipY = -radius * (enraged ? 1.22 : 0.98);
      ctx.beginPath();
      ctx.moveTo(hornBaseX, -radius * 0.42);
      ctx.quadraticCurveTo(
        side * radius * (enraged ? 0.88 : 0.7),
        -radius * (enraged ? 0.72 : 0.62),
        hornTipX,
        hornTipY,
      );
      ctx.lineTo(side * radius * (enraged ? 0.72 : 0.58), -radius * 0.2);
      ctx.quadraticCurveTo(side * radius * 0.62, -radius * 0.42, hornBaseX, -radius * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (enraged) {
        ctx.strokeStyle = "#e11d2e";
        ctx.lineWidth = Math.max(1.5, radius * 0.04);
        ctx.beginPath();
        ctx.moveTo(side * radius * 0.58, -radius * 0.38);
        ctx.lineTo(hornTipX * 0.9, hornTipY * 0.86);
        ctx.stroke();
        ctx.strokeStyle = "#080808";
        ctx.lineWidth = Math.max(2, radius * 0.095);
      }
    }

    // Dome, cheek guards, and brow overlap the body to form a single helmet.
    ctx.fillStyle = helmetColor;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.72, radius * 0.28);
    ctx.lineTo(-radius * 0.64, -radius * 0.43);
    ctx.quadraticCurveTo(0, -radius * 0.94, radius * 0.64, -radius * 0.43);
    ctx.lineTo(radius * 0.72, radius * 0.28);
    ctx.lineTo(radius * 0.48, radius * 0.52);
    ctx.lineTo(-radius * 0.48, radius * 0.52);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = helmetShade;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.55, -radius * 0.3);
    ctx.quadraticCurveTo(0, -radius * 0.72, radius * 0.55, -radius * 0.3);
    ctx.lineTo(radius * 0.44, radius * 0.1);
    ctx.lineTo(-radius * 0.44, radius * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = metalColor;
    ctx.beginPath();
    ctx.rect(-radius * 0.7, -radius * 0.04, radius * 1.4, radius * 0.19);
    ctx.fill();
    ctx.stroke();

    // The visor leaves the red face visible below it and gives the two rage
    // states a clear expression without adding another floating emblem.
    ctx.fillStyle = "#080808";
    ctx.beginPath();
    ctx.moveTo(-radius * 0.45, radius * 0.16);
    ctx.lineTo(radius * 0.45, radius * 0.16);
    ctx.lineTo(radius * 0.35, radius * 0.42);
    ctx.lineTo(-radius * 0.35, radius * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = eyeColor;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(side * radius * 0.2, radius * 0.28, radius * (enraged ? 0.075 : 0.055), 0, TAU);
      ctx.fill();
    }
    if (enraged) {
      ctx.strokeStyle = "#ff4b36";
      ctx.lineWidth = Math.max(2, radius * 0.055);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.42, radius * 0.48);
      ctx.lineTo(-radius * 0.15, radius * 0.6);
      ctx.lineTo(radius * 0.15, radius * 0.6);
      ctx.lineTo(radius * 0.42, radius * 0.48);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
  }

  drawRaceBerserkerAxe(ctx, racer, x, y, radius, time) {
    if (racer?.raceBerserkerAxeVisible !== true) return;
    const sprite = this.arenaRenderer?.weaponSprites?.get("axe")?.image;
    const rage = Math.max(0, Math.min(100, Number(racer?.raceBerserkerRage) || 0));
    const intensity = rage / 100;
    const pose = berserkerAxePose(racer, time);
    const size = Math.max(
      26,
      radius * (4.05 + intensity * 0.22) * DRAFTMASTER_VISUAL_SCALE,
    );
    // The axe is held at its lower-right grip. Anchoring the generated sprite
    // at that grip keeps the hand attached to the orb while its blade points
    // down toward the active number wall.
    const gripX = 0.79;
    const gripY = 0.82;
    const handX = x + radius * 0.88 * DRAFTMASTER_VISUAL_SCALE;
    const handY = y + radius * 0.34 * DRAFTMASTER_VISUAL_SCALE;
    ctx.save();
    ctx.translate(handX, handY);
    ctx.rotate(pose.angle);
    ctx.imageSmoothingEnabled = false;
    ctx.shadowColor = "#e11d2e";
    ctx.shadowBlur = Math.max(3, radius * (0.1 + intensity * 0.12));
    if (sprite) {
      ctx.drawImage(sprite, -gripX * size, -gripY * size, size, size);
    } else {
      ctx.fillStyle = "#5b341e";
      ctx.fillRect(-size * 0.04, -size * 0.04, size * 0.1, size * 0.86);
      ctx.fillStyle = "#f4c430";
      ctx.beginPath();
      ctx.arc(0, size * 0.72, size * 0.24, Math.PI * 1.1, Math.PI * 1.95);
      ctx.lineTo(-size * 0.02, -size * 0.12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    // A small gauntlet at the sprite's grip makes the attachment read as a
    // held weapon rather than a separate projectile beside the orb.
    ctx.save();
    ctx.fillStyle = intensity >= 0.8 ? "#ffd166" : "#c58b32";
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = Math.max(2, radius * 0.06);
    ctx.beginPath();
    ctx.arc(handX, handY, radius * 0.14, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    if (pose.swinging && pose.swingProgress >= 0.48 && pose.swingProgress <= 0.82) {
      ctx.save();
      ctx.strokeStyle = "#f7f2d0";
      ctx.lineWidth = Math.max(3, radius * 0.17);
      ctx.beginPath();
      ctx.arc(handX, handY + radius * 0.35, radius * 0.98, Math.PI * 0.22, Math.PI * 0.82);
      ctx.stroke();
      ctx.strokeStyle = "#e11d2e";
      ctx.lineWidth = Math.max(2, radius * 0.07);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawRaceBerserkerHorn(ctx, racer, x, y, radius, time) {
    const hornUntil = Number(racer?.raceBerserkerHornUntil) || 0;
    if (hornUntil <= time) return;
    const horn = raceTransparentSprite("meteorHorn", "race-magenta");
    if (!horn) return;
    const remaining = hornUntil - time;
    const progress = Math.max(0, Math.min(1, 1 - remaining / 1.05));
    const size = radius * (2.15 + progress * 0.35);
    ctx.save();
    ctx.globalAlpha = Math.max(0.2, 1 - progress * 0.35);
    ctx.translate(x + radius * 1.25, y - radius * 1.62);
    ctx.rotate(-0.32 + Math.sin(time * 6) * 0.04);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(horn, -size * 0.5, -size * 0.38, size, size * 0.76);
    ctx.restore();
  }

  drawRaceBerserkerRageBar(ctx, racer, rect, racerIndex, slotIndex = 0, slotCount = 1) {
    const rage = Math.max(0, Math.min(100, Number(racer?.raceBerserkerRage) || 0));
    const progress = rage / 100;
    const columnWidth = rect.width * (slotCount > 1 ? 0.38 : 0.31);
    const anchorX = racerIndex === 0
      ? rect.x + slotIndex * columnWidth
      : rect.x + rect.width - (slotCount - 1 - slotIndex) * columnWidth;
    const alignLeft = racerIndex === 0;
    const width = Math.max(76, Math.min(rect.width * (slotCount > 1 ? 0.27 : 0.34), 250));
    const height = Math.max(11, rect.height * 0.028);
    const fontSize = Math.max(10, Math.min(18, rect.height * 0.035));
    const statFontSize = Math.max(14, rect.height * (slotCount > 1 ? 0.047 : 0.065));
    const gap = Math.max(7, rect.height * 0.012);
    const anchorY = racerIndex === 0 ? rect.y - 15 : rect.y + rect.height + 14;
    const barY = racerIndex === 0
      ? anchorY - statFontSize - height - gap
      : anchorY + statFontSize + gap;
    const barX = alignLeft ? anchorX : anchorX - width;
    const label = `RAGE ${Math.round(rage)}%`;
    ctx.save();
    ctx.fillStyle = "#241017";
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = Math.max(2, height * 0.16);
    ctx.fillRect(barX, barY, width, height);
    ctx.fillStyle = progress >= 1 ? "#ff2f1f" : progress >= 0.55 ? "#f47a20" : "#bd3b24";
    ctx.fillRect(barX, barY, width * progress, height);
    ctx.strokeRect(barX, barY, width, height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = progress >= 1 ? "#ffcf4a" : "#f6d6a7";
    ctx.strokeStyle = "#080808";
    ctx.lineWidth = Math.max(2, height * 0.18);
    ctx.font = `900 ${fontSize}px ${PIXEL_FONT}`;
    ctx.strokeText(label, barX + width * 0.5, barY + height * 0.5);
    ctx.fillText(label, barX + width * 0.5, barY + height * 0.5);
    ctx.restore();
  }

  drawRaceDraftmasterCharacter(ctx, racer, x, y, radius) {
    const sprite = raceSprite("draftmasterCapedOrb");
    if (!sprite) {
      this.drawRaceOrbUnit(
        ctx,
        ORB_RACERS.draftmaster,
        x,
        y,
        radius * DRAFTMASTER_VISUAL_SCALE,
        racer,
      );
      return;
    }
    const level = Math.min(2, Math.max(0, racer.raceDraftSpeedLevel || 0));
    const sourceWidth = sprite.naturalWidth / 3;
    const sourceHeight = sprite.naturalHeight;
    const width = radius * (3.78 + level * 0.14) * DRAFTMASTER_VISUAL_SCALE;
    const height = width * sourceHeight / sourceWidth;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sprite,
      level * sourceWidth,
      0,
      sourceWidth,
      sourceHeight,
      x - width * 0.5,
      y - height * 0.39,
      width,
      height,
    );
    ctx.restore();
  }

  drawRaceDraftmasterOrbMask(ctx, racer, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.08 * DRAFTMASTER_VISUAL_SCALE, 0, TAU);
    ctx.clip();
    this.drawRaceDraftmasterCharacter(ctx, racer, x, y, radius);
    ctx.restore();
  }

  drawRaceDraftmasterWeapons(ctx, racer, x, y, radius, time, rect) {
    const sprite = raceSprite("draftmasterEquipment");
    if (!sprite) return;
    const cellWidth = sprite.naturalWidth / 4;
    const cellHeight = sprite.naturalHeight / 2;
    const swordColumn = racer.raceDraftDamageLevel > 0 ? 1 : 0;
    const gunLevel = Math.min(2, Math.max(0, racer.raceDraftProjectileLevel || 0));
    const swordSize = radius
      * (4.05 + Math.min(2, racer.raceDraftDamageLevel || 0) * 0.22)
      * DRAFTMASTER_VISUAL_SCALE;
    const { width: gunWidth, height: gunHeight } = draftmasterGunDimensions(radius, gunLevel);
    const swordPose = draftmasterSwordPose(racer, time);
    const reloadPose = draftmasterGunReloadPose(racer, time);
    const swordGripX = 0.34;
    const swordGripY = 0.66;
    const weaponOffset = DRAFTMASTER_VISUAL_SCALE;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.shadowColor = "#f05a5a";
    ctx.shadowBlur = Math.max(3, radius * 0.14);
    // The grip sits just outside the orb's right edge. Positive canvas
    // rotation moves the blade clockwise from an up-right guard into the
    // active layer below the orb.
    ctx.translate(x + radius * 0.88 * weaponOffset, y + radius * 0.34 * weaponOffset);
    ctx.rotate(swordPose.angle);
    ctx.drawImage(
      sprite,
      swordColumn * cellWidth,
      0,
      cellWidth,
      cellHeight,
      -swordGripX * swordSize,
      -swordGripY * swordSize,
      swordSize,
      swordSize,
    );
    ctx.restore();

    const gunSource = draftmasterGunSourceRect(sprite.naturalWidth, sprite.naturalHeight, gunLevel);
    const gunAngle = Number.isFinite(racer.raceDraftGunAngle)
      ? racer.raceDraftGunAngle
      : Math.PI * 1.25;
    // Draftmaster stores the requested mount as a conventional mathematical
    // angle (225 degrees is down-left). Canvas has a downward-positive Y axis,
    // so invert it at the render seam to make the muzzle point into the layer.
    const gunCanvasAngle = -gunAngle;
    const gunGripX = 0.31;
    const gunGripY = 0.72;
    const ghostCount = reloadPose.spinning ? 5 : 1;
    for (let ghost = 0; ghost < ghostCount; ghost += 1) {
      const center = (ghostCount - 1) / 2;
      const ghostOffset = reloadPose.spinning ? (ghost - center) * 0.16 : 0;
      const ghostAlpha = reloadPose.spinning
        ? 0.12 + (1 - Math.abs(ghost - center) / Math.max(1, center)) * 0.13
        : 1;
      ctx.save();
      ctx.globalAlpha = ghostAlpha;
      ctx.imageSmoothingEnabled = false;
      ctx.shadowColor = "#f4c430";
      ctx.shadowBlur = Math.max(4, radius * (reloadPose.spinning ? 0.34 : 0.18));
      // Mirror the sheet so the gun's muzzle sits outward from the left hand.
      // During the short reload window, several translucent turns create a
      // readable high-speed spin without changing the actual shot direction.
      ctx.translate(x - radius * 0.88 * weaponOffset, y + radius * 0.2 * weaponOffset);
      ctx.rotate(gunCanvasAngle + Math.PI + reloadPose.rotation + ghostOffset);
      ctx.scale(-1, 1);
      ctx.drawImage(
        sprite,
        gunSource.x,
        gunSource.y,
        gunSource.width,
        gunSource.height,
        -gunGripX * gunWidth,
        -gunGripY * gunHeight,
        gunWidth,
        gunHeight,
      );
      ctx.restore();
    }

    if (swordPose.swinging && swordPose.swingProgress >= 0.48 && swordPose.swingProgress <= 0.82) {
      const lineY = rect.y + raceLayerLineYForRenderer(racer, racer.raceLayerIndex) * rect.height;
      const contactX = x + radius * (0.62 + swordPose.swingProgress * 0.42);
      ctx.save();
      ctx.strokeStyle = "#f7f2d0";
      ctx.lineWidth = Math.max(3, radius * 0.18);
      ctx.beginPath();
      ctx.arc(contactX, lineY - radius * 0.12, radius * 0.92, Math.PI * 1.12, Math.PI * 1.86);
      ctx.stroke();
      ctx.strokeStyle = "#d43b36";
      ctx.lineWidth = Math.max(2, radius * 0.07);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawRaceDraftmasterUpgradeCallout(ctx, racer, x, y, radius, time) {
    const upgrade = racer?.raceDraftLastUpgrade;
    const calloutUntil = Number(racer?.raceDraftUpgradeCalloutUntil) || 0;
    const now = Number(time) || 0;
    if (!RACE_DRAFT_UPGRADE_LABELS[upgrade] || calloutUntil <= now) return;
    const remaining = Math.max(0, calloutUntil - now);
    const progress = Math.max(
      0,
      Math.min(1, 1 - remaining / DRAFTMASTER_UPGRADE_CALLOUT_SECONDS),
    );
    const label = upgrade === "projectile"
      ? "PROJECTILE +1"
      : `${RACE_DRAFT_UPGRADE_LABELS[upgrade]} UP!`;
    const color = RACE_DRAFT_UPGRADE_COLORS[upgrade] || "#ffffff";
    const lift = radius * (2.5 + progress * 0.24);
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, progress - 0.72) / 0.28);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFittedFont(ctx, label, radius * 5.4, 900, Math.max(13, radius * 0.72), 12, PIXEL_FONT);
    ctx.lineWidth = Math.max(6, radius * 0.18);
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(label, x, y - lift);
    ctx.lineWidth = Math.max(3, radius * 0.09);
    ctx.strokeStyle = "#080808";
    ctx.fillStyle = color;
    ctx.strokeText(label, x, y - lift);
    ctx.fillText(label, x, y - lift);
    ctx.restore();
  }

  drawRaceHackerCallout(ctx, racer, x, y, radius, time) {
    const calloutUntil = Number(racer?.raceHackerCalloutUntil) || 0;
    const now = Number(time) || 0;
    const outcome = String(racer?.raceHackerOutcomeLabel || "").trim();
    if (!outcome || calloutUntil <= now) return;
    const duration = 1.8;
    const progress = Math.max(0, Math.min(1, 1 - (calloutUntil - now) / duration));
    const color = racer?.raceHackerOutcomeColor || "#39ff14";
    const lift = radius * (2.62 + progress * 0.18);
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, progress - 0.72) / 0.28);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFittedFont(ctx, outcome, radius * 5.5, 900, Math.max(13, radius * 0.72), 12, PIXEL_FONT);
    ctx.lineWidth = Math.max(6, radius * 0.18);
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(outcome, x, y - lift);
    ctx.lineWidth = Math.max(3, radius * 0.09);
    ctx.strokeStyle = "#080808";
    ctx.fillStyle = color;
    ctx.strokeText(outcome, x, y - lift);
    ctx.fillText(outcome, x, y - lift);
    ctx.restore();
  }

  drawRaceHackerHydrogenCallout(ctx, racer, x, y, radius) {
    const bomb = racer?.raceHackerHydrogenBomb;
    if (!bomb?.active) return;
    const remaining = Math.max(0, Number(bomb.remaining) || 0);
    const label = `HYDROGEN BOMB ${remaining.toFixed(1)}S`;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    setFittedFont(ctx, label, radius * 6.4, 900, Math.max(12, radius * 0.58), 11, PIXEL_FONT);
    ctx.lineWidth = Math.max(5, radius * 0.15);
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(label, x, y - radius * 3.24);
    ctx.lineWidth = Math.max(2.5, radius * 0.075);
    ctx.strokeStyle = "#26030a";
    ctx.fillStyle = "#ff334f";
    ctx.strokeText(label, x, y - radius * 3.24);
    ctx.fillText(label, x, y - radius * 3.24);
    ctx.restore();
  }

  raceRicochetMountFrame(time = 0) {
    const interval = 3;
    const spinDuration = 0.65;
    const elapsed = Math.max(0, Number(time) || 0);
    const completedTurns = Math.floor(elapsed / interval);
    const phase = elapsed - completedTurns * interval;
    if (completedTurns === 0 || phase >= spinDuration) {
      return { frame: completedTurns % 4, rotation: 0 };
    }
    const progress = phase / spinDuration;
    const eased = progress * progress * (3 - 2 * progress);
    return {
      frame: (completedTurns - 1) % 4,
      rotation: eased * (Math.PI / 2),
    };
  }

  drawRaceTurretBody(ctx, x, y, radius, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.arc(0, 0, radius + Math.max(2, radius * 0.12), 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ff7a00";
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#ffb347";
    ctx.lineWidth = Math.max(1.5, radius * 0.05);
    ctx.stroke();
    ctx.save();
    if (typeof ctx.rotate === "function") ctx.rotate(Number(angle) || 0);
    const drawBarrel = (x, y, width, height, cornerRadius) => {
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, cornerRadius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, width, height);
      }
    };
    ctx.fillStyle = "#080808";
    drawBarrel(
      radius * 0.5,
      -radius * 0.2,
      radius * 1.28,
      radius * 0.4,
      Math.max(2, radius * 0.08),
    );
    ctx.fillStyle = "#262626";
    drawBarrel(
      radius * 0.68,
      -radius * 0.11,
      radius * 0.98,
      radius * 0.22,
      Math.max(1, radius * 0.04),
    );
    ctx.restore();
    ctx.restore();
  }

  drawRaceWhirlwindOrbiters(ctx, racer, x, y, radius, time = 0) {
    const speed = Math.max(0, Number(racer?.raceWhirlwindRotationSpeed) || 0);
    const satelliteRadius = Math.max(3, radius * RACE_WHIRLWIND_SATELLITE_RADIUS_SCALE);
    ctx.save();
    ctx.lineWidth = Math.max(1.5, radius * 0.045);
    const normalizedRadius = RACE_ORB_RADIUS * (Number(racer?.raceOrbScale) || 1);
    const pixelScale = normalizedRadius > 0 ? radius / normalizedRadius : 1;
    for (let index = 0; index < RACE_WHIRLWIND_SATELLITE_COUNT; index += 1) {
      const position = raceWhirlwindOrbPosition(racer, index, time);
      const satelliteX = x + position.offsetX * pixelScale;
      const satelliteY = y + position.offsetY * pixelScale;
      ctx.fillStyle = "#7b8794";
      ctx.strokeStyle = "#e5eef2";
      ctx.beginPath();
      ctx.arc(satelliteX, satelliteY, satelliteRadius, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.55, 0.18 + speed * 0.04)})`;
      ctx.beginPath();
      ctx.arc(
        satelliteX - satelliteRadius * 0.22,
        satelliteY - satelliteRadius * 0.22,
        satelliteRadius * 0.22,
        0,
        TAU,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  drawRaceLagGlitchOverlay(ctx, racer, x, y, radius, time = 0) {
    const active = racer?.raceLagGlitchActive === true;
    const flash = Math.max(0, Number(racer?.raceLagGlitchFlash) || 0);
    const centerY = y + (active ? radius * 0.45 : 0);
    const sprite = raceSprite("lagOrb");
    ctx.save();
    ctx.globalAlpha = 0.76 + Math.sin(time * 42) * 0.12;
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = flash > 0.2 ? "#b6ff00" : "#39ff14";
    ctx.lineWidth = Math.max(1.5, radius * 0.055);
    for (let index = 0; index < 7; index += 1) {
      const offset = (index - 3) * radius * 0.24;
      ctx.beginPath();
      ctx.moveTo(x - radius * 1.2, centerY + offset);
      ctx.lineTo(x - radius * 0.4, centerY + offset + Math.sin(time * 19 + index) * radius * 0.08);
      ctx.stroke();
    }
    if (sprite) {
      ctx.imageSmoothingEnabled = false;
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.24 + flash * 0.5;
      const spriteSize = radius * 2.36;
      ctx.drawImage(sprite, x - spriteSize / 2, centerY - spriteSize / 2, spriteSize, spriteSize);
    }
    ctx.restore();
  }

  drawRaceOrbUnit(ctx, def, x, y, radius, racer = null, time = 0) {
    ctx.save();
    ctx.translate(x, y);
    if (def?.id === "crusher") {
      const sprite = raceSprite("crusherRock");
      if (sprite) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite, -radius * 1.08, -radius * 1.08, radius * 2.16, radius * 2.16);
      } else {
        ctx.fillStyle = "#515860";
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (def?.id === "black-hole") {
      const active = racer?.raceBlackHoleActive === true;
      const baseScale = active ? Math.max(6.4, Number(racer?.raceBlackHoleScale) || 6.4) : 1.6;
      const beat = active ? 1 + Math.sin(time * 4.2) * 0.055 : 1;
      const scale = baseScale * beat;
      const sprite = raceSprite("blackHoleOrb");
      if (sprite) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sprite, -radius * scale, -radius * scale, radius * 2 * scale, radius * 2 * scale);
      } else {
        ctx.fillStyle = "#090617";
        ctx.beginPath();
        ctx.arc(0, 0, radius * scale, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (def?.id === "hydrogen-bomb") {
      ctx.fillStyle = "#242024";
      ctx.beginPath();
      ctx.arc(0, 0, radius + 3, 0, TAU);
      ctx.fill();
      const symbol = raceSprite("hydrogenBombSymbol");
      if (symbol) {
        const sourceWidth = Number(symbol.naturalWidth) || 260;
        const sourceSize = Math.min(sourceWidth, Number(symbol.naturalHeight) || sourceWidth);
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.clip();
        ctx.imageSmoothingEnabled = false;
        // The supplied image is 260x280; use its exact upper square so the
        // round radiation symbol fills the ball without the source watermark.
        ctx.drawImage(symbol, 0, 0, sourceSize, sourceSize, -radius, -radius, radius * 2, radius * 2);
        ctx.restore();
      }
      ctx.restore();
      return;
    }
    if (def?.id === "tsar-bomb") {
      const bodyRadius = radius * 1.12;
      ctx.fillStyle = "#030305";
      ctx.beginPath();
      ctx.arc(0, 0, bodyRadius, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#ff3b30";
      ctx.lineWidth = Math.max(2, radius * 0.085);
      ctx.stroke();
      const remaining = Math.max(
        0,
        RACE_TSAR_BOMB_COUNTDOWN_SECONDS - (Number(racer?.raceTsarBombCountdownElapsed) || 0),
      );
      ctx.fillStyle = "#ff3b30";
      ctx.strokeStyle = "#160307";
      ctx.lineWidth = Math.max(2, radius * 0.045);
      ctx.font = `900 ${Math.max(14, radius * 0.58)}px ${PIXEL_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText(remaining.toFixed(1), 0, 0);
      ctx.fillText(remaining.toFixed(1), 0, 0);
      ctx.restore();
      return;
    }
    if (def?.id === "all-in-one") {
      ctx.fillStyle = "#080808";
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(2, radius * 0.085);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${Math.max(14, radius * 0.92)}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("∞", 0, radius * 0.03);
      ctx.restore();
      return;
    }
    if (def?.id === "reality-bomb") {
      const sprite = raceSprite("realityBomb");
      if (sprite) {
        ctx.imageSmoothingEnabled = false;
        const spriteScale = 1.28;
        ctx.drawImage(
          sprite,
          -radius * spriteScale,
          -radius * spriteScale,
          radius * 2 * spriteScale,
          radius * 2 * spriteScale,
        );
      } else {
        ctx.fillStyle = def.color;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (def?.id === "lag") {
      const sprite = raceSprite("lagOrb");
      const offsetY = racer?.raceLagGlitchActive ? radius * 0.45 : 0;
      if (sprite) {
        ctx.imageSmoothingEnabled = false;
        const spriteSize = radius * 2.36;
        ctx.drawImage(sprite, -spriteSize / 2, -spriteSize / 2 + offsetY, spriteSize, spriteSize);
      } else {
        ctx.fillStyle = "#050805";
        ctx.beginPath();
        ctx.arc(0, offsetY, radius, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#39ff14";
        ctx.lineWidth = Math.max(2, radius * 0.08);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }
    if (def?.id === "antimatter-bomb" || def?.id === "time-bomb") {
      const collapse = def.id === "antimatter-bomb"
        ? Math.max(0, Math.min(1, Number(racer?.raceAntimatterCollapseProgress) || 0))
        : 0;
      if (def.id === "antimatter-bomb") {
        const bodyScale = 1 - Math.sin(collapse * Math.PI) * 0.32
          + Math.max(0, (collapse - 0.72) / 0.28) * 0.22;
        const bodyRadius = radius * 1.12 * bodyScale;
        ctx.fillStyle = "#030305";
        ctx.beginPath();
        ctx.arc(0, 0, bodyRadius, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#ff334f";
        ctx.lineWidth = Math.max(2, radius * 0.075);
        ctx.stroke();
        const remaining = Math.max(
          0,
          raceAntimatterCooldownSecondsFor(racer)
            - (Number(racer?.raceAntimatterCountdownElapsed) || 0),
        );
        ctx.fillStyle = "#ff334f";
        ctx.strokeStyle = "#26030a";
        ctx.lineWidth = Math.max(2, radius * 0.045);
        ctx.font = "900 " + Math.max(14, radius * 0.58 * bodyScale) + "px " + PIXEL_FONT;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(remaining.toFixed(1), 0, 0);
        ctx.fillText(remaining.toFixed(1), 0, 0);
      } else {
        const clockRadius = radius * 1.08;
        const cycleProgress = Math.max(
          0,
          Math.min(1, (Number(racer?.raceTimeBombCycleElapsed) || 0) / RACE_BOMB_CYCLE_SECONDS),
        );
        const minuteAngle = -Math.PI / 2 + cycleProgress * TAU;
        const hourAngle = -Math.PI / 2 + cycleProgress * TAU / 12;
        ctx.fillStyle = "#f4e7b5";
        ctx.beginPath();
        ctx.arc(0, 0, clockRadius, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#0a111b";
        ctx.lineWidth = Math.max(3, radius * 0.095);
        ctx.stroke();
        for (let tick = 0; tick < 12; tick += 1) {
          const angle = -Math.PI / 2 + tick * TAU / 12;
          const outer = clockRadius * 0.86;
          const inner = clockRadius * (tick % 3 === 0 ? 0.67 : 0.76);
          ctx.lineWidth = Math.max(2, radius * (tick % 3 === 0 ? 0.065 : 0.038));
          ctx.strokeStyle = tick % 3 === 0 ? "#0a111b" : "#977825";
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
          ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
          ctx.stroke();
        }
        const drawHand = (angle, length, width, color) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(2, radius * width);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * clockRadius * length, Math.sin(angle) * clockRadius * length);
          ctx.stroke();
        };
        drawHand(hourAngle, 0.48, 0.09, "#0a111b");
        drawHand(minuteAngle, 0.72, 0.055, "#b22a37");
        ctx.fillStyle = "#b22a37";
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(2, radius * 0.105), 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (def?.id === "snowball") {
      ctx.fillStyle = "#111111";
      ctx.beginPath();
      ctx.arc(0, 0, radius + 3, 0, TAU);
      ctx.fill();
      const sprite = raceSprite("snowballOrb");
      if (sprite) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.clip();
        ctx.rotate(Number(racer?.raceSnowballRotation) || 0);
        ctx.imageSmoothingEnabled = false;
        const spriteScale = 1.08;
        ctx.drawImage(
          sprite,
          -radius * spriteScale,
          -radius * spriteScale,
          radius * spriteScale * 2,
          radius * spriteScale * 2,
        );
        ctx.restore();
        ctx.restore();
        return;
      }
    }
    if (def?.id === "batman") {
      const orb = raceSprite("batmanOrb");
      if (orb) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(orb, -radius * 1.25, -radius * 1.25, radius * 2.5, radius * 2.5);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(2, radius * 0.085);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.045, 0, TAU);
        ctx.stroke();
        ctx.restore();
        return;
      }
    }
    if (def?.id === "turret") {
      const angle = racer?.raceTurrets?.[0]?.angle ?? (Number(time) || 0) * 2.2;
      this.drawRaceTurretBody(ctx, 0, 0, radius, angle);
      ctx.restore();
      return;
    }
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.arc(0, 0, radius + 3, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.clip();
    const bodyColors = raceOrbSplitColors(def, racer);
    if (def?.id === "reactor" && !bodyColors) {
      ctx.fillStyle = raceReactorColorFor(racer);
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    } else if (def?.id === "ying-yang") {
      ctx.fillStyle = racer?.raceYingYangMode === "speed" ? "#ffffff" : "#090909";
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    } else if (def?.id === "blue-sun") {
      ctx.fillStyle = raceBlueSunBodyColorFor(racer);
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    } else if (def?.id === "purple-sun") {
      ctx.fillStyle = racePurpleSunBodyColorFor(racer);
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    } else if (def?.id === "phase-three-sun") {
      ctx.fillStyle = racePhaseThreeSunBodyColorFor(racer);
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    } else if (def?.id === "phase-two-sun") {
      ctx.fillStyle = racePhaseTwoSunBodyColorFor(racer);
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    } else if (def?.id === "rgb") {
      ctx.fillStyle = raceRgbColorFor(racer).color;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    } else if (bodyColors) {
      // Keep the split vertical and exact so both abilities remain readable
      // in the compact portrait and long-form exports.
      ctx.fillStyle = bodyColors[0];
      ctx.fillRect(-radius, -radius, radius, radius * 2);
      ctx.fillStyle = bodyColors[1];
      ctx.fillRect(0, -radius, radius, radius * 2);
    } else {
      ctx.fillStyle = def?.color || "#ed1bd4";
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    }
    ctx.restore();
    this.drawRaceOrbEmblem(ctx, def, radius, racer);
    if (def?.id === "artists") {
      const palette = ORB_RACE_ARTIST_PAINTINGS.map((painting) => painting.colors[1]);
      ctx.save();
      ctx.translate(0, radius * 0.1);
      ctx.fillStyle = "#fff7ed";
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = Math.max(1.5, radius * 0.06);
      ctx.beginPath();
      ctx.ellipse(-radius * 0.06, radius * 0.16, radius * 0.63, radius * 0.42, -0.18, 0, TAU);
      ctx.fill();
      ctx.stroke();
      palette.forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(-radius * 0.38 + (index % 3) * radius * 0.34, radius * (index < 3 ? 0.02 : 0.3), radius * 0.09, 0, TAU);
        ctx.fill();
      });
      ctx.strokeStyle = "#7c2d12";
      ctx.lineWidth = Math.max(2, radius * 0.1);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(radius * 0.08, -radius * 0.42);
      ctx.lineTo(radius * 0.54, -radius * 0.76);
      ctx.stroke();
      ctx.restore();
    } else if (def?.id === "parasite") {
      ctx.fillStyle = "#79a83b";
      for (const [spotX, spotY, spotR] of [[-0.34, -0.2, 0.16], [0.28, -0.35, 0.11], [0.22, 0.28, 0.17], [-0.3, 0.35, 0.09]]) {
        ctx.beginPath();
        ctx.arc(radius * spotX, radius * spotY, radius * spotR, 0, TAU);
        ctx.fill();
      }
    } else if (def?.id === "reactor") {
      const pulse = 0.72 + Math.sin(time * 6) * 0.08;
      const reactorColor = raceReactorColorFor(racer);
      ctx.strokeStyle = reactorColor;
      ctx.lineWidth = Math.max(2, radius * 0.1);
      ctx.beginPath();
      ctx.arc(0, 0, radius * pulse, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = reactorColor;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.28, 0, TAU);
      ctx.fill();
    } else if (def?.id === "leech") {
      ctx.strokeStyle = "#d7ffd0";
      ctx.lineWidth = Math.max(2, radius * 0.09);
      ctx.beginPath();
      ctx.arc(0, radius * 0.06, radius * 0.48, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRaceOrbEmblem(ctx, def, radius, racer = null) {
    if (def?.id === "ying-yang") {
      ctx.save();
      ctx.fillStyle = racer?.raceYingYangMode === "speed" ? "#080808" : "#ffffff";
      ctx.font = `900 ${Math.max(12, radius * 0.95)}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☯", 0, radius * 0.03);
      ctx.restore();
      return;
    }
    if (def?.id === "vampire") {
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.lineWidth = Math.max(1.5, radius * 0.08);
      ctx.beginPath();
      ctx.arc(-radius * 0.28, -radius * 0.18, radius * 0.07, 0, TAU);
      ctx.arc(radius * 0.28, -radius * 0.18, radius * 0.07, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, radius * 0.03, radius * 0.44, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      for (const x of [-0.2, 0.2]) {
        ctx.beginPath();
        ctx.moveTo(radius * x, radius * 0.28);
        ctx.lineTo(radius * (x + (x < 0 ? 0.08 : -0.08)), radius * 0.62);
        ctx.lineTo(radius * (x + (x < 0 ? 0.17 : -0.17)), radius * 0.3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      return;
    }
    if (["sylvester", "lucas", "tetration"].includes(def?.id)) {
      ctx.save();
      ctx.font = `900 ${Math.max(12, radius * (def.id === "sylvester" ? 0.74 : def.id === "lucas" ? 0.9 : 0.68))}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff4f4";
      ctx.strokeStyle = "#17070b";
      ctx.lineWidth = Math.max(2, radius * 0.075);
      const label = def.id === "sylvester" ? "sₙ₊₁" : def.id === "lucas" ? "Lₙ" : "a^^b";
      ctx.strokeText(label, 0, radius * 0.03);
      ctx.fillText(label, 0, radius * 0.03);
      ctx.restore();
      return;
    }
    if (["rain", "hacker", "miner"].includes(def?.id)) {
      ctx.save();
      ctx.fillStyle = "#f7fff7";
      ctx.strokeStyle = "#071007";
      ctx.lineWidth = Math.max(2, radius * 0.075);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (def.id === "rain") {
        ctx.font = `900 ${Math.max(14, radius * 0.92)}px Arial, sans-serif`;
        ctx.strokeText("☔", 0, radius * 0.04);
        ctx.fillText("☔", 0, radius * 0.04);
      } else if (def.id === "hacker") {
        ctx.font = `900 ${Math.max(13, radius * 0.72)}px ${PIXEL_FONT}`;
        ctx.strokeText("01", 0, radius * 0.04);
        ctx.fillText("01", 0, radius * 0.04);
      } else {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(3, radius * 0.12);
        ctx.beginPath();
        ctx.moveTo(-radius * 0.56, radius * 0.34);
        ctx.lineTo(radius * 0.43, -radius * 0.46);
        ctx.moveTo(-radius * 0.4, radius * 0.47);
        ctx.lineTo(radius * 0.56, -radius * 0.34);
        ctx.stroke();
        ctx.font = `900 ${Math.max(10, radius * 0.34)}px Arial, sans-serif`;
        ctx.strokeText("MINER", 0, radius * 0.04);
        ctx.fillText("MINER", 0, radius * 0.04);
      }
      ctx.restore();
      return;
    }
    if (["quadratic", "x-power"].includes(def?.id)) {
      const exponent = def.id === "quadratic"
        ? Math.max(1, (racer?.raceBounces || 0) + 1)
        : Math.max(1, racer?.raceBounces || 1);
      this.drawRaceExponentEmblem(ctx, "x", exponent, radius);
      return;
    }
    if (def?.id === "super-x-power") {
      ctx.save();
      ctx.font = `900 ${Math.max(12, radius * 0.72)}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f4edff";
      ctx.strokeStyle = "#050509";
      ctx.lineWidth = Math.max(2, radius * 0.08);
      ctx.strokeText("xˣ", 0, radius * 0.02);
      ctx.fillText("xˣ", 0, radius * 0.02);
      ctx.restore();
      return;
    }
    if (["needle", "multiplier", "snowball", "countdown", "copycat", "critical"].includes(def?.id)) {
      ctx.save();
      ctx.strokeStyle = "#080808";
      ctx.fillStyle = "#080808";
      ctx.lineWidth = Math.max(2, radius * 0.1);
      ctx.lineCap = "round";
      if (def.id === "needle") {
        ctx.rotate(-Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(-radius * 0.72, 0);
        ctx.lineTo(radius * 0.62, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(radius * 0.62, 0);
        ctx.lineTo(radius * 0.3, -radius * 0.14);
        ctx.lineTo(radius * 0.3, radius * 0.14);
        ctx.closePath();
        ctx.fill();
      } else if (def.id === "snowball") {
        for (let spoke = 0; spoke < 3; spoke += 1) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(-radius * 0.55, 0);
          ctx.lineTo(radius * 0.55, 0);
          ctx.stroke();
        }
      } else if (def.id === "copycat") {
        ctx.globalAlpha = 0.82;
        ctx.beginPath();
        ctx.arc(-radius * 0.18, 0, radius * 0.32, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(radius * 0.18, 0, radius * 0.32, 0, TAU);
        ctx.stroke();
      } else {
        const label = def.id === "countdown"
          ? String(racer?.raceCountdown ?? 10)
          : def.id === "multiplier" ? "×" : "!";
        ctx.font = `900 ${Math.max(10, radius * 1.02)}px ${PIXEL_FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, 0, radius * 0.03);
      }
      ctx.restore();
      return;
    }
    const spriteId = def?.id === "flash"
      ? "flash"
      : def?.id === "magnet"
        ? "magnet"
        : def?.id === "pi"
          ? "piSymbol"
          : def?.id === "fibonacci" ? "fibonacciSymbol" : null;
    const sprite = spriteId ? raceSprite(spriteId) : null;
    const meteor = def?.id === "meteor" ? raceTransparentSprite("meteorOrb", "race-magenta") : null;
    if (def?.id === "batman") {
      const symbol = raceTransparentSprite("batman", "batman");
      if (symbol) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.clip();
        ctx.drawImage(symbol, 0, 0, symbol.width, symbol.height, -radius, -radius, radius * 2, radius * 2);
        ctx.restore();
      }
      return;
    }
    if (sprite) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.clip();
      ctx.imageSmoothingEnabled = false;
      if (def.id === "flash") {
        ctx.drawImage(sprite, 840, 0, 2160, 2160, -radius, -radius, radius * 2, radius * 2);
      } else if (def.id === "fibonacci") {
        const sourceWidth = Number(sprite.naturalWidth) || 52;
        const sourceHeight = Number(sprite.naturalHeight) || 72;
        const spriteWidth = radius * 1.4;
        const spriteHeight = spriteWidth * sourceHeight / sourceWidth;
        ctx.drawImage(sprite, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
      } else {
        ctx.drawImage(sprite, -radius * 0.78, -radius * 0.78, radius * 1.56, radius * 1.56);
      }
      ctx.restore();
      return;
    }
    if (meteor) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.clip();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(meteor, -radius, -radius, radius * 2, radius * 2);
      ctx.restore();
      return;
    }
    if (![
      "x-squared",
      "fibonacci",
      "x-power",
      "super-x-power",
      "phi",
      "factorial",
      "prime",
      "integral",
      "quadratic",
      "pi",
      "centy",
      "infinity",
      "100x",
      "cubed",
      "double",
      "tripler",
      "breaker",
      "square-root",
      "progressive",
      "random",
      "professor",
      "phase-three-sun",
      "phase-two-sun",
      "trifecta",
      "gravitator",
    ].includes(def?.id)) return;
    if (!def?.symbol) return;
    ctx.save();
    ctx.fillStyle = def.id === "infinity" ? "#ffffff" : "#080808";
      const compact = ["boomerang", "mines"].includes(def.id);
      ctx.font = `900 ${Math.max(10, radius * (def.id === "fibonacci" ? 1.04 : def.id === "100x" ? 0.6 : compact ? 0.78 : 0.95))}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(def.symbol, 0, radius * 0.03);
    ctx.restore();
  }


  drawRaceExponentEmblem(ctx, base, exponent, radius) {
    const baseSize = Math.max(12, radius * 1.02);
    const exponentSize = Math.max(8, radius * 0.48);
    ctx.save();
    ctx.fillStyle = "#080808";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${baseSize}px Arial, sans-serif`;
    ctx.textAlign = "center";
    const baseWidth = ctx.measureText(base).width;
    const baseX = -exponentSize * 0.2;
    ctx.fillText(base, baseX, radius * 0.08);
    ctx.font = `900 ${exponentSize}px Arial, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(String(exponent), baseX + baseWidth * 0.42, -radius * 0.27);
    ctx.restore();
  }

  drawRaceDrillProjectiles(ctx, racer, def, rect, radius) {
    if (!raceHasAbility(racer, "drill")) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    for (const drill of racer.raceDrillProjectiles || []) {
      const x = rect.x + drill.x * rect.width;
      const y = rect.y + drill.y * rect.height;
      const size = Math.max(12, radius * 0.82);
      const sprite = raceSprite("drill");
      if (!sprite) continue;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.82);
      ctx.lineTo(x - size * 0.62, y - size * 0.72);
      ctx.lineTo(x + size * 0.62, y - size * 0.72);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(sprite, 10, 5, 38, 48, x - size * 0.72, y - size * 0.82, size * 1.44, size * 1.72);
      ctx.restore();
    }
    ctx.restore();
  }

  drawRaceBatarangProjectiles(ctx, racer, def, rect, radius) {
    if (racer.raceOrbId !== "batman") return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    for (const batarang of racer.raceBatarangProjectiles || []) {
      const x = rect.x + batarang.x * rect.width;
      const y = rect.y + batarang.y * rect.height;
      const size = Math.max(22, rect.width * (batarang.radius || 0.07) * 2);
      const sprite = raceSprite("batarang");
      if (!sprite) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(batarang.vy, batarang.vx));
      ctx.drawImage(sprite, -size * 1.2, -size * 0.58, size * 2.4, size * 1.16);
      ctx.restore();
    }
    ctx.restore();
  }

  drawRaceBatmanGrapple(ctx, racer, rect, radius) {
    if (racer.raceOrbId !== "batman" || !racer.raceBatmanGrapple) return;
    const grapple = racer.raceBatmanGrapple;
    const sprite = raceSprite("batarang");
    if (!sprite) return;
    const orbX = rect.x + racer.raceX * rect.width;
    const orbY = rect.y + racer.raceY * rect.height;
    const targetX = rect.x + grapple.anchorX * rect.width;
    const targetY = rect.y + grapple.anchorY * rect.height;
    const awayX = targetX - orbX;
    const awayY = targetY - orbY;
    const distance = Math.max(0.001, Math.hypot(awayX, awayY));
    const nx = awayX / distance;
    const ny = awayY / distance;
    const muzzleX = orbX + nx * radius * 0.9;
    const muzzleY = orbY + ny * radius * 0.9;
    const fireProgress = Math.max(0, Math.min(1, Number(grapple.hookProgress) || 0));
    const hookProgress = grapple.phase === "firing"
      ? fireProgress
      : 1;
    const hookX = muzzleX + (targetX - muzzleX) * hookProgress;
    const hookY = muzzleY + (targetY - muzzleY) * hookProgress;
    const releaseProgress = grapple.phase === "release"
      ? Math.max(0, Math.min(1, (
        (Number(grapple.elapsed) || 0)
        - (Number(grapple.fireSeconds) || 0)
        - (Number(grapple.pullSeconds) || 0)
      ) / Math.max(0.001, Number(grapple.fadeSeconds) || 0.34)))
      : 0;
    const angle = Math.atan2(targetY - muzzleY, targetX - muzzleX);
    const baseBatarangSize = Math.max(22, rect.width * 0.07 * 2);
    // Batman's escape hook is deliberately twice the already-enlarged Race
    // batarang size, while retaining the exact batarang silhouette.
    const hookSize = baseBatarangSize * 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    ctx.globalAlpha = Math.max(0, 1 - releaseProgress);
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(4, radius * 0.18);
    ctx.beginPath();
    ctx.moveTo(muzzleX, muzzleY);
    ctx.lineTo(hookX, hookY);
    ctx.stroke();
    ctx.strokeStyle = "#090909";
    ctx.lineWidth = Math.max(1.5, radius * 0.075);
    ctx.beginPath();
    ctx.moveTo(muzzleX, muzzleY);
    ctx.lineTo(hookX, hookY);
    ctx.stroke();

    // A tiny black/white launcher collar makes the hook read as Batman's
    // defensive grappler without covering the generated orb or its HP.
    ctx.save();
    ctx.translate(muzzleX, muzzleY);
    ctx.rotate(angle);
    ctx.fillStyle = "#050505";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(1.5, radius * 0.06);
    ctx.fillRect(-radius * 0.16, -radius * 0.15, radius * 0.46, radius * 0.3);
    ctx.strokeRect(-radius * 0.16, -radius * 0.15, radius * 0.46, radius * 0.3);
    ctx.restore();

    ctx.save();
    ctx.translate(hookX, hookY);
    ctx.rotate(angle);
    ctx.imageSmoothingEnabled = false;
    // The white shadow is the outline; the second pass forces the reused
    // batarang model to a solid black interior in every theme.
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = Math.max(2, radius * 0.14);
    ctx.drawImage(sprite, -hookSize * 1.2, -hookSize * 0.58, hookSize * 2.4, hookSize * 1.16);
    ctx.shadowColor = "transparent";
    ctx.filter = "brightness(0)";
    ctx.drawImage(sprite, -hookSize * 1.2, -hookSize * 0.58, hookSize * 2.4, hookSize * 1.16);
    ctx.filter = "none";
    ctx.restore();
    ctx.restore();
  }

  drawRaceBoomerangProjectiles(ctx, racer, def, rect, radius) {
    if (racer.raceOrbId !== "boomerang") return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    for (const boomerang of racer.raceBoomerangProjectiles || []) {
      const x = rect.x + boomerang.x * rect.width;
      const y = rect.y + boomerang.y * rect.height;
      const size = Math.max(22, rect.width * (boomerang.radius || 0.07));
      const sprite = raceSprite("boomerang");
      if (!sprite) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(boomerang.vy, boomerang.vx));
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprite, -size * 1.2, -size * 0.58, size * 2.4, size * 1.16);
      ctx.restore();
    }
    ctx.restore();
  }

  drawRaceMines(ctx, racer, def, rect, radius) {
    if (!raceHasAbility(racer, "mines")) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    for (const mine of racer.raceMineProjectiles || []) {
      const x = rect.x + mine.x * rect.width;
      const y = rect.y + mine.y * rect.height;
      const size = Math.max(7, rect.width * (mine.radius || 0.012));
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#050505";
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = Math.max(1.5, size * 0.14);
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ff8a1f";
      ctx.beginPath();
      ctx.arc(-size * 0.28, -size * 0.3, size * 0.13, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawRaceRicochetProjectiles(ctx, racer, rect, radius) {
    if (racer.raceOrbId !== "ricochet") return;
    const sprite = raceSprite("ricochetWeapons");
    if (!sprite) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    for (const projectile of racer.raceRicochetProjectiles || []) {
      const x = rect.x + projectile.x * rect.width;
      const y = rect.y + projectile.y * rect.height;
      const size = Math.max(14, rect.width * (projectile.radius || 0.018) * 3.2);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.atan2(projectile.vy, projectile.vx));
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprite, 1035, 380, 365, 255, -size * 1.08, -size * 0.62, size * 2.16, size * 1.24);
      ctx.restore();
    }
    ctx.restore();
  }

  drawRaceSawbladeProjectiles(ctx, racer, rect, radius) {
    if (racer.raceOrbId !== "sawblade") return;
    const sprite = raceSprite("sawbladeWeapons");
    if (!sprite) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    for (const projectile of racer.raceSawbladeProjectiles || []) {
      const x = rect.x + projectile.x * rect.width;
      const y = rect.y + projectile.y * rect.height;
      const size = Math.max(22, rect.width * (projectile.radius || 0.038) * 2.25);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(projectile.rotation || 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprite, 750, 145, 665, 690, -size, -size, size * 2, size * 2);
      ctx.restore();
    }
    ctx.restore();
  }

  drawRaceBatWings(ctx, x, y, radius) {
    const wing = raceTransparentSprite("batwing", "batwing");
    if (!wing) return;
    const width = radius * 2.65;
    const height = radius * 1.65;
    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.drawImage(wing, x - radius * 2.95, y - height * 0.54, width, height);
    ctx.translate(x + radius * 2.95, y - height * 0.54);
    ctx.scale(-1, 1);
    ctx.drawImage(wing, 0, 0, width, height);
    ctx.restore();
  }

  drawRaceBatBombs(ctx, racer, rect, radius) {
    if (racer.raceOrbId !== "batman") return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    ctx.fillStyle = "#050505";
    for (const bomb of racer.raceBatBombs || []) {
      ctx.beginPath();
      ctx.arc(
        rect.x + bomb.x * rect.width,
        rect.y + bomb.y * rect.height,
        Math.max(4, rect.width * (bomb.radius || 0.012)),
        0,
        TAU,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  drawRaceGrappler(ctx, racer, def, rect, radius) {
    if (racer.raceOrbId !== "grappler") return;
    const orbX = rect.x + racer.raceX * rect.width;
    const orbY = rect.y + racer.raceY * rect.height;
    const sheet = raceSprite("grapplerSheet");
    const projectile = racer.raceGrapplerProjectiles?.[0] || null;
    const pull = racer.raceGrapplerPull || null;
    const rope = racer.raceGrapplerRope || null;
    const anchor = racer.raceGrapplerAnchor || null;
    const target = pull
      ? { x: pull.anchorX ?? pull.targetX, y: pull.anchorY ?? pull.targetY, kind: "anchor" }
      : rope?.attached || racer.raceGrapplerAttached
        ? { x: rope?.x2 ?? anchor?.x, y: rope?.y2 ?? anchor?.y, kind: "anchor" }
        : projectile
          ? { x: projectile.x, y: projectile.y, kind: "hook" }
          : null;
    const gunAngle = Number.isFinite(Number(racer.raceGrapplerGunAngle))
      ? Number(racer.raceGrapplerGunAngle)
      : Number.isFinite(Number(projectile?.angle))
        ? Number(projectile.angle)
        : Math.PI / 2;
    const muzzleDistance = radius * 0.92;
    const muzzleX = orbX + Math.cos(gunAngle) * muzzleDistance;
    const muzzleY = orbY + Math.sin(gunAngle) * muzzleDistance;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    if (target && Number.isFinite(Number(target.x)) && Number.isFinite(Number(target.y))) {
      const hookX = rect.x + target.x * rect.width;
      const hookY = rect.y + target.y * rect.height;
      const ropeColor = pull || target.kind === "anchor" ? "#0f766e" : "#2dd4bf";
      ctx.strokeStyle = "#082f49";
      ctx.lineWidth = Math.max(4, radius * 0.16);
      ctx.beginPath();
      ctx.moveTo(muzzleX, muzzleY);
      ctx.lineTo(hookX, hookY);
      ctx.stroke();
      ctx.strokeStyle = ropeColor;
      ctx.lineWidth = Math.max(2, radius * 0.075);
      if (typeof ctx.setLineDash === "function") {
        ctx.setLineDash(pull || target.kind === "anchor" ? [] : [radius * 0.26, radius * 0.16]);
      }
      ctx.beginPath();
      ctx.moveTo(muzzleX, muzzleY);
      ctx.lineTo(hookX, hookY);
      ctx.stroke();
      if (typeof ctx.setLineDash === "function") ctx.setLineDash([]);
      if (sheet) {
        this.drawRaceSheetCell(
          ctx,
          sheet,
          target.kind === "anchor" ? 2 : 1,
          4,
          hookX,
          hookY,
          Math.max(16, radius * (target.kind === "anchor" ? 1.45 : 1.25)),
          Math.max(16, radius * (target.kind === "anchor" ? 1.45 : 1.25)),
          Number.isFinite(Number(projectile?.angle)) ? Number(projectile.angle) : gunAngle,
        );
      }
    }
    if (!target && Number(racer.raceGrapplerMomentum) > 0) {
      const velocityX = Number(racer.raceVx) || Math.cos(gunAngle);
      const velocityY = Number(racer.raceVy) || Math.sin(gunAngle);
      const velocityLength = Math.max(0.001, Math.hypot(velocityX, velocityY));
      const streakLength = radius * Math.min(4.6, 1.5 + Number(racer.raceGrapplerMomentum) * 1.2);
      ctx.strokeStyle = "#99f6e4aa";
      ctx.lineWidth = Math.max(2, radius * 0.08);
      ctx.beginPath();
      ctx.moveTo(orbX - velocityX / velocityLength * radius * 0.8, orbY - velocityY / velocityLength * radius * 0.8);
      ctx.lineTo(orbX - velocityX / velocityLength * streakLength, orbY - velocityY / velocityLength * streakLength);
      ctx.stroke();
    }
    if (sheet) {
      this.drawRaceSheetCell(
        ctx,
        sheet,
        0,
        4,
        orbX,
        orbY,
        Math.max(34, radius * 3.45),
        Math.max(24, radius * 2.2),
        gunAngle,
      );
      this.drawRaceSheetCell(
        ctx,
        sheet,
        3,
        4,
        muzzleX,
        muzzleY,
        Math.max(10, radius * 0.72),
        Math.max(10, radius * 0.72),
        gunAngle,
      );
    }
    ctx.restore();
  }

  drawRaceArtistPaintings(ctx, racer, def, rect, radius, time) {
    if (racer.raceOrbId !== "artists") return;
    const groundYForLayer = (layerIndex, normalizedGroundY = null) => {
      const supplied = Number(normalizedGroundY);
      if (normalizedGroundY !== null && normalizedGroundY !== undefined && Number.isFinite(supplied)) {
        return rect.y + supplied * rect.height;
      }
      return rect.y + raceLayerLineYForRenderer(racer, layerIndex) * rect.height;
    };
    const drawStrokeProgress = (points, color, width, progress, alpha = 1) => {
      if (points.length < 2 || progress <= 0) return;
      const segmentProgress = Math.max(0, Math.min(1, progress)) * (points.length - 1);
      const completeSegments = Math.floor(segmentProgress);
      const partial = segmentProgress - completeSegments;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.5, width);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let index = 1; index <= completeSegments && index < points.length; index += 1) {
        ctx.lineTo(points[index][0], points[index][1]);
      }
      if (completeSegments < points.length - 1) {
        const from = points[completeSegments];
        const to = points[completeSegments + 1];
        ctx.lineTo(
          from[0] + (to[0] - from[0]) * partial,
          from[1] + (to[1] - from[1]) * partial,
        );
      }
      ctx.stroke();
      ctx.restore();
    };
    const drawArtistSketch = (
      index,
      centerX,
      centerY,
      progress = 1,
      alpha = 1,
      scale = 1,
      groundPixelY = null,
      staysOnGround = false,
      glow = false,
    ) => {
      const reveal = Math.max(0, Math.min(1, Number(progress) || 0));
      const width = Math.max(radius * 4.8, rect.width * 0.25) * scale;
      const height = Math.max(radius * 2.8, rect.height * 0.15) * scale;
      const baseline = staysOnGround && Number.isFinite(Number(groundPixelY))
        ? Number(groundPixelY) - height * 0.18
        : centerY;
      const left = centerX - width * 0.5;
      const top = baseline - height * 0.62;
      const stroke = (points, color, lineWidth, start = 0, end = 1) => {
        const localProgress = Math.max(0, Math.min(1, (reveal - start) / Math.max(0.001, end - start)));
        drawStrokeProgress(points, color, lineWidth, localProgress, alpha);
      };
      const makePoints = (pattern) => pattern.map(([x, y]) => [left + width * x, top + height * y]);
      const roughBallPatterns = [
        [[0.12, 0.5], [0.18, 0.34], [0.31, 0.2], [0.48, 0.13], [0.64, 0.19], [0.8, 0.32], [0.88, 0.5], [0.8, 0.67], [0.65, 0.81], [0.48, 0.88], [0.3, 0.8], [0.17, 0.66], [0.12, 0.5]],
        [[0.18, 0.3], [0.31, 0.36], [0.45, 0.27], [0.58, 0.37], [0.75, 0.29], [0.84, 0.4]],
        [[0.15, 0.56], [0.29, 0.47], [0.42, 0.58], [0.55, 0.46], [0.7, 0.57], [0.84, 0.49]],
        [[0.22, 0.69], [0.34, 0.59], [0.47, 0.72], [0.6, 0.6], [0.76, 0.7]],
        [[0.28, 0.18], [0.25, 0.35], [0.36, 0.49], [0.29, 0.65], [0.4, 0.82]],
        [[0.67, 0.18], [0.7, 0.35], [0.6, 0.5], [0.71, 0.64], [0.62, 0.82]],
      ];
      const offset = Math.max(0, Math.floor(Number(index) || 0)) % roughBallPatterns.length;
      const brushPoint = [
        left + width * (0.12 + reveal * 0.76),
        top + height * (0.5 + Math.sin(reveal * Math.PI * 4 + offset) * 0.15),
      ];
      const ink = "#30343b";
      const softInk = "#5b6470";
      const paleInk = "#aeb6c0";
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (glow) {
        ctx.shadowColor = "#fde047";
        ctx.shadowBlur = Math.max(5, radius * 0.5);
      }
      stroke(makePoints(roughBallPatterns[offset]), ink, Math.max(3, radius * 0.1), 0, 0.78);
      stroke(makePoints(roughBallPatterns[(offset + 1) % roughBallPatterns.length]), ink, Math.max(2.5, radius * 0.075), 0.06, 0.88);
      stroke(makePoints(roughBallPatterns[(offset + 2) % roughBallPatterns.length]), softInk, Math.max(2, radius * 0.06), 0.14, 0.96);
      stroke(makePoints(roughBallPatterns[(offset + 3) % roughBallPatterns.length]), ink, Math.max(1.8, radius * 0.05), 0.24, 1);
      stroke(makePoints(roughBallPatterns[(offset + 4) % roughBallPatterns.length]), paleInk, Math.max(1.5, radius * 0.04), 0.34, 1);
      stroke(makePoints(roughBallPatterns[(offset + 5) % roughBallPatterns.length]), softInk, Math.max(1.5, radius * 0.04), 0.42, 1);
      if (reveal > 0 && reveal < 1) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(brushPoint[0], brushPoint[1]);
        ctx.rotate(-0.62 + Math.sin(reveal * Math.PI * 2) * 0.12);
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = Math.max(3, radius * 0.12);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-radius * 0.62, -radius * 0.5);
        ctx.lineTo(radius * 0.42, radius * 0.36);
        ctx.stroke();
        ctx.fillStyle = "#e5e7eb";
        ctx.beginPath();
        ctx.moveTo(radius * 0.3, radius * 0.25);
        ctx.lineTo(radius * 0.62, radius * 0.5);
        ctx.lineTo(radius * 0.4, radius * 0.72);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = Math.max(1.5, radius * 0.045);
        ctx.stroke();
        ctx.fillStyle = softInk;
        ctx.beginPath();
        ctx.arc(radius * 0.48, radius * 0.48, Math.max(3, radius * 0.13), 0, TAU);
        ctx.fill();
        ctx.fillStyle = paleInk;
        ctx.beginPath();
        ctx.arc(radius * 0.52, radius * 0.43, Math.max(1.5, radius * 0.05), 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    };
    const stormCloudGeometryFor = (drawing, centerX, groundY) => {
      const sprite = raceSprite("thunderCloud");
      const width = Math.max(radius * 5.2, rect.width * 0.22);
      const height = sprite
        ? width * sprite.naturalHeight / (sprite.naturalWidth / 4)
        : Math.max(radius * 1.7, rect.height * 0.08);
      // Storm is an airborne drawing: keep the cloud clear of the number
      // line, leaving the blue strike to make the visible connection down to
      // the layer surface.
      const centerY = Math.max(
        rect.y + height * 0.14,
        groundY - Math.max(radius * 3.4, height * 0.72),
      );
      return { sprite, width, height, centerX, centerY };
    };
    const drawThunderCloud = (drawing, centerX, groundY, alpha = 1, glow = false) => {
      const { sprite, width, height, centerY } = stormCloudGeometryFor(drawing, centerX, groundY);
      ctx.save();
      ctx.globalAlpha = alpha;
      if (glow) {
        ctx.shadowColor = "#fde047";
        ctx.shadowBlur = Math.max(5, radius * 0.5);
      }
      if (sprite) {
        const variant = Math.max(0, Math.floor(Number(drawing?.sequence) || 0)) % 4;
        this.drawRaceSheetCell(ctx, sprite, variant, 4, centerX, centerY, width, height);
      } else {
        ctx.fillStyle = "#4b5563";
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = Math.max(2, radius * 0.08);
        ctx.beginPath();
        ctx.arc(centerX - width * 0.25, centerY, height * 0.23, 0, TAU);
        ctx.arc(centerX, centerY - height * 0.12, height * 0.31, 0, TAU);
        ctx.arc(centerX + width * 0.25, centerY, height * 0.25, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    };
    const drawArtistAsset = (drawing, centerX, groundY, alpha = 1, glow = false) => {
      const name = String(drawing?.name || drawing?.paintingName || "").toUpperCase();
      if (!new Set(["BLOOM", "STORM"]).has(name)) return;
      if (name === "STORM") {
        drawThunderCloud(drawing, centerX, groundY, alpha, glow);
        return;
      }
      const sprite = raceSprite("artistsPaintings");
      if (!sprite) return;
      const cellIndex = name === "BLOOM" ? 1 : 2;
      const width = Math.max(radius * 4.6, rect.width * 0.2);
      const height = width * sprite.naturalHeight / (sprite.naturalWidth / 5);
      const bottomRatio = name === "BLOOM" ? 0.672 : 0.686;
      const assetY = groundY - height * (bottomRatio - 0.5);
      ctx.save();
      if (glow) {
        ctx.shadowColor = "#fde047";
        ctx.shadowBlur = Math.max(5, radius * 0.5);
      }
      this.drawRaceSheetCell(ctx, sprite, cellIndex, 5, centerX, assetY, width, height, 0, alpha);
      ctx.restore();
    };
    const drawCracks = (x, groundY, progress, alpha = 1) => {
      if (!Number.isFinite(Number(groundY))) return;
      const crackProgress = Math.max(0, Math.min(1, (Number(progress) - 0.12) / 0.7));
      if (crackProgress <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha * crackProgress;
      ctx.strokeStyle = "#3f2416";
      ctx.lineWidth = Math.max(2, radius * 0.075);
      ctx.lineCap = "square";
      ctx.lineJoin = "miter";
      for (const [direction, spread, length] of [[-1, 0.9, 1.4], [-1, 0.38, 0.9], [1, 0.72, 1.3], [1, 0.28, 0.8], [1, 1.15, 1.05]]) {
        const endX = x + direction * radius * spread * crackProgress;
        const endY = groundY + radius * length * crackProgress;
        ctx.beginPath();
        ctx.moveTo(x + direction * radius * 0.08, groundY);
        ctx.lineTo(x + direction * radius * spread * 0.42, groundY + radius * 0.22 * crackProgress);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      ctx.restore();
    };
    const drawMonsterSummon = (summon, centerX, groundY, attackPhase, opacity, pathPhase, glow = false) => {
      const spawnProgress = Number.isFinite(Number(summon.spawnProgress))
        ? Math.max(0, Math.min(1, Number(summon.spawnProgress)))
        : 1;
      const monsterGroundY = groundY - (1 - spawnProgress) * rect.height * 0.18;
      const generatedMonster = raceSprite("artistMonster");
      if (generatedMonster) {
        const attack = Number.isFinite(attackPhase);
        const frame = Math.floor((Number(time) || 0) * 8 + pathPhase * 2) % 4;
        const row = attack ? 1 : 0;
        const spriteHeight = Math.max(radius * 4.1, rect.height * 0.18);
        const spriteWidth = spriteHeight * (generatedMonster.naturalWidth / 4) / (generatedMonster.naturalHeight / 2);
        const bottomRatios = attack
          ? [0.693, 0.713, 0.693, 0.631]
          : [0.869, 0.883, 0.877, 0.869];
        const targetBottom = monsterGroundY + (attack ? radius * 0.28 : 0);
        const spriteY = targetBottom - spriteHeight * (bottomRatios[frame] - 0.5);
        const facing = Number(summon.vx) < 0 ? -1 : 1;
        ctx.save();
        if (glow) {
          ctx.shadowColor = "#fde047";
          ctx.shadowBlur = Math.max(5, radius * 0.5);
        }
        ctx.translate(centerX, 0);
        ctx.scale(facing, 1);
        this.drawRaceSheetGridCell(
          ctx,
          generatedMonster,
          frame,
          row,
          4,
          2,
          0,
          spriteY,
          spriteWidth,
          spriteHeight,
          0,
          opacity,
        );
        ctx.restore();
        if (Number.isFinite(attackPhase)) drawCracks(centerX, groundY, attackPhase * spawnProgress, opacity);
        return;
      }
      const stomp = Number.isFinite(attackPhase) ? Math.sin(Math.PI * attackPhase) : 0;
      const walk = Math.sin((Number(time) || 0) * 7 + pathPhase) * radius * 0.06;
      const bodyY = monsterGroundY - radius * 1.25 + walk + stomp * radius * 0.12;
      const bodyWidth = Math.max(radius * 1.5, rect.width * 0.055);
      const bodyHeight = Math.max(radius * 1.4, rect.height * 0.075);
      ctx.save();
      ctx.globalAlpha = opacity;
      if (glow) {
        ctx.shadowColor = "#fde047";
        ctx.shadowBlur = Math.max(5, radius * 0.5);
      }
      ctx.strokeStyle = "#17220f";
      ctx.lineWidth = Math.max(2, radius * 0.08);
      ctx.fillStyle = "#4d7c24";
      ctx.beginPath();
      ctx.ellipse(centerX, bodyY, bodyWidth * 0.52, bodyHeight * 0.52, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#6f9f2f";
      ctx.beginPath();
      ctx.arc(centerX, bodyY - bodyHeight * 0.42, bodyWidth * 0.4, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(centerX - bodyWidth * 0.16, bodyY - bodyHeight * 0.46, Math.max(2, radius * 0.07), 0, TAU);
      ctx.arc(centerX + bodyWidth * 0.16, bodyY - bodyHeight * 0.46, Math.max(2, radius * 0.07), 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#1f2937";
      ctx.beginPath();
      ctx.arc(centerX - bodyWidth * 0.16, bodyY - bodyHeight * 0.46, Math.max(1, radius * 0.03), 0, TAU);
      ctx.arc(centerX + bodyWidth * 0.16, bodyY - bodyHeight * 0.46, Math.max(1, radius * 0.03), 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#17220f";
      ctx.lineWidth = Math.max(2, radius * 0.1);
      ctx.beginPath();
      ctx.moveTo(centerX - bodyWidth * 0.34, bodyY - bodyHeight * 0.06);
      ctx.lineTo(centerX - bodyWidth * 0.66, bodyY + bodyHeight * 0.22);
      ctx.moveTo(centerX + bodyWidth * 0.34, bodyY - bodyHeight * 0.06);
      ctx.lineTo(centerX + bodyWidth * 0.66, bodyY + bodyHeight * 0.22);
      ctx.moveTo(centerX - bodyWidth * 0.22, monsterGroundY - radius * 0.18);
      ctx.lineTo(centerX - bodyWidth * 0.28, monsterGroundY);
      ctx.moveTo(centerX + bodyWidth * 0.22, monsterGroundY - radius * 0.18);
      ctx.lineTo(centerX + bodyWidth * 0.28, monsterGroundY);
      ctx.stroke();
      ctx.restore();
      if (Number.isFinite(attackPhase)) {
        drawCracks(centerX, groundY, attackPhase * spawnProgress, opacity);
        ctx.save();
        ctx.globalAlpha = opacity * Math.max(0.2, 1 - attackPhase);
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = Math.max(2, radius * 0.06);
        ctx.beginPath();
        ctx.ellipse(centerX, groundY, radius * (0.35 + stomp * 0.8), radius * 0.18, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    };
    const drawFairySummon = (summon, centerX, groundY, attackPhase, opacity, pathPhase, glow = false) => {
      const generatedFairy = raceSprite("artistFairy");
      if (generatedFairy) {
        const attack = Number.isFinite(attackPhase);
        const frame = Math.floor((Number(time) || 0) * 8 + pathPhase * 2) % 4;
        const row = attack ? 1 : 0;
        const spriteHeight = Math.max(radius * 4.6, rect.height * 0.2);
        const spriteWidth = spriteHeight * (generatedFairy.naturalWidth / 4) / (generatedFairy.naturalHeight / 2);
        const bottomRatios = attack
          ? [0.84, 0.831, 0.841, 0.868]
          : [0.797, 0.815, 0.795, 0.815];
        const targetBottom = attack ? groundY : groundY - radius * 1.25;
        const spriteY = targetBottom - spriteHeight * (bottomRatios[frame] - 0.5);
        const facing = Number(summon.vx) < 0 ? -1 : 1;
        ctx.save();
        if (glow) {
          ctx.shadowColor = "#fde047";
          ctx.shadowBlur = Math.max(5, radius * 0.5);
        }
        ctx.translate(centerX, 0);
        ctx.scale(facing, 1);
        this.drawRaceSheetGridCell(
          ctx,
          generatedFairy,
          frame,
          row,
          4,
          2,
          0,
          spriteY,
          spriteWidth,
          spriteHeight,
          0,
          opacity,
        );
        ctx.restore();
        return;
      }
      const bob = Math.sin((Number(time) || 0) * 4.5 + pathPhase) * radius * 0.22;
      const fairyY = groundY - radius * 3.15 + bob;
      const bodyRadius = Math.max(radius * 0.38, rect.width * 0.018);
      ctx.save();
      ctx.globalAlpha = opacity;
      if (glow) {
        ctx.shadowColor = "#fde047";
        ctx.shadowBlur = Math.max(5, radius * 0.5);
      }
      ctx.strokeStyle = "#5b247a";
      ctx.lineWidth = Math.max(2, radius * 0.06);
      ctx.fillStyle = "#c084fc";
      ctx.beginPath();
      ctx.ellipse(centerX - bodyRadius * 1.35, fairyY, bodyRadius * 1.35, bodyRadius * 1.05, -0.3, 0, TAU);
      ctx.ellipse(centerX + bodyRadius * 1.35, fairyY, bodyRadius * 1.35, bodyRadius * 1.05, 0.3, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f0abfc";
      ctx.beginPath();
      ctx.arc(centerX, fairyY, bodyRadius, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fef3c7";
      ctx.beginPath();
      ctx.arc(centerX - bodyRadius * 0.3, fairyY - bodyRadius * 0.16, Math.max(1.5, bodyRadius * 0.16), 0, TAU);
      ctx.arc(centerX + bodyRadius * 0.3, fairyY - bodyRadius * 0.16, Math.max(1.5, bodyRadius * 0.16), 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#7e22ce";
      ctx.fillRect(centerX - bodyRadius * 0.35, fairyY + bodyRadius * 0.92, bodyRadius * 0.7, bodyRadius * 1.5);
      ctx.strokeStyle = "#7e22ce";
      ctx.beginPath();
      ctx.moveTo(centerX - bodyRadius * 0.3, fairyY + bodyRadius * 2.2);
      ctx.lineTo(centerX - bodyRadius * 0.75, fairyY + bodyRadius * 2.75);
      ctx.moveTo(centerX + bodyRadius * 0.3, fairyY + bodyRadius * 2.2);
      ctx.lineTo(centerX + bodyRadius * 0.75, fairyY + bodyRadius * 2.75);
      ctx.stroke();
      ctx.restore();
      if (Number.isFinite(attackPhase)) {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.lineCap = "round";
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = Math.max(5, radius * 0.65);
        for (let bolt = 0; bolt < 5; bolt += 1) {
          const offset = (bolt - 2) * radius * 0.42;
          const local = Math.max(0, Math.min(1, attackPhase * 1.45 - (bolt % 3) * 0.14));
          const startY = fairyY + bodyRadius * 1.35;
          const endY = groundY + radius * 0.18;
          const boltY = startY + (endY - startY) * local;
          ctx.strokeStyle = bolt % 2 ? "#fef08a" : "#a5f3fc";
          ctx.lineWidth = Math.max(2, radius * 0.09);
          ctx.beginPath();
          ctx.moveTo(centerX + offset, boltY - radius * 0.28);
          ctx.lineTo(centerX + offset - radius * 0.09, boltY + radius * 0.12);
          ctx.lineTo(centerX + offset + radius * 0.08, boltY + radius * 0.03);
          ctx.lineTo(centerX + offset, boltY + radius * 0.38);
          ctx.stroke();
        }
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(centerX, groundY, Math.max(3, radius * 0.16), 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    };
    const drawStormLightning = (strike, cloudDrawing) => {
      const groundY = groundYForLayer(strike.layerIndex, strike.groundY);
      const cloudGroundY = groundYForLayer(cloudDrawing.layerIndex, cloudDrawing.groundY);
      const cloudCenterX = rect.x + Number(cloudDrawing.x || 0.5) * rect.width;
      const cloud = stormCloudGeometryFor(cloudDrawing, cloudCenterX, cloudGroundY);
      const visualLane = Math.max(0, Math.min(2, Math.floor(Number(strike.visualLane) || 0)));
      const laneOffset = (visualLane - 1) * cloud.width * 0.24;
      const strikeX = Math.max(
        rect.x + cloud.width * 0.16,
        Math.min(rect.x + rect.width - cloud.width * 0.16, cloud.centerX + laneOffset),
      );
      const strikeAge = Math.max(0, Number(strike.age) || 0);
      const strikeAlpha = strike.triggered === false
        ? 0.82
        : Math.max(0.35, 1 - strikeAge / 0.72);
      const topY = Math.min(
        cloud.centerY + cloud.height * 0.2,
        groundY - Math.max(radius * 1.8, rect.height * 0.04),
      );
      const width = Math.max(radius * 1.15, rect.width * 0.04);
      ctx.save();
      ctx.globalAlpha = strikeAlpha;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "#67e8f9";
      ctx.shadowBlur = Math.max(8, radius * 0.7);
      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = Math.max(4, radius * 0.18);
      ctx.beginPath();
      ctx.moveTo(strikeX - width * 0.34, topY);
      ctx.lineTo(strikeX + width * 0.08, topY + (groundY - topY) * 0.24);
      ctx.lineTo(strikeX - width * 0.24, topY + (groundY - topY) * 0.47);
      ctx.lineTo(strikeX + width * 0.22, topY + (groundY - topY) * 0.7);
      ctx.lineTo(strikeX, groundY);
      ctx.stroke();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = Math.max(2, radius * 0.08);
      ctx.stroke();
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(strikeX, groundY, Math.max(4, radius * 0.18), 0, TAU);
      ctx.fill();
      ctx.restore();
    };
    const summonAttackProgress = (summon, kind) => {
      const directAttack = summon.phase === "attack" || summon.state === "attack";
      const attacks = Math.max(0, Number(summon.attacks) || 0);
      const interval = Math.max(0.1, Number(summon.attackInterval) || 0.75);
      const nextAttackAt = Number(summon.nextAttackAt);
      if (attacks > 0 && Number.isFinite(nextAttackAt)) {
        const attackStartedAt = nextAttackAt - interval;
        const duration = kind === "monster" ? 0.36 : 0.3;
        const progress = ((Number(time) || 0) - attackStartedAt) / duration;
        if (progress >= 0 && progress < 1) return Math.max(0, Math.min(1, progress));
      }
      return directAttack ? 0.45 : null;
    };
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    const sourceDrawings = racer.raceArtistDrawings?.length
      ? racer.raceArtistDrawings
      : racer.raceArtistPaintingEffects || [];
    const activePainting = racer.raceArtistActivePainting;
    const paintingForRecord = (record) => ORB_RACE_ARTIST_PAINTINGS[record?.index] || ORB_RACE_ARTIST_PAINTINGS[0];
    const drawingCounts = new Map();
    const drawings = [...sourceDrawings].reverse().filter((drawing) => {
      const painting = paintingForRecord(drawing);
      const key = String(drawing.name || drawing.paintingName || painting.name).toUpperCase();
      const count = drawingCounts.get(key) || 0;
      if (count >= 2) return false;
      drawingCounts.set(key, count + 1);
      return true;
    }).reverse();
    const bloomDrawing = drawings.find((drawing) => (
      String(drawing.name || drawing.paintingName || "").toUpperCase() === "BLOOM"
    ));
    const bloomAge = bloomDrawing ? Math.max(0, Number(bloomDrawing.age) || 0) : Number.POSITIVE_INFINITY;
    const bloomBurst = Number.isFinite(bloomAge) && bloomAge < 0.85
      ? {
        progress: Math.max(0, Math.min(1, bloomAge / 0.72)),
        alpha: Math.max(0, 1 - bloomAge / 0.85),
        x: rect.x + bloomDrawing.x * rect.width,
        y: groundYForLayer(bloomDrawing.layerIndex, bloomDrawing.groundY),
      }
      : null;
    const activeKey = activePainting
      ? String(activePainting.name || activePainting.paintingName || paintingForRecord(activePainting).name).toUpperCase()
      : "";
    const activeSuppressed = Boolean(activePainting && (drawingCounts.get(activeKey) || 0) >= 2);
    const drawCompletedDrawing = (drawing) => {
      const fade = Number.isFinite(Number(drawing.opacity))
        ? Math.max(0, Math.min(1, Number(drawing.opacity)))
        : Math.max(0, 1 - (Number(drawing.age) || 0) / (Number(drawing.lifetime) || 1.4));
      const centerX = rect.x + drawing.x * rect.width;
      const groundY = groundYForLayer(drawing.layerIndex, drawing.groundY);
      const name = String(drawing.name || drawing.paintingName || "").toUpperCase();
      drawArtistAsset(drawing, centerX, groundY, fade, Boolean(bloomBurst && name !== "BLOOM"));
    };
    const drawActivePainting = (active) => {
      const activeX = Number.isFinite(Number(active.x))
        ? Number(active.x)
        : Number.isFinite(Number(racer.raceX)) ? Number(racer.raceX) : 0.5;
      const activeY = Number.isFinite(Number(active.y))
        ? Number(active.y)
        : Number.isFinite(Number(racer.raceY)) ? Number(racer.raceY) : 0.12;
      const activeLayerIndex = Number.isFinite(Number(active.layerIndex))
        ? Number(active.layerIndex)
        : Number(racer.raceLayerIndex) || 0;
      const painting = paintingForRecord(active);
      const groundY = groundYForLayer(activeLayerIndex, active.groundY);
      const sketchY = painting.name === "BLOOM"
        ? groundY - radius * 0.9
        : rect.y + activeY * rect.height - radius * 0.94;
      drawArtistSketch(
        active.index,
        rect.x + activeX * rect.width,
        sketchY,
        active.progress,
        1,
        1.02,
        groundY,
        painting.name === "BLOOM",
        Boolean(bloomBurst && painting.name !== "BLOOM"),
      );
    };
    if (bloomBurst) {
      const maxRadius = Math.hypot(rect.width, rect.height) * 0.72;
      const radiusNow = Math.max(radius * 0.7, maxRadius * bloomBurst.progress);
      ctx.save();
      ctx.globalAlpha = bloomBurst.alpha * 0.12;
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(bloomBurst.x, bloomBurst.y, radiusNow, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = bloomBurst.alpha * 0.72;
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = Math.max(2, radius * 0.08);
      ctx.beginPath();
      ctx.arc(bloomBurst.x, bloomBurst.y, radiusNow, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    const stormClouds = drawings.filter((drawing) => (
      String(drawing.name || drawing.paintingName || "").toUpperCase() === "STORM"
    ));
    const stormCloudById = new Map(stormClouds.map((drawing) => [drawing.id, drawing]));
    const stormStrikesByCloud = new Map();
    for (const strike of racer.raceArtistStormStrikes || []) {
      const cloudDrawing = stormCloudById.get(strike.sourceDrawingId) || stormClouds.at(-1);
      if (!cloudDrawing) continue;
      const key = cloudDrawing.id || "legacy-storm-cloud";
      const strikes = stormStrikesByCloud.get(key) || [];
      strikes.push({ strike, cloudDrawing });
      stormStrikesByCloud.set(key, strikes);
    }
    // Gameplay may continue striking throughout the cloud lifetime, but each
    // cloud always renders exactly three bright bolts directly below it. The
    // latest gameplay strike in each lane drives its pulse; a small fallback
    // keeps the visual cloud readable between fixed-step strike records.
    for (const cloudDrawing of stormClouds) {
      const key = cloudDrawing.id || "legacy-storm-cloud";
      const latestStrikes = (stormStrikesByCloud.get(key) || [])
        .sort((left, right) => (Number(left.strike.strikeAt) || 0) - (Number(right.strike.strikeAt) || 0))
        .slice(-3);
      for (let visualLane = 0; visualLane < 3; visualLane += 1) {
        const laneStrike = latestStrikes
          .filter(({ strike }) => Number(strike.visualLane) === visualLane)
          .at(-1)?.strike;
        const strike = laneStrike
          ? { ...laneStrike, visualLane, triggered: true }
          : {
            visualLane,
            triggered: true,
            age: 0,
            layerIndex: cloudDrawing.layerIndex,
            groundY: cloudDrawing.groundY,
          };
        drawStormLightning(strike, cloudDrawing);
      }
    }
    for (const drawing of drawings) drawCompletedDrawing(drawing);
    for (const summon of racer.raceArtistSummons || []) {
      const kind = String(summon.kind || summon.type || "").toLowerCase();
      if (!new Set(["fairy", "monster"]).has(kind)) continue;
      const attackPhase = summonAttackProgress(summon, kind);
      const centerX = rect.x + summon.x * rect.width;
      const groundY = groundYForLayer(summon.layerIndex, summon.groundY);
      const opacity = Math.max(0, Math.min(1, Number(summon.opacity) || 1));
      if (kind === "fairy") {
        drawFairySummon(
          summon,
          centerX,
          groundY,
          attackPhase,
          opacity,
          Number(summon.pathPhase) || 0,
          Boolean(bloomBurst),
        );
      } else {
        drawMonsterSummon(
          summon,
          centerX,
          groundY,
          attackPhase,
          opacity,
          Number(summon.pathPhase) || 0,
          Boolean(bloomBurst),
        );
      }
    }
    if (activePainting && !activeSuppressed) drawActivePainting(activePainting);
    ctx.restore();
  }

  drawRacePancakeStack(ctx, stack, x, y, radius, alpha = 1, groundPixelY = null, followsArc = false) {
    const phase = String(stack?.flipPhase || "flip");
    const holding = phase === "hold";
    const flipProgress = Math.max(0, Math.min(1, Number(stack?.flipProgress) || 0));
    const flipCount = Math.max(0, Math.floor(Number(stack?.flipCount) || 0));
    const stackIndex = Math.max(0, Math.floor(Number(stack?.stackIndex) || 0));
    // Keep the gameplay stack count in simulation/HUD state, but use one
    // readable pancake in the canvas so the orb never becomes a visual pile.
    const count = 1;
    const width = Math.max(42, radius * 3.8);
    const thickness = Math.max(21, radius * 1.6);
    const layerGap = thickness * 0.8;
    const totalHeight = thickness + (count - 1) * layerGap;
    const hasGround = groundPixelY !== null
      && groundPixelY !== undefined
      && Number.isFinite(Number(groundPixelY));
    const groundY = hasGround ? Number(groundPixelY) : y + radius;
    const baseY = holding || !followsArc ? groundY : y + radius;
    // Keep every pancake face horizontal. The flip is represented by a clean
    // front/back squash around the stack's center, never by rotating the
    // stack into the awkward diagonal pose used by the old generated sheet.
    const turn = holding ? 1 : Math.max(0.12, Math.abs(Math.cos(Math.PI * flipProgress)));
    const direction = (flipCount + stackIndex) % 2 === 0 ? 1 : -1;
    const centerY = baseY - totalHeight * turn * 0.5;
    const layerOpacity = Math.max(0.2, Math.min(1, alpha));
    ctx.save();
    ctx.globalAlpha = layerOpacity;
    ctx.translate(x, centerY);
    ctx.scale(direction, turn);
    ctx.imageSmoothingEnabled = false;
    for (let layer = count - 1; layer >= 0; layer -= 1) {
      const layerY = totalHeight * 0.5 - thickness * 0.5 - layer * layerGap;
      const outerWidth = width * (0.98 - (count - layer - 1) * 0.018);
      const outerHeight = thickness * 0.72;
      ctx.fillStyle = "#111111";
      ctx.beginPath();
      ctx.ellipse(0, layerY, outerWidth * 0.5, outerHeight, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = layer === count - 1 ? "#a95520" : "#8f451e";
      ctx.beginPath();
      ctx.ellipse(0, layerY - thickness * 0.025, outerWidth * 0.485, outerHeight * 0.92, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#d97728";
      ctx.lineWidth = Math.max(1.5, radius * 0.045);
      ctx.beginPath();
      ctx.ellipse(0, layerY - thickness * 0.1, outerWidth * 0.34, outerHeight * 0.25, 0, Math.PI * 0.08, Math.PI * 0.92);
      ctx.stroke();
      ctx.strokeStyle = "#5b2a12";
      ctx.lineWidth = Math.max(1.5, radius * 0.04);
      ctx.beginPath();
      ctx.moveTo(-outerWidth * 0.38, layerY + thickness * 0.08);
      ctx.quadraticCurveTo(0, layerY + thickness * 0.22, outerWidth * 0.38, layerY + thickness * 0.08);
      ctx.stroke();
    }
    const butterWidth = Math.max(17, width * 0.22);
    const butterHeight = Math.max(7, thickness * 0.42);
    const butterY = -totalHeight * 0.5 - butterHeight * 0.1;
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.roundRect(
      -butterWidth * 0.56,
      butterY - butterHeight * 0.56,
      butterWidth * 1.12,
      butterHeight * 1.12,
      Math.max(2, butterHeight * 0.18),
    );
    ctx.fill();
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.roundRect(
      -butterWidth * 0.5,
      butterY - butterHeight * 0.5,
      butterWidth,
      butterHeight,
      Math.max(2, butterHeight * 0.16),
    );
    ctx.fill();
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(-butterWidth * 0.31, butterY - butterHeight * 0.28, butterWidth * 0.44, Math.max(2, butterHeight * 0.15));
    ctx.restore();
  }

  drawRacePancakeOrb(ctx, racer, x, y, radius, time, rect) {
    const stack = racer.racePancakeActiveStack || {
      x: racer.raceX,
      y: racer.raceY,
      side: racer.racePancakeSide,
      flipProgress: racer.racePancakeFlipProgress,
      flipPhase: racer.racePancakeFlipPhase,
      stackCount: racer.racePancakeStackCount,
      rotation: racer.racePancakeSide < 0 ? Math.PI : 0,
    };
    // Pancake always seats against its live race layer. Do not carry a
    // renderer-only hold-layer anchor into long-form world coordinates: the
    // active long-form track is already transformed to the racer's current
    // layer, so an old anchor can place syrup/stack visuals on the adjacent
    // layer after a transition.
    // The transformed body position already follows the active layer. Use
    // that live position rather than reconstructing a line from a stored
    // layer index, which can point at an adjacent long-form lane.
    const groundY = y + radius;
    const visibleX = this.racePancakeVisibleX(rect, radius, x);
    this.drawRacePancakeStack(ctx, stack, visibleX, y, radius, 1, groundY, true);
  }

  racePancakeVisibleX(rect, radius, x) {
    const visualWidth = Math.max(42, radius * 3.8, rect.width * 0.12);
    const edgeGuard = Math.max(10, radius * 0.54);
    const halfWidth = Math.min(rect.width * 0.5, visualWidth * 0.5 + edgeGuard);
    return Math.max(rect.x + halfWidth, Math.min(rect.x + rect.width - halfWidth, x));
  }

  racePancakeGroundY(patch, rect) {
    const patchY = Number(patch?.y);
    const normalizedY = Number.isFinite(patchY)
      ? Math.max(0, Math.min(1, patchY))
      : raceLayerLineY(patch?.layerIndex ?? 0);
    return rect.y + normalizedY * rect.height;
  }

  drawRacePancakeButterMeteor(ctx, meteor, rect, radius) {
    const x = rect.x + Number(meteor?.x || 0.5) * rect.width;
    const y = rect.y + Number(meteor?.y || 0.5) * rect.height;
    const size = Math.max(radius * 1.7, rect.width * (Number(meteor?.radius) || 0.13) * 2.2);
    const rotation = Number(meteor?.rotation) || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.max(0.2, Math.min(1, Number(meteor?.opacity) || 1));
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.roundRect(-size * 0.42, -size * 0.3, size * 0.84, size * 0.6, size * 0.12);
    ctx.fill();
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.roundRect(-size * 0.35, -size * 0.25, size * 0.7, size * 0.5, size * 0.1);
    ctx.fill();
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(-size * 0.22, -size * 0.17, size * 0.25, size * 0.09);
    ctx.restore();
  }

  drawRacePancakeSyrupPatch(ctx, patch, rect, radius) {
    const groundY = this.racePancakeGroundY(patch, rect);
    const x = this.racePancakeVisibleX(
      rect,
      radius,
      rect.x + Number(patch?.x || 0.5) * rect.width,
    );
    const damageScale = Math.max(1, Number(patch?.damageScale) || 1);
    const durationScale = Math.max(1, Number(patch?.durationScale) || 1);
    const patchScale = Math.max(0.9, Math.min(1.8, 0.9 + damageScale * 0.08 + durationScale * 0.04));
    const size = Math.max(radius * 3.4, rect.width * 0.18) * patchScale;
    const opacity = Math.max(0, Math.min(1, Number(patch?.opacity) || 1));
    ctx.save();
    // Center the original splat on the landing line. The line is the hard
    // cutoff, so its upper half disappears while its lower half remains
    // visible below the layer.
    ctx.beginPath();
    ctx.rect(rect.x, groundY, rect.width, Math.max(0, rect.y + rect.height - groundY));
    ctx.clip();
    const syrup = raceSprite("pancakeSyrup");
    if (syrup) {
      const cellWidth = syrup.naturalWidth / 6;
      const cellHeight = syrup.naturalHeight;
      const width = Math.max(radius * 4.4, rect.width * 0.22) * patchScale;
      const height = width * cellHeight / cellWidth;
      this.drawRaceSheetCell(ctx, syrup, 5, 6, x, groundY, width, height, 0, opacity);
      ctx.restore();
      return;
    }
    ctx.globalAlpha = opacity;
    ctx.fillStyle = "#160b08";
    ctx.beginPath();
    ctx.ellipse(x, groundY + size * 0.18, size * 0.58, size * 0.2, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#8f321d";
    ctx.beginPath();
    ctx.ellipse(x, groundY + size * 0.14, size * 0.5, size * 0.14, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#c15a25";
    ctx.beginPath();
    ctx.ellipse(x - size * 0.12, groundY + size * 0.1, size * 0.23, size * 0.055, -0.08, 0, TAU);
    ctx.fill();
    for (const [offsetX, offsetY, dotSize] of [
      [-0.48, 0.26, 0.13],
      [-0.33, 0.45, 0.09],
      [0.36, 0.28, 0.12],
      [0.53, 0.48, 0.07],
    ]) {
      ctx.fillStyle = "#160b08";
      ctx.beginPath();
      ctx.arc(x + size * offsetX, groundY + size * offsetY, size * dotSize, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#8f321d";
      ctx.beginPath();
      ctx.arc(x + size * offsetX, groundY + size * offsetY - size * 0.01, size * dotSize * 0.68, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawRacePancakeButterPatch(ctx, patch, rect, radius) {
    const groundY = this.racePancakeGroundY(patch, rect);
    const x = this.racePancakeVisibleX(
      rect,
      radius,
      rect.x + Number(patch?.x || 0.5) * rect.width,
    );
    const scale = Math.max(0.72, Math.min(1.3, Number(patch?.size) || 1));
    const width = Math.max(radius * 2.6, rect.width * 0.13) * scale;
    const height = Math.max(radius * 0.55, rect.height * 0.035) * scale;
    const opacity = Math.max(0, Math.min(1, Number(patch?.opacity) || 1));
    ctx.save();
    // Match syrup: center the original butter splat on the landing line and
    // let the line hide its upper half while the lower half remains visible.
    ctx.beginPath();
    ctx.rect(rect.x, groundY, rect.width, Math.max(0, rect.y + rect.height - groundY));
    ctx.clip();
    const butter = raceSprite("pancakeButterPatch");
    if (butter) {
      const cellWidth = butter.naturalWidth / 4;
      const cellHeight = butter.naturalHeight;
      const width = Math.max(radius * 4.2, rect.width * 0.2) * scale;
      const height = width * cellHeight / cellWidth;
      const variant = Math.max(0, Math.floor(Number(patch?.variant) || 0)) % 4;
      // Seat the generated puddle on the number line. Its upper half is
      // intentionally clipped while the visible butter remains below it.
      this.drawRaceSheetCell(ctx, butter, variant, 4, x, groundY, width, height, 0, opacity);
      ctx.restore();
      return;
    }
    ctx.globalAlpha = opacity;
    ctx.fillStyle = "#111111";
    ctx.beginPath();
    ctx.ellipse(x, groundY + height * 0.48, width * 0.52, height * 0.7, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#d89b16";
    ctx.beginPath();
    ctx.ellipse(x, groundY + height * 0.4, width * 0.44, height * 0.52, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.ellipse(x - width * 0.12, groundY + height * 0.24, width * 0.18, height * 0.18, -0.12, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawRaceTreeOrb(ctx, racer, x, y, radius, time) {
    const sprite = raceSprite("treeRootsPiercing") || raceSprite("treeRootsTransform");
    const fadeRemaining = Math.max(
      0,
      Number(racer.raceTreeRootsFadeTimer)
        || (Number(racer.raceTreeRootsFadeUntil) > Number(time) ? Number(racer.raceTreeRootsFadeUntil) - Number(time) : 0),
    );
    const rooted = racer.raceTreeRootsActive === true || fadeRemaining > 0;
    const alpha = rooted && racer.raceTreeRootsActive !== true
      ? Math.max(0, Math.min(1, fadeRemaining / 2))
      : 1;
    // Roots are paused for now, so keep the clean first Tree-face orb frame
    // instead of exposing the lower-row/root transition artwork.
    const frame = 0;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (!sprite) {
      ctx.restore();
      return;
    }
    // The generated Tree face is the complete orb. Keep the renderer from
    // rebuilding a procedural orb beneath it, and scale the supplied asset
    // to three times its previous footprint.
    const sourceWidth = sprite.naturalWidth / 4;
    const sourceCellHeight = sprite.naturalHeight / 2;
    const hasPiercingSheet = Boolean(raceSprite("treeRootsPiercing"));
    // The v2 sheet keeps the face orb in the upper ~400px and stores the
    // future roots as a detached lower component in the same cell. Crop that
    // dormant component at source level rather than drawing a second visual.
    const sourceTop = hasPiercingSheet ? 48 : 110;
    const sourceBottom = hasPiercingSheet ? 368 : Math.min(sourceCellHeight, 470);
    const sourceHeight = Math.max(1, Math.min(sourceCellHeight - sourceTop, sourceBottom - sourceTop));
    const treeWidth = radius * 8.4;
    const treeHeight = treeWidth * sourceHeight / sourceWidth;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sprite,
      frame * sourceWidth,
      sourceTop,
      sourceWidth,
      sourceHeight,
      x - treeWidth * 0.5,
      y - treeHeight * 0.5,
      treeWidth,
      treeHeight,
    );
    ctx.restore();
  }

  drawRaceTreeRoots(ctx, racer, rect, radius, time) {
    const fadeRemaining = Math.max(
      0,
      Number(racer.raceTreeRootsFadeTimer)
        || (Number(racer.raceTreeRootsFadeUntil) > Number(time) ? Number(racer.raceTreeRootsFadeUntil) - Number(time) : 0),
    );
    const active = racer.raceTreeRootsActive === true;
    if (!active && fadeRemaining <= 0) return;
    const alpha = active ? 1 : Math.max(0, Math.min(1, fadeRemaining / 2));
    const sprite = raceSprite("treeRootsPiercing") || raceSprite("treeRootsTransform");
    const centerX = rect.x + racer.raceX * rect.width;
    const centerY = rect.y + racer.raceY * rect.height;
    const frame = active
      ? Math.floor((Number(time) || 0) * 5 + (Number(racer.raceTreeRootSequence) || 0)) % 4
      : 3;
    if (sprite) {
      this.drawRaceSheetGridCell(
        ctx,
        sprite,
        frame,
        1,
        4,
        2,
        centerX,
        centerY + radius * 0.18,
        radius * 6.8,
        radius * 5.4,
        0,
        alpha * 0.92,
      );
    }
    const health = Array.isArray(racer.raceLayerHealth) && racer.raceLayerHealth.length
      ? racer.raceLayerHealth
      : [1, 1, 1];
    const drain = Array.isArray(racer.raceTreeRootLayerDrain) && racer.raceTreeRootLayerDrain.length
      ? racer.raceTreeRootLayerDrain
      : racer.raceTreeRootDrainByLayer || [];
    const hasUnclearedLayer = health.some((remainingHealth) => Number(remainingHealth) > 0);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    health.forEach((remainingHealth, layerIndex) => {
      // Tree's shared layer array can be all zero by the time ROOTS starts or
      // during its fade. Keep the visual tendrils attached to every declared
      // number-line slot so the transformation remains legible in replays.
      if (Number(remainingHealth) <= 0 && hasUnclearedLayer) return;
      const normalizedLineY = Number(racer.raceTreeRootLayerGroundYs?.[layerIndex]);
      const lineY = rect.y + (Number.isFinite(normalizedLineY)
        ? normalizedLineY
        : raceLayerLineY(layerIndex)) * rect.height;
      const spread = health.length <= 1 ? 0.5 : layerIndex / Math.max(1, health.length - 1);
      const targetX = rect.x + rect.width * (0.14 + spread * 0.72);
      const direction = targetX >= centerX ? 1 : -1;
      const pierceY = Math.min(rect.y + rect.height, lineY + Math.max(radius * 1.35, rect.height * 0.075));
      ctx.strokeStyle = "#4d2e19";
      ctx.lineWidth = Math.max(3, radius * 0.1);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + radius * 0.72);
      ctx.bezierCurveTo(
        centerX + direction * rect.width * 0.08,
        centerY + rect.height * 0.06,
        targetX - direction * rect.width * 0.08,
        lineY - rect.height * 0.035,
        targetX,
        pierceY,
      );
      ctx.stroke();
      ctx.strokeStyle = "#8fca42";
      ctx.lineWidth = Math.max(1.5, radius * 0.045);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + radius * 0.72);
      ctx.bezierCurveTo(
        centerX + direction * rect.width * 0.08,
        centerY + rect.height * 0.06,
        targetX - direction * rect.width * 0.08,
        lineY - rect.height * 0.035,
        targetX,
        pierceY,
      );
      ctx.stroke();
      const amount = Number(drain[layerIndex]) || Number(racer.raceTreeRootDamagePerLayer) || 0;
      if (amount > 0) {
        ctx.font = `900 ${Math.max(10, radius * 0.3)}px ${PIXEL_FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = Math.max(2, radius * 0.05);
        ctx.strokeStyle = "#080808";
        ctx.fillStyle = "#bbf7d0";
        const labelX = targetX + direction * radius * 0.46;
        const labelY = lineY - radius * 0.35;
        const label = `−${formatRaceDamageValue(racer, amount)}`;
        ctx.strokeText(label, labelX, labelY);
        ctx.fillText(label, labelX, labelY);
      }
    });
    ctx.restore();
  }

  drawRaceExpansionEffects(ctx, racer, def, rect, radius, time) {
    const hasReactorAbility = raceHasAbility(racer, "reactor") || racer.raceOrbId === "tsar-bomb";
    if (!hasReactorAbility && !["turret", "parasite", "draftmaster", "crusher", "reactor", "sniper", "artists", "pancake", "tree"].includes(racer.raceOrbId)) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    if (racer.raceOrbId === "turret") {
      for (const turret of racer.raceTurrets || []) {
        const x = rect.x + turret.x * rect.width;
        const y = rect.y + turret.y * rect.height;
        const size = Math.max(10, radius * 0.72);
        this.drawRaceTurretBody(ctx, x, y, size, turret.angle || 0);
      }
      ctx.fillStyle = "#080808";
      for (const bomb of racer.raceTurretBombs || []) {
        const bombX = rect.x + bomb.x * rect.width;
        const bombY = rect.y + bomb.y * rect.height;
        const bombRadius = Math.max(4, rect.width * (bomb.radius || 0.012));
        ctx.beginPath();
        ctx.arc(bombX, bombY, bombRadius, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#ff7a00";
        ctx.beginPath();
        ctx.arc(bombX, bombY, bombRadius * 0.55, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#080808";
      }
    }
    if (racer.raceOrbId === "parasite") {
      for (const parasite of racer.raceParasites || []) {
        const x = rect.x + parasite.x * rect.width;
        const y = rect.y + parasite.y * rect.height;
        const size = Math.max(5, radius * 0.28);
        ctx.fillStyle = "#080808";
        ctx.beginPath();
        ctx.arc(x, y, size + 1.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#6b4f2a";
        ctx.beginPath();
        ctx.arc(x, y, size, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#79a83b";
        ctx.beginPath();
        ctx.arc(x - size * 0.22, y - size * 0.18, size * 0.24, 0, TAU);
        ctx.arc(x + size * 0.25, y + size * 0.22, size * 0.2, 0, TAU);
        ctx.fill();
      }
    }
    if (racer.raceOrbId === "draftmaster") {
      const ammoSprite = raceSprite("draftmasterAmmo");
      for (const impact of racer.raceDraftImpactEffects || []) {
        const progress = Math.max(
          0,
          Math.min(1, (Number(impact.age) || 0) / (Number(impact.lifetime) || 0.64)),
        );
        const x = rect.x + impact.x * rect.width;
        const y = rect.y + impact.y * rect.height;
        const impactSprite = raceSprite(impact.kind === "sword" ? "impactCritical" : "impactCollision");
        const impactSize = radius
          * (impact.kind === "sword" ? 3.9 : 3.2)
          * DRAFTMASTER_VISUAL_SCALE
          * (1 + progress * 0.45);
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress * 0.88);
        ctx.imageSmoothingEnabled = false;
        if (impactSprite) {
          ctx.drawImage(
            impactSprite,
            x - impactSize * 0.5,
            y - impactSize * 0.5,
            impactSize,
            impactSize,
          );
        } else {
          ctx.strokeStyle = impact.kind === "sword" ? "#e53935" : "#20d8ff";
          ctx.lineWidth = Math.max(3, radius * 0.12);
          ctx.beginPath();
          ctx.arc(x, y, impactSize * (0.28 + progress * 0.2), 0, TAU);
          ctx.stroke();
        }
        ctx.restore();
      }
      for (const bullet of racer.raceDraftBullets || []) {
        const x = rect.x + bullet.x * rect.width;
        const y = rect.y + bullet.y * rect.height;
        const tier = Math.min(2, Math.max(0, bullet.ammoTier || 0));
        const bulletRadius = Math.max(
          8,
          rect.width * (bullet.radius || 0.014) * DRAFTMASTER_BULLET_SCALE,
        );
        const width = bulletRadius * (tier === 1 ? 3.5 : tier === 2 ? 3.15 : 2.8);
        const height = bulletRadius * (tier === 2 ? 1.8 : 1.45);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Number.isFinite(bullet.angle) ? -bullet.angle : Math.PI / 2);
        ctx.imageSmoothingEnabled = false;
        ctx.shadowColor = tier === 2 ? "#ff4655" : "#39d8ff";
        ctx.shadowBlur = Math.max(4, bulletRadius * 0.32);
        ctx.fillStyle = tier === 2 ? "#ff4655aa" : "#39d8ffaa";
        ctx.strokeStyle = tier === 2 ? "#ffd7d7" : "#d8fbff";
        ctx.lineWidth = Math.max(1.5, bulletRadius * 0.1);
        ctx.beginPath();
        ctx.ellipse(0, 0, width * 0.34, height * 0.64, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
        if (ammoSprite) {
          const sourceWidth = ammoSprite.naturalWidth / 3;
          ctx.drawImage(
            ammoSprite,
            tier * sourceWidth,
            0,
            sourceWidth,
            ammoSprite.naturalHeight,
            -width * 0.45,
            -height * 0.5,
            width,
            height,
          );
        } else {
          ctx.fillStyle = tier === 2 ? "#b91c1c" : "#d6b85a";
          ctx.strokeStyle = "#080808";
          ctx.lineWidth = Math.max(2, bulletRadius * 0.18);
          ctx.fillRect(-width * 0.45, -height * 0.5, width, height);
          ctx.strokeRect(-width * 0.45, -height * 0.5, width, height);
        }
        ctx.restore();
      }
    }
    if (racer.raceOrbId === "sniper") {
      const sprite = raceSprite("sniperWeapons");
      if (sprite) {
        const source = sniperWeaponSourceRect(sprite.naturalWidth, sprite.naturalHeight, 1);
        for (const bullet of racer.raceSniperBullets || []) {
          const x = rect.x + bullet.x * rect.width;
          const y = rect.y + bullet.y * rect.height;
          const size = Math.max(18, rect.width * (bullet.radius || 0.018) * 3.4);
          const width = size * 2.8;
          const height = width * source.height / source.width;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Number.isFinite(bullet.angle) ? bullet.angle : Math.PI / 2);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            sprite,
            source.x,
            source.y,
            source.width,
            source.height,
            -width * 0.5,
            -height * 0.5,
            width,
            height,
          );
          ctx.restore();
        }
      }
    }
    if (racer.raceOrbId === "crusher") {
      for (const crack of racer.raceCrusherCracks || []) {
        const x = rect.x + crack.x * rect.width;
        const y = rect.y + crack.y * rect.height;
        const crackScale = Math.max(1, Math.min(2.8, Number(crack.width) || 1));
        const span = Math.max(radius * 2.25, rect.width * 0.16) * crackScale;
        const vertical = Math.max(radius * 0.72, rect.height * 0.028) * crackScale;
        ctx.save();
        // Crusher damage leaves a permanent scar on every wall it hits.
        ctx.globalAlpha = 0.94;
        ctx.strokeStyle = "#12161b";
        ctx.lineWidth = Math.max(3, radius * 0.13);
        ctx.lineCap = "round";
        for (const direction of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + direction * span * 0.3, y - vertical * 0.42);
          ctx.lineTo(x + direction * span * 0.58, y + vertical * 0.2);
          ctx.lineTo(x + direction * span, y - vertical * 0.12);
          ctx.moveTo(x + direction * span * 0.58, y + vertical * 0.2);
          ctx.lineTo(x + direction * span * 0.76, y + vertical * 0.82);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - span * 0.12, y + vertical * 0.78);
        ctx.lineTo(x + span * 0.08, y + vertical * 1.18);
        ctx.stroke();
        ctx.restore();
      }
    }
    if (hasReactorAbility) {
      const reactorEffects = [
        ...(racer.raceReactorEffects || []),
        ...(racer.raceTsarBombReactorEffects || []),
      ];
      for (const effect of reactorEffects) {
        const progress = Math.max(0, Math.min(1, effect.age / RACE_REACTOR_EFFECT_SECONDS));
        const x = rect.x + effect.x * rect.width;
        const y = rect.y + effect.y * rect.height;
        const wholeBoxRadius = Math.hypot(rect.width, rect.height) * 0.6;
        const explosionRadius = Math.max(
          radius * 0.5,
          wholeBoxRadius * (0.035 + progress * 0.965),
        );
        ctx.save();
        ctx.globalAlpha = Math.max(0.08, 0.78 * (1 - progress * 0.72));
        ctx.fillStyle = "#168cff44";
        ctx.strokeStyle = "#9de9ff";
        ctx.lineWidth = Math.max(3, radius * 0.12 + progress * radius * 0.06);
        ctx.beginPath();
        ctx.arc(x, y, explosionRadius, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
    if (racer.raceOrbId === "artists") {
      this.drawRaceArtistPaintings(ctx, racer, def, rect, radius, time);
    }
    if (racer.raceOrbId === "pancake") {
      const syrupPatches = racer.racePancakePatches || [];
      const butterPatches = racer.racePancakeButterPatches || [];
      // Gameplay removes landing marks when the shared race lane advances, so
      // only the current layer's syrup or butter marks are drawn here.
      for (const patch of syrupPatches) this.drawRacePancakeSyrupPatch(ctx, patch, rect, radius);
      for (const patch of butterPatches) this.drawRacePancakeButterPatch(ctx, patch, rect, radius);
      // The active stack is drawn after the patches so each landing visibly
      // settles onto its selected syrup or butter mark.
      if (racer.racePancakeActiveStack) {
        this.drawRacePancakeOrb(
          ctx,
          racer,
          rect.x + racer.raceX * rect.width,
          rect.y + racer.raceY * rect.height,
          radius,
          time,
          rect,
        );
      }
      for (const meteor of racer.racePancakeButterMeteors || []) {
        this.drawRacePancakeButterMeteor(ctx, meteor, rect, radius);
      }
    }
    ctx.restore();
  }

  drawRaceMeteorProjectiles(ctx, racer, rect, radius) {
    if (!raceHasAbility(racer, "meteor")) return;
    const tiny = raceTransparentSprite("meteorTiny", "race-magenta");
    const giant = raceTransparentSprite("meteorGiant", "race-magenta");
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    for (const projectile of racer.raceMeteorProjectiles || []) {
      const x = rect.x + projectile.x * rect.width;
      const y = rect.y + projectile.y * rect.height;
      const size = Math.max(10, rect.width * (projectile.radius || 0.018) * 2.7);
      if (tiny) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(projectile.rotation || 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tiny, -size, -size, size * 2, size * 2);
        ctx.restore();
      }
    }
    for (const projectile of racer.raceMeteorGiantProjectiles || []) {
      const x = rect.x + projectile.x * rect.width;
      const y = rect.y + projectile.y * rect.height;
      const height = Math.max(radius * 14, rect.height * 0.46);
      const width = height * 0.5;
      if (giant) {
        ctx.save();
        ctx.translate(x, y);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(giant, -width / 2, -height * 0.84, width, height);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  drawRaceMeteorBurns(ctx, racer, rect, layerIndex, layerY, layerHeight, time) {
    const burns = (racer.raceMeteorBurns || []).filter((burn) => burn.layerIndex === layerIndex);
    if (!burns.length) return;
    const fire = raceTransparentSprite("meteorFire", "race-magenta");
    if (!fire) return;
    for (const burn of burns) {
      const remaining = Math.max(0, burn.until - time);
      const fade = Math.min(1, remaining / 0.55, (METEOR_BURN_SECONDS - remaining) / 0.35 + 0.01);
      for (const patch of burn.patches || []) {
        const x = rect.x + rect.width * patch.x;
        const y = layerY + layerHeight * patch.y;
        const width = Math.max(26, rect.width * 0.16 * (patch.scale || 1));
        const height = Math.max(18, layerHeight * 0.28 * (patch.scale || 1));
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(0.9, fade * (0.72 + Math.sin(time * 8 + patch.x * 17) * 0.12)));
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(fire, x - width / 2, y - height / 2, width, height);
        ctx.restore();
      }
    }
  }

  drawRaceMeteorHorn(ctx, racer, x, y, radius, time) {
    if (!raceHasAbility(racer, "meteor") || time >= (racer.raceMeteorHornUntil || 0)) return;
    const horn = raceTransparentSprite("meteorHorn", "race-magenta");
    if (!horn) return;
    const size = radius * 2.8;
    ctx.save();
    ctx.globalAlpha = Math.min(1, Math.max(0, (racer.raceMeteorHornUntil - time) / 0.32));
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x - radius * 1.35, y - radius * 1.15);
    ctx.rotate(-0.18);
    ctx.drawImage(horn, -size * 0.5, -size * 0.38, size, size * 0.76);
    ctx.restore();
  }

  layout(width, height, sim = null) {
    return socialBattleLayout(width, height, this.format, sim?.arenaSize || "standard");
  }

  updateClassicHealthMarkers(sim) {
    if (sim?.gameplayMode !== "classic") return;
    const simTime = Math.max(0, Number(sim.time) || 0);
    if (this.classicMarkerSimulation !== sim || simTime < this.classicMarkerLastTime) {
      this.classicMarkerSimulation = sim;
      this.classicMarkerLastTime = simTime;
      this.classicPreviousHealth = new Map();
      this.classicHealthMarkers = [];
      this.classicHealthMarkerEventIds = new Set();
      this.classicContinuousHealthRemainders = new Map();
      this.classicZeusMarkerSequences = new Map();
      for (const fighter of sim.fighters || []) {
        this.classicPreviousHealth.set(fighter.id, Number(fighter.health) || 0);
      }
      return;
    }

    this.classicHealthMarkerEventIds ||= new Set();
    this.classicContinuousHealthRemainders ||= new Map();
    this.classicZeusMarkerSequences ||= new Map();
    const markerEventFloor = this.classicMarkerLastTime;
    for (const fighter of sim.fighters || []) {
      const health = Number(fighter.health) || 0;
      const previous = this.classicPreviousHealth.get(fighter.id);
      this.classicPreviousHealth.set(fighter.id, health);
      if (!Number.isFinite(previous)) continue;
      const fighterSeed = Array.from(String(fighter.id || fighter.type || "orb"))
        .reduce((sum, character) => sum + character.charCodeAt(0), 0);
      const addMarker = (markerDelta, seedOffset = 0, startedAt = simTime) => {
        this.classicHealthMarkers.push({
          fighterId: fighter.id,
          delta: markerDelta,
          x: fighter.x,
          y: fighter.y,
          startedAt: Number.isFinite(Number(startedAt)) ? Math.min(simTime, Number(startedAt)) : simTime,
          drift: (fighterSeed + seedOffset) % 2 === 0 ? -1 : 1,
        });
      };
      const delta = health - previous;
      const zeusSequence = Number(fighter.classicZeusDamageMarkerSequence) || 0;
      const lastZeusSequence = Number(this.classicZeusMarkerSequences.get(fighter.id)) || 0;
      const zeusMarkerDue = zeusSequence > lastZeusSequence;
      const zeusMarkerAmount = Math.abs(Number(fighter.classicZeusDamageMarkerAmount) || 0);
      const zeusMarkerAt = Number.isFinite(Number(fighter.classicZeusDamageMarkerAt))
        ? Number(fighter.classicZeusDamageMarkerAt)
        : simTime;
      const freshEvents = (sim.events || []).filter((event, eventIndex) => {
        const eventTime = Number(event.time);
        if (Number.isFinite(eventTime) && eventTime <= markerEventFloor) return false;
        const eventKey = Number.isFinite(Number(event.id))
          ? `health:${event.id}`
          : `health:${simTime}:${eventIndex}:${event.type || event.kind || "event"}`;
        if (this.classicHealthMarkerEventIds.has(eventKey)) return false;
        const isHeal = event.type === "classic-heal" && event.fighterId === fighter.id;
        const isDamage = event.targetId === fighter.id;
        if (!isHeal && !isDamage) return false;
        if (!Number.isFinite(Number(event.amount)) || Math.abs(Number(event.amount)) < 0.001) return false;
        this.classicHealthMarkerEventIds.add(eventKey);
        return true;
      });
      // Every explicit damage/heal event gets its own marker. In particular,
      // a pistol volley remains two separate -3 labels and a burst of web
      // ticks remains a stack of individual -1 labels. A Lazer line pass is
      // the one exception: simulation emits both a laser-pass event and a
      // matching dot-tick seam for the same hit, so those two records must
      // resolve to one visible transaction. A two-fist Boxer/Monster critical
      // is another deliberate exception: Gameplay emits one five-damage
      // event per fist plus a critical announcement carrying the combined
      // amount. The announcement is audio/presentation-only, so it must not
      // become a second marker or a misleading positive residual. Group the
      // two fist contacts into one visible transaction instead.
      if (freshEvents.length) {
        const markerEvents = [];
        const criticalPunchGroups = new Map();
        for (const event of freshEvents) {
          if (event.type === "classic-critical") continue;
          if (event.type === "classic-punch-hit" && event.critical === true) {
            const eventTime = Number(event.time);
            const groupKey = [
              event.fighterId || "fighter",
              event.targetId || fighter.id,
              Number.isFinite(eventTime) ? eventTime : simTime,
            ].join(":");
            const existing = criticalPunchGroups.get(groupKey);
            if (existing) {
              existing.amount += Math.abs(Number(event.amount) || 0);
            } else {
              const grouped = { ...event, amount: Math.abs(Number(event.amount) || 0) };
              criticalPunchGroups.set(groupKey, grouped);
              markerEvents.push(grouped);
            }
            continue;
          }
          markerEvents.push(event);
        }
        let representedDelta = 0;
        let zeusEventMatched = false;
        markerEvents.forEach((event, index) => {
          if (event.type === "classic-dot-tick" && String(event.dotKind || "") === "chain-lightning") {
            zeusEventMatched = true;
          }
          const isDuplicateLaserTick = event.type === "classic-dot-tick"
            && markerEvents.some((candidate) => (
              candidate !== event
              && candidate.type === "classic-laser-pass"
              && candidate.entityId != null
              && candidate.entityId === event.entityId
              && candidate.fighterId === event.fighterId
              && candidate.targetId === event.targetId
              && (!Number.isFinite(Number(candidate.time))
                || !Number.isFinite(Number(event.time))
                || Math.abs(Number(candidate.time) - Number(event.time)) < 0.00001)
            ));
          if (isDuplicateLaserTick) return;
          const amount = Math.abs(Number(event.amount) || 0);
          const isHeal = event.type === "classic-heal" && event.fighterId === fighter.id;
          representedDelta += isHeal ? amount : -amount;
          const continuousWebType = event.dotKind || event.projectileKind || event.hazardKind;
          const isContinuousWebEvent = !isHeal && (
            (event.type === "classic-dot-tick"
              && CLASSIC_CONTINUOUS_WEB_DAMAGE_TYPES.has(String(continuousWebType || "").toLowerCase()))
            || event.type === "classic-laser-pass"
          );
          if (isContinuousWebEvent) {
            const remainderKey = `${event.entityId || event.fighterId || event.sourceId || "source"}:${fighter.id}:${String(continuousWebType || "laser").toLowerCase()}`;
            const accumulated = (this.classicContinuousHealthRemainders.get(remainderKey) || 0) + amount;
            const wholeDamage = Math.floor(accumulated + 1e-6);
            this.classicContinuousHealthRemainders.set(remainderKey, accumulated - wholeDamage);
            if (wholeDamage > 0) addMarker(-wholeDamage, index, event.time);
            return;
          }
          // Every explicit event carries the authoritative gameplay amount.
          // Do not normalize recurring sources to -1: Blue Sun is -5 per
          // tick, Vampire/Necromancer/Trapper/Snake retain their configured
          // values, and Cutter keeps its current per-second amount.
          addMarker(isHeal ? amount : -amount, index, event.time);
        });
        // The simulation keeps a target-owned Zeus marker stamp as a fallback
        // for frames where the short event ring has already rotated past the
        // dot-tick. It is still one marker for one health transaction because
        // the authoritative amount is folded into representedDelta here.
        if (zeusMarkerDue && !zeusEventMatched && zeusMarkerAmount > 0) {
          addMarker(-zeusMarkerAmount, 700, zeusMarkerAt);
          representedDelta -= zeusMarkerAmount;
        }
        // Keep an unexpected health delta visible even if a new gameplay event
        // was introduced without carrying its full amount field yet.
        const residual = delta - representedDelta;
        if (Math.abs(residual) >= 0.001) addMarker(residual, markerEvents.length);
        if (zeusMarkerDue) this.classicZeusMarkerSequences.set(fighter.id, zeusSequence);
        continue;
      }
      if (zeusMarkerDue && zeusMarkerAmount > 0) {
        addMarker(-zeusMarkerAmount, 700, zeusMarkerAt);
        this.classicZeusMarkerSequences.set(fighter.id, zeusSequence);
        continue;
      }
      if (Math.abs(delta) < 0.001) continue;
      const webDamageEvent = (sim.events || []).some((event) => {
        const eventType = String(event.type || event.kind || event.reason || "").toLowerCase();
        const eventTouchesFighter = event.targetId === fighter.id
          || event.fighterId === fighter.id
          || event.ownerId === fighter.id
          || event.sourceId === fighter.id;
        if (!eventTouchesFighter) return false;
        const source = (sim.fighters || []).find((candidate) => candidate.id === event.fighterId);
        return Boolean(
          (source && CLASSIC_WEB_DAMAGE_TYPES.has(source.type))
          || CLASSIC_WEB_DAMAGE_TYPES.has(event.projectileKind)
          || CLASSIC_WEB_DAMAGE_TYPES.has(event.dotKind)
          || eventType.includes("vampire")
          || eventType.includes("leech")
          || eventType.includes("heal")
          || eventType.includes("spike"),
        );
      });
      // A render frame can cover several fixed simulation steps, so the
      // latest `classic-heal` event may already have rolled out of the short
      // event buffer by the time this health delta is observed. Preserve the
      // observed whole transaction when possible; only a small fractional
      // fallback is promoted to one readable point for a missed DOT event.
      const vampireHeal = fighter.type === "vampire" && delta > 0;
      const discreteHealthEvent = webDamageEvent || vampireHeal;
      const fallbackAmount = Math.abs(delta) < 0.95
        ? 1
        : Math.round(Math.abs(delta) * 10) / 10;
      const markerDelta = discreteHealthEvent
        ? (delta < 0 ? -fallbackAmount : fallbackAmount)
        : delta;
      addMarker(markerDelta);
      if (zeusMarkerDue) this.classicZeusMarkerSequences.set(fighter.id, zeusSequence);
    }
    this.classicMarkerLastTime = simTime;
    this.classicHealthMarkers = this.classicHealthMarkers
      .filter((marker) => (
        classicHealthMarkerOpacity(simTime - marker.startedAt) > 0
        && Math.abs(marker.delta) >= 0.45
      ));
  }

  drawClassicHealthMarkers(ctx, sim, rect) {
    const simTime = Math.max(0, Number(sim?.time) || 0);
    const scaleX = rect.width / ARENA.width;
    const scaleY = rect.height / ARENA.height;
    const fontSize = Math.max(42, Math.min(70, rect.width * 0.066));
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.font = `900 ${fontSize}px ${CLASSIC_TITLE_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = Math.max(4, fontSize * 0.075);
    ctx.strokeStyle = "#050505";
    const activeMarkers = this.classicHealthMarkers.filter((marker) => (
      classicHealthMarkerOpacity(simTime - marker.startedAt) > 0
      && Math.abs(marker.delta) >= 0.45
    ));
    // Keep every discrete hit visible for a half-second, then fade it fully by
    // one second. There is intentionally no display cap: simultaneous health
    // changes may overlap, but no damage/heal transaction is silently discarded.
    const visibleMarkers = activeMarkers;
    visibleMarkers.forEach((marker, markerIndex) => {
      const age = Math.max(0, simTime - marker.startedAt);
      const opacity = classicHealthMarkerOpacity(age);
      if (opacity <= 0) return;
      const riseProgress = classicHealthMarkerRise(age);
      const fighter = (sim?.fighters || []).find((candidate) => candidate.id === marker.fighterId);
      const centerX = Number(fighter?.x ?? marker.x);
      const centerY = Number(fighter?.y ?? marker.y);
      const fighterRadius = classicHealthMarkerRadiusFor(fighter);
      const fighterMarkerIndex = visibleMarkers
        .slice(0, markerIndex)
        .filter((candidate) => candidate.fighterId === marker.fighterId)
        .length;
      const x = rect.x + centerX * scaleX
        + marker.drift * riseProgress * fontSize * 0.12
        + (fighterMarkerIndex % 2 === 1 ? fontSize * 0.18 : 0);
      // Health feedback belongs to the orb that owns the transaction, not to
      // the world-space contact point where a projectile happened to land.
      // Re-read the fighter position each frame so moving orbs carry their
      // markers directly above their current body.
      const y = rect.y + centerY * scaleY
        - fighterRadius * Math.min(scaleX, scaleY)
        - fontSize * (0.78 + fighterMarkerIndex * 0.62 + riseProgress * 0.92);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = marker.delta >= 0 ? "#34e56f" : "#ff4d55";
      // Keep the representative latch readable: damage is shown as a clean
      // whole-number hit while healing may retain a small fractional gain.
      const displayDelta = marker.delta < 0 ? Math.round(marker.delta) : marker.delta;
      if (Math.abs(displayDelta) < 0.5) return;
      const label = classicHealthDeltaLabel(displayDelta);
      ctx.strokeText(label, x, y);
      ctx.fillText(label, x, y);
    });
    ctx.restore();
  }

  drawBackground(ctx, width, height, gameplayMode = "classic", classicBlackTheme = false) {
    ctx.fillStyle = gameplayMode === "classic" && classicBlackTheme
      ? "#000000"
      : gameplayMode === "classic" ? "#f7f0e5" : "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  classicTitleAccessoryFor(fighter) {
    const type = fighter?.type;
    const weaponProfile = PIXEL_WEAPON_PROFILES[type];
    const weaponSprite = this.arenaRenderer?.weaponSprites?.get(type);
    if (weaponProfile && weaponSprite?.image) {
      return {
        kind: "weapon",
        image: weaponSprite.image,
        widthRatio: 1.2,
        heightRatio: 1.08,
      };
    }
    const gearSprite = this.arenaRenderer?.gearSprites?.get(type);
    if (gearSprite?.image) {
      return {
        kind: "accessory",
        image: gearSprite.image,
        widthRatio: 1.12,
        heightRatio: 1.12,
      };
    }
    return null;
  }

  drawClassicTitleAccessory(ctx, accessory, segment, centerY) {
    const image = accessory?.image;
    if (!image || !segment || segment.width <= 0 || segment.height <= 0) return;
    const naturalWidth = Number(image.naturalWidth || image.width) || 1;
    const naturalHeight = Number(image.naturalHeight || image.height) || 1;
    const aspect = naturalWidth / naturalHeight;
    const maxWidth = segment.width * 0.9;
    const maxHeight = segment.height * 0.9;
    let drawWidth = maxWidth;
    let drawHeight = drawWidth / aspect;
    if (drawHeight > maxHeight) {
      drawHeight = maxHeight;
      drawWidth = drawHeight * aspect;
    }
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      image,
      segment.x + (segment.width - drawWidth) / 2,
      centerY - drawHeight / 2,
      drawWidth,
      drawHeight,
    );
    ctx.restore();
  }

  drawFighterNames(ctx, sim, rect, classicBlackTheme = false, classicTeamColors = true) {
    const fighters = sim.fighters.slice(0, 2);
    if (!fighters.length) return;
    const classicTeamLayout = sim.gameplayMode === "classic"
      && Array.isArray(sim.classicTeams)
      && sim.classicTeams.length === 2;
    const classicTeamNames = classicTeamLayout
      ? sim.classicTeams.map((team, teamIndex) => (
        sim.classicTeamNames?.[teamIndex]
        || classicTeamDisplayName(team, sim.classicTeamOptions?.[teamIndex])
        || `TEAM ${teamIndex + 1}`
      ))
      : null;
    const titleFighters = classicTeamLayout
      ? [
        sim.fighters.find((fighter) => fighter.classicTeamIndex === 0) || fighters[0],
        sim.fighters.find((fighter) => fighter.classicTeamIndex === 1) || fighters[1] || fighters[0],
      ]
      : fighters;
    ctx.save();
    const getAccessory = typeof this.classicTitleAccessoryFor === "function"
      ? this.classicTitleAccessoryFor.bind(this)
      : () => null;
    const drawAccessory = typeof this.drawClassicTitleAccessory === "function"
      ? this.drawClassicTitleAccessory.bind(this)
      : () => {};
    const leftAccessory = classicTeamLayout ? null : getAccessory(titleFighters[0]);
    const rightAccessory = classicTeamLayout ? null : titleFighters[1] ? getAccessory(titleFighters[1]) : null;
    const leftName = classicTeamLayout ? classicTeamNames[0] : titleFighters[0].name;
    const rightName = classicTeamLayout ? classicTeamNames[1] : titleFighters[1]?.name || "";
    const titleLayout = classicMatchupTitleLayout(
      ctx,
      leftName,
      rightName,
      {
        width: rect.width,
        safeWidth: rect.width * 0.94,
        maxFontSize: Math.min(84, rect.height * 0.66, rect.width * 0.12),
        minFontSize: Math.max(22, rect.height * 0.28),
        leftIcon: leftAccessory,
        rightIcon: rightAccessory,
      },
    );
    const titleColorFor = (fighter, teamIndex = null) => teamIndex !== null && classicTeamColors
      ? classicTeamOutlineColorFor(teamIndex)
      : fighter.type === "lazer"
      ? "#b66cff"
      : CLASS_DEFS[fighter.type]?.color || "#ffffff";

    if (sim.gameplayMode === "classic") {
      const statY = rect.y + Math.max(8, rect.height * 0.1);
      const maxStatSize = Math.min(24, Math.max(10, rect.height * 0.16));
      const minStatSize = Math.max(8, Math.min(12, maxStatSize));
      const drawTopStat = (fighter, teamIndex, align, x) => {
        const text = classicTopStatLineFor(fighter);
        if (!text) return;
        ctx.textAlign = align;
        ctx.textBaseline = "middle";
        setFittedFont(
          ctx,
          text,
          rect.width * 0.39,
          900,
          maxStatSize,
          minStatSize,
          CLASSIC_CTA_FONT,
        );
        ctx.lineWidth = Math.max(2, maxStatSize * 0.07);
        ctx.strokeStyle = "#080808";
        ctx.fillStyle = titleColorFor(fighter, teamIndex);
        ctx.strokeText(text, x, statY);
        ctx.fillText(text, x, statY);
      };
      drawTopStat(
        titleFighters[0],
        classicTeamLayout ? 0 : null,
        "left",
        rect.x + rect.width * 0.035,
      );
      if (titleFighters.length >= 2) {
        drawTopStat(
          titleFighters[1],
          classicTeamLayout ? 1 : null,
          "right",
          rect.x + rect.width * 0.965,
        );
      }
    }

    ctx.font = `900 ${titleLayout.fontSize}px ${CLASSIC_TITLE_FONT}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.lineWidth = Math.max(3, titleLayout.fontSize * 0.06);
    ctx.strokeStyle = "#080808";
    const y = rect.y + rect.height * 0.54;
    const drawHydrogenTimer = (fighter, align, x) => {
      if (fighter?.type !== "hydrogen-bomb") return;
      const startedAt = Number.isFinite(Number(fighter.classicHydrogenCountdownStartedAt))
        ? Number(fighter.classicHydrogenCountdownStartedAt)
        : null;
      const elapsed = startedAt === null
        ? 0
        : Math.max(0, (Number(sim.time) || 0) - startedAt);
      const remaining = Math.max(0, 60 - elapsed);
      ctx.save();
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      setFittedFont(
        ctx,
        "BOMB " + remaining.toFixed(1) + "S",
        rect.width * 0.32,
        900,
        Math.max(12, titleLayout.fontSize * 0.34),
        9,
        CLASSIC_CTA_FONT,
      );
      ctx.lineWidth = Math.max(2, titleLayout.fontSize * 0.04);
      ctx.strokeStyle = "#080808";
      ctx.fillStyle = "#ffd400";
      ctx.strokeText("BOMB " + remaining.toFixed(1) + "S", x, y - titleLayout.fontSize * 0.8);
      ctx.fillText("BOMB " + remaining.toFixed(1) + "S", x, y - titleLayout.fontSize * 0.8);
      ctx.restore();
    };
    drawHydrogenTimer(titleFighters[0], "left", rect.x + (titleLayout.leftSegment?.x || rect.width * 0.04));
    if (titleFighters.length >= 2) {
      const rightSegment = titleLayout.rightSegment || { x: rect.width * 0.96, width: 0 };
      drawHydrogenTimer(titleFighters[1], "right", rect.x + rightSegment.x + rightSegment.width);
    }
    const drawRun = (segment, text, color) => {
      if (!segment || !text) return;
      ctx.fillStyle = color;
      ctx.strokeText(text, rect.x + segment.x, y);
      ctx.fillText(text, rect.x + segment.x, y);
    };
    drawRun(titleLayout.leftSegment, titleLayout.left, titleColorFor(titleFighters[0], classicTeamLayout ? 0 : null));
    drawAccessory(
      ctx,
      leftAccessory,
      titleLayout.leftIconSegment && {
        ...titleLayout.leftIconSegment,
        x: rect.x + titleLayout.leftIconSegment.x,
      },
      y,
    );
    drawRun(titleLayout.vsSegment, titleLayout.vs, classicBlackTheme ? "#ffffff" : "#ffffff");
    drawAccessory(
      ctx,
      rightAccessory,
      titleLayout.rightIconSegment && {
        ...titleLayout.rightIconSegment,
        x: rect.x + titleLayout.rightIconSegment.x,
      },
      y,
    );
    if (titleFighters.length >= 2) {
      drawRun(titleLayout.rightSegment, titleLayout.right, titleColorFor(titleFighters[1], classicTeamLayout ? 1 : null));
    }
    ctx.restore();
  }

  drawFighterWeaponIcon(ctx, fighter, nameX, nameY, nameWidth, fontSize, alignRight) {
    const profile = PIXEL_WEAPON_PROFILES[fighter.type];
    const sprite = this.arenaRenderer.weaponSprites.get(fighter.type);
    if (!profile || !sprite?.image) return;
    const size = Math.round(fontSize * 1.38);
    const gap = Math.round(fontSize * 0.2);
    const aspect = sprite.image.naturalWidth / Math.max(1, sprite.image.naturalHeight);
    const drawWidth = aspect >= 1 ? size : size * aspect;
    const drawHeight = aspect >= 1 ? size / aspect : size;
    ctx.save();
    ctx.translate(alignRight ? nameX - nameWidth - gap - size / 2 : nameX + nameWidth + gap + size / 2, nameY);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }

  drawWorldCupHud(ctx, sim, rect) {
    const fighters = sim.fighters.slice(0, 2);
    const vsBand = Math.max(132, rect.width * 0.14);
    const sideWidth = (rect.width - vsBand) / 2;
    this.drawWorldCupTitle(ctx, rect);

    fighters.forEach((fighter, index) => {
      const country = WORLD_CUP_COUNTRIES[fighter.countryId];
      const label = country?.name || fighter.name;
      const leftSide = index === 0;
      const sideRect = leftSide
        ? { x: rect.x, y: rect.y, width: sideWidth, height: rect.height }
        : { x: rect.x + sideWidth + vsBand, y: rect.y, width: sideWidth, height: rect.height };

      const flagWidth = Math.min(112, sideRect.width * 0.24);
      const flagHeight = Math.max(24, flagWidth * 0.64);
      const flagX = leftSide ? sideRect.x : sideRect.x + sideRect.width - flagWidth;
      const flagY = sideRect.y;
      this.drawWorldCupFlagBanner(ctx, country, flagX, flagY, flagWidth, flagHeight);

      const textX = leftSide ? sideRect.x : sideRect.x + sideRect.width;
      const nameY = sideRect.y + rect.height * 0.46;
      ctx.save();
      const maxFontSize = Math.max(40, Math.min(72, rect.height * 0.42));
      const minFontSize = Math.max(28, Math.min(40, rect.height * 0.26));
      const maxTextWidth = Math.max(120, sideRect.width - 10);
      let fontSize = maxFontSize;
      ctx.font = `900 ${fontSize}px ${PIXEL_FONT}`;
      while (fontSize > minFontSize && ctx.measureText(label).width > maxTextWidth) {
        fontSize -= 2;
        ctx.font = `900 ${fontSize}px ${PIXEL_FONT}`;
      }
      ctx.textBaseline = "middle";
      ctx.textAlign = leftSide ? "left" : "right";
      ctx.lineWidth = Math.max(3, fontSize * 0.075);
      ctx.strokeStyle = "#080808";
      ctx.fillStyle = "#111111";
      ctx.strokeText(label, textX, nameY);
      ctx.fillText(label, textX, nameY);
      ctx.restore();

      this.drawWorldCupHeartRow(ctx, fighter, {
        x: sideRect.x,
        y: sideRect.y + sideRect.height * 0.72,
        width: sideRect.width,
        height: Math.max(28, rect.height * 0.22),
      }, index === 1);
    });

    if (fighters.length === 2) {
      const centerX = rect.x + sideWidth + vsBand / 2;
      const centerY = rect.y + rect.height / 2;
      ctx.save();
      ctx.fillStyle = "#111111";
      ctx.font = `900 ${Math.max(48, Math.min(96, rect.height * 0.48))}px ${PIXEL_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = Math.max(3, rect.height * 0.05);
      ctx.strokeStyle = "#080808";
      ctx.strokeText("VS", centerX, centerY);
      ctx.fillText("VS", centerX, centerY);
      ctx.restore();
    }
  }

  drawKingOfHillHud(ctx, sim, rect) {
    const fighters = sim.fighters.slice(0, 2);
    const gap = Math.max(20, rect.width * 0.04);
    const panelWidth = (rect.width - gap) / 2;
    fighters.forEach((fighter, index) => {
      const contender = KING_OF_HILL_CONTENDERS[fighter.hillContenderId];
      const x = rect.x + index * (panelWidth + gap);
      const progress = Math.max(0, Math.min(1, fighter.hillScore / fighter.hillTarget));
      ctx.save();
      ctx.fillStyle = "#111827";
      ctx.fillRect(x, rect.y, panelWidth, rect.height);
      ctx.strokeStyle = contender?.color || "#fbbf24";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, rect.y, panelWidth, rect.height);
      ctx.fillStyle = contender?.color || "#fbbf24";
      ctx.fillRect(x + 8, rect.y + rect.height - 23, (panelWidth - 16) * progress, 13);
      ctx.strokeStyle = "#080808";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 8, rect.y + rect.height - 23, panelWidth - 16, 13);
      ctx.fillStyle = contender?.accent || "#ffffff";
      ctx.font = `900 ${Math.max(34, rect.height * 0.32)}px ${PIXEL_FONT}`;
      ctx.textAlign = index === 0 ? "left" : "right";
      ctx.textBaseline = "middle";
      const textX = index === 0 ? x + 14 : x + panelWidth - 14;
      ctx.fillText(`${fighter.hillSymbol} ${fighter.name}`, textX, rect.y + rect.height * 0.3, panelWidth - 28);
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${Math.max(22, rect.height * 0.22)}px ${PIXEL_FONT}`;
      ctx.fillText(`${fighter.hillScore.toFixed(1)} / ${fighter.hillTarget}`, textX, rect.y + rect.height * 0.62, panelWidth - 28);
      ctx.restore();
    });
  }

  drawKingOfHillStatusDock(ctx, sim, rect) {
    const controller = sim.fighters.find((fighter) => fighter.id === sim.hill?.controllerId);
    ctx.save();
    ctx.fillStyle = "#111827";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeStyle = sim.hill?.contested ? "#fb7185" : controller?.hillColor || "#fbbf24";
    ctx.lineWidth = 4;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${Math.max(20, rect.height * 0.3)}px ${PIXEL_FONT}`;
    if (sim.hill?.contested) {
      ctx.fillStyle = "#fb7185";
      ctx.fillText("CONTESTED", rect.x + rect.width / 2, rect.y + rect.height / 2);
    } else if (controller) {
      const multiplierActive = controller.hillHoldTime >= 2 && controller.hillMultiplier > 1;
      ctx.fillStyle = controller.hillAccent || "#ffffff";
      ctx.fillText(`${controller.name.toUpperCase()} CONTROLS THE HILL`, rect.x + rect.width / 2, rect.y + rect.height * 0.35);
      ctx.fillStyle = multiplierActive ? "#fbbf24" : "#9ca3af";
      const multiplierLabel = multiplierActive
        ? `${controller.hillMultiplier}× ACTIVE`
        : controller.hillMultiplier > 1 ? `MULTIPLIER IN ${Math.max(0, 2 - controller.hillHoldTime).toFixed(1)}S` : "1× SCORING";
      ctx.fillText(multiplierLabel, rect.x + rect.width / 2, rect.y + rect.height * 0.72);
    } else {
      ctx.fillStyle = "#d1d5db";
      ctx.fillText("HILL OPEN", rect.x + rect.width / 2, rect.y + rect.height / 2);
    }
    ctx.restore();
  }

  drawWorldCupTitle(ctx, rect) {
    const title = "World Cup Battle";
    const titleY = rect.y + rect.height * 0.12;
    const fontSize = Math.max(18, Math.min(28, rect.height * 0.18));
    const trophySize = Math.max(20, Math.min(28, rect.height * 0.18));
    const trophyGap = 10;
    const trophy = this.arenaRenderer.worldCupSprites.get("world-cup-trophy");

    ctx.save();
    ctx.font = `900 ${fontSize}px ${PIXEL_FONT}`;
    const textWidth = ctx.measureText(title).width;
    const groupWidth = textWidth + trophySize + trophyGap;
    const groupLeft = rect.x + rect.width / 2 - groupWidth / 2;
    const trophyX = groupLeft;
    const textX = trophyX + trophySize + trophyGap;

    if (trophy) ctx.drawImage(trophy, trophyX, titleY - trophySize / 2, trophySize, trophySize);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.lineWidth = Math.max(3, fontSize * 0.09);
    ctx.strokeStyle = "#080808";
    ctx.fillStyle = "#111111";
    ctx.strokeText(title, textX, titleY);
    ctx.fillText(title, textX, titleY);
    ctx.restore();
  }

  drawWorldCupFlagBanner(ctx, country, x, y, width, height) {
    if (!country) return;
    const flag = this.arenaRenderer.countryFlags.get(country.id);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    if (flag) {
      const scale = Math.max(width / flag.naturalWidth, height / flag.naturalHeight);
      const drawWidth = flag.naturalWidth * scale;
      const drawHeight = flag.naturalHeight * scale;
      ctx.drawImage(flag, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
    } else if (country.palette?.length) {
      const stripes = country.palette.length;
      const stripeHeight = height / stripes;
      country.palette.forEach((color, stripeIndex) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y + stripeIndex * stripeHeight, width, stripeHeight + 1);
      });
    } else {
      ctx.fillStyle = country.color || "#1d2540";
      ctx.fillRect(x, y, width, height);
    }
    ctx.restore();
  }

  drawWorldCupFlagSquare(ctx, country, x, y, size) {
    if (!country) return;
    const flag = this.arenaRenderer.countryFlags.get(country.id);
    if (flag) {
      const scale = Math.max(size / flag.naturalWidth, size / flag.naturalHeight);
      const width = flag.naturalWidth * scale;
      const height = flag.naturalHeight * scale;
      ctx.drawImage(flag, x + (size - width) / 2, y + (size - height) / 2, width, height);
      return;
    }
    ctx.save();
    if (country.palette?.length) {
      const stripes = country.palette.length;
      const stripeHeight = size / stripes;
      country.palette.forEach((color, stripeIndex) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y + stripeIndex * stripeHeight, size, stripeHeight + 1);
      });
    } else {
      ctx.fillStyle = country.color || "#1d2540";
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
  }

  drawWorldCupNameClipped(ctx, text, originX, y, palette, minX, maxX) {
    if (!text) return;
    const colors = palette.length ? palette : ["#fff4cf"];
    const chars = String(text).split("");
    const measureAlign = ctx.textAlign;
    let cursor = originX;
    const widths = chars.map((char) => ctx.measureText(char).width);
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    if (measureAlign === "center") cursor -= totalWidth / 2;
    else if (measureAlign === "right") cursor -= totalWidth;
    if (cursor < minX) cursor = minX;
    const limit = Math.max(cursor, maxX);
    ctx.save();
    const sizeMatch = ctx.font.match(/(\d+)px/);
    const fontSize = sizeMatch ? Number(sizeMatch[1]) : 16;
    ctx.lineWidth = Math.max(3, fontSize * 0.09);
    ctx.strokeStyle = "#0b2019";
    chars.forEach((char, index) => {
      if (cursor + widths[index] > limit) return;
      ctx.fillStyle = colors[index % colors.length];
      ctx.strokeText(char, cursor, y);
      ctx.fillText(char, cursor, y);
      cursor += widths[index];
    });
    ctx.restore();
  }

  drawWorldCupNameInFlagColors(ctx, text, originX, y, palette) {
    if (!text) return;
    const colors = palette.length ? palette : ["#fff4cf"];
    const chars = String(text).split("");
    let cursor = originX;
    const measureAlign = ctx.textAlign;
    const widths = chars.map((char) => ctx.measureText(char).width);
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    if (measureAlign === "center") cursor -= totalWidth / 2;
    else if (measureAlign === "right") cursor -= totalWidth;
    ctx.save();
    const sizeMatch = ctx.font.match(/(\d+)px/);
    const fontSize = sizeMatch ? Number(sizeMatch[1]) : 16;
    ctx.lineWidth = Math.max(3, fontSize * 0.09);
    ctx.strokeStyle = "#0b2019";
    chars.forEach((char, index) => {
      ctx.fillStyle = colors[index % colors.length];
      ctx.strokeText(char, cursor, y);
      ctx.fillText(char, cursor, y);
      cursor += widths[index];
    });
    ctx.restore();
  }

  drawWorldCupHeartRow(ctx, fighter, rect, reverse = false) {
    const heart = this.arenaRenderer.worldCupSprites.get("heart");
    const gap = Math.max(2, Math.floor(rect.width * 0.012));
    const size = Math.max(22, Math.min(rect.height, (rect.width - gap * 9) / 10));
    const totalWidth = size * 10 + gap * 9;
    const startX = reverse ? rect.x + rect.width - totalWidth : rect.x;
    const hearts = Math.max(0, fighter.health / 10);
    for (let index = 0; index < 10; index += 1) {
      const x = startX + index * (size + gap);
      const fill = Math.max(0, Math.min(1, hearts - index));
      ctx.save();
      ctx.globalAlpha = 0.2;
      if (heart) ctx.drawImage(heart, x, rect.y, size, size);
      else {
        ctx.fillStyle = "#651f2b";
        ctx.fillRect(x, rect.y, size, size);
      }
      ctx.restore();
      if (fill <= 0) continue;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, rect.y, size * fill, size);
      ctx.clip();
      if (heart) ctx.drawImage(heart, x, rect.y, size, size);
      else {
        ctx.fillStyle = "#ff3048";
        ctx.fillRect(x, rect.y, size, size);
      }
      ctx.restore();
    }
  }

  drawWorldCupStatusDock(ctx, sim, rect) {
    const gap = Math.max(14, rect.width * 0.025);
    const panelWidth = (rect.width - gap) / 2;
    sim.fighters.slice(0, 2).forEach((fighter, index) => {
      const country = WORLD_CUP_COUNTRIES[fighter.countryId];
      const x = rect.x + index * (panelWidth + gap);
      const stats = worldCupCombatStats(fighter, sim.time);
      ctx.fillStyle = "#0b2019e8";
      ctx.fillRect(x, rect.y, panelWidth, rect.height);
      ctx.strokeStyle = country?.accent || "#fff4cf";
      ctx.lineWidth = Math.max(3, rect.height * 0.055);
      ctx.strokeRect(x, rect.y, panelWidth, rect.height);
      ctx.fillStyle = "#fff4cf";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 ${Math.max(12, Math.min(24, rect.height * 0.28))}px ${PIXEL_FONT}`;
      ctx.fillText(`ATTACK ${stats.attackMultiplier.toFixed(1)}×`, x + panelWidth / 2, rect.y + rect.height * 0.38, panelWidth - 18);
      ctx.fillStyle = stats.defense > 1 ? "#69efff" : "#9bc8a9";
      ctx.fillText(`DEFENSE ${stats.defense.toFixed(1)}×`, x + panelWidth / 2, rect.y + rect.height * 0.72, panelWidth - 18);
    });
  }

  drawArena(ctx, rect, {
    shakeX = 0,
    shakeY = 0,
    overtime = false,
    sim = null,
    classicBlackTheme = false,
    classicTeamColors = true,
  } = {}) {
    ctx.save();
    ctx.fillStyle = classicBlackTheme ? "#000000" : "#ffffff";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();

    const scale = Math.min(rect.width / ARENA.width, rect.height / ARENA.height);
    const dw = ARENA.width * scale;
    const dh = ARENA.height * scale;
    const dx = rect.x + (rect.width - dw) / 2 + shakeX;
    const dy = rect.y + (rect.height - dh) / 2 + shakeY;
    ctx.drawImage(this.arenaCanvas, 0, 0, ARENA.width, ARENA.height, dx, dy, dw, dh);
    if (sim?.gameplayMode === "classic") {
      this.drawClassicHealthMarkers(ctx, sim, { x: dx, y: dy, width: dw, height: dh });
    }
    if (overtime) this.drawOvertimeArena(ctx, { x: dx, y: dy, width: dw, height: dh });
    this.drawArenaWatermark(ctx, { x: dx, y: dy, width: dw, height: dh });
    ctx.restore();
    const borderRect = { x: dx, y: dy, width: dw, height: dh };
    if (sim?.gameplayMode === "classic" && classicTeamColors && sim.fighters?.length >= 2) {
      const [firstColor, secondColor] = classicArenaBorderColorsFor(sim);
      drawSplitArenaBorder(
        ctx,
        borderRect,
        firstColor,
        secondColor,
        Math.max(2, Math.min(4, dw * 0.003)),
      );
    } else {
      ctx.strokeStyle = classicBlackTheme ? "#c4c7ce" : "#050505";
      ctx.lineWidth = Math.max(2, Math.min(4, dw * 0.003));
      ctx.strokeRect(dx, dy, dw, dh);
    }
  }

  drawArenaWatermark(ctx, rect) {
    const text = "Orb Foundry";
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#050505";
    ctx.font = `900 ${Math.max(13, Math.min(24, rect.width * 0.034))}px ${PIXEL_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, rect.x + rect.width / 2, rect.y + rect.height - Math.max(18, rect.height * 0.045));
    ctx.restore();
  }

  drawOvertimeArena(ctx, rect) {
    ctx.fillStyle = "#a638241f";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  drawWinnerFieldText(ctx, sim, rect) {
    const message = winnerFieldMessage(sim);
    if (!message) return;
    const segments = winnerFieldSegments(sim);
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#10261b";
    ctx.lineWidth = Math.max(5, rect.width * 0.009);
    setFittedFont(ctx, message, rect.width * 0.84, 900, Math.round(rect.width * 0.092), 30, PIXEL_FONT);
    let x = rect.x + (rect.width - ctx.measureText(message).width) / 2;
    const y = rect.y + rect.height / 2;
    for (const segment of segments) {
      ctx.fillStyle = segment.color;
      ctx.strokeText(segment.text, x, y);
      ctx.fillText(segment.text, x, y);
      x += ctx.measureText(segment.text).width;
    }
    ctx.restore();
  }

  drawArenaModifierBadge(ctx, sim, rect) {
    const labels = [];
    if (sim.arenaModifierLabel && sim.arenaModifier !== "standard") labels.push(sim.arenaModifierLabel);
    if (sim.arenaShape === "circle") labels.push("CIRCLE");
    if (!labels.length) return;
    const label = labels.join(" · ");
    const badgeWidth = Math.min(rect.width * 0.34, Math.max(148, label.length * 14 + 34));
    const badgeHeight = Math.max(24, rect.height * 0.052);
    const x = rect.x + rect.width - badgeWidth - 10;
    const y = rect.y + 10;
    ctx.fillStyle = "#0d1219dd";
    ctx.fillRect(x, y, badgeWidth, badgeHeight);
    ctx.strokeStyle = "#ffbd45";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, badgeWidth, badgeHeight);
    ctx.fillStyle = "#ffbd45";
    ctx.font = `900 ${Math.max(11, badgeHeight * 0.42)}px ${PIXEL_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + badgeWidth / 2, y + badgeHeight / 2);
  }

  drawWinProbabilityMeter(ctx, odds, rect) {
    if (!odds?.entries?.length) return;
    const entries = odds.entries.slice().sort((a, b) => a.id.localeCompare(b.id));
    if (entries.length < 2) return;
    const height = Math.max(28, rect.height * 0.064);
    const x = rect.x + 10;
    const y = rect.y + 10;
    const width = Math.min(rect.width * 0.58, 540);
    const first = entries[0];
    const second = entries[1];
    const split = Math.max(0.08, Math.min(0.92, first.probability));
    ctx.fillStyle = "#0d1219e8";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = first.color;
    ctx.fillRect(x + 3, y + 3, (width - 6) * split, height - 6);
    ctx.fillStyle = second.color;
    ctx.fillRect(x + 3 + (width - 6) * split, y + 3, (width - 6) * (1 - split), height - 6);
    ctx.strokeStyle = "#211d1a";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = "#fffaf1";
    ctx.strokeStyle = "#211d1a";
    ctx.lineWidth = 3;
    ctx.font = `900 ${Math.max(11, height * 0.42)}px ${PIXEL_FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const leftLabel = `${first.name} ${Math.round(first.probability * 100)}%`;
    ctx.strokeText(leftLabel, x + 12, y + height / 2);
    ctx.fillText(leftLabel, x + 12, y + height / 2);
    ctx.textAlign = "right";
    const rightLabel = `${Math.round(second.probability * 100)}% ${second.name}`;
    ctx.strokeText(rightLabel, x + width - 12, y + height / 2);
    ctx.fillText(rightLabel, x + width - 12, y + height / 2);
  }

  drawAbilityDock(ctx, sim, rect) {
    sim.fighters.slice(0, 2).forEach((fighter, index) => {
      this.drawCombatReadout(ctx, fighter, rect, index === 1);
    });
  }

  drawClassicStatDock(ctx, sim, rect, classicBlackTheme = false) {
    ctx.save();
    ctx.textBaseline = "middle";
    const cta = classicCtaLayout(ctx, {
      width: rect.width,
      safeWidth: rect.width * 0.92,
      maxFontSize: Math.min(64, rect.height * 0.68),
      minFontSize: Math.max(18, rect.height * 0.24),
    });
    ctx.font = `900 ${cta.fontSize}px ${CLASSIC_CTA_FONT}`;
    ctx.textAlign = "left";
    ctx.lineWidth = Math.max(3, cta.fontSize * 0.075);
    ctx.strokeStyle = "#050505";
    const centerY = rect.y + rect.height * 0.48;
    const colors = {
      like: "#ff4b55",
      ampersand: classicBlackTheme ? "#ffffff" : "#252525",
      subscribe: "#ff4b55",
    };
    for (const segment of cta.segments) {
      const text = segment.text;
      const color = colors[segment.kind] || "#ffffff";
      ctx.fillStyle = color;
      const x = rect.x + segment.x;
      ctx.strokeText(text, x, centerY);
      ctx.fillText(text, x, centerY);
    }
    const absorptionLabel = classicAbsorberHistoryLabelFor(sim);
    if (absorptionLabel) {
      const labelSize = setFittedFont(
        ctx,
        absorptionLabel,
        rect.width * 0.92,
        900,
        Math.min(19, rect.height * 0.2),
        10,
        CLASSIC_CTA_FONT,
      );
      ctx.font = `900 ${labelSize}px ${CLASSIC_CTA_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = Math.max(2, labelSize * 0.08);
      ctx.strokeStyle = "#050505";
      ctx.fillStyle = classicBlackTheme ? "#f1c8ff" : "#8c2a83";
      ctx.strokeText(absorptionLabel, rect.x + rect.width / 2, rect.y + rect.height * 0.84);
      ctx.fillText(absorptionLabel, rect.x + rect.width / 2, rect.y + rect.height * 0.84);
    }
    ctx.restore();
  }

  drawCombatReadout(ctx, fighter, rect, alignRight = false) {
    const def = CLASS_DEFS[fighter.type];
    const abilityText = fighter.abilityKind === "rate"
      ? `Ability rate: ${(fighter.abilityRate || 1).toFixed(1)}x`
      : `Ability: ${formatCombatValue(fighter.abilityValue)}`;
    const x = alignRight ? rect.x + rect.width : rect.x;
    const y = rect.y + rect.height * 0.32;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.font = `900 ${Math.max(18, Math.min(30, rect.height * 0.32))}px ${PIXEL_FONT}`;
    ctx.fillStyle = def.color;
    ctx.textAlign = alignRight ? "right" : "left";
    ctx.fillText(`Damage: ${formatCombatValue(fighter.damage)}`, x, y);
    ctx.fillText(abilityText, x, y + rect.height * 0.4);
    ctx.restore();
  }

  drawCountdown(ctx, count, progress, width, height, motion = {}) {
    const reducedMotion = motion.reducedMotion === true;
    const pulse = reducedMotion ? 0 : Math.exp(-progress * 7) * Math.cos(progress * 13);
    const scale = 1 + pulse * 0.34;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.fillStyle = "#05080cb8";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.strokeStyle = count === 3 ? "#ff7a32" : count === 2 ? "#ffbd45" : "#fff6e6";
    ctx.lineWidth = Math.max(4, width * 0.008) * (1 - progress * 0.6);
    ctx.globalAlpha = Math.max(0, 0.9 - progress * 0.65);
    for (let ring = 0; ring < 3; ring += 1) {
      const radius = width * (0.08 + ring * 0.045 + progress * (0.16 + ring * 0.025));
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.stroke();
    }
    if (!reducedMotion) {
      ctx.strokeStyle = "#ffbd45";
      for (let index = 0; index < 18; index += 1) {
        const angle = index * TAU / 18 + count * 0.17;
        const inner = width * (0.12 + progress * 0.05);
        const outer = inner + width * (0.035 + ((index * 7 + count) % 5) * 0.006) * (1 - progress);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
      }
    }
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffbd45";
    ctx.strokeStyle = "#0a0e14";
    ctx.lineWidth = Math.max(8, width * 0.014);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${Math.round(width * 0.3)}px ${PIXEL_FONT}`;
    ctx.strokeText(String(Math.max(1, Math.ceil(count))), 0, 0);
    ctx.fillText(String(Math.max(1, Math.ceil(count))), 0, 0);
    ctx.restore();
  }

  drawFaceoff(ctx, sim, width, height) {
    const fighters = sim.fighters.slice(0, 2);
    if (fighters.length < 2) return;
    const orbSize = Math.min(width, height) * 0.23;
    const centerY = height * 0.48;
    ctx.fillStyle = "#f7f1e7";
    ctx.fillRect(0, 0, width, height);
    this.drawWinnerOrbIcon(ctx, fighters[0], width * 0.31, centerY, orbSize);
    this.drawWinnerOrbIcon(ctx, fighters[1], width * 0.69, centerY, orbSize);
  }

  drawWinnerCard(ctx, sim, width, height) {
    if (!sim.winner) return;
    const winner = sim.winner;
    const loser = sim.fighters.find((fighter) => fighter.id !== winner.id);
    const def = WORLD_CUP_COUNTRIES[winner.countryId]
      || KING_OF_HILL_CONTENDERS[winner.hillContenderId]
      || CLASS_DEFS[winner.type];
    const knockout = [...sim.events].reverse().find((event) => event.type === "knockout");
    const winMethod = winningMethodLabel(knockout?.reason, winner);
    const winnerStats = buildBattleStats(winner);
    const cardWidth = Math.min(width * 0.84, 980);
    const cardHeight = Math.min(height * 0.38, 520);
    const x = (width - cardWidth) / 2;
    const y = Math.min(height * 0.29, height - cardHeight - 56);
    const iconSize = Math.max(80, Math.min(150, cardWidth * 0.16, cardHeight * 0.27));
    const winnerX = x + cardWidth * 0.36;
    const loserX = x + cardWidth * 0.64;
    const orbY = y + cardHeight * 0.52;
    const podiumY = y + cardHeight * 0.64;
    const podiumWidth = Math.max(122, cardWidth * 0.19);
    ctx.fillStyle = "#080c12ee";
    ctx.fillRect(x, y, cardWidth, cardHeight);
    ctx.strokeStyle = def.color;
    ctx.lineWidth = Math.max(5, width * 0.008);
    ctx.strokeRect(x, y, cardWidth, cardHeight);
    ctx.textAlign = "center";
    ctx.fillStyle = "#c9bca8";
    ctx.font = `900 ${Math.max(18, Math.min(32, cardWidth * 0.035))}px ${PIXEL_FONT}`;
    ctx.fillText("MATCH COMPLETE", width / 2, y + cardHeight * 0.12);
    ctx.fillStyle = def.color;
    setFittedFont(ctx, `${winner.name} WINS`, cardWidth * 0.86, 900, Math.round(cardWidth * 0.085), 36, PIXEL_FONT);
    ctx.fillText(`${winner.name} WINS`, width / 2, y + cardHeight * 0.25);

    this.drawPodium(ctx, winnerX, podiumY, podiumWidth, cardHeight * 0.17, def.color, "1");
    if (loser) this.drawPodium(ctx, loserX, podiumY + cardHeight * 0.06, podiumWidth * 0.9, cardHeight * 0.12, WORLD_CUP_COUNTRIES[loser.countryId]?.color || CLASS_DEFS[loser.type].color, "2");
    this.drawWinnerOrbIcon(ctx, winner, winnerX, orbY, iconSize, { crown: true });
    if (loser) this.drawWinnerOrbIcon(ctx, loser, loserX, orbY + iconSize * 0.14, iconSize * 0.78, { crossed: true });

    const statY = y + cardHeight * 0.83;
    const statGap = Math.max(8, cardWidth * 0.012);
    const summaryStats = [
      { label: "FINAL HP", value: Math.ceil(winner.health) },
      { label: "WON BY", value: winMethod },
      ...winnerStats.slice(0, 3),
    ];
    const statWidth = (cardWidth * 0.84 - statGap * (summaryStats.length - 1)) / summaryStats.length;
    summaryStats.forEach((stat, index) => {
      this.drawWinnerMetric(ctx, stat.label, stat.value, {
        x: x + cardWidth * 0.08 + index * (statWidth + statGap),
        y: statY,
        width: statWidth,
        height: cardHeight * 0.13,
      }, index === 0 ? def.color : index === 1 ? "#ffbd45" : "#c9bca8", true);
    });
  }

  drawWinnerMetric(ctx, label, value, rect, accent, small = false) {
    ctx.fillStyle = "#fff6e611";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(2, rect.height * 0.06);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#c9bca8";
    ctx.font = `900 ${Math.max(9, Math.min(15, rect.height * 0.24))}px ${PIXEL_FONT}`;
    ctx.fillText(String(label), rect.x + rect.width / 2, rect.y + rect.height * 0.34, rect.width - 12);
    ctx.fillStyle = "#fff6e6";
    const maxValueSize = small ? rect.height * 0.35 : rect.height * 0.42;
    setFittedFont(ctx, String(value), rect.width - 14, 900, Math.max(13, Math.floor(maxValueSize)), 10, PIXEL_FONT);
    ctx.fillText(String(value), rect.x + rect.width / 2, rect.y + rect.height * 0.68, rect.width - 12);
  }

  drawPodium(ctx, centerX, y, width, height, color, rank) {
    ctx.fillStyle = "#fff6e614";
    ctx.fillRect(centerX - width / 2, y, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, height * 0.08);
    ctx.strokeRect(centerX - width / 2, y, width, height);
    ctx.fillStyle = color;
    ctx.font = `900 ${Math.max(16, height * 0.48)}px ${PIXEL_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(rank, centerX, y + height / 2);
  }

  drawWinnerOrbIcon(ctx, fighter, x, y, size, { crown = false, crossed = false } = {}) {
    const def = CLASS_DEFS[fighter.type];
    const country = WORLD_CUP_COUNTRIES[fighter.countryId];
    const symbol = this.arenaRenderer.orbSprites.get(fighter.type);
    if (crown) this.drawCrown(ctx, x, y - size * 0.78, size * 0.66, size * 0.28);
    if (country) {
      const flag = this.arenaRenderer.countryFlags.get(country.id);
      if (flag) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, size * 0.32, 0, TAU);
        ctx.clip();
        const scale = Math.max((size * 0.64) / flag.naturalWidth, (size * 0.64) / flag.naturalHeight);
        const width = flag.naturalWidth * scale;
        const height = flag.naturalHeight * scale;
        ctx.drawImage(flag, x - width / 2, y - height / 2, width, height);
        ctx.restore();
      } else {
        ctx.fillStyle = country.color;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.32, 0, TAU);
        ctx.fill();
      }
    } else if (symbol) {
      ctx.drawImage(symbol, x - size / 2, y - size / 2, size, size);
    } else {
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.42, 0, TAU);
      ctx.fill();
    }
    if (!country) {
      ctx.fillStyle = "#fff6e6";
      ctx.strokeStyle = "#211d1a";
      ctx.lineWidth = Math.max(3, size * 0.04);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 ${Math.max(16, size * 0.24)}px ${PIXEL_FONT}`;
      ctx.strokeText(fighter.name.slice(0, 2).toUpperCase(), x, y + size * 0.03);
      ctx.fillText(fighter.name.slice(0, 2).toUpperCase(), x, y + size * 0.03);
    }
    if (crossed) {
      ctx.strokeStyle = "#ff3c3c";
      ctx.lineWidth = Math.max(6, size * 0.085);
      ctx.lineCap = "square";
      ctx.beginPath();
      ctx.moveTo(x - size * 0.47, y - size * 0.47);
      ctx.lineTo(x + size * 0.47, y + size * 0.47);
      ctx.moveTo(x + size * 0.47, y - size * 0.47);
      ctx.lineTo(x - size * 0.47, y + size * 0.47);
      ctx.stroke();
      ctx.lineCap = "butt";
    }
  }

  drawCrown(ctx, x, y, width, height) {
    ctx.fillStyle = "#ffbd45";
    ctx.strokeStyle = "#211d1a";
    ctx.lineWidth = Math.max(3, height * 0.12);
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y + height);
    ctx.lineTo(x - width * 0.36, y + height * 0.24);
    ctx.lineTo(x - width * 0.12, y + height * 0.62);
    ctx.lineTo(x, y);
    ctx.lineTo(x + width * 0.12, y + height * 0.62);
    ctx.lineTo(x + width * 0.36, y + height * 0.24);
    ctx.lineTo(x + width / 2, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawRecordingMark(ctx, recording, width) {
    if (!recording) return;
    ctx.fillStyle = "#ff3c3c";
    ctx.beginPath();
    ctx.arc(width - 54, 54, 12, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#2c2924";
    ctx.font = `900 18px ${PIXEL_FONT}`;
    ctx.textAlign = "right";
    ctx.fillText("REC", width - 76, 60);
  }
}

function setFittedFont(ctx, text, maxWidth, weight, maxSize, minSize, family) {
  const safeMax = Math.max(minSize, Math.floor(maxSize));
  for (let size = safeMax; size >= minSize; size -= 1) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(String(text)).width <= maxWidth) return size;
  }
  ctx.font = `${weight} ${minSize}px ${family}`;
  return minSize;
}

function winningMethodLabel(reason, winner) {
  const normalized = String(reason || "").toLowerCase();
  if (normalized.includes("red card")) return "RED CARD";
  if (normalized.includes("soccer ball")) return "HOMING BALL";
  if (winner?.countryId && normalized.includes("collision")) return "ORB COLLISION";
  if (normalized.includes("burn") || normalized.includes("ember")) return "BURN";
  if (normalized.includes("poison")) return "POISON";
  if (normalized.includes("hail")) return "HAILSTORM";
  if (normalized.includes("arcane")) return "ARCANE BURST";
  if (normalized.includes("ricochet") || normalized.includes("bolt")) return "RICOCHET BOLT";
  if (normalized.includes("gravity")) return "GRAVITY LOCK";
  if (normalized.includes("time")) return "TIME STOP";
  if (normalized.includes("collision") || normalized.includes("ram")) return "VIKING RAM";
  if (winner?.type && CLASS_DEFS[winner.type]?.ability) return CLASS_DEFS[winner.type].ability.toUpperCase();
  return "WEAPON HIT";
}
