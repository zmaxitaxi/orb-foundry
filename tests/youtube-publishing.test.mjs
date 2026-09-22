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
    validateYouTubeGenerationSpec,
    validateYouTubeExportArtifact,
} from "../scripts/youtube-publishing.mjs";
import {
    buildYouTubePublishPlan,
    buildDailyYouTubePlans,
    publishDueYouTubeSlots,
    selectYouTubeMatchup,
} from "../scripts/youtube-publish.mjs";

test("YouTube publishing contract loads with three daily slots", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    assert.equal(config.timeZone, "America/Los_Angeles");
    assert.deepEqual(config.schedule.map(({ id, contentType, localTime }) => ({ id, contentType, localTime })), [
        { id: "noon-longform", contentType: "longform", localTime: "12:00" },
        { id: "noon-short", contentType: "short", localTime: "12:00" },
        { id: "afternoon-short", contentType: "short", localTime: "15:00" },
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
});

test("YouTube metadata uses the approved VS title and hashtags", () => {
    assert.equal(youtubeTitle("DUPLICATOR", "ORBITAL"), "Duplicator VS Orbital");
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
    assert.deepEqual(localScheduleSlotsAt(noonPst, config).map(({ id }) => id), ["noon-longform", "noon-short"]);
    assert.deepEqual(localScheduleSlotsAt(noonPdt, config).map(({ id }) => id), ["noon-longform", "noon-short"]);
    assert.deepEqual(localScheduleSlotsAt(afternoonPdt, config).map(({ id }) => id), ["afternoon-short"]);
    assert.equal(scheduledPublishAt("2026-01-15", "12:00"), "2026-01-15T20:00:00.000Z");
    assert.equal(scheduledPublishAt("2026-07-15", "15:00"), "2026-07-15T22:00:00.000Z");
});

test("due slots keep both Pacific noon entries across daylight-saving time", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const noonPst = new Date("2026-01-15T20:12:00.000Z");
    const noonPdt = new Date("2026-07-15T19:12:00.000Z");
    const afternoonPdt = new Date("2026-07-15T22:12:00.000Z");
    assert.deepEqual(dueYouTubeSlotsAt(noonPst, config).map(({ id }) => id), ["noon-longform", "noon-short"]);
    assert.deepEqual(dueYouTubeSlotsAt(noonPdt, config).map(({ id }) => id), ["noon-longform", "noon-short"]);
    assert.deepEqual(dueYouTubeSlotsAt(afternoonPdt, config).map(({ id }) => id), ["afternoon-short"]);
    assert.deepEqual(dueYouTubeSlotsAt(new Date("2026-07-15T20:12:00.000Z"), config).map(({ id }) => id), []);
});

test("YouTube plans use a deterministic allowlisted matchup and exact metadata contract", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const slot = config.schedule.find(({ id }) => id === "noon-short");
    const first = selectYouTubeMatchup({ dateKey: "2026-09-19", slotId: slot.id, config });
    const second = selectYouTubeMatchup({ dateKey: "2026-09-19", slotId: slot.id, config });
    const plan = buildYouTubePublishPlan({ dateKey: "2026-09-19", slot, config });
    assert.deepEqual(first, second);
    assert.ok(config.videoReady.orbRace.orbs.includes(first.leftId));
    assert.ok(config.videoReady.orbRace.orbs.includes(first.rightId));
    assert.equal(plan.title, youtubeTitle(plan.left, plan.right, config));
    assert.match(plan.description, new RegExp(`^Who will break the ${plan.raceLayerStrengths[0]} HP layer first, `));
    assert.match(plan.description, /\n\n#physics #shorts #simulation #satisfying$/);
    assert.equal(plan.runTag, "of-20260919-noon-short");
    assert.ok(plan.battleQuality.accepted);
    assert.equal(plan.minimumDurationSeconds, 25);
    assert.ok(plan.raceLayerStrengths.every((health) => health >= 500));
    assert.deepEqual(plan.raceLayerStrengths, [...plan.raceLayerStrengths].sort((a, b) => a - b));
    assert.ok(plan.raceLayerStrengths.length <= config.quality.maximumShortLayers);
    assert.equal(validateYouTubeGenerationSpec({ plan, config }), true);
    assert.throws(
        () => validateYouTubeGenerationSpec({ plan: { ...plan, description: "wrong" }, config }),
        /title or description does not match/,
    );
    assert.throws(
        () => validateYouTubeGenerationSpec({
            plan: { ...plan, raceLayerStrengths: [750, 1000, 1500, 2000] },
            config,
        }),
        /layer profile is missing or inconsistent/,
    );
});

test("YouTube upload gate requires spoken announcer proof and the complete artifact contract", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const slot = config.schedule.find(({ id }) => id === "noon-short");
    const plan = buildYouTubePublishPlan({ dateKey: "2026-09-20", slot, config });
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
            recordingResult: { duration: 25.4 },
        },
    };
    assert.equal(validateYouTubeExportArtifact({ exportResult: artifact, plan, config }), true);
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, announcer: { ...artifact.announcer, spokenCueCount: 0 } },
            plan,
            config,
        }),
        /no spoken announcer cue/,
    );
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, announcer: { ...artifact.announcer, sequences: 0 } },
            plan,
            config,
        }),
        /no announcer sequence/,
    );
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, raceLayerStrengths: [750, 1000, 1500, 2000] },
            plan: { ...plan, raceLayerStrengths: [750, 1000, 1500, 2000] },
            config,
        }),
        /Shorts cannot exceed 3 layers/,
    );
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, raceOrbs: [...artifact.raceOrbs].reverse() },
            plan,
            config,
        }),
        /teams, orbs, or layer profile does not match/,
    );
});

test("daily plans keep orbs out for two days and support multi-orb battles", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const current = buildDailyYouTubePlans({ dateKey: "2026-09-20", config });
    const previous = buildDailyYouTubePlans({ dateKey: "2026-09-19", config });
    const twoDaysAgo = buildDailyYouTubePlans({ dateKey: "2026-09-18", config });
    const currentIds = current.flatMap(({ matchup }) => matchup.raceOrbs);
    const previousIds = new Set(previous.flatMap(({ matchup }) => matchup.raceOrbs));
    const twoDaysAgoIds = new Set(twoDaysAgo.flatMap(({ matchup }) => matchup.raceOrbs));
    assert.equal(new Set(currentIds).size, currentIds.length);
    assert.ok(currentIds.every((id) => !previousIds.has(id) && !twoDaysAgoIds.has(id)));
    assert.ok(current.some(({ matchup }) => matchup.raceTeams.some((team) => team.length > 1)));
    assert.equal(config.delivery.visibility, "private");
    assert.equal(config.delivery.scheduleOnYouTube, true);
});

test("dry-run publishing plans both noon uploads without credentials or media side effects", async () => {
    const logs = [];
    const result = await publishDueYouTubeSlots({
        now: new Date("2026-07-15T19:12:00.000Z"),
        dryRun: true,
        logger: { log: (value) => logs.push(value), error: () => {} },
    });
    assert.equal(result.status, "completed");
    assert.deepEqual(result.items.map(({ slotId, status }) => ({ slotId, status })), [
        { slotId: "noon-longform", status: "planned" },
        { slotId: "noon-short", status: "planned" },
    ]);
    assert.equal(logs.length, 2);
});
