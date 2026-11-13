import { ArenaRenderer, drawClassicPulseOutsideArena } from "./renderer.js?v=20261112-battle-lab-engine4";
import { SocialBattleRenderer } from "./social-renderer.js?v=20261112-battle-lab-engine4";
import { createSimulation, stepSimulation } from "./simulation.js?v=20261112-battle-lab-engine4";
import { normalizeSettings } from "./config.js?v=20261112-battle-lab-engine4";
import { createLabChallenge, labSimulationSettings, LAB_STEP } from "./battle-lab-model.js?v=20261112-battle-lab4";
import { createUiSpring } from "./ui-spring.js?v=20261112-battle-lab4";

const canvas = document.querySelector("#homePreview");
if (canvas) {
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const context = canvas.getContext("2d");
    const stage = document.querySelector("#homeDemo");
    const settings = {
        classic: labSimulationSettings(createLabChallenge({ left: "luke-skywalker", right: "darth-vader", seed: 4 })),
        "orb-race": normalizeSettings({ gameplayMode: "orb-race", seed: 418,
            raceTeams: [["x-squared"], ["fibonacci"]], raceLayerCount: 3, raceLayerStrengths: [750, 1000, 1500],
            raceShowTargetMessage: false, features: { replay: false, introCards: false },
        }),
    };
    const classicCanvas = document.createElement("canvas");
    classicCanvas.width = classicCanvas.height = 1080;
    const classicRenderer = new ArenaRenderer(classicCanvas, {
        simpleOrbs: true, flatOrbs: true, orbHealthNumbers: true, blankFloor: true,
        simpleWalls: true, arenaBorder: true, pixelWeapons: true, motionTrails: true,
        classicBlackTheme: true, classicTeamColors: false, reducedMotion: reducedMotion.matches,
        flashReduction: true,
    });
    let raceRenderer = null;
    let mode = "classic";
    const sessions = new Map();
    function newSession(id) {
        const sim = createSimulation(settings[id]);
        const warmup = id === "orb-race" ? 480 : 180;
        for (let step = 0; step < warmup && !sim.finished; step += 1) stepSimulation(sim, LAB_STEP);
        const value = { sim, finishedTime: 0 };
        sessions.set(id, value);
        return value;
    }
    let session = newSession(mode);
    canvas.width = canvas.height = 1080;
    const spring = createUiSpring((position) => {
        document.querySelector("#homeModeIndicator").style.transform = `translateX(${position * 100}%)`;
    }, { reducedMotion: reducedMotion.matches, response: .29 });
    let inView = false;
    let frame = 0;
    let previousTime = 0;
    let accumulator = 0;
    function draw() {
        if (mode === "classic") {
            const ctx = classicRenderer.ctx;
            ctx.save(); ctx.fillStyle = "#070708"; ctx.fillRect(0, 0, 1080, 1080);
            ctx.translate(180, 180);
            classicRenderer.draw(session.sim);
            drawClassicPulseOutsideArena(ctx, session.sim, { ...classicRenderer.options, spaceAbove: 180, titleY: -1000 });
            ctx.restore();
            context.drawImage(classicCanvas, 0, 0);
        } else {
            raceRenderer.draw(session.sim, { now: session.sim.time * 1000, phase: "battle", options: {
                reducedMotion: reducedMotion.matches, flashReduction: true, screenShake: false,
            } });
            context.fillStyle = "#f7f0e5"; context.fillRect(0, 0, 1080, 1080);
            context.drawImage(raceRenderer.canvas, 32, 28, 1016, 960);
        }
    }
    function tick(time) {
        frame = 0;
        const active = inView && !document.hidden && !document.querySelector("#menuScreen").hidden;
        if (!active || reducedMotion.matches) { previousTime = 0; return; }
        if (previousTime) accumulator += Math.min(.08, (time - previousTime) / 1000);
        previousTime = time;
        while (accumulator >= LAB_STEP) {
            if (session.sim.finished) {
                session.finishedTime += LAB_STEP;
                if (session.finishedTime >= 2) session = newSession(mode);
            } else stepSimulation(session.sim, LAB_STEP);
            accumulator -= LAB_STEP;
        }
        draw(); frame = requestAnimationFrame(tick);
    }
    function resume() { if (!frame) frame = requestAnimationFrame(tick); }
    function chooseMode(next, focus = false) {
        if (!["classic", "orb-race"].includes(next)) return;
        mode = next;
        document.documentElement.dataset.homeMode = mode;
        stage.dataset.mode = mode;
        document.querySelector(".home-hero").dataset.mode = mode;
        if (mode === "orb-race" && !raceRenderer) raceRenderer = new SocialBattleRenderer(document.createElement("canvas"), { format: "square" });
        session = sessions.get(mode) || newSession(mode);
        previousTime = 0; accumulator = 0;
        for (const button of document.querySelectorAll("[data-home-mode]")) {
            const active = button.dataset.homeMode === mode;
            button.setAttribute("aria-selected", String(active)); button.tabIndex = active ? 0 : -1;
            if (active) { stage.setAttribute("aria-labelledby", button.id); if (focus) button.focus(); }
        }
        spring.to(mode === "orb-race" ? 1 : 0);
        const racer = mode === "orb-race";
        document.querySelector("#menuTitle").textContent = racer ? "Orb Racer." : "Orb Foundry.";
        document.querySelector("#homeModeDescription").textContent = racer ? "Break the layers. Race to the finish." : "Head-to-head fights. Every move has a counter.";
        const primary = document.querySelector("#menuBattleLabLink");
        primary.textContent = racer ? "Race studio" : "Open Battle Lab";
        primary.href = racer ? "./index.html?record=1&game=orb-race" : "./lab.html";
        document.querySelector("#menuPlayButton").textContent = racer ? "Course Study" : "Record a fight";
        document.querySelector("#homeDemoMatchup").textContent = racer ? "X² vs Fibonacci" : "Luke vs Vader";
        document.querySelector("#homeDemoCaption").textContent = racer ? "3 layers · Seed 418" : "Classic duel · Seed 4";
        canvas.setAttribute("aria-label", racer ? "Live muted Orb Racer: X Squared and Fibonacci race through three number walls in separate lanes" : "Live muted Classic battle between Luke Skywalker and Darth Vader");
        document.querySelector("#homeRoster").hidden = racer;
        document.querySelector("#homeRacerRosterLink").hidden = !racer;
        if (!reducedMotion.matches) {
            canvas.getAnimations().forEach((animation) => animation.cancel());
            canvas.animate([{ opacity: .45 }, { opacity: 1 }], { duration: 240, easing: "ease-out" });
        }
        document.dispatchEvent(new CustomEvent("orb-home-mode-change", { detail: { mode } }));
        draw(); resume();
    }
    if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
        stage.addEventListener("pointermove", (event) => {
            if (reducedMotion.matches) return;
            const box = stage.getBoundingClientRect();
            const x = (event.clientX - box.left) / box.width - .5;
            const y = (event.clientY - box.top) / box.height - .5;
            stage.style.setProperty("--preview-x", `${-y * 3}deg`);
            stage.style.setProperty("--preview-y", `${x * 3}deg`);
        });
        stage.addEventListener("pointerleave", () => {
            stage.style.setProperty("--preview-x", "0deg"); stage.style.setProperty("--preview-y", "0deg");
        });
    }
    for (const button of document.querySelectorAll("[data-home-mode]")) {
        button.addEventListener("click", () => chooseMode(button.dataset.homeMode));
        button.addEventListener("keydown", (event) => {
            if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                event.preventDefault(); chooseMode(event.key === "Home" ? "classic" : event.key === "End" ? "orb-race" : mode === "classic" ? "orb-race" : "classic", true);
            }
        });
    }
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) resume(); });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", resume);
    reducedMotion.addEventListener("change", () => { classicRenderer.setOptions({ reducedMotion: reducedMotion.matches }); draw(); resume(); });
    new MutationObserver(resume).observe(document.querySelector("#menuScreen"), { attributes: true, attributeFilter: ["hidden"] });
    chooseMode(new URL(location.href).searchParams.get("game") === "orb-race" ? "orb-race" : "classic");
    window.__ORB_HOME__ = { getState: () => ({ mode, time: session.sim.time, gameplayMode: session.sim.gameplayMode, teams: session.sim.raceTeams, inView }) };
}
