#!/usr/bin/env node
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSIC_ORBS } from "../src/classic-orbs.js";
import { ORB_RACERS } from "../src/orb-race.js";
import { createSimulation, stepSimulation } from "../src/simulation.js";
import { socialActionPlaybackRateForDuration } from "../src/social.js";
import { exportSocialVideo } from "./export-random-battle.mjs";
import { transcodeBattleVideo } from "./transcode-battle-video.mjs";
import {
    YOUTUBE_CONFIG_PATH,
    dueYouTubeSlotsAt,
    loadYouTubePublishingConfig,
    localDateKey,
    scheduledPublishAt,
    youtubeDescription,
    youtubeFoundryMetadata,
    youtubeMetadata,
    youtubeRunTag,
    youtubeTournamentMetadata,
    validateYouTubeGenerationSpec,
    validateYouTubeExportArtifact,
} from "./youtube-publishing.mjs";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const DEFAULT_OUTPUT_ROOT = join(ROOT, "artifacts", "youtube");
const YOUTUBE_UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos";
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const RETRIABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 4;
const UPLOAD_CHUNK_SIZE = 8 * 1024 * 1024;
const SIMULATION_STEP_SECONDS = 1 / 120;
const MAX_MATCHUP_ATTEMPTS = 128;
const MAX_FOUNDRY_MATCHUP_ATTEMPTS = 48;
const DAILY_YOUTUBE_PLAN_CACHE = new Map();
const PLANNING_ENTITY_CHECK_STEPS = 15;
// Duplicator copies multiply from every copy. One 2026-10-08 long-form
// candidate crossed thousands of bodies inside the 180-second preflight and
// exhausted the heap before the attempt cap could matter.
const MAX_PLANNING_DUPLICATES = 32;
const MAX_PLANNING_SPAWNED_ENTITIES = 2_000;
const MAX_PLANNING_BOUNCE_EFFECTS = 4_000;
const PLANNING_SPAWN_KEYS = Object.freeze([
    "raceDuplicateOrbs",
    "raceBouncerOrbs",
    "raceSnakeOrbs",
    "raceRealitySpawns",
    "raceTurrets",
    "raceTurretBombs",
    "raceDrillProjectiles",
    "raceBatarangProjectiles",
    "raceBatBombs",
    "raceBoomerangProjectiles",
    "raceMineProjectiles",
    "raceRicochetProjectiles",
    "raceSawbladeProjectiles",
    "raceHackerSpawnedOrbs",
    "raceParasites",
    "raceArtistSummons",
    "raceSniperBullets",
    "raceDraftBullets",
    "raceCommanderProjectiles",
    "raceShrapnelFragments",
    "racePancakeStacks",
    "raceRainDrops",
]);

export function seedForYouTubeRun(dateKey, slotId) {
    const input = `${dateKey}:${slotId}`;
    let hash = 2_166_136_261;
    for (const character of input) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16_777_619);
    }
    return (hash >>> 0) % 999_999_999 || 1;
}

export function selectYouTubeMatchup({
    dateKey,
    slotId,
    config,
    blockedIds = new Set(),
    rosterIds = null,
    formatId = null,
    maxAttempts = MAX_MATCHUP_ATTEMPTS,
}) {
    const roster = (rosterIds || config.videoReady.orbRace.orbs).filter((id) => ORB_RACERS[id]);
    if (roster.length < 2) throw new Error("The YouTube Orb Race allowlist needs at least two playable orbs.");
    const layerStrengths = layerStrengthsFor(config, slotId);
    const contentType = config.schedule.find(({ id }) => id === slotId)?.contentType || "short";
    const attemptLimit = Math.max(1, Math.floor(Number(maxAttempts)) || MAX_MATCHUP_ATTEMPTS);
    const candidates = [];
    for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
        const seed = seedForYouTubeRun(dateKey, `${slotId}:attempt-${attempt}`);
        const format = formatId
            ? config.quality.battleFormats.find((candidate) => candidate.id === formatId)
            : weightedBattleFormat(config.quality.battleFormats, seed);
        if (!format) throw new Error(`The YouTube schedule references an unknown battle format: ${formatId}.`);
        const orderedIds = availableRosterIds(roster, seed, blockedIds);
        const memberCount = format.teamSizes.reduce((sum, size) => sum + Number(size), 0);
        if (orderedIds.length < memberCount) continue;
        const leftIds = orderedIds.slice(0, Number(format.teamSizes[0]));
        const rightIds = orderedIds.slice(leftIds.length, leftIds.length + Number(format.teamSizes[1]));
        const raceTeams = [leftIds, rightIds];
        const preview = createYouTubeSimulation({
            raceTeams,
            raceOrbs: raceTeams.flat(),
            layerStrengths,
            contentType,
            seed,
        });
        const estimatedDamagePerSecond = preview.raceTeams.map((team) => Math.max(0, Number(team.raceDamagePerSecond) || 0));
        const positiveDamage = estimatedDamagePerSecond.filter((value) => value > 0);
        const estimatedStrengthRatio = positiveDamage.length === 2
            ? Math.max(...positiveDamage) / Math.max(1, Math.min(...positiveDamage))
            : 1;
        candidates.push({
            seed,
            formatId: format.id,
            raceTeams,
            raceOrbs: [...new Set(raceTeams.flat())],
            leftIds,
            rightIds,
            leftId: leftIds[0],
            rightId: rightIds[0],
            left: teamLabel(leftIds),
            right: teamLabel(rightIds),
            estimatedDamagePerSecond,
            estimatedStrengthRatio,
        });
    }

    candidates.sort((left, right) => (
        left.estimatedStrengthRatio - right.estimatedStrengthRatio
        || left.seed - right.seed
    ));
    let best = null;
    for (const candidate of candidates) {
        const battleQuality = evaluateYouTubeBattle({
            raceTeams: candidate.raceTeams,
            layerStrengths,
            contentType,
            seed: candidate.seed,
            quality: config.quality,
            estimatedDamagePerSecond: candidate.estimatedDamagePerSecond,
        });
        if (battleQuality.runaway) continue;
        const match = { ...candidate, battleQuality };
        delete match.estimatedDamagePerSecond;
        delete match.estimatedStrengthRatio;
        if (!best || matchupScore(match) < matchupScore(best)) best = match;
        if (battleQuality.accepted) return match;
    }
    if (best) {
        throw new Error(
            `No close YouTube matchup found for ${dateKey}/${slotId}; best progress margin was ${best.battleQuality.progressMargin}.`,
        );
    }
    throw new Error(`Unable to build a YouTube matchup for ${dateKey}/${slotId}.`);
}

export function dailyYouTubeRosterForDate({ dateKey, config }) {
    const roster = config.videoReady.orbRace.orbs.filter((id) => ORB_RACERS[id]);
    const maxTeamMembers = Math.max(...config.quality.battleFormats.map((format) => (
        format.teamSizes.reduce((sum, size) => sum + Number(size), 0)
    )));
    return deterministicDailyRoster(
        deterministicRosterOrder(roster),
        dateKey,
        Math.max(24, maxTeamMembers * 2),
    );
}

export function dailyOrbFoundryRosterForDate({ dateKey, config }) {
    const roster = config.videoReady.orbFoundry.orbs.filter((id) => CLASSIC_ORBS[id]);
    return deterministicDailyRoster(deterministicRosterOrder(roster), dateKey, 12);
}

export function selectedOrbFoundrySlotForDate({ dateKey, config }) {
    const shortSlots = config.schedule.filter((slot) => slot.contentType === "short");
    if (!shortSlots.length) return null;
    const dailyDraw = seedForYouTubeRun(dateKey, "orb-foundry-daily-chance-v1") % 10_000;
    if (dailyDraw >= Math.floor(Number(config.quality.orbFoundryShort.dailyProbability) * 10_000)) return null;
    const selectedIndex = seedForYouTubeRun(dateKey, "orb-foundry-short-slot-v1") % shortSlots.length;
    return shortSlots[selectedIndex].id;
}

export function isYouTubePacificFriday(dateKey) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(dateKey))
        && new Date(`${dateKey}T12:00:00.000Z`).getUTCDay() === 5;
}

export function buildDailyYouTubePlans({ dateKey, config, maxAttempts = MAX_MATCHUP_ATTEMPTS }) {
    const cacheKey = JSON.stringify([dateKey, maxAttempts, config]);
    if (DAILY_YOUTUBE_PLAN_CACHE.has(cacheKey)) {
        return structuredClone(DAILY_YOUTUBE_PLAN_CACHE.get(cacheKey));
    }
    const dailyRoster = dailyYouTubeRosterForDate({ dateKey, config });
    const foundryRoster = dailyOrbFoundryRosterForDate({ dateKey, config });
    const usedRaceIds = new Set();
    const matchupsBySlot = new Map();
    const tournamentConfig = config.quality.fridayTournament;
    const tournamentSlot = tournamentConfig.enabled && isYouTubePacificFriday(dateKey)
        ? config.schedule.find(({ id }) => id === tournamentConfig.slotId)
        : null;
    if (tournamentSlot) {
        const size = Number(tournamentConfig.entrants);
        if (dailyRoster.length < size) {
            throw new Error(`The Friday tournament needs ${size} approved Orb Race entrants in its daily roster.`);
        }
        const seed = seedForYouTubeRun(dateKey, `${tournamentSlot.id}:tournament-v1`);
        const entrants = availableRosterIds(dailyRoster, seed, usedRaceIds).slice(0, size);
        entrants.forEach((id) => usedRaceIds.add(id));
        matchupsBySlot.set(tournamentSlot.id, {
            slot: tournamentSlot,
            matchup: {
                contentSource: "orb-race",
                videoKind: "tournament",
                tournamentEntrants: entrants,
                raceOrbs: [...entrants],
                seed,
                battleQuality: { accepted: true, finished: true, fallback: false },
            },
        });
    }
    const foundrySlotId = selectedOrbFoundrySlotForDate({ dateKey, config });
    const planningOrder = [...config.schedule].sort((left, right) => (
        matchupPlanningPriority(left, foundrySlotId) - matchupPlanningPriority(right, foundrySlotId)
        || left.id.localeCompare(right.id)
    ));
    for (const slot of planningOrder) {
        if (matchupsBySlot.has(slot.id)) continue;
        if (slot.id === foundrySlotId) {
            const matchup = selectYouTubeFoundryMatchup({
                dateKey,
                slotId: slot.id,
                config,
                rosterIds: foundryRoster,
            });
            matchupsBySlot.set(slot.id, { slot, matchup });
            continue;
        }
        const matchup = selectYouTubeMatchup({
            dateKey,
            slotId: slot.id,
            config,
            blockedIds: usedRaceIds,
            rosterIds: dailyRoster,
            formatId: tournamentSlot ? "duel" : null,
            maxAttempts,
        });
        matchup.raceOrbs.forEach((id) => usedRaceIds.add(id));
        matchupsBySlot.set(slot.id, { slot, matchup });
    }
    const plans = config.schedule.map(({ id }) => matchupsBySlot.get(id));
    if (DAILY_YOUTUBE_PLAN_CACHE.size >= 8) {
        DAILY_YOUTUBE_PLAN_CACHE.delete(DAILY_YOUTUBE_PLAN_CACHE.keys().next().value);
    }
    DAILY_YOUTUBE_PLAN_CACHE.set(cacheKey, plans);
    return structuredClone(plans);
}

function matchupPlanningPriority(slot, foundrySlotId) {
    if (slot.id === foundrySlotId) return 4;
    const timePriority = slot.localTime === "12:00" ? 0 : 1;
    return slot.contentType === "longform" ? timePriority : timePriority + 2;
}

export function selectYouTubeFoundryMatchup({
    dateKey,
    slotId,
    config,
    blockedIds = new Set(),
    rosterIds = null,
    maxAttempts = MAX_FOUNDRY_MATCHUP_ATTEMPTS,
}) {
    const roster = (rosterIds || config.videoReady.orbFoundry.orbs).filter((id) => CLASSIC_ORBS[id]);
    if (roster.length < 2) throw new Error("The YouTube Orb Foundry allowlist needs at least two playable orbs.");
    const attemptLimit = Math.max(1, Math.floor(Number(maxAttempts)) || MAX_FOUNDRY_MATCHUP_ATTEMPTS);
    const seedBase = seedForYouTubeRun(dateKey, `${slotId}:foundry`);
    const orderedIds = availableRosterIds(roster, seedBase, blockedIds);
    let attempt = 0;
    for (let leftIndex = 0; leftIndex < orderedIds.length - 1 && attempt < attemptLimit; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < orderedIds.length && attempt < attemptLimit; rightIndex += 1) {
            const leftId = orderedIds[leftIndex];
            const rightId = orderedIds[rightIndex];
            const seed = seedForYouTubeRun(dateKey, `${slotId}:foundry-attempt-${attempt}`);
            attempt += 1;
            const battleQuality = evaluateFoundryYouTubeBattle({ leftId, rightId, seed, quality: config.quality });
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
                classicOrbOptions: {
                    [leftId]: { health: battleQuality.orbHealth, orbScale: 1.25 },
                    [rightId]: { health: battleQuality.orbHealth, orbScale: 1.25 },
                },
                foundryStyle: { ...config.quality.orbFoundryShort },
                battleQuality,
            };
        }
    }
    throw new Error(`Unable to build a close, duration-ready Orb Foundry matchup for ${dateKey}/${slotId}.`);
}

export function buildYouTubePublishPlan({ dateKey, slot, config, matchup = null, maxAttempts = MAX_MATCHUP_ATTEMPTS }) {
    const selectedMatchup = matchup || buildDailyYouTubePlans({ dateKey, config, maxAttempts })
        .find(({ slot: candidate }) => candidate.id === slot.id)?.matchup;
    if (!selectedMatchup) throw new Error(`YouTube slot ${slot.id} is not present in the publishing schedule.`);
    if (selectedMatchup.videoKind === "tournament") {
        const tournamentConfig = config.quality.fridayTournament;
        const entrants = [...selectedMatchup.tournamentEntrants];
        const layerStrengths = [...tournamentConfig.layerStrengths];
        const tournament = {
            enabled: true,
            entrantKind: "race",
            title: "Orb Race Tournament",
            size: entrants.length,
            entrants,
            seed: selectedMatchup.seed,
            seedingMode: "custom",
            seedOrder: entrants,
            recordingScope: "whole-tournament",
            recordingSelection: "whole-tournament",
            landscapeLayerCount: layerStrengths.length,
            layerStrengths,
            finalLayerHealth: layerStrengths.at(-1),
            matchSettings: {
                layerCount: layerStrengths.length,
                layerStrengths,
                finalLayerHealth: layerStrengths.at(-1),
            },
        };
        const metadata = youtubeTournamentMetadata({ entrants: entrants.length, config });
        const plan = {
            dateKey,
            slotId: slot.id,
            contentSource: "orb-race",
            videoKind: "tournament",
            contentType: slot.contentType,
            format: "race-landscape",
            scheduledPublishAt: scheduledPublishAt(dateKey, slot.localTime, config.timeZone),
            minimumDurationSeconds: Number(tournamentConfig.minimumDurationSeconds),
            actionPlaybackRate: 1,
            raceLayerStrengths: layerStrengths,
            announcerRequirements: { ...config.quality.announcer },
            runTag: youtubeRunTag(dateKey, slot.id),
            seed: selectedMatchup.seed,
            formatId: "tournament",
            tournament,
            raceTeams: [],
            raceOrbs: [...entrants],
            leftIds: [...entrants],
            rightIds: [],
            leftId: entrants[0],
            rightId: entrants[1],
            battleQuality: selectedMatchup.battleQuality,
            title: metadata.title,
            description: metadata.description,
            tags: ["physics", "shorts", "simulation", "satisfying", "orb", "orb-foundry", "tournament", youtubeRunTag(dateKey, slot.id)],
        };
        validateYouTubeGenerationSpec({ plan, config });
        return plan;
    }

    if (selectedMatchup.contentSource === "orb-foundry") {
        const metadata = youtubeFoundryMetadata({
            left: selectedMatchup.left,
            right: selectedMatchup.right,
            config,
        });
        const plan = {
            dateKey,
            slotId: slot.id,
            contentSource: "orb-foundry",
            videoKind: "match",
            contentType: slot.contentType,
            format: "square",
            scheduledPublishAt: scheduledPublishAt(dateKey, slot.localTime, config.timeZone),
            minimumDurationSeconds: Number(config.quality.minimumDurationSeconds[slot.contentType]),
            actionPlaybackRate: 1,
            raceLayerStrengths: [],
            announcerRequirements: { ...config.quality.announcer },
            runTag: youtubeRunTag(dateKey, slot.id),
            seed: selectedMatchup.seed,
            formatId: "orb-foundry-duel",
            classicTeams: selectedMatchup.classicTeams.map((team) => [...team]),
            orbFoundryOrbs: [...selectedMatchup.orbFoundryOrbs],
            classicOrbOptions: structuredClone(selectedMatchup.classicOrbOptions),
            foundryStyle: { ...selectedMatchup.foundryStyle },
            raceTeams: [],
            raceOrbs: [],
            leftIds: [selectedMatchup.leftId],
            rightIds: [selectedMatchup.rightId],
            leftId: selectedMatchup.leftId,
            rightId: selectedMatchup.rightId,
            left: selectedMatchup.left,
            right: selectedMatchup.right,
            battleQuality: selectedMatchup.battleQuality,
            title: metadata.title,
            description: metadata.description,
            tags: ["physics", "shorts", "simulation", "satisfying", "orb", "orb-foundry", youtubeRunTag(dateKey, slot.id)],
        };
        validateYouTubeGenerationSpec({ plan, config });
        return plan;
    }

    const metadata = youtubeMetadata({
        left: selectedMatchup.left,
        right: selectedMatchup.right,
        layerHealth: selectedMatchup.battleQuality.layerStrengths[0],
        config,
    });
    const runTag = youtubeRunTag(dateKey, slot.id);
    const minimumDurationSeconds = Number(config.quality.minimumDurationSeconds[slot.contentType]);
    const plan = {
        dateKey,
        slotId: slot.id,
        contentSource: "orb-race",
        videoKind: "match",
        contentType: slot.contentType,
        format: slot.contentType === "longform" ? "race-landscape" : "portrait",
        scheduledPublishAt: scheduledPublishAt(dateKey, slot.localTime, config.timeZone),
        minimumDurationSeconds,
        actionPlaybackRate: selectedMatchup.battleQuality.actionPlaybackRate,
        raceLayerStrengths: [...selectedMatchup.battleQuality.layerStrengths],
        announcerRequirements: { ...config.quality.announcer },
        runTag,
        seed: selectedMatchup.seed,
        formatId: selectedMatchup.formatId,
        raceTeams: selectedMatchup.raceTeams.map((team) => [...team]),
        raceOrbs: [...selectedMatchup.raceOrbs],
        leftIds: [...selectedMatchup.leftIds],
        rightIds: [...selectedMatchup.rightIds],
        leftId: selectedMatchup.leftIds[0],
        rightId: selectedMatchup.rightIds[0],
        left: selectedMatchup.left,
        right: selectedMatchup.right,
        battleQuality: selectedMatchup.battleQuality,
        title: metadata.title,
        description: metadata.description,
        tags: ["physics", "shorts", "simulation", "satisfying", "orb", "orb-foundry", runTag],
    };
    validateYouTubeGenerationSpec({ plan, config });
    return plan;
}

function layerStrengthsFor(config, slotId) {
    const contentType = config.schedule.find(({ id }) => id === slotId)?.contentType || "short";
    const layers = [...config.quality.layerStrengths[contentType]];
    if (contentType !== "longform") return layers;
    const targetCount = Number(config.quality.longformLayerCount) || layers.length;
    const lastIncrement = Math.max(1, layers.at(-1) - layers.at(-2));
    while (layers.length < targetCount) layers.push(layers.at(-1) + lastIncrement);
    return layers;
}

function weightedBattleFormat(formats, seed) {
    const totalWeight = formats.reduce((sum, format) => sum + Number(format.weight), 0);
    let cursor = (seed % Math.ceil(totalWeight)) + 1;
    for (const format of formats) {
        cursor -= Number(format.weight);
        if (cursor <= 0) return format;
    }
    return formats.at(-1);
}

function availableRosterIds(roster, seed, blockedIds) {
    const available = roster.filter((id) => !blockedIds.has(id));
    let state = seed >>> 0 || 1;
    for (let index = available.length - 1; index > 0; index -= 1) {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        const swapIndex = (state >>> 0) % (index + 1);
        [available[index], available[swapIndex]] = [available[swapIndex], available[index]];
    }
    return available;
}

function teamLabel(ids) {
    return ids.map((id) => ORB_RACERS[id].name).join(" + ");
}

function evaluateYouTubeBattle({ raceTeams, layerStrengths, contentType, seed, quality, estimatedDamagePerSecond }) {
    const damagePerSecond = estimatedDamagePerSecond;
    const positiveDamage = damagePerSecond.filter((value) => value > 0);
    const strengthRatio = positiveDamage.length === 2
        ? Math.max(...positiveDamage) / Math.max(1, Math.min(...positiveDamage))
        : 1;
    const maxLayerScale = Math.max(1, Number(quality.strongerTeamLayerScaleMax) || 1);
    const layerScale = Math.min(maxLayerScale, 1 + Math.log2(Math.max(1, strengthRatio)) * 0.15);
    const adjustedLayerStrengths = layerStrengths.map((value) => Math.max(
        Number(quality.minimumLayerHealth) || 500,
        Math.round(Number(value) * layerScale),
    ));
    const sim = createYouTubeSimulation({
        raceTeams,
        raceOrbs: raceTeams.flat(),
        layerStrengths: adjustedLayerStrengths,
        contentType,
        seed,
    });
    const maxSeconds = Math.max(30, Number(quality.closeBattle.maxSimulationSeconds) || 180);
    const maxSteps = Math.ceil(maxSeconds / SIMULATION_STEP_SECONDS);
    let runaway = false;
    for (let step = 0; step < maxSteps && !sim.finished; step += 1) {
        stepSimulation(sim, SIMULATION_STEP_SECONDS);
        if ((step + 1) % PLANNING_ENTITY_CHECK_STEPS === 0 && planningExceededEntityBudget(sim)) {
            runaway = true;
            break;
        }
    }
    if (!runaway && planningExceededEntityBudget(sim)) runaway = true;
    const progress = sim.raceTeams.map((team) => raceTeamProgress(team, sim, adjustedLayerStrengths));
    const progressMargin = Math.abs(progress[0] - progress[1]);
    const layerLead = Math.abs(Math.floor(progress[0]) - Math.floor(progress[1]));
    const minimumActionDurationSeconds = Math.max(0, Number(quality.minimumDurationSeconds?.[contentType]) || 0);
    const targetActionDurationSeconds = minimumActionDurationSeconds * 1.05;
    const actionPlaybackRate = socialActionPlaybackRateForDuration(sim.time, targetActionDurationSeconds);
    const maxProgressMargin = Number(quality.closeBattle.maxProgressMargin);
    const maxLayerLead = Number(quality.closeBattle.maxLayerLead);
    const finished = sim.finished && !runaway;
    const result = {
        accepted: finished && progressMargin <= maxProgressMargin && layerLead <= maxLayerLead,
        fallback: false,
        runaway,
        finished,
        winnerTeamIndex: Number.isInteger(sim.winningRaceTeamIndex) ? sim.winningRaceTeamIndex : null,
        simulatedSeconds: Number(sim.time.toFixed(3)),
        actionPlaybackRate,
        plannedActionDurationSeconds: Number((sim.time / actionPlaybackRate).toFixed(3)),
        progress: progress.map((value) => Number(value.toFixed(3))),
        progressMargin: Number(progressMargin.toFixed(3)),
        layerLead,
        teamDamagePerSecond: damagePerSecond,
        strongerTeamIndex: damagePerSecond[0] === damagePerSecond[1]
            ? null
            : damagePerSecond[0] > damagePerSecond[1] ? 0 : 1,
        strengthRatio: Number(strengthRatio.toFixed(3)),
        layerScale: Number(layerScale.toFixed(3)),
        layerStrengths: adjustedLayerStrengths,
    };
    if (runaway) releasePlanningSimulation(sim);
    return result;
}

function evaluateFoundryYouTubeBattle({ leftId, rightId, seed, quality }) {
    const foundry = quality.orbFoundryShort;
    const targetDuration = Number(quality.minimumDurationSeconds.short) * 1.05;
    const maxSeconds = Math.max(targetDuration, Number(foundry.maximumSimulationSeconds) || 120);
    const maxSteps = Math.ceil(maxSeconds / SIMULATION_STEP_SECONDS);
    let orbHealth = Math.max(1, Math.floor(Number(foundry.initialHealth) || 100));
    let lastResult = null;
    for (let adjustment = 0; adjustment < 5; adjustment += 1) {
        const options = {
            [leftId]: { health: orbHealth, orbScale: 1.25 },
            [rightId]: { health: orbHealth, orbScale: 1.25 },
        };
        const sim = createSimulation({
            gameplayMode: "classic",
            classes: [leftId, rightId],
            classicTeams: [[leftId], [rightId]],
            classicOrbOptions: options,
            classicBlackTheme: true,
            classicTeamColors: false,
            arenaSize: "large",
            arenaShape: "square",
            hazardPreset: "none",
            seed,
            social: { enabled: true, format: "square" },
            features: { replay: false },
        });
        let runaway = false;
        for (let step = 0; step < maxSteps && !sim.finished; step += 1) {
            stepSimulation(sim, SIMULATION_STEP_SECONDS);
            if (sim.fighters.length > MAX_PLANNING_SPAWNED_ENTITIES) {
                runaway = true;
                break;
            }
        }
        const winner = sim.winner;
        const winnerHealthFraction = winner && Number(winner.maxHealth) > 0
            ? Number(winner.health) / Number(winner.maxHealth)
            : Number.POSITIVE_INFINITY;
        const simulatedSeconds = Number(sim.time.toFixed(3));
        const finished = sim.finished && !runaway;
        lastResult = {
            accepted: finished
                && simulatedSeconds + 0.05 >= targetDuration
                && winnerHealthFraction <= Number(foundry.minimumWinnerHealthFraction),
            fallback: false,
            runaway,
            finished,
            winnerTeamIndex: Number.isInteger(winner?.classicTeamIndex) ? winner.classicTeamIndex : null,
            winnerHealthFraction: Number(winnerHealthFraction.toFixed(3)),
            simulatedSeconds,
            plannedActionDurationSeconds: simulatedSeconds,
            actionPlaybackRate: 1,
            orbHealth,
        };
        if (lastResult.accepted || runaway) return lastResult;

        if (!finished) {
            const reducedHealth = Math.max(10, Math.floor(orbHealth * 0.6));
            if (reducedHealth === orbHealth) break;
            orbHealth = reducedHealth;
        } else if (simulatedSeconds < targetDuration) {
            orbHealth = Math.min(1_000_000, Math.max(orbHealth + 1, Math.ceil(orbHealth * targetDuration / Math.max(1, simulatedSeconds) * 1.12)));
        } else if (winnerHealthFraction > Number(foundry.minimumWinnerHealthFraction)) {
            orbHealth = Math.min(1_000_000, Math.ceil(orbHealth * 1.3));
        }
    }
    return lastResult || {
        accepted: false,
        fallback: false,
        runaway: false,
        finished: false,
        winnerHealthFraction: Number.POSITIVE_INFINITY,
        simulatedSeconds: 0,
        plannedActionDurationSeconds: 0,
        actionPlaybackRate: 1,
        orbHealth,
    };
}

function createYouTubeSimulation({ raceTeams, raceOrbs, layerStrengths, contentType, seed }) {
    return createSimulation({
        gameplayMode: "orb-race",
        raceTeams,
        raceOrbs,
        raceLayerCount: layerStrengths.length,
        raceLayerStrengths: layerStrengths,
        raceScalingDamage: true,
        seed,
        social: {
            enabled: true,
            format: contentType === "longform" ? "race-landscape" : "portrait",
        },
        features: { replay: false },
    });
}

function raceTeamProgress(team, sim, layerStrengths) {
    if (team.raceFinished || sim.winningRaceTeamIndex === team.index) return layerStrengths.length;
    const layerIndex = Math.max(0, Math.min(layerStrengths.length, Math.floor(Number(team.raceLayerIndex) || 0)));
    if (layerIndex >= layerStrengths.length) return layerStrengths.length;
    const maximum = Math.max(1, Number(layerStrengths[layerIndex]) || 1);
    const health = Math.max(0, Number(team.raceLayerHealth?.[layerIndex]) || 0);
    return Math.min(layerStrengths.length, layerIndex + Math.max(0, Math.min(1, 1 - health / maximum)));
}

export function planningSpawnedEntityCount(sim) {
    let count = 0;
    for (const racer of sim?.fighters || []) {
        for (const key of PLANNING_SPAWN_KEYS) {
            const value = racer[key];
            if (Array.isArray(value)) count += value.length;
        }
    }
    return count;
}

function planningExceededEntityBudget(sim) {
    let effects = 0;
    for (const racer of sim?.fighters || []) {
        if ((racer.raceDuplicateOrbs?.length || 0) > MAX_PLANNING_DUPLICATES) return true;
        effects += racer.raceBounceEffects?.length || 0;
    }
    return planningSpawnedEntityCount(sim) > MAX_PLANNING_SPAWNED_ENTITIES
        || effects > MAX_PLANNING_BOUNCE_EFFECTS;
}

function releasePlanningSimulation(sim) {
    for (const racer of sim?.fighters || []) {
        for (const key of PLANNING_SPAWN_KEYS) {
            if (Array.isArray(racer[key])) racer[key] = [];
        }
        if (Array.isArray(racer.raceBounceEffects)) racer.raceBounceEffects = [];
    }
    if (Array.isArray(sim.events)) sim.events = [];
    if (Array.isArray(sim.effects)) sim.effects = [];
    sim.fighters = [];
}

function matchupScore(candidate) {
    const quality = candidate.battleQuality;
    return quality.progressMargin + (quality.finished ? 0 : 100) + quality.layerLead * 0.01;
}

function deterministicDailyRoster(roster, dateKey, dailyCapacity) {
    if (!roster.length) return [];
    const date = new Date(`${dateKey}T12:00:00.000Z`);
    if (!Number.isFinite(date.getTime())) throw new Error(`Invalid YouTube local date: ${dateKey}`);
    const dayNumber = Math.floor(date.getTime() / 86_400_000);
    const capacity = Math.max(2, Math.min(roster.length, Number(dailyCapacity) || 2));
    const start = ((dayNumber * capacity) % roster.length + roster.length) % roster.length;
    return Array.from({ length: capacity }, (_unused, index) => roster[(start + index) % roster.length]);
}

function deterministicRosterOrder(roster) {
    return [...roster].sort((left, right) => (
        seedForYouTubeRun("orb-foundry-roster-v1", left)
        - seedForYouTubeRun("orb-foundry-roster-v1", right)
        || left.localeCompare(right)
    ));
}

export async function publishDueYouTubeSlots({
    now = new Date(),
    slotId = null,
    dateKey = null,
    batch = false,
    dryRun = false,
    configPath = YOUTUBE_CONFIG_PATH,
    outputRoot = process.env.YOUTUBE_OUTPUT_DIR || DEFAULT_OUTPUT_ROOT,
    env = process.env,
    fetchImpl = globalThis.fetch,
    logger = console,
} = {}) {
    const config = await loadYouTubePublishingConfig(configPath);
    const resolvedDateKey = dateKey || localDateKey(now, config.timeZone);
    const resolvedSlotId = slotId === "auto" ? null : slotId;
    const slots = batch
        ? config.schedule
        : dueYouTubeSlotsAt(now, config, { slotId: resolvedSlotId });
    if (!slots.length) {
        return {
            status: "skipped",
            reason: resolvedSlotId ? `Unknown or unavailable slot: ${resolvedSlotId}` : "No Pacific publishing slot is due.",
            dateKey: resolvedDateKey,
            items: [],
        };
    }

    const matchupsBySlotId = new Map(buildDailyYouTubePlans({ dateKey: resolvedDateKey, config })
        .map(({ slot, matchup }) => [slot.id, matchup]));
    const client = dryRun ? null : await createYouTubeApiClient({ env, fetchImpl });
    const items = [];
    const failures = [];
    for (const slot of slots) {
        const plan = buildYouTubePublishPlan({
            dateKey: resolvedDateKey,
            slot,
            config,
            matchup: matchupsBySlotId.get(slot.id),
        });
        if (dryRun) {
            logger.log(JSON.stringify({ ...plan, action: "dry-run" }, null, 2));
            items.push({ ...plan, status: "planned" });
            continue;
        }

        try {
            const existing = await client.findVideoByRunTag(plan.runTag);
            if (existing) {
                logger.log(`Skipping ${plan.runTag}; already uploaded as ${existing.id}.`);
                items.push({ ...plan, status: "already-uploaded", videoId: existing.id });
                continue;
            }

            validateYouTubeGenerationSpec({ plan, config });
            const exportResult = await exportSocialVideo({
                outputDir: outputRoot,
                outputDirectory: resolve(outputRoot, resolvedDateKey, plan.slotId),
                outputDateKey: resolvedDateKey,
                gameplayMode: plan.contentSource === "orb-foundry" ? "classic" : "orb-race",
                contentSource: plan.contentSource,
                videoKind: plan.videoKind,
                raceOrbs: plan.raceOrbs,
                raceTeams: plan.raceTeams,
                raceLayerStrengths: plan.raceLayerStrengths,
                tournament: plan.videoKind === "tournament" ? plan.tournament : undefined,
                classes: plan.contentSource === "orb-foundry" ? plan.orbFoundryOrbs : undefined,
                selectedClasses: plan.contentSource === "orb-foundry" ? plan.orbFoundryOrbs : undefined,
                classicTeams: plan.contentSource === "orb-foundry" ? plan.classicTeams : undefined,
                classicOrbOptions: plan.contentSource === "orb-foundry" ? plan.classicOrbOptions : undefined,
                classicBlackTheme: plan.contentSource === "orb-foundry",
                classicTeamColors: plan.contentSource !== "orb-foundry",
                arenaSize: plan.contentSource === "orb-foundry" ? plan.foundryStyle.arenaSize : undefined,
                arenaShape: plan.contentSource === "orb-foundry" ? plan.foundryStyle.arenaShape : undefined,
                hazardPreset: "none",
                contentType: plan.contentType,
                format: plan.format,
                seed: plan.seed,
                minimumDurationSeconds: plan.minimumDurationSeconds,
                actionPlaybackRate: plan.actionPlaybackRate,
                timeoutMs: plan.videoKind === "tournament" ? 2_700_000 : undefined,
                title: plan.title,
                description: plan.description,
                runTag: plan.runTag,
                requireAnnouncer: plan.announcerRequirements.required,
            });
            validateYouTubeExportArtifact({ exportResult, plan, config });
            const transcoded = await transcodeBattleVideo(exportResult.metadataPath, {
                latestPath: join(outputRoot, "latest.json"),
            });
            const upload = await client.uploadVideo({
                filePath: transcoded.mp4Path,
                title: plan.title,
                description: plan.description,
                tags: plan.tags,
                privacyStatus: config.delivery.visibility,
                publishAt: config.delivery.scheduleOnYouTube ? plan.scheduledPublishAt : null,
            });
            items.push({
                ...plan,
                status: "uploaded",
                videoId: upload.id,
                videoUrl: `https://youtu.be/${upload.id}`,
                metadataPath: exportResult.metadataPath,
                videoPath: transcoded.mp4Path,
            });
            logger.log(`Uploaded ${plan.title}: https://youtu.be/${upload.id}`);
        } catch (error) {
            failures.push({ slotId: plan.slotId, message: error.message });
            logger.error(`YouTube slot ${plan.slotId} failed: ${error.stack || error.message}`);
        }
    }

    if (failures.length) {
        throw new Error(`YouTube publishing failed for ${failures.map(({ slotId: failedSlot }) => failedSlot).join(", ")}.`);
    }
    return { status: "completed", dateKey: resolvedDateKey, items };
}

export async function createYouTubeApiClient({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
    const accessToken = await refreshAccessToken({ env, fetchImpl });
    return new YouTubeApiClient({ accessToken, fetchImpl });
}

export async function refreshAccessToken({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
    const required = ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN"];
    const missing = required.filter((key) => !env[key]);
    if (missing.length) throw new Error(`Missing YouTube OAuth environment variables: ${missing.join(", ")}.`);
    const response = await fetchImpl(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: env.YOUTUBE_CLIENT_ID,
            client_secret: env.YOUTUBE_CLIENT_SECRET,
            refresh_token: env.YOUTUBE_REFRESH_TOKEN,
            grant_type: "refresh_token",
        }),
    });
    const payload = await readResponseJson(response);
    if (!response.ok || !payload.access_token) {
        throw new Error(`YouTube OAuth refresh failed (${response.status}): ${payload.error_description || payload.error || "unknown error"}`);
    }
    return payload.access_token;
}

export class YouTubeApiClient {
    constructor({ accessToken, fetchImpl = globalThis.fetch }) {
        this.accessToken = accessToken;
        this.fetchImpl = fetchImpl;
    }

    async findVideoByRunTag(runTag) {
        let pageToken = null;
        for (let page = 0; page < 3; page += 1) {
            const params = new URLSearchParams({
                part: "id",
                forMine: "true",
                type: "video",
                order: "date",
                maxResults: "50",
            });
            if (pageToken) params.set("pageToken", pageToken);
            const search = await this.getJson(`${YOUTUBE_API_URL}/search?${params}`);
            const ids = (search.items || []).map((item) => item.id?.videoId).filter(Boolean);
            if (ids.length) {
                const videos = await this.getJson(`${YOUTUBE_API_URL}/videos?${new URLSearchParams({
                    part: "snippet,status",
                    id: ids.join(","),
                })}`);
                const match = (videos.items || []).find((item) => item.snippet?.tags?.includes(runTag));
                if (match) return match;
            }
            pageToken = search.nextPageToken || null;
            if (!pageToken) break;
        }
        return null;
    }

    async uploadVideo({ filePath, title, description, tags, privacyStatus = "private", publishAt = null }) {
        const file = await readFile(filePath);
        const fileInfo = await stat(filePath);
        const initResponse = await this.fetchWithRetry(YOUTUBE_UPLOAD_URL + "?uploadType=resumable&part=snippet,status", {
            method: "POST",
            headers: {
                ...this.authHeaders(),
                "content-type": "application/json",
                "x-upload-content-type": "video/mp4",
                "x-upload-content-length": String(fileInfo.size),
            },
            body: JSON.stringify({
                snippet: {
                    title,
                    description,
                    tags,
                    categoryId: "20",
                },
                status: {
                    privacyStatus,
                    ...(publishAt ? { publishAt } : {}),
                    selfDeclaredMadeForKids: false,
                },
            }),
        });
        const uploadUrl = initResponse.headers.get("location");
        if (!uploadUrl) {
            const payload = await readResponseJson(initResponse);
            const message = payload.error?.message || payload.error_description || payload.raw || "unknown error";
            throw new Error(`YouTube upload initialization failed (${initResponse.status}): ${message}`);
        }

        let offset = 0;
        while (offset < file.length) {
            const end = Math.min(offset + UPLOAD_CHUNK_SIZE, file.length) - 1;
            const response = await this.fetchWithRetry(uploadUrl, {
                method: "PUT",
                headers: {
                    ...this.authHeaders(),
                    "content-type": "video/mp4",
                    "content-length": String(end - offset + 1),
                    "content-range": `bytes ${offset}-${end}/${file.length}`,
                },
                body: file.subarray(offset, end + 1),
                accept308: true,
            });
            if (response.status === 308) {
                const range = response.headers.get("range");
                offset = range ? Number(range.match(/-(\d+)$/)?.[1]) + 1 : end + 1;
                if (!Number.isFinite(offset)) throw new Error("YouTube returned an invalid resumable upload range.");
                continue;
            }
            if (!response.ok) throw new Error(`YouTube upload failed with HTTP ${response.status}.`);
            return readResponseJson(response);
        }
        throw new Error("YouTube upload ended without a completed video response.");
    }

    authHeaders() {
        return { authorization: `Bearer ${this.accessToken}` };
    }

    async getJson(url) {
        const response = await this.fetchWithRetry(url, { headers: this.authHeaders() });
        const payload = await readResponseJson(response);
        if (!response.ok) throw new Error(`YouTube API request failed (${response.status}): ${payload.error?.message || "unknown error"}`);
        return payload;
    }

    async fetchWithRetry(url, options = {}) {
        let lastError = null;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
            try {
                const response = await this.fetchImpl(url, options);
                if (response.ok || (options.accept308 && response.status === 308)) return response;
                if (!RETRIABLE_STATUS_CODES.has(response.status) || attempt === MAX_RETRIES) return response;
                await retryDelay(attempt, response.headers.get("retry-after"));
            } catch (error) {
                lastError = error;
                if (attempt === MAX_RETRIES) throw error;
                await retryDelay(attempt);
            }
        }
        throw lastError || new Error("YouTube request failed after retries.");
    }
}

async function readResponseJson(response) {
    const text = await response.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

async function retryDelay(attempt, retryAfter = null) {
    const retrySeconds = Number(retryAfter);
    const delayMs = Number.isFinite(retrySeconds)
        ? Math.max(250, Math.min(30_000, retrySeconds * 1000))
        : Math.min(30_000, 1_000 * (2 ** attempt));
    await new Promise((resolvePromise) => setTimeout(resolvePromise, delayMs));
}

function parseArgs(argv) {
    const values = { slotId: null, dateKey: null, batch: false, dryRun: false };
    for (const argument of argv) {
        if (argument === "--dry-run") values.dryRun = true;
        else if (argument === "--batch") values.batch = true;
        else if (argument.startsWith("--slot=")) values.slotId = argument.slice("--slot=".length);
        else if (argument.startsWith("--date=")) values.dateKey = argument.slice("--date=".length);
        else throw new Error(`Unknown argument: ${argument}`);
    }
    return values;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    publishDueYouTubeSlots(parseArgs(process.argv.slice(2)))
        .then((result) => console.log(JSON.stringify(result, null, 2)))
        .catch((error) => {
            console.error(error.stack || error.message);
            process.exit(1);
        });
}
