const TAU = Math.PI * 2;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeOut = (value) => 1 - (1 - value) ** 3;
const pointAt = (angle, radius) => [Math.cos(angle) * radius, Math.sin(angle) * radius];

function poly(ctx, points, color, width = .045, fill = null, close = false) {
    if (!points.length) return;
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
    if (close) ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }
}

function ellipse(ctx, x, y, rx, ry, rotation, color, width = .045, fill = null, from = 0, to = TAU) {
    if (rx <= 0 || ry <= 0) return;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rotation, from, to);
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }
}

function ngon(ctx, x, y, count, radius, rotation, color, width = .048, fill = null) {
    const points = Array.from({ length: count }, (_, index) => {
        const [dx, dy] = pointAt(rotation + index * TAU / count, radius);
        return [x + dx, y + dy];
    });
    poly(ctx, points, color, width, fill, true);
}

function star(ctx, x, y, points, outer, inner, angle, color, fill) {
    const vertices = Array.from({ length: points * 2 }, (_, index) => {
        const [dx, dy] = pointAt(angle + index * Math.PI / points, index % 2 ? inner : outer);
        return [x + dx, y + dy];
    });
    poly(ctx, vertices, color, .037, fill, true);
}

function rectangle(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function between(ctx, start, end, color, width) {
    poly(ctx, [start, end], color, width);
}

function atLocal(ctx, x, y, angle, draw) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    draw();
    ctx.restore();
}

function randomMark(seed, index) {
    let hash = Math.imul(seed + 31, 0x9e3779b1) ^ Math.imul(index + 11, 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
    return ((hash ^ (hash >>> 16)) >>> 0) / 0x100000000;
}

function debris(ctx, m, { count = 8, length = 1.6, spread = TAU, angle = 0, start = .26, form = "dash" } = {}) {
    const marks = m.reduced ? Math.max(2, Math.ceil(count * .48)) : count;
    for (let i = 0; i < marks; i++) {
        const heading = angle + spread * ((i + m.noise(i)) / marks - .5);
        const depth = start + m.travel * length * (.44 + m.noise(i + 21) * .56);
        const [x, y] = pointAt(heading, depth);
        const width = (.075 + m.noise(i + 41) * .07) * (1 - m.fade * .55);
        atLocal(ctx, x, y, heading + m.travel * (i % 2 ? .8 : -.8), () => {
            if (form === "chip") poly(ctx, [[width * 2.0, 0], [-width, width], [-width * .63, -width * .67]], null, 0, i % 3 ? m.color : m.accent, true);
            else if (form === "tile") rectangle(ctx, -width, -width, width * 2, width * 2, i % 3 ? m.color : m.accent);
            else if (form === "dot") ellipse(ctx, 0, 0, width, width, 0, null, 0, i % 3 ? m.color : m.accent);
            else between(ctx, [-width * 1.9, 0], [width * 1.25, 0], i % 3 ? m.color : m.accent, .049);
        });
    }
}

function lightning(ctx, start, end, color, width, offset = 0, bends = 5, noise = (i) => i % 2) {
    const [x, y] = start;
    const dx = end[0] - x;
    const dy = end[1] - y;
    const size = Math.hypot(dx, dy) || 1;
    const vertices = [start];
    for (let i = 1; i < bends; i++) {
        const t = i / bends;
        const wiggle = offset * (noise(i) - .5) * 2;
        vertices.push([x + dx * t - dy / size * wiggle, y + dy * t + dx / size * wiggle]);
    }
    vertices.push(end);
    poly(ctx, vertices, color, width);
}

function corners(ctx, x, y, radius, length, color, width = .053) {
    for (const signX of [-1, 1]) {
        for (const signY of [-1, 1]) {
            poly(ctx, [
                [x + signX * (radius - length), y + signY * radius],
                [x + signX * radius, y + signY * radius],
                [x + signX * radius, y + signY * (radius - length)],
            ], color, width);
        }
    }
}

function arrow(ctx, x, y, width, length, color, lineWidth = .062) {
    poly(ctx, [[x - length, y - width], [x, y], [x - length, y + width]], color, lineWidth);
}

function crescent(ctx, x, y, size, arc, color, accent) {
    const path = [];
    for (let i = 0; i <= 11; i++) {
        const angle = -arc + arc * 2 * i / 11;
        const [dx, dy] = pointAt(angle, size);
        path.push([x + dx, y + dy]);
    }
    for (let i = 11; i >= 0; i--) {
        const angle = -arc + arc * 2 * i / 11;
        const [dx, dy] = pointAt(angle, size * (1 - Math.sin(Math.PI * i / 11) * .28));
        path.push([x + dx, y + dy]);
    }
    poly(ctx, path, color, .030, accent, true);
}

function wake(ctx, m, direction = 1, length = 1.7, spread = .82) {
    const lines = m.reduced ? 2 : 4;
    for (let i = 0; i < lines; i++) {
        const y = ((i + .5) / lines - .5) * spread * 2;
        const x = (1.00 + m.noise(i) * .42 + m.travel * .39) * direction;
        poly(ctx, [[x - direction * length * (.45 + m.noise(i + 8) * .55), y * .62],
            [x, y], [x + direction * .30, y * 1.07]], i % 2 ? m.color : m.accent, .052);
    }
}

function sword(ctx, m) {
    if (m.cue === "edge-draw") {
        for (const side of [-1, 1]) poly(ctx, [[.86, side * .36], [1.16 + m.travel * .36, side * .57], [1.77, side * .45]], m.color, .064);
        return;
    }
    if (m.end && (m.cue === "edge-sweep" || m.cue === "edge-fade")) {
        const length = Math.min(3.5, Math.hypot(...m.end));
        if (m.variant === "poke") {
            for (const sign of [-1, 1]) poly(ctx, [[length * .35, sign * .1], [length, 0], [length * .23, sign * .28]], m.color, .045);
        } else {
            ctx.rotate(-.36 + m.travel * .84);
            crescent(ctx, -.15, 0, length * (1 + m.travel * .14), .52 + m.travel * .29, m.color, m.accent);
        }
        return;
    }
    const width = .78 + m.travel * .64;
    poly(ctx, [[-width * .81, width * .75], [-width * .15, -.12], [width, -width * .62]], m.accent, .090);
    if (m.phase === "block") poly(ctx, [[-width * .61, -width * .70], [width * .78, width * .64]], m.color, .067);
    debris(ctx, m, { count: 6, spread: 2.2, length: 1.15, form: "dash" });
}

function duplicator(ctx, m) {
    const end = m.end || [1.3, 0];
    const stretch = Math.hypot(...end);
    const bend = .30 * Math.sin(m.travel * Math.PI);
    ctx.beginPath();
    ctx.moveTo(.72, -.35);
    ctx.bezierCurveTo(stretch * .52, -.53 - bend, stretch * .70, -.36, end[0], end[1] - .31);
    ctx.bezierCurveTo(stretch * .70, .36, stretch * .52, .53 + bend, .72, .35);
    ctx.strokeStyle = m.color;
    ctx.lineWidth = .09;
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
        const scale = .43 + m.travel * .39 + i * .15;
        ellipse(ctx, end[0] * (.76 + .12 * i), end[1], scale, scale * .72, -m.travel * .28, i === 2 ? m.accent : m.color, .049);
    }
    debris(ctx, m, { count: 7, angle: 0, spread: 2.5, form: "dot", start: .8, length: 1.42 });
}

function orbital(ctx, m) {
    if (m.phase === "impact") {
        const stretch = .67 + m.travel * .54;
        ngon(ctx, 0, 0, 4, stretch, .785 + m.travel * .67, m.color, .065);
        debris(ctx, m, { count: 5, length: .88, form: "dot" });
        return;
    }
    for (const turn of [-1, 1]) {
        const direction = turn * (.48 + m.travel * .52);
        ellipse(ctx, 0, 0, 1.94 + m.travel * .25, 1.08, direction, m.color, .055, null, turn * .5, turn * .5 + Math.PI * .92);
        const [x, y] = pointAt(direction + .85, 1.78);
        ellipse(ctx, x, y, .14, .14, 0, m.accent, .042, m.color);
    }
}

function unarmed(ctx, m) {
    if (m.phase === "build") {
        for (let i = 0; i < 3; i++) arrow(ctx, -.76 - i * .35 - m.travel * .35, 0, .22 + i * .09, .25, i ? m.color : m.accent, .059);
        return;
    }
    const ring = .53 + m.travel * .68;
    ngon(ctx, .13, 0, 6, ring, 0, m.color, .078);
    for (const offset of [-.52, -.17, .17, .52]) between(ctx, [-.62, offset * .78], [ring, offset], m.accent, .060);
    wake(ctx, m, -1, 1.3, .78);
}

function slammy(ctx, m) {
    if (m.phase === "build") {
        const y = .95 + m.travel * .24;
        poly(ctx, [[-1.0, y - .12], [-.69, y], [.69, y], [1.0, y - .12]], m.color, .072);
        return;
    }
    const r = .66 + m.travel * 1.28;
    const flare = .31 + m.travel * .30;
    for (const side of [-1, 1]) {
        poly(ctx, [[-.13, side * r], [flare, side * r * .61], [-.15, side * .35], [flare, side * .18], [0, 0]], m.accent, .078);
        poly(ctx, [[-.42, side * r * .98], [-.65, side * r * .56], [-.44, side * r * .29]], m.color, .055);
    }
    debris(ctx, m, { count: 11, length: 2.06, form: "chip" });
}

function vampire(ctx, m) {
    if (m.cue === "blood-draw") {
        if (!m.end) return;
        const [x, y] = m.end;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(x * .56, y * .5 - .31, x, y);
        ctx.strokeStyle = m.color;
        ctx.lineWidth = .085;
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
            const t = clamp(m.travel * .79 + i * .07);
            ellipse(ctx, x * t, y * t - Math.sin(t * Math.PI) * .15, .08, .08, 0, null, 0, i ? m.color : m.accent);
        }
        return;
    }
    const closing = m.cue === "fang-release" ? m.travel : 1 - m.travel;
    for (const side of [-1, 1]) {
        const y = side * (.37 + closing * .51);
        poly(ctx, [[-.36, y], [.10, y + side * .14], [.42, y], [.21, y - side * .55], [.02, y - side * .17], [-.36, y]], m.color, .052, m.accent, true);
    }
}

function turret(ctx, m) {
    if (m.cue === "sentry-deploy") {
        const arm = .55 + m.travel * .65;
        for (let i = 0; i < 3; i++) atLocal(ctx, 0, 0, i * TAU / 3, () => {
            poly(ctx, [[.30, -.31], [arm, -.47], [arm + .24, -.28], [arm + .24, .28], [arm, .47], [.30, .31]], m.color, .074);
            between(ctx, [arm + .04, -.22], [arm + .04, .22], m.accent, .07);
        });
        ngon(ctx, 0, 0, 6, .46 + m.travel * .19, .52, m.accent, .068);
        return;
    }
    const scale = m.phase === "impact" ? .59 : .42;
    corners(ctx, m.phase === "impact" ? 0 : .24, 0, scale + m.travel * .19, .23, m.color, .065);
    between(ctx, [-.44, 0], [.80 + m.travel * .38, 0], m.accent, .10);
}

function flash(ctx, m) {
    const spread = 1.0 + m.travel * .55;
    wake(ctx, m, -1, 2.55, spread);
    const z = .67 + m.travel * 1.0;
    poly(ctx, [[-z, -.43], [z * .21, -.51], [-z * .14, -.09], [z, -.14], [-z * .25, .70], [.04, .19], [-z * .76, .24]], m.accent, .078, m.color, true);
}

function reactor(ctx, m) {
    if (m.phase === "impact") {
        const width = .81 + m.travel * .63;
        for (const side of [-1, 1]) {
            poly(ctx, [[-.42, side * .32], [width, side * .75], [width * .74, side * .19]], m.color, .084);
            between(ctx, [.09, side * .14], [width * .96, side * .45], m.accent, .056);
        }
        return;
    }
    const radius = .63 + m.travel * 1.42;
    for (let i = 0; i < 4; i++) {
        const base = i * TAU / 4 + .28;
        ellipse(ctx, 0, 0, radius, radius, 0, i % 2 ? m.color : m.accent, .099, null, base - .31, base + .31);
        const [x, y] = pointAt(base, radius * 1.12);
        ngon(ctx, x, y, 4, .12, base + .785, null, 0, m.color);
    }
    ngon(ctx, 0, 0, 4, .68 + m.travel * .44, .785, m.color, .058);
}

function sniper(ctx, m) {
    if (m.phase === "impact") {
        corners(ctx, .05, 0, .47 + m.travel * .42, .25, m.color);
        between(ctx, [-.76, 0], [.89, 0], m.accent, .064);
        between(ctx, [0, -.67], [0, .67], m.accent, .049);
        return;
    }
    const length = 1.20 + m.travel * 1.16;
    poly(ctx, [[-.42, -.052], [length, 0], [-.42, .052]], m.accent, .028, m.color, true);
    ellipse(ctx, -.11, 0, .20 + m.travel * .54, .36 + m.travel * .48, 0, m.color, .052);
    for (const sign of [-1, 1]) between(ctx, [length * .44, sign * .23], [length * .75, sign * .23], m.accent, .048);
}

function draftmaster(ctx, m) {
    if (m.cue === "arsenal-cut") {
        crescent(ctx, -.38, 0, 1.12 + m.travel * .72, .83, m.color, m.accent);
        return;
    }
    if (m.cue === "arsenal-fire") {
        const x = .52 + m.travel * .58;
        poly(ctx, [[-.46, -.17], [x * .62, -.19], [x, 0], [x * .62, .19], [-.46, .17]], m.accent, .047, m.color, true);
        for (const sign of [-1, 1]) between(ctx, [-.20, sign * .38], [x * .66, sign * .43], m.color, .046);
        return;
    }
    for (const side of [-1, 1]) {
        ctx.save();
        ctx.rotate(side * (.40 + m.travel * .51));
        poly(ctx, [[.96, side * .20], [1.50, side * .20], [1.69, side * .04], [1.93, side * .04]], m.accent, .060);
        ctx.restore();
    }
}

function blueSun(ctx, m) {
    if (m.phase === "impact") {
        const width = .46 + m.travel * .52;
        for (const side of [-1, 1]) poly(ctx, [[-.52, side * .08], [.1, side * width], [.67, side * .21]], m.accent, .067);
        return;
    }
    for (const ray of m.path || []) {
        const [x, y] = m.local(ray.x, ray.y);
        const angle = ray.angle - m.angle;
        const maxLength = ray.length / m.radius;
        const length = Math.min(maxLength, .31 + m.travel * 1.31);
        const [dx, dy] = pointAt(angle, length);
        between(ctx, [x, y], [x + dx, y + dy], m.color, .13);
        between(ctx, [x, y], [x + dx * .72, y + dy * .72], m.accent, .061);
    }
    ellipse(ctx, 0, 0, .79 + m.travel * .47, .79 + m.travel * .47, 0, m.color, .064);
}

function blackHole(ctx, m) {
    const size = 2.54 - m.travel * 1.45;
    for (let i = 0; i < 3; i++) {
        const vertices = Array.from({ length: m.reduced ? 10 : 16 }, (_, step) => {
            const t = step / (m.reduced ? 9 : 15);
            return pointAt(i * TAU / 3 + m.travel * 1.55 + t * 2.4, size * (1 - t * .63));
        });
        poly(ctx, vertices, i ? m.color : m.accent, .081);
    }
    const radius = .53 + (1 - m.travel) * .34;
    ellipse(ctx, 0, 0, radius, radius * .90, .25, m.accent, .043, m.dark ? "#07040e" : "#2e1749");
}

function tripwire(ctx, m) {
    if (m.phase === "impact") {
        const length = .63 + m.travel * .54;
        poly(ctx, [[-length, -.1], [-.35, .17], [-.10, -.37], [.18, .35], [.38, -.16], [length, .12]], m.accent, .069);
        return;
    }
    const length = Math.max(.2, m.end ? Math.hypot(...m.end) : .9);
    const portion = Math.min(length, m.live ? 1.6 : 4.6);
    const start = m.live ? 0 : Math.max(0, length - portion);
    for (const dx of m.live ? [0] : [0, length]) {
        poly(ctx, [[dx - .25, -.25], [dx, -.40], [dx + .25, -.25], [dx + .25, .25], [dx, .40], [dx - .25, .25]], m.color, .067, null, true);
    }
    ctx.setLineDash([.20, .19]);
    between(ctx, [start, 0], [start + portion * (.38 + m.travel * .62), 0], m.accent, .076);
    ctx.setLineDash([]);
}

function hydrogen(ctx, m) {
    ctx.rotate(-m.angle);
    const size = m.phase === "impact" ? .95 + m.travel * 3.4 : 1.37 + m.travel * .37;
    for (let i = 0; i < 3; i++) {
        const angle = i * TAU / 3 - Math.PI / 2;
        const base = pointAt(angle, size * .57);
        const endA = pointAt(angle - .32, size);
        const endB = pointAt(angle + .32, size);
        poly(ctx, [base, endA, endB], i % 2 ? m.accent : m.color, .075, m.phase === "impact" ? null : m.color, true);
    }
    if (m.phase === "impact") {
        ellipse(ctx, 0, 0, size, size, 0, m.color, .087);
        debris(ctx, m, { count: 14, length: 4.0, start: .5, form: "chip" });
    }
}

function necromancer(ctx, m) {
    ctx.rotate(-m.angle);
    if (m.cue === "muster-rise") {
        const places = m.path?.map((entry) => [(entry.x - m.x) / m.radius, (entry.y - m.y) / m.radius]) || [[-.88, .22], [.88, .22]];
        for (const [x, y] of places) {
            const height = .46 + m.travel * .74;
            for (const side of [-1, 1]) {
                poly(ctx, [[x + side * .38, y + .33], [x + side * .47, y - height * .36], [x + side * .23, y - height]], m.color, .084);
            }
            ellipse(ctx, x, y + .22, .57 + m.travel * .23, .23, 0, m.accent, .057);
        }
        return;
    }
    const height = -.90 - m.travel * .37;
    ellipse(ctx, 0, .83, 1.10 + m.travel * .43, .29, 0, m.color, .057, null, .2, Math.PI - .2);
    for (let i = -2; i <= 2; i++) {
        const x = i * .31;
        poly(ctx, [[x, height + Math.abs(i) * .10], [x, height - .14], [x + .12, height - .23]], i % 2 ? m.accent : m.color, .05);
    }
}

function poison(ctx, m) {
    ctx.rotate(-m.angle);
    for (let i = 0; i < (m.reduced ? 4 : 8); i++) {
        const drift = (m.noise(i) - .5) * 1.73;
        const y = .42 - m.travel * (1.0 + m.noise(i + 13) * .87) - m.noise(i + 20) * .36;
        const size = .13 + m.noise(i + 25) * .12;
        ellipse(ctx, drift, y, size, size * 1.18, drift * .32, i % 2 ? m.accent : m.color, .049);
    }
}

function spikey(ctx, m) {
    if (m.phase === "impact") {
        for (const turn of [-.49, .49]) atLocal(ctx, 0, 0, turn, () => {
            poly(ctx, [[-.52, -.13], [1.01 + m.travel * .52, 0], [-.52, .13]], m.color, .052, m.accent, true);
        });
        return;
    }
    const length = m.end ? Math.hypot(...m.end) : 1.2;
    const wide = .49 + m.travel * .13;
    poly(ctx, [[0, -wide], [length * (.65 + m.travel * .35), 0], [0, wide]], m.color, .077);
    for (const side of [-1, 1]) between(ctx, [length * .22, side * wide * .61], [length, 0], m.accent, .058);
}

function snake(ctx, m) {
    if (m.phase === "impact") {
        const sign = m.contactPart === "tail" ? -1 : 1;
        poly(ctx, [[-.64 * sign, -.29], [-.22 * sign, -.44], [.19 * sign, -.15], [.71 * sign, -.34], [(.93 + m.travel * .5) * sign, -.13]], m.color, .090);
        poly(ctx, [[-.59 * sign, .30], [-.26 * sign, .41], [.13 * sign, .17], [.77 * sign, .30]], m.accent, .056);
        return;
    }
    for (let i = 0; i < 4; i++) {
        const distance = (.35 + i * .35) * (1.3 - m.travel * .29);
        const offset = Math.sin(i * 1.5 + m.travel * 2.2) * .23;
        ngon(ctx, distance, offset, 6, .24 + i * .024, i * .1, i % 2 ? m.accent : m.color, .061);
    }
}

function virus(ctx, m) {
    const marks = m.reduced ? 4 : Math.min(13, 8 + m.count);
    for (let i = 0; i < marks; i++) {
        const angle = ((i + .5) / marks - .5) * (m.phase === "release" ? Math.PI * 1.6 : TAU);
        const r = .46 + m.travel * (.65 + m.noise(i) * .66);
        const [x, y] = pointAt(angle, r);
        const side = .080 + m.noise(i + 20) * .12;
        rectangle(ctx, x - side, y - side, side * 2, side * 2, i % 3 ? m.color : m.accent);
        if (i % 3 === 0) rectangle(ctx, x + side * 1.3, y - side * .25, side * .65, side * .65, m.color);
    }
}

function shrapnel(ctx, m) {
    const length = m.phase === "impact" ? .94 : 1.72;
    const count = m.phase === "impact" ? 5 : 9;
    debris(ctx, m, { count, length, spread: Math.PI * 1.14, form: "chip" });
    poly(ctx, [[-.12, -.42], [.39 + m.travel * .45, -.12], [.78 + m.travel * .55, 0], [.39, .16], [-.12, .42]], m.color, .070, null, true);
}

function cobwebs(ctx, m) {
    if (m.phase === "impact") {
        const edge = .38 + m.travel * .54;
        for (const sign of [-1, 1]) poly(ctx, [[-edge, sign * .48], [0, sign * .21], [edge, sign * .50]], m.accent, .055);
        ngon(ctx, 0, 0, 6, edge, .48, m.color, .055);
        return;
    }
    const length = m.end ? Math.hypot(...m.end) : 1.2;
    const weave = length * (.42 + m.travel * .58);
    for (const side of [-1, 1]) {
        poly(ctx, [[-.16, 0], [weave * .46, side * .26], [weave, 0]], m.color, .052);
        between(ctx, [weave * .31, side * .13], [weave * .52, -side * .21], m.accent, .040);
    }
    const [x, y] = m.end || [1.2, 0];
    ngon(ctx, x, y, 6, .21 + m.travel * .18, 0, m.accent, .05);
}

function apple(ctx, m) {
    const green = m.friendly !== false ? m.accent : m.color;
    if (m.phase === "impact") {
        ctx.rotate(-m.angle);
        const width = .48 + m.travel * .43;
        between(ctx, [-width, -.62], [width, -.62], green, .11);
        if (m.friendly) between(ctx, [0, -.62 - width], [0, -.62 + width], green, .11);
        else for (const sign of [-1, 1]) poly(ctx, [[sign * .25, -.28], [sign * .69, .12], [sign * .54, .48]], green, .07);
    }
    for (let i = 0; i < (m.reduced ? 3 : 5); i++) {
        const direction = (i - 2) * .46 + (m.phase === "impact" ? -Math.PI / 2 : Math.PI);
        const [x, y] = pointAt(direction, .53 + m.travel * (.63 + m.noise(i) * .61));
        atLocal(ctx, x, y, direction + m.travel * .86, () => {
            ellipse(ctx, 0, 0, .24, .083, -.5, null, 0, green);
            between(ctx, [-.19, .08], [.14, -.07], m.color, .042);
        });
    }
}

function absorber(ctx, m) {
    const size = 2.27 - m.travel * .91;
    const hue = m.variantColor || m.accent;
    for (let i = 0; i < 6; i++) atLocal(ctx, 0, 0, i * TAU / 6 + m.travel * 1.13, () => {
        poly(ctx, [[size, -.21], [size - .47, 0], [size, .21], [size + .19, 0]], m.color, .060, i % 2 ? hue : null, true);
    });
    ngon(ctx, 0, 0, 6, size * .86, -m.travel * .54, m.accent, .056);
}

function batman(ctx, m) {
    const size = .78 + m.travel * .83;
    for (const wing of [-1, 1]) {
        poly(ctx, [[0, 0], [.09, wing * .27], [.47 * size, wing * size], [-.31 * size, wing * size * .73],
            [-.19, wing * .46], [-.45, wing * .21], [-.31, wing * .12]], m.color, .071, m.dark ? "#352e16" : "#443919", true);
        between(ctx, [.11, wing * .31], [.39 * size, wing * size * .80], m.accent, .04);
    }
}

function yingYang(ctx, m) {
    const size = 1.04 + m.travel * .69;
    ctx.rotate(m.travel * Math.PI * .83);
    ellipse(ctx, 0, 0, size, size, 0, m.dark ? "#f7fbff" : "#11131c", .113, null, -.20, Math.PI - .25);
    ellipse(ctx, 0, 0, size, size, 0, m.dark ? "#717b8b" : "#747b87", .108, null, Math.PI - .20, TAU - .25);
    for (const side of [-1, 1]) ellipse(ctx, size * side * .98, 0, .17, .17, 0, m.color, .040, side === 1 ? m.accent : "#11131c");
}

function trapper(ctx, m) {
    const width = m.phase === "block" ? 1.39 - m.travel * .29 : .49 + m.travel * .60;
    const offset = m.cue === "knot-throw" ? m.travel * Math.min(2.3, m.end ? Math.hypot(...m.end) : 1.3) : 0;
    ellipse(ctx, offset, 0, width, width * .61, m.travel * .22, m.color, .094, null, .21, TAU - .13);
    ctx.setLineDash([.10, .10]);
    ellipse(ctx, offset, 0, width, width * .61, m.travel * .22, m.accent, .047, null, .21, TAU - .13);
    ctx.setLineDash([]);
    poly(ctx, [[offset + width * .84, .15], [offset + width * .57, .39], [offset + width * .25, .61], [offset - width * .22, .75]], m.color, .082);
}

function hive(ctx, m) {
    const pattern = m.phase === "impact" ? 3 : 6;
    for (let i = 0; i < pattern; i++) {
        const angle = i * TAU / pattern;
        const [x, y] = pointAt(angle, (m.phase === "impact" ? .17 : 1.00) + m.travel * .55);
        ngon(ctx, x, y, 6, .27 + m.travel * .13, Math.PI / 6, i % 2 ? m.color : m.accent, .064);
    }
    if (m.phase === "impact") poly(ctx, [[-.27, -.29], [.71 + m.travel * .42, 0], [-.27, .29]], m.color, .047, m.accent, true);
}

function zeus(ctx, m) {
    if (m.phase === "impact") {
        for (let i = 0; i < 3; i++) {
            const endpoint = pointAt(i * TAU / 3 + .51, .95 + m.travel * 1.07);
            lightning(ctx, [0, 0], endpoint, i ? m.color : m.accent, .104, .25, 4, m.noise);
        }
        return;
    }
    if (!m.path) return;
    const points = m.path.map(({ x, y }) => m.local(x, y));
    for (const [index, [x, y]] of points.entries()) {
        const length = Math.hypot(x, y);
        if (length <= .1) continue;
        const t = clamp(m.travel * 1.05 - index * .055);
        const next = [x * t, y * t];
        lightning(ctx, [x * Math.max(0, t - .30), y * Math.max(0, t - .30)], next, m.accent, .085, .13, 4, m.noise);
        ngon(ctx, next[0], next[1], 3, .20, 0, m.color, .067);
    }
}

function glass(ctx, m) {
    const count = m.reduced ? 3 : Math.min(8, 4 + m.count);
    for (let i = 0; i < count; i++) {
        const angle = (i / count - .44) * (m.phase === "impact" ? TAU : Math.PI * 1.15);
        const [x, y] = pointAt(angle, .31 + m.travel * (1.35 + m.noise(i) * .71));
        atLocal(ctx, x, y, angle + m.travel * (i % 2 ? 1.2 : -1.2), () => {
            const width = .19 + m.noise(i + 14) * .21;
            poly(ctx, [[-width, -.12], [width * .68, -.22], [width, .24], [width * -.47, .14]], m.accent, .056, i % 3 ? null : m.color, true);
            between(ctx, [-width, -.12], [width, .24], m.color, .044);
        });
    }
}

function pistol(ctx, m) {
    const length = .44 + m.travel * .42;
    const width = .25 + m.travel * .16;
    star(ctx, .1, 0, 4, length, width, 0, m.accent, m.color);
    for (const side of [-1, 1]) between(ctx, [-.33, side * width], [-.61 - m.travel * .14, side * width * 1.33], m.color, .055);
}

function shotgun(ctx, m) {
    const angles = m.shotAngles?.map((angle) => angle - m.angle) || [-.46, -.23, 0, .23, .46];
    for (const [i, angle] of angles.entries()) atLocal(ctx, 0, 0, angle, () => {
        const reach = (.81 + m.noise(i) * .27) * (.66 + m.travel * .72);
        poly(ctx, [[.04, -.08], [reach, -.051], [reach + .22, 0], [reach, .051], [.04, .08]],
            i % 2 ? m.color : m.accent, .032, i % 2 ? null : m.color, true);
    });
    debris(ctx, m, { count: 7, length: 1.43, spread: 1.6, form: "dot" });
}

function rifle(ctx, m) {
    if (m.cue === "round-ricochet") {
        arrow(ctx, .62 + m.travel * .62, 0, .33 + m.travel * .19, .49, m.accent, .080);
        between(ctx, [-.32, 0], [.37, 0], m.color, .075);
        return;
    }
    const count = m.phase === "impact" ? 3 : 5;
    for (let i = 0; i < count; i++) {
        const y = (i - (count - 1) / 2) * .155;
        const extent = (i / count) * .27 + m.travel * 1.17;
        between(ctx, [extent * .67 - .45, y], [extent + .22, y], i % 2 ? m.color : m.accent, .074);
    }
}

function sawball(ctx, m) {
    const teeth = 9;
    const radius = .46 + m.travel * .75;
    const edge = .74 * radius;
    const points = Array.from({ length: teeth * 2 }, (_, i) => pointAt(i * Math.PI / teeth + m.travel * 1.65, i % 2 ? edge : radius));
    poly(ctx, points, m.color, .073, null, true);
    for (const turn of [-.62, .54]) atLocal(ctx, 0, 0, turn, () => {
        poly(ctx, [[.32, 0], [radius * 1.16, .21], [radius * 1.66, .14 + m.travel * .18]], m.accent, .047);
    });
    debris(ctx, m, { count: 6, spread: 1.8, length: 1.18, form: "dash" });
}

function cutter(ctx, m) {
    const length = m.end ? Math.hypot(...m.end) : 1.8;
    if (m.phase === "impact") {
        const x = .56 + m.travel * .76;
        for (const turn of [-.75, .61]) atLocal(ctx, 0, 0, turn, () => {
            poly(ctx, [[-x, -.12], [x * .36, -.17], [x, 0], [x * .26, .12], [-x, .054]], m.accent, .037, m.color, true);
        });
        return;
    }
    const origin = m.live ? 0 : Math.max(0, length - 3.2);
    const end = Math.min(length, origin + 1.0 + m.travel * 2.2);
    if (end <= origin) return;
    poly(ctx, [[origin, 0], [end, 0], [end, .09], [origin + .35, .43]], m.color, .056, null, true);
    const count = m.reduced ? 3 : 7;
    for (let i = 0; i < count; i++) {
        const x = origin + (end - origin) * (i + .5) / count;
        between(ctx, [x, .10], [Math.min(end, x + .17), .26], m.accent, .045);
    }
}

function trident(ctx, m) {
    if (m.cue === "tide-pin") {
        for (const side of [-1, 1]) {
            ellipse(ctx, 0, 0, .57 + m.travel * 1.18, .29 + m.travel * .32, side * .29, m.color, .068, null, .3, Math.PI + 1.2);
        }
    }
    const flip = m.cue === "tide-recall" ? -1 : 1;
    const center = (m.phase === "release" ? .23 : 0) + m.travel * .62 * flip;
    for (const i of [-1, 0, 1]) {
        const tail = -.54 - m.travel * .26;
        const extent = .55 + (i === 0 ? .24 : 0);
        poly(ctx, [[tail * flip, i * .13], [center, i * .25], [(center + extent) * flip, i * .30],
            [(center + extent - .16) * flip, i * .30 - .12]], i ? m.color : m.accent, i ? .061 : .078);
    }
}

function lazer(ctx, m) {
    if (m.phase === "impact") {
        const length = .71 + m.travel * .90;
        poly(ctx, [[-length, .27], [-.26, .27], [-.16, -.26], [.16, -.26], [.24, .27], [length, .27]], m.color, .10);
        between(ctx, [-length * .55, 0], [length * .52, 0], m.accent, .075);
        return;
    }
    const length = m.end ? Math.hypot(...m.end) : 1.2;
    const visible = Math.min(length, 1.30 + m.travel * 2.8);
    const offset = m.live ? 0 : length - visible;
    between(ctx, [offset, 0], [offset + visible, 0], m.color, .135);
    between(ctx, [offset, 0], [offset + visible, 0], m.accent, .053);
    arrow(ctx, offset + visible, 0, .32, .27, m.color, .083);
}

function charger(ctx, m) {
    if (m.cue === "phase-charge") {
        const distance = 2.12 - m.travel * .74;
        for (let i = 0; i < 4; i++) atLocal(ctx, 0, 0, i * TAU / 4 + .78, () => {
            poly(ctx, [[distance, -.36], [distance - .39, 0], [distance, .36]], i % 2 ? m.color : m.accent, .087);
        });
        return;
    }
    const end = m.end || [-2.6, 0];
    const size = Math.hypot(...end);
    const fraction = size > .1 ? Math.min(1, 3.2 / size) : 1;
    const sourceStreak = [end[0] * fraction, end[1] * fraction];
    poly(ctx, [sourceStreak, [sourceStreak[0] * .54, sourceStreak[1] * .54 + .18], [0, 0]], m.accent, .11);
    const radius = .69 + m.travel * (m.amount > 0 ? 1.19 : .60);
    corners(ctx, 0, 0, radius, .47 + m.travel * .26, m.color, .112);
    if (m.amount > 0) debris(ctx, m, { count: 9, length: 1.8, form: "tile" });
}

function parasites(ctx, m) {
    const gap = m.phase === "block" ? .90 - m.travel * .44 : .47 + m.travel * .30;
    for (const side of [-1, 1]) {
        poly(ctx, [[-.48, side * gap * .53], [-.17, side * gap], [.17, side * gap], [.54, side * gap * .67], [.22, side * .14]], m.color, .092);
        between(ctx, [.36, side * gap * .50], [.20, side * .14], m.accent, .062);
    }
    if (m.phase === "impact") debris(ctx, m, { count: 4, spread: Math.PI, length: .63, form: "dot" });
}

function grappler(ctx, m) {
    const width = .42 + m.travel * .26;
    const length = .69 + m.travel * .58;
    const hook = [[-length, 0], [.14, 0], [.57, -.20], [length, -.11], [length, width * .57], [.64, width], [.38, width * .62]];
    poly(ctx, hook, m.color, .110);
    poly(ctx, [[-.88 * length, .13], [-.55 * length, -.13], [-.26, .13], [.17, 0]], m.accent, .053);
    if (m.phase === "impact") between(ctx, [-length, 0], [-length * 1.35, -.36], m.accent, .055);
}

function train(ctx, m) {
    if (m.cue === "express-rail") {
        const max = m.end ? Math.hypot(...m.end) : 1.8;
        const length = Math.min(max, 2.1);
        const origin = m.live ? 0 : max - length;
        for (const side of [-1, 1]) between(ctx, [origin, side * .18], [origin + length, side * .18], m.color, .067);
        for (let i = 0; i < 5; i++) {
            const x = origin + length * (i + .5) / 5;
            between(ctx, [x, -.29], [x, .29], m.accent, .045);
        }
        return;
    }
    const length = .81 + m.travel * .75;
    for (const side of [-1, 1]) between(ctx, [-length, side * .43], [length, side * .43], m.color, .109);
    for (let i = 0; i < 4; i++) {
        const t = m.travel * .52 + i * .26;
        const x = -length * t;
        const y = -.47 - t * .62;
        ellipse(ctx, x, y, .19 + t * .20, .18 + t * .08, t, m.accent, .045);
    }
}

function jackpot(ctx, m) {
    ctx.rotate(-m.angle);
    if (m.cue === "reel-win") {
        const size = .65 + m.travel * .73;
        ngon(ctx, 0, 0, 8, size, Math.PI / 8, m.accent, .080);
        ctx.save();
        ctx.fillStyle = m.color;
        ctx.font = "900 .98px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("7", 0, -size - .29 - m.travel * .29);
        ctx.restore();
        for (let i = 0; i < (m.reduced ? 5 : 12); i++) {
            const angle = i * TAU / 12;
            const [x, y] = pointAt(angle, size + .35 + m.travel * .98 * m.noise(i + 2));
            ellipse(ctx, x, y, .14 + m.noise(i) * .05, .21, angle + m.travel * 1.2, m.accent, .047, m.color);
        }
        return;
    }
    const width = .37;
    const y = -1.10 - m.travel * .41;
    const size = .57 + m.travel * .17;
    for (let i = -1; i <= 1; i++) {
        const x = i * (width + .13);
        corners(ctx, x, y, width * .56, .105, m.color, .048);
        const fade = m.reduced ? .2 : ((m.travel * 2.8 + i * .27) % .62) - .18;
        rectangle(ctx, x - size * .13, y + fade * .47 - .05, size * .26, .095, m.accent);
    }
}

function boxer(ctx, m) {
    if (m.phase === "tell") {
        for (const side of [-1, 1]) poly(ctx, [[.72, side * .86], [.49, side * 1.05], [1.25, side * 1.16]], m.color, .085);
        return;
    }
    if (m.phase === "release") {
        const [x, y] = m.end || [-1.3, 0];
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(-.17, .46 + m.travel * .38, .50, -.15);
        ctx.strokeStyle = m.color;
        ctx.lineWidth = .104;
        ctx.stroke();
        return;
    }
    star(ctx, 0, 0, 7, .78 + m.travel * .68, .36 + m.travel * .32, .39, m.color, m.accent);
    for (const side of [-1, 1]) between(ctx, [-1.09, side * .31], [-.39, side * .11], m.color, .081);
}

function artist(ctx, m) {
    const tint = m.variant === "artist-monster" ? "#8fd272" : m.variant === "artist-soldier" ? "#e9b671" : m.color;
    if (m.phase === "release") {
        for (let i = 0; i < (m.reduced ? 4 : 9); i++) {
            const angle = i * TAU / 9 + .17;
            const [x, y] = pointAt(angle, .43 + m.travel * (1.21 + m.noise(i) * .70));
            ellipse(ctx, x, y, .19 + m.noise(i) * .13, .07 + m.noise(i + 13) * .14, angle, null, 0, i % 3 ? tint : m.accent);
        }
        return;
    }
    const scale = .80 + m.travel * .30;
    for (let i = 0; i < 4; i++) {
        const x = .24 + i * .11;
        ctx.beginPath();
        ctx.moveTo(x - 1.29, -.86 + i * .06);
        ctx.bezierCurveTo(-.74, -1.69 * scale + i * .07, .43, -1.76 * scale, x + .92, -.60 + i * .09);
        ctx.strokeStyle = i % 2 ? m.accent : tint;
        ctx.lineWidth = .06 + (i % 2) * .034;
        ctx.stroke();
    }
}

function monster(ctx, m) {
    if (m.phase === "tell") {
        for (const side of [-1, 1]) {
            const y = side * (.73 + m.travel * .30);
            poly(ctx, [[.15, y], [.60, y - side * .32], [.91, y], [1.24, y - side * .41]], m.color, .104);
        }
        return;
    }
    const extent = m.phase === "impact" ? .73 + m.travel * .83 : .36 + m.travel * .43;
    for (const side of [-1, 1]) {
        poly(ctx, [[-.48, side * .32], [-.13, side * extent * .87], [extent * .53, side * extent],
            [extent * .82, side * .53], [extent, side * .19]], m.color, .109);
        if (m.phase === "impact") poly(ctx, [[.35, side * .45], [.12, side * .65], [.48, side * .89]], m.accent, .07);
    }
    if (m.phase === "impact") debris(ctx, m, { count: 9, length: 1.87, form: "chip" });
}

function fairy(ctx, m) {
    const distance = m.phase === "release" ? .36 + m.travel * .57 : 0;
    const radius = m.phase === "release" ? .41 + m.travel * .37 : .66 + m.travel * .44;
    star(ctx, distance, 0, 5, radius, radius * .42, -.44 + m.travel * 1.04, m.color, m.accent);
    for (let i = 0; i < (m.reduced ? 2 : 4); i++) {
        const x = -.38 - i * .32 - m.travel * .38;
        const y = Math.sin(i * 1.54 + m.travel * 2.2) * .31;
        star(ctx, x, y, 4, .18 + m.noise(i) * .13, .053, 0, m.color, m.accent);
    }
}

function commander(ctx, m) {
    const heavy = m.cue.includes("missile");
    if (m.phase === "impact") {
        if (heavy) {
            ngon(ctx, 0, 0, 5, .62 + m.travel * .65, .31, m.accent, .11);
            debris(ctx, m, { count: 9, length: 1.62, form: "tile" });
        } else corners(ctx, 0, 0, .37 + m.travel * .41, .23, m.color, .083);
        return;
    }
    const length = (heavy ? .85 : .65) + m.travel * .68;
    const width = heavy ? .38 : .22;
    for (const side of [-1, 1]) {
        poly(ctx, [[-length, side * width], [.20, side * width * .52], [length, side * .10]],
            heavy ? m.accent : m.color, heavy ? .083 : .056);
    }
    if (heavy) debris(ctx, m, { count: 5, spread: 1.1, angle: Math.PI, length: 1.03, form: "dot" });
}

const DRAW_SIGNATURE = Object.freeze({
    sword, duplicator, orbital, unarmed, slammy, vampire, turret, flash, reactor, sniper, draftmaster,
    "blue-sun": blueSun, "black-hole": blackHole, tripwire, "hydrogen-bomb": hydrogen, necromancer,
    poison, spikey, snake, virus, shrapnel, cobwebs, apple, absorber, batman, "ying-yang": yingYang,
    trapper, "hive-ball": hive, zeus, "glass-ball": glass, pistol, shotgun, rifle, sawball, cutter,
    trident, lazer, charger, parasites, grappler, train, jackpot, boxer, artist, monster, fairy, commander,
});

const lightPalettes = new Map();
function forLight(color) {
    if (!/^#[\da-f]{6}$/i.test(color)) return color;
    if (!lightPalettes.has(color)) {
        const hex = color.slice(1);
        const channels = [0, 2, 4].map((index) => Math.round(parseInt(hex.slice(index, index + 2), 16) * .65));
        lightPalettes.set(color, `rgb(${channels.join(", ")})`);
    }
    return lightPalettes.get(color);
}

function arenaIsDark(options) {
    return options.classicBlackTheme ?? options.classicDarkArena ?? options.dark ?? true;
}

export function drawClassicSignatures(ctx, effects = [], options = {}, fighters = []) {
    const dark = arenaIsDark(options);
    const reduced = options.reducedMotion === true;
    const resultAge = Number(options.classicResultAge) || 0;
    // The normal two-fighter battle stays below the cap; busy exhibitions
    // favor the newest cues so overlapping summons never choke the canvas.
    const active = effects.filter((effect) => effect.kind === "classic-signature" && effect.life > resultAge && effect.maxLife > 0);
    for (const effect of active.slice(-(reduced ? 22 : 36))) {
        const draw = DRAW_SIGNATURE[effect.orbId];
        if (!draw) continue;
        const angle = effect.angle || 0;
        const radius = effect.radius || 42;
        const fade = clamp(1 - (effect.life - resultAge) / effect.maxLife);
        const travel = reduced ? .56 : easeOut(fade);
        const color = dark ? effect.color : forLight(effect.color);
        const accent = dark ? effect.accent : forLight(effect.accent);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const local = (x, y) => [
            ((x - effect.x) * cos + (y - effect.y) * sin) / radius,
            (-(x - effect.x) * sin + (y - effect.y) * cos) / radius,
        ];
        const end = Number.isFinite(effect.x2) && Number.isFinite(effect.y2) ? local(effect.x2, effect.y2) : null;
        const opacity = (1 - fade) ** .74 * (effect.phase === "tell" ? Math.min(1, .52 + fade * 5) : .88);
        const follow = effect.followId ? fighters.find((fighter) => fighter.id === effect.followId) : null;
        if (follow?.alive === false) continue;
        const x = follow ? follow.x + effect.followOffsetX : effect.x;
        const y = follow ? follow.y + effect.followOffsetY : effect.y;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(radius, radius);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha *= opacity * (options.flashReduction ? .54 : 1);
        draw(ctx, { ...effect, angle, radius, color, accent, end, local, fade, travel, dark, reduced,
            noise: (index) => randomMark(Number(effect.eventId) || 1, index) });
        ctx.restore();
    }
}

function drawFlashTrail(ctx, fighter, time, reduced) {
    const until = Number(fighter.classicAbilityActiveUntil) || 0;
    if (reduced || until <= 0 || time >= until + .14 || !fighter.trail?.length) return;
    const taper = 1 - clamp((time - until) / .14);
    const radius = fighter.radius;
    ctx.save();
    const alpha = ctx.globalAlpha;
    for (let i = Math.min(7, fighter.trail.length - 1); i >= 1; i -= 2) {
        const item = fighter.trail[i];
        const previous = fighter.trail[i - 1];
        if (Math.hypot(previous.x - item.x, previous.y - item.y) > radius * .75) continue;
        const angle = Math.atan2(previous.y - item.y, previous.x - item.x);
        ctx.globalAlpha = alpha * taper * (.32 - i * .028);
        ellipse(ctx, item.x, item.y, radius * (1.13 - i * .045), radius * (.77 - i * .045),
            angle, "#fff8a6", radius * .051, "#e8ad1c");
    }
    ctx.restore();
}

function drawFuseMarks(ctx, fighter, time, options) {
    if (!fighter.classicHydrogenCountdownStarted || fighter.classicHydrogenDetonated) return;
    const left = Math.max(0, fighter.classicAbilityNextAt - time);
    const radius = fighter.radius;
    const color = left < 8 ? "#ff6044" : "#ef9843";
    const level = Math.max(2, Math.min(12, Math.ceil(left / 5)));
    for (let i = 0; i < level; i++) {
        const angle = i * TAU / 12 - Math.PI * .5;
        const [x, y] = pointAt(angle, radius * 1.24);
        const [dx, dy] = pointAt(angle, radius * (options.reducedMotion ? 1.37 : 1.39 + Math.sin(time * (left < 8 ? 12 : 5) + i * .6) * .075));
        between(ctx, [fighter.x + x, fighter.y + y], [fighter.x + dx, fighter.y + dy], color, radius * .073);
    }
}

function drawReactorGauge(ctx, fighter) {
    const charge = clamp((fighter.classicReactorChargePercent || 0) / 100);
    if (charge < .03) return;
    const radius = fighter.radius;
    for (let i = 0; i < 6; i++) {
        if (charge < i / 6) break;
        const angle = -.52 + i * .21;
        for (const half of [-1, 1]) {
            const [x, y] = pointAt(angle + (half === -1 ? Math.PI : 0), radius * 1.08);
            const [dx, dy] = pointAt(angle + (half === -1 ? Math.PI : 0), radius * 1.24);
            between(ctx, [fighter.x + x, fighter.y + y], [fighter.x + dx, fighter.y + dy], "#42b5f5", radius * .053);
        }
    }
}

function drawSniperAim(ctx, fighter, target, time, reduced) {
    const left = fighter.classicAbilityNextAt - time;
    if (!target || !(left > 0 && left < .43)) return;
    const radius = fighter.radius;
    const angle = Math.atan2(target.y - fighter.y, target.x - fighter.x);
    atLocal(ctx, fighter.x, fighter.y, angle, () => {
        const x = radius * 2.06;
        const size = radius * (reduced ? .31 : .26 + left * .35);
        corners(ctx, x, 0, size, size * .62, "#78abbf", radius * .047);
        between(ctx, [x - radius * .07, 0], [x + radius * .07, 0], "#78abbf", radius * .047);
    });
}

function drawPoisonStatus(ctx, target, time, dot, options) {
    const radius = target.radius;
    const tint = arenaIsDark(options) ? "#df84ff" : "#8529ab";
    const remaining = dot.expiresAt - time;
    const glow = Math.min(.80, Math.max(0, remaining * .85));
    ctx.save();
    ctx.globalAlpha *= glow;
    for (let i = 0; i < 5; i++) {
        const drift = options.reducedMotion ? i / 5 : ((time - dot.startedAt) * .64 + i / 5) % 1;
        const angle = -.24 + i * TAU / 5;
        const [x, y] = pointAt(angle, radius * (1.04 + .38 * drift));
        const bubble = radius * (.102 + .045 * Math.sin(i * 1.7)) * (1 - drift * .29);
        ellipse(ctx, target.x + x, target.y + y, bubble, bubble * 1.16, -.2, tint, radius * .041);
    }
    ctx.restore();
}

function drawVirusStatus(ctx, fighter, time, options) {
    const zones = fighter.classicVirusZones;
    if (!zones?.length) return;
    const radius = fighter.radius;
    const fill = arenaIsDark(options) ? "#77ed5d" : "#267b2f";
    ctx.save();
    ctx.globalAlpha *= .74;
    for (const [index, zone] of zones.slice(-4).entries()) {
        if (!(zone.expiresAt > time)) continue;
        for (let i = 0; i < 3; i++) {
            const t = (i + 1) / 4;
            const angle = zone.arcStart + (zone.arcEnd - zone.arcStart) * t;
            const drift = options.reducedMotion ? .23 : .21 + .11 * Math.sin(time * 7 + index + i * 1.4);
            const [x, y] = pointAt(angle, radius * (1 + drift));
            const size = radius * (.10 + i * .024);
            rectangle(ctx, fighter.x + x - size * .5, fighter.y + y - size * .5, size, size, fill);
        }
    }
    ctx.restore();
}

function drawLiveTrace(ctx, entity, time, options) {
    const segment = entity.activeSegment;
    if (!segment?.active || entity.activeLine === false) return;
    const dx = segment.x2 - segment.x1;
    const dy = segment.y2 - segment.y1;
    const length = Math.hypot(dx, dy);
    if (length <= 8) return;
    const dark = arenaIsDark(options);
    const angle = Math.atan2(dy, dx);
    atLocal(ctx, segment.x1, segment.y1, angle, () => {
        if (entity.kind === "laser") {
            // Mark only the real live edge. Replacing the line on a bounce
            // must never leave the old edge lit as a second live hazard.
            const width = Math.min(length, 71);
            const tip = Math.max(0, length - 2);
            between(ctx, [tip - width, 0], [tip, 0], dark ? "#ff5679" : "#bd1242", 7);
            between(ctx, [tip - width, 0], [tip, 0], dark ? "#ffe0eb" : "#ffeaf1", 2.4);
            const offset = options.reducedMotion ? width * .37 : width * (.26 + .17 * Math.sin(time * 9));
            arrow(ctx, tip - offset, 0, 10, 9, dark ? "#ff89a9" : "#ae1538", 2.4);
        } else if (entity.kind === "tripwire") {
            const x = Math.min(length * .47, 18);
            for (const side of [-1, 1]) between(ctx, [x, side * 5], [x + 11, side * 5], dark ? "#d9fcff" : "#37646b", 2.0);
        } else if (entity.kind === "cutter-zone") {
            const x = Math.min(length * .47, 40);
            const tint = dark ? "#ff6474" : "#ab1c2a";
            between(ctx, [x, 0], [x + 7, 6], tint, 1.8);
            between(ctx, [x + 12, 0], [x + 19, 6], tint, 1.8);
        }
    });
}

function drawCommanderDrone(ctx, entity, target, time, options) {
    const heavy = entity.kind.endsWith("missile");
    const angle = target ? Math.atan2(target.y - entity.y, target.x - entity.x) : Math.PI * .5;
    const nearLaunch = Math.max(0, .24 - (entity.nextShotAt - time)) / .24;
    const radius = Math.max(8, entity.radius);
    atLocal(ctx, entity.x, entity.y, angle, () => {
        ctx.scale(radius, radius);
        if (heavy) {
            poly(ctx, [[.82, 0], [.14, -1.06], [-.89, -1.43], [-.50, -.45], [-.63, 0],
                [-.50, .45], [-.89, 1.43], [.14, 1.06]], "#f5c384", .17, "#353447", true);
            ngon(ctx, .26, 0, 4, .40, .785, "#ffcf8c", .14, "#a94f2b");
        } else {
            poly(ctx, [[.65, -.72], [.79, 0], [.65, .72], [-.59, .91], [-.79, .43],
                [-.79, -.43], [-.59, -.91]], "#acd9ff", .16, "#31517a", true);
            for (const side of [-1, 1]) rectangle(ctx, .07, side * .31 - .09, .43, .18, "#d8f8ff");
        }
        if (nearLaunch > 0) {
            ctx.globalAlpha *= .54 + nearLaunch * .46;
            between(ctx, [.91, 0], [1.17 + (options.reducedMotion ? .19 : nearLaunch * .29), 0], heavy ? "#ffbe83" : "#c7ecff", .17);
        }
    });
}

// Continuing state is sampled directly from the fixed-step fight; no wall
// clock or render history is needed when recording or seeking a replay.
export function drawClassicSignatureAmbient(ctx, sim, options = {}) {
    if (!sim || sim.gameplayMode !== "classic" || sim.legacyClassicRules) return;
    const time = Number(sim.time) || 0;
    const fighters = (sim.fighters || []).filter((fighter) => fighter.alive && !fighter.classicWdcReserve);
    const fighterById = new Map(fighters.map((fighter) => [fighter.id, fighter]));
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (options.flashReduction) ctx.globalAlpha *= .68;
    for (const fighter of fighters) {
        if (fighter.type === "flash") drawFlashTrail(ctx, fighter, time, options.reducedMotion);
        if (fighter.type === "hydrogen-bomb") drawFuseMarks(ctx, fighter, time, options);
        if (fighter.type === "reactor") drawReactorGauge(ctx, fighter);
        if (fighter.type === "sniper") {
            const target = fighters.filter((other) => other.classicTeamIndex !== fighter.classicTeamIndex)
                .sort((a, b) => Math.hypot(a.x - fighter.x, a.y - fighter.y) - Math.hypot(b.x - fighter.x, b.y - fighter.y))[0];
            drawSniperAim(ctx, fighter, target, time, options.reducedMotion);
        }
        drawVirusStatus(ctx, fighter, time, options);
    }
    for (const dot of sim.classicDots || []) {
        if (dot.kind !== "poison" || dot.expiresAt <= time) continue;
        const target = fighterById.get(dot.targetId);
        if (target) drawPoisonStatus(ctx, target, time, dot, options);
    }
    for (const entity of sim.classicEntities || []) {
        if (entity.expiresAt != null && entity.expiresAt <= time) continue;
        if (entity.kind === "laser" || entity.kind === "tripwire" || entity.kind === "cutter-zone") drawLiveTrace(ctx, entity, time, options);
        if (entity.kind === "commander-drone-weak" || entity.kind === "commander-drone-missile") {
            drawCommanderDrone(ctx, entity, fighterById.get(entity.targetId), time, options);
        }
    }
    ctx.restore();
}
