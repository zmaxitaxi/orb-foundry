#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const YOUTUBE_CONFIG_PATH = resolve(ROOT, "config", "youtube-publishing.json");
export const YOUTUBE_TIME_ZONE = "America/Los_Angeles";
export const YOUTUBE_DESCRIPTION_HASHTAGS = Object.freeze([
    "#physics",
    "#shorts",
    "#simulation",
    "#satisfying",
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
    if (config.delivery.visibility !== "public") {
        throw new Error("YouTube publishing visibility must remain public for the approved no-review video loop.");
    }
    if (config.delivery.requireApproval !== false) {
        throw new Error("YouTube publishing requireApproval must be false for the approved no-review video loop.");
    }
    if (typeof config.titleTemplate !== "string" || !config.titleTemplate.includes("{left}") || !config.titleTemplate.includes("{right}")) {
        throw new Error("YouTube titleTemplate must include {left} and {right}.");
    }
    if (!Array.isArray(config.descriptionHashtags) || config.descriptionHashtags.length === 0) {
        throw new Error("YouTube descriptionHashtags must contain at least one hashtag.");
    }
    if (config.descriptionHashtags.join(" ") !== YOUTUBE_DESCRIPTION_HASHTAGS.join(" ")) {
        throw new Error("YouTube description hashtags must match the approved publishing contract.");
    }
    if (!Array.isArray(config.schedule) || config.schedule.length !== 3) {
        throw new Error("YouTube publishing schedule must contain exactly three daily slots.");
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
    validateVideoReadySection(config.videoReady?.orbRace, "orbRace");
    validateVideoReadySection(config.videoReady?.orbFoundry, "orbFoundry");
    return config;
}

function validateVideoReadySection(section, label) {
    if (!section || typeof section !== "object") throw new Error(`YouTube videoReady.${label} must be an object.`);
    for (const key of ["orbs", "groups"]) {
        if (!Array.isArray(section[key]) || section[key].some((value) => typeof value !== "string" || !value.trim())) {
            throw new Error(`YouTube videoReady.${label}.${key} must contain non-empty strings.`);
        }
    }
}

export function youtubeTitle(left, right, config = null) {
    const leftLabel = titlePart(left, "left");
    const rightLabel = titlePart(right, "right");
    const template = config?.titleTemplate || "{left} VS {right}";
    return template.replaceAll("{left}", leftLabel).replaceAll("{right}", rightLabel);
}

export function youtubeDescription(config = null) {
    return (config?.descriptionHashtags || YOUTUBE_DESCRIPTION_HASHTAGS).join(" ");
}

export function youtubeMetadata({ left, right, config = null } = {}) {
    return {
        title: youtubeTitle(left, right, config),
        description: youtubeDescription(config),
    };
}

export function localScheduleSlotsAt(date, config) {
    validateYouTubePublishingConfig(config);
    const localParts = localDateTimeParts(date, config.timeZone);
    const localTime = `${localParts.hour}:${localParts.minute}`;
    return config.schedule.filter((slot) => slot.localTime === localTime);
}

export function localDateKey(date, timeZone = YOUTUBE_TIME_ZONE) {
    const parts = localDateTimeParts(date, timeZone);
    return `${parts.year}-${parts.month}-${parts.day}`;
}

function localDateTimeParts(date, timeZone) {
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

function titlePart(value, label) {
    if (typeof value !== "string" || !value.trim()) throw new Error(`YouTube title ${label} is required.`);
    return value.trim();
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
