import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = `${root}/artifacts/design-qa/race-bombs-20260812`;
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

await page.goto("http://127.0.0.1:4174/index.html", { waitUntil: "networkidle" });
await page.waitForFunction(() => Boolean(window.__ORB_FOUNDRY__));

const common = {
    mode: "match",
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
};

const launch = async (name, teams, seed) => {
    await page.evaluate(({ nextTeams, nextSeed, nextCommon }) => {
        window.__ORB_FOUNDRY__.launch({
            ...nextCommon,
            gameplayMode: "orb-race",
            raceTeams: nextTeams,
            raceOrbs: [...new Set(nextTeams.flat())],
            seed: nextSeed,
        });
    }, { nextTeams: teams, nextSeed: seed, nextCommon: common });
    await page.locator("#socialCanvas").waitFor({ state: "visible" });
};

const state = async () => JSON.parse(await page.evaluate(() => window.render_game_to_text()));
const capture = async (name, milliseconds = 0) => {
    if (milliseconds > 0) await page.evaluate((elapsed) => window.advanceTime(elapsed), milliseconds);
    await page.locator("#socialCanvas").screenshot({ path: `${output}/${name}.png` });
    writeFileSync(`${output}/${name}.json`, JSON.stringify(await state(), null, 2));
};

await launch("antimatter", [["antimatter-bomb"], ["duplicator"]], 81201);
await capture("antimatter-start", 1000);
await capture("antimatter-first-detonation", 14500);
await capture("antimatter-first-collapse", 700);

await launch("antimatter-second", [["antimatter-bomb"], ["duplicator"]], 81202);
await capture("antimatter-second-detonation", 30500);

await launch("time-bomb", [["time-bomb"], ["duplicator"]], 81203);
await capture("time-bomb-midnight", 15500);

await launch("reality-bomb", [["reality-bomb"], ["duplicator"]], 81204);
await capture("reality-bomb-spawn", 6500);

await page.evaluate(() => window.__ORB_FOUNDRY__.launch({
    ...window.__qaCommon,
})).catch(() => {});
await page.evaluate(() => window.__ORB_FOUNDRY__.launch({
    mode: "match",
    gameplayMode: "classic",
    classicTeams: [["hydrogen-bomb"], ["duplicator"]],
    classes: ["hydrogen-bomb", "duplicator"],
    classicBlackTheme: true,
    arenaSize: "standard",
    arenaShape: "square",
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
    seed: 81205,
}));
await capture("hydrogen-timer", 1000);

writeFileSync(`${output}/diagnostics.json`, JSON.stringify({ consoleErrors, pageErrors, failedRequests }, null, 2));
console.log(JSON.stringify({ output, consoleErrors, pageErrors, failedRequests }, null, 2));
await browser.close();
