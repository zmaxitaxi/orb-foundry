import assert from "node:assert/strict";
import test from "node:test";
import { samplePlanForEvent, soundPlanForEvent } from "../src/audio.js";
import { CLASSIC_ORB_IDS } from "../src/classic-orbs.js";
import {
    CLASSIC_SIGNATURES,
    classicSignatureEffectFor,
    classicSignatureFor,
} from "../src/classic-signatures.js";
import { captureReplayFrame, createSimulation, stepSimulation } from "../src/simulation.js";

const STEP = 1 / 120;
const DEMO_CUE = Object.freeze({
    sword: "edge-sweep",
    duplicator: "bud",
    orbital: "satellite-pop",
    unarmed: "knuckle-hit",
    slammy: "fault-break",
    vampire: "fang-latch",
    turret: "sentry-deploy",
    flash: "speed-break",
    reactor: "core-contact",
    sniper: "needle-shot",
    draftmaster: "arsenal-fire",
    "blue-sun": "corona-open",
    "black-hole": "horizon-form",
    tripwire: "wire-tripped",
    "hydrogen-bomb": "fuse-blast",
    necromancer: "muster-rise",
    poison: "venom-bloom",
    spikey: "nail-set",
    snake: "scale-shed",
    virus: "virus-spread",
    shrapnel: "splinter-volley",
    cobwebs: "silk-cast",
    apple: "orchard-toss",
    absorber: "prism-intake",
    batman: "wing-release",
    "ying-yang": "temper-turn",
    trapper: "knot-cinch",
    "hive-ball": "honeycomb-open",
    zeus: "tribunal-cast",
    "glass-ball": "glass-break",
    pistol: "tap-fire",
    shotgun: "scatter-fire",
    rifle: "round-cadence",
    sawball: "tooth-bite",
    cutter: "redline-shear",
    trident: "tide-pin",
    lazer: "trace-seal",
    charger: "phase-crash",
    parasites: "burrow-clamp",
    grappler: "winch-fire",
    train: "express-engine",
    jackpot: "reel-win",
    boxer: "corner-hit",
    artist: "brush-splash",
    monster: "stonejaw-crush",
    fairy: "wand-launch",
    commander: "drone-missile",
});

function duel(fighter, opponent = fighter === "unarmed" ? "slammy" : "unarmed") {
    return createSimulation({
        gameplayMode: "classic",
        classicTeams: [[fighter], [opponent]],
        classicTeamOptions: [
            { [fighter]: { health: 3000 } },
            { [opponent]: { health: 3000, collisionDamage: false } },
        ],
        seed: 2406,
    });
}

test("every original Classic fighter has a named live cue and a playable signature sound", () => {
    const originalRoster = CLASSIC_ORB_IDS.slice(0, CLASSIC_ORB_IDS.indexOf("commander") + 1)
        .filter((id) => id !== "frost-ball");
    assert.deepEqual(Object.keys(CLASSIC_SIGNATURES), originalRoster);
    assert.equal(new Set(Object.values(CLASSIC_SIGNATURES).map((item) => item.name)).size, 47);

    for (const id of originalRoster) {
        const sim = duel(id);
        let effect = null;
        let sound = null;
        let cursor = sim.nextEventId;
        const seconds = id === "hydrogen-bomb" ? 62 : 33;
        for (let step = 0; step < seconds / STEP && !sim.finished && (!effect || !sound); step += 1) {
            stepSimulation(sim, STEP);
            for (let i = sim.events.length - 1; i >= 0 && sim.events[i].id >= cursor; i -= 1) {
                const event = sim.events[i];
                if (event.fighterType !== id) continue;
                const move = classicSignatureFor(event);
                if (move?.cue === DEMO_CUE[id]) {
                    effect = sim.effects.find((item) => item.eventId === event.id && item.cue === move.cue);
                }
                if (move || (id === "flash" && event.abilityKind === "flash")) {
                    sound ||= samplePlanForEvent(event) || soundPlanForEvent(event);
                }
            }
            cursor = sim.nextEventId;
        }
        assert.ok(effect, `${id} should show its ${DEMO_CUE[id]} cue in a live fight`);
        assert.ok(Number.isFinite(effect.x) && Number.isFinite(effect.y), `${id} should anchor the cue in world space`);
        assert.ok(sound?.sample || sound?.layers?.length || sound?.noises?.length, `${id} should have a playable cue`);
    }
});

test("seeded Signature replay preserves real wall contacts and the actual completed hazard geometry", () => {
    function run() {
        const sim = duel("tripwire", "rifle");
        let sealed;
        let ricochet;
        for (let index = 0; index < 18 / STEP && (!sealed || !ricochet); index += 1) {
            stepSimulation(sim, STEP);
            for (const effect of sim.effects) {
                if (!sealed && effect.cue === "wire-set" && !effect.live) {
                    const event = sim.events.find((item) => item.id === effect.eventId);
                    const segment = event.completedSegment;
                    assert.deepEqual([effect.x, effect.y, effect.x2, effect.y2], [segment.x1, segment.y1, segment.x2, segment.y2]);
                    sealed = { effect, time: sim.time };
                } else if (!ricochet && effect.cue === "round-ricochet") {
                    const event = sim.events.find((item) => item.id === effect.eventId);
                    assert.ok(event.bounceNumber <= event.maxWallBounces, "an expired round cannot leave a ricochet cue");
                    assert.deepEqual([effect.x, effect.y, effect.angle], [event.x, event.y, event.angle]);
                    ricochet = { effect, time: sim.time };
                } else continue;

                const captured = captureReplayFrame(sim).effects.find((item) => item.eventId === effect.eventId && item.kind === "classic-signature");
                assert.notEqual(captured, effect);
                assert.deepEqual(captured.x, effect.x);
                assert.deepEqual(captured.y, effect.y);
                assert.deepEqual(captured.life, effect.life);
            }
        }
        assert.ok(sealed);
        assert.ok(ricochet);
        return {
            sealed,
            ricochet,
            fighters: sim.fighters.map(({ id, health, x, y }) => ({ id, health, x, y })),
        };
    }

    assert.deepEqual(run(), run());
});

test("signature recipes skip generic rebounds and avoid duplicate or false impact cues", () => {
    assert.equal(classicSignatureFor({ gameplayMode: "classic", type: "wall-hit", fighterType: "shrapnel" }), null);
    assert.equal(classicSignatureFor({ gameplayMode: "orb-race", type: "classic-bounce-damage", fighterType: "slammy" }), null);
    assert.equal(classicSignatureFor({ gameplayMode: "classic", type: "classic-ability-start", targetType: "poison" }), null);
    assert.equal(classicSignatureFor({
        gameplayMode: "classic", type: "classic-ability-start", fighterType: "poison", abilityKind: "contact-dot", targetId: "opponent",
    }), null, "an idle ability timer must not put poison on an unhit orb");

    const stoppedShot = { gameplayMode: "classic", type: "classic-projectile-hit", fighterType: "pistol", projectileKind: "pistol-ammo", amount: 0, x: 40, y: 60 };
    assert.equal(classicSignatureEffectFor(stoppedShot), null);
    assert.equal(soundPlanForEvent(stoppedShot), null);
    assert.equal(samplePlanForEvent(stoppedShot), null);

    const groupedFragment = { gameplayMode: "classic", type: "classic-projectile-fired", fighterType: "shrapnel", projectileKind: "shrapnel" };
    assert.equal(samplePlanForEvent(groupedFragment), null);
    assert.equal(soundPlanForEvent(groupedFragment), null);

    const strongShot = { gameplayMode: "classic", type: "classic-projectile-fired", sourceType: "commander", projectileKind: "commander-round", damage: 5, id: 2 };
    const scoutShot = { ...strongShot, damage: 2 };
    assert.notEqual(soundPlanForEvent(strongShot).signature, soundPlanForEvent(scoutShot).signature);
    assert.notDeepEqual(soundPlanForEvent(strongShot).layers, soundPlanForEvent(scoutShot).layers);
    const finish = { ...strongShot, type: "classic-projectile-hit", projectileDamage: 5, amount: 1 };
    assert.equal(classicSignatureFor(finish)?.cue, "drone-missile-hit", "overkill still uses the heavy missile effect");
});
