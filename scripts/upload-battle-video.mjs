#!/usr/bin/env node
import { createHash, createHmac } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_LATEST = join(ROOT, "artifacts", "daily-battles", "latest.json");

export async function uploadBattleVideo(metadataPath = process.env.BATTLE_METADATA_PATH || DEFAULT_LATEST) {
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  const filePath = metadata.mp4Path || metadata.videoPath;
  if (!filePath) throw new Error(`Missing mp4Path or videoPath in ${metadataPath}`);
  if (!filePath.endsWith(".mp4")) throw new Error(`Instagram upload expects an MP4 file. Found: ${filePath}`);

  const config = storageConfig();
  const objectKey = config.key || defaultObjectKey(filePath, config.prefix);
  const body = await readFile(filePath);
  const fileStat = await stat(filePath);
  const uploadUrl = await putS3Object({ ...config, objectKey, body, contentType: "video/mp4" });
  const publicVideoUrl = new URL(objectKey.split("/").map(encodeURIComponent).join("/"), ensureTrailingSlash(config.publicBaseUrl)).href;

  const nextMetadata = {
    ...metadata,
    publicVideoUrl,
    upload: {
      createdAt: new Date().toISOString(),
      objectKey,
      bucket: config.bucket,
      endpoint: config.endpoint || "aws-s3",
      bytes: fileStat.size,
      uploadUrl,
    },
  };
  await writeMetadata(metadataPath, nextMetadata);
  return nextMetadata;
}

function storageConfig() {
  const bucket = env("S3_BUCKET", "STORAGE_BUCKET");
  const accessKeyId = env("S3_ACCESS_KEY_ID", "STORAGE_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID");
  const secretAccessKey = env("S3_SECRET_ACCESS_KEY", "STORAGE_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY");
  const publicBaseUrl = env("S3_PUBLIC_BASE_URL", "STORAGE_PUBLIC_BASE_URL", "IG_VIDEO_BASE_URL");
  const region = env("S3_REGION", "STORAGE_REGION", "AWS_REGION") || "auto";
  if (!bucket) throw new Error("Missing S3_BUCKET for unattended video hosting.");
  if (!accessKeyId) throw new Error("Missing S3_ACCESS_KEY_ID for unattended video hosting.");
  if (!secretAccessKey) throw new Error("Missing S3_SECRET_ACCESS_KEY for unattended video hosting.");
  if (!publicBaseUrl) throw new Error("Missing S3_PUBLIC_BASE_URL for the public HTTPS video URL Instagram will fetch.");
  return {
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl,
    region,
    endpoint: env("S3_ENDPOINT", "STORAGE_ENDPOINT"),
    sessionToken: env("S3_SESSION_TOKEN", "AWS_SESSION_TOKEN"),
    prefix: env("S3_PREFIX", "STORAGE_PREFIX") || "orb-foundry/daily-battles",
    key: env("S3_KEY", "STORAGE_KEY"),
  };
}

async function putS3Object({ bucket, accessKeyId, secretAccessKey, region, endpoint, sessionToken, objectKey, body, contentType }) {
  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body);
  const target = s3Target({ bucket, region, endpoint, objectKey });
  const headers = {
    "content-type": contentType,
    host: target.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (sessionToken) headers["x-amz-security-token"] = sessionToken;

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames.map((name) => `${name}:${String(headers[name]).trim()}\n`).join("");
  const canonicalRequest = [
    "PUT",
    target.canonicalUri,
    "",
    canonicalHeaders,
    signedHeaderNames.join(";"),
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");
  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, "s3");
  const signature = hmacHex(signingKey, stringToSign);
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaderNames.join(";")}, Signature=${signature}`;

  const response = await fetch(target.url, {
    method: "PUT",
    headers: {
      ...headers,
      authorization,
      "content-length": String(body.length),
    },
    body,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`S3 upload failed: ${response.status} ${response.statusText}\n${text}`);
  }
  return target.url;
}

function s3Target({ bucket, region, endpoint, objectKey }) {
  const canonicalKey = objectKey.split("/").map(encodeURIComponent).join("/");
  if (endpoint) {
    const base = new URL(endpoint);
    const pathname = `${trimTrailingSlash(base.pathname)}/${bucket}/${canonicalKey}`;
    base.pathname = pathname;
    return {
      url: base.href,
      host: base.host,
      canonicalUri: pathname,
    };
  }
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  return {
    url: `https://${host}/${canonicalKey}`,
    host,
    canonicalUri: `/${canonicalKey}`,
  };
}

function defaultObjectKey(filePath, prefix) {
  const dailyRoot = join(ROOT, "artifacts", "daily-battles");
  const relativePath = relative(dailyRoot, filePath);
  const suffix = relativePath && !relativePath.startsWith("..") ? relativePath.split(sep).join("/") : basename(filePath);
  return `${trimSlashes(prefix)}/${suffix}`;
}

async function writeMetadata(metadataPath, metadata) {
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  const latestPath = join(ROOT, "artifacts", "daily-battles", "latest.json");
  if (metadataPath !== latestPath) await writeFile(latestPath, JSON.stringify({ ...metadata, metadataPath }, null, 2));
}

function env(...names) {
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  return "";
}

function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key, value) {
  return createHmac("sha256", key).update(value).digest();
}

function hmacHex(key, value) {
  return createHmac("sha256", key).update(value).digest("hex");
}

function getSignatureKey(secretAccessKey, dateStamp, regionName, serviceName) {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, "aws4_request");
}

function toAmzDate(date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function trimSlashes(value) {
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/g, "");
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  uploadBattleVideo(process.argv[2])
    .then((metadata) => {
      console.log(JSON.stringify({
        publicVideoUrl: metadata.publicVideoUrl,
        objectKey: metadata.upload.objectKey,
        metadataPath: process.argv[2] || DEFAULT_LATEST,
      }, null, 2));
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}
