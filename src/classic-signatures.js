import { CLASSIC_ORBS } from "./classic-orbs.js?v=20261110-shared-lunge2";

// Original Classic abilities, mapped to presentation beats. The base move and
// its follow-ups share a visual language; incidental rebounds never enter it.
const voice = (layers = [], noises = [], rateLimit = 0.12, priorityEffects = false) => Object.freeze({
    layers: Object.freeze(layers.map(Object.freeze)),
    noises: Object.freeze(noises.map(Object.freeze)),
    rateLimit,
    ...(priorityEffects ? { priorityEffects: true } : {}),
});
const cue = (name, phase, life, sound = null, detail = {}) => Object.freeze({
    name, phase, life, sound, ...detail,
});
const when = (field, value) => ({ test: (event) => event[field] === value });
const at = (anchor) => ({ anchor });
const signature = (name, color, accent, cues) => Object.freeze({
    name, color, accent, cues: Object.freeze(cues),
});

const slash = voice([[1080, 344, .13, .067, "triangle"], [2410, 1720, .19, .037, "sine", .025]],
    [[.15, .084, 2530, 1.2, "bandpass", 0, .018]]);
const orbitalLock = voice([[661, 662, .16, .064, "sine"], [991, 1017, .18, .046, "sine", .040], [1321, 1300, .20, .033, "triangle", .073]]);
const crack = voice([[132, 44, .27, .21, "sine"], [555, 113, .12, .092, "triangle"]],
    [[.21, .16, 790, .85, "lowpass"], [.08, .075, 2350, 1.6, "bandpass", .025]], .21);
const tripTwang = voice([[2180, 1170, .11, .062, "triangle"], [380, 300, .13, .032, "sine", .022]],
    [[.044, .051, 4100, 2.8, "bandpass"]], .24);
const tripTick = voice([[1090, 565, .12, .075, "triangle"]], [[.084, .042, 2840, 1.3, "bandpass"]], .27);
const beamTick = voice([[1970, 580, .13, .067, "triangle"], [164, 82, .085, .043, "sine"]],
    [[.077, .047, 2940, 1.8, "bandpass"]], .16);
const rifleRound = voice([[251, 105, .12, .104, "triangle"], [108, 60, .13, .10, "sine"]],
    Array.from({ length: 5 }, (_, i) => [.035, .092 - i * .01, 3100 - i * 190, 1.1, "bandpass", i * .019]), .15);
const chargerZip = voice([[317, 1544, .13, .078, "triangle", 0, .025], [1200, 246, .16, .051, "sine", .087]],
    [[.22, .13, 2100, 1.18, "bandpass", 0, .048]], .21);
const lassoSnap = voice([[1030, 410, .13, .075, "triangle"]], [[.091, .084, 1960, 1.35, "bandpass", 0, .007]]);
const throwTrident = voice([[369, 740, .17, .063, "triangle", .015, .047], [1270, 814, .14, .043, "sine"]],
    [[.15, .07, 3190, 1.2, "bandpass", .010, .035]]);
const tridentPin = voice([[195, 61, .21, .14, "sine"], [1450, 950, .27, .076, "triangle", .012], [2290, 1790, .17, .039, "sine", .034]],
    [[.11, .093, 2300, 1.12, "bandpass"]], .21);
const hopper = voice([[324, 583, .091, .072, "triangle"], [645, 943, .11, .056, "sine", .055], [959, 1256, .115, .038, "sine", .117]]);
const paintBrush = voice([], [[.24, .055, 1550, 1.6, "bandpass", 0, .043], [.22, .048, 2240, 1.5, "bandpass", .24, .033], [.18, .060, 1780, 1.9, "bandpass", .51, .051]]);
const fairyBell = voice([[1318, 1313, .21, .073, "sine"], [1976, 1968, .21, .051, "sine", .058], [2637, 2610, .26, .035, "triangle", .119]]);
const dustThud = voice([[88, 34, .28, .19, "sine"], [228, 94, .13, .093, "triangle"]],
    [[.19, .135, 790, 1.0, "lowpass"], [.09, .075, 1470, 1.5, "bandpass", .06]], .23);

export const CLASSIC_SIGNATURES = Object.freeze({
    sword: signature("Steel Crescent", "#f2d9a4", "#fff4d6", {
        "classic-sword-start": cue("edge-draw", "tell", .19, voice([[1400, 1550, .12, .051, "triangle"], [2550, 2300, .16, .041, "sine"]], [[.13, .067, 3300, 2.6, "bandpass", 0, .041]])),
        "classic-sword-phase": Object.freeze([
            cue("edge-sweep", "release", .31, slash, { ...when("phase", "active"), anchor: "sword" }),
            cue("edge-fade", "recover", .19, null, { ...when("phase", "follow-through"), anchor: "sword" }),
        ]),
        "classic-sword-deflect": cue("edge-deflect", "block", .34, null),
        "weapon-hit": cue("edge-contact", "impact", .29, null),
        "classic-slice-hit": cue("edge-contact", "impact", .28, null),
    }),
    duplicator: signature("Mirror Bud", "#fb62cd", "#ffdbf6", {
        "classic-duplicate": cue("bud", "release", .56, voice([[404, 680, .12, .084, "triangle"], [828, 1130, .18, .065, "sine", .066], [1227, 1545, .16, .042, "sine", .15]], [[.08, .056, 1990, 1.2, "bandpass", .049]]), at("split")),
    }),
    orbital: signature("Satellite Lock", "#559fff", "#d5f1ff", {
        "classic-orbital-growth": cue("lock", "build", .32, orbitalLock, { anchor: "body", quiet: true }),
        "classic-orbital-hit": cue("satellite-pop", "impact", .27, voice([[986, 721, .115, .102, "sine"], [1567, 1160, .15, .064, "triangle"]], [[.073, .05, 3240, 1.75, "bandpass"]], .18)),
    }),
    unarmed: signature("Kinetic Knuckle", "#aebdcb", "#f3f9ff", {
        "classic-bounce-damage": cue("knuckle-build", "build", .24, voice([[308, 190, .10, .078, "triangle"]], [[.065, .063, 1500, 1.35, "bandpass"]], .21), at("body")),
        "classic-body-hit": cue("knuckle-hit", "impact", .27, voice([[213, 62, .147, .193, "sine"], [590, 203, .093, .081, "triangle"]], [[.078, .124, 1690, .9, "bandpass"]], .14)),
    }),
    slammy: signature("Faultline Slam", "#ff9a47", "#ffe2bd", {
        "classic-bounce-damage": cue("fault-prime", "build", .22, null, at("body")),
        "classic-slam": cue("fault-break", "impact", .53, crack),
    }),
    vampire: signature("Crimson Lockjaw", "#f0537b", "#ffd7e3", {
        "classic-ability-start": cue("fang-latch", "release", .31, voice([[339, 163, .13, .087, "triangle"]], [[.18, .064, 2140, .7, "highpass", 0, .036]]), { test: (event) => event.latchPhase === "latched" && event.latched !== false }),
        "classic-dot-tick": cue("blood-draw", "impact", .47, null, { ...when("dotKind", "vampire-latch"), anchor: "drain" }),
        "classic-vampire-release": cue("fang-release", "recover", .35, voice([[280, 164, .18, .061, "sine"], [798, 239, .13, .031, "triangle", .021]], [[.12, .044, 2700, 1.0, "bandpass"]]), at("body")),
    }),
    turret: signature("Sentry Deployment", "#ff9d4b", "#ffe0a7", {
        "classic-hazard-spawn": cue("sentry-deploy", "release", .52, voice([[176, 93, .19, .112, "triangle"], [691, 550, .085, .082, "square", .11], [1220, 1210, .09, .054, "sine", .205]], [[.18, .079, 1360, 1.48, "bandpass", .045]]), when("hazardKind", "turret")),
        "classic-projectile-fired": cue("sentry-fire", "release", .18, voice([[226, 111, .067, .062, "triangle"]], [[.043, .055, 2600, 1.1, "bandpass"]], .18), when("projectileKind", "projectile")),
        "classic-projectile-hit": cue("sentry-hit", "impact", .24, voice([[521, 198, .10, .085, "triangle"]], [[.073, .070, 2240, 1.5, "bandpass"]], .18)),
    }),
    flash: signature("Lightning Step", "#f6e348", "#fffbd3", {
        "classic-flash-burst": cue("speed-break", "release", .49, null, at("body")),
        "classic-body-hit": cue("speed-contact", "impact", .26, voice([[926, 224, .105, .079, "triangle"], [220, 68, .15, .107, "sine"]], [[.12, .084, 2670, 1.0, "bandpass"]], .18)),
    }),
    reactor: signature("Core Breach", "#38aaff", "#d1f6ff", {
        "classic-reactor-explosion": cue("core-breach", "release", .66, null),
        "classic-reactor-blast-hit": cue("core-contact", "impact", .36, voice([[178, 45, .26, .18, "sine"], [1130, 277, .17, .082, "triangle"]], [[.17, .106, 1280, 1.15, "bandpass"]], .22), at("blast")),
    }),
    sniper: signature("Needle Shot", "#9fc5dc", "#edfaff", {
        "classic-projectile-fired": cue("needle-shot", "release", .34, voice([[225, 58, .17, .16, "sine"], [1340, 389, .09, .073, "triangle"]], [[.12, .11, 2090, 1.13, "bandpass"], [.041, .08, 5200, 1.2, "highpass"]]), when("projectileKind", "sniper-ammo")),
        "classic-projectile-hit": cue("needle-contact", "impact", .32, voice([[1730, 460, .117, .091, "triangle"], [174, 44, .19, .117, "sine"]], [[.10, .098, 3730, 1.85, "bandpass"]], .16), when("projectileKind", "sniper-ammo")),
    }),
    draftmaster: signature("Arsenal Shift", "#7fa9d5", "#dfedff", {
        "classic-draftmaster-sword-start": cue("arsenal-draw", "tell", .35, voice([[360, 790, .13, .072, "triangle"], [1590, 1190, .14, .049, "sine", .072]], [[.115, .070, 2300, 1.9, "bandpass"]]), at("body")),
        "classic-draftmaster-sword-hit": cue("arsenal-cut", "impact", .35, null),
        "classic-draftmaster-gun-fire": cue("arsenal-fire", "release", .36, voice([[218, 82, .17, .14, "triangle"], [770, 248, .11, .058, "sine", .029]], [[.12, .10, 2530, 1.19, "bandpass"]]), at("muzzle")),
        "classic-draftmaster-gun-phase": cue("arsenal-ready", "recover", .25, voice([[668, 671, .068, .055, "square"], [1002, 1002, .11, .042, "sine", .048]], [[.041, .043, 1630, 2.1, "bandpass"]]), when("phase", "ready")),
    }),
    "blue-sun": signature("Corona Volley", "#55caff", "#c8fdff", {
        "classic-blue-sun-volley": cue("corona-open", "release", .57, null, at("corona")),
        "classic-blue-sun-hit": cue("corona-contact", "impact", .24, beamTick),
    }),
    "black-hole": signature("Event Horizon", "#a876f1", "#ebd2ff", {
        "classic-ability-start": cue("horizon-form", "release", .91, voice([[95, 39, .50, .14, "sine", 0, .11], [276, 72, .58, .093, "triangle", .067, .16]], [[.54, .077, 620, 1.25, "bandpass", .11, .15]]), { ...when("abilityKind", "black-hole"), anchor: "arena-center" }),
    }),
    tripwire: signature("Tripline Snap", "#a8d9db", "#f5ffff", {
        "classic-hazard-spawn": cue("wire-set", "release", .34, tripTwang, { ...when("hazardKind", "tripwire"), anchor: "segment" }),
        "classic-dot-tick": cue("wire-tripped", "impact", .22, tripTick, { ...when("dotKind", "tripwire"), anchor: "hazard-contact" }),
    }),
    "hydrogen-bomb": signature("Critical Countdown", "#ff6740", "#ffdc8b", {
        "classic-hydrogen-bomb-countdown-start": cue("fuse-arm", "tell", .88, null, at("body")),
        "classic-hydrogen-detonate": cue("fuse-blast", "impact", 1.1, null),
    }),
    necromancer: signature("Bone Muster", "#b58dd4", "#e8d5f7", {
        "classic-necromancer-summon-start": cue("muster-lift", "tell", .43, null, at("body")),
        "classic-necromancer-phase": cue("muster-chant", "tell", .49, voice([[128, 118, .39, .078, "triangle", 0, .11], [215, 193, .36, .061, "sine", .048, .092], [415, 302, .26, .038, "sine", .12, .071]], [[.23, .045, 1280, 1.6, "bandpass", .12, .093]]), when("phase", "charge")),
        "classic-necromancer-summon": cue("muster-rise", "release", .56, voice([[190, 87, .18, .101, "triangle"], [530, 380, .13, .069, "sine", .086]], [[.17, .10, 1200, 1.3, "bandpass", 0, .024], [.057, .079, 2820, 2.0, "bandpass", .108]]), at("summon")),
    }),
    poison: signature("Venom Bloom", "#cb6cfa", "#f4baff", {
        "classic-ability-start": cue("venom-bloom", "release", .57, voice([[460, 184, .23, .070, "sine", .012, .045], [317, 517, .21, .039, "triangle", .112]], [[.33, .075, 1470, 1.35, "bandpass", 0, .05]]), {
            test: (event) => event.abilityKind === "contact-dot" && Boolean(event.targetId) && event.duration > 0,
            anchor: "poison-contact",
        }),
    }),
    spikey: signature("Briar Nail", "#fd627a", "#ffe6eb", {
        "classic-hazard-spawn": cue("nail-set", "release", .41, voice([[235, 70, .15, .09, "sine"], [889, 560, .17, .078, "triangle", .02]], [[.085, .097, 2570, 1.36, "bandpass"]], .22), { ...when("hazardKind", "spike"), anchor: "spike" }),
        "classic-projectile-hit": cue("nail-hit", "impact", .26, voice([[1350, 590, .10, .072, "triangle"], [177, 58, .16, .11, "sine"]], [[.081, .073, 3090, 1.55, "bandpass"]], .17), when("projectileKind", "spike")),
    }),
    snake: signature("Shed and Strike", "#64e57d", "#d0ffb5", {
        "classic-snake-growth": cue("scale-shed", "build", .49, voice([[359, 486, .13, .061, "triangle"], [672, 784, .20, .045, "sine", .063]], [[.22, .07, 3900, 1.36, "highpass", .025, .046]]), at("tail")),
        "classic-projectile-hit": cue("scale-bite", "impact", .28, voice([[600, 206, .107, .078, "triangle"]], [[.115, .103, 4140, 1.29, "highpass"]], .18), { test: (event) => /^snake-(head|tail)$/.test(event.projectileKind) }),
    }),
    virus: signature("Patient Zero", "#57f777", "#d1ffe0", {
        "classic-virus-contact": cue("virus-spread", "release", .47, voice([[870, 736, .087, .069, "square"], [510, 995, .111, .059, "triangle", .061], [1400, 930, .104, .052, "sine", .111]], [[.14, .039, 2800, 1.72, "bandpass"]], .22), at("virus-zone")),
        "classic-dot-tick": cue("virus-propagate", "impact", .22, voice([[905, 771, .08, .057, "square"], [1150, 880, .10, .052, "sine", .041]], [], .32), when("dotKind", "virus")),
    }),
    shrapnel: signature("Splinter Charge", "#ff9c56", "#ffe4c3", {
        "classic-shrapnel-volley": cue("splinter-volley", "release", .40, voice([[198, 55, .16, .16, "sine"], [1020, 385, .12, .069, "triangle", .031]], [[.088, .133, 1970, .98, "bandpass"], [.134, .057, 4870, 1.7, "highpass", .026]], .19), at("wall")),
        "classic-projectile-hit": cue("splinter-hit", "impact", .23, voice([[853, 312, .077, .073, "triangle"]], [[.075, .085, 3260, 1.22, "bandpass"]], .19), when("projectileKind", "shrapnel")),
    }),
    cobwebs: signature("Silk Hitch", "#c4c4ea", "#fbf6ff", {
        "classic-hazard-spawn": cue("silk-cast", "release", .42, voice([[808, 756, .17, .066, "sine"], [1210, 1180, .23, .045, "triangle", .036]], [[.19, .044, 1620, 3.6, "bandpass", .031, .054]], .25), { ...when("hazardKind", "cobweb"), anchor: "web" }),
        "classic-dot-tick": cue("silk-catch", "impact", .25, voice([[1370, 994, .16, .053, "sine"], [423, 331, .12, .033, "triangle"]], [[.087, .039, 2580, 2.75, "bandpass"]], .29), { ...when("dotKind", "cobweb"), anchor: "hazard-contact" }),
    }),
    apple: signature("Orchard Toss", "#ff6458", "#a6f270", {
        "classic-hazard-spawn": cue("orchard-toss", "release", .52, voice([[395, 250, .094, .095, "sine"], [712, 1010, .17, .047, "triangle", .045]], [[.072, .062, 1280, 1.3, "bandpass"]]), { ...when("hazardKind", "apple"), anchor: "apple" }),
        "classic-apple-collected": cue("orchard-bite", "impact", .36, voice([[470, 321, .13, .083, "triangle"]], [[.11, .081, 2570, 1.5, "bandpass"]]), { allowZero: true }),
    }),
    absorber: signature("Prism Intake", "#ba86ff", "#f4e1ff", {
        "classic-ability-start": cue("prism-intake", "release", .90, voice([[290, 688, .51, .071, "sine", 0, .14], [827, 365, .46, .069, "triangle", .03, .12], [1155, 1520, .24, .058, "sine", .41], [1700, 2185, .22, .040, "sine", .49]], [[.45, .064, 1570, 2.18, "bandpass", .085, .11]]), { ...when("abilityKind", "absorbed-ability"), anchor: "body" }),
    }),
    batman: signature("Nightwing Rebound", "#ead161", "#f8edbd", {
        "classic-ability-start": cue("wing-release", "release", .35, voice([[672, 241, .15, .066, "triangle", .027]], [[.16, .076, 1750, 1.15, "bandpass", 0, .03], [.086, .05, 3060, 1.52, "bandpass", .07]]), when("abilityKind", "gun")),
        "classic-projectile-hit": cue("wing-cut", "impact", .29, voice([[1120, 342, .13, .079, "triangle"]], [[.096, .077, 2540, 1.4, "bandpass"]], .18), when("projectileKind", "batarang")),
    }),
    "ying-yang": signature("Twin Temper", "#9ba5b1", "#f5f6ff", {
        "classic-ability-start": cue("temper-turn", "release", .60, voice([[329, 658, .26, .084, "sine"], [658, 329, .27, .074, "triangle", .031], [982, 985, .20, .043, "sine", .155]], [], .18), when("abilityKind", "ying-yang")),
    }),
    trapper: signature("Rodeo Knot", "#e9a25d", "#ffe0a5", {
        "classic-trapper-throw": cue("knot-throw", "release", .43, lassoSnap, at("lasso")),
        "classic-trapper-deployed": cue("knot-land", "recover", .35, voice([[310, 150, .091, .048, "sine"]], [[.087, .071, 1090, .9, "bandpass"]], .15)),
        "classic-trapper-caught": cue("knot-cinch", "block", .56, null),
    }),
    "hive-ball": signature("Honeycomb Swarm", "#ffc342", "#fff0a6", {
        "classic-ability-start": cue("honeycomb-open", "release", .48, voice([[154, 207, .28, .078, "sawtooth", .012, .043], [315, 417, .31, .044, "triangle", .035, .067]], [[.19, .055, 1590, 1.26, "bandpass", .065, .046]]), when("abilityKind", "hive")),
        "classic-projectile-hit": cue("honeycomb-sting", "impact", .27, voice([[942, 264, .11, .089, "triangle"]], [[.074, .083, 2780, 1.4, "bandpass"]], .17), when("projectileKind", "bee")),
    }),
    zeus: signature("Thunder Tribunal", "#f7cc72", "#e0f8ff", {
        "classic-zeus-thunder": cue("tribunal-cast", "release", .57, null, at("zeus")),
        "classic-dot-tick": cue("tribunal-strike", "impact", .37, voice([[105, 42, .23, .166, "sine"], [1770, 459, .13, .071, "triangle"]], [[.14, .124, 3800, 1.13, "highpass"], [.22, .078, 680, 1.11, "lowpass", .047]], .23), when("dotKind", "chain-lightning")),
    }),
    "glass-ball": signature("Prism Shatter", "#a5eff4", "#f4ffff", {
        "classic-glass-shatter": cue("glass-break", "release", .42, voice([[1652, 1544, .15, .081, "sine"], [2391, 1987, .21, .058, "sine", .016], [3315, 3064, .18, .043, "triangle", .051]], [[.16, .083, 4160, 1.65, "highpass"]], .21), at("wall")),
        "classic-projectile-hit": cue("glass-nick", "impact", .27, voice([[2420, 1740, .12, .072, "sine"], [3160, 2810, .10, .041, "triangle", .017]], [[.072, .058, 5130, 2.05, "bandpass"]], .16), when("projectileKind", "glass-shard")),
    }),
    pistol: signature("Double Tap", "#f1b362", "#fff0c7", {
        "classic-gun-fire": cue("tap-fire", "release", .21, voice([[287, 113, .091, .117, "triangle"], [147, 56, .084, .093, "sine"]], [[.046, .138, 2680, 1.0, "bandpass"]], .065), at("muzzle")),
        "classic-projectile-hit": cue("tap-hit", "impact", .23, voice([[760, 229, .084, .077, "triangle"], [130, 52, .126, .098, "sine"]], [[.069, .087, 2460, 1.4, "bandpass"]], .13), when("projectileKind", "pistol-ammo")),
    }),
    shotgun: signature("Scatter Bloom", "#ffb66c", "#fff5cf", {
        "classic-gun-fire": cue("scatter-fire", "release", .41, null, at("muzzle")),
        "classic-projectile-hit": cue("scatter-hit", "impact", .26, voice([[145, 49, .17, .13, "sine"], [523, 151, .13, .091, "triangle"]], [[.13, .113, 1630, .94, "bandpass"]], .16), when("projectileKind", "shotgun-ammo")),
    }),
    rifle: signature("Five-Round Rebound", "#7ad6ef", "#e7fbff", {
        "classic-gun-fire": cue("round-cadence", "release", .31, rifleRound, at("muzzle")),
        "classic-projectile-wall-bounce": cue("round-ricochet", "block", .26, voice([[1960, 825, .10, .076, "triangle"], [2680, 1540, .14, .055, "sine", .012]], [[.063, .059, 3720, 1.67, "bandpass"]], .12), { test: (event) => event.projectileKind === "rifle-ammo" && event.bounceNumber <= event.maxWallBounces }),
        "classic-projectile-hit": cue("round-hit", "impact", .25, voice([[722, 334, .084, .098, "triangle"], [156, 56, .131, .10, "sine"]], [[.085, .106, 2470, 1.35, "bandpass"]], .14), when("projectileKind", "rifle-ammo")),
    }),
    sawball: signature("Twin Tooth Grind", "#78df89", "#e1ffd9", {
        "classic-saw-disc-collision": cue("tooth-grind", "block", .24, voice([[142, 114, .14, .080, "sawtooth"], [980, 610, .12, .069, "triangle"]], [[.18, .080, 3040, 1.56, "bandpass"]], .21)),
        "classic-projectile-hit": cue("tooth-bite", "impact", .38, null, when("projectileKind", "saw")),
    }),
    cutter: signature("Redline Shear", "#ff435a", "#ffc9d2", {
        "classic-hazard-spawn": cue("redline-set", "release", .39, voice([[376, 171, .15, .088, "triangle"], [1704, 458, .15, .055, "sine", .038]], [[.24, .073, 1420, 1.29, "bandpass", 0, .034]], .22), { ...when("hazardKind", "cutter-zone"), anchor: "segment" }),
        "classic-dot-tick": cue("redline-shear", "impact", .29, voice([[421, 146, .12, .069, "triangle"], [160, 68, .15, .075, "sine"]], [[.096, .095, 2240, 1.38, "bandpass"]], .22), when("dotKind", "cutter-zone")),
    }),
    trident: signature("Tidepin Recall", "#4ce3d7", "#d4fff8", {
        "classic-projectile-fired": cue("tide-throw", "release", .40, throwTrident, when("projectileKind", "trident-ammo")),
        "classic-trident-stick": cue("tide-pin", "impact", .42, tridentPin, at("pin")),
        "classic-trident-recall": cue("tide-recall", "recover", .44, null, at("recall")),
        "classic-trident-callback-hit": cue("tide-return-cut", "impact", .36, voice([[1440, 634, .21, .105, "triangle"], [212, 47, .26, .117, "sine"]], [[.16, .116, 1960, 1.33, "bandpass"]], .19)),
        "classic-trident-returned": cue("tide-catch", "recover", .24, voice([[520, 820, .12, .073, "triangle"], [1040, 1150, .15, .047, "sine", .044]]), at("pin")),
    }),
    lazer: signature("Live Red Trace", "#ff4774", "#ffe0eb", {
        "classic-hazard-spawn": cue("trace-seal", "release", .42, voice([[936, 335, .20, .080, "sawtooth", .025, .045], [1318, 1940, .13, .061, "triangle"]], [[.13, .065, 3330, 1.8, "bandpass", .047]], .23), { ...when("hazardKind", "laser"), anchor: "segment" }),
        "classic-laser-pass": cue("trace-pass", "impact", .26, voice([[1622, 390, .14, .096, "triangle"], [785, 274, .14, .047, "sawtooth"]], [[.088, .086, 3660, 1.55, "bandpass"]], .19), at("hazard-contact")),
    }),
    charger: signature("Phase Crash", "#ffab52", "#ffe9c3", {
        "classic-charger-phase": cue("phase-charge", "tell", .71, voice([[118, 330, .61, .10, "triangle", 0, .18], [361, 1030, .52, .053, "sine", .09, .20], [645, 1590, .29, .038, "triangle", .25, .13]], [[.50, .055, 1420, 1.39, "bandpass", .09, .14]]), when("phase", "charging")),
        "classic-charger-teleport": cue("phase-crash", "release", .46, chargerZip, at("teleport")),
    }),
    parasites: signature("Burrow Clamp", "#adce56", "#f4ecb5", {
        "classic-projectile-fired": cue("burrow-spawn", "release", .34, voice([[274, 156, .13, .081, "triangle"], [393, 545, .14, .045, "sine", .067]], [[.139, .074, 1030, 1.71, "bandpass"]], .19), when("projectileKind", "parasite")),
        "classic-parasite-attach": cue("burrow-clamp", "block", .54, voice([[193, 96, .17, .112, "triangle"], [867, 514, .12, .061, "sine", .018], [492, 280, .11, .071, "triangle", .083]], [[.21, .076, 1090, 2.6, "bandpass"]], .17)),
        "classic-dot-tick": cue("burrow-drain", "impact", .26, voice([[260, 149, .105, .063, "triangle"], [570, 413, .112, .035, "sine", .053]], [], .29), { ...when("dotKind", "parasite"), anchor: "parasite" }),
    }),
    grappler: signature("Winch Hook", "#e0a77d", "#ffefcc", {
        "classic-projectile-fired": cue("winch-fire", "release", .34, voice([[447, 220, .145, .087, "triangle"], [1235, 855, .107, .061, "sine", .026]], [[.165, .098, 1830, 1.59, "bandpass", .023, .033]]), when("projectileKind", "grappler-ammo")),
        "classic-projectile-hit": cue("winch-latch", "impact", .43, voice([[252, 84, .20, .144, "sine"], [968, 710, .18, .067, "triangle", .038], [1110, 896, .16, .044, "sine", .095]], [[.125, .107, 2230, 1.53, "bandpass"]], .19), when("projectileKind", "grappler-ammo")),
    }),
    train: signature("Third Bell Express", "#e9b85e", "#fff0cb", {
        "classic-hazard-spawn": cue("express-rail", "build", .32, null, { test: (event) => event.hazardKind === "train-track" && Boolean(event.activeSegment), anchor: "segment" }),
        "classic-projectile-fired": cue("express-engine", "release", .68, voice([[303, 335, .40, .087, "triangle", 0, .060], [392, 410, .45, .073, "sine", .047, .071]], [[.35, .087, 1140, 1.16, "bandpass", .065, .085]]), when("projectileKind", "train")),
        "classic-projectile-hit": cue("express-contact", "impact", .40, dustThud, { test: (event) => ["train", "train-track"].includes(event.projectileKind), anchor: "hazard-contact" }),
    }),
    jackpot: signature("Golden Seven", "#ffd645", "#fff1a3", {
        "classic-ability-start": cue("reel-spin", "tell", .46, hopper, when("abilityKind", "jackpot")),
        "classic-jackpot-result": Object.freeze([
            cue("reel-win", "impact", .96, voice([[658, 665, .20, .14, "sine"], [826, 840, .24, .12, "triangle", .091], [990, 1001, .30, .102, "sine", .186], [1320, 1326, .41, .090, "triangle", .285]], [[.15, .087, 3670, 1.94, "bandpass", .27]], .28, true), when("jackpot", true)),
            cue("reel-stop", "impact", .29, voice([[368, 220, .15, .077, "triangle"]], [[.052, .061, 1440, 1.9, "bandpass"]], .16), when("jackpot", false)),
        ]),
    }),
    boxer: signature("Red Corner Combo", "#ff6563", "#ffe0d2", {
        "classic-boxer-punch-start": cue("corner-set", "tell", .14, voice([[324, 610, .11, .059, "triangle"]], [[.126, .080, 1720, 1.37, "bandpass", 0, .026]]), at("body")),
        "classic-boxer-phase": cue("corner-swing", "release", .22, null, { ...when("phase", "extend"), anchor: "glove" }),
        "classic-punch-hit": cue("corner-hit", "impact", .32, voice([[163, 48, .147, .156, "sine"], [477, 141, .096, .115, "triangle"]], [[.094, .144, 2170, 1.14, "bandpass"]], .13)),
    }),
    artist: signature("Living Brushwork", "#f18bdd", "#ffe2fb", {
        "classic-artist-drawing": cue("brush-stroke", "tell", .72, paintBrush, at("body")),
        "classic-artist-drawing-complete": cue("brush-splash", "release", .58, voice([[258, 108, .164, .114, "sine"], [745, 483, .208, .076, "triangle", .027], [1490, 1220, .22, .046, "sine", .062]], [[.097, .081, 1660, 1.13, "bandpass"]])),
    }),
    monster: signature("Stonejaw Crush", "#83d16d", "#d2f2ab", {
        "classic-boxer-punch-start": cue("stonejaw-growl", "tell", .15, voice([[114, 66, .228, .098, "sawtooth", 0, .042]], [[.19, .071, 636, 1.11, "lowpass", .014, .038]]), at("body")),
        "classic-boxer-phase": cue("stonejaw-lunge", "release", .25, null, { ...when("phase", "extend"), anchor: "glove" }),
        "classic-punch-hit": cue("stonejaw-crush", "impact", .47, dustThud),
    }),
    fairy: signature("Wand Comet", "#eab0ff", "#fff0ff", {
        "classic-fairy-cast": cue("wand-launch", "release", .43, fairyBell, at("muzzle")),
        "classic-projectile-hit": cue("wand-star", "impact", .34, voice([[2192, 1320, .17, .077, "sine"], [651, 245, .105, .078, "triangle", .019]], [[.085, .067, 3560, 1.28, "bandpass"]]), when("projectileKind", "fairy-ammo")),
    }),
    commander: signature("Drone Crossfire", "#86b7ff", "#def4ff", {
        "classic-projectile-fired": Object.freeze([
            cue("drone-missile", "release", .40, voice([[179, 56, .25, .16, "sine"], [476, 230, .18, .072, "triangle", .027]], [[.21, .105, 1190, .86, "bandpass", .021, .031]], .18), { test: (event) => event.projectileKind === "commander-round" && event.damage >= 5 }),
            cue("drone-round", "release", .22, voice([[790, 488, .09, .082, "triangle"], [186, 96, .10, .045, "sine"]], [[.05, .060, 2270, 1.9, "bandpass"]], .13), when("projectileKind", "commander-round")),
        ]),
        "classic-projectile-hit": Object.freeze([
            cue("drone-missile-hit", "impact", .43, voice([[133, 41, .25, .175, "sine"], [408, 125, .14, .091, "triangle"]], [[.18, .113, 1150, 1.02, "bandpass"]], .17), { test: (event) => event.projectileKind === "commander-round" && (event.projectileDamage ?? event.amount) >= 5 }),
            cue("drone-round-hit", "impact", .24, voice([[755, 352, .116, .085, "triangle"]], [[.083, .079, 2530, 1.4, "bandpass"]], .16), when("projectileKind", "commander-round")),
        ]),
    }),
});

function routeFor(event) {
    if (event.gameplayMode !== "classic") return null;
    const orbId = event.fighterType || event.sourceType || event.classicOrbId;
    if (!orbId || !Object.hasOwn(CLASSIC_SIGNATURES, orbId)) return null;
    const definition = CLASSIC_SIGNATURES[orbId];
    if (!Object.hasOwn(definition.cues, event.type)) return null;
    const matching = definition.cues[event.type];
    const route = Array.isArray(matching)
        ? matching.find((item) => !item.test || item.test(event))
        : !matching.test || matching.test(event) ? matching : null;
    if (!route) return null;
    if (route.phase === "impact" && !route.allowZero && (event.amount ?? event.damageAmount ?? 1) <= 0) return null;
    return { orbId, definition, route };
}

export function classicSignatureFor(event = {}) {
    const match = routeFor(event);
    if (!match) return null;
    const { orbId, definition, route } = match;
    return {
        orbId, name: definition.name, style: orbId, cue: route.name, phase: route.phase,
        color: definition.color, accent: definition.accent,
    };
}

export function classicSignatureSoundFor(event = {}) {
    const match = routeFor(event);
    if (!match?.route.sound) return null;
    const { orbId, route } = match;
    return { ...route.sound, fighterType: orbId, signature: `classic-${route.name}` };
}

// Grouped releases have their own audio beat. Never add the old default
// pistol or placement sample once for every pellet, trap, or fragment.
export function classicSignatureSuppressesGenericSample(event = {}) {
    if (event.gameplayMode !== "classic") return false;
    const orbId = event.fighterType || event.sourceType || event.classicOrbId;
    if (event.type === "classic-projectile-fired") {
        return (orbId === "pistol" && event.projectileKind === "pistol-ammo")
            || (orbId === "rifle" && event.projectileKind === "rifle-ammo")
            || (orbId === "draftmaster" && event.projectileKind === "draftmaster-ammo")
            || (orbId === "batman" && event.projectileKind === "batarang")
            || (orbId === "shrapnel" && event.projectileKind === "shrapnel");
    }
    if (event.type === "classic-projectile-hit" && Object.hasOwn(CLASSIC_SIGNATURES, orbId) && event.amount === 0) {
        return true;
    }
    if (event.type === "classic-hazard-spawn") {
        return (orbId === "glass-ball" && event.hazardKind === "glass-shard")
            || (orbId === "trapper" && event.hazardKind === "trap");
    }
    if (event.type === "classic-dot-tick") {
        return (orbId === "black-hole" && event.dotKind === "black-hole")
            || (orbId === "poison" && event.dotKind === "poison");
    }
    return false;
}

const isPoint = (point) => Number.isFinite(point?.x) && Number.isFinite(point?.y);
const point = (x, y) => (Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null);
const firstPoint = (...options) => options.find(isPoint);
const segmentPoints = (segment) => segment
    ? [point(segment.x1, segment.y1), point(segment.x2, segment.y2)]
    : [];

function nearestSegmentPoint(origin, lines) {
    if (!isPoint(origin)) return null;
    let closest = null;
    for (const line of lines) {
        const [start, end] = segmentPoints(line);
        if (!start || !end) continue;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const t = Math.max(0, Math.min(1, ((origin.x - start.x) * dx + (origin.y - start.y) * dy) / (dx ** 2 + dy ** 2 || 1)));
        const x = start.x + dx * t;
        const y = start.y + dy * t;
        const distance = (x - origin.x) ** 2 + (y - origin.y) ** 2;
        if (!closest || distance < closest.distance) closest = { x, y, distance, angle: Math.atan2(dy, dx) };
    }
    return closest;
}

// Take a small value snapshot. The same effect can be read on a live or replay
// frame after the projectile has already moved or been destroyed.
export function classicSignatureEffectFor(event = {}, sim = {}, { fighter, source, target } = {}) {
    const match = routeFor(event);
    if (!match) return null;
    const { orbId, definition, route } = match;
    const actor = fighter || source;
    const entities = sim.classicEntities || [];
    const entityId = event.entityId || event.projectileId;
    const entity = entityId ? entities.find((item) => item.id === entityId) : null;
    const wall = event.wallContact || event.previousWallContact;
    let start = firstPoint(event, entity, actor, target);
    let end = point(event.x2, event.y2);
    let angle = event.angle ?? event.aimAngle;
    let path;
    let live = false;

    switch (route.anchor) {
        case "sword":
            [start, end] = segmentPoints(event.segment);
            angle = event.segment?.angle ?? angle;
            break;
        case "split":
            end = sim.fighters?.find((item) => item.id === event.childId);
            break;
        case "drain":
            end = actor;
            break;
        case "blast":
            angle = entity && start ? Math.atan2(start.y - entity.y, start.x - entity.x) : angle;
            break;
        case "corona":
            path = event.lasers?.slice(0, 8).flatMap((ray) => {
                const delta = ray.end && ray.start ? Math.hypot(ray.end.x - ray.start.x, ray.end.y - ray.start.y) : 0;
                return delta > 0 && isPoint(ray.start) ? [{ x: ray.start.x, y: ray.start.y, angle: ray.angle, length: delta }] : [];
            });
            break;
        case "arena-center": {
            const bounds = sim.arenaBounds;
            if (bounds) start = point(bounds.x + bounds.width * .5, bounds.y + bounds.height * .5) || start;
            break;
        }
        case "muzzle": {
            const round = entity || entities.findLast((item) => item.ownerId === actor?.id && item.kind === event.projectileKind && item.startedAt === event.time);
            if (round) {
                const offset = (actor?.radius || 42) + (round.radius || 5) + 2;
                const muzzle = point(round.x - Math.cos(round.angle) * offset + Math.cos(angle ?? round.angle) * offset,
                    round.y - Math.sin(round.angle) * offset + Math.sin(angle ?? round.angle) * offset);
                start = muzzle || start;
                angle = angle ?? round.angle;
            }
            break;
        }
        case "segment":
            if (event.completedSegment || event.activeSegment) {
                live = !event.completedSegment;
                [start, end] = segmentPoints(event.completedSegment || event.activeSegment);
            }
            break;
        case "hazard-contact": {
            const center = firstPoint(target, event);
            const segments = [...(entity?.completedSegments || entity?.segments || []), entity?.activeSegment].filter(Boolean);
            const contact = nearestSegmentPoint(center, segments);
            if (contact) {
                start = contact;
                angle = contact.angle;
                end = center;
            }
            break;
        }
        case "poison-contact":
            start = firstPoint(event, target);
            end = target;
            break;
        case "spike":
            start = firstPoint(event.base, wall, start);
            end = firstPoint(event.tip, entity);
            break;
        case "tail":
            start = firstPoint(actor?.classicSnakeTailParts?.at(-1), start);
            if (actor?.classicSnakeTailParts?.length > 1) end = actor.classicSnakeTailParts.at(-2);
            else end = actor;
            break;
        case "virus-zone":
            start = firstPoint(event.zone, start);
            angle = event.zone?.angle ?? angle;
            break;
        case "wall":
            start = firstPoint(wall, start);
            angle = { left: 0, right: Math.PI, top: Math.PI * .5, bottom: -Math.PI * .5 }[wall?.side || event.wallSide] ?? angle;
            break;
        case "web":
            end = firstPoint(wall, point(entity?.x2, entity?.y2));
            break;
        case "apple":
            end = point(event.destinationX, event.destinationY);
            break;
        case "lasso":
            end = firstPoint(event.anchor, point(entity?.anchorX, entity?.anchorY));
            break;
        case "zeus":
            path = entity?.nodes?.filter(isPoint).slice(0, 3).map(({ x, y }) => ({ x, y }));
            break;
        case "pin":
            start = firstPoint(wall, entity, event);
            angle = entity?.stuckAngle ?? angle;
            break;
        case "recall":
            start = firstPoint(entity, event);
            end = actor;
            break;
        case "teleport":
            end = point(event.fromX, event.fromY);
            break;
        case "parasite":
            start = firstPoint(sim.classicEntities?.find((item) => item.id === event.carrierId), event);
            break;
        case "glove": {
            const glove = event.gloves?.find((item) => item.punchingHand);
            start = firstPoint(point(glove?.x2, glove?.y2), event);
            end = point(glove?.x1, glove?.y1);
            break;
        }
        case "summon":
            path = entities.filter((item) => item.ownerId === actor?.id && item.kind === "necromancer-soldier" && item.summonSequence === event.summonSequence && isPoint(item))
                .slice(0, 2).map(({ x, y }) => ({ x, y }));
            break;
        default:
            break;
    }

    if (!isPoint(start)) return null;
    if (!Number.isFinite(angle)) {
        const direction = isPoint(end) ? end : null;
        if (direction && Math.hypot(direction.x - start.x, direction.y - start.y) > .01) angle = Math.atan2(direction.y - start.y, direction.x - start.x);
        else if (entity && Number.isFinite(entity.angle)) angle = entity.angle;
        else if (actor && target && actor !== target && route.anchor !== "body") angle = Math.atan2(target.y - actor.y, target.x - actor.x);
        else if (actor && Math.hypot(actor.vx, actor.vy) > .01) angle = Math.atan2(actor.vy, actor.vx);
        else angle = 0;
    }

    const radius = Math.max(16, Math.min(90, (event.sawDiscRadius || actor?.radius || target?.radius || 42) * (route.quiet ? .87 : 1)));
    const move = CLASSIC_ORBS[event.absorbedOrbId];
    return {
        kind: "classic-signature", eventId: event.id, orbId, style: orbId,
        cue: route.name, phase: route.phase, x: start.x, y: start.y, angle, radius,
        color: definition.color, accent: definition.accent, life: route.life, maxLife: route.life,
        ...(route.phase === "tell" && actor?.id ? {
            followId: actor.id, followOffsetX: start.x - actor.x, followOffsetY: start.y - actor.y,
        } : {}),
        ...(isPoint(end) ? { x2: end.x, y2: end.y } : {}),
        ...(path?.length ? { path } : {}),
        ...(event.shotAngles ? { shotAngles: event.shotAngles.slice(0, 7) } : {}),
        ...(move ? { variantColor: move.color } : {}),
        ...(event.drawingKind ? { variant: event.drawingKind } : {}),
        ...(event.attackMode ? { variant: event.attackMode } : {}),
        ...(event.surface ? { surface: event.surface } : {}),
        ...(event.friendly !== undefined ? { friendly: event.friendly } : {}),
        ...(live ? { live } : {}),
        ...(event.contactPart ? { contactPart: event.contactPart } : {}),
        ...(event.critical || event.jackpot ? { critical: true } : {}),
        ...(event.chargeDuration ? { chargeDuration: event.chargeDuration } : {}),
        ...(event.damageAmount !== undefined ? { amount: event.damageAmount } : event.amount !== undefined ? { amount: event.amount } : {}),
        count: event.count ?? event.laserCount ?? event.segments ?? event.stack ?? event.shotCount ?? 0,
    };
}
