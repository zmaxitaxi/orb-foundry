// Deterministic presentation contract for Orb Race tournament exports.
// This module intentionally owns no simulation state and does not depend on
// the setup UI. Gameplay can hand it the current tournament object today, or
// a future presentation adapter can provide the same tolerant fields.

export const TOURNAMENT_BRACKET_SIZES = Object.freeze([4, 8, 16, 32, 64]);

// Bracket connectors are deliberately quieter than the card outlines. Keep
// the palette here so the export renderer and the interactive preview can
// share the same thin, muted purple/gray treatment without inventing their
// own line colors.
export const TOURNAMENT_CONNECTOR_COLORS = Object.freeze({
    neutral: "#8b8298",
    active: "#8a69b8",
});

export const TOURNAMENT_PRESENTATION_PHASES = Object.freeze([
    "bracket",
    "zoom-in",
    "match",
    "loser-fade",
    "winner-advance",
    "champion",
    "complete",
]);

export const TOURNAMENT_PRESENTATION_TIMING = Object.freeze({
    bracketSeconds: 0,
    cameraPanSeconds: 1,
    matchupHoldSeconds: 1.75,
    // Intro and later handoffs share one 2.75 second envelope: exactly one
    // second of eased camera motion followed by a stationary centered hold.
    zoomInSeconds: 2.75,
    // The conclusion is one continuous 1.75 second zoomed-in reveal. The
    // phase split is retained for tolerant callers that still label the first
    // and second halves separately, but the renderer uses conclusionProgress
    // and never moves a winner through the bracket.
    loserFadeSeconds: 0.875,
    winnerAdvanceSeconds: 0.875,
    conclusionSeconds: 1.75,
    championSeconds: 1.2,
});

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1920;
const DEFAULT_PADDING = 20;
const MIN_LAYOUT_SIZE = 4;
const MAX_LAYOUT_SIZE = 64;

function clamp(value, minimum = 0, maximum = 1) {
    return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}

function clampNumber(value, minimum, maximum, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(minimum, Math.min(maximum, number));
}

export function tournamentEaseInOut(value) {
    const progress = clamp(value);
    return progress * progress * (3 - 2 * progress);
}

/**
 * Cinematic camera easing for bracket-to-matchup moves. Quintic smootherstep
 * keeps both velocity and acceleration at zero at the endpoints, so a 30 or
 * 60 FPS export never needs a corrective last frame.
 */
export function tournamentCameraEase(value) {
    const progress = clamp(value);
    return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

/**
 * Split the fixed 2.75 second matchup envelope into camera motion and hold.
 * Callers may provide normalized total progress or elapsed seconds. The
 * camera reaches its exact endpoint after one second and never drifts during
 * the following 1.75 second matchup view.
 */
export function tournamentMatchupIntroVisualState({
    progress = null,
    elapsed,
    panSeconds = TOURNAMENT_PRESENTATION_TIMING.cameraPanSeconds,
    holdSeconds = TOURNAMENT_PRESENTATION_TIMING.matchupHoldSeconds,
} = {}) {
    const safePanSeconds = Math.max(0.001, Number(panSeconds) || 1);
    const safeHoldSeconds = Math.max(0, Number(holdSeconds) || 0);
    const duration = safePanSeconds + safeHoldSeconds;
    const safeElapsed = elapsed !== undefined && elapsed !== null && Number.isFinite(Number(elapsed))
        ? Math.max(0, Number(elapsed))
        : clamp(progress) * duration;
    const totalProgress = clamp(safeElapsed / duration);
    const cameraProgress = clamp(safeElapsed / safePanSeconds);
    const holdProgress = clamp((safeElapsed - safePanSeconds) / Math.max(0.001, safeHoldSeconds));
    return {
        duration,
        elapsed: Math.min(duration, safeElapsed),
        totalProgress,
        cameraProgress,
        easedCameraProgress: tournamentCameraEase(cameraProgress),
        holdProgress,
        holding: safeElapsed >= safePanSeconds && safeElapsed < duration,
        complete: safeElapsed >= duration,
        bracketVisible: true,
        raceVisible: false,
    };
}

function easeOutCubic(value) {
    return 1 - Math.pow(1 - clamp(value), 3);
}

export function normalizeTournamentSize(size, fallback = 8) {
    const numeric = Number(size);
    if (TOURNAMENT_BRACKET_SIZES.includes(numeric)) return numeric;
    const safeFallback = TOURNAMENT_BRACKET_SIZES.includes(Number(fallback))
        ? Number(fallback)
        : 8;
    if (!Number.isFinite(numeric)) return safeFallback;
    return TOURNAMENT_BRACKET_SIZES.reduce((closest, candidate) => (
        Math.abs(candidate - numeric) < Math.abs(closest - numeric) ? candidate : closest
    ), safeFallback);
}

export function tournamentRoundCount(size) {
    return Math.log2(normalizeTournamentSize(size));
}

export function tournamentRoundMatchCount(size, roundIndex) {
    const bracketSize = normalizeTournamentSize(size);
    const round = clampNumber(roundIndex, 0, tournamentRoundCount(bracketSize) - 1, 0);
    return bracketSize / (2 ** (round + 1));
}

export function tournamentRoundLabel(size, roundIndex) {
    const matchCount = tournamentRoundMatchCount(size, roundIndex);
    if (matchCount === 1) return "CHAMPIONSHIP";
    if (matchCount === 2) return "SEMIFINALS";
    if (matchCount === 4) return "QUARTERFINALS";
    return `ROUND OF ${matchCount * 2}`;
}

export const TOURNAMENT_UNKNOWN_ENTRY_LABEL = "???";

export function tournamentEntrantName(entrant = {}, fallback = TOURNAMENT_UNKNOWN_ENTRY_LABEL) {
    if (entrant?.bye === true || String(entrant?.type || "").toLowerCase() === "bye") {
        return TOURNAMENT_UNKNOWN_ENTRY_LABEL;
    }
    const value = entrant.name
        ?? entrant.displayName
        ?? entrant.label
        ?? entrant.type
        ?? entrant.orbId
        ?? entrant.id
        ?? fallback;
    const normalized = String(value || fallback).replace(/\s+/g, " ").trim();
    return normalized.toUpperCase() === "BYE" ? TOURNAMENT_UNKNOWN_ENTRY_LABEL : normalized || fallback;
}

function entrantSlots(tournament = {}, size = normalizeTournamentSize(tournament.size)) {
    const entrants = Array.isArray(tournament.entrants) && tournament.entrants.length
        ? tournament.entrants
        : Array.isArray(tournament.seedOrder) && tournament.seedOrder.length
            ? tournament.seedOrder
            : Array.isArray(tournament.selectedEntrantIds) ? tournament.selectedEntrantIds : [];
    const sorted = entrants
        .map((value, index) => {
            const entrant = typeof value === "string"
                ? { id: value, orbId: value, type: value, name: value }
                : value || {};
            return {
                ...entrant,
                id: entrant.id ?? entrant.orbId ?? entrant.type ?? `entrant-${index}`,
                orbId: entrant.orbId ?? entrant.raceOrbId ?? entrant.type ?? entrant.id ?? null,
                slot: Number.isFinite(Number(entrant.slot))
                    ? Number(entrant.slot)
                    : Number.isFinite(Number(entrant.seedSlot)) ? Number(entrant.seedSlot) : index,
            };
        })
        .sort((left, right) => left.slot - right.slot || String(left.id).localeCompare(String(right.id)));
    return Array.from({ length: size }, (_, index) => sorted[index] || {
        id: `bye-${index}`,
        slot: index,
        type: "bye",
        name: "BYE",
        bye: true,
    });
}

function nodeId(roundIndex, matchIndex) {
    return `match-r${roundIndex}-m${matchIndex}`;
}

function tournamentRoundMatches(tournament, roundIndex) {
    return tournament?.rounds?.[roundIndex]?.matches
        || tournament?.bracket?.rounds?.[roundIndex]?.matches
        || [];
}

function tournamentSeedSlots(tournament) {
    return tournament?.seedSlots
        || tournament?.bracket?.seedSlots
        || [];
}

function tournamentEntrants(tournament = {}) {
    const entrants = Array.isArray(tournament?.entrants) && tournament.entrants.length
        ? tournament.entrants
        : Array.isArray(tournament?.seedOrder) && tournament.seedOrder.length
            ? tournament.seedOrder
            : Array.isArray(tournament?.selectedEntrantIds) ? tournament.selectedEntrantIds : [];
    return entrants.map((value) => typeof value === "string"
        ? { id: value, orbId: value, type: value, name: value }
        : value);
}

function entrantForIdentifier(tournament, identifier) {
    if (identifier === null || identifier === undefined || identifier === "") return null;
    return tournamentEntrants(tournament).find((entrant) => (
        entrant?.id === identifier
        || entrant?.entrantId === identifier
        || entrant?.orbId === identifier
        || entrant?.raceOrbId === identifier
        || entrant?.type === identifier
    )) || null;
}

function seedSlotFromNodeId(tournament, nodeId) {
    const node = tournamentSeedSlots(tournament).find((candidate) => candidate.id === nodeId);
    if (node && Number.isFinite(Number(node.seedSlot))) return Number(node.seedSlot);
    const match = /^seed-(\d+)$/.exec(String(nodeId || ""));
    return match ? Math.max(0, Number(match[1]) - 1) : null;
}

function bracketSlotOrder(tournament, size, side) {
    const firstRound = tournamentRoundMatches(tournament, 0);
    const rightFirstRound = firstRound.filter((match) => match.side === "right");
    const leftFirstRound = firstRound.filter((match) => match.side !== "right" && match.side !== "center");
    const orderedMatches = side === "right" ? rightFirstRound : leftFirstRound;
    const orderedSlots = orderedMatches
        .flatMap((match) => (match.sourceNodeIds || []).map((id) => seedSlotFromNodeId(tournament, id)))
        .filter((slot) => Number.isInteger(slot));
    if (orderedSlots.length === size / 2) return orderedSlots;
    const start = side === "right" ? size / 2 : 0;
    return side === "right"
        ? Array.from({ length: size / 2 }, (_, index) => start + size / 2 - 1 - index)
        : Array.from({ length: size / 2 }, (_, index) => start + index);
}

function entryNodeId(slot) {
    return `entry-${slot}`;
}

function sideForEntry(slot, size) {
    return slot < size / 2 ? "left" : "right";
}

function sideForMatch(roundIndex, matchIndex, size) {
    const count = tournamentRoundMatchCount(size, roundIndex);
    if (count === 1) return "center";
    return matchIndex < count / 2 ? "left" : "right";
}

function sideLocalMatchIndex(roundIndex, matchIndex, size) {
    const count = tournamentRoundMatchCount(size, roundIndex);
    return matchIndex < count / 2 ? matchIndex : matchIndex - count / 2;
}

function nodeRect(x, y, width, height = width) {
    return {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
    };
}

function anchorPoint(node, side, direction) {
    const halfWidth = node.cardWidth ? node.cardWidth / 2 : node.radius || node.size / 2;
    return {
        x: node.x + (direction === "right" ? halfWidth : direction === "left" ? -halfWidth : 0),
        y: node.y,
    };
}

function orthogonalConnection(from, to, side) {
    const direction = side === "left" ? "right" : side === "right" ? "left" : "right";
    const start = anchorPoint(from, side, direction);
    const end = anchorPoint(to, side, direction === "right" ? "left" : "right");
    const middleX = start.x + (end.x - start.x) * 0.5;
    return {
        id: `${from.id}->${to.id}`,
        from: from.id,
        to: to.id,
        side,
        spineX: middleX,
        points: [
            start,
            { x: middleX, y: start.y },
            { x: middleX, y: end.y },
            end,
        ],
    };
}

function layoutMargins(width, height, options = {}) {
    const portrait = height >= width;
    const top = clampNumber(options.top, 46, height - 100, portrait ? height * 0.06 : height * 0.13);
    const bottom = clampNumber(options.bottom, top + 100, height - 36, portrait ? height * 0.95 : height * 0.88);
    const left = clampNumber(options.left, 18, width * 0.3, portrait ? width * 0.035 : width * 0.035);
    const right = clampNumber(options.right, 18, width * 0.3, left);
    return { top, bottom, left, right };
}

/**
 * Build a complete two-sided bracket in canvas coordinates.
 *
 * Every competitor and every match result is its own card. First-round cards
 * contain the entrant orb/name; each later card is a separate winner/result
 * node fed by exactly two source cards. There is deliberately no matchup
 * container card: the connector graph itself communicates the matchup.
 */
export function tournamentBracketLayout({
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    size = null,
    tournament = {},
    entrants = null,
    top,
    bottom,
    left,
    right,
    padding = DEFAULT_PADDING,
} = {}) {
    const canvasWidth = Math.max(1, Number(width) || DEFAULT_WIDTH);
    const canvasHeight = Math.max(1, Number(height) || DEFAULT_HEIGHT);
    const portrait = canvasHeight >= canvasWidth;
    const bracketSize = normalizeTournamentSize(size ?? tournament.size);
    const slots = entrants || entrantSlots(tournament, bracketSize);
    const margins = layoutMargins(canvasWidth, canvasHeight, { top, bottom, left, right });
    const sideCount = bracketSize / 2;
    const usableHeight = Math.max(1, margins.bottom - margins.top);
    const rowPitch = usableHeight / sideCount;
    const centerX = canvasWidth / 2;
    // Portrait has the height to carry the full graph, so reclaim the
    // otherwise unused horizontal whitespace around each card. Landscape is
    // intentionally left on the approved spacing profile.
    const centerGap = Math.max(20, Math.min(canvasWidth * (portrait ? 0.02 : 0.035), rowPitch * 1.7));
    const outerX = margins.left;
    const finalX = centerX;
    const roundCount = tournamentRoundCount(bracketSize);
    const columnGap = Math.max(4, Math.min(canvasWidth * (portrait ? 0.004 : 0.012), rowPitch * 0.32));
    const sideSpan = centerX - outerX - centerGap;
    const cardWidth = Math.max(34, Math.min(
        portrait ? 300 : 168,
        (sideSpan - columnGap * (roundCount - 1)) / Math.max(1, roundCount),
    ));
    const cardHeight = portrait
        ? Math.max(16, Math.min(112, rowPitch * 0.78, cardWidth * 0.48))
        : Math.max(16, Math.min(52, rowPitch * 0.78));
    const finalCardWidth = Math.min(Math.max(cardWidth, 76), Math.max(cardWidth, sideSpan * 0.72));
    const finalCardHeight = Math.min(Math.max(cardHeight, 30), Math.max(cardHeight, rowPitch * 1.5));
    const leftStartX = outerX + cardWidth / 2;
    const leftEndX = finalX - (finalCardWidth + cardWidth) / 2 - columnGap;
    const columnSpacing = roundCount > 1
        ? (leftEndX - leftStartX) / (roundCount - 1)
        : 0;
    const sideFinalLeftX = leftEndX;
    const sideFinalRightX = canvasWidth - leftEndX;
    const labelFontSize = portrait
        ? Math.max(8, Math.min(26, cardHeight * 0.38))
        : Math.max(7, Math.min(22, cardHeight * 0.34));
    const nodes = [];
    const entriesBySlot = new Map();
    const entriesBySourceNodeId = new Map();
    const matchNodes = new Map();
    const matchNodesBySourceId = new Map();
    const entryVisualOrder = {
        left: bracketSlotOrder(tournament, bracketSize, "left"),
        right: bracketSlotOrder(tournament, bracketSize, "right"),
    };

    const yForEntryLocal = (localIndex) => margins.top + (localIndex + 0.5) * rowPitch;
    const yForMatchLocal = (roundIndex, localIndex) => {
        const entriesPerMatch = 2 ** (roundIndex + 1);
        return margins.top + (localIndex * entriesPerMatch + entriesPerMatch / 2) * rowPitch;
    };
    const xForMatch = (roundIndex, side) => {
        if (side === "center") return finalX;
        if (roundIndex === roundCount - 2) return side === "left" ? sideFinalLeftX : sideFinalRightX;
        const x = leftStartX + columnSpacing * (roundIndex + 1);
        return side === "left" ? x : canvasWidth - x;
    };

    for (let slot = 0; slot < bracketSize; slot += 1) {
        const side = sideForEntry(slot, bracketSize);
        const visualSlots = entryVisualOrder[side];
        const localIndex = visualSlots.indexOf(slot) >= 0
            ? visualSlots.indexOf(slot)
            : side === "left" ? slot : slot - sideCount;
        const x = side === "left" ? leftStartX : canvasWidth - leftStartX;
        const y = yForEntryLocal(localIndex);
        const entrant = slots[slot];
        const rect = nodeRect(x, y, cardWidth, cardHeight);
        const node = {
            id: entryNodeId(slot),
            kind: "entry",
            slot,
            side,
            x,
            y,
            size: cardHeight,
            radius: cardHeight / 2,
            cardWidth,
            cardHeight,
            rect,
            cardRect: rect,
            entrantId: entrant.id,
            entrant,
            label: tournamentEntrantName(entrant),
            bye: entrant.bye === true || entrant.type === "bye",
            labelAlign: "center",
            labelX: x,
            labelMaxWidth: Math.max(18, cardWidth - cardHeight * 0.85),
            labelFontSize,
            textFit: {
                labelMaxWidth: Math.max(18, cardWidth - cardHeight * 0.85),
                minFontSize: portrait ? Math.max(3.5, cardHeight * 0.12) : Math.max(5, cardHeight * 0.2),
                overflow: "ellipsis",
                clippedToCard: true,
            },
            sourceNodeId: tournamentSeedSlots(tournament).find((candidate) => Number(candidate.seedSlot) === slot)?.id
                || `seed-${slot + 1}`,
        };
        nodes.push(node);
        entriesBySlot.set(slot, node);
        entriesBySourceNodeId.set(node.sourceNodeId, node);
    }

    for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
        const matchCount = tournamentRoundMatchCount(bracketSize, roundIndex);
        for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
            const side = sideForMatch(roundIndex, matchIndex, bracketSize);
            const localIndex = side === "center"
                ? 0
                : sideLocalMatchIndex(roundIndex, matchIndex, bracketSize);
            const x = xForMatch(roundIndex, side);
            const centerY = margins.top + usableHeight / 2;
            const convergenceOffset = Math.max(cardHeight * 1.55, rowPitch * 0.82);
            const y = side === "center"
                ? centerY
                : roundIndex === roundCount - 2
                    ? centerY + (side === "left" ? -convergenceOffset : convergenceOffset)
                    : yForMatchLocal(roundIndex, localIndex);
            const isFinal = roundIndex === roundCount - 1;
            const currentCardWidth = isFinal ? finalCardWidth : cardWidth;
            const currentCardHeight = isFinal ? finalCardHeight : cardHeight;
            const rect = nodeRect(x, y, currentCardWidth, currentCardHeight);
            const node = {
                id: nodeId(roundIndex, matchIndex),
                kind: roundIndex === roundCount - 1 ? "champion" : "winner",
                roundIndex,
                matchIndex,
                side,
                x,
                y,
                size: currentCardHeight,
                radius: currentCardHeight / 2,
                cardWidth: currentCardWidth,
                cardHeight: currentCardHeight,
                rect,
                cardRect: rect,
                label: TOURNAMENT_UNKNOWN_ENTRY_LABEL,
                roundLabel: tournamentRoundLabel(bracketSize, roundIndex),
                sources: [],
                sourceMatchId: tournamentRoundMatches(tournament, roundIndex)[matchIndex]?.id || null,
                sourceNodeId: tournamentRoundMatches(tournament, roundIndex)[matchIndex]?.outputNode?.id || null,
                textFit: {
                    labelMaxWidth: Math.max(18, currentCardWidth - currentCardHeight * 0.85),
                    minFontSize: portrait ? Math.max(3.5, currentCardHeight * 0.12) : Math.max(5, currentCardHeight * 0.2),
                    overflow: "ellipsis",
                    clippedToCard: true,
                },
            };
            const tournamentMatch = tournamentRoundMatches(tournament, roundIndex)[matchIndex] || {};
            const resolvedIdentifier = tournamentMatch.winnerEntrantId
                ?? tournamentMatch.resolvedEntrantId
                ?? tournamentMatch.entrantId
                ?? tournamentMatch.winnerId
                ?? tournamentMatch.resolvedOrbId
                ?? null;
            const resolvedEntrant = entrantForIdentifier(tournament, resolvedIdentifier);
            node.entrantId = resolvedEntrant?.id || null;
            node.entrant = resolvedEntrant || null;
            node.resolved = Boolean(resolvedEntrant);
            node.label = resolvedEntrant ? tournamentEntrantName(resolvedEntrant) : TOURNAMENT_UNKNOWN_ENTRY_LABEL;
            nodes.push(node);
            matchNodes.set(`${roundIndex}:${matchIndex}`, node);
            if (node.sourceMatchId) matchNodesBySourceId.set(node.sourceMatchId, node);
        }
    }

    const connections = [];
    for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
        const matchCount = tournamentRoundMatchCount(bracketSize, roundIndex);
        for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
            const destination = matchNodes.get(`${roundIndex}:${matchIndex}`);
            if (!destination) continue;
            const tournamentMatch = tournamentRoundMatches(tournament, roundIndex)[matchIndex];
            const destinationMatchCount = tournamentRoundMatchCount(bracketSize, roundIndex);
            const destinationLocalIndex = destination.side === "right"
                ? matchIndex - destinationMatchCount / 2
                : matchIndex;
            if (roundIndex === 0) {
                const firstSlot = destination.side === "right"
                    ? bracketSize - 2 - destinationLocalIndex * 2
                    : destinationLocalIndex * 2;
                const topologyIds = tournamentMatch?.sourceNodeIds || [];
                const sources = topologyIds.length
                    ? topologyIds
                        .map((sourceId) => {
                            const slot = seedSlotFromNodeId(tournament, sourceId);
                            return Number.isInteger(slot)
                                ? entriesBySlot.get(slot)
                                : entriesBySourceNodeId.get(sourceId) || null;
                        })
                        .filter(Boolean)
                    : [entriesBySlot.get(firstSlot), entriesBySlot.get(firstSlot + 1)].filter(Boolean);
                destination.sources = sources.map((source) => source.id);
                destination.sourceNodeIds = topologyIds.length ? [...topologyIds] : sources.map((source) => source.sourceNodeId);
                sources.forEach((source) => connections.push(orthogonalConnection(source, destination, destination.side)));
            } else {
                const sourceMatchIds = tournamentMatch?.sourceMatchIds || [];
                const sources = sourceMatchIds.length
                    ? sourceMatchIds.map((sourceId) => matchNodesBySourceId.get(sourceId)).filter(Boolean)
                    : (() => {
                        const previousMatchCount = tournamentRoundMatchCount(bracketSize, roundIndex - 1);
                        const sourceIndex = destination.side === "right"
                            ? previousMatchCount - 2 - destinationLocalIndex * 2
                            : destinationLocalIndex * 2;
                        return [
                            matchNodes.get(`${roundIndex - 1}:${sourceIndex}`),
                            matchNodes.get(`${roundIndex - 1}:${sourceIndex + 1}`),
                        ].filter(Boolean);
                    })();
                destination.sources = sources.map((source) => source.id);
                destination.sourceMatchIds = sourceMatchIds.length
                    ? [...sourceMatchIds]
                    : sources.map((source) => source.sourceMatchId).filter(Boolean);
                sources.forEach((source) => connections.push(orthogonalConnection(source, destination, destination.side)));
            }
        }
    }

    const entryBounds = nodes.filter((node) => node.kind === "entry").reduce((bounds, node) => ({
        minX: Math.min(bounds.minX, node.rect.x),
        minY: Math.min(bounds.minY, node.rect.y),
        maxX: Math.max(bounds.maxX, node.rect.x + node.rect.width),
        maxY: Math.max(bounds.maxY, node.rect.y + node.rect.height),
    }), { minX: canvasWidth, minY: canvasHeight, maxX: 0, maxY: 0 });

    return {
        width: canvasWidth,
        height: canvasHeight,
        portrait,
        size: bracketSize,
        roundCount,
        centerX,
        centerY: margins.top + usableHeight / 2,
        margins,
        safeRect: {
            x: Math.max(0, margins.left - padding),
            y: Math.max(0, margins.top - padding),
            width: Math.min(canvasWidth, canvasWidth - margins.left - margins.right + padding * 2),
            height: Math.min(canvasHeight, usableHeight + padding * 2),
        },
        rowPitch,
        nodeSize: cardHeight,
        matchNodeSize: cardHeight,
        cardWidth,
        cardHeight,
        finalCardWidth,
        finalCardHeight,
        columnGap,
        labelFontSize,
        // Widths are expressed in logical layout pixels and converted to
        // screen-stable strokes by the renderer after the camera scale is
        // applied. The landscape floor is slightly higher so a full-board
        // overview remains legible without turning the focused 64 bracket
        // into a heavy black network.
        connectorWidth: portrait
            ? Math.max(1.6, Math.min(3.2, cardHeight * 0.055))
            : Math.max(2.1, Math.min(3.6, cardHeight * 0.14)),
        activeConnectorWidth: portrait
            ? Math.max(2.1, Math.min(4.2, cardHeight * 0.075))
            : Math.max(2.7, Math.min(4.8, cardHeight * 0.22)),
        connectorColors: TOURNAMENT_CONNECTOR_COLORS,
        connectorStrokeSpace: "screen",
        entries: nodes.filter((node) => node.kind === "entry"),
        // Compatibility alias: this map is indexed by match, but each value
        // is a standalone winner/result card rather than a matchup container.
        matchNodes: nodes.filter((node) => node.kind === "winner" || node.kind === "champion"),
        winnerNodes: nodes.filter((node) => node.kind === "winner" || node.kind === "champion"),
        nodes,
        connections,
        entriesBySlot,
        entriesBySourceNodeId,
        matchNodesByKey: matchNodes,
        matchNodesBySourceId,
        entryVisualOrder,
        entryBounds,
        centerFinal: matchNodes.get(`${roundCount - 1}:0`),
        championNode: matchNodes.get(`${roundCount - 1}:0`),
        topology: nodes
            .filter((node) => node.kind === "winner" || node.kind === "champion")
            .map((destination) => ({
                matchId: destination.sourceMatchId,
                roundIndex: destination.roundIndex,
                matchIndex: destination.matchIndex,
                sourceNodeIds: [...destination.sources],
                destinationNodeId: destination.id,
            })),
    };
}

function findMatchNode(layout, roundIndex, matchIndex) {
    return layout?.matchNodesByKey?.get(`${roundIndex}:${matchIndex}`)
        || layout?.matchNodes?.find((node) => node.roundIndex === roundIndex && node.matchIndex === matchIndex)
        || null;
}

function findNode(layout, id) {
    return layout?.nodes?.find((node) => node.id === id) || null;
}

export function tournamentMatchupZoomRect(layout, {
    roundIndex = 0,
    matchIndex = 0,
    padding = 28,
} = {}) {
    const match = findMatchNode(layout, roundIndex, matchIndex);
    if (!match) return { x: 0, y: 0, width: layout?.width || 0, height: layout?.height || 0, centerX: 0, centerY: 0 };
    const matchupNodes = (node) => node
        ? [node, ...(node.sources || []).map((id) => findNode(layout, id)).filter(Boolean)]
        : [];
    const activeNodes = matchupNodes(match);
    const columnMatches = (layout?.matchNodes || [])
        .filter((node) => node.roundIndex === roundIndex && node.side === match.side && node.id !== match.id)
        .sort((a, b) => a.y - b.y);
    const matchAbove = columnMatches.filter((node) => node.y < match.y).at(-1) || null;
    const matchBelow = columnMatches.find((node) => node.y > match.y) || null;
    const adjacentMatches = [matchAbove, matchBelow].filter(Boolean);
    const candidates = [...activeNodes, ...adjacentMatches.flatMap(matchupNodes)];
    const activeBounds = activeNodes.reduce((result, node) => ({
        minX: Math.min(result.minX, node.rect.x),
        minY: Math.min(result.minY, node.rect.y),
        maxX: Math.max(result.maxX, node.rect.x + node.rect.width),
        maxY: Math.max(result.maxY, node.rect.y + node.rect.height),
    }), {
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
    });
    const bounds = candidates.reduce((result, node) => ({
        minX: Math.min(result.minX, node.rect.x),
        minY: Math.min(result.minY, node.rect.y),
        maxX: Math.max(result.maxX, node.rect.x + node.rect.width),
        maxY: Math.max(result.maxY, node.rect.y + node.rect.height),
    }), {
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
    });
    const safePadding = Math.max(0, Number(padding) || 0);
    const activeCenterX = (activeBounds.minX + activeBounds.maxX) / 2;
    const activeCenterY = (activeBounds.minY + activeBounds.maxY) / 2;
    const halfWidth = Math.max(activeCenterX - bounds.minX, bounds.maxX - activeCenterX) + safePadding;
    const halfHeight = Math.max(activeCenterY - bounds.minY, bounds.maxY - activeCenterY) + safePadding;
    const x = Math.max(0, activeCenterX - halfWidth);
    const y = Math.max(0, activeCenterY - halfHeight);
    const right = Math.min(layout.width, activeCenterX + halfWidth);
    const bottom = Math.min(layout.height, activeCenterY + halfHeight);
    return {
        x,
        y,
        width: Math.max(1, right - x),
        height: Math.max(1, bottom - y),
        centerX: activeCenterX,
        centerY: activeCenterY,
        roundIndex,
        matchIndex,
        matchNodeId: match.id,
        adjacentMatchNodeIds: adjacentMatches.map((node) => node.id),
    };
}

/**
 * Interpolate one stable full-bracket camera into one stable matchup camera.
 * Layout and zoom rectangles are inputs, not rebuilt or quantized here. The
 * returned values are deliberately fractional for smooth export rendering.
 */
export function tournamentCameraTransform({
    layout,
    zoomRect,
    width = layout?.width || DEFAULT_WIDTH,
    height = layout?.height || DEFAULT_HEIGHT,
    progress = 0,
    targetScale = null,
} = {}) {
    const safeLayout = layout || {};
    const safeZoom = zoomRect || {};
    const canvasWidth = Number(width) || DEFAULT_WIDTH;
    const canvasHeight = Number(height) || DEFAULT_HEIGHT;
    const start = {
        centerX: Number(safeLayout.centerX) || canvasWidth / 2,
        centerY: Number(safeLayout.centerY) || canvasHeight / 2,
        scale: 1,
    };
    const fitScale = Math.max(
        1,
        Math.min(
            canvasWidth / Math.max(1, Number(safeZoom.width) || canvasWidth),
            canvasHeight / Math.max(1, Number(safeZoom.height) || canvasHeight),
        ),
    );
    const end = {
        centerX: Number.isFinite(Number(safeZoom.centerX)) ? Number(safeZoom.centerX) : start.centerX,
        centerY: Number.isFinite(Number(safeZoom.centerY)) ? Number(safeZoom.centerY) : start.centerY,
        scale: Number.isFinite(Number(targetScale)) ? Math.max(1, Number(targetScale)) : fitScale * 0.78,
    };
    const normalized = clamp(progress);
    const easedProgress = tournamentCameraEase(normalized);
    const centerX = normalized === 0 ? start.centerX
        : normalized === 1 ? end.centerX
            : start.centerX + (end.centerX - start.centerX) * easedProgress;
    const centerY = normalized === 0 ? start.centerY
        : normalized === 1 ? end.centerY
            : start.centerY + (end.centerY - start.centerY) * easedProgress;
    const scale = normalized === 0 ? start.scale
        : normalized === 1 ? end.scale
            : start.scale + (end.scale - start.scale) * easedProgress;
    return {
        progress: normalized,
        easedProgress,
        start,
        end,
        centerX,
        centerY,
        scale,
        panX: canvasWidth * 0.5 - centerX * scale,
        panY: canvasHeight * 0.5 - centerY * scale,
    };
}

/**
 * Interpolate between two already-focused matchup cameras. This is the
 * long-form tournament handoff: it never visits the full-bracket camera, so
 * the result of one match can pan directly into the next matchup.
 */
export function tournamentCameraTransitionTransform({
    fromZoomRect = {},
    toZoomRect = {},
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    progress = 0,
    startScale = null,
    endScale = null,
} = {}) {
    const canvasWidth = Number(width) || DEFAULT_WIDTH;
    const canvasHeight = Number(height) || DEFAULT_HEIGHT;
    const from = {
        centerX: Number.isFinite(Number(fromZoomRect.centerX))
            ? Number(fromZoomRect.centerX)
            : canvasWidth / 2,
        centerY: Number.isFinite(Number(fromZoomRect.centerY))
            ? Number(fromZoomRect.centerY)
            : canvasHeight / 2,
        scale: Number.isFinite(Number(startScale))
            ? Math.max(1, Number(startScale))
            : tournamentMatchupZoomTargetScale({
                width: canvasWidth,
                height: canvasHeight,
                zoomRect: fromZoomRect,
                portrait: canvasHeight >= canvasWidth,
            }),
    };
    const to = {
        centerX: Number.isFinite(Number(toZoomRect.centerX))
            ? Number(toZoomRect.centerX)
            : from.centerX,
        centerY: Number.isFinite(Number(toZoomRect.centerY))
            ? Number(toZoomRect.centerY)
            : from.centerY,
        scale: Number.isFinite(Number(endScale))
            ? Math.max(1, Number(endScale))
            : tournamentMatchupZoomTargetScale({
                width: canvasWidth,
                height: canvasHeight,
                zoomRect: toZoomRect,
                portrait: canvasHeight >= canvasWidth,
            }),
    };
    const normalized = clamp(progress);
    const easedProgress = tournamentCameraEase(normalized);
    const centerX = normalized === 0
        ? from.centerX
        : normalized === 1
            ? to.centerX
            : from.centerX + (to.centerX - from.centerX) * easedProgress;
    const centerY = normalized === 0
        ? from.centerY
        : normalized === 1
            ? to.centerY
            : from.centerY + (to.centerY - from.centerY) * easedProgress;
    const scale = normalized === 0
        ? from.scale
        : normalized === 1
            ? to.scale
            : from.scale + (to.scale - from.scale) * easedProgress;
    return {
        progress: normalized,
        easedProgress,
        start: from,
        end: to,
        centerX,
        centerY,
        scale,
        panX: canvasWidth * 0.5 - centerX * scale,
        panY: canvasHeight * 0.5 - centerY * scale,
    };
}

/** Long-form camera pans use the same 2.75s animated zoom duration. */
export function tournamentLongformPanDuration({ zoomDuration = TOURNAMENT_PRESENTATION_TIMING.zoomInSeconds } = {}) {
    // Restored/legacy timing is tolerated as input, but the long-form pan
    // contract is fixed at exactly 2.75 seconds for every transition.
    void zoomDuration;
    return 2.75;
}

/**
 * Stable camera padding for the selected matchup. Landscape gets the same
 * wide composition, but less breathing room around the active cards so the
 * matchup itself—not a distant corner of the bracket—lands at center.
 */
export function tournamentMatchupZoomPadding({ nodeSize = 0, portrait = false } = {}) {
    const size = Math.max(1, Number(nodeSize) || 1);
    return portrait
        ? Math.max(8, size * 0.65)
        : Math.max(12, size * 0.95);
}

/**
 * Compute the final zoom without quantizing camera values. The factors leave
 * the active pair, destination, and adjacent same-column context visible.
 */
export function tournamentMatchupZoomTargetScale({
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    zoomRect = {},
    portrait = Number(height) >= Number(width),
} = {}) {
    const canvasWidth = Math.max(1, Number(width) || DEFAULT_WIDTH);
    const canvasHeight = Math.max(1, Number(height) || DEFAULT_HEIGHT);
    const zoomWidth = Math.max(1, Number(zoomRect.width) || canvasWidth);
    const zoomHeight = Math.max(1, Number(zoomRect.height) || canvasHeight);
    // Keep the active pair and its same-column neighbors in frame, but let
    // the selected matchup occupy most of the viewport. This is especially
    // important for 64-entry landscape brackets where a generous padding
    // would make a focused handoff look like a barely moving overview.
    const widthFactor = portrait ? 0.98 : 0.95;
    const heightFactor = portrait ? 0.9 : 0.92;
    // Landscape recordings need a visibly edited-in matchup crop even for a
    // four-entry bracket, whose adjacent-context bounds can otherwise span
    // nearly the entire canvas and collapse the target scale back to 1×.
    const minimumFocusedScale = portrait ? 1 : 1.42;
    return Math.max(
        minimumFocusedScale,
        Math.min(
            canvasWidth / zoomWidth * widthFactor,
            canvasHeight / zoomHeight * heightFactor,
        ),
    );
}

export function tournamentChampionPosition(layout) {
    const node = layout?.centerFinal || layout?.championNode;
    return node ? { x: node.x, y: node.y, nodeId: node.id } : {
        x: (layout?.width || 0) / 2,
        y: (layout?.height || 0) / 2,
        nodeId: null,
    };
}

export function tournamentAdvancementPosition(layout, {
    fromNodeId,
    toNodeId,
    roundIndex,
    matchIndex,
    progress = 0,
} = {}) {
    const from = findNode(layout, fromNodeId)
        || findMatchNode(layout, roundIndex, matchIndex)
        || tournamentChampionPosition(layout);
    const to = findNode(layout, toNodeId)
        || findMatchNode(layout, Number(roundIndex) + 1, Math.floor(Number(matchIndex) / 2))
        || tournamentChampionPosition(layout);
    const eased = tournamentEaseInOut(progress);
    return {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        progress: clamp(progress),
        easedProgress: eased,
        fromNodeId: from.id,
        toNodeId: to.id,
    };
}

export function tournamentLoserVisualState(progress = 1) {
    const fade = easeOutCubic(progress);
    return {
        progress: clamp(progress),
        grayscale: fade,
        saturation: 1 - fade,
        opacity: 1 - fade * 0.55,
        lineOpacity: 1 - fade * 0.75,
    };
}

/**
 * Return the deterministic visual milestones for the zoomed-in conclusion.
 * The destination placeholder dusts out first, then the winner fades into
 * that same card. This intentionally contains no position/interpolation
 * field: winners do not travel across the bracket during the reveal.
 */
export function tournamentConclusionVisualState(progress = 0) {
    const normalized = clamp(progress);
    return {
        progress: normalized,
        loserProgress: tournamentEaseInOut(normalized),
        dustOutProgress: tournamentEaseInOut(normalized * 2),
        winnerFadeInProgress: tournamentEaseInOut((normalized - 0.5) * 2),
    };
}

function stableTextHash(value) {
    let hash = 2166136261;
    for (const character of String(value || "tournament-dust")) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

/**
 * Deterministic normalized particles used while a destination `???` card
 * disintegrates during winner advancement. The renderer scales these values
 * into the destination card, so no wall-clock randomness enters the replay.
 */
export function tournamentAdvancementDust(nodeId, count = 14) {
    const safeCount = Math.max(0, Math.min(64, Math.floor(Number(count) || 0)));
    let state = stableTextHash(nodeId);
    const next = () => {
        state = (Math.imul(state ^ (state >>> 16), 2246822519) + 3266489917) >>> 0;
        return state / 0x100000000;
    };
    return Array.from({ length: safeCount }, (_, index) => ({
        index,
        x: 0.08 + next() * 0.84,
        y: 0.12 + next() * 0.76,
        driftX: (next() - 0.5) * 0.9,
        driftY: (next() - 0.5) * 0.9,
        size: 0.035 + next() * 0.075,
        delay: next() * 0.22,
    }));
}

function readCurrentMatch(tournament, roundIndex, matchIndex) {
    const rounds = Array.isArray(tournament?.rounds) ? tournament.rounds : [];
    const round = rounds[roundIndex];
    if (!round) return null;
    const candidate = round.matches?.[matchIndex];
    return candidate || null;
}

/**
 * Return a presentation-only bracket snapshot with a completed match result
 * committed into its destination card. This protects the handoff frame from
 * briefly redrawing `???` when Gameplay has advanced currentMatch before its
 * serialized rounds snapshot catches up. The authoritative object is never
 * mutated.
 */
export function tournamentWithCommittedResult(tournament = {}, {
    matchId = null,
    winnerId = null,
} = {}) {
    if (!matchId || !winnerId || !Array.isArray(tournament?.rounds)) return tournament;
    let changed = false;
    const rounds = tournament.rounds.map((round) => {
        const matches = Array.isArray(round?.matches) ? round.matches.map((match) => {
            if (match?.id !== matchId) return match;
            const resolved = match.winnerEntrantId
                ?? match.resolvedEntrantId
                ?? match.entrantId
                ?? match.winnerId
                ?? match.resolvedOrbId;
            if (resolved) return match;
            changed = true;
            return { ...match, winnerEntrantId: winnerId, winnerId };
        }) : round?.matches;
        return matches === round?.matches ? round : { ...round, matches };
    });
    return changed ? { ...tournament, rounds } : tournament;
}

/** Normalize current/future Gameplay presentation fields without owning them. */
export function normalizeTournamentPresentation(input = {}) {
    const tournament = input.tournament || input.bracket || input;
    const size = normalizeTournamentSize(input.size ?? tournament?.size);
    const roundIndex = clampNumber(
        input.roundIndex ?? input.currentRound ?? tournament?.currentRound,
        0,
        tournamentRoundCount(size) - 1,
        0,
    );
    const matchIndex = clampNumber(
        input.matchIndex ?? input.currentMatch ?? tournament?.currentMatch,
        0,
        tournamentRoundMatchCount(size, roundIndex) - 1,
        0,
    );
    const match = input.match || readCurrentMatch(tournament, roundIndex, matchIndex);
    const elapsed = Math.max(0, Number(input.elapsed ?? input.presentationTime ?? input.now ?? 0) || 0);
    const matchDuration = Math.max(0, Number(input.matchDuration ?? match?.duration ?? 0) || 0);
    const recordingScope = input.recordingScope === "whole-round" || input.scope === "whole-round"
        ? "whole-round"
        : "each-match";
    return {
        tournament,
        size,
        roundIndex,
        matchIndex,
        match,
        entrants: entrantSlots(tournament, size),
        elapsed,
        matchDuration,
        reducedMotion: input.reducedMotion === true || input.options?.reducedMotion === true,
        recordingScope,
        winnerId: input.winnerId ?? match?.winnerId ?? null,
        loserId: input.loserId ?? null,
        championId: input.championId ?? tournament?.championId ?? null,
        completed: input.completed === true || tournament?.completed === true,
    };
}

/**
 * Deterministic per-match presentation clock. The race itself is represented
 * by the existing match simulation; this clock only wraps it with bracket
 * intro/conclusion states.
 */
export function tournamentPresentationAtTime(input = {}) {
    const state = normalizeTournamentPresentation(input);
    const timing = TOURNAMENT_PRESENTATION_TIMING;
    const matchSeconds = state.matchDuration;
    const bracketSeconds = state.reducedMotion ? 0 : timing.bracketSeconds;
    const zoomSeconds = state.reducedMotion ? 0 : timing.zoomInSeconds;
    const fadeSeconds = state.reducedMotion ? 0 : timing.loserFadeSeconds;
    const advanceSeconds = state.reducedMotion ? 0 : timing.winnerAdvanceSeconds;
    const championSeconds = state.reducedMotion ? 0 : timing.championSeconds;
    const bracketEnd = bracketSeconds;
    const zoomEnd = bracketEnd + zoomSeconds;
    const matchEnd = zoomEnd + matchSeconds;
    const fadeEnd = matchEnd + fadeSeconds;
    const advanceEnd = fadeEnd + advanceSeconds;
    const conclusionSeconds = Math.max(0.001, fadeSeconds + advanceSeconds);
    const champion = state.completed && state.roundIndex >= tournamentRoundCount(state.size) - 1;
    const championEnd = advanceEnd + (champion ? championSeconds : 0);
    const elapsed = state.elapsed;
    let phase = "complete";
    let phaseProgress = 1;
    if (state.reducedMotion && elapsed === 0) {
        // Reduced motion still needs one deterministic frame for the live
        // matchup. Cosmetic bracket/zoom/conclusion holds collapse to the
        // race state instead of producing a blank completed frame.
        phase = "match";
        phaseProgress = 0;
    } else if (elapsed < bracketEnd) {
        phase = "bracket";
        phaseProgress = bracketSeconds ? elapsed / bracketSeconds : 1;
    } else if (elapsed < zoomEnd) {
        phase = "zoom-in";
        phaseProgress = zoomSeconds ? (elapsed - bracketEnd) / zoomSeconds : 1;
    } else if (elapsed < matchEnd) {
        phase = "match";
        phaseProgress = matchSeconds ? (elapsed - zoomEnd) / matchSeconds : 1;
    } else if (elapsed < fadeEnd) {
        phase = "loser-fade";
        phaseProgress = fadeSeconds ? (elapsed - matchEnd) / fadeSeconds : 1;
    } else if (elapsed < advanceEnd) {
        phase = "winner-advance";
        phaseProgress = advanceSeconds ? (elapsed - fadeEnd) / advanceSeconds : 1;
    } else if (champion && elapsed < championEnd) {
        phase = "champion";
        phaseProgress = championSeconds ? (elapsed - advanceEnd) / championSeconds : 1;
    }
    const easedProgress = tournamentEaseInOut(phaseProgress);
    const introVisual = tournamentMatchupIntroVisualState({
        elapsed: Math.max(0, elapsed - bracketEnd),
    });
    const conclusionProgress = tournamentConclusionVisualState(
        (elapsed - matchEnd) / conclusionSeconds,
    );
    return {
        ...state,
        phase,
        phaseProgress: clamp(phaseProgress),
        easedProgress,
        bracketProgress: phase === "bracket" ? easedProgress : 1,
        zoomProgress: phase === "zoom-in" ? introVisual.cameraProgress : elapsed >= zoomEnd ? 1 : 0,
        matchupHoldProgress: phase === "zoom-in" ? introVisual.holdProgress : elapsed >= zoomEnd ? 1 : 0,
        matchupHolding: phase === "zoom-in" && introVisual.holding,
        loserProgress: phase === "loser-fade" ? easedProgress : elapsed >= fadeEnd ? 1 : 0,
        winnerProgress: phase === "winner-advance" ? easedProgress : elapsed >= advanceEnd ? 1 : 0,
        conclusionProgress: conclusionProgress.progress,
        dustOutProgress: conclusionProgress.dustOutProgress,
        winnerFadeInProgress: conclusionProgress.winnerFadeInProgress,
        championProgress: phase === "champion" ? easedProgress : phase === "complete" && champion ? 1 : 0,
        done: phase === "complete" || (champion && elapsed >= championEnd),
        bracketVisible: true,
        matchupVisible: elapsed >= bracketEnd,
        raceVisible: elapsed >= zoomEnd && elapsed < matchEnd + fadeSeconds,
        zoomTarget: {
            roundIndex: state.roundIndex,
            matchIndex: state.matchIndex,
        },
    };
}

export function tournamentRecordingMatchKey({
    tournamentSize,
    roundIndex = 0,
    matchIndex = 0,
    matchId = null,
} = {}) {
    const safeMatchId = String(matchId || `r${roundIndex}-m${matchIndex}`).replace(/[^a-z0-9-]+/gi, "-");
    return `t${normalizeTournamentSize(tournamentSize)}-r${Math.max(1, Number(roundIndex) + 1)}-m${Math.max(1, Number(matchIndex) + 1)}-${safeMatchId}`;
}

/**
 * Deterministic presentation cue emitted only on the transition into zoom.
 * Callers may retain the returned matchKey as their one-shot guard; the
 * simulation never consumes this cosmetic cue.
 */
export function tournamentPresentationCueFor(previousFrame = {}, frame = {}) {
    if (frame?.phase !== "zoom-in" || previousFrame?.phase === "zoom-in") return null;
    return {
        type: "race-tournament-bracket-zoom-in",
        matchKey: tournamentRecordingMatchKey({
            tournamentSize: frame.size ?? frame.tournament?.size,
            roundIndex: frame.roundIndex,
            matchIndex: frame.matchIndex,
            matchId: frame.matchId,
        }),
    };
}

export function tournamentPresentationAdapter(input = {}) {
    const state = normalizeTournamentPresentation(input);
    return {
        ...tournamentPresentationAtTime(state),
        layoutOptions: {
            size: state.size,
            tournament: state.tournament,
        },
        matchupZoom: (layout, options = {}) => tournamentMatchupZoomRect(layout, {
            roundIndex: state.roundIndex,
            matchIndex: state.matchIndex,
            ...options,
        }),
    };
}

export const TOURNAMENT_PRESENTATION_CONTRACT = Object.freeze({
    module: "orb-race-tournament-presentation",
    phases: TOURNAMENT_PRESENTATION_PHASES,
    sizes: TOURNAMENT_BRACKET_SIZES,
    deterministic: true,
    simulationOwned: false,
});
