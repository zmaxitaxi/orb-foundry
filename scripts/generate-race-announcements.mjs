import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ORB_RACE_COMBO_NAMES } from "../src/orb-race.js";
import {
  ANNOUNCER_NAMES,
  RACE_ANNOUNCER_COUNT_NAMES,
  RACE_ANNOUNCER_NAMES,
  RACE_GROUP_ANNOUNCER_NAMES,
} from "../src/audio.js";

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
const PRE_SPEECH_PAUSE_MS = Object.freeze({
  "pick-your-winner": 350,
});
// Keep the public labels unchanged while giving macOS Alex explicit syllable
// spacing for the two requested Orb Race announcements.
const RACE_ANNOUNCER_SPEECH_OVERRIDES = Object.freeze({
  fibonacci: "Fee buh naa chee",
  mines: "Splodee",
});
const COUNT_ANNOUNCEMENTS = Object.freeze(Object.entries(RACE_ANNOUNCER_COUNT_NAMES).map(([count, text]) => ({
  id: `count-${count}`,
  text,
})));
const COUNT_MILESTONE_ANNOUNCEMENTS = Object.freeze(COUNT_ANNOUNCEMENTS.filter(({ id }) => (
  Number(id.slice("count-".length)) > 10
)));
const BOSS_ANNOUNCEMENT = Object.freeze({ id: "boss", text: "Boss" });
const NEW_ORB_ANNOUNCEMENTS = Object.freeze(
  ["sylvester", "lucas", "tetration", "professor", "phase-three-sun", "phase-two-sun", "trifecta", "gravitator", "rain", "hacker", "miner", "breaker", "square-root", "progressive", "random", "purple-sun", "super-slammy", "piercer", "tsar-bomb", "all-in-one"].map((id) => ({
    id,
    text: RACE_ANNOUNCER_NAMES[id],
  })),
);
const NEW_GROUP_ANNOUNCEMENTS = Object.freeze([
  { id: "group-suns", text: RACE_GROUP_ANNOUNCER_NAMES.suns },
]);
const BOMB_ANNOUNCEMENTS = Object.freeze([
  { id: "group-bombs", text: RACE_GROUP_ANNOUNCER_NAMES.bombs },
  { id: "antimatter-bomb", text: RACE_ANNOUNCER_NAMES["antimatter-bomb"] },
  { id: "time-bomb", text: RACE_ANNOUNCER_NAMES["time-bomb"] },
  { id: "reality-bomb", text: RACE_ANNOUNCER_NAMES["reality-bomb"] },
  { id: "tsar-bomb", text: RACE_ANNOUNCER_NAMES["tsar-bomb"] },
]);
const PRONUNCIATION_FIX_ANNOUNCEMENTS = Object.freeze(
  ["fibonacci", "mines"].map((id) => ({ id, text: RACE_ANNOUNCER_NAMES[id] })),
);
const TWINS_SCISSOR_ANNOUNCEMENTS = Object.freeze(
  ["twins", "scissor"].map((id) => ({ id, text: RACE_ANNOUNCER_NAMES[id] })),
);
const BASE_ANNOUNCEMENTS = Object.freeze([
  ...Object.entries(ANNOUNCER_NAMES)
    .filter(([id]) => !Object.hasOwn(RACE_ANNOUNCER_NAMES, id))
    .map(([id, text]) => ({ id, text })),
  ...Object.entries(RACE_ANNOUNCER_NAMES).map(([id, text]) => ({ id, text })),
  ...Object.entries(RACE_GROUP_ANNOUNCER_NAMES).map(([id, text]) => ({ id: `group-${id}`, text })),
  ...Object.entries(ORB_RACE_COMBO_NAMES).map(([key, definition]) => ({
    id: `combo-${key.replace("+", "-")}`,
    text: definition.name,
  })),
  { id: "everyone", text: "Everyone" },
  { id: "plus", text: "Plus" },
  { id: "versus", text: "Versus" },
  { id: "pick-your-winner", text: "Pick your winner" },
]);
const ANNOUNCEMENTS = Object.freeze(
  process.argv.includes("--super-x-power-only")
    ? BASE_ANNOUNCEMENTS.filter(({ id }) => id === "super-x-power")
    : process.argv.includes("--boss-only")
      ? [BOSS_ANNOUNCEMENT]
    : process.argv.includes("--new-orbs-only")
      ? [...NEW_ORB_ANNOUNCEMENTS, ...NEW_GROUP_ANNOUNCEMENTS]
    : process.argv.includes("--bombs-only")
      ? BOMB_ANNOUNCEMENTS
    : process.argv.includes("--pronunciation-fixes-only")
      ? PRONUNCIATION_FIX_ANNOUNCEMENTS
    : process.argv.includes("--twins-scissor-only")
      ? TWINS_SCISSOR_ANNOUNCEMENTS
    : process.argv.includes("--counts-only")
    ? COUNT_ANNOUNCEMENTS
    : process.argv.includes("--count-milestones-only")
      ? COUNT_MILESTONE_ANNOUNCEMENTS
      : process.argv.includes("--classic-only")
      ? BASE_ANNOUNCEMENTS.filter(({ id }) => Object.hasOwn(ANNOUNCER_NAMES, id) && !Object.hasOwn(RACE_ANNOUNCER_NAMES, id))
    : [...BASE_ANNOUNCEMENTS, ...COUNT_ANNOUNCEMENTS],
);

if (!existsSync(SAY_PATH)) throw new Error(`Mac speech synthesizer not found at ${SAY_PATH}`);
if (!existsSync(FFMPEG_PATH)) throw new Error(`FFmpeg not found at ${FFMPEG_PATH}`);
const availableVoices = execFileSync(SAY_PATH, ["-v", "?"], { encoding: "utf8" });
if (!availableVoices.split(/\r?\n/).some((line) => line.trim().startsWith(`${VOICE} `))) {
  throw new Error(`Requested macOS voice "${VOICE}" is not installed. Download it in System Settings > Accessibility > Read & Speak > System Voice > Manage Voices, then rerun this command.`);
}

mkdirSync(ACTIVE_DIR, { recursive: true });
mkdirSync(SOURCE_DIR, { recursive: true });
const tempDir = mkdtempSync(join("/tmp", "orb-foundry-race-announcer-"));

try {
  for (const { id, text } of ANNOUNCEMENTS) {
    const stem = `race-${id}`;
    const wavPath = join(tempDir, `${stem}.aiff`);
    const activePath = join(ACTIVE_DIR, `${stem}.mp3`);
    const sourcePath = join(SOURCE_DIR, `${stem}.mp3`);
    const speechText = RACE_ANNOUNCER_SPEECH_OVERRIDES[id] || text;
    execFileSync(SAY_PATH, ["-v", VOICE, "-r", RATE, "-o", wavPath, `${speechText}.`], { stdio: "inherit" });
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
    console.log(`${id}: ${text} -> ${activePath}`);
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
