import {
  bouncesToClear,
  firstFlipHealth,
  healthStops,
  isShapeId,
  readPair,
  type PairReading,
} from "./barrier";

const CAP = 1e21;

const PI_DIGITS = [
  3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6, 4, 3,
  3, 8, 3, 2, 7, 9, 5, 0, 2, 8, 8, 4, 1, 9, 7, 1, 6, 9, 3, 9, 9, 3, 7, 5, 1,
];

/** Body hit is 2, then 3, then 4: the stored 1 is increased before the contact. */
const RAMP = new Set([
  "duplicator",
  "speed",
  "gravitator",
  "grower",
  "sticky",
  "unarmed",
  "twins",
  "flash",
  "batman",
  "magnet",
  "gravity",
  "jackpot",
  "architect",
  "sawblade",
  "godzilla",
  "charger",
  "leech",
  "crusher",
  "berserker",
  "reactor",
  "draftmaster",
  "pancake",
  "tree",
  "multiplier",
]);

const PRIMES = [2];

export function isBodyRamp(id: string): boolean {
  return RAMP.has(id);
}

export function clearsByBounces(id: string, layers: number[]): number | null {
  if (isShapeId(id)) return bouncesToClear(id, layers);
  if (id === "trifecta") return Math.max(0, layers.length) * 3;
  if (id === "square-root") return squareRootBounces(layers);
  const hit = hitAt(id);
  if (!hit) return null;
  return bouncesForHealth(
    layers.reduce((sum, layer) => sum + layer, 0),
    hit,
  );
}

export function matchReading(a: string, b: string, layers: number[]): PairReading {
  if (isShapeId(a) && isShapeId(b)) return readPair(a, b, layers);
  const aBounces = clearsByBounces(a, layers);
  const bBounces = clearsByBounces(b, layers);
  if (aBounces == null || bBounces == null) {
    return { a: aBounces, b: bBounces, outcome: "open" };
  }
  if (aBounces < bBounces) return { a: aBounces, b: bBounces, outcome: "a" };
  if (bBounces < aBounces) return { a: aBounces, b: bBounces, outcome: "b" };
  return { a: aBounces, b: bBounces, outcome: "tie" };
}

export function firstCurveFlip(a: string, b: string): number | null {
  if (clearsByBounces(a, [1]) == null || clearsByBounces(b, [1]) == null) return null;
  if (isShapeId(a) && isShapeId(b)) return firstFlipHealth(a, b);
  const samples = healthStops(1, 8_000_000, 96);
  let previousHealth = samples[0];
  let previous = leader(a, b, previousHealth);
  for (const health of samples.slice(1)) {
    const next = leader(a, b, health);
    if (
      (previous === "a" || previous === "b") &&
      (next === "a" || next === "b") &&
      previous !== next
    ) {
      let low = previousHealth;
      let high = health;
      while (low + 1 < high) {
        const mid = Math.floor((low + high) / 2);
        const midLeader = leader(a, b, mid);
        if (midLeader === previous || midLeader === "tie") low = mid;
        else high = mid;
      }
      return high;
    }
    if (next === "a" || next === "b") {
      previous = next;
      previousHealth = health;
    }
  }
  return null;
}

function leader(a: string, b: string, health: number): PairReading["outcome"] {
  return matchReading(a, b, [health]).outcome;
}

function hitAt(id: string): ((bounce: number) => number) | null {
  if (RAMP.has(id)) return (bounce) => 1 + bounce;
  switch (id) {
    case "super-slammy":
      return (bounce) => Math.min(CAP, 1 + 5 * bounce);
    case "piercer":
      return (bounce) => 1 + 0.75 * bounce;
    case "speed-impact":
      return (bounce) => 50 + 100 * (bounce - 1);
    case "cubed":
      return (bounce) => Math.min(CAP, bounce ** 3);
    case "x-power":
      return (bounce) => safePow(bounce, bounce);
    case "super-x-power":
      return (bounce) => safePow(bounce, Math.min(16, safePow(bounce, bounce)));
    case "100x":
      return (bounce) => safePow(100, bounce);
    case "quadratic":
    case "double":
      return (bounce) => safePow(2, Math.min(70, bounce));
    case "tripler":
      return (bounce) => safePow(3, Math.min(45, bounce));
    case "phi":
      return phiHit;
    case "factorial":
      return factorialHit;
    case "prime":
      return (bounce) => nthPrime(bounce);
    case "integral":
      return (bounce) => Math.min(CAP, Math.floor((bounce * (bounce + 1)) / 2));
    case "sylvester":
      return sylvesterHit;
    case "lucas":
      return lucasHit;
    case "tetration":
      return tetrationHit;
    case "pi":
      return piHit;
    default:
      return null;
  }
}

function bouncesForHealth(health: number, hit: (bounce: number) => number): number | null {
  if (health <= 0) return 0;
  let total = 0;
  let zeros = 0;
  for (let bounce = 1; bounce <= 200_000; bounce += 1) {
    const damage = hit(bounce);
    if (!(damage > 0)) {
      zeros += 1;
      if (zeros > 8) return null;
      continue;
    }
    zeros = 0;
    total += damage;
    if (total >= health) return bounce;
  }
  return null;
}

function squareRootBounces(layers: number[]): number {
  let bounces = 0;
  for (const layer of layers) {
    let health = layer;
    let guard = 0;
    while (health > 1e-6 && guard < 10_000) {
      const damage =
        health <= 1 ? health : health <= 2 ? 1.46 : Math.max(0, health - Math.sqrt(health));
      if (damage <= 0) break;
      health -= damage;
      bounces += 1;
      guard += 1;
    }
  }
  return bounces;
}

function safePow(base: number, exp: number): number {
  let value = 1;
  const times = Math.max(0, Math.floor(exp));
  for (let step = 0; step < times; step += 1) {
    if (base <= 1) return Math.min(CAP, base === 1 ? 1 : 0);
    if (value >= CAP / base) return CAP;
    value *= base;
  }
  return Math.min(CAP, value);
}

function phiHit(bounce: number): number {
  const phi = (1 + Math.sqrt(5)) / 2;
  let value = 1;
  for (let step = 0; step < bounce; step += 1) {
    value *= phi;
    if (value >= CAP) return CAP;
  }
  return Math.min(CAP, Math.round(value));
}

function factorialHit(bounce: number): number {
  let result = 1;
  for (let step = 2; step <= bounce && result < CAP; step += 1) {
    result = Math.min(CAP, result * step);
  }
  return result;
}

function nthPrime(index: number): number {
  const target = Math.max(1, Math.floor(index));
  let candidate = PRIMES[PRIMES.length - 1] + 1;
  while (PRIMES.length < target) {
    let prime = true;
    const limit = Math.sqrt(candidate);
    for (const known of PRIMES) {
      if (known > limit) break;
      if (candidate % known === 0) {
        prime = false;
        break;
      }
    }
    if (prime) PRIMES.push(candidate);
    candidate += 1;
  }
  return Math.min(CAP, PRIMES[target - 1]);
}

function sylvesterHit(index: number): number {
  let value = 2;
  for (let step = 0; step < Math.min(24, index); step += 1) {
    if (value >= CAP) return CAP;
    const next = value * (value - 1) + 1;
    value = Number.isFinite(next) ? Math.min(CAP, next) : CAP;
  }
  return value;
}

function lucasHit(index: number): number {
  if (index <= 0) return 2;
  let previous = 2;
  let current = 1;
  for (let step = 1; step < Math.min(104, index); step += 1) {
    const next = previous + current;
    previous = current;
    current = Number.isFinite(next) ? Math.min(CAP, next) : CAP;
  }
  return Math.min(CAP, current);
}

function tetrationHit(height: number): number {
  let value = 1;
  for (let step = 0; step < Math.min(8, height); step += 1) {
    const next = 2 ** Math.min(60, value);
    value = Number.isFinite(next) ? Math.min(CAP, next) : CAP;
  }
  return value;
}

function piHit(bounce: number): number {
  let value = 1;
  for (let step = 1; step <= bounce; step += 1) {
    value = Math.min(CAP, value * PI_DIGITS[(step - 1) % PI_DIGITS.length]);
    if (value === 0) return 0;
  }
  return value;
}
