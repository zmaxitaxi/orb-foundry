import { CLASSIC_ORBS } from "../src/classic-orbs.js";
import { createSimulation, stepSimulation } from "../src/simulation.js";

const SIMULATION_STEP_SECONDS = 1 / 120;
const PLANNING_ENTITY_CHECK_STEPS = 15;
const MAX_PLANNING_SPAWNED_ENTITIES = 2_000;
const MAX_FOUNDRY_STARTING_HEALTH = 500;
const FOUNDRY_SPECIAL_PHASES = new Set(["release", "guard", "evade"]);
const FOUNDRY_FORM_CUES = new Set(["summon", "punch", "beam-hit", "pickaxe"]);
const FOUNDRY_DEFENSE_CUES = new Set(["dodge", "limitless", "shield-block", "diamond-guard", "omnitrix-transform"]);
const ONE_PUNCH_MAN_ATTACK_CUES = new Set(["punch", "barrage-hit", "shockwave-hit", "serious"]);

export function foundryBattlePassesQuality(battle, orbIds, quality) {
    const foundry = quality.orbFoundryShort;
    const minActionSeconds = Number(quality.minimumDurationSeconds.short) * 1.05;
    if (battle?.finished !== true || battle.runaway || battle.fallback
        || ![0, 1].includes(battle.winnerTeamIndex)
        || !Number.isFinite(battle.simulatedSeconds)
        || battle.simulatedSeconds + 0.05 < minActionSeconds
        || battle.simulatedSeconds > foundry.maximumSimulationSeconds + 0.01
        || !Number.isFinite(battle.plannedActionDurationSeconds)
        || battle.plannedActionDurationSeconds + 0.05 < minActionSeconds
        || !Number.isInteger(battle.signatureMoments)
        || battle.signatureMoments < foundry.minimumSignatureMoments) return false;
    const punchManIndex = orbIds.indexOf("one-punch-man");
    if (punchManIndex >= 0) {
        const { minimumDodges, maximumSecondsSinceLastDodge, minimumAttackVariety } = foundry.onePunchManShowcase;
        return battle.winnerTeamIndex === punchManIndex
            && battle.winnerHealthFraction === 1
            && Number.isInteger(battle.dodges) && battle.dodges >= minimumDodges
            && Number.isFinite(battle.secondsSinceLastDodge)
            && battle.secondsSinceLastDodge >= 0 && battle.secondsSinceLastDodge <= maximumSecondsSinceLastDodge
            && Number.isInteger(battle.attackVariety) && battle.attackVariety >= minimumAttackVariety;
    }
    return battle.winnerHealthFraction > 0
        && battle.winnerHealthFraction <= foundry.maximumWinnerHealthFraction;
}

export function preflightFoundryCandidates({ candidates, arenaShape, quality }) {
    for (const { leftId, rightId, seed } of candidates) {
        const { battleQuality, classicOrbOptions } = evaluateFoundryYouTubeBattle({ leftId, rightId, seed, arenaShape, quality });
        if (!battleQuality.accepted) continue;
        return {
            contentSource: "orb-foundry",
            videoKind: "match",
            seed,
            classicTeams: [[leftId], [rightId]],
            orbFoundryOrbs: [leftId, rightId],
            leftId,
            rightId,
            left: CLASSIC_ORBS[leftId].name,
            right: CLASSIC_ORBS[rightId].name,
            classicOrbOptions,
            foundryStyle: { ...quality.orbFoundryShort, arenaShape },
            battleQuality,
        };
    }
    return null;
}

function evaluateFoundryYouTubeBattle({ leftId, rightId, seed, arenaShape, quality }) {
    const foundry = quality.orbFoundryShort;
    const orbIds = [leftId, rightId];
    const targetDuration = Number(quality.minimumDurationSeconds.short) * 1.05;
    const maxSteps = Math.ceil(foundry.maximumSimulationSeconds / SIMULATION_STEP_SECONDS);
    let health = orbIds.map((id) => CLASSIC_ORBS[id].defaultHealth);
    let lastResult = null;
    for (let adjustment = 0; adjustment < 5; adjustment += 1) {
        const classicOrbOptions = Object.fromEntries(orbIds.map((id, index) => [id, {
            health: health[index],
            orbScale: 1.25,
        }]));
        const sim = createSimulation({
            gameplayMode: "classic",
            classes: orbIds,
            classicTeams: orbIds.map((id) => [id]),
            classicOrbOptions,
            classicBlackTheme: true,
            classicTeamColors: false,
            arenaSize: foundry.arenaSize,
            arenaShape,
            hazardPreset: "none",
            seed,
            social: { enabled: true, format: foundry.format },
            features: { replay: false },
        });
        const action = { signatureMoments: 0, dodges: 0, lastDodgeAt: null, attackCues: new Set() };
        let runaway = false;
        for (let step = 0; step < maxSteps && !sim.finished; step += 1) {
            const nextEventId = sim.nextEventId;
            stepSimulation(sim, SIMULATION_STEP_SECONDS);
            if (step % PLANNING_ENTITY_CHECK_STEPS === 0
                && sim.fighters.length + sim.classicEntities.length + sim.projectiles.length > MAX_PLANNING_SPAWNED_ENTITIES) {
                runaway = true;
                break;
            }
            // Classic keeps a rolling event buffer. Count cues as they happen so
            // a long fight cannot lose its earlier signature actions.
            const start = Math.max(0, sim.events.length - (sim.nextEventId - nextEventId));
            for (let index = start; index < sim.events.length; index += 1) {
                countFoundryAction(action, sim.events[index]);
            }
        }
        const winner = sim.winner;
        const winnerHealthFraction = winner && Number(winner.maxHealth) > 0
            ? Number(winner.health) / Number(winner.maxHealth)
            : null;
        const simulatedSeconds = Number(sim.time.toFixed(3));
        const battleQuality = {
            fallback: false,
            runaway,
            finished: sim.finished && !runaway,
            winnerTeamIndex: Number.isInteger(winner?.classicTeamIndex) ? winner.classicTeamIndex : null,
            winnerHealthFraction,
            simulatedSeconds,
            plannedActionDurationSeconds: simulatedSeconds,
            actionPlaybackRate: 1,
            signatureMoments: action.signatureMoments,
            dodges: action.dodges,
            secondsSinceLastDodge: action.lastDodgeAt === null ? null : sim.time - action.lastDodgeAt,
            attackVariety: action.attackCues.size,
        };
        battleQuality.accepted = foundryBattlePassesQuality(battleQuality, orbIds, quality);
        lastResult = { battleQuality, classicOrbOptions };
        if (battleQuality.accepted || runaway) return lastResult;

        const lengthScale = !sim.finished ? 0.65
            : simulatedSeconds < targetDuration ? targetDuration * 1.20 / Math.max(2, simulatedSeconds) : 1;
        const adjusted = health.map((current, index) => {
            if (orbIds[index] === "one-punch-man") return 1;
            const projected = index === battleQuality.winnerTeamIndex && winnerHealthFraction > foundry.maximumWinnerHealthFraction
                ? Math.min(current, (winner.maxHealth - winner.health) / 0.78)
                : current;
            return Math.max(15, Math.min(MAX_FOUNDRY_STARTING_HEALTH, Math.round(projected * lengthScale)));
        });
        if (adjusted.every((value, index) => value === health[index])) break;
        health = adjusted;
    }
    return lastResult;
}

function countFoundryAction(action, event) {
    if ((event.type === "classic-power-cue" && FOUNDRY_SPECIAL_PHASES.has(event.phase))
        || (event.type === "classic-wdc-cue" && FOUNDRY_FORM_CUES.has(event.cue))
        || (event.type === "classic-pulse-cue" && (event.amount > 0 || FOUNDRY_DEFENSE_CUES.has(event.cue)))) {
        action.signatureMoments += 1;
    }
    if (event.type !== "classic-pulse-cue" || event.fighterType !== "one-punch-man") return;
    if (event.cue === "dodge" && event.sourceId && event.amountBlocked > 0) {
        action.dodges += 1;
        action.lastDodgeAt = event.time;
    }
    if (event.amount > 0 && ONE_PUNCH_MAN_ATTACK_CUES.has(event.cue)) action.attackCues.add(event.cue);
}
