import { THEME_IDS } from "./presentation.js?v=20260728-orbital-cyan1-classic-reactor-blue2";
import { WORLD_CUP_MODE, normalizeWorldCupCountries } from "./world-cup.js?v=20260703-world-cup-countries3";
import { KING_OF_HILL_MODE, normalizeKingOfHillContenders } from "./king-of-hill.js";
import {
  ORB_RACE_DEFAULT_LAYERS,
  ORB_RACE_DEFAULT_ORB_SCALE,
  ORB_RACE_DEFAULT_TEAMS,
  ORB_RACER_IDS,
  ORB_RACE_MODE,
  buildRaceLayerPreset,
  normalizeOrbRacers,
  normalizeRaceLayerCount,
  normalizeRaceLayers,
  normalizeRaceOrbScale,
  normalizeRaceTeamOptions,
  normalizeRaceTeams,
} from "./orb-race.js?v=20260825-tsar-all-in-one1";
import {
    CLASSIC_DEFAULT_CLASSES,
    CLASSIC_DEFAULT_TEAMS,
    CLASSIC_ORBS,
    CLASSIC_ORB_IDS,
    normalizeClassicClasses,
    normalizeClassicOrbHealth,
    normalizeClassicTeamOptions,
    normalizeClassicTeams,
    normalizeClassicSpeedMode as normalizeRegistryClassicSpeedMode,
} from "./classic-orbs.js?v=20260812-classic-health-reactor-batman-fairy-zeus-frost-snowball1";

export const ARENA_MODIFIER_IDS = Object.freeze(["standard", "tiny", "suddenDeath", "overdrive", "glassCannon"]);
export const ARENA_SHAPE_IDS = Object.freeze(["square", "circle"]);
export const ARENA_SIZE_IDS = Object.freeze(["standard", "large"]);
export const ARENA_SIZES = Object.freeze([
  Object.freeze({ id: "standard", label: "STANDARD SIZE" }),
  Object.freeze({ id: "large", label: "LARGE SQUARE" }),
]);
export const CLASSIC_SPEED_MODE_IDS = Object.freeze(["regular", "slow", "fast"]);
export const CLASSIC_SPEED_MODES = Object.freeze([
  Object.freeze({ id: "regular", label: "REGULAR" }),
  Object.freeze({ id: "slow", label: "SLOW" }),
  Object.freeze({ id: "fast", label: "FAST" }),
]);
export const CLASSIC_DEFAULT_ORB_SCALE = 1;
export const CLASSIC_ORB_SCALE_OPTIONS = Object.freeze([
  Object.freeze({ value: 0.55, label: "MINI" }),
  Object.freeze({ value: 0.75, label: "COMPACT" }),
  Object.freeze({ value: 1, label: "REGULAR" }),
  Object.freeze({ value: 1.25, label: "LARGE" }),
  Object.freeze({ value: 1.5, label: "EXTRA LARGE" }),
]);

export const RACE_TOURNAMENT_BRACKET_SIZES = Object.freeze([4, 8, 16, 32, 64]);
export const RACE_TOURNAMENT_SEEDING_MODES = Object.freeze(["random", "custom"]);
export const RACE_TOURNAMENT_RECORDING_SCOPES = Object.freeze(["each-match", "whole-round", "whole-tournament"]);
export const RACE_TOURNAMENT_RECORDING_PRESETS = Object.freeze([
  Object.freeze({ id: "each-match", label: "INDIVIDUAL MATCHUPS" }),
  Object.freeze({ id: "whole-round", label: "SELECTED WHOLE ROUNDS" }),
  Object.freeze({ id: "whole-tournament", label: "WHOLE TOURNAMENT" }),
]);
export const RACE_TOURNAMENT_LANDSCAPE_LAYER_COUNTS = Object.freeze([3, 5]);

// Short aliases keep the settings contract discoverable to callers that do not
// distinguish the Orb Race-specific namespace from the tournament controls.
export const TOURNAMENT_BRACKET_SIZES = RACE_TOURNAMENT_BRACKET_SIZES;
export const TOURNAMENT_SEEDING_MODES = RACE_TOURNAMENT_SEEDING_MODES;
export const TOURNAMENT_RECORDING_SCOPES = RACE_TOURNAMENT_RECORDING_SCOPES;
export const TOURNAMENT_LANDSCAPE_LAYER_COUNTS = RACE_TOURNAMENT_LANDSCAPE_LAYER_COUNTS;

export function raceTournamentRoundIds(size) {
  const numericSize = Number(size);
  if (!RACE_TOURNAMENT_BRACKET_SIZES.includes(numericSize)) return [];
  const ids = [];
  for (let remaining = numericSize; remaining >= 2; remaining /= 2) {
    ids.push(remaining === 2
      ? "championship"
      : remaining === 4
        ? "semifinals"
        : remaining === 8
          ? "quarterfinals"
          : `round-of-${remaining}`);
  }
  return ids;
}

function tournamentDefaultFinalHealth(recordingScope) {
  return recordingScope === "each-match" ? 110 : 10_000;
}

function tournamentLayerCount(recordingScope, value) {
  if (recordingScope === "each-match") return 3;
  const numeric = Math.floor(Number(value));
  return RACE_TOURNAMENT_LANDSCAPE_LAYER_COUNTS.includes(numeric) ? numeric : 5;
}

function tournamentLayerPreset(recordingScope, finalHealth, value) {
  return buildRaceLayerPreset(tournamentLayerCount(recordingScope, value), finalHealth);
}

function normalizeTournamentRecordingScope(value) {
  if (value == null || value === "") return "each-match";
  const normalized = String(value).trim().toLowerCase();
  if (["whole-tournament", "tournament", "wholeTournament".toLowerCase()].includes(normalized)) {
    return "whole-tournament";
  }
  if (["whole-round", "round", "selected-round", "wholeRound".toLowerCase()].includes(normalized)) {
    return "whole-round";
  }
  if (["each-match", "individual-match", "match", "short"].includes(normalized)) {
    return "each-match";
  }
  return null;
}

function normalizeTournamentRecordingSelection(value, recordingScope) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["whole-tournament", "tournament"].includes(normalized)) return "whole-tournament";
  if (["selected-round", "whole-round", "round", "long"].includes(normalized)) return "selected-round";
  if (["match", "each-match", "individual-match", "short"].includes(normalized)) return "match";
  return recordingScope === "whole-tournament"
    ? "whole-tournament"
    : recordingScope === "whole-round" ? "selected-round" : "match";
}

function tournamentRoundIdForIndex(size, index) {
  return raceTournamentRoundIds(size)[Number(index)] || null;
}

function tournamentRoundIndexForId(size, value) {
  const roundIds = raceTournamentRoundIds(size);
  const raw = String(value ?? "").trim().toLowerCase();
  const directIndex = roundIds.indexOf(raw);
  if (directIndex >= 0) return directIndex;
  const numeric = Number(raw);
  if (Number.isInteger(numeric) && numeric >= 0 && numeric < roundIds.length) return numeric;
  const roundNumber = raw.match(/^round-(\d+)$/)?.[1] || raw.match(/^round-of-(\d+)$/)?.[1];
  if (roundNumber) {
    const roundSize = Number(roundNumber);
    const index = roundIds.findIndex((id) => id === `round-of-${roundSize}`);
    if (index >= 0) return index;
  }
  return -1;
}

function normalizeTournamentRounds(input, size, recordingScope) {
  if (recordingScope === "whole-tournament") return raceTournamentRoundIds(size);
  const raw = input.roundsToRecord
    ?? input.rounds
    ?? input.roundSelection
    ?? input.selectedRoundIds
    ?? input.selectedRounds;
  if (raw == null) return recordingScope === "whole-round" ? raceTournamentRoundIds(size) : [];
  const values = Array.isArray(raw) ? raw : [raw];
  return [...new Set(values
    .map((value) => typeof value === "object" ? value.id ?? value.index : value)
    .map((value) => tournamentRoundIndexForId(size, value))
    .filter((index) => index >= 0))]
    .sort((a, b) => a - b)
    .map((index) => tournamentRoundIdForIndex(size, index));
}

function normalizeTournamentFinalHealth(input, recordingScope) {
  const raw = input.finalLayerHealth
    ?? input.tournamentFinalLayerHealth
    ?? input.matchSettings?.finalLayerHealth
    ?? input.sharedLayerTarget
    ?? input.longformTarget;
  const numeric = Math.floor(Number(raw));
  const fallback = tournamentDefaultFinalHealth(recordingScope);
  return Number.isFinite(numeric) && numeric > 0
    ? Math.min(1_000_000_000_000_000_000, numeric)
    : fallback;
}

function normalizeTournamentLayerValues(input, recordingScope, layerCount, finalHealth) {
  const explicit = input.layerStrengths
    ?? input.sharedLayerValues
    ?? input.layerValues
    ?? input.tournamentLayerValues
    ?? input.matchSettings?.layerStrengths;
  const fallback = tournamentLayerPreset(recordingScope, finalHealth, layerCount);
  return Array.isArray(explicit) && explicit.length === layerCount
    ? normalizeRaceLayers(explicit, fallback, layerCount)
    : fallback;
}

const CLASSIC_DIRECT_COLLISION_IDS = new Set([
  "sword",
  "vampire",
  "slammy",
  "unarmed",
  "snake",
  "grappler",
  "boxer",
  "monster",
  "fairy",
]);

export const FEATURE_DEFAULTS = Object.freeze({
  replay: true,
  tournament: false,
  hazards: true,
  combatFeed: true,
  newClasses: true,
  balanceLab: true,
  shareableSeeds: true,
  socialBattle: true,
  screenShake: true,
  hitStop: true,
  slowMotionHighlights: true,
  damageNumbers: true,
  soundEffects: true,
  soundAmbience: true,
  soundMusic: true,
  soundAnnouncer: true,
  videoRecording: true,
  introCards: true,
  flashReduction: false,
});

const FEATURE_CODES = Object.freeze({
  replay: "r",
  tournament: "t",
  hazards: "h",
  combatFeed: "c",
  newClasses: "n",
  balanceLab: "b",
  shareableSeeds: "s",
  socialBattle: "sb",
  screenShake: "ss",
  hitStop: "hs",
  slowMotionHighlights: "sm",
  damageNumbers: "dn",
  soundEffects: "se",
  soundAmbience: "sa",
  soundMusic: "mu",
  soundAnnouncer: "an",
  videoRecording: "vr",
  introCards: "ic",
  flashReduction: "fr",
});

export const BALANCE_KEYS = Object.freeze([
  "damage",
  "orbSpeed",
  "reach",
  "rotationSpeed",
  "hitCooldown",
  "manaGain",
  "abilityRadius",
  "statusDuration",
  "pickupSpawnRate",
  "projectileSpeed",
  "pickupDamage",
]);

export const DEFAULT_BALANCE = Object.freeze({
  global: Object.freeze({
    damage: 1,
    orbSpeed: 1,
    reach: 1,
    rotationSpeed: 1,
    hitCooldown: 1,
    manaGain: 1,
    abilityRadius: 1,
    statusDuration: 1,
    pickupSpawnRate: 1,
    projectileSpeed: 1,
    pickupDamage: 1,
  }),
  classes: Object.freeze({}),
});

const LIMITS = Object.freeze({
  damage: [0.25, 3],
  orbSpeed: [0.25, 3],
  reach: [0.5, 2],
  rotationSpeed: [0.25, 3],
  hitCooldown: [0.25, 3],
  manaGain: [0, 4],
  abilityRadius: [0.5, 2],
  statusDuration: [0.25, 3],
  pickupSpawnRate: [0.25, 4],
  projectileSpeed: [0.25, 4],
  pickupDamage: [0.25, 4],
});

export function createDefaultSettings() {
  const classes = normalizeClassicClasses(CLASSIC_DEFAULT_CLASSES);
  const classicTeams = normalizeClassicTeams(CLASSIC_DEFAULT_TEAMS);
  return {
    version: 1,
    mode: "match",
    count: 2,
    gameplayMode: "classic",
    countries: ["france", "brazil"],
    hillContenders: ["red", "blue", "green", "orange", "purple", "yellow", "euler", "x-squared", "pi", "phi", "times-two"],
    raceOrbs: [...ORB_RACER_IDS],
    raceTeams: ORB_RACE_DEFAULT_TEAMS.map((team) => [...team]),
    raceTeamOptions: normalizeRaceTeamOptions(null, ORB_RACE_DEFAULT_TEAMS),
    raceLayerCount: 3,
    raceLayerStrengths: [...ORB_RACE_DEFAULT_LAYERS],
    raceShowTargetMessage: true,
    raceTargetAnnouncement: true,
    raceMatchupAnnouncement: true,
    raceTiltedLayerEnabled: false,
    raceTiltedLayerIndex: 0,
    raceOrbScale: ORB_RACE_DEFAULT_ORB_SCALE,
    raceTrails: false,
    raceSolidTrails: false,
    raceScalingDamage: true,
    classes,
    classicOrbOptions: normalizeClassicOrbOptions(null, classes),
    classicTeams,
    classicTeamOptions: normalizeClassicTeamOptions(null, classicTeams),
    classicBlackTheme: true,
    classicTeamColors: true,
    classicHydrogenHealth: 100,
    seed: 2406,
    theme: "cream-foundry",
    hazardPreset: "none",
    arenaModifier: "standard",
    arenaSize: "standard",
    arenaShape: "square",
    features: { ...FEATURE_DEFAULTS },
    social: { enabled: true, format: "portrait", fps: 30, highlightMode: true, showWinProbability: true },
    balance: cloneBalance(DEFAULT_BALANCE),
    raceTournament: null,
    tournament: null,
  };
}

function raceTournamentIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === "string" && ORB_RACER_IDS.includes(id)))];
}

function raceTournamentChoice(value, choices, fallback) {
  return choices.includes(value) ? value : fallback;
}

export function validateRaceTournamentSettings(input) {
  if (input == null || input.enabled === false) return { valid: true, message: "" };
  if (!input || typeof input !== "object") {
    return { valid: false, message: "Tournament settings are invalid." };
  }
  const size = Number(input.size ?? input.bracketSize);
  if (!RACE_TOURNAMENT_BRACKET_SIZES.includes(size)) {
    return { valid: false, message: "Choose a tournament bracket size of 4, 8, 16, 32, or 64." };
  }
  const entrants = input.entrants ?? input.entrantIds ?? input.roster ?? input.racers;
  if (!Array.isArray(entrants)) {
    return { valid: false, message: `Select exactly ${size} Orb Race entrants.` };
  }
  if (entrants.some((id) => !ORB_RACER_IDS.includes(id))) {
    return { valid: false, message: "Tournament entrants must come from the Orb Race roster." };
  }
  if (new Set(entrants).size !== entrants.length) {
    return { valid: false, message: "Each tournament entrant can appear only once." };
  }
  if (entrants.length !== size) {
    return { valid: false, message: `Select exactly ${size} entrants (currently ${entrants.length}).` };
  }
  const seedingMode = input.seedingMode ?? input.seedMode ?? input.seeding;
  if (seedingMode != null && !RACE_TOURNAMENT_SEEDING_MODES.includes(seedingMode)) {
    return { valid: false, message: "Choose deterministic random or custom seeding." };
  }
  if ((seedingMode || "random") === "custom") {
    const seedOrder = input.seedOrder ?? input.order ?? input.seedingOrder;
    if (!Array.isArray(seedOrder) || seedOrder.length !== size) {
      return { valid: false, message: "Custom seeding must include every selected entrant exactly once." };
    }
    if (
      new Set(seedOrder).size !== size
      || seedOrder.some((id) => !entrants.includes(id))
      || entrants.some((id) => !seedOrder.includes(id))
    ) {
      return { valid: false, message: "Custom seeding must include every selected entrant exactly once." };
    }
  }
  const recordingScope = normalizeTournamentRecordingScope(
    input.recordingScope ?? input.recordingPreset ?? input.scope ?? input.recording,
  );
  if (!recordingScope) {
    return { valid: false, message: "Choose an individual match, selected rounds, or the whole tournament." };
  }
  if (recordingScope === "whole-round") {
    const rounds = input.roundsToRecord ?? input.rounds ?? input.roundSelection ?? input.selectedRoundIds ?? input.selectedRounds;
    if (Array.isArray(rounds) && rounds.length === 0) {
      return { valid: false, message: "Select at least one tournament round to record." };
    }
  }
  const requestedLayerCount = input.landscapeLayerCount
    ?? input.layerCount
    ?? input.matchSettings?.layerCount;
  if (recordingScope !== "each-match" && requestedLayerCount != null
    && !RACE_TOURNAMENT_LANDSCAPE_LAYER_COUNTS.includes(Number(requestedLayerCount))) {
    return { valid: false, message: "Landscape tournament recordings use 3 or 5 layers." };
  }
  const expectedLayerCount = tournamentLayerCount(recordingScope, requestedLayerCount);
  const explicitLayers = input.layerStrengths
    ?? input.sharedLayerValues
    ?? input.layerValues
    ?? input.matchSettings?.layerStrengths;
  if (explicitLayers != null && (!Array.isArray(explicitLayers) || explicitLayers.length !== expectedLayerCount)) {
    return { valid: false, message: `Tournament recording needs exactly ${expectedLayerCount} shared layers.` };
  }
  return { valid: true, message: "" };
}

export function normalizeRaceTournamentSettings(input, gameplayMode = ORB_RACE_MODE) {
  if (gameplayMode !== ORB_RACE_MODE || input == null || input.enabled === false) return null;
  if (!input || typeof input !== "object") return null;
  const size = Number(input.size ?? input.bracketSize);
  if (!RACE_TOURNAMENT_BRACKET_SIZES.includes(size)) return null;
  const entrants = raceTournamentIds(input.entrants ?? input.entrantIds ?? input.roster ?? input.racers ?? input.selectedOrbIds);
  if (entrants.length !== size) return null;
  const seedingMode = raceTournamentChoice(
    input.seedingMode ?? input.seedMode ?? input.seeding,
    RACE_TOURNAMENT_SEEDING_MODES,
    "random",
  );
  const rawOrder = input.seedOrder ?? input.order ?? input.seedingOrder;
  const filteredOrder = raceTournamentIds(rawOrder).filter((id) => entrants.includes(id));
  const seedOrder = seedingMode === "custom"
    ? (Array.isArray(rawOrder) ? filteredOrder : entrants)
    : [
        ...filteredOrder,
        ...entrants.filter((id) => !filteredOrder.includes(id)),
      ];
  const recordingScope = normalizeTournamentRecordingScope(
    input.recordingScope ?? input.recordingPreset ?? input.scope ?? input.recording,
  );
  if (!recordingScope) return null;
  const recordingSelection = normalizeTournamentRecordingSelection(
    input.recordingSelection ?? input.recordingMode ?? input.recordingPlan,
    recordingScope,
  );
  const landscapeLayerCount = tournamentLayerCount(
    recordingScope,
    input.landscapeLayerCount ?? input.layerCount ?? input.matchSettings?.layerCount,
  );
  const finalLayerHealth = normalizeTournamentFinalHealth(input, recordingScope);
  const layerStrengths = normalizeTournamentLayerValues(
    input,
    recordingScope,
    landscapeLayerCount,
    finalLayerHealth,
  );
  const roundsToRecord = normalizeTournamentRounds(input, size, recordingScope);
  if (recordingScope === "whole-round" && roundsToRecord.length === 0) return null;
  const roundIds = raceTournamentRoundIds(size);
  const selectedRoundIndices = roundsToRecord
    .map((id) => roundIds.indexOf(id))
    .filter((index) => index >= 0);
  const title = typeof input.title === "string" && input.title.trim()
    ? input.title.trim().slice(0, 80)
    : "ORB RACE TOURNAMENT";
  const matchSettings = {
    ...(input.matchSettings && typeof input.matchSettings === "object" ? input.matchSettings : {}),
    format: recordingScope === "each-match" ? "portrait" : "race-landscape",
    width: recordingScope === "each-match" ? 1080 : 1920,
    height: recordingScope === "each-match" ? 1920 : 1080,
    layerCount: landscapeLayerCount,
    layerStrengths: [...layerStrengths],
    finalLayerHealth,
  };
  const normalized = {
    enabled: true,
    version: 1,
    title,
    size,
    entrants,
    entrantIds: [...entrants],
    selectedEntrantIds: [...entrants],
    seedingMode,
    seeding: seedingMode,
    seedOrder,
    recordingScope,
    recordingPreset: recordingScope,
    recordingSelection,
    recordingFormat: recordingScope === "each-match" ? "short-portrait" : "long-landscape",
    recordingDimensions: { width: matchSettings.width, height: matchSettings.height },
    roundsToRecord,
    selectedRoundIds: [...roundsToRecord],
    selectedRoundIndices,
    landscapeLayerCount,
    layerCount: landscapeLayerCount,
    sharedLayerValues: [...layerStrengths],
    matchSettings,
  };
  return validateRaceTournamentSettings(normalized).valid ? normalized : null;
}

export const validateTournamentSettings = validateRaceTournamentSettings;
export const normalizeTournamentSettings = normalizeRaceTournamentSettings;

export function normalizeSettings(input = {}, validClasses = []) {
  const defaults = createDefaultSettings();
  const legacyClasses = normalizeClassicClasses(input.classes);
  const classicTeamFallback = input.classicTeams == null
    ? legacyClasses.map((id) => [id])
    : defaults.classicTeams;
  const classicTeams = normalizeClassicTeams(input.classicTeams, classicTeamFallback);
  const classes = input.classicTeams == null
    ? legacyClasses
    : [...new Set(classicTeams.flat())];
  const classicOrbOptions = normalizeClassicOrbOptions(input.classicOrbOptions, classes);
  const classicTeamOptions = normalizeClassicTeamOptions(
    input.classicTeamOptions,
    classicTeams,
    classicOrbOptions,
  );
  const raceOrbs = normalizeOrbRacers(input.raceOrbs);
  const legacyRaceTeams = input.raceTeams == null && Array.isArray(input.raceOrbs)
    ? [raceOrbs.filter((_id, index) => index % 2 === 0), raceOrbs.filter((_id, index) => index % 2 === 1)]
    : null;
  const raceTeams = normalizeRaceTeams(input.raceTeams || legacyRaceTeams, defaults.raceTeams);
  const raceOrbScale = normalizeRaceOrbScale(input.raceOrbScale, defaults.raceOrbScale);
  const raceTeamOptions = normalizeRaceTeamOptions(input.raceTeamOptions, raceTeams, {
    fadingTrails: Boolean(input.raceTrails),
    solidTrails: Boolean(input.raceSolidTrails),
    scalingDamage: input.raceScalingDamage !== false,
    orbScale: raceOrbScale,
  });
  const baseRaceLayerCount = normalizeRaceLayerCount(
    input.raceLayerCount,
    Array.isArray(input.raceLayerStrengths) && input.raceLayerStrengths.length
      ? input.raceLayerStrengths.length
      : defaults.raceLayerCount,
  );
  const socialFormat = input.social?.format === "longform" ? "race-landscape" : input.social?.format;
  const classicHydrogenHealth = clampInt(
    input.classicHydrogenHealth,
    1,
    1_000_000,
    defaults.classicHydrogenHealth,
  );
  const gameplayMode = input.gameplayMode === ORB_RACE_MODE || input.gameplayMode === KING_OF_HILL_MODE
    ? ORB_RACE_MODE
    : input.gameplayMode === WORLD_CUP_MODE ? WORLD_CUP_MODE : "classic";
  const raceTournament = normalizeRaceTournamentSettings(input.raceTournament, gameplayMode);
  const raceLayerCount = raceTournament?.matchSettings?.layerCount ?? baseRaceLayerCount;
  const raceLayerStrengths = raceTournament?.matchSettings?.layerStrengths
    ? [...raceTournament.matchSettings.layerStrengths]
    : normalizeRaceLayers(input.raceLayerStrengths, ORB_RACE_DEFAULT_LAYERS, raceLayerCount);
  const normalizedSocialFormat = raceTournament?.matchSettings?.format || (
    ["portrait", "square", "landscape", "race-landscape"].includes(socialFormat)
      ? socialFormat
      : "portrait"
  );

  return {
    version: 1,
    mode: "match",
    count: 2,
    gameplayMode,
    countries: normalizeWorldCupCountries(input.countries),
    hillContenders: normalizeKingOfHillContenders(input.hillContenders),
    raceOrbs,
    raceTeams,
    raceTeamOptions,
    raceLayerCount,
    raceLayerStrengths,
    raceShowTargetMessage: input.raceShowTargetMessage !== false,
    raceTargetAnnouncement: input.raceTargetAnnouncement !== false,
    raceMatchupAnnouncement: input.raceMatchupAnnouncement !== false,
    raceTiltedLayerEnabled: Boolean(input.raceTiltedLayerEnabled),
    raceTiltedLayerIndex: clampInt(input.raceTiltedLayerIndex, 0, Math.max(0, raceLayerCount - 1), 0),
    raceOrbScale,
    raceTrails: Boolean(input.raceTrails),
    raceSolidTrails: Boolean(input.raceSolidTrails),
    raceScalingDamage: input.raceScalingDamage !== false,
    classes,
    classicOrbOptions,
    classicTeams,
    classicTeamOptions,
    classicBlackTheme: input.classicBlackTheme == null
      ? defaults.classicBlackTheme
      : input.classicBlackTheme === true,
    classicTeamColors: input.classicTeamColors == null
      ? defaults.classicTeamColors
      : input.classicTeamColors === true,
    classicHydrogenHealth,
    seed: clampInt(input.seed, 1, 999999999, defaults.seed),
    theme: THEME_IDS.includes(input.theme) ? input.theme : defaults.theme,
    hazardPreset: ["none", "bumpers", "portals", "ice", "speed", "mixed"].includes(input.hazardPreset)
      ? input.hazardPreset
      : defaults.hazardPreset,
    arenaModifier: ARENA_MODIFIER_IDS.includes(input.arenaModifier) ? input.arenaModifier : defaults.arenaModifier,
    arenaSize: ARENA_SIZE_IDS.includes(input.arenaSize) ? input.arenaSize : defaults.arenaSize,
    arenaShape: ARENA_SHAPE_IDS.includes(input.arenaShape) ? input.arenaShape : defaults.arenaShape,
    features: {
      ...Object.fromEntries(
        Object.keys(FEATURE_DEFAULTS).map((key) => [
          key,
          FEATURE_DEFAULTS[key] ? input.features?.[key] !== false : input.features?.[key] === true,
        ]),
      ),
      tournament: false,
      socialBattle: true,
    },
    social: {
      enabled: true,
      format: normalizedSocialFormat,
      fps: Number(input.social?.fps) === 60 ? 60 : 30,
      highlightMode: input.social?.highlightMode !== false,
      showWinProbability: input.social?.showWinProbability !== false,
    },
    balance: sanitizeBalance(input.balance),
    raceTournament,
    // Keep the dormant legacy tournament field normalized away. Orb Race
    // tournament state lives only under raceTournament.
    tournament: null,
  };
}

export function sanitizeBalance(input = {}) {
  const balance = { global: {}, classes: {} };
  for (const key of BALANCE_KEYS) {
    balance.global[key] = sanitizeBalanceValue(key, input.global?.[key] ?? 1);
  }
  if (input.classes && typeof input.classes === "object") {
    for (const [type, values] of Object.entries(input.classes)) {
      if (!CLASSIC_ORB_IDS.includes(type)) continue;
      if (!values || typeof values !== "object") continue;
      balance.classes[type] = {};
      for (const key of BALANCE_KEYS) {
        if (key === "pickupSpawnRate" || key === "projectileSpeed" || key === "pickupDamage") continue;
        if (values[key] === undefined) continue;
        balance.classes[type][key] = sanitizeBalanceValue(key, values[key]);
      }
      if (Object.keys(balance.classes[type]).length === 0) delete balance.classes[type];
    }
  }
  return balance;
}

export function balanceValue(balance, type, key) {
  const clean = sanitizeBalance(balance);
  return clean.global[key] * (clean.classes[type]?.[key] ?? 1);
}

export function isBalanceModified(balance) {
  const clean = sanitizeBalance(balance);
  return BALANCE_KEYS.some((key) => clean.global[key] !== 1) || Object.keys(clean.classes).length > 0;
}

export function encodeSettings(settings, validClasses = []) {
  const clean = normalizeSettings(settings, validClasses);
  return encodeURIComponent(JSON.stringify(compactSettings(clean)));
}

export function decodeSettings(value, validClasses = []) {
  if (!value || typeof value !== "string" || value.length > 24000) return null;
  try {
    return normalizeSettings(expandSettings(JSON.parse(decodeURIComponent(value))), validClasses);
  } catch {
    return null;
  }
}

export function settingsFromUrl(url, validClasses = []) {
  const parsed = new URL(url, "http://localhost");
  return decodeSettings(parsed.searchParams.get("cfg"), validClasses);
}

export function settingsToUrl(settings, currentUrl, validClasses = []) {
  const url = new URL(currentUrl, "http://localhost");
  url.searchParams.set("cfg", encodeSettings(settings, validClasses));
  return url;
}

function compactSettings(settings) {
  const disabledFeatures = Object.keys(settings.features)
    .filter((key) => FEATURE_DEFAULTS[key] && !settings.features[key])
    .map((key) => FEATURE_CODES[key])
    .join(".");
  const enabledFeatures = Object.keys(settings.features)
    .filter((key) => !FEATURE_DEFAULTS[key] && settings.features[key])
    .map((key) => FEATURE_CODES[key])
    .join(".");
  return {
    v: 1,
    m: "m",
    n: 2,
    g: settings.gameplayMode === WORLD_CUP_MODE ? "w" : settings.gameplayMode === ORB_RACE_MODE ? "r" : undefined,
    u: settings.gameplayMode === WORLD_CUP_MODE ? settings.countries : undefined,
    k: settings.gameplayMode === ORB_RACE_MODE ? settings.raceOrbs : undefined,
    e: settings.gameplayMode === ORB_RACE_MODE ? settings.raceTeams : undefined,
    i: settings.gameplayMode === ORB_RACE_MODE ? settings.raceTeamOptions : undefined,
    z: settings.gameplayMode === ORB_RACE_MODE ? settings.raceLayerStrengths : undefined,
    rc: settings.gameplayMode === ORB_RACE_MODE && settings.raceLayerCount !== 3 ? settings.raceLayerCount : undefined,
    vm: settings.gameplayMode === ORB_RACE_MODE && !settings.raceShowTargetMessage ? 0 : undefined,
    ta: settings.gameplayMode === ORB_RACE_MODE && !settings.raceTargetAnnouncement ? 0 : undefined,
    ma: settings.gameplayMode === ORB_RACE_MODE && !settings.raceMatchupAnnouncement ? 0 : undefined,
    tl: settings.gameplayMode === ORB_RACE_MODE && settings.raceTiltedLayerEnabled ? 1 : undefined,
    ti: settings.gameplayMode === ORB_RACE_MODE && settings.raceTiltedLayerEnabled
      ? settings.raceTiltedLayerIndex
      : undefined,
    j: settings.gameplayMode === ORB_RACE_MODE && settings.raceOrbScale !== ORB_RACE_DEFAULT_ORB_SCALE ? settings.raceOrbScale : undefined,
    r: settings.gameplayMode === ORB_RACE_MODE && settings.raceTrails ? 1 : undefined,
    t: settings.gameplayMode === ORB_RACE_MODE && settings.raceSolidTrails ? 1 : undefined,
    d: settings.gameplayMode === ORB_RACE_MODE && !settings.raceScalingDamage ? 0 : undefined,
    rt: settings.gameplayMode === ORB_RACE_MODE && settings.raceTournament
      ? {
          e: 1,
          n: settings.raceTournament.size,
          c: settings.raceTournament.entrants,
          m: settings.raceTournament.seedingMode,
          o: settings.raceTournament.seedOrder,
          w: settings.raceTournament.recordingScope,
          u: settings.raceTournament.recordingSelection,
          p: settings.raceTournament.title === "ORB RACE TOURNAMENT" ? undefined : settings.raceTournament.title,
          r: settings.raceTournament.roundsToRecord,
          lc: settings.raceTournament.landscapeLayerCount,
          l: settings.raceTournament.sharedLayerValues,
          h: settings.raceTournament.matchSettings?.finalLayerHealth,
        }
      : undefined,
    c: settings.classes,
    co: settings.gameplayMode === "classic" ? settings.classicOrbOptions : undefined,
    ct: settings.gameplayMode === "classic" ? settings.classicTeams : undefined,
    ci: settings.gameplayMode === "classic" ? settings.classicTeamOptions : undefined,
    cb: settings.gameplayMode === "classic" && settings.classicBlackTheme ? 1 : undefined,
    tc: settings.gameplayMode === "classic" && !settings.classicTeamColors ? 0 : undefined,
    ch: settings.gameplayMode === "classic" && settings.classicHydrogenHealth !== 100
      ? settings.classicHydrogenHealth
      : undefined,
    s: settings.seed,
    a: settings.theme === "cream-foundry" ? undefined : settings.theme,
    h: settings.hazardPreset,
    q: settings.arenaModifier === "standard" ? undefined : settings.arenaModifier,
    az: settings.arenaSize === "standard" ? undefined : settings.arenaSize,
    p: settings.arenaShape === "square" ? undefined : settings.arenaShape[0],
    x: disabledFeatures ? `~${disabledFeatures}` : undefined,
    y: enabledFeatures ? `~${enabledFeatures}` : undefined,
    o: {
      f: settings.social.format === "portrait"
        ? undefined
        : settings.social.format === "race-landscape" ? "r" : settings.social.format[0],
      r: settings.social.fps === 60 ? 60 : undefined,
      h: settings.social.highlightMode === false ? 0 : undefined,
      w: settings.social.showWinProbability === false ? 0 : undefined,
    },
    b: isBalanceModified(settings.balance) ? settings.balance : undefined,
  };
}

function expandRaceTournament(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return {
    enabled: value.e == null ? true : value.e === 1 || value.e === true,
    size: value.n ?? value.size ?? value.bracketSize,
    entrants: value.c ?? value.entrants ?? value.roster ?? value.racers,
    seedingMode: value.m ?? value.seedingMode ?? value.seedMode,
    seedOrder: value.o ?? value.seedOrder ?? value.order,
    recordingScope: value.w ?? value.recordingScope ?? value.scope,
    recordingSelection: value.u ?? value.recordingSelection ?? value.recording,
    title: value.p ?? value.title ?? value.name,
    roundsToRecord: value.r ?? value.roundsToRecord ?? value.rounds ?? value.selectedRoundIds,
    landscapeLayerCount: value.lc ?? value.landscapeLayerCount ?? value.layerCount,
    sharedLayerValues: value.l ?? value.sharedLayerValues ?? value.layerValues,
    finalLayerHealth: value.h ?? value.finalLayerHealth ?? value.sharedLayerTarget,
  };
}

function expandSettings(value) {
  const disabledFeatureValue = typeof value.x === "string" ? value.x : "";
  const disabledFeatureCodes = disabledFeatureValue.startsWith("~")
    ? new Set(disabledFeatureValue.slice(1).split(".").filter(Boolean))
    : null;
  const enabledFeatureCodes = new Set(
    typeof value.y === "string"
      ? value.y.replace(/^~/, "").split(".").filter(Boolean)
      : [],
  );
  const legacyEnabledLetters = typeof value.f === "string" ? value.f : null;
  const features = {};
  for (const key of Object.keys(FEATURE_DEFAULTS)) {
    features[key] = legacyEnabledLetters
      ? FEATURE_DEFAULTS[key] && legacyEnabledLetters.includes(key[0])
      : disabledFeatureCodes
        ? FEATURE_DEFAULTS[key]
          ? !disabledFeatureCodes.has(FEATURE_CODES[key])
          : enabledFeatureCodes.has(FEATURE_CODES[key])
        : FEATURE_DEFAULTS[key]
          ? !disabledFeatureValue.includes(key[0])
          : enabledFeatureCodes.has(FEATURE_CODES[key]);
  }
  return {
    version: value.v,
    mode: value.m === "t" ? "tournament" : "match",
    count: value.n,
    gameplayMode: value.g === "w" ? WORLD_CUP_MODE : ["k", "r"].includes(value.g) ? ORB_RACE_MODE : "classic",
    countries: value.u,
    hillContenders: value.k,
    raceOrbs: value.k,
    raceTeams: value.e,
    raceTeamOptions: value.i,
    raceLayerCount: value.rc,
    raceLayerStrengths: value.z,
    raceShowTargetMessage: value.vm !== 0,
    raceTargetAnnouncement: value.ta !== 0,
    raceMatchupAnnouncement: value.ma !== 0,
    raceTiltedLayerEnabled: value.tl === 1,
    raceTiltedLayerIndex: value.ti,
    raceOrbScale: value.j,
    raceTrails: value.r === 1,
    raceSolidTrails: value.t === 1,
    raceScalingDamage: value.d !== 0,
    classes: value.c,
    classicOrbOptions: value.co,
    classicTeams: value.ct,
    classicTeamOptions: value.ci,
    classicBlackTheme: value.cb == null ? undefined : value.cb === 1,
    classicTeamColors: value.tc == null ? undefined : value.tc !== 0,
    classicHydrogenHealth: value.ch,
    seed: value.s,
    theme: value.a,
    hazardPreset: value.h,
    arenaModifier: value.q,
    arenaSize: value.az,
    arenaShape: value.p === "c" ? "circle" : "square",
    features,
    social: value.o
      ? {
          enabled: true,
          format: value.o.f === "s"
            ? "square"
            : value.o.f === "l"
              ? "landscape"
              : value.o.f === "r" ? "race-landscape" : "portrait",
          fps: Number(value.o.r) === 60 ? 60 : 30,
          highlightMode: value.o.h !== 0,
          showWinProbability: value.o.w !== 0,
        }
      : undefined,
    balance: value.b,
    // `t` was historically both the Orb Race solid-trail flag and a dormant
    // tournament object. Only an object is treated as that legacy payload;
    // the live Orb Race schema uses the collision-free `rt` key.
    raceTournament: expandRaceTournament(value.rt || (value.t && typeof value.t === "object" ? value.t : null)),
    tournament: null,
  };
}

export function normalizeClassicSpeedMode(value) {
  return normalizeRegistryClassicSpeedMode(value);
}

export function normalizeClassicOrbScale(value, fallback = CLASSIC_DEFAULT_ORB_SCALE) {
  const safeFallback = CLASSIC_ORB_SCALE_OPTIONS.some(({ value: optionValue }) => optionValue === fallback)
    ? fallback
    : CLASSIC_DEFAULT_ORB_SCALE;
  const number = Number(value);
  if (!Number.isFinite(number)) return safeFallback;
  return CLASSIC_ORB_SCALE_OPTIONS.reduce((closest, option) => (
    Math.abs(option.value - number) < Math.abs(closest - number) ? option.value : closest
  ), CLASSIC_ORB_SCALE_OPTIONS[0].value);
}

export function classicOrbOptionDefaults(id) {
  const registryDefault = CLASSIC_ORBS[id]?.defaultCollisionDamage;
  return {
    health: 100,
    orbScale: CLASSIC_DEFAULT_ORB_SCALE,
    speedMode: "regular",
    fadingTrails: false,
    solidTrails: false,
    collisionDamage: typeof registryDefault === "boolean"
      ? registryDefault
      : CLASSIC_DIRECT_COLLISION_IDS.has(id),
    boss: false,
  };
}

export function normalizeClassicOrbOptions(input, classes = CLASSIC_DEFAULT_CLASSES) {
  const source = input && typeof input === "object" ? input : {};
  return Object.fromEntries(normalizeClassicClasses(classes).map((id) => {
    const defaults = classicOrbOptionDefaults(id);
    const raw = source[id] && typeof source[id] === "object" ? source[id] : {};
    return [id, {
      health: normalizeClassicOrbHealth(raw.health, defaults.health),
      orbScale: normalizeClassicOrbScale(raw.orbScale, defaults.orbScale),
      speedMode: normalizeClassicSpeedMode(raw.speedMode),
      fadingTrails: raw.fadingTrails === true,
      solidTrails: raw.solidTrails === true,
      collisionDamage: raw.collisionDamage == null
        ? defaults.collisionDamage
        : raw.collisionDamage === true,
      boss: raw.boss === true || raw.classicBoss === true,
    }];
  }));
}

function sanitizeBalanceValue(key, value) {
  const [min, max] = LIMITS[key];
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.round(Math.max(min, Math.min(max, number)) * 1000) / 1000;
}

function clampInt(value, min, max, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

function cloneBalance(balance) {
  return {
    global: { ...balance.global },
    classes: Object.fromEntries(
      Object.entries(balance.classes).map(([type, values]) => [type, { ...values }]),
    ),
  };
}
