import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ACTIVE_DIR = join(ROOT, "assets", "audio", "announcer", "generated-classic-overhaul");
const SOURCE_DIR = join(ROOT, "assets", "audio", "source", "classic-announcer-20260807");
const SAY_PATH = process.env.SAY_PATH || "/usr/bin/say";
const FFMPEG_PATH = process.env.FFMPEG_PATH || join(
  ROOT,
  "node_modules",
  "@ffmpeg-installer",
  "darwin-arm64",
  "ffmpeg",
);
const VOICE = process.env.CLASSIC_ANNOUNCER_VOICE || "Alex";
const RATE = process.env.CLASSIC_ANNOUNCER_RATE || "175";
const AUDIO_BITRATE = process.env.CLASSIC_ANNOUNCER_BITRATE || "96k";

// Existing Race announcements remain the source of truth for shared fighters.
// These are the Classic-only names, plus names whose Classic spelling differs
// from the reusable Race callout (for example Sawball and Parasites).
const ANNOUNCEMENTS = Object.freeze({
  tripwire: "Tripwire",
  necromancer: "Necromancer",
  spikey: "Spikey",
  virus: "Virus",
  cobwebs: "Cobwebs",
  apple: "Apple",
  cowboy: "Cowboy",
  "hive-ball": "Hive Ball",
  zeus: "Zeus",
  "glass-ball": "Glass Ball",
  pistol: "Pistol",
  shotgun: "Shotgun",
  rifle: "Rifle",
  sawball: "Sawball",
  cutter: "Cutter",
  trident: "Trident",
  parasites: "Parasites",
  train: "Train",
  "frost-ball": "Frost Ball",
  boxer: "Boxer",
  artist: "Artist",
  monster: "Monster",
  fairy: "Fairy",
});

if (!existsSync(SAY_PATH)) throw new Error(`Mac speech synthesizer not found at ${SAY_PATH}`);
if (!existsSync(FFMPEG_PATH)) throw new Error(`FFmpeg not found at ${FFMPEG_PATH}`);
const availableVoices = execFileSync(SAY_PATH, ["-v", "?"], { encoding: "utf8" });
if (!availableVoices.split(/\r?\n/).some((line) => line.trim().startsWith(`${VOICE} `))) {
  throw new Error(`Requested macOS voice "${VOICE}" is not installed.`);
}

mkdirSync(ACTIVE_DIR, { recursive: true });
mkdirSync(SOURCE_DIR, { recursive: true });
const tempDir = mkdtempSync(join("/tmp", "orb-foundry-classic-announcer-"));
const manifest = {
  generatedAt: "2026-08-07",
  generator: "scripts/generate-classic-overhaul-announcements.mjs",
  voice: VOICE,
  rate: Number(RATE),
  format: { sampleRate: 24000, channels: 1, codec: "mp3", bitrate: AUDIO_BITRATE },
  announcements: {},
};

try {
  for (const [id, announcement] of Object.entries(ANNOUNCEMENTS)) {
    const stem = `classic-${id}`;
    const aiffPath = join(tempDir, `${stem}.aiff`);
    const activePath = join(ACTIVE_DIR, `${stem}.mp3`);
    const sourcePath = join(SOURCE_DIR, `${stem}.mp3`);
    execFileSync(SAY_PATH, ["-v", VOICE, "-r", RATE, "-o", aiffPath, `${announcement}.`], { stdio: "inherit" });
    if (statSync(aiffPath).size <= 4096) {
      throw new Error(`Speech synthesis returned no audio frames for ${id}; rerun outside the sandbox.`);
    }
    execFileSync(FFMPEG_PATH, [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      aiffPath,
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
    if (statSync(activePath).size <= 4096) {
      throw new Error(`Encoded announcement contains no usable audio frames for ${id}.`);
    }
    copyFileSync(activePath, sourcePath);
    manifest.announcements[id] = {
      spokenText: announcement,
      active: `assets/audio/announcer/generated-classic-overhaul/${stem}.mp3`,
      source: `assets/audio/source/classic-announcer-20260807/${stem}.mp3`,
      bytes: statSync(activePath).size,
    };
    console.log(`${id}: ${announcement} -> ${activePath}`);
  }
  writeFileSync(join(SOURCE_DIR, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
