import { CLASSIC_ORBS, CLASSIC_ORB_IDS } from "./classic-orbs.js?v=20261112-battle-lab-engine4";
import { classicOrbOptionDefaults, normalizeSettings, settingsToUrl } from "./config.js?v=20261112-battle-lab-engine4";

export const LAB_SCHEMA_VERSION = 1;
export const LAB_ENGINE_VERSION = "classic-071700f";
export const LAB_MAX_SECONDS = 90;
export const LAB_STEP = 1 / 120;
export const LAB_STORAGE_KEY = "orb-foundry.battle-lab.v1";
export const LAB_PRESETS = Object.freeze([
    Object.freeze({ id: "momentum", title: "Pinball vs Rubber", left: "pinball", right: "rubber", seed: 418, arenaShape: "square" }),
    Object.freeze({ id: "paper-sand", title: "Origami vs Sand Pharaoh", left: "origami", right: "sand-pharaoh", seed: 231, arenaShape: "circle" }),
    Object.freeze({ id: "chains", title: "Magneto vs Kratos", left: "magneto", right: "kratos", seed: 2406, arenaShape: "square" }),
    Object.freeze({ id: "force", title: "Luke vs Vader", left: "luke-skywalker", right: "darth-vader", seed: 4, arenaShape: "square" }),
]);

export function labFighterName(id) {
    if (id === "wdc") return "WDC";
    return (CLASSIC_ORBS[id]?.name || id).toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function createLabChallenge(input = {}) {
    const left = input.left ?? LAB_PRESETS[0].left;
    const right = input.right ?? LAB_PRESETS[0].right;
    if (!CLASSIC_ORB_IDS.includes(left) || !CLASSIC_ORB_IDS.includes(right)) throw new Error("Choose two fighters from the Classic roster.");
    const seed = Number(input.seed ?? LAB_PRESETS[0].seed);
    if (!Number.isInteger(seed) || seed < 1 || seed > 0xffffffff) throw new Error("Use a whole seed between 1 and 4,294,967,295.");
    const arenaShape = input.arenaShape ?? "square";
    if (!["square", "circle"].includes(arenaShape)) throw new Error("Choose a square or circle arena.");
    const health = [left, right].map((id, index) => {
        const value = Number(input.health?.[index] ?? classicOrbOptionDefaults(id).health);
        if (!Number.isInteger(value) || value < 1 || value > 2000) throw new Error("Starting health must be a whole number from 1 to 2,000.");
        return value;
    });
    const title = String(input.title || "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80)
        || `${labFighterName(left)} vs ${labFighterName(right)}`;
    return { version: LAB_SCHEMA_VERSION, engine: LAB_ENGINE_VERSION, title, left, right, seed, arenaShape, health };
}

export function validateLabChallenge(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("This is not an Orb Foundry challenge.");
    if (input.version !== LAB_SCHEMA_VERSION) throw new Error("This challenge format is not supported. Choose a sample to start a new challenge.");
    if (input.engine !== LAB_ENGINE_VERSION) throw new Error("This challenge was made with a different simulation version. Its exact outcome cannot be reproduced here.");
    if (typeof input.left !== "string" || typeof input.right !== "string" || typeof input.seed !== "number"
        || !Array.isArray(input.health) || input.health.length !== 2 || input.health.some((value) => typeof value !== "number")) {
        throw new Error("The challenge is incomplete. Share a new link from the Battle Lab.");
    }
    return createLabChallenge(input);
}

export function labSimulationSettings(challenge) {
    const value = validateLabChallenge(challenge);
    return normalizeSettings({
        gameplayMode: "classic", classicTeams: [[value.left], [value.right]],
        classicTeamOptions: [value.left, value.right].map((id, index) => ({
            [id]: { ...classicOrbOptionDefaults(id), count: 1, health: value.health[index] },
        })),
        seed: value.seed, arenaShape: value.arenaShape, arenaSize: "large", hazardPreset: "none",
        classicBlackTheme: true, classicTeamColors: false, classicReferenceDuel: false,
        features: { replay: false, introCards: false },
    });
}

export function labChallengeToUrl(challenge, baseUrl) {
    const bytes = new TextEncoder().encode(JSON.stringify(validateLabChallenge(challenge)));
    const token = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const url = new URL(baseUrl, "http://localhost/lab.html");
    url.search = "";
    url.hash = "";
    url.searchParams.set("challenge", token);
    return url;
}

export function labChallengeFromUrl(value) {
    const token = new URL(value, "http://localhost/lab.html").searchParams.get("challenge");
    if (!token) return null;
    if (token.length > 4096 || !/^[A-Za-z0-9_-]+$/.test(token)) throw new Error("This challenge link is invalid or too long.");
    try {
        const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
        const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
        return validateLabChallenge(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)));
    } catch (error) {
        if (error.message?.includes("version") || error.message?.includes("format")) throw error;
        throw new Error("This challenge link is damaged. Ask for a new link or choose a sample.");
    }
}

export function labRecorderUrl(challenge, baseUrl) {
    const settings = labSimulationSettings(challenge);
    return settingsToUrl({ ...settings, features: { ...settings.features, introCards: true } }, new URL("./index.html", baseUrl));
}

export function parseLabImport(text) {
    if (typeof text !== "string" || text.length > 2_000_000) throw new Error("Choose a challenge or replay JSON file smaller than 2 MB.");
    let data;
    try { data = JSON.parse(text); } catch { throw new Error("The file is not valid JSON."); }
    if (data?.type === "orb-foundry-replay" && data.version !== LAB_SCHEMA_VERSION) throw new Error("This replay file format is not supported.");
    const challenge = validateLabChallenge(data?.challenge ?? data);
    const proof = data?.type === "orb-foundry-replay" && data?.proof;
    if (proof && (!/^[a-f0-9]{8}$/.test(proof.stateHash) || !/^[a-f0-9]{8}$/.test(proof.eventHash))) {
        throw new Error("The replay fingerprint is incomplete.");
    }
    return { challenge, proof: proof ? { stateHash: proof.stateHash, eventHash: proof.eventHash } : null };
}

export function readLabLibrary(storage) {
    try {
        const data = JSON.parse(storage.getItem(LAB_STORAGE_KEY) || "[]");
        if (!Array.isArray(data)) return [];
        return data.slice(0, 12).flatMap((item) => {
            try { return [{ challenge: validateLabChallenge(item.challenge), savedAt: String(item.savedAt || "") }]; } catch { return []; }
        });
    } catch { return []; }
}

export function saveLabChallenge(storage, challenge, savedAt = new Date().toISOString()) {
    const normalized = validateLabChallenge(challenge);
    const key = JSON.stringify(normalized);
    const items = [{ challenge: normalized, savedAt }, ...readLabLibrary(storage)
        .filter((item) => JSON.stringify(item.challenge) !== key)].slice(0, 12);
    storage.setItem(LAB_STORAGE_KEY, JSON.stringify(items));
    return items;
}
