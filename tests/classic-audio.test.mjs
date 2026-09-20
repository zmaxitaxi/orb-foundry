import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import test from "node:test";
import {
    ANNOUNCER_NAMES,
    CLASSIC_AUDIO_POLICY,
    INTRO_ANNOUNCER_ASSETS,
    RACE_GENERATED_ANNOUNCER_ASSETS,
    SAMPLE_ASSETS,
    announcerIntroSequence,
    classicTeamAnnouncerIntroSequence,
    samplePlanForEvent,
    soundPlanForEvent,
} from "../src/audio.js";

const CLASSIC_IDS = Object.freeze([
    "sword",
    "duplicator",
    "orbital",
    "unarmed",
    "slammy",
    "vampire", "turret", "flash", "reactor", "sniper", "draftmaster", "blue-sun", "black-hole",
    "tripwire", "hydrogen-bomb", "necromancer", "poison", "spikey", "snake", "virus", "shrapnel",
    "cobwebs", "apple", "absorber", "batman", "ying-yang", "trapper", "hive-ball", "zeus",
    "glass-ball", "pistol", "shotgun", "rifle", "sawball", "cutter", "trident", "lazer", "charger",
    "parasites", "grappler", "train", "frost-ball", "jackpot", "boxer", "artist", "monster", "fairy",
    "commander",
]);

test("Classic announcer registry covers the launch roster with valid generated or verified clips", () => {
    assert.deepEqual(Object.keys(ANNOUNCER_NAMES), CLASSIC_IDS);
    assert.equal(ANNOUNCER_NAMES["frost-ball"], "Snowball", "Classic Frost's public name should be Snowball");
    assert.equal(
        INTRO_ANNOUNCER_ASSETS["intro-frost-ball"],
        RACE_GENERATED_ANNOUNCER_ASSETS["intro-race-snowball"],
        "Snowball should use the Orb Racer Snowball announcer clip",
    );
    for (const [cue, relativePath] of Object.entries(INTRO_ANNOUNCER_ASSETS)) {
        const url = new URL(`../assets/audio/announcer/${relativePath}`, import.meta.url);
        assert.ok(existsSync(url), `${cue} should only reference an existing Race announcement`);
        assert.ok(statSync(url).size > 4096, `${cue} should contain decoded audio frames`);
    }
    assert.equal(INTRO_ANNOUNCER_ASSETS["intro-vampire"], RACE_GENERATED_ANNOUNCER_ASSETS["intro-race-vampire"]);
    assert.equal(INTRO_ANNOUNCER_ASSETS["intro-absorber"], RACE_GENERATED_ANNOUNCER_ASSETS["intro-race-roulette"]);
    assert.equal(INTRO_ANNOUNCER_ASSETS["intro-parasites"], "generated-classic-overhaul/classic-parasites.mp3");
    assert.equal(INTRO_ANNOUNCER_ASSETS["intro-sawball"], "generated-classic-overhaul/classic-sawball.mp3");
    assert.equal(INTRO_ANNOUNCER_ASSETS["intro-trapper"], "generated-classic-overhaul/classic-cowboy.mp3");
});

test("Classic matchup announcement retains Pick Your Winner", () => {
    assert.deepEqual(announcerIntroSequence("vampire", "trapper"), [
        "intro-vampire",
        "race-versus",
        "intro-trapper",
        "race-pick-your-winner",
    ]);
});

test("Classic team announcements use Orb Race plus, category, and everyone splicing", () => {
    assert.deepEqual(classicTeamAnnouncerIntroSequence(
        { orbIds: ["sword", "turret"], options: {} },
        { orbIds: ["orbital"], options: {} },
    ), [
        "intro-sword",
        "race-plus",
        "intro-turret",
        "race-versus",
        "intro-orbital",
        "race-pick-your-winner",
    ]);
    assert.deepEqual(classicTeamAnnouncerIntroSequence(
        { orbIds: ["sword", "turret", "reactor"], options: {} },
        { orbIds: ["orbital"], options: {} },
    ), [
        "intro-race-group-weapon",
        "race-versus",
        "intro-orbital",
        "race-pick-your-winner",
    ]);
    assert.deepEqual(classicTeamAnnouncerIntroSequence(
        { orbIds: ["sword", "flash", "duplicator", "jackpot"], options: {} },
        { orbIds: ["orbital"], options: {} },
    ), [
        "intro-race-everyone",
        "race-versus",
        "intro-orbital",
        "race-pick-your-winner",
    ]);
    for (const cue of [
        "race-plus",
        "intro-race-group-weapon",
        "intro-race-everyone",
        "race-versus",
        "race-pick-your-winner",
    ]) {
        assert.ok(RACE_GENERATED_ANNOUNCER_ASSETS[cue], `${cue} should reuse an existing exact audio clip`);
    }
    assert.deepEqual(classicTeamAnnouncerIntroSequence(
        { orbIds: ["hydrogen-bomb"], options: { "hydrogen-bomb": { boss: true } } },
        { orbIds: ["hive-ball"], options: {} },
    ), [
        "intro-hydrogen-bomb",
        "race-boss",
        "race-versus",
        "intro-hive-ball",
        "race-pick-your-winner",
    ]);
    assert.equal(RACE_GENERATED_ANNOUNCER_ASSETS["race-boss"], "generated-race/race-boss.mp3");
    assert.notEqual(RACE_GENERATED_ANNOUNCER_ASSETS["race-boss"], RACE_GENERATED_ANNOUNCER_ASSETS["race-buffed"]);
});

test("Classic combat mix routes launch effects and the Race end cue", () => {
    assert.equal(CLASSIC_AUDIO_POLICY.replacementSamples["weapon-clash"], "weapon-clash");
    assert.equal(
        soundPlanForEvent({ type: "weapon-clash", gameplayMode: "classic", id: 98 }),
        null,
        "Classic replacement cues should not layer synthesized fallback audio",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-critical", gameplayMode: "classic", fighterType: "boxer", id: 1 }).sample,
        "critical-hit",
        "Classic double-fist criticals should use the critical hit sample",
    );
    const mutedEventTypes = [
        "classic-bow-fired",
        "classic-potion-thrown",
        "classic-potion-buff",
        "classic-potion-triangle-spawn",
        "classic-slice-scheduled",
        "classic-duplicate",
        "classic-orbital-growth",
        "classic-growth",
    ];
    const signatures = mutedEventTypes.map((type, index) => {
        const plan = soundPlanForEvent({ type, gameplayMode: "classic", id: index + 1 });
        assert.equal(plan, null, `${type} should be muted until its replacement sample is installed`);
        return plan;
    });
    assert.equal(new Set(signatures).size, 1);
    assert.equal(
        samplePlanForEvent({ type: "weapon-clash", gameplayMode: "classic", id: 99 }).sample,
        "weapon-clash",
    );
    assert.equal(samplePlanForEvent({ type: "knockout", gameplayMode: "classic", id: 100 }).sample, "world-cup-ko");
    assert.equal(
        samplePlanForEvent({ type: "classic-hydrogen-bomb-countdown-start", gameplayMode: "classic", fighterType: "hydrogen-bomb", id: 100.5 }).sample,
        "hydrogen-bomb-siren",
        "Classic Hydrogen Bomb should start the same looping siren as Orb Race",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-hydrogen-bomb-countdown-start", gameplayMode: "classic", fighterType: "hydrogen-bomb", id: 100.6 }).loop,
        true,
    );
    assert.equal(samplePlanForEvent({ type: "classic-hydrogen-detonate", gameplayMode: "classic", id: 101 }).sample, "hydrogen-bomb-explosion");
    assert.equal(
        samplePlanForEvent({ type: "classic-hydrogen-bomb-flash-start", gameplayMode: "classic", fighterType: "hydrogen-bomb", id: 101.5 }).sample,
        "hydrogen-bomb-ear-ringing",
        "Classic Hydrogen Bomb should retain the post-detonation ear-ringing cue",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-heal", gameplayMode: "classic", id: 102 }),
        null,
        "Classic healing should not fall back to Forge pickup audio",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-ability-start", gameplayMode: "classic", fighterType: "trident", id: 102.1 }),
        null,
        "Classic Trident should not use Forge pickup audio",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-ability-start", gameplayMode: "classic", fighterType: "pistol", id: 102.2 }),
        null,
        "Classic gun starts should not use Forge pickup audio",
    );
    assert.equal(samplePlanForEvent({ type: "classic-ability-start", gameplayMode: "classic", fighterType: "flash", id: 103 }).sample, "race-thunder");
    assert.equal(
        samplePlanForEvent({ type: "classic-freeze", gameplayMode: "classic", fighterType: "frost-ball", id: 103.1 }).sample,
        "classic-snowball-freeze",
        "Snowball should play the supplied freeze cue when an opponent becomes frozen",
    );
    for (const type of ["classic-ability-start", "classic-hazard-spawn", "classic-dot-tick", "classic-bounce-damage"]) {
        assert.equal(
            samplePlanForEvent({ type, gameplayMode: "classic", fighterType: "frost-ball", id: `frost-${type}` }),
            null,
            `${type} should not trigger the old hammer/bounce cue for Frost`,
        );
    }
    assert.equal(
        samplePlanForEvent({ type: "classic-apple-collected", gameplayMode: "classic", fighterType: "apple", friendly: true, id: 103.2 }).sample,
        "forge-item-pickup",
        "Apple pickup by its owner should use the Forge pickup cue",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-apple-collected", gameplayMode: "classic", fighterType: "apple", friendly: false, id: 103.3 }).sample,
        "cinder-burn-tick",
        "Apple pickup by an opponent should use the poison/burn cue",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-zeus-thunder", gameplayMode: "classic", fighterType: "zeus", id: 103.4 }).sample,
        "race-thunder",
        "One Zeus cast should use one long thunder sample",
    );
    assert.equal(samplePlanForEvent({ type: "classic-projectile-fired", gameplayMode: "classic", fighterType: "shotgun", id: 104 }).sample, "race-draft-shotgun-fire");
    assert.equal(
        samplePlanForEvent({ type: "classic-projectile-fired", gameplayMode: "classic", fighterType: "trident", id: 104.5 }).sample,
        "classic-trident-throw",
        "Trident throws should use the supplied swing/whoosh sample",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-trident-recall", gameplayMode: "classic", fighterType: "trident", id: 104.51 }).sample,
        "classic-trident-recall",
        "Trident recall should use the reversed throw clip",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-projectile-hit", gameplayMode: "classic", projectileKind: "saw", id: 104.52 }).sample,
        "weapon-hit",
        "Sawball blade contact should use the sword-hit sample",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-slice-hit", gameplayMode: "classic", fighterType: "sword", id: 104.53 }).sample,
        "weapon-hit",
        "Sword slices should use the dedicated sword-hit sample",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-draftmaster-sword-hit", gameplayMode: "classic", fighterType: "draftmaster", id: 104.54 }).sample,
        "weapon-hit",
        "Draftmaster sword contact should use the dedicated sword-hit sample",
    );
    const trapperThrowPlan = samplePlanForEvent({ type: "classic-trapper-throw", gameplayMode: "classic", fighterType: "trapper", id: 104.55 });
    assert.equal(trapperThrowPlan.sample, "classic-trapper-throw", "each Trapper lasso throw should use the supplied yeehaw clip");
    assert.equal(trapperThrowPlan.offset, 1.5, "Trapper throws should begin at the Yeehaw onset instead of the clip intro");
    assert.equal(
        samplePlanForEvent({ type: "classic-trapper-caught", gameplayMode: "classic", fighterType: "trapper", targetType: "unarmed", id: 104.56 }).sample,
        "classic-trapper-caught",
        "a lasso catch should use the supplied whip-crack clip",
    );
    const tridentThrow = new URL("../assets/audio/effects/classic-trident-throw.mp3", import.meta.url);
    assert.ok(existsSync(tridentThrow));
    assert.ok(statSync(tridentThrow).size > 4096);
    const tridentRecall = new URL("../assets/audio/effects/classic-trident-recall.mp3", import.meta.url);
    assert.ok(existsSync(tridentRecall));
    assert.ok(statSync(tridentRecall).size > 3000);
    for (const sampleId of [
        "classic-boxer-punch",
        "classic-vampire-hiss",
        "classic-necromancer-summon",
        "classic-trapper-throw",
        "classic-trapper-caught",
        "classic-trident-recall",
        "classic-snowball-freeze",
    ]) {
        const samplePath = new URL(`../assets/audio/effects/${SAMPLE_ASSETS[sampleId]}`, import.meta.url);
        assert.ok(existsSync(samplePath), `${sampleId} should have a runtime sample`);
        assert.ok(statSync(samplePath).size > 4096, `${sampleId} should contain decoded audio frames`);
    }
    assert.equal(CLASSIC_AUDIO_POLICY.replacementSamples.impact, "orb-collision");
    assert.equal(CLASSIC_AUDIO_POLICY.replacementSamples["wall-hit"], "orb-collision");
    assert.equal(
        samplePlanForEvent({ type: "impact", gameplayMode: "classic", id: 104.6 }).sample,
        "orb-collision",
        "Classic orb-to-orb rebounds should use the bounce sample",
    );
    assert.equal(
        samplePlanForEvent({ type: "wall-hit", gameplayMode: "classic", id: 104.7 }).sample,
        "orb-collision",
        "Classic wall rebounds should use the bounce sample",
    );
    const damageEvents = [
        { type: "classic-body-hit", fighterType: "unarmed" },
        { type: "classic-slam", fighterType: "slammy" },
        { type: "classic-bow-hit", fighterType: "necromancer" },
        { type: "classic-potion-hit", fighterType: "potion" },
        { type: "classic-slice-hit", fighterType: "unarmed" },
        { type: "classic-orbital-hit", fighterType: "orbital" },
        { type: "classic-punch-hit", fighterType: "boxer" },
        { type: "classic-draftmaster-sword-hit", fighterType: "draftmaster", expectedSample: "weapon-hit" },
        { type: "classic-blue-sun-hit", fighterType: "blue-sun" },
        { type: "classic-projectile-hit", fighterType: "black-hole", projectileKind: "parasite" },
        { type: "classic-dot-tick", fighterType: "parasites", dotKind: "parasite" },
        { type: "classic-dot-tick", fighterType: "virus", dotKind: "virus" },
        { type: "classic-minion-hit", fighterType: "necromancer" },
    ];
    damageEvents.forEach((event, index) => {
        assert.equal(
            samplePlanForEvent({ ...event, gameplayMode: "classic", id: 105 + index })?.sample,
            event.expectedSample || "orb-collision",
            `${event.type} should use the shared orb-collision damage cue`,
        );
    });
    assert.equal(samplePlanForEvent({ type: "classic-ability-start", gameplayMode: "classic", fighterType: "boxer", id: 105 }).sample, "classic-boxer-punch");
    assert.equal(samplePlanForEvent({ type: "classic-ability-start", gameplayMode: "classic", fighterType: "vampire", abilityKind: "vampire", latchPhase: "latched", latched: true, id: 105.5 }).sample, "classic-vampire-hiss");
    assert.equal(samplePlanForEvent({ type: "classic-ability-start", gameplayMode: "classic", fighterType: "vampire", abilityKind: "vampire", latchPhase: "approach", latched: false, id: 105.6 }), null, "Vampire hiss should only play after the latch state is entered");
    const vampireTickPlan = samplePlanForEvent({ type: "classic-dot-tick", gameplayMode: "classic", fighterType: "vampire", dotKind: "vampire-latch", amount: 3, tick: 4, id: 105.65 });
    assert.equal(vampireTickPlan.sample, "classic-vampire-hiss", "Every Vampire drain tick should replay the latch hiss");
    assert.equal(vampireTickPlan.rateLimit, 0, "Vampire drain ticks should not be suppressed by the audio rate limiter");
    const trapTickPlan = samplePlanForEvent({ type: "classic-dot-tick", gameplayMode: "classic", fighterType: "trapper", dotKind: "trap", amount: 3, tick: 1, id: 105.7 });
    assert.equal(trapTickPlan.sample, "classic-trapper-caught", "Every lasso damage tick should replay the supplied whip-crack cue");
    assert.equal(trapTickPlan.rateLimit, 0, "Lasso damage ticks should not be suppressed by the audio rate limiter");
    assert.equal(samplePlanForEvent({ type: "classic-ability-start", gameplayMode: "classic", fighterType: "blue-sun", id: 105.75 }).sample, "black-hole-impact");
    const reactorPlan = samplePlanForEvent({ type: "classic-ability-start", gameplayMode: "classic", fighterType: "reactor", id: 105.8 });
    assert.equal(reactorPlan.sample, "black-hole-impact");
    assert.equal(reactorPlan.maxDuration, 4.73, "Classic Reactor should use the complete impact sample");
    assert.equal(
        samplePlanForEvent({ type: "classic-ability-start", gameplayMode: "classic", fighterType: "necromancer", abilityKind: "summon", id: 106 }).sample,
        "classic-necromancer-summon",
        "the supplied spell clip should play only when the Necromancer skull-lift summon starts",
    );
    assert.equal(
        samplePlanForEvent({ type: "classic-ability-start", gameplayMode: "classic", fighterType: "necromancer", abilityKind: "other", id: 106.1 }),
        null,
        "Necromancer should not layer a generic magic cue over non-summon events",
    );
    assert.equal(samplePlanForEvent({ type: "classic-projectile-fired", gameplayMode: "classic", fighterType: "necromancer", projectileKind: "necromancer-arrow", id: 107 }), null, "Necromancer minion arrow releases should be silent");
    assert.equal(samplePlanForEvent({ type: "classic-minion-hit", gameplayMode: "classic", fighterType: "necromancer", id: 108 }).sample, "orb-collision");
});
