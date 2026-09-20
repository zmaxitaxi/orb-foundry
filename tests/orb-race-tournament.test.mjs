import assert from "node:assert/strict";
import test from "node:test";
import {
    ORB_RACE_TOURNAMENT_DEFAULT_SIZE,
    ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE,
    ORB_RACE_TOURNAMENT_PRESENTATION_TIMING,
    ORB_RACE_TOURNAMENT_SIZES,
    advanceOrbRaceTournamentPresentation,
    buildOrbRaceTournamentLayerPreset,
    createOrbRaceTournament,
    createOrbRaceTournamentPreviewSelection,
    currentOrbRaceTournamentMatch,
    deserializeOrbRaceTournament,
    normalizeOrbRaceTournamentPresentationTiming,
    normalizeOrbRaceTournamentRoundSelection,
    normalizeOrbRaceTournamentOptions,
    orbRaceTournamentWizardDefaults,
    prepareOrbRaceTournamentMatchForRecording,
    recordOrbRaceTournamentResult,
    selectOrbRaceTournamentEntrants,
    serializeOrbRaceTournament,
    snapshotOrbRaceTournament,
    validateOrbRaceTournamentState,
    viewOrbRaceTournamentMatch,
} from "../src/orb-race-tournament.js";
import { ORB_RACER_IDS } from "../src/orb-race.js";
import {
    captureReplayFrame,
    completeOrbRaceTournamentMatch,
    createSimulation,
    stepSimulation,
} from "../src/simulation.js";
import { ORB_RACE_MODE } from "../src/orb-race.js";

function tournamentOptions(size, overrides = {}) {
    const entrants = ORB_RACER_IDS.slice(0, size);
    return {
        enabled: true,
        size,
        entrants,
        seedingMode: "custom",
        seedOrder: entrants,
        recordingScope: "each-match",
        seed: 2406,
        ...overrides,
    };
}

test("Orb Race tournaments support every bracket size with a two-sided topology", () => {
    for (const size of ORB_RACE_TOURNAMENT_SIZES) {
        const tournament = createOrbRaceTournament(tournamentOptions(size));
        const matchCount = tournament.rounds.reduce((total, round) => total + round.matches.length, 0);

        assert.equal(tournament.size, size);
        assert.equal(tournament.rounds.length, Math.log2(size));
        assert.equal(matchCount, size - 1);
        assert.equal(tournament.leftSeedSlots.length, size / 2);
        assert.equal(tournament.rightSeedSlots.length, size / 2);
        assert.equal(tournament.seedingMode, "custom");
        assert.equal(tournament.recordingScope, "each-match");
        assert.equal(tournament.recordingScopeLegacy, ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE);
        assert.deepEqual(tournament.seedOrder, ORB_RACER_IDS.slice(0, size));
        assert.equal(new Set(tournament.entrantIds).size, size);
        assert.equal(currentOrbRaceTournamentMatch(tournament).status, "active");
        assert.ok(tournament.rounds.at(-1).matches[0].side === "center");
    }
});

test("custom seedOrder is canonical, while seeded random ordering is replay-stable", () => {
    const entrants = ORB_RACER_IDS.slice(0, 8);
    const customOrder = [...entrants].reverse();
    const custom = createOrbRaceTournament(tournamentOptions(8, {
        entrants,
        seedOrder: customOrder,
    }));
    assert.deepEqual(custom.selectedEntrantIds, entrants);
    assert.deepEqual(custom.seedOrder, customOrder);
    assert.deepEqual(currentOrbRaceTournamentMatch(custom).entrantIds, customOrder.slice(0, 2));

    const randomA = createOrbRaceTournament(tournamentOptions(8, {
        entrants,
        seedingMode: "random",
        seedOrder: null,
        seed: 9917,
    }));
    const randomB = createOrbRaceTournament(tournamentOptions(8, {
        entrants,
        seedingMode: "random",
        seedOrder: null,
        seed: 9917,
    }));
    const randomC = createOrbRaceTournament(tournamentOptions(8, {
        entrants,
        seedingMode: "random",
        seedOrder: null,
        seed: 9918,
    }));
    assert.deepEqual(randomA.seedOrder, randomB.seedOrder);
    assert.notDeepEqual(randomA.seedOrder, randomC.seedOrder);
    assert.deepEqual([...randomA.seedOrder].sort(), [...entrants].sort());

    const snapshot = snapshotOrbRaceTournament(custom);
    assert.equal(snapshot.seedingMode, "custom");
    assert.equal(snapshot.recordingScope, "each-match");
    assert.equal(snapshot.recordingScopeLegacy, "individual-match");
    assert.deepEqual(snapshot.seedOrder, customOrder);
});

test("wizard defaults deterministically auto-select a unique roster for every supported size", () => {
    for (const size of ORB_RACE_TOURNAMENT_SIZES) {
        const first = selectOrbRaceTournamentEntrants({ size, seed: 4411 });
        const second = selectOrbRaceTournamentEntrants({ size, seed: 4411 });
        assert.equal(first.length, size);
        assert.equal(new Set(first).size, size);
        assert.ok(first.every((orbId) => ORB_RACER_IDS.includes(orbId)));
        assert.deepEqual(first, second);
    }
    const defaults = orbRaceTournamentWizardDefaults({ seed: 882, size: 16 });
    assert.equal(defaults.size, 16);
    assert.equal(defaults.entrantIds.length, 16);
    assert.equal(defaults.seedingMode, "random");
    assert.equal(defaults.recordingScope, "each-match");
    assert.equal(defaults.recordingSelection, "match");
    assert.equal(ORB_RACE_TOURNAMENT_DEFAULT_SIZE, 8);
});

test("the shared tournament layer preset always reaches its requested target", () => {
    for (const count of [3, 5]) {
        for (const target of [110, 2_500, 10_000]) {
            const first = buildOrbRaceTournamentLayerPreset(count, target);
            const second = buildOrbRaceTournamentLayerPreset(count, target);
            assert.equal(first.length, count);
            assert.equal(first.at(-1), target);
            assert.ok(first.every((value, index) => index === 0 || value >= first[index - 1]));
            assert.deepEqual(first, second);
        }
    }
    const tournament = normalizeOrbRaceTournamentOptions({
        enabled: true,
        size: 4,
        entrants: ORB_RACER_IDS.slice(0, 4),
        recordingScope: "whole-round",
        recordingSelection: "selected-round",
        landscapeLayerCount: 3,
        finalLayerHealth: 10_000,
    });
    assert.deepEqual(tournament.sharedLayerValues, [10, 500, 10_000]);
    assert.deepEqual(tournament.sharedLayerValues, tournament.matchSettings?.layerStrengths || tournament.sharedLayerValues);

    const manual = normalizeOrbRaceTournamentOptions({
        enabled: true,
        size: 4,
        entrants: ORB_RACER_IDS.slice(0, 4),
        recordingScope: "whole-round",
        recordingSelection: "selected-round",
        landscapeLayerCount: 3,
        finalLayerHealth: 10_000,
        sharedLayerValues: [1, 5, 110],
    });
    assert.deepEqual(manual.sharedLayerValues, [1, 5, 110], "manual walls remain an explicit post-preset override");
});

test("round selection accepts config labels, preserves mutable subsets, and only whole tournament selects all", () => {
    const selected = normalizeOrbRaceTournamentRoundSelection({
        recordingScope: "whole-round",
        recordingSelection: "selected-round",
        selectedRoundIds: ["semifinals"],
    }, 8);
    assert.deepEqual(selected.selectedRoundIndices, [1]);
    assert.deepEqual(selected.selectedRoundIds, ["round-2"]);
    assert.equal(selected.allRounds, false);

    const empty = normalizeOrbRaceTournamentRoundSelection({
        recordingScope: "whole-round",
        recordingSelection: "selected-round",
        selectedRoundIds: [],
    }, 8);
    assert.deepEqual(empty.selectedRoundIndices, []);
    assert.equal(empty.allRounds, false);

    const whole = normalizeOrbRaceTournamentRoundSelection({
        recordingScope: "whole-tournament",
        recordingSelection: "whole-tournament",
        selectedRoundIds: ["semifinals"],
    }, 8);
    assert.deepEqual(whole.selectedRoundIndices, [0, 1, 2]);
    assert.deepEqual(whole.selectedRoundIds, ["round-1", "round-2", "round-3"]);
    assert.equal(whole.allRounds, true);

    const tournament = createOrbRaceTournament(tournamentOptions(8, {
        recordingScope: "whole-round",
        recordingSelection: "selected-round",
        roundsToRecord: ["semifinals"],
    }));
    assert.deepEqual(tournament.selectedRoundIndices, [1]);
    assert.deepEqual(tournament.selectedRoundIds, ["round-2"]);
    assert.ok(tournament.recording.queue.every((entry) => entry.included === (entry.roundIndex === 1)));
});

test("preview selections are pure and choose portrait match versus reflowed landscape plans", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(8, {
        recordingScope: "whole-round",
        recordingSelection: "selected-round",
        selectedRoundIds: ["round-2"],
        landscapeLayerCount: 3,
    }));
    const before = JSON.stringify(snapshotOrbRaceTournament(tournament));
    const match = createOrbRaceTournamentPreviewSelection({
        selection: "match",
        matchId: "round-1-match-1",
    }, tournament);
    const round = createOrbRaceTournamentPreviewSelection({
        selection: "selected-round",
        roundId: "round-2",
        landscapeLayerCount: 3,
    }, tournament);
    const whole = createOrbRaceTournamentPreviewSelection({
        selection: "whole-tournament",
        landscapeLayerCount: 5,
    }, tournament);

    assert.equal(match.valid, true);
    assert.equal(match.readOnly, true);
    assert.equal(match.recordingScope, "each-match");
    assert.deepEqual(match.dimensions, { width: 1080, height: 1920 });
    assert.equal(match.layerCount, 3);
    assert.equal(match.match.id, "round-1-match-1");

    assert.equal(round.valid, true);
    assert.equal(round.recordingScope, "whole-round");
    assert.deepEqual(round.dimensions, { width: 1920, height: 1080 });
    assert.equal(round.roundId, "round-2");
    assert.equal(round.layerCount, 3);
    assert.equal(round.sharedLayerValues.length, 3);

    assert.equal(whole.recordingScope, "whole-tournament");
    assert.equal(whole.recordingSegmentScope, "whole-round");
    assert.equal(whole.layerCount, 5);
    assert.deepEqual(whole.dimensions, { width: 1920, height: 1080 });
    assert.equal(JSON.stringify(snapshotOrbRaceTournament(tournament)), before);
});

test("tournament presentation uses one second of motion then a 1.75-second centered hold", () => {
    const timing = normalizeOrbRaceTournamentPresentationTiming({ zoomDuration: 1.1, conclusionDuration: 9 });
    assert.equal(timing.zoomDuration, 1, "legacy overrides cannot change the canonical camera motion");
    assert.equal(timing.matchupHoldDuration, 1.75);
    assert.equal(timing.preFightDuration, 2.75);
    assert.equal(timing.conclusionDuration, 2, "conclusion is clamped to the supported upper bound");
    assert.equal(normalizeOrbRaceTournamentPresentationTiming().conclusionDuration, 1.75);
    assert.equal(ORB_RACE_TOURNAMENT_PRESENTATION_TIMING.bracketIntroDuration, 0);
    assert.equal(ORB_RACE_TOURNAMENT_PRESENTATION_TIMING.zoomDuration, 1);
    assert.equal(ORB_RACE_TOURNAMENT_PRESENTATION_TIMING.cameraPanDuration, 1);
    assert.equal(
        normalizeOrbRaceTournamentPresentationTiming({
            zoomDuration: 1.75,
            cameraPanDuration: 1.75,
        }).cameraPanDuration,
        1,
        "restored legacy timing cannot lengthen the camera pan",
    );

    const tournament = createOrbRaceTournament(tournamentOptions(4, {
        presentationTiming: { zoomDuration: 1.75 },
    }));
    const first = currentOrbRaceTournamentMatch(tournament);
    assert.equal(first.presentation.introMode, "full-intro");
    assert.equal(first.presentation.bracketIntroDuration, 0);
    assert.equal(first.presentation.zoomDuration, 1);
    assert.equal(first.presentation.zoomEndAt, 1);
    assert.equal(first.presentation.holdStartAt, 1);
    assert.equal(first.presentation.holdEndAt, 2.75);
    assert.equal(first.presentation.battleAt, 2.75);
    assert.equal(advanceOrbRaceTournamentPresentation(tournament, 0.999).phase, "bracket-zoom");
    assert.equal(advanceOrbRaceTournamentPresentation(tournament, 1).phase, "matchup-hold");
    assert.equal(advanceOrbRaceTournamentPresentation(tournament, 2.749).phase, "matchup-hold");
    assert.equal(advanceOrbRaceTournamentPresentation(tournament, 2.75).phase, "battle");
    recordOrbRaceTournamentResult(tournament, {
        winnerIndex: 0,
        resultAt: first.presentation.battleAt,
    });
    const conclusionAt = first.presentation.conclusionAt;
    assert.equal(first.presentation.conclusionEndAt, conclusionAt + 1.75);
    assert.equal(tournament.presentation.phase, "conclusion");
    assert.notEqual(tournament.presentation.conclusion.destinationLabel, "???");
    assert.equal(first.outputNode.orbId, first.winnerOrbId);
    assert.equal(first.outputNode.label, tournament.presentation.conclusion.destinationLabel);
    assert.equal(tournament.presentation.dustOutProgress, 0);
    assert.equal(tournament.presentation.winnerFadeInProgress, 0);
    assert.equal("winnerTravelProgress" in tournament.presentation, false);
    assert.equal("tournamentAdvancementPosition" in tournament.presentation, false);

    const halfway = advanceOrbRaceTournamentPresentation(tournament, conclusionAt + 0.875);
    assert.equal(halfway.phase, "conclusion");
    assert.equal(halfway.conclusion.dustOutProgress, 1);
    assert.equal(halfway.conclusion.winnerFadeInProgress, 0);
    const finished = advanceOrbRaceTournamentPresentation(tournament, conclusionAt + 1.75);
    assert.equal(finished.conclusion.winnerFadeInProgress, 1);
});

test("long-form follow-ups pan for one second, hold for 1.75 seconds, then battle", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(4, {
        recordingScope: "whole-tournament",
        recordingSelection: "whole-tournament",
    }));
    const first = currentOrbRaceTournamentMatch(tournament);
    assert.equal(first.presentation.introMode, "full-intro");
    assert.equal(first.presentation.zoomDuration, 1);
    assert.equal(tournament.recording.longFormIntroMatchId, first.id);

    recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, resultAt: first.presentation.battleAt });
    const second = currentOrbRaceTournamentMatch(tournament);
    assert.equal(tournament.lastResult.nextMatchAt, first.presentation.conclusionEndAt);
    assert.equal(second.presentation.introMode, "camera-pan");
    assert.equal(second.presentation.transitionStartAt, first.presentation.conclusionEndAt);
    assert.equal(second.presentation.transitionDuration, 1);
    assert.equal(second.presentation.transitionEndAt, second.presentation.transitionStartAt + 1);
    assert.equal(second.presentation.panEndAt, second.presentation.transitionEndAt);
    assert.equal(second.presentation.holdStartAt, second.presentation.panEndAt);
    assert.equal(second.presentation.holdEndAt, second.presentation.panEndAt + 1.75);
    assert.equal(second.presentation.battleAt, second.presentation.holdEndAt);
    assert.deepEqual(second.presentation.cameraTransition, {
        type: "camera-pan",
        fromMatchId: first.id,
        toMatchId: second.id,
        startAt: first.presentation.conclusionEndAt,
        endAt: second.presentation.transitionEndAt,
        duration: 1,
    });

    const pan = advanceOrbRaceTournamentPresentation(tournament, second.presentation.transitionStartAt + 0.5);
    assert.equal(pan.phase, "camera-pan");
    assert.equal(pan.cameraTransition.type, "camera-pan");
    assert.ok(Math.abs(pan.cameraPanProgress - 0.5) < 1e-12);
    const hold = advanceOrbRaceTournamentPresentation(tournament, second.presentation.transitionEndAt);
    assert.equal(hold.phase, "matchup-hold");
    assert.equal(hold.matchId, second.id);
    const battle = advanceOrbRaceTournamentPresentation(tournament, second.presentation.battleAt);
    assert.equal(battle.phase, "battle");
    assert.equal(battle.matchId, second.id);

    recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, resultAt: second.presentation.battleAt });
    const third = currentOrbRaceTournamentMatch(tournament);
    assert.equal(third.presentation.introMode, "camera-pan");
    assert.equal(third.presentation.transitionDuration, 1);
    assert.equal(tournament.recording.cameraPanCount, 2);
    assert.deepEqual(tournament.recording.includedMatchIds, [first.id, second.id, third.id]);
    assert.equal(tournament.recording.segments[0].matchTimelines.length, 3);
    assert.deepEqual(
        tournament.recording.segments[0].matchTimelines.map((timeline) => timeline.introMode),
        ["full-intro", "camera-pan", "camera-pan"],
    );
});

test("selected-round long form gives only its first included matchup a full intro", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(8, {
        recordingScope: "whole-round",
        recordingSelection: "selected-round",
        selectedRoundIds: ["round-2"],
    }));
    while (currentOrbRaceTournamentMatch(tournament).roundIndex === 0) {
        const match = currentOrbRaceTournamentMatch(tournament);
        recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, resultAt: match.presentation.battleAt });
    }
    const firstIncluded = currentOrbRaceTournamentMatch(tournament);
    assert.equal(firstIncluded.roundIndex, 1);
    assert.equal(firstIncluded.presentation.introMode, "full-intro");
    assert.equal(tournament.recording.longFormIntroMatchId, firstIncluded.id);

    recordOrbRaceTournamentResult(tournament, {
        winnerIndex: 0,
        resultAt: firstIncluded.presentation.battleAt,
    });
    const secondIncluded = currentOrbRaceTournamentMatch(tournament);
    assert.equal(secondIncluded.roundIndex, 1);
    assert.equal(secondIncluded.presentation.introMode, "camera-pan");
    assert.equal(secondIncluded.presentation.transitionDuration, 1);
    assert.equal(tournament.recording.cameraPanCount, 1);
    assert.deepEqual(tournament.recording.segments[0].matchIds, [firstIncluded.id, secondIncluded.id]);
});

test("individual short matchup recordings retain a full intro for every match", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(4, {
        recordingScope: "each-match",
        recordingSelection: "match",
    }));
    const first = currentOrbRaceTournamentMatch(tournament);
    recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, resultAt: first.presentation.battleAt });
    const second = currentOrbRaceTournamentMatch(tournament);
    assert.equal(first.presentation.introMode, "full-intro");
    assert.equal(second.presentation.introMode, "full-intro");
    assert.equal(second.presentation.bracketIntroDuration, 0);
    assert.equal(second.presentation.zoomDuration, 1);
    assert.equal(second.presentation.battleAt - second.presentation.introBracketAt, 2.75);
    assert.equal(second.presentation.introBracketAt, first.presentation.conclusionEndAt + 0.55);
    assert.equal(tournament.recording.cameraPanCount, 0);
});

test("reduced-motion timing is deterministic and skips intro/zoom/conclusion", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(4, {
        presentationTiming: { reducedMotion: true },
    }));
    const first = currentOrbRaceTournamentMatch(tournament);
    assert.equal(first.presentation.bracketZoomAt, 0);
    assert.equal(first.presentation.battleAt, 0);
    recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, resultAt: 0 });
    assert.equal(first.presentation.conclusionEndAt, 0);
    assert.equal(tournament.presentation.conclusion.progress, 1);
});

test("64-seed layout keeps left/right seed slots and source/target connections deterministic", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(64, { seed: 64 }));
    assert.deepEqual(tournament.leftSeedSlots.map((slot) => slot.seedSlot), Array.from({ length: 32 }, (_, index) => index));
    assert.deepEqual(tournament.rightSeedSlots.map((slot) => slot.seedSlot), Array.from({ length: 32 }, (_, index) => 32 + index));

    const firstRound = tournament.rounds[0].matches;
    assert.equal(firstRound.filter((match) => match.side === "left").length, 16);
    assert.equal(firstRound.filter((match) => match.side === "right").length, 16);
    assert.ok(firstRound.slice(0, 16).every((match) => match.left.seedSlot < 32 && match.right.seedSlot < 32));
    assert.ok(firstRound.slice(16).every((match) => match.left.seedSlot >= 32 && match.right.seedSlot >= 32));
    assert.ok(tournament.seedSlots.every((slot) => slot.targetMatchId));
    assert.ok(tournament.rounds.flatMap((round) => round.matches).every((match, index, matches) => (
        index === matches.length - 1
        || match.roundIndex === tournament.rounds.length - 1
        || Boolean(match.targetMatchId)
    )));

    const final = tournament.rounds.at(-1).matches[0];
    assert.equal(final.side, "center");
    assert.equal(final.sourceMatchIds.length, 2);
    assert.equal(final.targetMatchId, null);
});

test("64-entry long-form progression keeps focused IDs, direct pans, holds, hydration, and committed winners", () => {
    const runBracket = (seed) => {
        let tournament = createOrbRaceTournament(tournamentOptions(64, {
            seed,
            recordingScope: "whole-tournament",
            recordingSelection: "whole-tournament",
            landscapeLayerCount: 5,
        }));
        const first = currentOrbRaceTournamentMatch(tournament);
        assert.equal(first.id, "round-1-match-1");
        assert.equal(tournament.selectedMatchId, first.id);
        assert.equal(tournament.presentation.currentMatchId, first.id);
        assert.equal(tournament.presentation.roundIndex, 0);
        assert.equal(tournament.presentation.matchIndex, 0);
        assert.equal(tournament.presentation.fromMatchId, null);
        assert.equal(tournament.presentation.toMatchId, first.id);

        for (let completed = 0; completed < 63; completed += 1) {
            const match = currentOrbRaceTournamentMatch(tournament);
            const winnerId = match.left.entrantId;
            const resultAt = match.presentation.battleAt;
            recordOrbRaceTournamentResult(tournament, {
                winnerId,
                resultAt,
            });
            const committed = tournament.rounds[match.roundIndex].matches[match.matchIndex];
            assert.equal(committed.status, "completed");
            assert.equal(committed.winnerId, winnerId);
            assert.equal(committed.outputNode.entrantId, winnerId);
            assert.equal(committed.outputNode.orbId, committed.winnerOrbId);

            if (tournament.status === "completed") break;

            // Hydrate while the previous conclusion is handing off to the next
            // matchup. This is the state that a 64-entry recorder persists.
            if (completed === 30) tournament = deserializeOrbRaceTournament(serializeOrbRaceTournament(tournament));

            const next = currentOrbRaceTournamentMatch(tournament);
            assert.equal(tournament.selectedMatchId, next.id);
            assert.equal(tournament.currentMatchId, next.id);
            assert.equal(tournament.activeMatchId, next.id);
            assert.equal(tournament.presentation.phase, "conclusion");
            assert.equal(tournament.presentation.currentMatchId, match.id);
            assert.equal(tournament.presentation.fromMatchId, match.id);
            assert.equal(tournament.presentation.toMatchId, next.id);
            assert.equal(tournament.presentation.roundIndex, match.roundIndex);
            assert.equal(tournament.presentation.matchIndex, match.matchIndex);
            assert.equal(tournament.presentationHold.fromMatchId, match.id);
            assert.equal(tournament.presentationHold.toMatchId, next.id);
            assert.equal(tournament.presentation.cameraPan.fromMatchId, match.id);
            assert.equal(tournament.presentation.cameraPan.toMatchId, next.id);
            assert.equal(tournament.presentation.cameraPan.duration, 1);
            assert.equal(tournament.presentation.cameraPan.active, false);
            assert.equal(tournament.lastResult.nextMatchId, next.id);
            assert.equal(tournament.lastResult.nextRoundIndex, next.roundIndex);
            assert.equal(tournament.lastResult.nextMatchIndex, next.matchIndex);
            const recordingTimeline = tournament.recording.segments[0].matchTimelines
                .find((timeline) => timeline.matchId === match.id);
            assert.equal(recordingTimeline.fromMatchId, match.id);
            assert.equal(recordingTimeline.toMatchId, next.id);
            assert.equal(next.presentation.introMode, "camera-pan");
            assert.equal(next.presentation.roundIndex, next.roundIndex);
            assert.equal(next.presentation.matchIndex, next.matchIndex);
            assert.equal(next.presentation.transitionFromMatchId, match.id);
            assert.equal(next.presentation.transitionToMatchId, next.id);
            assert.equal(next.presentation.transitionDuration, 1);
            assert.equal(next.presentation.zoomEndAt, null, "direct handoffs never zoom back out");
            assert.equal(next.presentation.holdEndAt, next.presentation.panEndAt + 1.75);
            assert.equal(next.presentation.battleAt, next.presentation.panEndAt + 1.75);

            const hydrated = deserializeOrbRaceTournament(serializeOrbRaceTournament(tournament));
            assert.equal(hydrated.presentationHold.fromMatchId, match.id);
            assert.equal(hydrated.presentationHold.toMatchId, next.id);
            assert.equal(currentOrbRaceTournamentMatch(hydrated).id, next.id);
            assert.equal(hydrated.rounds[match.roundIndex].matches[match.matchIndex].winnerId, winnerId);

            const pan = advanceOrbRaceTournamentPresentation(
                tournament,
                next.presentation.transitionStartAt + 0.5,
            );
            assert.equal(pan.phase, "camera-pan");
            assert.equal(pan.matchId, next.id);
            assert.equal(pan.fromMatchId, match.id);
            assert.equal(pan.toMatchId, next.id);
            assert.ok(Math.abs(pan.cameraPanProgress - 0.5) < 1e-12);
            assert.equal(pan.cameraPan.duration, 1);
            assert.equal(pan.matchupHold.active, false);

            const hold = advanceOrbRaceTournamentPresentation(tournament, next.presentation.panEndAt);
            assert.equal(hold.phase, "matchup-hold");
            assert.equal(hold.matchId, next.id);
            assert.equal(hold.fromMatchId, match.id);
            assert.equal(hold.toMatchId, next.id);
            assert.equal(hold.matchupHold.active, true);
            assert.equal(hold.matchupHold.duration, 1.75);
            assert.equal(hold.matchupHold.startAt, next.presentation.panEndAt);
            assert.equal(hold.matchupHold.endAt, next.presentation.battleAt);

            const battle = advanceOrbRaceTournamentPresentation(tournament, next.presentation.battleAt);
            assert.equal(battle.phase, "battle");
            assert.equal(battle.matchId, next.id);
            assert.equal(tournament.presentation.currentMatchId, next.id);
        }

        assert.equal(tournament.status, "completed");
        assert.equal(tournament.completedMatchCount, 63);
        assert.equal(tournament.results.length, 63);
        assert.equal(tournament.recording.cameraPanCount, 62);
        assert.equal(tournament.recording.segments.length, 1);
        assert.equal(tournament.recording.segments[0].matchIds.length, 63);
        assert.equal(tournament.recording.longFormIntroMatchId, "round-1-match-1");
        assert.ok(tournament.rounds.every((round) => round.status === "completed"));
        assert.ok(tournament.rounds.flatMap((round) => round.matches).every((match) => (
            match.status === "completed" && match.winnerId && match.outputNode.entrantId === match.winnerId
        )));
        return tournament;
    };

    const first = runBracket(64064);
    const second = runBracket(64064);
    assert.equal(first.championId, first.results.at(-1).advancingEntrantId);
    assert.equal(first.championOrbId, first.results.at(-1).advancingOrbId);
    assert.deepEqual(snapshotOrbRaceTournament(first), snapshotOrbRaceTournament(second));
});

test("duplicate entrants are rejected unless explicitly enabled", () => {
    assert.throws(
        () => createOrbRaceTournament(tournamentOptions(4, {
            entrants: ["duplicator", "duplicator", "orbital", "drill"],
            seedOrder: ["duplicator", "duplicator", "orbital", "drill"],
        })),
        /Duplicate Orb Race tournament entrant/,
    );
    const tournament = createOrbRaceTournament(tournamentOptions(4, {
        entrants: ["duplicator", "duplicator", "orbital", "drill"],
        seedOrder: ["duplicator", "duplicator", "orbital", "drill"],
        allowDuplicateEntrants: true,
    }));
    assert.equal(tournament.entrants[0].orbId, "duplicator");
    assert.notEqual(tournament.entrants[0].id, tournament.entrants[1].id);
});

test("match results advance through rounds, preserve connections, and select a champion", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(4));
    const completedMatches = [];
    while (tournament.status !== "completed") {
        const match = currentOrbRaceTournamentMatch(tournament);
        completedMatches.push({ id: match.id, label: match.roundLabel });
        recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, duration: 3 });
    }

    assert.equal(tournament.completedMatchCount, 3);
    assert.equal(tournament.results.length, 3);
    assert.equal(tournament.championOrbId, "duplicator");
    assert.equal(tournament.status, "completed");
    assert.equal(tournament.activeMatchId, null);
    assert.equal(tournament.currentMatch.id, "round-2-match-1");
    assert.deepEqual(completedMatches.map((match) => match.label), ["SEMIFINALS", "SEMIFINALS", "CHAMPIONSHIP"]);
    assert.ok(tournament.rounds.flatMap((round) => round.matches).every((match) => match.status === "completed"));
    assert.ok(tournament.recording.segments.every((segment) => (
        segment.scope === "each-match"
        && segment.legacyScope === "individual-match"
        && segment.status === "completed"
        && segment.endAt >= segment.startAt
    )));
    assert.equal(tournament.recording.segments.length, 3);
    assert.equal(tournament.presentation.phase, "champion-conclusion");
});

test("whole-round recording creates one segment per round and presentation timestamps stay ordered", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(8, {
        recordingScope: "whole-round",
        recordingSelection: "whole-tournament",
    }));
    const firstMatch = currentOrbRaceTournamentMatch(tournament);
    assert.equal(firstMatch.presentation.introBracketAt, 0);
    assert.equal(firstMatch.presentation.introBracketAt, firstMatch.presentation.bracketZoomAt);
    assert.ok(firstMatch.presentation.bracketZoomAt < firstMatch.presentation.zoomEndAt);
    assert.ok(firstMatch.presentation.zoomEndAt < firstMatch.presentation.battleAt);
    assert.equal(advanceOrbRaceTournamentPresentation(tournament, firstMatch.presentation.battleAt).phase, "battle");

    while (tournament.status !== "completed") {
        recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, duration: 1 });
    }
    assert.equal(tournament.recording.scope, "whole-round");
    assert.equal(tournament.recording.segmentScope, "whole-round");
    assert.equal(tournament.recording.segments.length, 3);
    assert.ok(tournament.recording.segments.every((segment) => (
        segment.scope === "whole-round"
        && segment.status === "completed"
        && segment.endAt >= segment.startAt
    )));
    assert.deepEqual(tournament.recording.segments.map((segment) => segment.id), [
        "round-1-recording",
        "round-2-recording",
        "round-3-recording",
    ]);
    assert.equal(tournament.rounds[0].label, "QUARTERFINALS");
    assert.equal(tournament.rounds[1].label, "SEMIFINALS");
    assert.equal(tournament.rounds[2].label, "CHAMPIONSHIP");
});

test("whole-tournament recording stays one continuous segment through the champion", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(4, {
        recordingScope: "whole-tournament",
        recordingSelection: "whole-tournament",
        landscapeLayerCount: 3,
    }));
    const completedMatchIds = [];
    while (tournament.status !== "completed") {
        const match = currentOrbRaceTournamentMatch(tournament);
        completedMatchIds.push(match.id);
        const resultAt = match.presentation.battleAt + 1;
        recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, resultAt });
        const result = tournament.lastResult;
        assert.equal(result.conclusionEndAt, result.conclusionAt + 1.75);
        if (tournament.status !== "completed") {
            assert.equal(tournament.activeMatchId, tournament.currentMatchId);
            assert.equal(tournament.currentMatch.presentation.introBracketAt, result.nextMatchAt);
            assert.ok(result.nextMatchAt >= result.conclusionEndAt);
            if (result.nextMatchIntroMode === "camera-pan") {
                assert.equal(result.nextMatchAt, result.conclusionEndAt);
                assert.equal(result.nextMatchTransition.startAt, result.nextMatchAt);
                assert.ok(result.nextMatchTransition.endAt > result.nextMatchTransition.startAt);
            } else {
                assert.ok(result.nextMatchAt > result.conclusionEndAt);
            }
        }
    }
    assert.deepEqual(completedMatchIds, ["round-1-match-1", "round-1-match-2", "round-2-match-1"]);
    assert.equal(tournament.recording.segments.length, 1);
    const segment = tournament.recording.segments[0];
    assert.equal(segment.scope, "whole-tournament");
    assert.deepEqual(segment.matchIds, completedMatchIds);
    assert.equal(segment.status, "completed");
    assert.equal(segment.startAt, 0);
    assert.equal(segment.endAt, tournament.completedAt);
    assert.equal(tournament.recording.queue.length, 1);
    assert.equal(tournament.recording.queue[0].status, "completed");
    assert.equal(tournament.recording.queue[0].startAt, 0);
    assert.equal(tournament.recording.queue[0].endAt, tournament.completedAt);
    assert.deepEqual(tournament.recording.queue[0].matchIds, completedMatchIds);
    assert.equal(tournament.recording.activeSegmentId, null);
});

test("selected-round recording opens only the selected round and closes its boundary", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(8, {
        recordingScope: "whole-round",
        recordingSelection: "selected-round",
        selectedRoundIds: ["round-2"],
        landscapeLayerCount: 5,
    }));
    while (tournament.status !== "completed") {
        const match = currentOrbRaceTournamentMatch(tournament);
        recordOrbRaceTournamentResult(tournament, {
            winnerIndex: 0,
            resultAt: match.presentation.battleAt + 1,
        });
    }
    assert.deepEqual(tournament.recording.segments.map((segment) => segment.id), ["round-2-recording"]);
    assert.equal(tournament.recording.segments[0].status, "completed");
    assert.equal(tournament.recording.segments[0].startAt, tournament.recording.queue.find((entry) => entry.included).startAt);
    assert.equal(tournament.recording.segments[0].matchIds.length, 2);
    assert.ok(tournament.recording.segments[0].matchIds.every((id) => id.startsWith("round-2-")));
    assert.ok(tournament.recording.queue.every((entry) => entry.included === (entry.roundIndex === 1)));
    assert.equal(tournament.recording.queue.find((entry) => entry.included).status, "completed");
});

test("tournament recording plans use shared portrait/landscape layers and selected rounds", () => {
    const entrants = ORB_RACER_IDS.slice(0, 4);
    const portrait = createOrbRaceTournament(tournamentOptions(4, {
        entrants,
        recordingScope: "each-match",
    }));
    assert.equal(portrait.recordingFormat, "short-portrait");
    assert.deepEqual(portrait.recordingDimensions, { width: 1080, height: 1920 });
    assert.equal(portrait.recordingLayerCount, 3);
    assert.equal(portrait.sharedLayerValues.length, 3);
    assert.ok(portrait.recording.queue.every((entry) => (
        entry.layerValues.join(",") === portrait.sharedLayerValues.join(",")
        && entry.dimensions.width === 1080
        && entry.dimensions.height === 1920
    )));

    const landscapeThree = createOrbRaceTournament(tournamentOptions(4, {
        entrants,
        recordingScope: "whole-round",
        recordingSelection: "whole-tournament",
        landscapeLayerCount: 3,
        finalLayerHealth: 10_000,
    }));
    const landscapeFive = createOrbRaceTournament(tournamentOptions(4, {
        entrants,
        recordingScope: "whole-round",
        recordingSelection: "whole-tournament",
        landscapeLayerCount: 5,
        finalLayerHealth: 10_000,
    }));
    const wholeTournament = createOrbRaceTournament(tournamentOptions(4, {
        entrants,
        recordingScope: "whole-tournament",
        landscapeLayerCount: 3,
    }));
    assert.equal(wholeTournament.recordingScope, "whole-tournament");
    assert.equal(wholeTournament.recordingSegmentScope, "whole-round");
    assert.equal(wholeTournament.recording.selection, "whole-tournament");
    assert.equal(wholeTournament.recordingLayerCount, 3);
    for (const landscape of [landscapeThree, landscapeFive]) {
        assert.equal(landscape.recordingFormat, "long-landscape");
        assert.deepEqual(landscape.recordingDimensions, { width: 1920, height: 1080 });
        assert.equal(landscape.sharedLayerValues.length, landscape.recordingLayerCount);
        assert.equal(landscape.sharedLayerValues.at(-1), 10_000);
        assert.ok(landscape.recording.queue.every((entry) => (
            entry.layerValues.join(",") === landscape.sharedLayerValues.join(",")
        )));
    }
    assert.notDeepEqual(landscapeThree.sharedLayerValues, landscapeFive.sharedLayerValues);

    const selected = createOrbRaceTournament(tournamentOptions(8, {
        recordingScope: "whole-round",
        recordingSelection: "selected-round",
        selectedRoundIds: ["round-2"],
    }));
    assert.deepEqual(selected.selectedRoundIndices, [1]);
    assert.deepEqual(selected.selectedRoundIds, ["round-2"]);
    assert.ok(selected.recording.queue.some((entry) => entry.included && entry.roundIndex === 1));
    assert.ok(selected.recording.queue.every((entry) => entry.included === (entry.roundIndex === 1)));
});

test("tournament save/resume preserves results, recording boundaries, and deterministic seeds", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(4, {
        recordingScope: "whole-round",
        recordingSelection: "whole-tournament",
        landscapeLayerCount: 5,
    }));
    recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, duration: 2 });
    const serialized = serializeOrbRaceTournament(tournament);
    const validation = validateOrbRaceTournamentState(serialized);
    assert.equal(validation.valid, true);
    const restored = deserializeOrbRaceTournament(serialized);
    assert.ok(restored);
    assert.deepEqual(snapshotOrbRaceTournament(restored), snapshotOrbRaceTournament(tournament));
    assert.deepEqual(restored.deterministicSeeds, tournament.deterministicSeeds);
    assert.equal(restored.completedMatchCount, 1);
    assert.equal(restored.results.length, 1);
    assert.equal(restored.currentMatch.id, "round-1-match-2");
    assert.equal(restored.rounds[0].matches[0].status, "completed");
    const committed = restored.rounds[0].matches[0];
    assert.equal(committed.outputNode.entrantId, committed.winnerId);
    assert.equal(committed.outputNode.orbId, committed.winnerOrbId);
    assert.notEqual(committed.outputNode.label, "???");

    const next = currentOrbRaceTournamentMatch(restored);
    recordOrbRaceTournamentResult(restored, { winnerIndex: 0, resultAt: next.presentation.battleAt });
    const final = currentOrbRaceTournamentMatch(restored);
    assert.equal(final.roundIndex, 1);
    assert.ok([final.left.entrantId, final.right.entrantId].includes(committed.winnerId));
    assert.ok([final.left.label, final.right.label].includes(committed.outputNode.label));
    assert.notEqual(committed.outputNode.label, "???", "later activation cannot regress a committed node");

    const beforeView = JSON.stringify(snapshotOrbRaceTournament(restored));
    const view = viewOrbRaceTournamentMatch(restored, "round-1-match-1");
    assert.equal(view.readOnly, true);
    assert.equal(view.recording.format, "short-portrait");
    assert.equal(JSON.stringify(snapshotOrbRaceTournament(restored)), beforeView);
    assert.equal(validateOrbRaceTournamentState(JSON.stringify({ version: 99 })).valid, false);
});

test("match recording preparation clones a pending first-round matchup and preserves completed results", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(8));
    recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, duration: 2 });
    const sourceBefore = JSON.stringify(snapshotOrbRaceTournament(tournament));
    assert.equal(tournament.activeMatchId, "round-1-match-2");

    const prepared = prepareOrbRaceTournamentMatchForRecording(tournament, "round-1-match-3");
    assert.ok(prepared);
    assert.notEqual(prepared, tournament);
    assert.equal(JSON.stringify(snapshotOrbRaceTournament(tournament)), sourceBefore);
    assert.equal(prepared.recordingPreparation.recordingOnly, true);
    assert.equal(prepared.recordingPreparation.previousActiveMatchId, "round-1-match-2");
    assert.equal(prepared.recordingPreparation.restoredPreviousActiveMatchId, "round-1-match-2");

    assert.equal(prepared.activeMatchId, "round-1-match-3");
    assert.equal(prepared.currentMatchId, "round-1-match-3");
    assert.equal(prepared.rounds[0].matches[0].status, "completed");
    assert.equal(prepared.rounds[0].matches[1].status, "pending");
    assert.equal(prepared.rounds[0].matches[2].status, "active");
    assert.equal(prepared.completedMatchCount, 1);
    assert.equal(prepared.results.length, 1);
    assert.equal(prepared.recordingSelection, "match");
    assert.equal(prepared.recordingScope, "each-match");
    assert.equal(prepared.recordingSegmentScope, "each-match");
    assert.equal(prepared.recordingFormat, "short-portrait");
    assert.deepEqual(prepared.recordingDimensions, { width: 1080, height: 1920 });
    assert.equal(prepared.sharedLayerValues.length, 3);
    assert.equal(prepared.recording.layerValues.length, 3);
    assert.deepEqual(prepared.selectedRoundIds, ["round-1"]);
    assert.equal(prepared.clock, 0);
    assert.equal(prepared.presentation.phase, "bracket-zoom");
    assert.equal(prepared.presentationTimestamps.introBracketAt, 0);
    assert.equal(prepared.presentationTimestamps.zoomEndAt, 1);
    assert.equal(prepared.presentationTimestamps.holdEndAt, 2.75);
    assert.equal(prepared.presentationTimestamps.battleAt, 2.75);

    assert.equal(prepared.recording.segments.length, 1);
    assert.equal(prepared.recording.segments[0].id, "round-1-match-3-recording");
    assert.equal(prepared.recording.segments[0].status, "active");
    assert.equal(prepared.recording.segments[0].startAt, 0);
    assert.equal(prepared.recording.activeSegmentId, "round-1-match-3-recording");
    assert.equal(prepared.recording.queue.filter((entry) => entry.included).length, 1);
    assert.equal(prepared.recording.queue.find((entry) => entry.included).matchId, "round-1-match-3");

    const recordingSimulation = createSimulation({
        gameplayMode: ORB_RACE_MODE,
        seed: prepared.seed,
        raceTournamentState: prepared,
        raceLayerStrengths: prepared.sharedLayerValues,
    });
    assert.deepEqual(recordingSimulation.selectedRaceTeams, [
        [prepared.currentMatch.left.orbId],
        [prepared.currentMatch.right.orbId],
    ]);
    assert.equal(recordingSimulation.raceTournament.activeMatchId, "round-1-match-3");
});

test("match recording preparation is safe for completed, later-round, and unknown match IDs", () => {
    const tournament = createOrbRaceTournament(tournamentOptions(4));
    recordOrbRaceTournamentResult(tournament, { winnerIndex: 0, duration: 2 });
    const before = JSON.stringify(snapshotOrbRaceTournament(tournament));

    assert.equal(prepareOrbRaceTournamentMatchForRecording(tournament, "round-1-match-1"), null);
    assert.equal(prepareOrbRaceTournamentMatchForRecording(tournament, "round-2-match-1"), null);
    assert.equal(prepareOrbRaceTournamentMatchForRecording(tournament, "missing-match"), null);
    assert.equal(JSON.stringify(snapshotOrbRaceTournament(tournament)), before);
});

test("createSimulation uses the active tournament match and finalizes it once", () => {
    const tournament = {
        enabled: true,
        size: 4,
        entrants: ["duplicator", "speed", "orbital", "drill"],
        seedingMode: "custom",
        seedOrder: ["duplicator", "speed", "orbital", "drill"],
        recordingScope: "each-match",
    };
    const sim = createSimulation({
        gameplayMode: ORB_RACE_MODE,
        seed: 1,
        raceTeams: [["lazer"], ["sticky"]],
        raceTournament: tournament,
        raceLayerStrengths: [1],
    });
    assert.deepEqual(sim.selectedRaceTeams, [["duplicator"], ["speed"]]);
    assert.equal(sim.raceTournamentState, sim.raceTournament);
    assert.deepEqual(sim.raceTournament.seedOrder, tournament.seedOrder);
    assert.equal(sim.raceTournament.seedingMode, "custom");
    assert.equal(sim.raceTournament.recordingScope, "each-match");
    assert.equal(captureReplayFrame(sim).raceTournament.currentMatchId, "round-1-match-1");

    for (let step = 0; step < 120 * 30 && !sim.finished; step += 1) {
        stepSimulation(sim, 1 / 120);
    }
    assert.equal(sim.finished, true, "a low-health match should finish through normal Orb Race physics");
    assert.equal(sim.raceTournamentMatchRecorded, true);
    assert.equal(sim.raceTournament.completedMatchCount, 1);
    assert.ok(sim.events.some((event) => event.type === "race-tournament-match-result"));
    assert.ok(sim.events.some((event) => event.type === "race-tournament-advance"));

    const completedCount = sim.raceTournament.completedMatchCount;
    const stateBefore = JSON.stringify(captureReplayFrame(sim).raceTournament);
    completeOrbRaceTournamentMatch(sim);
    assert.equal(sim.raceTournament.completedMatchCount, completedCount);
    assert.equal(JSON.stringify(captureReplayFrame(sim).raceTournament), stateBefore);
});

test("creating the next match from raceTournamentState preserves the authoritative bracket", () => {
    const config = {
        gameplayMode: ORB_RACE_MODE,
        seed: 1,
        raceTournament: {
            enabled: true,
            size: 4,
            entrants: ["duplicator", "speed", "orbital", "drill"],
            seedingMode: "custom",
            seedOrder: ["duplicator", "speed", "orbital", "drill"],
            recordingScope: "each-match",
        },
        raceLayerStrengths: [1],
    };
    const first = createSimulation(config);
    for (let step = 0; step < 120 * 30 && !first.finished; step += 1) {
        stepSimulation(first, 1 / 120);
    }
    assert.equal(first.finished, true);
    const saved = serializeOrbRaceTournament(first.raceTournament);
    const second = createSimulation({
        ...config,
        raceTournament: null,
        raceTournamentState: saved,
        raceLayerStrengths: [999, 999, 999],
    });
    assert.equal(second.raceTournament.completedMatchCount, 1);
    assert.equal(second.raceTournament.currentMatchId, "round-1-match-2");
    assert.deepEqual(second.selectedRaceTeams, [["drill"], ["orbital"]]);
    assert.deepEqual(second.raceLayerStrengths, second.raceTournament.sharedLayerValues);
    assert.equal(second.raceTournament.rounds[0].matches[0].status, "completed");
    assert.equal(second.raceTournament.rounds[0].matches[1].status, "active");
    for (let step = 0; step < 120; step += 1) stepSimulation(second, 1 / 120);
    assert.ok(second.fighters.every((fighter) => fighter.raceBounces === 0), "resumed match waits for its deterministic battle presentation");
});

test("tournament match simulation remains seeded and replay-stable", () => {
    const options = {
        gameplayMode: ORB_RACE_MODE,
        seed: 7731,
        raceTournament: tournamentOptions(4, {
            seed: 7731,
            seedingMode: "random",
            seedOrder: null,
        }),
        raceLayerStrengths: [25, 40],
    };
    const first = createSimulation(options);
    const second = createSimulation(options);
    for (let step = 0; step < 120 * 2; step += 1) {
        stepSimulation(first, 1 / 120);
        stepSimulation(second, 1 / 120);
    }
    assert.equal(JSON.stringify(captureReplayFrame(first)), JSON.stringify(captureReplayFrame(second)));
    assert.equal(first.raceTournament.currentMatchId, second.raceTournament.currentMatchId);
    assert.deepEqual(first.selectedRaceTeams, second.selectedRaceTeams);
});
