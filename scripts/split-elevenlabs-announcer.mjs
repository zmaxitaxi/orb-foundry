#!/usr/bin/env node
import { spawn } from "node:child_process";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "assets", "audio", "announcer", "wise");
const SOURCE_DIR = join(ROOT, "assets", "audio", "source");
const TYPES = ["fire", "ice", "wizard", "time", "volta", "venom", "gravis", "aegis"];

const SHARED_AND_WINNERS = [
  ["fight.wav", 0.0, 0.48],
  ["overtime.wav", 0.68, 1.4],
  ["who-will-win.wav", 1.56, 2.48],
  ["fire-wins.wav", 2.52, 3.42],
  ["ice-wins.wav", 3.48, 4.3],
  ["wizard-wins.wav", 4.38, 5.3],
  ["time-wins.wav", 5.35, 6.26],
  ["volta-wins.wav", 6.3, 7.25],
  ["venom-wins.wav", 7.33, 8.3],
  ["gravis-wins.wav", 8.39, 9.58],
  ["aegis-wins.wav", 9.82, 11.18],
];

const MATCHUP_SEGMENTS = [
  [11.357, 12.56],
  [12.97, 14.207],
  [14.566, 15.817],
  [16.237, 17.443],
  [17.817, 19.125],
  [19.524, 20.728],
  [21.109, 22.55],
  [23.109, 24.156],
  [24.466, 25.572],
  [25.962, 27.173],
  [27.525, 28.582],
  [29.031, 30.244],
  [30.671, 31.763],
  [32.238, 33.41],
  [33.854, 35.032],
  [35.346, 36.393],
  [36.878, 37.964],
  [38.417, 39.404],
  [39.834, 40.952],
  [41.378, 42.513],
  [42.87, 44.004],
  [44.427, 45.586],
  [46.047, 47.138],
  [47.564, 48.696],
  [49.16, 50.178],
  [50.691, 51.858],
  [52.335, 53.553],
  [53.869, 55.217],
  [55.63, 56.902],
  [57.345, 58.425],
  [58.831, 59.888],
  [60.365, 61.448],
  [61.894, 63.117],
  [63.523, 64.646],
  [65.06, 66.191],
  [66.633, 67.789],
  [68.221, 69.361],
  [69.794, 70.847],
  [71.368, 72.491],
  [72.96, 74.179],
  [74.786, 75.713],
  [76.001, 77.179],
  [77.489, 78.743],
  [79.045, 80.255],
  [80.578, 81.731],
  [82.114, 83.308],
  [83.649, 84.829],
  [85.195, 86.441],
  [86.791, 88.223],
  [88.665, 90.055],
  [90.428, 91.814],
  [92.249, 93.531],
  [93.788, 94.344],
  [94.816, 96.983],
  [97.495, 99.537],
  [100.051, 102.396],
];

async function main() {
  const mediaPath = process.argv[2];
  if (!mediaPath) throw new Error("Usage: node scripts/split-elevenlabs-announcer.mjs <elevenlabs-reel.mp3>");
  const ffmpegPath = process.env.FFMPEG_PATH || ffmpegInstaller.path || "ffmpeg";
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(SOURCE_DIR, { recursive: true });
  await copyFile(mediaPath, join(SOURCE_DIR, "elevenlabs-adam-wise-announcer-reel.mp3"));

  const matchupFiles = [];
  for (const left of TYPES) {
    for (const right of TYPES) {
      if (left !== right) matchupFiles.push(`${left}-vs-${right}.wav`);
    }
  }

  const windows = [...SHARED_AND_WINNERS];
  if (MATCHUP_SEGMENTS.length !== matchupFiles.length) {
    throw new Error(`Expected ${matchupFiles.length} matchup segments, found ${MATCHUP_SEGMENTS.length}`);
  }
  matchupFiles.forEach((filename, index) => {
    const [start, end] = MATCHUP_SEGMENTS[index];
    windows.push([filename, start, end]);
  });

  for (const [filename, start, end] of windows) {
    await runFfmpeg(ffmpegPath, [
      "-y",
      "-ss", seconds(Math.max(0, start - 0.025)),
      "-to", seconds(end + 0.04),
      "-i", mediaPath,
      "-vn",
      "-ac", "1",
      "-ar", "44100",
      "-sample_fmt", "s16",
      join(OUT_DIR, filename),
    ]);
  }

  console.log(JSON.stringify({ source: mediaPath, written: windows.length }, null, 2));
}

function seconds(value) {
  return value.toFixed(3);
}

function runFfmpeg(command, args, { allowFailure = false } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0 || allowFailure) resolvePromise(stderr);
      else reject(new Error(`FFmpeg failed with exit code ${code}:\\n${stderr.trim()}`));
    });
  });
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
