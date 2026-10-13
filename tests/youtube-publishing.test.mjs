import test from "node:test";
import assert from "node:assert/strict";
import {
    YOUTUBE_CONFIG_PATH,
    dueYouTubeSlotsAt,
    loadYouTubePublishingConfig,
    localDateKey,
    localScheduleSlotsAt,
    scheduledPublishAt,
    youtubeDescription,
    youtubeMetadata,
    youtubeTitle,
    validateYouTubePublishingConfig,
    validateYouTubeGenerationSpec,
    validateYouTubeExportArtifact,
} from "../scripts/youtube-publishing.mjs";
import {
    buildYouTubePublishPlan,
    buildDailyYouTubePlans,
    planningSpawnedEntityCount,
    dailyYouTubeRosterForDate,
    publishDueYouTubeSlots,
    selectYouTubeMatchup,
} from "../scripts/youtube-publish.mjs";
import { ORB_RACERS } from "../src/orb-race.js";

test("YouTube publishing contract loads with two daily long-form slots", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    assert.equal(config.timeZone, "America/Los_Angeles");
    assert.deepEqual(config.schedule.map(({ id, contentType, localTime }) => ({ id, contentType, localTime })), [
        { id: "noon-longform", contentType: "longform", localTime: "12:00" },
        { id: "afternoon-longform", contentType: "longform", localTime: "15:00" },
    ]);
    assert.equal(config.delivery.requireApproval, false);
    assert.equal(config.descriptionTemplate, "Who will break the {layerHealth} HP layer first, {left} or {right}?");
    assert.equal(config.quality.maximumShortLayers, 3);
    assert.ok(config.quality.layerStrengths.short.length <= config.quality.maximumShortLayers);
    assert.deepEqual(config.quality.announcer, {
        required: true,
        spokenCueRequired: true,
        splitOnlyWhenSplit: true,
    });
    assert.equal(config.rosterSource.channelName, "OrbBattlegroundsSimulator");
    assert.equal(config.rosterSource.channelUrl, "https://www.youtube.com/@OrbBattlegroundSimulator");
    assert.ok(config.videoReady.orbRace.orbs.includes("hydrogen-bomb"));
    assert.ok(config.videoReady.orbRace.groups.includes("EVERYONE"));
    assert.deepEqual(config.videoReady.orbFoundry.orbs, []);
    assert.throws(() => validateYouTubePublishingConfig({
        ...config,
        schedule: [...config.schedule, { id: "extra-short", contentType: "short", localTime: "18:00" }],
    }), /long-form slots at 12:00 PM and 3:00 PM Pacific/);
});

test("YouTube metadata uses the approved VS title and hashtags", () => {
    assert.equal(youtubeTitle("DUPLICATOR", "ORBITAL"), "Duplicator VS Orbital");
    assert.equal(
        youtubeTitle(ORB_RACERS["purple-sun"].name, ORB_RACERS["blue-sun"].name),
        "Purple Sun VS Blue Sun",
        "Purple Sun's YouTube title should be Purple Sun",
    );
    assert.deepEqual(youtubeMetadata({ left: "MATH ORBS", right: "WEAPON ORBS", layerHealth: 750 }), {
        title: "Math Orbs VS Weapon Orbs",
        description: "Who will break the 750 HP layer first, Math Orbs or Weapon Orbs?\n\n#physics #shorts #simulation #satisfying",
    });
    assert.equal(
        youtubeDescription({ left: "SPLODEY", right: "JACKPOT", layerHealth: 750 }),
        "Who will break the 750 HP layer first, Splodey or Jackpot?\n\n#physics #shorts #simulation #satisfying",
    );
});

test("schedule matching follows Pacific time across standard and daylight time", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const noonPst = new Date("2026-01-15T20:00:00.000Z");
    const noonPdt = new Date("2026-07-15T19:00:00.000Z");
    const afternoonPdt = new Date("2026-07-15T22:00:00.000Z");
    assert.equal(localDateKey(noonPst, config.timeZone), "2026-01-15");
    assert.deepEqual(localScheduleSlotsAt(noonPst, config).map(({ id }) => id), ["noon-longform"]);
    assert.deepEqual(localScheduleSlotsAt(noonPdt, config).map(({ id }) => id), ["noon-longform"]);
    assert.deepEqual(localScheduleSlotsAt(afternoonPdt, config).map(({ id }) => id), ["afternoon-longform"]);
    assert.equal(scheduledPublishAt("2026-01-15", "12:00"), "2026-01-15T20:00:00.000Z");
    assert.equal(scheduledPublishAt("2026-07-15", "15:00"), "2026-07-15T22:00:00.000Z");
});

test("due slots match each Pacific long-form time across daylight-saving time", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const noonPst = new Date("2026-01-15T20:12:00.000Z");
    const noonPdt = new Date("2026-07-15T19:12:00.000Z");
    const afternoonPdt = new Date("2026-07-15T22:12:00.000Z");
    assert.deepEqual(dueYouTubeSlotsAt(noonPst, config).map(({ id }) => id), ["noon-longform"]);
    assert.deepEqual(dueYouTubeSlotsAt(noonPdt, config).map(({ id }) => id), ["noon-longform"]);
    assert.deepEqual(dueYouTubeSlotsAt(afternoonPdt, config).map(({ id }) => id), ["afternoon-longform"]);
    assert.deepEqual(dueYouTubeSlotsAt(new Date("2026-07-15T20:12:00.000Z"), config).map(({ id }) => id), []);
});

test("YouTube plans use a deterministic allowlisted matchup and exact metadata contract", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const shortConfig = {
        ...config,
        schedule: [{ id: "test-short", contentType: "short", localTime: "12:00" }],
    };
    const slot = shortConfig.schedule[0];
    const first = selectYouTubeMatchup({ dateKey: "2026-09-19", slotId: slot.id, config: shortConfig });
    const second = selectYouTubeMatchup({ dateKey: "2026-09-19", slotId: slot.id, config: shortConfig });
    const plan = buildYouTubePublishPlan({ dateKey: "2026-09-19", slot, config: shortConfig });
    assert.deepEqual(first, second);
    assert.ok(config.videoReady.orbRace.orbs.includes(first.leftId));
    assert.ok(config.videoReady.orbRace.orbs.includes(first.rightId));
    assert.equal(plan.title, youtubeTitle(plan.left, plan.right, config));
    assert.match(plan.description, new RegExp(`^Who will break the ${plan.raceLayerStrengths[0]} HP layer first, `));
    assert.match(plan.description, /\n\n#physics #shorts #simulation #satisfying$/);
    assert.equal(plan.runTag, "of-20260919-test-short");
    assert.ok(plan.battleQuality.accepted);
    assert.equal(plan.minimumDurationSeconds, 25);
    assert.ok(plan.actionPlaybackRate > 0 && plan.actionPlaybackRate <= 1);
    assert.ok(plan.battleQuality.plannedActionDurationSeconds >= 26.25);
    assert.ok(plan.raceLayerStrengths.every((health) => health >= 500));
    assert.deepEqual(plan.raceLayerStrengths, [...plan.raceLayerStrengths].sort((a, b) => a - b));
    assert.ok(plan.raceLayerStrengths.length <= config.quality.maximumShortLayers);
    assert.equal(validateYouTubeGenerationSpec({ plan, config: shortConfig }), true);
    const longformSlot = config.schedule.find(({ id }) => id === "afternoon-longform");
    const longformPlan = buildYouTubePublishPlan({ dateKey: "2026-09-19", slot: longformSlot, config });
    assert.equal(longformPlan.contentType, "longform");
    assert.equal(longformPlan.scheduledPublishAt, "2026-09-19T22:00:00.000Z");
    assert.equal(longformPlan.minimumDurationSeconds, 60);
    assert.equal(longformPlan.raceLayerStrengths.length, config.quality.longformLayerCount);
    assert.ok(longformPlan.battleQuality.plannedActionDurationSeconds >= 63);
    assert.deepEqual(
        longformPlan.raceLayerStrengths,
        [...longformPlan.raceLayerStrengths].sort((a, b) => a - b),
    );
    assert.throws(
        () => validateYouTubeGenerationSpec({ plan: { ...plan, description: "wrong" }, config: shortConfig }),
        /title or description does not match/,
    );
    assert.throws(
        () => validateYouTubeGenerationSpec({
            plan: { ...plan, raceLayerStrengths: [750, 1000, 1500, 2000] },
            config: shortConfig,
        }),
        /layer profile is missing or inconsistent/,
    );
});

test("YouTube upload gate requires spoken announcer proof and the complete artifact contract", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const shortConfig = {
        ...config,
        schedule: [{ id: "test-short", contentType: "short", localTime: "12:00" }],
    };
    const slot = shortConfig.schedule[0];
    const plan = buildYouTubePublishPlan({ dateKey: "2026-09-20", slot, config: shortConfig });
    const artifact = {
        ...plan,
        gameplayMode: "orb-race",
        videoPath: "/tmp/orb-foundry-short.webm",
        announcer: {
            assetsReady: true,
            loadedCueCount: 10,
            sequences: 1,
            spokenCueCount: 2,
            splitAnnouncerUsed: false,
            presentationWasSplit: false,
        },
        state: {
            recordingResult: { duration: 27.1 },
            raceMatchupCount: 1,
            raceActionDurationSeconds: 26.7,
            settings: { social: { actionPlaybackRate: plan.actionPlaybackRate } },
        },
    };
    assert.equal(validateYouTubeExportArtifact({ exportResult: artifact, plan, config: shortConfig }), true);
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, announcer: { ...artifact.announcer, spokenCueCount: 0 } },
            plan,
            config: shortConfig,
        }),
        /no spoken announcer cue/,
    );
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, announcer: { ...artifact.announcer, sequences: 0 } },
            plan,
            config: shortConfig,
        }),
        /no announcer sequence/,
    );
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, raceLayerStrengths: [750, 1000, 1500, 2000] },
            plan: { ...plan, raceLayerStrengths: [750, 1000, 1500, 2000] },
            config: shortConfig,
        }),
        /Shorts cannot exceed 3 layers/,
    );
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, raceOrbs: [...artifact.raceOrbs].reverse() },
            plan,
            config: shortConfig,
        }),
        /teams, orbs, or layer profile does not match/,
    );
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, state: { ...artifact.state, raceMatchupCount: 2 } },
            plan,
            config: shortConfig,
        }),
        /exactly one matchup/,
    );
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, state: { ...artifact.state, raceActionDurationSeconds: 24.9 } },
            plan,
            config: shortConfig,
        }),
        /single-match race action is below/,
    );
});

test("daily plans are distinct and the rotating roster enforces the two-day cooldown", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const currentDate = "2026-10-14";
    const current = buildDailyYouTubePlans({ dateKey: currentDate, config });
    const currentIds = current.flatMap(({ matchup }) => matchup.raceOrbs);
    const currentRoster = new Set(dailyYouTubeRosterForDate({ dateKey: currentDate, config }));
    const recentRosters = ["2026-10-13", "2026-10-12"].map((dateKey) => (
        new Set(dailyYouTubeRosterForDate({ dateKey, config }))
    ));
    assert.equal(new Set(currentIds).size, currentIds.length);
    assert.ok(currentIds.every((id) => currentRoster.has(id)));
    assert.ok(currentIds.every((id) => recentRosters.every((roster) => !roster.has(id))));
    assert.deepEqual(current.map(({ slot }) => slot.id), ["noon-longform", "afternoon-longform"]);
    assert.ok(current.some(({ matchup }) => matchup.raceTeams.some((team) => team.length > 1)));
    assert.equal(config.delivery.visibility, "private");
    assert.equal(config.delivery.scheduleOnYouTube, true);
});

test("planning entity budget counts spawned orbs and projectiles", () => {
    const sim = {
        fighters: [
            { raceDuplicateOrbs: [{}, {}], raceDrillProjectiles: [{}], name: "ignored" },
            { raceParasites: [{}, {}, {}] },
        ],
    };
    assert.equal(planningSpawnedEntityCount(sim), 6);
    assert.equal(planningSpawnedEntityCount({ fighters: [] }), 0);
});

test("a close-battle failure can never be promoted to an approved upload", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const plans = buildDailyYouTubePlans({ dateKey: "2026-10-14", config });
    assert.equal(plans.length, 2);
    for (const { slot, matchup } of plans) {
        assert.equal(matchup.battleQuality.runaway, false, slot.id);
        assert.equal(matchup.battleQuality.accepted, true, slot.id);
        assert.equal(matchup.battleQuality.finished, true, slot.id);
        const plan = buildYouTubePublishPlan({
            dateKey: "2026-10-14",
            slot,
            config,
            matchup,
        });
        assert.equal(validateYouTubeGenerationSpec({ plan, config }), true, slot.id);
        assert.throws(() => validateYouTubeGenerationSpec({
            plan: {
                ...plan,
                battleQuality: {
                    ...plan.battleQuality,
                    accepted: true,
                    fallback: true,
                    progressMargin: config.quality.closeBattle.maxProgressMargin + 1,
                },
            },
            config,
        }), /close-battle preflight did not pass/);
    }
});

test("dry-run publishing plans the noon long-form without credentials or media side effects", async () => {
    const logs = [];
    const result = await publishDueYouTubeSlots({
        now: new Date("2026-07-15T19:12:00.000Z"),
        dryRun: true,
        logger: { log: (value) => logs.push(value), error: () => {} },
    });
    assert.equal(result.status, "completed");
    assert.deepEqual(result.items.map(({ slotId, status }) => ({ slotId, status })), [
        { slotId: "noon-longform", status: "planned" },
    ]);
    assert.equal(result.items[0].contentType, "longform");
    assert.equal(result.items[0].minimumDurationSeconds, 60);
    assert.equal(logs.length, 1);
});

test("dry-run publishing plans the 3 PM long-form without credentials or media side effects", async () => {
    const result = await publishDueYouTubeSlots({
        now: new Date("2026-07-15T22:12:00.000Z"),
        dryRun: true,
        logger: { log: () => {}, error: () => {} },
    });
    assert.equal(result.status, "completed");
    assert.deepEqual(result.items.map(({ slotId, contentType, minimumDurationSeconds }) => ({
        slotId,
        contentType,
        minimumDurationSeconds,
    })), [{ slotId: "afternoon-longform", contentType: "longform", minimumDurationSeconds: 60 }]);
});
