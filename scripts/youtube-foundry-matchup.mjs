import { CLASSIC_ORBS, classicTeamDisplayName } from "../src/classic-orbs.js";
import { createSimulation, stepSimulation } from "../src/simulation.js";
import { socialActionPlaybackRateForDuration } from "../src/social.js";

const SIMULATION_STEP_SECONDS = 1 / 120;
const PLANNING_ENTITY_CHECK_STEPS = 15;
const MAX_PLANNING_SPAWNED_ENTITIES = 2_000;
const MAX_FOUNDRY_SHORT_HEALTH = 500;
const MAX_FOUNDRY_LONGFORM_HEALTH = 2_000;
const MAX_LONGFORM_DUPLICATES = 24;
const BOSS_CHALLENGER_HEALTH_SCALES = [3, 1.5, 4.5, 0.75];
const PREFERRED_BOSS_PLAYBACK_RATE = 0.45;
const EXTRA_CANDIDATES_AFTER_QUALIFYING = 8;
const FOUNDRY_SPECIAL_PHASES = new Set(["release", "guard", "evade"]);
const FOUNDRY_FORM_CUES = new Set(["summon", "punch", "beam-hit", "pickaxe"]);
const FOUNDRY_DEFENSE_CUES = new Set(["dodge", "limitless", "shield-block", "diamond-guard", "omnitrix-transform"]);
const ONE_PUNCH_MAN_ATTACK_CUES = new Set(["punch", "barrage-hit", "shockwave-hit", "serious"]);

export function isFoundryBossSlot(dateKey, slotId, quality) {
    const boss = quality.fridayBossBattle;
    return boss?.slotId === slotId
        && new Date(`${dateKey}T12:00:00.000Z`).getUTCDay() === boss.dayOfWeek;
}

export function foundryRecordingRules(quality, contentType, bossBattle = false) {
    const layout = contentType === "longform" ? quality.orbFoundryLongform : quality.orbFoundryShort;
    const boss = bossBattle ? quality.fridayBossBattle : null;
    return {
        format: layout.format,
        maximumSimulationSeconds: layout.maximumSimulationSeconds,
        minimumDurationSeconds: boss?.minimumDurationSeconds ?? quality.minimumDurationSeconds[contentType],
        minimumPlaybackRate: boss?.minimumPlaybackRate ?? layout.minimumPlaybackRate ?? 1,
    };
}

export function foundryTeamHealthFraction(fighters, team, options) {
    if (!team || !Array.isArray(fighters)) return null;
    let remaining = 0;
    let starting = 0;
    for (const id of team) {
        const fighter = fighters.find(({ type, classicIsDuplicate }) => type === id && !classicIsDuplicate);
        if (!fighter || !Number.isFinite(fighter.health) || !(options?.[id]?.health > 0)) return null;
        remaining += fighter.alive ? fighter.health : 0;
        starting += options[id].health;
    }
    return starting > 0 ? remaining / starting : null;
}

export function foundryBattlePassesQuality(battle, classicTeams, quality, rules) {
    const foundry = quality.orbFoundryShort;
    const minActionSeconds = rules.minimumDurationSeconds * 1.05;
    if (battle?.finished !== true || battle.runaway || battle.fallback
        || ![0, 1].includes(battle.winnerTeamIndex)
        || !Number.isFinite(battle.simulatedSeconds)
        || battle.simulatedSeconds <= 0 || battle.simulatedSeconds > rules.maximumSimulationSeconds + 0.01
        || !Number.isFinite(battle.actionPlaybackRate)
        || battle.actionPlaybackRate < rules.minimumPlaybackRate || battle.actionPlaybackRate > 1
        || !Number.isFinite(battle.plannedActionDurationSeconds)
        || battle.plannedActionDurationSeconds + 0.05 < minActionSeconds
        || Math.abs(battle.plannedActionDurationSeconds - battle.simulatedSeconds / battle.actionPlaybackRate) > 0.05
        || !Number.isInteger(battle.signatureMoments)
        || battle.signatureMoments < foundry.minimumSignatureMoments) return false;
    const punchManIndex = classicTeams.findIndex((team) => team.includes("one-punch-man"));
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

export function preflightFoundryCandidates({ candidates, arenaShape, quality, contentType, bossBattle }) {
    const rules = foundryRecordingRules(quality, contentType, bossBattle);
    const preferredRate = bossBattle ? PREFERRED_BOSS_PLAYBACK_RATE : 1;
    let best = null;
    let stopAt = candidates.length;
    for (let index = 0; index < stopAt; index += 1) {
        const { classicTeams, seed } = candidates[index];
        const { battleQuality, classicOrbOptions } = evaluateFoundryYouTubeBattle({
            classicTeams, seed, arenaShape, quality, rules, contentType, bossBattle,
        });
        if (!battleQuality.accepted || (best && battleQuality.simulatedSeconds <= best.battleQuality.simulatedSeconds)) continue;
        const matchup = {
            contentSource: "orb-foundry",
            videoKind: bossBattle ? "boss-battle" : "match",
            seed,
            classicTeams,
            orbFoundryOrbs: classicTeams.flat(),
            leftId: classicTeams[0][0],
            rightId: classicTeams[1][0],
            left: classicTeamDisplayName(classicTeams[0], classicOrbOptions),
            right: classicTeamDisplayName(classicTeams[1], classicOrbOptions),
            classicOrbOptions,
            foundryStyle: {
                ...quality.orbFoundryShort,
                format: rules.format,
                maximumSimulationSeconds: rules.maximumSimulationSeconds,
                arenaShape,
            },
            battleQuality,
        };
        if (battleQuality.actionPlaybackRate >= preferredRate) return matchup;
        if (!best) stopAt = Math.min(stopAt, index + 1 + EXTRA_CANDIDATES_AFTER_QUALIFYING);
        best = matchup;
    }
    return best;
}

function evaluateFoundryYouTubeBattle({ classicTeams, seed, arenaShape, quality, rules, contentType, bossBattle }) {
    const foundry = quality.orbFoundryShort;
    const orbIds = classicTeams.flat();
    const baseHealth = orbIds.map((id) => CLASSIC_ORBS[id].defaultHealth);
    const targetDuration = rules.minimumDurationSeconds * 1.05;
    const maxSteps = Math.ceil(rules.maximumSimulationSeconds / SIMULATION_STEP_SECONDS);
    const healthLimit = contentType === "short" ? MAX_FOUNDRY_SHORT_HEALTH : MAX_FOUNDRY_LONGFORM_HEALTH;
    const adjustments = bossBattle ? BOSS_CHALLENGER_HEALTH_SCALES.length : 5;
    let health = baseHealth;
    let lastResult = null;
    let slowerMatch = null;
    for (let adjustment = 0; adjustment < adjustments; adjustment += 1) {
        if (bossBattle) {
            health = baseHealth.map((value, index) => index === 0
                ? value * quality.fridayBossBattle.healthMultiplier
                : Math.round(value * BOSS_CHALLENGER_HEALTH_SCALES[adjustment]));
        }
        const classicOrbOptions = Object.fromEntries(orbIds.map((id, index) => [id, {
            health: health[index],
            orbScale: 1.25,
            ...(bossBattle && index === 0 ? { boss: true } : {}),
        }]));
        const sim = createSimulation({
            gameplayMode: "classic",
            classes: orbIds,
            classicTeams,
            classicOrbOptions,
            classicBlackTheme: true,
            classicTeamColors: false,
            arenaSize: foundry.arenaSize,
            arenaShape,
            hazardPreset: "none",
            seed,
            social: { enabled: true, format: rules.format },
            features: { replay: false },
        });
        const action = { signatureMoments: 0, dodges: 0, lastDodgeAt: null, attackCues: new Set() };
        let runaway = false;
        for (let step = 0; step < maxSteps && !sim.finished; step += 1) {
            const nextEventId = sim.nextEventId;
            stepSimulation(sim, SIMULATION_STEP_SECONDS);
            if (step % PLANNING_ENTITY_CHECK_STEPS === 0
                && (sim.fighters.length + sim.classicEntities.length + sim.projectiles.length > MAX_PLANNING_SPAWNED_ENTITIES
                    || (contentType === "longform" && sim.fighters.length > orbIds.length + MAX_LONGFORM_DUPLICATES))) {
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
        const winnerTeamIndex = Number.isInteger(winner?.classicTeamIndex) ? winner.classicTeamIndex : null;
        const winnerHealthFraction = foundryTeamHealthFraction(sim.fighters, classicTeams[winnerTeamIndex], classicOrbOptions);
        const simulatedSeconds = Number(sim.time.toFixed(3));
        const actionPlaybackRate = contentType === "longform"
            ? socialActionPlaybackRateForDuration(simulatedSeconds, targetDuration) : 1;
        const battleQuality = {
            fallback: false,
            runaway,
            finished: sim.finished && !runaway,
            winnerTeamIndex,
            winnerHealthFraction,
            simulatedSeconds,
            plannedActionDurationSeconds: simulatedSeconds / actionPlaybackRate,
            actionPlaybackRate,
            signatureMoments: action.signatureMoments,
            dodges: action.dodges,
            secondsSinceLastDodge: action.lastDodgeAt === null ? null : sim.time - action.lastDodgeAt,
            attackVariety: action.attackCues.size,
        };
        battleQuality.accepted = foundryBattlePassesQuality(battleQuality, classicTeams, quality, rules);
        lastResult = { battleQuality, classicOrbOptions };
        if (battleQuality.accepted) {
            if (bossBattle || actionPlaybackRate === 1) return lastResult;
            if (!slowerMatch || actionPlaybackRate > slowerMatch.battleQuality.actionPlaybackRate) slowerMatch = lastResult;
        }
        if (bossBattle) continue;
        if (runaway) break;

        const lengthScale = !sim.finished ? 0.65
            : simulatedSeconds < targetDuration ? targetDuration * 1.20 / Math.max(2, simulatedSeconds) : 1;
        const adjusted = health.map((current, index) => {
            if (orbIds[index] === "one-punch-man") return 1;
            const projected = index === battleQuality.winnerTeamIndex && winnerHealthFraction > foundry.maximumWinnerHealthFraction
                ? Math.min(current, (winner.maxHealth - winner.health) / 0.78)
                : current;
            return Math.max(15, Math.min(healthLimit, Math.round(projected * lengthScale)));
        });
        if (adjusted.every((value, index) => value === health[index])) break;
        health = adjusted;
    }
    return slowerMatch || lastResult;
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
