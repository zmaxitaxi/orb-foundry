import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import {
  ANNOUNCER_ASSETS,
  ANNOUNCER_DUCK_GAINS,
  ANNOUNCER_DUCK_RELEASE_SECONDS,
  ANNOUNCER_NAMES,
  ANNOUNCER_PLAYBACK_GAIN,
  VERSUS_ANNOUNCER_PLAYBACK_GAIN,
  ANNOUNCER_TYPES,
  CombatAudio,
  INTRO_ANNOUNCER_ASSETS,
  MATCH_FINALE_DURATION_SECONDS,
  MATCH_FINALE_RECORDING_TAIL_MS,
  RACE_ANNOUNCER_COUNT_NAMES,
  RACE_ANNOUNCER_NAMES,
  RACE_COMBO_ANNOUNCER_ASSETS,
  RACE_COUNT_ANNOUNCER_ASSETS,
  RACE_GENERATED_ANNOUNCER_ASSETS,
  RACE_GROUP_ANNOUNCER_NAMES,
  RACE_INTRO_ANNOUNCER_ASSETS,
  RACE_MATH_POWER_GAIN,
  SAMPLE_ASSET_VERSION,
  SAMPLE_ASSETS,
  FUTURE_AUDIO_ROUTE_CONTRACTS,
  WORLD_CUP_ANNOUNCER_NAMES,
  WORLD_CUP_INTRO_ANNOUNCER_ASSETS,
  announcerCueForEvent,
  announcerPlaybackGainForCue,
  announcerIntroSequence,
  loadAnnouncerAssets,
  loadSampleAssets,
  raceAnnouncerIntroSequence,
  raceAnnouncerCountCueFor,
  raceTargetAnnouncerCueFor,
  raceTeamAnnouncerIntroSequence,
  samplePlanForEvent,
  samplePlaybackCountForEvent,
  soundPlanForEvent,
  worldCupAnnouncerIntroSequence,
} from "../src/audio.js";
import { createDefaultSettings, decodeSettings, encodeSettings, normalizeSettings } from "../src/config.js";
import {
  PRESENTATION_TIMING,
  advancePresentationTimeline,
  createPresentationTimeline,
} from "../src/presentation-timeline.js";
import {
  RECORDER_STATES,
  RecorderStateMachine,
  SocialBattleRecorder,
  supportedRecordingMime,
} from "../src/recorder.js";
import {
  SOCIAL_FORMATS,
  PRESENTATION_CLASH_PAUSE_MS,
  PRESENTATION_COLLISION_PAUSE_MS,
  PRESENTATION_CRITICAL_PAUSE_MS,
  PRESENTATION_IMPACT_PAUSE_MS,
  PRESENTATION_KNOCKOUT_PAUSE_MS,
  PRESENTATION_PROJECTILE_PAUSE_MS,
  bigMomentCalloutForEvent,
  bigMomentForEvent,
  buildAbilityHud,
  buildBattleStats,
  buildHypeScore,
  buildWinProbability,
  detectHighlight,
  impactPresentationForEvent,
  normalizeSocialOptions,
  presentationPauseMs,
  recordingFilename,
  socialEventAnnouncement,
  statusIndicators,
} from "../src/social.js";
import {
  ARENA,
  ARENA_MODIFIERS,
  CLASS_DEFS,
  RACE_LAYER_HEIGHT,
  RACE_ORBITAL_ORBS_PER_RING,
  RACE_ORBITAL_SATELLITE_RADIUS_SCALE,
  RACE_SNAKE_TAIL_RADIUS_SCALE,
  createSimulation,
  raceLayerLineY,
  stepSimulation,
} from "../src/simulation.js";
import {
  SocialBattleRenderer,
  HEALTH_MARKER_TIMING,
  classicHealthMarkerRadiusFor,
  abilityBarLayout,
  classicHealthDeltaLabel,
  classicHealthMarkerOpacity,
  classicHealthMarkerRise,
  raceFinishLabelForIndex,
  ORB_RACE_FOOTER_TAG,
  ORB_RACE_LONGFORM_CHECKER_COLUMNS,
  raceLongformSideCopyLayout,
  raceLayerColorFor,
  raceArenaBorderColorForTeam,
  classicArenaBorderColorsFor,
  raceReactorColorFor,
  racePurpleSunBodyColorFor,
  raceRenderOrbRadius,
  raceOrbSplitColors,
  snowballLayerHeightFor,
  berserkerAxePose,
  draftmasterGunReloadPose,
  draftmasterSwordPose,
  draftmasterGunDimensions,
  draftmasterGunSourceRect,
  sniperWeaponSourceRect,
  raceThemeColorForRacer,
  raceAntimatterCooldownSecondsFor,
  raceAntimatterCountdownLineFor,
  raceRenderTeamSlots,
  raceTitleSegmentsFor,
  raceBlueSunLaserClipModeFor,
  raceLongformBlueSunOverflowFor,
  raceLongformTournamentCheckerFillEnabled,
  raceLongformTournamentCheckerRect,
  raceLongformTournamentCheckerTileSize,
  raceLongformTournamentCheckerGridFor,
  raceTournamentFinishBorderVisible,
  raceBlueSunLongformEndpointFor,
  raceBlueSunLongformShouldExtendThroughBarrier,
  raceSunLaserLayerClipRectFor,
  classicCtaLayout,
  classicAbsorberHistoryLabelFor,
  classicMatchupTitleLayout,
  socialBattleLayout,
  winnerFieldMessage,
  winnerFieldSegments,
} from "../src/social-renderer.js";
import {
  ORB_RACE_EVERYONE_LABEL,
  ORB_RACE_LONGFORM_PRESENTATION,
  ORB_RACE_MAX_MATH_DAMAGE,
  ORB_RACE_MODE,
  ORB_RACE_RAINBOW_PALETTE,
  ORB_RACERS,
  formatOrbRaceNumber,
  orbRaceBoardLayout,
  orbRaceBoardSections,
  orbRaceLongformLayout,
} from "../src/orb-race.js";
import {
  classicDraftmasterAmmoSourceRect,
  classicBoxerSmokeAlpha,
  classicBoxerGloveSourceRect,
  classicDedicatedWeaponSourceRect,
  classicDraftmasterGunSourceRect,
  classicGunBodyFlipYFor,
  classicShotgunAmmoSourceRect,
  classicSniperWeaponSourceRect,
  classicSniperHeldPose,
  classicSwordSourceRect,
  classicSwordHeldPose,
  classicTridentSourceRect,
  classicTridentDimensions,
  classicTridentImpactAlpha,
  classicImpactPaletteFor,
  classicFairyAccessoryCropFor,
  classicSheetCropFor,
  classicTrapperCigarSourceRect,
  classicSplodeyBombRadiusFor,
  classicSplodeyBombStyleFor,
  classicVisibleArenaPointFor,
  classicVisualColorFor,
  classicFrostTrailAngleFor,
  classicZeusLightningPoints,
} from "../src/renderer.js?v=20260811-classic-trapper-lasso-v6-health-values1-necromancer-summon-parasite1-sword2-audio3-race-blue-sun1-team-colors3-necro-teleport-batman-rifle1-batman-grapple3-classic-boss-health-apple-hive2-classic-visual1";

import {
  ORB_CROPS,
  PIXEL_EFFECT_PROFILES,
  PIXEL_GEAR_PROFILES,
  PIXEL_WEAPON_PROFILES,
  classicLazerPathFor,
  classicLazerSegmentsFor,
  impactSpriteKeyForEffect,
  shouldRenderHitEffect,
} from "../src/renderer.js";

assert.equal(raceRenderOrbRadius(1000, 1), 45, "race rendering should use the simulation orb radius");
assert.equal(raceRenderOrbRadius(1000, 0.5), 22.5, "Grower scale rendering should stay proportional to physics scale");

const classes = Object.keys(CLASS_DEFS);
const dt = 1 / 120;

assert.equal(raceFinishLabelForIndex(0), "Like & Subscribe!");
assert.equal(raceFinishLabelForIndex(1), "Like & Subscribe!");
assert.equal(ORB_RACE_FOOTER_TAG, "#OrbBattleGroundSimulator");
assert.equal(classicHealthDeltaLabel(-1), "-1", "Virus and Parasite DOT feedback should stay a discrete -1");
assert.equal(classicHealthDeltaLabel(-3), "-3");
assert.equal(classicHealthDeltaLabel(2.25), "+2.3");

{
  const cigar = classicTrapperCigarSourceRect(1536, 1024);
  assert.deepEqual(cigar, { x: 994, y: 447, width: 396, height: 162 });
  assert.ok(cigar.width / cigar.height > 2, "Cowboy's cigar crop should preserve its horizontal authored silhouette");
}
assert.ok(Math.abs(classicHealthMarkerRadiusFor({ type: "virus", radius: 20 }) - 26.4) < 1e-9, "Virus DOT markers should clear its generated rim");
assert.equal(classicHealthMarkerRadiusFor({ type: "cutter", radius: 20 }), 20, "ordinary orb DOT markers should use the simulation radius");
assert.equal(classicHealthMarkerOpacity(0.18), 1, "Classic HP deltas should remain fully visible during the half-second hold");
assert.equal(classicHealthMarkerOpacity(0.5), 1, "Classic HP deltas should begin fading at half a second");
assert.ok(classicHealthMarkerOpacity(0.6) > 0 && classicHealthMarkerOpacity(0.6) < 1, "Classic HP deltas should fade smoothly after the half-second hold");
assert.ok(classicHealthMarkerOpacity(0.9) > 0, "Classic HP deltas should remain visible until the one-second finish");
assert.equal(classicHealthMarkerOpacity(1), 0, "Classic HP deltas should finish their eased fade at one second");
const defaultClassicBounds = {
  x: ARENA.padding,
  y: ARENA.padding,
  width: ARENA.width - ARENA.padding * 2,
  height: ARENA.height - ARENA.padding * 2,
};
assert.deepEqual(
  classicVisibleArenaPointFor({ gameplayMode: "classic", arenaShape: "square", arenaBounds: defaultClassicBounds }, { x: ARENA.padding, y: ARENA.padding }),
  { x: 0, y: 0 },
  "default Classic wall attachments should map to the visible canvas corner",
);
assert.deepEqual(
  classicVisibleArenaPointFor({ gameplayMode: "classic", arenaShape: "square", arenaBounds: defaultClassicBounds }, { x: ARENA.width - ARENA.padding, y: ARENA.height - ARENA.padding }),
  { x: ARENA.width, y: ARENA.height },
  "default Classic wall attachments should map to the visible canvas edge",
);
assert.deepEqual(
  classicVisibleArenaPointFor({ gameplayMode: "classic", arenaShape: "square", arenaBounds: { x: 124, y: 124, width: 472, height: 472 } }, { x: 124, y: 124 }),
  { x: 124, y: 124 },
  "custom inset arenas should retain their own visible wall coordinates",
);
assert.deepEqual(HEALTH_MARKER_TIMING, { holdSeconds: 0.5, riseSeconds: 0.72, lifetimeSeconds: 1 }, "all orb health markers should share the one-second fade contract");
assert.equal(classicHealthMarkerRise(0), 0, "Classic HP deltas should begin at the owning orb");
assert.ok(classicHealthMarkerRise(0.36) > 0 && classicHealthMarkerRise(0.36) < 1, "Classic HP deltas should rise with an eased midpoint");
assert.equal(classicHealthMarkerRise(0.9), 1, "Classic HP deltas should finish their upward travel");

{
  const root = new URL("../assets/generated/classic-trapper-20260807/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", root), "utf8"));
  const final = new URL(manifest.assets[0].final, root);
  const png = readFileSync(final);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual(manifest.alphaValidation.cornerAlpha, [0, 0, 0, 0]);
  assert.equal(png.readUInt32BE(16), 1536);
  assert.equal(png.readUInt32BE(20), 1024);
}

{
  const mediaRoot = new URL("../assets/generated/classic-visual-20260810-v4/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  assert.equal(manifest.version, "classic-visual-20260810-v4");
  for (const asset of Object.values(manifest.assets)) {
    const final = readFileSync(new URL(asset.final, mediaRoot));
    const source = readFileSync(new URL(asset.source, mediaRoot));
    assert.deepEqual([...final.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${asset.final} should be a PNG`);
    assert.deepEqual([...source.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${asset.source} should be a PNG`);
    assert.equal(manifest.pipeline.rendering, "nearest-neighbor / imageSmoothingEnabled=false");
    assert.equal(asset.alpha.transparent_corners, true, `${asset.final} should keep transparent corners`);
  }
  const lassoPrompts = readFileSync(new URL("prompts.md", mediaRoot), "utf8");
  assert.match(lassoPrompts, /completely continuous, closed full circle/);
  assert.match(lassoPrompts, /virus orb body/i);
}

{
  const mediaRoot = new URL("../assets/generated/classic-visual-20260810-v5/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  const asset = manifest.assets["trapper-lasso-animation-sheet"];
  assert.equal(manifest.version, "classic-visual-20260810-v5");
  assert.equal(asset.cells.length, 4, "the lasso accessory should expose wind-up, swing, throw, and deployed frames");
  assert.deepEqual(asset.cells.map(({ id }) => id), ["windup", "swing", "throw", "deployed"]);
  const source = readFileSync(new URL(asset.source, mediaRoot));
  const final = readFileSync(new URL(asset.final, mediaRoot));
  assert.deepEqual([...source.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual([...final.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(asset.alpha.transparent_corners, true);
  assert.equal(asset.alpha.divider_lines_removed, true);
  const prompts = readFileSync(new URL("prompts.md", mediaRoot), "utf8");
  assert.match(prompts, /four-frame animation sheet/i);
  assert.match(prompts, /complete closed lasso loop/i);
}

{
  const mediaRoot = new URL("../assets/generated/classic-visual-20260810-v6/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  const asset = manifest.assets["trapper-lasso-animation-sheet"];
  assert.equal(manifest.version, "classic-visual-20260810-v6");
  assert.equal(asset.cells.length, 4);
  assert.deepEqual(asset.cells.map(({ id }) => id), ["windup", "swing", "throw", "deployed"]);
  assert.equal(asset.dimensions, "2172x724 source; 2896x724 padded final; 4 square 724px cells");
  const source = readFileSync(new URL(asset.source, mediaRoot));
  const final = readFileSync(new URL(asset.final, mediaRoot));
  assert.deepEqual([...source.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual([...final.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(asset.alpha.transparent_corners, true);
  assert.equal(asset.alpha.square_cells, true);
  assert.equal(asset.alpha.native_aspect_preserved, true);
  const prompts = readFileSync(new URL("prompts.md", mediaRoot), "utf8");
  assert.match(prompts, /perfect circular/i);
  assert.match(prompts, /square panels/i);
}

{
  const healthy = raceLayerColorFor(ORB_RACERS.speed.color, 100, 100);
  const lightlyDamaged = raceLayerColorFor(ORB_RACERS.speed.color, 75, 100);
  const heavilyDamaged = raceLayerColorFor(ORB_RACERS.speed.color, 25, 100);
  assert.equal(healthy, "#ffffff", "a full-health layer should stay white");
  assert.notEqual(lightlyDamaged, healthy, "a damaged layer should begin tinting toward its orb theme");
  assert.notEqual(heavilyDamaged, lightlyDamaged, "layer tint should deepen as damage increases");
  assert.notEqual(
    raceLayerColorFor(ORB_RACERS.sticky.color, 25, 100),
    heavilyDamaged,
    "different orb themes should produce different damaged-layer colors",
  );
}

{
  const layout = orbRaceBoardLayout(1080, 1920);
  assert.equal(layout.boards.length, 2);
  assert.deepEqual(
    layout.boards.map((board) => [board.width, board.height]),
    layout.boards.map((board) => [layout.boardWidth, layout.boardHeight]),
    "both Block Breaker boards should share one exact geometry",
  );
  const sections = orbRaceBoardSections(layout.boards[0], 3);
  assert.ok(sections.finishLabelHeight > 0);
  assert.ok(sections.checkerHeight > 0);
  assert.ok(sections.checkerY > sections.finishY, "the flag must begin below its label band");
  assert.ok(sections.checkerY + sections.checkerHeight <= layout.boardHeight + 1e-9, "the flag must stay inside the board");
  assert.equal(formatOrbRaceNumber(1000000000), "1,000,000,000");
  assert.equal(formatOrbRaceNumber(1000000000000), "1,000,000,000,000");
  assert.equal(
    formatOrbRaceNumber(1_000_000_000_000_000_000_000),
    "1,000,000,000,000,000,000,000",
  );
}

for (const asset of [
  "boomerang-generated.png",
  "mine-generated.png",
  "magnet-generated.png",
  "jackpot-cash-explosion.png",
  "jackpot-slot-machine.png",
  "jackpot-slot-lever.png",
  "jackpot-slot-symbols.png",
  "hydrogen-bomb-symbol.png",
  "fibonacci-symbol.png",
  "fibonacci-symbol.svg",
  "pi-symbol.png",
]) {
  assert.equal(existsSync(new URL(`../assets/race/${asset}`, import.meta.url)), true, `${asset} should ship with Orb Race`);
}
assert.equal(
  existsSync(new URL("../assets/race/source/hydrogen-bomb-symbol.png", import.meta.url)),
  true,
  "the original Hydrogen Bomb symbol source should be preserved",
);
assert.equal(
  existsSync(new URL("../assets/race/source/fibonacci-symbol.png", import.meta.url)),
  true,
  "the original supplied Fibonacci symbol source should be preserved",
);
assert.equal(
  existsSync(new URL("../assets/race/source/fibonacci-symbol.svg", import.meta.url)),
  true,
  "the cleaned Fibonacci phi source should be preserved",
);
for (const asset of ["ricochet-weapons.png", "sawblade-weapons.png", "ricochet-gun-spin-sheet-source.png"]) {
  assert.equal(existsSync(new URL(`../assets/race/generated/${asset}`, import.meta.url)), true, `${asset} should ship with Orb Race`);
}
for (const asset of ["commander-sheet.png", "shrapnel-sheet.png", "roulette-sheet.png", "architect-sheet.png"]) {
  assert.equal(
    existsSync(new URL(`../assets/generated/orb-race-tactical-20260731/final/${asset}`, import.meta.url)),
    true,
    `${asset} should ship with the tactical Orb Race expansion`,
  );
}
for (const asset of ["roulette-orb.png", "shrapnel-orb.png", "architect-orb.png"]) {
  const assetPath = new URL(`../assets/generated/orb-race-tactical-20260731/final/${asset}`, import.meta.url);
  assert.equal(existsSync(assetPath), true, `${asset} should ship as a standalone tactical orb asset`);
  assert.deepEqual([...readFileSync(assetPath).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${asset} should be a PNG`);
}
{
  const commanderOrb = new URL("../assets/generated/orb-race-tactical-20260802/final/commander-orb.png", import.meta.url);
  assert.equal(existsSync(commanderOrb), true, "Commander should ship a standalone generated orb asset");
  assert.deepEqual([...readFileSync(commanderOrb).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], "Commander orb should be a PNG");
}
{
  const socialRendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  assert.match(socialRendererSource, /scissorSheet: new URL\(/, "Scissor must use its dedicated generated sprite sheet");
  assert.match(socialRendererSource, /drawRaceScissorSplitEffects\(/, "Scissor split animation must be routed through the social renderer");
  assert.match(socialRendererSource, /drawRaceTwinsOrb\(/, "Twins must render two independent orb bodies");
  assert.match(socialRendererSource, /raceTwinHealing/, "Twins HUD/render state must expose the healing phase");
  assert.match(socialRendererSource, /drawRaceVisitingTwins\?\./, "Healing Twins must be composited after both portrait boards");
  assert.match(socialRendererSource, /drawRaceLongformVisitingTwins\?\./, "Healing Twins must be composited on the opponent long-form track");
  assert.match(socialRendererSource, /RACE_TWIN_HEALING_COLOR = "#22c55e"/, "Healing Twin should use the separated green visual");
  assert.match(socialRendererSource, /RACE_TWIN_DAMAGE_COLOR = "#ef4444"/, "Damage Twin should use the separated red visual");
  assert.match(socialRendererSource, /const visualDef = owner\?\.raceTwinHealing === true/, "The visiting Twin tint should be phase-gated");
  assert.match(socialRendererSource, /const damageDef = racer\?\.raceTwinHealing === true/, "The home Twin tint should be phase-gated");
  assert.match(socialRendererSource, /function raceTwinDamageForDisplay\(racer\)[\s\S]*raceTwinHealing === true \? 2 : 1/, "The red separated Twin HUD should expose its doubled damage");
  assert.match(socialRendererSource, /case "twins": return `TWIN DAMAGE: \$\{formatCombatValue\(raceTwinDamageForDisplay\(racer\)\)/, "The Twins HUD should use the separated damage value");
  assert.match(socialRendererSource, /const targetTeamIndex = Number\.isInteger\(Number\(twin\.raceTeamIndex\)\)/, "The visiting Twin render target must come from its simulated team lane");
  assert.match(socialRendererSource, /drawRaceTrail\(ctx, twin, def, targetBoard, childRadius\)/, "The visiting Twin should render only its current trail on the target board");
  assert.match(socialRendererSource, /if \(!racer\?\.raceTwinHealing\)/, "Healing Twins must not be duplicated on the owner's board");
  assert.match(socialRendererSource, /Math\.max\(0\.04, Math\.min\(0\.96/, "Twins fallback placement must not rely on an undefined global clamp");
  assert.match(socialRendererSource, /teamTiltedHealth[\s\S]*if \(teamTiltedHealth\)/, "Scissor tilt should render persistent split pieces for every affected layer");
  assert.match(
    socialRendererSource,
    /const orbSprite = id === "roulette" \? null : raceSprite\(`\$\{id\}Orb`\);/,
    "Absorber should not render the generated roulette orb icon",
  );
  assert.match(
    socialRendererSource,
    /drawRaceAbsorberBadges[\s\S]*this\.drawRaceOrbUnit\(/,
    "Absorber badges should use the source orb renderer for real ability visuals",
  );
  assert.match(
    socialRendererSource,
    /drawRaceMeteorProjectiles\(ctx, racer, rect, radius\) \{\n\s+if \(!raceHasAbility\(racer, "meteor"\)\) return;/,
    "Absorbed Meteor should render its actual projectiles",
  );
  assert.match(
    socialRendererSource,
    /const hasBlackHoleAbility = raceHasAbility\(racer, "black-hole"\);/,
    "Absorber should use its absorbed Black Hole ability for visual effects",
  );
  assert.match(
    socialRendererSource,
    /const absorbedBlackHole = racer\?\.raceOrbId === "roulette"[\s\S]*raceHasAbility\(racer, "black-hole"\);/,
    "Absorber should receive the Black Hole singularity UI bar",
  );
  for (const abilityId of ["mines", "speed", "sticky", "orbital", "meteor", "slammy", "reactor", "black-hole", "drill"]) {
    assert.match(
      socialRendererSource,
      abilityId === "black-hole"
        ? /"black-hole": "black-hole"/
        : new RegExp(`\\b${abilityId}: "${abilityId}"`),
      `Absorber should map the ${abilityId} source to its active ability ID`,
    );
  }
  assert.match(socialRendererSource, /function raceAbsorberAbilityHudLineFor\(racer, abilityId\)/, "Absorber should expose per-ability HUD metrics");
  assert.match(socialRendererSource, /drawRaceAbsorbedAbilityEffects\(ctx, racer, rect, x, y, radius, time\)/, "Absorbed speed/sticky/Slammy effects should be drawn around Absorber");
  assert.match(socialRendererSource, /const hasReactorAbility = raceHasAbility\(racer, "reactor"\)/, "Absorber should dispatch Reactor blast effects");
  assert.match(socialRendererSource, /abilityId === "reactor"[\s\S]*REACTOR BLAST/, "Reactor should have a visible charge bar");
  assert.match(socialRendererSource, /function raceCommanderHudLinesFor\(racer\)/, "Commander should have a dedicated damage-only HUD");
  assert.match(socialRendererSource, /BOMB DAMAGE: \$\{formatRaceDamageValue/, "Commander HUD should show bomb damage");
  assert.match(socialRendererSource, /MISSILE DAMAGE: \$\{formatRaceDamageValue/, "Commander HUD should show missile damage");
  assert.doesNotMatch(socialRendererSource, /`UPGRADE IN: \$\{remaining\.toFixed\(1\)\}S`/, "Draftmaster should not show the upgrade countdown");
  assert.match(socialRendererSource, /if \(members\.length > 1\) return;/, "Multi-orb teams should suppress ability bars");
  assert.match(socialRendererSource, /artistsTextMaxWidth/, "Artists HUD text should fit around its ability bar");
  assert.match(
    socialRendererSource,
    /if \(effect\.squareRoot\)[\s\S]*ctx\.fillText\("√"/,
    "Square Root bounces should render a visible fading square-root cue",
  );
}

{
  const owner = {
    id: "twins-1",
    raceOrbId: "twins",
    raceTwinHealing: true,
    raceTwinOrb: {
      id: "twins-1-twin",
      raceTeamIndex: 1,
      raceTwinHealing: true,
    },
  };
  const entries = SocialBattleRenderer.prototype.visitingRaceTwinEntries([
    { members: [owner] },
    { members: [{ id: "unarmed-1", raceOrbId: "unarmed" }] },
  ]);
  assert.equal(entries.length, 1, "the visiting Twin overlay should collect one active healing child");
  assert.equal(entries[0].twin.raceTeamIndex, 1, "the overlay should preserve the opponent lane from simulation");
}

for (const asset of ["meteor-orb-source.png", "meteor-tiny-source.png", "meteor-giant-source.png", "meteor-horn-source.png", "meteor-fire-source.png"]) {
  assert.equal(existsSync(new URL(`../assets/race/generated/${asset}`, import.meta.url)), true, `${asset} should ship with Orb Race`);
}
assert.equal(existsSync(new URL("../assets/race/generated/black-hole-orb.png", import.meta.url)), true, "black hole sprite should ship with Orb Race");
for (const asset of ["black-hole-suction.png", "black-hole-teleport.png"]) {
  assert.equal(existsSync(new URL(`../assets/race/generated/${asset}`, import.meta.url)), true, `${asset} should ship with Orb Race`);
}
{
  const mediaRoot = new URL("../assets/generated/classic-media-20260808/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  assert.equal(manifest.version, "classic-media-20260808");
  for (const [id, expectedFrames] of [["boxer", ["guarded", "extended", "impact"]], ["necromancer", ["lowered", "raised", "glowing-summon"]]]) {
    const asset = manifest.assets[id];
    assert.deepEqual(asset.frames, expectedFrames);
    assert.ok(existsSync(new URL(`../${asset.source}`, import.meta.url)), `${id} chroma source should be preserved`);
    const finalPath = new URL(`../${asset.final}`, import.meta.url);
    assert.ok(existsSync(finalPath), `${id} final should exist`);
    assert.deepEqual([...readFileSync(finalPath).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(asset.alpha.transparent_corners, true, `${id} corners should be transparent`);
    assert.ok(asset.alpha.transparent_pixels > 0 && asset.alpha.partial_pixels > 0, `${id} should preserve soft keyed edges`);
  }
  const prompts = readFileSync(new URL("prompts.md", mediaRoot), "utf8");
  assert.match(prompts, /EXACTLY three equal-sized cells/);
  assert.match(prompts, /detached red boxing gloves/);
  assert.match(prompts, /small ivory pixel skull/);
  const rendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  const socialRendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /classic-media-20260808-boxer-v3\/final\/boxer-gloves-sheet\.png/);
  assert.match(rendererSource, /classic-media-20260808\/final\/necromancer-skull-sheet\.png/);
  assert.match(rendererSource, /drawClassicCobwebSpokes/);
  assert.match(rendererSource, /drawClassicLazerWeb/);
  assert.match(rendererSource, /classicLazerPathFor/);
  assert.match(rendererSource, /\["laser", "lazer", "webball", "tripwire"\]\.includes\(kind\)/, "the original single-line wall-ball variants should share the ricochet renderer");
  assert.match(rendererSource, /drawClassicCutterZone/, "Cutter should render its persistent path and lower-half-plane separately");
  assert.match(rendererSource, /classicCutterVisibleZoneGeometriesFor/, "Cutter should render only the current lifecycle area");
  const cutterRendererStart = rendererSource.indexOf("  drawClassicCutterZone");
  const cutterRendererEnd = rendererSource.indexOf("drawClassicTrainTrack", cutterRendererStart);
  const cutterRendererBody = rendererSource.slice(cutterRendererStart, cutterRendererEnd);
  assert.match(cutterRendererBody, /zonePolygon/, "Cutter should render the current smallest-area polygon");
  assert.match(cutterRendererBody, /zoneGeometries/, "Cutter should use the current lifecycle area geometry");
  assert.match(cutterRendererBody, /visibleSegmentIds/, "Cutter should track only the line segments paired with the visible area");
  assert.match(cutterRendererBody, /const matchingPaths = paths\.filter/, "Cutter should pair retained red connectors with their areas");
  assert.match(cutterRendererBody, /const geometryPaths = zoneGeometries[\s\S]*?zoneGeometry\?\.line/, "Cutter should retain the exact area-owned line while the area lives");
  assert.match(cutterRendererBody, /pathsToDraw/, "Cutter should draw the current boundary and replacement connector");
  assert.match(cutterRendererBody, /for \(const zoneGeometry of zoneGeometries\)/, "Cutter should fill its current lifecycle area");
  assert.match(cutterRendererBody, /lineWidth = Math\.max\(1\.5, Math\.min\(3,/, "Cutter should use a thin simple line");
  assert.doesNotMatch(cutterRendererBody, /drawClassicWebClamp/, "Cutter should not reuse laser endpoint clamps");
  assert.match(rendererSource, /const baseDistance = Math\.max\(2, Math\.hypot\(x2 - x, y2 - y\)\)/, "Spikey should use the exact gameplay tip/base attachment geometry");
  assert.match(rendererSource, /const blackMode = this\.options\.classicBlackTheme/, "Spikey should invert its black/white treatment with the Classic theme");
  assert.match(rendererSource, /this\.options\.classicTeamColors !== false/, "Classic team identity rings should be optional");
  const simulationSource = readFileSync(new URL("../src/simulation.js", import.meta.url), "utf8");
  assert.match(simulationSource, /CLASSIC_NON_RICOCHET_BULLETS/, "Classic bullet wall behavior should use a named deterministic set");
  assert.match(simulationSource, /bounces: bulletDoesNotRicochet \? false : bounces/, "non-ricocheting bullets should expose their traversal contract");
  assert.match(rendererSource, /drawClassicTrainTrack/, "Train should render its persistent diagonal rail path");
  assert.doesNotMatch(rendererSource, /const lineCount = 12/);
  assert.match(rendererSource, /drawClassicVampireOverlay[\s\S]*?ctx\.translate\(Number\(fighter\.x\)/, "Vampire fangs must be anchored to the fighter after drawFighter restores its transform");
  assert.match(rendererSource, /ctx\.moveTo\(base, radius \* offset - baseHalf\)[\s\S]*?ctx\.lineTo\(tip, radius \* offset\)/, "Vampire fangs should use a broad orb-side base and outward apex");
  assert.match(rendererSource, /drawClassicHealthText/);
  assert.match(
    socialRendererSource,
    /if \(sim\?\.gameplayMode === "classic"\) \{\s+this\.drawClassicHealthMarkers\(ctx, sim, \{ x: dx, y: dy, width: dw, height: dh \}\);\s+\}/,
    "every Classic orb should use the shared fading health-marker pass",
  );
  assert.match(
    socialRendererSource,
    /for \(const fighter of sim\.fighters \|\| \[\]\)/,
    "the shared Classic health-marker pass should cover every fighter orb",
  );
  assert.match(rendererSource, /this\.options\.simpleOrbs \|\| this\.lastSim\?\.gameplayMode === "classic"/);
  assert.match(rendererSource, /drawClassicBoxerSmoke/);
  assert.match(rendererSource, /drawClassicBoxerGloveFrame/);
  assert.match(rendererSource, /const phase = String\(fighter\.classicPunchPhase \|\| "idle"\)\.toLowerCase\(\)/, "Monster should consume the same punch phase as Boxer");
  assert.match(rendererSource, /const punching = \["retract", "extend", "impact", "recover", "windup", "extended", "punching"\]\.includes\(phase\)/, "Monster should animate the shared Boxer punch phases");
  assert.match(rendererSource, /const guardDistance = monster \? 1\.34 : 1\.1/);
  assert.match(rendererSource, /const gloveScale = 0\.75/);
  assert.match(rendererSource, /const projectileUsesVelocityHeading = \[/);
  assert.match(rendererSource, /CLASSIC_SHOTGUN_PROJECTILE_SCALE = 1\.8/);
  assert.match(rendererSource, /classic-visual-20260810-v3\/final\/shotgun-shells-sheet\.png/);
  assert.match(rendererSource, /classicShotgunAmmoSourceRect/);
  assert.match(rendererSource, /CLASSIC_RIFLE_PROJECTILE_SCALE = 0\.5/);
  assert.match(rendererSource, /CLASSIC_GUN_HANDLE_OVERLAP = 0\.34/);
  assert.match(rendererSource, /const generatedFrame = firing \? 1 : 0/);
  assert.match(rendererSource, /const spin = reloading \? \(easedReload \* Math\.PI \* 7\)/);
  assert.doesNotMatch(rendererSource, /generatedFrame = firing \? 1 : reloading \? 2/);
  assert.match(rendererSource, /kind === "necromancer-arrow"[\s\S]*?drawClassicAmmoSprite\(ctx, entity, kind, radius\)/);
  const minionStart = rendererSource.indexOf("  drawNecromancerMinion");
  const arrowStart = rendererSource.indexOf("  drawNecromancerArrow", minionStart);
  assert.ok(minionStart >= 0 && arrowStart > minionStart, "Necromancer minion and projectile renderers should remain separate");
  assert.match(rendererSource.slice(minionStart, arrowStart), /necromancerBowAnimation/, "minions should use the generated bow/reload animation sheet");
  assert.match(rendererSource, /CLASSIC_NECROMANCER_BOW_FRAME_COUNT = 4/, "Necromancer bow should expose four generated animation frames");
  assert.match(rendererSource, /CLASSIC_NECROMANCER_ARROW_RENDER_SCALE = 3\.75/, "Necromancer arrows should be 0.75x smaller than the prior 5x pass");
  assert.match(rendererSource, /CLASSIC_NECROMANCER_BOW_RENDER_SCALE = 2/, "Necromancer bow frames should render at twice their prior size");
  assert.match(rendererSource, /const bowFrameWidth = bowImage\.naturalWidth \/ CLASSIC_NECROMANCER_BOW_FRAME_COUNT/);
  assert.match(rendererSource, /const bowWidth = bowHeight \* bowFrameWidth \/ Math\.max\(1, bowImage\.naturalHeight\)/, "Necromancer bow dimensions should preserve the generated frame aspect ratio");
  assert.match(rendererSource, /sinceLastShot >= 0 && sinceLastShot < 0\.13/, "the generated release frame should follow the actual minion shot timestamp");
  assert.match(rendererSource, /if \(latched\) \{[\s\S]*?ctx\.restore\(\);[\s\S]*?return;/, "Vampire fangs should disappear while latched");
  assert.match(rendererSource, /effect\.kind === "classic-destruction-burst"/, "main and minion destruction bursts should have a dedicated renderer branch");
  assert.match(rendererSource, /kind === "necromancer-skull"/);
  assert.match(rendererSource, /emergenceProgress/);
  assert.match(rendererSource, /classicTeleport/);
  assert.match(rendererSource, /teleportAlpha/);
  assert.doesNotMatch(rendererSource, /visibleFraction = emergenceProgress >= 1/);
  assert.match(simulationSource, /emergeDuration: 1/);
  assert.match(rendererSource, /kind === "classic-parasite"/);
  assert.match(rendererSource, /CLASSIC_PARASITE_CARRIER_RENDER_SCALE = 1\.25/);
  assert.match(rendererSource, /CLASSIC_GUN_RENDER_SCALE = 1\.75/);
  assert.match(rendererSource, /CLASSIC_GUN_ORB_RENDER_SCALE = 0\.9/);
  assert.match(rendererSource, /CLASSIC_GUN_PROJECTILE_RENDER_SCALE = 6/);
  assert.match(rendererSource, /CLASSIC_SNIPER_PROJECTILE_SCALE = 0\.75/);
  assert.match(rendererSource, /kind === "shotgun-ammo"/);
  assert.match(rendererSource, /fighter\.type === "parasites"/);
  assert.match(rendererSource, /segmentScale = growth \* \(0\.28/);
  assert.match(rendererSource, /classicSniperWeaponSourceRect/);
  assert.match(rendererSource, /classicSniperHeldPose/);
  assert.match(rendererSource, /sniper: "\.\/assets\/generated\/orb-race-simple-20260731\/final\/sniper-weapons\.png"/, "Sniper should use its same-fighter Orb Racer weapon sheet");
  assert.match(rendererSource, /drawClassicHydrogenBody/);
  assert.match(rendererSource, /batmanOrb: "\.\/assets\/generated\/classic-visual-20260811-v4\/final\/batman-orb-with-ears\.png"/);
  assert.match(rendererSource, /batmanOrb: "\.\/assets\/generated\/classic-visual-20260811-v4\/final\/batman-orb-with-ears\.png"[\s\S]*?drawClassicPresentationSprite\(ctx, "batmanOrb"/);
  assert.match(rendererSource, /batmanEars: "\.\/assets\/generated\/classic-visual-20260811-v2\/final\/batman-ears\.png"/);
  assert.match(rendererSource, /batmanBatarang: "\.\/assets\/generated\/classic-visual-20260811-v2\/final\/batman-batarang\.png"/);
  assert.match(rendererSource, /fighter\.type === "batman"[\s\S]*?drawClassicPresentationSprite\(ctx, "batmanOrb"/);
  assert.match(rendererSource, /classicGunBodyFlipYFor/);
  assert.equal(classicGunBodyFlipYFor("rifle"), -1, "Rifle should flip only its local vertical axis");
  assert.equal(classicGunBodyFlipYFor("shotgun"), 1, "Shotgun should retain its authored orientation");
  assert.match(rendererSource, /drawClassicParasiteLatches/);
  assert.match(rendererSource, /drawClassicParasiteDesign/);
  assert.match(rendererSource, /drawClassicVirusDesign/);
  assert.match(rendererSource, /virus: "\.\/assets\/generated\/classic-visual-20260810-v4\/final\/virus-orb\.png"/);
  assert.match(rendererSource, /trapperLasso: "\.\/assets\/generated\/classic-visual-20260810-v6\/final\/trapper-lasso-animation-sheet\.png"/);
  assert.match(rendererSource, /classicTrapperCigarSourceRect/);
  assert.match(rendererSource, /cigar\.x,[\s\S]*?cigar\.y,[\s\S]*?cigar\.width,[\s\S]*?cigar\.height/);
  assert.match(rendererSource, /ctx\.scale\(-1, 1\);[\s\S]*?-radius \* 0\.22 - cigarWidth/, "Cowboy's cigar should mirror so its lit end points outward");
  assert.match(rendererSource, /drawClassicTrapperLassoEntity/);
  assert.match(rendererSource, /drawClassicTrapperCaughtWraps/);
  assert.match(rendererSource, /drawClassicHeldTrapperLasso/);
  assert.match(rendererSource, /if \(kind === "trap"\) \{[\s\S]*?drawClassicTrapperLassoEntity\(ctx, owner, entity/);
  assert.match(rendererSource, /frameCount = 4/);
  assert.match(rendererSource, /independent world-space throw entities/);
  assert.match(rendererSource, /Virus owns the complete generated orb silhouette/);
  assert.match(rendererSource, /kind === "trap"/);
  assert.match(rendererSource, /shrapnelSheet/);
  assert.match(rendererSource, /frameWidth = image\.naturalWidth \/ 4/);
  assert.match(rendererSource, /frameAspect = frameWidth \/ image\.naturalHeight/);
  assert.match(rendererSource, /CLASSIC_TRAPPER_LASSO_LOOP_SCALE = 3\.64/);
  assert.match(rendererSource, /CLASSIC_TRAPPER_HELD_LASSO_SCALE = 5\.16/);
  assert.match(rendererSource, /CLASSIC_TRAPPER_LASSO_WIDTH_SCALE = 1\.18/);
  assert.match(rendererSource, /CLASSIC_TRAPPER_HELD_LASSO_SPIN_TURNS = 1\.25/);
  assert.match(rendererSource, /drawClassicTrapperLassoSprite/);
  assert.doesNotMatch(rendererSource, /drawClassicTrapperRopeCircle/);
  assert.match(rendererSource, /sniper-ammo/);
  assert.match(rendererSource, /classicPunchReach/);
  assert.match(rendererSource, /desiredTip = stuckOrb/);
  assert.match(rendererSource, /drawClassicTridentImpactBurst/);
  assert.match(rendererSource, /classicTridentImpactAlpha/);
  assert.match(rendererSource, /CLASSIC_IMPACT_BURST_PARTICLES = 64/);
  assert.match(rendererSource, /CLASSIC_IMPACT_BURST_DURATION = 0\.82/);
  assert.match(rendererSource, /CLASSIC_DESTRUCTION_BURST_PARTICLES = 72/);
  assert.match(rendererSource, /CLASSIC_DESTRUCTION_BURST_DURATION = 0\.52/);
  assert.match(rendererSource, /spreadScale: 1\.5/);
  assert.match(rendererSource, /for \(let particle = 0; particle < safeParticleCount; particle \+= 1\)/);
  assert.match(rendererSource, /ctx\.arc\(px, py, particleRadius, 0, TAU\)/, "Trident impact particles should be circular");
  const tridentBurstStart = rendererSource.indexOf("  drawClassicTridentImpactBurst");
  const tridentBurstEnd = rendererSource.indexOf("  tridentThrowIsActive", tridentBurstStart);
  assert.doesNotMatch(rendererSource.slice(tridentBurstStart, tridentBurstEnd), /fillRect|strokeRect|ctx\.stroke\(|ctx\.setLineDash|#e5ebf1|#f5f7fa/, "Trident impact should be filled circles without rings or gray pixels");
  assert.match(rendererSource, /drawClassicImpactBursts\(ctx, sim, sim\.time\)/, "Classic impact bursts should be driven by recent simulation events");
  assert.match(rendererSource, /CLASSIC_BULLET_IMPACT_KINDS = new Set/, "bullet impact kinds should share the circular burst");
  assert.match(rendererSource, /const surface = event\.surface === "wall" \? "wall" : event\.surface === "orb" \? "orb" : null/, "trident wall/orb impacts should select their palette by surface");
  assert.deepEqual(classicImpactPaletteFor("orb"), ["#ff1838", "#ff304d", "#e90f2f", "#c90827", "#ff5a68"]);
  assert.deepEqual(classicImpactPaletteFor("wall"), ["#4a2418", "#68321f", "#874322", "#a95a2d", "#d1844b"]);
  assert.match(rendererSource, /tridentThrowIsActive\(fighter, time\)/, "the held trident should hide during every thrown phase");
  assert.match(rendererSource, /localGloveX = glove\.x2 - Number\(fighter\.x/);
  assert.match(rendererSource, /height = radius \* 1\.55/);
  assert.equal(classicBoxerSmokeAlpha(0), 1);
  assert.equal(classicBoxerSmokeAlpha(0.25), 0.5);
  assert.equal(classicBoxerSmokeAlpha(0.5), 0);
  const sniperCrop = classicSniperWeaponSourceRect(1774, 887, 0);
  assert.ok(sniperCrop.y > 0 && sniperCrop.height < 887, "Classic sniper crop must exclude the source matte");
  assert.ok(sniperCrop.width < 887, "Classic sniper crop must stay within one sheet cell");
  const sniperPose = classicSniperHeldPose(40, sniperCrop.width, sniperCrop.height);
  assert.equal(sniperPose.width, 176, "Classic Sniper should use the Orb Racer 4.4r held-weapon scale");
  assert.ok(sniperPose.mountX < 0, "Classic Sniper stock should mount into the orb while the barrel points outward");
  const boxerCrop = classicBoxerGloveSourceRect(1536, 1024, 1, 0);
  assert.ok(boxerCrop.width > 0 && boxerCrop.height > 0, "Boxer glove crop must be positive");
  assert.ok(boxerCrop.width < 1536 / 3 && boxerCrop.height < 1024 / 2, "Boxer glove crop must exclude transparent sheet padding");
  assert.match(socialRendererSource, /const CLASSIC_WEB_DAMAGE_TYPES = new Set\(\[/);
  assert.match(socialRendererSource, /addMarker\(isHeal \? amount : -amount, index, event\.time\)/);
  assert.match(socialRendererSource, /if \(wholeDamage > 0\) addMarker\(-wholeDamage, index, event\.time\)/);
  assert.match(socialRendererSource, /const fallbackAmount = Math\.abs\(delta\) < 0\.95/);
  assert.match(socialRendererSource, /const freshEvents = \(sim\.events \|\| \[\]\)\.filter/);
  assert.match(socialRendererSource, /if \(event\.type === "classic-critical"\) continue/, "the double-punch announcement must not create a second HP marker");
  assert.match(socialRendererSource, /event\.type === "classic-punch-hit" && event\.critical === true/, "critical fist hits should be grouped into one visible transaction");
  assert.doesNotMatch(socialRendererSource, /const recent = discreteHealthEvent \? null/);
  assert.match(socialRendererSource, /const visibleMarkers = activeMarkers;/);
  assert.match(socialRendererSource, /CLASSIC_WEB_DAMAGE_TYPES/);
  assert.match(socialRendererSource, /"spikey"/);
  assert.match(socialRendererSource, /"virus"/);
  assert.match(socialRendererSource, /event\.fighterId === fighter\.id/);
  assert.match(socialRendererSource, /const vampireHeal = fighter\.type === "vampire" && delta > 0/);
  assert.match(socialRendererSource, /fighterMarkerIndex/);
  assert.match(socialRendererSource, /fighterRadius/);
  assert.match(rendererSource, /drawClassicAbsorberAnimation/);
  assert.match(rendererSource, /drawClassicAbsorbedOrbModel/);
  assert.match(socialRendererSource, /classicAbsorberHistoryLabelFor/);
  assert.match(socialRendererSource, /batmanOrb: new URL\("\.\.\/assets\/generated\/classic-visual-20260811-v4\/final\/batman-orb-with-ears\.png"/);
  assert.match(socialRendererSource, /batarang\.radius \|\| 0\.07\) \* 2/);
  assert.match(simulationSource, /RACE_BATMAN_GRAPPLE_COOLDOWN_SECONDS = 10/);
  assert.match(simulationSource, /advanceRaceBatmanDefenses\(sim, openingEventStartId\)/);
  assert.match(simulationSource, /advanceRaceBatmanDefenses\(sim, raceEventStartId\)/);
  assert.match(simulationSource, /sourceEventType: threat\.type/);
  assert.match(simulationSource, /targetX,\s+targetY/);
  assert.match(socialRendererSource, /drawRaceBatmanGrapple\(ctx, racer, rect, orbRadius\)/);
  assert.match(socialRendererSource, /const baseBatarangSize = Math\.max\(22, rect\.width \* 0\.07 \* 2\)/);
  assert.match(socialRendererSource, /const hookSize = baseBatarangSize \* 2/);
  assert.match(socialRendererSource, /ctx\.shadowColor = "#ffffff"/);
  assert.match(socialRendererSource, /raceBatmanGrappleCooldown/);
}

{
  const visualRoot = new URL("../assets/generated/classic-visual-20260811-v1/", import.meta.url);
  const visualManifest = JSON.parse(readFileSync(new URL("manifest.json", visualRoot), "utf8"));
  assert.equal(visualManifest.version, "classic-visual-20260811-v1");
  assert.equal(visualManifest.generator, "GPT Image built-in imagegen");
  for (const [id, expectedFrames] of [["glassDrops", 4], ["zeusGreekCircles", 4], ["fairyAccessories", 5]]) {
    const asset = visualManifest.assets[id];
    assert.equal(asset.frames, expectedFrames, `${id} should expose its authored frame count`);
    assert.ok(existsSync(new URL(asset.source, visualRoot)), `${id} chroma source should be preserved`);
    assert.ok(existsSync(new URL(asset.final, visualRoot)), `${id} transparent final should exist`);
  }
  const visualRendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  const visualSimulationSource = readFileSync(new URL("../src/simulation.js", import.meta.url), "utf8");
  assert.match(visualRendererSource, /glassDrops: "\.\/assets\/generated\/classic-visual-20260811-v1\/final\/glass-drops\.png"/);
  assert.match(visualRendererSource, /zeusGreekCircles: "\.\/assets\/generated\/classic-visual-20260811-v1\/final\/zeus-greek-circles\.png"/);
  assert.match(visualRendererSource, /fairyAccessories: "\.\/assets\/generated\/classic-visual-20260811-v2\/final\/fairy-accessories\.png"/);
  assert.match(visualRendererSource, /kind === "glass-shard"/);
  assert.match(visualRendererSource, /kind === "chain-lightning"/);
  assert.match(visualRendererSource, /kind === "frost-trail"/);
  assert.match(visualRendererSource, /for \(const \[side, frameOffset\] of \[\[-1, 0\], \[1, 3\]\]\)/, "Fairy must draw the two wings independently");
  assert.match(visualRendererSource, /classicFairyAccessoryCropFor\(frameOffset \+ wingFrame\)/, "Fairy wing crops must use independent authored cells");
  assert.match(visualRendererSource, /const wingFrame = moving \? Math\.floor\(time \* 8\) % 2 : 0/, "Fairy wings should flap upright while moving");
  assert.match(visualRendererSource, /classicFairyCastAngle/, "Fairy wand aim/casting should follow the live target");
  assert.match(visualSimulationSource, /updateClassicFairyState\(sim, fighter, liveTarget, vampireLatchSuppressesAttack\)/);
  assert.match(visualSimulationSource, /kind: "fairy-ammo"/);
  assert.match(visualSimulationSource, /hiveSpawnScale = 3/);
  assert.match(visualSimulationSource, /speed: 130/);
  assert.match(visualSimulationSource, /radius: 30/);
}

{
  const frostTrailRoot = new URL("../assets/generated/classic-visual-20260812-frost-trail-v3/", import.meta.url);
  const frostTrailManifest = JSON.parse(readFileSync(new URL("manifest.json", frostTrailRoot), "utf8"));
  const frostTrailAlpha = JSON.parse(readFileSync(new URL("alpha-validation.json", frostTrailRoot), "utf8"));
  assert.equal(frostTrailManifest.version, "classic-visual-20260812-frost-trail-v3");
  assert.equal(frostTrailManifest.generator, "User-supplied PNG");
  assert.equal(frostTrailManifest.assets.frostTrail.frameDimensions[0], 543);
  assert.equal(frostTrailManifest.assets.frostTrail.frameDimensions[1], 724);
  assert.equal(frostTrailManifest.assets.frostTrail.frames, 4);
  assert.ok(existsSync(new URL(frostTrailManifest.assets.frostTrail.source, frostTrailRoot)));
  assert.ok(existsSync(new URL(frostTrailManifest.assets.frostTrail.final, frostTrailRoot)));
  assert.equal(frostTrailAlpha.files["final/frost-trail.png"].cornersTransparent, true);
  assert.equal(frostTrailAlpha.files["final/frost-trail.png"].mode, "RGBA");
  const frostRendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  assert.match(frostRendererSource, /frostTrail: "\.\/assets\/generated\/classic-visual-20260812-frost-trail-v3\/final\/frost-trail\.png"/);
  assert.match(frostRendererSource, /snowballOrb: "\.\/assets\/generated\/orb-race-simple-20260731\/final\/snowball-orb\.png"/);
  assert.match(frostRendererSource, /angle: time \* 2\.35/);
  assert.match(frostRendererSource, /width: visualRadius \* 4\.45/);
  assert.match(frostRendererSource, /ctx\.lineWidth = Math\.max\(7, ownerRadius \* 0\.82\)/);
  assert.match(frostRendererSource, /drawClassicFrostTrailRibbon/);
  assert.match(frostRendererSource, /ctx\.lineCap = "round"/);
  assert.equal(classicFrostTrailAngleFor({ laidAngle: 0.35, angle: -1.2 }), 0.35);
  assert.equal(classicFrostTrailAngleFor({ angle: -1.2 }), -1.2);
  assert.equal(classicFrostTrailAngleFor({}), 0, "legacy trails without direction metadata should stay fixed");
  assert.match(frostRendererSource, /classicFrostTrailAngleFor\(entity\)/);
  assert.doesNotMatch(frostRendererSource, /frostTrailOwnerHeading/);
}

{
  const visualRoot = new URL("../assets/generated/classic-visual-20260811-v2/", import.meta.url);
  const visualManifest = JSON.parse(readFileSync(new URL("manifest.json", visualRoot), "utf8"));
  assert.equal(visualManifest.pack, "classic-visual-20260811-v2");
  const batmanBodyRoot = new URL("../assets/generated/classic-visual-20260811-v4/", import.meta.url);
  const batmanBodyManifest = JSON.parse(readFileSync(new URL("manifest.json", batmanBodyRoot), "utf8"));
  const batmanBodyAlpha = JSON.parse(readFileSync(new URL("alpha-validation.json", batmanBodyRoot), "utf8"));
  assert.equal(batmanBodyManifest.pack, "classic-visual-20260811-v4");
  assert.equal(batmanBodyManifest.assets["batman-orb-with-ears"].role.includes("connected"), true);
  assert.equal(batmanBodyAlpha.checks["batman-orb-with-ears.png"].singleConnectedSilhouette, true);
  assert.equal(batmanBodyAlpha.checks["batman-orb-with-ears.png"].transparentCorners, true);
  for (const [id, expectedFrames] of [["batman-orb", 1], ["batman-ears", 1], ["batman-batarang", 1], ["fairy-accessories", 8], ["fairy-projectile", 4], ["zeus-chain-lightning", 4]]) {
    const asset = visualManifest.assets[id];
    assert.equal(asset.frames, expectedFrames);
    assert.ok(existsSync(new URL(asset.source, visualRoot)), `${id} chroma source should be preserved`);
    assert.ok(existsSync(new URL(asset.final, visualRoot)), `${id} transparent final should exist`);
  }
  const visualRendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  assert.match(visualRendererSource, /fairyAccessories: "\.\/assets\/generated\/classic-visual-20260811-v2\/final\/fairy-accessories\.png"/);
  assert.match(visualRendererSource, /fairyProjectile: "\.\/assets\/generated\/classic-visual-20260811-v2\/final\/fairy-projectile\.png"/);
  assert.match(visualRendererSource, /zeusChainLightning: "\.\/assets\/generated\/classic-visual-20260811-v2\/final\/zeus-chain-lightning\.png"/);
  assert.match(visualRendererSource, /CLASSIC_GLASS_RENDER_SCALE = 2/);
  assert.match(visualRendererSource, /classicFairyAccessoryCropFor/);
  assert.match(visualRendererSource, /CLASSIC_FAIRY_PROJECTILE_RENDER_SCALE = 3\.3/);
  assert.match(visualRendererSource, /width: nodeRadius \* 1\.55/);
  assert.match(visualRendererSource, /owner\?\.type === "frost-ball"/);
}

{
  const freezeRoot = new URL("../assets/generated/classic-visual-20260812-frost-freeze-v1/", import.meta.url);
  const freezeManifest = JSON.parse(readFileSync(new URL("manifest.json", freezeRoot), "utf8"));
  const freezeAlpha = JSON.parse(readFileSync(new URL("alpha-validation.json", freezeRoot), "utf8"));
  assert.equal(freezeManifest.version, "classic-visual-20260812-frost-freeze-v1");
  assert.equal(freezeManifest.generator, "GPT Image built-in imagegen");
  assert.equal(freezeManifest.assets.frozenOrbOverlay.frames, 4);
  assert.ok(existsSync(new URL(freezeManifest.assets.frozenOrbOverlay.source, freezeRoot)));
  assert.ok(existsSync(new URL(freezeManifest.assets.frozenOrbOverlay.final, freezeRoot)));
  assert.equal(freezeAlpha.files["final/frozen-orb-overlay.png"].cornersTransparent, true);
  const freezeRendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  const freezeSimulationSource = readFileSync(new URL("../src/simulation.js", import.meta.url), "utf8");
  assert.match(freezeRendererSource, /frozenOrbOverlay: "\.\/assets\/generated\/classic-visual-20260812-frost-freeze-v1\/final\/frozen-orb-overlay\.png"/);
  assert.match(freezeRendererSource, /drawClassicFrozenOverlay\(ctx, fighter, fighter\.radius, time\)/);
  assert.match(freezeRendererSource, /fighter\?\.classicFrostFrozen !== true/);
  assert.match(freezeRendererSource, /ctx\.fillStyle = "#62d7ff"/);
  assert.match(freezeRendererSource, /drawClassicFrostTrailStreak/);
  assert.match(freezeSimulationSource, /const laidVx = Number\(fighter\.vx\);[\s\S]{0,180}Number\.isFinite\(laidVx\) \? laidVx : 1/);
  assert.match(freezeSimulationSource, /const laidAngle = Math\.atan2\(/);
  assert.match(freezeSimulationSource, /angle: laidAngle,[\s\S]{0,80}laidAngle,/);
  assert.match(freezeRendererSource, /fall = \(time \* radius \* 1\.7/);
  assert.match(freezeRendererSource, /width: radius \* 2\.82/);
  assert.match(freezeRendererSource, /kind === "frost-trail" \|\| \(kind === "train-track" && owner\?\.type === "frost-ball"\)/);
  assert.match(freezeRendererSource, /drawClassicZeusElectrifiedOverlay\(ctx, fighter, fighter\.radius, time\)/);
  assert.match(freezeRendererSource, /classicZeusElectrifiedPulseFor/);
  assert.match(freezeRendererSource, /drawClassicZeusHandLightning/);
  assert.match(freezeRendererSource, /drawClassicZeusLightningPath/);
}

{
  const first = classicZeusLightningPoints(10, 20, 110, 80, 0.5, 3, 6);
  const same = classicZeusLightningPoints(10, 20, 110, 80, 0.5, 3, 6);
  const later = classicZeusLightningPoints(10, 20, 110, 80, 0.8, 3, 6);
  assert.deepEqual(first, same, "Zeus lightning geometry should be deterministic at a fixed timestamp");
  assert.deepEqual(first[0], { x: 10, y: 20 });
  assert.deepEqual(first.at(-1), { x: 110, y: 80 });
  assert.notDeepEqual(first, later, "Zeus lightning should flicker between deterministic frames");
}

{
  const fairyWing = classicFairyAccessoryCropFor(0);
  const fairyWingFlap = classicFairyAccessoryCropFor(1);
  const fairyTiara = classicFairyAccessoryCropFor(6);
  const fairyWand = classicFairyAccessoryCropFor(7);
  for (const crop of [fairyWing, fairyWingFlap, fairyTiara, fairyWand]) {
    assert.ok(crop.width > 0 && crop.height > 0);
    assert.ok(crop.x >= 0 && crop.x + crop.width <= 2172);
    assert.ok(crop.y >= 0 && crop.y + crop.height <= 724);
  }
  assert.notDeepEqual(fairyWing, fairyWingFlap, "Fairy should alternate distinct upright wing poses");
  const frostCrop = classicSheetCropFor("frostTrail", {
    naturalWidth: 2172,
    naturalHeight: 724,
    frameCount: 4,
    frame: 0,
  });
  assert.equal(frostCrop.x, 0, "Snowball trail should preserve the supplied frame edge");
  assert.equal(frostCrop.y, 0, "Snowball trail should preserve the supplied frame edge");
  assert.equal(frostCrop.width, 2172 / 4);
  assert.equal(frostCrop.height, 724);
  const rendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  const socialRendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /kind === "frost-trail" \|\| \(kind === "train-track" && owner\?\.type === "frost-ball"\)/);
  assert.match(rendererSource, /ctx\.strokeStyle = "#ffffff";[\s\S]{0,220}fighter\.radius \* 1\.045/);
  assert.match(rendererSource, /drawnBatman\)[\s\S]{0,300}ctx\.strokeStyle = "#ffffff"/);
  assert.match(socialRendererSource, /ctx\.drawImage\(orb, -radius \* 1\.25, -radius \* 1\.25, radius \* 2\.5, radius \* 2\.5\);[\s\S]{0,180}ctx\.strokeStyle = "#ffffff"/);
}

{
  const mediaRoot = new URL("../assets/generated/classic-batman-orb-20260811-v1/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  assert.equal(manifest.pack, "classic-batman-orb-20260811-v1");
  assert.equal(manifest.hpOverlay, "game-drawn and centered after the body/accessory pass");
  assert.ok(existsSync(new URL(manifest.source, mediaRoot)), "Batman chroma source should be preserved");
  const final = new URL(manifest.final, mediaRoot);
  assert.ok(existsSync(final), "Batman orb final should exist");
  assert.deepEqual([...readFileSync(final).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const prompt = readFileSync(new URL(manifest.promptFile, mediaRoot), "utf8");
  assert.match(prompt, /complete round dark charcoal\/black orb/);
  assert.match(prompt, /Do not include HP, numbers, text, logos/);
  const rendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  const socialRendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /drawClassicHealthText\(ctx, fighter, fighter\.radius\)/, "Classic HP must remain a game-drawn center overlay");
  assert.match(socialRendererSource, /drawImage\(orb, -radius \* 1\.25, -radius \* 1\.25, radius \* 2\.5, radius \* 2\.5\)/, "Orb Race should use the same full Batman orb body");
}
{
  const mediaRoot = new URL("../assets/generated/classic-visual-20260810-v2/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  assert.equal(manifest.pack, "classic-visual-20260810-v2");
  assert.equal(manifest.pipeline.rendering, "nearest-neighbor");
  for (const asset of manifest.assets.filter(({ final }) => final)) {
    assert.ok(existsSync(new URL(`../${asset.source}`, import.meta.url)), `${asset.id} source should be preserved`);
    const finalPath = new URL(`../${asset.final}`, import.meta.url);
    assert.ok(existsSync(finalPath), `${asset.id} final should exist`);
    assert.deepEqual([...readFileSync(finalPath).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${asset.id} final should be a PNG`);
    if (asset.alpha) {
      assert.ok(asset.alpha.transparent > 0, `${asset.id} should have transparent pixels`);
      assert.ok(asset.alpha.opaque > 0, `${asset.id} should have opaque pixels`);
    }
  }
  const prompts = readFileSync(new URL("prompts.md", mediaRoot), "utf8");
  assert.match(prompts, /double-barrel shotgun/);
  assert.match(prompts, /tactical rifle/);
  assert.match(prompts, /scaly monster fists/);
  assert.match(prompts, /straight silver sniper bullet/);
  const rendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  for (const filename of ["shotgun-sheet.png", "rifle-sheet.png", "monster-fists-sheet.png", "necromancer-arrows-sheet.png", "sniper-ammo-sheet.png"]) {
    assert.equal(rendererSource.includes(`classic-visual-20260810-v2/final/${filename}`), true, `${filename} should be mapped by the renderer`);
  }
}

{
  const mediaRoot = new URL("../assets/generated/classic-visual-20260810-v3/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  assert.equal(manifest.pack, "classic-visual-20260810-v3");
  assert.equal(manifest.pipeline.source, "GPT Image");
  assert.equal(manifest.pipeline.rendering, "nearest-neighbor");
  const [asset] = manifest.assets;
  assert.equal(asset.id, "classic-shotgun-shells-sheet");
  assert.deepEqual(asset.frames, ["normal", "muzzle-spark", "impact-spark"]);
  assert.ok(existsSync(new URL(`../${asset.source}`, import.meta.url)), "shotgun shell chroma source should be preserved");
  const final = new URL(`../${asset.final}`, import.meta.url);
  assert.ok(existsSync(final), "shotgun shell final should exist");
  assert.deepEqual([...readFileSync(final).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], "shotgun shell final should be a PNG");
  assert.equal(asset.alpha.corners.join(","), "0,0,0,0", "shotgun shell final corners should be transparent");
  const prompts = readFileSync(new URL("prompts.md", mediaRoot), "utf8");
  assert.match(prompts, /red rectangular shell body/);
  const rendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /classic-visual-20260810-v3\/final\/shotgun-shells-sheet\.png/);
}

{
  const mediaRoot = new URL("../assets/generated/classic-necromancer-bow-20260810-v1/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  assert.equal(manifest.pack, "classic-necromancer-bow-20260810-v1");
  assert.equal(manifest.pipeline.source, "GPT Image");
  assert.equal(manifest.pipeline.rendering, "nearest-neighbor");
  assert.equal(manifest.assets[0].frameCount, 4);
  assert.equal(manifest.assets[0].layout, "horizontal");
  assert.ok(existsSync(new URL("source/necromancer-bow-animation-sheet-chroma.png", mediaRoot)));
  const finalPath = new URL("final/necromancer-bow-animation-sheet.png", mediaRoot);
  assert.ok(existsSync(finalPath));
  assert.deepEqual([...readFileSync(finalPath).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const promptText = readFileSync(new URL("prompts.md", mediaRoot), "utf8");
  assert.match(promptText, /four-frame sprite strip/);
  assert.match(promptText, /no orb, no character, no hands/);
  const rendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /necromancerBowAnimation: .*classic-necromancer-bow-20260810-v1\/final\/necromancer-bow-animation-sheet\.png/);
}

{
  const sharedClassicColors = {
    flash: "flash",
    charger: "charger",
    parasites: "parasite",
    artist: "artists",
    turret: "turret",
  };
  for (const [classicId, raceId] of Object.entries(sharedClassicColors)) {
    assert.equal(
      classicVisualColorFor(classicId, "#000000"),
      ORB_RACERS[raceId].color,
      `${classicId} should use Orb Racer ${raceId}'s recognizable body color in Classic`,
    );
  }
  assert.deepEqual(classicSplodeyBombStyleFor(false), {
    fill: "#050505",
    stroke: "#080808",
    highlight: "#ff8a1f",
  });
  assert.deepEqual(classicSplodeyBombStyleFor(true), {
    fill: "#ffffff",
    stroke: "#080808",
    highlight: "#ff8a1f",
  });
  assert.equal(classicSplodeyBombRadiusFor(), Math.max(7, 720 * 0.012));
  const rendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /kind === "necromancer-soldier"/);
  assert.match(rendererSource, /drawNecromancerMinion/);
  assert.match(rendererSource, /\(Number\(owner\?\.radius\) \|\| radius\) \* 0\.55/);
  assert.match(rendererSource, /ctx\.fillStyle = "#85898f"/);
  assert.match(rendererSource, /drawNecromancerArrow/);
  assert.match(rendererSource, /kind === "necromancer-arrow"/);
  assert.match(rendererSource, /kind === "spike"/);
  assert.match(rendererSource, /kind === "blue-sun-laser"/);
  const classicDetailsSource = rendererSource.slice(
    rendererSource.indexOf("  drawClassicOrbDetails(ctx"),
    rendererSource.indexOf("\n  drawClassic", rendererSource.indexOf("  drawClassicOrbDetails(ctx") + 1),
  );
  assert.match(classicDetailsSource, /eight simulation-owned blue-sun-laser entities/);
  assert.doesNotMatch(classicDetailsSource, /for \(let ray = 0; ray < 8/);
  assert.match(rendererSource, /ctx\.strokeStyle = entity\.laserColor \|\| "#22e9ff"/);
  assert.match(rendererSource, /const beamLength = Math\.hypot\(localX2, localY2\)/);
  assert.match(rendererSource, /ctx\.rotate\(-angle\)/, "Blue Sun rays must undo the entity rotation before drawing world endpoints");
  assert.match(rendererSource, /drawClassicSwordWeapon/);
  assert.match(rendererSource, /classicSwordSourceRect/);
  const swordSource = classicSwordSourceRect(89, 96);
  assert.ok(swordSource.width > 89 * 0.8, "the sword crop must retain the full blade span");
  assert.ok(swordSource.height > 96 * 0.8, "the sword crop must retain the lower-right hilt");
  const swordRestPose = classicSwordHeldPose(40);
  const swordPokePose = classicSwordHeldPose(40, { attackMode: "poke", extension: 1 });
  assert.ok(swordRestPose.handleStart >= 40 * 1.02);
  assert.ok(swordRestPose.mountDistance > 40 * 1.1, "the held sword hilt must stay outside the orb rim");
  assert.ok(swordRestPose.mountDistance < 40 * 1.5, "the held sword hilt should sit beside the orb, not float far away");
  assert.ok(swordRestPose.handleStart < swordRestPose.guardDistance, "the handle must visibly bridge the orb rim and guard");
  assert.ok(swordPokePose.mountDistance > swordRestPose.mountDistance, "a poke should extend the held sword outward");
  assert.match(rendererSource, /classicSwordHeldPose/);
  assert.match(rendererSource, /drawClassicHeldSwordOverlay/);
  assert.match(rendererSource, /Held swords are a top-layer accessory/);
  assert.match(rendererSource, /swingOffset/);
  assert.match(rendererSource, /kind === "turret"[\s\S]*?ctx\.fillStyle = "#ff7a00"/);
  assert.match(rendererSource, /kind === "projectile" && owner\?\.type === "turret"/);
  assert.match(rendererSource, /classicSplodeyBombRadiusFor/);
  assert.match(rendererSource, /blackTheme \? "#ffffff" : "#050505"/);
  const classicEntitySource = rendererSource.slice(
    rendererSource.indexOf("drawClassicEntities"),
    rendererSource.indexOf("drawClassicOrbiters"),
  );
  assert.doesNotMatch(
    classicEntitySource,
    /kind === "turret"[\s\S]*?get\("turretCannon"\)[\s\S]*?drawImage/,
    "Classic spawned Turrets should render as pure orange balls without a cannon silhouette",
  );
}
{
  const boxerRoot = new URL("../assets/generated/classic-media-20260808-boxer-v3/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", boxerRoot), "utf8"));
  const asset = manifest.assets.boxer;
  assert.equal(manifest.version, "classic-media-20260808-boxer-v3");
  assert.deepEqual(asset.frames, ["guarded", "extended", "impact"]);
  assert.equal(asset.dimensions, "1536x1024; 3 equal 512x1024 frames");
  assert.ok(existsSync(new URL("source/boxer-gloves-sheet-chroma.png", boxerRoot)));
  const finalPath = new URL("final/boxer-gloves-sheet.png", boxerRoot);
  assert.ok(existsSync(finalPath));
  assert.deepEqual([...readFileSync(finalPath).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(asset.alpha.transparent_corners, true);
  assert.ok(asset.alpha.transparent_pixels > 0 && asset.alpha.partial_pixels > 0);
  const promptText = readFileSync(new URL("prompts.md", boxerRoot), "utf8");
  assert.match(promptText, /two oversized red boxing gloves/);
  assert.match(promptText, /empty center/);
}
for (const asset of ["head.png", "body.png", "tail.png", "legs.png", "atomic-breath.png", "atomic-burn.png"]) {
  assert.equal(existsSync(new URL(`../assets/race/generated/godzilla/${asset}`, import.meta.url)), true, `${asset} should ship with Godzilla`);
}
{
  const godzillaRoot = new URL("../assets/generated/orb-race-godzilla-20260806/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", godzillaRoot), "utf8"));
  const alphaValidation = JSON.parse(readFileSync(new URL(manifest.alphaValidation, godzillaRoot), "utf8"));
  assert.equal(manifest.assets.length, 1, "Godzilla should use one full-body animation sheet");
  assert.deepEqual(manifest.assets[0].grid, { columns: 4, rows: 4 });
  assert.equal(alphaValidation.transparentCorners, true, "Godzilla animation corners should be transparent");
  const finalPath = new URL(manifest.assets[0].final, godzillaRoot);
  const finalPng = readFileSync(finalPath);
  assert.deepEqual([...finalPng.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], "Godzilla animation should be a PNG");
  assert.deepEqual(alphaValidation.assets[manifest.assets[0].final].cornersAlpha, [0, 0, 0, 0]);
  assert.ok(finalPng.byteLength > 4096, "Godzilla animation should contain generated pixels");
  const promptText = readFileSync(new URL(manifest.prompts, godzillaRoot), "utf8");
  assert.match(promptText, /original pixel-art/);
  assert.match(promptText, /do not let any character cross cell boundaries/);
  const rendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /godzillaAnimation: new URL/);
  assert.match(rendererSource, /drawRaceGodzillaDownwardBreath/);
  assert.match(rendererSource, /this\.drawRaceSheetGridCell\(\n\s+ctx,\n\s+animation,/);
  assert.match(rendererSource, /raceGodzillaBreathDirection.*down/);
}
{
  const godzillaRoot = new URL("../assets/generated/orb-race-godzilla-20260806-v2/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", godzillaRoot), "utf8"));
  const alphaValidation = JSON.parse(readFileSync(new URL(manifest.alphaValidation, godzillaRoot), "utf8"));
  const asset = manifest.assets[0];
  assert.equal(asset.id, "godzilla-animation-sheet");
  assert.deepEqual(asset.grid, { columns: 4, rows: 4 });
  assert.deepEqual(asset.rows, [
    "walk-0..3",
    "tail-smack-0..3",
    "stomp-0..3",
    "atomic-breath-down-0..3",
  ]);
  assert.equal(existsSync(new URL(asset.source, godzillaRoot)), true, "Godzilla v2 should preserve its generated chroma source");
  assert.equal(existsSync(new URL(asset.rawFinal, godzillaRoot)), true, "Godzilla v2 should preserve its raw alpha-converted sheet");
  const finalPath = new URL(asset.final, godzillaRoot);
  const finalPng = readFileSync(finalPath);
  assert.deepEqual([...finalPng.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], "Godzilla v2 should be a PNG");
  const validation = alphaValidation.assets[asset.final];
  assert.deepEqual(validation.cornersAlpha, [0, 0, 0, 0]);
  assert.equal(validation.cellAlphaBounds.length, 16);
  assert.ok(validation.cellAlphaBounds.every(([left, top, right, bottom]) => (
    left > 0 && top > 0 && right < 313.5 && bottom < 313.5
  )), "Godzilla v2 frames should have transparent safety margins on every side");
  const promptText = readFileSync(new URL(manifest.prompts, godzillaRoot), "utf8");
  assert.match(promptText, /alternating leg lift/);
  assert.match(promptText, /STOMP/);
  assert.match(promptText, /ATOMIC-BREATH-DOWN/);
  assert.match(promptText, /Never let a tail, foot, dorsal plate, beam, crack, glow, or any other pixel cross a cell boundary/);
  const rendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /godzillaAnimationV2: new URL/);
  assert.match(rendererSource, /raceSprite\("godzillaAnimationV2"\)/);
  assert.match(rendererSource, /attackKind === "stomp"/);
  assert.match(rendererSource, /!animationV2 && phase === "fire"/);
}
for (const orbId of ["boomerang", "magnet", "mines", "gravity", "jackpot", "ricochet", "sawblade", "meteor", "black-hole", "godzilla"]) {
  assert.equal(ORB_RACERS[orbId].symbol, "", `${orbId} should not use a letter icon`);
}
assert.equal(ORB_RACERS.mines.name, "SPLODEY", "the stable mines ID should display the Splodey rebrand");

{
  const mediaRoot = new URL("../assets/generated/orb-race-media-20260804/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  const alphaValidation = JSON.parse(readFileSync(new URL(manifest.alphaValidation, mediaRoot), "utf8"));
  assert.equal(alphaValidation.transparentCorners, true, "generated media must have transparent corners");
  for (const asset of manifest.assets) {
    const source = new URL(asset.source, mediaRoot);
    const final = new URL(asset.final, mediaRoot);
    assert.ok(existsSync(source), `${asset.id} must preserve its chroma source`);
    assert.ok(existsSync(final), `${asset.id} must ship its RGBA final`);
    const png = readFileSync(final);
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${asset.id} final must be a PNG`);
    assert.equal(png.readUInt32BE(16), alphaValidation.assets[final.pathname.split("/").pop()].width, `${asset.id} width should match alpha validation`);
    assert.equal(png.readUInt32BE(20), alphaValidation.assets[final.pathname.split("/").pop()].height, `${asset.id} height should match alpha validation`);
    assert.deepEqual(alphaValidation.assets[final.pathname.split("/").pop()].cornersAlpha, [0, 0, 0, 0]);
    assert.ok(readFileSync(source).byteLength > 4096, `${asset.id} source should contain generated pixels`);
    assert.ok(readFileSync(final).byteLength > 4096, `${asset.id} final should contain generated pixels`);
    assert.ok(asset.grid.columns >= 2 && asset.grid.rows >= 1, `${asset.id} should declare a sprite grid`);
  }
  const promptText = readFileSync(new URL(manifest.prompts, mediaRoot), "utf8");
  assert.match(promptText, /original pixel-art/);
  assert.match(promptText, /do not copy any reference image/);
  const rendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /grapplerSheet: new URL/);
  assert.match(rendererSource, /drawRaceSheetGridCell\(/);
  assert.match(rendererSource, /drawRaceTreeRoots\(/);
  assert.match(rendererSource, /racePancakeButterMeteors/);
}

{
  const mediaRoot = new URL("../assets/generated/orb-race-media-20260804-v2/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  const alphaValidation = JSON.parse(readFileSync(new URL(manifest.alphaValidation, mediaRoot), "utf8"));
  assert.equal(manifest.version, "orb-race-media-20260804-v2");
  assert.equal(manifest.assets.length, 2, "the v2 media pack should contain the new effect sheets");
  assert.equal(alphaValidation.transparentCorners, true, "v2 generated media must have transparent corners");
  for (const asset of manifest.assets) {
    const source = new URL(asset.source, mediaRoot);
    const final = new URL(asset.final, mediaRoot);
    const finalName = final.pathname.split("/").pop();
    assert.ok(existsSync(source), `${asset.id} must preserve its v2 chroma source`);
    assert.ok(existsSync(final), `${asset.id} must ship its v2 RGBA final`);
    const png = readFileSync(final);
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${asset.id} v2 final must be a PNG`);
    assert.equal(png.readUInt32BE(16), alphaValidation.assets[finalName].width, `${asset.id} v2 width should match alpha validation`);
    assert.equal(png.readUInt32BE(20), alphaValidation.assets[finalName].height, `${asset.id} v2 height should match alpha validation`);
    assert.deepEqual(alphaValidation.assets[finalName].cornersAlpha, [0, 0, 0, 0]);
    assert.ok(asset.grid.columns >= 2 && asset.grid.rows >= 1, `${asset.id} v2 should declare a sprite grid`);
  }
  const promptText = readFileSync(new URL(manifest.prompts, mediaRoot), "utf8");
  assert.match(promptText, /original 2D pixel-art/);
  assert.match(promptText, /no copied proprietary art/);
  const rendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /artistFairy: new URL/);
  assert.match(rendererSource, /artistMonster: new URL/);
  assert.match(rendererSource, /thunderCloud: new URL/);
  assert.match(rendererSource, /treeRootsPiercing: new URL/);
  assert.match(rendererSource, /generatedMonster = raceSprite\("artistMonster"\)/);
  assert.match(rendererSource, /generatedFairy = raceSprite\("artistFairy"\)/);
  assert.match(rendererSource, /drawArtistSketch/);
  assert.match(rendererSource, /artistsPaintings: new URL/);
  assert.match(rendererSource, /artistsGrowthStorm: new URL/);
  assert.match(rendererSource, /pancakeSyrup: new URL/);
  assert.match(rendererSource, /pancakeButterPatch: new URL/);
  assert.match(rendererSource, /drawRaceSheetCell\(ctx, syrup, 5, 6/);
  assert.match(rendererSource, /drawRaceSheetCell\(ctx, butter, variant, 4/);
  assert.match(rendererSource, /const count = 1/, "Pancake should render as one pancake without a stacking visual");
  assert.match(rendererSource, /const turn = holding \? 1 : Math\.max\(0\.12, Math\.abs\(Math\.cos\(Math\.PI \* flipProgress\)\)\)/, "Pancake should flip without diagonal rotation");
  assert.match(rendererSource, /ctx\.scale\(direction, turn\)/, "Pancake should use a clean front/back turn");
  assert.match(rendererSource, /followsArc = false/, "Pancake stacks should support the active orb arc");
  assert.match(rendererSource, /normalizedGroundY !== null/, "Artist ground anchors should preserve the number line when no custom anchor is supplied");
  assert.match(rendererSource, /drawStormLightning/);
  assert.match(rendererSource, /stormCloudGeometryFor/, "Storm lightning should share geometry with its cloud");
  assert.match(rendererSource, /sourceDrawingId/, "Storm strikes should resolve to their source cloud");
  assert.match(rendererSource, /visualLane/, "Storm visuals should use deterministic cloud-aligned lanes");
  assert.match(rendererSource, /slice\(-3\)/, "Storm visuals should render at most three active lightning bolts per cloud");
  assert.match(rendererSource, /const topY = Math\.min\([\s\S]*?cloud\.centerY \+ cloud\.height \* 0\.2/, "Storm lightning should begin beneath the cloud");
  assert.match(rendererSource, /for \(let visualLane = 0; visualLane < 3; visualLane \+= 1\)/, "Storm should render three visible lightning lanes");
  assert.match(rendererSource, /const centerY = Math\.max\([\s\S]*?rect\.y \+ height \* 0\.14,[\s\S]*?groundY - Math\.max\(radius \* 3\.4, height \* 0\.72\)/, "Storm should stay airborne and inside the board crop");
  assert.match(rendererSource, /#fde047/, "Bloom empowerment should use a yellow outline");
  assert.match(rendererSource, /roughBallPatterns/, "Artist reveal should use a neutral rough-ball scribble");
  assert.match(rendererSource, /drawCracks/);
  assert.match(rendererSource, /drawingCounts = new Map\(\)/, "Artist drawings should have renderer-side duplicate limits");
  assert.doesNotMatch(rendererSource, /SUNRISE|Solar is always a background painting/, "Solar should be removed from the Artist renderer");
  assert.doesNotMatch(rendererSource, /drawRacePancakeCell/, "Pancake should use explicit patch assets rather than stale cell helpers");
  assert.match(rendererSource, /const spawnProgress = Number\.isFinite\(Number\(summon\.spawnProgress\)\)/, "Monster summons should render their deterministic fall-in state");
  assert.match(rendererSource, /generatedMonster,[\s\S]*?4,[\s\S]*?2,[\s\S]*?0,[\s\S]*?spriteY/, "Monster sprite mirroring should stay centered after the facing transform");
  assert.match(rendererSource, /generatedFairy,[\s\S]*?4,[\s\S]*?2,[\s\S]*?0,[\s\S]*?spriteY/, "Fairy sprite mirroring should stay centered after the facing transform");
  assert.match(rendererSource, /const treeWidth = radius \* 8\.4/, "Tree should use the standalone asset at three times its prior size");
  assert.doesNotMatch(rendererSource, /this\.drawRaceTreeRoots\(ctx, racer, rect, radius, time\)/, "Tree roots should remain disabled while the orb asset is tuned");
  assert.doesNotMatch(rendererSource, /fillText\(painting\.name/, "Artist drawings should not have labels below them");
  assert.doesNotMatch(rendererSource, /painting\.name\} · .*formatOrbRaceNumber\(painting\.damage\)/, "Artist labels should not show damage multipliers");
  assert.match(rendererSource, /ctx\.rect\(rect\.x, groundY, rect\.width/, "Pancake patches should be clipped below the number line");
  assert.match(rendererSource, /racePancakeVisibleX/, "Pancake stacks and landing marks should share the chamber edge guard");
  const pancakeStackTransform = rendererSource.slice(
    rendererSource.indexOf("transformed.racePancakeStacks ="),
    rendererSource.indexOf("transformed.raceGrapplerPull ="),
  );
  assert.doesNotMatch(
    pancakeStackTransform,
    /groundY:/,
    "long-form Pancake stacks must not retain a renderer-only hold-layer anchor",
  );
  const pancakeActiveTransform = rendererSource.slice(
    rendererSource.indexOf("transformed.racePancakeActiveStack ="),
    rendererSource.indexOf("transformed.raceBlueSunLasers ="),
  );
  assert.doesNotMatch(
    pancakeActiveTransform,
    /groundY:/,
    "long-form active Pancake must seat against its live layer",
  );
  assert.match(rendererSource, /for \(const patch of syrupPatches\)/, "Pancake should render every syrup patch retained for the active lane");
  assert.match(rendererSource, /for \(const patch of butterPatches\)/, "Pancake should render every butter patch retained for the active lane");
  assert.match(rendererSource, /const damageScale = Math\.max\(1, Number\(patch\?\.damageScale\)/, "Syrup visuals should reflect the deterministic damage scale");
  assert.match(rendererSource, /const durationScale = Math\.max\(1, Number\(patch\?\.durationScale\)/, "Syrup visuals should reflect the deterministic duration scale");
  assert.match(rendererSource, /const patchScale = Math\.max\(0\.9, Math\.min\(1\.8/, "Syrup marks should grow as their damage profile grows");
  assert.match(rendererSource, /Gameplay removes landing marks when the shared race lane advances/, "Pancake visuals should follow shared-layer cleanup");
  assert.doesNotMatch(rendererSource, /const latestSyrupAt = syrupPatches\.reduce/, "Pancake landing visuals should not hide retained patch families");
}

{
  const fighters = [
    { id: "fighter-a", raceOrbId: "speed", raceTeamIndex: 0, raceLayerHealth: [10] },
    { id: "fighter-b", raceOrbId: "orbital", raceTeamIndex: 1, raceLayerHealth: [10] },
  ];
  const slots = raceRenderTeamSlots({
    fighters,
    // A partially restored browser snapshot can carry a sparse team array.
    raceTeams: [null, null],
    raceLayerStrengths: [10],
  });
  assert.equal(slots.length, 2, "Orb Race rendering should always expose two team slots");
  assert.deepEqual(slots.map((team) => team?.memberIds), [["fighter-a"], ["fighter-b"]]);

  const rendererProbe = Object.create(SocialBattleRenderer.prototype);
  assert.equal(
    rendererProbe.racePancakeGroundY({ y: 0.87, layerIndex: 0 }, { y: 10, height: 100 }),
    97,
    "long-form Pancake patches should use their transformed live y instead of a stale layer index",
  );
}

{
  const mediaRoot = new URL("../assets/generated/orb-race-media-20260805-thunder-cloud/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  const alphaValidation = JSON.parse(readFileSync(new URL(manifest.alphaValidation, mediaRoot), "utf8"));
  assert.equal(manifest.version, "orb-race-media-20260805-thunder-cloud");
  assert.equal(manifest.assets.length, 1, "the Thunder media pack should contain one gray cloud sheet");
  const [asset] = manifest.assets;
  assert.equal(asset.grid.columns, 4);
  assert.equal(asset.grid.rows, 1);
  assert.ok(existsSync(new URL(asset.source, mediaRoot)), "the Thunder chroma source should be preserved");
  const final = new URL(asset.final, mediaRoot);
  const png = readFileSync(final);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual(alphaValidation.size, [png.readUInt32BE(16), png.readUInt32BE(20)]);
  assert.deepEqual(alphaValidation.corners, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  const promptText = readFileSync(new URL(manifest.prompts, mediaRoot), "utf8");
  assert.match(promptText, /gray thunderclouds only/);
  assert.match(promptText, /no lightning/);
}

{
  const mediaRoot = new URL("../assets/generated/orb-race-media-20260805-procedural-artists/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  const alphaValidation = JSON.parse(readFileSync(new URL(manifest.alphaValidation, mediaRoot), "utf8"));
  assert.equal(manifest.version, "orb-race-media-20260805-procedural-artists");
  assert.equal(manifest.assets.length, 2, "the procedural Artist media pack should contain Fairy and Monster sheets");
  assert.equal(alphaValidation.transparentCorners, true, "Artist sheets should have transparent corners after key removal");
  for (const asset of manifest.assets) {
    const source = new URL(asset.source, mediaRoot);
    const final = new URL(asset.final, mediaRoot);
    const finalName = final.pathname.split("/").pop();
    assert.ok(existsSync(source), `${asset.id} should preserve its chroma source`);
    assert.ok(existsSync(final), `${asset.id} should ship its RGBA final`);
    const png = readFileSync(final);
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${asset.id} final must be a PNG`);
    assert.equal(png.readUInt32BE(16), alphaValidation.assets[finalName].width);
    assert.equal(png.readUInt32BE(20), alphaValidation.assets[finalName].height);
    assert.deepEqual(alphaValidation.assets[finalName].cornersAlpha, [0, 0, 0, 0]);
    assert.equal(asset.grid.columns, 4);
    assert.equal(asset.grid.rows, 2);
  }
  const promptText = readFileSync(new URL(manifest.prompts, mediaRoot), "utf8");
  assert.match(promptText, /original pixel-art/);
  assert.match(promptText, /chroma/);
}

{
  const mediaRoot = new URL("../assets/generated/orb-race-media-20260805-pancake-patches/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", mediaRoot), "utf8"));
  const alphaValidation = JSON.parse(readFileSync(new URL(manifest.alphaValidation, mediaRoot), "utf8"));
  assert.equal(manifest.version, "orb-race-media-20260805-pancake-patches");
  assert.equal(manifest.assets.length, 1, "the pancake patch media pack should contain the butter patch sheet");
  assert.equal(alphaValidation.transparentCorners, true, "the butter patch sheet should have transparent corners");
  const [asset] = manifest.assets;
  assert.equal(asset.grid.columns, 4);
  assert.equal(asset.grid.rows, 1);
  assert.ok(existsSync(new URL(asset.source, mediaRoot)), "the generated butter source should be preserved");
  const final = new URL(asset.final, mediaRoot);
  const png = readFileSync(final);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), alphaValidation.size[0]);
  assert.equal(png.readUInt32BE(20), alphaValidation.size[1]);
  assert.deepEqual(alphaValidation.corners, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  const promptText = readFileSync(new URL(manifest.prompts, mediaRoot), "utf8");
  assert.match(promptText, /butter landing patch/);
}

{
  assert.deepEqual(
    raceOrbSplitColors(ORB_RACERS.fibonacci, { raceAbilityIds: ["fibonacci", "mines"] }),
    [ORB_RACERS.fibonacci.color, ORB_RACERS.mines.color],
    "Fibonacci + Splodey combo orbs should split into the two ability colors",
  );
  assert.deepEqual(
    raceOrbSplitColors(ORB_RACERS.mines, { raceAbilityIds: ["mines", "fibonacci"] }),
    [ORB_RACERS.mines.color, ORB_RACERS.fibonacci.color],
    "combo color order should follow the base ability first",
  );
  assert.deepEqual(
    raceOrbSplitColors(ORB_RACERS.speed, { raceAbilityIds: ["speed", "poison"] }),
    [ORB_RACERS.speed.color, ORB_RACERS.poison.color],
    "borrowed Poison should use the existing split-color combo renderer",
  );
  assert.deepEqual(
    raceOrbSplitColors(
      ORB_RACERS.speed,
      { raceAbilityIds: ["speed"] },
      [ORB_RACERS.speed.color, ORB_RACERS.duplicator.color],
    ),
    null,
    "separate base-orb teams should keep individual colors instead of splitting",
  );
  assert.deepEqual(
    raceTitleSegmentsFor(
      { members: [{ raceAbilityIds: ["fibonacci", "mines"] }] },
      "FIBPLODEY",
    ),
    [
      { text: "FIB", color: ORB_RACERS.fibonacci.color },
      { text: "PLODEY", color: ORB_RACERS.mines.color },
    ],
    "combo titles should split at the requested name seam and use both ability colors",
  );
}

{
  const fillStyles = [];
  const context = {
    save() {},
    restore() {},
    translate() {},
    beginPath() {},
    arc() {},
    moveTo() {},
    closePath() {},
    clip() {},
    fill() {},
    stroke() {},
    fillRect() {},
    fillText() {},
    set fillStyle(value) { fillStyles.push(value); },
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
  };
  const rendererProbe = Object.create(SocialBattleRenderer.prototype);
  rendererProbe.drawRaceOrbEmblem = SocialBattleRenderer.prototype.drawRaceOrbEmblem;
  rendererProbe.drawRaceOrbUnit(
    context,
    ORB_RACERS["ying-yang"],
    40,
    40,
    20,
    { raceOrbId: "ying-yang", raceYingYangMode: "damage" },
    0,
  );
  assert.ok(fillStyles.includes("#090909"), "Ying Yang damage mode should render black");
  fillStyles.length = 0;
  rendererProbe.drawRaceOrbUnit(
    context,
    ORB_RACERS["ying-yang"],
    40,
    40,
    20,
    { raceOrbId: "ying-yang", raceYingYangMode: "speed" },
    0,
  );
  assert.ok(fillStyles.includes("#ffffff"), "Ying Yang speed mode should render white");
  fillStyles.length = 0;
  assert.equal(raceReactorColorFor({ raceReactorCharge: 0 }), ORB_RACERS.reactor.color, "Reactor should start with its blue theme at no charge");
  assert.equal(raceReactorColorFor({ raceReactorCharge: 100 }), "#9de9ff", "Reactor should reach light blue at full charge");
  assert.notEqual(
    raceReactorColorFor({ raceReactorCharge: 50 }),
    "#000000",
    "Reactor color should ramp continuously between empty and full charge",
  );
  assert.equal(
    raceThemeColorForRacer({ raceOrbId: "reactor" }),
    ORB_RACERS.reactor.color,
    "Reactor HUD text should remain blue",
  );
  rendererProbe.drawRaceOrbUnit(
    context,
    ORB_RACERS["hydrogen-bomb"],
    40,
    40,
    20,
    { raceOrbId: "hydrogen-bomb" },
    0,
  );
  assert.ok(fillStyles.includes("#242024"), "Hydrogen Bomb should use the round symbol as its ball body");
  fillStyles.length = 0;
  rendererProbe.drawRaceOrbUnit(
    context,
    ORB_RACERS.turret,
    40,
    40,
    20,
    { raceOrbId: "turret" },
    0,
  );
  assert.ok(fillStyles.includes(ORB_RACERS.turret.color), "Turret should use its orange body color");
  assert.equal(ORB_RACERS.turret.color, "#ff7a00", "Turret should use the orange base color");
  assert.equal(ORB_RACERS.turret.accent, "#ff7a00", "Turret should use the same orange accent");
  assert.equal(ORB_RACERS.turret.symbol, "", "Turret should not expose a symbol");
  assert.equal(fillStyles.includes("#202020"), false, "Turret should not draw a dark barrel emblem on the orb");
  assert.equal(fillStyles.includes("#ffd166"), false, "Turret should not draw a yellow center emblem on the orb");
  const turretRendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  assert.match(turretRendererSource, /drawRaceTurretBody/, "Turret should use the edge-mounted shooter body renderer");
  assert.match(turretRendererSource, /radius \* 0\.5/, "Turret's black shooter should be mounted along the orange orb border");
  assert.match(turretRendererSource, /raceBlueSunBodyColorFor/, "Blue Sun should ramp its body color as it powers up");
  assert.match(turretRendererSource, /raceBlueSunLasers/, "Blue Sun should render collision-bounded physical laser segments");
  assert.match(turretRendererSource, /clipRaceSunLaserToLayer\(ctx, rect, laser\)/, "Sun laser variants should clip at physical layer contacts");
  assert.match(turretRendererSource, /transformed\.racePhaseThreeSunLasers = .*transformSunLaser/, "Phase Three Sun rays should use the long-form y transform");
  assert.match(turretRendererSource, /transformed\.racePhaseTwoSunLasers = .*transformSunLaser/, "Phase Two Sun rays should use the long-form y transform");
  assert.match(turretRendererSource, /transformed\.racePurpleSunBeam = racer\.racePurpleSunBeam/, "Purple Sun's beam should use the long-form y transform");
  assert.match(turretRendererSource, /drawRacePurpleSunBeam/, "Purple Sun should render one dedicated downward beam");
  assert.match(turretRendererSource, /const impactRings = effect\.purpleSunImpact \|\| effect\.laserImpact \|\| effect\.blueSunImpact/, "Purple Sun should render a dedicated impact effect");
  assert.doesNotMatch(turretRendererSource, /if \(effect\.purpleSunImpact\) \{[\s\S]*?fillStyle = "#ffffff"/, "Purple Sun impacts should not add a terminal white dot");
  assert.match(turretRendererSource, /const ringCount = Math\.max\(1, Math\.min\(8, Math\.floor\(Number\(effect\.ringCount\)/, "beam impacts should render multiple expanding rings");
  assert.match(turretRendererSource, /\["#ff3b5c", "#ffc2ca"\]/, "Lazer impacts should use a bright red/pink ring palette");
  assert.match(turretRendererSource, /racePurpleSunPowerLevel/, "Purple Sun should expose Blue Sun's power-level HUD contract");
  assert.match(
    turretRendererSource,
    /if \(racer\?\.raceOrbId === "purple-sun"\) \{\s*return `LASER: \$\{formatCombatValue\(racer\.racePurpleSunBeamDamage \|\| 8000\)\}\/SEC`;/,
    "Purple Sun should show laser damage per second instead of generic weapon damage",
  );
  assert.equal(ORB_RACERS["purple-sun"].color, "#a855f7", "Purple Sun should use the lighter purple base theme");
  assert.equal(ORB_RACERS["purple-sun"].accent, "#f0abfc", "Purple Sun should use the lighter purple accent theme");
  assert.notEqual(
    racePurpleSunBodyColorFor({ racePurpleSunPowerLevel: 1 }),
    racePurpleSunBodyColorFor({ racePurpleSunPowerLevel: 2 }),
    "Purple Sun should scale its body color with power level like Blue Sun",
  );
  assert.equal(ORB_RACERS.unarmed.color, "#808080", "Unarmed should use the gray theme");
  const layerClip = raceSunLaserLayerClipRectFor(
    { x: 10, y: 20, width: 200, height: 400 },
    { hitLayer: true, layerIndex: 1 },
  );
  assert.equal(layerClip.x, 10);
  assert.equal(layerClip.width, 200);
  assert.equal(layerClip.layerY, 20 + raceLayerLineY(1) * 400);
  assert.equal(
    raceSunLaserLayerClipRectFor(
      { x: 10, y: 20, width: 200, height: 400 },
      { hitLayer: false, layerIndex: 1 },
    ),
    null,
    "non-layer ray contacts should keep their normal wall/viewport clipping",
  );
  assert.equal(ORB_RACERS.poison.color, "#8b5cf6", "Poison should use the purple theme");
  assert.equal(ORB_RACERS["hydrogen-bomb"].symbol, "☢", "Hydrogen Bomb should keep a stable radiation symbol");
  assert.equal(
    createHash("sha256").update(readFileSync(new URL("../assets/race/hydrogen-bomb-symbol.png", import.meta.url))).digest("hex"),
    "62ff4ee46309ea6bf43d01f9fca06e613036338da063c9c9ea53c52a71609339",
    "Hydrogen Bomb should ship the supplied symbol image unchanged",
  );
  assert.equal(
    createHash("sha256").update(readFileSync(new URL("../assets/race/fibonacci-symbol.png", import.meta.url))).digest("hex"),
    "c33d8c0e2273e079598423e9dbabe92cfedd6d3e9afd9e1441b09ee672f2cbdd",
    "Fibonacci should ship the supplied symbol image unchanged",
  );
  assert.match(
    readFileSync(new URL("../assets/race/fibonacci-symbol.svg", import.meta.url), "utf8"),
    /<path [^>]*fill="#000000"/,
    "Fibonacci should use a clean black phi vector with no baked background",
  );
  for (const asset of [
    "../assets/generated/orb-race-viking-20260730/final/berserker-viking-calm.png",
    "../assets/generated/orb-race-viking-20260730/final/berserker-viking-rage.png",
  ]) {
    const bytes = readFileSync(new URL(asset, import.meta.url));
    assert.deepEqual(
      [...bytes.subarray(0, 8)],
      [137, 80, 78, 71, 13, 10, 26, 10],
      `generated Berserker asset should be a valid PNG: ${asset}`,
    );
  }
}

{
  const racer = {
    raceDraftSwordSwingStartedAt: 2,
    raceDraftSwordSwingUntil: 2.54,
    raceDraftSwordImpactAt: 2.32,
  };
  const start = draftmasterSwordPose(racer, 2);
  const impact = draftmasterSwordPose(racer, 2.32);
  const returning = draftmasterSwordPose({ ...racer, raceDraftSwordSwingLocked: true }, 2.4);
  const locked = draftmasterSwordPose({ ...racer, raceDraftSwordSwingLocked: true }, 2.54);
  assert.equal(start.swinging, true, "Draftmaster's sword should be active at swing start");
  assert.ok(impact.angle > start.angle, "Draftmaster's sword should rotate clockwise during its swing");
  assert.equal(impact.swinging, false, "Draftmaster's sword should stop swinging at layer contact");
  assert.equal(impact.contacted, true, "Draftmaster's sword should mark the contact pose");
  assert.ok(impact.angle > Math.PI / 2, "Draftmaster's sword should point down into the layer at contact");
  assert.equal(returning.returning, true, "Draftmaster's sword should begin returning after the layer slice");
  assert.ok(returning.angle < impact.angle, "Draftmaster's sword should move back toward its guard after contact");
  assert.equal(locked.swinging, false, "Draftmaster's sword should remain still after contact");
  assert.equal(locked.contacted, false, "Draftmaster's sword should finish its contact pose before the next swing");
  assert.equal(locked.angle, draftmasterSwordPose({}, 0).angle, "Draftmaster's sword should return to its original guard position");
}

{
  const racer = {
    raceBerserkerAxeSwingStartedAt: 2,
    raceBerserkerAxeSwingUntil: 2.54,
    raceBerserkerAxeImpactAt: 2.32,
  };
  const rest = berserkerAxePose({}, 0);
  const start = berserkerAxePose(racer, 2);
  const impact = berserkerAxePose(racer, 2.32);
  const locked = berserkerAxePose({ ...racer, raceBerserkerAxeSwingLocked: true }, 2.54);
  assert.ok(rest.angle < -2, "Berserker's resting axe should be rotated blade-down");
  assert.equal(start.swinging, true, "Berserker's axe should be active at swing start");
  assert.ok(impact.angle > start.angle, "Berserker's axe should swing clockwise toward the layer");
  assert.equal(impact.swinging, false, "Berserker's axe should stop swinging at layer contact");
  assert.equal(impact.contacted, true, "Berserker's axe should mark the contact pose");
  assert.ok(impact.angle < -2, "Berserker's axe should keep a layer-facing downward pose at impact");
  assert.equal(locked.swinging, false, "Berserker's axe should remain still after contact");
  assert.equal(locked.angle, impact.angle, "Berserker's axe should hold its contact angle until the next swing");
}

{
  const baseGun = draftmasterGunDimensions(40, 0);
  const shotgun = draftmasterGunDimensions(40, 2);
  assert.equal(baseGun.width, 213.5, "Draftmaster's base gun should use the 175% visual scale");
  assert.ok(Math.abs(baseGun.height - 130.2) < 1e-9, "Draftmaster's base gun should use the 175% visual scale");
  assert.ok(shotgun.width > baseGun.width, "higher projectile upgrades should keep the gun visibly larger");
}

{
  const racer = {
    raceDraftGunSpinStartedAt: 3,
    raceDraftGunSpinUntil: 3.3,
  };
  assert.equal(draftmasterGunReloadPose(racer, 2.99).spinning, false, "Draftmaster's gun should stay still before reload");
  const spin = draftmasterGunReloadPose(racer, 3.12);
  assert.equal(spin.spinning, true, "Draftmaster's gun should spin between shots");
  assert.ok(spin.rotation > Math.PI, "Draftmaster's reload should turn rapidly enough to read as a blur");
  assert.equal(draftmasterGunReloadPose(racer, 3.3).spinning, false, "Draftmaster's gun should settle after reload");
}

{
  const pistol = draftmasterGunSourceRect(1728, 864, 0);
  const rifle = draftmasterGunSourceRect(1728, 864, 1);
  const shotgun = draftmasterGunSourceRect(1728, 864, 2);
  assert.deepEqual(
    pistol,
    { x: 864, y: 0, width: 432 * 0.82, height: 432 },
    "Draftmaster's pistol source crop should remove the detached rifle fragment",
  );
  assert.equal(rifle.width, 432, "Draftmaster's rifle tier should retain its full source cell");
  assert.equal(shotgun.y, 432, "Draftmaster's shotgun tier should retain its second-row source cell");
}

{
  const sniperRifle = sniperWeaponSourceRect(1774, 887, 0);
  const sniperAmmo = sniperWeaponSourceRect(1774, 887, 1);
  assert.ok(sniperRifle.x > 0 && sniperRifle.y > 0, "Sniper's rifle crop should remove the cell matte");
  assert.ok(sniperRifle.width < 887 && sniperRifle.height < 887, "Sniper's rifle crop should stay inside its source cell");
  assert.ok(sniperAmmo.x > sniperRifle.x, "Sniper's ammo crop should target the second source cell");
}

{
  const fillStyles = [];
  const context = {
    save() {},
    restore() {},
    strokeText() {},
    fillText() {},
    measureText(value) { return { width: String(value).length * 10 }; },
    set fillStyle(value) { fillStyles.push(value); },
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceMatchup.call({}, context, [
    { orbIds: ["hydrogen-bomb"], members: [{ raceOrbId: "hydrogen-bomb" }] },
    { orbIds: ["speed"], members: [{ raceOrbId: "speed" }] },
  ], 900, 400, 300);
  assert.ok(fillStyles.includes("#e11d48"), "Hydrogen Bomb matchup text should use the red warning color");
}

{
  const frameAtStart = SocialBattleRenderer.prototype.raceRicochetMountFrame(0);
  const frameDuringSpin = SocialBattleRenderer.prototype.raceRicochetMountFrame(3.325);
  const frameAfterSpin = SocialBattleRenderer.prototype.raceRicochetMountFrame(3.65);
  const frameNextTurn = SocialBattleRenderer.prototype.raceRicochetMountFrame(6);
  assert.deepEqual(frameAtStart, { frame: 0, rotation: 0 }, "Ricochet should begin on the first generated gun frame");
  assert.equal(frameDuringSpin.frame, 0, "Ricochet should keep the current generated frame during its spin");
  assert.ok(Math.abs(frameDuringSpin.rotation - Math.PI / 4) < 1e-9, "Ricochet should ease through the 90-degree spin");
  assert.ok(Math.abs(frameAfterSpin.rotation - Math.PI / 2) < 1e-9, "Ricochet should finish a quarter turn after the spin animation");
  assert.deepEqual(frameNextTurn, { frame: 1, rotation: 0 }, "Ricochet should hold the previous generated frame at the next spin start");
}

{
  assert.equal(
    raceBlueSunLaserClipModeFor({ raceLongform: true }),
    "viewport",
    "long-form Blue Sun rays should rely on the parent visible-lane clip so world-edge glows are not cut by a second barrier",
  );
  assert.equal(
    raceBlueSunLaserClipModeFor({ raceLongform: false }),
    "world",
    "portrait Blue Sun rays should remain isolated to their board world rectangle",
  );
  assert.equal(
    raceLongformBlueSunOverflowFor(600, [{ raceOrbId: "unarmed" }]),
    0,
    "non-Blue-Sun long-form lanes should keep the normal content clip",
  );
  assert.ok(
    raceLongformBlueSunOverflowFor(600, [{ raceOrbId: "blue-sun", raceOrbScale: 1 }]) > 0,
    "long-form Blue Sun should reserve visual overflow for a complete top-wall ray end-cap",
  );
  const extendedRay = raceBlueSunLongformEndpointFor(
    50,
    50,
    60,
    80,
    { x: 0, y: 0, width: 100, height: 100 },
  );
  assert.ok(Math.abs(extendedRay.x - 66.6666667) < 1e-6, "long-form ray should extend through a virtual wall to the visible boundary");
  assert.equal(extendedRay.y, 100, "long-form ray should continue to the actual viewport edge");
  assert.equal(
    raceBlueSunLongformShouldExtendThroughBarrier({ hitSurface: "top-wall" }),
    true,
    "a cleared long-form top barrier should not stop the visual ray",
  );
  assert.equal(
    raceBlueSunLongformShouldExtendThroughBarrier({ hitSurface: "number-line", hitLayer: true }),
    false,
    "the actual visible number line must retain its physical contact endpoint",
  );
  assert.equal(
    raceBlueSunLongformShouldExtendThroughBarrier({ hitSurface: "side-wall" }),
    false,
    "the actual side arena frame must retain its physical contact endpoint",
  );
  assert.equal(
    raceLongformTournamentCheckerFillEnabled({ format: "race-landscape", tournament: true, layerCount: 3 }),
    true,
    "only a three-layer landscape tournament should extend the checker field",
  );
  assert.equal(
    raceLongformTournamentCheckerFillEnabled({ format: "race-landscape", tournament: true, layerCount: 5 }),
    false,
    "five-layer landscape tournaments retain the existing finish geometry",
  );
  assert.equal(
    raceLongformTournamentCheckerFillEnabled({ format: "portrait", tournament: true, layerCount: 3 }),
    false,
    "portrait short races retain the existing finish geometry",
  );
  const checkerArgs = {
    format: "race-landscape",
    tournament: true,
    layerCount: 3,
    track: { x: 100, y: 40, width: 600, height: 900 },
    finishY: 700,
    finishHeight: 100,
  };
  const extendedChecker = raceLongformTournamentCheckerRect(checkerArgs);
  const normalChecker = raceLongformTournamentCheckerRect({ ...checkerArgs, layerCount: 5 });
  assert.equal(extendedChecker.y, normalChecker.y, "the checker start must remain at the normal finish band");
  assert.equal(extendedChecker.trackBottom, 940);
  assert.equal(extendedChecker.height, 940 - extendedChecker.y, "the three-layer checker field should fill only the remaining track interior");
  assert.equal(normalChecker.height, 54, "five-layer landscape checker height must remain unchanged");
  assert.equal(raceLongformTournamentCheckerTileSize(600, 48), 12, "extended checker tiles remain square-sized by width");
  const checkerGrid = raceLongformTournamentCheckerGridFor(600, 700, 48);
  assert.equal(checkerGrid.tileWidth, checkerGrid.tileHeight, "extended checker cells must remain square");
  assert.equal(checkerGrid.columns, 50, "the final partial column should be clipped rather than stretched");
  assert.equal(raceTournamentFinishBorderVisible({ tournament: true }), false, "tournament checker finish should omit the extra black rule");
  assert.equal(raceTournamentFinishBorderVisible({ tournament: false }), true, "ordinary races retain the finish border");
}

{
  const indexMarkup = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(
    indexMarkup,
    /main\.js\?v=20260920-youtube-upload-gate1/,
    "the page entry point must invalidate cached browser code",
  );
  assert.match(indexMarkup, /styles\.css\?v=20260812-orb-race-tournament-nodes2-classic-ui1/, "the setup-dialog CSS should invalidate cached styles");
  assert.match(indexMarkup, /SHORT RACE · 9:16 · 3 LAYERS/);
  assert.match(indexMarkup, /LONG RACE · 16:9 · PRESET LAYERS/);
  assert.match(indexMarkup, /id="raceFinalLayerHealth"/);
  assert.match(indexMarkup, /1 QUINTILLION/);
  assert.match(indexMarkup, /id="raceLengthPicker"/);
  const socialRendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  const mainSource = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  const stylesMarkup = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  assert.match(mainSource, /twinsSecondOrb/, "render_game_to_text should expose the second Twins body");
  assert.match(mainSource, /scissorSplitEffects/, "render_game_to_text should expose Scissor animation state");
  assert.match(stylesMarkup, /#socialCanvas\[data-tournament="true"\]\s*\{[\s\S]*?border:\s*0;/, "tournament bracket canvases should omit the outer CSS frame");
  assert.match(socialRendererSource, /this\.canvas\.dataset\.tournament\s*=\s*sim\.gameplayMode\s*===\s*ORB_RACE_MODE/, "the outer-frame override must be scoped to tournament Orb Race renders");
  assert.match(socialRendererSource, /tournamentCameraTransform\(/, "bracket zoom should use one continuous camera transform");
  assert.match(socialRendererSource, /orb-race-tournament-intro-clock4-64focus1/, "the renderer presentation import should invalidate the 64-entry focus camera fix");
  assert.match(mainSource, /social-renderer\.js\?v=20260825-tsar-all-in-one1/, "main must invalidate the current renderer graph");
  assert.doesNotMatch(
    mainSource,
    /function socialSimulationRate\(now\)\s*\{\s*if \(!socialPresentation\.started\) return 0/,
    "async recorder/audio setup must not freeze the match before recording begins",
  );
  assert.match(mainSource, /options\.cageDuration\s*=\s*form\.querySelector\(/, "Cage Time must flow from the per-orb setup form into race options");
  assert.match(mainSource, /\(!sim\.finished \|\| sim\.raceTournament\)/, "finished tournament matches must keep advancing their deterministic conclusion clock");
  assert.match(socialRendererSource, /forceUnknown: destinationPlaceholder/, "the destination should retain ??? until the winner reveal begins");
  assert.match(socialRendererSource, /tournamentMatchupZoomTargetScale\(/, "the renderer should use the shared tighter matchup camera fit");
  assert.match(socialRendererSource, /connectorColors\.active/, "focused bracket paths should use the shared muted connector palette");
  assert.match(socialRendererSource, /connectorStrokeSpace === "screen"/, "connector weight should remain stable after camera zoom");
  assert.match(socialRendererSource, /logicalWidth \/ Math\.max\(1, Number\(camera\.scale\)/, "focused 64-entry lines should not become heavy after scaling");
  assert.match(socialRendererSource, /winnerFadeInProgress/, "conclusion should fade the winner into the destination card");
  assert.doesNotMatch(socialRendererSource, /tournamentAdvancementPosition\(/, "conclusion should not draw a traveling winner sprite");
  assert.match(socialRendererSource, /tournamentCameraTransitionTransform\(/, "long-form matchups should pan between focused camera rectangles");
  assert.match(socialRendererSource, /phase === \"next-match-pan\"/, "the renderer should consume the deterministic camera-pan presentation phase");
  assert.match(socialRendererSource, /endScale: Math\.max\(transitionStartScale, targetScale\)/, "inter-match travel must remain zoomed in before the centered hold");
  assert.match(socialRendererSource, /tournamentMatchupIntroVisualState\(/, "tournament intros should split one second of camera motion from the 1.75 second hold");
  assert.match(socialRendererSource, /tournamentWithCommittedResult\(/, "the prior winner must remain committed while the camera pans to the next matchup");
  assert.match(socialRendererSource, /raceVisible:\s*false/, "supplied transition frames must keep the bracket visible instead of leaking gameplay underneath");
  assert.match(socialRendererSource, /this\.format === \"race-landscape\"|race-landscape/, "camera-pan rendering must remain long-form scoped");
  assert.match(mainSource, /tournamentAnnouncerPending/, "tournament announcers should defer until the zoom phase is complete");
  assert.match(socialRendererSource, /raceTournamentFinishBorderVisible/, "tournament finish border visibility should be explicit");
  assert.match(socialRendererSource, /#OrbBattleGroundSimulator/, "Orb Race finish copy should include the requested hashtag");
  assert.match(socialRendererSource, /drawRaceLongformSideCopy\(ctx, layout, track, trackIndex\)/, "long-form copy should render through the side-margin path");
}

{
  const rendererProbe = Object.create(SocialBattleRenderer.prototype);
  const tournament = {
    size: 4,
    enabled: true,
    entrants: [
      { id: "speed", orbId: "speed" },
      { id: "batman", orbId: "batman" },
      { id: "lazer", orbId: "lazer" },
      { id: "flash", orbId: "flash" },
    ],
    rounds: [{ matches: [{ id: "m1", roundIndex: 0, matchIndex: 0 }, { id: "m2", roundIndex: 0, matchIndex: 1 }] }],
    currentRoundIndex: 0,
    currentMatchId: "m2",
  };
  const suppliedPan = rendererProbe.tournamentFrameForRender(
    { time: 0, raceTournament: tournament },
    { tournamentFrame: { phase: "camera-pan", phaseProgress: 0.5, transitionFromMatchId: "m1", transitionToMatchId: "m2" } },
    tournament,
  );
  assert.equal(suppliedPan.phase, "next-match-pan", "raw UI camera-pan frames must enter the bracket transition renderer");
  assert.equal(suppliedPan.longformTransitionProgress, 0.5, "a supplied half-progress camera phase must mean half of the one-second move");
  assert.equal(suppliedPan.matchupHoldProgress, 0);
  assert.equal(suppliedPan.raceVisible, false, "gameplay cannot replace the bracket during the hold");

  const frozenConclusion = {
    ...tournament,
    presentation: { phase: "conclusion", matchId: "m1" },
    lastResult: {
      matchId: "m1",
      advancingEntrantId: "speed",
      advancingOrbId: "speed",
      eliminatedEntrantId: "batman",
      eliminatedOrbId: "batman",
    },
  };
  const uiPan = rendererProbe.tournamentFrameForRender({ raceTournament: frozenConclusion }, {
    tournamentTransition: {
      active: true,
      fromMatchId: "m1",
      toMatchId: "m2",
      elapsedMs: 500,
      progress: 500 / 2750,
    },
  }, frozenConclusion);
  assert.equal(uiPan.phase, "next-match-pan", "the explicit UI transition must override the frozen simulation conclusion");
  assert.equal(uiPan.matchId, "m2");
  assert.equal(uiPan.transitionFromMatchId, "m1");
  assert.equal(uiPan.longformTransitionProgress, 0.5, "500ms should be halfway through the one-second camera move");
  assert.equal(uiPan.matchupHoldProgress, 0);
  assert.equal(uiPan.winnerId, "speed");
  assert.equal(uiPan.loserId, "batman");
  assert.equal(uiPan.raceVisible, false);

  const uiHold = rendererProbe.tournamentFrameForRender({ raceTournament: frozenConclusion }, {
    tournamentTransition: {
      active: true,
      fromMatchId: "m1",
      toMatchId: "m2",
      elapsedMs: 1800,
      progress: 1800 / 2750,
    },
  }, frozenConclusion);
  assert.equal(uiHold.longformTransitionProgress, 1, "camera movement must finish after 1000ms");
  assert.ok(uiHold.matchupHoldProgress > 0 && uiHold.matchupHoldProgress < 1);
  assert.equal(uiHold.matchupHolding, true, "the next centered matchup remains visible during the remaining hold");
  assert.equal(uiHold.matchId, "m2");

  const gameplayIntroFrame = (clock, phase = "bracket-zoom", introMode = "full-intro") => (
    rendererProbe.tournamentFrameForRender({
      time: 0,
      raceTournament: {
        ...tournament,
        clock,
        presentation: {
          phase,
          matchId: "m2",
          introMode,
          cameraTransition: introMode === "camera-pan"
            ? { type: "camera-pan", fromMatchId: "m1", toMatchId: "m2", startAt: 0, duration: 2.75 }
            : { type: "full-intro", startAt: 0, duration: 2.75 },
          timestamps: {
            introBracketAt: 0,
            bracketZoomAt: 0,
            transitionStartAt: 0,
            battleAt: 2.75,
            zoomDuration: 2.75,
          },
        },
      },
    }, {}, tournament)
  );
  const halfSecondIntro = gameplayIntroFrame(0.5);
  const oneSecondIntro = gameplayIntroFrame(1, "matchup-hold");
  const heldIntro = gameplayIntroFrame(1.8, "matchup-hold");
  assert.equal(halfSecondIntro.zoomProgress, 0.5, "the visible first zoom should be halfway at 0.5 seconds");
  assert.equal(oneSecondIntro.zoomProgress, 1, "the first zoom should reach its endpoint at exactly one second");
  assert.equal(oneSecondIntro.phase, "zoom-in", "full-intro matchup-hold must stay on the focused zoom renderer");
  assert.equal(heldIntro.zoomProgress, 1);
  assert.equal(heldIntro.matchupHolding, true, "the 1.8 second frame must remain a stationary focused matchup");
  const heldPan = gameplayIntroFrame(1.8, "matchup-hold", "camera-pan");
  assert.equal(heldPan.phase, "next-match-pan", "camera-pan matchup-hold must preserve the direct focused handoff");
  assert.equal(heldPan.longformTransitionProgress, 1);
  assert.equal(heldPan.matchupHolding, true);

  const waitingBattle = rendererProbe.tournamentFrameForRender({
    time: 0,
    raceTournament: {
      ...tournament,
      clock: 2,
      presentation: {
        phase: "battle",
        matchId: "m2",
        introMode: "camera-pan",
        cameraTransition: { type: "camera-pan", fromMatchId: "m1", toMatchId: "m2", startAt: 1, duration: 2.75 },
        timestamps: { battleAt: 3.75, transitionStartAt: 1 },
      },
    },
  }, {}, tournament);
  assert.equal(waitingBattle.phase, "next-match-pan", "an early battle label must not skip the visible matchup envelope");
  assert.equal(waitingBattle.raceVisible, false);

  const resultTournament = {
    ...tournament,
    entrants: [
      { id: "winner-entry", orbId: "speed" },
      { id: "loser-entry", orbId: "batman" },
    ],
  };
  const winnerColor = rendererProbe.tournamentWinnerHighlightColor(
    resultTournament.entrants[0],
    resultTournament,
    { phase: "next-match-pan", winnerId: "winner-entry" },
  );
  assert.equal(winnerColor, ORB_RACERS.speed.color, "the committed destination keeps the winner's Orb Race theme border");
  const loserVisuals = rendererProbe.tournamentEntryVisualState(resultTournament, {
    phase: "next-match-pan",
    loserId: "loser-entry",
    loserProgress: 1,
  });
  assert.equal(loserVisuals.get("loser-entry").grayscale, 1, "the prior loser remains fully grayscale during the next pan");
}

{
  const layout = orbRaceLongformLayout(1920, 1080);
  const leftCopy = raceLongformSideCopyLayout(layout, layout.tracks[0], 0);
  const rightCopy = raceLongformSideCopyLayout(layout, layout.tracks[1], 1);
  assert.ok(leftCopy.x < layout.tracks[0].x, "Team 1 long-form copy should stay in the outer left margin");
  assert.ok(rightCopy.x > layout.tracks[1].x + layout.tracks[1].width, "Team 2 long-form copy should stay in the outer right margin");
  assert.ok(leftCopy.width < layout.tracks[0].x, "left side copy should fit within its margin");
  assert.ok(rightCopy.width < layout.width - (layout.tracks[1].x + layout.tracks[1].width), "right side copy should fit within its margin");
  assert.equal(ORB_RACE_LONGFORM_CHECKER_COLUMNS, 48, "long-form finish flags should use a denser checker grid");

  const labels = [];
  const context = {
    save() {},
    restore() {},
    measureText(value) { return { width: String(value).length * 8 }; },
    strokeText() {},
    fillText(value, x, y) { labels.push({ value, x, y }); },
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set fillStyle(_value) {},
    set globalAlpha(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceLongformSideCopy.call(
    {},
    context,
    layout,
    layout.tracks[0],
    0,
  );
  assert.deepEqual(labels.map(({ value }) => value), ["Like & Subscribe!", ORB_RACE_FOOTER_TAG]);
  assert.ok(labels.every(({ x }) => x < layout.tracks[0].x), "long-form CTA and hashtag should not be centered over Team 1's track");
}

{
  const renderHeader = (team, members) => {
    const labels = [];
    const context = {
      measureText(value) { return { width: String(value).length * 8 }; },
      save() {},
      restore() {},
      fillRect() {},
      strokeText(value) { labels.push(String(value)); },
      fillText(value) { labels.push(String(value)); },
      set font(_value) {},
      set textAlign(_value) {},
      set textBaseline(_value) {},
      set lineWidth(_value) {},
      set strokeStyle(_value) {},
      set fillStyle(_value) {},
    };
    SocialBattleRenderer.prototype.drawRaceLongformHeader.call(
      {},
      context,
      team,
      members,
      { x: 0, y: 0, width: 640 },
      140,
      0,
    );
    return labels;
  };

  const duplicateLabels = renderHeader(
    { name: "SPEED × 2", orbIds: ["speed"], raceDamagePerSecond: 8 },
    [{ raceOrbId: "speed", raceDamage: 4 }, { raceOrbId: "speed", raceDamage: 4 }],
  );
  assert.ok(!duplicateLabels.some((label) => label.startsWith("(")), "duplicate long-form balls should hide ability descriptions");
  assert.ok(duplicateLabels.includes("DAMAGE/SEC: 8"), "duplicate long-form balls should keep the team damage line");

  const drillLabels = renderHeader(
    { name: "DRILL", orbIds: ["drill"], raceDamagePerSecond: 4 },
    [{ raceOrbId: "drill", raceDamage: 4, raceBounces: 9 }],
  );
  assert.ok(drillLabels.some((label) => label.includes("DRAG: 9")), "long-form Drill headers should display the current drag value");

  const fiveBallLabels = renderHeader(
    { name: "EVERYONE", orbIds: ["speed", "orbital", "drill", "fibonacci", "grower"], raceDamagePerSecond: 20 },
    ["speed", "orbital", "drill", "fibonacci", "grower"].map((raceOrbId) => ({ raceOrbId, raceDamage: 4 })),
  );
  assert.ok(!fiveBallLabels.some((label) => label.startsWith("(")), "five-orb long-form teams should hide ability descriptions");

  const distinctLabels = renderHeader(
    { name: "SPEED + ORBITAL", orbIds: ["speed", "orbital"], raceDamagePerSecond: 8 },
    [{ raceOrbId: "speed", raceDamage: 4 }, { raceOrbId: "orbital", raceDamage: 4 }],
  );
  assert.ok(distinctLabels.some((label) => label.startsWith("(")), "distinct two-orb long-form teams should retain ability descriptions");

  const realityLabels = renderHeader(
    { name: "REALITY BOMB", orbIds: ["reality-bomb"], raceDamagePerSecond: 0 },
    [{ raceOrbId: "reality-bomb", raceRealityNextShiftAt: 7 }],
  );
  assert.ok(
    realityLabels.some((label) => label.includes("NEXT SHIFT")),
    "Reality Bomb long-form headers should render without aborting the landscape draw",
  );
}

{
  const rendererProbe = Object.create(SocialBattleRenderer.prototype);
  rendererProbe.raceLongformCameraY = 0;
  rendererProbe.raceLongformCameraTargetY = 0;
  rendererProbe.raceLongformCameraSimTime = -1;
  rendererProbe.drawRaceLongformTrack = () => {};
  let centerDividerDraws = 0;
  const ctx = {
    fillRect() { centerDividerDraws += 1; },
    save() {},
    restore() {},
  };
  const teams = [0, 1].map((raceTeamIndex) => ({
    raceTeamIndex,
    raceLayerIndex: 0,
    raceLayerHealth: Array.from({ length: 50 }, () => 100),
  }));
  rendererProbe.drawRaceLongform(ctx, {
    time: 0,
    raceLayerCount: 50,
    winningRaceTeamIndex: null,
  }, teams, {}, 1920, 1080);
  assert.equal(centerDividerDraws, 0, "long-form should not draw a gray divider between tracks");
}

{
  const sim = createSimulation({
    count: 2,
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "orbital"],
    raceLayerStrengths: [100, 100, 100],
    seed: 88011,
  });
  const team = {
    ...sim.raceTeams[0],
    members: [sim.fighters[0]],
    raceLayerHealth: [100, 0, 100],
    raceLayerIndex: 0,
  };
  const rect = orbRaceBoardLayout(720, 720).boards[0];
  const sections = orbRaceBoardSections(rect);
  const layerStrokeYs = [];
  const lineWidths = [];
  const context = {
    measureText() { return { width: 1 }; },
    save() {},
    restore() {},
    fillRect() {},
    strokeRect(_x, y, _width, height) {
      if (height === sections.layerHeight) layerStrokeYs.push(y);
    },
    fillText() {},
    strokeText() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    rect() {},
    clip() {},
    set lineWidth(value) { lineWidths.push(value); },
  };
  const rendererProbe = Object.create(SocialBattleRenderer.prototype);
  for (const name of [
    "drawRaceIntegralArc",
    "drawRaceMeteorBurns",
    "drawRaceGodzillaBurns",
    "drawRaceTrail",
    "drawRaceBounceEffects",
    "drawRaceLaser",
    "drawRaceOrb",
    "drawRaceDrillProjectiles",
    "drawRaceBatarangProjectiles",
    "drawRaceBoomerangProjectiles",
    "drawRaceMines",
    "drawRaceRicochetProjectiles",
    "drawRaceSawbladeProjectiles",
    "drawRaceBatBombs",
    "drawRaceMeteorProjectiles",
    "drawRaceMeteorHorn",
    "drawRaceTeamStats",
    "drawRaceAbilityBar",
    "drawRaceSlotMachine",
    "drawRaceCheckerboard",
    "drawRaceTimeBombPulses",
  ]) rendererProbe[name] = () => {};
  rendererProbe.drawRaceBoard(context, sim, team, rect, 0, 0);
  assert.deepEqual(
    layerStrokeYs,
    [rect.y + sections.topHeight, rect.y + sections.topHeight + sections.layerHeight * 2],
    "portrait rendering should omit future layers whose ranged damage reduced health to zero",
  );
  assert.ok(
    lineWidths.includes(Math.max(7, rect.width * 0.012)),
    "portrait rendering should use a bold perimeter around the race board",
  );
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["speed", "lazer"],
    seed: 8801,
  });
  const boards = [];
  let matchup = null;
  SocialBattleRenderer.prototype.drawOrbRace.call({
    drawRaceBoard(_ctx, boardSim, team, rect, time, index) {
      boards.push({ boardSim, team, rect, time, index });
    },
    drawRaceMatchup(_ctx, teams) {
      matchup = teams;
    },
  }, { save() {}, restore() {}, translate() {}, fillRect() {}, set fillStyle(_value) {} }, sim, {}, 1080, 1920);
  assert.equal(boards.length, 2, "Orb Race should render both racer boards");
  assert.ok(boards.every((board) => board.boardSim === sim), "each racer board needs the live simulation for effects such as Lazer");
  assert.deepEqual(matchup.map((team) => team.orbIds), [["speed"], ["lazer"]], "Orb Race should render the two team names between the boards");
}

{
  const flashRects = [];
  const context = {
    save() {},
    restore() {},
    fillRect(...args) { flashRects.push(args); },
    set fillStyle(_value) {},
  };
  const rendererProbe = Object.create(SocialBattleRenderer.prototype);
  rendererProbe.drawRaceHydrogenExplosionFlash(
    context,
    { raceHydrogenBombExploded: true, raceHydrogenBombExplosionElapsed: 3.999 },
    720,
    1280,
  );
  rendererProbe.drawRaceHydrogenExplosionFlash(
    context,
    { raceHydrogenBombExploded: true, raceHydrogenBombExplosionElapsed: 4 },
    720,
    1280,
  );
  assert.deepEqual(flashRects, [[0, 0, 720, 1280]], "the Hydrogen Bomb renderer should flash through but not beyond four seconds");
}

{
  const statCalls = [];
  SocialBattleRenderer.prototype.drawRaceTeamStats.call({
    drawRaceStats(_ctx, racer, _def, _rect, _track, slot, count) {
      statCalls.push([racer.raceOrbId, slot, count]);
    },
  }, {}, {}, [{ raceOrbId: "batman" }, { raceOrbId: "flash" }], { x: 0, y: 0, width: 900, height: 600 }, 0);
  assert.deepEqual(statCalls, [["batman", 0, 2], ["flash", 1, 2]], "two-orb teams should keep both individual stat columns");

  const twoOrbLabels = [];
  const twoOrbContext = {
    save() {},
    restore() {},
    strokeText() {},
    fillText(value) { twoOrbLabels.push(value); },
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set fillStyle(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceTeamStats.call(SocialBattleRenderer.prototype, twoOrbContext, {
    orbIds: ["speed", "duplicator"],
  }, [
    { name: "SPEEDSTER", raceOrbId: "speed", raceAbilityIds: ["speed"], raceDamage: 4, raceSpeed: 12 },
    { name: "DUPLICATOR", raceOrbId: "duplicator", raceAbilityIds: ["duplicator"], raceDamage: 4, raceDuplicates: 2 },
  ], { x: 0, y: 200, width: 900, height: 600 }, 0);
  assert.deepEqual(twoOrbLabels, ["DAMAGE: 4", "SPEED: 12", "DAMAGE: 4", "DUPLICATES: 2"], "multi-orb teams should show compact metrics for each orb");
  assert.ok(twoOrbLabels.every((label) => !["SPEEDSTER", "DUPLICATOR"].includes(label)), "multi-orb stat columns should omit orb names");

  const labels = [];
  const context = {
    save() {},
    restore() {},
    strokeText() {},
    fillText(value) { labels.push(value); },
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set fillStyle(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceTeamStats.call({}, context, {
    orbIds: ["speed"],
  }, [
    { raceOrbId: "speed", raceAbilityIds: ["speed"], raceDamage: 4, raceSpeed: 12 },
    { raceOrbId: "speed", raceAbilityIds: ["speed"], raceDamage: 4, raceSpeed: 12 },
    { raceOrbId: "speed", raceAbilityIds: ["speed"], raceDamage: 4, raceSpeed: 12 },
  ], { x: 0, y: 200, width: 900, height: 600 }, 0);
  assert.deepEqual(labels, ["ORBS: 3", "TOTAL DAMAGE/SEC: 0"], "larger teams should use the compact team summary");

  const comboTeamLabels = [];
  const comboTeamContext = {
    save() {},
    restore() {},
    strokeText() {},
    fillText(value) { comboTeamLabels.push(value); },
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set fillStyle(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceTeamStats.call({}, comboTeamContext, {
    orbIds: ["mines"],
    raceDamagePerSecond: 12,
  }, [
    { raceOrbId: "mines", raceAbilityIds: ["mines", "speed"], raceDamage: 12, raceMineLevel: 3, raceSpeed: 12 },
    { raceOrbId: "mines", raceAbilityIds: ["mines", "speed"], raceDamage: 12, raceMineLevel: 3, raceSpeed: 12 },
    { raceOrbId: "mines", raceAbilityIds: ["mines", "speed"], raceDamage: 12, raceMineLevel: 3, raceSpeed: 12 },
  ], { x: 0, y: 200, width: 900, height: 600 }, 0);
  assert.deepEqual(comboTeamLabels, ["ORBS: 3", "TOTAL DAMAGE/SEC: 12"], "three-orb combo teams should use the compact team summary");
  assert.ok(comboTeamLabels.every((label) => !label.includes("COMBO")), "collapsed combo teams should not print an explicit combo label");

  const captureLongformHeaderLabels = (racer) => {
    const labels = [];
    const context = {
      save() {},
      restore() {},
      measureText(value) { return { width: String(value).length * 8 }; },
      strokeText() {},
      fillText(value) { labels.push(value); },
      fillRect() {},
      set font(_value) {},
      set textAlign(_value) {},
      set textBaseline(_value) {},
      set lineWidth(_value) {},
      set strokeStyle(_value) {},
      set fillStyle(_value) {},
    };
    const id = racer.raceOrbId;
    SocialBattleRenderer.prototype.drawRaceLongformHeader.call(
      {},
      context,
      { name: ORB_RACERS[id].name, orbIds: [id] },
      [{ name: ORB_RACERS[id].name, ...racer }],
      { x: 0, y: 0, width: 720, height: 900 },
      140,
      0,
    );
    return labels;
  };

  const slammyHeaderLabels = captureLongformHeaderLabels({ raceOrbId: "slammy", raceDamage: 5 });
  assert.ok(slammyHeaderLabels.some((label) => label.includes("DAMAGE: 5")), "Slammy's lane header should show damage");
  const unarmedHeaderLabels = captureLongformHeaderLabels({ raceOrbId: "unarmed", raceDamage: 4, raceSpeed: 8 });
  assert.ok(
    unarmedHeaderLabels.some((label) => label.includes("DAMAGE: 4") && label.includes("SPEED: 8")),
    "Unarmed's lane header should show damage and speed",
  );
  const duplicatorHeaderLabels = captureLongformHeaderLabels({ raceOrbId: "duplicator", raceDamage: 4, raceDuplicates: 2 });
  assert.ok(
    duplicatorHeaderLabels.some((label) => label.includes("DAMAGE: 4") && label.includes("DUPLICATES: 2")),
    "Duplicator's lane header should show damage and duplicate count",
  );

  for (const [racer, expected] of [
    [{ raceOrbId: "speed", raceDamage: 4, raceSpeed: 12, raceBounceHeight: 99 }, "SPEED: 12"],
    [{ raceOrbId: "unarmed", raceDamage: 4, raceSpeed: 8 }, "SPEED: 8"],
    [{ raceOrbId: "slammy", raceDamage: 5 }, "DAMAGE: 5"],
    [{ raceOrbId: "draftmaster", raceDraftLastUpgrade: "projectile", raceDraftNextUpgradeAt: 3 }, "POWERUP: PROJECTILE"],
    [{ raceOrbId: "ying-yang", raceDamage: 3, raceSpeed: 7, raceYingYangMode: "speed", raceYingYangDamageLevel: 2, raceYingYangSpeedLevel: 3 }, "SPEED: 7"],
    [{ raceOrbId: "poison", raceDamage: 0, racePoisonActiveTicks: 1, racePoisonDamagePerTick: 1 }, "POISON: 1 TICK × 1"],
    [{ raceOrbId: "drill", raceDamage: 4, raceBounces: 18, raceDrills: 4, raceDrillSpeed: 0.052 }, "DRAG: 18"],
    [{ raceOrbId: "boomerang", raceDamage: 4, raceBoomerangLevel: 2, raceBoomerangProjectiles: [{}, {}] }, "BOOMERANG LEVEL: 2"],
    [{ raceOrbId: "magnet", raceDamage: 3, raceMagnetPull: 1.25 }, "PULL: 1.3"],
    [{ raceOrbId: "mines", raceDamage: 5, raceMineLevel: 3, raceMineProjectiles: [{}, {}] }, "BOMBS: 3"],
    [{ raceOrbId: "gravity", raceDamage: 6, raceGravityLevel: 7 }, "GRAVITY LEVEL: 7"],
    [{ raceOrbId: "jackpot", raceDamage: 7, raceJackpotOutcomeLabel: "JACKPOT", raceJackpotMultiplier: 200 }, "MULTIPLIER: 200×"],
    [{ raceOrbId: "speed-impact", raceDamage: 150, raceSpeedImpactLandings: 1 }, "DAMAGE: 150"],
    [{ raceOrbId: "godzilla", raceGodzillaStompDamage: 50, raceGodzillaSwipeDamage: 100, raceGodzillaBeamDamagePerSecond: 1000 }, "STOMP: 50"],
    [{ raceOrbId: "berserker", raceDamage: 4, raceBerserkerRage: 42 }, "DAMAGE: 4"],
  ]) {
    const racerLabels = [];
    const racerContext = {
      save() {},
      restore() {},
      strokeText() {},
      fillText(value) { racerLabels.push(value); },
      set font(_value) {},
      set textAlign(_value) {},
      set textBaseline(_value) {},
      set lineWidth(_value) {},
      set strokeStyle(_value) {},
      set fillStyle(_value) {},
      fillRect() {},
      strokeRect() {},
    };
    SocialBattleRenderer.prototype.drawRaceStats.call(
      {
        drawRaceBerserkerRageBar: SocialBattleRenderer.prototype.drawRaceBerserkerRageBar,
      },
      racerContext,
      { name: ORB_RACERS[racer.raceOrbId].name, ...racer },
      ORB_RACERS[racer.raceOrbId],
      { x: 0, y: 200, width: 900, height: 600 },
      0,
    );
    assert.ok(racerLabels.includes(expected), `${racer.raceOrbId} should expose its unique HUD stat`);
    if (racer.raceOrbId === "slammy") {
      assert.ok(racerLabels.every((label) => !label.includes("SLAMMY")), "Slammy should use the generic damage label");
    }
    if (racer.raceOrbId === "speed") {
      assert.ok(racerLabels.every((label) => !label.includes("HEIGHT")), "Speedster's HUD should not display height");
    }
    if (racer.raceOrbId === "berserker") {
      assert.ok(racerLabels.includes("RAGE 42%"), "Berserker's rage meter should be labeled in the stat dock");
      assert.ok(racerLabels.every((label) => !label.startsWith("RAGE:")), "Berserker should not duplicate the rage bar as a text stat");
    }
  }
}

{
  const captureRaceStatLabels = (racer) => {
    const labels = [];
    const context = {
      save() {},
      restore() {},
      measureText(value) { return { width: String(value).length * 8 }; },
      strokeText() {},
      fillText(value) { labels.push(value); },
      set font(_value) {},
      set textAlign(_value) {},
      set textBaseline(_value) {},
      set lineWidth(_value) {},
      set strokeStyle(_value) {},
      set fillStyle(_value) {},
    };
    SocialBattleRenderer.prototype.drawRaceStats.call(
      {},
      context,
      racer,
      ORB_RACERS[racer.raceOrbId],
      { x: 0, y: 200, width: 900, height: 600 },
      0,
    );
    return labels;
  };

  assert.deepEqual(
    captureRaceStatLabels({
      name: "SPEEDSTICK",
      raceOrbId: "speed",
      raceAbilityIds: ["speed", "sticky"],
      raceDamage: 99,
      raceSpeed: 12,
      raceStickyLevel: 4,
    }),
    ["SPEED: 12", "STICK LEVEL: 4"],
    "Speedster + Sticky should show only speed and stick level",
  );

  assert.equal(
    raceAntimatterCooldownSecondsFor({
      raceAntimatterDetonationCount: 0,
      raceAntimatterCooldownSeconds: 15,
    }),
    15,
    "Antimatter should use the fifteen-second cycle before its post-second cooldown",
  );
  assert.equal(
    raceAntimatterCooldownSecondsFor({
      raceAntimatterDetonationCount: 2,
      raceAntimatterCooldownSeconds: 5,
    }),
    5,
    "Antimatter should expose the five-second cooldown after the second blast",
  );
  assert.equal(
    raceAntimatterCountdownLineFor({
      raceAntimatterDetonationCount: 2,
      raceAntimatterCountdownElapsed: 0.5,
      raceAntimatterCooldownSeconds: 5,
    }),
    "4.5S",
    "the third-blast countdown should visibly use the five-second duration",
  );
  assert.deepEqual(
    captureRaceStatLabels({
      name: "SPEED + DRILL",
      raceOrbId: "speed",
      raceAbilityIds: ["speed", "drill"],
      raceDamage: 7,
      raceSpeed: 12,
      raceBounces: 3,
    }),
    ["DAMAGE: 7", "DRAG: 3"],
    "Speedster + Drill should show damage and drag",
  );
  assert.deepEqual(
    captureRaceStatLabels({
      name: "SPEED + SPLODEY",
      raceOrbId: "speed",
      raceAbilityIds: ["speed", "mines"],
      raceDamage: 7,
      raceSpeed: 12,
      raceMineLevel: 3,
    }),
    ["DAMAGE: 7", "BOMBS: 3"],
    "Speedster + Splodey should show damage and bombs",
  );
  assert.deepEqual(
    captureRaceStatLabels({
      raceOrbId: "fibonacci",
      raceAbilityIds: ["fibonacci", "gravity"],
      raceDamage: 21,
      raceGravityLevel: 6,
    }),
    ["FIBO: 21", "GRAVITY LEVEL: 6"],
    "Fibonacci + Gravity should show only Fibonacci and gravity level",
  );
  assert.deepEqual(
    captureRaceStatLabels({ raceOrbId: "quadratic", raceDamage: 16, raceBounces: 3 }),
    ["DAMAGE: 16", "QUADRATIC: X^4"],
    "Quadratic should show damage and its current quadratic only",
  );
  assert.deepEqual(
    captureRaceStatLabels({ raceOrbId: "quadratic", raceDamage: 1, raceBounces: 3, raceScalingDamageEnabled: false }),
    ["QUADRATIC: X^4"],
    "disabling scaling damage should remove the generic damage stat",
  );
  assert.deepEqual(
    captureRaceStatLabels({ raceOrbId: "speed", raceAbilityIds: ["speed", "sticky"], raceDamage: 1, raceSpeed: 12, raceStickyLevel: 4, raceScalingDamageEnabled: false }),
    ["SPEED: 12", "STICK LEVEL: 4"],
    "disabling scaling damage should preserve the two non-damage combo metrics",
  );
  assert.deepEqual(
    captureRaceStatLabels({
      raceOrbId: "draftmaster",
      raceDamage: 17,
      raceSpeed: 4,
      raceDraftProjectileLevel: 2,
      raceDraftLastUpgrade: "projectile",
      raceDraftNextUpgradeAt: 3,
    }),
    ["DAMAGE: 17", "SPEED: 4", "PROJECTILE #: 3", "POWERUP: PROJECTILE"],
    "Draftmaster should show damage, speed, projectile count, and powerup without the upgrade countdown",
  );
  assert.deepEqual(
    captureRaceStatLabels({
      raceOrbId: "commander",
      raceBounces: 3,
      raceCommanderProjectiles: [
        { kind: "bomb", damage: 4 },
        { kind: "missile", damage: 100 },
      ],
    }),
    ["BOMB DAMAGE: 4", "MISSILE DAMAGE: 100"],
    "Commander should show only bomb and missile damage",
  );
  assert.deepEqual(
    captureRaceStatLabels({
      raceOrbId: "commander",
      raceScalingDamageEnabled: false,
    }),
    [],
    "disabling scaling damage should hide Commander damage text",
  );
  assert.deepEqual(
    captureRaceStatLabels({
      raceOrbId: "sniper",
      raceSniperDamage: 50,
      raceSniperFireCooldown: 1.4,
      raceSniperShots: 2,
      raceSniperHits: 2,
    }),
    ["DAMAGE: 50", "SHOTS: 2"],
    "Sniper should show current damage and total shots fired",
  );
  assert.deepEqual(
    captureRaceStatLabels({
      raceOrbId: "snowball",
      raceDamage: 0,
      raceSnowballDamagePerSecond: 12,
      raceSnowballSize: 1.25,
    }),
    ["DAMAGE: 0", "DRAIN: 12/SEC · SIZE: 125%"],
    "Snowball should expose its continuous drain rate and growth",
  );
  assert.deepEqual(
    captureRaceStatLabels({
      raceOrbId: "ying-yang",
      raceDamage: 3,
      raceSpeed: 7,
      raceYingYangMode: "speed",
    }),
    ["DAMAGE: 3", "SPEED: 7"],
    "Ying Yang should show both retained phase ramps in either mode",
  );
  assert.ok(
    captureRaceStatLabels({ raceOrbId: "quadratic", raceDamage: ORB_RACE_MAX_MATH_DAMAGE, raceBounces: 49 })
      .includes("DAMAGE: 1,000,000,000,000,000,000,000 (MAX)"),
    "math damage that reaches the shared maximum should be marked in the HUD",
  );
  assert.deepEqual(
    captureRaceStatLabels({ raceOrbId: "hydrogen-bomb", raceDamage: 0, raceHydrogenCountdownElapsed: 12.345 }),
    ["47.655S"],
    "Hydrogen Bomb should show its millisecond timer without damage text",
  );
  assert.deepEqual(
    captureRaceStatLabels({ raceOrbId: "sniper", raceDamage: 1, raceSniperDamage: 75, raceSniperShots: 4, raceSniperHits: 2 }),
    ["DAMAGE: 75", "SHOTS: 4"],
    "Sniper should use its projectile damage and shot counter in the HUD",
  );
  assert.deepEqual(
    captureRaceStatLabels({ raceOrbId: "sniper", raceSniperDamage: 75, raceSniperShots: 4, raceScalingDamageEnabled: false }),
    ["SHOTS: 4"],
    "disabling scaling damage should hide Sniper damage but preserve the shot counter",
  );
}

{
  const fillStyles = [];
  const context = {
    save() {},
    restore() {},
    strokeText() {},
    fillText() {},
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set fillStyle(value) { fillStyles.push(value); },
  };
  SocialBattleRenderer.prototype.drawRaceStats.call(
    {},
    context,
    { raceOrbId: "hydrogen-bomb", raceHydrogenCountdownElapsed: 12.345 },
    ORB_RACERS["hydrogen-bomb"],
    { x: 0, y: 200, width: 900, height: 600 },
    0,
  );
  assert.ok(fillStyles.includes("#e11d48"), "Hydrogen Bomb countdown text should use the red warning color");
}

{
  const fillRects = [];
  const labels = [];
  const context = {
    save() {},
    restore() {},
    fillRect(...args) { fillRects.push(args); },
    strokeRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    strokeText(value) { labels.push(value); },
    fillText() {},
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set fillStyle(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceAbilityBar.call(
    {},
    context,
    { raceOrbId: "draftmaster", raceDraftSpeedLevel: 0, raceDraftNextUpgradeAt: 3 },
    ORB_RACERS.draftmaster,
    { x: 0, y: 200, width: 900, height: 600 },
    0,
    0,
    1,
    1.5,
  );
  assert.equal(fillRects.length, 2, "Draftmaster should render a background and progress fill");
  assert.ok(Math.abs(fillRects[1][2] - fillRects[0][2] * 0.5) < 1e-9, "Draftmaster upgrade bar should be half full halfway through its timer");
  assert.ok(labels.includes("UPGRADES"), "Draftmaster's side bar should be labeled for its upgrades");
}

{
  let fillCount = 0;
  SocialBattleRenderer.prototype.drawRaceAbilityBar.call(
    {},
    { fillRect() { fillCount += 1; } },
    ORB_RACERS["hydrogen-bomb"],
    { x: 0, y: 0, width: 100, height: 100 },
    0,
  );
  assert.equal(fillCount, 0, "Hydrogen Bomb should not render a cooldown or ability bar");
}

{
  const fillStyles = [];
  const context = {
    save() {},
    restore() {},
    strokeText() {},
    fillText() {},
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set fillStyle(value) { fillStyles.push(value); },
  };
  SocialBattleRenderer.prototype.drawRaceStats.call(
    {},
    context,
    {
      raceOrbId: "speed",
      raceAbilityIds: ["speed", "sticky"],
      raceSpeed: 12,
      raceStickyLevel: 4,
    },
    ORB_RACERS.speed,
    { x: 0, y: 200, width: 900, height: 600 },
    0,
  );
  assert.deepEqual(
    fillStyles,
    [ORB_RACERS.speed.color, ORB_RACERS.sticky.color],
    "combo HUD attributes should use their own orb themes",
  );
}

{
  assert.equal(
    raceThemeColorForRacer({ raceOrbId: "ying-yang", raceYingYangMode: "damage" }),
    "#090909",
    "Ying Yang damage mode should use its black theme",
  );
  assert.equal(
    raceThemeColorForRacer({ raceOrbId: "ying-yang", raceYingYangMode: "speed" }),
    "#ffffff",
    "Ying Yang speed mode should use its white theme",
  );
  const damageModeColor = raceLayerColorFor(
    raceThemeColorForRacer({ raceOrbId: "ying-yang", raceYingYangMode: "damage" }),
    50,
    100,
  );
  const speedModeColor = raceLayerColorFor(
    raceThemeColorForRacer({ raceOrbId: "ying-yang", raceYingYangMode: "speed" }),
    50,
    100,
  );
  assert.notEqual(damageModeColor, speedModeColor, "Ying Yang layer tint should follow the active mode theme");
}

{
  assert.equal(
    raceArenaBorderColorForTeam({ members: [{ raceOrbId: "reactor" }] }),
    ORB_RACERS.reactor.color,
    "Orb Race team frames should use the primary orb theme",
  );
  assert.deepEqual(
    classicArenaBorderColorsFor({
      gameplayMode: "classic",
      fighters: [{ type: "reactor" }, { type: "speed" }],
    }),
    [ORB_RACERS.reactor.color, ORB_RACERS.speed.color],
    "Classic arena border halves should use the two orb themes",
  );
  assert.deepEqual(
    classicArenaBorderColorsFor({ fighters: [{ type: "boxer" }, { type: "unknown" }] }),
    ["#e51b23", "#ff3b5c"],
    "Classic border fallbacks should remain visible for special or unknown orb IDs",
  );
}

{
  let particleFillCount = 0;
  const particleFillStyles = [];
  const context = {
    save() {},
    restore() {},
    beginPath() {},
    rect() {},
    clip() {},
    arc() {},
    stroke() {},
    fill() { particleFillCount += 1; },
    set strokeStyle(_value) {},
    set fillStyle(value) { particleFillStyles.push(value); },
    set lineWidth(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceBounceEffects.call(
    {},
    context,
    {
      raceBounceEffects: [{
        x: 0.4,
        y: 0.25,
        age: 0.2,
        color: "#8ef0ff",
        layerBreak: true,
        particles: [{ angle: 0, speed: 0.05, size: 0.1 }, { angle: Math.PI, speed: 0.05, size: 0.1 }],
        lifetime: 2.6,
      }],
      raceAbilityIds: ["speed", "sticky"],
    },
    ORB_RACERS.speed,
    { x: 0, y: 0, width: 800, height: 600 },
    36,
  );
  assert.equal(particleFillCount, 2, "layer-break rendering should draw each emitted particle");
  assert.ok(particleFillStyles.includes(ORB_RACERS.speed.color), "layer-break particles should include the base orb theme");
  assert.ok(particleFillStyles.includes(ORB_RACERS.sticky.color), "combo layer-break particles should include the composed theme");
}

{
  let orbUnitDraws = 0;
  SocialBattleRenderer.prototype.drawRaceOrb.call(
    {
      drawRaceOrbUnit() { orbUnitDraws += 1; },
    },
    {},
    { raceFinishExploded: true, raceOrbId: "speed" },
    ORB_RACERS.speed,
    40,
    40,
    20,
    0,
    { x: 0, y: 0, width: 100, height: 100 },
  );
  assert.equal(orbUnitDraws, 0, "the loser orb should disappear while its finish burst plays");

  const rendererProbe = {};
  const finishEffect = { age: 0, finishExplosion: true };
  assert.equal(
    SocialBattleRenderer.prototype.raceFinishExplosionAge.call(rendererProbe, { id: "loser" }, finishEffect, 1000),
    0,
    "a finish burst should start at its first render frame",
  );
  assert.equal(
    SocialBattleRenderer.prototype.raceFinishExplosionAge.call(rendererProbe, { id: "loser" }, finishEffect, 1600),
    0.6,
    "a finish burst should continue animating after the simulation has stopped",
  );
}

{
  let ringStrokes = 0;
  let satelliteFills = 0;
  const arcs = [];
  const context = {
    save() {},
    restore() {},
    beginPath() {},
    arc(x, y, radius) { arcs.push({ x, y, radius }); },
    stroke() { ringStrokes += 1; },
    fill() { satelliteFills += 1; },
    set strokeStyle(_value) {},
    set fillStyle(_value) {},
    set lineWidth(_value) {},
  };
  const rendererProbe = Object.create(SocialBattleRenderer.prototype);
  rendererProbe.drawRaceOrbUnit = () => {};
  rendererProbe.drawRaceWeaponMount = () => {};
  SocialBattleRenderer.prototype.drawRaceOrb.call(
    rendererProbe,
    context,
    { raceOrbId: "orbital", raceOrbiters: RACE_ORBITAL_ORBS_PER_RING + 1, raceX: 0.5, raceY: 0.25 },
    ORB_RACERS.orbital,
    500,
    250,
    45,
    0,
    { x: 0, y: 0, width: 1000, height: 500 },
  );
  assert.equal(ringStrokes, 1, "Orbital should render one shared ring after the first twenty-five satellites");
  assert.equal(satelliteFills, RACE_ORBITAL_ORBS_PER_RING + 1, "each Orbital satellite should render once");
  const satelliteArcs = arcs.slice(1);
  const center = { x: 500, y: 250 };
  const firstRingRadius = Math.hypot(
    satelliteArcs[0].x - center.x,
    satelliteArcs[0].y - center.y,
  );
  assert.ok(
    satelliteArcs.slice(0, RACE_ORBITAL_ORBS_PER_RING).every((arc) => (
      Math.abs(Math.hypot(arc.x - center.x, arc.y - center.y) - firstRingRadius) < 1e-9
    )),
    "Orbital satellites should render on a circular path around the parent",
  );
  assert.ok(
    satelliteArcs.every((arc) => Math.abs(arc.radius - 45 * RACE_ORBITAL_SATELLITE_RADIUS_SCALE) < 1e-9),
    "Orbital satellites should use the compact full-ring radius",
  );
}

{
  const tailArcs = [];
  const tailContext = {
    save() {},
    restore() {},
    beginPath() {},
    arc(x, y, radius) { tailArcs.push({ x, y, radius }); },
    fill() {},
    set fillStyle(_value) {},
  };
  const rendererProbe = Object.create(SocialBattleRenderer.prototype);
  rendererProbe.drawRaceOrbUnit = () => {};
  rendererProbe.drawRaceWeaponMount = () => {};
  SocialBattleRenderer.prototype.drawRaceOrb.call(
    rendererProbe,
    tailContext,
    {
      raceOrbId: "snake",
      raceSnakeTailOrbs: 1,
      raceSnakePath: [{ x: 0.5, y: 0.24 }],
      raceX: 0.5,
      raceY: 0.2,
    },
    ORB_RACERS.snake,
    500,
    250,
    45,
    0,
    { x: 0, y: 0, width: 1000, height: 500 },
  );
  assert.ok(
    tailArcs.some((arc) => Math.abs(arc.radius - 45 * RACE_SNAKE_TAIL_RADIUS_SCALE) < 1e-9),
    "Snake tail segments should be large enough to reach the number line during an airborne arc",
  );
  SocialBattleRenderer.prototype.drawRaceOrb.call(
    rendererProbe,
    tailContext,
    {
      raceOrbId: "snake",
      raceSnakeTailOrbs: 1,
      raceSnakePath: [{ x: 0.5, y: 0.24 }],
      raceX: 0.5,
      raceY: 0.2,
    },
    ORB_RACERS.snake,
    500,
    250,
    45,
    0.25,
    { x: 0, y: 0, width: 1000, height: 500 },
  );
  assert.notDeepEqual(
    { x: tailArcs[0].x, y: tailArcs[0].y },
    { x: tailArcs[2].x, y: tailArcs[2].y },
    "Snake tail segments should visibly wiggle between render frames",
  );
}

{
  const laserLines = [];
  const laserContext = {
    save() {},
    restore() {},
    beginPath() {},
    moveTo(x, y) { laserLines.push(["moveTo", x, y]); },
    lineTo(x, y) { laserLines.push(["lineTo", x, y]); },
    stroke() {},
    set strokeStyle(_value) {},
    set lineWidth(_value) {},
  };
  const borrowedLazer = {
    raceOrbId: "sticky",
    raceAbilityIds: ["sticky", "lazer"],
    raceReadyToFinish: false,
    raceOrbScale: 0.75,
    raceLayerIndex: 0,
    raceLayerHealth: [100, 100, 100],
    raceX: 0.5,
    raceY: 0.1,
    raceVx: 0,
    raceLaserAngle: 0,
  };
  SocialBattleRenderer.prototype.drawRaceLaser.call(
    {},
    laserContext,
    {},
    borrowedLazer,
    { x: 0, y: 0, width: 300, height: 600 },
    24,
  );
  assert.equal(laserLines.filter(([kind]) => kind === "moveTo").length, 3, "borrowed Lazer should render through the existing beam function");

  const mineCalls = [];
  const mineContext = {
    save() {},
    restore() {},
    beginPath() {},
    rect() {},
    clip() {},
    translate() {},
    arc() { mineCalls.push("arc"); },
    fill() {},
    stroke() {},
    set fillStyle(_value) {},
    set strokeStyle(_value) {},
    set lineWidth(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceMines.call(
    {},
    mineContext,
    {
      raceOrbId: "speed",
      raceAbilityIds: ["speed", "mines"],
      raceMineProjectiles: [{ ownerId: "fighter-1", x: 0.5, y: 0.2, radius: 0.012 }],
    },
    ORB_RACERS.speed,
    { x: 0, y: 0, width: 300, height: 600 },
    24,
  );
  assert.ok(mineCalls.length >= 2, "borrowed Splodey should render its active bomb projectiles");

  const drillDraws = [];
  const previousImage = globalThis.Image;
  class MockImage {
    complete = true;
    naturalWidth = 1;
    set src(value) { this.source = value; }
  }
  globalThis.Image = MockImage;
  const drillContext = {
    save() {},
    restore() {},
    beginPath() {},
    rect() {},
    clip() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    drawImage(...args) { drillDraws.push(args); },
  };
  try {
    SocialBattleRenderer.prototype.drawRaceDrillProjectiles.call(
      {},
      drillContext,
      {
        raceOrbId: "speed",
        raceAbilityIds: ["speed", "drill"],
        raceDrillProjectiles: [{ x: 0.5, y: 0.2 }],
      },
      ORB_RACERS.speed,
      { x: 0, y: 0, width: 300, height: 600 },
      24,
    );
  } finally {
    if (previousImage === undefined) delete globalThis.Image;
    else globalThis.Image = previousImage;
  }
  assert.equal(drillDraws.length, 1, "borrowed Drill should render its active projectile sprite");
  assert.ok(drillDraws[0][7] > 24 * 0.5 * 1.44, "Drill projectiles should render larger than the previous size");

  const comboLabels = [];
  const comboContext = {
    save() {},
    restore() {},
    strokeText() {},
    fillText(value) { comboLabels.push(value); },
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set fillStyle(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceStats.call(
    {},
    comboContext,
    {
      name: "FIBONACCI",
      raceOrbId: "fibonacci",
      raceAbilityIds: ["fibonacci", "speed", "gravity", "lazer", "mines", "grower", "sticky"],
      raceDamage: 5,
      raceSpeed: 2,
    },
    ORB_RACERS.fibonacci,
    { x: 0, y: 200, width: 900, height: 600 },
    0,
  );
  assert.deepEqual(comboLabels, ["DAMAGE: 5", "INTERVAL: LEVEL 1"], "weapon combo HUD should show damage and the Lazer interval level metric");
  assert.ok(comboLabels.every((label) => !label.includes("COMBO")), "weapon combo HUD should omit explicit combo text");
}

{
  const calls = [];
  const context = {
    save() {},
    restore() {},
    beginPath() { calls.push("beginPath"); },
    moveTo() {},
    quadraticCurveTo() { calls.push("quadraticCurveTo"); },
    lineTo() { calls.push("lineTo"); },
    closePath() {},
    fill() { calls.push("fill"); },
    stroke() { calls.push("stroke"); },
    arc() {},
    set fillStyle(_value) {},
    set strokeStyle(_value) {},
    set lineWidth(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceIntegralArc.call(
    {},
    context,
    { raceX: 0.4, raceIntegralPath: [{ x: 0.4, y: 0.08 }, { x: 0.45, y: 0.12 }, { x: 0.5, y: 0.1 }] },
    { x: 0, y: 0, width: 900, height: 600 },
    120,
    140,
  );
  assert.ok(calls.includes("lineTo"), "Integral should render a live trajectory from its sampled path");
  assert.ok(calls.includes("fill") && calls.includes("stroke"), "Integral should shade and outline the area under its arc");
}

{
  const slotText = [];
  const slotRects = [];
  let slotRotations = 0;
  const slotContext = {
    save() {},
    restore() {},
    fillRect(x, y, width, height) { slotRects.push({ x, y, width, height }); },
    strokeRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fill() {},
    arc() {},
    rect() {},
    clip() {},
    translate() {},
    rotate() { slotRotations += 1; },
    strokeText() {},
    fillText(value) { slotText.push(value); },
    set font(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set fillStyle(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceSlotMachine.call(
    {},
    slotContext,
    {
      raceJackpotSlots: ["unlucky", "medium", "lucky"],
      raceJackpotOutcomeLabel: "CASH",
      raceJackpotTier: "cash",
      raceJackpotMultiplier: 10,
      raceJackpotCooldown: 3.2,
      raceJackpotSpinUntil: 0,
    },
    ORB_RACERS.jackpot,
    { x: 100, y: 200, width: 900, height: 600 },
    0,
    10,
  );
  assert.deepEqual(slotText, ["0.5×", "2×", "10×", "NEXT SPIN: 3.2S"], "Jackpot should keep all roll values inside its three reels");
  assert.ok(slotRects[0].width > 300, "Jackpot's generated cabinet should be fifty percent larger than its previous 215px body");
  assert.equal(slotRotations, 0, "the Jackpot lever should pull vertically instead of rotating sideways");
}

function run(sim, seconds = 120) {
  for (let step = 0; step < seconds / dt && !sim.finished; step += 1) stepSimulation(sim, dt);
}

{
  assert.equal(PRESENTATION_IMPACT_PAUSE_MS, 65);
  assert.equal(PRESENTATION_PROJECTILE_PAUSE_MS, 70);
  assert.equal(PRESENTATION_COLLISION_PAUSE_MS, 90);
  assert.equal(PRESENTATION_CRITICAL_PAUSE_MS, 120);
  assert.equal(PRESENTATION_CLASH_PAUSE_MS, 75);
  assert.equal(PRESENTATION_KNOCKOUT_PAUSE_MS, 180);
  assert.equal(presentationPauseMs({ type: "weapon-hit" }), 65);
  assert.equal(presentationPauseMs({ type: "collision-hit" }), 90);
  assert.equal(presentationPauseMs({ type: "invulnerable-block" }), 90);
  assert.equal(presentationPauseMs({ type: "world-cup-card-hit" }), 120);
  assert.equal(presentationPauseMs({ type: "world-cup-ball-hit" }), 120);
  assert.equal(presentationPauseMs({ type: "volta-bolt-hit" }), 70);
  assert.equal(presentationPauseMs({ type: "weapon-clash" }), 75);
  assert.equal(presentationPauseMs({ type: "knockout" }), 180);
  assert.equal(impactPresentationForEvent({ type: "weapon-hit" }).kind, "regular");
  assert.equal(impactPresentationForEvent({ type: "collision-hit" }).kind, "collision");
  assert.equal(impactPresentationForEvent({ type: "world-cup-card-hit" }).kind, "critical");
  assert.equal(impactPresentationForEvent({ type: "world-cup-ball-hit" }).kind, "critical");
  assert.equal(impactPresentationForEvent({ type: "world-cup-ball-hit" }).shake, 0.78);
  assert.equal(impactPresentationForEvent({ type: "volta-bolt-hit" }).kind, "regular");
  assert.ok(
    impactPresentationForEvent({ type: "knockout" }).priority > impactPresentationForEvent({ type: "weapon-hit" }).priority,
    "a knockout impact frame should not be replaced by its trailing weapon-hit event",
  );
  assert.equal(presentationPauseMs({ type: "arcane-burst" }), 0);
}

{
  const portrait = socialBattleLayout(SOCIAL_FORMATS.portrait.width, SOCIAL_FORMATS.portrait.height, "portrait");
  const largePortrait = socialBattleLayout(SOCIAL_FORMATS.portrait.width, SOCIAL_FORMATS.portrait.height, "portrait", "large");
  const square = socialBattleLayout(SOCIAL_FORMATS.square.width, SOCIAL_FORMATS.square.height, "square");
  const landscape = socialBattleLayout(SOCIAL_FORMATS.landscape.width, SOCIAL_FORMATS.landscape.height, "landscape");
  assert.equal(ARENA.width, ARENA.height, "simulation arena must be square");
  for (const [height, layout] of [
    [SOCIAL_FORMATS.portrait.height, portrait],
    [SOCIAL_FORMATS.square.height, square],
    [SOCIAL_FORMATS.landscape.height, landscape],
  ]) {
    assert.equal(layout.arena.width, layout.arena.height, "export arena must be rendered as a true square");
    assert.ok(layout.arena.width >= 740, "square arena should remain dominant in every export format");
    assert.ok(layout.names.y + layout.names.height < layout.arena.y);
    assert.ok(layout.abilities.y > layout.arena.y + layout.arena.height);
    assert.ok(layout.abilities.y + layout.abilities.height <= height);
  }
  assert.equal(portrait.names.y, 410, "portrait matchup title should sit above the reference-aligned arena");
  assert.equal(portrait.arena.y, 564, "portrait arena should begin directly below the matchup title");
  assert.equal(portrait.arena.width, Math.round(SOCIAL_FORMATS.portrait.width * 0.71), "portrait arena should match the reference width proportion");
  assert.equal(largePortrait.arena.width, Math.round(SOCIAL_FORMATS.portrait.width * 0.95), "large Classic arena should expand toward the recording edges");
  assert.ok(largePortrait.arena.width > portrait.arena.width);
}

{
  const renderer = {
    classicMarkerSimulation: null,
    classicMarkerLastTime: -1,
    classicPreviousHealth: new Map(),
    classicHealthMarkers: [],
  };
  const web = { id: "cutter", type: "cutter", health: 100 };
  const target = { id: "target", type: "hydrogen-bomb", health: 100, x: 320, y: 320 };
  const sim = {
    gameplayMode: "classic",
    time: 0,
    fighters: [web, target],
    events: [],
  };
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  target.health = 99.8;
  sim.time = 0.1;
  sim.events = [{ type: "classic-dot-tick", fighterId: web.id, targetId: target.id, dotKind: "frost-trail" }];
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  target.health = 99.6;
  sim.time = 0.2;
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  assert.equal(renderer.classicHealthMarkers.length, 2, "repeated web ticks should remain separate marker transactions");
  assert.deepEqual(renderer.classicHealthMarkers.map((marker) => marker.delta), [-1, -1]);
}

{
  const renderer = {
    classicMarkerSimulation: null,
    classicMarkerLastTime: -1,
    classicPreviousHealth: new Map(),
    classicHealthMarkers: [],
    classicContinuousHealthRemainders: new Map(),
  };
  const lazer = { id: "lazer", type: "lazer", health: 100, x: 180, y: 180, radius: 36 };
  const target = { id: "target", type: "hydrogen-bomb", health: 100, x: 420, y: 240, radius: 36 };
  const sim = {
    gameplayMode: "classic",
    time: 0,
    fighters: [lazer, target],
    events: [],
  };
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  for (let tick = 1; tick <= 5; tick += 1) {
    target.health -= 0.2;
    sim.time = tick / 10;
    sim.events = [{
      id: tick,
      time: sim.time,
      type: "classic-dot-tick",
      fighterId: lazer.id,
      targetId: target.id,
      dotKind: "laser",
      amount: 0.2,
    }];
    SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  }
  assert.deepEqual(
    renderer.classicHealthMarkers.map((marker) => marker.delta),
    [-1],
    "continuous Lazer damage should emit one -1 marker per full health point, not a rapid fractional stack",
  );
  assert.equal(renderer.classicHealthMarkers[0].startedAt, 0.5, "batched Lazer markers should age from the damage event time");
  target.health -= 0.2;
  sim.time = 0.6;
  sim.events = [{
    id: 6,
    time: sim.time,
    type: "classic-dot-tick",
    fighterId: lazer.id,
    targetId: target.id,
    dotKind: "laser",
    amount: 0.2,
  }];
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  assert.deepEqual(
    renderer.classicHealthMarkers.map((marker) => marker.delta),
    [-1],
    "a partial Lazer tick should remain in the remainder instead of creating a phantom -1",
  );
}

{
  const renderer = {
    classicMarkerSimulation: null,
    classicMarkerLastTime: -1,
    classicPreviousHealth: new Map(),
    classicHealthMarkers: [],
    classicContinuousHealthRemainders: new Map(),
  };
  const lazer = { id: "lazer", type: "lazer", health: 100, x: 180, y: 180, radius: 36 };
  const target = { id: "target", type: "hydrogen-bomb", health: 100, x: 420, y: 240, radius: 36 };
  const sim = {
    gameplayMode: "classic",
    time: 0,
    fighters: [lazer, target],
    events: [],
  };
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  target.health = 99;
  sim.time = 0.1;
  sim.events = [
    {
      id: 101,
      time: 0.1,
      type: "classic-laser-pass",
      entityId: "laser-line-1",
      fighterId: lazer.id,
      targetId: target.id,
      amount: 1,
    },
    {
      id: 102,
      time: 0.1,
      type: "classic-dot-tick",
      entityId: "laser-line-1",
      fighterId: lazer.id,
      targetId: target.id,
      dotKind: "laser",
      amount: 1,
    },
  ];
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  assert.deepEqual(
    renderer.classicHealthMarkers.map((marker) => marker.delta),
    [-1],
    "a laser pass and its matching dot tick must render one -1, not duplicate damage labels",
  );
}

{
  const renderer = {
    classicMarkerSimulation: null,
    classicMarkerLastTime: -1,
    classicPreviousHealth: new Map(),
    classicHealthMarkers: [],
  };
  const spikey = { id: "spikey", type: "spikey", health: 100, x: 120, y: 180, radius: 36 };
  const vampire = { id: "vampire", type: "vampire", health: 40, x: 520, y: 280, radius: 42 };
  const target = { id: "target", type: "hydrogen-bomb", health: 100, x: 320, y: 320, radius: 36 };
  const sim = {
    gameplayMode: "classic",
    time: 0,
    fighters: [spikey, vampire, target],
    events: [],
  };
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  target.health = 99.4;
  sim.time = 0.1;
  sim.events = [{ type: "classic-projectile-hit", fighterId: spikey.id, targetId: target.id, projectileKind: "spike" }];
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  target.health = 98.8;
  sim.time = 0.2;
  sim.events = [{ type: "classic-projectile-hit", fighterId: spikey.id, targetId: target.id, projectileKind: "spike" }];
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  vampire.health = 41;
  sim.time = 0.3;
  sim.events = [{ type: "classic-heal", fighterId: vampire.id, sourceId: target.id, amount: 1, reason: "vampire-latch" }];
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  assert.deepEqual(renderer.classicHealthMarkers.map((marker) => marker.delta), [-1, -1, 1], "Spikey hits and Vampire leech healing should remain separate visible transactions");
  assert.equal(renderer.classicHealthMarkers.at(-1).fighterId, vampire.id);
}

{
  const renderer = {
    classicMarkerSimulation: null,
    classicMarkerLastTime: -1,
    classicPreviousHealth: new Map(),
    classicHealthMarkers: [],
  };
  const pistol = { id: "pistol", type: "pistol", health: 100, x: 180, y: 180, radius: 36 };
  const target = { id: "target", type: "hydrogen-bomb", health: 100, x: 420, y: 240, radius: 36 };
  const sim = {
    gameplayMode: "classic",
    time: 0,
    fighters: [pistol, target],
    events: [],
  };
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  target.health = 94;
  sim.time = 0.1;
  sim.events = [
    { id: 1, time: 0.1, type: "classic-projectile-hit", fighterId: pistol.id, targetId: target.id, projectileKind: "pistol-ammo", amount: 3 },
    { id: 2, time: 0.1, type: "classic-projectile-hit", fighterId: pistol.id, targetId: target.id, projectileKind: "pistol-ammo", amount: 3 },
  ];
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(renderer, sim);
  assert.deepEqual(
    renderer.classicHealthMarkers.map((marker) => marker.delta),
    [-3, -3],
    "each Pistol round should render its own -3 marker",
  );

  const criticalRenderer = {
    classicMarkerSimulation: null,
    classicMarkerLastTime: -1,
    classicPreviousHealth: new Map(),
    classicHealthMarkers: [],
  };
  const boxer = { id: "boxer", type: "boxer", health: 100, x: 180, y: 180, radius: 36 };
  const criticalTarget = { id: "critical-target", type: "hydrogen-bomb", health: 100, x: 420, y: 240, radius: 36 };
  const criticalSim = {
    gameplayMode: "classic",
    time: 0,
    fighters: [boxer, criticalTarget],
    events: [],
  };
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(criticalRenderer, criticalSim);
  criticalTarget.health = 90;
  criticalSim.time = 0.1;
  criticalSim.events = [
    { id: 41, time: 0.1, type: "classic-punch-hit", fighterId: boxer.id, targetId: criticalTarget.id, hand: "left", amount: 5, critical: true },
    { id: 42, time: 0.1, type: "classic-punch-hit", fighterId: boxer.id, targetId: criticalTarget.id, hand: "right", amount: 5, critical: true },
    { id: 43, time: 0.1, type: "classic-critical", fighterId: boxer.id, targetId: criticalTarget.id, amount: 10, source: "classic-double-punch", critical: true },
  ];
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(criticalRenderer, criticalSim);
  assert.deepEqual(
    criticalRenderer.classicHealthMarkers.map((marker) => marker.delta),
    [-10],
    "a two-fist critical should show one -10 marker, not two -5 markers or a +10 residual",
  );

  const blueSunRenderer = {
    classicMarkerSimulation: null,
    classicMarkerLastTime: -1,
    classicPreviousHealth: new Map(),
    classicHealthMarkers: [],
  };
  const blueSun = { id: "blue-sun", type: "blue-sun", health: 100, x: 180, y: 180, radius: 36 };
  const blueSunTarget = { id: "blue-sun-target", type: "hydrogen-bomb", health: 100, x: 420, y: 240, radius: 36 };
  const blueSunSim = {
    gameplayMode: "classic",
    time: 0,
    fighters: [blueSun, blueSunTarget],
    events: [],
  };
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(blueSunRenderer, blueSunSim);
  blueSunTarget.health = 98;
  blueSunSim.time = 0.1;
  blueSunSim.events = [
    { id: 31, time: 0.1, type: "classic-blue-sun-hit", fighterId: blueSun.id, targetId: blueSunTarget.id, amount: 1 },
    { id: 32, time: 0.1, type: "classic-blue-sun-hit", fighterId: blueSun.id, targetId: blueSunTarget.id, amount: 1 },
  ];
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(blueSunRenderer, blueSunSim);
  assert.deepEqual(
    blueSunRenderer.classicHealthMarkers.map((marker) => marker.delta),
    [-1, -1],
    "Blue Sun beam ticks should render individual damage markers",
  );

  const zeusMarkerRenderer = {
    classicMarkerSimulation: null,
    classicMarkerLastTime: -1,
    classicPreviousHealth: new Map(),
    classicHealthMarkers: [],
    classicZeusMarkerSequences: new Map(),
  };
  const zeus = { id: "zeus", type: "zeus", health: 100, x: 180, y: 180, radius: 36 };
  const zeusTarget = {
    id: "zeus-target",
    type: "hydrogen-bomb",
    health: 100,
    x: 420,
    y: 240,
    radius: 36,
    classicZeusDamageMarkerAmount: 0,
    classicZeusDamageMarkerAt: 0,
    classicZeusDamageMarkerSequence: 0,
  };
  const zeusSim = { gameplayMode: "classic", time: 0, fighters: [zeus, zeusTarget], events: [] };
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(zeusMarkerRenderer, zeusSim);
  zeusTarget.health = 95;
  zeusTarget.classicZeusDamageMarkerAmount = 5;
  zeusTarget.classicZeusDamageMarkerAt = 0.1;
  zeusTarget.classicZeusDamageMarkerSequence = 1;
  zeusSim.time = 0.1;
  zeusSim.events = [];
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(zeusMarkerRenderer, zeusSim);
  assert.deepEqual(
    zeusMarkerRenderer.classicHealthMarkers.map((marker) => marker.delta),
    [-5],
    "Zeus should retain a visible damage marker when its short dot event has rolled out",
  );

  const recurringDamageCases = [
    {
      type: "blue-sun",
      event: { type: "classic-blue-sun-hit", amount: 5 },
      expected: -5,
    },
    {
      type: "vampire",
      event: { type: "classic-dot-tick", dotKind: "vampire-latch", amount: 3 },
      expected: -3,
    },
    {
      type: "cutter",
      event: { type: "classic-dot-tick", dotKind: "cutter-zone", amount: 2 },
      expected: -2,
    },
    {
      type: "necromancer",
      event: { type: "classic-projectile-hit", projectileKind: "necromancer-arrow", amount: 3 },
      expected: -3,
    },
    {
      type: "snake",
      event: { type: "classic-projectile-hit", projectileKind: "snake-head", amount: 3 },
      expected: -3,
    },
    {
      type: "trapper",
      event: { type: "classic-dot-tick", dotKind: "trap", amount: 3 },
      expected: -3,
    },
  ];
  for (const [index, testCase] of recurringDamageCases.entries()) {
    const recurringRenderer = {
      classicMarkerSimulation: null,
      classicMarkerLastTime: -1,
      classicPreviousHealth: new Map(),
      classicHealthMarkers: [],
      classicContinuousHealthRemainders: new Map(),
    };
    const source = { id: `${testCase.type}-${index}`, type: testCase.type, health: 100, x: 180, y: 180, radius: 36 };
    const recurringTarget = { id: `target-${index}`, type: "hydrogen-bomb", health: 100, x: 420, y: 240, radius: 36 };
    const recurringSim = {
      gameplayMode: "classic",
      time: 0,
      fighters: [source, recurringTarget],
      events: [],
    };
    SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(recurringRenderer, recurringSim);
    recurringTarget.health -= testCase.expected * -1;
    recurringSim.time = 0.1;
    recurringSim.events = [{ id: 700 + index, time: 0.1, fighterId: source.id, targetId: recurringTarget.id, ...testCase.event }];
    SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(recurringRenderer, recurringSim);
    assert.deepEqual(
      recurringRenderer.classicHealthMarkers.map((marker) => marker.delta),
      [testCase.expected],
      `${testCase.type} should display its actual recurring damage amount`,
    );
  }

  const burstRenderer = {
    classicMarkerSimulation: null,
    classicMarkerLastTime: -1,
    classicPreviousHealth: new Map(),
    classicHealthMarkers: [],
  };
  const spikey = { id: "spikey", type: "spikey", health: 100, x: 180, y: 180, radius: 36 };
  const burstTarget = { id: "burst-target", type: "hydrogen-bomb", health: 100, x: 420, y: 240, radius: 36 };
  const burstSim = {
    gameplayMode: "classic",
    time: 0,
    fighters: [spikey, burstTarget],
    events: [],
  };
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(burstRenderer, burstSim);
  burstTarget.health = 90;
  burstSim.time = 0.1;
  burstSim.events = Array.from({ length: 10 }, (_, index) => ({
    id: 100 + index,
    time: 0.1,
    type: "classic-projectile-hit",
    fighterId: spikey.id,
    targetId: burstTarget.id,
    projectileKind: "spike",
    amount: 1,
  }));
  SocialBattleRenderer.prototype.updateClassicHealthMarkers.call(burstRenderer, burstSim);
  assert.equal(burstRenderer.classicHealthMarkers.length, 10, "health markers must not cap simultaneous hits");
  assert.ok(burstRenderer.classicHealthMarkers.every((marker) => marker.delta === -1));
}

{
  const drawCalls = [];
  const titleContext = {
    font: "",
    fillStyle: "",
    measureText(text) {
      const fontSize = Number(this.font.match(/(\d+(?:\.\d+)?)px/)?.[1] || 1);
      return { width: String(text).length * fontSize * 0.56 };
    },
    save() {},
    restore() {},
    strokeText(text, x, y) { drawCalls.push({ kind: "stroke", text, x, y, color: this.fillStyle }); },
    fillText(text, x, y) { drawCalls.push({ kind: "fill", text, x, y, color: this.fillStyle }); },
  };
  for (const [left, right] of [["SWORD", "AXE"], ["HYDROGEN BOMB", "HYDROGEN BOMB"]]) {
    const title = classicMatchupTitleLayout(titleContext, left, right, {
      width: 1080,
      safeWidth: 980,
      maxFontSize: 84,
      minFontSize: 22,
    });
    assert.ok(title.totalWidth <= title.safeWidth + 1e-6, `${left} VS ${right} should fit the 1080px safe width`);
    assert.ok(title.vsX - (title.leftX + title.leftWidth) >= title.gap - 1e-6);
    assert.ok(title.rightX - (title.vsX + title.vsWidth) >= title.gap - 1e-6);
  }
  const iconTitle = classicMatchupTitleLayout(titleContext, "HYDROGEN BOMB", "NECROMANCER", {
    width: 1080,
    safeWidth: 980,
    maxFontSize: 84,
    minFontSize: 22,
    leftIcon: { widthRatio: 1.2, heightRatio: 1.08 },
    rightIcon: { widthRatio: 1.12, heightRatio: 1.12 },
  });
  assert.ok(iconTitle.totalWidth <= iconTitle.safeWidth + 1e-6, "icon title should fit the 1080px safe width");
  assert.ok(Math.abs(iconTitle.groupCenter - 540) < 1e-6, "title group should be centered");
  assert.deepEqual(
    iconTitle.segments.map((segment) => segment.kind),
    ["left-text", "left-icon", "vs", "right-icon", "right-text"],
    "icons should remain inline between names and VS",
  );
  for (let index = 1; index < iconTitle.segments.length; index += 1) {
    const previous = iconTitle.segments[index - 1];
    const current = iconTitle.segments[index];
    assert.ok(
      previous.x + previous.width <= current.x + 1e-6,
      `${previous.kind} must not overlap ${current.kind}`,
    );
  }
  const rosterNames = Object.values(CLASS_DEFS).map((definition) => definition.name);
  for (const left of rosterNames) {
    for (const right of rosterNames) {
      const pair = classicMatchupTitleLayout(titleContext, left, right, {
        width: 1080,
        safeWidth: 980,
        maxFontSize: 84,
        minFontSize: 22,
      });
      assert.ok(pair.totalWidth <= pair.safeWidth + 1e-6, `${left} VS ${right} should fit without overlap`);
      assert.ok(Math.abs(pair.groupCenter - 540) < 1e-6, `${left} VS ${right} should remain centered`);
      for (let index = 1; index < pair.segments.length; index += 1) {
        const previous = pair.segments[index - 1];
        const current = pair.segments[index];
        assert.ok(previous.x + previous.width <= current.x + 1e-6, `${left} VS ${right} segments should not overlap`);
      }
    }
  }
  SocialBattleRenderer.prototype.drawFighterNames.call({}, titleContext, {
    fighters: [
      { name: "Hydrogen Bomb", type: "hydrogen-bomb" },
      { name: "Hydrogen Bomb", type: "hydrogen-bomb" },
    ],
  }, { x: 0, y: 340, width: 1080, height: 132 }, true);
  const fills = drawCalls.filter((call) => call.kind === "fill");
  assert.deepEqual(fills.map((call) => call.text), ["BOMB 60.0S", "BOMB 60.0S", "HYDROGEN BOMB", "VS", "HYDROGEN BOMB"]);
  assert.ok(fills.some((call) => call.color === "#ffffff"), "black theme VS should retain a high-contrast white fill");

  const captureClassicTopStats = (left, right) => {
    const labels = [];
    const context = {
      font: "",
      fillStyle: "",
      measureText(text) {
        const fontSize = Number(this.font.match(/(\d+(?:\.\d+)?)px/)?.[1] || 1);
        return { width: String(text).length * fontSize * 0.56 };
      },
      save() {},
      restore() {},
      strokeText() {},
      fillText(text) { labels.push(text); },
    };
    SocialBattleRenderer.prototype.drawFighterNames.call({}, context, {
      gameplayMode: "classic",
      fighters: [left, right],
      classicTeams: [[left.type], [right.type]],
      classicTeamNames: [left.name, right.name],
    }, { x: 0, y: 340, width: 1080, height: 132 }, false, true);
    return labels;
  };

  const slammyStats = captureClassicTopStats(
    { name: "SLAMMY", type: "slammy", damage: 5, classicTeamIndex: 0 },
    { name: "SWORD", type: "sword", damage: 1, classicTeamIndex: 1 },
  );
  assert.ok(slammyStats.includes("DAMAGE: 5"), "Orb Foundry Slammy should show damage in its top-side HUD");

  const unarmedStats = captureClassicTopStats(
    { name: "UNARMED", type: "unarmed", damage: 4, baselineSpeed: 445.5, classicTeamIndex: 0 },
    { name: "SWORD", type: "sword", damage: 1, classicTeamIndex: 1 },
  );
  assert.ok(
    unarmedStats.includes("DAMAGE: 4 · SPEED: 445.5"),
    "Orb Foundry Unarmed should show damage and speed in its top-side HUD",
  );

  const duplicatorStats = captureClassicTopStats(
    { name: "DUPLICATOR", type: "duplicator", classicDuplicateSequence: 3, classicTeamIndex: 0 },
    { name: "SWORD", type: "sword", damage: 1, classicTeamIndex: 1 },
  );
  assert.ok(duplicatorStats.includes("DUPLICATES: 3"), "Orb Foundry Duplicator should show its duplicate count in the top-side HUD");
}

{
  const ctaDrawCalls = [];
  const ctaContext = {
    font: "",
    fillStyle: "",
    save() {},
    restore() {},
    measureText(text) {
      const fontSize = Number(this.font.match(/(\d+(?:\.\d+)?)px/)?.[1] || 1);
      return { width: String(text).length * fontSize * 0.56 };
    },
    strokeText(text, x, y) { ctaDrawCalls.push({ kind: "stroke", text, x, y }); },
    fillText(text, x, y) { ctaDrawCalls.push({ kind: "fill", text, x, y }); },
  };
  const cta = classicCtaLayout(ctaContext, {
    width: 1080,
    safeWidth: 980,
    maxFontSize: 64,
    minFontSize: 22,
  });
  assert.equal(cta.phrase, "LIKE & SUBSCRIBE");
  assert.deepEqual(cta.segments.map((segment) => segment.text), ["LIKE", "&", "SUBSCRIBE"]);
  assert.ok(Math.abs(cta.groupCenter - 540) < 1e-6, "CTA should be centered by its measured group width");
  for (let index = 1; index < cta.segments.length; index += 1) {
    const previous = cta.segments[index - 1];
    const current = cta.segments[index];
    assert.ok(current.x - (previous.x + previous.width) > 0, "CTA runs should retain visible gaps");
  }
  SocialBattleRenderer.prototype.drawClassicStatDock.call({}, ctaContext, {}, { x: 0, y: 0, width: 1080, height: 92 }, true);
  assert.deepEqual(
    ctaDrawCalls.filter((call) => call.kind === "fill").map((call) => call.text),
    ["LIKE", "&", "SUBSCRIBE"],
    "CTA renderer should preserve the visible phrase runs",
  );
  assert.equal(
    classicAbsorberHistoryLabelFor({
      fighters: [{ type: "absorber", classicAbsorptionHistory: ["vampire", "blue-sun"] }],
    }),
    "ABSORBED: VAMPIRE · BLUE SUN",
    "Classic Absorber history should expose the absorbed orb names for the line below the CTA",
  );
  const lazerPath = classicLazerPathFor({ x: 48, y: 160, x2: 672, y2: 520, width: 5 }, {
    width: 720,
    height: 720,
    padding: 48,
  });
  assert.equal(lazerPath.points.length, 2, "Lazer/Webball should render exactly one active path");
  assert.deepEqual(lazerPath.points, [
    { x: 48, y: 160 },
    { x: 672, y: 520 },
  ]);
  const ricochetPath = classicLazerPathFor({
    x: 24,
    y: 24,
    x2: 696,
    y2: 696,
    previousWallContact: { x: 64, y: 180, side: "left" },
    nextWallContact: { x: 690, y: 520, side: "right" },
  }, { width: 720, height: 720, padding: 24 });
  assert.deepEqual(ricochetPath.points, [
    { x: 64, y: 180 },
    { x: 690, y: 520 },
  ], "Lazer should render Gameplay's exact angled ricochet leg");
  assert.notEqual(ricochetPath.angle, 0, "an angled ricochet leg should retain its direction");
  const permanentPaths = classicLazerSegmentsFor({
    segments: [
      { x1: 24, y1: 362, x2: 673, y2: 696, width: 5, active: false },
      { x1: 673, y1: 696, x2: 402, y2: 24, width: 5, active: true },
    ],
  }, { width: 720, height: 720, padding: 0 });
  assert.equal(permanentPaths.length, 2, "completed Lazer segments should remain renderable");
  assert.ok(permanentPaths.every((path) => path.start && path.end && Number.isFinite(path.angle)));
  assert.ok(permanentPaths[1].angle < -Math.PI / 2, "the active segment should retain its diagonal direction");
}

{
  const weaponRoot = new URL("../assets/generated/classic-weapons-20260808/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.json", weaponRoot), "utf8"));
  assert.equal(manifest.version, "classic-weapons-20260808");
  assert.deepEqual(Object.keys(manifest.assets), ["sawball-blade", "trident-weapon", "grappler-gun", "grappler-hook", "turret-cannon"]);
  for (const asset of Object.values(manifest.assets)) {
    const source = new URL(asset.source.replace("assets/generated/classic-weapons-20260808/", ""), weaponRoot);
    const final = new URL(asset.final.replace("assets/generated/classic-weapons-20260808/", ""), weaponRoot);
    assert.ok(existsSync(source), `${asset.source} should preserve its chroma source`);
    assert.ok(existsSync(final), `${asset.final} should provide a runtime final`);
    assert.ok(readFileSync(final).length > 1000, `${asset.final} should not be an empty/header-only PNG`);
  }
  const pistol = classicDraftmasterGunSourceRect(1717, 916, "pistol");
  const rifle = classicDraftmasterGunSourceRect(1717, 916, "rifle");
  const shotgun = classicDraftmasterGunSourceRect(1717, 916, "shotgun");
  assert.equal(pistol.x, 1717 / 4 * 2);
  assert.equal(rifle.x, 1717 / 4 * 3);
  assert.equal(shotgun.y, 916 / 2);
  assert.equal(classicDraftmasterAmmoSourceRect(2103, 748, "shotgun-ammo").x, 2103 / 3 * 2);
  const shotgunShellCrop = classicShotgunAmmoSourceRect(2172, 724, 0);
  assert.ok(shotgunShellCrop.width > shotgunShellCrop.height * 2, "generated shotgun shell crop should remain a straight horizontal projectile");
  assert.ok(classicTridentImpactAlpha(0) === 1 && classicTridentImpactAlpha(1.55) === 0, "Trident impact particles should fade over their burst window");
  assert.equal(classicDraftmasterAmmoSourceRect(2103, 748, "rifle-ammo").x, 2103 / 3);
  const tridentCrop = classicTridentSourceRect(1254, 1254);
  assert.ok(tridentCrop.width > tridentCrop.height * 2, "the generated trident crop should remain horizontal");
  assert.deepEqual(classicTridentDimensions(10), { width: 49, height: 23 });
  const grappleCrop = classicDedicatedWeaponSourceRect(1254, 1254, "grappler");
  const grappleHookCrop = classicDedicatedWeaponSourceRect(1254, 1254, "grappler-hook");
  const turretCrop = classicDedicatedWeaponSourceRect(1254, 1254, "turret");
  assert.ok(grappleCrop.width > grappleCrop.height * 1.8, "the generated Grappler weapon crop should remain horizontal");
  assert.ok(grappleHookCrop.width > grappleHookCrop.height * 0.7, "the generated Grappler hook crop should remain readable");
  assert.ok(turretCrop.width > turretCrop.height * 1.2, "the generated Turret weapon crop should remain horizontal");
  const rendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
  assert.match(rendererSource, /classic-weapons-20260808\/final\/sawball-blade\.png/);
  assert.match(rendererSource, /classic-weapons-20260808\/final\/trident-weapon\.png/);
  assert.match(rendererSource, /classic-weapons-20260808\/final\/grappler-gun\.png/);
  assert.match(rendererSource, /classic-weapons-20260808\/final\/grappler-hook\.png/);
  assert.match(rendererSource, /classic-weapons-20260808\/final\/turret-cannon\.png/);
  assert.match(rendererSource, /fighter\.classicSawballDiscs/);
  assert.match(rendererSource, /radius \* 2\.6/);
  assert.match(rendererSource, /drawClassicGunOverlay/);
  assert.match(rendererSource, /drawClassicDraftmasterWeapons/);
  assert.match(rendererSource, /drawClassicGrapplerWeapon/);
  assert.match(rendererSource, /drawClassicTurretWeapon/);
  assert.match(rendererSource, /CLASSIC_DEDICATED_WEAPON_TYPES/);
  assert.match(rendererSource, /classicTridentDimensions\(radius\)/);
  assert.match(rendererSource, /tridentRenderRadius = Math\.max\(radius, Number\(owner\?\.radius\)/);
  assert.match(rendererSource, /entity\.fillColor \|\| "#168cff44"/);
  assert.match(rendererSource, /entity\.zoneFill \|\| "#9f123944"/);
  assert.match(rendererSource, /lineStart = entity\.lineStart/);
  assert.match(rendererSource, /x: radius \* 1\.72/);
  assert.match(rendererSource, /draftmaster-ammo/);
  assert.doesNotMatch(rendererSource, /assets\/race\/generated\/sawblade-weapons\.png/);
  assert.doesNotMatch(rendererSource, /drawClassicPresentationSprite\(ctx, "draftmaster"/);
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["orbital", "duplicator"],
    seed: 144,
  });
  const pi = sim.fighters.find((fighter) => fighter.raceOrbId === "orbital");
  sim.finished = true;
  sim.winner = pi;
  assert.equal(winnerFieldMessage(sim), "ORBITAL wins");
  assert.deepEqual(winnerFieldSegments(sim), [
    { text: "ORBITA", color: "#00d8e8" },
    { text: "L wins", color: "#8ef0ff" },
  ]);
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceOrbs: ["jackpot", "speed-impact"],
    seed: 147,
  });
  const jackpot = sim.fighters.find((fighter) => fighter.raceOrbId === "jackpot");
  sim.finished = true;
  sim.winner = jackpot;
  assert.equal(winnerFieldMessage(sim), "JACKPOT wins");
  assert.deepEqual(winnerFieldSegments(sim), [
    { text: "JACKPO", color: "#ffd400" },
    { text: "T wins", color: "#ff3b30" },
  ]);
}

{
  const sim = createSimulation({
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["batman", "flash"], ["grower", "sticky"]],
    seed: 145,
  });
  sim.finished = true;
  sim.winner = sim.fighters.find((fighter) => fighter.raceOrbId === "flash");
  sim.winningRaceTeamIndex = 0;
  sim.winningRaceTeamName = sim.raceTeams[0].name;
  assert.equal(winnerFieldMessage(sim), "BATMAN + FLASH wins");
  assert.deepEqual(winnerFieldSegments(sim), [
    { text: "BATMAN + F", color: "#ffd21a" },
    { text: "LASH wins", color: "#ff3c2f" },
  ]);
}

{
  const sim = createSimulation({
    classes: ["fire", "ice"],
    gameplayMode: ORB_RACE_MODE,
    raceTeams: [["batman", "fibonacci", "drill", "grower"], ["orbital", "duplicator"]],
    seed: 146,
  });
  sim.finished = true;
  sim.winner = sim.fighters.find((fighter) => fighter.raceOrbId === "batman");
  sim.winningRaceTeamIndex = 0;
  sim.winningRaceTeamName = ORB_RACE_EVERYONE_LABEL;
  assert.equal(winnerFieldMessage(sim), "EVERYONE wins");
  assert.deepEqual(winnerFieldSegments(sim).slice(0, ORB_RACE_EVERYONE_LABEL.length), [
    ...Array.from(ORB_RACE_EVERYONE_LABEL, (text, index) => ({
      text,
      color: ORB_RACE_RAINBOW_PALETTE[index % ORB_RACE_RAINBOW_PALETTE.length],
    })),
  ]);
}

{
  const sim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    gameplayMode: "world-cup",
    countries: ["france", "brazil"],
    seed: 2806,
  });
  assert.equal(winnerFieldMessage(sim), "");
  sim.finished = true;
  sim.winner = sim.fighters[0];
  assert.equal(winnerFieldMessage(sim), "France wins");
  assert.deepEqual(winnerFieldSegments(sim), [
    { text: "Fran", color: "#2347a6" },
    { text: "ce w", color: "#ffffff" },
    { text: "ins", color: "#ef3340" },
  ]);
}

{
  assert.deepEqual(Object.keys(ORB_CROPS), [], "Classic uses solid-color orbs instead of legacy orb crops");
}

{
  assert.deepEqual(Object.keys(PIXEL_WEAPON_PROFILES), ["sword"], "Sword should be the only Classic orbiting weapon sprite");
  assert.equal(PIXEL_WEAPON_PROFILES.sword.family, "sword");
  assert.equal(PIXEL_WEAPON_PROFILES.duplicator, undefined);
  assert.equal(PIXEL_WEAPON_PROFILES.orbital, undefined);
  assert.equal(PIXEL_WEAPON_PROFILES.unarmed, undefined);
  assert.equal(PIXEL_WEAPON_PROFILES.grower, undefined);
  assert.equal(PIXEL_WEAPON_PROFILES.slammy, undefined);
  assert.equal(PIXEL_EFFECT_PROFILES.impactRegular.src.endsWith("/impact-regular.png"), true);
  assert.equal(PIXEL_EFFECT_PROFILES.impactCritical.src.endsWith("/impact-critical.png"), true);
  assert.equal(PIXEL_EFFECT_PROFILES.impactCollision.src.endsWith("/impact-collision.png"), true);
  assert.equal(impactSpriteKeyForEffect({ kind: "weapon-hit" }), "impactRegular");
  assert.equal(impactSpriteKeyForEffect({ kind: "world-cup-card-hit", impactKind: "critical" }), "impactCritical");
  assert.equal(impactSpriteKeyForEffect({ kind: "collision-hit" }), "impactCollision");
  assert.equal(impactSpriteKeyForEffect({ kind: "world-cup-ball-hit", impactKind: "critical" }), "impactCritical");
  assert.equal(impactSpriteKeyForEffect({ kind: "volta-bolt-hit", impactKind: "regular" }), "impactRegular");
  assert.equal(impactSpriteKeyForEffect({ kind: "knockout" }), "impactCritical");
  assert.equal(impactSpriteKeyForEffect({ kind: "weapon-hit", impactKind: "none" }), null);
  for (const kind of ["impact", "weapon-hit", "weapon-clash", "ranged-hit", "potion-aoe-hit", "collision-hit", "classic-slam", "knockout"]) {
    assert.equal(shouldRenderHitEffect("classic", kind), false, `${kind} should be hidden in Classic Orb Foundry`);
    assert.equal(shouldRenderHitEffect("world-cup", kind), true, `${kind} should remain available outside Classic`);
  }
  assert.equal(shouldRenderHitEffect("classic", "potion-aoe"), true, "non-hit ability effects should remain visible in Classic");
  assert.equal(PIXEL_EFFECT_PROFILES.aegonImpact.src.endsWith("/aegon-collision-impact.png"), true);
  assert.equal(PIXEL_EFFECT_PROFILES.mirageDecoy.src.endsWith("/mirage-decoy-orb.png"), true);
  assert.equal(PIXEL_EFFECT_PROFILES.echoReplay.src.endsWith("/echo-replay-impact.png"), true);
  assert.equal(PIXEL_EFFECT_PROFILES.forgeHeatDrop.src.endsWith("/forge-heat-drop.png"), true);
  assert.equal(PIXEL_EFFECT_PROFILES.staticZap.src.endsWith("/static-chain-zap.png"), true);
  for (const profile of Object.values(PIXEL_WEAPON_PROFILES)) {
    assert.match(profile.silhouette, /^classic-pixel-/);
    assert.match(profile.src, /^\.\/assets\/generated\/classic-weapon-rework\/final\/.+\.png$/);
    assert.ok(profile.anchorX > 0 && profile.anchorX <= 1);
    assert.ok(profile.anchorY >= 0 && profile.anchorY <= 1);
    assert.ok(
      existsSync(new URL(`../${profile.src.slice(2)}`, import.meta.url)),
      `${profile.src} should exist as a generated production PNG`,
    );
  }
  for (const profile of Object.values(PIXEL_EFFECT_PROFILES)) {
    assert.match(
      profile.src,
      /^\.\/assets\/generated\/(?:classic-weapon-rework|orb-foundry-(?:pixel-set|expansion-pixel-set|impact-frames|weapon-orbs))\/final\/.+\.png$/,
    );
    assert.ok(
      existsSync(new URL(`../${profile.src.slice(2)}`, import.meta.url)),
      `${profile.src} should exist as a generated production PNG`,
    );
  }
}

{
  const defaults = createDefaultSettings();
  assert.equal(defaults.mode, "match");
  assert.equal(defaults.count, 2);
  assert.equal(defaults.hazardPreset, "none");
  assert.equal(defaults.arenaModifier, "standard");
  assert.equal(defaults.arenaShape, "square");
  assert.equal(defaults.social.enabled, true);
  assert.equal(defaults.tournament, null);
}

{
  const settings = normalizeSettings({
    classes: ["time", "volta"],
    seed: 2406,
    arenaModifier: "tiny",
    arenaShape: "circle",
    hazardPreset: "speed",
  }, classes);
  assert.equal(settings.arenaModifier, "tiny");
  assert.equal(settings.arenaShape, "circle");
  const restored = decodeSettings(encodeSettings(settings, classes), classes);
  assert.equal(restored.arenaModifier, "tiny", "arena modifier should survive compact URL encoding");
  assert.equal(restored.arenaShape, "circle", "arena shape should survive compact URL encoding");
  assert.equal(normalizeSettings({ arenaModifier: "invalid" }, classes).arenaModifier, "standard");
  assert.equal(normalizeSettings({ arenaShape: "invalid" }, classes).arenaShape, "square");
}

{
  const tiny = createSimulation({ count: 2, classes: ["time", "volta"], seed: 2406, arenaModifier: "tiny", arenaShape: "circle" });
  assert.equal(tiny.arenaModifier, "tiny");
  assert.equal(tiny.arenaShape, "circle");
  assert.deepEqual(tiny.arenaBounds, ARENA_MODIFIERS.tiny.bounds);
  assert.equal(tiny.arenaBounds.width, tiny.arenaBounds.height);
  const center = {
    x: tiny.arenaBounds.x + tiny.arenaBounds.width / 2,
    y: tiny.arenaBounds.y + tiny.arenaBounds.height / 2,
  };
  const radius = tiny.arenaBounds.width / 2;
  for (const fighter of tiny.fighters) {
    assert.ok(Math.hypot(fighter.x - center.x, fighter.y - center.y) <= radius - fighter.radius + 1e-9);
  }
  const hazardSim = createSimulation({
    count: 2,
    classes: ["fire", "ice"],
    seed: 2406,
    arenaModifier: "tiny",
    arenaShape: "circle",
    hazardPreset: "mixed",
  });
  for (const hazard of hazardSim.hazards) {
    if (hazard.radius) {
      assert.ok(Math.hypot(hazard.x - center.x, hazard.y - center.y) <= radius - hazard.radius + 1e-9);
    } else {
      const hazardCenterX = hazard.x + hazard.width / 2;
      const hazardCenterY = hazard.y + hazard.height / 2;
      assert.ok(Math.hypot(hazardCenterX - center.x, hazardCenterY - center.y) <= radius + 1e-9);
    }
  }
  const suddenDeath = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 1, arenaModifier: "suddenDeath" });
  assert.equal(suddenDeath.fighters[0].maxHealth, 58);
  const overdrive = createSimulation({ count: 2, classes: ["fire", "ice"], seed: 1, arenaModifier: "overdrive" });
  assert.ok(overdrive.fighters[0].baselineSpeed > createSimulation({ count: 2, classes: ["fire", "ice"], seed: 1 }).fighters[0].baselineSpeed);
}

{
  const legacyTournament = normalizeSettings({
    mode: "tournament",
    count: 16,
    classes: ["volta", "venom", "aegis"],
    social: { enabled: false, format: "landscape", fps: 60 },
    tournament: { size: 16, roster: ["volta", "venom"], watch: false },
    features: { tournament: true, socialBattle: false },
  }, classes);
  assert.equal(legacyTournament.mode, "match");
  assert.equal(legacyTournament.count, 2);
  assert.equal(legacyTournament.social.enabled, true);
  assert.equal(legacyTournament.social.format, "landscape");
  assert.equal(legacyTournament.tournament, null);
  assert.equal(legacyTournament.features.tournament, false);
  assert.equal(legacyTournament.features.socialBattle, true);

  const legacyMatch = normalizeSettings({
    mode: "match",
    count: 8,
    classes: ["fire", "ice", "wizard"],
    social: { enabled: false },
  }, classes);
  assert.equal(legacyMatch.count, 2);
  assert.equal(legacyMatch.social.enabled, true);
}

{
  assert.deepEqual(
    Object.fromEntries(Object.entries(SOCIAL_FORMATS).map(([key, value]) => [key, [value.width, value.height]])),
    {
      portrait: [1080, 1920],
      square: [1080, 1020],
      landscape: [1920, 1024],
      "race-landscape": [1920, 1080],
    },
  );
  assert.equal(SOCIAL_FORMATS.portrait.width / SOCIAL_FORMATS.portrait.height, 9 / 16);
  assert.equal(SOCIAL_FORMATS["race-landscape"].width / SOCIAL_FORMATS["race-landscape"].height, 16 / 9);
  assert.deepEqual(normalizeSocialOptions({ format: "bad", fps: 24 }), {
    format: "portrait",
    fps: 30,
    highlightMode: true,
    showWinProbability: true,
  });
  assert.equal(normalizeSocialOptions({ format: "longform" }).format, "race-landscape");
}

{
  const layout = orbRaceLongformLayout(1920, 1080);
  assert.equal(layout.width, 1920);
  assert.equal(layout.height, 1080);
  assert.equal(layout.tracks.length, 2);
  assert.equal(layout.tracks[0].y, layout.tracks[1].y);
  assert.ok(layout.tracks[0].y > 0, "long-form boards should have a small outer margin");
  assert.ok(layout.tracks[0].height < 1080, "long-form boards should be shorter than the full canvas");
  assert.equal(layout.tracks[0].height, layout.tracks[1].height);
  assert.ok(layout.tracks[0].x + layout.tracks[0].width < layout.tracks[1].x);
  assert.equal(layout.tracks[0].width, layout.tracks[1].width);
  assert.equal(ORB_RACE_LONGFORM_PRESENTATION.visibleLayerCount, 7);
  assert.equal(ORB_RACE_LONGFORM_PRESENTATION.cameraStepLayers, 3);
  assert.ok(
    ORB_RACE_LONGFORM_PRESENTATION.worldLayerGapFraction > ORB_RACE_LONGFORM_PRESENTATION.worldLayerHeightFraction * 0.5,
    "long-form layer cards should have clear white space between them",
  );
  assert.equal(
    ORB_RACE_LONGFORM_PRESENTATION.worldLayerGapFraction,
    ORB_RACE_LONGFORM_PRESENTATION.worldLayerHeightFraction,
    "long-form card spacing should match the card short side",
  );
  assert.ok(ORB_RACE_LONGFORM_PRESENTATION.cameraEase < 0.1, "leader camera should pan gently");
  assert.equal(snowballLayerHeightFor([{ raceOrbId: "speed" }], 100), 100, "non-Snowball walls should keep their height");
  assert.equal(snowballLayerHeightFor([{ raceOrbId: "snowball", raceSnowballSize: 2 }], 100), 50, "Snowball growth should shorten rendered walls");

  const rendererProbe = Object.create(SocialBattleRenderer.prototype);
  const worldMetrics = rendererProbe.longformWorldMetrics(layout.tracks[0], layout, 8);
  assert.equal(worldMetrics.simLayerHeight, RACE_LAYER_HEIGHT, "long-form must project the canonical portrait lane spacing");
  assert.equal(
    rendererProbe.longformWorldLayerTopForIndex(0, worldMetrics),
    worldMetrics.chamberHeight,
    "the first long-form layer must start on the mapped simulation number line",
  );
  assert.equal(
    rendererProbe.longformWorldLayerTopForIndex(1, worldMetrics),
    worldMetrics.chamberHeight + worldMetrics.worldLayerStep,
    "later long-form layers must advance by one world step from their simulation line",
  );
  assert.ok(
    Math.abs(
      rendererProbe.longformWorldYForSimY({ raceLayerIndex: 0 }, raceLayerLineY(0), worldMetrics)
      - rendererProbe.longformWorldLayerTopForIndex(0, worldMetrics),
    ) < 1e-9,
    "long-form physics line and first visible layer top must share the same world coordinate",
  );
  const midRaceRacer = { raceLayerIndex: 2 };
  const chamberArc = rendererProbe.longformWorldYForSimY(midRaceRacer, 0.1, worldMetrics);
  const previousWall = rendererProbe.longformWorldYForSimY(midRaceRacer, 0.25, worldMetrics);
  const currentWall = rendererProbe.longformWorldYForSimY(midRaceRacer, 0.3925, worldMetrics);
  assert.ok(chamberArc < previousWall, "an orb's upward arc should continue through the chamber");
  assert.ok(currentWall > previousWall, "an orb should visibly fall from one wall toward the next");
}

{
  const labels = [];
  const context = {
    save() {},
    restore() {},
    fillRect() {},
    strokeText() {},
    fillText(text) { labels.push(text); },
    measureText(text) { return { width: String(text).length * 42 }; },
    set textAlign(_value) {},
    set textBaseline(_value) {},
    set font(_value) {},
    set fillStyle(_value) {},
    set strokeStyle(_value) {},
    set lineWidth(_value) {},
  };
  SocialBattleRenderer.prototype.drawRaceLongformTargetPrompt(
    context,
    1_000_000_000_000_000_000,
    1920,
    1080,
  );
  assert.deepEqual(labels, [
    "WHO WILL BREAK",
    "1,000,000,000,000,000,000 LAYER",
    "FIRST?",
  ]);
}

{
  const rendererProbe = Object.create(SocialBattleRenderer.prototype);
  const layout = orbRaceLongformLayout(1920, 1080);
  const metrics = rendererProbe.longformWorldMetrics(layout.tracks[0], layout, 50);
  const leader = {
    raceLayerIndex: 12,
    raceLayerHealth: Array.from({ length: 50 }, () => 1),
    members: [{ raceY: 2.4 }],
  };
  const lagging = {
    raceLayerIndex: 4,
    raceLayerHealth: Array.from({ length: 50 }, () => 1),
    members: [{ raceY: 999, raceBounceEffects: [{ y: 999 }] }],
  };
  const targetBeforeBounce = rendererProbe.longformCameraTargetForTeam(leader, metrics);
  leader.members[0].raceY = 1.9;
  leader.members[0].raceBounceEffects = [{ y: 1.9 }];
  const targetDuringBounce = rendererProbe.longformCameraTargetForTeam(leader, metrics);
  assert.equal(
    targetDuringBounce,
    targetBeforeBounce,
    "camera target must not change during an intra-layer rebound arc",
  );
  assert.equal(rendererProbe.longformLeaderIndex([leader, lagging]), 0, "the maximum discrete layer progress should select the leader");
  lagging.members[0].raceY = 10000;
  assert.equal(
    rendererProbe.longformLeaderIndex([leader, lagging]),
    0,
    "a lagging team's raceY, impacts, and offscreen motion must not influence the shared camera",
  );
  assert.equal(
    rendererProbe.longformLeaderIndex([leader, lagging], 1),
    1,
    "once a winner exists the shared camera should follow winningRaceTeamIndex",
  );
  const splitLeader = {
    raceLayerIndex: 0,
    raceLayerHealth: Array.from({ length: 50 }, () => 1),
    members: [{ raceLayerIndex: 2, raceLayerIndexOverride: 2 }],
  };
  assert.equal(
    rendererProbe.longformTeamProgress(splitLeader),
    2,
    "long-form camera progress should follow a Scissor member that advanced through an open half",
  );
  const splitFollower = {
    raceLayerIndex: 1,
    raceLayerHealth: Array.from({ length: 50 }, () => 1),
    members: [{ raceLayerIndex: 1 }],
  };
  assert.equal(
    rendererProbe.longformLeaderIndex([splitLeader, splitFollower]),
    0,
    "a team with an advanced Scissor member should remain the camera leader",
  );
}

{
  const a = createSimulation({ count: 2, classes: ["wizard", "gravis"], seed: 7719 });
  const b = createSimulation({ count: 2, classes: ["wizard", "gravis"], seed: 7719 });
  run(a, 360);
  run(b, 360);
  assert.ok(a.finished && b.finished);
  assert.equal(a.winner.type, b.winner.type);
  assert.equal(a.time, b.time);
  assert.deepEqual(
    a.fighters.map((fighter) => [fighter.health, fighter.damageDone, fighter.x, fighter.y]),
    b.fighters.map((fighter) => [fighter.health, fighter.damageDone, fighter.x, fighter.y]),
    "social matches must preserve seeded deterministic results",
  );
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "wizard"], seed: 88 });
  const [cinder, hex] = sim.fighters;
  const passive = buildAbilityHud(cinder, sim.time);
  assert.equal(passive.passive, true);
  assert.equal(passive.label, "PASSIVE");
  const resource = buildAbilityHud(hex, sim.time);
  assert.equal(resource.label, "15 MP");
  assert.equal(resource.progress, 0.15);
  hex.burnUntil = 4;
  hex.poisonUntil = 3;
  hex.poisonStacks = 2;
  assert.deepEqual(statusIndicators(hex, 1).map((status) => status.key), ["burn", "poison"]);
}

{
  const sim = createSimulation({ count: 2, classes: ["wizard", "fire"], seed: 319 });
  const hex = sim.fighters[0];
  hex.damageDone = 42;
  hex.weaponHitsDone = 3;
  hex.analytics.arcaneBurstDamage = 20;
  assert.deepEqual(buildBattleStats(hex), [
    { label: "DAMAGE", value: 42 },
    { label: "HITS", value: 3 },
    { label: "DAMAGE TAKEN", value: 0 },
    { label: "BURST DMG", value: 20 },
  ]);
}

{
  const sim = createSimulation({ count: 2, classes: ["shade", "fire"], seed: 404 });
  const shade = sim.fighters[0];
  shade.weaponHitsDone = 2;
  shade.analytics.collisionHits = 2;
  shade.analytics.shadePhases = 2;
  assert.deepEqual(buildBattleStats(shade), [
    { label: "DAMAGE", value: 0 },
    { label: "HITS", value: 2 },
    { label: "DASH HITS", value: 2 },
    { label: "PHASES", value: 2 },
  ]);
  const hud = buildAbilityHud(shade, 0);
  assert.equal(hud.name, "SHADOW DASH");
  assert.equal(hud.detail, "DASH RAM · PHASE TRAIL");
  assert.equal(hud.label, "COLLIDE");
  assert.equal(hud.progress, 1);
}

{
  const fighters = createSimulation({ count: 2, classes: ["volta", "fire"], seed: 4 }).fighters;
  const ricochet = detectHighlight(
    { type: "volta-bolt-hit", fighterId: fighters[0].id, targetId: fighters[1].id, bounced: true },
    fighters,
  );
  assert.equal(ricochet.kind, "ricochet");
  assert.ok(ricochet.strength > 0.8);
  assert.equal(detectHighlight({ type: "knockout", targetId: fighters[1].id }, fighters).kind, "final-blow");
  assert.equal(socialEventAnnouncement({ type: "forge-overtime" }, fighters), "OVERTIME");
  assert.equal(detectHighlight({ type: "forge-overtime" }, fighters).kind, "overtime");
  const cardImpact = detectHighlight({ type: "world-cup-card-hit", pickupType: "yellow-card" }, fighters);
  assert.equal(cardImpact.kind, "world-cup-card-hit");
  assert.ok(cardImpact.strength >= 0.75, "card hits should trigger slow-motion highlight playback");
}

{
  assert.ok(ANNOUNCER_PLAYBACK_GAIN > 1 && ANNOUNCER_PLAYBACK_GAIN <= 1.25);
  assert.equal(VERSUS_ANNOUNCER_PLAYBACK_GAIN, 3.4);
  assert.deepEqual(ANNOUNCER_DUCK_GAINS, { effects: 0.18, ambience: 0.1, music: 0.2 });
  assert.equal(ANNOUNCER_DUCK_RELEASE_SECONDS, 0.18);
  assert.equal(announcerPlaybackGainForCue("versus"), VERSUS_ANNOUNCER_PLAYBACK_GAIN);
  assert.equal(announcerPlaybackGainForCue("fight"), ANNOUNCER_PLAYBACK_GAIN);
  assert.deepEqual(ANNOUNCER_TYPES, classes);
  assert.equal(ANNOUNCER_NAMES.sword, "Sword");
  assert.equal(ANNOUNCER_NAMES.vampire, "Vampire");
  assert.equal(ANNOUNCER_NAMES.trapper, "Cowboy");
  assert.equal(ANNOUNCER_NAMES.duplicator, "Duplicator");
  assert.equal(Object.keys(INTRO_ANNOUNCER_ASSETS).length, classes.length, "every Classic orb should have a generated or verified announcer cue");
  assert.equal(INTRO_ANNOUNCER_ASSETS["intro-sword"], "generated-race/race-sword.mp3");
  assert.equal(INTRO_ANNOUNCER_ASSETS["intro-duplicator"], "generated-race/race-duplicator.mp3");
  assert.equal(INTRO_ANNOUNCER_ASSETS["intro-trapper"], "generated-classic-overhaul/classic-cowboy.mp3");
  assert.equal(INTRO_ANNOUNCER_ASSETS["intro-trident"], "generated-classic-overhaul/classic-trident.mp3");
  assert.deepEqual(announcerIntroSequence("sword", "trapper"), [
    "intro-sword",
    "race-versus",
    "intro-trapper",
    "race-pick-your-winner",
  ]);
  assert.equal(ANNOUNCER_ASSETS.versus, "wise/versus.wav");
  assert.equal(ANNOUNCER_ASSETS["pick-your-winner"], "wise/pick-your-winner.wav");
  assert.equal(ANNOUNCER_ASSETS.ko, undefined);
  assert.equal(ANNOUNCER_ASSETS["fire-wins"], undefined);
  assert.equal(ANNOUNCER_ASSETS["legacy-ice"], "frost.wav");
  assert.equal(ANNOUNCER_ASSETS["legacy-ko"], undefined);
  assert.equal(ANNOUNCER_ASSETS["legacy-volta"], "volta.wav");
  assert.equal(ANNOUNCER_ASSETS["legacy-venom"], "venom.wav");
  assert.equal(ANNOUNCER_ASSETS["legacy-gravis"], "gravis.wav");
  assert.equal(ANNOUNCER_ASSETS["legacy-aegis"], "aegis.wav");
  assert.equal(announcerIntroSequence("fire", "fire"), null);
  const announcerManifest = JSON.parse(readFileSync(new URL("../assets/audio/announcer/wise/manifest.json", import.meta.url), "utf8"));
  assert.equal(announcerManifest.lines["versus.wav"], "Versus.");
  assert.equal(announcerManifest.lines["pick-your-winner.wav"], "Pick your winner.");
  assert.deepEqual(announcerManifest.worldCupSourceOrder, {
    "17_21_58": "France",
    "17_22_07": "Brazil",
    "17_22_25": "USA",
    "17_22_32": "Japan",
    "17_22_48": "Congo",
    "17_22_59": "England",
    "17_23_08": "Sweden",
    "17_23_14": "Bosnia",
    "2026-06-26T22_26_46": "Pick your winner",
    "2026-06-29T17_57_58": "Paraguay",
    "2026-06-29T17_57_46": "Germany",
    "2026-06-30T17_53_28": "Portugal",
    "2026-06-30T17_53_14": "Croatia",
    "2026-06-30T18_02_32": "Ivory Coast",
    "2026-06-30T18_02_24": "Norway",
    "2026-07-01T17_41_16": "Senegal",
    "2026-07-01T17_41_07": "Belgium",
    "2026-07-02T03_41_31": "Austria",
    "2026-07-02T03_41_24": "Spain",
    "2026-07-02T03_45_16": "Algeria",
    "2026-07-02T03_45_07": "Switzerland",
    "2026-07-03T18_01_36": "Cabo Verde",
    "2026-07-03T18_01_26": "Argentina",
    "2026-07-03T18_02_52": "Egypt",
    "2026-07-03T18_02_37": "Australia",
    "2026-07-03T18_11_29": "Ghana",
    "2026-07-03T18_11_34": "Colombia",
    "2026-07-04T16_37_27": "Canada",
    "2026-07-04T16_41_06": "Morocco",
    "2026-07-05T15_54_23": "Mexico",
  });
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-usa.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260628/usa.mp3", import.meta.url)),
    "the active USA cue should exactly match the supplied 17_22_25 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-japan.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260628/japan.mp3", import.meta.url)),
    "the active Japan cue should exactly match the supplied 17_22_32 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-congo-dr.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260628/congo-dr.mp3", import.meta.url)),
    "the active Congo cue should exactly match the supplied 17_22_48 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-england.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260628/england.mp3", import.meta.url)),
    "the active England cue should exactly match the supplied 17_22_59 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-sweden.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260628/sweden.mp3", import.meta.url)),
    "the active Sweden cue should exactly match the supplied 17_23_08 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-bosnia.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260628/bosnia.mp3", import.meta.url)),
    "the active Bosnia cue should exactly match the supplied 17_23_14 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-paraguay.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260629/paraguay.mp3", import.meta.url)),
    "the active Paraguay cue should exactly match the supplied 17_57_58 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-germany.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260629/germany.mp3", import.meta.url)),
    "the active Germany cue should exactly match the supplied 17_57_46 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-portugal.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260630/portugal.mp3", import.meta.url)),
    "the active Portugal cue should exactly match the supplied 17_53_28 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-croatia.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260630/croatia.mp3", import.meta.url)),
    "the active Croatia cue should exactly match the supplied 17_53_14 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-ivory-coast.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260630/ivory-coast.mp3", import.meta.url)),
    "the active Ivory Coast cue should exactly match the supplied 18_02_32 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-norway.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260630/norway.mp3", import.meta.url)),
    "the active Norway cue should exactly match the supplied 18_02_24 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-belgium.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260701/belgium.mp3", import.meta.url)),
    "the active Belgium cue should exactly match the supplied 17_41_07 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-senegal.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260701/senegal.mp3", import.meta.url)),
    "the active Senegal cue should exactly match the supplied 17_41_16 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-austria.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260702/austria.mp3", import.meta.url)),
    "the active Austria cue should exactly match the supplied 03_41_31 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-spain.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260702/spain.mp3", import.meta.url)),
    "the active Spain cue should exactly match the supplied 03_41_24 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-algeria.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260702b/algeria.mp3", import.meta.url)),
    "the active Algeria cue should exactly match the supplied 03_45_16 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-switzerland.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260702b/switzerland.mp3", import.meta.url)),
    "the active Switzerland cue should exactly match the supplied 03_45_07 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-cabo-verde.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260703/cabo-verde.mp3", import.meta.url)),
    "the active Cabo Verde cue should exactly match the supplied 18_01_36 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-argentina.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260703/argentina.mp3", import.meta.url)),
    "the active Argentina cue should exactly match the supplied 18_01_26 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-egypt.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260703/egypt.mp3", import.meta.url)),
    "the active Egypt cue should exactly match the supplied 18_02_52 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-australia.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260703/australia.mp3", import.meta.url)),
    "the active Australia cue should exactly match the supplied 18_02_37 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-ghana.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260703/ghana.mp3", import.meta.url)),
    "the active Ghana cue should exactly match the supplied 18_11_29 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-colombia.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260703/colombia.mp3", import.meta.url)),
    "the active Colombia cue should exactly match the supplied 18_11_34 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-canada.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260704/canada.mp3", import.meta.url)),
    "the active Canada cue should exactly match the supplied 16_37_27 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-morocco.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260704/morocco.mp3", import.meta.url)),
    "the active Morocco cue should exactly match the supplied 16_41_06 clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/world-cup-mexico.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/world-cup-announcer-20260705/mexico.mp3", import.meta.url)),
    "the active Mexico cue should exactly match the supplied 15_54_23 clip",
  );
  for (const type of Object.keys(ANNOUNCER_NAMES)) {
    const asset = INTRO_ANNOUNCER_ASSETS[`intro-${type}`];
    if (asset) assert.ok(existsSync(new URL(`../assets/audio/announcer/${asset}`, import.meta.url)));
  }
  assert.deepEqual(announcerIntroSequence("sword", "vampire"), [
    "intro-sword",
    "race-versus",
    "intro-vampire",
    "race-pick-your-winner",
  ]);
  assert.deepEqual(RACE_ANNOUNCER_NAMES, {
    duplicator: "Duplicator",
    speed: "Speedster",
    orbital: "Orbital",
    drill: "Drill",
    fibonacci: "Fibonacci",
    "x-squared": "X Squared",
    flash: "Flash",
    batman: "Batman",
    lazer: "Lazer",
    phi: "Golden Ratio",
    sticky: "Sticky",
    grower: "Grower",
    unarmed: "Unarmed",
    slammy: "Slammy",
    "super-slammy": "Super Slammy",
    piercer: "Piercer",
    "ying-yang": "Ying Yang",
    poison: "Poison",
    "hydrogen-bomb": "Hydrogen Bomb",
    "antimatter-bomb": "Antimatter Bomb",
    "time-bomb": "Time Bomb",
    "reality-bomb": "Reality Bomb",
    "tsar-bomb": "Tsar Bomb",
    "all-in-one": "All In One",
    breaker: "Breaker",
    "square-root": "Square Root",
    progressive: "Progressive",
    random: "Random",
    twins: "Twins",
    scissor: "Scissor",
    lag: "Lag",
    whirlwind: "Whirlwind",
    rgb: "R G B",
    "x-power": "X to the X",
    "super-x-power": "Super X to the X",
    lucas: "Lucas Sequence",
    professor: "Professor",
    trifecta: "Trifecta",
    gravitator: "Gravitator",
    gravity: "Gravity",
    jackpot: "Jackpot",
    boomerang: "Boomerang",
    mines: "Splodey",
    magnet: "Magnet",
    factorial: "Factorial",
    prime: "Prime",
    integral: "Integral",
    quadratic: "Quadratic",
    pi: "Pi",
    ricochet: "Ricochet Cannon",
    sawblade: "Sawblade",
    meteor: "Meteor",
    "black-hole": "Black Hole",
    godzilla: "Godzilla",
    "speed-impact": "Slow",
    centy: "Centy",
    infinity: "Infinity",
    charger: "Charger",
    bouncer: "Bouncer",
    "blue-sun": "Blue Sun",
    "purple-sun": "The Fucking Purple Sun",
    "phase-three-sun": "The Sun",
    "phase-two-sun": "Phase Two Sun",
    snake: "Snake",
    vampire: "Vampire",
    cubed: "Cubed",
    double: "Double",
    tripler: "Tripler",
    turret: "Turret",
    leech: "Leech",
    crusher: "Crusher",
    berserker: "Berserker",
    reactor: "Reactor",
    parasite: "Parasite",
    draftmaster: "Draftmaster",
    needle: "Needle",
    multiplier: "Multiplier",
    sniper: "Sniper",
    snowball: "Snowball",
    countdown: "Countdown",
    copycat: "Copycat",
    critical: "Critical",
    commander: "Commander",
    shrapnel: "Shrapnel",
    roulette: "Absorber",
    architect: "Architect",
    "100x": "100X",
    grappler: "Grappler",
    artists: "Artist",
    pancake: "Pancake",
    tree: "Tree",
    sylvester: "Sylvester",
    tetration: "Tetration",
    rain: "Rain",
    hacker: "Hacker",
    miner: "Miner",
  });
  assert.equal(ORB_RACERS["super-x-power"].name, "SUPER X^X");
  assert.equal(ORB_RACERS["super-x-power"].color, "#15151b");
  assert.ok(existsSync(new URL("../assets/audio/announcer/generated-race/race-super-x-power.mp3", import.meta.url)));
  assert.ok(readFileSync(new URL("../assets/audio/announcer/generated-race/race-super-x-power.mp3", import.meta.url)).length > 500);
  assert.equal(RACE_GENERATED_ANNOUNCER_ASSETS["race-boss"], "generated-race/race-boss.mp3");
  assert.notEqual(RACE_GENERATED_ANNOUNCER_ASSETS["race-boss"], RACE_GENERATED_ANNOUNCER_ASSETS["race-buffed"]);
  assert.ok(existsSync(new URL("../assets/audio/announcer/generated-race/race-boss.mp3", import.meta.url)));
  assert.ok(readFileSync(new URL("../assets/audio/announcer/generated-race/race-boss.mp3", import.meta.url)).length > 500);
  assert.equal(
    RACE_GENERATED_ANNOUNCER_ASSETS["intro-race-tsar-bomb"],
    "generated-race/race-tsar-bomb.mp3",
    "Tsar Bomb should use its own Alex announcement cue",
  );
  assert.equal(
    RACE_GENERATED_ANNOUNCER_ASSETS["intro-race-all-in-one"],
    "generated-race/race-all-in-one.mp3",
    "All In One should use its own Alex announcement cue",
  );
  for (const racerId of ["tsar-bomb", "all-in-one"]) {
    const relativePath = RACE_GENERATED_ANNOUNCER_ASSETS[`intro-race-${racerId}`];
    const absolutePath = new URL(`../assets/audio/announcer/${relativePath}`, import.meta.url);
    const sourcePath = new URL(`../assets/audio/source/race-announcer-generated/${relativePath.slice("generated-race/".length)}`, import.meta.url);
    assert.ok(existsSync(absolutePath), `${racerId} should ship an Alex Orb Race announcement clip`);
    assert.ok(readFileSync(absolutePath).byteLength > 4_096, `${racerId}'s announcement should contain decoded audio frames`);
    assert.ok(existsSync(sourcePath), `${racerId} should preserve its generated announcement source`);
  }
  for (const racerId of ["antimatter-bomb", "time-bomb", "reality-bomb"]) {
    const relativePath = RACE_GENERATED_ANNOUNCER_ASSETS[`intro-race-${racerId}`];
    const absolutePath = new URL(`../assets/audio/announcer/${relativePath}`, import.meta.url);
    assert.ok(existsSync(absolutePath), `${racerId} should ship an Alex Orb Race announcement clip`);
    assert.ok(readFileSync(absolutePath).byteLength > 4_096, `${racerId}'s announcement should contain decoded audio frames`);
  }
  for (const racerId of ["twins", "scissor"]) {
    const relativePath = RACE_GENERATED_ANNOUNCER_ASSETS[`intro-race-${racerId}`];
    const absolutePath = new URL(`../assets/audio/announcer/${relativePath}`, import.meta.url);
    assert.ok(existsSync(absolutePath), `${racerId} should ship an Alex Orb Race announcement clip`);
    assert.ok(readFileSync(absolutePath).byteLength > 4_096, `${racerId}'s announcement should contain decoded audio frames`);
  }
  const realityBombAsset = readFileSync(new URL("../assets/generated/orb-race-reality-bomb-20260812/final/reality-bomb.png", import.meta.url));
  assert.ok(realityBombAsset.byteLength > 10_000, "Reality Bomb should ship a real generated crystal asset");
  const realityBombManifest = JSON.parse(readFileSync(new URL("../assets/generated/orb-race-reality-bomb-20260812/manifest.json", import.meta.url), "utf8"));
  const realityBombAlpha = JSON.parse(readFileSync(new URL("../assets/generated/orb-race-reality-bomb-20260812/alpha-validation.json", import.meta.url), "utf8"));
  assert.equal(realityBombManifest.final, "final/reality-bomb.png");
  assert.deepEqual(
    Object.values(realityBombAlpha.corners || {}),
    [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    "Reality Bomb's generated final should have transparent corners",
  );
  const socialRendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
  const lagAsset = new URL("../assets/generated/orb-race-lag-20260813-hacker-v2/final/lag-orb.png", import.meta.url);
  const lagSource = new URL("../assets/generated/orb-race-lag-20260813-hacker-v2/source/lag-orb.png", import.meta.url);
  const lagManifest = JSON.parse(readFileSync(new URL("../assets/generated/orb-race-lag-20260813-hacker-v2/manifest.json", import.meta.url), "utf8"));
  const lagAlpha = readFileSync(new URL("../assets/generated/orb-race-lag-20260813-hacker-v2/alpha-validation.txt", import.meta.url), "utf8");
  assert.ok(existsSync(lagAsset) && readFileSync(lagAsset).byteLength > 100_000, "Lag should ship the generated hacker orb asset");
  assert.ok(existsSync(lagSource) && readFileSync(lagSource).byteLength > 100_000, "Lag should preserve its flat-chroma GPT source");
  assert.equal(lagManifest.runtimeId, "lag");
  assert.match(lagAlpha, /format=RGBA/);
  assert.match(lagAlpha, /corner_alpha=\(0,0,0,0\)/);
  assert.match(socialRendererSource, /orb-race-lag-20260813-hacker-v2\/final\/lag-orb\.png/);
  assert.match(socialRendererSource, /#39ff14/);
  assert.match(socialRendererSource, /const spriteSize = radius \* 2\.36/);
  assert.match(socialRendererSource, /const copiedOrbName = copiedOrbId/);
  assert.match(socialRendererSource, /case "rgb": return `COLOR: .*SPEED:/, "RGB HUD should expose its current speed alongside the color");
  assert.match(socialRendererSource, /raceWhirlwindOrbPosition/);
  for (const racerId of ["lag", "whirlwind", "rgb"]) {
    const relativePath = RACE_GENERATED_ANNOUNCER_ASSETS[`intro-race-${racerId}`];
    const absolutePath = new URL(`../assets/audio/announcer/${relativePath}`, import.meta.url);
    const sourcePath = new URL(`../assets/audio/source/race-announcer-generated/${relativePath.slice("generated-race/".length)}`, import.meta.url);
    assert.ok(existsSync(absolutePath), `${racerId} should ship a live Alex announcement clip`);
    assert.ok(readFileSync(absolutePath).byteLength > 4_096, `${racerId} announcement should contain audio frames`);
    assert.ok(existsSync(sourcePath), `${racerId} should preserve its generated source clip`);
  }
  const cageAsset = new URL("../assets/generated/orb-race-cage-20260812/final/cage.png", import.meta.url);
  const cageSource = readFileSync(cageAsset);
  assert.ok(cageSource.length > 10_000, "the generated cage final should be a real image, not a placeholder");
  const cageManifest = JSON.parse(readFileSync(new URL("../assets/generated/orb-race-cage-20260812/manifest.json", import.meta.url), "utf8"));
  const cageAlpha = JSON.parse(readFileSync(new URL("../assets/generated/orb-race-cage-20260812/alpha-validation.json", import.meta.url), "utf8"));
  assert.equal(cageManifest.final, "final/cage.png");
  assert.equal(cageAlpha.transparentCorners, true);
  assert.equal(cageAlpha.transparentCenter, true);
  assert.match(socialRendererSource, /drawRaceCage\(ctx, racer, x, y, radius, rect\)/);
  assert.match(socialRendererSource, /raceCageActive/);
  assert.match(socialRendererSource, /raceRealitySpawns/);
  assert.match(socialRendererSource, /drawRaceBombEffects/);
  assert.match(socialRendererSource, /drawRaceTimeBombPulses/);
  assert.match(socialRendererSource, /raceTimeBombPulseActive/);
  assert.match(socialRendererSource, /screen-wide time-stop wave/);
  assert.match(socialRendererSource, /"MIDNIGHT " \+ raceTimeBombCountdownLineFor/);
  assert.match(socialRendererSource, /const spriteScale = 1\.28/);
  assert.match(socialRendererSource, /const bodyRadius = radius \* 1\.12 \* bodyScale/);
  assert.match(socialRendererSource, /const minuteAngle = -Math\.PI \/ 2/);
  assert.match(socialRendererSource, /drawHand\(hourAngle/);
  assert.match(socialRendererSource, /drawHand\(minuteAngle/);
  for (const racerId of ["turret", "leech", "crusher", "berserker", "reactor", "parasite", "draftmaster"]) {
    const relativePath = RACE_GENERATED_ANNOUNCER_ASSETS[`intro-race-${racerId}`];
    const absolutePath = new URL(`../assets/audio/announcer/${relativePath}`, import.meta.url);
    assert.ok(existsSync(absolutePath), `${racerId} should ship an Orb Race announcement clip`);
    assert.ok(readFileSync(absolutePath).byteLength > 10_000, `${racerId}'s announcement clip should contain decoded audio frames`);
  }
  for (const racerId of ["needle", "multiplier", "sniper", "snowball", "countdown", "copycat", "critical"]) {
    const relativePath = RACE_GENERATED_ANNOUNCER_ASSETS[`intro-race-${racerId}`];
    const absolutePath = new URL(`../assets/audio/announcer/${relativePath}`, import.meta.url);
    assert.ok(existsSync(absolutePath), `${racerId} should ship an Orb Race announcement clip`);
    assert.ok(readFileSync(absolutePath).byteLength > 4_096, `${racerId}'s announcement clip should contain decoded audio frames`);
  }
  for (const racerId of ["commander", "shrapnel", "roulette", "architect"]) {
    const relativePath = RACE_GENERATED_ANNOUNCER_ASSETS[`intro-race-${racerId}`];
    const absolutePath = new URL(`../assets/audio/announcer/${relativePath}`, import.meta.url);
    assert.ok(existsSync(absolutePath), `${racerId} should ship an Orb Race announcement clip`);
    assert.ok(readFileSync(absolutePath).byteLength > 4_096, `${racerId}'s announcement clip should contain decoded audio frames`);
  }
  for (const racerId of ["100x", "grappler", "artists", "pancake", "tree"]) {
    const relativePath = RACE_GENERATED_ANNOUNCER_ASSETS[`intro-race-${racerId}`];
    const absolutePath = new URL(`../assets/audio/announcer/${relativePath}`, import.meta.url);
    assert.ok(existsSync(absolutePath), `${racerId} should ship an Orb Race announcement clip`);
    assert.ok(readFileSync(absolutePath).byteLength > 4_096, `${racerId}'s announcement clip should contain decoded audio frames`);
  }
  const newOrbAssetRoot = new URL("../assets/generated/orb-race-new-orbs-20260814-v1/", import.meta.url);
  const newOrbManifest = JSON.parse(readFileSync(new URL("manifest.json", newOrbAssetRoot), "utf8"));
  const newOrbAlpha = JSON.parse(readFileSync(new URL("alpha-validation.json", newOrbAssetRoot), "utf8"));
  assert.equal(newOrbManifest.version, "orb-race-new-orbs-20260814-v1");
  assert.deepEqual(
    newOrbManifest.assets.map((asset) => [asset.id, asset.frameCount]),
    [["rain-cloud-sheet", 4], ["hacker-computer-sheet", 4], ["miner-jackhammer-sheet", 6]],
    "new Orb Race GPT-image packs should preserve their frame contracts",
  );
  for (const asset of newOrbManifest.assets) {
    const finalPath = new URL(asset.final, newOrbAssetRoot);
    const sourcePath = new URL(asset.source, newOrbAssetRoot);
    assert.ok(existsSync(finalPath) && readFileSync(finalPath).byteLength > 100_000, `${asset.id} final should be a real RGBA asset`);
    assert.ok(existsSync(sourcePath) && readFileSync(sourcePath).byteLength > 100_000, `${asset.id} source should be preserved`);
    const alpha = newOrbAlpha.assets[asset.final];
    assert.deepEqual(alpha.cornerRGBA, [0, 0, 0, 0], `${asset.id} final should have transparent corners`);
    assert.equal(alpha.alphaMax, 255, `${asset.id} final should retain opaque sprite pixels`);
    if (asset.runtime !== false) {
      const escapedPath = asset.final.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(socialRendererSource, new RegExp(escapedPath));
    } else {
      assert.doesNotMatch(socialRendererSource, new RegExp(asset.final.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }
  for (const racerId of ["sylvester", "lucas", "tetration", "professor", "phase-three-sun", "phase-two-sun", "trifecta", "gravitator", "rain", "hacker", "miner", "super-slammy", "piercer"]) {
    const relativePath = RACE_GENERATED_ANNOUNCER_ASSETS[`intro-race-${racerId}`];
    const absolutePath = new URL(`../assets/audio/announcer/${relativePath}`, import.meta.url);
    const sourcePath = new URL(`../assets/audio/source/race-announcer-generated/${relativePath.slice("generated-race/".length)}`, import.meta.url);
    assert.ok(existsSync(absolutePath), `${racerId} should ship an Alex announcement clip`);
    assert.ok(readFileSync(absolutePath).byteLength > 4_096, `${racerId} announcement should contain decoded audio frames`);
    assert.ok(existsSync(sourcePath), `${racerId} should preserve its generated announcement source`);
  }
  const hackerOrbAssetRoot = new URL("../assets/generated/orb-race-new-orbs-20260814-v2/", import.meta.url);
  const hackerOrbManifest = JSON.parse(readFileSync(new URL("manifest.json", hackerOrbAssetRoot), "utf8"));
  const hackerOrbAlpha = JSON.parse(readFileSync(new URL("alpha-validation.json", hackerOrbAssetRoot), "utf8"));
  assert.equal(hackerOrbManifest.version, "orb-race-new-orbs-20260814-v2");
  assert.deepEqual(
    hackerOrbManifest.assets.map((asset) => [asset.id, asset.frameCount, asset.frameWidth, asset.frameHeight]),
    [["hacker-orb-animation-sheet", 4, 627, 627]],
    "Hacker's hoodie orb must expose four square animation frames",
  );
  const hackerOrbAsset = new URL(hackerOrbManifest.assets[0].final, hackerOrbAssetRoot);
  const hackerOrbSource = new URL(hackerOrbManifest.assets[0].source, hackerOrbAssetRoot);
  assert.ok(existsSync(hackerOrbAsset) && readFileSync(hackerOrbAsset).byteLength > 100_000, "Hacker's generated orb final should be a real asset");
  assert.ok(existsSync(hackerOrbSource) && readFileSync(hackerOrbSource).byteLength > 100_000, "Hacker's generated grid source should be preserved");
  assert.deepEqual(hackerOrbAlpha.cornerAlpha, { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 });
  assert.equal(hackerOrbAlpha.alphaExtrema[1], 255);
  assert.match(socialRendererSource, /hacker-orb-animation-sheet\.png\?v=20260825-tsar-all-in-one1/);
  assert.match(socialRendererSource, /drawRacePhaseThreeSunLasers/);
  assert.match(socialRendererSource, /raceRgbRouletteVisualColorIndex/, "RGB should expose its roulette color during the transition");
  assert.match(socialRendererSource, /const professorVisualId = racer\.raceOrbId === "professor"/);
  assert.match(socialRendererSource, /case "lucas": return `Lₙ:/);
  assert.match(socialRendererSource, /case "super-slammy": return `DAMAGE:/);
  assert.match(socialRendererSource, /case "piercer": return `DAMAGE: .*SWEEP/);
  assert.match(socialRendererSource, /raceTsarBombCountdownElapsed/);
  assert.match(socialRendererSource, /raceAllInOneActive/);
  assert.match(socialRendererSource, /case "tsar-bomb":/);
  assert.match(socialRendererSource, /case "all-in-one":/);
  assert.match(socialRendererSource, /raceLayerLineYForRenderer/);
  assert.match(socialRendererSource, /raceGravitatorLayerPullOffsets/);
  assert.match(socialRendererSource, /case "professor":\s*\{[\s\S]*?return `FORM:/);
  assert.match(socialRendererSource, /const frame = hacking \? 3 : 0/);
  assert.match(socialRendererSource, /hacking && facing < 0/);
  assert.match(socialRendererSource, /radius \* 5\.1/);
  assert.match(socialRendererSource, /raceHackerSpawnedOrbs/);
  assert.match(socialRendererSource, /const slammyChildren = racer\.raceRealitySpawns/);
  assert.match(socialRendererSource, /this\.drawRaceHackerChildOrb\(ctx, spawn, radius, rect, time\)/);
  assert.match(socialRendererSource, /drawRaceHackerChildEffects/);
  assert.match(socialRendererSource, /drawRaceHackerCallout\(ctx, racer/);
  assert.match(socialRendererSource, /drawRaceHackerHydrogenCallout\(ctx, racer/);
  assert.match(socialRendererSource, /HYDROGEN BOMB \$\{remaining\.toFixed\(1\)\}S/);
  assert.match(socialRendererSource, /raceHackerCalloutUntil/);
  assert.match(socialRendererSource, /child\.raceRealitySpawn && child\.raceOrbId === "slammy"/);
  assert.match(socialRendererSource, /this\.drawRaceOrb\(ctx, child, def/);
  assert.match(socialRendererSource, /raceHudEntriesFor\(child, time\)/);
  assert.match(socialRendererSource, /const uiLines = \["copy", "hydrogen-bomb"\]\.includes\(child\.raceHackerChildKind\)/);
  assert.match(socialRendererSource, /COPIED:/);
  assert.doesNotMatch(socialRendererSource, /drawRaceSheetFrame\(\s*ctx,\s*"hackerComputerSheet"/);
  assert.match(socialRendererSource, /RACE_MINER_ALPHA_BOUNDS/);
  assert.match(socialRendererSource, /const RACE_MINER_SHOVEL_FRAME_RATE = 40 \/ 3/);
  assert.match(socialRendererSource, /const RACE_MINER_DRILL_FRAME_RATE = 24 \/ 3/);
  assert.match(socialRendererSource, /const RACE_MINER_DRILL_SHIFT_RATE = 12 \/ 3/);
  assert.match(socialRendererSource, /Math\.floor\(time \* RACE_MINER_SHOVEL_FRAME_RATE\)/);
  assert.match(socialRendererSource, /Math\.floor\(time \* RACE_MINER_DRILL_FRAME_RATE\)/);
  assert.match(socialRendererSource, /Math\.sin\(time \* RACE_MINER_DRILL_FRAME_RATE\)/);
  assert.match(socialRendererSource, /Math\.sin\(time \* RACE_MINER_DRILL_SHIFT_RATE\)/);
  assert.match(socialRendererSource, /const layerY = y \+ radius/);
  assert.match(socialRendererSource, /const verticalShift = planted \? 0 : bob/);
  assert.match(socialRendererSource, /const sourceCellWidth = Number\(sprite\.naturalWidth/);
  assert.match(socialRendererSource, /const barWidth = Math\.min\(rect\.width \* 0\.88, radius \* 9\)/);
  assert.match(socialRendererSource, /const drilling = racer\.raceMinerState === "drill"\s+&& racer\.raceMinerFallThrough !== true/);
  assert.match(socialRendererSource, /Object\.freeze\(\{ x: 16, y: 223, width: 335, height: 401 \}\)/);
  assert.match(socialRendererSource, /Object\.freeze\(\{ x: 0, y: 264, width: 350, height: 368 \}\)/);
  assert.match(socialRendererSource, /Object\.freeze\(\{ x: 26, y: 222, width: 336, height: 402 \}\)/);
  assert.match(socialRendererSource, /Object\.freeze\(\{ x: 24, y: 170, width: 314, height: 477 \}\)/);
  assert.match(socialRendererSource, /Object\.freeze\(\{ x: 39, y: 29, width: 293, height: 634 \}\)/);
  assert.match(socialRendererSource, /const drawBottom = racer\.raceMinerAttached\s+\? layerY\s+: drilling\s+\? layerY\s+: y \+ contentHeight \* 0\.5/);
  assert.match(socialRendererSource, /const cloudX = rect\.x \+ rect\.width \* 0\.5/);
  assert.match(socialRendererSource, /case "rain": return "RAIN"/);
  assert.match(socialRendererSource, /phase-two-sun/);
  assert.match(socialRendererSource, /trifecta/);
  assert.match(socialRendererSource, /gravitator/);
  assert.match(socialRendererSource, /effect\.laserImpact \|\| effect\.blueSunImpact/);
  assert.match(socialRendererSource, /return `INTERVAL LEVEL: \$\{raceLaserIntervalLabelFor\(racer\)\}`/);
  assert.match(socialRendererSource, /drawRaceRainOrb/);
  assert.match(socialRendererSource, /drawRaceHackerOrb/);
  assert.match(socialRendererSource, /drawRaceMinerOrb/);
  assert.deepEqual(RACE_GROUP_ANNOUNCER_NAMES, {
    math: "Math Orbs",
    superhero: "Superhero Orbs",
    weapon: "Weapon Orbs",
    growth: "Growth Orbs",
    motion: "Motion Orbs",
    "power-math": "Very Powerful Math Orbs",
    bombs: "Bombs",
    suns: "Sun Orbs",
  });
  assert.deepEqual(Object.values(RACE_ANNOUNCER_COUNT_NAMES), [
    "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "Ten",
    "Fifteen", "Twenty", "Twenty Five", "Thirty",
    "Thirty Five", "Forty", "Forty Five", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety", "One Hundred",
  ]);
  assert.equal(Object.keys(RACE_COUNT_ANNOUNCER_ASSETS).length, 23);
  assert.equal(raceAnnouncerCountCueFor(1), "race-count-1");
  assert.equal(raceAnnouncerCountCueFor(10), "race-count-10");
  assert.equal(raceAnnouncerCountCueFor(11), null, "non-milestone counts should remain unnumbered");
  assert.equal(raceAnnouncerCountCueFor(14), null, "counts between milestones should remain unnumbered");
  assert.equal(raceAnnouncerCountCueFor(15), "race-count-15");
  assert.equal(raceAnnouncerCountCueFor(50), "race-count-50");
  assert.equal(raceAnnouncerCountCueFor(60), "race-count-60");
  assert.equal(raceAnnouncerCountCueFor(70), "race-count-70");
  assert.equal(raceAnnouncerCountCueFor(80), "race-count-80");
  assert.equal(raceAnnouncerCountCueFor(90), "race-count-90");
  assert.equal(raceAnnouncerCountCueFor(100), "race-count-100");
  assert.equal(raceAnnouncerCountCueFor(51), null, "unconfigured counts should remain unnumbered");
  assert.equal(raceAnnouncerCountCueFor(999), null, "clamped counts above the configured range should remain unnumbered");
  assert.equal(ANNOUNCER_ASSETS["race-count-3"], RACE_COUNT_ANNOUNCER_ASSETS["race-count-3"]);
  assert.equal(ANNOUNCER_ASSETS["race-count-25"], RACE_COUNT_ANNOUNCER_ASSETS["race-count-25"]);
  assert.equal(ANNOUNCER_ASSETS["race-count-100"], RACE_COUNT_ANNOUNCER_ASSETS["race-count-100"]);
  assert.deepEqual(RACE_INTRO_ANNOUNCER_ASSETS, Object.fromEntries(
    Object.entries(RACE_GENERATED_ANNOUNCER_ASSETS)
      .filter(([cue]) => cue.startsWith("intro-race-")),
  ));
  assert.equal(ANNOUNCER_ASSETS["race-plus"], RACE_GENERATED_ANNOUNCER_ASSETS["race-plus"]);
  assert.equal(ANNOUNCER_ASSETS["race-versus"], RACE_GENERATED_ANNOUNCER_ASSETS["race-versus"]);
  assert.equal(RACE_GENERATED_ANNOUNCER_ASSETS["race-buffed"], "generated-race/race-buffed.wav");
  assert.equal(ANNOUNCER_ASSETS["race-buffed"], RACE_GENERATED_ANNOUNCER_ASSETS["race-buffed"]);
  assert.equal(ANNOUNCER_ASSETS["race-boss"], RACE_GENERATED_ANNOUNCER_ASSETS["race-boss"]);
  assert.equal(
    ANNOUNCER_ASSETS["race-pick-your-winner"],
    RACE_GENERATED_ANNOUNCER_ASSETS["race-pick-your-winner"],
  );
  assert.equal(
    ANNOUNCER_ASSETS["intro-race-artists"],
    RACE_GENERATED_ANNOUNCER_ASSETS["intro-race-artists"],
    "Artist announcer should be available with the new-orb announcement set",
  );
  assert.equal(ANNOUNCER_ASSETS["intro-race-everyone"], RACE_GENERATED_ANNOUNCER_ASSETS["intro-race-everyone"]);
  for (const [cue, filename] of Object.entries(RACE_GENERATED_ANNOUNCER_ASSETS)) {
    const liveAsset = new URL(`../assets/audio/announcer/${filename}`, import.meta.url);
    assert.ok(existsSync(liveAsset), `${cue} should have a generated race announcement`);
    assert.ok(readFileSync(liveAsset).byteLength > 4096, `${cue} announcement should contain audio samples`);
    const sourceAsset = new URL(`../assets/audio/source/race-announcer-generated/${filename.slice("generated-race/".length)}`, import.meta.url);
    assert.ok(existsSync(sourceAsset), `${cue} should preserve its generated source clip`);
  }
  assert.equal(Object.keys(RACE_COMBO_ANNOUNCER_ASSETS).length, 57, "every named two-ability combo should have one generated announcer");
  assert.equal(
    ANNOUNCER_ASSETS["intro-race-combo-speed-fibonacci"],
    RACE_COMBO_ANNOUNCER_ASSETS["intro-race-combo-speed-fibonacci"],
    "combo announcers should be available through the shared announcer manifest",
  );
  assert.deepEqual(raceAnnouncerIntroSequence("duplicator", "speed"), [
    "intro-race-duplicator",
    "race-versus",
    "intro-race-speed",
    "race-pick-your-winner",
  ]);
  assert.deepEqual(raceAnnouncerIntroSequence("duplicator", "speed", { includePrompt: false }), [
    "intro-race-duplicator",
    "race-versus",
    "intro-race-speed",
  ], "long-form matchup audio should omit the old Pick your winner tail");
  assert.deepEqual(raceAnnouncerIntroSequence("fibonacci", "x-squared"), [
    "intro-race-fibonacci",
    "race-versus",
    "intro-race-x-squared",
    "race-pick-your-winner",
  ]);
  assert.deepEqual(raceAnnouncerIntroSequence("unarmed", "poison"), [
    "intro-race-unarmed",
    "race-versus",
    "intro-race-poison",
    "race-pick-your-winner",
  ]);
  assert.equal(raceAnnouncerIntroSequence("orbital", "unknown"), null);
  assert.equal(raceAnnouncerIntroSequence("drill", "drill"), null);
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    {
      orbIds: ["speed"],
      options: { speed: { comboAbilities: ["fibonacci"] } },
    },
    { orbIds: ["gravity"], options: {} },
  ), [
    "intro-race-combo-speed-fibonacci",
    "race-versus",
    "intro-race-gravity",
    "race-pick-your-winner",
  ]);
  assert.equal(raceTargetAnnouncerCueFor(10_000), "race-target-10000");
  assert.equal(raceTargetAnnouncerCueFor(12_345), null);
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    ["speed"],
    ["fibonacci"],
    {
      includePrompt: false,
      includeMatchup: false,
      targetCue: "race-target-10000",
    },
  ), ["race-target-10000"], "target audio should be independently selectable");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    ["speed"],
    ["fibonacci"],
    { includePrompt: false, includeMatchup: true },
  ), [
    "intro-race-speed",
    "race-versus",
    "intro-race-fibonacci",
  ], "matchup names should be independently selectable");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    {
      orbIds: ["speed"],
      options: { speed: { count: 3 } },
    },
    {
      orbIds: ["gravity"],
      options: { gravity: { count: 10 } },
    },
  ), [
    "race-count-3",
    "intro-race-speed",
    "race-versus",
    "race-count-10",
    "intro-race-gravity",
    "race-pick-your-winner",
  ], "single-orb team counts should prepend Alex number cues to each orb announcement");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    {
      orbIds: ["speed"],
      options: { speed: { buffed: true } },
    },
    { orbIds: ["fibonacci"], options: {} },
  ), [
    "intro-race-speed",
    "race-buffed",
    "race-versus",
    "intro-race-fibonacci",
    "race-pick-your-winner",
  ], "buffed orb teams should announce their Alex buff cue after the orb name");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    {
      orbIds: ["speed"],
      options: { speed: { count: 15 } },
    },
    {
      orbIds: ["gravity"],
      options: { gravity: { count: 50 } },
    },
  ), [
    "race-count-15",
    "intro-race-speed",
    "race-versus",
    "race-count-50",
    "intro-race-gravity",
    "race-pick-your-winner",
  ], "five-copy milestone counts should prepend their generated number cues");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    {
      orbIds: ["speed"],
      options: { speed: { count: 60 } },
    },
    {
      orbIds: ["gravity"],
      options: { gravity: { count: 100 } },
    },
  ), [
    "race-count-60",
    "intro-race-speed",
    "race-versus",
    "race-count-100",
    "intro-race-gravity",
    "race-pick-your-winner",
  ], "new double-digit milestone counts should use their generated number cues");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    {
      orbIds: ["speed"],
      options: { speed: { count: 1 } },
    },
    {
      orbIds: ["gravity"],
      options: { gravity: { count: 2 } },
    },
  ), [
    "intro-race-speed",
    "race-versus",
    "race-count-2",
    "intro-race-gravity",
    "race-pick-your-winner",
  ], "a single copy should use the existing orb announcement without saying One");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    {
      orbIds: ["fibonacci"],
      options: { fibonacci: { comboAbilities: ["speed"] } },
    },
    { orbIds: ["gravity"], options: {} },
  ), [
    "intro-race-combo-speed-fibonacci",
    "race-versus",
    "intro-race-gravity",
    "race-pick-your-winner",
  ], "reversed base/borrowed order should reuse the same combo announcement");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    {
      orbIds: ["slammy"],
      options: { slammy: { comboAbilities: ["speed"] } },
    },
    { orbIds: ["poison"], options: {} },
  ), [
    "intro-race-combo-speed-slammy",
    "race-versus",
    "intro-race-poison",
    "race-pick-your-winner",
  ], "new Slammy combo names should route through their generated announcer");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    {
      orbIds: ["speed"],
      options: { speed: { comboAbilities: ["drill"] } },
    },
    { orbIds: ["gravity"], options: {} },
  ), [
    "intro-race-combo-speed-drill",
    "race-versus",
    "intro-race-gravity",
    "race-pick-your-winner",
    ], "new Drill combo names should route through their generated announcer");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    {
      orbIds: ["orbital"],
      options: { orbital: { comboAbilities: ["speed"] } },
    },
    { orbIds: ["gravity"], options: {} },
  ), [
    "intro-race-combo-speed-orbital",
    "race-versus",
    "intro-race-gravity",
    "race-pick-your-winner",
  ], "Orbital combos should use the shared companion-stem announcer convention");
  assert.deepEqual(raceTeamAnnouncerIntroSequence(["batman", "flash"], ["grower", "sticky"]), [
    "intro-race-batman",
    "race-plus",
    "intro-race-flash",
    "race-versus",
    "intro-race-grower",
    "race-plus",
    "intro-race-sticky",
    "race-pick-your-winner",
  ]);
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    ["batman", "flash", "fibonacci"],
    ["fibonacci", "phi", "batman", "flash"],
  ), [
    "intro-race-group-superhero",
    "race-plus",
    "intro-race-fibonacci",
    "race-versus",
    "intro-race-group-math",
    "race-plus",
    "intro-race-group-superhero",
    "race-pick-your-winner",
  ]);
  assert.deepEqual(raceTeamAnnouncerIntroSequence(
    ["batman", "fibonacci", "drill", "grower"],
    ["orbital", "duplicator"],
  ), [
    "intro-race-everyone",
    "race-versus",
    "intro-race-orbital",
    "race-plus",
    "intro-race-duplicator",
    "race-pick-your-winner",
  ]);
  assert.deepEqual(announcerManifest.raceSourceOrder, {
    "2026-07-13T23_56_13": "Duplicator",
    "2026-07-13T23_56_30": "Speedster",
    "2026-07-13T23_56_42": "Orbital",
    "2026-07-13T23_56_51": "Drill",
  });
  assert.deepEqual(announcerManifest.raceMathSourceOrder, {
    "2026-07-14T00_28_22": "Fibonacci",
    "2026-07-14T00_28_11": "X Squared",
  });
  assert.deepEqual(announcerManifest.raceLazerGoldenSourceOrder, {
    "2026-07-14T21_25_03": "Lazer",
    "2026-07-14T21_24_33": "Golden Ratio",
  });
  assert.deepEqual(announcerManifest.raceStickyGrowerSourceOrder, {
    "2026-07-14T21_35_02": "Sticky",
    "2026-07-14T21_34_56": "Grower",
  });
  assert.deepEqual(announcerManifest.raceGroupLatestSourceOrder, {
    "2026-07-14T22_56_33": "Motion Orbs",
    "2026-07-14T22_56_24": "Math Orbs",
  });
  assert.deepEqual(announcerManifest.raceGroupFollowupSourceOrder, {
    "2026-07-14T22_58_14": "Growth Orbs",
    "2026-07-14T22_58_08": "Weapon Orbs",
    "2026-07-14T22_58_47": "Superhero Orbs",
  });
  assert.deepEqual(announcerManifest.raceNewRosterSourceOrder, {
    "2026-07-15T19_18_22": "Gravity",
    "2026-07-15T19_18_15": "Jackpot",
    "2026-07-15T19_18_06": "Boomerang",
  });
  assert.deepEqual(announcerManifest.raceSplodeySourceOrder, {
    "2026-07-15T19_46_33": "Splodey",
  });
  assert.deepEqual(announcerManifest.raceMathExpansionSourceOrder, {
    "2026-07-17T18_00_59": "Quadratic",
    "2026-07-17T18_01_07": "Pi",
    "2026-07-17T18_01_38": "Integral",
    "2026-07-17T18_01_57": "Prime",
  });
  assert.deepEqual(announcerManifest.raceSlowSourceOrder, {
    "2026-07-17T18_11_55": "Slow",
  });
  assert.deepEqual(announcerManifest.raceMeteorSourceOrder, {
    "2026-07-17T22_10_02": "Meteor",
  });
  assert.deepEqual(announcerManifest.raceBlackHoleSourceOrder, {
    "2026-07-18T02_11_54": "Black Hole",
  });
  assert.deepEqual(announcerManifest.racePronunciationOverrides, {
    fibonacci: "Fee buh naa chee.",
    mines: "Splodee.",
  });
  const raceAnnouncementGeneratorSource = readFileSync(new URL("../scripts/generate-race-announcements.mjs", import.meta.url), "utf8");
  assert.match(raceAnnouncementGeneratorSource, /fibonacci:\s*"Fee buh naa chee"/);
  assert.match(raceAnnouncementGeneratorSource, /mines:\s*"Splodee"/);
  assert.equal(announcerManifest.racePickWinnerSource, "assets/audio/source/race-announcer-20260714/race-pick-your-winner.mp3");
  assert.equal(announcerManifest.racePlusSource, "assets/audio/source/race-announcer-20260714/race-plus.mp3");
  assert.equal(announcerManifest.raceEveryoneSource, "assets/audio/source/race-announcer-20260714/race-everyone.mp3");
  assert.equal(announcerManifest.lines["race-pick-your-winner.mp3"], "Pick your winner.");
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/generated-race/race-pick-your-winner.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/race-announcer-generated/race-pick-your-winner.mp3", import.meta.url)),
    "the generated race prompt should preserve its generated source copy",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/race-plus.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/race-announcer-20260714/race-plus.mp3", import.meta.url)),
    "team announcements should splice the exact supplied plus clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/race-everyone.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/race-announcer-20260714/race-everyone.mp3", import.meta.url)),
    "large-team announcements should use the exact supplied everyone clip",
  );
  for (const [racerId, sourceName] of Object.entries({
    duplicator: "duplicator",
    speed: "speedster",
    orbital: "orbital",
    drill: "drill",
  })) {
    assert.ok(existsSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)));
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-announcer-20260713/${sourceName}.mp3`, import.meta.url)),
      `${racerId} should use the supplied race announcer clip`,
    );
  }
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/race-mines.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/race-announcer-20260714/splodey-20260715-19_46_33.mp3", import.meta.url)),
    "mines should use the supplied Splodey announcer clip",
  );
  for (const [racerId, sourceName] of Object.entries({
    quadratic: "quadratic-20260717-18_00_59",
    pi: "pi-20260717-18_01_07",
    integral: "integral-20260717-18_01_38",
    prime: "prime-20260717-18_01_57",
  })) {
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-announcer-20260714/${sourceName}.mp3`, import.meta.url)),
      `${racerId} should use the supplied race announcer clip`,
    );
  }
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/race-speed-impact.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/race-announcer-20260714/slow-20260717-18_11_55.mp3", import.meta.url)),
    "speed-impact should use the supplied Slow announcer clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/race-meteor.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/race-announcer-20260714/meteor-20260717-22_10_02.mp3", import.meta.url)),
    "meteor should use the supplied Meteor announcer clip",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/race-black-hole.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/race-announcer-20260714/black-hole-20260718-02_11_54.mp3", import.meta.url)),
    "the supplied Black Hole announcer source should remain preserved",
  );
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/race-black-hole-custom.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/race-announcer-custom/race-black-hole.mp3", import.meta.url)),
    "the generated Black Hole announcement should match its preserved source",
  );
  for (const [racerId, sourceName] of Object.entries({ fibonacci: "fibonacci", "x-squared": "x-squared" })) {
    assert.ok(existsSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)));
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-announcer-20260714/${sourceName}.mp3`, import.meta.url)),
      `${racerId} should use the supplied race announcer clip`,
    );
  }
  for (const [racerId, sourceName] of Object.entries({ flash: "flash", batman: "batman" })) {
    assert.ok(existsSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)));
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-announcer-20260714/${sourceName}.mp3`, import.meta.url)),
      `${racerId} should use the supplied race announcer clip`,
    );
  }
  for (const [racerId, sourceName] of Object.entries({ lazer: "lazer", phi: "phi" })) {
    assert.ok(existsSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)));
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-announcer-20260714/${sourceName}.mp3`, import.meta.url)),
      `${racerId} should use the supplied race announcer clip`,
    );
  }
  for (const [racerId, sourceName] of Object.entries({ sticky: "sticky", grower: "grower" })) {
    assert.ok(existsSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)));
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-announcer-20260714/${sourceName}.mp3`, import.meta.url)),
      `${racerId} should use the supplied race announcer clip`,
    );
  }
  for (const [racerId, sourceName] of Object.entries({
    gravity: "gravity-20260715-19_18_22",
    jackpot: "jackpot-20260715-19_18_15",
    boomerang: "boomerang-20260715-19_18_06",
  })) {
    assert.ok(existsSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)));
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/announcer/wise/race-${racerId}.mp3`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-announcer-20260714/${sourceName}.mp3`, import.meta.url)),
      `${racerId} should use the supplied race announcer clip`,
    );
  }
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/announcer/wise/race-versus.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/race-announcer-20260714/versus.mp3", import.meta.url)),
    "Orb Race should use the supplied race-only Versus clip",
  );
  for (const [groupId, sourceName] of Object.entries({
    motion: "motion-orbs-20260714-22_56_33",
    math: "math-orbs-20260714-22_56_24",
  })) {
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/announcer/wise/race-group-${groupId}.mp3`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-announcer-20260714/${sourceName}.mp3`, import.meta.url)),
      `${groupId} should use the latest supplied group announcer clip`,
    );
  }
  for (const [groupId, sourceName] of Object.entries({
    growth: "growth-orbs-20260714-22_58_14",
    weapon: "weapon-orbs-20260714-22_58_08",
    superhero: "superhero-orbs-20260714-22_58_47",
  })) {
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/announcer/wise/race-group-${groupId}.mp3`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-announcer-20260714/${sourceName}.mp3`, import.meta.url)),
      `${groupId} should use the latest supplied group announcer clip`,
    );
  }
  assert.equal(Object.keys(WORLD_CUP_ANNOUNCER_NAMES).length, 29);
  assert.equal(Object.keys(WORLD_CUP_INTRO_ANNOUNCER_ASSETS).length, 29);
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-argentina"], "wise/world-cup-argentina.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-australia"], "wise/world-cup-australia.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-canada"], "wise/world-cup-canada.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-cabo-verde"], "wise/world-cup-cabo-verde.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-colombia"], "wise/world-cup-ghana.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-congo-dr"], "wise/world-cup-congo-dr.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-egypt"], "wise/world-cup-egypt.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-ghana"], "wise/world-cup-colombia.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-mexico"], "wise/world-cup-mexico.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-morocco"], "wise/world-cup-morocco.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-paraguay"], "wise/world-cup-paraguay.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-germany"], "wise/world-cup-germany.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-portugal"], "wise/world-cup-croatia.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-croatia"], "wise/world-cup-portugal.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-ivory-coast"], "wise/world-cup-ivory-coast.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-norway"], "wise/world-cup-norway.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-belgium"], "wise/world-cup-belgium.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-senegal"], "wise/world-cup-senegal.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-austria"], "wise/world-cup-austria.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-spain"], "wise/world-cup-spain.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-algeria"], "wise/world-cup-algeria.mp3");
  assert.equal(WORLD_CUP_INTRO_ANNOUNCER_ASSETS["intro-country-switzerland"], "wise/world-cup-switzerland.mp3");
  assert.deepEqual(worldCupAnnouncerIntroSequence("france", "brazil"), [
    "intro-country-france",
    "versus",
    "intro-country-brazil",
    "world-cup-pick-your-winner",
  ]);
  assert.deepEqual(worldCupAnnouncerIntroSequence("cabo-verde", "argentina"), [
    "intro-country-cabo-verde",
    "versus",
    "intro-country-argentina",
    "world-cup-pick-your-winner",
  ]);
  assert.deepEqual(worldCupAnnouncerIntroSequence("mexico", "canada"), [
    "intro-country-mexico",
    "versus",
    "intro-country-canada",
    "world-cup-pick-your-winner",
  ]);
  assert.deepEqual(worldCupAnnouncerIntroSequence("ghana", "colombia"), [
    "intro-country-ghana",
    "versus",
    "intro-country-colombia",
    "world-cup-pick-your-winner",
  ]);
  assert.deepEqual(worldCupAnnouncerIntroSequence("canada", "ghana"), [
    "intro-country-canada",
    "versus",
    "intro-country-ghana",
    "world-cup-pick-your-winner",
  ]);
  assert.deepEqual(worldCupAnnouncerIntroSequence("morocco", "canada"), [
    "intro-country-morocco",
    "versus",
    "intro-country-canada",
    "world-cup-pick-your-winner",
  ]);
  assert.equal(worldCupAnnouncerIntroSequence("france", "france"), null);
  assert.equal(worldCupAnnouncerIntroSequence("france", "unknown"), null);
  for (const filename of Object.values(WORLD_CUP_INTRO_ANNOUNCER_ASSETS)) {
    assert.ok(existsSync(new URL(`../assets/audio/announcer/${filename}`, import.meta.url)), `${filename} should exist`);
  }
  assert.ok(existsSync(new URL(`../assets/audio/announcer/${ANNOUNCER_ASSETS["world-cup-pick-your-winner"]}`, import.meta.url)));
}

{
  const sim = createSimulation({ count: 2, classes: ["time", "volta"], seed: 2406 });
  const [chrono, volta] = sim.fighters;
  chrono.health = 92;
  chrono.damageDone = 24;
  chrono.weaponHitsDone = 3;
  volta.health = 24;
  volta.damageDone = 4;
  const odds = buildWinProbability(sim);
  assert.equal(odds.leader.id, chrono.id);
  assert.ok(odds.leader.probability > 0.6, "health, hits, and damage should move win odds");
  const dangerMoment = bigMomentForEvent(
    { type: "weapon-hit", fighterId: chrono.id, targetId: volta.id, amount: 11 },
    sim.fighters,
    odds,
  );
  assert.equal(dangerMoment.label, "DANGER ZONE");

  const pickupMoment = bigMomentForEvent(
    { type: "world-cup-pickup", label: "DAMAGE DRINK · PERMANENT +0.1×", sourceId: chrono.id },
    sim.fighters,
    odds,
  );
  assert.equal(pickupMoment, null);

  const homingBall = bigMomentForEvent(
    { type: "world-cup-ball-hit", sourceId: chrono.id, targetId: volta.id },
    sim.fighters,
    odds,
  );
  assert.equal(homingBall, null);

  const redCard = bigMomentForEvent(
    { type: "world-cup-card-hit", pickupType: "red-card", sourceId: chrono.id, targetId: volta.id },
    sim.fighters,
    odds,
  );
  assert.equal(redCard, null);

  const yellowCardCallout = bigMomentCalloutForEvent(
    { type: "world-cup-card-hit", pickupType: "yellow-card", sourceId: chrono.id, targetId: volta.id },
    sim.fighters,
  );
  assert.equal(yellowCardCallout, null);
  sim.weaponHits = 8;
  sim.overtimeStarted = true;
  const hype = buildHypeScore(sim, odds);
  assert.ok(hype >= 45 && hype <= 100, "hype score should reward hits, overtime, and close danger");
}

{
  for (const filename of Object.values(SAMPLE_ASSETS)) {
    assert.ok(existsSync(new URL(`../assets/audio/effects/${filename}`, import.meta.url)), `${filename} should exist`);
  }
  for (const [activeName, sourceName] of Object.entries({
    "race-pancake-impact.mp3": "universfield-cartoon-splat-310479.mp3",
    "race-monster-growl.mp3": "dragon-studio-monster-growl-390285.mp3",
    "race-fairy-sparkle.mp3": "humordome-fairy-sparkle-451414.mp3",
    "race-thunder.mp3": "universfield-loud-thunder-192165.mp3",
    "race-monster-footsteps.mp3": "audiopapkin-monster-footsteps-on-gravel-295850.mp3",
  })) {
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/effects/${activeName}`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-effects-20260805/${sourceName}`, import.meta.url)),
      `${activeName} should preserve its supplied source clip unchanged`,
    );
  }
  assert.deepEqual(
    readFileSync(new URL("../assets/audio/effects/classic-trident-throw.mp3", import.meta.url)),
    readFileSync(new URL("../assets/audio/source/classic-effects-20260810/floraphonic-swing-whoosh-5-198498.mp3", import.meta.url)),
    "Classic Trident should preserve the supplied throwing whoosh unchanged",
  );
  for (const [activeName, sourceName] of Object.entries({
    "classic-trapper-throw.mp3": "u_bnbrkm8sva-yeehaw-1-203838.mp3",
    "classic-trapper-caught.mp3": "freesound_community-mixed-whip-crack-1-102825.mp3",
  })) {
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/effects/${activeName}`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/classic-effects-20260810/${sourceName}`, import.meta.url)),
      `${activeName} should preserve its supplied Trapper source clip unchanged`,
    );
  }
  for (const [activeName, sourceName] of Object.entries({
    "race-godzilla-tail-smack.wav": "godzilla-tail-smack.wav",
    "race-godzilla-beam-charge.wav": "godzilla-beam-charge.wav",
  })) {
    assert.deepEqual(
      readFileSync(new URL(`../assets/audio/effects/${activeName}`, import.meta.url)),
      readFileSync(new URL(`../assets/audio/source/race-effects-20260806/${sourceName}`, import.meta.url)),
      `${activeName} should match its generated source clip unchanged`,
    );
  }
  const godzillaAudioManifest = JSON.parse(
    readFileSync(new URL("../assets/audio/source/race-effects-20260806/manifest.json", import.meta.url), "utf8"),
  );
  assert.equal(godzillaAudioManifest.generator, "scripts/generate_godzilla_audio.py");
  assert.match(godzillaAudioManifest.notes.join(" "), /supplied monster growl/);
  assert.equal(
    createHash("sha256").update(readFileSync(new URL("../assets/audio/effects/hydrogen-bomb-explosion.mp3", import.meta.url))).digest("hex"),
    "af7232b266e6d7920c45bb4d5ac306d3c2210943ce8f1ae56af62a9333bf8fae",
    "Hydrogen Bomb should ship the supplied explosion sample unchanged",
  );
  assert.equal(
    createHash("sha256").update(readFileSync(new URL("../assets/audio/effects/hydrogen-bomb-ear-ringing.mp3", import.meta.url))).digest("hex"),
    "bae905e4b5485d3330cdc1190d95859fafae996791b7678b69a1248b1093db5a",
    "Hydrogen Bomb should ship the supplied ear-ringing sample unchanged",
  );
  const eventSamples = new Map([
    ["knockout", "world-cup-ko"],
    ["time-stop", "chrono-time-stop"],
    ["weapon-hit", "weapon-hit"],
    ["weapon-clash", "weapon-clash"],
    ["impact", "orb-collision"],
    ["race-bounce", "orb-collision"],
    ["race-layer-break", "race-layer-break"],
    ["race-mine-explosion", "orb-collision"],
    ["race-jackpot-spin", "jackpot-slot-spinning"],
    ["race-jackpot-lever", "jackpot-slot-lever"],
    ["race-black-hole-impact", "black-hole-impact"],
    ["race-black-hole-teleport-out", "black-hole-teleport"],
    ["race-black-hole-teleport-in", "black-hole-teleport"],
    ["race-poison-tick", "orb-collision"],
    ["race-ying-yang-switch", "black-hole-teleport"],
    ["race-hydrogen-bomb-countdown-start", "hydrogen-bomb-siren"],
    ["race-hydrogen-bomb-explosion", "hydrogen-bomb-explosion"],
    ["race-hydrogen-bomb-flash-start", "hydrogen-bomb-ear-ringing"],
    ["race-tsar-bomb-countdown-start", "hydrogen-bomb-siren"],
    ["race-tsar-bomb-reactor-hit", "black-hole-impact"],
    ["race-tsar-bomb-explosion", "hydrogen-bomb-explosion"],
    ["race-tsar-bomb-flash-start", "hydrogen-bomb-ear-ringing"],
    ["race-all-in-one-activate", "race-math-power"],
    ["race-all-in-one-hydrogen-countdown-start", "hydrogen-bomb-siren"],
    ["race-all-in-one-hydrogen-explosion", "hydrogen-bomb-explosion"],
    ["race-all-in-one-hydrogen-flash-start", "hydrogen-bomb-ear-ringing"],
    ["race-antimatter-detonation", "hydrogen-bomb-explosion"],
    ["race-antimatter-orb-destroy", "hydrogen-bomb-ear-ringing"],
    ["race-time-bomb-midnight", "chrono-time-stop"],
    ["race-reality-spawn", "black-hole-teleport"],
    ["race-lag-glitch-start", "race-lag-glitch"],
    ["race-lag-glitch-tick", "orb-collision"],
    ["race-twins-heal", "forge-item-pickup"],
    ["race-copycat-roulette-start", "jackpot-slot-spinning"],
    ["race-rgb-cycle", "jackpot-slot-spinning"],
    ["forge-heat-pickup", "forge-item-pickup"],
    ["world-cup-pickup", "forge-item-pickup"],
    ["world-cup-card-use", "world-cup-card-use"],
    ["world-cup-ball-hit", "critical-hit"],
    ["world-cup-card-hit", "critical-hit"],
    ["race-finish", "world-cup-ko"],
    ["burn-tick", "cinder-burn-tick"],
    ["arcane-burst", "hex-magic-burst"],
    ["aegis-rush", "aegis-rush"],
  ]);
  for (const [type, sample] of eventSamples) {
    assert.equal(samplePlanForEvent({ type, id: 900 }).sample, sample);
  }
  assert.equal(
    samplePlanForEvent({ type: "race-twins-heal", id: 901 }).rateLimit,
    0,
    "every Twin healing tick should be allowed to play the Forge pickup cue",
  );
  for (const [type, sample] of [
    ["classic-hydrogen-bomb-countdown-start", "hydrogen-bomb-siren"],
    ["classic-hydrogen-detonate", "hydrogen-bomb-explosion"],
    ["classic-hydrogen-bomb-flash-start", "hydrogen-bomb-ear-ringing"],
  ]) {
    assert.equal(samplePlanForEvent({ type, gameplayMode: "classic", id: 900 }).sample, sample);
  }
  assert.equal(
    samplePlanForEvent({ type: "race-hydrogen-bomb-countdown-start", id: 901 }).loop,
    true,
    "Hydrogen Bomb's siren should be a looped countdown sample",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-hydrogen-bomb-explosion", id: 902 }).sample,
    "hydrogen-bomb-explosion",
    "the explosion event should play the supplied explosion sample after stopping the siren",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-hydrogen-bomb-flash-start", id: 903 }).maxDuration,
    4,
    "the ear-ringing sample should cover the full four-second white flash",
  );
  assert.equal(samplePlanForEvent({ type: "race-antimatter-detonation", id: 9031 }).sample, "hydrogen-bomb-explosion");
  assert.equal(samplePlanForEvent({ type: "race-time-bomb-midnight", id: 9032 }).sample, "chrono-time-stop");
  assert.equal(samplePlanForEvent({ type: "race-reality-spawn", id: 9033 }).sample, "black-hole-teleport");
  assert.equal(samplePlanForEvent({ type: "race-lag-glitch-start", id: 9034 }).sample, "race-lag-glitch");
  const sources = [];
  const fakeContext = {
    state: "running",
    currentTime: 4,
    createBufferSource() {
      const source = {
        playbackRate: { value: 1 },
        connect() {},
        start(...args) { source.started = args; },
        stop(...args) { source.stopped = args; },
      };
      sources.push(source);
      return source;
    },
    createGain() {
      return {
        connect() {},
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          cancelScheduledValues() {},
          setTargetAtTime() {},
        },
      };
    },
  };
  const audio = new CombatAudio({ fetcher: null });
  audio.context = fakeContext;
  audio.categoryGains.effects = {};
  audio.sampleBuffers.set("hydrogen-bomb-siren", { duration: 3.5 });
  audio.sampleBuffers.set("hydrogen-bomb-explosion", { duration: 5.496 });
  audio.sampleBuffers.set("hydrogen-bomb-ear-ringing", { duration: 35.688 });
  assert.equal(audio.play({ type: "race-hydrogen-bomb-countdown-start", id: 904 }), true);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].loop, true, "the siren source should loop instead of ending after one clip");
  assert.deepEqual(sources[0].started, [4, 0]);
  assert.equal(audio.play({ type: "race-hydrogen-bomb-explosion", id: 905 }), true);
  assert.deepEqual(sources[0].stopped, [4.075], "the explosion should stop the countdown siren");
  assert.equal(sources.length, 2, "the explosion should create a second audio source");
  assert.deepEqual(sources[1].started, [4, 0], "the explosion sample should start immediately");
  assert.equal(audio.play({ type: "race-hydrogen-bomb-flash-start", id: 906 }), true);
  assert.equal(sources.length, 3, "the flash-start event should create a ringing audio source");
  assert.deepEqual(sources[2].started, [4, 0], "the ringing sample should start with the white flash");
  assert.deepEqual(sources[2].stopped, [8.025], "the ringing sample should end with the four-second flash");
  assert.equal(audio.play({ type: "classic-hydrogen-bomb-countdown-start", gameplayMode: "classic", id: 907 }), true);
  assert.equal(sources.length, 4, "Classic Hydrogen should start its own looping countdown siren");
  assert.equal(sources[3].loop, true);
  assert.equal(audio.play({ type: "classic-hydrogen-detonate", gameplayMode: "classic", id: 908 }), true);
  assert.deepEqual(sources[3].stopped, [4.075], "Classic Hydrogen detonation should stop its countdown siren");
  assert.equal(sources.length, 5);
  assert.equal(audio.play({ type: "classic-hydrogen-bomb-flash-start", gameplayMode: "classic", id: 909 }), true);
  assert.equal(sources.length, 6, "Classic Hydrogen flash should start the ear-ringing aftershock");
  assert.equal(samplePlanForEvent({ type: "race-black-hole-teleport-out", id: 910 }).offset, 0);
  assert.equal(samplePlanForEvent({ type: "race-black-hole-teleport-in", id: 911 }).offset, 0.5);
  assert.equal(
    samplePlanForEvent({ type: "race-jackpot-result", outcome: "jackpot", id: 901 }).sample,
    "forge-item-pickup",
    "Jackpot pickup audio should play when the resolved spin result is shown",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-jackpot-result", outcome: "unlucky", id: 902 }).sample,
    "world-cup-ko",
    "Jackpot KO audio should play when the resolved unlucky result is shown",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-jackpot-result", outcome: "cash", id: 903 }),
    null,
    "cash results should not play an outcome stinger",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-jackpot-result", outcome: "neutral", id: 904 }),
    null,
    "neutral Jackpot results should not play the unlucky stinger",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-jackpot-result", outcome: "bust", id: 905 }),
    null,
    "internal bust tier labels should not play the stinger directly",
  );
  assert.equal(samplePlanForEvent({ type: "race-jackpot", id: 906 }), null, "Jackpot line hits should not replay the outcome stinger");
  assert.equal(samplePlanForEvent({ type: "race-jackpot-unlucky", id: 907 }), null, "unlucky line hits should not replay the outcome stinger");
  assert.equal(
    samplePlanForEvent({ type: "race-speed-impact", raceOrbId: "speed-impact", id: 908 }).sample,
    "critical-hit",
    "SPEED landings should use the critical hit sample",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "speed-impact", surface: "number-line", id: 909 }),
    null,
    "SPEED should not double-play the regular bounce sample",
  );
  const laserTickPlan = samplePlanForEvent({
    type: "race-laser-tick",
    raceOrbId: "lazer",
    raceAbilityId: "lazer",
    interval: 0.01,
    id: 9091,
  });
  assert.equal(laserTickPlan.sample, "orb-collision", "every Lazer interval hit should use the bounce sample");
  assert.equal(laserTickPlan.rateLimit, 0, "Lazer interval hits should never be rate-limited");
  assert.equal(laserTickPlan.allowBurst, true, "Lazer interval hits should allow overlapping bounce voices");
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "speed", surface: "number-line", layerBroken: true, id: 910 }),
    null,
    "a layer-breaking impact should use the dedicated break cue instead of the ordinary bounce sample",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-layer-break", raceOrbId: "speed", layerIndex: 0, id: 911 }).sample,
    "race-layer-break",
    "layer destruction should use the supplied metallic break sample",
  );
  assert.equal(SAMPLE_ASSETS["race-vampire-bounce"], "race-vampire-bounce.mp3");
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "vampire", surface: "number-line", id: 912 }).sample,
    "race-vampire-bounce",
    "Vampire should use its supplied hiss on number-line bounces",
  );
  assert.equal(
    samplePlanForEvent({
      type: "race-bounce",
      raceOrbId: "vampire",
      raceAbilityIds: ["vampire", "fibonacci"],
      surface: "number-line",
      id: 9121,
    }).sample,
    "race-vampire-bounce",
    "Vampire should keep its bounce cue when a combo also carries a math ability",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "vampire", surface: "top-wall", id: 913 }).sample,
    "orb-collision",
    "Vampire should keep the standard cue on top-wall bounces",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "vampire", surface: "vertical-wall", id: 914 }).sample,
    "orb-collision",
    "Vampire should keep the standard cue on side-wall bounces",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "vampire", surface: "number-line", layerBroken: true, id: 915 }),
    null,
    "Vampire layer-breaking impacts should leave the dedicated layer-break cue in control",
  );
  assert.equal(samplePlanForEvent({ type: "race-drill", id: 908 }).sample, "race-drill", "drill launches should play the drill-fire sample");
  assert.equal(samplePlanForEvent({ type: "race-grappler-fire", id: 9081 }).sample, "race-draft-rifle-fire");
  assert.equal(samplePlanForEvent({ type: "race-grappler-ricochet", id: 9082 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-grappler-pull-end", id: 9083 }).sample, "critical-hit");
  assert.equal(samplePlanForEvent({ type: "race-artist-paint-start", raceOrbId: "artists", id: 9084 }), null);
  assert.equal(samplePlanForEvent({ type: "race-artist-heal", raceOrbId: "artists", id: 9085 }), null);
  assert.equal(samplePlanForEvent({ type: "race-artist-painting-hit", raceOrbId: "artists", paintingName: "STORM", id: 9086 }), null);
  assert.equal(samplePlanForEvent({ type: "race-artist-painting-hit", raceOrbId: "artists", paintingName: "BLOOM", id: 9087 }).sample, "forge-item-pickup");
  assert.equal(samplePlanForEvent({ type: "race-artist-storm-strike", raceOrbId: "artists", id: 9088 }).sample, "race-thunder");
  assert.equal(samplePlanForEvent({ type: "race-artist-summon-start", raceOrbId: "artists", kind: "monster", id: 9089 }).sample, "race-monster-growl");
  assert.equal(samplePlanForEvent({ type: "race-artist-summon-start", raceOrbId: "artists", kind: "fairy", id: 9090 }).sample, "race-fairy-sparkle");
  assert.equal(samplePlanForEvent({ type: "race-artist-summon-attack", raceOrbId: "artists", kind: "monster", id: 9091 }).sample, "race-monster-footsteps");
  assert.equal(samplePlanForEvent({ type: "race-artist-summon-step", raceOrbId: "artists", kind: "monster", id: 9092 }).sample, "race-monster-footsteps");
  assert.equal(samplePlanForEvent({ type: "race-godzilla-step", raceOrbId: "godzilla", id: 90921 }).sample, "race-monster-footsteps");
  assert.equal(samplePlanForEvent({ type: "race-godzilla-look-up", raceOrbId: "godzilla", id: 90922 }).sample, "race-monster-growl");
  assert.equal(samplePlanForEvent({ type: "race-godzilla-charge", raceOrbId: "godzilla", id: 90923 }).sample, "race-godzilla-beam-charge");
  assert.equal(samplePlanForEvent({ type: "race-godzilla-atomic-breath", raceOrbId: "godzilla", id: 90924 }).sample, "race-thunder");
  assert.equal(
    samplePlanForEvent({ type: "race-godzilla-impact", raceOrbId: "godzilla", kind: "tail-swipe", attack: true, id: 90925 }).sample,
    "race-godzilla-tail-smack",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-godzilla-impact", raceOrbId: "godzilla", kind: "stomp", attack: true, id: 90926 }).sample,
    "race-monster-footsteps",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-godzilla-impact", raceOrbId: "godzilla", kind: "stomp", attack: false, id: 90927 }),
    null,
    "Godzilla's normal step impact should not double-play its footstep cue",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "artists", surface: "number-line", id: 909 }),
    null,
    "Artist body bounces should remain silent while the new drawing cues are enabled",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "pancake", surface: "number-line", id: 9093 }).sample,
    "orb-collision",
    "Pancake number-line impacts should use the generic collision cue",
  );
  assert.equal(samplePlanForEvent({ type: "race-bounce", raceOrbId: "pancake", surface: "top-wall", id: 9094 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-pancake-flip", id: 9095 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-pancake-stack", id: 9096 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-pancake-stack-spawn", id: 90961 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-pancake-patch-create", id: 90962 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-pancake-butter-patch-create", id: 90963 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-pancake-patch-tick", id: 9097 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-pancake-butter-meteor", id: 9098 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-pancake-butter-strike", id: 9099 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-critical-hit", raceOrbId: "pancake", id: 9100 }), null);
  assert.equal(samplePlanForEvent({ type: "race-reactor-explosion", raceOrbId: "pancake", id: 9101 }), null);
  assert.equal(samplePlanForEvent({ type: "race-tree-roots-start", id: 9102 }).sample, "black-hole-impact");
  assert.equal(samplePlanForEvent({ type: "race-tree-root-tick", id: 9103 }).sample, "black-hole-teleport");
  assert.equal(samplePlanForEvent({ type: "race-tree-roots-end", id: 9104 }).sample, "black-hole-teleport");
  assert.equal(samplePlanForEvent({ type: "race-pancake-butter-horn", id: 9105 }), null);
  assert.deepEqual(FUTURE_AUDIO_ROUTE_CONTRACTS["race-pancake-butter-horn"], {
    sample: null,
    status: "awaiting-user-supplied-clip",
  });
  assert.equal(samplePlanForEvent({ type: "race-turret-fire", id: 916 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-leech-tick", id: 917 }).sample, "cinder-burn-tick");
  assert.equal(
    samplePlanForEvent({ type: "race-crusher-impact", id: 918 }).sample,
    "race-layer-break",
    "Crusher impacts should avoid the critical-hit cue",
  );
  assert.equal(samplePlanForEvent({ type: "race-reactor-explosion", id: 919 }).sample, "black-hole-impact");
  assert.equal(samplePlanForEvent({ type: "race-parasite-spawn", id: 920 }).sample, "black-hole-teleport");
  assert.equal(
    samplePlanForEvent({ type: "race-parasite-tick", id: 921 }).sample,
    "orb-collision",
    "Parasite damage ticks should use the regular damage sample",
  );
  assert.equal(samplePlanForEvent({ type: "race-draft-upgrade", id: 922 }).sample, "forge-item-pickup");
  assert.equal(SAMPLE_ASSETS["race-draft-rifle-fire"], "race-draft-rifle-fire.mp3");
  assert.equal(SAMPLE_ASSETS["race-draft-shotgun-fire"], "race-draft-shotgun-fire.mp3");
  assert.equal(SAMPLE_ASSETS["race-draft-pistol-fire"], "race-draft-pistol-fire.mp3");
  assert.equal(
    samplePlanForEvent({ type: "race-draft-fire", gunTier: 1, id: 923 }).sample,
    "race-draft-rifle-fire",
    "Draftmaster's first projectile upgrade should use the rifle clip",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-draft-fire", gunTier: 2, id: 924 }).sample,
    "race-draft-shotgun-fire",
    "Draftmaster's three-pellet upgrade should use the shotgun clip",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-draft-fire", gunTier: 0, id: 925 }).sample,
    "race-draft-pistol-fire",
    "Draftmaster's base projectile should use the pistol clip",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-draft-sword-swing", id: 922 }).sample,
    "weapon-hit",
    "Draftmaster sword swings should restore the old sword-swing sample",
  );
  assert.equal(samplePlanForEvent({ type: "race-draft-sword-hit", id: 923 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-sniper-fire", id: 926 }).sample, "race-draft-rifle-fire");
  assert.equal(samplePlanForEvent({ type: "race-sniper-hit", id: 927 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-sniper-ricochet", id: 9271 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-commander-missile", id: 9272 }).sample, "race-draft-rifle-fire");
  assert.equal(samplePlanForEvent({ type: "race-shrapnel-burst", id: 9273 }).sample, "race-layer-break");
  assert.equal(samplePlanForEvent({ type: "race-roulette-absorb", id: 9274 }).sample, "black-hole-teleport");
  assert.equal(samplePlanForEvent({ type: "race-architect-build", id: 9275 }).sample, "forge-item-pickup");
  assert.equal(samplePlanForEvent({ type: "race-snowball-drain", id: 9272 }).sample, "orb-collision");
  assert.equal(samplePlanForEvent({ type: "race-countdown-blast", id: 928 }).sample, "critical-hit");
  assert.equal(samplePlanForEvent({ type: "race-critical-hit", id: 929 }).sample, "critical-hit");
  const sniperSprite = new URL("../assets/generated/orb-race-simple-20260731/final/sniper-weapons.png", import.meta.url);
  assert.ok(existsSync(sniperSprite), "Sniper's generated rifle and ammo sheet should exist");
  assert.deepEqual([...readFileSync(sniperSprite).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], "Sniper's generated weapon sheet should be a PNG");
  const snowballSprite = new URL("../assets/generated/orb-race-simple-20260731/final/snowball-orb.png", import.meta.url);
  assert.ok(existsSync(snowballSprite), "Snowball's generated orb asset should exist");
  assert.deepEqual([...readFileSync(snowballSprite).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], "Snowball's generated orb should be a PNG");
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "fibonacci", surface: "number-line", id: 902 }).sample,
    "race-math-bounce",
  );
  assert.equal(
    samplePlanForEvent({
      type: "race-bounce",
      raceOrbId: "sticky",
      raceAbilityIds: ["sticky", "fibonacci"],
      surface: "number-line",
      id: 9021,
    }).sample,
    "race-math-bounce",
    "a borrowed Fibonacci ability should route through Fibonacci's existing bounce audio",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "fibonacci", surface: "number-line", id: 903 }).maxDuration,
    1,
    "the choir math cue should use only its first second",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "x-power", surface: "number-line", id: 904 }).sample,
    "race-math-power",
    "X-to-the-X should use the power-math guitar cue",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "quadratic", surface: "number-line", id: 905 }).sample,
    "race-math-power",
    "Quadratic should use the power-math guitar cue",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "factorial", surface: "number-line", id: 906 }).sample,
    "race-math-power",
    "Factorial should use the power-math guitar cue",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "sylvester", surface: "number-line", id: 9061 }).sample,
    "race-math-power",
    "Sylvester should use the strong power-math cue",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "tetration", surface: "number-line", id: 9062 }).sample,
    "race-math-power",
    "Tetration should use the strong power-math cue",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "square-root", surface: "number-line", id: 90621 }).sample,
    "race-math-power",
    "Square Root should use the strong power-math cue",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-scissor-split", raceOrbId: "scissor", id: 90622 }).sample,
    "weapon-hit",
    "Scissor splits should use the sword-slice cue",
  );
  assert.equal(samplePlanForEvent({ type: "race-hacker-start", id: 9063 }), null, "Hacker audio waits for a completed hack");
  assert.equal(samplePlanForEvent({ type: "race-hacker-result", id: 9064 }).sample, "race-lag-glitch");
  assert.equal(
    samplePlanForEvent({ type: "race-hacker-copy-spawn", copiedOrbId: "sniper", id: 9065 }).sample,
    "race-draft-rifle-fire",
    "Copied weapon orbs should use the source orb's weapon cue",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-hacker-child-bounce", childOrbId: "fibonacci", surface: "number-line", id: 9066 }).sample,
    "race-math-bounce",
    "Copied children should route bounce audio through their source orb",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-hacker-hydrogen-bomb-spawn", id: 9067 }),
    null,
    "Hydrogen child spawn should not layer a one-shot over its looped siren",
  );
  const powerPlan = samplePlanForEvent({ type: "race-bounce", raceOrbId: "x-power", surface: "number-line", id: 907 });
  assert.equal(powerPlan.playbackRate, 1);
  assert.ok(powerPlan.gain >= RACE_MATH_POWER_GAIN * 0.95, "power-math guitar should use the boosted gain");
  assert.equal(powerPlan.maxDuration, 1, "power-math guitar should stay capped at the first second");
  assert.equal(powerPlan.priorityEffects, true, "power-math guitar should use the priority effects bus");
  assert.equal(powerPlan.duckNonAnnouncer, undefined, "power-math guitar should leave non-announcer audio unducked");
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "phi", surface: "number-line", id: 908 }).sample,
    "race-math-bounce",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "x-squared", surface: "number-line", id: 909 }).sample,
    "orb-collision",
    "X² should keep the standard bounce sample",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "grower", surface: "number-line", id: 910 }).sample,
    "orb-collision",
    "non-math racers should keep the standard bounce sample",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "fibonacci", surface: "top-wall", id: 911 }).sample,
    "orb-collision",
    "math orbs should use the standard sample on top-wall bounces",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-bounce", raceOrbId: "phi", surface: "vertical-wall", id: 912 }).sample,
    "orb-collision",
    "math orbs should use the standard sample on side-wall bounces",
  );
  assert.equal(samplePlanForEvent({ type: "race-ying-yang-switch", mode: "speed", id: 913 }).offset, 0);
  assert.equal(samplePlanForEvent({ type: "race-ying-yang-switch", mode: "damage", id: 914 }).offset, 0.5);
  assert.equal(samplePlaybackCountForEvent({ type: "race-bounce", orbiterHits: 3 }), 4, "Orbital should play one bounce sound per parent/satellite contact");
  assert.equal(
    samplePlaybackCountForEvent({
      type: "race-bounce",
      raceOrbId: "orbital",
      orbitalSatelliteContact: true,
      orbiterHits: 0,
      soundInstance: 7,
    }),
    1,
    "each visible Orbital satellite contact should use one standard bounce sample",
  );

  const consumedBounceInstances = [];
  const consumeAudio = new CombatAudio({ fetcher: null });
  consumeAudio.play = (event) => {
    consumedBounceInstances.push(event.soundInstance);
    return true;
  };
  consumeAudio.consume([
    { id: 917, type: "race-bounce", fighterId: "fighter-0", orbiterHits: 0, soundInstance: 7 },
    { id: 918, type: "race-bounce", fighterId: "fighter-0", orbiterHits: 0, soundInstance: 8 },
  ]);
  assert.deepEqual(
    consumedBounceInstances,
    [7, 8],
    "Orbital satellite bounce events should preserve unique sound instances through audio consumption",
  );

  const scheduled = [];
  const destinations = [];
  const makeParam = (value = 1, sink = scheduled) => ({
    value,
    setValueAtTime(...args) { sink.push(["setValueAtTime", ...args]); },
    linearRampToValueAtTime(...args) { sink.push(["linearRampToValueAtTime", ...args]); },
    cancelScheduledValues(...args) { sink.push(["cancelScheduledValues", ...args]); },
    setTargetAtTime(...args) { sink.push(["setTargetAtTime", ...args]); },
  });
  const fakePowerContext = {
    state: "running",
    currentTime: 8,
    createBufferSource() {
      return {
        playbackRate: { value: 1 },
        connect(destination) { destinations.push(destination); },
        start() {},
        stop() {},
      };
    },
    createGain() {
      return { gain: makeParam(), connect(destination) { destinations.push(destination); } };
    },
  };
  const announcerGain = { gain: makeParam(), name: "announcer" };
  const priorityEffects = { name: "priority-effects" };
  const nonAnnouncerScheduled = [];
  const powerAudio = new CombatAudio({ fetcher: null });
  powerAudio.context = fakePowerContext;
  powerAudio.categoryGains.announcer = announcerGain;
  powerAudio.priorityEffectsGain = priorityEffects;
  powerAudio.nonAnnouncerGain = { gain: makeParam(1, nonAnnouncerScheduled) };
  powerAudio.sampleBuffers.set("race-math-power", { duration: 1.35 });
  assert.equal(
    powerAudio.play({ type: "race-bounce", raceOrbId: "x-power", surface: "number-line", id: 915 }),
    true,
    "the boosted power-math sample should play when loaded",
  );
  assert.ok(destinations.includes(priorityEffects), "the guitar should route to the priority effects bus");
  assert.equal(nonAnnouncerScheduled.length, 0, "the power-math hit should not duck the non-announcer bus");
  assert.equal(
    announcerGain.gain.value,
    1,
    "the power-math hit should not change the announcer gain",
  );
  fakePowerContext.currentTime = 8.2;
  assert.equal(
    powerAudio.play({ type: "race-bounce", raceOrbId: "x-power", surface: "number-line", id: 916 }),
    true,
    "repeated power-math hits should remain rate-limited but playable",
  );
  assert.equal(nonAnnouncerScheduled.length, 0, "repeated power-math hits should keep the non-announcer bus unducked");
  assert.equal(samplePlanForEvent({ type: "backstab", id: 900 }), null, "backstabs should not have an audio plan");
  assert.ok(samplePlanForEvent({ type: "world-cup-card-hit", id: 901 }).gain >= 1.5, "card hits should use the critical-hit mix");
  assert.ok(samplePlanForEvent({ type: "world-cup-ball-hit", id: 902 }).gain >= 1.5, "homing ball hits should use the critical-hit mix");
  assert.equal(
    samplePlanForEvent({ type: "world-cup-pickup", countryId: "france", id: 903 }).sample,
    "france-world-cup-pickup",
  );
  assert.equal(samplePlanForEvent({ type: "world-cup-ball-use", countryId: "france", id: 904 }), null);
  assert.equal(
    samplePlanForEvent({ type: "world-cup-pickup", countryId: "norway", id: 905 }).sample,
    "norway-world-cup-action",
  );
  assert.equal(
    samplePlanForEvent({ type: "world-cup-ball-use", countryId: "norway", id: 906 }).sample,
    "norway-world-cup-action",
  );
  assert.equal(
    samplePlanForEvent({ type: "world-cup-pickup", countryId: "usa", id: 907 }).sample,
    "usa-world-cup-action",
  );
  assert.equal(
    samplePlanForEvent({ type: "world-cup-ball-use", countryId: "usa", id: 908 }).sample,
    "usa-world-cup-action",
  );
  assert.equal(
    samplePlanForEvent({ type: "world-cup-pickup", countryId: "england", id: 909 }).sample,
    "england-world-cup-action",
  );
  assert.equal(
    samplePlanForEvent({ type: "world-cup-ball-use", countryId: "england", id: 910 }).sample,
    "england-world-cup-action",
  );
  assert.equal(
    samplePlanForEvent({ type: "world-cup-pickup", countryId: "argentina", id: 911 }).sample,
    "argentina-world-cup-action",
  );
  assert.equal(
    samplePlanForEvent({ type: "world-cup-ball-use", countryId: "argentina", id: 912 }).sample,
    "argentina-world-cup-action",
  );
  assert.equal(
    samplePlanForEvent({ type: "world-cup-pickup", countryId: "portugal", id: 913 }).sample,
    "portugal-world-cup-pickup",
  );
  assert.equal(samplePlanForEvent({ type: "world-cup-ball-use", countryId: "portugal", id: 914 }), null);
  assert.equal(
    samplePlanForEvent({ type: "world-cup-pickup", countryId: "spain", id: 915 }).sample,
    "spain-world-cup-action",
  );
  assert.ok(
    samplePlanForEvent({ type: "world-cup-pickup", countryId: "spain", id: 915 }).gain >= 4.2,
    "Spain pickup should be dramatically louder than the default World Cup pickup mix",
  );
  assert.ok(
    samplePlanForEvent({ type: "world-cup-pickup", countryId: "spain", id: 915 }).gain >= 8.5,
    "Spain pickup should now run at roughly 10x the original pickup gain",
  );
  assert.equal(
    samplePlanForEvent({ type: "world-cup-ball-use", countryId: "spain", id: 916 }).sample,
    "spain-world-cup-action",
  );
  assert.equal(
    samplePlanForEvent({ type: "knockout", gameplayMode: "world-cup", id: 917 }).sample,
    "world-cup-ko",
  );
  assert.equal(
    samplePlanForEvent({ type: "victory", gameplayMode: "world-cup", id: 918 }),
    null,
    "World Cup victory must not layer the legacy match-finale cue over the replacement KO clip",
  );
  assert.equal(
    samplePlanForEvent({ type: "victory", gameplayMode: "classic", id: 919 }),
    null,
    "classic battles should not layer a finale cue over the replacement KO clip",
  );
  assert.equal(samplePlanForEvent({ type: "world-cup-ball-use", id: 920 }), null);
  assert.equal(samplePlanForEvent({ type: "race-meteor-horn", id: 921 }).sample, "meteor-horn");
  assert.equal(samplePlanForEvent({ type: "race-meteor-strike", id: 922 }).sample, "meteor-strike");
  assert.equal(samplePlanForEvent({ type: "race-meteor-pass", id: 923 }).sample, "meteor-strike");
  const first = samplePlanForEvent({ type: "weapon-hit", id: 42, x: 912 });
  const repeat = samplePlanForEvent({ type: "weapon-hit", id: 42, x: 912 });
  const varied = samplePlanForEvent({ type: "weapon-hit", id: 43, x: 912 });
  assert.deepEqual(first, repeat, "sample playback variation should be deterministic");
  assert.notEqual(first.playbackRate, varied.playbackRate);
  assert.ok(first.pan > 0);
  assert.ok(MATCH_FINALE_RECORDING_TAIL_MS >= 900, "the recording tail should leave a brief readable winner hold");
  assert.ok(MATCH_FINALE_RECORDING_TAIL_MS < MATCH_FINALE_DURATION_SECONDS * 1000, "the recording tail should not linger after gameplay ends");
  assert.equal(samplePlanForEvent({ type: "knockout" }).sample, "world-cup-ko");
  assert.equal(samplePlanForEvent({ type: "knockout", gameplayMode: "world-cup" }).sample, "world-cup-ko");
  for (const type of ["volta-bolt-hit", "burn-applied", "poison-applied", "hailstorm-hit"]) {
    assert.equal(samplePlanForEvent({ type }), null, `${type} must not use a sword-derived sample`);
  }
}

{
  const fetched = [];
  const loaded = await loadSampleAssets({
    manifest: {
      hit: SAMPLE_ASSETS["weapon-hit"],
      collision: SAMPLE_ASSETS["orb-collision"],
      pickup: SAMPLE_ASSETS["forge-item-pickup"],
      worldCupKo: SAMPLE_ASSETS["world-cup-ko"],
      rush: SAMPLE_ASSETS["aegis-rush"],
    },
    baseUrl: "/audio/",
    fetcher: async (url) => {
      fetched.push(url);
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(1) };
    },
    decode: async (data) => ({ duration: data.byteLength }),
  });
  assert.deepEqual(fetched.sort(), [
    `/audio/aegis-surge.mp3?v=${SAMPLE_ASSET_VERSION}`,
    `/audio/fantasy-sword-hit.mp3?v=${SAMPLE_ASSET_VERSION}`,
    `/audio/forge-item-pickup.mp3?v=${SAMPLE_ASSET_VERSION}`,
    `/audio/orb-collision-pop.mp3?v=${SAMPLE_ASSET_VERSION}`,
    `/audio/world-cup-ko.wav?v=${SAMPLE_ASSET_VERSION}`,
  ]);
  assert.equal(loaded.buffers.size, 5);
  assert.deepEqual(loaded.failures, []);
}

{
  const first = soundPlanForEvent({ type: "weapon-hit", id: 42 });
  const repeat = soundPlanForEvent({ type: "weapon-hit", id: 42 });
  const varied = soundPlanForEvent({ type: "weapon-hit", id: 43 });
  assert.deepEqual(first, repeat, "audio variation should be derived from deterministic event IDs");
  assert.notDeepEqual(first, varied);
  assert.equal(first.category, "effects");
  assert.ok(first.layers.length >= 2);
  assert.ok(first.noise?.volume > 0, "weapon impacts should include a filtered noise transient");
  assert.ok(soundPlanForEvent({ type: "weapon-hit", id: 42, x: 48 }).pan < 0);
  assert.ok(soundPlanForEvent({ type: "weapon-hit", id: 42, x: 912 }).pan > 0);
  const wallBounce = soundPlanForEvent({ type: "wall-hit", id: 78, x: 912 });
  const bodyBounce = soundPlanForEvent({ type: "impact", id: 79, x: 48 });
  assert.equal(wallBounce.signature, "resonant-wall-bounce");
  assert.equal(bodyBounce.signature, "orb-body-bounce");
  assert.equal(soundPlanForEvent({ type: "world-cup-card-hit", id: 80 }).signature, "referee-card-impact");
  assert.equal(
    soundPlanForEvent({ type: "orb-race-tournament-zoom", gameplayMode: "orb-race", id: 81 }).signature,
    "tournament-matchup-zoom",
  );
  assert.equal(
    samplePlanForEvent({ type: "race-berserker-horn", id: 81 }).sample,
    "meteor-horn",
    "Berserker’s full-rage cue should reuse the Meteor horn sample",
  );
  assert.ok(wallBounce.layers.length >= 4, "wall bounces should have a fuller resonant profile");
  assert.ok(bodyBounce.layers.length >= 4, "orb collisions should have a punchier layered transient");
  assert.ok(bodyBounce.noises.length >= 3, "orb collisions should have body plus bright texture");
  assert.ok(Math.max(...wallBounce.layers.map((layer) => layer.volume)) > 0.045, "wall bounce should be louder than the old tap");
  assert.ok(Math.max(...bodyBounce.layers.map((layer) => layer.volume)) > 0.065, "orb body bounce should cut through combat audio");
  assert.ok(wallBounce.rateLimit > 0.032, "dense wall bounces should be smoothed");
}

{
  assert.match(soundPlanForEvent({ type: "weapon-hit", fighterType: "sword", id: 100 }).signature, /forged-edge/);
  for (const fighterType of classes) {
    const plan = soundPlanForEvent({ type: "weapon-hit", fighterType, id: 500 });
    assert.ok(plan.layers.every((layer) => !["square", "sawtooth"].includes(layer.wave)));
  }
  assert.equal(
    soundPlanForEvent({ type: "collision-hit", fighterType: "aegis", id: 22 }).signature,
    "body-ram+viking-ram",
  );
  assert.equal(
    soundPlanForEvent({ type: "aegis-rush", fighterType: "aegis", id: 23 }).signature,
    "berserker-rush",
  );
  assert.equal(announcerCueForEvent({ type: "forge-overtime" }), "overtime");
  assert.equal(announcerCueForEvent({ type: "knockout" }), null);
  assert.equal(soundPlanForEvent({ type: "knockout" }), null);
  assert.equal(announcerCueForEvent({ type: "victory", winnerType: "fire" }), null);
  assert.equal(announcerCueForEvent({ type: "victory", winnerType: "ice" }), null);
  assert.equal(announcerCueForEvent({ type: "victory", winnerType: "aegis" }), null);
  assert.equal(announcerCueForEvent({ type: "victory", winnerType: "unknown" }), null);
}

{
  assert.ok(PRESENTATION_TIMING.battle - PRESENTATION_TIMING.matchup >= 2);
  let timeline = createPresentationTimeline(true);
  const cues = [];
  for (let index = 0; index < Math.ceil((PRESENTATION_TIMING.battle + 0.1) / 0.1); index += 1) {
    const advanced = advancePresentationTimeline(timeline, 0.1);
    timeline = advanced.state;
    cues.push(...advanced.cues);
  }
  assert.deepEqual(cues, ["matchup"]);
  assert.equal(timeline.phase, "battle");
  assert.equal(new Set(cues).size, cues.length, "intro cues must fire once per state transition");
}

{
  const missing = await loadAnnouncerAssets({
    manifest: { three: ANNOUNCER_ASSETS.three, fight: ANNOUNCER_ASSETS.fight },
    fetcher: async () => ({ ok: false, arrayBuffer: async () => new ArrayBuffer(0) }),
    decode: async () => {
      throw new Error("decode should not run for missing files");
    },
  });
  assert.equal(missing.buffers.size, 0);
  assert.deepEqual(missing.failures.sort(), ["fight", "three"]);
}

{
  const fetched = [];
  const loaded = await loadAnnouncerAssets({
    manifest: { prompt: ANNOUNCER_ASSETS["pick-your-winner"] },
    baseUrl: "/announcer/",
    cacheKey: "fresh-voice",
    fetcher: async (url) => {
      fetched.push(url);
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(1) };
    },
    decode: async (data) => ({ duration: data.byteLength }),
  });
  assert.deepEqual(fetched, ["/announcer/wise/pick-your-winner.wav?v=fresh-voice"]);
  assert.equal(loaded.buffers.size, 1);
}

{
  const sim = createSimulation({ count: 2, classes: ["fire", "aegis"], seed: 23 });
  for (let step = 0; step < 12 / dt && !sim.events.some((event) => ["weapon-hit", "collision-hit"].includes(event.type)); step += 1) {
    stepSimulation(sim, dt);
  }
  const contact = sim.events.find((event) => ["weapon-hit", "collision-hit"].includes(event.type));
  assert.ok(contact?.fighterType, "combat events should identify the responsible fighter type");
  assert.ok(Number.isFinite(contact?.x) && Number.isFinite(contact?.y));
}

{
  class FakeMediaRecorder {
    static isTypeSupported(value) {
      return value === "video/mp4";
    }
  }
  assert.equal(supportedRecordingMime(FakeMediaRecorder), "video/mp4");
  assert.equal(supportedRecordingMime(class {
    static isTypeSupported(value) {
      return value.startsWith("video/webm");
    }
  }), "video/webm;codecs=vp9,opus", "WebM-only browsers should still produce a correctly labeled downloadable recording");
  const recorder = new RecorderStateMachine();
  assert.equal(recorder.transition("start"), RECORDER_STATES.RECORDING);
  assert.equal(recorder.transition("stop"), RECORDER_STATES.STOPPING);
  assert.equal(recorder.transition("complete"), RECORDER_STATES.PREVIEW);
  assert.equal(recorder.transition("reset"), RECORDER_STATES.IDLE);
  assert.throws(() => recorder.transition("complete"));
}

{
  let now = 1_000;
  let objectUrlBlob = null;
  const states = [];

  class FakeMediaRecorder {
    static last = null;

    static isTypeSupported(value) {
      return value === "video/mp4;codecs=avc1.42E01E,mp4a.40.2";
    }

    constructor(stream, options) {
      this.stream = stream;
      this.options = options;
      this.state = "inactive";
      this.listeners = new Map();
      this.startArguments = null;
      FakeMediaRecorder.last = this;
    }

    addEventListener(type, listener) {
      this.listeners.set(type, listener);
    }

    start(...args) {
      this.startArguments = args;
      this.state = "recording";
    }

    stop() {
      this.state = "inactive";
      this.listeners.get("dataavailable")?.({
        data: new Blob(["complete-battle-payload"], { type: this.options.mimeType }),
      });
      this.listeners.get("stop")?.();
    }
  }

  const captureStream = {
    fps: 0,
    tracks: [],
    addTrack(track) {
      this.tracks.push(track);
    },
  };
  const audioTrack = { kind: "audio" };
  const recorder = new SocialBattleRecorder(
    { captureStream: (fps) => Object.assign(captureStream, { fps }) },
    {
      unlock: async () => true,
      getRecordingStream: () => ({ getAudioTracks: () => [audioTrack] }),
    },
    (state, result) => states.push({ state, result }),
    {
      MediaRecorderClass: FakeMediaRecorder,
      createObjectURL: (blob) => {
        objectUrlBlob = blob;
        return "blob:complete-battle";
      },
      revokeObjectURL() {},
      now: () => now,
    },
  );

  await recorder.start({ fps: 30 });
  assert.ok(captureStream.tracks.includes(audioTrack), "recordings should retain the Web Audio track");
  assert.deepEqual(
    FakeMediaRecorder.last.startArguments,
    [],
    "MediaRecorder must start without a timeslice so the browser writes one complete MP4 segment",
  );
  now = 76_000;
  recorder.stop();
  assert.equal(recorder.machine.state, RECORDER_STATES.PREVIEW);
  assert.equal(recorder.result().duration, 75);
  assert.equal(recorder.result().url, "blob:complete-battle");
  assert.equal(recorder.result().mimeType, "video/mp4;codecs=avc1.42e01e,mp4a.40.2");
  assert.equal(await objectUrlBlob.text(), "complete-battle-payload");
  assert.deepEqual(states.map(({ state }) => state), [
    RECORDER_STATES.RECORDING,
    RECORDER_STATES.STOPPING,
    RECORDER_STATES.PREVIEW,
  ]);
}

{
  let now = 2_000;
  class WebmMediaRecorder {
    static isTypeSupported(value) {
      return value === "video/webm;codecs=vp9,opus";
    }

    constructor(stream, options) {
      this.stream = stream;
      this.options = options;
      this.state = "inactive";
      this.listeners = new Map();
    }

    addEventListener(type, listener) {
      this.listeners.set(type, listener);
    }

    start() {
      this.state = "recording";
    }

    stop() {
      this.state = "inactive";
      this.listeners.get("dataavailable")?.({
        data: new Blob(["webm-battle-payload"], { type: this.options.mimeType }),
      });
      this.listeners.get("stop")?.();
    }
  }
  const recorder = new SocialBattleRecorder(
    { captureStream: () => ({ addTrack() {} }) },
    { getRecordingStream: () => ({ getAudioTracks: () => [] }) },
    () => {},
    {
      MediaRecorderClass: WebmMediaRecorder,
      createObjectURL: () => "blob:webm-battle",
      revokeObjectURL() {},
      now: () => now,
    },
  );
  await recorder.start({
    tournament: {
      scope: "whole-tournament",
      filename: "orb-foundry-tournament-4-champion.mp4",
      matchIds: ["round-1-match-1", "round-2-match-1"],
    },
  });
  now = 4_000;
  recorder.stop();
  assert.equal(recorder.result().mimeType, "video/webm;codecs=vp9,opus");
  assert.equal(recorder.result().filename, "orb-foundry-tournament-4-champion.webm");
}

{
  const settings = normalizeSettings({
    count: 2,
    classes: ["fire", "venom"],
    seed: 90210,
    social: { enabled: true, format: "square", fps: 60, highlightMode: false, showWinProbability: false },
    features: {
      screenShake: false,
      videoRecording: false,
      flashReduction: true,
    },
  }, classes);
  const restored = decodeSettings(encodeSettings(settings, classes), classes);
  assert.deepEqual(restored, settings, "social settings and developer overrides should survive shared URLs");
}

{
  const name = recordingFilename({
    fighters: [{ name: "HEX" }, { name: "GRAVIS" }],
    seed: 2406,
    date: new Date("2026-06-15T00:00:00Z"),
  });
  assert.equal(name, "orb-foundry-hex-vs-gravis-seed-2406-2026-06-15.mp4");
}

console.log("social tests passed");
