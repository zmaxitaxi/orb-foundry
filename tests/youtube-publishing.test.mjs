import test from "node:test";
import assert from "node:assert/strict";
import {
    YOUTUBE_CONFIG_PATH,
    loadYouTubePublishingConfig,
    localDateKey,
    localScheduleSlotsAt,
    youtubeDescription,
    youtubeMetadata,
    youtubeTitle,
} from "../scripts/youtube-publishing.mjs";

test("YouTube publishing contract loads with three daily slots", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    assert.equal(config.timeZone, "America/Los_Angeles");
    assert.deepEqual(config.schedule.map(({ id, contentType, localTime }) => ({ id, contentType, localTime })), [
        { id: "noon-longform", contentType: "longform", localTime: "12:00" },
        { id: "noon-short", contentType: "short", localTime: "12:00" },
        { id: "afternoon-short", contentType: "short", localTime: "15:00" },
    ]);
    assert.equal(config.delivery.requireApproval, false);
    assert.deepEqual(config.videoReady.orbRace.orbs, []);
    assert.deepEqual(config.videoReady.orbFoundry.groups, []);
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
});
