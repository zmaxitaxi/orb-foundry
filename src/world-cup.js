import { normalizeContenderIds, selectContenderIds } from "./contenders.js";

export const WORLD_CUP_MODE = "world-cup";
export const WORLD_CUP_BASE_DAMAGE = 5;
export const WORLD_CUP_YELLOW_CARD_STUN_SECONDS = 1.5;
export const WORLD_CUP_YELLOW_CARD_DAMAGE = 5;
export const WORLD_CUP_SOCCER_BALL_DAMAGE = 15;
export const WORLD_CUP_RED_CARD_DAMAGE = 15;

export const WORLD_CUP_COUNTRIES = Object.freeze({
  france: country("france", "France", "#2347a6", "#ef3340", ["#2347a6", "#ffffff", "#ef3340"]),
  sweden: country("sweden", "Sweden", "#006aa7", "#fecc02", ["#006aa7", "#fecc02"]),
  usa: country("usa", "USA", "#3c3b6e", "#b22234", ["#b22234", "#ffffff", "#3c3b6e"]),
  bosnia: country("bosnia", "Bosnia", "#002395", "#fecb00", ["#002395", "#fecb00", "#ffffff"]),
  england: country("england", "England", "#ffffff", "#ce1124", ["#ffffff", "#ce1124"]),
  "congo-dr": country("congo-dr", "Congo DR", "#007fff", "#f7d618", ["#007fff", "#f7d618", "#ce1021"]),
  brazil: country("brazil", "Brazil", "#009c3b", "#ffdf00", ["#009c3b", "#ffdf00", "#002776", "#ffffff"]),
  japan: country("japan", "Japan", "#ffffff", "#bc002d", ["#ffffff", "#bc002d"]),
  argentina: country("argentina", "Argentina", "#74acdf", "#f6b40e", ["#74acdf", "#ffffff", "#f6b40e"]),
  "cabo-verde": country("cabo-verde", "Cabo Verde", "#003893", "#cf2027", ["#003893", "#ffffff", "#cf2027", "#f7d116"]),
  netherlands: country("netherlands", "Netherlands", "#ae1c28", "#21468b", ["#ae1c28", "#ffffff", "#21468b"]),
  morocco: country("morocco", "Morocco", "#c1272d", "#006233", ["#c1272d", "#006233"]),
  portugal: country("portugal", "Portugal", "#046a38", "#da291c", ["#046a38", "#da291c", "#ffcc29"]),
  croatia: country("croatia", "Croatia", "#ff0000", "#171796", ["#ff0000", "#ffffff", "#171796"]),
  germany: country("germany", "Germany", "#000000", "#ffce00", ["#000000", "#dd0000", "#ffce00"]),
  paraguay: country("paraguay", "Paraguay", "#d52b1e", "#0038a8", ["#d52b1e", "#ffffff", "#0038a8"]),
  norway: country("norway", "Norway", "#ba0c2f", "#00205b", ["#ba0c2f", "#ffffff", "#00205b"]),
  "ivory-coast": country("ivory-coast", "Ivory Coast", "#f77f00", "#009e60", ["#f77f00", "#ffffff", "#009e60"]),
  mexico: country("mexico", "Mexico", "#006847", "#ce1126", ["#006847", "#ffffff", "#ce1126"]),
  ecuador: country("ecuador", "Ecuador", "#ffd100", "#ef3340", ["#ffd100", "#034ea2", "#ef3340"]),
  belgium: country("belgium", "Belgium", "#000000", "#ef3340", ["#000000", "#ffd90c", "#ef3340"]),
  senegal: country("senegal", "Senegal", "#00853f", "#e31b23", ["#00853f", "#fdef42", "#e31b23"]),
  spain: country("spain", "Spain", "#aa151b", "#f1bf00", ["#aa151b", "#f1bf00", "#aa151b"]),
  austria: country("austria", "Austria", "#ed2939", "#ffffff", ["#ed2939", "#ffffff", "#ed2939"]),
  australia: country("australia", "Australia", "#00008b", "#ff0000", ["#00008b", "#ffffff", "#ff0000"]),
  egypt: country("egypt", "Egypt", "#ce1126", "#000000", ["#ce1126", "#ffffff", "#000000", "#c09300"]),
  switzerland: country("switzerland", "Switzerland", "#ff0000", "#ffffff", ["#ff0000", "#ffffff"]),
  algeria: country("algeria", "Algeria", "#006233", "#d21034", ["#006233", "#ffffff", "#d21034"]),
  colombia: country("colombia", "Colombia", "#fcd116", "#ce1126", ["#fcd116", "#003893", "#ce1126"]),
  ghana: country("ghana", "Ghana", "#ce1126", "#006b3f", ["#ce1126", "#fcd116", "#006b3f", "#000000"]),
  canada: country("canada", "Canada", "#d80621", "#ffffff", ["#d80621", "#ffffff"]),
});

export const WORLD_CUP_COUNTRY_IDS = Object.freeze(Object.keys(WORLD_CUP_COUNTRIES));

export const WORLD_CUP_PICKUPS = Object.freeze({
  "red-energy-drink": pickup("red-energy-drink", "Damage Drink", "#ff3b38", 1.25, "PERMANENT +0.1×", "ATTACK ↑"),
  "green-energy-drink": pickup("green-energy-drink", "Healing Drink", "#46e26f", 0.65, "+1.5 HEARTS", "HEALTH ↑"),
  "shin-guards": pickup("shin-guards", "Shin Guards", "#52e3ff", 0.42, "PERMANENT +0.1×", "DEFENSE ↑"),
  "soccer-ball": pickup("soccer-ball", "Homing Ball", "#f8f1d5", 0.92, "1.5 HEARTS", "BALL READY"),
  "yellow-card": pickup("yellow-card", "Yellow Card", "#ffdc38", 0.72, `0.5 HEART · ${WORLD_CUP_YELLOW_CARD_STUN_SECONDS}S STUN`, "STUN READY"),
  "red-card": pickup("red-card", "Red Card", "#ff3a36", 0.54, "1.5 HEARTS", "DAMAGE READY"),
});

export const WORLD_CUP_PICKUP_IDS = Object.freeze(Object.keys(WORLD_CUP_PICKUPS));

export function normalizeWorldCupCountries(value, fallback = ["france", "brazil"]) {
  return normalizeContenderIds(value, WORLD_CUP_COUNTRIES, fallback);
}

export function selectWorldCupCountries(value, count = 2, seed = 1) {
  return selectContenderIds(value, WORLD_CUP_COUNTRIES, count, seed, ["france", "brazil"]);
}

export function weightedWorldCupPickup(randomValue) {
  const total = WORLD_CUP_PICKUP_IDS.reduce((sum, id) => sum + WORLD_CUP_PICKUPS[id].weight, 0);
  let cursor = Math.max(0, Math.min(0.999999, Number(randomValue) || 0)) * total;
  for (const id of WORLD_CUP_PICKUP_IDS) {
    cursor -= WORLD_CUP_PICKUPS[id].weight;
    if (cursor <= 0) return id;
  }
  return WORLD_CUP_PICKUP_IDS[0];
}

export function worldCupCombatStats(fighter, time = 0) {
  const shinGuardStacks = Math.max(0, Math.floor(Number(fighter?.shinGuardStacks) || 0));
  return Object.freeze({
    damage: 0,
    attackMultiplier: worldCupDamageMultiplier(fighter),
    defense: Math.round((1 + shinGuardStacks * 0.1) * 10) / 10,
  });
}

export function worldCupDamageMultiplier(fighter) {
  const stacks = Math.max(0, Math.floor(Number(fighter?.worldCupDamageStacks) || 0));
  return Number((1 + stacks * 0.1).toFixed(10));
}

function country(id, name, color, accent, palette) {
  return Object.freeze({
    id,
    name,
    color,
    accent,
    palette: Object.freeze([...palette]),
    flag: `./assets/generated/world-cup/flags/${id}.png`,
  });
}

function pickup(id, name, color, weight, label, feedback) {
  return Object.freeze({
    id,
    name,
    color,
    weight,
    label,
    feedback,
    sprite: `./assets/generated/world-cup/sprites/${id}.png`,
  });
}
