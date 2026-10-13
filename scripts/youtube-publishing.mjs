#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSIC_ORB_IDS } from "../src/classic-orbs.js";
import {
    ORB_RACE_MAX_LAYER_COUNT,
    ORB_RACE_MAX_LAYER_STRENGTH,
    ORB_RACER_IDS,
} from "../src/orb-race.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const YOUTUBE_CONFIG_PATH = resolve(ROOT, "config", "youtube-publishing.json");
export const YOUTUBE_TIME_ZONE = "America/Los_Angeles";
export const YOUTUBE_DESCRIPTION_HASHTAGS = Object.freeze([
    "#physics",
    "#shorts",
    "#simulation",
    "#satisfying",
]);
export const YOUTUBE_DESCRIPTION_TEMPLATE = "Who will break the {layerHealth} HP layer first, {left} or {right}?";
export const YOUTUBE_DUE_WINDOW_MINUTES = 45;
export const YOUTUBE_MINIMUM_LAYER_HEALTH = 500;
export const YOUTUBE_MAXIMUM_SHORT_LAYERS = 3;
export const YOUTUBE_ORB_FOUNDRY_EXCLUDED_IDS = Object.freeze([
    "fairy",
    "commander",
    "jackpot",
    "absorber",
    "grappler",
    "monster",
    "train",
    "frost-ball",
    "ying-yang",
    "flash",
    "poison",
    "charger",
]);

export async function loadYouTubePublishingConfig(configPath = YOUTUBE_CONFIG_PATH) {
    const config = JSON.parse(await readFile(configPath, "utf8"));
    validateYouTubePublishingConfig(config);
    return config;
}

export function validateYouTubePublishingConfig(config) {
    if (!config || typeof config !== "object") throw new Error("YouTube publishing config must be an object.");
    if (config.timeZone !== YOUTUBE_TIME_ZONE) {
        throw new Error(`YouTube publishing config must use ${YOUTUBE_TIME_ZONE}.`);
    }
    if (!config.delivery || !["daily-batch", "weekly-scheduled-dump"].includes(config.delivery.mode)) {
        throw new Error("YouTube publishing delivery.mode must be daily-batch or weekly-scheduled-dump.");
    }
    if (config.delivery.visibility !== "private") {
        throw new Error("YouTube publishing visibility must be private so YouTube can schedule each upload safely.");
    }
    if (config.delivery.scheduleOnYouTube !== true) {
        throw new Error("YouTube publishing must use YouTube scheduled publishing.");
    }
    if (config.delivery.requireApproval !== false) {
        throw new Error("YouTube publishing requireApproval must be false for the approved no-review video loop.");
    }
    if (typeof config.titleTemplate !== "string" || !config.titleTemplate.includes("{left}") || !config.titleTemplate.includes("{right}")) {
        throw new Error("YouTube titleTemplate must include {left} and {right}.");
    }
    if (
        typeof config.descriptionTemplate !== "string"
        || !config.descriptionTemplate.includes("{layerHealth}")
        || !config.descriptionTemplate.includes("{left}")
        || !config.descriptionTemplate.includes("{right}")
    ) {
        throw new Error("YouTube descriptionTemplate must include {layerHealth}, {left}, and {right}.");
    }
    if (config.descriptionTemplate !== YOUTUBE_DESCRIPTION_TEMPLATE) {
        throw new Error("YouTube descriptionTemplate must match the approved publishing contract.");
    }
    if (!Array.isArray(config.descriptionHashtags) || config.descriptionHashtags.length === 0) {
        throw new Error("YouTube descriptionHashtags must contain at least one hashtag.");
    }
    if (config.descriptionHashtags.join(" ") !== YOUTUBE_DESCRIPTION_HASHTAGS.join(" ")) {
        throw new Error("YouTube description hashtags must match the approved publishing contract.");
    }
    const expectedSlots = [
        { id: "noon-short", contentType: "short", localTime: "12:00" },
        { id: "noon-longform", contentType: "longform", localTime: "12:00" },
        { id: "afternoon-short", contentType: "short", localTime: "15:00" },
        { id: "afternoon-longform", contentType: "longform", localTime: "15:00" },
    ];
    if (!Array.isArray(config.schedule) || config.schedule.length !== expectedSlots.length
        || config.schedule.some((slot, index) => (
            slot?.id !== expectedSlots[index].id
            || slot?.contentType !== expectedSlots[index].contentType
            || slot?.localTime !== expectedSlots[index].localTime
        ))) {
        throw new Error("YouTube publishing schedule must contain one Short and one long-form slot at both 12:00 PM and 3:00 PM Pacific.");
    }
    const ids = new Set();
    for (const slot of config.schedule) {
        if (!slot || typeof slot.id !== "string" || ids.has(slot.id)) {
            throw new Error("YouTube publishing schedule slot IDs must be unique strings.");
        }
        ids.add(slot.id);
        if (!["short", "longform"].includes(slot.contentType)) {
            throw new Error(`Unsupported YouTube content type for ${slot.id}.`);
        }
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.localTime)) {
            throw new Error(`Invalid localTime for YouTube slot ${slot.id}.`);
        }
    }
    validateYouTubeQuality(config.quality);
    validateVideoReadySection(config.videoReady?.orbRace, "orbRace", ORB_RACER_IDS);
    validateVideoReadySection(config.videoReady?.orbFoundry, "orbFoundry", CLASSIC_ORB_IDS);
    const expectedFoundryOrbs = CLASSIC_ORB_IDS.filter((id) => !YOUTUBE_ORB_FOUNDRY_EXCLUDED_IDS.includes(id));
    const actualFoundryOrbs = new Set(config.videoReady.orbFoundry.orbs);
    if (config.videoReady.orbFoundry.groups.length > 0
        || actualFoundryOrbs.size !== expectedFoundryOrbs.length
        || expectedFoundryOrbs.some((id) => !actualFoundryOrbs.has(id))) {
        throw new Error("YouTube Orb Foundry allowlist must include every non-excluded Classic orb and no groups.");
    }
    return config;
}

function validateYouTubeQuality(quality) {
    if (!quality || typeof quality !== "object") {
        throw new Error("YouTube quality requirements must be configured.");
    }
    if (Math.floor(Number(quality.orbCooldownDays)) < 2) {
        throw new Error("YouTube orbCooldownDays must be at least two days.");
    }
    const minimumLayerHealth = Number(quality.minimumLayerHealth);
    if (!Number.isInteger(minimumLayerHealth) || minimumLayerHealth < YOUTUBE_MINIMUM_LAYER_HEALTH) {
        throw new Error(`YouTube minimumLayerHealth must be at least ${YOUTUBE_MINIMUM_LAYER_HEALTH}.`);
    }
    const durationSeconds = quality.minimumDurationSeconds;
    if (Math.floor(Number(durationSeconds?.short)) < 25 || Math.floor(Number(durationSeconds?.longform)) < 60) {
        throw new Error("YouTube minimum durations must be at least 25 seconds for Shorts and 60 seconds for long-form.");
    }
    const maximumShortLayers = Number(quality.maximumShortLayers);
    if (maximumShortLayers !== YOUTUBE_MAXIMUM_SHORT_LAYERS) {
        throw new Error(`YouTube maximumShortLayers must be exactly ${YOUTUBE_MAXIMUM_SHORT_LAYERS}.`);
    }
    for (const contentType of ["short", "longform"]) {
        const layers = quality.layerStrengths?.[contentType];
        if (!Array.isArray(layers) || layers.length < 2) {
            throw new Error(`YouTube ${contentType} layerStrengths must contain at least two layers.`);
        }
        if (contentType === "short" && layers.length > maximumShortLayers) {
            throw new Error(`YouTube Shorts cannot use more than ${maximumShortLayers} layers.`);
        }
        let previous = 0;
        for (const value of layers) {
            const health = Number(value);
            if (!Number.isInteger(health) || health < minimumLayerHealth) {
                throw new Error(`YouTube ${contentType} layer health must be an integer of at least ${minimumLayerHealth}.`);
            }
            if (health < previous) {
                throw new Error(`YouTube ${contentType} layer health must be ascending.`);
            }
            previous = health;
        }
    }
    const longformLayerCount = Number(quality.longformLayerCount);
    if (!Number.isInteger(longformLayerCount)
        || longformLayerCount < quality.layerStrengths.longform.length
        || longformLayerCount > ORB_RACE_MAX_LAYER_COUNT) {
        throw new Error(`YouTube longformLayerCount must be between its configured profile length and ${ORB_RACE_MAX_LAYER_COUNT}.`);
    }
    const announcer = quality.announcer;
    if (
        !announcer
        || announcer.required !== true
        || announcer.spokenCueRequired !== true
        || announcer.splitOnlyWhenSplit !== true
    ) {
        throw new Error("YouTube announcer requirements must require spoken coverage and split-only routing.");
    }
    const closeBattle = quality.closeBattle;
    if (!closeBattle || closeBattle.enabled !== true) {
        throw new Error("YouTube closeBattle quality gating must be enabled.");
    }
    if (!(Number(closeBattle.maxProgressMargin) > 0) || !(Number(closeBattle.maxLayerLead) >= 0)) {
        throw new Error("YouTube closeBattle thresholds must be positive.");
    }
    if (!(Number(quality.strongerTeamLayerScaleMax) >= 1)) {
        throw new Error("YouTube strongerTeamLayerScaleMax must be at least 1.");
    }
    if (!Array.isArray(quality.battleFormats) || quality.battleFormats.length === 0) {
        throw new Error("YouTube battleFormats must contain at least one format.");
    }
    for (const format of quality.battleFormats) {
        if (!format || typeof format.id !== "string" || !format.id.trim()) {
            throw new Error("YouTube battle format IDs must be non-empty strings.");
        }
        if (!Array.isArray(format.teamSizes) || format.teamSizes.length !== 2
            || format.teamSizes.some((size) => !Number.isInteger(Number(size)) || Number(size) < 1)) {
            throw new Error(`YouTube battle format ${format.id} must define two positive team sizes.`);
        }
        if (!(Number(format.weight) > 0)) throw new Error(`YouTube battle format ${format.id} must have a positive weight.`);
    }
    const foundry = quality.orbFoundryShort;
    if (!foundry || Number(foundry.dailyProbability) !== 0.25 || Number(foundry.maximumPerDay) !== 1
        || Number(foundry.initialHealth) < 1
        || !(Number(foundry.minimumWinnerHealthFraction) > 0 && Number(foundry.minimumWinnerHealthFraction) < 1)
        || !(Number(foundry.maximumSimulationSeconds) >= Number(durationSeconds.short) * 1.05)
        || foundry.format !== "square" || foundry.theme !== "black" || foundry.teamOutlines !== false
        || foundry.arenaSize !== "large" || foundry.arenaShape !== "square") {
        throw new Error("YouTube Orb Foundry Shorts must use the approved 25% daily chance and black, outline-free large-square format.");
    }
    const tournament = quality.fridayTournament;
    if (!tournament || tournament.enabled !== true || Number(tournament.dayOfWeek) !== 5
        || tournament.slotId !== "afternoon-longform"
        || ![8, 16, 32, 64].includes(Number(tournament.entrants))
        || Number(tournament.minimumEntrants) !== 8 || Number(tournament.maximumEntrants) !== 64
        || Number(tournament.minimumDurationSeconds) < 120
        || tournament.recordingScope !== "whole-tournament"
        || tournament.layerStrengths?.length !== 5) {
        throw new Error("YouTube Friday tournaments must record 8–64 entrants, the whole tournament, and at least 120 seconds.");
    }
    let previousTournamentLayer = 0;
    for (const value of tournament.layerStrengths) {
        const health = Number(value);
        if (!Number.isInteger(health) || health < minimumLayerHealth || health < previousTournamentLayer) {
            throw new Error("YouTube Friday tournament layers must ascend and start at or above the minimum HP.");
        }
        previousTournamentLayer = health;
    }
}

export function validateYouTubeGenerationSpec({ plan, config }) {
    if (!plan || typeof plan !== "object") {
        throw new Error("YouTube generation blocked: the approved plan is missing.");
    }
    if (!config || typeof config !== "object") {
        throw new Error("YouTube generation blocked: the publishing config is missing.");
    }
    const slot = config.schedule?.find(({ id }) => id === plan.slotId);
    if (!slot || slot.contentType !== plan.contentType) {
        throw new Error("YouTube generation blocked: the plan content type does not match its schedule slot.");
    }
    const tournamentConfig = config.quality.fridayTournament;
    const isTournament = plan.videoKind === "tournament";
    const expectedDuration = isTournament
        ? Number(tournamentConfig.minimumDurationSeconds)
        : Number(config.quality.minimumDurationSeconds[plan.contentType]);
    if (Number(plan.minimumDurationSeconds) !== expectedDuration) {
        throw new Error("YouTube generation blocked: the plan duration does not match the configured minimum.");
    }

    if (isTournament) {
        const tournament = plan.tournament;
        const entrants = Array.isArray(tournament?.entrants) ? tournament.entrants : [];
        const allowedOrbs = new Set(config.videoReady.orbRace.orbs);
        if (plan.contentSource !== "orb-race" || plan.contentType !== "longform"
            || slot.id !== tournamentConfig.slotId || !isPacificFriday(plan.dateKey)
            || Number(tournament?.size) !== entrants.length
            || entrants.length < Number(tournamentConfig.minimumEntrants)
            || entrants.length > Number(tournamentConfig.maximumEntrants)
            || ![8, 16, 32, 64].includes(entrants.length)
            || new Set(entrants).size !== entrants.length
            || entrants.some((id) => !allowedOrbs.has(id))) {
            throw new Error("YouTube generation blocked: the Friday tournament must use 8–64 unique approved Orb Race entrants.");
        }
        if (tournament.recordingScope !== "whole-tournament"
            || tournament.recordingSelection !== "whole-tournament"
            || JSON.stringify(tournament.layerStrengths) !== JSON.stringify(tournamentConfig.layerStrengths)
            || JSON.stringify(plan.raceOrbs) !== JSON.stringify(entrants)
            || JSON.stringify(plan.raceLayerStrengths) !== JSON.stringify(tournamentConfig.layerStrengths)
            || plan.format !== "race-landscape") {
            throw new Error("YouTube generation blocked: the tournament must record the full approved bracket in the configured landscape format.");
        }
        validateAscendingLayerProfile(tournament.layerStrengths, config.quality.minimumLayerHealth, "tournament");
        if (plan.battleQuality?.accepted !== true || plan.battleQuality?.finished !== true
            || plan.battleQuality?.fallback === true) {
            throw new Error("YouTube generation blocked: the full-tournament recording contract did not pass.");
        }
        const expectedMetadata = youtubeTournamentMetadata({ entrants: entrants.length, config });
        if (plan.title !== expectedMetadata.title || plan.description !== expectedMetadata.description) {
            throw new Error("YouTube generation blocked: tournament title or description does not match the approved metadata contract.");
        }
        validatePlanAnnouncerRequirements(plan, config);
        return true;
    }

    if (plan.contentSource === "orb-foundry") {
        const foundry = config.quality.orbFoundryShort;
        const orbIds = Array.isArray(plan.orbFoundryOrbs) ? plan.orbFoundryOrbs : [];
        const allowedOrbs = new Set(config.videoReady.orbFoundry.orbs);
        const winnerHealthFraction = Number(plan.battleQuality?.winnerHealthFraction);
        const simulatedSeconds = Number(plan.battleQuality?.simulatedSeconds);
        const expectedDurationSeconds = Number(plan.minimumDurationSeconds) * 1.05;
        if (plan.videoKind !== "match" || plan.contentType !== "short"
            || orbIds.length !== 2 || new Set(orbIds).size !== 2
            || orbIds.some((id) => !allowedOrbs.has(id))
            || JSON.stringify(plan.classicTeams) !== JSON.stringify(orbIds.map((id) => [id]))) {
            throw new Error("YouTube generation blocked: Orb Foundry Shorts require exactly two unique approved orbs.");
        }
        if (!plan.foundryStyle || plan.foundryStyle.format !== foundry.format
            || plan.foundryStyle.theme !== foundry.theme
            || plan.foundryStyle.teamOutlines !== foundry.teamOutlines
            || plan.foundryStyle.arenaSize !== foundry.arenaSize
            || plan.foundryStyle.arenaShape !== foundry.arenaShape
            || plan.format !== "square") {
            throw new Error("YouTube generation blocked: Orb Foundry style must be black, outline-free, and large-square.");
        }
        const classicHealthValues = orbIds.map((id) => Number(plan.classicOrbOptions?.[id]?.health));
        if (classicHealthValues.some((health) => !Number.isInteger(health) || health < 1)) {
            throw new Error("YouTube generation blocked: Orb Foundry health settings are invalid.");
        }
        if (plan.battleQuality?.accepted !== true || plan.battleQuality?.finished !== true
            || plan.battleQuality?.fallback === true
            || !Number.isFinite(winnerHealthFraction)
            || winnerHealthFraction > Number(foundry.minimumWinnerHealthFraction)
            || !Number.isFinite(simulatedSeconds)
            || simulatedSeconds + 0.05 < expectedDurationSeconds
            || Number(plan.battleQuality.plannedActionDurationSeconds) + 0.05 < expectedDurationSeconds) {
            throw new Error("YouTube generation blocked: the Orb Foundry matchup must be close and contain at least 25 seconds of live action.");
        }
        const expectedMetadata = youtubeFoundryMetadata({ left: plan.left, right: plan.right, config });
        if (plan.title !== expectedMetadata.title || plan.description !== expectedMetadata.description) {
            throw new Error("YouTube generation blocked: Orb Foundry title or description does not match the approved metadata contract.");
        }
        validatePlanAnnouncerRequirements(plan, config);
        return true;
    }

    if (plan.contentSource !== "orb-race") {
        throw new Error("YouTube generation blocked: the content source is not approved.");
    }
    const closeBattle = config.quality?.closeBattle;
    if (
        plan.battleQuality?.accepted !== true
        || plan.battleQuality?.finished !== true
        || plan.battleQuality?.fallback === true
        || !Number.isFinite(plan.battleQuality?.progressMargin)
        || !Number.isFinite(plan.battleQuality?.layerLead)
        || Number(plan.battleQuality?.progressMargin) > Number(closeBattle?.maxProgressMargin)
        || Number(plan.battleQuality?.layerLead) > Number(closeBattle?.maxLayerLead)
    ) {
        throw new Error("YouTube generation blocked: the deterministic close-battle preflight did not pass.");
    }
    const actionPlaybackRate = Number(plan.actionPlaybackRate);
    const simulatedSeconds = Number(plan.battleQuality.simulatedSeconds);
    const plannedActionDurationSeconds = Number(plan.battleQuality.plannedActionDurationSeconds);
    const expectedActionDurationSeconds = simulatedSeconds / actionPlaybackRate;
    if (!Number.isFinite(actionPlaybackRate) || actionPlaybackRate <= 0 || actionPlaybackRate > 1
        || Number(plan.battleQuality.actionPlaybackRate) !== actionPlaybackRate
        || !Number.isFinite(expectedActionDurationSeconds)
        || expectedActionDurationSeconds + 0.05 < expectedDuration * 1.05
        || !Number.isFinite(plannedActionDurationSeconds)
        || Math.abs(plannedActionDurationSeconds - expectedActionDurationSeconds) > 0.01) {
        throw new Error("YouTube generation blocked: the single-match action-duration plan is invalid.");
    }

    const allowedOrbs = new Set(config.videoReady.orbRace.orbs);
    const raceOrbs = Array.isArray(plan.raceOrbs) ? plan.raceOrbs : [];
    const raceTeams = Array.isArray(plan.raceTeams) ? plan.raceTeams : [];
    if (raceTeams.length !== 2 || raceTeams.some((team) => !Array.isArray(team) || team.length < 1)) {
        throw new Error("YouTube generation blocked: the plan must contain two non-empty orb teams.");
    }
    const flattenedOrbs = raceTeams.flat();
    if (new Set(flattenedOrbs).size !== flattenedOrbs.length
        || JSON.stringify(flattenedOrbs) !== JSON.stringify(raceOrbs)
        || raceOrbs.some((id) => !allowedOrbs.has(id))) {
        throw new Error("YouTube generation blocked: the plan contains repeated or non-video-ready orb IDs.");
    }

    const layers = plan.raceLayerStrengths;
    const expectedLayerCount = plan.contentType === "longform"
        ? Number(config.quality.longformLayerCount)
        : config.quality.layerStrengths.short.length;
    if (!Array.isArray(layers) || layers.length < 2
        || layers.length !== expectedLayerCount
        || JSON.stringify(layers) !== JSON.stringify(plan.battleQuality.layerStrengths)) {
        throw new Error("YouTube generation blocked: the plan layer profile is missing or inconsistent.");
    }
    if (plan.contentType === "short" && layers.length > Number(config.quality.maximumShortLayers)) {
        throw new Error(`YouTube generation blocked: Shorts cannot exceed ${config.quality.maximumShortLayers} layers.`);
    }
    let previous = 0;
    for (const value of layers) {
        const health = Number(value);
        if (!Number.isInteger(health) || health < Number(config.quality.minimumLayerHealth)
            || health > ORB_RACE_MAX_LAYER_STRENGTH) {
            throw new Error("YouTube generation blocked: every generated layer must meet the minimum HP requirement.");
        }
        if (health < previous) {
            throw new Error("YouTube generation blocked: generated layer HP must be ascending.");
        }
        previous = health;
    }

    const expectedMetadata = youtubeMetadata({
        left: plan.left,
        right: plan.right,
        layerHealth: layers[0],
        config,
    });
    if (plan.title !== expectedMetadata.title || plan.description !== expectedMetadata.description) {
        throw new Error("YouTube generation blocked: title or description does not match the approved metadata contract.");
    }

    validatePlanAnnouncerRequirements(plan, config);
    return true;
}

export function validateYouTubeExportArtifact({ exportResult, plan, config }) {
    if (!exportResult || typeof exportResult !== "object") {
        throw new Error("YouTube upload blocked: the exporter returned no artifact metadata.");
    }
    if (!plan || typeof plan !== "object") {
        throw new Error("YouTube upload blocked: the upload plan is missing.");
    }
    if (plan.battleQuality?.accepted !== true) {
        throw new Error("YouTube upload blocked: the deterministic close-battle gate did not pass.");
    }
    if (exportResult.runTag !== plan.runTag) {
        throw new Error("YouTube upload blocked: the exported artifact has the wrong run tag.");
    }
    if (exportResult.title !== plan.title || exportResult.description !== plan.description) {
        throw new Error("YouTube upload blocked: exported metadata does not match the approved title or description.");
    }
    if (!exportResult.videoPath) {
        throw new Error("YouTube upload blocked: the exported video path is missing.");
    }
    const quality = config.quality;
    const recordedDuration = Number(exportResult.state?.recordingResult?.duration);
    const minimumDuration = Number(plan.minimumDurationSeconds);
    if (!Number.isFinite(recordedDuration) || recordedDuration + 0.05 < minimumDuration) {
        throw new Error(`YouTube upload blocked: recording duration is below the ${minimumDuration}s minimum.`);
    }

    if (exportResult.contentSource !== plan.contentSource
        || exportResult.contentType !== plan.contentType) {
        throw new Error("YouTube upload blocked: exported content source or type does not match the plan.");
    }

    if (plan.videoKind === "tournament") {
        const tournament = plan.tournament;
        const snapshot = exportResult.state?.tournament?.snapshot
            || exportResult.state?.raceTournamentSnapshot;
        const recording = exportResult.state?.recordingResult;
        const recordingMetadata = recording?.metadata || {};
        const matchIds = Array.isArray(recordingMetadata.matchIds) ? recordingMetadata.matchIds : [];
        const expectedMatchCount = Number(tournament.size) - 1;
        const setting = exportResult.state?.settings?.raceTournament;
        if (exportResult.gameplayMode !== "orb-race"
            || JSON.stringify(exportResult.raceOrbs) !== JSON.stringify(tournament.entrants)
            || JSON.stringify(exportResult.raceLayerStrengths) !== JSON.stringify(tournament.layerStrengths)
            || JSON.stringify(setting?.entrants) !== JSON.stringify(tournament.entrants)
            || setting?.recordingScope !== "whole-tournament"
            || snapshot?.recordingScope !== "whole-tournament"
            || snapshot?.status !== "completed"
            || Number(snapshot?.size) !== Number(tournament.size)
            || Number(snapshot?.completedMatchCount) !== expectedMatchCount
            || !tournament.entrants.includes(snapshot?.championOrbId)
            || recording?.recordingScope !== "whole-tournament"
            || recordingMetadata.scope !== "whole-tournament"
            || matchIds.length !== expectedMatchCount
            || new Set(matchIds).size !== expectedMatchCount) {
            throw new Error("YouTube upload blocked: export must prove a complete whole-tournament recording with every bracket match and an approved champion.");
        }
        validateAscendingLayerProfile(exportResult.raceLayerStrengths, quality.minimumLayerHealth, "tournament");
        validateRequiredAnnouncer(exportResult.announcer, quality.announcer, expectedMatchCount);
        return true;
    }

    if (plan.contentSource === "orb-foundry") {
        const setting = exportResult.state?.settings || {};
        if (exportResult.gameplayMode !== "classic"
            || JSON.stringify(exportResult.orbFoundryOrbs) !== JSON.stringify(plan.orbFoundryOrbs)
            || JSON.stringify(setting.classicTeams) !== JSON.stringify(plan.classicTeams)
            || setting.classicBlackTheme !== true || setting.classicTeamColors !== false
            || setting.social?.format !== "square"
            || setting.arenaSize !== "large" || setting.arenaShape !== "square"
            || setting.hazardPreset !== "none"
            || exportResult.state?.classicTournament != null
            || Number(exportResult.state?.time) + 0.05 < Number(plan.minimumDurationSeconds)) {
            throw new Error("YouTube upload blocked: Orb Foundry export does not match the required live-action black, outline-free, large-square format.");
        }
        validateRequiredAnnouncer(exportResult.announcer, quality.announcer, 1);
        return true;
    }

    if (exportResult.gameplayMode !== "orb-race"
        || JSON.stringify(exportResult.raceTeams) !== JSON.stringify(plan.raceTeams)
        || JSON.stringify(exportResult.raceOrbs) !== JSON.stringify(plan.raceOrbs)
        || JSON.stringify(exportResult.raceLayerStrengths) !== JSON.stringify(plan.raceLayerStrengths)) {
        throw new Error("YouTube upload blocked: exported teams, orbs, or layer profile does not match the approved plan.");
    }
    validateAscendingLayerProfile(exportResult.raceLayerStrengths, quality.minimumLayerHealth, plan.contentType);
    if (plan.contentType === "short" && exportResult.raceLayerStrengths.length > Number(quality.maximumShortLayers)) {
        throw new Error(`YouTube upload blocked: Shorts cannot exceed ${quality.maximumShortLayers} layers.`);
    }
    if (Number(exportResult.state?.raceMatchupCount) !== 1) {
        throw new Error("YouTube upload blocked: the recording must contain exactly one matchup.");
    }
    const recordedActionDuration = Number(exportResult.state?.raceActionDurationSeconds);
    if (!Number.isFinite(recordedActionDuration) || recordedActionDuration + 0.05 < minimumDuration) {
        throw new Error(`YouTube upload blocked: single-match race action is below the ${minimumDuration}s minimum.`);
    }
    if (Number(exportResult.state?.settings?.social?.actionPlaybackRate) !== Number(plan.actionPlaybackRate)) {
        throw new Error("YouTube upload blocked: the recorded action speed does not match the approved duration plan.");
    }
    validateRequiredAnnouncer(exportResult.announcer, quality.announcer, 1);
    return true;
}

function validatePlanAnnouncerRequirements(plan, config) {
    if (JSON.stringify(plan.announcerRequirements) !== JSON.stringify(config.quality.announcer)) {
        throw new Error("YouTube generation blocked: announcer requirements are not enabled on the approved plan.");
    }
}

function validateRequiredAnnouncer(announcer, requirements, minimumSequences) {
    if (!requirements.required) return;
    if (announcer?.assetsReady !== true || Number(announcer.loadedCueCount) < 1) {
        throw new Error("YouTube upload blocked: announcer assets were not ready for the recording.");
    }
    if (Number(announcer.sequences) < minimumSequences) {
        throw new Error("YouTube upload blocked: the recording is missing one or more required announcer sequences.");
    }
    if (requirements.spokenCueRequired && Number(announcer.spokenCueCount) < minimumSequences) {
        throw new Error("YouTube upload blocked: the recording is missing one or more spoken announcer cues.");
    }
    if (requirements.splitOnlyWhenSplit && announcer.splitAnnouncerUsed === true && announcer.presentationWasSplit !== true) {
        throw new Error("YouTube upload blocked: split announcer audio was used without a split presentation.");
    }
}

function validateAscendingLayerProfile(layers, minimumLayerHealth, label) {
    if (!Array.isArray(layers) || layers.length < 2) {
        throw new Error(`YouTube upload blocked: ${label} export has no valid layer profile.`);
    }
    let previous = 0;
    for (const value of layers) {
        const health = Number(value);
        if (!Number.isInteger(health) || health < Number(minimumLayerHealth)) {
            throw new Error(`YouTube upload blocked: every ${label} layer must meet the minimum HP requirement.`);
        }
        if (health < previous) throw new Error(`YouTube upload blocked: ${label} layer HP must be ascending.`);
        previous = health;
    }
}

function isPacificFriday(dateKey) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(dateKey))
        && new Date(`${dateKey}T12:00:00.000Z`).getUTCDay() === 5;
}

function validateVideoReadySection(section, label, allowedIds) {
    if (!section || typeof section !== "object") throw new Error(`YouTube videoReady.${label} must be an object.`);
    for (const key of ["orbs", "groups"]) {
        if (!Array.isArray(section[key]) || section[key].some((value) => typeof value !== "string" || !value.trim())) {
            throw new Error(`YouTube videoReady.${label}.${key} must contain non-empty strings.`);
        }
    }
    if (section.orbs.some((value) => !allowedIds.includes(value))) {
        const invalid = section.orbs.find((value) => !allowedIds.includes(value));
        throw new Error(`YouTube videoReady.${label}.orbs contains unknown stable ID: ${invalid}.`);
    }
}

export function youtubeTitle(left, right, config = null) {
    const leftLabel = titlePart(left, "left");
    const rightLabel = titlePart(right, "right");
    const template = config?.titleTemplate || "{left} VS {right}";
    return template.replaceAll("{left}", leftLabel).replaceAll("{right}", rightLabel);
}

export function youtubeDescription({ left = "Orb 1", right = "Orb 2", layerHealth = "first", config = null } = {}) {
    const leftLabel = titlePart(left, "left");
    const rightLabel = titlePart(right, "right");
    const normalizedLayerHealth = Number.isFinite(Number(layerHealth))
        ? String(Math.round(Number(layerHealth)))
        : String(layerHealth).trim();
    if (!normalizedLayerHealth) throw new Error("YouTube description layer health is required.");
    const template = config?.descriptionTemplate || YOUTUBE_DESCRIPTION_TEMPLATE;
    const question = template
        .replaceAll("{layerHealth}", normalizedLayerHealth)
        .replaceAll("{left}", leftLabel)
        .replaceAll("{right}", rightLabel);
    const hashtags = (config?.descriptionHashtags || YOUTUBE_DESCRIPTION_HASHTAGS).join(" ");
    return `${question}\n\n${hashtags}`;
}

export function youtubeMetadata({ left, right, layerHealth, config = null } = {}) {
    return {
        title: youtubeTitle(left, right, config),
        description: youtubeDescription({ left, right, layerHealth, config }),
    };
}

export function youtubeFoundryMetadata({ left, right, config = null } = {}) {
    const leftLabel = titlePart(left, "left");
    const rightLabel = titlePart(right, "right");
    const hashtags = (config?.descriptionHashtags || YOUTUBE_DESCRIPTION_HASHTAGS).join(" ");
    return {
        title: youtubeTitle(leftLabel, rightLabel, config),
        description: `Who will win the Orb Foundry battle, ${leftLabel} or ${rightLabel}?\n\n${hashtags}`,
    };
}

export function youtubeTournamentMetadata({ entrants, config = null } = {}) {
    const size = Math.floor(Number(entrants));
    if (!Number.isInteger(size) || size < 1) throw new Error("YouTube tournament metadata requires a positive entrant count.");
    const left = "Orb Race Tournament";
    const right = `${size} Entrants`;
    const hashtags = (config?.descriptionHashtags || YOUTUBE_DESCRIPTION_HASHTAGS).join(" ");
    return {
        title: youtubeTitle(left, right, config),
        description: `Who will claim the championship? ${size} approved Orb Race entrants compete in the full tournament.\n\n${hashtags}`,
    };
}

export function localScheduleSlotsAt(date, config) {
    validateYouTubePublishingConfig(config);
    const localParts = localDateTimeParts(date, config.timeZone);
    const localTime = `${localParts.hour}:${localParts.minute}`;
    return config.schedule.filter((slot) => slot.localTime === localTime);
}

/**
 * Return the daily slots that are currently due in Pacific time. GitHub
 * Actions schedules are UTC and can be delayed, so the publisher accepts a
 * bounded late window instead of requiring an exact minute match. An explicit
 * slotId is used by workflow_dispatch and bypasses the time window.
 */
export function dueYouTubeSlotsAt(
    date,
    config,
    { toleranceMinutes = YOUTUBE_DUE_WINDOW_MINUTES, slotId = null } = {},
) {
    validateYouTubePublishingConfig(config);
    if (slotId) {
        const slot = config.schedule.find((candidate) => candidate.id === slotId);
        return slot ? [slot] : [];
    }
    const localParts = localDateTimeParts(date, config.timeZone);
    const currentMinutes = Number(localParts.hour) * 60 + Number(localParts.minute);
    const safeTolerance = Math.max(0, Math.floor(Number(toleranceMinutes) || 0));
    return config.schedule.filter((slot) => {
        const [hour, minute] = slot.localTime.split(":").map(Number);
        const elapsed = currentMinutes - (hour * 60 + minute);
        return elapsed >= 0 && elapsed <= safeTolerance;
    });
}

export function scheduledPublishAt(dateKey, localTime, timeZone = YOUTUBE_TIME_ZONE) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey)) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(localTime))) {
        throw new Error("YouTube scheduled publishing requires a valid local date and HH:MM time.");
    }
    const [year, month, day] = String(dateKey).split("-").map(Number);
    const [hour, minute] = String(localTime).split(":").map(Number);
    const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
    const firstOffset = timeZoneOffsetMinutes(new Date(utcGuess), timeZone);
    const firstInstant = new Date(utcGuess - firstOffset * 60_000);
    const correctedOffset = timeZoneOffsetMinutes(firstInstant, timeZone);
    return new Date(utcGuess - correctedOffset * 60_000).toISOString();
}

export function youtubeRunTag(dateKey, slotId) {
    const safeDate = String(dateKey || "").replace(/[^0-9-]/g, "");
    const safeSlot = String(slotId || "").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(safeDate) || !safeSlot) {
        throw new Error("YouTube run tags require a valid local date and slot ID.");
    }
    return `of-${safeDate.replaceAll("-", "")}-${safeSlot}`;
}

export function localDateKey(date, timeZone = YOUTUBE_TIME_ZONE) {
    const parts = localDateTimeParts(date, timeZone);
    return `${parts.year}-${parts.month}-${parts.day}`;
}

export function localDateTimeParts(date, timeZone) {
    const values = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).formatToParts(date).filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value]));
    return {
        year: values.year,
        month: values.month,
        day: values.day,
        hour: values.hour === "24" ? "00" : values.hour,
        minute: values.minute,
    };
}

function timeZoneOffsetMinutes(date, timeZone) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "shortOffset",
    }).formatToParts(date).filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value]));
    const offset = parts.timeZoneName || "GMT";
    if (offset === "GMT" || offset === "UTC") return 0;
    const match = offset.match(/^GMT([+-])(\d{1,2})(?::?(\d{2}))?$/);
    if (!match) throw new Error(`Unable to determine offset for ${timeZone}.`);
    const minutes = Number(match[2]) * 60 + Number(match[3] || 0);
    return match[1] === "-" ? -minutes : minutes;
}

function titlePart(value, label) {
    if (typeof value !== "string" || !value.trim()) throw new Error(`YouTube title ${label} is required.`);
    const normalized = value.trim();
    if (normalized !== normalized.toUpperCase() || !/[A-Z]/.test(normalized)) return normalized;
    return normalized.toLowerCase().replace(/(^|[\s/+×&^_-])([a-z])/g, (_match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadYouTubePublishingConfig()
        .then((config) => {
            const readyCount = [
                ...(config.videoReady.orbRace.orbs || []),
                ...(config.videoReady.orbRace.groups || []),
                ...(config.videoReady.orbFoundry.orbs || []),
                ...(config.videoReady.orbFoundry.groups || []),
            ].length;
            console.log(JSON.stringify({
                valid: true,
                timeZone: config.timeZone,
                schedule: config.schedule,
                videoReadyEntries: readyCount,
                activation: readyCount > 0 ? "eligible-after-secrets" : "waiting-for-video-ready-roster",
            }, null, 2));
        })
        .catch((error) => {
            console.error(error.stack || error.message);
            process.exit(1);
        });
}
