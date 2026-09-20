import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
    TOURNAMENT_BRACKET_SIZES,
    TOURNAMENT_CONNECTOR_COLORS,
    TOURNAMENT_PRESENTATION_PHASES,
    normalizeTournamentSize,
    normalizeTournamentPresentation,
    tournamentAdvancementPosition,
    tournamentAdvancementDust,
    tournamentBracketLayout,
    tournamentCameraTransitionTransform,
    tournamentCameraEase,
    tournamentCameraTransform,
    tournamentChampionPosition,
    tournamentConclusionVisualState,
    tournamentLoserVisualState,
    tournamentMatchupZoomRect,
    tournamentMatchupZoomPadding,
    tournamentMatchupZoomTargetScale,
    tournamentLongformPanDuration,
    tournamentMatchupIntroVisualState,
    tournamentPresentationAtTime,
    tournamentPresentationCueFor,
    tournamentRecordingMatchKey,
    tournamentRoundCount,
    tournamentRoundLabel,
    tournamentWithCommittedResult,
} from "../src/orb-race-tournament-presentation.js";
import {
    TOURNAMENT_RECORDING_SCOPES,
    TournamentRecordingCoordinator,
    normalizeTournamentRecordingScope,
    tournamentRecordingShouldContinueAfterPreview,
    tournamentRecordingFilename,
} from "../src/recorder.js";
import { normalizeTournamentExportOptions } from "../src/social.js";

function fakeTournament(size) {
    const entrants = Array.from({ length: size }, (_, index) => ({
        id: `seed-${index + 1}`,
        slot: index,
        type: index % 2 ? "batman" : "speed",
        name: index % 2 ? "BATMAN" : "SPEED",
    }));
    const rounds = Array.from({ length: Math.log2(size) }, (_, roundIndex) => ({
        name: tournamentRoundLabel(size, roundIndex),
        matches: Array.from({ length: size / (2 ** (roundIndex + 1)) }, (_, matchIndex) => ({
            id: `round-${roundIndex}-match-${matchIndex}`,
            entrants: roundIndex === 0
                ? [`seed-${matchIndex * 2 + 1}`, `seed-${matchIndex * 2 + 2}`]
                : [],
            winnerId: null,
        })),
    }));
    return {
        size,
        entrants,
        rounds,
        currentRound: 0,
        currentMatch: 0,
        championId: null,
        completed: false,
    };
}

test("normalizes supported tournament sizes and round names", () => {
    assert.deepEqual(TOURNAMENT_BRACKET_SIZES, [4, 8, 16, 32, 64]);
    assert.equal(normalizeTournamentSize(64), 64);
    assert.equal(normalizeTournamentSize("not-a-size"), 8);
    assert.equal(normalizeTournamentSize(63), 64);
    assert.equal(tournamentRoundCount(64), 6);
    assert.equal(tournamentRoundLabel(64, 0), "ROUND OF 64");
    assert.equal(tournamentRoundLabel(64, 4), "SEMIFINALS");
    assert.equal(tournamentRoundLabel(64, 5), "CHAMPIONSHIP");
});

test("64-entry portrait layout has two 32-seed halves and a centered final", () => {
    const layout = tournamentBracketLayout({
        width: 1080,
        height: 1920,
        size: 64,
        tournament: fakeTournament(64),
    });
    assert.equal(layout.entries.length, 64);
    assert.equal(layout.entries.filter((node) => node.side === "left").length, 32);
    assert.equal(layout.entries.filter((node) => node.side === "right").length, 32);
    assert.equal(layout.matchNodes.length, 63);
    assert.equal(layout.centerFinal.x, 540);
    assert.equal(layout.centerFinal.y, layout.centerY);
    assert.equal(layout.centerFinal.side, "center");
    assert.ok(layout.entries.every((node) => node.cardRect.width > node.cardRect.height));
    assert.ok(layout.matchNodes.every((node) => node.cardRect.width > node.cardRect.height));
    assert.ok(layout.connections.length >= 64, "every seed path should connect into a match");
    assert.ok(layout.entries.every((node) => node.y >= layout.margins.top && node.y <= layout.margins.bottom));
    assert.ok(layout.entries.every((node) => node.label && node.label !== "BYE"));
});

test("portrait and landscape layouts use independent card reflow", () => {
    const tournament = fakeTournament(16);
    const portrait = tournamentBracketLayout({ width: 1080, height: 1920, size: 16, tournament });
    const landscape = tournamentBracketLayout({ width: 1920, height: 1080, size: 16, tournament });
    assert.notEqual(portrait.cardWidth, landscape.cardWidth);
    assert.ok(landscape.cardWidth >= portrait.cardWidth);
    assert.equal(portrait.centerFinal.x, 540);
    assert.equal(landscape.centerFinal.x, 960);
    assert.equal(portrait.portrait, true);
    assert.equal(landscape.portrait, false);
    assert.ok(portrait.connectorWidth < landscape.connectorWidth);
    assert.ok(portrait.activeConnectorWidth < landscape.activeConnectorWidth);
    assert.ok(portrait.cardWidth > 100, "portrait cards should reclaim surrounding horizontal whitespace");
    assert.ok(portrait.cardHeight >= 52, "portrait cards should use more of the available vertical row");
    assert.ok(portrait.labelFontSize > landscape.labelFontSize, "portrait names should be larger when the card grows");
    assert.ok(portrait.connectorWidth >= 1.6, "portrait connectors should remain visibly readable");
    assert.ok(portrait.activeConnectorWidth >= 2.2, "active portrait connectors should remain visibly readable");
    assert.ok(portrait.margins.bottom - portrait.margins.top > 1600, "portrait bracket should use the tall canvas");
    assert.ok(portrait.nodes.every((node) => (
        node.textFit?.clippedToCard === true
        && node.textFit?.overflow === "ellipsis"
        && node.textFit.labelMaxWidth <= node.rect.width
        && node.textFit.minFontSize > 0
    )));
});

test("small portrait brackets expand cards and connector weight into the available canvas", () => {
    const layout = tournamentBracketLayout({
        width: 1080,
        height: 1920,
        size: 4,
        tournament: fakeTournament(4),
    });
    assert.ok(layout.cardWidth >= 220, "four-entry portrait cards should use the open horizontal space");
    assert.ok(layout.cardHeight >= 100, "four-entry portrait cards should support large readable labels");
    assert.ok(layout.connectorWidth >= 2.8, "portrait bracket lines should remain visibly readable");
    assert.ok(layout.activeConnectorWidth >= 3.8, "active portrait paths should read clearly during zoom");
});

test("bracket connectors use thin screen-stable muted orthogonal strokes", () => {
    const layout = tournamentBracketLayout({
        width: 1080,
        height: 1920,
        size: 64,
        tournament: fakeTournament(64),
    });
    assert.deepEqual(layout.connectorColors, TOURNAMENT_CONNECTOR_COLORS);
    assert.equal(layout.connectorStrokeSpace, "screen");
    assert.ok(layout.connectorWidth <= 3.2);
    assert.ok(layout.activeConnectorWidth <= 4.2);
    for (const destination of layout.matchNodes) {
        const incoming = layout.connections.filter((connection) => connection.to === destination.id);
        assert.equal(incoming.length, 2, `${destination.id} should have two incoming source paths`);
        if (destination.side !== "center" && incoming[0].side === incoming[1].side) {
            assert.equal(incoming[0].spineX, incoming[1].spineX, `${destination.id} should use one vertical spine`);
        }
        for (const connection of incoming) {
            assert.equal(connection.points[1].x, connection.points[2].x);
            assert.equal(connection.points[1].x, connection.spineX);
            assert.equal(connection.points[0].y, connection.points[1].y);
            assert.equal(connection.points[2].y, connection.points[3].y);
        }
    }
});

test("every matchup is two source cards feeding one separate winner card", () => {
    for (const size of TOURNAMENT_BRACKET_SIZES) {
        const layout = tournamentBracketLayout({
            width: 1920,
            height: 1080,
            size,
            tournament: fakeTournament(size),
        });
        assert.equal(layout.topology.length, size - 1);
        assert.equal(layout.nodes.filter((node) => node.kind === "entry").length, size);
        assert.equal(layout.nodes.some((node) => node.kind === "match" || node.kind === "final"), false);
        for (const topology of layout.topology) {
            assert.equal(topology.sourceNodeIds.length, 2, `${size} ${topology.matchId} has two competitors`);
            assert.notEqual(topology.destinationNodeId, topology.sourceNodeIds[0]);
            assert.notEqual(topology.destinationNodeId, topology.sourceNodeIds[1]);
            const destination = layout.nodes.find((node) => node.id === topology.destinationNodeId);
            assert.ok(destination && ["winner", "champion"].includes(destination.kind));
            assert.deepEqual(destination.sources, topology.sourceNodeIds);
        }
        const rightFirstRound = layout.matchNodes
            .filter((node) => node.roundIndex === 0 && node.side === "right")
            .sort((a, b) => a.matchIndex - b.matchIndex);
        if (rightFirstRound.length > 1) {
            const firstSource = rightFirstRound[0].sources.map((id) => layout.nodes.find((node) => node.id === id).slot);
            const secondSource = rightFirstRound[1].sources.map((id) => layout.nodes.find((node) => node.id === id).slot);
            assert.ok(firstSource[0] > secondSource[0], "right branch pairs converge from the outside inward");
        }
    }
});

test("snapshot seed IDs populate entrant cards instead of unknown placeholders", () => {
    const tournament = {
        size: 4,
        seedOrder: ["speed", "fibonacci", "orbital", "batman"],
        selectedEntrantIds: ["speed", "fibonacci", "orbital", "batman"],
        rounds: [],
    };
    const layout = tournamentBracketLayout({ width: 1080, height: 1920, tournament });
    assert.deepEqual(layout.entries.map((node) => node.entrant.orbId), tournament.seedOrder);
    assert.ok(layout.entries.every((node) => node.label !== "???"));
});

test("all supported sizes keep bracket nodes and connector points within the canvas", () => {
    for (const size of TOURNAMENT_BRACKET_SIZES) {
        const layout = tournamentBracketLayout({
            width: 1920,
            height: 1080,
            size,
            tournament: fakeTournament(size),
        });
        assert.equal(layout.entries.length, size);
        assert.equal(layout.centerFinal.x, 960);
        for (const node of layout.nodes) {
            assert.ok(node.rect.x >= -1, `${size} ${node.id} should not leave the left edge`);
            assert.ok(node.rect.x + node.rect.width <= layout.width + 1, `${size} ${node.id} should not leave the right edge`);
            assert.ok(node.rect.y >= -1, `${size} ${node.id} should not leave the top edge`);
            assert.ok(node.rect.y + node.rect.height <= layout.height + 1, `${size} ${node.id} should not leave the bottom edge`);
        }
        for (const connection of layout.connections) {
            for (const point of connection.points) {
                assert.ok(point.x >= -1 && point.x <= layout.width + 1);
                assert.ok(point.y >= -1 && point.y <= layout.height + 1);
            }
        }
    }
});

test("matchup zoom includes both entrants and stays centered on the selected nodes", () => {
    const layout = tournamentBracketLayout({ width: 1080, height: 1920, size: 64, tournament: fakeTournament(64) });
    const zoom = tournamentMatchupZoomRect(layout, { roundIndex: 0, matchIndex: 20, padding: 24 });
    assert.ok(zoom.width > 0 && zoom.height > 0);
    assert.equal(zoom.roundIndex, 0);
    assert.equal(zoom.matchIndex, 20);
    const match = layout.matchNodesByKey.get("0:20");
    const previousMatch = layout.matchNodesByKey.get("0:19");
    const nextMatch = layout.matchNodesByKey.get("0:21");
    const sourceNodes = match.sources.map((id) => layout.nodes.find((node) => node.id === id));
    const adjacentNodes = [previousMatch, nextMatch].flatMap((node) => [
        node,
        ...node.sources.map((id) => layout.nodes.find((candidate) => candidate.id === id)),
    ]);
    for (const node of [match, ...sourceNodes, ...adjacentNodes]) {
        assert.ok(node.x >= zoom.x && node.x <= zoom.x + zoom.width);
        assert.ok(node.y >= zoom.y && node.y <= zoom.y + zoom.height);
    }
    assert.deepEqual(zoom.adjacentMatchNodeIds, [previousMatch.id, nextMatch.id]);
    const activeMinX = Math.min(match.rect.x, ...sourceNodes.map((node) => node.rect.x));
    const activeMaxX = Math.max(match.rect.x + match.rect.width, ...sourceNodes.map((node) => node.rect.x + node.rect.width));
    const activeMinY = Math.min(match.rect.y, ...sourceNodes.map((node) => node.rect.y));
    const activeMaxY = Math.max(match.rect.y + match.rect.height, ...sourceNodes.map((node) => node.rect.y + node.rect.height));
    assert.equal(zoom.centerX, (activeMinX + activeMaxX) / 2);
    assert.equal(zoom.centerY, (activeMinY + activeMaxY) / 2);
});

test("edge matchup zoom keeps the active matchup centered with the available neighbor visible", () => {
    const layout = tournamentBracketLayout({ width: 1080, height: 1920, size: 64, tournament: fakeTournament(64) });
    const zoom = tournamentMatchupZoomRect(layout, { roundIndex: 0, matchIndex: 0, padding: 24 });
    const active = layout.matchNodesByKey.get("0:0");
    const next = layout.matchNodesByKey.get("0:1");
    assert.deepEqual(zoom.adjacentMatchNodeIds, [next.id]);
    const activeNodes = [active, ...active.sources.map((id) => layout.nodes.find((node) => node.id === id))];
    const activeMinX = Math.min(...activeNodes.map((node) => node.rect.x));
    const activeMaxX = Math.max(...activeNodes.map((node) => node.rect.x + node.rect.width));
    const activeMinY = Math.min(...activeNodes.map((node) => node.rect.y));
    const activeMaxY = Math.max(...activeNodes.map((node) => node.rect.y + node.rect.height));
    assert.equal(zoom.centerX, (activeMinX + activeMaxX) / 2);
    assert.equal(zoom.centerY, (activeMinY + activeMaxY) / 2);
    const visibleNodes = [next, ...next.sources.map((id) => layout.nodes.find((node) => node.id === id))];
    for (const node of visibleNodes) {
        assert.ok(node.x >= zoom.x && node.x <= zoom.x + zoom.width);
        assert.ok(node.y >= zoom.y && node.y <= zoom.y + zoom.height);
    }
});

test("matchup zoom never selects a numeric neighbor from the opposite bracket side", () => {
    const layout = tournamentBracketLayout({ width: 1080, height: 1920, size: 64, tournament: fakeTournament(64) });
    const active = layout.matchNodesByKey.get("0:15");
    const oppositeSide = layout.matchNodesByKey.get("0:16");
    const zoom = tournamentMatchupZoomRect(layout, { roundIndex: 0, matchIndex: 15, padding: 24 });
    assert.equal(active.side, "left");
    assert.equal(oppositeSide.side, "right");
    assert.ok(!zoom.adjacentMatchNodeIds.includes(oppositeSide.id));
    assert.equal(zoom.adjacentMatchNodeIds.length, 1);
});

test("64-entry camera focuses the selected matchup and hands off without returning to overview", () => {
    for (const [width, height] of [[1080, 1920], [1920, 1080]]) {
        const layout = tournamentBracketLayout({
            width,
            height,
            size: 64,
            tournament: fakeTournament(64),
        });
        const padding = tournamentMatchupZoomPadding({
            nodeSize: layout.nodeSize,
            portrait: height >= width,
        });
        const selected = tournamentMatchupZoomRect(layout, {
            roundIndex: 0,
            matchIndex: 20,
            padding,
        });
        const targetScale = tournamentMatchupZoomTargetScale({
            width,
            height,
            zoomRect: selected,
            portrait: height >= width,
        });
        const start = tournamentCameraTransform({
            layout,
            zoomRect: selected,
            width,
            height,
            progress: 0,
            targetScale,
        });
        const middle = tournamentCameraTransform({
            layout,
            zoomRect: selected,
            width,
            height,
            progress: 0.5,
            targetScale,
        });
        const end = tournamentCameraTransform({
            layout,
            zoomRect: selected,
            width,
            height,
            progress: 1,
            targetScale,
        });
        assert.equal(end.centerX, selected.centerX);
        assert.equal(end.centerY, selected.centerY);
        assert.equal(end.scale, targetScale);
        assert.ok(targetScale > 1, `${width}x${height} focused camera should zoom in`);
        const movingAxis = Math.abs(end.centerX - start.centerX) > 0.001 ? "centerX" : "centerY";
        assert.ok(
            middle[movingAxis] > Math.min(start[movingAxis], end[movingAxis])
            && middle[movingAxis] < Math.max(start[movingAxis], end[movingAxis]),
            `${width}x${height} camera should move continuously toward the selected matchup`,
        );

        const fromZoom = tournamentMatchupZoomRect(layout, {
            roundIndex: 0,
            matchIndex: 19,
            padding,
        });
        const handoffSamples = [0, 0.25, 0.5, 0.75, 1].map((progress) => (
            tournamentCameraTransitionTransform({
                fromZoomRect: fromZoom,
                toZoomRect: selected,
                width,
                height,
                progress,
                startScale: tournamentMatchupZoomTargetScale({
                    width,
                    height,
                    zoomRect: fromZoom,
                    portrait: height >= width,
                }),
                endScale: Math.max(
                    tournamentMatchupZoomTargetScale({
                        width,
                        height,
                        zoomRect: fromZoom,
                        portrait: height >= width,
                    }),
                    targetScale,
                ),
            })
        ));
        assert.equal(handoffSamples[0].centerY, fromZoom.centerY);
        assert.equal(handoffSamples.at(-1).centerX, selected.centerX);
        assert.equal(handoffSamples.at(-1).centerY, selected.centerY);
        assert.ok(handoffSamples.every((sample, index, samples) => (
            index === 0 || sample.scale >= samples[index - 1].scale
        )), `${width}x${height} handoff should never zoom back out`);
    }
});

test("advancement interpolates from a match node to the next-round node", () => {
    const layout = tournamentBracketLayout({ width: 1080, height: 1920, size: 16, tournament: fakeTournament(16) });
    const start = tournamentAdvancementPosition(layout, { roundIndex: 0, matchIndex: 2, progress: 0 });
    const middle = tournamentAdvancementPosition(layout, { roundIndex: 0, matchIndex: 2, progress: 0.5 });
    const end = tournamentAdvancementPosition(layout, { roundIndex: 0, matchIndex: 2, progress: 1 });
    assert.equal(start.x, layout.matchNodesByKey.get("0:2").x);
    assert.equal(end.x, layout.matchNodesByKey.get("1:1").x);
    assert.ok(middle.x > Math.min(start.x, end.x) && middle.x < Math.max(start.x, end.x));
    assert.ok(middle.y >= Math.min(start.y, end.y) && middle.y <= Math.max(start.y, end.y));
});

test("loser visual state smoothly moves toward grayscale and fade", () => {
    const start = tournamentLoserVisualState(0);
    const end = tournamentLoserVisualState(1);
    assert.equal(start.grayscale, 0);
    assert.equal(start.opacity, 1);
    assert.equal(end.grayscale, 1);
    assert.ok(end.opacity < 1);
    assert.ok(end.lineOpacity < 1);
});

test("winner advancement dust is deterministic and destination-local", () => {
    const first = tournamentAdvancementDust("match-r2-m1", 18);
    const second = tournamentAdvancementDust("match-r2-m1", 18);
    assert.deepEqual(first, second);
    assert.equal(first.length, 18);
    assert.ok(first.every((particle) => particle.x > 0 && particle.x < 1));
    assert.ok(first.every((particle) => particle.y > 0 && particle.y < 1));
});

test("zoom fit is tighter while preserving the matchup context", () => {
    const layout = tournamentBracketLayout({ width: 1920, height: 1080, size: 16, tournament: fakeTournament(16) });
    const zoom = tournamentMatchupZoomRect(layout, { roundIndex: 0, matchIndex: 2, padding: 24 });
    const landscapePadding = tournamentMatchupZoomPadding({ nodeSize: layout.nodeSize, portrait: false });
    const portraitPadding = tournamentMatchupZoomPadding({ nodeSize: layout.nodeSize, portrait: true });
    assert.ok(landscapePadding < layout.nodeSize * 2.8, "landscape camera should use tighter matchup padding");
    assert.ok(portraitPadding < layout.nodeSize * 1.25, "portrait camera should remain focused on the cards");
    const newScale = tournamentMatchupZoomTargetScale({ width: 1920, height: 1080, zoomRect: zoom, portrait: false });
    const oldScale = Math.max(1, Math.min(1920 / zoom.width * 0.78, 1080 / zoom.height * 0.66));
    assert.ok(newScale > oldScale, "landscape zoom should land closer to the actual matchup");
});

test("landscape four-entry brackets still visibly focus the selected matchup", () => {
    const scale = tournamentMatchupZoomTargetScale({
        width: 1920,
        height: 1080,
        zoomRect: { width: 1920, height: 1080 },
        portrait: false,
    });
    assert.equal(scale, 1.42);
});

test("conclusion visual state fades dust and winner into the destination without travel", () => {
    const start = tournamentConclusionVisualState(0);
    const middle = tournamentConclusionVisualState(0.5);
    const end = tournamentConclusionVisualState(1);
    assert.equal(start.dustOutProgress, 0);
    assert.equal(start.winnerFadeInProgress, 0);
    assert.ok(middle.dustOutProgress > 0);
    assert.equal(middle.winnerFadeInProgress, 0);
    assert.equal(end.dustOutProgress, 1);
    assert.equal(end.winnerFadeInProgress, 1);
    assert.equal("x" in end, false);
    assert.equal("y" in end, false);
});

test("matchup envelope pans for exactly one second then holds centered for 1.75 seconds", () => {
    const layout = tournamentBracketLayout({ width: 1920, height: 1080, size: 8, tournament: fakeTournament(8) });
    const fromZoom = tournamentMatchupZoomRect(layout, { roundIndex: 0, matchIndex: 0, padding: 24 });
    const toZoom = tournamentMatchupZoomRect(layout, { roundIndex: 0, matchIndex: 2, padding: 24 });
    assert.equal(tournamentLongformPanDuration({ zoomDuration: 1.75 }), 2.75);
    assert.equal(tournamentLongformPanDuration(), 2.75);
    const start = tournamentMatchupIntroVisualState({ elapsed: 0 });
    const panEnd = tournamentMatchupIntroVisualState({ elapsed: 1 });
    const held = tournamentMatchupIntroVisualState({ elapsed: 2 });
    const end = tournamentMatchupIntroVisualState({ elapsed: 2.75 });
    assert.deepEqual(
        [start.cameraProgress, panEnd.cameraProgress, held.cameraProgress, end.cameraProgress],
        [0, 1, 1, 1],
        "camera motion must stop at the one-second boundary",
    );
    assert.equal(start.holding, false);
    assert.equal(panEnd.holding, true);
    assert.equal(held.holding, true);
    assert.equal(end.holding, false);
    assert.equal(end.complete, true);
    assert.equal(held.raceVisible, false, "the centered bracket remains visible throughout the hold");
    const samples = [0, 0.2, 0.5, 0.8, 1].map((progress) => (
        tournamentCameraTransitionTransform({
            fromZoomRect: fromZoom,
            toZoomRect: toZoom,
            width: 1920,
            height: 1080,
            progress,
        })
    ));
    assert.equal(samples[0].centerX, fromZoom.centerX);
    assert.equal(samples[0].centerY, fromZoom.centerY);
    assert.equal(samples.at(-1).centerX, toZoom.centerX);
    assert.equal(samples.at(-1).centerY, toZoom.centerY);
    const axisStart = fromZoom.centerX !== toZoom.centerX ? fromZoom.centerX : fromZoom.centerY;
    const axisMiddle = fromZoom.centerX !== toZoom.centerX ? samples[2].centerX : samples[2].centerY;
    const axisEnd = fromZoom.centerX !== toZoom.centerX ? toZoom.centerX : toZoom.centerY;
    assert.notEqual(axisMiddle, axisStart, "the pan must move on the changing camera axis");
    assert.ok(axisMiddle > Math.min(axisStart, axisEnd));
    assert.ok(axisMiddle < Math.max(axisStart, axisEnd));
    assert.ok(samples.every((sample) => sample.scale >= 1), "the pan remains on a valid focused camera");
    assert.ok(samples.every((sample, index) => index === 0 || sample.easedProgress > samples[index - 1].easedProgress));
});

test("timeline exposes the exact intro, race, conclusion, advancement, and champion phases", () => {
    const phases = new Set();
    const tournament = fakeTournament(8);
    for (const elapsed of [0, 0.9, 2.1, 2.8, 5.7, 6.2, 7.1, 8.2]) {
        phases.add(tournamentPresentationAtTime({
            tournament,
            elapsed,
            matchDuration: 2.8,
            completed: elapsed > 6,
            roundIndex: 0,
            matchIndex: 0,
        }).phase);
    }
    assert.ok(phases.has("zoom-in"));
    assert.ok(phases.has("match"));
    assert.ok(phases.has("loser-fade"));
    assert.ok(phases.has("winner-advance"));
    assert.ok(TOURNAMENT_PRESENTATION_PHASES.includes("champion"));
});

test("zoom cue is emitted once at the phase boundary", () => {
    const before = { phase: "bracket" };
    const zoom = tournamentPresentationAtTime({ tournament: fakeTournament(8), elapsed: 0, matchDuration: 2 });
    const cue = tournamentPresentationCueFor(before, zoom);
    assert.equal(cue.type, "race-tournament-bracket-zoom-in");
    assert.equal(tournamentPresentationCueFor(zoom, zoom), null);
});

test("initial intro holds the centered matchup until gameplay begins", () => {
    const panEnd = tournamentPresentationAtTime({ tournament: fakeTournament(8), elapsed: 1, matchDuration: 2 });
    const held = tournamentPresentationAtTime({ tournament: fakeTournament(8), elapsed: 2.74, matchDuration: 2 });
    const gameplay = tournamentPresentationAtTime({ tournament: fakeTournament(8), elapsed: 2.75, matchDuration: 2 });
    assert.equal(panEnd.phase, "zoom-in");
    assert.equal(panEnd.zoomProgress, 1);
    assert.equal(panEnd.matchupHolding, true);
    assert.equal(held.zoomProgress, 1);
    assert.equal(held.matchupHolding, true);
    assert.equal(held.raceVisible, false);
    assert.equal(gameplay.phase, "match");
    assert.equal(gameplay.raceVisible, true);
});

test("committed result replaces unknown without mutating the authoritative bracket", () => {
    const tournament = fakeTournament(4);
    const before = JSON.stringify(tournament);
    const committed = tournamentWithCommittedResult(tournament, {
        matchId: "round-0-match-0",
        winnerId: "seed-1",
    });
    assert.equal(tournament.rounds[0].matches[0].winnerId, null);
    assert.equal(JSON.stringify(tournament), before);
    assert.equal(committed.rounds[0].matches[0].winnerEntrantId, "seed-1");
    const layout = tournamentBracketLayout({ width: 1920, height: 1080, size: 4, tournament: committed });
    const destination = layout.matchNodesBySourceId.get("round-0-match-0");
    assert.equal(destination.label, "SPEED");
    assert.equal(destination.resolved, true);
});

test("camera transform is continuous, monotonic, and exact at zoom endpoints", () => {
    const layout = tournamentBracketLayout({ width: 1080, height: 1920, size: 8, tournament: fakeTournament(8) });
    const zoomRect = tournamentMatchupZoomRect(layout, { roundIndex: 0, matchIndex: 1, padding: 24 });
    const samples = [0, 1 / 60, 0.25, 0.5, 0.75, 59 / 60, 1].map((progress) => (
        tournamentCameraTransform({ layout, zoomRect, width: 1080, height: 1920, progress })
    ));
    assert.equal(samples[0].easedProgress, 0);
    assert.equal(samples.at(-1).easedProgress, 1);
    assert.equal(samples[0].centerX, layout.centerX);
    assert.equal(samples[0].centerY, layout.centerY);
    assert.equal(samples.at(-1).centerX, zoomRect.centerX);
    assert.equal(samples.at(-1).centerY, zoomRect.centerY);
    assert.equal(samples.at(-1).scale, Math.max(1, Math.min(1080 / zoomRect.width, 1920 / zoomRect.height) * 0.78));
    assert.ok(samples.every((sample, index) => index === 0 || sample.easedProgress > samples[index - 1].easedProgress));
    assert.ok(samples.every((sample, index) => index === 0 || sample.scale >= samples[index - 1].scale));
    assert.ok(samples.every((sample, index) => index === 0 || sample.panX !== samples[index - 1].panX || sample.panY !== samples[index - 1].panY));
    assert.equal(tournamentCameraEase(0), 0);
    assert.equal(tournamentCameraEase(1), 1);
});

test("reduced-motion timeline skips cosmetic holds while preserving matchup state", () => {
    const frame = tournamentPresentationAtTime({
        tournament: fakeTournament(4),
        elapsed: 0,
        matchDuration: 0,
        reducedMotion: true,
    });
    assert.equal(frame.phase, "match");
    assert.equal(frame.zoomProgress, 1);
    assert.deepEqual(frame.zoomTarget, { roundIndex: 0, matchIndex: 0 });
});

test("champion position is the shared center final node", () => {
    const layout = tournamentBracketLayout({ width: 1080, height: 1920, size: 32, tournament: fakeTournament(32) });
    const champion = tournamentChampionPosition(layout);
    assert.equal(champion.x, 540);
    assert.equal(champion.y, layout.centerY);
    assert.equal(champion.nodeId, layout.centerFinal.id);
});

test("presentation adapter tolerates existing tournament fields and creates stable recording keys", () => {
    const tournament = fakeTournament(16);
    tournament.currentRound = 2;
    tournament.currentMatch = 1;
    const state = normalizeTournamentPresentation({ tournament, elapsed: 2.5, scope: "whole-round" });
    assert.equal(state.size, 16);
    assert.equal(state.roundIndex, 2);
    assert.equal(state.matchIndex, 1);
    assert.equal(state.recordingScope, "whole-round");
    assert.equal(tournamentRecordingMatchKey({ tournamentSize: 64, roundIndex: 0, matchIndex: 3, matchId: "round-0-match-3" }), "t64-r1-m4-round-0-match-3");
});

test("tournament export defaults preserve portrait match and landscape round contracts", () => {
    assert.deepEqual(normalizeTournamentExportOptions({ scope: "each-match" }), {
        scope: "each-match",
        format: "portrait",
        layerCount: 3,
        layers: null,
        cropToFinish: false,
    });
    assert.equal(normalizeTournamentExportOptions({ scope: "whole-round", layerCount: 3 }).cropToFinish, true);
    assert.equal(normalizeTournamentExportOptions({ scope: "whole-round", layerCount: 5 }).cropToFinish, false);
    assert.equal(normalizeTournamentExportOptions({ scope: "whole-tournament" }).format, "race-landscape");
});

test("recording coordinator keeps asynchronous segment metadata through stop", async () => {
    const calls = [];
    const recorder = {
        machine: { state: "idle" },
        async start(options) {
            calls.push({ type: "start", options });
            this.machine.state = "recording";
        },
        stop() {
            calls.push({ type: "stop" });
            this.machine.state = "stopping";
        },
    };
    const coordinator = new TournamentRecordingCoordinator(recorder);
    coordinator.beginTournamentSession({
        scope: TOURNAMENT_RECORDING_SCOPES.EACH_MATCH,
        tournamentSize: 64,
        tournamentId: "qa-64",
        fps: 60,
    });
    const match = {
        id: "round-1-match-4",
        roundIndex: 0,
        matchIndex: 3,
        roundLabel: "ROUND OF 64",
        entrantIds: ["speed", "batman"],
        recordingLayerCount: 3,
        recordingFormat: "short-portrait",
    };
    const segment = await coordinator.onMatchIntro(match, { now: 12.5 });
    assert.equal(segment.status, "active");
    assert.equal(calls[0].options.recordingScope, "each-match");
    coordinator.onMatchConclusion(match, { now: 25, winnerId: "speed", loserId: "batman" });
    assert.equal(coordinator.shouldStopAfterMatch(match), true);
    coordinator.markRecorderStopPending();
    assert.equal(coordinator.session.activeSegment, null);
    const result = coordinator.onRecorderResult({ url: "blob:match" });
    assert.equal(result.metadata.segmentId, segment.segmentId);
    assert.match(result.metadata.filename, /64-round-1-round-of-64-match-4-speed-vs-batman-(?:each-)?match/);
    assert.equal(coordinator.segmentResults[0].status, "recorded");
    assert.equal(normalizeTournamentRecordingScope("tournament"), "whole-tournament");
    assert.match(tournamentRecordingFilename({ tournamentSize: 4, entrantIds: ["A Orb", "B Orb"] }), /a-orb-vs-b-orb/);
});

test("tournament preview continuation only auto-queues non-direct each-match recordings", () => {
    assert.equal(tournamentRecordingShouldContinueAfterPreview({
        scope: TOURNAMENT_RECORDING_SCOPES.EACH_MATCH,
    }), true);
    assert.equal(tournamentRecordingShouldContinueAfterPreview({
        scope: TOURNAMENT_RECORDING_SCOPES.EACH_MATCH,
        direct: true,
    }), false);
    assert.equal(tournamentRecordingShouldContinueAfterPreview({
        scope: TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND,
    }), false);
    assert.equal(tournamentRecordingShouldContinueAfterPreview({
        scope: TOURNAMENT_RECORDING_SCOPES.WHOLE_TOURNAMENT,
    }), false);
    assert.equal(tournamentRecordingShouldContinueAfterPreview({
        scope: TOURNAMENT_RECORDING_SCOPES.EACH_MATCH,
        tournamentCompleted: true,
    }), false);

    const coordinator = new TournamentRecordingCoordinator();
    coordinator.beginTournamentSession({ scope: "whole-round" });
    assert.equal(coordinator.shouldContinueAfterPreview(), false);
    coordinator.beginTournamentSession({ scope: "each-match" });
    assert.equal(coordinator.shouldContinueAfterPreview(), true);
});

test("whole-round and selected-match coordinator boundaries remain tolerant", async () => {
    const recorder = {
        machine: { state: "idle" },
        async start() { this.machine.state = "recording"; },
    };
    const coordinator = new TournamentRecordingCoordinator(recorder);
    coordinator.beginTournamentSession({
        scope: "whole-round",
        tournamentSize: 8,
        selectedRounds: [0, 1],
        selectedMatchId: "round-1-match-2",
    });
    assert.equal(await coordinator.onMatchIntro({ id: "round-1-match-1", roundIndex: 0, matchIndex: 0 }), null);
    const first = await coordinator.onMatchIntro({ id: "round-1-match-2", roundIndex: 0, matchIndex: 1, entrantIds: ["a", "b"] });
    assert.ok(first);
    assert.equal(coordinator.shouldStopAfterMatch({ roundIndex: 0 }, { roundCompleted: true }), false);
    assert.equal(coordinator.shouldStopAfterMatch({ roundIndex: 1 }, { roundCompleted: true }), true);
});

test("tournament coordinator stops selected match recordings and preserves the selected matchup", async () => {
    const calls = [];
    const recorder = {
        machine: { state: "idle" },
        async start() { this.machine.state = "recording"; calls.push("start"); },
        stop() { this.machine.state = "stopping"; calls.push("stop"); },
    };
    const coordinator = new TournamentRecordingCoordinator(recorder);
    coordinator.beginTournamentSession({
        scope: "each-match",
        tournamentSize: 8,
        selectedMatchId: "round-1-match-2",
        tournamentId: "selected-match",
    });
    assert.equal(await coordinator.onMatchIntro({
        id: "round-1-match-1",
        roundIndex: 0,
        matchIndex: 0,
        entrantIds: ["speed", "batman"],
    }), null);
    const match = {
        id: "round-1-match-2",
        roundIndex: 0,
        matchIndex: 1,
        entrantIds: ["fibonacci", "sticky"],
    };
    const segment = await coordinator.onMatchIntro(match, { now: 0 });
    const outcome = coordinator.onMatchResult(match, {
        now: 4,
        winnerId: "fibonacci",
        loserId: "sticky",
        tournamentCompleted: false,
        roundCompleted: false,
    });
    assert.equal(segment.segmentId, "round-1-match-2-recording");
    assert.equal(outcome.shouldStop, true);
    assert.equal(outcome.shouldContinue, false);
    assert.equal(outcome.recorderStopped, true);
    assert.equal(coordinator.session.activeSegment, null);
    assert.deepEqual(calls, ["start", "stop"]);
});

test("tournament coordinator continues through selected rounds and stops at the final selected round", async () => {
    const recorder = {
        machine: { state: "idle" },
        async start() { this.machine.state = "recording"; },
        stop() { this.machine.state = "stopping"; },
    };
    const coordinator = new TournamentRecordingCoordinator(recorder);
    coordinator.beginTournamentSession({
        scope: "whole-round",
        tournamentSize: 8,
        selectedRoundIds: ["round-1", "round-2"],
    });
    const firstRoundMatch = {
        id: "round-1-match-1",
        roundIndex: 0,
        matchIndex: 0,
        entrantIds: ["speed", "batman"],
    };
    await coordinator.onMatchIntro(firstRoundMatch, { now: 0 });
    const firstOutcome = coordinator.onMatchResult(firstRoundMatch, {
        now: 4,
        winnerId: "speed",
        loserId: "batman",
        roundCompleted: false,
        tournamentCompleted: false,
    });
    assert.equal(firstOutcome.shouldStop, false);
    assert.equal(firstOutcome.shouldContinue, true);

    const secondRoundMatch = {
        id: "round-2-match-1",
        roundIndex: 1,
        matchIndex: 0,
        entrantIds: ["speed", "fibonacci"],
    };
    const secondSegment = await coordinator.onMatchIntro(secondRoundMatch, { now: 10 });
    assert.equal(coordinator.segmentResults[0].status, "completed");
    assert.equal(coordinator.segmentResults[0].endedAt, 4);
    const secondOutcome = coordinator.onMatchResult(secondRoundMatch, {
        now: 20,
        winnerId: "speed",
        loserId: "fibonacci",
        roundCompleted: true,
        tournamentCompleted: false,
    });
    assert.equal(secondOutcome.shouldStop, true);
    assert.equal(secondOutcome.shouldContinue, false);
    assert.equal(secondOutcome.finalizedSegment.segmentId, secondSegment.segmentId);
    assert.equal(secondOutcome.finalizedSegment.status, "completed");
});

test("tournament coordinator keeps one segment through every match and finalizes the champion", async () => {
    const calls = [];
    const recorder = {
        machine: { state: "idle" },
        async start() { this.machine.state = "recording"; calls.push("start"); },
        stop() { this.machine.state = "stopping"; calls.push("stop"); },
    };
    const coordinator = new TournamentRecordingCoordinator(recorder);
    coordinator.beginTournamentSession({
        scope: "whole-tournament",
        tournamentSize: 4,
        tournamentId: "whole-tournament",
    });
    const matches = [
        {
            id: "round-1-match-1",
            roundIndex: 0,
            matchIndex: 0,
            entrantIds: ["speed", "batman"],
            presentation: {
                introMode: "full-intro",
                fullIntroDuration: 3.95,
                introBracketAt: 0,
                bracketZoomAt: 1.2,
                battleAt: 3.95,
            },
        },
        {
            id: "round-1-match-2",
            roundIndex: 0,
            matchIndex: 1,
            entrantIds: ["fibonacci", "sticky"],
            presentation: {
                introMode: "camera-pan",
                transitionStartAt: 4,
                transitionEndAt: 6.75,
                transitionDuration: 2.75,
                cameraTransition: {
                    type: "camera-pan",
                    fromMatchId: "round-1-match-1",
                    toMatchId: "round-1-match-2",
                    startAt: 4,
                    endAt: 6.75,
                    duration: 2.75,
                },
            },
        },
        {
            id: "round-2-match-1",
            roundIndex: 1,
            matchIndex: 0,
            entrantIds: ["speed", "fibonacci"],
            presentation: {
                introMode: "camera-pan",
                transitionStartAt: 9,
                transitionEndAt: 11.75,
                transitionDuration: 2.75,
                cameraTransition: {
                    type: "camera-pan",
                    fromMatchId: "round-1-match-2",
                    toMatchId: "round-2-match-1",
                    startAt: 9,
                    endAt: 11.75,
                    duration: 2.75,
                },
            },
        },
    ];
    for (const [index, match] of matches.entries()) {
        const segment = await coordinator.onMatchIntro(match, { now: index * 5 });
        assert.ok(segment);
        const outcome = coordinator.onMatchResult(match, {
            now: index * 5 + 4,
            winnerId: match.entrantIds[0],
            loserId: match.entrantIds[1],
            roundCompleted: index === 1 || index === 2,
            tournamentCompleted: index === 2,
        });
        assert.equal(outcome.shouldStop, index === 2);
        assert.equal(outcome.shouldContinue, index !== 2);
    }
    assert.deepEqual(calls, ["start", "stop"]);
    assert.equal(coordinator.segmentResults.length, 1);
    assert.equal(coordinator.segmentResults[0].status, "completed");
    assert.deepEqual(coordinator.segmentResults[0].matchIds, matches.map((match) => match.id));
    assert.deepEqual(
        coordinator.segmentResults[0].matchTimelines.map((timeline) => timeline.introMode),
        ["full-intro", "camera-pan", "camera-pan"],
    );
    assert.equal(coordinator.session.longFormIntroMatchId, matches[0].id);
    assert.equal(coordinator.session.lastIncludedMatchId, matches.at(-1).id);
    assert.equal(coordinator.session.cameraPanCount, 2);
    assert.equal(coordinator.segmentResults[0].endedAt, 14);
});

test("social renderer exposes an opt-in bracket path without replacing normal Orb Race drawing", () => {
    const source = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
    assert.match(source, /drawTournamentBracketScene\(/);
    assert.match(source, /presentation\.tournamentBracket/);
    assert.match(source, /tournamentBracketLayout\(/);
    assert.match(source, /fillText\("\?\?\?"/);
    assert.match(source, /tournamentWinnerHighlightColor/);
    assert.match(source, /layout\.activeConnectorWidth/);
    assert.match(source, /custom labels can never bleed/);
    assert.match(source, /fittedLabel/);
    assert.match(source, /drawRaceBoard\(ctx, sim, team/);
});
