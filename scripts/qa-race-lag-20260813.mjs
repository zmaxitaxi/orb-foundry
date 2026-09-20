import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = `${root}/artifacts/design-qa/orb-race-lag-20260813`;
mkdirSync(output, { recursive: true });

const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
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

await page.goto("http://127.0.0.1:4173/index.html", { waitUntil: "networkidle" });
await page.waitForFunction(() => Boolean(window.__ORB_FOUNDRY__));

const settings = {
    mode: "match",
    gameplayMode: "orb-race",
    raceTeams: [["lag"], ["unarmed"]],
    raceOrbs: ["lag", "unarmed"],
    raceLayerCount: 3,
    raceLayerStrengths: [1000000000, 1000000000, 1000000000],
    raceOrbScale: "full",
    raceTrails: false,
    raceSolidTrails: false,
    raceScalingDamage: true,
    raceMatchupAnnouncement: false,
    raceTargetAnnouncement: false,
    raceShowTargetMessage: false,
    theme: "black",
    social: { enabled: true, format: "portrait", fps: 30, highlightMode: false, showWinProbability: false },
    features: {
        introCards: false,
        soundEffects: false,
        soundAmbience: false,
        soundMusic: false,
        soundAnnouncer: false,
        videoRecording: false,
        screenShake: false,
        hitStop: false,
        slowMotionHighlights: false,
    },
    seed: 813001,
};

await page.evaluate((nextSettings) => window.__ORB_FOUNDRY__.launch(nextSettings), settings);
await page.locator("#socialCanvas").waitFor({ state: "visible" });
await page.locator("#socialCanvas").screenshot({ path: `${output}/lag-hacker-start.png` });
await page.evaluate((elapsed) => window.advanceTime(elapsed), 2500);
await page.locator("#socialCanvas").screenshot({ path: `${output}/lag-hacker-live.png` });
const state = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
writeFileSync(`${output}/lag-hacker-state.json`, JSON.stringify(state, null, 2));
writeFileSync(`${output}/diagnostics.json`, JSON.stringify({ consoleErrors, pageErrors, failedRequests }, null, 2));
console.log(JSON.stringify({ output, consoleErrors, pageErrors, failedRequests, lag: state.match?.fighters?.find((fighter) => fighter.raceOrbId === "lag") }, null, 2));
await browser.close();
