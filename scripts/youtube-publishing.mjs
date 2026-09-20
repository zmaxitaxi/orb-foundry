#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASSIC_ORB_IDS } from "../src/classic-orbs.js";
import { ORB_RACER_IDS } from "../src/orb-race.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const YOUTUBE_CONFIG_PATH = resolve(ROOT, "config", "youtube-publishing.json");
export const YOUTUBE_TIME_ZONE = "America/Los_Angeles";
export const YOUTUBE_DESCRIPTION_HASHTAGS = Object.freeze([
    "#physics",
    "#shorts",
    "#simulation",
    "#satisfying",
]);
export const YOUTUBE_DUE_WINDOW_MINUTES = 45;

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
    validateVideoReadySection(config.videoReady?.orbRace, "orbRace", ORB_RACER_IDS);
    validateVideoReadySection(config.videoReady?.orbFoundry, "orbFoundry", CLASSIC_ORB_IDS);
    return config;
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
