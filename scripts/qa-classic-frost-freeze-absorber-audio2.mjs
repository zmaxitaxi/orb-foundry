import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = `${root}/artifacts/design-qa/classic-frost-freeze-absorber-audio2`;
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

const launch = async (name, teams, seed, elapsedMs) => {
    await page.evaluate(({ nextTeams, nextSeed }) => {
        window.__ORB_FOUNDRY__.launch({
            mode: "match",
            gameplayMode: "classic",
            classes: [...new Set(nextTeams.flat())],
            classicTeams: nextTeams,
            classicTeamOptions: nextTeams.map((team) => Object.fromEntries(team.map((id) => [id, {}]))),
            classicOrbOptions: Object.fromEntries(nextTeams.flat().map((id) => [id, {}])),
            classicBlackTheme: true,
            classicTeamColors: true,
            arenaSize: "standard",
            arenaShape: "square",
            social: { enabled: true, format: "portrait", fps: 30, highlightMode: false, showWinProbability: false },
            features: {
                introCards: false,
                soundEffects: true,
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
    }, { nextTeams: teams, nextSeed: seed });
    await page.locator("#socialCanvas").waitFor({ state: "visible" });
    await page.evaluate((ms) => window.advanceTime(ms), elapsedMs);
    await page.locator("#socialCanvas").screenshot({ path: `${output}/${name}.png` });
    writeFileSync(`${output}/${name}.json`, await page.evaluate(() => window.render_game_to_text()));
};

await launch("frost-vs-absorber", [["frost-ball"], ["absorber"]], 81201, 9000);
await launch("zeus-vs-sword", [["zeus"], ["sword"]], 81202, 4200);

const assets = await page.evaluate(() => performance.getEntriesByType("resource")
    .map((entry) => entry.name)
    .filter((name) => name.includes("frost-freeze") || name.includes("fantasy-sword-hit") || name.includes("race-thunder")));
const diagnostics = { consoleErrors, pageErrors, failedRequests, assets };
writeFileSync(`${output}/diagnostics.json`, JSON.stringify(diagnostics, null, 2));
console.log(JSON.stringify(diagnostics, null, 2));
await browser.close();
