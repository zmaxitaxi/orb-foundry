import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
const ANNOUNCEMENTS = Object.freeze({
  needle: "Needle",
  multiplier: "Multiplier",
  sniper: "Sniper",
  snowball: "Snowball",
  countdown: "Countdown",
  copycat: "Copycat",
  critical: "Critical",
  commander: "Commander",
  shrapnel: "Shrapnel",
  roulette: "Absorber",
  architect: "Architect",
  "100x": "100X",
  grappler: "Grappler",
  artists: "Artists",
  pancake: "Pancake",
  tree: "Tree",
});
const PRE_SPEECH_PAUSE_MS = Object.freeze({});

if (!existsSync(SAY_PATH)) throw new Error(`Mac speech synthesizer not found at ${SAY_PATH}`);
if (!existsSync(FFMPEG_PATH)) throw new Error(`FFmpeg not found at ${FFMPEG_PATH}`);
const availableVoices = execFileSync(SAY_PATH, ["-v", "?"], { encoding: "utf8" });
if (!availableVoices.split(/\r?\n/).some((line) => line.trim().startsWith(`${VOICE} `))) {
  throw new Error(`Requested macOS voice "${VOICE}" is not installed. Download it in System Settings > Accessibility > Read & Speak > System Voice > Manage Voices, then rerun this command.`);
}

mkdirSync(ACTIVE_DIR, { recursive: true });
mkdirSync(SOURCE_DIR, { recursive: true });
const tempDir = mkdtempSync(join("/tmp", "orb-foundry-new-orbs-"));

try {
  for (const [id, announcement] of Object.entries(ANNOUNCEMENTS)) {
    const stem = `race-${id}`;
    const wavPath = join(tempDir, `${stem}.aiff`);
    const activePath = join(ACTIVE_DIR, `${stem}.mp3`);
    const sourcePath = join(SOURCE_DIR, `${stem}.mp3`);
    execFileSync(SAY_PATH, ["-v", VOICE, "-r", RATE, "-o", wavPath, `${announcement}.`], { stdio: "inherit" });
    execFileSync(FFMPEG_PATH, [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      wavPath,
      ...(PRE_SPEECH_PAUSE_MS[id]
        ? ["-af", `adelay=${PRE_SPEECH_PAUSE_MS[id]}:all=1`]
        : []),
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
    copyFileSync(activePath, sourcePath);
    console.log(`${id}: ${announcement} -> ${activePath}`);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
