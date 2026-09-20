import {
    ORB_RACE_LONGFORM_DEFAULT_TARGET,
    ORB_RACERS,
    ORB_RACER_IDS,
    buildRaceLayerPreset,
    normalizeRaceLayers,
    normalizeRaceFinalLayerTarget,
} from "./orb-race.js";

// This module intentionally does not import simulation.js. The dormant batch
// tournament worker owns a separate legacy API; keeping this bracket layer
// dependency-light avoids reintroducing that module's circular import while
// still using the same fixed LCG as SeededRandom for seeded ordering.

export const ORB_RACE_TOURNAMENT_SIZES = Object.freeze([4, 8, 16, 32, 64]);
export const ORB_RACE_TOURNAMENT_RECORDING_SCOPES = Object.freeze([
    "each-match",
    "whole-round",
    "whole-tournament",
]);
export const ORB_RACE_TOURNAMENT_RECORDING_SELECTIONS = Object.freeze([
    "match",
    "selected-round",
    "whole-tournament",
]);
export const ORB_RACE_TOURNAMENT_RECORDING_FORMATS = Object.freeze({
    match: Object.freeze({ id: "short-portrait", width: 1080, height: 1920, layerCount: 3 }),
    "selected-round": Object.freeze({ id: "long-landscape", width: 1920, height: 1080, layerCount: 5 }),
    "whole-tournament": Object.freeze({ id: "long-landscape", width: 1920, height: 1080, layerCount: 5 }),
});
export const ORB_RACE_TOURNAMENT_UNKNOWN_LABEL = "???";
export const ORB_RACE_TOURNAMENT_DEFAULT_SIZE = 8;
export const ORB_RACE_TOURNAMENT_LAYER_COUNTS = Object.freeze([3, 5]);
export const ORB_RACE_TOURNAMENT_PRESENTATION_TIMING = Object.freeze({
    bracketIntroDuration: 0,
    zoomDuration: 1,
    cameraPanDuration: 1,
    matchupHoldDuration: 1.75,
    preFightDuration: 2.75,
    conclusionDuration: 1.75,
    nextMatchGap: 0.55,
});
export const ORB_RACE_TOURNAMENT_STATE_VERSION = 1;
export const ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE = "individual-match";
export const ORB_RACE_TOURNAMENT_PHASES = Object.freeze([
    "intro-bracket",
    "bracket-zoom",
    "battle",
    "result",
    "conclusion",
    "next-match",
    "camera-pan",
    "matchup-hold",
    "champion-conclusion",
]);

const DEFAULT_TOURNAMENT_SIZE = ORB_RACE_TOURNAMENT_DEFAULT_SIZE;
const PRESENTATION_DURATIONS = ORB_RACE_TOURNAMENT_PRESENTATION_TIMING;

/**
 * Build the shared tournament/long-form wall preset. Tournament recordings
 * intentionally support only the compact 3- and 5-wall courses; the last
 * value is always the normalized target so every matchup receives the same
 * complete course.
 */
export function buildOrbRaceTournamentLayerPreset(layerCount = 5, finalLayerHealth = ORB_RACE_LONGFORM_DEFAULT_TARGET) {
    const numericCount = Math.floor(Number(layerCount));
    const count = ORB_RACE_TOURNAMENT_LAYER_COUNTS.includes(numericCount) ? numericCount : 5;
    const target = normalizeRaceFinalLayerTarget(finalLayerHealth, ORB_RACE_LONGFORM_DEFAULT_TARGET);
    const preset = buildRaceLayerPreset(count, target);
    preset[preset.length - 1] = target;
    return preset;
}

export const buildTournamentLayerPreset = buildOrbRaceTournamentLayerPreset;
export const buildSharedTournamentLayerPreset = buildOrbRaceTournamentLayerPreset;
export const buildRaceLayerPresetForTournament = buildOrbRaceTournamentLayerPreset;

export function normalizeOrbRaceTournamentPresentationTiming(input = {}, { reducedMotion = false } = {}) {
    const raw = input && typeof input === "object" ? input : {};
    // The camera contract is deliberately canonical. Older saves may contain
    // a 1.2s static dwell or a 2.75s pan; neither may delay a matchup now.
    const zoomDuration = PRESENTATION_DURATIONS.zoomDuration;
    const cameraPanDuration = PRESENTATION_DURATIONS.cameraPanDuration;
    const matchupHoldDuration = PRESENTATION_DURATIONS.matchupHoldDuration;
    const preFightDuration = zoomDuration + matchupHoldDuration;
    const requestedConclusion = Number(raw.conclusionDuration ?? raw.conclusion ?? raw.resultDuration);
    const conclusionDuration = Number.isFinite(requestedConclusion)
        ? Math.max(1.5, Math.min(2, requestedConclusion))
        : PRESENTATION_DURATIONS.conclusionDuration;
    const normal = {
        bracketIntroDuration: PRESENTATION_DURATIONS.bracketIntroDuration,
        zoomDuration,
        cameraPanDuration,
        matchupHoldDuration,
        preFightDuration,
        conclusionDuration,
        nextMatchGap: PRESENTATION_DURATIONS.nextMatchGap,
    };
    return {
        ...normal,
        reducedMotion: reducedMotion === true || raw.reducedMotion === true,
        reducedMotionEquivalent: {
            ...normal,
            bracketIntroDuration: 0,
            zoomDuration: 0,
            cameraPanDuration: 0,
            matchupHoldDuration: 0,
            preFightDuration: 0,
            conclusionDuration: 0,
        },
    };
}

export const getOrbRaceTournamentPresentationTiming = normalizeOrbRaceTournamentPresentationTiming;

export function normalizeOrbRaceTournamentSize(value, fallback = DEFAULT_TOURNAMENT_SIZE) {
    if (isOrbRaceTournamentSize(value)) return Number(value);
    return isOrbRaceTournamentSize(fallback) ? Number(fallback) : DEFAULT_TOURNAMENT_SIZE;
}

function orbRaceTournamentEntryId(entry) {
    return typeof entry === "string" ? entry : entry?.orbId || entry?.id || null;
}

/**
 * Choose exactly enough stable, unique roster IDs for a wizard bracket. An
 * explicit partial selection is preserved in order and deterministically
 * filled from the remaining roster; an omitted selection is seeded from the
 * full roster. Validation still rejects explicit unknowns/duplicates when a
 * tournament is created.
 */
export function selectOrbRaceTournamentEntrants({
    size = DEFAULT_TOURNAMENT_SIZE,
    seed = 2406,
    entrants = null,
    roster = ORB_RACER_IDS,
} = {}) {
    const bracketSize = normalizeOrbRaceTournamentSize(size);
    const rosterIds = [...new Set((Array.isArray(roster) ? roster : ORB_RACER_IDS)
        .map(orbRaceTournamentEntryId)
        .filter((id) => ORB_RACER_IDS.includes(id)))];
    const requested = Array.isArray(entrants)
        ? entrants.map(orbRaceTournamentEntryId).filter(Boolean)
        : [];
    const selected = requested.slice(0, bracketSize);
    const seen = new Set(selected);
    const fillSeed = deriveOrbRaceTournamentRosterSeed(seed, bracketSize);
    const fill = seededShuffle(rosterIds.filter((id) => !seen.has(id)), fillSeed);
    for (const id of fill) {
        if (selected.length >= bracketSize) break;
        selected.push(id);
        seen.add(id);
    }
    return selected.slice(0, bracketSize);
}

export const autoSelectOrbRaceTournamentEntrants = selectOrbRaceTournamentEntrants;

export function normalizeOrbRaceTournamentPreviewSelection(value) {
    const raw = typeof value === "string"
        ? value
        : value?.selection || value?.recordingSelection || value?.scope || value?.recordingScope;
    const normalized = String(raw || "match").trim().toLowerCase();
    if (["whole-tournament", "tournament", "all", "entire-tournament"].includes(normalized)) {
        return "whole-tournament";
    }
    if (["selected-round", "whole-round", "round", "selected-rounds"].includes(normalized)) {
        return "selected-round";
    }
    return "match";
}

export const normalizeOrbRaceTournamentRecordingPreview = normalizeOrbRaceTournamentPreviewSelection;

export function isOrbRaceTournamentSize(value) {
    return ORB_RACE_TOURNAMENT_SIZES.includes(Number(value));
}

export function normalizeOrbRaceTournamentOptions(input = null, { seed = 2406, defaultEntrants = null } = {}) {
    if (input === null || input === undefined || input === false) return null;
    const raw = input === true ? {} : input && typeof input === "object" ? input : {};
    if (raw.enabled === false) return null;

    const size = normalizeOrbRaceTournamentSize(raw.size);
    const rawEntrants = raw.entrantIds
        ?? raw.entrants
        ?? raw.roster
        ?? raw.selectedOrbIds
        ?? defaultEntrants
        ?? null;
    const hasExplicitEntrants = rawEntrants != null;
    const normalizedSeed = normalizeSeed(raw.seed ?? seed);
    const selectedEntrantIds = selectOrbRaceTournamentEntrants({
        size,
        seed: normalizedSeed,
        entrants: rawEntrants,
    });
    const seedingValue = String(
        raw.seeding
        || raw.seedingMode
        || (raw.customSeeding === true ? "custom" : hasExplicitEntrants ? "custom" : "random"),
    ).toLowerCase();
    const seedingMode = seedingValue === "custom" || seedingValue === "user" ? "custom" : "random";
    const requestedSeedOrder = Array.isArray(raw.seedOrder)
        ? raw.seedOrder.map((entry) => typeof entry === "string" ? entry : entry?.orbId || entry?.id)
        : null;
    const seedOrder = seedingMode === "custom" && requestedSeedOrder?.length === size
        ? requestedSeedOrder
        : [...selectedEntrantIds];
    const configuredRecordingScope = normalizeRecordingScope(raw.recordingScope || raw.recording || raw.scope);
    const recordingSelection = normalizeRecordingSelection(raw, configuredRecordingScope);
    const recordingScope = recordingSelection === "match"
        ? "each-match"
        : configuredRecordingScope === "whole-tournament"
            ? "whole-tournament"
            : "whole-round";
    const recordingSegmentScope = recordingScope === "each-match" ? "each-match" : "whole-round";
    const recordingFormat = ORB_RACE_TOURNAMENT_RECORDING_FORMATS[recordingSelection];
    const recordingLayerCount = recordingSelection === "match"
        ? 3
        : normalizeTournamentLongformLayerCount(raw.landscapeLayerCount ?? raw.layerCount, 5);
    const sharedLayerValues = normalizeTournamentLayerValues(raw, recordingSelection, recordingLayerCount);
    const selectedRoundSelection = normalizeOrbRaceTournamentRoundSelection(
        { ...raw, recordingSelection },
        size,
    );
    const selectedRoundIndices = selectedRoundSelection.selectedRoundIndices;
    const matchSettings = raw.matchSettings || raw.orbRaceSettings || raw.settings || null;
    const presentationTiming = normalizeOrbRaceTournamentPresentationTiming(
        raw.presentationTiming || raw.timing,
        { reducedMotion: raw.reducedMotion === true },
    );

    return {
        enabled: true,
        version: ORB_RACE_TOURNAMENT_STATE_VERSION,
        title: typeof raw.title === "string" && raw.title.trim()
            ? raw.title.trim()
            : "ORB RACE TOURNAMENT",
        size,
        seed: normalizedSeed,
        entrantIds: seedOrder,
        selectedEntrantIds,
        seedOrder,
        seeding: seedingMode,
        seedingMode,
        recordingScope,
        recordingSegmentScope,
        recordingScopeLegacy: recordingScope === "each-match"
            ? ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE
            : recordingScope,
        recordingSelection,
        recordingFormat: recordingFormat.id,
        recordingDimensions: {
            width: recordingFormat.width,
            height: recordingFormat.height,
        },
        recordingLayerCount,
        sharedLayerValues,
        selectedRoundIndices,
        selectedRoundIds: selectedRoundSelection.selectedRoundIds,
        allowDuplicateEntrants: raw.allowDuplicateEntrants === true
            || raw.allowDuplicates === true,
        matchSettings,
        presentationTiming,
    };
}

/**
 * Return a deterministic, wizard-ready tournament configuration. The helper
 * deliberately selects from stable Orb Race IDs only; callers can still pass
 * an explicit custom order when they want user-controlled seeding.
 */
export function orbRaceTournamentWizardDefaults(options = {}) {
    const raw = options && typeof options === "object" ? options : {};
    const size = normalizeOrbRaceTournamentSize(raw.size);
    const seed = normalizeSeed(raw.seed ?? 2406);
    const explicitEntrants = raw.entrants
        ?? raw.entrantIds
        ?? raw.selectedOrbIds
        ?? null;
    const entrants = selectOrbRaceTournamentEntrants({
        size,
        seed,
        entrants: explicitEntrants,
    });
    const seedingMode = String(raw.seedingMode || raw.seeding || "random").toLowerCase() === "custom"
        ? "custom"
        : "random";
    const seedOrder = seedingMode === "custom" && Array.isArray(raw.seedOrder)
        ? raw.seedOrder.map(orbRaceTournamentEntryId)
        : entrants;
    const recordingScope = normalizeRecordingScope(raw.recordingScope);
    const recordingSelection = normalizeOrbRaceTournamentPreviewSelection(
        raw.recordingSelection || (recordingScope === "whole-tournament"
            ? "whole-tournament"
            : recordingScope === "whole-round" ? "selected-round" : "match"),
    );
    return normalizeOrbRaceTournamentOptions({
        ...raw,
        enabled: true,
        size,
        seed,
        entrants,
        seedOrder,
        seedingMode,
        recordingScope,
        recordingSelection,
        landscapeLayerCount: raw.landscapeLayerCount ?? raw.layerCount ?? 5,
    }, { seed });
}

export const getOrbRaceTournamentWizardDefaults = orbRaceTournamentWizardDefaults;
export const createOrbRaceTournamentWizardDefaults = orbRaceTournamentWizardDefaults;
export const normalizeOrbRaceTournamentWizardOptions = orbRaceTournamentWizardDefaults;

export function createOrbRaceTournament(options = {}) {
    const existingState = options?.mode === "orb-race-tournament"
        ? options
        : options?.raceTournamentState?.mode === "orb-race-tournament"
            ? options.raceTournamentState
            : options?.state?.mode === "orb-race-tournament"
                ? options.state
                : null;
    if (existingState) return restoreOrbRaceTournament(existingState);
    const normalized = normalizeOrbRaceTournamentOptions(options, {
        seed: options.seed,
        defaultEntrants: options.defaultEntrants,
    });
    if (!normalized) return null;
    const orbIds = validateEntrants(normalized.entrantIds, normalized.size, normalized.allowDuplicateEntrants);
    const bracketSeed = deriveOrbRaceTournamentBracketSeed(normalized.seed);
    const seededOrbIds = normalized.seeding === "random"
        ? seededShuffle(orbIds, bracketSeed)
        : [...orbIds];
    const entrants = seededOrbIds.map((orbId, slot) => {
        const duplicateSuffix = normalized.allowDuplicateEntrants ? `#${slot + 1}` : "";
        return {
            id: `${orbId}${duplicateSuffix}`,
            orbId,
            seedSlot: slot,
            seed: slot + 1,
            sourceOrder: orbIds.indexOf(orbId),
            side: slot < normalized.size / 2 ? "left" : "right",
            status: "pending",
            winnerRoundIndex: null,
            eliminatedRoundIndex: null,
        };
    });
    const bracket = buildBracket(normalized.size, entrants, normalized.seed, normalized.recordingScope);
    const recordingQueue = buildRecordingQueue(bracket.rounds, normalized);
    const state = {
        enabled: true,
        version: ORB_RACE_TOURNAMENT_STATE_VERSION,
        mode: "orb-race-tournament",
        title: normalized.title,
        tournamentId: `orb-race-tournament-${normalized.seed}`,
        size: normalized.size,
        seed: normalized.seed,
        bracketSeed,
        seeding: normalized.seeding,
        seedingMode: normalized.seedingMode,
        allowDuplicateEntrants: normalized.allowDuplicateEntrants,
        recordingScope: normalized.recordingScope,
        recordingSegmentScope: normalized.recordingSegmentScope,
        recordingScopeLegacy: normalized.recordingScopeLegacy,
        recordingSelection: normalized.recordingSelection,
        presentationTiming: cloneJson(normalized.presentationTiming),
        recordingFormat: normalized.recordingFormat,
        recordingLayerCount: normalized.recordingLayerCount,
        recordingDimensions: { ...normalized.recordingDimensions },
        sharedLayerValues: [...normalized.sharedLayerValues],
        sharedLayerCount: normalized.sharedLayerValues.length,
        selectedRoundIndices: [...normalized.selectedRoundIndices],
        selectedRoundIds: [...normalized.selectedRoundIds],
        deterministicSeeds: {
            tournamentSeed: normalized.seed,
            bracketSeed,
            matchSeeds: bracket.rounds.flatMap((round) => round.matches.map((match) => ({
                matchId: match.id,
                seed: match.seed,
            }))),
        },
        selectedEntrantIds: [...normalized.selectedEntrantIds],
        seedOrder: entrants.map((entrant) => entrant.orbId),
        entrantIds: entrants.map((entrant) => entrant.id),
        entrants,
        seedSlots: bracket.seedSlots,
        leftSeedSlots: bracket.leftSeedSlots,
        rightSeedSlots: bracket.rightSeedSlots,
        nodes: bracket.nodes,
        rounds: bracket.rounds,
        bracket: {
            size: normalized.size,
            seedSlots: bracket.seedSlots,
            leftSeedSlots: bracket.leftSeedSlots,
            rightSeedSlots: bracket.rightSeedSlots,
            nodes: bracket.nodes,
            rounds: bracket.rounds,
            finalMatchId: bracket.finalMatchId,
        },
        matchSettings: normalized.matchSettings,
        status: "active",
        currentRoundIndex: 0,
        currentRoundLabel: bracket.rounds[0]?.label || null,
        currentMatchId: null,
        selectedMatchId: null,
        currentMatch: null,
        activeMatchId: null,
        pendingMatchIds: bracket.rounds.flatMap((round) => round.matches.map((match) => match.id)),
        lastCompletedMatchId: null,
        completedMatchCount: 0,
        results: [],
        advancingOrbId: null,
        eliminatedOrbId: null,
        championId: null,
        championOrbId: null,
        clock: 0,
        startedAt: 0,
        completedAt: null,
        lastResult: null,
        presentation: null,
        presentationTimestamps: null,
        presentationHold: null,
        recording: {
            scope: normalized.recordingScope,
            segmentScope: normalized.recordingSegmentScope,
            selection: normalized.recordingSelection,
            format: normalized.recordingFormat,
            dimensions: { ...normalized.recordingDimensions },
            layerCount: normalized.recordingLayerCount,
            layerValues: [...normalized.sharedLayerValues],
            selectedRoundIndices: [...normalized.selectedRoundIndices],
            selectedRoundIds: [...normalized.selectedRoundIds],
            longFormIntroMatchId: null,
            lastIncludedMatchId: null,
            includedMatchIds: [],
            cameraPanCount: 0,
            activeSegmentId: null,
            queue: recordingQueue,
            segmentBoundaries: [],
            segments: [],
        },
        recordingQueue,
        recordingSegmentBoundaries: [],
    };
    relinkTournamentBracketNodes(state);
    syncTournamentBracket(state);
    const firstMatch = bracket.rounds[0]?.matches[0] || null;
    if (firstMatch) activateMatch(state, firstMatch, 0);
    return state;
}

export function currentOrbRaceTournamentMatch(tournament) {
    if (!tournament) return null;
    return findMatch(tournament, tournament.activeMatchId)
        || findMatch(tournament, tournament.currentMatchId)
        || null;
}

export const getCurrentOrbRaceTournamentMatch = currentOrbRaceTournamentMatch;

export function orbRaceTournamentMatchEntrants(tournament, match = currentOrbRaceTournamentMatch(tournament)) {
    if (!match) return [];
    return [match.left, match.right]
        .filter(Boolean)
        .map((node) => ({
            entrantId: node.entrantId || null,
            orbId: node.orbId || null,
            seedSlot: node.seedSlot ?? null,
            side: node.side || null,
            nodeId: node.nodeId || null,
        }));
}

export function orbRaceTournamentMatchTeams(tournament, match = currentOrbRaceTournamentMatch(tournament)) {
    return orbRaceTournamentMatchEntrants(tournament, match).map((entrant) => (
        entrant.orbId ? [entrant.orbId] : []
    ));
}

export function recordOrbRaceTournamentResult(tournament, winnerOrOptions, resultOptions = {}) {
    if (!tournament || tournament.status === "completed") return tournament;
    const match = currentOrbRaceTournamentMatch(tournament);
    if (!match || match.status !== "active") throw new Error("Orb Race tournament has no active match");
    const options = typeof winnerOrOptions === "object" && winnerOrOptions !== null
        ? winnerOrOptions
        : { ...resultOptions, winnerId: winnerOrOptions };
    const winnerNode = resolveWinnerNode(match, options);
    if (!winnerNode?.entrantId) throw new Error("Tournament result must select one active entrant");
    const loserNode = match.left.entrantId === winnerNode.entrantId ? match.right : match.left;
    const winner = findEntrant(tournament, winnerNode.entrantId);
    const loser = findEntrant(tournament, loserNode?.entrantId);
    const duration = Math.max(0, Number(options.duration) || 0);
    const resultAt = Number.isFinite(Number(options.resultAt))
        ? Math.max(tournament.clock, Number(options.resultAt))
        : Math.max(tournament.clock, Number(match.presentation?.battleAt) || 0) + duration;
    const timing = effectivePresentationTiming(
        tournament.presentationTiming || normalizeOrbRaceTournamentPresentationTiming(),
    );
    const conclusionAt = resultAt;
    const conclusionEndAt = conclusionAt + timing.conclusionDuration;
    const advancementAt = conclusionEndAt;
    const defaultNextMatchAt = conclusionEndAt + timing.nextMatchGap;
    const destinationNodeId = match.targetNodeId || null;
    const destinationLabel = orbRaceLabel(winner.orbId);

    match.status = "completed";
    match.completedAt = resultAt;
    match.winnerId = winner.id;
    match.winnerOrbId = winner.orbId;
    match.eliminatedId = loser?.id || null;
    match.eliminatedOrbId = loser?.orbId || null;
    match.analytics = options.analytics ? compactAnalytics(options.analytics) : null;
    match.simStats = options.simStats ? { ...options.simStats } : null;
    match.presentation = {
        ...(match.presentation || createPresentationTimestamps(0)),
        resultAt,
        conclusionAt,
        conclusionEndAt,
        advancementAt,
        nextMatchAt: defaultNextMatchAt,
        championConclusionAt: null,
        championConclusionEndAt: null,
        destinationNodeId,
        destinationLabel,
    };
    if (winner) {
        winner.status = "advanced";
        winner.winnerRoundIndex = match.roundIndex;
    }
    if (loser) {
        loser.status = "eliminated";
        loser.eliminatedRoundIndex = match.roundIndex;
    }
    closeMatchRecordingSegment(tournament, match, resultAt);
    tournament.completedMatchCount += 1;
    tournament.lastCompletedMatchId = match.id;
    tournament.advancingOrbId = winner.orbId;
    tournament.eliminatedOrbId = loser?.orbId || null;
    tournament.lastResult = {
        matchId: match.id,
        roundIndex: match.roundIndex,
        roundLabel: match.roundLabel,
        advancingEntrantId: winner.id,
        advancingOrbId: winner.orbId,
        eliminatedEntrantId: loser?.id || null,
        eliminatedOrbId: loser?.orbId || null,
        resultAt,
        conclusionAt,
        conclusionEndAt,
        advancementAt,
        nextMatchAt: defaultNextMatchAt,
        destinationNodeId,
        destinationLabel,
    };
    tournament.results = Array.isArray(tournament.results) ? tournament.results : [];
    tournament.results.push({ ...tournament.lastResult });
    syncTournamentBracket(tournament);
    const round = tournament.rounds[match.roundIndex];
    if (round && round.matches.every((candidate) => candidate.status === "completed")) {
        round.status = "completed";
        closeRoundRecordingSegment(tournament, round, conclusionEndAt);
    }

    const isFinal = match.roundIndex === tournament.rounds.length - 1;
    const nextMatch = isFinal ? null : findNextEligibleMatch(tournament);
    const useCameraPan = Boolean(
        nextMatch
        && shouldUseLongFormCameraPan(tournament, match, nextMatch),
    );
    const nextMatchAt = useCameraPan ? conclusionEndAt : defaultNextMatchAt;
    match.presentation.nextMatchAt = nextMatchAt;
    match.presentation.nextMatchIntroMode = useCameraPan ? "camera-pan" : "full-intro";
    match.presentation.nextMatchId = nextMatch?.id || null;
    match.presentation.nextRoundIndex = nextMatch?.roundIndex ?? null;
    match.presentation.nextMatchIndex = nextMatch?.matchIndex ?? null;
    match.presentation.nextMatchTransition = useCameraPan
        ? {
            type: "camera-pan",
            fromMatchId: match.id,
            toMatchId: nextMatch.id,
            startAt: nextMatchAt,
            duration: timing.cameraPanDuration,
            endAt: nextMatchAt + timing.cameraPanDuration,
        }
        : null;
    updateRecordingTimelineForMatch(tournament, match);
    tournament.lastResult.nextMatchAt = nextMatchAt;
    tournament.lastResult.nextMatchIntroMode = useCameraPan ? "camera-pan" : "full-intro";
    tournament.lastResult.nextMatchId = nextMatch?.id || null;
    tournament.lastResult.nextRoundIndex = nextMatch?.roundIndex ?? null;
    tournament.lastResult.nextMatchIndex = nextMatch?.matchIndex ?? null;
    tournament.lastResult.nextMatchTransition = match.presentation.nextMatchTransition
        ? { ...match.presentation.nextMatchTransition }
        : null;
    const recordedResult = tournament.results.at(-1);
    if (recordedResult) Object.assign(recordedResult, {
        nextMatchAt,
        nextMatchIntroMode: tournament.lastResult.nextMatchIntroMode,
        nextMatchTransition: tournament.lastResult.nextMatchTransition,
        nextMatchId: tournament.lastResult.nextMatchId,
        nextRoundIndex: tournament.lastResult.nextRoundIndex,
        nextMatchIndex: tournament.lastResult.nextMatchIndex,
    });
    if (isFinal) {
        closeTournamentRecordingSegment(tournament, conclusionEndAt);
        tournament.status = "completed";
        tournament.championId = winner.id;
        tournament.championOrbId = winner.orbId;
        tournament.completedAt = conclusionEndAt;
        match.presentation.championConclusionAt = conclusionAt;
        match.presentation.championConclusionEndAt = conclusionEndAt;
        tournament.currentMatchId = match.id;
        tournament.selectedMatchId = match.id;
        tournament.activeMatchId = null;
        tournament.currentRoundIndex = match.roundIndex;
        tournament.currentRoundLabel = match.roundLabel;
        // Keep the authoritative session clock at the result boundary. A
        // finished simulation may continue advancing the deterministic
        // conclusion phase so media can render dust-out/fade-in progress.
        tournament.clock = conclusionAt;
        tournament.presentation = createTournamentPresentationState(
            "champion-conclusion",
            match.id,
            match.presentation,
            { match, tournament, time: tournament.clock },
        );
        tournament.presentationHold = null;
        tournament.presentationTimestamps = { ...match.presentation };
        tournament.recording.activeSegmentId = null;
        tournament.pendingMatchIds = [];
        tournament.currentMatch = snapshotMatch(match);
        return tournament;
    }

    if (nextMatch) {
        activateMatch(tournament, nextMatch, nextMatchAt, {
            previousMatch: match,
            introMode: useCameraPan ? "camera-pan" : "full-intro",
        });
        tournament.clock = resultAt;
        tournament.presentationHold = {
            matchId: match.id,
            nextMatchId: nextMatch.id,
            fromMatchId: match.id,
            toMatchId: nextMatch.id,
            fromRoundIndex: match.roundIndex,
            fromMatchIndex: match.matchIndex,
            toRoundIndex: nextMatch.roundIndex,
            toMatchIndex: nextMatch.matchIndex,
            nextMatchAt,
            nextMatchIntroMode: nextMatch.presentation?.introMode || "full-intro",
            transition: nextMatch.presentation?.cameraTransition
                ? { ...nextMatch.presentation.cameraTransition }
                : null,
            timestamps: { ...match.presentation },
        };
        tournament.presentation = createTournamentPresentationState(
            "conclusion",
            match.id,
            match.presentation,
            { match, tournament, time: tournament.clock },
        );
        tournament.presentationTimestamps = { ...match.presentation };
    } else {
        tournament.status = "pending";
        tournament.activeMatchId = null;
        tournament.currentMatchId = match.id;
        tournament.selectedMatchId = match.id;
        tournament.clock = resultAt;
        tournament.presentationHold = null;
        tournament.presentation = createTournamentPresentationState(
            "conclusion",
            match.id,
            match.presentation,
            { match, tournament, time: tournament.clock },
        );
        tournament.presentationTimestamps = { ...match.presentation };
    }
    syncTournamentBracket(tournament);
    return tournament;
}

export const recordOrbRaceTournamentMatch = recordOrbRaceTournamentResult;
export const advanceOrbRaceTournament = recordOrbRaceTournamentResult;
export const completeOrbRaceTournamentMatch = recordOrbRaceTournamentResult;

export function advanceOrbRaceTournamentPresentation(tournament, time = tournament?.clock || 0) {
    if (!tournament) return null;
    tournament.clock = Math.max(Number(tournament.clock) || 0, Number(time) || 0);
    if (tournament.status === "completed") {
        const match = currentOrbRaceTournamentMatch(tournament);
        tournament.presentation = createTournamentPresentationState(
            "champion-conclusion",
            tournament.currentMatchId,
            tournament.presentationTimestamps || match?.presentation,
            { match, tournament, time: tournament.clock },
        );
        return tournament.presentation;
    }
    if (tournament.presentationHold) {
        const hold = tournament.presentationHold;
        if (tournament.clock < hold.nextMatchAt) {
            const timestamps = hold.timestamps;
            const phase = tournament.clock >= (timestamps.conclusionAt ?? timestamps.resultAt ?? Infinity)
                ? "conclusion"
                : "result";
            tournament.presentation = createTournamentPresentationState(
                phase,
                hold.matchId,
                timestamps,
                { match: findMatch(tournament, hold.matchId), tournament, time: tournament.clock },
            );
            tournament.presentationTimestamps = { ...timestamps };
            return tournament.presentation;
        }
        const nextMatch = findMatch(tournament, hold.nextMatchId);
        if (nextMatch?.presentation) {
            const nextTimestamps = nextMatch.presentation;
            if (nextTimestamps.introMode === "camera-pan"
                && tournament.clock < Number(nextTimestamps.battleAt)) {
                const phase = tournament.clock < Number(nextTimestamps.panEndAt)
                    ? "camera-pan"
                    : "matchup-hold";
                tournament.presentation = createTournamentPresentationState(
                    phase,
                    nextMatch.id,
                    nextTimestamps,
                    { match: nextMatch, tournament, time: tournament.clock },
                );
                tournament.presentationTimestamps = { ...nextTimestamps };
                return tournament.presentation;
            }
            tournament.presentationHold = null;
            tournament.presentation = createTournamentPresentationState(
                nextTimestamps.introMode === "camera-pan" ? "battle" : "next-match",
                nextMatch.id,
                nextTimestamps,
                { match: nextMatch, tournament, time: tournament.clock },
            );
            tournament.presentationTimestamps = { ...nextTimestamps };
            return tournament.presentation;
        }
        tournament.presentationHold = null;
    }
    const match = currentOrbRaceTournamentMatch(tournament);
    if (!match?.presentation) return tournament.presentation;
    const timestamps = match.presentation;
    let phase = "intro-bracket";
    if (tournament.clock >= timestamps.championConclusionAt && timestamps.championConclusionAt !== null) phase = "champion-conclusion";
    else if (tournament.clock < Number(timestamps.battleAt)
        && tournament.clock >= Number(timestamps.holdStartAt)) phase = "matchup-hold";
    else if (timestamps.introMode === "camera-pan"
        && tournament.clock < Number(timestamps.panEndAt)) phase = "camera-pan";
    else if (timestamps.nextMatchAt !== null && tournament.clock >= timestamps.nextMatchAt) phase = "next-match";
    else if ((timestamps.conclusionAt ?? timestamps.resultAt) !== null
        && tournament.clock >= (timestamps.conclusionAt ?? timestamps.resultAt)) phase = "conclusion";
    else if (tournament.clock >= timestamps.battleAt) phase = "battle";
    else if (tournament.clock >= timestamps.bracketZoomAt) phase = "bracket-zoom";
    tournament.presentation = createTournamentPresentationState(
        phase,
        match.id,
        timestamps,
        { match, tournament, time: tournament.clock },
    );
    tournament.presentationTimestamps = { ...timestamps };
    return tournament.presentation;
}

export const updateOrbRaceTournamentPresentation = advanceOrbRaceTournamentPresentation;

export function snapshotOrbRaceTournament(tournament) {
    if (!tournament) return null;
    const currentMatch = currentOrbRaceTournamentMatch(tournament);
    return {
        enabled: tournament.enabled === true,
        version: tournament.version || ORB_RACE_TOURNAMENT_STATE_VERSION,
        mode: tournament.mode,
        title: tournament.title,
        tournamentId: tournament.tournamentId,
        size: tournament.size,
        seed: tournament.seed,
        bracketSeed: tournament.bracketSeed,
        seeding: tournament.seeding,
        seedingMode: tournament.seedingMode || tournament.seeding,
        selectedEntrantIds: [...(tournament.selectedEntrantIds || [])],
        seedOrder: [...(tournament.seedOrder || tournament.entrantIds || [])],
        recordingScope: tournament.recordingScope,
        recordingSegmentScope: tournament.recordingSegmentScope
            || tournament.recording?.segmentScope
            || (tournament.recordingScope === "each-match" ? "each-match" : "whole-round"),
        recordingScopeLegacy: tournament.recordingScopeLegacy
            || (tournament.recordingScope === "each-match" ? ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE : tournament.recordingScope),
        recordingSelection: tournament.recordingSelection || "match",
        presentationTiming: tournament.presentationTiming
            ? cloneJson(tournament.presentationTiming)
            : normalizeOrbRaceTournamentPresentationTiming(),
        recordingFormat: tournament.recordingFormat || "short-portrait",
        recordingLayerCount: tournament.recordingLayerCount
            || tournament.recording.layerCount
            || tournament.sharedLayerValues?.length
            || 0,
        recordingDimensions: tournament.recordingDimensions
            ? { ...tournament.recordingDimensions }
            : { width: 1080, height: 1920 },
        sharedLayerValues: [...(tournament.sharedLayerValues || [])],
        sharedLayerCount: tournament.sharedLayerCount || tournament.sharedLayerValues?.length || 0,
        selectedRoundIndices: [...(tournament.selectedRoundIndices || [])],
        selectedRoundIds: [...(tournament.selectedRoundIds || [])],
        deterministicSeeds: tournament.deterministicSeeds
            ? {
                ...tournament.deterministicSeeds,
                matchSeeds: (tournament.deterministicSeeds.matchSeeds || []).map((entry) => ({ ...entry })),
            }
            : null,
        status: tournament.status,
        currentRoundIndex: tournament.currentRoundIndex,
        currentRoundLabel: tournament.currentRoundLabel,
        currentMatchId: tournament.currentMatchId,
        selectedMatchId: tournament.selectedMatchId || tournament.activeMatchId || tournament.currentMatchId || null,
        activeMatchId: tournament.activeMatchId,
        lastCompletedMatchId: tournament.lastCompletedMatchId,
        completedMatchCount: tournament.completedMatchCount,
        advancingOrbId: tournament.advancingOrbId,
        eliminatedOrbId: tournament.eliminatedOrbId,
        championId: tournament.championId,
        championOrbId: tournament.championOrbId,
        clock: tournament.clock,
        results: (tournament.results || []).map((result) => ({ ...result })),
        currentMatch: currentMatch ? snapshotMatch(currentMatch) : null,
        rounds: tournament.rounds.map((round) => ({
            index: round.index,
            label: round.label,
            roundSize: round.roundSize,
            status: round.status,
            activeMatchId: round.activeMatchId,
            matchIds: round.matches.map((match) => match.id),
            completedMatchIds: round.matches
                .filter((match) => match.status === "completed")
                .map((match) => match.id),
            recordingSegmentId: round.recordingSegmentId,
        })),
        presentation: tournament.presentation ? {
            phase: tournament.presentation.phase,
            matchId: tournament.presentation.matchId,
            currentMatchId: tournament.presentation.currentMatchId || tournament.presentation.matchId || null,
            selectedMatchId: tournament.presentation.selectedMatchId || tournament.selectedMatchId || null,
            activeMatchId: tournament.presentation.activeMatchId || tournament.activeMatchId || null,
            roundIndex: tournament.presentation.roundIndex ?? null,
            matchIndex: tournament.presentation.matchIndex ?? null,
            roundLabel: tournament.presentation.roundLabel || null,
            fromMatchId: tournament.presentation.fromMatchId || null,
            toMatchId: tournament.presentation.toMatchId || null,
            introMode: tournament.presentation.introMode || "full-intro",
            cameraTransition: tournament.presentation.cameraTransition
                ? { ...tournament.presentation.cameraTransition }
                : null,
            transition: tournament.presentation.transition
                ? { ...tournament.presentation.transition }
                : null,
            transitionProgress: tournament.presentation.transitionProgress || 0,
            cameraPanProgress: tournament.presentation.cameraPanProgress || 0,
            matchupHoldProgress: tournament.presentation.matchupHoldProgress || 0,
            matchupHold: tournament.presentation.matchupHold
                ? { ...tournament.presentation.matchupHold }
                : null,
            cameraPan: tournament.presentation.cameraPan
                ? { ...tournament.presentation.cameraPan }
                : null,
            holdStartAt: tournament.presentation.holdStartAt ?? null,
            holdEndAt: tournament.presentation.holdEndAt ?? null,
            battleAt: tournament.presentation.battleAt ?? null,
            timestamps: cloneJson(tournament.presentation.timestamps || {}),
            conclusion: tournament.presentation.conclusion
                ? { ...tournament.presentation.conclusion }
                : null,
            dustOutProgress: tournament.presentation.dustOutProgress || 0,
            winnerFadeInProgress: tournament.presentation.winnerFadeInProgress || 0,
        } : null,
        presentationTimestamps: tournament.presentationTimestamps
            ? { ...tournament.presentationTimestamps }
            : null,
        presentationHold: tournament.presentationHold
            ? {
                ...tournament.presentationHold,
                timestamps: { ...(tournament.presentationHold.timestamps || {}) },
            }
            : null,
        recordingPreparation: tournament.recordingPreparation
            ? { ...tournament.recordingPreparation }
            : null,
        recording: {
            scope: tournament.recording.scope,
            segmentScope: tournament.recording.segmentScope || tournament.recording.scope,
            selection: tournament.recording.selection || tournament.recordingSelection || "match",
            format: tournament.recording.format || tournament.recordingFormat || "short-portrait",
            dimensions: tournament.recording.dimensions
                ? { ...tournament.recording.dimensions }
                : { width: 1080, height: 1920 },
            layerCount: tournament.recording.layerCount || tournament.sharedLayerValues?.length || 0,
            layerValues: [...(tournament.recording.layerValues || tournament.sharedLayerValues || [])],
            selectedRoundIndices: [...(tournament.recording.selectedRoundIndices || tournament.selectedRoundIndices || [])],
            selectedRoundIds: [...(tournament.recording.selectedRoundIds || tournament.selectedRoundIds || [])],
            longFormIntroMatchId: tournament.recording.longFormIntroMatchId || null,
            lastIncludedMatchId: tournament.recording.lastIncludedMatchId || null,
            includedMatchIds: [...(tournament.recording.includedMatchIds || [])],
            cameraPanCount: Number(tournament.recording.cameraPanCount) || 0,
            activeSegmentId: tournament.recording.activeSegmentId,
            queue: (tournament.recording.queue || []).map((entry) => ({
                ...entry,
                dimensions: entry.dimensions ? { ...entry.dimensions } : entry.dimensions,
                layerValues: [...(entry.layerValues || [])],
                matchIds: [...(entry.matchIds || [])],
                matchTimelines: cloneJson(entry.matchTimelines || []),
            })),
            segmentBoundaries: (tournament.recording.segmentBoundaries || tournament.recordingSegmentBoundaries || [])
                .map((boundary) => ({ ...boundary })),
            segments: tournament.recording.segments.map((segment) => cloneJson(segment)),
        },
        recordingQueue: (tournament.recordingQueue || tournament.recording.queue || []).map((entry) => ({
            ...entry,
            dimensions: entry.dimensions ? { ...entry.dimensions } : entry.dimensions,
            layerValues: [...(entry.layerValues || [])],
            matchIds: [...(entry.matchIds || [])],
            matchTimelines: cloneJson(entry.matchTimelines || []),
        })),
        recordingSegmentBoundaries: [...(tournament.recordingSegmentBoundaries || [])].map((boundary) => ({ ...boundary })),
    };
}

export const captureOrbRaceTournamentSnapshot = snapshotOrbRaceTournament;

export function validateOrbRaceTournamentState(input) {
    let payload = input;
    if (typeof payload === "string") {
        try {
            payload = JSON.parse(payload);
        } catch {
            return { valid: false, message: "Orb Race tournament save is not valid JSON." };
        }
    }
    const state = payload?.tournament || payload?.state || payload;
    if (!state || typeof state !== "object") {
        return { valid: false, message: "Orb Race tournament save is missing state." };
    }
    if (state.version !== ORB_RACE_TOURNAMENT_STATE_VERSION) {
        return { valid: false, message: "Orb Race tournament save version is unsupported." };
    }
    if (state.mode !== "orb-race-tournament") {
        return { valid: false, message: "Saved state is not an Orb Race tournament." };
    }
    if (!isOrbRaceTournamentSize(state.size)) {
        return { valid: false, message: "Saved tournament bracket size is unsupported." };
    }
    if (!Array.isArray(state.entrants) || state.entrants.length !== Number(state.size)) {
        return { valid: false, message: "Saved tournament entrant count does not match its bracket." };
    }
    if (!Array.isArray(state.rounds) || state.rounds.length !== Math.log2(Number(state.size))) {
        return { valid: false, message: "Saved tournament rounds are incomplete." };
    }
    if (!Array.isArray(state.seedOrder) || state.seedOrder.length !== Number(state.size)) {
        return { valid: false, message: "Saved tournament seed order is incomplete." };
    }
    if (!ORB_RACE_TOURNAMENT_RECORDING_SCOPES.includes(state.recordingScope)
        && state.recordingScope !== ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE) {
        return { valid: false, message: "Saved tournament recording scope is unsupported." };
    }
    if (!ORB_RACE_TOURNAMENT_RECORDING_SELECTIONS.includes(state.recordingSelection)) {
        return { valid: false, message: "Saved tournament recording selection is unsupported." };
    }
    if (!Array.isArray(state.sharedLayerValues) || ![3, 5].includes(state.sharedLayerValues.length)) {
        return { valid: false, message: "Saved tournament shared layers must contain three or five values." };
    }
    if (!state.recording || !Array.isArray(state.recording.segments) || !Array.isArray(state.recording.queue)) {
        return { valid: false, message: "Saved tournament recording plan is incomplete." };
    }
    return { valid: true, message: "", version: state.version, state };
}

export function serializeOrbRaceTournament(tournament) {
    const validation = validateOrbRaceTournamentState(tournament);
    if (!validation.valid) throw new Error(validation.message);
    return JSON.stringify({
        type: "orb-race-tournament-state",
        version: ORB_RACE_TOURNAMENT_STATE_VERSION,
        tournament: cloneJson(validation.state),
    });
}

export function deserializeOrbRaceTournament(input) {
    const validation = validateOrbRaceTournamentState(input);
    if (!validation.valid) return null;
    const state = cloneJson(validation.state);
    if (state.recordingScope === ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE) {
        state.recordingScope = "each-match";
    }
    state.presentationTiming = normalizeOrbRaceTournamentPresentationTiming(
        state.presentationTiming,
        { reducedMotion: state.presentationTiming?.reducedMotion === true },
    );
    state.recording = state.recording || {};
    state.recording.segments = Array.isArray(state.recording.segments)
        ? state.recording.segments
        : [];
    for (const segment of state.recording.segments) {
        segment.matchIds = Array.isArray(segment.matchIds) ? segment.matchIds : [];
        segment.matchTimelines = Array.isArray(segment.matchTimelines) ? segment.matchTimelines : [];
    }
    state.results = Array.isArray(state.results)
        ? state.results.map((result) => ({ ...result }))
        : state.rounds.flatMap((round) => round.matches
            .filter((match) => match.status === "completed" && match.winnerId)
            .map((match) => ({
                matchId: match.id,
                roundIndex: match.roundIndex,
                roundLabel: match.roundLabel,
                advancingEntrantId: match.winnerId,
                advancingOrbId: match.winnerOrbId || null,
                eliminatedEntrantId: match.eliminatedId || null,
                eliminatedOrbId: match.eliminatedOrbId || null,
                resultAt: match.completedAt,
                conclusionAt: match.presentation?.conclusionAt ?? match.completedAt,
                conclusionEndAt: match.presentation?.conclusionEndAt ?? match.completedAt,
                advancementAt: match.presentation?.advancementAt ?? match.completedAt,
                nextMatchAt: match.presentation?.nextMatchAt ?? null,
                destinationNodeId: match.presentation?.destinationNodeId || match.targetNodeId || null,
                destinationLabel: match.presentation?.destinationLabel || ORB_RACE_TOURNAMENT_UNKNOWN_LABEL,
            })));
    state.recordingSegmentScope = state.recordingSegmentScope
        || state.recording?.segmentScope
        || (state.recordingScope === "each-match" ? "each-match" : "whole-round");
    state.recording.scope = state.recording.scope || state.recordingScope;
    state.recording.segmentScope = state.recording.segmentScope || state.recordingSegmentScope;
    state.recordingQueue = state.recordingQueue || state.recording.queue || [];
    state.recording.includedMatchIds = Array.isArray(state.recording.includedMatchIds)
        ? [...new Set(state.recording.includedMatchIds)]
        : [...new Set(state.recording.segments.flatMap((segment) => segment.matchIds || []))];
    state.recording.longFormIntroMatchId = state.recording.longFormIntroMatchId
        || state.recording.includedMatchIds[0]
        || null;
    state.recording.lastIncludedMatchId = state.recording.lastIncludedMatchId
        || state.recording.includedMatchIds.at(-1)
        || null;
    state.recording.cameraPanCount = Number(state.recording.cameraPanCount)
        || state.recording.segments.reduce(
            (count, segment) => count + (segment.matchTimelines || [])
                .filter((timeline) => timeline.introMode === "camera-pan").length,
            0,
        );
    state.recordingSegmentBoundaries = state.recordingSegmentBoundaries
        || state.recording.segmentBoundaries
        || state.recording.segments.map((segment) => ({
            id: segment.id,
            scope: segment.scope,
            roundIndex: segment.roundIndex,
            matchId: segment.matchId,
            matchIds: [...(segment.matchIds || [])],
            matchTimelines: cloneJson(segment.matchTimelines || []),
            introMode: segment.introMode || "full-intro",
            introDuration: segment.introDuration ?? null,
            cameraTransition: segment.cameraTransition
                ? { ...segment.cameraTransition }
                : null,
            startAt: segment.startAt,
            endAt: segment.endAt,
            status: segment.status,
        }));
    state.selectedMatchId = state.selectedMatchId
        || state.activeMatchId
        || state.currentMatchId
        || state.presentation?.matchId
        || null;
    for (const round of state.rounds || []) {
        for (const match of round.matches || []) {
            if (!match.presentation) continue;
            match.presentation.matchId = match.presentation.matchId || match.id;
            match.presentation.roundIndex = match.presentation.roundIndex ?? match.roundIndex;
            match.presentation.matchLabel = match.presentation.matchLabel || match.roundLabel;
            match.presentation.matchIndex = match.presentation.matchIndex ?? match.matchIndex;
            match.presentation.fromMatchId = match.presentation.fromMatchId
                || match.presentation.transitionFromMatchId
                || null;
            match.presentation.toMatchId = match.presentation.toMatchId
                || match.presentation.transitionToMatchId
                || match.id;
        }
    }
    if (state.presentationHold) {
        state.presentationHold.fromMatchId = state.presentationHold.fromMatchId
            || state.presentationHold.matchId
            || null;
        state.presentationHold.toMatchId = state.presentationHold.toMatchId
            || state.presentationHold.nextMatchId
            || null;
        const from = findMatch(state, state.presentationHold.fromMatchId);
        const to = findMatch(state, state.presentationHold.toMatchId);
        state.presentationHold.fromRoundIndex = state.presentationHold.fromRoundIndex
            ?? from?.roundIndex
            ?? null;
        state.presentationHold.fromMatchIndex = state.presentationHold.fromMatchIndex
            ?? from?.matchIndex
            ?? null;
        state.presentationHold.toRoundIndex = state.presentationHold.toRoundIndex
            ?? to?.roundIndex
            ?? null;
        state.presentationHold.toMatchIndex = state.presentationHold.toMatchIndex
            ?? to?.matchIndex
            ?? null;
    }
    relinkTournamentBracketNodes(state);
    syncTournamentBracket(state);
    const active = currentOrbRaceTournamentMatch(state);
    if (!state.presentation && active?.presentation) {
        state.presentation = createTournamentPresentationState(
            "intro-bracket",
            active.id,
            active.presentation,
            { match: active, tournament: state, time: state.clock },
        );
    } else if (state.presentation) {
        const focused = findMatch(state, state.presentation.matchId)
            || active
            || findMatch(state, state.currentMatchId);
        const timestamps = state.presentation.timestamps || state.presentationTimestamps || focused?.presentation || {};
        const transition = timestamps.cameraTransition || timestamps.nextMatchTransition || null;
        state.presentation.currentMatchId = state.presentation.currentMatchId
            || state.presentation.matchId
            || focused?.id
            || null;
        state.presentation.selectedMatchId = state.presentation.selectedMatchId
            || state.selectedMatchId
            || state.presentation.currentMatchId
            || null;
        state.presentation.activeMatchId = state.presentation.activeMatchId
            || state.activeMatchId
            || null;
        state.presentation.roundIndex = state.presentation.roundIndex
            ?? focused?.roundIndex
            ?? null;
        state.presentation.matchIndex = state.presentation.matchIndex
            ?? focused?.matchIndex
            ?? null;
        state.presentation.roundLabel = state.presentation.roundLabel
            || focused?.roundLabel
            || null;
        state.presentation.fromMatchId = state.presentation.fromMatchId
            || transition?.fromMatchId
            || timestamps.transitionFromMatchId
            || null;
        state.presentation.toMatchId = state.presentation.toMatchId
            || transition?.toMatchId
            || timestamps.transitionToMatchId
            || focused?.id
            || null;
    }
    return state;
}

export const restoreOrbRaceTournament = deserializeOrbRaceTournament;

export function cloneOrbRaceTournament(tournament) {
    if (typeof tournament === "string" || tournament?.tournament || tournament?.state) {
        return deserializeOrbRaceTournament(tournament);
    }
    return deserializeOrbRaceTournament(serializeOrbRaceTournament(tournament));
}

/**
 * Prepare a recording-only clone for one concrete first-round matchup.
 *
 * The authoritative bracket is never mutated. The returned live tournament
 * state keeps every completed result, demotes a different incomplete active
 * match back to pending, and opens the requested matchup with a fresh
 * deterministic intro timeline. This is the state seam used by
 * "Record This Matchup" before passing `raceTournamentState` to simulation.
 *
 * Contract:
 * - `matchId` must identify a pending/active first-round match with two known
 *   entrant IDs; completed, later-round, unknown, and missing matches return
 *   null.
 * - `recordingSelection` is `match`, `recordingScope` and `segmentScope` are
 *   `each-match`, format is `short-portrait` (1080x1920), and exactly three
 *   shared layer values are installed. Existing three-layer values are kept;
 *   otherwise a deterministic preset is built for the source final target.
 * - `recording.segments` is rebuilt to the selected matchup and its segment
 *   is opened at t=0. `presentation` and the selected match timestamps are
 *   also restarted at t=0 (`battleAt` is 1s motion + 1.75s hold).
 */
export function prepareOrbRaceTournamentMatchForRecording(tournament, matchId, options = {}) {
    const source = tournament?.mode === "orb-race-tournament"
        ? tournament
        : tournament?.tournament?.mode === "orb-race-tournament"
            ? tournament.tournament
            : tournament?.state?.mode === "orb-race-tournament"
                ? tournament.state
                : tournament;
    const prepared = source ? cloneOrbRaceTournament(source) : null;
    if (!prepared) return null;
    const requestedMatchId = typeof matchId === "object" && matchId !== null
        ? matchId.matchId || matchId.matchupId || matchId.id
        : matchId;
    if (!requestedMatchId) return null;
    const match = findMatch(prepared, requestedMatchId);
    if (!match
        || match.roundIndex !== 0
        || match.status === "completed"
        || !match.left?.entrantId
        || !match.right?.entrantId) {
        return null;
    }

    const previousActiveMatchId = prepared.activeMatchId || prepared.currentMatchId || null;
    let restoredPreviousActiveMatchId = null;
    for (const round of prepared.rounds) {
        for (const candidate of round.matches) {
            if (candidate.id === match.id) continue;
            if (candidate.status === "active") {
                candidate.status = "pending";
                candidate.presentation = null;
                candidate.recordingSegmentId = null;
                restoredPreviousActiveMatchId = candidate.id;
            }
            if (candidate.id !== match.id) candidate.recordingSegmentId = null;
        }
        round.recordingSegmentId = null;
        round.activeMatchId = null;
    }

    const rawOptions = options && typeof options === "object" ? options : {};
    const sourceLayers = Array.isArray(rawOptions.sharedLayerValues)
        ? rawOptions.sharedLayerValues
        : prepared.sharedLayerValues;
    const finalLayerHealth = rawOptions.finalLayerHealth
        ?? prepared.matchSettings?.finalLayerHealth
        ?? sourceLayers?.at(-1)
        ?? 110;
    const sharedLayerValues = sourceLayers?.length === 3
        ? normalizeRaceLayers(sourceLayers, undefined, 3)
        : buildOrbRaceTournamentLayerPreset(3, finalLayerHealth);
    const format = ORB_RACE_TOURNAMENT_RECORDING_FORMATS.match;
    const selectedRoundIndices = [0];
    const selectedRoundIds = ["round-1"];
    const recordingQueue = buildSingleMatchRecordingQueue(
        prepared.rounds,
        match.id,
        format,
        sharedLayerValues,
    );

    prepared.recordingScope = "each-match";
    prepared.recordingSegmentScope = "each-match";
    prepared.recordingScopeLegacy = ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE;
    prepared.recordingSelection = "match";
    prepared.recordingFormat = format.id;
    prepared.recordingLayerCount = 3;
    prepared.recordingDimensions = { width: format.width, height: format.height };
    prepared.sharedLayerValues = [...sharedLayerValues];
    prepared.sharedLayerCount = 3;
    prepared.selectedRoundIndices = selectedRoundIndices;
    prepared.selectedRoundIds = selectedRoundIds;
    prepared.matchSettings = {
        ...(prepared.matchSettings || {}),
        layerCount: 3,
        layerStrengths: [...sharedLayerValues],
        finalLayerHealth: sharedLayerValues.at(-1),
    };
    prepared.recordingQueue = recordingQueue;
    prepared.recording = {
        ...(prepared.recording || {}),
        scope: "each-match",
        segmentScope: "each-match",
        selection: "match",
        format: format.id,
        dimensions: { width: format.width, height: format.height },
        layerCount: 3,
        layerValues: [...sharedLayerValues],
        selectedRoundIndices: [...selectedRoundIndices],
        selectedRoundIds: [...selectedRoundIds],
        activeSegmentId: null,
        queue: recordingQueue,
        segmentBoundaries: [],
        segments: [],
    };
    prepared.recordingSegmentBoundaries = [];
    prepared.recordingPreparation = {
        recordingOnly: true,
        matchId: match.id,
        previousActiveMatchId,
        restoredPreviousActiveMatchId,
    };

    prepared.status = "active";
    prepared.clock = 0;
    prepared.startedAt = 0;
    prepared.completedAt = null;
    prepared.currentRoundIndex = 0;
    prepared.currentRoundLabel = prepared.rounds[0]?.label || match.roundLabel;
    prepared.currentMatchId = null;
    prepared.activeMatchId = null;
    prepared.currentMatch = null;
    prepared.presentation = null;
    prepared.presentationTimestamps = null;
    prepared.presentationHold = null;
    match.status = "pending";
    syncTournamentBracket(prepared);
    const selectedMatch = findMatch(prepared, match.id);
    activateMatch(prepared, selectedMatch, 0);
    syncTournamentBracket(prepared);
    return prepared;
}

export const prepareOrbRaceTournamentMatchRecording = prepareOrbRaceTournamentMatchForRecording;
export const openOrbRaceTournamentMatchRecording = prepareOrbRaceTournamentMatchForRecording;
export const cloneOrbRaceTournamentForMatchRecording = prepareOrbRaceTournamentMatchForRecording;

export function viewOrbRaceTournamentMatch(tournament, matchId = currentOrbRaceTournamentMatch(tournament)?.id) {
    if (!tournament || !matchId) return null;
    const match = findMatch(tournament, matchId);
    if (!match) return null;
    const format = ORB_RACE_TOURNAMENT_RECORDING_FORMATS.match;
    return {
        version: ORB_RACE_TOURNAMENT_STATE_VERSION,
        readOnly: true,
        tournamentId: tournament.tournamentId,
        matchId: match.id,
        match: snapshotMatch(match),
        recording: {
            scope: "each-match",
            selection: "match",
            format: format.id,
            dimensions: { width: format.width, height: format.height },
            layerValues: [...(tournament.sharedLayerValues?.length === 3
                ? tournament.sharedLayerValues
                : buildOrbRaceTournamentLayerPreset(
                    3,
                    tournament.matchSettings?.finalLayerHealth ?? 110,
                ))],
        },
    };
}

export const getOrbRaceTournamentMatchView = viewOrbRaceTournamentMatch;
export const selectOrbRaceTournamentMatch = viewOrbRaceTournamentMatch;
export const openOrbRaceTournamentMatch = viewOrbRaceTournamentMatch;

/**
 * Build a read-only recording preview request. This is intentionally pure:
 * opening a completed or pending matchup never changes authoritative bracket
 * advancement, timestamps, or recording segments.
 */
export function createOrbRaceTournamentPreviewSelection(input = {}, tournament = null) {
    const raw = typeof input === "string" ? { selection: input } : input && typeof input === "object" ? input : {};
    const source = tournament || raw.tournament || raw.state || null;
    const selection = normalizeOrbRaceTournamentPreviewSelection(raw);
    const matchId = raw.matchId || raw.matchupId || raw.match?.id
        || currentOrbRaceTournamentMatch(source)?.id
        || null;
    const match = source && matchId ? findMatch(source, matchId) : null;
    const roundCount = Number(source?.rounds?.length) || Math.max(1, Math.log2(Number(source?.size) || DEFAULT_TOURNAMENT_SIZE));
    const requestedRound = raw.roundIndex ?? raw.round ?? raw.roundId;
    const roundIndex = normalizePreviewRoundIndex(requestedRound, source, selection);
    const recordingLayerCount = selection === "match"
        ? 3
        : normalizeTournamentLongformLayerCount(
            raw.landscapeLayerCount ?? raw.layerCount ?? source?.recordingLayerCount,
            5,
        );
    const format = ORB_RACE_TOURNAMENT_RECORDING_FORMATS[selection];
    const explicitLayers = Array.isArray(raw.sharedLayerValues)
        ? raw.sharedLayerValues
        : Array.isArray(raw.layerValues) ? raw.layerValues : null;
    const previewTarget = normalizeLayerTarget(
        raw.finalLayerHealth
            ?? raw.sharedLayerTarget
            ?? source?.matchSettings?.finalLayerHealth
            ?? (selection === "match" ? 110 : ORB_RACE_LONGFORM_DEFAULT_TARGET),
    );
    const previewPreset = buildOrbRaceTournamentLayerPreset(recordingLayerCount, previewTarget);
    const sharedLayerValues = selection === "match"
        ? normalizeRaceLayers(
            explicitLayers?.length === 3
                ? explicitLayers
                : source?.sharedLayerValues?.length === 3 ? source.sharedLayerValues : null,
            previewPreset,
            3,
        )
        : explicitLayers?.length === recordingLayerCount
            ? normalizeRaceLayers(
                explicitLayers,
                previewPreset,
                recordingLayerCount,
            )
            : source?.sharedLayerValues?.length === recordingLayerCount
                ? [...source.sharedLayerValues]
                : previewPreset;
    const validMatch = selection !== "match" || !source || Boolean(match);
    const validRound = selection === "match" || !source || (
        Number.isInteger(roundIndex) && roundIndex >= 0 && roundIndex < roundCount
    );
    const valid = validMatch && validRound;
    const roundId = Number.isInteger(roundIndex) ? `round-${roundIndex + 1}` : null;
    return {
        version: ORB_RACE_TOURNAMENT_STATE_VERSION,
        previewOnly: true,
        readOnly: true,
        mutatesTournament: false,
        valid,
        message: valid
            ? ""
            : selection === "match" ? `Unknown tournament matchup: ${matchId || ORB_RACE_TOURNAMENT_UNKNOWN_LABEL}`
                : `Unknown tournament round: ${roundId || ORB_RACE_TOURNAMENT_UNKNOWN_LABEL}`,
        tournamentId: source?.tournamentId || null,
        selection,
        recordingSelection: selection,
        recordingScope: selection === "match"
            ? "each-match"
            : selection === "whole-tournament" ? "whole-tournament" : "whole-round",
        recordingSegmentScope: selection === "match" ? "each-match" : "whole-round",
        matchId: selection === "match" ? matchId : null,
        roundIndex: selection === "match" ? null : roundIndex,
        roundId: selection === "match" ? null : roundId,
        format: format.id,
        dimensions: { width: format.width, height: format.height },
        layerCount: recordingLayerCount,
        sharedLayerValues,
        layerValues: [...sharedLayerValues],
        match: selection === "match" && match ? snapshotMatch(match) : null,
        queueKey: selection === "match"
            ? matchId ? `${matchId}-recording` : null
            : selection === "whole-tournament" ? "tournament-recording" : `${roundId || "round-1"}-recording`,
    };
}

export const createOrbRaceTournamentPreviewRequest = createOrbRaceTournamentPreviewSelection;
export const previewOrbRaceTournamentRecording = createOrbRaceTournamentPreviewSelection;
export const getOrbRaceTournamentPreviewSelection = createOrbRaceTournamentPreviewSelection;

function buildBracket(size, entrants, seed, recordingScope) {
    const roundCount = Math.log2(size);
    const seedSlots = entrants.map((entrant, slot) => ({
        id: `seed-${slot + 1}`,
        nodeType: "seed",
        seedSlot: slot,
        seed: slot + 1,
        entrantId: entrant.id,
        orbId: entrant.orbId,
        side: entrant.side,
        sourceMatchId: null,
        targetMatchId: null,
        column: entrant.side === "left" ? 0 : roundCount - 1,
        label: orbRaceLabel(entrant.orbId),
        displayName: orbRaceLabel(entrant.orbId),
        name: orbRaceLabel(entrant.orbId),
        unknown: false,
    }));
    const rounds = [];
    const nodes = [...seedSlots];
    for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
        const matchCount = size / 2 ** (roundIndex + 1);
        const round = {
            index: roundIndex,
            label: orbRaceTournamentRoundLabel(size, roundIndex),
            roundSize: size / 2 ** roundIndex,
            status: "pending",
            activeMatchId: null,
            recordingSegmentId: null,
            matches: [],
        };
        for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
            const id = `round-${roundIndex + 1}-match-${matchIndex + 1}`;
            const final = roundIndex === roundCount - 1;
            const side = final
                ? "center"
                : matchIndex < matchCount / 2 ? "left" : "right";
            let sourceNodes;
            let sourceMatchIds = [];
            if (roundIndex === 0) {
                const slotPair = seedPairFor(size, matchIndex);
                sourceNodes = slotPair.map((slot) => seedSlots[slot]);
            } else if (final) {
                const previousMatches = rounds[roundIndex - 1].matches;
                sourceNodes = [
                    previousMatches[0].outputNode,
                    previousMatches[previousMatches.length - 1].outputNode,
                ];
                sourceMatchIds = sourceNodes.map((node) => node.sourceMatchId);
            } else {
                const previousMatches = rounds[roundIndex - 1].matches;
                const previousHalf = previousMatches.length / 2;
                const branchIndex = matchIndex < matchCount / 2
                    ? matchIndex
                    : matchIndex - matchCount / 2;
                const base = matchIndex < matchCount / 2
                    ? branchIndex * 2
                    : previousMatches.length - 2 - branchIndex * 2;
                sourceNodes = [previousMatches[base].outputNode, previousMatches[base + 1].outputNode];
                if (matchIndex >= matchCount / 2 && previousHalf === 0) sourceNodes.reverse();
                sourceMatchIds = sourceNodes.map((node) => node.sourceMatchId);
            }
            const outputNode = {
                id: `${id}-winner`,
                nodeType: "match",
                seedSlot: null,
                seed: null,
                entrantId: null,
                orbId: null,
                side,
                sourceMatchId: id,
                targetMatchId: null,
                column: side === "left" ? roundIndex + 1 : side === "right" ? roundCount - roundIndex : roundCount / 2,
                label: ORB_RACE_TOURNAMENT_UNKNOWN_LABEL,
                displayName: ORB_RACE_TOURNAMENT_UNKNOWN_LABEL,
                name: ORB_RACE_TOURNAMENT_UNKNOWN_LABEL,
                unknown: true,
            };
            nodes.push(outputNode);
            const match = {
                id,
                index: matchIndex,
                matchIndex,
                roundIndex,
                roundLabel: round.label,
                label: `${round.label} · MATCH ${matchIndex + 1}`,
                side,
                order: roundIndex * size + matchIndex,
                status: "pending",
                leftNode: sourceNodes[0],
                rightNode: sourceNodes[1],
                left: null,
                right: null,
                entrantIds: [null, null],
                sourceNodeIds: sourceNodes.map((node) => node.id),
                sourceMatchIds,
                targetNodeId: null,
                targetMatchId: null,
                outputNode,
                winnerId: null,
                winnerOrbId: null,
                eliminatedId: null,
                eliminatedOrbId: null,
                completedAt: null,
                seed: deriveOrbRaceTournamentMatchSeed(seed, roundIndex, matchIndex),
                recordingScope,
                recordingSegmentId: null,
                presentation: null,
                analytics: null,
                simStats: null,
            };
            round.matches.push(match);
        }
        rounds.push(round);
    }
    for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex += 1) {
        const currentMatches = rounds[roundIndex].matches;
        const nextMatches = rounds[roundIndex + 1].matches;
        for (const match of currentMatches) {
            const parent = nextMatches.find((candidate) => candidate.sourceMatchIds.includes(match.id));
            match.targetMatchId = parent?.id || null;
            match.targetNodeId = parent?.id || null;
            match.outputNode.targetMatchId = parent?.id || null;
        }
    }
    for (const slot of seedSlots) {
        const target = rounds[0].matches.find((match) => match.sourceNodeIds.includes(slot.id));
        slot.targetMatchId = target?.id || null;
    }
    return {
        rounds,
        nodes,
        seedSlots,
        leftSeedSlots: seedSlots.filter((slot) => slot.side === "left"),
        rightSeedSlots: seedSlots.filter((slot) => slot.side === "right"),
        finalMatchId: rounds.at(-1)?.matches[0]?.id || null,
    };
}

function buildRecordingQueue(rounds, normalized) {
    const includeRound = (roundIndex) => normalized.recordingSelection === "whole-tournament"
        || normalized.recordingSelection === "match"
        || normalized.selectedRoundIndices.includes(roundIndex);
    if (normalized.recordingScope === "each-match") {
        return rounds.flatMap((round) => round.matches.map((match) => ({
            id: `${match.id}-recording`,
            scope: "each-match",
            legacyScope: ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE,
            selection: normalized.recordingSelection,
            included: includeRound(round.index),
            roundIndex: round.index,
            roundId: `round-${round.index + 1}`,
            roundLabel: round.label,
            matchId: match.id,
            matchTimelines: [],
            format: normalized.recordingFormat,
            dimensions: { ...normalized.recordingDimensions },
            layerValues: [...normalized.sharedLayerValues],
            startAt: null,
            endAt: null,
            status: "pending",
        })));
    }
    if (normalized.recordingScope === "whole-tournament") {
        return [{
            id: `tournament-${normalized.size}-recording`,
            scope: "whole-tournament",
            selection: normalized.recordingSelection,
            included: true,
            roundIndex: null,
            roundId: null,
            roundLabel: "WHOLE TOURNAMENT",
            matchId: null,
            matchIds: [],
            matchTimelines: [],
            format: normalized.recordingFormat,
            dimensions: { ...normalized.recordingDimensions },
            layerValues: [...normalized.sharedLayerValues],
            startAt: null,
            endAt: null,
            status: "pending",
        }];
    }
    return rounds.map((round) => ({
        id: `round-${round.index + 1}-recording`,
        scope: "whole-round",
        selection: normalized.recordingSelection,
        included: includeRound(round.index),
        roundIndex: round.index,
        roundId: `round-${round.index + 1}`,
        roundLabel: round.label,
        matchId: null,
        matchIds: [],
        matchTimelines: [],
        format: normalized.recordingFormat,
        dimensions: { ...normalized.recordingDimensions },
        layerValues: [...normalized.sharedLayerValues],
        startAt: null,
        endAt: null,
        status: "pending",
    }));
}

function buildSingleMatchRecordingQueue(rounds, selectedMatchId, format, layerValues) {
    return rounds.flatMap((round) => round.matches.map((match) => ({
        id: `${match.id}-recording`,
        scope: "each-match",
        legacyScope: ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE,
        selection: "match",
        included: match.id === selectedMatchId,
        roundIndex: round.index,
        roundId: `round-${round.index + 1}`,
        roundLabel: round.label,
        matchId: match.id,
        matchIds: [match.id],
        matchTimelines: [],
        format: format.id,
        dimensions: { width: format.width, height: format.height },
        layerValues: [...layerValues],
        startAt: null,
        endAt: null,
        status: "pending",
    })));
}

function seedPairFor(size, matchIndex) {
    const halfMatchCount = size / 4;
    if (matchIndex < halfMatchCount) {
        const start = matchIndex * 2;
        return [start, start + 1];
    }
    const rightIndex = matchIndex - halfMatchCount;
    return [size - 1 - rightIndex * 2, size - 2 - rightIndex * 2];
}

function syncTournamentBracket(tournament) {
    for (const round of tournament.rounds) {
        for (const match of round.matches) {
            match.left = nodeSnapshot(match.leftNode, tournament);
            match.right = nodeSnapshot(match.rightNode, tournament);
            match.entrantIds = [match.left.entrantId, match.right.entrantId];
            match.outputNode.entrantId = match.winnerId || null;
            const winner = findEntrant(tournament, match.winnerId);
            match.outputNode.orbId = winner?.orbId || null;
            match.outputNode.side = match.side;
            const outputLabel = orbRaceLabel(match.outputNode.orbId);
            match.outputNode.label = outputLabel;
            match.outputNode.name = outputLabel;
            match.outputNode.displayName = outputLabel;
            match.outputNode.unknown = !match.outputNode.orbId;
            match.outputNode.card = {
                id: match.outputNode.id,
                nodeType: "bracket-card",
                label: outputLabel,
                displayName: outputLabel,
                orbId: match.outputNode.orbId,
                entrantId: match.outputNode.entrantId,
                unknown: !match.outputNode.orbId,
            };
        }
    }
    const active = findMatch(tournament, tournament.activeMatchId);
    const current = active || (tournament.status === "completed"
        ? findMatch(tournament, tournament.currentMatchId)
        : null);
    tournament.currentMatch = current ? snapshotMatch(current) : null;
    tournament.pendingMatchIds = tournament.rounds
        .flatMap((round) => round.matches)
        .filter((match) => match.status !== "completed" && match.id !== active?.id)
        .map((match) => match.id);
    for (const round of tournament.rounds) {
        if (round.matches.every((match) => match.status === "completed")) round.status = "completed";
        else if (round.matches.some((match) => match.status === "active")) round.status = "active";
        else if (round.matches.some((match) => match.entrantIds.every(Boolean))) round.status = "pending";
        else round.status = "pending";
        round.activeMatchId = round.matches.find((match) => match.status === "active")?.id || null;
    }
}

// JSON persistence duplicates the object references that connect a completed
// match's winner node to the next matchup. Restore those references to the
// canonical `nodes` entries before syncing winners, otherwise a hydrated
// bracket can leave the next-round source card stuck at `???`.
function relinkTournamentBracketNodes(tournament) {
    const nodeById = new Map((tournament.nodes || []).map((node) => [node.id, node]));
    for (const round of tournament.rounds || []) {
        for (const match of round.matches || []) {
            const leftId = match.leftNode?.id || match.sourceNodeIds?.[0];
            const rightId = match.rightNode?.id || match.sourceNodeIds?.[1];
            const outputId = match.outputNode?.id || `${match.id}-winner`;
            match.leftNode = nodeById.get(leftId) || match.leftNode;
            match.rightNode = nodeById.get(rightId) || match.rightNode;
            match.outputNode = nodeById.get(outputId) || match.outputNode;
        }
    }
    tournament.seedSlots = (tournament.seedSlots || []).map((node) => nodeById.get(node.id) || node);
    tournament.leftSeedSlots = (tournament.leftSeedSlots || []).map((node) => nodeById.get(node.id) || node);
    tournament.rightSeedSlots = (tournament.rightSeedSlots || []).map((node) => nodeById.get(node.id) || node);
}

function activateMatch(tournament, match, startAt, {
    previousMatch = null,
    introMode = null,
} = {}) {
    if (!match) return;
    match.status = "active";
    const round = tournament.rounds[match.roundIndex];
    if (round) {
        round.status = "active";
        round.activeMatchId = match.id;
    }
    tournament.status = "active";
    tournament.currentRoundIndex = match.roundIndex;
    tournament.currentRoundLabel = match.roundLabel;
    tournament.currentMatchId = match.id;
    tournament.selectedMatchId = match.id;
    tournament.activeMatchId = match.id;
    const resolvedIntroMode = introMode
        || (shouldUseLongFormCameraPan(tournament, previousMatch, match) ? "camera-pan" : "full-intro");
    match.presentation = createPresentationTimestamps(
        startAt,
        tournament.presentationTiming || PRESENTATION_DURATIONS,
        {
            introMode: resolvedIntroMode,
            fromMatchId: previousMatch?.id || null,
            toMatchId: match.id,
        },
    );
    match.presentation.matchId = match.id;
    match.presentation.roundIndex = match.roundIndex;
    match.presentation.matchLabel = match.roundLabel;
    match.presentation.matchIndex = match.matchIndex;
    match.presentation.fromMatchId = match.presentation.transitionFromMatchId;
    match.presentation.toMatchId = match.presentation.transitionToMatchId || match.id;
    const initialPhase = Number(tournament.clock) >= Number(startAt)
        ? resolvedIntroMode === "camera-pan" ? "camera-pan" : "bracket-zoom"
        : "intro-bracket";
    tournament.presentation = createTournamentPresentationState(
        initialPhase,
        match.id,
        match.presentation,
        { match, tournament, time: tournament.clock },
    );
    tournament.presentationTimestamps = { ...match.presentation };
    openMatchRecordingSegment(tournament, match, startAt);
    tournament.currentMatch = snapshotMatch(match);
}

function isLongFormTournamentRecording(tournament) {
    if (!tournament) return false;
    return tournament.recordingScope !== "each-match"
        && (tournament.recordingFormat === "long-landscape"
            || tournament.recordingSelection === "selected-round"
            || tournament.recordingSelection === "whole-tournament");
}

function hasIncludedTournamentMatch(tournament, matchId) {
    if (!tournament || !matchId) return false;
    if (Array.isArray(tournament.recording?.includedMatchIds)
        && tournament.recording.includedMatchIds.includes(matchId)) return true;
    return (tournament.recording?.segments || []).some((segment) => (
        (segment.matchIds || []).includes(matchId)
    ));
}

function isMatchIncludedForLongFormRecording(tournament, match) {
    if (!isLongFormTournamentRecording(tournament) || !match) return false;
    if (tournament.recordingScope === "whole-tournament") return true;
    return isRoundRecordingSelected(tournament, match.roundIndex);
}

function shouldUseLongFormCameraPan(tournament, previousMatch, nextMatch) {
    return Boolean(
        isLongFormTournamentRecording(tournament)
        && previousMatch?.id
        && nextMatch?.id
        && isMatchIncludedForLongFormRecording(tournament, previousMatch)
        && isMatchIncludedForLongFormRecording(tournament, nextMatch)
        && hasIncludedTournamentMatch(tournament, previousMatch.id),
    );
}

function openMatchRecordingSegment(tournament, match, startAt) {
    if (tournament.recordingScope === "whole-tournament") {
        let segment = tournament.recording.segments.find((candidate) => candidate.scope === "whole-tournament");
        const isNewSegment = !segment;
        if (!segment) {
            segment = {
                id: `tournament-${tournament.size}-recording`,
                scope: "whole-tournament",
                selection: tournament.recordingSelection,
                included: true,
                roundIndex: null,
                roundId: null,
                roundLabel: "WHOLE TOURNAMENT",
                matchId: null,
                matchIds: [],
                matchTimelines: [],
                format: tournament.recordingFormat,
                dimensions: { ...tournament.recordingDimensions },
                layerValues: [...tournament.sharedLayerValues],
                startAt,
                endAt: null,
                status: "active",
            };
            tournament.recording.segments.push(segment);
        }
        appendMatchToRecordingSegment(segment, match, tournament);
        match.recordingSegmentId = segment.id;
        tournament.recording.activeSegmentId = segment.id;
        updateRecordingQueueEntry(tournament, segment.id, {
            ...(isNewSegment ? { startAt: segment.startAt } : {}),
            matchIds: [...segment.matchIds],
            matchTimelines: cloneJson(segment.matchTimelines || []),
            status: "active",
        });
        return;
    }
    if ((tournament.recordingSegmentScope || tournament.recording?.segmentScope
        || (tournament.recordingScope === "each-match" ? "each-match" : "whole-round")) === "whole-round") {
        const round = tournament.rounds[match.roundIndex];
        if (!isRoundRecordingSelected(tournament, match.roundIndex)) {
            match.recordingSegmentId = null;
            tournament.recording.activeSegmentId = null;
            return;
        }
        const isNewSegment = !round.recordingSegmentId;
        if (isNewSegment) {
            const segment = {
                id: `round-${match.roundIndex + 1}-recording`,
                scope: "whole-round",
                selection: tournament.recordingSelection,
                included: true,
                roundIndex: match.roundIndex,
                roundId: `round-${match.roundIndex + 1}`,
                roundLabel: match.roundLabel,
                matchId: null,
                matchIds: [],
                matchTimelines: [],
                format: tournament.recordingFormat,
                dimensions: { ...tournament.recordingDimensions },
                layerValues: [...tournament.sharedLayerValues],
                startAt,
                endAt: null,
                status: "active",
            };
            tournament.recording.segments.push(segment);
            round.recordingSegmentId = segment.id;
        }
        const segment = tournament.recording.segments.find((candidate) => candidate.id === round.recordingSegmentId);
        appendMatchToRecordingSegment(segment, match, tournament);
        match.recordingSegmentId = round.recordingSegmentId;
        tournament.recording.activeSegmentId = round.recordingSegmentId;
        updateRecordingQueueEntry(tournament, round.recordingSegmentId, {
            ...(isNewSegment ? { startAt: segment?.startAt } : {}),
            matchIds: [...(segment?.matchIds || [])],
            matchTimelines: cloneJson(segment?.matchTimelines || []),
            status: "active",
        });
        return;
    }
    const segment = {
        id: `${match.id}-recording`,
        scope: "each-match",
        legacyScope: ORB_RACE_TOURNAMENT_LEGACY_RECORDING_SCOPE,
        selection: tournament.recordingSelection,
        included: true,
        roundIndex: match.roundIndex,
        roundId: `round-${match.roundIndex + 1}`,
        roundLabel: match.roundLabel,
        matchId: match.id,
        matchIds: [],
        matchTimelines: [],
        format: tournament.recordingFormat,
        dimensions: { ...tournament.recordingDimensions },
        layerValues: [...tournament.sharedLayerValues],
        startAt,
        endAt: null,
        status: "active",
    };
    appendMatchToRecordingSegment(segment, match, tournament);
    tournament.recording.segments.push(segment);
    match.recordingSegmentId = segment.id;
    tournament.recording.activeSegmentId = segment.id;
    updateRecordingQueueEntry(tournament, segment.id, {
        startAt,
        matchIds: [...segment.matchIds],
        matchTimelines: cloneJson(segment.matchTimelines || []),
        introMode: segment.introMode,
        introDuration: segment.introDuration,
        cameraTransition: segment.cameraTransition ? { ...segment.cameraTransition } : null,
        status: "active",
    });
}

function recordingTimelineForMatch(match) {
    const timestamps = match?.presentation || {};
    const handoff = timestamps.nextMatchTransition || null;
    return {
        matchId: match?.id || null,
        roundIndex: Number(match?.roundIndex) || 0,
        matchIndex: Number(match?.matchIndex) || 0,
        fromMatchId: handoff?.fromMatchId
            || timestamps.fromMatchId
            || timestamps.transitionFromMatchId
            || null,
        toMatchId: handoff?.toMatchId
            || timestamps.toMatchId
            || timestamps.transitionToMatchId
            || match?.id
            || null,
        introMode: timestamps.introMode || "full-intro",
        introBracketAt: timestamps.introBracketAt ?? null,
        bracketZoomAt: timestamps.bracketZoomAt ?? null,
        zoomEndAt: timestamps.zoomEndAt ?? null,
        panEndAt: timestamps.panEndAt ?? null,
        holdStartAt: timestamps.holdStartAt ?? null,
        holdEndAt: timestamps.holdEndAt ?? null,
        battleAt: timestamps.battleAt ?? null,
        fullIntroDuration: timestamps.fullIntroDuration ?? null,
        transitionStartAt: timestamps.transitionStartAt ?? null,
        transitionEndAt: timestamps.transitionEndAt ?? null,
        transitionDuration: timestamps.transitionDuration ?? null,
        transitionFromMatchId: timestamps.transitionFromMatchId || null,
        transitionToMatchId: timestamps.transitionToMatchId || null,
        cameraTransition: timestamps.cameraTransition
            ? { ...timestamps.cameraTransition }
            : null,
    };
}

function appendMatchToRecordingSegment(segment, match, tournament = null) {
    if (!segment || !match?.id) return;
    segment.matchIds = Array.isArray(segment.matchIds) ? segment.matchIds : [];
    segment.matchTimelines = Array.isArray(segment.matchTimelines) ? segment.matchTimelines : [];
    const isNewMatch = !segment.matchIds.includes(match.id);
    if (isNewMatch) segment.matchIds.push(match.id);
    const timeline = recordingTimelineForMatch(match);
    const existingTimelineIndex = segment.matchTimelines.findIndex((entry) => entry.matchId === match.id);
    if (existingTimelineIndex === -1) segment.matchTimelines.push(timeline);
    else segment.matchTimelines[existingTimelineIndex] = timeline;
    if (isNewMatch && !segment.introMode) segment.introMode = timeline.introMode;
    if (isNewMatch && segment.introDuration == null) segment.introDuration = timeline.transitionDuration
        || timeline.fullIntroDuration;
    if (isNewMatch && !segment.cameraTransition) segment.cameraTransition = timeline.cameraTransition;
    segment.lastMatchId = match.id;
    segment.lastRoundIndex = Number(match.roundIndex) || 0;
    if (tournament?.recording) {
        tournament.recording.includedMatchIds = Array.isArray(tournament.recording.includedMatchIds)
            ? tournament.recording.includedMatchIds
            : [];
        if (isNewMatch && !tournament.recording.includedMatchIds.includes(match.id)) {
            tournament.recording.includedMatchIds.push(match.id);
        }
        tournament.recording.longFormIntroMatchId = tournament.recording.longFormIntroMatchId
            || match.id;
        tournament.recording.lastIncludedMatchId = match.id;
        if (isNewMatch && timeline.introMode === "camera-pan") {
            tournament.recording.cameraPanCount = (Number(tournament.recording.cameraPanCount) || 0) + 1;
        }
    }
}

function updateRecordingTimelineForMatch(tournament, match) {
    if (!tournament?.recording || !match?.id) return;
    const timeline = recordingTimelineForMatch(match);
    for (const segment of tournament.recording.segments || []) {
        const index = (segment.matchTimelines || []).findIndex((entry) => entry.matchId === match.id);
        if (index === -1) continue;
        segment.matchTimelines[index] = timeline;
        updateRecordingQueueEntry(tournament, segment.id, {
            matchTimelines: cloneJson(segment.matchTimelines),
        });
    }
}

function closeMatchRecordingSegment(tournament, match, endAt) {
    const segment = tournament.recording.segments.find((candidate) => candidate.id === match.recordingSegmentId);
    if (!segment || segment.scope !== "each-match") return;
    segment.endAt = endAt;
    segment.status = "completed";
    updateRecordingQueueEntry(tournament, segment.id, {
        endAt,
        matchTimelines: cloneJson(segment.matchTimelines || []),
        status: "completed",
    });
    if (tournament.recording.activeSegmentId === segment.id) tournament.recording.activeSegmentId = null;
}

function closeRoundRecordingSegment(tournament, round, endAt) {
    if (!round.recordingSegmentId) return;
    const segment = tournament.recording.segments.find((candidate) => candidate.id === round.recordingSegmentId);
    if (!segment || segment.scope !== "whole-round") return;
    segment.endAt = endAt;
    segment.status = "completed";
    updateRecordingQueueEntry(tournament, segment.id, {
        endAt,
        matchTimelines: cloneJson(segment.matchTimelines || []),
        status: "completed",
    });
    if (tournament.recording.activeSegmentId === segment.id) tournament.recording.activeSegmentId = null;
}

function closeTournamentRecordingSegment(tournament, endAt) {
    const segment = tournament.recording.segments.find((candidate) => candidate.scope === "whole-tournament");
    if (!segment || segment.status === "completed") return;
    segment.endAt = endAt;
    segment.status = "completed";
    updateRecordingQueueEntry(tournament, segment.id, {
        matchIds: [...(segment.matchIds || [])],
        matchTimelines: cloneJson(segment.matchTimelines || []),
        endAt,
        status: "completed",
    });
    if (tournament.recording.activeSegmentId === segment.id) tournament.recording.activeSegmentId = null;
}

function isRoundRecordingSelected(tournament, roundIndex) {
    return tournament.recordingSelection === "whole-tournament"
        || tournament.recordingSelection === "match"
        || (tournament.selectedRoundIndices || []).includes(roundIndex);
}

function updateRecordingQueueEntry(tournament, id, patch) {
    const entry = tournament.recording?.queue?.find((candidate) => candidate.id === id);
    if (entry) Object.assign(entry, patch);
    const boundaries = tournament.recording?.segments?.map((segment) => ({
        id: segment.id,
        scope: segment.scope,
        roundIndex: segment.roundIndex,
        matchId: segment.matchId,
        matchIds: [...(segment.matchIds || [])],
        matchTimelines: cloneJson(segment.matchTimelines || []),
        introMode: segment.introMode || "full-intro",
        introDuration: segment.introDuration ?? null,
        cameraTransition: segment.cameraTransition
            ? { ...segment.cameraTransition }
            : null,
        startAt: segment.startAt,
        endAt: segment.endAt,
        status: segment.status,
    })) || [];
    if (tournament.recording) tournament.recording.segmentBoundaries = boundaries;
    tournament.recordingSegmentBoundaries = boundaries;
}

function findNextEligibleMatch(tournament) {
    return tournament.rounds
        .flatMap((round) => round.matches)
        .find((match) => (
            match.status === "pending"
            && match.left?.entrantId
            && match.right?.entrantId
        )) || null;
}

function resolveWinnerNode(match, options) {
    const winnerIndex = Number(options.winnerIndex);
    if (winnerIndex === 0) return match.left;
    if (winnerIndex === 1) return match.right;
    const winnerId = options.winnerId || options.advancingOrbId || options.entrantId;
    if (!winnerId) return null;
    return [match.left, match.right].find((node) => node.entrantId === winnerId || node.orbId === winnerId) || null;
}

function nodeSnapshot(node, tournament) {
    const entrant = findEntrant(tournament, node.entrantId);
    const orbId = entrant?.orbId || node.orbId || null;
    const label = orbRaceLabel(orbId);
    const unknown = !orbId;
    return {
        nodeId: node.id,
        nodeType: node.nodeType,
        seedSlot: node.seedSlot,
        seed: node.seed,
        entrantId: node.entrantId || null,
        orbId,
        side: node.side,
        sourceMatchId: node.sourceMatchId,
        targetMatchId: node.targetMatchId,
        column: node.column,
        label,
        name: label,
        displayName: label,
        unknown,
        card: {
            id: node.id,
            nodeType: "bracket-card",
            label,
            displayName: label,
            orbId,
            entrantId: node.entrantId || null,
            unknown,
        },
    };
}

function orbRaceLabel(orbId) {
    return orbId && ORB_RACERS[orbId]?.name
        ? ORB_RACERS[orbId].name
        : ORB_RACE_TOURNAMENT_UNKNOWN_LABEL;
}

function snapshotMatch(match) {
    return {
        id: match.id,
        index: match.index,
        matchIndex: match.matchIndex,
        roundIndex: match.roundIndex,
        roundLabel: match.roundLabel,
        label: match.label,
        side: match.side,
        order: match.order,
        status: match.status,
        left: match.left ? { ...match.left } : null,
        right: match.right ? { ...match.right } : null,
        entrantIds: [...match.entrantIds],
        winnerId: match.winnerId,
        winnerOrbId: match.winnerOrbId,
        eliminatedId: match.eliminatedId,
        eliminatedOrbId: match.eliminatedOrbId,
        sourceNodeIds: [...match.sourceNodeIds],
        sourceMatchIds: [...match.sourceMatchIds],
        targetNodeId: match.targetNodeId,
        targetMatchId: match.targetMatchId,
        seed: match.seed,
        recordingScope: match.recordingScope,
        recordingSegmentId: match.recordingSegmentId,
        presentation: match.presentation ? { ...match.presentation } : null,
    };
}

function createPresentationTimestamps(
    startAt,
    timing = PRESENTATION_DURATIONS,
    {
        introMode = "full-intro",
        fromMatchId = null,
        toMatchId = null,
    } = {},
) {
    const effectiveTiming = effectivePresentationTiming(timing);
    const isCameraPan = introMode === "camera-pan";
    const introBracketAt = Number(startAt) || 0;
    const bracketIntroDuration = isCameraPan ? 0 : effectiveTiming.bracketIntroDuration;
    const motionDuration = isCameraPan
        ? effectiveTiming.cameraPanDuration ?? effectiveTiming.zoomDuration
        : effectiveTiming.zoomDuration;
    const bracketZoomAt = introBracketAt + bracketIntroDuration;
    const motionEndAt = bracketZoomAt + motionDuration;
    const matchupHoldDuration = effectiveTiming.matchupHoldDuration ?? PRESENTATION_DURATIONS.matchupHoldDuration;
    const holdStartAt = motionEndAt;
    const holdEndAt = holdStartAt + matchupHoldDuration;
    const battleAt = holdEndAt;
    const fullIntroDuration = battleAt - introBracketAt;
    return {
        introBracketAt,
        bracketZoomAt,
        zoomEndAt: isCameraPan ? null : motionEndAt,
        panEndAt: isCameraPan ? motionEndAt : null,
        motionEndAt,
        holdStartAt,
        matchupHoldAt: holdStartAt,
        holdEndAt,
        battleAt,
        bracketIntroDuration,
        zoomDuration: effectiveTiming.zoomDuration,
        cameraPanDuration: effectiveTiming.cameraPanDuration ?? effectiveTiming.zoomDuration,
        matchupHoldDuration,
        preFightDuration: fullIntroDuration,
        fullIntroDuration,
        introMode,
        cameraTransition: {
            type: isCameraPan ? "camera-pan" : "full-intro",
            fromMatchId,
            toMatchId,
            startAt: introBracketAt,
            endAt: motionEndAt,
            duration: motionDuration,
        },
        transitionStartAt: isCameraPan ? introBracketAt : null,
        transitionEndAt: isCameraPan ? motionEndAt : null,
        transitionDuration: isCameraPan ? motionDuration : null,
        transitionFromMatchId: isCameraPan ? fromMatchId : null,
        transitionToMatchId: isCameraPan ? toMatchId : null,
        nextMatchIntroMode: null,
        matchId: null,
        roundIndex: null,
        matchLabel: null,
        matchIndex: null,
        fromMatchId: isCameraPan ? fromMatchId : null,
        toMatchId: isCameraPan ? toMatchId : null,
        nextMatchId: null,
        nextRoundIndex: null,
        nextMatchIndex: null,
        conclusionDuration: effectiveTiming.conclusionDuration,
        resultAt: null,
        conclusionAt: null,
        conclusionEndAt: null,
        advancementAt: null,
        nextMatchAt: null,
        championConclusionAt: null,
        championConclusionEndAt: null,
        destinationNodeId: null,
        destinationLabel: ORB_RACE_TOURNAMENT_UNKNOWN_LABEL,
    };
}

function effectivePresentationTiming(timing) {
    if (!timing?.reducedMotion) return timing;
    return timing.reducedMotionEquivalent || {
        bracketIntroDuration: 0,
        zoomDuration: 0,
        cameraPanDuration: 0,
        matchupHoldDuration: 0,
        preFightDuration: 0,
        conclusionDuration: 0,
        nextMatchGap: timing.nextMatchGap ?? PRESENTATION_DURATIONS.nextMatchGap,
    };
}

function createTournamentPresentationState(
    phase,
    matchId,
    timestamps,
    { match = null, tournament = null, time = 0 } = {},
) {
    const resolvedTimestamps = { ...(timestamps || createPresentationTimestamps(0)) };
    const conclusion = createTournamentConclusionState(resolvedTimestamps, match, tournament, time);
    const cameraTransition = createCameraTransitionState(resolvedTimestamps, time);
    const focusedMatchId = match?.id || matchId || null;
    const handoffTransition = phase === "conclusion" && resolvedTimestamps.nextMatchTransition
        ? resolvedTimestamps.nextMatchTransition
        : null;
    const transition = handoffTransition
        || resolvedTimestamps.cameraTransition
        || null;
    const fromMatchId = handoffTransition?.fromMatchId
        || resolvedTimestamps.transitionFromMatchId
        || (transition?.type === "camera-pan" ? transition.fromMatchId : null)
        || null;
    const toMatchId = handoffTransition?.toMatchId
        || resolvedTimestamps.transitionToMatchId
        || transition?.toMatchId
        || resolvedTimestamps.nextMatchId
        || focusedMatchId;
    const cameraPanRaw = handoffTransition
        || (resolvedTimestamps.introMode === "camera-pan"
            ? resolvedTimestamps.cameraTransition
            : null);
    const cameraPanTransition = cameraPanRaw
        ? createCameraTransitionState({ cameraTransition: cameraPanRaw }, time)
        : null;
    const isCameraPan = resolvedTimestamps.introMode === "camera-pan";
    const isMatchupHold = phase === "matchup-hold"
        || (isCameraPan
            && Number(time) >= Number(resolvedTimestamps.holdStartAt)
            && Number(time) < Number(resolvedTimestamps.holdEndAt));
    const matchupHold = {
        active: isMatchupHold,
        matchId: focusedMatchId,
        roundIndex: match?.roundIndex ?? null,
        matchIndex: match?.matchIndex ?? null,
        startAt: resolvedTimestamps.holdStartAt ?? null,
        endAt: resolvedTimestamps.holdEndAt ?? resolvedTimestamps.battleAt ?? null,
        duration: resolvedTimestamps.matchupHoldDuration ?? null,
        progress: progressBetween(
            time,
            resolvedTimestamps.holdStartAt,
            resolvedTimestamps.holdEndAt ?? resolvedTimestamps.battleAt,
        ),
    };
    const cameraPan = {
        active: cameraPanTransition?.active === true
            && Number(time) >= Number(cameraPanTransition.startAt),
        fromMatchId: cameraPanRaw?.fromMatchId || null,
        toMatchId: cameraPanRaw?.toMatchId || focusedMatchId,
        startAt: cameraPanTransition?.startAt ?? null,
        endAt: cameraPanTransition?.endAt ?? null,
        duration: cameraPanTransition?.duration ?? 0,
        progress: cameraPanTransition?.type === "camera-pan"
            ? cameraPanTransition.progress
            : 0,
    };
    return {
        phase,
        matchId: focusedMatchId,
        currentMatchId: focusedMatchId,
        selectedMatchId: tournament?.selectedMatchId || tournament?.activeMatchId || focusedMatchId,
        activeMatchId: tournament?.activeMatchId || null,
        roundIndex: match?.roundIndex ?? null,
        matchIndex: match?.matchIndex ?? null,
        roundLabel: match?.roundLabel || null,
        fromMatchId,
        toMatchId,
        timestamps: resolvedTimestamps,
        introMode: resolvedTimestamps.introMode || "full-intro",
        cameraTransition,
        transition: cameraTransition,
        transitionProgress: cameraTransition?.progress || 0,
        cameraPanProgress: cameraTransition?.type === "camera-pan"
            ? cameraTransition.progress
            : 0,
        cameraPan,
        holdStartAt: resolvedTimestamps.holdStartAt ?? null,
        holdEndAt: resolvedTimestamps.holdEndAt ?? resolvedTimestamps.battleAt ?? null,
        battleAt: resolvedTimestamps.battleAt ?? null,
        matchupHoldProgress: matchupHold.progress,
        matchupHold,
        conclusion,
        dustOutProgress: conclusion.dustOutProgress,
        winnerFadeInProgress: conclusion.winnerFadeInProgress,
    };
}

function createCameraTransitionState(timestamps, time) {
    const raw = timestamps?.cameraTransition;
    if (!raw) return null;
    const startAt = Number(raw.startAt);
    const endAt = Number(raw.endAt);
    const duration = Number(raw.duration);
    const progress = Number.isFinite(startAt) && Number.isFinite(endAt) && endAt > startAt
        ? clamp01((Number(time) - startAt) / (endAt - startAt))
        : 0;
    return {
        ...raw,
        startAt: Number.isFinite(startAt) ? startAt : null,
        endAt: Number.isFinite(endAt) ? endAt : null,
        duration: Number.isFinite(duration) ? duration : 0,
        progress,
        active: raw.type === "camera-pan" && progress < 1,
    };
}

function createTournamentConclusionState(timestamps, match, tournament, time) {
    const startAt = Number(
        timestamps.championConclusionAt
        ?? timestamps.conclusionAt
        ?? timestamps.resultAt,
    );
    const endAt = Number(
        timestamps.championConclusionEndAt
        ?? timestamps.conclusionEndAt
        ?? (Number.isFinite(startAt) ? startAt + effectivePresentationTiming(
            tournament?.presentationTiming || PRESENTATION_DURATIONS,
        ).conclusionDuration : NaN),
    );
    const duration = Number.isFinite(startAt) && Number.isFinite(endAt)
        ? Math.max(0, endAt - startAt)
        : PRESENTATION_DURATIONS.conclusionDuration;
    const reducedMotion = tournament?.presentationTiming?.reducedMotion === true;
    const rawProgress = Number.isFinite(startAt) && Number.isFinite(endAt) && endAt > startAt
        ? clamp01((Number(time) - startAt) / (endAt - startAt))
        : 0;
    const progress = reducedMotion && Number.isFinite(startAt) && Number(time) >= startAt
        ? 1
        : rawProgress;
    const destinationNodeId = timestamps.destinationNodeId
        || match?.targetNodeId
        || null;
    const destinationLabel = timestamps.destinationLabel
        || destinationNodeLabel(tournament, destinationNodeId);
    return {
        active: Number.isFinite(startAt) && Number(time) >= startAt && progress < 1,
        duration,
        progress,
        destinationNodeId,
        destinationLabel: destinationLabel || ORB_RACE_TOURNAMENT_UNKNOWN_LABEL,
        destination: destinationLabel || ORB_RACE_TOURNAMENT_UNKNOWN_LABEL,
        destinationUnknownLabel: ORB_RACE_TOURNAMENT_UNKNOWN_LABEL,
        dustOutProgress: clamp01(progress * 2),
        dustOut: clamp01(progress * 2),
        winnerFadeInProgress: clamp01((progress - 0.5) * 2),
        winnerFadeIn: clamp01((progress - 0.5) * 2),
        winnerFadeProgress: clamp01((progress - 0.5) * 2),
        winnerOrbId: match?.winnerOrbId || tournament?.championOrbId || null,
        winnerNodeId: match?.outputNode?.id || null,
    };
}

function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
}

function progressBetween(value, start, end) {
    const numericStart = Number(start);
    const numericEnd = Number(end);
    if (!Number.isFinite(numericStart) || !Number.isFinite(numericEnd) || numericEnd <= numericStart) return 0;
    return clamp01((Number(value) - numericStart) / (numericEnd - numericStart));
}

function compactAnalytics(analytics) {
    return {
        duration: Number(analytics.duration) || 0,
        winnerId: analytics.winnerId || null,
        totalDamage: Number(analytics.totalDamage) || 0,
        damageTaken: Number(analytics.damageTaken) || 0,
    };
}

function findMatch(tournament, id) {
    if (!id) return null;
    for (const round of tournament.rounds || []) {
        const match = round.matches.find((candidate) => candidate.id === id);
        if (match) return match;
    }
    return null;
}

function findEntrant(tournament, id) {
    if (!id) return null;
    return tournament.entrants.find((entrant) => entrant.id === id) || null;
}

function destinationNodeLabel(tournament, nodeId) {
    if (!tournament || !nodeId) return ORB_RACE_TOURNAMENT_UNKNOWN_LABEL;
    const node = (tournament.nodes || []).find((candidate) => candidate.id === nodeId)
        || tournament.rounds?.flatMap((round) => round.matches).find((match) => match.id === nodeId)?.outputNode;
    return orbRaceLabel(node?.orbId || node?.entrantId && findEntrant(tournament, node.entrantId)?.orbId);
}

function normalizePreviewRoundIndex(value, tournament, selection) {
    if (selection === "match") return null;
    const fallback = tournament?.selectedRoundIndices?.[0] ?? 0;
    if (value === undefined || value === null || value === "") return Number(fallback);
    if (typeof value === "string") {
        const match = value.match(/(?:round-)?(\d+)/i);
        if (match) return Number(match[1]) - 1;
    }
    return Math.floor(Number(value));
}

function validateEntrants(rawIds, size, allowDuplicates) {
    if (!Array.isArray(rawIds) || rawIds.length !== size) {
        throw new Error(`Orb Race tournament size ${size} requires exactly ${size} entrant IDs`);
    }
    const ids = rawIds.map((id) => String(id || ""));
    const seen = new Set();
    for (const id of ids) {
        if (!ORB_RACER_IDS.includes(id)) throw new Error(`Unknown Orb Race tournament entrant: ${id}`);
        if (seen.has(id) && !allowDuplicates) throw new Error(`Duplicate Orb Race tournament entrant: ${id}`);
        seen.add(id);
    }
    return ids;
}

function normalizeRecordingScope(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (["whole-tournament", "tournament"].includes(normalized)) return "whole-tournament";
    if (["whole-round", "round", "wholeround", "selected-round"].includes(normalized)) return "whole-round";
    return "each-match";
}

function normalizeRecordingSelection(raw, recordingScope) {
    const requested = raw.recordingSelection || raw.recordingMode || raw.recordingPlan;
    if (ORB_RACE_TOURNAMENT_RECORDING_SELECTIONS.includes(requested)) return requested;
    if (requested === "individual-match" || requested === "each-match" || requested === "short") return "match";
    if (requested === "round" || requested === "whole-round" || requested === "long") return "selected-round";
    if (recordingScope === "whole-tournament") return "whole-tournament";
    if (recordingScope === "whole-round") return "selected-round";
    return "match";
}

function normalizeTournamentLayerValues(raw, recordingSelection, recordingLayerCount) {
    const explicit = raw.sharedLayerValues
        || raw.layerValues
        || raw.tournamentLayerValues
        || raw.matchSettings?.layerStrengths;
    const target = normalizeLayerTarget(
        raw.finalLayerHealth
            ?? raw.sharedLayerTarget
            ?? raw.longformTarget
            ?? raw.matchSettings?.finalLayerHealth
            ?? (recordingSelection === "match" ? 110 : ORB_RACE_LONGFORM_DEFAULT_TARGET),
    );
    const format = ORB_RACE_TOURNAMENT_RECORDING_FORMATS[recordingSelection];
    const requestedCount = recordingLayerCount || normalizeTournamentLongformLayerCount(raw.landscapeLayerCount ?? raw.layerCount, format.layerCount);
    const fallback = buildOrbRaceTournamentLayerPreset(requestedCount, target);
    if (Array.isArray(explicit) && explicit.length === requestedCount) {
        return normalizeRaceLayers(explicit, fallback, requestedCount);
    }
    return fallback;
}

function normalizeTournamentLongformLayerCount(value, fallback = 5) {
    const numeric = Math.floor(Number(value));
    return numeric === 3 || numeric === 5 ? numeric : fallback === 3 ? 3 : 5;
}

function normalizeLayerTarget(value) {
    const numeric = Math.floor(Number(value));
    return Number.isFinite(numeric) && numeric > 0 ? numeric : ORB_RACE_LONGFORM_DEFAULT_TARGET;
}

/**
 * Normalize the mutable round-selection model without collapsing selected
 * rounds into a whole-tournament/all-rounds state. The returned IDs are the
 * canonical state IDs (`round-1`, `round-2`, ...), while config/UI labels
 * such as `quarterfinals` and `semifinals` are accepted as input.
 */
export function normalizeOrbRaceTournamentRoundSelection(input = {}, size = DEFAULT_TOURNAMENT_SIZE) {
    const raw = input && typeof input === "object" ? input : {};
    const bracketSize = normalizeOrbRaceTournamentSize(size);
    const roundCount = Math.log2(bracketSize);
    const recordingScope = normalizeRecordingScope(raw.recordingScope);
    const recordingSelection = raw.recordingSelection
        || normalizeRecordingSelection(raw, recordingScope);
    const hasExplicitSelection = [
        "selectedRoundIndices",
        "selectedRoundIds",
        "selectedRounds",
        "roundsToRecord",
        "rounds",
        "roundSelection",
    ].some((key) => raw[key] !== undefined && raw[key] !== null);
    const valuesFor = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
    const requested = [
        ...valuesFor(raw.selectedRoundIndices).map((value) => ({ value, index: true })),
        ...valuesFor(raw.selectedRoundIds).map((value) => ({ value })),
        ...valuesFor(raw.selectedRounds).map((value) => ({ value })),
        ...valuesFor(raw.roundsToRecord).map((value) => ({ value })),
        ...valuesFor(raw.rounds).map((value) => ({ value })),
        ...valuesFor(raw.roundSelection).map((value) => ({ value })),
    ];
    const indices = requested
        .map(({ value, index }) => tournamentRoundIndex(value, bracketSize, roundCount, index))
        .filter((value) => value >= 0 && value < roundCount);
    const selectedRoundIndices = recordingSelection === "whole-tournament"
        ? Array.from({ length: roundCount }, (_value, index) => index)
        : indices.length
            ? [...new Set(indices)].sort((a, b) => a - b)
            : hasExplicitSelection ? [] : [0];
    return {
        selectedRoundIndices,
        selectedRoundIds: selectedRoundIndices.map((index) => `round-${index + 1}`),
        recordingSelection,
        recordingScope,
        allRounds: selectedRoundIndices.length === roundCount && recordingSelection === "whole-tournament",
    };
}

export const normalizeOrbRaceTournamentRounds = normalizeOrbRaceTournamentRoundSelection;
export const normalizeTournamentRoundSelection = normalizeOrbRaceTournamentRoundSelection;

function tournamentRoundIndex(value, size, roundCount, treatAsIndex = false) {
    if (treatAsIndex) {
        const index = Math.floor(Number(value));
        return Number.isFinite(index) ? index : -1;
    }
    if (typeof value === "object" && value !== null) {
        if (value.index !== undefined) return tournamentRoundIndex(value.index, size, roundCount, true);
        return tournamentRoundIndex(value.id, size, roundCount, false);
    }
    const text = String(value ?? "").trim().toLowerCase();
    if (!text) return -1;
    const canonical = text.match(/^round-(\d+)$/);
    if (canonical) return Number(canonical[1]) - 1;
    const roundOf = text.match(/^round-of-(\d+)$/);
    if (roundOf) {
        const roundSize = Number(roundOf[1]);
        return Math.log2(size / roundSize);
    }
    if (text === "championship" || text === "final") return roundCount - 1;
    if (text === "semifinals" || text === "semifinal") return roundCount - 2;
    if (text === "quarterfinals" || text === "quarterfinal") return roundCount - 3;
    const numeric = Number(text);
    return Number.isInteger(numeric) ? numeric : -1;
}

function normalizeSeed(value) {
    const numeric = Number(value);
    return Math.max(1, Number.isFinite(numeric) ? Math.floor(numeric) >>> 0 : 1);
}

export function deriveOrbRaceTournamentBracketSeed(seed) {
    return mixSeed(normalizeSeed(seed) ^ 0xa511e9b3);
}

export function deriveOrbRaceTournamentRosterSeed(seed, size = DEFAULT_TOURNAMENT_SIZE) {
    return mixSeed(
        normalizeSeed(seed)
        ^ Math.imul(normalizeOrbRaceTournamentSize(size), 0x9e3779b9),
    );
}

export function deriveOrbRaceTournamentMatchSeed(seed, roundIndex, matchIndex) {
    return (
        Math.imul(normalizeSeed(seed), 2654435761)
        + Math.imul(Number(roundIndex) + 1, 1013904223)
        + Math.imul(Number(matchIndex), 1664525)
    ) >>> 0 || 1;
}

function seededShuffle(values, seed) {
    const output = [...values];
    const rng = createSeededRandom(seed);
    for (let index = output.length - 1; index > 0; index -= 1) {
        const other = Math.floor(rng.next() * (index + 1));
        [output[index], output[other]] = [output[other], output[index]];
    }
    return output;
}

function createSeededRandom(seed) {
    let state = normalizeSeed(seed);
    return {
        next() {
            state = (state * 1664525 + 1013904223) >>> 0;
            return state / 4294967296;
        },
    };
}

function mixSeed(input) {
    let value = Number(input) >>> 0;
    value ^= value >>> 16;
    value = Math.imul(value, 0x7feb352d);
    value ^= value >>> 15;
    value = Math.imul(value, 0x846ca68b);
    value ^= value >>> 16;
    return value || 1;
}

function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}

export function orbRaceTournamentRoundLabel(size, roundIndex) {
    const remaining = Number(size) / 2 ** Number(roundIndex);
    if (remaining === 2) return "CHAMPIONSHIP";
    if (remaining === 4) return "SEMIFINALS";
    if (remaining === 8) return "QUARTERFINALS";
    return `ROUND OF ${remaining}`;
}
