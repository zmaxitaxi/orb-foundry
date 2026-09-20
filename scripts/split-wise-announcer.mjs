#!/usr/bin/env node
import { mkdir, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "assets", "audio", "announcer", "wise");
const NAMES = Object.freeze({
  fire: "Cinder",
  ice: "Frost",
  wizard: "Hex",
  time: "Chrono",
  volta: "Volta",
  venom: "Venom",
  gravis: "Gravis",
  aegis: "Aegon",
});
const TYPES = Object.freeze(Object.keys(NAMES));

const LINE_TO_FILE = new Map([
  ["Three", "three.wav"],
  ["Two", "two.wav"],
  ["One", "one.wav"],
  ["Fight", "fight.wav"],
  ["Knockout", "knockout.wav"],
  ["Overtime", "overtime.wav"],
]);

for (const left of TYPES) {
  for (const right of TYPES) {
    if (left !== right) LINE_TO_FILE.set(`${NAMES[left]} vs ${NAMES[right]}`, `${left}-vs-${right}.wav`);
  }
  LINE_TO_FILE.set(`${NAMES[left]} wins`, `${left}-wins.wav`);
}

export async function splitWiseAnnouncer({ mediaPath, srtPath, outDir = OUT_DIR, ffmpegPath = process.env.FFMPEG_PATH || ffmpegInstaller.path || "ffmpeg" }) {
  if (!mediaPath || !srtPath) throw new Error("Usage: node scripts/split-wise-announcer.mjs <reel.mp4> <captions.srt>");
  const cues = parseSrt(await readFile(srtPath, "utf8"));
  await mkdir(outDir, { recursive: true });
  const written = [];
  const skipped = [];
  for (const cue of cues) {
    const filename = LINE_TO_FILE.get(cleanLine(cue.text));
    if (!filename) {
      skipped.push(cue.text);
      continue;
    }
    const start = Math.max(0, cue.start - 0.045);
    const end = cue.end + 0.08;
    const outputPath = join(outDir, filename);
    await runFfmpeg(ffmpegPath, [
      "-y",
      "-ss", seconds(start),
      "-to", seconds(end),
      "-i", mediaPath,
      "-vn",
      "-ac", "1",
      "-ar", "44100",
      "-sample_fmt", "s16",
      outputPath,
    ]);
    written.push({ line: cue.text, filename });
  }
  return { written, skipped };
}

function parseSrt(source) {
  return source
    .replace(/\r/g, "")
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").filter(Boolean);
      const timeLine = lines.find((line) => line.includes("-->"));
      if (!timeLine) return null;
      const [start, end] = timeLine.split("-->").map((value) => parseTimestamp(value.trim()));
      return { start, end, text: lines.slice(lines.indexOf(timeLine) + 1).join(" ").trim() };
    })
    .filter(Boolean);
}

function parseTimestamp(value) {
  const match = value.match(/(\d+):(\d+):(\d+),(\d+)/);
  if (!match) throw new Error(`Invalid SRT timestamp: ${value}`);
  const [, hours, minutes, secondsValue, millis] = match.map(Number);
  return hours * 3600 + minutes * 60 + secondsValue + millis / 1000;
}

function cleanLine(value) {
  return value.replace(/[.?!]+$/g, "").trim();
}

function seconds(value) {
  return value.toFixed(3);
}

function runFfmpeg(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      if (error.code === "ENOENT") reject(new Error("FFmpeg is required to split the announcer reel. Install ffmpeg or set FFMPEG_PATH."));
      else reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`FFmpeg failed with exit code ${code}:\n${stderr.trim()}`));
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  splitWiseAnnouncer({ mediaPath: process.argv[2], srtPath: process.argv[3] })
    .then(({ written, skipped }) => {
      console.log(JSON.stringify({ written: written.length, skipped }, null, 2));
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}
