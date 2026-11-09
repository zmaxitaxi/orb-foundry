// The reference bout is a timed Classic encounter. Positions are in arena
// units (0–1), so the same cues and motion play in every capture format.
export const WDC_SUMMONS = Object.freeze({
    unarmed: Object.freeze({ name: "UNARMED", color: "#bcbdbf", rim: "#e0e1e2", radius: 0.065 }),
    exoelectric: Object.freeze({ name: "EXOELECTRIC DISINTEGRATOR", color: "#dd3b2e", rim: "#f56b52", radius: 0.063 }),
    emerald: Object.freeze({ name: "EMERALD", color: "#59b444", rim: "#337b2b", radius: 0.066 }),
});

export const WDC_DUEL_END = 36.16;

const WDC_TRACK = [
    [0, .22, .675], [.29, .126, .735], [.48, .07, .80, "x"], [.94, .21, .93, "y"],
    [1.4, .338, .825], [2.5, .653, .416], [2.72, .707, .324], [3.18, .75, -.20],
    [9.63, .75, -.20], [10.08, .75, .069], [10.56, .696, .177], [11.13, .65, .33],
    [11.51, .25, -.20], [21.15, .25, -.20], [21.65, .29, .185], [22.15, .39, .25],
    [22.63, .25, -.20], [WDC_DUEL_END, .25, -.20],
];

const PUNCH_MAN_TRACK = [
    [0, .82, .282], [.28, .875, .231], [.58, .93, .125, "x"], [.82, .823, .07, "y"],
    [1.4, .554, .161], [2.51, .32, .347], [3.04, .07, .452, "x"], [3.52, .298, .366],
    [4.25, .62, .21], [4.92, .93, .39, "x"], [5.41, .442, .832],
    [5.7, .38, .93, "y"], [6.12, .44, .866], [6.64, .557, .79], [7.3, .584, .789],
    [9.26, .584, .79], [9.77, .66, .846], [10.10, .78, .912], [10.55, .914, .785],
    [11.56, .554, .499], [12.45, .244, .25], [13.03, .07, .093, "x"],
    [13.19, .129, .07, "y"], [13.68, .34, .244], [14.28, .486, .844],
    [14.58, .457, .868], [15.13, .12, .601], [15.29, .07, .556, "x"],
    [15.91, .35, .72], [16.69, .608, .877], [17.14, .785, .93, "y"],
    [17.54, .93, .738, "x"], [18.25, .766, .501], [19.15, .491, .291],
    [20.15, .175, .096], [20.41, .07, .07, "xy"], [21.27, .309, .365],
    [22.5, .69, .653], [23.31, .929, .891, "x"], [23.54, .862, .93, "y"],
    [24.4, .586, .747], [25.96, .098, .367], [26.08, .07, .32, "x"],
    [27.52, .527, .147], [28.21, .752, .269], [28.7, .93, .467, "x"],
    [29.6, .694, .785], [30.5, .555, .624], [31.65, .524, .455],
    [32.26, .531, .374], [32.76, .576, .442], [33.55, .663, .52],
    [34.12, .717, .577], [34.44, .8, .58], [35.45, 1.078, .58], [36.05, 1.26, .58],
];

const FORMS = [
    { id: "unarmed", open: 2.17, start: 2.81, close: 3.28, end: 9.57, dot: .60, portal: { x: .485, y: .77 }, track: [
        [2.81, .485, .77], [3.1, .43, .90], [3.27, .41, .935, "y"], [3.52, .368, .858],
        [4.09, .066, .68, "x"], [4.65, .48, .72], [5.04, .9, .907], [5.12, .935, .934, "xy"],
        [5.42, .493, .78], [5.55, .40, .746], [5.89, .068, .53, "x"],
        [6.39, .64, .645], [6.64, .375, .763], [6.87, .067, .750, "x"],
        [7.42, .443, .738], [7.61, .934, .68, "x"], [7.94, .71, .589],
        [8.54, .402, .718], [8.74, .234, .56], [8.99, -.032, .388], [9.57, -.53, .12],
    ] },
    { id: "exoelectric", open: 11.09, start: 11.54, close: 12.02, end: 20.98, dot: .40, portal: { x: .736, y: .105 }, track: [
        [11.54, .846, .174], [12.08, .938, .072, "xy"], [12.45, .874, .068],
        [13.22, .549, .309], [15.53, .549, .309], [16.09, .469, .493],
        [16.69, .44, .39], [17.67, .069, .663, "x"], [20.27, .069, .668], [20.98, -.39, .34],
    ] },
    { id: "emerald", open: 22.10, start: 22.72, close: 23.05, end: Infinity, dot: null, portal: { x: .327, y: .156 }, track: [
        [22.72, .351, .202], [23.24, .385, .467], [23.75, .388, .66],
        [24.39, .245, .417], [24.99, .067, .242, "x"], [25.37, .17, .42],
        [25.96, .095, .571], [26.03, .066, .599, "x"], [26.46, .259, .677],
        [27.12, .067, .579, "x"], [27.52, .159, .563], [28.16, .331, .364],
        [28.78, .485, .24], [29.14, .392, .409], [29.63, .235, .52], [WDC_DUEL_END, .235, .52],
    ] },
];

const PUNCHES = [
    { at: 5.38, form: 0 },
    { at: 6.60, form: 0 },
    { at: 7.39, form: 0 },
    { at: 8.51, form: 0, serious: true },
    { at: 20.14, form: 1, serious: true, detached: true },
];
const BEAMS = [
    { aim: 13.30, fire: 14.43, end: 15.55, angles: [3.47, 1.49, 2.69] },
    { aim: 17.94, fire: 19.51, end: 20.34, angles: [-.24, -.72, -.44] },
];
const MINES = [
    { at: 26.02, x: .006, y: .60 },
    { at: 27.11, x: .006, y: .58 },
];
const SELL_AT = 28.78;
const PAY_AT = 31.52;
const BAG_AT = 32.70;
const BREAK_AT = 34.31;
const WALL_GAP_Y = .58;

const CUES = [
    ...FORMS.flatMap((form) => [
        { at: form.open, cue: "portal", point: form.portal, form: form.id },
        { at: form.start, cue: "summon", point: sampleTrack(form.track, form.start), form: form.id },
        ...(Number.isFinite(form.end) ? [
            { at: form.end, cue: "recall", point: sampleTrack(form.track, form.end), form: form.id },
        ] : []),
    ]),
    ...PUNCHES.flatMap((punch) => [
        { at: punch.at - .12, cue: "windup", punch },
        { at: punch.at, cue: punch.serious ? "serious" : "punch", punch },
    ]),
    ...BEAMS.flatMap(({ aim, fire }) => [
        { at: aim, cue: "charge", point: sampleTrack(FORMS[1].track, aim) },
        { at: fire, cue: "beam", point: sampleTrack(FORMS[1].track, fire) },
    ]),
    ...[WDC_TRACK, PUNCH_MAN_TRACK, ...FORMS.map(({ track }) => track)].flatMap((track) => (
        track.filter((knot) => knot[3]).map(([at, x, y]) => ({
            at, point: { x, y }, cue: "bounce", punchMan: track === PUNCH_MAN_TRACK,
        }))
    )),
    ...MINES.map(({ at, x, y }) => ({ at, cue: "mine", point: { x, y } })),
    { at: SELL_AT, cue: "sell", point: { x: .5, y: .26 } },
    { at: PAY_AT, cue: "pay", point: { x: .5, y: .30 } },
    { at: BAG_AT, cue: "bag" },
    { at: BREAK_AT, cue: "wall-break", point: { x: 1, y: WALL_GAP_Y } },
    { at: 35.83, cue: "escape" },
].sort((a, b) => a.at - b.at);

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

function smooth(value) {
    const x = clamp01(value);
    return x * x * (3 - 2 * x);
}

function blend(a, b, value) {
    return a + (b - a) * value;
}

// Monotone interpolation keeps free movement continuous and stops curves
// from overshooting the wall. Marked wall contacts reflect on that axis.
function trackAxis(before, from, to, after, axis, fraction) {
    const distance = to[axis] - from[axis];
    if (distance === 0) return from[axis];
    const dt = to[0] - from[0];
    const slope = distance / dt;
    const atKnot = (left, knot, right, wall) => {
        if (!left || !right || knot[3]?.includes(wall)) return slope;
        const a = (knot[axis] - left[axis]) / (knot[0] - left[0]);
        const b = (right[axis] - knot[axis]) / (right[0] - knot[0]);
        return a * b > 0 ? 2 * a * b / (a + b) : 0;
    };
    const wall = axis === 1 ? "x" : "y";
    const m0 = atKnot(before, from, to, wall) * dt;
    const m1 = atKnot(from, to, after, wall) * dt;
    const u = fraction;
    return from[axis] + smooth(u) * distance + u * (1 - u) * ((1 - u) * m0 - u * m1);
}

function sampleTrack(track, time) {
    const next = track.findIndex(([at]) => at > time);
    if (next < 1) {
        const [, x, y] = next === -1 ? track.at(-1) : track[0];
        return { x, y };
    }
    const from = track[next - 1];
    const to = track[next];
    const fraction = (time - from[0]) / (to[0] - from[0]);
    return {
        x: trackAxis(track[next - 2], from, to, track[next + 1], 1, fraction),
        y: trackAxis(track[next - 2], from, to, track[next + 1], 2, fraction),
    };
}

function punchContact(punch) {
    const source = sampleTrack(PUNCH_MAN_TRACK, punch.at);
    const target = sampleTrack(FORMS[punch.form].track, punch.at);
    const angle = Math.atan2(target.y - source.y, target.x - source.x);
    return { angle, reach: Math.max(.10, Math.min(.23, Math.hypot(target.x - source.x, target.y - source.y) - .035)), target };
}

function actorTrails(track, time, count, step) {
    return Array.from({ length: count }, (_, index) => sampleTrack(track, time - (index + 1) * step));
}

export function createClassicWdcDuel(sim) {
    const wdc = sim.fighters.find(({ type }) => type === "wdc");
    const punchMan = sim.fighters.find(({ type }) => type === "one-punch-man");
    if (!wdc || !punchMan || sim.fighters.length !== 2 || wdc.classicTeamIndex === punchMan.classicTeamIndex) return null;
    const duel = { wdcId: wdc.id, punchManId: punchMan.id, cueIndex: 0, effects: [], pose: null };
    updateClassicWdcDuel(sim, duel, 0, () => {});
    return duel;
}

export function updateClassicWdcDuel(sim, duel, dt, emit) {
    const time = sim.time;
    const wdc = sim.fighters.find(({ id }) => id === duel.wdcId);
    const punchMan = sim.fighters.find(({ id }) => id === duel.punchManId);
    const bounds = sim.arenaBounds;
    const wdcPoint = sampleTrack(WDC_TRACK, time);
    const punchPoint = sampleTrack(PUNCH_MAN_TRACK, time);
    for (const [fighter, point] of [[wdc, wdcPoint], [punchMan, punchPoint]]) {
        const x = bounds.x + bounds.width * point.x;
        const y = bounds.y + bounds.height * point.y;
        fighter.vx = dt > 0 ? (x - fighter.x) / dt : 0;
        fighter.vy = dt > 0 ? (y - fighter.y) / dt : 0;
        fighter.x = x;
        fighter.y = y;
    }

    while (CUES[duel.cueIndex]?.at <= time) {
        const entry = CUES[duel.cueIndex++];
        const belongsToPunchMan = entry.punch || entry.punchMan || ["pay", "bag", "wall-break", "escape"].includes(entry.cue);
        const point = entry.point || (entry.punch ? punchContact(entry.punch).target : null)
            || (belongsToPunchMan ? punchPoint : wdcPoint);
        duel.effects.push({ cue: entry.cue, at: entry.at, x: point.x, y: point.y });
        emit("classic-wdc-cue", {
            fighterId: belongsToPunchMan ? punchMan.id : wdc.id,
            cue: entry.cue,
            form: entry.form,
            x: bounds.x + bounds.width * point.x,
            y: bounds.y + bounds.height * point.y,
        });
    }
    duel.effects = duel.effects.filter(({ at }) => time - at <= 1.1);

    const form = FORMS.find(({ start, end }) => time >= start && time < end);
    const portal = FORMS.find(({ open, close }) => time >= open && time < close);
    const attack = PUNCHES.find(({ at }) => time >= at - .19 && time < at + .40);
    const beam = BEAMS.find(({ aim, end }) => time >= aim && time < end);
    const contact = attack ? punchContact(attack) : null;
    let flyingFist = null;
    if (attack?.detached && time >= attack.at - .13 && time < attack.at + .14) {
        const launch = sampleTrack(PUNCH_MAN_TRACK, attack.at - .13);
        const travel = clamp01((time - attack.at + .13) / .27);
        flyingFist = {
            x: blend(launch.x, contact.target.x, travel),
            y: blend(launch.y, contact.target.y, travel),
        };
    }
    const summonPosition = form ? sampleTrack(form.track, time) : null;
    const summonLaunched = form?.id === "unarmed" && PUNCHES.some(({ at, form: index }) => index === 0 && time >= at && time - at < .42);
    duel.pose = {
        wdc: wdcPoint,
        punchMan: punchPoint,
        punchManVisible: time < 35.91,
        punchManTrail: time >= 33.72 && time < 35.88 ? actorTrails(PUNCH_MAN_TRACK, time, 6, .024) : [],
        summon: form ? {
            ...summonPosition,
            id: form.id,
            age: time - form.start,
            trail: summonLaunched ? actorTrails(form.track, time, 14, .016) : [],
        } : null,
        dots: FORMS.filter(({ dot, start }) => dot !== null && time >= start).map(({ dot }) => dot),
        portal: portal ? { ...portal.portal, age: time - portal.open, duration: portal.close - portal.open } : null,
        punch: attack ? {
            ...contact,
            serious: attack.serious === true,
            detached: attack.detached === true,
            flyingFist,
            extension: smooth((time - attack.at + .125) / .125) * (1 - smooth((time - attack.at - .10) / .28)),
        } : null,
        beam: beam ? {
            phase: time < beam.fire ? "charge" : "fire",
            angle: time < beam.fire
                ? blend(beam.angles[0], beam.angles[1], smooth(((time - beam.aim) / (beam.fire - beam.aim) - .38) / .62))
                : blend(beam.angles[1], beam.angles[2], smooth((time - beam.fire) / (beam.end - beam.fire))),
            progress: time < beam.fire
                ? clamp01((time - beam.aim) / (beam.fire - beam.aim))
                : clamp01((time - beam.fire) / (beam.end - beam.fire)),
        } : null,
        charge: time < 9.57 ? 1 : time < 20.15 ? clamp01((time - 9.57) / 6.8) : clamp01((time - 20.15) / 7.1),
        shop: form?.id === "emerald" ? {
            age: time - form.start,
            gems: time >= SELL_AT ? 0 : 5 * MINES.filter(({ at }) => time >= at).length,
            coins: time >= SELL_AT ? 100 : 0,
            merchant: time >= SELL_AT && time < BAG_AT,
            selling: time >= SELL_AT,
            paymentAge: time >= PAY_AT ? time - PAY_AT : null,
            carrying: time >= BAG_AT,
        } : null,
        wallGapY: time >= BREAK_AT ? WALL_GAP_Y : null,
    };
}
