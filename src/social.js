import { CLASS_DEFS } from "./simulation.js?v=20261008-purple-sun-title1";

export const SOCIAL_FORMATS = Object.freeze({
  portrait: Object.freeze({ id: "portrait", label: "FULL PORTRAIT", width: 1080, height: 1920 }),
  square: Object.freeze({ id: "square", label: "SQUARE CROP", width: 1080, height: 1020 }),
  landscape: Object.freeze({ id: "landscape", label: "LANDSCAPE CROP", width: 1920, height: 1024 }),
  "race-landscape": Object.freeze({ id: "race-landscape", label: "ORB RACE LONG FORM · 1920 × 1080", width: 1920, height: 1080 }),
});

export const SOCIAL_DEFAULTS = Object.freeze({
  format: "portrait",
  fps: 30,
  highlightMode: true,
  showWinProbability: true,
});

export const TOURNAMENT_EXPORT_DEFAULTS = Object.freeze({
  eachMatch: Object.freeze({ format: "portrait", layerCount: 3 }),
  wholeRound: Object.freeze({ format: "race-landscape", layerCount: 5 }),
  wholeTournament: Object.freeze({ format: "race-landscape", layerCount: 5 }),
});

export function normalizeTournamentExportOptions(input = {}) {
  const scope = input.recordingScope === "whole-tournament" || input.scope === "whole-tournament"
    ? "wholeTournament"
    : input.recordingScope === "whole-round" || input.scope === "whole-round"
      ? "wholeRound"
      : "eachMatch";
  const defaults = TOURNAMENT_EXPORT_DEFAULTS[scope];
  return {
    scope: scope === "wholeTournament" ? "whole-tournament" : scope === "wholeRound" ? "whole-round" : "each-match",
    format: defaults.format,
    layerCount: Math.max(1, Number(input.layerCount) || defaults.layerCount),
    layers: Array.isArray(input.layers) ? [...input.layers] : null,
    cropToFinish: defaults.format === "race-landscape" && Number(input.layerCount || defaults.layerCount) === 3,
  };
}

export const PRESENTATION_IMPACT_PAUSE_MS = 65;
export const PRESENTATION_PROJECTILE_PAUSE_MS = 70;
export const PRESENTATION_COLLISION_PAUSE_MS = 90;
export const PRESENTATION_CRITICAL_PAUSE_MS = 120;
export const PRESENTATION_CLASH_PAUSE_MS = 75;
export const PRESENTATION_KNOCKOUT_PAUSE_MS = 180;

const IMPACT_PRESENTATION_BY_EVENT = Object.freeze({
  "weapon-hit": Object.freeze({ kind: "regular", duration: PRESENTATION_IMPACT_PAUSE_MS, shake: 0.34, priority: 1 }),
  "volta-bolt-hit": Object.freeze({ kind: "regular", duration: PRESENTATION_PROJECTILE_PAUSE_MS, shake: 0.4, priority: 1 }),
  "world-cup-ball-hit": Object.freeze({ kind: "critical", duration: PRESENTATION_CRITICAL_PAUSE_MS, shake: 0.78, priority: 3 }),
  "invulnerable-block": Object.freeze({ kind: "collision", duration: PRESENTATION_COLLISION_PAUSE_MS, shake: 0.46, priority: 2 }),
  "collision-hit": Object.freeze({ kind: "collision", duration: PRESENTATION_COLLISION_PAUSE_MS, shake: 0.52, priority: 2 }),
  "weapon-clash": Object.freeze({ kind: "collision", duration: PRESENTATION_CLASH_PAUSE_MS, shake: 0.42, priority: 2 }),
  "world-cup-card-hit": Object.freeze({ kind: "critical", duration: PRESENTATION_CRITICAL_PAUSE_MS, shake: 0.78, priority: 3 }),
  "race-speed-impact": Object.freeze({ kind: "critical", duration: PRESENTATION_CRITICAL_PAUSE_MS, shake: 1.05, priority: 3 }),
  knockout: Object.freeze({ kind: "critical", duration: PRESENTATION_KNOCKOUT_PAUSE_MS, shake: 1, priority: 4 }),
});

export function impactPresentationForEvent(event) {
  return IMPACT_PRESENTATION_BY_EVENT[event?.type] || null;
}

export function presentationPauseMs(event) {
  return impactPresentationForEvent(event)?.duration || 0;
}

const LEGACY_SOCIAL_CLASS_META = {
  fire: Object.freeze({ short: "CI", ability: "PASSIVE · BURN 1 × 4S", maxCooldown: 0 }),
  ice: Object.freeze({ short: "GL", ability: "HAILSTORM · 5 DAMAGE / S", maxCooldown: 30 }),
  wizard: Object.freeze({ short: "HX", ability: "ARCANE BURST · 18 DAMAGE", maxCooldown: 100 }),
  time: Object.freeze({ short: "CH", ability: "TIME STOP · EMPOWERED GLAIVE", maxCooldown: 8.4 }),
  volta: Object.freeze({ short: "VO", ability: "RICOCHET BOLT · 10 DAMAGE + STUN", maxCooldown: 100 }),
  venom: Object.freeze({ short: "VE", ability: "PASSIVE · POISON ×3", maxCooldown: 0 }),
  gravis: Object.freeze({ short: "GR", ability: "GRAVITY LOCK · PULL + FREEZE 5S", maxCooldown: 45 }),
  aegis: Object.freeze({ short: "AE", ability: "BERSERKER RUSH · INVULNERABLE + 2× RAM", maxCooldown: 20 }),
  mirage: Object.freeze({ short: "MI", ability: "DECOY · HIT BAIT", maxCooldown: 8 }),
  echo: Object.freeze({ short: "EC", ability: "RESONANCE · DELAYED REPLAY", maxCooldown: 1 }),
  forge: Object.freeze({ short: "FO", ability: "HEAT · TEMPER WEAPON", maxCooldown: 100 }),
  static: Object.freeze({ short: "ST", ability: "WALL CHARGE · CHAIN ZAP", maxCooldown: 100 }),
  shade: Object.freeze({ short: "SH", ability: "DASH RAM · PHASE TRAIL", maxCooldown: 0 }),
};

const SOCIAL_CLASS_META_MUTABLE = {
  sword: Object.freeze({ short: "SW", ability: "PASSIVE · WOUND 1 × 4S", maxCooldown: 0 }),
  crossbow: Object.freeze({ short: "CB", ability: "INTERVAL ARROWS · BLOCKS", maxCooldown: 2.8 }),
  potion: Object.freeze({ short: "PT", ability: "INTERVAL AOE TONICS · BLOCKS", maxCooldown: 3.4 }),
  axe: Object.freeze({ short: "AX", ability: "CLEAVE ZONE · 5 DAMAGE / S", maxCooldown: 30 }),
  scythe: Object.freeze({ short: "SC", ability: "TEMPO CUT · EMPOWERED SCYTHE", maxCooldown: 8.4 }),
  staff: Object.freeze({ short: "SF", ability: "FULL-CIRCLE BURST · 18 DAMAGE", maxCooldown: 100 }),
};
Object.assign(SOCIAL_CLASS_META_MUTABLE, LEGACY_SOCIAL_CLASS_META);
for (const [type, def] of Object.entries(CLASS_DEFS)) {
  SOCIAL_CLASS_META_MUTABLE[type] = Object.freeze({
    short: def.name.replace(/[^A-Z0-9]/g, "").slice(0, 2),
    ability: def.power,
    maxCooldown: Number(def.classicAbility?.interval || 0),
  });
}
export const SOCIAL_CLASS_META = Object.freeze(SOCIAL_CLASS_META_MUTABLE);

export function normalizeSocialOptions(input = {}) {
  const format = input.format === "longform" ? "race-landscape" : input.format;
  return {
    format: SOCIAL_FORMATS[format] ? format : SOCIAL_DEFAULTS.format,
    fps: Number(input.fps) === 60 ? 60 : 30,
    highlightMode: input.highlightMode !== false,
    showWinProbability: input.showWinProbability !== false,
  };
}

export function socialActionPlaybackRateForDuration(simulatedSeconds, targetActionSeconds) {
  const requestedDuration = Number(simulatedSeconds);
  const requestedTarget = Number(targetActionSeconds);
  const duration = Number.isFinite(requestedDuration) ? Math.max(0, requestedDuration) : 0;
  const target = Number.isFinite(requestedTarget) ? Math.max(0, requestedTarget) : 0;
  if (duration <= 0 || target <= 0) return 1;
  return Math.min(1, duration / target);
}

export function buildAbilityHud(fighter, simTime = 0) {
  const meta = SOCIAL_CLASS_META[fighter.type];
  if (!meta) return { name: "UNKNOWN", detail: "", label: "READY", progress: 1, passive: false };
  const def = CLASS_DEFS[fighter.type];
  if (def?.classicAbility) {
    const interval = Number(def?.classicAbility?.interval || 0);
    const remaining = Math.max(0, Number(fighter.classicAbilityNextAt || 0) - simTime);
    const active = simTime < Number(fighter.classicAbilityActiveUntil || 0);
    const passive = interval <= 0;
    return abilityHudState(fighter, {
      name: def?.name || fighter.type.toUpperCase(),
      detail: def?.power || meta.ability,
      label: active ? "ACTIVE" : passive ? "PASSIVE" : remaining > 0 ? `${remaining.toFixed(1)}S` : "READY",
      progress: passive ? 1 : 1 - Math.min(1, remaining / interval),
      passive,
      active,
    });
  }
  const behaviorType = CLASS_DEFS[fighter.type]?.mechanicType || fighter.type;
  const ranged = CLASS_DEFS[fighter.type]?.ranged;

  if (ranged) {
    const remaining = Math.max(0, fighter.rangedCooldown || 0);
    const interval = Math.max(ranged.minInterval, fighter.rangedInterval || ranged.interval);
    return abilityHudState(fighter, {
      name: fighter.type === "crossbow" ? "CROSSBOW ARROWS" : "POTION AOE",
      detail: meta.ability,
      label: remaining > 0 ? `${remaining.toFixed(1)}S` : "READY",
      progress: remaining > 0 ? 1 - Math.min(1, remaining / interval) : 1,
      passive: false,
    });
  }

  if (behaviorType === "fire") {
    return abilityHudState(fighter, { name: fighter.type === "sword" ? "SWORD" : "EMBER SWORD", detail: meta.ability, label: "PASSIVE", progress: 1, passive: true });
  }
  if (behaviorType === "venom") {
    return abilityHudState(fighter, { name: fighter.type === "potion" ? "POTION" : "POISON SWORD", detail: meta.ability, label: "PASSIVE", progress: 1, passive: true });
  }
  if (behaviorType === "wizard") {
    const value = Math.max(0, Math.min(100, fighter.mana || 0));
    return abilityHudState(fighter, { name: fighter.type === "staff" ? "STAFF BURST" : "ARCANE BURST", detail: meta.ability, label: `${Math.round(value)} MP`, progress: value / 100, passive: false });
  }
  if (behaviorType === "volta") {
    const value = Math.max(0, Math.min(100, fighter.voltaCharge || 0));
    return abilityHudState(fighter, { name: fighter.type === "crossbow" ? "CROSSBOW BOLT" : "RICOCHET BOLT", detail: meta.ability, label: `${Math.round(value)} CHG`, progress: value / 100, passive: false });
  }
  if (fighter.type === "forge") {
    const value = Math.max(0, Math.min(100, fighter.forgeHeat || 0));
    const active = simTime < fighter.weaponBoostUntil;
    return abilityHudState(fighter, {
      name: active ? "TEMPERED" : "HEAT",
      detail: meta.ability,
      label: active ? `${Math.max(0, fighter.weaponBoostUntil - simTime).toFixed(1)}S` : `${Math.round(value)} HEAT`,
      progress: active ? Math.max(0, Math.min(1, (fighter.weaponBoostUntil - simTime) / 5)) : value / 100,
      passive: false,
      active,
    });
  }
  if (fighter.type === "static") {
    const value = Math.max(0, Math.min(100, fighter.staticCharge || 0));
    return abilityHudState(fighter, { name: "CHAIN ZAP", detail: meta.ability, label: `${Math.round(value)} CHG`, progress: value / 100, passive: false });
  }
  if (fighter.type === "echo") {
    const active = simTime < fighter.echoReadyUntil;
    return abilityHudState(fighter, {
      name: "ECHO REPLAY",
      detail: meta.ability,
      label: active ? "PENDING" : "ON HIT",
      progress: active ? Math.max(0.12, Math.min(1, (fighter.echoReadyUntil - simTime) / 0.82)) : 1,
      passive: !active,
      active,
    });
  }
  if (behaviorType === "shade") {
    const active = simTime < fighter.shadePhaseUntil;
    return abilityHudState(fighter, {
      name: active ? "PHASED" : "SHADOW DASH",
      detail: meta.ability,
      label: active ? `${Math.max(0, fighter.shadePhaseUntil - simTime).toFixed(1)}S` : "COLLIDE",
      progress: active ? Math.max(0, Math.min(1, (fighter.shadePhaseUntil - simTime) / 2.1)) : 1,
      passive: !active,
      active,
    });
  }
  if (behaviorType === "aegis" && simTime < fighter.aegisRushUntil) {
    const remaining = Math.max(0, fighter.aegisRushUntil - simTime);
    return abilityHudState(fighter, { name: "BERSERKER RUSH", detail: "INVULNERABLE · DOUBLE COLLISION DAMAGE", label: `${remaining.toFixed(1)}S`, progress: remaining / 5, passive: false, active: true });
  }

  const remaining = Math.max(0, fighter.cooldown || 0);
  return abilityHudState(fighter, {
    name: CLASS_DEFS[fighter.type].ability,
    detail: meta.ability,
    label: remaining > 0 ? `${remaining.toFixed(1)}S` : "READY",
    progress: meta.maxCooldown > 0 ? 1 - Math.min(1, remaining / meta.maxCooldown) : 1,
    passive: false,
  });
}

function abilityHudState(fighter, hud) {
  const progress = Math.max(0, Math.min(1, hud.progress ?? 0));
  return {
    ...hud,
    progress,
    almostReady: !hud.passive && progress >= 0.72 && progress < 1,
    charged: !hud.passive && progress >= 1,
    lastStand: Boolean(fighter.lastStand),
  };
}

export function buildBattleStats(fighter) {
  const analytics = fighter.analytics || {};
  const classStats = {
    sword: { label: "DAMAGE", value: Number(fighter.damage || 1).toFixed(1) },
    bow: { label: "ARROWS", value: Math.round(fighter.classicArrowCount || 1) },
    potion: { label: "DAMAGE", value: Number(fighter.damage || 1).toFixed(1) },
    axe: { label: "CRIT CHANCE", value: `${Math.round((fighter.classicCritChance || 0) * 100)}%` },
    dagger: { label: "SPIN SPEED", value: `${Number(fighter.classicSpinMultiplier || 1).toFixed(2)}×` },
    katana: { label: "SLICES", value: Math.round(fighter.classicSlices || 1) },
    duplicator: { label: "DUPLICATES", value: Math.max(0, Number(fighter.classicDuplicateSequence || fighter.classicDuplicateGeneration || 0)) },
    orbital: { label: "ORBS", value: Math.round(fighter.classicOrbiters || 0) },
    unarmed: { label: "DAMAGE", value: Math.round(fighter.damage || 1) },
    grower: { label: "SIZE", value: `${Math.round((fighter.classicSizeScale || 1) * 100)}%` },
    slammy: { label: "DAMAGE", value: Math.round(fighter.damage || 1) },
    fire: { label: "BURN DMG", value: Math.round(analytics.burnDamage || 0) },
    ice: { label: "HAIL DMG", value: Math.round(analytics.hailstormDamage || 0) },
    wizard: { label: "BURST DMG", value: Math.round(analytics.arcaneBurstDamage || 0) },
    time: { label: "TIME STOPS", value: Math.round(analytics.timeStops || 0) },
    volta: { label: "BOLT DMG", value: Math.round(analytics.boltDamage || 0) },
    venom: { label: "POISON DMG", value: Math.round(analytics.poisonDamage || 0) },
    gravis: { label: "LOCKS", value: Math.round(analytics.gravityLocks || 0) },
    aegis: { label: "RAM DMG", value: Math.round(analytics.collisionDamage || 0) },
    mirage: { label: "DECOYS", value: Math.round(analytics.decoyHits || 0) },
    echo: { label: "ECHO DMG", value: Math.round(analytics.echoDamage || 0) },
    forge: { label: "HEAT", value: Math.round(analytics.heatValueCollected || 0) },
    static: { label: "ZAP DMG", value: Math.round(analytics.staticDamage || 0) },
    shade: { label: "PHASES", value: Math.round(analytics.shadePhases || 0) },
  };
  const bounceDriven = new Set(["turret", "tripwire", "spikey", "shrapnel", "cobwebs", "glass-ball", "lazer", "train"]);
  const classicStatValue = (() => {
    if (fighter.type === "snake") return Math.max(1, Math.round(fighter.classicSnakeTailSegments || 1));
    if (fighter.type === "hive-ball") return Math.max(1, Math.round(fighter.classicHiveCount || 1));
    if (fighter.type === "jackpot") return Math.round(fighter.classicJackpotSpins || 0);
    if (fighter.type === "ying-yang") return String(fighter.classicYingYangPhase || "damage").toUpperCase();
    if (["sword", "unarmed", "slammy"].includes(fighter.type)) return Number(fighter.damage || 1).toFixed(1);
    if (bounceDriven.has(fighter.type)) return Math.round(fighter.classicBounces || 0);
    return Math.round(fighter.classicAbilityUses || 0);
  })();
  const classicDefinitionStat = CLASS_DEFS[fighter.type]?.statLabel
    ? { label: CLASS_DEFS[fighter.type].statLabel, value: classicStatValue }
    : null;
  return [
    { label: "DAMAGE", value: Math.round(fighter.damageDone || 0) },
    { label: "HITS", value: Math.round(fighter.weaponHitsDone || 0) },
    fighter.type === "shade"
      ? { label: "DASH HITS", value: Math.round(analytics.collisionHits || 0) }
      : { label: "DAMAGE TAKEN", value: Math.round(fighter.damageTaken || 0) },
    classStats[fighter.type] || classicDefinitionStat || { label: "ABILITY", value: 0 },
  ];
}

export function statusIndicators(fighter, simTime = 0) {
  const indicators = [];
  if (simTime < fighter.burnUntil) indicators.push({ key: "burn", label: "BURN", color: "#ff5b2b" });
  if (simTime < fighter.poisonUntil) indicators.push({ key: "poison", label: `POISON ×${fighter.poisonStacks || 1}`, color: "#3fe36f" });
  if (simTime < fighter.slowUntil) indicators.push({ key: "slow", label: "SLOW", color: "#55dfff" });
  if (simTime < fighter.stunUntil && simTime >= fighter.gravityUntil) indicators.push({ key: "stun", label: "STUN", color: "#ffca3a" });
  if (simTime < fighter.gravityUntil) indicators.push({ key: "gravity", label: "LOCKED", color: "#d24bff" });
  if (simTime < fighter.invulnerableUntil) indicators.push({ key: "invulnerable", label: "INVULNERABLE", color: "#f2fbff" });
  if (fighter.lastStand) indicators.push({ key: "last-stand", label: "LAST STAND", color: CLASS_DEFS[fighter.type]?.accent || "#ffbd45" });
  if (simTime < fighter.shadePhaseUntil) indicators.push({ key: "shade-phase", label: "PHASED", color: "#b9a7ff" });
  return indicators;
}

export function socialEventAnnouncement(event, fighters = []) {
  const source = fighters.find((fighter) => fighter.id === event.fighterId || fighter.id === event.sourceId);
  const target = fighters.find((fighter) => fighter.id === event.targetId);
  if (event.type === "forge-overtime") return "OVERTIME";
  if (event.type === "arcane-burst") return `${source?.name || "STAFF"} FIRES FULL-CIRCLE BURST · ${event.hitCount} HIT`;
  if (event.type === "hailstorm-cast") return `${source?.name || "FROST"} SUMMONS HAILSTORM`;
  if (event.type === "gravity-lock") return `${source?.name || "GRAVIS"} GRAVITY LOCK`;
  if (event.type === "time-stop") return `${source?.name || "CHRONO"} STOPS TIME`;
  if (event.type === "aegis-rush") return `${source?.name || "AEGON"} BERSERKER RUSH`;
  if (event.type === "last-stand") return `${source?.name || "ORB"} LAST STAND`;
  if (event.type === "mirage-decoy") return `${source?.name || "MIRAGE"} CASTS DECOY`;
  if (event.type === "mirage-decoy-hit") return `${source?.name || "MIRAGE"} DECOY TAKES THE HIT`;
  if (event.type === "echo-replay") return `${source?.name || "ECHO"} REPLAYS ${Math.round(event.amount || 0)} DAMAGE`;
  if (event.type === "forge-heat-pickup") return `${source?.name || "FORGE"} COLLECTS HEAT`;
  if (event.type === "forge-temper") return `${source?.name || "FORGE"} TEMPERS WEAPON`;
  if (event.type === "static-charged") return `${source?.name || "STATIC"} FULLY CHARGED`;
  if (event.type === "static-zap") return `${source?.name || "STATIC"} CHAIN ZAPS ${target?.name || "TARGET"}`;
  if (event.type === "shade-phase") return `${source?.name || "SHADE"} PHASES AFTER DASH`;
  if (event.type === "ranged-fired") return `${source?.name || "ORB"} FIRES ${event.rangedKind === "potion-flask" ? "TONIC" : "ARROW"}`;
  if (event.type === "crossbow-arrow-hit") return `${source?.name || "CROSSBOW"} HITS ${target?.name || "TARGET"} · ARROW`;
  if (event.type === "potion-aoe") return `${source?.name || "POTION"} BURSTS TONIC AOE`;
  if (event.type === "ranged-hit" && event.rangedKind === "potion-flask") return `${source?.name || "POTION"} LANDS TONIC AOE · INTERVAL ${Number(event.interval || 0).toFixed(1)}S`;
  if (event.type === "ranged-hit") return `${source?.name || "CROSSBOW"} LANDS ARROW · INTERVAL ${Number(event.interval || 0).toFixed(1)}S`;
  if (event.type === "volta-bolt-fired") return `${source?.name || "CROSSBOW"} FIRES RICOCHET BOLT`;
  if (event.type === "volta-bolt-hit") return `${source?.name || "CROSSBOW"} STUNS ${target?.name || "TARGET"} · 10 DAMAGE`;
  if (event.type === "burn-applied") return `${source?.name || "SWORD"} WOUNDS ${target?.name || "TARGET"}`;
  if (event.type === "poison-applied") return `${source?.name || "POTION"} TONIC ×${event.stacks || 1}`;
  if (event.type === "collision-hit") {
    const verb = source?.type === "shade" ? "DASHES THROUGH" : "RAMS";
    return `${source?.name || "ORB"} ${verb} ${target?.name || "TARGET"} · ${Math.round(event.amount || 0)} DAMAGE`;
  }
  if (event.type === "knockout") return `${target?.name || "ORB"} K.O.`;
  return "";
}

export function detectHighlight(event, fighters = []) {
  if (!event) return null;
  const source = fighters.find((fighter) => fighter.id === event.fighterId || fighter.id === event.sourceId);
  const target = fighters.find((fighter) => fighter.id === event.targetId);
  const announcement = socialEventAnnouncement(event, fighters);
  if (event.type === "forge-overtime") return { kind: "overtime", strength: 0.9, duration: 1.8, announcement };
  if (event.type === "knockout") return { kind: "final-blow", strength: 1, duration: 1.4, announcement };
  if (event.type === "world-cup-card-hit") {
    return { kind: "world-cup-card-hit", strength: 0.86, duration: 0.62, announcement };
  }
  if (event.type === "weapon-hit") {
    const strength = Math.max(0.46, Math.min(0.64, 0.44 + (Number(event.amount) || 0) / 55));
    return { kind: "weapon-hit", strength, duration: 0.26, announcement: "" };
  }
  if (event.type === "collision-hit") {
    const strength = Math.max(0.58, Math.min(0.78, 0.5 + (Number(event.amount) || 0) / 45));
    return { kind: "collision-hit", strength, duration: 0.34, announcement };
  }
  if (event.type === "arcane-burst" && event.hitCount >= 2) return { kind: "multi-burst", strength: 0.9, duration: 0.9, announcement };
  if (event.type === "gravity-lock") return { kind: "gravity-lock", strength: 0.78, duration: 0.8, announcement };
  if (event.type === "volta-bolt-hit" && event.bounced) return { kind: "ricochet", strength: 0.9, duration: 0.9, announcement };
  if (event.type === "aegis-rush" && (source?.health ?? 100) <= 35) return { kind: "reversal", strength: 0.84, duration: 0.9, announcement };
  if (event.type === "last-stand") return { kind: "last-stand", strength: 0.9, duration: 1.1, announcement };
  if (["forge-temper", "static-zap", "echo-replay", "mirage-decoy-hit", "shade-phase"].includes(event.type)) {
    return { kind: event.type, strength: 0.78, duration: 0.82, announcement };
  }
  if (["time-stop", "hailstorm-cast", "volta-bolt-fired", "ranged-fired"].includes(event.type)) {
    return { kind: "ability", strength: 0.55, duration: 0.65, announcement };
  }
  return announcement ? { kind: "announcement", strength: 0.35, duration: 0.55, announcement } : null;
}

export function buildWinProbability(sim) {
  const fighters = sim.fighters || [];
  const living = fighters.filter((fighter) => fighter.alive);
  const candidates = living.length ? living : fighters;
  const scores = candidates.map((fighter) => {
    const healthScore = Math.max(0, fighter.health) / Math.max(1, fighter.maxHealth || 100);
    const damageScore = Math.min(1.2, (fighter.damageDone || 0) / 120);
    const hitScore = Math.min(0.7, (fighter.weaponHitsDone || 0) / 16);
    const abilityScore = abilityReadinessScore(fighter);
    const statusPenalty =
      (sim.time < fighter.stunUntil ? 0.22 : 0) +
      (sim.time < fighter.gravityUntil ? 0.16 : 0) +
      (sim.time < fighter.burnUntil ? 0.06 : 0) +
      (sim.time < fighter.poisonUntil ? Math.min(0.12, (fighter.poisonStacks || 1) * 0.04) : 0);
    return {
      id: fighter.id,
      name: fighter.name,
      type: fighter.type,
      color: CLASS_DEFS[fighter.type]?.color || "#ffffff",
      score: Math.max(0.05, healthScore * 1.65 + damageScore * 0.5 + hitScore + abilityScore - statusPenalty),
    };
  });
  const total = scores.reduce((sum, entry) => sum + entry.score, 0) || 1;
  const entries = scores.map((entry) => ({ ...entry, probability: entry.score / total }));
  entries.sort((a, b) => b.probability - a.probability || a.id.localeCompare(b.id));
  return {
    entries,
    leader: entries[0] || null,
    underdog: entries[entries.length - 1] || null,
  };
}

export function bigMomentForEvent(event, fighters = [], odds = null) {
  if (!event) return null;
  const source = fighters.find((fighter) => fighter.id === event.fighterId || fighter.id === event.sourceId);
  const target = fighters.find((fighter) => fighter.id === event.targetId);
  if (event.type === "knockout") return { label: "FINAL BLOW", color: "#ffbd45", duration: 1.25 };
  if (event.type === "forge-overtime") return { label: "OVERTIME", color: "#ff6b3d", duration: 1.35 };
  if (event.type === "collision-hit") {
    return {
      label: event.fighterType === "shade" ? "SHADOW DASH" : event.rushing ? "BERSERKER RAM" : "VIKING RAM",
      color: event.fighterType === "shade" ? "#b9a7ff" : "#f2fbff",
      duration: 0.82,
    };
  }
  if (event.type === "volta-bolt-hit") {
    return { label: event.bounced ? "RICOCHET STUN" : "STUN HIT", color: "#ffca3a", duration: 0.95 };
  }
  if (event.type === "arcane-burst" && event.hitCount >= 2) {
    return { label: "MULTI-HIT BURST", color: "#f2c8ff", duration: 1.05 };
  }
  if (event.type === "gravity-lock") return { label: "GRAVITY LOCK", color: "#d24bff", duration: 0.95 };
  if (event.type === "time-stop") return { label: "TIME FREEZE", color: "#65a2ff", duration: 0.95 };
  if (event.type === "hailstorm-cast") return { label: "HAILSTORM", color: "#55dfff", duration: 0.82 };
  if (event.type === "weapon-hit" && target) {
    if (target.health > 0 && target.health <= Math.max(8, target.maxHealth * 0.12)) {
      return { label: "ONE HIT LEFT", color: "#ff3c3c", duration: 0.9 };
    }
    if (target.health > 0 && target.health <= target.maxHealth * 0.25) {
      return { label: "DANGER ZONE", color: "#ff6b3d", duration: 0.78 };
    }
  }
  return null;
}

export function bigMomentCalloutForEvent(event, fighters = []) {
  const source = fighters.find((fighter) => fighter.id === event?.fighterId || fighter.id === event?.sourceId);
  return null;
}

export function buildHypeScore(sim, odds = null) {
  const fighters = sim.fighters || [];
  const living = fighters.filter((fighter) => fighter.alive);
  const healthValues = fighters.map((fighter) => Math.max(0, fighter.health));
  const closestFinish = Math.min(...healthValues, 100);
  const totalHits = fighters.reduce((sum, fighter) => sum + (fighter.weaponHitsDone || 0), 0);
  const statusDamage = fighters.reduce((sum, fighter) => {
    const analytics = fighter.analytics || {};
    return sum + (analytics.burnDamage || 0) + (analytics.poisonDamage || 0) + (analytics.hailstormDamage || 0) + (analytics.boltDamage || 0);
  }, 0);
  const probabilitySpread = odds?.entries?.length >= 2
    ? Math.abs(odds.entries[0].probability - odds.entries[1].probability)
    : 0.5;
  const closeness = Math.max(0, 1 - probabilitySpread * 1.6);
  const lowHpBonus = Math.max(0, 1 - closestFinish / 35);
  const base = 28;
  const score =
    base +
    Math.min(22, totalHits * 2.1) +
    Math.min(12, statusDamage * 0.15) +
    closeness * 15 +
    lowHpBonus * 12 +
    (sim.overtimeStarted ? 10 : 0) +
    (sim.finished ? 8 : 0) +
    (living.length === 1 && sim.winner?.health <= 20 ? 8 : 0);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function abilityReadinessScore(fighter) {
  const behaviorType = CLASS_DEFS[fighter.type]?.mechanicType || fighter.type;
  const ranged = CLASS_DEFS[fighter.type]?.ranged;
  if (ranged) {
    const interval = Math.max(ranged.minInterval, fighter.rangedInterval || ranged.interval);
    return Math.max(0, 0.38 * (1 - Math.min(1, (fighter.rangedCooldown || 0) / interval)));
  }
  if (behaviorType === "wizard") return Math.min(0.42, (fighter.mana || 0) / 100 * 0.42);
  if (behaviorType === "volta") return Math.min(0.38, (fighter.voltaCharge || 0) / 100 * 0.38);
  if (fighter.type === "forge") return Math.min(0.36, (fighter.forgeHeat || 0) / 100 * 0.36);
  if (fighter.type === "static") return Math.min(0.36, (fighter.staticCharge || 0) / 100 * 0.36);
  const cooldown = Number(fighter.cooldown) || 0;
  if (cooldown <= 0 && !["fire", "venom"].includes(behaviorType)) return 0.34;
  if (behaviorType === "fire" || behaviorType === "venom") return 0.16;
  const maxCooldown = SOCIAL_CLASS_META[fighter.type]?.maxCooldown || 30;
  return Math.max(0, (1 - Math.min(1, cooldown / maxCooldown)) * 0.24);
}

export function createCaption({ fighters = [], winner = null } = {}) {
  const names = fighters.map((fighter) => fighter.name).slice(0, 2);
  const winnerType = winner ? (CLASS_DEFS[winner.type]?.mechanicType || winner.type) : null;
  if (winnerType === "wizard") {
    const label = winner.type === "staff" ? "STAFF" : "HEX";
    return `${label} JUST DELETED ${names.find((name) => name !== winner.name) || "THE ARENA"} WITH THIS BURST`;
  }
  if (winner?.type === "crossbow") return "CROSSBOW WON WITH HIT-ACCELERATED ARROWS";
  if (winner?.type === "potion") return "POTION WON WITH AOE TONIC BURSTS";
  if (names.length === 2) return `WHO WINS: ${names[0]} OR ${names[1]}?`;
  return "THE LAST 5 SECONDS WERE WILD";
}

export function recordingFilename({ fighters = [], seed = 1, date = new Date() } = {}) {
  const names = fighters.map((fighter) => fighter.name.toLowerCase()).slice(0, 2).join("-vs-") || "orb-battle";
  const day = date.toISOString().slice(0, 10);
  return `orb-foundry-${names}-seed-${seed}-${day}.mp4`;
}
