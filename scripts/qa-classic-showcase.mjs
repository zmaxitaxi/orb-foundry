import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright";
import { CLASSIC_SHOWCASE_FIGHTERS, CLASSIC_SHOWCASE_IDS } from "../src/classic-showcase.js";
import { normalizeSettings } from "../src/config.js";
import { createSimulation, stepSimulation } from "../src/simulation.js";

const rootUrl = process.env.ORB_FOUNDRY_URL || "http://127.0.0.1:4173/";
const output = process.env.ORB_SHOWCASE_QA_DIR || join(tmpdir(), "orb-foundry-eight-fighters");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
const failedAssets = [];
const samples = [];
const replayChecks = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("response", (response) => { if (response.status() >= 400) failedAssets.push(response.url()); });
await mkdir(output, { recursive: true });
try {
    await page.goto(rootUrl, { waitUntil: "networkidle" });
    await page.locator("#menuPlayButton").click();
    for (const id of CLASSIC_SHOWCASE_IDS) {
        assert.equal(await page.locator(`#classicTeamOneGrid input[value="${id}"]`).count(), 1);
    }
    for (const [id, def] of Object.entries(CLASSIC_SHOWCASE_FIGHTERS)) {
        for (const key of def.moves) {
            await page.evaluate((type) => window.__ORB_FOUNDRY__.launch({
                gameplayMode: "classic", classicTeams: [[type], ["knight"]], seed: 41, arenaSize: "large",
                classicOrbOptions: { [type]: { health: 2000 }, knight: { health: 2000 } },
                features: { introCards: false, replay: false },
            }), id);
            const sample = await page.evaluate(({ id, key }) => {
                for (let index = 0; index < 1800; index += 1) {
                    window.advanceTime(50);
                    const state = window.__ORB_FOUNDRY__.getState();
                    const move = state.fighters[0].classicShowcase?.move;
                    const delay = ["charged-deck", "crane-flight"].includes(key) ? .42
                        : key === "scarab-cavalcade" ? .66 : key === "sling-ring" ? .52
                            : ["rail-spear", "chaos-chain", "bo-staff", "elastic-fist", "mirage-step"].includes(key) ? .23 : .15;
                    if (move?.key === key && move.phase === "active" && state.time >= move.activeAt + delay && state.time < move.endAt - .02) {
                        document.querySelector("#pauseButton").click();
                        return { id, key, time: state.time, entities: state.classicShowcaseEntities, move };
                    }
                    if (state.finished) return null;
                }
                return null;
            }, { id, key });
            assert.ok(sample, `${id}: ${key} must reach a live visible attack`);
            const text = JSON.parse(await page.evaluate(() => window.render_game_to_text()));
            assert.equal(text.match.fighters[0].classic.showcase.move, key);
            await page.locator("#socialCanvas").screenshot({ path: join(output, `${key}.png`) });
            samples.push(sample);
        }
    }

    // The publishing planner and browser recorder must agree on exact results.
    for (const [index, id] of CLASSIC_SHOWCASE_IDS.entries()) {
        const options = {
            classicTeams: [[id], ["knight"]], seed: 414 + index, arenaSize: "large",
            arenaShape: index % 2 ? "circle" : "square", features: { introCards: false, replay: false },
        };
        const sim = createSimulation(normalizeSettings(options));
        for (let step = 0; step < 10800 && !sim.finished; step += 1) stepSimulation(sim, 1 / 120);
        const actual = await page.evaluate((settings) => {
            window.__ORB_FOUNDRY__.launch(settings);
            window.advanceTime(90000);
            return window.__ORB_FOUNDRY__.getState();
        }, options);
        assert.ok(Math.abs(actual.time - sim.time) < 1e-6, `${id}: browser replay duration`);
        assert.deepEqual(actual.fighters.map((f) => f.health), sim.fighters.map((f) => f.health), `${id}: browser replay HP`);
        const sequence = (events) => events.map((event) => [event.move, event.phase, event.amount]);
        assert.deepEqual(sequence(actual.classicShowcaseCues), sequence(sim.events.filter((e) => e.type === "classic-showcase-cue").slice(-24)), `${id}: replay events`);
        replayChecks.push({ id, duration: sim.time, winner: sim.winner?.type, matched: true });
    }

    // Drive the normal setup controls and retain one recorder across seven duels.
    await page.evaluate(() => {
        const settings = window.__ORB_FOUNDRY__.getState().settings;
        window.__ORB_FOUNDRY__.launch({ ...settings, features: { ...settings.features, introCards: true } });
    });
    await page.locator("#socialCancelButton").click();
    await page.locator("#gameplayModeSelect").selectOption("classic-tournament");
    await page.locator("#classicTournamentSize").selectOption("8");
    await page.locator("#classicTournamentClear").click();
    for (const id of CLASSIC_SHOWCASE_IDS) {
        await page.locator(`#classicTournamentEntrants input[value="${id}"]`).check();
    }
    assert.equal(await page.locator("#classicBlackTheme").isChecked(), true);
    assert.equal(await page.locator("#classicBlackTheme").isDisabled(), true);
    await page.locator("#socialFormatSelect").selectOption("portrait");
    await page.locator('input[name="socialFps"][value="30"]').locator("..").click();
    await page.locator("#launchButton").click();
    await page.waitForFunction(() => window.__ORB_FOUNDRY__.getState().recorder === "recording");
    await page.waitForTimeout(1800);
    for (let index = 0; index < 7; index += 1) {
        await page.waitForTimeout(1500);
        const seed = await page.evaluate(() => window.__ORB_FOUNDRY__.getState().seed);
        await page.evaluate(() => window.advanceTime(185000));
        const state = await page.evaluate(() => window.__ORB_FOUNDRY__.getState());
        assert.equal(state.classicTournament.completedMatches, index + 1);
        assert.equal(state.recorder, "recording");
        assert.equal(state.settings.classicBlackTheme, true);
        if (index < 6) {
            await page.waitForFunction((previous) => window.__ORB_FOUNDRY__.getState().seed !== previous, seed, { timeout: 7000 });
        } else {
            await page.locator("#socialStage").screenshot({ path: join(output, "champion.png") });
        }
    }
    await page.waitForFunction(() => window.__ORB_FOUNDRY__.getState().recorder === "preview", null, { timeout: 10000 });
    const final = await page.evaluate(() => window.__ORB_FOUNDRY__.getState());
    assert.ok(CLASSIC_SHOWCASE_IDS.includes(final.classicTournament.championId));
    assert.equal(final.recordingResult.metadata.completedMatches, 7);
    assert.equal(final.recordingResult.metadata.championId, final.classicTournament.championId);
    assert.equal(final.announcer.failedCueCount, 0);
    assert.ok(final.announcer.spokenCueCount >= 8, "the recording includes real spoken names");
    for (const id of CLASSIC_SHOWCASE_IDS) {
        assert.ok(final.announcer.requestedCues.includes(`intro-${id}`), `announce ${id}`);
    }
    const video = await page.locator("#socialVideoPreview").evaluate(async (element) => {
        if (element.readyState < 1) await new Promise((resolve) => element.addEventListener("loadedmetadata", resolve, { once: true }));
        return { width: element.videoWidth, height: element.videoHeight, error: element.error?.message || null };
    });
    assert.deepEqual(video, { width: 1080, height: 1920, error: null });
    const data = await page.locator("#socialVideoPreview").evaluate(async (element) => {
        const blob = await (await fetch(element.src)).blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.readAsDataURL(blob);
        });
    });
    await writeFile(join(output, "tournament.mp4"), Buffer.from(data, "base64"));
    const shareUrl = page.url();
    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await mobile.goto(shareUrl, { waitUntil: "networkidle" });
    assert.equal(await mobile.locator("#classicTournamentEntrants input:checked").count(), 8);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mobile.locator("#setupDialog").screenshot({ path: join(output, "mobile-setup.png") });
    await mobile.close();
    assert.deepEqual(errors, []);
    assert.deepEqual(failedAssets, []);
    await writeFile(join(output, "report.json"), JSON.stringify({ samples, replayChecks, final, video, errors, failedAssets }, null, 2) + "\n");
    console.log(JSON.stringify({ output, poses: samples.length, replayChecks: replayChecks.length, champion: final.classicTournament.championId,
        completedMatches: final.classicTournament.completedMatches, recording: final.recordingResult.filename, video, errors, failedAssets }, null, 2));
} finally {
    await browser.close();
}
