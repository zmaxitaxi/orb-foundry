import { chromium } from "playwright";

const url = process.argv[2];
const screenshotPath = process.argv[3] || "artifacts/design-qa/classic-weapons.png";
if (!url) throw new Error("Expected a local Orb Foundry URL");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errors = [];
page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console:${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`page:${error.message}`));

await page.goto(url, { waitUntil: "networkidle" });
const launch = page.locator("#launchButton");
if (await launch.isVisible()) await launch.click();
await page.locator("#socialCanvas").waitFor({ state: "visible" });
await page.waitForTimeout(2500);

const gameText = await page.evaluate(() => (
    window.render_game_to_text ? window.render_game_to_text() : ""
));
await page.locator("#socialCanvas").screenshot({ path: screenshotPath });
const assets = await page.evaluate(() => (
    performance.getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((name) => name.includes("classic-weapons-20260808"))
));

console.log(JSON.stringify({ errors, gameText, assets }, null, 2));
await browser.close();
