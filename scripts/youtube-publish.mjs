#!/usr/bin/env node
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ORB_RACERS } from "../src/orb-race.js";
import { exportSocialVideo } from "./export-random-battle.mjs";
import { transcodeBattleVideo } from "./transcode-battle-video.mjs";
import {
    YOUTUBE_CONFIG_PATH,
    dueYouTubeSlotsAt,
    loadYouTubePublishingConfig,
    localDateKey,
    youtubeDescription,
    youtubeMetadata,
    youtubeRunTag,
} from "./youtube-publishing.mjs";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const DEFAULT_OUTPUT_ROOT = join(ROOT, "artifacts", "youtube");
const YOUTUBE_UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos";
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const RETRIABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 4;
const UPLOAD_CHUNK_SIZE = 8 * 1024 * 1024;

export function seedForYouTubeRun(dateKey, slotId) {
    const input = `${dateKey}:${slotId}`;
    let hash = 2_166_136_261;
    for (const character of input) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16_777_619);
    }
    return (hash >>> 0) % 999_999_999 || 1;
}

export function selectYouTubeMatchup({ dateKey, slotId, config }) {
    const roster = config.videoReady.orbRace.orbs.filter((id) => ORB_RACERS[id]);
    if (roster.length < 2) throw new Error("The YouTube Orb Race allowlist needs at least two playable orbs.");
    const seed = seedForYouTubeRun(dateKey, slotId);
    const leftIndex = seed % roster.length;
    const rightIndex = (Math.floor(seed / roster.length) + 1) % roster.length;
    const leftId = roster[leftIndex];
    const rightId = roster[rightIndex === leftIndex ? (rightIndex + 1) % roster.length : rightIndex];
    return {
        seed,
        leftId,
        rightId,
        left: ORB_RACERS[leftId].name,
        right: ORB_RACERS[rightId].name,
    };
}

export function buildYouTubePublishPlan({ dateKey, slot, config }) {
    const matchup = selectYouTubeMatchup({ dateKey, slotId: slot.id, config });
    const metadata = youtubeMetadata({ left: matchup.left, right: matchup.right, config });
    const runTag = youtubeRunTag(dateKey, slot.id);
    return {
        dateKey,
        slotId: slot.id,
        contentType: slot.contentType,
        format: slot.contentType === "longform" ? "race-landscape" : "portrait",
        runTag,
        seed: matchup.seed,
        leftId: matchup.leftId,
        rightId: matchup.rightId,
        left: matchup.left,
        right: matchup.right,
        title: metadata.title,
        description: metadata.description,
        tags: ["physics", "shorts", "simulation", "satisfying", "orb", "orb-foundry", runTag],
    };
}

export async function publishDueYouTubeSlots({
    now = new Date(),
    slotId = null,
    dateKey = null,
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
    const slots = dueYouTubeSlotsAt(now, config, { slotId: resolvedSlotId });
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

            const exportResult = await exportSocialVideo({
                outputDirectory: resolve(outputRoot, resolvedDateKey, plan.slotId),
                outputDateKey: resolvedDateKey,
                gameplayMode: "orb-race",
                raceOrbs: [plan.leftId, plan.rightId],
                contentType: plan.contentType,
                format: plan.format,
                seed: plan.seed,
                title: plan.title,
                description: plan.description,
                runTag: plan.runTag,
            });
            const transcoded = await transcodeBattleVideo(exportResult.metadataPath);
            const upload = await client.uploadVideo({
                filePath: transcoded.mp4Path,
                title: plan.title,
                description: plan.description,
                tags: plan.tags,
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

    async uploadVideo({ filePath, title, description, tags }) {
        const file = await readFile(filePath);
        const fileInfo = await stat(filePath);
        const initResponse = await this.fetchWithRetry(YOUTUBE_UPLOAD_URL + "?part=snippet,status", {
            method: "POST",
            headers: {
                ...this.authHeaders(),
                "content-type": "application/json; charset=UTF-8",
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
                    privacyStatus: "public",
                    selfDeclaredMadeForKids: false,
                },
            }),
        });
        const uploadUrl = initResponse.headers.get("location");
        if (!uploadUrl) throw new Error("YouTube did not return a resumable upload URL.");

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
    const values = { slotId: null, dateKey: null, dryRun: false };
    for (const argument of argv) {
        if (argument === "--dry-run") values.dryRun = true;
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
