import { CLASSIC_LEGACY_POWERS } from "./classic-legacy-powers.js?v=20261109-classic-signature2";

const power = (profile) => Object.freeze(profile);

export const CLASSIC_POWER_MOVES = Object.freeze({
    ...CLASSIC_LEGACY_POWERS,
    sword: power({
        name: "Slipstream", color: "#ffe293", kind: "rush", anchor: "self",
        ready: 1.25, chaseAt: 4.65, windup: .24, duration: .34,
        damage: 17, size: 11, width: .48, speed: 3.04, evade: true, tone: 480,
    }),
    "blue-sun": power({
        name: "Solar Prominence", color: "#80eaff", kind: "ring", layout: "solar", anchor: "self",
        ready: 6.3, windup: .65, duration: .66,
        damage: 28, size: 12.2, width: 1.16, force: 1.45, tone: 173,
    }),
    "black-hole": power({
        name: "Binary Crush", color: "#bd8aff", kind: "orbit", layout: "collapse", anchor: "target",
        ready: 6.85, windup: .68, duration: .82, count: 2, gravity: true,
        damage: 34, size: 6.4, width: 2.28, force: 1.86, tone: 73,
    }),
    pistol: power({
        name: "Ricochet Relay", color: "#ffc278", kind: "lanes", layout: "relay", anchor: "target",
        ready: 5.55, windup: .56, duration: .62, count: 2,
        damage: 24, size: 8.8, width: .86, spread: 3.4, tone: 715,
    }),
    shotgun: power({
        name: "Breach Wave", color: "#ffbe68", kind: "ring", layout: "cone", anchor: "self",
        ready: 5.9, windup: .35, duration: .42, range: 8.8,
        damage: 27, size: 8.3, width: 1.5, force: 1.9, tone: 96,
    }),
    rifle: power({
        name: "Suppressing Grid", color: "#bbdcff", kind: "lanes", layout: "grid", anchor: "target",
        ready: 6.4, windup: .66, duration: .80, count: 3,
        damage: 29, size: 22, width: .89, spread: 2.24, status: "scramble", tone: 312,
    }),
    sniper: power({
        name: "Dead Drop", color: "#7af2ff", kind: "zones", layout: "drop", anchor: "target",
        ready: 6.7, windup: .70, duration: .56,
        damage: 31, size: 2.7, force: 1.41, tone: 619,
    }),
    draftmaster: power({
        name: "Crosscut", color: "#b2d7ff", kind: "lanes", layout: "cross", anchor: "target",
        ready: 6.0, windup: .55, duration: .67, count: 2,
        damage: 26, size: 12, width: 1.10, spread: 1.46, tone: 382,
    }),
    turret: power({
        name: "Battery Sweep", color: "#ff9d4f", kind: "lanes", layout: "bastion", anchor: "target",
        ready: 7.3, windup: .58, duration: .84, count: 3,
        damage: 25, size: 16, width: 1.0, tone: 260,
    }),
    commander: power({
        name: "Pincer Order", color: "#ffd77d", kind: "zones", layout: "line", anchor: "target",
        ready: 7.1, windup: .65, duration: .96, count: 3, deployed: true,
        damage: 29, size: 1.86, spread: 4.5, force: 1.36, tone: 239,
    }),
});
