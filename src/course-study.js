import { healthStops } from "./course-study/barrier.js?v=20261112-study1";
import { clearsByBounces, matchReading, firstCurveFlip } from "./course-study/curve.js?v=20261112-study1";
import { contestFor } from "./course-study/contest.js?v=20261112-study1";
import { COURSES, totalHealth } from "./course-study/courses.js?v=20261112-study1";

const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const number = new Intl.NumberFormat("en-US");
const stops = [...new Set([...healthStops(), 750, 1500, 5000, 32000])].sort((a, b) => a - b);
const params = new URL(location.href).searchParams;
let characters = [];
let byId = new Map();
let first = params.get("a") || "x-squared";
let second = params.get("b") || "fibonacci";
let health = Math.max(8, Math.min(8_000_000, Number(params.get("h")) || 750));
let courseId = COURSES.some((course) => course.id === params.get("course")) ? params.get("course") : "dial";
let selectedTab = "dial";
let cache = null;
let reading = null;
const countFor = (character, layers) => character.family === "classic" ? null : clearsByBounces(character.id, layers);
const layers = () => COURSES.find((course) => course.id === courseId)?.layers || [health];
const nearest = (value) => stops.reduce((best, stop, index) => Math.abs(Math.log(stop / value)) < Math.abs(Math.log(stops[best] / value)) ? index : best, 0);

function setTab(name, focus = false) {
    selectedTab = name;
    for (const candidate of ["dial", "roster", "courses"]) {
        const active = candidate === name;
        $(candidate + "Tab").setAttribute("aria-selected", String(active));
        $(candidate + "Tab").tabIndex = active ? 0 : -1;
        $(candidate + "Panel").hidden = !active;
    }
    if (focus) $(name + "Tab").focus();
    if (name === "roster") renderRoster();
    if (name === "courses") renderCourses();
}

for (const [index, name] of ["dial", "roster", "courses"].entries()) {
    $(name + "Tab").addEventListener("click", () => setTab(name));
    $(name + "Tab").addEventListener("keydown", (event) => {
        const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (delta) { event.preventDefault(); setTab(["dial", "roster", "courses"][(index + delta + 3) % 3], true); }
    });
}

function syncUrl() {
    const url = new URL(location.href);
    url.search = "";
    url.searchParams.set("a", first); url.searchParams.set("b", second);
    url.searchParams.set("h", String(health));
    if (courseId !== "dial") url.searchParams.set("course", courseId);
    history.replaceState(null, "", url);
}

function buildSeries() {
    const key = `${first}:${second}`;
    if (cache?.key === key) return cache;
    const pair = [byId.get(first), byId.get(second)];
    const series = pair.map((character, index) => ({
        character, index, points: stops.map((value) => ({ health: value, bounces: countFor(character, [value]) })),
    })).filter((series) => series.points.every((point) => point.bounces != null));
    const maxY = Math.max(10, ...series.flatMap((series) => series.points.map((point) => point.bounces)));
    cache = { key, pair, series, maxY, flip: pair.every((character) => countFor(character, [1]) != null) ? firstCurveFlip(first, second) : null };
    return cache;
}

function renderChart() {
    const { pair, series, maxY } = buildSeries();
    const x = (value) => 55 + Math.log(value / 8) / Math.log(8_000_000 / 8) * 595;
    const y = (value) => 325 - Math.log10(Math.max(1, value)) / Math.log10(maxY) * 290;
    const tick = (value) => value >= 1_000_000 ? `${value / 1_000_000}M` : value >= 1000 ? `${value / 1000}K` : String(value);
    let svg = "";
    for (let value = 1; value <= maxY; value *= 10) {
        svg += `<line class="chart-grid" x1="55" y1="${y(value)}" x2="650" y2="${y(value)}"/><text x="42" y="${y(value) + 3}" text-anchor="end">${tick(value)}</text>`;
    }
    for (const value of [10, 100, 1000, 10000, 100000, 1000000, 8000000]) {
        svg += `<text x="${x(value)}" y="346" text-anchor="middle">${tick(value)}</text>`;
    }
    svg += '<text x="55" y="15">Bounces · log scale</text><text x="650" y="368" text-anchor="end">One-layer health · log scale</text>';
    const colors = ["var(--apple-blue)", "#c88c46"];
    for (const item of series) {
        const path = item.points.map((point, index) => `${index ? "L" : "M"}${x(point.health).toFixed(2)},${y(point.bounces).toFixed(2)}`).join(" ");
        svg += `<path class="chart-line" stroke="${colors[item.index]}" d="${path}"${item.index ? ' stroke-dasharray="6 4"' : ""}/>`;
    }
    if (series.length) {
        svg += `<line class="chart-playhead" x1="${x(health)}" y1="32" x2="${x(health)}" y2="325"/>`;
        for (const item of series) {
            const value = countFor(item.character, [health]);
            svg += `<circle cx="${x(health)}" cy="${y(value)}" r="4.5" fill="${colors[item.index]}" stroke="var(--apple-surface)" stroke-width="2"/>`;
        }
    } else svg += '<text x="350" y="180" text-anchor="middle">These rules do not have a bounce curve.</text>';
    $("studyChart").innerHTML = svg;
    $("studyLegend").innerHTML = series.map((item) => `<span><i style="--curve-color:${colors[item.index]}"></i>${escapeHtml(item.character.name)}<b>${number.format(countFor(item.character, layers()))}</b> bounces</span>`).join("");
    const plotted = new Set(series.map((item) => item.character.id));
    $("studyOffAxis").innerHTML = pair.filter((character) => !plotted.has(character.id)).map((character) => {
        const rule = contestFor(character.id, character.family);
        return `<div><strong>${escapeHtml(character.name)} · ${escapeHtml(rule.title)}</strong><p>${escapeHtml(rule.rule)}</p></div>`;
    }).join("");
}

function renderReading() {
    if (!characters.length) return;
    const a = byId.get(first);
    const b = byId.get(second);
    const aCount = countFor(a, layers());
    const bCount = countFor(b, layers());
    reading = a.family === "classic" || b.family === "classic" ? { a: aCount, b: bCount, outcome: "open" } : matchReading(first, second, layers());
    const title = reading.outcome === "open" ? "Different rules. No bounce ranking."
        : reading.outcome === "tie" ? "Same bounce count."
        : `${reading.outcome === "a" ? a.name : b.name} clears in fewer bounces.`;
    const flip = buildSeries().flip;
    const caption = courseId === "dial" ? `One layer · ${number.format(health)} health${flip ? ` · first lead change near ${number.format(flip)}` : ""}`
        : `${COURSES.find((course) => course.id === courseId).name} · ${layers().length} layers · ${number.format(totalHealth(layers()))} total health`;
    $("studyReading").innerHTML = `${escapeHtml(title)}<small>${escapeHtml(caption)}</small>`;
    $("studyHealthValue").value = number.format(health);
    $("studyHealth").value = String(nearest(health));
    $("studyLeft").value = first; $("studyRight").value = second; $("studyCourse").value = courseId;
    renderChart();
    syncUrl();
}

function renderRoster() {
    const search = $("studySearch").value.trim().toLowerCase();
    const mode = $("studyMode").value;
    const visible = characters.filter((character) => (mode === "all" || character.mode === mode) && `${character.name} ${character.formula}`.toLowerCase().includes(search));
    $("studyRosterCount").textContent = `${visible.length} orbs`;
    $("studyRoster").innerHTML = visible.map((character) => `<button type="button" class="study-character" data-study-orb="${escapeHtml(character.id)}" aria-label="Study ${escapeHtml(character.name)}"><img src="./showcase/${escapeHtml(character.images.stick)}" alt="" loading="lazy" width="48" height="58"><span><strong>${escapeHtml(character.name)}</strong><small>${escapeHtml(character.formula)}</small></span></button>`).join("") || '<p class="study-model-note">No matching orbs.</p>';
}

function renderCourses() {
    $("studyCourses").innerHTML = COURSES.map((course) => {
        const maximum = Math.max(...course.layers);
        return `<article class="study-course"><h2>${escapeHtml(course.name)}</h2><p>${escapeHtml(course.summary)}</p><div class="layer-strip" aria-label="${course.layers.length} layers">${course.layers.map((health) => `<i style="--layer-height:${Math.max(6, health / maximum * 100)}%" title="${number.format(health)} health"></i>`).join("")}</div><small>${course.layers.length} layers · ${number.format(totalHealth(course.layers))} HP</small><button type="button" data-study-course="${course.id}" class="apple-button secondary">Use preset</button></article>`;
    }).join("");
}

for (const [id, side] of [["studyLeft", "first"], ["studyRight", "second"]]) {
    $(id).addEventListener("change", () => { if (side === "first") first = $(id).value; else second = $(id).value; renderReading(); });
}
$("studyHealth").addEventListener("input", () => { health = stops[Number($("studyHealth").value)]; courseId = "dial"; renderReading(); });
$("studyCourse").addEventListener("change", () => { courseId = $("studyCourse").value; renderReading(); });
$("studySearch").addEventListener("input", renderRoster);
$("studyMode").addEventListener("change", renderRoster);
$("studyRoster").addEventListener("click", (event) => {
    const button = event.target.closest("[data-study-orb]");
    if (!button) return;
    first = button.dataset.studyOrb; setTab("dial"); renderReading(); window.scrollTo({ top: 0, behavior: "instant" });
});
$("studyCourses").addEventListener("click", (event) => {
    const button = event.target.closest("[data-study-course]");
    if (!button) return;
    courseId = button.dataset.studyCourse; setTab("dial"); renderReading(); window.scrollTo({ top: 0, behavior: "instant" });
});
$("studyShare").addEventListener("click", async () => {
    syncUrl();
    try { await navigator.clipboard.writeText(location.href); $("studyNotice").textContent = "Link copied."; }
    catch { $("studyNotice").textContent = `Copy this link: ${location.href}`; }
    $("studyNotice").hidden = false;
});
window.__ORB_STUDY__ = { getState: () => ({ ready: characters.length > 0, first, second, health, course: courseId, tab: selectedTab, reading, catalogCount: characters.length }) };

try {
    const response = await fetch(new URL("../site/data/characters.json", import.meta.url));
    if (!response.ok) throw new Error("The catalog could not be loaded. Reload to try again.");
    const catalog = await response.json();
    characters = catalog.characters;
    byId = new Map(characters.map((character) => [character.id, character]));
    if (!byId.has(first)) first = "x-squared";
    if (!byId.has(second)) second = "fibonacci";
    const options = ["math", "contact", "special", "classic"].map((family) => `<optgroup label="${family === "classic" ? "Classic · last team alive" : family[0].toUpperCase() + family.slice(1)}">${characters.filter((character) => character.family === family).map((character) => `<option value="${escapeHtml(character.id)}">${escapeHtml(character.name)}</option>`).join("")}</optgroup>`).join("");
    for (const id of ["studyLeft", "studyRight"]) { $(id).innerHTML = options; $(id).disabled = false; }
    $("studyHealth").max = String(stops.length - 1); $("studyHealth").disabled = false;
    $("studyCourse").insertAdjacentHTML("beforeend", COURSES.map((course) => `<option value="${course.id}">${escapeHtml(course.name)}</option>`).join(""));
    $("studyShare").disabled = false;
    renderReading();
    if (["roster", "courses"].includes(params.get("tab"))) setTab(params.get("tab"));
} catch (error) {
    $("studyReading").textContent = error.message || "The course study could not load. Reload to try again.";
}
