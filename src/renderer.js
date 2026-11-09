import {
  ARENA,
  CLASS_DEFS,
  classicCutterZoneGeometryFor,
  classicCutterVisibleZoneGeometriesFor,
  classicOrbiterPosition,
  classicPulseBlade,
  classicSaberBlade,
  classicThrownSaberBlade,
  classicWdcSummonPunchPose,
  classicWeaponRenderAngle,
  getWeaponSegment,
} from "./simulation.js?v=20261109-classic-signature2";
import { WDC_SUMMONS } from "./classic-wdc-duel.js?v=20261109-classic-signature2";
import { CLASSIC_ALIENS, classicTeamOutlineColorFor } from "./classic-orbs.js?v=20261109-classic-signature2";
import { drawClassicSignatureAmbient, drawClassicSignatures } from "./classic-signature-renderer.js?v=20261109-classic-signature2";
import { CLASSIC_POWER_MOVES } from "./classic-powers.js?v=20261109-classic-signature2";
import { drawClassicLegacyPowerMotif } from "./classic-legacy-power-art.js?v=20261109-classic-signature2";
import { themeById } from "./presentation.js?v=20261109-classic-signature2";
import { WORLD_CUP_COUNTRIES, WORLD_CUP_MODE, WORLD_CUP_PICKUPS } from "./world-cup.js?v=20260703-world-cup-countries3";
import { KING_OF_HILL_MODE } from "./king-of-hill.js";
import { ORB_RACERS } from "./orb-race.js?v=20261108-arena-cut1";

const TAU = Math.PI * 2;
const PIXEL_FONT = "Roboto, Arial, sans-serif";
const CLASSIC_NUMBER_FONT = "Impact, Haettenschweiler, Arial Narrow Bold, sans-serif";

export function drawMotionStreak(ctx, points, radius, color) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  for (let index = 1; index < points.length; index += 1) {
    const from = points[index - 1];
    const to = points[index];
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    if (distance < 0.4 || distance > radius * 2.6) continue;
    const weight = index / (points.length - 1);
    ctx.lineWidth = radius * (0.34 + 0.8 * weight);
    ctx.globalAlpha = weight * 0.28;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
  ctx.restore();
}

// Classic keeps its own gameplay IDs, but shared identities should remain
// instantly recognizable to viewers who know Orb Race. These aliases only
// affect the Classic presentation color; physics, IDs, and Classic rules stay
// unchanged.
const CLASSIC_RACE_VISUAL_IDS = Object.freeze({
  duplicator: "duplicator",
  orbital: "orbital",
  unarmed: "unarmed",
  slammy: "slammy",
  vampire: "vampire",
  turret: "turret",
  flash: "flash",
  reactor: "reactor",
  sniper: "sniper",
  draftmaster: "draftmaster",
  "blue-sun": "blue-sun",
  "black-hole": "black-hole",
  "hydrogen-bomb": "hydrogen-bomb",
  poison: "poison",
  snake: "snake",
  shrapnel: "shrapnel",
  absorber: "roulette",
  batman: "batman",
  "ying-yang": "ying-yang",
  lazer: "lazer",
  charger: "charger",
  parasites: "parasite",
  grappler: "grappler",
  jackpot: "jackpot",
  sawball: "sawblade",
  artist: "artists",
  commander: "commander",
});

export function classicVisualColorFor(type, fallback = "#ffffff") {
  const raceId = CLASSIC_RACE_VISUAL_IDS[type] || type;
  return ORB_RACERS[raceId]?.color || fallback;
}

const classicInkCache = new Map();

export function classicBlackInkFor(color) {
  if (classicInkCache.has(color)) return classicInkCache.get(color);
  const base = /^#[0-9a-f]{6}$/i.test(color) ? color : "#f0f0f7";
  const rgb = [1, 3, 5].map((offset) => Number.parseInt(base.slice(offset, offset + 2), 16));
  const luminance = (channels) => channels.reduce((total, channel, index) => {
    const srgb = channel / 255;
    const linear = srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    return total + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);
  let legible = rgb;
  for (let blend = 0.10; luminance(legible) < 0.23 && blend <= 1; blend += 0.10) {
    legible = rgb.map((channel) => Math.round(channel + (250 - channel) * blend));
  }
  const ink = "#" + legible.map((channel) => channel.toString(16).padStart(2, "0")).join("");
  classicInkCache.set(color, ink);
  return ink;
}

export function classicFrostTrailAngleFor(entity) {
  const laidAngle = Number(entity?.laidAngle);
  if (Number.isFinite(laidAngle)) return laidAngle;
  const legacyAngle = Number(entity?.angle);
  return Number.isFinite(legacyAngle) ? legacyAngle : 0;
}

// Zeus electrification is a deterministic, target-owned presentation pulse.
// Keeping the timing helper pure makes the white flash identical at 30 and 60
// FPS and keeps it independent from the simulation's damage amount.
export function classicZeusElectrifiedPulseFor(fighter, time = 0) {
  const until = Number(fighter?.classicZeusElectrifiedUntil) || 0;
  if (until <= time) return 0;
  const startedAt = Number.isFinite(Number(fighter?.classicZeusElectrifiedStartedAt))
    ? Number(fighter.classicZeusElectrifiedStartedAt)
    : Math.max(0, until - 0.46);
  const duration = Math.max(0.08, until - startedAt || 0.46);
  const progress = Math.max(0, Math.min(1, (time - startedAt) / duration));
  return Math.sin(Math.PI * progress);
}

// Deterministic jagged points for Zeus's hand bolt and the center chain. The
// endpoints are exact so a cast visibly originates at the hand and terminates
// on the seeded node instead of hovering short of either contact.
export function classicZeusLightningPoints(fromX, fromY, toX, toY, time = 0, seed = 0, segments = 6) {
  const safeSegments = Math.max(2, Math.floor(Number(segments) || 6));
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.hypot(dx, dy) || 1;
  const normalX = -dy / length;
  const normalY = dx / length;
  const amplitude = Math.min(22, Math.max(3, length * 0.075));
  return Array.from({ length: safeSegments + 1 }, (_, index) => {
    if (index === 0) return { x: fromX, y: fromY };
    if (index === safeSegments) return { x: toX, y: toY };
    const progress = index / safeSegments;
    const wobble = Math.sin(time * 24 + seed * 1.73 + index * 2.41) * amplitude;
    return {
      x: fromX + dx * progress + normalX * wobble,
      y: fromY + dy * progress + normalY * wobble,
    };
  });
}

// Keep Classic Turret's projectiles in lockstep with the black/orange mine
// silhouette used by Orb Racer Splodey. The Orb Race mine radius is normalized
// to the race track width, so the Classic equivalent uses the fixed 720px
// arena width rather than the projectile's smaller physics radius.
const CLASSIC_SPLODEY_BOMB_RADIUS_RATIO = 0.012;

export function classicSplodeyBombRadiusFor() {
  return Math.max(7, ARENA.width * CLASSIC_SPLODEY_BOMB_RADIUS_RATIO);
}

export function classicSplodeyBombStyleFor(blackTheme = false) {
  return {
    fill: blackTheme ? "#ffffff" : "#050505",
    stroke: "#080808",
    highlight: "#ff8a1f",
  };
}

// The Classic simulation keeps a 24px safety margin for the default square
// collision space, while the social canvas presents the full 720px square as
// the visible arena border. Wall-mounted presentation geometry must use the
// latter coordinates or it appears to float one padding-width inside the
// border. Gameplay coordinates remain untouched; this is render-space only.
export function classicVisibleArenaPointFor(sim, point) {
  const x = Number(point?.x);
  const y = Number(point?.y);
  if (![x, y].every(Number.isFinite)) return { x, y };
  const bounds = sim?.arenaBounds;
  const isDefaultSquare = sim?.gameplayMode === "classic"
    && sim?.arenaShape !== "circle"
    && bounds
    && bounds.x === ARENA.padding
    && bounds.y === ARENA.padding
    && bounds.width === ARENA.width - ARENA.padding * 2
    && bounds.height === ARENA.height - ARENA.padding * 2;
  if (!isDefaultSquare) return { x, y };
  return {
    x: (x - bounds.x) * ARENA.width / bounds.width,
    y: (y - bounds.y) * ARENA.height / bounds.height,
  };
}

// Classic gun silhouettes follow Orb Racer's 1.75 visual scale. Ammunition is
// deliberately larger than the previous Classic pass so the straight shots
// remain readable in portrait exports.
const CLASSIC_GUN_RENDER_SCALE = 1.75;
// The standalone Pistol/Shotgun/Rifle bodies use the compact held-gun
// proportion from Orb Racer. Draftmaster, Grappler, and Turret keep the
// larger dedicated-weapon scale above.
const CLASSIC_GUN_ORB_RENDER_SCALE = 0.9;
const CLASSIC_GUN_PROJECTILE_RENDER_SCALE = 6;
const CLASSIC_SHOTGUN_PROJECTILE_SCALE = 1.8;
const CLASSIC_SNIPER_PROJECTILE_SCALE = 0.75;
const CLASSIC_RIFLE_PROJECTILE_SCALE = 0.5;
const CLASSIC_FAIRY_PROJECTILE_RENDER_SCALE = 3.3;
const CLASSIC_GLASS_RENDER_SCALE = 2;
const CLASSIC_GUN_HANDLE_OVERLAP = 0.34;
const CLASSIC_GUN_SHEET_FRAME_COUNT = 3;
const CLASSIC_TRIDENT_THROW_PHASES = new Set(["outbound", "stuck-wall", "stuck-orb", "returning"]);
const CLASSIC_NECROMANCER_ARROW_RENDER_SCALE = 3.75;
const CLASSIC_NECROMANCER_BOW_FRAME_COUNT = 4;
const CLASSIC_NECROMANCER_BOW_RENDER_SCALE = 2;
// Trapper's generated cells are now square and are drawn without source
// distortion. The deployed ring is intentionally twice the previous
// diameter, while the held loop gets a separate larger accessory scale.
const CLASSIC_TRAPPER_LASSO_LOOP_SCALE = 3.64;
const CLASSIC_TRAPPER_HELD_LASSO_SCALE = 5.16;
const CLASSIC_TRAPPER_LASSO_WIDTH_SCALE = 1.18;
const CLASSIC_TRAPPER_HELD_LASSO_SPIN_TURNS = 1.25;
const CLASSIC_IMPACT_BURST_DURATION = 0.82;
const CLASSIC_IMPACT_BURST_PARTICLES = 64;
const CLASSIC_DESTRUCTION_BURST_DURATION = 0.52;
const CLASSIC_DESTRUCTION_BURST_PARTICLES = 72;
const CLASSIC_PARASITE_CARRIER_RENDER_SCALE = 1.25;
const CLASSIC_BULLET_IMPACT_KINDS = new Set([
  "projectile",
  "sniper-ammo",
  "pistol-ammo",
  "shotgun-ammo",
  "rifle-ammo",
  "draftmaster-ammo",
  "shrapnel",
  "batarang",
  "fairy-ammo",
  "necromancer-arrow",
  "bee",
  "parasite",
  "train",
  "commander-round",
  "charger",
]);
const CLASSIC_RED_IMPACT_PALETTE = Object.freeze([
  "#ff1838",
  "#ff304d",
  "#e90f2f",
  "#c90827",
  "#ff5a68",
]);
const CLASSIC_BROWN_IMPACT_PALETTE = Object.freeze([
  "#4a2418",
  "#68321f",
  "#874322",
  "#a95a2d",
  "#d1844b",
]);

export function classicBoxerSmokeAlpha(age, duration = 0.5) {
  const safeDuration = Math.max(0.001, Number(duration) || 0.5);
  return Math.max(0, Math.min(1, 1 - Math.max(0, Number(age) || 0) / safeDuration));
}

export function classicTridentImpactAlpha(age, duration = CLASSIC_IMPACT_BURST_DURATION) {
  const safeDuration = Math.max(0.001, Number(duration) || CLASSIC_IMPACT_BURST_DURATION);
  return Math.max(0, Math.min(1, 1 - Math.max(0, Number(age) || 0) / safeDuration));
}

export function classicImpactPaletteFor(surface = "orb") {
  return surface === "wall" ? CLASSIC_BROWN_IMPACT_PALETTE : CLASSIC_RED_IMPACT_PALETTE;
}

export function classicSniperWeaponSourceRect(spriteWidth, spriteHeight, cell = 0) {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  const cellWidth = width / 2;
  const safeCell = Math.max(0, Math.min(1, Math.floor(Number(cell) || 0)));
  // Match Orb Racer's full-cell attachment. The keyed final is transparent
  // outside the authored weapon, so keeping the complete cell preserves the
  // stock, scope, grip, and barrel proportions while excluding only the thin
  // source matte at the sheet edge. A shallow crop made the Classic gun read
  // like a floating strip and could expose the matte as a black box when the
  // weapon rotated.
  const inset = Math.min(cellWidth * 0.03, height * 0.03);
  return {
    x: safeCell * cellWidth + inset,
    y: inset,
    width: cellWidth - inset * 2,
    height: height - inset * 2,
  };
}

export function classicSniperHeldPose(radius, sourceWidth = 1, sourceHeight = 1) {
  const normalizedRadius = Math.max(1, Number(radius) || 1);
  const width = normalizedRadius * 4.4;
  const aspect = Math.max(0.01, Number(sourceHeight) || 1) / Math.max(0.01, Number(sourceWidth) || 1);
  return {
    width,
    height: width * aspect,
    mountX: -width * 0.38,
  };
}

const CLASSIC_DRAFTMASTER_GUN_ASSET = "draftmasterEquipment";
const CLASSIC_DRAFTMASTER_AMMO_ASSET = "draftmasterAmmo";
const CLASSIC_SNIPER_AMMO_ASSET = "sniperAmmo";

// The shared Draftmaster sheet is intentionally used only by the three
// authorized gun orbs. Keeping these crops in one pure helper makes the
// attachment and projectile renderers agree about which generated cell they
// are drawing without copying the race renderer's canvas code.
export function classicDraftmasterGunSourceRect(spriteWidth, spriteHeight, gunType = "pistol") {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  const cellWidth = width / 4;
  const cellHeight = height / 2;
  const normalized = String(gunType || "pistol").toLowerCase();
  const level = normalized === "shotgun" ? 2 : normalized === "rifle" ? 1 : 0;
  const column = level === 0 ? 2 : level === 1 ? 3 : 0;
  const row = level === 2 ? 1 : 0;
  return {
    x: column * cellWidth,
    y: row * cellHeight,
    width: level === 0 ? cellWidth * 0.82 : cellWidth,
    height: cellHeight,
  };
}

// The generated Classic rifle sheet is authored with its grip on the lower
// edge. Flip only its local vertical axis after aiming so the muzzle still
// points at the opponent while the held rifle is not rendered upside down.
export function classicGunBodyFlipYFor(gunType = "pistol") {
  return String(gunType || "pistol").toLowerCase() === "rifle" ? -1 : 1;
}

export function classicDraftmasterAmmoSourceRect(spriteWidth, spriteHeight, kind = "pistol-ammo") {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  const cellWidth = width / 3;
  const normalized = String(kind || "pistol-ammo").toLowerCase();
  const column = normalized === "shotgun-ammo" ? 2 : normalized === "pistol-ammo" ? 0 : 1;
  return {
    x: column * cellWidth,
    y: 0,
    width: cellWidth,
    height,
  };
}

export function classicShotgunAmmoSourceRect(spriteWidth, spriteHeight, frame = 0) {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  const cellWidth = width / 3;
  const safeFrame = Math.max(0, Math.min(2, Math.floor(Number(frame) || 0)));
  // Alpha bounds measured from the generated 724×724 cells. Cropping to the
  // authored shell keeps the chroma-clean sheet's square cells from making
  // the projectile look stretched or from carrying transparent padding.
  const bounds = [
    { x: 151 / 724, y: 294 / 724, width: 376 / 724, height: 138 / 724 },
    { x: 140 / 724, y: 295 / 724, width: 466 / 724, height: 137 / 724 },
    { x: 128 / 724, y: 289 / 724, width: 525 / 724, height: 151 / 724 },
  ][safeFrame];
  return {
    x: safeFrame * cellWidth + bounds.x * cellWidth,
    y: bounds.y * height,
    width: bounds.width * cellWidth,
    height: bounds.height * height,
  };
}

export function classicGunSheetSourceRect(spriteWidth, spriteHeight, frame = 0) {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  const cellWidth = width / CLASSIC_GUN_SHEET_FRAME_COUNT;
  const safeFrame = Math.max(0, Math.min(CLASSIC_GUN_SHEET_FRAME_COUNT - 1, Math.floor(Number(frame) || 0)));
  return {
    x: safeFrame * cellWidth,
    // GPT placed the compact gun row in the lower strip of the upper half of
    // the square sheet. Cropping the transparent padding preserves the real
    // weapon aspect instead of compressing it into an invisible hairline.
    y: height * 0.38,
    width: cellWidth,
    height: height * 0.12,
  };
}

// The Boxer sheet keeps generous transparent padding around each stacked
// glove. Crop to the authored alpha bounds so the gloves read at the same
// prominence as the supplied reference instead of shrinking inside a full
// 512px cell. Values are normalized to each 1/3 × 1/2 sheet cell.
export function classicBoxerGloveSourceRect(spriteWidth, spriteHeight, frame = 0, row = 0) {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  const cellWidth = width / 3;
  const cellHeight = height / 2;
  const safeFrame = Math.max(0, Math.min(2, Math.floor(Number(frame) || 0)));
  const safeRow = Math.max(0, Math.min(1, Math.floor(Number(row) || 0)));
  const bounds = safeRow === 0
    ? [[94, 173, 311, 245], [87, 173, 355, 245], [62, 173, 420, 245]][safeFrame]
    : [[94, 58, 311, 245], [87, 58, 355, 245], [62, 58, 420, 245]][safeFrame];
  return {
    x: safeFrame * cellWidth + bounds[0] / 512 * cellWidth,
    y: safeRow * cellHeight + bounds[1] / 512 * cellHeight,
    width: bounds[2] / 512 * cellWidth,
    height: bounds[3] / 512 * cellHeight,
  };
}

export function classicSniperAmmoSourceRect(spriteWidth, spriteHeight, kind = "pistol-ammo") {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  const cellWidth = width / 2;
  const cell = ["rifle-ammo", "sniper-ammo"].includes(String(kind || "pistol-ammo").toLowerCase()) ? 1 : 0;
  return {
    x: cell * cellWidth,
    y: 0,
    width: cellWidth,
    height,
  };
}

export function classicTridentSourceRect(spriteWidth, spriteHeight) {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  // Alpha-bounded crop for the generated horizontal trident. The padded
  // source stays preserved, while this crop prevents transparent margins from
  // making the attached weapon appear undersized.
  return {
    x: width * 0.055,
    y: height * 0.31,
    width: width * 0.89,
    height: height * 0.35,
  };
}

export function classicSwordSourceRect(spriteWidth, spriteHeight) {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  // Keep the full diagonal authored cell. The prior shallow crop kept the
  // blade but cut away the lower-right hilt/handle, which made the orb appear
  // to cover the weapon at the attachment point.
  return {
    x: width * 0.01,
    y: height * 0.01,
    width: width * 0.88,
    height: height * 0.9,
  };
}

export function classicSwordHeldPose(radius, {
  attackMode = "swing",
  phase = "idle",
  extension = 0,
} = {}) {
  const normalizedRadius = Math.max(1, Number(radius) || 1);
  const normalizedExtension = Math.max(0, Math.min(1, Number(extension) || 0));
  const poke = String(attackMode || "swing").toLowerCase() === "poke";
  return {
    handleStart: normalizedRadius * 1.02,
    handleEnd: normalizedRadius * (1.18 + (poke ? normalizedExtension * 0.25 : 0)),
    guardDistance: normalizedRadius * (1.14 + (poke ? normalizedExtension * 0.25 : 0)),
    // The sprite is positioned by its hilt anchor, not its image center. This
    // keeps the handle just beyond the orb rim while the blade points out.
    // Keep the hilt visibly outside the orb rim. The orb is the hand/body;
    // the generated blade is a top-layer accessory, so its handle must never
    // disappear underneath the body.
    mountDistance: normalizedRadius * (1.34 + (poke ? normalizedExtension * 0.28 : 0)),
    phase: String(phase || "idle"),
    attackMode: poke ? "poke" : "swing",
    extension: normalizedExtension,
  };
}

function classicSwordOverlayPose({
  phase = "idle",
  attackMode = "swing",
  elapsed = 0,
  windup = 0.18,
  active = 0.18,
  followThrough = 0.22,
} = {}) {
  const mode = String(attackMode || "swing").toLowerCase() === "poke" ? "poke" : "swing";
  const safeElapsed = Math.max(0, Number(elapsed) || 0);
  const activeStart = windup;
  const activeEnd = activeStart + active;
  const followEnd = activeEnd + followThrough;
  if (phase === "windup") {
    const progress = Math.max(0, Math.min(1, safeElapsed / Math.max(0.001, windup)));
    return mode === "poke"
      ? { swingOffset: -0.12 + progress * 0.12, extension: progress * 0.18 }
      : { swingOffset: -0.86 + progress * 0.16, extension: 0 };
  }
  if (phase === "active") {
    const progress = Math.max(0, Math.min(1, (safeElapsed - activeStart) / Math.max(0.001, active)));
    return mode === "poke"
      ? { swingOffset: 0, extension: 0.18 + progress * 0.82 }
      // Two complete back-and-forth passes make the slash read as a real
      // repeated swing instead of a single slow rotation.
      : { swingOffset: Math.sin(progress * TAU * 2 - Math.PI * 0.5) * 0.82, extension: 0 };
  }
  if (phase.includes("follow")) {
    const progress = Math.max(0, Math.min(1, (safeElapsed - activeEnd) / Math.max(0.001, followThrough)));
    return mode === "poke"
      ? { swingOffset: 0, extension: 1 - progress }
      : { swingOffset: 0.68 - progress * 0.62, extension: 0 };
  }
  // Keep the held weapon pointed at the opponent between attacks.
  return { swingOffset: 0, extension: 0 };
}

export function classicTridentDimensions(radius) {
  const normalizedRadius = Math.max(1, Number(radius) || 1);
  return {
    width: normalizedRadius * 4.9,
    height: normalizedRadius * 2.3,
  };
}

export function classicDedicatedWeaponSourceRect(spriteWidth, spriteHeight, weapon = "grappler") {
  const width = Math.max(1, Number(spriteWidth) || 1);
  const height = Math.max(1, Number(spriteHeight) || 1);
  const normalized = String(weapon || "grappler").toLowerCase();
  const crops = {
    grappler: { x: 0.093, y: 0.297, width: 0.82, height: 0.412 },
    turret: { x: 0.106, y: 0.244, width: 0.793, height: 0.498 },
    "grappler-hook": { x: 0.36, y: 0.261, width: 0.388, height: 0.465 },
  };
  const crop = crops[normalized] || crops.grappler;
  return {
    x: width * crop.x,
    y: height * crop.y,
    width: width * crop.width,
    height: height * crop.height,
  };
}

export function classicLazerPathFor(entity, {
  width = ARENA.width,
  height = ARENA.height,
  padding = 0,
} = {}) {
  const activeSegment = entity?.activeSegment
    || (Array.isArray(entity?.segments) ? entity.segments.find((segment) => segment.active) : null)
    || (Array.isArray(entity?.segments) ? entity.segments.at(-1) : null);
  const previous = activeSegment?.startWallContact
    || entity?.previousWallContact
    || entity?.wallStart
    || entity?.rayStart;
  const next = activeSegment?.endWallContact
    || entity?.nextWallContact
    || entity?.wallEnd
    || entity?.rayEnd;
  const x1 = Number(activeSegment?.x1 ?? previous?.x ?? entity?.x);
  const y1 = Number(activeSegment?.y1 ?? previous?.y ?? entity?.y);
  const x2 = Number(activeSegment?.x2 ?? next?.x ?? entity?.x2 ?? entity?.endX);
  const y2 = Number(activeSegment?.y2 ?? next?.y ?? entity?.y2 ?? entity?.endY);
  if (![x1, y1, x2, y2].every(Number.isFinite)) return null;
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const start = {
    x: clamp(x1, padding, width - padding),
    y: clamp(y1, padding, height - padding),
  };
  const end = {
    x: clamp(x2, padding, width - padding),
    y: clamp(y2, padding, height - padding),
  };
  return {
    points: [start, end],
    start,
    end,
    angle: Math.atan2(end.y - start.y, end.x - start.x),
  };
}

export function classicLazerSegmentsFor(entity, {
  width = ARENA.width,
  height = ARENA.height,
  padding = 0,
} = {}) {
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const source = Array.isArray(entity?.segments) && entity.segments.length > 0
    ? entity.segments
    : [entity?.activeSegment || entity].filter(Boolean);
  return source.map((segment) => {
    const x1 = Number(segment.x1 ?? segment.startWallContact?.x ?? segment.x);
    const y1 = Number(segment.y1 ?? segment.startWallContact?.y ?? segment.y);
    const x2 = Number(segment.x2 ?? segment.endWallContact?.x ?? segment.x2);
    const y2 = Number(segment.y2 ?? segment.endWallContact?.y ?? segment.y2);
    if (![x1, y1, x2, y2].every(Number.isFinite)) return null;
    const start = { x: clamp(x1, padding, width - padding), y: clamp(y1, padding, height - padding) };
    const end = { x: clamp(x2, padding, width - padding), y: clamp(y2, padding, height - padding) };
    return {
      ...segment,
      start,
      end,
      angle: Math.atan2(end.y - start.y, end.x - start.x),
    };
  }).filter(Boolean);
}

// A few generated horizontal sheets retain opaque white layout guides from
// their chroma-key artboards. Keep the authored source/final files intact,
// but crop those guides at the shared draw boundary so no export can show a
// white box around a Fairy accessory or Frost particle frame.
const CLASSIC_SHEET_CROP_INSETS = Object.freeze({
  fairyAccessories: Object.freeze({ frameCount: 8, left: 6, right: 6, top: 150, bottom: 146 }),
  // The user-supplied Snowball strip is already alpha-clean at each frame
  // edge. Keep the full 543×724 cells so the authored ice band is never
  // clipped before adjacent trail stamps overlap.
  frostTrail: Object.freeze({ frameCount: 4, left: 0, right: 0, top: 0, bottom: 0 }),
  frozenOrbOverlay: Object.freeze({ frameCount: 4, left: 0, right: 0, top: 0, bottom: 0 }),
  glassDrops: Object.freeze({ frameCount: 4, left: 10, right: 10, top: 8, bottom: 8 }),
  zeusGreekCircles: Object.freeze({ frameCount: 4, left: 10, right: 10, top: 8, bottom: 8 }),
});

// The Fairy sheet has six wing poses followed by the tiara and wand. These
// authored bounds remove the white artboard guides without resampling the
// actual pixel art. The wing flap deliberately uses the two upright poses;
// the low poses remain available in the source pack for future attacks.
const CLASSIC_FAIRY_ACCESSORY_ART_RECTS = Object.freeze([
  Object.freeze({ x: 48, y: 156, width: 190, height: 420 }),
  Object.freeze({ x: 4, y: 156, width: 214, height: 420 }),
  Object.freeze({ x: 4, y: 318, width: 258, height: 250 }),
  Object.freeze({ x: 42, y: 156, width: 185, height: 420 }),
  Object.freeze({ x: 4, y: 160, width: 226, height: 412 }),
  Object.freeze({ x: 2, y: 316, width: 262, height: 252 }),
  Object.freeze({ x: 0, y: 224, width: 271, height: 292 }),
  Object.freeze({ x: 0, y: 154, width: 215, height: 426 }),
]);

export function classicSheetCropFor(id, {
  naturalWidth = 1,
  naturalHeight = 1,
  frameCount = 1,
  frame = 0,
} = {}) {
  const width = Math.max(1, Number(naturalWidth) || 1);
  const height = Math.max(1, Number(naturalHeight) || 1);
  const safeFrameCount = Math.max(1, Math.floor(Number(frameCount) || 1));
  const frameWidth = width / safeFrameCount;
  const safeFrame = Math.max(0, Math.min(safeFrameCount - 1, Math.floor(Number(frame) || 0)));
  const inset = CLASSIC_SHEET_CROP_INSETS[id];
  const left = Math.max(0, Math.min(frameWidth * 0.45, Number(inset?.left) || 0));
  const right = Math.max(0, Math.min(frameWidth * 0.45, Number(inset?.right) || 0));
  const top = Math.max(0, Math.min(height * 0.45, Number(inset?.top) || 0));
  const bottom = Math.max(0, Math.min(height * 0.45, Number(inset?.bottom) || 0));
  return {
    x: safeFrame * frameWidth + left,
    y: top,
    width: Math.max(1, frameWidth - left - right),
    height: Math.max(1, height - top - bottom),
  };
}

export function classicFairyAccessoryCropFor(frame = 0) {
  const safeFrame = Math.max(0, Math.min(
    CLASSIC_FAIRY_ACCESSORY_ART_RECTS.length - 1,
    Math.floor(Number(frame) || 0),
  ));
  const cellWidth = 2172 / 8;
  const rect = CLASSIC_FAIRY_ACCESSORY_ART_RECTS[safeFrame];
  return {
    x: safeFrame * cellWidth + rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
}

// The generated Cowboy accessory sheet is a two-item atlas. The hat occupies
// the first half; the cigar's usable pixels occupy a smaller rectangle in the
// second half. Cropping to the authored cigar bounds keeps the ember/body
// crisp and gives the cigarette a readable size instead of scaling the empty
// half-cell around it.
export function classicTrapperCigarSourceRect(spriteWidth = 1536, spriteHeight = 1024) {
  const width = Math.max(1, Number(spriteWidth) || 1536);
  const height = Math.max(1, Number(spriteHeight) || 1024);
  return {
    x: width * (994 / 1536),
    y: height * (447 / 1024),
    width: width * (396 / 1536),
    height: height * (162 / 1024),
  };
}

const CLASSIC_PRESENTATION_SPRITES = Object.freeze({
  flash: "./assets/race/flash-symbol.png",
  batman: "./assets/race/batman-symbol.png",
  // The v3 body is a single generated/alpha-cleaned orb with the pointy
  // silhouette integrated. Keep v2 ears as a fallback for older cached packs.
  batmanOrb: "./assets/generated/classic-visual-20260811-v4/final/batman-orb-with-ears.png",
  batmanEars: "./assets/generated/classic-visual-20260811-v2/final/batman-ears.png",
  batmanBatarang: "./assets/generated/classic-visual-20260811-v2/final/batman-batarang.png",
  classicTeleport: "./assets/race/generated/black-hole-teleport.png",
  "black-hole": "./assets/race/generated/black-hole-orb.png",
  "hydrogen-bomb": "./assets/race/hydrogen-bomb-symbol.png",
  // Sniper is explicitly the Orb Racer-style held weapon. Reuse the
  // dedicated same-fighter sheet whose keyed alpha keeps the dark rifle
  // visible in Classic's black theme without a matte box.
  sniper: "./assets/generated/orb-race-simple-20260731/final/sniper-weapons.png",
  shrapnel: "./assets/generated/orb-race-tactical-20260731/final/shrapnel-orb.png",
  shrapnelSheet: "./assets/generated/orb-race-tactical-20260731/final/shrapnel-sheet.png",
  absorber: "./assets/generated/orb-race-tactical-20260731/final/roulette-orb.png",
  commander: "./assets/generated/orb-race-tactical-20260802/final/commander-orb.png",
  artistFairy: "./assets/generated/orb-race-media-20260805-procedural-artists/fairy-sprite.png",
  artistMonster: "./assets/generated/orb-race-media-20260805-procedural-artists/monster-sprite.png",
  draftmasterEquipment: "./assets/generated/orb-race-expansion-20260729/final/draftmaster-equipment.png",
  draftmasterAmmo: "./assets/generated/orb-race-expansion-20260729/final/draftmaster-ammo.png",
  sawball: "./assets/generated/classic-weapons-20260808/final/sawball-blade.png",
  tridentWeapon: "./assets/generated/classic-weapons-20260808/final/trident-weapon.png",
  grapplerGun: "./assets/generated/classic-weapons-20260808/final/grappler-gun.png",
  grapplerHook: "./assets/generated/classic-weapons-20260808/final/grappler-hook.png",
  turretCannon: "./assets/generated/classic-weapons-20260808/final/turret-cannon.png",
  trapper: "./assets/generated/classic-trapper-20260807/final/trapper-accessories.png",
  boxer: "./assets/generated/classic-media-20260808-boxer-v3/final/boxer-gloves-sheet.png",
  monsterFists: "./assets/generated/classic-visual-20260810-v2/final/monster-fists-sheet.png",
  shotgunWeapon: "./assets/generated/classic-visual-20260810-v2/final/shotgun-sheet.png",
  rifleWeapon: "./assets/generated/classic-visual-20260810-v2/final/rifle-sheet.png",
  shotgunAmmo: "./assets/generated/classic-visual-20260810-v3/final/shotgun-shells-sheet.png",
  necromancerArrows: "./assets/generated/classic-visual-20260810-v2/final/necromancer-arrows-sheet.png",
  necromancerBowAnimation: "./assets/generated/classic-necromancer-bow-20260810-v1/final/necromancer-bow-animation-sheet.png",
  sniperAmmo: "./assets/generated/classic-visual-20260810-v2/final/sniper-ammo-sheet.png",
  necromancer: "./assets/generated/classic-media-20260808/final/necromancer-skull-sheet.png",
  trapperLasso: "./assets/generated/classic-visual-20260810-v6/final/trapper-lasso-animation-sheet.png",
  virus: "./assets/generated/classic-visual-20260810-v4/final/virus-orb.png",
  // Hive and Apple bodies remain ordinary Classic orbs. These generated
  // assets are reserved for their attacks, so HP is never buried under art.
  hiveBee: "./assets/generated/classic-hive-apple-20260811-v1/final/hive-bee-projectile.png",
  appleProjectile: "./assets/generated/classic-hive-apple-20260811-v1/final/apple-orb-projectile.png",
  glassDrops: "./assets/generated/classic-visual-20260811-v1/final/glass-drops.png",
  zeusGreekCircles: "./assets/generated/classic-visual-20260811-v1/final/zeus-greek-circles.png",
  frostTrail: "./assets/generated/classic-visual-20260812-frost-trail-v3/final/frost-trail.png",
  snowballOrb: "./assets/generated/orb-race-simple-20260731/final/snowball-orb.png",
  frozenOrbOverlay: "./assets/generated/classic-visual-20260812-frost-freeze-v1/final/frozen-orb-overlay.png",
  zeusChainLightning: "./assets/generated/classic-visual-20260811-v2/final/zeus-chain-lightning.png",
  fairyAccessories: "./assets/generated/classic-visual-20260811-v2/final/fairy-accessories.png",
  fairyProjectile: "./assets/generated/classic-visual-20260811-v2/final/fairy-projectile.png",
});

// These Classic fighters have a dedicated accessory pass in
// drawClassicOrbDetails. Do not also render the legacy generic weapon bar
// underneath the generated weapon: it double-renders the silhouette and can
// obscure the orb's centered HP.
const CLASSIC_DEDICATED_WEAPON_TYPES = new Set([
  "sword",
  "vampire",
  "turret",
  "sniper",
  "draftmaster",
  "necromancer",
  "pistol",
  "shotgun",
  "rifle",
  "sawball",
  "trident",
  "grappler",
  "boxer",
]);
const SOCIAL_ORB_MARKS = Object.freeze({
  sword: "SW",
  bow: "BW",
  potion: "PT",
  axe: "AX",
  dagger: "DG",
  katana: "KT",
  duplicator: "D",
  orbital: "O",
  unarmed: "U",
  grower: "G",
  slammy: "SL",
});
const LEGACY_PIXEL_WEAPON_PROFILES = {
  fire: Object.freeze({
    silhouette: "chunky-ember-sword",
    family: "sword",
    src: "./assets/generated/orb-foundry-pixel-set/final/cinder-fire-sword.png",
    anchorX: 8 / 192,
    anchorY: 0.5,
    tipX: 184 / 192,
  }),
  ice: Object.freeze({
    silhouette: "chunky-frost-axe",
    family: "axe",
    src: "./assets/generated/orb-foundry-pixel-set/final/frost-axe.png",
    anchorX: 8 / 192,
    anchorY: 0.5,
    tipX: 130 / 192,
  }),
  wizard: Object.freeze({
    silhouette: "chunky-rune-wand",
    family: "wand",
    src: "./assets/generated/orb-foundry-pixel-set/final/hex-rune-wand.png",
    anchorX: 8 / 192,
    anchorY: 0.5,
    tipX: 184 / 192,
  }),
  time: Object.freeze({
    silhouette: "chunky-hour-glaive",
    family: "glaive",
    src: "./assets/generated/orb-foundry-pixel-set/final/chrono-hour-glaive.png",
    anchorX: 8 / 192,
    anchorY: 0.5,
    tipX: 184 / 192,
  }),
  volta: Object.freeze({
    silhouette: "chunky-lightning-fork",
    family: "charged-polearm",
    src: "./assets/generated/orb-foundry-pixel-set/final/volta-lightning-fork.png",
    anchorX: 8 / 192,
    anchorY: 0.5,
    tipX: 184 / 192,
  }),
  venom: Object.freeze({
    silhouette: "chunky-poison-sword",
    family: "sword",
    src: "./assets/generated/orb-foundry-pixel-set/final/venom-poison-sword.png",
    anchorX: 8 / 192,
    anchorY: 0.5,
    tipX: 184 / 192,
  }),
  gravis: Object.freeze({
    silhouette: "chunky-gravity-mace",
    family: "mace",
    src: "./assets/generated/orb-foundry-pixel-set/final/gravis-gravity-mace.png",
    anchorX: 8 / 192,
    anchorY: 0.5,
    tipX: 148 / 192,
  }),
  echo: Object.freeze({
    silhouette: "chunky-resonance-blade",
    family: "sword",
    src: "./assets/generated/orb-foundry-expansion-pixel-set/final/echo-resonance-blade.png",
    anchorX: 8 / 192,
    anchorY: 0.5,
    tipX: 184 / 192,
  }),
  forge: Object.freeze({
    silhouette: "chunky-temper-hammer",
    family: "hammer",
    src: "./assets/generated/orb-foundry-expansion-pixel-set/final/forge-temper-hammer.png",
    anchorX: 8 / 192,
    anchorY: 0.5,
    tipX: 132 / 192,
  }),
  static: Object.freeze({
    silhouette: "chunky-charge-spike",
    family: "electric-spike",
    src: "./assets/generated/orb-foundry-expansion-pixel-set/final/static-charge-spike.png",
    anchorX: 8 / 192,
    anchorY: 0.5,
    tipX: 184 / 192,
  }),
};

const WEAPON_PIXEL_PROFILES = {
  sword: Object.freeze({
    silhouette: "classic-pixel-sword",
    family: "sword",
    src: "./assets/generated/classic-weapon-rework/final/sword.png",
    anchorX: 0.8,
    anchorY: 0.82,
  }),
  bow: Object.freeze({
    silhouette: "classic-pixel-bow",
    family: "bow",
    src: "./assets/generated/classic-weapon-rework/final/bow.png",
    anchorX: 0.5,
    anchorY: 0.5,
  }),
  potion: Object.freeze({
    silhouette: "classic-pixel-potion",
    family: "potion",
    src: "./assets/generated/classic-weapon-rework/final/potion.png",
    anchorX: 0.5,
    anchorY: 0.5,
  }),
  axe: Object.freeze({
    silhouette: "classic-pixel-axe",
    family: "axe",
    src: "./assets/generated/classic-weapon-rework/final/axe.png",
    anchorX: 0.8,
    anchorY: 0.82,
  }),
  dagger: Object.freeze({
    silhouette: "classic-pixel-dagger",
    family: "dagger",
    src: "./assets/generated/classic-weapon-rework/final/dagger.png",
    anchorX: 0.8,
    anchorY: 0.82,
  }),
  katana: Object.freeze({
    silhouette: "classic-pixel-katana",
    family: "katana",
    src: "./assets/generated/classic-weapon-rework/final/katana.png",
    anchorX: 0.8,
    anchorY: 0.82,
  }),
};

const PIXEL_WEAPON_PROFILES_MUTABLE = { sword: WEAPON_PIXEL_PROFILES.sword };
export const PIXEL_WEAPON_PROFILES = Object.freeze(PIXEL_WEAPON_PROFILES_MUTABLE);
export const PIXEL_GEAR_PROFILES = Object.freeze({
  aegis: Object.freeze({
    silhouette: "chunky-viking-helmet",
    family: "helmet",
    src: "./assets/generated/orb-foundry-pixel-set/final/aegon-viking-helmet.png",
  }),
  shade: Object.freeze({
    silhouette: "chunky-shadow-hood",
    family: "hood",
    src: "./assets/generated/orb-foundry-expansion-pixel-set/final/shade-shadow-hood.png",
  }),
});
export const PIXEL_EFFECT_PROFILES = Object.freeze({
  bowArrow: Object.freeze({
    src: "./assets/generated/classic-weapon-rework/final/bow-arrow.png",
  }),
  impactRegular: Object.freeze({
    src: "./assets/generated/orb-foundry-impact-frames/final/impact-regular.png",
  }),
  impactCritical: Object.freeze({
    src: "./assets/generated/orb-foundry-impact-frames/final/impact-critical.png",
  }),
  impactCollision: Object.freeze({
    src: "./assets/generated/orb-foundry-impact-frames/final/impact-collision.png",
  }),
  aegonImpact: Object.freeze({
    src: "./assets/generated/orb-foundry-pixel-set/final/aegon-collision-impact.png",
  }),
  mirageDecoy: Object.freeze({
    src: "./assets/generated/orb-foundry-expansion-pixel-set/final/mirage-decoy-orb.png",
  }),
  echoReplay: Object.freeze({
    src: "./assets/generated/orb-foundry-expansion-pixel-set/final/echo-replay-impact.png",
  }),
  forgeHeatDrop: Object.freeze({
    src: "./assets/generated/orb-foundry-expansion-pixel-set/final/forge-heat-drop.png",
  }),
  staticZap: Object.freeze({
    src: "./assets/generated/orb-foundry-expansion-pixel-set/final/static-chain-zap.png",
  }),
});
const CLASSIC_HIT_EFFECT_KINDS = new Set([
  "impact",
  "weapon-hit",
  "weapon-clash",
  "arcane-burst-hit",
  "hailstorm-hit",
  "ember",
  "poison",
  "ranged-hit",
  "potion-aoe-hit",
  "volta-bolt-hit",
  "collision-hit",
  "classic-slam",
  "invulnerable-block",
  "knockout",
  "world-cup-ball-hit",
  "world-cup-card-hit",
]);
const LEGACY_ORB_CROPS = {
  fire: { src: "./assets/canva/orb-atlas.png", x: 38, y: 100, width: 145, height: 135 },
  ice: { src: "./assets/canva/orb-atlas.png", x: 218, y: 100, width: 145, height: 135 },
  wizard: { src: "./assets/canva/orb-atlas.png", x: 38, y: 275, width: 145, height: 135 },
  time: { src: "./assets/canva/orb-atlas.png", x: 218, y: 275, width: 145, height: 135 },
  volta: { src: "./assets/canva/orb-atlas-expansion.png", x: 126, y: 42, width: 112, height: 106 },
  venom: { src: "./assets/canva/orb-atlas-expansion.png", x: 360, y: 43, width: 112, height: 106 },
  gravis: { src: "./assets/canva/orb-atlas-expansion.png", x: 126, y: 185, width: 112, height: 116 },
  aegis: { src: "./assets/canva/orb-atlas-expansion.png", x: 357, y: 183, width: 112, height: 116 },
  mirage: { src: "./assets/canva/orb-atlas.png", x: 38, y: 100, width: 145, height: 135 },
  echo: { src: "./assets/canva/orb-atlas.png", x: 218, y: 100, width: 145, height: 135 },
  forge: { src: "./assets/canva/orb-atlas.png", x: 38, y: 275, width: 145, height: 135 },
  static: { src: "./assets/canva/orb-atlas-expansion.png", x: 126, y: 42, width: 112, height: 106 },
  shade: { src: "./assets/canva/orb-atlas-expansion.png", x: 360, y: 43, width: 112, height: 106 },
};

const ORB_CROPS_MUTABLE = {};
export const ORB_CROPS = Object.freeze(ORB_CROPS_MUTABLE);

export function impactSpriteKeyForEffect(effect) {
  if (effect?.impactKind === "none") return null;
  if (effect?.impactKind === "critical" || effect?.kind === "knockout") {
    return "impactCritical";
  }
  if (
    effect?.impactKind === "collision" ||
    effect?.kind === "collision-hit" ||
    effect?.kind === "weapon-clash" ||
    effect?.kind === "invulnerable-block"
  ) {
    return "impactCollision";
  }
  return "impactRegular";
}

export function shouldRenderHitEffect(gameplayMode, effectKind) {
  return gameplayMode !== "classic" || !CLASSIC_HIT_EFFECT_KINDS.has(effectKind);
}

export class ArenaRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.orbSprites = new Map();
    this.weaponSprites = new Map();
    this.gearSprites = new Map();
    this.effectSprites = new Map();
    this.classicPresentationSprites = new Map();
    this.classicPunchSmokeTrails = new Map();
    this.countryFlags = new Map();
    this.worldCupSprites = new Map();
    this.themeId = "cream-foundry";
    this.options = {
      simpleOrbs: false,
      flatOrbs: false,
      orbHealthNumbers: false,
      blankFloor: false,
      simpleWalls: false,
      arenaBorder: true,
      pixelWeapons: false,
      motionTrails: true,
      damageNumbers: true,
      flashReduction: false,
      classicBlackTheme: false,
      classicTeamColors: true,
      loadOrbSprites: false,
      ...options,
    };
    if (!this.options.simpleOrbs || this.options.loadOrbSprites) this.loadCanvaOrbAtlases();
    this.loadGeneratedSprites(PIXEL_WEAPON_PROFILES, this.weaponSprites);
    this.loadGeneratedSprites(PIXEL_GEAR_PROFILES, this.gearSprites);
    this.loadGeneratedSprites(PIXEL_EFFECT_PROFILES, this.effectSprites);
    this.loadWorldCupAssets();
    this.loadClassicPresentationAssets();
  }

  setTheme(themeId) {
    this.themeId = themeById(themeId).id;
  }

  setOptions(options = {}) {
    Object.assign(this.options, options);
  }

  loadCanvaOrbAtlases() {
    const sources = [...new Set(Object.values(ORB_CROPS).map((crop) => crop.src))];
    for (const source of sources) {
      const atlas = new Image();
      atlas.addEventListener("load", () => {
        for (const [type, crop] of Object.entries(ORB_CROPS).filter(([, crop]) => crop.src === source)) {
        const sprite = document.createElement("canvas");
        sprite.width = crop.width;
        sprite.height = crop.height;
        const spriteContext = sprite.getContext("2d", { willReadFrequently: true });
        spriteContext.drawImage(
          atlas,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height,
        );
        const pixels = spriteContext.getImageData(0, 0, crop.width, crop.height);
        for (let index = 0; index < pixels.data.length; index += 4) {
          const red = pixels.data[index];
          const green = pixels.data[index + 1];
          const blue = pixels.data[index + 2];
          const brightness = Math.max(red, green, blue);
          if (brightness < 18) pixels.data[index + 3] = 0;
          else if (brightness < 42) pixels.data[index + 3] = Math.round(((brightness - 18) / 24) * 255);
        }
        spriteContext.putImageData(pixels, 0, 0);
        this.orbSprites.set(type, sprite);
      }
      });
      atlas.src = source;
    }
  }

  loadGeneratedSprites(profiles, target) {
    for (const [key, profile] of Object.entries(profiles)) {
      const image = new Image();
      image.addEventListener("load", () => target.set(key, { image, ...profile }));
      image.src = profile.src;
    }
  }

  loadWorldCupAssets() {
    for (const country of Object.values(WORLD_CUP_COUNTRIES)) {
      const image = new Image();
      image.addEventListener("load", () => this.countryFlags.set(country.id, image));
      image.src = country.flag;
    }
    for (const pickup of Object.values(WORLD_CUP_PICKUPS)) {
      const image = new Image();
      image.addEventListener("load", () => this.worldCupSprites.set(pickup.id, image));
      image.src = pickup.sprite;
    }
    const heart = new Image();
    heart.addEventListener("load", () => this.worldCupSprites.set("heart", heart));
    heart.src = "./assets/generated/world-cup/sprites/heart.png";
    const trophy = new Image();
    trophy.addEventListener("load", () => this.worldCupSprites.set("world-cup-trophy", trophy));
    trophy.src = "./assets/generated/world-cup/sprites/world-cup-trophy.svg";
  }

  loadClassicPresentationAssets() {
    for (const [id, source] of Object.entries(CLASSIC_PRESENTATION_SPRITES)) {
      const image = new Image();
      image.addEventListener("load", () => this.classicPresentationSprites.set(id, image));
      image.src = source;
    }
  }

  draw(sim) {
    const ctx = this.ctx;
    if (this.lastSim && this.lastSim !== sim) this.classicPunchSmokeTrails.clear();
    this.lastSim = sim;
    const theme = themeById(this.themeId);
    ctx.clearRect(0, 0, ARENA.width, ARENA.height);
    this.drawFloor(ctx, theme, sim);
    this.drawArenaBounds(ctx, sim);
    this.drawHazards(ctx, sim.hazards || [], sim.time, theme);
    this.drawHailstorms(ctx, sim.hailstorms || [], sim.time);
    this.drawHeatDrops(ctx, sim.heatDrops || [], sim.time);
    this.drawWorldCupPickups(ctx, sim.worldCupPickups || [], sim.time);
    this.drawDecoys(ctx, sim.decoys || [], sim.time);
    this.drawClassicPotionTriangles(ctx, sim.classicPotionTriangles || []);
    if (sim.gameplayMode === "classic") {
      if (!sim.legacyClassicRules) {
        drawClassicActionStage(ctx, sim, this.options);
        for (const fighter of sim.fighters) {
          if (fighter.alive) drawClassicPulseGround(ctx, fighter, sim, this.options);
        }
      }
      this.drawClassicEntities(ctx, sim.classicEntities || [], sim.time);
      if (!sim.legacyClassicRules) {
        ctx.save();
        clipClassicPulseArena(ctx, sim);
        drawClassicSignatureAmbient(ctx, sim, this.options);
        drawClassicSignatures(ctx, sim.effects, this.options, sim.fighters);
        ctx.restore();
      }
    }
    for (const fighter of sim.fighters) {
      if (fighter.alive && fighter.type === "orbital") this.drawClassicOrbiters(ctx, fighter, sim.time);
    }

    for (const effect of sim.effects) {
      if (!this.isOverlayEffect(effect)) this.drawEffect(ctx, effect);
    }
    for (const fighter of sim.fighters) {
      const classicTrailEnabled = sim.gameplayMode === "classic"
        && (fighter.classicFadingTrailsEnabled === true || fighter.classicSolidTrailsEnabled === true);
      if (fighter.alive && !fighter.classicWdcReserve) {
        if (!this.options.reducedMotion && drawClassicActionTrail(ctx, fighter, sim.time)) continue;
        if (!this.options.reducedMotion && sim.time < (fighter.classicPulseLaunchUntil || 0)) {
          drawClassicPulseEchoes(ctx, fighter, CLASS_DEFS[fighter.type].color);
        } else if (this.options.motionTrails || fighter.type === "shade" || classicTrailEnabled) {
          this.drawTrail(ctx, fighter);
        }
      }
    }
    for (const projectile of sim.projectiles || []) {
      this.drawProjectile(ctx, projectile);
    }
    for (const projectile of sim.worldCupProjectiles || []) this.drawWorldCupProjectile(ctx, projectile);
    if (sim.gameplayMode === "classic" && !sim.legacyClassicRules) {
      for (const fighter of sim.fighters) {
        if (fighter.alive && fighter.type === "snake") this.drawClassicSnakeTail(ctx, fighter, sim.time);
      }
      for (const fighter of sim.fighters) {
        if (fighter.alive) this.drawWeapon(ctx, fighter, sim.time);
      }
      for (const fighter of sim.fighters) this.drawFighter(ctx, fighter, sim.time);
      this.drawClassicTrapperCaughtWraps(ctx, sim, sim.time);
      // Parasite dots persist after the launch entity is consumed. Render the
      // carrier at the target's live position so the latch remains visible and
      // follows the opponent without covering the centered HP label.
      this.drawClassicParasiteLatches(ctx, sim, sim.time);
      // Held swords are a top-layer accessory. Draw them after every orb so
      // the orb body can never cover the hilt or handle at the attachment.
      for (const fighter of sim.fighters) {
        if (fighter.alive && (fighter.type === "sword" || fighter.type === "draftmaster")) {
          this.drawClassicHeldSwordOverlay(ctx, fighter, sim.time);
        }
      }
      // The first lasso stays visibly in Trapper's hand during wind-up, on
      // the same top accessory layer as guns and Trident. The other two are
      // already represented by their independent world-space throw entities.
      for (const fighter of sim.fighters) {
        if (fighter.alive && fighter.type === "trapper") {
          this.drawClassicHeldTrapperLasso(ctx, fighter, sim.time);
        }
      }
      for (const fighter of sim.fighters) {
        if (fighter.alive && fighter.type === "vampire") {
          this.drawClassicVampireOverlay(ctx, fighter, fighter.radius, sim.time);
        }
      }
      this.drawClassicVampireDrainParticles(ctx, sim, sim.time);
      this.drawClassicImpactBursts(ctx, sim, sim.time);
      for (const fighter of sim.fighters) {
        if (fighter.alive) drawClassicPulseForeground(ctx, fighter, sim, this.options);
      }
    } else {
      for (const fighter of sim.fighters) this.drawFighter(ctx, fighter, sim.time);
      for (const fighter of sim.fighters) {
        if (fighter.alive) this.drawWeapon(ctx, fighter, sim.time);
      }
    }
    this.drawWorldCupPendingItems(ctx, sim.worldCupPendingItems || [], sim.fighters, sim.time);
    for (const effect of sim.effects) {
      if (this.isOverlayEffect(effect)) this.drawEffect(ctx, effect);
    }
    if (this.options.arenaBorder) {
      if (sim.gameplayMode === "classic" && !sim.legacyClassicRules && sim.arenaBounds) {
        drawClassicArenaWall(ctx, sim, this.options);
        drawClassicWallDamage(ctx, sim, this.options);
        drawClassicCannonOutsideArena(ctx, sim, this.options);
      } else this.drawWalls(ctx, theme);
    }
  }

  drawHazards(ctx, hazards, time, theme) {
    for (const hazard of hazards) {
      ctx.save();
      if (hazard.kind === "ice") {
        ctx.fillStyle = `${theme.ice}24`;
        ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
        ctx.strokeStyle = theme.ice;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(hazard.x + 1, hazard.y + 1, hazard.width - 2, hazard.height - 2);
        for (let x = hazard.x + 14; x < hazard.x + hazard.width; x += 28) {
          ctx.fillStyle = `${theme.wallInner}88`;
          ctx.fillRect(x, hazard.y + 9 + ((x / 28) % 3) * 24, 14, 3);
        }
      } else if (hazard.kind === "speed") {
        ctx.fillStyle = `${theme.speed}25`;
        ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
        ctx.strokeStyle = theme.speed;
        ctx.strokeRect(hazard.x, hazard.y, hazard.width, hazard.height);
        ctx.fillStyle = theme.speed;
        for (let x = hazard.x + 14; x < hazard.x + hazard.width - 8; x += 24) {
          ctx.fillRect(x, hazard.y + 12, 13, 4);
          ctx.fillRect(x + 8, hazard.y + 8, 4, 12);
        }
      } else if (hazard.kind === "bumper") {
        ctx.translate(hazard.x, hazard.y);
        ctx.rotate(time * 0.7);
        ctx.fillStyle = theme.surfaceAlt;
        ctx.strokeStyle = theme.bumper;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, hazard.radius, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = theme.bumper;
        for (let i = 0; i < 8; i += 1) {
          ctx.rotate(TAU / 8);
          ctx.fillRect(hazard.radius - 8, -3, 10, 6);
        }
      } else if (hazard.kind === "portal") {
        ctx.strokeStyle = theme.portal;
        ctx.shadowColor = theme.portal;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 4;
        for (let ring = 0; ring < 3; ring += 1) {
          ctx.beginPath();
          ctx.arc(hazard.x, hazard.y, hazard.radius - ring * 7 + Math.sin(time * 4 + ring) * 2, 0, TAU);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  isOverlayEffect(effect) {
    return (
      effect.kind === "weapon-hit" ||
      effect.kind === "weapon-clash" ||
      effect.kind === "arcane-burst-hit" ||
      effect.kind === "hailstorm-hit" ||
      effect.kind === "ember" ||
      effect.kind === "poison" ||
      effect.kind === "ranged-hit" ||
      effect.kind === "potion-aoe-hit" ||
      effect.kind === "volta-bolt-hit" ||
      effect.kind === "collision-hit" ||
      effect.kind === "world-cup-ball-hit" ||
      effect.kind === "world-cup-card-hit" ||
      effect.kind === "invulnerable-block" ||
      effect.kind === "knockout"
    );
  }

  drawHailstorms(ctx, hailstorms, time) {
    for (const storm of hailstorms) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(storm.x, storm.y, storm.width, storm.height);
      ctx.clip();
      ctx.fillStyle = "#bcefff38";
      ctx.fillRect(storm.x, storm.y, storm.width, storm.height);
      ctx.strokeStyle = "#55dfff";
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 7]);
      ctx.strokeRect(storm.x + 2, storm.y + 2, storm.width - 4, storm.height - 4);
      ctx.setLineDash([]);
      ctx.shadowColor = "#d8fbff";
      ctx.shadowBlur = 7;
      for (let index = 0; index < 42; index += 1) {
        const x = storm.x + ((index * 83 + 19) % Math.max(1, storm.width));
        const y = storm.y + ((index * 47 + time * 145) % Math.max(1, storm.height));
        const size = 3 + (index % 3);
        ctx.fillStyle = index % 2 ? "#d8fbff" : "#55dfff";
        ctx.fillRect(Math.round(x), Math.round(y), size, size * 2);
      }
      ctx.restore();
    }
  }

  drawFloor(ctx, theme, sim = null) {
    if (sim?.gameplayMode === KING_OF_HILL_MODE) {
      this.drawKingOfHillFloor(ctx, theme, sim);
      return;
    }
    if (sim?.gameplayMode === WORLD_CUP_MODE) {
      this.drawSoccerField(ctx);
      return;
    }
    if (this.options.blankFloor) {
      ctx.fillStyle = this.options.classicBlackTheme && sim?.gameplayMode === "classic" ? "#000000" : "#ffffff";
      ctx.fillRect(0, 0, ARENA.width, ARENA.height);
      return;
    }
    ctx.fillStyle = theme.floor;
    ctx.fillRect(0, 0, ARENA.width, ARENA.height);
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    for (let x = 24; x < ARENA.width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, ARENA.height);
      ctx.stroke();
    }
    for (let y = 24; y < ARENA.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(ARENA.width, y + 0.5);
      ctx.stroke();
    }

    ctx.strokeStyle = theme.gridStrong;
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, ARENA.width - 96, ARENA.height - 96);
    ctx.strokeRect(ARENA.width / 2 - 82, ARENA.height / 2 - 82, 164, 164);
    this.drawThemeDecor(ctx, theme);
  }

  drawKingOfHillFloor(ctx, theme, sim) {
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, ARENA.width, ARENA.height);
    ctx.strokeStyle = "#25334d";
    ctx.lineWidth = 1;
    for (let x = 24; x < ARENA.width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, ARENA.height);
      ctx.stroke();
    }
    for (let y = 24; y < ARENA.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(ARENA.width, y + 0.5);
      ctx.stroke();
    }
    const controller = sim.fighters.find((fighter) => fighter.id === sim.hill.controllerId);
    const zoneColor = sim.hill.contested ? "#f43f5e" : controller?.hillColor || "#fbbf24";
    ctx.save();
    ctx.fillStyle = `${zoneColor}24`;
    ctx.strokeStyle = zoneColor;
    ctx.lineWidth = 6;
    ctx.setLineDash([16, 10]);
    ctx.beginPath();
    ctx.arc(sim.hill.x, sim.hill.y, sim.hill.radius, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sim.hill.x, sim.hill.y, sim.hill.radius * 0.68, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  drawSoccerField(ctx) {
    ctx.fillStyle = "#17763c";
    ctx.fillRect(0, 0, ARENA.width, ARENA.height);
    const stripeWidth = ARENA.width / 10;
    for (let index = 0; index < 10; index += 1) {
      ctx.fillStyle = index % 2 ? "#1d8644" : "#16763b";
      ctx.fillRect(Math.round(index * stripeWidth), 0, Math.ceil(stripeWidth), ARENA.height);
    }
    const pad = 34;
    ctx.strokeStyle = "#fff4cf";
    ctx.lineWidth = 7;
    ctx.lineJoin = "miter";
    ctx.strokeRect(pad, pad, ARENA.width - pad * 2, ARENA.height - pad * 2);
    ctx.beginPath();
    ctx.moveTo(ARENA.width / 2, pad);
    ctx.lineTo(ARENA.width / 2, ARENA.height - pad);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ARENA.width / 2, ARENA.height / 2, 88, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = "#fff4cf";
    ctx.fillRect(ARENA.width / 2 - 5, ARENA.height / 2 - 5, 10, 10);
    const boxWidth = 128;
    const boxHeight = 292;
    ctx.strokeRect(pad, (ARENA.height - boxHeight) / 2, boxWidth, boxHeight);
    ctx.strokeRect(ARENA.width - pad - boxWidth, (ARENA.height - boxHeight) / 2, boxWidth, boxHeight);
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#fff6d7";
    for (let index = 0; index < 72; index += 1) {
      const x = (index * 97 + 41) % ARENA.width;
      const y = (index * 53 + 89) % ARENA.height;
      ctx.fillRect(x, y, 3 + index % 3, 2);
    }
    ctx.globalAlpha = 1;
  }

  drawArenaBounds(ctx, sim) {
    const bounds = sim.arenaBounds;
    if (!bounds) return;
    if (sim.gameplayMode === "classic" && !sim.legacyClassicRules) return;
    const isDefaultBounds =
      bounds.x === ARENA.padding &&
      bounds.y === ARENA.padding &&
      bounds.width === ARENA.width - ARENA.padding * 2 &&
      bounds.height === ARENA.height - ARENA.padding * 2;
    if (isDefaultBounds && sim.arenaShape !== "circle") return;
    ctx.save();
    ctx.fillStyle = "#0d121926";
    if (sim.arenaShape === "circle") {
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      const radius = Math.min(bounds.width, bounds.height) / 2;
      ctx.beginPath();
      ctx.rect(0, 0, ARENA.width, ARENA.height);
      ctx.arc(centerX, centerY, radius, 0, TAU, true);
      ctx.fill("evenodd");
      ctx.strokeStyle = "#ffbd45";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 2.5, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "#211d1a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(0, radius - 8), 0, TAU);
      ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.fillRect(0, 0, ARENA.width, bounds.y);
    ctx.fillRect(0, bounds.y + bounds.height, ARENA.width, ARENA.height - bounds.y - bounds.height);
    ctx.fillRect(0, bounds.y, bounds.x, bounds.height);
    ctx.fillRect(bounds.x + bounds.width, bounds.y, ARENA.width - bounds.x - bounds.width, bounds.height);
    ctx.strokeStyle = "#ffbd45";
    ctx.lineWidth = 5;
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.strokeStyle = "#211d1a";
    ctx.lineWidth = 2;
    ctx.strokeRect(bounds.x + 5, bounds.y + 5, bounds.width - 10, bounds.height - 10);
    ctx.restore();
  }

  drawThemeDecor(ctx, theme) {
    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.strokeStyle = theme.accent;
    ctx.fillStyle = theme.accent;
    ctx.lineWidth = 2;
    const marks = [
      [112, 104],
      [848, 104],
      [112, 456],
      [848, 456],
    ];
    for (const [x, y] of marks) {
      if (theme.decor === "leaves") {
        ctx.beginPath();
        ctx.ellipse(x, y, 18, 7, Math.PI / 4, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x + 14, y + 11, 15, 6, -Math.PI / 4, 0, TAU);
        ctx.stroke();
      } else if (theme.decor === "crystals") {
        ctx.beginPath();
        ctx.moveTo(x, y - 18);
        ctx.lineTo(x + 13, y);
        ctx.lineTo(x, y + 18);
        ctx.lineTo(x - 13, y);
        ctx.closePath();
        ctx.stroke();
      } else if (theme.decor === "runes") {
        ctx.strokeRect(x - 13, y - 13, 26, 26);
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, TAU);
        ctx.stroke();
      } else if (theme.decor === "sundials") {
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, TAU);
        ctx.moveTo(x, y);
        ctx.lineTo(x + 12, y - 15);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 17, 0, TAU);
        for (let tooth = 0; tooth < 8; tooth += 1) {
          const angle = (tooth / 8) * TAU;
          ctx.fillRect(x + Math.cos(angle) * 21 - 2, y + Math.sin(angle) * 21 - 2, 4, 4);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawWalls(ctx, theme) {
    const p = ARENA.padding;
    const sim = this.lastSim;
    if (sim?.arenaShape === "circle") {
      const bounds = sim.arenaBounds || { x: p, y: p, width: ARENA.width - p * 2, height: ARENA.height - p * 2 };
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      const radius = Math.min(bounds.width, bounds.height) / 2;
      if (this.options.simpleWalls) {
        ctx.strokeStyle = "#211d1a";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 3, 0, TAU);
        ctx.stroke();
        return;
      }
      ctx.strokeStyle = theme.wall;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + p / 2 - ARENA.padding / 2, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = theme.wallInner;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 1, 0, TAU);
      ctx.stroke();
      for (let index = 0; index < 8; index += 1) {
        const angle = (index / 8) * TAU;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        ctx.fillStyle = theme.surfaceAlt;
        ctx.fillRect(x - 14, y - 14, 28, 28);
        ctx.strokeStyle = theme.corner;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 8, y - 8, 16, 16);
      }
      return;
    }
    const bounds = sim?.arenaBounds || {
      x: p,
      y: p,
      width: ARENA.width - p * 2,
      height: ARENA.height - p * 2,
    };
    const isDefaultBounds = bounds.x === p
      && bounds.y === p
      && bounds.width === ARENA.width - p * 2
      && bounds.height === ARENA.height - p * 2;
    const outerX = isDefaultBounds ? p / 2 : Math.max(0, bounds.x - 4);
    const outerY = isDefaultBounds ? p / 2 : Math.max(0, bounds.y - 4);
    const outerWidth = ARENA.width - outerX * 2;
    const outerHeight = ARENA.height - outerY * 2;
    if (this.options.simpleWalls) {
      ctx.strokeStyle = "#211d1a";
      // Social exports add their own outer frame. Keep the arena's inner
      // gameplay wall as a narrow band so the two borders read as separate
      // hairline edges instead of a heavy black/white block.
      ctx.lineWidth = 3;
      ctx.strokeRect(bounds.x - 1, bounds.y - 1, bounds.width + 2, bounds.height + 2);
      return;
    }
    ctx.strokeStyle = theme.wall;
    ctx.lineWidth = 8;
    ctx.strokeRect(outerX, outerY, outerWidth, outerHeight);
    ctx.strokeStyle = theme.wallInner;
    ctx.lineWidth = 3;
    ctx.strokeRect(bounds.x - 1, bounds.y - 1, bounds.width + 2, bounds.height + 2);

    const corners = [
      [bounds.x, bounds.y],
      [bounds.x + bounds.width, bounds.y],
      [bounds.x, bounds.y + bounds.height],
      [bounds.x + bounds.width, bounds.y + bounds.height],
    ];
    for (const [x, y] of corners) {
      ctx.fillStyle = theme.surfaceAlt;
      ctx.fillRect(x - 14, y - 14, 28, 28);
      ctx.strokeStyle = theme.corner;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 8, y - 8, 16, 16);
    }
  }

  drawTrail(ctx, fighter) {
    const def = CLASS_DEFS[fighter.type];
    if (this.lastSim?.gameplayMode === "classic"
      && !fighter.classicFadingTrailsEnabled && !fighter.classicSolidTrailsEnabled) {
      if (this.options.motionTrails) {
        const opening = this.lastSim.classicOpening;
        const circling = opening && (opening.phase === "orbit" || opening.phase === "converge");
        const points = fighter.trail.slice(0, circling ? 18 : 8).reverse();
        points.push(fighter);
        drawMotionStreak(ctx, points, fighter.radius, classicVisualColorFor(fighter.type, def.color));
      }
      return;
    }
    fighter.trail.forEach((point, index) => {
      if (this.lastSim?.gameplayMode === "classic") {
        const fading = fighter.classicFadingTrailsEnabled === true;
        const solid = fighter.classicSolidTrailsEnabled === true;
        if (!fading && !solid) return;
        const alpha = solid ? Math.max(0.22, 0.82 - index * 0.075) : Math.max(0, point.life / 0.34) * (1 - index / 9) * 0.62;
        const radius = Math.max(4, fighter.radius * (0.72 - index * 0.035));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = def.color;
        ctx.strokeStyle = "#050505";
        ctx.lineWidth = Math.max(1.5, radius * 0.08);
        ctx.beginPath();
        ctx.arc(Math.round(point.x), Math.round(point.y), radius, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        return;
      }
      if (fighter.type === "shade") {
        if (index === 0) return;
        const alpha = Math.max(0, point.life / 0.34) * Math.max(0, 1 - index / 8) * 0.34;
        const radius = Math.max(3, fighter.radius * (0.76 - index * 0.045));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = def.color;
        ctx.strokeStyle = def.accent;
        ctx.lineWidth = Math.max(1, radius * 0.07);
        ctx.beginPath();
        ctx.arc(Math.round(point.x), Math.round(point.y), radius, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        return;
      }
      const alpha = Math.max(0, point.life / 0.34) * (1 - index / 10);
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = def.color;
      const size = Math.max(3, fighter.radius * (0.65 - index * 0.04));
      ctx.fillRect(Math.round(point.x - size / 2), Math.round(point.y - size / 2), Math.round(size), Math.round(size));
    });
    ctx.globalAlpha = 1;
  }

  drawClassicPotionTriangles(ctx, triangles) {
    for (const triangle of triangles) {
      ctx.save();
      ctx.translate(Math.round(triangle.x), Math.round(triangle.y));
      ctx.fillStyle = "#090909";
      ctx.beginPath();
      ctx.moveTo(0, -21);
      ctx.lineTo(19, 15);
      ctx.lineTo(-19, 15);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ff334f";
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(13, 11);
      ctx.lineTo(-13, 11);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  drawClassicParasiteDesign(ctx, radius, { includeBody = true } = {}) {
    const safeRadius = Math.max(4, Number(radius) || 4);
    if (includeBody) {
      ctx.fillStyle = "#080808";
      ctx.strokeStyle = "#050505";
      ctx.lineWidth = Math.max(2, safeRadius * 0.12);
      ctx.beginPath();
      ctx.arc(0, 0, safeRadius * 1.06, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#6b4f2a";
      ctx.beginPath();
      ctx.arc(0, 0, safeRadius, 0, TAU);
      ctx.fill();
    }
    // Spread the same olive-green parasite markings across the complete body
    // so both the fighter and every attached carrier share one silhouette.
    const specs = [
      [-0.58, -0.28, 0.10, "#b2d95b"],
      [-0.34, -0.54, 0.14, "#79a83b"],
      [0.04, -0.44, 0.09, "#9bcf46"],
      [0.38, -0.54, 0.11, "#4f7e2b"],
      [0.6, -0.12, 0.13, "#b2d95b"],
      [0.38, 0.28, 0.16, "#79a83b"],
      [0.08, 0.52, 0.10, "#b2d95b"],
      [-0.28, 0.43, 0.15, "#4f7e2b"],
      [-0.58, 0.16, 0.08, "#9bcf46"],
      [-0.05, 0.02, 0.07, "#6a9b35"],
    ];
    for (const [spotX, spotY, spotR, fill] of specs) {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(safeRadius * spotX, safeRadius * spotY, safeRadius * spotR, 0, TAU);
      ctx.fill();
    }
  }

  drawClassicVirusDesign(ctx, radius) {
    const safeRadius = Math.max(8, Number(radius) || 8);
    // Bright lime body with dark-green trumpet-like membrane protrusions,
    // matching the supplied Virus reference instead of the old round buds.
    ctx.fillStyle = "#91e91d";
    ctx.strokeStyle = "#071b08";
    ctx.lineWidth = Math.max(2, safeRadius * 0.055);
    ctx.beginPath();
    ctx.arc(0, 0, safeRadius * 0.96, 0, TAU);
    ctx.fill();
    ctx.stroke();
    const protrusions = 11;
    for (let index = 0; index < protrusions; index += 1) {
      const angle = index * TAU / protrusions;
      const length = safeRadius * (0.28 + (index % 3) * 0.07);
      const neck = safeRadius * 0.78;
      const flare = safeRadius * (0.15 + (index % 2) * 0.035);
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = index % 2 ? "#55ad20" : "#5fbd22";
      ctx.strokeStyle = "#071b08";
      ctx.lineWidth = Math.max(2, safeRadius * 0.05);
      ctx.beginPath();
      ctx.moveTo(neck, -flare * 0.48);
      ctx.bezierCurveTo(neck + length * 0.28, -flare * 1.3, neck + length * 0.72, -flare * 1.2, neck + length, -flare * 0.86);
      ctx.bezierCurveTo(neck + length * 1.08, -flare * 0.18, neck + length * 1.03, flare * 0.8, neck + length * 0.7, flare * 0.92);
      ctx.bezierCurveTo(neck + length * 0.35, flare * 1.05, neck + length * 0.18, flare * 0.58, neck, flare * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    const spots = [
      [-0.34, -0.31, 0.11], [0.15, -0.34, 0.09], [0.37, -0.03, 0.12],
      [-0.2, 0.08, 0.08], [0.08, 0.25, 0.1], [-0.42, 0.36, 0.08],
    ];
    ctx.fillStyle = "#4a9e1d";
    ctx.strokeStyle = "#071b08";
    ctx.lineWidth = Math.max(1.5, safeRadius * 0.035);
    for (const [spotX, spotY, spotR] of spots) {
      ctx.beginPath();
      ctx.ellipse(safeRadius * spotX, safeRadius * spotY, safeRadius * spotR, safeRadius * spotR * 0.72, spotX * 0.8, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  }

  drawNecromancerMinion(ctx, entity, visualRadius, time = 0) {
    const owner = this.lastSim?.fighters?.find((fighter) => fighter.id === entity.ownerId);
    const target = this.lastSim?.fighters?.find((fighter) => fighter.id === entity.targetId)
      || (owner ? this.classicOpponentFor(owner) : null);
    const movementAngle = Number.isFinite(Number(entity.movementAngle))
      ? Number(entity.movementAngle)
      : Math.atan2(Number(entity.vy) || 0, Number(entity.vx) || 1);
    const aimAngle = target
      ? Math.atan2(target.y - entity.y, target.x - entity.x)
      : movementAngle;
    const localAimAngle = aimAngle - movementAngle;
    const interval = Math.max(0.2, Number(entity.shotInterval) || 1);
    const nextShotAt = Number(entity.nextShotAt);
    const cycleStart = Number.isFinite(nextShotAt) ? nextShotAt - interval : time;
    const cycleProgress = Number.isFinite(nextShotAt)
      ? Math.max(0, Math.min(1, (time - cycleStart) / interval))
      : 0;
    const sinceLastShot = Number.isFinite(Number(entity.lastShotAt))
      ? time - Number(entity.lastShotAt)
      : Infinity;
    // The frame windows are tied to the Gameplay shot timestamp. The release
    // frame is therefore visible on the same render interval that spawned the
    // arrow, followed by a short reload frame before the bow returns to ready.
    const frame = sinceLastShot >= 0 && sinceLastShot < 0.13
      ? 2
      : sinceLastShot >= 0 && sinceLastShot < 0.32
        ? 3
        : cycleProgress >= 0.58 && cycleProgress < 0.8
          ? 1
          : 0;
    const bowImage = this.classicPresentationSprites.get("necromancerBowAnimation");
    if (bowImage?.naturalWidth && bowImage.naturalHeight) {
      ctx.save();
      ctx.rotate(localAimAngle);
      ctx.imageSmoothingEnabled = false;
      // The generated sheet's cells are taller than they are wide
      // (1774x887 overall / four frames), so supplying independent width and
      // height values would squash the bow horizontally. Keep the existing
      // two-times vertical presentation scale but derive width from the
      // native frame aspect ratio.
      const bowFrameWidth = bowImage.naturalWidth / CLASSIC_NECROMANCER_BOW_FRAME_COUNT;
      const bowHeight = visualRadius * 2.18 * CLASSIC_NECROMANCER_BOW_RENDER_SCALE;
      const bowWidth = bowHeight * bowFrameWidth / Math.max(1, bowImage.naturalHeight);
      this.drawClassicSheetFrame(ctx, "necromancerBowAnimation", visualRadius, {
        frameCount: CLASSIC_NECROMANCER_BOW_FRAME_COUNT,
        frame,
        width: bowWidth,
        height: bowHeight,
        x: visualRadius * 0.78 * CLASSIC_NECROMANCER_BOW_RENDER_SCALE,
        y: 0,
        alpha: 0.98,
      });
      ctx.restore();
    } else {
      // A deterministic loading fallback keeps a minion readable before the
      // generated sheet finishes loading. Normal browser captures use the
      // four-frame generated bow above.
      const bowCenterX = visualRadius * 0.92 * CLASSIC_NECROMANCER_BOW_RENDER_SCALE;
      const bowRadius = visualRadius * 1.32 * CLASSIC_NECROMANCER_BOW_RENDER_SCALE;
      ctx.save();
      ctx.rotate(localAimAngle);
      ctx.strokeStyle = "#3b271b";
      ctx.lineWidth = Math.max(2.5, visualRadius * 0.18);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(bowCenterX, 0, bowRadius, -0.84, 0.84);
      ctx.stroke();
      ctx.strokeStyle = "#d8c7ad";
      ctx.lineWidth = Math.max(1.5, visualRadius * 0.075);
      ctx.beginPath();
      ctx.moveTo(bowCenterX + Math.cos(-0.84) * bowRadius, Math.sin(-0.84) * bowRadius);
      ctx.lineTo(bowCenterX - visualRadius * 0.22, 0);
      ctx.lineTo(bowCenterX + Math.cos(0.84) * bowRadius, Math.sin(0.84) * bowRadius);
      ctx.stroke();
      this.drawClassicNecromancerHeldArrow(ctx, visualRadius, time);
      ctx.restore();
    }

    // The body is a genuine gray orb at MINI scale relative to its owner.
    ctx.fillStyle = "#85898f";
    ctx.strokeStyle = "#17191c";
    ctx.lineWidth = Math.max(2, visualRadius * 0.12);
    ctx.beginPath();
    ctx.arc(0, 0, visualRadius, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#c5cbd0";
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(-visualRadius * 0.32, -visualRadius * 0.35, visualRadius * 0.22, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;

  }

  drawClassicNecromancerHeldArrow(ctx, visualRadius, time = 0) {
    const image = this.classicPresentationSprites.get("necromancerArrows");
    if (!image?.naturalWidth || !image.naturalHeight) return false;
    const source = {
      x: 0,
      y: 0,
      width: image.naturalWidth,
      height: image.naturalHeight / 3,
    };
    const width = visualRadius * 2.1 * CLASSIC_NECROMANCER_ARROW_RENDER_SCALE;
    const height = width * source.height / Math.max(1, source.width);
    const pulse = 0.98 + Math.sin(time * 7) * 0.02;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = pulse;
    ctx.translate(visualRadius * 0.28, 0);
    ctx.drawImage(
      image,
      source.x,
      source.y,
      source.width,
      source.height,
      -width / 2,
      -height / 2,
      width,
      height,
    );
    ctx.restore();
    return true;
  }

  drawNecromancerArrow(ctx, radius, time = 0) {
    const image = this.classicPresentationSprites.get("necromancerArrows");
    if (image?.naturalWidth && image.naturalHeight) {
      const source = {
        x: 0,
        y: 0,
        width: image.naturalWidth,
        height: image.naturalHeight / 3,
      };
      const width = radius * 8 * CLASSIC_NECROMANCER_ARROW_RENDER_SCALE;
      const height = width * source.height / Math.max(1, source.width);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, source.x, source.y, source.width, source.height, -width / 2, -height / 2, width, height);
      ctx.restore();
      return;
    }
    const shaftStart = -radius * 1.2;
    const shaftTip = radius * 1.35;
    const headTip = radius * 1.75;
    ctx.strokeStyle = "#e4c07a";
    ctx.lineWidth = Math.max(1.5, radius * 0.16);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(shaftStart, 0);
    ctx.lineTo(shaftTip, 0);
    ctx.stroke();
    ctx.fillStyle = "#f4e3b5";
    ctx.strokeStyle = "#3a2b20";
    ctx.lineWidth = Math.max(1, radius * 0.08);
    ctx.beginPath();
    ctx.moveTo(headTip, 0);
    ctx.lineTo(shaftTip, -radius * 0.42);
    ctx.lineTo(shaftTip + radius * 0.08, 0);
    ctx.lineTo(shaftTip, radius * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#6f4b2d";
    ctx.beginPath();
    ctx.moveTo(shaftStart, 0);
    ctx.lineTo(shaftStart - radius * 0.5, -radius * 0.34);
    ctx.lineTo(shaftStart - radius * 0.28, 0);
    ctx.lineTo(shaftStart - radius * 0.5, radius * 0.34);
    ctx.closePath();
    ctx.fill();
  }

  drawClassicSplodeyBomb(ctx, blackTheme = false) {
    const size = classicSplodeyBombRadiusFor();
    const style = classicSplodeyBombStyleFor(blackTheme);
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = Math.max(1.5, size * 0.14);
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = style.highlight;
    ctx.beginPath();
    ctx.arc(-size * 0.28, -size * 0.3, size * 0.13, 0, TAU);
    ctx.fill();
  }

  drawClassicFrostTrailRibbon(ctx, owner, trails, time = 0) {
    if (!owner || !Array.isArray(trails) || trails.length === 0) return;
    const ownerRadius = Math.max(12, Number(owner.radius) || 12);
    const points = trails
      .filter((entity) => (
        Number.isFinite(Number(entity.x))
        && Number.isFinite(Number(entity.y))
        && (!Number.isFinite(Number(entity.expiresAt)) || Number(entity.expiresAt) > time)
      ))
      .sort((first, second) => (
        (Number(first.startedAt) || 0) - (Number(second.startedAt) || 0)
        || String(first.id).localeCompare(String(second.id))
      ))
      .map((entity) => ({
        x: Number(entity.x),
        y: Number(entity.y),
        alpha: Math.max(0, Math.min(1, Number(entity.opacity) || 1)),
      }));
    if (owner.alive !== false && Number.isFinite(Number(owner.x)) && Number.isFinite(Number(owner.y))) {
      points.push({ x: Number(owner.x), y: Number(owner.y), alpha: 1 });
    }
    if (points.length < 2) return;

    const drawRibbon = (strokeStyle, width, alphaScale) => {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = width;
      ctx.shadowColor = strokeStyle;
      ctx.shadowBlur = Math.max(5, width * 0.34);
      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const segmentAlpha = Math.max(0, Math.min(1, Math.min(previous.alpha, current.alpha) * alphaScale));
        if (segmentAlpha <= 0) continue;
        ctx.globalAlpha = segmentAlpha;
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }
      ctx.restore();
    };

    // The outer pass removes every transparent seam between neighboring
    // authored cells. The narrower pale pass keeps the continuous path bright
    // on both dark and light arena themes without obscuring the sprite art.
    drawRibbon("#56dfff", Math.max(9, ownerRadius * 0.92), 0.72);
    drawRibbon("#e6fbff", Math.max(3, ownerRadius * 0.31), 0.34);
  }

  drawClassicEntities(ctx, entities, time = 0) {
    // Frost/Snowball trail entities are fixed path stamps in simulation space.
    // Draw one rounded ribbon through those stamps before the individual
    // authored cells so the strip remains a single continuous line even when
    // the orb changes direction between ability intervals. Each cell's
    // orientation comes from its stored lay angle below, never the owner's
    // current velocity.
    const frostTrailsByOwner = new Map();
    for (const entity of entities) {
      if (!entity || entity.hidden === true) continue;
      const kind = String(entity.kind || "").toLowerCase();
      if (kind !== "frost-trail" && kind !== "train-track") continue;
      const ownerId = entity.ownerId;
      const owner = this.lastSim?.fighters?.find((fighter) => fighter.id === ownerId);
      if (kind === "train-track" && owner?.type !== "frost-ball") continue;
      if (!owner || owner.alive === false) continue;
      if (Number.isFinite(Number(entity.expiresAt)) && Number(entity.expiresAt) <= time) continue;
      const group = frostTrailsByOwner.get(ownerId) || [];
      group.push(entity);
      frostTrailsByOwner.set(ownerId, group);
    }
    for (const [ownerId, trails] of frostTrailsByOwner.entries()) {
      const owner = this.lastSim?.fighters?.find((fighter) => fighter.id === ownerId);
      if (owner) this.drawClassicFrostTrailRibbon(ctx, owner, trails, time);
    }

    for (const entity of entities) {
      if (!entity || entity.hidden === true) continue;
      const kind = String(entity.kind || "").toLowerCase();
      const worldX = Number(entity.x);
      const worldY = Number(entity.y);
      if (!Number.isFinite(worldX) || !Number.isFinite(worldY)) continue;
      const wallAttachedPresentation = kind === "spike" || kind === "cutter-zone";
      const visibleOrigin = wallAttachedPresentation
        ? classicVisibleArenaPointFor(this.lastSim, { x: worldX, y: worldY })
        : { x: worldX, y: worldY };
      const x = visibleOrigin.x;
      const y = visibleOrigin.y;
      const radius = Math.max(3, Number(entity.radius) || Number(entity.r) || 10);
      if (CLASSIC_ACTION_PROJECTILES.has(kind)) {
        if (time < entity.expiresAt) {
          ctx.save();
          clipClassicPulseArena(ctx, this.lastSim);
          drawClassicActionProjectile(ctx, entity, time, this.options);
          ctx.restore();
        }
        continue;
      }
      if (kind === "wdc-summon" || kind === "pulse-punch-wave") {
        if (entity.alive !== false && time < entity.expiresAt) {
          if (kind === "wdc-summon") drawClassicWdcSummon(ctx, entity, time, this.lastSim, this.options);
          else drawClassicPunchWave(ctx, entity, time, this.options.reducedMotion);
        }
        continue;
      }
      const useStuckAngle = ["stuck-wall", "stuck-orb"].includes(entity.phase)
        && Number.isFinite(Number(entity.stuckAngle));
      const projectileUsesVelocityHeading = [
        "pistol-ammo",
        "shotgun-ammo",
        "rifle-ammo",
        "sniper-ammo",
        "draftmaster-ammo",
      ].includes(kind) && Math.hypot(Number(entity.vx) || 0, Number(entity.vy) || 0) > 0.001;
      const owner = this.lastSim?.fighters?.find((fighter) => fighter.id === entity.ownerId);
      const frostTrailLaidHeading = (kind === "frost-trail" || (kind === "train-track" && owner?.type === "frost-ball"))
        ? classicFrostTrailAngleFor(entity)
        : null;
      const angle = frostTrailLaidHeading !== null
        ? frostTrailLaidHeading
        : projectileUsesVelocityHeading
        ? Math.atan2(Number(entity.vy) || 0, Number(entity.vx) || 1)
        : useStuckAngle
        ? Number(entity.stuckAngle)
        : Number.isFinite(Number(entity.angle))
          ? Number(entity.angle)
        : Math.atan2(Number(entity.vy) || 0, Number(entity.vx) || 1);
      const color = entity.color || CLASS_DEFS[entity.fighterType]?.color || "#f5f5f5";
      const worldX2 = Number(entity.x2 ?? entity.endX ?? entity.targetX);
      const worldY2 = Number(entity.y2 ?? entity.endY ?? entity.targetY);
      const visibleEnd = wallAttachedPresentation && Number.isFinite(worldX2) && Number.isFinite(worldY2)
        ? classicVisibleArenaPointFor(this.lastSim, { x: worldX2, y: worldY2 })
        : { x: worldX2, y: worldY2 };
      const x2 = visibleEnd.x;
      const y2 = visibleEnd.y;
      const age = Math.max(0, Number(entity.age) || (Number.isFinite(entity.startedAt) ? time - entity.startedAt : 0));
      const duration = Math.max(0.001, Number(entity.duration) || (Number.isFinite(entity.expiresAt) ? entity.expiresAt - (entity.startedAt || 0) : 1));
      const alpha = Math.max(0, Math.min(1, entity.alpha ?? (Number.isFinite(entity.expiresAt) ? (entity.expiresAt - time) / Math.min(0.5, duration) : 1)));
      if (kind === "cobweb") {
        this.drawClassicCobwebSpokes(ctx, entity, time, alpha);
        continue;
      }
      // Attached parasite carriers are rendered in the top latch pass after
      // the host orb, so their silhouette never gets buried by the orb body.
      if (kind === "classic-parasite") continue;
      if (kind === "trap") {
        this.drawClassicTrapperLassoEntity(ctx, owner, entity, time, alpha);
        continue;
      }
      if (["laser", "lazer", "webball", "tripwire"].includes(kind)) {
        this.drawClassicLazerWeb(ctx, entity, time, alpha);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(angle);

      if (kind === "necromancer-skull") {
        const ownerRadius = Math.max(
          radius / 0.34,
          Number(owner?.radius) || 0,
          Number(entity.visualRadius) / 0.68 || 0,
        );
        const phase = String(entity.phase || "lift").toLowerCase();
        const frame = phase === "charge" || phase === "summon" ? 2 : phase === "lift" ? 1 : 0;
        // The skull is an upper-right accessory, not the orb body. Keep it
        // large enough to read at the default Classic scale while leaving the
        // orb center and HP completely unobstructed.
        const skullSize = ownerRadius * 5.8;
        this.drawClassicSheetFrame(ctx, "necromancer", ownerRadius, {
          frameCount: 3,
          frame,
          width: skullSize,
          height: skullSize,
          x: 0,
          y: 0,
          angle: 0,
          alpha: 0.98,
        });
        if (phase === "charge" || phase === "summon") {
          const charge = Math.max(0, Math.min(1, Number(entity.chargeProgress) || 0));
          const pulse = 0.84 + Math.sin(time * 18) * 0.12;
          ctx.save();
          ctx.globalAlpha *= 0.45 + charge * 0.4;
          ctx.strokeStyle = "#c77dff";
          ctx.shadowColor = "#8d35ff";
          ctx.shadowBlur = Math.max(8, ownerRadius * 0.42);
          ctx.lineWidth = Math.max(3, ownerRadius * 0.08);
          ctx.beginPath();
          ctx.arc(0, 0, ownerRadius * (1.18 + pulse * 0.14), 0, TAU);
          ctx.stroke();
          for (let particle = 0; particle < 8; particle += 1) {
            const particleAngle = time * 1.6 + particle * TAU / 8;
            const distance = ownerRadius * (1.28 + (particle % 3) * 0.16);
            ctx.fillStyle = particle % 2 ? "#9d4dff" : "#f2d6ff";
            ctx.beginPath();
            ctx.arc(Math.cos(particleAngle) * distance, Math.sin(particleAngle) * distance, Math.max(2, ownerRadius * 0.07), 0, TAU);
            ctx.fill();
          }
          ctx.restore();
        }
      } else if (kind === "turret") {
        ctx.fillStyle = "#ff7a00";
        ctx.strokeStyle = "#161616";
        ctx.lineWidth = Math.max(2, radius * 0.12);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.fill();
        ctx.stroke();
      } else if (kind === "blue-sun-laser") {
        const localX2 = Number.isFinite(x2) ? x2 - x : Math.cos(angle) * 260;
        const localY2 = Number.isFinite(y2) ? y2 - y : Math.sin(angle) * 260;
        // The entity transform is already rotated to the ray angle. The
        // endpoint is stored in world coordinates, so undo that transform
        // before drawing the vector or every beam gets rotated twice.
        const beamLength = Math.hypot(localX2, localY2);
        ctx.rotate(-angle);
        // Blue Sun owns exactly eight simulation rays. Keep the Classic
        // treatment as the same crisp cyan used by Orb Racer; the old local
        // fan was removed from drawClassicOrbDetails so these entities are
        // the only lines on screen.
        ctx.lineCap = "round";
        ctx.strokeStyle = "#001318";
        ctx.shadowColor = entity.glowColor || "#a6f8ff";
        ctx.shadowBlur = 12;
        ctx.lineWidth = Math.max(7, radius * 0.82);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(localX2, localY2);
        ctx.stroke();
        ctx.shadowBlur = 7;
        ctx.strokeStyle = entity.laserColor || "#22e9ff";
        ctx.lineWidth = Math.max(3, radius * 0.46);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(localX2, localY2);
        ctx.stroke();
        ctx.globalAlpha *= 0.92;
        ctx.fillStyle = "#e8ffff";
        ctx.beginPath();
        ctx.arc(localX2, localY2, Math.max(2, Math.min(6, beamLength * 0.05)), 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (kind === "chain-lightning") {
        // Zeus throws three separate Greek talismans from the orb. Gameplay
        // keeps their collision centers at the seeded destinations; this
        // presentation pass animates each disc outward from the launch point
        // without changing those deterministic hit coordinates.
        const nodes = Array.isArray(entity.nodes) ? entity.nodes.slice(0, 3) : [];
        const originX = Number.isFinite(Number(entity.throwOriginX))
          ? Number(entity.throwOriginX)
          : Number(owner?.x) || x;
        const originY = Number.isFinite(Number(entity.throwOriginY))
          ? Number(entity.throwOriginY)
          : Number(owner?.y) || y;
        const throwStartedAt = Number.isFinite(Number(entity.throwStartedAt))
          ? Number(entity.throwStartedAt)
          : Number(entity.startedAt) || time;
        const throwDuration = Math.max(0.001, Number(entity.throwDuration) || 0.42);
        const renderedNodes = nodes.map((node, index) => {
          const delay = index * 0.07;
          const progress = Math.max(0, Math.min(1, (time - throwStartedAt - delay) / throwDuration));
          const eased = 1 - ((1 - progress) ** 3);
          return {
            ...node,
            x: originX + (Number(node.x) - originX) * eased,
            y: originY + (Number(node.y) - originY) * eased,
          };
        });
        ctx.rotate(-angle);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#36c8ff";
        ctx.shadowColor = "#5be8ff";
        ctx.shadowBlur = Math.max(8, radius * 0.35);
        ctx.lineWidth = Math.max(3, Number(entity.lineWidth) || radius * 0.12);
        const firstNode = renderedNodes[0];
        if (firstNode) {
          const launchAngle = Number.isFinite(Number(owner?.classicAimAngle))
            ? Number(owner.classicAimAngle)
            : Math.atan2(firstNode.y - originY, firstNode.x - originX);
          const handRadius = Math.max(radius, Number(owner?.radius) || radius);
          const handX = (Number(owner?.x) || originX) + Math.cos(launchAngle) * handRadius * 0.74;
          const handY = (Number(owner?.y) || originY) + Math.sin(launchAngle) * handRadius * 0.74;
          this.drawClassicZeusLightningPath(
            ctx,
            handX - x,
            handY - y,
            firstNode.x - x,
            firstNode.y - y,
            time,
            401,
            Math.max(3, ctx.lineWidth * 0.9),
            0.98,
          );
        }
        if (renderedNodes.length) {
          const center = renderedNodes.reduce((sum, node) => ({ x: sum.x + node.x, y: sum.y + node.y }), { x: 0, y: 0 });
          center.x /= renderedNodes.length;
          center.y /= renderedNodes.length;
          renderedNodes.forEach((node, index) => {
            this.drawClassicZeusLightningPath(
              ctx,
              center.x - x,
              center.y - y,
              node.x - x,
              node.y - y,
              time,
              430 + index,
              Math.max(2, ctx.lineWidth * 0.62),
              0.74 + (index % 2) * 0.12,
            );
          });
          // A short rotating center fork gives the cast a clear electrical
          // core instead of three disconnected node-to-node lines.
          const centerReach = radius * (0.72 + Math.sin(time * 9) * 0.08);
          this.drawClassicZeusLightningPath(
            ctx,
            center.x - x - Math.cos(time * 1.7) * centerReach,
            center.y - y - Math.sin(time * 1.7) * centerReach,
            center.x - x + Math.cos(time * 1.7) * centerReach,
            center.y - y + Math.sin(time * 1.7) * centerReach,
            time,
            499,
            Math.max(2, ctx.lineWidth * 0.48),
            0.62,
          );
        }
        for (let index = 0; index < renderedNodes.length - 1; index += 1) {
          const from = renderedNodes[index];
          const to = renderedNodes[index + 1];
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const length = Math.hypot(dx, dy) || 1;
          const normalX = -dy / length;
          const normalY = dx / length;
          ctx.beginPath();
          ctx.moveTo(from.x - x, from.y - y);
          for (let step = 1; step <= 4; step += 1) {
            const progress = step / 5;
            const wobble = Math.sin(time * 20 + index * 3.1 + step * 2.4) * radius * 0.18;
            ctx.lineTo(
              from.x - x + dx * progress + normalX * wobble,
              from.y - y + dy * progress + normalY * wobble,
            );
          }
          ctx.lineTo(to.x - x, to.y - y);
          ctx.stroke();
          const segmentLength = Math.hypot(dx, dy) || radius * 2;
          const segmentAngle = Math.atan2(dy, dx);
          this.drawClassicSheetFrame(ctx, "zeusChainLightning", radius, {
            frameCount: 4,
            frame: Math.floor((time - throwStartedAt) * 12 + index) % 4,
            width: Math.max(radius * 1.4, radius * 1.7),
            height: Math.max(radius * 2.2, segmentLength * 0.94),
            x: (from.x + to.x) * 0.5 - x,
            y: (from.y + to.y) * 0.5 - y,
            angle: segmentAngle - Math.PI * 0.5,
            alpha: 0.9,
          });
        }
        ctx.shadowBlur = 0;
        for (const [index, node] of renderedNodes.entries()) {
          const nodeRadius = Math.max(radius, Number(node.radius) || radius);
          const image = this.classicPresentationSprites.get("zeusGreekCircles");
          const frame = Math.floor((time - throwStartedAt) * 9 + index) % 4;
          if (!this.drawClassicSheetFrame(ctx, "zeusGreekCircles", nodeRadius, {
            frameCount: 4,
            frame: frame < 0 ? 0 : frame,
              width: nodeRadius * 1.55,
              height: nodeRadius * 1.55,
            x: node.x - x,
            y: node.y - y,
            angle: time * (index % 2 ? -1.4 : 1.4) + index,
            alpha: image ? 1 : 0,
          })) {
            ctx.fillStyle = "#d6a53b";
            ctx.strokeStyle = "#fff2a8";
            ctx.lineWidth = Math.max(2, nodeRadius * 0.12);
            ctx.beginPath();
            ctx.arc(node.x - x, node.y - y, nodeRadius, 0, TAU);
            ctx.fill();
            ctx.stroke();
          }
        }
      } else if (kind === "projectile" && owner?.type === "turret") {
        this.drawClassicSplodeyBomb(
          ctx,
          this.options.classicBlackTheme && this.lastSim?.gameplayMode === "classic",
        );
      } else if (kind === "black-hole") {
        const spin = age * 2.6;
        ctx.fillStyle = "#020204";
        ctx.strokeStyle = "#9a68ff";
        ctx.lineWidth = Math.max(3, radius * 0.18);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#5fe3ff";
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.5, radius * 0.5, spin, 0, TAU);
        ctx.stroke();
      } else if (kind === "reactor-blast") {
        const progress = Math.max(0, Math.min(1, age / duration));
        const maxRadius = Math.max(radius, Number(entity.maxRadius) || radius);
        const blastRadius = maxRadius * (0.035 + progress * 0.965);
        ctx.globalAlpha *= Math.max(0.08, 0.78 * (1 - progress * 0.72));
        ctx.fillStyle = entity.fillColor || "#168cff44";
        ctx.strokeStyle = entity.strokeColor || "#9de9ff";
        ctx.lineWidth = Math.max(3, radius * 0.12 + progress * radius * 0.06);
        ctx.shadowColor = entity.strokeColor || "#9de9ff";
        ctx.shadowBlur = Math.max(8, radius * 0.22);
        ctx.beginPath();
        ctx.arc(0, 0, blastRadius, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (kind === "batarang") {
        const sprite = this.classicPresentationSprites.get("batmanBatarang");
        if (!sprite?.naturalWidth || !sprite.naturalHeight) {
          const batarangScale = 2;
          ctx.fillStyle = "#050505";
          ctx.strokeStyle = this.options.classicBlackTheme ? "#ffffff" : "#050505";
          ctx.lineWidth = Math.max(3, radius * 0.08 * batarangScale);
          ctx.beginPath();
          ctx.moveTo(-radius * 1.45 * batarangScale, -radius * 0.25 * batarangScale);
          ctx.lineTo(-radius * 0.25 * batarangScale, 0);
          ctx.lineTo(0, radius * 0.65 * batarangScale);
          ctx.lineTo(radius * 0.25 * batarangScale, 0);
          ctx.lineTo(radius * 1.45 * batarangScale, -radius * 0.25 * batarangScale);
          ctx.lineTo(radius * 0.7 * batarangScale, radius * 0.65 * batarangScale);
          ctx.lineTo(0, radius * 0.25 * batarangScale);
          ctx.lineTo(-radius * 0.7 * batarangScale, radius * 0.65 * batarangScale);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.filter = this.options.classicBlackTheme ? "contrast(1.35) brightness(0.72)" : "none";
          ctx.drawImage(sprite, -radius * 3.05, -radius * 3.05, radius * 6.1, radius * 6.1);
          ctx.restore();
        }
      } else if (kind === "artist-drawing") {
        const brushRadius = Math.max(radius, Number(owner?.radius) * 0.72 || radius);
        if (this.options.classicBlackTheme) drawClassicPaintStroke(ctx, entity, brushRadius, time);
        this.drawClassicArtistDrawing(ctx, entity, brushRadius, time);
      } else if (["artist-monster", "artist-fairy"].includes(kind)) {
        const spriteId = kind === "artist-monster" ? "artistMonster" : "artistFairy";
        const sprite = this.classicPresentationSprites.get(spriteId);
        if (sprite) ctx.drawImage(sprite, -radius * 1.35, -radius * 1.35, radius * 2.7, radius * 2.7);
        else {
          ctx.fillStyle = color;
          ctx.strokeStyle = "#101010";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      } else if (kind.includes("wire") || kind.includes("web") || kind.includes("laser") || kind.includes("grapple")) {
        const localX2 = Number.isFinite(x2) ? x2 - x : Math.cos(angle) * (Number(entity.length) || 180);
        const localY2 = Number.isFinite(y2) ? y2 - y : Math.sin(angle) * (Number(entity.length) || 180);
        ctx.strokeStyle = kind.includes("laser") ? "#4bcfff" : kind.includes("web") ? "#f4f4f4" : color;
        ctx.lineWidth = Math.max(2, Number(entity.width) || (kind.includes("web") ? 3 : 5));
        ctx.setLineDash(kind.includes("web") ? [9, 6] : []);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(localX2, localY2);
        ctx.stroke();
        if (kind.includes("web")) {
          ctx.globalAlpha *= 0.45;
          for (let offset = -2; offset <= 2; offset += 1) {
            ctx.beginPath();
            ctx.moveTo(localX2 * 0.2, localY2 * 0.2 + offset * 5);
            ctx.lineTo(localX2 * 0.8, localY2 * 0.8 - offset * 5);
            ctx.stroke();
          }
        }
      } else if (kind === "cutter-zone") {
        const bounds = this.lastSim?.arenaBounds || {
          x: 0,
          y: 0,
          width: ARENA.width,
          height: ARENA.height,
        };
        this.drawClassicCutterZone(ctx, entity, x, y, bounds, this.lastSim);
      } else if (kind.includes("zone") || kind.includes("trap")) {
        ctx.fillStyle = "#ff304840";
        ctx.strokeStyle = "#ff6b77";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, TAU);
        ctx.fill();
        ctx.stroke();
      } else if (kind === "frost-trail" || (kind === "train-track" && owner?.type === "frost-ball")) {
        // Frost's legacy entity name was `train-track`; route it through the
        // authored snow trail before the generic Train renderer so a Frost
        // hazard can never regress to railroad rails. The generated sheet is
        // intentionally independent from the train visual.
        const image = this.classicPresentationSprites.get("frostTrail");
        const frameWidth = image?.naturalWidth ? image.naturalWidth / 4 : 1;
        const frameHeight = image?.naturalHeight || 1;
        const visualRadius = Math.max(radius * 1.35, Number(owner?.radius) * 0.5 || radius * 1.35);
        const fadeProgress = Math.max(0, Math.min(1, Number(entity.fadeProgress) || 0));
        const fadeDelay = Math.max(0, Number(entity.fadeDelay) || 3);
        const trailOpacity = Math.max(0, Math.min(1, Number(entity.opacity) || 1)) * (this.options.classicBlackTheme ? 0.78 : 1);
        const ageFrame = age < fadeDelay
          ? Math.floor(age * 2.4) % 2
          : 2 + Math.min(1, Math.floor(fadeProgress * 2));
        const trailGroup = owner ? frostTrailsByOwner.get(owner.id) : null;
        const newestTrail = trailGroup?.slice().sort((first, second) => (
          (Number(first.startedAt) || 0) - (Number(second.startedAt) || 0)
          || String(first.id).localeCompare(String(second.id))
        )).at(-1);
        if (newestTrail?.id === entity.id) {
          this.drawClassicFrostTrailStreak(ctx, entity, owner, angle, age, trailOpacity);
        }
        if (!this.drawClassicSheetFrame(ctx, "frostTrail", visualRadius, {
          frameCount: 4,
          frame: ageFrame,
          width: visualRadius * 4.45,
          height: visualRadius * 4.45 * frameHeight / frameWidth,
          alpha: trailOpacity,
        })) {
          ctx.strokeStyle = "#a9edff";
          ctx.lineWidth = Math.max(5, radius * 0.8);
          ctx.lineCap = "round";
          ctx.globalAlpha *= 0.68;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-Math.cos(angle) * 90, -Math.sin(angle) * 90);
          ctx.stroke();
        }
      } else if (kind === "train-track") {
        const bounds = this.lastSim?.arenaBounds || {
          x: 0,
          y: 0,
          width: ARENA.width,
          height: ARENA.height,
        };
        this.drawClassicTrainTrack(ctx, entity, x, y, bounds);
      } else if (kind.includes("track") || kind.includes("rail")) {
        const length = Math.max(40, Number(entity.length) || 260);
        ctx.strokeStyle = "#5b5149";
        ctx.lineWidth = 5;
        for (const offset of [-8, 8]) {
          ctx.beginPath();
          ctx.moveTo(-length / 2, offset);
          ctx.lineTo(length / 2, offset);
          ctx.stroke();
        }
        ctx.strokeStyle = "#9a846f";
        ctx.lineWidth = 3;
        for (let railX = -length / 2; railX <= length / 2; railX += 22) {
          ctx.beginPath();
          ctx.moveTo(railX, -13);
          ctx.lineTo(railX, 13);
          ctx.stroke();
        }
      } else if (kind === "train") {
        drawClassicLocomotive(ctx, radius, age, this.options.reducedMotion);
      } else if (["pistol-ammo", "shotgun-ammo", "rifle-ammo", "sniper-ammo", "draftmaster-ammo"].includes(kind)) {
        if (!this.drawClassicAmmoSprite(ctx, entity, kind, radius)) {
          // Keep a readable fallback for a slow-loading static asset; the
          // normal browser path always uses the generated Draftmaster ammo
          // sheet above.
          const long = ["rifle-ammo", "sniper-ammo", "draftmaster-ammo"].includes(kind);
          ctx.fillStyle = kind === "shotgun-ammo" ? "#d6272f" : "#333841";
          ctx.strokeStyle = "#101010";
          ctx.lineWidth = 2;
          const projectileScale = CLASSIC_GUN_PROJECTILE_RENDER_SCALE;
          ctx.fillRect(-radius * (long ? 1.9 : 1.35) * projectileScale, -radius * 0.42 * projectileScale, radius * (long ? 3.8 : 2.7) * projectileScale, radius * 0.84 * projectileScale);
          ctx.strokeRect(-radius * (long ? 1.9 : 1.35) * projectileScale, -radius * 0.42 * projectileScale, radius * (long ? 3.8 : 2.7) * projectileScale, radius * 0.84 * projectileScale);
          if (kind === "shotgun-ammo") {
            ctx.fillStyle = "#ffd43b";
            ctx.fillRect(radius * 0.9 * projectileScale, -radius * 0.42 * projectileScale, radius * 0.62 * projectileScale, radius * 0.84 * projectileScale);
          } else {
            ctx.fillStyle = "#f2c14d";
            ctx.beginPath();
            ctx.moveTo(radius * (long ? 2.3 : 1.75), 0);
            ctx.lineTo(radius * (long ? 1.9 : 1.35), -radius * 0.42);
            ctx.lineTo(radius * (long ? 1.9 : 1.35), radius * 0.42);
            ctx.closePath();
            ctx.fill();
          }
        }
      } else if (kind === "trident-ammo") {
        const tridentRenderRadius = Math.max(radius, Number(owner?.radius) || radius);
        const stuckOrb = entity.phase === "stuck-orb";
        const stuckTarget = stuckOrb
          ? this.lastSim?.fighters?.find((fighter) => fighter.id === entity.stuckTargetId)
          : null;
        const targetRadius = Math.max(1, Number(stuckTarget?.radius) || tridentRenderRadius);
        const dimensions = classicTridentDimensions(tridentRenderRadius);
        // Gameplay places the projectile center at the target's collision
        // perimeter. For an orb hit, solve the sprite offset from the actual
        // target center so the generated trident tip stops three quarters of
        // the way through the orb instead of stopping outside it or exiting
        // its far side.
        const targetAlong = stuckTarget
          ? (stuckTarget.x - x) * Math.cos(angle) + (stuckTarget.y - y) * Math.sin(angle)
          : 0;
        const desiredTip = stuckOrb && Number.isFinite(targetAlong)
          ? Math.max(targetRadius * 0.5, targetAlong - targetRadius * 0.25)
          : 0;
        const tridentOffsetX = stuckOrb
          ? desiredTip - dimensions.width * 0.5
          : 0;
        if (!this.drawClassicAmmoSprite(ctx, entity, kind, tridentRenderRadius, tridentOffsetX, 0)) {
          ctx.strokeStyle = "#62e6e6";
          ctx.lineWidth = Math.max(3, tridentRenderRadius * 0.28);
          ctx.beginPath();
          ctx.moveTo(tridentOffsetX - dimensions.width / 2, 0);
          ctx.lineTo(tridentOffsetX + dimensions.width / 2, 0);
          for (const offset of [-0.7, 0, 0.7]) {
            ctx.moveTo(tridentOffsetX + dimensions.width * 0.3, 0);
            ctx.lineTo(tridentOffsetX + dimensions.width * 0.48, dimensions.height * offset * 0.5);
          }
          ctx.stroke();
        }
      } else if (kind === "necromancer-arrow") {
        // Keep the minion's existing bow accessory, but use the first cell of
        // the generated arrow sheet for every shot. The fallback is retained
        // only for a slow-loading asset, never as the normal browser path.
        if (!this.drawClassicAmmoSprite(ctx, entity, kind, radius)) {
          this.drawNecromancerArrow(ctx, radius, time);
        }
      } else if (kind === "spike") {
        // Gameplay stores the entity at the triangle tip and x2/y2 at its
        // wall-attached base. Use that exact short tip-to-base segment so the
        // visible spike cannot float past the wall.
        const baseDistance = Math.max(2, Math.hypot(x2 - x, y2 - y));
        const baseHalf = Math.max(radius * 1.5, Number(entity.spikeBaseHalf) || radius * 2.4);
        const blackMode = this.options.classicBlackTheme && this.lastSim?.gameplayMode === "classic";
        ctx.fillStyle = blackMode ? "#ffffff" : "#111111";
        ctx.strokeStyle = blackMode ? "#121212" : "#f4f4f4";
        ctx.lineWidth = Math.max(2, radius * 0.2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(baseDistance, -baseHalf);
        ctx.lineTo(baseDistance, baseHalf);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (kind === "grappler-ammo") {
        // The hook silhouette is generated; rope and anchor lines remain
        // deterministic Gameplay-owned effects.
        this.drawClassicAmmoSprite(ctx, entity, kind, radius);
      } else if (kind === "fairy-ammo") {
        if (this.options.classicBlackTheme) {
          pulseLine(ctx, -radius * 2.9, 0, -radius * 0.22, 0, "#bd8fec85", radius * 0.39);
          pulseRing(ctx, 0, 0, radius * 0.90, "#e4b6ffa0", radius * 0.08);
          classicFourPointStar(ctx, 0, 0, radius * 0.93, "#fff2cd");
          if (!this.options.reducedMotion) {
            classicFourPointStar(ctx, -radius * 1.9, Math.sin(age * 21) * radius * 0.5, radius * 0.23, "#e7b3ff");
          }
        } else if (!this.drawClassicSheetFrame(ctx, "fairyProjectile", radius, {
          frameCount: 4,
          frame: Math.floor(age * 12) % 4,
          width: radius * CLASSIC_FAIRY_PROJECTILE_RENDER_SCALE,
          height: radius * CLASSIC_FAIRY_PROJECTILE_RENDER_SCALE,
          alpha: 0.98,
        })) {
          ctx.fillStyle = "#fff6aa";
          ctx.shadowColor = "#8eeaff";
          ctx.shadowBlur = 10;
          for (let point = 0; point < 8; point += 1) {
            const pointAngle = point * Math.PI / 4;
            ctx.beginPath();
            ctx.arc(Math.cos(pointAngle) * radius * 0.6, Math.sin(pointAngle) * radius * 0.6, radius * 0.22, 0, TAU);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        }
      } else if (kind === "parasite") {
        // Carriers use the same parasite silhouette as the fighter and are
        // 1.25× larger than the old projectile so a latch remains visible.
        this.drawClassicParasiteDesign(ctx, radius * 1.25);
      } else if (kind === "shrapnel") {
        // Use the existing dedicated Shrapnel shard cell instead of the old
        // procedural triangle. The cell is scaled to make the visible shard
        // roughly twice the previous projectile length while preserving its
        // original pixel-art proportions.
        const image = this.classicPresentationSprites.get("shrapnelSheet");
        if (image?.naturalWidth && image.naturalHeight) {
          const frameWidth = image.naturalWidth / 4;
          const frameHeight = image.naturalHeight;
          const sourceWidth = radius * 10;
          const sourceHeight = sourceWidth * frameHeight / frameWidth;
          this.drawClassicPresentationSprite(ctx, "shrapnelSheet", radius, {
            sourceX: frameWidth,
            sourceY: 0,
            sourceWidth: frameWidth,
            sourceHeight: frameHeight,
            width: sourceWidth,
            height: sourceHeight,
          });
        } else {
          ctx.fillStyle = color;
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(radius * 3.6, 0);
          ctx.lineTo(-radius * 1.4, radius * 1.44);
          ctx.lineTo(-radius * 0.84, -radius * 1.44);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      } else if (kind === "glass-shard") {
        const image = this.classicPresentationSprites.get("glassDrops");
        const frameWidth = image?.naturalWidth ? image.naturalWidth / 4 : 1;
        const frameHeight = image?.naturalHeight || 1;
        // Glass shards are born from a tiny wall collision radius, but the
        // drop must still read as a deliberate translucent weapon at export
        // scale. Use the owner's radius as a visual floor without changing
        // the physical shard hitbox.
        const visualRadius = Math.max(radius, Number(owner?.radius) * 0.22 * CLASSIC_GLASS_RENDER_SCALE || radius);
        const frame = Math.max(0, Math.min(3, Number(entity.glassFrame) || 0));
        if (!this.drawClassicSheetFrame(ctx, "glassDrops", visualRadius, {
          frameCount: 4,
          frame,
          width: visualRadius * 2.15,
          height: visualRadius * 2.15 * frameHeight / frameWidth,
          angle: Number.isFinite(Number(entity.angle)) ? Number(entity.angle) : 0,
          alpha: 0.96,
        })) {
          ctx.fillStyle = "#c9f6ffbb";
          ctx.strokeStyle = "#ffffffdd";
          ctx.lineWidth = Math.max(2, radius * 0.2);
          ctx.beginPath();
          ctx.moveTo(radius * 1.8, 0);
          ctx.lineTo(-radius * 0.7, radius * 0.72);
          ctx.lineTo(-radius * 0.42, -radius * 0.72);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      } else if (kind.includes("spike") || kind.includes("shard") || kind === "glass" || kind === "shrapnel") {
        ctx.fillStyle = kind.includes("glass") ? "#c9f6ffbb" : color;
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(radius * 1.8, 0);
        ctx.lineTo(-radius * 0.7, radius * 0.72);
        ctx.lineTo(-radius * 0.42, -radius * 0.72);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (kind.includes("apple")) {
        if (!this.drawClassicPresentationSprite(ctx, "appleProjectile", radius, {
          width: radius * 2.9,
          height: radius * 2.9,
        })) {
          ctx.fillStyle = "#e63232";
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(-radius * 0.34, 0, radius * 0.72, 0, TAU);
          ctx.arc(radius * 0.34, 0, radius * 0.72, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = "#6b3b1f";
          ctx.beginPath();
          ctx.moveTo(0, -radius * 0.55);
          ctx.lineTo(radius * 0.12, -radius * 1.15);
          ctx.stroke();
        }
      } else if (kind.includes("bee")) {
        if (this.options.classicBlackTheme) drawClassicFoundryBee(ctx, radius, time, this.options.reducedMotion);
        else if (!this.drawClassicPresentationSprite(ctx, "hiveBee", radius, {
          width: radius * 3.8,
          height: radius * 3.8,
        })) {
          ctx.fillStyle = "#f8c928";
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(0, 0, radius, radius * 0.62, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      } else if (kind === "necromancer-soldier") {
        const visualRadius = Math.max(4, (Number(owner?.radius) || radius) * 0.55);
        const rawEmergenceProgress = Number(entity.emergeProgress);
        const emergenceProgress = Number.isFinite(rawEmergenceProgress)
          ? Math.max(0, Math.min(1, rawEmergenceProgress))
          : 1;
        // The old ground clip made the minion look like it was being
        // unmasked by the layer. Use the established Black Hole teleport
        // effect instead, then reveal the complete minion over a one-second
        // fade. The teleport remains behind the body and never covers its HP.
        const teleport = this.classicPresentationSprites.get("classicTeleport");
        if (teleport?.naturalWidth) {
          const teleportProgress = Math.max(0, Math.min(1, emergenceProgress));
          const teleportAlpha = teleportProgress >= 1
            ? Math.max(0, 0.42 - (teleportProgress - 1) * 2)
            : 0.9 - teleportProgress * 0.28;
          const teleportSize = visualRadius * (2.65 + teleportProgress * 0.45);
          this.drawClassicPresentationSprite(ctx, "classicTeleport", visualRadius, {
            width: teleportSize,
            height: teleportSize,
            y: visualRadius * 0.2,
            alpha: teleportAlpha,
          });
        }
        const minionAlpha = emergenceProgress >= 1
          ? 1
          : Math.max(0, Math.min(1, emergenceProgress * emergenceProgress * (3 - 2 * emergenceProgress)));
        ctx.save();
        ctx.globalAlpha *= minionAlpha;
        this.drawNecromancerMinion(ctx, entity, visualRadius, time);
        ctx.restore();
        if (emergenceProgress >= 1) this.drawClassicEntityHealthText(ctx, entity, visualRadius);
      } else if (kind.includes("soldier") || kind.includes("minion")) {
        const walk = Math.sin(time * 10 + x * 0.025 + y * 0.017);
        ctx.fillStyle = kind.includes("necromancer") ? "#51465f" : "#85898f";
        ctx.strokeStyle = "#101010";
        ctx.lineWidth = Math.max(2, radius * 0.16);
        ctx.beginPath();
        ctx.roundRect(-radius * 0.58, -radius * 0.15, radius * 1.16, radius * 0.92, radius * 0.22);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ded7c9";
        ctx.strokeStyle = "#101010";
        ctx.beginPath();
        ctx.arc(0, -radius * 0.42, radius * 0.46, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#19151b";
        ctx.fillRect(-radius * 0.2, -radius * 0.48, radius * 0.12, radius * 0.14);
        ctx.fillRect(radius * 0.08, -radius * 0.48, radius * 0.12, radius * 0.14);
        ctx.strokeStyle = "#101010";
        ctx.lineWidth = Math.max(2, radius * 0.14);
        ctx.beginPath();
        ctx.moveTo(-radius * 0.35, radius * 0.7);
        ctx.lineTo(-radius * 0.38, radius * 1.02 + walk * radius * 0.12);
        ctx.moveTo(radius * 0.35, radius * 0.7);
        ctx.lineTo(radius * 0.38, radius * 1.02 - walk * radius * 0.12);
        ctx.stroke();
        ctx.fillStyle = "#101010";
        ctx.fillRect(radius * 0.47, -radius * 0.08, radius * 0.88, Math.max(2, radius * 0.13));
      } else if (kind.includes("lightning") || kind.includes("zeus")) {
        const nodes = Array.isArray(entity.nodes) && entity.nodes.length >= 2
          ? entity.nodes
          : [{ x, y }, { x: Number.isFinite(x2) ? x2 : x + radius * 4, y: Number.isFinite(y2) ? y2 : y }];
        const localX2 = Number.isFinite(x2) ? x2 - x : radius * 4;
        const localY2 = Number.isFinite(y2) ? y2 - y : 0;
        ctx.strokeStyle = "#8bdcff";
        ctx.lineWidth = 6;
        ctx.shadowColor = "#4dbdff";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo((nodes[0].x || x) - x, (nodes[0].y || y) - y);
        for (let nodeIndex = 1; nodeIndex < nodes.length; nodeIndex += 1) {
          const node = nodes[nodeIndex];
          ctx.lineTo((Number(node.x) || x) - x + Math.sin(nodeIndex * 9 + age * 17) * 8, (Number(node.y) || y) - y + Math.cos(nodeIndex * 7 + age * 13) * 8);
        }
        if (nodes.length === 2) ctx.lineTo(localX2, localY2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        for (const node of nodes.slice(0, 3)) {
          ctx.fillStyle = "#8a8f98";
          ctx.strokeStyle = "#d7dde5";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc((Number(node.x) || x) - x, (Number(node.y) || y) - y, Math.max(radius, Number(node.radius) || radius), 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = color;
        ctx.strokeStyle = "#0b0b0b";
        ctx.lineWidth = Math.max(2, radius * 0.16);
        if (kind.includes("bullet") || kind.includes("projectile") || kind.includes("trident")) {
          const projectileScale = ["sniper-ammo", "pistol-ammo", "shotgun-ammo", "rifle-ammo", "draftmaster-ammo"].includes(kind)
            ? CLASSIC_GUN_PROJECTILE_RENDER_SCALE
            : 1;
          ctx.fillRect(-radius * 1.5 * projectileScale, -radius * 0.45 * projectileScale, radius * 3 * projectileScale, radius * 0.9 * projectileScale);
          ctx.strokeRect(-radius * 1.5 * projectileScale, -radius * 0.45 * projectileScale, radius * 3 * projectileScale, radius * 0.9 * projectileScale);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  drawClassicParasiteLatches(ctx, sim, time = 0) {
    if (sim?.gameplayMode !== "classic") return;
    const targets = new Map([
      ...(sim.fighters || []).map((fighter) => [fighter.id, fighter]),
      ...(sim.classicEntities || [])
        .filter((entity) => entity?.kind && entity.kind !== "classic-parasite")
        .map((entity) => [entity.id, entity]),
    ]);
    const carriers = (sim.classicEntities || []).filter((entity) => (
      String(entity?.kind || "").toLowerCase() === "classic-parasite"
      && entity.alive !== false
      && (entity.expiresAt === null || Number(entity.expiresAt) > Number(time))
    ));
    for (const carrier of carriers) {
      const target = targets.get(carrier.attachedTargetId || carrier.targetId);
      if (!target?.alive) continue;
      const carrierRadius = Math.max(
        10,
        (Number(carrier.radius) || 18) * CLASSIC_PARASITE_CARRIER_RENDER_SCALE,
      );
      const angle = Number.isFinite(Number(carrier.attachAngle))
        ? Number(carrier.attachAngle)
        : Math.atan2(carrier.y - target.y, carrier.x - target.x);
      ctx.save();
      ctx.translate(Number(carrier.x) || target.x, Number(carrier.y) || target.y);
      ctx.rotate(angle + Math.PI * 0.5);
      this.drawClassicParasiteDesign(ctx, carrierRadius);
      ctx.restore();
    }
    for (const dot of sim.classicDots || []) {
      if (String(dot?.kind || "").toLowerCase() !== "parasite") continue;
      // New parasite dots have a separate physical carrier. Do not draw a
      // second procedural copy here; the carrier owns the visible latch.
      if (dot.carrierId) continue;
      const target = targets.get(dot.targetId);
      if (!target?.alive) continue;
      const seed = Array.from(String(dot.id || dot.key || "parasite"))
        .reduce((sum, character) => sum + character.charCodeAt(0), 0);
      const angle = seed * 0.37 + Math.sin(time * 0.8 + seed) * 0.12;
      const carrierRadius = Math.max(10, 18 * 1.25);
      const attachDistance = Math.max(0, Number(target.radius) || 0) + carrierRadius * 0.26;
      ctx.save();
      ctx.translate(
        target.x + Math.cos(angle) * attachDistance,
        target.y + Math.sin(angle) * attachDistance,
      );
      ctx.rotate(angle + Math.PI * 0.5);
      this.drawClassicParasiteDesign(ctx, carrierRadius);
      ctx.restore();
    }
  }

  drawClassicTrapperLassoSprite(ctx, image, frame, x, y, width, height, spriteAlpha = 1) {
    if (!image?.naturalWidth || !image.naturalHeight) return false;
    const frameCount = 4;
    const frameWidth = image.naturalWidth / frameCount;
    if (!Number.isFinite(frameWidth) || frameWidth <= 0) return false;
    ctx.save();
    ctx.globalAlpha *= Math.max(0, Math.min(1, spriteAlpha));
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    // The generated v6 sheet is padded into square cells, so its source art
    // stays at its native aspect. Width expansion is deliberate: it makes the
    // deployed lasso read as a broad circle without replacing it with a
    // generic procedural brown ring.
    ctx.drawImage(
      image,
      frameWidth * Math.max(0, Math.min(frameCount - 1, Math.floor(frame))),
      0,
      frameWidth,
      image.naturalHeight,
      -width * 0.5,
      -height * 0.5,
      width,
      height,
    );
    ctx.restore();
    return true;
  }

  drawClassicTrapperCaughtWraps(ctx, sim, alpha = 1) {
    const image = this.classicPresentationSprites.get("trapperLasso");
    if (!image?.naturalWidth || !image.naturalHeight) return;
    const targets = [
      ...(sim?.fighters || []),
      ...(sim?.classicEntities || []),
    ];
    for (const entity of sim?.classicEntities || []) {
      if (entity?.kind !== "trap" || !entity.trapTargetId || entity.trapState === "loose") continue;
      const target = targets.find((candidate) => candidate.id === entity.trapTargetId);
      if (!target || target.alive === false || Number(target.health ?? 1) <= 0) continue;
      const x = Number(target.x);
      const y = Number(target.y);
      const targetRadius = Math.max(10, Number(target.radius) || 10);
      if (![x, y].every(Number.isFinite)) continue;
      const wrapDiameter = targetRadius * 2.96 + Math.max(10, Number(entity.radius) * 0.16);
      this.drawClassicTrapperLassoSprite(
        ctx,
        image,
        3,
        x,
        y,
        wrapDiameter * CLASSIC_TRAPPER_LASSO_WIDTH_SCALE,
        wrapDiameter,
        alpha,
      );
    }
  }

  drawClassicTrapperLassoEntity(ctx, owner, entity, time = 0, alpha = 1) {
    const image = this.classicPresentationSprites.get("trapperLasso");
    if (!image?.naturalWidth || !image.naturalHeight) return;
    const trapRadius = Math.max(24, Number(entity.radius) || 24);
    const target = this.lastSim?.fighters?.find((fighter) => fighter.id === entity.trapTargetId)
      || this.lastSim?.classicEntities?.find((candidate) => candidate.id === entity.trapTargetId);
    const targetAlive = target && target.alive !== false && Number(target.health ?? 1) > 0;
    const caught = Boolean(targetAlive && entity.trapTargetId && entity.trapState !== "loose");
    const centerX = caught ? Number(target.x) : Number(entity.x);
    const centerY = caught ? Number(target.y) : Number(entity.y);
    if (![centerX, centerY].every(Number.isFinite)) return;
    const phase = String(entity.trapPhase || "deployed").toLowerCase();
    if (phase === "queued") return;
    // The first lasso is represented by the top-layer held accessory during
    // wind-up. Do not draw a second copy at the entity position underneath it.
    if (phase === "windup" && Number(entity.lassoIndex) === 0) return;
    const frame = phase === "windup"
      ? 0
      : phase === "throwing"
        ? (time < (Number(entity.throwStartAt ?? entity.startedAt) || 0) + (Number(entity.windupDuration) || 0.24) + (Number(entity.throwDuration) || 0.52) * 0.52 ? 1 : 2)
        : 3;
    const frameCount = 4;
    const frameWidth = image.naturalWidth / frameCount;
    // v6 is a padded square-cell sheet. Keep this aspect calculation anyway
    // so a future source can never be stretched into a square by accident.
    const frameAspect = frameWidth / image.naturalHeight;
    const loopDiameter = trapRadius * CLASSIC_TRAPPER_LASSO_LOOP_SCALE;
    const ropeStartX = Number(owner?.x ?? entity.throwOriginX);
    const ropeStartY = Number(owner?.y ?? entity.throwOriginY);
    const ropeEndX = centerX;
    const ropeEndY = centerY;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.imageSmoothingEnabled = false;
    // The rope is deliberately drawn as a thick two-tone strand from the
    // live Trapper orb to this lasso only. Each entity owns one strand, so the
    // three throws remain visually independent instead of becoming a cage.
    if ([ropeStartX, ropeStartY, ropeEndX, ropeEndY].every(Number.isFinite)) {
      ctx.lineCap = "round";
      ctx.strokeStyle = "#24140d";
      ctx.lineWidth = Math.max(5, trapRadius * 0.13);
      ctx.beginPath();
      ctx.moveTo(ropeStartX, ropeStartY);
      ctx.lineTo(ropeEndX, ropeEndY);
      ctx.stroke();
      ctx.strokeStyle = "#b9783e";
      ctx.lineWidth = Math.max(2.5, trapRadius * 0.07);
      ctx.beginPath();
      ctx.moveTo(ropeStartX, ropeStartY);
      ctx.lineTo(ropeEndX, ropeEndY);
      ctx.stroke();
    }
    ctx.save();
    // The deployed trap uses the generated lasso artwork. When an orb is
    // caught, the same artwork contracts around it in the top accessory pass.
    if (caught) {
      // The visible wrap is drawn after the target on the top accessory layer.
    } else if (phase === "deployed") {
      this.drawClassicTrapperLassoSprite(
        ctx,
        image,
        3,
        centerX,
        centerY,
        loopDiameter * CLASSIC_TRAPPER_LASSO_WIDTH_SCALE,
        loopDiameter,
        0.98,
      );
    } else {
      // Never rotate the sprite into a tilted oval. The throw animation is
      // carried by the frame sequence and the connecting rope; the loop stays
      // front-facing. The padded square source is widened only by the
      // intentional lasso width scale above.
      const drawHeight = loopDiameter;
      const drawWidth = drawHeight * frameAspect * CLASSIC_TRAPPER_LASSO_WIDTH_SCALE;
      this.drawClassicTrapperLassoSprite(
        ctx,
        image,
        frame,
        centerX,
        centerY,
        drawWidth,
        drawHeight,
        0.92,
      );
    }
    ctx.restore();
    ctx.restore();
  }

  drawClassicHeldTrapperLasso(ctx, fighter, time = 0) {
    const image = this.classicPresentationSprites.get("trapperLasso");
    if (!image?.naturalWidth || !image.naturalHeight) return;
    const activeTrap = this.lastSim?.classicEntities?.find((entity) => (
      entity.kind === "trap"
      && entity.ownerId === fighter.id
      && Number(entity.lassoIndex) === 0
      && entity.trapPhase === "windup"
    ));
    if (!activeTrap) return;
    const radius = Math.max(8, Number(fighter.radius) || 24);
    const targetAngle = Number.isFinite(Number(activeTrap.throwAngle))
      ? Number(activeTrap.throwAngle)
      : 0;
    const frameWidth = image.naturalWidth / 4;
    const frameAspect = frameWidth / image.naturalHeight;
    const size = radius * CLASSIC_TRAPPER_HELD_LASSO_SCALE;
    const windupDuration = Math.max(0.001, Number(activeTrap.windupDuration) || 0.24);
    const spinProgress = Math.max(0, Math.min(1, (
      Number(time) - Number(activeTrap.throwStartAt || time)
    ) / windupDuration));
    const spinTurns = CLASSIC_TRAPPER_HELD_LASSO_SPIN_TURNS;
    const spinAngle = targetAngle + spinProgress * TAU * spinTurns;
    const frame = Math.min(3, Math.floor(spinProgress * 4));
    const drawWidth = size * frameAspect;
    const drawLeft = radius * 0.48;
    const drawTop = -size * 0.58;
    const knotX = drawLeft + drawWidth * 0.5;
    const knotY = drawTop + size * 0.78;
    ctx.save();
    ctx.translate(Math.round(fighter.x), Math.round(fighter.y));
    ctx.rotate(spinAngle);
    ctx.imageSmoothingEnabled = false;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#24140d";
    ctx.lineWidth = Math.max(5, radius * 0.15);
    ctx.beginPath();
    ctx.moveTo(radius * 0.42, 0);
    ctx.lineTo(knotX, knotY);
    ctx.stroke();
    ctx.strokeStyle = "#b9783e";
    ctx.lineWidth = Math.max(2.5, radius * 0.08);
    ctx.beginPath();
    ctx.moveTo(radius * 0.42, 0);
    ctx.lineTo(knotX, knotY);
    ctx.stroke();
    ctx.drawImage(
      image,
      frameWidth * frame,
      0,
      frameWidth,
      image.naturalHeight,
      drawLeft,
      drawTop,
      drawWidth,
      size,
    );
    ctx.restore();
  }

  drawClassicCobwebSpokes(ctx, entity, time = 0, alpha = 1) {
    const segments = Array.isArray(entity.segments) && entity.segments.length > 0
      ? entity.segments
      : Array.isArray(entity.webSegments) ? entity.webSegments : [];
    const baseRadius = Math.max(4, Number(entity.radius) || 6);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 5;
    for (const segment of segments) {
      const x1 = Number(segment.x1);
      const y1 = Number(segment.y1);
      const x2 = Number(segment.x2);
      const y2 = Number(segment.y2);
      if (![x1, y1, x2, y2].every(Number.isFinite)) continue;
      ctx.lineWidth = Math.max(1.5, Number(segment.width) || baseRadius * 0.26);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      const nodeRadius = Math.max(2, Number(segment.radius) || baseRadius * 0.3);
      ctx.beginPath();
      ctx.arc(x2, y2, nodeRadius, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 5;
    }
    for (const node of entity.borderNodes || []) {
      const x = Number(node.x);
      const y = Number(node.y);
      if (![x, y].every(Number.isFinite)) continue;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2, Number(node.radius) || baseRadius * 0.4), 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 5;
    }
    ctx.restore();
  }

  drawClassicLazerWeb(ctx, entity, time = 0, alpha = 1) {
    const paths = classicLazerSegmentsFor(entity);
    if (paths.length === 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#c45dff";
    ctx.shadowColor = "#9d32ff";
    ctx.shadowBlur = 8;
    for (const path of paths) {
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * (path.active === false ? 0.9 : 1)));
      ctx.lineWidth = Math.max(2, Number(path.width) || Number(entity.width) || 3);
      ctx.beginPath();
      ctx.moveTo(path.start.x, path.start.y);
      ctx.lineTo(path.end.x, path.end.y);
      ctx.stroke();
      this.drawClassicWebClamp(ctx, path.start.x, path.start.y, path.angle);
      if (path.active === false || path.endWallContact) {
        this.drawClassicWebClamp(ctx, path.end.x, path.end.y, path.angle);
      }
    }
    ctx.restore();
  }

  drawClassicCutterZone(ctx, entity, originX, originY, bounds, sim = this.lastSim) {
    const visiblePoint = (point) => classicVisibleArenaPointFor(sim, point);
    const paths = classicLazerSegmentsFor(entity, {
      width: Math.max(ARENA.width, bounds.x + bounds.width),
      height: Math.max(ARENA.height, bounds.y + bounds.height),
    });
    if (paths.length === 0) {
      const lineStart = entity.lineStart || { x: entity.x, y: entity.y };
      const lineEnd = entity.lineEnd || { x: entity.x2, y: entity.y2 };
      if ([lineStart.x, lineStart.y, lineEnd.x, lineEnd.y].every(Number.isFinite)) {
        paths.push({
          start: lineStart,
          end: lineEnd,
          active: true,
          angle: Math.atan2(lineEnd.y - lineStart.y, lineEnd.x - lineStart.x),
        });
      }
    }
    if (paths.length === 0) return;
    const computedZoneGeometries = classicCutterVisibleZoneGeometriesFor(entity, bounds);
    const fallbackZoneGeometry = Array.isArray(entity.zonePolygon) && entity.zonePolygon.length >= 3
      ? { polygon: entity.zonePolygon, segmentId: entity.zoneSegmentId || null }
      : classicCutterZoneGeometryFor(entity, bounds);
    const zoneGeometries = computedZoneGeometries.length > 0
      ? computedZoneGeometries
      : fallbackZoneGeometry ? [fallbackZoneGeometry] : [];
    // `segments` is the authoritative wall-contact path list. The fill below
    // deliberately comes from the current lifecycle helper, so old areas
    // disappear when their own expiry is reached. Each retained area also
    // carries its exact wall-to-wall line; keep that red connector alive for
    // the same lifecycle instead of letting a path-id mismatch make it vanish
    // while the damage polygon is still visible.
    const lineFinished = entity.activeLine === false && entity.linePhase !== "dragging";
    const holdPreviousZone = Array.isArray(entity.previousZonePolygon) && entity.previousZonePolygon.length >= 3;
    const visibleSegmentIds = new Set();
    if (entity.activeLine === true && entity.linePhase === "dragging") {
      if (holdPreviousZone && entity.previousZoneSegmentId) visibleSegmentIds.add(entity.previousZoneSegmentId);
      const activeSegmentId = entity.activeSegment?.id || entity.zoneSegmentId;
      if (activeSegmentId) visibleSegmentIds.add(activeSegmentId);
    } else {
      for (const zoneGeometry of zoneGeometries) {
        if (zoneGeometry?.segmentId) visibleSegmentIds.add(zoneGeometry.segmentId);
      }
      if (visibleSegmentIds.size === 0 && entity.zoneSegmentId) visibleSegmentIds.add(entity.zoneSegmentId);
    }
    const matchingPaths = paths.filter((path) => visibleSegmentIds.has(path.id));
    const geometryPaths = zoneGeometries
      .map((zoneGeometry) => {
        const line = zoneGeometry?.line;
        if (!line || ![line.x1, line.y1, line.x2, line.y2].every(Number.isFinite)) return null;
        return {
          id: zoneGeometry.segmentId || `zone-line-${line.x1}-${line.y1}-${line.x2}-${line.y2}`,
          start: { x: line.x1, y: line.y1 },
          end: { x: line.x2, y: line.y2 },
          angle: Math.atan2(line.y2 - line.y1, line.x2 - line.x1),
          active: false,
        };
      })
      .filter(Boolean);
    const pathsToDraw = [...matchingPaths, ...geometryPaths]
      .filter((path, index, allPaths) => allPaths.findIndex((candidate) => candidate.id === path.id) === index);
    if (pathsToDraw.length === 0 && paths.length > 0) pathsToDraw.push(paths.at(-1));
    if (pathsToDraw.length === 0) return;
    ctx.save();
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    ctx.strokeStyle = entity.lineColor || "#ff2738";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(1.5, Math.min(3, Number(entity.lineWidth) || 2));
    const baseAlpha = ctx.globalAlpha;
    if ((lineFinished || holdPreviousZone) && zoneGeometries.length > 0) {
      for (const zoneGeometry of zoneGeometries) {
        if (zoneGeometry?.polygon?.length < 3) continue;
        ctx.save();
        ctx.beginPath();
        zoneGeometry.polygon.forEach((point, index) => {
          const visible = visiblePoint(point);
          const localX = visible.x - originX;
          const localY = visible.y - originY;
          if (index === 0) ctx.moveTo(localX, localY);
          else ctx.lineTo(localX, localY);
        });
        ctx.closePath();
        ctx.fillStyle = entity.zoneFill || "#9f123944";
        ctx.globalAlpha = baseAlpha;
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.globalAlpha = baseAlpha;
    for (const linePath of pathsToDraw) {
      const visibleStart = visiblePoint(linePath.start);
      const visibleEnd = visiblePoint(linePath.end);
      ctx.beginPath();
      ctx.moveTo(visibleStart.x - originX, visibleStart.y - originY);
      ctx.lineTo(visibleEnd.x - originX, visibleEnd.y - originY);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawClassicTrainTrack(ctx, entity, originX, originY, bounds) {
    const paths = classicLazerSegmentsFor(entity, {
      width: Math.max(ARENA.width, bounds.x + bounds.width),
      height: Math.max(ARENA.height, bounds.y + bounds.height),
    });
    if (paths.length === 0) {
      const length = Math.max(40, Number(entity.length) || 260);
      ctx.strokeStyle = "#5b5149";
      ctx.lineWidth = 5;
      for (const offset of [-8, 8]) {
        ctx.beginPath();
        ctx.moveTo(-length / 2, offset);
        ctx.lineTo(length / 2, offset);
        ctx.stroke();
      }
      return;
    }
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const rail = this.options.classicBlackTheme ? "#7a797e" : "#5b5149";
    ctx.strokeStyle = rail;
    ctx.lineWidth = 5;
    for (const path of paths) {
      const startX = path.start.x - originX;
      const startY = path.start.y - originY;
      const endX = path.end.x - originX;
      const endY = path.end.y - originY;
      const dx = endX - startX;
      const dy = endY - startY;
      const length = Math.hypot(dx, dy) || 1;
      const normalX = -dy / length;
      const normalY = dx / length;
      for (const offset of [-8, 8]) {
        ctx.beginPath();
        ctx.moveTo(startX + normalX * offset, startY + normalY * offset);
        ctx.lineTo(endX + normalX * offset, endY + normalY * offset);
        ctx.stroke();
      }
      ctx.strokeStyle = this.options.classicBlackTheme ? "#a87752" : "#9a846f";
      ctx.lineWidth = 3;
      const ties = Math.max(2, Math.floor(length / 22));
      for (let index = 0; index <= ties; index += 1) {
        const progress = index / ties;
        const centerX = startX + dx * progress;
        const centerY = startY + dy * progress;
        ctx.beginPath();
        ctx.moveTo(centerX - normalX * 13, centerY - normalY * 13);
        ctx.lineTo(centerX + normalX * 13, centerY + normalY * 13);
        ctx.stroke();
      }
      ctx.strokeStyle = rail;
      ctx.lineWidth = 5;
      this.drawClassicWebClamp(ctx, startX, startY, path.angle);
      if (path.active === false || path.endWallContact) this.drawClassicWebClamp(ctx, endX, endY, path.angle);
    }
    ctx.restore();
  }

  drawClassicWebClamp(ctx, x, y, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f8f9ff";
    ctx.strokeStyle = "#d5b9ff";
    ctx.lineWidth = 2;
    ctx.fillRect(-8, -4, 16, 8);
    ctx.strokeRect(-8, -4, 16, 8);
    ctx.restore();
  }

  drawClassicVampireDrainParticles(ctx, sim, time = 0) {
    const dots = Array.isArray(sim.classicDots) ? sim.classicDots : [];
    for (const dot of dots) {
      if (dot.kind !== "vampire-latch") continue;
      const owner = sim.fighters?.find((fighter) => fighter.id === dot.ownerId);
      const target = sim.fighters?.find((fighter) => fighter.id === dot.targetId);
      if (!owner?.alive || !target?.alive) continue;
      const remaining = Number.isFinite(dot.expiresAt) ? dot.expiresAt - time : 1;
      if (remaining <= 0) continue;
      const dotSeed = String(dot.id || "dot").length;
      const pulse = 0.5 + Math.sin(time * 8 + dotSeed) * 0.22;
      ctx.save();
      ctx.globalAlpha = Math.max(0.25, Math.min(0.82, pulse));
      ctx.fillStyle = "#f33849";
      ctx.shadowColor = "#ff2038";
      ctx.shadowBlur = 8;
      for (let particle = 0; particle < 6; particle += 1) {
        const phase = (time * 1.4 + particle * 0.19 + dotSeed * 0.07) % 1;
        const jitter = Math.sin(time * 14 + particle * 2.4) * 4;
        const x = target.x + (owner.x - target.x) * phase + jitter;
        const y = target.y + (owner.y - target.y) * phase + Math.cos(time * 12 + particle) * 4;
        ctx.beginPath();
        ctx.arc(x, y, 2.4 + (particle % 3) * 0.7, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawClassicOrbiters(ctx, fighter, time) {
    const count = Math.max(0, fighter.classicOrbiters || 0);
    const growth = this.lastSim?.events?.findLast((event) => (
      event.type === "classic-orbital-growth" && event.fighterId === fighter.id
    ));
    const growAge = growth ? time - growth.time : Infinity;
    const palette = CLASS_DEFS.orbital;
    for (let index = 0; index < count; index += 1) {
      const { x, y, radius, ringIndex, ringOrbIndex } = classicOrbiterPosition(fighter, index, time);
      const emerging = growAge >= 0 && growAge < 0.2
        && ringIndex === growth?.ringIndex && ringOrbIndex === growth.ringOrbiterCount - 1;
      ctx.save();
      ctx.fillStyle = emerging ? "#e2fbff" : classicVisualColorFor("orbital", palette.color);
      ctx.strokeStyle = this.options.classicBlackTheme ? palette.accent : "#111418";
      ctx.lineWidth = Math.max(1.5, radius * 0.22);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (emerging && this.options.motionTrails) {
        ctx.globalAlpha = 0.65 * (1 - growAge / 0.2);
        ctx.strokeStyle = palette.accent;
        ctx.beginPath();
        ctx.arc(x, y, radius * (1.1 + 2.8 * growAge), 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawClassicCrown(ctx, radius) {
    ctx.save();
    ctx.translate(0, -radius - 15);
    ctx.fillStyle = "#050505";
    ctx.fillRect(-19, 8, 38, 9);
    ctx.beginPath();
    ctx.moveTo(-19, 8);
    ctx.lineTo(-17, -10);
    ctx.lineTo(-5, 1);
    ctx.lineTo(0, -14);
    ctx.lineTo(7, 1);
    ctx.lineTo(18, -10);
    ctx.lineTo(19, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffd229";
    ctx.fillRect(-15, 9, 30, 5);
    ctx.beginPath();
    ctx.moveTo(-14, 7);
    ctx.lineTo(-13, -4);
    ctx.lineTo(-4, 5);
    ctx.lineTo(0, -7);
    ctx.lineTo(6, 5);
    ctx.lineTo(14, -4);
    ctx.lineTo(15, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawClassicSnakeTail(ctx, fighter, time = 0) {
    const radius = fighter.radius;
    const speed = Math.hypot(fighter.vx, fighter.vy) || 1;
    const backX = -fighter.vx / speed;
    const backY = -fighter.vy / speed;
    const segmentCount = Math.max(1, Math.floor(Number(fighter.classicSnakeTailSegments) || 1));
    const growth = Math.max(0.16, Math.min(1, Number(fighter.classicSnakeTailGrowth) || 0.16));
    const tailAngle = Math.atan2(backY, backX);
    for (let index = segmentCount; index >= 1; index -= 1) {
      // The tail is a chain of separate ovals: the far end starts tiny and
      // each segment grows toward the body, matching the Orb Racer snake
      // silhouette instead of drawing one repeated blob.
      const distanceFromBody = segmentCount <= 1 ? 0 : (index - 1) / (segmentCount - 1);
      const segmentScale = growth * (0.28 + (1 - distanceFromBody) * 0.72);
      const majorRadius = radius * (0.16 + segmentScale * 0.64);
      const ovalRatio = Math.max(
        0.55,
        Math.min(1, 0.55 + (1 - distanceFromBody) * 0.45 + ((growth - 0.16) / 0.84) * 0.25),
      );
      const longitudinalRadius = majorRadius;
      const crossRadius = majorRadius * ovalRatio;
      const spacing = radius * (0.78 + index * 0.72);
      const wiggle = Math.sin(time * 12 - index * 0.8) * radius * 0.08 * (0.35 + growth);
      const x = fighter.x + backX * spacing - backY * wiggle;
      const y = fighter.y + backY * spacing + backX * wiggle;
      ctx.fillStyle = "#9cf27b";
      ctx.strokeStyle = "#050505";
      ctx.lineWidth = Math.max(3, radius * 0.08);
      ctx.beginPath();
      ctx.ellipse(x, y, longitudinalRadius, crossRadius, tailAngle, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  }

  classicOpponentFor(fighter) {
    return this.lastSim?.fighters?.find((candidate) => (
      candidate.alive && candidate.id !== fighter.id && candidate.classicDuplicateRootId !== fighter.id
    )) || null;
  }

  drawClassicPresentationSprite(ctx, id, radius, {
    width = radius * 1.7,
    height = width,
    sourceX = 0,
    sourceY = 0,
    sourceWidth = null,
    sourceHeight = null,
    x = 0,
    y = 0,
    angle = 0,
    alpha = 1,
  } = {}) {
    const image = this.classicPresentationSprites.get(id);
    if (!image) return false;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.imageSmoothingEnabled = false;
    if (sourceWidth && sourceHeight) {
      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, -width / 2, -height / 2, width, height);
    } else {
      ctx.drawImage(image, -width / 2, -height / 2, width, height);
    }
    ctx.restore();
    return true;
  }

  drawClassicHydrogenBody(ctx, fighter, radius) {
    const image = this.classicPresentationSprites.get("hydrogen-bomb");
    const outerRadius = radius + Math.max(4, radius * 0.095);
    ctx.fillStyle = "#242024";
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, TAU);
    ctx.fill();
    if (image?.naturalWidth && image.naturalHeight) {
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.clip();
      ctx.imageSmoothingEnabled = false;
      // Match Orb Racer's symbol crop: the supplied source has a watermark
      // below the 260px square, so only the upper square is ever drawn.
      ctx.drawImage(image, 0, 0, sourceSize, sourceSize, -radius, -radius, radius * 2, radius * 2);
      ctx.restore();
    } else {
      // Keep the body recognizable while the local symbol finishes loading.
      ctx.fillStyle = "#ffd51a";
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#242024";
      for (let index = 0; index < 3; index += 1) {
        ctx.save();
        ctx.rotate(index * TAU / 3 - Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.08);
        ctx.lineTo(radius * 0.72, -radius * 0.84);
        ctx.lineTo(radius * 0.48, -radius * 0.08);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.2, 0, TAU);
      ctx.fill();
    }
    if (this.lastSim?.gameplayMode === "classic" && this.options.classicTeamColors !== false && Number.isInteger(fighter.classicTeamIndex)) {
      ctx.strokeStyle = classicTeamOutlineColorFor(fighter.classicTeamIndex);
      ctx.lineWidth = Math.max(3, radius * 0.1);
      ctx.beginPath();
      ctx.arc(0, 0, radius + Math.max(5, radius * 0.13), 0, TAU);
      ctx.stroke();
    }
    if (fighter.alive && fighter.health > 0 && fighter.health <= fighter.maxHealth * 0.25) {
      ctx.strokeStyle = "#ff3c3c";
      ctx.lineWidth = Math.max(4, radius * 0.12);
      ctx.globalAlpha = 0.78 + Math.sin(this.lastSim?.time * 14 || 0) * 0.18;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 5, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  drawClassicSheetFrame(ctx, id, radius, {
    frameCount = 3,
    frame = 0,
    width = radius * 1.7,
    height = width,
    x = 0,
    y = 0,
    angle = 0,
    alpha = 1,
  } = {}) {
    const image = this.classicPresentationSprites.get(id);
    if (!image?.naturalWidth || !image.naturalHeight) return false;
    const safeFrameCount = Math.max(1, Math.floor(frameCount));
    const frameWidth = image.naturalWidth / safeFrameCount;
    const safeFrame = Math.max(0, Math.min(safeFrameCount - 1, Math.floor(frame)));
    const crop = classicSheetCropFor(id, {
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      frameCount: safeFrameCount,
      frame: safeFrame,
    });
    return this.drawClassicPresentationSprite(ctx, id, radius, {
      width,
      height,
      sourceX: crop.x,
      sourceY: crop.y,
      sourceWidth: crop.width,
      sourceHeight: crop.height,
      x,
      y,
      angle,
      alpha,
    });
  }

  drawClassicBoxerGloveFrame(ctx, radius, frame, row, {
    x = 0,
    y = 0,
    angle = 0,
    width = radius * 2.25,
    height = radius * 1.55,
    alpha = 1,
    monster = false,
    spriteId = "boxer",
  } = {}) {
    const image = this.classicPresentationSprites.get(spriteId) || this.classicPresentationSprites.get("boxer");
    if (!image?.naturalWidth || !image.naturalHeight) return false;
    const frameWidth = image.naturalWidth / 3;
    const frameHeight = image.naturalHeight / 2;
    const safeFrame = Math.max(0, Math.min(2, Math.floor(Number(frame) || 0)));
    const safeRow = Math.max(0, Math.min(1, Math.floor(Number(row) || 0)));
    // The dedicated Monster sheet is a single horizontal strip. Guard and
    // impact cells contain two fists side-by-side, while the punch cell is a
    // single extended fist. Crop one half for each stacked guard glove so the
    // sheet is not drawn twice as a distorted four-fist band.
    const monsterSourceY = image.naturalHeight * 0.39;
    const monsterPairFrame = monster && safeFrame !== 1;
    const boxerSource = classicBoxerGloveSourceRect(image.naturalWidth, image.naturalHeight, safeFrame, safeRow);
    const sourceX = monster
      // Both Monster fists use the same authored-facing crop. Rotating the
      // glove pair toward the opponent must not mirror one fist back toward
      // Monster; the two hands should point in one shared direction.
      ? safeFrame * frameWidth + (monsterPairFrame ? 0 : 0)
      : boxerSource.x;
    const sourceY = monster ? monsterSourceY : boxerSource.y;
    const sourceWidth = monster && monsterPairFrame ? frameWidth * 0.5 : monster ? frameWidth : boxerSource.width;
    const sourceHeight = monster ? image.naturalHeight * 0.12 : boxerSource.height;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    if (monster && spriteId === "boxer") {
      // The generated glove is the same pixel silhouette, but Monster keeps
      // its own green identity through a deterministic tint.
      ctx.filter = "hue-rotate(92deg) saturate(0.72) brightness(0.78)";
    }
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -width / 2,
      -height / 2,
      width,
      height,
    );
    ctx.restore();
    return true;
  }

  drawClassicBoxerGloves(ctx, fighter, radius, targetAngle, frame, time = 0, monster = false) {
    // Monster and Boxer share the same delayed punch state. Monster keeps its
    // own scaly-fist sheet, but its selected hand, reach, phases, and smoke
    // trail all consume the same Gameplay-owned punch fields.
    const phase = String(fighter.classicPunchPhase || "idle").toLowerCase();
    const punching = ["retract", "extend", "impact", "recover", "windup", "extended", "punching"].includes(phase);
    const gloves = Array.isArray(fighter.classicPunchGloves) ? fighter.classicPunchGloves : [];
    const forwardX = Math.cos(targetAngle);
    const forwardY = Math.sin(targetAngle);
    // Keep the gloves materially larger than the orb, like the stacked
    // reference composition, while the minimum forward anchor keeps a flying
    // fist outside the orb instead of drawing a horizontal band through it.
    const gloveScale = 0.75;
    const gloveWidth = radius * (monster ? 3.3 : 3.45) * gloveScale;
    const gloveHeight = radius * (monster ? 1.68 : 2.15) * gloveScale;
    const spriteId = monster ? "monsterFists" : "boxer";
    const sourceFrame = punching ? frame : 0;
    const drawOne = (side, glove = null) => {
      const row = side < 0 ? 0 : 1;
      const hasWorldTip = Number.isFinite(Number(glove?.x2)) && Number.isFinite(Number(glove?.y2));
      const dynamic = punching && glove?.punchingHand === true && hasWorldTip;
      const drawWidth = gloveWidth;
      const drawHeight = gloveHeight;
      // Guard gloves keep the reference's vertical stack. Only the active
      // glove follows the world-space punch endpoint and rotates toward the
      // opponent.
      const guardDistance = monster ? 1.34 : 1.1;
      const normalX = -forwardY;
      const normalY = forwardX;
      const localTipX = dynamic
        ? Number(glove.x2) - Number(fighter.x || 0)
        : forwardX * radius * 0.12 + normalX * side * radius * guardDistance;
      const localTipY = dynamic
        ? Number(glove.y2) - Number(fighter.y || 0)
        : forwardY * radius * 0.12 + normalY * side * radius * guardDistance;
      // The glove's nose reaches the captured world endpoint while its cuff
      // remains outside/overlapping the orb, matching the stacked reference
      // composition and keeping the punch distance visually honest.
      let centerX = localTipX;
      let centerY = localTipY;
      if (dynamic) {
        const normalX = -forwardY;
        const normalY = forwardX;
        const tipAlong = localTipX * forwardX + localTipY * forwardY;
        const tipAcross = localTipX * normalX + localTipY * normalY;
        const centerAlong = Math.max(
          radius * 1.5,
          tipAlong - drawWidth * 0.38,
        );
        centerX = forwardX * centerAlong + normalX * tipAcross;
        centerY = forwardY * centerAlong + normalY * tipAcross;
      }
      const gloveAngle = targetAngle;
      // The non-punching glove stays in the guarded frame. Reusing the active
      // punch frame for both rows made Boxer look like it always punched twice.
      const frameForDraw = dynamic ? sourceFrame : 0;
      const draw = () => this.drawClassicBoxerGloveFrame(ctx, radius, frameForDraw, row, {
        x: centerX,
        y: centerY,
        angle: gloveAngle,
        width: drawWidth,
        height: drawHeight,
        monster,
        spriteId,
      });
      if (!dynamic) return draw();
      // The flying fist attaches at the orb's rim but must not paint a solid
      // horizontal strip over the orb body or its centered HP. Clip only the
      // active glove to the outside of the local orb; the guard gloves retain
      // their intentional top/bottom overlap from the reference.
      ctx.save();
      ctx.beginPath();
      ctx.rect(-radius * 8, -radius * 8, radius * 16, radius * 16);
      ctx.arc(0, 0, radius * 1.01, 0, TAU, true);
      ctx.clip("evenodd");
      const drawn = draw();
      ctx.restore();
      return drawn;
    };
    if (gloves.length) {
      const left = gloves.find((glove) => glove.hand === "left") || gloves[0];
      const right = gloves.find((glove) => glove.hand === "right") || gloves[1] || gloves[0];
      drawOne(-1, left);
      drawOne(1, right);
    } else {
      drawOne(-1);
      drawOne(1);
    }
    // A tiny deterministic contact glint makes the impact frame read at
    // distance without replacing the generated glove silhouette.
    if (!monster && phase === "impact" && gloves.length) {
      const activeGlove = gloves.find((glove) => glove.active) || gloves[0];
      const localX = Number(activeGlove.x2) - Number(fighter.x || 0);
      const localY = Number(activeGlove.y2) - Number(fighter.y || 0);
      ctx.save();
      ctx.globalAlpha = 0.8 + Math.sin(time * 38) * 0.15;
      ctx.strokeStyle = monster ? "#c9ffd2" : "#fff2b0";
      ctx.lineWidth = Math.max(2, radius * 0.06);
      for (let ray = 0; ray < 4; ray += 1) {
        const angle = ray * Math.PI / 2 + time * 0.4;
        ctx.beginPath();
        ctx.moveTo(localX + Math.cos(angle) * radius * 0.38, localY + Math.sin(angle) * radius * 0.38);
        ctx.lineTo(localX + Math.cos(angle) * radius * 0.7, localY + Math.sin(angle) * radius * 0.7);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  drawClassicBoxerSmoke(ctx, fighter, radius, time = 0) {
    const startedAt = Number(fighter.classicPunchStartedAt);
    const punchCount = Math.max(0, Number(fighter.classicPunchCount) || 0);
    const hasPunchState = punchCount > 0 || Number(fighter.classicAbilityActiveUntil) > time;
    if (!Number.isFinite(startedAt) || !hasPunchState) return;
    const punchAge = time - startedAt;
    const withinSmokeWindow = punchAge >= -0.05 && punchAge <= 0.55;
    const key = fighter.id || fighter.type || "boxer";
    const signature = `${punchCount}:${startedAt}`;
    let trail = this.classicPunchSmokeTrails.get(key);
    if (!trail || trail.signature !== signature) {
      trail = { signature, startedAt, samples: [] };
      this.classicPunchSmokeTrails.set(key, trail);
    }
    const phase = String(fighter.classicPunchPhase || "idle").toLowerCase();
    const punching = ["retract", "extend", "impact", "recover", "windup", "extended", "punching"].includes(phase);
    let gloves = Array.isArray(fighter.classicPunchGloves) ? fighter.classicPunchGloves : [];
    if (!gloves.length && (punching || (punchCount > 0 && withinSmokeWindow))) {
      const angle = Number(fighter.classicPunchAngle) || 0;
      const forwardX = Math.cos(angle);
      const forwardY = Math.sin(angle);
      const normalX = -forwardY;
      const normalY = forwardX;
      const progress = Math.max(0, Math.min(1, (time - startedAt - 0.08) / 0.3));
      const reach = Math.max(
        radius * 0.72,
        (Number(fighter.classicPunchReach) || radius * 3.9) * (0.18 + progress * 0.82),
      );
      const activeHand = fighter.classicPunchHand || "left";
      gloves = [-1, 1].map((side, index) => ({
        hand: index === 0 ? "left" : "right",
        punchingHand: (index === 0 ? "left" : "right") === activeHand,
        x2: Number(fighter.x || 0) + forwardX * reach + normalX * radius * 0.47 * side,
        y2: Number(fighter.y || 0) + forwardY * reach + normalY * radius * 0.47 * side,
      })).filter((glove) => glove.punchingHand);
    }
    const punchingGloves = gloves.filter((glove) => glove.punchingHand === true);
    if (punchingGloves.length && (punching || (punchCount > 0 && withinSmokeWindow))) {
      const last = trail.samples[trail.samples.length - 1];
      if (!last || time - last.time >= 1 / 45) {
        trail.samples.push({
          time,
          angle: Number(fighter.classicPunchAngle) || 0,
          gloves: punchingGloves.map((glove) => ({ x2: Number(glove.x2), y2: Number(glove.y2) })),
        });
      }
    }
    trail.samples = trail.samples.filter((sample) => time - sample.time <= 0.55);
    if (!trail.samples.length) return;

    ctx.save();
    // drawClassicOrbDetails runs in the fighter-local transform. Convert the
    // sampled world-space glove tips back to that local origin instead of
    // translating the canvas a second time; the outer arena transform remains
    // responsible for placing the fighter in the social canvas.
    for (let sampleIndex = 0; sampleIndex < trail.samples.length; sampleIndex += 2) {
      const sample = trail.samples[sampleIndex];
      const alpha = classicBoxerSmokeAlpha(time - sample.time, 0.5);
      if (alpha <= 0) continue;
      const forwardX = Math.cos(sample.angle);
      const forwardY = Math.sin(sample.angle);
      const normalX = -forwardY;
      const normalY = forwardX;
      for (let gloveIndex = 0; gloveIndex < sample.gloves.length; gloveIndex += 1) {
        const glove = sample.gloves[gloveIndex];
        if (![glove.x2, glove.y2].every(Number.isFinite)) continue;
        const localGloveX = glove.x2 - Number(fighter.x || 0);
        const localGloveY = glove.y2 - Number(fighter.y || 0);
        for (let puff = 0; puff < 6; puff += 1) {
          const wobble = Math.sin(sample.time * 11 + gloveIndex * 2.7 + puff * 1.9) * radius * 0.1;
          const distance = radius * (0.14 + puff * 0.22);
          const px = localGloveX - forwardX * distance + normalX * (wobble + (gloveIndex ? radius * 0.05 : -radius * 0.05));
          const py = localGloveY - forwardY * distance + normalY * (wobble + (gloveIndex ? radius * 0.05 : -radius * 0.05));
          const puffRadius = radius * (0.17 + puff * 0.035);
          const puffAlpha = alpha * (0.46 - puff * 0.052);
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, puffRadius * 1.8);
          gradient.addColorStop(0, `rgba(224, 224, 224, ${puffAlpha})`);
          gradient.addColorStop(0.52, `rgba(132, 132, 132, ${puffAlpha * 0.72})`);
          gradient.addColorStop(1, "rgba(54, 54, 54, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(px, py, puffRadius * 1.8, 0, TAU);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  drawClassicGunOverlay(ctx, fighter, radius, targetAngle, time = 0) {
    const gunType = String(fighter.type || "pistol").toLowerCase();
    const phase = String(fighter.classicGunPhase || "ready").toLowerCase();
    const firingUntil = Number(fighter.classicGunFiringUntil);
    const reloadUntil = Number(fighter.classicGunReloadUntil);
    const firing = phase === "firing" || (Number.isFinite(firingUntil) && time < firingUntil);
    const reloading = phase === "reload"
      || (Number.isFinite(firingUntil) && Number.isFinite(reloadUntil) && time >= firingUntil && time < reloadUntil);
    const gunAngle = Number.isFinite(Number(fighter.classicGunAimAngle))
      ? Number(fighter.classicGunAimAngle)
      : targetAngle;
    const generatedGunId = gunType === "shotgun"
      ? "shotgunWeapon"
      : gunType === "rifle" ? "rifleWeapon" : null;
    const generatedImage = generatedGunId ? this.classicPresentationSprites.get(generatedGunId) : null;
    const image = generatedImage?.naturalWidth
      ? generatedImage
      : this.classicPresentationSprites.get(CLASSIC_DRAFTMASTER_GUN_ASSET);
    if (!image?.naturalWidth || !image.naturalHeight) return false;
    // Reloading reuses the ready silhouette. The animation is a rapid spin of
    // the mounted gun itself, matching Orb Racer's Draftmaster flourish; it
    // must not swap in a generated reload frame.
    const generatedFrame = firing ? 1 : 0;
    const source = generatedImage?.naturalWidth
      ? classicGunSheetSourceRect(image.naturalWidth, image.naturalHeight, generatedFrame)
      : classicDraftmasterGunSourceRect(image.naturalWidth, image.naturalHeight, gunType);
    const profile = gunType === "shotgun"
      ? { width: 2.85, height: 1.28, muzzle: 2.5 }
      : gunType === "rifle"
        ? { width: 3.35, height: 1.18, muzzle: 3.02 }
        : { width: 3.15, height: 1.5, muzzle: 2.72 };
    const gunScale = CLASSIC_GUN_ORB_RENDER_SCALE;
    const weaponWidth = radius * profile.width * gunScale;
    const weaponHeight = radius * profile.height * gunScale;
    const recoil = firing ? -radius * 0.14 * gunScale : 0;
    const reloadProgress = reloading && Number.isFinite(firingUntil) && Number.isFinite(reloadUntil)
      ? Math.max(0, Math.min(1, (time - firingUntil) / Math.max(0.001, reloadUntil - firingUntil)))
      : 0;
    const easedReload = reloadProgress * reloadProgress * (3 - 2 * reloadProgress);
    const spin = reloading ? (easedReload * Math.PI * 7) : 0;
    const passCount = reloading ? 3 : 1;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (let pass = 0; pass < passCount; pass += 1) {
      const center = (passCount - 1) / 2;
      const ghostOffset = reloading ? (pass - center) * 0.14 : 0;
      ctx.save();
      ctx.globalAlpha = reloading ? 0.24 + (pass === Math.floor(center) ? 0.42 : 0) : 1;
      // Aim around the opponent, then spin the mounted weapon around its own
      // center during reload. Rotating the whole local canvas made the gun
      // orbit the orb instead of spinning in the held position.
      ctx.rotate(gunAngle + ghostOffset);
      // Draw the gun after the orb body and start its handle inside the orb.
      // This keeps the handle visible instead of letting the solid orb cover
      // the attachment point.
      const mountX = -radius * CLASSIC_GUN_HANDLE_OVERLAP * gunScale + recoil;
      ctx.translate(mountX + weaponWidth / 2, 0);
      ctx.scale(1, classicGunBodyFlipYFor(gunType));
      ctx.rotate(spin + (reloading ? (pass - center) * 0.16 : 0));
      ctx.shadowColor = firing ? "#fff1a8" : reloading ? "#f4c430" : "#16191d";
      ctx.shadowBlur = firing ? Math.max(8, radius * 0.3) : reloading ? Math.max(4, radius * 0.18) : 0;
      ctx.drawImage(
        image,
        source.x,
        source.y,
        source.width,
        source.height,
        -weaponWidth / 2,
        -weaponHeight / 2,
        weaponWidth,
        weaponHeight,
      );
      ctx.restore();
    }
    if (firing) {
      const muzzleX = radius * (profile.muzzle + 0.2) * gunScale + recoil;
      ctx.save();
      ctx.rotate(gunAngle);
      ctx.globalAlpha = 0.96;
      ctx.fillStyle = "#fff8c7";
      ctx.strokeStyle = "#a96b16";
      ctx.lineWidth = Math.max(2, radius * 0.07);
      ctx.beginPath();
      ctx.moveTo(muzzleX, 0);
      ctx.lineTo(muzzleX + radius * 0.42 * gunScale, -radius * 0.25 * gunScale);
      ctx.lineTo(muzzleX + radius * 0.22 * gunScale, 0);
      ctx.lineTo(muzzleX + radius * 0.42 * gunScale, radius * 0.25 * gunScale);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    return true;
  }

  drawClassicTridentWeapon(ctx, radius, targetAngle) {
    const image = this.classicPresentationSprites.get("tridentWeapon");
    if (!image?.naturalWidth || !image.naturalHeight) return false;
    const source = classicTridentSourceRect(image.naturalWidth, image.naturalHeight);
    const dimensions = classicTridentDimensions(radius);
    return this.drawClassicPresentationSprite(ctx, "tridentWeapon", radius, {
      sourceX: source.x,
      sourceY: source.y,
      sourceWidth: source.width,
      sourceHeight: source.height,
      width: dimensions.width,
      height: dimensions.height,
      // Keep only the butt of the handle beneath the full orb so the three
      // prongs read as a large attached weapon instead of a line through HP.
      x: radius * 1.72,
      angle: targetAngle,
    });
  }

  drawClassicCircularImpactBurst(ctx, {
    x,
    y,
    radius,
    age = 0,
    seed = 0,
    surface = "orb",
    palette = null,
    duration = CLASSIC_IMPACT_BURST_DURATION,
    particleCount = CLASSIC_IMPACT_BURST_PARTICLES,
    spreadScale = 1,
    particleScale = 1,
  } = {}) {
    const targetRadius = Math.max(8, Number(radius) || 24);
    const safeAge = Math.max(0, Number(age) || 0);
    const safeDuration = Math.max(0.001, Number(duration) || CLASSIC_IMPACT_BURST_DURATION);
    const alpha = classicTridentImpactAlpha(safeAge, safeDuration);
    if (alpha <= 0 || !Number.isFinite(Number(x)) || !Number.isFinite(Number(y))) return;
    const progress = Math.max(0, Math.min(1, safeAge / safeDuration));
    const eased = 1 - Math.pow(1 - progress, 3);
    const particlePalette = Array.isArray(palette) && palette.length
      ? palette.filter((color) => typeof color === "string" && color.length > 0)
      : classicImpactPaletteFor(surface);
    const safePalette = particlePalette.length ? particlePalette : classicImpactPaletteFor(surface);
    const numericSeed = Number(seed) || String(seed || surface).length * 17;
    const safeParticleCount = Math.max(1, Math.floor(Number(particleCount) || CLASSIC_IMPACT_BURST_PARTICLES));
    const safeSpreadScale = Math.max(0.1, Number(spreadScale) || 1);
    const safeParticleScale = Math.max(0.1, Number(particleScale) || 1);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = Math.max(3, targetRadius * 0.12);

    // Match Orb Race layer-break feedback: only filled circles burst outward
    // and fade. There are deliberately no shock rings, shards, or gray pixels
    // in the orb/bullet palette.
    for (let particle = 0; particle < safeParticleCount; particle += 1) {
      const particleAngle = particle * TAU / safeParticleCount
        + numericSeed * 0.017
        + safeAge * (0.6 + (particle % 4) * 0.035);
      const lane = (particle * 17 + numericSeed) % 13;
      const travel = targetRadius * (0.16 + eased * (0.92 + lane * 0.075)) * safeSpreadScale;
      const px = Number(x) + Math.cos(particleAngle) * travel;
      const py = Number(y) + Math.sin(particleAngle) * travel * (0.86 + (particle % 5) * 0.035);
      const particleRadius = Math.max(3.5, targetRadius * (0.055 + (particle % 5) * 0.014) * safeParticleScale);
      ctx.globalAlpha = alpha * (0.94 - (particle % 6) * 0.055);
      ctx.fillStyle = safePalette[(particle * 5 + numericSeed) % safePalette.length];
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(px, py, particleRadius, 0, TAU);
      ctx.fill();
    }

    // A single filled center particle keeps the hit anchored while the field
    // is still compact; it is not an outline or a ring.
    ctx.globalAlpha = alpha * Math.max(0, 1 - progress * 1.2);
    ctx.fillStyle = safePalette[(numericSeed + 2) % safePalette.length];
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = Math.max(5, targetRadius * 0.2);
    ctx.beginPath();
    ctx.arc(Number(x), Number(y), Math.max(4, targetRadius * 0.12 * (1 - progress * 0.4)), 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawClassicSwordContact(ctx, event, attacker, accent, age) {
    if (!Number.isFinite(event.x) || !Number.isFinite(event.y)) return;
    const angle = Math.atan2(event.y - attacker.y, event.x - attacker.x);
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - age / 0.14);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(event.x, event.y, attacker.radius * (0.38 + 3 * age), angle - 0.93, angle + 0.93);
    ctx.stroke();
    ctx.restore();
  }

  drawClassicTridentImpactBurst(ctx, impact = {}) {
    this.drawClassicCircularImpactBurst(ctx, {
      ...impact,
      surface: "orb",
    });
  }

  drawClassicImpactBursts(ctx, sim, time = 0) {
    const fighters = sim?.fighters || [];
    const fighterById = new Map(fighters.map((fighter) => [fighter.id, fighter]));
    for (const event of sim?.events || []) {
      const eventTime = Number(event.time);
      if (!Number.isFinite(eventTime)) continue;
      const age = Number(time) - eventTime;
      if (age < 0 || age > CLASSIC_IMPACT_BURST_DURATION) continue;
      if (event.type === "weapon-hit" || event.type === "classic-orbital-hit") {
        if (!(event.amount > 0) || age > 0.21) continue;
        const attacker = fighterById.get(event.fighterId);
        const accent = CLASS_DEFS[attacker?.type]?.accent || "#ffd77f";
        const target = fighterById.get(event.targetId);
        this.drawClassicCircularImpactBurst(ctx, {
          x: event.x,
          y: event.y,
          radius: target?.radius,
          age,
          seed: event.id,
          palette: [accent, "#fff8ea"],
          duration: 0.21,
          particleCount: this.options.flashReduction ? 5 : 11,
          spreadScale: 0.72,
          particleScale: 0.8,
        });
        if (attacker?.type === "sword" && !this.options.flashReduction) {
          this.drawClassicSwordContact(ctx, event, attacker, accent, age);
        }
        continue;
      }
      if (event.type === "classic-trident-stick") {
        const surface = event.surface === "wall" ? "wall" : event.surface === "orb" ? "orb" : null;
        if (!surface) continue;
        const wallContact = surface === "wall" ? event.wallContact : null;
        const contactX = Number(wallContact?.x ?? event.x);
        const contactY = Number(wallContact?.y ?? event.y);
        const owner = fighterById.get(event.fighterId);
        this.drawClassicCircularImpactBurst(ctx, {
          x: contactX,
          y: contactY,
          radius: owner?.radius,
          age,
          seed: event.id,
          surface,
        });
        continue;
      }
      if (event.type !== "classic-projectile-hit") continue;
      if (!CLASSIC_BULLET_IMPACT_KINDS.has(String(event.projectileKind || "").toLowerCase())) continue;
      const target = fighterById.get(event.targetId);
      this.drawClassicCircularImpactBurst(ctx, {
        x: event.x,
        y: event.y,
        radius: target?.radius,
        age,
        seed: event.id,
        surface: "orb",
      });
    }
  }

  tridentThrowIsActive(fighter, time = 0) {
    return this.lastSim?.classicEntities?.some((entity) => (
      entity.kind === "trident-ammo"
      && entity.ownerId === fighter.id
      && CLASSIC_TRIDENT_THROW_PHASES.has(entity.phase)
      && (entity.expiresAt === null || !Number.isFinite(Number(entity.expiresAt)) || Number(entity.expiresAt) > time)
    )) === true;
  }

  drawClassicAmmoSprite(ctx, entity, kind, radius, offsetX = 0, offsetY = 0) {
    if (kind === "shotgun-ammo") {
      const image = this.classicPresentationSprites.get("shotgunAmmo");
      if (image?.naturalWidth && image.naturalHeight) {
        const source = classicShotgunAmmoSourceRect(image.naturalWidth, image.naturalHeight, 0);
        const width = radius * 4.2 * CLASSIC_SHOTGUN_PROJECTILE_SCALE;
        const height = width * source.height / Math.max(1, source.width);
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, source.x, source.y, source.width, source.height, offsetX - width / 2, offsetY - height / 2, width, height);
        ctx.restore();
        return true;
      }
      // Keep a readable fallback while the generated sheet is loading. The
      // normal browser path uses the dedicated GPT Image shell above.
      const projectileScale = CLASSIC_SHOTGUN_PROJECTILE_SCALE;
      const width = radius * 4.2 * projectileScale;
      const totalHeight = radius * 2 * projectileScale;
      const cap = Math.max(4, totalHeight * 0.52);
      const bodyRight = width * 0.5 - cap * 0.58;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#d6272f";
      ctx.strokeStyle = "#101010";
      ctx.lineWidth = Math.max(2, radius * 0.12);
      ctx.fillRect(offsetX - width / 2, offsetY - totalHeight / 2, bodyRight + width / 2, totalHeight);
      ctx.strokeRect(offsetX - width / 2, offsetY - totalHeight / 2, bodyRight + width / 2, totalHeight);
      ctx.fillStyle = "#ffd43b";
      ctx.fillRect(offsetX + bodyRight - cap * 0.12, offsetY - cap / 2, cap, cap);
      ctx.strokeRect(offsetX + bodyRight - cap * 0.12, offsetY - cap / 2, cap, cap);
      ctx.restore();
      return true;
    }
    if (kind === "draftmaster-ammo") {
      const image = this.classicPresentationSprites.get(CLASSIC_DRAFTMASTER_AMMO_ASSET);
      if (!image?.naturalWidth || !image.naturalHeight) return false;
      const source = classicDraftmasterAmmoSourceRect(image.naturalWidth, image.naturalHeight, kind);
      const projectileScale = CLASSIC_GUN_PROJECTILE_RENDER_SCALE;
      const width = radius * 5.1 * projectileScale;
      const height = radius * 1.35 * projectileScale;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, source.x, source.y, source.width, source.height, offsetX - width / 2, offsetY - height / 2, width, height);
      ctx.restore();
      return true;
    }
    if (["pistol-ammo", "rifle-ammo", "sniper-ammo"].includes(kind)) {
      const straightImage = this.classicPresentationSprites.get(CLASSIC_SNIPER_AMMO_ASSET);
      if (straightImage?.naturalWidth && straightImage.naturalHeight) {
        const source = classicSniperAmmoSourceRect(straightImage.naturalWidth, straightImage.naturalHeight, kind);
        const projectileScale = CLASSIC_GUN_PROJECTILE_RENDER_SCALE;
        const baseWidth = radius * (kind === "pistol-ammo" ? 4.15 : 5.1) * projectileScale;
        const projectileSize = ["rifle-ammo", "sniper-ammo"].includes(kind)
          ? CLASSIC_RIFLE_PROJECTILE_SCALE
          : CLASSIC_SNIPER_PROJECTILE_SCALE;
        const width = baseWidth * projectileSize;
        const height = width * source.height / Math.max(1, source.width);
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(straightImage, source.x, source.y, source.width, source.height, offsetX - width / 2, offsetY - height / 2, width, height);
        ctx.restore();
        return true;
      }
      const image = this.classicPresentationSprites.get(CLASSIC_DRAFTMASTER_AMMO_ASSET);
      if (!image?.naturalWidth || !image.naturalHeight) return false;
      const source = classicDraftmasterAmmoSourceRect(image.naturalWidth, image.naturalHeight, kind);
      const isPistol = kind === "pistol-ammo";
      const projectileScale = CLASSIC_GUN_PROJECTILE_RENDER_SCALE;
      const baseWidth = radius * (isPistol ? 4.15 : 5.1) * projectileScale;
      const projectileSize = ["rifle-ammo", "sniper-ammo"].includes(kind)
        ? CLASSIC_RIFLE_PROJECTILE_SCALE
        : CLASSIC_SNIPER_PROJECTILE_SCALE;
      const width = baseWidth * projectileSize;
      // Preserve the source aspect ratio. Stretching the crop into an
      // arbitrary rectangle made the straight bullet silhouette look curved.
      const height = width * source.height / Math.max(1, source.width);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, source.x, source.y, source.width, source.height, offsetX - width / 2, offsetY - height / 2, width, height);
      ctx.restore();
      return true;
    }
    if (kind === "trident-ammo") {
      const image = this.classicPresentationSprites.get("tridentWeapon");
      if (!image?.naturalWidth || !image.naturalHeight) return false;
      const source = classicTridentSourceRect(image.naturalWidth, image.naturalHeight);
      const dimensions = classicTridentDimensions(radius);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        image,
        source.x,
        source.y,
        source.width,
        source.height,
        offsetX - dimensions.width / 2,
        offsetY - dimensions.height / 2,
        dimensions.width,
        dimensions.height,
      );
      ctx.restore();
      return true;
    }
    if (kind === "necromancer-arrow") {
      const image = this.classicPresentationSprites.get("necromancerArrows");
      if (!image?.naturalWidth || !image.naturalHeight) return false;
      // Use the first generated arrow cell for every minion shot. The old bow
      // remains the minion accessory; this projectile is the clean normal
      // arrow rather than the charge/impact variants.
      const frame = 0;
      // GPT's final sheet is vertically arranged despite the source prompt's
      // horizontal request: normal, magic, impact. Crop the complete normal
      // arrow row instead of taking a narrow third of it.
      const frameWidth = image.naturalWidth;
      const frameHeight = image.naturalHeight / 3;
      const source = {
        x: frame * frameWidth,
        y: 0,
        width: frameWidth,
        height: frameHeight,
      };
      const width = radius * 8 * CLASSIC_NECROMANCER_ARROW_RENDER_SCALE;
      const height = width * source.height / Math.max(1, source.width);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, source.x, source.y, source.width, source.height, -width / 2, -height / 2, width, height);
      ctx.restore();
      return true;
    }
    if (kind === "grappler-ammo") {
      const image = this.classicPresentationSprites.get("grapplerHook");
      if (!image?.naturalWidth || !image.naturalHeight) return false;
      const source = classicDedicatedWeaponSourceRect(image.naturalWidth, image.naturalHeight, "grappler-hook");
      const width = radius * 3.1 * 3;
      const height = radius * 3.1 * 3;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, source.x, source.y, source.width, source.height, -width / 2, -height / 2, width, height);
      ctx.restore();
      return true;
    }
    return false;
  }

  drawClassicAbsorbedOrbModel(ctx, sourceId, radius, time = 0) {
    const type = String(sourceId || "").toLowerCase();
    const def = CLASS_DEFS[type];
    if (!def) return false;
    const proxy = {
      id: `absorbed-${type}`,
      type,
      color: def.color,
      accent: def.accent,
      x: 0,
      y: 0,
      radius,
      health: 100,
      maxHealth: 100,
      alive: true,
      flash: 0,
      classicAbilityActiveUntil: time + 0.01,
      classicAbilityNextAt: Infinity,
      classicGunPhase: "ready",
      classicGunAimAngle: 0,
      classicAimAngle: 0,
      classicSummonPhase: "inactive",
      classicTeamIndex: null,
    };
    if (type === "hydrogen-bomb") this.drawClassicHydrogenBody(ctx, proxy, radius);
    else if (type === "virus") {
      const drawnVirus = this.drawClassicPresentationSprite(ctx, "virus", radius, {
        width: radius * 2.75,
        height: radius * 2.75,
      });
      if (!drawnVirus) {
        this.drawSimpleOrb(ctx, proxy, 0, 0, true, time);
        this.drawClassicVirusDesign(ctx, radius);
      }
    } else this.drawSimpleOrb(ctx, proxy, 0, 0, true, time);
    if (type !== "hydrogen-bomb" && type !== "virus") this.drawClassicOrbDetails(ctx, proxy, radius, time);
    return true;
  }

  drawClassicAbsorberAnimation(ctx, fighter, radius, time = 0) {
    const pulse = 0.76 + Math.sin(time * 4.8) * 0.06;
    ctx.save();
    ctx.strokeStyle = "#ffd1ed";
    ctx.lineWidth = Math.max(2, radius * 0.075);
    ctx.globalAlpha = 0.86;
    ctx.beginPath();
    ctx.arc(0, 0, radius * pulse, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = "#ff8bd4";
    ctx.lineWidth = Math.max(3, radius * 0.12);
    ctx.shadowColor = "#ff2aa6";
    ctx.shadowBlur = Math.max(5, radius * 0.26);
    for (let arc = 0; arc < 3; arc += 1) {
      const start = time * 0.35 + arc * TAU / 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius * (0.92 + arc * 0.1), start, start + Math.PI * 0.52);
      ctx.stroke();
    }
    ctx.shadowBlur = Math.max(4, radius * 0.18);
    ctx.fillStyle = "#fff1fa";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.13, 0, TAU);
    ctx.fill();
    ctx.restore();

    const sourceId = fighter?.classicAbsorbedOrbId || fighter?.classicAbsorbedAbility;
    const startedAt = Number(fighter?.classicAbsorptionStartedAt);
    const absorbingUntil = Number(fighter?.classicAbsorbingUntil);
    const activelyAbsorbing = sourceId
      && Number.isFinite(startedAt)
      && Number.isFinite(absorbingUntil)
      && time < absorbingUntil;
    if (activelyAbsorbing) {
      const duration = Math.max(0.001, absorbingUntil - startedAt);
      const progress = Math.max(0, Math.min(1, (time - startedAt) / duration));
      const sourceRadius = radius * (0.64 - progress * 0.12);
      const orbitAngle = time * -2.5 + (Number(fighter.classicAbsorptionSequence) || 0) * 0.7;
      const distance = radius * (2.35 - progress * 1.22);
      const modelX = Math.cos(orbitAngle) * distance;
      const modelY = Math.sin(orbitAngle) * distance;
      ctx.save();
      ctx.globalAlpha = 0.95 - progress * 0.2;
      ctx.strokeStyle = "#ff8bd4";
      ctx.lineWidth = Math.max(2, radius * 0.065);
      ctx.shadowColor = "#ff2aa6";
      ctx.shadowBlur = Math.max(6, radius * 0.22);
      ctx.beginPath();
      ctx.moveTo(modelX, modelY);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.translate(modelX, modelY);
      ctx.rotate(orbitAngle + Math.PI / 2);
      this.drawClassicAbsorbedOrbModel(ctx, sourceId, sourceRadius, time);
      ctx.restore();
    }

    // Absorber keeps every deterministic absorption in its history. Show the
    // full sequence as a compact HUD above the orb and color-code each badge so
    // viewers can see that the absorbed effects remain active rather than
    // disappearing after the incoming model animation.
    const history = Array.isArray(fighter?.classicAbsorptionHistory)
      ? fighter.classicAbsorptionHistory.filter(Boolean)
      : [];
    if (history.length > 0 || activelyAbsorbing) {
      const displayNameFor = (id) => String(CLASS_DEFS[String(id)]?.name || id)
        .replace(/[-_]+/g, " ")
        .toUpperCase();
      const currentLabel = activelyAbsorbing ? `ABSORBING ${displayNameFor(sourceId)}` : null;
      const historyLabel = history.length > 0
        ? `ABSORBED: ${history.map(displayNameFor).join(" · ")}`
        : null;
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 ${Math.max(9, Math.min(15, radius * 0.34))}px ${CLASSIC_NUMBER_FONT}`;
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(2, radius * 0.06);
      ctx.strokeStyle = "#130711";
      ctx.fillStyle = "#fff1fa";
      if (currentLabel) {
        ctx.strokeText(currentLabel, 0, -radius * 1.64);
        ctx.fillText(currentLabel, 0, -radius * 1.64);
      }
      if (historyLabel) {
        const maxWidth = radius * 6.2;
        const words = historyLabel.split(" ");
        const lines = [];
        let line = "";
        for (const word of words) {
          const candidate = line ? `${line} ${word}` : word;
          if (line && ctx.measureText(candidate).width > maxWidth) {
            lines.push(line);
            line = word;
          } else line = candidate;
        }
        if (line) lines.push(line);
        const lineHeight = Math.max(10, radius * 0.25);
        const baseY = currentLabel ? -radius * 1.4 : -radius * 1.58;
        for (const [index, text] of lines.entries()) {
          const y = baseY + index * lineHeight;
          ctx.strokeText(text, 0, y);
          ctx.fillText(text, 0, y);
        }
      }
      ctx.restore();
      for (const [index, absorbedId] of history.entries()) {
        const absorbedColor = classicVisualColorFor(String(absorbedId), "#ff8bd4");
        ctx.save();
        ctx.strokeStyle = absorbedColor;
        ctx.globalAlpha = 0.82;
        ctx.lineWidth = Math.max(2, radius * 0.055);
        const start = -Math.PI / 2 + index * 0.24;
        ctx.beginPath();
        ctx.arc(0, 0, radius * (1.18 + Math.min(index, 4) * 0.045), start, start + 0.17);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawClassicFrozenOverlay(ctx, fighter, radius, time = 0) {
    if (this.lastSim?.gameplayMode !== "classic") return false;
    const frozenUntil = Number(fighter?.classicFrostSlowUntil) || 0;
    if (fighter?.classicFrostFrozen !== true && time >= frozenUntil) return false;
    const slowFactor = Math.max(0.05, Math.min(1, Number(fighter?.classicFrostSlowFactor) || 0.5));
    const pulse = 0.98 + Math.sin(time * 8) * 0.025;
    ctx.save();
    // A low-opacity blue glaze makes the game-owned orb read as frozen while
    // leaving its generated/accessory design intact. The center is deliberately
    // transparent in the generated sheet, so the HP pass below stays clear.
    ctx.globalAlpha = 0.22 + (1 - slowFactor) * 0.15;
    ctx.fillStyle = "#62d7ff";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.99 * pulse, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#baf3ff";
    ctx.lineWidth = Math.max(3, radius * 0.075);
    ctx.globalAlpha = 0.78;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.08 * pulse, 0, TAU);
    ctx.stroke();
    ctx.lineWidth = Math.max(2, radius * 0.045);
    ctx.globalAlpha = 0.62;
    for (let index = 0; index < 12; index += 1) {
      const angle = index * TAU / 12 + time * 0.16;
      const inner = radius * 1.04;
      const outer = radius * (1.15 + (index % 2) * 0.05);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.restore();
    const frame = Math.floor(time * 8) % 4;
    const drawn = this.drawClassicSheetFrame(ctx, "frozenOrbOverlay", radius, {
      frameCount: 4,
      frame,
      width: radius * 2.82,
      height: radius * 2.82,
      alpha: 0.94,
    });
    ctx.save();
    ctx.globalAlpha = 0.86;
    ctx.strokeStyle = "#effcff";
    ctx.fillStyle = "#d7f8ff";
    ctx.lineWidth = Math.max(1.5, radius * 0.035);
    for (let index = 0; index < 9; index += 1) {
      const fall = (time * radius * 1.7 + index * radius * 0.73) % (radius * 2.65);
      const x = ((index * 37) % 17 - 8) * radius * 0.11 + Math.sin(time * 1.7 + index) * radius * 0.08;
      const y = -radius * 1.38 + fall;
      const size = Math.max(2, radius * (0.035 + (index % 3) * 0.012));
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
      if (index % 2 === 0) {
        ctx.beginPath();
        ctx.arc(x, y, size * 0.55, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
    return drawn;
  }

  drawClassicFrostTrailStreak(ctx, entity, owner, entityAngle = 0, age = 0, alpha = 1) {
    const ownerRadius = Math.max(12, Number(owner?.radius) || Number(entity?.radius) || 12);
    const deltaX = Number(owner?.x) - Number(entity?.x);
    const deltaY = Number(owner?.y) - Number(entity?.y);
    if (![deltaX, deltaY].every(Number.isFinite) || Math.hypot(deltaX, deltaY) < 0.5) return;
    // This is only the last-mile bridge from the newest authored stamp to the
    // moving Snowball. Older stamps are joined by drawClassicFrostTrailRibbon
    // in world space, so no procedural particles or disconnected dashes are
    // needed here.
    const localX = deltaX * Math.cos(entityAngle) + deltaY * Math.sin(entityAngle);
    const localY = -deltaX * Math.sin(entityAngle) + deltaY * Math.cos(entityAngle);
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "#72ddff";
    ctx.shadowBlur = Math.max(5, ownerRadius * 0.22);
    ctx.globalAlpha = alpha * 0.52;
    ctx.strokeStyle = "#55d8ff";
    ctx.lineWidth = Math.max(7, ownerRadius * 0.82);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(localX, localY);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.24;
    ctx.strokeStyle = "#dffaff";
    ctx.lineWidth = Math.max(3, ownerRadius * 0.34);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(localX * 0.96, localY * 0.96);
    ctx.stroke();
    ctx.restore();
  }

  drawClassicZeusLightningPath(ctx, fromX, fromY, toX, toY, time, seed = 0, width = 4, alpha = 1) {
    const points = classicZeusLightningPoints(fromX, fromY, toX, toY, time, seed, 6);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#72eaff";
    ctx.shadowColor = "#b9f8ff";
    ctx.shadowBlur = Math.max(7, width * 2.4);
    ctx.lineWidth = Math.max(2, width * 1.8);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#f4ffff";
    ctx.lineWidth = Math.max(1.2, width * 0.58);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.stroke();
    ctx.restore();
  }

  drawClassicZeusHandLightning(ctx, radius, targetAngle, time = 0) {
    const handX = Math.cos(targetAngle) * radius * 0.74;
    const handY = Math.sin(targetAngle) * radius * 0.74;
    const tipX = Math.cos(targetAngle) * radius * 1.48;
    const tipY = Math.sin(targetAngle) * radius * 1.48;
    ctx.save();
    ctx.fillStyle = "#eafcff";
    ctx.strokeStyle = "#114d67";
    ctx.lineWidth = Math.max(2, radius * 0.055);
    ctx.beginPath();
    ctx.arc(handX, handY, Math.max(4, radius * 0.16), 0, TAU);
    ctx.fill();
    ctx.stroke();
    this.drawClassicZeusLightningPath(ctx, handX, handY, tipX, tipY, time, 71, Math.max(2.5, radius * 0.075), 0.98);
    ctx.restore();
  }

  drawClassicZeusElectrifiedOverlay(ctx, fighter, radius, time = 0) {
    const pulse = classicZeusElectrifiedPulseFor(fighter, time);
    if (pulse <= 0) return false;
    ctx.save();
    ctx.globalAlpha = Math.min(0.88, 0.18 + pulse * 0.72);
    ctx.fillStyle = "#f7ffff";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.98, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.55 + pulse * 0.4;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(2, radius * 0.055);
    ctx.beginPath();
    ctx.arc(0, 0, radius * (1.03 + pulse * 0.08), 0, TAU);
    ctx.stroke();

    // A compact skeleton sits behind the normal centered HP text. It is
    // intentionally simple and high-contrast so the electricity reads at
    // small portrait sizes without becoming a second orb body.
    ctx.globalAlpha = 0.78 * pulse;
    ctx.strokeStyle = "#293640";
    ctx.fillStyle = "#d9f8ff";
    ctx.lineWidth = Math.max(1.5, radius * 0.045);
    ctx.beginPath();
    ctx.arc(0, -radius * 0.3, radius * 0.16, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.13);
    ctx.lineTo(0, radius * 0.48);
    ctx.moveTo(-radius * 0.38, radius * 0.02);
    ctx.quadraticCurveTo(0, radius * 0.22, radius * 0.38, radius * 0.02);
    ctx.moveTo(-radius * 0.31, radius * 0.2);
    ctx.quadraticCurveTo(0, radius * 0.42, radius * 0.31, radius * 0.2);
    ctx.moveTo(-radius * 0.23, radius * 0.48);
    ctx.lineTo(-radius * 0.36, radius * 0.76);
    ctx.moveTo(radius * 0.23, radius * 0.48);
    ctx.lineTo(radius * 0.36, radius * 0.76);
    ctx.stroke();
    ctx.fillStyle = "#293640";
    ctx.beginPath();
    ctx.arc(-radius * 0.055, -radius * 0.32, Math.max(1.5, radius * 0.035), 0, TAU);
    ctx.arc(radius * 0.055, -radius * 0.32, Math.max(1.5, radius * 0.035), 0, TAU);
    ctx.fill();

    ctx.globalAlpha = 0.55 + pulse * 0.45;
    ctx.strokeStyle = "#e8ffff";
    ctx.lineWidth = Math.max(2, radius * 0.045);
    ctx.lineCap = "round";
    for (let index = 0; index < 5; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const y = -radius * 0.76 + index * radius * 0.34;
      const startX = side * radius * 0.92;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + side * radius * 0.12, y + radius * 0.08);
      ctx.lineTo(startX - side * radius * 0.08, y + radius * 0.18);
      ctx.lineTo(startX + side * radius * 0.14, y + radius * 0.28);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  drawClassicMonsterOrbSkin(ctx, radius, time = 0) {
    ctx.save();
    // Monster remains a full plain orb; these two fins and the scale marks
    // are attached to its rim so the body/centered HP never becomes a person.
    ctx.fillStyle = "#315b3a";
    ctx.strokeStyle = "#07150c";
    ctx.lineWidth = Math.max(3, radius * 0.075);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * radius * 0.72, -radius * 0.2);
      ctx.lineTo(side * radius * 1.18, -radius * 0.56);
      ctx.lineTo(side * radius * 1.02, radius * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = "#5f8b4d";
    ctx.strokeStyle = "#203c26";
    ctx.lineWidth = Math.max(2, radius * 0.045);
    for (let row = -1; row <= 1; row += 1) {
      for (let column = -1; column <= 1; column += 1) {
        const scaleX = column * radius * 0.34 + Math.sin(time * 1.5 + row) * radius * 0.025;
        const scaleY = row * radius * 0.33 + radius * 0.08;
        ctx.beginPath();
        ctx.arc(scaleX, scaleY, radius * 0.15, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawClassicArtistDrawing(ctx, entity, radius, time = 0) {
    const progress = Math.max(0, Math.min(1, Number(entity?.drawingProgress) || 0));
    const pulse = 0.94 + Math.sin(time * 18) * 0.04;
    const lineColor = this.options.classicBlackTheme ? "#ffffff" : "#171717";
    ctx.save();
    ctx.globalAlpha *= 0.35 + progress * 0.65;
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = lineColor;
    ctx.lineWidth = Math.max(2, radius * 0.11);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // A monochrome rough ball of marks: this is the 1.5-second brush pass,
    // not a colored painting and not a replacement for the generated summon.
    ctx.beginPath();
    for (let point = 0; point <= 28; point += 1) {
      const angle = point / 28 * TAU;
      const wobble = 1 + Math.sin(point * 2.7 + time * 12) * 0.12;
      const px = Math.cos(angle) * radius * 1.02 * wobble * pulse;
      const py = Math.sin(angle) * radius * 0.82 * wobble * pulse;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    for (let line = 0; line < 3; line += 1) {
      ctx.beginPath();
      ctx.moveTo(-radius * (0.64 - line * 0.16), radius * (0.45 - line * 0.18));
      ctx.bezierCurveTo(
        -radius * 0.2,
        -radius * (0.1 + line * 0.1),
        radius * 0.24,
        radius * (0.7 - line * 0.12),
        radius * (0.67 - line * 0.13),
        -radius * (0.42 - line * 0.12),
      );
      ctx.stroke();
    }
    // Brush and bristles sit beside the marks without obscuring the orb HP.
    ctx.save();
    ctx.translate(radius * 1.2, -radius * 1.05);
    ctx.rotate(-0.62);
    ctx.fillStyle = lineColor;
    ctx.fillRect(-radius * 0.08, -radius * 0.82, radius * 0.16, radius * 1.1);
    ctx.strokeRect(-radius * 0.08, -radius * 0.82, radius * 0.16, radius * 1.1);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.2, radius * 0.3);
    ctx.lineTo(radius * 0.2, radius * 0.3);
    ctx.lineTo(0, radius * 0.66);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  drawClassicDedicatedWeapon(ctx, id, weaponKind, radius, targetAngle, {
    width = radius * 3.1,
    height = radius * 1.6,
    x = radius * 0.95,
    y = 0,
    angle = targetAngle,
  } = {}) {
    const image = this.classicPresentationSprites.get(id);
    if (!image?.naturalWidth || !image.naturalHeight) return false;
    const source = classicDedicatedWeaponSourceRect(image.naturalWidth, image.naturalHeight, weaponKind);
    return this.drawClassicPresentationSprite(ctx, id, radius, {
      sourceX: source.x,
      sourceY: source.y,
      sourceWidth: source.width,
      sourceHeight: source.height,
      width,
      height,
      x,
      y,
      angle,
    });
  }

  drawClassicSwordWeapon(ctx, fighter, radius, targetAngle, time = 0, {
    swingOffset = 0,
    draftmaster = false,
    active = false,
    attackMode = "swing",
    phase = "idle",
    extension = 0,
  } = {}) {
    const sprite = this.weaponSprites.get("sword")?.image;
    const angle = targetAngle + (Number(swingOffset) || 0);
    const source = sprite?.naturalWidth && sprite.naturalHeight
      ? classicSwordSourceRect(sprite.naturalWidth, sprite.naturalHeight)
      : null;
    const width = radius * (draftmaster ? 3.55 : 3.42);
    const height = source
      ? width * source.height / source.width
      : radius * 2.9;
    const pose = classicSwordHeldPose(radius, { attackMode, phase, extension });
    const mountDistance = pose.mountDistance;
    const spriteHiltX = source ? source.width * 0.78 : width * 0.78;
    const spriteHiltY = source ? source.height * 0.76 : height * 0.76;
    // The orb is already complete when this overlay runs. Start the handle at
    // the outer rim, then keep the grip and guard outside the body so the
    // sword reads as held like Trident instead of disappearing underneath it.
    ctx.save();
    ctx.rotate(angle);
    ctx.lineCap = "round";
    ctx.strokeStyle = "#2b1b17";
    ctx.lineWidth = Math.max(5, radius * 0.18);
    ctx.beginPath();
    ctx.moveTo(pose.handleStart, 0);
    ctx.lineTo(pose.handleEnd, 0);
    ctx.stroke();
    ctx.strokeStyle = "#b8793f";
    ctx.lineWidth = Math.max(2, radius * 0.08);
    ctx.beginPath();
    ctx.moveTo(pose.handleStart + radius * 0.04, 0);
    ctx.lineTo(pose.handleEnd - radius * 0.08, 0);
    ctx.stroke();
    ctx.strokeStyle = draftmaster ? "#b9d7ed" : "#e7c87d";
    ctx.lineWidth = Math.max(3, radius * 0.09);
    ctx.beginPath();
    ctx.moveTo(pose.guardDistance, -radius * 0.3);
    ctx.lineTo(pose.guardDistance, radius * 0.3);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(Math.cos(angle) * mountDistance, Math.sin(angle) * mountDistance);
    ctx.rotate(angle + Math.PI * 0.75);
    ctx.imageSmoothingEnabled = false;
    ctx.shadowColor = active ? "#ff6d58" : "#d7e8ff";
    ctx.shadowBlur = active ? Math.max(6, radius * 0.2) : Math.max(2, radius * 0.06);
    if (sprite?.naturalWidth && sprite.naturalHeight && source) {
      ctx.drawImage(
        sprite,
        source.x,
        source.y,
        source.width,
        source.height,
        -width * (spriteHiltX / source.width),
        -height * (spriteHiltY / source.height),
        width,
        height,
      );
    } else {
      // Keep a readable loading fallback without changing the normal generated
      // asset path once the dedicated sword sprite has loaded.
      this.drawProceduralWeapon(ctx, "sword", width * 0.82);
    }
    ctx.restore();
    // Redraw the guard after the sprite so it remains crisp at the visible
    // handoff point and never gets swallowed by the orb body.
    ctx.save();
    ctx.translate(Math.cos(angle) * pose.guardDistance, Math.sin(angle) * pose.guardDistance);
    ctx.rotate(angle);
    ctx.strokeStyle = draftmaster ? "#b9d7ed" : "#e7c87d";
    ctx.lineWidth = Math.max(3, radius * 0.09);
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.3);
    ctx.lineTo(0, radius * 0.3);
    ctx.stroke();
    ctx.restore();
    return Boolean(sprite?.naturalWidth && sprite.naturalHeight && source);
  }

  drawClassicSwordDeflectSlash(ctx, radius, angle, progress = 0, time = 0) {
    const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
    const sweep = -0.82 + clamped * 1.64;
    ctx.save();
    ctx.rotate(Number(angle) || 0);
    ctx.globalAlpha = 0.96 - clamped * 0.42;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffffff";
    ctx.shadowColor = "#a8edff";
    ctx.shadowBlur = Math.max(5, radius * 0.22);
    ctx.lineWidth = Math.max(4, radius * 0.14);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.42, -0.82 + sweep, 0.82 + sweep);
    ctx.stroke();
    ctx.strokeStyle = "#6cdeff";
    ctx.lineWidth = Math.max(2, radius * 0.055);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.58, -0.68 + sweep, 0.68 + sweep);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#dffaff";
    for (let index = 0; index < 5; index += 1) {
      const particleAngle = sweep + (index - 2) * 0.22;
      const distance = radius * (1.24 + index * 0.11);
      const wobble = Math.sin(time * 18 + index * 2.1) * radius * 0.04;
      ctx.beginPath();
      ctx.arc(Math.cos(particleAngle) * distance, Math.sin(particleAngle) * distance + wobble, Math.max(1.5, radius * 0.045), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawClassicHeldSwordOverlay(ctx, fighter, time = 0) {
    const opponent = this.classicOpponentFor(fighter);
    const targetAngle = opponent
      ? Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x)
      : Number(fighter.classicAimAngle) || 0;
    const radius = fighter.radius;
    ctx.save();
    ctx.translate(Math.round(fighter.x), Math.round(fighter.y));
    if (fighter.type === "sword") {
      const deflectUntil = Number(fighter.classicSwordDeflectUntil) || 0;
      const deflecting = time < deflectUntil;
      const deflectProgress = deflecting
        ? Math.max(0, Math.min(1, (time - (Number(fighter.classicSwordDeflectStartedAt) || 0)) / 0.34))
        : 0;
      const deflectAngle = Number.isFinite(Number(fighter.classicSwordDeflectAngle))
        ? Number(fighter.classicSwordDeflectAngle)
        : targetAngle;
      const phase = String(fighter.classicSwordPhase || "idle").toLowerCase();
      const attackMode = fighter.classicSwordAttackMode === "poke" ? "poke" : "swing";
      const elapsed = Math.max(0, time - (Number(fighter.classicSwordStartedAt) || 0));
      const overlay = classicSwordOverlayPose({
        phase,
        attackMode,
        elapsed,
        windup: 0.18,
        active: 0.18,
        followThrough: 0.22,
      });
      this.drawClassicSwordWeapon(ctx, fighter, radius, deflecting ? deflectAngle : targetAngle, time, {
        swingOffset: deflecting ? Math.sin(deflectProgress * Math.PI) * 0.9 : overlay.swingOffset,
        attackMode,
        phase,
        extension: overlay.extension,
        active: phase === "active" || deflecting,
      });
      if (deflecting) this.drawClassicSwordDeflectSlash(ctx, radius, deflectAngle, deflectProgress, time);
    } else if (fighter.type === "draftmaster") {
      this.drawClassicDraftmasterSword(ctx, fighter, radius, targetAngle, time);
    }
    ctx.restore();
  }

  drawClassicDraftmasterSword(ctx, fighter, radius, targetAngle, time = 0) {
    const swordPhase = String(fighter.classicDraftmasterSwordPhase || "idle").toLowerCase();
    const swordAttackMode = fighter.classicDraftmasterSwordAttackMode === "poke" ? "poke" : "swing";
    const deflectUntil = Number(fighter.classicSwordDeflectUntil) || 0;
    const deflecting = time < deflectUntil;
    const deflectProgress = deflecting
      ? Math.max(0, Math.min(1, (time - (Number(fighter.classicSwordDeflectStartedAt) || 0)) / 0.34))
      : 0;
    const swordAngle = deflecting && Number.isFinite(Number(fighter.classicSwordDeflectAngle))
      ? Number(fighter.classicSwordDeflectAngle)
      : Number.isFinite(Number(fighter.classicDraftmasterSwordAngle))
      ? Number(fighter.classicDraftmasterSwordAngle)
      : targetAngle;
    const startedAt = Number(fighter.classicDraftmasterSwordStartedAt);
    const swordElapsed = Number.isFinite(startedAt) ? Math.max(0, time - startedAt) : 0;
    const swordOverlay = classicSwordOverlayPose({
      phase: swordPhase,
      attackMode: swordAttackMode,
      elapsed: swordElapsed,
      windup: 0.18,
      active: 0.12,
      followThrough: 0.18,
    });
    this.drawClassicSwordWeapon(ctx, fighter, radius, swordAngle, time, {
      swingOffset: deflecting ? Math.sin(deflectProgress * Math.PI) * 0.9 : swordOverlay.swingOffset,
      attackMode: swordAttackMode,
      phase: swordPhase,
      extension: swordOverlay.extension,
      draftmaster: true,
      active: swordPhase === "active" || deflecting,
    });
    if (deflecting) this.drawClassicSwordDeflectSlash(ctx, radius, swordAngle, deflectProgress, time);
  }

  drawClassicGrapplerWeapon(ctx, fighter, radius, targetAngle, time = 0) {
    const interval = Number(CLASS_DEFS[fighter.type]?.classicAbility?.interval) || 3;
    const nextAt = Number(fighter.classicAbilityNextAt);
    const useCount = Number(fighter.classicAbilityUses) || 0;
    const shotAt = useCount > 0 && Number.isFinite(nextAt) ? nextAt - interval : -Infinity;
    const firing = time >= shotAt && time < shotAt + 0.18;
    const gunScale = CLASSIC_GUN_RENDER_SCALE;
    const recoil = firing ? -radius * 0.16 * gunScale : 0;
    const drawn = this.drawClassicDedicatedWeapon(ctx, "grapplerGun", "grappler", radius, targetAngle, {
      width: radius * 3.35 * gunScale,
      height: radius * 1.72 * gunScale,
      x: radius * 0.58 * gunScale + recoil,
      angle: targetAngle,
    });
    if (firing) {
      ctx.save();
      ctx.rotate(targetAngle);
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = "#fff2a6";
      ctx.strokeStyle = "#ad711a";
      ctx.lineWidth = Math.max(2, radius * 0.07);
      ctx.beginPath();
      ctx.arc(radius * 2.72 * gunScale + recoil, 0, radius * 0.28 * gunScale, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    return drawn;
  }

  drawClassicTurretWeapon(ctx, fighter, radius, targetAngle, time = 0) {
    const interval = Number(CLASS_DEFS[fighter.type]?.classicAbility?.interval) || 1;
    const nextAt = Number(fighter.classicAbilityNextAt);
    const useCount = Number(fighter.classicAbilityUses) || 0;
    const shotAt = useCount > 0 && Number.isFinite(nextAt) ? nextAt - interval : -Infinity;
    const firing = time >= shotAt && time < shotAt + 0.14;
    const gunScale = CLASSIC_GUN_RENDER_SCALE;
    const recoil = firing ? -radius * 0.12 * gunScale : 0;
    const drawn = this.drawClassicDedicatedWeapon(ctx, "turretCannon", "turret", radius, targetAngle, {
      width: radius * 3.1 * gunScale,
      height: radius * 1.85 * gunScale,
      x: -radius * CLASSIC_GUN_HANDLE_OVERLAP * gunScale + recoil,
      angle: targetAngle,
    });
    if (firing) {
      ctx.save();
      ctx.rotate(targetAngle);
      ctx.fillStyle = "#fff0a0";
      ctx.shadowColor = "#ff9f1c";
      ctx.shadowBlur = Math.max(4, radius * 0.22);
      ctx.beginPath();
      ctx.arc(radius * 2.62 * gunScale + recoil, 0, radius * 0.25 * gunScale, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    return drawn;
  }

  drawClassicDraftmasterWeapons(ctx, fighter, radius, targetAngle, time = 0, { drawSword = true } = {}) {
    const image = this.classicPresentationSprites.get(CLASSIC_DRAFTMASTER_GUN_ASSET);
    if (!image?.naturalWidth || !image.naturalHeight) return false;
    const gunSource = classicDraftmasterGunSourceRect(image.naturalWidth, image.naturalHeight, "pistol");
    const gunAngle = Number.isFinite(Number(fighter.classicDraftmasterGunAimAngle))
      ? Number(fighter.classicDraftmasterGunAimAngle)
      : targetAngle;
    const gunFiringUntil = Number(fighter.classicDraftmasterGunFiringUntil);
    const gunReloadUntil = Number(fighter.classicDraftmasterGunReloadUntil);
    const gunFiring = fighter.classicDraftmasterGunPhase === "firing"
      && (!Number.isFinite(gunFiringUntil) || time < gunFiringUntil);
    const gunReloading = fighter.classicDraftmasterGunPhase === "reload"
      || (Number.isFinite(gunFiringUntil) && Number.isFinite(gunReloadUntil) && time >= gunFiringUntil && time < gunReloadUntil);
    const gunScale = CLASSIC_GUN_RENDER_SCALE;
    const gunRecoil = gunFiring ? -radius * 0.14 * gunScale : 0;
    const reloadProgress = gunReloading && Number.isFinite(gunFiringUntil) && Number.isFinite(gunReloadUntil)
      ? Math.max(0, Math.min(1, (time - gunFiringUntil) / Math.max(0.001, gunReloadUntil - gunFiringUntil)))
      : 0;
    const reloadSpin = reloadProgress * Math.PI * 7;
    const gunWidth = radius * 3.0 * gunScale;
    const gunHeight = radius * 1.5 * gunScale;
    const gunMountX = -radius * CLASSIC_GUN_HANDLE_OVERLAP * gunScale + gunRecoil;
    const gunPasses = gunReloading ? 3 : 1;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (let pass = 0; pass < gunPasses; pass += 1) {
      const center = (gunPasses - 1) / 2;
      ctx.save();
      ctx.globalAlpha = gunReloading ? (pass === Math.floor(center) ? 0.72 : 0.24) : 1;
      ctx.rotate(gunAngle);
      ctx.translate(gunMountX + gunWidth / 2, 0);
      ctx.rotate(reloadSpin + (gunReloading ? (pass - center) * 0.16 : 0));
      ctx.shadowColor = gunFiring ? "#fff1a8" : gunReloading ? "#f4c430" : "#16191d";
      ctx.shadowBlur = gunFiring ? Math.max(7, radius * 0.28) : gunReloading ? Math.max(4, radius * 0.16) : 0;
      ctx.drawImage(image, gunSource.x, gunSource.y, gunSource.width, gunSource.height, -gunWidth / 2, -gunHeight / 2, gunWidth, gunHeight);
      ctx.restore();
    }
    if (gunFiring) {
      ctx.save();
      ctx.rotate(gunAngle);
      ctx.fillStyle = "#fff8c7";
      ctx.beginPath();
      ctx.arc(radius * 2.75 * gunScale + gunRecoil, 0, radius * 0.22 * gunScale, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    if (drawSword) this.drawClassicDraftmasterSword(ctx, fighter, radius, targetAngle, time);
    return true;
  }

  drawClassicVampireOverlay(ctx, fighter, radius, time = 0) {
    const opponent = this.classicOpponentFor(fighter);
    const latched = fighter.classicLatchPhase === "latched"
      && opponent
      && fighter.classicLatchTargetId === opponent.id
      && time < (fighter.classicLatchUntil || 0);
    const targetAngle = latched && Number.isFinite(Number(fighter.classicLatchAngle))
      ? Number(fighter.classicLatchAngle)
      : opponent
        ? Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x)
        : Number(fighter.classicAimAngle) || 0;
    const targetDistance = opponent
      ? Math.hypot(opponent.x - fighter.x, opponent.y - fighter.y)
      : radius * 1.6;
    const targetRadius = opponent?.radius || radius;
    const teethDistance = latched
      ? Math.max(radius * 1.02, targetDistance - targetRadius * 0.54)
      : radius * 1.02;
    ctx.save();
    ctx.globalAlpha = 1;
    // drawFighter restores its local transform before this overlay runs.
    // Re-anchor the accessory at the actual Vampire orb so fangs never land
    // at canvas origin when a latch is active.
    ctx.translate(Number(fighter.x) || 0, Number(fighter.y) || 0);
    // The latch state is represented by the simulation-owned drain/particles;
    // hide the approach teeth once they have made contact so the target is not
    // visually covered by a second set of fangs.
    if (latched) {
      ctx.restore();
      return;
    }
    ctx.rotate(targetAngle);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#050505";
    ctx.lineWidth = Math.max(2, radius * 0.08);
    if (latched) {
      ctx.strokeStyle = "#b51e35";
      ctx.lineWidth = Math.max(2, radius * 0.09);
      ctx.beginPath();
      ctx.moveTo(radius * 0.78, 0);
      ctx.lineTo(Math.max(radius * 0.98, teethDistance - radius * 0.08), 0);
      ctx.stroke();
    }
    for (const offset of [-0.32, 0.32]) {
      ctx.beginPath();
      const base = latched ? Math.max(radius * 0.94, teethDistance - radius * 0.28) : radius * 0.72;
      const tip = latched ? teethDistance + radius * 0.1 : radius * 1.38;
      const baseHalf = radius * (latched ? 0.2 : 0.17);
      // The broad edge belongs against the vampire orb; the single apex
      // points toward the target. This keeps the teeth facing the latch
      // direction instead of reading as two backward-facing wedges.
      ctx.moveTo(base, radius * offset - baseHalf);
      ctx.lineTo(base, radius * offset + baseHalf);
      ctx.lineTo(tip, radius * offset);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  drawClassicOrbDetails(ctx, fighter, radius, time = 0) {
    if (this.lastSim?.gameplayMode !== "classic") return;
    const opponent = this.classicOpponentFor(fighter);
    const liveTargetAngle = opponent
      ? Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x)
      : Number(fighter.classicAimAngle) || 0;
    const targetAngle = ["pistol", "shotgun", "rifle"].includes(fighter.type)
      && Number.isFinite(Number(fighter.classicGunAimAngle))
      ? Number(fighter.classicGunAimAngle)
      : liveTargetAngle;
    const active = time < (fighter.classicAbilityActiveUntil || 0);
    const pulse = 1 + Math.sin(time * 10 + (fighter.id?.length || 0)) * 0.08;

    if (fighter.type === "flash") {
      this.drawClassicPresentationSprite(ctx, "flash", radius, { width: radius * 1.45, height: radius * 1.45 });
      if (active) this.drawStatusRing(ctx, "#ffdf31", radius * 1.34, time * 18);
    } else if (fighter.type === "reactor") {
      const reactorCharge = Math.max(0, Math.min(1, Number(fighter.classicReactorCharge) || 0));
      ctx.strokeStyle = fighter.classicReactorColor || (active ? "#8ff5ff" : "#1677c8");
      ctx.lineWidth = Math.max(3, radius * 0.11);
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.globalAlpha = (0.85 - ring * 0.22) * (0.82 + reactorCharge * 0.18);
        ctx.beginPath();
        ctx.arc(0, 0, radius * (0.28 + ring * 0.2) * pulse, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (fighter.type === "sword") {
      // Rendered by drawClassicHeldSwordOverlay after all orb bodies. Keeping
      // this branch empty prevents a pre-orb copy from swallowing the hilt.
    } else if (fighter.type === "sniper") {
      ctx.save();
      ctx.rotate(targetAngle);
      const image = this.classicPresentationSprites.get("sniper");
      if (image?.naturalWidth && image.naturalHeight) {
        const source = classicSniperWeaponSourceRect(image.naturalWidth, image.naturalHeight, 0);
        // Orb Racer's Sniper uses a full 4.4r held weapon with the stock/grip
        // tucked into the orb and the barrel extending outward. Keep that
        // same pose here rather than the old narrow 2.2r strip, which made
        // the gun look detached and exposed its source matte as a box.
        const pose = classicSniperHeldPose(radius, source.width, source.height);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          image,
          source.x,
          source.y,
          source.width,
          source.height,
          pose.mountX,
          -pose.height * 0.5,
          pose.width,
          pose.height,
        );
      }
      ctx.restore();
    } else if (fighter.type === "draftmaster") {
      this.drawClassicDraftmasterWeapons(ctx, fighter, radius, targetAngle, time, { drawSword: false });
    } else if (fighter.type === "blue-sun") {
      const ability = CLASS_DEFS[fighter.type]?.classicAbility || {};
      const nextAt = Number(fighter.classicAbilityNextAt);
      const interval = Math.max(0.001, Number(ability.interval) || 4);
      const chargeStart = Number.isFinite(nextAt) ? nextAt - interval : time;
      const chargeProgress = Number.isFinite(nextAt)
        ? Math.max(0, Math.min(1, (time - chargeStart) / interval))
        : 0;
      const mix = (start, end, amount) => Math.round(start + (end - start) * amount);
      const red = mix(5, 10, chargeProgress);
      const green = mix(5, 89, chargeProgress);
      const blue = mix(5, 214, chargeProgress);
      ctx.save();
      ctx.globalAlpha = 0.34 + chargeProgress * 0.4;
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.84, 0, TAU);
      ctx.fill();
      // The eight simulation-owned blue-sun-laser entities draw the attacks.
      // The short corona tips show charge on the body.
      ctx.globalAlpha = 0.65 + chargeProgress * 0.35;
      pulseRing(ctx, 0, 0, radius * 0.88, "#6edbff", radius * 0.055);
      ctx.rotate(this.options.reducedMotion ? 0 : time * 0.45);
      for (let tip = 0; tip < 6; tip += 1) {
        ctx.rotate(TAU / 6);
        wdcPolygon(ctx, [[radius * 0.86, -radius * 0.16], [radius * (1.03 + chargeProgress * 0.16), 0],
          [radius * 0.86, radius * 0.16]], tip % 3 ? "#46bdfd" : "#bceeff");
      }
      ctx.restore();
    } else if (fighter.type === "black-hole") {
      ctx.save();
      const tilt = -0.48 + (this.options.reducedMotion ? 0 : Math.sin(time * 1.9) * 0.19);
      wdcDisc(ctx, 0, 0, radius * 0.70, "#0a0710", "#7942c1", radius * 0.058);
      ctx.strokeStyle = "#bb8bff";
      ctx.lineWidth = radius * 0.095;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.03, radius * 0.57, tilt, 0.12, 2.68);
      ctx.stroke();
      ctx.strokeStyle = "#6946a4";
      ctx.lineWidth = radius * 0.056;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.03, radius * 0.57, tilt, 3.12, 6.02);
      ctx.stroke();
      ctx.restore();
      if (active) this.drawStatusRing(ctx, "#9f73ff", radius * 1.45 * pulse, -time * 12);
    } else if (fighter.type === "hydrogen-bomb") {
      // The radiation symbol is the fighter body and is drawn before this
      // detail pass so the centered Classic HP label stays on top.
    } else if (fighter.type === "necromancer") {
      const summonPhase = String(fighter.classicSummonPhase || "ready").toLowerCase();
      const summonActive = active || !["ready", "inactive", "idle", "cooldown"].includes(summonPhase);
      const summonStartedAt = Number(fighter.classicSummonStartedAt) || time;
      let frame = 0;
      if (summonPhase.includes("glow") || summonPhase.includes("burst") || summonPhase.includes("summon")) frame = 2;
      else if (summonPhase.includes("lift") || summonPhase.includes("raise")) frame = 1;
      else if (summonActive) frame = [0, 1, 2, 1][Math.floor(Math.max(0, time - summonStartedAt) * 8) % 4];
      const activeSkull = this.lastSim?.classicEntities?.some((entity) => (
        entity.kind === "necromancer-skull" && entity.ownerId === fighter.id
        && (entity.expiresAt === null || Number(entity.expiresAt) > time)
      ));
      if (!activeSkull) {
        this.drawClassicSheetFrame(ctx, "necromancer", radius, {
          frameCount: 3,
          frame: 0,
          width: radius * 5.8,
          height: radius * 5.8,
          x: radius * 0.98,
          y: -radius * 1.02,
        });
      }
    } else if (fighter.type === "poison") {
      ctx.fillStyle = "#1d3b1c";
      ctx.beginPath();
      ctx.arc(0, radius * 0.16, radius * 0.34, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.62);
      ctx.lineTo(-radius * 0.31, radius * 0.06);
      ctx.lineTo(radius * 0.31, radius * 0.06);
      ctx.closePath();
      ctx.fill();
    } else if (fighter.type === "parasites") {
      this.drawClassicParasiteDesign(ctx, radius, { includeBody: true });
    } else if (fighter.type === "spikey") {
      const spikes = 8;
      ctx.fillStyle = this.options.classicBlackTheme ? "#ffffff" : CLASS_DEFS.spikey?.accent || "#ffffff";
      ctx.strokeStyle = "#050505";
      ctx.lineWidth = Math.max(2, radius * 0.055);
      for (let index = 0; index < spikes; index += 1) {
        const angle = index * TAU / spikes;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(radius * 0.91, -radius * 0.14);
        ctx.lineTo(radius * 1.28, 0);
        ctx.lineTo(radius * 0.91, radius * 0.14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    } else if (fighter.type === "virus") {
      // The dedicated GPT-generated body is rendered by drawFighter before
      // this detail pass so the full silhouette, not the old procedural body,
      // is the Virus design. Keep this branch as a no-op for absorbed-model
      // callers that use the same detail dispatcher in older snapshots.
    } else if (fighter.type === "shrapnel") {
      this.drawClassicPresentationSprite(ctx, "shrapnel", radius, { width: radius * 1.68, height: radius * 1.68 });
    } else if (fighter.type === "cobwebs") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      for (let ring = 1; ring <= 3; ring += 1) {
        ctx.beginPath();
        ctx.arc(0, 0, radius * ring / 4, 0, TAU);
        ctx.stroke();
      }
      for (let spoke = 0; spoke < 8; spoke += 1) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(spoke * TAU / 8) * radius * 0.76, Math.sin(spoke * TAU / 8) * radius * 0.76);
        ctx.stroke();
      }
    } else if (fighter.type === "apple") {
      // Apple is a plain Classic orb; the generated apple is reserved for
      // the periodic thrown projectile.
    } else if (fighter.type === "absorber") {
      this.drawClassicAbsorberAnimation(ctx, fighter, radius, time);
    } else if (fighter.type === "batman") {
      // Batman's complete generated orb body is drawn by drawFighter. Keep
      // this detail branch empty so the legacy symbol cannot be stacked over
      // the mask/belt or interfere with centered HP.
      ctx.save();
      ctx.strokeStyle = "#171116";
      ctx.lineWidth = Math.max(2, radius * 0.055);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-radius * 0.18, radius * 0.34);
      ctx.quadraticCurveTo(radius * 0.06, radius * 0.46, radius * 0.25, radius * 0.32);
      ctx.stroke();
      ctx.restore();
    } else if (fighter.type === "ying-yang") {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.7, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      ctx.fillStyle = "#050505";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.7, Math.PI / 2, Math.PI * 1.5);
      ctx.fill();
      for (const [cy, fill] of [[-radius * 0.34, "#050505"], [radius * 0.34, "#ffffff"]]) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(0, cy, radius * 0.34, 0, TAU);
        ctx.fill();
      }
    } else if (fighter.type === "trapper") {
      const image = this.classicPresentationSprites.get("trapper");
      if (image) {
        ctx.drawImage(image, 0, 0, image.naturalWidth / 2, image.naturalHeight, -radius * 1.05, -radius * 1.5, radius * 2.1, radius * 1.4);
        ctx.save();
        ctx.rotate(targetAngle);
        const cigar = classicTrapperCigarSourceRect(image.naturalWidth, image.naturalHeight);
        const cigarWidth = radius * 1.8;
        const cigarHeight = cigarWidth * cigar.height / Math.max(1, cigar.width);
        ctx.imageSmoothingEnabled = false;
        // The authored atlas has the glowing ember on the source's left end.
        // Mirror the cropped cigar in Cowboy's target-facing local frame so
        // that ember points away from the orb instead of into its mouth.
        ctx.scale(-1, 1);
        ctx.drawImage(
          image,
          cigar.x,
          cigar.y,
          cigar.width,
          cigar.height,
          -radius * 0.22 - cigarWidth,
          radius * 0.12 - cigarHeight * 0.5,
          cigarWidth,
          cigarHeight,
        );
        ctx.restore();
      }
    } else if (fighter.type === "zeus") {
      this.drawClassicCrown(ctx, radius * 0.72);
      this.drawClassicZeusHandLightning(ctx, radius, targetAngle, time);
    } else if (fighter.type === "glass-ball") {
      ctx.strokeStyle = "#d9fbff";
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(-radius * 0.18, -radius * 0.18, radius * 0.47, Math.PI * 1.1, Math.PI * 1.72);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (["pistol", "shotgun", "rifle"].includes(fighter.type)) {
      if (!this.drawClassicGunOverlay(ctx, fighter, radius, targetAngle, time)) {
        ctx.save();
        ctx.rotate(targetAngle);
        ctx.fillStyle = "#24272c";
        ctx.strokeStyle = "#9ba1aa";
        ctx.lineWidth = 3;
        const gunScale = CLASSIC_GUN_ORB_RENDER_SCALE;
        const length = fighter.type === "pistol" ? 1.45 : fighter.type === "shotgun" ? 2 : 2.25;
        ctx.fillRect(radius * 0.28 * gunScale, -radius * 0.14 * gunScale, radius * length * gunScale, radius * 0.28 * gunScale);
        ctx.strokeRect(radius * 0.28 * gunScale, -radius * 0.14 * gunScale, radius * length * gunScale, radius * 0.28 * gunScale);
        ctx.restore();
      }
    } else if (fighter.type === "trident") {
      // The thrown entity is rendered separately in drawClassicEntities. Do
      // not leave a second trident in the fighter's hands while it is
      // outbound, stuck, or returning.
      if (!this.tridentThrowIsActive(fighter, time)) {
        if (!this.drawClassicTridentWeapon(ctx, radius, targetAngle)) {
          ctx.save();
          ctx.rotate(targetAngle);
          ctx.fillStyle = "#66e8e8";
          ctx.strokeStyle = "#efffff";
          ctx.lineWidth = 3;
          ctx.fillRect(radius * 0.28, -radius * 0.14, radius * 2.25, radius * 0.28);
          ctx.strokeRect(radius * 0.28, -radius * 0.14, radius * 2.25, radius * 0.28);
          ctx.restore();
        }
      }
    } else if (fighter.type === "grappler") {
      if (!this.drawClassicGrapplerWeapon(ctx, fighter, radius, targetAngle, time)) {
        ctx.save();
        ctx.rotate(targetAngle);
        ctx.fillStyle = "#24272c";
        ctx.strokeStyle = "#9ba1aa";
        ctx.lineWidth = 3;
        ctx.fillRect(radius * 0.28, -radius * 0.14, radius * 2.25, radius * 0.28);
        ctx.strokeRect(radius * 0.28, -radius * 0.14, radius * 2.25, radius * 0.28);
        ctx.restore();
      }
    } else if (fighter.type === "sawball") {
      const image = this.classicPresentationSprites.get("sawball");
      if (image) {
        const configuredDiscs = Array.isArray(fighter.classicSawballDiscs)
          ? fighter.classicSawballDiscs.filter((disc) => Number.isFinite(Number(disc?.x)) && Number.isFinite(Number(disc?.y)))
          : [];
        const discs = configuredDiscs.length >= 2
          ? configuredDiscs.slice(0, 2)
          : [-1, 1].map((side, index) => ({
            index,
            x: fighter.x + side * radius * 2.6,
            y: fighter.y,
            radius: radius * 1.6,
            angle: time * 5 + (index === 0 ? 0 : Math.PI),
          }));
        for (const disc of discs) {
          const localX = Number(disc.x) - Number(fighter.x || 0);
          const localY = Number(disc.y) - Number(fighter.y || 0);
          const discRadius = Math.max(radius * 1.6, Number(disc.radius) || 0);
          ctx.save();
          // Gameplay publishes world-space disc centers at 2.6r with a
          // 1.6r radius. Convert back into this fighter-local transform so
          // the generated 3.2r blade exactly follows its hitbox.
          ctx.translate(localX, localY);
          const discAngle = Number.isFinite(Number(disc.angle))
            ? Number(disc.angle)
            : Math.atan2(localY, localX) + time * 5;
          // The mirrored placement and opposite phase keep the pair turning
          // against one another without changing the Gameplay geometry.
          const spinDirection = Number(disc.index) === 1 ? -1 : 1;
          ctx.rotate(discAngle + time * 0.8 * spinDirection);
          const bladeSize = Math.max(radius * 3.2, discRadius * 2);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(image, -bladeSize / 2, -bladeSize / 2, bladeSize, bladeSize);
          ctx.restore();
        }
      }
    } else if (fighter.type === "boxer" || fighter.type === "monster") {
      const monster = fighter.type === "monster";
      const punchPhase = String(fighter.classicPunchPhase || "idle").toLowerCase();
      const punchActive = active || ["retract", "extend", "windup", "extended", "impact", "recover", "punching"].includes(punchPhase);
      const punchStartedAt = Number(fighter.classicPunchStartedAt) || time;
      let frame = 0;
      if (punchPhase.includes("impact")) frame = 2;
      else if (punchPhase.includes("extend") || punchPhase.includes("follow")) frame = 1;
      else if (punchActive) frame = [0, 1, 2, 1][Math.floor(Math.max(0, time - punchStartedAt) * 12) % 4];
      else frame = 0;
      if (this.options.classicBlackTheme) drawClassicFoundryPunchWindup(ctx, fighter, radius, time, monster);
      this.drawClassicBoxerSmoke(ctx, fighter, radius, time);
      const punchAngle = punchActive && Number.isFinite(Number(fighter.classicPunchAngle))
        ? Number(fighter.classicPunchAngle)
        : targetAngle;
      if (monster && this.options.classicBlackTheme && fighter.classicPunchGloves?.length) {
        drawClassicFoundryMonsterGloves(ctx, fighter, punchAngle);
      } else {
        this.drawClassicBoxerGloves(ctx, fighter, radius, punchAngle, frame, time, monster);
      }
    } else if (fighter.type === "fairy" && this.options.classicBlackTheme) {
      drawClassicFoundryFairy(ctx, fighter, radius, targetAngle, time, this.options.reducedMotion);
    } else if (fighter.type === "fairy") {
      this.drawClassicPresentationSprite(ctx, "artistFairy", radius, { width: radius * 1.5, height: radius * 1.5 });
      const accessories = this.classicPresentationSprites.get("fairyAccessories");
      const fairyWandAngle = Number.isFinite(Number(fighter.classicFairyCastAngle))
        ? Number(fighter.classicFairyCastAngle)
        : targetAngle;
      if (accessories?.naturalWidth && accessories.naturalHeight) {
        const moving = Math.hypot(Number(fighter.vx) || 0, Number(fighter.vy) || 0) > 18;
        // The v2 sheet has six independent wing cells: three left-wing poses
        // followed by three right-wing poses. Use the two upright poses for
        // the flap cycle; the authored low pose makes the wing appear to fall
        // below the orb instead of flapping in place.
        const wingFrame = moving ? Math.floor(time * 8) % 2 : 0;
        for (const [side, frameOffset] of [[-1, 0], [1, 3]]) {
          const crop = classicFairyAccessoryCropFor(frameOffset + wingFrame);
          const wingWidth = radius * 2.25;
          this.drawClassicPresentationSprite(ctx, "fairyAccessories", radius, {
            sourceX: crop.x,
            sourceY: crop.y,
            sourceWidth: crop.width,
            sourceHeight: crop.height,
            width: wingWidth,
            height: wingWidth * crop.height / crop.width,
            x: side * radius * 1.16,
            y: -radius * 0.03,
            angle: side * 0.04,
            alpha: 0.98,
          });
        }
        const tiaraCrop = classicFairyAccessoryCropFor(6);
        const tiaraWidth = radius * 2.2;
        this.drawClassicPresentationSprite(ctx, "fairyAccessories", radius, {
          sourceX: tiaraCrop.x,
          sourceY: tiaraCrop.y,
          sourceWidth: tiaraCrop.width,
          sourceHeight: tiaraCrop.height,
          width: tiaraWidth,
          height: tiaraWidth * tiaraCrop.height / tiaraCrop.width,
          x: 0,
          y: -radius * 1.26,
          alpha: 1,
        });
        const wandCrop = classicFairyAccessoryCropFor(7);
        const wandWidth = radius * 1.02;
        this.drawClassicPresentationSprite(ctx, "fairyAccessories", radius, {
          sourceX: wandCrop.x,
          sourceY: wandCrop.y,
          sourceWidth: wandCrop.width,
          sourceHeight: wandCrop.height,
          width: wandWidth,
          height: wandWidth * wandCrop.height / wandCrop.width,
          x: Math.cos(fairyWandAngle) * radius * 1.06,
          y: Math.sin(fairyWandAngle) * radius * 1.06,
          angle: fairyWandAngle - Math.PI * 0.5,
          alpha: 1,
        });
      }
      // Fairy rings stay centered on the orb and touch its outer rim. Draw
      // true circles rather than stretched ellipses so their authored shape
      // remains stable at every fighter size.
      ctx.save();
      ctx.globalAlpha = 0.48 + Math.sin(time * 7) * 0.08;
      ctx.strokeStyle = "#e9b8ff";
      ctx.shadowColor = "#b66cff";
      ctx.shadowBlur = Math.max(4, radius * 0.16);
      ctx.lineWidth = Math.max(2, radius * 0.055);
      for (let ring = 0; ring < 2; ring += 1) {
        ctx.setLineDash([radius * 0.18, radius * (0.2 + ring * 0.08)]);
        ctx.lineDashOffset = ring * radius * 0.22 - time * radius * (ring ? 0.8 : 0.55);
        ctx.beginPath();
        ctx.arc(0, 0, radius * (1.08 + ring * 0.16), 0, TAU);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      if (time < (fighter.classicAbilityActiveUntil || 0)) {
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = "#fff2b8";
        ctx.beginPath();
        ctx.arc(Math.cos(fairyWandAngle) * radius * 1.12, Math.sin(fairyWandAngle) * radius * 1.12, radius * 0.3, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    } else if (fighter.type === "commander") {
      this.drawClassicPresentationSprite(ctx, "commander", radius, { width: radius * 1.72, height: radius * 1.72 });
    }
  }

  drawClassicHealthText(ctx, fighter, radius) {
    if (this.lastSim?.gameplayMode !== "classic" || fighter.countryId) return;
    const health = Math.max(0, Math.ceil(Number(fighter.health) || 0));
    const digitCount = String(health).length;
    const fontSize = Math.max(radius * 0.54, Math.min(radius * 0.88, radius * 2.1 / digitCount));
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.shadowBlur = 0;
    ctx.font = `900 ${fontSize}px ${CLASSIC_NUMBER_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(3, radius * 0.12);
    ctx.strokeStyle = "#050505";
    ctx.fillStyle = "#ffffff";
    ctx.strokeText(String(health), 0, 1);
    ctx.fillText(String(health), 0, 1);
    const maxHealth = Number(fighter.maxHealth);
    if (this.options.duelHealthBars && !fighter.classicIsDuplicate && health > 0 && maxHealth > 0 && fighter.health < maxHealth) {
      const width = radius * 1.4;
      const height = Math.max(3, radius * 0.095);
      const y = radius * 1.25;
      ctx.fillStyle = this.options.classicBlackTheme ? "#3c414a" : "#ded9d1";
      ctx.fillRect(-width / 2, y, width, height);
      ctx.fillStyle = classicVisualColorFor(fighter.type, "#e0c68c");
      ctx.fillRect(-width / 2, y, width * Math.max(0, fighter.health / maxHealth), height);
    }
    ctx.restore();
  }

  drawClassicEntityHealthText(ctx, entity, radius) {
    if (this.lastSim?.gameplayMode !== "classic") return;
    const health = Math.max(0, Math.ceil(Number(entity.health) || 0));
    const digitCount = String(health).length;
    const fontSize = Math.max(radius * 0.62, Math.min(radius * 1.02, radius * 2.1 / digitCount));
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.shadowBlur = 0;
    ctx.font = `900 ${fontSize}px ${CLASSIC_NUMBER_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(2, radius * 0.14);
    ctx.strokeStyle = "#050505";
    ctx.fillStyle = "#ffffff";
    ctx.strokeText(String(health), 0, 1);
    ctx.fillText(String(health), 0, 1);
    ctx.restore();
  }

  drawFighter(ctx, fighter, time) {
    const def = CLASS_DEFS[fighter.type];
    const country = WORLD_CUP_COUNTRIES[fighter.countryId];
    if (fighter.classicWdcReserve || fighter.classicCannonOutside) return;
    if (this.lastSim?.gameplayMode === "classic" && fighter.type === "john-rod") {
      if (fighter.alive) drawClassicJohnRod(ctx, fighter, time, this.options.classicBlackTheme);
      return;
    }
    if (!fighter.alive) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.filter = "grayscale(1)";
      if (this.lastSim?.gameplayMode === "classic" && fighter.type === "batman") {
        const drawnDeadBatman = this.drawClassicPresentationSprite(ctx, "batmanOrb", fighter.radius, {
          x: fighter.x,
          y: fighter.y,
          width: fighter.radius * 2.5,
          height: fighter.radius * 2.5,
          alpha: 1,
        });
        if (!drawnDeadBatman) this.drawSimpleOrb(ctx, fighter, fighter.x, fighter.y, false, time);
      } else if (this.options.simpleOrbs || this.lastSim?.gameplayMode === "classic") this.drawSimpleOrb(ctx, fighter, fighter.x, fighter.y, false, time);
      else this.drawOrbSprite(ctx, fighter);
      ctx.restore();
      return;
    }

    ctx.save();
    if (this.lastSim?.gameplayMode === "classic") ctx.translate(fighter.x, fighter.y);
    else ctx.translate(Math.round(fighter.x), Math.round(fighter.y));

    if (!this.options.flatOrbs) {
      ctx.shadowColor = country?.accent || (this.lastSim?.gameplayMode === "classic"
        ? classicVisualColorFor(fighter.type, def.color)
        : def.color);
      ctx.shadowBlur = time < fighter.weaponBoostUntil || time < fighter.aegisRushUntil ? 24 : 14;
    }
    const sprite = this.orbSprites.get(fighter.type);
    const hydrogenBody = this.lastSim?.gameplayMode === "classic" && fighter.type === "hydrogen-bomb";
    const virusBody = this.lastSim?.gameplayMode === "classic" && fighter.type === "virus";
    const batmanBody = this.lastSim?.gameplayMode === "classic" && fighter.type === "batman";
    if (hydrogenBody) {
      // Hydrogen Bomb owns its complete body asset, like Orb Racer. Do not
      // put a generic colored orb underneath the radiation symbol.
      this.drawClassicHydrogenBody(ctx, fighter, fighter.radius);
    } else if (virusBody) {
      // Virus owns the complete generated orb silhouette. Do not stack a
      // second simple orb underneath it: the generated body itself is the
      // orb, while HP remains a centered game-drawn overlay.
      const drawnVirus = this.drawClassicPresentationSprite(ctx, "virus", fighter.radius, {
        width: fighter.radius * 2.75,
        height: fighter.radius * 2.75,
      });
      if (!drawnVirus) {
        this.drawSimpleOrb(ctx, fighter, 0, 0, true, time);
        this.drawClassicVirusDesign(ctx, fighter.radius);
      }
    } else if (batmanBody) {
      // Batman's generated circular orb is the body itself. HP is rendered
      // later by drawClassicHealthText so it stays centered and readable.
      const drawnBatman = this.drawClassicPresentationSprite(ctx, "batmanOrb", fighter.radius, {
        width: fighter.radius * 2.65,
        height: fighter.radius * 2.65,
      });
      if (drawnBatman) {
        // The generated body has a dark pixel edge for the mask silhouette;
        // the Classic orb still needs the bright team-readable outline used
        // by the rest of the roster, especially on the black theme.
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(3, fighter.radius * 0.085);
        ctx.beginPath();
        ctx.arc(0, 0, fighter.radius * 1.045, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      if (!drawnBatman) {
        this.drawClassicPresentationSprite(ctx, "batmanEars", fighter.radius, {
          width: fighter.radius * 2.2,
          height: fighter.radius * 2.2,
          y: -fighter.radius * 0.82,
          alpha: 1,
        });
        this.drawSimpleOrb(ctx, fighter, 0, 0, true, time);
      }
    } else if (this.lastSim?.gameplayMode === "classic" && CLASSIC_ACTION_BODIES.has(fighter.type)) {
      drawClassicActionBody(ctx, fighter, time, this.options);
    } else if (this.lastSim?.gameplayMode === "classic" && this.options.classicBlackTheme && CLASSIC_BODY_COLORS[fighter.type]) {
      this.drawSimpleOrb(ctx, fighter, 0, 0, true, time);
      drawClassicFoundryBody(ctx, fighter, time, this.options.reducedMotion);
    } else if (this.lastSim?.gameplayMode === "classic" && fighter.type === "frost-ball") {
      // Use the shared rolling shell on both the Avalanche and archived Frost art.
      const drawnSnowball = this.drawClassicPresentationSprite(ctx, "snowballOrb", fighter.radius, {
        width: fighter.radius * 2.42,
        height: fighter.radius * 2.42,
        angle: time * 2.35,
      });
      if (!drawnSnowball) this.drawSimpleOrb(ctx, fighter, 0, 0, true, time);
    } else if (this.options.simpleOrbs || this.lastSim?.gameplayMode === "classic") {
      this.drawSimpleOrb(ctx, fighter, 0, 0, true, time);
    } else if (sprite) {
      const drawSize = fighter.radius * 3.35;
      ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    } else {
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(0, 0, fighter.radius, 0, TAU);
      ctx.fill();
    }
    if (!fighter.countryId && !virusBody) {
      this.drawClassicOrbDetails(ctx, fighter, fighter.radius, time);
    }
    if (!fighter.countryId && fighter.type === "aegis") this.drawGeneratedHelmet(ctx, fighter.radius);
    if (!fighter.countryId && fighter.type === "shade") this.drawGeneratedGear(ctx, "shade", fighter.radius, {
      widthScale: 2.55,
      topOffset: -1.42,
    });
    if (fighter.type === "duplicator" && !fighter.classicIsDuplicate) {
      this.drawClassicCrown(ctx, fighter.radius);
    }
    if (this.lastSim?.gameplayMode === "classic") {
      this.drawClassicFrozenOverlay(ctx, fighter, fighter.radius, time);
      this.drawClassicZeusElectrifiedOverlay(ctx, fighter, fighter.radius, time);
    }
    ctx.shadowBlur = 0;

    if (fighter.flash > 0 && !this.options.flashReduction && this.lastSim?.gameplayMode !== "classic") {
      ctx.globalAlpha = Math.min(0.8, fighter.flash * 6);
      if (this.options.flatOrbs) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, fighter.radius + 5, 0, TAU);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, fighter.radius + 2, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    if (fighter.lastStand) {
      ctx.strokeStyle = def.accent;
      ctx.lineWidth = Math.max(4, fighter.radius * 0.12);
      ctx.globalAlpha = 0.6 + Math.sin(time * 13) * 0.22;
      ctx.beginPath();
      ctx.arc(0, 0, fighter.radius + 10 + Math.sin(time * 9) * 3, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (time < fighter.weaponBoostUntil) {
      ctx.strokeStyle = def.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, fighter.radius + 12 + Math.sin(time * 14) * 3, 0, TAU);
      ctx.stroke();
    }

    if (time < fighter.burnUntil) this.drawStatusRing(ctx, "#ff5b2b", fighter.radius + 8, time * 7);
    if (time < fighter.slowUntil) this.drawStatusRing(ctx, "#55dfff", fighter.radius + 11, -time * 4);
    if (time < fighter.poisonUntil) this.drawStatusRing(ctx, "#72ff5b", fighter.radius + 14, time * 5);
    if (time < fighter.gravityUntil) this.drawStatusRing(ctx, "#d24bff", fighter.radius + 17, -time * 6);
    if (time < fighter.speedBoostUntil) this.drawStatusRing(ctx, "#45f4c7", fighter.radius + 20, time * 9);
    if (time < fighter.stunUntil && time >= fighter.gravityUntil) {
      this.drawStatusRing(ctx, "#67b7ff", fighter.radius + 23, -time * 12);
    }
    if (time < fighter.aegisRushUntil) {
      ctx.globalAlpha = 0.35 + Math.sin(time * 15) * 0.12;
      ctx.fillStyle = "#f2fbff";
      ctx.beginPath();
      ctx.arc(0, 0, fighter.radius + 7, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      this.drawStatusRing(ctx, "#f2fbff", fighter.radius + 26, time * 14);
    }
    if (time < fighter.mirageDecoyUntil) this.drawStatusRing(ctx, CLASS_DEFS.mirage.accent, fighter.radius + 22, time * 10);
    if (time < fighter.shadePhaseUntil) {
      ctx.globalAlpha = 0.32;
      ctx.fillStyle = "#050505";
      ctx.beginPath();
      ctx.arc(0, 0, fighter.radius + 9, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      this.drawStatusRing(ctx, CLASS_DEFS.shade.accent, fighter.radius + 24, -time * 10);
    }
    if ((fighter.staticCharge || 0) >= 80) this.drawStatusRing(ctx, CLASS_DEFS.static.accent, fighter.radius + 27, time * 16);
    if ((fighter.forgeHeat || 0) >= 80) this.drawStatusRing(ctx, CLASS_DEFS.forge.accent, fighter.radius + 30, -time * 9);
    if (time < fighter.echoReadyUntil) this.drawStatusRing(ctx, CLASS_DEFS.echo.accent, fighter.radius + 21, time * 8);
    if (fighter.countryId && (fighter.worldCupDamageStacks || 0) > 0) {
      this.drawStatusRing(ctx, "#ff453a", fighter.radius + 12, time * 13);
    }
    if (fighter.countryId && (fighter.shinGuardStacks || 0) > 0) {
      const stackOffset = Math.min(8, (fighter.shinGuardStacks - 1) * 2);
      this.drawStatusRing(ctx, "#69efff", fighter.radius + 18 + stackOffset, -time * 7);
    }
    if (fighter.countryId && time < fighter.invulnerableUntil) {
      ctx.globalAlpha = 0.24 + Math.sin(time * 12) * 0.06;
      ctx.fillStyle = "#64eaff";
      ctx.beginPath();
      ctx.arc(0, 0, fighter.radius + 8, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      this.drawStatusRing(ctx, "#c8fbff", fighter.radius + 28, -time * 11);
    }
    if (this.lastSim?.hill?.controllerId === fighter.id && fighter.hillFortifyTime > 0) {
      const charge = Math.min(1, fighter.hillFortifyTime / 0.35);
      ctx.strokeStyle = fighter.hillAccent || "#fde68a";
      ctx.lineWidth = Math.max(4, fighter.radius * 0.12);
      ctx.beginPath();
      ctx.arc(0, 0, fighter.radius + 12, -Math.PI / 2, -Math.PI / 2 + TAU * charge);
      ctx.stroke();
    }

    if (fighter.type === "one-punch-man" && this.lastSim?.gameplayMode === "classic") {
      drawClassicOnePunchMan(ctx, fighter, time, this.options.reducedMotion);
    }
    this.drawClassicHealthText(ctx, fighter, fighter.radius);

    ctx.restore();
  }

  drawSimpleOrb(ctx, fighter, x = 0, y = 0, translated = false, time = 0) {
    const def = CLASS_DEFS[fighter.type];
    const country = WORLD_CUP_COUNTRIES[fighter.countryId];
    ctx.save();
    if (!translated) ctx.translate(Math.round(x), Math.round(y));
    const radius = fighter.radius;
    const flatOrb = this.options.flatOrbs || this.lastSim?.gameplayMode === "classic";
    if (flatOrb) {
      if (country) {
        const flag = this.countryFlags.get(country.id);
        const flagRadius = radius * 0.76;
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, flagRadius, 0, TAU);
        ctx.clip();
        if (flag) {
          const diameter = flagRadius * 2;
          const scale = Math.max(diameter / flag.naturalWidth, diameter / flag.naturalHeight);
          const width = flag.naturalWidth * scale;
          const height = flag.naturalHeight * scale;
          ctx.drawImage(flag, -width / 2, -height / 2, width, height);
        } else {
          ctx.fillStyle = country.color;
          ctx.fillRect(-flagRadius, -flagRadius, flagRadius * 2, flagRadius * 2);
        }
        ctx.restore();
        ctx.restore();
        return;
      }
      ctx.fillStyle = "#050505";
      ctx.beginPath();
      ctx.arc(0, 0, radius + Math.max(4, radius * 0.095), 0, TAU);
      ctx.fill();
      const flashColor = fighter.flash > 0 && !this.options.flashReduction && this.lastSim?.gameplayMode !== "classic"
        ? fighter.flashKind === "critical" ? "#ff2f2f" : "#ffffff"
        : null;
      const classicImpactFlash = this.lastSim?.gameplayMode === "classic"
        && time < (fighter.classicHitFlashUntil || 0);
      const classicZeusElectroPulse = this.lastSim?.gameplayMode === "classic"
        ? classicZeusElectrifiedPulseFor(fighter, time)
        : 0;
      const classicOrbColor = this.lastSim?.gameplayMode === "classic"
        ? fighter.type === "boxer"
          ? "#e51b23"
          : fighter.type === "absorber"
            ? "#f026c8"
            : fighter.type === "artist"
              ? "#f97316"
              : fighter.type === "reactor"
                ? fighter.classicReactorColor || "#168cff"
          : classicVisualColorFor(fighter.type, def.color)
        : null;
      ctx.fillStyle = classicImpactFlash
        ? "#f7f0e5"
        : flashColor || classicOrbColor || fighter.hillColor || country?.color || def.color;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.fill();
      if (classicOrbColor && this.options.classicBlackTheme) {
        const ink = classicBlackInkFor(classicOrbColor);
        if (ink !== classicOrbColor.toLowerCase()) pulseRing(ctx, 0, 0, radius * .99, ink + "bf", radius * .043);
      }
      if (classicZeusElectroPulse > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.9, classicZeusElectroPulse * 0.82);
        ctx.fillStyle = "#f7ffff";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.995, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      if (this.lastSim?.gameplayMode === "classic" && this.options.classicTeamColors !== false && Number.isInteger(fighter.classicTeamIndex)) {
        // The black silhouette stays underneath the orb theme, while this
        // outer ring is the stable team identity: vivid royal blue for Team
        // 1 and saturated red for Team 2. It is intentionally outside the
        // orb's theme outline so blue-themed abilities remain distinguishable.
        ctx.strokeStyle = classicTeamOutlineColorFor(fighter.classicTeamIndex);
        ctx.lineWidth = Math.max(3, radius * 0.1);
        ctx.beginPath();
        ctx.arc(0, 0, radius + Math.max(5, radius * 0.13), 0, TAU);
        ctx.stroke();
      }
      if (fighter.alive && fighter.health > 0 && fighter.health <= fighter.maxHealth * 0.25) {
        ctx.strokeStyle = "#ff3c3c";
        ctx.lineWidth = Math.max(4, radius * 0.12);
        ctx.globalAlpha = 0.78 + Math.sin(time * 14) * 0.18;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 5, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (this.lastSim?.gameplayMode === "classic") {
        ctx.restore();
        return;
      }
      ctx.fillStyle = "#050505";
      ctx.strokeStyle = "#050505";
      ctx.lineWidth = Math.max(1.25, radius * 0.035);
      ctx.font = `900 ${Math.max(20, radius * 1.08)}px ${
        this.lastSim?.gameplayMode === "classic" ? CLASSIC_NUMBER_FONT : PIXEL_FONT
      }`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = this.options.orbHealthNumbers
        ? String(Math.max(0, Math.ceil(fighter.health)))
        : fighter.hillSymbol || SOCIAL_ORB_MARKS[fighter.type] || "OF";
      if (!this.options.orbHealthNumbers) ctx.strokeText(label, 0, 1);
      ctx.fillText(label, 0, 1);
      ctx.restore();
      return;
    }
    const shade = ctx.createRadialGradient(-radius * 0.35, -radius * 0.4, radius * 0.08, 0, 0, radius);
    shade.addColorStop(0, def.accent);
    shade.addColorStop(0.45, def.color);
    shade.addColorStop(1, "#111722");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = def.accent;
    ctx.lineWidth = Math.max(0.75, radius * 0.025);
    ctx.stroke();
    ctx.fillStyle = "#fffaf0";
    ctx.font = `bold ${Math.max(10, radius * 0.58)}px ${PIXEL_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(SOCIAL_ORB_MARKS[fighter.type] || "OF", 0, 1);
    ctx.restore();
  }

  drawGeneratedHelmet(ctx, radius) {
    this.drawGeneratedGear(ctx, "aegis", radius, { widthScale: 2.65, topOffset: -1.45 });
  }

  drawGeneratedGear(ctx, type, radius, { widthScale = 2.65, topOffset = -1.45 } = {}) {
    const sprite = this.gearSprites.get(type);
    if (!sprite?.image) return;
    const width = radius * widthScale;
    const height = width * (sprite.image.naturalHeight / sprite.image.naturalWidth);
    ctx.drawImage(sprite.image, -width / 2, radius * topOffset, width, height);
  }

  drawStatusRing(ctx, color, radius, phase) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.stroke();
  }

  drawOrbSprite(ctx, fighter) {
    const sprite = this.orbSprites.get(fighter.type);
    if (!sprite) return;
    const drawSize = fighter.radius * 3.35;
    ctx.drawImage(
      sprite,
      Math.round(fighter.x - drawSize / 2),
      Math.round(fighter.y - drawSize / 2),
      drawSize,
      drawSize,
    );
  }

  drawProjectile(ctx, projectile) {
    ctx.save();
    if (["crossbow-arrow", "potion-flask", "bow-arrow", "potion-bottle"].includes(projectile.kind)) {
      const isArrow = ["crossbow-arrow", "bow-arrow"].includes(projectile.kind);
      const rangedColor = isArrow ? "#d44d59" : "#e1496c";
      const rangedAccent = isArrow ? "#fff2dc" : "#ffd5df";
      if (!isArrow) {
        for (let index = projectile.trail.length - 1; index >= 0; index -= 1) {
          const point = projectile.trail[index];
          ctx.globalAlpha = Math.max(0, point.life / 0.2) * 0.5;
          ctx.fillStyle = rangedAccent;
          const size = Math.max(2, 8 - index * 0.5);
          ctx.fillRect(Math.round(point.x - size / 2), Math.round(point.y - size / 2), size, size);
        }
      }
      ctx.globalAlpha = 1;
      ctx.translate(Math.round(projectile.x), Math.round(projectile.y));
      ctx.rotate(Math.atan2(projectile.vy, projectile.vx));
      if (isArrow) {
        const arrow = this.effectSprites.get("bowArrow")?.image;
        if (arrow) {
          const width = 112;
          const height = width * (arrow.naturalHeight / Math.max(1, arrow.naturalWidth));
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(arrow, -width / 2, -height / 2, width, height);
        } else {
          ctx.fillStyle = "#11100e";
          ctx.fillRect(-20, -4, 40, 8);
          ctx.fillStyle = rangedAccent;
          ctx.fillRect(8, -7, 13, 14);
        }
      } else {
        const potion = this.weaponSprites.get("potion")?.image;
        if (potion) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(potion, -16, -16, 32, 32);
        } else {
          ctx.fillStyle = "#11100e";
          ctx.fillRect(-7, -8, 14, 16);
          ctx.fillStyle = rangedColor;
          ctx.fillRect(-5, -6, 10, 12);
          ctx.fillStyle = rangedAccent;
          ctx.fillRect(-4, -10, 8, 4);
        }
      }
      ctx.restore();
      return;
    }
    if (!this.options.pixelWeapons) {
      ctx.shadowColor = "#67b7ff";
      ctx.shadowBlur = 14;
    }
    for (let index = projectile.trail.length - 1; index >= 0; index -= 1) {
      const point = projectile.trail[index];
      ctx.globalAlpha = Math.max(0, point.life / 0.2) * 0.55;
      ctx.fillStyle = index % 2 ? "#67b7ff" : "#ffca3a";
      const size = Math.max(2, 7 - index * 0.45);
      ctx.fillRect(Math.round(point.x - size / 2), Math.round(point.y - size / 2), size, size);
    }
    ctx.globalAlpha = 1;
    ctx.translate(Math.round(projectile.x), Math.round(projectile.y));
    ctx.rotate(Math.atan2(projectile.vy, projectile.vx));
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-8, -2, 16, 4);
    ctx.fillStyle = "#67b7ff";
    ctx.fillRect(-5, -6, 7, 12);
    ctx.fillStyle = "#ffca3a";
    ctx.fillRect(2, -3, 9, 6);
    ctx.restore();
  }

  drawWorldCupProjectile(ctx, projectile) {
    ctx.save();
    const def = WORLD_CUP_PICKUPS[projectile.kind];
    for (let index = projectile.trail.length - 1; index >= 0; index -= 1) {
      const point = projectile.trail[index];
      ctx.globalAlpha = Math.max(0, point.life / 0.22) * 0.55;
      ctx.fillStyle = index % 2 ? def?.color || "#67efff" : "#fff4cf";
      const size = Math.max(2, 8 - index);
      ctx.fillRect(Math.round(point.x - size / 2), Math.round(point.y - size / 2), size, size);
    }
    ctx.globalAlpha = 1;
    const sprite = this.worldCupSprites.get(projectile.kind);
    const size = projectile.radius * (projectile.kind === "soccer-ball" ? 3.2 : 3.7);
    ctx.translate(Math.round(projectile.x), Math.round(projectile.y));
    if (projectile.kind !== "soccer-ball") ctx.rotate(Math.atan2(projectile.vy, projectile.vx));
    ctx.shadowColor = def?.color || "#fff4cf";
    ctx.shadowBlur = projectile.kind === "soccer-ball" ? 8 : 15;
    if (sprite) ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    else {
      ctx.fillStyle = def?.color || "#fff4cf";
      ctx.beginPath();
      ctx.arc(0, 0, projectile.radius, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawWeapon(ctx, fighter, time) {
    if (fighter.countryId || fighter.type === "aegis" || fighter.type === "shade" || fighter.weapon?.length <= 0) return;
    if (this.lastSim?.gameplayMode === "classic" && CLASSIC_DEDICATED_WEAPON_TYPES.has(fighter.type)) return;
    const segment = getWeaponSegment(fighter, time);
    const classicSword = this.lastSim?.gameplayMode === "classic" && fighter.type === "sword";
    const opponent = classicSword ? this.classicOpponentFor(fighter) : null;
    const angle = classicSword
      ? (Number.isFinite(Number(fighter.classicAimAngle))
        ? Number(fighter.classicAimAngle)
        : opponent ? Math.atan2(opponent.y - fighter.y, opponent.x - fighter.x) : 0)
      : classicWeaponRenderAngle(fighter, time);
    const length = segment.visualLength
      ?? Math.hypot(segment.x2 - segment.x1, segment.y2 - segment.y1);

    ctx.save();
    ctx.translate(Math.round(fighter.x), Math.round(fighter.y));
    this.drawWeaponAt(ctx, fighter, length, angle, 1);
    ctx.restore();
  }

  drawWeaponAt(ctx, fighter, length, angle, alpha) {
    const def = CLASS_DEFS[fighter.type];
    const thicknessScale = Math.max(1, fighter.weapon.width / def.weapon.width);
    const profile = PIXEL_WEAPON_PROFILES[fighter.type];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.rotate(angle);
    ctx.translate(Math.max(0, fighter.radius + (fighter.weapon.orbitRadiusOffset ?? -2)), 0);
    ctx.rotate(fighter.weapon.spriteAngleOffset ?? 0);
    if (!profile) ctx.scale(1, thicknessScale);
    this.drawGeneratedWeapon(ctx, fighter.type, length);
    ctx.restore();
  }

  drawGeneratedWeapon(ctx, type, length) {
    const sprite = this.weaponSprites.get(type);
    if (!sprite?.image) {
      this.drawProceduralWeapon(ctx, type, length);
      return;
    }
    const width = length * (CLASS_DEFS[type]?.weapon?.renderScale || 1);
    const height = width * (sprite.image.naturalHeight / sprite.image.naturalWidth);
    ctx.shadowColor = "#050505";
    ctx.shadowBlur = 2.5;
    ctx.drawImage(
      sprite.image,
      -width * sprite.anchorX,
      -height * sprite.anchorY,
      width,
      height,
    );
    ctx.shadowBlur = 0;
  }

  drawProceduralWeapon(ctx, type, length) {
    const def = CLASS_DEFS[type] || CLASS_DEFS.fire;
    ctx.fillStyle = "#211d1a";
    ctx.fillRect(0, -5, length, 10);
    ctx.fillStyle = def.color;
    ctx.fillRect(5, -3, Math.max(10, length - 17), 6);
    ctx.fillStyle = def.accent;
    if (type === "forge") {
      ctx.fillRect(length - 22, -14, 22, 28);
    } else if (type === "static") {
      ctx.fillRect(length - 26, -10, 8, 20);
      ctx.fillRect(length - 12, -10, 8, 20);
    } else if (type === "echo") {
      ctx.fillRect(length - 25, -7, 22, 14);
      ctx.strokeStyle = def.accent;
      ctx.strokeRect(length - 32, -12, 24, 24);
    } else if (type === "shade") {
      ctx.fillRect(length - 24, -4, 22, 8);
    } else {
      ctx.fillRect(length - 24, -9, 22, 18);
    }
  }

  drawHeatDrops(ctx, drops, time) {
    const sprite = this.effectSprites.get("forgeHeatDrop");
    for (const drop of drops) {
      ctx.save();
      const pulse = 1 + Math.sin(time * 8 + drop.x * 0.01) * 0.16;
      ctx.translate(Math.round(drop.x), Math.round(drop.y));
      ctx.scale(pulse, pulse);
      if (sprite?.image) {
        const size = 34;
        ctx.drawImage(sprite.image, -size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = "#211d1a";
        ctx.fillRect(-11, -11, 22, 22);
        ctx.fillStyle = "#e04f2f";
        ctx.fillRect(-8, -8, 16, 16);
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(-4, -12, 8, 24);
        ctx.fillRect(-12, -4, 24, 8);
      }
      ctx.restore();
    }
  }

  drawWorldCupPickups(ctx, pickups, time) {
    for (const pickup of pickups) {
      if (pickup.collected) continue;
      const def = WORLD_CUP_PICKUPS[pickup.type];
      const sprite = this.worldCupSprites.get(pickup.type);
      const pulse = 1 + Math.sin(time * 7 + pickup.x * 0.017) * 0.08;
      const homingBall = pickup.type === "soccer-ball";
      ctx.save();
      ctx.translate(Math.round(pickup.x), Math.round(pickup.y));
      ctx.globalAlpha = (homingBall ? 0.34 : 0.2) + Math.sin(time * 8) * 0.04;
      ctx.fillStyle = homingBall ? "#63efff" : def?.color || "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, pickup.radius + (homingBall ? 20 : 13) + Math.sin(time * 5) * 3, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (homingBall) {
        ctx.strokeStyle = "#fff4cf";
        ctx.lineWidth = 3;
        for (let ring = 0; ring < 2; ring += 1) {
          ctx.globalAlpha = 0.86 - ring * 0.28;
          ctx.beginPath();
          ctx.arc(0, 0, pickup.radius + 10 + ring * 10 + Math.sin(time * 6 + ring) * 3, 0, TAU);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff4cf";
        for (let spark = 0; spark < 8; spark += 1) {
          const angle = spark * TAU / 8 + time * 1.8;
          const distance = pickup.radius + 30 + (spark % 2) * 5;
          ctx.fillRect(Math.cos(angle) * distance - 3, Math.sin(angle) * distance - 3, 6, 6);
        }
      }
      ctx.scale(pulse, pulse);
      if (sprite) ctx.drawImage(sprite, -32, -32, 64, 64);
      else {
        ctx.fillStyle = def?.color || "#ffffff";
        ctx.fillRect(-15, -15, 30, 30);
      }
      ctx.restore();
    }
  }

  drawWorldCupPendingItems(ctx, pendingItems, fighters, time) {
    for (const item of pendingItems) {
      const fighter = fighters.find((candidate) => candidate.id === item.ownerId && candidate.alive);
      if (!fighter) continue;
      const duration = Math.max(0.001, item.activatesAt - item.pickedUpAt);
      const progress = Math.max(0, Math.min(1, (time - item.pickedUpAt) / duration));
      const angle = item.orbitAngle + progress * TAU * 2;
      const orbitRadius = fighter.radius + 30;
      const x = fighter.x + Math.cos(angle) * orbitRadius;
      const y = fighter.y + Math.sin(angle) * orbitRadius;
      const sprite = this.worldCupSprites.get(item.type);
      const def = WORLD_CUP_PICKUPS[item.type];
      const size = item.type === "soccer-ball" ? 46 : 42;
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));
      ctx.rotate(angle + Math.PI / 2);
      ctx.shadowColor = def?.color || "#ffffff";
      ctx.shadowBlur = 12;
      if (sprite) ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
      else {
        ctx.fillStyle = def?.color || "#ffffff";
        ctx.fillRect(-size / 3, -size / 3, size * 2 / 3, size * 2 / 3);
      }
      ctx.restore();
    }
  }

  drawDecoys(ctx, decoys, time) {
    const sprite = this.effectSprites.get("mirageDecoy");
    for (const decoy of decoys) {
      const def = CLASS_DEFS[decoy.type] || CLASS_DEFS.mirage;
      ctx.save();
      ctx.globalAlpha = Math.max(0.18, Math.min(0.48, decoy.life / decoy.maxLife * 0.48));
      ctx.translate(Math.round(decoy.x), Math.round(decoy.y));
      if (sprite?.image) {
        const size = decoy.radius * 2.35;
        ctx.drawImage(sprite.image, -size / 2, -size / 2, size, size);
      } else {
        ctx.strokeStyle = def.accent;
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 5]);
        ctx.lineDashOffset = -time * 18;
        ctx.beginPath();
        ctx.arc(0, 0, decoy.radius, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = def.color;
        ctx.beginPath();
        ctx.arc(0, 0, decoy.radius * 0.82, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawEffect(ctx, effect) {
    if (["classic-signature", "classic-action-burst", "classic-saber-scar", "classic-saber-burn", "classic-wall-debris", "classic-power-impact"].includes(effect.kind)) return;
    if (effect.kind === "classic-pulse-burst") {
      const life = effect.life - (this.options.classicResultAge || 0);
      if (life > 0 && !classicPulseIsWide(effect.style)) drawClassicPulseBurst(ctx, { ...effect, life }, this.options);
      return;
    }
    if (!shouldRenderHitEffect(this.lastSim?.gameplayMode, effect.kind)) return;
    const progress = 1 - effect.life / effect.maxLife;
    ctx.save();
    ctx.globalAlpha = Math.max(0, effect.life / effect.maxLife);
    if (effect.kind === "world-cup-pickup") {
      const radius = 18 + progress * 42;
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = Math.max(2, 6 * (1 - progress));
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius, 0, TAU);
      ctx.stroke();
      for (let index = 0; index < 8; index += 1) {
        const angle = index * TAU / 8;
        const distance = 15 + progress * 44;
        ctx.fillStyle = effect.color;
        ctx.fillRect(effect.x + Math.cos(angle) * distance - 3, effect.y + Math.sin(angle) * distance - 3, 6, 6);
      }
      if (effect.label) {
        const textY = Math.max(18, effect.y - 16 - progress * 10);
        ctx.save();
        ctx.globalAlpha *= Math.max(0, 1 - progress * 0.9);
        ctx.fillStyle = "#c6ec98";
        ctx.strokeStyle = "#0f2418";
        ctx.lineWidth = 4;
        ctx.font = `900 15px ${PIXEL_FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(effect.label, effect.x, textY);
        ctx.fillText(effect.label, effect.x, textY);
        ctx.restore();
      }
    } else if (effect.kind === "world-cup-ball-hit") {
      this.drawImpactSignature(ctx, { ...effect, impactKind: "critical" }, progress);
    } else if (effect.kind === "world-cup-card-hit") {
      this.drawImpactSignature(ctx, { ...effect, impactKind: "critical" }, progress);
    } else if (effect.kind === "ability-particles") {
      this.drawAbilityParticles(ctx, effect);
    } else if (effect.kind === "arcane-burst") {
      const wandX = Number.isFinite(effect.wandX) ? effect.wandX : effect.x;
      const wandY = Number.isFinite(effect.wandY) ? effect.wandY : effect.y;
      const angle = Number.isFinite(effect.angle) ? effect.angle : 0;
      const reach = effect.radius * Math.min(1, progress * 1.15);
      ctx.strokeStyle = "#fff4ff";
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 8 * (1 - progress) + 2;
      ctx.beginPath();
      ctx.moveTo(wandX, wandY);
      ctx.lineTo(wandX + Math.cos(angle) * reach, wandY + Math.sin(angle) * reach);
      ctx.stroke();
      ctx.fillStyle = effect.color;
      for (let spark = 0; spark < 7; spark += 1) {
        const spread = (spark - 3) * 0.18;
        const distance = 16 + spark * 8 + progress * 24;
        const x = wandX + Math.cos(angle + spread) * distance;
        const y = wandY + Math.sin(angle + spread) * distance;
        ctx.fillRect(Math.round(x - 3), Math.round(y - 3), 6, 6);
      }
      ctx.strokeStyle = effect.color;
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 12 * (1 - progress) + 2;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * progress, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha *= 0.45;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * Math.min(1, progress * 1.25), 0, TAU);
      ctx.stroke();
    } else if (effect.kind === "time-stop" || effect.kind === "time-release") {
      ctx.strokeStyle = "#65a2ff";
      ctx.lineWidth = 3;
      for (let i = 1; i <= 3; i += 1) {
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, progress * 70 * i, 0, TAU);
        ctx.stroke();
      }
    } else if (effect.kind === "classic-destruction-burst") {
      // Destruction is a filled-circle burst, matching Orb Race layer breaks.
      // The simulation supplies the destroyed orb/minion's colors so the
      // burst remains readable in both Classic themes without a generic ring.
      this.drawClassicCircularImpactBurst(ctx, {
        x: effect.x,
        y: effect.y,
        radius: effect.radius,
        age: progress * CLASSIC_DESTRUCTION_BURST_DURATION,
        duration: CLASSIC_DESTRUCTION_BURST_DURATION,
        particleCount: CLASSIC_DESTRUCTION_BURST_PARTICLES,
        spreadScale: 1.5,
        particleScale: 1.1,
        seed: effect.entityId || effect.fighterType || "classic-destruction",
        surface: "orb",
        palette: [effect.color, effect.secondaryColor].filter(Boolean),
      });
    } else if (effect.kind === "knockout") {
      this.drawImpactSignature(ctx, { ...effect, impactKind: "critical" }, progress);
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, progress * 90, 0, TAU);
      ctx.stroke();
    } else if (effect.kind === "weapon-hit" || effect.kind === "collision-hit") {
      this.drawImpactSignature(ctx, effect, progress);
    } else if (effect.kind === "ranged-hit" || effect.kind === "potion-aoe-hit") {
      this.drawImpactSignature(ctx, { ...effect, impactKind: "regular" }, progress);
    } else if (effect.kind === "potion-aoe") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = Math.max(2, 6 * (1 - progress));
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * (0.3 + progress * 0.7), 0, TAU);
      ctx.stroke();
    } else if (effect.kind === "weapon-clash") {
      this.drawImpactSignature(ctx, effect, progress);
      ctx.strokeStyle = effect.color || "#f2fbff";
      ctx.shadowColor = effect.secondaryColor || effect.color || "#f2fbff";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      const spark = 12 + progress * 28;
      ctx.save();
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.angle || 0);
      ctx.beginPath();
      ctx.moveTo(-spark, 0);
      ctx.lineTo(spark, 0);
      ctx.moveTo(0, -spark * 0.55);
      ctx.lineTo(0, spark * 0.55);
      ctx.stroke();
      ctx.restore();
    } else if (["arcane-burst-hit", "hailstorm-hit", "ember", "poison"].includes(effect.kind)) {
      this.drawImpactSignature(ctx, { ...effect, impactKind: "regular" }, progress);
    } else if (effect.kind === "volta-bolt-hit") {
      this.drawImpactSignature(ctx, effect, progress);
    } else if (effect.kind === "volta-bolt-bounce" || effect.kind === "volta-charge-release") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 10 + progress * 34, 0, TAU);
      ctx.stroke();
    } else if (["echo-replay", "static-zap", "mirage-decoy-hit", "forge-heat-pickup"].includes(effect.kind)) {
      const spriteKey = effect.kind === "echo-replay"
        ? "echoReplay"
        : effect.kind === "static-zap"
          ? "staticZap"
          : effect.kind === "mirage-decoy-hit"
            ? "mirageDecoy"
            : "forgeHeatDrop";
      this.drawGeneratedEffect(ctx, spriteKey, effect, progress, effect.kind === "forge-heat-pickup" ? 36 : 62);
    } else if (["mirage-decoy", "echo-queued", "static-charge", "shade-phase", "last-stand"].includes(effect.kind)) {
      ctx.strokeStyle = effect.color;
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 12 + progress * (effect.kind === "last-stand" ? 70 : 42), 0, TAU);
      ctx.stroke();
    } else if (effect.kind === "gravity-lock") {
      ctx.strokeStyle = effect.color;
      ctx.shadowColor = effect.color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = Math.max(2, 8 * (1 - progress));
      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(effect.targetX, effect.targetY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(effect.targetX, effect.targetY, 12 + progress * 34, 0, TAU);
      ctx.stroke();
    } else if (effect.kind === "aegis-rush") {
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = effect.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(effect.x - 48, effect.y - 48, 96, 96);
      for (let side = -1; side <= 1; side += 2) {
        const offset = 26 + progress * 34;
        ctx.fillRect(effect.x + side * offset - 4, effect.y - 24, 8, 16);
        ctx.fillRect(effect.x + side * (offset + 10) - 4, effect.y + 8, 8, 16);
      }
    } else if (effect.kind === "invulnerable-block") {
      this.drawImpactSignature(ctx, { ...effect, impactKind: "collision" }, progress);
    } else {
      ctx.fillStyle = effect.color || "#ffffff";
      const size = 6 + progress * 20;
      ctx.fillRect(effect.x - size / 2, effect.y - 2, size, 4);
      ctx.fillRect(effect.x - 2, effect.y - size / 2, 4, size);
    }
    ctx.restore();
  }

  drawImpactSignature(ctx, effect, progress) {
    const key = impactSpriteKeyForEffect(effect);
    if (!key) return;
    const sprite = this.effectSprites.get(key);
    if (!sprite?.image) return;
    const baseSize = key === "impactCritical" ? 92 : key === "impactCollision" ? 78 : 60;
    const size = baseSize + progress * (key === "impactCritical" ? 24 : 18);
    const width = size;
    const height = width * (sprite.image.naturalHeight / sprite.image.naturalWidth);
    ctx.save();
    ctx.globalAlpha *= Math.max(0, 1 - progress * 0.65);
    ctx.translate(effect.x, effect.y);
    ctx.rotate(effect.angle || 0);
    ctx.drawImage(sprite.image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }

  drawGeneratedEffect(ctx, key, effect, progress, baseSize) {
    const sprite = this.effectSprites.get(key);
    if (!sprite?.image) return;
    const width = baseSize + progress * baseSize * 0.22;
    const height = width * (sprite.image.naturalHeight / sprite.image.naturalWidth);
    ctx.save();
    ctx.globalAlpha *= Math.max(0, 1 - progress * 0.5);
    ctx.translate(effect.x, effect.y);
    ctx.rotate(effect.angle || 0);
    ctx.drawImage(sprite.image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }

  drawAbilityParticles(ctx, effect) {
    ctx.shadowColor = effect.color;
    ctx.shadowBlur = 8;
    for (const particle of effect.particles) {
      if (particle.life <= 0) continue;
      const alpha = Math.max(0, particle.life / particle.maxLife);
      const size = Math.max(1, Math.round(particle.size * alpha));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = effect.color;
      if (effect.fighterType === "ice") {
        ctx.save();
        ctx.translate(Math.round(particle.x), Math.round(particle.y));
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-size, -size, size * 2, size * 2);
        ctx.restore();
      } else if (effect.fighterType === "wizard") {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(Math.round(particle.x - size), Math.round(particle.y - size), size * 2, size * 2);
      } else if (effect.fighterType === "time") {
        ctx.fillRect(Math.round(particle.x - size * 1.5), Math.round(particle.y - 1), size * 3, 2);
        ctx.fillRect(Math.round(particle.x - 1), Math.round(particle.y - size * 1.5), 2, size * 3);
      } else if (effect.fighterType === "aegis") {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(Math.round(particle.x - size), Math.round(particle.y - size), size * 2, size * 2);
      } else {
        ctx.fillRect(Math.round(particle.x - size / 2), Math.round(particle.y - size), size, size * 2);
      }
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

function seededUnit(seed, index) {
  let value = (Number(seed) + Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  return (value >>> 0) / 4294967296;
}

// Classic WDC reference duel. All animated geometry is drawn from the
// encounter clock, including the frames between simulation checkpoints.
const WDC_DUEL_BOARD = Object.freeze({ x: 123, y: 423, size: 834 });
const WDC_BLUE = "#2552dc";
const WDC_YELLOW = "#efd05c";
const WDC_TITLE_BLUE = "#5275dc";
const WDC_TITLE_GOLD = "#e8ce7c";
const WDC_PIXEL_GLYPHS = Object.freeze({
    A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30], C: [15, 16, 16, 16, 16, 16, 15],
    D: [30, 17, 17, 17, 17, 17, 30], E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16],
    G: [15, 16, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17], I: [31, 4, 4, 4, 4, 4, 31],
    J: [7, 2, 2, 2, 18, 18, 12], K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
    M: [17, 27, 31, 21, 17, 17, 17], N: [17, 25, 25, 21, 19, 19, 17], O: [14, 17, 17, 17, 17, 17, 14],
    P: [30, 17, 17, 30, 16, 16, 16], Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17],
    S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4], U: [17, 17, 17, 17, 17, 17, 14],
    V: [17, 17, 17, 17, 17, 10, 4], W: [17, 17, 17, 21, 21, 27, 17], X: [17, 17, 10, 4, 10, 17, 17],
    Y: [17, 17, 10, 4, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31], ":": [0, 4, 4, 0, 4, 4, 0],
    0: [14, 17, 19, 21, 25, 17, 14], 1: [4, 12, 4, 4, 4, 4, 14],
    2: [14, 17, 1, 6, 8, 16, 31], 3: [30, 1, 1, 14, 1, 1, 30],
    4: [2, 6, 10, 18, 31, 2, 2], 5: [31, 16, 16, 30, 1, 17, 14],
    6: [6, 8, 16, 30, 17, 17, 14], 7: [31, 1, 2, 4, 8, 8, 8],
    8: [14, 17, 17, 14, 17, 17, 14], 9: [14, 17, 17, 15, 1, 2, 12],
    "+": [0, 4, 4, 31, 4, 4, 0], "-": [0, 0, 0, 31, 0, 0, 0], "×": [0, 17, 10, 4, 10, 17, 0],
});
const wdcTitlePaths = new Map();

function wdcPixelWidth(label) {
    return [...label].reduce((width, letter) => width + (letter === " " ? 4 : 6), 0) - 1;
}

function wdcPixelText(ctx, label, x, y, scaleX, scaleY, color) {
    if (!wdcTitlePaths.has(label)) {
        const path = new Path2D();
        let offset = 0;
        for (const letter of label) {
            WDC_PIXEL_GLYPHS[letter]?.forEach((row, y) => {
                for (let x = 0; x < 5; x += 1) {
                    if (row & (16 >> x)) path.rect(offset + x, y, 1.07, 1.03);
                }
            });
            offset += letter === " " ? 4 : 6;
        }
        wdcTitlePaths.set(label, path);
    }
    ctx.save();
    ctx.translate(x - wdcPixelWidth(label) * scaleX / 2, y - 3.5 * scaleY);
    ctx.scale(scaleX, scaleY);
    ctx.fillStyle = color;
    ctx.fill(wdcTitlePaths.get(label));
    ctx.restore();
}

export function drawClassicPixelMatchup(ctx, rect, left, right, colors) {
    if (!left || !right || [...(left + right)].some((letter) => letter !== " " && !Object.hasOwn(WDC_PIXEL_GLYPHS, letter))) return false;
    const labels = [left, "VS", right];
    const widths = labels.map((label, index) => wdcPixelWidth(label) * (index === 1 ? .70 : 1));
    const gap = 3.8;
    const units = widths[0] + widths[1] + widths[2] + gap * 2;
    const xScale = Math.min(rect.width * .91 / units, rect.height * .064);
    const yScale = Math.min(xScale * .78, rect.height * .050);
    let x = rect.x + (rect.width - units * xScale) / 2;
    for (let index = 0; index < labels.length; index += 1) {
        const width = widths[index] * xScale;
        const versus = index === 1;
        wdcPixelText(ctx, labels[index], x + width / 2, rect.y + rect.height * .54,
            xScale * (versus ? .70 : 1), yScale * (versus ? .70 : 1), colors[index]);
        x += width + gap * xScale;
    }
    return true;
}

function wdcPolygon(ctx, points, color, stroke = null, width = 1) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.stroke();
    }
}

function wdcDisc(ctx, x, y, radius, color, rim = null, lineWidth = 1) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(.01, radius), 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
    if (rim) {
        ctx.strokeStyle = rim;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

function wdcOrb(ctx, point, radius, color, rim, health, darkNumber = false) {
    wdcDisc(ctx, point.x, point.y, radius, color, rim, radius * .055);
    ctx.save();
    ctx.globalAlpha = .24;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = radius * .027;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * .943, Math.PI * 1.14, Math.PI * 1.83);
    ctx.stroke();
    ctx.restore();
    ctx.font = `800 ${radius * .62}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = radius * .055;
    ctx.strokeStyle = darkNumber ? "#e0e0e0" : "#23221e";
    ctx.fillStyle = darkNumber ? "#171717" : "#fffdf6";
    const label = String(Math.ceil(health));
    ctx.strokeText(label, point.x, point.y + radius * .055);
    ctx.fillText(label, point.x, point.y + radius * .055);
}

function wdcPortal(ctx, x, y, radius, age, duration, reducedMotion = false) {
    const open = Math.max(.001, Math.min(1, age / .24, (duration - age) / .27));
    const bloom = 1 - (1 - open) ** 3;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(bloom, Math.max(.08, bloom));
    ctx.globalAlpha *= Math.min(1, open * 2);
    const rim = (scale, color, width, solid = false) => {
        ctx.beginPath();
        for (let index = 0; index <= 64; index += 1) {
            const angle = TAU * index / 64;
            const ripple = reducedMotion ? 0 : Math.sin(angle * 9 + age * 13) * .042 + Math.sin(angle * 17 - age * 7) * .026;
            const px = Math.cos(angle) * radius * 1.05 * scale * (1 + ripple);
            const py = Math.sin(angle) * radius * 2.94 * scale;
            if (index) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
        }
        ctx.closePath();
        if (solid) {
            ctx.fillStyle = "#08040b";
            ctx.fill();
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = width * radius;
        ctx.stroke();
    };
    rim(1.12, "rgba(100,37,131,.17)", .35);
    rim(1.06, "rgba(99,37,127,.35)", .20);
    rim(1.02, "#3b1a52", .10);
    rim(.95, "#9a5cbd", .044, true);
    rim(.84, "rgba(139,53,179,.7)", .023);

    for (let index = 0; index < 8; index += 1) {
        const pos = (index - 3.5) / 3.5;
        const px = Math.sin(index * 1.14 + age * 2) * radius * (.49 - .17 * Math.abs(pos));
        const py = pos * radius * 2.03;
        const eye = radius * (.205 + .045 * Math.cos(index * 4));
        const blink = reducedMotion ? 1 : Math.max(.12, 1 - Math.exp(-((age - .31 - index * .027) ** 2) / .00052));
        wdcPolygon(ctx, [[px - eye, py], [px - eye * .16, py - eye * .50 * blink],
            [px + eye, py], [px + eye * .04, py + eye * .46 * blink]], "#f5d6de", "#341022", radius * .026);
        wdcDisc(ctx, px, py, eye * .22 * blink, "#a9243a");
    }
    for (const side of [-1, 1]) {
        const tip = side * radius * 2.91;
        wdcPolygon(ctx, [[-radius * .28, tip + side * radius * .28], [-radius * .14, tip - side * radius * .26],
            [radius * .05, tip + side * radius * .15], [radius * .20, tip - side * radius * .25],
            [radius * .30, tip + side * radius * .29], [0, tip + side * radius * .18]], "#ac333f");
    }
    ctx.restore();
}

function wdcGlove(ctx, x, y, radius, angle, serious = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(radius, radius);
    const outline = [[-.83, -.42], [-.64, -.77], [-.27, -.94], [.01, -.87], [.25, -.99],
        [.54, -.85], [.78, -.64], [.91, -.29], [.93, .19], [.65, .62], [.28, .76],
        [.08, .53], [-.15, .65], [-.60, .54], [-.77, .24]];
    wdcPolygon(ctx, outline, "#b73323", serious ? "#ffe6b8" : "#2f100c", .12);
    wdcPolygon(ctx, [[-.72, -.39], [-.45, -.68], [-.06, -.71], [-.16, -.36], [-.54, -.12]], "#ed7752");
    wdcPolygon(ctx, [[.01, -.75], [.31, -.87], [.57, -.72], [.76, -.42],
        [.51, -.28], [.17, -.35]], "#e25434");
    wdcPolygon(ctx, [[-.67, .20], [-.28, -.02], [.04, .14], [.25, .43],
        [.65, .36], [.58, .61], [.27, .73], [.08, .52], [-.18, .62], [-.57, .50]], "#6f1a12");
    ctx.strokeStyle = "#4b140f";
    ctx.lineWidth = .09;
    ctx.beginPath();
    ctx.moveTo(-.20, -.76);
    ctx.lineTo(-.26, -.31);
    ctx.lineTo(.08, -.13);
    ctx.moveTo(.26, -.85);
    ctx.lineTo(.40, -.43);
    ctx.lineTo(.72, -.32);
    ctx.stroke();
    ctx.restore();
}

function wdcPunchArm(ctx, shoulder, fist, radius, angle, serious = false, fistRadius = radius * (serious ? .60 : .49)) {
    const dx = fist.x - shoulder.x;
    const dy = fist.y - shoulder.y;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(shoulder.x, shoulder.y);
    ctx.lineTo(shoulder.x + dx * .53 - Math.sin(angle) * radius * .17,
        shoulder.y + dy * .53 + Math.cos(angle) * radius * .17);
    ctx.lineTo(fist.x, fist.y);
    ctx.strokeStyle = "#30230d";
    ctx.lineWidth = radius * .40;
    ctx.stroke();
    ctx.strokeStyle = "#f5cc5c";
    ctx.lineWidth = radius * .29;
    ctx.stroke();
    wdcGlove(ctx, fist.x, fist.y, fistRadius, angle, serious);
    ctx.restore();
}

function wdcDisintegrator(ctx, point, radius, size, beam, time, flashReduction = false) {
    const { angle, phase, progress } = beam;
    const x = point.x + Math.cos(angle) * radius * 1.03;
    const y = point.y + Math.sin(angle) * radius * 1.03;
    const fire = phase === "fire";
    const length = size * (fire ? 1.53 * Math.min(1, .22 + progress * 12) : 1.2);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    if (fire) {
        const opening = Math.min(1, .2 + progress * 8);
        const fade = Math.min(1, (1 - progress) * 5);
        const edge = (at) => (.018 + .31 * (1 - Math.exp(-at * 7.8)))
            * size * opening * (1 + .023 * Math.sin(at * 53 - time * 32) + .012 * Math.sin(at * 113 + time * 25));
        const ribbon = (inner, outer, color) => {
            for (const side of [-1, 1]) {
                ctx.beginPath();
                for (let index = 0; index <= 36; index += 1) {
                    const at = index / 36;
                    const y = edge(at) * side * outer;
                    if (index) ctx.lineTo(length * at, y);
                    else ctx.moveTo(0, y);
                }
                for (let index = 36; index >= 0; index -= 1) {
                    const at = index / 36;
                    ctx.lineTo(length * at, edge(at) * side * inner);
                }
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();
            }
        };
        ctx.globalAlpha = fade * (flashReduction ? .66 : 1);
        ribbon(0, 1.16, "rgba(80,15,12,.24)");
        ribbon(.65, 1.11, "rgba(177,43,31,.33)");
        ribbon(.61, 1.02, "#801e19");
        ribbon(.63, .97, "#f15139");
        ribbon(.80, .91, "#fff6ec");
        ribbon(.57, .76, "rgba(215,56,42,.8)");
        ctx.lineCap = "round";
        for (let index = 0; index < 56; index += 1) {
            const u = ((index * .61803399 + progress * 2.8) % 1) ** 1.26;
            const spread = Math.sin(index * 10.27) * .84 * edge(u);
            ctx.strokeStyle = index % 4 ? "#ef725e" : "#fff6ea";
            ctx.globalAlpha = fade * (.20 + (index % 5) * .13);
            ctx.lineWidth = size * (.0018 + (index % 3) * .0013);
            ctx.beginPath();
            ctx.moveTo(length * u, spread);
            ctx.lineTo(length * u + size * (.014 + (index % 4) * .015), spread);
            ctx.stroke();
        }
        ctx.globalAlpha = fade;
        wdcDisc(ctx, 0, 0, radius * (.32 + Math.sin(time * 47) * .048), "#fffdf8");
    } else {
        ctx.strokeStyle = "rgba(227,109,102,.63)";
        ctx.lineWidth = Math.max(1, size * .0017);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(length, 0);
        ctx.stroke();
        const glow = radius * (.16 + .21 * progress);
        wdcDisc(ctx, 0, 0, glow * 1.9, "rgba(224,61,48,.27)");
        wdcDisc(ctx, 0, 0, glow, "#ffe8db");
        for (let index = 0; index < 10; index += 1) {
            const a = index * 2.4 + time * .72;
            const distance = radius * (1.3 + ((index * .372 + progress * 2.1) % 1) * 1.3);
            const sx = Math.cos(a) * distance;
            const sy = Math.sin(a) * distance;
            ctx.strokeStyle = index % 3 ? "rgba(242,120,98,.46)" : "rgba(255,237,217,.73)";
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(a) * radius * .24, sy + Math.sin(a) * radius * .24);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function wdcPickaxe(ctx, x, y, radius, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(radius / 17, radius / 17);
    ctx.fillStyle = "#36261b";
    ctx.fillRect(9, -2.5, 22, 5);
    ctx.fillStyle = "#a17946";
    ctx.fillRect(10, -1.4, 20, 2.9);
    ctx.fillStyle = "#dab27c";
    for (let step = 0; step < 6; step += 1) ctx.fillRect(11 + step * 3.1, -.9, 1.5, 1.5);
    wdcPolygon(ctx, [[22, -9], [26, -12], [31, -12], [31, -10], [34, -10], [34, -7],
        [36, -7], [36, 6], [34, 6], [34, 9], [31, 9], [31, 12], [27, 12], [27, 9],
        [30, 8], [30, 5], [32, 5], [32, -5], [30, -5], [30, -8], [27, -8], [27, -6], [22, -6]],
    "#b4b7b4", "#3e4241", 1.2);
    ctx.fillStyle = "#f2f0e3";
    ctx.fillRect(26, -11, 5, 1.8);
    ctx.fillRect(33, -6.5, 2.2, 11);
    ctx.restore();
}

function wdcMarket(ctx, x, y, size, shop, time) {
    const appear = Math.min(1, shop.age / .36);
    ctx.save();
    ctx.translate(x, y + size * .024 * (1 - appear));
    ctx.scale(size / 1040, size / 1040);
    ctx.globalAlpha = appear;
    wdcPolygon(ctx, [[-146, 36], [0, -2], [146, 36], [151, 101], [106, 88], [0, 59], [-110, 89], [-151, 101]],
        "#a9c5eb", "#3c4c65", 6);
    for (let stripe = 0; stripe < 8; stripe += 1) {
        const a = -146 + stripe * 36.5;
        const b = a + 34.5;
        const roofY = (value) => Math.abs(value) * .26;
        wdcPolygon(ctx, [[a, roofY(a) + 5], [b, roofY(b) + 5], [b + (b > 0 ? 3 : -3), roofY(b) + 56],
            [a + (a > 0 ? 3 : -3), roofY(a) + 56]],
        stripe % 2 ? "#c1d4f1" : "#7f9bc6");
        ctx.fillStyle = stripe % 2 ? "#f2f4ff" : "#a6bce6";
        ctx.fillRect(a, roofY(a) + 50, 32, 9);
    }
    wdcPolygon(ctx, [[-142, 34], [0, -5], [142, 34], [142, 43], [0, 7], [-142, 43]], "#e5ecfb");
    wdcPolygon(ctx, [[-137, 103], [0, 63], [137, 103], [137, 113], [0, 79], [-137, 114]], "#b28054");
    ctx.fillStyle = "#735030";
    ctx.fillRect(-119, 97, 17, 157);
    ctx.fillRect(102, 97, 17, 157);
    ctx.fillStyle = "#caa66a";
    ctx.fillRect(-121, 103, 9, 152);
    ctx.fillRect(105, 103, 10, 152);

    if (shop.merchant) {
        const bob = Math.sin(time * 4.4) * 2;
        ctx.fillStyle = "#3f2722";
        ctx.fillRect(-21, 126 + bob, 41, 44);
        ctx.fillStyle = "#dfaa7b";
        ctx.fillRect(-15, 140 + bob, 30, 30);
        ctx.fillStyle = "#f0c9a0";
        ctx.fillRect(-9, 142 + bob, 20, 19);
        ctx.fillStyle = "#29202a";
        ctx.fillRect(-7, 149 + bob, 4, 5);
        ctx.fillRect(6, 149 + bob, 4, 5);
        ctx.fillStyle = "#563f71";
        ctx.fillRect(-25, 171 + bob, 50, 40);
        ctx.fillStyle = "#eee1c5";
        ctx.fillRect(-11, 176 + bob, 25, 35);
        ctx.fillRect(-31, 187 + bob, 16, 12);
        ctx.fillRect(19, 186 - bob, 15, 12);
    }
    for (const side of [-1, 1]) {
        const sx = side * 95;
        ctx.fillStyle = "#b99c65";
        ctx.fillRect(sx - 22, 192, 44, 53);
        ctx.fillStyle = "#dfc98a";
        ctx.fillRect(sx - 24, 183, 48, 16);
        ctx.fillStyle = "#527045";
        ctx.fillRect(sx - 8, 169, 15, 17);
        ctx.fillStyle = "#d89959";
        ctx.fillRect(sx + 9, 161, 11, 27);
    }
    ctx.fillStyle = "#694627";
    ctx.fillRect(-105, 224, 210, 33);
    ctx.fillStyle = "#be975d";
    ctx.fillRect(-115, 218, 230, 12);
    for (let slat = -95; slat < 96; slat += 23) ctx.fillRect(slat, 231, 14, 25);
    ctx.fillStyle = "#180e08";
    ctx.fillRect(-162, 258, 324, 49);
    ctx.strokeStyle = "#e79750";
    ctx.lineWidth = 7;
    ctx.strokeRect(-162, 258, 324, 49);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#eca460";
    ctx.font = "900 35px Arial, sans-serif";
    ctx.fillText("SELL", 0, 284);
    ctx.fillStyle = "#f6dda5";
    ctx.font = "700 24px Arial, sans-serif";
    ctx.fillText(`COINS ${shop.coins}`, 0, 335);
    ctx.restore();
}

function wdcGroceries(ctx, x, y, size, time) {
    ctx.save();
    ctx.translate(x, y + Math.sin(time * 12) * size * .025);
    ctx.scale(size / 30, size / 30);
    wdcPolygon(ctx, [[-11, 4], [-14, -15], [-10, -22], [-5, -20], [0, 5]], "#c7984d", "#604024", .7);
    ctx.fillStyle = "#f6ca7b";
    ctx.fillRect(-11, -18, 4, 5);
    ctx.fillRect(-9, -11, 4, 4);
    wdcPolygon(ctx, [[0, 4], [-1, -12], [5, -19], [10, -14], [12, 4]], "#97bba4", "#3f6452", .8);
    wdcPolygon(ctx, [[3, 6], [6, -7], [12, -11], [15, -4], [12, 6]], "#5e913d");
    wdcPolygon(ctx, [[-13, -1], [14, -1], [12, 23], [-11, 23]], "#d5ac69", "#a77e45", .8);
    wdcPolygon(ctx, [[9, 0], [14, -1], [12, 23], [8, 22]], "#b58b4f");
    ctx.fillStyle = "#e1b97d";
    ctx.fillRect(-10, 1, 18, 4);
    ctx.restore();
}

function pulseLine(ctx, x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function pulseRing(ctx, x, y, radius, color, width) {
    if (radius > 0) wdcDisc(ctx, x, y, radius, "transparent", color, width);
}

function clipClassicPulseArena(ctx, sim) {
    const bounds = sim.arenaBounds;
    ctx.beginPath();
    if (sim.arenaShape === "circle") {
        ctx.arc(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, Math.min(bounds.width, bounds.height) / 2, 0, TAU);
    } else {
        ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
    ctx.clip();
}

const CLASSIC_ACTION_BODIES = new Set(["ben-10", "darth-vader", "luke-skywalker"]);
const CLASSIC_ACTION_PROJECTILES = new Set(["classic-saber-throw", "snow-shard"]);
const CLASSIC_ALIEN_SHELLS = {
    xlr8: "#102846",
    heatblast: "#6f2225",
    diamondhead: "#1c594d",
    "four-arms": "#98283b",
    cannonbolt: "#947f59",
};

function drawClassicActionBody(ctx, fighter, time, options) {
    const { radius: r, classicOmnitrix: state } = fighter;
    ctx.save();
    ctx.shadowBlur = 0;
    if (fighter.type === "darth-vader") {
        wdcPolygon(ctx, [[-r * 1.08, r * 0.75], [-r * 0.65, -r * 0.71], [0, -r * 1.09],
            [r * 0.65, -r * 0.71], [r * 1.08, r * 0.75]], "#211e28", "#df5261", r * 0.063);
        wdcDisc(ctx, 0, 0, r * 0.87, "#15141d");
        wdcPolygon(ctx, [[-r * 0.59, -r * 0.52], [0, -r * 0.34], [r * 0.59, -r * 0.52],
            [r * 0.40, -r * 0.22], [-r * 0.40, -r * 0.22]], "#555565");
        wdcPolygon(ctx, [[-r * 0.32, r * 0.64], [0, r * 0.41], [r * 0.32, r * 0.64]], "#a5a5b6");
    } else if (fighter.type === "luke-skywalker") {
        wdcDisc(ctx, 0, 0, r, "#beaa84", "#88f18d", r * 0.065);
        ctx.strokeStyle = "#f5e8ca";
        ctx.lineWidth = r * 0.24;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.73, -2.9, -0.35);
        ctx.stroke();
        ctx.fillStyle = "#504236";
        ctx.fillRect(-r * 0.65, r * 0.57, r * 1.3, r * 0.18);
    } else if (state?.phase === "alien") {
        const form = CLASSIC_ALIENS[state.form];
        if (state.form === "cannonbolt" && state.rush) {
            ctx.scale(state.rush.radius / r, state.rush.radius / r);
        }
        wdcDisc(ctx, 0, 0, r, CLASSIC_ALIEN_SHELLS[state.form], form.color, r * 0.075);
        drawClassicAlienWeapon(ctx, fighter, state, form, time, options);
    } else {
        wdcDisc(ctx, 0, 0, r, "#20392b", "#a7ff70", r * 0.07);
        ctx.strokeStyle = "#65c446";
        ctx.lineWidth = r * 0.22;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.78, 0.28, 2.86);
        ctx.stroke();
        drawClassicOmnitrixDial(ctx, 0, -r * 0.81, r * 0.37, state?.phase === "reset" ? "#ff6c53" : "#9eff62");
    }
    ctx.restore();
}

function drawClassicOmnitrixDial(ctx, x, y, r, color) {
    wdcDisc(ctx, x, y, r, "#0a2015", color, r * 0.14);
    wdcPolygon(ctx, [[x - r * 0.61, y - r * 0.62], [x, y - r * 0.15], [x + r * 0.61, y - r * 0.62],
        [x + r * 0.61, y + r * 0.62], [x, y + r * 0.15], [x - r * 0.61, y + r * 0.62]], color);
}

function drawClassicFourArms(ctx, fighter, state, time, options) {
    const r = fighter.radius;
    const grab = state.grab;
    const gripping = grab && time < grab.releaseAt;
    const gap = gripping ? Math.hypot(grab.x - fighter.x, grab.y - fighter.y) : 0;
    const load = state.attackAt ? Math.max(0, Math.min(1, (time - state.attackStartedAt) / (state.attackAt - state.attackStartedAt))) : 0;
    const age = time - (state.strikeAt ?? -Infinity);
    const extension = age < 0.30 ? (1 - age / 0.30) ** 1.65 : 0;
    const aim = gripping ? Math.atan2(grab.y - fighter.y, grab.x - fighter.x) : state.angle ?? 0;
    const fist = r * (gripping ? 1.50 : 1.22);
    for (const side of [-1, 1]) {
        for (const outer of [false, true]) {
            const spread = outer ? 2.24 : 0.64;
            const fan = gripping ? outer ? 0.59 : 0.23 : spread - (outer ? 1.16 : 0.22) * Math.max(load * 0.75, extension);
            const a = aim + side * fan;
            const reach = gripping ? Math.max(r * 1.08, gap - r * (outer ? 0.91 : 0.34))
                : r * (1.08 - load * 0.13 + extension * (outer ? 1.31 : 1.74));
            ctx.save();
            ctx.rotate(a);
            ctx.lineCap = "round";
            ctx.strokeStyle = "#a72f45";
            ctx.lineWidth = r * 0.22;
            ctx.beginPath();
            ctx.moveTo(r * 0.74, 0);
            ctx.lineTo(reach, 0);
            ctx.stroke();
            wdcPolygon(ctx, [[reach - fist * 0.21, -fist * 0.23], [reach + fist * 0.14, -fist * 0.25],
                [reach + fist * 0.36, -fist * 0.09], [reach + fist * 0.33, fist * 0.18],
                [reach + fist * 0.10, fist * 0.26], [reach - fist * 0.24, fist * 0.19]],
            "#f64f5c", "#ffb2a1", r * 0.056);
            ctx.strokeStyle = "#912a3d";
            ctx.lineWidth = r * 0.032;
            for (const knuckle of [-0.11, 0.025, 0.16]) {
                ctx.beginPath();
                ctx.moveTo(reach + fist * 0.10, fist * knuckle);
                ctx.lineTo(reach + fist * 0.28, fist * knuckle);
                ctx.stroke();
            }
            if (!options.reducedMotion && extension > 0.18) {
                ctx.globalAlpha = extension * 0.65;
                ctx.strokeStyle = "#ffae98";
                ctx.lineWidth = r * 0.051;
                ctx.beginPath();
                ctx.moveTo(r * 1.12, -r * 0.28);
                ctx.lineTo(reach - r * 0.09, -r * 0.31);
                ctx.stroke();
            }
            ctx.restore();
        }
    }
}

function drawClassicAlienWeapon(ctx, fighter, state, form, time, options) {
    const r = fighter.radius;
    if (state.form === "xlr8") {
        ctx.scale(fighter.vx < 0 ? -1 : 1, 1);
        wdcPolygon(ctx, [[-r * 1.16, -r * 0.83], [r * 0.38, -r * 0.95], [r * 0.93, -r * 0.47],
            [r * 0.78, -r * 0.20], [-r * 0.52, -r * 0.29]], "#43c7ff", form.accent, r * 0.043);
        wdcPolygon(ctx, [[-r * 0.18, -r * 0.67], [r * 0.59, -r * 0.65], [r * 0.83, -r * 0.41],
            [r * 0.68, -r * 0.30], [-r * 0.16, -r * 0.44]], "#102739");
    } else if (state.form === "heatblast") {
        const wave = options.reducedMotion ? 0 : 0.14 * Math.sin(time * 18);
        wdcPolygon(ctx, [[-r * 0.72, -r * 0.49], [-r * 0.65, -r * 1.16], [-r * 0.30, -r * 0.94],
            [r * 0.09, -r * (1.54 + wave)], [r * 0.40, -r * 0.98], [r * 0.62, -r * (1.22 - wave)],
            [r * 0.76, -r * 0.46]], "#fa6b30", form.accent, r * 0.055);
        wdcPolygon(ctx, [[-r * 0.33, -r * 0.48], [r * 0.12, -r * (1.22 + wave)], [r * 0.37, -r * 0.49]], "#ffe677");
    } else if (state.form === "diamondhead") {
        const h = state.guard > 0 ? 1.31 : 1.12;
        wdcPolygon(ctx, [[-r * 0.89, -r * 0.44], [-r * 0.66, -r * 1.00], [-r * 0.34, -r * 0.79],
            [r * 0.04, -r * h], [r * 0.36, -r * 0.69], [r * 0.72, -r * 0.98],
            [r * 0.83, -r * 0.37]], "#60e5b8", form.accent, r * 0.05);
        wdcPolygon(ctx, [[-r * 0.33, -r * 0.51], [r * 0.04, -r * h], [r * 0.18, -r * 0.51]], form.accent);
    } else if (state.form === "four-arms") {
        drawClassicFourArms(ctx, fighter, state, time, options);
    } else {
        ctx.rotate(options.reducedMotion ? 0 : state.rush ? (time - state.rush.at) * 12 : time * 1.4);
        ctx.strokeStyle = form.color;
        ctx.lineWidth = r * 0.27;
        for (const offset of [0, Math.PI]) {
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.77, offset - 0.89, offset + 0.89);
            ctx.stroke();
        }
    }
}

function drawClassicSaberBlade(ctx, blade, color, options, thrown = false) {
    ctx.save();
    ctx.lineCap = "round";
    const hilt = blade.width * 1.62;
    ctx.save();
    ctx.translate(blade.x1, blade.y1);
    ctx.rotate(blade.angle);
    ctx.fillStyle = "#151921";
    ctx.fillRect(-hilt, -blade.width * 0.54, hilt, blade.width * 1.08);
    ctx.fillStyle = "#a4a8b7";
    ctx.fillRect(-hilt, -blade.width * 0.43, hilt * 0.22, blade.width * 0.86);
    ctx.fillRect(-hilt * 0.35, -blade.width * 0.57, hilt * 0.32, blade.width * 1.14);
    ctx.fillStyle = color;
    ctx.fillRect(-hilt * 0.67, -blade.width * 0.18, hilt * 0.13, blade.width * 0.36);
    ctx.restore();
    const bladePath = new Path2D();
    bladePath.moveTo(blade.x1, blade.y1);
    bladePath.lineTo(blade.x2, blade.y2);
    ctx.strokeStyle = color;
    ctx.globalAlpha = blade.active ? 0.37 : 0.22;
    ctx.lineWidth = blade.width * (options.flashReduction ? 1.40 : 2.32);
    ctx.stroke(bladePath);
    ctx.globalAlpha = thrown || blade.active ? 1 : 0.90;
    ctx.lineWidth = blade.width * 1.12;
    ctx.stroke(bladePath);
    ctx.strokeStyle = "#fffdf1";
    ctx.lineWidth = blade.width * 0.39;
    ctx.stroke(bladePath);
    ctx.restore();
}

function drawHeldClassicSaber(ctx, fighter, blade, color, options) {
    const r = fighter.radius;
    const vader = fighter.type === "darth-vader";
    ctx.save();
    ctx.translate(fighter.x, fighter.y);
    ctx.rotate(blade.angle);
    wdcPolygon(ctx, [[r * 0.72, r * 0.20], [r * 0.92, r * 0.34], [r * 1.31, r * 0.16],
        [r * 1.37, r * 0.04], [r * 1.15, -r * 0.04], [r * 0.81, r * 0.07]],
    vader ? "#292437" : "#c4ae88", vader ? "#897c9b" : "#f4e4c2", r * 0.045);
    ctx.restore();
    drawClassicSaberBlade(ctx, blade, color, options);
    ctx.save();
    ctx.translate(fighter.x, fighter.y);
    ctx.rotate(blade.angle);
    wdcPolygon(ctx, [[r * 1.12, r * 0.19], [r * 1.16, -r * 0.02], [r * 1.30, -r * 0.14],
        [r * 1.43, -r * 0.07], [r * 1.39, r * 0.16], [r * 1.29, r * 0.24]],
    vader ? "#292333" : "#c49774", vader ? "#b497bf" : "#ffdbad", r * 0.042);
    ctx.restore();
}

function drawClassicSaberScar(ctx, effect, alpha) {
    const { cuts } = effect;
    if (cuts.length < 2) return;
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = effect.color;
    ctx.globalAlpha = alpha * 0.18;
    ctx.beginPath();
    cuts.forEach(({ x2, y2 }, i) => i ? ctx.lineTo(x2, y2) : ctx.moveTo(x2, y2));
    for (let i = cuts.length - 1; i >= 0; i -= 1) {
        const { x1, y1, x2, y2 } = cuts[i];
        ctx.lineTo(x2 + (x1 - x2) * 0.43, y2 + (y1 - y2) * 0.43);
    }
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    cuts.forEach(({ x2, y2 }, i) => i ? ctx.lineTo(x2, y2) : ctx.moveTo(x2, y2));
    ctx.globalAlpha = alpha * 0.68;
    ctx.lineWidth = Math.max(1, cuts[0].width * 0.66 * alpha);
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
}

function classicWallOutlineSide(length, pointAt, marks, circular = false) {
    const knots = new Set([0, length]);
    if (circular) {
        for (let i = 1; i < 144; i += 1) knots.add(length * i / 144);
    }
    for (const { center, span, kind } of marks) {
        const offsets = kind === "breach" ? [-1.27, -1.10, -1, 1, 1.10, 1.27] : [-1, -0.72, -0.40, -0.16, 0.14, 0.42, 0.74, 1];
        for (const offset of offsets) knots.add(Math.max(0, Math.min(length, center + offset * span)));
    }
    const distances = [...knots].sort((a, b) => a - b);
    const position = (along) => {
        let depth = 0;
        for (const mark of marks) {
            const offset = (along - mark.center) / mark.span;
            const distance = Math.abs(offset);
            if (mark.kind === "dent" && distance < 1) {
                const recess = Math.min(1, (1 - distance) * 1.72) * (0.92 + 0.08 * Math.cos(offset * 16));
                depth = Math.max(depth, mark.depth * recess);
            } else if (mark.kind === "breach" && distance >= 1 && distance < 1.27) {
                const lip = Math.max(0, 1 - (distance - 1) / 0.27);
                depth = Math.max(depth, mark.depth * lip * (distance > 1.06 && distance < 1.15 ? 0.37 : 1));
            }
        }
        const join = circular ? 1 : Math.min(1, along / 18, (length - along) / 18);
        return pointAt(along, depth * join);
    };
    const runs = [];
    let run = null;
    for (let i = 1; i < distances.length; i += 1) {
        const from = distances[i - 1];
        const to = distances[i];
        if (marks.some(({ kind, center, span }) => kind === "breach" && Math.abs((from + to) / 2 - center) < span)) {
            run = null;
            continue;
        }
        if (!run) {
            run = [position(from)];
            runs.push(run);
        }
        run.push(position(to));
    }
    return runs;
}

export function classicWallStrokeRuns(sim) {
    const { x, y, width, height } = sim.arenaBounds;
    const deformations = sim.classicWallDeformations || [];
    if (sim.arenaShape === "circle") {
        const radius = Math.min(width, height) / 2;
        const cx = x + width / 2;
        const cy = y + height / 2;
        const length = TAU * radius;
        const marks = deformations.filter(({ side }) => side === "circle").flatMap((mark) => {
            const position = (Math.atan2(mark.y - cy, mark.x - cx) + TAU) % TAU * radius;
            return [-length, 0, length].map((shift) => ({ ...mark, center: position + shift }));
        });
        const points = classicWallOutlineSide(length, (along, depth) => ({
            x: cx + Math.cos(along / radius) * (radius - depth),
            y: cy + Math.sin(along / radius) * (radius - depth),
        }), marks, true);
        return points.map((run) => ({ side: "circle", points: run }));
    }
    const sides = [
        ["top", width, (along, depth) => ({ x: x + along, y: y + depth })],
        ["right", height, (along, depth) => ({ x: x + width - depth, y: y + along })],
        ["bottom", width, (along, depth) => ({ x: x + along, y: y + height - depth })],
        ["left", height, (along, depth) => ({ x: x + depth, y: y + along })],
    ];
    return sides.flatMap(([side, length, pointAt]) => {
        const horizontal = side === "top" || side === "bottom";
        const marks = deformations.filter((mark) => mark.side === side).map((mark) => ({
            ...mark, center: horizontal ? mark.x - x : mark.y - y,
        }));
        return classicWallOutlineSide(length, pointAt, marks).map((points) => ({ side, points }));
    });
}

export function drawClassicArenaWall(ctx, sim, options = {}) {
    const { colors, classicBlackTheme, wallWidth = 2.4 } = options;
    const { x, y, width, height } = sim.arenaBounds;
    const neutral = classicBlackTheme ? "#c4c7ce" : "#111018";
    ctx.save();
    ctx.lineWidth = wallWidth;
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
    ctx.strokeStyle = neutral;
    if (!colors && sim.arenaShape !== "circle" && !sim.classicWallDeformations?.length) {
        ctx.strokeRect(x, y, width, height);
    } else {
        let circleInk = neutral;
        if (colors && sim.arenaShape === "circle") {
            circleInk = ctx.createLinearGradient(x, y, x + width, y + height);
            circleInk.addColorStop(0, colors[1]);
            circleInk.addColorStop(0.5, colors[1]);
            circleInk.addColorStop(0.5, colors[0]);
            circleInk.addColorStop(1, colors[0]);
        }
        for (const { side, points } of classicWallStrokeRuns(sim)) {
            ctx.strokeStyle = side === "circle" ? circleInk : colors?.[side === "top" || side === "right" ? 0 : 1] || neutral;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawClassicWallDebris(ctx, effect, life, options) {
    if (options.reducedMotion) return;
    const { radius, angle, x, y, open } = effect;
    const fade = life / effect.maxLife;
    const travel = 1 - fade;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = fade * 0.90;
    for (let i = 0; i < 9; i += 1) {
        const side = (i - 4) / 5;
        const sy = radius * side * (0.46 + travel * 1.27);
        const sx = travel * radius * (open ? -0.94 : 0.92) * (0.58 + (i % 3) * 0.24);
        const chip = Math.min(radius * 0.16, 9);
        wdcPolygon(ctx, [[sx, sy], [sx + chip, sy - chip * 0.45], [sx + chip * 0.57, sy + chip * 0.76]],
            open ? "#e2e4ee" : "#ffdbaf");
    }
    ctx.restore();
}

export function drawClassicWallDamage(ctx, sim, options) {
    const resultAge = options.classicResultAge || 0;
    for (const burn of sim.effects || []) {
        if (burn.kind === "classic-wall-debris" && burn.life > resultAge) {
            drawClassicWallDebris(ctx, burn, burn.life - resultAge, options);
            continue;
        }
        if (burn.kind !== "classic-saber-burn" || burn.life <= resultAge) continue;
        const alpha = Math.min(1, (burn.life - resultAge) / (burn.maxLife * 0.55));
        for (const [index, mark] of burn.marks.entries()) {
            const { x, y, width, angle } = mark;
            const heat = Math.max(0, 1 - (sim.time + resultAge - mark.at) / 0.46);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            const length = width * (1.45 + 0.34 * Math.sin(index * 2.31));
            const smudge = [[-width * 0.79, -width * 0.33], [width * 0.16, -width * 0.61], [length, -width * 0.17],
                [length * 0.68, width * 0.32], [width * 0.12, width * 0.50], [-width * 0.53, width * 0.23]];
            ctx.globalAlpha = alpha * 0.88;
            wdcPolygon(ctx, smudge, "#281a17");
            ctx.scale(0.87, 0.56);
            wdcPolygon(ctx, smudge, "#090606");
            if (heat > 0) {
                ctx.globalAlpha = heat * alpha * (options.flashReduction ? 0.50 : 0.82);
                wdcPolygon(ctx, [[-width * 0.31, -width * 0.11], [length * 0.71, -width * 0.27], [length * 0.42, width * 0.16]], "#ff9b47");
                if (!options.reducedMotion && index % 3 === 0) {
                    for (const side of [-1, 1]) {
                        wdcDisc(ctx, width * (0.9 + (1 - heat) * 3), width * (1 - heat) * side * 2, Math.max(0.9, width * 0.18 * heat), "#ffe0a0");
                    }
                }
            }
            ctx.restore();
        }
    }
}

function drawClassicActionProjectile(ctx, entity, time, options) {
    if (entity.kind === "classic-saber-throw") {
        drawClassicSaberBlade(ctx, classicThrownSaberBlade(entity, time), "#ff3d53", options, true);
        return;
    }
    const { x, y, radius: r } = entity;
    const color = "#a5f0ff";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(entity.angle);
    if (!options.reducedMotion) {
        const trail = ctx.createLinearGradient(-r * 4.4, 0, 0, 0);
        trail.addColorStop(0, "transparent");
        trail.addColorStop(1, color);
        ctx.globalAlpha = 0.72;
        wdcPolygon(ctx, [[-r * 4.4, 0], [r * 0.10, -r * 0.66], [r * 0.10, r * 0.66]], trail);
        ctx.globalAlpha = 1;
    }
    wdcPolygon(ctx, [[-r, r * 0.38], [-r * 0.63, -r * 0.70], [r * 1.26, -r * 0.18], [r * 0.27, r * 0.80]], color, "#f1ffff", r * 0.12);
    wdcPolygon(ctx, [[-r * 0.63, -r * 0.70], [r * 1.26, -r * 0.18], [-r * 0.15, r * 0.14]], "#f1ffff");
    ctx.restore();
}

function drawClassicActionTrail(ctx, fighter, time) {
    if (time < (fighter.classicHeldUntil || 0)) return false;
    const thrown = time < (fighter.classicWallThrow?.until || 0);
    const kicked = thrown || time < (fighter.classicCollisionKick?.until || 0);
    if (!kicked && time >= (fighter.classicPulseLaunchUntil || 0)) return false;
    const state = fighter.classicOmnitrix;
    const form = state?.phase === "alien" && CLASSIC_ALIENS[state.form];
    const dodge = time < (fighter.classicDodgeUntil || 0);
    const saberMove = fighter.classicSaberMove?.key;
    const leaping = saberMove === "force-vault" || saberMove === "saber-lunge";
    if (!(form && (state.rush || dodge)) && !leaping && !kicked) return false;
    const color = thrown ? "#ff906b" : leaping ? "#a4ff92" : form?.color || CLASS_DEFS[fighter.type].accent;
    const points = fighter.trail.slice(0, state?.form === "xlr8" ? 22 : 16).reverse();
    points.push(fighter);
    drawMotionStreak(ctx, points, fighter.radius * (state?.form === "xlr8" ? 0.62 : 0.93), color);
    drawClassicPulseEchoes(ctx, fighter, color);
    if (state?.form === "xlr8") {
        ctx.save();
        ctx.strokeStyle = "#a2efff";
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(1.5, fighter.radius * 0.065);
        for (let i = 1; i < points.length; i += 1) {
            const start = points[i - 1];
            const end = points[i];
            const distance = Math.hypot(end.x - start.x, end.y - start.y);
            if (distance < 0.5 || distance > fighter.radius * 2.6) continue;
            const offset = (end.x - start.x) / distance * fighter.radius * 0.53;
            const rise = (end.y - start.y) / distance * fighter.radius * 0.53;
            ctx.globalAlpha = i / points.length * 0.58;
            for (const side of [-1, 1]) {
                ctx.beginPath();
                ctx.moveTo(start.x + rise * side, start.y - offset * side);
                ctx.lineTo(end.x + rise * side, end.y - offset * side);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
    return true;
}

function drawClassicForceHand(ctx, fighter, angle, extension, gripping) {
    const r = fighter.radius;
    const palm = r * (0.87 + extension * 0.65);
    ctx.save();
    ctx.translate(fighter.x, fighter.y);
    ctx.rotate(angle);
    wdcPolygon(ctx, [[r * 0.68, -r * 0.20], [palm - r * 0.15, -r * 0.18],
        [palm + r * 0.16, -r * 0.28], [palm + r * 0.24, r * 0.19],
        [palm, r * 0.31], [r * 0.68, r * 0.26]], "#171521", "#9a759f", r * 0.061);
    for (const [index, splay] of [-0.28, -0.11, 0.07, 0.23].entries()) {
        const tip = r * (gripping ? 0.42 : 0.65) * (index === 0 || index === 3 ? 0.85 : 1);
        const y = r * splay;
        const curl = y * (gripping ? 0.59 : 1.53);
        wdcPolygon(ctx, [[palm + r * 0.04, y - r * 0.06], [palm + tip, curl - r * 0.055],
            [palm + tip + r * 0.10, curl + (gripping ? -y * 0.27 : r * 0.06)],
            [palm + r * 0.10, y + r * 0.08]], "#241c30", gripping ? "#d68dff" : "#8a7099", r * 0.036);
    }
    ctx.restore();
    return palm + r * 0.48;
}

function drawClassicForceGrip(ctx, fighter, sim, options) {
    const move = fighter.classicSaberMove;
    if (move.key !== "force-choke" || !["tell", "grip"].includes(move.phase)) return;
    const target = sim.fighters.find(({ id }) => id === move.targetId)
        || sim.classicEntities.find(({ id }) => id === move.targetId);
    if (!target?.alive) return;
    const gripping = move.phase === "grip" && target.classicHeldKind === "force-choke" && sim.time < (target.classicHeldUntil || 0);
    if (move.phase === "grip" && !gripping) return;
    const age = sim.time - move.at;
    const reach = gripping ? 0.98 + (options.reducedMotion ? 0 : 0.058 * Math.sin(age * 17)) : 1.56 + (0.35 - age);
    const angle = Math.atan2(target.y - fighter.y, target.x - fighter.x);
    const hand = drawClassicForceHand(ctx, fighter, angle, Math.min(1, age / 0.33), gripping);
    ctx.save();
    ctx.globalAlpha = gripping ? 0.81 : 0.41;
    ctx.strokeStyle = "#c287ff";
    ctx.lineWidth = Math.max(2, fighter.radius * 0.075);
    ctx.setLineDash([fighter.radius * 0.32, fighter.radius * 0.27]);
    ctx.lineDashOffset = options.reducedMotion ? 0 : -age * fighter.radius * 2.7;
    ctx.beginPath();
    ctx.moveTo(fighter.x + Math.cos(angle) * hand, fighter.y + Math.sin(angle) * hand);
    ctx.lineTo(target.x - Math.cos(angle) * target.radius * reach, target.y - Math.sin(angle) * target.radius * reach);
    ctx.stroke();
    ctx.setLineDash([]);
    for (const side of [-1, 1]) {
        const start = angle + side * Math.PI * 0.48;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius * (0.53 + reach * 0.66), start - 0.62, start + 0.62);
        ctx.stroke();
    }
    if (gripping) {
        const r = target.radius;
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "#efc5ff";
        ctx.font = `900 ${Math.max(12, r * 0.42)}px ${PIXEL_FONT}`;
        const labelRight = target.x < sim.arenaBounds.x + sim.arenaBounds.width * 0.5;
        ctx.textAlign = labelRight ? "left" : "right";
        ctx.textBaseline = "middle";
        ctx.fillText("STUNNED", target.x + r * (labelRight ? 1.54 : -1.54), target.y);
        for (const side of [-1, 1]) {
            const x = target.x + r * 1.10 * side;
            const y = target.y - r * 1.14;
            wdcPolygon(ctx, [[x - r * 0.17, y], [x, y - r * 0.12], [x + r * 0.17, y], [x, y + r * 0.12]], "#f3bcff");
        }
    }
    ctx.restore();
}

function drawClassicActionTell(ctx, fighter, time, options) {
    const { radius: r, classicOmnitrix: state } = fighter;
    const saber = fighter.classicSaberMove;
    if (saber?.key === "vader-sweep" && saber.phase === "tell") {
        const blade = classicSaberBlade(fighter, time);
        const charge = Math.min(1, (time - saber.at) / 0.47);
        ctx.save();
        ctx.strokeStyle = "#ff6167";
        ctx.globalAlpha = 0.26 + 0.54 * charge;
        ctx.lineWidth = Math.max(2, r * 0.069);
        ctx.beginPath();
        ctx.arc(fighter.x, fighter.y, r * 1.30, blade.angle - 0.34, blade.angle + 0.42);
        ctx.stroke();
        ctx.restore();
    }
    if (state?.phase === "transform" || (state?.phase === "alien" && state.attackAt !== null)) {
        const form = CLASSIC_ALIENS[state.form];
        const transform = state.phase === "transform";
        const p = transform ? Math.min(1, (time - state.at) / (state.until - state.at)) : 1 - Math.min(1, (state.attackAt - time) / 0.24);
        ctx.save();
        ctx.translate(fighter.x, fighter.y);
        ctx.rotate(options.reducedMotion ? 0 : (transform ? p * 1.45 : state.angle || 0));
        ctx.strokeStyle = transform ? "#a0ff5b" : form.color;
        ctx.globalAlpha = 0.52 + p * 0.43;
        ctx.lineWidth = Math.max(2, r * 0.084);
        const count = transform ? 10 : state.form === "four-arms" ? 4 : 3;
        for (let i = 0; i < count; i += 1) {
            ctx.rotate(TAU / count);
            const offset = r * (1.14 + 0.38 * (1 - p));
            ctx.beginPath();
            ctx.moveTo(offset, -r * 0.11);
            ctx.lineTo(offset + r * 0.24, 0);
            ctx.lineTo(offset, r * 0.11);
            ctx.stroke();
        }
        ctx.restore();
    }
    if (fighter.type === "frost-ball") {
        const packed = fighter.classicBounces % 3;
        const angle = options.reducedMotion ? 0 : time * 2.4;
        for (let i = 0; i < packed; i += 1) {
            const a = angle + i * Math.PI;
            const x = fighter.x + Math.cos(a) * r * 1.15;
            const y = fighter.y + Math.sin(a) * r * 1.15;
            wdcPolygon(ctx, [[x, y - r * 0.21], [x + r * 0.18, y], [x, y + r * 0.21], [x - r * 0.18, y]], "#c4f7ff", "#fff", r * 0.04);
        }
    }
}

function drawClassicActionBurst(ctx, effect, alpha, options) {
    const { cue, radius: r, color } = effect;
    const p = 1 - alpha;
    const snow = cue.startsWith("snow-");
    const spark = cue.endsWith("-hit") || cue.endsWith("-bank") || cue === "force-choke-tick";
    const dash = ["xlr8", "xlr8-dodge", "force-vault", "saber-lunge"].includes(cue);
    const crystal = cue.startsWith("diamond");
    const transform = cue === "omnitrix-transform";
    ctx.save();
    ctx.translate(effect.x, effect.y);
    ctx.rotate(effect.angle);
    ctx.globalAlpha = alpha * (options.flashReduction ? 0.63 : 0.88);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(1.4, r * 0.044 * (0.65 + alpha));
    if (cue === "cannonbolt-exit" || cue === "cannonbolt-enter") {
        const side = cue === "cannonbolt-exit" ? -1 : 1;
        ctx.lineWidth = Math.max(2, r * 0.045 * alpha);
        for (let i = 0; i < 3; i += 1) {
            const width = r * (0.52 + i * 0.17 + p * 0.30);
            ctx.beginPath();
            ctx.ellipse(side * r * p * 0.36, 0, width * 0.46, width, 0, 0, TAU);
            ctx.stroke();
        }
    } else if (cue === "lateral-clash") {
        for (const side of [-1, 1]) {
            const width = r * (0.44 + p * 0.83) * side;
            ctx.beginPath();
            ctx.moveTo(width * 0.69, -r * 0.32 * alpha);
            ctx.quadraticCurveTo(width * 1.27, 0, width * 0.69, r * 0.32 * alpha);
            ctx.stroke();
        }
    } else if (dash) {
        for (const lane of [-1, 0, 1]) {
            const shift = lane * r * 0.31;
            ctx.beginPath();
            ctx.moveTo(-r * (0.83 + p), shift);
            ctx.lineTo(r * (0.46 + p * 0.51), shift);
            ctx.lineTo(r * (0.64 + p * 0.51), shift * 0.51);
            ctx.stroke();
        }
    } else if (transform) {
        for (let i = 0; i < 8; i += 1) {
            ctx.rotate(TAU / 8);
            const distance = r * (0.40 + p * 0.85);
            wdcPolygon(ctx, [[distance, 0], [distance + r * 0.39, -r * 0.15], [distance + r * 0.25, r * 0.07]], color);
        }
    } else if (snow || crystal || spark) {
        const count = cue === "snow-release" ? 10 : spark ? 6 : 7;
        const angle = cue === "snow-release" ? 1.72 : TAU;
        for (let i = 0; i < count; i += 1) {
            const a = angle * (i / count - 0.5);
            const distance = r * (0.36 + p * (0.91 + (i % 3) * 0.20));
            const x = Math.cos(a) * distance;
            const y = Math.sin(a) * distance;
            const size = r * (0.068 + (i % 2) * 0.043) * (0.74 + alpha);
            wdcPolygon(ctx, [[x - size, y], [x, y - size * 0.8], [x + size * 1.75, y + size * 0.18], [x, y + size]], color);
        }
    } else {
        const sides = cue === "four-arms" ? 10 : 5;
        const size = r * (cue === "four-arms" ? 1 + p * 0.14 : 0.49 + p * 0.75);
        ctx.beginPath();
        for (let i = 0; i <= sides; i += 1) {
            const a = i * TAU / sides;
            const edge = size * (i % 2 ? 0.89 : 1);
            ctx.lineTo(Math.cos(a) * edge, Math.sin(a) * edge);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawClassicFlameBlast(ctx, pose, time, options) {
    const length = Math.hypot(pose.x2 - pose.x1, pose.y2 - pose.y1);
    if (length < 1) return;
    const flicker = options.reducedMotion ? 0 : time * 41;
    ctx.save();
    ctx.translate(pose.x1, pose.y1);
    ctx.rotate(pose.angle);
    const glow = ctx.createLinearGradient(0, 0, length, 0);
    glow.addColorStop(0, "#fff3a7");
    glow.addColorStop(0.23, "#ffb632");
    glow.addColorStop(0.67, "#ff692b");
    glow.addColorStop(1, "#cf2d10");
    for (const [scale, color, alpha] of [[1, glow, 0.75], [0.65, "#ff9924", 0.79], [0.29, "#fff2a5", 0.96]]) {
        ctx.globalAlpha = alpha * (options.flashReduction ? 0.82 : 1);
        const points = [];
        for (const side of [-1, 1]) {
            for (let index = 0; index <= 17; index += 1) {
                const step = (side === -1 ? index : 17 - index) / 17;
                const fan = pose.near + (pose.far - pose.near) * step;
                const taper = step > 0.89 ? 1 - (step - 0.89) * 6 : 1;
                const edge = 0.77 + 0.16 * Math.sin(flicker - step * 22 + side * 0.78) + 0.09 * Math.sin(step * 56 - flicker * 1.43);
                points.push([length * step, fan * taper * edge * side * scale]);
            }
        }
        wdcPolygon(ctx, points, color);
    }
    ctx.restore();
}

function drawClassicTornado(ctx, fighter, target, rush, time, options) {
    const r = fighter.radius * 2.02 + target.radius * 0.76;
    const progress = Math.min(1, (time - rush.spunAt) / 0.90);
    const swirl = options.reducedMotion ? 0 : (time - rush.spunAt) * rush.turn * 14;
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.lineCap = "round";
    for (let band = 0; band < 4; band += 1) {
        const distance = r * (0.56 + band * 0.17);
        const center = r * (0.67 - band * 0.36);
        const length = Math.PI * (1.18 + 0.12 * Math.sin(progress * Math.PI));
        const start = swirl + band * 1.36;
        ctx.globalAlpha = Math.min(0.89, 0.42 + band * 0.14) * (options.flashReduction ? 0.77 : 1);
        ctx.strokeStyle = band % 2 ? "#57dcff" : "#c5f6ff";
        ctx.lineWidth = r * (0.025 + band * 0.009);
        ctx.beginPath();
        ctx.ellipse(0, center, distance, distance * 0.31, -0.14, start, start + length);
        ctx.stroke();
    }
    ctx.restore();
}

function drawClassicAlienStage(ctx, fighter, sim, options) {
    const state = fighter.classicOmnitrix;
    if (state?.phase !== "alien") return;
    if (state.flame?.pose) drawClassicFlameBlast(ctx, state.flame.pose, sim.time, options);
    const rush = state.rush;
    if (state.form === "xlr8" && rush?.phase === "tornado") {
        const target = sim.fighters.find(({ id }) => id === rush.targetId)
            || sim.classicEntities.find(({ id }) => id === rush.targetId);
        if (target?.alive) drawClassicTornado(ctx, fighter, target, rush, sim.time, options);
    }
    if (state.form === "diamondhead" && (rush || state.attackAt !== null)) {
        const r = fighter.radius;
        const angle = rush ? Math.atan2(fighter.vy, fighter.vx) : state.angle;
        const extension = rush ? 1 : Math.max(0, (sim.time - state.attackStartedAt) / (state.attackAt - state.attackStartedAt));
        const tip = r * (1.10 + extension * 0.61);
        ctx.save();
        ctx.translate(fighter.x, fighter.y);
        ctx.rotate(angle);
        wdcPolygon(ctx, [[r * 0.51, -r * 0.97], [tip, -r * 0.28], [tip + r * 0.17, 0], [tip, r * 0.28], [r * 0.51, r * 0.97]],
            "#2c9d8a", "#afffed", r * 0.072);
        wdcPolygon(ctx, [[r * 0.76, 0], [tip, -r * 0.28], [tip + r * 0.17, 0], [tip, r * 0.28]], "#c5fff1");
        ctx.restore();
    }
}

function drawClassicPowerLane(ctx, line, profile, warning, options, index = 0) {
    const { x1, y1, x2, y2, width } = line;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    if (length < 1) return;
    const color = profile.layout === "cross" && index % 2 ? "#fff0bb" : profile.color;
    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(Math.atan2(dy, dx));
    ctx.strokeStyle = color;
    if (line.socket) {
        if (profile.layout === "relay") {
            wdcDisc(ctx, 0, 0, width * 0.44, "#b7793b", "#ffe7a1", width * 0.095);
            wdcPolygon(ctx, [[-width * .22, 0], [0, -width * .30], [width * .22, 0], [0, width * .30]], "#fff1be");
        } else {
            wdcPolygon(ctx, [[-width * .48, -width * .45], [width * .62, -width * .32],
                [width * .76, width * .32], [-width * .48, width * .45]], "#533747", color, width * .065);
        }
    }
    if (warning) {
        ctx.globalAlpha *= 0.58;
        ctx.lineWidth = Math.max(1.8, width * .068);
        ctx.setLineDash([width * .42, width * .38]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(length, 0);
        ctx.stroke();
    } else if (line.glow > 0) {
        const alpha = ctx.globalAlpha * line.glow * (options.flashReduction ? 0.74 : 1);
        ctx.globalAlpha = alpha * .22;
        ctx.fillStyle = color;
        ctx.fillRect(0, -width * .5, length, width);
        ctx.globalAlpha = alpha * .77;
        ctx.fillRect(0, -width * .23, length, width * .46);
        ctx.fillStyle = "#fff9e8";
        ctx.globalAlpha = alpha;
        ctx.fillRect(0, -width * .063, length, Math.max(2.2, width * .126));
        if (!options.reducedMotion) {
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1.5, width * .066);
            ctx.globalAlpha = alpha * .78;
            const phase = (line.age || 0) * 205;
            for (let position = 20 + (phase % 54); position < length - 20; position += 54) {
                ctx.beginPath();
                ctx.moveTo(position - width * .19, -width * .56);
                ctx.lineTo(position + width * .25, -width * .23);
                ctx.moveTo(position - width * .19, width * .56);
                ctx.lineTo(position + width * .25, width * .23);
                ctx.stroke();
            }
        }
    }
    ctx.restore();
}

function drawClassicPowerRing(ctx, ring, profile, warning, options, progress) {
    const { x, y, radius, angle, arc, width } = ring;
    if (radius <= 0) return;
    const alpha = ctx.globalAlpha;
    const color = profile.color;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const start = -arc / 2;
    const end = arc / 2;
    const solar = profile.layout === "solar";
    if (warning) {
        ctx.setLineDash([Math.max(7, radius * .07), Math.max(4, radius * .034)]);
        ctx.lineWidth = Math.max(2, width * .08);
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, radius, start, end);
        ctx.stroke();
    } else {
        if (arc < TAU) {
            const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius + width / 2);
            glow.addColorStop(0, "transparent");
            glow.addColorStop(.76, "transparent");
            glow.addColorStop(1, color);
            ctx.fillStyle = glow;
            ctx.globalAlpha = alpha * .46;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius + width / 2, start, end);
            ctx.closePath();
            ctx.fill();
        }
        const motion = options.reducedMotion ? 0 : progress;
        ctx.globalAlpha = alpha * (options.flashReduction ? .55 : .82);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(3, width * .48);
        ctx.beginPath();
        ctx.arc(0, 0, radius, start, end);
        ctx.stroke();
        ctx.globalAlpha = alpha * .94;
        ctx.strokeStyle = solar ? "#fff6c7" : "#fef5e1";
        ctx.lineWidth = Math.max(2, width * .14);
        ctx.beginPath();
        ctx.arc(0, 0, radius, start, end);
        ctx.stroke();
        if (!options.reducedMotion) {
            const count = solar ? 24 : arc < TAU ? 10 : 14;
            ctx.globalAlpha = alpha * .77;
            for (let i = 0; i < count; i += 1) {
                const at = start + arc * (i + .5) / count;
                const flare = width * (.32 + .41 * Math.max(0, Math.sin(i * 2.4 - motion * 16)));
                const span = Math.min(.14, width / Math.max(radius, 1));
                const point = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
                wdcPolygon(ctx, [point(at - span, radius), point(at + span * .52, radius + flare), point(at + span, radius)],
                    solar && i % 3 === 0 ? "#ffdd82" : color);
            }
        }
    }
    ctx.restore();
}

function drawClassicPowerZone(ctx, zone, profile, warning, options) {
    const { x, y, radius, sourceX, sourceY } = zone;
    ctx.save();
    const alpha = ctx.globalAlpha;
    if (!warning && zone.glow <= 0) {
        ctx.restore();
        return;
    }
    const progress = warning ? 0 : Math.min(1, (zone.age || 0) / .27);
    const bright = warning ? .60 : zone.glow * (options.flashReduction ? .72 : 1);
    if (sourceX !== undefined) {
        ctx.globalAlpha = alpha * (warning ? .25 : bright);
        ctx.strokeStyle = profile.color;
        ctx.lineWidth = warning ? 2.2 : Math.max(2, radius * .095 * (1 - progress * .6));
        ctx.setLineDash(warning ? [10, 10] : []);
        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    ctx.translate(x, y);
    ctx.setLineDash(warning ? [radius * .19, radius * .09] : []);
    ctx.strokeStyle = profile.color;
    ctx.lineWidth = Math.max(2, radius * (warning ? .028 : .071));
    ctx.globalAlpha = alpha * bright;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    if (warning) {
        for (const sign of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(radius * .73 * sign, 0);
            ctx.lineTo(radius * .93 * sign, 0);
            ctx.moveTo(0, radius * .73 * sign);
            ctx.lineTo(0, radius * .93 * sign);
            ctx.stroke();
        }
    } else {
        ctx.globalAlpha = alpha * bright * .25;
        wdcDisc(ctx, 0, 0, radius, profile.color);
        ctx.globalAlpha = alpha * bright * .86;
        ctx.strokeStyle = "#fff5de";
        ctx.beginPath();
        ctx.arc(0, 0, radius * (.24 + progress * .76), 0, TAU);
        ctx.stroke();
    }
    ctx.restore();
}

function drawClassicPowerWell(ctx, well, profile, warning, progress, options) {
    const { x, y, radius, angle = 0 } = well;
    const gravity = profile.gravity;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(options.reducedMotion ? angle : angle + progress * 3.6);
    if (gravity) {
        const halo = ctx.createRadialGradient(0, 0, radius * .40, 0, 0, radius * 1.24);
        halo.addColorStop(0, "#05020c");
        halo.addColorStop(.74, "#44236a");
        halo.addColorStop(1, "transparent");
        wdcDisc(ctx, 0, 0, radius * 1.24, halo);
        wdcDisc(ctx, 0, 0, radius * .76, "#05020b", "#aa70fd", Math.max(2, radius * .035));
    } else {
        ctx.globalAlpha *= warning ? .63 : .9;
        wdcDisc(ctx, 0, 0, radius, "#15131d", profile.color, Math.max(2, radius * .084));
    }
    ctx.strokeStyle = profile.color;
    ctx.lineWidth = Math.max(2, radius * (gravity ? .069 : .10));
    for (const direction of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * (gravity ? 1.27 : .90), radius * (gravity ? .40 : .43), direction * .29, 0, Math.PI * 1.45);
        ctx.stroke();
    }
    ctx.restore();
}

function drawClassicPowerField(ctx, shape, profile, time, options) {
    ctx.save();
    ctx.translate(shape.x, shape.y);
    const rotation = options.reducedMotion ? 0 : time * (profile.layout === "swirl" ? 5.6 : 2.1);
    ctx.rotate(rotation);
    ctx.strokeStyle = profile.color;
    ctx.lineWidth = Math.max(2, shape.radius * .031);
    const alpha = ctx.globalAlpha;
    for (let i = 0; i < 3; i += 1) {
        ctx.globalAlpha = alpha * (.34 + i * .15);
        ctx.beginPath();
        ctx.arc(0, 0, shape.radius * (.48 + i * .24), i * 1.8, i * 1.8 + 4.65);
        ctx.stroke();
    }
    ctx.restore();
}

function drawClassicPowerRush(ctx, fighter, power, profile, warning, options) {
    const r = fighter.radius;
    if (warning) {
        const speed = fighter.baselineSpeed || Math.hypot(fighter.vx, fighter.vy);
        const reach = Math.min(r * profile.size, speed * (profile.speed || 2.85) * profile.duration);
        ctx.save();
        ctx.translate(fighter.x, fighter.y);
        ctx.rotate(power.angle);
        ctx.strokeStyle = profile.color;
        ctx.lineWidth = Math.max(2, r * .06);
        for (let i = 1; i <= 4; i += 1) {
            const x = reach * i / 5;
            ctx.beginPath();
            ctx.moveTo(x - r * .32, -r * .43);
            ctx.lineTo(x, 0);
            ctx.lineTo(x - r * .32, r * .43);
            ctx.stroke();
        }
        ctx.restore();
        return;
    }
    const path = power.mode === "evade" ? [power.center, ...power.path] : power.path;
    if (!options.reducedMotion) drawMotionStreak(ctx, path, r * (power.mode === "evade" ? .76 : 1.16), profile.color);
    ctx.save();
    ctx.strokeStyle = profile.color;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const alpha = ctx.globalAlpha;
    for (let i = 1; i < path.length; i += 1) {
        const a = path[i - 1];
        const b = path[i];
        const width = i / path.length;
        ctx.globalAlpha = alpha * width;
        ctx.lineWidth = Math.max(2, r * .13 * width);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }
    if (power.phase === "active") {
        const angle = Math.atan2(fighter.vy, fighter.vx);
        ctx.globalAlpha = alpha * .86;
        ctx.translate(fighter.x, fighter.y);
        ctx.rotate(angle);
        const start = power.mode === "evade" ? -1.3 : -.84;
        wdcPolygon(ctx, [[r * start, -r * .73], [r * 1.33, 0], [r * start, r * .73], [r * .54, 0]], profile.color);
    }
    ctx.restore();
}

function drawClassicPowerImpact(ctx, effect, alpha, options) {
    const { x, y, radius, angle, color } = effect;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha * (options.flashReduction ? .64 : .92);
    const burst = 1 - alpha;
    const count = options.reducedMotion ? 5 : 12;
    for (let i = 0; i < count; i += 1) {
        ctx.rotate(TAU / count);
        const distance = radius * (.40 + burst * (1.76 + (i % 3) * .27));
        const chip = radius * (.12 + (i % 3) * .046) * (.70 + alpha);
        wdcPolygon(ctx, [[distance - chip, 0], [distance, -chip * .51], [distance + chip * 2.1, 0], [distance, chip * .51]],
            i % 3 === 0 ? "#fff7d4" : color);
    }
    ctx.restore();
}

function drawClassicPowerStage(ctx, fighter, sim, options) {
    const power = fighter.classicPowerMove;
    const time = sim.time + (options.classicResultAge || 0);
    if (!power || power.phase === "spent" || time >= power.recoverUntil) return;
    const profile = CLASSIC_POWER_MOVES[fighter.type];
    const warning = power.phase === "charge" && time < power.endAt;
    const fading = time >= power.endAt;
    const phaseStart = warning ? power.startedAt : fading ? power.endAt : power.activeAt;
    const phaseEnd = warning ? power.activeAt : fading ? power.recoverUntil : power.endAt;
    const progress = Math.max(0, Math.min(1, (time - phaseStart) / Math.max(.001, phaseEnd - phaseStart)));
    const r = fighter.radius;
    ctx.save();
    ctx.globalAlpha = fading ? (1 - progress) * .58 : warning ? .58 + progress * .36 : 1;
    const pose = warning ? power.blueprint : power.pose || [];
    if (profile.layout === "relay" && !warning && !fading) {
        const relay = pose.find(({ age }) => age >= 0 && age < 0.14);
        if (relay) {
            ctx.save();
            ctx.globalAlpha *= (1 - relay.age / 0.14) * 0.78;
            ctx.strokeStyle = "#ffecc6";
            ctx.lineWidth = r * 0.07;
            ctx.beginPath();
            ctx.moveTo(fighter.x, fighter.y);
            ctx.lineTo(relay.x1, relay.y1);
            ctx.stroke();
            ctx.restore();
        }
    }
    for (const [index, shape] of pose.entries()) {
        if (shape.shape === "lane" && profile.kind !== "rush") drawClassicPowerLane(ctx, shape, profile, warning, options, index);
        if (shape.shape === "zone") drawClassicPowerZone(ctx, shape, profile, warning, options);
        if (shape.shape === "ring") drawClassicPowerRing(ctx, shape, profile, false, options, progress);
        if (shape.shape === "orbiter") drawClassicPowerWell(ctx, shape, profile, false, progress, options);
        if (shape.shape === "field") drawClassicPowerField(ctx, shape, profile, time, options);
    }
    if (warning && profile.kind === "orbit") {
        for (const shape of power.pose || []) drawClassicPowerWell(ctx, shape, profile, true, progress, options);
    }
    if (warning && ["ring", "guard", "field"].includes(profile.kind)) {
        const radius = r * (profile.layout === "inward" ? profile.size : 1.64 + progress * .56);
        drawClassicPowerRing(ctx, { ...power.center, radius, width: r * .6, angle: power.angle, arc: profile.layout === "cone" ? 2.16 : TAU },
            profile, true, options, progress);
    }
    if (profile.kind === "rush") drawClassicPowerRush(ctx, fighter, power, profile, warning, options);
    if (profile.motif) {
        const center = profile.kind === "rush" ? fighter : power.center;
        drawClassicLegacyPowerMotif(ctx, {
            motif: profile.motif, color: profile.color, x: center.x, y: center.y, radius: r, angle: power.angle,
            phase: power.phase, progress, reducedMotion: options.reducedMotion, flashReduction: options.flashReduction,
            dark: options.classicBlackTheme,
        });
    }
    if (profile.gravity && !warning && power.pose?.length > 1) {
        ctx.globalAlpha = fading ? (1 - progress) * .55 : .61;
        ctx.strokeStyle = "#bd8aff";
        ctx.lineWidth = Math.max(2, r * .075);
        ctx.beginPath();
        ctx.moveTo(power.pose[0].x, power.pose[0].y);
        ctx.quadraticCurveTo(power.center.x - r * .75, power.center.y + r * .75, power.pose[1].x, power.pose[1].y);
        ctx.stroke();
    }
    ctx.restore();
}

function drawClassicActionStage(ctx, sim, options) {
    ctx.save();
    clipClassicPulseArena(ctx, sim);
    const resultAge = options.classicResultAge || 0;
    for (const effect of sim.effects) {
        const alpha = (effect.life - resultAge) / effect.maxLife;
        if (alpha <= 0) continue;
        if (effect.kind === "classic-saber-scar") drawClassicSaberScar(ctx, effect, alpha);
        else if (effect.kind === "classic-action-burst") drawClassicActionBurst(ctx, effect, alpha, options);
        else if (effect.kind === "classic-power-impact") drawClassicPowerImpact(ctx, effect, alpha, options);
    }
    for (const fighter of sim.fighters) {
        if (!fighter.alive) continue;
        drawClassicPowerStage(ctx, fighter, sim, options);
        drawClassicAlienStage(ctx, fighter, sim, options);
        drawClassicActionTell(ctx, fighter, sim.time, options);
        if (fighter.type !== "darth-vader" && fighter.type !== "luke-skywalker") continue;
        const thrown = sim.classicEntities.some((entity) => entity.kind === "classic-saber-throw" && entity.ownerId === fighter.id && entity.expiresAt > sim.time);
        if (!thrown) drawHeldClassicSaber(ctx, fighter, classicSaberBlade(fighter, sim.time), fighter.type === "darth-vader" ? "#ff3b52" : "#70ff75", options);
        if (fighter.classicSaberMove) drawClassicForceGrip(ctx, fighter, sim, options);
    }
    ctx.restore();
}

export function drawClassicCannonOutsideArena(ctx, sim, options) {
    const outside = (sim.fighters || []).filter((fighter) => fighter.alive && fighter.classicCannonOutside);
    if (!outside.length) return;
    for (const fighter of outside) {
        ctx.save();
        ctx.translate(fighter.x, fighter.y);
        drawClassicActionBody(ctx, fighter, sim.time, options);
        ctx.font = `900 ${fighter.radius * 0.70}px ${CLASSIC_NUMBER_FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = Math.max(3, fighter.radius * 0.12);
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#050505";
        ctx.fillStyle = "#fff";
        const label = String(Math.ceil(fighter.health));
        ctx.strokeText(label, 0, 1);
        ctx.fillText(label, 0, 1);
        ctx.restore();
    }
}

const CLASSIC_BODY_COLORS = Object.freeze({
    "hive-ball": ["#4f2a13", "#fbbf3e"],
    "frost-ball": ["#529fcd", "#defaff"],
    boxer: ["#8c1521", "#ff624e"],
    monster: ["#19382a", "#7fd565"],
    artist: ["#462748", "#ff9d66"],
    fairy: ["#4d287a", "#e6b8fc"],
    train: ["#222c37", "#f2bd75"],
});

const CLASSIC_ARTIST_INKS = Object.freeze({
    "artist-monster": "#6de3a0",
    "artist-fairy": "#e397ff",
    "artist-soldier": "#ffc070",
});

function classicSixSidedMark(ctx, x, y, radius, color, rim) {
    const points = Array.from({ length: 6 }, (_, index) => {
        const angle = index * TAU / 6;
        return [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius];
    });
    wdcPolygon(ctx, points, color, rim, radius * 0.13);
}

function drawClassicFoundryBody(ctx, fighter, time, reducedMotion) {
    const { radius, type } = fighter;
    const [fill, accent] = CLASSIC_BODY_COLORS[type];
    ctx.save();
    ctx.scale(radius, radius);
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, TAU);
    ctx.clip();
    wdcDisc(ctx, 0, 0, 1, fill);
    if (type === "hive-ball") {
        ctx.rotate(-0.19);
        ctx.fillStyle = "#d4821b";
        ctx.fillRect(-1, -.61, 2, .51);
        ctx.fillRect(-1, .17, 2, .45);
        for (const [x, y] of [[-.70, -.31], [-.44, -.31], [-.57, -.09], [.48, .28], [.74, .28], [.61, .50]]) {
            classicSixSidedMark(ctx, x, y, .16, "#edaa29", "#ffd86b");
        }
        wdcPolygon(ctx, [[-.30, -.73], [.23, -.73], [.40, -.61], [.23, -.48], [-.30, -.48], [-.43, -.61]], "#362013", accent, .039);
        pulseLine(ctx, -.17, -.605, .16, -.605, accent, .038);
    } else if (type === "frost-ball") {
        if (!reducedMotion) ctx.rotate(time * .66);
        wdcPolygon(ctx, [[-.92, -.36], [-.45, -.86], [.37, -.98], [.75, -.67], [.34, -.11], [-.43, -.14]], "#d7f8ff");
        wdcPolygon(ctx, [[.92, -.45], [.84, .64], [.25, .97], [-.32, .81], [.20, .22]], "#6ed7f2");
        wdcPolygon(ctx, [[-.85, -.20], [-.45, -.13], [-.39, .35], [-.74, .67], [-1, .21]], "#8ddcf2");
        for (let index = 0; index < 6; index += 1) {
            const angle = index * TAU / 6;
            const x = Math.cos(angle);
            const y = Math.sin(angle);
            pulseLine(ctx, x * .63, y * .63, x * .84, y * .84, "#f2feff", .051);
            pulseLine(ctx, x * .72, y * .72, x * .78 - y * .10, y * .78 + x * .10, "#f2feff", .038);
            pulseLine(ctx, x * .72, y * .72, x * .78 + y * .10, y * .78 - x * .10, "#f2feff", .038);
        }
    } else if (type === "boxer") {
        wdcPolygon(ctx, [[-.97, -.47], [-.63, -.72], [.61, -.72], [.97, -.49], [.87, -.34], [-.90, -.34]], "#ed4f43");
        wdcPolygon(ctx, [[-.89, -.68], [-.56, -.81], [.58, -.80], [.91, -.66], [.78, -.51], [-.78, -.51]], "#ffddd1");
        wdcPolygon(ctx, [[-.95, .57], [-.53, .67], [.60, .66], [.94, .51], [.93, .84], [-.93, .86]], "#4b1427");
        for (let index = 0; index < 7; index += 1) {
            const x = -.55 + index * .18;
            pulseLine(ctx, x, .69, x + .045, .79, "#fdb297", .029);
        }
    } else if (type === "monster") {
        wdcPolygon(ctx, [[-.96, -.41], [-.70, -.76], [-.39, -.81], [-.20, -.43], [-.60, -.54], [-.94, -.22]], "#74ac56");
        wdcPolygon(ctx, [[.98, -.42], [.64, -.79], [.34, -.74], [.24, -.42], [.58, -.56], [.91, -.22]], "#90d66f");
        wdcPolygon(ctx, [[-.82, .41], [-.56, .53], [.55, .52], [.85, .36], [.71, .77], [0, .86], [-.73, .72]], "#18191d");
        for (const [x, y] of [[-.62, .50], [-.35, .61], [.38, .61], [.62, .49]]) {
            wdcPolygon(ctx, [[x - .09, y], [x + .105, y], [x + .02, y + .21]], "#e4e6b0");
        }
        pulseLine(ctx, -.81, -.16, -.65, .17, "#badf7c", .047);
        pulseLine(ctx, .81, -.12, .67, .21, "#badf7c", .045);
    } else if (type === "artist") {
        wdcPolygon(ctx, [[-.96, .19], [-.91, -.52], [-.46, -.88], [.03, -.94], [.68, -.72], [.83, -.37],
            [.53, -.24], [.31, -.44], [-.25, -.54], [-.48, -.28], [-.49, .11], [-.75, .37]], "#8c4d66");
        for (const [x, y, color] of [[-.62, -.42, "#75dccb"], [-.23, -.71, "#ff9e5d"], [.23, -.67, "#f9d278"],
            [.63, -.46, "#d18bfc"], [.67, .41, "#e76f82"], [.31, .70, "#4da8df"], [-.22, .69, "#aee88c"]]) {
            wdcDisc(ctx, x, y, .139, color, "#1d1424", .027);
            wdcDisc(ctx, x - .039, y - .039, .043, "#ffffff68");
        }
    } else if (type === "fairy") {
        wdcPolygon(ctx, [[-.91, .35], [-.88, -.32], [-.47, -.76], [-.08, -.87], [-.32, -.44], [-.52, .24], [-.26, .76]],
            "#9065c8");
        wdcPolygon(ctx, [[.92, .44], [.83, -.44], [.45, -.74], [.28, -.35], [.57, .05], [.33, .72]], "#754ab0");
        for (const side of [-1, 1]) {
            classicFourPointStar(ctx, side * .67, .20, .13, "#f4deff");
            classicFourPointStar(ctx, side * .37, -.65, .085, "#ffe6a3");
        }
    } else if (type === "train") {
        wdcPolygon(ctx, [[-.95, .42], [-.70, -.74], [.70, -.74], [.94, .40], [.59, .90], [-.61, .90]],
            "#3e5060", "#a57243", .044);
        ctx.fillStyle = "#b9453d";
        ctx.fillRect(-1, .40, 2, .29);
        for (let index = 0; index < 3; index += 1) {
            const ready = index < (fighter.classicBounces || 0) % 3;
            wdcDisc(ctx, -.38 + index * .38, -.62, .111, ready ? "#ffe6a2" : "#342f2b", accent, .023);
        }
        for (const side of [-1, 1]) pulseLine(ctx, side * .70, -.35, side * .62, .39, "#a5b7be", .075);
    }
    pulseRing(ctx, 0, 0, .969, accent, .063);
    ctx.restore();
}

function classicFourPointStar(ctx, x, y, size, color) {
    wdcPolygon(ctx, [[x, y - size], [x + size * .26, y - size * .26], [x + size, y],
        [x + size * .26, y + size * .26], [x, y + size], [x - size * .26, y + size * .26],
        [x - size, y], [x - size * .26, y - size * .26]], color);
}

function drawClassicFoundryBee(ctx, radius, time, reducedMotion) {
    ctx.save();
    ctx.scale(radius, radius);
    const flap = reducedMotion ? .82 : .48 + Math.abs(Math.sin(time * 29)) * .62;
    for (const side of [-1, 1]) {
        wdcPolygon(ctx, [[-.20, side * .13], [-.62, side * .62 * flap], [-.35, side * 1.08 * flap],
            [.11, side * .88 * flap], [.30, side * .29]], "#e6f4ffd9", "#9cc7e6", .062);
    }
    wdcPolygon(ctx, [[-1.10, 0], [-.70, -.30], [-.37, -.53], [.37, -.55], [.81, -.31], [.99, 0],
        [.81, .32], [.37, .54], [-.40, .51], [-.72, .32]], "#f0b93d", "#48271a", .10);
    for (const stripe of [-.52, -.15]) {
        wdcPolygon(ctx, [[stripe, -.44], [stripe + .19, -.51], [stripe + .29, .46], [stripe + .07, .50]], "#44271c");
    }
    wdcDisc(ctx, .55, -.16, .118, "#271a16");
    wdcDisc(ctx, .59, -.19, .046, "#fff7cd");
    wdcPolygon(ctx, [[-.87, -.14], [-1.24, 0], [-.87, .15]], "#c88c4a");
    ctx.restore();
}

function drawClassicFoundryFairy(ctx, fighter, radius, targetAngle, time, reducedMotion) {
    const casting = time < (fighter.classicAbilityActiveUntil || 0);
    const flap = reducedMotion ? .92 : .82 + Math.sin(time * (casting ? 23 : 15)) * .16;
    ctx.save();
    ctx.scale(radius, radius);
    for (const side of [-1, 1]) {
        wdcPolygon(ctx, [[side * .76, -.12], [side * 1.02, -.71 * flap], [side * 1.48, -.93 * flap],
            [side * 1.74, -.70 * flap], [side * 1.55, -.14], [side * 1.24, .14], [side * 1.46, .55 * flap],
            [side * 1.22, .73 * flap], [side * .87, .43]], "#b891f0b8", "#f2d5ff", .045);
        pulseLine(ctx, side * 1.47, -.66 * flap, side * .92, .20, "#e9d7ffb5", .028);
    }
    wdcPolygon(ctx, [[-.35, -.91], [-.27, -1.18], [-.09, -1.04], [0, -1.30], [.12, -1.04], [.31, -1.18],
        [.38, -.91]], "#f1cb78", "#5d3869", .039);
    const angle = casting && Number.isFinite(fighter.classicFairyCastAngle) ? fighter.classicFairyCastAngle : targetAngle;
    ctx.rotate(angle);
    pulseLine(ctx, .82, .14, 1.63, .14, "#5b3354", .15);
    pulseLine(ctx, .82, .14, 1.63, .14, "#efc78b", .082);
    classicFourPointStar(ctx, 1.68, .14, casting ? .34 : .24, "#fff1c1");
    if (casting) pulseRing(ctx, 1.68, .14, .36 + .10 * Math.sin(time * 21), "#ebc9ff", .029);
    ctx.restore();
}

function drawClassicPaintStroke(ctx, entity, radius, time) {
    const color = CLASSIC_ARTIST_INKS[entity.drawingKind] || "#ffc070";
    const progress = Math.max(0, Math.min(1, entity.drawingProgress));
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = radius * .19;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.64, -.8 * Math.PI, -.8 * Math.PI + progress * TAU);
    ctx.stroke();
    for (let index = 0; index < 6; index += 1) {
        const angle = -.8 * Math.PI + progress * TAU - index * .21;
        const spread = radius * (1.68 + index * .07);
        wdcDisc(ctx, Math.cos(angle) * spread, Math.sin(angle) * spread,
            radius * (.093 - index * .009) * (.90 + .10 * Math.sin(time * 15 + index)), color);
    }
    ctx.restore();
}

function drawClassicFoundryPunchWindup(ctx, fighter, radius, time, monster) {
    if (fighter.classicPunchPhase !== "retract" && fighter.classicPunchPhase !== "impact") return;
    const color = monster ? "#9ee582" : "#ffd2ad";
    const offset = time - fighter.classicPunchStartedAt;
    const phase = fighter.classicPunchPhase;
    ctx.save();
    ctx.rotate(fighter.classicPunchAngle);
    ctx.globalAlpha *= phase === "impact" ? .60 : .42;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
        ctx.strokeStyle = color;
        ctx.lineWidth = radius * (monster ? .066 : .042);
        ctx.beginPath();
        ctx.arc(0, 0, radius * (1.14 + (phase === "impact" ? offset * .78 : 0)), side * .78 - .34, side * .78 + .34);
        ctx.stroke();
        if (monster) {
            const x = radius * .96;
            const y = side * radius * .94;
            wdcPolygon(ctx, [[x, y], [x * 1.47, y * .94], [x * 1.25, y * 1.33]], color);
        }
    }
    ctx.restore();
}

function drawClassicFoundryMonsterGloves(ctx, fighter, angle) {
    for (const glove of fighter.classicPunchGloves) {
        const x = (glove.hitX1 + glove.hitX2) / 2 - fighter.x;
        const y = (glove.hitY1 + glove.hitY2) / 2 - fighter.y;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(glove.visualLength, glove.visualWidth);
        const shell = glove.active ? "#739a51" : "#527748";
        wdcPolygon(ctx, [[-.49, -.27], [-.31, -.44], [.12, -.48], [.40, -.37], [.49, -.22],
            [.48, .34], [.26, .46], [-.20, .47], [-.47, .29]], shell, "#222b1f", .075);
        wdcPolygon(ctx, [[-.45, -.26], [-.28, -.34], [-.23, .41], [-.45, .27]], "#432845", "#9d6295", .038);
        for (const ridge of [-.30, -.06, .19]) {
            wdcPolygon(ctx, [[.20, ridge - .07], [.41, ridge - .06], [.46, ridge + .09],
                [.25, ridge + .10]], "#c6e69c", "#405238", .031);
        }
        ctx.restore();
    }
}

function drawClassicLocomotive(ctx, radius, age, reducedMotion) {
    ctx.save();
    ctx.scale(radius, radius);
    if (!reducedMotion) {
        for (let index = 0; index < 5; index += 1) {
            const drift = ((age * 3.1 + index * .23) % 1);
            wdcDisc(ctx, .48 - drift * (1.8 + index * .10), -.75 - drift * 1.07,
                .11 + drift * .27, "rgba(190,211,221," + (.46 * (1 - drift)) + ")");
        }
    }
    wdcPolygon(ctx, [[-1.28, -.48], [-1.21, -.96], [-.50, -.96], [-.49, -.44],
        [.94, -.44], [1.27, -.20], [1.25, .43], [-1.29, .47]], "#344753", "#cad5ce", .067);
    wdcPolygon(ctx, [[-1.43, -.99], [-1.28, -1.13], [-.46, -1.13], [-.37, -.98]], "#863e34", "#e0b681", .046);
    ctx.fillStyle = "#efd086";
    ctx.fillRect(-1.07, -.88, .35, .30);
    ctx.fillStyle = "#21282a";
    ctx.fillRect(.56, -.78, .27, .42);
    ctx.fillRect(.48, -.83, .42, .12);
    for (const x of [-.34, .04, .43, .80]) pulseLine(ctx, x, -.38, x, .40, "#788d93", .062);
    wdcPolygon(ctx, [[-1.42, .35], [1.26, .34], [1.53, .62], [1.15, .76], [-1.43, .65]], "#ab4635", "#412a22", .066);
    for (const x of [-.96, -.26, .49]) {
        wdcDisc(ctx, x, .61, .28, "#25262e", "#af997e", .051);
        const spin = reducedMotion ? 0 : age * 23;
        pulseLine(ctx, x - Math.cos(spin) * .20, .61 - Math.sin(spin) * .20,
            x + Math.cos(spin) * .20, .61 + Math.sin(spin) * .20, "#d7a97a", .068);
        wdcDisc(ctx, x, .61, .072, "#d7a97a");
    }
    wdcDisc(ctx, 1.13, -.19, .207, "#fbcf73", "#664122", .056);
    wdcDisc(ctx, 1.17, -.20, .115, "#fff6cf");
    ctx.restore();
}

function drawClassicPulseEchoes(ctx, body, color) {
    const trail = body.trail || [];
    ctx.save();
    for (let index = Math.min(20, trail.length - 1); index > 1; index -= 3) {
        ctx.globalAlpha = Math.max(0, 0.35 - index * 0.014);
        const point = trail[index];
        wdcDisc(ctx, point.x, point.y, body.radius * (1 - index * 0.008), color, "#f3f5fc", body.radius * 0.024);
    }
    ctx.restore();
}

function drawWdcSummonOrb(ctx, point, r, form, health, aim = 0, energized = false) {
    const { color, rim } = WDC_SUMMONS[form];
    ctx.save();
    wdcOrb(ctx, point, r, color, rim, health, form === "unarmed");
    ctx.translate(point.x, point.y);
    if (form === "unarmed") {
        ctx.fillStyle = "#26303c";
        ctx.fillRect(-r * 0.72, -r * 0.68, r * 1.44, r * 0.25);
        for (const side of [-1, 1]) {
            const x = side * r * 0.94;
            wdcPolygon(ctx, [[x - r * 0.23, r * 0.31], [x - r * 0.18, r * 0.05], [x + r * 0.19, r * 0.04],
                [x + r * 0.30, r * 0.27], [x + r * 0.13, r * 0.61], [x - r * 0.22, r * 0.55]],
            "#e8ecef", "#6f8193", r * 0.072);
        }
    } else if (form === "exoelectric") {
        ctx.rotate(aim);
        wdcPolygon(ctx, [[r * 0.66, -r * 0.68], [r * 1.19, -r * 0.43], [r * 1.33, 0], [r * 1.19, r * 0.43], [r * 0.66, r * 0.68]],
            "#3f2630", "#ffaf7f", r * 0.057);
        wdcDisc(ctx, r * 1.13, 0, r * 0.29, energized ? "#fff5a5" : "#ce4e36", energized ? "#ff8f41" : "#f68168", r * 0.087);
        wdcDisc(ctx, r * 0.58, -r * 0.73, r * 0.13, "#ffb650", "#662b36", r * 0.06);
        wdcDisc(ctx, r * 0.58, r * 0.73, r * 0.13, "#ffb650", "#662b36", r * 0.06);
    } else {
        wdcPolygon(ctx, [[-r * 0.68, -r * 0.46], [-r * 0.52, -r * 0.92], [-r * 0.13, -r * 1.24],
            [r * 0.36, -r * 1.14], [r * 0.66, -r * 0.67], [r * 0.30, -r * 0.46]],
        "#3a8050", "#aff293", r * 0.066);
        wdcPolygon(ctx, [[-r * 0.13, -r * 1.24], [r * 0.36, -r * 1.14], [r * 0.30, -r * 0.46]], "#84df68");
        wdcPolygon(ctx, [[-r * 0.30, r * 0.63], [r * 0.04, r * 0.47], [r * 0.32, r * 0.66], [r * 0.02, r * 0.83]], "#c2ee84");
    }
    ctx.restore();
}

function drawClassicWdcSummon(ctx, summon, time, sim, options) {
    const { x, y, radius } = summon;
    const { color } = WDC_SUMMONS[summon.formId];
    ctx.save();
    if (!options.reducedMotion && (time < (summon.classicPulseLaunchUntil || 0) || summon.formId === "unarmed")) {
        drawClassicPulseEchoes(ctx, summon, color);
    }
    const beam = summon.beam;
    if (beam) {
        const start = beam.fired ? beam.firesAt : beam.startsAt;
        const end = beam.fired ? beam.endsAt : beam.firesAt;
        const progress = Math.max(0, Math.min(1, (time - start) / (end - start)));
        ctx.save();
        clipClassicPulseArena(ctx, sim);
        wdcDisintegrator(ctx, beam.origin || summon, radius, sim.arenaBounds.width,
            { angle: beam.angle, phase: beam.fired ? "fire" : "charge", progress }, time, options.flashReduction);
        ctx.restore();
    }
    if (summon.formId === "emerald") wdcPickaxe(ctx, x, y, radius, classicPulseBlade(summon, time).angle);
    const fist = classicWdcSummonPunchPose(summon, time);
    if (fist) wdcPunchArm(ctx, summon, fist, radius, fist.angle);
    drawWdcSummonOrb(ctx, summon, radius, summon.formId, summon.health, beam?.angle ?? Math.atan2(summon.vy, summon.vx), Boolean(beam));
    if (summon.flash > 0 && !options.flashReduction) {
        ctx.globalAlpha = Math.min(0.8, summon.flash * 6);
        pulseRing(ctx, x, y, radius * 1.02, "#ffffff", radius * 0.1);
    }
    ctx.restore();
}

function drawClassicOnePunchMan(ctx, fighter, time, reducedMotion) {
    const { radius, classicPunchPhase: phase, classicPunchVariant: variant } = fighter;
    const glove = fighter.classicPunchGloves?.find(({ punchingHand }) => punchingHand);
    if (time < (fighter.classicDodgeUntil || 0)) pulseRing(ctx, 0, 0, radius * 1.13, "#fff0af", radius * 0.032);
    if (!glove) return;
    const charged = variant && variant !== "jab";
    if (charged) {
        pulseRing(ctx, 0, 0, radius * 1.45, "#ffe687", radius * 0.048);
        if (variant === "shockwave" && ["impact", "recover"].includes(phase)) return;
    }
    const shoulder = { x: glove.x1 - fighter.x, y: glove.y1 - fighter.y };
    const fist = {
        x: (glove.hitX1 + glove.hitX2) / 2 - fighter.x,
        y: (glove.hitY1 + glove.hitY2) / 2 - fighter.y,
    };
    const angle = fighter.classicPunchAngle;
    const size = glove.visualLength * 0.53;
    if (!reducedMotion && (phase === "extend" || phase === "impact")) {
        const echoCount = variant === "barrage" ? 4 : charged ? 3 : 1;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        ctx.save();
        for (let index = echoCount; index >= 1; index -= 1) {
            ctx.globalAlpha = 0.50 - index * 0.093;
            const distance = radius * index * (variant === "barrage" ? 0.84 : 0.61);
            const stagger = radius * (index % 2 ? 0.45 : -0.37);
            const x = fist.x - dx * distance - dy * stagger;
            const y = fist.y - dy * distance + dx * stagger;
            pulseLine(ctx, x - dx * size * 1.5, y - dy * size * 1.5, x, y, "#fff1c9", radius * 0.033);
            wdcGlove(ctx, x, y, size * (1 - index * 0.07), angle, false);
        }
        ctx.restore();
    }
    wdcPunchArm(ctx, shoulder, fist, radius, angle, fighter.classicPunchSerious, size);
}

function drawClassicPunchWave(ctx, wave, time, reducedMotion) {
    const { x, y, radius, angle } = wave;
    const age = time - wave.startedAt;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const length = Math.min(radius * 8, age * Math.hypot(wave.vx, wave.vy) + radius * 1.4);
    if (!reducedMotion) {
        wdcPolygon(ctx, [[-length, 0], [-radius * .26, -radius * .87], [radius * .72, 0],
            [-radius * .26, radius * .87]], "#d9e4f744");
        for (let index = 0; index < 8; index += 1) {
            const spread = (index - 3.5) * radius * 0.24;
            const lead = radius * (0.8 - (index % 3) * 0.72);
            pulseLine(ctx, -length * (0.52 + index % 3 * 0.16), spread * 0.53, lead, spread,
                index % 2 ? "#ffffff75" : "#efcf8570", Math.max(1, radius * 0.045));
        }
    }
    ctx.fillStyle = "#edc04a";
    ctx.fillRect(-radius * 1.03, -radius * 0.43, radius * 0.46, radius * 0.79);
    wdcGlove(ctx, 0, 0, radius, 0, true);
    pulseRing(ctx, radius * .22, 0, radius * 1.25, "#e6eff6bb", radius * .052);
    ctx.restore();
}

function drawClassicJohnRod(ctx, fighter, time, dark) {
    const { x, y, radius } = fighter;
    const color = dark ? "#f9faff" : "#242231";
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(radius, radius);
    const stride = Math.sin(time * 11.8) * 0.14 * Math.sign(fighter.vx || 1);
    const pose = fighter.classicPulseMove?.phase;
    const lean = pose === "wrap" ? Math.sin(time * 16) * .11 : stride * .3;
    const outline = [
        [-.25 + lean, -.55], [-.54, -.45], [-.82, -.17], [-.54, .13], [-.36, .11], [-.54, -.15],
        [-.36, -.28], [-.44, .29], [-.36 + stride, .73], [-.61 + stride, .94], [-.24 + stride, .97],
        [0, .37], [.27 - stride, .97], [.62 - stride, .95], [.40 - stride, .76], [.44, .26],
        [.36, -.28], [.54, -.14], [.37, .09], [.55, .13], [.82, -.17], [.53, -.47], [.25 + lean, -.55],
    ];
    wdcPolygon(ctx, outline, dark ? "#06070a" : "#f0f0f5", color, .043);
    wdcDisc(ctx, lean, -.78, .27, dark ? "#0b0d13" : "#f7f7fa", color, .044);
    ctx.restore();
    ctx.save();
    ctx.font = "900 " + radius * .46 + "px Arial, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.lineWidth = radius * .085;
    ctx.strokeStyle = dark ? "#090a12" : "#f7f7fa";
    ctx.fillStyle = color;
    ctx.strokeText(String(Math.ceil(fighter.health)), x, y + radius * .11);
    ctx.fillText(String(Math.ceil(fighter.health)), x, y + radius * .11);
    ctx.restore();
}

function drawClassicKnightBlade(ctx, fighter, time) {
    const blade = classicPulseBlade(fighter, time);
    const length = Math.hypot(blade.x2 - blade.x1, blade.y2 - blade.y1);
    const r = fighter.radius;
    ctx.save();
    ctx.translate(blade.x1, blade.y1);
    ctx.rotate(blade.angle);
    wdcPolygon(ctx, [[-r * .12, -r * .064], [r * .44, -r * .070], [r * .50, r * .066],
        [-r * .13, r * .086]], "#594837", "#15131a", r * .044);
    wdcPolygon(ctx, [[r * .45, -r * .17], [r * .70, -r * .12], [length, 0], [r * .68, r * .17],
        [r * .45, r * .11]], "#ccdbef", "#263140", r * .034);
    wdcPolygon(ctx, [[r * .53, .012 * r], [length - r * .048, 0], [r * .72, r * .147], [r * .49, r * .092]], "#8398b4");
    pulseLine(ctx, r * .48, -.22 * r, r * .38, .24 * r, "#e2c686", r * .082);
    pulseLine(ctx, r * .58, -.10 * r, length - r * .13, 0, "#f6fbff", r * .021);
    wdcDisc(ctx, -r * .097, 0, r * .084, "#dcb877", "#2c2530", r * .022);
    ctx.restore();
}

function drawClassicPurple(ctx, fighter, move, time, flashReduction) {
    const { radius } = fighter;
    const progress = Math.min(1, (time - move.at) / (move.firesAt - move.at));
    ctx.save();
    if (move.phase === "charge") {
        ctx.translate(fighter.x, fighter.y);
        ctx.rotate(move.angle);
        const separation = radius * (1.15 * (1 - progress) + .07);
        const center = radius * (1.38 + progress * .42);
        for (const side of [-1, 1]) {
            const y = side * separation;
            const x = center + Math.cos(time * 9 + side) * separation * .24;
            const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * .67);
            glow.addColorStop(0, side < 0 ? "#eaf5ff" : "#fff0f0");
            glow.addColorStop(.22, side < 0 ? "#3c88ff" : "#ff463a");
            glow.addColorStop(1, "transparent");
            wdcDisc(ctx, x, y, radius * .67, glow);
            wdcDisc(ctx, x, y, radius * .13, "#fffaff");
            for (let index = 0; index < 6; index += 1) {
                const angle = index * TAU / 6 + time * 3;
                const offset = radius * (.33 + index * .028);
                wdcDisc(ctx, x + Math.cos(angle) * offset, y + Math.sin(angle) * offset, radius * .021, side < 0 ? "#92c7ff" : "#ff847a");
            }
        }
        if (progress > .79) wdcDisc(ctx, center, 0, radius * (progress - .72), "#f7e3ff");
    } else {
        const age = Math.max(0, time - move.firesAt);
        const length = Math.min(1, age / .16 + .04) * move.length;
        const half = move.width / 2;
        if (length < .5) { ctx.restore(); return; }
        ctx.translate(move.x, move.y);
        ctx.rotate(move.angle);
        ctx.globalAlpha = Math.min(1, (move.until - time) / .20) * (flashReduction ? .72 : 1);
        wdcPolygon(ctx, [[0, -.12 * half], [length * .14, -half], [length, -.78 * half],
            [length, .80 * half], [length * .16, half], [0, .13 * half]], "#713add");
        wdcPolygon(ctx, [[0, -.11 * half], [length * .22, -.54 * half], [length, -.38 * half],
            [length, .52 * half], [length * .27, .53 * half], [0, .12 * half]], "#d8acff");
        wdcPolygon(ctx, [[0, 0], [length * .27, -.20 * half], [length, -.11 * half], [length, .18 * half],
            [length * .3, .27 * half]], "#fff0ff");
        for (let index = 0; index < 27; index += 1) {
            const start = ((index * .618034 + age * 2.15) % 1) * length;
            const offset = Math.sin(index * 4.3) * half * .88;
            const span = half * (.48 + (index % 5) * .33);
            pulseLine(ctx, start, offset, Math.min(length, start + span), offset, index % 3 ? "#49266ea4" : "#fffaffbf", 1 + index % 3);
        }
        if (age < .18) wdcDisc(ctx, length, 0, half * .61, "#fef4ff", "#be82fc", half * .28);
    }
    ctx.restore();
}

function drawClassicWrap(ctx, fighter, move, time, dark) {
    const age = time - move.at;
    const assembling = move.phase === "charge";
    const impact = move.phase === "impact";
    const progress = assembling ? age / (move.lockAt - move.at) : Math.min(1, (time - move.lockAt) / (move.firesAt - move.lockAt));
    const size = move.radius * (assembling ? 1.12 : impact ? .70 + (time - move.firesAt) * .87 : 1.12 - .42 * progress);
    const { x, y } = move;
    ctx.save();
    ctx.translate(x, y);
    ctx.lineCap = "round";
    const wire = dark ? "#f3f4fc" : "#393849";
    if (assembling) {
        const spin = age * 6;
        for (const side of [-1, 1]) {
            const turn = spin + side * 1.3;
            const cx = Math.cos(turn) * size * (.83 + .24 * (1 - progress));
            const cy = Math.sin(turn) * size * (.83 + .24 * (1 - progress));
            pulseLine(ctx, cx - Math.cos(turn + 1.3) * size * .39, cy - Math.sin(turn + 1.3) * size * .39,
                cx + Math.cos(turn + 1.3) * size * .39, cy + Math.sin(turn + 1.3) * size * .39, wire, fighter.radius * .055);
        }
    } else {
        const tilt = size * .25;
        const corners = [[-size, -size], [size, -size], [size, size], [-size, size]];
        ctx.globalAlpha = impact ? Math.max(0, 1 - (time - move.firesAt) / (move.until - move.firesAt)) : .96;
        wdcPolygon(ctx, corners, "#8560e71c", "#a688ff", fighter.radius * .065);
        wdcPolygon(ctx, corners.map(([cx, cy]) => [cx + tilt, cy - tilt]), "#3c22542e", "#8065e0", fighter.radius * .037);
        for (const [cx, cy] of corners) pulseLine(ctx, cx, cy, cx + tilt, cy - tilt, wire, fighter.radius * .036);
        for (let index = -1; index <= 1; index += 1) {
            const offset = size * index * .52;
            const fold = Math.sin(progress * 3.4 + index * 1.3) * size * .38;
            pulseLine(ctx, -size, offset, fold, -fold, wire, fighter.radius * .047);
            pulseLine(ctx, fold, -fold, size, -offset, "#acbbdc", fighter.radius * .043);
            pulseLine(ctx, offset, -size, -fold, fold, wire, fighter.radius * .047);
            pulseLine(ctx, -fold, fold, -offset, size, "#acbbdc", fighter.radius * .043);
        }
    }
    ctx.restore();
}

function drawClassicConvergence(ctx, fighter, move, sim, dark) {
    const age = sim.time - move.at;
    const { radius: r } = fighter;
    const t = Math.min(1, age / (move.lockAt - move.at));
    const ink = dark ? "#fbfcff" : "#52597e";
    ctx.save();
    ctx.translate(fighter.x, fighter.y);
    for (const side of [-1, 1]) {
        const tilt = side * .54;
        const cos = Math.cos(tilt);
        const sin = Math.sin(tilt);
        const orbit = r * (1.15 + t * .78);
        for (let index = 0; index < 13; index += 1) {
            const angle = index * TAU / 13 + age * (side * 3.75);
            const x = Math.cos(angle) * orbit;
            const y = Math.sin(angle) * orbit * .52;
            const depth = (1 + Math.sin(angle)) / 2;
            const size = r * (.064 + depth * .043);
            wdcDisc(ctx, x * cos - y * sin, x * sin + y * cos, size,
                index % 4 ? "#f6f7ff" : "#fff1c1", depth > .5 ? "#a6bee9" : "#777c9c", size * .40);
        }
    }
    pulseRing(ctx, 0, 0, r * 1.22, ink, r * .035);
    ctx.restore();
    ctx.save();
    ctx.translate(move.x, move.y);
    const radius = r * (.44 + t * .76);
    if (move.phase === "edit") pulseRing(ctx, 0, 0, move.radius, dark ? "#bcccf48c" : "#8389ae8c", r * .027);
    pulseRing(ctx, 0, 0, radius, ink, r * .034);
    pulseRing(ctx, 0, 0, radius * .76, dark ? "#b6caff9c" : "#8389aea3", r * .032);
    for (let index = 0; index < 12; index += 1) {
        const angle = index * TAU / 12 + age * 1.2;
        pulseLine(ctx, Math.cos(angle) * radius * .48, Math.sin(angle) * radius * .48,
            Math.cos(angle) * radius * 1.25, Math.sin(angle) * radius * 1.25, ink, r * .019);
    }
    if (move.phase === "edit") {
        const progress = (sim.time - move.lockAt) / (move.firesAt - move.lockAt);
        const height = r * (1.15 + .85 * Math.sin(Math.PI * Math.min(1, progress)));
        pulseLine(ctx, 0, -height, 0, height, ink, r * .12);
        for (const side of [-1, 1]) pulseLine(ctx, -r * .40, side * height, r * .40, side * height, ink, r * .10);
        const target = sim.fighters.find(({ id }) => id === move.targetId);
        if (target) {
            ctx.font = "900 " + Math.round(r * .32) + "px " + PIXEL_FONT;
            ctx.fillStyle = ink;
            ctx.textAlign = "center";
            ctx.fillText(target.name.slice(0, Math.max(1, Math.ceil(target.name.length * (1 - progress)))), 0, -height - r * .20);
        }
    } else {
        wdcDisc(ctx, 0, 0, r * .17, "#fff7e2", "#b7c6ee", r * .08);
    }
    ctx.restore();
}

function drawClassicPulseGround(ctx, fighter, sim, options) {
    const { time, arenaBounds: bounds } = sim;
    const form = fighter.classicWdcForm;
    if (form?.phase === "portal" || (form?.phase === "summon" && time - form.at < .97)) {
        wdcPortal(ctx, form.portal.x, form.portal.y, fighter.radius * .84, time - form.at, .97, options.reducedMotion);
    }
    if (form?.id === "emerald" && form.phase === "summon") {
        const shopX = bounds.x + bounds.width * .5;
        const shopY = bounds.y + fighter.radius * .26;
        wdcMarket(ctx, shopX, shopY, bounds.width * .88,
            { age: time - form.reserveAt, coins: form.coins, merchant: true }, time);
        if (form.soldAt && time - form.soldAt < .65) {
            drawClassicPulseBurst(ctx, { style: "sale", x: shopX, y: shopY + bounds.width * .17,
                radius: fighter.radius, life: .65 - (time - form.soldAt), maxLife: .65 }, options);
        }
    }
    const move = fighter.classicPulseMove;
    if (fighter.type === "gojo") {
        ctx.save();
        clipClassicPulseArena(ctx, sim);
        if (fighter.classicPulseField || time < (fighter.classicPulseGuardUntil || 0)) {
            const r = fighter.radius * 4.45;
            wdcDisc(ctx, fighter.x, fighter.y, r, options.classicBlackTheme ? "#142540be" : "#9bb6e744",
                options.classicBlackTheme ? "#ebf4ff" : "#5277b2", fighter.radius * .05);
            pulseRing(ctx, fighter.x, fighter.y, r * .975, "#7a96c7b4", fighter.radius * .025);
        }
        if (move) drawClassicPurple(ctx, fighter, move, time, options.flashReduction);
        ctx.restore();
    } else if (fighter.type === "knight") {
        drawClassicKnightBlade(ctx, fighter, time);
        if (time < (fighter.classicPulseGuardUntil || 0)) {
            pulseRing(ctx, fighter.x, fighter.y, fighter.radius * 1.91, options.classicBlackTheme ? "#f5f7ff" : "#5775ad", fighter.radius * .050);
        }
    }
}

function drawClassicPulseForeground(ctx, fighter, sim, options) {
    const move = fighter.classicPulseMove;
    if (!move) return;
    if (fighter.type === "john-rod") drawClassicWrap(ctx, fighter, move, sim.time, options.classicBlackTheme);
    else if (fighter.type === "one-above-all") drawClassicConvergence(ctx, fighter, move, sim, options.classicBlackTheme);
}

function classicPulseIsWide(style) {
    return style === "serious-punch" || style === "shield-crack" || style === "shockwave";
}

function drawClassicPulseBurst(ctx, effect, options) {
    const { x, y, radius: r, style } = effect;
    const p = Math.max(0, Math.min(1, 1 - effect.life / effect.maxLife));
    const dark = options.classicBlackTheme;
    const ink = dark ? "#f2f6ff" : "#565d73";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(effect.angle || 0);
    ctx.globalAlpha = (1 - p) * (options.flashReduction ? .68 : .94);
    if (classicPulseIsWide(style)) {
        const steel = style === "shield-crack";
        const scale = options.reducedMotion ? .67 : 1;
        const reach = r * (1.7 + p * (steel ? 9.0 : 7.2)) * scale;
        for (const offset of [0, .17, .31]) {
            pulseRing(ctx, 0, 0, reach * (1 - offset), offset ? ink : (steel ? "#a2b9dc" : "#efddaf"), r * (.044 + offset * .11));
        }
        if (!options.reducedMotion) {
            for (let index = 0; index < (steel ? 38 : 24); index += 1) {
                const angle = index * 2.39996;
                const start = r * (.82 + (index % 5) * .32 + p * .54);
                const end = start + r * (1.8 + (index % 9) * .61) * (.68 + p * 2);
                pulseLine(ctx, Math.cos(angle) * start, Math.sin(angle) * start, Math.cos(angle) * end, Math.sin(angle) * end,
                    index % 4 ? ink : (steel ? "#9ab2d9" : "#e2c68e"), r * (.022 + index % 4 * .012));
            }
            for (const side of [-1, 1]) {
                const offset = side * r * (steel ? 2.1 : 1.5);
                const edge = r * (4.0 + p * 7.6) * side;
                wdcPolygon(ctx, [[edge, offset - r * .38], [edge, offset + r * .58], [r * side * .24, 0]],
                    steel ? "#cfddf399" : "#b8bece63");
            }
        }
        pulseRing(ctx, 0, 0, r * (1.05 + p * 2.0), effect.blocked ? "#cde1ff" : ink, r * .071);
    } else if (style === "mine" || style === "sale") {
        if (style === "mine") {
            for (const side of [-1, 1]) {
                pulseLine(ctx, 0, 0, r * .22, side * r * .47, "#a7acaa", r * .052);
                pulseLine(ctx, r * .22, side * r * .47, -r * .055, side * r * .95, "#a7acaa", r * .039);
                pulseLine(ctx, r * .22, side * r * .47, r * .49, side * r * .66, "#a7acaa", r * .027);
            }
        }
        for (let index = 0; index < 6; index += 1) {
            const gx = style === "sale" ? (index - 2.5) * r * p * .4 : r * (.18 + p * (index % 3 + .55));
            const gy = style === "sale" ? -r * (p * (1.4 + index * .17)) : Math.sin(index * 3.75) * r * (p * 1.1 + .3);
            const size = r * (.10 + index % 3 * .030);
            if (style === "sale") wdcDisc(ctx, gx, gy, size, "#efbe53", "#fff0a6", size * .21);
            else wdcPolygon(ctx, [[gx - size, gy], [gx, gy - size * .82], [gx + size, gy],
                [gx + size * .35, gy + size * .85], [gx - size * .35, gy + size * .85]], "#69ec69", "#276136", size * .18);
        }
    } else if (style === "edit-pixels") {
        for (let index = 0; index < (options.reducedMotion ? 14 : 36); index += 1) {
            const angle = index * 2.39996;
            const offset = r * (.31 + (index % 7) * .11 + p * (.4 + index % 6 * .25));
            const size = r * (.055 + index % 4 * .044) * (1 - p * .6);
            ctx.fillStyle = ["#9fe9ff", "#3f9aed", "#e7f8ff"][index % 3];
            ctx.fillRect(Math.cos(angle) * offset, Math.sin(angle) * offset - p * r * .88, size, size);
        }
    } else {
        const tint = {
            summon: effect.recall ? "#bc8afa" : "#9bd6ff", dodge: "#fff0ad", punch: "#ffe4b8",
            limitless: "#a4ccff", purple: "#cc8dff", disintegrator: "#fc6d5c", wrap: "#bfadff",
            convergence: "#b0cbf8", steel: "#c5d9f2", shield: "#8caeec",
        }[style] || ink;
        const quiet = options.reducedMotion;
        const dodge = style === "dodge";
        const length = r * (dodge ? 3.1 : 1.8);
        const width = r * (dodge ? .023 : .038);
        if (!dodge) {
            pulseRing(ctx, 0, 0, r * (.48 + p * 2.0), tint, r * (.042 + (1 - p) * .07));
            pulseRing(ctx, 0, 0, r * (.27 + p * 1.54), ink, width);
        }
        for (let index = 0; index < (quiet ? 5 : 13); index += 1) {
            const angle = index * 2.39996;
            const drift = r * (.22 + p * (1.2 + (index % 5) * .29));
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            const mx = dx * drift;
            const my = dy * drift;
            if (style === "limitless" && index % 2 === 0) {
                const size = r * (.085 + index % 3 * .052);
                wdcPolygon(ctx, [[mx - size, my], [mx - size * .22, my - size], [mx + size, my - size * .52],
                    [mx + size * .63, my + size], [mx - size * .47, my + size * .84]], tint, ink, r * .021);
            } else if (dodge) {
                pulseLine(ctx, mx - length * (.35 + p * .72), my, mx, my, index % 2 ? tint : ink, width);
            } else {
                const edge = drift + r * (.22 + index % 4 * .11);
                pulseLine(ctx, mx, my, dx * edge, dy * edge, index % 3 ? tint : ink, width);
            }
        }
    }
    ctx.restore();
}

export function drawClassicPulseOutsideArena(ctx, sim, options, resultAge = 0) {
    for (const fighter of sim.fighters || []) {
        const form = fighter.classicWdcForm;
        if (!fighter.alive || !fighter.classicWdcReserve || !form) continue;
        const { arenaBounds: bounds } = sim;
        const radius = fighter.radius;
        const spaceAbove = options.spaceAbove >= radius * 4.6;
        const side = fighter.classicTeamIndex === 0 ? -1 : 1;
        const age = sim.time - (form.phase === "recall" ? form.returnAt : form.reserveAt);
        const progress = Math.max(0, Math.min(1, age / .36));
        const amount = 1 - (1 - progress) ** 3;
        const { x, y } = form.phase === "recall" ? form.entry : { x: form.reserveX, y: form.reserveY };
        const perch = {
            x: spaceAbove ? x : bounds.x + bounds.width * (side > 0 ? 1 : 0) + side * radius * .47,
            y: bounds.y - radius * (spaceAbove ? 2.92 : .49),
        };
        const parked = form.phase === "recall" ? 1 - amount : amount;
        const point = { x: x + (perch.x - x) * parked, y: y + (perch.y - y) * parked };
        ctx.save();
        if (spaceAbove && Math.abs(point.y - options.titleY) < radius) {
            ctx.globalAlpha = .30 + .70 * Math.abs(point.y - options.titleY) / radius;
        }
        const def = CLASS_DEFS.wdc;
        wdcOrb(ctx, point, radius * (spaceAbove ? 1 : 1 - parked * .42), def.color, def.accent, fighter.health);
        ctx.restore();
    }
    for (const effect of sim.effects || []) {
        if (effect.kind !== "classic-pulse-burst" || !classicPulseIsWide(effect.style) || effect.life <= resultAge) continue;
        drawClassicPulseBurst(ctx, { ...effect, life: effect.life - resultAge }, options);
    }
}

function wdcArenaFrame(ctx, board, gap) {
    const { x, y, size } = board;
    const right = x + size;
    const bottom = y + size;
    ctx.strokeStyle = "#b8b8b8";
    ctx.lineWidth = 5.25;
    ctx.beginPath();
    ctx.moveTo(right, gap == null ? bottom : y + size * (gap + .124));
    if (gap != null) ctx.lineTo(right - 12, y + size * (gap + .115));
    if (gap != null) {
        ctx.moveTo(right, y + size * (gap + .124));
        ctx.lineTo(right, bottom);
    }
    ctx.lineTo(x, bottom);
    ctx.lineTo(x, y);
    ctx.lineTo(right, y);
    ctx.lineTo(right, gap == null ? bottom : y + size * (gap - .124));
    if (gap != null) ctx.lineTo(right - 12, y + size * (gap - .115));
    ctx.stroke();
}

function wdcDuelMeter(ctx, x, y, width, progress, label, health, fill, border) {
    const height = 36;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.clip();
    ctx.fillStyle = "#111111";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = fill;
    if (progress > 0) {
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, Math.max(2, (width - 6) * progress), height - 6, 7);
        ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = border;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.stroke();
    wdcPixelText(ctx, label, x + width / 2, y + height / 2, 1.72, 1.58, "#fff8e9");
    ctx.font = "700 16px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff8ec";
    ctx.fillText(`HP ${Math.ceil(health)}`, x + width / 2, y + height + 12);
}

function wdcDuelEffects(ctx, effects, time, flashReduction) {
    for (const effect of effects) {
        const point = wdcStagePoint(effect);
        const age = time - effect.at;
        const shatter = effect.cue === "wall-break";
        const strike = effect.cue === "serious" || effect.cue === "punch";
        const gem = effect.cue === "mine" || effect.cue === "sell" || effect.cue === "pay";
        const summon = effect.cue === "summon" || effect.cue === "recall";
        if (!shatter && !strike && !gem && !summon) continue;
        const lifetime = shatter ? .72 : strike ? .28 : gem ? .60 : .44;
        if (age > lifetime) continue;
        const progress = age / lifetime;
        const color = shatter ? "#f5f5f3" : strike ? "#fff0b6" : gem ? "#d4f999" : "#bfc4ff";
        const spread = shatter ? 126 : strike ? 78 : gem ? 60 : 99;
        const count = shatter ? 15 : strike ? 11 : gem ? 7 : 10;
        ctx.save();
        ctx.globalAlpha = (1 - progress) * (flashReduction ? .58 : .94);
        ctx.strokeStyle = color;
        ctx.lineWidth = shatter ? 3 : 2;
        if (!gem) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, spread * (.28 + progress * .90), 0, TAU);
            ctx.stroke();
        }
        for (let index = 0; index < count; index += 1) {
            const angle = index * 2.399963 + effect.at;
            const distance = spread * (.36 + (index % 6) * .055 + progress * .74);
            const x = point.x + Math.cos(angle) * distance;
            const y = point.y + Math.sin(angle) * distance + (shatter ? progress ** 2 * 77 : -progress * 16);
            if (shatter) {
                wdcPolygon(ctx, [[x, y], [x + 11 * Math.cos(angle), y + 17], [x - 8, y + 7]], color);
            } else if (gem) {
                ctx.fillStyle = index % 2 ? "#93df76" : "#ffdd72";
                ctx.fillRect(x, y, 5 + index % 3, 5 + index % 3);
            } else {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + Math.cos(angle) * 14, y + Math.sin(angle) * 14);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

function wdcStagePoint({ x, y }) {
    return { x: WDC_DUEL_BOARD.x + x * WDC_DUEL_BOARD.size, y: WDC_DUEL_BOARD.y + y * WDC_DUEL_BOARD.size };
}

function wdcDuelTitle(ctx, summonName) {
    const left = summonName || "WDC";
    const right = "ONE PUNCH MAN";
    const natural = [wdcPixelWidth(left) * 7.5, wdcPixelWidth("VS") * 5, wdcPixelWidth(right) * 7.5];
    const gap = 24;
    const maxWidth = left.length > 12 ? 995 : 790;
    const scale = Math.min(1, maxWidth / (natural.reduce((sum, width) => sum + width, 0) + gap * 2));
    const [leftWidth, vsWidth, rightWidth] = natural.map((width) => width * scale);
    const spacing = gap * scale;
    const start = 540 - (leftWidth + vsWidth + rightWidth + spacing * 2) / 2;
    const y = 384 + (1 - scale) * 10;
    wdcPixelText(ctx, left, start + leftWidth / 2, y, 7.5 * scale, 5.45 * scale, WDC_TITLE_BLUE);
    wdcPixelText(ctx, "VS", start + leftWidth + spacing + vsWidth / 2, y + 2, 5 * scale, 3.8 * scale, "#f3f3f3");
    wdcPixelText(ctx, right, start + leftWidth + vsWidth + spacing * 2 + rightWidth / 2, y, 7.5 * scale, 5.45 * scale, WDC_TITLE_GOLD);
}

export function drawClassicWdcDuel(ctx, sim, width, height, { flashReduction = false, reducedMotion = false } = {}) {
    const duel = sim.classicWdcDuel;
    const pose = duel.pose;
    const time = sim.time;
    const wdc = sim.fighters.find(({ id }) => id === duel.wdcId);
    const punchMan = sim.fighters.find(({ id }) => id === duel.punchManId);
    const board = WDC_DUEL_BOARD;
    const scale = Math.min(width / 1080, height / 1920);
    const wdcRadius = board.size * .069 * (wdc.classicSizeScale || 1);
    const punchRadius = board.size * .069 * (punchMan.classicSizeScale || 1);
    const summon = pose.summon ? WDC_SUMMONS[pose.summon.id] : null;
    const summonPoint = summon && wdcStagePoint(pose.summon);
    const punchPoint = wdcStagePoint(pose.punchMan);

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.translate((width - 1080 * scale) / 2, (height - 1920 * scale) / 2);
    ctx.scale(scale, scale);
    wdcArenaFrame(ctx, board, pose.wallGapY);
    wdcDuelTitle(ctx, summon?.name);
    for (const x of pose.dots) {
        const point = wdcStagePoint({ x, y: .064 });
        wdcDisc(ctx, point.x, point.y, 4.3, "#f6f6f6", "#858585", 1);
    }

    if (pose.shop) wdcMarket(ctx, 540, board.y + 13, board.size, pose.shop, time);
    if (pose.portal) {
        const point = wdcStagePoint(pose.portal);
        wdcPortal(ctx, point.x, point.y, wdcRadius * 1.03, pose.portal.age, pose.portal.duration, reducedMotion);
    }
    if (pose.beam && summonPoint) {
        ctx.save();
        if (pose.beam.phase === "fire") {
            ctx.beginPath();
            ctx.rect(board.x, board.y, board.size, board.size);
            ctx.clip();
        }
        wdcDisintegrator(ctx, summonPoint, board.size * summon.radius, board.size, pose.beam, time, flashReduction);
        ctx.restore();
    }
    if (summon) {
        const radius = board.size * summon.radius;
        if (!reducedMotion) {
            for (let index = pose.summon.trail.length - 1; index >= 0; index -= 1) {
                const point = wdcStagePoint(pose.summon.trail[index]);
                ctx.save();
                ctx.globalAlpha = .58 * (1 - index / pose.summon.trail.length) ** 2;
                wdcDisc(ctx, point.x, point.y, radius, summon.color, "#282828", 2.3);
                ctx.restore();
            }
        }
        drawWdcSummonOrb(ctx, summonPoint, radius, pose.summon.id, 100, pose.beam?.angle ?? 0, Boolean(pose.beam));
        if (pose.shop) {
            const angle = pose.shop.selling ? -.87 : time * 3.6;
            wdcPickaxe(ctx, summonPoint.x, summonPoint.y, radius, angle);
            wdcDisc(ctx, summonPoint.x - radius * .25, summonPoint.y - radius * 1.60, 6, "#80ca63", "#3c792c", 2);
            ctx.fillStyle = "#f1f8e7";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = "700 21px Arial, sans-serif";
            ctx.fillText(String(pose.shop.gems), summonPoint.x - radius * .03, summonPoint.y - radius * 1.60);
        }
    }
    wdcOrb(ctx, wdcStagePoint(pose.wdc), wdcRadius, WDC_BLUE, "#1a3290", wdc.health);
    if (pose.punchManVisible) {
        if (!reducedMotion) {
            for (let index = pose.punchManTrail.length - 1; index >= 0; index -= 1) {
                const point = wdcStagePoint(pose.punchManTrail[index]);
                ctx.save();
                ctx.globalAlpha = .13 * (1 - index / pose.punchManTrail.length);
                wdcDisc(ctx, point.x, point.y, punchRadius * (.88 + .12 * (1 - index / 6)), WDC_YELLOW);
                ctx.restore();
            }
        }
        if (pose.punch?.flyingFist) {
            const point = wdcStagePoint(pose.punch.flyingFist);
            wdcGlove(ctx, point.x, point.y, punchRadius * .80, pose.punch.angle, true);
        } else if (pose.punch?.extension > .02 && !pose.punch.detached) {
            const { angle, reach, extension, serious } = pose.punch;
            const distance = punchRadius * .8 + (reach * board.size - punchRadius * .8) * extension;
            const shoulder = {
                x: punchPoint.x + Math.cos(angle) * punchRadius * .43,
                y: punchPoint.y + Math.sin(angle) * punchRadius * .43,
            };
            const fist = { x: punchPoint.x + Math.cos(angle) * distance, y: punchPoint.y + Math.sin(angle) * distance };
            wdcPunchArm(ctx, shoulder, fist, punchRadius, angle, serious);
        }
        wdcOrb(ctx, punchPoint, punchRadius, WDC_YELLOW, "#bda047", punchMan.health);
        if (pose.shop?.carrying) {
            wdcGroceries(ctx, punchPoint.x + punchRadius * 1.58, punchPoint.y - punchRadius * .16, punchRadius * 1.41, time);
        } else if (pose.shop?.paymentAge != null && pose.shop.paymentAge < .35) {
            wdcDisc(ctx, punchPoint.x - punchRadius * .59, punchPoint.y - punchRadius * .58, punchRadius * .22, "#e8ae50", "#994916", 3);
        }
    }
    wdcDuelEffects(ctx, duel.effects, time, flashReduction || reducedMotion);
    wdcDuelMeter(ctx, 145, 1285, 275, pose.shop?.selling || summon ? .96 : .90,
        "SUMMON: UNARMED", wdc.health, "#23489e", "#7194e4");
    wdcDuelMeter(ctx, 659, 1285, 275, pose.charge,
        "SERIOUS SERIES", punchMan.health, "#aa8d34", "#e7cd7c");
    ctx.restore();
}
