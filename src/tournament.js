import { SeededRandom } from "./simulation.js";

export function createTournament({ size = 8, roster = [], seed = 2406 } = {}) {
  const bracketSize = Number(size) === 16 ? 16 : 8;
  const classes = roster.length ? roster : ["fire", "ice", "wizard", "time"];
  const bracketSeed = deriveBracketSeed(seed);
  const rng = new SeededRandom(bracketSeed);
  const entrants = Array.from({ length: bracketSize }, (_, index) => ({
    id: `entrant-${index}`,
    slot: index,
    type: classes[index % classes.length],
  }));

  for (let index = entrants.length - 1; index > 0; index -= 1) {
    const other = Math.floor(rng.next() * (index + 1));
    [entrants[index], entrants[other]] = [entrants[other], entrants[index]];
  }
  entrants.forEach((entrant, index) => {
    entrant.slot = index;
  });

  const rounds = [];
  let matchCount = bracketSize / 2;
  let roundIndex = 0;
  while (matchCount >= 1) {
    rounds.push({
      name: roundName(bracketSize, roundIndex),
      matches: Array.from({ length: matchCount }, (_, index) => ({
        id: `round-${roundIndex}-match-${index}`,
        entrants: roundIndex === 0 ? [entrants[index * 2].id, entrants[index * 2 + 1].id] : [],
        winnerId: null,
        seed: deriveMatchSeed(seed, roundIndex, index),
        duration: 0,
      })),
    });
    matchCount /= 2;
    roundIndex += 1;
  }

  return {
    size: bracketSize,
    seed,
    bracketSeed,
    entrants,
    rounds,
    currentRound: 0,
    currentMatch: 0,
    championId: null,
    completed: false,
    totals: { matches: 0, duration: 0, weaponHits: 0, hazardInteractions: 0 },
  };
}

export function currentTournamentMatch(tournament) {
  if (tournament.completed) return null;
  return tournament.rounds[tournament.currentRound]?.matches[tournament.currentMatch] ?? null;
}

export function tournamentMatchEntrants(tournament, match = currentTournamentMatch(tournament)) {
  if (!match) return [];
  return match.entrants.map((id) => tournament.entrants.find((entrant) => entrant.id === id));
}

export function recordTournamentResult(tournament, winnerIndex, analytics, simStats = {}) {
  const match = currentTournamentMatch(tournament);
  const entrants = tournamentMatchEntrants(tournament, match);
  if (!match || entrants.length !== 2) throw new Error("Tournament has no active match");
  const winner = entrants[winnerIndex === 1 ? 1 : 0];
  match.winnerId = winner.id;
  match.duration = analytics?.duration ?? 0;
  tournament.totals.matches += 1;
  tournament.totals.duration += analytics?.duration ?? 0;
  tournament.totals.weaponHits += simStats.weaponHits ?? 0;
  tournament.totals.hazardInteractions += simStats.hazardInteractions ?? 0;

  const nextRound = tournament.rounds[tournament.currentRound + 1];
  if (nextRound) {
    const nextMatch = nextRound.matches[Math.floor(tournament.currentMatch / 2)];
    nextMatch.entrants.push(winner.id);
  } else {
    tournament.championId = winner.id;
    tournament.completed = true;
    return tournament;
  }

  tournament.currentMatch += 1;
  if (tournament.currentMatch >= tournament.rounds[tournament.currentRound].matches.length) {
    tournament.currentRound += 1;
    tournament.currentMatch = 0;
  }
  return tournament;
}

export function deriveMatchSeed(seed, roundIndex, matchIndex) {
  return ((Number(seed) >>> 0) * 2654435761 + (roundIndex + 1) * 1013904223 + matchIndex * 1664525) >>> 0;
}

export function deriveTournamentBatchSeed(seed, tournamentIndex) {
  return mixSeed((Number(seed) >>> 0) + Math.imul(Number(tournamentIndex) + 1, 0x9e3779b9));
}

export function deriveBracketSeed(seed) {
  return mixSeed((Number(seed) >>> 0) ^ 0xa511e9b3);
}

export function createTournamentBatchReport({ requested = 100, size = 8, seed = 2406, roster = [] } = {}) {
  const classes = [...new Set(roster)];
  return {
    requested,
    completed: 0,
    size: Number(size) === 16 ? 16 : 8,
    seed: Number(seed) >>> 0,
    totalMatches: 0,
    totalDuration: 0,
    classes: Object.fromEntries(classes.map((type) => [type, {
      type,
      entries: 0,
      championships: 0,
      finals: 0,
      matchWins: 0,
      matchLosses: 0,
    }])),
  };
}

export function recordTournamentInBatch(report, tournament) {
  if (!tournament?.completed) throw new Error("Cannot aggregate an incomplete tournament");
  report.completed += 1;
  report.totalMatches += tournament.totals.matches;
  report.totalDuration += tournament.totals.duration;

  for (const entrant of tournament.entrants) {
    const stats = ensureBatchClass(report, entrant.type);
    stats.entries += 1;
    if (entrant.id === tournament.championId) stats.championships += 1;
  }

  const finalMatch = tournament.rounds.at(-1)?.matches[0];
  for (const entrantId of finalMatch?.entrants || []) {
    const entrant = tournament.entrants.find((candidate) => candidate.id === entrantId);
    if (entrant) ensureBatchClass(report, entrant.type).finals += 1;
  }

  for (const round of tournament.rounds) {
    for (const match of round.matches) {
      if (!match.winnerId) continue;
      for (const entrantId of match.entrants) {
        const entrant = tournament.entrants.find((candidate) => candidate.id === entrantId);
        if (!entrant) continue;
        const stats = ensureBatchClass(report, entrant.type);
        if (entrantId === match.winnerId) stats.matchWins += 1;
        else stats.matchLosses += 1;
      }
    }
  }
  return report;
}

export function finalizeTournamentBatchReport(report) {
  const roundsToTitle = Math.log2(report.size);
  const rankings = Object.values(report.classes).map((stats) => {
    const matches = stats.matchWins + stats.matchLosses;
    const matchWinRate = matches ? stats.matchWins / matches : 0;
    const championshipRate = stats.entries ? stats.championships / stats.entries : 0;
    const finalRate = stats.entries ? stats.finals / stats.entries : 0;
    const averageWins = stats.entries ? stats.matchWins / stats.entries : 0;
    const advancementRate = roundsToTitle ? averageWins / roundsToTitle : 0;
    return {
      ...stats,
      matches,
      matchWinRate,
      championshipRate,
      finalRate,
      averageWins,
      advancementRate,
    };
  }).sort((a, b) => (
    b.matchWinRate - a.matchWinRate ||
    b.championshipRate - a.championshipRate ||
    b.averageWins - a.averageWins ||
    a.type.localeCompare(b.type)
  ));

  return {
    ...report,
    rankings,
    strongestType: rankings[0]?.type ?? null,
    weakestType: rankings.at(-1)?.type ?? null,
  };
}

function ensureBatchClass(report, type) {
  return report.classes[type] ||= {
    type,
    entries: 0,
    championships: 0,
    finals: 0,
    matchWins: 0,
    matchLosses: 0,
  };
}

function roundName(size, index) {
  const remaining = size / 2 ** index;
  if (remaining === 2) return "CHAMPIONSHIP";
  if (remaining === 4) return "SEMIFINALS";
  if (remaining === 8) return "QUARTERFINALS";
  return "ROUND OF 16";
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
