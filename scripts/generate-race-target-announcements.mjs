import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ACTIVE_DIR = join(ROOT, "assets", "audio", "announcer", "generated-race");
const SOURCE_DIR = join(ROOT, "assets", "audio", "source", "race-announcer-generated");
const SAY_PATH = "/usr/bin/say";
const FFMPEG_PATH = join(ROOT, "node_modules", "@ffmpeg-installer", "darwin-arm64", "ffmpeg");
const ANNOUNCEMENTS = Object.freeze([
  ["10000", "Who will break the ten thousand layer first?"],
  ["100000", "Who will break the one hundred thousand layer first?"],
  ["500000", "Who will break the five hundred thousand layer first?"],
  ["1000000", "Who will break the one million layer first?"],
  ["10000000", "Who will break the ten million layer first?"],
  ["500000000", "Who will break the five hundred million layer first?"],
  ["1000000000", "Who will break the one billion layer first?"],
  ["1000000000000000000", "Who will break the one quintillion layer first?"],
]);

if (!existsSync(SAY_PATH) || !existsSync(FFMPEG_PATH)) {
  throw new Error("macOS say and the bundled FFmpeg binary are required");
}

mkdirSync(ACTIVE_DIR, { recursive: true });
mkdirSync(SOURCE_DIR, { recursive: true });
const tempDir = mkdtempSync(join("/tmp", "orb-foundry-race-target-"));
try {
  for (const [id, text] of ANNOUNCEMENTS) {
    const stem = `race-target-${id}`;
    const aiffPath = join(tempDir, `${stem}.aiff`);
    const outputPath = join(ACTIVE_DIR, `${stem}.mp3`);
    execFileSync(SAY_PATH, ["-v", "Alex", "-r", "175", "-o", aiffPath, text]);
    execFileSync(FFMPEG_PATH, [
      "-y", "-hide_banner", "-loglevel", "error", "-i", aiffPath,
      "-map_metadata", "-1", "-ar", "24000", "-ac", "1",
      "-c:a", "libmp3lame", "-b:a", "96k", "-write_id3v2", "0",
      "-id3v2_version", "0", outputPath,
    ]);
    copyFileSync(outputPath, join(SOURCE_DIR, `${stem}.mp3`));
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
