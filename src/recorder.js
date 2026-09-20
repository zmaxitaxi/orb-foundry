export const RECORDER_STATES = Object.freeze({
  IDLE: "idle",
  RECORDING: "recording",
  STOPPING: "stopping",
  PREVIEW: "preview",
  CANCELLED: "cancelled",
  ERROR: "error",
});

export const TOURNAMENT_RECORDING_SCOPES = Object.freeze({
  EACH_MATCH: "each-match",
  WHOLE_ROUND: "whole-round",
  WHOLE_TOURNAMENT: "whole-tournament",
});

const TOURNAMENT_RECORDING_DEFAULTS = Object.freeze({
  [TOURNAMENT_RECORDING_SCOPES.EACH_MATCH]: Object.freeze({ format: "portrait", width: 1080, height: 1920, layerCount: 3 }),
  [TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND]: Object.freeze({ format: "race-landscape", width: 1920, height: 1080, layerCount: 5 }),
  [TOURNAMENT_RECORDING_SCOPES.WHOLE_TOURNAMENT]: Object.freeze({ format: "race-landscape", width: 1920, height: 1080, layerCount: 5 }),
});

function safeFilenamePart(value, fallback = "unknown") {
  const result = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return result || fallback;
}

function normalizeTournamentRoundIndex(value, tournamentSize = 8) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" || /^-?\d+$/.test(String(value).trim())) {
    const numeric = Math.floor(Number(value));
    return Number.isInteger(numeric) && numeric >= 0 ? numeric : null;
  }
  const text = String(value).trim().toLowerCase();
  const canonical = text.match(/^round-(\d+)$/);
  if (canonical) return Math.max(0, Number(canonical[1]) - 1);
  const roundOf = text.match(/^round-of-(\d+)$/);
  if (roundOf) {
    const roundSize = Number(roundOf[1]);
    const index = Math.log2(Number(tournamentSize) / roundSize);
    return Number.isInteger(index) && index >= 0 ? index : null;
  }
  const roundCount = Math.max(1, Math.log2(Number(tournamentSize) || 8));
  if (["championship", "final"].includes(text)) return roundCount - 1;
  if (["semifinals", "semifinal"].includes(text)) return Math.max(0, roundCount - 2);
  if (["quarterfinals", "quarterfinal"].includes(text)) return Math.max(0, roundCount - 3);
  return null;
}

function normalizeTournamentRoundIndices(values, tournamentSize) {
  if (!Array.isArray(values)) return null;
  return [...new Set(values
    .map((value) => normalizeTournamentRoundIndex(value, tournamentSize))
    .filter((value) => value !== null))]
    .sort((a, b) => a - b);
}

function finiteTimestamp(value) {
    return value !== null && value !== undefined && value !== ""
        && Number.isFinite(Number(value))
        ? Number(value)
        : null;
}

function recordingTimelineForMatch(match = {}) {
    const timestamps = match.presentation || {};
    return {
        matchId: match.id || null,
        roundIndex: Number(match.roundIndex) || 0,
        introMode: timestamps.introMode || "full-intro",
        introBracketAt: timestamps.introBracketAt ?? null,
        bracketZoomAt: timestamps.bracketZoomAt ?? null,
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

export function normalizeTournamentRecordingScope(scope) {
  if (scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND || scope === "round") {
    return TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND;
  }
  if (scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_TOURNAMENT || scope === "tournament") {
    return TOURNAMENT_RECORDING_SCOPES.WHOLE_TOURNAMENT;
  }
  return TOURNAMENT_RECORDING_SCOPES.EACH_MATCH;
}

/**
 * Decide whether the UI should automatically queue another matchup after a
 * recorder preview becomes available. Each-match recording is intentionally a
 * sequence of independently downloadable clips; selected-round and
 * whole-tournament recordings stop at their requested boundary instead.
 */
export function tournamentRecordingShouldContinueAfterPreview({
  scope = TOURNAMENT_RECORDING_SCOPES.EACH_MATCH,
  direct = false,
  tournamentCompleted = false,
} = {}) {
  return normalizeTournamentRecordingScope(scope) === TOURNAMENT_RECORDING_SCOPES.EACH_MATCH
    && direct !== true
    && tournamentCompleted !== true;
}

export function tournamentRecordingFilename({
  tournamentSize = 8,
  roundIndex = 0,
  matchIndex = 0,
  roundLabel = "round",
  entrantIds = [],
  scope = TOURNAMENT_RECORDING_SCOPES.EACH_MATCH,
  extension = "mp4",
} = {}) {
  const seeds = entrantIds.slice(0, 2).map((id) => safeFilenamePart(id, "orb"));
  const matchup = seeds.length === 2 ? `${seeds[0]}-vs-${seeds[1]}` : "matchup";
  const normalizedScope = normalizeTournamentRecordingScope(scope);
  const scopePart = normalizedScope === TOURNAMENT_RECORDING_SCOPES.EACH_MATCH
    ? "match"
    : normalizedScope.replace("whole-", "");
  return `orb-foundry-tournament-${Number(tournamentSize) || 8}-round-${Math.max(1, Number(roundIndex) + 1)}-${safeFilenamePart(roundLabel, "round")}-match-${Math.max(1, Number(matchIndex) + 1)}-${matchup}-${scopePart}.${safeFilenamePart(extension, "mp4")}`;
}

export function createTournamentRecordingSegmentMetadata(input = {}) {
  const scope = normalizeTournamentRecordingScope(input.scope ?? input.recordingScope);
  const defaults = TOURNAMENT_RECORDING_DEFAULTS[scope];
  const tournamentSize = Number(input.tournamentSize ?? input.size) || 8;
  const roundIndex = Math.max(0, Number(input.roundIndex) || 0);
  const matchIndex = Math.max(0, Number(input.matchIndex) || 0);
  const entrantIds = Array.isArray(input.entrantIds)
    ? input.entrantIds.slice(0, 2).map((id) => String(id))
    : Array.isArray(input.orbIds) ? input.orbIds.slice(0, 2).map((id) => String(id)) : [];
  const segmentId = String(input.segmentId || `tournament-${tournamentSize}-r${roundIndex + 1}-m${matchIndex + 1}`);
  return {
    segmentId,
    scope,
    tournamentSize,
    roundIndex,
    matchIndex,
    roundLabel: String(input.roundLabel || `ROUND OF ${tournamentSize / (2 ** roundIndex)}`),
    matchId: input.matchId || null,
    entrantIds,
    orbIds: entrantIds,
    seedSlots: Array.isArray(input.seedSlots) ? input.seedSlots.slice(0, 2) : [],
    startedAt: finiteTimestamp(input.startedAt),
    endedAt: finiteTimestamp(input.endedAt),
    status: input.status || "planned",
    introMode: input.introMode || "full-intro",
    introDuration: Number.isFinite(Number(input.introDuration)) ? Number(input.introDuration) : null,
    cameraTransition: input.cameraTransition ? { ...input.cameraTransition } : null,
    matchTimelines: Array.isArray(input.matchTimelines)
        ? input.matchTimelines.map((timeline) => ({ ...timeline }))
        : [],
    format: input.format || defaults.format,
    width: Number(input.width) || defaults.width,
    height: Number(input.height) || defaults.height,
    layerCount: Number(input.layerCount) || defaults.layerCount,
    cropToFinish: input.cropToFinish === true || (scope !== TOURNAMENT_RECORDING_SCOPES.EACH_MATCH && Number(input.layerCount) === 3),
    filename: input.filename || tournamentRecordingFilename({
      tournamentSize,
      roundIndex,
      matchIndex,
      roundLabel: input.roundLabel,
      entrantIds,
      scope,
      extension: input.extension,
    }),
  };
}

export class TournamentRecordingCoordinator {
  constructor(recorder = null) {
    this.recorder = recorder;
    this.session = null;
    this.segments = [];
    this.lastResult = null;
    this.lastStoppedSegment = null;
    this.pendingFinalizationSegments = [];
  }

  reset() {
    this.session = null;
    this.segments = [];
    this.lastResult = null;
    this.lastStoppedSegment = null;
    this.pendingFinalizationSegments = [];
  }

  beginTournamentSession({
    scope = TOURNAMENT_RECORDING_SCOPES.EACH_MATCH,
    recordingScope = null,
    tournamentSize = 8,
    tournamentId = null,
    selectedRound = null,
    selectedRounds = null,
    selectedRoundIndices = null,
    selectedRoundIds = null,
    selectedMatch = null,
    selectedMatchId = null,
    fps = 30,
  } = {}) {
    const normalizedTournamentSize = Number(tournamentSize) || 8;
    const normalizedSelectedRound = selectedRound !== null && selectedRound !== ""
      ? normalizeTournamentRoundIndex(selectedRound, normalizedTournamentSize)
      : null;
    const normalizedSelectedMatch = selectedMatch !== null && selectedMatch !== ""
      && Number.isInteger(Number(selectedMatch)) ? Number(selectedMatch) : null;
    const requestedRounds = selectedRoundIndices
      ?? selectedRoundIds
      ?? selectedRounds;
    const normalizedSelectedRounds = requestedRounds !== null && requestedRounds !== undefined
      ? normalizeTournamentRoundIndices(
        Array.isArray(requestedRounds) ? requestedRounds : [requestedRounds],
        normalizedTournamentSize,
      )
      : normalizedSelectedRound === null ? null : [normalizedSelectedRound];
    this.session = {
      scope: normalizeTournamentRecordingScope(recordingScope || scope),
      tournamentSize: normalizedTournamentSize,
      tournamentId: tournamentId || null,
      selectedRound: normalizedSelectedRound,
      selectedRounds: normalizedSelectedRounds,
      selectedRoundIds: normalizedSelectedRounds?.map((index) => `round-${index + 1}`) || null,
      selectedMatch: normalizedSelectedMatch,
      selectedMatchId: selectedMatchId || null,
      fps: Number(fps) === 60 ? 60 : 30,
      activeSegment: null,
      segments: [],
      recording: false,
      lastMatchConclusionAt: null,
      longFormIntroMatchId: null,
      lastIncludedMatchId: null,
      includedMatchIds: [],
      cameraPanCount: 0,
    };
    this.segments = this.session.segments;
    this.lastResult = null;
    this.lastStoppedSegment = null;
    this.pendingFinalizationSegments = [];
    return this.session;
  }

  _queueFinalization(segment) {
    if (!segment) return null;
    if (!this.pendingFinalizationSegments.some((candidate) => candidate.segmentId === segment.segmentId)) {
      this.pendingFinalizationSegments.push(segment);
    }
    this.lastStoppedSegment = segment;
    return segment;
  }

  _segmentForMatch(match = {}, { startedAt = null } = {}) {
    const scope = this.session?.scope || TOURNAMENT_RECORDING_SCOPES.EACH_MATCH;
    if (scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND && this.session.activeSegment
      && this.session.activeSegment.roundIndex === Number(match.roundIndex || 0)) {
      this._appendMatchToSegment(this.session.activeSegment, match);
      return this.session.activeSegment;
    }
    if (scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_TOURNAMENT && this.session.activeSegment) {
      this._appendMatchToSegment(this.session.activeSegment, match);
      return this.session.activeSegment;
    }
    const segment = createTournamentRecordingSegmentMetadata({
      segmentId: scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND
        ? `round-${Number(match.roundIndex || 0) + 1}-recording`
        : scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_TOURNAMENT
          ? `tournament-${this.session?.tournamentId || "orb-race"}-recording`
          : `${match.id || `r${Number(match.roundIndex || 0) + 1}-m${Number(match.matchIndex || 0) + 1}`}-recording`,
      scope,
      tournamentSize: this.session?.tournamentSize,
      roundIndex: match.roundIndex,
      matchIndex: match.matchIndex,
      matchId: match.id,
      roundLabel: match.roundLabel,
      entrantIds: match.entrantIds || [match.left?.orbId, match.right?.orbId],
      seedSlots: [match.left?.seedSlot, match.right?.seedSlot],
      introMode: match.presentation?.introMode,
      introDuration: match.presentation?.transitionDuration
        || match.presentation?.fullIntroDuration,
      cameraTransition: match.presentation?.cameraTransition,
      matchTimelines: [recordingTimelineForMatch(match)],
      format: match.recordingFormat || match.format,
      width: match.recordingDimensions?.width,
      height: match.recordingDimensions?.height,
      layerCount: match.recordingLayerCount || match.layerCount,
      cropToFinish: match.cropToFinish,
      startedAt,
      status: "active",
    });
    this._appendMatchToSegment(segment, match);
    this.session.segments.push(segment);
    this.session.activeSegment = segment;
    return segment;
  }

  _appendMatchToSegment(segment, match = {}) {
    const matchId = match.id || null;
    if (!segment || !matchId) return segment;
    segment.matchIds = Array.isArray(segment.matchIds) ? segment.matchIds : [];
    segment.matchTimelines = Array.isArray(segment.matchTimelines) ? segment.matchTimelines : [];
    const isNewMatch = !segment.matchIds.includes(matchId);
    if (isNewMatch) segment.matchIds.push(matchId);
    const timeline = recordingTimelineForMatch(match);
    const existingTimelineIndex = segment.matchTimelines.findIndex((entry) => entry.matchId === matchId);
    if (existingTimelineIndex === -1) segment.matchTimelines.push(timeline);
    else segment.matchTimelines[existingTimelineIndex] = timeline;
    if (isNewMatch && !segment.introMode) segment.introMode = timeline.introMode;
    if (isNewMatch && segment.introDuration == null) {
      segment.introDuration = timeline.transitionDuration || timeline.fullIntroDuration;
    }
    if (isNewMatch && !segment.cameraTransition) segment.cameraTransition = timeline.cameraTransition;
    segment.lastMatchId = matchId;
    segment.lastRoundIndex = Number(match.roundIndex) || 0;
    if (isNewMatch && this.session) {
      this.session.includedMatchIds = Array.isArray(this.session.includedMatchIds)
        ? this.session.includedMatchIds
        : [];
      if (!this.session.includedMatchIds.includes(matchId)) this.session.includedMatchIds.push(matchId);
      this.session.longFormIntroMatchId = this.session.longFormIntroMatchId || matchId;
      this.session.lastIncludedMatchId = matchId;
      if (timeline.introMode === "camera-pan") this.session.cameraPanCount += 1;
    }
    segment.status = "active";
    return segment;
  }

  async onMatchIntro(match = {}, { now = null, recorderOptions = {} } = {}) {
    if (!this.session) this.beginTournamentSession({ tournamentSize: 8 });
    const selectedRound = this.session.selectedRound;
    const selectedRounds = this.session.selectedRounds;
    const selectedMatch = this.session.selectedMatch;
    if (this.session.selectedMatchId && match.id !== this.session.selectedMatchId) return null;
    if (selectedRounds && !selectedRounds.includes(Number(match.roundIndex))) return null;
    if (!selectedRounds && selectedRound !== null && Number(match.roundIndex) !== selectedRound) return null;
    if (!this.session.selectedMatchId && selectedMatch !== null && Number(match.matchIndex) !== selectedMatch) return null;
    if (this.session.scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND
      && this.session.activeSegment
      && this.session.activeSegment.roundIndex !== Number(match.roundIndex)) {
      this.finalizeRound({
        roundIndex: this.session.activeSegment.roundIndex,
        now: this.session.lastMatchConclusionAt ?? now,
      });
    }
    const segment = this._segmentForMatch(match, { startedAt: now });
    this._appendMatchToSegment(segment, match);
    if (!this.session.recording && this.recorder?.machine?.state !== RECORDER_STATES.RECORDING) {
      await this.recorder?.start?.({
        fps: this.session.fps,
        tournament: segment,
        recordingScope: this.session.scope,
        ...recorderOptions,
      });
      this.session.recording = true;
    }
    return segment;
  }

  onMatchConclusion(match = {}, { now = null, winnerId = null, loserId = null } = {}) {
    const segment = this.session?.activeSegment;
    if (!segment) return null;
    segment.endedAt = finiteTimestamp(now) ?? segment.endedAt;
    segment.winnerId = winnerId || null;
    segment.loserId = loserId || null;
    segment.status = "conclusion";
    this.session.lastMatchConclusionAt = finiteTimestamp(now) ?? segment.endedAt;
    return segment;
  }

  shouldStopAfterMatch(match = {}, { tournamentCompleted = false, roundCompleted = false } = {}) {
    const scope = this.session?.scope || TOURNAMENT_RECORDING_SCOPES.EACH_MATCH;
    if (this.session?.selectedMatchId && match.id && match.id !== this.session.selectedMatchId) return false;
    if (this.session?.selectedRounds
      && !this.session.selectedRounds.includes(Number(match.roundIndex))) return false;
    if (!this.session?.selectedRounds
      && this.session?.selectedRound !== null
      && Number(match.roundIndex) !== this.session.selectedRound) return false;
    if (scope === TOURNAMENT_RECORDING_SCOPES.EACH_MATCH) return true;
    if (scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND) {
      const selectedRounds = this.session?.selectedRounds;
      const finalSelectedRound = selectedRounds?.length
        ? Math.max(...selectedRounds)
        : this.session?.selectedRound !== null ? this.session.selectedRound : Number(match.roundIndex);
      return roundCompleted && Number(match.roundIndex) === finalSelectedRound;
    }
    return tournamentCompleted;
  }

  shouldContinueAfterMatch(match = {}, options = {}) {
    return !this.shouldStopAfterMatch(match, options);
  }

  shouldContinueAfterPreview({ direct = false, tournamentCompleted = false } = {}) {
    return tournamentRecordingShouldContinueAfterPreview({
      scope: this.session?.scope,
      direct,
      tournamentCompleted,
    });
  }

  _stopRecorder() {
    if (this.recorder?.machine?.state !== RECORDER_STATES.RECORDING) return false;
    this.recorder.stop?.();
    return true;
  }

  /**
   * Resolve one authoritative match result into the coordinator boundary
   * state. This keeps the stop/continue rule in one place for each-match,
   * selected-round, and whole-tournament recordings.
   */
  onMatchResult(match = {}, options = {}) {
    const segment = this.onMatchConclusion(match, options);
    const shouldStop = Boolean(segment) && this.shouldStopAfterMatch(match, options);
    let finalizedSegment = null;
    let recorderStopped = false;
    if (shouldStop) {
      if (this.session.scope === TOURNAMENT_RECORDING_SCOPES.EACH_MATCH) {
        finalizedSegment = this.markRecorderStopPending();
      } else if (this.session.scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND) {
        finalizedSegment = this.finalizeRound({
          roundIndex: match.roundIndex,
          now: options.now,
        });
      } else if (options.tournamentCompleted === true) {
        finalizedSegment = this.finalizeTournament({ now: options.now });
      }
      recorderStopped = this._stopRecorder();
    }
    return {
      segment,
      shouldStop,
      shouldContinue: !shouldStop,
      finalizedSegment,
      recorderStopped,
    };
  }

  finalizeRound({ roundIndex, now = null } = {}) {
    const segment = this.session?.activeSegment;
    if (!segment || this.session.scope !== TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND) return null;
    if (Number.isInteger(Number(roundIndex)) && segment.roundIndex !== Number(roundIndex)) return null;
    segment.endedAt = finiteTimestamp(now) ?? segment.endedAt;
    segment.status = "completed";
    this._queueFinalization(segment);
    this.session.activeSegment = null;
    return segment;
  }

  finalizeTournament({ now = null } = {}) {
    const segment = this.session?.activeSegment;
    if (!segment) return null;
    segment.endedAt = finiteTimestamp(now) ?? segment.endedAt;
    segment.status = "completed";
    this._queueFinalization(segment);
    this.session.activeSegment = null;
    return segment;
  }

  onRecorderResult(result = {}) {
    const resultSegmentId = result.metadata?.segmentId || result.segmentId || null;
    const segment = (resultSegmentId
      ? this.pendingFinalizationSegments.find((candidate) => candidate.segmentId === resultSegmentId)
      : null)
      || this.pendingFinalizationSegments[0]
      || this.session?.activeSegment
      || this.lastStoppedSegment;
    const extension = recordingExtensionForMime(result.mimeType || result.blob?.type);
    const metadata = segment
      ? {
        ...segment,
        filename: filenameWithRecordingExtension(segment.filename, extension),
      }
      : result.metadata || null;
    const enriched = {
      ...result,
      metadata,
      filename: result.filename || metadata?.filename || null,
    };
    this.lastResult = enriched;
    if (segment) segment.status = "recorded";
    this.session && (this.session.recording = false);
    this.pendingFinalizationSegments = this.pendingFinalizationSegments.filter((candidate) => candidate.segmentId !== segment?.segmentId);
    if (this.lastStoppedSegment?.segmentId === segment?.segmentId) this.lastStoppedSegment = this.pendingFinalizationSegments.at(-1) || null;
    return enriched;
  }

  get segmentResults() {
    return this.session?.segments ? this.session.segments.map((segment) => ({ ...segment })) : [];
  }

  markRecorderStopPending() {
    const segment = this.session?.activeSegment || this.lastStoppedSegment;
    if (!segment) return null;
    this._queueFinalization(segment);
    if (this.session?.activeSegment?.segmentId === segment.segmentId) this.session.activeSegment = null;
    return segment;
  }
}

export class RecorderStateMachine {
  constructor() {
    this.state = RECORDER_STATES.IDLE;
  }

  transition(action) {
    const transitions = {
      [RECORDER_STATES.IDLE]: { start: RECORDER_STATES.RECORDING },
      [RECORDER_STATES.RECORDING]: { stop: RECORDER_STATES.STOPPING, cancel: RECORDER_STATES.CANCELLED, fail: RECORDER_STATES.ERROR },
      [RECORDER_STATES.STOPPING]: { complete: RECORDER_STATES.PREVIEW, fail: RECORDER_STATES.ERROR },
      [RECORDER_STATES.PREVIEW]: { reset: RECORDER_STATES.IDLE, start: RECORDER_STATES.RECORDING },
      [RECORDER_STATES.CANCELLED]: { reset: RECORDER_STATES.IDLE, start: RECORDER_STATES.RECORDING },
      [RECORDER_STATES.ERROR]: { reset: RECORDER_STATES.IDLE, start: RECORDER_STATES.RECORDING },
    };
    const next = transitions[this.state]?.[action];
    if (!next) throw new Error(`Invalid recorder transition: ${this.state} -> ${action}`);
    this.state = next;
    return this.state;
  }
}

export function supportedRecordingMime(MediaRecorderClass = globalThis.MediaRecorder) {
  if (!MediaRecorderClass) return "";
  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4;codecs=avc1.42001E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((mime) => typeof MediaRecorderClass.isTypeSupported !== "function" || MediaRecorderClass.isTypeSupported(mime)) || "";
}

function recordingExtensionForMime(mimeType) {
  return String(mimeType || "").toLowerCase().includes("webm") ? "webm" : "mp4";
}

function filenameWithRecordingExtension(filename, extension) {
  if (!filename) return filename;
  return String(filename).replace(/\.(?:mp4|webm)$/i, `.${extension}`);
}

export class SocialBattleRecorder {
  constructor(canvas, audio, onStateChange = () => {}, environment = {}) {
    this.canvas = canvas;
    this.audio = audio;
    this.onStateChange = onStateChange;
    this.MediaRecorderClass = environment.MediaRecorderClass || globalThis.MediaRecorder;
    this.createObjectURL = environment.createObjectURL || ((blob) => URL.createObjectURL(blob));
    this.revokeObjectURL = environment.revokeObjectURL || ((url) => URL.revokeObjectURL(url));
    this.now = environment.now || (() => performance.now());
    this.machine = new RecorderStateMachine();
    this.mediaRecorder = null;
    this.chunks = [];
    this.blob = null;
    this.url = "";
    this.startedAt = 0;
    this.completedDuration = 0;
    this.cancelled = false;
  }

  supported() {
    return Boolean(
      this.canvas?.captureStream &&
      this.MediaRecorderClass &&
      supportedRecordingMime(this.MediaRecorderClass),
    );
  }

  async start({ fps = 30, tournament = null, recordingScope = null } = {}) {
    this.release();
    if (!this.supported()) throw new Error("Canvas recording is not supported in this browser.");
    if (this.audio?.unlock) {
      await Promise.race([
        Promise.resolve(this.audio.unlock()).catch(() => false),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);
    }
    this.machine.transition("start");
    this.onStateChange(this.machine.state);
    this.cancelled = false;
    this.chunks = [];
    const stream = this.canvas.captureStream(Number(fps) === 60 ? 60 : 30);
    const audioStream = this.audio?.getRecordingStream?.();
    for (const track of audioStream?.getAudioTracks?.() || []) stream.addTrack(track);
    const mimeType = supportedRecordingMime(this.MediaRecorderClass);
    const extension = recordingExtensionForMime(mimeType);
    this.recordingMetadata = tournament
      ? {
        ...tournament,
        recordingScope: recordingScope || tournament.scope,
        filename: filenameWithRecordingExtension(tournament.filename, extension),
      }
      : null;
    this.mediaRecorder = new this.MediaRecorderClass(stream, {
      mimeType,
      videoBitsPerSecond: Number(fps) === 60 ? 14_000_000 : 9_000_000,
      audioBitsPerSecond: 160_000,
    });
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) this.chunks.push(event.data);
    });
    this.mediaRecorder.addEventListener("stop", () => {
      if (this.cancelled) return;
      this.completedDuration = this.elapsed();
      this.blob = new Blob(this.chunks, { type: mimeType || "video/mp4" });
      this.url = this.createObjectURL(this.blob);
      this.machine.transition("complete");
      this.onStateChange(this.machine.state, this.result());
    });
    this.mediaRecorder.addEventListener("error", () => {
      this.machine.transition("fail");
      this.onStateChange(this.machine.state);
    });
    this.startedAt = this.now();
    // Keep the battle in one segment so the selected container is finalized as
    // one complete, seekable recording when stop() flushes the encoder.
    this.mediaRecorder.start();
    return true;
  }

  stop() {
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") return;
    if (this.machine.state === RECORDER_STATES.RECORDING) this.machine.transition("stop");
    else this.machine.state = RECORDER_STATES.STOPPING;
    this.onStateChange(this.machine.state);
    this.mediaRecorder.stop();
  }

  cancel() {
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") return;
    this.cancelled = true;
    if (this.machine.state === RECORDER_STATES.RECORDING) this.machine.transition("cancel");
    else this.machine.state = RECORDER_STATES.CANCELLED;
    this.mediaRecorder.stop();
    this.onStateChange(this.machine.state);
    this.release();
  }

  elapsed() {
    if (this.completedDuration) return this.completedDuration;
    return this.startedAt ? Math.max(0, (this.now() - this.startedAt) / 1000) : 0;
  }

  result() {
    return {
      blob: this.blob,
      url: this.url,
      duration: this.elapsed(),
      mimeType: this.blob?.type || "",
      metadata: this.recordingMetadata ? { ...this.recordingMetadata } : null,
      filename: this.recordingMetadata?.filename || null,
      recordingScope: this.recordingMetadata?.recordingScope || this.recordingMetadata?.scope || null,
    };
  }

  reset() {
    if (this.machine.state !== RECORDER_STATES.IDLE) this.machine.transition("reset");
    this.release();
    this.onStateChange(this.machine.state);
  }

  release() {
    if (this.url) this.revokeObjectURL(this.url);
    this.url = "";
    this.blob = null;
    this.chunks = [];
    this.mediaRecorder = null;
    this.startedAt = 0;
    this.completedDuration = 0;
    this.recordingMetadata = null;
  }
}
