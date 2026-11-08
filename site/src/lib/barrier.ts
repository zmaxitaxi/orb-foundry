export const MATH_CAP = 1e21;
export const HYDROGEN_FUSE_SECONDS = 60;

export const SHAPE_IDS = [
  "slammy",
  "x-squared",
  "fibonacci",
  "centy",
  "infinity",
  "hydrogen-bomb",
] as const;

export type ShapeId = (typeof SHAPE_IDS)[number];

const FIB_PREFIX = buildFibonacciPrefix();

function buildFibonacciPrefix(): number[] {
  const prefix = [0];
  let previous = 0;
  let current = 1;
  for (let bounce = 1; bounce <= 104; bounce += 1) {
    const nextPrevious = current;
    const nextCurrent = Math.min(MATH_CAP, previous + current);
    previous = nextPrevious;
    current = nextCurrent;
    prefix.push(prefix[bounce - 1] + previous);
  }
  return prefix;
}

export function isShapeId(value: string): value is ShapeId {
  return (SHAPE_IDS as readonly string[]).includes(value);
}

export function bouncesToClear(id: ShapeId, layers: number[]): number | null {
  if (id === "hydrogen-bomb") return null;
  if (id === "infinity") return layers.length;
  if (id === "centy") return centyBounces(layers);
  const health = layers.reduce((sum, layer) => sum + layer, 0);
  if (id === "slammy") return slamBounces(health);
  if (id === "x-squared") return squareBounces(health);
  return fibonacciBounces(health);
}

function slamBounces(health: number): number {
  if (health <= 0) return 0;
  return Math.max(1, Math.ceil(-1 + Math.sqrt(1 + health)));
}

function squarePrefix(bounces: number): number {
  return (bounces * (bounces + 1) * (2 * bounces + 1)) / 6;
}

function squareBounces(health: number): number {
  if (health <= 0) return 0;
  let low = 1;
  let high = 1;
  while (squarePrefix(high) < health && high < 1_000_000) high *= 2;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (squarePrefix(mid) >= health) high = mid;
    else low = mid + 1;
  }
  return low;
}

function fibonacciBounces(health: number): number {
  if (health <= 0) return 0;
  for (let bounce = 1; bounce < FIB_PREFIX.length; bounce += 1) {
    if (FIB_PREFIX[bounce] >= health) return bounce;
  }
  const covered = FIB_PREFIX[FIB_PREFIX.length - 1];
  const extra = Math.ceil(Math.max(0, health - covered) / MATH_CAP);
  return FIB_PREFIX.length - 1 + extra;
}

function centyBounces(layers: number[]): number {
  let percent = 1;
  let bounces = 0;
  for (const layerMax of layers) {
    let remaining = layerMax;
    while (remaining > 1e-6) {
      remaining -= (layerMax * percent) / 100;
      bounces += 1;
      percent = Math.round((percent + 0.1) * 10) / 10;
      if (bounces > 100_000) return bounces;
    }
  }
  return bounces;
}

export type PairReading = {
  a: number | null;
  b: number | null;
  outcome: "a" | "b" | "tie" | "open";
};

export function readPair(
  a: ShapeId,
  b: ShapeId,
  layers: number[],
): PairReading {
  const aBounces = bouncesToClear(a, layers);
  const bBounces = bouncesToClear(b, layers);
  if (aBounces == null || bBounces == null) {
    return { a: aBounces, b: bBounces, outcome: "open" };
  }
  if (aBounces < bBounces) return { a: aBounces, b: bBounces, outcome: "a" };
  if (bBounces < aBounces) return { a: aBounces, b: bBounces, outcome: "b" };
  return { a: aBounces, b: bBounces, outcome: "tie" };
}

export function healthStops(
  min = 8,
  max = 8_000_000,
  count = 72,
): number[] {
  const stops: number[] = [];
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  let last = -1;
  for (let index = 0; index < count; index += 1) {
    const value = Math.round(
      Math.exp(logMin + (index / (count - 1)) * (logMax - logMin)),
    );
    if (value !== last && value >= 1) {
      stops.push(value);
      last = value;
    }
  }
  return stops;
}

function leaderAt(a: ShapeId, b: ShapeId, health: number): "a" | "b" | "tie" | "open" {
  return readPair(a, b, [health]).outcome;
}

export function firstFlipHealth(
  a: ShapeId,
  b: ShapeId,
  maxHealth = 8_000_000,
): number | null {
  const samples = healthStops(1, maxHealth, 96);
  let previousHealth = samples[0];
  let previous = leaderAt(a, b, previousHealth);
  for (const health of samples.slice(1)) {
    const leader = leaderAt(a, b, health);
    if (
      (previous === "a" || previous === "b") &&
      (leader === "a" || leader === "b") &&
      previous !== leader
    ) {
      let low = previousHealth;
      let high = health;
      while (low + 1 < high) {
        const mid = Math.floor((low + high) / 2);
        const midLeader = leaderAt(a, b, mid);
        if (midLeader === previous || midLeader === "tie") low = mid;
        else high = mid;
      }
      return high;
    }
    if (leader === "a" || leader === "b") {
      previous = leader;
      previousHealth = health;
    }
  }
  return null;
}

export function strokeFor(color: string, accent: string): string {
  const normalized = color.trim().toLowerCase();
  if (normalized === "#fff" || normalized === "#ffffff") return accent;
  return color;
}
