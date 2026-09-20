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
    assert.equal(config.rosterSource.channelName, "OrbBattlegroundsSimulator");
    assert.equal(config.rosterSource.channelUrl, "https://www.youtube.com/@OrbBattlegroundSimulator");
    assert.ok(config.videoReady.orbRace.orbs.includes("hydrogen-bomb"));
    assert.ok(config.videoReady.orbRace.groups.includes("EVERYONE"));
    assert.deepEqual(config.videoReady.orbFoundry.orbs, []);
});

test("YouTube metadata uses the approved VS title and hashtags", () => {
    assert.equal(youtubeTitle("DUPLICATOR", "ORBITAL"), "DUPLICATOR VS ORBITAL");
    assert.deepEqual(youtubeMetadata({ left: "MATH ORBS", right: "WEAPON ORBS" }), {
        title: "MATH ORBS VS WEAPON ORBS",
        description: "#physics #shorts #simulation #satisfying",
    });
    assert.equal(youtubeDescription(), "#physics #shorts #simulation #satisfying");
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
    assert.equal(plan.title, `${plan.left} VS ${plan.right}`);
    assert.equal(plan.description, "#physics #shorts #simulation #satisfying");
    assert.equal(plan.runTag, "of-20260919-noon-short");
    assert.ok(plan.battleQuality.accepted);
    assert.equal(plan.minimumDurationSeconds, 25);
    assert.ok(plan.raceLayerStrengths.every((health) => health >= 500));
    assert.deepEqual(plan.raceLayerStrengths, [...plan.raceLayerStrengths].sort((a, b) => a - b));
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
