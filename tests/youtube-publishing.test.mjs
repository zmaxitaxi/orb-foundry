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
    youtubeTitle,
    youtubeTournamentMetadata,
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
    publishDueYouTubeSlots,
    selectedOrbFoundrySlotForDate,
    selectYouTubeFoundryMatchup,
    selectYouTubeMatchup,
} from "../scripts/youtube-publish.mjs";
import { ORB_RACERS } from "../src/orb-race.js";

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
    assert.equal(config.quality.orbFoundryShort.dailyProbability, 0.25);
    assert.equal(config.quality.orbFoundryShort.maximumPerDay, 1);
    assert.equal(config.quality.fridayTournament.minimumDurationSeconds, 120);
    assert.equal(config.quality.fridayTournament.recordingScope, "whole-tournament");
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
        title: "Orb Race Tournament VS 16 Entrants",
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

test("Orb Foundry short selection honors the 25% daily chance and two-day roster cooldown", async () => {
    const config = await loadYouTubePublishingConfig(YOUTUBE_CONFIG_PATH);
    let foundryDays = 0;
    for (let day = 0; day < 365; day += 1) {
        const dateKey = new Date(Date.UTC(2026, 0, day + 1)).toISOString().slice(0, 10);
        const selectedSlot = selectedOrbFoundrySlotForDate({ dateKey, config });
        if (selectedSlot) {
            foundryDays += 1;
            assert.ok(config.schedule.some((slot) => slot.id === selectedSlot && slot.contentType === "short"));
        }
    }
    assert.ok(foundryDays >= 75 && foundryDays <= 110, `expected about 25% Foundry days, got ${foundryDays}/365`);

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
    assert.equal(plan.format, "square");
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
    }), /black, outline-free, and large-square/);
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
    assert.equal(plan.title, "Orb Race Tournament VS 16 Entrants");
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

test("Orb Foundry upload gate verifies the actual black, outline-free square recording", async () => {
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
                social: { format: "square" },
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
    }), /black, outline-free, large-square format/);
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
    assert.deepEqual(current.map(({ slot }) => slot.id), [
        "noon-short",
        "noon-longform",
        "afternoon-short",
        "afternoon-longform",
    ]);
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
    const raceIds = plans.flatMap(({ matchup }) => matchup.raceOrbs);
    assert.equal(new Set(raceIds).size, raceIds.length);
    for (const { slot, matchup } of plans) {
        const plan = buildYouTubePublishPlan({ dateKey, slot, config, matchup });
        assert.equal(validateYouTubeGenerationSpec({ plan, config }), true, slot.id);
        if (matchup.battleQuality.fallback) {
            assert.equal(plan.battleQuality.fallback, true, slot.id);
            assert.ok(plan.battleQuality.plannedActionDurationSeconds >= plan.minimumDurationSeconds, slot.id);
        }
    }
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
    assert.equal(tournament.planningError, undefined);
    for (const entry of plans) {
        if (entry.slot.id === "afternoon-longform") continue;
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
    await assert.rejects(() => publishDueYouTubeSlots({
        dateKey,
        batch: true,
        dryRun: true,
        configPath,
        logger: {
            log: (value) => logs.push(String(value)),
            error: (value) => errors.push(String(value)),
        },
    }), /YouTube publishing failed for noon-short, noon-longform, afternoon-short\./);
    assert.equal(errors.length, 3);
    assert.equal(logs.length, 1);
    assert.match(logs[0], /"slotId": "afternoon-longform"/);
    assert.match(logs[0], /"videoKind": "tournament"/);
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
