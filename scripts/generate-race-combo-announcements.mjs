import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ORB_RACE_COMBO_NAMES } from "../src/orb-race.js";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ACTIVE_DIR = join(ROOT, "assets", "audio", "announcer", "generated-race");
const SOURCE_DIR = join(ROOT, "assets", "audio", "source", "race-announcer-generated");
const SAY_PATH = process.env.SAY_PATH || "/usr/bin/say";
const FFMPEG_PATH = process.env.FFMPEG_PATH || join(
  ROOT,
  "node_modules",
  "@ffmpeg-installer",
  "darwin-arm64",
  "ffmpeg",
);
const VOICE = process.env.RACE_ANNOUNCER_VOICE || "Alex";
const RATE = process.env.RACE_ANNOUNCER_RATE || "175";
const AUDIO_BITRATE = process.env.RACE_ANNOUNCER_BITRATE || "96k";
const DRILL_ONLY = process.argv.includes("--drill-only");
const ORBITAL_ONLY = process.argv.includes("--orbital-only");
const LOCAL_WAV_RACE_IDS = new Set(["tripler"]);

function raceVoiceAssetPath(id) {
  const extension = LOCAL_WAV_RACE_IDS.has(id) ? "wav" : "mp3";
  return join(ACTIVE_DIR, `race-${id}.${extension}`);
}

function createSplicedComboAudio(key, outputPath) {
  const inputPaths = key.split("+").map(raceVoiceAssetPath);
  if (inputPaths.some((inputPath) => !existsSync(inputPath))) {
    throw new Error(`Cannot splice ${key}: a base race voice clip is missing`);
  }
  const audioLabels = inputPaths.map((_, index) => `[a${index}]`).join("");
  const filters = inputPaths.map((_, index) => (
    `[${index}:a]silenceremove=start_periods=1:start_duration=0.02:start_threshold=-45dB:stop_periods=1:stop_duration=0.04:stop_threshold=-45dB[a${index}]`
  ));
  filters.push(`${audioLabels}acrossfade=d=0.04:c1=tri:c2=tri[aout]`);
  execFileSync(FFMPEG_PATH, [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    ...inputPaths.flatMap((inputPath) => ["-i", inputPath]),
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[aout]",
    "-map_metadata",
    "-1",
    "-ar",
    "24000",
    "-ac",
    "1",
    "-c:a",
    "libmp3lame",
    "-b:a",
    AUDIO_BITRATE,
    "-write_id3v2",
    "0",
    "-id3v2_version",
    "0",
    outputPath,
  ], { stdio: "inherit" });
}

if (!existsSync(SAY_PATH)) throw new Error(`Mac speech synthesizer not found at ${SAY_PATH}`);
if (!existsSync(FFMPEG_PATH)) throw new Error(`FFmpeg not found at ${FFMPEG_PATH}`);
const availableVoices = execFileSync(SAY_PATH, ["-v", "?"], { encoding: "utf8" });
if (!availableVoices.split(/\r?\n/).some((line) => line.trim().startsWith(`${VOICE} `))) {
  throw new Error(`Requested macOS voice "${VOICE}" is not installed. Download it in System Settings > Accessibility > Read & Speak > System Voice > Manage Voices, then rerun this command.`);
}

mkdirSync(ACTIVE_DIR, { recursive: true });
mkdirSync(SOURCE_DIR, { recursive: true });
const tempDir = mkdtempSync(join("/tmp", "orb-foundry-combo-"));

try {
  const comboEntries = Object.entries(ORB_RACE_COMBO_NAMES).filter(([key]) => (
    (!DRILL_ONLY || key.endsWith("+drill"))
    && (!ORBITAL_ONLY || key.includes("orbital"))
  ));
  for (const [key, definition] of comboEntries) {
    const stem = `race-combo-${key.replace("+", "-")}`;
    const wavPath = join(tempDir, `${stem}.aiff`);
    const activePath = join(ACTIVE_DIR, `${stem}.mp3`);
    const sourcePath = join(SOURCE_DIR, `${stem}.mp3`);
    execFileSync(SAY_PATH, ["-v", VOICE, "-r", RATE, "-o", wavPath, `${definition.name}.`], { stdio: "inherit" });
    if (statSync(wavPath).size > 4096) {
      execFileSync(FFMPEG_PATH, [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        wavPath,
        "-map_metadata",
        "-1",
        "-ar",
        "24000",
        "-ac",
        "1",
        "-c:a",
        "libmp3lame",
        "-b:a",
        AUDIO_BITRATE,
        "-write_id3v2",
        "0",
        "-id3v2_version",
        "0",
        activePath,
      ], { stdio: "inherit" });
    } else {
      console.log(`${key}: speech backend returned no samples; splicing the existing Alex base clips`);
      createSplicedComboAudio(key, activePath);
    }
    copyFileSync(activePath, sourcePath);
    console.log(`${key}: ${definition.name} -> ${activePath}`);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
