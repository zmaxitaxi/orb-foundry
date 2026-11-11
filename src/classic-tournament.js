import { CLASSIC_ORB_IDS, CLASSIC_ORBS } from "./classic-orbs.js?v=20261110-shared-lunge2";
import { SeededRandom } from "./simulation.js?v=20261110-shared-lunge2";

export const CLASSIC_TOURNAMENT_SIZES = Object.freeze([4, 8, 16, 32]);
export const CLASSIC_TOURNAMENT_MODE = "classic-tournament";
export const CLASSIC_TOURNAMENT_MATCH_LIMIT = 180;

function shuffled(values, rng) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const next = Math.floor(rng.range(0, index + 1));
        [result[index], result[next]] = [result[next], result[index]];
    }
    return result;
}

export function normalizeClassicTournamentOptions(input, seed) {
    if (input !== true && (!input || typeof input !== "object" || input.enabled === false)) return null;
    const size = CLASSIC_TOURNAMENT_SIZES.includes(Number(input.size)) ? Number(input.size) : 8;
    const requested = Array.isArray(input.entrants) ? input.entrants : [];
    const entrants = [...new Set(requested.filter((id) => CLASSIC_ORB_IDS.includes(id)))].slice(0, size);
    const remaining = CLASSIC_ORB_IDS.filter((id) => !entrants.includes(id));
    entrants.push(...shuffled(remaining, new SeededRandom(seed)).slice(0, size - entrants.length));
    const roster = new Set(entrants);
    return { size, entrants: CLASSIC_ORB_IDS.filter((id) => roster.has(id)) };
}

export function createClassicTournament(options, seed) {
    const normalized = normalizeClassicTournamentOptions(options, seed);
    if (!normalized) return null;
    const { size, entrants } = normalized;
    const rng = new SeededRandom(seed);
    const bracket = shuffled(entrants, rng);
    const rounds = Array.from({ length: Math.log2(size) }, (_, roundIndex) => {
        const remaining = size / 2 ** roundIndex;
        const label = ({ 2: "Final", 4: "Semifinals", 8: "Quarterfinals" })[remaining] || `Round of ${remaining}`;
        return {
            label,
            matches: Array.from({ length: remaining / 2 }, (_, matchIndex) => ({
                seed: Math.floor(rng.range(1, 999_999_999)),
                orbIds: roundIndex === 0 ? bracket.slice(matchIndex * 2, matchIndex * 2 + 2) : [null, null],
                winnerId: null,
            })),
        };
    });
    return { size, entrants, rounds, roundIndex: 0, matchIndex: 0, completedMatches: 0, lastResult: null, championId: null };
}

export function activeClassicTournamentMatch(tournament) {
    if (!tournament || tournament.championId) return null;
    return tournament.rounds[tournament.roundIndex].matches[tournament.matchIndex];
}

export function finishClassicTournamentMatch(tournament, sim) {
    const match = activeClassicTournamentMatch(tournament);
    if (!match || sim.seed !== match.seed || (!sim.finished && sim.time < CLASSIC_TOURNAMENT_MATCH_LIMIT)) return null;
    const [left, right] = match.orbIds;
    let winnerId = sim.finished && sim.winner?.alive && match.orbIds.includes(sim.winner.type) ? sim.winner.type : null;
    let reason = "Knockout";
    if (!winnerId) {
        const [a, b] = match.orbIds.map((id) => {
            const fighter = sim.fighters.find(({ type, classicIsDuplicate }) => type === id && !classicIsDuplicate);
            return {
                health: fighter?.alive && fighter.maxHealth > 0 ? fighter.health / fighter.maxHealth : 0,
                damage: fighter?.damageDone || 0,
            };
        });
        const difference = a.health - b.health || a.damage - b.damage;
        winnerId = difference >= 0 ? left : right;
        reason = difference ? "Decision" : "Seed tiebreak";
    }
    const { roundIndex, matchIndex } = tournament;
    const round = tournament.rounds[roundIndex];
    const nextRound = tournament.rounds[roundIndex + 1];
    Object.assign(match, { winnerId, reason, duration: sim.time });
    tournament.lastResult = { ...match, roundLabel: round.label };
    tournament.completedMatches += 1;
    if (!nextRound) {
        tournament.championId = winnerId;
    } else {
        nextRound.matches[Math.floor(matchIndex / 2)].orbIds[matchIndex % 2] = winnerId;
        if (matchIndex + 1 < round.matches.length) tournament.matchIndex += 1;
        else {
            tournament.roundIndex += 1;
            tournament.matchIndex = 0;
        }
    }
    return tournament.lastResult;
}

export function classicTournamentOrbName(id) {
    return CLASSIC_ORBS[id]?.name || "TBD";
}
