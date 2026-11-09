const TAU = Math.PI * 2;
const clampUnit = (value) => Math.max(0, Math.min(1, value));
const polar = (angle, radius) => [Math.cos(angle) * radius, Math.sin(angle) * radius];

function line(ctx, points, color, width = .06, { closed = false, fill = null } = {}) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    if (closed) ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function arc(ctx, x, y, radius, color, width = .06, start = 0, end = TAU, fill = null) {
    ctx.beginPath();
    ctx.arc(x, y, radius, start, end);
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function ellipse(ctx, x, y, rx, ry, angle, color, width = .06) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, angle, 0, TAU);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function rectangle(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function shape(ctx, x, y, radius, count, angle, color, width = .06, fill = null) {
    const points = Array.from({ length: count }, (_, index) => {
        const [dx, dy] = polar(angle + index * TAU / count, radius);
        return [x + dx, y + dy];
    });
    line(ctx, points, color, width, { closed: true, fill });
}

function place(ctx, x, y, angle, draw) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    draw();
    ctx.restore();
}

function curve(ctx, start, control, end, color, width = .06) {
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.quadraticCurveTo(...control, ...end);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

function star(ctx, x, y, radius, tips, angle, color, core) {
    const vertices = Array.from({ length: tips * 2 }, (_, index) => {
        const [dx, dy] = polar(angle + index * Math.PI / tips, radius * (index % 2 ? .36 : 1));
        return [x + dx, y + dy];
    });
    line(ctx, vertices, color, .055, { closed: true, fill: core });
}

function drawMirrors(ctx, art) {
    for (const side of [-1, 1]) {
        const x = side * (1.02 - art.motion * .28);
        place(ctx, x, -.32 * side, side * .28, () => {
            line(ctx, [[-.35, -.55], [.39, -.76], [.37, .51], [-.39, .72]], art.color, .074, { closed: true, fill: art.glass });
            line(ctx, [[-.22, -.19], [.17, -.55]], art.accent, .055);
            line(ctx, [[-.20, .04], [.22, -.32]], art.color, .04);
        });
    }
}

function drawSatellites(ctx, art) {
    const angle = art.motion * 1.06;
    ellipse(ctx, 0, 0, 1.42, .65, .43, art.color, .067);
    for (let i = 0; i < 4; i++) {
        const [x, y] = polar(angle + i * TAU / 4, 1.43);
        shape(ctx, x, y * .58, .18 + i * .025, 4, .78, art.color, .068, art.accent);
    }
    shape(ctx, 0, 0, .45, 4, .78, art.accent, .055);
}

function drawKnuckle(ctx, art) {
    const x = .45 + art.motion * .30;
    line(ctx, [[x - .25, -.42], [x - .05, -.68], [x + .33, -.73], [x + .55, -.49], [x + .60, .31],
        [x + .34, .56], [x - .02, .58], [x - .25, .41]], art.accent, .084, { closed: true, fill: art.glass });
    for (const y of [-.35, -.08, .20]) line(ctx, [[x + .06, y], [x + .52, y - .04]], art.color, .052);
    line(ctx, [[-1.29, -.52], [x - .29, -.40]], art.color, .105);
    line(ctx, [[-1.04, .45], [x - .35, .37]], art.accent, .057);
}

function drawFault(ctx, art) {
    const depth = 1.18 + art.motion * .39;
    line(ctx, [[-depth, .17], [-.72, .28], [-.42, -.26], [-.11, .38], [.22, -.48], [.49, .24], [depth, .05]],
        art.color, .115);
    line(ctx, [[-.44, -.26], [-.80, -.47], [-1.10, -.35]], art.accent, .066);
    line(ctx, [[.48, .24], [.76, .54], [1.13, .41]], art.accent, .062);
    shape(ctx, .20, -.62, .15, 3, .35, art.color, .039, art.glass);
}

function drawFangs(ctx, art) {
    const gap = .76 - art.motion * .30;
    for (const side of [-1, 1]) {
        line(ctx, [[-.72, side * (gap + .28)], [0, side * gap], [.62, side * (gap + .22)],
            [.38, side * (gap - .47)], [.10, side * (gap - .12)], [-.29, side * (gap - .18)]],
        art.color, .070, { closed: true, fill: art.glass });
        line(ctx, [[-.51, side * (gap + .17)], [-.16, side * (gap - .09)]], art.accent, .057);
    }
}

function drawBolt(ctx, art) {
    const span = 1.02 + art.motion * .34;
    line(ctx, [[-span, -.26], [-.31, -.61], [.01, -.32], [.33, -.65], [span, -.05], [.39, .07],
        [.57, .32], [-.44, .55], [-.16, .15], [-span, .12]], art.color, .082, { closed: true, fill: art.glass });
    line(ctx, [[-.72, .06], [-.20, -.09], [-.16, .11], [.54, -.19]], art.accent, .079);
}

function drawReactor(ctx, art) {
    const distance = 1.34 - art.motion * .54;
    for (let index = 0; index < 4; index++) {
        place(ctx, 0, 0, index * TAU / 4, () => {
            line(ctx, [[distance, -.44], [distance - .27, -.30], [distance - .39, 0],
                [distance - .27, .30], [distance, .44]], art.color, .112);
            rectangle(ctx, distance + .10, -.20, .105, .40, art.accent);
        });
    }
    shape(ctx, 0, 0, .37 + art.motion * .18, 4, 0, art.accent, .073, art.glass);
}

function drawTripline(ctx, art) {
    const length = 1.08 + art.motion * .33;
    for (const side of [-1, 1]) {
        const y = side * .31;
        ctx.setLineDash([.15, .10]);
        line(ctx, [[-length, y], [length, y]], art.accent, .073);
        ctx.setLineDash([]);
        shape(ctx, side * length, 0, .32, 6, .53, art.color, .071, art.glass);
    }
}

function drawRadiation(ctx, art) {
    const radius = 1.25 + art.motion * .34;
    for (let index = 0; index < 3; index++) {
        const angle = index * TAU / 3 - Math.PI / 2;
        line(ctx, [polar(angle, radius * .54), polar(angle - .35, radius), polar(angle + .35, radius)],
            art.color, .090, { closed: true, fill: art.glass });
    }
    arc(ctx, 0, 0, .26, art.accent, .074);
}

function drawGrave(ctx, art) {
    for (let index = -1; index <= 1; index++) {
        const x = index * .88;
        const y = Math.abs(index) * .28 + .10 - art.motion * .22;
        line(ctx, [[x - .32, y + .54], [x - .32, y - .29], [x, y - .63], [x + .32, y - .29], [x + .32, y + .54]],
            art.color, .072, { closed: true, fill: art.glass });
        line(ctx, [[x, y - .31], [x, y + .22]], art.accent, .052);
        line(ctx, [[x - .14, y - .11], [x + .14, y - .11]], art.accent, .052);
    }
    line(ctx, [[-1.46, .84], [1.46, .84]], art.color, .044);
}

function drawVenom(ctx, art) {
    for (let index = 0; index < 6; index++) {
        const angle = index * TAU / 6 - .32;
        const [x, y] = polar(angle, 1.09 + art.motion * (index % 2 ? .36 : .17));
        const radius = index % 2 ? .27 : .17;
        arc(ctx, x, y, radius, art.color, .068, 0, TAU, art.glass);
        arc(ctx, x - radius * .19, y - radius * .14, radius * .38, art.accent, .04, Math.PI, Math.PI * 1.62);
    }
}

function drawBriar(ctx, art) {
    const top = -.81 - art.motion * .19;
    line(ctx, [[0, top], [.87, -.59], [1.13, -.12], [.64, .13], [.76, .42], [0, .99], [-.76, .42], [-.64, .13],
        [-1.13, -.12], [-.87, -.59]], art.color, .091, { closed: true, fill: art.glass });
    line(ctx, [[-.62, -.32], [0, .54], [.62, -.32]], art.accent, .064);
    line(ctx, [[0, top + .24], [0, .54]], art.color, .053);
}

function drawScales(ctx, art) {
    for (let index = -2; index <= 2; index++) {
        const x = index * .53;
        const y = Math.sin(index + art.motion * 1.6) * .40;
        shape(ctx, x, y, .41 - Math.abs(index) * .051, 4, .10, art.color, .073, art.glass);
        line(ctx, [[x - .11, y], [x, y + .11], [x + .14, y]], art.accent, .056);
    }
}

function drawPixels(ctx, art) {
    const pixels = [[-1.01, -.44, .30], [-.55, -.91, .32], [.08, -.73, .29], [.61, -.50, .40],
        [.94, .15, .30], [.52, .70, .36], [-.28, .52, .32], [-.92, .47, .24]];
    pixels.forEach(([x, y, side], index) => {
        const spread = 1 + art.motion * (index % 2 ? .34 : .17);
        rectangle(ctx, x * spread, y * spread, side, side, index % 3 ? art.color : art.accent);
        if (index % 2) rectangle(ctx, x * spread + side * 1.2, y * spread + side * .58, side * .42, side * .42, art.accent);
    });
}

function drawSplinters(ctx, art) {
    for (let index = -2; index <= 2; index++) {
        const angle = index * .46;
        const tip = 1.16 + art.motion * .51 - Math.abs(index) * .13;
        place(ctx, -.33, 0, angle, () => {
            line(ctx, [[.13, -.16], [tip, -.08], [tip + .18, 0], [.49, .16]], art.color, .05,
                { closed: true, fill: index % 2 ? art.glass : art.accent });
        });
    }
}

function drawWeb(ctx, art) {
    const radius = 1.40 - art.motion * .31;
    const angle = -Math.PI * .5;
    for (const level of [.45, .72, 1]) shape(ctx, 0, 0, radius * level, 6, angle, art.color, .052);
    for (let index = 0; index < 6; index++) {
        const direction = angle + index * TAU / 6;
        line(ctx, [polar(direction, radius * .26), polar(direction, radius * 1.1)], art.accent, .044);
    }
}

function drawLeaves(ctx, art) {
    for (let index = 0; index < 3; index++) {
        const angle = index * TAU / 3 - .82;
        place(ctx, 0, 0, angle + art.motion * .19, () => {
            curve(ctx, [.35, 0], [.82, -.80], [1.40, -.27], art.color, .084);
            curve(ctx, [1.40, -.27], [1.13, .28], [.35, 0], art.color, .084);
            line(ctx, [[.56, -.02], [1.20, -.22]], art.accent, .059);
        });
    }
}

function drawPrism(ctx, art) {
    const radius = 1.10 - art.motion * .20;
    shape(ctx, 0, 0, radius, 3, -Math.PI / 2, art.color, .095, art.glass);
    shape(ctx, 0, 0, radius * .65, 3, Math.PI / 2, art.accent, .053);
    for (const side of [-1, 1]) {
        line(ctx, [[side * .48, -.10], [side * (1.42 + art.motion * .27), -.48 * side]], art.color, .062);
    }
}

function drawWings(ctx, art) {
    for (const side of [-1, 1]) {
        const wing = 1.52 + art.motion * .32;
        line(ctx, [[-.25, side * .17], [-.20, side * .58], [.17, side * wing], [-.52, side * wing * .81],
            [-.31, side * wing * .59], [-.66, side * .52], [-.56, side * .25]], art.color, .071,
        { closed: true, fill: art.glass });
        line(ctx, [[-.06, side * .55], [.10, side * wing * .80]], art.accent, .052);
    }
}

function drawEclipse(ctx, art) {
    const angle = art.motion * .82;
    const radius = 1.14;
    arc(ctx, 0, 0, radius, art.accent, .125, angle, angle + Math.PI - .11);
    arc(ctx, 0, 0, radius, art.color, .125, angle + Math.PI, angle + TAU - .11);
    for (const offset of [0, Math.PI]) {
        const [x, y] = polar(angle + offset, radius);
        arc(ctx, x, y, .20, art.accent, .064, 0, TAU, offset ? art.color : art.glass);
    }
}

function drawLasso(ctx, art) {
    const pull = 1 - art.motion * .27;
    ellipse(ctx, -.38 * pull, -.17, .74 * pull, .51, -.53, art.color, .099);
    ellipse(ctx, .39 * pull, .14, .73 * pull, .47, -.49, art.accent, .069);
    curve(ctx, [.80, .31], [1.20, .42], [1.39, .93], art.color, .09);
    for (const x of [-.20, .02, .23]) line(ctx, [[x - .05, -.19], [x + .06, .18]], art.accent, .054);
}

function drawHoneycomb(ctx, art) {
    const radius = .35;
    shape(ctx, 0, 0, radius, 6, .52, art.accent, .079, art.glass);
    for (let index = 0; index < 6; index++) {
        const [x, y] = polar(index * TAU / 6 + art.motion * .39, .77 + art.motion * .30);
        shape(ctx, x, y, radius, 6, .52, art.color, .063, art.glass);
    }
}

function drawStorm(ctx, art) {
    const height = 1.25 + art.motion * .29;
    line(ctx, [[.22, -height], [-.38, -.25], [.10, -.33], [-.45, .66], [.12, .20], [.01, .83]],
        art.accent, .105);
    line(ctx, [[-.23, -.51], [-.80, -.45], [-1.08, -.02]], art.color, .077);
    line(ctx, [[.12, .20], [.58, .07], [.85, .59]], art.color, .066);
}

function drawShards(ctx, art) {
    for (let index = -1; index <= 1; index++) {
        const offset = index * (.76 + art.motion * .18);
        place(ctx, offset, index * .12, index * .27, () => {
            line(ctx, [[-.28, -.39], [.13, -.90], [.33, -.20], [.23, .65], [-.23, .46]], art.accent,
                .066, { closed: true, fill: art.glass });
            line(ctx, [[.13, -.90], [-.06, -.19], [.23, .65]], art.color, .049);
        });
    }
}

function drawGears(ctx, art) {
    for (const side of [-1, 1]) {
        const x = side * (.68 + art.motion * .25);
        const angle = side * art.motion * 1.6;
        const points = Array.from({ length: 32 }, (_, index) => {
            const [dx, dy] = polar(angle + index * TAU / 32, index % 4 < 2 ? .59 : .49);
            return [x + dx, dy];
        });
        line(ctx, points, art.color, .063, { closed: true, fill: art.glass });
        arc(ctx, x, 0, .18, art.accent, .067);
    }
}

function drawShears(ctx, art) {
    const angle = .66 - art.motion * .19;
    for (const side of [-1, 1]) {
        place(ctx, 0, 0, side * angle, () => {
            line(ctx, [[-.45, -.15], [.89, -.12], [1.45, 0], [.77, .17], [-.45, .11]], art.color,
                .064, { closed: true, fill: art.glass });
            arc(ctx, -.79, -.06, .24, art.accent, .074);
        });
    }
    arc(ctx, 0, 0, .13, art.accent, .06, 0, TAU, art.color);
}

function drawTines(ctx, art) {
    const reach = .92 + art.motion * .36;
    line(ctx, [[-1.30, 0], [reach + .23, 0]], art.accent, .084);
    for (const side of [-1, 1]) {
        line(ctx, [[-.48, 0], [.05, side * .46], [reach, side * .46], [reach - .27, side * .26]], art.color, .077);
    }
    line(ctx, [[reach - .04, -.18], [reach + .23, 0], [reach - .04, .18]], art.accent, .069);
}

function drawLaser(ctx, art) {
    const tip = 1.32 + art.motion * .35;
    ellipse(ctx, -.32, 0, .26, .84, 0, art.color, .087);
    ellipse(ctx, -.10, 0, .16, .56, 0, art.accent, .056);
    line(ctx, [[-.06, 0], [tip, 0]], art.color, .16);
    line(ctx, [[.13, 0], [tip, 0]], art.accent, .064);
    line(ctx, [[tip - .24, -.24], [tip, 0], [tip - .24, .24]], art.color, .053);
}

function drawPhase(ctx, art) {
    const radius = 1.55 - art.motion * .48;
    for (let index = 0; index < 4; index++) {
        place(ctx, 0, 0, index * TAU / 4 + Math.PI / 4, () => {
            line(ctx, [[radius + .22, -.38], [radius - .16, 0], [radius + .22, .38]], art.color, .094);
            rectangle(ctx, radius + .25, -.058, .17, .116, art.accent);
        });
    }
}

function drawClamp(ctx, art) {
    const gap = .75 - art.motion * .29;
    for (const side of [-1, 1]) {
        line(ctx, [[-.75, side * .25], [-.52, side * gap], [.33, side * (gap + .16)], [.93, side * .46],
            [.69, side * .17], [.48, side * .33], [.24, side * .23]], art.color, .092);
        line(ctx, [[-.22, side * .30], [.16, side * .44]], art.accent, .077);
    }
}

function drawHook(ctx, art) {
    line(ctx, [[-1.28, -.08], [-.72, -.08], [-.53, .08], [-.18, .08]], art.color, .087);
    for (const x of [-1.13, -.75, -.38]) ellipse(ctx, x, 0, .19, .10, .3, art.accent, .058);
    const tip = .75 + art.motion * .37;
    line(ctx, [[-.11, -.02], [.24, -.49], [tip, -.37], [tip + .13, .31], [tip - .23, .62],
        [tip - .48, .45], [tip - .51, .18]], art.color, .100);
    line(ctx, [[tip - .47, .17], [tip - .33, .30]], art.accent, .078);
}

function drawRails(ctx, art) {
    const front = .97 + art.motion * .50;
    for (const side of [-1, 1]) line(ctx, [[-1.43, side * .42], [front, side * .42]], art.color, .096);
    for (let index = 0; index < 5; index++) {
        const x = -1.17 + index * .46;
        line(ctx, [[x, -.55], [x, .55]], art.accent, .062);
    }
    curve(ctx, [-.19, -.63], [-.47, -.83], [-.12, -1.03], art.color, .064);
    curve(ctx, [.33, -.58], [.11, -.84], [.42, -1.05], art.accent, .053);
}

function drawSnow(ctx, art) {
    const radius = 1.21 + art.motion * .22;
    for (let index = 0; index < 6; index++) {
        place(ctx, 0, 0, index * TAU / 6, () => {
            line(ctx, [[.18, 0], [radius, 0]], art.color, .080);
            line(ctx, [[radius - .51, -.31], [radius - .22, 0], [radius - .51, .31]], art.accent, .065);
        });
    }
    shape(ctx, 0, 0, .29, 6, 0, art.accent, .068);
}

function drawCoins(ctx, art) {
    for (let index = -1; index <= 1; index++) {
        const x = index * .83;
        const y = Math.abs(index) * .21 - .27;
        const width = .35 - (1 - art.motion) * Math.abs(index) * .075;
        line(ctx, [[x - width, y - .49], [x + width, y - .49], [x + width, y + .51], [x - width, y + .51]],
            art.color, .072, { closed: true, fill: art.glass });
        line(ctx, [[x - .18, y - .26], [x + .18, y - .26], [x - .10, y + .28]], art.accent, .087);
    }
}

function drawGloves(ctx, art) {
    const offset = .23 + art.motion * .38;
    for (const side of [-1, 1]) {
        place(ctx, offset * (side + 1), side * .54, side * .28, () => {
            line(ctx, [[-.56, -.16], [-.30, -.35], [.21, -.40], [.49, -.21], [.54, .17],
                [.34, .34], [-.15, .32], [-.30, .17], [-.56, .13]], art.color, .073, { closed: true, fill: art.glass });
            line(ctx, [[-.22, -.28], [-.10, .29]], art.accent, .076);
        });
    }
}

function drawPaint(ctx, art) {
    for (let index = -1; index <= 1; index++) {
        const y = index * .35;
        const end = .95 + art.motion * .40 - Math.abs(index) * .21;
        line(ctx, [[-1.19, y - .13], [-.26, y - .21], [end, y + .11], [end - .44, y + .21],
            [-.69, y + .10]], index ? art.color : art.accent, .05, { closed: true, fill: art.glass });
        arc(ctx, end + .13, y - .03, .09 + Math.abs(index) * .02, art.color, .046, 0, TAU, art.accent);
    }
}

function drawStone(ctx, art) {
    const separation = .04 + art.motion * .24;
    for (const side of [-1, 1]) {
        place(ctx, side * separation, 0, side * .11, () => {
            line(ctx, [[-.03, -.66], [side * .64, -.79], [side * 1.19, -.28], [side * 1.04, .50],
                [side * .35, .76], [.13 * side, .29], [-.12 * side, -.10]], art.color, .094,
            { closed: true, fill: art.glass });
            line(ctx, [[side * .40, -.40], [side * .61, -.19], [side * .89, -.17]], art.accent, .059);
        });
    }
}

function drawStars(ctx, art) {
    star(ctx, 0, -.24, .76 + art.motion * .13, 5, -Math.PI / 2, art.color, art.glass);
    star(ctx, -1.04, -.09, .35, 4, 0, art.accent, art.glass);
    star(ctx, .85, .44, .42, 4, .21, art.color, art.glass);
}

const MOTIFS = Object.freeze({
    mirrors: drawMirrors,
    satellites: drawSatellites,
    knuckle: drawKnuckle,
    fault: drawFault,
    fangs: drawFangs,
    bolt: drawBolt,
    reactor: drawReactor,
    tripline: drawTripline,
    radiation: drawRadiation,
    grave: drawGrave,
    venom: drawVenom,
    briar: drawBriar,
    scales: drawScales,
    pixels: drawPixels,
    splinters: drawSplinters,
    web: drawWeb,
    leaves: drawLeaves,
    prism: drawPrism,
    wings: drawWings,
    eclipse: drawEclipse,
    lasso: drawLasso,
    honeycomb: drawHoneycomb,
    storm: drawStorm,
    shards: drawShards,
    gears: drawGears,
    shears: drawShears,
    tines: drawTines,
    laser: drawLaser,
    phase: drawPhase,
    clamp: drawClamp,
    hook: drawHook,
    rails: drawRails,
    snow: drawSnow,
    coins: drawCoins,
    gloves: drawGloves,
    paint: drawPaint,
    stone: drawStone,
    stars: drawStars,
});
const UPRIGHT_MOTIFS = new Set(["radiation", "grave", "venom", "briar", "web", "prism", "storm", "coins", "stars"]);

function powerInk(color, dark) {
    if (!/^#[\da-f]{6}$/i.test(color)) return dark ? "#f2f6ff" : "#364c66";
    if (dark) return color;
    const channels = [1, 3, 5].map((index) => Math.round(Number.parseInt(color.slice(index, index + 2), 16) * .57));
    return `rgb(${channels.join(", ")})`;
}

// A compact piece of move art at the existing cast or hit position. World
// geometry and damage come from the common combat renderer and simulation.
export function drawClassicLegacyPowerMotif(ctx, {
    motif, color, x, y, radius = 42, angle = 0, phase = "active", progress = 0,
    reducedMotion = false, flashReduction = false, dark = true,
} = {}) {
    if (!Object.hasOwn(MOTIFS, motif) || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 0) return false;
    const draw = MOTIFS[motif];
    const t = clampUnit(Number(progress) || 0);
    const charging = phase === "charge" || phase === "tell" || phase === "windup";
    const retiring = phase === "recovery" || phase === "recover";
    const motion = reducedMotion ? .46 : 1 - (1 - t) ** 2;
    const scale = radius * (charging ? .84 + motion * .20 : 1.02 + motion * .16);
    const opacity = charging ? .52 + t * .34 : retiring ? (1 - t) * .63 : .91 - t * .24;
    const ink = powerInk(color, dark);
    ctx.save();
    ctx.translate(x, y);
    if (!UPRIGHT_MOTIFS.has(motif)) ctx.rotate(Number.isFinite(angle) ? angle : 0);
    ctx.scale(scale, scale);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.globalAlpha *= opacity * (flashReduction ? .60 : 1);
    draw(ctx, {
        color: ink,
        accent: dark ? "#f6f8ff" : "#253142",
        glass: dark ? "#101424" : "#ebedf2",
        motion,
    });
    ctx.restore();
    return true;
}
