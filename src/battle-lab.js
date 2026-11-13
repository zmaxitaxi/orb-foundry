import { ArenaRenderer, drawClassicPulseOutsideArena } from "./renderer.js?v=20261112-battle-lab-engine4";
import { createSimulation, getWeaponSegment, classicSaberBlade } from "./simulation.js?v=20261112-battle-lab-engine4";
import { CLASSIC_ORBS, CLASSIC_ORB_IDS } from "./classic-orbs.js?v=20261112-battle-lab-engine4";
import { classicOrbOptionDefaults } from "./config.js?v=20261112-battle-lab-engine4";
import { buildAbilityHud } from "./social.js?v=20261112-battle-lab-engine4";
import { CombatAudio } from "./audio.js?v=20261112-battle-lab-engine4";
import {
    LAB_ENGINE_VERSION, LAB_SCHEMA_VERSION, LAB_PRESETS, LAB_STEP,
    createLabChallenge, labSimulationSettings, labFighterName,
    labChallengeToUrl, labChallengeFromUrl, labRecorderUrl, parseLabImport,
    readLabLibrary, saveLabChallenge,
} from "./battle-lab-model.js?v=20261112-battle-lab4";
import { labEventCategory, labEventDetail } from "./battle-lab-replay.js?v=20261112-battle-lab4";
import { createUiSpring } from "./ui-spring.js?v=20261112-battle-lab4";

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const renderer = new ArenaRenderer($("labCanvas"), {
    simpleOrbs: true, flatOrbs: true, orbHealthNumbers: true, blankFloor: true,
    simpleWalls: true, arenaBorder: true, pixelWeapons: true, motionTrails: false,
    classicBlackTheme: true, classicTeamColors: false, reducedMotion, flashReduction: reducedMotion,
});
const overlay = $("labOverlay").getContext("2d");
const audio = new CombatAudio({ announcerManifest: {} });
audio.setEnabled(false);
const view = { hitboxes: false, vectors: false, effects: true, sound: false };
let challenge = createLabChallenge(LAB_PRESETS[0]);
let draft = { left: challenge.left, right: challenge.right };
let state = createSimulation(labSimulationSettings(challenge));
let worker = null;
let summary = null;
let events = [];
let meaningfulEvents = [];
let currentStep = 0;
let desiredStep = 0;
let framePending = false;
let playing = false;
let playbackSpeed = 1;
let lastTime = 0;
let requestId = 0;
let filter = "all";
let selectedTab = "challenge";
let pickerSide = "left";
let toastTimer = 0;
let dirty = false;
let verifying = false;
let importedProof = null;
let builtAt = 0;
let preparationMs = 0;
let verified = null;
let seekWaiters = [];
let returnFocus = null;
let latestEventId = null;
let arenaPadding = 128;
let arenaViewSize = 976;
const tabSpring = createUiSpring((position) => { $("tabIndicator").style.transform = `translateX(${position * 100}%)`; }, { reducedMotion });
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

function formatTime(seconds) {
    const safe = Math.max(0, Number(seconds) || 0);
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${(safe % 60).toFixed(2).padStart(5, "0")}`;
}

function toast(message) {
    clearTimeout(toastTimer);
    $("labToast").textContent = message;
    $("labToast").hidden = false;
    toastTimer = setTimeout(() => { $("labToast").hidden = true; }, 3500);
}

function notice(message) {
    $("labNotice").textContent = message;
    $("labNotice").hidden = !message;
}

function openDialog(dialog) {
    setPlaying(false);
    returnFocus = document.activeElement.closest(".utility-menu")?.querySelector("summary") || document.activeElement;
    for (const menu of document.querySelectorAll(".utility-menu[open],.view-menu[open]")) menu.open = false;
    dialog.showModal();
}

for (const dialog of document.querySelectorAll("dialog")) {
    dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => returnFocus?.focus({ preventScroll: true }));
    dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
}

function setTab(tab, focus = false) {
    selectedTab = tab;
    for (const name of ["challenge", "inspect"]) {
        const active = name === tab;
        $(name + "Tab").setAttribute("aria-selected", String(active));
        $(name + "Tab").tabIndex = active ? 0 : -1;
        $(name + "Panel").hidden = !active;
    }
    tabSpring.to(tab === "inspect" ? 1 : 0);
    for (const control of document.querySelectorAll("[data-replay-only]")) control.hidden = tab !== "inspect";
    if (focus) $(tab + "Tab").focus();
    if (tab === "inspect") renderInspector();
}

for (const tab of ["challenge", "inspect"]) {
    $(tab + "Tab").addEventListener("click", () => setTab(tab));
    $(tab + "Tab").addEventListener("keydown", (event) => {
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            setTab(event.key === "Home" ? "challenge" : event.key === "End" ? "inspect" : tab === "challenge" ? "inspect" : "challenge", true);
        }
    });
}

function updateDraftFighter(side) {
    const id = draft[side];
    $(side + "FighterName").textContent = labFighterName(id);
    const avatar = $(side + "FighterAvatar");
    avatar.style.setProperty("--fighter-color", CLASSIC_ORBS[id].color);
    avatar.textContent = labFighterName(id).split(/\s/).map((word) => word[0]).slice(0, 2).join("");
    $(side + "FighterButton").setAttribute("aria-label", `Choose ${side === "left" ? "first" : "second"} fighter, currently ${labFighterName(id)}`);
}

function fillForm(value) {
    draft = { left: value.left, right: value.right };
    $("challengeTitle").value = value.title;
    $("challengeSeed").value = value.seed;
    $("leftHealth").value = value.health[0];
    $("rightHealth").value = value.health[1];
    document.querySelector(`input[name="arenaShape"][value="${value.arenaShape}"]`).checked = true;
    updateDraftFighter("left");
    updateDraftFighter("right");
    $("formError").hidden = true;
    $("sampleList").value = "";
    setDirty(false);
}

function formChallenge() {
    return createLabChallenge({
        ...draft, title: $("challengeTitle").value, seed: $("challengeSeed").value,
        health: [$("leftHealth").value, $("rightHealth").value],
        arenaShape: document.querySelector('input[name="arenaShape"]:checked').value,
    });
}

function setDirty(value) {
    dirty = value;
    $("formNote").textContent = "Unapplied changes";
    $("formNote").hidden = !value;
    $("formNote").dataset.dirty = String(value);
    $("shareButton").disabled = !summary || value;
    $("saveButton").disabled = !summary || value;
}

$("challengeForm").addEventListener("input", () => {
    try {
        const next = formChallenge();
        setDirty(JSON.stringify(next) !== JSON.stringify(challenge));
        $("formError").hidden = true;
    } catch (error) {
        setDirty(true);
        $("formError").textContent = error.message;
        $("formError").hidden = false;
    }
});
$("challengeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    try { importedProof = null; notice(""); buildChallenge(formChallenge(), { autoplay: true }); }
    catch (error) { $("formError").textContent = error.message; $("formError").hidden = false; }
});
$("randomSeedButton").addEventListener("click", () => {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    $("challengeSeed").value = buffer[0] || 1;
    $("challengeSeed").dispatchEvent(new Event("input", { bubbles: true }));
});

function renderRoster() {
    const search = $("fighterSearch").value.toLowerCase().trim();
    const ids = CLASSIC_ORB_IDS.filter((id) => `${labFighterName(id)} ${CLASSIC_ORBS[id].power}`.toLowerCase().includes(search));
    $("fighterGrid").innerHTML = ids.map((id) => `<button type="button" class="roster-option" data-fighter="${id}" aria-pressed="${draft[pickerSide] === id}"><span class="fighter-avatar" style="--fighter-color:${CLASSIC_ORBS[id].color}">${escapeHtml(labFighterName(id).split(/\s/).map((word) => word[0]).slice(0, 2).join(""))}</span><span><strong>${escapeHtml(labFighterName(id))}</strong><small>${escapeHtml(CLASSIC_ORBS[id].power)}</small></span></button>`).join("");
    $("fighterSearchCount").textContent = ids.length ? `${ids.length} of ${CLASSIC_ORB_IDS.length} fighters` : "No fighters match that search.";
}
for (const side of ["left", "right"]) $(side + "FighterButton").addEventListener("click", () => {
    pickerSide = side;
    $("fighterSearch").value = "";
    renderRoster();
    openDialog($("fighterDialog"));
    $("fighterSearch").focus();
});
$("fighterSearch").addEventListener("input", renderRoster);
$("fighterGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-fighter]");
    if (!button) return;
    const currentName = `${labFighterName(draft.left)} vs ${labFighterName(draft.right)}`;
    const presetName = LAB_PRESETS.find((item) => item.left === draft.left && item.right === draft.right)?.title;
    const rename = [$("challengeTitle").value === currentName, $("challengeTitle").value === presetName].some(Boolean);
    draft[pickerSide] = button.dataset.fighter;
    if (rename) $("challengeTitle").value = `${labFighterName(draft.left)} vs ${labFighterName(draft.right)}`;
    $(pickerSide + "Health").value = classicOrbOptionDefaults(button.dataset.fighter).health;
    updateDraftFighter(pickerSide);
    setDirty(true);
    $("fighterDialog").close();
});
$("sampleList").innerHTML = '<option value="" selected disabled>Choose a matchup</option>' + LAB_PRESETS.map((preset) => `<option value="${preset.id}">${escapeHtml(preset.title)}</option>`).join("");
$("sampleList").addEventListener("change", (event) => {
    const preset = LAB_PRESETS.find((item) => item.id === event.target.value);
    if (preset) { notice(""); importedProof = null; buildChallenge(createLabChallenge(preset), { autoplay: true }); }
});

function setPlaying(value) {
    playing = Boolean(value && summary && desiredStep < summary.steps);
    lastTime = 0;
    $("playButton").innerHTML = icon(playing ? "pause" : "play");
    $("playButton").setAttribute("aria-label", playing ? "Pause replay" : "Play replay");
    $("statusDot").dataset.status = summary ? playing ? "playing" : "paused" : "loading";
}

function requestFrame() {
    if (!worker || !summary || framePending) return;
    const step = Math.max(0, Math.min(summary.steps, Math.round(desiredStep)));
    if (step === currentStep) { resolveSeekWaiters(); return; }
    framePending = true;
    worker.postMessage({ type: "seek", id: ++requestId, step });
}

function resolveSeekWaiters() {
    seekWaiters = seekWaiters.filter((waiter) => {
        if (currentStep === waiter.step || currentStep === summary?.steps) { waiter.resolve(); return false; }
        return true;
    });
}

function seekTo(step) {
    setPlaying(false);
    desiredStep = Math.max(0, Math.min(summary?.steps || 0, Math.round(step)));
    audio.reset();
    updateTransport(desiredStep);
    requestFrame();
}

function buildChallenge(value, { autoplay = false, updateUrl = true } = {}) {
    challenge = createLabChallenge(value);
    fillForm(challenge);
    setPlaying(false);
    worker?.terminate();
    for (const waiter of seekWaiters) waiter.resolve();
    seekWaiters = [];
    summary = null;
    events = [];
    meaningfulEvents = [];
    currentStep = 0;
    desiredStep = 0;
    framePending = false;
    verified = null;
    verifying = false;
    latestEventId = null;
    audio.reset();
    $("playButton").disabled = true;
    $("shareButton").disabled = true;
    $("saveButton").disabled = true;
    $("verifyButton").disabled = true;
    $("replayScrubber").disabled = true;
    $("arenaResult").hidden = true;
    $("arenaStatus").textContent = "Preparing replay…";
    $("arenaStatus").dataset.status = "loading";
    $("statusDot").dataset.status = "loading";
    $("battleTitle").textContent = challenge.title;
    $("arenaShapeLabel").textContent = challenge.arenaShape === "circle" ? "Circle" : "Square";
    $("recordChallengeLink").href = labRecorderUrl(challenge, location.href).href;
    const fighters = [challenge.left, challenge.right];
    arenaPadding = fighters.includes("ben-10") ? 260
        : fighters.some((id) => ["wdc", "luke-skywalker", "darth-vader", "kratos"].includes(id)) ? 180 : 128;
    arenaViewSize = 720 + arenaPadding * 2;
    for (const canvas of [$("labCanvas"), $("labOverlay")]) { canvas.width = arenaViewSize; canvas.height = arenaViewSize; }
    renderer.ctx.imageSmoothingEnabled = false;
    state = createSimulation(labSimulationSettings(challenge));
    renderState();
    renderProof();
    if (updateUrl) history.replaceState(null, "", labChallengeToUrl(challenge, location.href));
    const currentWorker = new Worker(new URL("./battle-lab-worker.js?v=20261112-battle-lab4", import.meta.url), { type: "module" });
    worker = currentWorker;
    builtAt = performance.now();
    currentWorker.addEventListener("message", ({ data }) => {
        if (worker !== currentWorker) return;
        if (data.type === "progress") {
            if (!summary) $("arenaStatus").textContent = `Preparing replay · ${Math.floor(data.seconds)}s simulated`;
        } else if (data.type === "ready") {
            summary = data.summary;
            events = data.events;
            meaningfulEvents = events.filter((event) => labEventCategory(event) !== "other");
            state = data.sim;
            preparationMs = Math.round(performance.now() - builtAt);
            currentStep = data.step;
            $("playButton").disabled = false;
            $("verifyButton").disabled = false;
            $("replayScrubber").disabled = false;
            $("replayScrubber").max = summary.steps;
            $("durationTime").textContent = formatTime(summary.duration);
            $("timelineEnd").textContent = formatTime(summary.duration);
            $("arenaStatus").dataset.status = "ready";
            try { setDirty(JSON.stringify(formChallenge()) !== JSON.stringify(challenge)); }
            catch { setDirty(true); }
            if (importedProof) {
                verified = importedProof.stateHash === summary.proof.stateHash && importedProof.eventHash === summary.proof.eventHash;
                if (!verified) notice("The imported replay does not match this simulation. Its fingerprints differ; inspect the inputs or use a new challenge.");
            }
            renderTimeline();
            renderEvents();
            renderState();
            renderProof();
            resolveSeekWaiters();
            setPlaying(autoplay && !reducedMotion);
        } else if (data.type === "frame") {
            const oldStep = currentStep;
            state = data.sim;
            currentStep = data.step;
            framePending = false;
            if (playing && view.sound && currentStep >= oldStep && currentStep - oldStep < 60) audio.consume(state.events);
            renderState();
            resolveSeekWaiters();
            if (currentStep >= summary.steps) setPlaying(false);
            requestFrame();
        } else if (data.type === "verified") {
            verified = data.matched;
            verifying = false;
            $("verifyButton").disabled = false;
            renderProof();
            toast(data.matched ? "Verified. Same state. Same events." : "Replay fingerprints differ.");
        } else if (data.type === "error") {
            framePending = false;
            setPlaying(false);
            verifying = false;
            renderProof();
            $("verifyButton").disabled = !summary;
            $("arenaStatus").textContent = "Replay unavailable";
            $("arenaStatus").dataset.status = "error";
            notice(data.message);
        }
    });
    currentWorker.addEventListener("error", () => {
        setPlaying(false);
        notice("The replay worker could not start. Open this page through a local or hosted HTTP server and try a sample again.");
    });
    currentWorker.postMessage({ type: "build", id: ++requestId, challenge });
}

function updateTransport(step = currentStep) {
    const ratio = summary?.steps ? step / summary.steps : 0;
    $("replayScrubber").value = Math.round(step);
    $("replayScrubber").style.setProperty("--progress", `${ratio * 100}%`);
    $("replayScrubber").setAttribute("aria-valuetext", `${formatTime(step * LAB_STEP)} of ${formatTime(summary?.duration)}`);
    $("playheadTime").textContent = formatTime(step * LAB_STEP);
    $("stepLabel").textContent = `Step ${Math.round(step).toLocaleString()}`;
}

function renderState() {
    const drawn = view.effects ? state : {
        ...state, effects: [], fighters: state.fighters.map((fighter) => ({ ...fighter, trail: [] })),
    };
    renderer.setOptions({ motionTrails: view.effects, reducedMotion, flashReduction: reducedMotion });
    const context = renderer.ctx;
    context.save();
    context.clearRect(0, 0, arenaViewSize, arenaViewSize);
    context.fillStyle = "#070708";
    context.fillRect(0, 0, arenaViewSize, arenaViewSize);
    context.translate(arenaPadding, arenaPadding);
    renderer.draw(drawn);
    drawClassicPulseOutsideArena(context, drawn, { ...renderer.options, spaceAbove: arenaPadding, titleY: -1000 });
    context.restore();
    renderOverlay();
    $("fighterDock").innerHTML = state.fighters.slice(0, 2).map((fighter) => {
        const hud = buildAbilityHud(fighter, state.time, state.classicEntities);
        const dash = state.time < (fighter.classicDashUntil || 0);
        const label = dash ? fighter.classicDashMove?.kind === "lunge" ? "Lunge" : "Dodge" : hud.label;
        return `<div class="fighter-readout" style="--fighter-color:${CLASSIC_ORBS[fighter.type].color};--health:${Math.max(0, fighter.health / fighter.maxHealth * 100)}%"><div><strong>${escapeHtml(labFighterName(fighter.type))}</strong><small>${Math.ceil(fighter.health)} / ${fighter.maxHealth} HP</small></div><span class="fighter-health"><i></i></span><span class="fighter-ability">${escapeHtml(label)} · ${fighter.classicDashCharges > 0 ? "dash ready" : "dash spent"}</span></div>`;
    }).join("");
    updateTransport();
    const end = summary && currentStep >= summary.steps;
    $("arenaResult").hidden = !end;
    if (end) {
        $("resultEyebrow").textContent = summary.status === "time-limit" ? "90-second observation limit" : "Challenge complete";
        $("resultTitle").textContent = summary.status === "time-limit" ? "Still standing." : summary.winnerType ? `${labFighterName(summary.winnerType)} wins.` : "An even match.";
    }
    if (selectedTab === "inspect") renderInspector();
}

function renderOverlay() {
    overlay.clearRect(0, 0, arenaViewSize, arenaViewSize);
    if (!view.hitboxes && !view.vectors) return;
    overlay.save();
    overlay.translate(arenaPadding, arenaPadding);
    overlay.lineWidth = 1.8;
    for (const fighter of state.fighters) {
        if (!fighter.alive || fighter.classicWdcReserve || fighter.classicCannonOutside) continue;
        const color = "#64e1c4";
        overlay.strokeStyle = color;
        if (view.hitboxes) {
            overlay.setLineDash([5, 4]);
            overlay.beginPath();
            overlay.arc(fighter.x, fighter.y, fighter.radius, 0, Math.PI * 2);
            overlay.stroke();
            overlay.setLineDash([]);
            const saber = ["luke-skywalker", "darth-vader"].includes(fighter.type);
            const segment = saber ? classicSaberBlade(fighter, state.time) : fighter.weapon?.damage > 0 ? getWeaponSegment(fighter) : null;
            if (segment) drawGeometry(segment, "#ffbf7b");
            for (const shape of fighter.classicShowcase?.move?.pose || fighter.classicPowerMove?.pose || []) {
                if (shape.live === false || shape.active === false) continue;
                drawGeometry(shape, "#ffbf7b");
            }
        }
        if (view.vectors) {
            const dx = fighter.vx * .13;
            const dy = fighter.vy * .13;
            const angle = Math.atan2(dy, dx);
            const tip = { x: fighter.x + dx, y: fighter.y + dy };
            overlay.strokeStyle = "#74b8ff";
            overlay.beginPath();
            overlay.moveTo(fighter.x, fighter.y);
            overlay.lineTo(tip.x, tip.y);
            for (const side of [-1, 1]) {
                overlay.moveTo(tip.x, tip.y);
                overlay.lineTo(tip.x - Math.cos(angle + side * .5) * 10, tip.y - Math.sin(angle + side * .5) * 10);
            }
            overlay.stroke();
        }
    }
    overlay.restore();
}

function drawGeometry(shape, color) {
    overlay.save();
    overlay.strokeStyle = color;
    overlay.setLineDash([4, 4]);
    if ([shape.x1, shape.y1, shape.x2, shape.y2].every(Number.isFinite)) {
        overlay.lineWidth = Math.max(1, shape.width || 1);
        overlay.lineCap = "round";
        overlay.globalAlpha = .5;
        overlay.beginPath();
        overlay.moveTo(shape.x1, shape.y1);
        overlay.lineTo(shape.x2, shape.y2);
        overlay.stroke();
    } else if ([shape.x, shape.y, shape.radius].every(Number.isFinite)) {
        overlay.beginPath();
        overlay.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        overlay.stroke();
    }
    overlay.restore();
}

function renderInspector() {
    $("inspectionStats").innerHTML = state.fighters.slice(0, 2).map((fighter) => `<div class="inspect-fighter" style="--fighter-color:${CLASSIC_ORBS[fighter.type].color}"><strong>${escapeHtml(labFighterName(fighter.type))}</strong><dl><div><dt>Health</dt><dd>${Math.ceil(fighter.health)} HP</dd></div><div><dt>Dash</dt><dd>${fighter.classicDashCharges > 0 ? "Ready" : "Spent"}</dd></div><div><dt>Position</dt><dd>${Math.round(fighter.x)}, ${Math.round(fighter.y)}</dd></div><div><dt>Speed</dt><dd>${Math.round(Math.hypot(fighter.vx, fighter.vy))} px/s</dd></div></dl></div>`).join("");
    const event = meaningfulEvents.findLast((item) => item.step <= currentStep && (filter === "all"
        || labEventCategory(item) === filter || filter === "moves" && ["ability", "defense"].includes(labEventCategory(item))));
    if (event?.id !== latestEventId) {
        latestEventId = event?.id;
        for (const row of $("eventList").querySelectorAll(".is-current")) row.classList.remove("is-current");
        const row = $("eventList").querySelector(`[data-event-id="${event?.id}"]`);
        if (row) {
            row.classList.add("is-current");
            if (playing) $("eventList").scrollTop = row.offsetTop - $("eventList").offsetTop - 100;
        }
        $("selectedEvent").hidden = !event;
        if (event) {
            const source = event.sourceType || event.fighterType;
            const target = event.targetType;
            $("eventExplanation").textContent = event.amount > 0 && source
                ? `${labFighterName(source)}${target ? " → " + labFighterName(target) : ""} · ${Number(event.amount.toFixed(1))} damage · ${event.time.toFixed(2)}s`
                : `${source ? labFighterName(source) + " · " : ""}${labEventDetail(event)} · ${event.time.toFixed(2)}s`;
            $("eventData").textContent = JSON.stringify(event, null, 2);
        }
    }
}

function renderEvents() {
    const selected = meaningfulEvents.filter((event) => filter === "all" || labEventCategory(event) === filter
        || filter === "moves" && ["ability", "defense"].includes(labEventCategory(event)));
    $("eventCount").textContent = `${selected.length} events`;
    $("eventList").innerHTML = selected.length ? selected.map((event) => `<button type="button" class="event-row" data-event-id="${event.id}" data-step="${event.step}" aria-label="Inspect ${escapeHtml(labEventDetail(event))} at ${formatTime(event.time)}"><span class="event-time">${event.time.toFixed(2)}s</span><i class="event-kind" data-kind="${labEventCategory(event)}"></i><span class="event-name">${escapeHtml(labEventDetail(event))}</span>${event.amount > 0 ? `<span class="event-amount">−${Number(event.amount.toFixed(1))}</span>` : ""}</button>`).join("") : '<p class="event-empty">No events in this filter.</p>';
    latestEventId = null;
    renderInspector();
}

function renderTimeline() {
    const bins = Array(100).fill(0);
    for (const event of events) if (event.amount > 0) bins[Math.min(99, Math.floor(event.step / summary.steps * 100))] += event.amount;
    const maximum = Math.max(1, ...bins);
    $("activityGraph").innerHTML = bins.map((amount, index) => `<rect x="${index * 6}" y="${30 - amount / maximum * 27}" width="3.5" height="${Math.max(0, amount / maximum * 27)}" rx="1"/>`).join("");
}

function renderProof() {
    $("proofDot").dataset.verified = verified === null ? "" : String(verified);
    $("proofStatus").textContent = verifying ? "Verifying…" : verified === true ? "Verified" : verified === false ? "Mismatch" : "Not verified";
    $("proofDetail").textContent = verifying ? "Running a fresh simulation with the same inputs." : verified === true ? "A fresh run produced the same state and event fingerprints." : verified === false ? "The expected fingerprints do not match this engine's result." : "Run the simulation again and compare its state and event fingerprints.";
    $("proofHash").textContent = summary ? `${LAB_ENGINE_VERSION} · ${summary.proof.stateHash} / ${summary.proof.eventHash}` : "";
}

$("playButton").addEventListener("click", () => {
    if (summary && currentStep >= summary.steps) { desiredStep = 0; requestFrame(); setPlaying(true); }
    else setPlaying(!playing);
});
$("restartButton").addEventListener("click", () => seekTo(0));
$("previousFrameButton").addEventListener("click", () => seekTo(Math.round(desiredStep) - 1));
$("nextFrameButton").addEventListener("click", () => seekTo(Math.round(desiredStep) + 1));
$("replayScrubber").addEventListener("input", (event) => seekTo(Number(event.target.value)));
$("playbackSpeed").addEventListener("change", (event) => { playbackSpeed = Number(event.target.value); lastTime = 0; });
$("eventList").addEventListener("click", (event) => { const target = event.target.closest("[data-step]"); if (target) seekTo(Number(target.dataset.step)); });
for (const button of document.querySelectorAll("[data-filter]")) button.addEventListener("click", () => {
    filter = button.dataset.filter;
    for (const entry of document.querySelectorAll("[data-filter]")) entry.setAttribute("aria-pressed", String(entry === button));
    renderEvents();
});

for (const [key, id] of [["hitboxes", "hitboxButton"], ["vectors", "vectorButton"], ["effects", "effectsButton"], ["sound", "audioButton"]]) {
    $(id).addEventListener("click", async () => {
        view[key] = !view[key];
        $(id).setAttribute("aria-pressed", String(view[key]));
        if (key === "sound") {
            audio.setEnabled(view.sound);
            if (view.sound) {
                try { await audio.unlock(); audio.lastEventId = state.nextEventId - 1; }
                catch { view.sound = false; audio.setEnabled(false); $(id).setAttribute("aria-pressed", "false"); toast("Sound is unavailable in this browser."); }
            }
        }
        renderState();
    });
}
$("verifyButton").addEventListener("click", () => {
    if (!summary || verifying) return;
    verifying = true;
    $("verifyButton").disabled = true;
    renderProof();
    worker.postMessage({ type: "verify", id: ++requestId });
});

$("shareButton").addEventListener("click", () => {
    $("shareUrlInput").value = labChallengeToUrl(challenge, location.href).href;
    $("shareFeedback").textContent = "";
    $("copyChallengeButton").innerHTML = icon("share") + "Copy link";
    openDialog($("shareDialog"));
});
$("copyChallengeButton").addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText($("shareUrlInput").value);
        $("shareFeedback").textContent = "Link copied.";
        $("copyChallengeButton").innerHTML = icon("check") + "Copied";
    } catch {
        $("shareUrlInput").focus();
        $("shareUrlInput").select();
        $("shareFeedback").textContent = "Select and copy the link above.";
    }
});
function downloadJson(value, suffix) {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement("a"), { href: url, download: `orb-foundry-${challenge.seed}-${suffix}.json` });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("downloadChallengeButton").addEventListener("click", () => downloadJson(challenge, "challenge"));
$("downloadReplayButton").addEventListener("click", () => {
    if (summary) downloadJson({ type: "orb-foundry-replay", version: LAB_SCHEMA_VERSION, challenge, proof: summary.proof, summary, events }, "replay");
});

$("saveButton").addEventListener("click", () => {
    try { saveLabChallenge(localStorage, challenge); toast("Challenge saved on this device."); }
    catch { toast("This browser cannot save locally. Export a challenge file instead."); }
});
function renderLibrary() {
    let items = [];
    try { items = readLabLibrary(localStorage); } catch { /* Private storage may be unavailable. */ }
    $("libraryList").innerHTML = items.length ? items.map((item, index) => `<button type="button" class="library-row" data-saved="${index}"><strong>${escapeHtml(item.challenge.title)}</strong><small>${escapeHtml(labFighterName(item.challenge.left))} vs ${escapeHtml(labFighterName(item.challenge.right))} · Seed ${item.challenge.seed} · ${item.challenge.arenaShape}</small></button>`).join("") : '<p class="library-empty">No saved challenges.</p>';
    return items;
}
$("libraryButton").addEventListener("click", () => { renderLibrary(); openDialog($("libraryDialog")); });
$("libraryList").addEventListener("click", (event) => {
    const selected = event.target.closest("[data-saved]");
    if (!selected) return;
    let item;
    try { item = readLabLibrary(localStorage)[Number(selected.dataset.saved)]; } catch { return; }
    if (item) { $("libraryDialog").close(); importedProof = null; notice(""); buildChallenge(item.challenge); }
});
$("importChallengeInput").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
        if (file.size > 2_000_000) throw new Error("Choose a JSON file smaller than 2 MB.");
        const imported = parseLabImport(await file.text());
        importedProof = imported.proof;
        $("libraryDialog").close();
        notice("");
        buildChallenge(imported.challenge);
        if (imported.proof) setTab("inspect");
    } catch (error) { toast(error.message); }
    event.target.value = "";
});

function showEngineering() {
    $("sessionFacts").innerHTML = summary ? `<span>${summary.steps.toLocaleString()} simulation steps</span><span>${summary.checkpointCount} checkpoints</span><span>${summary.eventCount.toLocaleString()} events</span><span>Prepared in ${preparationMs} ms on this device</span>` : "<span>Replay preparation is running in a worker.</span>";
    openDialog($("engineeringDialog"));
}
$("footerEngineeringButton").addEventListener("click", showEngineering);
$("importMenuButton").addEventListener("click", () => $("importChallengeInput").click());
document.addEventListener("click", (event) => {
    for (const menu of document.querySelectorAll(".utility-menu[open],.view-menu[open]")) {
        if (!menu.contains(event.target)) menu.open = false;
        else if (menu.matches(".utility-menu") && event.target.closest("button,a")) menu.open = false;
    }
});

document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || document.querySelector("dialog[open]")
        || event.target.closest("input, select, textarea, button, a, summary")) return;
    if (event.code === "Space") { event.preventDefault(); $("playButton").click(); }
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        seekTo(Math.round(desiredStep) + (event.key === "ArrowRight" ? 1 : -1) * (event.shiftKey ? 120 : 1));
    } else if (event.key.toLowerCase() === "h") $("hitboxButton").click();
    else if (event.key.toLowerCase() === "v") $("vectorButton").click();
});
document.addEventListener("visibilitychange", () => { if (document.hidden) setPlaying(false); });
window.addEventListener("pagehide", () => { worker?.terminate(); tabSpring.stop(); });

function animate(time) {
    if (playing && summary) {
        if (lastTime) desiredStep = Math.min(summary.steps, desiredStep + Math.min(0.1, (time - lastTime) / 1000) * playbackSpeed / LAB_STEP);
        requestFrame();
    }
    lastTime = time;
    requestAnimationFrame(animate);
}

window.__ORB_LAB__ = {
    getState: () => ({
        challenge: structuredClone(challenge), ready: Boolean(summary), playing, currentStep,
        time: currentStep * LAB_STEP, summary: summary && structuredClone(summary),
        view: { ...view }, verified, verifying, eventCount: events.length,
        viewport: { padding: arenaPadding, size: arenaViewSize },
        fighters: state.fighters.slice(0, 2).map(({ id, type, x, y, vx, vy, health, classicDashCharges }) => ({ id, type, x, y, vx, vy, health, classicDashCharges })),
    }),
    seek: (step) => seekTo(step),
    load: (value) => { importedProof = null; buildChallenge(value); },
};
window.render_game_to_text = () => JSON.stringify({
    screen: "battle-lab", coordinateSystem: "Arena origin is top-left; x increases right, y increases down. Units are simulation pixels.",
    ...window.__ORB_LAB__.getState(),
});
window.advanceTime = async (milliseconds) => {
    if (!summary) {
        await new Promise((resolve) => {
            const timer = setInterval(() => { if (summary) { clearInterval(timer); resolve(); } }, 10);
            setTimeout(() => { clearInterval(timer); resolve(); }, 15000);
        });
    }
    if (!summary) return;
    const next = Math.max(0, Math.min(summary.steps, currentStep + Math.round(milliseconds / 1000 / LAB_STEP)));
    if (next === currentStep) return;
    const completed = new Promise((resolve) => seekWaiters.push({ step: next, resolve }));
    seekTo(next);
    await completed;
};

let shared = false;
try {
    const incoming = labChallengeFromUrl(location.href);
    if (incoming) { challenge = incoming; shared = true; }
} catch (error) { notice(error.message); shared = true; }
buildChallenge(challenge, { autoplay: !shared, updateUrl: !$("labNotice").textContent });
requestAnimationFrame(animate);
