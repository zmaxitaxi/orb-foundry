#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_LATEST = join(ROOT, "artifacts", "daily-battles", "latest.json");

export async function postInstagram(metadataPath = process.env.BATTLE_METADATA_PATH || DEFAULT_LATEST) {
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  const igUserId = requiredEnv("IG_USER_ID");
  const accessToken = requiredEnv("IG_ACCESS_TOKEN");
  const graphVersion = process.env.IG_GRAPH_VERSION || "v23.0";
  const videoUrl = resolveVideoUrl(metadata);
  const mediaType = process.env.IG_MEDIA_TYPE || "REELS";
  const baseUrl = `https://graph.facebook.com/${graphVersion}`;

  const container = await graphPost(`${baseUrl}/${igUserId}/media`, {
    media_type: mediaType,
    video_url: videoUrl,
    caption: metadata.caption,
    share_to_feed: "true",
    access_token: accessToken,
  });

  await waitForContainer(baseUrl, container.id, accessToken);

  const publish = await graphPost(`${baseUrl}/${igUserId}/media_publish`, {
    creation_id: container.id,
    access_token: accessToken,
  });

  const postedAt = new Date().toISOString();
  const nextMetadata = {
    ...metadata,
    instagram: {
      postedAt,
      mediaId: publish.id,
      containerId: container.id,
      mediaType,
      videoUrl,
    },
  };
  await writeFile(metadataPath, JSON.stringify(nextMetadata, null, 2));
  if (metadata.metadataPath && metadata.metadataPath !== metadataPath) {
    await writeFile(metadata.metadataPath, JSON.stringify(nextMetadata, null, 2));
  }
  return nextMetadata.instagram;
}

function resolveVideoUrl(metadata) {
  if (process.env.BATTLE_VIDEO_URL) return process.env.BATTLE_VIDEO_URL;
  if (metadata.publicVideoUrl) return metadata.publicVideoUrl;
  if (process.env.IG_VIDEO_BASE_URL) {
    const dailyRoot = join(ROOT, "artifacts", "daily-battles");
    const relativeVideoPath = relative(dailyRoot, metadata.videoPath);
    const urlPath = relativeVideoPath && !relativeVideoPath.startsWith("..")
      ? relativeVideoPath.split(sep).map(encodeURIComponent).join("/")
      : encodeURIComponent(basename(metadata.videoPath));
    return new URL(urlPath, ensureTrailingSlash(process.env.IG_VIDEO_BASE_URL)).href;
  }
  throw new Error(
    "Instagram publishing needs a public HTTPS video URL. Set BATTLE_VIDEO_URL for this run, " +
    "write publicVideoUrl into metadata, or set IG_VIDEO_BASE_URL for a hosted output directory.",
  );
}

async function waitForContainer(baseUrl, containerId, accessToken) {
  const timeoutMs = Number(process.env.IG_CONTAINER_TIMEOUT_MS) || 300_000;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const status = await graphGet(`${baseUrl}/${containerId}`, {
      fields: "status_code,status",
      access_token: accessToken,
    });
    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
      throw new Error(`Instagram container failed: ${status.status || status.status_code}`);
    }
    await delay(5000);
  }
  throw new Error(`Timed out waiting for Instagram container ${containerId}`);
}

async function graphPost(url, params) {
  const response = await fetch(url, {
    method: "POST",
    body: new URLSearchParams(params),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) {
    throw new Error(body.error?.message || `Instagram request failed: ${response.status}`);
  }
  return body;
}

async function graphGet(url, params) {
  const requestUrl = new URL(url);
  for (const [key, value] of Object.entries(params)) requestUrl.searchParams.set(key, value);
  const response = await fetch(requestUrl);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) {
    throw new Error(body.error?.message || `Instagram request failed: ${response.status}`);
  }
  return body;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  postInstagram(process.argv[2])
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}
