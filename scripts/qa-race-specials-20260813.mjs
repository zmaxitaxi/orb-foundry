import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = `${root}/artifacts/design-qa/orb-race-specials-20260813`;
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

const captures = [
    ["whirlwind", [["whirlwind"], ["unarmed"]], 813101, 2500],
    ["copycat-roulette", [["copycat"], ["sniper"]], 813102, 2400],
    ["copycat-resolved", [["copycat"], ["sniper"]], 813103, 8200],
    ["rgb-cycle", [["rgb"], ["unarmed"]], 813104, 5200],
    ["reality-slammy", [["reality-bomb"], ["unarmed"]], 813105, 6200],
    ["antimatter-clean", [["antimatter-bomb"], ["unarmed"]], 813106, 15300],
];

for (const [name, teams, seed, elapsed] of captures) {
    await page.evaluate(({ nextTeams, nextSeed, nextCommon }) => {
        window.__ORB_FOUNDRY__.launch({
            ...nextCommon,
            raceTeams: nextTeams,
            raceOrbs: [...new Set(nextTeams.flat())],
            seed: nextSeed,
        });
    }, { nextTeams: teams, nextSeed: seed, nextCommon: common });
    await page.locator("#socialCanvas").waitFor({ state: "visible" });
    await page.evaluate((duration) => window.advanceTime(duration), elapsed);
    await page.locator("#socialCanvas").screenshot({ path: `${output}/${name}.png` });
    const state = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
    writeFileSync(`${output}/${name}.json`, JSON.stringify(state, null, 2));
}

writeFileSync(`${output}/diagnostics.json`, JSON.stringify({ consoleErrors, pageErrors, failedRequests }, null, 2));
console.log(JSON.stringify({ output, consoleErrors, pageErrors, failedRequests }, null, 2));
await browser.close();
