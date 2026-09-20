import { chromium } from "playwright";

const url = process.env.ORB_FOUNDRY_URL || "http://127.0.0.1:4173/index.html?mode=classic";
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });

page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(String(error)));
page.on("requestfailed", (request) => {
    failedRequests.push(`${request.url()} ${request.failure()?.errorText || "failed"}`);
});

let response = null;
let state = null;
try {
    response = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    await page.locator("#socialCanvas").waitFor({ state: "attached", timeout: 30_000 });
    await page.waitForTimeout(300);
    state = await page.evaluate(() => ({
        title: document.title,
        readyState: document.readyState,
        socialCanvas: Boolean(document.querySelector("#socialCanvas")),
        renderText: typeof window.render_game_to_text === "function",
        fighterPickers: document.querySelectorAll("[data-fighter-id]").length,
    }));
} catch (error) {
    pageErrors.push(String(error));
}

await browser.close();

const result = {
    url,
    status: response?.status() ?? null,
    state,
    consoleErrors,
    pageErrors,
    failedRequests,
};
console.log(JSON.stringify(result, null, 2));

if (
    response?.status() !== 200
    || !state?.socialCanvas
    || !state?.renderText
    || consoleErrors.length > 0
    || pageErrors.length > 0
    || failedRequests.length > 0
) {
    process.exitCode = 1;
}
