import assert from "node:assert/strict";
import {
  ARENA,
  CLASS_DEFS,
  ORB_BASE_SPEED,
  ORB_CROWD_SPEED,
  ORB_CROWD_RADIUS,
  ORB_RADIUS,
  WEAPON_REACH_SCALE,
  WEAPON_ROTATION_SCALE,
  WEAPON_SIZE_SCALE,
  applyHillCollisionResistance,
  buildMatchAnalytics,
  calculateRaceTeamDamagePerSecond,
  captureReplayFrame,
  composedRaceDamage,
  createSimulation,
  getRaceLaserRay,
  raceLaserImpactRingCount,
  getWeaponSegment,
  raceUsesProjectileOnlyBodyDamage,
  raceCheckerStartY,
  RACE_BREAKER_INITIAL_CRIT_CHANCE,
  RACE_BREAKER_CRIT_MAX_HEALTH_FRACTION,
  RACE_PROGRESSIVE_INTERVAL_SECONDS,
  RACE_PROGRESSIVE_POST_SECOND_INTERVAL_SECONDS,
  RACE_ANTIMATTER_POST_SECOND_COOLDOWN_SECONDS,
  RACE_TSAR_BOMB_COUNTDOWN_SECONDS,
  RACE_TSAR_BOMB_REACTOR_INTERVAL_SECONDS,
  RACE_ALL_IN_ONE_ACTIVE_SECONDS,
  RACE_ALL_IN_ONE_ACTIVATION_INTERVAL_SECONDS,
  RACE_ALL_IN_ONE_BOUNCE_MULTIPLIER,
  RACE_ALL_IN_ONE_HYDROGEN_COUNTDOWN_SECONDS,
  RACE_RAIN_COOLDOWN_SECONDS,
  RACE_RAIN_DURATION_SECONDS,
  RACE_RAIN_DROP_COUNT,
  RACE_RAIN_DROP_DAMAGE,
  RACE_MINER_UPGRADE_SECONDS,
  RACE_MINER_DRILL_SECONDS,
  raceCommanderDronePosition,
  raceLayerLineY,
  raceDraftmasterBulletSpawnPoint,
  RACE_LASER_INITIAL_DAMAGE_INTERVAL_SECONDS,
  RACE_LASER_INTERVAL_LEVEL_STEP,
  RACE_LASER_REVOLUTION_SECONDS,
  raceLaserIntervalForLevel,
  raceLaserIntervalLevelFor,
  raceTiltedLayerSurfaceY,
  raceTiltedLayerSurfaceNormal,
  raceOrbitalOrbPosition,
  raceWhirlwindOrbPosition,
  RACE_LAYER_HEIGHT,
  RACE_ORB_RADIUS,
  RACE_ORBITAL_ORBS_PER_RING,
  RACE_ORBITAL_SATELLITE_RADIUS_SCALE,
  sylvesterRaceValue,
  lucasRaceValue,
  tetrationRaceValue,
  squareRootDamageForLayerHealth,
  resolveRaceBounce,
  stepOrbRace,
  stepSimulation,
  updateKingOfHill,
} from "../src/simulation.js";
import { KING_OF_HILL_MODE } from "../src/king-of-hill.js";
import {
  ORB_RACE_ALL_IN_ONE_ABILITY_IDS,
  ORB_RACE_MAX_MATH_DAMAGE,
  ORB_RACE_MODE,
  ORB_RACE_PRESENTATION,
  raceHasAbility,
} from "../src/orb-race.js";
import { WORLD_CUP_MODE } from "../src/world-cup.js";

function run(sim, seconds, dt = 1 / 120) {
  for (let i = 0; i < seconds / dt && !sim.finished; i += 1) stepSimulation(sim, dt);
}

{
  assert.equal(RACE_LASER_INITIAL_DAMAGE_INTERVAL_SECONDS, 0.1, "Lazer starts with a 0.1-second damage interval");
  assert.equal(RACE_LASER_INTERVAL_LEVEL_STEP, 0.001, "Lazer removes 0.001 seconds per bounce");
  assert.equal(RACE_LASER_REVOLUTION_SECONDS, 8, "Lazer completes one smooth orbit every eight seconds");
  assert.equal(raceLaserIntervalForLevel(1), 0.1, "Lazer interval level one should begin at 0.1 seconds");
  assert.equal(raceLaserIntervalForLevel(2), 0.099, "Lazer interval level two should remove one thousandth of a second");
  assert.equal(raceLaserImpactRingCount(0.1), 2, "Lazer starts with two impact rings");
  assert.equal(raceLaserImpactRingCount(0.099), 3, "Lazer gains an impact ring when its interval drops by one level");
  assert.equal(raceLaserImpactRingCount(0.094), 8, "Lazer impact rings cap at eight as the interval accelerates");
  assert.ok(
    raceLaserImpactRingCount(0.097) >= raceLaserImpactRingCount(0.099),
    "Lazer impact ring count should never decrease as the interval falls",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["super-x-power"], ["duplicator"]],
    raceTeamOptions: [{ "super-x-power": { caged: true, cageDuration: 1 } }, {}],
    seed: 81212,
  });
  const caged = sim.fighters.find((fighter) => fighter.raceOrbId === "super-x-power");
  assert.ok(caged?.raceCageActive, "the selected Super X^X^X racer should start caged");
  const initialY = caged.raceY;
  const initialLayerHealth = [...caged.raceLayerHealth];
  stepSimulation(sim, 0.5);
  assert.equal(caged.raceCageActive, true);
  assert.equal(caged.raceY, initialY, "a caged racer should move only left/right");
  assert.ok(caged.raceX >= caged.raceCageLeft && caged.raceX <= caged.raceCageRight);
  assert.deepEqual(caged.raceLayerHealth, initialLayerHealth, "the indestructible cage prevents layer contact");
  stepSimulation(sim, 0.6);
  assert.equal(caged.raceCageActive, false, "the cage should release at its configured deterministic time");
  assert.ok(sim.events.some((event) => event.type === "race-cage-release" && event.fighterId === caged.id));
  assert.ok(caged.raceVy < 0, "released racers should resume the normal upward bounce arc");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["antimatter-bomb"], ["duplicator"]],
    raceLayerStrengths: [1_000, 1_000, 1_000],
    seed: 771501,
  });
  const bomb = sim.fighters.find((fighter) => fighter.raceOrbId === "antimatter-bomb");
  const target = sim.fighters.find((fighter) => fighter.raceOrbId === "duplicator");
  bomb.raceAntimatterCountdownElapsed = 14.999;
  stepSimulation(sim, 0.01);
  assert.equal(sim.events.filter((event) => event.type === "race-antimatter-detonation").length, 1);
  assert.equal(bomb.raceAntimatterDetonationCount, 1);
  assert.equal(bomb.raceDamage, 0, "Antimatter Bomb should never gain ordinary bounce damage");
  assert.equal(bomb.raceLayerIndex, 1, "the first Antimatter Bomb detonation should clear its own active layer");
  assert.deepEqual(target.raceLayerHealth, [1_000, 1_000, 1_000], "Antimatter must not damage the opponent's layers");
  assert.equal(target.raceLayerIndex, 0, "the opponent must remain on its original layer");
  assert.ok(bomb.raceAntimatterDustEffects.length > 0, "the bomb's cleared layer should leave a fading dust effect");
  bomb.raceAntimatterCountdownElapsed = 14.999;
  stepSimulation(sim, 0.01);
  assert.equal(bomb.raceAntimatterDetonationCount, 2);
  assert.equal(target.raceAntimatterOpponentDestroyed, true, "the second detonation should remove one opponent orb");
  assert.equal(target.alive, false);
  assert.deepEqual(target.raceLayerHealth, [1_000, 1_000, 1_000], "destroying an opponent orb must not clear its layers");
  assert.equal(sim.events.filter((event) => event.type === "race-antimatter-orb-destroy").length, 1);
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["antimatter-bomb"], ["duplicator"]],
    raceTeamOptions: [{}, { duplicator: { count: 4 } }],
    raceLayerStrengths: [1_000, 1_000, 1_000],
    seed: 771506,
  });
  const bomb = sim.fighters.find((fighter) => fighter.raceOrbId === "antimatter-bomb");
  const targets = sim.fighters.filter((fighter) => fighter.raceOrbId === "duplicator");
  const detonate = (cooldownSeconds) => {
    bomb.raceAntimatterCountdownElapsed = cooldownSeconds - 0.001;
    stepSimulation(sim, 0.01);
  };

  detonate(15);
  detonate(15);
  assert.equal(bomb.raceAntimatterDetonationCount, 2);
  assert.equal(
    targets.filter((target) => target.raceAntimatterOpponentDestroyed).length,
    1,
    "the second Antimatter detonation should destroy exactly one opponent orb",
  );
  assert.equal(
    bomb.raceAntimatterCooldownSeconds,
    RACE_ANTIMATTER_POST_SECOND_COOLDOWN_SECONDS,
    "the cooldown should switch to five seconds after the second detonation",
  );
  const secondDetonation = sim.events.find((event) => (
    event.type === "race-antimatter-detonation" && event.detonationCount === 2
  ));
  assert.equal(secondDetonation.targetId, targets[0].id);
  assert.equal(secondDetonation.nextCooldownSeconds, 5);

  detonate(RACE_ANTIMATTER_POST_SECOND_COOLDOWN_SECONDS);
  assert.equal(bomb.raceAntimatterDetonationCount, 3);
  assert.equal(
    targets.filter((target) => target.raceAntimatterOpponentDestroyed).length,
    2,
    "each post-second detonation should destroy only one additional orb",
  );
  const thirdDetonation = sim.events.find((event) => (
    event.type === "race-antimatter-detonation" && event.detonationCount === 3
  ));
  assert.equal(thirdDetonation.layerBreak, true, "post-second detonations keep breaking the bomb's active layer");
  assert.equal(thirdDetonation.cooldownSeconds, 5);
  assert.equal(thirdDetonation.nextCooldownSeconds, 5);
  assert.equal(
    new Set(sim.events
      .filter((event) => event.type === "race-antimatter-orb-destroy")
      .map((event) => event.targetId)).size,
    2,
    "Antimatter target selection should stay one-target-per-detonation",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["time-bomb"], ["duplicator"]],
    raceLayerStrengths: [1_000, 1_000, 1_000],
    seed: 771502,
  });
  const bomb = sim.fighters.find((fighter) => fighter.raceOrbId === "time-bomb");
  const target = sim.fighters.find((fighter) => fighter.raceOrbId === "duplicator");
  bomb.raceTimeBombCycleElapsed = 14.999;
  stepSimulation(sim, 0.01);
  assert.equal(bomb.raceTimeBombCycleCount, 1);
  assert.equal(bomb.raceDamage, 0, "Time Bomb should never gain ordinary bounce damage");
  assert.ok(bomb.raceTimeBombFreezeUntil > sim.time, "midnight should start the five-second freeze window");
  assert.ok(sim.events.some((event) => event.type === "race-time-bomb-midnight"));
  assert.deepEqual(target.raceLayerHealth, [1_000, 1_000, 1_000], "Time Bomb midnight must not damage opposing layers");
  assert.equal(bomb.raceTimeBombPulseActive, true, "midnight should start a visible expanding pulse");
  assert.ok(bomb.raceTimeBombInfiniteDamageUntil > sim.time, "midnight should grant infinite layer damage for five seconds");
  stepSimulation(sim, 1);
  assert.ok(bomb.raceTimeBombPulseHitIds.includes(target.id), "the expanding pulse should reach the opposing orb");
  assert.equal(target.raceVx, 0, "a pulse-hit opponent should stop moving horizontally");
  assert.equal(target.raceVy, 0, "a pulse-hit opponent should stop moving vertically");
  assert.equal(target.raceLayerHealth[1], 1_000, "the pulse should not clear the opponent's next layer");
  assert.equal(target.raceLayerHealth[2], 1_000, "the pulse should not clear the opponent's final layer");
  const frozenVx = target.raceTimeBombSavedVx;
  const frozenVy = target.raceTimeBombSavedVy;
  stepSimulation(sim, 5.1);
  assert.equal(target.raceTimeBombFreezeActive, false, "the freeze state should release after five seconds");
  assert.notEqual(target.raceVx, 0, "the opponent should resume its saved horizontal movement after midnight");
  assert.ok(Number.isFinite(frozenVx) && Number.isFinite(frozenVy));
}

{
  // Time Bomb's expanding pulse must reach the far corners of both race
  // formats, and the stop must cover owned projectiles plus absolute
  // cooldown timestamps rather than only the fighter's velocity.
  for (const raceLongform of [false, true]) {
    const sim = createSimulation({
      gameplayMode: ORB_RACE_MODE,
      raceTeams: [["time-bomb"], ["sniper"]],
      raceLayerStrengths: raceLongform
        ? [1_000, 1_000, 1_000, 1_000, 1_000]
        : [1_000, 1_000, 1_000],
      raceLongform,
      seed: raceLongform ? 771_505 : 771_504,
    });
    const bomb = sim.fighters.find((fighter) => fighter.raceOrbId === "time-bomb");
    const target = sim.fighters.find((fighter) => fighter.raceOrbId === "sniper");
    bomb.raceX = 0.04;
    bomb.raceY = 0.08;
    target.raceX = 0.96;
    target.raceY = raceLongform ? 0.98 : 0.92;
    target.raceVx = 0;
    target.raceVy = 0;
    target.raceSniperNextFireAt = sim.time + 3;
    target.raceSniperBullets = [{
      id: `${target.id}-frozen-bullet`,
      x: 0.5,
      y: 0.05,
      vx: 0,
      vy: 0,
      radius: 0.01,
      layerIndex: 0,
      piercesRemaining: 2,
      ricochets: 0,
      completed: false,
    }];
    bomb.raceTimeBombCycleElapsed = 14.999;
    stepSimulation(sim, 0.01);
    for (let step = 0; step < 180 && !bomb.raceTimeBombPulseHitIds.includes(target.id); step += 1) {
      stepSimulation(sim, 1 / 120);
    }
    assert.equal(bomb.raceTimeBombPulseMaxRadius, 2, "Time Bomb should use the whole-arena pulse radius");
    assert.ok(
      bomb.raceTimeBombPulseHitIds.includes(target.id),
      `${raceLongform ? "long" : "short"} form pulse should reach a far-corner target`,
    );
    const bulletBeforeFreeze = { ...target.raceSniperBullets[0] };
    const cooldownRemaining = target.raceSniperNextFireAt - sim.time;
    stepSimulation(sim, 0.5);
    assert.deepEqual(target.raceSniperBullets[0], bulletBeforeFreeze, "a stopped racer's projectiles should not advance");
    assert.ok(
      Math.abs((target.raceSniperNextFireAt - sim.time) - cooldownRemaining) < 1e-9,
      "a stopped racer's cooldown should keep its remaining duration",
    );
  }
}

{
  const settings = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["reality-bomb"], ["duplicator"]],
    raceLayerStrengths: [1_000, 1_000, 1_000],
    seed: 771503,
  };
  const first = createSimulation(settings);
  const second = createSimulation(settings);
  for (const sim of [first, second]) {
    const reality = sim.fighters.find((fighter) => fighter.raceOrbId === "reality-bomb");
    reality.raceRealityNextSpawnAt = 0;
    stepSimulation(sim, 0.01);
  }
  const firstReality = first.fighters.find((fighter) => fighter.raceOrbId === "reality-bomb");
  const secondReality = second.fighters.find((fighter) => fighter.raceOrbId === "reality-bomb");
  assert.equal(firstReality.raceRealitySpawns.length, 1);
  assert.equal(firstReality.raceRealitySpawns[0].raceTeamIndex, firstReality.raceTeamIndex);
  assert.ok(firstReality.raceRealitySpawns[0].raceSpawnProgress > 0 && firstReality.raceRealitySpawns[0].raceSpawnProgress < 1);
  assert.ok(first.events.some((event) => event.type === "race-reality-spawn"));
  assert.deepEqual(
    firstReality.raceRealitySpawns.map((spawn) => [spawn.raceOrbId, spawn.raceX, spawn.raceY]),
    secondReality.raceRealitySpawns.map((spawn) => [spawn.raceOrbId, spawn.raceX, spawn.raceY]),
    "Reality Bomb's random orb and placement should remain seeded/deterministic",
  );
}

{
  const realitySim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["reality-bomb"], ["unarmed"]],
    raceLayerStrengths: [100_000, 100_000, 100_000],
    seed: 771504,
  });
  const reality = realitySim.fighters.find((fighter) => fighter.raceOrbId === "reality-bomb");
  const opponent = realitySim.fighters.find((fighter) => fighter.raceOrbId === "unarmed");
  for (let step = 0; step < 1_200; step += 1) stepSimulation(realitySim, 1 / 120);
  assert.equal(reality.raceRealitySlammyCount, 2, "Reality Bomb should summon one plain Slammy every five seconds");
  assert.ok(
    reality.raceRealitySpawns.every((spawn) => (
      spawn.raceOrbId === "slammy"
      && spawn.raceDamage > 0
      && spawn.raceMiniScale === 1
    )),
    "Reality Bomb should keep plain full-size Slammy children with independent damage",
  );
  assert.equal(reality.raceRealityShiftCount, 1, "Reality Bomb should apply one layer rewrite every ten seconds");
  const ownShift = reality.raceRealityLayerShiftEffects.find((effect) => effect.teamIndex === reality.raceTeamIndex && effect.layerIndex === 0);
  const opponentShift = reality.raceRealityLayerShiftEffects.find((effect) => effect.teamIndex === opponent.raceTeamIndex && effect.layerIndex === 0);
  assert.equal(ownShift.to, ownShift.from * 0.8, "Reality Bomb should reduce its own layers by twenty percent");
  assert.equal(opponentShift.to, opponentShift.from * 1.1, "Reality Bomb should increase opponent layers by ten percent");
  assert.ok(reality.raceRealityLayerShiftEffects.length > 0, "Reality Bomb should retain fading number-layer shift effects");
  const realityRepeat = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["reality-bomb"], ["unarmed"]],
    raceLayerStrengths: [100_000, 100_000, 100_000],
    seed: 771504,
  });
  for (let step = 0; step < 1_200; step += 1) stepSimulation(realityRepeat, 1 / 120);
  assert.deepEqual(
    captureReplayFrame(realitySim).fighters.map((fighter) => [fighter.raceOrbId, fighter.raceRealitySlammyCount, fighter.raceRealityShiftCount]),
    captureReplayFrame(realityRepeat).fighters.map((fighter) => [fighter.raceOrbId, fighter.raceRealitySlammyCount, fighter.raceRealityShiftCount]),
    "Reality Bomb's timers and generated Slammy state should remain seeded and replay-stable",
  );
}

{
  const copycatSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["copycat"], ["sniper"]],
    raceLayerStrengths: [100_000, 100_000, 100_000],
    seed: 771505,
  });
  const copycat = copycatSim.fighters.find((fighter) => fighter.raceOrbId === "copycat");
  stepSimulation(copycatSim, 2.01);
  assert.equal(copycat.raceCopycatRouletteUntil > copycatSim.time, true, "Copycat should enter its one-second visual roulette after two seconds");
  assert.ok(copycatSim.events.some((event) => event.type === "race-copycat-roulette-start"), "Copycat roulette should emit its one-shot roulette cue event");
  assert.equal(copycat.raceCopycatRouletteOrbIds.length, 5, "Copycat should change roulette visuals every 0.2 seconds");
  stepSimulation(copycatSim, 1.01);
  assert.ok(
    copycat.raceCopycatRouletteOrbIds.every((orbId) => orbId && orbId !== "copycat")
      && new Set(copycat.raceCopycatRouletteOrbIds).size > 1,
    "Copycat's seeded roulette should vary through permitted abilities",
  );
  assert.ok(copycat.raceCopycatActiveAbilityId, "Copycat should resolve to a copied orb");
  assert.equal(copycat.raceCopycatVisualOrbId, copycat.raceCopycatActiveAbilityId);
  assert.ok(copycat.raceCopycatAbilityUntil > copycatSim.time);
  stepSimulation(copycatSim, 5.01);
  assert.equal(copycat.raceCopycatRouletteUntil > copycatSim.time, true, "Copycat should begin a new roulette immediately when the five-second transformation ends");
  stepSimulation(copycatSim, 1.01);
  assert.equal(copycat.raceCopycatTransformCount, 2, "Copycat should reroll immediately after each five-second transformation");
}

{
  const copycatOptions = {
    gameplayMode: ORB_RACE_MODE,
    raceLayerStrengths: [100_000, 100_000, 100_000],
    seed: 771507,
  };
  const first = createSimulation({ ...copycatOptions, raceTeams: [["copycat"], ["sniper"]] });
  const repeat = createSimulation({ ...copycatOptions, raceTeams: [["copycat"], ["sniper"]] });
  const differentOpponent = createSimulation({ ...copycatOptions, raceTeams: [["copycat"], ["meteor"]] });
  for (const sim of [first, repeat, differentOpponent]) stepSimulation(sim, 2.01);
  const firstCopycat = first.fighters.find((fighter) => fighter.raceOrbId === "copycat");
  const repeatCopycat = repeat.fighters.find((fighter) => fighter.raceOrbId === "copycat");
  const differentOpponentCopycat = differentOpponent.fighters.find((fighter) => fighter.raceOrbId === "copycat");
  assert.deepEqual(
    firstCopycat.raceCopycatRouletteOrbIds,
    repeatCopycat.raceCopycatRouletteOrbIds,
    "Copycat's random choices should remain replay-stable for the same seed",
  );
  assert.deepEqual(
    firstCopycat.raceCopycatRouletteOrbIds,
    differentOpponentCopycat.raceCopycatRouletteOrbIds,
    "Copycat's selection should not depend on other racers consuming the shared RNG",
  );
  const firstChoices = new Set();
  for (let seed = 771500; seed < 771512; seed += 1) {
    const sim = createSimulation({
      ...copycatOptions,
      seed,
      raceTeams: [["copycat"], ["sniper"]],
    });
    stepSimulation(sim, 2.01);
    firstChoices.add(sim.fighters[0].raceCopycatRouletteOrbIds[0]);
  }
  assert.ok(firstChoices.size > 1, "Copycat's first copied orb should vary across seeds");
  assert.ok(
    [...firstChoices].some((orbId) => orbId !== "super-x-power"),
    "Copycat should not have a fixed Super X^X first selection",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["copycat"], ["sniper"]],
    raceLayerStrengths: [100_000_000, 100_000_000, 100_000_000],
    seed: 12,
  });
  const copycat = sim.fighters[0];
  stepSimulation(sim, 2.01);
  stepSimulation(sim, 1.01);
  assert.equal(copycat.raceCopycatActiveAbilityId, "super-x-power");
  assert.ok(copycat.raceDamage > 1_000_000, "the first copied math ability should be allowed to ramp");
  stepSimulation(sim, 5.01);
  stepSimulation(sim, 1.01);
  assert.equal(copycat.raceCopycatActiveAbilityId, "meteor");
  assert.equal(copycat.raceMeteorDamage, 1, "Meteor should start from its own one-damage baseline after a math copy");
  assert.equal(copycat.raceMeteorSmallDamage, 1);
  assert.equal(copycat.raceDamage, 1, "Meteor must not inherit the previous math copy's huge damage");
  assert.ok(copycat.raceMeteorDamage < 1_000, "Copycat Meteor damage should remain a normal Meteor-scale value");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["copycat"], ["sniper"]],
    raceLayerStrengths: [100_000_000, 100_000_000, 100_000_000],
    seed: 9,
  });
  const copycat = sim.fighters[0];
  stepSimulation(sim, 2.01);
  stepSimulation(sim, 1.01);
  assert.equal(copycat.raceCopycatActiveAbilityId, "black-hole");
  assert.equal(copycat.raceBlackHoleTeleportPhase, "to-center");
  const savedX = copycat.raceBlackHoleReturnX;
  const savedY = copycat.raceBlackHoleReturnY;
  stepSimulation(sim, 5.01);
  assert.equal(copycat.raceCopycatRouletteUntil > sim.time, true, "Copycat should begin its next roulette after Black Hole expires");
  assert.equal(copycat.raceBlackHoleActive, false, "an expired copied Black Hole must not keep the racer pinned");
  assert.equal(copycat.raceBlackHoleTeleportPhase, "idle");
  const returnEvent = sim.events.findLast((event) => (
    event.type === "race-black-hole-teleport-in" && event.interrupted === true
  ));
  assert.equal(returnEvent?.reason, "copycat-transform-expired");
  assert.equal(returnEvent?.x, savedX, "Copycat Black Hole should return to its saved track position");
  assert.equal(returnEvent?.y, savedY, "Copycat Black Hole should return to its saved track height");
  assert.notEqual(copycat.raceX, 0.5, "the next roulette must not leave Copycat at arena center");
}

{
  const lagSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["lag"], ["unarmed"]],
    raceLayerStrengths: [10_000, 10_000, 10_000],
    seed: 771506,
  });
  const lag = lagSim.fighters.find((fighter) => fighter.raceOrbId === "lag");
  lagSim.raceRng.next = () => 0;
  lag.raceY = raceLayerLineY(0) - RACE_ORB_RADIUS * lag.raceOrbScale;
  resolveRaceBounce(lagSim, lag);
  assert.equal(lag.raceLagGlitchActive, true, "Lag should start its glitch only while touching a number layer");
  assert.equal(lag.raceLagGlitchDuration, 2);
  assert.equal(lag.raceLagGlitchDamagePerTick, 10);
  assert.equal(lag.raceLagGlitchDamagePerSecond, 20);
  assert.equal(lag.raceLagGlitchTickInterval, 0.5);
  assert.ok(Math.abs(lag.raceLagGlitchChance - 0.11) < 1e-12);
  assert.equal(calculateRaceTeamDamagePerSecond([lag]), 20, "Lag's team DPS should use its 0.5-second tick cadence");
  const lagReplay = captureReplayFrame(lagSim).fighters.find((fighter) => fighter.raceOrbId === "lag");
  assert.deepEqual(
    [lagReplay.raceLagGlitchDamagePerTick, lagReplay.raceLagGlitchTickInterval, lagReplay.raceLagGlitchChance],
    [10, 0.5, lag.raceLagGlitchChance],
    "Lag cadence and next frequency must survive replay capture",
  );
  const healthBeforeTick = lag.raceLayerHealth[0];
  stepSimulation(lagSim, 0.49);
  assert.equal(lag.raceLayerHealth[0], healthBeforeTick, "Lag should wait for its half-second tick cadence");
  stepSimulation(lagSim, 0.01);
  assert.equal(lag.raceLayerHealth[0], healthBeforeTick - 10, "Lag should apply its current damage once every 0.5 seconds");
  const firstGlitch = lagSim.events.find((event) => event.type === "race-lag-glitch-start");
  assert.equal(firstGlitch?.chance, 0.1);
  assert.ok(Math.abs(firstGlitch?.nextChance - 0.11) < 1e-12);
  assert.equal(firstGlitch?.damagePerTick, 10);
  assert.equal(firstGlitch?.tickInterval, 0.5);
  assert.ok(lagSim.events.some((event) => event.type === "race-lag-glitch-tick" && event.damagePerTick === 10));
  lag.raceLagGlitchActive = false;
  lag.raceLagLayerIndex = -1;
  lag.raceY = raceLayerLineY(0) - RACE_ORB_RADIUS * lag.raceOrbScale;
  resolveRaceBounce(lagSim, lag);
  const secondGlitch = lagSim.events.findLast((event) => event.type === "race-lag-glitch-start");
  assert.ok(Math.abs(secondGlitch?.chance - 0.11) < 1e-12, "Lag frequency should increase by 10% after each glitch");
  assert.ok(Math.abs(secondGlitch?.nextChance - 0.121) < 1e-12);
  assert.equal(secondGlitch?.damagePerTick, 40, "Lag damage should quadruple on the next glitch");
  assert.equal(lag.raceLagGlitchDamagePerSecond, 80);
  assert.equal(calculateRaceTeamDamagePerSecond([lag]), 80);
  assert.ok(lag.raceBounceEffects.some((effect) => effect.lagGlitch === true && effect.tick === true), "Lag ticks should emit expanding ring effects");
  lag.raceLagLayerIndex = 1;
  stepSimulation(lagSim, 1 / 120);
  assert.equal(lag.raceLagGlitchActive, false, "Lag should stop glitching when it leaves the number layer");
}

{
  const whirlwindSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["whirlwind"], ["unarmed"]],
    raceLayerStrengths: [10_000, 10_000, 10_000],
    seed: 771507,
  });
  const whirlwind = whirlwindSim.fighters.find((fighter) => fighter.raceOrbId === "whirlwind");
  assert.equal(whirlwind.raceDamage, 0, "Whirlwind should begin with no bounce damage");
  resolveRaceBounce(whirlwindSim, whirlwind);
  assert.equal(whirlwind.raceWhirlwindHits, 1);
  assert.ok(Math.abs(whirlwind.raceWhirlwindRotationSpeed - 1.125) < 1e-9);
  assert.ok(Math.abs(whirlwind.raceWhirlwindDamage - 1.2) < 1e-9);
  assert.equal(whirlwind.raceDamage, 0, "Whirlwind's carrier orb should not deal body damage");
  const satellitePosition = raceWhirlwindOrbPosition(whirlwind, 0, whirlwindSim.time);
  whirlwind.raceY = raceLayerLineY(0) - satellitePosition.offsetY;
  const healthBeforeSatellite = whirlwind.raceLayerHealth[0];
  resolveRaceBounce(whirlwindSim, whirlwind);
  assert.ok(whirlwind.raceLayerHealth[0] < healthBeforeSatellite, "a Whirlwind satellite should damage independently");
  assert.ok(
    whirlwindSim.events.some((event) => event.whirlwindSatelliteContact === true),
    "Whirlwind satellite damage should emit its own contact event",
  );
}

{
  const rgbSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["rgb"], ["unarmed"]],
    raceLayerStrengths: [10_000, 10_000, 10_000],
    seed: 771508,
  });
  const rgb = rgbSim.fighters.find((fighter) => fighter.raceOrbId === "rgb");
  const speedReferenceSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["unarmed"]],
    raceLayerStrengths: [10_000, 10_000, 10_000],
    seed: 771508,
  });
  const speedReference = speedReferenceSim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  assert.equal(rgb.raceSpeed, speedReference.raceSpeed, "RGB should start on the Speedster speed level");
  assert.equal(rgb.raceTravelSpeed, speedReference.raceTravelSpeed, "RGB should use Speedster horizontal physics");
  assert.ok(rgb.raceVerticalSpeed > 0, "RGB should initialize the Speedster vertical launch ramp");
  const rgbSpeedBeforeBounce = rgb.raceSpeed;
  const rgbVerticalSpeedBeforeBounce = rgb.raceVerticalSpeed;
  const rgbTravelSpeedBeforeBounce = rgb.raceTravelSpeed;
  rgb.raceRgbColorIndex = 0;
  resolveRaceBounce(rgbSim, rgb);
  assert.equal(rgb.raceSpeed, rgbSpeedBeforeBounce + 1, "RGB should gain the base Speedster speed level per bounce");
  assert.ok(rgb.raceVerticalSpeed > rgbVerticalSpeedBeforeBounce, "RGB should gain Speedster vertical launch speed per bounce");
  assert.equal(rgb.raceTravelSpeed, rgbTravelSpeedBeforeBounce, "RGB's base Speedster ramp should keep horizontal speed fixed");
  assert.equal(rgb.raceRgbDamageBonus, 3, "RGB red should add three damage per bounce");
  assert.equal(rgb.raceDamage, 4);
  const colorBeforeCycle = rgb.raceRgbColorIndex;
  stepSimulation(rgbSim, 5.01);
  assert.notEqual(rgb.raceRgbColorIndex, colorBeforeCycle, "RGB should choose a new random color every five seconds");
  assert.ok(rgbSim.events.some((event) => event.type === "race-rgb-cycle"));

  const rouletteSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["rgb"], ["unarmed"]],
    raceLayerStrengths: [10_000, 10_000, 10_000],
    seed: 771509,
  });
  const rouletteRgb = rouletteSim.fighters.find((fighter) => fighter.raceOrbId === "rgb");
  stepSimulation(rouletteSim, 4.2);
  assert.equal(rouletteRgb.raceRgbRouletteColorIndices.length, 5, "RGB should expose deterministic roulette frames before a color commit");
  assert.notEqual(rouletteRgb.raceRgbRouletteVisualColorIndex, null, "RGB should render a roulette color while cycling");

  const wallRgbSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["rgb"], ["unarmed"]],
    raceLayerStrengths: [10_000, 10_000, 10_000],
    seed: 771510,
  });
  const wallRgb = wallRgbSim.fighters.find((fighter) => fighter.raceOrbId === "rgb");
  const wallRadius = RACE_ORB_RADIUS * wallRgb.raceOrbScale;
  const wallMaxX = 1 - wallRadius;
  wallRgb.raceX = wallMaxX + 0.3;
  wallRgb.raceVx = 40;
  wallRgb.raceVy = 0;
  stepSimulation(wallRgbSim, 1 / 120);
  assert.ok(wallRgb.raceX >= wallRadius && wallRgb.raceX <= wallMaxX, "RGB should remain inside the arena after a high-speed wall crossing");
  assert.ok(wallRgb.raceVx < 0, "RGB should reflect through a side-wall overshoot instead of sticking/teleporting at the wall");
  assert.ok(wallRgb.raceX < wallMaxX - 0.001, "RGB should preserve reflected travel distance after a side-wall contact");

  const superSlammySim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["super-slammy"], ["unarmed"]],
    raceLayerStrengths: [10_000, 10_000, 10_000],
    seed: 771511,
  });
  const superSlammy = superSlammySim.fighters.find((fighter) => fighter.raceOrbId === "super-slammy");
  resolveRaceBounce(superSlammySim, superSlammy);
  assert.equal(superSlammy.raceDamage, 6, "Super Slammy should gain five damage on its first bounce");
  resolveRaceBounce(superSlammySim, superSlammy);
  assert.equal(superSlammy.raceDamage, 11, "Super Slammy should add five damage on every subsequent bounce");

  const piercerSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["piercer"], ["unarmed"]],
    raceLayerStrengths: [100, 100, 100],
    seed: 771512,
  });
  const piercer = piercerSim.fighters.find((fighter) => fighter.raceOrbId === "piercer");
  resolveRaceBounce(piercerSim, piercer);
  assert.deepEqual(piercer.raceLayerHealth, [98.25, 98.25, 98.25], "Piercer should sweep the same hit across every live layer");
  assert.equal(piercer.raceDamage, 1.75, "Piercer should add 0.75 damage after its first layer hit");
  assert.ok(piercerSim.events.some((event) => event.type === "race-piercer-sweep" && event.layers.length === 2));
  resolveRaceBounce(piercerSim, piercer);
  assert.equal(piercer.raceDamage, 2.5, "Piercer should continue its 0.75-per-hit damage ramp");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["tsar-bomb"], ["unarmed"]],
    raceLayerStrengths: [10_000, 10_000, 10_000],
    seed: 771513,
  });
  const tsar = sim.fighters.find((fighter) => fighter.raceOrbId === "tsar-bomb");
  const opponent = sim.fighters.find((fighter) => fighter.raceOrbId === "unarmed");
  assert.equal(tsar.raceDamage, 0, "Tsar Bomb should have no ordinary bounce damage");
  assert.equal(tsar.raceTsarBombReactorNextAt, RACE_TSAR_BOMB_REACTOR_INTERVAL_SECONDS);
  stepSimulation(sim, 1 / 120);
  assert.ok(sim.events.some((event) => event.type === "race-tsar-bomb-countdown-start"));

  tsar.raceTsarBombReactorNextAt = sim.time;
  stepSimulation(sim, 1 / 120);
  assert.equal(tsar.raceTsarBombReactorUses, 1, "Tsar Bomb should fire its reactor pulse on schedule");
  assert.ok(sim.events.some((event) => event.type === "race-tsar-bomb-reactor-hit"));
  assert.ok(tsar.raceLayerHealth.some((health) => health < 10_000), "the reactor pulse should damage Tsar Bomb's layer");

  sim.raceTsarBombCountdownElapsed = RACE_TSAR_BOMB_COUNTDOWN_SECONDS - 1 / 240;
  tsar.raceTsarBombCountdownElapsed = sim.raceTsarBombCountdownElapsed;
  stepSimulation(sim, 1 / 120);
  assert.equal(sim.raceTsarBombExploded, true, "Tsar Bomb should detonate after its 90-second countdown");
  assert.equal(opponent.raceDestroyedByTsarBomb, true, "Tsar Bomb should destroy opposing fighters on detonation");
  assert.ok(sim.events.some((event) => event.type === "race-tsar-bomb-explosion"));
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["all-in-one"], ["unarmed"]],
    raceLayerStrengths: [1_000_000, 1_000_000, 1_000_000],
    seed: 771514,
  });
  const allInOne = sim.fighters.find((fighter) => fighter.raceOrbId === "all-in-one");
  assert.deepEqual(allInOne.raceAbilityIds, [...ORB_RACE_ALL_IN_ONE_ABILITY_IDS]);
  assert.ok(allInOne.raceAbilityIds.includes("hydrogen-bomb"), "All In One should include Hydrogen Bomb");
  assert.equal(allInOne.raceAllInOneNextActivationAt, RACE_ALL_IN_ONE_ACTIVATION_INTERVAL_SECONDS);

  allInOne.raceAllInOneNextActivationAt = sim.time;
  stepSimulation(sim, 1 / 120);
  assert.equal(allInOne.raceAllInOneActive, true, "All In One should activate its mixed power window");
  assert.equal(allInOne.raceAllInOneActiveUntil, sim.time + RACE_ALL_IN_ONE_ACTIVE_SECONDS);
  resolveRaceBounce(sim, allInOne);
  assert.equal(
    allInOne.raceAllInOnePowerMultiplier,
    RACE_ALL_IN_ONE_BOUNCE_MULTIPLIER,
    "the first active wall contact should establish the ×10 multiplier",
  );
  assert.ok(sim.events.some((event) => event.type === "race-all-in-one-power-bounce" && event.numberLine === true));
  resolveRaceBounce(sim, allInOne);
  assert.equal(allInOne.raceAllInOnePowerMultiplier, RACE_ALL_IN_ONE_BOUNCE_MULTIPLIER * 2);
  assert.ok(sim.events.some((event) => event.type === "race-all-in-one-power-bounce" && event.numberLine === true));

  allInOne.raceAllInOneHydrogenCountdownElapsed = RACE_ALL_IN_ONE_HYDROGEN_COUNTDOWN_SECONDS - 1 / 240;
  stepSimulation(sim, 1 / 120);
  assert.equal(allInOne.raceAllInOneHydrogenExploded, true, "All In One should retain its Hydrogen Bomb countdown");
  assert.equal(allInOne.raceAllInOneHydrogenExplosionUntil, sim.time + 4, "the mixed bomb should expose its flash window");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["mines"], ["sticky"]],
    raceTeamOptions: [{
      mines: { count: 5, comboAbilities: ["speed"] },
    }, {
      sticky: { count: 2, comboAbilities: ["fibonacci", "lazer"] },
    }],
    seed: 55101,
  });
  const splodeys = sim.fighters.filter((fighter) => fighter.raceOrbId === "mines");
  const stickies = sim.fighters.filter((fighter) => fighter.raceOrbId === "sticky");
  assert.equal(splodeys.length, 5, "quantity five should expand into five independent Splodey fighters");
  assert.equal(stickies.length, 2);
  assert.deepEqual(splodeys.map((fighter) => fighter.raceCopyIndex), [0, 1, 2, 3, 4]);
  assert.ok(splodeys.every((fighter) => raceHasAbility(fighter, "speed")));
  assert.ok(stickies.every((fighter) => raceHasAbility(fighter, "fibonacci") && raceHasAbility(fighter, "lazer")));
  assert.equal(sim.raceTeams[0].name, "5× SPEEDPLODEY");
  assert.equal(sim.raceTeams[0].memberIds.length, 5);

  const first = splodeys[0];
  first.raceY = 0.25 - first.raceOrbScale * 0.045;
  first.raceVy = 1;
  stepSimulation(sim, 1 / 120);
  const bounce = sim.events.find((event) => event.type === "race-bounce" && event.fighterId === first.id);
  assert.deepEqual(bounce?.raceAbilityIds, ["mines", "speed"], "race audio events should carry the composed ability identity");
}

{
  const settingsFor = (speedMode, buffed = false) => ({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["centy"], ["fibonacci"]],
    raceTeamOptions: [{
      centy: { speedMode, buffed },
    }, {
      fibonacci: { speedMode: "regular" },
    }],
    raceLayerStrengths: [1_000_000_000, 1_000_000_000, 1_000_000_000],
    seed: 50417,
  });
  const regular = createSimulation(settingsFor("regular"));
  const slow = createSimulation(settingsFor("slow"));
  const veryStrongMathSlow = createSimulation(settingsFor("very-strong-math-slow", true));
  const veryStrongSquareRootSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["square-root"], ["unarmed"]],
    raceTeamOptions: [{ "square-root": { speedMode: "very-strong-math-slow" } }, {}],
    raceLayerStrengths: [1_000_000_000, 1_000_000_000, 1_000_000_000],
    seed: 50419,
  });
  const slowFibonacciSim = createSimulation({
    ...settingsFor("regular"),
    raceTeamOptions: [{ centy: { speedMode: "regular" } }, { fibonacci: { speedMode: "slow" } }],
  });
  const regularCenty = regular.fighters.find((fighter) => fighter.raceOrbId === "centy");
  const slowCenty = slow.fighters.find((fighter) => fighter.raceOrbId === "centy");
  const slowFibonacci = slowFibonacciSim.fighters.find((fighter) => fighter.raceOrbId === "fibonacci");
  const veryStrongCenty = veryStrongMathSlow.fighters.find((fighter) => fighter.raceOrbId === "centy");
  const veryStrongSquareRoot = veryStrongSquareRootSim.fighters.find((fighter) => fighter.raceOrbId === "square-root");
  const veryStrongTrifectaSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["trifecta"], ["unarmed"]],
    raceTeamOptions: [{ trifecta: { speedMode: "very-strong-math-slow" } }, {}],
    raceLayerStrengths: [900, 100, 100],
    seed: 50420,
  });
  const veryStrongTrifecta = veryStrongTrifectaSim.fighters.find((fighter) => fighter.raceOrbId === "trifecta");
  assert.equal(regularCenty.raceSpeedMode, "regular");
  assert.equal(slowCenty.raceSpeedMode, "slow");
  assert.equal(veryStrongCenty.raceSpeedMode, "very-strong-math-slow");
  assert.equal(veryStrongCenty.raceBuffed, true);
  assert.equal(veryStrongSquareRoot.raceSpeedMode, "very-strong-math-slow");
  assert.equal(veryStrongSquareRoot.raceTravelSpeed, 0.12, "Square Root should use the very-strong-math travel speed");
  assert.equal(veryStrongTrifecta.raceSpeedMode, "very-strong-math-slow");
  assert.equal(veryStrongTrifecta.raceTravelSpeed, 0.12, "Trifecta should use the very-strong-math travel speed");
  assert.equal(veryStrongMathSlow.raceTeams[0].name, "CENTY (BUFFED)");
  const regularFibonacci = regular.fighters.find((fighter) => fighter.raceOrbId === "fibonacci");
  assert.equal(
    regularCenty.raceTravelSpeed,
    regularFibonacci.raceTravelSpeed,
    "regular mode should use the shared Duplicator baseline for different math orbs",
  );
  assert.ok(slowCenty.raceTravelSpeed < regularCenty.raceTravelSpeed);
  assert.ok(
    Math.abs(slowCenty.raceTravelSpeed - (0.49 * 0.72)) < 1e-12,
    "Slow mode should restore the old power-math travel speed",
  );
  assert.ok(
    Math.abs(slowFibonacci.raceTravelSpeed - (0.52 * 0.72)) < 1e-12,
    "Slow mode should restore the old Fibonacci-class travel speed",
  );
  assert.equal(veryStrongCenty.raceTravelSpeed, 0.12, "Very strong math slow should retain the old Infinity-style speed");
  assert.ok(veryStrongCenty.raceTravelSpeed < slowCenty.raceTravelSpeed);

  const veryStrongInfinityFibonacci = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["infinity"], ["fibonacci"]],
    raceTeamOptions: [{ infinity: { speedMode: "very-strong-math-slow" } }, { fibonacci: { speedMode: "very-strong-math-slow" } }],
    raceLayerStrengths: [1e30, 1e30, 1e30],
    seed: 50418,
  });
  const veryStrongInfinity = veryStrongInfinityFibonacci.fighters.find((fighter) => fighter.raceOrbId === "infinity");
  const veryStrongFibonacci = veryStrongInfinityFibonacci.fighters.find((fighter) => fighter.raceOrbId === "fibonacci");
  assert.equal(veryStrongInfinity.raceTravelSpeed, veryStrongFibonacci.raceTravelSpeed, "Very strong math speed should be shared by Infinity and Fibonacci");
  for (const racer of [veryStrongInfinity, veryStrongFibonacci]) {
    racer.raceY = raceLayerLineY(0) - RACE_ORB_RADIUS * racer.raceOrbScale;
    racer.raceVy = 1;
  }
  resolveRaceBounce(veryStrongInfinityFibonacci, veryStrongInfinity);
  resolveRaceBounce(veryStrongInfinityFibonacci, veryStrongFibonacci);
  assert.equal(Math.abs(veryStrongInfinity.raceVy), Math.abs(veryStrongFibonacci.raceVy), "Very strong math orbs should gain the same vertical height with a shared short arc");

  veryStrongCenty.raceY = raceLayerLineY(0) - RACE_ORB_RADIUS * veryStrongCenty.raceOrbScale;
  veryStrongCenty.raceVy = 1;
  stepSimulation(veryStrongMathSlow, 1 / 120);
  const regularBounceSim = createSimulation(settingsFor("regular"));
  const regularBounce = regularBounceSim.fighters.find((fighter) => fighter.raceOrbId === "centy");
  regularBounce.raceY = raceLayerLineY(0) - RACE_ORB_RADIUS * regularBounce.raceOrbScale;
  regularBounce.raceVy = 1;
  stepSimulation(regularBounceSim, 1 / 120);
  assert.ok(
    Math.abs(veryStrongCenty.raceVy) < Math.abs(regularBounce.raceVy),
    "very strong math slow should keep a high arc while using a slower launch velocity",
  );

  const firstFlightFor = (speedMode) => {
    const sim = createSimulation({
      gameplayMode: ORB_RACE_MODE,
      raceTeams: [["infinity"], ["orbital"]],
      raceTeamOptions: [{ infinity: { speedMode } }, { orbital: { speedMode: "regular" } }],
      raceLayerStrengths: [1e30, 1e30, 1e30],
      seed: 50419,
    });
    const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "infinity");
    const floorY = raceLayerLineY(0) - RACE_ORB_RADIUS * racer.raceOrbScale;
    racer.raceY = floorY;
    racer.raceVy = 1;
    stepSimulation(sim, 1 / 120);
    const bounceCount = racer.raceBounces;
    let apexY = racer.raceY;
    let flightSteps = 0;
    while (flightSteps < 1200 && racer.raceBounces === bounceCount) {
      stepSimulation(sim, 1 / 120);
      apexY = Math.min(apexY, racer.raceY);
      flightSteps += 1;
    }
    return { apexHeight: floorY - apexY, flightSteps };
  };
  const veryStrongFlight = firstFlightFor("very-strong-math-slow");
  const regularFlight = firstFlightFor("regular");
  assert.ok(Math.abs(veryStrongFlight.apexHeight - regularFlight.apexHeight) < 0.01, "Very strong math should retain the same high vertical height");
  assert.ok(veryStrongFlight.flightSteps > regularFlight.flightSteps * 4, "Very strong math should stay aloft longer instead of landing quickly");

  const replayA = createSimulation(settingsFor("very-strong-math-slow"));
  const replayB = createSimulation(settingsFor("very-strong-math-slow"));
  for (let step = 0; step < 720; step += 1) {
    stepSimulation(replayA, 1 / 120);
    stepSimulation(replayB, 1 / 120);
  }
  assert.deepEqual(
    captureReplayFrame(replayA),
    captureReplayFrame(replayB),
    "speed mode changes must remain deterministic for the same seed",
  );
  assert.equal(
    captureReplayFrame(veryStrongMathSlow).fighters.find((fighter) => fighter.raceOrbId === "centy").raceSpeedMode,
    "very-strong-math-slow",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["shrapnel"], ["speed"]],
    raceLayerStrengths: [1_000_000, 1_000_000],
    seed: 88420,
  });
  const shrapnel = sim.fighters.find((fighter) => fighter.raceOrbId === "shrapnel");
  const wallCounts = [];
  for (let index = 0; index < 2; index += 1) {
    shrapnel.raceX = 0.99;
    shrapnel.raceY = 0.1;
    shrapnel.raceVx = 1;
    shrapnel.raceVy = 0;
    stepSimulation(sim, 1 / 120);
    wallCounts.push(sim.events.findLast((event) => event.type === "race-shrapnel-wall")?.count);
  }
  assert.deepEqual(wallCounts, [3, 4], "Shrapnel wall volleys should gain one fragment per qualifying bounce");
  shrapnel.raceBounces = 100;
  shrapnel.raceX = 0.99;
  shrapnel.raceY = 0.1;
  shrapnel.raceVx = 1;
  shrapnel.raceVy = 0;
  stepSimulation(sim, 1 / 120);
  assert.equal(sim.events.findLast((event) => event.type === "race-shrapnel-wall")?.count, 75, "Shrapnel volleys should cap at 75 fragments");
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["unarmed", "slammy"], ["flash"]],
    raceLayerStrengths: [1, 10],
    raceTiltedLayerEnabled: true,
    raceTiltedLayerIndex: 0,
    seed: 91918,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  const unarmed = first.fighters[0];
  const teammate = first.fighters[1];
  const opposing = first.fighters[2];
  assert.deepEqual(unarmed.raceTiltedLayerHealth[0], [1, 1]);
  assert.strictEqual(unarmed.raceTiltedLayerHealth, teammate.raceTiltedLayerHealth);
  assert.notStrictEqual(unarmed.raceTiltedLayerHealth, opposing.raceTiltedLayerHealth);
  assert.ok(raceTiltedLayerSurfaceY(0, 0.25) < raceTiltedLayerSurfaceY(0, 0.5));
  assert.ok(raceTiltedLayerSurfaceY(0, 0.75) < raceTiltedLayerSurfaceY(0, 0.5));
  assert.ok(raceTiltedLayerSurfaceNormal(0.25).x > 0, "left tilted piece should slope its rebound toward center");
  assert.ok(raceTiltedLayerSurfaceNormal(0.75).x < 0, "right tilted piece should slope its rebound toward center");

  for (const sim of [first, second]) {
    const racer = sim.fighters[0];
    racer.raceX = 0.25;
    resolveRaceBounce(sim, racer, racer, 0);
  }
  assert.deepEqual(unarmed.raceTiltedLayerHealth[0], [0, 1], "the left tilted piece should own its damage");
  assert.equal(unarmed.raceLayerHealth[0], 0.5, "the compatibility health aggregate should remain active");
  assert.equal(unarmed.raceLayerIndex, 0, "opening one tilted piece should leave the other physical piece active");
  assert.equal(unarmed.raceTiltedLayerHealth[0][1], 1, "the surviving tilted piece should retain its own health");
  const eventsBeforeDeadPieceFall = first.events.length;
  for (const sim of [first, second]) {
    const racer = sim.fighters[0];
    racer.raceX = 0.25;
    racer.raceY = raceTiltedLayerSurfaceY(0, racer.raceX) - RACE_ORB_RADIUS * racer.raceOrbScale - 0.001;
    racer.raceVx = 0;
    racer.raceVy = 0.5;
    stepOrbRace(sim, 1 / 120);
  }
  assert.ok(
    !first.events.slice(eventsBeforeDeadPieceFall).some((event) => event.type === "race-bounce" && event.fighterId === unarmed.id),
    "an orb must fall through a destroyed tilted piece instead of bouncing from it",
  );
  for (const sim of [first, second]) {
    const racer = sim.fighters[0];
    const yBeforeTransition = racer.raceY;
    for (let step = 0; step < 180 && racer.raceLayerIndex === 0; step += 1) {
      stepOrbRace(sim, 1 / 120);
    }
    assert.equal(racer.raceLayerIndex, 1, "a racer should enter the next lane through its open tilted half");
    assert.equal(racer.raceLayerIndexOverride, 1, "the open-half transition should be a per-racer lane override");
    assert.ok(racer.raceY > yBeforeTransition, "the open-half transition should preserve falling motion");
    assert.equal(racer.raceTiltedLayerHealth[0][1], 1, "the surviving half should remain physical while its teammate falls through");
  }

  for (const sim of [first, second]) {
    const racer = sim.fighters[0];
    racer.raceX = 0.75;
    resolveRaceBounce(sim, racer, racer, 0);
  }
  assert.deepEqual(unarmed.raceTiltedLayerHealth[0], [0, 0], "the right tilted piece should have independent health");
  assert.equal(unarmed.raceLayerIndex, 1, "the next layer should remain active after the second tilted piece is destroyed");
  assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second), "tilted piece health should remain deterministic");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["scissor", "slammy"], ["flash"]],
    raceLayerStrengths: [20, 100],
    raceTiltedLayerEnabled: false,
    raceTiltedLayerIndex: 0,
    raceLongform: true,
    seed: 91919,
  });
  const scissor = sim.fighters.find((fighter) => fighter.raceOrbId === "scissor");
  const slammy = sim.fighters.find((fighter) => fighter.raceOrbId === "slammy");
  scissor.raceX = 0.25;
  const splitSourceHealth = scissor.raceLayerHealth[0];
  resolveRaceBounce(sim, scissor, scissor, 0);
  assert.deepEqual(
    slammy.raceTiltedLayerHealth[0],
    [splitSourceHealth / 2, splitSourceHealth / 2],
    "Scissor should expose two physical halves to its teammates",
  );

  // Put Slammy in the lane below the split and launch it upward through the
  // surviving right half. The old generic top-wall branch bounced without
  // damage; the split half must now own both the collision and the damage.
  slammy.raceLayerIndexOverride = 1;
  slammy.raceLayerIndex = 1;
  slammy.raceX = 0.75;
  slammy.raceY = raceLayerLineY(0) + RACE_ORB_RADIUS * slammy.raceOrbScale * 1.4;
  slammy.raceVx = 0;
  slammy.raceVy = -1;
  const rightPieceBefore = slammy.raceTiltedLayerHealth[0][1];
  const eventStart = sim.events.length;
  for (let step = 0; step < 120 && slammy.raceTiltedLayerHealth[0][1] === rightPieceBefore; step += 1) {
    stepOrbRace(sim, 1 / 120);
  }
  assert.ok(slammy.raceTiltedLayerHealth[0][1] < rightPieceBefore, "Slammy should damage a surviving tilted half above its lane");
  assert.ok(
    sim.events.slice(eventStart).some((event) => (
      event.type === "race-bounce"
      && event.fighterId === slammy.id
      && event.layerIndex === 0
      && event.surface === "number-line"
    )),
    "Slammy should bounce from the surviving tilted half instead of the generic top wall",
  );
  assert.ok(slammy.raceVy > 0, "the underside tilted-layer collision should reverse Slammy downward");
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["mines"], ["sticky"]],
    raceTeamOptions: [{
      mines: { count: 5, comboAbilities: ["speed"] },
    }, {
      sticky: { count: 3, comboAbilities: ["fibonacci"] },
    }],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 55102,
    spawnSeed: 55102,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  const firstSplodeys = first.fighters.filter((fighter) => fighter.raceOrbId === "mines");
  const secondSplodeys = second.fighters.filter((fighter) => fighter.raceOrbId === "mines");
  assert.deepEqual(firstSplodeys.map((fighter) => fighter.raceCopyIndex), [0, 1, 2, 3, 4]);
  assert.deepEqual(
    firstSplodeys.map((fighter) => [fighter.id, fighter.raceX, fighter.raceY, fighter.raceVx, fighter.raceVy]),
    secondSplodeys.map((fighter) => [fighter.id, fighter.raceX, fighter.raceY, fighter.raceVx, fighter.raceVy]),
    "quantity-expanded racers should use independent deterministic spawn states",
  );
  for (let step = 0; step < 480; step += 1) {
    stepSimulation(first, 1 / 120);
    stepSimulation(second, 1 / 120);
  }
  assert.deepEqual(first.events, second.events, "the same counts and composed abilities should repeat the full event stream");
  assert.deepEqual(
    first.fighters.map((fighter) => [fighter.raceX, fighter.raceY, fighter.raceMineCooldown, fighter.raceMineProjectiles]),
    second.fighters.map((fighter) => [fighter.raceX, fighter.raceY, fighter.raceMineCooldown, fighter.raceMineProjectiles]),
  );
  firstSplodeys.forEach((fighter) => { fighter.raceMineCooldown = 0; });
  secondSplodeys.forEach((fighter) => { fighter.raceMineCooldown = 0; });
  stepSimulation(first, 1 / 120);
  stepSimulation(second, 1 / 120);
  assert.ok(first.raceTeams[0].raceDamagePerSecond > 0, "aggregate team DPS should include active Splodey bomb projectiles");
  assert.equal(
    first.raceTeams[0].raceDamagePerSecond,
    calculateRaceTeamDamagePerSecond(firstSplodeys),
    "team DPS should aggregate every independent Splodey copy",
  );
  assert.ok(firstSplodeys.every((fighter) => fighter.raceMineProjectiles.every((projectile) => projectile.ownerId === fighter.id)));
  assert.equal(second.fighters.filter((fighter) => fighter.raceOrbId === "sticky").length, 3);
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["fibonacci"], ["orbital"]],
    raceTeamOptions: [
      { fibonacci: { count: 3, comboAbilities: ["speed"] } },
      { orbital: { count: 1, comboAbilities: ["grower"] } },
    ],
    raceLayerStrengths: [8, 9, 10],
    seed: 88101,
    spawnSeed: 88101,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  for (let step = 0; step < 5400 && !first.finished && !second.finished; step += 1) {
    stepSimulation(first, 1 / 120);
    stepSimulation(second, 1 / 120);
  }
  assert.ok(first.finished && second.finished, "the composed race should select a winner");
  assert.deepEqual(first.events, second.events, "the same seed, quantities, and combos should repeat the event stream");
  assert.equal(first.winningRaceTeamIndex, second.winningRaceTeamIndex, "the same seed, quantities, and combos should repeat the winner");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["fibonacci"], ["orbital"]],
    raceTeamOptions: [{ fibonacci: { comboAbilities: ["speed"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 55103,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "fibonacci");
  const startingSpeed = racer.raceSpeed;
  const startingTravelSpeed = racer.raceTravelSpeed;
  const startingVerticalSpeed = racer.raceVerticalSpeed;
  const startingHorizontalSpeed = Math.abs(racer.raceVx);
  resolveRaceBounce(sim, racer);
  resolveRaceBounce(sim, racer);
  resolveRaceBounce(sim, racer);
  assert.equal(racer.raceDamage, 2, "borrowed Speedster must retain Fibonacci's bounce damage policy");
  assert.ok(racer.raceSpeed > startingSpeed, "borrowed Speedster must ramp movement on every qualifying bounce");
  assert.equal(racer.raceTravelSpeed, startingTravelSpeed, "borrowed Speedster must keep horizontal travel speed fixed");
  assert.ok(racer.raceVerticalSpeed > startingVerticalSpeed, "borrowed Speedster must increase vertical launch speed");
  assert.equal(Math.abs(racer.raceVx), startingHorizontalSpeed, "borrowed Speedster must not accelerate horizontally");
  assert.equal(racer.raceBounces, 3, "the Fibonacci sequence should advance once per qualifying bounce");
  assert.equal(composedRaceDamage(racer), 2);
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["lazer"], ["orbital"]],
    raceTeamOptions: [{ lazer: { comboAbilities: ["fibonacci"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 55104,
  });
  const lazer = sim.fighters.find((fighter) => fighter.raceOrbId === "lazer");
  const healthBeforeBounce = lazer.raceLayerHealth[0];
  lazer.raceBounces = 4;
  resolveRaceBounce(sim, lazer);
  assert.equal(lazer.raceDamage, 5, "Lazer + Fibonacci should use the fifth Fibonacci value after four prior bounces");
  assert.equal(lazer.raceLayerHealth[0], healthBeforeBounce, "Lazer's base body collision must remain projectile-only");
  lazer.raceX = 0.5;
  lazer.raceY = 0.1;
  lazer.raceLaserAngle = 0;
  for (let step = 0; step < 130; step += 1) {
    stepSimulation(sim, 1 / 120);
    // Hold the ray on the wall so this test isolates the interval contract
    // from the separate slow-rotation contract.
    lazer.raceLaserAngle = 0;
  }
  assert.ok(lazer.raceLayerHealth[0] < healthBeforeBounce, "the borrowed Fibonacci beam should damage the active wall");
  assert.ok(sim.events.some((event) => event.type === "race-laser-hit" && event.raceAbilityId === "lazer"));
  assert.equal(raceUsesProjectileOnlyBodyDamage(lazer), true);
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["orbital"]],
    raceTeamOptions: [{ speed: { comboAbilities: ["lazer"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 551041,
  });
  const speed = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const healthBeforeBounce = speed.raceLayerHealth[0];
  resolveRaceBounce(sim, speed);
  assert.equal(speed.raceLayerHealth[0], healthBeforeBounce, "a Lazer combo must remain projectile-only on body bounce");
  assert.equal(raceUsesProjectileOnlyBodyDamage(speed), true);
  assert.ok(speed.raceAbilityIds.includes("lazer"));
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["sticky"], ["orbital"]],
    raceTeamOptions: [{ sticky: { comboAbilities: ["fibonacci"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 55105,
  });
  const sticky = sim.fighters.find((fighter) => fighter.raceOrbId === "sticky");
  sticky.raceBounces = 4;
  resolveRaceBounce(sim, sticky);
  const effectsAfterBounce = sticky.raceBounceEffects.length;
  const bouncesAfterLanding = sticky.raceBounces;
  const levelAfterLanding = sticky.raceStickyLevel;
  const damageAfterLanding = sticky.raceDamage;
  const healthBeforeSticky = sticky.raceLayerHealth[0];
  stepSimulation(sim, 0.05);
  assert.equal(sticky.raceDamage, 5, "Sticky ticks should use Fibonacci damage after the fifth qualifying bounce");
  assert.ok(
    Math.abs(healthBeforeSticky - sticky.raceLayerHealth[0] - 5) < 1e-9,
    "Sticky + Fibonacci should apply its composed damage value across half of a level-one hold at the faster cadence",
  );
  assert.equal(sticky.raceBounces, bouncesAfterLanding, "Sticky ticks must not advance the bounce counter");
  assert.equal(sticky.raceStickyLevel, levelAfterLanding, "Sticky ticks must not advance the stick ramp");
  assert.equal(damageAfterLanding, sticky.raceDamage, "Sticky ticks must not mutate the Fibonacci damage policy");
  assert.equal(sticky.raceBounceEffects.length, effectsAfterBounce, "Sticky ticks must not create bounce effects");
  assert.ok(sim.events.some((event) => event.type === "race-sticky-tick" && event.raceAbilityId === "sticky"));
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["orbital"]],
    raceTeamOptions: [{ speed: { count: 3 } }, { orbital: { count: 1 } }],
    raceLayerStrengths: [1, 1, 1],
    seed: 551051,
  });
  const winningTeam = sim.raceTeams[0];
  const winner = sim.fighters.find((fighter) => fighter.raceTeamIndex === 0);
  assert.equal(sim.fighters.filter((fighter) => fighter.raceTeamIndex === 0).length, 3);
  assert.equal(winningTeam.name, "3× SPEEDSTER");
  winningTeam.raceLayerIndex = 2;
  winningTeam.raceLayerHealth.splice(0, 3, 0, 0, 1);
  sim.fighters
    .filter((fighter) => fighter.raceTeamIndex === 0)
    .forEach((fighter) => { fighter.raceLayerIndex = 2; });
  resolveRaceBounce(sim, winner, winner, 2);
  winner.raceY = 0.99;
  winner.raceVy = 1;
  stepSimulation(sim, 1 / 120);
  assert.equal(sim.winningRaceTeamIndex, 0, "unequal quantity teams should still award the win to the first finisher");
  assert.equal(sim.winner.id, winner.id);
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["mines"], ["orbital"]],
    raceTeamOptions: [{ mines: { comboAbilities: ["speed"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 55106,
  });
  const splodey = sim.fighters.find((fighter) => fighter.raceOrbId === "mines");
  const healthBeforeBounce = splodey.raceLayerHealth[0];
  const speedBeforeBounce = splodey.raceSpeed;
  resolveRaceBounce(sim, splodey);
  assert.equal(splodey.raceLayerHealth[0], healthBeforeBounce, "Splodey's base body collision must remain projectile-only");
  assert.ok(splodey.raceSpeed > speedBeforeBounce, "Splodey + Speedster must ramp movement");
  assert.equal(splodey.raceMineDamage, 1, "Splodey bomb damage should follow its own first bounce ramp");
  splodey.raceMineCooldown = 0;
  stepOrbRace(sim, 1 / 120);
  assert.ok(splodey.raceMineProjectiles.length > 0, "Splodey + Speedster must still fire bomb volleys");
  assert.ok(sim.events.some((event) => event.type === "race-mine-drop" && event.raceAbilityId === "mines"));
  assert.ok(splodey.raceMineProjectiles.every((projectile) => projectile.damage === splodey.raceMineDamage));
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["orbital"]],
    raceTeamOptions: [{ speed: { comboAbilities: ["mines"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 551061,
  });
  const speed = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const healthBeforeBounce = speed.raceLayerHealth[0];
  resolveRaceBounce(sim, speed);
  assert.equal(speed.raceLayerHealth[0], healthBeforeBounce, "a Splodey combo must remain projectile-only on body bounce");
  assert.equal(raceUsesProjectileOnlyBodyDamage(speed), true);
  speed.raceMineCooldown = 0;
  stepOrbRace(sim, 1 / 120);
  assert.ok(speed.raceMineProjectiles.length > 0);
  assert.ok(speed.raceMineProjectiles.every((projectile) => projectile.ownerId === speed.id && projectile.teamIndex === speed.raceTeamIndex));
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["mines"], ["orbital"]],
    raceTeamOptions: [{ mines: { comboAbilities: ["slammy"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 551062,
  });
  const splodey = sim.fighters.find((fighter) => fighter.raceOrbId === "mines");
  const healthBeforeBounce = splodey.raceLayerHealth[0];
  resolveRaceBounce(sim, splodey);
  assert.equal(splodey.raceDamage, 3, "Slammy should provide the first boosted Splodey damage value");
  assert.equal(splodey.raceMineDamage, 3, "Slammy damage should power Splodey bombs");
  assert.equal(splodey.raceLayerHealth[0], healthBeforeBounce, "Slammy should not add body bounce damage to Splodey");
  splodey.raceMineCooldown = 0;
  stepOrbRace(sim, 1 / 120);
  assert.ok(splodey.raceMineProjectiles.length > 0);
  assert.ok(splodey.raceMineProjectiles.every((projectile) => projectile.damage === 3), "Slammy damage should reach every bomb in the volley");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["orbital"]],
    raceTeamOptions: [{ speed: { comboAbilities: ["sticky"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 551071,
  });
  const speed = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  resolveRaceBounce(sim, speed);
  const bouncesAfterLanding = speed.raceBounces;
  stepOrbRace(sim, 1 / 120);
  assert.ok(sim.events.some((event) => event.type === "race-sticky-tick" && event.raceAbilityId === "sticky"));
  assert.equal(speed.raceBounces, bouncesAfterLanding, "borrowed Sticky ticks must not advance the base orb's bounce counter");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["gravity"], ["orbital"]],
    raceTeamOptions: [{ gravity: { comboAbilities: ["grower"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 55107,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "gravity");
  const scaleBefore = racer.raceOrbScale;
  resolveRaceBounce(sim, racer);
  assert.equal(racer.raceGravityLevel, 1, "Gravity should ramp when it is the base ability");
  assert.equal(racer.raceGravityMode, "LEVEL 1");
  assert.equal(racer.raceOrbScale, scaleBefore + 0.05, "borrowed Grower should ramp by 5% on the same bounce");
  assert.ok(racer.raceBounceHeight < 0.13, "Gravity should change the real rebound arc");
  assert.ok(sim.events.some((event) => event.type === "race-gravity-change" && event.raceAbilityId === "gravity"));
}

{
  const unarmedSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["unarmed"], ["orbital"]],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 5510711,
  });
  const unarmed = unarmedSim.fighters.find((fighter) => fighter.raceOrbId === "unarmed");
  const startingDamage = unarmed.raceDamage;
  const startingSpeed = unarmed.raceSpeed;
  const startingTravelSpeed = unarmed.raceTravelSpeed;
  const startingVerticalSpeed = unarmed.raceVerticalSpeed;
  const startingHorizontalSpeed = Math.abs(unarmed.raceVx);
  resolveRaceBounce(unarmedSim, unarmed);
  resolveRaceBounce(unarmedSim, unarmed);
  assert.equal(unarmed.raceDamage, startingDamage + 2, "Unarmed should gain damage on every bounce");
  assert.equal(unarmed.raceSpeed, startingSpeed + 2, "Unarmed should gain speed on every bounce");
  assert.equal(unarmed.raceTravelSpeed, startingTravelSpeed, "Unarmed should keep horizontal travel speed fixed");
  assert.ok(unarmed.raceVerticalSpeed > startingVerticalSpeed, "Unarmed should increase vertical launch speed");
  assert.equal(Math.abs(unarmed.raceVx), startingHorizontalSpeed, "Unarmed should not accelerate horizontally");

  const slammySim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["slammy"], ["orbital"]],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 5510712,
  });
  const slammy = slammySim.fighters.find((fighter) => fighter.raceOrbId === "slammy");
  resolveRaceBounce(slammySim, slammy);
  assert.equal(slammy.raceDamage, 3, "Slammy should add an extra damage ramp on its first bounce");
  resolveRaceBounce(slammySim, slammy);
  assert.equal(slammy.raceDamage, 5, "Slammy should continue its damage ramp on later bounces");

  const comboSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["orbital"]],
    raceTeamOptions: [{ speed: { comboAbilities: ["slammy"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 5510713,
  });
  const combo = comboSim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const comboHealth = combo.raceLayerHealth[0];
  resolveRaceBounce(comboSim, combo);
  assert.ok(raceHasAbility(combo, "slammy"));
  assert.equal(combo.raceDamage, 3, "Borrowed Slammy should use its damage ramp without replacing Speedster");
  assert.ok(combo.raceLayerHealth[0] < comboHealth, "Slammy should only boost the non-weapon base orb's bounce damage");

  const weaponComboSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["drill"], ["orbital"]],
    raceTeamOptions: [{ drill: { comboAbilities: ["slammy"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 55107131,
  });
  const weaponCombo = weaponComboSim.fighters.find((fighter) => fighter.raceOrbId === "drill");
  const weaponComboHealth = weaponCombo.raceLayerHealth[0];
  resolveRaceBounce(weaponComboSim, weaponCombo);
  assert.equal(weaponCombo.raceDamage, 3, "Slammy should boost a weapon combo's damage value");
  assert.equal(weaponCombo.raceLayerHealth[0], weaponComboHealth, "Slammy should not add body bounce damage to a weapon combo");
  weaponComboSim.raceOpeningWeaponsFired = true;
  weaponCombo.raceDrillProjectiles = [];
  weaponCombo.raceDrills = 0;
  weaponCombo.raceDrillNextFireAt = weaponComboSim.time;
  weaponCombo.raceY = raceLayerLineY(weaponCombo.raceLayerIndex) - RACE_ORB_RADIUS * weaponCombo.raceOrbScale;
  weaponCombo.raceVy = 0;
  stepOrbRace(weaponComboSim, 1 / 120);
  assert.equal(weaponCombo.raceDrillProjectiles[0]?.damagePerSecond, 5, "Slammy damage should power Drill projectiles");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["ying-yang"], ["orbital"]],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 5510714,
  });
  const yinYang = sim.fighters.find((fighter) => fighter.raceOrbId === "ying-yang");
  resolveRaceBounce(sim, yinYang);
  assert.equal(yinYang.raceYingYangMode, "damage");
  assert.equal(yinYang.raceYingYangDamageLevel, 1, "Ying Yang should ramp damage while in damage mode");
  assert.equal(yinYang.raceYingYangSpeedLevel, 0);
  const damageAfterDamageModeBounce = yinYang.raceDamage;

  sim.time = 5;
  stepOrbRace(sim, 1 / 120);
  assert.equal(yinYang.raceYingYangMode, "speed", "Ying Yang should switch to speed mode after five seconds");
  const damageLevelAtSpeedSwitch = yinYang.raceYingYangDamageLevel;
  assert.equal(yinYang.raceDamage, damageAfterDamageModeBounce, "speed mode should keep Ying Yang's earned damage");
  assert.equal(yinYang.raceSpeed, 1, "speed mode should start before its separate speed counter advances");
  assert.equal(yinYang.raceTravelSpeed, 0.68, "speed mode should start at unboosted travel speed");
  resolveRaceBounce(sim, yinYang);
  assert.equal(yinYang.raceYingYangDamageLevel, damageLevelAtSpeedSwitch, "damage ramp should pause in speed mode");
  assert.equal(yinYang.raceDamage, damageAfterDamageModeBounce, "speed mode should preserve the damage ramp after its bounce");
  assert.equal(yinYang.raceYingYangSpeedLevel, 1, "speed mode should ramp its separate speed counter");
  assert.equal(yinYang.raceSpeed, 2, "speed mode should expose only its speed ramp");
  assert.ok(yinYang.raceTravelSpeed > 0.68, "speed mode should increase physical travel speed");

  sim.time = 10;
  stepOrbRace(sim, 1 / 120);
  assert.equal(yinYang.raceYingYangMode, "damage", "Ying Yang should return to damage mode after another five seconds");
  assert.equal(yinYang.raceDamage, damageAfterDamageModeBounce, "damage mode should restore only the independent damage ramp");
  assert.equal(yinYang.raceSpeed, 2, "damage mode should keep the speed buff earned in speed mode");
  assert.ok(yinYang.raceTravelSpeed > 0.68, "damage mode should keep the earned physical travel speed");
  resolveRaceBounce(sim, yinYang);
  assert.equal(yinYang.raceYingYangDamageLevel, damageLevelAtSpeedSwitch + 1);
  assert.equal(yinYang.raceYingYangSpeedLevel, 1);
  assert.equal(yinYang.raceDamage, damageAfterDamageModeBounce + 1, "damage mode should resume its separate damage ramp");
  assert.equal(yinYang.raceSpeed, 2, "damage mode should retain the speed ramp while damage advances");
  assert.ok(sim.events.some((event) => event.type === "race-ying-yang-switch" && event.mode === "speed"));
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["poison"], ["orbital"]],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 5510715,
  });
  const poison = sim.fighters.find((fighter) => fighter.raceOrbId === "poison");
  const openingHealth = poison.raceLayerHealth[0];
  resolveRaceBounce(sim, poison);
  const firstBounce = sim.events.findLast((event) => event.type === "race-bounce" && event.fighterId === poison.id);
  assert.equal(firstBounce.damage, 0, "Poison should deal zero direct bounce damage");
  assert.equal(poison.raceLayerHealth[0], openingHealth);
  assert.equal(poison.racePoisonActiveTicks, 1, "the first poison bounce should arm one poison tick");
  assert.equal(poison.racePoisonDamagePerTick, 1);
  assert.equal(poison.racePoisonActiveDamage, 1);
  assert.equal(poison.racePoisonDamage, 2, "Poison should expose the next tick count after its first bounce");
  assert.ok(sim.events.some((event) => event.type === "race-poison-applied" && event.ticks === 1 && event.damagePerTick === 1));

  stepSimulation(sim, 0.1);
  assert.equal(poison.raceLayerHealth[0], openingHealth - 1, "one poison tick should deal one damage");
  resolveRaceBounce(sim, poison);
  assert.equal(poison.racePoisonActiveTicks, 2, "the second poison bounce should arm two poison ticks");
  assert.equal(poison.racePoisonActiveDamage, 2);
  stepSimulation(sim, 0.1);
  assert.equal(poison.raceLayerHealth[0], openingHealth - 3, "two poison ticks should each deal one damage");
  assert.equal(poison.racePoisonTotal, 3);
  const poisonReplay = captureReplayFrame(sim).fighters.find((fighter) => fighter.raceOrbId === "poison");
  assert.ok(poison.racePoisonActiveTicks >= 2);
  assert.deepEqual(
    [poisonReplay.racePoisonActiveTicks, poisonReplay.racePoisonDamagePerTick, poisonReplay.racePoisonTickInterval],
    [poison.racePoisonActiveTicks, 1, 0.1],
    "Poison tick stacks must survive replay capture",
  );
  assert.ok(poison.raceBounceEffects.some((effect) => effect.poison === true && effect.tick === true), "Poison ticks should emit expanding ring effects");
  assert.ok(sim.events.some((event) => event.type === "race-poison-tick" && event.ticks === 2 && event.tick === 2 && event.damagePerTick === 1 && event.amount === 1));
  assert.equal(poison.raceDamage, 0, "Poison's direct body damage should remain zero while its poison channel ramps");

  const comboSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["orbital"]],
    raceTeamOptions: [{ speed: { comboAbilities: ["poison"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 5510716,
  });
  const combo = comboSim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const comboHealth = combo.raceLayerHealth[0];
  resolveRaceBounce(comboSim, combo);
  assert.ok(raceHasAbility(combo, "poison"));
  assert.equal(combo.raceLayerHealth[0], comboHealth, "a Poison combo must remain projectile-only on body bounce");
  assert.equal(raceUsesProjectileOnlyBodyDamage(combo), true);
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["unarmed", "poison"], ["ying-yang", "slammy"]],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 5510717,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  for (let step = 0; step < 720; step += 1) {
    stepSimulation(first, 1 / 120);
    stepSimulation(second, 1 / 120);
  }
  assert.deepEqual(first.events, second.events, "new Orb Race abilities should preserve deterministic event streams");
  assert.deepEqual(
    first.fighters.map((fighter) => [fighter.id, fighter.raceOrbId, fighter.raceDamage, fighter.raceYingYangMode, fighter.racePoisonTotal]),
    second.fighters.map((fighter) => [fighter.id, fighter.raceOrbId, fighter.raceDamage, fighter.raceYingYangMode, fighter.racePoisonTotal]),
  );
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["hydrogen-bomb"], ["speed"]],
    raceLayerStrengths: [999_999_999_999, 999_999_999_999, 999_999_999_999],
    seed: 5510718,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  const third = createSimulation(options);
  const bomb = first.fighters.find((fighter) => fighter.raceOrbId === "hydrogen-bomb");
  const other = first.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const openingHealth = bomb.raceLayerHealth[0];
  resolveRaceBounce(first, bomb);
  assert.equal(bomb.raceDamage, 0, "Hydrogen Bomb should remain at zero direct damage after a bounce");
  assert.equal(bomb.raceLayerHealth[0], openingHealth, "Hydrogen Bomb should not damage a layer on impact");

  stepSimulation(first, 1 / 120);
  const countdownStart = first.events.find((event) => event.type === "race-hydrogen-bomb-countdown-start");
  assert.equal(countdownStart.countdownSeconds, 60);
  assert.ok(bomb.raceHydrogenCountdownProgress > 0 && bomb.raceHydrogenCountdownProgress < 1);
  for (let step = 0; step < 7199; step += 1) {
    stepSimulation(first, 1 / 120);
  }
  assert.equal(first.raceHydrogenBombExploded, false, "Hydrogen Bomb must not detonate before sixty fixed-step seconds");
  for (let step = 0; step < 4 && !first.raceHydrogenBombExploded; step += 1) {
    stepSimulation(first, 1 / 120);
  }
  assert.equal(first.raceHydrogenBombExploded, true, "Hydrogen Bomb should detonate at the fixed-step countdown limit");
  assert.equal(first.raceHydrogenBombExplosionElapsed, 0);
  assert.ok(first.raceHydrogenBombExplosionUntil > first.time);
  assert.ok(first.events.some((event) => event.type === "race-hydrogen-bomb-explosion" && event.flashSeconds === 4));
  assert.ok(first.events.some((event) => event.type === "race-hydrogen-bomb-flash-start" && event.flashSeconds === 4));
  assert.deepEqual(first.raceTeams.map((team) => team.raceLayerHealth), [
    [0, 0, 0],
    [0, 0, 0],
  ], "Hydrogen Bomb should clear every shared layer without leaving zero walls active");
  assert.equal(other.alive, false);
  assert.equal(other.raceDestroyedByHydrogenBomb, true);
  assert.equal(other.raceFinished, true);
  assert.equal(bomb.raceReadyToFinish, true);
  assert.equal(bomb.raceVy, 0, "the bomb should hold still during the white flash");
  const bombYDuringFlash = bomb.raceY;
  stepSimulation(first, 1 / 120);
  assert.equal(bomb.raceY, bombYDuringFlash, "the bomb should not fall behind the white flash");
  while (first.raceHydrogenBombExplosionElapsed < 4 - 1 / 240) stepSimulation(first, 1 / 120);
  assert.equal(bomb.raceVy, 0, "the bomb should wait until the flash has ended before falling");
  stepSimulation(first, 1 / 120);
  assert.ok(bomb.raceVy > 0, "the bomb should visibly fall after the flash instead of bouncing on a cleared layer");
  assert.ok(bomb.raceY > bombYDuringFlash, "the bomb should move down after the flash");
  assert.deepEqual(first.fighters.map((fighter) => fighter.id), ["fighter-0", "fighter-1"], "detonation must not create orb IDs");

  for (let step = 0; step < 1000 && !first.finished; step += 1) {
    stepSimulation(first, 1 / 120);
  }
  assert.equal(first.finished, true);
  assert.equal(first.winner.raceOrbId, "hydrogen-bomb");
  assert.ok(first.events.some((event) => event.type === "race-finish" && event.winnerId === bomb.id));

  for (let step = 0; step < 8200; step += 1) {
    stepSimulation(second, 1 / 120);
    stepSimulation(third, 1 / 120);
  }
  assert.deepEqual(captureReplayFrame(second), captureReplayFrame(third), "Hydrogen Bomb replay state should remain deterministic for a seed");
  assert.equal(second.raceHydrogenBombExploded, true);
  assert.equal(second.winner?.raceOrbId, "hydrogen-bomb");
  assert.deepEqual(
    second.events.map((event) => event.type),
    third.events.map((event) => event.type),
    "Hydrogen Bomb countdown and detonation events should be deterministic for a seed",
  );
}

function arrangeWeaponHit(attacker, target) {
  attacker.x = 350;
  attacker.y = 280;
  attacker.vx = attacker.baselineSpeed;
  attacker.vy = 0;
  attacker.weaponAngle = 0;
  attacker.cooldown = 999;
  target.x = 420;
  target.y = 280;
  target.vx = target.baselineSpeed;
  target.vy = 0;
  target.cooldown = 999;
  target.weaponAngle = Math.PI / 2;
  target.weaponLastHit[attacker.id] = 999;
}

{
  const sim = createSimulation({ count: 4, seed: 1234 });
  assert.equal(sim.fighters.length, 2, "Classic is permanently a 1v1 mode");
  assert.deepEqual(sim.fighters.map((fighter) => fighter.type), ["sword", "orbital"]);
  assert.ok(sim.fighters.every((fighter) => fighter.health === 100));
  assert.ok(sim.fighters.every((fighter) => Number.isFinite(fighter.weaponAngle)));
  assert.ok(sim.fighters.every((fighter) => fighter.baselineSpeed === ORB_BASE_SPEED * 0.75));
  assert.equal(sim.fighters[0].classicLaunchAngle, sim.fighters[1].classicLaunchAngle, "Classic fighters should share one seeded launch angle");
  assert.ok(Math.abs(sim.fighters[0].vx - sim.fighters[1].vx) < 1e-9 && Math.abs(sim.fighters[0].vy - sim.fighters[1].vy) < 1e-9, "Classic fighters should launch in the same random direction");
  assert.equal(ORB_BASE_SPEED, 594, "standard orb movement should be 1.5x the previous speed");
  assert.equal(WEAPON_REACH_SCALE, 2.13, "weapon reach should be 1.5x the previous scale");
  assert.equal(WEAPON_ROTATION_SCALE, 1.75, "weapon rotation should use the new 1.75x default scale");
  assert.ok(sim.fighters.every((fighter) => fighter.radius === ORB_RADIUS));
  assert.equal(ORB_RADIUS, 42);
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 2026 });
  const [fire, target] = sim.fighters;
  const openingDamage = fire.damage;
  const openingAbilityDamage = fire.abilityValue;
  arrangeWeaponHit(fire, target);
  target.x = 460;
  stepSimulation(sim, 1 / 120);
  assert.equal(fire.damage, openingDamage + CLASS_DEFS.fire.progression.damagePerHit);
  assert.equal(fire.weapon.damage, fire.damage, "weapon damage should stay in sync with the displayed ramp value");
  assert.equal(fire.abilityValue, openingAbilityDamage + CLASS_DEFS.fire.progression.ability.perHit);
}

{
  const sim = createSimulation({ count: 2, classes: ["aegis", "fire"], seed: 2027 });
  const [aegis, target] = sim.fighters;
  aegis.x = 350;
  aegis.y = target.y = 280;
  target.x = aegis.x + aegis.radius + target.radius - 1;
  aegis.vx = aegis.vy = target.vx = target.vy = 0;
  aegis.baselineSpeed = target.baselineSpeed = 0;
  stepSimulation(sim, 1 / 120);
  assert.equal(aegis.abilityRate, 1.1, "rate-based abilities should accelerate after a successful hit");
}

{
  const sim = createSimulation({ count: 8, seed: 1234 });
  assert.equal(sim.fighters.length, 2, "Classic no longer enters a crowd profile");
  assert.ok(sim.fighters.every((fighter) => fighter.baselineSpeed === ORB_BASE_SPEED * 0.75));
  assert.ok(sim.fighters.every((fighter) => fighter.radius === ORB_RADIUS));
}

{
  const sim = createSimulation({ count: 1, classes: ["fire"], seed: 42 });
  const [fighter] = sim.fighters;
  fighter.x = 360;
  fighter.y = 360;
  fighter.vx = 0;
  fighter.vy = -300;
  const startY = fighter.y;
  stepSimulation(sim, 0.2);
  assert.ok(fighter.vy > -300, "gravity should reduce upward velocity instead of preserving constant speed");
  assert.ok(fighter.y < startY, "the orb should still move upward during the first part of the arc");
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 420 });
  const [left, right] = sim.fighters;
  left.x = 240;
  right.x = 650;
  left.y = right.y = 260;
  left.vx = left.vy = right.vx = right.vy = 0;
  stepSimulation(sim, 1 / 120);
  assert.equal(left.vx, 0, "classic orbs should not accelerate toward nearby opponents");
  assert.equal(right.vx, 0, "classic orbs should not gravitate toward nearby opponents");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: WORLD_CUP_MODE,
    countries: ["france", "brazil"],
    seed: 421,
  });
  const [fighter, other] = sim.fighters;
  fighter.x = 300;
  fighter.y = 220;
  fighter.vx = 90;
  fighter.vy = -60;
  fighter.lastOrbCollisionAt = -Infinity;
  other.x = 700;
  other.y = 480;
  other.vx = other.vy = 0;
  const speedBefore = Math.hypot(fighter.vx, fighter.vy);
  run(sim, 1);
  assert.ok(
    Math.hypot(fighter.vx, fighter.vy) < speedBefore * 0.9,
    "orbs should slowly lose momentum while they have not collided with another orb",
  );
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 303 });
  sim.fighters.forEach((fighter) => {
    fighter.health = 10000;
    fighter.maxHealth = 10000;
    fighter.weapon.damage = 0;
  });
  run(sim, 90.1);
  assert.equal(sim.overtimeStarted, true);
  assert.equal(sim.events.filter((event) => event.type === "forge-overtime").length, 1);
}

{
  const a = createSimulation({ count: 4, seed: 777 });
  const b = createSimulation({ count: 4, seed: 777 });
  run(a, 6);
  run(b, 6);
  assert.deepEqual(
    a.fighters.map((fighter) => [fighter.health, fighter.x, fighter.y, fighter.weaponAngle]),
    b.fighters.map((fighter) => [fighter.health, fighter.x, fighter.y, fighter.weaponAngle]),
  );
}

{
  const a = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 777, spawnSeed: 11 });
  const b = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 777, spawnSeed: 12 });
  const replay = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 777, spawnSeed: 11 });
  const positions = (sim) => sim.fighters.map(({ x, y }) => [x, y]);
  assert.notDeepEqual(positions(a), positions(b), "fresh spawn seeds should produce different starting positions");
  assert.deepEqual(positions(a), positions(replay), "a recorded spawn seed should reproduce its starting positions");
  const center = { x: a.arenaBounds.x + a.arenaBounds.width / 2, y: a.arenaBounds.y + a.arenaBounds.height / 2 };
  const [left, right] = a.fighters;
  assert.ok(Math.abs((left.x + right.x) / 2 - center.x) < 1e-9);
  assert.ok(Math.abs((left.y + right.y) / 2 - center.y) < 1e-9);
}

{
  const sim = createSimulation({ count: 4, seed: 888, arenaShape: "circle" });
  const center = { x: sim.arenaBounds.x + sim.arenaBounds.width / 2, y: sim.arenaBounds.y + sim.arenaBounds.height / 2 };
  const radius = sim.arenaBounds.width / 2;
  assert.equal(sim.arenaShape, "circle");
  for (const fighter of sim.fighters) {
    assert.ok(
      Math.hypot(fighter.x - center.x, fighter.y - center.y) <= radius - fighter.radius + 1e-9,
      "circle arena spawns should stay inside the curved wall",
    );
  }
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 999, arenaShape: "circle" });
  const [fighter] = sim.fighters;
  const center = { x: sim.arenaBounds.x + sim.arenaBounds.width / 2, y: sim.arenaBounds.y + sim.arenaBounds.height / 2 };
  const radius = sim.arenaBounds.width / 2 - fighter.radius;
  fighter.x = center.x + radius + 12;
  fighter.y = center.y;
  fighter.vx = 180;
  fighter.vy = 90;
  stepSimulation(sim, 1 / 120);
  assert.ok(fighter.x <= center.x + radius + 1e-9, "circle wall should clamp the fighter back inside");
  assert.ok(fighter.vx < 0, "circle wall should reflect outward velocity back inward");
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 404, features: { hitStop: true } });
  const [left, right] = sim.fighters;
  left.x = 300;
  left.y = 360;
  left.vx = 0;
  left.vy = 0;
  left.weaponAngle = 0;
  left.weapon.angularSpeed = 0;
  right.x = 600;
  right.y = 360;
  right.vx = 0;
  right.vy = 0;
  right.weaponAngle = Math.PI;
  right.weapon.angularSpeed = 0;

  stepSimulation(sim, 1 / 1000);

  const clash = sim.events.find((event) => event.type === "weapon-clash");
  assert.ok(clash, "overlapping weapon hitboxes should emit a weapon clash");
  assert.ok(sim.effects.some((effect) => effect.kind === "weapon-clash"), "weapon clashes should create a visible spark");
  assert.ok(sim.weaponClashPauseUntil > sim.time, "weapon clashes should briefly pause the simulation");
  assert.ok(left.vx < 0, "left orb should rebound away from the clash");
  assert.ok(right.vx > 0, "right orb should rebound away from the clash");
  const frozenX = left.x;
  stepSimulation(sim, 1 / 120);
  assert.equal(left.x, frozenX, "orb positions should hold during the clash pause");
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 407 });
  const [cinder, target] = sim.fighters;
  target.health = 26;
  target.maxHealth = 100;
  arrangeWeaponHit(cinder, target);
  cinder.weaponLastHit[target.id] = -Infinity;
  stepSimulation(sim, 1 / 120);
  assert.equal(target.lastStand, true, "fighters should enter last stand once below 25% health while alive");
  assert.equal(sim.events.filter((event) => event.type === "last-stand" && event.fighterId === target.id).length, 1);
  target.health = 20;
  arrangeWeaponHit(cinder, target);
  cinder.weaponLastHit[target.id] = -Infinity;
  stepSimulation(sim, 1 / 120);
  assert.equal(
    sim.events.filter((event) => event.type === "last-stand" && event.fighterId === target.id).length,
    1,
    "last stand should not announce more than once",
  );
}

{
  const sim = createSimulation({ count: 2, classes: ["static", "fire"], seed: 408 });
  const [staticOrb] = sim.fighters;
  staticOrb.lastStand = true;
  staticOrb.x = ARENA.padding + staticOrb.radius - 2;
  staticOrb.y = 360;
  staticOrb.vx = -staticOrb.baselineSpeed;
  staticOrb.vy = 0;
  stepSimulation(sim, 1 / 120);
  assert.ok(staticOrb.staticCharge >= 36, "Static last stand should strengthen wall-bounce charge");
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 405, features: { hitStop: true } });
  const [attacker, target] = sim.fighters;
  attacker.x = 350;
  attacker.y = 280;
  attacker.vx = 0;
  attacker.vy = 0;
  attacker.weaponAngle = 0;
  attacker.weapon.angularSpeed = 0;
  target.x = 420;
  target.y = 280;
  target.vx = 0;
  target.vy = 0;
  target.weaponAngle = Math.PI;
  target.weapon.angularSpeed = 0;
  target.weaponLastHit[attacker.id] = 999;

  stepSimulation(sim, 1 / 1000);

  assert.ok(
    sim.events.some((event) => event.type === "weapon-hit"),
    "a blade entering the orb body should remain a hit",
  );
  assert.equal(
    sim.events.some((event) => event.type === "weapon-clash"),
    false,
    "a body hit should not also trigger a weapon clash",
  );
  assert.equal(sim.weaponClashPauseUntil, 0, "body hits should not use the clash pause");
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 406 });
  const [attacker, target] = sim.fighters;
  attacker.x = 300;
  attacker.y = 360;
  attacker.vx = 0;
  attacker.vy = 0;
  attacker.weaponAngle = 0;
  attacker.weapon.angularSpeed = 0;
  target.x = 430;
  target.y = 360;
  target.vx = target.baselineSpeed;
  target.vy = 0;
  target.weaponAngle = 0;
  target.weapon.angularSpeed = 0;

  stepSimulation(sim, 1 / 1000);

  assert.equal(target.flashKind, "regular", "weapon hits should not use a critical backstab flash");
  assert.equal(sim.events.some((event) => event.type === "backstab"), false, "rear attacks should no longer create backstab events");
}

{
  let contacts = 0;
  let topWallHits = 0;
  let totalWallHits = 0;
  for (let seed = 1; seed <= 8; seed += 1) {
    const sim = createSimulation({ count: 4, seed });
    let lastEventId = 0;
    for (let step = 0; step < 20 / (1 / 120) && !sim.finished; step += 1) {
      stepSimulation(sim, 1 / 120);
      for (const event of sim.events) {
        if (event.id <= lastEventId) continue;
        if (["weapon-hit", "collision-hit"].includes(event.type)) contacts += 1;
        if (event.type === "wall-hit") {
          totalWallHits += 1;
          if (event.y <= sim.arenaBounds.y + sim.fighters[0].radius + 1) topWallHits += 1;
        }
        lastEventId = Math.max(lastEventId, event.id);
      }
    }
  }
  assert.ok(contacts >= 8, "the fixed Classic 1v1 opening should sustain combat contact across seeds");
  assert.ok(topWallHits <= totalWallHits * 0.4, "top-wall hits should remain bounded at the higher movement speed");
}

{
  const sim = createSimulation({ count: 1, classes: ["fire"], seed: 44 });
  const [fighter] = sim.fighters;
  fighter.x = 360;
  fighter.y = ARENA.padding + fighter.radius - 2;
  fighter.vx = 0;
  fighter.vy = -fighter.baselineSpeed * 1.8;
  stepSimulation(sim, 1 / 120);
  assert.ok(sim.events.some((event) => event.type === "wall-hit" && event.y <= ARENA.padding + fighter.radius + 1));
  assert.ok(Math.hypot(fighter.vx, fighter.vy) <= fighter.baselineSpeed * 2.11, "top-wall bounce should respect the velocity cap");
}

{
  const sim = createSimulation({ count: 8, seed: 91 });
  run(sim, 30);
  for (const fighter of sim.fighters) {
    assert.ok(Number.isFinite(fighter.x) && Number.isFinite(fighter.y));
    assert.ok(fighter.x >= ARENA.padding && fighter.x <= ARENA.width - ARENA.padding);
    assert.ok(fighter.y >= ARENA.padding && fighter.y <= ARENA.height - ARENA.padding);
    assert.ok(fighter.health >= 0 && fighter.health <= 100);
  }
}

{
  const sim = createSimulation({ count: 1, classes: ["fire"], seed: 43 });
  const [fighter] = sim.fighters;
  fighter.x = 360;
  fighter.y = ARENA.height - ARENA.padding - fighter.radius + 2;
  fighter.vx = 0;
  fighter.vy = 140;
  stepSimulation(sim, 1 / 120);
  assert.ok(fighter.vy < -fighter.baselineSpeed * 1.35, "floor impacts should launch orbs back with extra momentum");
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 9 });
  const [a, b] = sim.fighters;
  a.cooldown = b.cooldown = 999;
  a.x = 430;
  b.x = 479;
  a.y = b.y = 280;
  a.weaponAngle = Math.PI / 2;
  b.weaponAngle = -Math.PI / 2;
  a.weaponLastHit[b.id] = 999;
  b.weaponLastHit[a.id] = 999;
  a.vx = a.baselineSpeed;
  b.vx = -b.baselineSpeed;
  a.vy = b.vy = 0;
  const totalMomentumBefore = a.vx + b.vx;
  stepSimulation(sim, 1 / 120);
  const totalMomentumAfter = a.vx + b.vx;
  assert.equal(a.health, 100, "body collision must not damage fighter A");
  assert.equal(b.health, 100, "body collision must not damage fighter B");
  assert.equal(a.burnUntil, 0, "body collision must not apply weapon status effects");
  assert.equal(b.slowUntil, 0, "body collision must not apply weapon status effects");
  assert.ok(Math.abs(totalMomentumAfter - totalMomentumBefore) < 0.001, "elastic collision should conserve total momentum");
  assert.ok(a.vx < -a.baselineSpeed * 1.35, "orb collisions should rebound with extra momentum");
  assert.ok(b.vx > b.baselineSpeed * 1.35, "orb collisions should rebound with extra momentum");
  assert.equal(a.lastOrbCollisionAt, sim.time, "orb collisions should refresh momentum retention");
  assert.equal(b.lastOrbCollisionAt, sim.time, "orb collisions should refresh momentum retention");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: KING_OF_HILL_MODE,
    hillContenders: ["red", "euler"],
    seed: 910,
  });
  const [red, euler] = sim.fighters;
  red.x = sim.hill.x;
  red.y = sim.hill.y;
  euler.x = sim.hill.x + sim.hill.radius + 100;
  euler.y = sim.hill.y;
  updateKingOfHill(sim, 1);
  assert.equal(red.hillScore, 10, "a sole hill occupant should earn base control points");
  assert.equal(sim.hill.controllerId, red.id);

  euler.x = sim.hill.x;
  euler.y = sim.hill.y;
  updateKingOfHill(sim, 0.5);
  assert.equal(sim.hill.contested, true);
  assert.equal(red.hillScore, 10, "contested hills should award no points");
  assert.equal(red.hillHoldTime, 0, "contesting should reset the continuous hold timer");
  assert.equal(euler.hillHoldTime, 0);
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: KING_OF_HILL_MODE,
    hillContenders: ["euler", "red"],
    seed: 911,
  });
  const euler = sim.fighters.find((fighter) => fighter.hillContenderId === "euler");
  const opponent = sim.fighters.find((fighter) => fighter !== euler);
  euler.x = sim.hill.x;
  euler.y = sim.hill.y;
  opponent.x = sim.hill.x + sim.hill.radius + 100;
  opponent.y = sim.hill.y;
  for (let index = 0; index < 300; index += 1) updateKingOfHill(sim, 0.01);
  assert.ok(Math.abs(euler.hillScore - 35) < 0.001, "Euler should score 20 base points then 15 boosted points");
  assert.equal(euler.hillMultiplier, 1.5);
  assert.ok(euler.hillHoldTime >= 2);

  opponent.x = sim.hill.x;
  opponent.y = sim.hill.y;
  updateKingOfHill(sim, 0.01);
  assert.equal(euler.hillHoldTime, 0, "the multiplier timer should reset immediately when contested");
  opponent.x = sim.hill.x + sim.hill.radius + 100;
  updateKingOfHill(sim, 0.5);
  assert.ok(euler.hillScore < 41, "scoring should return to 1× after the hold resets");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: KING_OF_HILL_MODE,
    hillContenders: ["red", "blue"],
    seed: 912,
  });
  const fortified = sim.fighters[0];
  fortified.x = sim.hill.x + 80;
  fortified.y = sim.hill.y;
  fortified.vx = 100;
  fortified.vy = 0;
  fortified.hillFortifyTime = 0.35;
  applyHillCollisionResistance(sim, fortified, false);
  assert.ok(Math.abs(fortified.vx - 30) < 0.001, "full fortification should remove 70% of outward velocity");
  fortified.vx = 100;
  applyHillCollisionResistance(sim, fortified, true);
  assert.ok(Math.abs(fortified.vx - 65) < 0.001, "contested fortification should remove only 35% of outward velocity");
  fortified.x = sim.hill.x + sim.hill.radius + 1;
  updateKingOfHill(sim, 0.01);
  assert.equal(fortified.hillFortifyTime, 0, "leaving the hill should clear fortification charge");
}

{
  const options = {
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: KING_OF_HILL_MODE,
    hillContenders: ["pi", "times-two"],
    seed: 913,
    spawnSeed: 44,
  };
  const a = createSimulation(options);
  const b = createSimulation(options);
  run(a, 20);
  run(b, 20);
  assert.deepEqual(
    a.fighters.map((fighter) => [fighter.x, fighter.y, fighter.vx, fighter.vy, fighter.hillScore, fighter.hillHoldTime]),
    b.fighters.map((fighter) => [fighter.x, fighter.y, fighter.vx, fighter.vy, fighter.hillScore, fighter.hillHoldTime]),
    "King of the Hill outcomes should be deterministic for a seed",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: KING_OF_HILL_MODE,
    hillContenders: ["red", "x-squared"],
    seed: 914,
  });
  const red = sim.fighters.find((fighter) => fighter.hillContenderId === "red");
  const opponent = sim.fighters.find((fighter) => fighter !== red);
  red.x = sim.hill.x;
  red.y = sim.hill.y;
  red.hillScore = 99.95;
  opponent.x = sim.hill.x + sim.hill.radius + 100;
  opponent.y = sim.hill.y;
  stepSimulation(sim, 0.01);
  assert.equal(sim.finished, true);
  assert.equal(sim.winner.id, red.id, "the first contender to reach its own target should win");
  assert.equal(red.hillScore, 100);
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["duplicator", "orbital"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3301,
  });
  const duplicator = sim.fighters.find((fighter) => fighter.raceOrbId === "duplicator");
  for (let index = 0; index < 1800 && duplicator.raceDuplicates === 0; index += 1) stepSimulation(sim, 1 / 120);
  assert.ok(duplicator.raceBounces >= 12, "racers should bounce against active number walls");
  assert.equal(duplicator.raceDamage, duplicator.raceBounces + 1, "damage should begin at 1 and increase once per bounce");
  assert.equal(duplicator.raceDuplicates, 1, "duplicators should create a separate orb every twelve number-line bounces");
  assert.equal(duplicator.raceDuplicateBounces, 12, "wall hits should not count toward the duplication threshold");
  const [duplicate] = duplicator.raceDuplicateOrbs;
  assert.notEqual(duplicate.raceX, duplicator.raceX, "the child orb should launch away from its parent");
  for (let index = 0; index < 1800 && duplicate.raceBounces === 0; index += 1) stepSimulation(sim, 1 / 120);
  assert.ok(duplicate.raceBounces > 0, "duplicate orbs should independently bounce and progress");
  assert.ok(
    sim.events.some((event) => event.type === "race-bounce" && event.orbId === duplicate.id),
    "each child impact should identify the bouncing orb for its own collision sound cue",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["duplicator", "orbital"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3302,
  });
  const duplicator = sim.fighters.find((fighter) => fighter.raceOrbId === "duplicator");
  for (let index = 0; index < 11; index += 1) resolveRaceBounce(sim, duplicator);
  duplicator.raceX = 0.01;
  duplicator.raceVx = -0.8;
  stepSimulation(sim, 1 / 120);
  assert.ok(duplicator.raceBounces > 11, "a wall hit should still advance the normal bounce state");
  assert.equal(duplicator.raceDuplicateBounces, 11, "wall hits should be excluded from duplication bounces");
  assert.equal(duplicator.raceDuplicates, 0, "a wall hit should not create a duplicate");
  resolveRaceBounce(sim, duplicator);
  assert.equal(duplicator.raceDuplicateBounces, 12);
  assert.equal(duplicator.raceDuplicates, 1, "the twelfth number-line bounce should create a duplicate");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["orbital", "speed"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3307,
  });
  const orbital = sim.fighters.find((fighter) => fighter.raceOrbId === "orbital");
  const initialDamage = orbital.raceDamage;
  orbital.raceX = orbital.raceOrbScale * 0.045 + 0.001;
  orbital.raceVx = -Math.abs(orbital.raceVx);
  stepSimulation(sim, 1 / 120);
  assert.equal(orbital.raceDamage, initialDamage + 1, "vertical-wall impacts should advance scaled damage");
  assert.equal(orbital.raceOrbiters, 1, "vertical-wall impacts should advance Orbital's ramp");
  assert.equal(raceUsesProjectileOnlyBodyDamage(orbital), true, "Orbital should use projectile-only body damage");
  assert.ok(sim.events.some((event) => event.type === "race-bounce" && event.surface === "vertical-wall"), "vertical-wall impacts should emit the standard bounce cue");
  orbital.raceOrbiters = RACE_ORBITAL_ORBS_PER_RING - 1;
  const orbitalSatelliteRadius = orbital.raceOrbScale * RACE_ORB_RADIUS * RACE_ORBITAL_SATELLITE_RADIUS_SCALE;
  orbital.raceY = raceLayerLineY(0) - orbitalSatelliteRadius;
  sim.time = 0;
  const healthBefore = orbital.raceLayerHealth[0];
  resolveRaceBounce(sim, orbital);
  const hit = sim.events.at(-1);
  assert.ok(hit.orbiterHits > 0, "orbiters touching the number line should add their weapon damage");
  assert.ok(hit.orbiterHits < orbital.raceOrbiters, "orbiters away from the number line should not deal damage");
  assert.equal(orbital.raceOrbitalLineHitIndices.length, hit.orbiterHits, "Orbital damage should retain the exact touching satellite indices");
  assert.equal(hit.damage, orbital.raceDamage * hit.orbiterHits, "only orbiters touching the line should contribute damage");
  assert.equal(orbital.raceLayerHealth[0], healthBefore - hit.damage, "orbiter damage should apply to the number line");
  const contactEffects = orbital.raceBounceEffects.filter((effect) => effect.orbitalSatelliteContact);
  assert.deepEqual(
    contactEffects.map((effect) => effect.orbitalIndex),
    hit.orbitalNewLineHitIndices,
    "each visible satellite line hit should enqueue one expanding bounce effect",
  );
  for (const effect of contactEffects) {
    const position = raceOrbitalOrbPosition(orbital, effect.orbitalIndex, sim.time);
    assert.equal(effect.x, position.x, "the bounce effect should use the visible satellite x position");
    assert.equal(effect.y, position.y, "the bounce effect should use the visible satellite y position");
    assert.equal(effect.scale, RACE_ORBITAL_SATELLITE_RADIUS_SCALE, "the satellite bounce effect should start at satellite scale");
  }
}

{
  const options = {
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["orbital", "speed"],
    raceLayerStrengths: [100000000, 100000000, 100000000],
    seed: 3310,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  for (let index = 0; index < 480; index += 1) {
    stepSimulation(first, 1 / 120);
    stepSimulation(second, 1 / 120);
  }
  const firstContacts = first.events
    .filter((event) => (
      event.type === "race-bounce"
      && event.raceOrbId === "orbital"
      && event.surface === "number-line"
      && event.damage > 0
    ))
    .map((event) => ({
      time: event.time,
      orbitalIndex: event.orbitalIndex,
      damage: event.damage,
      orbitalSatelliteContact: event.orbitalSatelliteContact === true,
      orbitalNewLineHitIndices: event.orbitalNewLineHitIndices,
      x: event.x,
      y: event.y,
      soundInstance: event.soundInstance,
    }));
  const secondContacts = second.events
    .filter((event) => (
      event.type === "race-bounce"
      && event.raceOrbId === "orbital"
      && event.surface === "number-line"
      && event.damage > 0
    ))
    .map((event) => ({
      time: event.time,
      orbitalIndex: event.orbitalIndex,
      damage: event.damage,
      orbitalSatelliteContact: event.orbitalSatelliteContact === true,
      orbitalNewLineHitIndices: event.orbitalNewLineHitIndices,
      x: event.x,
      y: event.y,
      soundInstance: event.soundInstance,
    }));
  assert.ok(firstContacts.length > 0, "visible Orbital satellites should damage the line when they cross it");
  const satelliteContacts = firstContacts.filter((event) => event.orbitalSatelliteContact);
  assert.ok(
    new Set(satelliteContacts.map((event) => event.orbitalIndex)).size > 1,
    "stacked Orbital slots should damage through distinct visible satellite positions rather than one aggregate payload",
  );
  assert.ok(
    satelliteContacts.every((event) => event.orbitalNewLineHitIndices.length === 1),
    "each Orbital contact event should represent one visible satellite crossing",
  );
  assert.ok(
    satelliteContacts.every((event) => (
      Number.isFinite(event.x)
      && Number.isFinite(event.y)
      && event.soundInstance === event.orbitalIndex
    )),
    "each visible satellite crossing should carry its impact position and unique bounce sound instance",
  );
  assert.deepEqual(firstContacts, secondContacts, "spread Orbital contact damage should remain deterministic");
  const orbital = first.fighters.find((fighter) => fighter.raceOrbId === "orbital");
  assert.equal(
    orbital.raceLayerHealth[0],
    100000000 - firstContacts.reduce((total, event) => total + event.damage, 0),
    "Orbital layer damage should equal only the satellite contacts that actually crossed the line",
  );
}

{
  const racer = {
    raceX: 0.5,
    raceY: 0.25,
    raceOrbScale: 1,
    raceOrbiters: RACE_ORBITAL_ORBS_PER_RING * 2 + 1,
  };
  const firstSlot = raceOrbitalOrbPosition(racer, 0, 0);
  const secondStackedSlot = raceOrbitalOrbPosition(racer, RACE_ORBITAL_ORBS_PER_RING, 0);
  const thirdStackedSlot = raceOrbitalOrbPosition(racer, RACE_ORBITAL_ORBS_PER_RING * 2, 0);
  const orbit = raceOrbitalOrbPosition(racer, 7, 0.37);
  const spreadRacer = { ...racer, raceOrbiters: 4 };
  const spreadFirst = raceOrbitalOrbPosition(spreadRacer, 0, 0);
  const spreadSecond = raceOrbitalOrbPosition(spreadRacer, 1, 0);
  const spreadAngle = Math.atan2(spreadSecond.offsetY, spreadSecond.offsetX)
    - Math.atan2(spreadFirst.offsetY, spreadFirst.offsetX);
  assert.equal(firstSlot.ringIndex, 0, "Orbital should use one shared ring");
  assert.equal(secondStackedSlot.ringIndex, 0, "the twenty-sixth orbiter should stack on the first ring");
  assert.equal(thirdStackedSlot.ringIndex, 0, "every additional twenty-five orbiter should stack on the first ring");
  assert.ok(
    Math.abs(secondStackedSlot.offsetX - firstSlot.offsetX) < 1e-12
      && Math.abs(secondStackedSlot.offsetY - firstSlot.offsetY) < 1e-12
      && Math.abs(thirdStackedSlot.offsetX - firstSlot.offsetX) < 1e-12
      && Math.abs(thirdStackedSlot.offsetY - firstSlot.offsetY) < 1e-12,
    "Orbital slots beyond twenty-five should overlap their original positions",
  );
  assert.ok(
    Math.abs(spreadAngle - Math.PI / 2) < 1e-12,
    "partial Orbital rings should spread new satellites around the circle",
  );
  assert.ok(
    Math.abs(Math.hypot(orbit.offsetX, orbit.offsetY) - orbit.ringRadius) < 1e-12,
    "Orbital satellite offsets should remain circular in simulation space",
  );
  const fullRingArc = (2 * Math.PI * firstSlot.ringRadius) / RACE_ORBITAL_ORBS_PER_RING;
  const satelliteDiameter = 2 * (firstSlot.ringRadius / 2.55) * RACE_ORBITAL_SATELLITE_RADIUS_SCALE;
  assert.ok(
    fullRingArc >= satelliteDiameter && fullRingArc - satelliteDiameter < satelliteDiameter * 0.01,
    "a full Orbital ring should have almost no gap between adjacent satellites",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "orbital"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3304,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  assert.equal(racer.raceX, 0.88, "race orbs should launch from the upper-right");
  let bounced = false;
  for (let index = 0; index < 120 && !bounced; index += 1) {
    stepSimulation(sim, 1 / 120);
    bounced = racer.raceBounces > 0;
  }
  assert.equal(bounced, true, "the falling orb should physically reach its first number boundary");
  assert.ok(racer.raceVy < 0, "a number-boundary impact should reverse the vertical velocity into a real rebound");
  const reboundY = racer.raceY;
  stepSimulation(sim, 1 / 60);
  assert.ok(racer.raceY < reboundY, "the orb should continue upward after the rebound rather than teleporting along a preset arc");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "orbital"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3321,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  let minimumY = Infinity;
  for (let index = 0; index < 720; index += 1) {
    stepSimulation(sim, 1 / 120);
    minimumY = Math.min(minimumY, racer.raceY);
  }
  assert.ok(minimumY <= racer.raceOrbScale * 0.045 + 0.001, "Speedster should reach the solid top wall on its original arc");
  assert.equal(
    sim.events.some((event) => event.type === "race-bounce" && event.surface === "top-wall" && event.orbId === racer.id),
    true,
    "Speedster's original arc should rebound from the top wall",
  );
}

{
  const options = {
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["orbital"]],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 3322,
  };
  const lowerLayerSetup = (sim, orbId = "speed") => {
    const racer = sim.fighters.find((fighter) => fighter.raceOrbId === orbId);
    const team = sim.raceTeams[racer.raceTeamIndex];
    team.raceLayerHealth[0] = 0;
    team.raceLayerIndex = 1;
    racer.raceLayerIndex = 1;
    racer.raceX = 0.5;
    racer.raceY = raceLayerLineY(1) - racer.raceOrbScale * RACE_ORB_RADIUS;
    racer.raceVx = 0;
    racer.raceVy = 1;
    racer.raceReadyToFinish = false;
    return racer;
  };
  const portrait = createSimulation({ ...options, social: { format: "portrait" } });
  const longform = createSimulation({ ...options, social: { format: "race-landscape" } });
  const portraitSpeed = lowerLayerSetup(portrait);
  const longformSpeed = lowerLayerSetup(longform);
  const firstSurface = (sim, racer) => {
    stepSimulation(sim, 1 / 120);
    const initialEventCount = sim.events.length;
    for (let index = 0; index < 720; index += 1) {
      stepSimulation(sim, 1 / 120);
      const bounce = sim.events.slice(initialEventCount).find(
        (event) => event.type === "race-bounce" && event.fighterId === racer.id,
      );
      if (bounce) return bounce.surface;
    }
    return null;
  };
  assert.equal(longform.raceLongform, true, "long-form format should be threaded into the deterministic simulation");
  assert.equal(portrait.raceLongform, false, "portrait format should keep the original global top boundary");
  assert.equal(firstSurface(longform, longformSpeed), "top-wall", "Speedster should reach the arena top wall in long form");
  assert.equal(firstSurface(portrait, portraitSpeed), "number-line", "portrait Speedster should not target a lower-lane ceiling");
  const topWall = longform.events.find(
    (event) => event.type === "race-bounce" && event.fighterId === longformSpeed.id && event.surface === "top-wall",
  );
  assert.ok(topWall, "the long-form ceiling hit should emit the normal race bounce event");
  assert.equal(longformSpeed.raceLayerIndex, 1, "a top-wall hit must not advance the active number layer");
  assert.ok(
    longformSpeed.raceY <= longformSpeed.raceOrbScale * RACE_ORB_RADIUS + 1e-9,
    "Speedster should use the real arena top instead of the cleared previous-layer ceiling",
  );

  const flashOptions = { ...options, raceTeams: [["flash"], ["orbital"]], seed: 3323 };
  const flashLongform = createSimulation({ ...flashOptions, social: { format: "race-landscape" } });
  const flashPortrait = createSimulation({ ...flashOptions, social: { format: "portrait" } });
  const flashLongformRacer = lowerLayerSetup(flashLongform, "flash");
  const flashPortraitRacer = lowerLayerSetup(flashPortrait, "flash");
  assert.equal(firstSurface(flashLongform, flashLongformRacer), "top-wall", "Flash should reach the arena top wall in long form");
  assert.equal(firstSurface(flashPortrait, flashPortraitRacer), "number-line", "portrait Flash should not target a lower-lane ceiling");

  const gravitySpeed = createSimulation({
    ...options,
    raceTeamOptions: [{ speed: { comboAbilities: ["gravity"] } }, {}],
    seed: 3324,
    social: { format: "race-landscape" },
  });
  const gravitySpeedRacer = lowerLayerSetup(gravitySpeed);
  gravitySpeedRacer.raceGravityLevel = 42;
  assert.equal(
    firstSurface(gravitySpeed, gravitySpeedRacer),
    "top-wall",
    "Speedster should keep reaching the arena top wall when a composed Gravity ability is active",
  );

  const repeat = createSimulation({ ...options, social: { format: "race-landscape" } });
  const repeatSpeed = lowerLayerSetup(repeat);
  const deterministic = createSimulation({ ...options, social: { format: "race-landscape" } });
  const deterministicSpeed = lowerLayerSetup(deterministic);
  for (let index = 0; index < 240; index += 1) {
    stepSimulation(repeat, 1 / 120);
    stepSimulation(deterministic, 1 / 120);
  }
  assert.deepEqual(
    repeat.fighters.map((racer) => [racer.raceX, racer.raceY, racer.raceVx, racer.raceVy, racer.raceBounces, racer.raceLayerIndex]),
    deterministic.fighters.map((racer) => [racer.raceX, racer.raceY, racer.raceVx, racer.raceVy, racer.raceBounces, racer.raceLayerIndex]),
    "long-form top-wall arcs must remain deterministic for a fixed seed",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["orbital"]],
    raceLayerStrengths: [1, 99_999, 99_999],
    social: { format: "race-landscape" },
    seed: 3325,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const radius = racer.raceOrbScale * 0.045;
  racer.raceY = raceLayerLineY(0) - radius;
  racer.raceVy = 1;
  racer.raceVx = 0;
  const eventStart = sim.events.length;
  stepSimulation(sim, 1 / 120);
  const breakBounce = sim.events.slice(eventStart).find(
    (event) => event.type === "race-bounce" && event.fighterId === racer.id,
  );
  assert.equal(sim.raceLongform, true);
  assert.equal(racer.raceLayerIndex, 1, "long-form physics should advance immediately after the layer breaks");
  assert.equal(breakBounce?.surface, "number-line", "the layer-breaking impact should remain a real orb bounce");
  assert.ok(racer.raceVy < 0, "the long-form layer-breaking orb should rebound upward");
  const bouncesAfterBreak = racer.raceBounces;
  let reachedPreviousLayerCeiling = false;
  for (let index = 0; index < 240; index += 1) {
    stepSimulation(sim, 1 / 120);
    if (sim.events.some(
      (event) => event.type === "race-bounce"
        && event.fighterId === racer.id
        && event.surface === "top-wall"
        && event.layerIndex === 1,
    )) {
      reachedPreviousLayerCeiling = true;
      break;
    }
  }
  assert.equal(reachedPreviousLayerCeiling, true, "long-form physics should add the previous layer ceiling bounce after the break");
  assert.ok(racer.raceBounces > bouncesAfterBreak, "the long-form ceiling contact should count as a physics bounce");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["infinity"], ["orbital"]],
    raceLayerStrengths: [1, 1, 999_999],
    social: { format: "race-landscape" },
    seed: 3326,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "infinity");
  const radius = racer.raceOrbScale * RACE_ORB_RADIUS;
  racer.raceY = raceLayerLineY(0) - radius;
  racer.raceVy = 1;
  racer.raceVx = 0;
  stepSimulation(sim, 1 / 120);
  const yAfterBreak = racer.raceY;
  assert.equal(racer.raceLayerIndex, 1, "Infinity should advance one layer after its direct impact");
  assert.equal(racer.raceLayerBreakReboundActive, true, "Infinity should enter a physical breaker-rebound arc");
  assert.ok(racer.raceVy < 0, "Infinity should launch upward after breaking a layer");
  stepSimulation(sim, 1 / 120);
  assert.ok(racer.raceY < yAfterBreak, "Infinity should travel upward before falling through the cleared layer");
  let secondLayerBreak = null;
  for (let index = 0; index < 1800 && !secondLayerBreak; index += 1) {
    const eventStart = sim.events.length;
    stepSimulation(sim, 1 / 120);
    secondLayerBreak = sim.events.slice(eventStart).find(
      (event) => event.type === "race-layer-break"
        && event.fighterId === racer.id
        && event.layerIndex === 1,
    ) || null;
  }
  assert.ok(secondLayerBreak, "Infinity should reach the next layer after its rebound instead of piercing through it");
  assert.equal(racer.raceLayerIndex, 2, "Infinity should progress one layer at a time");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "orbital"],
    raceLayerStrengths: [200, 200, 200],
    seed: 3302,
  });
  const speed = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const orbital = sim.fighters.find((fighter) => fighter.raceOrbId === "orbital");
  const orbitalHorizontalSpeed = Math.abs(orbital.raceVx);
  const speedTravelSpeed = speed.raceTravelSpeed;
  const speedVerticalSpeed = speed.raceVerticalSpeed;
  const speedHorizontalSpeed = Math.abs(speed.raceVx);
  const speedDamage = speed.raceDamage;
  for (let index = 0; index < 4; index += 1) stepSimulation(sim, 0.5);
  assert.ok(speed.raceSpeed > 2, "Speedsters should gain an uncapped speed level from every bounce");
  assert.equal(speed.raceTravelSpeed, speedTravelSpeed, "Speedsters should keep horizontal travel speed fixed");
  assert.ok(speed.raceVerticalSpeed > speedVerticalSpeed, "Speedsters should continuously gain vertical launch speed");
  assert.equal(Math.abs(speed.raceVx), speedHorizontalSpeed, "Speedsters should not accelerate horizontally");
  const replaySpeed = captureReplayFrame(sim).fighters.find((fighter) => fighter.raceOrbId === "speed");
  assert.equal(replaySpeed.raceVerticalSpeed, speed.raceVerticalSpeed, "replay frames should preserve vertical speed ramps");
  assert.ok(speed.raceDamage > speedDamage, "Speedsters should gain scaled number-line damage along with their speed");
  assert.ok(orbital.raceOrbiters > 0, "orbital orbs should gain one one-damage orbiter per bounce");
  assert.equal(Math.abs(orbital.raceVx), orbitalHorizontalSpeed, "race orbs should preserve horizontal momentum through gravity-driven bounces");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["x-power", "phi"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3316,
  });
  const xPower = sim.fighters.find((fighter) => fighter.raceOrbId === "x-power");
  const phi = sim.fighters.find((fighter) => fighter.raceOrbId === "phi");
  xPower.raceBounces = 2;
  resolveRaceBounce(sim, xPower);
  phi.raceBounces = 2;
  resolveRaceBounce(sim, phi);
  assert.equal(xPower.raceDamage, 27, "Xˣ should raise the bounce count to itself");
  assert.equal(phi.raceDamage, 4, "Golden Ratio should use φ-powered bounce damage");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["flash", "speed"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3319,
  });
  const flash = sim.fighters.find((fighter) => fighter.raceOrbId === "flash");
  const damage = flash.raceDamage;
  const speed = flash.raceTravelSpeed;
  const verticalSpeed = flash.raceVerticalSpeed;
  resolveRaceBounce(sim, flash);
  assert.equal(flash.raceDamage, damage + 1, "Flash should gain one damage per bounce");
  assert.equal(flash.raceTravelSpeed, speed, "Flash should keep horizontal travel speed fixed");
  assert.ok(flash.raceVerticalSpeed > verticalSpeed, "Flash should gain vertical launch speed per bounce");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "flash"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3328,
  });
  const speedster = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const flash = sim.fighters.find((fighter) => fighter.raceOrbId === "flash");
  const speedsterBounces = speedster.raceBounces;
  speedster.raceX = 0.01;
  speedster.raceVx = -0.8;
  stepSimulation(sim, 1 / 120);
  assert.ok(speedster.raceBounces > speedsterBounces, "Speedster side-wall bounces should advance its ramp");
  assert.equal(Math.abs(speedster.raceVx), 0.8, "Speedster side-wall ramps should not increase horizontal speed");
  const speedsterTopBounces = speedster.raceBounces;
  speedster.raceX = 0.5;
  speedster.raceY = 0.01;
  speedster.raceVy = -0.8;
  stepSimulation(sim, 1 / 120);
  assert.ok(speedster.raceBounces > speedsterTopBounces, "Speedster top-wall bounces should advance its ramp");
  const flashBounces = flash.raceBounces;
  flash.raceY = 0.01;
  flash.raceVy = -0.8;
  stepSimulation(sim, 1 / 120);
  assert.ok(flash.raceBounces > flashBounces, "Flash top-wall bounces should advance its ramp");
  flash.raceSpeed = 49;
  flash.raceBounces = 48;
  flash.raceAbilityProgress = 98;
  const damageBeforeCharge = flash.raceDamage;
  resolveRaceBounce(sim, flash);
  assert.equal(flash.raceSpeed, 50, "Flash should trigger a surge at each 50-speed interval");
  assert.ok(flash.raceFlashSuperchargeUntil > sim.time, "Flash surge should stay active for a timed window");
  assert.equal(flash.raceAbilityProgress, 0, "Flash speedforce should reset when supercharge begins");
  resolveRaceBounce(sim, flash);
  assert.equal(flash.raceSpeed, 55, "Flash should gain five speed levels per bounce while supercharged");
  assert.equal(flash.raceDamage, damageBeforeCharge + 6, "Flash should gain one damage to trigger and five damage while charged");
  assert.equal(flash.raceAbilityProgress, 0, "Flash bounces during supercharge should not charge speedforce");
  const nextChargeAfterSupercharge = flash.raceFlashNextChargeSpeed;
  resolveRaceBounce(sim, flash);
  assert.equal(
    flash.raceFlashNextChargeSpeed,
    nextChargeAfterSupercharge,
    "bounces during Flash supercharge should not charge the next ability threshold",
  );
  stepSimulation(sim, 0.06);
  assert.ok(flash.raceTrail.some((point) => point.lightning), "Flash should leave lightning trails even when ordinary trails are disabled");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["x-squared", "fibonacci"],
    raceLayerStrengths: [999, 999, 999],
    raceScalingDamage: false,
    seed: 3320,
  });
  const squared = sim.fighters.find((fighter) => fighter.raceOrbId === "x-squared");
  squared.raceBounces = 4;
  resolveRaceBounce(sim, squared);
  assert.equal(squared.raceDamage, 1, "disabling scaling damage should keep math-orb damage at its base value");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["grower", "sticky"],
    raceLayerStrengths: [999, 999, 999],
    raceTrails: true,
    seed: 3317,
  });
  const grower = sim.fighters.find((fighter) => fighter.raceOrbId === "grower");
  const sticky = sim.fighters.find((fighter) => fighter.raceOrbId === "sticky");
  const growerScale = grower.raceOrbScale;
  resolveRaceBounce(sim, grower);
  assert.ok(grower.raceOrbScale > growerScale, "Grower should increase its physical size on every bounce");
  sticky.raceY = 0.25 - sticky.raceOrbScale * 0.045;
  resolveRaceBounce(sim, sticky);
  assert.ok(sticky.raceStickyUntil > sim.time, "Sticky should initially attach to the number line");
  assert.equal(sticky.raceStickyLevel, 2, "Sticky should advance to the next predetermined stick level after a bounce");
  assert.ok(Math.abs(sticky.raceStickyDuration - 0.2) < 0.000001, "Sticky's ground duration should follow its predetermined 0.1s steps");
  const healthBeforeStick = sticky.raceLayerHealth[0];
  const stickyBounces = sticky.raceBounces;
  const stickyDuration = sticky.raceStickyDuration;
  stepSimulation(sim, 0.05);
  assert.ok(sticky.raceLayerHealth[0] < healthBeforeStick, "Sticky should deal continuous ground damage while attached");
  assert.ok(
    sim.events.filter((event) => event.type === "race-sticky-tick").length >= 1,
    "Sticky should emit a sound tick for timed damage",
  );
  assert.equal(sticky.raceBounces, stickyBounces, "Sticky ground damage should not count as extra bounces");
  assert.equal(sticky.raceStickyDuration, stickyDuration, "Sticky ground damage should not advance its ability duration");
  assert.equal(sticky.raceTrail.length, 0, "Sticky ground damage should not create movement trails or advance bounce effects");
  stepSimulation(sim, 0.06);
  assert.equal(sticky.raceStickyUntil, 0, "Sticky should clear its timed hold instead of remaining grounded indefinitely");
  assert.ok(sticky.raceVy < 0, "Sticky should rebound immediately once its 0.1-second hold expires");
  assert.ok(sticky.raceY < 0.25 - sticky.raceOrbScale * 0.045, "Sticky should leave the number line when the hold expires");
  let stickyMinimumX = sticky.raceX;
  let stickyMaximumX = sticky.raceX;
  for (let index = 0; index < 180; index += 1) {
    stepSimulation(sim, 1 / 120);
    stickyMinimumX = Math.min(stickyMinimumX, sticky.raceX);
    stickyMaximumX = Math.max(stickyMaximumX, sticky.raceX);
  }
  assert.ok(stickyMaximumX - stickyMinimumX > 0.2, "Sticky should travel side-to-side through its longer jump arc");
  assert.equal(
    sim.events.some((event) => event.type === "race-bounce" && event.surface === "top-wall" && event.orbId === sticky.id),
    false,
    "Sticky's long jump should remain below the top wall",
  );
  assert.ok(grower.raceTrail.length > 0, "the race-trail toggle should leave deterministic fading trail points");
  const solidTrailSim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["grower", "speed"],
    raceSolidTrails: true,
    raceLayerStrengths: [999, 999, 999],
    seed: 3319,
  });
  stepSimulation(solidTrailSim, 0.08);
  assert.ok(solidTrailSim.fighters[0].raceTrail.some((point) => point.solid), "solid trail mode should mark Grower trail points");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["sticky", "orbital"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 33171,
  });
  const sticky = sim.fighters.find((fighter) => fighter.raceOrbId === "sticky");
  const dt = 1 / 120;
  resolveRaceBounce(sim, sticky);
  const firstHealth = sticky.raceLayerHealth[0];
  const firstDuration = sticky.raceStickyUntil - sim.time;
  for (let step = 0; step < Math.round(firstDuration / dt); step += 1) stepSimulation(sim, dt);
  const firstDamage = firstHealth - sticky.raceLayerHealth[0];
  assert.ok(Math.abs(firstDamage - 4) < 1e-9, "a level-one Sticky hold should deal four damage across its faster two-tick duration");
  const firstTick = sim.events.find((event) => event.type === "race-sticky-tick");
  assert.equal(firstTick?.damage, 2, "the first Sticky damage tick should use the composed damage value");
  assert.equal(firstTick?.amount, 2, "the first Sticky tick should apply two damage instead of a fractional slice");
  assert.equal(firstTick?.damagePerSecond, 40, "the first Sticky hold should report its faster damage rate");
  assert.equal(
    sim.events.filter((event) => event.type === "race-sticky-tick").length,
    2,
    "a 0.1-second level-one hold should emit two fast Sticky ticks",
  );
  if (sticky.raceStickyUntil > 0) stepSimulation(sim, dt);
  assert.equal(sticky.raceStickyLevel, 2, "finishing a Sticky hold should advance its level once");

  resolveRaceBounce(sim, sticky);
  const secondHealth = sticky.raceLayerHealth[0];
  const secondDuration = sticky.raceStickyUntil - sim.time;
  for (let step = 0; step < Math.round(secondDuration / dt); step += 1) stepSimulation(sim, dt);
  const secondDamage = secondHealth - sticky.raceLayerHealth[0];
  assert.ok(Math.abs(secondDamage - 16) < 1e-9, "a level-two Sticky hold should deliver four damage twice per 0.1 seconds over its longer duration");
  assert.ok(Math.abs(secondDuration - 0.2) < 1e-9, "the level-two Sticky duration should remain twice the level-one duration");
}

for (const [level, expectedDamage] of [[7, 9], [15, 17], [20, 22]]) {
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["sticky", "orbital"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 33171 + level,
  });
  const sticky = sim.fighters.find((fighter) => fighter.raceOrbId === "sticky");
  sticky.raceBounces = level - 1;
  sticky.raceDamage = level;
  sticky.raceStickyLevel = level;
  resolveRaceBounce(sim, sticky);
  stepSimulation(sim, 1 / 120);
  const tick = sim.events.find((event) => event.type === "race-sticky-tick");
  assert.equal(tick?.damage, expectedDamage, `a level-${level} Sticky hold should use ${expectedDamage} damage per tick`);
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["sticky", "orbital"],
    raceScalingDamage: false,
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 33192,
  });
  const sticky = sim.fighters.find((fighter) => fighter.raceOrbId === "sticky");
  sticky.raceBounces = 19;
  sticky.raceStickyLevel = 20;
  resolveRaceBounce(sim, sticky);
  stepSimulation(sim, 1 / 120);
  const tick = sim.events.find((event) => event.type === "race-sticky-tick");
  assert.equal(tick?.damage, 1, "disabling scaling damage should keep Sticky at its fixed base tick damage");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["lazer", "time-bomb"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3318,
  });
  const lazer = sim.fighters.find((fighter) => fighter.raceOrbId === "lazer");
  const healthBeforeBounce = lazer.raceLayerHealth[0];
  assert.equal(lazer.raceLaserDamageInterval, 0.1, "Lazer should begin with a 0.1-second physical interval");
  assert.equal(lazer.raceLaserIntervalLevel, 1, "Lazer should begin at interval level one");
  assert.equal(raceLaserIntervalLevelFor(lazer), 1);
  resolveRaceBounce(sim, lazer);
  assert.equal(lazer.raceLayerHealth[0], healthBeforeBounce, "Lazer orb bounces should not damage a number wall directly");
  assert.equal(lazer.raceBounceEffects.length, 0, "Lazer bounces should not create orb-centered expansion rings");
  assert.equal(lazer.raceLaserDamageInterval, 0.099, "Lazer should remove 0.001 seconds after its first bounce");
  assert.equal(lazer.raceLaserIntervalLevel, 2);
  assert.equal(raceLaserIntervalLevelFor(lazer), 2);
  const healthBeforeBeam = lazer.raceLayerHealth[0];
  for (let step = 0; step < 10; step += 1) {
    stepSimulation(sim, 1 / 120);
    lazer.raceLaserAngle = 0;
  }
  assert.equal(lazer.raceLayerHealth[0], healthBeforeBeam, "Lazer should wait for its full first damage interval");
  for (let step = 0; step < 8 && lazer.raceLayerHealth[0] === healthBeforeBeam; step += 1) {
    stepSimulation(sim, 1 / 120);
    lazer.raceLaserAngle = 0;
  }
  assert.ok(lazer.raceLayerHealth[0] < healthBeforeBeam, "Lazer should tick damage on the active number wall");
  assert.equal(lazer.raceLaserDamageTicks, 1, "Lazer should apply one discrete damage tick in the first 1/30-second sample");
  assert.ok(lazer.raceLaserDamageInterval <= 0.099, "Lazer should continue reducing its damage interval as it bounces");
  assert.ok(sim.events.some((event) => event.type === "race-laser-tick" && event.raceAbilityId === "lazer"), "each Lazer interval hit should emit a dedicated tick event");
  assert.ok(raceLaserImpactRingCount(lazer.raceLaserDamageInterval) >= 3, "Lazer impact rings should increase as interval level falls");
  const laserImpact = lazer.raceBounceEffects.at(-1);
  assert.equal(laserImpact.color, "#8b0000", "Lazer should create a deep-red expansion ring when its beam hits a number line");
  assert.equal(laserImpact.y, 0.25, "Lazer impact rings should be placed on the active number line");
  const downwardRay = getRaceLaserRay(sim, lazer);
  assert.equal(downwardRay.hitsNumberLine, true, "the long Lazer beam should stop when it reaches the number-line border");
  assert.equal(downwardRay.attachedToOrb, true, "the Lazer ray should advertise its orb-edge attachment");
  assert.ok(
    Math.abs(Math.hypot(downwardRay.startX - downwardRay.originX, downwardRay.startY - downwardRay.originY) - downwardRay.orbRadius) < 1e-9,
    "the Lazer ray should begin at the orb perimeter rather than floating from its center",
  );
  lazer.raceX = 0.5;
  lazer.raceVx = 0;
  stepOrbRace(sim, 0.08);
  assert.ok(lazer.raceLaserAngle > 0, "Lazer should begin a gradual clockwise turn after reversing");
  const startLaserAngle = lazer.raceLaserAngle;
  stepOrbRace(sim, 8);
  assert.ok(Math.abs(lazer.raceLaserAngle - startLaserAngle - Math.PI * 2) < 0.0001, "Lazer should complete one clockwise 360-degree revolution every eight seconds");
  const clockwiseRay = getRaceLaserRay(sim, lazer);
  assert.equal(clockwiseRay.hitsNumberLine, true, "a completed Lazer revolution should return to its downward beam state");
  assert.ok(clockwiseRay.endY > clockwiseRay.startY, "a completed Lazer revolution should return to its downward direction");
  const reverseSim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["lazer", "time-bomb"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 3319,
  });
  const reverseLazer = reverseSim.fighters.find((fighter) => fighter.raceOrbId === "lazer");
  reverseLazer.raceX = 0.5;
  reverseLazer.raceVx = -0.001;
  const reverseStartAngle = reverseLazer.raceLaserAngle;
  stepOrbRace(reverseSim, 8);
  assert.ok(Math.abs(reverseLazer.raceLaserAngle - reverseStartAngle - Math.PI * 2) < 0.0001, "the reverse should also complete a clockwise 360-degree revolution every eight seconds");
  const leftwardRay = getRaceLaserRay(reverseSim, reverseLazer);
  assert.equal(leftwardRay.hitsNumberLine, true, "a Lazer bouncing left should point downward into the number line");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["drill", "speed"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3310,
  });
  const drill = sim.fighters.find((fighter) => fighter.raceOrbId === "drill");
  sim.raceOpeningWeaponsFired = true;
  drill.raceDrillProjectiles = [];
  drill.raceDrills = 0;
  drill.raceDrillNextFireAt = 0;
  drill.raceBounces = 2;
  const healthBeforeBounce = drill.raceLayerHealth[0];
  resolveRaceBounce(sim, drill);
  assert.equal(drill.raceLayerHealth[0], healthBeforeBounce, "Drill orb bounces should not damage a number wall directly");
  assert.equal(drill.raceDrills, 0, "number-line bounces should not control the Drill firing cadence");
  assert.equal(drill.raceDrillDrag, 3, "Drill drag should increase with each bounce");
  assert.ok(Math.abs(drill.raceDrillSpeed - 0.142) < 1e-9, "the first three bounces should slow future drill projectiles");
  stepOrbRace(sim, 1 / 120);
  assert.equal(drill.raceDrills, 0, "a Drill should not fire while it is midair even when its timer is ready");
  drill.raceY = raceLayerLineY(drill.raceLayerIndex) - RACE_ORB_RADIUS * drill.raceOrbScale;
  drill.raceVy = 0;
  stepOrbRace(sim, 1 / 120);
  assert.equal(drill.raceDrills, 1, "a Drill should fire when its timer is ready and it touches the layer");
  assert.equal(drill.raceDrillProjectiles.length, 1, "fired drills should persist as visible moving projectiles");
  const projectile = drill.raceDrillProjectiles[0];
  const startY = projectile.y;
  const healthBeforeDrill = drill.raceLayerHealth[0];
  assert.equal(projectile.damagePerSecond, 1, "the first drill should begin at one damage per second");
  drill.raceBounces = 17;
  resolveRaceBounce(sim, drill);
  assert.equal(drill.raceDrillInterval, 2, "Drill launch intervals should remain two seconds");
  assert.ok(Math.abs(drill.raceDrillSpeed - 0.052) < 1e-9, "Drill projectile speed should slow with bounces instead of changing its fire timer");
  assert.equal(drill.raceDrillDrag, 18, "Drill drag should keep increasing as the projectile speed ramps down");
  drill.raceDrillNextFireAt = sim.time;
  drill.raceY = raceLayerLineY(drill.raceLayerIndex) - RACE_ORB_RADIUS * drill.raceOrbScale;
  drill.raceVy = 0;
  stepOrbRace(sim, 1 / 120);
  assert.equal(drill.raceDrills, 2, "the next Drill should launch from the timer, independently of bounces");
  assert.equal(drill.raceBounceEffects.length, 4, "every number-line impact should create a visual expansion effect");
  drill.raceBounceEffects.forEach((effect) => { effect.age = 1.99; });
  stepSimulation(sim, 1 / 60);
  assert.equal(drill.raceBounceEffects.length, 0, "bounce effects should fade after two seconds");
  for (let index = 0; index < 120; index += 1) stepSimulation(sim, 1 / 120);
  assert.ok(projectile.y > startY, "drill projectiles should travel down through the number walls");
  assert.ok(projectile.y - startY < 0.16, "drills should slow by 1.25× while tunneling through a number wall");
  assert.ok(drill.raceBounceEffects.some((effect) => effect.scale === 0.58), "drills should leave expanding-circle trail markers as they travel");
  assert.ok(drill.raceLayerHealth[0] < healthBeforeDrill, "drills should continuously damage each crossed layer");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["drill"], ["speed"]],
    raceScalingDamage: false,
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 33109,
  });
  const drill = sim.fighters.find((fighter) => fighter.raceOrbId === "drill");
  const startingDamage = drill.raceDamage;
  resolveRaceBounce(sim, drill);
  assert.equal(drill.raceDamage, startingDamage, "disabling damage scaling should not change Drill's body damage value");
  assert.equal(drill.raceDrillDrag, 1, "Drill drag should still scale on the first bounce when damage scaling is disabled");
  assert.ok(Math.abs(drill.raceDrillSpeed - 0.154) < 1e-9, "Drill projectile speed should still slow on the first bounce");
  resolveRaceBounce(sim, drill);
  assert.equal(drill.raceDrillDrag, 2, "Drill drag should continue scaling on later bounces");
  assert.ok(drill.raceDrillSpeed < 0.154, "Drill projectile speed should continue slowing with drag");
  drill.raceX = RACE_ORB_RADIUS * drill.raceOrbScale;
  drill.raceY = 0.1;
  drill.raceVx = -0.4;
  drill.raceVy = 0;
  stepOrbRace(sim, 1 / 120);
  assert.equal(drill.raceDrillDrag, 3, "Drill drag should also scale on a side-wall bounce");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["orbital"]],
    raceTeamOptions: [{ speed: { comboAbilities: ["drill"] } }, {}],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 3311,
  });
  const combo = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  assert.deepEqual(combo.raceAbilityIds, ["speed", "drill"], "Speedster should accept Drill as a composed ability");
  assert.equal(combo.raceDrillInterval, 2, "borrowed Drill should preserve its two-second timer interval");
  assert.equal(combo.raceDrillSpeed, 0.16, "borrowed Drill should initialize its projectile speed");
  sim.raceOpeningWeaponsFired = true;
  combo.raceDrillProjectiles = [];
  combo.raceDrills = 0;
  combo.raceDrillNextFireAt = 0;
  stepOrbRace(sim, 1 / 120);
  assert.equal(combo.raceDrills, 0, "a borrowed Drill should not fire in midair when its timer is ready");
  combo.raceY = raceLayerLineY(combo.raceLayerIndex) - RACE_ORB_RADIUS * combo.raceOrbScale;
  combo.raceVy = 0;
  stepOrbRace(sim, 1 / 120);
  assert.equal(combo.raceDrills, 1, "borrowed Drill should fire on its existing timer");
  assert.equal(combo.raceDrillProjectiles.length, 1, "borrowed Drill projectiles should persist for rendering");
  assert.deepEqual(
    sim.events.find((event) => event.type === "race-drill")?.raceAbilityIds,
    ["speed", "drill"],
    "borrowed Drill launches should retain the composed ability identity for audio",
  );
  const healthBeforeBounce = combo.raceLayerHealth[0];
  combo.raceBounces = 2;
  resolveRaceBounce(sim, combo);
  assert.equal(combo.raceLayerHealth[0], healthBeforeBounce, "a Drill combo must not damage a wall on body bounce");
  assert.equal(raceUsesProjectileOnlyBodyDamage(combo), true);
  assert.equal(combo.raceDrillDrag, 3, "borrowed Drill drag should follow number-line bounces");
  assert.ok(Math.abs(combo.raceDrillSpeed - 0.142) < 1e-9, "borrowed Drill projectiles should slow after bounces");
  combo.raceDamage = 7;
  combo.raceDrillProjectiles = [{ damagePerSecond: 4 }];
  assert.equal(
    calculateRaceTeamDamagePerSecond([combo]),
    4,
    "a projectile-only Drill combo should report only its active Drill DPS",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["batman", "speed"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3324,
  });
  const batman = sim.fighters.find((fighter) => fighter.raceOrbId === "batman");
  batman.raceBounces = 4;
  resolveRaceBounce(sim, batman);
  assert.equal(batman.raceBatarangs, 1, "Batman should launch a batarang on every fifth bounce");
  assert.equal(batman.raceBatarangProjectiles.length, 1, "each Batman throw should become a visible independent projectile");
  const batarang = batman.raceBatarangProjectiles[0];
  const startingDamage = batarang.damage;
  const healthBeforeBatarang = batman.raceLayerHealth[0];
  batarang.x = 0.99;
  batarang.y = 0.15;
  batarang.vx = 0.8;
  batarang.vy = 0.8;
  stepSimulation(sim, 0.1);
  assert.equal(batarang.bounces, 1, "only the number-line strike should ramp a batarang");
  assert.equal(batarang.damage, startingDamage + 1, "side and top bounces should not increase batarang damage");
  assert.ok(batarang.y <= 0.25 - batarang.radius, "the active number line should keep batarangs inside the current race box");
  assert.ok(batman.raceLayerHealth[0] < healthBeforeBatarang, "a batarang should deal stacking damage when it strikes the number line");
  assert.ok(sim.events.some((event) => event.type === "race-batarang"), "Batman throws should emit a deterministic batarang event");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["batman", "speed"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3330,
  });
  const batman = sim.fighters.find((fighter) => fighter.raceOrbId === "batman");
  batman.raceBatarangs = 9;
  batman.raceBounces = 4;
  resolveRaceBounce(sim, batman);
  const batarang = batman.raceBatarangProjectiles[0];
  batarang.bounces = 9;
  batarang.x = 0.5;
  batarang.y = 0.15;
  batarang.vx = 0;
  batarang.vy = 0.8;
  stepSimulation(sim, 0.1);
  assert.equal(batarang.bounces, 10, "a batarang should explode on its tenth number-line bounce");
  assert.equal(batman.raceBatBombs.length, 10, "the tenth batarang bounce should drop ten bombs");
  assert.ok(batman.raceBatCapeUntil > sim.time, "Batman should spread a visible cape during the bomb drop");
  assert.ok(batman.raceBatBombs.every((bomb) => bomb.damage === batman.raceDamage), "Batman bombs should snapshot his current damage");
  assert.ok(sim.events.some((event) => event.type === "race-bat-batarang-explosion"), "batarang explosions should emit deterministic events");
  assert.equal(batman.raceAbilityProgress, 0, "Batman bat bombs should reset its charge after activation");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["flash", "batman"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3331,
  });
  const flash = sim.fighters.find((fighter) => fighter.raceOrbId === "flash");
  const batman = sim.fighters.find((fighter) => fighter.raceOrbId === "batman");
  for (let index = 0; index < 24; index += 1) resolveRaceBounce(sim, flash);
  assert.equal(flash.raceAbilityProgress, 48, "Flash speedforce should fill continuously at two percent per bounce");
  resolveRaceBounce(sim, flash);
  assert.equal(flash.raceAbilityProgress, 50, "twenty-five eligible Flash bounces should reach half charge");
  for (let index = 0; index < 5; index += 1) resolveRaceBounce(sim, batman);
  assert.equal(batman.raceAbilityProgress, 50, "Batman bat bombs should reach half charge after five bounces");
  for (let index = 0; index < 5; index += 1) resolveRaceBounce(sim, batman);
  assert.equal(batman.raceAbilityProgress, 100, "Batman bat bombs should reach full charge after ten bounces");
}

{
  const makeSimulation = () => createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["batman"], ["draftmaster"]],
    raceLayerStrengths: [1_000_000_000, 1_000_000_000, 1_000_000_000],
    seed: 3332,
  });
  const first = makeSimulation();
  const second = makeSimulation();
  for (const sim of [first, second]) {
    const draftmaster = sim.fighters.find((fighter) => fighter.raceOrbId === "draftmaster");
    draftmaster.raceDraftNextFireAt = 0;
    stepSimulation(sim, 1 / 120);
  }
  const batman = first.fighters.find((fighter) => fighter.raceOrbId === "batman");
  const grappleFire = first.events.find((event) => event.type === "race-batman-grapple-fire");
  assert.ok(grappleFire, "Batman should grapple when an opposing weapon emits a fresh fire event");
  assert.equal(grappleFire.sourceEventType, "race-draft-fire");
  assert.equal(batman.raceBatmanGrappleCooldown, 10, "Batman’s defensive grapple should start a ten-second cooldown");
  assert.ok(batman.raceBatmanGrapple.targetX !== batman.raceBatmanGrapple.startX
    || batman.raceBatmanGrapple.targetY !== batman.raceBatmanGrapple.startY, "the grapple should choose a new fixed location");
  const fixedTarget = { x: batman.raceBatmanGrapple.targetX, y: batman.raceBatmanGrapple.targetY };
  for (let step = 0; step < 30; step += 1) stepSimulation(first, 1 / 120);
  assert.equal(batman.raceBatmanGrapple.phase, "pulling", "the defensive grapple should visibly pull Batman after firing");
  assert.ok(
    Math.hypot(batman.raceX - batman.raceBatmanGrapple.startX, batman.raceY - batman.raceBatmanGrapple.startY) > 0.01,
    "Batman should leave his original position during the fixed pull");
  for (let step = 0; step < 60; step += 1) stepSimulation(first, 1 / 120);
  assert.deepEqual(
    { x: batman.raceBatmanGrapple.targetX, y: batman.raceBatmanGrapple.targetY },
    fixedTarget,
    "the grapple endpoint must not track the firing opponent after launch",
  );
  const firstShots = batman.raceBatmanGrappleShots;
  for (let step = 0; step < 9 * 120; step += 1) stepSimulation(first, 1 / 120);
  assert.equal(batman.raceBatmanGrappleShots, firstShots, "the grapple must not fire again before ten seconds");
  for (let step = 0; step < 4 * 120; step += 1) stepSimulation(first, 1 / 120);
  assert.ok(batman.raceBatmanGrappleShots >= firstShots + 1, "the grapple should become available again after ten seconds");
  for (let step = 0; step < 13 * 120; step += 1) stepSimulation(second, 1 / 120);
  assert.deepEqual(
    first.events
      .filter((event) => event.type.startsWith("race-batman-grapple"))
      .map(({ type, sourceEventType, targetX, targetY }) => ({ type, sourceEventType, targetX, targetY })),
    second.events
      .filter((event) => event.type.startsWith("race-batman-grapple"))
      .map(({ type, sourceEventType, targetX, targetY }) => ({ type, sourceEventType, targetX, targetY })),
    "Batman’s defensive grapple endpoints and cooldown events should be deterministic",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["batman"], ["boomerang"]],
    raceLayerStrengths: [1_000_000_000, 1_000_000_000, 1_000_000_000],
    seed: 3333,
  });
  stepSimulation(sim, 1 / 120);
  const batman = sim.fighters.find((fighter) => fighter.raceOrbId === "batman");
  assert.equal(batman.raceBatmanGrappleShots, 1, "Batman should react to an opening boomerang launch");
  assert.equal(
    batman.raceBatmanGrapple.sourceEventType,
    "race-boomerang",
    "the opening defensive grapple should retain the firing event type",
  );
}

{
  const members = [
    {
      raceOrbId: "duplicator",
      raceDamage: 4,
      raceDuplicateOrbs: [{ raceDamage: 2 }, { raceDamage: 3 }],
    },
    {
      raceOrbId: "orbital",
      raceDamage: 5,
      raceOrbiters: 2,
      raceOrbitalLineHitIndices: [0],
      raceOrbitalLineHits: 1,
      raceDuplicateOrbs: [],
    },
    {
      raceOrbId: "drill",
      raceDamage: 8,
      raceDrillProjectiles: [{ damagePerSecond: 2 }, { damagePerSecond: 3 }],
      raceDuplicateOrbs: [],
    },
    {
      raceOrbId: "boomerang",
      raceDamage: 4,
      raceBoomerangProjectiles: [{ damage: 6 }],
      raceDuplicateOrbs: [],
    },
    {
      raceOrbId: "mines",
      raceDamage: 3,
      raceMineProjectiles: [{ damage: 5 }],
      raceDuplicateOrbs: [],
    },
    {
      raceOrbId: "speed-impact",
      raceDamage: 5,
      raceDuplicateOrbs: [],
    },
    {
      raceOrbId: "jackpot",
      raceDamage: 4,
      raceJackpotMultiplier: 10,
      raceDuplicateOrbs: [],
    },
    {
      raceOrbId: "black-hole",
      raceDamage: 1,
      raceBlackHoleActive: true,
      raceBlackHoleSuctionDamagePerSecond: 50,
      raceLayerHealth: [10, 10, 10],
      raceDuplicateOrbs: [],
    },
  ];
  assert.equal(
    calculateRaceTeamDamagePerSecond(members),
    4 + 2 + 3 + 5 + 2 + 3 + 6 + 5 + 5 + 4 * 10 + 50 * 3,
    "team damage/sec should include only Orbital satellites touching the line and active weapon contributions",
  );
}

{
  const options = {
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["meteor", "speed"],
    raceLayerStrengths: [999, 999, 999],
    seed: 4401,
  };
  const a = createSimulation(options);
  const b = createSimulation(options);
  const alternate = createSimulation({ ...options, seed: options.seed + 1 });
  const meteorA = a.fighters.find((fighter) => fighter.raceOrbId === "meteor");
  const meteorB = b.fighters.find((fighter) => fighter.raceOrbId === "meteor");
  const meteorAlternate = alternate.fighters.find((fighter) => fighter.raceOrbId === "meteor");
  assert.equal(meteorA.raceX, meteorB.raceX, "Meteor spawn position should replay exactly for the same seed");
  assert.notEqual(meteorA.raceX, meteorAlternate.raceX, "Meteor spawn position should vary across seeds");
  assert.ok(meteorA.raceX > 0.06 && meteorA.raceX < 0.94, "Meteor should spawn inside the race box");
  assert.equal(meteorA.raceMeteorAbilityCooldown, 7.5, "Meteor should start with a half-charged summon cooldown");
  assert.equal(meteorA.raceMeteorAbilityProgress, 50, "Meteor summon bar should start half full");
  const openingMeteorDamage = meteorA.raceMeteorDamage;
  const openingHealth = meteorA.raceLayerHealth[0];
  resolveRaceBounce(a, meteorA);
  resolveRaceBounce(b, meteorB);
  assert.equal(meteorA.raceLayerHealth[0], openingHealth, "Meteor orb collisions should not damage the wall directly");
  run(a, 1.4);
  run(b, 1.4);
  assert.ok(meteorA.raceMeteorDamageMultiplier > 1, "Meteor's damage multiplier should advance with battle time");
  assert.ok(meteorA.raceMeteorDamage > openingMeteorDamage, "Meteor damage should ramp as the battle clock advances");
  const openingSmallMeteorDamage = meteorA.raceMeteorSmallDamage;
  for (let bounce = 0; bounce < 16; bounce += 1) {
    resolveRaceBounce(a, meteorA);
    resolveRaceBounce(b, meteorB);
  }
  stepSimulation(a, 1 / 120);
  stepSimulation(b, 1 / 120);
  assert.ok(meteorA.raceMeteorSmallDamage >= openingSmallMeteorDamage + 1, "Small meteor damage should increase on every bounce");
  assert.ok(meteorA.raceMeteorShots >= 1, "Meteor should launch tiny meteors from its apex");
  assert.ok(meteorA.raceMeteorApexShots >= 1, "Meteor should launch at least one tiny meteor at an apex");
  assert.ok(meteorA.raceLayerHealth[0] < openingHealth, "Tiny meteors should damage the active wall");
  run(a, 14.1);
  assert.ok(meteorA.raceMeteorAbilityUses >= 1, "Meteor should call its giant meteor after the 15-second cooldown");
  assert.ok(
    meteorA.raceMeteorGiantProjectiles.length >= 1 || meteorA.raceMeteorLayerHits >= 1,
    "Meteor ability should create a layer-piercing giant meteor",
  );
  const giantMeteor = meteorA.raceMeteorGiantProjectiles[0];
  if (giantMeteor) assert.equal(giantMeteor.damage, 500, "The first giant meteor should start at 500 damage");
  run(b, 14.1);
  assert.deepEqual(
    [meteorA.raceMeteorShots, meteorA.raceMeteorAbilityUses, meteorA.raceMeteorLayerHits, meteorA.raceMeteorProjectiles.map((p) => [p.x, p.y, p.vx, p.vy])],
    [meteorB.raceMeteorShots, meteorB.raceMeteorAbilityUses, meteorB.raceMeteorLayerHits, meteorB.raceMeteorProjectiles.map((p) => [p.x, p.y, p.vx, p.vy])],
    "Meteor projectile timing and seeded spread should be deterministic",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["meteor", "speed"],
    raceLayerStrengths: [0, 2000, 2000],
    seed: 4402,
  });
  const meteor = sim.fighters.find((fighter) => fighter.raceOrbId === "meteor");
  meteor.raceMeteorAbilityCooldown = 0;
  meteor.raceMeteorAbilityProgress = 100;
  run(sim, 1 / 120);
  assert.equal(meteor.raceMeteorGiantProjectiles.length, 1, "a full Meteor summon should create one giant projectile");
  meteor.raceLayerHealth[0] = 0;
  run(sim, 10);
  assert.equal(meteor.raceMeteorLayerHits, 2, "the giant meteor should skip the already-cleared layer");
  assert.ok(meteor.raceMeteorBurns.length >= 1, "each struck layer should gain a timed burn");
  meteor.raceMeteorAbilityCooldown = 999;
  const openingBurnRate = meteor.raceMeteorBurns[0].damagePerSecond;
  const burnDamage = meteor.raceLayerHealth[1];
  run(sim, 1);
  assert.ok(meteor.raceMeteorBurns[0].damagePerSecond > openingBurnRate, "Meteor burn damage should ramp during the battle");
  assert.ok(meteor.raceLayerHealth[1] < burnDamage, "Meteor burns should continue dealing damage after the giant passes");
  run(sim, 5.5);
  assert.equal(meteor.raceMeteorBurns.length, 0, "Meteor burns should expire after five seconds");
  meteor.raceMeteorAbilityCooldown = 0;
  meteor.raceMeteorGiantProjectiles = [];
  run(sim, 1 / 120);
  assert.equal(meteor.raceMeteorGiantProjectiles[0].damage, 1000, "Each later giant meteor should gain 100% damage");
}

{
  const options = {
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["black-hole", "speed"],
    raceLayerStrengths: [99999, 99999, 99999],
    seed: 7717,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  const blackHole = first.fighters.find((fighter) => fighter.raceOrbId === "black-hole");
  const blackHoleReplay = second.fighters.find((fighter) => fighter.raceOrbId === "black-hole");
  const openingX = blackHole.raceX;
  const openingY = blackHole.raceY;
  const openingHealth = [...blackHole.raceLayerHealth];
  assert.equal(blackHole.raceBlackHoleAbilityCooldown, 6, "Black Hole should begin with a six-second first cooldown");
  assert.equal(blackHole.raceBlackHoleAbilityProgress, 50, "Black Hole should begin with a half-filled cooldown bar");
  resolveRaceBounce(first, blackHole);
  resolveRaceBounce(second, blackHoleReplay);
  assert.equal(blackHole.raceDamage, 1, "Black Hole should keep a one-damage base hit");
  assert.equal(blackHole.raceLayerHealth[0], openingHealth[0] - 1, "Black Hole body hits should deal base damage");
  run(first, 9.1);
  run(second, 9.1);
  assert.equal(blackHole.raceBlackHoleActive, true, "Black Hole should activate after its six-second opening cooldown and teleport delay");
  assert.equal(blackHole.raceX, 0.5, "Black Hole should teleport to the center while active");
  assert.equal(
    blackHole.raceY,
    ORB_RACE_PRESENTATION.orbChamberFraction + ORB_RACE_PRESENTATION.layerStackFraction * 0.5,
    "Black Hole should sit in the center of the race box",
  );
  assert.ok(blackHole.raceBlackHolePower > 0, "Black Hole should gain power from suction damage");
  assert.ok(
    first.events.some((event) => event.type === "race-black-hole-teleport-in"),
    "Black Hole should reappear after its one-second vanish window",
  );
  assert.ok(blackHole.raceBlackHoleScale > 1, "Black Hole should grow while it absorbs layers");
  assert.ok(blackHole.raceLayerHealth.every((health, index) => health < openingHealth[index]), "Black Hole should absorb from all three layers");
  assert.deepEqual(
    [blackHole.raceBlackHolePower, blackHole.raceBlackHoleScale, blackHole.raceLayerHealth],
    [blackHoleReplay.raceBlackHolePower, blackHoleReplay.raceBlackHoleScale, blackHoleReplay.raceLayerHealth],
    "Black Hole suction should be deterministic for a shared seed",
  );
  run(first, 4.1);
  for (let step = 0; step < 240 && blackHole.raceBlackHoleTeleportPhase !== "idle"; step += 1) stepSimulation(first, 1 / 120);
  assert.equal(blackHole.raceBlackHoleActive, false, "Black Hole should end the five-second suction window");
  const returnEvent = first.events.findLast((event) => event.type === "race-black-hole-end");
  assert.ok([-1, 1].includes(returnEvent?.direction), "Black Hole should launch left or right after returning");
  assert.ok(Number.isFinite(blackHole.raceX) && Number.isFinite(blackHole.raceY), "Black Hole should return to a valid track position");
  assert.equal(blackHole.raceBlackHoleScale, 1, "Black Hole should return to its normal size after suction");
  assert.ok(blackHole.raceDamage > 1, "Black Hole should promote absorbed numbers into its next bounce damage");
  assert.equal(blackHole.raceDamage, Math.round(blackHole.raceBlackHolePower), "Black Hole damage should equal cumulative absorbed numbers");
  const damageAfterSuction = blackHole.raceDamage;
  blackHole.raceBlackHoleAbilityCooldown = 0;
  for (let step = 0; step < 240 && !blackHole.raceBlackHoleActive; step += 1) stepSimulation(first, 1 / 120);
  assert.equal(blackHole.raceBlackHoleSuctionDamagePerSecond, 75, "Black Hole suction should gain 25 damage per ability use");
  assert.equal(blackHole.raceDamage, damageAfterSuction, "Black Hole should keep its absorbed damage while charging again");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["black-hole", "speed"],
    raceLayerStrengths: [1, 999, 999],
    seed: 77171,
  });
  const blackHole = sim.fighters.find((fighter) => fighter.raceOrbId === "black-hole");
  blackHole.raceBlackHoleActive = true;
  blackHole.raceBlackHoleTeleportPhase = "active";
  blackHole.raceBlackHoleUntil = sim.time + 1;
  blackHole.raceBlackHoleVisible = true;
  blackHole.raceBlackHoleSuctionDamagePerSecond = 1000;
  stepOrbRace(sim, 1 / 120);
  assert.equal(blackHole.raceLayerHealth[0], 0, "Black Hole suction should be able to clear the active layer");
  assert.equal(blackHole.raceLayerIndex, 1, "ranged layer destruction should advance past a zero-health active layer");
  assert.equal(blackHole.raceVy, 0, "ranged layer destruction should not create a rebound impulse");
  assert.equal(
    sim.events.filter((event) => event.type === "race-layer-break" && event.fighterId === blackHole.id && event.layerIndex === 0).length,
    1,
    "ranged layer destruction should emit one layer-break event",
  );
  assert.equal(
    sim.events.some((event) => event.type === "race-bounce" && event.fighterId === blackHole.id),
    false,
    "Black Hole layer destruction should not emit an orb bounce");
}

{
  const options = {
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["godzilla", "speed"],
    raceLayerStrengths: [999999999, 999999999, 999999999],
    seed: 7718,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  const godzilla = first.fighters.find((fighter) => fighter.raceOrbId === "godzilla");
  const replay = second.fighters.find((fighter) => fighter.raceOrbId === "godzilla");
  const openingHealth = godzilla.raceLayerHealth[0];
  const openingX = godzilla.raceX;
  assert.equal(godzilla.raceBounces, 0, "Godzilla should begin without a bounce counter");
  assert.equal(godzilla.raceGodzillaStompDamage, 50, "Godzilla stomps should start at 50 damage");
  assert.equal(godzilla.raceGodzillaSwipeDamage, 100, "Godzilla swipes should start at 100 damage");
  assert.equal(godzilla.raceGodzillaBeamDamagePerSecond, 1000, "Atomic breath should start at 1000 damage per second");
  assert.equal(godzilla.raceGodzillaAbilityCooldown, 15, "Atomic breath should begin on a 15-second cooldown");
  assert.equal(godzilla.raceGodzillaBreathDirection, "down", "Atomic breath should target the number line");
  run(first, 4.25);
  run(second, 4.25);
  assert.equal(godzilla.raceBounces, 0, "walking, stomping, and swiping must never count as bounces");
  assert.ok(godzilla.raceGodzillaStomps >= 3, "Godzilla should deal repeated walking stomp damage");
  assert.ok(
    first.events.some((event) => event.type === "race-godzilla-step" && event.step >= 1),
    "Godzilla walking steps should emit deterministic audio events",
  );
  assert.ok(godzilla.raceGodzillaSwipes >= 1, "Godzilla should periodically alternate a tail smack or stomp attack");
  assert.ok(godzilla.raceLayerHealth[0] < openingHealth, "Godzilla attacks should damage the current number wall");
  assert.notEqual(godzilla.raceX, openingX, "Godzilla should walk horizontally instead of bouncing");
  assert.equal(
    godzilla.raceGodzillaStompDamage,
    50 * (2 ** godzilla.raceGodzillaStomps),
    "stomp damage should gain 100% after every stomp",
  );
  assert.equal(godzilla.raceGodzillaSwipeDamage, 200, "the first swipe should double the next swipe damage");
  assert.deepEqual(
    [godzilla.raceX, godzilla.raceY, godzilla.raceGodzillaStomps, godzilla.raceGodzillaSwipes, godzilla.raceGodzillaWanderSpeed, godzilla.raceLayerHealth],
    [replay.raceX, replay.raceY, replay.raceGodzillaStomps, replay.raceGodzillaSwipes, replay.raceGodzillaWanderSpeed, replay.raceLayerHealth],
    "Godzilla walking and attack timing should replay deterministically",
  );

  godzilla.raceGodzillaAbilityCooldown = 0;
  replay.raceGodzillaAbilityCooldown = 0;
  godzilla.raceGodzillaNextAttackAt = replay.raceGodzillaNextAttackAt = 999;
  run(first, 3.05);
  run(second, 3.05);
  assert.equal(godzilla.raceGodzillaAbilityPhase, "fire", "atomic breath should stage through look-up, charge, and bend animations");
  assert.ok(
    first.events.some((event) => event.type === "race-godzilla-look-up")
      && first.events.some((event) => event.type === "race-godzilla-charge")
      && first.events.some((event) => event.type === "race-godzilla-atomic-breath"),
    "the atomic-breath animation stages should emit deterministic presentation events",
  );
  assert.equal(
    first.events.find((event) => event.type === "race-godzilla-atomic-breath")?.direction,
    "down",
    "the atomic-breath event should advertise its ground-facing direction",
  );
  const healthBeforeBeam = godzilla.raceLayerHealth[0];
  run(first, 0.5);
  run(second, 0.5);
  assert.ok(healthBeforeBeam - godzilla.raceLayerHealth[0] >= 500, "atomic breath should deal at least 1000 damage per second");
  assert.ok(godzilla.raceGodzillaBurns.some((burn) => burn.layerIndex === 0), "atomic breath should leave a ten-second ground burn");
  assert.ok(calculateRaceTeamDamagePerSecond([godzilla]) >= godzilla.raceGodzillaBeamDamagePerSecond, "team damage aggregation should include active atomic breath");
  run(first, 4.7);
  run(second, 4.7);
  assert.equal(godzilla.raceGodzillaAbilityPhase, "idle", "atomic breath should stop after five seconds");
  assert.equal(godzilla.raceGodzillaBeamDamagePerSecond, 2000, "each completed atomic breath should double the next beam damage");
  assert.deepEqual(
    [godzilla.raceGodzillaAbilityPhase, godzilla.raceGodzillaAbilityCooldown, godzilla.raceGodzillaBurns, godzilla.raceLayerHealth],
    [replay.raceGodzillaAbilityPhase, replay.raceGodzillaAbilityCooldown, replay.raceGodzillaBurns, replay.raceLayerHealth],
    "Godzilla's atomic breath and lingering burn should be deterministic",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["godzilla", "speed"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 7721,
  });
  const godzilla = sim.fighters.find((fighter) => fighter.raceOrbId === "godzilla");
  godzilla.raceGodzillaAbilityCooldown = 999;
  godzilla.raceGodzillaNextAttackAt = 0;
  godzilla.raceGodzillaNextStepAt = 999;
  godzilla.raceGodzillaNextWanderAt = 999;
  godzilla.raceGodzillaSwipes = 1;
  stepSimulation(sim, 1 / 120);
  assert.equal(godzilla.raceGodzillaAttackKind, "stomp", "the second Godzilla attack should use the generated stomp row instead of claws");
  assert.ok(
    sim.events.some((event) => event.type === "race-godzilla-impact" && event.kind === "stomp" && event.attack),
    "Godzilla's stomp attack should emit a ground-impact event",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["godzilla", "speed"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 7720,
  });
  const godzilla = sim.fighters.find((fighter) => fighter.raceOrbId === "godzilla");
  godzilla.raceGodzillaAbilityCooldown = 999;
  godzilla.raceGodzillaNextAttackAt = 999;
  godzilla.raceGodzillaNextStepAt = 999;
  godzilla.raceGodzillaNextWanderAt = 999;
  godzilla.raceGodzillaFalling = false;
  godzilla.raceGodzillaGroundLayerIndex = godzilla.raceLayerIndex;
  godzilla.raceY = raceLayerLineY(0);
  godzilla.raceX = 0.16001;
  godzilla.raceGodzillaDirection = -1;
  stepSimulation(sim, 1 / 120);
  assert.equal(godzilla.raceX, 0.16, "Godzilla should clamp to the left wall");
  assert.equal(godzilla.raceGodzillaDirection, 1, "Godzilla should reverse direction at a wall");
  assert.equal(godzilla.raceGodzillaTurns, 1, "Godzilla should count wall turns");
  assert.ok(
    sim.events.some((event) => event.type === "race-godzilla-turn" && event.direction === 1),
    "Godzilla wall turns should emit a deterministic presentation event",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["godzilla", "speed"],
    raceLayerStrengths: [50, 999999, 999999],
    seed: 7719,
  });
  const godzilla = sim.fighters.find((fighter) => fighter.raceOrbId === "godzilla");
  run(sim, 1.5);
  assert.equal(godzilla.raceBounces, 0, "Godzilla should fall through a cleared line without rebounding");
  assert.ok(godzilla.raceLayerIndex >= 1, "a stomp should break the first layer and advance Godzilla downward");
  assert.ok(godzilla.raceGodzillaHeavyLandings >= 1, "entering a new layer should create a heavy landing");
  assert.ok(godzilla.raceLayerHealth[1] <= 999799, "the heavy landing should deal two current stomps of damage");
  assert.ok(
    sim.events.some((event) => event.type === "race-godzilla-impact" && event.heavy),
    "the new-layer landing should emit a heavy impact frame event",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["boomerang", "speed"],
    raceLayerStrengths: [9999, 9999, 9999],
    seed: 3350,
  });
  const boomerang = sim.fighters.find((fighter) => fighter.raceOrbId === "boomerang");
  const healthBeforeOrbHit = boomerang.raceLayerHealth[0];
  for (let bounce = 1; bounce <= 4; bounce += 1) resolveRaceBounce(sim, boomerang);
  assert.equal(boomerang.raceLayerHealth[0], healthBeforeOrbHit, "Boomerang's orb body must deal no direct damage");
  assert.equal(boomerang.raceBoomerangs, 0, "Boomerang should wait for Batman's five-bounce launch interval");
  resolveRaceBounce(sim, boomerang);
  assert.equal(boomerang.raceBoomerangLevel, 1);
  assert.equal(boomerang.raceBoomerangs, 1, "bounce five should launch exactly one boomerang");
  assert.equal(boomerang.raceBoomerangProjectiles.length, 1);
  assert.equal(boomerang.raceBoomerangProjectiles[0].radius, 0.07, "Boomerang should use Batman's batarang size");
  assert.equal(boomerang.raceBoomerangProjectiles[0].damage, 5);
  const projectile = boomerang.raceBoomerangProjectiles[0];
  for (let step = 0; step < 4000 && !projectile.completed; step += 1) stepOrbRace(sim, 1 / 120);
  assert.equal(projectile.bounces, 15, "Boomerang should last one-and-a-half times Batman's ten-hit lifetime");
  assert.equal(projectile.damage, 20, "each piercing layer hit should ramp damage");
  assert.ok(boomerang.raceLayerHealth[1] < 9999 && boomerang.raceLayerHealth[2] < 9999, "Boomerang should pierce and damage layers below the active wall");
  assert.ok(!boomerang.raceBoomerangProjectiles.includes(projectile));
  assert.ok(!sim.events.some((event) => event.type === "race-boomerang-explosion"), "expired boomerangs must not explode");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["mines", "speed"],
    raceOrbScale: 0.75,
    raceLayerStrengths: [9999, 9999, 9999],
    seed: 3351,
  });
  const mines = sim.fighters.find((fighter) => fighter.raceOrbId === "mines");
  const speed = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const healthBeforeOrbHit = mines.raceLayerHealth[0];
  resolveRaceBounce(sim, mines);
  assert.equal(mines.raceLayerHealth[0], healthBeforeOrbHit, "Splodey's orb body must deal no direct damage");
  assert.equal(mines.raceMineProjectiles.length, 0, "line bounces must not throw Splodey's bombs");
  const layerHeight = 0.62 / mines.raceLayerHealth.length;
  for (const racer of [mines, speed]) {
    racer.raceY = 0.25 + racer.raceLayerIndex * layerHeight - racer.raceOrbScale * 0.045;
    racer.raceVy = 0.2;
  }
  stepOrbRace(sim, 1 / 120);
  assert.ok(Math.abs(speed.raceVy) > Math.abs(mines.raceVy), "Speedster's restored top-wall arc should be visibly higher than Splodey's arc");
  for (let step = 0; step < 358; step += 1) stepSimulation(sim, 1 / 120);
  assert.equal(mines.raceMinesDropped, 0, "Splodey must not throw early");
  for (let step = 0; step < 3 && mines.raceMinesDropped === 0; step += 1) stepSimulation(sim, 1 / 120);
  assert.equal(mines.raceMineLevel, mines.raceBounces + 1, "Splodey's volley should gain one bomb for every bounce");
  assert.equal(mines.raceMinesDropped, mines.raceMineLevel, "the first timed drop should visibly create the full ramped volley");
  assert.equal(mines.raceMineProjectiles.length, mines.raceMineLevel);
  assert.ok(
    mines.raceMineProjectiles.every((mine) => mine.dropDelay === 0),
    "Splodey's full bomb volley should launch simultaneously",
  );
  assert.ok(mines.raceMineProjectiles.every((mine) => mine.vy < 0), "each black bomb should launch upward from Splodey");
  assert.ok(mines.raceMineProjectiles.every((mine) => mine.phase === "rising"), "each bomb should begin in its rising phase");
  assert.ok(mines.raceMineProjectiles.every((mine) => mine.y < mines.raceY), "each bomb should begin above Splodey");
  const bombHorizontalSpeeds = mines.raceMineProjectiles.map((mine) => mine.vx);
  assert.ok(
    new Set(bombHorizontalSpeeds.map((speed) => speed.toFixed(6))).size > 1,
    "Splodey's ramped volley should use a seeded random horizontal pattern",
  );
  const mineId = mines.raceMineProjectiles[0].id;
  for (let step = 0; step < 600 && !sim.events.some((event) => event.type === "race-mine-explosion" && event.projectileId === mineId); step += 1) {
    stepSimulation(sim, 1 / 120);
  }
  assert.ok(sim.events.some((event) => event.type === "race-mine-explosion" && event.projectileId === mineId));
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["magnet", "grower"],
    raceLayerStrengths: [9999, 9999, 9999],
    seed: 3352,
  });
  const magnet = sim.fighters.find((fighter) => fighter.raceOrbId === "magnet");
  const grower = sim.fighters.find((fighter) => fighter.raceOrbId === "grower");
  for (const racer of [magnet, grower]) {
    racer.raceX = 0.5;
    racer.raceY = 0.08;
    racer.raceVx = 0.2;
    racer.raceVy = 0;
  }
  stepOrbRace(sim, 1 / 120);
  assert.ok(magnet.raceVy > grower.raceVy, "Magnet's real acceleration should pull it toward the number line");
  assert.ok(magnet.raceMagnetPull > 0, "the visible Magnet pull strength should reflect its physical force");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["gravity", "speed"],
    raceLayerStrengths: [9999, 9999, 9999],
    seed: 3353,
  });
  const gravity = sim.fighters.find((fighter) => fighter.raceOrbId === "gravity");
  const initialHeight = gravity.raceBounceHeight;
  for (let bounce = 0; bounce < 3; bounce += 1) resolveRaceBounce(sim, gravity);
  assert.equal(gravity.raceGravityLevel, 3);
  assert.equal(gravity.raceGravityMode, "LEVEL 3");
  assert.ok(gravity.raceBounceHeight < initialHeight, "each gravity level should lower the physical jump arc");
  gravity.raceY = 0.08;
  gravity.raceVy = 0;
  stepOrbRace(sim, 1 / 120);
  const gravityVelocity = gravity.raceVy;
  const speed = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  speed.raceY = 0.08;
  speed.raceVy = 0;
  stepOrbRace(sim, 1 / 120);
  assert.ok(gravityVelocity > speed.raceVy, "Gravity levels must increase actual downward acceleration");
}

{
  const sim = createSimulation({
    count: 3,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["jackpot", "boomerang", "drill"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 3352,
  });
  stepSimulation(sim, 1 / 120);
  const jackpot = sim.fighters.find((fighter) => fighter.raceOrbId === "jackpot");
  const boomerang = sim.fighters.find((fighter) => fighter.raceOrbId === "boomerang");
  const drill = sim.fighters.find((fighter) => fighter.raceOrbId === "drill");
  assert.ok(jackpot.raceJackpotPendingSlots, "Jackpot should begin its opening slot roll immediately");
  assert.equal(boomerang.raceBoomerangProjectiles.length, 1, "Boomerang should launch one opening projectile");
  assert.equal(drill.raceDrillProjectiles.length, 0, "Drill should wait to launch until it touches the layer");
  assert.ok(sim.events.some((event) => event.type === "race-jackpot-spin"), "the opening Jackpot roll should emit its spin event");
  assert.ok(sim.events.some((event) => event.type === "race-boomerang"), "the opening Boomerang should emit its launch event");
  assert.ok(!sim.events.some((event) => event.type === "race-drill"), "a midair opening Drill should not emit a launch event");
}

{
  const options = {
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["jackpot", "speed"],
    raceLayerStrengths: [999999, 999999, 999999],
    raceScalingDamage: false,
    seed: 3354,
  };
  for (const [rolls, tier, multiplier] of [
    [[0.1, 0.1, 0.1], "bust", 0.125],
    [[0.5, 0.5, 0.5], "cash", 8],
    [[0.1, 0.5, 0.9], "cash", 10],
    [[0.5, 0.9, 0.9], "jackpot", 200],
  ]) {
    const forced = createSimulation(options);
    const forcedJackpot = forced.fighters.find((fighter) => fighter.raceOrbId === "jackpot");
    let rollIndex = 0;
    forced.raceRng.next = () => rolls[Math.min(rollIndex++, rolls.length - 1)];
    forcedJackpot.raceJackpotCooldown = 0;
    stepSimulation(forced, 1 / 120);
    assert.ok(forcedJackpot.raceJackpotPendingSlots, "cooldown completion should start a visible spin before resolving");
    assert.equal(forcedJackpot.raceJackpotPendingMultiplier, multiplier);
    assert.ok(forced.events.some((event) => event.type === "race-jackpot-lever"), "starting a roll should pull the audible lever");
    assert.ok(forced.events.some((event) => event.type === "race-jackpot-spin"), "starting a roll should emit the reel-spinning sound event");
    for (let step = 0; step < 120 && forcedJackpot.raceJackpotPendingSlots; step += 1) {
      stepSimulation(forced, 1 / 120);
    }
    assert.equal(forcedJackpot.raceJackpotTier, tier);
    assert.equal(forcedJackpot.raceJackpotMultiplier, multiplier);
    assert.equal(forcedJackpot.raceJackpotSlots.length, 3);
    assert.ok(forcedJackpot.raceJackpotCooldown > 4.9 && forcedJackpot.raceJackpotCooldown <= 5);
    const health = forcedJackpot.raceLayerHealth[0];
    resolveRaceBounce(forced, forcedJackpot);
    assert.ok(Math.abs((health - forcedJackpot.raceLayerHealth[0]) - multiplier) < 0.0001, `${tier} should deal ${multiplier}× current damage`);
    if (tier === "jackpot") {
      assert.ok(forced.events.some((event) => event.type === "race-jackpot"));
      stepSimulation(forced, 1 / 120);
      assert.ok(forcedJackpot.raceTrail.some((point) => point.money), "Jackpot mode should leave a deterministic money trail");
      assert.ok(!forced.events.some((event) => event.type === "race-jackpot-unlucky"));
    } else if (tier === "bust") {
      assert.ok(forced.events.some((event) => event.type === "race-jackpot-unlucky"), "an unlucky Jackpot hit should emit its KO sound event");
    }
    if (["cash", "jackpot"].includes(tier)) {
      assert.ok(forcedJackpot.raceBounceEffects.some((effect) => effect.cash), "cash outcomes should create the money bounce effect");
    } else {
      assert.ok(!forcedJackpot.raceBounceEffects.some((effect) => effect.cash), "bust outcomes should not create money effects");
    }
  }

  const first = createSimulation(options);
  const second = createSimulation(options);
  const firstJackpot = first.fighters.find((fighter) => fighter.raceOrbId === "jackpot");
  const secondJackpot = second.fighters.find((fighter) => fighter.raceOrbId === "jackpot");
  for (let step = 0; step < 1800; step += 1) {
    stepSimulation(first, 1 / 120);
    stepSimulation(second, 1 / 120);
  }
  assert.deepEqual(
    [firstJackpot.raceJackpotTier, firstJackpot.raceJackpotMultiplier, firstJackpot.raceJackpotSlots, firstJackpot.raceJackpotSlotMultipliers, firstJackpot.raceJackpots, firstJackpot.raceJackpotRolls],
    [secondJackpot.raceJackpotTier, secondJackpot.raceJackpotMultiplier, secondJackpot.raceJackpotSlots, secondJackpot.raceJackpotSlotMultipliers, secondJackpot.raceJackpots, secondJackpot.raceJackpotRolls],
    "Jackpot rolls must repeat exactly for the same seed",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed-impact", "speed"],
    raceLayerStrengths: [9999, 9999, 9999],
    seed: 3355,
  });
  const impact = sim.fighters.find((fighter) => fighter.raceOrbId === "speed-impact");
  const speed = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  assert.ok(impact.raceTravelSpeed < speed.raceTravelSpeed, "SPEED should move more slowly than Speedster");
  assert.equal(impact.raceDamage, 50, "SPEED should start with 50 impact damage");
  const health = impact.raceLayerHealth[0];
  resolveRaceBounce(sim, impact);
  assert.equal(health - impact.raceLayerHealth[0], 50, "SPEED should deal its current impact damage");
  assert.equal(impact.raceDamage, 150, "SPEED should gain 100 damage after each bounce");
  assert.equal(impact.raceSpeedImpactLandings, 1, "SPEED should record a critical landing");
  assert.ok(impact.raceBounceEffects.some((effect) => effect.cracks), "SPEED should leave ground cracks on impact");
}

{
  const newIds = ["boomerang", "magnet", "mines", "gravity", "jackpot", "speed-impact"];
  const teams = [newIds.slice(0, 3), newIds.slice(3)];
  const raceTeamOptions = teams.map((team) => Object.fromEntries(team.map((orbId, index) => [orbId, {
    fadingTrails: index % 2 === 0,
    solidTrails: index % 2 === 1,
    scalingDamage: false,
  }])));
  const sim = createSimulation({
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceTeams: teams,
    raceTeamOptions,
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 3358,
  });
  for (const racer of sim.fighters) {
    resolveRaceBounce(sim, racer);
    assert.equal(racer.raceDamage, racer.raceOrbId === "speed-impact" ? 50 : 1, `${racer.raceOrbId} should honor its scaling-damage toggle`);
    const expected = raceTeamOptions[racer.raceTeamIndex][racer.raceOrbId];
    assert.equal(racer.raceFadingTrailsEnabled, expected.fadingTrails);
    assert.equal(racer.raceSolidTrailsEnabled, expected.solidTrails);
  }
}

{
  const sim = createSimulation({
    count: 6,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["fibonacci", "x-power", "quadratic", "factorial", "phi", "grower"],
    seed: 3325,
  });
  const fibonacci = sim.fighters.find((fighter) => fighter.raceOrbId === "fibonacci");
  const xPower = sim.fighters.find((fighter) => fighter.raceOrbId === "x-power");
  const quadratic = sim.fighters.find((fighter) => fighter.raceOrbId === "quadratic");
  const factorial = sim.fighters.find((fighter) => fighter.raceOrbId === "factorial");
  const phi = sim.fighters.find((fighter) => fighter.raceOrbId === "phi");
  const grower = sim.fighters.find((fighter) => fighter.raceOrbId === "grower");
  assert.equal(fibonacci.raceTravelSpeed, grower.raceTravelSpeed, "Fibonacci regular mode should use the standard race speed");
  assert.equal(xPower.raceTravelSpeed, fibonacci.raceTravelSpeed, "Xˣ regular mode should use the standard race speed");
  assert.equal(xPower.raceTravelSpeed, quadratic.raceTravelSpeed, "Quadratic should share the power-math speed");
  assert.equal(xPower.raceTravelSpeed, factorial.raceTravelSpeed, "Factorial should share the power-math speed");
  assert.equal(phi.raceTravelSpeed, fibonacci.raceTravelSpeed, "Golden Ratio should share the other slow math-orb speed");
  assert.ok(Math.abs(fibonacci.raceVx) > fibonacci.raceTravelSpeed * 0.68, "regular math orbs should use the long left-to-right arc");
  assert.ok(Math.abs(grower.raceVx) > grower.raceTravelSpeed * 0.68, "every racer should use the long left-to-right arc");
  const sizeBeforeBounce = grower.raceOrbScale;
  resolveRaceBounce(sim, grower);
  assert.equal(grower.raceOrbScale, sizeBeforeBounce + 0.05, "Grower should grow by 5% on every bounce");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["grower", "orbital"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 33251,
  });
  const grower = sim.fighters.find((fighter) => fighter.raceOrbId === "grower");
  const topChamberScale = (raceLayerLineY(0) / (RACE_ORB_RADIUS * 2)) * 0.98;
  for (let index = 0; index < 60; index += 1) resolveRaceBounce(sim, grower);
  assert.ok(
    grower.raceOrbScale <= topChamberScale + 1e-12,
    "Grower should not grow past the top-chamber diameter limit",
  );
  const cappedScale = grower.raceOrbScale;
  resolveRaceBounce(sim, grower);
  assert.equal(grower.raceOrbScale, cappedScale, "Grower should stay capped after reaching the top chamber limit");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["grower", "orbital"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 33252,
  });
  const grower = sim.fighters.find((fighter) => fighter.raceOrbId === "grower");
  const team = sim.raceTeams[grower.raceTeamIndex];
  team.raceLayerIndex = 1;
  grower.raceLayerIndex = 1;
  const lowerLayerScale = (raceLayerLineY(1) / (RACE_ORB_RADIUS * 2)) * 0.98;
  for (let index = 0; index < 120; index += 1) resolveRaceBounce(sim, grower);
  assert.ok(grower.raceOrbScale > (raceLayerLineY(0) / (RACE_ORB_RADIUS * 2)) * 0.98, "Grower should keep growing past the first-layer cap on lower layers");
  assert.ok(grower.raceOrbScale <= lowerLayerScale + 1e-12, "Grower should cap against the box top for the active lower layer");
  assert.ok(
    Math.abs(grower.raceY - (raceLayerLineY(1) - grower.raceOrbScale * RACE_ORB_RADIUS)) < 1e-12,
    "Grower should remain seated on the number line after it grows",
  );

  grower.raceY = raceLayerLineY(1) - grower.raceOrbScale * RACE_ORB_RADIUS;
  grower.raceVy = 1;
  grower.raceVx = 0;
  let minimumCenterY = Infinity;
  for (let index = 0; index < 180; index += 1) {
    stepSimulation(sim, 1 / 120);
    minimumCenterY = Math.min(minimumCenterY, grower.raceY);
  }
  assert.ok(
    minimumCenterY - grower.raceOrbScale * RACE_ORB_RADIUS <= 1e-9,
    "Grower on a lower layer should be able to reach the top of the race box",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["quadratic", "pi"],
    raceLayerStrengths: [99999, 99999, 99999],
    seed: 3326,
  });
  const quadratic = sim.fighters.find((fighter) => fighter.raceOrbId === "quadratic");
  const pi = sim.fighters.find((fighter) => fighter.raceOrbId === "pi");
  resolveRaceBounce(sim, quadratic);
  resolveRaceBounce(sim, pi);
  assert.equal(quadratic.raceBounces, 1);
  assert.equal(quadratic.raceDamage, 2, "Quadratic should begin at x^1 / 2 damage");
  assert.equal(quadratic.raceSymbol, "x^2", "Quadratic's emblem should advance with its exponent");
  assert.equal(pi.raceDamage, 3, "Pi should multiply its starting damage by the first digit");
  resolveRaceBounce(sim, quadratic);
  assert.equal(quadratic.raceDamage, 4, "Quadratic should advance to x^2");
  resolveRaceBounce(sim, pi);
  assert.equal(pi.raceDamage, 3, "Pi's second digit should multiply the current damage");
  resolveRaceBounce(sim, pi);
  assert.equal(pi.raceDamage, 12, "Pi's third digit should multiply the current damage");
}

{
  const capCases = [
    ["x-squared", 1_000_000_000_000],
    ["fibonacci", 104],
    ["x-power", 20],
    ["phi", 1000],
    ["factorial", 22],
    ["prime", 1_000_000_000_000_000_000_000],
    ["integral", 2_000_000_000_000_000],
    ["quadratic", 70],
  ];
  capCases.forEach(([orbId, bounces], index) => {
    const sim = createSimulation({
      classes: ["fire", "ice"],
      gameplayMode: ORB_RACE_MODE,
      raceTeams: [[orbId], ["orbital"]],
      raceLayerStrengths: [1_000_000_000_000, 1_000_000_000_000, 1_000_000_000_000],
      seed: 3330 + index,
    });
    const racer = sim.fighters.find((fighter) => fighter.raceOrbId === orbId);
    racer.raceBounces = bounces;
    resolveRaceBounce(sim, racer);
    assert.equal(
      racer.raceDamage,
      ORB_RACE_MAX_MATH_DAMAGE,
      `${orbId} should clamp expanded formula damage at the shared maximum`,
    );
  });
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["quadratic", "pi"],
    raceLayerStrengths: [99999, 99999, 99999],
    seed: 3327,
  });
  const quadratic = sim.fighters.find((fighter) => fighter.raceOrbId === "quadratic");
  const pi = sim.fighters.find((fighter) => fighter.raceOrbId === "pi");
  assert.equal(quadratic.raceX, 0.88, "the first slow-math orb should start on the right");
  assert.equal(pi.raceX, 0.12, "the next slow-math orb should start on the opposite side");
  assert.ok(quadratic.raceVx < 0 && pi.raceVx > 0, "same-speed orbs should launch toward one another");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["flash", "speed"],
    raceLayerStrengths: [99999, 99999, 99999],
    seed: 3328,
  });
  const flash = sim.fighters.find((fighter) => fighter.raceOrbId === "flash");
  const speed = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  assert.equal(flash.raceX, 0.88, "Flash should retain the original right-side arc start");
  assert.equal(speed.raceX, 0.88, "Speedster should retain the original right-side arc start");
  assert.ok(flash.raceVx < 0 && speed.raceVx < 0, "Flash and Speedster should launch into their original leftward arcs");
}

{
  assert.equal(RACE_LAYER_HEIGHT, ORB_RACE_PRESENTATION.layerStackFraction / 3);
  assert.ok(Math.abs((raceLayerLineY(1) - raceLayerLineY(0)) - RACE_LAYER_HEIGHT) < 1e-12);
  assert.ok(Math.abs((raceLayerLineY(49) - raceLayerLineY(48)) - RACE_LAYER_HEIGHT) < 1e-12);
  assert.equal(
    raceCheckerStartY(3),
    ORB_RACE_PRESENTATION.orbChamberFraction
      + ORB_RACE_PRESENTATION.layerStackFraction
      + ORB_RACE_PRESENTATION.finishFraction * ORB_RACE_PRESENTATION.finishLabelFraction,
    "the canonical lane geometry must leave the original three-layer finish unchanged",
  );

  const portraitOptions = {
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "orbital"],
    raceLayerStrengths: Array.from({ length: 50 }, () => 99999),
    seed: 3329,
  };
  const portrait = createSimulation({ ...portraitOptions, social: { format: "portrait" } });
  const longform = createSimulation({ ...portraitOptions, social: { format: "race-landscape" } });
  for (let index = 0; index < 180; index += 1) {
    stepSimulation(portrait, 1 / 120);
    stepSimulation(longform, 1 / 120);
  }
  assert.deepEqual(
    portrait.fighters.map((racer) => [racer.raceX, racer.raceY, racer.raceVx, racer.raceVy, racer.raceLayerIndex]),
    longform.fighters.map((racer) => [racer.raceX, racer.raceY, racer.raceVx, racer.raceVy, racer.raceLayerIndex]),
    "export format must not branch or mutate shared Orb Race physics",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "orbital"],
    raceLayerStrengths: [1, 999, 999],
    seed: 3315,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const radius = racer.raceOrbScale * 0.045;
  racer.raceY = 0.25 - radius;
  racer.raceVy = 1;
  stepSimulation(sim, 1 / 120);
  assert.equal(racer.raceLayerIndex, 1, "clearing a number wall should advance the racer to the next wall");
  assert.equal(
    sim.events.filter((event) => event.type === "race-layer-break" && event.fighterId === racer.id && event.layerIndex === 0).length,
    1,
    "clearing a number wall should emit one layer-break event",
  );
  const layerBreakEffect = racer.raceBounceEffects.find((effect) => effect.layerBreak);
  assert.ok(layerBreakEffect, "a direct layer break should create a particle effect");
  assert.equal(layerBreakEffect.particles.length, 12, "layer breaks should emit a deterministic burst of small particles");
  assert.equal(layerBreakEffect.lifetime, 2.6, "layer-break particles should remain alive for a slow fade");
  assert.ok(
    Math.min(...layerBreakEffect.particles.map((particle) => particle.speed)) >= 0.06,
    "layer-break particles should travel far enough to read as a burst",
  );
  assert.ok(
    Math.max(...layerBreakEffect.particles.map((particle) => particle.size)) >= 0.2,
    "layer-break particles should be large enough to see",
  );
  const layerBreakEvent = sim.events.findLast((event) => event.type === "race-layer-break" && event.fighterId === racer.id && event.layerIndex === 0);
  assert.equal(layerBreakEffect.x, layerBreakEvent.x, "layer-break particles should start at the orb impact x position");
  assert.equal(racer.raceLayerTransitionActive, false, "a cleared number line should not start a physical transition");
  assert.ok(racer.raceVy < 0, "an orb that clears a number line with its body should rebound from that impact");
  assert.ok(racer.raceY < raceLayerLineY(1) - radius, "the orb should fall toward the newly active layer");
  for (let index = 0; index < 120 && racer.raceY <= 0.25; index += 1) stepSimulation(sim, 1 / 120);
  assert.ok(racer.raceY > 0.25, "a cleared number wall should let the racer physically fall into the next lane");
  let maximumY = -Infinity;
  for (let index = 0; index < 300; index += 1) {
    stepSimulation(sim, 1 / 120);
    maximumY = Math.max(maximumY, racer.raceY);
  }
  assert.ok(maximumY >= raceLayerLineY(1) - radius - 0.0001, "the orb should then fall to the newly active layer");
}

{
  const strengths = Array.from({ length: 50 }, (_, index) => index === 0 ? 1 : 99999);
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "orbital"],
    raceLayerStrengths: strengths,
    seed: 3317,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "orbital");
  const radius = racer.raceOrbScale * 0.045;
  const brokenLineY = raceLayerLineY(0);
  const nextLineY = raceLayerLineY(1);
  assert.ok(Math.abs((nextLineY - brokenLineY) - ORB_RACE_PRESENTATION.layerStackFraction / 3) < 1e-12);
  racer.raceOrbiters = RACE_ORBITAL_ORBS_PER_RING - 1;
  racer.raceY = brokenLineY - radius;
  racer.raceVy = 1;
  racer.raceVx = 0;
  stepSimulation(sim, 1 / 120);
  assert.equal(racer.raceLayerIndex, 1);
  assert.equal(racer.raceLayerTransitionActive, false, "a cleared wall should not start a physical transition");
  assert.ok(racer.raceVy < 0, "the orb that destroys a wall should rebound from that wall once");
  assert.ok(racer.raceY < nextLineY - radius, "the orb should fall toward the newly active wall");
  const bouncesAfterClear = racer.raceBounces;
  let fellBelowBrokenWall = false;
  let bouncedAtNextLayer = false;
  for (let index = 0; index < 600; index += 1) {
    stepSimulation(sim, 1 / 120);
    if (racer.raceY > brokenLineY + 0.02) fellBelowBrokenWall = true;
    if (racer.raceBounces > bouncesAfterClear) {
      bouncedAtNextLayer = true;
      break;
    }
  }
  assert.ok(fellBelowBrokenWall, "the orb should physically fall below the broken wall on its way to the next layer");
  assert.ok(bouncedAtNextLayer, "the orb should eventually bounce on the newly active wall");
  assert.equal(racer.raceLayerTransitionActive, false, "cleared-wall compatibility state should remain inactive");
  assert.ok(racer.raceY <= nextLineY - radius + 0.0001, "the next collision should occur at the uncompressed portrait lane spacing");
}

{
  const sim = createSimulation({
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed", "orbital"], ["drill"]],
    raceLayerStrengths: [1, 99999, 99999],
    seed: 3316,
    spawnSeed: 3316,
  });
  const team = sim.raceTeams[0];
  const members = sim.fighters.filter((fighter) => fighter.raceTeamIndex === 0);
  for (const racer of members) {
    const radius = racer.raceOrbScale * 0.045;
    racer.raceY = 0.25 - radius;
    racer.raceVy = 1;
    racer.raceVx = 0;
  }
  stepSimulation(sim, 1 / 120);
  assert.equal(team.raceLayerIndex, 1, "a cleared shared wall should expose the next layer immediately for damage rules");
  assert.equal(team.raceLayerTransitionActive, false, "the cleared shared wall should disappear immediately");
  assert.deepEqual(team.raceLayerTransitionReboundedMemberIds, []);
  assert.equal(
    sim.events.filter((event) => event.type === "race-bounce" && event.layerIndex === 0).length,
    1,
    "only the orb that reached the cleared wall should record an old-layer bounce",
  );
  assert.ok(members[0].raceLayerIndex === 1 && members[0].raceVy < 0, "the member that destroys the shared wall should rebound once");
  assert.ok(members.slice(1).every((racer) => racer.raceLayerIndex === 1 && racer.raceVy > 0), "other members should fall toward the new layer without an old-wall rebound");
  run(sim, 1.5);
  assert.equal(team.raceLayerTransitionActive, false, "the shared team should keep cleared-wall state inactive");
  assert.ok(members.every((racer) => racer.raceLayerIndex === 1), "both racers should use the same new layer after descent");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "orbital"],
    raceLayerStrengths: [999, 999, 999],
    raceTeamOptions: [{ speed: { orbScale: 0.55 } }, { orbital: { orbScale: 1 } }],
    raceOrbScale: 0.75,
    seed: 3311,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const orbital = sim.fighters.find((fighter) => fighter.raceOrbId === "orbital");
  assert.equal(racer.raceOrbScale, 0.55, "the selected smaller orb size should reach race physics");
  assert.equal(orbital.raceOrbScale, 1, "a second orb can use a different size on its own track");
  const xSamples = [];
  for (let index = 0; index < 420; index += 1) {
    stepSimulation(sim, 1 / 120);
    if (index % 30 === 0) xSamples.push(racer.raceX);
  }
  assert.ok(Math.max(...xSamples) - Math.min(...xSamples) > 0.2, "the launch's seeded horizontal direction should keep race orbs moving around the box");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "orbital"],
    raceLayerStrengths: [999, 999, 999],
    seed: 3312,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "orbital");
  const launchSpeed = Math.abs(racer.raceVx);
  let reboundSpeed = 0;
  for (let index = 0; index < 1000 && reboundSpeed === 0; index += 1) {
    stepSimulation(sim, 1 / 120);
    if (racer.raceX <= racer.raceOrbScale * 0.045 + 0.0001 && racer.raceVx > 0) reboundSpeed = racer.raceVx;
  }
  assert.ok(reboundSpeed > 0, "a racer should rebound from the left wall toward the right");
  assert.ok(Math.abs(reboundSpeed - launchSpeed) < 0.0001, "wall rebounds should preserve horizontal speed instead of adding momentum");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "orbital"],
    raceLayerStrengths: [1, 1, 1],
    seed: 3313,
  });
  const racer = sim.fighters.find((fighter) => fighter.raceOrbId === "speed");
  const loser = sim.fighters.find((fighter) => fighter.raceOrbId === "orbital");
  const team = sim.raceTeams[racer.raceTeamIndex];
  team.raceLayerIndex = 2;
  team.raceLayerHealth.splice(0, 3, 0, 0, 1);
  racer.raceLayerIndex = 2;
  resolveRaceBounce(sim, racer);
  assert.equal(racer.raceReadyToFinish, true, "clearing the final number wall should arm the finish run");
  assert.equal(sim.finished, false, "clearing every layer alone must not award a win");
  racer.raceY = 0.9;
  racer.raceVy = 1;
  stepSimulation(sim, 1 / 120);
  assert.equal(sim.finished, true, "a racer should win only after crossing into the checkerboard flag");
  assert.equal(sim.winner.id, racer.id);
  assert.equal(loser.raceFinishExploded, true, "the losing orb should be marked as exploded at the finish");
  const finishExplosions = loser.raceBounceEffects.filter((effect) => effect.finishExplosion);
  assert.equal(finishExplosions.length, 1, "the losing orb should receive one finish explosion");
  assert.equal(finishExplosions[0].layerBreak, true, "finish explosions should reuse layer-break particles");
  assert.equal(finishExplosions[0].particles.length, 12, "finish explosions should use the full visible particle burst");
  assert.equal(finishExplosions[0].lifetime, 2.6, "finish explosions should fade at the layer-break particle pace");
  assert.equal(finishExplosions[0].x, loser.raceX, "the losing burst should start at the losing orb's final x position");
  assert.equal(finishExplosions[0].y, loser.raceY, "the losing burst should start at the losing orb's final y position");
}

{
  const sim = createSimulation({
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["batman", "flash"], ["grower", "sticky", "fibonacci"]],
    raceTeamOptions: [{
      batman: { fadingTrails: true, solidTrails: false, scalingDamage: false },
      flash: { fadingTrails: false, solidTrails: true, scalingDamage: true },
    }, {
      grower: { fadingTrails: true, solidTrails: true, scalingDamage: true },
      sticky: { fadingTrails: false, solidTrails: false, scalingDamage: false },
      fibonacci: { fadingTrails: false, solidTrails: false, scalingDamage: true },
    }],
    raceLayerStrengths: [50, 50, 50],
    seed: 3342,
  });
  assert.equal(sim.fighters.length, 5, "every selected team member should become an independently simulated orb");
  assert.deepEqual(sim.raceTeams.map((team) => team.orbIds), [
    ["batman", "flash"],
    ["grower", "sticky", "fibonacci"],
  ]);
  assert.deepEqual(sim.raceTeams.map((team) => team.name), ["BATMAN + FLASH", "GROWER + STICKY + FIBONACCI"]);
  const batman = sim.fighters.find((fighter) => fighter.raceOrbId === "batman");
  const flash = sim.fighters.find((fighter) => fighter.raceOrbId === "flash");
  const grower = sim.fighters.find((fighter) => fighter.raceOrbId === "grower");
  assert.equal(batman.raceFadingTrailsEnabled, true);
  assert.equal(batman.raceScalingDamageEnabled, false);
  assert.equal(flash.raceSolidTrailsEnabled, true);
  assert.strictEqual(batman.raceLayerHealth, flash.raceLayerHealth, "teammates should damage one shared set of number walls");
  assert.notStrictEqual(batman.raceLayerHealth, grower.raceLayerHealth, "opposing teams should retain separate layer health");
  resolveRaceBounce(sim, batman);
  resolveRaceBounce(sim, flash);
  assert.equal(batman.raceDamage, 1, "per-orb scaling can be disabled without changing a teammate's option");
  assert.equal(flash.raceDamage, 2, "a teammate with scaling enabled should still ramp normally");
  assert.equal(sim.raceTeams[0].raceLayerHealth[0], 47, "both teammates' damage should accumulate on their shared track");
  assert.equal(sim.raceTeams[1].raceLayerHealth[0], 50, "team damage must not leak to the opposing track");
  assert.equal(sim.raceTeams[0].raceDamagePerSecond, 3, "team HUD damage per second should total recent damage from every member");

  const winningTeam = sim.raceTeams[0];
  winningTeam.raceLayerIndex = 2;
  winningTeam.raceLayerHealth.splice(0, 3, 0, 0, 1);
  for (const fighter of sim.fighters.filter((candidate) => candidate.raceTeamIndex === 0)) {
    fighter.raceLayerIndex = 2;
    fighter.raceReadyToFinish = false;
  }
  resolveRaceBounce(sim, batman);
  assert.ok(sim.fighters.filter((fighter) => fighter.raceTeamIndex === 0).every((fighter) => fighter.raceReadyToFinish), "clearing a shared final wall should arm every teammate for the finish");
  batman.raceY = 0.99;
  batman.raceVy = 0.1;
  stepOrbRace(sim, 1 / 120);
  assert.equal(sim.finished, true);
  assert.equal(sim.winningRaceTeamIndex, 0, "the first teammate across the flag should win for the whole team");
  assert.equal(sim.winningRaceTeamName, "BATMAN + FLASH");
  assert.ok(sim.fighters.filter((fighter) => fighter.raceTeamIndex === 0).every((fighter) => fighter.raceFinished));
}

{
  const options = {
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed", "orbital"], ["drill", "grower"]],
    raceLayerStrengths: [8, 9, 10],
    seed: 3343,
    spawnSeed: 3343,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  run(first, 45);
  run(second, 45);
  assert.deepEqual(
    first.raceTeams.map((team) => [team.raceLayerIndex, team.raceLayerHealth, team.raceFinished]),
    second.raceTeams.map((team) => [team.raceLayerIndex, team.raceLayerHealth, team.raceFinished]),
    "seeded team races should produce deterministic shared-track outcomes",
  );
  assert.equal(first.winningRaceTeamIndex, second.winningRaceTeamIndex);
  assert.ok(first.finished && first.winner, "a deterministic team race should select a winner");
}

{
  const options = {
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["boomerang", "magnet", "mines"], ["gravity", "jackpot", "speed-impact"]],
    raceLayerStrengths: [40, 55, 70],
    seed: 3356,
    spawnSeed: 3356,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  for (let step = 0; step < 1800 && !first.finished && !second.finished; step += 1) {
    stepOrbRace(first, 1 / 120);
    stepOrbRace(second, 1 / 120);
  }
  assert.deepEqual(
    captureReplayFrame(first),
    captureReplayFrame(second),
    "new Orb Race abilities and their replay state should be deterministic for the same seed",
  );
}

{
  const sim = createSimulation({
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["boomerang", "magnet"], ["speed-impact"]],
    raceLayerStrengths: [1, 1, 1],
    seed: 3357,
  });
  const boomerang = sim.fighters.find((fighter) => fighter.raceOrbId === "boomerang");
  const team = sim.raceTeams[0];
  team.raceLayerIndex = 2;
  team.raceLayerHealth.splice(0, 3, 0, 0, 0);
  for (const member of sim.fighters.filter((fighter) => fighter.raceTeamIndex === 0)) {
    member.raceLayerIndex = 2;
  }
  resolveRaceBounce(sim, boomerang);
  boomerang.raceY = 0.99;
  boomerang.raceVy = 1;
  stepOrbRace(sim, 1 / 120);
  assert.equal(sim.winningRaceTeamIndex, 0);
  assert.equal(sim.winningRaceTeamName, "BOOMERANG + MAGNET");
  assert.equal(sim.winner.raceOrbId, "boomerang", "a new racer crossing the checkerboard should select its team as winner");
}

{
  const options = { count: 2, classes: ["fire", "ice"], gameplayMode: ORB_RACE_MODE, raceOrbs: ["drill", "speed"], raceLayerStrengths: [20, 30, 40], seed: 3303, spawnSeed: 3303 };
  const a = createSimulation(options);
  const b = createSimulation(options);
  run(a, 30);
  run(b, 30);
  assert.deepEqual(a.fighters.map((fighter) => [fighter.raceDamage, fighter.raceSpeed, fighter.raceDrills, fighter.raceLayerHealth]), b.fighters.map((fighter) => [fighter.raceDamage, fighter.raceSpeed, fighter.raceDrills, fighter.raceLayerHealth]));
  assert.ok(a.finished && a.winner, "a racer should win after breaking all configured layers");
  assert.ok(a.events.some((event) => event.type === "race-finish"), "finishing an Orb Race should emit the World Cup KO audio cue");
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 10 });
  const [a, b] = sim.fighters;
  a.x = 350;
  b.x = 410;
  a.y = b.y = 300;
  a.vx = b.vx = 0;
  a.vy = b.vy = 0;
  a.weaponLastHit[b.id] = 999;
  b.weaponLastHit[a.id] = 999;
  stepSimulation(sim, 1 / 120);
  assert.ok(a.vx < -a.baselineSpeed * 0.32, "overlapping orbs should separate with visible bounce");
  assert.ok(b.vx > b.baselineSpeed * 0.32, "overlapping orbs should separate with visible bounce");
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 5 });
  const [fire, target] = sim.fighters;
  arrangeWeaponHit(fire, target);
  target.x = 460;
  fire.cooldown = 0;
  const segment = getWeaponSegment(fire, sim.time);
  assert.ok(segment.x2 > target.x);
  const speedBeforeHit = Math.hypot(target.vx, target.vy);
  stepSimulation(sim, 1 / 120);
  assert.ok(target.health < 100, "ember sword should damage its target");
  assert.ok(
    Math.hypot(target.vx, target.vy) <= speedBeforeHit,
    "weapon hits should not add velocity",
  );
  const hitEvent = sim.events.find((event) => event.type === "weapon-hit");
  assert.ok(Number.isFinite(hitEvent?.x) && Number.isFinite(hitEvent?.y));
  assert.equal(fire.cooldown, 0, "Cinder should not have an active cooldown");
  assert.equal(target.burnTicksRemaining, 4, "ember sword should queue four burn ticks");
  assert.ok(target.burnUntil - sim.time > 3.9, "ember sword burn should last four seconds");
  assert.equal(sim.events.some((event) => event.type === "backstab"), false);
  const weaponEffect = sim.effects.find((effect) => effect.kind === "weapon-hit");
  assert.ok(weaponEffect.amount > 0, "weapon-hit feedback should include exact damage");
  const healthAfterSword = target.health;
  fire.weaponLastHit[target.id] = 999;
  fire.x = 80;
  fire.y = 80;
  target.x = 850;
  target.y = 480;
  run(sim, 4.1);
  assert.equal(healthAfterSword - target.health, 4.5, "burn should start lower and grow after each successful tick");
  assert.equal(target.burnTicksRemaining, 0);
  assert.equal(sim.events.filter((event) => event.type === "burn-tick").length, 4);
  const analytics = buildMatchAnalytics(sim).fighters.find((fighter) => fighter.id === fire.id);
  assert.equal(analytics.weaponHits, 1);
  assert.equal(analytics.burnDamage, 4.5);
  assert.ok(analytics.directDamage > 0);
}

{
  const sim = createSimulation({ count: 2, classes: ["ice", "fire"], seed: 6 });
  const [ice, target] = sim.fighters;
  assert.equal(ice.cooldown, 30, "Frost should begin with a thirty-second hailstorm charge");
  ice.x = 100;
  ice.y = 100;
  ice.vx = 0;
  ice.vy = 0;
  ice.baselineSpeed = 0;
  ice.weaponLastHit[target.id] = 999;
  target.x = 500;
  target.y = 280;
  target.vx = 0;
  target.vy = 0;
  target.baselineSpeed = 0;
  target.stunUntil = 10;
  target.weaponLastHit[ice.id] = 999;
  ice.cooldown = 0;
  const health = target.health;
  stepSimulation(sim, 1 / 120);
  assert.equal(target.slowUntil, 0, "Frost Scythe hits should no longer apply slow");
  assert.equal(ice.cooldown, 30);
  assert.equal(sim.hailstorms.length, 1);
  const storm = sim.hailstorms[0];
  const playableArea = (ARENA.width - ARENA.padding * 2) * (ARENA.height - ARENA.padding * 2);
  assert.ok(Math.abs((storm.width * storm.height) / playableArea - 0.3) < 0.0001);
  assert.equal(ice.weapon.damage, 4);
  assert.equal(ice.weapon.length, 64 * WEAPON_REACH_SCALE);
  assert.equal(ice.weapon.width, 13 * WEAPON_SIZE_SCALE);
  assert.equal(ice.weapon.angularSpeed, -2.4 * WEAPON_ROTATION_SCALE);
  run(sim, 5.1);
  assert.equal(health - target.health, 20, "hailstorm should start lower and ramp on each successful tick");
  assert.equal(sim.hailstorms.length, 0);
  const analytics = buildMatchAnalytics(sim).fighters.find((fighter) => fighter.id === ice.id);
  assert.equal(analytics.hailstormsCast, 1);
  assert.equal(analytics.hailstormHits, 5);
  assert.equal(analytics.hailstormDamage, 20);
}

{
  const sim = createSimulation({ count: 3, classes: ["wizard", "fire", "ice"], seed: 7 });
  const [wizard, target, farTarget] = sim.fighters;
  arrangeWeaponHit(wizard, target);
  farTarget.x = 800;
  farTarget.y = 480;
  farTarget.cooldown = 999;
  farTarget.weaponLastHit[wizard.id] = 999;
  wizard.mana = 0;
  stepSimulation(sim, 1 / 120);
  assert.ok(wizard.mana >= 15, "rune staff hits should charge mana");
  const nearHealthBeforeBurst = target.health;
  const farHealthBeforeBurst = farTarget.health;
  wizard.mana = 100;
  stepSimulation(sim, 1 / 120);
  assert.equal(wizard.mana, 0);
  const burstEvent = sim.events.find((event) => event.type === "arcane-burst");
  assert.equal(
    burstEvent?.radius,
    144,
    "arcane burst should use the larger 360-degree radius",
  );
  assert.ok(Number.isFinite(burstEvent?.x) && Number.isFinite(burstEvent?.y));
  assert.ok(
    Math.hypot(burstEvent.x - wizard.x, burstEvent.y - wizard.y) > wizard.radius,
    "arcane burst should originate at the wand tip",
  );
  assert.equal(nearHealthBeforeBurst - target.health, 9, "arcane burst should use the ramped ability damage in range");
  assert.equal(farTarget.health, farHealthBeforeBurst, "arcane burst should not damage targets outside its short radius");
  assert.ok(sim.events.some((event) => event.type === "arcane-burst"));
  assert.ok(sim.events.some((event) => event.type === "arcane-burst-hit" && event.targetId === target.id));
  assert.ok(
    sim.effects.some((effect) => effect.kind === "ability-particles" && effect.fighterType === "wizard"),
    "arcane burst should spawn class particles",
  );
  const burstEffect = sim.effects.find((effect) => effect.kind === "arcane-burst");
  assert.ok(burstEffect, "arcane burst should render a 360 pulse");
  assert.ok(Number.isFinite(burstEffect.wandX) && Number.isFinite(burstEffect.wandY));
  const analytics = buildMatchAnalytics(sim).fighters.find((fighter) => fighter.id === wizard.id);
  assert.equal(analytics.arcaneBurstTargets, 1);
  assert.equal(analytics.arcaneBurstDamage, 9);
}

{
  const sim = createSimulation({ count: 2, classes: ["time", "fire"], seed: 8 });
  const chrono = sim.fighters[0];
  chrono.cooldown = 0;
  stepSimulation(sim, 1 / 120);
  assert.ok(sim.timeStop, "time ability should freeze opponents");
  assert.ok(chrono.weaponBoostUntil > sim.time, "time stop should empower the hour glaive");
  assert.equal(sim.projectiles.length, 0, "time stop should not create projectile damage");
  assert.ok(sim.events.some((event) => event.type === "time-stop"));
  assert.ok(
    sim.effects.some((effect) => effect.kind === "ability-particles" && effect.fighterType === "time"),
    "time stop should spawn clock particles",
  );
  const analytics = buildMatchAnalytics(sim).fighters.find((fighter) => fighter.id === chrono.id);
  assert.equal(analytics.timeStops, 1);
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 10 });
  const [attacker, target] = sim.fighters;
  arrangeWeaponHit(attacker, target);
  target.health = 1;
  stepSimulation(sim, 1 / 120);
  assert.equal(sim.finished, true);
  assert.equal(sim.winner.id, attacker.id);
  assert.ok(sim.events.some((event) => event.type === "victory"));
}

{
  const sim = createSimulation({ count: 4, seed: 2406 });
  run(sim, 180);
  assert.ok(sim.weaponHits > 0 || sim.fighters.some((fighter) => fighter.damageDone > 0));
  const analytics = sim.analytics || buildMatchAnalytics(sim);
  assert.equal(analytics.fighters.length, 2);
  assert.equal(analytics.awards.length, 3);
  assert.ok(analytics.timeline.length > 0);
  assert.ok(analytics.fighters.some((fighter) => fighter.accuracy > 0));
  assert.deepEqual(
    analytics.awards.map((award) => award.title),
    ["DEADLIEST WEAPON", "BEST ACCURACY", "MOST UNLUCKY"],
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["factorial", "prime"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 8601,
  });
  const factorial = sim.fighters.find((fighter) => fighter.raceOrbId === "factorial");
  const prime = sim.fighters.find((fighter) => fighter.raceOrbId === "prime");
  for (let bounce = 0; bounce < 4; bounce += 1) resolveRaceBounce(sim, factorial);
  assert.equal(factorial.raceDamage, 24, "Factorial should scale damage as n! per bounce");
  for (const expectedDamage of [2, 3, 5, 7, 11]) {
    resolveRaceBounce(sim, prime);
    assert.equal(prime.raceDamage, expectedDamage, "Prime should deal the next prime number on each bounce");
  }
  assert.equal(prime.racePrimeHits, 5, "Prime should count each prime-sequence hit");
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["integral", "speed"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 8602,
  });
  const integral = sim.fighters.find((fighter) => fighter.raceOrbId === "integral");
  assert.equal(integral.raceIntegralPath.length, 0, "Integral should not draw a pre-landing spawn arc");
  for (let step = 0; step < 720 && integral.raceBounces === 0; step += 1) stepOrbRace(sim, 1 / 120);
  assert.equal(integral.raceIntegralPath.length, 1, "Integral should seed its trace at the landing point");
  stepOrbRace(sim, 0.08);
  assert.ok(integral.raceIntegralPath.length > 1, "Integral should sample the arc after its landing point");
  integral.raceIntegralCharge = 4.9;
  const healthBefore = integral.raceLayerHealth[0];
  resolveRaceBounce(sim, integral);
  const hit = [...sim.events].reverse().find((event) => event.type === "race-bounce");
  assert.ok(integral.raceIntegralTotal > integral.raceDamage, "Integral should add stored area damage to its hit");
  assert.ok(integral.raceLayerHealth[0] < healthBefore, "Integral should damage the active number line");
  assert.equal(hit.type, "race-bounce");
  assert.equal(integral.raceIntegralCharge, 0, "Integral should reset its stored area after impact");
  integral.raceIntegralPath = [{ x: 0.5, y: 0.1 }];
  resolveRaceBounce(sim, integral);
  assert.deepEqual(integral.raceIntegralPath, [{ x: integral.raceX, y: integral.raceY }], "Integral's next trace should restart at the new landing point");
}

{
  const first = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["ricochet", "sawblade"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 8603,
    features: { replay: true },
  });
  const second = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["ricochet", "sawblade"],
    raceLayerStrengths: [999999, 999999, 999999],
    seed: 8603,
    features: { replay: true },
  });
  const ricochet = first.fighters.find((fighter) => fighter.raceOrbId === "ricochet");
  const sawblade = first.fighters.find((fighter) => fighter.raceOrbId === "sawblade");
  const secondRicochet = second.fighters.find((fighter) => fighter.raceOrbId === "ricochet");
  const secondSawblade = second.fighters.find((fighter) => fighter.raceOrbId === "sawblade");
  for (let bounce = 0; bounce < 3; bounce += 1) resolveRaceBounce(first, ricochet);
  for (let bounce = 0; bounce < 4; bounce += 1) resolveRaceBounce(first, sawblade);
  for (let bounce = 0; bounce < 3; bounce += 1) resolveRaceBounce(second, secondRicochet);
  for (let bounce = 0; bounce < 4; bounce += 1) resolveRaceBounce(second, secondSawblade);
  assert.equal(ricochet.raceRicochetProjectiles.length, 1, "Ricochet should fire one bullet every three bounces");
  assert.equal(sawblade.raceSawbladeProjectiles.length, 1, "Sawblade should fire one blade every four bounces");
  const ricochetProjectile = ricochet.raceRicochetProjectiles[0];
  ricochetProjectile.x = 0.5;
  ricochetProjectile.y = 0.1;
  ricochetProjectile.vx = 0;
  ricochetProjectile.vy = 0.9;
  const secondRicochetProjectile = secondRicochet.raceRicochetProjectiles[0];
  secondRicochetProjectile.x = 0.5;
  secondRicochetProjectile.y = 0.1;
  secondRicochetProjectile.vx = 0;
  secondRicochetProjectile.vy = 0.9;
  const healthBefore = ricochet.raceLayerHealth[0];
  stepOrbRace(first, 0.2);
  stepOrbRace(second, 0.2);
  assert.ok(ricochet.raceLayerHealth[0] < healthBefore, "Ricochet bullets should damage the active number line");
  assert.ok(first.events.some((event) => event.type === "race-ricochet-hit"));
  const sawbladeProjectile = sawblade.raceSawbladeProjectiles[0];
  sawbladeProjectile.x = 0.5;
  sawbladeProjectile.y = 0.1;
  sawbladeProjectile.vx = 0;
  sawbladeProjectile.vy = 0.9;
  const secondSawbladeProjectile = secondSawblade.raceSawbladeProjectiles[0];
  secondSawbladeProjectile.x = 0.5;
  secondSawbladeProjectile.y = 0.1;
  secondSawbladeProjectile.vx = 0;
  secondSawbladeProjectile.vy = 0.9;
  const sawHealthBefore = sawblade.raceLayerHealth[0];
  stepOrbRace(first, 0.2);
  stepOrbRace(second, 0.2);
  assert.ok(sawblade.raceLayerHealth[0] < sawHealthBefore, "Sawblades should damage the active number line");
  assert.ok(first.events.some((event) => event.type === "race-sawblade-hit"));
  for (let step = 0; step < 240; step += 1) {
    stepSimulation(first, 1 / 120);
    stepSimulation(second, 1 / 120);
  }
  assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second), "new weapon projectiles should replay deterministically");
}

{
  const options = {
    count: 2,
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["fibonacci"], ["phi"]],
    raceLayerCount: 6,
    raceLayerStrengths: [12, 24, 48, 96, 192, 384],
    seed: 6066,
    spawnSeed: 6066,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  assert.equal(first.raceLayerCount, 6);
  assert.equal(first.fighters[0].raceLayerHealth.length, 6);
  for (let step = 0; step < 480; step += 1) {
    stepSimulation(first, 1 / 120);
    stepSimulation(second, 1 / 120);
  }
  assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second), "custom-layer long-form races should remain deterministic");
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["speed"], ["flash"]],
    raceLayerStrengths: [100, 200, 300],
    raceTiltedLayerEnabled: true,
    raceTiltedLayerIndex: 0,
    seed: 91919,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  const speed = first.fighters[0];
  const replaySpeed = second.fighters[0];
  for (const racer of [speed, replaySpeed]) {
    racer.raceSpeed = 1_501;
    racer.raceX = 0.42;
    racer.raceY = raceTiltedLayerSurfaceY(0, racer.raceX) - RACE_ORB_RADIUS * racer.raceOrbScale - 0.001;
    racer.raceVy = 1;
  }
  stepOrbRace(first, 1 / 120);
  stepOrbRace(second, 1 / 120);
  assert.equal(speed.raceSpeed, 1_500, "the tilted-wall easter egg should reset Speedster to 1.5K");
  assert.equal(speed.raceLayerIndex, 1, "the 1.5K glitch should slip beneath the selected tilted wall");
  assert.equal(
    speed.raceY,
    raceLayerLineY(1) - RACE_ORB_RADIUS * speed.raceOrbScale,
    "the 1.5K glitch should visually teleport the orb beneath the tilted wall",
  );
  assert.equal(speed.raceLayerBreakReboundActive, false, "the clip-through should not create a fake wall rebound");
  assert.equal(speed.raceLayerHealth[0], 100, "the tilted wall should remain intact during the clip-through");
  assert.deepEqual(speed.raceTiltedLayerHealth[0], [100, 100], "neither tilted piece should be destroyed by the clip-through");
  assert.equal(speed.raceLayerHealth[1], 200, "the next layer should remain an independent, untouched wall");
  assert.ok(first.events.some((event) => event.type === "race-tilted-glitch" && event.teleported === true && event.destroyed === false));
  assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second));
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["flash"], ["speed"]],
    raceLayerStrengths: [100, 200, 300],
    raceTiltedLayerEnabled: true,
    raceTiltedLayerIndex: 0,
    seed: 91920,
  });
  const flash = sim.fighters[0];
  flash.raceSpeed = 1_501;
  flash.raceX = 0.42;
  flash.raceY = raceTiltedLayerSurfaceY(0, flash.raceX) - RACE_ORB_RADIUS * flash.raceOrbScale - 0.001;
  flash.raceVy = 1;
  const tiltedHealth = [...flash.raceTiltedLayerHealth[0]];
  stepOrbRace(sim, 1 / 120);
  assert.equal(flash.raceLayerIndex, 1, "Flash should use the same under-wall clip path as Speedster");
  assert.equal(flash.raceY, raceLayerLineY(1) - RACE_ORB_RADIUS * flash.raceOrbScale);
  assert.deepEqual(flash.raceTiltedLayerHealth[0], tiltedHealth, "Flash should not destroy the tilted wall");
  assert.ok(sim.events.some((event) => event.type === "race-tilted-glitch" && event.raceOrbId === "flash" && event.teleported === true));
}

{
  const makeRace = (orbId, layer = 1_000_000) => createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [[orbId], ["orbital"]],
    raceLayerStrengths: [layer, layer, layer],
    seed: 81281,
  });

  const centySim = makeRace("centy", 1000);
  const centy = centySim.fighters[0];
  resolveRaceBounce(centySim, centy);
  assert.equal(centy.raceCentyPercent, 1.1);
  assert.equal(centy.raceLayerHealth[0], 990, "Centy's first hit should use its starting 1% before the bounce raises the next hit");
  resolveRaceBounce(centySim, centy);
  assert.equal(centy.raceLayerHealth[0], 979, "Centy's second hit should use 1.1% of the configured layer maximum");

  const centyExampleSim = makeRace("centy", 100);
  resolveRaceBounce(centyExampleSim, centyExampleSim.fighters[0]);
  assert.equal(centyExampleSim.fighters[0].raceLayerHealth[0], 99, "1% of a 100-health layer should deal exactly 1 damage");

  const infinitySim = makeRace("infinity", 1_000_000_000_000_000_000);
  const infinity = infinitySim.fighters[0];
  assert.ok(infinity.raceDamage > 1_000_000_000_000_000_000);
  resolveRaceBounce(infinitySim, infinity);
  assert.equal(infinity.raceLayerIndex, 1, "Infinity should clear a quintillion-health wall in one hit");

  for (const [orbId, expected] of [["cubed", 8], ["double", 4], ["tripler", 9]]) {
    const sim = makeRace(orbId);
    const racer = sim.fighters[0];
    resolveRaceBounce(sim, racer);
    resolveRaceBounce(sim, racer);
    assert.equal(racer.raceDamage, expected, `${orbId} should use its requested two-bounce math ramp`);
  }

  const comboSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["tripler"], ["orbital"]],
    raceTeamOptions: [{ tripler: { comboAbilities: ["fibonacci", "orbital"] } }, {}],
    raceLayerStrengths: [1_000_000, 1_000_000, 1_000_000],
    seed: 81282,
  });
  const combo = comboSim.fighters[0];
  resolveRaceBounce(comboSim, combo);
  assert.equal(combo.raceDamage, 3);
  assert.equal(combo.raceOrbiters, 1, "Tripler/Fibonacci/Orbital combinations should compose both math and orbiter progression");
  assert.equal(raceUsesProjectileOnlyBodyDamage(combo), true);
}

{
  const makeRace = (orbId) => createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [[orbId], ["orbital"]],
    raceLayerStrengths: [1_000_000_000, 1_000_000_000, 1_000_000_000],
    seed: 91024,
  });

  const chargerSim = makeRace("charger");
  const charger = chargerSim.fighters[0];
  resolveRaceBounce(chargerSim, charger);
  assert.equal(charger.raceChargerInterval, 1.49);
  const chargeBounceCountBefore = charger.raceBounces;
  const chargeDamageBefore = charger.raceDamage;
  run(chargerSim, 1.8);
  assert.ok(charger.raceChargerSlams >= 1);
  const chargerSlam = chargerSim.events.findLast((event) => event.type === "race-charger-slam");
  assert.ok(chargerSlam?.damage >= 3);
  assert.ok(charger.raceBounces > chargeBounceCountBefore, "a Charger slam should count as a bounce");
  assert.ok(charger.raceDamage > chargeDamageBefore, "a Charger slam should advance the normal damage ramp");
  assert.equal(chargerSlam?.countedAsBounce, true);
  assert.equal(chargerSlam?.bounces, charger.raceBounces);

  const bouncerSim = makeRace("bouncer");
  const bouncer = bouncerSim.fighters[0];
  for (let index = 0; index < 5; index += 1) resolveRaceBounce(bouncerSim, bouncer);
  bouncer.raceBouncerNextSpawnAt = 0;
  stepSimulation(bouncerSim, 1 / 120);
  const spawn = bouncerSim.events.findLast((event) => event.type === "race-bouncer-spawn");
  assert.equal(spawn?.lifetimeBounces, 5);
  const mini = bouncer.raceBouncerOrbs[0];
  assert.equal(mini.raceDamage, bouncer.raceDamage, "a Bouncer mini should snapshot its parent's current damage");
  for (let index = 0; index < 5; index += 1) resolveRaceBounce(bouncerSim, bouncer, mini);
  stepSimulation(bouncerSim, 1 / 120);
  assert.equal(bouncer.raceBouncerOrbs.includes(mini), false, "a Bouncer mini should disappear after its inherited bounce lifetime");
  assert.equal(raceUsesProjectileOnlyBodyDamage(bouncer), true);

  const blueSunSim = makeRace("blue-sun");
  const blueSun = blueSunSim.fighters[0];
  const before = blueSun.raceLayerHealth[0];
  resolveRaceBounce(blueSunSim, blueSun);
  assert.equal(blueSun.raceLayerHealth[0], before, "Blue Sun's body should never damage a number wall");
  run(blueSunSim, 5.2);
  assert.equal(blueSun.raceBlueSunActive, true);
  const blueSunLevelOneDamagePerLaser = blueSun.raceBlueSunDamagePerLaser;
  assert.ok(blueSun.raceLayerHealth[0] < before);
  assert.equal(blueSun.raceBlueSunLasers.length, 8, "Blue Sun should expose one physical segment for each laser");
  assert.equal(blueSun.raceBlueSunLaserAngles.length, 8, "Blue Sun should expose one seeded base angle per laser");
  const blueSunAngles = [...blueSun.raceBlueSunLaserAngles];
  const fullTurn = Math.PI * 2;
  const expectedGap = fullTurn / blueSun.raceBlueSunLaserAngles.length;
  assert.ok(
    blueSunAngles.every((angle, index) => {
      const next = blueSunAngles[(index + 1) % blueSunAngles.length];
      const gap = (next - angle + fullTurn) % fullTurn;
      return Math.abs(gap - expectedGap) < 1e-9;
    }),
    "Orb Race Blue Sun rays should remain evenly distributed around the orb",
  );
  const firstRayAngles = blueSun.raceBlueSunLasers.map(({ angle }) => angle);
  stepSimulation(blueSunSim, 1 / 60);
  assert.deepEqual(blueSun.raceBlueSunLaserAngles, blueSunAngles, "laser base angles should remain fixed during an activation");
  const secondRayAngles = blueSun.raceBlueSunLasers.map(({ angle }) => angle);
  assert.ok(
    secondRayAngles.every((angle, index) => {
      const advance = (angle - firstRayAngles[index] + fullTurn) % fullTurn;
      return Math.abs(advance - 1.8 / 60) < 1e-9;
    }),
    "Orb Race Blue Sun rays should rotate smoothly while their evenly spaced base angles remain stable",
  );
  assert.equal(
    blueSun.raceBlueSunLayerHits,
    blueSun.raceBlueSunLasers.filter((laser) => laser.hitLayer).length,
    "Blue Sun's damage count should match only rays that collide with the active number line",
  );
  assert.ok(
    blueSun.raceBlueSunLasers.every((laser) => (
      laser.startX >= 0 && laser.startX <= 1
      && laser.endX >= 0 && laser.endX <= 1
      && laser.endY >= 0 && laser.endY <= 1
      && (!laser.hitLayer || Math.abs(laser.endY - raceLayerLineY(0)) < 1e-9)
    )),
    "Blue Sun laser endpoints should stop inside the arena at their first collision surface",
  );
  const blueImpacts = blueSun.raceBounceEffects.filter((effect) => effect.blueSunImpact === true);
  assert.ok(blueImpacts.length > 0, "Blue Sun should create expanding impact circles at laser contacts");
  assert.ok(blueImpacts.every((effect) => effect.ringCount === 3 && effect.lifetime > 0.7), "Blue Sun impact circles should use a visible three-ring lifetime");
  run(blueSunSim, 5);
  assert.equal(blueSun.raceBlueSunPowerLevel, 2);
  assert.equal(blueSun.raceBlueSunDamagePerLaser, 2000);
  assert.ok(blueSun.raceBlueSunNextReadyAt > blueSunSim.time, "Blue Sun cooldown should restart only after the lasers finish");

  const purpleSunSim = makeRace("purple-sun");
  const purpleSun = purpleSunSim.fighters[0];
  const purpleBefore = purpleSun.raceLayerHealth[0];
  resolveRaceBounce(purpleSunSim, purpleSun);
  assert.equal(purpleSun.raceLayerHealth[0], purpleBefore, "Purple Sun's body should never damage a number wall");
  assert.equal(raceUsesProjectileOnlyBodyDamage(purpleSun), true);
  run(purpleSunSim, 5.2);
  assert.equal(purpleSun.racePurpleSunActive, true, "Purple Sun should activate on Blue Sun's timed cycle");
  assert.equal(purpleSun.racePurpleSunPowerLevel, 1);
  assert.equal(
    purpleSun.racePurpleSunBeamDamage,
    blueSunLevelOneDamagePerLaser * 8,
    "one Purple Sun beam should equal all eight level-one Blue Sun beams",
  );
  assert.ok(purpleSun.racePurpleSunBeam, "Purple Sun should expose its active beam geometry");
  assert.equal(purpleSun.racePurpleSunBeam.startX, purpleSun.racePurpleSunBeam.endX, "Purple Sun's beam should point straight down");
  assert.ok(purpleSun.racePurpleSunBeam.endY > purpleSun.racePurpleSunBeam.startY, "Purple Sun's beam should extend toward the number line");
  assert.equal(purpleSun.racePurpleSunBeam.hitLayer, true);
  assert.ok(purpleSun.raceLayerHealth[0] < purpleBefore, "Purple Sun's beam should damage the active number line");
  const purpleImpact = [...purpleSun.raceBounceEffects].reverse().find((effect) => effect.purpleSunImpact === true);
  assert.ok(purpleImpact, "Purple Sun should create a visual impact effect at the beam contact");
  assert.ok(purpleImpact.x >= 0 && purpleImpact.x <= 1, "Purple Sun impact should stay inside the arena horizontally");
  assert.equal(purpleImpact.y, raceLayerLineY(0), "Purple Sun impact should be anchored to the active number line");
  assert.equal(purpleImpact.ringCount, 3, "Purple Sun impacts should use three expanding rings");
  assert.equal(purpleImpact.color, "#a855f7");
  assert.ok(purpleSun.racePurpleSunCharge > 0 && purpleSun.racePurpleSunCharge < 1, "Purple Sun should transition gradually instead of snapping purple");
  const chargeBefore = purpleSun.racePurpleSunCharge;
  stepSimulation(purpleSunSim, 1 / 60);
  assert.ok(purpleSun.racePurpleSunCharge > chargeBefore, "Purple Sun's color charge should advance deterministically");
  run(purpleSunSim, 5);
  assert.equal(purpleSun.racePurpleSunUses, 1, "Purple Sun should finish one timed beam cycle");
  assert.equal(
    purpleSun.racePurpleSunBeamDamage,
    blueSun.raceBlueSunDamagePerLaser * 8,
    "Purple Sun should keep the eight-beam equivalence after the first shared power ramp",
  );
  assert.equal(purpleSun.racePurpleSunActive, false);
  assert.ok(purpleSun.racePurpleSunNextReadyAt > purpleSunSim.time, "Purple Sun should restart its cooldown after the beam ends");

  const snakeSim = makeRace("snake");
  const snake = snakeSim.fighters[0];
  const bodyHealthBefore = snake.raceLayerHealth[0];
  resolveRaceBounce(snakeSim, snake);
  assert.equal(snake.raceDamage, 0, "Snake's grounded body should have zero bounce damage");
  assert.equal(snake.raceLayerHealth[0], bodyHealthBefore, "Snake's body should not damage a layer");
  assert.equal(raceUsesProjectileOnlyBodyDamage(snake), true);
  stepSimulation(snakeSim, 1 / 120);
  assert.equal(snake.raceVy, 0, "Snake should stay grounded instead of launching into an arc");
  assert.ok(
    Math.abs(snake.raceY - (raceLayerLineY(0) - RACE_ORB_RADIUS * snake.raceOrbScale)) < 1e-9,
    "Snake should sit on the active number line",
  );

  run(snakeSim, 0.51);
  assert.equal(snake.raceSnakeTailOrbs, 1, "Snake should grow one tail segment every 0.5 seconds");
  assert.equal(snake.raceSnakeTailDamage, 2, "each tail segment should add two damage per tail hit");
  const firstTailHit = snakeSim.events.findLast((event) => event.surface === "snake-tail");
  assert.ok(firstTailHit, "the growing tail should hit the active line");
  assert.equal(firstTailHit.damage, 2);
  assert.ok(snake.raceLayerHealth[0] < bodyHealthBefore, "the tail should damage the layer while the body does not");

  run(snakeSim, 0.5);
  assert.equal(snake.raceSnakeTailOrbs, 2);
  assert.equal(snake.raceSnakeTailDamage, 4, "tail damage should ramp with tail length");

  run(snakeSim, 9.1);
  assert.equal(snake.raceSnakeTailOrbs, 20, "Snake should reach its larger tail cap on the timed growth cadence");
  run(snakeSim, 1.51);
  assert.equal(snake.raceSnakeOrbs.length, 1);
  assert.ok(snakeSim.events.some((event) => event.type === "race-snake-split"));
  const childSnake = snake.raceSnakeOrbs[0];
  assert.equal(childSnake.raceDamage, 0, "split Snake bodies should retain the zero-damage contract");
  run(snakeSim, 0.51);
  assert.equal(childSnake.raceSnakeTailOrbs, 1, "each split Snake should begin its own timed tail cycle");

  const vampireSim = makeRace("vampire");
  const vampire = vampireSim.fighters[0];
  resolveRaceBounce(vampireSim, vampire);
  assert.equal(vampire.raceDamage, 1, "Vampire's starting 0% steal should not increase damage on its first hit");
  assert.equal(vampire.raceVampireDamageStolen, 0);
  assert.equal(vampireSim.events.some((event) => event.type === "race-vampire-steal"), false);
  resolveRaceBounce(vampireSim, vampire);
  assert.equal(vampire.raceVampireStealPercent, 0.02);
  assert.ok(vampire.raceDamage > 1);
  assert.ok(vampire.raceVampireDamageStolen > 0);
  assert.ok(vampireSim.events.some((event) => (
    event.type === "race-vampire-steal"
    && event.stealPercent === 0.01
  )));
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["charger", "bouncer", "blue-sun"], ["snake", "vampire", "centy"]],
    raceLayerStrengths: [1_000_000, 2_000_000, 4_000_000],
    seed: 77119,
  };
  const first = createSimulation(options);
  const second = createSimulation(options);
  for (let index = 0; index < 900; index += 1) {
    stepSimulation(first, 1 / 120);
    stepSimulation(second, 1 / 120);
  }
  assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second), "expanded Orb Race roster should replay deterministically");
}

{
  const makeExpansionRace = (orbId, seed = 72901) => createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [[orbId], ["orbital"]],
    raceLayerStrengths: [1_000_000, 2_000_000, 4_000_000],
    seed,
  });

  const turretSim = makeExpansionRace("turret");
  const turret = turretSim.fighters[0];
  assert.equal(raceUsesProjectileOnlyBodyDamage(turret), true);
  resolveRaceBounce(turretSim, turret);
  assert.equal(turret.raceTurretDuration, 3.2, "Turret lifetime should ramp on every bounce");
  run(turretSim, 4.1);
  assert.ok(turret.raceTurrets.length >= 1, "Turret should deploy every four seconds");
  assert.ok(
    turret.raceTurrets.every((spawnedTurret) => spawnedTurret.nextFireAt - turretSim.time >= 0.8 - 1e-9),
    "Turret fire cadence should remain slower than the original rapid cadence",
  );
  const firstTurretSpawns = turretSim.events.filter(({ type }) => type === "race-turret-spawn");
  assert.equal(firstTurretSpawns.length, 1);
  run(turretSim, 3.8);
  assert.equal(
    turretSim.events.filter(({ type }) => type === "race-turret-spawn").length,
    1,
    "Turret should keep a flat four-second deployment cadence",
  );
  const firstTurret = turret.raceTurrets[0];
  assert.ok(firstTurret, "the first Turret deployment should remain active");
  assert.equal(firstTurret.expiresAt, null);
  assert.equal(firstTurret.permanent, true);
  run(turretSim, 0.2);
  const turretSpawns = turretSim.events.filter(({ type }) => type === "race-turret-spawn");
  assert.equal(turretSpawns.length, 2);
  assert.ok(turretSpawns[1].time - turretSpawns[0].time >= 4 - 1 / 120);
  assert.equal(turret.raceTurrets.length, 2, "Orb Race Turret should accumulate permanent deployments");
  assert.ok(
    turretSim.events.some((event) => event.type === "race-turret-fire"),
    "an active turret should fire deterministic black bombs",
  );
  const turretFire = turretSim.events.findLast((event) => event.type === "race-turret-fire");
  assert.ok(turretFire?.angle !== undefined);
  assert.ok(
    Math.abs(Math.atan2(turretFire.vy, turretFire.vx) - turretFire.angle) < 1e-9,
    "Turret projectiles should launch along the mounted shooter's angle",
  );
  assert.ok(
    turret.raceTurretBombs.every((bomb) => Number.isFinite(bomb.wallBounces) && bomb.wallBounces >= 0),
    "Turret projectiles should track wall bounces after leaving the mounted shooter",
  );
  assert.ok(
    turret.raceTurrets
      .filter((spawnedTurret) => spawnedTurret.id === turretSpawns[1].turretId)
      .every((spawnedTurret) => spawnedTurret.nextFireAt - spawnedTurret.startedAt >= 0.9 - 1e-9),
    "new Turret fire cadence should remain slower than the original rapid cadence",
  );

  const leechSim = makeExpansionRace("leech");
  const leech = leechSim.fighters[0];
  const leechHealth = leech.raceLayerHealth[0];
  resolveRaceBounce(leechSim, leech);
  stepSimulation(leechSim, 0.05);
  assert.equal(leech.raceLeechLevel, leech.raceStickyLevel, "Leech should share Sticky's level ramp");
  assert.ok(leech.raceLeechDamageStolen > 0);
  assert.ok(leech.raceLayerHealth[0] < leechHealth);
  assert.ok(leechSim.events.some((event) => event.type === "race-leech-tick"));

  const crusherSim = makeExpansionRace("crusher");
  const crusher = crusherSim.fighters[0];
  const crusherNextLayerHealth = crusher.raceLayerHealth[1];
  resolveRaceBounce(crusherSim, crusher);
  assert.equal(crusher.raceCrusherWeight, 2);
  assert.equal(crusher.raceDamage, 6, "Crusher should gain five damage per bounce");
  assert.equal(crusher.raceCrusherCracks.length, 1);
  assert.ok(crusher.raceLayerHealth[1] < crusherNextLayerHealth, "Crusher weight should bleed damage into the next layer");
  assert.ok(crusherSim.events.find((event) => event.type === "race-crusher-impact")?.bleedApplied > 0);
  assert.ok(crusherSim.events.some((event) => event.type === "race-crusher-impact"));

  const berserkerSim = makeExpansionRace("berserker");
  const berserker = berserkerSim.fighters[0];
  berserkerSim.fighters.find((fighter) => fighter.raceTeamIndex === 1).raceLayerIndex = 1;
  resolveRaceBounce(berserkerSim, berserker);
  assert.equal(berserker.raceBerserkerRage, 20);
  assert.equal(berserker.raceDamage, 4, "a trailing Berserker should gain its normal ramp plus rage");
  assert.ok(berserkerSim.events.some((event) => event.type === "race-berserker-rage"));

  const narrowLeadSim = makeExpansionRace("berserker", 72903);
  const narrowLead = narrowLeadSim.fighters[0];
  const narrowOpponent = narrowLeadSim.fighters[1];
  narrowLead.raceLayerHealth[0] = 950_000;
  narrowOpponent.raceLayerHealth[0] = 1_000_000;
  resolveRaceBounce(narrowLeadSim, narrowLead);
  assert.equal(narrowLead.raceBerserkerRage, 0, "Berserker should not rage within a ten-percent health deficit");

  const thresholdSim = makeExpansionRace("berserker", 72906);
  const thresholdBerserker = thresholdSim.fighters[0];
  const thresholdOpponent = thresholdSim.fighters[1];
  thresholdBerserker.raceLayerHealth[0] = 900_000;
  thresholdOpponent.raceLayerHealth[0] = 1_000_000;
  resolveRaceBounce(thresholdSim, thresholdBerserker);
  assert.equal(thresholdBerserker.raceBerserkerRage, 20, "a full ten-percent deficit should start Berserker rage");

  const rageSim = makeExpansionRace("berserker", 72904);
  const raging = rageSim.fighters[0];
  const rageOpponent = rageSim.fighters[1];
  rageSim.raceTeams[rageOpponent.raceTeamIndex].raceLayerIndex = 1;
  rageOpponent.raceLayerIndex = 1;
  raging.raceBerserkerRage = 98;
  resolveRaceBounce(rageSim, raging);
  assert.equal(raging.raceBerserkerRage, 100, "Berserker rage should cap at 100");
  assert.equal(raging.raceBerserkerAxeVisible, false, "the axe should remain hidden during the full-rage horn cue");
  assert.ok(rageSim.events.some((event) => event.type === "race-berserker-horn"));
  run(rageSim, 2.5);
  const axeSwing = rageSim.events.find((event) => event.type === "race-berserker-axe");
  assert.ok(axeSwing, "a full-rage Berserker should swing its axe on the two-second cadence");
  assert.equal(axeSwing.damage, axeSwing.baseDamage * 10);
  assert.equal(raging.raceBerserkerAxeSwingLocked, true, "Berserker's axe should lock at the layer contact frame");
  assert.equal(raging.raceBerserkerRage, 100, "Berserker rage should hold while it remains behind");
  rageSim.raceTeams[rageOpponent.raceTeamIndex].raceLayerIndex = 0;
  rageOpponent.raceLayerIndex = 0;
  raging.raceLayerHealth[0] = 1_000_000;
  rageOpponent.raceLayerHealth[0] = 1_000_000;
  run(rageSim, 0.5);
  assert.equal(raging.raceBerserkerRage, 100, "Berserker rage should hold until its lead reaches ten percent");
  raging.raceLayerHealth[0] = 1_000_000;
  rageOpponent.raceLayerHealth[0] = 900_000;
  run(rageSim, 0.5);
  assert.ok(
    raging.raceBerserkerRage < 100 && raging.raceBerserkerRage > 0,
    "Berserker rage should decay once its lead reaches ten percent",
  );
  assert.equal(raging.raceBerserkerAxeVisible, true, "the axe should remain equipped after rage falls below full");
  const swingCountBeforePersistentCadence = rageSim.events.filter(
    (event) => event.type === "race-berserker-axe-swing",
  ).length;
  run(rageSim, 2.1);
  assert.ok(
    rageSim.events.filter((event) => event.type === "race-berserker-axe-swing").length
      > swingCountBeforePersistentCadence,
    "the equipped axe should continue swinging on its two-second cadence",
  );
  assert.equal(raging.raceBerserkerAxeVisible, true);

  const reactorSim = makeExpansionRace("reactor");
  const reactor = reactorSim.fighters[0];
  for (let index = 0; index < 5; index += 1) resolveRaceBounce(reactorSim, reactor);
  assert.equal(reactor.raceReactorUses, 1);
  assert.equal(reactor.raceReactorCharge, 0);
  assert.equal(reactor.raceReactorDamage, 1000);
  assert.equal(reactor.raceReactorEffects.length, 1);
  assert.ok(reactor.raceReactorEffects[0].shake > 0, "Reactor explosions should carry a small arena-shake cue");
  assert.ok(reactorSim.events.some((event) => event.type === "race-reactor-explosion"));

  const parasiteSim = makeExpansionRace("parasite");
  const parasite = parasiteSim.fighters[0];
  resolveRaceBounce(parasiteSim, parasite);
  assert.equal(parasite.raceParasiteInterval, 1.96);
  run(parasiteSim, 2.1);
  assert.ok(parasite.raceParasites.length >= 1, "Parasite should spawn on its two-second opening cadence");
  assert.ok(parasiteSim.events.some((event) => event.type === "race-parasite-spawn"));

  const parasiteFallSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["parasite"], ["unarmed"]],
    raceLayerStrengths: [100_000, 100_000],
    seed: 72907,
  });
  const fallingParasite = parasiteFallSim.fighters[0];
  const oldLayerY = raceLayerLineY(0) - 0.012;
  const nextLayerY = raceLayerLineY(1) - 0.012;
  fallingParasite.raceParasites = [{
    id: "parasite-transition-test",
    x: 0.45,
    y: oldLayerY,
    vx: 0,
    vy: 0,
    layerIndex: 0,
    attached: true,
    tickAt: 100,
    completed: false,
  }];
  parasiteFallSim.raceTeams[0].raceLayerIndex = 1;
  stepSimulation(parasiteFallSim, 1 / 120);
  const transitioningParasite = fallingParasite.raceParasites[0];
  assert.equal(transitioningParasite.layerIndex, 1, "Parasite should retarget the next layer after a clear");
  assert.equal(transitioningParasite.attached, false, "Parasite should be falling during the layer transition");
  assert.ok(transitioningParasite.y > oldLayerY, "Parasite should continue from its old wall instead of respawning at the top");
  assert.ok(transitioningParasite.y < nextLayerY, "Parasite should not skip through the next wall while falling");
  run(parasiteFallSim, 0.8);
  assert.equal(fallingParasite.raceParasites[0].attached, true, "Parasite should attach after falling to the next wall");
  assert.equal(fallingParasite.raceParasites[0].y, nextLayerY, "Parasite should settle on the next layer surface");

  const draftFirst = makeExpansionRace("draftmaster", 72902);
  const draftRepeat = makeExpansionRace("draftmaster", 72902);
  run(draftFirst, 3.2);
  run(draftRepeat, 3.2);
  const firstDraft = draftFirst.fighters[0];
  const repeatDraft = draftRepeat.fighters[0];
  assert.equal(firstDraft.raceDraftUpgradeCount, 1);
  assert.ok(["damage", "projectile", "speed"].includes(firstDraft.raceDraftLastUpgrade));
  assert.equal(
    firstDraft.raceDraftDamageLevel + firstDraft.raceDraftProjectileLevel + firstDraft.raceDraftSpeedLevel,
    1,
    "Draftmaster should choose exactly one upgrade every three seconds",
  );
  assert.ok(draftFirst.events.some((event) => event.type === "race-draft-upgrade"));
  assert.equal(firstDraft.raceDraftSwordSwings, 1, "Draftmaster should swing its sword once after the two-second cooldown");
  assert.equal(firstDraft.raceDraftSwordHits, 1, "the first Draftmaster sword swing should strike the active layer");
  assert.equal(firstDraft.raceDraftGunShots, 1, "Draftmaster should fire its gun once after the three-second cooldown");
  assert.ok(
    Math.abs(firstDraft.raceDraftGunSpinStartedAt - 3) < 1 / 120,
    "Draftmaster should start its reload flourish immediately after firing",
  );
  assert.ok(firstDraft.raceDraftGunSpinUntil > draftFirst.time, "Draftmaster's reload flourish should bridge the gap between shots");
  assert.equal(firstDraft.raceDraftSwordSwingLocked, false, "Draftmaster's sword should return from its contact pose after the swing");
  assert.equal(firstDraft.raceDraftNextSwordAt, 4);
  assert.equal(firstDraft.raceDraftNextFireAt, 6);
  assert.equal(firstDraft.raceDraftGunAngle, Math.PI * 1.25, "Draftmaster's gun should keep a fixed 225-degree mount angle");
  assert.ok(
    draftFirst.events
      .filter((event) => event.type === "race-draft-fire")
      .every((event) => event.angle === Math.PI * 1.25),
    "every Draftmaster shot should use the fixed gun angle",
  );
  assert.ok(draftFirst.events.some((event) => event.type === "race-draft-sword-swing"));
  assert.ok(draftFirst.events.some((event) => event.type === "race-draft-sword-hit"));
  assert.ok(draftFirst.events.some((event) => event.type === "race-draft-fire"));
  assert.ok(
    firstDraft.raceDraftBullets.every((bullet) => (
      [0, 1, 2].includes(bullet.ammoTier)
      && Number.isFinite(bullet.angle)
      && bullet.radius >= 0.013
    )),
    "Draftmaster bullets should carry a deterministic ammo tier, firing angle, and enlarged radius",
  );
  assert.ok(
    firstDraft.raceDraftBullets.every((bullet) => bullet.vy > 0),
    "Draftmaster bullets should travel down toward the active layer in canvas coordinates",
  );
  const fireEvent = draftFirst.events.find((event) => event.type === "race-draft-fire");
  const muzzle = raceDraftmasterBulletSpawnPoint(
    { raceX: fireEvent.originX, raceY: fireEvent.originY, raceOrbScale: firstDraft.raceOrbScale },
    fireEvent.gunTier,
  );
  assert.equal(fireEvent.muzzleX, muzzle.x, "Draftmaster fire events should expose the gun muzzle origin");
  assert.equal(fireEvent.muzzleY, muzzle.y, "Draftmaster fire events should expose the gun muzzle origin");
  assert.ok(muzzle.x < firstDraft.raceX, "Draftmaster bullets should start in front of the left-mounted gun");
  assert.ok(muzzle.y > firstDraft.raceY, "Draftmaster bullets should start at the gun's lower muzzle");
  assert.deepEqual(
    captureReplayFrame(draftFirst),
    captureReplayFrame(draftRepeat),
    "Draftmaster's draft choices and projectiles should be seed-deterministic",
  );

  const speedDraft = makeExpansionRace("draftmaster", 1);
  run(speedDraft, 4.2);
  const speedDraftFighter = speedDraft.fighters[0];
  const speedUpgrade = speedDraft.events.find((event) => event.type === "race-draft-upgrade");
  const speedFire = speedDraft.events.find((event) => event.type === "race-draft-fire");
  const speedSwordSwings = speedDraft.events.filter((event) => event.type === "race-draft-sword-swing");
  assert.equal(speedDraftFighter.raceDraftLastUpgrade, "speed");
  assert.equal(speedUpgrade.cooldown, 2.7, "Draftmaster speed should shorten the next upgrade cooldown");
  assert.equal(speedFire.cooldown, 2.7, "Draftmaster speed should shorten the gun cooldown");
  assert.equal(speedSwordSwings[1].cooldown, 1.8, "Draftmaster speed should shorten the sword cooldown");
  assert.equal(speedDraftFighter.raceDraftNextUpgradeAt, 5.7);
  assert.equal(speedDraftFighter.raceDraftNextFireAt, 5.7);
  assert.equal(speedDraftFighter.raceDraftNextSwordAt, 5.8);

  const draftImpactSim = makeExpansionRace("draftmaster", 72905);
  run(draftImpactSim, 2.35);
  assert.ok(
    draftImpactSim.fighters[0].raceDraftImpactEffects.some((effect) => effect.kind === "sword"),
    "Draftmaster sword hits should leave a short-lived red impact effect",
  );

  crusher.raceLayerHealth[0] = 0;
  resolveRaceBounce(crusherSim, crusher);
  assert.equal(crusher.raceLayerIndex, 1, "Crusher should advance after its current layer is cleared");
  assert.equal(crusher.raceCrusherCracks.length, 0, "Crusher cracks should clear when it moves to the next layer");
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [
      ["turret", "leech", "crusher", "berserker"],
      ["reactor", "parasite", "draftmaster"],
    ],
    raceLayerStrengths: [1_000_000, 2_000_000, 4_000_000],
    seed: 72903,
  };
  const first = createSimulation(options);
  const repeat = createSimulation(options);
  run(first, 4.25);
  run(repeat, 4.25);
  assert.deepEqual(
    captureReplayFrame(first),
    captureReplayFrame(repeat),
    "all expansion-orb projectiles, upgrades, and outcomes should replay deterministically",
  );
}

{
  const makeRace = (left, right = "unarmed", layers = [10_000, 20_000]) => createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [[left], [right]],
    raceLayerStrengths: layers,
    seed: 73107,
  });

  const needleSim = makeRace("needle");
  const needle = needleSim.fighters[0];
  assert.equal(needle.raceOrbScale, 0.58, "Needle should retain its deliberate relative size at the full-size default");
  resolveRaceBounce(needleSim, needle);
  assert.equal(needle.raceLayerHealth[0], 9_999);
  assert.equal(needle.raceLayerHealth[1], 19_999.65, "Needle should pierce 35% of its impact into the next layer");
  assert.equal(needle.raceDamage, 3, "Needle should gain two damage after its first bounce");

  const multiplierSim = makeRace("multiplier");
  const multiplier = multiplierSim.fighters[0];
  resolveRaceBounce(multiplierSim, multiplier);
  assert.equal(multiplier.raceLayerHealth[0], 9_999, "Multiplier's opening hit should remain exactly 1×");
  assert.equal(multiplier.raceMultiplier, 2, "Multiplier should advance to 2× after its opening bounce");
  resolveRaceBounce(multiplierSim, multiplier);
  assert.equal(multiplier.raceLayerHealth[0], 9_997, "the next hit should use the previously earned 2× multiplier");
  assert.equal(multiplier.raceMultiplier, 3, "Multiplier should advance by one whole × per bounce");
  resolveRaceBounce(multiplierSim, multiplier);
  assert.equal(multiplier.raceLayerHealth[0], 9_994, "the third hit should use the previously earned 3× multiplier");
  assert.equal(multiplier.raceMultiplier, 4, "Multiplier should continue its 1×, 2×, 3× sequence");

  const snowballSim = makeRace("snowball");
  const snowball = snowballSim.fighters[0];
  const snowballBaseScale = snowball.raceBaseOrbScale;
  const snowballInitialRotation = snowball.raceSnowballRotation;
  assert.equal(snowball.raceDamage, 0, "Snowball should have no direct bounce damage");
  run(snowballSim, 1);
  assert.equal(snowball.raceY, raceLayerLineY(0) - RACE_ORB_RADIUS * snowball.raceOrbScale, "Snowball should stay on the active ground line");
  assert.ok(snowball.raceSnowballDamagePerSecond > 2, "Snowball's drain should ramp above its two-DPS opening rate");
  assert.ok(snowball.raceSnowballDamageStolen > 0, "Snowball should continuously steal layer health");
  assert.ok(Math.abs(snowball.raceSnowballRotation - snowballInitialRotation) > 0.1, "Snowball should visibly roll and spin while draining the line");
  assert.ok(snowball.raceSnowballSize > 1.004, "Snowball should grow noticeably during its opening roll");
  assert.ok(snowball.raceOrbScale > snowballBaseScale, "Snowball should grow from stolen damage");
  assert.equal(snowball.raceDamage, 0, "Snowball's body damage should remain zero while it rolls");
  assert.ok(
    snowballSim.events.every((event) => event.fighterId !== snowball.id || event.type !== "race-bounce" || event.surface !== "number-line"),
    "Snowball should not create number-line bounce damage while rolling",
  );
  snowball.raceSnowballDrainElapsed = 100;
  run(snowballSim, 1 / 120);
  assert.equal(snowball.raceSnowballDamagePerSecond, 1000, "Snowball's drain should cap at 1000 damage per second");
  const snowballBreakSim = makeRace("snowball", "unarmed", [1, 100]);
  const breakingSnowball = snowballBreakSim.fighters[0];
  breakingSnowball.raceSnowballDrainElapsed = 100;
  run(snowballBreakSim, 0.2);
  assert.equal(breakingSnowball.raceLayerIndex, 1);
  assert.ok(breakingSnowball.raceSnowballFalling, "Snowball should fall through a layer it drains to zero");
  assert.ok(breakingSnowball.raceSnowballSize > 1, "Snowball growth should persist after a layer breaks");

  const countdownSim = makeRace("countdown");
  const countdown = countdownSim.fighters[0];
  for (let hit = 0; hit < 10; hit += 1) resolveRaceBounce(countdownSim, countdown);
  assert.equal(countdown.raceCountdown, 10);
  assert.equal(countdown.raceCountdownBlasts, 1);
  assert.equal(countdown.raceLayerHealth[0], 9_966, "nine base hits plus one 25× blast should deal 34 total damage");
  assert.ok(countdownSim.events.some((event) => event.type === "race-countdown-blast"));

  const copycatSim = makeRace("copycat", "needle");
  const copycat = copycatSim.fighters[0];
  const copiedOpponent = copycatSim.fighters[1];
  copiedOpponent.raceDamage = 40;
  assert.equal(copycat.raceDamage, 0, "Copycat's original body should start with zero bounce damage");
  resolveRaceBounce(copycatSim, copycat);
  assert.equal(copycat.raceCopycatDamage, 0);
  assert.equal(copycat.raceCopycatSourceId, copiedOpponent.id);
  assert.equal(copycat.raceLayerHealth[0], 10_000, "Copycat's original body should not damage the number line");

  const criticalSim = makeRace("critical");
  const critical = criticalSim.fighters[0];
  critical.raceCriticalChance = 1;
  resolveRaceBounce(criticalSim, critical);
  assert.equal(critical.raceLayerHealth[0], 9_990);
  assert.equal(critical.raceCriticalHits, 1);
  assert.ok(criticalSim.events.some((event) => event.type === "race-critical-hit"));

  const sniperSim = makeRace("sniper");
  const sniper = sniperSim.fighters[0];
  assert.equal(raceUsesProjectileOnlyBodyDamage(sniper), true);
  assert.equal(sniper.raceSniperFireCooldown, 1.5, "Sniper should start with a 1.5-second fire interval");
  resolveRaceBounce(sniperSim, sniper);
  assert.equal(sniper.raceSniperFireCooldown, 1.45, "Sniper's fire interval should shorten after each orb bounce");
  assert.equal(sniper.raceLayerHealth[0], 10_000, "Sniper's body should never damage a number wall");
  sniper.raceY = 0.1;
  sniper.raceVy = 0;
  sniper.raceVx = 0;
  sniper.raceSniperNextFireAt = 0;
  stepSimulation(sniperSim, 1 / 120);
  assert.equal(sniper.raceSniperShots, 1);
  assert.equal(sniper.raceSniperDamage, 31.25, "Sniper's next shot should scale by 1.25 after the first shot");
  sniper.raceSniperNextFireAt = sniperSim.time;
  stepSimulation(sniperSim, 1 / 120);
  assert.equal(sniper.raceSniperShots, 2);
  assert.equal(sniper.raceSniperDamage, 39.0625, "Sniper should scale projectile damage by 1.25 on every shot");
  assert.deepEqual(
    sniperSim.events.filter((event) => event.type === "race-sniper-fire").map((event) => event.damage),
    [25, 31.25],
  );

  sniper.raceSniperBullets = [{
    id: `${sniper.id}-test-pierce`,
    x: 0.5,
    y: raceLayerLineY(0) - 0.018 - 0.001,
    vx: 0,
    vy: 0.82,
    angle: Math.PI / 2,
    radius: 0.018,
    damage: 25,
    layerIndex: 0,
    piercesRemaining: 1,
    ricochets: 0,
    completed: false,
  }];
  sniper.raceSniperNextFireAt = Number.POSITIVE_INFINITY;
  const firstLayerHealth = sniper.raceLayerHealth[0];
  const secondLayerHealth = sniper.raceLayerHealth[1];
  stepSimulation(sniperSim, 1 / 120);
  assert.equal(sniper.raceLayerHealth[0], firstLayerHealth - 25, "Sniper's first wall hit should use the shot damage");
  assert.equal(sniper.raceSniperBullets[0]?.layerIndex, 1, "Sniper's bullet should pierce into the next layer");
  run(sniperSim, 0.3);
  assert.equal(sniper.raceLayerHealth[1], secondLayerHealth - 25, "Sniper's pierced bullet should damage the next layer");
  assert.equal(sniper.raceSniperBullets.length, 0, "A one-pierce Sniper bullet should finish after the next layer");
  sniper.raceSniperBullets = [{
    id: `${sniper.id}-test-ricochet`,
    x: 0.99,
    y: 0.1,
    vx: 0.82,
    vy: 0,
    angle: 0,
    radius: 0.018,
    damage: 25,
    layerIndex: 1,
    piercesRemaining: 1,
    ricochets: 0,
    completed: false,
  }];
  stepSimulation(sniperSim, 1 / 120);
  assert.ok(sniper.raceSniperBullets[0].vx < 0, "Sniper bullets should ricochet off side walls");
  assert.ok(sniperSim.events.some((event) => event.type === "race-sniper-ricochet"), "Sniper ricochets should emit a deterministic event");
  assert.ok(sniperSim.events.some((event) => event.type === "race-sniper-fire"));
  assert.ok(sniperSim.events.some((event) => event.type === "race-sniper-hit"));
  assert.ok(sniperSim.events.some((event) => event.type === "race-sniper-pierce"));
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["needle", "multiplier", "sniper", "snowball"], ["countdown", "copycat", "critical"]],
    raceLayerStrengths: [1_000_000, 2_000_000, 4_000_000],
    seed: 73108,
  };
  const first = createSimulation(options);
  const repeat = createSimulation(options);
  run(first, 7.25);
  run(repeat, 7.25);
  assert.deepEqual(captureReplayFrame(first), captureReplayFrame(repeat), "all seven simple racers should replay deterministically with seeded critical rolls");
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["commander", "shrapnel", "architect"], ["roulette", "ricochet"]],
    raceLayerStrengths: [1000, 2000, 4000],
    seed: 88421,
    features: { replay: true },
  };
  const first = createSimulation(options);
  const repeat = createSimulation(options);
  run(first, 4.1);
  run(repeat, 4.1);
  const commander = first.fighters.find((fighter) => fighter.raceOrbId === "commander");
  const shrapnel = first.fighters.find((fighter) => fighter.raceOrbId === "shrapnel");
  const architect = first.fighters.find((fighter) => fighter.raceOrbId === "architect");
  const ricochet = first.fighters.find((fighter) => fighter.raceOrbId === "ricochet");
  assert.ok(commander.raceCommanderBombs >= 1 && commander.raceCommanderMissiles >= 1, "Commander should independently fire both drone weapons");
  const openingDrone = raceCommanderDronePosition(commander, 0, 0.85);
  const laterDrone = raceCommanderDronePosition(commander, 0, 4.1);
  assert.ok(Math.abs(openingDrone.x - laterDrone.x) > 0.08 || Math.abs(openingDrone.y - laterDrone.y) > 0.08, "Commander drones should sweep through the arena over time");
  assert.ok(Math.hypot(laterDrone.x - commander.raceX, laterDrone.y - commander.raceY) > 0.08, "Commander drones should not stay attached to the orb");
  assert.ok(shrapnel.raceShrapnelFragmentsSpawned >= 3, "Shrapnel should shed fragments on arena-wall hits");
  assert.ok(architect.raceArchitectBuilds >= 1, "Architect should finish a deterministic build after its hammer animation");
  assert.ok(architect.raceArchitectStructures.length >= 1, "Architect should retain its built bouncer structures");
  assert.ok(architect.raceArchitectStructures.every((structure) => structure.type === "bumper"), "Architect should only build bumpers");
  assert.ok(first.events.filter((event) => event.type === "race-architect-build").every((event) => event.structureType === "bumper"), "Architect build events should only announce bumpers");
  assert.ok(ricochet.raceRicochetShots >= 1, "Ricochet Cannon should launch its opening shot");
  assert.ok(ricochet.raceRicochetProjectiles.length <= 1, "Ricochet Cannon should never keep more than one live shot");
  assert.deepEqual(captureReplayFrame(first), captureReplayFrame(repeat), "tactical weapon-orb projectiles and structures should replay deterministically");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["commander"], ["speed"]],
    raceLayerStrengths: [10_000, 20_000, 40_000],
    seed: 884211,
  });
  const commander = sim.fighters.find((fighter) => fighter.raceOrbId === "commander");
  commander.raceLongform = true;
  commander.raceLayerIndex = 1;
  const laneOne = raceCommanderDronePosition(commander, 0, 1.4);
  const laneTop = raceLayerLineY(0);
  const laneBottom = raceLayerLineY(1);
  assert.ok(laneOne.y >= laneTop + laneOne.radius - 1e-9, "Commander drones should stay below the cleared wall above the active long-form lane");
  assert.ok(laneOne.y <= laneBottom - laneOne.radius + 1e-9, "Commander drones should stay above the active number wall");
  commander.raceLayerIndex = 0;
  const openingLane = raceCommanderDronePosition(commander, 1, 1.4);
  assert.ok(openingLane.y >= openingLane.radius - 1e-9, "opening-lane drones should stay inside the race chamber");
  assert.ok(openingLane.y <= raceLayerLineY(0) - openingLane.radius + 1e-9, "opening-lane drones should stay above the first number wall");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["roulette"], ["speed"]],
    raceLayerStrengths: [1_000_000, 1_000_000, 1_000_000],
    seed: 88422,
  });
  const roulette = sim.fighters.find((fighter) => fighter.raceOrbId === "roulette");
  assert.equal(roulette.raceRouletteNextAbsorbAt, 5, "Roulette should schedule its first absorption at five seconds");
  run(sim, 4.5);
  assert.equal(roulette.raceRouletteAbsorbHistory.length, 0, "Roulette should wait five seconds before its first absorption");
  run(sim, 0.6);
  assert.equal(roulette.raceRouletteAbsorbHistory.length, 1, "Roulette should absorb once at five seconds");
  assert.equal(roulette.raceRouletteNextAbsorbAt, 15, "Roulette should schedule the next absorption ten seconds later");
  run(sim, 9.5);
  assert.equal(roulette.raceRouletteAbsorbHistory.length, 1, "Roulette should not absorb again before its ten-second interval");
  run(sim, 0.6);
  assert.equal(roulette.raceRouletteAbsorbHistory.length, 2, "Roulette should absorb again ten seconds after its first timed absorption");
  assert.equal(roulette.raceRouletteAbsorbedOrbHistory.length, 2, "Roulette should record each timed absorbed orb model for the HUD and animation");
  assert.ok(roulette.raceRouletteAbsorbedOrbHistory[0], "Roulette should record a source orb id");
  assert.equal(roulette.raceRouletteAbsorbedColors.length, 2, "Absorber should retain a distinct theme color for each absorbed orb");
  assert.ok(roulette.raceAbilityIds.length > 1, "the absorbed ability should join Roulette's composed ability set");
  assert.ok(sim.events.some((event) => event.type === "race-roulette-absorb"));

  const paletteSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["roulette"], ["speed"]],
    raceLayerStrengths: [1_000_000_000_000_000_000, 1_000_000_000_000_000_000, 1_000_000_000_000_000_000],
    seed: 88423,
  });
  run(paletteSim, 75.1);
  const paletteAbsorber = paletteSim.fighters.find((fighter) => fighter.raceOrbId === "roulette");
  assert.ok(paletteAbsorber.raceRouletteAbsorbHistory.length >= 8, "Absorber should collect eight timed abilities");
  assert.ok(
    paletteAbsorber.raceRouletteAbsorbedColors.length <= paletteAbsorber.raceRouletteAbsorbHistory.length,
    "Absorber's color ring should retain only the distinct themes seen in its random history",
  );
}

{
  const poolSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["roulette"], ["speed"]],
    raceLayerStrengths: [1_000_000_000_000_000_000, 1_000_000_000_000_000_000, 1_000_000_000_000_000_000],
    seed: 88424,
  });
  run(poolSim, 85.1);
  const poolAbsorber = poolSim.fighters.find((fighter) => fighter.raceOrbId === "roulette");
  const allowedAbsorptions = new Set([
    "black-hole", "bombs", "meteor", "orbiters", "reactor", "slammy", "speed", "sticky", "weapon-orbs",
  ]);
  assert.equal(poolAbsorber.raceRouletteAbsorbHistory.length, 9, "Absorber should make one seeded roll per timed absorption");
  assert.ok(
    poolAbsorber.raceRouletteAbsorbHistory.every((abilityId) => allowedAbsorptions.has(abilityId)),
    "Absorber should only roll from its approved ability pool",
  );
  assert.ok(
    poolAbsorber.raceRouletteAbsorbHistory.some((abilityId, index, history) => history.indexOf(abilityId) !== index),
    "Absorber should allow a seeded random roll to repeat an ability",
  );
  assert.equal(poolAbsorber.raceRouletteAbsorbHistory.includes("math-orbs"), false);
  assert.equal(poolAbsorber.raceRouletteAbsorbHistory.includes("multiplier"), false);
}

{
  const options = {
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["roulette"], ["speed"]],
    raceLayerStrengths: [1_000_000_000_000_000_000, 1_000_000_000_000_000_000, 1_000_000_000_000_000_000],
    seed: 22,
  };
  const firstSim = createSimulation(options);
  const secondSim = createSimulation(options);
  const firstAbsorber = firstSim.fighters.find((fighter) => fighter.raceOrbId === "roulette");
  const secondAbsorber = secondSim.fighters.find((fighter) => fighter.raceOrbId === "roulette");

  run(firstSim, 40);
  assert.ok(firstAbsorber.raceRouletteAbsorbHistory.includes("sticky"), "Absorber should be able to absorb Sticky");
  assert.ok(raceHasAbility(firstAbsorber, "sticky"), "absorbed Sticky should join the composed ability set");
  assert.ok(firstAbsorber.raceStickyLevel >= 1, "absorbed Sticky should start at an active stick level");
  assert.ok(firstAbsorber.raceStickyDuration > 0, "absorbed Sticky should initialize its hold duration");
  assert.ok(
    firstSim.events.some((event) => event.type === "race-sticky-tick" && event.fighterId === firstAbsorber.id),
    "absorbed Sticky should produce deterministic damage ticks",
  );
  run(secondSim, 40);

  run(firstSim, 31.2);
  run(secondSim, 31.2);
  assert.ok(firstAbsorber.raceRouletteAbsorbHistory.includes("meteor"), "Absorber should be able to absorb Meteor");
  assert.ok(raceHasAbility(firstAbsorber, "meteor"), "absorbed Meteor should join the composed ability set");
  assert.ok(firstAbsorber.raceMeteorDamage > 1, "absorbed Meteor damage should follow the active damage ramp");
  assert.ok(firstAbsorber.raceMeteorBurnDamagePerSecond > 0, "absorbed Meteor should initialize its burn damage channel");
  assert.ok(firstAbsorber.raceMeteorShots > 0, "absorbed Meteor should fire its small projectiles");
  assert.ok(firstAbsorber.raceMeteorAbilityUses > 0, "absorbed Meteor should reach its giant-meteor cooldown");
  assert.ok(firstAbsorber.raceMeteorGiantProjectiles.length > 0, "absorbed Meteor should retain its deterministic giant-meteor projectile state");
  assert.deepEqual(
    firstAbsorber.raceRouletteAbsorbHistory,
    secondAbsorber.raceRouletteAbsorbHistory,
    "absorbed ability selection should remain seeded and repeatable",
  );
  assert.deepEqual(
    firstAbsorber.raceRouletteAbsorbLevels,
    secondAbsorber.raceRouletteAbsorbLevels,
    "absorbed ability levels should remain seeded and repeatable",
  );
  assert.equal(firstAbsorber.raceStickyLevel, secondAbsorber.raceStickyLevel);
  assert.equal(firstAbsorber.raceMeteorShots, secondAbsorber.raceMeteorShots);
  assert.equal(firstAbsorber.raceMeteorAbilityUses, secondAbsorber.raceMeteorAbilityUses);

  const differentSeed = createSimulation({ ...options, seed: 23 });
  run(differentSeed, 25.1);
  assert.notDeepEqual(
    firstAbsorber.raceRouletteAbsorbHistory.slice(0, 3),
    differentSeed.fighters.find((fighter) => fighter.raceOrbId === "roulette").raceRouletteAbsorbHistory,
    "different seeds should produce different random Absorber selections",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["ricochet"], ["speed"]],
    raceLayerStrengths: [10_000, 20_000, 40_000],
    seed: 88423,
  });
  stepOrbRace(sim, 1 / 120);
  const cannon = sim.fighters.find((fighter) => fighter.raceOrbId === "ricochet");
  const shot = cannon.raceRicochetProjectiles[0];
  shot.x = 1 - shot.radius * 0.25;
  shot.vx = Math.abs(shot.vx);
  shot.y = 0.1;
  shot.vy = 0;
  const before = shot.damage;
  stepOrbRace(sim, 1 / 120);
  assert.equal(shot.damage, before * 2, "Ricochet Cannon damage should double on each wall touch");
  assert.ok(sim.events.some((event) => event.type === "race-ricochet-bounce"));
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["commander"], ["speed"]],
    raceLayerStrengths: [10_000, 20_000, 40_000],
    raceOrbScale: 1,
    seed: 88424,
  });
  const commander = sim.fighters.find((fighter) => fighter.raceOrbId === "commander");
  commander.raceX = 0.5;
  commander.raceY = 0.16;
  commander.raceVx = 0;
  commander.raceVy = 0;
  commander.raceCommanderBombCooldown = 0;
  commander.raceCommanderMissileCooldown = 0;
  stepOrbRace(sim, 1 / 120);
  assert.equal(commander.raceOrbScale, 1, "Commander should retain the selected full orb size");
  assert.equal(commander.raceCommanderProjectiles.length, 2, "both support drones should fire independently");
  assert.ok(
    commander.raceCommanderProjectiles.every((projectile) => projectile.x > 0 && projectile.x < 1 && projectile.y > 0 && projectile.y < 1),
    "Commander's support drones should launch valid projectiles while sweeping the arena",
  );
}

{
  const makeSimulation = () => createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["100x"], ["orbital"]],
    raceLayerStrengths: [1_000_000_000_000_000_000, 1_000_000_000_000_000_000],
    seed: 88425,
  });
  const first = makeSimulation();
  const second = makeSimulation();
  const firstHundred = first.fighters[0];
  const secondHundred = second.fighters[0];
  const firstHealth = firstHundred.raceLayerHealth[0];
  resolveRaceBounce(first, firstHundred);
  resolveRaceBounce(second, secondHundred);
  assert.equal(firstHundred.raceDamage, 100, "100X should deal 100 damage on its first bounce");
  assert.equal(firstHundred.raceLayerHealth[0], firstHealth - 100);
  resolveRaceBounce(first, firstHundred);
  resolveRaceBounce(second, secondHundred);
  assert.equal(firstHundred.raceDamage, 10_000, "100X should multiply its bounce damage by 100");
  assert.equal(firstHundred.raceLayerHealth[0], firstHealth - 10_100);
  firstHundred.raceBounces = 12;
  secondHundred.raceBounces = 12;
  resolveRaceBounce(first, firstHundred);
  resolveRaceBounce(second, secondHundred);
  assert.equal(firstHundred.raceDamage, ORB_RACE_MAX_MATH_DAMAGE, "100X should clamp above the shared math damage ceiling");
  assert.equal(firstHundred.raceDamage, secondHundred.raceDamage);
  assert.deepEqual(
    first.events.map(({ type, damage, layerIndex }) => ({ type, damage, layerIndex })),
    second.events.map(({ type, damage, layerIndex }) => ({ type, damage, layerIndex })),
    "100X bounce events should be deterministic for an identical seed",
  );
}

{
  const makeSimulation = () => createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["grappler"], ["orbital"]],
    raceLayerStrengths: [100_000, 100_000, 100_000],
    seed: 88426,
  });
  const first = makeSimulation();
  const second = makeSimulation();
  const grapplers = [first.fighters[0], second.fighters[0]];
  grapplers.forEach((grappler) => { grappler.raceGrapplerNextFireAt = 0; });
  const startingHealth = first.fighters[0].raceLayerHealth[0];
  for (let step = 0; step < 300 && !first.events.some((event) => event.type === "race-grappler-hit"); step += 1) {
    stepSimulation(first, 1 / 120);
    stepSimulation(second, 1 / 120);
  }
  const grappler = first.fighters[0];
  assert.equal(first.fighters.length, 2, "Grappler projectiles must not create additional orb fighters");
  assert.equal(raceUsesProjectileOnlyBodyDamage(grappler), true, "Grappler should not deal body bounce damage");
  assert.ok(first.events.some((event) => event.type === "race-grappler-fire"));
  const hit = first.events.find((event) => event.type === "race-grappler-hit");
  assert.ok(hit, "Grappler should land its hook on the current number line");
  assert.equal(hit.damage, 5_000, "Grappler should use its massive weapon damage");
  assert.ok(Number.isFinite(hit.anchorX) && Number.isFinite(hit.anchorY), "Grappler hits should expose the deterministic anchor");
  assert.equal(first.fighters[0].raceLayerHealth[0], startingHealth - 5_000);
  assert.ok(grappler.raceGrapplerPull, "A landed hook should start pulling the orb toward its impact");
  assert.equal(grappler.raceGrapplerAttached, true);
  assert.equal(grappler.raceGrapplerRope.attached, true);
  for (let step = 0; step < 120 && grappler.raceGrapplerPull; step += 1) {
    stepSimulation(first, 1 / 120);
    stepSimulation(second, 1 / 120);
  }
  assert.equal(grappler.raceGrapplerPull, null, "Grappler should release after reaching its hook point");
  assert.ok(first.events.some((event) => event.type === "race-grappler-pull-end"));
  assert.ok(grappler.raceGrapplerLaunchSpeed > 1_000, "Grappler pull release should expose player-facing launch speed above 1000");
  assert.equal(grappler.raceGrapplerAttached, false);
  assert.deepEqual(
    first.events.map(({ type, damage, layerIndex, paintingIndex }) => ({ type, damage, layerIndex, paintingIndex })),
    second.events.map(({ type, damage, layerIndex, paintingIndex }) => ({ type, damage, layerIndex, paintingIndex })),
    "Grappler fire, impact, and pull events should be deterministic",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["artists"], ["orbital"]],
    raceLayerStrengths: [100_000, 100_000, 100_000],
    seed: 88427,
  });
  const artists = sim.fighters[0];
  const healthBeforeBodyBounce = artists.raceLayerHealth[0];
  resolveRaceBounce(sim, artists);
  assert.equal(artists.raceDamage, 0, "Artists should never gain body bounce damage");
  assert.equal(artists.raceLayerHealth[0], healthBeforeBodyBounce, "Artists should leave the line untouched on body bounce");
  assert.equal(artists.raceArtistBaseDamage, 2, "an Artist bounce should add one to its painting base damage");
  artists.raceArtistNextPaintAt = 0;
  for (let step = 0; step < 240 && !sim.events.some((event) => event.type === "race-artist-painting-hit"); step += 1) {
    stepSimulation(sim, 1 / 120);
  }
  const start = sim.events.find((event) => event.type === "race-artist-paint-start");
  const hit = sim.events.find((event) => event.type === "race-artist-painting-hit");
  assert.ok(start, "Artists should start a painting when its cooldown is ready");
  assert.ok(hit, "Artists should finish a painting animation and hit the layer");
  assert.ok([1, 2, 5, 100, 1000].includes(hit.multiplier), "Every painting must use one of the five requested damage tiers");
  assert.equal(hit.baseDamage, 2, "the painting should snapshot the bounced base damage");
  assert.equal(hit.damage, hit.baseDamage * hit.multiplier, "painting damage should combine base damage and its tier multiplier");
  assert.equal(hit.paintingIndex, start.paintingIndex, "The impact should match the painting shown by the animation");
  assert.equal(artists.raceLayerHealth[0], healthBeforeBodyBounce - hit.damage);
  assert.ok(artists.raceArtistPaintingEffects.length > 0, "Completed paintings should leave a short-lived renderer effect");
  assert.ok(
    hit.time - start.time >= 1.5 - 1 / 120,
    "Artists should draw for 1.5 seconds before the asset appears",
  );
  assert.equal(
    artists.raceArtistBaseDamage,
    1 + artists.raceBounces,
    "only each bounce should add one to the painting base damage",
  );
  assert.ok(
    artists.raceArtistNextPaintAt - start.time >= 3 - 1e-9,
    "Artists should wait 3 seconds between painting starts",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["artists"], ["orbital"]],
    raceLayerStrengths: [1_000, 1_000, 1_000],
    seed: 88428,
  });
  const artists = sim.fighters[0];
  sim.raceRng.next = () => 0.21;
  artists.raceArtistNextPaintAt = 0;
  for (let step = 0; step < 240 && !sim.events.some((event) => event.type === "race-artist-painting-hit"); step += 1) {
    stepSimulation(sim, 1 / 120);
  }
  const bloomHit = sim.events.find((event) => event.type === "race-artist-painting-hit");
  assert.equal(bloomHit?.paintingName, "BLOOM", "the deterministic Bloom painting should use the support channel");
  assert.equal(bloomHit?.bloomDamageMultiplier, 1, "Bloom should not boost its own painting");
  assert.equal(bloomHit?.healed, undefined, "Bloom should no longer heal the layer");
  assert.equal(sim.events.some((event) => event.type === "race-artist-heal"), false);
  assert.equal(artists.raceArtistHealingTotal, 0);
  assert.equal(artists.raceArtistBloomDamageMultiplier, 1.5);
  assert.equal(artists.raceArtistBloomBoostedDrawings, 0);
  assert.equal(bloomHit.applied, bloomHit.damage);
  assert.ok(artists.raceLayerHealth[0] <= 1_000 - bloomHit.applied);
  assert.equal(artists.raceArtistDrawings.length, 1);
  assert.equal(artists.raceArtistDrawings[0].lifetime, 0.85);
  assert.equal(artists.raceArtistDrawings[0].fadeStart, 0.72);
  assert.equal(artists.raceArtistDrawings[0].opacity, 1);
  assert.equal(artists.raceArtistDrawings[0].bloomDamageMultiplier, 1);

  run(sim, 0.75);
  assert.ok(
    artists.raceArtistDrawings.find((drawing) => drawing.name === "BLOOM")?.opacity < 1,
    "Bloom should fade after its yellow circle reaches the chamber edge",
  );
  run(sim, 0.2);
  assert.equal(artists.raceArtistDrawings.some((drawing) => drawing.name === "BLOOM"), false);
  assert.equal(artists.raceArtistBloomDamageMultiplier, 1, "Bloom's damage boost should end when Bloom despawns");

  sim.raceRng.next = () => 0.41;
  artists.raceArtistNextPaintAt = sim.time;
  for (let step = 0; step < 240 && sim.events.filter((event) => event.type === "race-artist-painting-hit").length < 2; step += 1) {
    stepSimulation(sim, 1 / 120);
  }
  const paintingHits = sim.events.filter((event) => event.type === "race-artist-painting-hit");
  const stormHit = paintingHits[1];
  assert.equal(stormHit?.paintingName, "STORM");
  assert.equal(stormHit?.bloomDamageMultiplier, 1, "A despawned Bloom should no longer boost later paintings");
  assert.equal(stormHit?.bloomBoosted, false);
  assert.equal(stormHit?.damage, stormHit.baseDamage * stormHit.multiplier);
  assert.equal(artists.raceArtistBloomBoostedDrawings, 0);
  assert.equal(artists.raceArtistDrawings.filter((drawing) => drawing.name === "STORM").length, 1);

  artists.raceArtistNextPaintAt = Number.POSITIVE_INFINITY;
  run(sim, 5.2);
  assert.equal(artists.raceArtistDrawings.length, 0, "drawings should expire after five deterministic seconds");
}

for (const [randomValue, paintingName] of [[0.41, "STORM"], [0.61, "FAIRY"], [0.81, "MONSTER"]]) {
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["artists"], ["orbital"]],
    raceLayerStrengths: [100_000, 100_000, 100_000],
    seed: 88429 + Math.round(randomValue * 100),
  });
  const artists = sim.fighters[0];
  sim.raceRng.next = () => randomValue;
  artists.raceArtistNextPaintAt = 0;
  for (let step = 0; step < 240 && !sim.events.some((event) => event.type === "race-artist-painting-hit"); step += 1) {
    stepSimulation(sim, 1 / 120);
  }
  assert.equal(
    sim.events.find((event) => event.type === "race-artist-painting-hit")?.paintingName,
    paintingName,
  );
  if (paintingName === "STORM") {
    assert.equal(
      new Set(artists.raceArtistStormStrikes.map((strike) => strike.visualLane)).size,
      3,
      "Storm should reuse exactly three deterministic visual lightning lanes",
    );
    assert.ok(
      artists.raceArtistStormStrikes.every((strike) => strike.visualLane >= 0 && strike.visualLane < 3),
      "Storm visual lanes should stay within the cloud's three-lane footprint",
    );
    run(sim, 1);
    assert.ok(
      sim.events.filter((event) => event.type === "race-artist-storm-strike").length >= 5,
      "Storm should keep striking continuously from its cloud",
    );
    run(sim, 4.5);
    assert.ok(
      sim.events.filter((event) => event.type === "race-artist-storm-strike").length >= 20,
      "Storm should continue lightning throughout the cloud lifetime",
    );
    const strikeIds = sim.events
      .filter((event) => event.type === "race-artist-storm-strike")
      .map((event) => event.strikeId);
    assert.equal(new Set(strikeIds).size, strikeIds.length, "Storm strike IDs should remain unique across the continuous sequence");
  } else {
    const summonStart = sim.events.find((event) => event.type === "race-artist-summon-start");
    assert.ok(summonStart, `${paintingName} should create a living summon`);
    const summon = artists.raceArtistSummons.find((candidate) => candidate.kind === paintingName.toLowerCase());
    assert.ok(summon, `${paintingName} should be present in the same fixed step as the drawing hit`);
    assert.equal(summon.createdAt, sim.events.find((event) => event.type === "race-artist-painting-hit")?.time);
    assert.equal(summon.spawnProgress, paintingName === "MONSTER" ? 0 : 1);
    assert.equal(summon.lifetime, 10, `${paintingName} should remain active for ten seconds`);
    run(sim, 0.8);
    assert.ok(sim.events.some((event) => event.type === "race-artist-summon-attack"));
    if (paintingName === "MONSTER") {
      assert.ok(
        sim.events.some((event) => event.type === "race-artist-summon-step"),
        "Monster should emit deterministic walking-step events between attacks",
      );
    }
    artists.raceArtistNextPaintAt = Number.POSITIVE_INFINITY;
    run(sim, 10.1);
    assert.ok(sim.events.some((event) => event.type === "race-artist-summon-expire"));
    assert.equal(artists.raceArtistSummons.length, 0, `${paintingName} should despawn after its extended lifetime`);
  }
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["pancake"], ["orbital"]],
    raceLayerStrengths: [1_000_000_000, 1_000_000_000, 1_000_000_000],
    seed: 88430,
  });
  const pancake = sim.fighters[0];
  for (let step = 0; step < 400 && pancake.racePancakeFlipCount < 1; step += 1) stepSimulation(sim, 1 / 120);
  const firstFlip = sim.events.find((event) => event.type === "race-pancake-flip");
  assert.ok(firstFlip, "Pancake should complete an end-over-end flip");
  assert.equal(firstFlip.holdSeconds, 1.5, "Pancake should hold the line for exactly 1.5 seconds");
  assert.equal(pancake.racePancakeFlipPhase, "hold");
  assert.ok(Math.abs(pancake.racePancakeHeldUntil - pancake.racePancakeActiveStack.lastLandingAt - 1.5) < 1e-9);
  assert.equal(pancake.raceBounces, pancake.racePancakeFlipCount, "a Pancake landing counts once without recursive hold bounces");
  assert.equal(firstFlip.landingPatch, "syrup", "the first regular landing should use syrup only");
  const firstSyrupPatchId = pancake.racePancakePatches[0]?.id;
  assert.ok(
    pancake.racePancakePatches.length > 0
      && pancake.racePancakePatches[0].expiresAt - pancake.racePancakePatches[0].createdAt === 5
      && pancake.racePancakePatches[0].removeOnLayerAdvance === true,
  );
  assert.equal(
    pancake.racePancakePatches[0].damagePerSecond,
    2,
    "a fresh syrup patch should hit like two baseline Parasites",
  );
  assert.equal(
    pancake.racePancakePatches[0].parasiteEquivalent,
    2,
    "the first syrup patch should expose its two-Parasite damage contract",
  );
  assert.equal(pancake.racePancakeButterPatches.length, 0, "a syrup landing should not also leave butter");
  assert.equal(sim.events.some((event) => event.type === "race-pancake-butter-patch-create"), false);
  assert.equal(pancake.racePancakeLineDamagePerSecond, 1, "Pancake's direct stick damage should remain minimal");
  assert.ok(pancake.racePancakeLineTickDamage < pancake.racePancakePatches[0].damagePerSecond * 0.05);
  assert.equal(
    pancake.racePancakeLineDamagePerSecond,
    pancake.racePancakeLineTickDamage / 0.05,
    "Pancake line damage should use the fast Leech tick cadence",
  );
  stepSimulation(sim, 1 / 120);
  const syrupTick = sim.events.find((event) => event.type === "race-pancake-patch-tick");
  assert.ok(syrupTick, "Pancake should leave a damage-over-time syrup patch");
  assert.equal(syrupTick.damageModel, "poison");
  assert.equal(syrupTick.raceAbilityId, "poison");
  assert.equal(syrupTick.surface, "poisoned-layer");

  for (let step = 0; step < 400 && pancake.racePancakeFlipCount < 2; step += 1) stepSimulation(sim, 1 / 120);
  const secondFlip = sim.events.filter((event) => event.type === "race-pancake-flip")[1];
  assert.equal(secondFlip?.landingPatch, "butter", "every second landing should rotate to the butter side");
  assert.ok(pancake.racePancakeButterPatches.length > 0, "the butter landing should leave a butter patch");
  assert.equal(
    sim.events.filter((event) => event.type === "race-pancake-patch-create").length,
    1,
    "the butter landing should not also leave a syrup splat",
  );
  assert.equal(
    sim.events.find((event) => event.type === "race-pancake-butter-patch-create")?.layerIndex,
    pancake.raceLayerIndex,
  );

  for (let step = 0; step < 400 && pancake.racePancakeFlipCount < 3; step += 1) stepSimulation(sim, 1 / 120);
  const scaledSyrupPatch = pancake.racePancakePatches.find((patch) => patch.id !== firstSyrupPatchId);
  assert.ok(scaledSyrupPatch, "a later syrup landing should leave a second patch profile");
  assert.ok(
    scaledSyrupPatch.damagePerSecond > pancake.racePancakePatches[0].damagePerSecond,
    "syrup damage should scale with Pancake progression",
  );
  assert.ok(
    scaledSyrupPatch.durationSeconds > pancake.racePancakePatches[0].durationSeconds,
    "syrup duration should scale with Pancake progression",
  );

  run(sim, 40);
  assert.ok(
    pancake.racePancakePatches.some((patch) => patch.id === firstSyrupPatchId),
    "Pancake syrup patches should remain while their layer is active",
  );
  assert.equal(
    sim.events.some((event) => event.type === "race-pancake-patch-expire"),
    false,
    "Pancake patches should not emit timer expiry events before their layer advances",
  );
  const oldPatchIds = new Set([
    ...pancake.racePancakePatches.map((patch) => patch.id),
    ...pancake.racePancakeButterPatches.map((patch) => patch.id),
  ]);
  pancake.raceLayerHealth[pancake.raceLayerIndex] = 0;
  resolveRaceBounce(sim, pancake);
  assert.ok(pancake.raceLayerIndex > 0, "Pancake should advance to the next shared number layer");
  assert.equal(
    [...pancake.racePancakePatches, ...pancake.racePancakeButterPatches]
      .some((patch) => oldPatchIds.has(patch.id)),
    false,
    "Pancake syrup and butter patches should be removed when the shared lane advances",
  );
  assert.ok(
    [...pancake.racePancakePatches, ...pancake.racePancakeButterPatches]
      .every((patch) => Number(patch.layerIndex) >= pancake.raceLayerIndex),
    "Pancake replay state should retain only marks on the active or a future layer",
  );
  assert.equal(pancake.racePancakeStackCount, 3, "Pancake stacks should double at two and three pancakes");
  assert.ok(pancake.racePancakeStacks.length >= 2, "separate pancake stacks should remain independently simulated");
  assert.equal(pancake.racePancakeButterMeteorCount || 0, 0, "Pancake should no longer summon butter meteors");
  assert.equal((pancake.racePancakeButterMeteors || []).length, 0);
  assert.equal(
    sim.events.some((event) => [
      "race-pancake-butter-meteor",
      "race-pancake-butter-strike",
      "race-pancake-butter-pass",
      "race-pancake-butter-horn",
    ].includes(event.type)),
    false,
    "Pancake should no longer emit butter meteor or horn events",
  );
}

{
  const makeTree = () => createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["tree"], ["orbital"]],
    raceLayerStrengths: [100_000, 100_000, 100_000],
    seed: 88431,
  });
  const first = makeTree();
  const second = makeTree();
  const trees = [first.fighters[0], second.fighters[0]];
  for (const [treeIndex, tree] of trees.entries()) {
    const treeSim = treeIndex === 0 ? first : second;
    for (let bounce = 0; bounce < 5; bounce += 1) resolveRaceBounce(treeSim, tree);
  }
  assert.equal(trees[0].raceTreeCharge, 5);
  assert.equal(trees[0].raceTreeRootsActive, true, "Tree should enter ROOTS on its fifth qualifying bounce");
  const healthBeforeRoots = [...trees[0].raceLayerHealth];
  run(first, 0.75);
  run(second, 0.75);
  assert.ok(trees[0].raceTreeRootTicks > 0);
  assert.ok(trees[0].raceTreeRootLayerDrain.every((amount, index) => healthBeforeRoots[index] <= 0 || amount > 0));
  assert.ok(trees[0].raceLayerHealth.every((health, index) => health <= healthBeforeRoots[index]), "ROOTS should drain every uncleared layer simultaneously");
  assert.equal(trees[0].raceBounces, 5, "ROOTS ticks must not count as bounces");
  run(first, 4.5);
  run(second, 4.5);
  assert.equal(trees[0].raceTreeRootsActive, false);
  assert.ok(trees[0].raceTreeRootsFadeTimer > 0 && trees[0].raceTreeRootsFadeTimer <= 2);
  run(first, 2.1);
  run(second, 2.1);
  assert.equal(trees[0].raceTreeRootsFadeTimer, 0);
  assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second), "Tree ROOTS state must replay deterministically for identical seeds");
}

{
  assert.deepEqual(
    [0, 1, 2, 3].map((index) => sylvesterRaceValue(index)),
    [2, 3, 7, 43],
    "Sylvester should expose the first deterministic sequence values",
  );
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5].map((index) => lucasRaceValue(index)),
    [2, 1, 3, 4, 7, 11],
    "Lucas should expose the deterministic Lucas integer sequence",
  );
  assert.deepEqual(
    [1, 2, 3, 4].map((height) => tetrationRaceValue(height)),
    [2, 4, 16, 65_536],
    "Tetration should expose the 2^^b sequence values",
  );
}

{
  const phaseSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["phase-three-sun"], ["unarmed"]],
    raceLayerStrengths: [100000, 100000, 100000],
    seed: 1820818,
  });
  const phase = phaseSim.fighters.find((fighter) => fighter.raceOrbId === "phase-three-sun");
  run(phaseSim, 5.1);
  assert.equal(phase.racePhaseThreeSunActive, true, "Phase Three Sun should enter the same timed laser window as Blue Sun");
  assert.equal(phase.racePhaseThreeSunLasers.length, 8);
  assert.equal(phase.racePhaseThreeSunDamagePerLaser, 2000);
  run(phaseSim, 5.1);
  assert.equal(phase.racePhaseThreeSunUses, 1);
  assert.equal(phase.racePhaseThreeSunLaserScale, 1.25, "each completed laser use should grow the yellow beams by 1.25x");

  const professorSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["professor"], ["unarmed"]],
    raceLayerStrengths: [100000, 100000, 100000],
    seed: 1820819,
  });
  const professor = professorSim.fighters.find((fighter) => fighter.raceOrbId === "professor");
  assert.ok(professor.raceTravelSpeed < 0.2, "Professor should use the very-strong math travel speed");
  run(professorSim, 5.1);
  assert.ok(professor.raceProfessorActiveOrbId, "Professor should deterministically select a math form after five seconds");
  assert.ok(professor.raceProfessorActiveUntil > professorSim.time);
  assert.equal(professor.raceProfessorRouletteOrbIds.length, 5, "Professor should expose five seeded roulette frames");
  assert.ok(
    new Set(professor.raceProfessorRouletteOrbIds).size >= 3,
    "Professor's roulette should visibly pass through multiple different math forms",
  );
  assert.equal(
    professor.raceProfessorRouletteVisualOrbId,
    professor.raceProfessorRouletteOrbIds[0],
    "Professor should render the current roulette frame instead of a fixed quadratic form",
  );
  assert.ok(professorSim.events.some((event) => event.type === "race-professor-spin"));
  resolveRaceBounce(professorSim, professor);
  assert.ok(professor.raceDamage > 0, "an active Professor math form should own the next bounce damage");
  run(professorSim, 1.2);
  assert.equal(professor.raceProfessorRouletteUntil, 0, "Professor should finish the roulette before committing the form");
  assert.ok(professor.raceProfessorActiveOrbId, "Professor should commit a randomly selected math form after the roulette");

  const professorForms = new Set();
  const professorFirstRouletteForms = new Set();
  for (const seed of [1, 2, 3]) {
    const seededProfessorSim = createSimulation({
      gameplayMode: ORB_RACE_MODE,
      raceTeams: [["professor"], ["unarmed"]],
      raceLayerStrengths: [100000, 100000, 100000],
      seed,
    });
    run(seededProfessorSim, 5.1);
    const seededProfessor = seededProfessorSim.fighters.find((fighter) => fighter.raceOrbId === "professor");
    professorFirstRouletteForms.add(seededProfessor.raceProfessorRouletteVisualOrbId);
    run(seededProfessorSim, 1.1);
    professorForms.add(seededProfessor.raceProfessorActiveOrbId);
  }
  assert.ok(professorFirstRouletteForms.size >= 2, "Professor's first roulette frame should not always be X^X");
  assert.ok(professorForms.size >= 2, "Professor's seeded selections should not always resolve to Quadratic");

  const phaseTwoSunSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["phase-two-sun"], ["unarmed"]],
    raceLayerStrengths: [100000, 100000, 100000],
    seed: 1820820,
  });
  const phaseTwoSun = phaseTwoSunSim.fighters.find((fighter) => fighter.raceOrbId === "phase-two-sun");
  run(phaseTwoSunSim, 5.1);
  assert.equal(phaseTwoSun.racePhaseTwoSunActive, true, "Phase Two Sun should use Blue Sun's timed laser window");
  assert.equal(phaseTwoSun.racePhaseTwoSunLasers.length, 8, "Phase Two Sun should emit eight orange lasers");
  assert.equal(phaseTwoSun.racePhaseTwoSunDamagePerLaser, 1000, "Phase Two Sun should start with Blue Sun's per-laser damage");
  assert.equal(phaseTwoSun.raceDamage, 0, "Phase Two Sun's orb body should not deal ordinary bounce damage");
  assert.ok(
    phaseTwoSunSim.events.some((event) => event.type === "race-phase-two-sun-hit" && event.burn === true),
    "A Phase Two Sun laser contact should leave a timed burn field",
  );
  assert.equal(phaseTwoSun.racePhaseTwoSunBurnDamagePerSecond, 750, "Three laser contacts should burn for 25 percent of their combined damage");

  const trifectaSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["trifecta"], ["unarmed"]],
    raceLayerStrengths: [900, 100, 100],
    seed: 1820821,
  });
  const trifecta = trifectaSim.fighters.find((fighter) => fighter.raceOrbId === "trifecta");
  resolveRaceBounce(trifectaSim, trifecta);
  resolveRaceBounce(trifectaSim, trifecta);
  resolveRaceBounce(trifectaSim, trifecta);
  assert.equal(trifecta.raceDamage, 0, "Trifecta should never deal ordinary bounce damage");
  assert.equal(trifecta.raceTrifectaShockwaveCount, 1, "Trifecta should shockwave after its third layer hit");
  assert.equal(trifecta.raceLayerHealth[0], 600, "Trifecta's shockwave should remove one third of original max layer health");
  assert.ok(trifectaSim.events.some((event) => event.type === "race-trifecta-shockwave"));
  for (let hit = 0; hit < 6; hit += 1) resolveRaceBounce(trifectaSim, trifecta);
  assert.equal(trifecta.raceTrifectaShockwaveCount, 3, "Trifecta should produce three shockwaves across nine layer hits");
  assert.equal(trifecta.raceLayerHealth[0], 0, "three max-health thirds should exactly break the layer");

  const gravitatorSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["gravitator"], ["unarmed"]],
    raceLayerStrengths: [100000, 100000, 100000],
    seed: 1820822,
  });
  const gravitator = gravitatorSim.fighters.find((fighter) => fighter.raceOrbId === "gravitator");
  for (let bounce = 0; bounce < 9; bounce += 1) resolveRaceBounce(gravitatorSim, gravitator);
  const attachedY = gravitator.raceY;
  stepSimulation(gravitatorSim, 0.25);
  assert.equal(gravitator.raceGravitatorAttached, true, "Gravitator should attach after building its pull charge");
  assert.equal(gravitator.raceGravitatorPullLevel, 1, "Gravitator should expose a full pull meter when attached");
  assert.notEqual(gravitator.raceY, attachedY, "An attached Gravitator should keep moving under normal physics");
  assert.ok(
    gravitator.raceGravitatorLayerPullOffsets[0] < 0,
    "Gravitator should pull its active layer toward the orb instead of overwriting the orb position",
  );
  assert.ok(gravitator.raceGravitatorLayerPullProgress > 0);
  assert.ok(
    gravitatorSim.events.some((event) => event.type === "race-gravitator-pull" && "layerOffset" in event),
    "Gravitator pull events should expose the shared physical layer offset",
  );

  const offsetAfterCharge = gravitator.raceGravitatorLayerPullOffsets[0];
  run(gravitatorSim, 3);
  const topWallBounces = gravitatorSim.events.filter((event) => (
    event.type === "race-bounce"
      && event.fighterId === gravitator.id
      && event.surface === "top-wall"
  ));
  const layerBounces = gravitatorSim.events.filter((event) => (
    event.type === "race-bounce"
      && event.fighterId === gravitator.id
      && event.surface === "number-line"
      && event.layerIndex === 0
  ));
  const pulledLayerLine = raceLayerLineY(0) + gravitator.raceGravitatorLayerPullOffsets[0];
  const topWallCenter = RACE_ORB_RADIUS;
  const pulledLayerCenter = pulledLayerLine - RACE_ORB_RADIUS;
  assert.ok(
    gravitator.raceGravitatorLayerPullOffsets[0] < offsetAfterCharge - 0.01,
    "Gravitator should keep pulling the layer after attachment instead of moving itself toward it",
  );
  assert.ok(
    pulledLayerCenter > topWallCenter,
    "The pulled layer should remain below the top wall with a real physical chamber",
  );
  assert.ok(topWallBounces.length >= 2, "Gravitator should repeatedly reach the arena top wall");
  assert.ok(layerBounces.length >= 2, "Gravitator should repeatedly rebound from the pulled number line");
  assert.ok(
    gravitatorSim.events.some((event) => event.type === "race-gravitator-pull" && event.shuttleLocked === true),
    "Gravitator should expose its stable top-wall/number-line shuttle lock",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["breaker"], ["unarmed"]],
    raceLayerStrengths: [100, 100, 100],
    seed: 10101,
  });
  const breaker = sim.fighters.find((fighter) => fighter.raceOrbId === "breaker");
  assert.equal(breaker.raceBreakerCritChance, RACE_BREAKER_INITIAL_CRIT_CHANCE);
  sim.raceRng.next = () => 0.99;
  resolveRaceBounce(sim, breaker);
  assert.equal(breaker.raceLayerHealth[0], 99, "Breaker should deal exactly one damage before a crit");
  assert.equal(breaker.raceBreakerCritChance, 2, "Breaker crit chance should rise one percentage point per bounce");
  assert.equal(breaker.raceBreakerCrits, 0);
  sim.raceRng.next = () => 0;
  resolveRaceBounce(sim, breaker);
  const crit = sim.events.find((event) => event.type === "race-breaker-crit");
  assert.ok(crit, "Breaker should emit a dedicated crit event");
  assert.equal(
    crit.damage,
    100 * RACE_BREAKER_CRIT_MAX_HEALTH_FRACTION + 1,
    "Breaker crit damage should use half of the original layer HP plus one",
  );
  assert.equal(breaker.raceLayerHealth[0], 48);
  assert.equal(breaker.raceBreakerCrits, 1);
  assert.equal(breaker.raceDamage, 1, "Breaker base damage must never scale");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["square-root"], ["unarmed"]],
    raceLayerStrengths: [100, 100, 100],
    seed: 10102,
  });
  const root = sim.fighters.find((fighter) => fighter.raceOrbId === "square-root");
  resolveRaceBounce(sim, root);
  assert.equal(root.raceLayerHealth[0], 10);
  assert.equal(root.raceDamage, 90);
  resolveRaceBounce(sim, root);
  assert.ok(
    Math.abs(root.raceLayerHealth[0] - Math.sqrt(10)) < 1e-12,
    "Square Root should leave the exact mathematical root as the layer remainder",
  );
  assert.ok(
    Math.abs(root.raceDamage - (10 - Math.sqrt(10))) < 1e-12,
    "Square Root damage should be the amount removed to leave the root remainder",
  );
  root.raceLayerHealth[0] = 0.5;
  resolveRaceBounce(sim, root);
  assert.equal(root.raceLayerHealth[0], 0, "A square-root layer at or below one should break cleanly");
  assert.equal(root.raceSquareRootHits, 3);
  assert.ok(sim.events.some((event) => event.type === "race-square-root-hit"));
  assert.ok(root.raceBounceEffects.some((effect) => effect.squareRoot === true), "Every Square Root layer bounce should emit a √ cue");

  const twoHealthSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["square-root"], ["unarmed"]],
    raceLayerStrengths: [2, 100, 100],
    seed: 10104,
  });
  const twoHealthRoot = twoHealthSim.fighters.find((fighter) => fighter.raceOrbId === "square-root");
  resolveRaceBounce(twoHealthSim, twoHealthRoot);
  assert.ok(twoHealthRoot.raceLayerHealth[0] < 2, "Square Root should damage a layer with exactly two HP");
  assert.ok(
    Math.abs(twoHealthRoot.raceLayerHealth[0] - (2 - 1.46)) < 1e-12,
    "Square Root's two-health exception should leave a sub-one remainder after 1.46 damage",
  );
  assert.equal(twoHealthRoot.raceDamage, 1.46);
  resolveRaceBounce(twoHealthSim, twoHealthRoot);
  assert.equal(twoHealthRoot.raceLayerHealth[0], 0, "The next Square Root bounce should break the sub-one remainder");

  const roundedTwoHealthSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["square-root"], ["unarmed"]],
    raceLayerStrengths: [9, 100, 100],
    seed: 101041,
  });
  const roundedTwoHealthRoot = roundedTwoHealthSim.fighters.find((fighter) => fighter.raceOrbId === "square-root");
  resolveRaceBounce(roundedTwoHealthSim, roundedTwoHealthRoot);
  assert.equal(roundedTwoHealthRoot.raceLayerHealth[0], 3, "Square Root should turn 9 HP into 3 HP");
  resolveRaceBounce(roundedTwoHealthSim, roundedTwoHealthRoot);
  const displayedTwoHealthRemainder = roundedTwoHealthRoot.raceLayerHealth[0];
  assert.ok(displayedTwoHealthRemainder > 1 && displayedTwoHealthRemainder < 2, "sqrt(3) should enter the displayed-two-health tail");
  assert.equal(
    squareRootDamageForLayerHealth(displayedTwoHealthRemainder),
    1.46,
    "The low-health helper should select the dedicated 1.46 rule for the displayed-two-health tail",
  );
  assert.ok(
    Math.abs(roundedTwoHealthRoot.raceDamage - (3 - Math.sqrt(3))) < 1e-12,
    "The 3 HP bounce should still use the mathematical square-root remainder",
  );
  resolveRaceBounce(roundedTwoHealthSim, roundedTwoHealthRoot);
  assert.equal(roundedTwoHealthRoot.raceDamage, 1.46, "The following displayed-two-health bounce should use the dedicated 1.46 rule");
  assert.ok(roundedTwoHealthRoot.raceLayerHealth[0] > 0 && roundedTwoHealthRoot.raceLayerHealth[0] < 1, "The 1.46 landing should leave a sub-one remainder");
  resolveRaceBounce(roundedTwoHealthSim, roundedTwoHealthRoot);
  assert.equal(roundedTwoHealthRoot.raceLayerHealth[0], 0, "The bounce after the displayed-two-health tail should break the layer");
  assert.ok(roundedTwoHealthSim.events.some((event) => event.type === "race-layer-break"), "The 9 to 3 to displayed-2 path should emit a layer break");

  const largeLayerSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["square-root"], ["unarmed"]],
    raceLayerStrengths: [10_000, 100, 100],
    seed: 10105,
  });
  const largeLayerRoot = largeLayerSim.fighters.find((fighter) => fighter.raceOrbId === "square-root");
  resolveRaceBounce(largeLayerSim, largeLayerRoot);
  assert.equal(largeLayerRoot.raceLayerHealth[0], 100, "A 10,000 HP layer should become 100 HP after Square Root");
  assert.equal(largeLayerRoot.raceDamage, 9_900, "Square Root should remove 9,900 from a 10,000 HP layer");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["twins"], ["unarmed"]],
    raceTeamOptions: [{}, { unarmed: { caged: true, cageDuration: 30 } }],
    raceLayerStrengths: [1_000_000, 1_000_000, 1_000_000],
    seed: 10106,
  });
  const twins = sim.fighters.find((fighter) => fighter.raceOrbId === "twins");
  const opponent = sim.fighters.find((fighter) => fighter.raceOrbId === "unarmed");
  opponent.raceLayerHealth[0] = 250_000;
  const opponentHealthBeforeHeal = opponent.raceLayerHealth[0];
  stepSimulation(sim, 5.2);
  assert.equal(twins.raceTwinHealing, true, "Twins should teleport one orb to the opponent after five seconds");
  assert.ok(twins.raceTwinOrb, "Twins should expose an independently simulated second orb");
  assert.ok(
    opponent.raceLayerHealth[0] > opponentHealthBeforeHeal,
    "The healing twin should restore opponent layer health while it is away",
  );
  assert.ok(twins.raceTwinOrb.raceDamage > 1, "The away twin should continue scaling its damage while healing");
  assert.equal(twins.raceTwinOrb.raceTeamIndex, opponent.raceTeamIndex, "The healing twin should use the opponent team lane while away");
  assert.ok(twins.raceTwinOrb.raceBounces > 0, "The healing twin should use normal bounce physics while away");
  const teleport = sim.events.find((event) => event.type === "race-twins-teleport");
  assert.equal(teleport?.targetTeamIndex, opponent.raceTeamIndex, "The visiting Twin should enter the opponent team lane");
  assert.ok(
    Number(teleport?.entryX) >= 0.06 && Number(teleport?.entryX) <= 0.94,
    "The visiting Twin should enter at a seeded in-lane position",
  );
  assert.ok(
    Number(teleport?.entryY) !== Number(teleport?.targetY),
    "The visiting Twin should not spawn on the opponent's exact position",
  );
  assert.equal(teleport?.spawnMode, "random-opponent-lane", "The visiting Twin should use the random opponent-lane entry mode");
  assert.equal(teleport?.independent, true, "The visiting Twin should keep an independent heading");
  assert.ok(sim.events.some((event) => event.type === "race-twins-heal" && event.surface === "number-line"), "The healing twin should heal on its own line contacts");
  stepSimulation(sim, 10.1);
  assert.equal(twins.raceTwinHealing, false, "The healing twin should return after its ten-second visit");
  assert.ok(sim.events.some((event) => event.type === "race-twins-return"));

  twins.raceTwinOrb.raceTrail = [{ x: 0.5, y: 0.2, age: 0, staleFromPreviousVisit: true }];
  twins.raceTwinOrb.raceBounceEffects = [{ x: 0.5, y: 0.2, age: 0, staleFromPreviousVisit: true }];
  stepSimulation(sim, 5.1);
  const secondTeleport = sim.events.find((event) => event.type === "race-twins-teleport");
  assert.equal(twins.raceTwinTeleportCount, 2, "Twins should make a second healing visit after returning home");
  assert.equal(secondTeleport?.spawnMode, "random-opponent-lane", "The second visit should use the random opponent-lane entry mode");
  assert.ok(
    !twins.raceTwinOrb.raceTrail.some((point) => point.staleFromPreviousVisit),
    "A second teleport should clear the previous Twin trail before new movement is rendered",
  );
  assert.ok(
    !twins.raceTwinOrb.raceBounceEffects.some((effect) => effect.staleFromPreviousVisit),
    "A second teleport should clear the previous Twin impact effects before new bounces are rendered",
  );
}

{
  const pairedSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["twins"], ["unarmed"]],
    raceLayerStrengths: [100, 100, 100],
    seed: 10108,
  });
  const pairedTwins = pairedSim.fighters.find((fighter) => fighter.raceOrbId === "twins");
  pairedTwins.raceDamage = 7;
  pairedTwins.raceLayerHealth[0] = 100;
  resolveRaceBounce(pairedSim, pairedTwins);
  const pairedImpact = pairedSim.events.find((event) => event.type === "race-bounce");

  const separatedSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["twins"], ["unarmed"]],
    raceLayerStrengths: [100, 100, 100],
    seed: 10108,
  });
  const separatedTwins = separatedSim.fighters.find((fighter) => fighter.raceOrbId === "twins");
  separatedTwins.raceTwinHealing = true;
  separatedTwins.raceDamage = 7;
  separatedTwins.raceLayerHealth[0] = 100;
  resolveRaceBounce(separatedSim, separatedTwins);
  const separatedImpact = separatedSim.events.find((event) => event.type === "race-bounce");

  assert.equal(pairedImpact?.damage, 8, "A paired Twin should keep its normal scaled damage");
  assert.equal(separatedImpact?.damage, pairedImpact?.damage * 2, "The separated red Twin should deal double its normal damage");
  assert.equal(separatedTwins.raceLayerHealth[0], 84, "The separated red Twin should apply the doubled layer damage");
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["scissor"], ["unarmed"]],
    raceLayerStrengths: [100, 100, 100],
    seed: 10107,
  });
  const scissor = sim.fighters.find((fighter) => fighter.raceOrbId === "scissor");
  resolveRaceBounce(sim, scissor);
  assert.equal(scissor.raceLayerHealth[0], 50, "Scissor should leave the aggregate layer at half health");
  assert.deepEqual(scissor.raceTiltedLayerHealth[0], [50, 50], "Scissor should create two equal tilted pieces");
  assert.equal(scissor.raceScissorSplitCount, 1);
  assert.equal(scissor.raceScissorSplitEffects.length, 1);
  assert.ok(Math.abs(scissor.raceScissorSplitEffects[0].lifetime - (1.15 / 0.75)) < 1e-12);
  assert.equal(scissor.raceScissorSplitEffects[0].playbackRate, 0.75);
  assert.ok(sim.events.some((event) => event.type === "race-scissor-split"));

  const persistentSplitSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["scissor", "unarmed"], ["unarmed"]],
    raceLayerStrengths: [2, 100, 100],
    seed: 101071,
  });
  const persistentScissor = persistentSplitSim.fighters.find((fighter) => fighter.raceOrbId === "scissor");
  const persistentTeammate = persistentSplitSim.fighters.find((fighter) => (
    fighter.raceTeamIndex === persistentScissor.raceTeamIndex
      && fighter.raceOrbId === "unarmed"
  ));
  resolveRaceBounce(persistentSplitSim, persistentScissor, persistentScissor, 0);
  persistentTeammate.raceX = 0.25;
  resolveRaceBounce(persistentSplitSim, persistentTeammate, persistentTeammate, 0);
  assert.deepEqual(persistentScissor.raceTiltedLayerHealth[0], [0, 1]);
  persistentScissor.raceX = 0.25;
  persistentScissor.raceY = raceTiltedLayerSurfaceY(0, persistentScissor.raceX)
    - RACE_ORB_RADIUS * persistentScissor.raceOrbScale - 0.001;
  persistentScissor.raceVx = 0;
  persistentScissor.raceVy = 0.5;
  for (let step = 0; step < 300 && persistentScissor.raceLayerIndex === 0; step += 1) {
    stepOrbRace(persistentSplitSim, 1 / 120);
  }
  assert.equal(persistentScissor.raceLayerIndex, 1, "Scissor should fall through the broken half into the next layer");
  assert.deepEqual(
    persistentScissor.raceTiltedLayerHealth[0],
    [0, 1],
    "The surviving half of the previous layer must persist after Scissor advances",
  );
  for (let step = 0; step < 600 && !persistentSplitSim.events.some((event) => (
    event.type === "race-scissor-split" && event.layerIndex === 1
  )); step += 1) {
    stepOrbRace(persistentSplitSim, 1 / 120);
  }
  assert.deepEqual(
    persistentScissor.raceTiltedLayerHealth[0],
    [0, 1],
    "Splitting the new layer must not regrow or recut the previous layer",
  );
  assert.deepEqual(persistentScissor.raceTiltedLayerHealth[1], [50, 50], "Scissor should split only the layer it reaches");

  const physicalSplitSim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["scissor", "unarmed"], ["unarmed"]],
    raceLayerStrengths: [2, 100, 100],
    seed: 101072,
  });
  const physicalScissor = physicalSplitSim.fighters.find((fighter) => fighter.raceOrbId === "scissor");
  const physicalTeammate = physicalSplitSim.fighters.find((fighter) => (
    fighter.raceTeamIndex === physicalScissor.raceTeamIndex
      && fighter.raceOrbId === "unarmed"
  ));
  resolveRaceBounce(physicalSplitSim, physicalScissor, physicalScissor, 0);
  physicalTeammate.raceX = 0.25;
  resolveRaceBounce(physicalSplitSim, physicalTeammate, physicalTeammate, 0);
  physicalScissor.raceX = 0.25;
  physicalScissor.raceY = raceTiltedLayerSurfaceY(0, physicalScissor.raceX)
    - RACE_ORB_RADIUS * physicalScissor.raceOrbScale - 0.001;
  physicalScissor.raceVx = 0;
  physicalScissor.raceVy = 0.5;
  for (let step = 0; step < 300 && physicalScissor.raceLayerIndex === 0; step += 1) {
    stepOrbRace(physicalSplitSim, 1 / 120);
  }
  physicalTeammate.raceX = 0.75;
  physicalTeammate.raceY = raceTiltedLayerSurfaceY(0, physicalTeammate.raceX)
    - RACE_ORB_RADIUS * physicalTeammate.raceOrbScale - 0.001;
  physicalTeammate.raceVx = 0;
  physicalTeammate.raceVy = 0.5;
  for (let step = 0; step < 240 && !physicalSplitSim.events.some((event) => (
    event.type === "race-tilted-piece-break" && event.layerIndex === 0 && event.pieceIndex === 1
  )); step += 1) {
    stepOrbRace(physicalSplitSim, 1 / 120);
  }
  assert.ok(
    physicalSplitSim.events.some((event) => (
      event.type === "race-tilted-piece-break" && event.layerIndex === 0 && event.pieceIndex === 1
    )),
    "An unbroken half must remain a physical, damageable layer after Scissor advances",
  );
  assert.deepEqual(
    physicalScissor.raceTiltedLayerHealth[0],
    [0, 0],
    "The surviving half should be breakable without regrowing the original split",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["progressive"], ["unarmed"]],
    raceTeamOptions: [{ progressive: { caged: true, cageDuration: 100 } }, {}],
    raceLayerStrengths: [1_000_000, 1_000_000, 1_000_000],
    seed: 10103,
  });
  const progressive = sim.fighters.find((fighter) => fighter.raceOrbId === "progressive");
  assert.equal(progressive.raceDamage, 1);
  run(sim, RACE_PROGRESSIVE_INTERVAL_SECONDS + 0.05);
  assert.equal(progressive.raceProgressiveUseCount, 1);
  assert.equal(progressive.raceProgressiveDamage, 5);
  run(sim, RACE_PROGRESSIVE_INTERVAL_SECONDS + 0.05);
  assert.equal(progressive.raceProgressiveUseCount, 2);
  assert.equal(progressive.raceProgressiveDamage, 25);
  assert.equal(progressive.raceProgressiveCooldownSeconds, RACE_PROGRESSIVE_POST_SECOND_INTERVAL_SECONDS);
  run(sim, RACE_PROGRESSIVE_POST_SECOND_INTERVAL_SECONDS + 0.05);
  assert.equal(progressive.raceProgressiveUseCount, 3);
  assert.equal(progressive.raceProgressiveDamage, 125);
  assert.ok(
    sim.events.some((event) => event.type === "race-progressive-boost" && event.useCount === 3),
    "Progressive should retain its latest ×5 boost event in the event window",
  );
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["random"], ["unarmed"]],
    raceLayerStrengths: [100, 100, 100],
    seed: 10104,
  });
  const random = sim.fighters.find((fighter) => fighter.raceOrbId === "random");
  sim.raceRng.next = () => 0.99;
  resolveRaceBounce(sim, random);
  assert.equal(random.raceRandomLastDamage, 1, "Random's first range should be exactly 1");
  assert.equal(random.raceRandomMaxDamage, 6);
  resolveRaceBounce(sim, random);
  assert.equal(random.raceRandomLastDamage, 6);
  assert.equal(random.raceRandomMaxDamage, 11);
  assert.ok(sim.events.some((event) => event.type === "race-random-damage" && event.maximum === 6));
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["rain"], ["unarmed"]],
    raceTeamOptions: [{}, { unarmed: { caged: true, cageDuration: 100 } }],
    raceLayerStrengths: [1_000_000, 1_000_000, 1_000_000],
    seed: 4141,
  });
  const rain = sim.fighters.find((fighter) => fighter.raceOrbId === "rain");
  run(sim, RACE_RAIN_COOLDOWN_SECONDS + RACE_RAIN_DURATION_SECONDS + 0.1);
  assert.equal(rain.raceRainUseCount, 1);
  assert.equal(rain.raceRainActive, false);
  assert.equal(rain.raceRainDropCount, RACE_RAIN_DROP_COUNT, "Rain should resolve exactly 100 drops per use");
  assert.equal(rain.raceRainDamagePerDrop, RACE_RAIN_DROP_DAMAGE);
  assert.ok(
    sim.events.some((event) => event.type === "race-rain-drop" && event.drop === RACE_RAIN_DROP_COUNT),
    "the final rain drop event should carry the complete 100-drop count",
  );
  assert.ok(sim.events.some((event) => event.type === "race-rain-end"));
  run(sim, RACE_RAIN_COOLDOWN_SECONDS + 0.1);
  assert.equal(rain.raceRainUseCount, 2, "Rain cooldown should begin only after the active rain finishes");
  assert.equal(rain.raceRainDamagePerDrop, RACE_RAIN_DROP_DAMAGE * 2, "Rain damage should double after each use");
  assert.equal(rain.raceDamage, 0, "Rain itself should not add ordinary bounce damage");
}

{
  const outcomeCases = [
    [0.01, "slow"],
    [0.21, "infinite"],
    [0.41, "copy"],
    [0.61, "slammy"],
    [0.81, "hydrogen-bomb"],
  ];
  for (const [rngValue, expectedOutcome] of outcomeCases) {
    const sim = createSimulation({
      gameplayMode: ORB_RACE_MODE,
      raceTeams: [["hacker"], ["sniper"]],
      raceTeamOptions: [{}, { sniper: { caged: true, cageDuration: 100 } }],
      raceLayerStrengths: [1_000_000, 1_000_000, 1_000_000],
      seed: 5151,
    });
    const hacker = sim.fighters.find((fighter) => fighter.raceOrbId === "hacker");
    sim.raceRng.next = () => rngValue;
    hacker.raceHackerNextHackAt = 0;
    run(sim, 3.1);
    assert.equal(hacker.raceHackerOutcome, expectedOutcome, `Hacker should resolve deterministic ${expectedOutcome} outcome`);
    assert.ok(sim.events.some((event) => event.type === "race-hacker-start"));
    assert.ok(sim.events.some((event) => event.type === "race-hacker-result"));
    if (expectedOutcome === "copy") {
      assert.equal(hacker.raceHackerCopiedOrbId, "sniper");
      assert.ok(hacker.raceHackerCopyDamage > 0);
      assert.equal(hacker.raceHackerSpawnedOrbs.length, 1, "Copy should spawn a separate moving orb");
      const copiedChild = hacker.raceHackerSpawnedOrbs[0];
      assert.equal(copiedChild.raceHackerChildKind, "copy");
      assert.equal(copiedChild.raceOrbId, "sniper");
      assert.ok(copiedChild.raceAbilityIds.includes("sniper"), "Copied child should carry the source orb's UI/effect identity");
      assert.ok(copiedChild.raceHackerSourceRadiusScale > 0, "Copied child should inherit the source orb's current visual scale");
      assert.equal(copiedChild.raceOrbScale, sim.fighters.find((fighter) => fighter.raceOrbId === "sniper").raceOrbScale);
      assert.ok(sim.events.some((event) => event.type === "race-hacker-copy-spawn" && event.childId === copiedChild.id));
      const copiedChildX = copiedChild.raceX;
      hacker.raceVx = 0;
      run(sim, 0.1);
      assert.notEqual(copiedChild.raceX, copiedChildX, "Copied orb should bounce independently of Hacker");
      const ownerLayerHealthBeforeCopiedAbility = hacker.raceLayerHealth[0];
      run(sim, 5);
      assert.ok(
        sim.events.some((event) => event.type === "race-sniper-fire" && event.fighterId === copiedChild.id),
        "Copied weapon orbs should run their source ability update independently",
      );
      assert.ok(
        hacker.raceLayerHealth[0] < ownerLayerHealthBeforeCopiedAbility,
        "Copied weapon projectiles should damage the Hacker team's live layers",
      );
    }
    if (expectedOutcome === "slammy") {
      assert.equal(hacker.raceHackerSlammyCount, 10);
      assert.equal(hacker.raceRealitySpawns.length, 10);
      run(sim, 5);
      assert.ok(
        hacker.raceRealitySpawns.every((spawn) => spawn.raceDamage > 0 && spawn.raceMiniScale > 0.82),
        "Hacker's Slammy children should use the real damage and scale ramp",
      );
      assert.ok(
        sim.events.some((event) => event.type === "race-bounce" && event.orbId?.includes("-reality-") && event.damage > 0),
        "Hacker's Slammy children should damage a layer on their own bounces",
      );
    }
    if (expectedOutcome === "hydrogen-bomb") {
      assert.equal(hacker.raceHackerHydrogenBomb.active, true);
      assert.equal(hacker.raceHackerHydrogenBomb.spawned, true);
      assert.equal(hacker.raceHackerHydrogenBomb.raceOrbId, "hydrogen-bomb");
      assert.equal(hacker.raceHackerHydrogenBomb.cooldownSeconds, 60);
      assert.ok(hacker.raceHackerHydrogenBomb.remaining < 60);
      assert.equal(hacker.raceHackerSpawnedOrbs.length, 1, "Hydrogen outcome should spawn a separate bomb orb");
      const hydrogenChild = hacker.raceHackerSpawnedOrbs[0];
      assert.equal(hydrogenChild.raceHackerChildKind, "hydrogen-bomb");
      assert.equal(hydrogenChild.raceOrbId, "hydrogen-bomb");
      assert.equal(hacker.raceHackerHydrogenBomb.childId, hydrogenChild.id);
      assert.equal(hydrogenChild.raceX, hacker.raceHackerHydrogenBomb.raceX);
      assert.ok(
        sim.events.some((event) => event.type === "race-hydrogen-bomb-countdown-start" && event.fighterId === hydrogenChild.id),
        "Hydrogen child should start the normal looped countdown siren event",
      );
    }
  }
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["hacker"], ["unarmed"]],
    raceTeamOptions: [{}, { unarmed: { caged: true, cageDuration: 100 } }],
    raceLayerStrengths: [100_000_000, 100_000_000, 100_000_000],
    seed: 5152,
  });
  const hacker = sim.fighters.find((fighter) => fighter.raceOrbId === "hacker");
  const opponent = sim.fighters.find((fighter) => fighter.raceOrbId === "unarmed");
  sim.raceRng.next = () => 0.81;
  hacker.raceHackerNextHackAt = 0;
  run(sim, 4);
  const hydrogenChild = hacker.raceHackerSpawnedOrbs.find((child) => child.raceHackerChildKind === "hydrogen-bomb");
  assert.ok(hydrogenChild, "Hydrogen hack should create an independent Hydrogen Bomb child");
  assert.ok(hydrogenChild.raceHydrogenCountdownProgress > 0, "Hacker Hydrogen should expose a live countdown state");
  run(sim, 60);
  assert.equal(sim.raceHydrogenBombExploded, true, "Hacker's Hydrogen child should complete its normal countdown and explode");
  assert.equal(sim.raceHydrogenBombSourceId, hydrogenChild.id, "The child should own the normal Hydrogen explosion event");
  assert.equal(opponent.raceDestroyedByHydrogenBomb, true, "The Hydrogen child should remove the opponent on detonation");
  assert.equal(hacker.raceDestroyedByHydrogenBomb, false, "Hydrogen detonation must preserve the Hacker carrier");
  assert.ok(
    sim.events.some((event) => event.type === "race-hydrogen-bomb-explosion" && event.fighterId === hydrogenChild.id),
    "Hacker Hydrogen should emit the same explosion event used by a normal Hydrogen Bomb",
  );
}

for (const copiedOrbId of ["orbital", "whirlwind"]) {
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["hacker"], [copiedOrbId]],
    raceLayerStrengths: [1_000_000, 1_000_000, 1_000_000],
    seed: copiedOrbId === "orbital" ? 7171 : 8181,
  });
  const hacker = sim.fighters.find((fighter) => fighter.raceOrbId === "hacker");
  const source = sim.fighters.find((fighter) => fighter.raceOrbId === copiedOrbId);
  source.raceOrbScale = 1.4;
  if (copiedOrbId === "orbital") source.raceOrbiters = 3;
  if (copiedOrbId === "whirlwind") source.raceWhirlwindRotationSpeed = 2;
  sim.raceRng.next = () => 0.41;
  hacker.raceHackerNextHackAt = 0;
  run(sim, 3.1);
  const child = hacker.raceHackerSpawnedOrbs[0];
  assert.equal(child.raceOrbId, copiedOrbId, `Hacker should spawn a ${copiedOrbId} child`);
  assert.equal(child.raceOrbScale, source.raceOrbScale, `${copiedOrbId} child should retain the source scale`);
  if (copiedOrbId === "orbital") {
    assert.ok(child.raceOrbiters >= 1, "Copied Orbital should render its orbiting balls immediately");
  } else {
    const rotationBefore = child.raceWhirlwindRotation;
    run(sim, 0.1);
    assert.notEqual(child.raceWhirlwindRotation, rotationBefore, "Copied Whirlwind satellites should keep orbiting independently");
  }
}

{
  const sim = createSimulation({
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["miner"], ["unarmed"]],
    raceTeamOptions: [{}, { unarmed: { caged: true, cageDuration: 100 } }],
    raceLayerStrengths: [1_000, 1_000, 1_000],
    seed: 6161,
  });
  const miner = sim.fighters.find((fighter) => fighter.raceOrbId === "miner");
  miner.raceY = raceLayerLineY(0) - RACE_ORB_RADIUS;
  miner.raceVy = 0;
  stepSimulation(sim, 1 / 120);
  assert.equal(miner.raceMinerAttached, true, "Miner should attach when its orb contacts a layer");
  assert.equal(miner.raceMinerState, "digging");
  assert.equal(
    miner.raceY,
    raceLayerLineY(0) - RACE_ORB_RADIUS,
    "Attached Miner should sit on the visible top edge of its active layer",
  );
  run(sim, RACE_MINER_UPGRADE_SECONDS + 0.2);
  assert.equal(miner.raceMinerState, "drill", "Miner should upgrade from shovel to jackhammer after 20 seconds");
  assert.equal(miner.raceMinerUpgradeProgress, 1);
  const healthBeforeDrill = miner.raceLayerHealth[0];
  const drillStartY = miner.raceY;
  run(sim, RACE_MINER_DRILL_SECONDS * 0.5);
  assert.ok(miner.raceY > drillStartY, "Miner should descend with the shrinking layer while drilling");
  run(sim, RACE_MINER_DRILL_SECONDS * 0.5 + 0.2);
  assert.ok(miner.raceLayerHealth[0] <= 1e-6, "Miner should destroy its attached layer in five seconds");
  assert.equal(miner.raceMinerFallThrough, false, "Miner should not enter the removed falling state");
  assert.equal(miner.raceMinerAttached, true, "Miner should stay attached and continue drilling the next layer");
  assert.equal(miner.raceMinerLayerIndex, 1, "Miner should retarget the next active layer after a break");
  assert.equal(miner.raceMinerState, "drill", "Miner should remain in the drilling state after a break");
  assert.ok(miner.raceMinerDrillProgress < 0.2, "Miner should reset its drill clock for the next layer");
  run(sim, 0.5);
  assert.equal(miner.raceMinerAttached, true, "Miner should remain planted on the next layer");
  assert.equal(miner.raceMinerState, "drill", "Miner should keep drilling after the layer transition");
  assert.ok(miner.raceMinerDrillProgress > 0, "Miner should restart the drill clock on the next layer");
  assert.ok(miner.raceLayerHealth[1] < 1_000, "Miner should damage the next layer without a falling pause");
  assert.ok(healthBeforeDrill > miner.raceLayerHealth[0]);
  assert.ok(sim.events.some((event) => event.type === "race-miner-layer-break"));
  assert.ok(sim.events.some((event) => event.type === "race-miner-layer-continue"));
}

console.log("simulation tests passed");
