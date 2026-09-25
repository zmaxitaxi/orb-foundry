import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  CLASSIC_DEFAULT_ORB_SCALE,
  CLASSIC_ORB_SCALE_OPTIONS,
  CLASSIC_SPEED_MODE_IDS,
  ARENA_SIZE_IDS,
  RACE_TOURNAMENT_BRACKET_SIZES,
  RACE_TOURNAMENT_RECORDING_SCOPES,
  RACE_TOURNAMENT_SEEDING_MODES,
  classicOrbOptionDefaults,
  decodeSettings,
  encodeSettings,
  normalizeClassicOrbOptions,
  normalizeClassicOrbScale,
  normalizeSettings,
  sanitizeBalance,
  settingsFromUrl,
  settingsToUrl,
  validateRaceTournamentSettings,
} from "../src/config.js";
import {
  CLASSIC_DEFAULT_CLASSES,
  CLASSIC_DEFAULT_TEAMS,
  CLASSIC_ORB_IDS,
  CLASSIC_ORBS,
  CLASSIC_TEAM_OUTLINE_COLORS,
  classicTeamDisplayName,
  classicTeamDisplayParts,
  classicTeamMemberCount,
  normalizeClassicTeams,
} from "../src/classic-orbs.js";
import {
  ARENA,
  CLASS_DEFS,
  ORB_BASE_SPEED,
  WEAPON_REACH_SCALE,
  WEAPON_ROTATION_SCALE,
  WEAPON_SIZE_SCALE,
  WORLD_CUP_PROJECTILE_SPEEDS,
  applyWorldCupPickup,
  captureReplayFrame,
  createSimulation,
  getWeaponSegment,
  selectFighterClasses,
  spawnWorldCupPickup,
  stepSimulation,
} from "../src/simulation.js";
import {
  WORLD_CUP_COUNTRY_IDS,
  WORLD_CUP_COUNTRIES,
  WORLD_CUP_MODE,
  WORLD_CUP_PICKUPS,
  WORLD_CUP_PICKUP_IDS,
  WORLD_CUP_RED_CARD_DAMAGE,
  WORLD_CUP_SOCCER_BALL_DAMAGE,
  WORLD_CUP_YELLOW_CARD_DAMAGE,
  WORLD_CUP_YELLOW_CARD_STUN_SECONDS,
  worldCupCombatStats,
} from "../src/world-cup.js";
import {
  createTournament,
  createTournamentBatchReport,
  currentTournamentMatch,
  deriveBracketSeed,
  deriveTournamentBatchSeed,
  finalizeTournamentBatchReport,
  recordTournamentInBatch,
  recordTournamentResult,
  tournamentMatchEntrants,
} from "../src/tournament.js";
import { ORB_PROFILES, ORB_ROSTER, ORB_SPRITE_PROFILES, THEME_IDS, validateProfileMetadata } from "../src/presentation.js";
import {
  ORB_RACE_DEFAULT_LAYERS,
  ORB_RACE_DEFAULT_ORB_SCALE,
  ORB_RACE_EVERYONE_LABEL,
  ORB_RACE_FINAL_LAYER_PRESETS,
  ORB_RACE_LONGFORM_DEFAULT_LAYERS,
  ORB_RACE_LONGFORM_DEFAULT_LAYER_COUNT,
  ORB_RACE_LONGFORM_DEFAULT_TARGET,
  ORB_RACE_MAX_LAYER_STRENGTH,
  ORB_RACE_MAX_MATH_DAMAGE,
  ORB_RACE_ARTIST_PAINTINGS,
  ORB_RACER_IDS,
  ORB_RACE_ORBITAL_COMBO_STEMS,
  ORB_RACE_MODE,
  ORB_RACE_SPEED_MODE_IDS,
  buildRaceLayerPreset,
  normalizeRaceLayerCount,
  normalizeRaceLayers,
  normalizeRaceComboAbilities,
  normalizeRaceOrbCount,
  normalizeRaceSpeedMode,
  normalizeRaceTeamOptions,
  normalizeRaceTeams,
  raceAbilityIdsFor,
  raceComboTitleFor,
  raceTeamMemberCount,
  raceTeamDisplayName,
  raceTeamDisplayParts,
} from "../src/orb-race.js";

const classes = Object.keys(CLASS_DEFS);
const dt = 1 / 120;

function run(sim, seconds = 120) {
  for (let step = 0; step < seconds / dt && !sim.finished; step += 1) stepSimulation(sim, dt);
}

function arrangeHit(attacker, target) {
  attacker.x = 350;
  attacker.y = 280;
  attacker.vx = attacker.baselineSpeed;
  attacker.vy = 0;
  attacker.weaponAngle = 0;
  target.x = 420;
  target.y = 280;
  target.vx = target.baselineSpeed;
  target.vy = 0;
  target.weaponAngle = Math.PI;
  target.weaponLastHit[attacker.id] = 999;
}

{
  const defaults = normalizeSettings({}, classes);
  assert.equal(defaults.social.actionPlaybackRate, 1, "the social recording speed should default to normal time");
  assert.equal(normalizeSettings({ social: { actionPlaybackRate: 0.2 } }, classes).social.actionPlaybackRate, 0.2);
  assert.equal(normalizeSettings({ social: { actionPlaybackRate: 3 } }, classes).social.actionPlaybackRate, 1);
  assert.deepEqual(defaults.classes, CLASSIC_DEFAULT_CLASSES, "Classic should use the registry-owned safe matchup");
  assert.deepEqual(defaults.classicTeams, CLASSIC_DEFAULT_TEAMS);
  assert.equal(classicTeamMemberCount(defaults.classicTeams, defaults.classicTeamOptions), 2);
  assert.equal(classicTeamDisplayName(["sword", "turret"]), "SWORD + TURRET");
  assert.equal(classicTeamDisplayName(["sword", "turret", "reactor"]), "WEAPON ORBS");
  assert.equal(classicTeamDisplayName(["sword", "flash", "duplicator", "jackpot"]), "EVERYONE");
  assert.equal(classicTeamDisplayName(["turret"], { turret: { count: 3 } }), "3× TURRET");
  assert.deepEqual(classicTeamDisplayParts(["sword", "turret"]).map(({ kind, id }) => ({ kind, id })), [
    { kind: "orb", id: "sword" },
    { kind: "orb", id: "turret" },
  ]);
  assert.deepEqual(CLASSIC_TEAM_OUTLINE_COLORS, { 0: "#0057ff", 1: "#e11d48" });
  assert.deepEqual(CLASSIC_SPEED_MODE_IDS, ["regular", "slow", "fast"]);
  assert.deepEqual(
    CLASSIC_ORB_SCALE_OPTIONS.map(({ value, label }) => [value, label]),
    [[0.55, "MINI"], [0.75, "COMPACT"], [1, "REGULAR"], [1.25, "LARGE"], [1.5, "EXTRA LARGE"]],
  );
  assert.equal(CLASSIC_DEFAULT_ORB_SCALE, 1);
  assert.equal(CLASSIC_ORBS.reactor.color, "#168cff", "Classic Reactor should use the blue orb theme");
  assert.equal(CLASSIC_ORBS.reactor.accent, "#9de9ff", "Classic Reactor should use the light-blue accent");
  assert.equal(normalizeClassicOrbScale(1.4), 1.5);
  assert.equal(normalizeClassicOrbScale("invalid"), 1);
  assert.deepEqual(Object.keys(defaults.classicOrbOptions), CLASSIC_DEFAULT_CLASSES);
  for (const id of CLASSIC_DEFAULT_CLASSES) {
    assert.deepEqual(defaults.classicOrbOptions[id], classicOrbOptionDefaults(id));
  }
  assert.equal(defaults.classicBlackTheme, true);
  assert.equal(defaults.classicTeamColors, true);
  assert.equal(defaults.classicHydrogenHealth, 100);

  const first = CLASSIC_ORB_IDS.includes("vampire") ? "vampire" : CLASSIC_ORB_IDS[0];
  const second = CLASSIC_ORB_IDS.includes("turret") ? "turret" : CLASSIC_ORB_IDS[1];
  const settings = normalizeSettings({
    gameplayMode: "classic",
    classes: [first, second],
    classicOrbOptions: {
      [first]: { orbScale: 1.5, speedMode: "fast", fadingTrails: true, solidTrails: false, collisionDamage: true },
      [second]: { orbScale: 0.55, speedMode: "slow", fadingTrails: false, solidTrails: true, collisionDamage: false },
      removed: { speedMode: "fast", fadingTrails: true, collisionDamage: true },
    },
    classicBlackTheme: true,
    classicTeamColors: false,
    classicHydrogenHealth: 4567,
    arenaSize: "large",
  }, classes);
  assert.deepEqual(settings.classicOrbOptions, {
    [first]: { health: 100, orbScale: 1.5, speedMode: "fast", fadingTrails: true, solidTrails: false, collisionDamage: true, boss: false },
    [second]: { health: 100, orbScale: 0.55, speedMode: "slow", fadingTrails: false, solidTrails: true, collisionDamage: false, boss: false },
  });
  const restored = settingsFromUrl(settingsToUrl(settings, "https://example.test/play", classes), classes);
  assert.deepEqual(restored.classes, [first, second]);
  assert.deepEqual(restored.classicOrbOptions, settings.classicOrbOptions);
  assert.equal(restored.classicBlackTheme, true, "the Classic black arena should survive share URLs");
  assert.equal(restored.classicTeamColors, false, "disabled Classic team colors should survive share URLs");
  assert.equal(
    JSON.parse(decodeURIComponent(settingsToUrl(settings, "https://example.test/play", classes).searchParams.get("cfg"))).tc,
    0,
    "disabled Classic team colors should use an explicit compact URL value",
  );
  assert.equal(restored.classicHydrogenHealth, 4567, "custom Hydrogen Bomb health should survive share URLs");
  assert.equal(restored.arenaSize, "large", "the large square arena toggle should survive share URLs");
  assert.deepEqual(ARENA_SIZE_IDS, ["standard", "large"]);
  assert.equal(restored.classicOrbOptions[first].orbScale, 1.5, "Classic extra-large size should survive share URLs");
  assert.equal(restored.classicOrbOptions[second].orbScale, 0.55, "Classic mini size should survive share URLs");
  assert.equal(normalizeSettings({ classicHydrogenHealth: 0 }, classes).classicHydrogenHealth, 1);
  assert.equal(normalizeSettings({ classicHydrogenHealth: 9_000_000 }, classes).classicHydrogenHealth, 1_000_000);
  assert.equal(normalizeSettings({ classicHydrogenHealth: "bad" }, classes).classicHydrogenHealth, 100);
  assert.equal(normalizeSettings({ arenaSize: "invalid" }, classes).arenaSize, "standard");

  const perOrbHealth = normalizeSettings({
    gameplayMode: "classic",
    classicTeams: [["hydrogen-bomb"], ["hive-ball"]],
    classicTeamOptions: [
      { "hydrogen-bomb": { health: 1234, boss: true } },
      { "hive-ball": { health: 77 } },
    ],
  }, classes);
  assert.equal(perOrbHealth.classicTeamOptions[0]["hydrogen-bomb"].health, 1234);
  assert.equal(perOrbHealth.classicTeamOptions[0]["hydrogen-bomb"].boss, true);
  assert.equal(perOrbHealth.classicTeamOptions[1]["hive-ball"].health, 77);
  assert.equal(classicTeamDisplayName(["hydrogen-bomb"], perOrbHealth.classicTeamOptions[0]), "HYDROGEN BOMB BOSS");

  const multiTeamSettings = normalizeSettings({
    gameplayMode: "classic",
    classicTeams: [["sword", "turret"], ["orbital", "reactor"]],
    classicTeamOptions: [
      {
        sword: { count: 2, orbScale: 0.55, speedMode: "slow", fadingTrails: true },
        turret: { count: 3, collisionDamage: true },
      },
      {
        orbital: { count: 1, orbScale: 1.25 },
        reactor: { count: 2, speedMode: "fast", solidTrails: true },
      },
    ],
  }, classes);
  assert.deepEqual(multiTeamSettings.classicTeams, [["sword", "turret"], ["orbital", "reactor"]]);
  assert.equal(classicTeamMemberCount(multiTeamSettings.classicTeams, multiTeamSettings.classicTeamOptions), 8);
  assert.equal(multiTeamSettings.classicTeamOptions[0].sword.count, 2);
  assert.equal(multiTeamSettings.classicTeamOptions[1].reactor.speedMode, "fast");
  const multiTeamUrl = settingsToUrl(multiTeamSettings, "https://example.test/play", classes);
  const multiTeamCompact = JSON.parse(decodeURIComponent(multiTeamUrl.searchParams.get("cfg")));
  assert.deepEqual(multiTeamCompact.ct, multiTeamSettings.classicTeams);
  assert.deepEqual(multiTeamCompact.ci, multiTeamSettings.classicTeamOptions);
  const restoredMultiTeamSettings = settingsFromUrl(multiTeamUrl, classes);
  assert.deepEqual(restoredMultiTeamSettings.classicTeams, multiTeamSettings.classicTeams);
  assert.deepEqual(restoredMultiTeamSettings.classicTeamOptions, multiTeamSettings.classicTeamOptions);
  const multiTeamSim = createSimulation({
    classes: multiTeamSettings.classes,
    classicOrbOptions: multiTeamSettings.classicOrbOptions,
    classicTeams: multiTeamSettings.classicTeams,
    classicTeamOptions: multiTeamSettings.classicTeamOptions,
    seed: 455,
  });
  assert.equal(multiTeamSim.fighters.length, 8);
  assert.deepEqual(
    multiTeamSim.fighters.map((fighter) => fighter.classicTeamIndex),
    [0, 1, 0, 1, 0, 1, 0, 0],
  );
  assert.deepEqual(multiTeamSim.classicTeamNames, ["2× SWORD + 3× TURRET", "ORBITAL + 2× REACTOR"]);
  assert.equal(multiTeamSim.fighters.find((fighter) => fighter.type === "sword").classicSpeedMode, "slow");

  const emptyTeamSettings = normalizeSettings({
    gameplayMode: "classic",
    classicTeams: [[], ["orbital"]],
  }, classes);
  assert.deepEqual(normalizeClassicTeams([[], ["orbital"]]), [[], ["orbital"]]);
  assert.deepEqual(emptyTeamSettings.classicTeams, [[], ["orbital"]]);
  assert.equal(classicTeamMemberCount(emptyTeamSettings.classicTeams, emptyTeamSettings.classicTeamOptions), 1);
  const emptyTeamUrl = settingsToUrl(emptyTeamSettings, "https://example.test/play", classes);
  assert.deepEqual(settingsFromUrl(emptyTeamUrl, classes).classicTeams, [[], ["orbital"]]);

  const standardArena = createSimulation({ classes: [first, second], arenaSize: "standard", seed: 455 });
  const largeArena = createSimulation({ classes: [first, second], arenaSize: "large", seed: 455 });
  assert.ok(largeArena.arenaBounds.width > standardArena.arenaBounds.width, "large square should expose a wider collision arena");
  assert.deepEqual(largeArena.arenaBounds, { x: 0, y: 0, width: ARENA.width, height: ARENA.height }, "large square should use the full simulation canvas");
  assert.equal(standardArena.arenaBounds.width, ARENA.width - ARENA.padding * 2, "standard size should retain its inset chamber");
  assert.equal(largeArena.arenaSize, "large");

  const malformed = normalizeClassicOrbOptions({
    [first]: { speedMode: "warp", fadingTrails: 1, solidTrails: "yes", collisionDamage: "yes" },
  }, [first, second]);
  assert.equal(malformed[first].speedMode, "regular");
  assert.equal(malformed[first].fadingTrails, false);
  assert.equal(malformed[first].solidTrails, false);
  assert.equal(malformed[first].collisionDamage, false);
  assert.equal(malformed[first].orbScale, 1);
  assert.deepEqual(malformed[second], classicOrbOptionDefaults(second));

  for (const [id, definition] of Object.entries(CLASSIC_ORBS)) {
    assert.equal(classicOrbOptionDefaults(id).collisionDamage, definition.defaultCollisionDamage === true);
  }

  const raceSettings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceOrbScale: 1,
    raceTeams: [["speed"], ["orbital"]],
    raceTeamOptions: [{ speed: { orbScale: 0.55 } }, { orbital: { orbScale: 1 } }],
    classicOrbOptions: { [first]: { orbScale: 1.5 } },
  }, classes);
  const raceUrl = settingsToUrl(raceSettings, "https://example.test/play", classes);
  const raceCompact = JSON.parse(decodeURIComponent(raceUrl.searchParams.get("cfg")));
  assert.equal(raceCompact.co, undefined, "Classic orb options must not be serialized into Orb Race URLs");
  assert.equal(raceCompact.tc, undefined, "Classic team-color options must not be serialized into Orb Race URLs");
  const restoredRace = settingsFromUrl(raceUrl, classes);
  assert.equal(restoredRace.raceTeamOptions[0].speed.orbScale, 0.55);
  assert.equal(restoredRace.raceTeamOptions[1].orbital.orbScale, 1);
  const cagedRace = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["super-x-power"], ["duplicator"]],
    raceTeamOptions: [{ "super-x-power": { caged: true, cageDuration: 7.5 } }, {}],
  });
  assert.equal(cagedRace.raceTeamOptions[0]["super-x-power"].caged, true);
  assert.equal(cagedRace.raceTeamOptions[0]["super-x-power"].cageDuration, 7.5);
  const cagedRoundTrip = settingsFromUrl(settingsToUrl(cagedRace, "https://example.test/play", classes), classes);
  assert.equal(cagedRoundTrip.raceTeamOptions[0]["super-x-power"].caged, true);
  assert.equal(cagedRoundTrip.raceTeamOptions[0]["super-x-power"].cageDuration, 7.5);
}

{
  assert.deepEqual(RACE_TOURNAMENT_BRACKET_SIZES, [4, 8, 16, 32, 64]);
  assert.deepEqual(RACE_TOURNAMENT_SEEDING_MODES, ["random", "custom"]);
  assert.deepEqual(RACE_TOURNAMENT_RECORDING_SCOPES, ["each-match", "whole-round", "whole-tournament"]);
  for (const size of RACE_TOURNAMENT_BRACKET_SIZES) {
    const entrants = ORB_RACER_IDS.slice(0, size);
    const tournament = normalizeSettings({
      gameplayMode: ORB_RACE_MODE,
      raceTournament: {
        enabled: true,
        size,
        entrants,
        seedingMode: "random",
        recordingScope: "each-match",
      },
    }, classes).raceTournament;
    assert.equal(tournament.enabled, true);
    assert.equal(tournament.size, size);
    assert.deepEqual(tournament.entrants, entrants);
    assert.equal(tournament.seedingMode, "random");
    assert.deepEqual(tournament.seedOrder, entrants);
    assert.equal(tournament.recordingScope, "each-match");
    assert.equal(tournament.matchSettings.format, "portrait");
    assert.equal(tournament.matchSettings.layerCount, 3);
    assert.equal(tournament.matchSettings.layerStrengths.length, 3);
    const restored = settingsFromUrl(
      settingsToUrl(normalizeSettings({ gameplayMode: ORB_RACE_MODE, raceTournament: tournament }, classes), "https://example.test/play", classes),
      classes,
    );
    assert.deepEqual(restored.raceTournament, tournament, `Orb Race tournament size ${size} should round trip`);
  }

  const customEntrants = ORB_RACER_IDS.slice(5, 13);
  const customOrder = [...customEntrants].reverse();
  const customSettings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTournament: {
      enabled: true,
      bracketSize: 8,
      entrants: customEntrants,
      seedingMode: "custom",
      seedOrder: customOrder,
      recordingScope: "whole-round",
      recordingSelection: "selected-round",
      title: "SPRING BRACKET",
      roundsToRecord: ["quarterfinals"],
      landscapeLayerCount: 3,
      finalLayerHealth: 5000,
      layerStrengths: [5, 250, 5000],
    },
  }, classes);
  assert.equal(validateRaceTournamentSettings(customSettings.raceTournament).valid, true);
  assert.deepEqual(customSettings.raceTournament.seedOrder, customOrder);
  const customCompact = JSON.parse(decodeURIComponent(
    settingsToUrl(customSettings, "https://example.test/play", classes).searchParams.get("cfg"),
  ));
  assert.equal(customCompact.rt.e, 1);
  assert.equal(customCompact.rt.n, 8);
  assert.deepEqual(customCompact.rt.c, customEntrants);
  assert.equal(customCompact.rt.m, "custom");
  assert.deepEqual(customCompact.rt.o, customOrder);
  assert.equal(customCompact.rt.w, "whole-round");
  assert.equal(customCompact.rt.u, "selected-round");
  assert.equal(customCompact.rt.p, "SPRING BRACKET");
  assert.deepEqual(customCompact.rt.r, ["quarterfinals"]);
  assert.equal(customCompact.rt.lc, 3);
  assert.deepEqual(customCompact.rt.l, [5, 250, 5000]);
  assert.equal(customCompact.rt.h, 5000);
  assert.deepEqual(settingsFromUrl(settingsToUrl(customSettings, "https://example.test/play", classes), classes).raceTournament, customSettings.raceTournament);

  const autofilledTournament = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTournament: {
      enabled: true,
      size: 8,
      entrants: customEntrants,
      recordingScope: "whole-round",
      recordingSelection: "selected-round",
      roundsToRecord: ["semifinals"],
      landscapeLayerCount: 3,
      finalLayerHealth: 10_000,
    },
  }, classes).raceTournament;
  assert.deepEqual(autofilledTournament.sharedLayerValues, [10, 500, 10_000]);
  assert.deepEqual(autofilledTournament.selectedRoundIds, ["semifinals"]);
  const autofilledRoundTrip = settingsFromUrl(
    settingsToUrl({ ...normalizeSettings({ gameplayMode: ORB_RACE_MODE, raceTournament: autofilledTournament }, classes) }, "https://example.test/play", classes),
    classes,
  ).raceTournament;
  assert.deepEqual(autofilledRoundTrip.sharedLayerValues, [10, 500, 10_000]);
  assert.deepEqual(autofilledRoundTrip.selectedRoundIds, ["semifinals"]);

  const wholeTournament = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTournament: {
      enabled: true,
      size: 4,
      entrants: ORB_RACER_IDS.slice(0, 4),
      recordingScope: "whole-tournament",
      landscapeLayerCount: 3,
      finalLayerHealth: 2500,
    },
  }, classes).raceTournament;
  assert.equal(wholeTournament.recordingSelection, "whole-tournament");
  assert.equal(wholeTournament.matchSettings.format, "race-landscape");
  assert.equal(wholeTournament.matchSettings.layerCount, 3);
  assert.equal(wholeTournament.roundsToRecord.length, 2);

  const invalid = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTournament: { enabled: true, size: 4, entrants: ["speed", "speed"] },
  }, classes);
  assert.equal(invalid.raceTournament, null, "invalid entrant count/order should safely disable the URL configuration");
  assert.equal(validateRaceTournamentSettings({ enabled: true, size: 4, entrants: ["speed"] }).valid, false);
  assert.equal(
    normalizeSettings({ gameplayMode: "classic", raceTournament: { enabled: true, size: 4, entrants: ORB_RACER_IDS.slice(0, 4) } }, classes).raceTournament,
    null,
    "Classic settings must not gain Orb Race tournament state",
  );
  const legacyTournament = encodeURIComponent(JSON.stringify({
    v: 1,
    m: "t",
    n: 8,
    t: { n: 8, c: ORB_RACER_IDS.slice(0, 8), w: false },
    s: 9912,
  }));
  const legacyRestored = settingsFromUrl(`https://example.test/play?cfg=${legacyTournament}`, classes);
  assert.equal(legacyRestored.tournament, null, "legacy tournament URLs must keep the dormant field stripped");
  assert.equal(legacyRestored.raceTournament, null, "legacy non-Orb-Race tournament URLs must not opt into Orb Race");
}

{
  const settings = normalizeSettings({
    gameplayMode: WORLD_CUP_MODE,
    countries: ["france", "sweden", "usa", "brazil"],
    seed: 2806,
    balance: { global: { pickupSpawnRate: 1.75, projectileSpeed: 1.4, pickupDamage: 1.3 } },
  }, classes);
  const restored = decodeSettings(encodeSettings(settings, classes), classes);
  assert.equal(restored.gameplayMode, WORLD_CUP_MODE);
  assert.deepEqual(restored.countries, settings.countries);
  assert.equal(restored.balance.global.pickupSpawnRate, 1.75);
  assert.equal(restored.balance.global.projectileSpeed, 1.4);
  assert.equal(restored.balance.global.pickupDamage, 1.3);
  assert.ok(WORLD_CUP_COUNTRY_IDS.includes("congo-dr"));
  assert.equal(WORLD_CUP_COUNTRY_IDS.length, 31);
  assert.deepEqual(WORLD_CUP_COUNTRY_IDS.slice(-23), [
    "argentina",
    "cabo-verde",
    "netherlands",
    "morocco",
    "portugal",
    "croatia",
    "germany",
    "paraguay",
    "norway",
    "ivory-coast",
    "mexico",
    "ecuador",
    "belgium",
    "senegal",
    "spain",
    "austria",
    "australia",
    "egypt",
    "switzerland",
    "algeria",
    "colombia",
    "ghana",
    "canada",
  ]);
  for (const id of WORLD_CUP_COUNTRY_IDS.slice(-23)) {
    assert.ok(existsSync(new URL(`../assets/generated/world-cup/flags/${id}.png`, import.meta.url)), `${id} flag should exist`);
    assert.ok(WORLD_CUP_COUNTRIES[id].palette.length >= 2, `${id} should provide a winner-text flag palette`);
  }
  assert.deepEqual(WORLD_CUP_PICKUP_IDS, [
    "red-energy-drink",
    "green-energy-drink",
    "shin-guards",
    "soccer-ball",
    "yellow-card",
    "red-card",
  ]);
  assert.equal(WORLD_CUP_PICKUPS["red-energy-drink"].feedback, "ATTACK ↑");
  assert.equal(WORLD_CUP_PICKUPS["green-energy-drink"].feedback, "HEALTH ↑");
  assert.equal(WORLD_CUP_PICKUPS["shin-guards"].feedback, "DEFENSE ↑");
  assert.equal(WORLD_CUP_PICKUPS["soccer-ball"].label, "1.5 HEARTS");
  assert.equal(WORLD_CUP_PICKUPS["yellow-card"].label, "0.5 HEART · 1.5S STUN");
  assert.equal(WORLD_CUP_PICKUPS["red-card"].label, "1.5 HEARTS");
  const pickupWeightTotal = WORLD_CUP_PICKUP_IDS.reduce((sum, id) => sum + WORLD_CUP_PICKUPS[id].weight, 0);
  assert.ok(WORLD_CUP_PICKUPS["green-energy-drink"].weight / pickupWeightTotal < 0.15, "healing drinks should occupy less than 15% of weighted spawns");
  assert.ok(WORLD_CUP_PICKUPS["shin-guards"].weight / pickupWeightTotal < 0.1, "shin guards should occupy less than 10% of weighted spawns");
}

{
  const requestedPairs = [
    ["argentina", "cabo-verde"],
    ["netherlands", "morocco"],
    ["portugal", "croatia"],
    ["germany", "paraguay"],
    ["norway", "ivory-coast"],
    ["mexico", "ecuador"],
    ["belgium", "senegal"],
    ["spain", "austria"],
    ["australia", "egypt"],
    ["switzerland", "algeria"],
    ["colombia", "ghana"],
    ["ghana", "canada"],
  ];
  for (const countries of requestedPairs) {
    const sim = createSimulation({ count: 2, classes: ["fire", "ice"], gameplayMode: WORLD_CUP_MODE, countries, seed: 2906 });
    assert.deepEqual(sim.fighters.map((fighter) => fighter.countryId), countries);
    assert.deepEqual(sim.fighters.map((fighter) => fighter.name), countries.map((id) => WORLD_CUP_COUNTRIES[id].name));
  }
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: WORLD_CUP_MODE,
    countries: ["france", "brazil"],
    seed: 2806,
  });
  assert.equal(sim.gameplayMode, WORLD_CUP_MODE);
  assert.deepEqual(sim.fighters.map((fighter) => fighter.countryId), ["france", "brazil"]);
  assert.deepEqual(sim.fighters.map((fighter) => fighter.name), ["France", "Brazil"]);
  assert.ok(sim.fighters.every((fighter) => fighter.weapon.damage === 0 && fighter.weapon.length === 0));
  assert.ok(sim.nextWorldCupPickupAt >= 0.7 && sim.nextWorldCupPickupAt <= 1.1);
  while (sim.time < 1.11) stepSimulation(sim, 1 / 120);
  assert.equal(sim.events.filter((event) => event.type === "world-cup-pickup-spawn").length, 1);
  assert.equal(sim.worldCupPickups[0].type, "soccer-ball", "every World Cup match should visibly open with a homing ball");
  assert.equal(sim.worldCupPickups[0].x, sim.arenaBounds.x + sim.arenaBounds.width / 2);
  assert.equal(sim.worldCupPickups[0].y, sim.arenaBounds.y + sim.arenaBounds.height / 2);
  assert.equal(sim.nextWorldCupPickupType, null);
  assert.ok(sim.nextWorldCupPickupAt - sim.time >= 1.19 && sim.nextWorldCupPickupAt - sim.time <= 1.81);
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: WORLD_CUP_MODE,
    countries: ["france", "brazil"],
    seed: 2813,
    balance: { global: { pickupSpawnRate: 2 } },
  });
  assert.equal(sim.worldCupPickupSpawnRate, 2);
  assert.ok(sim.nextWorldCupPickupAt >= 0.35 && sim.nextWorldCupPickupAt <= 0.55);
  while (sim.time < 0.56) stepSimulation(sim, 1 / 120);
  assert.ok(sim.nextWorldCupPickupAt - sim.time >= 0.59 && sim.nextWorldCupPickupAt - sim.time <= 0.91);
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: WORLD_CUP_MODE,
    countries: ["france", "brazil"],
    seed: 2807,
  });
  const [france, brazil] = sim.fighters;
  france.x = 340;
  brazil.x = 410;
  france.y = brazil.y = 340;
  france.vx = 220;
  brazil.vx = -220;
  france.vy = brazil.vy = 0;
  applyWorldCupPickup(sim, france, "red-energy-drink");
  assert.equal(france.worldCupDamageStacks, 1);
  assert.equal(worldCupCombatStats(france, sim.time).attackMultiplier, 1.1);
  applyWorldCupPickup(sim, france, "red-energy-drink");
  assert.equal(france.worldCupDamageStacks, 2);
  assert.equal(worldCupCombatStats(france, sim.time).attackMultiplier, 1.2);
  applyWorldCupPickup(sim, france, "red-energy-drink");
  assert.equal(france.worldCupDamageStacks, 3);
  assert.equal(worldCupCombatStats(france, sim.time).attackMultiplier, 1.3);
  const attackFeedback = sim.effects.find((effect) => effect.kind === "world-cup-pickup");
  assert.equal(attackFeedback.label, "ATTACK ↑");
  assert.equal(attackFeedback.maxLife, 1.25);
  stepSimulation(sim, 1 / 120);
  assert.equal(brazil.health, 100, "World Cup body collisions should not deal damage");
  assert.equal(france.health, 100, "World Cup body collisions should be movement-only");
  assert.equal(sim.events.some((event) => event.type === "collision-hit" && event.worldCup), false);
  assert.equal(france.worldCupDamageStacks, 3, "damage-up stacks should remain permanent");
  assert.deepEqual(worldCupCombatStats(france, sim.time), { damage: 0, attackMultiplier: 1.3, defense: 1 });
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: WORLD_CUP_MODE,
    countries: ["sweden", "japan"],
    seed: 2808,
  });
  const [sweden, japan] = sim.fighters;
  sweden.x = 220;
  japan.x = 500;
  sweden.y = japan.y = 360;
  sweden.vx = sweden.vy = japan.vx = japan.vy = 0;
  sweden.health = 72;
  applyWorldCupPickup(sim, sweden, "green-energy-drink");
  assert.equal(sweden.health, 87, "green drink should restore exactly 1.5 hearts");
  applyWorldCupPickup(sim, japan, "shin-guards");
  assert.deepEqual(worldCupCombatStats(japan, sim.time), { damage: 0, attackMultiplier: 1, defense: 1.1 });
  applyWorldCupPickup(sim, japan, "shin-guards");
  assert.deepEqual(worldCupCombatStats(japan, sim.time), { damage: 0, attackMultiplier: 1, defense: 1.2 });
  const blockedHealth = japan.health;
  applyWorldCupPickup(sim, sweden, "red-card");
  assert.equal(japan.health, blockedHealth, "red cards should wait while orbiting their collector");
  assert.equal(sim.worldCupPendingItems.length, 1);
  for (let index = 0; index < 241; index += 1) stepSimulation(sim, 1 / 120);
  assert.equal(sim.worldCupPendingItems.length, 0);
  assert.equal(sim.worldCupProjectiles.length, 1, "red cards should become homing throwables after their orbit");
  assert.equal(sim.worldCupProjectiles[0].kind, "red-card");
  for (let index = 0; index < 180 && sim.worldCupProjectiles.length; index += 1) stepSimulation(sim, 1 / 120);
  assert.ok(Math.abs(japan.health - (blockedHealth - WORLD_CUP_RED_CARD_DAMAGE / 1.2)) < 1e-9, "two shin guards should divide red-card damage by 1.2");
  assert.ok(sim.events.some((event) => event.type === "world-cup-card-use" && event.pickupType === "red-card"));
  assert.ok(sim.events.some((event) => event.type === "world-cup-card-hit" && event.pickupType === "red-card"));
  assert.equal(sim.effects.find((effect) => effect.kind === "world-cup-card-hit")?.impactKind, "critical");
  assert.equal(japan.invulnerableUntil, 0, "shin guards should no longer grant temporary immunity");
  assert.equal(japan.shinGuardStacks, 2, "shin-guard defense should stack permanently");
  assert.equal(worldCupCombatStats(japan, sim.time).defense, 1.2, "stacked defense should not expire");
  applyWorldCupPickup(sim, sweden, "yellow-card");
  assert.ok(japan.stunUntil < sim.time + WORLD_CUP_YELLOW_CARD_STUN_SECONDS, "yellow cards should not stun during their orbit");
  for (let index = 0; index < 241; index += 1) stepSimulation(sim, 1 / 120);
  assert.equal(sim.worldCupProjectiles[0].kind, "yellow-card", "yellow cards should become homing throwables after their orbit");
  const healthBeforeYellow = japan.health;
  for (let index = 0; index < 180 && sim.worldCupProjectiles.length; index += 1) stepSimulation(sim, 1 / 120);
  assert.ok(Math.abs((japan.stunUntil - sim.time) - WORLD_CUP_YELLOW_CARD_STUN_SECONDS) < 0.02, "yellow-card impact should stun for 1.5 seconds");
  assert.ok(Math.abs(japan.health - (healthBeforeYellow - WORLD_CUP_YELLOW_CARD_DAMAGE / 1.2)) < 1e-9, "yellow-card impact should deal half a heart before defense");
  assert.ok(sim.events.some((event) => event.type === "world-cup-card-hit" && event.pickupType === "yellow-card"));
  assert.equal(sim.events.find((event) => event.type === "world-cup-card-hit" && event.pickupType === "yellow-card")?.duration, WORLD_CUP_YELLOW_CARD_STUN_SECONDS);
  assert.ok(sim.effects.filter((effect) => effect.kind === "world-cup-card-hit").every((effect) => effect.impactKind === "critical"));
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: WORLD_CUP_MODE,
    countries: ["usa", "bosnia"],
    seed: 2812,
  });
  const [usa, bosnia] = sim.fighters;
  usa.x = 220;
  bosnia.x = 500;
  usa.y = bosnia.y = 360;
  usa.vx = usa.vy = bosnia.vx = bosnia.vy = 0;
  applyWorldCupPickup(sim, usa, "red-energy-drink");
  applyWorldCupPickup(sim, usa, "red-energy-drink");
  assert.equal(usa.worldCupDamageStacks, 2);
  applyWorldCupPickup(sim, usa, "red-card");
  for (let index = 0; index < 241; index += 1) stepSimulation(sim, 1 / 120);
  for (let index = 0; index < 180 && sim.worldCupProjectiles.length; index += 1) stepSimulation(sim, 1 / 120);
  assert.equal(bosnia.health, 82, "two permanent damage-up stacks should boost red-card damage from 15 to 18");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: WORLD_CUP_MODE,
    countries: ["england", "congo-dr"],
    seed: 2809,
    balance: { global: { projectileSpeed: 1.5 } },
  });
  const [england, congo] = sim.fighters;
  england.x = 240;
  england.y = congo.y = 360;
  congo.x = 480;
  england.vx = england.vy = congo.vx = congo.vy = 0;
  applyWorldCupPickup(sim, england, "soccer-ball");
  assert.equal(sim.worldCupProjectiles.length, 0, "the ball should orbit before launch");
  assert.equal(sim.worldCupPendingItems[0].type, "soccer-ball");
  for (let index = 0; index < 241; index += 1) stepSimulation(sim, 1 / 120);
  assert.equal(sim.worldCupPendingItems.length, 0);
  assert.equal(sim.worldCupProjectiles.length, 1);
  assert.equal(sim.worldCupProjectileSpeed, 1.5);
  assert.equal(sim.worldCupProjectiles[0].speed, WORLD_CUP_PROJECTILE_SPEEDS["soccer-ball"] * 1.5);
  for (let index = 0; index < 180 && congo.health === 100; index += 1) stepSimulation(sim, 1 / 120);
  assert.equal(congo.health, 100 - WORLD_CUP_SOCCER_BALL_DAMAGE, "homing soccer ball should deal exactly 1.5 hearts");
  assert.equal(sim.effects.find((effect) => effect.kind === "world-cup-ball-hit")?.impactKind, "critical");
  const pickup = spawnWorldCupPickup(sim, "yellow-card", 360, 360);
  assert.equal(pickup.type, "yellow-card");
  assert.equal(sim.worldCupPickups.at(-1).radius, 22);
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: WORLD_CUP_MODE,
    countries: ["england", "congo-dr"],
    seed: 2815,
    balance: { global: { pickupDamage: 1.4 } },
  });
  const [england, congo] = sim.fighters;
  england.x = 240;
  england.y = congo.y = 360;
  congo.x = 480;
  england.vx = england.vy = congo.vx = congo.vy = 0;
  assert.equal(sim.worldCupPickupDamage, 1.4);
  applyWorldCupPickup(sim, england, "soccer-ball");
  for (let index = 0; index < 241; index += 1) stepSimulation(sim, 1 / 120);
  for (let index = 0; index < 180 && congo.health === 100; index += 1) stepSimulation(sim, 1 / 120);
  assert.equal(congo.health, 100 - WORLD_CUP_SOCCER_BALL_DAMAGE * 1.4, "pickup damage should scale soccer-ball damage");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: WORLD_CUP_MODE,
    countries: ["france", "brazil"],
    seed: 2810,
  });
  const [france, brazil] = sim.fighters;
  france.x = 180;
  france.y = 210;
  brazil.x = 540;
  brazil.y = 510;
  france.vx = 140;
  france.vy = -95;
  brazil.vx = brazil.vy = 0;
  stepSimulation(sim, 1 / 120);
  assert.equal(france.vx, 140, "World Cup movement should not accelerate toward opponents");
  assert.equal(france.vy, -95, "World Cup movement should have no downward gravity");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: WORLD_CUP_MODE,
    countries: ["france", "brazil"],
    seed: 2811,
  });
  const [france, brazil] = sim.fighters;
  france.x = 340;
  brazil.x = 420;
  france.y = brazil.y = 360;
  france.vx = 120;
  brazil.vx = -120;
  france.vy = brazil.vy = 0;
  stepSimulation(sim, 1 / 120);
  assert.ok(france.vx < -120 && brazil.vx > 120, "World Cup orb collisions should rebound harder than arrival speed");
}

{
  const settings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: [
      "factorial", "prime", "integral", "quadratic", "pi", "speed-impact",
      "ricochet", "sawblade", "black-hole", "godzilla", "turret", "leech",
      "crusher", "berserker", "reactor", "parasite", "draftmaster",
    ],
    raceTeams: [
      ["factorial", "quadratic", "jackpot", "godzilla", "turret", "crusher", "reactor", "draftmaster"],
      ["prime", "integral", "pi", "speed-impact", "black-hole", "leech", "berserker", "parasite"],
    ],
    raceTeamOptions: [{
      factorial: { fadingTrails: true, solidTrails: false, scalingDamage: false, orbScale: 1 },
      quadratic: { fadingTrails: false, solidTrails: true, scalingDamage: true },
      godzilla: { fadingTrails: true, solidTrails: false, scalingDamage: true },
    }, {
      prime: { fadingTrails: true, solidTrails: true, scalingDamage: true },
      integral: { fadingTrails: false, solidTrails: false, scalingDamage: true },
      pi: { fadingTrails: true, solidTrails: false, scalingDamage: false },
      "speed-impact": { fadingTrails: false, solidTrails: true, scalingDamage: true },
      "black-hole": { fadingTrails: true, solidTrails: false, scalingDamage: true },
    }],
    raceLayerStrengths: [12, 34, 56],
    raceLayerCount: 5,
    raceOrbScale: 0.55,
    raceTrails: true,
    raceSolidTrails: true,
    raceScalingDamage: false,
    seed: 7412,
  }, classes);
  const url = settingsToUrl(settings, "https://example.test/play", classes);
  const restored = settingsFromUrl(url, classes);
  assert.equal(restored.gameplayMode, ORB_RACE_MODE);
  assert.deepEqual(restored.raceOrbs, settings.raceOrbs);
  assert.deepEqual(restored.raceTeams, settings.raceTeams, "both Orb Race teams should survive a settings URL round trip");
  assert.deepEqual(restored.raceTeamOptions, settings.raceTeamOptions, "each selected orb's trail and scaling options should survive a settings URL round trip");
  assert.deepEqual(restored.raceLayerStrengths, [12, 34, 56, 56, 56]);
  assert.equal(restored.raceLayerCount, 5);
  assert.equal(restored.social.format, "portrait");
  assert.equal(restored.raceOrbScale, 0.55, "race orb size should survive a shareable settings URL");
  assert.equal(restored.raceTeamOptions[0].factorial.orbScale, 1, "a per-orb size override should survive a settings URL");
  assert.equal(restored.raceTrails, true, "race trail toggle should survive a shareable settings URL");
  assert.equal(restored.raceSolidTrails, true, "solid race trail toggle should survive a shareable settings URL");
  assert.equal(restored.raceScalingDamage, false, "scaling damage toggle should survive a shareable settings URL");
  assert.deepEqual(ORB_RACER_IDS, [
    "duplicator", "speed", "orbital", "drill", "x-squared", "fibonacci", "sylvester", "lucas", "tetration", "professor", "trifecta", "gravitator", "grower", "lazer", "sticky", "unarmed", "slammy", "super-slammy", "piercer", "ying-yang", "poison", "hydrogen-bomb", "antimatter-bomb", "time-bomb", "reality-bomb", "tsar-bomb", "all-in-one", "breaker", "square-root", "progressive", "random",
    "lag", "twins", "scissor", "whirlwind", "rgb", "x-power", "super-x-power", "phi", "factorial", "prime", "integral", "quadratic", "pi", "flash", "batman", "boomerang", "magnet", "mines", "gravity", "jackpot", "speed-impact", "ricochet", "commander", "shrapnel", "roulette", "architect", "sawblade", "meteor", "black-hole", "godzilla",
    "centy", "infinity", "charger", "bouncer", "blue-sun", "purple-sun", "phase-three-sun", "phase-two-sun", "snake", "vampire", "cubed", "double", "tripler",
    "turret", "leech", "crusher", "berserker", "reactor", "parasite", "draftmaster",
    "needle", "multiplier", "sniper", "snowball", "countdown", "copycat", "critical", "100x", "grappler", "artists", "pancake", "tree", "rain", "hacker", "miner",
  ]);
  assert.deepEqual(
    ORB_RACE_ARTIST_PAINTINGS.map((painting) => painting.damage),
    [2, 5, 100, 1000],
    "Artists should keep four deterministic paintings after removing Solar",
  );
  assert.equal(ORB_RACE_ARTIST_PAINTINGS[2].name, "FAIRY", "Artists should use Fairy instead of the retired Solar painting");
  const newRaceSettings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["100x", "grappler", "artists", "pancake", "tree"], ["speed"]],
    raceTeamOptions: [{
      "100x": { orbScale: 1 },
      grappler: { orbScale: 0.55 },
      artists: { orbScale: 0.75, comboAbilities: ["speed"] },
      pancake: { orbScale: 1 },
      tree: { orbScale: 0.55 },
    }, {}],
  }, classes);
  const restoredNewRaceSettings = settingsFromUrl(
    settingsToUrl(newRaceSettings, "https://example.test/play", classes),
    classes,
  );
  assert.deepEqual(restoredNewRaceSettings.raceTeams, newRaceSettings.raceTeams);
  assert.equal(restoredNewRaceSettings.raceTeamOptions[0].grappler.orbScale, 0.55);
  assert.equal(restoredNewRaceSettings.raceTeamOptions[0].pancake.orbScale, 1);
  assert.equal(restoredNewRaceSettings.raceTeamOptions[0].tree.orbScale, 0.55);
  assert.deepEqual(restoredNewRaceSettings.raceTeamOptions[0].artists.comboAbilities, [], "Artists remains a base-only weapon orb");
  assert.deepEqual(raceAbilityIdsFor("artists", { comboAbilities: ["speed"] }), ["artists"]);
  assert.deepEqual(ORB_RACE_DEFAULT_LAYERS, [18, 48, 110]);
  assert.equal(ORB_RACE_DEFAULT_ORB_SCALE, 1, "Full size should be the default Orb Race size");
  assert.equal(normalizeSettings({}).raceOrbScale, 1, "default settings should select Full orb size");
  assert.equal(ORB_RACE_MAX_LAYER_STRENGTH, 1_000_000_000_000_000_000);
  assert.equal(ORB_RACE_MAX_MATH_DAMAGE, 1_000_000_000_000_000_000_000);
  assert.ok(ORB_RACE_MAX_MATH_DAMAGE > ORB_RACE_MAX_LAYER_STRENGTH);
  assert.deepEqual(normalizeRaceLayers([1000000000, 1000000001, 1]), [1000000000, 1000000001, 1]);
  assert.deepEqual(
    normalizeRaceLayers([1_000_000_000_000_000_000, 2_000_000_000_000_000_000, 1]),
    [1_000_000_000_000_000_000, 1_000_000_000_000_000_000, 1],
    "number walls should accept values through one quintillion and clamp above it",
  );
  assert.equal(normalizeRaceLayerCount(0), 1);
  assert.equal(normalizeRaceLayerCount(99), 50);
  assert.deepEqual(normalizeRaceLayers([4, 8], ORB_RACE_DEFAULT_LAYERS, 5), [4, 8, 8, 8, 8]);
  assert.equal(ORB_RACE_LONGFORM_DEFAULT_LAYERS.length, ORB_RACE_LONGFORM_DEFAULT_LAYER_COUNT);
  assert.equal(ORB_RACE_LONGFORM_DEFAULT_TARGET, 10_000);
  assert.deepEqual(ORB_RACE_LONGFORM_DEFAULT_LAYERS, [
    10, 25, 50, 100, 150, 250, 500, 1000, 1500, 2000, 3000, 5000, 10000,
  ], "the 10,000 preset should match the requested reference progression");
  for (const { value } of ORB_RACE_FINAL_LAYER_PRESETS) {
    const preset = buildRaceLayerPreset(17, value);
    assert.equal(preset.length, 17);
    assert.equal(preset[preset.length - 1], value);
    assert.ok(preset.every((layer, index) => index === 0 || layer >= preset[index - 1]));
  }
}

{
  const longform = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["fibonacci"], ["phi"]],
    raceLayerCount: 7,
    raceLayerStrengths: [100, 200, 300, 400, 500, 600, 700],
    social: { format: "race-landscape" },
  }, classes);
  const url = settingsToUrl(longform, "https://example.test/play", classes);
  const restored = settingsFromUrl(url, classes);
  assert.equal(restored.raceLayerCount, 7, "long-form race layer count should survive URL serialization");
  assert.deepEqual(restored.raceLayerStrengths, [100, 200, 300, 400, 500, 600, 700]);
  assert.equal(restored.social.format, "race-landscape");
  const customSimulation = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["fibonacci"], ["phi"]],
    raceLayerCount: 7,
    raceLayerStrengths: longform.raceLayerStrengths,
    seed: 1907,
  });
  assert.equal(customSimulation.raceLayerCount, 7);
  assert.equal(customSimulation.fighters[0].raceLayerHealth.length, 7);

  const quintillion = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["fibonacci"]],
    raceLayerCount: 2,
    raceLayerStrengths: [1_000_000_000, 1_000_000_000_000_000_000],
    social: { format: "race-landscape" },
  }, classes);
  const quintillionRestored = settingsFromUrl(
    settingsToUrl(quintillion, "https://example.test/play", classes),
    classes,
  );
  assert.deepEqual(
    quintillionRestored.raceLayerStrengths,
    [1_000_000_000, 1_000_000_000_000_000_000],
    "quintillion final-layer presets should survive URL serialization",
  );
}

{
  assert.deepEqual(normalizeRaceTeams([["batman", "batman", "flash"], ["fibonacci"]]), [
    ["batman", "flash"],
    ["fibonacci"],
  ]);
  const comboNames = {
    "speed+gravity": "SPEEDAVITY",
    "speed+fibonacci": "SPEEDYNACCI",
    "speed+lazer": "SPEEDLAZER",
    "speed+mines": "SPEEDPLODEY",
    "speed+grower": "SPEEDGROWER",
    "speed+sticky": "SPEEDSTICK",
    "gravity+fibonacci": "GRAVIBONACCI",
    "gravity+lazer": "GRAVILAZER",
    "gravity+mines": "GRAVPLODEY",
    "gravity+grower": "GRAVGROWER",
    "gravity+sticky": "GRAVISTICKY",
    "fibonacci+lazer": "FIBOLAZER",
    "fibonacci+mines": "FIBPLODEY",
    "fibonacci+grower": "FIBOGROWER",
    "fibonacci+sticky": "STICKONACCI",
    "lazer+mines": "LAZPLODEY",
    "lazer+grower": "LAZERGROWER",
    "lazer+sticky": "LAZERSTICK",
    "mines+grower": "GROWPLODEY",
    "mines+sticky": "STICKPLODEY",
    "grower+sticky": "GROWSTICKY",
    "speed+orbital": "SPEEDORBITAL",
    "gravity+orbital": "GRAVORBITAL",
    "fibonacci+orbital": "FIBORBITAL",
    "lazer+orbital": "LAZERORBITAL",
    "mines+orbital": "SPLODEYORBITAL",
    "grower+orbital": "GROWORBITAL",
    "sticky+orbital": "STICKORBITAL",
    "slammy+orbital": "SLAMORBITAL",
    "poison+orbital": "POISONORBITAL",
    "drill+orbital": "DRILLORBITAL",
    "orbital+tripler": "TRIPORBITAL",
    "speed+slammy": "SPEEDSLAMMY",
    "gravity+slammy": "GRAVSLAMMY",
    "fibonacci+slammy": "FIBSLAMMY",
    "lazer+slammy": "LAZSLAMMY",
    "mines+slammy": "SLAMPLODEY",
    "grower+slammy": "GROWSLAMMY",
    "sticky+slammy": "STICKSLAMMY",
    "speed+poison": "SPEEDPOISON",
    "gravity+poison": "GRAVPOISON",
    "fibonacci+poison": "POISONACCI",
    "lazer+poison": "LAZERPOISON",
    "mines+poison": "POISONPLODEY",
    "grower+poison": "GROWPOISON",
    "sticky+poison": "STICKPOISON",
    "slammy+poison": "SLAMPOISON",
    "speed+drill": "SPEEDDRILL",
    "gravity+drill": "GRAVDRILL",
    "fibonacci+drill": "FIBODRILL",
    "lazer+drill": "LAZERDRILL",
    "mines+drill": "DRILLPLODEY",
    "grower+drill": "GROWDRILL",
    "sticky+drill": "STICKDRILL",
    "slammy+drill": "SLAMDRILL",
    "poison+drill": "POISONDRILL",
  };
  Object.entries(comboNames).forEach(([pair, name]) => {
    assert.equal(raceComboTitleFor(pair.split("+"))?.name, name, `${pair} should use the requested combo name`);
  });
  assert.deepEqual(ORB_RACE_ORBITAL_COMBO_STEMS, {
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
  assert.equal(raceComboTitleFor(["mines", "fibonacci"])?.name, "FIBPLODEY");
  assert.equal(
    raceTeamDisplayName(["fibonacci"], { fibonacci: { count: 2, comboAbilities: ["mines"] } }),
    "2× FIBPLODEY",
  );
  assert.equal(raceTeamDisplayName(["batman", "flash"]), "BATMAN + FLASH");
  assert.equal(raceTeamDisplayName(["batman", "flash", "fibonacci"]), "SUPERHERO ORBS + FIBONACCI");
  assert.equal(raceTeamDisplayName(["hydrogen-bomb", "time-bomb"]), "BOMBS");
  assert.deepEqual(raceTeamDisplayParts(["hydrogen-bomb", "time-bomb"]).map(({ kind, id, label, orbIds, announcerCue }) => ({ kind, id, label, orbIds, announcerCue })), [{
    kind: "group",
    id: "bombs",
    label: "BOMBS",
    orbIds: ["hydrogen-bomb", "time-bomb"],
    announcerCue: "intro-race-group-bombs",
  }]);
  assert.equal(raceTeamDisplayName(["boomerang", "mines", "ricochet"]), "WEAPON ORBS");
  assert.equal(raceTeamDisplayName(["commander", "shrapnel", "architect"]), "WEAPON ORBS");
  assert.equal(raceTeamDisplayName(["meteor", "drill", "boomerang"]), "WEAPON ORBS");
  assert.equal(raceTeamDisplayName(["meteor", "drill", "black-hole"]), "WEAPON ORBS");
  assert.equal(raceTeamDisplayName(["godzilla", "meteor", "drill"]), "WEAPON ORBS");
  assert.equal(raceTeamDisplayName(["magnet", "gravity", "jackpot"]), "MOTION ORBS + JACKPOT");
  assert.equal(
    raceTeamDisplayName(["fibonacci", "phi", "batman", "flash"]),
    "MATH ORBS + SUPERHERO ORBS",
  );
  const everyoneTeam = ["batman", "fibonacci", "drill", "grower"];
  assert.equal(raceTeamDisplayName(everyoneTeam), ORB_RACE_EVERYONE_LABEL);
  assert.deepEqual(raceTeamDisplayParts(everyoneTeam), [{
    kind: "everyone",
    id: "everyone",
    label: ORB_RACE_EVERYONE_LABEL,
    orbIds: everyoneTeam,
    order: 0,
    announcerCue: "intro-race-everyone",
  }]);
  assert.deepEqual(
    raceTeamDisplayParts(["batman", "flash", "fibonacci"]).map(({ kind, id, orbIds }) => ({ kind, id, orbIds })),
    [
      { kind: "group", id: "superhero", orbIds: ["batman", "flash"] },
      { kind: "orb", id: "fibonacci", orbIds: ["fibonacci"] },
    ],
  );
  assert.deepEqual(normalizeRaceTeamOptions(null, [["batman"], ["grower"]]), [
    { batman: { fadingTrails: false, solidTrails: false, scalingDamage: true, count: 1, orbScale: 1, speedMode: "regular", buffed: false, comboAbilities: [] } },
    { grower: { fadingTrails: false, solidTrails: false, scalingDamage: true, count: 1, orbScale: 1, speedMode: "regular", buffed: false, comboAbilities: [] } },
  ]);
  const everyOrbDefaults = normalizeRaceTeamOptions(null, [ORB_RACER_IDS, ["speed"]]);
  assert.equal(Object.keys(everyOrbDefaults[0]).length, ORB_RACER_IDS.length, "every Orb Race orb should receive a speed option");
  assert.ok(
    Object.values(everyOrbDefaults[0]).every((option) => option.speedMode === "regular"),
    "every Orb Race speed toggle should default to regular",
  );
  assert.ok(
    Object.values(everyOrbDefaults[0]).every((option) => option.buffed === false),
    "every Orb Race buffed toggle should default to off",
  );
}

{
  assert.deepEqual(ORB_RACE_SPEED_MODE_IDS, ["regular", "slow", "very-strong-math-slow"]);
  assert.equal(normalizeRaceSpeedMode("very-strong-math-orb-slow"), "very-strong-math-slow");
  assert.equal(normalizeRaceSpeedMode("not-a-speed"), "regular");
  const settings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["fibonacci"], ["centy"]],
    raceTeamOptions: [{
      fibonacci: { speedMode: "very-strong-math-slow", buffed: true },
    }, {
      centy: { speedMode: "slow", buffed: true },
    }],
  }, classes);
  const restored = settingsFromUrl(settingsToUrl(settings, "https://example.test/play", classes), classes);
  assert.equal(restored.raceTeamOptions[0].fibonacci.speedMode, "very-strong-math-slow");
  assert.equal(restored.raceTeamOptions[0].fibonacci.buffed, true);
  assert.equal(restored.raceTeamOptions[1].centy.speedMode, "slow");
  assert.equal(restored.raceTeamOptions[1].centy.buffed, true);
  assert.equal(
    raceTeamDisplayName(restored.raceTeams[0], restored.raceTeamOptions[0]),
    "FIBONACCI (BUFFED)",
  );
  assert.equal(
    raceTeamDisplayName(restored.raceTeams[1], restored.raceTeamOptions[1]),
    "CENTY (BUFFED)",
  );
}

{
  const teams = [["mines"], ["sticky", "fibonacci"]];
  const options = normalizeRaceTeamOptions([{
    mines: { count: 5, comboAbilities: ["speed", "drill", "speed", "mines", "not-an-ability"] },
  }, {
    sticky: { count: 2, comboAbilities: ["fibonacci", "lazer"] },
    fibonacci: { count: 3, comboAbilities: ["speed"] },
  }], teams);
  assert.equal(options[0].mines.count, 5);
  assert.deepEqual(options[0].mines.comboAbilities, ["speed", "drill"]);
  assert.deepEqual(options[1].sticky.comboAbilities, ["fibonacci", "lazer"]);
  assert.equal(raceTeamMemberCount(teams, options), 10);
  assert.equal(normalizeRaceOrbCount(999), 50, "sandbox quantities should be safely capped");
  assert.deepEqual(normalizeRaceComboAbilities(["speed"], "batman"), [], "only eligible base orbs can borrow abilities");
  assert.deepEqual(normalizeRaceComboAbilities(["drill", "drill", "mines"], "speed"), ["drill", "mines"]);
  assert.deepEqual(raceAbilityIdsFor("mines", options[0].mines), ["mines", "speed", "drill"]);
  assert.deepEqual(raceAbilityIdsFor("sticky", options[1].sticky), ["sticky", "fibonacci", "lazer"]);

  const settings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: teams,
    raceTeamOptions: options,
  }, classes);
  const restored = settingsFromUrl(settingsToUrl(settings, "https://example.test/play", classes), classes);
  assert.deepEqual(restored.raceTeamOptions, settings.raceTeamOptions, "quantities and combo traits should survive URL round trips");
  assert.equal(
    raceTeamDisplayName(["speed"], { speed: { comboAbilities: ["drill"] } }),
    "SPEEDDRILL",
    "Drill combos should use their generated title",
  );
}

{
  const settings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["unarmed", "slammy"], ["ying-yang", "poison"]],
    raceTeamOptions: [{
      slammy: { comboAbilities: ["speed", "poison"] },
    }, {
      poison: { comboAbilities: ["slammy"] },
    }],
  }, classes);
  const restored = settingsFromUrl(settingsToUrl(settings, "https://example.test/play", classes), classes);
  assert.deepEqual(restored.raceTeams, settings.raceTeams, "new Orb Race IDs should survive team URL round trips");
  assert.deepEqual(restored.raceTeamOptions, settings.raceTeamOptions, "Slammy and Poison combo traits should survive URL round trips");
  assert.deepEqual(
    raceAbilityIdsFor("slammy", settings.raceTeamOptions[0].slammy),
    ["slammy", "speed", "poison"],
    "Slammy should expose the existing composable ability seam",
  );
  assert.deepEqual(
    raceAbilityIdsFor("poison", settings.raceTeamOptions[1].poison),
    ["poison", "slammy"],
    "Poison should expose the existing composable ability seam",
  );
  assert.deepEqual(normalizeRaceComboAbilities(["speed"], "unarmed"), [], "Unarmed should remain a base-only orb");

  const hydrogenSettings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["hydrogen-bomb"], ["speed"]],
  }, classes);
  const hydrogenRestored = settingsFromUrl(
    settingsToUrl(hydrogenSettings, "https://example.test/play", classes),
    classes,
  );
  assert.deepEqual(hydrogenRestored.raceTeams, [["hydrogen-bomb"], ["speed"]], "Hydrogen Bomb should survive team URL round trips");
}

{
  const settings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["needle", "multiplier", "sniper", "snowball"], ["countdown", "copycat", "critical"]],
    raceTeamOptions: [{
      needle: { fadingTrails: true, solidTrails: false, scalingDamage: true, count: 2 },
      sniper: { fadingTrails: false, solidTrails: true, scalingDamage: false },
    }, {
      critical: { fadingTrails: true, solidTrails: true, scalingDamage: true },
    }],
    raceLayerStrengths: [100, 1000, 10000],
    seed: 73107,
  }, classes);
  const restored = settingsFromUrl(settingsToUrl(settings, "https://example.test/play", classes), classes);
  assert.deepEqual(restored.raceTeams, settings.raceTeams, "all seven simple racers should survive team URL serialization");
  assert.deepEqual(restored.raceTeamOptions, settings.raceTeamOptions, "simple-racer counts, trails, and scaling toggles should round trip");
}

{
  const legacyValue = encodeURIComponent(JSON.stringify({
    v: 1,
    m: "m",
    n: 2,
    g: "r",
    k: ["speed", "fibonacci"],
    s: 55108,
  }));
  const restored = settingsFromUrl("https://example.test/play?cfg=" + legacyValue, classes);
  assert.deepEqual(restored.raceTeams, [["speed"], ["fibonacci"]], "legacy Orb Race URLs should retain their two selected base racers");
  assert.deepEqual(restored.raceTeamOptions, [
    { speed: { fadingTrails: false, solidTrails: false, scalingDamage: true, count: 1, orbScale: 1, speedMode: "regular", buffed: false, comboAbilities: [] } },
    { fibonacci: { fadingTrails: false, solidTrails: false, scalingDamage: true, count: 1, orbScale: 1, speedMode: "regular", buffed: false, comboAbilities: [] } },
  ], "legacy Orb Race URLs should default to one base-only fighter per team");
  const sim = createSimulation(restored);
  assert.deepEqual(sim.fighters.map((fighter) => [fighter.raceOrbId, fighter.raceCopyIndex, fighter.raceAbilityIds]), [
    ["speed", 0, ["speed"]],
    ["fibonacci", 0, ["fibonacci"]],
  ]);
}

{
  const settings = normalizeSettings(
    {
      mode: "tournament",
      count: 8,
      classes: ["volta", "venom", "aegis"],
      seed: 9912,
      theme: "arcane-library",
      hazardPreset: "portals",
      tournament: { size: 16, roster: ["volta", "venom"], watch: false },
      balance: { global: { damage: 1.2 }, classes: { volta: { reach: 1.1 } } },
    },
    classes,
  );
  const restored = decodeSettings(encodeSettings(settings, classes), classes);
  assert.deepEqual(restored, settings, "shareable config should survive compact URL encoding");
}

{
  assert.deepEqual(ORB_ROSTER, CLASSIC_ORB_IDS);
  assert.deepEqual(classes, ORB_ROSTER, "the visible Classic roster should contain only the requested registry orbs");
  assert.equal(Object.keys(ORB_PROFILES).length, classes.length);
  assert.equal(validateProfileMetadata(), true, "every class profile should contain complete, rated metadata");
  for (const type of ORB_ROSTER) {
    assert.equal(ORB_PROFILES[type].title.toUpperCase(), CLASS_DEFS[type].name);
    if (ORB_SPRITE_PROFILES[type]) {
      assert.ok(ORB_SPRITE_PROFILES[type].src.endsWith(`/final/${type}.png`));
      assert.ok(existsSync(new URL(`../${ORB_SPRITE_PROFILES[type].src.slice(2)}`, import.meta.url)));
    }
  }
}

{
  const first = createSimulation({ count: 6, classes: ["vampire", "turret"], seed: 61713 });
  const repeat = createSimulation({ count: 6, classes: ["vampire", "turret"], seed: 61713 });
  run(first, 4);
  run(repeat, 4);
  assert.deepEqual(
    first.fighters.map((fighter) => [fighter.type, fighter.health, fighter.x, fighter.y, fighter.weaponAngle]),
    repeat.fighters.map((fighter) => [fighter.type, fighter.health, fighter.x, fighter.y, fighter.weaponAngle]),
    "the weapon roster must keep seeded simulation repeatability",
  );
}

{
  const base = {
    count: 4,
    classes: ["fire", "ice", "wizard", "time"],
    seed: 8181,
    hazardPreset: "mixed",
  };
  const outcomes = THEME_IDS.map((theme) => {
    const sim = createSimulation({ ...base, theme });
    run(sim, 8);
    return sim.fighters.map((fighter) => [
      fighter.health,
      fighter.x,
      fighter.y,
      fighter.vx,
      fighter.vy,
      fighter.weaponAngle,
    ]);
  });
  outcomes.slice(1).forEach((outcome) => {
    assert.deepEqual(outcome, outcomes[0], "cosmetic arena themes must not affect deterministic simulation");
  });
}

{
  const malformed = normalizeSettings({ theme: "damage-boost-laboratory" }, classes);
  assert.equal(malformed.theme, "cream-foundry", "unknown theme IDs should fall back safely");
}

{
  const clean = sanitizeBalance({
    global: { damage: 99, orbSpeed: 0.1, reach: -4, manaGain: "bad", pickupSpawnRate: 99, projectileSpeed: 99, pickupDamage: 99 },
    classes: { sword: { statusDuration: 1.5, pickupSpawnRate: 3, projectileSpeed: 3, pickupDamage: 3 }, invalid: { damage: Infinity } },
  });
  assert.equal(clean.global.damage, 3);
  assert.equal(clean.global.orbSpeed, 0.25);
  assert.equal(clean.global.reach, 0.5);
  assert.equal(clean.global.manaGain, 1);
  assert.equal(clean.global.pickupSpawnRate, 4);
  assert.equal(clean.global.projectileSpeed, 4);
  assert.equal(clean.global.pickupDamage, 4);
  assert.equal(clean.classes.sword.statusDuration, 1.5);
  assert.equal(clean.classes.sword.pickupSpawnRate, undefined, "pickup spawn rate should remain global-only");
  assert.equal(clean.classes.sword.projectileSpeed, undefined, "projectile speed should remain global-only");
  assert.equal(clean.classes.sword.pickupDamage, undefined, "pickup damage should remain global-only");
  assert.equal(clean.classes.fire, undefined, "removed legacy class overrides should be discarded");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["sword", "duplicator"],
    seed: 81,
    balance: { global: { damage: 1.5, orbSpeed: 1.4, reach: 1.2, rotationSpeed: 0.5, hitCooldown: 2 } },
  });
  assert.equal(sim.fighters[0].weapon.damage, CLASS_DEFS.sword.weapon.damage * 1.5);
  assert.equal(sim.fighters[0].weapon.length, CLASS_DEFS.sword.weapon.length * WEAPON_REACH_SCALE * 1.2);
  assert.equal(sim.fighters[0].weapon.width, CLASS_DEFS.sword.weapon.width * WEAPON_SIZE_SCALE);
  assert.equal(sim.fighters[0].weapon.angularSpeed, CLASS_DEFS.sword.weapon.angularSpeed * WEAPON_ROTATION_SCALE * 0.5);
  assert.equal(sim.fighters[0].weapon.hitCooldown, CLASS_DEFS.sword.weapon.hitCooldown * 2);
  assert.equal(sim.fighters[0].baselineSpeed, ORB_BASE_SPEED * 1.4 * 0.75);
}

{
  const fullRoster = classes;
  const first = selectFighterClasses(fullRoster, 4, 2406);
  const repeat = selectFighterClasses(fullRoster, 4, 2406);
  assert.deepEqual(first, repeat, "the same match seed should reproduce the same random roster");
  assert.equal(first.length, 4);
  assert.equal(new Set(first).size, 4, "an oversized unique roster should choose four unique classes");
  assert.notDeepEqual(first, fullRoster.slice(0, 4), "selection should not always take the first four classes");

  const draws = new Set(
    Array.from({ length: 24 }, (_, index) =>
      selectFighterClasses(fullRoster, 4, 2406 + index).slice().sort().join(",")),
  );
  assert.ok(draws.size > 8, "different seeds should produce varied four-class draws");
  assert.deepEqual(
    selectFighterClasses(["venom", "gravis", "ice", "fire"], 4, 99),
    ["venom", "gravis", "ice", "fire"],
    "a roster that already matches the fighter count should remain unchanged",
  );

  const sim = createSimulation({ count: 4, classes: fullRoster, seed: 2406 });
  assert.equal(sim.fighters.length, 2, "Classic should ignore larger fighter counts");
  assert.deepEqual(sim.fighters.map((fighter) => fighter.type), fullRoster.slice(0, 2));
  assert.deepEqual(sim.selectedClasses, fullRoster.slice(0, 2));
}

{
  for (const type of ["sword", "vampire", "turret", "reactor", "sniper", "commander"]) {
    assert.ok(classes.includes(type), `${type} should be part of the selectable class roster`);
  }
  const settings = normalizeSettings({ classes: ["jackpot", "boxer"], seed: 77 }, classes);
  const restored = decodeSettings(encodeSettings(settings, classes), classes);
  assert.deepEqual(restored.classes, settings.classes, "new classes should survive shared URL encoding");
  assert.deepEqual(
    normalizeSettings({ classes: ["crossbow", "scythe", "staff"], seed: 77 }, classes).classes,
    CLASSIC_DEFAULT_CLASSES,
    "removed Classic IDs should fall back to the registry-owned safe matchup",
  );
}

{
  const a = createTournament({ size: 16, roster: ["fire", "volta", "venom"], seed: 44 });
  const b = createTournament({ size: 16, roster: ["fire", "volta", "venom"], seed: 44 });
  assert.deepEqual(a, b, "same tournament seed should create the same bracket");
  assert.equal(a.bracketSeed, deriveBracketSeed(44));
  while (!a.completed) {
    const match = currentTournamentMatch(a);
    assert.equal(tournamentMatchEntrants(a, match).length, 2);
    recordTournamentResult(a, match.seed % 2, { duration: 12 }, { weaponHits: 2 });
  }
  assert.ok(a.championId);
  assert.equal(a.totals.matches, 15);
}

{
  assert.equal(deriveTournamentBatchSeed(2406, 7), deriveTournamentBatchSeed(2406, 7));
  assert.notEqual(deriveTournamentBatchSeed(2406, 7), deriveTournamentBatchSeed(2406, 8));
  const report = createTournamentBatchReport({
    requested: 3,
    size: 8,
    seed: 2406,
    roster: classes,
  });
  for (let tournamentIndex = 0; tournamentIndex < 3; tournamentIndex += 1) {
    const tournament = createTournament({
      size: 8,
      roster: classes,
      seed: deriveTournamentBatchSeed(2406, tournamentIndex),
    });
    while (!tournament.completed) {
      const entrants = tournamentMatchEntrants(tournament);
      const swordIndex = entrants.findIndex((entrant) => entrant.type === "sword");
      recordTournamentResult(tournament, swordIndex >= 0 ? swordIndex : 0, { duration: 10 });
    }
    recordTournamentInBatch(report, tournament);
  }
  const finalReport = finalizeTournamentBatchReport(report);
  assert.equal(finalReport.completed, 3);
  assert.equal(finalReport.totalMatches, 21);
  assert.equal(finalReport.strongestType, "sword");
  assert.equal(finalReport.rankings.find((entry) => entry.type === "sword").championships, 3);
  assert.equal(finalReport.rankings.reduce((sum, entry) => sum + entry.entries, 0), 24);
}

{
  const legacyRoster = ["fire", "ice", "wizard", "time", "volta", "venom", "gravis", "aegis"];
  const opponents = new Set();
  const brackets = new Set();
  for (let tournamentIndex = 0; tournamentIndex < 256; tournamentIndex += 1) {
    const tournament = createTournament({
      size: 8,
      roster: legacyRoster,
      seed: deriveTournamentBatchSeed(2406, tournamentIndex),
    });
    const firstRound = tournament.rounds[0].matches.map((match) =>
      match.entrants.map((id) => tournament.entrants.find((entrant) => entrant.id === id).type));
    const venomMatch = firstRound.find((match) => match.includes("venom"));
    opponents.add(venomMatch.find((type) => type !== "venom"));
    brackets.add(firstRound.map((match) => match.slice().sort().join("-")).sort().join("|"));
  }
  assert.deepEqual(
    [...opponents].sort(),
    legacyRoster.filter((type) => type !== "venom").sort(),
    "batch brackets should let Venom face every other class",
  );
  assert.ok(brackets.size > 70, "batch tournaments should generate many distinct first-round brackets");
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 18, hazardPreset: "bumpers" });
  const fighter = sim.fighters[0];
  const bumper = sim.hazards[0];
  fighter.x = bumper.x - bumper.radius - fighter.radius + 1;
  fighter.y = bumper.y;
  fighter.vx = fighter.baselineSpeed;
  fighter.vy = 0;
  sim.fighters[1].x = 850;
  sim.fighters[1].y = 480;
  sim.fighters[0].weaponLastHit[sim.fighters[1].id] = 999;
  sim.fighters[1].weaponLastHit[sim.fighters[0].id] = 999;
  stepSimulation(sim, dt);
  assert.equal(fighter.health, 100, "bumpers must never deal damage");
  assert.ok(fighter.vx < 0, "bumper should redirect velocity");
  assert.equal(fighter.analytics.hazardInteractions.bumpers, 1);
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 19, hazardPreset: "portals" });
  const fighter = sim.fighters[0];
  const [entry, exit] = sim.hazards;
  fighter.x = entry.x;
  fighter.y = entry.y;
  fighter.vx = fighter.baselineSpeed;
  fighter.vy = 0;
  const speedBefore = Math.hypot(fighter.vx, fighter.vy);
  stepSimulation(sim, dt);
  assert.ok(fighter.x > exit.x, "portal should place the fighter beyond the paired exit");
  assert.ok(Math.abs(Math.hypot(fighter.vx, fighter.vy) - speedBefore) < 8, "portal should preserve speed within one gravity step");
  assert.equal(fighter.health, 100);
}

{
  const sim = createSimulation({ count: 3, classes: ["volta", "fire", "ice"], seed: 20 });
  const [volta, primary, bystander] = sim.fighters;
  bystander.x = 850;
  bystander.y = 480;
  bystander.weaponLastHit[volta.id] = 999;
  for (let hit = 0; hit < 3; hit += 1) {
    arrangeHit(volta, primary);
    volta.weaponLastHit[primary.id] = -Infinity;
    stepSimulation(sim, dt);
  }
  assert.equal(volta.analytics.boltsFired, 1);
  assert.equal(volta.analytics.boltHits, 1, "a nearby target may be hit immediately after charge release");
  assert.equal(volta.analytics.boltDamage, 8, "the bolt should use Volta's ramped ability damage on release");
  assert.ok(primary.stunUntil - sim.time > 1.9);
  assert.equal(sim.effects.find((effect) => effect.kind === "volta-bolt-hit")?.impactKind, "regular");
}

{
  const sim = createSimulation({ count: 2, classes: ["volta", "fire"], seed: 201 });
  const [volta, target] = sim.fighters;
  target.x = 500;
  target.y = 450;
  volta.weaponLastHit[target.id] = 999;
  target.weaponLastHit[volta.id] = 999;
  sim.projectiles.push({
    id: "test-bolt",
    kind: "volta-bolt",
    ownerId: volta.id,
    x: ARENA.width - ARENA.padding - 8,
    y: 180,
    vx: 420,
    vy: 0,
    radius: 7,
    life: 3.5,
    bounced: false,
    trail: [],
  });
  const bolt = sim.projectiles[0];
  stepSimulation(sim, dt);
  assert.equal(bolt.bounced, true, "bolt should bounce once from an arena wall");
  assert.ok(bolt.vx < 0);
  assert.equal(volta.analytics.boltBounces, 1);
  bolt.x = ARENA.padding + bolt.radius + 1;
  bolt.vx = -420;
  stepSimulation(sim, dt);
  assert.equal(sim.projectiles.length, 0, "bolt should expire when it reaches a second wall");
}

{
  const sim = createSimulation({ count: 2, classes: ["venom", "fire"], seed: 21 });
  const [venom, target] = sim.fighters;
  assert.equal(venom.weapon.length, 68 * WEAPON_REACH_SCALE);
  assert.equal(venom.statusDuration, 3);
  for (let hit = 0; hit < 4; hit += 1) {
    arrangeHit(venom, target);
    venom.weaponLastHit[target.id] = -Infinity;
    stepSimulation(sim, dt);
  }
  assert.equal(target.poisonStacks, 3, "poison should cap at three stacks");
  assert.ok(target.poisonUntil - sim.time > 2.9 && target.poisonUntil - sim.time <= 3);
  const health = target.health;
  venom.weaponLastHit[target.id] = 999;
  venom.x = 80;
  target.x = 850;
  run(sim, 1.1);
  assert.ok(target.health < health, "poison stacks should tick after weapon application");
}

{
  const sim = createSimulation({ count: 2, classes: ["gravis", "fire"], seed: 22 });
  const [gravis, target] = sim.fighters;
  assert.equal(gravis.weapon.length, 62 * WEAPON_REACH_SCALE);
  assert.equal(gravis.weapon.angularSpeed, 2.15 * WEAPON_ROTATION_SCALE);
  assert.equal(gravis.weapon.hitCooldown, 0.54);
  assert.equal(gravis.cooldown, 45);
  gravis.x = 350;
  gravis.y = 280;
  gravis.vx = 0;
  gravis.vy = 0;
  gravis.baselineSpeed = 0;
  gravis.weaponAngle = 0;
  gravis.cooldown = 0;
  target.x = 700;
  target.y = 280;
  target.vx = 0;
  target.vy = 0;
  target.baselineSpeed = 0;
  target.weaponLastHit[gravis.id] = 999;
  const health = target.health;
  stepSimulation(sim, dt);
  assert.equal(target.gravitySourceId, gravis.id);
  assert.ok(target.stunUntil - sim.time > 4.9, "gravity lock should freeze its target for five seconds");
  assert.ok(
    Math.abs(Math.hypot(target.x - gravis.x, target.y - gravis.y) - (gravis.radius + target.radius + 10)) < 1,
  );
  assert.ok(target.health < health, "Gravis should be able to damage the pulled target immediately");
  assert.equal(gravis.cooldown, 45);
  assert.equal(gravis.analytics.gravityLocks, 1);
  assert.ok(gravis.analytics.gravityPullTime > 4.9);
}

{
  const sim = createSimulation({ count: 2, classes: ["aegis", "fire"], seed: 23 });
  const [aegis, target] = sim.fighters;
  assert.equal(aegis.weapon.damage, 0, "Aegon should not carry a damaging orbit weapon");
  aegis.x = 350;
  aegis.y = 280;
  target.x = aegis.x + aegis.radius + target.radius - 1;
  target.y = 280;
  aegis.vx = 0;
  aegis.vy = 0;
  target.vx = 0;
  target.vy = 0;
  aegis.baselineSpeed = 0;
  target.baselineSpeed = 0;
  target.weaponLastHit[aegis.id] = 999;
  stepSimulation(sim, dt);
  assert.equal(target.health, target.maxHealth - CLASS_DEFS.aegis.collision.damage);
  assert.equal(aegis.analytics.collisionHits, 1);
  assert.equal(aegis.analytics.collisionDamage, CLASS_DEFS.aegis.collision.damage);
  assert.equal(sim.events.filter((event) => event.type === "collision-hit").length, 1);

  const healthAfterFirstRam = target.health;
  target.x = aegis.x + aegis.radius + target.radius - 1;
  stepSimulation(sim, dt);
  assert.equal(target.health, healthAfterFirstRam, "collision cooldown should prevent repeated overlap damage");
}

{
  const sim = createSimulation({ count: 2, classes: ["aegis", "fire"], seed: 231 });
  const [aegis, attacker] = sim.fighters;
  assert.equal(aegis.cooldown, 20, "Aegis should require a full twenty-second charge");
  assert.equal(getWeaponSegment(aegis, sim.time).damage, 0);
  aegis.x = 150;
  aegis.y = 120;
  attacker.x = 800;
  attacker.y = 440;
  aegis.weaponLastHit[attacker.id] = 999;
  attacker.weaponLastHit[aegis.id] = 999;
  aegis.cooldown = 0;
  stepSimulation(sim, dt);
  assert.ok(aegis.aegisRushUntil - sim.time > 4.9);
  assert.ok(aegis.invulnerableUntil - sim.time > 4.9);
  assert.equal(aegis.analytics.aegisRushes, 1);

  attacker.x = aegis.x + aegis.radius + attacker.radius - 1;
  attacker.y = aegis.y;
  const healthBeforeRushRam = attacker.health;
  stepSimulation(sim, dt);
  assert.equal(attacker.health, healthBeforeRushRam - CLASS_DEFS.aegis.collision.damage * 2);

  attacker.x = 350;
  attacker.y = 280;
  attacker.vx = 0;
  attacker.vy = 0;
  attacker.baselineSpeed = 0;
  attacker.weaponAngle = 0;
  aegis.x = 480;
  aegis.y = 280;
  aegis.vx = 0;
  aegis.vy = 0;
  aegis.baselineSpeed = 0;
  attacker.weaponLastHit[aegis.id] = -Infinity;
  const healthBefore = aegis.health;
  stepSimulation(sim, dt);
  assert.equal(aegis.health, healthBefore, "Berserker Rush should prevent incoming damage");
  assert.equal(aegis.burnTicksRemaining, 0, "invulnerability should prevent weapon status application");
  assert.ok(aegis.analytics.invulnerableDamageBlocked > 0);
}

{
  const sim = createSimulation({ count: 5, classes: ["wizard", "fire", "ice", "venom", "gravis"], seed: 232 });
  const [wizard, ...targets] = sim.fighters;
  wizard.x = 480;
  wizard.y = 280;
  wizard.mana = 100;
  const positions = [[610, 280], [350, 280], [480, 150], [480, 410]];
  targets.forEach((target, index) => {
    [target.x, target.y] = positions[index];
    target.weapon.damage = 0;
    target.weaponLastHit[wizard.id] = 999;
    wizard.weaponLastHit[target.id] = 999;
  });
  stepSimulation(sim, dt);
  assert.deepEqual(targets.map((target) => target.health), [92, 91, 90, 89], "each burst hit should use Hex's current ability damage, then ramp it");
  assert.equal(wizard.analytics.arcaneBurstTargets, 4);
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 24, features: { replay: true } });
  run(sim, 14);
  assert.ok(sim.replayFrames.length <= 202, "replay buffer should remain bounded to roughly ten seconds");
  assert.ok(sim.replayFrames.length > 20);
  const last = sim.replayFrames.at(-1);
  assert.ok(last.fighters.every((fighter) => fighter.weapon && Array.isArray(fighter.trail)));
  if (sim.finished) assert.equal(last.finished, true, "the final knockout state must be captured");
}

{
  const sim = createSimulation({ count: 2, classes: ["volta", "fire"], seed: 241 });
  sim.projectiles.push({
    id: "replay-bolt",
    kind: "volta-bolt",
    ownerId: sim.fighters[0].id,
    x: 300,
    y: 200,
    vx: 420,
    vy: 0,
    radius: 7,
    life: 2,
    bounced: true,
    trail: [{ x: 294, y: 200, life: 0.15 }],
  });
  const frame = captureReplayFrame(sim);
  sim.projectiles[0].x = 900;
  assert.equal(frame.projectiles[0].x, 300, "replay should retain recorded projectile state");
  assert.equal(frame.projectiles[0].bounced, true);
  assert.equal(frame.projectiles[0].trail.length, 1);
}

{
  const sim = createSimulation({ count: 2, classes: ["forge", "fire"], seed: 242 });
  const [forge, cinder] = sim.fighters;
  const drop = { id: "test-heat", kind: "heat-drop", x: cinder.x, y: cinder.y, radius: 12, value: 28, until: sim.time + 10 };
  sim.heatDrops.push(drop);
  stepSimulation(sim, dt);
  assert.equal(cinder.type, "fire");
  assert.equal(forge.forgeHeat, 0, "non-Forge fighters should not collect heat drops");
  assert.equal(sim.heatDrops.length, 1);
  forge.x = drop.x;
  forge.y = drop.y;
  stepSimulation(sim, dt);
  assert.equal(forge.forgeHeat, 28, "Forge should collect arena heat");
  assert.equal(forge.analytics.heatDropsCollected, 1);
  forge.forgeHeat = 99;
  sim.heatDrops.push({ id: "test-heat-2", kind: "heat-drop", x: forge.x, y: forge.y, radius: 12, value: 28, until: sim.time + 10 });
  stepSimulation(sim, dt);
  assert.equal(forge.forgeHeat, 0, "full heat should be spent when the weapon tempers");
  assert.ok(forge.weaponBoostUntil > sim.time);
  assert.equal(forge.analytics.forgeTempers, 1);
}

{
  const sim = createSimulation({ count: 2, classes: ["static", "fire"], seed: 243 });
  const [staticOrb] = sim.fighters;
  staticOrb.x = ARENA.padding + staticOrb.radius - 3;
  staticOrb.y = 300;
  staticOrb.vx = -staticOrb.baselineSpeed;
  staticOrb.vy = 0;
  stepSimulation(sim, dt);
  assert.ok(staticOrb.staticCharge >= 24, "Static should gain charge from wall bounces");
  staticOrb.staticCharge = 100;
  const target = sim.fighters[1];
  arrangeHit(staticOrb, target);
  staticOrb.weaponLastHit[target.id] = -Infinity;
  const health = target.health;
  stepSimulation(sim, dt);
  assert.equal(staticOrb.staticCharge, 0);
  assert.ok(target.health < health, "charged Static hit should add zap damage");
  assert.ok(target.stunUntil > sim.time);
  assert.equal(staticOrb.analytics.staticZaps, 1);
}

{
  const sim = createSimulation({ count: 2, classes: ["echo", "fire"], seed: 244 });
  const [echo, target] = sim.fighters;
  arrangeHit(echo, target);
  echo.weaponLastHit[target.id] = -Infinity;
  stepSimulation(sim, dt);
  const healthAfterHit = target.health;
  assert.equal(sim.echoQueue.length, 1, "Echo should queue a delayed replay after a successful hit");
  run(sim, 0.9);
  assert.ok(target.health < healthAfterHit, "Echo replay should deal delayed reduced damage");
  assert.equal(echo.analytics.echoReplays, 1);
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "mirage"], seed: 245 });
  const [attacker, mirage] = sim.fighters;
  mirage.cooldown = 0;
  stepSimulation(sim, dt);
  assert.ok(sim.decoys.length >= 1, "Mirage should create a short-lived decoy");
  arrangeHit(attacker, mirage);
  attacker.weaponLastHit[mirage.id] = -Infinity;
  mirage.mirageDecoyChance = 1;
  const health = mirage.health;
  stepSimulation(sim, dt);
  assert.equal(mirage.health, health, "Mirage decoy should absorb a weapon hit without direct damage");
  assert.equal(mirage.analytics.decoyHits, 1);
}

{
  const sim = createSimulation({ count: 2, classes: ["shade", "fire"], seed: 246 });
  const [shade, target] = sim.fighters;
  shade.x = 350;
  shade.y = 280;
  shade.vx = shade.baselineSpeed;
  shade.vy = 0;
  target.x = 350 + shade.radius + target.radius - 4;
  target.y = 280;
  target.vx = -target.baselineSpeed;
  target.vy = 0;
  shade.collisionLastHit[target.id] = -Infinity;
  const health = target.health;
  stepSimulation(sim, dt);
  assert.ok(target.health < health, "Shade should damage opponents by direct collision");
  assert.ok(shade.shadePhaseUntil > sim.time, "Shade should phase after landing a dash collision");
  assert.equal(shade.analytics.collisionHits, 1);
  assert.equal(shade.analytics.shadePhases, 1);
  assert.ok(sim.events.some((event) => event.type === "collision-hit" && event.fighterType === "shade"));
}

{
  const settings = normalizeSettings(
    { count: 2, classes: ["fire", "ice"], seed: 672, hazardPreset: "none" },
    classes,
  );
  const restored = decodeSettings(encodeSettings(settings, classes), classes);
  const a = createSimulation(settings);
  const b = createSimulation(restored);
  run(a, 160);
  run(b, 160);
  assert.equal(a.winner?.type, b.winner?.type);
  assert.deepEqual(
    a.fighters.map((fighter) => [fighter.health, fighter.damageDone]),
    b.fighters.map((fighter) => [fighter.health, fighter.damageDone]),
    "copied URL settings should reproduce the deterministic result",
  );
}

{
  const settings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceLayerCount: 8,
    raceLayerStrengths: [10, 25, 50, 100, 250, 500, 1000, 10000],
    raceShowTargetMessage: false,
    raceTargetAnnouncement: false,
    raceMatchupAnnouncement: false,
    raceTiltedLayerEnabled: true,
    raceTiltedLayerIndex: 5,
  }, classes);
  const restored = decodeSettings(encodeSettings(settings, classes), classes);
  assert.equal(restored.raceShowTargetMessage, false);
  assert.equal(restored.raceTargetAnnouncement, false);
  assert.equal(restored.raceMatchupAnnouncement, false);
  assert.equal(restored.raceTiltedLayerEnabled, true);
  assert.equal(restored.raceTiltedLayerIndex, 5);
}

{
  const settings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["centy", "infinity", "charger", "bouncer", "blue-sun", "tripler"], ["snake", "vampire", "cubed", "double", "fibonacci", "orbital"]],
    raceTeamOptions: [{
      tripler: { comboAbilities: ["orbital", "fibonacci"], count: 2 },
    }, {
      fibonacci: { comboAbilities: ["tripler", "orbital"] },
    }],
    raceLayerStrengths: [100, 1000, 10000],
  }, classes);
  const restored = settingsFromUrl(settingsToUrl(settings, "https://example.test/play", classes), classes);
  assert.deepEqual(restored.raceTeams, settings.raceTeams);
  assert.deepEqual(restored.raceTeamOptions, settings.raceTeamOptions);
  assert.deepEqual(normalizeRaceComboAbilities(["orbital", "fibonacci"], "tripler"), ["orbital", "fibonacci"]);
  assert.deepEqual(normalizeRaceComboAbilities(["tripler", "orbital"], "fibonacci"), ["tripler", "orbital"]);
  assert.equal(raceComboTitleFor(["fibonacci", "tripler"])?.name, "FIBOTRIPLER");
  assert.equal(raceComboTitleFor(["orbital", "tripler"])?.name, "TRIPORBITAL");
  assert.equal(raceComboTitleFor(["orbital", "speed"])?.name, "SPEEDORBITAL");
}

{
  const settings = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["commander", "shrapnel", "architect"], ["roulette", "ricochet"]],
    raceLayerStrengths: [10, 100, 1000],
    seed: 88424,
  }, classes);
  const restored = settingsFromUrl(settingsToUrl(settings, "https://example.test/play", classes), classes);
  assert.deepEqual(restored.raceTeams, settings.raceTeams, "the tactical Orb Race roster should survive URL serialization");
}

console.log("feature tests passed");
