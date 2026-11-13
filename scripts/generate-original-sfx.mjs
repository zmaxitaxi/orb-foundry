import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ORIGINAL_SFX, ORIGINAL_SFX_VERSION, ORIGINAL_SFX_SAMPLE_RATE, renderOriginalSfx, encodeSfxWav } from "../src/original-sfx.js";

const output = new URL("../assets/audio/effects/original-v1/", import.meta.url);
await mkdir(output, { recursive: true });
const measurements = {};
for (const [id, design] of Object.entries(ORIGINAL_SFX)) {
    const samples = renderOriginalSfx(id);
    let peak = 0;
    let power = 0;
    for (const value of samples) { peak = Math.max(peak, Math.abs(value)); power += value * value; }
    await writeFile(new URL(`${id}.wav`, output), encodeSfxWav(samples));
    measurements[id] = { ...design, peak: Number(peak.toFixed(5)), rms: Number(Math.sqrt(power / samples.length).toFixed(5)) };
}
await writeFile(new URL("manifest.json", output), `${JSON.stringify({ version: ORIGINAL_SFX_VERSION, sampleRate: ORIGINAL_SFX_SAMPLE_RATE, method: "Original oscillator, resonator and seeded-noise synthesis. No recorded samples.", effects: measurements }, null, 2)}\n`);

// A short listening reel, with silence between each distinct material.
const reelIds = ["orb-collision", "weapon-clash", "classic-luke-swing", "classic-vader-throw", "classic-luke-evade", "classic-omnitrix-transform", "world-cup-card-use", "race-layer-break", "cinder-burn-tick", "black-hole-impact", "world-cup-ko"];
const gap = Math.round(ORIGINAL_SFX_SAMPLE_RATE * .22);
const clips = reelIds.map((id) => renderOriginalSfx(id));
const reel = new Float32Array(clips.reduce((length, clip) => length + clip.length + gap, gap));
let offset = gap;
for (const clip of clips) { reel.set(clip, offset); offset += clip.length + gap; }
await writeFile(new URL("listening-reel.wav", output), encodeSfxWav(reel));
console.log(`Generated ${Object.keys(measurements).length} original effects and a listening reel in ${fileURLToPath(output)}`);
