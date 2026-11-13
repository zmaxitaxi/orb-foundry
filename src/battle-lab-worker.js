import { createLabReplay, advanceLabReplay, seekLabReplay, labReplaySummary } from "./battle-lab-replay.js?v=20261112-battle-lab4";
import { LAB_MAX_SECONDS, LAB_STEP } from "./battle-lab-model.js?v=20261112-battle-lab4";

let session = null;
let generation = 0;
const yieldToMessages = () => new Promise((resolve) => setTimeout(resolve, 0));

self.addEventListener("message", async ({ data }) => {
    const { type, id } = data || {};
    try {
        if (type === "build" || type === "verify") {
            const current = ++generation;
            const next = createLabReplay(type === "build" ? data.challenge : session.challenge);
            while (!advanceLabReplay(next)) {
                if (current !== generation) return;
                if (next.step % 960 === 0) self.postMessage({ type: "progress", id, seconds: next.step * LAB_STEP, limit: LAB_MAX_SECONDS });
                await yieldToMessages();
            }
            if (current !== generation) return;
            const summary = labReplaySummary(next);
            if (type === "verify") {
                const expected = labReplaySummary(session).proof;
                self.postMessage({ type: "verified", id, proof: summary.proof,
                    matched: expected.stateHash === summary.proof.stateHash && expected.eventHash === summary.proof.eventHash });
            } else {
                session = next;
                self.postMessage({ type: "ready", id, summary, events: session.events, ...seekLabReplay(session, 0) });
            }
        } else if (type === "seek" && session) {
            self.postMessage({ type: "frame", id, ...seekLabReplay(session, data.step) });
        }
    } catch (error) {
        self.postMessage({ type: "error", id, message: error.message || "The replay could not be prepared." });
    }
});
