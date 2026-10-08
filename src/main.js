import {
  CLASS_DEFS,
  createSimulation,
  raceLaserIntervalLevelFor,
  raceCommanderDronePosition,
  stepSimulation,
} from "./simulation.js?v=20261008-purple-sun-title1";
import {
  CombatAudio,
  MATCH_FINALE_RECORDING_TAIL_MS,
  raceTargetAnnouncerCueFor,
} from "./audio.js?v=20261008-purple-sun-title1";
import { SocialBattleRenderer } from "./social-renderer.js?v=20261008-purple-sun-title1";
import {
  RECORDER_STATES,
  SocialBattleRecorder,
  TOURNAMENT_RECORDING_SCOPES,
  TournamentRecordingCoordinator,
  tournamentRecordingShouldContinueAfterPreview,
} from "./recorder.js?v=20260813-orb-race-tournament-recorder2";
import {
  SOCIAL_FORMATS,
  buildHypeScore,
  buildWinProbability,
  createCaption,
  detectHighlight,
  impactPresentationForEvent,
  normalizeSocialOptions,
  presentationPauseMs,
  recordingFilename,
} from "./social.js?v=20261008-purple-sun-title1";
import {
  BALANCE_KEYS,
  CLASSIC_DEFAULT_ORB_SCALE,
  CLASSIC_ORB_SCALE_OPTIONS,
  CLASSIC_SPEED_MODES,
  RACE_TOURNAMENT_BRACKET_SIZES,
  RACE_TOURNAMENT_LANDSCAPE_LAYER_COUNTS,
  RACE_TOURNAMENT_RECORDING_SCOPES,
  RACE_TOURNAMENT_SEEDING_MODES,
  classicOrbOptionDefaults,
  createDefaultSettings,
  isBalanceModified,
  normalizeClassicOrbOptions,
  normalizeSettings,
  raceTournamentRoundIds,
  sanitizeBalance,
  settingsFromUrl,
  settingsToUrl,
  validateRaceTournamentSettings,
} from "./config.js?v=20261008-purple-sun-title1";
import {
  buildOrbRaceTournamentLayerPreset,
  advanceOrbRaceTournamentPresentation,
  createOrbRaceTournament,
  deserializeOrbRaceTournament,
  prepareOrbRaceTournamentMatchRecording,
  serializeOrbRaceTournament,
  snapshotOrbRaceTournament,
} from "./orb-race-tournament.js?v=20260812-orb-race-tournament-pan1000-hold1750-committed1";
import { ARENA_THEMES, ORB_PROFILES, ORB_SPRITE_PROFILES, THEME_IDS, themeById } from "./presentation.js?v=20260811-classic-health-reactor-batman-fairy-zeus-frost3";
import {
  advancePresentationTimeline,
  createPresentationTimeline,
} from "./presentation-timeline.js?v=20260625-orb-polish2";
import {
  tournamentBracketLayout,
  tournamentCameraTransform,
} from "./orb-race-tournament-presentation.js?v=20260812-orb-race-tournament-intro-clock4-focus3-tournament64focus1";
import { WORLD_CUP_COUNTRIES, WORLD_CUP_COUNTRY_IDS, WORLD_CUP_MODE, worldCupCombatStats } from "./world-cup.js?v=20260703-world-cup-countries3";
import {
  ORB_RACERS,
  ORB_RACER_IDS,
  ORB_RACE_COMBO_ABILITIES,
  ORB_RACE_COMBO_ABILITY_IDS,
  ORB_RACE_ARTIST_PAINTINGS,
  ORB_RACE_DEFAULT_LAYERS,
  ORB_RACE_FINAL_LAYER_PRESETS,
  ORB_RACE_LONGFORM_DEFAULT_LAYERS,
  ORB_RACE_LONGFORM_DEFAULT_TARGET,
  ORB_RACE_MAX_LAYER_STRENGTH,
  ORB_RACE_MAX_ORB_COPIES,
  ORB_RACE_MODE,
  ORB_RACE_DEFAULT_SPEED_MODE,
  ORB_RACE_CAGE_DEFAULT_DURATION_SECONDS,
  ORB_RACE_SPEED_MODES,
  buildRaceLayerPreset,
  normalizeRaceLayerCount,
  normalizeRaceLayers,
  normalizeRaceOrbScale,
  normalizeRaceCageDuration,
  normalizeRaceTeamOptions,
  normalizeRaceTeams,
  raceTeamMemberCount,
} from "./orb-race.js?v=20261008-purple-sun-title1";
import {
  CLASSIC_MAX_ORB_COPIES,
  CLASSIC_ORBS,
  classicTeamOutlineColorFor,
  classicTeamMemberCount,
  normalizeClassicOrbCount,
  normalizeClassicOrbHealth,
  normalizeClassicTeamOptions,
  normalizeClassicTeams,
} from "./classic-orbs.js?v=20260812-classic-health-reactor-batman-fairy-zeus-frost-snowball1";

const audio = new CombatAudio();
const validClasses = Object.keys(CLASSIC_ORBS);
const fixedStep = 1 / 120;
const TOURNAMENT_STATIC_BRACKET_DWELL_MS = 0;
const TOURNAMENT_CAMERA_MOTION_MS = 1_000;
const TOURNAMENT_CENTERED_MATCHUP_HOLD_MS = 1_750;
const TOURNAMENT_MATCHUP_ZOOM_DURATION_MS = 2_750;
const TOURNAMENT_INTER_MATCH_PAN_DURATION_MS = 2_750;
const elements = Object.fromEntries(
  [
    "matchStatus", "matchClock", "pauseButton", "setupDialog", "seedInput", "randomSeedButton",
    "launchButton", "soundButton", "copyLinkButton", "balanceButton", "developerButton",
    "hazardPreset", "arenaModifierSelect", "arenaSizeSelect", "arenaShapeSelect", "hazardFieldset", "gameplayModeSelect", "raceLengthPicker", "shortFormRaceButton", "longFormRaceButton", "tournamentRaceButton", "countryFieldset", "countryGrid", "raceOrbFieldset", "raceTeamBuilder", "raceTeamOneGrid", "raceTeamTwoGrid", "raceTournamentPanel", "raceTournamentOptions", "raceTournamentPageIndicator", "raceTournamentWizardPage1", "raceTournamentWizardPage2", "raceTournamentWizardPage3", "raceTournamentWizardNext1", "raceTournamentWizardBack2", "raceTournamentWizardNext2", "raceTournamentWizardBack3", "raceTournamentTitle", "raceTournamentSize", "raceTournamentSeedingMode", "raceTournamentRecordingScope", "raceTournamentPresetSummary", "raceTournamentEntrants", "raceTournamentEntrantCount", "raceTournamentSeedList", "raceTournamentSeedHelp", "raceTournamentRoundSelection", "raceTournamentRoundList", "raceTournamentRecordRoundButton", "raceTournamentRecordTournamentButton", "raceTournamentLayerCount", "raceTournamentFinalLayerHealth", "raceTournamentLayerFields", "raceTournamentSaveButton", "raceTournamentResumeButton", "raceTournamentClearButton", "raceTournamentOpenBracketButton", "raceTournamentRecordMatchButton", "raceTournamentSavedMatch", "raceTournamentSavedMatchLabel", "raceTournamentSavedTitle", "raceTournamentStorageStatus", "raceTournamentBracketPreview", "raceTournamentPortraitPreviewButton", "raceTournamentLandscapePreviewButton", "raceTournamentZoomOut", "raceTournamentZoomReset", "raceTournamentZoomIn", "raceTournamentValidation", "nonTournamentSetupFields", "classicTeamOneGrid", "classicTeamTwoGrid", "raceLayerFields", "raceLayerToolbar", "raceOptionToolbar", "raceLayerCount", "raceFinalLayerHealthLabel", "raceFinalLayerHealth", "raceOrbScale", "raceTargetMessageToggle", "raceTargetAudioToggle", "raceMatchupAudioToggle", "raceTiltedLayerToggle", "raceTiltedLayerIndex", "raceTiltedLayerIndexLabel", "classFieldset", "classicBlackTheme", "classicTeamColors", "developerDialog", "featureToggles", "applyFeaturesButton",
    "balanceDialog", "balanceScope", "balanceControls", "balanceValidation", "balanceResetButton",
    "balanceRandomButton", "balanceExportButton", "balanceImportButton", "balanceImportInput",
    "balanceApplyButton", "menuScreen", "profileScreen", "gameScreen", "orbMenu", "menuPlayButton",
    "menuBalanceButton", "menuDeveloperButton", "menuThemeSelect", "setupThemeSelect", "homeButton",
    "profileBackButton", "profilePlayButton", "profilePreviousButton", "profileNextButton", "profileDots",
    "profileIndex", "profileOrb", "profileEpithet", "profileName", "profileWeapon", "profileAbility",
    "profileBackstory", "profileStrengths", "profileWeaknesses", "profileStats", "profileModes",
    "socialStage", "socialCanvas", "socialRecordingStatus", "socialRecordingDetail",
    "socialRecordingProgress", "socialCancelButton", "socialStopButton", "socialOptions",
    "socialFormatSelect", "socialHighlightMode", "socialWinProbability", "recordingSupportNote", "socialPreviewDialog",
    "socialVideoPreview", "socialVideoMetadata", "socialCaption", "socialRetryButton",
    "socialCopyLinkButton", "socialDownloadButton", "masterVolume", "effectsVolume",
    "ambienceVolume", "musicVolume", "announcerVolume",
  ].map((id) => [id, document.querySelector(`#${id}`)]),
);

const socialRenderer = new SocialBattleRenderer(elements.socialCanvas);
const socialRecorder = new SocialBattleRecorder(elements.socialCanvas, audio, handleRecorderState);
const tournamentRecorder = new TournamentRecordingCoordinator(socialRecorder);
const initialUrlSettings = settingsFromUrl(location.href, validClasses);

let settings = normalizeSettings(initialUrlSettings || createDefaultSettings(), validClasses);
let raceTeamSelectionOrder = settings.raceTeams.map((team) => [...team]);
let raceTournamentSeedOrder = settings.raceTournament?.seedOrder?.slice() || [];
let selectedRaceFormat = settings.raceTournament
  ? "tournament"
  : settings.social.format === "race-landscape" ? "long" : "short";
let tournamentSessionState = null;
let tournamentSessionSettingsKey = null;
let tournamentSelectedMatchId = null;
let tournamentRecordingRequest = null;
let tournamentAdvancePending = false;
let tournamentTransition = null;
let tournamentTransitionTimer = 0;
let tournamentSessionWarning = "";
let tournamentResumeArmed = false;
let tournamentZoomCueKey = null;
let tournamentWizardPage = 1;
let tournamentPreviewMode = "landscape";
let tournamentPreviewZoom = 1;
let tournamentPreviewSourceState = null;
let tournamentPreviewLayout = null;
let tournamentPreviewCameraAnimation = null;
let classicTeamSelectionOrder = settings.classicTeams.map((team) => [...team]);
let fightSpawnSequence = 0;
let sim = createSimulation(simulationSettings({
  spawnSeed: settings.gameplayMode === WORLD_CUP_MODE ? createFightSpawnSeed() : settings.seed,
}));
let paused = false;
let soundEnabled = true;
let lastFrame = performance.now();
let accumulator = 0;
let activeProfileType = validClasses[0];
let setupOrigin = "game";
let socialLastEventId = 0;
let socialPresentation = createSocialPresentationState();
let socialRecordingResult = null;
let socialRaceActionStartedAt = null;
let socialRaceActionEndedAt = null;
let socialRaceMatchupCount = 0;
let raceLayerRenderTimer = 0;

function applyTheme(themeId) {
  const theme = themeById(themeId);
  settings.theme = theme.id;
  document.body.dataset.theme = theme.id;
  const cssTokens = {
    "--page-bg": theme.page,
    "--page-bg-alt": theme.pageAlt,
    "--surface": theme.surface,
    "--surface-2": theme.surfaceAlt,
    "--text": theme.text,
    "--muted": theme.muted,
    "--line": theme.line,
    "--line-bright": theme.wall,
    "--gold": theme.accent,
  };
  Object.entries(cssTokens).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
  socialRenderer.setTheme(theme.id);
  elements.menuThemeSelect.value = theme.id;
  elements.setupThemeSelect.value = theme.id;
}

function buildThemeSelectors() {
  const options = THEME_IDS.map((id) => `<option value="${id}">${ARENA_THEMES[id].name}</option>`).join("");
  elements.menuThemeSelect.innerHTML = options;
  elements.setupThemeSelect.innerHTML = options;
}

function buildCountryControls() {
  elements.countryGrid.innerHTML = WORLD_CUP_COUNTRY_IDS.map((id) => {
    const country = WORLD_CUP_COUNTRIES[id];
    return `<label class="country-option" style="--country-color:${country.color};--country-accent:${country.accent}">
      <input type="checkbox" name="countryType" value="${id}" />
      <img src="${country.flag}" alt="" />
      <strong>${country.name}</strong>
    </label>`;
  }).join("");
}

const RACE_PICKER_ASSETS = Object.freeze({
  boomerang: new URL("../assets/race/boomerang-generated.png", import.meta.url).href,
  magnet: new URL("../assets/race/magnet-generated.png", import.meta.url).href,
  jackpot: new URL("../assets/race/jackpot-slot-machine.png", import.meta.url).href,
  ricochet: new URL("../assets/race/generated/ricochet-weapons.png", import.meta.url).href,
  sawblade: new URL("../assets/race/generated/sawblade-weapons.png", import.meta.url).href,
  meteor: new URL("../assets/race/generated/meteor-orb-source.png", import.meta.url).href,
  "black-hole": new URL("../assets/race/generated/black-hole-orb.png", import.meta.url).href,
  godzilla: new URL("../assets/race/generated/godzilla/head.png", import.meta.url).href,
  crusher: new URL("../assets/generated/orb-race-expansion-20260729/final/crusher-rock.png", import.meta.url).href,
});

function classicOrbMark(type) {
  const name = CLASSIC_ORBS[type]?.name || type;
  const words = name.split(/\s+/).filter(Boolean);
  return words.length > 1
    ? words.slice(0, 2).map((word) => word[0]).join("")
    : name.replace(/[^a-z0-9]/gi, "").slice(0, 2);
}

function classicPreviewStyle(type) {
  const def = CLASSIC_ORBS[type];
  const sprite = ORB_SPRITE_PROFILES[type]?.src;
  return [
    `--orb-color:${def.color}`,
    `--orb-mark:"${classicOrbMark(type)}"`,
    sprite ? `--orb-sprite:url('${sprite}')` : "",
  ].filter(Boolean).join(";");
}

function restoreSetupDialogScroll(panelScrollTop = null) {
  const dialog = elements.setupDialog;
  const panel = dialog?.querySelector(".setup-panel");
  if (!dialog || !panel) return;
  const restore = () => {
    dialog.scrollTop = 0;
    if (Number.isFinite(panelScrollTop)) panel.scrollTop = panelScrollTop;
  };
  restore();
  requestAnimationFrame(restore);
}

function buildRaceOrbControls() {
  const optionMarkup = (id, teamIndex) => {
    const racer = ORB_RACERS[id];
    const detail = id === "duplicator" ? "DUPES EVERY 12 NUMBER-LINE BOUNCES"
      : id === "speed" ? "+SPEED +DAMAGE EVERY BOUNCE"
        : id === "orbital" ? "+1 ORBITER EVERY BOUNCE"
          : id === "drill" ? "FIRES EVERY 3 SECONDS · SPEED SLOWS EACH BOUNCE"
            : id === "x-squared" ? "BOUNCE DAMAGE SQUARED"
              : id === "fibonacci" ? "FIBONACCI BOUNCE DAMAGE"
                : id === "grower" ? "GROWS EVERY BOUNCE"
                  : id === "lazer" ? "CONSTANT SCALING BEAM"
                    : id === "sticky" ? "STICKS AND DAMAGES THE LINE"
                          : id === "antimatter-bomb" ? "DETONATES EVERY 15 SECONDS, THEN EVERY 5 · DUSTS A LAYER + ORB"
                            : id === "time-bomb" ? "15-SECOND CYCLE · FREEZES OPPONENTS FOR 5 SECONDS"
                              : id === "reality-bomb" ? "SPAWNS A RANDOM TEAM ORB EVERY 5 SECONDS"
                            : id === "tsar-bomb" ? "90-SECOND COUNTDOWN · REACTOR BLAST EVERY 8 SECONDS"
                              : id === "all-in-one" ? "ALL ABILITIES · ×10 PER BOUNCE FOR 5 SECONDS EVERY 15"
                            : id === "breaker" ? "1 DAMAGE · +1% CRIT CHANCE PER BOUNCE · CRITS CLEAR THE ACTIVE LAYER"
                              : id === "square-root" ? "SQUARE-ROOTS THE ACTIVE LAYER EVERY HIT"
                                : id === "progressive" ? "DAMAGE ×5 EVERY 15 SECONDS, THEN EVERY 5"
                                  : id === "random" ? "RANDOM DAMAGE FROM 1 TO X · X +5 PER BOUNCE"
                          : id === "x-power" ? "X TO THE BOUNCE POWER"
                            : id === "super-x-power" ? "X TO THE X · SUPER POWER"
                        : id === "phi" ? "GOLDEN-RATIO DAMAGE"
                          : id === "quadratic" ? "X¹ → X² → X³ EXPONENT"
                            : id === "pi" ? "PI DIGIT MULTIPLIERS · 3, 1, 4, 1…"
                          : id === "flash" ? "+1 SPEED +1 DAMAGE EVERY BOUNCE"
                            : id === "batman" ? "THROWS STACKING BATARANGS EVERY 5 BOUNCES"
                              : id === "boomerang" ? "PIERCES LAYERS · 15-HIT PROJECTILES"
                                : id === "magnet" ? "PULLS TOWARD THE NUMBER LINE"
                                  : id === "mines" ? "DROPS A RAMPING BOMB VOLLEY EVERY 3 SECONDS"
                                    : id === "gravity" ? "GRAVITY RISES EVERY BOUNCE"
                                      : id === "black-hole" ? "SUCTION: WALL NUMBERS · DAMAGE RAMPS +25/USE"
                                      : id === "godzilla" ? "WALKS · TAIL SMACKS · STOMPS · ATOMIC BREATH"
                                      : id === "centy" ? "1% OF LAYER · +0.1% EVERY BOUNCE"
                                      : id === "infinity" ? "INFINITE DAMAGE · POWER-MATH PHYSICS"
                                      : id === "charger" ? "TELEPORT SLAM 3× · INTERVAL SHRINKS EACH BOUNCE"
                                      : id === "bouncer" ? "SPAWNS A TINY BOUNCING WEAPON EVERY SECOND"
                                      : id === "blue-sun" ? "8 CYAN LASERS · +1000 POWER EACH USE"
                            : id === "phase-three-sun" ? "THE SUN · 8 YELLOW LASERS · 2× DAMAGE · GROWS 1.25× EACH USE"
                              : id === "phase-two-sun" ? "ORANGE 8-BEAM SUN · BLUE SUN DAMAGE · 25% FIRE FOR 3S"
                                : id === "trifecta" ? "0 DAMAGE · EVERY 3 LAYER HITS, BLASTS 1/3 OF CURRENT HEALTH"
                                  : id === "gravitator" ? "SLOWLY PULLS THE LAYER · THEN SHUTTLES WALL TO LAYER"
                                        : id === "lucas" ? "LUCAS INTEGER SEQUENCE · 2, 1, 3, 4, 7…"
                                        : id === "professor" ? "RANDOMLY BECOMES A MATH ORB FOR 5 SECONDS"
                                        : id === "purple-sun" ? "SLOWLY TURNS PURPLE · ONE LARGE DOWNWARD BEAM"
                                      : id === "snake" ? "GROWS A TAIL · SPLITS AFTER 20 SEGMENTS"
                                      : id === "vampire" ? "+1% DAMAGE STEAL EVERY BOUNCE"
                                      : id === "cubed" ? "BOUNCE DAMAGE CUBED"
                                      : id === "double" ? "DOUBLES DAMAGE EVERY BOUNCE"
                                      : id === "tripler" ? "TRIPLES DAMAGE EVERY BOUNCE"
                                      : id === "turret" ? "SPAWNS A TURRET EVERY 3 SECONDS · DURATION RAMPS"
                                      : id === "leech" ? "DRAINS THE LINE · HOLD LEVEL RAMPS LIKE STICKY"
                                      : id === "crusher" ? "HEAVIER IMPACTS · CRACKS THE NUMBER WALL"
                                      : id === "berserker" ? "GAINS EXTRA RAGE WHILE BEHIND"
                                      : id === "reactor" ? "CHARGES A MASSIVE BLUE REACTOR BLAST"
                                      : id === "parasite" ? "SPAWNS LINE PARASITES · COOLDOWN RAMPS"
                                      : id === "draftmaster" ? "DRAFTS DAMAGE, PROJECTILE, OR SPEED EVERY 3 SECONDS"
                                      : id === "needle" ? "TINY ORB · +2 DAMAGE · PIERCES THE NEXT LAYER"
                                      : id === "multiplier" ? "+1× DAMAGE EVERY BOUNCE"
                                      : id === "sniper" ? "FIRES ONE RAMPING POWER SHOT EVERY 5 SECONDS"
                                      : id === "snowball" ? "GROWS ON HITS · RESETS SIZE AFTER EACH LAYER"
                                      : id === "countdown" ? "10 HITS TRIGGER A 25× BLAST"
                                      : id === "copycat" ? "COPIES THE STRONGEST OPPONENT +1"
                                      : id === "critical" ? "+5% CRIT CHANCE PER BOUNCE · CRITS DEAL 10×"
                                      : id === "jackpot" ? "3-REEL SLOT · 0.5×, 2×, OR 10× EACH"
                                        : id === "speed-impact" ? "SLOW ARC · 50 DAMAGE +100 / BOUNCE"
                                          : id === "factorial" ? "FACTORIAL BOUNCE DAMAGE"
                                                  : id === "prime" ? "NEXT PRIME DAMAGE EVERY BOUNCE"
                                              : id === "integral" ? "AREA-UNDER-ARC DAMAGE"
                                                  : id === "ricochet" ? "ONE CANNON SHOT · DAMAGE DOUBLES ON EACH WALL"
                                                  : id === "commander" ? "RED BOMB DRONE + BLUE MISSILE DRONE"
                                                  : id === "shrapnel" ? "WALL FRAGMENTS · LAYER-BREAK DEBRIS BURST"
                                                  : id === "roulette" ? "ABSORBS A SEEDED ORB ABILITY AFTER EVERY LAYER"
                                      : id === "architect" ? "BUILDS PHYSICAL RAMPS, BUMPERS, AND PLATFORMS"
                                                    : id === "sawblade" ? "SAWBLADE EVERY 4 BOUNCES"
                                                      : id === "grappler" ? "FIRES A GRAPPLE HOOK · MASSIVE PULL DAMAGE"
                                                        : id === "artists" ? "PAINTS 5-SECOND SUMMONS WITH UNIQUE ATTACKS"
                                                          : id === "pancake" ? "FLIPS · STICKS 1.5 SECONDS · BUTTER METEORS"
                                                            : id === "tree" ? "ROOTS EVERY 5 BOUNCES · DRAINS ALL LAYERS"
                                                              : "TINY METEORS · GIANT METEOR EVERY 15 SECONDS";
    const pickerAsset = RACE_PICKER_ASSETS[id];
    const iconMarkup = id === "mines"
      ? `<span aria-hidden="true">●</span>`
      : pickerAsset
      ? `<img class="race-orb-generated-icon" src="${pickerAsset}" alt="" />`
      : `<span aria-hidden="true">${racer.symbol}</span>`;
    const comboMarkup = ORB_RACE_COMBO_ABILITY_IDS.includes(id)
      ? `<fieldset class="race-combo-options">
          <legend>COMBINE ABILITIES</legend>
          ${ORB_RACE_COMBO_ABILITY_IDS.filter((abilityId) => abilityId !== id).map((abilityId) => {
            const ability = ORB_RACE_COMBO_ABILITIES[abilityId];
            return `<label title="${ability.description}">
              <input type="checkbox" data-race-combo="${abilityId}" data-race-team="${teamIndex}" data-race-orb="${id}" />
              ${ability.label}
            </label>`;
          }).join("")}
        </fieldset>`
      : "";
    return `<div class="race-team-orb" style="--racer-color:${racer.color};--racer-accent:${racer.accent}">
      <label class="race-orb-option">
        <input type="checkbox" name="raceTeamOrb" value="${id}" data-race-team="${teamIndex}" />
        ${iconMarkup}
        <span class="race-orb-copy">
          <strong>${racer.name}</strong>
          <small>${detail}</small>
        </span>
      </label>
      <details class="race-orb-options">
        <summary>ORB OPTIONS</summary>
        <label class="race-orb-count">AMOUNT
          <input type="number" min="1" max="${ORB_RACE_MAX_ORB_COPIES}" value="1" data-race-count data-race-team="${teamIndex}" data-race-orb="${id}" />
        </label>
        <label class="race-orb-size">ORB SIZE
          <select data-race-orb-scale data-race-team="${teamIndex}" data-race-orb="${id}">
            <option value="1">FULL</option>
            <option value="0.75">COMPACT</option>
            <option value="0.55">MINI</option>
          </select>
        </label>
        <label class="race-orb-size">SPEED
          <select data-race-speed-mode data-race-team="${teamIndex}" data-race-orb="${id}">
            ${ORB_RACE_SPEED_MODES.map(({ id: speedModeId, label, description }) => `<option value="${speedModeId}" title="${description}">${label}</option>`).join("")}
          </select>
        </label>
        <label><input type="checkbox" data-race-option="fadingTrails" data-race-team="${teamIndex}" data-race-orb="${id}" /> FADING TRAIL</label>
        <label><input type="checkbox" data-race-option="solidTrails" data-race-team="${teamIndex}" data-race-orb="${id}" /> SOLID TRAIL</label>
        <label><input type="checkbox" data-race-option="scalingDamage" data-race-team="${teamIndex}" data-race-orb="${id}" checked /> SCALING DAMAGE</label>
        <label><input type="checkbox" data-race-option="buffed" data-race-team="${teamIndex}" data-race-orb="${id}" /> BUFFED</label>
        <label><input type="checkbox" data-race-option="caged" data-race-team="${teamIndex}" data-race-orb="${id}" /> CAGED START</label>
        <label class="race-cage-duration">CAGE TIME (S)
          <input type="number" min="0" max="60" step="0.5" value="${ORB_RACE_CAGE_DEFAULT_DURATION_SECONDS}" data-race-cage-duration data-race-team="${teamIndex}" data-race-orb="${id}" />
        </label>
        ${comboMarkup}
      </details>
    </div>`;
  };
  [elements.raceTeamOneGrid, elements.raceTeamTwoGrid].forEach((grid, teamIndex) => {
    grid.innerHTML = ORB_RACER_IDS.map((id) => optionMarkup(id, teamIndex)).join("");
    grid.addEventListener("change", (event) => {
      if (!event.target.matches('input[name="raceTeamOrb"]')) return;
      const panelScrollTop = elements.setupDialog.querySelector(".setup-panel")?.scrollTop ?? 0;
      const order = raceTeamSelectionOrder[teamIndex] || [];
      raceTeamSelectionOrder[teamIndex] = event.target.checked
        ? [...order.filter((orbId) => orbId !== event.target.value), event.target.value]
        : order.filter((orbId) => orbId !== event.target.value);
      const options = event.target.closest(".race-team-orb")?.querySelector("details");
      if (options) options.open = event.target.checked;
      restoreSetupDialogScroll(panelScrollTop);
    });
    grid.querySelectorAll("details.race-orb-options").forEach((details) => {
      details.addEventListener("toggle", () => restoreSetupDialogScroll());
    });
  });
}

function raceTournamentSelectedEntrants() {
  const selected = new Set(
    [...elements.raceTournamentEntrants.querySelectorAll('input[name="raceTournamentEntrant"]:checked')]
      .map((input) => input.value),
  );
  const pickerOrder = [...elements.raceTournamentEntrants.querySelectorAll('input[name="raceTournamentEntrant"]')]
    .map((input) => input.value);
  const ordered = raceTournamentSeedOrder.filter((id) => selected.has(id));
  return [...ordered, ...pickerOrder.filter((id) => selected.has(id) && !ordered.includes(id))];
}

function setTournamentEntrantSelection(ids) {
  const selected = new Set(ids);
  elements.raceTournamentEntrants.querySelectorAll('input[name="raceTournamentEntrant"]').forEach((input) => {
    input.checked = selected.has(input.value);
  });
  raceTournamentSeedOrder = [...ids];
  renderRaceTournamentSeedList();
}

function ensureTournamentEntrantDefaults({ fill = false, trim = false } = {}) {
  if (!elements.raceTournamentEntrants) return;
  const size = Number(elements.raceTournamentSize.value) || RACE_TOURNAMENT_BRACKET_SIZES[1];
  const checked = [...elements.raceTournamentEntrants.querySelectorAll('input[name="raceTournamentEntrant"]:checked')]
    .map((input) => input.value);
  const existingOrder = [
    ...raceTournamentSeedOrder.filter((id) => checked.includes(id)),
    ...checked.filter((id) => !raceTournamentSeedOrder.includes(id)),
  ];
  const ordered = [...existingOrder];
  if (fill && ordered.length < size) {
    for (const id of ORB_RACER_IDS) {
      if (!ordered.includes(id)) ordered.push(id);
      if (ordered.length === size) break;
    }
  }
  const next = trim || fill ? ordered.slice(0, size) : ordered;
  setTournamentEntrantSelection(next);
}

function updateTournamentEntrantCount() {
  if (!elements.raceTournamentEntrantCount) return;
  const size = Number(elements.raceTournamentSize.value) || RACE_TOURNAMENT_BRACKET_SIZES[1];
  elements.raceTournamentEntrantCount.textContent = `${raceTournamentSelectedEntrants().length} / ${size}`;
  elements.raceTournamentEntrantCount.dataset.valid = String(raceTournamentSelectedEntrants().length === size);
}

function tournamentPreviewState() {
  const current = currentTournamentState() || tournamentPreviewSourceState;
  if (current) return current;
  const draft = raceTournamentDraft();
  if (!draft || !validateRaceTournamentSettings(draft).valid) return null;
  const clean = normalizeSettings({
    gameplayMode: ORB_RACE_MODE,
    raceTournament: draft,
  }, validClasses).raceTournament;
  if (!clean) return null;
  try {
    return createOrbRaceTournament({ ...clean, seed: settings.seed });
  } catch {
    return null;
  }
}

function tournamentPreviewMatch(matchId = tournamentSelectedMatchId) {
  const source = tournamentPreviewState();
  if (!source || !matchId) return null;
  return source.rounds.flatMap((round) => round.matches || []).find((match) => match.id === matchId) || null;
}

function syncTournamentMatchAction() {
  if (!elements.raceTournamentSavedMatch) return;
  const match = tournamentPreviewMatch();
  const left = match?.left?.orbId;
  const right = match?.right?.orbId;
  const concrete = Boolean(left && right);
  elements.raceTournamentSavedMatch.hidden = !concrete;
  if (concrete) {
    const leftName = ORB_RACERS[left]?.name || left.toUpperCase();
    const rightName = ORB_RACERS[right]?.name || right.toUpperCase();
    elements.raceTournamentSavedMatchLabel.textContent = `${leftName} VS ${rightName}`;
    elements.raceTournamentSavedMatchLabel.dataset.matchId = match.id;
  }
}

function setTournamentRecordingScope(scope, roundId = null) {
  elements.raceTournamentRecordingScope.value = scope;
  if (scope === "whole-round" && roundId) {
    renderRaceTournamentRoundList([roundId]);
  } else {
    renderRaceTournamentRoundList();
  }
  syncRaceTournamentControls();
}

function raceTournamentDraft() {
  if (elements.gameplayModeSelect.value !== ORB_RACE_MODE || selectedRaceFormat !== "tournament") return null;
  const entrants = raceTournamentSelectedEntrants();
  const layerValues = [...elements.raceTournamentLayerFields.querySelectorAll('input[name="raceTournamentLayerStrength"]')]
    .map((input) => input.value);
  const scope = elements.raceTournamentRecordingScope.value;
  const roundsToRecord = [...elements.raceTournamentRoundList.querySelectorAll('input[name="raceTournamentRound"]:checked')]
    .map((input) => input.value);
  const finalLayerHealth = elements.raceTournamentFinalLayerHealth.value === "custom"
    ? layerValues.at(-1)
    : elements.raceTournamentFinalLayerHealth.value;
  return {
    enabled: true,
    title: elements.raceTournamentTitle.value,
    size: Number(elements.raceTournamentSize.value),
    entrants,
    seedingMode: elements.raceTournamentSeedingMode.value,
    seedOrder: raceTournamentSeedOrder.filter((id) => entrants.includes(id)),
    recordingScope: scope,
    recordingSelection: scope === "each-match"
      ? "match"
      : scope === "whole-tournament" ? "whole-tournament" : "selected-round",
    roundsToRecord,
    landscapeLayerCount: Number(elements.raceTournamentLayerCount.value),
    layerStrengths: layerValues,
    finalLayerHealth,
  };
}

function renderRaceTournamentSeedList() {
  const selectedEntrants = raceTournamentSelectedEntrants();
  raceTournamentSeedOrder = selectedEntrants;
  if (!elements.raceTournamentSeedList) return;
  if (!selectedEntrants.length) {
    elements.raceTournamentSeedList.innerHTML = "<li class=\"race-tournament-empty\">Select entrants to build the seed list.</li>";
    return;
  }
  const labels = Object.fromEntries(selectedEntrants.map((id) => [id, ORB_RACERS[id]?.name || id.toUpperCase()]));
  elements.raceTournamentSeedList.innerHTML = selectedEntrants.map((id, index) => `
    <li class="race-tournament-seed-row" data-tournament-seed-id="${id}">
      <label>
        <span>SEED ${index + 1}</span>
        <select data-tournament-seed data-race-tournament-seed data-tournament-seed-position="${index}" aria-label="Entrant at seed ${index + 1}">
          ${selectedEntrants.map((optionId) => `<option value="${optionId}" ${optionId === id ? "selected" : ""}>${labels[optionId]}</option>`).join("")}
        </select>
      </label>
      <div class="race-tournament-seed-actions">
        <button type="button" class="quiet-button" data-tournament-move="up" data-race-tournament-move="up" aria-label="Move ${labels[id]} up">↑</button>
        <button type="button" class="quiet-button" data-tournament-move="down" data-race-tournament-move="down" aria-label="Move ${labels[id]} down">↓</button>
      </div>
    </li>
  `).join("");
}

function tournamentRoundLabel(id) {
  return String(id || "")
    .replace(/^round-of-(\d+)$/, "ROUND OF $1")
    .replace("quarterfinals", "QUARTERFINALS")
    .replace("semifinals", "SEMIFINALS")
    .replace("championship", "CHAMPIONSHIP")
    .toUpperCase();
}

function renderRaceTournamentRoundList(forcedSelection = null) {
  if (!elements.raceTournamentRoundList) return;
  const ids = raceTournamentRoundIds(Number(elements.raceTournamentSize.value));
  const hadRoundControls = Boolean(elements.raceTournamentRoundList.querySelector('input[name="raceTournamentRound"]'));
  const selected = new Set(
    Array.isArray(forcedSelection)
      ? forcedSelection
      : [...elements.raceTournamentRoundList.querySelectorAll('input[name="raceTournamentRound"]:checked')]
        .map((input) => input.value),
  );
  const scope = elements.raceTournamentRecordingScope.value;
  if (!hadRoundControls && !Array.isArray(forcedSelection) && scope === "whole-round" && ids[0]) {
    selected.add(ids[0]);
  }
  const wholeTournamentMode = scope === "whole-tournament";
  elements.raceTournamentRoundList.innerHTML = ids.map((id) => `
    <label class="race-tournament-round-option">
      <input type="checkbox" name="raceTournamentRound" value="${id}"${wholeTournamentMode || selected.has(id) ? " checked" : ""} />
      <span>${tournamentRoundLabel(id)}</span>
    </label>
  `).join("");

  const selectedRoundMode = scope === "whole-round";
  elements.raceTournamentRecordRoundButton.classList.toggle("active", selectedRoundMode);
  elements.raceTournamentRecordRoundButton.setAttribute("aria-pressed", String(selectedRoundMode));
  elements.raceTournamentRecordTournamentButton.classList.toggle("active", wholeTournamentMode);
  elements.raceTournamentRecordTournamentButton.setAttribute("aria-pressed", String(wholeTournamentMode));
}

function tournamentLayerValues() {
  return [...elements.raceTournamentLayerFields.querySelectorAll('input[name="raceTournamentLayerStrength"]')]
    .map((input) => Number(input.value));
}

function renderRaceTournamentLayerFields(values = null, forcePreset = false) {
  if (!elements.raceTournamentLayerFields) return;
  const scope = elements.raceTournamentRecordingScope.value;
  const count = scope === "each-match"
    ? 3
    : RACE_TOURNAMENT_LANDSCAPE_LAYER_COUNTS.includes(Number(elements.raceTournamentLayerCount.value))
      ? Number(elements.raceTournamentLayerCount.value)
      : 5;
  elements.raceTournamentLayerCount.value = String(count);
  elements.raceTournamentLayerCount.disabled = scope === "each-match";
  const finalHealthValue = elements.raceTournamentFinalLayerHealth.value;
  const finalHealth = finalHealthValue === "custom"
    ? Number(values?.at(-1) || tournamentLayerValues().at(-1) || (scope === "each-match" ? 110 : 10_000))
    : Number(finalHealthValue);
  const current = tournamentLayerValues();
  const source = forcePreset
    ? buildOrbRaceTournamentLayerPreset(count, finalHealth)
    : Array.isArray(values) && values.length === count
    ? values
    : current.length === count ? current : buildOrbRaceTournamentLayerPreset(count, finalHealth);
  const layers = normalizeRaceLayers(source, buildOrbRaceTournamentLayerPreset(count, finalHealth), count);
  elements.raceTournamentLayerFields.innerHTML = layers.map((value, index) => `
    <label>NUMBER WALL ${index + 1}
      <input type="number" name="raceTournamentLayerStrength" min="1" max="1000000000000000000" value="${value}" />
    </label>
  `).join("");
  renderRaceLayerFields(layers);
}

function syncTournamentPresetControls({ forcePreset = false } = {}) {
  if (!elements.raceTournamentRecordingScope) return;
  const scope = elements.raceTournamentRecordingScope.value;
  const landscape = scope !== "each-match";
  elements.raceTournamentRoundSelection.hidden = false;
  renderRaceTournamentRoundList();
  if (scope === "each-match" && elements.raceTournamentFinalLayerHealth.querySelector('option[value="110"]')) {
    elements.raceTournamentFinalLayerHealth.value = "110";
  } else if (scope !== "each-match" && elements.raceTournamentFinalLayerHealth.value === "110") {
    elements.raceTournamentFinalLayerHealth.value = "10000";
  }
  renderRaceTournamentLayerFields(null, forcePreset || scope === "each-match");
  elements.socialFormatSelect.value = landscape ? "race-landscape" : "portrait";
  elements.raceTournamentPresetSummary.textContent = scope === "each-match"
    ? "INDIVIDUAL MATCHUPS · BRACKET INTRO + SHORT RACE + ADVANCEMENT · 1080 × 1920 · 3 SHARED LAYERS"
    : scope === "whole-round"
      ? `SELECTED WHOLE ROUNDS · LONG RACE LANDSCAPE · 1920 × 1080 · ${elements.raceTournamentLayerCount.value} SHARED LAYERS`
      : `WHOLE TOURNAMENT · LONG RACE LANDSCAPE · 1920 × 1080 · ${elements.raceTournamentLayerCount.value} SHARED LAYERS`;
}

const RACE_TOURNAMENT_STORAGE_KEY = "orb-foundry.race-tournament.v1";
const RACE_TOURNAMENT_STORAGE_VERSION = 1;

function currentTournamentSnapshot() {
  const source = currentTournamentState();
  if (!source) return null;
  try {
    return snapshotOrbRaceTournament(source);
  } catch {
    return null;
  }
}

function currentTournamentState() {
  return tournamentSessionState || sim?.raceTournament || null;
}

function readSavedTournament() {
  try {
    const raw = JSON.parse(localStorage.getItem(RACE_TOURNAMENT_STORAGE_KEY) || "null");
    if (!raw || raw.version !== RACE_TOURNAMENT_STORAGE_VERSION) return null;
    const clean = normalizeSettings({
      gameplayMode: ORB_RACE_MODE,
      raceTournament: raw.raceTournament,
    }, validClasses).raceTournament;
    if (!clean) return null;
    const restoredState = raw.tournamentState
      ? deserializeOrbRaceTournament(raw.tournamentState)
      : null;
    return { ...raw, raceTournament: clean, tournamentState: restoredState };
  } catch {
    return null;
  }
}

function saveTournamentToBrowser() {
  const draft = raceTournamentDraft();
  const validation = validateRaceTournamentSettings(draft);
  if (!draft || !validation.valid) {
    elements.raceTournamentStorageStatus.textContent = validation.message || "Complete the tournament preset before saving.";
    return;
  }
  const clean = normalizeSettings({ gameplayMode: ORB_RACE_MODE, raceTournament: draft }, validClasses).raceTournament;
  try {
    const tournamentState = tournamentSessionState || sim?.raceTournament;
    localStorage.setItem(RACE_TOURNAMENT_STORAGE_KEY, JSON.stringify({
      version: RACE_TOURNAMENT_STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      raceTournament: clean,
      tournamentState: tournamentState ? serializeOrbRaceTournament(tournamentState) : null,
      snapshot: currentTournamentSnapshot(),
    }));
    elements.raceTournamentStorageStatus.textContent = tournamentState
      ? "TOURNAMENT PRESET AND FULL BRACKET STATE SAVED LOCALLY."
      : "TOURNAMENT PRESET SAVED LOCALLY.";
    if (elements.raceTournamentSavedTitle) {
      elements.raceTournamentSavedTitle.textContent = `SAVED · ${clean.title || "ORB RACE TOURNAMENT"}`;
    }
  } catch {
    elements.raceTournamentStorageStatus.textContent = "LOCAL SAVE UNAVAILABLE IN THIS BROWSER.";
  }
}

function resumeTournamentFromBrowser() {
  const saved = readSavedTournament();
  if (!saved) {
    elements.raceTournamentStorageStatus.textContent = "NO VALID TOURNAMENT SAVE FOUND.";
    return;
  }
  settings = normalizeSettings({
    ...settings,
    gameplayMode: ORB_RACE_MODE,
    raceTournament: saved.raceTournament,
    social: { ...settings.social, format: saved.raceTournament.matchSettings.format },
  }, validClasses);
  selectedRaceFormat = "tournament";
  tournamentSessionState = saved.tournamentState || null;
  tournamentPreviewSourceState = null;
  tournamentSessionSettingsKey = tournamentSessionState ? tournamentConfigKey(settings.raceTournament) : null;
  tournamentResumeArmed = Boolean(tournamentSessionState);
  tournamentWizardPage = 3;
  tournamentPreviewMode = "landscape";
  tournamentSelectedMatchId = saved.tournamentState?.currentMatchId || null;
  elements.raceTournamentStorageStatus.textContent = tournamentSessionState
    ? "FULL TOURNAMENT BRACKET RESTORED. REVIEW THE PRESET, THEN RESUME."
    : "SAVED PRESET RESTORED. START A NEW TOURNAMENT FROM THIS CONFIGURATION.";
  if (elements.setupDialog.open) {
    elements.setupDialog.close();
    setTimeout(() => openSetup({ origin: setupOrigin, tournamentPage: 3 }), 0);
  } else {
    openSetup({ origin: "game", tournamentPage: 3 });
  }
}

function clearTournamentBrowserSave() {
  try {
    localStorage.removeItem(RACE_TOURNAMENT_STORAGE_KEY);
    elements.raceTournamentStorageStatus.textContent = "LOCAL TOURNAMENT SAVE CLEARED.";
  } catch {
    elements.raceTournamentStorageStatus.textContent = "LOCAL SAVE COULD NOT BE CLEARED.";
  }
}

function cancelTournamentPreviewCameraAnimation() {
  if (tournamentPreviewCameraAnimation != null) {
    window.cancelAnimationFrame(tournamentPreviewCameraAnimation);
    tournamentPreviewCameraAnimation = null;
  }
}

function applyTournamentPreviewCamera({
  x = 0,
  y = 0,
  scale = 1,
  progress = 0,
  motionProgress = progress,
  holding = false,
} = {}) {
  const camera = elements.raceTournamentBracketPreview?.querySelector(".race-tournament-camera");
  if (!camera) return;
  camera.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  camera.dataset.cameraProgress = String(progress);
  camera.dataset.cameraMotionProgress = String(motionProgress);
  camera.dataset.cameraHolding = String(Boolean(holding));
  camera.dataset.cameraMotionDuration = String(TOURNAMENT_CAMERA_MOTION_MS);
  camera.dataset.cameraHoldDuration = String(TOURNAMENT_CENTERED_MATCHUP_HOLD_MS);
  camera.dataset.cameraScale = String(scale);
}

function focusTournamentPreviewMatch(matchId) {
  const layout = tournamentPreviewLayout;
  const destination = layout?.cards.find((candidate) => (
    candidate.matchId === matchId && candidate.kind !== "entry"
  )) || layout?.cards.find((candidate) => candidate.matchId === matchId);
  const match = destination?.match;
  if (!layout || !destination || !match) return;
  const preview = elements.raceTournamentBracketPreview;
  preview.dataset.cameraActiveMatchId = match.id;
  preview.dataset.cameraFromMatchId = "";
  preview.dataset.cameraToMatchId = match.id;
  preview.dataset.cameraTransitionMode = "full-intro";
  const viewportWidth = Math.max(320, preview.clientWidth - 20 || layout.width);
  const viewportHeight = Math.max(260, preview.clientHeight - 58 || 420);
  const baseScale = tournamentPreviewZoom;
  const focusScale = baseScale * (tournamentPreviewMode === "landscape" ? 1.38 : 1.42);
  const cardForNodeId = (nodeId) => layout.cards.find((candidate) => (
    candidate.nodeId === nodeId || candidate.node.sourceNodeId === nodeId
  ));
  const sourceCards = (match.sourceNodeIds || [match.left?.nodeId, match.right?.nodeId])
    .filter(Boolean)
    .map(cardForNodeId)
    .filter(Boolean);
  const sameColumn = layout.cards
    .filter((candidate) => (
      candidate.kind !== "entry"
      && candidate.roundIndex === destination.roundIndex
      && candidate.side === destination.side
      && candidate.matchId !== matchId
    ))
    .sort((left, right) => left.centerY - right.centerY);
  const above = sameColumn.filter((candidate) => candidate.centerY < destination.centerY).at(-1) || null;
  const below = sameColumn.find((candidate) => candidate.centerY > destination.centerY) || null;
  const adjacentCards = [above, below]
    .filter(Boolean)
    .flatMap((candidate) => [
      candidate,
      ...(candidate.match?.sourceNodeIds || []).map(cardForNodeId).filter(Boolean),
    ]);
  const activeCards = [destination, ...sourceCards];
  const allCards = [...activeCards, ...adjacentCards].filter((card, index, cards) => (
    cards.findIndex((candidate) => candidate.nodeId === card.nodeId) === index
  ));
  const boundsFor = (cards) => cards.reduce((result, card) => ({
    minX: Math.min(result.minX, card.x),
    minY: Math.min(result.minY, card.y),
    maxX: Math.max(result.maxX, card.x + card.width),
    maxY: Math.max(result.maxY, card.y + card.height),
  }), {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  });
  const activeBounds = boundsFor(activeCards);
  const contextBounds = boundsFor(allCards);
  const targetCenter = {
    x: (activeBounds.minX + activeBounds.maxX) / 2,
    y: (activeBounds.minY + activeBounds.maxY) / 2,
  };
  const halfWidth = Math.max(targetCenter.x - contextBounds.minX, contextBounds.maxX - targetCenter.x) + 34;
  const halfHeight = Math.max(targetCenter.y - contextBounds.minY, contextBounds.maxY - targetCenter.y) + 34;
  const zoomRect = {
    centerX: targetCenter.x,
    centerY: targetCenter.y,
    width: Math.max(1, halfWidth * 2),
    height: Math.max(1, halfHeight * 2),
  };
  const cameraLayout = {
    centerX: viewportWidth / (2 * baseScale),
    centerY: viewportHeight / (2 * baseScale),
    width: layout.width,
    height: layout.height,
  };
  const targetScale = focusScale / baseScale;
  cancelTournamentPreviewCameraAnimation();
  const startedAt = performance.now();
  const durationMs = TOURNAMENT_MATCHUP_ZOOM_DURATION_MS;
  const motionDurationMs = TOURNAMENT_CAMERA_MOTION_MS;
  const animate = (now) => {
    const elapsedMs = Math.max(0, now - startedAt);
    const progress = Math.min(1, elapsedMs / durationMs);
    const motionProgress = Math.min(1, elapsedMs / motionDurationMs);
    const camera = tournamentCameraTransform({
      layout: cameraLayout,
      zoomRect,
      width: viewportWidth,
      height: viewportHeight,
      progress: motionProgress,
      targetScale,
    });
    const scale = baseScale * camera.scale;
    applyTournamentPreviewCamera({
      x: viewportWidth / 2 - camera.centerX * scale,
      y: viewportHeight / 2 - camera.centerY * scale,
      scale,
      progress,
      motionProgress,
      holding: elapsedMs >= motionDurationMs && elapsedMs < durationMs,
    });
    if (progress < 1) {
      tournamentPreviewCameraAnimation = window.requestAnimationFrame(animate);
    } else {
      tournamentPreviewCameraAnimation = null;
    }
  };
  tournamentPreviewCameraAnimation = window.requestAnimationFrame(animate);
}

function renderTournamentBracketPreview(snapshot = tournamentPreviewState(), { announce = true } = {}) {
  if (!elements.raceTournamentBracketPreview) return;
  if (!snapshot) {
    cancelTournamentPreviewCameraAnimation();
    tournamentPreviewLayout = null;
    elements.raceTournamentBracketPreview.hidden = true;
    elements.raceTournamentSavedMatch.hidden = true;
    return;
  }
  const snapshotIsFullState = Array.isArray(snapshot.entrants)
    && snapshot.rounds?.some((round) => Array.isArray(round.matches));
  const sourceState = currentTournamentState()
    || tournamentPreviewSourceState
    || (snapshotIsFullState ? snapshot : null);
  const bracketSnapshot = sourceState
    ? snapshotOrbRaceTournament(sourceState)
    : snapshot;
  const matches = new Map(
    (sourceState?.rounds || [])
      .flatMap((round) => round.matches || [])
      .map((match) => [match.id, match]),
  );
  (bracketSnapshot.rounds || [])
    .flatMap((round) => round.matches || [])
    .forEach((match) => matches.set(match.id, match));
  if (bracketSnapshot.currentMatch) matches.set(bracketSnapshot.currentMatch.id, bracketSnapshot.currentMatch);
  const layout = buildTournamentBracketLayout(bracketSnapshot, matches, sourceState);
  cancelTournamentPreviewCameraAnimation();
  tournamentPreviewLayout = layout;
  elements.raceTournamentBracketPreview.hidden = false;
  elements.raceTournamentBracketPreview.innerHTML = `
    <div class="race-tournament-bracket-title">
      <strong>${escapeHtml(bracketSnapshot.title || settings.raceTournament?.title || "ORB RACE TOURNAMENT")}</strong>
      <span>${bracketSnapshot.size} ENTRANTS · ${tournamentPreviewMode === "landscape" ? "LANDSCAPE PREVIEW · 16:9" : "PORTRAIT PREVIEW · 9:16"}</span>
    </div>
    <div class="race-tournament-stage-zoom" style="width:${layout.width * tournamentPreviewZoom}px;height:${layout.height * tournamentPreviewZoom}px">
      <div class="race-tournament-camera" data-camera-duration="${TOURNAMENT_MATCHUP_ZOOM_DURATION_MS}" data-camera-motion-duration="${TOURNAMENT_CAMERA_MOTION_MS}" data-camera-hold-duration="${TOURNAMENT_CENTERED_MATCHUP_HOLD_MS}" data-camera-progress="0" data-camera-motion-progress="0" data-camera-holding="false" style="width:${layout.width}px;height:${layout.height}px;transform:translate3d(0px, 0px, 0) scale(${tournamentPreviewZoom})">
      <div class="race-tournament-bracket-stage" style="--tournament-stage-width:${layout.width}px;--tournament-stage-height:${layout.height}px;--tournament-card-width:${layout.cardWidth}px;--tournament-preview-zoom:1">
        <svg class="race-tournament-connectors" viewBox="0 0 ${layout.width} ${layout.height}" aria-hidden="true" focusable="false">
          ${layout.paths.map((path) => `<path d="${path}" />`).join("")}
        </svg>
        ${layout.rounds.map((round) => `<div class="race-tournament-round-heading" style="left:${round.x}px;width:${round.width || layout.cardWidth}px">${escapeHtml(round.label)}</div>`).join("")}
        ${layout.cards.map((card) => {
          const selected = bracketSnapshot.currentMatch?.id === card.matchId || tournamentSelectedMatchId === card.matchId;
          const node = card.node;
          const entry = card.entry;
          const winner = Boolean(entry.orbId && entry.orbId === card.match?.winnerOrbId);
          const classes = [
            "race-tournament-node-card",
            entry.orbId ? "known" : "unknown",
            node.kind === "entry" ? "entrant" : "winner-node",
            winner ? "winner" : "",
            selected ? "selected" : "",
          ].filter(Boolean).join(" ");
          const matchLabel = card.match?.label || card.roundLabel || "TOURNAMENT NODE";
          const markText = entry.symbol || entry.label.replace(/[^A-Z0-9²ˣπφ∞☯⚡☢]/gi, "").slice(0, 2);
          const markMarkup = entry.orbId
            ? entry.asset
              ? `<img class="race-tournament-node-orb image" src="${escapeHtml(entry.asset)}" style="--tournament-entry-color:${entry.color};" alt="" aria-hidden="true" />`
              : `<span class="race-tournament-node-orb" style="--tournament-orb-color:${entry.color};--tournament-orb-accent:${entry.accent}" aria-hidden="true">${escapeHtml(markText || "ORB")}</span>`
            : "";
          return `<button type="button" class="${classes}" data-tournament-node="${escapeHtml(card.nodeId)}" data-tournament-match="${escapeHtml(card.matchId || "")}" style="left:${card.x}px;top:${card.y}px;width:${card.width}px;height:${card.height}px;--tournament-entry-color:${entry.color || "var(--line)"}" aria-label="${escapeHtml(`${matchLabel}: ${entry.label}`)}">
            ${markMarkup}
            <span class="race-tournament-node-name">${escapeHtml(entry.label)}</span>
          </button>`;
        }).join("")}
      </div>
      </div>
    </div>
  `;
  elements.raceTournamentBracketPreview.dataset.snapshot = "available";
  elements.raceTournamentBracketPreview.dataset.mode = tournamentPreviewMode;
  elements.raceTournamentBracketPreview.dataset.cameraActiveMatchId = "";
  elements.raceTournamentBracketPreview.dataset.cameraFromMatchId = "";
  elements.raceTournamentBracketPreview.dataset.cameraToMatchId = "";
  elements.raceTournamentBracketPreview.dataset.cameraTransitionMode = "full-intro";
  syncTournamentMatchAction();
  if (announce) elements.raceTournamentStorageStatus.textContent = "BRACKET OPEN · SELECT A CONCRETE MATCHUP OR A LANDSCAPE RECORDING PLAN.";
}

function buildTournamentBracketLayout(bracketSnapshot, matches, sourceState = null) {
  const landscape = tournamentPreviewMode === "landscape";
  const width = landscape ? 1320 : 820;
  const height = landscape ? 680 : 1080;
  const graphEntrantIds = sourceState?.seedOrder
    || sourceState?.selectedEntrantIds
    || bracketSnapshot.seedOrder
    || bracketSnapshot.selectedEntrantIds
    || [];
  const rawRounds = Array.isArray(sourceState?.rounds)
    ? sourceState.rounds
    : bracketSnapshot.rounds || [];
  const graphRounds = rawRounds.map((round) => ({
    ...round,
    matches: (round.matches || round.matchIds || [])
      .map((match) => typeof match === "string" ? matches.get(match) : match)
      .filter(Boolean),
  }));
  const graphTournament = Array.isArray(sourceState?.entrants) && sourceState.entrants.length
    ? { ...sourceState, rounds: graphRounds }
    : {
      ...(sourceState || bracketSnapshot),
      rounds: graphRounds,
      entrants: graphEntrantIds.map((orbId, index) => ({
        id: orbId,
        orbId,
        seedSlot: index,
        slot: index,
        side: index < (Number(bracketSnapshot.size) || 8) / 2 ? "left" : "right",
        name: ORB_RACERS[orbId]?.name || orbId,
      })),
    };
  const graph = tournamentBracketLayout({
    width,
    height,
    size: bracketSnapshot.size,
    tournament: graphTournament,
  });
  const sourceMatchForNode = new Map();
  for (const match of matches.values()) {
    (match.sourceNodeIds || []).forEach((nodeId) => sourceMatchForNode.set(nodeId, match.id));
  }
  const cards = graph.nodes.map((node) => {
    const matchId = node.sourceMatchId || sourceMatchForNode.get(node.sourceNodeId) || null;
    const match = matchId ? matches.get(matchId) || null : null;
    const orbId = node.entrant?.orbId
      || (node.kind !== "entry" ? match?.winnerOrbId : null)
      || null;
    const racer = orbId && ORB_RACERS[orbId] ? ORB_RACERS[orbId] : null;
    return {
      nodeId: node.id,
      node,
      matchId,
      match,
      entry: {
        orbId: racer ? orbId : null,
        label: racer ? racer.name : "???",
        color: racer?.color || "",
        accent: racer?.accent || "",
        symbol: racer?.symbol || "",
        asset: orbId ? RACE_PICKER_ASSETS[orbId] || "" : "",
      },
      roundLabel: node.roundLabel || match?.roundLabel || "TOURNAMENT",
      roundIndex: node.roundIndex ?? -1,
      side: node.side,
      kind: node.kind,
      x: node.rect.x,
      y: node.rect.y,
      width: node.rect.width,
      height: node.rect.height,
      centerX: node.x,
      centerY: node.y,
    };
  });
  const roundMeta = [];
  for (let roundIndex = 0; roundIndex < graph.roundCount; roundIndex += 1) {
    const candidates = roundIndex === 0
      ? cards.filter((card) => card.kind === "entry")
      : cards.filter((card) => card.roundIndex === roundIndex && card.kind !== "entry");
    const grouped = new Map();
    candidates.forEach((card) => {
      const key = card.side === "center" ? "center" : card.side || "left";
      if (!grouped.has(key)) grouped.set(key, card);
    });
    grouped.forEach((card, side) => {
      roundMeta.push({
        label: side === "center" ? "CHAMPIONSHIP" : (bracketSnapshot.rounds?.[roundIndex]?.label || card.roundLabel),
        x: card.x,
        width: card.width,
      });
    });
  }
  const paths = graph.connections.map((connection) => connection.points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" "));
  // Keep these local aliases so the setup contract remains explicit about
  // left/right/center convergence even though the shared graph owns geometry.
  const sideFor = (match) => match?.side === "right" ? "right" : match?.side === "center" ? "center" : "left";
  const xFor = (match, roundIndex) => cards.find((card) => card.matchId === match?.id && card.roundIndex === roundIndex)?.x || 0;
  void sideFor;
  void xFor;
  return {
    ...graph,
    width,
    height,
    cardWidth: graph.cardWidth,
    cardHeight: graph.cardHeight,
    rounds: roundMeta,
    cards,
    paths,
  };
}

function openTournamentBracketPreview() {
  const saved = readSavedTournament();
  tournamentWizardPage = 3;
  tournamentPreviewMode = "landscape";
  tournamentPreviewZoom = 1;
  let savedPreviewState = saved?.tournamentState || null;
  if (!savedPreviewState && saved?.raceTournament) {
    try {
      const clean = normalizeSettings({
        gameplayMode: ORB_RACE_MODE,
        raceTournament: saved.raceTournament,
      }, validClasses).raceTournament;
      savedPreviewState = clean ? createOrbRaceTournament({ ...clean, seed: settings.seed }) : null;
    } catch {
      savedPreviewState = null;
    }
  }
  tournamentPreviewSourceState = currentTournamentState() ? null : savedPreviewState;
  renderTournamentBracketPreview(currentTournamentState() || tournamentPreviewSourceState || saved?.snapshot);
  syncRaceTournamentControls();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function requestSelectedTournamentMatchRecording() {
  const match = tournamentPreviewMatch();
  if (!match?.left?.orbId || !match?.right?.orbId) {
    elements.raceTournamentStorageStatus.textContent = "SELECT A CONCRETE ORB MATCHUP FROM THE BRACKET FIRST.";
    return;
  }
  const preview = tournamentPreviewState();
  const prepared = prepareOrbRaceTournamentMatchRecording(preview, tournamentSelectedMatchId, {
    sharedLayerValues: buildOrbRaceTournamentLayerPreset(
      3,
      Number(raceTournamentDraft()?.finalLayerHealth) || 110,
    ),
  });
  if (!prepared) {
    elements.raceTournamentStorageStatus.textContent = "THIS MATCHUP IS NOT READY TO RECORD YET.";
    return;
  }
  tournamentRecordingRequest = {
    matchId: tournamentSelectedMatchId,
    leftOrbId: match.left.orbId,
    rightOrbId: match.right.orbId,
    singleMatch: true,
    format: "short-portrait",
    dimensions: { width: 1080, height: 1920 },
    recordingLayerCount: 3,
    layerCount: 3,
    presentation: tournamentRecordingPresentationContract("full-intro", {
      activeMatchId: match.id,
      toMatchId: match.id,
    }),
    requestedAt: new Date().toISOString(),
    snapshot: currentTournamentSnapshot()
      || snapshotOrbRaceTournament(tournamentPreviewState())
      || readSavedTournament()?.snapshot
      || null,
  };
  const nextSettings = readSetup();
  if (!nextSettings?.raceTournament) {
    elements.raceTournamentStorageStatus.textContent = "TOURNAMENT SETTINGS COULD NOT BE PREPARED FOR RECORDING.";
    return;
  }
  nextSettings.social = normalizeSocialOptions({
    ...nextSettings.social,
    format: "portrait",
  });
  nextSettings.raceTournament = {
    ...nextSettings.raceTournament,
    recordingScope: "each-match",
    recordingSelection: "match",
    recordingFormat: "short-portrait",
    landscapeLayerCount: 3,
    sharedLayerValues: [...prepared.sharedLayerValues],
  };
  tournamentSessionState = prepared;
  tournamentSessionSettingsKey = tournamentConfigKey(nextSettings.raceTournament);
  tournamentPreviewSourceState = null;
  tournamentResumeArmed = false;
  tournamentTransition = null;
  tournamentRecorder.reset();
  elements.raceTournamentStorageStatus.textContent = `STARTING PORTRAIT RECORDING · ${match.left.orbId.toUpperCase()} VS ${match.right.orbId.toUpperCase()}`;
  setupOrigin = "game";
  if (elements.setupDialog.open) elements.setupDialog.close();
  launchBattle(nextSettings, {
    syncUrl: true,
    enterGame: true,
    preserveTournamentSession: true,
  });
  tournamentRecorder.beginTournamentSession({
    scope: "each-match",
    recordingScope: "each-match",
    tournamentSize: sim.raceTournament?.size || nextSettings.raceTournament.size,
    tournamentId: sim.raceTournament?.tournamentId || null,
    selectedMatchId: match.id,
    fps: nextSettings.social.fps,
  });
  await startSocialRecording();
  return true;
}

function tournamentRecordingStateMatchesSettings(state, tournamentSettings) {
  if (!state || !tournamentSettings || state.status === "completed") return false;
  const sameArray = (left, right) => JSON.stringify(left || []) === JSON.stringify(right || []);
  return state.recordingScope === tournamentSettings.recordingScope
    && state.recordingSelection === tournamentSettings.recordingSelection
    && Number(state.recordingLayerCount) === Number(tournamentSettings.landscapeLayerCount)
    && sameArray(state.sharedLayerValues, tournamentSettings.sharedLayerValues)
    && sameArray(state.selectedRoundIndices, tournamentSettings.selectedRoundIndices);
}

function tournamentRecordingScopeFor(tournamentSettings = settings.raceTournament, request = tournamentRecordingRequest) {
  return request?.recordingScope
    || request?.scope
    || tournamentSettings?.recordingScope
    || null;
}

function tournamentRecordingIsContinuous(tournamentSettings = settings.raceTournament, request = tournamentRecordingRequest) {
  const scope = tournamentRecordingScopeFor(tournamentSettings, request);
  return scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND
    || scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_TOURNAMENT;
}

function tournamentRecordingPresentationContract(mode = "full-intro", {
  activeMatchId = null,
  fromMatchId = null,
  toMatchId = activeMatchId,
} = {}) {
  const panToNext = mode === "pan-to-next";
  const resolvedToMatchId = toMatchId || activeMatchId || null;
  const resolvedFromMatchId = panToNext ? fromMatchId || null : null;
  return {
    mode,
    transitionMode: mode,
    activeMatchId: resolvedToMatchId,
    fromMatchId: resolvedFromMatchId,
    toMatchId: resolvedToMatchId,
    staticBracketDwellMs: panToNext ? 0 : TOURNAMENT_STATIC_BRACKET_DWELL_MS,
    cameraMotionDurationMs: TOURNAMENT_CAMERA_MOTION_MS,
    centeredMatchupHoldMs: TOURNAMENT_CENTERED_MATCHUP_HOLD_MS,
    matchupZoomDurationMs: TOURNAMENT_MATCHUP_ZOOM_DURATION_MS,
    interMatchPanDurationMs: TOURNAMENT_INTER_MATCH_PAN_DURATION_MS,
    restartIntro: !panToNext,
    preserveRecorder: panToNext,
    cameraTransition: {
      type: panToNext ? "camera-pan" : "full-intro",
      fromMatchId: resolvedFromMatchId,
      toMatchId: resolvedToMatchId,
      duration: TOURNAMENT_CAMERA_MOTION_MS / 1000,
    },
  };
}

function alignFirstLongFormTournamentMatchup(tournament) {
  if (!tournament || !tournamentRecordingIsContinuous() || tournament.lastCompletedMatchId) return;
  const match = tournamentMatchById(tournament, tournament.activeMatchId || tournament.currentMatchId);
  const timestamps = match?.presentation;
  if (!timestamps) return;
  const startAt = Number(tournament.clock) || 0;
  const motionDuration = TOURNAMENT_CAMERA_MOTION_MS / 1000;
  const holdDuration = TOURNAMENT_CENTERED_MATCHUP_HOLD_MS / 1000;
  const motionEndAt = startAt + motionDuration;
  const holdEndAt = motionEndAt + holdDuration;
  Object.assign(timestamps, {
    introBracketAt: startAt,
    bracketZoomAt: startAt,
    zoomEndAt: motionEndAt,
    panEndAt: null,
    motionEndAt,
    holdStartAt: motionEndAt,
    matchupHoldAt: motionEndAt,
    holdEndAt,
    battleAt: holdEndAt,
    bracketIntroDuration: 0,
    zoomDuration: motionDuration,
    cameraPanDuration: motionDuration,
    matchupHoldDuration: holdDuration,
    preFightDuration: motionDuration + holdDuration,
    fullIntroDuration: motionDuration + holdDuration,
    transitionStartAt: null,
    transitionEndAt: null,
    transitionDuration: null,
    transitionFromMatchId: null,
    transitionToMatchId: null,
    fromMatchId: null,
    toMatchId: match.id,
  });
  timestamps.cameraTransition = {
    ...(timestamps.cameraTransition || {}),
    type: "full-intro",
    fromMatchId: null,
    toMatchId: match.id,
    startAt,
    endAt: motionEndAt,
    duration: motionDuration,
  };
  if (tournament.currentMatch?.id === match.id) {
    tournament.currentMatch.presentation = { ...timestamps };
  }
  tournament.presentationTimestamps = { ...timestamps };
  advanceOrbRaceTournamentPresentation(tournament, startAt);
}

function createTournamentMatchTransition(tournament) {
  if (!tournament || !tournament.activeMatchId) return null;
  const nextMatch = tournamentMatchById(tournament, tournament.activeMatchId);
  if (!nextMatch) return null;
  const continuous = tournamentRecordingIsContinuous();
  const authoritativeTransition = nextMatch.presentation?.cameraTransition;
  const isCameraPan = nextMatch.presentation?.introMode === "camera-pan"
    && authoritativeTransition?.type === "camera-pan";
  if (!continuous || !isCameraPan) return null;
  const fromMatchId = authoritativeTransition.fromMatchId
    || nextMatch.presentation?.transitionFromMatchId
    || tournament.lastCompletedMatchId
    || tournament.lastResult?.matchId
    || null;
  const toMatchId = authoritativeTransition.toMatchId
    || nextMatch.presentation?.transitionToMatchId
    || nextMatch.id;
  if (toMatchId !== nextMatch.id) return null;
  return {
    type: "orb-race-tournament-transition",
    ...tournamentRecordingPresentationContract("pan-to-next", {
      activeMatchId: toMatchId,
      fromMatchId,
      toMatchId,
    }),
    activeMatchId: toMatchId,
    fromMatchId,
    toMatchId,
    recordingScope: tournamentRecordingScopeFor(),
    recordingWasActive: socialRecorder.machine.state === RECORDER_STATES.RECORDING,
    preserveRecorder: continuous && socialRecorder.machine.state === RECORDER_STATES.RECORDING,
    startedAt: performance.now(),
  };
}

function tournamentTransitionForRender(now = performance.now()) {
  if (!tournamentTransition) return null;
  const elapsedMs = Math.max(0, Number(now) - Number(tournamentTransition.startedAt || now));
  const durationMs = Math.max(1, Number(tournamentTransition.interMatchPanDurationMs) || TOURNAMENT_INTER_MATCH_PAN_DURATION_MS);
  const motionDurationMs = Math.max(1, Number(tournamentTransition.cameraMotionDurationMs) || TOURNAMENT_CAMERA_MOTION_MS);
  const progress = Math.min(1, elapsedMs / durationMs);
  const motionProgress = Math.min(1, elapsedMs / motionDurationMs);
  const holdProgress = Math.min(
    1,
    Math.max(0, (elapsedMs - motionDurationMs) / Math.max(1, Number(tournamentTransition.centeredMatchupHoldMs) || TOURNAMENT_CENTERED_MATCHUP_HOLD_MS)),
  );
  const currentPhase = sim.raceTournament?.presentation?.phase;
  const reachedBattle = tournamentTransition.toMatchId
    && sim.raceTournament?.currentMatchId === tournamentTransition.toMatchId
    && currentPhase === "battle";
  const frame = {
    ...tournamentTransition,
    elapsedMs,
    progress,
    motionProgress,
    holdProgress,
    holding: elapsedMs >= motionDurationMs && elapsedMs < durationMs,
    active: !reachedBattle,
  };
  if (reachedBattle) tournamentTransition = null;
  return frame;
}

function hydrateQueuedTournamentMatch() {
  if (!tournamentTransition || !sim.raceTournament) return;
  const transition = { ...tournamentTransition };
  const tournament = sim.raceTournament;
  const nextMatch = tournamentMatchById(tournament, transition.toMatchId);
  const battleAt = Number(nextMatch?.presentation?.battleAt);
  if (Number.isFinite(battleAt)) advanceOrbRaceTournamentPresentation(tournament, battleAt);
  tournamentSessionState = tournament;
  tournamentSessionSettingsKey = tournamentConfigKey(settings.raceTournament);
  tournamentTransitionTimer = 0;
  tournamentAdvancePending = false;
  launchBattle(settings, {
    syncUrl: false,
    preserveTournamentSession: true,
    preserveTournamentRecording: true,
    transition,
  });
  void startSocialRecording({ transitionOverride: transition });
}

function cancelQueuedTournamentMatch() {
  clearTimeout(tournamentTransitionTimer);
  tournamentTransitionTimer = 0;
  tournamentAdvancePending = false;
  tournamentTransition = null;
}

function beginTournamentRecorderSession(tournamentSettings, request = {}) {
  if (!tournamentSettings) return null;
  const selectedRounds = tournamentSettings.recordingScope === "whole-round"
    ? (tournamentSettings.selectedRoundIndices?.length
      ? [...tournamentSettings.selectedRoundIndices]
      : [0])
    : null;
  return tournamentRecorder.beginTournamentSession({
    scope: tournamentSettings.recordingScope,
    recordingScope: tournamentSettings.recordingScope,
    tournamentSize: tournamentSettings.size,
    tournamentId: sim.raceTournament?.tournamentId || null,
    selectedRoundIndices: selectedRounds,
    selectedMatchId: request.singleMatch ? request.matchId : null,
    fps: tournamentSettings.matchSettings?.fps || settings.social.fps,
  });
}

async function startTournamentRecordingWorkflow(nextSettings, { sourceState = null, request = {} } = {}) {
  const tournamentSettings = nextSettings?.raceTournament;
  if (!tournamentSettings) {
    elements.raceTournamentStorageStatus.textContent = "TOURNAMENT SETTINGS COULD NOT BE PREPARED FOR RECORDING.";
    return false;
  }
  const tournamentKey = tournamentConfigKey(tournamentSettings);
  const candidate = sourceState
    || (tournamentSessionSettingsKey === tournamentKey ? tournamentSessionState : null)
    || tournamentPreviewState();
  const tournamentState = tournamentRecordingStateMatchesSettings(candidate, tournamentSettings)
    ? candidate
    : createOrbRaceTournament({ ...tournamentSettings, seed: nextSettings.seed });
  const recordingLayerCount = Number(
    tournamentSettings.recordingLayerCount
      || tournamentSettings.landscapeLayerCount
      || tournamentSettings.matchSettings?.layerCount
      || 3,
  );
  const selectedRoundIndices = tournamentSettings.recordingScope === "whole-round"
    ? (tournamentSettings.selectedRoundIndices?.length
      ? [...tournamentSettings.selectedRoundIndices]
      : [0])
    : null;

  if (socialRecorder.machine.state === RECORDER_STATES.RECORDING) socialRecorder.cancel();
  if (socialRecorder.machine.state !== RECORDER_STATES.IDLE) socialRecorder.reset();
  tournamentRecorder.reset();
  tournamentSessionState = tournamentState;
  tournamentSessionSettingsKey = tournamentKey;
  tournamentPreviewSourceState = null;
  tournamentResumeArmed = false;
  tournamentTransition = null;
  const activeMatchId = tournamentState.activeMatchId
    || tournamentState.currentMatchId
    || tournamentState.currentMatch?.id
    || null;
  const defaultPresentation = tournamentRecordingPresentationContract("full-intro", {
    activeMatchId,
    toMatchId: activeMatchId,
  });
  const requestedPresentation = request.presentation || {};
  tournamentRecordingRequest = {
    ...request,
    singleMatch: request.singleMatch === true,
    direct: request.direct === true,
    scope: tournamentSettings.recordingScope,
    recordingScope: tournamentSettings.recordingScope,
    recordingSelection: tournamentSettings.recordingSelection,
    selectedRoundIndices,
    selectedRoundIds: selectedRoundIndices?.map((index) => `round-${index + 1}`) || null,
    format: tournamentSettings.recordingFormat,
    dimensions: { ...tournamentSettings.recordingDimensions },
    layerCount: recordingLayerCount,
    presentation: request.presentation
      ? {
        ...defaultPresentation,
        ...requestedPresentation,
        activeMatchId: requestedPresentation.activeMatchId || activeMatchId,
        fromMatchId: requestedPresentation.fromMatchId ?? null,
        toMatchId: requestedPresentation.toMatchId || activeMatchId,
      }
      : defaultPresentation,
    requestedAt: new Date().toISOString(),
    snapshot: snapshotOrbRaceTournament(tournamentState),
  };
  setupOrigin = "game";
  if (elements.setupDialog.open) elements.setupDialog.close();
  launchBattle(nextSettings, {
    syncUrl: true,
    enterGame: true,
    preserveTournamentSession: true,
  });
  beginTournamentRecorderSession(nextSettings.raceTournament, tournamentRecordingRequest);
  await startSocialRecording();
  return true;
}

async function requestSelectedTournamentRoundRecording() {
  const selected = [...elements.raceTournamentRoundList.querySelectorAll('input[name="raceTournamentRound"]:checked')]
    .map((input) => input.value);
  const fallbackRound = raceTournamentRoundIds(Number(elements.raceTournamentSize.value))[0];
  const rounds = selected.length ? selected : [fallbackRound].filter(Boolean);
  elements.raceTournamentRecordingScope.value = "whole-round";
  renderRaceTournamentRoundList(rounds);
  syncTournamentPresetControls({ forcePreset: true });
  syncRaceTournamentControls();
  const nextSettings = readSetup();
  if (!nextSettings?.raceTournament) return false;
  elements.raceTournamentStorageStatus.textContent = rounds.length === 1
    ? `STARTING LANDSCAPE ROUND RECORDING · ${tournamentRoundLabel(rounds[0])}`
    : `STARTING LANDSCAPE ROUND RECORDING · ${rounds.length} ROUNDS SELECTED`;
  return startTournamentRecordingWorkflow(nextSettings, {
    request: {
      direct: true,
      recordingSelection: "selected-round",
      selectedRoundIds: nextSettings.raceTournament.selectedRoundIds,
    },
  });
}

async function requestWholeTournamentRecording() {
  setTournamentRecordingScope("whole-tournament");
  syncTournamentPresetControls({ forcePreset: true });
  syncRaceTournamentControls();
  const nextSettings = readSetup();
  if (!nextSettings?.raceTournament) return false;
  elements.raceTournamentStorageStatus.textContent = "STARTING LANDSCAPE WHOLE-TOURNAMENT RECORDING.";
  return startTournamentRecordingWorkflow(nextSettings, {
    request: {
      direct: true,
      recordingSelection: "whole-tournament",
    },
  });
}

function tournamentSetupActions() {
  return elements.setupDialog?.querySelector(".setup-actions");
}

function syncTournamentWizardPage() {
  const enabled = elements.gameplayModeSelect.value === ORB_RACE_MODE && selectedRaceFormat === "tournament";
  const page = Math.max(1, Math.min(3, Number(tournamentWizardPage) || 1));
  tournamentWizardPage = page;
  [elements.raceTournamentWizardPage1, elements.raceTournamentWizardPage2, elements.raceTournamentWizardPage3]
    .forEach((pageElement, index) => {
      if (pageElement) pageElement.hidden = !enabled || index + 1 !== page;
    });
  if (elements.raceTournamentPageIndicator) {
    elements.raceTournamentPageIndicator.textContent = enabled
      ? `STEP ${page} OF 3 · ${page === 1 ? "PRESET" : page === 2 ? "ENTRANTS" : "BRACKET"}`
      : "";
  }
  if (elements.nonTournamentSetupFields) elements.nonTournamentSetupFields.hidden = enabled;
  const seedField = elements.seedInput?.closest(".seed-field");
  if (seedField) seedField.hidden = enabled;
  const actions = tournamentSetupActions();
  if (actions) actions.hidden = enabled && page !== 3;
  if (elements.randomSeedButton) elements.randomSeedButton.hidden = enabled;
  if (elements.launchButton) {
    elements.launchButton.textContent = enabled ? "START TOURNAMENT RECORDING" : "RECORD FIGHT";
    elements.launchButton.disabled = enabled && page !== 3;
  }
  if (enabled) {
    [elements.raceTournamentPortraitPreviewButton, elements.raceTournamentLandscapePreviewButton]
      .forEach((button) => button?.classList.toggle("active", button?.dataset.tournamentPreviewMode === tournamentPreviewMode));
    if (elements.raceTournamentZoomReset) {
      elements.raceTournamentZoomReset.textContent = `${Math.round(tournamentPreviewZoom * 100)}%`;
    }
  }
  if (enabled) {
    updateTournamentEntrantCount();
    if (page === 3) renderTournamentBracketPreview(tournamentPreviewState(), { announce: false });
    syncTournamentMatchAction();
  }
}

function setTournamentWizardPage(page, { focus = true } = {}) {
  const nextPage = Math.max(1, Math.min(3, Number(page) || 1));
  if (nextPage < 3) tournamentPreviewSourceState = null;
  tournamentWizardPage = nextPage;
  const panel = elements.setupDialog?.querySelector(".setup-panel");
  if (panel) panel.scrollTop = 0;
  syncRaceTournamentControls();
  if (!focus) return;
  const target = tournamentWizardPage === 1
    ? elements.raceTournamentTitle
    : tournamentWizardPage === 2
      ? elements.raceTournamentEntrants?.querySelector('input[name="raceTournamentEntrant"]')
      : elements.raceTournamentBracketPreview;
  target?.focus?.({ preventScroll: true });
}

function setTournamentPreviewZoom(zoom) {
  cancelTournamentPreviewCameraAnimation();
  tournamentPreviewZoom = Math.max(0.75, Math.min(1.5, Number(zoom) || 1));
  syncTournamentWizardPage();
}

function syncRaceTournamentControls() {
  const orbRace = elements.gameplayModeSelect.value === ORB_RACE_MODE;
  const enabled = orbRace && selectedRaceFormat === "tournament";
  elements.raceTournamentPanel.hidden = !enabled;
  elements.raceTournamentOptions.hidden = !enabled;
  elements.raceTeamBuilder.hidden = !orbRace || enabled;
  elements.raceLayerToolbar.hidden = !orbRace || enabled;
  elements.raceOptionToolbar.hidden = !orbRace || enabled;
  elements.raceLayerFields.hidden = !orbRace || enabled;
  if (elements.raceTournamentSeedList) {
    elements.raceTournamentSeedList.hidden = !enabled || elements.raceTournamentSeedingMode.value !== "custom";
  }
  if (elements.raceTournamentSeedHelp) {
    elements.raceTournamentSeedHelp.textContent = elements.raceTournamentSeedingMode.value === "custom"
      ? "Use the arrows or each position selector to set the ordered bracket."
      : "Gameplay shuffles the selected entrants deterministically from MATCH SEED.";
  }
  if (enabled) syncTournamentPresetControls();
  const validation = enabled
    ? validateRaceTournamentSettings(raceTournamentDraft())
    : { valid: true, message: "" };
  elements.raceTournamentValidation.textContent = enabled && tournamentWizardPage > 1
    ? validation.message || `READY · ${elements.raceTournamentSize.value} ENTRANTS · ${elements.raceTournamentRecordingScope.value.toUpperCase()}`
    : "";
  elements.raceTournamentValidation.dataset.valid = String(validation.valid);
  elements.launchButton.disabled = enabled && (tournamentWizardPage !== 3 || !validation.valid);
  elements.shortFormRaceButton.setAttribute("aria-pressed", String(orbRace && selectedRaceFormat === "short"));
  elements.longFormRaceButton.setAttribute("aria-pressed", String(orbRace && selectedRaceFormat === "long"));
  elements.tournamentRaceButton.setAttribute("aria-pressed", String(orbRace && selectedRaceFormat === "tournament"));
  syncTournamentWizardPage();
}

function buildRaceTournamentControls() {
  elements.raceTournamentEntrants.innerHTML = ORB_RACER_IDS.map((id) => {
    const racer = ORB_RACERS[id];
    const pickerAsset = RACE_PICKER_ASSETS[id];
    const iconMarkup = pickerAsset
      ? `<img class="race-orb-generated-icon" src="${pickerAsset}" alt="" />`
      : `<span aria-hidden="true">${racer.symbol}</span>`;
    return `<div class="race-team-orb race-tournament-orb" style="--racer-color:${racer.color};--racer-accent:${racer.accent}">
      <label class="race-orb-option">
        <input type="checkbox" name="raceTournamentEntrant" value="${id}" data-tournament-entrant="${id}" />
        ${iconMarkup}
        <span class="race-orb-copy">
          <strong>${racer.name}</strong>
          <small>${racer.statLabel || "ORB RACER"}</small>
        </span>
      </label>
    </div>`;
  }).join("");

  elements.raceTournamentEntrants.addEventListener("change", (event) => {
    if (!event.target.matches('input[name="raceTournamentEntrant"]')) return;
    const panelScrollTop = elements.setupDialog.querySelector(".setup-panel")?.scrollTop ?? 0;
    const selected = raceTournamentSelectedEntrants();
    raceTournamentSeedOrder = event.target.checked
      ? [...selected.filter((id) => id !== event.target.value), event.target.value]
      : selected.filter((id) => id !== event.target.value);
    renderRaceTournamentSeedList();
    syncRaceTournamentControls();
    restoreSetupDialogScroll(panelScrollTop);
  });

  elements.raceTournamentSeedList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tournament-move]");
    if (!button) return;
    const row = button.closest("[data-tournament-seed-id]");
    const id = row?.dataset.tournamentSeedId;
    const index = raceTournamentSeedOrder.indexOf(id);
    if (index < 0) return;
    const offset = button.dataset.tournamentMove === "up" ? -1 : 1;
    const nextIndex = index + offset;
    if (nextIndex < 0 || nextIndex >= raceTournamentSeedOrder.length) return;
    const panelScrollTop = elements.setupDialog.querySelector(".setup-panel")?.scrollTop ?? 0;
    [raceTournamentSeedOrder[index], raceTournamentSeedOrder[nextIndex]] = [
      raceTournamentSeedOrder[nextIndex],
      raceTournamentSeedOrder[index],
    ];
    renderRaceTournamentSeedList();
    syncRaceTournamentControls();
    restoreSetupDialogScroll(panelScrollTop);
  });

  elements.raceTournamentSeedList?.addEventListener("change", (event) => {
    if (!event.target.matches("[data-tournament-seed]")) return;
    const position = Number(event.target.dataset.tournamentSeedPosition);
    const nextId = event.target.value;
    const currentId = raceTournamentSeedOrder[position];
    const nextPosition = raceTournamentSeedOrder.indexOf(nextId);
    if (!Number.isInteger(position) || position < 0 || nextPosition < 0) return;
    const panelScrollTop = elements.setupDialog.querySelector(".setup-panel")?.scrollTop ?? 0;
    [raceTournamentSeedOrder[position], raceTournamentSeedOrder[nextPosition]] = [
      raceTournamentSeedOrder[nextPosition],
      currentId,
    ];
    renderRaceTournamentSeedList();
    syncRaceTournamentControls();
    restoreSetupDialogScroll(panelScrollTop);
  });

  [elements.raceTournamentSize, elements.raceTournamentSeedingMode, elements.raceTournamentRecordingScope].forEach((input) => {
    input.addEventListener("change", () => {
      const panelScrollTop = elements.setupDialog.querySelector(".setup-panel")?.scrollTop ?? 0;
      if (input === elements.raceTournamentSize) {
        ensureTournamentEntrantDefaults({ fill: true, trim: true });
        renderRaceTournamentRoundList();
      }
      if (input === elements.raceTournamentRecordingScope) {
        syncTournamentPresetControls({ forcePreset: true });
      }
      syncRaceTournamentControls();
      restoreSetupDialogScroll(panelScrollTop);
    });
  });
  elements.raceTournamentTitle.addEventListener("input", syncRaceTournamentControls);
  elements.raceTournamentRoundList.addEventListener("change", (event) => {
    if (event.target.matches('input[name="raceTournamentRound"]')) {
      elements.raceTournamentRecordingScope.value = "whole-round";
    }
    syncRaceTournamentControls();
  });
  elements.raceTournamentLayerCount.addEventListener("change", () => syncTournamentPresetControls({ forcePreset: true }));
  elements.raceTournamentFinalLayerHealth.addEventListener("change", () => {
    if (elements.raceTournamentFinalLayerHealth.value !== "custom") syncTournamentPresetControls({ forcePreset: true });
  });
  elements.raceTournamentLayerFields.addEventListener("input", (event) => {
    if (event.target.matches('input[name="raceTournamentLayerStrength"]')) {
      elements.raceTournamentFinalLayerHealth.value = "custom";
      renderRaceLayerFields(tournamentLayerValues());
      syncRaceTournamentControls();
    }
  });
  elements.raceTournamentWizardNext1.addEventListener("click", () => setTournamentWizardPage(2));
  elements.raceTournamentWizardBack2.addEventListener("click", () => setTournamentWizardPage(1));
  elements.raceTournamentWizardNext2.addEventListener("click", () => {
    const validation = validateRaceTournamentSettings(raceTournamentDraft());
    if (!validation.valid) {
      syncRaceTournamentControls();
      elements.raceTournamentValidation.focus?.({ preventScroll: true });
      return;
    }
    setTournamentWizardPage(3);
  });
  elements.raceTournamentWizardBack3.addEventListener("click", () => setTournamentWizardPage(2));
  [elements.raceTournamentPortraitPreviewButton, elements.raceTournamentLandscapePreviewButton].forEach((button) => {
    button.addEventListener("click", () => {
      tournamentPreviewMode = button.dataset.tournamentPreviewMode;
      [elements.raceTournamentPortraitPreviewButton, elements.raceTournamentLandscapePreviewButton]
        .forEach((candidate) => candidate.classList.toggle("active", candidate === button));
      syncTournamentWizardPage();
    });
  });
  elements.raceTournamentZoomOut.addEventListener("click", () => setTournamentPreviewZoom(tournamentPreviewZoom - 0.25));
  elements.raceTournamentZoomReset.addEventListener("click", () => setTournamentPreviewZoom(1));
  elements.raceTournamentZoomIn.addEventListener("click", () => setTournamentPreviewZoom(tournamentPreviewZoom + 0.25));
  elements.raceTournamentRecordRoundButton.addEventListener("click", () => {
    void requestSelectedTournamentRoundRecording().catch((error) => {
      elements.raceTournamentStorageStatus.textContent = `ROUND RECORDING FAILED · ${error.message}`;
    });
  });
  elements.raceTournamentRecordTournamentButton.addEventListener("click", () => {
    void requestWholeTournamentRecording().catch((error) => {
      elements.raceTournamentStorageStatus.textContent = `TOURNAMENT RECORDING FAILED · ${error.message}`;
    });
  });
  elements.raceTournamentSaveButton.addEventListener("click", saveTournamentToBrowser);
  elements.raceTournamentResumeButton.addEventListener("click", resumeTournamentFromBrowser);
  elements.raceTournamentClearButton.addEventListener("click", clearTournamentBrowserSave);
  elements.raceTournamentOpenBracketButton.addEventListener("click", openTournamentBracketPreview);
  elements.raceTournamentRecordMatchButton.addEventListener("click", requestSelectedTournamentMatchRecording);
  elements.raceTournamentBracketPreview.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tournament-match]");
    if (!button) return;
    tournamentSelectedMatchId = button.dataset.tournamentMatch;
    elements.raceTournamentBracketPreview.querySelectorAll("[data-tournament-match]").forEach((candidate) => {
      candidate.classList.toggle("selected", candidate === button);
    });
    focusTournamentPreviewMatch(tournamentSelectedMatchId);
    syncTournamentMatchAction();
    if (!elements.raceTournamentSavedMatch.hidden) {
      elements.raceTournamentStorageStatus.textContent = "CONCRETE MATCHUP SELECTED · PORTRAIT RECORDING AVAILABLE.";
    } else {
      elements.raceTournamentStorageStatus.textContent = "FUTURE SLOT SELECTED · WAIT FOR BOTH ORBS TO BE DETERMINED.";
    }
  });
  renderRaceTournamentSeedList();
}

function syncSetupModeVisibility() {
  const worldCup = elements.gameplayModeSelect.value === WORLD_CUP_MODE;
  const orbRace = elements.gameplayModeSelect.value === ORB_RACE_MODE;
  elements.countryFieldset.hidden = !worldCup;
  elements.raceOrbFieldset.hidden = !orbRace;
  elements.raceLengthPicker.hidden = !orbRace;
  const tournament = orbRace && selectedRaceFormat === "tournament";
  const longRace = orbRace && selectedRaceFormat === "long";
  if (tournament) syncTournamentPresetControls();
  elements.raceFinalLayerHealthLabel.hidden = !orbRace || !longRace;
  elements.raceTargetMessageToggle.closest("label").hidden = !orbRace || !longRace;
  elements.raceTargetAudioToggle.closest("label").hidden = !orbRace || !longRace;
  elements.raceTiltedLayerIndexLabel.hidden = !orbRace || !elements.raceTiltedLayerToggle.checked;
  elements.shortFormRaceButton.setAttribute("aria-pressed", String(orbRace && selectedRaceFormat === "short"));
  elements.longFormRaceButton.setAttribute("aria-pressed", String(orbRace && selectedRaceFormat === "long"));
  elements.tournamentRaceButton.setAttribute("aria-pressed", String(tournament));
  elements.classFieldset.hidden = worldCup || orbRace;
  elements.hazardFieldset.hidden = worldCup || orbRace || !settings.features.hazards;
  elements.launchButton.textContent = worldCup
    ? "START WORLD CUP MATCH"
    : orbRace ? tournament ? "START TOURNAMENT" : "START ORB RACE" : "RECORD FIGHT";
  syncRaceTournamentControls();
}

function syncRaceFinalLayerHealthSelect(values = null) {
  if (!elements.raceFinalLayerHealth) return;
  const layers = Array.isArray(values)
    ? values
    : [...elements.raceLayerFields.querySelectorAll('input[name="raceLayerStrength"]')]
      .map((input) => Number(input.value));
  const finalHealth = Number(layers[layers.length - 1]);
  const preset = ORB_RACE_FINAL_LAYER_PRESETS.find(({ value }) => value === finalHealth);
  elements.raceFinalLayerHealth.value = preset ? String(preset.value) : "custom";
}

function renderRaceLayerFields(values = null) {
  if (!elements.raceLayerFields || !elements.raceLayerCount) return;
  const count = normalizeRaceLayerCount(elements.raceLayerCount.value, settings.raceLayerCount);
  const source = values || [...elements.raceLayerFields.querySelectorAll('input[name="raceLayerStrength"]')]
    .map((input) => input.value);
  const layers = normalizeRaceLayers(source.length ? source : settings.raceLayerStrengths, settings.raceLayerStrengths, count);
  elements.raceLayerFields.innerHTML = layers.map((value, index) => `
    <label>NUMBER WALL ${index + 1}
      <input type="number" name="raceLayerStrength" min="1" max="${ORB_RACE_MAX_LAYER_STRENGTH}" value="${value}" />
    </label>
  `).join("");
  elements.raceTiltedLayerIndex.max = String(count);
  elements.raceTiltedLayerIndex.value = String(Math.min(
    count,
    Math.max(1, Number(elements.raceTiltedLayerIndex.value) || 1),
  ));
}

function selectLongFormRace() {
  elements.gameplayModeSelect.value = ORB_RACE_MODE;
  selectedRaceFormat = "long";
  elements.socialFormatSelect.value = "race-landscape";
  elements.raceLayerCount.value = String(ORB_RACE_LONGFORM_DEFAULT_LAYERS.length);
  elements.raceFinalLayerHealth.value = String(ORB_RACE_LONGFORM_DEFAULT_TARGET);
  renderRaceLayerFields(buildRaceLayerPreset(
    ORB_RACE_LONGFORM_DEFAULT_LAYERS.length,
    ORB_RACE_LONGFORM_DEFAULT_TARGET,
  ));
  syncSetupModeVisibility();
}

function selectShortFormRace() {
  elements.gameplayModeSelect.value = ORB_RACE_MODE;
  selectedRaceFormat = "short";
  elements.socialFormatSelect.value = "portrait";
  elements.raceLayerCount.value = String(ORB_RACE_DEFAULT_LAYERS.length);
  renderRaceLayerFields(ORB_RACE_DEFAULT_LAYERS);
  syncSetupModeVisibility();
}

function selectTournamentRace() {
  elements.gameplayModeSelect.value = ORB_RACE_MODE;
  selectedRaceFormat = "tournament";
  tournamentWizardPage = 1;
  tournamentPreviewMode = "landscape";
  tournamentSelectedMatchId = null;
  tournamentResumeArmed = false;
  tournamentPreviewSourceState = null;
  elements.raceTournamentTitle.value ||= "";
  ensureTournamentEntrantDefaults({ fill: true, trim: true });
  elements.socialFormatSelect.value = elements.raceTournamentRecordingScope.value === "each-match"
    ? "portrait"
    : "race-landscape";
  syncTournamentPresetControls({ forcePreset: true });
  syncSetupModeVisibility();
}

function buildMenu() {
  elements.orbMenu.innerHTML = validClasses.map((type, index) => {
    const def = CLASS_DEFS[type];
    return `<button class="menu-orb-card ${type}" data-profile="${type}" style="--orb-index:${index}; --fighter-color:${def.color}">
      <span class="menu-orb-sprite orb-preview ${type}" style="${classicPreviewStyle(type)}" aria-hidden="true"></span>
      <strong>${def.name}</strong><small>${def.ability}</small>
    </button>`;
  }).join("");

  elements.orbMenu.querySelectorAll("[data-profile]").forEach((button) => {
    button.addEventListener("click", () => showProfile(button.dataset.profile, 1));
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      button.style.setProperty("--pointer-x", `${((event.clientX - rect.left) / rect.width - 0.5) * 8}px`);
      button.style.setProperty("--pointer-y", `${((event.clientY - rect.top) / rect.height - 0.5) * 8}px`);
    });
    button.addEventListener("pointerleave", () => {
      button.style.removeProperty("--pointer-x");
      button.style.removeProperty("--pointer-y");
    });
  });
}

function buildClassControls() {
  const grids = [elements.classicTeamOneGrid, elements.classicTeamTwoGrid];
  if (grids.some((grid) => !grid)) return;
  const optionMarkup = (type, teamIndex) => {
    const def = CLASSIC_ORBS[type];
    const option = settings.classicTeamOptions?.[teamIndex]?.[type]
      || settings.classicOrbOptions?.[type]
      || classicOrbOptionDefaults(type);
    const selected = settings.classicTeams?.[teamIndex]?.includes(type) === true;
    return `<div class="classic-team-orb ${type}" style="--fighter-color:${def.color};--fighter-accent:${def.accent}">
      <label class="classic-team-option class-option ${type}">
        <input type="checkbox" name="classicTeamOrb" value="${type}" data-classic-team="${teamIndex}" ${selected ? "checked" : ""} />
        <span class="class-glyph orb-preview ${type}" style="${classicPreviewStyle(type)}" aria-hidden="true"></span>
        <span class="classic-orb-copy">
          <strong>${def.name}</strong>
          <small>${def.power}</small>
        </span>
      </label>
      <details class="classic-orb-options"${selected ? " open" : ""}>
        <summary>ORB OPTIONS</summary>
        <label class="classic-orb-count">QUANTITY
          <input type="number" min="1" max="${CLASSIC_MAX_ORB_COPIES}" step="1" value="${normalizeClassicOrbCount(option.count)}" data-classic-count data-classic-team="${teamIndex}" data-classic-orb="${type}" />
        </label>
        <label class="classic-orb-health">HP
          <input type="number" min="1" max="1000000" step="1" value="${normalizeClassicOrbHealth(option.health)}" data-classic-health data-classic-team="${teamIndex}" data-classic-orb="${type}" />
        </label>
        <label class="classic-orb-size">ORB SIZE
          <select data-classic-orb-scale data-classic-team="${teamIndex}" data-classic-orb="${type}">
            ${CLASSIC_ORB_SCALE_OPTIONS.map(({ value, label }) => `<option value="${value}"${value === option.orbScale ? " selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
        <label>ORB SPEED
          <select data-classic-speed-mode data-classic-team="${teamIndex}" data-classic-orb="${type}">
            ${CLASSIC_SPEED_MODES.map(({ id, label }) => `<option value="${id}"${id === option.speedMode ? " selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
        <label><input type="checkbox" data-classic-option="fadingTrails" data-classic-team="${teamIndex}" data-classic-orb="${type}"${option.fadingTrails ? " checked" : ""} /> FADING TRAIL</label>
        <label><input type="checkbox" data-classic-option="solidTrails" data-classic-team="${teamIndex}" data-classic-orb="${type}"${option.solidTrails ? " checked" : ""} /> SOLID TRAIL</label>
        <label><input type="checkbox" data-classic-option="collisionDamage" data-classic-team="${teamIndex}" data-classic-orb="${type}"${option.collisionDamage ? " checked" : ""} /> COLLISION DAMAGE</label>
        <label><input type="checkbox" data-classic-option="boss" data-classic-team="${teamIndex}" data-classic-orb="${type}"${option.boss ? " checked" : ""} /> BOSS ANNOUNCEMENT</label>
      </details>
    </div>`;
  };
  grids.forEach((grid, teamIndex) => {
    grid.innerHTML = validClasses.map((type) => optionMarkup(type, teamIndex)).join("");
    grid.addEventListener("change", (event) => {
      if (!event.target.matches('input[name="classicTeamOrb"]')) return;
      const panelScrollTop = elements.setupDialog.querySelector(".setup-panel")?.scrollTop ?? 0;
      const input = event.target;
      const details = input.closest(".classic-team-orb")?.querySelector("details");
      const order = classicTeamSelectionOrder[teamIndex] || [];
      classicTeamSelectionOrder[teamIndex] = input.checked
        ? [...order.filter((type) => type !== input.value), input.value]
        : order.filter((type) => type !== input.value);
      if (details) details.open = input.checked;
      restoreSetupDialogScroll(panelScrollTop);
    });
    grid.querySelectorAll("details.classic-orb-options").forEach((details) => {
      details.addEventListener("toggle", () => restoreSetupDialogScroll());
    });
  });
}

function populateProfile(type) {
  const profile = ORB_PROFILES[type];
  const def = CLASS_DEFS[type];
  const index = validClasses.indexOf(type);
  activeProfileType = type;
  elements.profileIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(validClasses.length).padStart(2, "0")}`;
  elements.profileOrb.className = `profile-orb orb-preview ${type}`;
  elements.profileOrb.setAttribute("style", classicPreviewStyle(type));
  elements.profileEpithet.textContent = profile.epithet;
  elements.profileName.textContent = def.name;
  elements.profileName.style.color = def.color;
  elements.profileWeapon.textContent = def.ability;
  elements.profileAbility.textContent = profile.ability;
  elements.profileBackstory.textContent = profile.backstory;
  elements.profileStrengths.innerHTML = profile.strengths.map((item) => `<li>${item}</li>`).join("");
  elements.profileWeaknesses.innerHTML = profile.weaknesses.map((item) => `<li>${item}</li>`).join("");
  const signatureStats = {
    sword: { value: 1, maximum: 20, display: "1" },
    bow: { value: 1, maximum: 20, display: "1" },
    potion: { value: 1, maximum: 20, display: "1" },
    axe: { value: 0, maximum: 100, display: "0%" },
    dagger: { value: Math.abs(def.weapon.angularSpeed), maximum: 12, display: `${Math.abs(def.weapon.angularSpeed).toFixed(2)}×` },
    katana: { value: 1, maximum: 20, display: "1" },
    duplicator: { value: 0, maximum: 12, display: "0" },
    orbital: { value: 0, maximum: 12, display: "0" },
    unarmed: { value: 1, maximum: 20, display: "1" },
    grower: { value: 1, maximum: 3, display: "100%" },
    slammy: { value: 1, maximum: 20, display: "1" },
  };
  const signature = signatureStats[type] || { value: 1, maximum: 1, display: "READY" };
  const startingDamage = def.classicAbility?.damage ?? def.ranged?.damage ?? def.weapon.damage ?? def.collision?.damage ?? 0;
  const stats = [
    { label: def.statLabel, ...signature },
    { label: "Starting damage", value: startingDamage, maximum: 20, display: Number(startingDamage).toFixed(0) },
    def.weapon.length > 0
      ? { label: "Reach", value: def.weapon.length, maximum: 76, display: String(def.weapon.length) }
      : { label: "Contact", value: 1, maximum: 1, display: "BODY" },
    def.ranged || def.classicAbility?.interval
      ? {
          label: "Fire interval",
          value: def.ranged?.interval || def.classicAbility.interval,
          maximum: 8,
          display: `${(def.ranged?.interval || def.classicAbility.interval).toFixed(1)}S`,
        }
      : { label: "Progression", value: 1, maximum: 1, display: "UNCAPPED" },
  ];
  elements.profileStats.innerHTML = stats.map(({ label, value, maximum, display }) => `
    <div><span>${label}</span><b>${display ?? Number(value).toFixed(label === "Reach" ? 0 : 1)}</b>
      <i><em style="width:${Math.min(100, (value / maximum) * 100)}%"></em></i></div>
  `).join("");
  const rating = profile.modes.duel;
  elements.profileModes.innerHTML = `
    <div><span>Social Battle</span><b aria-label="${rating} out of 5">${"●".repeat(rating)}${"○".repeat(5 - rating)}</b></div>
  `;
  elements.profileDots.innerHTML = validClasses.map((candidate, dotIndex) => `
    <button data-profile-dot="${candidate}" class="${dotIndex === index ? "active" : ""}" aria-label="${CLASS_DEFS[candidate].name}"></button>
  `).join("");
  elements.profileDots.querySelectorAll("[data-profile-dot]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = validClasses.indexOf(button.dataset.profileDot) > index ? 1 : -1;
      showProfile(button.dataset.profileDot, direction);
    });
  });
}

function showMenu(direction = -1) {
  elements.profileScreen.hidden = true;
  elements.gameScreen.hidden = true;
  elements.menuScreen.hidden = false;
  window.scrollTo(0, 0);
  animateScreen(elements.menuScreen, direction);
  elements.menuPlayButton.focus({ preventScroll: true });
}

function showProfile(type, direction = 1) {
  populateProfile(type);
  elements.menuScreen.hidden = true;
  elements.gameScreen.hidden = true;
  elements.profileScreen.hidden = false;
  window.scrollTo(0, 0);
  animateScreen(elements.profileScreen, direction);
  elements.profileName.focus?.({ preventScroll: true });
}

function showGame() {
  elements.menuScreen.hidden = true;
  elements.profileScreen.hidden = true;
  elements.gameScreen.hidden = false;
  window.scrollTo(0, 0);
  animateScreen(elements.gameScreen, 1);
}

function createSocialPresentationState(enabled = false) {
  return {
    ...createPresentationTimeline(enabled),
    started: !enabled,
    highlight: null,
    highlightUntil: 0,
    hitStopUntil: 0,
    impactFrame: null,
    winnerUntil: 0,
    raceTargetPromptUntil: 0,
    tournamentAnnouncerPending: false,
    tournamentAnnouncerMatchKey: null,
    odds: null,
    hypeScore: 0,
  };
}

function socialRenderOptions() {
  return {
    screenShake: settings.features.screenShake,
    flashReduction: settings.features.flashReduction,
    showWinProbability: settings.social.showWinProbability,
    classicBlackTheme: settings.gameplayMode === "classic" && settings.classicBlackTheme,
    classicTeamColors: settings.gameplayMode === "classic" && settings.classicTeamColors,
    raceTournament: settings.gameplayMode === ORB_RACE_MODE ? settings.raceTournament : null,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

function tournamentMatchAnnouncementKey() {
  const tournament = sim.raceTournament;
  const presentation = tournament?.presentation;
  return `${tournament?.tournamentId || "tournament"}:${presentation?.matchId || tournament?.currentMatchId || "match"}`;
}

function playRaceMatchupAnnouncement(now) {
  const longFormRace = settings.social.format === "race-landscape";
  const target = sim.raceLayerStrengths?.at(-1);
  audio.playRaceMatchup(
    {
      orbIds: sim.raceTeams?.[0]?.orbIds || [sim.fighters[0]?.raceOrbId],
      options: sim.raceTeamOptions?.[0],
    },
    {
      orbIds: sim.raceTeams?.[1]?.orbIds || [sim.fighters[1]?.raceOrbId],
      options: sim.raceTeamOptions?.[1],
    },
    {
      includePrompt: !longFormRace,
      includeMatchup: settings.raceMatchupAnnouncement,
      targetCue: longFormRace && settings.raceTargetAnnouncement
        ? raceTargetAnnouncerCueFor(target)
        : null,
    },
  );
  if (longFormRace && settings.raceShowTargetMessage) {
    socialPresentation.raceTargetPromptUntil = now + 4500;
  }
}

function updateSocialPresentation(elapsed, now) {
  updateSocialMetrics();
  if (socialPresentation.started && !sim.finished) {
    const advanced = advancePresentationTimeline(socialPresentation, elapsed);
    Object.assign(socialPresentation, advanced.state);
    for (const cue of advanced.cues) {
      if (cue === "matchup" && settings.gameplayMode === WORLD_CUP_MODE) {
        audio.playWorldCupMatchup(sim.fighters[0]?.countryId, sim.fighters[1]?.countryId);
      } else if (cue === "matchup" && settings.gameplayMode === ORB_RACE_MODE) {
        const tournamentRace = Boolean(settings.raceTournament && sim.raceTournament);
        const battleStarted = sim.raceTournament?.presentation?.phase === "battle";
        if (tournamentRace && !battleStarted) {
          socialPresentation.tournamentAnnouncerPending = true;
        } else {
          playRaceMatchupAnnouncement(now);
          if (tournamentRace) socialPresentation.tournamentAnnouncerMatchKey = tournamentMatchAnnouncementKey();
        }
      } else if (cue === "matchup" && settings.gameplayMode === "classic" && sim.classicTeams?.length === 2) {
        audio.playClassicMatchup(
          {
            orbIds: sim.classicTeams[0],
            options: sim.classicTeamOptions?.[0],
          },
          {
            orbIds: sim.classicTeams[1],
            options: sim.classicTeamOptions?.[1],
          },
        );
      } else if (cue === "matchup") audio.playMatchup(sim.fighters[0]?.type, sim.fighters[1]?.type);
      else audio.playAnnouncer(cue);
    }
  }
  if (
    socialPresentation.tournamentAnnouncerPending
    && settings.gameplayMode === ORB_RACE_MODE
    && settings.raceTournament
    && sim.raceTournament?.presentation?.phase === "battle"
  ) {
    const matchKey = tournamentMatchAnnouncementKey();
    if (socialPresentation.tournamentAnnouncerMatchKey !== matchKey) {
      playRaceMatchupAnnouncement(now);
      socialPresentation.tournamentAnnouncerMatchKey = matchKey;
    }
    socialPresentation.tournamentAnnouncerPending = false;
  }
  if (now >= socialPresentation.highlightUntil) socialPresentation.highlight = null;
  if (socialPresentation.impactFrame && now >= socialPresentation.impactFrame.endsAt) {
    socialPresentation.impactFrame = null;
  }
  elements.socialRecordingProgress.value = Math.min(60, socialRecorder.elapsed());
  if (socialRecorder.machine.state === RECORDER_STATES.RECORDING) {
    elements.socialRecordingDetail.textContent =
      `${SOCIAL_FORMATS[settings.social.format]?.label || settings.social.format.toUpperCase()} · ${settings.social.fps} FPS · ${socialRecorder.elapsed().toFixed(1)}S`;
  }
}

function updateSocialMetrics() {
  const odds = buildWinProbability(sim);
  socialPresentation.odds = odds;
  socialPresentation.hypeScore = buildHypeScore(sim, odds);
}

function tournamentMatchById(tournament, matchId) {
  if (!tournament || !matchId) return null;
  return tournament.rounds
    ?.flatMap((round) => round.matches || [])
    .find((match) => match.id === matchId) || null;
}

function consumeSocialEvents(now) {
  for (const event of sim.events) {
    if (event.id <= socialLastEventId) continue;
    socialLastEventId = event.id;
    if (event.type === "race-tournament-match-result" && tournamentRecorder.session) {
      const completedMatch = tournamentMatchById(sim.raceTournament, event.matchId);
      if (completedMatch) {
        tournamentRecorder.onMatchConclusion(completedMatch, {
          now: Number.isFinite(Number(event.conclusionAt))
            ? Number(event.conclusionAt)
            : sim.raceTournament.clock,
          winnerId: completedMatch.winnerId || event.advancingOrbId || null,
          loserId: completedMatch.loserId || event.eliminatedOrbId || null,
        });
      }
    }
    const pauseMs = settings.features.hitStop ? presentationPauseMs(event) : 0;
    if (pauseMs > 0) {
      socialPresentation.hitStopUntil = Math.max(socialPresentation.hitStopUntil, now + pauseMs);
      const impact = settings.gameplayMode === "classic" ? null : impactPresentationForEvent(event);
      const activePriority = socialPresentation.impactFrame?.priority ?? -1;
      if (impact && impact.priority >= activePriority) {
        socialPresentation.impactFrame = {
          eventId: event.id,
          kind: impact.kind,
          x: event.x,
          y: event.y,
          startedAt: now,
          endsAt: now + impact.duration,
          duration: impact.duration,
          shake: impact.shake,
          priority: impact.priority,
        };
      }
    }
    const highlight = settings.social.highlightMode ? detectHighlight(event, sim.fighters) : null;
    if (highlight) {
      socialPresentation.highlight = highlight;
      socialPresentation.highlightUntil = now + highlight.duration * 1000;
    }
  }
}

function socialSimulationRate(now) {
  // Normal previews still start gameplay while audio/recording initializes.
  // Duration-qualified Orb Race exports wait for the recorder so their one
  // matchup starts at the first captured action frame.
  const durationMatchedRace = settings.gameplayMode === ORB_RACE_MODE
    && !sim.raceTournament
    && settings.social.requireAnnouncer === true
    && Number(settings.social.minimumDurationSeconds) > 0
    && socialRecorder.supported();
  if (durationMatchedRace && socialRecorder.machine.state !== RECORDER_STATES.RECORDING) return 0;
  const actionPlaybackRate = durationMatchedRace
    ? Math.max(0.001, Math.min(1, Number(settings.social.actionPlaybackRate) || 1))
    : 1;
  if (socialPresentation.phase === "countdown") return 0;
  if (settings.features.hitStop && now < socialPresentation.hitStopUntil) return 0;
  if (
    settings.features.slowMotionHighlights &&
    socialPresentation.highlight &&
    socialPresentation.highlight.strength >= 0.75 &&
    now < socialPresentation.highlightUntil
  ) {
    return actionPlaybackRate * (socialPresentation.highlight.kind === "final-blow" ? 0.28 : 0.52);
  }
  return actionPlaybackRate;
}

async function startSocialRecording({ transitionOverride = null } = {}) {
  const requireAnnouncer = settings.social.requireAnnouncer === true;
  const audioReady = requireAnnouncer
    ? await audio.unlock()
    : await Promise.race([
      audio.unlock().catch(() => false),
      new Promise((resolve) => setTimeout(resolve, 700)),
    ]);
  if (requireAnnouncer) {
    const announcer = audio.announcerRecordingSnapshot();
    if (!audioReady || announcer.assetsReady !== true || announcer.loadedCueCount < 1) {
      throw new Error("Required announcer assets could not be loaded before recording.");
    }
  }
  socialRenderer.setFormat(settings.social.format);
  drawSocialBattle(performance.now(), false);
  if (!settings.features.videoRecording || !socialRecorder.supported()) {
    elements.socialRecordingStatus.textContent = "PREVIEW ONLY";
    elements.socialRecordingDetail.textContent =
      "Canvas recording is unavailable in this browser. The Social Battle remains fully playable.";
    elements.socialStopButton.disabled = true;
    socialPresentation.started = true;
    return;
  }
  try {
    elements.socialStopButton.disabled = false;
    elements.socialRecordingStatus.textContent = "STARTING RECORDER";
    if (settings.raceTournament && sim.raceTournament) {
      if (!tournamentRecorder.session) {
        beginTournamentRecorderSession(settings.raceTournament, tournamentRecordingRequest || {});
      }
      const activeMatch = sim.raceTournament.currentMatch;
      const tournamentMatch = activeMatch ? {
        ...activeMatch,
        recordingFormat: sim.raceTournament.recordingFormat,
        recordingDimensions: sim.raceTournament.recordingDimensions,
        recordingLayerCount: sim.raceTournament.recordingLayerCount,
        layerCount: sim.raceTournament.recordingLayerCount,
        cropToFinish: sim.raceTournament.recordingScope !== "each-match"
          && sim.raceTournament.recordingLayerCount === 3,
      } : null;
      const transition = transitionOverride || tournamentTransitionForRender();
      const activeMatchId = activeMatch?.id
        || sim.raceTournament?.activeMatchId
        || sim.raceTournament?.currentMatchId
        || null;
      const fallbackPresentation = tournamentRecordingPresentationContract("full-intro", {
        activeMatchId,
        toMatchId: activeMatchId,
      });
      const requestedPresentation = tournamentRecordingRequest?.presentation || {};
      const presentation = transition
        || {
          ...fallbackPresentation,
          ...requestedPresentation,
          activeMatchId: requestedPresentation.activeMatchId || activeMatchId,
          fromMatchId: requestedPresentation.fromMatchId ?? null,
          toMatchId: requestedPresentation.toMatchId || activeMatchId,
        };
      const segment = tournamentMatch
        ? await tournamentRecorder.onMatchIntro(tournamentMatch, {
          now: sim.raceTournament.clock,
          recorderOptions: {
            tournamentTransition: transition,
            presentation,
          },
        })
        : null;
      if (!segment) {
        elements.socialRecordingStatus.textContent = "TOURNAMENT MATCH NOT SELECTED FOR RECORDING";
        elements.socialRecordingDetail.textContent = "Gameplay continues; recording begins at the next included matchup.";
        elements.socialStopButton.disabled = true;
        socialPresentation.started = true;
        return;
      }
      segment.presentation = { ...presentation };
      if (tournamentRecordingRequest) {
        tournamentRecordingRequest = {
          ...tournamentRecordingRequest,
          presentation: { ...presentation },
          transition: transition ? { ...transition } : null,
        };
      }
    } else {
      await socialRecorder.start({ fps: settings.social.fps });
    }
    if (settings.gameplayMode === ORB_RACE_MODE && !sim.raceTournament) {
      socialRaceMatchupCount = 1;
      socialRaceActionStartedAt = performance.now();
      socialRaceActionEndedAt = null;
    }
    socialPresentation.started = true;
  } catch (error) {
    elements.socialRecordingStatus.textContent = "RECORDING UNAVAILABLE";
    elements.socialRecordingDetail.textContent = error.message;
    elements.socialStopButton.disabled = true;
    socialPresentation.started = true;
  }
}

function handleRecorderState(state, result = null) {
  if (result && tournamentRecorder.session) {
    socialRecordingResult = tournamentRecorder.onRecorderResult(result);
  }
  if (state === RECORDER_STATES.RECORDING) {
    elements.socialRecordingStatus.textContent = "RECORDING";
    elements.socialStopButton.disabled = false;
    elements.socialCancelButton.disabled = false;
  } else if (state === RECORDER_STATES.STOPPING) {
    elements.socialRecordingStatus.textContent = "FINALIZING";
    elements.socialStopButton.disabled = true;
  } else if (state === RECORDER_STATES.PREVIEW && result) {
    socialRecordingResult = socialRecordingResult || result;
    const shouldContinueAfterPreview = tournamentRecordingShouldContinueAfterPreview({
      scope: tournamentRecorder.session?.scope || tournamentRecordingScopeFor(),
      direct: tournamentRecordingRequest?.direct === true,
      tournamentCompleted: sim.raceTournament?.status === "completed",
    });
    if (tournamentAdvancePending && shouldContinueAfterPreview && sim.raceTournament && sim.raceTournament.status !== "completed") {
      tournamentAdvancePending = false;
      socialRecorder.reset();
      queueNextTournamentMatch();
      return;
    }
    elements.socialRecordingStatus.textContent = "EXPORT READY";
    showSocialPreview(result);
  } else if (state === RECORDER_STATES.CANCELLED) {
    elements.socialRecordingStatus.textContent = "CANCELLED";
  } else if (state === RECORDER_STATES.ERROR) {
    elements.socialRecordingStatus.textContent = "RECORDING ERROR";
  }
}

function showSocialPreview(result) {
  const previewResult = socialRecordingResult || result;
  elements.socialVideoPreview.src = previewResult.url;
  elements.socialDownloadButton.textContent = String(previewResult.mimeType || previewResult.blob?.type || "")
    .toLowerCase()
    .includes("webm")
    ? "DOWNLOAD WEBM"
    : "DOWNLOAD MP4";
  const raceTeamNames = sim.gameplayMode === ORB_RACE_MODE
    ? (sim.raceTeams || []).map((team) => team.name)
    : [];
  elements.socialCaption.value = raceTeamNames.length === 2
    ? `WHO WINS: ${raceTeamNames[0]} OR ${raceTeamNames[1]}?`
    : createCaption({ fighters: sim.fighters, winner: sim.winner });
  const arenaLabel = [sim.arenaModifierLabel || "STANDARD", sim.arenaSizeLabel || "STANDARD SIZE", sim.arenaShape === "circle" ? "CIRCLE" : "SQUARE"].join(" · ");
  const recordingMetadata = previewResult.metadata || {};
  const recordedMatchCount = Array.isArray(recordingMetadata.matchIds)
    ? recordingMetadata.matchIds.length
    : recordingMetadata.matchId ? 1 : null;
  const recordingScopeLabel = recordingMetadata.scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_TOURNAMENT
    ? "WHOLE TOURNAMENT"
    : recordingMetadata.scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND
      ? "SELECTED ROUND"
      : recordingMetadata.scope === TOURNAMENT_RECORDING_SCOPES.EACH_MATCH
        ? "EACH MATCH"
        : null;
  elements.socialVideoMetadata.innerHTML = [
    ["WINNER", sim.winningRaceTeamName || sim.winner?.name || "PENDING"],
    ["SEED", sim.seed],
    ["ARENA", arenaLabel],
    ["HYPE", socialPresentation.hypeScore],
    ["DURATION", `${previewResult.duration.toFixed(1)}S`],
    ["FORMAT", `${SOCIAL_FORMATS[settings.social.format]?.label || settings.social.format.toUpperCase()} · ${settings.social.fps} FPS`],
    ...(recordingScopeLabel ? [["RECORDING", recordingScopeLabel]] : []),
    ...(recordedMatchCount ? [["MATCHES", recordedMatchCount]] : []),
  ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("");
  if (!elements.socialPreviewDialog.open) elements.socialPreviewDialog.showModal();
}

function downloadSocialRecording() {
  if (!socialRecordingResult?.url) return;
  const link = document.createElement("a");
  link.href = socialRecordingResult.url;
  const filenameFighters = sim.gameplayMode === ORB_RACE_MODE
    ? (sim.raceTeams || []).map((team) => ({ name: team.name }))
    : sim.fighters;
  const requestedFilename = socialRecordingResult.filename
    || socialRecordingResult.metadata?.filename
    || recordingFilename({ fighters: filenameFighters, seed: sim.seed });
  const extension = String(socialRecordingResult.mimeType || socialRecordingResult.blob?.type || "")
    .toLowerCase()
    .includes("webm")
    ? "webm"
    : "mp4";
  link.download = String(requestedFilename).replace(/\.(?:mp4|webm)$/i, `.${extension}`);
  link.click();
}

function recordingResultSnapshot() {
  if (!socialRecordingResult) return null;
  return {
    available: Boolean(socialRecordingResult.url),
    filename: socialRecordingResult.filename || socialRecordingResult.metadata?.filename || null,
    duration: Number(socialRecordingResult.duration || 0),
    mimeType: socialRecordingResult.mimeType || "",
    recordingScope: socialRecordingResult.recordingScope
      || socialRecordingResult.metadata?.scope
      || null,
    metadata: socialRecordingResult.metadata ? { ...socialRecordingResult.metadata } : null,
  };
}

function animateScreen(node, direction) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || typeof node.animate !== "function") return;
  node.animate(
    [
      { opacity: 0, transform: `translateX(${direction * 32}px)` },
      { opacity: 1, transform: "translateX(0)" },
    ],
    { duration: 240, easing: "cubic-bezier(.2,.75,.25,1)" },
  );
}

function stepProfile(delta) {
  const index = validClasses.indexOf(activeProfileType);
  const next = validClasses[(index + delta + validClasses.length) % validClasses.length];
  showProfile(next, Math.sign(delta));
}

function simulationSettings(overrides = {}) {
  return {
    count: settings.gameplayMode === ORB_RACE_MODE
      ? raceTeamMemberCount(settings.raceTeams, settings.raceTeamOptions)
      : settings.gameplayMode === "classic"
        ? classicTeamMemberCount(settings.classicTeams, settings.classicTeamOptions)
        : 2,
    classes: settings.classes,
    classicOrbOptions: settings.classicOrbOptions,
    classicTeams: settings.classicTeams,
    classicTeamOptions: settings.classicTeamOptions,
    classicHydrogenHealth: settings.classicHydrogenHealth,
    seed: settings.seed,
    balance: settings.balance,
    hazardPreset: settings.hazardPreset,
    arenaModifier: settings.arenaModifier,
    arenaSize: settings.arenaSize,
    arenaShape: settings.arenaShape,
    gameplayMode: settings.gameplayMode,
    countries: settings.countries,
    raceOrbs: settings.raceOrbs,
    raceTeams: settings.raceTeams,
    raceTeamOptions: settings.raceTeamOptions,
    raceLayerCount: settings.raceLayerCount,
    raceLayerStrengths: settings.raceLayerStrengths,
    raceTiltedLayerEnabled: settings.raceTiltedLayerEnabled,
    raceTiltedLayerIndex: settings.raceTiltedLayerIndex,
    raceOrbScale: settings.raceOrbScale,
    raceTrails: settings.raceTrails,
    raceSolidTrails: settings.raceSolidTrails,
    raceScalingDamage: settings.raceScalingDamage,
    raceTournament: settings.gameplayMode === ORB_RACE_MODE
      ? tournamentSessionState && tournamentSessionSettingsKey === tournamentConfigKey(settings.raceTournament)
        ? tournamentSessionState
        : settings.raceTournament
      : null,
    social: settings.social,
    features: settings.features,
    ...overrides,
  };
}

function tournamentConfigKey(value) {
  if (!value) return "";
  return JSON.stringify({
    size: value.size,
    entrants: value.entrants,
    seedOrder: value.seedOrder,
    seedingMode: value.seedingMode,
    recordingScope: value.recordingScope,
    recordingSelection: value.recordingSelection,
    roundsToRecord: value.roundsToRecord,
    landscapeLayerCount: value.landscapeLayerCount,
    sharedLayerValues: value.sharedLayerValues,
    title: value.title,
  });
}

function createFightSpawnSeed() {
  fightSpawnSequence = (fightSpawnSequence + 1) >>> 0;
  const entropy = globalThis.crypto?.getRandomValues
    ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0]
    : Math.floor(Math.random() * 0x100000000);
  return (entropy ^ (Date.now() >>> 0) ^ Math.imul(fightSpawnSequence, 0x9e3779b9)) >>> 0 || fightSpawnSequence;
}

function launchBattle(nextSettings = settings, {
  syncUrl = true,
  enterGame = true,
  preserveTournamentSession = false,
  preserveTournamentRecording = false,
  transition = null,
} = {}) {
  const keepTournamentRecording = preserveTournamentRecording
    || (preserveTournamentSession
    && sim?.raceTournament
    && !tournamentRecordingShouldEnd());
  if (!keepTournamentRecording && socialRecorder.machine.state === RECORDER_STATES.RECORDING) socialRecorder.cancel();
  if (!keepTournamentRecording && socialRecorder.machine.state !== RECORDER_STATES.IDLE) socialRecorder.reset();
  if (!preserveTournamentSession) {
    clearTimeout(tournamentTransitionTimer);
    tournamentTransitionTimer = 0;
    tournamentAdvancePending = false;
    tournamentRecordingRequest = null;
    tournamentRecorder.reset();
    tournamentTransition = null;
  }
  if (transition) tournamentTransition = { ...transition };
  settings = normalizeSettings(nextSettings, validClasses);
  tournamentPreviewSourceState = null;
  const nextTournamentKey = tournamentConfigKey(settings.raceTournament);
  if (!preserveTournamentSession || !settings.raceTournament || tournamentSessionSettingsKey !== nextTournamentKey) {
    tournamentSessionState = null;
    tournamentSessionSettingsKey = settings.raceTournament ? nextTournamentKey : null;
    tournamentSelectedMatchId = null;
  }
  tournamentResumeArmed = false;
  classicTeamSelectionOrder = settings.classicTeams.map((team) => [...team]);
  applyTheme(settings.theme);
  if (syncUrl) updateUrl();
  if (enterGame) showGame();
  startSimulation({ tournamentTransition });
  applyFeatureVisibility();
}

function startSimulation({
  tournamentTransition: transition = tournamentTransition,
} = {}) {
  const continuingRecordedRace = socialRecorder.machine.state === RECORDER_STATES.RECORDING
    && settings.gameplayMode === ORB_RACE_MODE
    && !settings.raceTournament;
  if (continuingRecordedRace) {
    socialRaceMatchupCount += 1;
  } else {
    socialRaceMatchupCount = 0;
    socialRaceActionStartedAt = null;
    socialRaceActionEndedAt = null;
  }
  const options = simulationSettings({
    spawnSeed: settings.gameplayMode === WORLD_CUP_MODE ? createFightSpawnSeed() : settings.seed,
  });
  try {
    sim = createSimulation(options);
  } catch (error) {
    // Gameplay owns state restoration. Keep the UI session coordinator tolerant
    // while that pure restore seam lands in the shared tournament module.
    if (!options.raceTournament || !tournamentSessionState) throw error;
    tournamentSessionWarning = "Tournament state restore is not available yet; this match restarted from the saved preset.";
    tournamentSessionState = null;
    sim = createSimulation({ ...options, raceTournament: settings.raceTournament });
  }
  if (settings.raceTournament && sim.raceTournament) {
    alignFirstLongFormTournamentMatchup(sim.raceTournament);
    tournamentSessionState = sim.raceTournament;
    tournamentSessionSettingsKey = tournamentConfigKey(settings.raceTournament);
  }
  document.body.dataset.gameplayMode = settings.gameplayMode;
  document.body.dataset.classicTheme = settings.classicBlackTheme ? "black" : "light";
  audio.reset();
  const continuousTransition = transition?.mode === "pan-to-next";
  if (!continuousTransition) tournamentZoomCueKey = null;
  paused = false;
  accumulator = 0;
  socialLastEventId = 0;
  if (!continuousTransition) socialRecordingResult = null;
  socialPresentation = createSocialPresentationState(
    continuousTransition ? false : settings.features.introCards,
  );
  updateSocialMetrics();
  socialRenderer.setTheme(settings.theme);
  socialRenderer.setFormat(settings.social.format);
  elements.pauseButton.textContent = "II";
  elements.pauseButton.setAttribute("aria-label", "Pause simulation");
  elements.socialRecordingStatus.textContent = "PREPARING";
  elements.socialRecordingDetail.textContent = settings.gameplayMode === WORLD_CUP_MODE
    ? "World Cup mode · momentum collisions · pickup damage"
    : settings.gameplayMode === ORB_RACE_MODE
      ? settings.raceTournament
        ? `Orb Race Tournament · ${settings.raceTournament.size} entrants · ${settings.raceTournament.recordingScope === "each-match" ? "each match" : settings.raceTournament.recordingScope === "whole-round" ? "selected rounds" : "whole tournament"}`
        : "Orb Race · number layers · bounce damage"
      : "Dedicated canvas · browser chrome excluded";
  elements.socialRecordingProgress.value = 0;
  elements.socialStopButton.disabled = false;
  syncStatus();
  drawSocialBattle(performance.now(), socialRecorder.machine.state === RECORDER_STATES.RECORDING);
}

function syncStatus() {
  elements.matchClock.textContent = formatTime(sim.time);
  if (sim.finished) elements.matchStatus.textContent = "COMPLETE";
  else if (paused) elements.matchStatus.textContent = "PAUSED";
  else if (sim.overtimeStarted) elements.matchStatus.textContent = "OVERTIME";
  else elements.matchStatus.textContent = sim.time < 0.25 ? "READY" : "LIVE";
}

function tournamentRecordingShouldEnd() {
  const tournament = sim.raceTournament;
  if (!tournament || tournament.status === "completed") return true;
  if (tournament.recordingScope === "each-match") return true;
  if (tournament.recordingSelection === "whole-tournament") return false;
  return tournament.currentRoundIndex !== tournament.lastResult?.roundIndex;
}

function tournamentRecordingBoundary() {
  const tournament = sim.raceTournament;
  if (!tournament) return null;
  const match = tournamentMatchById(
    tournament,
    tournament.lastResult?.matchId || tournament.lastCompletedMatchId || tournament.currentMatchId,
  );
  const round = match ? tournament.rounds?.[match.roundIndex] : null;
  const roundCompleted = Boolean(round?.matches?.length && round.matches.every((candidate) => candidate.status === "completed"));
  const tournamentCompleted = tournament.status === "completed";
  const shouldStop = match && tournamentRecorder.session
    ? tournamentRecorder.shouldStopAfterMatch(match, { tournamentCompleted, roundCompleted })
    : tournamentCompleted || tournamentRecordingShouldEnd();
  return { match, roundCompleted, tournamentCompleted, shouldStop };
}

function finalizeTournamentRecordingBoundary(boundary) {
  const session = tournamentRecorder.session;
  if (!session) return null;
  const now = sim.raceTournament?.clock ?? null;
  if (session.scope === TOURNAMENT_RECORDING_SCOPES.EACH_MATCH) {
    return tournamentRecorder.markRecorderStopPending();
  }
  if (session.scope === TOURNAMENT_RECORDING_SCOPES.WHOLE_ROUND) {
    return tournamentRecorder.finalizeRound({
      roundIndex: boundary?.match?.roundIndex,
      now,
    });
  }
  return tournamentRecorder.finalizeTournament({ now });
}

function tournamentConclusionRecordingTailMs() {
  const duration = Number(
    sim.raceTournament?.presentation?.timestamps?.conclusionDuration
      ?? sim.raceTournament?.presentationTimestamps?.conclusionDuration,
  );
  if (!Number.isFinite(duration)) return 1_750;
  return Math.max(1_500, Math.min(2_000, duration * 1_000));
}

function queueNextTournamentMatch() {
  if (tournamentAdvancePending || !sim.raceTournament || sim.raceTournament.status === "completed") return;
  const continuousRecording = tournamentRecordingIsContinuous();
  tournamentAdvancePending = true;
  setTimeout(() => {
    tournamentAdvancePending = false;
    if (!sim.raceTournament || sim.raceTournament.status === "completed") return;
    const recorderActive = socialRecorder.machine.state === RECORDER_STATES.RECORDING;
    const transition = continuousRecording && recorderActive
      ? createTournamentMatchTransition(sim.raceTournament)
      : null;
    if (transition?.preserveRecorder) {
      tournamentTransition = transition;
      tournamentAdvancePending = true;
      clearTimeout(tournamentTransitionTimer);
      tournamentTransitionTimer = setTimeout(
        hydrateQueuedTournamentMatch,
        TOURNAMENT_INTER_MATCH_PAN_DURATION_MS,
      );
      return;
    }
    tournamentSessionState = sim.raceTournament;
    tournamentSessionSettingsKey = tournamentConfigKey(settings.raceTournament);
    launchBattle(settings, {
      syncUrl: false,
      preserveTournamentSession: true,
      preserveTournamentRecording: false,
    });
    void startSocialRecording();
  }, 0);
}

function finishBattle() {
  if (!sim.finished) return;
  if (settings.gameplayMode === ORB_RACE_MODE && !sim.raceTournament && socialRaceActionStartedAt !== null) {
    socialRaceActionEndedAt ??= performance.now();
  }
  if (!socialPresentation.winnerUntil) {
    socialPresentation.phase = "battle";
    socialPresentation.highlight = null;
    const tailMs = sim.raceTournament
      ? Math.max(MATCH_FINALE_RECORDING_TAIL_MS, tournamentConclusionRecordingTailMs())
      : MATCH_FINALE_RECORDING_TAIL_MS;
    socialPresentation.winnerUntil = performance.now() + tailMs;
  }
  if (performance.now() >= socialPresentation.winnerUntil) {
    const tournament = sim.raceTournament;
    if (tournament) {
      const boundary = tournamentRecordingBoundary();
      if (boundary?.tournamentCompleted) {
        tournamentAdvancePending = false;
        if (socialRecorder.machine.state === RECORDER_STATES.RECORDING) {
          finalizeTournamentRecordingBoundary(boundary);
          socialRecorder.stop();
        }
        return;
      }
      if (boundary?.shouldStop) {
        const shouldContinueAfterPreview = tournamentRecorder.shouldContinueAfterPreview({
          direct: tournamentRecordingRequest?.direct === true,
          tournamentCompleted: boundary.tournamentCompleted,
        });
        tournamentAdvancePending = shouldContinueAfterPreview;
        if (socialRecorder.machine.state === RECORDER_STATES.RECORDING) {
          finalizeTournamentRecordingBoundary(boundary);
          socialRecorder.stop();
        }
        return;
      }
      if (socialRecorder.machine.state === RECORDER_STATES.RECORDING) {
        queueNextTournamentMatch();
        return;
      }
      if (!tournamentRecordingRequest?.direct || tournamentRecordingIsContinuous()) {
        if (socialRecorder.machine.state === RECORDER_STATES.IDLE) {
          queueNextTournamentMatch();
        }
      }
      return;
    }
    if (socialRecorder.machine.state === RECORDER_STATES.RECORDING) socialRecorder.stop();
  }
}

function socialRaceActionDurationSeconds() {
  if (socialRaceActionStartedAt === null) return 0;
  const end = socialRaceActionEndedAt ?? performance.now();
  return Math.max(0, (end - socialRaceActionStartedAt) / 1000);
}

function drawSocialBattle(now, recording = socialRecorder.machine.state === RECORDER_STATES.RECORDING) {
  socialRenderer.draw(sim, {
    phase: socialPresentation.phase,
    phaseProgress: socialPresentation.phaseProgress,
    countdown: socialPresentation.countdown,
    odds: socialPresentation.odds,
    hypeScore: socialPresentation.hypeScore,
    highlight: socialPresentation.highlight,
    impactFrame: socialPresentation.impactFrame,
    raceTargetPrompt: now < socialPresentation.raceTargetPromptUntil
      ? sim.raceLayerStrengths?.[sim.raceLayerStrengths.length - 1]
      : null,
    tournamentTransition: tournamentTransitionForRender(now),
    now,
    recording,
    options: socialRenderOptions(),
  });
}

function frame(now) {
  const elapsed = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  updateSocialPresentation(elapsed, now);
  const gameplayActive =
    !elements.gameScreen.hidden &&
    !elements.setupDialog.open &&
    !elements.balanceDialog.open &&
    !elements.developerDialog.open &&
    !elements.socialPreviewDialog.open;
  // A finished tournament match still owns a deterministic conclusion clock.
  // Continue fixed-step updates so the full reveal remains inside recording.
  const tournamentHandoffActive = Boolean(tournamentAdvancePending && tournamentTransition);
  if (gameplayActive && !paused && !tournamentHandoffActive && (!sim.finished || sim.raceTournament)) {
    accumulator += elapsed * socialSimulationRate(now);
    while (accumulator >= fixedStep) {
      stepSimulation(sim, fixedStep);
      accumulator -= fixedStep;
    }
  }
  const tournamentPresentation = sim.raceTournament?.presentation;
  if (tournamentPresentation?.phase === "bracket-zoom") {
    const cueKey = `${sim.raceTournament?.tournamentId || "tournament"}:${tournamentPresentation.matchId || sim.raceTournament?.currentMatchId || "match"}`;
    if (tournamentZoomCueKey !== cueKey) {
      tournamentZoomCueKey = cueKey;
      audio.play({
        type: "orb-race-tournament-zoom",
        id: Math.max(1, Number(sim.raceTournament?.clock * 120) || 1),
        gameplayMode: ORB_RACE_MODE,
      });
    }
  }
  audio.consume(sim.events);
  consumeSocialEvents(now);
  drawSocialBattle(now);
  syncStatus();
  finishBattle();
  requestAnimationFrame(frame);
}

function togglePause() {
  if (sim.finished) return;
  paused = !paused;
  elements.pauseButton.textContent = paused ? ">" : "II";
  elements.pauseButton.setAttribute("aria-label", paused ? "Resume simulation" : "Pause simulation");
  syncStatus();
}

function selectedClassicTeamsForSetup(featuredType = null) {
  const teams = settings.classicTeams.map((team) => [...team]);
  if (featuredType && !teams.flat().includes(featuredType)) {
    teams[0] = [featuredType, ...teams[0]];
  }
  return teams;
}

function openSetup({ origin = "game", featuredType = null, tournamentPage = null } = {}) {
  setupOrigin = origin;
  raceTeamSelectionOrder = settings.raceTeams.map((team) => [...team]);
  raceTournamentSeedOrder = settings.raceTournament?.seedOrder?.slice() || [];
  elements.seedInput.value = String(settings.seed);
  elements.hazardPreset.value = settings.hazardPreset;
  elements.arenaModifierSelect.value = settings.arenaModifier;
  elements.arenaSizeSelect.value = settings.arenaSize;
  elements.arenaShapeSelect.value = settings.arenaShape;
  elements.setupThemeSelect.value = settings.theme;
  elements.gameplayModeSelect.value = settings.gameplayMode;
  selectedRaceFormat = settings.gameplayMode === ORB_RACE_MODE
    ? settings.raceTournament ? "tournament" : settings.social.format === "race-landscape" ? "long" : "short"
    : selectedRaceFormat;
  if (selectedRaceFormat === "tournament") {
    tournamentWizardPage = tournamentPage == null
      ? tournamentResumeArmed ? 3 : 1
      : Math.max(1, Math.min(3, Number(tournamentPage) || 1));
    tournamentPreviewMode = "landscape";
    tournamentPreviewZoom = 1;
  } else {
    tournamentWizardPage = 1;
    tournamentPreviewMode = "portrait";
    tournamentPreviewZoom = 1;
  }
  const selectedTeams = selectedClassicTeamsForSetup(featuredType);
  classicTeamSelectionOrder = selectedTeams.map((team) => [...team]);
  elements.setupDialog.querySelectorAll('input[name="classicTeamOrb"]').forEach((input) => {
    const teamIndex = Number(input.dataset.classicTeam);
    input.checked = selectedTeams[teamIndex]?.includes(input.value) === true;
    const details = input.closest(".classic-team-orb")?.querySelector("details");
    if (details) details.open = input.checked;
  });
  elements.setupDialog.querySelectorAll("[data-classic-option]").forEach((input) => {
    const option = settings.classicTeamOptions[Number(input.dataset.classicTeam)]?.[input.dataset.classicOrb]
      || settings.classicOrbOptions[input.dataset.classicOrb]
      || classicOrbOptionDefaults(input.dataset.classicOrb);
    input.checked = option[input.dataset.classicOption] === true;
  });
  elements.setupDialog.querySelectorAll("input[data-classic-count]").forEach((input) => {
    const option = settings.classicTeamOptions[Number(input.dataset.classicTeam)]?.[input.dataset.classicOrb]
      || settings.classicOrbOptions[input.dataset.classicOrb]
      || classicOrbOptionDefaults(input.dataset.classicOrb);
    input.value = String(normalizeClassicOrbCount(option.count));
  });
  elements.setupDialog.querySelectorAll("input[data-classic-health]").forEach((input) => {
    const option = settings.classicTeamOptions[Number(input.dataset.classicTeam)]?.[input.dataset.classicOrb]
      || settings.classicOrbOptions[input.dataset.classicOrb]
      || classicOrbOptionDefaults(input.dataset.classicOrb);
    input.value = String(normalizeClassicOrbHealth(option.health));
  });
  elements.setupDialog.querySelectorAll("select[data-classic-speed-mode]").forEach((input) => {
    const option = settings.classicTeamOptions[Number(input.dataset.classicTeam)]?.[input.dataset.classicOrb]
      || settings.classicOrbOptions[input.dataset.classicOrb]
      || classicOrbOptionDefaults(input.dataset.classicOrb);
    input.value = option.speedMode;
  });
  elements.setupDialog.querySelectorAll("select[data-classic-orb-scale]").forEach((input) => {
    const option = settings.classicTeamOptions[Number(input.dataset.classicTeam)]?.[input.dataset.classicOrb]
      || settings.classicOrbOptions[input.dataset.classicOrb]
      || classicOrbOptionDefaults(input.dataset.classicOrb);
    input.value = String(option.orbScale ?? CLASSIC_DEFAULT_ORB_SCALE);
  });
  elements.classicBlackTheme.checked = settings.classicBlackTheme;
  elements.classicTeamColors.checked = settings.classicTeamColors;
  const selectedCountries = new Set(settings.countries);
  elements.setupDialog.querySelectorAll('input[name="countryType"]').forEach((input) => {
    input.checked = selectedCountries.has(input.value);
  });
  elements.setupDialog.querySelectorAll('input[name="raceTeamOrb"]').forEach((input) => {
    const teamIndex = Number(input.dataset.raceTeam);
    input.checked = settings.raceTeams[teamIndex]?.includes(input.value) || false;
    const details = input.closest(".race-team-orb")?.querySelector("details");
    if (details) details.open = input.checked;
  });
  const selectedTournamentEntrants = new Set(settings.raceTournament?.entrants || []);
  elements.raceTournamentSize.value = String(settings.raceTournament?.size || RACE_TOURNAMENT_BRACKET_SIZES[1]);
  elements.raceTournamentSeedingMode.value = settings.raceTournament?.seedingMode || RACE_TOURNAMENT_SEEDING_MODES[0];
  elements.raceTournamentRecordingScope.value = settings.raceTournament?.recordingScope || RACE_TOURNAMENT_RECORDING_SCOPES[0];
  elements.raceTournamentTitle.value = settings.raceTournament?.title === "ORB RACE TOURNAMENT"
    ? ""
    : settings.raceTournament?.title || "";
  elements.raceTournamentLayerCount.value = String(
    settings.raceTournament?.landscapeLayerCount || settings.raceTournament?.matchSettings?.layerCount || 5,
  );
  const tournamentHealth = settings.raceTournament?.matchSettings?.finalLayerHealth
    || (settings.raceTournament?.recordingScope === "each-match" ? 110 : 10_000);
  if ([...elements.raceTournamentFinalLayerHealth.options].some((option) => Number(option.value) === Number(tournamentHealth))) {
    elements.raceTournamentFinalLayerHealth.value = String(tournamentHealth);
  } else {
    elements.raceTournamentFinalLayerHealth.value = "custom";
  }
  elements.setupDialog.querySelectorAll('input[name="raceTournamentEntrant"]').forEach((input) => {
    input.checked = selectedTournamentEntrants.has(input.value);
  });
  renderRaceTournamentSeedList();
  if (selectedRaceFormat === "tournament" && !settings.raceTournament) {
    ensureTournamentEntrantDefaults({ fill: true, trim: true });
  }
  renderRaceTournamentRoundList();
  renderRaceTournamentLayerFields(settings.raceTournament?.sharedLayerValues || settings.raceTournament?.matchSettings?.layerStrengths);
  elements.setupDialog.querySelectorAll("input[data-race-option]").forEach((input) => {
    const teamIndex = Number(input.dataset.raceTeam);
    const option = settings.raceTeamOptions[teamIndex]?.[input.dataset.raceOrb];
    input.checked = option?.[input.dataset.raceOption] ?? input.dataset.raceOption === "scalingDamage";
  });
  elements.setupDialog.querySelectorAll("input[data-race-count]").forEach((input) => {
    const option = settings.raceTeamOptions[Number(input.dataset.raceTeam)]?.[input.dataset.raceOrb];
    input.value = String(option?.count || 1);
  });
  elements.setupDialog.querySelectorAll("select[data-race-orb-scale]").forEach((input) => {
    const option = settings.raceTeamOptions[Number(input.dataset.raceTeam)]?.[input.dataset.raceOrb];
    input.value = String(option?.orbScale ?? settings.raceOrbScale);
  });
  elements.setupDialog.querySelectorAll("select[data-race-speed-mode]").forEach((input) => {
    const option = settings.raceTeamOptions[Number(input.dataset.raceTeam)]?.[input.dataset.raceOrb];
    input.value = option?.speedMode || ORB_RACE_DEFAULT_SPEED_MODE;
  });
  elements.setupDialog.querySelectorAll("input[data-race-cage-duration]").forEach((input) => {
    const option = settings.raceTeamOptions[Number(input.dataset.raceTeam)]?.[input.dataset.raceOrb];
    input.value = String(normalizeRaceCageDuration(option?.cageDuration));
  });
  elements.setupDialog.querySelectorAll("input[data-race-combo]").forEach((input) => {
    const option = settings.raceTeamOptions[Number(input.dataset.raceTeam)]?.[input.dataset.raceOrb];
    input.checked = option?.comboAbilities?.includes(input.dataset.raceCombo) || false;
  });
  elements.raceLayerCount.value = String(settings.raceLayerCount);
  elements.raceTargetMessageToggle.checked = settings.raceShowTargetMessage;
  elements.raceTargetAudioToggle.checked = settings.raceTargetAnnouncement;
  elements.raceMatchupAudioToggle.checked = settings.raceMatchupAnnouncement;
  elements.raceTiltedLayerToggle.checked = settings.raceTiltedLayerEnabled;
  elements.raceTiltedLayerIndex.value = String(settings.raceTiltedLayerIndex + 1);
  renderRaceLayerFields(settings.raceLayerStrengths);
  elements.raceOrbScale.value = String(settings.raceOrbScale);
  elements.socialFormatSelect.value = settings.social.format;
  syncRaceFinalLayerHealthSelect(settings.raceLayerStrengths);
  elements.setupDialog.querySelectorAll('input[name="socialFps"]').forEach((input) => {
    input.checked = Number(input.value) === settings.social.fps;
  });
  elements.socialHighlightMode.checked = settings.social.highlightMode;
  elements.socialWinProbability.checked = settings.social.showWinProbability;
  elements.recordingSupportNote.textContent = socialRecorder.supported()
    ? "This browser records the dedicated canvas, announcer, and combat audio (MP4 where supported, otherwise WebM)."
    : "This browser cannot record the canvas. Social Battle will run in preview-only mode.";
  if (elements.raceTournamentSavedTitle) {
    const saved = readSavedTournament();
    elements.raceTournamentSavedTitle.textContent = saved
      ? `SAVED · ${saved.raceTournament.title || "ORB RACE TOURNAMENT"}`
      : "NO LOCAL SAVE";
  }
  syncSetupModeVisibility();
  elements.setupDialog.showModal();
  const setupPanel = elements.setupDialog.querySelector(".setup-panel");
  if (setupPanel) setupPanel.scrollTop = 0;
}

function readSetup() {
  const form = elements.setupDialog.querySelector("form");
  const data = new FormData(form);
  const classicTeams = normalizeClassicTeams([0, 1].map((teamIndex) => {
    const selected = new Set(
      [...form.querySelectorAll(`input[name="classicTeamOrb"][data-classic-team="${teamIndex}"]:checked`)]
        .map((input) => input.value),
    );
    return [
      ...(classicTeamSelectionOrder[teamIndex] || []).filter((orbId) => selected.delete(orbId)),
      ...selected,
    ];
  }), settings.classicTeams);
  const rawClassicTeamOptions = classicTeams.map((team, teamIndex) => Object.fromEntries(team.map((orbId) => {
    const options = {};
    form.querySelectorAll(`input[data-classic-team="${teamIndex}"][data-classic-orb="${orbId}"][data-classic-option]`).forEach((input) => {
      options[input.dataset.classicOption] = input.checked;
    });
    options.count = form.querySelector(
      `input[data-classic-team="${teamIndex}"][data-classic-orb="${orbId}"][data-classic-count]`,
    )?.value;
    options.speedMode = form.querySelector(
      `select[data-classic-team="${teamIndex}"][data-classic-orb="${orbId}"][data-classic-speed-mode]`,
    )?.value;
    options.orbScale = form.querySelector(
      `select[data-classic-team="${teamIndex}"][data-classic-orb="${orbId}"][data-classic-orb-scale]`,
    )?.value;
    options.health = form.querySelector(
      `input[data-classic-team="${teamIndex}"][data-classic-orb="${orbId}"][data-classic-health]`,
    )?.value;
    return [orbId, options];
  })));
  const classicTeamOptions = normalizeClassicTeamOptions(
    rawClassicTeamOptions,
    classicTeams,
    settings.classicOrbOptions,
  );
  const classes = [...new Set(classicTeams.flat())];
  const classicOrbOptions = normalizeClassicOrbOptions(
    Object.fromEntries(classicTeams.flatMap((team, teamIndex) => team.map((orbId) => [
      orbId,
      classicTeamOptions[teamIndex]?.[orbId],
    ]))),
    classes,
  );
  let countries = [...form.querySelectorAll('input[name="countryType"]:checked')].map((input) => input.value);
  if (countries.length < 2) countries = settings.countries;
  const raceTeams = normalizeRaceTeams([0, 1].map((teamIndex) => {
    const selected = new Set(
      [...form.querySelectorAll(`input[name="raceTeamOrb"][data-race-team="${teamIndex}"]:checked`)]
        .map((input) => input.value),
    );
    return [
      ...(raceTeamSelectionOrder[teamIndex] || []).filter((orbId) => selected.delete(orbId)),
      ...selected,
    ];
  }), settings.raceTeams);
  const rawRaceTeamOptions = raceTeams.map((team, teamIndex) => Object.fromEntries(team.map((orbId) => {
    const options = {};
    form.querySelectorAll(`input[data-race-team="${teamIndex}"][data-race-orb="${orbId}"][data-race-option]`).forEach((input) => {
      options[input.dataset.raceOption] = input.checked;
    });
    options.count = form.querySelector(
      `input[data-race-team="${teamIndex}"][data-race-orb="${orbId}"][data-race-count]`,
    )?.value;
    options.orbScale = form.querySelector(
      `select[data-race-team="${teamIndex}"][data-race-orb="${orbId}"][data-race-orb-scale]`,
    )?.value;
    options.speedMode = form.querySelector(
      `select[data-race-team="${teamIndex}"][data-race-orb="${orbId}"][data-race-speed-mode]`,
    )?.value;
    options.cageDuration = form.querySelector(
      `input[data-race-team="${teamIndex}"][data-race-orb="${orbId}"][data-race-cage-duration]`,
    )?.value;
    options.comboAbilities = [...form.querySelectorAll(
      `input[data-race-team="${teamIndex}"][data-race-orb="${orbId}"][data-race-combo]:checked`,
    )].map((input) => input.dataset.raceCombo);
    return [orbId, options];
  })));
  const raceOrbScale = normalizeRaceOrbScale(elements.raceOrbScale.value);
  const raceTeamOptions = normalizeRaceTeamOptions(rawRaceTeamOptions, raceTeams, { orbScale: raceOrbScale });
  const raceOrbs = [...new Set(raceTeams.flat())];
  const raceLayerCount = normalizeRaceLayerCount(elements.raceLayerCount.value, settings.raceLayerCount);
  const raceLayerStrengths = normalizeRaceLayers(
    [...form.querySelectorAll('input[name="raceLayerStrength"]')].map((input) => input.value),
    settings.raceLayerStrengths,
    raceLayerCount,
  );
  const raceTournament = raceTournamentDraft();
  if (raceTournament && !validateRaceTournamentSettings(raceTournament).valid) {
    syncRaceTournamentControls();
    return null;
  }
  return normalizeSettings(
    {
      ...settings,
      mode: "match",
      count: 2,
      gameplayMode: elements.gameplayModeSelect.value,
      countries,
      raceOrbs,
      raceTeams,
      raceTeamOptions,
      raceLayerCount,
      raceLayerStrengths,
      raceShowTargetMessage: elements.raceTargetMessageToggle.checked,
      raceTargetAnnouncement: elements.raceTargetAudioToggle.checked,
      raceMatchupAnnouncement: elements.raceMatchupAudioToggle.checked,
      raceTiltedLayerEnabled: elements.raceTiltedLayerToggle.checked,
      raceTiltedLayerIndex: Math.max(0, Number(elements.raceTiltedLayerIndex.value) - 1),
      raceOrbScale,
      raceTrails: false,
      raceSolidTrails: false,
      raceScalingDamage: true,
      classes,
      classicOrbOptions,
      classicTeams,
      classicTeamOptions,
      classicBlackTheme: elements.classicBlackTheme.checked,
      classicTeamColors: elements.classicTeamColors.checked,
      // Health controls were removed from setup; every newly started Classic
      // fighter uses the default 100 HP. The legacy field remains in settings
      // only so older shared URLs can still be decoded without errors.
      classicHydrogenHealth: 100,
      seed: Math.max(1, Number(elements.seedInput.value) || 2406),
      theme: elements.setupThemeSelect.value,
      hazardPreset: [WORLD_CUP_MODE, ORB_RACE_MODE].includes(elements.gameplayModeSelect.value)
        ? "none"
        : settings.features.hazards ? elements.hazardPreset.value : "none",
      arenaModifier: elements.arenaModifierSelect.value,
      arenaSize: elements.arenaSizeSelect.value,
      arenaShape: elements.arenaShapeSelect.value,
      social: {
        enabled: true,
        ...normalizeSocialOptions({
          format: elements.socialFormatSelect.value,
          fps: data.get("socialFps"),
          highlightMode: elements.socialHighlightMode.checked,
          showWinProbability: elements.socialWinProbability.checked,
        }),
      },
      raceTournament,
      tournament: null,
    },
    validClasses,
  );
}

function buildFeatureToggles() {
  const labels = {
    hazards: "Arena hazards",
    balanceLab: "Balance laboratory",
    shareableSeeds: "Shareable seeds",
    screenShake: "Social screen shake",
    hitStop: "Social hit-stop",
    slowMotionHighlights: "Slow-motion highlights",
    soundEffects: "Weapon + ability sounds",
    soundAmbience: "Arena ambience",
    soundMusic: "Victory stingers",
    soundAnnouncer: "Arena announcer",
    videoRecording: "Video recording",
    introCards: "Matchup announcer",
    flashReduction: "Flash reduction",
  };
  elements.featureToggles.innerHTML = Object.keys(labels).map((key) =>
    `<label><input type="checkbox" data-feature="${key}" ${settings.features[key] ? "checked" : ""} /><span>${labels[key]}</span></label>`,
  ).join("");
}

function applyFeatureVisibility() {
  elements.copyLinkButton.hidden = !settings.features.shareableSeeds;
  elements.balanceButton.hidden = !settings.features.balanceLab;
  elements.menuBalanceButton.hidden = !settings.features.balanceLab;
  elements.hazardFieldset.hidden = !settings.features.hazards;
  document.querySelectorAll(".new-class").forEach((node) => { node.hidden = !settings.features.newClasses; });
  audio.setCategoryEnabled("effects", settings.features.soundEffects);
  audio.setCategoryEnabled("ambience", settings.features.soundAmbience);
  audio.setCategoryEnabled("music", settings.features.soundMusic);
  audio.setCategoryEnabled("announcer", settings.features.soundAnnouncer);
}

function openBalanceLab() {
  elements.balanceScope.innerHTML =
    `<option value="global">GLOBAL MULTIPLIERS</option>` +
    validClasses.map((type) => `<option value="${type}">${CLASS_DEFS[type].name}</option>`).join("");
  renderBalanceControls();
  elements.balanceDialog.showModal();
}

function renderBalanceControls() {
  const scope = elements.balanceScope.value || "global";
  const values = scope === "global" ? settings.balance.global : settings.balance.classes[scope] || {};
  const labels = {
    damage: "WEAPON DAMAGE",
    orbSpeed: "ORB SPEED",
    reach: "WEAPON REACH",
    rotationSpeed: "ROTATION SPEED",
    hitCooldown: "HIT COOLDOWN",
    manaGain: "MANA GAIN",
    abilityRadius: "ABILITY RADIUS",
    statusDuration: "STATUS DURATION",
    pickupSpawnRate: "WORLD CUP PICKUP SPAWN RATE",
    projectileSpeed: "WORLD CUP PROJECTILE SPEED",
    pickupDamage: "WORLD CUP PICKUP DAMAGE",
  };
  const visibleKeys = scope === "global"
    ? BALANCE_KEYS
    : BALANCE_KEYS.filter((key) => key !== "pickupSpawnRate" && key !== "projectileSpeed" && key !== "pickupDamage");
  elements.balanceControls.innerHTML = visibleKeys.map((key) => {
    const value = values[key] ?? 1;
    return `<label class="balance-control${value !== 1 ? " modified" : ""}">
      <span>${labels[key]}${value !== 1 ? " · MODIFIED" : ""}</span>
      <input type="number" data-balance-key="${key}" min="0" max="4" step="0.05" value="${value}" />
    </label>`;
  }).join("");
  elements.balanceValidation.textContent = isBalanceModified(settings.balance)
    ? "Modified values are active for newly recorded fights."
    : "All values are at deterministic defaults.";
}

function commitBalanceControls() {
  const scope = elements.balanceScope.value || "global";
  const draft = structuredClone(settings.balance);
  const target = scope === "global" ? draft.global : (draft.classes[scope] ||= {});
  elements.balanceControls.querySelectorAll("[data-balance-key]").forEach((input) => {
    target[input.dataset.balanceKey] = Number(input.value);
  });
  settings.balance = sanitizeBalance(draft);
}

async function copyBattleLink() {
  if (!settings.features.shareableSeeds) return;
  updateUrl();
  const url = settingsToUrl(settings, location.href, validClasses).href;
  try {
    await navigator.clipboard.writeText(url);
    elements.socialRecordingStatus.textContent = "LINK COPIED";
  } catch {
    window.prompt("Copy deterministic Social Battle link:", url);
  }
}

function updateUrl() {
  if (!settings.features.shareableSeeds) return;
  const url = settingsToUrl(settings, location.href, validClasses);
  history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function formatTime(seconds) {
  const whole = Math.floor(seconds || 0);
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

elements.pauseButton.addEventListener("click", togglePause);
elements.homeButton.addEventListener("click", () => {
  cancelQueuedTournamentMatch();
  if (socialRecorder.machine.state === RECORDER_STATES.RECORDING) socialRecorder.cancel();
  showMenu(-1);
});
elements.menuPlayButton.addEventListener("click", () => openSetup({ origin: "menu" }));
elements.menuBalanceButton.addEventListener("click", openBalanceLab);
elements.menuDeveloperButton.addEventListener("click", () => {
  buildFeatureToggles();
  elements.developerDialog.showModal();
});
elements.profileBackButton.addEventListener("click", () => showMenu(-1));
elements.profilePlayButton.addEventListener("click", () => {
  openSetup({ origin: "profile", featuredType: activeProfileType });
});
elements.profilePreviousButton.addEventListener("click", () => stepProfile(-1));
elements.profileNextButton.addEventListener("click", () => stepProfile(1));
elements.menuThemeSelect.addEventListener("change", () => applyTheme(elements.menuThemeSelect.value));
elements.setupThemeSelect.addEventListener("change", () => applyTheme(elements.setupThemeSelect.value));
elements.gameplayModeSelect.addEventListener("change", () => {
  if (elements.gameplayModeSelect.value === ORB_RACE_MODE && !["short", "long", "tournament"].includes(selectedRaceFormat)) {
    selectedRaceFormat = elements.socialFormatSelect.value === "race-landscape" ? "long" : "short";
  }
  syncSetupModeVisibility();
});
elements.shortFormRaceButton.addEventListener("click", selectShortFormRace);
elements.longFormRaceButton.addEventListener("click", selectLongFormRace);
elements.tournamentRaceButton.addEventListener("click", selectTournamentRace);
elements.socialFormatSelect.addEventListener("change", () => {
  if (elements.gameplayModeSelect.value === ORB_RACE_MODE && selectedRaceFormat !== "tournament") {
    selectedRaceFormat = elements.socialFormatSelect.value === "race-landscape" ? "long" : "short";
  }
  syncSetupModeVisibility();
});
elements.setupDialog.addEventListener("focusin", (event) => {
  if (!event.target.matches('input[name="socialFps"]')) return;
  const panelScrollTop = elements.setupDialog.querySelector(".setup-panel")?.scrollTop ?? 0;
  restoreSetupDialogScroll(panelScrollTop);
});
elements.setupDialog.querySelectorAll('input[name="socialFps"]').forEach((input) => {
  input.addEventListener("change", () => {
    const panelScrollTop = elements.setupDialog.querySelector(".setup-panel")?.scrollTop ?? 0;
    restoreSetupDialogScroll(panelScrollTop);
  });
});
elements.raceOrbScale.addEventListener("change", () => {
  const scale = normalizeRaceOrbScale(elements.raceOrbScale.value);
  elements.setupDialog.querySelectorAll("select[data-race-orb-scale]").forEach((input) => {
    input.value = String(scale);
  });
});
function syncRaceLayerCountField() {
  if (raceLayerRenderTimer) clearTimeout(raceLayerRenderTimer);
  const count = normalizeRaceLayerCount(elements.raceLayerCount.value, settings.raceLayerCount);
  elements.raceLayerCount.value = String(count);
  if (
    elements.socialFormatSelect.value === "race-landscape"
    && elements.raceFinalLayerHealth.value !== "custom"
  ) {
    renderRaceLayerFields(buildRaceLayerPreset(count, elements.raceFinalLayerHealth.value));
  } else {
    renderRaceLayerFields();
  }
}
elements.raceLayerCount.addEventListener("input", () => {
  if (raceLayerRenderTimer) clearTimeout(raceLayerRenderTimer);
  raceLayerRenderTimer = setTimeout(() => {
    if (document.activeElement === elements.raceLayerCount) return;
    syncRaceLayerCountField();
  }, 260);
});
elements.raceLayerCount.addEventListener("change", syncRaceLayerCountField);
elements.raceLayerCount.addEventListener("blur", syncRaceLayerCountField);
elements.raceFinalLayerHealth.addEventListener("change", () => {
  if (elements.raceFinalLayerHealth.value === "custom") return;
  const count = normalizeRaceLayerCount(elements.raceLayerCount.value, settings.raceLayerCount);
  renderRaceLayerFields(buildRaceLayerPreset(count, elements.raceFinalLayerHealth.value));
});
elements.raceTiltedLayerToggle.addEventListener("change", syncSetupModeVisibility);
elements.raceLayerFields.addEventListener("input", (event) => {
  if (
    elements.socialFormatSelect.value === "race-landscape"
    && event.target.matches('input[name="raceLayerStrength"]')
  ) {
    elements.raceFinalLayerHealth.value = "custom";
  }
});
elements.randomSeedButton.addEventListener("click", () => {
  elements.seedInput.value = String(Math.floor(Math.random() * 999998) + 1);
});
elements.launchButton.addEventListener("click", async (event) => {
  event.preventDefault();
  const nextSettings = readSetup();
  if (!nextSettings) return;
  setupOrigin = "game";
  if (nextSettings.raceTournament) {
    await startTournamentRecordingWorkflow(nextSettings, {
      request: { automatic: true },
    });
    return;
  }
  elements.setupDialog.close();
  launchBattle(nextSettings, { preserveTournamentSession: tournamentResumeArmed });
  await startSocialRecording();
});
elements.setupDialog.addEventListener("close", () => {
  if (setupOrigin === "menu" || setupOrigin === "profile") {
    const returnScreen = setupOrigin;
    setupOrigin = "game";
    if (returnScreen === "profile") showProfile(activeProfileType, -1);
    else showMenu(-1);
  }
});
elements.soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  audio.setEnabled(soundEnabled);
  if (soundEnabled) audio.unlock();
  elements.soundButton.textContent = soundEnabled ? "SFX" : "MUTE";
  elements.soundButton.classList.toggle("active", soundEnabled);
  elements.soundButton.setAttribute("aria-pressed", String(soundEnabled));
});
elements.copyLinkButton.addEventListener("click", copyBattleLink);
elements.developerButton.addEventListener("click", () => {
  buildFeatureToggles();
  elements.developerDialog.showModal();
});
elements.applyFeaturesButton.addEventListener("click", (event) => {
  event.preventDefault();
  elements.featureToggles.querySelectorAll("[data-feature]").forEach((input) => {
    settings.features[input.dataset.feature] = input.checked;
  });
  settings = normalizeSettings(settings, validClasses);
  elements.developerDialog.close();
  applyFeatureVisibility();
  updateUrl();
});
elements.socialStopButton.addEventListener("click", () => {
  cancelQueuedTournamentMatch();
  elements.socialRecordingStatus.textContent = "FINALIZING";
  if (settings.raceTournament && tournamentRecorder.session) {
    finalizeTournamentRecordingBoundary(tournamentRecordingBoundary());
  }
  socialRecorder.stop();
});
elements.socialCancelButton.addEventListener("click", () => {
  cancelQueuedTournamentMatch();
  if (socialRecorder.machine.state === RECORDER_STATES.RECORDING) socialRecorder.cancel();
  openSetup();
});
elements.socialRetryButton.addEventListener("click", async () => {
  elements.socialPreviewDialog.close();
  elements.socialVideoPreview.removeAttribute("src");
  elements.socialVideoPreview.load();
  launchBattle(settings);
  await startSocialRecording();
});
elements.socialDownloadButton.addEventListener("click", downloadSocialRecording);
elements.socialCopyLinkButton.addEventListener("click", copyBattleLink);
elements.socialPreviewDialog.addEventListener("close", () => elements.socialVideoPreview.pause());
[
  ["masterVolume", "master"],
  ["effectsVolume", "effects"],
  ["ambienceVolume", "ambience"],
  ["musicVolume", "music"],
  ["announcerVolume", "announcer"],
].forEach(([elementId, key]) => {
  elements[elementId].addEventListener("input", () => {
    audio.setVolumes({ [key]: Number(elements[elementId].value) });
  });
});
elements.balanceButton.addEventListener("click", openBalanceLab);
elements.balanceScope.addEventListener("change", renderBalanceControls);
elements.balanceControls.addEventListener("input", (event) => {
  const input = event.target.closest("[data-balance-key]");
  if (!input) return;
  const scope = elements.balanceScope.value || "global";
  const draft = structuredClone(settings.balance);
  const target = scope === "global" ? draft.global : (draft.classes[scope] ||= {});
  const requestedValue = Number(input.value);
  target[input.dataset.balanceKey] = requestedValue;
  settings.balance = sanitizeBalance(draft);
  const cleanTarget = scope === "global" ? settings.balance.global : settings.balance.classes[scope] || {};
  const cleanValue = cleanTarget[input.dataset.balanceKey] ?? 1;
  input.value = String(cleanValue);
  input.closest(".balance-control").classList.toggle("modified", cleanValue !== 1);
  elements.balanceValidation.textContent = cleanValue === requestedValue
    ? "Modified value validated. It will apply to newly recorded fights."
    : "Value clamped to the supported deterministic range.";
});
elements.balanceControls.addEventListener("change", () => {
  commitBalanceControls();
  renderBalanceControls();
});
elements.balanceResetButton.addEventListener("click", () => {
  settings.balance = sanitizeBalance();
  renderBalanceControls();
});
elements.balanceRandomButton.addEventListener("click", () => {
  const draft = { global: {}, classes: {} };
  for (const key of BALANCE_KEYS) draft.global[key] = Math.round((0.75 + Math.random() * 0.5) * 100) / 100;
  settings.balance = sanitizeBalance(draft);
  renderBalanceControls();
});
elements.balanceExportButton.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(settings.balance, null, 2)], { type: "application/json" });
  const link = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: "orb-foundry-balance.json",
  });
  link.click();
  URL.revokeObjectURL(link.href);
});
elements.balanceImportButton.addEventListener("click", () => elements.balanceImportInput.click());
elements.balanceImportInput.addEventListener("change", async () => {
  const file = elements.balanceImportInput.files?.[0];
  if (!file) return;
  try {
    settings.balance = sanitizeBalance(JSON.parse(await file.text()));
    renderBalanceControls();
    elements.balanceValidation.textContent = "Balance JSON imported and validated.";
  } catch {
    elements.balanceValidation.textContent = "Import rejected: malformed JSON.";
  }
});
elements.balanceApplyButton.addEventListener("click", (event) => {
  event.preventDefault();
  commitBalanceControls();
  elements.balanceDialog.close();
  updateUrl();
});

window.addEventListener("keydown", (event) => {
  audio.unlock();
  if (event.code === "Space" && !elements.gameScreen.hidden && !document.querySelector("dialog[open]")) {
    event.preventDefault();
    togglePause();
  }
  if (!elements.profileScreen.hidden && event.key === "ArrowLeft") stepProfile(-1);
  if (!elements.profileScreen.hidden && event.key === "ArrowRight") stepProfile(1);
  if (event.key === "Escape" && !elements.profileScreen.hidden) showMenu(-1);
});
window.addEventListener("pointerdown", () => audio.unlock(), { once: true });

window.__ORB_FOUNDRY__ = {
  getState: () => ({
    settings: structuredClone(settings),
    screen: !elements.menuScreen.hidden
      ? "menu"
      : !elements.profileScreen.hidden
        ? "profile"
        : elements.socialPreviewDialog.open ? "social-preview" : "social-battle",
    seed: sim.seed,
    raceMatchupCount: socialRaceMatchupCount,
    raceActionDurationSeconds: socialRaceActionDurationSeconds(),
    arenaModifier: sim.arenaModifier,
    arenaSize: sim.arenaSize,
    arenaSizeLabel: sim.arenaSizeLabel,
    arenaShape: sim.arenaShape,
    raceTournament: settings.gameplayMode === ORB_RACE_MODE ? settings.raceTournament : null,
    raceTournamentSnapshot: settings.gameplayMode === ORB_RACE_MODE ? currentTournamentSnapshot() : null,
    tournamentRecordingRequest,
    tournamentTransition: tournamentTransitionForRender(),
    tournamentSessionWarning,
    hypeScore: socialPresentation.hypeScore,
    time: sim.time,
    finished: sim.finished,
    overtime: sim.overtimeStarted,
    recorder: socialRecorder.machine.state,
    recordingResult: recordingResultSnapshot(),
    announcer: audio.announcerRecordingSnapshot(),
    tournament: settings.gameplayMode === ORB_RACE_MODE ? {
      settings: settings.raceTournament,
      snapshot: currentTournamentSnapshot(),
      recordingRequest: tournamentRecordingRequest,
      transition: tournamentTransitionForRender(),
      warning: tournamentSessionWarning,
    } : null,
    phase: socialPresentation.phase,
    countdown: socialPresentation.countdown,
    fighters: sim.fighters.map(({ id, name, type, health, mana, alive, x, y, vx, vy, weaponAngle, damage, abilityKind, abilityValue, abilityRate, rangedInterval, rangedCooldown, rangedShots, rangedHits }) => ({
      id, name, type, health, mana, alive, x, y, vx, vy, weaponAngle, damage, abilityKind, abilityValue, abilityRate, rangedInterval, rangedCooldown, rangedShots, rangedHits,
    })),
  }),
  restart: () => launchBattle(settings),
  launch: (nextSettings) => launchBattle(nextSettings),
  record: async (nextSettings) => {
    const preparedSettings = normalizeSettings(nextSettings, validClasses);
    if (preparedSettings.raceTournament) {
      return startTournamentRecordingWorkflow(preparedSettings, {
        request: { automatic: true },
      });
    }
    launchBattle(preparedSettings);
    await startSocialRecording();
    return true;
  },
  copyLink: copyBattleLink,
  saveTournament: saveTournamentToBrowser,
  resumeTournament: resumeTournamentFromBrowser,
  openTournamentBracket: openTournamentBracketPreview,
  requestTournamentMatchRecording: requestSelectedTournamentMatchRecording,
};

window.render_game_to_text = () => JSON.stringify({
  coordinateSystem: "Canvas origin is top-left; x increases right and y increases down.",
  screen: !elements.menuScreen.hidden
    ? "menu"
    : !elements.profileScreen.hidden
      ? "profile"
      : elements.socialPreviewDialog.open
        ? "social-preview"
        : "social-battle",
  match: {
    seed: sim.seed,
    raceMatchupCount: socialRaceMatchupCount,
    raceActionDurationSeconds: socialRaceActionDurationSeconds(),
    gameplayMode: sim.gameplayMode,
    hill: sim.hill ? {
      x: sim.hill.x,
      y: sim.hill.y,
      radius: sim.hill.radius,
      controllerId: sim.hill.controllerId,
      contested: sim.hill.contested,
    } : null,
    pickupSpawnRate: sim.worldCupPickupSpawnRate,
    projectileSpeed: sim.worldCupProjectileSpeed,
    pickupDamage: sim.worldCupPickupDamage,
    arenaModifier: sim.arenaModifier,
    arenaSize: sim.arenaSize,
    arenaSizeLabel: sim.arenaSizeLabel,
    arenaShape: sim.arenaShape,
    hypeScore: socialPresentation.hypeScore,
    time: Number(sim.time.toFixed(2)),
    finished: sim.finished,
    winner: sim.winningRaceTeamName || sim.winner?.name || null,
    recorder: socialRecorder.machine.state,
    recordingResult: recordingResultSnapshot(),
    raceTournament: settings.gameplayMode === ORB_RACE_MODE ? {
      settings: settings.raceTournament,
      snapshot: currentTournamentSnapshot(),
      recordingRequest: tournamentRecordingRequest,
      transition: tournamentTransitionForRender(),
      warning: tournamentSessionWarning,
    } : null,
    classicTeams: (sim.classicTeams || []).map((team, teamIndex) => ({
      orbIds: team,
      memberCount: (sim.fighters || []).filter((fighter) => fighter.classicTeamIndex === teamIndex).length,
      name: sim.classicTeamNames?.[teamIndex] || "",
      displayParts: sim.classicTeamDisplayParts?.[teamIndex] || [],
      outlineColor: settings.classicTeamColors ? classicTeamOutlineColorFor(teamIndex) : null,
    })),
    classicTeamColorsEnabled: settings.gameplayMode === "classic" && settings.classicTeamColors,
    raceTeams: (sim.raceTeams || []).map((team) => ({
      name: team.name,
      orbIds: team.orbIds,
      layerIndex: team.raceLayerIndex,
      layerHealth: team.raceLayerHealth,
      damagePerSecond: Number((team.raceDamagePerSecond || 0).toFixed(2)),
      readyToFinish: team.raceReadyToFinish,
    })),
    fighters: sim.fighters.filter((fighter) => fighter.alive).map((fighter) => {
      const combatStats = worldCupCombatStats(fighter, sim.time);
      return {
      name: fighter.name,
      type: fighter.type,
      countryId: fighter.countryId,
      raceOrbId: fighter.raceOrbId,
      raceCopyIndex: fighter.raceCopyIndex,
      raceAbilityIds: fighter.raceAbilityIds,
      raceCaged: fighter.raceCaged === true,
      raceCageActive: fighter.raceCageActive === true,
      raceCageRemaining: Number((fighter.raceCageRemaining || 0).toFixed(2)),
      raceAntimatterCountdown: Number((fighter.raceAntimatterCountdownElapsed || 0).toFixed(2)),
      raceAntimatterDetonations: fighter.raceAntimatterDetonationCount || 0,
      raceAntimatterCooldownSeconds: Number((fighter.raceAntimatterCooldownSeconds || 0).toFixed(2)),
      raceAntimatterCollapseProgress: Number((fighter.raceAntimatterCollapseProgress || 0).toFixed(3)),
      raceAntimatterOpponentDestroyed: fighter.raceAntimatterOpponentDestroyed === true,
      raceAntimatterDustEffects: (fighter.raceAntimatterDustEffects || []).map((effect) => ({
        age: Number((effect.age || 0).toFixed(2)),
        lifetime: effect.lifetime || 0,
        x: Number((effect.x || 0).toFixed(3)),
        y: Number((effect.y || 0).toFixed(3)),
      })),
      raceTimeBombCycleElapsed: Number((fighter.raceTimeBombCycleElapsed || 0).toFixed(2)),
      raceTimeBombFreezeRemaining: Math.max(0, Number(((fighter.raceTimeBombFreezeUntil || 0) - sim.time).toFixed(2))),
      raceTimeBombCycleCount: fighter.raceTimeBombCycleCount || 0,
      raceTimeBombPulseElapsed: Number((fighter.raceTimeBombPulseElapsed || 0).toFixed(2)),
      raceTimeBombPulseActive: fighter.raceTimeBombPulseActive === true,
      raceTimeBombPulseHitIds: [...(fighter.raceTimeBombPulseHitIds || [])],
      raceTimeBombInfiniteDamageRemaining: Math.max(0, Number(((fighter.raceTimeBombInfiniteDamageUntil || 0) - sim.time).toFixed(2))),
      raceTimeBombFreezeActive: fighter.raceTimeBombFreezeActive === true,
      raceRealityNextSpawnIn: Math.max(0, Number(((fighter.raceRealityNextSpawnAt || 0) - sim.time).toFixed(2))),
      raceRealitySpawnSequence: fighter.raceRealitySpawnSequence || 0,
      raceRealitySpawns: (fighter.raceRealitySpawns || []).map((spawn) => ({
        raceOrbId: spawn.raceOrbId,
        raceDamage: Number((spawn.raceDamage || 0).toFixed(2)),
        raceBounces: spawn.raceBounces || 0,
        raceSpawnProgress: Number((spawn.raceSpawnProgress || 0).toFixed(3)),
        x: Number((spawn.raceX || 0).toFixed(3)),
        y: Number((spawn.raceY || 0).toFixed(3)),
      })),
      symbol: fighter.raceOrbId === "quadratic"
        ? `x^${Math.max(1, (fighter.raceBounces || 0) + 1)}`
        : fighter.raceOrbId === "super-x-power" ? "x^x"
        : fighter.raceSymbol,
      raceDamage: fighter.raceOrbId === "meteor"
        ? fighter.raceMeteorDamage || fighter.raceDamage || 0
        : fighter.raceDamage || 0,
      breakerCritChance: fighter.raceOrbId === "breaker"
        ? Number((fighter.raceBreakerCritChance || 1).toFixed(2))
        : null,
      squareRootHits: fighter.raceOrbId === "square-root" ? fighter.raceSquareRootHits || 0 : null,
      laserDamageInterval: fighter.raceOrbId === "lazer"
        ? Number((fighter.raceLaserDamageInterval ?? 0.1).toFixed(8))
        : null,
      laserIntervalLevel: fighter.raceOrbId === "lazer"
        ? raceLaserIntervalLevelFor(fighter)
        : null,
      laserAngle: fighter.raceOrbId === "lazer"
        ? Number((fighter.raceLaserAngle || 0).toFixed(4))
        : null,
      laserDamageTicks: fighter.raceOrbId === "lazer" ? fighter.raceLaserDamageTicks || 0 : null,
      twinsHealing: fighter.raceOrbId === "twins" ? fighter.raceTwinHealing === true : null,
      twinsDamageMultiplier: fighter.raceOrbId === "twins"
        ? fighter.raceTwinHealing === true ? 2 : 1
        : null,
      twinsDamage: fighter.raceOrbId === "twins"
        ? Number(((fighter.raceDamage || 0) * (fighter.raceTwinHealing === true ? 2 : 1)).toFixed(2))
        : null,
      twinsHealingRemaining: fighter.raceOrbId === "twins"
        ? Math.max(0, Number(((fighter.raceTwinHealingUntil || 0) - sim.time).toFixed(2)))
        : null,
      twinsTeleportCount: fighter.raceOrbId === "twins" ? fighter.raceTwinTeleportCount || 0 : null,
      twinsHealTicks: fighter.raceOrbId === "twins" ? fighter.raceTwinHealTicks || 0 : null,
      twinsLastHeal: fighter.raceOrbId === "twins" ? fighter.raceTwinLastHeal || 0 : null,
      twinsSecondOrb: fighter.raceOrbId === "twins" && fighter.raceTwinOrb ? {
        x: Number((fighter.raceTwinOrb.raceX || 0).toFixed(3)),
        y: Number((fighter.raceTwinOrb.raceY || 0).toFixed(3)),
        damage: Number((fighter.raceTwinOrb.raceDamage || 0).toFixed(2)),
        bounces: fighter.raceTwinOrb.raceBounces || 0,
      } : null,
      scissorSplitCount: fighter.raceOrbId === "scissor" ? fighter.raceScissorSplitCount || 0 : null,
      scissorSplitEffects: fighter.raceOrbId === "scissor"
        ? (fighter.raceScissorSplitEffects || []).map((effect) => ({
          age: Number((effect.age || 0).toFixed(2)),
          lifetime: effect.lifetime || 0,
          layerIndex: effect.layerIndex,
        }))
        : [],
      progressiveDamage: fighter.raceOrbId === "progressive" ? fighter.raceProgressiveDamage || 1 : null,
      progressiveUseCount: fighter.raceOrbId === "progressive" ? fighter.raceProgressiveUseCount || 0 : null,
      progressiveCooldown: fighter.raceOrbId === "progressive"
        ? Number((fighter.raceProgressiveCooldown || 0).toFixed(2))
        : null,
      randomMaxDamage: fighter.raceOrbId === "random" ? fighter.raceRandomMaxDamage || 1 : null,
      randomLastDamage: fighter.raceOrbId === "random" ? fighter.raceRandomLastDamage || 1 : null,
      speed: fighter.raceSpeed || 0,
      duplicates: fighter.raceDuplicates || 0,
      orbiters: fighter.raceOrbiters || 0,
      drills: fighter.raceDrills || 0,
      drillDrag: fighter.raceDrillDrag || 0,
      boomerangs: fighter.raceBoomerangs || 0,
      boomerangLevel: fighter.raceBoomerangLevel || 0,
      magnetPull: Number((fighter.raceMagnetPull || 0).toFixed(2)),
      ricochetCannonDamage: fighter.raceRicochetProjectiles?.[0]?.damage || 0,
      grapplerDamage: fighter.raceGrapplerDamage || 0,
      grapplerShots: fighter.raceGrapplerShots || 0,
      grapplerHits: fighter.raceGrapplerHits || 0,
      grapplerCooldown: Math.max(0, Number(((fighter.raceGrapplerNextFireAt || 0) - sim.time).toFixed(2))),
      grapplerGunAngle: Number((fighter.raceGrapplerGunAngle || 0).toFixed(3)),
      grapplerProjectiles: (fighter.raceGrapplerProjectiles || []).map((projectile) => ({
        id: projectile.id,
        x: Number((projectile.x || 0).toFixed(3)),
        y: Number((projectile.y || 0).toFixed(3)),
        vx: Number((projectile.vx || 0).toFixed(3)),
        vy: Number((projectile.vy || 0).toFixed(3)),
        layerIndex: projectile.layerIndex,
        damage: projectile.damage || 0,
        ricochets: projectile.ricochets || 0,
      })),
      grapplerPull: fighter.raceGrapplerPull ? {
        layerIndex: fighter.raceGrapplerPull.layerIndex,
        targetX: Number((fighter.raceGrapplerPull.targetX || 0).toFixed(3)),
        targetY: Number((fighter.raceGrapplerPull.targetY || 0).toFixed(3)),
        anchorX: Number((fighter.raceGrapplerPull.anchorX || 0).toFixed(3)),
        anchorY: Number((fighter.raceGrapplerPull.anchorY || 0).toFixed(3)),
        elapsed: Number((fighter.raceGrapplerPull.elapsed || 0).toFixed(3)),
        duration: fighter.raceGrapplerPull.duration || 0,
        launchSpeed: fighter.raceGrapplerPull.launchSpeed || 0,
      } : null,
      grapplerAnchor: fighter.raceGrapplerAnchor ? {
        x: Number((fighter.raceGrapplerAnchor.x || 0).toFixed(3)),
        y: Number((fighter.raceGrapplerAnchor.y || 0).toFixed(3)),
        layerIndex: fighter.raceGrapplerAnchor.layerIndex,
      } : null,
      grapplerRope: fighter.raceGrapplerRope ? {
        x1: Number((fighter.raceGrapplerRope.x1 || 0).toFixed(3)),
        y1: Number((fighter.raceGrapplerRope.y1 || 0).toFixed(3)),
        x2: Number((fighter.raceGrapplerRope.x2 || 0).toFixed(3)),
        y2: Number((fighter.raceGrapplerRope.y2 || 0).toFixed(3)),
        length: Number((fighter.raceGrapplerRope.length || 0).toFixed(3)),
        attached: fighter.raceGrapplerRope.attached === true,
      } : null,
      grapplerAttached: fighter.raceGrapplerAttached === true,
      grapplerLaunchSpeed: fighter.raceGrapplerLaunchSpeed || 0,
      grapplerMomentum: fighter.raceGrapplerMomentum || 0,
      poisonLevel: fighter.racePoisonLevel || 0,
      poisonActiveTicks: fighter.racePoisonActiveTicks || 0,
      poisonDamagePerTick: fighter.racePoisonDamagePerTick || 0,
      poisonDamagePerSecond: fighter.racePoisonDamagePerSecond || 0,
      poisonLayerIndex: fighter.racePoisonLayerIndex ?? -1,
      poisonTotal: fighter.racePoisonTotal || 0,
      batmanGrappleCooldown: Math.max(0, Number(((fighter.raceBatmanGrappleNextAt || 0) - sim.time).toFixed(2))),
      batmanGrappleShots: fighter.raceBatmanGrappleShots || 0,
      batmanGrapple: fighter.raceBatmanGrapple ? {
        id: fighter.raceBatmanGrapple.id,
        phase: fighter.raceBatmanGrapple.phase,
        sourceId: fighter.raceBatmanGrapple.sourceId,
        sourceEventType: fighter.raceBatmanGrapple.sourceEventType,
        startX: Number((fighter.raceBatmanGrapple.startX || 0).toFixed(3)),
        startY: Number((fighter.raceBatmanGrapple.startY || 0).toFixed(3)),
        targetX: Number((fighter.raceBatmanGrapple.targetX || 0).toFixed(3)),
        targetY: Number((fighter.raceBatmanGrapple.targetY || 0).toFixed(3)),
        elapsed: Number((fighter.raceBatmanGrapple.elapsed || 0).toFixed(3)),
        hookProgress: Number((fighter.raceBatmanGrapple.hookProgress || 0).toFixed(3)),
        pullProgress: Number((fighter.raceBatmanGrapple.pullProgress || 0).toFixed(3)),
      } : null,
      artistsPaintingName: fighter.raceArtistPaintingName || "READY",
      artistsPaintingIndex: fighter.raceArtistPaintingIndex ?? -1,
      artistsPaintingDamage: fighter.raceArtistPaintingDamage || 0,
      artistsPaintingsCompleted: fighter.raceArtistPaintingsCompleted || 0,
      artistsAbilityProgress: Math.round(fighter.raceArtistAbilityProgress || 0),
      artistsActivePainting: fighter.raceArtistActivePainting ? {
        index: fighter.raceArtistActivePainting.index,
        name: ORB_RACE_ARTIST_PAINTINGS?.[fighter.raceArtistActivePainting.index]?.name || null,
        layerIndex: fighter.raceArtistActivePainting.layerIndex,
        progress: Number((fighter.raceArtistActivePainting.progress || 0).toFixed(3)),
        damage: fighter.raceArtistActivePainting.damage || 0,
      } : null,
      artistsPaintingEffects: (fighter.raceArtistPaintingEffects || []).map((effect) => ({
        index: effect.index,
        x: Number((effect.x || 0).toFixed(3)),
        y: Number((effect.y || 0).toFixed(3)),
        age: Number((effect.age || 0).toFixed(2)),
        lifetime: effect.lifetime || 0,
        damage: effect.damage || 0,
      })),
      artistsDrawings: (fighter.raceArtistDrawings || []).map((drawing) => ({
        type: drawing.type || drawing.paintingName || null,
        x: Number((drawing.x || 0).toFixed(3)),
        y: Number((drawing.y || 0).toFixed(3)),
        age: Number((drawing.age || 0).toFixed(2)),
        lifetime: drawing.lifetime || 0,
      })),
      artistsStormStrikes: (fighter.raceArtistStormStrikes || []).length,
      artistsSummons: (fighter.raceArtistSummons || []).map((summon) => ({
        type: summon.type || summon.name || null,
        x: Number((summon.x || 0).toFixed(3)),
        y: Number((summon.y || 0).toFixed(3)),
        age: Number((summon.age || 0).toFixed(2)),
        lifetime: summon.lifetime || 0,
        phase: summon.phase || summon.state || null,
      })),
      artistsHealingTotal: fighter.raceArtistHealingTotal || 0,
      artistsStormStrikeCount: fighter.raceArtistStormStrikeCount || 0,
      pancakeFlipCount: fighter.racePancakeFlipCount || 0,
      pancakeFlipProgress: Number((fighter.racePancakeFlipProgress || 0).toFixed(3)),
      pancakeFlipPhase: fighter.racePancakeFlipPhase || "flip",
      pancakeSide: fighter.racePancakeSide || 1,
      pancakeLandingPatch: fighter.racePancakeLandingPatch || "syrup",
      pancakeHeldFor: Math.max(0, Number(((fighter.racePancakeHeldUntil || 0) - sim.time).toFixed(2))),
      pancakeHoldLayerIndex: fighter.racePancakeHoldLayerIndex ?? -1,
      pancakeStackCount: fighter.racePancakeStackCount || 0,
      pancakeStackDamage: fighter.racePancakeStackDamage || 0,
      pancakeActiveStack: fighter.racePancakeActiveStack ? {
        x: Number((fighter.racePancakeActiveStack.x || 0).toFixed(3)),
        y: Number((fighter.racePancakeActiveStack.y || 0).toFixed(3)),
        count: fighter.racePancakeActiveStack.count || fighter.racePancakeActiveStack.stackCount || 0,
        damage: fighter.racePancakeActiveStack.damage || 0,
      } : null,
      pancakeStacks: (fighter.racePancakeStacks || []).length,
      pancakePatches: (fighter.racePancakePatches || []).length,
      pancakePatchLayers: (fighter.racePancakePatches || []).map((patch) => patch.layerIndex),
      pancakeButterPatches: (fighter.racePancakeButterPatches || []).length,
      pancakeButterPatchLayers: (fighter.racePancakeButterPatches || []).map((patch) => patch.layerIndex),
      pancakeButterMeteors: (fighter.racePancakeButterMeteors || []).length,
      pancakeButterMeteorCount: fighter.racePancakeButterMeteorCount || 0,
      pancakeButterHornActive: (fighter.racePancakeButterHornUntil || 0) > sim.time,
      treeRootsCharge: fighter.raceTreeCharge || 0,
      treeRootsActive: fighter.raceTreeRootsActive === true,
      treeRootsTimeRemaining: Math.max(0, Number(((fighter.raceTreeRootsUntil || 0) - sim.time).toFixed(2))),
      treeRootsFadeRemaining: Math.max(0, Number(((fighter.raceTreeRootsFadeUntil || 0) - sim.time).toFixed(2))),
      treeRootDamage: fighter.raceTreeRootDamage || 0,
      treeRootDamagePerSecond: fighter.raceTreeRootDamagePerSecond || 0,
      treeRootDamagePerLayer: fighter.raceTreeRootDamagePerLayer || 0,
      treeRootLayerDrain: fighter.raceTreeRootLayerDrain || fighter.raceTreeRootDrainByLayer || [],
      treeSavedVelocity: {
        vx: fighter.raceTreeSavedVx || 0,
        vy: fighter.raceTreeSavedVy || 0,
      },
      treeRootTicks: fighter.raceTreeRootTicks || 0,
      commanderBombs: fighter.raceCommanderBombs || 0,
      commanderMissiles: fighter.raceCommanderMissiles || 0,
      commanderProjectiles: fighter.raceCommanderProjectiles?.length || 0,
      commanderDronePositions: fighter.raceOrbId === "commander"
        ? [0, 1].map((index) => raceCommanderDronePosition(fighter, index, sim.time))
        : [],
      shrapnelFragments: fighter.raceShrapnelFragments?.length || 0,
      shrapnelFragmentsSpawned: fighter.raceShrapnelFragmentsSpawned || 0,
      shrapnelBursts: fighter.raceShrapnelBursts || 0,
      rouletteAbsorbed: fighter.raceRouletteAbsorbHistory || [],
      rouletteAbsorbedOrbs: fighter.raceRouletteAbsorbedOrbHistory || [],
      rouletteAbsorbedColors: fighter.raceRouletteAbsorbedColors || [],
      rouletteAbsorbing: (fighter.raceRouletteAbsorbingUntil || 0) > sim.time,
      rouletteCurrentAbility: fighter.raceRouletteAbsorbedAbilityId || null,
      rouletteAbilityIds: (fighter.raceAbilityIds || []).filter((abilityId) => (
        ["mines", "speed", "sticky", "orbital", "meteor", "slammy", "reactor", "black-hole", "drill"].includes(abilityId)
      )),
      rouletteAbsorbLevels: fighter.raceRouletteAbsorbLevels || {},
      architectBuilds: fighter.raceArchitectBuilds || 0,
      architectBuilding: Boolean(fighter.raceArchitectPendingType),
      architectStructures: fighter.raceArchitectStructures?.map((structure) => structure.type) || [],
      mines: fighter.raceMineProjectiles?.length || 0,
      mineLevel: fighter.raceMineLevel || 0,
      mineCooldown: Number((fighter.raceMineCooldown || 0).toFixed(2)),
      gravity: fighter.raceGravityMode || null,
      gravityLevel: fighter.raceGravityLevel || 0,
      jackpotCooldown: Number((fighter.raceJackpotCooldown || 0).toFixed(2)),
      jackpotOutcome: fighter.raceJackpotOutcome || null,
      jackpotTier: fighter.raceJackpotTier || null,
      jackpotMultiplier: fighter.raceJackpotMultiplier || 1,
      jackpotSlots: fighter.raceJackpotSlots || [],
      jackpotSlotMultipliers: fighter.raceJackpotSlotMultipliers || [],
      jackpotSpinning: fighter.raceJackpotSpinUntil > sim.time,
      jackpots: fighter.raceJackpots || 0,
      meteorShots: fighter.raceMeteorShots || 0,
      meteorApexShots: fighter.raceMeteorApexShots || 0,
      meteorSmallDamage: fighter.raceMeteorSmallDamage || 0,
      meteorGiantDamage: fighter.raceMeteorGiantDamage || 0,
      meteorCooldown: Number((fighter.raceMeteorAbilityCooldown || 0).toFixed(2)),
      meteorAbilityProgress: Math.round(fighter.raceMeteorAbilityProgress || 0),
      meteorHornActive: fighter.raceMeteorHornUntil > sim.time,
      meteorGiantActive: fighter.raceMeteorGiantProjectiles?.length || 0,
      meteorLayerHits: fighter.raceMeteorLayerHits || 0,
      meteorBurnLayers: (fighter.raceMeteorBurns || []).map((burn) => burn.layerIndex),
      blackHolePower: Number((fighter.raceBlackHolePower || 0).toFixed(2)),
      blackHoleCooldown: Number((fighter.raceBlackHoleAbilityCooldown || 0).toFixed(2)),
      blackHoleAbilityProgress: Math.round(fighter.raceBlackHoleAbilityProgress || 0),
      blackHoleActive: fighter.raceBlackHoleActive === true,
      blackHoleScale: Number((fighter.raceBlackHoleScale || 1).toFixed(3)),
      blackHoleSuctionDamagePerSecond: fighter.raceBlackHoleSuctionDamagePerSecond || 0,
      blackHoleSuctionTotal: Number((fighter.raceBlackHoleSuctionTotal || 0).toFixed(2)),
      blackHoleAbilityUses: fighter.raceBlackHoleAbilityUses || 0,
      blackHoleTeleportPhase: fighter.raceBlackHoleTeleportPhase || "idle",
      blackHoleVisible: fighter.raceBlackHoleVisible !== false,
      centyPercent: fighter.raceCentyPercent || 0,
      chargerInterval: Number((fighter.raceChargerInterval || 0).toFixed(2)),
      chargerSlams: fighter.raceChargerSlams || 0,
      bouncerMiniOrbs: fighter.raceBouncerOrbs?.length || 0,
      hackerFacing: fighter.raceHackerFacing < 0 ? -1 : 1,
      hackerPhase: fighter.raceHackerPhase || "inactive",
      hackerSpawnedOrbs: (fighter.raceHackerSpawnedOrbs || []).map((child) => ({
        id: child.id,
        orbId: child.raceOrbId,
        kind: child.raceHackerChildKind,
        sourceId: child.raceHackerSourceId || null,
        sourceRadiusScale: Number((child.raceHackerSourceRadiusScale || 0).toFixed(3)),
        x: Number((child.raceX || 0).toFixed(3)),
        y: Number((child.raceY || 0).toFixed(3)),
        bounces: child.raceBounces || 0,
        remaining: Number((child.raceHackerHydrogenRemaining || 0).toFixed(2)),
        damage: Number((child.raceDamage || 0).toFixed(2)),
        abilityIds: Array.isArray(child.raceAbilityIds) ? [...child.raceAbilityIds] : [],
      })),
      minerState: fighter.raceMinerState || "inactive",
      minerUpgradeProgress: Number((fighter.raceMinerUpgradeProgress || 0).toFixed(3)),
      minerDrillProgress: Number((fighter.raceMinerDrillProgress || 0).toFixed(3)),
      blueSunActive: fighter.raceBlueSunActive === true,
      blueSunPowerLevel: fighter.raceBlueSunPowerLevel || 0,
      blueSunDamagePerLaser: fighter.raceBlueSunDamagePerLaser || 0,
      blueSunLaserHits: fighter.raceBlueSunLayerHits || 0,
      blueSunLaserAngles: (fighter.raceBlueSunLaserAngles || []).map((angle) => Number(Number(angle).toFixed(4))),
      blueSunLasers: (fighter.raceBlueSunLasers || []).map((laser) => ({
        index: laser.index,
        startX: Number((laser.startX || 0).toFixed(3)),
        startY: Number((laser.startY || 0).toFixed(3)),
        endX: Number((laser.endX || 0).toFixed(3)),
        endY: Number((laser.endY || 0).toFixed(3)),
        layerIndex: laser.layerIndex,
        hitLayer: laser.hitLayer === true,
        hitSurface: laser.hitSurface || null,
      })),
      purpleSunActive: fighter.racePurpleSunActive === true,
      purpleSunCharge: Number((fighter.racePurpleSunCharge || 0).toFixed(3)),
      purpleSunPowerLevel: fighter.racePurpleSunPowerLevel || 0,
      purpleSunBeamDamage: fighter.racePurpleSunBeamDamage || 0,
      purpleSunBeam: fighter.racePurpleSunBeam ? {
        startX: Number((fighter.racePurpleSunBeam.startX || 0).toFixed(3)),
        startY: Number((fighter.racePurpleSunBeam.startY || 0).toFixed(3)),
        endX: Number((fighter.racePurpleSunBeam.endX || 0).toFixed(3)),
        endY: Number((fighter.racePurpleSunBeam.endY || 0).toFixed(3)),
        layerIndex: fighter.racePurpleSunBeam.layerIndex,
        hitLayer: fighter.racePurpleSunBeam.hitLayer === true,
      } : null,
      phaseThreeSunActive: fighter.racePhaseThreeSunActive === true,
      phaseThreeSunPowerLevel: fighter.racePhaseThreeSunPowerLevel || 0,
      phaseThreeSunDamagePerLaser: fighter.racePhaseThreeSunDamagePerLaser || 0,
      phaseThreeSunLaserScale: Number((fighter.racePhaseThreeSunLaserScale || 0).toFixed(3)),
      phaseThreeSunLaserHits: fighter.racePhaseThreeSunLayerHits || 0,
      phaseTwoSunActive: fighter.racePhaseTwoSunActive === true,
      phaseTwoSunPowerLevel: fighter.racePhaseTwoSunPowerLevel || 0,
      phaseTwoSunDamagePerLaser: fighter.racePhaseTwoSunDamagePerLaser || 0,
      phaseTwoSunLaserHits: fighter.racePhaseTwoSunLayerHits || 0,
      phaseTwoSunBurnLayerIndex: fighter.racePhaseTwoSunBurnLayerIndex ?? -1,
      phaseTwoSunBurnUntil: Number((fighter.racePhaseTwoSunBurnUntil || 0).toFixed(3)),
      trifectaLayerHits: fighter.raceTrifectaLayerHits || 0,
      trifectaShockwaves: fighter.raceTrifectaShockwaveCount || 0,
      gravitatorPullLevel: Number((fighter.raceGravitatorPullLevel || 0).toFixed(3)),
      gravitatorAttached: fighter.raceGravitatorAttached === true,
      professorActiveOrbId: fighter.raceProfessorActiveOrbId || null,
      professorRouletteVisualOrbId: fighter.raceProfessorRouletteVisualOrbId || null,
      professorRouletteOrbIds: fighter.raceProfessorRouletteOrbIds || [],
      professorActiveUntil: Number((fighter.raceProfessorActiveUntil || 0).toFixed(3)),
      professorSpinCount: fighter.raceProfessorSpinCount || 0,
      lucasIndex: fighter.raceLucasIndex || 0,
      snakeTailOrbs: fighter.raceSnakeTailOrbs || 0,
      snakeCount: (fighter.raceSnakeOrbs?.length || 0) + 1,
      vampireStealPercent: fighter.raceVampireStealPercent || 0,
      vampireDamageStolen: Number((fighter.raceVampireDamageStolen || 0).toFixed(2)),
      turretDuration: Number((fighter.raceTurretDuration || 0).toFixed(2)),
      turrets: fighter.raceTurrets?.length || 0,
      turretBombs: fighter.raceTurretBombs?.length || 0,
      turretProjectiles: (fighter.raceTurretBombs || []).map((bomb) => ({
        x: Number((bomb.x || 0).toFixed(3)),
        y: Number((bomb.y || 0).toFixed(3)),
        vx: Number((bomb.vx || 0).toFixed(3)),
        vy: Number((bomb.vy || 0).toFixed(3)),
        angle: Number((bomb.angle || 0).toFixed(3)),
        wallBounces: bomb.wallBounces || 0,
      })),
      leechLevel: fighter.raceLeechLevel || 0,
      leechDamageStolen: Number((fighter.raceLeechDamageStolen || 0).toFixed(2)),
      crusherWeight: fighter.raceCrusherWeight || 0,
      crusherCracks: fighter.raceCrusherCracks?.length || 0,
      berserkerRage: fighter.raceBerserkerRage || 0,
      berserkerRageActive: fighter.raceBerserkerRageActive === true,
      berserkerHorn: (fighter.raceBerserkerHornUntil || 0) > sim.time,
      berserkerHornCount: fighter.raceBerserkerHornCount || 0,
      berserkerAxeVisible: fighter.raceBerserkerAxeVisible === true,
      berserkerAxeSwinging: (fighter.raceBerserkerAxeSwingUntil || 0) > sim.time
        && fighter.raceBerserkerAxeSwingLocked !== true,
      berserkerAxeLocked: fighter.raceBerserkerAxeSwingLocked === true,
      berserkerAxeSwings: fighter.raceBerserkerAxeSwings || 0,
      reactorCharge: fighter.raceReactorCharge || 0,
      reactorDamage: fighter.raceReactorDamage || 0,
      reactorUses: fighter.raceReactorUses || 0,
      parasiteInterval: Number((fighter.raceParasiteInterval || 0).toFixed(2)),
      parasites: fighter.raceParasites?.length || 0,
      draftUpgrades: fighter.raceDraftUpgradeCount || 0,
      draftDamageLevel: fighter.raceDraftDamageLevel || 0,
      draftProjectileLevel: fighter.raceDraftProjectileLevel || 0,
      draftSpeedLevel: fighter.raceDraftSpeedLevel || 0,
      draftLastUpgrade: fighter.raceDraftLastUpgrade || "waiting",
      draftUpgradeCalloutVisible: (fighter.raceDraftUpgradeCalloutUntil || 0) > sim.time,
      draftUpgradeCooldown: Math.max(0, Number(((fighter.raceDraftNextUpgradeAt || 0) - sim.time).toFixed(2))),
      draftSwordCooldown: Math.max(0, Number(((fighter.raceDraftNextSwordAt || 0) - sim.time).toFixed(2))),
      draftSwordSwinging: (fighter.raceDraftSwordSwingUntil || 0) > sim.time
        && fighter.raceDraftSwordSwingLocked !== true,
      draftSwordLocked: fighter.raceDraftSwordSwingLocked === true,
      draftSwordSwings: fighter.raceDraftSwordSwings || 0,
      draftSwordHits: fighter.raceDraftSwordHits || 0,
      draftGunCooldown: Math.max(0, Number(((fighter.raceDraftNextFireAt || 0) - sim.time).toFixed(2))),
      draftGunShots: fighter.raceDraftGunShots || 0,
      draftGunReloading: (fighter.raceDraftGunSpinUntil || 0) > sim.time,
      draftBullets: fighter.raceDraftBullets?.length || 0,
      needlePiercedDamage: fighter.raceNeedlePiercedDamage || 0,
      multiplier: fighter.raceMultiplier || 0,
      sniperDamage: fighter.raceSniperDamage || 0,
      sniperShots: fighter.raceSniperShots || 0,
      sniperHits: fighter.raceSniperHits || 0,
      sniperBullets: fighter.raceSniperBullets?.length || 0,
      snowballSize: fighter.raceSnowballSize || 0,
      snowballHits: fighter.raceSnowballHits || 0,
      snowballRotation: fighter.raceSnowballRotation || 0,
      snowballFalling: fighter.raceSnowballFalling === true,
      countdown: fighter.raceCountdown || 0,
      countdownBlasts: fighter.raceCountdownBlasts || 0,
      copycatDamage: fighter.raceCopycatDamage || 0,
      copycatSourceId: fighter.raceCopycatSourceId || null,
      copycatActiveOrbId: fighter.raceCopycatActiveAbilityId || null,
      copycatVisualOrbId: fighter.raceCopycatVisualOrbId || null,
      copycatRouletteOrbIds: [...(fighter.raceCopycatRouletteOrbIds || [])],
      lagGlitchActive: fighter.raceLagGlitchActive === true,
      lagGlitchCount: fighter.raceLagGlitchCount || 0,
      lagGlitchDuration: fighter.raceLagGlitchDuration || 0,
      lagGlitchRemaining: Math.max(0, Number(((fighter.raceLagGlitchUntil || 0) - sim.time).toFixed(2))),
      lagGlitchDamagePerTick: fighter.raceLagGlitchDamagePerTick || 0,
      lagGlitchDamagePerSecond: fighter.raceLagGlitchDamagePerSecond || 0,
      lagGlitchTickInterval: fighter.raceLagGlitchTickInterval || 0,
      lagGlitchChance: fighter.raceLagGlitchChance || 0,
      whirlwindDamage: fighter.raceWhirlwindDamage || 0,
      whirlwindHits: fighter.raceWhirlwindHits || 0,
      whirlwindLineContacts: [...(fighter.raceWhirlwindLineHitIndices || [])],
      rgbColorIndex: fighter.raceRgbColorIndex || 0,
      criticalChance: fighter.raceCriticalChance || 0,
      criticalHits: fighter.raceCriticalHits || 0,
      draftImpacts: fighter.raceDraftImpactEffects?.length || 0,
      godzillaStompDamage: fighter.raceGodzillaStompDamage || 0,
      godzillaSwipeDamage: fighter.raceGodzillaSwipeDamage || 0,
      godzillaBeamDamagePerSecond: fighter.raceGodzillaBeamDamagePerSecond || 0,
      godzillaStomps: fighter.raceGodzillaStomps || 0,
      godzillaSwipes: fighter.raceGodzillaSwipes || 0,
      godzillaHeavyLandings: fighter.raceGodzillaHeavyLandings || 0,
      godzillaBeamLayerHits: fighter.raceGodzillaBeamLayerHits || 0,
      godzillaAbilityCooldown: Number((fighter.raceGodzillaAbilityCooldown || 0).toFixed(2)),
      godzillaAbilityProgress: Math.round(fighter.raceGodzillaAbilityProgress || 0),
      godzillaAbilityUses: fighter.raceGodzillaAbilityUses || 0,
      godzillaAbilityPhase: fighter.raceGodzillaAbilityPhase || "idle",
      godzillaAttackKind: fighter.raceGodzillaAttackKind || "none",
      godzillaBreathDirection: fighter.raceGodzillaBreathDirection || "down",
      godzillaWanderSpeed: Number((fighter.raceGodzillaWanderSpeed || 0).toFixed(3)),
      godzillaTurns: fighter.raceGodzillaTurns || 0,
      godzillaFalling: fighter.raceGodzillaFalling === true,
      godzillaBurnLayers: (fighter.raceGodzillaBurns || []).map((burn) => burn.layerIndex),
      speedImpactLandings: fighter.raceSpeedImpactLandings || 0,
      layerIndex: fighter.raceLayerIndex || 0,
      layerHealth: fighter.raceLayerHealth || [],
      health: Number(fighter.health.toFixed(1)),
      damage: combatStats.damage,
      currentDamage: Number((fighter.damage || 0).toFixed(1)),
      classic: sim.gameplayMode === "classic" ? {
        teamIndex: fighter.classicTeamIndex,
        boss: fighter.classicBoss === true,
        maxHealth: Number(fighter.maxHealth.toFixed(1)),
        role: fighter.classicIsDuplicate
          ? "duplicate"
          : fighter.classicDuplicateRootId === fighter.id
            ? "root"
            : "contender",
        blocks: fighter.classicBlocks || 0,
        bounces: fighter.classicBounces || 0,
        arrowCount: fighter.classicArrowCount || 1,
        bowVolleySequence: fighter.classicBowVolleySequence || 0,
        bowLastProgressedVolley: fighter.classicBowLastProgressedVolley ?? -1,
        weaponRotationDirection: fighter.weaponRotationDirection || 0,
        weaponFlipRemaining: Number(Math.max(0, (fighter.weaponFlipUntil || 0) - sim.time).toFixed(3)),
        hitFlashRemaining: Number(Math.max(0, (fighter.classicHitFlashUntil || 0) - sim.time).toFixed(3)),
        critChance: Number((fighter.classicCritChance || 0).toFixed(4)),
        potionBuffs: fighter.classicPotionBuffs || 0,
        spinMultiplier: Number((fighter.classicSpinMultiplier || 1).toFixed(4)),
        slices: fighter.classicSlices || 1,
        duplicateRootId: fighter.classicDuplicateRootId || null,
        duplicateGeneration: fighter.classicDuplicateGeneration || 0,
        isDuplicate: fighter.classicIsDuplicate === true,
        orbiters: fighter.classicOrbiters || 0,
        sizeScale: Number((fighter.classicSizeScale || 1).toFixed(4)),
        speedLevel: fighter.classicSpeedLevel || 0,
        launchAngle: Number((fighter.classicLaunchAngle || 0).toFixed(4)),
        aimAngle: Number((fighter.classicAimAngle || 0).toFixed(4)),
        latchPhase: fighter.classicLatchPhase || "inactive",
        latchTargetId: fighter.classicLatchTargetId || null,
        latchWiggle: Number((fighter.classicLatchWiggle || 0).toFixed(3)),
        latchWiggleAmplitude: Number((fighter.classicLatchWiggleAmplitude || 0).toFixed(3)),
        latchWiggleFrequency: Number((fighter.classicLatchWiggleFrequency || 0).toFixed(3)),
        latchReleaseAngle: Number.isFinite(Number(fighter.classicLatchReleaseAngle))
          ? Number(Number(fighter.classicLatchReleaseAngle).toFixed(4))
          : null,
        latchReleaseSpeed: Number((fighter.classicLatchReleaseSpeed || 0).toFixed(2)),
        absorbedOrbId: fighter.classicAbsorbedOrbId || fighter.classicAbsorbedAbility || null,
        absorptionHistory: [...(fighter.classicAbsorptionHistory || [])],
        absorptionLabels: [...(fighter.classicAbsorptionHistory || [])].map((id) => String(id).replace(/[-_]+/g, " ").toUpperCase()),
        absorptionStartedAt: Number((fighter.classicAbsorptionStartedAt || 0).toFixed(3)),
        absorbingFor: Number(Math.max(0, (fighter.classicAbsorbingUntil || 0) - sim.time).toFixed(3)),
        absorptionSequence: fighter.classicAbsorptionSequence || 0,
        frostFrozen: fighter.classicFrostFrozen === true,
        frostFreezeFor: fighter.classicFrostFrozen === true && Number.isFinite(Number(fighter.classicFrostFreezeUntil))
          ? Number(Math.max(0, fighter.classicFrostFreezeUntil - sim.time).toFixed(3))
          : 0,
        punchPhase: fighter.classicPunchPhase || "inactive",
        punchHand: fighter.classicPunchHand || null,
        punchDouble: fighter.classicPunchDouble === true,
        punchLandedCount: fighter.classicPunchLandedCount || 0,
        punchGloves: (fighter.classicPunchGloves || []).map((glove) => ({
          hand: glove.hand,
          x1: Number((glove.x1 || 0).toFixed(1)),
          y1: Number((glove.y1 || 0).toFixed(1)),
          x2: Number((glove.x2 || 0).toFixed(1)),
          y2: Number((glove.y2 || 0).toFixed(1)),
          active: glove.active === true,
          punchingHand: glove.punchingHand === true,
        })),
      } : null,
      abilityKind: fighter.abilityKind,
      abilityValue: Number((fighter.abilityValue || 0).toFixed(2)),
      abilityRate: Number((fighter.abilityRate || 1).toFixed(2)),
      rangedInterval: Number((fighter.rangedInterval || 0).toFixed(2)),
      rangedCooldown: Number((fighter.rangedCooldown || 0).toFixed(2)),
      rangedShots: fighter.rangedShots || 0,
      rangedHits: fighter.rangedHits || 0,
      attackMultiplier: combatStats.attackMultiplier,
      defense: combatStats.defense,
      x: Number(fighter.x.toFixed(1)),
      y: Number(fighter.y.toFixed(1)),
      cooldown: Number(fighter.cooldown.toFixed(1)),
      frozen: sim.time < fighter.stunUntil,
      immuneFor: Number(Math.max(0, fighter.invulnerableUntil - sim.time).toFixed(1)),
      shinGuards: fighter.shinGuardStacks || 0,
      damageBoostPermanent: (fighter.worldCupDamageStacks || 0) > 0,
      damageBoostStacks: fighter.worldCupDamageStacks || 0,
      damageBoostFor: null,
      pendingItems: (fighter.pendingWorldCupItems || []).map((id) => {
        const item = sim.worldCupPendingItems.find((candidate) => candidate.id === id);
        return item ? { type: item.type, usesIn: Number(Math.max(0, item.activatesAt - sim.time).toFixed(2)) } : null;
      }).filter(Boolean),
    };
    }),
    projectiles: (sim.projectiles || []).map((projectile) => ({
      type: projectile.kind,
      ownerId: projectile.ownerId,
      x: Number(projectile.x.toFixed(1)),
      y: Number(projectile.y.toFixed(1)),
    })),
    classicEntities: (sim.classicEntities || []).map((entity) => ({
      id: entity.id,
      kind: entity.kind,
      ownerId: entity.ownerId,
      radius: Number((entity.radius || 0).toFixed(1)),
      x: Number((entity.x || 0).toFixed(1)),
      y: Number((entity.y || 0).toFixed(1)),
      x2: Number((entity.x2 || 0).toFixed(1)),
      y2: Number((entity.y2 || 0).toFixed(1)),
      angle: Number.isFinite(Number(entity.angle)) ? Number(Number(entity.angle).toFixed(4)) : null,
      health: Number.isFinite(Number(entity.health)) ? Number(Number(entity.health).toFixed(1)) : null,
      maxHealth: Number.isFinite(Number(entity.maxHealth)) ? Number(Number(entity.maxHealth).toFixed(1)) : null,
      tracking: entity.tracking === true,
      destinationX: Number.isFinite(Number(entity.destinationX)) ? Number(Number(entity.destinationX).toFixed(1)) : null,
      destinationY: Number.isFinite(Number(entity.destinationY)) ? Number(Number(entity.destinationY).toFixed(1)) : null,
      arrived: entity.arrived === true,
      bounces: entity.bounces === false ? false : entity.bounces === true ? true : null,
      physical: entity.physical === true,
      solid: entity.solid === true,
      collisionMode: entity.collisionMode || null,
      phase: entity.phase || null,
      trapPhase: entity.trapPhase || null,
      trapState: entity.trapState || null,
      trapTargetId: entity.trapTargetId || null,
      lassoIndex: Number.isFinite(Number(entity.lassoIndex)) ? Number(entity.lassoIndex) : null,
      lassoCount: Number.isFinite(Number(entity.lassoCount)) ? Number(entity.lassoCount) : 0,
      lassoGroupId: entity.lassoGroupId || null,
      anchorX: Number.isFinite(Number(entity.anchorX)) ? Number(Number(entity.anchorX).toFixed(1)) : null,
      anchorY: Number.isFinite(Number(entity.anchorY)) ? Number(Number(entity.anchorY).toFixed(1)) : null,
      trapTightenProgress: Number.isFinite(Number(entity.trapTightenProgress))
        ? Number(Number(entity.trapTightenProgress).toFixed(3))
        : null,
      lifetimeState: entity.lifetimeState || null,
      opacity: Number.isFinite(Number(entity.opacity)) ? Number(Number(entity.opacity).toFixed(3)) : null,
      stickUntil: Number.isFinite(Number(entity.stickUntil)) ? Number(Number(entity.stickUntil).toFixed(3)) : null,
      stuckRemaining: Number.isFinite(Number(entity.stuckRemaining)) ? Number(Number(entity.stuckRemaining).toFixed(3)) : null,
      stuckSurface: entity.stuckSurface || null,
      stuckTargetId: entity.stuckTargetId || null,
      wallSide: entity.wallSide || null,
      wallContact: entity.wallContact ? { ...entity.wallContact } : null,
      stuckWallContact: entity.stuckWallContact ? { ...entity.stuckWallContact } : null,
      spikeTip: entity.spikeTip ? { ...entity.spikeTip } : null,
      spikeBase: entity.spikeBase ? { ...entity.spikeBase } : null,
      lineStart: entity.lineStart ? { ...entity.lineStart } : null,
      lineEnd: entity.lineEnd ? { ...entity.lineEnd } : null,
      lineStartWallContact: entity.lineStartWallContact ? { ...entity.lineStartWallContact } : null,
      lineEndWallContact: entity.lineEndWallContact ? { ...entity.lineEndWallContact } : null,
      previousWallContact: entity.previousWallContact ? { ...entity.previousWallContact } : null,
      nextWallContact: entity.nextWallContact ? { ...entity.nextWallContact } : null,
      predictedNextWallContact: entity.predictedNextWallContact ? { ...entity.predictedNextWallContact } : null,
      directionX: Number.isFinite(Number(entity.directionX)) ? Number(Number(entity.directionX).toFixed(4)) : null,
      directionY: Number.isFinite(Number(entity.directionY)) ? Number(Number(entity.directionY).toFixed(4)) : null,
      zoneBelow: entity.zoneBelow === true,
      zoneMode: entity.zoneMode || null,
      zoneSide: entity.zoneSide || null,
      zoneArea: Number.isFinite(Number(entity.zoneArea)) ? Number(Number(entity.zoneArea).toFixed(2)) : null,
      zoneAreaFraction: Number.isFinite(Number(entity.zoneAreaFraction))
        ? Number(Number(entity.zoneAreaFraction).toFixed(4))
        : null,
      zoneSegmentId: entity.zoneSegmentId || null,
      zonePolygon: (entity.zonePolygon || []).map((point) => ({
        x: Number((point.x || 0).toFixed(1)),
        y: Number((point.y || 0).toFixed(1)),
      })),
      zoneFill: entity.zoneFill || null,
      lineColor: entity.lineColor || null,
      lineWidth: Number.isFinite(Number(entity.lineWidth)) ? Number(Number(entity.lineWidth).toFixed(2)) : null,
      maxRadius: Number.isFinite(Number(entity.maxRadius)) ? Number(Number(entity.maxRadius).toFixed(2)) : null,
      damageRadius: Number.isFinite(Number(entity.damageRadius)) ? Number(Number(entity.damageRadius).toFixed(2)) : null,
      fillColor: entity.fillColor || null,
      strokeColor: entity.strokeColor || null,
      anchorMode: entity.anchorMode || null,
      geometry: entity.geometry || null,
      wallBallId: entity.wallBallId || null,
      strandCount: entity.strandCount || 0,
      anchorCount: entity.anchorCount || 0,
      permanent: entity.permanent === true,
      linePhase: entity.linePhase || null,
      activeLine: entity.activeLine === true,
      completedLineCount: entity.completedLineCount || 0,
      activeSegment: entity.activeSegment ? {
        x1: Number((entity.activeSegment.x1 || 0).toFixed(1)),
        y1: Number((entity.activeSegment.y1 || 0).toFixed(1)),
        x2: Number((entity.activeSegment.x2 || 0).toFixed(1)),
        y2: Number((entity.activeSegment.y2 || 0).toFixed(1)),
        active: entity.activeSegment.active === true,
      } : null,
      segments: (entity.segments || []).map((segment) => ({
        x1: Number((segment.x1 || 0).toFixed(1)),
        y1: Number((segment.y1 || 0).toFixed(1)),
        x2: Number((segment.x2 || 0).toFixed(1)),
        y2: Number((segment.y2 || 0).toFixed(1)),
        active: segment.active === true,
      })),
      borderNodes: (entity.borderNodes || []).map((node) => ({
        x: Number((node.x || 0).toFixed(1)),
        y: Number((node.y || 0).toFixed(1)),
        side: node.side || null,
      })),
    })),
    pickups: (sim.worldCupPickups || []).filter((pickup) => !pickup.collected).map((pickup) => ({
      type: pickup.type,
      x: Number(pickup.x.toFixed(1)),
      y: Number(pickup.y.toFixed(1)),
    })),
    worldCupProjectiles: (sim.worldCupProjectiles || []).map((projectile) => ({
      type: projectile.kind,
      targetId: projectile.targetId,
      x: Number(projectile.x.toFixed(1)),
      y: Number(projectile.y.toFixed(1)),
    })),
  },
});

window.advanceTime = (milliseconds) => {
  if (elements.gameScreen.hidden || paused || (sim.finished && !sim.raceTournament)) return;
  const elapsed = Math.max(0, (Number(milliseconds) || 0) / 1000);
  updateSocialPresentation(elapsed, performance.now());
  if (socialPresentation.phase === "battle") {
    const steps = Math.max(1, Math.round(elapsed / fixedStep));
    for (let index = 0; index < steps && !sim.finished; index += 1) stepSimulation(sim, fixedStep);
  }
  audio.consume(sim.events);
  consumeSocialEvents(performance.now());
  drawSocialBattle(performance.now());
  syncStatus();
  finishBattle();
};

buildThemeSelectors();
buildCountryControls();
buildRaceOrbControls();
buildRaceTournamentControls();
buildClassControls();
buildMenu();
applyTheme(settings.theme);
applyFeatureVisibility();
startSimulation();

if (initialUrlSettings) {
  showGame();
  openSetup();
} else {
  history.replaceState(null, "", location.pathname);
  showMenu();
}

requestAnimationFrame(frame);
