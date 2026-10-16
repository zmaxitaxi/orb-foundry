export const PRESENTATION_TIMING = Object.freeze({
  matchup: 0.16,
  battle: 2.51,
});

const CUES = Object.freeze([
  { at: PRESENTATION_TIMING.matchup, cue: "matchup" },
]);

export function createPresentationTimeline(enabled = true) {
  return {
    enabled,
    elapsed: enabled ? -0.001 : PRESENTATION_TIMING.battle,
    nextCueIndex: enabled ? 0 : CUES.length,
    phase: "battle",
    phaseProgress: 1,
    countdown: 0,
  };
}

export function advancePresentationTimeline(state, elapsed) {
  if (!state.enabled || state.nextCueIndex >= CUES.length) return { state, cues: [] };
  const next = {
    ...state,
    elapsed: Math.min(PRESENTATION_TIMING.battle, state.elapsed + Math.max(0, Number(elapsed) || 0)),
  };
  const cues = [];
  while (next.nextCueIndex < CUES.length && CUES[next.nextCueIndex].at <= next.elapsed + 1e-6) {
    cues.push(CUES[next.nextCueIndex].cue);
    next.nextCueIndex += 1;
  }
  return { state: next, cues };
}

export function presentationAtTime() {
  return { phase: "battle", phaseProgress: 1, countdown: 0 };
}

export function tournamentMatchAnnouncerShouldPlay({
  phase = "",
  matchKey = "",
  announcedMatchKey = null,
} = {}) {
  return phase === "battle" && Boolean(matchKey) && matchKey !== announcedMatchKey;
}
