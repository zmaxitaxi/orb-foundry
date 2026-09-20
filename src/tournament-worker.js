import { createSimulation, stepSimulation } from "./simulation.js";
import {
  createTournament,
  createTournamentBatchReport,
  currentTournamentMatch,
  deriveTournamentBatchSeed,
  finalizeTournamentBatchReport,
  recordTournamentInBatch,
  recordTournamentResult,
  tournamentMatchEntrants,
} from "./tournament.js";

const FIXED_STEP = 1 / 120;
const MAX_STEPS = 120 * 240;

self.addEventListener("message", (event) => {
  if (event.data?.type !== "run") return;
  try {
    const config = normalizeBatchConfig(event.data.config);
    const report = createTournamentBatchReport(config);
    for (let tournamentIndex = 0; tournamentIndex < config.requested; tournamentIndex += 1) {
      const tournament = simulateTournament(config, tournamentIndex);
      recordTournamentInBatch(report, tournament);
      if ((tournamentIndex + 1) % 2 === 0 || tournamentIndex + 1 === config.requested) {
        self.postMessage({
          type: "progress",
          completed: tournamentIndex + 1,
          requested: config.requested,
        });
      }
    }
    self.postMessage({ type: "complete", report: finalizeTournamentBatchReport(report) });
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : String(error) });
  }
});

function simulateTournament(config, tournamentIndex) {
  const tournamentSeed = deriveTournamentBatchSeed(config.seed, tournamentIndex);
  const tournament = createTournament({
    size: config.size,
    roster: config.roster,
    seed: tournamentSeed,
  });

  while (!tournament.completed) {
    const match = currentTournamentMatch(tournament);
    const entrants = tournamentMatchEntrants(tournament, match);
    const sim = createSimulation({
      count: 2,
      classes: entrants.map((entrant) => entrant.type),
      seed: match.seed,
      balance: config.balance,
      hazardPreset: config.hazardPreset,
      features: { replay: false, hazards: config.hazardsEnabled },
    });
    for (let step = 0; step < MAX_STEPS && !sim.finished; step += 1) {
      stepSimulation(sim, FIXED_STEP);
    }
    const winnerIndex = chooseWinnerIndex(sim);
    recordTournamentResult(tournament, winnerIndex, sim.analytics, {
      weaponHits: sim.weaponHits,
      hazardInteractions: Object.values(sim.analytics?.hazards || {}).reduce((sum, value) => sum + value, 0),
    });
  }
  return tournament;
}

function chooseWinnerIndex(sim) {
  if (sim.winner) return sim.winner.id === "fighter-1" ? 1 : 0;
  const ordered = [...sim.fighters].sort((a, b) => b.health - a.health || b.damageDone - a.damageDone || a.id.localeCompare(b.id));
  return ordered[0]?.id === "fighter-1" ? 1 : 0;
}

function normalizeBatchConfig(input = {}) {
  const requested = Math.max(100, Math.min(1000, Math.floor(Number(input.requested) || 100)));
  const roster = Array.isArray(input.roster) ? [...new Set(input.roster)].filter(Boolean) : [];
  if (roster.length < 2) throw new Error("Select at least two orb classes");
  return {
    requested,
    size: Number(input.size) === 16 ? 16 : 8,
    seed: Math.max(1, Math.floor(Number(input.seed) || 2406)),
    roster,
    balance: input.balance || null,
    hazardPreset: input.hazardPreset || "none",
    hazardsEnabled: input.hazardsEnabled !== false,
  };
}
