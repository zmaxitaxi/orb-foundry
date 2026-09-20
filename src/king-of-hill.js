import { normalizeContenderIds, selectContenderIds } from "./contenders.js";

export const KING_OF_HILL_MODE = "king-of-hill";
export const KING_OF_HILL_RADIUS = 132;
export const KING_OF_HILL_SCORE_PER_SECOND = 10;
export const KING_OF_HILL_MULTIPLIER_DELAY = 2;
export const KING_OF_HILL_FORTIFY_SECONDS = 0.35;

export const KING_OF_HILL_CONTENDERS = Object.freeze({
    red: contender("red", "Red", "#ef4444", "#fecaca", "R", 100),
    blue: contender("blue", "Blue", "#3b82f6", "#bfdbfe", "B", 100),
    green: contender("green", "Green", "#22c55e", "#bbf7d0", "G", 100),
    orange: contender("orange", "Orange", "#f97316", "#fed7aa", "O", 100),
    purple: contender("purple", "Purple", "#a855f7", "#e9d5ff", "P", 100),
    yellow: contender("yellow", "Yellow", "#eab308", "#fef08a", "Y", 100),
    euler: contender("euler", "Euler", "#14b8a6", "#99f6e4", "e", 170, 1.5),
    "x-squared": contender("x-squared", "X²", "#6366f1", "#c7d2fe", "x²", 200, 2),
    pi: contender("pi", "Pi", "#ec4899", "#fbcfe8", "π", 190, 1.75),
    phi: contender("phi", "Phi", "#8b5cf6", "#ddd6fe", "φ", 175, 1.6),
    "times-two": contender("times-two", "×2", "#f59e0b", "#fde68a", "×2", 160, 2),
});

export const KING_OF_HILL_CONTENDER_IDS = Object.freeze(Object.keys(KING_OF_HILL_CONTENDERS));

export function normalizeKingOfHillContenders(value, fallback = ["red", "euler"]) {
    return normalizeContenderIds(value, KING_OF_HILL_CONTENDERS, fallback);
}

export function selectKingOfHillContenders(value, count = 2, seed = 1) {
    return selectContenderIds(value, KING_OF_HILL_CONTENDERS, count, seed, ["red", "euler"]);
}

function contender(id, name, color, accent, symbol, target, multiplier = 1) {
    return Object.freeze({
        id,
        name,
        color,
        accent,
        symbol,
        target,
        multiplier,
        kind: multiplier > 1 ? "math" : "color",
        palette: Object.freeze([color, accent]),
    });
}
