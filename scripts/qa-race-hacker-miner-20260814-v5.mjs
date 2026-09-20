import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = `${root}/artifacts/design-qa/orb-race-new-orbs-20260814-v7`;
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

const common = {
    mode: "match",
    gameplayMode: "orb-race",
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

async function launch(teams, options = {}) {
    await page.evaluate(({ nextTeams, nextCommon, nextOptions }) => {
        window.__ORB_FOUNDRY__.launch({
            ...nextCommon,
            ...nextOptions,
            raceTeams: nextTeams,
            raceOrbs: [...new Set(nextTeams.flat())],
        });
    }, { nextTeams: teams, nextCommon: common, nextOptions: options });
    await page.locator("#socialCanvas").waitFor({ state: "visible" });
}

await launch([["hacker"], ["sniper"]], {
    raceTeamOptions: [{}, { sniper: { caged: true, cageDuration: 100 } }],
    seed: 814501,
});
await page.evaluate(() => window.advanceTime(2000));
await page.locator("#socialCanvas").screenshot({ path: `${output}/hacker-forward.png` });
await page.evaluate(() => window.advanceTime(4500));
await page.locator("#socialCanvas").screenshot({ path: `${output}/hacker-facing.png` });
await page.evaluate(() => window.advanceTime(3000));
await page.locator("#socialCanvas").screenshot({ path: `${output}/hacker-child.png` });
const hackerState = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
writeFileSync(`${output}/hacker-state.json`, JSON.stringify(hackerState, null, 2));

await launch([["miner"], ["unarmed"]], {
    raceTeamOptions: [{}, { unarmed: { caged: true, cageDuration: 100 } }],
    seed: 814502,
});
await page.evaluate(() => window.advanceTime(1000));
await page.locator("#socialCanvas").screenshot({ path: `${output}/miner-planted.png` });
await page.evaluate(() => window.advanceTime(20000));
await page.locator("#socialCanvas").screenshot({ path: `${output}/miner-drilling.png` });
const minerState = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
writeFileSync(`${output}/miner-state.json`, JSON.stringify(minerState, null, 2));

writeFileSync(`${output}/diagnostics.json`, JSON.stringify({ consoleErrors, pageErrors, failedRequests }, null, 2));
console.log(JSON.stringify({
    output,
    consoleErrors,
    pageErrors,
    failedRequests,
    hacker: hackerState.match?.fighters?.find((fighter) => fighter.raceOrbId === "hacker"),
    miner: minerState.match?.fighters?.find((fighter) => fighter.raceOrbId === "miner"),
}, null, 2));
await browser.close();
