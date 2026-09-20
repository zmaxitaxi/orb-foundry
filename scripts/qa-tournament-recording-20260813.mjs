import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requestedScope = process.argv[2] === "whole-round" ? "whole-round" : "whole-tournament";
const output = `${root}/artifacts/design-qa/tournament-recording-20260813-${requestedScope}`;
mkdirSync(output, { recursive: true });

const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(String(error)));
page.on("requestfailed", (request) => failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText || "unknown",
}));

await page.goto("http://127.0.0.1:4180/index.html", { waitUntil: "networkidle" });
await page.waitForFunction(() => Boolean(window.__ORB_FOUNDRY__));

const baseSettings = await page.evaluate(() => window.__ORB_FOUNDRY__.getState().settings);
const entrants = ["speed", "orbital", "fibonacci", "sticky"];
const tournamentSettings = {
    ...baseSettings,
    gameplayMode: "orb-race",
    raceOrbs: entrants,
    raceTeams: [[entrants[0]], [entrants[1]]],
    raceTeamOptions: [
        Object.fromEntries(entrants.map((id) => [id, {}])),
        Object.fromEntries(entrants.map((id) => [id, {}])),
    ],
    raceTournament: {
        enabled: true,
        title: "RECORDING QA",
        size: 4,
        entrants,
        seedingMode: "ordered",
        seedOrder: entrants,
        recordingScope: requestedScope,
        recordingSelection: requestedScope === "whole-round" ? "selected-round" : "whole-tournament",
        recordingFormat: "race-landscape",
        recordingDimensions: { width: 1920, height: 1080 },
        recordingLayerCount: 3,
        landscapeLayerCount: 3,
        selectedRoundIndices: requestedScope === "whole-round" ? [0] : [0, 1],
        sharedLayerValues: [10, 10, 10],
    },
    social: {
        ...baseSettings.social,
        enabled: true,
        format: "race-landscape",
        fps: 30,
        highlightMode: false,
        showWinProbability: false,
    },
    features: {
        ...baseSettings.features,
        introCards: false,
        soundEffects: false,
        soundAmbience: false,
        soundMusic: false,
        soundAnnouncer: false,
        videoRecording: true,
        screenShake: false,
        hitStop: false,
        slowMotionHighlights: false,
    },
};

await page.evaluate((settings) => window.__ORB_FOUNDRY__.record(settings), tournamentSettings);
await page.waitForTimeout(900);
const startState = await page.evaluate(() => window.__ORB_FOUNDRY__.getState());
await page.locator("#socialCanvas").screenshot({ path: `${output}/recording-start.png` });

let latestState = startState;
let finishedAt = null;
for (let index = 0; index < 140; index += 1) {
    await page.evaluate(() => window.advanceTime(500));
    await page.waitForTimeout(120);
    latestState = await page.evaluate(() => window.__ORB_FOUNDRY__.getState());
    if (index === 20) {
        await page.locator("#socialCanvas").screenshot({ path: `${output}/recording-mid.png` });
    }
    const previewOpen = await page.evaluate(() => Boolean(document.querySelector("#socialPreviewDialog")?.open));
    if (previewOpen && latestState.recordingResult?.available) {
        finishedAt = index;
        break;
    }
}

await page.locator("#socialCanvas").screenshot({ path: `${output}/recording-final.png` });
const finalState = await page.evaluate(() => window.__ORB_FOUNDRY__.getState());
const previewOpen = await page.evaluate(() => Boolean(document.querySelector("#socialPreviewDialog")?.open));
const downloadPromise = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
await page.locator("#socialDownloadButton").click().catch(() => {});
const download = await downloadPromise;
if (download) await download.saveAs(`${output}/${download.suggestedFilename()}`);

const diagnostics = {
    start: {
        recorder: startState.recorder,
        screen: startState.screen,
        recordingResult: startState.recordingResult,
    },
    final: {
        scope: requestedScope,
        recorder: finalState.recorder,
        screen: finalState.screen,
        previewOpen,
        recordingResult: finalState.recordingResult,
        tournament: finalState.tournament,
    },
    finishedAtStep: finishedAt,
    download: download ? { suggestedFilename: download.suggestedFilename() } : null,
    consoleErrors,
    pageErrors,
    failedRequests,
};
writeFileSync(`${output}/diagnostics.json`, JSON.stringify(diagnostics, null, 2));
writeFileSync(`${output}/final-state.json`, JSON.stringify(finalState, null, 2));
console.log(JSON.stringify(diagnostics, null, 2));
await browser.close();

if (!previewOpen || finalState.recorder !== "preview" || !finalState.recordingResult?.available) {
    throw new Error("Tournament recording did not reach the downloadable preview state.");
}
if (finalState.recordingResult.recordingScope !== requestedScope) {
    throw new Error(`Expected ${requestedScope} recording, got ${finalState.recordingResult.recordingScope}.`);
}
const recordedMatchIds = finalState.recordingResult.metadata?.matchIds || [];
const expectedMatchCount = requestedScope === "whole-round" ? 2 : 3;
if (recordedMatchIds.length !== expectedMatchCount) {
    throw new Error(`Expected ${expectedMatchCount} recorded matches, got ${recordedMatchIds.length}.`);
}
