import { createSimulation, stepSimulation, SeededRandom, observeSimulationEvents } from "./simulation.js?v=20261112-battle-lab-engine4";
import { LAB_ENGINE_VERSION, LAB_MAX_SECONDS, LAB_STEP, labSimulationSettings, validateLabChallenge } from "./battle-lab-model.js?v=20261112-battle-lab4";

export const LAB_CHECKPOINT_STEPS = 480;
const MAX_STEPS = LAB_MAX_SECONDS / LAB_STEP;

function hashText(text, initial = 2166136261) {
    let hash = initial;
    for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619) >>> 0;
    return hash;
}

function hex(value) {
    return (value >>> 0).toString(16).padStart(8, "0");
}

// The snapshot is structured-cloneable, including Sets and their fighter aliases.
// Only SeededRandom has a prototype that must be restored before further steps.
export function cloneLabSimulation(sim) {
    const clone = structuredClone(sim);
    clone.rng = Object.assign(new SeededRandom(1), { state: sim.rng.state });
    return clone;
}

export function createLabReplay(challenge) {
    const normalized = validateLabChallenge(challenge);
    const sim = createSimulation(labSimulationSettings(normalized));
    const session = {
        challenge: normalized, sim, step: 0, checkpoints: [{ step: 0, sim: cloneLabSimulation(sim) }],
        events: [], pendingEvents: [...sim.events], lastEventId: -1, eventHash: 2166136261, complete: false, playhead: null,
    };
    session.unobserve = observeSimulationEvents(sim, (event) => session.pendingEvents.push(event));
    return session;
}

export function advanceLabReplay(session, budget = 240) {
    if (session.complete) return true;
    const stop = Math.min(MAX_STEPS, session.step + Math.max(1, Math.floor(budget)));
    while (session.step < stop && !session.sim.finished) {
        stepSimulation(session.sim, LAB_STEP);
        session.step += 1;
        for (const event of session.pendingEvents) {
            if (event.id <= session.lastEventId) continue;
            session.lastEventId = event.id;
            session.eventHash = hashText(JSON.stringify(event), session.eventHash);
            session.events.push({ ...event, step: session.step });
        }
        session.pendingEvents = [];
        if (session.step % LAB_CHECKPOINT_STEPS === 0) {
            session.checkpoints.push({ step: session.step, sim: cloneLabSimulation(session.sim) });
        }
    }
    session.complete = session.sim.finished || session.step >= MAX_STEPS;
    if (session.complete) { session.unobserve(); session.unobserve = null; }
    return session.complete;
}

export function labReplayProof(session) {
    if (!session.complete) throw new Error("Prepare the complete replay before verifying it.");
    const sim = cloneLabSimulation(session.sim);
    // The event stream is hashed separately; replay caches and timing samples
    // are implementation details and are not a semantic part of the proof.
    delete sim.events;
    delete sim.replayFrames;
    const stateHash = hex(hashText(JSON.stringify(sim)));
    return { engine: LAB_ENGINE_VERSION, stateHash, eventHash: hex(session.eventHash), steps: session.step };
}

export function labReplaySummary(session) {
    if (!session.complete) throw new Error("The replay is still preparing.");
    return {
        duration: session.step * LAB_STEP, steps: session.step,
        status: session.sim.finished ? session.sim.classicDraw ? "draw" : "finished" : "time-limit",
        winnerId: session.sim.winner?.id ?? null, winnerType: session.sim.winner?.type ?? null,
        health: session.sim.fighters.slice(0, 2).map((fighter) => fighter.health),
        eventCount: session.events.length, checkpointCount: session.checkpoints.length,
        proof: labReplayProof(session),
    };
}

export function seekLabReplay(session, requestedStep) {
    if (!session.complete) throw new Error("Prepare the replay before seeking.");
    const numeric = Number(requestedStep);
    const step = Math.max(0, Math.min(session.step, Number.isFinite(numeric) ? Math.round(numeric) : 0));
    let base = session.playhead;
    if (!base || base.step > step || step - base.step > LAB_CHECKPOINT_STEPS) {
        base = session.checkpoints[Math.floor(step / LAB_CHECKPOINT_STEPS)];
    }
    const sim = cloneLabSimulation(base.sim);
    for (let index = base.step; index < step; index += 1) stepSimulation(sim, LAB_STEP);
    session.playhead = { step, sim };
    return { step, sim };
}

export function labEventDetail(event) {
    const cue = event.cue || event.move || event.reason || event.phase || event.type;
    const name = String(cue).replace(/^classic-/, "").replace(/[-_]+/g, " ");
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export function labEventCategory(event) {
    if (event.type === "victory" || event.type === "knockout" || event.type === "classic-draw") return "result";
    if (event.amount > 0) return "damage";
    if (/dodge|evade|guard|block/.test(event.cue || event.phase || "")) return "defense";
    if (event.type === "classic-showcase-cue" && ["tell", "release", "return", "warp", "reform", "bank"].includes(event.phase)) return "ability";
    if (event.type === "classic-power-cue" && ["charge", "release", "evade", "guard"].includes(event.phase)) return "ability";
    if (event.type === "classic-pulse-cue" && !/hit|tick|swing|windup|wall/.test(event.cue || "")) return "ability";
    return "other";
}
