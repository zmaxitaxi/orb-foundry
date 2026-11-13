import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright";

const root = process.env.ORB_FOUNDRY_URL || "http://127.0.0.1:4173/";
const url = new URL("lab.html", root).href;
const output = process.env.ORB_LAB_QA_DIR || join(tmpdir(), "orb-foundry-battle-lab");
const errors = [];
const failedAssets = [];
const browser = await chromium.launch({ headless: true });
await mkdir(output, { recursive: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
function monitor(page) {
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("response", (response) => { if (response.status() >= 400) failedAssets.push(response.url()); });
}
const ready = (page) => page.waitForFunction(() => window.__ORB_LAB__?.getState().ready, null, { timeout: 20000 });
async function seek(page, step) {
    await page.evaluate((value) => window.__ORB_LAB__.seek(value), step);
    await page.waitForFunction((value) => window.__ORB_LAB__.getState().currentStep === value, step);
}
async function more(page, selector) {
    await page.locator(".utility-menu > summary").click();
    await page.locator(selector).click();
}
try {
    const page = await context.newPage();
    monitor(page);
    await page.goto(url, { waitUntil: "networkidle" });
    await ready(page);
    await seek(page, 100);
    await page.locator("#inspectTab").click();
    await page.evaluate(() => {
        for (let index = 0; index < 3; index += 1) document.querySelector("#nextFrameButton").click();
    });
    await page.waitForFunction(() => window.__ORB_LAB__.getState().currentStep === 103);
    await page.locator("#previousFrameButton").click();
    await page.waitForFunction(() => window.__ORB_LAB__.getState().currentStep === 102);
    await seek(page, 900);
    await seek(page, 120);
    const before = await page.evaluate(() => window.__ORB_LAB__.getState());
    await page.locator(".view-menu > summary").click();
    await page.locator("#hitboxButton").click();
    await page.locator("#vectorButton").click();
    await page.locator("#effectsButton").click();
    await page.locator(".workspace-heading").click();
    const after = await page.evaluate(() => window.__ORB_LAB__.getState());
    assert.deepEqual(after.fighters, before.fighters, "overlays and particles do not modify the simulation");
    assert.deepEqual(after.summary.proof, before.summary.proof);
    await page.locator("#verifyButton").click();
    await page.waitForFunction(() => window.__ORB_LAB__.getState().verified === true);
    const event = page.locator(".event-row[data-step]").nth(2);
    const eventStep = Number(await event.getAttribute("data-step"));
    await event.click();
    await page.waitForFunction((step) => window.__ORB_LAB__.getState().currentStep === step, eventStep);
    await page.locator("#challengeTab").focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.locator("#inspectTab").getAttribute("aria-selected"), "true");
    await page.locator("#challengeTab").click();

    await page.locator("#leftFighterButton").click();
    await page.locator("#fighterSearch").fill("origami");
    assert.equal(await page.locator(".roster-option").count(), 1);
    await page.locator('[data-fighter="origami"]').click();
    await page.locator("#challengeSeed").fill("991");
    await page.locator('label:has(input[name="arenaShape"][value="circle"])').click();
    assert.equal(await page.locator("#shareButton").isDisabled(), true);
    await page.locator("#runChallengeButton").click();
    await ready(page);
    await seek(page, 0);
    const configured = await page.evaluate(() => window.__ORB_LAB__.getState());
    assert.equal(configured.challenge.left, "origami");
    assert.equal(configured.challenge.seed, 991);
    assert.equal(configured.challenge.arenaShape, "circle");
    assert.equal(configured.challenge.title, "Origami vs Rubber");
    await page.locator("#playButton").click();
    await page.waitForFunction(() => window.__ORB_LAB__.getState().currentStep > 10);
    await page.locator("#playButton").click();
    await seek(page, configured.summary.steps);
    assert.equal(await page.locator("#arenaResult").isVisible(), true);
    await page.locator("#playButton").click();
    await page.waitForFunction(() => window.__ORB_LAB__.getState().playing && window.__ORB_LAB__.getState().currentStep < 120);
    await seek(page, 0);

    await more(page, "#saveButton");
    await more(page, "#libraryButton");
    assert.equal(await page.locator(".library-row").count(), 1);
    await page.keyboard.press("Escape");
    await page.locator("#shareButton").click();
    const sharedUrl = await page.locator("#shareUrlInput").inputValue();
    await page.locator("#copyChallengeButton").click();
    await page.waitForFunction(() => /copied|copy/i.test(document.querySelector("#shareFeedback").textContent));
    assert.match(await page.locator("#shareFeedback").textContent(), /copied|copy/i);
    await page.locator(".share-export > summary").click();
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#downloadChallengeButton").click();
    const download = await downloadPromise;
    assert.match(download.suggestedFilename(), /991-challenge\.json$/);
    await page.keyboard.press("Escape");
    await page.locator("[data-theme-toggle]").click();
    assert.equal(await page.locator("html").getAttribute("data-appearance"), "dark");
    await page.reload({ waitUntil: "networkidle" });
    await ready(page);
    assert.equal(await page.locator("html").getAttribute("data-appearance"), "dark");
    await seek(page, 420);
    await page.screenshot({ path: join(output, "desktop.png"), fullPage: true });

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark", reducedMotion: "reduce" });
    const mobile = await mobileContext.newPage();
    monitor(mobile);
    await mobile.goto(sharedUrl, { waitUntil: "networkidle" });
    await ready(mobile);
    const recipient = await mobile.evaluate(() => window.__ORB_LAB__.getState());
    assert.deepEqual(recipient.challenge, configured.challenge, "shared challenges do not depend on local saves");
    assert.deepEqual(recipient.summary.proof, configured.summary.proof, "viewport and reduced motion preserve the replay");
    assert.equal(recipient.playing, false);
    assert.equal(recipient.currentStep, 0);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const canvas = await mobile.locator("#labCanvas").boundingBox();
    assert.ok(Math.abs(canvas.width - canvas.height) < 1);
    assert.ok(canvas.y >= 0 && canvas.y + canvas.height <= 844, "the entire matchup fits on a phone");
    await mobile.screenshot({ path: join(output, "mobile.png") });
    await more(mobile, "#libraryButton");
    assert.equal(await mobile.locator(".library-row").count(), 0);
    await mobile.keyboard.press("Escape");

    const portable = { type: "orb-foundry-replay", version: 1, challenge: configured.challenge, proof: configured.summary.proof };
    await page.locator("#importChallengeInput").setInputFiles({
        name: "replay.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(portable)),
    });
    await ready(page);
    await page.waitForFunction(() => window.__ORB_LAB__.getState().verified === true);
    portable.proof = { ...portable.proof, stateHash: "00000000" };
    await page.locator("#importChallengeInput").setInputFiles({
        name: "different-replay.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(portable)),
    });
    await ready(page);
    await page.waitForFunction(() => window.__ORB_LAB__.getState().verified === false);
    assert.equal(await page.locator("#labNotice").isVisible(), true);

    const unsupported = { ...configured.challenge, engine: "unsupported-engine" };
    await mobile.goto(url + "?challenge=" + Buffer.from(JSON.stringify(unsupported)).toString("base64url"), { waitUntil: "networkidle" });
    await ready(mobile);
    assert.match(await mobile.locator("#labNotice").textContent(), /different simulation version/);
    await mobile.locator("#sampleList").selectOption("chains");
    await ready(mobile);
    assert.equal(await mobile.locator("#labNotice").isVisible(), false);

    await page.evaluate(() => {
        window.__ORB_LAB__.load({ left: "unarmed", right: "unarmed", seed: 123, health: [2000, 2000] });
        window.__ORB_LAB__.load({ left: "pinball", right: "rubber", seed: 418 });
    });
    await ready(page);
    assert.equal((await page.evaluate(() => window.__ORB_LAB__.getState())).challenge.left, "pinball", "a cancelled build cannot replace the latest challenge");
    await more(page, "#recordChallengeLink");
    await page.waitForURL((value) => value.pathname.endsWith("/index.html"));
    await page.locator("#setupDialog").waitFor({ state: "visible" });
    assert.equal(await page.locator("#seedInput").inputValue(), "418");
    assert.equal(await page.locator('#classicTeamOneGrid input[value="pinball"]').isChecked(), true);
    assert.equal(await page.locator('#classicTeamTwoGrid input[value="rubber"]').isChecked(), true);
    assert.equal(await page.locator("html").getAttribute("data-appearance"), "dark");

    assert.deepEqual(errors, []);
    assert.deepEqual(failedAssets, []);
    const result = { output, exactStepping: true, verified: true, sharedProofMatched: true, portableReplay: true,
        unsupportedVersionHandled: true, cancelledBuildHandled: true, recorderHandoff: true, errors, failedAssets };
    await writeFile(join(output, "report.json"), JSON.stringify(result, null, 2) + "\n");
    console.log(JSON.stringify(result, null, 2));
    await mobileContext.close();
} finally {
    await context.close();
    await browser.close();
}
