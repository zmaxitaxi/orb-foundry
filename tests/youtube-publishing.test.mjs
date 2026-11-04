import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    YOUTUBE_CONFIG_PATH,
    dueYouTubeSlotsAt,
    loadYouTubePublishingConfig,
    localDateKey,
    localScheduleSlotsAt,
    scheduledPublishAt,
    youtubeDescription,
    youtubeFoundryMetadata,
    youtubeMetadata,
    youtubeMaxLongformLayerStrengths,
    youtubeTitle,
    youtubeTournamentMetadata,
    YOUTUBE_OAUTH_SCOPES,
    YOUTUBE_SHORTS_FORMAT,
    YOUTUBE_SHORTS_MAX_SECONDS,
    validateYouTubePublishingConfig,
    validateYouTubeGenerationSpec,
    validateYouTubeExportArtifact,
} from "../scripts/youtube-publishing.mjs";
import {
    buildYouTubePublishPlan,
    buildDailyYouTubePlans,
    planningSpawnedEntityCount,
    dailyYouTubeRosterForDate,
    dailyOrbFoundryRosterForDate,
    isYouTubePacificFriday,
    isYouTubePacificSaturday,
    publishDueYouTubeSlots,
    selectYouTubeEveryoneVsInfinityMatchup,
    selectedOrbFoundrySlotForDate,
    selectYouTubeFoundryMatchup,
    selectYouTubeMatchup,
    YouTubeApiClient,
} from "../scripts/youtube-publish.mjs";
import {
    decodeThumbnailPng,
    renderTournamentOrbThumbnail,
    thumbnailPixel,
    tournamentThumbnailLayout,
} from "../scripts/youtube-thumbnail.mjs";
import { ORB_RACERS, normalizeRaceTeamOptions } from "../src/orb-race.js";
import { SOCIAL_FORMATS } from "../src/social.js";
import { createSimulation, stepSimulation } from "../src/simulation.js";

test("YouTube publishing contract loads four daily slots and the approved video rosters", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    assert.equal(config.timeZone, "America/Los_Angeles");
    assert.deepEqual(config.schedule.map(({ id, contentType, localTime }) => ({ id, contentType, localTime })), [
        { id: "noon-short", contentType: "short", localTime: "12:00" },
        { id: "noon-longform", contentType: "longform", localTime: "12:00" },
        { id: "afternoon-short", contentType: "short", localTime: "15:00" },
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
    assert.equal(config.videoReady.orbFoundry.orbs.length, 36);
    assert.ok(!config.videoReady.orbFoundry.orbs.includes("frost-ball"));
    assert.ok(!config.videoReady.orbFoundry.orbs.includes("ying-yang"));
    assert.equal(config.quality.orbFoundryShort.shortsOnly, true);
    assert.equal(config.quality.orbFoundryShort.format, "portrait");
    assert.equal(YOUTUBE_SHORTS_FORMAT, "portrait");
    assert.equal(YOUTUBE_SHORTS_MAX_SECONDS, 180);
    assert.deepEqual(
        { width: SOCIAL_FORMATS.portrait.width, height: SOCIAL_FORMATS.portrait.height },
        { width: 1080, height: 1920 },
    );
    assert.equal(SOCIAL_FORMATS.portrait.height * 9, SOCIAL_FORMATS.portrait.width * 16);
    assert.ok(SOCIAL_FORMATS.square.width > SOCIAL_FORMATS.square.height);
    assert.equal(config.quality.orbFoundryShort.dailyProbability, 0.5);
    assert.equal(config.quality.orbFoundryShort.maximumPerDay, 1);
    assert.equal(config.quality.fridayTournament.minimumDurationSeconds, 120);
    assert.equal(config.quality.fridayTournament.recordingScope, "whole-tournament");
    assert.equal(config.quality.saturdayEveryoneVsInfinity.dayOfWeek, 6);
    assert.equal(config.quality.saturdayEveryoneVsInfinity.slotId, "afternoon-longform");
    assert.equal(config.quality.saturdayEveryoneVsInfinity.rightOrb, "infinity");
    assert.equal(config.quality.saturdayEveryoneVsInfinity.layerProfile, "longform-top");
    assert.deepEqual(YOUTUBE_OAUTH_SCOPES, [
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube.force-ssl",
    ]);
    assert.throws(() => validateYouTubePublishingConfig({
        ...config,
        quality: {
            ...config.quality,
            orbFoundryShort: { ...config.quality.orbFoundryShort, shortsOnly: false },
        },
    }), /Shorts-only/);
    assert.throws(() => validateYouTubePublishingConfig({
        ...config,
        quality: {
            ...config.quality,
            orbFoundryShort: { ...config.quality.orbFoundryShort, format: "square" },
        },
    }), /portrait Shorts layout/);
    assert.throws(() => validateYouTubePublishingConfig({
        ...config,
        schedule: [...config.schedule, { id: "extra-short", contentType: "short", localTime: "18:00" }],
    }), /one Short and one long-form slot at both 12:00 PM and 3:00 PM Pacific/);
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
    assert.deepEqual(youtubeFoundryMetadata({ left: "GLASS BALL", right: "BLACK HOLE" }), {
        title: "Glass Ball VS Black Hole",
        description: "Who will win the Orb Foundry battle, Glass Ball or Black Hole?\n\n#physics #shorts #simulation #satisfying",
    });
    assert.deepEqual(youtubeTournamentMetadata({ entrants: 16 }), {
        title: "Who is the Best Orb?",
        description: "Who will claim the championship? 16 approved Orb Race entrants compete in the full tournament.\n\n#physics #shorts #simulation #satisfying",
    });
});

test("schedule matching follows Pacific time across standard and daylight time", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const noonPst = new Date("2026-01-15T20:00:00.000Z");
    const noonPdt = new Date("2026-07-15T19:00:00.000Z");
    const afternoonPdt = new Date("2026-07-15T22:00:00.000Z");
    assert.equal(localDateKey(noonPst, config.timeZone), "2026-01-15");
    assert.deepEqual(localScheduleSlotsAt(noonPst, config).map(({ id }) => id), ["noon-short", "noon-longform"]);
    assert.deepEqual(localScheduleSlotsAt(noonPdt, config).map(({ id }) => id), ["noon-short", "noon-longform"]);
    assert.deepEqual(localScheduleSlotsAt(afternoonPdt, config).map(({ id }) => id), ["afternoon-short", "afternoon-longform"]);
    assert.equal(scheduledPublishAt("2026-01-15", "12:00"), "2026-01-15T20:00:00.000Z");
    assert.equal(scheduledPublishAt("2026-07-15", "15:00"), "2026-07-15T22:00:00.000Z");
});

test("due slots match each Pacific long-form time across daylight-saving time", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const noonPst = new Date("2026-01-15T20:12:00.000Z");
    const noonPdt = new Date("2026-07-15T19:12:00.000Z");
    const afternoonPdt = new Date("2026-07-15T22:12:00.000Z");
    assert.deepEqual(dueYouTubeSlotsAt(noonPst, config).map(({ id }) => id), ["noon-short", "noon-longform"]);
    assert.deepEqual(dueYouTubeSlotsAt(noonPdt, config).map(({ id }) => id), ["noon-short", "noon-longform"]);
    assert.deepEqual(dueYouTubeSlotsAt(afternoonPdt, config).map(({ id }) => id), ["afternoon-short", "afternoon-longform"]);
    assert.deepEqual(dueYouTubeSlotsAt(new Date("2026-07-15T20:12:00.000Z"), config).map(({ id }) => id), []);
});

test("YouTube plans use a deterministic allowlisted matchup and exact metadata contract", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const shortConfig = {
        ...config,
        schedule: [{ id: "test-short", contentType: "short", localTime: "12:00" }],
    };
    const slot = shortConfig.schedule[0];
    const first = selectYouTubeMatchup({ dateKey: "2026-09-20", slotId: slot.id, config: shortConfig });
    const second = selectYouTubeMatchup({ dateKey: "2026-09-20", slotId: slot.id, config: shortConfig });
    const plan = buildYouTubePublishPlan({ dateKey: "2026-09-20", slot, config: shortConfig });
    assert.deepEqual(first, second);
    assert.ok(config.videoReady.orbRace.orbs.includes(first.leftId));
    assert.ok(config.videoReady.orbRace.orbs.includes(first.rightId));
    assert.equal(plan.title, youtubeTitle(plan.left, plan.right, config));
    assert.match(plan.description, new RegExp(`^Who will break the ${plan.raceLayerStrengths[0]} HP layer first, `));
    assert.match(plan.description, /\n\n#physics #shorts #simulation #satisfying$/);
    assert.equal(plan.runTag, "of-20260920-test-short");
    assert.ok(plan.battleQuality.accepted);
    assert.equal(plan.minimumDurationSeconds, 25);
    assert.ok(plan.actionPlaybackRate > 0 && plan.actionPlaybackRate <= 1);
    assert.ok(plan.battleQuality.plannedActionDurationSeconds >= 26.25);
    assert.ok(plan.raceLayerStrengths.every((health) => health >= 500));
    assert.deepEqual(plan.raceLayerStrengths, [...plan.raceLayerStrengths].sort((a, b) => a - b));
    assert.ok(plan.raceLayerStrengths.length <= config.quality.maximumShortLayers);
    assert.equal(validateYouTubeGenerationSpec({ plan, config: shortConfig }), true);
    const longformSlot = config.schedule.find(({ id }) => id === "afternoon-longform");
    const longformDate = "2026-10-07";
    const longformMatchup = selectYouTubeMatchup({
        dateKey: longformDate,
        slotId: longformSlot.id,
        config,
        rosterIds: dailyYouTubeRosterForDate({ dateKey: longformDate, config }),
    });
    const longformPlan = buildYouTubePublishPlan({
        dateKey: longformDate,
        slot: longformSlot,
        config,
        matchup: longformMatchup,
    });
    assert.equal(longformPlan.contentType, "longform");
    assert.equal(longformPlan.scheduledPublishAt, "2026-10-07T22:00:00.000Z");
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

test("Orb Foundry short selection honors the 50% daily chance and two-day roster cooldown", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    let foundryDays = 0;
    for (let day = 0; day < 365; day += 1) {
        const dateKey = new Date(Date.UTC(2026, 0, day + 1)).toISOString().slice(0, 10);
        const selectedSlot = selectedOrbFoundrySlotForDate({ dateKey, config });
        if (selectedSlot) {
            foundryDays += 1;
            const slot = config.schedule.find((candidate) => candidate.id === selectedSlot);
            assert.equal(slot?.contentType, "short", "Orb Foundry can replace only a Short");
        }
        assert.ok(
            config.schedule.filter((slot) => slot.contentType !== "short").every((slot) => slot.id !== selectedSlot),
            "long-form slots, including Friday's tournament, stay Orb Race",
        );
    }
    assert.ok(foundryDays >= 155 && foundryDays <= 210, `expected about 50% Foundry days, got ${foundryDays}/365`);
    assert.throws(() => validateYouTubePublishingConfig({
        ...config,
        quality: {
            ...config.quality,
            orbFoundryShort: { ...config.quality.orbFoundryShort, dailyProbability: 0.25 },
        },
    }), /50% daily chance/);

    const dateKey = "2026-10-14";
    const currentRoster = new Set(dailyOrbFoundryRosterForDate({ dateKey, config }));
    const previousRosters = ["2026-10-13", "2026-10-12"].map((previousDate) => (
        new Set(dailyOrbFoundryRosterForDate({ dateKey: previousDate, config }))
    ));
    assert.equal(currentRoster.size, 12);
    assert.ok([...currentRoster].every((id) => config.videoReady.orbFoundry.orbs.includes(id)));
    assert.ok([...currentRoster].every((id) => previousRosters.every((roster) => !roster.has(id))));
});

test("Orb Foundry matchup plans are close, long enough, allowlisted, and use the requested presentation", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const dateKey = "2026-10-07";
    const slot = config.schedule.find(({ id }) => id === "afternoon-short");
    const matchup = selectYouTubeFoundryMatchup({
        dateKey,
        slotId: slot.id,
        config,
        rosterIds: dailyOrbFoundryRosterForDate({ dateKey, config }),
    });
    const plan = buildYouTubePublishPlan({ dateKey, slot, config, matchup });
    assert.equal(plan.contentSource, "orb-foundry");
    assert.equal(plan.videoKind, "match");
    assert.equal(plan.contentType, "short");
    assert.equal(plan.format, "portrait");
    assert.equal(plan.minimumDurationSeconds, 25);
    assert.equal(plan.battleQuality.accepted, true);
    assert.ok(plan.battleQuality.plannedActionDurationSeconds >= 26.25);
    assert.ok(plan.battleQuality.winnerHealthFraction <= config.quality.orbFoundryShort.minimumWinnerHealthFraction);
    assert.ok(plan.orbFoundryOrbs.every((id) => config.videoReady.orbFoundry.orbs.includes(id)));
    assert.deepEqual(plan.foundryStyle, {
        ...config.quality.orbFoundryShort,
    });
    assert.equal(plan.title, youtubeTitle(plan.left, plan.right, config));
    assert.match(plan.description, /^Who will win the Orb Foundry battle,/);
    assert.match(plan.description, /\n\n#physics #shorts #simulation #satisfying$/);
    assert.equal(validateYouTubeGenerationSpec({ plan, config }), true);
    assert.throws(() => validateYouTubeGenerationSpec({
        plan: { ...plan, orbFoundryOrbs: ["fairy", plan.orbFoundryOrbs[1]] },
        config,
    }), /exactly two unique approved orbs/);
    assert.throws(() => validateYouTubeGenerationSpec({
        plan: { ...plan, foundryStyle: { ...plan.foundryStyle, teamOutlines: true } },
        config,
    }), /portrait Shorts layout/);
    assert.throws(() => validateYouTubeGenerationSpec({
        plan: { ...plan, format: "square" },
        config,
    }), /portrait Shorts layout/);
});

test("Friday long-form plan records a complete approved tournament", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const dateKey = "2026-10-16";
    const slot = config.schedule.find(({ id }) => id === "afternoon-longform");
    const entrants = dailyYouTubeRosterForDate({ dateKey, config }).slice(0, 16);
    const plan = buildYouTubePublishPlan({
        dateKey,
        slot,
        config,
        matchup: {
            contentSource: "orb-race",
            videoKind: "tournament",
            tournamentEntrants: entrants,
            raceOrbs: entrants,
            seed: 92834,
            battleQuality: { accepted: true, finished: true, fallback: false },
        },
    });
    assert.equal(isYouTubePacificFriday(dateKey), true);
    assert.equal(plan.videoKind, "tournament");
    assert.equal(plan.contentType, "longform");
    assert.equal(plan.minimumDurationSeconds, 120);
    assert.equal(plan.tournament.recordingScope, "whole-tournament");
    assert.equal(plan.tournament.recordingSelection, "whole-tournament");
    assert.equal(plan.tournament.entrants.length, 16);
    assert.equal(plan.raceLayerStrengths.length, 5);
    assert.ok(plan.raceLayerStrengths.every((health) => health >= 500));
    assert.deepEqual(plan.raceLayerStrengths, [...plan.raceLayerStrengths].sort((a, b) => a - b));
    assert.equal(plan.title, "Who is the Best Orb?");
    assert.equal(validateYouTubeGenerationSpec({ plan, config }), true);
    assert.throws(() => validateYouTubeGenerationSpec({
        plan: { ...plan, dateKey: "2026-10-17" },
        config,
    }), /Friday tournament must use 8–64 unique approved Orb Race entrants/);
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
        /missing one or more spoken announcer cues/,
    );
    assert.throws(
        () => validateYouTubeExportArtifact({
            exportResult: { ...artifact, announcer: { ...artifact.announcer, sequences: 0 } },
            plan,
            config: shortConfig,
        }),
        /missing one or more required announcer sequences/,
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

test("Orb Foundry upload gate verifies a portrait Short with the black, outline-free square arena", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const dateKey = "2026-10-07";
    const slot = config.schedule.find(({ id }) => id === "afternoon-short");
    const matchup = selectYouTubeFoundryMatchup({
        dateKey,
        slotId: slot.id,
        config,
        rosterIds: dailyOrbFoundryRosterForDate({ dateKey, config }),
    });
    const plan = buildYouTubePublishPlan({ dateKey, slot, config, matchup });
    const artifact = {
        ...plan,
        gameplayMode: "classic",
        videoPath: "/tmp/orb-foundry-short.webm",
        announcer: {
            assetsReady: true,
            loadedCueCount: 10,
            sequences: 1,
            spokenCueCount: 1,
            splitAnnouncerUsed: false,
            presentationWasSplit: false,
        },
        state: {
            time: plan.battleQuality.simulatedSeconds,
            recordingResult: { duration: plan.battleQuality.simulatedSeconds + 2 },
            settings: {
                classicTeams: plan.classicTeams,
                classicBlackTheme: true,
                classicTeamColors: false,
                social: { format: "portrait" },
                arenaSize: "large",
                arenaShape: "square",
                hazardPreset: "none",
            },
        },
    };
    assert.equal(validateYouTubeExportArtifact({ exportResult: artifact, plan, config }), true);
    assert.throws(() => validateYouTubeExportArtifact({
        exportResult: {
            ...artifact,
            state: { ...artifact.state, settings: { ...artifact.state.settings, classicTeamColors: true } },
        },
        plan,
        config,
    }), /portrait Short/);
    assert.throws(() => validateYouTubeExportArtifact({
        exportResult: {
            ...artifact,
            state: {
                ...artifact.state,
                settings: { ...artifact.state.settings, social: { format: "square" } },
            },
        },
        plan,
        config,
    }), /portrait Short/);
    assert.throws(() => validateYouTubeExportArtifact({
        exportResult: {
            ...artifact,
            state: {
                ...artifact.state,
                recordingResult: { duration: YOUTUBE_SHORTS_MAX_SECONDS + 1 },
            },
        },
        plan,
        config,
    }), /3-minute Shorts limit/);
});

test("Friday tournament upload gate requires every match, the champion, and announcer coverage", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const dateKey = "2026-10-16";
    const slot = config.schedule.find(({ id }) => id === "afternoon-longform");
    const entrants = dailyYouTubeRosterForDate({ dateKey, config }).slice(0, 16);
    const plan = buildYouTubePublishPlan({
        dateKey,
        slot,
        config,
        matchup: {
            contentSource: "orb-race",
            videoKind: "tournament",
            tournamentEntrants: entrants,
            raceOrbs: entrants,
            seed: 92834,
            battleQuality: { accepted: true, finished: true, fallback: false },
        },
    });
    const matchIds = Array.from({ length: entrants.length - 1 }, (_unused, index) => `match-${index + 1}`);
    const artifact = {
        ...plan,
        gameplayMode: "orb-race",
        videoPath: "/tmp/orb-race-tournament.webm",
        announcer: {
            assetsReady: true,
            loadedCueCount: 10,
            sequences: entrants.length - 1,
            spokenCueCount: entrants.length - 1,
            splitAnnouncerUsed: false,
            presentationWasSplit: false,
        },
        state: {
            recordingResult: {
                duration: 125,
                recordingScope: "whole-tournament",
                metadata: { scope: "whole-tournament", matchIds },
            },
            settings: { raceTournament: plan.tournament },
            tournament: {
                snapshot: {
                    recordingScope: "whole-tournament",
                    status: "completed",
                    size: entrants.length,
                    completedMatchCount: entrants.length - 1,
                    championOrbId: entrants[0],
                },
            },
        },
    };
    assert.equal(validateYouTubeExportArtifact({ exportResult: artifact, plan, config }), true);
    assert.throws(() => validateYouTubeExportArtifact({
        exportResult: {
            ...artifact,
            state: {
                ...artifact.state,
                recordingResult: {
                    ...artifact.state.recordingResult,
                    metadata: { scope: "whole-tournament", matchIds: matchIds.slice(1) },
                },
            },
        },
        plan,
        config,
    }), /complete whole-tournament recording/);
    assert.throws(() => validateYouTubeExportArtifact({
        exportResult: {
            ...artifact,
            announcer: { ...artifact.announcer, spokenCueCount: entrants.length - 2 },
        },
        plan,
        config,
    }), /missing one or more spoken announcer cues/);
});

test("daily plans are distinct and the rotating roster enforces the two-day cooldown", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const currentDate = "2026-10-18";
    const current = buildDailyYouTubePlans({ dateKey: currentDate, config });
    const foundryPlans = current.filter(({ matchup }) => matchup.contentSource === "orb-foundry");
    const racePlans = current.filter(({ matchup }) => matchup.contentSource !== "orb-foundry");
    const currentIds = racePlans.flatMap(({ matchup }) => matchup.raceOrbs);
    const currentRoster = new Set(dailyYouTubeRosterForDate({ dateKey: currentDate, config }));
    const recentRosters = ["2026-10-17", "2026-10-16"].map((dateKey) => (
        new Set(dailyYouTubeRosterForDate({ dateKey, config }))
    ));
    const foundryRoster = new Set(dailyOrbFoundryRosterForDate({ dateKey: currentDate, config }));
    assert.ok(foundryPlans.length <= 1, "at most one Orb Foundry Short is planned per day");
    assert.ok(foundryPlans.every(({ slot }) => slot.contentType === "short"));
    assert.ok(current.every(({ matchup }) => matchup.matchupKind !== "everyone-vs-infinity"));
    assert.ok(current.filter(({ slot }) => slot.contentType === "longform").every(({ matchup }) => matchup.contentSource !== "orb-foundry"));
    assert.ok(foundryPlans.every(({ matchup }) => matchup.orbFoundryOrbs.every((id) => foundryRoster.has(id))));
    assert.equal(new Set(currentIds).size, currentIds.length);
    assert.ok(currentIds.every((id) => currentRoster.has(id)));
    assert.ok(currentIds.every((id) => recentRosters.every((roster) => !roster.has(id))));
    assert.deepEqual(current.map(({ slot }) => slot.id), [
        "noon-short",
        "noon-longform",
        "afternoon-short",
        "afternoon-longform",
    ]);
    assert.ok(racePlans.some(({ matchup }) => matchup.raceTeams.some((team) => team.length > 1)));
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
    assert.equal(plans.length, 4);
    for (const { slot, matchup, planningError } of plans) {
        assert.equal(planningError, undefined, slot.id);
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
        if (matchup.contentSource === "orb-foundry") {
            assert.equal(slot.contentType, "short", slot.id);
            assert.throws(() => validateYouTubeGenerationSpec({
                plan: {
                    ...plan,
                    battleQuality: {
                        ...plan.battleQuality,
                        accepted: true,
                        winnerHealthFraction: 1,
                    },
                },
                config,
            }), /Orb Foundry matchup must be close/, slot.id);
            continue;
        }
        assert.throws(() => validateYouTubeGenerationSpec({
            plan: {
                ...plan,
                battleQuality: {
                    ...plan.battleQuality,
                    accepted: true,
                    fallback: false,
                    progressMargin: config.quality.closeBattle.maxProgressMargin + 1,
                },
            },
            config,
        }), /close-battle preflight did not pass/);
        assert.throws(() => validateYouTubeGenerationSpec({
            plan: {
                ...plan,
                battleQuality: {
                    ...plan.battleQuality,
                    accepted: true,
                    fallback: true,
                    finished: false,
                    progressMargin: config.quality.closeBattle.maxProgressMargin + 1,
                },
            },
            config,
        }), /close-battle preflight did not pass/);
    }
});

test("Friday planning keeps a valid fallback when the leftover duel pool is not close", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const dateKey = "2026-10-16";
    const plans = buildDailyYouTubePlans({ dateKey, config });
    assert.equal(isYouTubePacificFriday(dateKey), true);
    assert.equal(plans.length, 4);
    assert.equal(plans.every((entry) => entry.matchup && !entry.planningError), true);
    const noonLongform = plans.find(({ slot }) => slot.id === "noon-longform");
    assert.equal(noonLongform.matchup.battleQuality.fallback, true);
    assert.equal(noonLongform.matchup.battleQuality.accepted, true);
    assert.equal(noonLongform.matchup.battleQuality.finished, true);
    assert.equal(noonLongform.matchup.battleQuality.runaway, false);
    assert.ok(
        noonLongform.matchup.battleQuality.progressMargin > config.quality.closeBattle.maxProgressMargin
        || noonLongform.matchup.battleQuality.layerLead > config.quality.closeBattle.maxLayerLead,
    );
    const tournament = plans.find(({ slot }) => slot.id === "afternoon-longform");
    assert.equal(tournament.matchup.videoKind, "tournament");
    assert.equal(tournament.matchup.tournamentEntrants.length, 16);
    assert.equal(tournament.matchup.battleQuality.fallback, false);
    const raceIds = plans.flatMap(({ matchup }) => matchup.contentSource === "orb-foundry" ? [] : matchup.raceOrbs);
    assert.equal(new Set(raceIds).size, raceIds.length);
    assert.ok(plans.filter(({ slot }) => slot.contentType === "longform").every(({ matchup }) => matchup.contentSource !== "orb-foundry"));
    assert.ok(plans.filter(({ matchup }) => matchup.contentSource === "orb-foundry").length <= 1);
    for (const { slot, matchup } of plans) {
        const plan = buildYouTubePublishPlan({ dateKey, slot, config, matchup });
        assert.equal(validateYouTubeGenerationSpec({ plan, config }), true, slot.id);
        if (matchup.contentSource === "orb-foundry") {
            assert.equal(slot.contentType, "short", slot.id);
            assert.ok(plan.battleQuality.plannedActionDurationSeconds + 0.05 >= plan.minimumDurationSeconds * 1.05, slot.id);
        } else if (matchup.videoKind !== "tournament") {
            const target = plan.minimumDurationSeconds * 1.05;
            assert.equal(plan.battleQuality.durationReady, true, slot.id);
            assert.ok(plan.battleQuality.plannedActionDurationSeconds + 0.05 >= target, slot.id);
        }
        if (matchup.battleQuality.fallback) {
            assert.equal(plan.battleQuality.fallback, true, slot.id);
            assert.ok(plan.battleQuality.plannedActionDurationSeconds >= plan.minimumDurationSeconds, slot.id);
        }
    }
});

test("YouTube preflight uses the exporter's regular speed, then extends a short race", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const matchup = selectYouTubeMatchup({
        dateKey: "2026-10-16",
        slotId: "noon-short",
        config,
        rosterIds: ["professor", "draftmaster"],
        formatId: "duel",
        maxAttempts: 1,
    });
    assert.equal(matchup.battleQuality.finished, true);
    assert.equal(matchup.battleQuality.durationReady, true);
    assert.ok(matchup.raceOrbs.includes("professor"));
    const layers = matchup.battleQuality.layerStrengths;
    const exportedOptions = normalizeRaceTeamOptions(undefined, matchup.raceTeams, { scalingDamage: true });
    const sim = createSimulation({
        gameplayMode: "orb-race",
        raceTeams: matchup.raceTeams,
        raceOrbs: matchup.raceOrbs,
        raceTeamOptions: exportedOptions,
        raceLayerCount: layers.length,
        raceLayerStrengths: layers,
        raceScalingDamage: true,
        seed: matchup.seed,
        social: { enabled: true, format: "portrait" },
        features: { replay: false },
    });
    const step = 1 / 120;
    const maxSteps = Math.ceil(180 / step);
    for (let index = 0; index < maxSteps && !sim.finished; index += 1) stepSimulation(sim, step);
    const professor = sim.fighters.find((fighter) => fighter.raceOrbId === "professor");
    assert.equal(professor.raceSpeedMode, "regular");
    assert.equal(Number(sim.time.toFixed(3)), matchup.battleQuality.simulatedSeconds);
    assert.ok(matchup.battleQuality.simulatedSeconds < 25, "regular Professor should finish before the Short minimum");
    assert.ok(matchup.battleQuality.actionPlaybackRate < 1);
    assert.ok(matchup.battleQuality.plannedActionDurationSeconds + 0.05 >= 25 * 1.05);
});

test("one slot that cannot be planned does not discard the rest of the batch", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const dateKey = "2026-10-16";
    const depleted = structuredClone(config);
    depleted.videoReady.orbRace.orbs = config.videoReady.orbRace.orbs.slice(0, 16);
    const plans = buildDailyYouTubePlans({ dateKey, config: depleted, maxAttempts: 1 });
    assert.equal(plans.length, 4);
    const tournament = plans.find(({ slot }) => slot.id === "afternoon-longform");
    assert.equal(tournament.matchup.videoKind, "tournament");
    assert.equal(tournament.matchup.contentSource, "orb-race");
    assert.equal(tournament.planningError, undefined);
    const foundryEntries = plans.filter((entry) => entry.matchup?.contentSource === "orb-foundry");
    assert.ok(foundryEntries.length <= 1);
    assert.ok(foundryEntries.every((entry) => entry.slot.contentType === "short" && entry.planningError === undefined));
    for (const entry of plans) {
        if (entry.slot.id === "afternoon-longform" || entry.matchup?.contentSource === "orb-foundry") continue;
        assert.equal(entry.matchup, null, entry.slot.id);
        assert.match(entry.planningError, /Unable to build a YouTube matchup/, entry.slot.id);
    }

    const directory = await mkdtemp(join(tmpdir(), "youtube-plan-"));
    const configPath = join(directory, "youtube-publishing.json");
    const stored = JSON.parse(await readFile(YOUTUBE_CONFIG_PATH, "utf8"));
    stored.videoReady.orbRace.orbs = stored.videoReady.orbRace.orbs.slice(0, 16);
    await writeFile(configPath, JSON.stringify(stored));
    const logs = [];
    const errors = [];
    const failedSlotIds = plans.filter((entry) => !entry.matchup).map((entry) => entry.slot.id);
    await assert.rejects(() => publishDueYouTubeSlots({
        dateKey,
        batch: true,
        dryRun: true,
        configPath,
        logger: {
            log: (value) => logs.push(String(value)),
            error: (value) => errors.push(String(value)),
        },
    }), (error) => {
        assert.equal(error.message, `YouTube publishing failed for ${failedSlotIds.join(", ")}.`);
        assert.ok(failedSlotIds.length >= 1);
        assert.ok(!failedSlotIds.includes("afternoon-longform"));
        return true;
    });
    const logged = logs.map((line) => JSON.parse(line));
    assert.equal(errors.length + logged.length, 4);
    assert.ok(logged.some((entry) => entry.slotId === "afternoon-longform" && entry.videoKind === "tournament"));
    assert.ok(logged.filter((entry) => entry.contentSource === "orb-foundry").length <= 1);
    assert.ok(logged.filter((entry) => entry.contentType === "longform").every((entry) => entry.contentSource !== "orb-foundry"));
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
        { slotId: "noon-short", status: "planned" },
        { slotId: "noon-longform", status: "planned" },
    ]);
    assert.deepEqual(result.items.map(({ contentType, minimumDurationSeconds }) => ({
        contentType,
        minimumDurationSeconds,
    })), [
        { contentType: "short", minimumDurationSeconds: 25 },
        { contentType: "longform", minimumDurationSeconds: 60 },
    ]);
    assert.equal(logs.length, 2);
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
    })), [
        { slotId: "afternoon-short", contentType: "short", minimumDurationSeconds: 25 },
        { slotId: "afternoon-longform", contentType: "longform", minimumDurationSeconds: 60 },
    ]);
});

test("Orb Foundry cannot be planned as long-form", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    assert.throws(() => validateYouTubeGenerationSpec({
        plan: {
            slotId: "noon-longform",
            contentType: "longform",
            contentSource: "orb-foundry",
        },
        config,
    }), /Shorts-only/);
    assert.throws(() => validateYouTubeGenerationSpec({
        plan: {
            slotId: "afternoon-longform",
            contentType: "longform",
            contentSource: "orb-foundry",
        },
        config,
    }), /Shorts-only/);
});

test("Saturday afternoon long-form is Everyone VS Infinity on the max long-form profile", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const dateKey = "2026-10-17";
    const slot = config.schedule.find(({ id }) => id === "afternoon-longform");
    const top = Math.max(...config.quality.layerStrengths.longform);
    const first = selectYouTubeEveryoneVsInfinityMatchup({ dateKey, slotId: slot.id, config });
    const second = selectYouTubeEveryoneVsInfinityMatchup({ dateKey, slotId: slot.id, config });
    assert.deepEqual(first, second);
    const plan = buildYouTubePublishPlan({ dateKey, slot, config, matchup: first });
    const everyone = config.videoReady.orbRace.orbs.filter((id) => id !== "infinity");
    assert.equal(isYouTubePacificSaturday(dateKey), true);
    assert.equal(plan.matchupKind, "everyone-vs-infinity");
    assert.equal(plan.contentSource, "orb-race");
    assert.equal(plan.contentType, "longform");
    assert.equal(plan.videoKind, "match");
    assert.equal(plan.format, "race-landscape");
    assert.equal(plan.minimumDurationSeconds, 60);
    assert.deepEqual(plan.raceTeams, [everyone, ["infinity"]]);
    assert.ok(!plan.raceTeams[0].includes("infinity"));
    assert.equal(plan.left, "EVERYONE");
    assert.equal(plan.right, "INFINITY");
    assert.equal(plan.title, "Everyone VS Infinity");
    assert.equal(
        plan.description,
        `Who will break the ${top} HP layer first, Everyone or Infinity?\n\n#physics #shorts #simulation #satisfying`,
    );
    assert.deepEqual(plan.raceLayerStrengths, youtubeMaxLongformLayerStrengths(config.quality));
    assert.equal(plan.raceLayerStrengths.length, config.quality.longformLayerCount);
    assert.ok(plan.raceLayerStrengths.every((health) => health === top));
    assert.equal(plan.battleQuality.closeBattleWaived, true);
    assert.equal(plan.battleQuality.finished, true);
    assert.equal(plan.battleQuality.fallback, false);
    assert.ok(plan.battleQuality.plannedActionDurationSeconds + 0.05 >= 63);
    assert.ok(
        plan.battleQuality.progressMargin > config.quality.closeBattle.maxProgressMargin
        || plan.battleQuality.layerLead > config.quality.closeBattle.maxLayerLead,
    );
    assert.equal(validateYouTubeGenerationSpec({ plan, config }), true);
    assert.throws(() => validateYouTubeGenerationSpec({
        plan: { ...plan, dateKey: "2026-10-16" },
        config,
    }), /Saturday afternoon long-form must be Everyone versus Infinity/);
    assert.throws(() => validateYouTubeGenerationSpec({
        plan: {
            ...plan,
            raceTeams: [[...everyone, "infinity"], ["infinity"]],
            raceOrbs: [...everyone, "infinity", "infinity"],
        },
        config,
    }), /Infinity excluded/);
    assert.throws(() => validateYouTubeGenerationSpec({
        plan: { ...plan, raceLayerStrengths: config.quality.layerStrengths.short },
        config,
    }), /max long-form layer profile/);

    const plans = buildDailyYouTubePlans({ dateKey, config });
    assert.deepEqual(plans.map(({ slot: plannedSlot }) => plannedSlot.id), [
        "noon-short",
        "noon-longform",
        "afternoon-short",
        "afternoon-longform",
    ]);
    const special = plans.find(({ slot: plannedSlot }) => plannedSlot.id === "afternoon-longform");
    assert.equal(special.matchup.matchupKind, "everyone-vs-infinity");
    assert.equal(special.planningError, undefined);
    const others = plans.filter(({ slot: plannedSlot }) => plannedSlot.id !== "afternoon-longform");
    assert.ok(others.every((entry) => entry.matchup && !entry.planningError));
    assert.ok(others.every((entry) => entry.matchup.matchupKind !== "everyone-vs-infinity"));
    assert.ok(others.filter(({ slot: plannedSlot }) => plannedSlot.contentType === "longform").every((entry) => (
        entry.matchup.contentSource !== "orb-foundry"
        && entry.matchup.videoKind !== "tournament"
        && entry.matchup.matchupKind !== "everyone-vs-infinity"
    )));
    assert.ok(plans.filter(({ matchup }) => matchup.contentSource === "orb-foundry").every(({ slot: plannedSlot }) => (
        plannedSlot.contentType === "short"
    )));
    const otherRaceIds = others.flatMap(({ matchup }) => (
        matchup.contentSource === "orb-foundry" ? [] : matchup.raceOrbs
    ));
    assert.equal(new Set(otherRaceIds).size, otherRaceIds.length);
    const noon = plans.find(({ slot: plannedSlot }) => plannedSlot.id === "noon-longform");
    assert.notEqual(noon.matchup.formatId, "everyone-vs-infinity");
    assert.ok(noon.matchup.battleQuality.layerStrengths[0] < top);
});

test("tournament thumbnail draws every entrant in a square grid", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    const entrants = config.videoReady.orbRace.orbs.slice(0, 16);
    const png = renderTournamentOrbThumbnail({ orbIds: entrants });
    assert.ok(png.length < 2 * 1024 * 1024);
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    const decoded = decodeThumbnailPng(png);
    assert.equal(decoded.width, 1280);
    assert.equal(decoded.height, 1280);
    const layout = tournamentThumbnailLayout({ count: entrants.length, size: 1280 });
    assert.equal(layout.columns, 4);
    assert.equal(layout.rows, 4);
    for (const [index, id] of entrants.entries()) {
        const cell = layout.cells[index];
        const pixel = thumbnailPixel(decoded, cell.cx + cell.radius * 0.55, cell.cy);
        assert.deepEqual(pixel.slice(0, 3), hexColor(ORB_RACERS[id].color), id);
    }
    assert.deepEqual(thumbnailPixel(decoded, 2, 2), [236, 239, 243, 255]);
    assert.equal(tournamentThumbnailLayout({ count: 8 }).columns, 3);
    assert.throws(() => renderTournamentOrbThumbnail({ orbIds: ["not-an-orb"] }), /unknown orb/);
    const repeated = renderTournamentOrbThumbnail({ orbIds: entrants });
    assert.deepEqual(repeated, png);
});

test("YouTube thumbnail upload calls thumbnails.set and identifies a missing scope", async () => {
    const directory = await mkdtemp(join(tmpdir(), "youtube-thumb-"));
    const filePath = join(directory, "thumbnail.png");
    const png = renderTournamentOrbThumbnail({ orbIds: ["duplicator", "speed", "orbital", "infinity"] });
    await writeFile(filePath, png);
    const calls = [];
    const client = new YouTubeApiClient({
        accessToken: "token",
        fetchImpl: async (url, options) => {
            calls.push({ url: String(url), options });
            return {
                ok: false,
                status: 403,
                headers: { get: () => null },
                text: async () => JSON.stringify({
                    error: {
                        message: "Insufficient Permission",
                        errors: [{ reason: "insufficientPermissions" }],
                    },
                }),
            };
        },
    });
    await assert.rejects(() => client.setThumbnail({ videoId: "abc123", filePath }), (error) => {
        assert.equal(error.code, "youtube-thumbnail-scope");
        assert.match(error.message, /Insufficient Permission/);
        return true;
    });
    assert.equal(calls.length, 1);
    const url = new URL(calls[0].url);
    assert.equal(url.origin + url.pathname, "https://www.googleapis.com/upload/youtube/v3/thumbnails/set");
    assert.equal(url.searchParams.get("videoId"), "abc123");
    assert.equal(url.searchParams.get("uploadType"), "media");
    assert.equal(calls[0].options.method, "POST");
    assert.equal(calls[0].options.headers.authorization, "Bearer token");
    assert.equal(calls[0].options.headers["content-type"], "image/png");
    assert.equal(calls[0].options.headers["content-length"], String(png.length));
});

function hexColor(value) {
    return [
        Number.parseInt(value.slice(1, 3), 16),
        Number.parseInt(value.slice(3, 5), 16),
        Number.parseInt(value.slice(5, 7), 16),
    ];
}
