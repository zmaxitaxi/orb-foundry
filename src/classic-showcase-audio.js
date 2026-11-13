import { CLASSIC_SHOWCASE_FIGHTERS } from "./classic-showcase.js?v=20261112-battle-lab-engine4";

const voice = (layers, noises = [], gain = .8) => ({ layers, noises, gain });

// Original synthesized effects: each identity uses a different material and
// envelope. Nothing here samples a movie, television, or game soundtrack.
const VOICES = Object.freeze({
    magneto: {
        tell: voice([[184, 490, .55, .063, "triangle", 0, .23], [731, 1100, .39, .041, "sine", .11]],
            [[.35, .042, 2400, 2.2, "bandpass", .05, .16]]),
        release: voice([[540, 133, .25, .10, "triangle"], [1780, 1210, .26, .048, "sine", .03]],
            [[.24, .105, 3700, 1.3, "bandpass"]]),
        hit: voice([[162, 61, .19, .16, "sine"], [1465, 988, .22, .068, "triangle"]],
            [[.11, .11, 2650, 1.8, "bandpass"]]),
        block: voice([[1640, 1290, .28, .079, "sine"], [2580, 2030, .23, .055, "triangle", .026]],
            [[.057, .088, 3900, 1.6, "highpass"]]),
    },
    kratos: {
        tell: voice([[143, 93, .28, .10, "triangle"]],
            [[.065, .059, 2600, 1.7, "bandpass"], [.05, .055, 3200, 1.3, "bandpass", .085], [.05, .052, 2800, 1.5, "bandpass", .16]]),
        release: voice([[275, 74, .27, .10, "triangle"]],
            [[.24, .13, 1750, .8, "bandpass", 0, .03], [.09, .07, 3900, 2.4, "highpass", .14]]),
        hit: voice([[105, 33, .32, .22, "sine"], [430, 112, .10, .10, "triangle"]],
            [[.18, .12, 1100, 1, "lowpass"], [.08, .075, 3000, 1.4, "bandpass"]]),
        return: voice([[1150, 610, .30, .066, "sine"], [1860, 1330, .22, .037, "triangle", .04]],
            [[.30, .065, 4100, 1.8, "bandpass", 0, .12]]),
    },
    "doctor-strange": {
        tell: voice([[261, 523, .36, .06, "sine", 0, .12], [392, 784, .35, .051, "sine", .12, .14],
            [523, 1046, .31, .042, "triangle", .24, .12]], [[.42, .036, 5600, 1.7, "highpass", .02, .19]]),
        release: voice([[196, 588, .34, .085, "sine"], [1176, 784, .25, .047, "triangle", .07]],
            [[.35, .086, 2900, 2.7, "bandpass", 0, .09]]),
        hit: voice([[220, 65, .29, .16, "sine"], [1319, 659, .24, .057, "triangle"]],
            [[.13, .075, 3460, 1.5, "bandpass"]]),
        warp: voice([[735, 176, .32, .087, "sine"], [220, 1470, .31, .049, "triangle", .04]],
            [[.32, .084, 2200, 1.3, "bandpass", 0, .08]]),
    },
    gambit: {
        tell: voice([], Array.from({ length: 4 }, (_, i) => [.055, .047, 2100 + i * 320, 1.7, "bandpass", i * .048])),
        release: voice([[820, 1410, .11, .052, "triangle"]],
            [[.105, .077, 3860, 1.8, "highpass"]]),
        hit: voice([[260, 54, .22, .17, "sine"], [1430, 620, .13, .053, "triangle"]],
            [[.13, .12, 2150, 1.1, "bandpass"]]),
        stick: voice([[1300, 1680, .19, .044, "sine", 0, .06]], [[.043, .039, 4700, 1.4, "highpass"]]),
        detonate: voice([[176, 38, .29, .18, "sine"], [790, 154, .17, .083, "triangle"]],
            [[.22, .14, 1490, 1.0, "bandpass"], [.08, .065, 4800, 1.4, "highpass"]], .85),
    },
    rubber: {
        tell: voice([[146, 390, .55, .066, "triangle", 0, .25], [103, 169, .42, .048, "sine", .09]],
            [[.31, .036, 780, 3.2, "bandpass", 0, .1]]),
        release: voice([[930, 116, .35, .11, "sine"], [368, 146, .27, .064, "triangle", .06]],
            [[.18, .072, 1900, 1.4, "bandpass"]]),
        hit: voice([[177, 45, .28, .20, "sine"], [410, 131, .16, .064, "triangle"]],
            [[.10, .075, 760, 1.2, "lowpass"]]),
    },
    pinball: {
        tell: voice([[440, 440, .07, .056, "square"], [659, 659, .08, .045, "triangle", .09],
            [880, 880, .12, .041, "sine", .18]]),
        release: voice([[220, 660, .17, .077, "triangle"]], [[.065, .062, 1900, 1.4, "bandpass"]]),
        hit: voice([[1318, 1305, .31, .078, "sine"], [1977, 1945, .24, .043, "triangle", .03]],
            [[.055, .058, 3150, 1.6, "bandpass"]]),
        bank: voice([[880, 872, .18, .063, "sine"], [1760, 1725, .23, .039, "sine", .025]],
            [[.045, .052, 2700, 2.1, "bandpass"]], .72),
    },
    origami: {
        tell: voice([], [[.14, .055, 1800, 1.4, "bandpass"], [.15, .052, 2350, 1.3, "bandpass", .12],
            [.12, .041, 2700, 1.7, "highpass", .24]]),
        release: voice([[640, 1120, .14, .031, "sine"]],
            [[.22, .071, 3400, 1.3, "highpass", 0, .04]]),
        hit: voice([[386, 164, .10, .058, "triangle"]],
            [[.09, .083, 2400, 1.2, "bandpass"], [.08, .057, 5400, 1.5, "highpass"]]),
        return: voice([], [[.11, .055, 2900, 1.8, "bandpass"], [.11, .047, 3400, 1.6, "bandpass", .09]]),
    },
    "sand-pharaoh": {
        tell: voice([[109, 164, .52, .056, "sine", 0, .24]],
            [[.50, .063, 960, 1.1, "bandpass", 0, .21], [.22, .026, 4700, 1.7, "highpass", .21]]),
        release: voice([[214, 91, .27, .071, "triangle"]],
            [[.25, .080, 1600, 1.1, "bandpass", 0, .06]]),
        hit: voice([[126, 38, .27, .17, "sine"], [620, 189, .13, .052, "triangle"]],
            [[.17, .102, 1380, 1.3, "bandpass"]]),
        reform: voice([[126, 378, .32, .066, "sine"], [760, 380, .18, .036, "triangle", .14]],
            [[.39, .091, 1700, 1.4, "bandpass", 0, .12]]),
    },
});

export function classicShowcaseSoundFor(event = {}) {
    if (event.type !== "classic-showcase-cue" || !CLASSIC_SHOWCASE_FIGHTERS[event.fighterType]) return null;
    if (event.phase === "recover") return null;
    const group = VOICES[event.fighterType];
    const phase = event.phase === "shot" || event.phase === "fan" ? "release"
        : event.phase === "catch" ? "tell" : event.phase;
    let base = group[phase] || group.hit;
    if (event.move === "bo-staff" && ["release", "hit"].includes(phase)) {
        base = phase === "release"
            ? voice([[330, 160, .17, .05, "triangle"]], [[.18, .084, 2400, 1.3, "bandpass"]])
            : voice([[230, 79, .15, .10, "triangle"], [117, 49, .18, .11, "sine"]], [[.075, .10, 1750, 1.7, "bandpass"]]);
    } else if (event.move === "scarab-cavalcade" && event.phase === "shot") {
        base = voice([[160, 210, .17, .033, "sawtooth"]], [[.18, .047, 3100, 2.5, "bandpass"]], .65);
    } else if (event.move === "royal-flush" && phase === "tell") {
        base = voice([[392, 392, .10, .04, "sine"], [494, 494, .10, .036, "sine", .10],
            [587, 587, .10, .034, "triangle", .20], [784, 784, .18, .032, "sine", .30]],
            [[.21, .036, 4500, 1.8, "highpass", .05]]);
    } else if (event.move === "chaos-chain" && event.strike === "slam") {
        base = voice([[85, 27, .37, .24, "sine"], [246, 73, .18, .09, "triangle"]],
            [[.27, .16, 900, .9, "lowpass"], [.09, .077, 2900, 1.4, "bandpass"]]);
    }
    const movePitch = event.move === "leviathan" ? 1.18 : event.move === "rail-spear" ? 1.12
        : event.phase === "bank" ? 1 + Math.min(5, event.combo || 0) * .11 : 1;
    return {
        ...base,
        signature: `showcase-${event.fighterType}-${event.move}-${event.phase}`,
        layers: base.layers.map(([from, to, ...rest]) => [from * movePitch, to * movePitch, ...rest]),
        priorityEffects: ["hit", "detonate", "reform", "warp"].includes(event.phase),
    };
}
