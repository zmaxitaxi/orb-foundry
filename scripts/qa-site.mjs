import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright";

const root = process.env.ORB_FOUNDRY_URL || "http://127.0.0.1:4173/";
const output = process.env.ORB_SITE_QA_DIR || join(tmpdir(), "orb-foundry-site");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
const page = await context.newPage();
const errors = [];
const failedAssets = [];
const effectRequests = new Set();
function monitor(page) {
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("response", (response) => { if (response.status() >= 400) failedAssets.push(response.url()); });
    page.on("request", (request) => { if (request.url().includes("/audio/effects/")) effectRequests.add(request.url()); });
}
monitor(page);
const goto = (path) => page.goto(new URL(path, root).href, { waitUntil: "networkidle" });
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
try {
    await goto("index.html");
    await page.waitForFunction(() => window.__ORB_FOUNDRY__);
    assert.equal(await page.locator("#menuBattleLabLink").isVisible(), true);
    assert.equal(await noOverflow(page), true);
    await page.locator("#menuTitle").click();
    await page.waitForFunction(() => document.querySelectorAll(".scene-particles > i").length > 0);
    assert.equal(await page.locator(".site-atmosphere").getAttribute("aria-hidden"), "true");
    assert.equal(await page.locator(".site-atmosphere").evaluate((node) => getComputedStyle(node).pointerEvents), "none");
    await page.screenshot({ path: join(output, "home-light.png"), fullPage: true });
    await page.locator(".site-header [data-theme-toggle]").click();
    assert.equal(await page.locator("html").getAttribute("data-appearance"), "dark");
    await page.locator("#homeRacerTab").click();
    await page.waitForFunction(() => window.__ORB_HOME__?.getState().mode === "orb-race");
    assert.equal((await page.evaluate(() => window.__ORB_HOME__.getState())).gameplayMode, "orb-race");
    assert.match(await page.locator("#menuBattleLabLink").getAttribute("href"), /game=orb-race/);
    assert.equal(await page.locator("#homeRoster").isVisible(), false);
    await page.screenshot({ path: join(output, "home-racer-dark.png"), fullPage: true });
    await page.locator("#homeRacerTab").focus();
    await page.keyboard.press("ArrowLeft");
    assert.equal((await page.evaluate(() => window.__ORB_HOME__.getState())).mode, "classic");
    await page.locator(".home-roster > summary").click();
    assert.equal(await page.locator(".menu-orb-card").count(), 65);
    await page.locator(".menu-orb-card").last().click();
    await page.locator("#profileScreen").waitFor({ state: "visible" });
    assert.equal(await page.locator("#profileScreen").evaluate((node) => getComputedStyle(node).transform), "none", "blurred toolbars keep a stable hit-testing ancestor");
    await page.waitForTimeout(280);
    assert.equal(await noOverflow(page), true);
    assert.equal(await page.locator("#profileDots").isVisible(), false);
    await page.screenshot({ path: join(output, "profile-dark.png"), fullPage: true });
    await page.locator("#profilePlayButton").click();
    assert.equal(await page.locator('#classicTeamOneGrid input[value="sand-pharaoh"]').isChecked(), true);
    const collapsed = await page.locator("details.classic-orb-options[open]").count();
    assert.equal(collapsed, 0, "advanced fighter options stay collapsed until requested");
    await page.locator("#gameplayModeSelect").selectOption("classic-tournament");
    assert.equal(await page.locator("#classicTournamentFieldset").isVisible(), true);
    assert.equal(await page.locator("#classicBlackTheme").isChecked(), true);
    await page.screenshot({ path: join(output, "tournament-setup-dark.png"), fullPage: true });
    await page.locator("#closeSetupButton").click();
    await page.locator("#profileBackButton").click();
    await page.locator("#menuBalanceButton").evaluate((button) => button.click());
    await page.locator("#balanceDialog").waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
    await page.locator("#menuDeveloperButton").evaluate((button) => button.click());
    await page.locator("#developerDialog").waitFor({ state: "visible" });
    await page.keyboard.press("Escape");

    await goto("study.html");
    await page.waitForFunction(() => window.__ORB_STUDY__?.getState().ready);
    const initial = await page.evaluate(() => window.__ORB_STUDY__.getState());
    assert.equal(initial.catalogCount, 121);
    assert.deepEqual(initial.reading, { a: 13, b: 14, outcome: "a" });
    await page.locator("#studyHealth").fill("60");
    assert.equal((await page.evaluate(() => window.__ORB_STUDY__.getState())).reading.outcome, "b");
    await page.locator("#studyRight").selectOption("hydrogen-bomb");
    assert.equal((await page.evaluate(() => window.__ORB_STUDY__.getState())).reading.outcome, "open");
    assert.match(await page.locator("#studyOffAxis").textContent(), /60s fuse/);
    await page.locator("#studyLeft").selectOption("sword");
    assert.match(await page.locator("#studyOffAxis").textContent(), /Last team alive/);
    await page.locator("#rosterTab").click();
    await page.locator("#studySearch").fill("Fibonacci");
    assert.equal(await page.locator(".study-character").count(), 1);
    await page.locator(".study-character").click();
    assert.equal((await page.evaluate(() => window.__ORB_STUDY__.getState())).first, "fibonacci");
    await page.locator("#coursesTab").click();
    assert.equal(await page.locator(".study-course").count(), 4);
    await page.locator('[data-study-course="saturday"]').click();
    assert.equal((await page.evaluate(() => window.__ORB_STUDY__.getState())).course, "saturday");
    const shareUrl = page.url();
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__ORB_STUDY__?.getState().ready);
    assert.equal((await page.evaluate(() => window.__ORB_STUDY__.getState())).course, "saturday");
    await page.locator("#studyLeft").selectOption("x-squared");
    await page.locator("#studyRight").selectOption("fibonacci");
    await page.locator("#studyCourse").selectOption("dial");
    await page.screenshot({ path: join(output, "study-dark.png"), fullPage: true });

    await goto("about.html");
    await page.locator("audio").evaluate((audio) => audio.play());
    await page.waitForFunction(() => document.querySelector("audio").currentTime > .05);
    assert.equal(await page.locator(".sound-reel").getAttribute("data-playing"), "true");
    await page.locator("audio").evaluate((audio) => audio.pause());

    const audio = await page.evaluate(async () => {
        const { CombatAudio, ANNOUNCER_ASSETS } = await import("./src/audio.js?v=20261112-battle-lab-engine4");
        const audio = new CombatAudio();
        await audio.unlock();
        const analyser = audio.context.createAnalyser();
        audio.masterGain.connect(analyser);
        const played = audio.play({ type: "classic-critical", gameplayMode: "classic", fighterType: "boxer", id: 99 });
        await new Promise((resolve) => setTimeout(resolve, 60));
        const signal = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(signal);
        const rms = Math.sqrt(signal.reduce((total, value) => total + value * value, 0) / signal.length);
        const voiceCues = ["intro-luke-skywalker", "intro-sword", "intro-race-fibonacci", "race-versus", "race-count-25", "intro-country-france"];
        const voicePlayed = voiceCues.every((cue) => audio.playAnnouncer(cue, .1));
        const result = { count: audio.sampleBuffers.size, failures: audio.sampleFailures, played, rms, recordingTracks: audio.getRecordingStream().getAudioTracks().length,
            announcerCount: audio.announcerBuffers.size, expectedAnnouncerCount: Object.keys(ANNOUNCER_ASSETS).length,
            announcerFailures: audio.announcerFailures, voicePlayed };
        await audio.context.close();
        return result;
    });
    assert.equal(audio.announcerCount, audio.expectedAnnouncerCount);
    assert.deepEqual(audio.announcerFailures, []);
    assert.equal(audio.voicePlayed, true);
    assert.equal(audio.count, 62);
    assert.deepEqual(audio.failures, []);
    assert.equal(audio.played, true);
    assert.ok(audio.rms > .001, "the actual Web Audio graph produces sound");
    assert.equal(audio.recordingTracks, 1, "effects reach the recording audio stream");
    assert.ok([...effectRequests].every((url) => url.includes("/original-v1/")), "the live site does not fetch the archived effects");

    await goto("index.html?record=1&game=orb-race");
    await page.locator("#setupDialog").waitFor({ state: "visible" });
    assert.equal(await page.locator("#gameplayModeSelect").inputValue(), "orb-race", "the Racer homepage route opens Race setup");
    await goto("index.html?record=1");
    await page.locator("#setupDialog").waitFor({ state: "visible" });
    await page.locator("#closeSetupButton").click();
    await page.waitForFunction(() => [...document.querySelectorAll("dialog")].every((dialog) => !dialog.open && getComputedStyle(dialog).overlay === "none"));
    await page.evaluate(async () => {
        const { createLabChallenge, labSimulationSettings } = await import("./src/battle-lab-model.js?v=20261112-battle-lab4");
        const settings = labSimulationSettings(createLabChallenge({ left: "luke-skywalker", right: "darth-vader", seed: 4 }));
        await window.__ORB_FOUNDRY__.record({ ...settings, social: { format: "portrait", fps: 30, requireAnnouncer: false }, features: { ...settings.features, introCards: false, videoRecording: true } });
    });
    await page.waitForFunction(() => window.__ORB_FOUNDRY__.getState().recorder === "recording");
    const canvas = await page.locator("#socialCanvas").boundingBox();
    assert.ok(canvas.y >= 0 && canvas.y + canvas.height <= 1000, "the entire recording canvas fits in view");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: join(output, "recording-dark.png"), fullPage: true });
    const stopHit = await page.locator("#socialStopButton").evaluate((button) => {
        const bounds = button.getBoundingClientRect();
        const hit = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        return { id: hit?.id, hit: hit?.outerHTML.slice(0,160), scroll:scrollY, viewport:[innerWidth,innerHeight], rect:bounds.toJSON(),
            dialogs:[...document.querySelectorAll("dialog")].map(dialog=>({id:dialog.id,open:dialog.open,overlay:getComputedStyle(dialog).overlay,display:getComputedStyle(dialog).display,opacity:getComputedStyle(dialog).opacity})),
            ancestors:[button,button.parentElement,button.parentElement.parentElement,document.querySelector("#gameScreen"),document.body].map(node=>({tag:node.tagName,id:node.id,rect:node.getBoundingClientRect().toJSON(),pointer:getComputedStyle(node).pointerEvents,opacity:getComputedStyle(node).opacity,transform:getComputedStyle(node).transform,position:getComputedStyle(node).position,z:getComputedStyle(node).zIndex})) };
    });
    if (stopHit.id !== "socialStopButton") console.log(JSON.stringify({ stopHit }, null, 2));
    assert.equal(stopHit.id, "socialStopButton", "recorder controls receive pointer input after setup closes");
    await page.locator("#socialStopButton").click();
    await page.waitForFunction(() => window.__ORB_FOUNDRY__.getState().recorder === "preview", null, { timeout: 20000 });
    await page.locator("#socialPreviewDialog").waitFor({ state: "visible" });
    const video = await page.locator("#socialVideoPreview").evaluate(async (video) => {
        if (video.readyState < 1) await new Promise((resolve) => video.addEventListener("loadedmetadata", resolve, { once: true }));
        return { width: video.videoWidth, height: video.videoHeight, error: video.error?.message || null };
    });
    assert.deepEqual(video, { width: 1080, height: 1920, error: null });
    await page.locator("#socialVideoPreview").evaluate(async (video) => {
        await video.play();
        await new Promise((resolve) => {
            const check = () => { if (video.currentTime > .15) { video.pause(); resolve(); } else requestAnimationFrame(check); };
            check();
        });
    });
    const visiblePixels = await page.locator("#socialVideoPreview").evaluate((video) => {
        const canvas = document.createElement("canvas");
        canvas.width = 270; canvas.height = 480;
        const context = canvas.getContext("2d"); context.drawImage(video, 0, 0, 270, 480);
        const pixels = context.getImageData(0, 0, 270, 480).data;
        let bright = 0;
        for (let index = 0; index < pixels.length; index += 4) if (Math.max(pixels[index], pixels[index + 1], pixels[index + 2]) > 60) bright += 1;
        return bright;
    });
    assert.ok(visiblePixels > 150, "the decoded video contains the battle, not a blank frame");
    const previewBounds = await page.locator("#socialVideoPreview").boundingBox();
    assert.ok(Math.abs(previewBounds.width / previewBounds.height - 9 / 16) < .01, "the preview preserves the portrait aspect ratio");
    await page.screenshot({ path: join(output, "preview-dark.png"), fullPage: true });

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark", reducedMotion: "reduce" });
    const mobile = await mobileContext.newPage(); monitor(mobile);
    for (const path of ["index.html", "lab.html", "about.html", "study.html"]) {
        await mobile.goto(new URL(path, root).href, { waitUntil: "networkidle" });
        assert.equal(await noOverflow(mobile), true, `no horizontal overflow on ${path}`);
        const hiddenReveal = await mobile.locator("[data-reveal]").evaluateAll((nodes) => nodes.some((node) => getComputedStyle(node).opacity === "0"));
        assert.equal(hiddenReveal, false, "reduced motion keeps content visible");
        assert.equal(await mobile.locator(".scene-particles i").first().evaluate((node) => getComputedStyle(node).animationName), "none", "background movement honors reduced motion");
        await mobile.screenshot({ path: join(output, `mobile-${path.replace(".html", "")}.png`), fullPage: true });
        if (path === "index.html") {
            await mobile.locator("#homeRacerTab").click();
            assert.equal((await mobile.evaluate(() => window.__ORB_HOME__.getState())).mode, "orb-race");
            assert.equal(await noOverflow(mobile), true);
            await mobile.screenshot({ path: join(output, "mobile-racer.png"), fullPage: true });
        }
    }
    await mobile.goto(shareUrl, { waitUntil: "networkidle" });
    await mobile.waitForFunction(() => window.__ORB_STUDY__?.getState().ready);
    assert.equal((await mobile.evaluate(() => window.__ORB_STUDY__.getState())).course, "saturday");
    await mobileContext.close();
    assert.deepEqual(errors, []);
    assert.deepEqual(failedAssets, []);
    const result = { output, pages: ["Home", "Profiles", "Setup", "Tournament", "Tools", "Course Study", "About", "Recorder", "Preview"], originalAudio: audio, originalEffectRequests: effectRequests.size, portraitVideo: video, errors, failedAssets };
    await writeFile(join(output, "report.json"), JSON.stringify(result, null, 2) + "\n");
    console.log(JSON.stringify(result, null, 2));
} finally { await context.close(); await browser.close(); }
