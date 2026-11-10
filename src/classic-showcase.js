// Move metadata is shared by the fixed-step simulation, renderer, and HUD.
// Timers and contact geometry remain in simulation.js.
const move = (name, tell, duration, cooldown, extra = {}) => Object.freeze({
    name, tell, duration, cooldown, ...extra,
});

export const CLASSIC_SHOWCASE_MOVES = Object.freeze({
    "iron-halo": move("IRON HALO", .58, 1.55, 2.15),
    "rail-spear": move("RAIL SPEAR", .70, .74, 2.35),
    "chaos-chain": move("BLADES OF CHAOS", .30, 1.18, 1.55),
    "leviathan": move("LEVIATHAN RETURN", .42, 1.48, 1.85),
    "sling-ring": move("SLING RING", .52, 1.32, 2.10),
    "mirror-mandala": move("MIRROR MANDALA", .64, .92, 2.15),
    "charged-deck": move("CHARGED DECK", .34, .73, 1.95),
    "royal-flush": move("ROYAL FLUSH", .64, 1.15, 2.45),
    "bo-staff": move("BO STAFF COMBO", .22, .79, 1.50, { near: 6 }),
    "wall-sling": move("WALL SLINGSHOT", .62, .64, 1.75),
    "elastic-fist": move("ELASTIC DOUBLE BACK", .26, .79, 1.65, { near: 8 }),
    "bumper-run": move("BUMPER RUN", .48, 1.75, 1.95),
    "bank-shot": move("JACKPOT BANK", .31, 1.06, 1.75),
    "paper-plane": move("PAPER PLANE", .42, .67, 1.65),
    "paper-return": move("BOOMERANG FOLD", .38, 1.45, 1.85),
    "crane-flight": move("CRANE FLIGHT", .49, .69, 1.95),
    "mirage-step": move("MIRAGE KHOPESH", .55, .85, 2.05),
    "scarab-cavalcade": move("SCARAB CAVALCADE", .58, .88, 2.40),
});

export const CLASSIC_SHOWCASE_FIGHTERS = Object.freeze({
    magneto: Object.freeze({
        name: "MAGNETO", color: "#96364f", accent: "#f3a0ff", health: 185,
        statLabel: "MAGNETISM", power: "IRON HALO GUARD & SHARD FAN · TELEGRAPHED RAIL SPEARS",
        epithet: "Master of Metal", moves: Object.freeze(["iron-halo", "rail-spear"]),
    }),
    kratos: Object.freeze({
        name: "KRATOS", color: "#b9aba0", accent: "#ff9c64", health: 195,
        statLabel: "CHAOS BLADES", power: "CHAINED BLADES · PULL & SLAM · RETURNING LEVIATHAN AXE",
        epithet: "Chainbound Spartan", moves: Object.freeze(["chaos-chain", "leviathan"]),
    }),
    "doctor-strange": Object.freeze({
        name: "DOCTOR STRANGE", color: "#244987", accent: "#ffc56b", health: 170,
        statLabel: "SLING RING", power: "REAL PORTAL REDIRECTS · ARCANE VOLLEY · MIRROR MANDALA",
        epithet: "Master of the Mystic Arts", moves: Object.freeze(["sling-ring", "mirror-mandala"]),
    }),
    gambit: Object.freeze({
        name: "GAMBIT", color: "#653849", accent: "#ff82e4", health: 160,
        statLabel: "CHARGED CARDS", power: "STICKING EXPLOSIVE CARDS · ROYAL FLUSH · BO STAFF COMBO",
        epithet: "Kinetic Cardshark", moves: Object.freeze(["charged-deck", "royal-flush", "bo-staff"]),
    }),
    rubber: Object.freeze({
        name: "RUBBER", color: "#dd7351", accent: "#ffe0ac", health: 180,
        statLabel: "ELASTICITY", power: "WALL ANCHORED SLINGSHOT · EXTENDING TWO PASS FIST",
        epithet: "Elastic Slingshot", moves: Object.freeze(["wall-sling", "elastic-fist"]),
    }),
    pinball: Object.freeze({
        name: "PINBALL", color: "#5f76a4", accent: "#9effe4", health: 175,
        statLabel: "BANK COMBO", power: "PHYSICAL BUMPERS · BANKED MOMENTUM · JACKPOT CONTACT",
        epithet: "Ricochet Champion", moves: Object.freeze(["bumper-run", "bank-shot"]),
    }),
    origami: Object.freeze({
        name: "ORIGAMI", color: "#dacbb0", accent: "#fff0ce", health: 155,
        statLabel: "PAPER FOLDS", power: "PIERCING PAPER PLANE · RETURNING BOOMERANG · CRANE FLIGHT",
        epithet: "Living Paper", moves: Object.freeze(["paper-plane", "paper-return", "crane-flight"]),
    }),
    "sand-pharaoh": Object.freeze({
        name: "SAND PHARAOH", color: "#bc9251", accent: "#ffda7b", health: 185,
        statLabel: "MIRAGE", power: "SAND DECOY · MARKED REFORMATION STRIKE · HOMING SCARABS",
        epithet: "Keeper of the Dunes", moves: Object.freeze(["mirage-step", "scarab-cavalcade"]),
    }),
});

export const CLASSIC_SHOWCASE_IDS = Object.freeze(Object.keys(CLASSIC_SHOWCASE_FIGHTERS));
