#!/usr/bin/env node
import { createServer } from "node:http";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { dirname, extname, join, resolve, sep } from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  ORB_RACERS,
  ORB_RACE_DEFAULT_LAYERS,
  ORB_RACE_LONGFORM_DEFAULT_LAYERS,
} from "../src/orb-race.js";
import { CLASS_DEFS, selectFighterClasses } from "../src/simulation.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUTPUT_DIR = join(ROOT, "artifacts", "daily-battles");
const HASHTAGS = "#weaponballs #orb #simulation";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

export async function exportRandomBattle(options = {}) {
  const classes = options.classes || Object.keys(CLASS_DEFS);
  const seed = Number(options.seed || process.env.BATTLE_SEED) || Math.floor(Math.random() * 999_998) + 1;
  const selectedClasses = options.selectedClasses || selectFighterClasses(classes, 2, seed);
  return exportSocialVideo({
    ...options,
    gameplayMode: "classic",
    classes,
    selectedClasses,
    seed,
  });
}

export async function exportSocialVideo(options = {}) {
  const outRoot = resolve(options.outputDir || process.env.BATTLE_OUTPUT_DIR || DEFAULT_OUTPUT_DIR);
  const day = options.outputDateKey || new Date().toISOString().slice(0, 10);
  const outputDir = resolve(
    options.outputDirectory || join(outRoot, day, options.outputSubdirectory || ""),
  );
  await mkdir(outputDir, { recursive: true });

  const seed = Number(options.seed || process.env.BATTLE_SEED) || Math.floor(Math.random() * 999_998) + 1;
  const gameplayMode = options.gameplayMode === "orb-race" ? "orb-race" : "classic";
  const format = options.format || process.env.BATTLE_FORMAT || "portrait";
  const fps = Number(options.fps || process.env.BATTLE_FPS) === 60 ? 60 : 30;
  let orbNames;
  let selectedClasses = options.selectedClasses || [];
  let settings;

  if (gameplayMode === "orb-race") {
    const raceTeams = normalizeExportRaceTeams(options);
    const raceOrbs = [...new Set(raceTeams.flat())];
    if (raceOrbs.length < 2 || raceOrbs.some((id) => !ORB_RACERS[id])) {
      throw new Error("Orb Race export requires at least two known raceOrbs.");
    }
    const longform = format === "race-landscape" || format === "longform" || options.contentType === "longform";
    const raceLayerStrengths = Array.isArray(options.raceLayerStrengths) && options.raceLayerStrengths.length
      ? [...options.raceLayerStrengths]
      : longform
        ? [...ORB_RACE_LONGFORM_DEFAULT_LAYERS]
        : [...ORB_RACE_DEFAULT_LAYERS];
    orbNames = raceTeams.map((team) => team.map((id) => ORB_RACERS[id].name).join(" + "));
    settings = {
      count: raceOrbs.length,
      gameplayMode,
      raceOrbs,
      raceTeams,
      raceLayerCount: raceLayerStrengths.length,
      raceLayerStrengths,
      raceShowTargetMessage: true,
      raceTargetAnnouncement: true,
      raceMatchupAnnouncement: true,
      raceScalingDamage: true,
      seed,
      theme: options.theme || process.env.BATTLE_THEME || "cream-foundry",
      hazardPreset: "none",
      arenaModifier: options.arenaModifier || process.env.BATTLE_ARENA_MODIFIER || "standard",
      social: {
        enabled: true,
        format: longform ? "race-landscape" : "portrait",
        fps,
        highlightMode: options.highlightMode ?? process.env.BATTLE_HIGHLIGHTS !== "false",
        minimumDurationSeconds: Number(options.minimumDurationSeconds) || 0,
        actionPlaybackRate: Number(options.actionPlaybackRate) || 1,
        requireAnnouncer: options.requireAnnouncer === true,
      },
      features: {
        introCards: true,
        soundAnnouncer: true,
        videoRecording: true,
      },
    };
  } else {
    const classes = options.classes || Object.keys(CLASS_DEFS);
    selectedClasses = options.selectedClasses || selectFighterClasses(classes, 2, seed);
    orbNames = selectedClasses.map((type) => CLASS_DEFS[type].name);
    settings = {
      count: 2,
      classes,
      seed,
      theme: options.theme || process.env.BATTLE_THEME || "cream-foundry",
      hazardPreset: options.hazardPreset || process.env.BATTLE_HAZARDS || "none",
      arenaModifier: options.arenaModifier || process.env.BATTLE_ARENA_MODIFIER || "standard",
      social: {
        enabled: true,
        format,
        fps,
        highlightMode: options.highlightMode ?? process.env.BATTLE_HIGHLIGHTS !== "false",
        minimumDurationSeconds: Number(options.minimumDurationSeconds) || 0,
        requireAnnouncer: options.requireAnnouncer === true,
      },
      features: {
        introCards: true,
        soundAnnouncer: true,
        videoRecording: true,
      },
    };
  }

  const caption = options.description || `${orbNames[0]} VS ${orbNames[1]}\n\n${HASHTAGS}`;

  const server = await startStaticServer(ROOT);
  const tempProfile = await mkdtemp(join(tmpdir(), "orb-foundry-chrome-"));
  const chrome = launchChrome({
    userDataDir: tempProfile,
    url: `http://127.0.0.1:${server.port}/`,
  });

  try {
    const page = await connectToPage(chrome);
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: outputDir });
    await page.waitForExpression("window.__ORB_FOUNDRY__ && document.readyState === 'complete'", 30_000);
    await page.evaluate(`window.__ORB_FOUNDRY__.record(${JSON.stringify(settings)})`, { awaitPromise: true, userGesture: true });

    const timeoutMs = Number(process.env.BATTLE_EXPORT_TIMEOUT_MS) || 420_000;
    await page.waitForExpression("window.__ORB_FOUNDRY__.getState().recorder === 'preview'", timeoutMs);
    const state = await page.evaluate("window.__ORB_FOUNDRY__.getState()", { returnByValue: true });
    const minimumDurationSeconds = Number(settings.social.minimumDurationSeconds) || 0;
    const recordedDuration = Number(state.recordingResult?.duration) || 0;
    if (minimumDurationSeconds > 0 && recordedDuration + 0.05 < minimumDurationSeconds) {
      throw new Error(`Recorded video was ${recordedDuration.toFixed(2)}s; minimum is ${minimumDurationSeconds}s.`);
    }
    const announcer = state.announcer || null;
    if (options.requireAnnouncer === true) {
      if (announcer?.assetsReady !== true || Number(announcer.loadedCueCount) < 1) {
        throw new Error("Required announcer assets were not ready for the exported recording.");
      }
      if (Number(announcer.sequences) < 1) {
        throw new Error("The exported recording contains no announcer sequence for the battle.");
      }
      if (Number(announcer.spokenCueCount) < 1) {
        throw new Error("The exported recording contains no spoken announcer cue.");
      }
    }
    const beforeDownload = Date.now();
    await page.evaluate("document.querySelector('#socialDownloadButton').click()", { userGesture: true });
    const videoPath = await waitForDownloadedVideo(outputDir, beforeDownload, 60_000);

    const metadata = {
      createdAt: new Date().toISOString(),
      contentType: options.contentType || (format === "race-landscape" ? "longform" : "short"),
      gameplayMode,
      seed,
      classes: selectedClasses,
      raceOrbs: gameplayMode === "orb-race" ? settings.raceOrbs : [],
      raceTeams: gameplayMode === "orb-race" ? settings.raceTeams : [],
      raceLayerStrengths: gameplayMode === "orb-race" ? settings.raceLayerStrengths : [],
      minimumDurationSeconds: Number(settings.social.minimumDurationSeconds) || 0,
      actionPlaybackRate: Number(settings.social.actionPlaybackRate) || 1,
      orbNames,
      title: options.title || `${orbNames[0]} VS ${orbNames[1]}`,
      description: caption,
      runTag: options.runTag || null,
      caption,
      announcer,
      videoPath,
      state,
    };
    const metadataPath = join(outputDir, "metadata.json");
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    await writeFile(join(outRoot, "latest.json"), JSON.stringify({ ...metadata, metadataPath }, null, 2));
    return { ...metadata, metadataPath };
  } finally {
    await pageSafeClose(chrome);
    await server.close();
    await rm(tempProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  }
}

function normalizeExportRaceTeams(options) {
  const source = Array.isArray(options.raceTeams) && options.raceTeams.length
    ? options.raceTeams
    : Array.isArray(options.raceOrbs) ? options.raceOrbs.map((id) => [id]) : [];
  const teams = source.slice(0, 2).map((team) => (
    [...new Set((Array.isArray(team) ? team : [team]).map((id) => String(id)).filter((id) => id && ORB_RACERS[id]))]
  ));
  if (teams.length !== 2 || teams.some((team) => team.length === 0)) {
    throw new Error("Orb Race export requires two non-empty race teams.");
  }
  return teams;
}

function startStaticServer(root) {
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(requestUrl.pathname);
      const safePath = pathname === "/" ? "/index.html" : pathname;
      const filePath = resolve(root, `.${safePath}`);
      if (!filePath.startsWith(`${root}${sep}`) && filePath !== root) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) throw new Error("Not a file");
      response.writeHead(200, { "content-type": MIME_TYPES[extname(filePath)] || "application/octet-stream" });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolve({
        port,
        close: () => new Promise((closeResolve) => server.close(closeResolve)),
      });
    });
  });
}

function launchChrome({ userDataDir, url }) {
  const executablePath = process.env.CHROME_PATH || [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].find((candidate) => existsSync(candidate));
  if (!executablePath || !existsSync(executablePath)) {
    throw new Error("Chrome was not found. Set CHROME_PATH to a Chromium-compatible browser.");
  }
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-address=127.0.0.1",
    "--autoplay-policy=no-user-gesture-required",
    // Let Chromium choose an unused port. A fixed adjacent port can already be
    // occupied on a hosted runner, leaving Chrome alive but without a usable
    // DevTools endpoint and causing a misleading readiness timeout.
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    url,
  ];
  if (process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true") {
    args.push("--no-sandbox", "--disable-setuid-sandbox");
  }
  const child = spawn(executablePath, args, { stdio: ["ignore", "ignore", "pipe"] });
  const stderr = [];
  child.stderr.on("data", (chunk) => stderr.push(String(chunk)));
  child.stderr.setEncoding("utf8");
  return { child, userDataDir, port: null, stderr };
}

async function connectToPage(chrome) {
  const { child, userDataDir, stderr } = chrome;
  const timeoutMs = Number(process.env.CHROME_CONNECT_TIMEOUT_MS) || 60_000;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      const details = stderr.join("").trim();
      throw new Error(`Chrome exited before remote debugging was ready (code ${child.exitCode}).${details ? ` ${details}` : ""}`);
    }
    if (!chrome.port) chrome.port = await readDevToolsPort(userDataDir);
    if (chrome.port) {
      try {
        const targets = await fetchJson(`http://127.0.0.1:${chrome.port}/json/list`);
        const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
        if (pageTarget) return new CdpPage(pageTarget.webSocketDebuggerUrl);
      } catch {
        // Chromium may create DevToolsActivePort before its HTTP endpoint is ready.
      }
    }
    await delay(200);
  }
  const details = stderr.join("").trim();
  throw new Error(`Timed out waiting for Chrome remote debugging after ${timeoutMs}ms.${details ? ` ${details}` : ""}`);
}

async function readDevToolsPort(userDataDir) {
  try {
    const [portText] = (await readFile(join(userDataDir, "DevToolsActivePort"), "utf8")).trim().split(/\s+/);
    const port = Number(portText);
    return Number.isInteger(port) && port > 0 && port <= 65_535 ? port : null;
  } catch {
    return null;
  }
}

class CdpPage {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  async evaluate(expression, options = {}) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: Boolean(options.awaitPromise),
      userGesture: Boolean(options.userGesture),
      returnByValue: options.returnByValue !== false,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "Runtime evaluation failed.");
    }
    return result.result?.value;
  }

  async waitForExpression(expression, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await this.evaluate(`Boolean(${expression})`).catch(() => false)) return true;
      await delay(500);
    }
    throw new Error(`Timed out waiting for: ${expression}`);
  }

  close() {
    if (this.socket.readyState === WebSocket.OPEN) this.socket.close();
  }
}

async function waitForDownloadedVideo(outputDir, afterMs, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const files = await readdir(outputDir);
    const candidates = [];
    for (const file of files) {
      if (!/\.(webm|mp4)$/i.test(file)) continue;
      const filePath = join(outputDir, file);
      const fileStat = await stat(filePath);
      if (fileStat.mtimeMs >= afterMs - 1000 && fileStat.size > 0) candidates.push({ filePath, mtimeMs: fileStat.mtimeMs });
    }
    if (!files.some((file) => file.endsWith(".crdownload")) && candidates.length) {
      candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
      return candidates[0].filePath;
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for a video download in ${outputDir}`);
}

async function pageSafeClose(chrome) {
  if (!chrome?.child || chrome.child.exitCode !== null) return;
  await new Promise((resolvePromise) => {
    const timeout = setTimeout(resolvePromise, 5_000);
    chrome.child.once("close", () => {
      clearTimeout(timeout);
      resolvePromise();
    });
    try {
      chrome.child.kill("SIGTERM");
    } catch {
      clearTimeout(timeout);
      resolvePromise();
    }
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  exportRandomBattle()
    .then((result) => {
      console.log(JSON.stringify({
        videoPath: result.videoPath,
        metadataPath: result.metadataPath,
        caption: result.caption,
        seed: result.seed,
        orbNames: result.orbNames,
      }, null, 2));
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}
