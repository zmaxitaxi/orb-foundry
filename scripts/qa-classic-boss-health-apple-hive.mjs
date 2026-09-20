import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = `${root}/artifacts/design-qa/classic-boss-health-apple-hive3-no-health-control`;
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

await page.goto("http://127.0.0.1:4180/index.html", { waitUntil: "networkidle" });
await page.waitForFunction(() => Boolean(window.__ORB_FOUNDRY__));
const classicHealthControlCount = await page.locator(
    'input[data-classic-health], input[data-classic-hydrogen-health], .classic-orb-health',
).count();
if (classicHealthControlCount !== 0) {
    throw new Error(`Expected no Classic orb-health controls, found ${classicHealthControlCount}`);
}

const launch = async (name, classicTeams, classicTeamOptions, seed) => {
    await page.evaluate(({ teams, options, nextSeed }) => {
        window.__ORB_FOUNDRY__.launch({
            mode: "match",
            gameplayMode: "classic",
            classes: [...new Set(teams.flat())],
            classicTeams: teams,
            classicTeamOptions: options,
            classicOrbOptions: Object.assign({}, ...options.map((team) => team)),
            classicBlackTheme: true,
            classicTeamColors: true,
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
            seed: nextSeed,
        });
    }, { teams: classicTeams, options: classicTeamOptions, nextSeed: seed });
    await page.locator("#socialCanvas").waitFor({ state: "visible" });
    await page.evaluate(() => window.advanceTime(1000));
    await page.locator("#socialCanvas").screenshot({ path: `${output}/${name}-start.png` });
    writeFileSync(`${output}/${name}-start.json`, await page.evaluate(() => window.render_game_to_text()));
};

await launch(
    "hydrogen-boss-vs-hive",
    [["hydrogen-bomb"], ["hive-ball"]],
    [{ "hydrogen-bomb": { boss: true } }, { "hive-ball": {} }],
    9110,
);
await page.evaluate(() => window.advanceTime(2300));
await page.locator("#socialCanvas").screenshot({ path: `${output}/hydrogen-boss-vs-hive-bee.png` });
writeFileSync(`${output}/hydrogen-boss-vs-hive-bee.json`, await page.evaluate(() => window.render_game_to_text()));

await launch(
    "apple-vs-hive",
    [["apple"], ["hive-ball"]],
    [{ apple: {} }, { "hive-ball": {} }],
    9111,
);
await page.evaluate(() => window.advanceTime(3200));
await page.locator("#socialCanvas").screenshot({ path: `${output}/apple-vs-hive-projectiles.png` });
writeFileSync(`${output}/apple-vs-hive-projectiles.json`, await page.evaluate(() => window.render_game_to_text()));

const assets = await page.evaluate(() => performance.getEntriesByType("resource")
    .map((entry) => entry.name)
    .filter((name) => name.includes("classic-hive-apple-20260811-v1") || name.includes("classic-boss-health-apple-hive3-no-health-control")));
writeFileSync(`${output}/diagnostics.json`, JSON.stringify({ classicHealthControlCount, consoleErrors, pageErrors, failedRequests, assets }, null, 2));
console.log(JSON.stringify({ classicHealthControlCount, consoleErrors, pageErrors, failedRequests, assets }, null, 2));
await browser.close();
