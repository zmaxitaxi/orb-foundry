import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
    CLASSIC_DEFAULT_CLASSES,
    CLASSIC_ORB_IDS,
    CLASSIC_ORBS,
    CLASSIC_ORB_SIZE_PROFILES,
    classicCollisionDamageEnabled,
    normalizeClassicClasses,
    normalizeClassicSpeedMode,
} from "../src/classic-orbs.js";
import {
    ORB_BASE_SPEED,
    ORB_RADIUS,
    captureReplayFrame,
    classicCutterZoneGeometryFor,
    classicCutterZoneGeometriesFor,
    classicCutterVisibleZoneGeometriesFor,
    classicCutterZoneContainsPoint,
    createSimulation,
    getWeaponSegment,
    stepSimulation,
} from "../src/simulation.js";

const STEP = 1 / 120;
const EXPECTED_CLASSIC_IDS = [
    "sword", "duplicator", "orbital", "unarmed", "slammy", "vampire", "turret",
    "flash", "reactor", "sniper", "draftmaster", "blue-sun", "black-hole",
    "tripwire", "hydrogen-bomb", "necromancer", "poison", "spikey", "snake",
    "virus", "shrapnel", "cobwebs", "apple", "absorber", "batman", "ying-yang",
    "trapper", "hive-ball", "zeus", "glass-ball", "pistol", "shotgun", "rifle",
    "sawball", "cutter", "trident", "lazer", "charger", "parasites", "grappler",
    "train", "frost-ball", "jackpot", "boxer", "artist", "monster", "fairy",
    "commander",
];

function step(sim, count = 1) {
    for (let index = 0; index < count && !sim.finished; index += 1) stepSimulation(sim, STEP);
}

function runSeconds(sim, seconds) {
    step(sim, Math.ceil(seconds / STEP));
}

function forceWallBounce(sim, fighter, side = "left", verticalVelocity = 0) {
    const bounds = sim.arenaBounds;
    fighter.y = bounds.y + bounds.height / 2;
    fighter.vy = verticalVelocity;
    if (side === "left") {
        fighter.x = bounds.x + fighter.radius - 1;
        fighter.vx = -fighter.baselineSpeed;
    } else {
        fighter.x = bounds.x + bounds.width - fighter.radius + 1;
        fighter.vx = fighter.baselineSpeed;
    }
    step(sim);
}

function setVampireLatch(sim, vampire, target, duration = 2) {
    vampire.x = 300;
    vampire.y = 300;
    target.x = 500;
    target.y = 300;
    vampire.vx = vampire.vy = target.vx = target.vy = 0;
    vampire.classicLatchPhase = "latched";
    vampire.classicLatchTargetId = target.id;
    vampire.classicLatchStartedAt = sim.time;
    vampire.classicLatchUntil = sim.time + duration;
    vampire.classicLatchAngle = 0;
    vampire.classicLatchBaseAngle = 0;
    vampire.classicLatchLastTargetBaseX = target.x;
    vampire.classicLatchLastTargetBaseY = target.y;
    target.classicLatchWiggleOffsetX = 0;
    target.classicLatchWiggleOffsetY = 0;
}

function assertBoundaryPoint(point, bounds, message) {
    const onVertical = Math.abs(point.x - bounds.x) < 1e-9 || Math.abs(point.x - (bounds.x + bounds.width)) < 1e-9;
    const onHorizontal = Math.abs(point.y - bounds.y) < 1e-9 || Math.abs(point.y - (bounds.y + bounds.height)) < 1e-9;
    assert.equal(onVertical || onHorizontal, true, message);
}

test("Classic exposes the approved stable roster and rejects removed weapon orbs", () => {
    assert.deepEqual(CLASSIC_ORB_IDS, EXPECTED_CLASSIC_IDS);
    assert.deepEqual(Object.keys(CLASSIC_ORBS), EXPECTED_CLASSIC_IDS);
    assert.deepEqual(CLASSIC_DEFAULT_CLASSES, ["sword", "orbital"]);
    assert.deepEqual(normalizeClassicClasses(["bow", "grower"]), CLASSIC_DEFAULT_CLASSES);
    assert.deepEqual(normalizeClassicClasses(["vampire", "turret", "flash"]), ["vampire", "turret"]);
    assert.equal(normalizeClassicSpeedMode("fast"), "fast");
    assert.equal(normalizeClassicSpeedMode("invalid"), "regular");
    assert.equal(classicCollisionDamageEnabled("unarmed"), true);
    assert.equal(classicCollisionDamageEnabled("turret"), false);
    const nonDamagingAbilityKinds = new Set([null, "flash"]);
    for (const orb of Object.values(CLASSIC_ORBS)) {
        const hasDamageSource = orb.defaultCollisionDamage
            || orb.weapon.damage > 0
            || !nonDamagingAbilityKinds.has(orb.classicAbility.kind)
            || orb.id === "orbital";
        assert.equal(hasDamageSource, true, `${orb.id} must retain at least one default damage source`);
    }
});

test("Classic launches both fighters on one seeded random heading and remains constant-speed", () => {
  const sim = createSimulation({ classes: ["sword", "orbital"], seed: 7 });
    const [left, right] = sim.fighters;
    assert.equal(left.classicLaunchAngle, right.classicLaunchAngle, "both Classic fighters share the seeded launch heading");
    assert.ok(Math.abs(left.vx - right.vx) < 1e-9 && Math.abs(left.vy - right.vy) < 1e-9, "both fighters launch in the same direction");
    assert.ok(Math.hypot(left.vx, left.vy) > 0, "the shared heading is non-zero");
    assert.ok(
        Math.hypot(right.x - left.x, right.y - left.y) - left.radius - right.radius > left.radius * 5,
        "Classic opening spawns leave ample visual room between the orbs",
    );
    assert.equal(left.baselineSpeed, ORB_BASE_SPEED * 0.75);
    for (let index = 0; index < 720; index += 1) {
        step(sim);
        for (const fighter of sim.fighters.filter(({ alive }) => alive)) {
            assert.ok(Math.abs(Math.hypot(fighter.vx, fighter.vy) - fighter.baselineSpeed) < 1e-7);
        }
    }
});

test("Classic per-orb options preserve speed, trail, and collision settings", () => {
    const sim = createSimulation({
        classes: ["unarmed", "turret"],
        classicOrbOptions: {
            unarmed: { speedMode: "fast", fadingTrails: true, collisionDamage: false },
            turret: { speedMode: "slow", solidTrails: true, collisionDamage: true },
        },
    });
    const [unarmed, turret] = sim.fighters;
    assert.equal(unarmed.classicSpeedMode, "fast");
    assert.ok(Math.abs(unarmed.baselineSpeed - ORB_BASE_SPEED * 0.75 * 1.3) < 1e-9);
    assert.equal(unarmed.classicFadingTrailsEnabled, true);
    assert.equal(unarmed.classicCollisionDamageEnabled, false);
    assert.equal(turret.classicSpeedMode, "slow");
    assert.equal(turret.classicSolidTrailsEnabled, true);
    assert.equal(turret.classicCollisionDamageEnabled, true);
    step(sim, 40);
    assert.equal(unarmed.trail.length, 16);
    assert.equal(turret.trail.length, 32);
});

test("collision damage toggle gates ordinary body damage", () => {
    for (const enabled of [false, true]) {
        const sim = createSimulation({
            classes: ["unarmed", "turret"],
            classicOrbOptions: { unarmed: { collisionDamage: enabled } },
        });
        const [attacker, target] = sim.fighters;
        attacker.x = target.x = 350;
        attacker.y = target.y = 300;
        attacker.vx = attacker.vy = target.vx = target.vy = 0;
        step(sim);
        assert.equal(target.maxHealth - target.health, enabled ? 1 : 0);
    }

    const fallback = createSimulation({
        classes: ["turret", "hydrogen-bomb"],
        classicOrbOptions: { turret: { collisionDamage: true } },
    });
    const [zeroBase, target] = fallback.fighters;
    zeroBase.x = target.x = 350;
    zeroBase.y = target.y = 300;
    zeroBase.vx = zeroBase.vy = target.vx = target.vy = 0;
    step(fallback);
    assert.equal(target.maxHealth - target.health, 1, "enabled zero-base orbs receive the one-damage contact fallback");
});

test("Flash burst temporarily exceeds its constant baseline", () => {
    const sim = createSimulation({ classes: ["flash", "hydrogen-bomb"], seed: 8 });
    const flash = sim.fighters[0];
    flash.classicAbilityNextAt = 0;
    step(sim);
    assert.ok(flash.classicAbilityActiveUntil > sim.time);
    assert.ok(Math.abs(Math.hypot(flash.vx, flash.vy) - flash.baselineSpeed * 2) < 1e-7);
    runSeconds(sim, 0.6);
    assert.ok(Math.abs(Math.hypot(flash.vx, flash.vy) - flash.baselineSpeed) < 1e-7);
});

test("wall bounces scale only intended Classic mechanics and spawn deterministic entities", () => {
    const slammySim = createSimulation({ classes: ["slammy", "sword"], seed: 11 });
    const slammy = slammySim.fighters[0];
    forceWallBounce(slammySim, slammy);
    assert.equal(slammy.damage, 2);

    const orbitalSim = createSimulation({ classes: ["orbital", "sword"], seed: 12 });
    const orbital = orbitalSim.fighters[0];
    forceWallBounce(orbitalSim, orbital);
    assert.equal(orbital.classicOrbiters, 1);
    const target = orbitalSim.fighters[1];
    const angle = (orbitalSim.time + STEP) * 2.4;
    orbital.x = 300;
    orbital.y = 300;
    target.x = orbital.x + Math.cos(angle) * orbital.radius * 1.92;
    target.y = orbital.y + Math.sin(angle) * orbital.radius * 1.92;
    target.radius = 2;
    step(orbitalSim);
    assert.equal(orbital.classicOrbiters, 0, "an orbiter is consumed after dealing damage");

    const turretSim = createSimulation({ classes: ["turret", "sword"], seed: 13 });
    forceWallBounce(turretSim, turretSim.fighters[0]);
    assert.equal(
        turretSim.classicEntities.some(({ kind }) => kind === "turret"),
        false,
        "Classic Turret should not spawn from a wall bounce",
    );
    step(turretSim, 480);
    assert.equal(turretSim.classicEntities.filter(({ kind }) => kind === "turret").length, 1);
});

test("Classic Turret deploys one permanent physical obstacle per timer interval", () => {
    const sim = createSimulation({ classes: ["turret", "hydrogen-bomb"], seed: 1301 });
    const [turretFighter, target] = sim.fighters;
    forceWallBounce(sim, turretFighter);
    assert.equal(sim.classicEntities.filter(({ kind }) => kind === "turret").length, 0);
    step(sim, 480);
    const first = sim.classicEntities.find(({ kind }) => kind === "turret");
    assert.ok(first);
    assert.equal(first.spawnMode, "timer");
    assert.equal(first.spawnInterval, 4);
    assert.equal(first.physical, true);
    assert.equal(first.solid, true);
    assert.equal(first.collisionMode, "physical-turret");
    assert.equal(first.permanent, true);
    assert.equal(first.expiresAt, null);
    assert.equal(turretFighter.classicTurretSpawnCount, 1);

    // A subsequent wall contact cannot create a second turret. The next
    // deployment is still owned exclusively by the four-second timer.
    assert.equal(sim.classicEntities.filter(({ kind }) => kind === "turret").length, 1);
    forceWallBounce(sim, turretFighter, "right");
    assert.equal(sim.classicEntities.filter(({ kind }) => kind === "turret").length, 1);

    // Turrets are solid but harmless as bodies: an opposing orb is pushed out
    // of the visible turret radius and receives a physical-bounce event.
    const active = sim.classicEntities.find(({ kind }) => kind === "turret");
    turretFighter.x = sim.arenaBounds.x + sim.arenaBounds.width - turretFighter.radius - 8;
    turretFighter.y = sim.arenaBounds.y + sim.arenaBounds.height - turretFighter.radius - 8;
    active.x = 180;
    active.y = 300;
    target.x = active.x + 40;
    target.y = active.y;
    target.vx = target.vy = 0;
    step(sim);
    assert.ok(sim.events.some(({ type, objectBKind }) => (
        type === "classic-weapon-physical-bounce" && objectBKind === "turret"
    )));
    assert.ok(Math.hypot(target.x - active.x, target.y - active.y) >= target.radius + active.radius - 1e-6);

    // Turrets accumulate without an active-instance cap, but each interval
    // contributes exactly one new spawn event.
    step(sim, 500);
    const activeTurrets = sim.classicEntities.filter(({ kind }) => kind === "turret");
    assert.equal(activeTurrets.length, 2);
    const turretSpawns = sim.events.filter(({ type, hazardKind }) => type === "classic-hazard-spawn" && hazardKind === "turret");
    assert.equal(turretSpawns.length, 2);
    assert.ok(turretSpawns[1].time - turretSpawns[0].time >= 4 - STEP);
    assert.equal(turretFighter.classicTurretSpawnCount, 2);
    const replayFighter = captureReplayFrame(sim).fighters.find(({ id }) => id === turretFighter.id);
    assert.equal(replayFighter.classicTurretNextSpawnAt, turretFighter.classicTurretNextSpawnAt);
    assert.equal(replayFighter.classicTurretSpawnCount, turretFighter.classicTurretSpawnCount);

    const replayA = createSimulation({ classes: ["turret", "hydrogen-bomb"], seed: 1302 });
    const replayB = createSimulation({ classes: ["turret", "hydrogen-bomb"], seed: 1302 });
    step(replayA, 720);
    step(replayB, 720);
    assert.deepEqual(captureReplayFrame(replayA), captureReplayFrame(replayB));
});

test("Classic turret balls and Necromancer arrows use three damage without Necromancer body damage", () => {
    const turretSim = createSimulation({ classes: ["turret", "hydrogen-bomb"], seed: 1303 });
    const [turretOwner, turretTarget] = turretSim.fighters;
    turretTarget.stunUntil = Infinity;
    turretTarget.vx = turretTarget.vy = 0;
    step(turretSim, 480);
    const turret = turretSim.classicEntities.find(({ kind }) => kind === "turret");
    assert.ok(turret);
    turret.nextShotAt = turretSim.time;
    step(turretSim);
    const turretShot = turretSim.events.findLast(({ type, fighterId, projectileKind }) => (
        type === "classic-projectile-fired"
        && fighterId === turretOwner.id
        && projectileKind === "projectile"
    ));
    assert.equal(turret.damage, 3);
    assert.equal(turretShot.damage, 3);

    const necromancerBodySim = createSimulation({
        classes: ["necromancer", "hydrogen-bomb"],
        classicOrbOptions: { necromancer: { collisionDamage: true } },
        seed: 1304,
    });
    const [necromancerBody, bodyTarget] = necromancerBodySim.fighters;
    necromancerBody.x = bodyTarget.x = 360;
    necromancerBody.y = bodyTarget.y = 360;
    necromancerBody.vx = necromancerBody.vy = bodyTarget.vx = bodyTarget.vy = 0;
    necromancerBody.stunUntil = bodyTarget.stunUntil = Infinity;
    bodyTarget.health = bodyTarget.maxHealth = 1000;
    bodyTarget.classicCoreHealth = bodyTarget.classicCoreMaxHealth = 1000;
    step(necromancerBodySim);
    assert.equal(bodyTarget.health, 1000, "Necromancer body overlap must not deal collision damage");
    assert.equal(necromancerBodySim.events.some(({ type, fighterId }) => (
        type === "classic-body-hit" && fighterId === necromancerBody.id
    )), false);

    const minionSim = createSimulation({ classes: ["necromancer", "hydrogen-bomb"], seed: 1305 });
    const [minionOwner, minionTarget] = minionSim.fighters;
    minionOwner.classicAbilityNextAt = 0;
    minionTarget.stunUntil = Infinity;
    step(minionSim, 130);
    const minion = minionSim.classicEntities.find(({ kind }) => kind === "necromancer-soldier");
    assert.ok(minion);
    minion.nextShotAt = minionSim.time;
    step(minionSim);
    const arrow = minionSim.classicEntities.find(({ kind }) => kind === "necromancer-arrow");
    const arrowEvent = minionSim.events.findLast(({ type, entityId }) => (
        type === "classic-minion-attack" && entityId === minion.id
    ));
    assert.equal(arrow?.damage, 3);
    assert.equal(arrowEvent.damage, 3);
    assert.equal(minionOwner.classicCollisionDamageEnabled, false);
});

test("Cutter follows wall contacts and Reactor renders a large growing blue blast", () => {
    const cutterSim = createSimulation({ classes: ["cutter", "hydrogen-bomb"], seed: 14 });
    const cutter = cutterSim.fighters[0];
    forceWallBounce(cutterSim, cutter, "left", cutter.baselineSpeed * 0.7);
    const cutterZone = cutterSim.classicEntities.find(({ kind }) => kind === "cutter-zone");
    assert.ok(cutterZone, "Cutter should create a visible zone entity");
    assert.equal(cutterZone.geometry, "wall-to-wall-half-plane");
    assertBoundaryPoint(cutterZone.lineStartWallContact, cutterSim.arenaBounds, "Cutter line must start at the actual wall contact");
    assert.equal(cutterZone.nextWallContact, null, "Cutter's active line should follow the orb until the next wall");
    assert.equal(cutterZone.activeSegment.x2, cutter.x);
    assert.equal(cutterZone.activeSegment.y2, cutter.y);
    assertBoundaryPoint(cutterZone.predictedNextWallContact, cutterSim.arenaBounds, "Cutter should expose the next predicted wall");
    assert.equal(cutterZone.zoneBelow, true);
    assert.equal(cutterZone.zoneMode, "smallest-half-plane");
    assert.ok(["positive", "negative"].includes(cutterZone.zoneSide));
    assert.ok(cutterZone.zoneAreaFraction > 0 && cutterZone.zoneAreaFraction <= 0.5 + 1e-9);
    assert.equal(cutterZone.zoneSegmentId, cutterZone.activeSegment.id);
    assert.ok(cutterZone.zonePolygon.length >= 3, "Cutter should expose the visible smallest zone polygon");
    const cutterGeometry = classicCutterZoneGeometryFor(cutterZone, cutterSim.arenaBounds);
    assert.ok(cutterGeometry);
    assert.equal(cutterGeometry.side, cutterZone.zoneSide);
    assert.equal(cutterGeometry.area, Math.min(cutterGeometry.positiveArea, cutterGeometry.negativeArea));
    assert.equal(cutterZone.zoneFill, "#9f123944");
    assert.equal(cutterZone.lineColor, "#ff2738");
    assert.equal(cutterZone.lineWidth, 2);
    assert.equal(cutterZone.permanent, true);
    assert.ok(cutterZone.zoneFill !== "#e3203048", "Cutter's zone should not reuse the health-red treatment");

    const firstZoneSegmentId = cutterZone.zoneSegmentId;
    forceWallBounce(cutterSim, cutter, "right", cutter.baselineSpeed * -0.55);
    assert.equal(cutterZone.activeLine, false, "a completed Cutter line should wait for the next wall");
    assert.equal(cutterZone.linePhase, "waiting");
    assert.equal(cutterZone.zoneSegmentId, cutterZone.completedSegments.at(-1).id);
    assert.ok(cutterZone.zonePolygon.length >= 3, "a completed Cutter line keeps its translucent damage area visible");
    assert.ok(cutterZone.zoneArea > 0, "the completed Cutter area retains its selected half-plane");
    const completedCutterGeometry = classicCutterZoneGeometryFor(cutterZone, cutterSim.arenaBounds);
    assert.ok(completedCutterGeometry, "completed Cutter geometry remains available to the renderer");
    assert.equal(completedCutterGeometry.segmentId, cutterZone.zoneSegmentId);
    forceWallBounce(cutterSim, cutter, "left", cutter.baselineSpeed * 0.62);
    assert.notEqual(cutterZone.zoneSegmentId, firstZoneSegmentId, "a new Cutter line should add a distinct overlapping area");
    assert.equal(cutterZone.zoneSegmentId, cutterZone.activeSegment.id);
    assert.equal(cutterZone.zonePolygon.length >= 3, true);
    assert.equal(cutterZone.previousZoneSegmentId, firstZoneSegmentId);
    assert.ok(cutterZone.previousZonePolygon.length >= 3, "the prior Cutter fill stays visible while the next line is drawn");
    const secondZoneSegmentId = cutterZone.zoneSegmentId;
    forceWallBounce(cutterSim, cutter, "right", cutter.baselineSpeed * -0.48);
    assert.equal(cutterZone.activeLine, false);
    assert.equal(cutterZone.previousZoneSegmentId, null, "the prior fill is replaced when the second line finishes");
    assert.equal(cutterZone.zoneSegmentId, secondZoneSegmentId);
    assert.ok(cutterZone.zonePolygon.length >= 3);
    const visibleCutterGeometries = classicCutterVisibleZoneGeometriesFor(cutterZone, cutterSim.arenaBounds);
    assert.equal(visibleCutterGeometries.length, 2, "the renderer/damage lifecycle keeps every non-expired area visible");
    assert.deepEqual(
        visibleCutterGeometries.map(({ segmentId }) => segmentId),
        cutterZone.completedSegments.slice(-3).map(({ id }) => id),
    );
    const overlappingCutterGeometries = classicCutterZoneGeometriesFor(cutterZone, cutterSim.arenaBounds);
    assert.equal(overlappingCutterGeometries.length, 2, "Cutter keeps both completed damage areas available for overlap");
    assert.deepEqual(
        overlappingCutterGeometries.map(({ segmentId }) => segmentId),
        cutterZone.completedSegments.map(({ id }) => id),
        "Cutter geometry order follows every completed wall-to-wall segment",
    );

    const reactorSim = createSimulation({ classes: ["reactor", "hydrogen-bomb"], seed: 15 });
    const reactor = reactorSim.fighters[0];
    reactor.classicAbilityNextAt = 0;
    step(reactorSim);
    const blast = reactorSim.classicEntities.find(({ kind }) => kind === "reactor-blast");
    assert.ok(blast, "Reactor should create a blast entity");
    assert.equal(blast.geometry, "growing-blue-circle");
    assert.equal(blast.fillColor, "#168cff44");
    assert.equal(blast.strokeColor, "#9de9ff");
    assert.equal(blast.duration, 1.1);
    assert.equal(blast.damageRadius, blast.radius, "Reactor's damage edge must match its visible edge");
    assert.ok(blast.maxRadius > blast.radius, "Reactor's visual blast should expand over time");
    assert.ok(Number.isFinite(blast.startedAt));
});

test("Reactor only damages targets inside its current visible edge", () => {
    const sim = createSimulation({ classes: ["reactor", "hydrogen-bomb"], seed: 1501 });
    const [reactor, target] = sim.fighters;
    const shortSide = Math.min(sim.arenaBounds.width, sim.arenaBounds.height);
    reactor.x = sim.arenaBounds.x + sim.arenaBounds.width * 0.5;
    reactor.y = sim.arenaBounds.y + sim.arenaBounds.height * 0.5;
    target.x = reactor.x + shortSide * 0.4;
    target.y = reactor.y;
    reactor.vx = reactor.vy = target.vx = target.vy = 0;
    reactor.stunUntil = target.stunUntil = Infinity;
    reactor.classicAbilityNextAt = 0;
    const healthBefore = target.health;
    step(sim);
    const blast = sim.classicEntities.find(({ kind }) => kind === "reactor-blast");
    assert.ok(blast);
    assert.equal(blast.damageRadius, blast.radius);
    assert.equal(target.health, healthBefore, "a target outside the initial visible circle must not be hit early");
    const initialRadius = blast.radius;
    step(sim, 45);
    assert.ok(blast.radius > initialRadius);
    assert.equal(blast.damageRadius, blast.radius);
    assert.equal(target.health, healthBefore, "the target remains safe until the drawn edge reaches it");
    step(sim, 65);
    assert.ok(blast.radius > initialRadius);
    assert.equal(target.health, healthBefore - 7, "the target is hit when the visible edge reaches it");
    assert.equal(
        sim.events.filter(({ type, targetId, entityId }) => (
            type === "classic-reactor-blast-hit" && targetId === target.id && entityId === blast.id
        )).length,
        1,
    );
});

test("Cutter keeps every non-expired damage area with red line and fill geometry", () => {
    const options = { classes: ["cutter", "hydrogen-bomb"], seed: 1401 };
    const first = createSimulation(options);
    const second = createSimulation(options);
    const advanceCutter = (sim) => {
        const cutter = sim.fighters[0];
        for (let bounce = 0; bounce < 8; bounce += 1) {
            forceWallBounce(sim, cutter, bounce % 2 === 0 ? "left" : "right", cutter.baselineSpeed * (bounce % 2 === 0 ? 0.37 : -0.41));
        }
        return sim.classicEntities.find(({ kind }) => kind === "cutter-zone");
    };
    const firstZone = advanceCutter(first);
    const secondZone = advanceCutter(second);
    assert.ok(firstZone);
    assert.equal(firstZone.activeDamageAreaLimit, null);
    assert.equal(firstZone.activeDamageAreaCount, firstZone.completedSegments.length);
    assert.equal(firstZone.activeDamageAreas.length, firstZone.completedSegments.length);
    assert.deepEqual(
        firstZone.activeDamageAreaIds,
        firstZone.completedSegments.map(({ id }) => id),
        "every non-expired completed Cutter segment remains active",
    );
    assert.deepEqual(
        firstZone.activeDamageLineSegments.map(({ segmentId }) => segmentId),
        firstZone.activeDamageAreaIds,
    );
    for (const area of firstZone.activeDamageAreas) {
        assert.equal(area.active, true);
        assert.equal(area.fill, "#9f123944");
        assert.equal(area.zoneFill, "#9f123944");
        assert.equal(area.lineColor, "#ff2738");
        assert.ok(area.polygon.length >= 3);
        assert.ok(area.line);
        assert.ok(Number.isFinite(area.line.x1));
        assert.ok(Number.isFinite(area.line.x2));
    }
    assert.deepEqual(
        captureReplayFrame(first),
        captureReplayFrame(second),
        "Cutter area retention and geometry remain seeded-replay deterministic",
    );
    assert.deepEqual(
        secondZone.activeDamageAreaIds,
        firstZone.activeDamageAreaIds.map((id) => id.replace("fighter-0", "fighter-0")),
    );

    const retentionSim = createSimulation(options);
    const retentionCutter = retentionSim.fighters[0];
    for (let bounce = 0; bounce < 6; bounce += 1) {
        forceWallBounce(
            retentionSim,
            retentionCutter,
            bounce % 2 === 0 ? "left" : "right",
            retentionCutter.baselineSpeed * (bounce % 2 === 0 ? 0.37 : -0.41),
        );
    }
    const thirdAreaZone = retentionSim.classicEntities.find(({ kind }) => kind === "cutter-zone");
    const thirdAreaId = thirdAreaZone.activeDamageAreaIds.at(-1);
    assert.equal(thirdAreaZone.completedLineCount, 3);
    assert.equal(thirdAreaZone.activeDamageAreaCount, thirdAreaZone.completedSegments.length);
    assert.ok(thirdAreaZone.activeDamageAreas.every(({ line, polygon }) => (
        line && polygon.length >= 3
    )), "the third retained Cutter area keeps both its red boundary and fill");

    // Starting the fourth line must not remove the third area. Its replacement
    // is not allowed to evict the prior area until the next wall closes.
    forceWallBounce(
        retentionSim,
        retentionCutter,
        "left",
        retentionCutter.baselineSpeed * 0.31,
    );
    assert.equal(thirdAreaZone.linePhase, "dragging");
    assert.ok(thirdAreaZone.activeDamageAreaIds.includes(thirdAreaId));
    assert.equal(thirdAreaZone.activeDamageAreaCount, thirdAreaZone.completedSegments.length);
    assert.ok(thirdAreaZone.activeDamageLineSegments.every(({ line, x1, y1, x2, y2 }) => (
        line && [x1, y1, x2, y2].every(Number.isFinite)
    )));

    forceWallBounce(
        retentionSim,
        retentionCutter,
        "right",
        -retentionCutter.baselineSpeed * 0.29,
    );
    assert.equal(thirdAreaZone.completedLineCount, 4);
    assert.ok(thirdAreaZone.activeDamageAreaIds.includes(thirdAreaId));
    assert.equal(thirdAreaZone.activeDamageAreaCount, 4);
});

test("Cutter expires each completed damage area independently after eight seconds", () => {
    const sim = createSimulation({ classes: ["cutter", "hydrogen-bomb"], seed: 14012 });
    const cutter = sim.fighters[0];
    forceWallBounce(sim, cutter, "left", cutter.baselineSpeed * 0.4);
    forceWallBounce(sim, cutter, "right", -cutter.baselineSpeed * 0.4);
    const zone = sim.classicEntities.find(({ kind }) => kind === "cutter-zone");
    assert.ok(zone);
    assert.equal(zone.completedSegments.length, 1);
    const [area] = zone.completedSegments;
    assert.equal(area.expiresAt - area.areaCreatedAt, 8);
    area.expiresAt = sim.time + STEP;
    step(sim, 2);
    assert.equal(zone.completedSegments.some(({ id }) => id === area.id), false);
    assert.equal(zone.activeDamageAreaIds.includes(area.id), false);
});

test("Cutter damage stacks once per retained red area", () => {
    const sim = createSimulation({ classes: ["cutter", "hydrogen-bomb"], seed: 14011 });
    const [cutter, target] = sim.fighters;
    target.stunUntil = Infinity;
    cutter.vx = cutter.vy = target.vx = target.vy = 0;
    target.health = target.maxHealth = 1000;
    target.classicCoreHealth = target.classicCoreMaxHealth = 1000;
    cutter.classicAbilityNextAt = 0;
    forceWallBounce(sim, cutter, "left", 0);
    const zone = sim.classicEntities.find(({ kind }) => kind === "cutter-zone");
    cutter.stunUntil = Infinity;
    // Two identical wall-to-wall segments deliberately overlap so the test
    // isolates stacking from polygon selection and movement.
    const segment = {
        id: `${zone.id}-stack-a`,
        x1: sim.arenaBounds.x,
        y1: sim.arenaBounds.y + 120,
        x2: sim.arenaBounds.x + sim.arenaBounds.width,
        y2: sim.arenaBounds.y + sim.arenaBounds.height - 120,
        width: zone.width,
        active: false,
        startedAt: 0,
        endedAt: 0,
        startWallContact: { x: sim.arenaBounds.x, y: sim.arenaBounds.y + 120, side: "left" },
        endWallContact: {
            x: sim.arenaBounds.x + sim.arenaBounds.width,
            y: sim.arenaBounds.y + sim.arenaBounds.height - 120,
            side: "right",
        },
    };
    zone.completedSegments = [
        segment,
        { ...segment, id: `${zone.id}-stack-b` },
    ];
    zone.segments = [...zone.completedSegments];
    zone.webSegments = [...zone.completedSegments];
    zone.activeLine = false;
    zone.linePhase = "waiting";
    zone.nextTickAt = sim.time + 0.01;
    target.x = sim.arenaBounds.x + 100;
    target.y = sim.arenaBounds.y + 200;
    const healthBefore = target.health;
    step(sim, 3);
    const ticks = sim.events.filter(({ type, targetId }) => (
        type === "classic-dot-tick" && targetId === target.id
    ));
    assert.equal(zone.activeDamageAreaCount, 2);
    assert.equal(ticks.length, 2);
    assert.deepEqual(ticks.map(({ stackedAreaCount }) => stackedAreaCount), [2, 2]);
    assert.equal(healthBefore - target.health, 4);
});

test("Reactor charge color, Virus contact stacking, and Charger teleport state are deterministic", () => {
    const reactorSim = createSimulation({ classes: ["reactor", "hydrogen-bomb"], seed: 1402 });
    const [reactor, reactorTarget] = reactorSim.fighters;
    reactor.stunUntil = reactorTarget.stunUntil = Infinity;
    reactor.vx = reactor.vy = reactorTarget.vx = reactorTarget.vy = 0;
    assert.equal(reactor.classicReactorColor, CLASSIC_ORBS.reactor.color, "Classic Reactor should start blue");
    step(reactorSim, 360);
    assert.ok(Math.abs(reactor.classicReactorCharge - 0.5) < 1e-9);
    assert.ok(Math.abs(reactor.classicReactorChargePercent - 50) < 1e-9);
    assert.notEqual(reactor.classicReactorColor, "#168cff");
    assert.notEqual(reactor.classicReactorColor, "#9de9ff");
    reactorTarget.x = reactor.x + reactor.radius * 4;
    reactorTarget.y = reactor.y;
    reactor.classicAbilityNextAt = reactorSim.time;
    const targetHealthBeforeBlast = reactorTarget.health;
    step(reactorSim);
    const blast = reactorSim.classicEntities.find(({ kind }) => kind === "reactor-blast");
    const reactorEvent = reactorSim.events.find(({ type }) => type === "classic-reactor-explosion");
    assert.ok(blast);
    assert.equal(blast.damage, 7);
    assert.equal(blast.damageAmount, 7);
    assert.equal(blast.damageRadius, blast.radius, "the live damage radius must stay synchronized with the visible circle");
    assert.equal(blast.maxRadius, Math.min(reactorSim.arenaBounds.width, reactorSim.arenaBounds.height) * 0.5);
    assert.equal(reactorTarget.health, targetHealthBeforeBlast, "the initial small visible circle should not hit a distant target");
    assert.equal(reactorEvent.audioFull, true);
    assert.equal(reactorEvent.audioMaxDuration, null);
    assert.deepEqual(reactorEvent.targetIds, []);
    step(reactorSim, 60);
    assert.equal(reactorTarget.health, targetHealthBeforeBlast - 7);
    assert.deepEqual(reactorEvent.targetIds, [reactorTarget.id]);
    assert.ok(reactorSim.events.some(({ type, targetId, radius, visualRadius }) => (
        type === "classic-reactor-blast-hit"
        && targetId === reactorTarget.id
        && radius === visualRadius
    )));

    const virusSim = createSimulation({ classes: ["virus", "hydrogen-bomb"], seed: 1403 });
    const [virus, virusTarget] = virusSim.fighters;
    virus.x = virusTarget.x = 400;
    virus.y = virusTarget.y = 400;
    virus.vx = virus.vy = virusTarget.vx = virusTarget.vy = 0;
    virus.stunUntil = virusTarget.stunUntil = Infinity;
    virusTarget.health = virusTarget.maxHealth = 1000;
    virusTarget.classicCoreHealth = virusTarget.classicCoreMaxHealth = 1000;
    step(virusSim);
    assert.equal(virusTarget.classicVirusStack, 1);
    assert.equal(virusTarget.classicVirusDamagePerSecond, 1);
    assert.equal(virusTarget.classicVirusZones.length, 1);
    assert.ok(virusTarget.classicVirusZones[0].arcRadians > 0);
    assert.ok(virusTarget.classicVirusZones[0].greenFraction > 0);
    const firstVirusCoverage = virusTarget.classicVirusGreenCoverage;
    const firstVirusArc = virusTarget.classicVirusGreenArcRadians;
    assert.ok(firstVirusCoverage > 0 && firstVirusCoverage < 1, "the first Virus contact should only partially cover the orb");
    assert.equal(virusTarget.classicVirusGreenSurface.active, true);
    assert.equal(virusTarget.classicVirusGreenSurface.zoneCount, 1);
    assert.equal(virusTarget.classicVirusGreenSurface.color, "#4fdb50");
    step(virusSim, 55);
    assert.equal(virusTarget.classicVirusStack, 2);
    assert.equal(virusTarget.classicVirusDamagePerSecond, 2);
    assert.equal(virusTarget.classicVirusZones.length, 2);
    assert.ok(virusTarget.classicVirusGreenCoverage > firstVirusCoverage, "a consecutive contact should spread green coverage");
    assert.ok(virusTarget.classicVirusGreenArcRadians > firstVirusArc, "a consecutive contact should widen the green surface arc");
    assert.equal(virusTarget.classicVirusGreenSurface.zoneCount, 2);
    assert.equal(virusTarget.classicVirusZones[1].greenCoverage, virusTarget.classicVirusGreenCoverage);
    assert.ok(virusTarget.classicVirusZones[0].arcRadians >= firstVirusArc);
    assert.deepEqual(
        virusSim.events.filter(({ type }) => type === "classic-virus-contact").map(({ stack, dps }) => ({ stack, dps })),
        [{ stack: 1, dps: 1 }, { stack: 2, dps: 2 }],
    );
    virusTarget.x = 780;
    virusTarget.y = 660;
    runSeconds(virusSim, 5.1);
    assert.equal(virusTarget.classicVirusStack, 0);
    assert.equal(virusTarget.classicVirusDamagePerSecond, 0);
    assert.equal(virusTarget.classicVirusGreenCoverage, 0);
    assert.equal(virusTarget.classicVirusGreenArcRadians, 0);
    assert.equal(virusTarget.classicVirusGreenSurface, null);
    assert.deepEqual(virusTarget.classicVirusZones, []);

    const chargerSim = createSimulation({ classes: ["charger", "hydrogen-bomb"], seed: 1404 });
    const [charger, chargerTarget] = chargerSim.fighters;
    charger.classicAbilityNextAt = 0;
    charger.stunUntil = chargerTarget.stunUntil = Infinity;
    charger.vx = charger.vy = chargerTarget.vx = chargerTarget.vy = 0;
    chargerTarget.health = chargerTarget.maxHealth = 1000;
    chargerTarget.classicCoreHealth = chargerTarget.classicCoreMaxHealth = 1000;
    step(chargerSim);
    const charge = chargerSim.classicEntities.find(({ kind }) => kind === "charger-charge");
    assert.ok(charge);
    assert.equal(charge.phase, "charging");
    assert.equal(charger.classicChargerPhase, "charging");
    assert.equal(charge.animation, "charge-teleport");
    step(chargerSim, 91);
    assert.ok(["teleporting", "complete"].includes(charge.phase));
    assert.ok(chargerSim.events.some(({ type, phase }) => type === "classic-charger-phase" && phase === "teleporting"));
    const teleport = chargerSim.events.find(({ type }) => type === "classic-charger-teleport");
    assert.ok(teleport);
    assert.equal(teleport.damageAmount, 5);
    assert.equal(teleport.healAmount, 0);
    assert.equal(teleport.netHealthDelta, -5);
    assert.equal(chargerTarget.health, 995);
});

test("Glass shards, Zeus nodes, and Frost trail ticks expose seeded render/state geometry", () => {
    const glassSim = createSimulation({ classes: ["glass-ball", "hydrogen-bomb"], seed: 1405 });
    forceWallBounce(glassSim, glassSim.fighters[0], "left");
    const shards = glassSim.classicEntities.filter(({ kind }) => kind === "glass-shard");
    assert.ok(shards.length >= 3 && shards.length <= 5);
    assert.ok(shards.every((shard) => (
        shard.shape === "sharp-polygon"
        && shard.translucent === true
        && shard.fillColor === "#ffffffaa"
        && shard.strokeColor === "#ffffffdd"
        && Number.isInteger(shard.glassFrame)
        && shard.glassFrame >= 0 && shard.glassFrame < 4
        && shard.points.length >= 3
        && shard.shardRadius < glassSim.fighters[0].radius * 0.2
        && shard.dispersed === true
        && shard.dispersionPhase === "flying"
        && shard.wallAttached === false
        && shard.stuckToWall === false
        && shard.wallStuck === false
        && shard.dispersionOrigin.x === shard.wallContact.x
        && shard.dispersionOrigin.y === shard.wallContact.y
        && Number.isFinite(shard.dispersionSpeed)
        && Number.isFinite(shard.vx)
        && Number.isFinite(shard.vy)
        && shard.damage === 2
        && shard.contactDamage === 2
        && shard.disappearOnContact === true
    )));
    assert.ok(new Set(shards.map(({ shapeIndex }) => shapeIndex)).size >= 2);
    assert.ok(glassSim.events.some(({ type, count }) => type === "classic-glass-shatter" && count === shards.length));
    step(glassSim, 100);
    assert.ok(shards.every(({ dispersionPhase }) => dispersionPhase === "settled"));
    const maxDispersionDistance = Math.max(...shards.map((shard) => (
        Math.hypot(
            shard.x - shard.dispersionOrigin.x,
            shard.y - shard.dispersionOrigin.y,
        )
    )));
    assert.ok(maxDispersionDistance < glassSim.fighters[0].radius * 2, "Glass should settle near its wall impact");
    assert.ok(maxDispersionDistance > shards[0].shardRadius, "Glass should still visibly disperse from its impact");
    assert.ok(shards.every(({ wallAttached, stuckToWall, wallStuck }) => (
        wallAttached === false && stuckToWall === false && wallStuck === false
    )));

    const firstZeus = createSimulation({ classes: ["zeus", "hydrogen-bomb"], seed: 1406 });
    const secondZeus = createSimulation({ classes: ["zeus", "hydrogen-bomb"], seed: 1406 });
    firstZeus.fighters[0].classicAbilityNextAt = 0;
    secondZeus.fighters[0].classicAbilityNextAt = 0;
    step(firstZeus);
    step(secondZeus);
    const firstLightning = firstZeus.classicEntities.find(({ kind }) => kind === "chain-lightning");
    const secondLightning = secondZeus.classicEntities.find(({ kind }) => kind === "chain-lightning");
    assert.equal(firstLightning.nodeCount, 3);
    assert.equal(firstLightning.nodes.length, 3);
    assert.equal(firstLightning.randomNodes, true);
    assert.equal(firstLightning.formation, "triangle");
    assert.equal(firstLightning.closed, true);
    assert.equal(firstLightning.tickInterval, 1);
    assert.equal(firstLightning.damagePerSecond, 10);
    assert.equal(firstLightning.damagePerTick, 10);
    assert.equal(firstLightning.throwDuration, 0.42);
    assert.equal(firstLightning.throwOriginX, firstZeus.fighters[0].x);
    assert.equal(firstLightning.throwOriginY, firstZeus.fighters[0].y);
    assert.ok(firstLightning.nodeRadius > firstZeus.fighters[0].radius);
    const triangleSides = firstLightning.nodes.map((node, index) => {
        const next = firstLightning.nodes[(index + 1) % firstLightning.nodes.length];
        return Math.hypot(next.x - node.x, next.y - node.y);
    });
    assert.ok(
        Math.max(...triangleSides) - Math.min(...triangleSides) < 1e-9,
        "Zeus nodes should always land as an equilateral triangle",
    );
    assert.deepEqual(firstLightning.nodes, secondLightning.nodes);
    assert.equal(
        firstZeus.events.filter(({ type }) => type === "classic-zeus-thunder").length,
        1,
        "Zeus should emit one long-thunder cue per three-node cast",
    );

    const frostSim = createSimulation({ classes: ["frost-ball", "hydrogen-bomb"], seed: 1407 });
    const [frost, frostTarget] = frostSim.fighters;
    frost.classicAbilityNextAt = 0;
    frost.vx = frost.vy = 0;
    frostTarget.stunUntil = Infinity;
    frostTarget.vx = frostTarget.vy = 0;
    frostTarget.health = frostTarget.maxHealth = 1000;
    frostTarget.classicCoreHealth = frostTarget.classicCoreMaxHealth = 1000;
    step(frostSim);
    const trail = frostSim.classicEntities.find(({ kind }) => kind === "frost-trail");
    assert.ok(trail);
    frostTarget.x = trail.x = 500;
    frostTarget.y = trail.y = 400;
    frostTarget.classicAbilityNextAt = frostSim.time + 2;
    step(frostSim);
    assert.equal(
        frostSim.events.filter(({ type }) => type === "classic-freeze").length,
        1,
        "Frost should emit one freeze cue when a target first enters the trail",
    );
    assert.equal(frostTarget.health, 997, "Frost should deal its flat damage when an orb enters the trail");
    assert.equal(frostTarget.classicFrostSlowFactor, 0.5);
    assert.equal(frostTarget.classicFrostCooldownScale, 2);
    assert.equal(frostTarget.classicAbilityNextAt, 4);
    assert.equal(frostTarget.classicFrostFrozen, true);
    assert.equal(frostTarget.vx, 0);
    assert.equal(frostTarget.vy, 0);
    runSeconds(frostSim, 1);
    const frostTicks = frostSim.events.filter(({ dotKind }) => dotKind === "frost-trail");
    const frostTick = frostTicks[0];
    assert.ok(frostTick);
    assert.equal(frostTick.amount, 3);
    assert.equal(frostTick.contact, true);
    assert.equal(frostTick.tickSeconds, 0);
    assert.equal(frostTicks.length, 1, "Frost should damage once per trail entry, not every frame");
    assert.equal(
        frostSim.events.filter(({ type }) => type === "classic-freeze").length,
        1,
        "Frost should not retrigger the freeze cue on every fixed step",
    );
    assert.equal(frostTarget.health, 997);
    runSeconds(frostSim, 3.2);
    assert.equal(trail.lifetimeState, "fading");
    assert.ok(trail.opacity < 1);
    assert.equal(frostTarget.classicFrostFrozen, false, "the freeze should release when the trail expires");
});

test("Glass shards deal two damage once on opponent contact and then disappear", () => {
    const sim = createSimulation({ classes: ["glass-ball", "hydrogen-bomb"], seed: 1408 });
    const [glass, target] = sim.fighters;
    forceWallBounce(sim, glass, "left");
    const shards = sim.classicEntities.filter(({ kind }) => kind === "glass-shard");
    assert.ok(shards.length >= 3 && shards.length <= 5);
    const hitShard = shards[0];
    // Keep the other deterministic shards away from the test target so this
    // verifies one contact transaction, not an accidental stacked collision.
    shards.slice(1).forEach((shard, index) => {
        shard.x = sim.arenaBounds.x + sim.arenaBounds.width - shard.radius * 3;
        shard.y = sim.arenaBounds.y + sim.arenaBounds.height - shard.radius * (3 + index);
    });
    hitShard.dispersionPhase = "settled";
    hitShard.vx = 0;
    hitShard.vy = 0;
    target.stunUntil = Infinity;
    target.vx = 0;
    target.vy = 0;
    target.x = hitShard.x;
    target.y = hitShard.y;
    target.health = target.maxHealth = 100;
    target.classicCoreHealth = target.classicCoreMaxHealth = 100;
    const healthBefore = target.health;
    step(sim);
    assert.equal(target.health, healthBefore - 2);
    assert.equal(sim.classicEntities.some(({ id }) => id === hitShard.id), false);
    assert.equal(sim.classicEntities.filter(({ kind }) => kind === "glass-shard").length, shards.length - 1);
    const hit = sim.events.find(({ type, entityId }) => (
        type === "classic-projectile-hit" && entityId === hitShard.id
    ));
    assert.ok(hit);
    assert.equal(hit.projectileKind, "glass-shard");
    assert.equal(hit.amount, 2);
    assert.equal(hit.damageAmount, 2);
    assert.equal(hit.healAmount, 0);
    assert.equal(hit.contactOnly, true);
    assert.equal(hit.disappearsOnContact, true);
    assert.equal(hit.disappeared, true);
    assert.deepEqual(hit.marker, { damage: -2, heal: 0 });
});

test("Cutter ticks every opposing fighter and summoned combatant inside its visible area", () => {
    const polygonCentroid = (polygon) => polygon.reduce(
        (center, point) => ({ x: center.x + point.x / polygon.length, y: center.y + point.y / polygon.length }),
        { x: 0, y: 0 },
    );

    const necromancerSim = createSimulation({ classes: ["cutter", "necromancer"], seed: 143 });
    const [necromancerCutter, necromancer] = necromancerSim.fighters;
    forceWallBounce(necromancerSim, necromancerCutter, "left", necromancerCutter.baselineSpeed * 0.7);
    necromancer.classicAbilityNextAt = 0;
    runSeconds(necromancerSim, 1.2);
    const necromancerMinion = necromancerSim.classicEntities.find(({ kind }) => kind === "necromancer-soldier");
    assert.ok(necromancerMinion, "Necromancer should have a live soldier for the Cutter area test");
    const necromancerZone = necromancerSim.classicEntities.find(({ kind }) => kind === "cutter-zone");
    const necromancerPoint = polygonCentroid(necromancerZone.zonePolygon);
    necromancerMinion.x = necromancerPoint.x;
    necromancerMinion.y = necromancerPoint.y;
    necromancerMinion.vx = necromancerMinion.vy = 0;
    necromancerMinion.nextShotAt = Infinity;
    necromancerMinion.health = necromancerMinion.maxHealth = 10;
    // Deliberately make the timer overdue. Cutter must process one current
    // tick and schedule the next one a full second ahead, never catch up a
    // backlog as a same-frame stack of -1 markers.
    necromancerZone.nextTickAt = necromancerSim.time - 5;
    const minionHealth = necromancerMinion.health;
    const ticksBeforeOverdueStep = necromancerSim.events.filter(({ type, dotKind, entityId }) => (
        type === "classic-dot-tick" && dotKind === "cutter-zone" && entityId === necromancerZone.id
    )).length;
    step(necromancerSim);
    assert.equal(necromancerMinion.health, minionHealth - 2, "Cutter should damage a Necromancer soldier with two-point ticks");
    const ticksAfterOverdueStep = necromancerSim.events.filter(({ type, dotKind, entityId }) => (
        type === "classic-dot-tick" && dotKind === "cutter-zone" && entityId === necromancerZone.id
    )).length;
    assert.equal(ticksAfterOverdueStep - ticksBeforeOverdueStep, 1, "an overdue Cutter timer must emit one tick, not a catch-up burst");
    assert.ok(necromancerZone.nextTickAt > necromancerSim.time, "Cutter should schedule its next tick one full second after the processed tick");
    assert.ok(necromancerSim.events.some(({ type, dotKind, targetId }) => (
        type === "classic-dot-tick" && dotKind === "cutter-zone" && targetId === necromancerMinion.id
    )));

    const duplicatorSim = createSimulation({ classes: ["cutter", "duplicator"], seed: 144 });
    const [duplicatorCutter, duplicator] = duplicatorSim.fighters;
    forceWallBounce(duplicatorSim, duplicatorCutter, "left", duplicatorCutter.baselineSpeed * 0.7);
    for (let bounce = 0; bounce < 10; bounce += 1) {
        forceWallBounce(
            duplicatorSim,
            duplicator,
            bounce % 2 === 0 ? "left" : "right",
            duplicator.baselineSpeed * (bounce % 2 === 0 ? 0.7 : -0.55),
        );
    }
    const duplicate = duplicatorSim.fighters.find(({ classicIsDuplicate }) => classicIsDuplicate === true);
    assert.ok(duplicate, "Duplicator should create a clone for the Cutter area test");
    const duplicateZone = duplicatorSim.classicEntities.find(({ kind }) => kind === "cutter-zone");
    const duplicatePoint = polygonCentroid(duplicateZone.zonePolygon);
    duplicate.x = duplicatePoint.x;
    duplicate.y = duplicatePoint.y;
    duplicate.vx = duplicate.vy = 0;
    duplicate.health = duplicate.maxHealth = 10;
    duplicateZone.nextTickAt = duplicatorSim.time;
    const duplicateHealth = duplicate.health;
    step(duplicatorSim);
    assert.equal(duplicate.health, duplicateHealth - 2, "Cutter should damage a Duplicator clone with two-point ticks");
    assert.ok(duplicatorSim.events.some(({ type, dotKind, targetId }) => (
        type === "classic-dot-tick" && dotKind === "cutter-zone" && targetId === duplicate.id
    )));
});

test("Cutter damages only the current smallest red polygon, never its connector line", () => {
    const polygonCentroid = (polygon) => polygon.reduce(
        (center, point) => ({ x: center.x + point.x / polygon.length, y: center.y + point.y / polygon.length }),
        { x: 0, y: 0 },
    );

    const insideSim = createSimulation({ classes: ["cutter", "hydrogen-bomb"], seed: 141 });
    const insideCutter = insideSim.fighters[0];
    forceWallBounce(insideSim, insideCutter, "left", insideCutter.baselineSpeed * 0.7);
    const insideZone = insideSim.classicEntities.find(({ kind }) => kind === "cutter-zone");
    const insidePoint = polygonCentroid(insideZone.zonePolygon);
    assert.equal(classicCutterZoneContainsPoint(insideZone, insidePoint.x, insidePoint.y), true);
    const insideTarget = insideSim.fighters[1];
    insideTarget.x = insidePoint.x;
    insideTarget.y = insidePoint.y;
    insideTarget.vx = insideTarget.vy = 0;
    insideTarget.stunUntil = insideSim.time + 1;
    insideZone.nextTickAt = insideSim.time;
    const insideHealth = insideTarget.health;
    step(insideSim);
    assert.ok(insideTarget.health < insideHealth, "a target inside the smallest red polygon should take Cutter damage");

    const lineSim = createSimulation({ classes: ["cutter", "hydrogen-bomb"], seed: 141 });
    const lineCutter = lineSim.fighters[0];
    forceWallBounce(lineSim, lineCutter, "left", lineCutter.baselineSpeed * 0.7);
    const lineZone = lineSim.classicEntities.find(({ kind }) => kind === "cutter-zone");
    const line = lineZone.activeSegment;
    const linePoint = { x: (line.x1 + line.x2) / 2, y: (line.y1 + line.y2) / 2 };
    assert.equal(classicCutterZoneContainsPoint(lineZone, linePoint.x, linePoint.y), false);
    const lineTarget = lineSim.fighters[1];
    lineTarget.x = linePoint.x;
    lineTarget.y = linePoint.y;
    lineTarget.vx = lineTarget.vy = 0;
    lineTarget.stunUntil = lineSim.time + 1;
    lineZone.nextTickAt = lineSim.time;
    const lineHealth = lineTarget.health;
    step(lineSim);
    assert.equal(lineTarget.health, lineHealth, "the red connector itself should not deal Cutter damage");
});

test("Cutter keeps the prior damage area ticking while the replacement line is drawn", () => {
    const polygonCentroid = (polygon) => polygon.reduce(
        (center, point) => ({ x: center.x + point.x / polygon.length, y: center.y + point.y / polygon.length }),
        { x: 0, y: 0 },
    );
    const polygonContains = (polygon, point) => classicCutterZoneContainsPoint({
        kind: "cutter-zone",
        activeLine: true,
        linePhase: "dragging",
        activeSegment: { id: "test-active" },
        zonePolygon: polygon,
    }, point.x, point.y);
    const sim = createSimulation({ classes: ["cutter", "hydrogen-bomb"], seed: 142 });
    const [cutter, target] = sim.fighters;
    target.maxHealth = target.health = 1000;
    target.classicCoreHealth = target.classicCoreMaxHealth = 1000;
    target.classicCollisionDamageEnabled = false;
    target.stunUntil = Infinity;

    forceWallBounce(sim, cutter, "left", cutter.baselineSpeed * 0.7);
    forceWallBounce(sim, cutter, "right", cutter.baselineSpeed * -0.55);
    const zone = sim.classicEntities.find(({ ownerId, kind }) => ownerId === cutter.id && kind === "cutter-zone");
    assert.equal(zone.linePhase, "waiting");
    const previousPolygon = zone.zonePolygon.map((point) => ({ ...point }));

    forceWallBounce(sim, cutter, "left", cutter.baselineSpeed * 0.62);
    assert.equal(zone.linePhase, "dragging");
    assert.equal(zone.activeLine, true);
    assert.ok(zone.previousZonePolygon.length >= 3);
    const previousCentroid = polygonCentroid(previousPolygon);
    const candidatePoints = [previousCentroid];
    for (const point of previousPolygon) {
        for (const centerWeight of [0.01, 0.03, 0.06, 0.1, 0.18, 0.28, 0.42, 0.6, 0.78]) {
            candidatePoints.push({
                x: point.x * (1 - centerWeight) + previousCentroid.x * centerWeight,
                y: point.y * (1 - centerWeight) + previousCentroid.y * centerWeight,
            });
        }
    }
    const contact = candidatePoints.find((point) => (
        polygonContains(previousPolygon, point) && !polygonContains(zone.zonePolygon, point)
    ));
    assert.ok(contact, "the retained prior area should expose a point outside the new unfinished area");
    target.x = contact.x;
    target.y = contact.y;
    target.vx = target.vy = 0;
    zone.nextTickAt = sim.time;
    const healthBefore = target.health;
    step(sim);

    const tick = sim.events.findLast(({ type, dotKind, entityId }) => (
        type === "classic-dot-tick" && dotKind === "cutter-zone" && entityId === zone.id
    ));
    assert.ok(tick, "the retained Cutter area should continue ticking during replacement-line drawing");
    assert.equal(tick.amount, 2);
    assert.equal(tick.damageAmount, 2);
    assert.equal(tick.tickSeconds, 0.5);
    assert.equal(tick.tickInterval, 0.5);
    assert.equal(tick.health, target.health);
    assert.equal(tick.targetHealth, target.health);
    assert.equal(tick.marker.damage, -2);
    assert.equal(target.health, healthBefore - 2);
});

test("Vampire latch drains and heals for five deterministic seconds", () => {
    const sim = createSimulation({ classes: ["vampire", "hydrogen-bomb"], seed: 21 });
    const [vampire, target] = sim.fighters;
    vampire.health = 99;
    vampire.x = target.x = 350;
    vampire.y = target.y = 350;
    vampire.vx = vampire.vy = target.vx = target.vy = 0;
    step(sim);
    vampire.x = 100;
    target.x = 600;
    runSeconds(sim, 5.05);
    assert.ok(Math.abs(target.health - 85) < 0.4, "Vampire damage comes from its directional latch rather than generic body contact");
    assert.ok(Math.abs(vampire.health - 114) < 0.4, "Vampire can overheal above its normal 100 HP cap");
    assert.equal(vampire.classicOverheal, 14);
    const ticks = sim.events.filter(({ type, dotKind }) => type === "classic-dot-tick" && dotKind === "vampire-latch");
    assert.equal(ticks.length, 5, "Vampire emits one HP tick per second across the five-second latch");
    assert.ok(ticks.every(({ amount, healAmount, tickInterval, tickSeconds, marker }) => (
        Math.abs(amount - 3) < 1e-9
        && Math.abs(healAmount - 3) < 1e-9
        && tickInterval === 1
        && tickSeconds === 1
        && marker.damage === -3
        && marker.heal === 3
    )));
});

test("Vampire teeth track only the nearest living opponent", () => {
    const sim = createSimulation({ classes: ["vampire", "necromancer"], seed: 211 });
    const [vampire, necromancer] = sim.fighters;
    const nearest = necromancer;
    vampire.x = 300;
    vampire.y = 300;
    vampire.vx = vampire.vy = 0;
    nearest.x = 384;
    nearest.y = 300;
    nearest.vx = nearest.vy = 0;
    const fartherMinion = {
        id: "test-necromancer-soldier",
        kind: "necromancer-soldier",
        type: "necromancer-soldier",
        name: "TEST MINION",
        ownerId: necromancer.id,
        classicTeamIndex: necromancer.classicTeamIndex,
        x: 405,
        y: 300,
        vx: 0,
        vy: 0,
        radius: 10,
        health: 1,
        maxHealth: 1,
        damage: 1,
        moveSpeed: 0,
        baselineSpeed: 0,
        physical: true,
        solid: true,
        collisionMode: "enemy-minion",
        tracking: false,
        nextShotAt: Infinity,
        shotInterval: 1,
        expiresAt: null,
        alive: true,
    };
    sim.classicEntities.push(fartherMinion);
    vampire.classicAbilityNextAt = Infinity;
    step(sim);
    assert.equal(vampire.classicLatchTargetId, nearest.id);
    assert.notEqual(vampire.classicLatchTargetId, fartherMinion.id);
});

test("Parasite applies two damage per second after attaching", () => {
    const sim = createSimulation({ classes: ["parasites", "hydrogen-bomb"], seed: 212 });
    const [parasites, target] = sim.fighters;
    parasites.classicAbilityNextAt = 0;
    target.stunUntil = Infinity;
    step(sim);
    const projectile = sim.classicEntities.find(({ ownerId, kind }) => ownerId === parasites.id && kind === "parasite");
    assert.ok(projectile);
    projectile.x = target.x;
    projectile.y = target.y;
    projectile.vx = projectile.vy = 0;
    step(sim);
    const dot = sim.classicDots.find(({ kind, targetId }) => kind === "parasite" && targetId === target.id);
    assert.ok(dot);
    assert.equal(dot.tickInterval, 1);
    const healthBefore = target.health;
    runSeconds(sim, 3.1);
    assert.ok(Math.abs(target.health - (healthBefore - 6)) < 1e-9);
    const ticks = sim.events.filter(({ type, dotKind, targetId }) => (
        type === "classic-dot-tick" && dotKind === "parasite" && targetId === target.id
    ));
    assert.equal(ticks.length, 3);
    assert.ok(ticks.every(({ amount, tickInterval, tickSeconds }) => amount === 2 && tickInterval === 1 && tickSeconds === 1));
});

test("Parasite attachments follow the host visually without steering or pushing it", () => {
    const sim = createSimulation({ classes: ["parasites", "hydrogen-bomb"], seed: 213 });
    const [parasites, target] = sim.fighters;
    parasites.classicAbilityNextAt = 0;
    target.stunUntil = Infinity;
    step(sim);
    const firstProjectile = sim.classicEntities.find(({ kind }) => kind === "parasite");
    assert.ok(firstProjectile);
    firstProjectile.x = target.x;
    firstProjectile.y = target.y;
    firstProjectile.vx = firstProjectile.vy = 0;
    step(sim);
    parasites.classicAbilityNextAt = sim.time;
    step(sim);
    const secondProjectile = sim.classicEntities.find(({ kind }) => kind === "parasite");
    assert.ok(secondProjectile);
    secondProjectile.x = target.x;
    secondProjectile.y = target.y;
    secondProjectile.vx = secondProjectile.vy = 0;
    step(sim);
    const carriers = sim.classicEntities.filter(({ kind }) => kind === "classic-parasite");
    assert.equal(carriers.length, 2, "each parasite hit should create a separate visible carrier");
    assert.ok(carriers.every(({ health, maxHealth, physical, solid, attachedTargetId, attached, latchState }) => (
        health === 5
        && maxHealth === 5
        && physical === true
        && solid === true
        && attachedTargetId === target.id
        && attached === true
        && latchState === "latched"
    )));
    target.stunUntil = 0;
    target.classicAbilityNextAt = Infinity;
    target.vx = target.baselineSpeed;
    target.vy = 0;
    const hostPositionBeforeMove = { x: target.x, y: target.y };
    assert.ok(carriers.every(({ movementCollision, collisionOnly, vx, vy }) => (
        movementCollision === false
        && collisionOnly === true
        && vx === 0
        && vy === 0
    )));
    step(sim, 60);
    assert.notDeepEqual({ x: target.x, y: target.y }, hostPositionBeforeMove, "the host orb must keep moving normally");
    assert.ok(carriers.every((carrier) => (
        Math.abs(carrier.x - (target.x + carrier.attachOffsetX)) < 1e-9
        && Math.abs(carrier.y - (target.y + carrier.attachOffsetY)) < 1e-9
    )), "each carrier must stay latched at its stored host offset");
    assert.equal(
        sim.events.some(({ type, objectBId }) => type === "classic-minion-physical-bounce" && carriers.some(({ id }) => id === objectBId)),
        false,
        "Parasite carriers must not push moving orbs",
    );
    assert.equal(new Set(sim.classicDots.filter(({ kind }) => kind === "parasite").map(({ carrierId }) => carrierId)).size, 2);
    const first = carriers[0];
    first.health = 1;
    const targetBullet = {
        kind: "pistol-ammo",
        ownerId: target.id,
        targetId: first.id,
        x: first.x,
        y: first.y,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 2,
        bounces: false,
        expiresAt: sim.time + 1,
    };
    sim.classicEntities.push(targetBullet);
    step(sim);
    assert.equal(first.alive, false, "an opposing orb projectile should be able to destroy a carrier");
    assert.equal(sim.classicDots.some(({ carrierId }) => carrierId === first.id), false);
});

test("Necromancer soldiers expose staged emergence progress for one second", () => {
    const sim = createSimulation({ classes: ["necromancer", "hydrogen-bomb"], seed: 214 });
    sim.fighters[0].classicAbilityNextAt = 0;
    runSeconds(sim, 1.01);
    const minion = sim.classicEntities.find(({ kind }) => kind === "necromancer-soldier");
    assert.ok(minion);
    assert.ok(minion.emergeProgress >= 0 && minion.emergeProgress < 0.2);
    assert.equal(minion.emergeStage, "half");
    runSeconds(sim, 0.45);
    assert.equal(minion.emergeStage, "three-quarters");
    runSeconds(sim, 0.6);
    assert.equal(minion.emergeProgress, 1);
    assert.equal(minion.emergeStage, "full");
});

test("Tracking entities aim at Snake's head and prioritize Duplicator/Necromancer before nearby secondary targets", () => {
    const snakeSim = createSimulation({ classes: ["hive-ball", "snake"], seed: 842 });
    const [hive, snake] = snakeSim.fighters;
    snake.x = snakeSim.arenaBounds.x + snakeSim.arenaBounds.width * 0.8;
    snake.y = snakeSim.arenaBounds.y + snakeSim.arenaBounds.height * 0.8;
    hive.classicAbilityNextAt = 0;
    step(snakeSim);
    const bee = snakeSim.classicEntities.find(({ ownerId, kind }) => ownerId === hive.id && kind === "bee");
    assert.ok(bee);
    assert.equal(bee.targetId, snake.id);
    assert.equal(bee.targetPart, "head");
    assert.equal(bee.targetPriority, "nearest-fighter");

    for (const priorityType of ["duplicator", "necromancer"]) {
        const sim = createSimulation({ classes: ["hive-ball", priorityType], seed: priorityType === "duplicator" ? 843 : 844 });
        const [tracker, priorityFighter] = sim.fighters;
        tracker.classicAbilityNextAt = 0;
        priorityFighter.x = sim.arenaBounds.x + sim.arenaBounds.width * 0.85;
        priorityFighter.y = sim.arenaBounds.y + sim.arenaBounds.height * 0.85;
        step(sim);
        const priorityBee = sim.classicEntities.find(({ ownerId, kind }) => ownerId === tracker.id && kind === "bee");
        assert.ok(priorityBee);
        assert.equal(priorityBee.targetId, priorityFighter.id, `${priorityType} should be a high-priority tracking target`);
        assert.equal(priorityBee.targetPriority, "priority-fighter");
    }

    const nearbySim = createSimulation({ classes: ["hive-ball", "necromancer"], seed: 845 });
    const [nearbyHive, nearbyNecromancer] = nearbySim.fighters;
    nearbyHive.classicAbilityNextAt = 0;
    nearbyNecromancer.x = nearbySim.arenaBounds.x + nearbySim.arenaBounds.width * 0.9;
    nearbyNecromancer.y = nearbySim.arenaBounds.y + nearbySim.arenaBounds.height * 0.9;
    step(nearbySim);
    const nearbyBee = nearbySim.classicEntities.find(({ ownerId, kind }) => ownerId === nearbyHive.id && kind === "bee");
    assert.ok(nearbyBee);
    const nearbyMinion = {
        id: "nearby-tracking-minion",
        kind: "necromancer-soldier",
        type: "necromancer-soldier",
        name: "NEARBY MINION",
        ownerId: nearbyNecromancer.id,
        classicTeamIndex: nearbyNecromancer.classicTeamIndex,
        x: nearbyBee.x,
        y: nearbyBee.y,
        vx: 0,
        vy: 0,
        radius: 10,
        health: 1,
        maxHealth: 1,
        damage: 0,
        moveSpeed: 0,
        baselineSpeed: 0,
        physical: true,
        solid: true,
        alive: true,
        nextShotAt: Infinity,
        expiresAt: null,
    };
    nearbySim.classicEntities.push(nearbyMinion);
    step(nearbySim);
    assert.equal(nearbyBee.targetId, nearbyMinion.id, "a touching minion may intercept a prioritized tracking target");
    assert.equal(nearbyBee.targetPart, "minion");
    assert.equal(nearbyBee.targetPriority, "nearby-secondary");
});

test("Hydrogen Bomb uses custom health and deterministically wins at 60 seconds", () => {
    const sim = createSimulation({
        classes: ["hydrogen-bomb", "turret"],
        classicHydrogenHealth: 1234,
        seed: 31,
    });
    const [hydrogen, target] = sim.fighters;
    assert.equal(hydrogen.maxHealth, 1234);
    // Start the fixed-step countdown before jumping the deterministic test
    // clock near its end; this mirrors the live match rather than creating a
    // late countdown at the 60-second boundary.
    step(sim);
    sim.time = 60 + STEP;
    step(sim);
    assert.equal(target.alive, false);
    assert.equal(sim.winner?.id, hydrogen.id);
    assert.ok(sim.events.some(({ type, countdownSeconds }) => type === "classic-hydrogen-bomb-countdown-start" && countdownSeconds === 60));
    assert.ok(sim.events.some(({ type }) => type === "classic-hydrogen-detonate"));
    assert.ok(sim.events.some(({ type, flashSeconds }) => type === "classic-hydrogen-bomb-flash-start" && flashSeconds === 4));
});

test("seeded projectile abilities and replay state are byte-for-byte deterministic", () => {
    const options = { classes: ["shotgun", "zeus"], seed: 7719, features: { replay: true } };
    const first = createSimulation(options);
    const second = createSimulation(options);
    runSeconds(first, 4);
    runSeconds(second, 4);
    assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second));
    assert.deepEqual(first.events, second.events);
    assert.ok(first.events.some(({ type }) => type === "classic-projectile-fired"));
    assert.ok(first.classicEntities.some(({ kind }) => kind === "chain-lightning"));
});

test("Trident sticks to a wall or orb for three seconds before returning, Hive waits for active bees, and Train rails persist", () => {
    const tridentSim = createSimulation({ classes: ["trident", "turret"], seed: 41 });
    tridentSim.fighters[0].classicAbilityNextAt = 0;
    step(tridentSim);
    const trident = tridentSim.classicEntities.find(({ kind }) => kind === "trident-ammo");
    assert.ok(trident);
    trident.x = tridentSim.arenaBounds.x + trident.radius - 1;
    trident.y = tridentSim.arenaBounds.y + tridentSim.arenaBounds.height * 0.5;
    trident.vx = -420;
    trident.vy = 0;
    step(tridentSim);
    assert.equal(trident.phase, "stuck-wall");
    assert.equal(trident.stuckSurface, "wall");
    assert.equal(trident.stickDuration, 3);
    assert.ok(Math.abs(trident.stickUntil - (tridentSim.time + 3)) < 1e-9);
    assert.equal(trident.stuckWallContact.side, "left");
    tridentSim.time = trident.stickUntil;
    step(tridentSim);
    assert.equal(trident.phase, "returning");

    const orbStickSim = createSimulation({ classes: ["trident", "turret"], seed: 411 });
    orbStickSim.fighters[0].classicAbilityNextAt = 0;
    step(orbStickSim);
    const orbTrident = orbStickSim.classicEntities.find(({ kind }) => kind === "trident-ammo");
    const orbTarget = orbStickSim.fighters[1];
    orbTrident.x = orbTarget.x;
    orbTrident.y = orbTarget.y;
    orbTrident.vx = orbTrident.vy = 0;
    step(orbStickSim);
    assert.equal(orbTrident.phase, "stuck-orb");
    assert.equal(orbTrident.stuckSurface, "orb");
    assert.equal(orbTrident.stuckTargetId, orbTarget.id);
    assert.equal(orbTrident.stickDuration, 3);

    const hiveSim = createSimulation({ classes: ["hive-ball", "turret"], seed: 42 });
    hiveSim.fighters[0].classicAbilityNextAt = 0;
    step(hiveSim);
    assert.equal(hiveSim.fighters[0].classicAbilityNextAt, Infinity);
    hiveSim.classicEntities.filter(({ kind }) => kind === "bee").forEach((bee) => { bee.expiresAt = hiveSim.time; });
    step(hiveSim);
    assert.ok(Number.isFinite(hiveSim.fighters[0].classicAbilityNextAt));

    const trainSim = createSimulation({ classes: ["train", "turret"], seed: 43 });
    const trainFighter = trainSim.fighters[0];
    for (let bounce = 0; bounce < 3; bounce += 1) forceWallBounce(trainSim, trainFighter, bounce % 2 ? "right" : "left");
    const train = trainSim.classicEntities.find(({ kind }) => kind === "train");
    const trainTrack = trainSim.classicEntities.find(({ kind }) => kind === "train-track");
    assert.ok(trainTrack);
    assert.equal(trainTrack.permanent, true);
    assert.ok(trainTrack.segments.length >= 1);
    train.expiresAt = trainSim.time;
    step(trainSim);
    assert.equal(trainSim.classicEntities.some(({ kind }) => kind === "train-track"), true);
});

test("Trapper constrains, Zeus bumps, and Commander drones maintain deterministic combat entities", () => {
    const trapperSim = createSimulation({ classes: ["trapper", "hydrogen-bomb"], seed: 51 });
    trapperSim.fighters[0].classicAbilityNextAt = 0;
    step(trapperSim);
    const traps = trapperSim.classicEntities.filter(({ kind }) => kind === "trap");
    assert.equal(traps.length, 3);
    assert.deepEqual(traps.map(({ lassoIndex }) => lassoIndex), [0, 1, 2]);
    assert.equal(new Set(traps.map(({ lassoGroupId }) => lassoGroupId)).size, 1);
    assert.deepEqual(traps.map(({ trapPhase }) => trapPhase), ["windup", "queued", "queued"]);
    assert.ok(Math.hypot(traps[0].anchorX - traps[1].anchorX, traps[0].anchorY - traps[1].anchorY) > traps[0].radius * 3.9, "random lasso circles should not intertwine");
    assert.ok(new Set(traps.map(({ throwAngle }) => Math.round(Number(throwAngle) * 100) / 100)).size >= 2, "lassos should use independent seeded random placements");
    assert.equal(traps.every(({ tracking }) => tracking !== true), true, "lassos should not track the opponent while being thrown");
    runSeconds(trapperSim, 0.8);
    const throwEvents = trapperSim.events.filter(({ type }) => type === "classic-trapper-throw");
    assert.equal(throwEvents.length, 3, "each independent lasso should announce its throw once");
    assert.deepEqual(throwEvents.map(({ lassoIndex }) => lassoIndex), [0, 1, 2]);
    const trap = traps[0];
    const trapped = trapperSim.fighters[1];
    assert.equal(trap.lassoCount, 3);
    assert.equal(trap.trapPhase, "deployed");
    assert.equal(trap.trapState, "loose");
    assert.equal(trap.anchorX, trap.x);
    assert.equal(trap.anchorY, trap.y);
    trapped.x = trap.x + trap.radius * 0.9;
    trapped.y = trap.y;
    const beforeDistance = Math.hypot(trapped.x - trap.x, trapped.y - trap.y);
    trap.nextTickAt = trapperSim.time;
    step(trapperSim);
    assert.ok(Math.hypot(trapped.x - trap.x, trapped.y - trap.y) < beforeDistance);
    assert.ok(trapped.health < trapped.maxHealth);
    assert.equal(trapped.health, trapped.maxHealth - 4);
    assert.equal(trap.trapState, "tightening");
    const caughtEvents = trapperSim.events.filter(({ type, entityId, targetId }) => (
        type === "classic-trapper-caught" && entityId === trap.id && targetId === trapped.id
    ));
    assert.equal(caughtEvents.length, 1, "a lasso should announce its first catch once");

    const zeusSim = createSimulation({ classes: ["zeus", "hydrogen-bomb"], seed: 52 });
    zeusSim.fighters[0].classicAbilityNextAt = 0;
    step(zeusSim);
    const lightning = zeusSim.classicEntities.find(({ kind }) => kind === "chain-lightning");
    const shocked = zeusSim.fighters[1];
    shocked.x = lightning.nodes[0].x;
    shocked.y = lightning.nodes[0].y;
    shocked.health = shocked.maxHealth = 1000;
    shocked.classicCoreHealth = shocked.classicCoreMaxHealth = 1000;
    shocked.classicCollisionDamageEnabled = false;
    shocked.vx = -shocked.baselineSpeed;
    shocked.vy = 0;
    lightning.nextTickAt = zeusSim.time;
    const healthBeforeLightning = shocked.health;
    step(zeusSim);
    const awayX = shocked.x - lightning.nodes[0].x;
    const awayY = shocked.y - lightning.nodes[0].y;
    assert.ok(shocked.vx * awayX + shocked.vy * awayY > 0, "a Zeus node acts as a physical bumper");
    assert.ok(shocked.classicZeusElectrifiedUntil > zeusSim.time, "Zeus damage should start a visible target flash");
    assert.equal(healthBeforeLightning - shocked.health, 10, "a Zeus lightning tick should deal exactly ten damage");
    assert.ok(zeusSim.events.some(({ type, targetId, marker }) => (
        type === "classic-dot-tick" && targetId === shocked.id && marker?.damage === -10
    )), "Zeus should expose its actual thunder damage marker");

    const commanderSim = createSimulation({ classes: ["commander", "hydrogen-bomb"], seed: 53 });
    step(commanderSim);
    const drones = commanderSim.classicEntities.filter(({ kind }) => kind.startsWith("commander-drone-"));
    assert.deepEqual(drones.map(({ damage }) => damage).sort((a, b) => a - b), [2, 5]);
    drones.forEach((drone) => { drone.nextShotAt = 0; });
    step(commanderSim);
    assert.deepEqual(
        commanderSim.events.filter(({ type, projectileKind }) => type === "classic-projectile-fired" && projectileKind === "commander-round").map(({ damage }) => damage).sort((a, b) => a - b),
        [2, 5],
    );
});

test("Cowboy traps expire seven seconds after deployment when they never snare", () => {
    const runUnsnaired = () => {
        const sim = createSimulation({ classes: ["trapper", "hydrogen-bomb"], seed: 9103 });
        const [cowboy, target] = sim.fighters;
        cowboy.classicAbilityNextAt = 0;
        cowboy.stunUntil = Infinity;
        target.stunUntil = Infinity;
        target.vx = 0;
        target.vy = 0;
        step(sim);
        cowboy.classicAbilityNextAt = Infinity;
        const traps = sim.classicEntities.filter(({ kind }) => kind === "trap");
        assert.equal(traps.length, 3);

        // Move the target to the safest deterministic corner after the seeded
        // anchors exist, so this test exercises timeout rather than capture.
        const corners = [
            { x: sim.arenaBounds.x + target.radius * 2, y: sim.arenaBounds.y + target.radius * 2 },
            { x: sim.arenaBounds.x + sim.arenaBounds.width - target.radius * 2, y: sim.arenaBounds.y + target.radius * 2 },
            { x: sim.arenaBounds.x + target.radius * 2, y: sim.arenaBounds.y + sim.arenaBounds.height - target.radius * 2 },
            { x: sim.arenaBounds.x + sim.arenaBounds.width - target.radius * 2, y: sim.arenaBounds.y + sim.arenaBounds.height - target.radius * 2 },
        ];
        const safest = corners.sort((a, b) => {
            const aDistance = Math.min(...traps.map((trap) => Math.hypot(a.x - trap.anchorX, a.y - trap.anchorY)));
            const bDistance = Math.min(...traps.map((trap) => Math.hypot(b.x - trap.anchorX, b.y - trap.anchorY)));
            return bDistance - aDistance;
        })[0];
        target.x = safest.x;
        target.y = safest.y;

        runSeconds(sim, 1.2);
        const deployed = sim.classicEntities.filter(({ kind }) => kind === "trap");
        assert.equal(deployed.length, 3);
        assert.ok(deployed.every(({ trapPhase, trapState }) => trapPhase === "deployed" && trapState === "loose"));
        assert.ok(deployed.every((trap) => Math.abs(trap.trapExpiresAt - trap.trapPlacedAt - 7) < 1e-9));
        assert.ok(deployed.every(({ trapTimeoutActive, trapTimeRemaining }) => trapTimeoutActive === true && trapTimeRemaining > 0));
        const deadlines = deployed.map(({ trapExpiresAt }) => trapExpiresAt);
        const earliestDeadline = Math.min(...deadlines);
        const latestDeadline = Math.max(...deadlines);
        while (sim.time < earliestDeadline - 0.02) step(sim);
        assert.equal(sim.classicEntities.filter(({ kind }) => kind === "trap").length, 3, "lassos remain during their seven-second deployed window");
        while (sim.time < latestDeadline + 2 * (1 / 120)) step(sim);
        assert.equal(sim.classicEntities.some(({ kind }) => kind === "trap"), false, "unsnaired lassos are removed after seven seconds in place");
        const expired = sim.events.filter(({ type }) => type === "classic-trapper-expired");
        assert.equal(expired.length, 3);
        assert.ok(expired.every(({ reason, timeoutSeconds }) => reason === "no-snare" && timeoutSeconds === 7));
        assert.deepEqual(expired.map(({ lassoIndex }) => lassoIndex), [0, 1, 2]);
        return captureReplayFrame(sim);
    };

    assert.deepEqual(runUnsnaired(), runUnsnaired(), "Cowboy timeout state must remain seeded and replay deterministic");
});

test("minions have combat HP and directional teeth/saws hit beyond body contact", () => {
    const minionSim = createSimulation({ classes: ["necromancer", "pistol"], seed: 61 });
    const [necromancer, pistol] = minionSim.fighters;
    necromancer.classicAbilityNextAt = 0;
    pistol.classicAbilityNextAt = 0;
    step(minionSim);
    assert.equal(minionSim.classicEntities.some(({ kind }) => kind === "necromancer-skull"), true);
    assert.equal(minionSim.classicEntities.some(({ kind }) => kind === "necromancer-soldier"), false);
    step(minionSim, 130);
    const minion = minionSim.classicEntities.find(({ kind }) => kind === "necromancer-soldier");
    assert.ok(minion);
    // Gun rounds now expire at the first wall instead of remaining available
    // for an arbitrary later assertion. Fire a fresh volley after the summon
    // animation so this test can still exercise minion damage directly.
    pistol.classicAbilityNextAt = minionSim.time;
    step(minionSim);
    const bullet = minionSim.classicEntities.find(({ kind }) => kind === "pistol-ammo");
    assert.ok(bullet);
    assert.equal(bullet.bounces, false);
    bullet.x = minion.x;
    bullet.y = minion.y;
    bullet.vx = bullet.vy = 0;
    step(minionSim);
    assert.equal(minionSim.classicEntities.some(({ id }) => id === minion.id), false);
    assert.ok(minionSim.events.some(({ type }) => type === "classic-minion-hit"));
    assert.ok(minionSim.events.some(({ type, entityId }) => (
        type === "classic-minion-defeated" && entityId === minion.id
    )));
    assert.equal(minionSim.events.some(({ type, targetId }) => (
        type === "knockout" && targetId === minion.id
    )), false);
    assert.equal(minionSim.effects.some(({ kind }) => kind === "knockout"), false);
    assert.ok(minionSim.effects.some(({ kind, entityId }) => (
        kind === "classic-destruction-burst" && entityId === minion.id
    )), "destroyed minion orbs should leave an orb-colored particle burst");

    const vampireSim = createSimulation({ classes: ["vampire", "hydrogen-bomb"], seed: 62 });
    const [vampire, victim] = vampireSim.fighters;
    vampire.x = 300;
    vampire.y = 300;
    victim.x = vampire.x + vampire.radius * 2.2;
    victim.y = vampire.y;
    vampire.classicAimAngle = 0;
    vampire.vx = vampire.vy = victim.vx = victim.vy = 0;
    step(vampireSim);
    assert.ok(vampireSim.classicDots.some(({ kind }) => kind === "vampire-latch"));

    const sawSim = createSimulation({ classes: ["sawball", "hydrogen-bomb"], seed: 63 });
    const [saw, sawTarget] = sawSim.fighters;
    saw.x = 300;
    saw.y = 300;
    const sawAngle = STEP * 5;
    sawTarget.x = saw.x + Math.cos(sawAngle) * saw.radius * 1.8;
    sawTarget.y = saw.y + Math.sin(sawAngle) * saw.radius * 1.8;
    saw.vx = saw.vy = sawTarget.vx = sawTarget.vy = 0;
    step(sawSim);
    assert.ok(sawTarget.health <= sawTarget.maxHealth - 5);
});

test("Artist and Necromancer summons are enemy combatants for guns, Vampire, Boxer, and Monster", () => {
    const artistGunSim = createSimulation({ classes: ["pistol", "artist"], seed: 631 });
    const [pistol, artist] = artistGunSim.fighters;
    artist.classicAbilityNextAt = 0;
    step(artistGunSim);
    const drawingAnimation = artistGunSim.classicEntities.find(({ ownerId, kind }) => (
        ownerId === artist.id && kind === "artist-drawing"
    ));
    assert.ok(drawingAnimation);
    runSeconds(artistGunSim, 1.6);
    const drawing = artistGunSim.classicEntities.find(({ ownerId, kind }) => (
        ownerId === artist.id && kind.startsWith("artist-")
    ));
    assert.ok(drawing);
    artist.classicAbilityNextAt = Infinity;
    pistol.classicAbilityNextAt = 0;
    step(artistGunSim);
    const artistBullet = artistGunSim.classicEntities.find(({ ownerId, kind }) => (
        ownerId === pistol.id && kind === "pistol-ammo"
    ));
    assert.ok(artistBullet);
    artistBullet.x = drawing.x;
    artistBullet.y = drawing.y;
    artistBullet.vx = artistBullet.vy = 0;
    step(artistGunSim);
    assert.equal(drawing.alive, false);
    assert.ok(artistGunSim.events.some(({ type, entityId }) => type === "classic-minion-hit" && entityId === drawing.id));
    assert.ok(artistGunSim.effects.some(({ kind, entityId }) => (
        kind === "classic-destruction-burst" && entityId === drawing.id
    )));

    for (const attackerType of ["boxer", "monster"]) {
        const sim = createSimulation({ classes: [attackerType, "necromancer"], seed: 632 });
        const [attacker, necromancer] = sim.fighters;
        necromancer.classicAbilityNextAt = 0;
        runSeconds(sim, 1.2);
        const minion = sim.classicEntities.find(({ kind }) => kind === "necromancer-soldier");
        assert.ok(minion);
        attacker.x = 200;
        attacker.y = 300;
        attacker.baselineSpeed = 1;
        attacker.vx = 1;
        attacker.vy = 0;
        necromancer.x = 700;
        necromancer.y = 600;
        minion.x = 300;
        minion.y = 300;
        minion.vx = minion.vy = 0;
        minion.moveSpeed = 0;
        minion.baselineSpeed = 1;
        attacker.classicAbilityNextAt = 0;
        step(sim);
        runSeconds(sim, 0.6);
        assert.ok(sim.events.some(({ type, targetId }) => type === "classic-punch-hit" && targetId === minion.id), attackerType);
        assert.equal(minion.alive, false, attackerType + " should be able to defeat a summoned enemy");
    }

    const vampireSim = createSimulation({ classes: ["vampire", "necromancer"], seed: 633 });
    const [vampire, necromancer] = vampireSim.fighters;
    necromancer.classicAbilityNextAt = 0;
    runSeconds(vampireSim, 1.2);
    const vampireTarget = vampireSim.classicEntities.find(({ kind }) => kind === "necromancer-soldier");
    assert.ok(vampireTarget);
    vampire.x = 200;
    vampire.y = 300;
    necromancer.x = 700;
    necromancer.y = 600;
    vampire.classicLatchPhase = "idle";
    vampire.classicLatchTargetId = null;
    vampire.classicAbilityTargetId = null;
    vampire.classicAbilityNextAt = Infinity;
    vampireTarget.x = vampire.x + vampire.radius + vampireTarget.radius + 1;
    vampireTarget.y = vampire.y;
    vampireTarget.vx = vampireTarget.vy = 0;
    vampireTarget.moveSpeed = 0;
    vampire.classicAimAngle = 0;
    step(vampireSim);
    assert.equal(vampire.classicLatchTargetId, vampireTarget.id);
    const vampireHealth = vampireTarget.health;
    // Vampire's configured DOT is one transaction per second; wait through
    // the first complete tick before asserting summoned-target damage.
    runSeconds(vampireSim, 1.1);
    assert.ok(vampireTarget.health < vampireHealth, "Vampire DOT should damage a summoned enemy");
    assert.ok(vampireSim.events.some(({ type, targetId }) => type === "classic-dot-tick" && targetId === vampireTarget.id));

    for (const targetType of ["shotgun", "vampire", "boxer", "monster"]) {
        const sim = createSimulation({ classes: ["necromancer", targetType], seed: 634 });
        const [necromancerTarget, target] = sim.fighters;
        necromancerTarget.classicAbilityNextAt = 0;
        target.classicAbilityNextAt = Infinity;
        target.stunUntil = Infinity;
        target.classicCollisionDamageEnabled = false;
        runSeconds(sim, 1.2);
        const minion = sim.classicEntities.find(({ kind }) => kind === "necromancer-soldier");
        assert.ok(minion);
        target.x = minion.x + 150;
        target.y = minion.y;
        target.vx = target.vy = 0;
        minion.x = target.x - 150;
        minion.y = target.y;
        minion.vx = minion.vy = 0;
        minion.moveSpeed = 0;
        minion.nextShotAt = sim.time;
        const healthBefore = target.health;
        runSeconds(sim, 0.8);
        const minionAttackHit = sim.events.some(({ type, targetId }) => (
            type === "classic-projectile-hit" && targetId === target.id
        ));
        if (targetType === "vampire") {
            assert.equal(minionAttackHit, false, "a latched Vampire target suppresses the other orb's minion shots");
            assert.equal(target.health, healthBefore, "a latched Vampire target cannot take counterattack damage");
        } else {
            assert.ok(minionAttackHit, "summoned minion should attack " + targetType);
            assert.ok(target.health < healthBefore, "summoned minion damage should remain observable");
        }
    }
});

test("Necromancer soldiers and Artist summons are solid bodies while remaining destroyable", () => {
    const cases = [
        { ownerType: "necromancer", summonKind: "necromancer-soldier", seed: 8401, seconds: 1.2 },
        { ownerType: "artist", summonKind: "artist-", seed: 8402, seconds: 1.6 },
    ];
    for (const { ownerType, summonKind, seed, seconds } of cases) {
        const sim = createSimulation({ classes: [ownerType, "hydrogen-bomb"], seed });
        const [owner, target] = sim.fighters;
        owner.classicAbilityNextAt = 0;
        runSeconds(sim, seconds);
        const minion = sim.classicEntities.find(({ ownerId, kind }) => (
            ownerId === owner.id && kind.startsWith(summonKind)
        ));
        assert.ok(minion, ownerType + " should expose its summoned physical entity");
        assert.equal(minion.physical, true);
        assert.equal(minion.solid, true);
        assert.equal(minion.collisionMode, "enemy-minion");
        owner.x = sim.arenaBounds.x + sim.arenaBounds.width - owner.radius - 12;
        owner.y = sim.arenaBounds.y + sim.arenaBounds.height - owner.radius - 12;
        owner.vx = owner.vy = 0;
        target.stunUntil = Infinity;
        target.vx = target.vy = 0;
        minion.vx = minion.vy = 0;
        minion.moveSpeed = 0;
        target.x = minion.x + minion.radius + target.radius - 1;
        target.y = minion.y;
        step(sim);
        assert.ok(sim.events.some(({ type, objectBId }) => (
            type === "classic-minion-physical-bounce" && objectBId === minion.id
        )));
        assert.ok(Math.hypot(target.x - minion.x, target.y - minion.y) >= target.radius + minion.radius - 1e-6);
        assert.equal(minion.alive, true);
        assert.equal(minion.health, minion.maxHealth);
    }
});

test("Sawball damages only through its two large deterministic saw discs", () => {
    const edgeSim = createSimulation({ classes: ["sawball", "hydrogen-bomb"], seed: 64 });
    const [saw, edgeTarget] = edgeSim.fighters;
    saw.x = 300;
    saw.y = 340;
    saw.stunUntil = Infinity;
    edgeTarget.stunUntil = Infinity;
    edgeTarget.x = 620;
    edgeTarget.y = 340;
    step(edgeSim);
    const disc = saw.classicSawballDiscs[0];
    assert.ok(disc.radius >= saw.radius * 1.5 && disc.radius <= saw.radius * 1.8);
    assert.ok(Math.abs(Math.hypot(disc.x - saw.x, disc.y - saw.y) - saw.radius * 2.6) < 1e-9);
    edgeTarget.radius = saw.radius * 0.2;
    const edgeDistance = disc.radius + edgeTarget.radius * 0.9;
    edgeTarget.x = disc.x + Math.cos(disc.angle) * edgeDistance;
    edgeTarget.y = disc.y + Math.sin(disc.angle) * edgeDistance;
    const edgeHealth = edgeTarget.health;
    step(edgeSim);
    assert.equal(edgeTarget.health, edgeHealth - 5, "contact at the visible outer saw edge must deal saw damage");
    assert.ok(edgeSim.events.some(({ type, surface, sawDiscIndex }) => type === "classic-projectile-hit" && surface === "saw-disc" && sawDiscIndex === 0));

    const betweenSim = createSimulation({ classes: ["sawball", "hydrogen-bomb"], seed: 65 });
    const [betweenSaw, betweenTarget] = betweenSim.fighters;
    betweenSaw.x = 330;
    betweenSaw.y = 340;
    betweenSaw.stunUntil = Infinity;
    betweenTarget.stunUntil = Infinity;
    betweenTarget.radius = betweenSaw.radius * 0.2;
    betweenTarget.x = betweenSaw.x;
    betweenTarget.y = betweenSaw.y;
    step(betweenSim);
    const betweenHealth = betweenTarget.health;
    step(betweenSim);
    assert.equal(betweenTarget.health, betweenHealth, "the gap between the two saw discs must not deal damage");
    assert.equal(betweenSim.events.some(({ type, surface }) => type === "classic-projectile-hit" && surface === "saw-disc"), false);

    const bodySim = createSimulation({
        classes: ["sawball", "hydrogen-bomb"],
        classicOrbOptions: { sawball: { collisionDamage: false } },
        seed: 66,
    });
    const [bodySaw, bodyTarget] = bodySim.fighters;
    bodySaw.x = 360;
    bodySaw.y = 340;
    bodySaw.stunUntil = Infinity;
    bodyTarget.stunUntil = Infinity;
    bodyTarget.x = 650;
    bodyTarget.y = 600;
    step(bodySim);
    const bodyDisc = bodySaw.classicSawballDiscs[0];
    bodyTarget.radius = bodySaw.radius;
    bodyTarget.x = bodySaw.x + Math.cos(bodyDisc.angle + Math.PI / 2) * bodySaw.radius * 1.7;
    bodyTarget.y = bodySaw.y + Math.sin(bodyDisc.angle + Math.PI / 2) * bodySaw.radius * 1.7;
    const bodyHealth = bodyTarget.health;
    step(bodySim);
    assert.equal(bodyTarget.health, bodyHealth, "body overlap alone must not shortcut saw damage when collision damage is disabled");
    assert.equal(bodySim.events.some(({ type, surface }) => type === "classic-projectile-hit" && surface === "saw-disc"), false);
});

test("Classic orbScale is the single five-profile size contract", () => {
    const profiles = Object.values(CLASSIC_ORB_SIZE_PROFILES);
    const regular = createSimulation({
        classes: ["sword", "hydrogen-bomb"],
        classicOrbOptions: { sword: { orbScale: 1 } },
    }).fighters[0];
    const regularWeapon = getWeaponSegment(regular);
    for (const profile of profiles) {
        const sim = createSimulation({
            classes: ["sword", "hydrogen-bomb"],
            classicOrbOptions: { sword: { orbScale: profile.scale } },
        });
        const fighter = sim.fighters[0];
        assert.equal(sim.classicOrbOptions.sword.orbScale, profile.scale);
        assert.equal(fighter.classicOrbSize, profile.id);
        assert.ok(Math.abs(fighter.radius - ORB_RADIUS * profile.scale) < 1e-9);
        assert.ok(Math.abs(fighter.classicOrbSizeScale - profile.scale) < 1e-9);
        assert.ok(Math.abs(fighter.baselineSpeed - regular.baselineSpeed) < 1e-9);
        assert.ok(Math.abs(getWeaponSegment(fighter).visualLength - regularWeapon.visualLength * profile.scale) < 1e-9);
    }
    const nearestProfile = createSimulation({
        classes: ["sword", "hydrogen-bomb"],
        classicOrbOptions: { sword: { orbScale: 1.24 } },
    });
    assert.equal(nearestProfile.classicOrbOptions.sword.orbScale, 1.25);
    const invalidProfile = createSimulation({
        classes: ["sword", "hydrogen-bomb"],
        classicOrbOptions: { sword: { orbScale: "not-a-scale" } },
    });
    assert.equal(invalidProfile.classicOrbOptions.sword.orbScale, 1);
});

test("Boxer is a physical orb and commits a stable full-distance punch", () => {
    const sim = createSimulation({ classes: ["boxer", "hydrogen-bomb"], seed: 71 });
    const [boxer, target] = sim.fighters;
    boxer.x = 220;
    boxer.y = 300;
    target.x = 450;
    target.y = 300;
    target.baselineSpeed = 37;
    target.vx = target.baselineSpeed;
    target.vy = 0;
    boxer.classicAbilityNextAt = 0;
    const before = { x: target.x, y: target.y, vx: target.vx, vy: target.vy };
    const boxerVelocity = { vx: boxer.vx, vy: boxer.vy };
    step(sim);
    assert.equal(boxer.classicPunchPhase, "retract");
    const initialPunchAngle = boxer.classicPunchAngle;
    const initialPunchReach = boxer.classicPunchReach;
    const launchGuard = boxer.classicPunchGloves.find(({ punchingHand }) => !punchingHand);
    const launchGuardLocal = launchGuard && [
        launchGuard.x1 - boxer.x,
        launchGuard.y1 - boxer.y,
        launchGuard.x2 - boxer.x,
        launchGuard.y2 - boxer.y,
    ];
    assert.ok(boxer.classicPunchReach > boxer.radius * 4, "a close-range punch should reserve a reach that crosses the visible gap");
    assert.ok(boxer.classicPunchReach <= boxer.radius * 5.2, "the punch reach should stay inside the short-range cap");
    assert.ok(
        boxer.classicPunchGloves.some(({ punchingHand, x2, x1 }) => punchingHand && Math.abs(x2 - x1) > boxer.radius * 0.4),
        "the active glove should expose a real world-space extension",
    );
    assert.equal(boxer.vx, boxerVelocity.vx);
    assert.equal(boxer.vy, boxerVelocity.vy);
    assert.ok(Math.abs(Math.hypot(boxer.vx, boxer.vy) - boxer.baselineSpeed) < 1e-9);
    assert.ok(Math.abs(target.x - (before.x + before.vx * STEP)) < 1e-9);
    assert.equal(target.y, before.y);
    assert.equal(target.vx, before.vx);
    assert.equal(target.vy, before.vy);
    assert.equal(target.health, target.maxHealth);
    target.y += 120;
    step(sim, 4);
    assert.equal(target.vx, before.vx, "Boxer pursuit must not alter the target velocity before impact");
    assert.equal(target.vy, before.vy, "Boxer pursuit must not alter the target velocity before impact");
    assert.equal(boxer.classicPunchAngle, initialPunchAngle, "a committed Boxer swing keeps its launch direction");
    assert.equal(boxer.classicPunchReach, initialPunchReach, "a committed Boxer swing keeps its full launch reach");
    const stableGuard = boxer.classicPunchGloves.find(({ punchingHand }) => !punchingHand);
    assert.deepEqual(
        [
            stableGuard.x1 - boxer.x,
            stableGuard.y1 - boxer.y,
            stableGuard.x2 - boxer.x,
            stableGuard.y2 - boxer.y,
        ],
        launchGuardLocal,
        "the non-punching glove must hold its local guard pose",
    );

    const physicalSim = createSimulation({ classes: ["boxer", "hydrogen-bomb"], seed: 711 });
    const [physicalBoxer, physicalTarget] = physicalSim.fighters;
    physicalBoxer.x = physicalTarget.x = 360;
    physicalBoxer.y = physicalTarget.y = 360;
    physicalBoxer.vx = physicalBoxer.vy = physicalTarget.vx = physicalTarget.vy = 0;
    step(physicalSim);
    assert.ok(
        Math.hypot(physicalTarget.x - physicalBoxer.x, physicalTarget.y - physicalBoxer.y)
            >= physicalBoxer.radius + physicalTarget.radius - 1e-7,
        "Boxer must not pass through an opposing orb",
    );
});

test("Monster uses the same physical, non-chasing punch physics as Boxer", () => {
    const sim = createSimulation({ classes: ["monster", "hydrogen-bomb"], seed: 7111 });
    const [monster, target] = sim.fighters;
    monster.x = 220;
    monster.y = 300;
    target.x = 450;
    target.y = 300;
    target.baselineSpeed = 37;
    target.vx = target.baselineSpeed;
    target.vy = 0;
    monster.classicAbilityNextAt = 0;
    const before = {
        monsterX: monster.x,
        monsterY: monster.y,
        monsterVx: monster.vx,
        monsterVy: monster.vy,
        targetX: target.x,
        targetY: target.y,
        targetVx: target.vx,
        targetVy: target.vy,
    };
    step(sim);
    assert.equal(monster.classicPunchPhase, "retract");
    assert.ok(["left", "right"].includes(monster.classicPunchHand));
    assert.ok(monster.classicPunchGloves.some(({ punchingHand }) => punchingHand));
    assert.ok(Math.abs(monster.vx - before.monsterVx) < 1e-9, "Monster must not steer toward the target");
    assert.ok(Math.abs(monster.vy - before.monsterVy) < 1e-9, "Monster must retain its own velocity heading");
    assert.ok(Math.abs(target.x - (before.targetX + before.targetVx * STEP)) < 1e-9);
    assert.equal(target.y, before.targetY);
    assert.equal(target.vx, before.targetVx);
    assert.equal(target.vy, before.targetVy);

    const physicalSim = createSimulation({ classes: ["monster", "hydrogen-bomb"], seed: 7112 });
    const [physicalMonster, physicalTarget] = physicalSim.fighters;
    physicalMonster.x = physicalTarget.x = 360;
    physicalMonster.y = physicalTarget.y = 360;
    physicalMonster.vx = physicalMonster.vy = physicalTarget.vx = physicalTarget.vy = 0;
    step(physicalSim);
    assert.ok(
        Math.hypot(physicalTarget.x - physicalMonster.x, physicalTarget.y - physicalMonster.y)
            >= physicalMonster.radius + physicalTarget.radius - 1e-7,
        "Monster must remain a solid physical orb like Boxer",
    );
});

test("Boxer and Monster trigger only inside punch range and use the nearest glove", () => {
    for (const type of ["boxer", "monster"]) {
        const sim = createSimulation({ classes: [type, "hydrogen-bomb"], seed: 7115 });
        const [puncher, target] = sim.fighters;
        puncher.x = 240;
        puncher.y = 360;
        target.x = 700;
        target.y = 180;
        puncher.vx = puncher.vy = target.vx = target.vy = 0;
        puncher.classicAbilityNextAt = 0;

        step(sim);
        assert.equal(puncher.classicPunchPhase, "idle", `${type} must not burn a punch while the orb is out of range`);
        assert.equal(puncher.classicAbilityUses, 0);
        assert.equal(puncher.classicAbilityNextAt, 0);

        const angle = Math.atan2(target.y - puncher.y, target.x - puncher.x);
        const forwardX = Math.cos(angle);
        const forwardY = Math.sin(angle);
        const closeDistance = puncher.classicPunchableRadius + target.radius - 8;
        target.x = puncher.x + forwardX * closeDistance;
        target.y = puncher.y + forwardY * closeDistance;
        step(sim);
        assert.equal(puncher.classicPunchPhase, "retract");
        assert.equal(puncher.classicPunchTargetId, target.id);
        assert.ok(Math.abs(puncher.classicPunchAngle - angle) < 1e-9);
        const handDistances = puncher.classicPunchGloves.map((glove) => ({
            hand: glove.hand,
            distance: Math.hypot(target.x - glove.x1, target.y - glove.y1),
        }));
        handDistances.sort((a, b) => a.distance - b.distance || a.hand.localeCompare(b.hand));
        assert.equal(puncher.classicPunchHand, handDistances[0].hand, `${type} must select the closer glove`);
        assert.equal(puncher.classicPunchGloves.filter(({ punchingHand }) => punchingHand).length, 1);

        // The stored glove endpoints are world-space and aim at the same
        // target direction, which keeps gameplay contact and the renderer's
        // flying-glove pose aligned.
        const activeGlove = puncher.classicPunchGloves.find(({ punchingHand }) => punchingHand);
        const endpointX = activeGlove.x2 - puncher.x;
        const endpointY = activeGlove.y2 - puncher.y;
        const endpointLength = Math.hypot(endpointX, endpointY);
        assert.ok(endpointLength > 0);
        const gloveX = activeGlove.x2 - activeGlove.x1;
        const gloveY = activeGlove.y2 - activeGlove.y1;
        const gloveLength = Math.hypot(gloveX, gloveY);
        assert.ok((gloveX * forwardX + gloveY * forwardY) / gloveLength > 0.999);
    }
});

test("Classic gun bullets disappear at the first wall instead of ricocheting", () => {
    const sim = createSimulation({ classes: ["pistol", "hydrogen-bomb"], seed: 7113 });
    const [pistol, target] = sim.fighters;
    pistol.classicAbilityNextAt = 0;
    step(sim);
    const bullets = sim.classicEntities.filter(({ kind }) => kind === "pistol-ammo");
    assert.equal(bullets.length, 1, "the first Pistol shot is fired before its short reload pause");
    assert.ok(bullets.every(({ bounces }) => bounces === false));
    const bullet = bullets[0];
    bullet.x = sim.arenaBounds.x + bullet.radius - 0.1;
    bullet.y = sim.arenaBounds.y + sim.arenaBounds.height * 0.5;
    bullet.vx = -100;
    bullet.vy = 0;
    const healthBefore = target.health;
    step(sim);
    assert.equal(sim.classicEntities.some(({ id }) => id === bullet.id), false);
    assert.equal(target.health, healthBefore, "a wall expiry must not turn into a target hit");
});

test("Classic rifle rounds ricochet off walls twice before expiring", () => {
    const sim = createSimulation({ classes: ["rifle", "hydrogen-bomb"], seed: 7114 });
    const [rifle] = sim.fighters;
    rifle.classicAbilityNextAt = 0;
    step(sim);
    const bullet = sim.classicEntities.find(({ kind }) => kind === "rifle-ammo");
    assert.ok(bullet);
    assert.equal(bullet.bounces, true);
    assert.equal(bullet.maxWallBounces, 2);
    assert.equal(bullet.wallBounces, 0);

    const left = sim.arenaBounds.x;
    const right = sim.arenaBounds.x + sim.arenaBounds.width;
    const midY = sim.arenaBounds.y + sim.arenaBounds.height * 0.5;
    bullet.x = left + bullet.radius - 0.1;
    bullet.y = midY;
    bullet.vx = -100;
    bullet.vy = 0;
    step(sim);
    assert.equal(bullet.wallBounces, 1);
    assert.ok(bullet.vx > 0, "the first wall contact reflects the rifle round");
    assert.ok(sim.classicEntities.some(({ id }) => id === bullet.id));

    bullet.x = right - bullet.radius + 0.1;
    bullet.y = midY;
    bullet.vx = 100;
    bullet.vy = 0;
    step(sim);
    assert.equal(bullet.wallBounces, 2);
    assert.ok(bullet.vx < 0, "the second wall contact reflects the rifle round");
    assert.ok(sim.classicEntities.some(({ id }) => id === bullet.id));

    bullet.x = left + bullet.radius - 0.1;
    bullet.y = midY;
    bullet.vx = -100;
    bullet.vy = 0;
    step(sim);
    assert.equal(sim.classicEntities.some(({ id }) => id === bullet.id), false, "the next wall contact expires the round after two ricochets");
    assert.equal(sim.events.filter(({ type, entityId }) => type === "classic-projectile-wall-bounce" && entityId === bullet.id).length, 3);
});

test("Boxer exposes delayed punch phases and deals ten damage on an armed two-fist punch", () => {
    const sim = createSimulation({ classes: ["boxer", "hydrogen-bomb"], seed: 72 });
    const [boxer, target] = sim.fighters;
    boxer.x = 300;
    boxer.y = 300;
    target.x = 500;
    target.y = 300;
    boxer.vx = boxer.baselineSpeed;
    boxer.vy = 0;
    target.baselineSpeed = 1;
    target.vx = 1;
    target.vy = 0;
    boxer.classicAbilityNextAt = 0;
    boxer.classicPunchLandedCount = 2;
    step(sim);
    const healthBeforePunch = target.health;
    assert.equal(boxer.classicPunchPhase, "retract");
    assert.equal(boxer.classicPunchDouble, true);
    assert.ok(["left", "right"].includes(boxer.classicPunchHand));
    assert.equal(boxer.classicPunchGloves.filter(({ punchingHand }) => punchingHand).length, 2);
    assert.equal(target.health, healthBeforePunch);
    step(sim, 12);
    assert.ok(["retract", "extend"].includes(boxer.classicPunchPhase));
    step(sim, 24);
    const firstImpactDamage = healthBeforePunch - target.health;
    assert.equal(boxer.classicPunchPhase, "impact");
    assert.equal(firstImpactDamage, 10, "both landed gloves should each deal their configured five damage");
    step(sim, 10);
    const settledImpactDamage = healthBeforePunch - target.health;
    assert.equal(settledImpactDamage, firstImpactDamage, "the same glove cannot damage again during one impact window");
    assert.equal(
        sim.events.filter(({ type, fighterId }) => type === "classic-punch-hit" && fighterId === boxer.id).length,
        2,
        "two visible glove contacts should emit two damage markers",
    );
    assert.equal(boxer.classicPunchGloves.filter(({ active }) => active).length, 0, "the glove hitbox closes after the impact window");
    assert.ok(sim.events.some(({ type, phase }) => type === "classic-boxer-phase" && phase === "recover"));
    assert.ok(sim.events.some(({ type }) => type === "classic-boxer-impact"));
    assert.ok(sim.events.some(({ type }) => type === "classic-punch-hit"));
});

test("Boxer arms a two-fist critical after every two successful punches", () => {
    const sim = createSimulation({ classes: ["boxer", "hydrogen-bomb"], seed: 728 });
    const [boxer, target] = sim.fighters;
    boxer.x = 300;
    boxer.y = 300;
    boxer.vx = boxer.vy = 0;
    boxer.baselineSpeed = 0;
    boxer.stunUntil = Infinity;
    boxer.classicCollisionDamageEnabled = false;
    target.x = 500;
    target.y = 300;
    target.vx = target.vy = 0;
    target.baselineSpeed = 0;
    target.classicAbilityNextAt = Infinity;
    target.classicCollisionDamageEnabled = false;
    target.health = target.maxHealth = 1000;
    target.classicCoreHealth = target.classicCoreMaxHealth = 1000;

    const completePunch = () => {
        const countBefore = boxer.classicPunchCount;
        sim.events.length = 0;
        boxer.classicAbilityNextAt = sim.time;
        for (let index = 0; index < 120; index += 1) {
            step(sim);
            if (boxer.classicPunchCount > countBefore && boxer.classicPunchPhase === "idle") break;
        }
        assert.equal(boxer.classicPunchCount, countBefore + 1, "the scheduled punch should complete");
        return {
            doublePunch: boxer.classicPunchDouble,
            hits: sim.events.filter(({ type, fighterId }) => type === "classic-punch-hit" && fighterId === boxer.id),
            criticals: sim.events.filter(({ type, fighterId }) => type === "classic-critical" && fighterId === boxer.id),
        };
    };

    const first = completePunch();
    assert.equal(first.doublePunch, false);
    assert.equal(first.hits.length, 1);
    assert.equal(target.health, 995);

    const second = completePunch();
    assert.equal(second.doublePunch, false);
    assert.equal(second.hits.length, 1);
    assert.equal(target.health, 990);

    const third = completePunch();
    assert.equal(third.doublePunch, true);
    assert.equal(third.hits.length, 2);
    assert.deepEqual(new Set(third.hits.map(({ hand }) => hand)), new Set(["left", "right"]));
    assert.equal(target.health, 980);
    assert.equal(third.criticals.length, 1);
    assert.equal(third.criticals[0].amount, 10);
    assert.equal(boxer.classicPunchLandedCount, 0);
});

test("Boxer can resolve two distinct nearby enemies with both gloves in one impact window", () => {
    const sim = createSimulation({ classes: ["boxer", "necromancer"], seed: 846 });
    const [boxer, necromancer] = sim.fighters;
    boxer.x = 400;
    boxer.y = 400;
    boxer.vx = boxer.vy = 0;
    boxer.stunUntil = Infinity;
    boxer.classicCollisionDamageEnabled = false;
    boxer.classicAbilityNextAt = 0;
    boxer.classicPunchLandedCount = 2;
    necromancer.x = 500;
    necromancer.y = 400;
    necromancer.vx = necromancer.vy = 0;
    necromancer.stunUntil = Infinity;
    necromancer.classicAbilityNextAt = Infinity;
    necromancer.classicCollisionDamageEnabled = false;
    necromancer.health = necromancer.maxHealth = 1000;
    necromancer.classicCoreHealth = necromancer.classicCoreMaxHealth = 1000;
    const minion = {
        id: "boxer-nearby-minion",
        kind: "necromancer-soldier",
        type: "necromancer-soldier",
        name: "BOXER TEST MINION",
        ownerId: necromancer.id,
        classicTeamIndex: necromancer.classicTeamIndex,
        x: 470,
        y: 420,
        vx: 0,
        vy: 0,
        radius: 10,
        health: 100,
        maxHealth: 100,
        damage: 0,
        moveSpeed: 0,
        baselineSpeed: 0,
        physical: true,
        solid: true,
        alive: true,
        nextShotAt: Infinity,
        expiresAt: null,
    };
    sim.classicEntities.push(minion);
    step(sim);
    const launchAngle = boxer.classicPunchAngle;
    const launchReach = boxer.classicPunchReach;
    step(sim, 10);
    assert.equal(boxer.classicPunchAngle, launchAngle);
    assert.equal(boxer.classicPunchReach, launchReach);
    step(sim, 25);
    const hits = sim.events.filter(({ type, fighterId }) => type === "classic-punch-hit" && fighterId === boxer.id);
    assert.equal(boxer.classicPunchPhase, "impact");
    assert.deepEqual(boxer.classicPunchActiveHands, ["left", "right"]);
    assert.ok(boxer.classicPunchGloves.every(({ hitWidth, radius }) => hitWidth > radius * 2));
    assert.ok(boxer.classicPunchGloves.every((glove) => (
        Math.abs(
            Math.hypot(glove.hitX2 - glove.hitX1, glove.hitY2 - glove.hitY1)
            - glove.visualLength
        ) < 1e-9
        && glove.hitWidth === glove.visualWidth
    )), "Boxer impact capsules must match the visible glove dimensions");
    const replayBoxer = captureReplayFrame(sim).fighters.find(({ id }) => id === boxer.id);
    assert.ok(replayBoxer.classicPunchGloves.every(({ hitX1, hitY1, hitX2, hitY2, hitWidth }) => (
        [hitX1, hitY1, hitX2, hitY2, hitWidth].every(Number.isFinite)
    )));
    assert.equal(hits.length, 2);
    assert.deepEqual(new Set(hits.map(({ targetId }) => targetId)), new Set([necromancer.id, minion.id]));
    assert.deepEqual(new Set(hits.map(({ hand }) => hand)), new Set(["left", "right"]));
    assert.equal(necromancer.health, 995);
    assert.equal(minion.health, 95);
});

test("Monster uses the exact Boxer punch cadence, reach, and single-hand selection", () => {
    const boxerAbility = CLASSIC_ORBS.boxer.classicAbility;
    const monsterAbility = CLASSIC_ORBS.monster.classicAbility;
    assert.deepEqual(monsterAbility, boxerAbility);
    for (const type of ["boxer", "monster"]) {
        const sim = createSimulation({ classes: [type, "hydrogen-bomb"], seed: 721 });
        const [attacker, target] = sim.fighters;
        attacker.x = 300;
        attacker.y = 300;
        target.x = 500;
        target.y = 300;
        attacker.vx = attacker.vy = target.vx = target.vy = 0;
        target.baselineSpeed = 0;
        attacker.classicAbilityNextAt = 0;
        step(sim);
        assert.equal(attacker.classicPunchPhase, "retract", type);
        assert.equal(
            Number((attacker.classicPunchPhaseUntil - attacker.classicPunchStartedAt).toFixed(6)),
            0.56,
            type + " should use Boxer's full phase duration",
        );
        assert.equal(attacker.classicPunchGloves.filter(({ punchingHand }) => punchingHand).length, 1, type);
        assert.ok(attacker.classicPunchReach > attacker.radius, type + " should expose the shared punch reach");
        step(sim, 70);
        assert.ok(sim.events.some(({ type: eventType, fighterId }) => (
            eventType === "classic-boxer-impact" && fighterId === attacker.id
        )), type + " should resolve the shared impact phase");
    }
});

test("Classic fighter destruction leaves the same colored particle burst as minions", () => {
    const sim = createSimulation({ classes: ["unarmed", "hydrogen-bomb"], seed: 722 });
    const [attacker, target] = sim.fighters;
    attacker.x = 300;
    attacker.y = 300;
    target.x = attacker.x + attacker.radius * 1.5;
    target.y = attacker.y;
    attacker.vx = attacker.vy = target.vx = target.vy = 0;
    target.health = 1;
    target.classicCoreHealth = 1;
    step(sim);
    assert.equal(target.alive, false);
    assert.ok(sim.effects.some(({ kind, entityId, color, secondaryColor }) => (
        kind === "classic-destruction-burst"
        && entityId === target.id
        && color
        && secondaryColor
    )));
});

test("Vampire latches through directional teeth while bodies remain visibly tangent", () => {
    const sim = createSimulation({ classes: ["vampire", "hydrogen-bomb"], seed: 73 });
    const [vampire, target] = sim.fighters;
    vampire.x = 300;
    vampire.y = 300;
    target.x = vampire.x + vampire.radius * 2.2;
    target.y = vampire.y;
    vampire.classicAimAngle = 0;
    vampire.vx = vampire.vy = target.vx = target.vy = 0;
    step(sim);
    assert.equal(vampire.classicLatchPhase, "latched");
    assert.equal(vampire.classicLatchTeeth.length, 3);
    assert.equal(vampire.classicLatchFangs.length, 2);
    const [aggregateBaseLeft, aggregateBaseRight, aggregateTip] = vampire.classicLatchTeeth;
    for (const base of [aggregateBaseLeft, aggregateBaseRight]) {
        assert.ok(
            Math.hypot(aggregateTip.x - vampire.x, aggregateTip.y - vampire.y)
                > Math.hypot(base.x - vampire.x, base.y - vampire.y),
            "the aggregate fang apex must face away from Vampire",
        );
    }
    for (const fang of vampire.classicLatchFangs) {
        const baseDistance = Math.hypot(fang.base.x - vampire.x, fang.base.y - vampire.y);
        const tipDistance = Math.hypot(fang.tip.x - vampire.x, fang.tip.y - vampire.y);
        const baseForward = (fang.base.x - vampire.x) * Math.cos(vampire.classicLatchAngle)
            + (fang.base.y - vampire.y) * Math.sin(vampire.classicLatchAngle);
        const tipForward = (fang.tip.x - vampire.x) * Math.cos(vampire.classicLatchAngle)
            + (fang.tip.y - vampire.y) * Math.sin(vampire.classicLatchAngle);
        assert.equal(fang.outward, true);
        assert.ok(tipDistance > baseDistance, "fang tips must point away from Vampire");
        assert.ok(tipForward > baseForward, "fang tips must extend along the aim direction");
        assert.equal(fang.embedded, true);
        assert.equal(fang.targetId, target.id);
        assert.ok(fang.visibleLength < Math.hypot(fang.fullX2 - fang.fullX1, fang.fullY2 - fang.fullY1) * 0.4);
        assert.ok(Math.abs(Math.hypot(fang.contactPoint.x - target.x, fang.contactPoint.y - target.y) - target.radius) < 1e-7);
        assert.ok(Math.hypot(fang.x2 - target.x, fang.y2 - target.y) < target.radius);
    }
    assert.ok(vampire.classicLatchTeethX > vampire.x);
    assert.ok(Math.abs(Math.hypot(target.x - vampire.x, target.y - vampire.y) - vampire.radius - target.radius) < 1e-7);
    const initialVampireX = vampire.x;
    const initialVampireY = vampire.y;
    const initialTargetY = target.y;
    const initialTargetWiggle = target.classicLatchWiggle;
    target.vx = 120;
    target.vy = 0;
    step(sim, 12);
    assert.notEqual(target.classicLatchWiggle, initialTargetWiggle, "the latched target should visibly wiggle during the hold");
    assert.equal(vampire.classicLatchWiggle, 0, "the target wiggles while Vampire follows");
    assert.equal(vampire.classicLatchFollowTargetId, target.id);
    assert.ok(vampire.x !== initialVampireX || vampire.y !== initialVampireY, "Vampire follows the moving leeched orb");
    assert.ok(Math.abs(target.y - vampire.y) > 0.25, "the latched orb should visibly wiggle around Vampire");
    assert.ok(Math.abs(vampire.y - initialVampireY) < 20, "Vampire should not be dragged toward the arena ceiling by the wiggle");
    assert.ok(Math.abs(target.y - initialTargetY) < 20, "the latched target should keep its normal lane while it wiggles");
    assert.ok(Math.abs(vampire.vx - target.vx) < 1e-9 && Math.abs(vampire.vy - target.vy) < 1e-9, "the latched pair shares the target's movement");
    assert.ok(Math.abs(Math.hypot(target.x - vampire.x, target.y - vampire.y) - vampire.radius - target.radius) < 1e-7);
    const replayVampire = captureReplayFrame(sim).fighters.find(({ id }) => id === vampire.id);
    assert.deepEqual(replayVampire.classicLatchFangs, vampire.classicLatchFangs);
    assert.equal(replayVampire.classicLatchBaseAngle, vampire.classicLatchBaseAngle);
    assert.equal(replayVampire.classicLatchFollowTargetId, target.id);
    assert.equal(replayVampire.classicLatchFollowDistance, vampire.classicLatchFollowDistance);
    assert.ok(sim.events.some(({ type, abilityKind }) => type === "classic-ability-start" && abilityKind === "vampire"));
    runSeconds(sim, 5.1);
    assert.equal(vampire.classicLatchPhase, "idle");
    assert.equal(vampire.classicLatchTargetId, null);
    const release = sim.events.findLast(({ type, reason }) => type === "classic-vampire-release" && reason === "duration-complete");
    assert.ok(release);
    assert.equal(release.launched, true);
    assert.ok(release.launchSpeed > 0);
    assert.ok(
        release.launchSpeed * Math.cos(release.launchAngle) * Math.cos(release.launchAngle)
          + release.launchSpeed * Math.sin(release.launchAngle) * Math.sin(release.launchAngle) > 0,
        "release event records the outward launch before later wall physics",
    );
    assert.equal(target.classicLatchReleaseAngle, release.launchAngle);
    assert.equal(target.classicLatchReleaseSpeed, release.launchSpeed);
});

test("Vampire release throws the latched orb away without copying the throw velocity to Vampire", () => {
    const sim = createSimulation({ classes: ["vampire", "hydrogen-bomb"], seed: 733 });
    const [vampire, target] = sim.fighters;
    vampire.x = 300;
    vampire.y = 300;
    target.x = vampire.x + vampire.radius + target.radius;
    target.y = vampire.y;
    vampire.vx = target.vx = 0;
    vampire.vy = target.vy = vampire.baselineSpeed;
    vampire.classicAbilityNextAt = 100;
    vampire.classicLatchPhase = "latched";
    vampire.classicLatchTargetId = target.id;
    vampire.classicLatchStartedAt = sim.time;
    vampire.classicLatchUntil = sim.time + STEP * 0.5;
    vampire.classicLatchAngle = 0;
    vampire.classicLatchBaseAngle = 0;
    vampire.classicLatchLastTargetBaseX = target.x;
    vampire.classicLatchLastTargetBaseY = target.y;
    target.classicLatchWiggleOffsetX = 0;
    target.classicLatchWiggleOffsetY = 0;

    step(sim);

    const release = sim.events.findLast(({ type }) => type === "classic-vampire-release");
    assert.ok(release);
    assert.equal(release.reason, "duration-complete");
    assert.equal(release.launched, true);
    const awayX = target.x - vampire.x;
    const awayY = target.y - vampire.y;
    const awayDistance = Math.hypot(awayX, awayY);
    const targetSpeed = Math.hypot(target.vx, target.vy);
    assert.ok(awayDistance > 0);
    assert.ok(
        (target.vx * awayX + target.vy * awayY) / (targetSpeed * awayDistance) > 0.99,
        "the target must launch along the live direction away from Vampire",
    );
    assert.ok(Math.abs(vampire.vx) < 1e-9, "Vampire keeps its pre-release vertical motion");
    assert.ok(vampire.vy > 0, "Vampire must not inherit the target's horizontal throw");
    assert.ok(target.vx > 0, "the target separates horizontally from Vampire");
    assert.equal(target.classicLatchReleaseAngle, release.launchAngle);
    assert.ok(Math.abs(target.classicLatchReleaseSpeed - target.baselineSpeed) < 1e-9);
});

test("Vampire latch keeps both bodies wall-aware and suppresses the latched orb's attack", () => {
    const wallSim = createSimulation({ classes: ["vampire", "hydrogen-bomb"], seed: 731 });
    const [vampire, target] = wallSim.fighters;
    const bounds = wallSim.arenaBounds;
    const separation = vampire.radius + target.radius;
    vampire.x = bounds.x + vampire.radius;
    vampire.y = bounds.y + bounds.height * 0.5;
    target.x = vampire.x + separation;
    target.y = vampire.y;
    vampire.vx = target.vx = -vampire.baselineSpeed;
    vampire.vy = target.vy = 0;
    vampire.classicLatchPhase = "latched";
    vampire.classicLatchTargetId = target.id;
    vampire.classicLatchStartedAt = wallSim.time;
    vampire.classicLatchUntil = wallSim.time + 2;
    vampire.classicLatchAngle = 0;
    vampire.classicLatchBaseAngle = 0;
    vampire.classicLatchLastTargetBaseX = target.x;
    vampire.classicLatchLastTargetBaseY = target.y;
    target.classicLatchWiggleOffsetX = 0;
    target.classicLatchWiggleOffsetY = 0;
    step(wallSim);
    assert.equal(vampire.classicLatchWallBounceCount, 1);
    assert.equal(vampire.classicLatchLastWallSide, "left");
    assert.ok(vampire.vx > 0 && target.vx > 0, "the attached pair should rebound from the wall");
    assert.ok(vampire.x >= bounds.x + vampire.radius && target.x >= bounds.x + target.radius);
    assert.equal(
        wallSim.events.filter(({ type, time }) => type === "classic-vampire-latch-wall-bounce" && time === wallSim.time).length,
        1,
    );

    for (const targetType of ["shotgun", "boxer"]) {
        const attackSim = createSimulation({ classes: ["vampire", targetType], seed: 732 });
        const [attacker, latchedTarget] = attackSim.fighters;
        attacker.x = 300;
        attacker.y = 300;
        latchedTarget.x = attacker.x + attacker.radius * 2.2;
        latchedTarget.y = attacker.y;
        attacker.vx = attacker.vy = latchedTarget.vx = latchedTarget.vy = 0;
        latchedTarget.classicAbilityNextAt = 0;
        step(attackSim);
        assert.equal(attacker.classicLatchTargetId, latchedTarget.id);
        const vampireHealth = attacker.health;
        runSeconds(attackSim, 0.7);
        assert.equal(latchedTarget.classicVampireLatchAttackSuppressed, true);
        assert.equal(attacker.health, vampireHealth, `${targetType} cannot damage Vampire while latched`);
        if (targetType === "shotgun") {
            assert.equal(latchedTarget.classicGunPhase, "ready");
            assert.equal(
                attackSim.events.some(({ type, fighterId }) => type === "classic-gun-fire" && fighterId === latchedTarget.id),
                false,
            );
            assert.equal(
                attackSim.classicEntities.some(({ ownerId, kind }) => ownerId === latchedTarget.id && kind.endsWith("-ammo")),
                false,
            );
        } else {
            assert.equal(latchedTarget.classicPunchPhase, "idle");
            assert.equal(
                attackSim.events.some(({ type, fighterId }) => type === "classic-punch-hit" && fighterId === latchedTarget.id),
                false,
            );
        }
    }
});

test("Vampire latch preserves wall-ball paths and does not pause target ability clocks", () => {
    const lazerSim = createSimulation({ classes: ["vampire", "lazer"], seed: 903 });
    const [lazerVampire, lazer] = lazerSim.fighters;
    setVampireLatch(lazerSim, lazerVampire, lazer);
    forceWallBounce(lazerSim, lazer, "left", lazer.baselineSpeed * 0.6);
    const line = lazerSim.classicEntities.find(({ ownerId, kind }) => ownerId === lazer.id && kind === "laser");
    assert.ok(line, "Lazer should create its line while the orb is latched");
    const lineId = line.id;
    forceWallBounce(lazerSim, lazer, "right", -lazer.baselineSpeed * 0.6);
    const retainedLine = lazerSim.classicEntities.find(({ ownerId, kind }) => ownerId === lazer.id && kind === "laser");
    assert.ok(retainedLine, "the latched Lazer path should remain present after another wall contact");
    assert.equal(retainedLine.id, lineId);
    assert.equal(retainedLine.lineVersion, 2);
    assert.equal(retainedLine.latchSuppressed, true);
    assert.equal(
        lazerSim.events.some(({ type, targetId }) => type === "classic-laser-pass" && targetId === lazerVampire.id),
        false,
        "a retained wall line must not damage Vampire during the latch",
    );

    const turretSim = createSimulation({ classes: ["vampire", "turret"], seed: 904 });
    const [turretVampire, turret] = turretSim.fighters;
    setVampireLatch(turretSim, turretVampire, turret);
    turret.classicTurretNextSpawnAt = STEP;
    turret.classicAbilityNextAt = STEP;
    step(turretSim);
    const turretBall = turretSim.classicEntities.find(({ ownerId, kind }) => ownerId === turret.id && kind === "turret");
    assert.ok(turretBall, "Turret deployment should continue while its orb is latched");
    assert.equal(turret.classicTurretSpawnCount, 1);
    runSeconds(turretSim, 1.2);
    assert.ok(turretBall.nextShotAt > turretSim.time, "Turret's shot cooldown should advance while Vampire suppresses its attack");
    assert.equal(
        turretSim.events.some(({ type, fighterId }) => type === "classic-projectile-fired" && fighterId === turret.id),
        false,
        "a latched Turret cannot fire at Vampire",
    );
    assert.equal(turretVampire.health, turretVampire.maxHealth);
});

test("Snake tail grows from an oval on every bounce and reaches full circles progressively", () => {
    const sim = createSimulation({ classes: ["snake", "hydrogen-bomb"], seed: 74 });
    const snake = sim.fighters[0];
    const initialGrowth = snake.classicSnakeTailGrowth;
    forceWallBounce(sim, snake, "left");
    const firstGrowth = snake.classicSnakeTailGrowth;
    forceWallBounce(sim, snake, "right");
    const secondGrowth = snake.classicSnakeTailGrowth;
    forceWallBounce(sim, snake, "left");
    assert.ok(firstGrowth > initialGrowth);
    assert.ok(secondGrowth > firstGrowth);
    assert.equal(snake.classicSnakeTailSegments, 2, "segment count still expands every third bounce");
    assert.ok(snake.classicSnakeTailGrowth < 1, "the tail should not jump straight to full circles");
});

test("Snake deals three damage only from the closest touching head/tail part", () => {
    const sim = createSimulation({ classes: ["snake", "unarmed"], seed: 841 });
    const [snake, target] = sim.fighters;
    snake.x = 500;
    snake.y = 400;
    snake.vx = 100;
    snake.vy = 0;
    snake.stunUntil = Infinity;
    snake.classicSnakeTailSegments = 3;
    snake.classicSnakeTailGrowth = 0.16;
    snake.classicCollisionDamageEnabled = false;
    const snakeHealthBefore = snake.health;
    target.x = snake.x - snake.radius * 1.15 * 2;
    target.y = snake.y;
    target.vx = target.vy = 0;
    target.stunUntil = Infinity;
    target.classicCollisionDamageEnabled = true;
    target.health = target.maxHealth = 1000;
    target.classicCoreHealth = target.classicCoreMaxHealth = 1000;
    step(sim);
    const hits = sim.events.filter(({ projectileKind, fighterId }) => (
        projectileKind === "snake-tail" && fighterId === snake.id
    ));
    assert.equal(hits.length, 1, "overlapping tail segments must resolve as one contact");
    assert.equal(hits[0].tailContactOnly, true);
    assert.equal(hits[0].contactPart, "tail");
    assert.equal(hits[0].segmentIndex, 1, "the closest overlapping segment should own the hit");
    assert.equal(hits[0].amount, 3);
    assert.equal(target.health, 997);
    assert.equal(snake.health, snakeHealthBefore, "hitting a tail segment must not damage the snake body");
    const renderedPart = snake.classicSnakeTailParts.find(({ index }) => index === 1);
    assert.ok(renderedPart);
    assert.deepEqual(snake.classicSnakeTailContact, {
        targetId: target.id,
        segmentIndex: 1,
        x: renderedPart.x,
        y: renderedPart.y,
        at: sim.time,
    });
    assert.equal(snake.classicSnakeContact.partKind, "tail");
});

test("Snake head contact is a separate three-damage part and does not double-count the tail", () => {
    const sim = createSimulation({ classes: ["snake", "hydrogen-bomb"], seed: 8421 });
    const [snake, target] = sim.fighters;
    snake.x = target.x = 360;
    snake.y = target.y = 360;
    snake.vx = snake.vy = target.vx = target.vy = 0;
    snake.stunUntil = target.stunUntil = Infinity;
    snake.classicSnakeTailSegments = 2;
    snake.classicSnakeTailGrowth = 0.16;
    target.health = target.maxHealth = 1000;
    target.classicCoreHealth = target.classicCoreMaxHealth = 1000;
    target.classicCollisionDamageEnabled = false;
    step(sim);
    const headHit = sim.events.find(({ type, projectileKind, fighterId }) => (
        type === "classic-projectile-hit"
        && projectileKind === "snake-head"
        && fighterId === snake.id
    ));
    assert.ok(headHit);
    assert.equal(headHit.amount, 3);
    assert.equal(headHit.headContactOnly, true);
    assert.equal(target.health, 997);
    assert.equal(snake.classicSnakeContact.partKind, "head");
    assert.equal(sim.events.some(({ projectileKind }) => projectileKind === "snake-tail"), false);
});

test("Classic persistent hazards use one-second damage ticks and coherent markers", () => {
    const cases = [
        { type: "cobwebs", kind: "cobweb", dps: 1, tickInterval: 1 },
        { type: "tripwire", kind: "tripwire", dps: 1, tickInterval: 1 },
        { type: "cutter", kind: "cutter-zone", dps: 4, tickInterval: 0.5 },
    ];
    for (const { type, kind, dps, tickInterval } of cases) {
        const sim = createSimulation({ classes: [type, "hydrogen-bomb"], seed: 8400 + cases.findIndex((entry) => entry.type === type) });
        const [attacker, target] = sim.fighters;
        target.maxHealth = target.health = 1000;
        target.classicCoreHealth = target.classicCoreMaxHealth = 1000;
        target.classicCollisionDamageEnabled = false;
        target.stunUntil = Infinity;
        forceWallBounce(sim, attacker, "left", attacker.baselineSpeed * 0.65);
        const hazard = sim.classicEntities.find(({ ownerId, kind: entityKind }) => ownerId === attacker.id && entityKind === kind);
        assert.ok(hazard, `${type} should expose its persistent hazard entity`);
        const contact = type === "cutter"
            ? hazard.zonePolygon.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 })
            : {
                x: (hazard.segments[0].x1 + hazard.segments[0].x2) * 0.5,
                y: (hazard.segments[0].y1 + hazard.segments[0].y2) * 0.5,
            };
        if (type === "cutter") {
            contact.x /= hazard.zonePolygon.length;
            contact.y /= hazard.zonePolygon.length;
        }
        target.x = contact.x;
        target.y = contact.y;
        hazard.nextTickAt = sim.time + tickInterval;
        const healthBefore = target.health;
        step(sim, Math.ceil(tickInterval / STEP) + 1);
        const ticks = sim.events.filter(({ type: eventType, dotKind, entityId }) => (
            eventType === "classic-dot-tick" && dotKind === kind && entityId === hazard.id
        ));
        assert.equal(ticks.length, 1, `${type} should emit exactly one tick during one tick interval of contact`);
        assert.equal(ticks[0].tickSeconds, tickInterval);
        assert.equal(ticks[0].tickInterval, tickInterval);
        assert.equal(ticks[0].amount, dps * tickInterval);
        assert.equal(ticks[0].marker.damage, -dps * tickInterval);
    assert.equal(target.health, healthBefore - dps * tickInterval);
    }

    const cobwebCatchupSim = createSimulation({ classes: ["cobwebs", "hydrogen-bomb"], seed: 8404 });
    const [cobwebOwner, cobwebTarget] = cobwebCatchupSim.fighters;
    forceWallBounce(cobwebCatchupSim, cobwebOwner, "left", cobwebOwner.baselineSpeed * 0.65);
    const cobwebHazard = cobwebCatchupSim.classicEntities.find(({ kind }) => kind === "cobweb");
    cobwebTarget.x = (cobwebHazard.segments[0].x1 + cobwebHazard.segments[0].x2) * 0.5;
    cobwebTarget.y = (cobwebHazard.segments[0].y1 + cobwebHazard.segments[0].y2) * 0.5;
    cobwebTarget.vx = cobwebTarget.vy = 0;
    cobwebHazard.nextTickAt = cobwebCatchupSim.time - 5;
    const cobwebHealthBefore = cobwebTarget.health;
    step(cobwebCatchupSim);
    const cobwebTicks = cobwebCatchupSim.events.filter(({ type: eventType, dotKind, entityId }) => (
        eventType === "classic-dot-tick" && dotKind === "cobweb" && entityId === cobwebHazard.id
    ));
    assert.equal(cobwebTicks.length, 1, "Cobweb should emit one tick even when its clock is overdue");
    assert.ok(cobwebHazard.nextTickAt > cobwebCatchupSim.time, "Cobweb should reset to a full next interval");
    assert.equal(cobwebTarget.health, cobwebHealthBefore - 1);

    const blueSunSim = createSimulation({ classes: ["blue-sun", "hydrogen-bomb"], seed: 8403 });
    const [blueSun, blueSunTarget] = blueSunSim.fighters;
    blueSunTarget.maxHealth = blueSunTarget.health = 1000;
    blueSunTarget.classicCoreHealth = blueSunTarget.classicCoreMaxHealth = 1000;
    blueSunTarget.stunUntil = Infinity;
    blueSun.classicAbilityNextAt = 0;
    step(blueSunSim);
    const rays = blueSunSim.classicEntities.filter(({ kind }) => kind === "blue-sun-laser");
    for (const ray of rays) {
        ray.rotationSpeed = 0;
        ray.nextTickAt = blueSunSim.time + 1;
    }
    blueSunTarget.x = (rays[0].x + rays[0].x2) * 0.5;
    blueSunTarget.y = (rays[0].y + rays[0].y2) * 0.5;
    const healthBefore = blueSunTarget.health;
    step(blueSunSim, 124);
    const blueTicks = blueSunSim.events.filter(({ type: eventType }) => eventType === "classic-blue-sun-hit");
    assert.ok(blueTicks.length >= 2, "each overlapping Blue Sun ray should keep its own half-second tick");
    assert.ok(blueTicks.every(({ tickSeconds, marker, damageMode, perRay, targetWindowCap }) => (
        tickSeconds === 0.5
        && marker.damage === -1
        && damageMode === "per-ray"
        && perRay === true
        && targetWindowCap === null
    )));
    assert.equal(
        blueSunTarget.health,
        healthBefore - blueTicks.reduce((total, hit) => total + hit.amount, 0),
    );
});

test("Cobwebs create one visible permanent orb-to-wall connector per bounce while wall balls drag and finish permanent segments", () => {
    const cobwebSim = createSimulation({ classes: ["cobwebs", "hydrogen-bomb"], seed: 74 });
    const cobweb = cobwebSim.fighters[0];
    forceWallBounce(cobwebSim, cobweb);
    const web = cobwebSim.classicEntities.find(({ kind }) => kind === "cobweb");
    assert.ok(web);
    assert.equal(web.anchorMode, "orb-to-wall-connector");
    assert.equal(web.permanent, true);
    assert.equal(web.strandCount, 1);
    assert.equal(web.segments.length, 1);
    assert.equal(web.borderNodes.length, 1);
    assert.equal(web.wallContact.side, "left");
    assert.equal(web.wallContact.x, cobwebSim.arenaBounds.x);
    assert.equal(web.segments[0].x2, web.wallContact.x);
    assert.equal(web.segments[0].y2, web.wallContact.y);
    const anchorSnapshot = web.borderNodes.map(({ x, y }) => `${x}:${y}`);
    cobweb.x = cobwebSim.arenaBounds.x + cobwebSim.arenaBounds.width * 0.4;
    cobweb.y = cobwebSim.arenaBounds.y + cobwebSim.arenaBounds.height * 0.4;
    step(cobwebSim);
    assert.ok(web.segments.every((segment) => segment.x1 === cobweb.x && segment.y1 === cobweb.y));
    assert.deepEqual(web.borderNodes.map(({ x, y }) => `${x}:${y}`), anchorSnapshot);

    const lazerSim = createSimulation({ classes: ["lazer", "hydrogen-bomb"], seed: 75 });
    const lazerFighter = lazerSim.fighters[0];
    forceWallBounce(lazerSim, lazerFighter, "left", lazerFighter.baselineSpeed * 0.7);
    const lazer = lazerSim.classicEntities.find(({ kind }) => kind === "laser");
    assert.ok(lazer);
    assertBoundaryPoint(lazer.previousWallContact, lazerSim.arenaBounds, "Lazer start must be on the wall it just touched");
    assert.equal(lazer.nextWallContact, null, "the active line end follows the orb instead of jumping to a predicted wall");
    assert.equal(lazer.linePhase, "dragging");
    assert.equal(lazer.completedLineCount, 0);
    assert.equal(lazer.segments.length, 1);
    assert.equal(lazer.width, 8, "Lazer should expose a bold gameplay stroke");
    assert.equal(lazer.hitWidth, lazer.width);
    assert.equal(lazer.renderWidth, lazer.width);
    assert.equal(lazer.activeSegment.width, lazer.width, "the visible segment and hitbox must share width");
    step(lazerSim, 12);
    assert.ok(Math.abs(lazer.activeSegment.y2 - lazer.activeSegment.y1) > 1e-7, "the active line should visibly drag behind an angled orb");
    assert.equal(lazer.activeSegment.x2, lazerFighter.x);
    assert.equal(lazer.activeSegment.y2, lazerFighter.y);
    assertBoundaryPoint(lazer.predictedNextWallContact, lazerSim.arenaBounds, "the predicted endpoint remains a boundary-only state hint");
    assert.deepEqual({ x: lazer.x, y: lazer.y }, { x: lazer.previousWallContact.x, y: lazer.previousWallContact.y });
});

test("Non-Lazer wall-ball variants keep one stable entity and accumulate diagonal segments", () => {
    const variants = [
        { type: "tripwire", lineKind: "tripwire", opponent: "hydrogen-bomb", seed: 80 },
        { type: "cutter", lineKind: "cutter-zone", opponent: "hydrogen-bomb", seed: 83 },
        { type: "train", lineKind: "train-track", opponent: "hydrogen-bomb", seed: 84 },
    ];
    for (const { type, lineKind, opponent, seed } of variants) {
        const sim = createSimulation({
            classes: [type, opponent],
            seed,
        });
        if (type === "train") {
            sim.fighters[1].health = 10_000;
            sim.fighters[1].maxHealth = 10_000;
            sim.fighters[1].classicCoreHealth = 10_000;
            sim.fighters[1].classicCoreMaxHealth = 10_000;
        }
        const fighter = sim.fighters[0];
        let lineId = null;
        let previousEnd = null;
        let completedCount = 0;
        for (let bounce = 0; bounce < 24; bounce += 1) {
            const verticalVelocity = fighter.baselineSpeed * (bounce % 2 === 0 ? 0.7 : -0.55);
            forceWallBounce(sim, fighter, bounce % 2 === 0 ? "left" : "right", verticalVelocity);
            const lines = sim.classicEntities.filter(({ ownerId, kind }) => (
                ownerId === fighter.id && kind === lineKind
            ));
            assert.equal(lines.length, 1, `${type} must have exactly one line entity after bounce ${bounce + 1}`);
            lineId ??= lines[0].id;
            assert.equal(lines[0].id, lineId, `${type} should retain one stable line entity`);
            assert.equal(lines[0].lineVersion, bounce + 1);
            assert.equal(lines[0].permanent, true);
            if (bounce % 2 === 0) {
                assert.equal(lines[0].linePhase, "dragging");
                assert.equal(lines[0].activeLine, true);
                assertBoundaryPoint(lines[0].lineStartWallContact, sim.arenaBounds, `${type} active segment must start at its first wall`);
                assertBoundaryPoint(lines[0].activeSegment.startWallContact, sim.arenaBounds, `${type} active line geometry must begin on the arena border`);
                if (previousEnd) assert.notDeepEqual(lines[0].lineStartWallContact, previousEnd, `${type} must start at the wall after the closing wall`);
                assert.equal(lines[0].nextWallContact, null);
                assert.equal(lines[0].activeSegment.x2, fighter.x);
                assert.equal(lines[0].activeSegment.y2, fighter.y);
                assert.equal(lines[0].completedLineCount, completedCount);
                assertBoundaryPoint(lines[0].predictedNextWallContact, sim.arenaBounds, `${type} should predict a boundary endpoint from its current direction`);
                if (type === "cutter" && completedCount > 0) {
                    assert.equal(lines[0].previousZoneSegmentId, lines[0].completedSegments.at(-1).id);
                    assert.ok(lines[0].previousZonePolygon.length >= 3, "Cutter keeps the prior fill while drawing its next line");
                    assert.equal(
                        classicCutterZoneGeometriesFor(lines[0], sim.arenaBounds).length,
                        completedCount,
                        "Cutter retains every completed area while the replacement line is drawn",
                    );
                }
            } else {
                assert.equal(lines[0].linePhase, "waiting");
                assert.equal(lines[0].activeLine, false);
                completedCount += 1;
                assert.equal(lines[0].completedLineCount, completedCount);
                assert.equal(lines[0].segments.length, completedCount);
                assertBoundaryPoint(lines[0].lineEndWallContact, sim.arenaBounds, `${type} completed segment must end on the closing wall`);
                assert.equal(lines[0].activeSegment, null);
                previousEnd = { ...lines[0].lineEndWallContact };
                assert.ok(lines[0].completedSegments.every((segment) => {
                    assertBoundaryPoint(segment.startWallContact, sim.arenaBounds, `${type} segment start must stay on the arena border`);
                    assertBoundaryPoint(segment.endWallContact, sim.arenaBounds, `${type} segment end must stay on the arena border`);
                    return true;
                }));
                if (type === "cutter") {
                    assert.ok(lines[0].zoneArea > 0, "Cutter's completed damage half-plane must remain visible until the next line");
                    assert.ok(lines[0].zonePolygon.length >= 3, "Cutter must retain the translucent red damage polygon");
                    assert.ok(["positive", "negative"].includes(lines[0].zoneSide));
                    assert.equal(
                        classicCutterZoneGeometriesFor(lines[0], sim.arenaBounds).length,
                        completedCount,
                        "Cutter keeps all completed translucent areas after each line closes",
                    );
                }
            }
            assert.ok(sim.events.some(({ type: eventType, entityId, reused }) => (
                eventType === "classic-hazard-spawn" && entityId === lineId && (bounce === 0 ? reused === false : reused === true)
            )));
        }
    }

    const cobwebSim = createSimulation({ classes: ["cobwebs", "hydrogen-bomb"], seed: 81 });
    const cobweb = cobwebSim.fighters[0];
    for (let bounce = 0; bounce < 3; bounce += 1) forceWallBounce(cobwebSim, cobweb, bounce % 2 === 0 ? "left" : "right");
    const webs = cobwebSim.classicEntities.filter(({ ownerId, kind }) => ownerId === cobweb.id && kind === "cobweb");
    assert.equal(webs.length, 3, "Cobweb should add exactly one connector entity per wall bounce");
    assert.ok(webs.every(({ strandCount, segments, anchorMode }) => (
        anchorMode === "orb-to-wall-connector" && strandCount === 1 && segments.length === 1
    )));

    const runLazerPath = (seed) => {
        const sim = createSimulation({ classes: ["lazer", "vampire"], seed });
        const fighter = sim.fighters[0];
        for (let bounce = 0; bounce < 8; bounce += 1) {
            forceWallBounce(sim, fighter, bounce % 2 === 0 ? "left" : "right", fighter.baselineSpeed * 0.6);
        }
        return sim.classicEntities
            .filter(({ ownerId, kind }) => ownerId === fighter.id && kind === "laser")
            .map(({ id, lineVersion, linePhase, completedLineCount, segments, previousWallContact, lineEndWallContact }) => ({
                id,
                lineVersion,
                linePhase,
                completedLineCount,
                segments,
                previousWallContact,
                lineEndWallContact,
            }));
    };
    assert.deepEqual(runLazerPath(82), runLazerPath(82), "same seed and fixed steps must produce the same Lazer path");
});

test("Lazer keeps exactly one active entity and one rendered path after many bounces", () => {
    const sim = createSimulation({ classes: ["lazer", "hydrogen-bomb"], seed: 79 });
    const lazer = sim.fighters[0];
    let stableId = null;
    for (let bounce = 0; bounce < 32; bounce += 1) {
        forceWallBounce(
            sim,
            lazer,
            bounce % 2 === 0 ? "left" : "right",
            lazer.baselineSpeed * (bounce % 2 === 0 ? 0.64 : -0.51),
        );
        const paths = sim.classicEntities.filter(({ ownerId, kind }) => ownerId === lazer.id && kind === "laser");
        assert.equal(paths.length, 1);
        const [path] = paths;
        stableId ??= path.id;
        assert.equal(path.id, stableId);
        assert.equal(path.activeLine, true);
        assert.equal(path.linePhase, "dragging");
        assert.equal(path.completedSegments.length, 0);
        assert.equal(path.completedLineCount, 0);
        assert.equal(path.segments.length, 1, "one entity may not conceal multiple rendered laser paths");
        assert.equal(path.segments[0].active, true);
    }
});

test("Classic Lazer deals two damage per second while touching its permanent path", () => {
    const sim = createSimulation({ classes: ["lazer", "hydrogen-bomb"], seed: 8201 });
    const [lazer, target] = sim.fighters;
    forceWallBounce(sim, lazer, "left", lazer.baselineSpeed * 0.55);
    forceWallBounce(sim, lazer, "right", -lazer.baselineSpeed * 0.55);
    const line = sim.classicEntities.find(({ ownerId, kind }) => ownerId === lazer.id && kind === "laser");
    assert.ok(line);
    const segment = line.segments[0];
    target.stunUntil = Infinity;
    target.vx = target.vy = 0;
    target.x = (segment.x1 + segment.x2) * 0.5;
    target.y = (segment.y1 + segment.y2) * 0.5;
    line.nextTickAt = sim.time + 1;
    const healthBefore = target.health;
    step(sim, 121);
    assert.equal(target.health, healthBefore - 2, "one second of laser contact should cost two health points");
    assert.equal(sim.events.filter(({ type, entityId }) => type === "classic-laser-pass" && entityId === line.id).length, 0);
    const ticks = sim.events.filter(({ type, entityId }) => type === "classic-dot-tick" && entityId === line.id);
    assert.equal(ticks.length, 1);
    assert.equal(ticks[0].amount, 2);
    assert.equal(ticks[0].tickSeconds, 1);
});

test("Classic Lazer replaces its prior segment and uses one damage clock", () => {
    const sim = createSimulation({ classes: ["lazer", "hydrogen-bomb"], seed: 8301 });
    const [lazer, target] = sim.fighters;
    forceWallBounce(sim, lazer, "left", lazer.baselineSpeed * 0.55);
    forceWallBounce(sim, lazer, "right", -lazer.baselineSpeed * 0.55);
    forceWallBounce(sim, lazer, "left", lazer.baselineSpeed * 0.42);
    forceWallBounce(sim, lazer, "right", -lazer.baselineSpeed * 0.42);
    const line = sim.classicEntities.find(({ ownerId, kind }) => ownerId === lazer.id && kind === "laser");
    assert.ok(line);
    assert.equal(line.linePhase, "dragging");
    assert.equal(line.segments.length, 1);
    target.stunUntil = Infinity;
    target.vx = target.vy = 0;
    target.x = sim.arenaBounds.x + sim.arenaBounds.width * 0.5;
    target.y = sim.arenaBounds.y + sim.arenaBounds.height * 0.1;
    step(sim);
    const firstSegment = line.segments[0];
    target.x = (firstSegment.x1 + firstSegment.x2) * 0.5;
    target.y = (firstSegment.y1 + firstSegment.y2) * 0.5;
    const healthBefore = target.health;
    const eventCountBefore = sim.events.filter(({ type, entityId }) => type === "classic-dot-tick" && entityId === line.id).length;
    line.nextTickAt = sim.time;
    step(sim);
    const ticks = sim.events.filter(({ type, entityId }) => type === "classic-dot-tick" && entityId === line.id).slice(eventCountBefore);
    assert.equal(target.health, healthBefore - 2, "the one active path gets one two-damage tick");
    assert.equal(ticks.length, 1);
    assert.equal(ticks[0].amount, 2);
    assert.equal(line.linePassCount || 0, 0);
    assert.equal(line.segments.length, 1);
});

test("Necromancer exposes lift/charge/summon phases before autonomous minions attack", () => {
    const sim = createSimulation({ classes: ["necromancer", "hydrogen-bomb"], seed: 76 });
    const necromancer = sim.fighters[0];
    necromancer.classicAbilityNextAt = 0;
    step(sim);
    const skull = sim.classicEntities.find(({ kind }) => kind === "necromancer-skull");
    assert.ok(skull);
    assert.ok(skull.visualRadius > necromancer.radius * 0.6);
    assert.ok(skull.liftY < skull.startY, "the skull must visibly lift above its resting position");
    assert.equal(necromancer.classicSummonPhase, "lift");
    assert.equal(sim.classicEntities.some(({ kind }) => kind === "necromancer-soldier"), false);
    step(sim, 50);
    assert.equal(necromancer.classicSummonPhase, "charge");
    assert.equal(sim.classicEntities.some(({ kind }) => kind === "necromancer-soldier"), false);
    step(sim, 85);
    const minions = sim.classicEntities.filter(({ kind }) => kind === "necromancer-soldier");
    assert.equal(minions.length, 2);
    assert.ok(minions.every((minion) => (
        minion.health === 1
        && minion.maxHealth === 1
        && minion.tracking === false
        && Number.isFinite(minion.vx)
        && Number.isFinite(minion.vy)
    )));
    const targetVelocity = { vx: sim.fighters[1].vx, vy: sim.fighters[1].vy };
    step(sim, 10);
    assert.deepEqual(
        { vx: sim.fighters[1].vx, vy: sim.fighters[1].vy },
        targetVelocity,
        "Necromancer minion patrol should not steer or pull the target",
    );
    step(sim, 75);
    assert.ok(sim.events.some(({ type }) => type === "classic-minion-attack"));
    assert.ok(sim.events.some(({ type, projectileKind, tracking }) => (
        type === "classic-minion-attack"
        && projectileKind === "necromancer-arrow"
        && tracking === false
    )));
    const arrow = sim.classicEntities.find(({ kind }) => kind === "necromancer-arrow");
    if (arrow) {
        assert.equal(arrow.tracking, false);
        assert.equal(arrow.radius, 4);
    }
    assert.ok(sim.events.some(({ type }) => type === "classic-necromancer-summon"));
});

test("Classic Absorber records the absorbed orb model and a persistent history entry", () => {
    const sim = createSimulation({ classes: ["absorber", "unarmed"], seed: 762 });
    const absorber = sim.fighters[0];
    absorber.classicAbilityNextAt = 0;
    step(sim);
    assert.ok(absorber.classicAbsorbedOrbId, "Absorber should choose an orb model when its ability starts");
    assert.deepEqual(absorber.classicAbsorptionHistory, [absorber.classicAbsorbedOrbId]);
    assert.equal(absorber.classicAbsorptionSequence, 1);
    assert.ok(absorber.classicAbsorbingUntil > absorber.classicAbsorptionStartedAt);
    assert.ok(sim.events.some(({ type, absorbedOrbId, absorptionSequence }) => (
        type === "classic-ability-start"
        && absorbedOrbId === absorber.classicAbsorbedOrbId
        && absorptionSequence === 1
    )));
});

test("Spikey creates permanent wall-mounted physical triangles at exact bounce contacts", () => {
    const sim = createSimulation({ classes: ["spikey", "hydrogen-bomb"], seed: 761 });
    const fighter = sim.fighters[0];
    forceWallBounce(sim, fighter, "left", fighter.baselineSpeed * 0.4);
    const spike = sim.classicEntities.find(({ ownerId, kind }) => ownerId === fighter.id && kind === "spike");
    assert.ok(spike);
    assert.equal(spike.permanent, true);
    assert.equal(spike.wallSide, "left");
    assert.equal(spike.wallContact.x, sim.arenaBounds.x);
    assert.equal(spike.wallContact.y, spike.spikeBase.y);
    assert.equal(spike.spikeBase.x, sim.arenaBounds.x);
    assert.ok(spike.spikeTip.x > spike.spikeBase.x, "the triangle must extend into the arena");
    assert.equal(spike.x, spike.spikeTip.x);
    assert.equal(spike.x2, spike.spikeBase.x);
    assert.equal(spike.y2, spike.spikeBase.y);
    assert.equal(spike.damage, 3);
    assert.equal(spike.damageHitbox, "triangle");
    assert.equal(spike.damageCoverage, "full-triangle");
    assert.equal(spike.damageContactMode, "tip-to-base");
});

test("Classic Spikey triangles are solid and reject overlapping placements, including its own spikes", () => {
    const sim = createSimulation({ classes: ["spikey", "hydrogen-bomb"], seed: 7611 });
    const [spikey, target] = sim.fighters;
    forceWallBounce(sim, spikey, "left");
    const spike = sim.classicEntities.find(({ ownerId, kind }) => ownerId === spikey.id && kind === "spike");
    assert.ok(spike);
    assert.equal(spike.physical, true);
    assert.equal(spike.solid, true);
    assert.equal(spike.collisionMode, "physical-spike");
    assert.equal(spike.collisionShape, "triangle");
    assert.equal(spike.damageCoverage, "full-triangle");

    // Put an opposing orb on the visible tip and send it into the planted
    // triangle. The physical-body pass should push it out and reflect it;
    // this is separate from the spike's one-time hazard damage.
    spikey.x = sim.arenaBounds.x + sim.arenaBounds.width - spikey.radius - 12;
    spikey.y = sim.arenaBounds.y + sim.arenaBounds.height - spikey.radius - 12;
    spikey.vx = spikey.baselineSpeed;
    spikey.vy = 0;
    target.x = spike.spikeTip.x + target.radius * 0.45;
    target.y = spike.spikeTip.y;
    target.vx = -target.baselineSpeed;
    target.vy = 0;
    step(sim);
    assert.ok(sim.events.some(({ type, objectBKind }) => (
        type === "classic-weapon-physical-bounce" && objectBKind === "spike"
    )));
    assert.ok(target.x > spike.spikeTip.x, "the opposing orb must be pushed out of the spike tip");
    assert.ok(target.vx > 0, "the opposing orb must reflect away from the spike");

    // Repeating the exact same wall contact must not create a second triangle
    // on top of the first one, even when the request comes from the same orb.
    target.x = sim.arenaBounds.x + sim.arenaBounds.width - target.radius - 12;
    target.y = sim.arenaBounds.y + sim.arenaBounds.height - target.radius - 12;
    target.vx = target.baselineSpeed;
    target.vy = 0;
    forceWallBounce(sim, spikey, "left");
    assert.equal(sim.classicEntities.filter(({ ownerId, kind }) => ownerId === spikey.id && kind === "spike").length, 1);
    assert.ok(sim.events.some(({ type, blockedByEntityId, reason }) => (
        type === "classic-spike-placement-blocked"
        && blockedByEntityId === spike.id
        && reason === "overlaps-existing-spike"
    )));
});

test("Classic Spikey stacks one damage transaction per distinct touched spike", () => {
    const sim = createSimulation({ classes: ["spikey", "hydrogen-bomb"], seed: 7612 });
    const [spikey, target] = sim.fighters;
    const bounds = sim.arenaBounds;
    for (const yFraction of [0.45, 0.55]) {
        spikey.y = bounds.y + bounds.height * yFraction;
        spikey.x = bounds.x + spikey.radius - 1;
        spikey.vx = -spikey.baselineSpeed;
        spikey.vy = 0;
        step(sim);
    }
    const spikes = sim.classicEntities.filter(({ ownerId, kind }) => ownerId === spikey.id && kind === "spike");
    assert.equal(spikes.length, 2, "the separated wall contacts should plant two triangles");

    spikey.x = bounds.x + bounds.width - spikey.radius - 12;
    spikey.y = bounds.y + bounds.height - spikey.radius - 12;
    spikey.vx = spikey.baselineSpeed;
    spikey.vy = 0;
    target.x = spikes[0].spikeTip.x + target.radius * 0.3;
    target.y = (spikes[0].spikeTip.y + spikes[1].spikeTip.y) * 0.5;
    target.vx = -target.baselineSpeed;
    target.vy = 0;
    const healthBefore = target.health;
    step(sim);
    assert.equal(healthBefore - target.health, 6, "each distinct touched triangle should deal its configured 3 damage");
    assert.equal(
        sim.events.filter(({ type, surface }) => type === "classic-projectile-hit" && surface === "spike-triangle").length,
        2,
    );
});

test("Classic Spikey applies three damage across the full tip-to-blunt-base triangle", () => {
    for (const contactPart of ["tip", "body", "base"]) {
        const sim = createSimulation({ classes: ["spikey", "hydrogen-bomb"], seed: 7613 });
        const [spikey, target] = sim.fighters;
        forceWallBounce(sim, spikey, "left");
        const spike = sim.classicEntities.find(({ ownerId, kind }) => ownerId === spikey.id && kind === "spike");
        assert.ok(spike);
        // Isolate the damage geometry from the separate physical-push pass;
        // the solid/physical contract is covered by the neighboring test.
        spike.physical = false;
        spike.solid = false;
        spikey.x = sim.arenaBounds.x + sim.arenaBounds.width - spikey.radius - 12;
        spikey.y = sim.arenaBounds.y + sim.arenaBounds.height - spikey.radius - 12;
        spikey.vx = spikey.vy = 0;
        const point = contactPart === "tip"
            ? spike.spikeHitbox.tip
            : contactPart === "base"
                ? {
                    x: (spike.spikeHitbox.baseA.x + spike.spikeHitbox.baseB.x) * 0.5,
                    y: (spike.spikeHitbox.baseA.y + spike.spikeHitbox.baseB.y) * 0.5,
                }
                : {
                    x: (spike.spikeHitbox.tip.x + spike.spikeHitbox.baseA.x) * 0.5,
                    y: (spike.spikeHitbox.tip.y + spike.spikeHitbox.baseA.y) * 0.5,
                };
        target.x = point.x + target.radius * 0.35;
        target.y = point.y;
        target.vx = target.vy = 0;
        target.stunUntil = Infinity;
        target.health = target.maxHealth = 100;
        target.classicCoreHealth = target.classicCoreMaxHealth = 100;
        step(sim);
        assert.equal(target.health, 97, `${contactPart} contact should use the full triangle damage hitbox`);
        assert.ok(sim.events.some(({ type, surface, amount }) => (
            type === "classic-projectile-hit" && surface === "spike-triangle" && amount === 3
        )));
    }
});

test("Classic Blue Sun emits eight seeded indefinite cyan rays that stop at the first physical contact", () => {
    const first = createSimulation({ classes: ["blue-sun", "hydrogen-bomb"], seed: 762 });
    const second = createSimulation({ classes: ["blue-sun", "hydrogen-bomb"], seed: 762 });
    for (const sim of [first, second]) sim.fighters[0].classicAbilityNextAt = 0;
    step(first);
    step(second);
    const firstLasers = first.classicEntities.filter(({ kind }) => kind === "blue-sun-laser");
    const secondLasers = second.classicEntities.filter(({ kind }) => kind === "blue-sun-laser");
    assert.equal(firstLasers.length, 8);
    assert.deepEqual(
        firstLasers.map(({ angle, x2, y2 }) => ({ angle, x2, y2 })),
        secondLasers.map(({ angle, x2, y2 }) => ({ angle, x2, y2 })),
    );
    assert.ok(firstLasers.every((laser) => laser.orbiting === true && Number.isFinite(laser.angle)));
    assert.ok(firstLasers.every((laser) => laser.dps === 2), "Blue Sun rays are configured for one damage per half-second");
    assert.ok(firstLasers.every((laser) => laser.damagePerTick === 1));
    assert.ok(firstLasers.every((laser) => (
        laser.hitWidth === laser.width
        && laser.renderWidth === laser.width
        && laser.deflectable === false
        && laser.collisionMode === "beam"
    )));
    assert.equal(new Set(firstLasers.map((laser) => laser.width)).size, 1);
    assert.ok(firstLasers.every((laser) => laser.indefinite === true && laser.rayMode === "infinite-until-contact"));
    assert.ok(firstLasers.every((laser) => laser.laserLength === null));
    assert.ok(firstLasers.every((laser) => Number.isFinite(laser.orbitIndex) && laser.orbitCount === 8));
    const owner = first.fighters[0];
    assert.ok(firstLasers.every((laser) => (
        Math.abs(laser.rayOriginX - owner.x) < 1e-9
        && Math.abs(laser.rayOriginY - owner.y) < 1e-9
        && Math.abs(Math.hypot(laser.x - owner.x, laser.y - owner.y) - laser.startDistance) < 1e-9
    )), "rays start at the Blue Sun rim and retain the center origin");
    assert.ok(firstLasers.every((laser) => {
        const length = Math.hypot(laser.x2 - laser.x, laser.y2 - laser.y);
        const directionX = (laser.x2 - laser.x) / length;
        const directionY = (laser.y2 - laser.y) / length;
        return Math.abs(directionX - Math.cos(laser.angle)) < 1e-9
            && Math.abs(directionY - Math.sin(laser.angle)) < 1e-9
            && (laser.stopsAt === "wall" || laser.stopsAt === "orb");
    }), "each ray endpoint follows its rotating direction and physical stop");
    assert.ok(first.events.some(({ type, targetId, rayMode }) => (
        type === "classic-blue-sun-volley" && targetId === null && rayMode === "infinite-until-contact"
    )));
    const firstAngles = firstLasers.map(({ angle }) => angle);
    step(first);
    const secondAngles = first.classicEntities
        .filter(({ kind }) => kind === "blue-sun-laser")
        .map(({ angle }) => angle);
    assert.ok(secondAngles.every((angle, index) => angle > firstAngles[index]));
    assert.ok(firstLasers.every((laser) => laser.rayLength > 0.1 && Math.abs(laser.x2 - laser.x) + Math.abs(laser.y2 - laser.y) > 0.1));
});

test("Classic Blue Sun applies one tick from every overlapping rotating ray", () => {
    const sim = createSimulation({ classes: ["blue-sun", "hydrogen-bomb"], seed: 762 });
    const [blueSun, target] = sim.fighters;
    blueSun.classicAbilityNextAt = 0;
    step(sim);
    const lasers = sim.classicEntities.filter(({ kind }) => kind === "blue-sun-laser");
    assert.equal(lasers.length, 8);
    for (const laser of lasers) laser.rotationSpeed = 0;
    target.stunUntil = Infinity;
    target.vx = target.vy = 0;
    // Clear any contact created during the volley step, then place the target
    // on a seeded ray. Its deliberately large body overlaps the two adjacent
    // rays as well, so their independent clocks can be observed together.
    const ray = lasers[3];
    target.radius = 240;
    target.x = (ray.x + ray.x2) * 0.5;
    target.y = (ray.y + ray.y2) * 0.5;
    sim.classicBlueSunDamageWindows = Object.create(null);
    for (const candidate of lasers) {
        candidate.beamContactTargetId = null;
        candidate.nextTickAt = Infinity;
    }
    target.maxHealth = target.health = 1000;
    target.classicCoreHealth = target.classicCoreMaxHealth = 1000;
    const healthBefore = target.health;
    const eventCountBefore = sim.events.filter(({ type }) => type === "classic-blue-sun-hit").length;
    step(sim);
    const hits = sim.events.filter(({ type }) => type === "classic-blue-sun-hit").slice(eventCountBefore);
    assert.ok(hits.length >= 2, "multiple rotating rays should each damage a shared target in quick succession");
    assert.ok(new Set(hits.map(({ rayIndex }) => rayIndex)).size >= 2);
    assert.ok(Math.abs((healthBefore - target.health) - hits.length) < 1e-9);
    assert.ok(hits.every(({ damagePerSecond, tickSeconds, targetWindowCap, rateLimited, damageMode, perRay }) => (
        damagePerSecond === 2
        && tickSeconds === 0.5
        && targetWindowCap === null
        && rateLimited === false
        && damageMode === "per-ray"
        && perRay === true
    )));
});

test("Classic Blue Sun damages an orb when the rendered beam stroke visibly touches it", () => {
    const sim = createSimulation({ classes: ["blue-sun", "hydrogen-bomb"], seed: 8422 });
    const [blueSun, target] = sim.fighters;
    blueSun.classicAbilityNextAt = 0;
    target.stunUntil = Infinity;
    target.vx = target.vy = 0;
    step(sim);
    const rays = sim.classicEntities.filter(({ kind }) => kind === "blue-sun-laser");
    const ray = rays.find(({ stopsAt }) => stopsAt === "wall") || rays[0];
    for (const candidate of rays) {
        candidate.rotationSpeed = 0;
        candidate.nextTickAt = Infinity;
        candidate.beamContactTargetId = null;
    }
    target.x = (ray.x + ray.x2) * 0.5;
    target.y = (ray.y + ray.y2) * 0.5;
    ray.nextTickAt = sim.time;
    sim.classicBlueSunDamageWindows = Object.create(null);
    const healthBefore = target.health;
    step(sim);
    const hit = sim.events.findLast(({ type, targetId }) => (
        type === "classic-blue-sun-hit" && targetId === target.id
    ));
    assert.ok(hit, "a visible beam/orb overlap must resolve a damage event");
    assert.equal(hit.amount, 1);
    assert.equal(target.health, healthBefore - 1);
});

test("Classic announcement pose does not pause fighters and releases deterministically", () => {
    const sim = createSimulation({
        classes: ["trident", "pistol"],
        seed: 763,
        features: { introCards: true },
    });
    const [trident, pistol] = sim.fighters;
    const startingPositions = sim.fighters.map(({ x, y }) => ({ x, y }));
    assert.equal(sim.classicAnnouncementFreezeUntil, 0);
    assert.equal(sim.classicAnnouncementPoseUntil, 2);
    assert.equal(sim.classicAnnouncementFrozen, false);
    assert.equal(trident.classicAnnouncementActive, true);
    assert.equal(trident.classicAimAngle, -Math.PI / 2, "Trident is upright during the announcement");
    assert.equal(trident.weaponAngle, -Math.PI / 2);
    assert.ok(Math.abs(pistol.classicGunAimAngle - Math.PI) < 1e-9, "the gun faces its opponent");
    step(sim, 1);
    assert.ok(sim.fighters.some((fighter, index) => (
        fighter.x !== startingPositions[index].x || fighter.y !== startingPositions[index].y
    )), "the opening pose must not pause fighter movement");
    assert.equal(sim.classicAnnouncementFrozen, false);
    assert.equal(sim.classicAnnouncementFinished, false);
    assert.equal(trident.classicAnnouncementActive, true);
    assert.equal(trident.classicAimAngle, -Math.PI / 2, "Trident stays upright during the pose window");
    step(sim, 238);
    assert.equal(sim.classicAnnouncementFinished, false);
    step(sim, 2);
    assert.equal(sim.classicAnnouncementFinished, true);
    assert.ok(sim.events.some(({ type }) => type === "classic-announcement-finished"));
    assert.equal(trident.classicAnnouncementActive, false);
    assert.equal(sim.events.find(({ type }) => type === "classic-announcement-finished").simulationPaused, false);
    const mirror = createSimulation({
        classes: ["trident", "pistol"],
        seed: 763,
        features: { introCards: true },
    });
    step(mirror, 241);
    assert.deepEqual(captureReplayFrame(sim), captureReplayFrame(mirror), "announcement pose/release remains replay-deterministic");
    assert.deepEqual(sim.events, mirror.events);

    const swordSim = createSimulation({
        classes: ["sword", "hydrogen-bomb"],
        seed: 766,
        features: { introCards: true },
    });
    assert.equal(swordSim.fighters[0].weaponAngle, -Math.PI / 2, "sword is upright during the announcement");
});

test("Classic swords and tridents keep weapon contact while held guns remain non-physical, and Trident throw damage is twenty", () => {
    const clashSim = createSimulation({ classes: ["pistol", "shotgun"], seed: 764 });
    const [pistol, shotgun] = clashSim.fighters;
    pistol.x = 300;
    pistol.y = 300;
    shotgun.x = 350;
    shotgun.y = 300;
    pistol.vx = pistol.vy = shotgun.vx = shotgun.vy = 0;
    pistol.classicGunAimAngle = 0;
    shotgun.classicGunAimAngle = Math.PI;
    pistol.classicAbilityNextAt = Infinity;
    shotgun.classicAbilityNextAt = Infinity;
    step(clashSim);
    const physicalBounce = clashSim.events.find(({ type }) => type === "classic-weapon-physical-bounce");
    assert.equal(physicalBounce, undefined, "overlapping held gun silhouettes must not physically rebound");
    assert.ok(pistol.classicWeaponObjects.length > 0 && shotgun.classicWeaponObjects.length > 0);

    const tridentSim = createSimulation({ classes: ["trident", "hydrogen-bomb"], seed: 765 });
    const [tridentOwner, target] = tridentSim.fighters;
    target.maxHealth = target.health = 1000;
    target.baselineSpeed = 1;
    target.vx = target.vy = 0;
    tridentOwner.classicAbilityNextAt = 0;
    step(tridentSim);
    const trident = tridentSim.classicEntities.find(({ kind }) => kind === "trident-ammo");
    assert.ok(trident);
    trident.x = target.x;
    trident.y = target.y;
    trident.vx = trident.vy = 0;
    const healthBefore = target.health;
    step(tridentSim);
    assert.equal(healthBefore - target.health, 20, "a thrown Trident deals twenty damage in one hit");
    assert.ok(tridentSim.events.some(({ type, projectileKind, amount, contactDamage }) => (
        type === "classic-projectile-hit"
        && projectileKind === "trident-ammo"
        && amount === 20
        && contactDamage === 0
    )));
});

test("Classic sword and trident bodies block orbs, and sword swings/pokes deal their distinct damage", () => {
    const swordSim = createSimulation({ classes: ["sword", "hydrogen-bomb"], seed: 767 });
    const [sword, swordTarget] = swordSim.fighters;
    sword.x = 300;
    sword.y = 300;
    sword.weaponAngle = 0;
    sword.classicSwordPhase = "active";
    sword.classicSwordStartedAt = -0.2;
    sword.classicSwordPhaseUntil = 1;
    sword.classicSwordAngle = 0;
    sword.stunUntil = Infinity;
    sword.classicAbilityNextAt = Infinity;
    swordTarget.stunUntil = Infinity;
    swordTarget.health = swordTarget.maxHealth = 1000;
    const swordSegment = getWeaponSegment(sword, swordSim.time);
    swordTarget.x = (swordSegment.x1 + swordSegment.x2) * 0.5;
    swordTarget.y = (swordSegment.y1 + swordSegment.y2) * 0.5;
    swordTarget.vx = -swordTarget.baselineSpeed;
    swordTarget.vy = 0;
    const swordTargetX = swordTarget.x;
    step(swordSim);
    const swordHit = swordSim.events.find(({ type, fighterId, targetId, amount }) => (
        type === "weapon-hit"
        && fighterId === sword.id
        && targetId === swordTarget.id
        && amount > 0
    ));
    assert.ok(swordHit);
    assert.equal(swordHit.amount, 5, "a normal sword swing should deal five damage");
    assert.equal(swordTarget.health, 995);
    assert.ok(
        swordTarget.x !== swordTargetX || swordTarget.y !== swordSegment.y1,
        "the orb should be separated from the physical sword segment",
    );
    assert.ok(swordSim.events.some(({ type, objectAId, objectBId, objectBKind }) => (
        type === "classic-weapon-physical-bounce"
        && objectAId === swordTarget.id
        && objectBId === `${sword.id}:sword`
        && objectBKind === "sword"
    )));

    const pokeSim = createSimulation({ classes: ["sword", "hydrogen-bomb"], seed: 769 });
    const [pokeSword, pokeTarget] = pokeSim.fighters;
    pokeSword.x = 300;
    pokeSword.y = 300;
    pokeSword.classicSwordPhase = "active";
    pokeSword.classicSwordAttackMode = "poke";
    pokeSword.classicSwordStartedAt = -0.2;
    pokeSword.classicSwordPhaseUntil = 1;
    pokeSword.classicSwordAngle = 0;
    pokeSword.classicSwordDamage = 3;
    pokeSword.stunUntil = Infinity;
    pokeSword.classicAbilityNextAt = Infinity;
    pokeTarget.stunUntil = Infinity;
    pokeTarget.health = pokeTarget.maxHealth = 1000;
    const pokeSegment = getWeaponSegment(pokeSword, pokeSim.time);
    pokeTarget.x = (pokeSegment.x1 + pokeSegment.x2) * 0.5;
    pokeTarget.y = (pokeSegment.y1 + pokeSegment.y2) * 0.5;
    pokeTarget.vx = -pokeTarget.baselineSpeed;
    pokeTarget.vy = 0;
    step(pokeSim);
    const pokeHit = pokeSim.events.find(({ type, fighterId, targetId, amount }) => (
        type === "weapon-hit"
        && fighterId === pokeSword.id
        && targetId === pokeTarget.id
        && amount > 0
    ));
    assert.ok(pokeHit);
    assert.equal(pokeHit.amount, 3, "an extended sword poke should deal three damage");
    assert.equal(pokeTarget.health, 997);

    const heldTridentSim = createSimulation({ classes: ["trident", "hydrogen-bomb"], seed: 768 });
    const [heldTrident, heldTridentTarget] = heldTridentSim.fighters;
    heldTrident.x = 300;
    heldTrident.y = 300;
    heldTrident.classicAimAngle = 0;
    heldTrident.stunUntil = Infinity;
    heldTrident.classicAbilityNextAt = Infinity;
    heldTridentTarget.stunUntil = Infinity;
    heldTridentTarget.health = heldTridentTarget.maxHealth = 1000;
    heldTridentTarget.x = heldTrident.x + heldTrident.radius * 1.3;
    heldTridentTarget.y = heldTrident.y;
    heldTridentTarget.vx = -heldTridentTarget.baselineSpeed;
    heldTridentTarget.vy = 0;
    const heldTridentTargetX = heldTridentTarget.x;
    step(heldTridentSim);
    assert.equal(heldTridentTarget.health, 1000, "a held Trident is a harmless physical obstacle");
    assert.ok(heldTridentTarget.x > heldTridentTargetX);
    assert.ok(heldTridentSim.events.some(({ type, objectAId, objectBKind, harmless }) => (
        type === "classic-weapon-physical-bounce"
        && objectAId === heldTridentTarget.id
        && objectBKind === "trident"
        && harmless === true
    )));

    const stuckTridentSim = createSimulation({ classes: ["trident", "hydrogen-bomb"], seed: 769 });
    const [tridentOwner, wallTarget] = stuckTridentSim.fighters;
    tridentOwner.stunUntil = Infinity;
    tridentOwner.classicAbilityNextAt = 0;
    step(stuckTridentSim);
    const stuckTrident = stuckTridentSim.classicEntities.find(({ kind }) => kind === "trident-ammo");
    assert.ok(stuckTrident);
    Object.assign(stuckTrident, {
        phase: "stuck-wall",
        x: 450,
        y: 300,
        vx: 0,
        vy: 0,
        stickUntil: stuckTridentSim.time + 3,
        recallAt: stuckTridentSim.time + 3,
        stuckPosition: { x: 450, y: 300 },
        stuckTargetId: null,
        stuckSurface: "wall",
    });
    wallTarget.stunUntil = Infinity;
    wallTarget.health = wallTarget.maxHealth = 1000;
    wallTarget.x = stuckTrident.x;
    wallTarget.y = stuckTrident.y;
    wallTarget.vx = -wallTarget.baselineSpeed;
    wallTarget.vy = 0;
    const wallTargetX = wallTarget.x;
    step(stuckTridentSim);
    assert.equal(wallTarget.health, 1000, "an orb bouncing from a wall-stuck trident takes no damage");
    assert.notEqual(wallTarget.x, wallTargetX);
    assert.ok(stuckTridentSim.events.some(({ type, objectBId, objectBKind, harmless, damage }) => (
        type === "classic-weapon-physical-bounce"
        && objectBId === stuckTrident.id
        && objectBKind === "trident"
        && harmless === true
        && damage === 0
    )));
});

test("Held gun geometry matches the visible compact rectangle without gun rebound", () => {
    const separated = createSimulation({ classes: ["pistol", "shotgun"], seed: 766 });
    const [pistol, shotgun] = separated.fighters;
    pistol.x = 300;
    pistol.y = shotgun.y = 300;
    shotgun.x = 520;
    pistol.vx = -pistol.baselineSpeed;
    pistol.vy = 0;
    shotgun.vx = shotgun.baselineSpeed;
    shotgun.vy = 0;
    pistol.classicGunAimAngle = 0;
    shotgun.classicGunAimAngle = Math.PI;
    pistol.classicAbilityNextAt = Infinity;
    shotgun.classicAbilityNextAt = Infinity;
    step(separated);
    const pistolGun = pistol.classicWeaponObjects.find(({ kind }) => kind === "gun");
    const shotgunGun = shotgun.classicWeaponObjects.find(({ kind }) => kind === "gun");
    assert.equal(pistolGun.collisionShape, "oriented-rectangle");
    assert.equal(shotgunGun.collisionShape, "oriented-rectangle");
    assert.ok(pistolGun.visualWidth > pistol.radius * 2.8);
    assert.ok(pistolGun.visualHeight > pistol.radius * 1.3);
    assert.ok(Math.abs(pistolGun.x2 - pistolGun.x1 - pistolGun.visualWidth) < 1e-9);
    assert.equal(
        separated.events.some(({ type }) => type === "classic-weapon-physical-bounce"),
        false,
        "guns must not repel while their visible rectangles are separated",
    );
    assert.equal(
        separated.events.some(({ type }) => type === "impact"),
        false,
        "the fighter bodies remain separate in the gun-only spacing test",
    );

    const touching = createSimulation({ classes: ["pistol", "shotgun"], seed: 767 });
    const [touchingPistol, touchingShotgun] = touching.fighters;
    touchingPistol.x = 300;
    touchingPistol.y = touchingShotgun.y = 300;
    touchingShotgun.x = 490;
    touchingPistol.vx = -touchingPistol.baselineSpeed;
    touchingPistol.vy = 0;
    touchingShotgun.vx = touchingShotgun.baselineSpeed;
    touchingShotgun.vy = 0;
    touchingPistol.classicGunAimAngle = 0;
    touchingShotgun.classicGunAimAngle = Math.PI;
    touchingPistol.classicAbilityNextAt = Infinity;
    touchingShotgun.classicAbilityNextAt = Infinity;
    step(touching);
    const physicalBounce = touching.events.find(({ type }) => type === "classic-weapon-physical-bounce");
    assert.equal(physicalBounce, undefined, "overlapping held gun shapes must remain non-physical");
});

test("Attached weapon collision footprints stay inside their current visible pose", () => {
    const tridentSim = createSimulation({ classes: ["trident", "hydrogen-bomb"], seed: 1502 });
    const [trident] = tridentSim.fighters;
    trident.classicAbilityNextAt = Infinity;
    trident.classicAimAngle = 0;
    trident.stunUntil = Infinity;
    step(tridentSim);
    const tridentWeapon = trident.classicWeaponObjects.find(({ kind }) => kind === "trident");
    assert.equal(tridentWeapon.collisionShape, "multi-segment");
    assert.equal(tridentWeapon.segments.length, 6);
    assert.equal(tridentWeapon.collisionRadius, tridentWeapon.width * 0.5);
    assert.ok(tridentWeapon.segments.every((segment) => segment.width <= trident.radius * 0.3));
    assert.ok(tridentWeapon.x1 < trident.x, "the held trident's shaft starts at its visible rear, not the orb center");
    assert.ok(tridentWeapon.x2 > trident.x + trident.radius * 3, "the held trident exposes its visible forward tines");
    const visibleVerticalReach = Math.max(...tridentWeapon.segments.flatMap((segment) => [
        Math.abs(segment.y1 - trident.y),
        Math.abs(segment.y2 - trident.y),
    ]));
    assert.ok(
        visibleVerticalReach < trident.radius * 0.5,
        "Trident physical prongs must stay inside the authored sprite's visible height",
    );

    const gunSim = createSimulation({ classes: ["pistol", "hydrogen-bomb"], seed: 1503 });
    const [pistol] = gunSim.fighters;
    pistol.classicAbilityNextAt = Infinity;
    pistol.classicGunAimAngle = 0;
    pistol.stunUntil = Infinity;
    step(gunSim);
    const gun = pistol.classicWeaponObjects.find(({ kind }) => kind === "gun");
    assert.equal(gun.collisionShape, "oriented-rectangle");
    assert.equal(gun.collisionRadius, gun.visualHeight * 0.5);
    assert.equal(gun.visualEndOffset - gun.visualStartOffset, gun.visualWidth);
});

test("Held Trident only repels at its visible segment and gates repeated overlap pushes", () => {
    const sim = createSimulation({ classes: ["trident", "hydrogen-bomb"], seed: 1504 });
    const [trident, target] = sim.fighters;
    trident.x = 300;
    trident.y = target.y = 300;
    target.x = 600;
    trident.vx = trident.vy = target.vx = target.vy = 0;
    trident.baselineSpeed = target.baselineSpeed = 0;
    trident.stunUntil = target.stunUntil = Infinity;
    trident.classicAbilityNextAt = Infinity;
    step(sim);
    assert.equal(
        sim.events.some(({ type, objectBKind }) => type === "classic-weapon-physical-bounce" && objectBKind === "trident"),
        false,
        "a target beyond the visible trident tip must not be pushed",
    );
    const weapon = trident.classicWeaponObjects.find(({ kind }) => kind === "trident");
    const centerTine = weapon.segments[3];
    target.x = centerTine.x2 + target.radius + centerTine.width * 0.5 - 0.5;
    sim.events = [];
    step(sim);
    const firstContact = sim.events.filter(({ type, objectBKind }) => (
        type === "classic-weapon-physical-bounce" && objectBKind === "trident"
    ));
    assert.equal(firstContact.length, 1, "a visible trident contact should produce one physical bounce");
    sim.events = [];
    step(sim);
    assert.equal(
        sim.events.some(({ type, objectBKind }) => type === "classic-weapon-physical-bounce" && objectBKind === "trident"),
        false,
        "remaining inside one visible segment must not repeatedly push the target every fixed step",
    );
});

test("A trident embedded in an orb cannot block or deflect a fired bullet", () => {
    const sim = createSimulation({ classes: ["trident", "pistol"], seed: 8423 });
    const [tridentOwner, pistol] = sim.fighters;
    tridentOwner.x = 600;
    tridentOwner.y = pistol.y = 360;
    pistol.x = 300;
    tridentOwner.vx = tridentOwner.vy = pistol.vx = pistol.vy = 0;
    tridentOwner.stunUntil = pistol.stunUntil = Infinity;
    tridentOwner.classicAbilityNextAt = 0;
    step(sim);
    const embedded = sim.classicEntities.find(({ kind }) => kind === "trident-ammo");
    assert.ok(embedded);
    Object.assign(embedded, {
        phase: "stuck-orb",
        stuckTargetId: pistol.id,
        stuckSurface: "orb",
        stuckOffsetX: 0,
        stuckOffsetY: 0,
        stickUntil: sim.time + 3,
        recallAt: sim.time + 3,
        x: pistol.x,
        y: pistol.y,
        vx: 0,
        vy: 0,
    });
    for (const entity of sim.classicEntities.filter(({ kind }) => kind === "pistol-ammo")) entity.expiresAt = sim.time;
    pistol.classicAbilityNextAt = sim.time;
    step(sim);
    const bullet = sim.classicEntities.find(({ ownerId, kind }) => ownerId === pistol.id && kind === "pistol-ammo");
    assert.ok(bullet);
    bullet.x = embedded.x;
    bullet.y = embedded.y;
    bullet.vx = 200;
    bullet.vy = 0;
    bullet.angle = 0;
    const eventCount = sim.events.length;
    step(sim);
    assert.equal(bullet.vx > 0, true, "the bullet keeps its outgoing direction through the embedded trident");
    assert.equal(sim.events.slice(eventCount).some(({ type, objectBId }) => (
        type === "classic-weapon-physical-bounce" && objectBId === embedded.id
    )), false);
});

test("Classic held guns do not block fired bullet damage", () => {
    const sim = createSimulation({ classes: ["pistol", "shotgun"], seed: 7661 });
    const [pistol, shotgun] = sim.fighters;
    pistol.x = 300;
    pistol.y = 300;
    shotgun.x = 450;
    shotgun.y = 300;
    pistol.baselineSpeed = 1;
    shotgun.baselineSpeed = 1;
    pistol.vx = shotgun.vx = 1;
    pistol.vy = shotgun.vy = 0;
    pistol.classicGunAimAngle = 0;
    shotgun.classicGunAimAngle = Math.PI;
    pistol.classicAbilityNextAt = 0;
    shotgun.classicAbilityNextAt = Infinity;
    step(sim);
    pistol.classicAbilityNextAt = Infinity;
    const healthBefore = shotgun.health;
    step(sim, 80);
    assert.ok(shotgun.health < healthBefore, "a bullet must reach the orb through the held gun segment");
    assert.equal(
        sim.events.some(({ type, objectAId, objectBId }) => (
            type === "classic-weapon-physical-bounce"
            && [objectAId, objectBId].some((id) => !String(id).startsWith("fighter-"))
        )),
        false,
        "the held gun must not physically intercept its opponent's bullet",
    );
});

test("Classic Sword alternates a target-facing swing and an extended poke", () => {
    const sim = createSimulation({ classes: ["sword", "hydrogen-bomb"], seed: 770 });
    const [sword, target] = sim.fighters;
    sword.x = 300;
    sword.y = target.y = 300;
    target.x = 420;
    sword.stunUntil = Infinity;
    target.stunUntil = Infinity;
    sword.vx = sword.vy = target.vx = target.vy = 0;
    sword.stunUntil = target.stunUntil = Infinity;
    sword.classicAbilityNextAt = 0;
    step(sim);
    assert.equal(sword.classicSwordAttackMode, "swing");
    assert.equal(sword.classicSwordPhase, "windup");
    assert.equal(sword.classicSwordDamage, 5);
    step(sim, 80);
    assert.equal(sword.classicSwordPhase, "idle");
    sword.classicAbilityNextAt = sim.time;
    step(sim);
    assert.equal(sword.classicSwordAttackMode, "poke");
    assert.equal(sword.classicSwordPhase, "windup");
    assert.equal(sword.classicSwordDamage, 3);
    const pokeSegment = getWeaponSegment(sword, sim.time + 0.35);
    assert.ok(pokeSegment.visualLength > sword.radius * 2.4, "the poke segment should extend beyond the guard reach");
});

test("Classic Sword uses a visible-width hit capsule and chains consecutive landed attacks", () => {
    const sim = createSimulation({ classes: ["sword", "hydrogen-bomb"], seed: 7701 });
    const [sword, target] = sim.fighters;
    sword.x = 300;
    sword.y = target.y = 300;
    target.x = 420;
    sword.vx = sword.vy = target.vx = target.vy = 0;
    sword.stunUntil = target.stunUntil = Infinity;
    target.health = target.maxHealth = 1000;
    sword.classicAbilityNextAt = 0;

    const visibleSegment = getWeaponSegment(sword, sim.time);
    assert.ok(
        visibleSegment.width >= sword.radius * 0.5,
        "Sword's gameplay capsule should cover the visible blade thickness",
    );
    step(sim, 250);

    assert.ok(sword.classicSwordAttacks >= 3, "a target that stays in range should allow consecutive sword attacks");
    assert.ok(sword.classicSwordHits >= 2, "consecutive landed sword attacks should each deal damage");
    assert.ok(target.health <= 992, "the chained swing and poke should both affect the target");
    assert.ok(sword.classicSwordLastHitAt > 0, "Sword records the deterministic time of its last landed combo hit");
});

test("Classic Sword blade contact deals three damage and uses the widened physical capsule", () => {
    const sim = createSimulation({ classes: ["sword", "hydrogen-bomb"], seed: 7702 });
    const [sword, target] = sim.fighters;
    sword.x = 300;
    sword.y = target.y = 300;
    sword.classicSwordAngle = 0;
    sword.classicAimAngle = 0;
    sword.classicAbilityNextAt = Infinity;
    sword.classicSwordPhase = "idle";
    target.x = sword.x + sword.radius * 2.7;
    sword.vx = sword.vy = target.vx = target.vy = 0;
    sword.stunUntil = target.stunUntil = Infinity;
    target.health = target.maxHealth = 1000;
    target.classicCoreHealth = target.classicCoreMaxHealth = 1000;
    target.classicCollisionDamageEnabled = false;

    const segment = getWeaponSegment(sword, sim.time);
    assert.ok(segment.width >= sword.radius * 0.7, "Sword contact uses the visible blade width");
    step(sim);

    assert.equal(target.health, 997, "walking into Sword's blade should deal three damage");
    assert.ok(sim.events.some(({ type, objectBKind, contactSource, contactDamage }) => (
        type === "classic-weapon-physical-bounce"
        && objectBKind === "sword"
        && contactSource === "sword-blade"
        && contactDamage === 3
    )));
});

test("Classic bullet hierarchy cancels, destroys, and deflects only the configured matchups", () => {
    const createBulletPair = () => {
        const sim = createSimulation({ classes: ["pistol", "shotgun"], seed: 7662 });
        const [pistol, shotgun] = sim.fighters;
        pistol.x = 200;
        pistol.y = shotgun.y = 300;
        shotgun.x = 520;
        pistol.vx = shotgun.vx = 0;
        pistol.vy = shotgun.vy = 0;
        pistol.classicAbilityNextAt = 0;
        shotgun.classicAbilityNextAt = 0;
        step(sim);
        const bullets = sim.classicEntities.filter(({ kind }) => (
            kind === "pistol-ammo" || kind === "shotgun-ammo"
        ));
        assert.ok(bullets.length >= 2, "both gun orbs should expose physical rounds");
        const first = bullets.find(({ kind }) => kind === "pistol-ammo");
        const second = bullets.find(({ kind }) => kind === "shotgun-ammo");
        first.x = 350;
        first.y = second.y = 300;
        second.x = 350 + first.radius + second.radius - 0.25;
        first.vx = 180;
        first.vy = 0;
        second.vx = -180;
        second.vy = 0;
        pistol.classicGunConsecutiveShot = pistol.classicGunConsecutiveCount;
        pistol.classicGunConsecutiveNextAt = Infinity;
        pistol.classicAbilityNextAt = Infinity;
        shotgun.classicAbilityNextAt = Infinity;
        return { sim, first, second };
    };

    const firstPair = createBulletPair();
    step(firstPair.sim);
    assert.ok(firstPair.sim.events.some(({ type, objectAId, objectBId, interaction }) => (
        type === "classic-weapon-physical-bounce"
        && [objectAId, objectBId].includes(firstPair.first.id)
        && [objectAId, objectBId].includes(firstPair.second.id)
        && interaction === "cancel"
    )), "pistol and shotgun rounds should emit a cancellation event when they meet");
    assert.equal(firstPair.first.expiresAt, firstPair.sim.time);
    assert.equal(firstPair.second.expiresAt, firstPair.sim.time);

    const mirrorPair = createBulletPair();
    step(mirrorPair.sim);
    assert.deepEqual(captureReplayFrame(firstPair.sim), captureReplayFrame(mirrorPair.sim));
    assert.deepEqual(firstPair.sim.events, mirrorPair.sim.events);

    const highSim = createSimulation({ classes: ["rifle", "pistol"], seed: 7664 });
    const [rifleOwner, pistolOwner] = highSim.fighters;
    rifleOwner.stunUntil = pistolOwner.stunUntil = Infinity;
    rifleOwner.classicAbilityNextAt = pistolOwner.classicAbilityNextAt = 0;
    step(highSim);
    const rifleRound = highSim.classicEntities.find(({ kind }) => kind === "rifle-ammo");
    const pistolRound = highSim.classicEntities.find(({ kind }) => kind === "pistol-ammo");
    assert.ok(rifleRound && pistolRound);
    rifleRound.x = pistolRound.x = 350;
    rifleRound.y = pistolRound.y = 300;
    rifleRound.vx = 180;
    rifleRound.vy = 0;
    pistolRound.vx = -180;
    pistolRound.vy = 0;
    const rifleVelocity = rifleRound.vx;
    rifleOwner.classicAbilityNextAt = pistolOwner.classicAbilityNextAt = Infinity;
    step(highSim);
    assert.equal(pistolRound.expiresAt, highSim.time, "rifle rounds destroy pistol rounds");
    assert.notEqual(rifleRound.expiresAt, highSim.time, "rifle rounds continue after destroying pistol rounds");
    assert.equal(rifleRound.vx, rifleVelocity, "rifle trajectory is not deflected by the destroyed pistol round");

    const arrowSim = createSimulation({ classes: ["pistol", "hydrogen-bomb"], seed: 7665 });
    const [arrowPistol, arrowOwner] = arrowSim.fighters;
    arrowPistol.stunUntil = arrowOwner.stunUntil = Infinity;
    arrowPistol.classicAbilityNextAt = 0;
    step(arrowSim);
    const arrowPistolRound = arrowSim.classicEntities.find(({ kind }) => kind === "pistol-ammo");
    const arrow = {
        id: "classic-test-arrow",
        kind: "necromancer-arrow",
        ownerId: arrowOwner.id,
        targetId: arrowPistol.id,
        x: 350,
        y: 300,
        vx: -180,
        vy: 0,
        radius: 4,
        damage: 3,
        bulletFamily: "arrow",
        bulletTier: 1,
        physical: true,
        solid: true,
        deflectable: true,
        expiresAt: arrowSim.time + 8,
    };
    arrowPistolRound.x = arrow.x;
    arrowPistolRound.y = arrow.y;
    arrowPistolRound.vx = 180;
    arrowPistolRound.vy = 0;
    arrowSim.classicEntities.push(arrow);
    arrowPistol.classicGunConsecutiveNextAt = Infinity;
    arrowPistol.classicAbilityNextAt = Infinity;
    step(arrowSim);
    assert.equal(arrow.expiresAt, arrowSim.time, "pistol and arrow rounds cancel");
    assert.equal(arrowPistolRound.expiresAt, arrowSim.time, "pistol and arrow rounds cancel symmetrically");

    for (const weaponType of ["sword", "trident"]) {
        const sim = createSimulation({ classes: ["pistol", weaponType], seed: 7663 });
        const [pistol, weaponOwner] = sim.fighters;
        pistol.x = 200;
        pistol.y = weaponOwner.y = 300;
        weaponOwner.x = 500;
        pistol.vx = weaponOwner.vx = 0;
        pistol.vy = weaponOwner.vy = 0;
        pistol.classicAbilityNextAt = 0;
        weaponOwner.classicAbilityNextAt = Infinity;
        step(sim);
        const bullet = sim.classicEntities.find(({ kind }) => kind === "pistol-ammo");
        assert.ok(bullet, `${weaponType} matchup should create a gun round`);
        pistol.classicGunConsecutiveShot = pistol.classicGunConsecutiveCount;
        pistol.classicGunConsecutiveNextAt = Infinity;
        pistol.classicAbilityNextAt = Infinity;
        pistol.stunUntil = sim.time + 1;
        weaponOwner.stunUntil = sim.time + 1;
        if (weaponType === "sword") {
            weaponOwner.weaponAngle = Math.PI;
        } else {
            weaponOwner.classicAimAngle = Math.PI;
        }
        const segment = weaponType === "sword"
            ? getWeaponSegment(weaponOwner, sim.time)
            : {
                x1: weaponOwner.x,
                y1: weaponOwner.y,
                x2: weaponOwner.x - weaponOwner.radius * 2.2,
                y2: weaponOwner.y,
            };
        bullet.x = (segment.x1 + segment.x2) * 0.5;
        bullet.y = (segment.y1 + segment.y2) * 0.5;
        bullet.vx = 180;
        bullet.vy = 0;
        const beforeVx = bullet.vx;
        step(sim);
        assert.ok(sim.events.some(({ type, objectAId, objectBId }) => (
            type === "classic-weapon-physical-bounce"
            && [objectAId, objectBId].includes(bullet.id)
            && [objectAId, objectBId].some((id) => String(id).endsWith(`:${weaponType}`))
        )), `${weaponType} should deflect a contacting gun round`);
        assert.ok(bullet.vx < beforeVx, `${weaponType} should change the gun round's direction`);
    }
});

test("Draftmaster aim, gun reload, and sword active window are deterministic and one-hit-per-swing", () => {
    const first = createSimulation({ classes: ["draftmaster", "hydrogen-bomb"], seed: 77 });
    const second = createSimulation({ classes: ["draftmaster", "hydrogen-bomb"], seed: 77 });
    for (const sim of [first, second]) {
        const [draftmaster, target] = sim.fighters;
        draftmaster.x = 300;
        draftmaster.y = 300;
        target.x = 365;
        target.y = 300;
        target.baselineSpeed = 1;
        target.vx = 1;
        target.vy = 0;
        draftmaster.classicAbilityNextAt = 0;
        step(sim);
        sim.classicEntities
            .filter(({ kind }) => kind === "draftmaster-ammo")
            .forEach((entity) => { entity.expiresAt = sim.time; });
        assert.equal(draftmaster.classicDraftmasterGunPhase, "firing");
        assert.equal(draftmaster.classicDraftmasterSwordPhase, "windup");
        assert.ok(Number.isFinite(draftmaster.classicDraftmasterGunAimAngle));
        assert.ok(draftmaster.classicDraftmasterGunDamage >= 3 && draftmaster.classicDraftmasterGunDamage <= 8);
        const healthBeforeActive = target.health;
        step(sim, 12);
        assert.equal(draftmaster.classicDraftmasterSwordPhase, "windup");
        assert.equal(target.health, healthBeforeActive);
        step(sim, 15);
        assert.equal(draftmaster.classicDraftmasterSwordPhase, "active");
        const swordDamage = healthBeforeActive - target.health;
        assert.ok(swordDamage >= 0 && swordDamage <= 8);
        step(sim, 8);
        assert.ok(healthBeforeActive - target.health <= 8, "sword should hit a target once per swing");
    }
    assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second));
    assert.deepEqual(first.events, second.events);
});

test("Pistol, Shotgun, and Rifle expose deterministic gun phases and Pistol fires a timed two-shot burst", () => {
    const profiles = {
        pistol: { count: 2, spread: 0, projectileKind: "pistol-ammo", maxWallBounces: null },
        shotgun: { count: 7, spread: 0.16, projectileKind: "shotgun-ammo", maxWallBounces: null },
        rifle: { count: 5, spread: 0, projectileKind: "rifle-ammo", maxWallBounces: 2 },
    };
    for (const [type, profile] of Object.entries(profiles)) {
        const first = createSimulation({ classes: [type, "hydrogen-bomb"], seed: 83 });
        const second = createSimulation({ classes: [type, "hydrogen-bomb"], seed: 83 });
        for (const sim of [first, second]) {
            const [gun, target] = sim.fighters;
            gun.x = 280;
            gun.y = 320;
            target.x = 560;
            target.y = 420;
            gun.classicAbilityNextAt = 0;
            step(sim);
            let rounds = sim.classicEntities.filter(({ ownerId, kind }) => ownerId === gun.id && kind === profile.projectileKind);
            const initialRoundCount = type === "pistol" ? 1 : profile.count;
            assert.equal(rounds.length, initialRoundCount);
            if (type === "pistol") assert.equal(rounds[0].radius, 5, "Pistol bullets are 1.25x the prior radius");
            if (type === "shotgun") assert.ok(rounds.every(({ damage }) => damage === 4), "Shotgun shells deal four damage");
            assert.equal(gun.classicGunPhase, "firing");
            assert.equal(gun.classicGunShots, 1);
            assert.equal(gun.classicGunShotSequence, 1);
            assert.equal(gun.classicGunProjectileCount, initialRoundCount);
            assert.equal(gun.classicGunShotAngles.length, initialRoundCount);
            assert.ok(Math.abs(gun.classicGunFiringUntil - gun.classicGunStartedAt - 0.12) < 1e-9);
            if (type === "pistol") {
                assert.equal(gun.classicGunConsecutiveShot, 1);
                assert.equal(gun.classicGunConsecutiveCount, 2);
                assert.ok(Math.abs(gun.classicGunConsecutiveNextAt - gun.classicGunStartedAt - 0.1) < 1e-9);
                assert.ok(Math.abs(gun.classicGunReloadUntil - gun.classicGunStartedAt - 0.1) < 1e-9);
            } else {
                assert.equal(gun.classicGunConsecutiveShot, 1);
                assert.equal(gun.classicGunConsecutiveCount, 1);
                assert.ok(Math.abs(gun.classicGunReloadUntil - gun.classicGunFiringUntil - 0.2) < 1e-9);
            }
            assert.ok(rounds.every((round) => round.gunType === type && round.gunVolleySequence === 1));
            assert.ok(rounds.every((round) => round.maxWallBounces === profile.maxWallBounces));
            const fireEvent = sim.events.find(({ type: eventType, gunType }) => eventType === "classic-gun-fire" && gunType === type);
            assert.ok(fireEvent);
            const expectedBaseAngle = Math.atan2(target.y - gun.y, target.x - gun.x);
            assert.ok(Math.abs(fireEvent.aimAngle - expectedBaseAngle) < 1e-9);
            const baseAngle = fireEvent.aimAngle;
            rounds.forEach((round, index) => {
                const angle = Math.atan2(round.vy, round.vx);
                const expected = baseAngle + (index - (profile.count - 1) / 2) * profile.spread;
                assert.ok(Math.abs(angle - expected) < 1e-9, `${type} round ${index} must use its deterministic spread`);
            });
            assert.ok(sim.events.some(({ type: eventType, gunType, phase }) => eventType === "classic-gun-phase" && gunType === type && phase === "firing"));
            step(sim, 16);
            assert.ok(sim.events.some(({ type: eventType, gunType, phase }) => eventType === "classic-gun-phase" && gunType === type && phase === "reload"));
            if (type === "pistol") {
                rounds = sim.classicEntities.filter(({ ownerId, kind }) => ownerId === gun.id && kind === profile.projectileKind);
                assert.equal(rounds.length, 2, "Pistol fires two rounds after its short inter-shot pause");
                assert.ok(rounds.every(({ radius }) => radius === 5), "both Pistol bullets use the enlarged radius");
                assert.equal(gun.classicGunPhase, "firing");
                assert.equal(gun.classicGunConsecutiveShot, 2);
                assert.equal(gun.classicGunProjectileCount, 2);
                const fireEvents = sim.events.filter(({ type: eventType, gunType }) => eventType === "classic-gun-fire" && gunType === type);
                assert.equal(fireEvents.length, 2);
                assert.ok(fireEvents[1].time - fireEvents[0].time < 0.25, "Pistol's second round should arrive sooner than the old pause");
                assert.ok(fireEvents.every(({ shotCount, consecutiveCount }) => shotCount === 1 && consecutiveCount === 2));
                step(sim, 15);
                assert.equal(gun.classicGunPhase, "reload");
                step(sim, 24);
                assert.equal(gun.classicGunPhase, "ready");
            } else {
                assert.equal(gun.classicGunPhase, "reload");
                assert.ok(sim.events.some(({ type: eventType, gunType, shotCount }) => eventType === "classic-gun-fire" && gunType === type && shotCount === profile.count));
                step(sim, 24);
                assert.equal(gun.classicGunPhase, "ready");
            }
            assert.ok(sim.events.some(({ type: eventType, gunType, phase }) => eventType === "classic-gun-phase" && gunType === type && phase === "ready"));
        }
        assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second));
        assert.deepEqual(first.events, second.events);
    }
});

test("Shotgun and Draftmaster fire with deterministic backwards recoil", () => {
    for (const type of ["shotgun", "draftmaster"]) {
        const first = createSimulation({ classes: [type, "hydrogen-bomb"], seed: 841 });
        const second = createSimulation({ classes: [type, "hydrogen-bomb"], seed: 841 });
        for (const sim of [first, second]) {
            const [fighter, target] = sim.fighters;
            fighter.x = 300;
            fighter.y = 300;
            target.x = 600;
            target.y = 300;
            fighter.classicAbilityNextAt = 0;
            step(sim);
            const fireAngle = Math.atan2(target.y - fighter.y, target.x - fighter.x);
            const recoil = sim.events.find(({ type: eventType, weapon }) => (
                eventType === "classic-gun-recoil" && weapon === type
            ));
            assert.ok(recoil);
            assert.ok(Math.abs(Math.atan2(Math.sin(recoil.angle - fireAngle - Math.PI), Math.cos(recoil.angle - fireAngle - Math.PI))) < 1e-9);
            assert.ok(fighter.vx * Math.cos(fireAngle) + fighter.vy * Math.sin(fireAngle) < 0, type + " must launch backwards");
            assert.ok(Math.abs(Math.hypot(fighter.vx, fighter.vy) - fighter.baselineSpeed) < 1e-9);
            assert.equal(fighter.classicRecoilCount, 1);
            assert.equal(fighter.classicRecoilSpeed, fighter.baselineSpeed);
        }
        assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second));
        assert.deepEqual(first.events, second.events);
    }
});

test("Trident accelerates from a three-times launch, recalls visibly, and blocks duplicate throws", () => {
    const sim = createSimulation({ classes: ["trident", "hydrogen-bomb"], seed: 842 });
    const [tridentOwner] = sim.fighters;
    tridentOwner.classicAbilityNextAt = 0;
    step(sim);
    let trident = sim.classicEntities.find(({ kind }) => kind === "trident-ammo");
    assert.ok(trident);
    assert.equal(trident.phase, "outbound");
    assert.equal(trident.launchSpeed, tridentOwner.baselineSpeed * 3);
    assert.equal(trident.maxSpeed, tridentOwner.baselineSpeed * 6);
    assert.equal(trident.momentumAcceleration, tridentOwner.baselineSpeed * 2.1);
    assert.ok(trident.momentumSpeed > trident.launchSpeed);
    tridentOwner.classicAbilityNextAt = 0;
    step(sim);
    assert.equal(sim.classicEntities.filter(({ ownerId, kind }) => ownerId === tridentOwner.id && kind === "trident-ammo").length, 1);

    trident.x = sim.arenaBounds.x + trident.radius - 1;
    trident.y = sim.arenaBounds.y + sim.arenaBounds.height * 0.5;
    trident.vx = -trident.momentumSpeed;
    trident.vy = 0;
    step(sim);
    assert.equal(trident.phase, "stuck-wall");
    sim.time = trident.stickUntil;
    const xAtRecall = trident.x;
    step(sim);
    assert.equal(trident.phase, "returning");
    assert.equal(trident.recallVisual, "recalling");
    assert.ok(Number.isFinite(trident.recallStartedAt));
    assert.ok(trident.recallSpeed > 0);
    assert.ok(trident.recallProgress >= 0 && trident.recallProgress < 1);
    step(sim, 2);
    assert.ok(trident.x !== xAtRecall || trident.y !== trident.stuckPosition?.y, "recall must move the physical trident");
    assert.ok(sim.events.some(({ type, entityId }) => type === "classic-trident-recall" && entityId === trident.id));
    runSeconds(sim, 1);
    assert.equal(sim.classicEntities.some(({ id }) => id === trident.id), false);
    tridentOwner.classicAbilityNextAt = 0;
    step(sim);
    assert.equal(sim.classicEntities.filter(({ ownerId, kind }) => ownerId === tridentOwner.id && kind === "trident-ammo").length, 1);
});

test("Black Hole and Artist keep centered fighter health while abilities transform", () => {
    for (const type of ["black-hole", "artist"]) {
        const sim = createSimulation({ classes: [type, "hydrogen-bomb"], seed: 78 });
        const fighter = sim.fighters[0];
        fighter.health = 41;
        fighter.classicCoreHealth = 41;
        fighter.classicAbilityNextAt = 0;
        step(sim);
        assert.equal(fighter.health, 41);
        assert.equal(fighter.classicCoreHealth, 41);
        assert.equal(fighter.classicCoreMaxHealth, fighter.maxHealth);
        assert.notEqual(fighter.classicTransformState, "normal");
        if (type === "artist") {
            const drawing = sim.classicEntities.find(({ kind }) => kind === "artist-drawing");
            assert.ok(drawing);
            assert.equal(drawing.drawingDuration, 1.5);
            runSeconds(sim, 1.6);
            assert.equal(drawing.lifetime, 5);
            assert.ok(Math.abs(drawing.expiresAt - drawing.startedAt - 5) < 0.02);
            fighter.classicAbilityNextAt = Infinity;
            runSeconds(sim, 4.6);
            assert.equal(drawing.lifetimeState, "fading");
            assert.ok(drawing.opacity < 1 && drawing.opacity > 0);
            runSeconds(sim, 0.5);
            assert.equal(sim.classicEntities.some(({ id }) => id === drawing.id), false);
            assert.equal(fighter.classicTransformState, "core");
        }
    }
});

test("Classic balance values and action locks are applied to the live state", () => {
    assert.equal(CLASSIC_ORBS.shotgun.classicAbility.damage, 4);
    assert.equal(CLASSIC_ORBS.pistol.classicAbility.damage, 5);
    assert.equal(CLASSIC_ORBS.trapper.classicAbility.dps, 4);
    assert.equal(CLASSIC_ORBS.cutter.classicAbility.dps, 4);
    assert.equal(CLASSIC_ORBS.cutter.classicAbility.tickInterval, 0.5);
    assert.equal(CLASSIC_ORBS.lazer.classicAbility.dps, 2);
    assert.equal(CLASSIC_ORBS.blueSun?.classicAbility?.dps ?? CLASSIC_ORBS["blue-sun"].classicAbility.dps, 2);

    const sim = createSimulation({ classes: ["trapper", "pistol"], seed: 9101 });
    const [trapper, target] = sim.fighters;
    trapper.classicAbilityNextAt = 0;
    target.classicAbilityNextAt = Infinity;
    target.classicGunNextFireAt = Infinity;
    step(sim);
    const trap = sim.classicEntities.find(({ ownerId, kind }) => ownerId === trapper.id && kind === "trap");
    assert.ok(trap);
    runSeconds(sim, 0.8);
    target.x = trap.x;
    target.y = trap.y;
    target.vx = target.vy = 0;
    target.classicAbilityNextAt = sim.time;
    target.classicGunNextFireAt = sim.time;
    const shotsBefore = target.classicGunShots;
    step(sim);
    assert.equal(target.classicTrapLocked, true);
    assert.equal(target.classicTrapState, "tightening");
    assert.equal(target.classicGunShots, shotsBefore, "a trapped orb cannot start a gun ability");
    assert.equal(sim.events.some(({ type, fighterId }) => type === "classic-gun-fire" && fighterId === target.id), false);
});

test("Duplicator duplicates match Necromancer minion size and can receive damage", () => {
    const sim = createSimulation({ classes: ["duplicator", "necromancer"], seed: 9102 });
    const [duplicator, opponent] = sim.fighters;
    opponent.classicAbilityNextAt = Infinity;
    duplicator.vx = duplicator.vy = 0;
    for (let bounce = 0; bounce < 10; bounce += 1) {
        forceWallBounce(sim, duplicator, bounce % 2 === 0 ? "left" : "right");
    }
    const duplicate = sim.fighters.find(({ classicIsDuplicate }) => classicIsDuplicate);
    assert.ok(duplicate);
    assert.equal(duplicate.classicDuplicateSizeSource, "necromancer-minion");
    assert.equal(duplicate.radius, opponent.radius * 0.55);
    assert.equal(duplicate.classicDuplicateScale, duplicate.radius / duplicator.radius);
    assert.equal(duplicate.maxHealth, 50);
    assert.equal(duplicate.health, 50);
    duplicate.health = duplicate.maxHealth = 10;
    duplicate.classicCoreHealth = duplicate.classicCoreMaxHealth = 10;
    duplicate.stunUntil = Infinity;
    opponent.stunUntil = Infinity;
    const bullet = {
        id: "classic-test-duplicate-damage",
        kind: "pistol-ammo",
        ownerId: opponent.id,
        targetId: duplicate.id,
        x: duplicate.x,
        y: duplicate.y,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 5,
        bulletFamily: "pistol",
        bulletTier: 1,
        physical: true,
        solid: true,
        deflectable: true,
        expiresAt: sim.time + 1,
    };
    sim.classicEntities.push(bullet);
    step(sim);
    assert.equal(duplicate.health, 5);
    assert.equal(duplicate.alive, true);
});

test("Classic fighter and Orbital collision damage can hit Necromancer minions, and minion bodies can hit back", () => {
    const sim = createSimulation({ classes: ["duplicator", "necromancer"], seed: 9107 });
    const [duplicator, necromancer] = sim.fighters;
    const minion = {
        id: "classic-collision-test-necromancer-minion",
        kind: "necromancer-soldier",
        type: "necromancer-soldier",
        name: "NECROMANCER SOLDIER",
        ownerId: necromancer.id,
        classicTeamIndex: necromancer.classicTeamIndex,
        x: duplicator.x,
        y: duplicator.y,
        vx: 0,
        vy: 0,
        radius: 10,
        health: 10,
        maxHealth: 10,
        damage: 3,
        collisionDamage: 3,
        baselineSpeed: 1,
        physical: true,
        solid: true,
        collisionMode: "enemy-minion",
        alive: true,
        nextShotAt: Infinity,
        expiresAt: null,
    };
    sim.classicEntities.push(minion);
    duplicator.vx = duplicator.vy = 0;
    duplicator.stunUntil = Infinity;
    duplicator.classicCollisionDamageEnabled = true;
    duplicator.collisionLastHit = Object.create(null);
    duplicator.health = duplicator.maxHealth = 100;
    duplicator.classicCoreHealth = duplicator.classicCoreMaxHealth = 100;
    necromancer.x = sim.arenaBounds.x + sim.arenaBounds.width - necromancer.radius - 20;
    necromancer.y = sim.arenaBounds.y + sim.arenaBounds.height - necromancer.radius - 20;
    necromancer.vx = necromancer.vy = 0;
    step(sim);
    assert.equal(minion.health, 9, "Duplicator body collision should damage a Necromancer minion");
    assert.equal(duplicator.health, 97, "a Necromancer minion body should damage the colliding orb");
    assert.ok(sim.events.some(({ type, source, targetId }) => (
        type === "classic-minion-collision-hit" && source === "fighter-body" && targetId === minion.id
    )));
    assert.ok(sim.events.some(({ type, source, targetId }) => (
        type === "classic-minion-collision-hit" && source === "minion-body" && targetId === duplicator.id
    )));

    const orbitalSim = createSimulation({ classes: ["orbital", "necromancer"], seed: 9108 });
    const [orbital, orbitalNecromancer] = orbitalSim.fighters;
    const orbitalMinion = {
        ...minion,
        id: "classic-collision-test-orbital-minion",
        ownerId: orbitalNecromancer.id,
        classicTeamIndex: orbitalNecromancer.classicTeamIndex,
        x: orbital.x + orbital.radius * 1.92,
        y: orbital.y,
        health: 5,
        maxHealth: 5,
        collisionDamage: 0,
    };
    orbitalSim.classicEntities.push(orbitalMinion);
    orbital.classicOrbiters = 1;
    orbital.classicOrbitalRings = [{ ringIndex: 0, orbiterCount: 1, radiusScale: 1, rangeScale: 1 }];
    orbital.classicOrbitalRingCount = 1;
    orbital.stunUntil = Infinity;
    orbital.vx = orbital.vy = 0;
    orbitalNecromancer.x = sim.arenaBounds.x + sim.arenaBounds.width - orbitalNecromancer.radius - 20;
    orbitalNecromancer.y = sim.arenaBounds.y + sim.arenaBounds.height - orbitalNecromancer.radius - 20;
    step(orbitalSim);
    assert.equal(orbitalMinion.health, 4, "Orbital satellites should damage opposing Necromancer minions");
    assert.ok(orbitalSim.events.some(({ type, targetId }) => (
        type === "classic-orbital-hit" && targetId === orbitalMinion.id
    )));
});

test("Vampire latches do not remove Spikey triangles, and the full triangle is its hitbox", () => {
    const sim = createSimulation({ classes: ["vampire", "spikey"], seed: 9103 });
    const [vampire, spikey] = sim.fighters;
    forceWallBounce(sim, spikey, "left");
    const spike = sim.classicEntities.find(({ ownerId, kind }) => ownerId === spikey.id && kind === "spike");
    assert.ok(spike);
    assert.equal(spike.damageHitbox, "triangle");
    assert.equal(spike.spikeHitbox.baseA !== undefined, true);
    setVampireLatch(sim, vampire, spikey, 1);
    step(sim);
    assert.equal(sim.classicEntities.some(({ id }) => id === spike.id), true);
    assert.equal(spike.damageHitbox, "triangle");
    assert.equal(spikey.classicVampireLatchAttackSuppressed, true);
});

test("Trident recall deals twenty once and keeps returning instead of re-sticking", () => {
    const sim = createSimulation({ classes: ["trident", "hydrogen-bomb"], seed: 9104 });
    const [tridentOwner, target] = sim.fighters;
    tridentOwner.classicAbilityNextAt = 0;
    tridentOwner.stunUntil = target.stunUntil = Infinity;
    target.maxHealth = target.health = 1000;
    target.classicCoreHealth = target.classicCoreMaxHealth = 1000;
    step(sim);
    const trident = sim.classicEntities.find(({ ownerId, kind }) => ownerId === tridentOwner.id && kind === "trident-ammo");
    assert.ok(trident);
    trident.phase = "returning";
    trident.x = target.x;
    trident.y = target.y;
    trident.recallStartedAt = sim.time;
    trident.recallDistance = 1000;
    trident.recallSpeed = 100;
    trident.recallAcceleration = 0;
    trident.stickUntil = null;
    trident.stuckTargetId = null;
    sim.events = [];
    const healthBefore = target.health;
    step(sim);
    const callback = sim.events.find(({ type, entityId }) => type === "classic-trident-callback-hit" && entityId === trident.id);
    assert.ok(callback);
    assert.equal(callback.amount, 0, "callback telemetry must not create a second health marker");
    assert.equal(callback.resolvedDamage, 20);
    assert.equal(callback.visualDamage, false);
    assert.equal(callback.marker.damage, 0);
    assert.equal(target.health, healthBefore - 20);
    assert.equal(target.classicCoreHealth, target.health);
    assert.equal(
        sim.events.filter(({ type, targetId, entityId }) => (
            type === "classic-projectile-hit" && targetId === target.id && entityId === trident.id
        )).length,
        1,
        "a returning Trident should expose one visual damage transaction",
    );
    assert.equal(trident.phase, "returning");
    assert.equal(trident.stuckTargetId, null);
    assert.equal(sim.events.some(({ type, surface }) => type === "classic-trident-stick" && surface === "orb"), false);
    assert.deepEqual(trident.callbackHitTargetIds, [target.id]);
});

test("Orbital creates independent larger rings every three satellites", () => {
    const sim = createSimulation({ classes: ["orbital", "hydrogen-bomb"], seed: 9105 });
    const [orbital, target] = sim.fighters;
    target.x = sim.arenaBounds.x + target.radius;
    target.y = sim.arenaBounds.y + target.radius;
    target.stunUntil = Infinity;
    for (let bounce = 0; bounce < 7; bounce += 1) {
        forceWallBounce(sim, orbital, bounce % 2 === 0 ? "left" : "right");
    }
    assert.equal(orbital.classicOrbiters, 7);
    assert.equal(orbital.classicOrbitalRingCount, 3);
    assert.deepEqual(orbital.classicOrbitalRings.map(({ orbiterCount }) => orbiterCount), [3, 3, 1]);
    assert.ok(orbital.classicOrbitalRings[1].radiusScale > orbital.classicOrbitalRings[0].radiusScale);
    assert.ok(orbital.classicOrbitalRings[2].rangeScale > orbital.classicOrbitalRings[1].rangeScale);
    assert.ok(orbital.classicOrbitalRings[0].ringRadius < orbital.classicOrbitalRings[1].ringRadius);
    assert.ok(orbital.classicOrbitalRings[1].ringRadius < orbital.classicOrbitalRings[2].ringRadius);
    assert.deepEqual(
        orbital.classicOrbitalRings.map(({ ringIndex }) => ringIndex),
        [0, 1, 2],
        "each three-orb milestone must create a distinct concentric ring",
    );
});

test("Necromancer soldier gameplay radius matches its rendered owner-relative footprint", () => {
    const sim = createSimulation({ classes: ["necromancer", "hydrogen-bomb"], seed: 9106 });
    const necromancer = sim.fighters[0];
    necromancer.classicAbilityNextAt = 0;
    runSeconds(sim, 1.5);
    const soldier = sim.classicEntities.find(({ kind }) => kind === "necromancer-soldier");
    assert.ok(soldier);
    assert.equal(soldier.radius, necromancer.radius * 0.55);
    assert.equal(soldier.visualRadius, soldier.radius);
    assert.equal(soldier.hitboxRadius, soldier.radius);
    const target = sim.fighters[1];
    target.stunUntil = Infinity;
    target.x = soldier.x;
    target.y = soldier.y;
    target.vx = target.vy = 0;
    step(sim);
    assert.ok(
        sim.events.some(({ type, objectBId }) => type === "classic-minion-physical-bounce" && objectBId === soldier.id),
        "the physical minion collision should use the same visible body descriptor",
    );
});

test("Classic health is owned by each orb card and Hive uses large tracked bees", () => {
    const sim = createSimulation({
        classes: ["hydrogen-bomb", "hive-ball"],
        classicTeams: [["hydrogen-bomb"], ["hive-ball"]],
        classicTeamOptions: [
            { "hydrogen-bomb": { health: 1234, boss: true } },
            { "hive-ball": { health: 77 } },
        ],
        seed: 9107,
    });
    const [hydrogen, hive] = sim.fighters;
    assert.equal(hydrogen.maxHealth, 1234);
    assert.equal(hive.maxHealth, 77);
    assert.equal(hydrogen.classicBoss, true);
    hive.classicAbilityNextAt = 0;
    step(sim);
    const bee = sim.classicEntities.find(({ ownerId, kind }) => ownerId === hive.id && kind === "bee");
    assert.ok(bee);
    assert.equal(bee.damage, 3);
    assert.equal(bee.radius, 30, "Hive's generated large bee uses its rendered projectile footprint");
    assert.equal(bee.tracking, true);
});

test("Apple throws a deterministic projectile toward a seeded random in-arena destination", () => {
    const first = createSimulation({ classes: ["apple", "hydrogen-bomb"], seed: 9108 });
    const second = createSimulation({ classes: ["apple", "hydrogen-bomb"], seed: 9108 });
    first.fighters[0].classicAbilityNextAt = 0;
    second.fighters[0].classicAbilityNextAt = 0;
    step(first);
    step(second);
    const apple = first.classicEntities.find(({ ownerId, kind }) => ownerId === first.fighters[0].id && kind === "apple");
    const replayApple = second.classicEntities.find(({ ownerId, kind }) => ownerId === second.fighters[0].id && kind === "apple");
    assert.ok(apple && replayApple);
    assert.equal(apple.radius, 54, "Apple throws use a 1.5x enlargement over the current projectile radius");
    assert.ok(Math.abs(apple.expiresAt - apple.startedAt - 10) < 1e-9, "an Apple remains available for ten seconds");
    assert.ok(apple.arrivalAt - apple.startedAt <= 1.1 + 1e-9, "Apple throws stop at their sooner deterministic landing time");
    assert.equal(apple.arrived, false);
    assert.ok(apple.destinationX >= first.arenaBounds.x + apple.radius * 2);
    assert.ok(apple.destinationX <= first.arenaBounds.x + first.arenaBounds.width - apple.radius * 2);
    assert.ok(apple.destinationY >= first.arenaBounds.y + apple.radius * 2);
    assert.ok(apple.destinationY <= first.arenaBounds.y + first.arenaBounds.height - apple.radius * 2);
    assert.deepEqual(
        [apple.destinationX, apple.destinationY, apple.arrivalAt],
        [replayApple.destinationX, replayApple.destinationY, replayApple.arrivalAt],
    );

    const batmanSim = createSimulation({ classes: ["batman", "hydrogen-bomb"], seed: 9109 });
    batmanSim.fighters[0].classicAbilityNextAt = 0;
    step(batmanSim);
    const batarang = batmanSim.classicEntities.find(({ ownerId, kind }) => (
        ownerId === batmanSim.fighters[0].id && kind === "batarang"
    ));
    assert.ok(batarang);
    assert.equal(batarang.radius, 15, "Classic Batman projectiles are three times the old five-pixel radius");

    const lifetimeSim = createSimulation({ classes: ["apple", "hydrogen-bomb"], seed: 9110 });
    lifetimeSim.fighters[0].classicAbilityNextAt = 0;
    step(lifetimeSim);
    const persistentApple = lifetimeSim.classicEntities.find(({ kind }) => kind === "apple");
    assert.ok(persistentApple);
    persistentApple.arrived = true;
    persistentApple.collectionArmedAt = Infinity;
    persistentApple.expiresAt = persistentApple.startedAt + 10;
    runSeconds(lifetimeSim, 9.9);
    assert.equal(
        lifetimeSim.classicEntities.some(({ id }) => id === persistentApple.id),
        true,
        "an uncollected Apple remains until its ten-second lifetime expires",
    );
    runSeconds(lifetimeSim, 0.2);
    assert.equal(lifetimeSim.classicEntities.some(({ id }) => id === persistentApple.id), false);
});

test("Classic Apple disappears on contact and Apple-versus-Apple consumption resolves only one heal", () => {
    const appleVsApple = createSimulation({
        classes: ["apple", "apple"],
        classicTeams: [["apple"], ["apple"]],
        seed: 9111,
    });
    const [first, second] = appleVsApple.fighters;
    first.stunUntil = second.stunUntil = Infinity;
    first.classicAbilityNextAt = 0;
    second.classicAbilityNextAt = 0;
    step(appleVsApple);
    first.classicAbilityNextAt = second.classicAbilityNextAt = Infinity;
    second.health = 90;
    const thrown = appleVsApple.classicEntities.filter(({ kind }) => kind === "apple");
    assert.equal(thrown.length, 2);
    for (const entity of thrown) {
        entity.arrived = true;
        entity.collectionArmedAt = appleVsApple.time;
        entity.x = second.x;
        entity.y = second.y;
        entity.destinationX = entity.x;
        entity.destinationY = entity.y;
        entity.vx = entity.vy = 0;
    }
    step(appleVsApple);
    const appleEvents = appleVsApple.events.filter(({ type }) => type === "classic-apple-collected");
    const heals = appleVsApple.events.filter(({ type, fighterId }) => type === "classic-heal" && fighterId === second.id);
    assert.equal(heals.length, 1, "two simultaneous Apple contacts must not double-heal the same Apple orb");
    assert.equal(heals[0].amount, 3);
    assert.equal(second.health, 93);
    const appleHealEffects = appleVsApple.effects.filter(({ kind, pickupType }) => (
        kind === "world-cup-pickup" && pickupType === "green-energy-drink"
    ));
    assert.equal(appleHealEffects.length, 1, "Apple healing should reuse one World Cup-style heal burst");
    assert.equal(appleHealEffects[0].label, "+3 HP");
    assert.equal(appleEvents.reduce((sum, event) => sum + event.amount, 0), 3);
    assert.ok(appleEvents.every(({ interaction }) => ["apple-consumed", "duplicate-apple-contact"].includes(interaction)));
    assert.ok(appleEvents.every(({ targetId, collectorId }) => (
        targetId === null && collectorId === second.id
    )), "friendly Apple collection must not be exposed as a second damage-target marker");
    assert.equal(appleVsApple.classicEntities.some(({ kind }) => kind === "apple"), false);

    const cadenceSim = createSimulation({ classes: ["apple", "hydrogen-bomb"], seed: 9113 });
    cadenceSim.fighters[0].classicAbilityNextAt = 0;
    cadenceSim.fighters[1].stunUntil = Infinity;
    runSeconds(cadenceSim, 4.1);
    const appleSpawns = cadenceSim.events
        .filter(({ type, hazardKind }) => type === "classic-hazard-spawn" && hazardKind === "apple");
    assert.equal(CLASSIC_ORBS.apple.classicAbility.interval, 2);
    assert.ok(appleSpawns.length >= 3, "Apple should throw on the two-second cadence");
    assert.ok(appleSpawns.slice(1).every((event, index) => (
        Math.abs(event.time - appleSpawns[index].time - 2) <= STEP * 1.1
    )));

    const appleVsOpponent = createSimulation({ classes: ["apple", "hydrogen-bomb"], seed: 9112 });
    const [appleOwner, opponent] = appleVsOpponent.fighters;
    appleOwner.stunUntil = opponent.stunUntil = Infinity;
    appleOwner.classicAbilityNextAt = 0;
    step(appleVsOpponent);
    appleOwner.classicAbilityNextAt = Infinity;
    const projectile = appleVsOpponent.classicEntities.find(({ kind }) => kind === "apple");
    assert.ok(projectile);
    projectile.arrived = true;
    projectile.collectionArmedAt = appleVsOpponent.time;
    projectile.x = opponent.x;
    projectile.y = opponent.y;
    projectile.destinationX = projectile.x;
    projectile.destinationY = projectile.y;
    projectile.vx = projectile.vy = 0;
    const healthBefore = opponent.health;
    step(appleVsOpponent);
    assert.equal(opponent.health, healthBefore - 5);
    assert.equal(appleVsOpponent.classicEntities.some(({ id }) => id === projectile.id), false);
    const opponentHit = appleVsOpponent.events.find(({ type, entityId }) => (
        type === "classic-apple-collected" && entityId === projectile.id
    ));
    assert.equal(opponentHit.interaction, "opponent-hit");
    assert.equal(opponentHit.disappeared, true);
});

test("Hive and Apple generated asset manifest keeps attack/body roles explicit", () => {
    const manifestUrl = new URL("../assets/generated/classic-hive-apple-20260811-v1/manifest.json", import.meta.url);
    const manifest = JSON.parse(readFileSync(manifestUrl, "utf8"));
    const bee = manifest.assets.find(({ id }) => id === "hive-bee-projectile");
    const apple = manifest.assets.find(({ id }) => id === "apple-projectile");
    const rejectedHiveBody = manifest.assets.find(({ id }) => id === "hive-orb-rejected-body");
    assert.ok(bee && apple && rejectedHiveBody);
    assert.equal(bee.runtime, "src/renderer.js:CLASSIC_PRESENTATION_SPRITES.hiveBee");
    assert.equal(apple.runtime, "src/renderer.js:CLASSIC_PRESENTATION_SPRITES.appleProjectile");
    assert.equal(rejectedHiveBody.runtime, null);
    for (const asset of [bee, apple, rejectedHiveBody]) {
        const finalUrl = new URL(`../assets/generated/classic-hive-apple-20260811-v1/${asset.final.replace(/^.*?\//, "final/")}`, import.meta.url);
        assert.ok(existsSync(finalUrl), `${asset.id} final should exist`);
    }
});

test("Every Classic stable ID can launch a finite seeded simulation without a no-op state failure", () => {
    for (const [index, id] of CLASSIC_ORB_IDS.entries()) {
        const opponent = id === "hydrogen-bomb" ? "sword" : "hydrogen-bomb";
        const first = createSimulation({ classes: [id, opponent], seed: 800 + index });
        const second = createSimulation({ classes: [id, opponent], seed: 800 + index });
        step(first, 8);
        step(second, 8);
        assert.equal(first.fighters[0].type, id);
        assert.ok(first.fighters.every(({ x, y, vx, vy, health }) => [x, y, vx, vy, health].every(Number.isFinite)), id);
        assert.deepEqual(captureReplayFrame(first), captureReplayFrame(second), id);
        assert.deepEqual(first.events, second.events, `${id} seeded events`);
    }
});
