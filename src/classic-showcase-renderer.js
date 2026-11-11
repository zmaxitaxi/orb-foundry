import { CLASSIC_SHOWCASE_FIGHTERS } from "./classic-showcase.js?v=20261110-shared-lunge2";

const TAU = Math.PI * 2;
const limit = (value) => Math.max(0, Math.min(1, value));

function path(ctx, points, fill, stroke = null, width = 1) {
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}

function disc(ctx, x, y, radius, fill, stroke = null, width = 1) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(.1, radius), 0, TAU);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}

function line(ctx, x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function card(ctx, x, y, r, angle, charged = true) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = "#211725";
    ctx.fillRect(-r * .61, -r * .87, r * 1.22, r * 1.74);
    ctx.fillStyle = "#fff5ee";
    ctx.fillRect(-r * .48, -r * .74, r * .96, r * 1.48);
    path(ctx, [[0, -r * .45], [r * .29, 0], [0, r * .45], [-r * .29, 0]], charged ? "#f148c5" : "#30273a");
    line(ctx, -r * .31, -r * .58, -r * .14, -r * .58, "#ff80df", r * .10);
    line(ctx, r * .14, r * .58, r * .31, r * .58, "#ff80df", r * .10);
    ctx.restore();
}

function paper(ctx, x, y, r, angle, form = "plane") {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    if (form === "plane") {
        path(ctx, [[r * 1.65, 0], [-r * 1.2, -r * .9], [-r * .65, 0], [-r * 1.2, r * .9]], "#fff3d4", "#756b62", r * .07);
        path(ctx, [[r * 1.65, 0], [-r * .65, 0], [-r * 1.2, r * .9]], "#c2c9d5");
        line(ctx, -r * 1.2, -r * .9, r * 1.65, 0, "#fffdf7", r * .08);
    } else if (form === "crane") {
        path(ctx, [[r * 1.45, 0], [r * .35, -r * .25], [-r * .15, -r * 1.2], [-r * .42, -.1 * r],
            [-r * 1.38, r * .45], [-r * .17, r * .3], [r * .18, r * .98]], "#fff3d4", "#958879", r * .07);
        line(ctx, -r * .15, -r * 1.2, r * .18, r * .98, "#c0c5cf", r * .08);
    } else {
        path(ctx, [[-r, -r * .7], [r * .3, -r * .33], [r, r * .7], [r * .03, r * .27], [-r * .7, r]], "#fff2d2", "#9e968d", r * .08);
        line(ctx, -r, -r * .7, r * .03, r * .27, "#c0c6d0", r * .09);
    }
    ctx.restore();
}

function runeRing(ctx, x, y, r, angle, color, strength = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha *= strength;
    disc(ctx, 0, 0, r, null, color, Math.max(1, r * .035));
    disc(ctx, 0, 0, r * .82, null, color, Math.max(1, r * .015));
    path(ctx, Array.from({ length: 6 }, (_, i) => [Math.cos(i * TAU / 6) * r * .72, Math.sin(i * TAU / 6) * r * .72]), null, color, Math.max(1, r * .023));
    for (let i = 0; i < 12; i += 1) {
        const a = i * TAU / 12;
        line(ctx, Math.cos(a) * r * .91, Math.sin(a) * r * .91, Math.cos(a + .08) * r * .98, Math.sin(a + .08) * r * .98, "#ffe2a0", Math.max(1, r * .022));
    }
    ctx.restore();
}

export function drawClassicShowcaseBody(ctx, fighter, time, options = {}) {
    const def = CLASSIC_SHOWCASE_FIGHTERS[fighter.type];
    if (!def) return;
    const r = fighter.radius;
    const move = fighter.classicShowcase?.move;
    const phase = move ? limit((time - move.at) / Math.max(.01, move.activeAt - move.at)) : 0;
    const motion = options.reducedMotion ? 0 : time;
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (fighter.type === "origami" && move?.key === "paper-plane" && move.phase === "active") {
        paper(ctx, 0, 0, r * 1.04, Math.atan2(fighter.vy, fighter.vx));
        ctx.restore();
        return;
    }
    if (fighter.type === "rubber") {
        const stretch = move?.phase === "tell" && move.key === "wall-sling" ? 1 + phase * .45
            : move?.phase === "active" && move.key === "wall-sling" ? 1.45 : 1;
        ctx.rotate(Math.atan2(fighter.vy, fighter.vx));
        ctx.scale(stretch, 1 / Math.sqrt(stretch));
        disc(ctx, 0, 0, r, def.color, "#fff0d0", r * .08);
        ctx.strokeStyle = "#f7af79";
        ctx.lineWidth = r * .18;
        ctx.beginPath(); ctx.arc(0, 0, r * .71, -1.4, -.2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r * .71, 1.7, 2.8); ctx.stroke();
    } else if (fighter.type === "magneto") {
        path(ctx, [[-r * 1.3, r], [-r * .85, -r * .6], [r * .85, -r * .6], [r * 1.3, r]], "#4d224e", "#a364b8", r * .05);
        disc(ctx, 0, 0, r, def.color, "#eac6f7", r * .075);
        ctx.strokeStyle = "#b88ce2"; ctx.lineWidth = r * .21;
        ctx.beginPath(); ctx.arc(0, 0, r * .82, -Math.PI, 0); ctx.stroke();
        path(ctx, [[-r * .98, -.38 * r], [-r * .70, -.33 * r], [-r * .55, r * .75], [-r * .89, r * .44]], "#b88ce2");
        path(ctx, [[r * .98, -.38 * r], [r * .70, -.33 * r], [r * .55, r * .75], [r * .89, r * .44]], "#b88ce2");
        disc(ctx, r * (1.05 + phase * .25), -r * (.1 + phase * .7), r * .25, "#ae77ca", "#f6c4ff", r * .07);
    } else if (fighter.type === "kratos") {
        disc(ctx, 0, 0, r, "#c5b9ad", "#efe6de", r * .075);
        path(ctx, [[-r * .7, -r * .86], [-r * .34, -r], [-r * .08, r * .52], [-r * .42, r * .7]], "#9e3033");
        path(ctx, [[-r * .57, r * .57], [0, r * .78], [r * .59, r * .55], [r * .3, r * .99], [-r * .3, r * .99]], "#4c3b33");
        line(ctx, -r * .66, -r * .58, -r * .82, r * .22, "#745136", r * .16);
        if (!move || move.phase === "tell") {
            for (const side of [-1, 1]) {
                const x = side * r * 1.13;
                const rise = move?.key === "chaos-chain" ? phase * r * .6 : Math.sin(motion * 2 + side) * r * .08;
                line(ctx, side * r * .76, r * .38, x, -r * .14 - rise, "#b18a61", r * .12);
                path(ctx, [[x - side * r * .12, -r * .13 - rise], [x + side * r * .51, -r * .78 - rise],
                    [x + side * r * .61, -r * .18 - rise], [x, r * .20 - rise]], "#d4c7a7", "#ffb16b", r * .065);
            }
        }
    } else if (fighter.type === "doctor-strange") {
        path(ctx, [[-r * 1.3, r], [-r * 1.08, -r * .9], [-r * .58, -r * .62], [r * .58, -r * .62], [r * 1.08, -r * .9], [r * 1.3, r]], "#942d35", "#e56856", r * .06);
        disc(ctx, 0, 0, r, def.color, "#c7dcff", r * .065);
        path(ctx, [[-r * .9, -r * .56], [-r * .45, -r * .99], [r * .4, -r], [r * .84, -r * .56]], "#302e37");
        line(ctx, -r * .82, -r * .62, -r * .56, -r * .78, "#d7d5d2", r * .14);
        line(ctx, r * .82, -r * .62, r * .56, -r * .78, "#d7d5d2", r * .14);
        disc(ctx, 0, r * .74, r * .19, "#b6e89e", "#dbb65e", r * .06);
        if (move?.phase === "tell") runeRing(ctx, r * 1.3, -r * .3, r * (.25 + phase * .38), motion, "#ffc56b");
    } else if (fighter.type === "gambit") {
        path(ctx, [[-r * 1.16, r * .72], [-r * .8, -r * .54], [r * .8, -r * .54], [r * 1.16, r * .72]], "#765044", "#c09371", r * .06);
        disc(ctx, 0, 0, r, "#653349", "#ef9ed6", r * .075);
        path(ctx, [[-r * .95, -.44 * r], [-r * .62, -.97 * r], [-r * .07, -r * .85], [r * .15, -r * 1.07], [r * .81, -r * .74], [r * .97, -.42 * r]], "#49332d");
        line(ctx, -r * .6, r * .73, r * .6, r * .73, "#d465bd", r * .17);
        if (!move || move.phase === "tell") {
            line(ctx, -r * 1.2, -r * 1.7, -r * 1.2, r * 1.65, "#b89574", r * .15);
            disc(ctx, -r * 1.2, r * .36, r * .20, "#a87760");
        }
        if (move?.phase === "tell") for (let i = 0; i < 3; i += 1) card(ctx, r * 1.15, -r * .4, r * .29, -.4 + i * .32);
    } else if (fighter.type === "pinball") {
        disc(ctx, 0, 0, r, "#68809e", "#e7f8ff", r * .085);
        ctx.strokeStyle = "#cfecf4"; ctx.lineWidth = r * .22;
        ctx.beginPath(); ctx.arc(0, 0, r * .72, -2.9 + Math.sin(motion * 2) * .3, -1.4); ctx.stroke();
        path(ctx, [[r * .63, r * .22], [r * .87, r * .45], [r * .5, r * .77]], "#364557");
        const combo = fighter.classicShowcase?.combo || 0;
        for (let i = 0; i < combo; i += 1) disc(ctx, (i - (combo - 1) / 2) * r * .24, r * .77, r * .07, "#ffdd6e");
    } else if (fighter.type === "origami") {
        path(ctx, [[-r * .94, -r * .34], [-r * .4, -r], [r * .6, -r * .84], [r, r * .12], [r * .34, r], [-r * .73, r * .7]], "#f0e0bf", "#fff5db", r * .075);
        line(ctx, -r * .4, -r, r * .34, r, "#b3b7bb", r * .065);
        line(ctx, -r * .94, -r * .34, r, r * .12, "#b3b7bb", r * .065);
        path(ctx, [[-r * .94, -r * .34], [-r * .4, -r], [-r * .24, -r * .21]], "#fff9e4");
        path(ctx, [[r * .34, r], [r, r * .12], [r * .34, r * .27]], "#b5bfce");
        if (move?.phase === "tell") {
            ctx.strokeStyle = "#fff6d9"; ctx.lineWidth = r * .08;
            ctx.beginPath(); ctx.arc(0, 0, r * (1.3 - phase * .15), -.8 + phase, .9 + phase); ctx.stroke();
        }
    } else if (fighter.type === "sand-pharaoh") {
        path(ctx, [[-r * 1.24, r * .65], [-r * .91, -r * .75], [-r * .36, -r * 1.1], [r * .36, -r * 1.1], [r * .91, -r * .75], [r * 1.24, r * .65]], "#d6ac54", "#ffe296", r * .07);
        for (const side of [-1, 1]) for (let i = 0; i < 3; i += 1) {
            line(ctx, side * r * (.8 + i * .1), r * (-.4 + i * .34), side * r * (1.02 + i * .06), r * (-.45 + i * .34), "#254c70", r * .14);
        }
        disc(ctx, 0, 0, r * .88, "#b99a66", "#f9d797", r * .055);
        path(ctx, [[-r * .13, -r * .84], [0, -r * 1.2], [r * .13, -r * .84]], "#59c6be");
        line(ctx, -r * .43, r * .67, r * .43, r * .67, "#825e37", r * .11);
        if (!move || move.phase === "tell") {
            line(ctx, r * 1.2, -r * .8, r * 1.2, r * 1.65, "#c6a15a", r * .13);
            ctx.strokeStyle = "#ffe3a0"; ctx.lineWidth = r * .17;
            ctx.beginPath(); ctx.arc(r * 1.03, -r * .87, r * .34, -.2, Math.PI * 1.35); ctx.stroke();
        }
    }
    ctx.restore();
}

function drawShowcaseTell(ctx, fighter, move, time, options) {
    const r = fighter.radius;
    const def = CLASSIC_SHOWCASE_FIGHTERS[fighter.type];
    const p = limit((time - move.at) / (move.activeAt - move.at));
    ctx.save();
    ctx.globalAlpha = .35 + p * .5;
    if (move.key === "rail-spear") {
        const a = move.angle + Math.PI / 2;
        ctx.setLineDash([r * .35, r * .22]);
        for (let i = -1; i <= 1; i += 1) line(ctx,
            move.origin.x + Math.cos(a) * i * r * 1.7, move.origin.y + Math.sin(a) * i * r * 1.7,
            move.mark.x + Math.cos(move.angle) * r * 5 + Math.cos(a) * i * r * 1.7,
            move.mark.y + Math.sin(move.angle) * r * 5 + Math.sin(a) * i * r * 1.7, def.accent, r * .055);
    } else if (move.key === "iron-halo") {
        for (let i = 0; i < 5; i += 1) {
            const a = i * TAU / 5 + p * .35;
            const distance = r * (4 - p * 1.7);
            ctx.save(); ctx.translate(fighter.x + Math.cos(a) * distance, fighter.y + Math.sin(a) * distance); ctx.rotate(a + .4);
            path(ctx, [[-r * .26, -r * .65], [r * .28, -r * .5], [r * .24, r * .65], [-r * .2, r * .54]], "#a4a7c0", def.accent, r * .055);
            ctx.restore();
        }
    } else if (move.key === "sling-ring" || move.key === "mirror-mandala") {
        runeRing(ctx, fighter.x, fighter.y, r * (1.6 + p), options.reducedMotion ? 0 : p * 1.2, def.accent, .9);
        if (move.key === "sling-ring") for (const point of move.portals || []) {
            disc(ctx, point.x, point.y, r * 1.25, null, "#ffc56b", r * .06);
        }
    } else if (move.key === "royal-flush") {
        for (const point of move.nodes || []) card(ctx, point.x, point.y, r * .44, point.angle);
    } else if (move.key === "mirage-step") {
        disc(ctx, move.exit.x, move.exit.y, r * 1.45, null, def.accent, r * .07);
        line(ctx, move.exit.x - r * .7, move.exit.y, move.exit.x + r * .7, move.exit.y, "#ffedb4", r * .06);
        for (let i = 0; i < 5; i += 1) {
            const a = i * TAU / 5 + p * .6;
            const distance = r * (1.8 - p * .5);
            path(ctx, [[move.exit.x + Math.cos(a) * distance, move.exit.y + Math.sin(a) * distance - r * .12],
                [move.exit.x + Math.cos(a) * distance + r * .16, move.exit.y + Math.sin(a) * distance + r * .12],
                [move.exit.x + Math.cos(a) * distance - r * .16, move.exit.y + Math.sin(a) * distance + r * .12]], "#e8bb66");
        }
    } else if (move.key === "bumper-run") {
        for (const point of move.nodes || []) disc(ctx, point.x, point.y, r * 1.05, null, "#9effe4", r * .06);
    } else if (["chaos-chain", "leviathan", "bo-staff", "elastic-fist", "paper-plane"].includes(move.key)) {
        const reach = r * (1.7 + p * .9);
        line(ctx, fighter.x + Math.cos(move.angle) * r, fighter.y + Math.sin(move.angle) * r,
            fighter.x + Math.cos(move.angle) * reach, fighter.y + Math.sin(move.angle) * reach, def.accent, r * .10);
    }
    ctx.restore();
}

function drawShowcasePose(ctx, pose, fighter, move, options) {
    const r = fighter.radius;
    const def = CLASSIC_SHOWCASE_FIGHTERS[fighter.type];
    if (pose.shape === "ring") {
        runeRing(ctx, pose.x, pose.y, pose.radius, options.reducedMotion ? 0 : pose.angle, def.accent);
        return;
    }
    if (pose.shape === "slam") {
        for (let i = 0; i < 8; i += 1) {
            const a = i * TAU / 8;
            line(ctx, pose.x + Math.cos(a) * r, pose.y + Math.sin(a) * r,
                pose.x + Math.cos(a) * pose.radius, pose.y + Math.sin(a) * pose.radius, "#ffb275", r * .14);
        }
        return;
    }
    if (["body-dash", "paper-dash"].includes(pose.shape)) return;
    const dx = pose.x2 - pose.x1;
    const dy = pose.y2 - pose.y1;
    const length = Math.hypot(dx, dy);
    ctx.save();
    ctx.translate(pose.x1, pose.y1);
    ctx.rotate(Math.atan2(dy, dx));
    if (pose.shape === "rail") {
        path(ctx, [[0, -pose.width * .35], [length - r, -pose.width * .43], [length, 0], [length - r, pose.width * .43], [0, pose.width * .35]], "#c4cadd", def.accent, r * .065);
        line(ctx, 0, 0, length - r * .5, 0, "#fff7ff", r * .07);
    } else if (pose.shape === "chain") {
        line(ctx, 0, 0, length, 0, "#513c32", r * .23);
        const links = Math.max(2, Math.floor(length / (r * .24)));
        for (let i = 0; i <= links; i += 1) {
            ctx.strokeStyle = i % 2 ? "#d0b390" : "#8f7968";
            ctx.lineWidth = r * .07;
            ctx.beginPath(); ctx.ellipse(length * i / links, 0, r * .15, r * .1, 0, 0, TAU); ctx.stroke();
        }
        path(ctx, [[length - r * .8, -r * .24], [length + r * .66, -r * .64],
            [length + r * .31, r * .13], [length - r * .55, r * .55]], "#d2b48a", "#ff9f60", r * .09);
        line(ctx, length - r * .5, -r * .13, length + r * .37, -r * .42, "#fff0b5", r * .09);
    } else if (pose.shape === "fist") {
        line(ctx, 0, 0, length, 0, "#713f31", pose.width);
        line(ctx, 0, 0, length, 0, "#ed9a69", pose.width * .72);
        ctx.fillStyle = "#f6bf89";
        ctx.beginPath(); ctx.ellipse(length, 0, pose.width * .48, pose.width * .5, 0, 0, TAU); ctx.fill();
        for (let i = -1; i <= 1; i += 1) line(ctx, length + pose.width * .08, i * pose.width * .21,
            length + pose.width * .31, i * pose.width * .21, "#935a3b", r * .055);
    } else if (pose.shape === "staff") {
        line(ctx, -r * 2.1, 0, length, 0, "#402a24", pose.width);
        line(ctx, -r * 2.1, -pose.width * .12, length, -pose.width * .12, "#d3ad83", pose.width * .55);
        for (const x of [-r * 2.1, length - r * .35]) line(ctx, x, 0, x + r * .35, 0, "#f17ada", pose.width * 1.05);
    } else if (pose.shape === "khopesh") {
        line(ctx, 0, 0, length - r * .8, 0, "#775438", r * .22);
        ctx.strokeStyle = "#ffe1a0"; ctx.lineWidth = r * .27;
        ctx.beginPath(); ctx.arc(length - r * .6, -r * .35, r * .62, -.7, 2.1); ctx.stroke();
        line(ctx, 0, -r * .08, length - r * 1.1, -r * .08, "#d4ae63", r * .06);
    }
    ctx.restore();
}

function drawShowcaseEntity(ctx, entity, sim, options) {
    const owner = sim.fighters.find((f) => f.id === entity.ownerId);
    if (!owner) return;
    const r = owner.radius;
    const time = options.reducedMotion ? entity.at : sim.time;
    const age = Math.max(0, sim.time - entity.at);
    const color = CLASSIC_SHOWCASE_FIGHTERS[owner.type].accent;
    ctx.save();
    if (entity.kind === "sling-portal") {
        for (const [index, point] of [entity, entity.exit].entries()) {
            const scale = Math.min(1, age / .15, Math.max(0, entity.expiresAt - sim.time) / .22);
            disc(ctx, point.x, point.y, entity.radius * scale, "#0c0c14", "#c16c2a", r * .15);
            disc(ctx, point.x, point.y, entity.radius * scale * .92, null, "#ffd083", r * .065);
            const spin = time * (index ? -1.3 : 1.3);
            path(ctx, Array.from({ length: 3 }, (_, i) => [
                point.x + Math.cos(spin + i * TAU / 3) * entity.radius * .65 * scale,
                point.y + Math.sin(spin + i * TAU / 3) * entity.radius * .65 * scale,
            ]), null, "#a8733b", r * .04);
            for (let i = 0; i < 8; i += 1) {
                const a = time * 2 + i * TAU / 8;
                line(ctx, point.x + Math.cos(a) * entity.radius, point.y + Math.sin(a) * entity.radius,
                    point.x + Math.cos(a + .12) * entity.radius * 1.17, point.y + Math.sin(a + .12) * entity.radius * 1.17, "#ffe6b3", r * .05);
            }
        }
    } else if (entity.kind === "bumper") {
        const lit = sim.time < (entity.litUntil || 0);
        disc(ctx, entity.x, entity.y, entity.radius, "#1d343b", lit ? "#fff0a6" : "#9effe4", r * .12);
        disc(ctx, entity.x, entity.y, entity.radius * .65, lit ? "#fff0a6" : "#476970", "#b7e8e1", r * .06);
        ctx.save(); ctx.translate(entity.x, entity.y); ctx.rotate(Math.PI / 4);
        path(ctx, [[-r * .3, -r * .3], [r * .3, -r * .3], [r * .3, r * .3], [-r * .3, r * .3]], lit ? "#24313a" : "#a7ddca");
        ctx.restore();
    } else if (entity.kind === "sand-shell") {
        ctx.globalAlpha = Math.min(.54, (entity.expiresAt - sim.time) * .7);
        disc(ctx, entity.x, entity.y, entity.radius, "#bd9659", "#ffe1a0", r * .06);
        line(ctx, entity.x - r * .33, entity.y - r * .7, entity.x + r * .11, entity.y, "#523d2b", r * .07);
        line(ctx, entity.x + r * .11, entity.y, entity.x - r * .2, entity.y + r * .7, "#523d2b", r * .07);
        line(ctx, entity.x + r * .11, entity.y, entity.x + r * .7, entity.y + r * .25, "#523d2b", r * .06);
    } else if (entity.kind === "charged-card") {
        card(ctx, entity.x, entity.y, r * .48, entity.phase === "armed" ? entity.angle : time * 13);
        if (entity.phase === "armed") {
            const p = limit(1 - (entity.armedAt - sim.time) / 1.05);
            ctx.globalAlpha = .25 + p * .6;
            ctx.strokeStyle = "#ff75db";
            ctx.lineWidth = r * (.045 + p * .035);
            for (let i = 0; i < 4; i += 1) {
                const a = i * Math.PI / 2 + .18;
                ctx.beginPath(); ctx.arc(entity.x, entity.y, entity.blastRadius, a, a + .48); ctx.stroke();
            }
            disc(ctx, entity.x, entity.y, r * .18, "#fff0fb");
        }
    } else if (entity.kind === "chaos-axe") {
        ctx.translate(entity.x, entity.y); ctx.rotate(time * 14);
        line(ctx, -r * .7, 0, r * .85, 0, "#986d49", r * .20);
        path(ctx, [[r * .4, -r * .8], [r * 1.13, -r * .55], [r * .66, r * .04], [r * .94, r * .69], [r * .29, r * .8]], "#d9edf0", "#90dfff", r * .08);
        line(ctx, r * .7, -r * .56, r * .46, r * .52, "#b2eeff", r * .07);
    } else if (entity.kind === "paper-boomerang") {
        paper(ctx, entity.x, entity.y, r * .72, time * 11, "boomerang");
    } else if (entity.kind === "paper-crane") {
        paper(ctx, entity.x, entity.y, r * .48, entity.angle + Math.sin(time * 14) * .10, "crane");
    } else if (entity.kind === "scarab") {
        ctx.translate(entity.x, entity.y); ctx.rotate(entity.angle);
        const wing = .8 + Math.sin(time * 21) * .18;
        path(ctx, [[0, 0], [-r * .15, -r * .65 * wing], [r * .45, -r * .34]], "#b9a055", "#ffe3a0", r * .04);
        path(ctx, [[0, 0], [-r * .15, r * .65 * wing], [r * .45, r * .34]], "#b9a055", "#ffe3a0", r * .04);
        disc(ctx, 0, 0, entity.radius, "#2d7377", "#f3cb6e", r * .06);
        line(ctx, 0, -entity.radius * .7, 0, entity.radius * .7, "#eecf7f", r * .05);
    } else {
        ctx.translate(entity.x, entity.y); ctx.rotate(entity.angle);
        const metal = entity.kind === "metal-shard";
        path(ctx, [[r * .7, 0], [-r * .45, -r * .28], [-r * .2, 0], [-r * .45, r * .28]], metal ? "#c9c6da" : "#ffe4a5", color, r * .06);
        line(ctx, -r * 1.25, 0, -r * .35, 0, color, r * .12);
    }
    ctx.restore();
}

function drawShowcaseImpact(ctx, effect, options) {
    const p = limit(1 - effect.life / effect.maxLife);
    const r = effect.radius;
    ctx.save();
    ctx.translate(effect.x, effect.y);
    ctx.rotate(effect.angle);
    ctx.globalAlpha = (1 - p) * (options.flashReduction ? .55 : .9);
    if (effect.move === "charged-deck" || effect.move === "royal-flush") {
        const size = r * (1 + p * 1.5);
        path(ctx, [[0, -size], [size * .68, 0], [0, size], [-size * .68, 0]], null, "#ff9bea", r * .12);
        for (let i = 0; i < 4; i += 1) {
            const a = i * Math.PI / 2;
            card(ctx, Math.cos(a) * size, Math.sin(a) * size, r * .22, a + p);
        }
    } else if (effect.fighterType === "doctor-strange") {
        if (effect.phase === "warp") {
            ctx.strokeStyle = "#ffd18b"; ctx.lineWidth = r * .10;
            for (const a of [-.7, 1.5]) {
                ctx.beginPath(); ctx.arc(0, 0, r * (1 + p * .8), a + p, a + p + .7); ctx.stroke();
            }
        } else runeRing(ctx, 0, 0, r * (1.2 + p * 1.3), p * 1.2, "#ffd18b");
    } else if (effect.fighterType === "sand-pharaoh") {
        for (let i = 0; i < 10; i += 1) {
            const a = i * 2.39996;
            const distance = r * (p * (1.2 + (i % 3) * .4));
            const size = r * (.08 + (i % 2) * .05) * (1 - p);
            path(ctx, [[Math.cos(a) * distance - size, Math.sin(a) * distance],
                [Math.cos(a) * distance, Math.sin(a) * distance - size],
                [Math.cos(a) * distance + size, Math.sin(a) * distance + size]], "#eec681");
        }
    } else {
        const sides = effect.fighterType === "pinball" ? 8 : effect.fighterType === "origami" ? 3 : 6;
        const points = Array.from({ length: sides * 2 }, (_, i) => {
            const a = i * Math.PI / sides;
            const size = r * (i % 2 ? .5 : 1.3 + p * 1.7);
            return [Math.cos(a) * size, Math.sin(a) * size];
        });
        path(ctx, points, null, effect.color, r * .11);
    }
    ctx.restore();
}

export function drawClassicShowcaseStage(ctx, sim, options = {}) {
    for (const fighter of sim.fighters) {
        if (!fighter.alive || !fighter.classicShowcase) continue;
        const move = fighter.classicShowcase.move;
        const r = fighter.radius;
        if (move?.key === "wall-sling" && sim.time < move.endAt) {
            ctx.save();
            ctx.lineCap = "round";
            line(ctx, move.anchor.x, move.anchor.y, fighter.x, fighter.y, "#703d2c", r * .50);
            line(ctx, move.anchor.x, move.anchor.y, fighter.x, fighter.y, "#f3ad77", r * .32);
            disc(ctx, move.anchor.x, move.anchor.y, r * .28, "#ffd9a0");
            ctx.restore();
        }
        if (move?.phase === "tell") drawShowcaseTell(ctx, fighter, move, sim.time, options);
        if (move?.phase === "active") {
            for (const pose of move.pose || []) drawShowcasePose(ctx, pose, fighter, move, options);
            if (move.key === "iron-halo" && sim.time < fighter.classicShowcase.guardUntil) {
                for (let i = 0; i < 5; i += 1) {
                    const a = i * TAU / 5 + (options.reducedMotion ? 0 : sim.time * 2);
                    ctx.save(); ctx.translate(fighter.x + Math.cos(a) * r * 2, fighter.y + Math.sin(a) * r * 2); ctx.rotate(a);
                    path(ctx, [[-r * .19, -r * .63], [r * .21, -r * .5], [r * .23, r * .62], [-r * .16, r * .52]], "#a8aac1", "#f3a0ff", r * .07);
                    ctx.restore();
                }
            }
        }
    }
    for (const entity of sim.classicShowcaseEntities || []) drawShowcaseEntity(ctx, entity, sim, options);
    for (const effect of sim.effects) {
        const life = effect.life - (options.classicResultAge || 0);
        if (effect.kind === "classic-showcase-impact" && life > 0) drawShowcaseImpact(ctx, { ...effect, life }, options);
    }
}
