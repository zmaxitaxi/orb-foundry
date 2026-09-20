#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_LATEST = join(ROOT, "artifacts", "daily-battles", "latest.json");

export async function transcodeBattleVideo(
  metadataPath = process.env.BATTLE_METADATA_PATH || DEFAULT_LATEST,
  options = {},
) {
  const latestPath = options.latestPath || DEFAULT_LATEST;
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  const inputPath = metadata.videoPath;
  if (!inputPath) throw new Error(`Missing videoPath in ${metadataPath}`);
  if (extname(inputPath).toLowerCase() === ".mp4") {
    const nextMetadata = {
      ...metadata,
      mp4Path: inputPath,
      videoPath: inputPath,
      sourceWebmPath: metadata.sourceWebmPath || null,
      transcode: {
        createdAt: new Date().toISOString(),
        format: "mp4",
        skipped: true,
        reason: "The browser recorder already produced MP4.",
      },
    };
    await writeMetadata(metadataPath, nextMetadata, latestPath);
    return nextMetadata;
  }
  const outputPath = process.env.BATTLE_MP4_PATH || inputPath.replace(new RegExp(`${escapeRegExp(extname(inputPath))}$`), ".mp4");
  const ffmpegPath = process.env.FFMPEG_PATH || ffmpegInstaller.path || "ffmpeg";

  await assertExecutable(ffmpegPath);
  await runFfmpeg(ffmpegPath, [
    "-y",
    "-i", inputPath,
    "-c:v", "libx264",
    "-preset", process.env.FFMPEG_PRESET || "veryfast",
    "-crf", process.env.FFMPEG_CRF || "23",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", process.env.FFMPEG_AUDIO_BITRATE || "128k",
    "-movflags", "+faststart",
    outputPath,
  ]);

  const nextMetadata = {
    ...metadata,
    mp4Path: outputPath,
    videoPath: outputPath,
    sourceWebmPath: metadata.sourceWebmPath || inputPath,
    transcode: {
      createdAt: new Date().toISOString(),
      ffmpegPath,
      format: "mp4",
    },
  };
  await writeMetadata(metadataPath, nextMetadata, latestPath);
  return nextMetadata;
}

async function assertExecutable(command) {
  if (command.includes("/")) {
    try {
      await access(command, constants.X_OK);
      return;
    } catch {
      throw new Error(`FFmpeg is not executable at ${command}. Set FFMPEG_PATH to the installed ffmpeg binary.`);
    }
  }
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
      if (error.code === "ENOENT") {
        reject(new Error("FFmpeg is required to create Instagram-ready MP4 files. Install ffmpeg or set FFMPEG_PATH."));
      } else {
        reject(error);
      }
    });
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`FFmpeg failed with exit code ${code}:\n${stderr.trim()}`));
    });
  });
}

async function writeMetadata(metadataPath, metadata, latestPath) {
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  if (metadataPath !== latestPath) {
    await mkdir(dirname(latestPath), { recursive: true });
    await writeFile(latestPath, JSON.stringify({ ...metadata, metadataPath }, null, 2));
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  transcodeBattleVideo(process.argv[2])
    .then((metadata) => {
      console.log(JSON.stringify({
        mp4Path: metadata.mp4Path,
        metadataPath: process.argv[2] || DEFAULT_LATEST,
      }, null, 2));
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}
