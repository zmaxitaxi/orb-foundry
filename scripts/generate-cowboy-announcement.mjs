import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ACTIVE_DIR = join(ROOT, "assets", "audio", "announcer", "generated-classic-overhaul");
const SOURCE_DIR = join(ROOT, "assets", "audio", "source", "classic-announcer-20260807");
const SAY_PATH = process.env.SAY_PATH || "/usr/bin/say";
const FFMPEG_PATH = process.env.FFMPEG_PATH || join(ROOT, "node_modules", "@ffmpeg-installer", "darwin-arm64", "ffmpeg");
const tempDir = mkdtempSync(join("/tmp", "orb-foundry-cowboy-announcer-"));
const stem = "classic-cowboy";
const aiffPath = join(tempDir, `${stem}.aiff`);
const activePath = join(ACTIVE_DIR, `${stem}.mp3`);
const sourcePath = join(SOURCE_DIR, `${stem}.mp3`);

try {
    if (!existsSync(SAY_PATH)) throw new Error(`Mac speech synthesizer not found at ${SAY_PATH}`);
    if (!existsSync(FFMPEG_PATH)) throw new Error(`FFmpeg not found at ${FFMPEG_PATH}`);
    mkdirSync(ACTIVE_DIR, { recursive: true });
    mkdirSync(SOURCE_DIR, { recursive: true });
    execFileSync(SAY_PATH, ["-v", "Alex", "-r", "175", "-o", aiffPath, "Cowboy."], { stdio: "inherit" });
    if (statSync(aiffPath).size <= 4096) throw new Error("Speech synthesis returned no audio frames.");
    execFileSync(FFMPEG_PATH, [
        "-y", "-hide_banner", "-loglevel", "error", "-i", aiffPath,
        "-map_metadata", "-1", "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame",
        "-b:a", "96k", "-write_id3v2", "0", "-id3v2_version", "0", activePath,
    ], { stdio: "inherit" });
    if (statSync(activePath).size <= 4096) throw new Error("Encoded Cowboy announcement contains no usable audio frames.");
    copyFileSync(activePath, sourcePath);
    const manifestPath = join(SOURCE_DIR, "manifest.json");
    const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { announcements: {} };
    manifest.generatedAt = "2026-08-11";
    manifest.voice = "Alex";
    manifest.announcements ||= {};
    manifest.announcements.cowboy = {
        spokenText: "Cowboy",
        active: "assets/audio/announcer/generated-classic-overhaul/classic-cowboy.mp3",
        source: "assets/audio/source/classic-announcer-20260807/classic-cowboy.mp3",
        bytes: statSync(activePath).size,
    };
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`${activePath} (${statSync(activePath).size} bytes)`);
} finally {
    rmSync(tempDir, { recursive: true, force: true });
}
