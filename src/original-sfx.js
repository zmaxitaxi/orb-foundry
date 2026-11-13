// Orb Foundry sound library. Every waveform is synthesized from oscillators,
// filtered seeded noise and resonant partials. No recorded audio is an input.
export const ORIGINAL_SFX_VERSION = "20261112-original2";
export const ORIGINAL_SFX_SAMPLE_RATE = 48000;

const spec = (family, duration, pitch = 1, weight = 1, variant = 0) => Object.freeze({ family, duration, pitch, weight, variant });
export const ORIGINAL_SFX = Object.freeze({
    "classic-luke-swing": spec("saber", .48, 1.32),
    "classic-luke-reverse": spec("saber", .43, 1.55, .92, 1),
    "classic-luke-vault": spec("dash", .46, 1.14, .92, 1),
    "classic-luke-lunge": spec("dash", .31, 1.25, 1.05),
    "classic-luke-evade": spec("dodge", .28, 1.38),
    "classic-vader-swing": spec("saber", .68, .66, 1.13),
    "classic-vader-throw": spec("saber", .89, .77, 1.02, 2),
    "classic-vader-return": spec("saber", .65, .95, .91, 1),
    "classic-omnitrix-dial": spec("dial", .64, 1),
    "classic-omnitrix-transform": spec("transform", 1.08, 1),
    "match-finale": spec("resolve", 3.47, 1, .8),
    "chrono-time-stop": spec("time", 1.25, 1),
    "weapon-hit": spec("metal", .38, 1.04, 1),
    "weapon-clash": spec("metal", .56, 1.57, .9, 1),
    "orb-collision": spec("impact", .19, 1.6, .78),
    "race-math-bounce": spec("chime", .33, 1.35, .68),
    "race-math-power": spec("transform", .9, .87, .82, 1),
    "race-vampire-bounce": spec("hiss", .35, .83, .8),
    "race-pancake-impact": spec("rubber", .26, .8),
    "race-monster-growl": spec("growl", 1.1, .8),
    "race-fairy-sparkle": spec("chime", .84, 1.67, .75, 2),
    "race-thunder": spec("thunder", 1.9, 1),
    "race-monster-footsteps": spec("impact", .37, .65, 1.05, 2),
    "race-godzilla-tail-smack": spec("impact", .6, .48, 1.1),
    "race-godzilla-beam-charge": spec("charge", 1.65, .7),
    "race-draft-rifle-fire": spec("shot", .37, .87, .9, 2),
    "race-draft-shotgun-fire": spec("shot", .53, .6, 1.08, 1),
    "race-draft-pistol-fire": spec("shot", .22, 1.26, .85),
    "race-layer-break": spec("fracture", .68, .88),
    "race-drill": spec("motor", .5, 1),
    "hydrogen-bomb-siren": spec("siren", 4, 1, .62),
    "hydrogen-bomb-explosion": spec("thunder", 5.5, .58, 1.12, 1),
    "hydrogen-bomb-ear-ringing": spec("ring", 4, 1, .24),
    "classic-trident-throw": spec("metal-air", .43, .97),
    "classic-trident-recall": spec("metal-air", .51, 1.2, .88, 1),
    "classic-boxer-punch": spec("impact", .28, .82, 1.12),
    "classic-vampire-hiss": spec("hiss", .43, 1.17),
    "classic-necromancer-summon": spec("portal", 1.05, .64),
    "classic-trapper-throw": spec("rope", .42, .78),
    "classic-trapper-caught": spec("rope", .25, 1.6, 1, 1),
    "classic-snowball-freeze": spec("crystal", .73, 1.3),
    "jackpot-slot-spinning": spec("dial", 1.03, 1.35, .88, 1),
    "jackpot-slot-lever": spec("metal", .31, .62, .8, 2),
    "forge-item-pickup": spec("chime", .62, 1.05, .8, 1),
    "france-world-cup-pickup": spec("chime", .51, 1.26, .85, 3),
    "norway-world-cup-action": spec("crystal", .58, .89),
    "usa-world-cup-action": spec("shot", .33, 1.13, .9, 1),
    "england-world-cup-action": spec("metal", .47, .88),
    "argentina-world-cup-action": spec("dash", .4, 1.1, .9, 2),
    "portugal-world-cup-pickup": spec("chime", .67, .93, .84, 2),
    "spain-world-cup-action": spec("fire", .67, 1.08),
    "world-cup-ko": spec("resolve", 1.28, 1, .91, 1),
    "world-cup-card-use": spec("paper", .31, .9),
    "cinder-burn-tick": spec("fire", .27, 1.4, .7),
    "critical-hit": spec("impact", .6, .51, 1.2, 1),
    "hex-magic-burst": spec("portal", .7, 1.25),
    "aegis-rush": spec("dash", .47, .78, 1.05),
    "meteor-horn": spec("horn", 1.65, .82),
    "meteor-strike": spec("thunder", 1.8, .8, 1.05, 2),
    "black-hole-impact": spec("gravity", 1.3, .68),
    "black-hole-teleport": spec("portal", 1.05, .84, 1, 1),
    "race-lag-glitch": spec("glitch", .68, 1),
});

export const ORIGINAL_SAMPLE_ASSETS = Object.freeze(Object.fromEntries(
    Object.keys(ORIGINAL_SFX).map((id) => [id, `original-v1/${id}.wav`]),
));

function hashString(value) {
    let hash = 2166136261;
    for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    return hash >>> 0;
}

const tau = Math.PI * 2;
const sine = (hz, time, phase = 0) => Math.sin(tau * hz * time + phase);
const sweep = (from, to, time, duration) => {
    const ratio = Math.log(to / from) / duration;
    return Math.sin(tau * (Math.abs(ratio) < 1e-8 ? from * time : from * Math.expm1(ratio * time) / ratio));
};

// Pure PCM renderer used by the checked-in asset generator and the sound tests.
export function renderOriginalSfx(id, sampleRate = ORIGINAL_SFX_SAMPLE_RATE) {
    const design = ORIGINAL_SFX[id];
    if (!design) throw new Error(`Unknown original effect: ${id}`);
    if (!Number.isInteger(sampleRate) || sampleRate < 8000 || sampleRate > 96000) throw new Error("Unsupported sample rate");
    const { family, duration, pitch: pitch, weight, variant } = design;
    const output = new Float32Array(Math.round(duration * sampleRate));
    let random = hashString(id) || 1;
    let low = 0;
    let body = 0;
    for (let i = 0; i < output.length; i += 1) {
        const t = i / sampleRate;
        const u = t / duration;
        random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
        const white = random / 0x80000000 - 1;
        low += .075 * (white - low);
        body += .012 * (white - body);
        const air = white - low;
        const decay = Math.exp(-t * 9 / duration);
        const swell = Math.sin(Math.PI * u) ** 1.3;
        const p = pitch;
        let value = 0;
        if (family === "siren") {
            // Integer carrier/modulator cycles over four seconds give a clean loop.
            value = .26 * Math.sin(tau * 240 * t + 27 * Math.sin(tau * .5 * t))
                + .06 * sine(480, t) * (.6 + .4 * Math.cos(tau * t));
        } else if (family === "impact" || family === "shot") {
            const sharp = family === "shot" ? 1.8 : 1;
            value = .62 * sweep(155 * p, 38 * p, t, duration) * Math.exp(-t * (16 + variant * 2))
                + .85 * low * Math.exp(-t * 24 / sharp) + .18 * air * Math.exp(-t * 95 / sharp);
            if (variant) value += .15 * sine(77 * p, t) * Math.exp(-t * 11);
        } else if (family === "metal" || family === "crystal" || family === "chime") {
            const base = (family === "metal" ? 570 : family === "crystal" ? 1020 : 660) * p;
            const ratios = family === "metal" ? [1, 1.47, 2.09, 3.73] : [1, 1.5, 2, 3];
            for (let k = 0; k < ratios.length; k += 1) {
                const delay = family === "chime" ? k * (.047 + variant * .009) : k * .003;
                if (t > delay) value += .23 / (k + 1) * sine(base * ratios[k], t - delay)
                    * Math.exp(-(t - delay) * (6 + k * 2) / duration);
            }
            value += .28 * air * Math.exp(-t * 95);
        } else if (family === "saber") {
            const motion = variant === 1 ? 1 - u : u;
            const carrier = 86 * p;
            const fm = Math.sin(tau * carrier * t + (2 + 3 * Math.sin(Math.PI * motion)) * sine(41 * p, t));
            const pulse = variant === 2 ? .62 + .38 * Math.cos(tau * 6 * t) : 1;
            value = (.31 * fm + .12 * sine(carrier * 2.006, t) + .7 * low + .09 * air) * swell * pulse;
        } else if (["dash", "dodge", "metal-air", "rope", "paper", "hiss"].includes(family)) {
            const dry = family === "paper" || family === "hiss";
            const envelope = family === "dodge" ? Math.sin(Math.PI * u) ** 2.5 : swell;
            value = ((dry ? .43 * air + .24 * low : .75 * low + .08 * air)
                + (dry ? .015 : .12) * sweep((variant === 1 ? 180 : 650) * p, (variant === 1 ? 800 : 95) * p, t, duration)) * envelope;
            if (family === "metal-air") value += .13 * sine(1150 * p, t) * swell * Math.exp(-u * 2);
            if (family === "rope" && variant) value += .7 * white * Math.exp(-t * 130);
            if (family === "paper") value *= .55 + .45 * sine(23 * p, t) ** 2;
        } else if (family === "thunder" || family === "fracture" || family === "fire") {
            const env = family === "fire" ? swell : Math.exp(-u * (family === "fracture" ? 7 : 5));
            value = (1.25 * body + .51 * low + .09 * air) * env;
            if (family !== "fire") value += .42 * sweep(93 * p, 26 * p, t, duration) * Math.exp(-t * 5);
            else value += .12 * low * Math.sin(tau * 37 * t) * swell;
            if (family === "fracture") value += .15 * air * Math.exp(-u * 9) * Math.sin(tau * 37 * p * t) ** 8;
        } else if (family === "dial" || family === "glitch") {
            const notes = family === "glitch" ? [820, 127, 1640, 230, 590, 87] : [430, 645, 860, 1290];
            const step = family === "glitch" ? .051 : .09 - variant * .014;
            const index = Math.floor(t / step);
            const local = t % step;
            value = (.25 * sine(notes[index % notes.length] * p, local)
                + .12 * air * Math.exp(-local * 130)) * Math.exp(-local * 55) * (1 - u * .6);
        } else if (family === "transform" || family === "charge" || family === "portal" || family === "time") {
            const up = family === "charge" || family === "transform";
            value = .21 * sweep((up ? 110 : 940) * p, (up ? 1300 : 75) * p, t, duration) * swell
                + .16 * sweep(280 * p, 680 * p, t, duration) * swell
                + .49 * low * swell;
            if (family === "transform" && u > .64) {
                const dt = t - duration * .64;
                value += .27 * sine(660 * p, dt) * Math.exp(-dt * 9) + .17 * sine(990 * p, dt) * Math.exp(-dt * 11);
            }
            if (family === "time") value *= .65 + .35 * Math.sin(tau * 14 * t);
        } else if (family === "growl" || family === "motor" || family === "horn" || family === "gravity") {
            const base = (family === "motor" ? 77 : family === "horn" ? 135 : 52) * p;
            const modulation = family === "growl" ? 2.4 * sine(27, t) : .65 * sine(9, t);
            value = (.3 * Math.sin(tau * base * t + modulation)
                + .14 * sine(base * 1.501, t) + .11 * sine(base * 2.01, t)
                + .6 * body + .1 * low) * (family === "gravity" ? swell : Math.sin(Math.PI * u) ** .5);
        } else if (family === "rubber") {
            value = .42 * sweep(470 * p, 72 * p, t, duration) * decay
                * (.7 + .3 * sine(24, t)) + .3 * low * Math.exp(-t * 40);
        } else if (family === "ring") {
            value = (.19 * sine(2380 * p, t) + .08 * sine(2433 * p, t)) * swell * Math.exp(-u * 2);
        } else if (family === "resolve") {
            const notes = variant ? [440, 554.365, 659.255] : [330, 440, 554.365, 880];
            for (let k = 0; k < notes.length; k += 1) {
                const dt = t - k * .095;
                if (dt >= 0) value += .21 * sine(notes[k] * p, dt) * Math.exp(-dt * 4.6);
            }
            value += .22 * sweep(120, 38, t, duration) * Math.exp(-t * 10);
        }
        const edge = family === "siren" ? 1 : Math.min(1, t / .004, (duration - t) / .02);
        output[i] = Math.tanh(value * weight * 1.35) * .79 * Math.max(0, edge);
    }
    // A short diffusion tail adds space without washing out a combat transient.
    if (design.family !== "siren" && design.family !== "ring") {
        for (let i = output.length - 1; i >= 0; i -= 1) {
            let echo = 0;
            for (const [seconds, gain] of [[.023, .075], [.041, .045], [.067, .028]]) {
                const source = i - Math.round(seconds * sampleRate);
                if (source >= 0) echo += output[source] * gain;
            }
            output[i] = (output[i] + echo) * Math.min(1, (output.length - 1 - i) / (sampleRate * .02));
        }
    }
    return output;
}

export function encodeSfxWav(samples, sampleRate = ORIGINAL_SFX_SAMPLE_RATE) {
    const bytes = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(bytes);
    const label = (offset, value) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
    label(0, "RIFF"); view.setUint32(4, bytes.byteLength - 8, true); label(8, "WAVE");
    label(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true); label(36, "data");
    view.setUint32(40, samples.length * 2, true);
    samples.forEach((sample, i) => view.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32767), true));
    return new Uint8Array(bytes);
}

const MATERIALS = Object.freeze({
    magneto: "metal", kratos: "metal", sword: "metal", knight: "metal", trident: "metal", sawball: "metal", cutter: "metal", train: "metal", forge: "metal",
    origami: "paper", gambit: "paper", artist: "paper", "sand-pharaoh": "sand", rubber: "rubber", pinball: "bell", fairy: "bell", jackpot: "bell",
    "blue-sun": "fire", fire: "fire", reactor: "fire", "hydrogen-bomb": "fire", "black-hole": "gravity", gravis: "gravity", monster: "body", boxer: "body", unarmed: "body", "one-punch-man": "body",
    "frost-ball": "crystal", ice: "crystal", "glass-ball": "crystal", "doctor-strange": "portal", gojo: "portal", wdc: "energy", "one-above-all": "portal", "ben-10": "energy",
    "darth-vader": "saber", "luke-skywalker": "saber", pistol: "shot", rifle: "shot", shotgun: "shot", sniper: "shot", turret: "shot", draftmaster: "shot", commander: "shot",
    "hive-ball": "insect", parasites: "insect", vampire: "shadow", necromancer: "shadow", poison: "fluid", potion: "fluid", venom: "fluid",
});

// Revoices every procedural combat cue, including legacy fighters. Existing
// event routing still decides when a cue may play; identity and phase decide
// its new material. Timing, panning, voice limits and recording buses are kept.
export function originalEventSound(plan, event = {}) {
    if (!plan || plan.category === "announcer") return plan;
    const identity = event.fighterType || event.sourceType || event.raceOrbId || plan.fighterType || "orb";
    const text = `${event.cue || ""} ${event.move || ""} ${event.phase || ""} ${event.type || ""}`;
    const hash = hashString(`${identity}:${event.move || plan.signature || event.type}`);
    const pitch = 2 ** (((hash % 13) - 6) / 24);
    const tell = /tell|windup|charge|guard|summon/.test(text);
    const dodge = /evade|dodge|vault/.test(text);
    const dash = !tell && /lunge|dash|slipstream/.test(text);
    const hit = !tell && /hit|slam|detonate|break|bank|block|catch|critical/.test(text);
    const material = /heatblast|pyro|flame/.test(text) ? "fire" : /diamond|emerald|gem/.test(text) ? "crystal"
        : /shop|market|sell|coin/.test(text) ? "bell"
        : /four-arms|cannonbolt|serious|punch/.test(text) ? "body"
        : /saber/.test(text) ? "saber" : /force-choke/.test(text) ? "gravity"
        : MATERIALS[identity] || "energy";
    const layer = (start, end, duration, volume, wave = "sine", delay = 0, attack = .006) => ({ startFrequency: start * pitch, endFrequency: end * pitch, duration, volume, wave, delay, attack });
    const noise = (duration, volume, frequency, filterType = "bandpass", delay = 0, attack = .008) => ({ duration, volume, frequency, filterType, q: .8, delay, attack, offset: (hash % 180) / 1000 });
    let layers;
    let noises;
    if (dodge || dash) {
        layers = [layer(dodge ? 1120 : 340, dodge ? 2400 : 82, .19, .075, "sine"), layer(136, 51, .22, dash ? .11 : .035)];
        noises = [noise(.23, .14, dodge ? 4200 : 2100, "bandpass", 0, .03)];
    } else if (tell) {
        const duration = Math.max(.28, Math.min(.85, ...plan.layers.map((layer) => layer.delay + layer.duration), ...plan.noises.map((noise) => noise.delay + noise.duration)));
        const lowMaterial = ["gravity", "shadow", "body", "sand"].includes(material);
        layers = [layer(lowMaterial ? 72 : 120, lowMaterial ? 145 : 330, duration, .072, "triangle", 0, duration * .4), layer(740, 1100, .21, .033, "sine", duration * .4, .06)];
        noises = [noise(duration, .04, material === "sand" ? 1100 : 2800, "bandpass", 0, duration * .45)];
        if (material === "metal" || material === "shot") {
            layers.push(layer(1670, 1430, .12, .045));
            noises.push(noise(.055, .075, 3400, "highpass"), noise(.04, .05, 2900, "bandpass", .09));
        } else if (material === "paper") {
            layers = [layer(530, 730, .15, .025, "sine", .12)];
            noises = [noise(.11, .075, 2900), noise(.13, .07, 4300, "highpass", .12), noise(.08, .05, 3600, "highpass", .25)];
        } else if (material === "crystal" || material === "bell") {
            layers.push(layer(1320, 1440, .25, .044, "sine", .08), layer(1980, 2110, .23, .03, "sine", .19));
        } else if (material === "fire") {
            noises = [noise(duration, .105, 980, "lowpass", 0, duration * .6), noise(duration * .65, .045, 3100, "bandpass", .08, duration * .35)];
        } else if (material === "sand") {
            noises.push(noise(duration * .9, .075, 4600, "highpass", 0, duration * .5));
        }
    } else {
        const body = layer(hit ? 147 : 215, hit ? 37 : 82, hit ? .31 : .22, hit ? .17 : .07);
        const ring = layer(620, 410, .28, .065, "sine", .01);
        const materials = {
            metal: { layers: [body, layer(1270, 1190, .29, .072), layer(1980, 1830, .21, .04)], noises: [noise(.09, .12, 3400, "highpass")] },
            paper: { layers: [layer(330, 170, .11, .045), ring], noises: [noise(.15, .11, 4100, "highpass"), noise(.09, .065, 2700, "bandpass", .08)] },
            sand: { layers: [body, layer(109, 72, .3, .045, "triangle")], noises: [noise(.32, .14, 1300), noise(.19, .055, 5300, "highpass", .07)] },
            rubber: { layers: [body, layer(790, 93, .32, .11), layer(430, 127, .2, .055, "triangle", .05)], noises: [noise(.09, .06, 890, "lowpass")] },
            bell: { layers: [layer(880, 874, .27, .085), layer(1320, 1290, .22, .052), layer(1760, 1720, .24, .032, "sine", .022)], noises: [noise(.04, .05, 3500)] },
            fire: { layers: [body, layer(80, 44, .34, .08, "triangle")], noises: [noise(.42, .19, 1200, "lowpass", 0, .04), noise(.27, .06, 3100, "bandpass", .02, .04)] },
            gravity: { layers: [layer(78, 27, .47, .18), layer(156, 48, .34, .08, "triangle", .05, .05)], noises: [noise(.4, .10, 590, "lowpass", 0, .09)] },
            crystal: { layers: [body, layer(1860, 1430, .31, .063), layer(2790, 2145, .23, .035)], noises: [noise(.11, .1, 4900, "highpass")] },
            saber: { layers: [layer(identity === "darth-vader" ? 124 : 198, 67, .3, .12, "sawtooth"), layer(390, 106, .24, .07, "triangle")], noises: [noise(.28, .12, 1600, "bandpass", 0, .045)] },
            portal: { layers: [body, layer(330, 990, .31, .068), layer(660, 330, .3, .05, "sine", .04)], noises: [noise(.29, .095, 2900, "bandpass", 0, .08)] },
            shot: { layers: [body, layer(420, 92, .11, .085, "triangle")], noises: [noise(.13, .16, 2900), noise(.07, .06, 5100, "highpass")] },
            body: { layers: [body, layer(93, 31, .25, hit ? .13 : .07)], noises: [noise(.09, .13, 950, "lowpass"), noise(.045, .05, 3100)] },
            insect: { layers: [layer(190, 260, .24, .06, "sawtooth"), layer(380, 440, .18, .035, "triangle")], noises: [noise(.22, .08, 3700)] },
            shadow: { layers: [body, layer(134, 63, .36, .08, "triangle")], noises: [noise(.34, .13, 2300, "bandpass", 0, .06)] },
            fluid: { layers: [layer(630, 129, .16, .07), layer(480, 95, .14, .055, "sine", .07)], noises: [noise(.2, .09, 1600)] },
            energy: { layers: [body, layer(820, 280, .24, .068, "triangle"), layer(1640, 660, .17, .035, "sine", .025)], noises: [noise(.22, .11, 2800)] },
        };
        ({ layers, noises } = materials[material]);
    }
    return { ...plan, signature: `original:${material}:${plan.signature}`, material, layers, noises, noise: noises[0] || null };
}
