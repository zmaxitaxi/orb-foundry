#!/usr/bin/env node
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ORB_RACERS } from "../src/orb-race.js";
import { createSimulation, stepSimulation } from "../src/simulation.js";
import { exportSocialVideo } from "./export-random-battle.mjs";
import { transcodeBattleVideo } from "./transcode-battle-video.mjs";
import {
    YOUTUBE_CONFIG_PATH,
    dueYouTubeSlotsAt,
    loadYouTubePublishingConfig,
    localDateKey,
    scheduledPublishAt,
    youtubeDescription,
    youtubeMetadata,
    youtubeRunTag,
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

export function seedForYouTubeRun(dateKey, slotId) {
    const input = `${dateKey}:${slotId}`;
    let hash = 2_166_136_261;
    for (const character of input) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16_777_619);
    }
    return (hash >>> 0) % 999_999_999 || 1;
}

export function selectYouTubeMatchup({ dateKey, slotId, config, blockedIds = new Set(), rosterIds = null }) {
    const roster = (rosterIds || config.videoReady.orbRace.orbs).filter((id) => ORB_RACERS[id]);
    if (roster.length < 2) throw new Error("The YouTube Orb Race allowlist needs at least two playable orbs.");
    const layerStrengths = layerStrengthsFor(config, slotId);
    const contentType = config.schedule.find(({ id }) => id === slotId)?.contentType || "short";
    let best = null;
    for (let attempt = 0; attempt < MAX_MATCHUP_ATTEMPTS; attempt += 1) {
        const seed = seedForYouTubeRun(dateKey, `${slotId}:attempt-${attempt}`);
        const format = weightedBattleFormat(config.quality.battleFormats, seed);
        const orderedIds = availableRosterIds(roster, seed, blockedIds);
        const memberCount = format.teamSizes.reduce((sum, size) => sum + Number(size), 0);
        if (orderedIds.length < memberCount) continue;
        const leftIds = orderedIds.slice(0, Number(format.teamSizes[0]));
        const rightIds = orderedIds.slice(leftIds.length, leftIds.length + Number(format.teamSizes[1]));
        const raceTeams = [leftIds, rightIds];
        const battleQuality = evaluateYouTubeBattle({
            raceTeams,
            layerStrengths,
            contentType,
            seed,
            quality: config.quality,
        });
        const candidate = {
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
            battleQuality,
        };
        if (!best || matchupScore(candidate) < matchupScore(best)) best = candidate;
        if (battleQuality.accepted) return candidate;
    }
    if (best) {
        throw new Error(
            `No close YouTube matchup found for ${dateKey}/${slotId}; best progress margin was ${best.battleQuality.progressMargin}.`,
        );
    }
    throw new Error(`Unable to build a YouTube matchup for ${dateKey}/${slotId}.`);
}

export function buildDailyYouTubePlans({ dateKey, config }) {
    const roster = config.videoReady.orbRace.orbs.filter((id) => ORB_RACERS[id]);
    const maxTeamMembers = Math.max(...config.quality.battleFormats.map((format) => (
        format.teamSizes.reduce((sum, size) => sum + Number(size), 0)
    )));
    const dailyRoster = deterministicDailyRoster(
        roster,
        dateKey,
        config.schedule.length * maxTeamMembers * 2,
    );
    const usedToday = new Set();
    return config.schedule.map((slot) => {
        const matchup = selectYouTubeMatchup({
            dateKey,
            slotId: slot.id,
            config,
            blockedIds: usedToday,
            rosterIds: dailyRoster,
        });
        matchup.raceOrbs.forEach((id) => usedToday.add(id));
        return { slot, matchup };
    });
}

export function buildYouTubePublishPlan({ dateKey, slot, config }) {
    const selected = buildDailyYouTubePlans({ dateKey, config })
        .find(({ slot: candidate }) => candidate.id === slot.id);
    if (!selected) throw new Error(`YouTube slot ${slot.id} is not present in the publishing schedule.`);
    const matchup = selected.matchup;
    const metadata = youtubeMetadata({ left: matchup.left, right: matchup.right, config });
    const runTag = youtubeRunTag(dateKey, slot.id);
    const minimumDurationSeconds = Number(config.quality.minimumDurationSeconds[slot.contentType]);
    const plan = {
        dateKey,
        slotId: slot.id,
        contentType: slot.contentType,
        format: slot.contentType === "longform" ? "race-landscape" : "portrait",
        scheduledPublishAt: scheduledPublishAt(dateKey, slot.localTime, config.timeZone),
        minimumDurationSeconds,
        raceLayerStrengths: [...matchup.battleQuality.layerStrengths],
        announcerRequirements: { ...config.quality.announcer },
        runTag,
        seed: matchup.seed,
        formatId: matchup.formatId,
        raceTeams: matchup.raceTeams.map((team) => [...team]),
        raceOrbs: [...matchup.raceOrbs],
        leftIds: [...matchup.leftIds],
        rightIds: [...matchup.rightIds],
        leftId: matchup.leftIds[0],
        rightId: matchup.rightIds[0],
        left: matchup.left,
        right: matchup.right,
        battleQuality: matchup.battleQuality,
        title: metadata.title,
        description: metadata.description,
        tags: ["physics", "shorts", "simulation", "satisfying", "orb", "orb-foundry", runTag],
    };
    validateYouTubeGenerationSpec({ plan, config });
    return plan;
}

function layerStrengthsFor(config, slotId) {
    const contentType = config.schedule.find(({ id }) => id === slotId)?.contentType || "short";
    return [...config.quality.layerStrengths[contentType]];
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
    const start = seed % roster.length;
    const available = [];
    for (let offset = 0; offset < roster.length; offset += 1) {
        const id = roster[(start + offset) % roster.length];
        if (!blockedIds.has(id)) available.push(id);
    }
    return available;
}

function teamLabel(ids) {
    return ids.map((id) => ORB_RACERS[id].name).join(" + ");
}

function evaluateYouTubeBattle({ raceTeams, layerStrengths, contentType, seed, quality }) {
    const preview = createYouTubeSimulation({
        raceTeams,
        raceOrbs: raceTeams.flat(),
        layerStrengths,
        contentType,
        seed,
    });
    const damagePerSecond = preview.raceTeams.map((team) => Math.max(0, Number(team.raceDamagePerSecond) || 0));
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
    for (let step = 0; step < maxSteps && !sim.finished; step += 1) {
        stepSimulation(sim, SIMULATION_STEP_SECONDS);
    }
    const progress = sim.raceTeams.map((team) => raceTeamProgress(team, sim, adjustedLayerStrengths));
    const progressMargin = Math.abs(progress[0] - progress[1]);
    const layerLead = Math.abs(Math.floor(progress[0]) - Math.floor(progress[1]));
    const maxProgressMargin = Number(quality.closeBattle.maxProgressMargin);
    const maxLayerLead = Number(quality.closeBattle.maxLayerLead);
    return {
        accepted: sim.finished && progressMargin <= maxProgressMargin && layerLead <= maxLayerLead,
        finished: sim.finished,
        winnerTeamIndex: Number.isInteger(sim.winningRaceTeamIndex) ? sim.winningRaceTeamIndex : null,
        simulatedSeconds: Number(sim.time.toFixed(3)),
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

    const client = dryRun ? null : await createYouTubeApiClient({ env, fetchImpl });
    const items = [];
    const failures = [];
    for (const slot of slots) {
        const plan = buildYouTubePublishPlan({ dateKey: resolvedDateKey, slot, config });
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
                gameplayMode: "orb-race",
                raceOrbs: plan.raceOrbs,
                raceTeams: plan.raceTeams,
                raceLayerStrengths: plan.raceLayerStrengths,
                contentType: plan.contentType,
                format: plan.format,
                seed: plan.seed,
                minimumDurationSeconds: plan.minimumDurationSeconds,
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
