import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = `${root}/artifacts/design-qa/batman-grapple-20260811`;
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
page.on("requestfailed", (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || "unknown" }));

await page.goto("http://127.0.0.1:4174/index.html", { waitUntil: "networkidle" });
await page.waitForFunction(() => Boolean(window.__ORB_FOUNDRY__));

const launch = async (format) => page.evaluate((nextFormat) => {
  window.__ORB_FOUNDRY__.launch({
    mode: "match",
    gameplayMode: "orb-race",
    raceTeams: [["batman"], ["boomerang"]],
    raceOrbs: ["batman", "boomerang"],
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
    social: { enabled: true, format: nextFormat, fps: 30, highlightMode: false, showWinProbability: false },
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
    seed: 3332,
  });
}, format);

const capture = async (name, advanceMs) => {
  await page.evaluate((milliseconds) => window.advanceTime(milliseconds), advanceMs);
  await page.locator("#socialCanvas").screenshot({ path: `${output}/${name}.png` });
  writeFileSync(`${output}/${name}.json`, await page.evaluate(() => window.render_game_to_text()));
};

const readBatman = async () => page.evaluate(() => {
  const state = JSON.parse(window.render_game_to_text());
  return state.match?.fighters?.find((fighter) => fighter.raceOrbId === "batman") || null;
});

const captureWhenGrappleIsActive = async (name) => {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    await page.evaluate(() => window.advanceTime(50));
    if (await readBatman().then((fighter) => Boolean(fighter?.batmanGrapple))) {
      await page.locator("#socialCanvas").screenshot({ path: `${output}/${name}.png` });
      writeFileSync(`${output}/${name}.json`, await page.evaluate(() => window.render_game_to_text()));
      return;
    }
  }
  throw new Error(`Batman grapple did not become active for ${name}`);
};

await launch("portrait");
await captureWhenGrappleIsActive("portrait-firing");
await capture("portrait-pulling", 250);
await capture("portrait-release", 500);

await launch("race-landscape");
await captureWhenGrappleIsActive("longform-firing");
await capture("longform-pulling", 300);

writeFileSync(`${output}/diagnostics.json`, JSON.stringify({ consoleErrors, pageErrors, failedRequests }, null, 2));
await browser.close();
