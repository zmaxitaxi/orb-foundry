import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CLASSIC_DEFAULT_CLASSES, CLASSIC_DEFAULT_TEAMS, CLASSIC_ORB_IDS, CLASSIC_ORBS } from "../src/classic-orbs.js";
import { CLASSIC_DEFAULT_ORB_SCALE, CLASSIC_ORB_SCALE_OPTIONS } from "../src/config.js";
import { ORB_RACER_IDS, ORB_RACERS } from "../src/orb-race.js";

const mainSource = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const socialRendererSource = readFileSync(new URL("../src/social-renderer.js", import.meta.url), "utf8");
const rendererSource = readFileSync(new URL("../src/renderer.js", import.meta.url), "utf8");
const classicOrbSource = readFileSync(new URL("../src/classic-orbs.js", import.meta.url), "utf8");
const classicControlsSource = mainSource.slice(
  mainSource.indexOf("function buildClassControls"),
  mainSource.indexOf("function populateProfile"),
);

const pickerDescriptions = {
  grappler: "FIRES A GRAPPLE HOOK · MASSIVE PULL DAMAGE",
  artists: "PAINTS 5-SECOND SUMMONS WITH UNIQUE ATTACKS",
  pancake: "FLIPS · STICKS 1.5 SECONDS · BUTTER METEORS",
  tree: "ROOTS EVERY 5 BOUNCES · DRAINS ALL LAYERS",
};

test("Classic setup is registry-driven and supports two independently selected teams", () => {
  assert.deepEqual(CLASSIC_DEFAULT_CLASSES, ["sword", "orbital"]);
  assert.deepEqual(CLASSIC_DEFAULT_TEAMS, [["sword"], ["orbital"]]);
  assert.ok(CLASSIC_ORB_IDS.length > 30, "the requested Classic roster should replace the old eleven-orb list");
  assert.match(mainSource, /const validClasses = Object\.keys\(CLASSIC_ORBS\)/);
  assert.match(mainSource, /const grids = \[elements\.classicTeamOneGrid, elements\.classicTeamTwoGrid\]/);
  assert.match(mainSource, /grid\.innerHTML = validClasses\.map\(\(type\) => optionMarkup\(type, teamIndex\)\)/);
  assert.match(mainSource, /const def = CLASSIC_ORBS\[type\]/);
  assert.match(mainSource, /<strong>\$\{def\.name\}<\/strong>/);
  assert.match(mainSource, /<small>\$\{def\.power\}<\/small>/);
  assert.match(mainSource, /data-classic-count/, "Classic setup must expose per-orb quantities");
  assert.match(mainSource, /data-classic-health/, "Classic setup must expose per-orb HP");
  assert.match(mainSource, /name="classicTeamOrb"/);
  assert.match(mainSource, /classicTeamSelectionOrder\[teamIndex\]/);
  for (const [id, definition] of Object.entries(CLASSIC_ORBS)) {
    assert.equal(definition.id, id);
    assert.ok(definition.name);
    assert.ok(definition.power);
  }
  assert.match(indexSource, /teams may be empty while you configure/i);
  assert.match(indexSource, /id="classicTeamOneGrid"/);
  assert.match(indexSource, /id="classicTeamTwoGrid"/);
});

test("Classic selected fighters expose speed, trails, collision damage, and black arena controls", () => {
  assert.match(mainSource, /data-classic-speed-mode data-classic-team="\$\{teamIndex\}" data-classic-orb="\$\{type\}"/);
  assert.match(mainSource, /data-classic-option="fadingTrails" data-classic-team="\$\{teamIndex\}" data-classic-orb="\$\{type\}"/);
  assert.match(mainSource, /data-classic-option="solidTrails" data-classic-team="\$\{teamIndex\}" data-classic-orb="\$\{type\}"/);
  assert.match(mainSource, /data-classic-option="collisionDamage" data-classic-team="\$\{teamIndex\}" data-classic-orb="\$\{type\}"/);
  assert.match(mainSource, /data-classic-orb-scale data-classic-team="\$\{teamIndex\}" data-classic-orb="\$\{type\}"/);
  assert.match(mainSource, /data-classic-count data-classic-team="\$\{teamIndex\}" data-classic-orb="\$\{type\}"/);
  assert.match(mainSource, /classic-orb-health|data-classic-health/, "Classic setup must expose an individual orb health control");
  assert.match(mainSource, /data-classic-option="boss"/);
  assert.match(mainSource, /options\.orbScale = form\.querySelector\(/);
  assert.match(mainSource, /input\.value = String\(option\.orbScale \?\? CLASSIC_DEFAULT_ORB_SCALE\)/);
  assert.match(mainSource, /classicOrbOptions: settings\.classicOrbOptions/, "createSimulation must receive the complete Classic option object");
  assert.match(mainSource, /classicTeams: settings\.classicTeams/);
  assert.match(mainSource, /classicTeamOptions: settings\.classicTeamOptions/);
  assert.deepEqual(
    CLASSIC_ORB_SCALE_OPTIONS.map(({ label }) => label),
    ["MINI", "COMPACT", "REGULAR", "LARGE", "EXTRA LARGE"],
  );
  assert.equal(CLASSIC_DEFAULT_ORB_SCALE, 1);
  assert.match(mainSource, /classicBlackTheme: settings\.gameplayMode === "classic" && settings\.classicBlackTheme/);
  assert.match(mainSource, /classicTeamColors: settings\.gameplayMode === "classic" && settings\.classicTeamColors/);
  assert.doesNotMatch(indexSource, /ALL ORB HEALTH/);
  assert.match(mainSource, /options\.health = form\.querySelector\(/);
  assert.match(mainSource, /classicHydrogenHealth: 100/);
  assert.match(indexSource, /id="classicBlackTheme"/);
  assert.match(indexSource, /id="classicTeamColors"/);
  assert.match(stylesSource, /\.classic-team-orb:has\(input\[name="classicTeamOrb"\]:checked\) \.classic-orb-options/);
  assert.match(stylesSource, /\.classic-black-theme-toggle:has\(input:checked\)/);
});

test("Classic picker preserves setup-panel scroll like the Orb Race picker", () => {
  const scrollCapture = /const panelScrollTop = elements\.setupDialog\.querySelector\("\.setup-panel"\)\?\.scrollTop \?\? 0/;
  assert.match(classicControlsSource, scrollCapture, "Classic selection must capture the shared setup-panel scroll position");
  assert.match(classicControlsSource, /restoreSetupDialogScroll\(panelScrollTop\)/, "Classic selection must restore the captured position after layout changes");
  assert.match(
    classicControlsSource,
    /grid\.querySelectorAll\("details\.classic-orb-options"\)[\s\S]*?addEventListener\("toggle", \(\) => restoreSetupDialogScroll\(\)\)/,
    "opening Classic options must use the same toggle restoration helper as Orb Race",
  );
  assert.match(stylesSource, /\.setup-dialog\s*\{[\s\S]*?overflow: hidden;/, "the dialog must not own roster scrolling");
  assert.match(stylesSource, /\.setup-panel\s*\{[\s\S]*?overflow-y: auto;/, "the setup panel must remain the sole vertical scroll container");
});

test("Classic team names, announcer routing, and team outlines stay visible in the shared presentation path", () => {
  assert.match(mainSource, /audio\.playClassicMatchup\(/, "Classic launches must use the team announcer splice");
  assert.match(mainSource, /name: sim\.classicTeamNames\?\./, "render_game_to_text should expose the team title");
  assert.match(mainSource, /displayParts: sim\.classicTeamDisplayParts\?\./, "render_game_to_text should expose category/everyone title parts");
  assert.match(socialRendererSource, /classicTeamDisplayName/);
  assert.match(socialRendererSource, /classicTeamOutlineColorFor/);
  assert.match(rendererSource, /classicTeamOutlineColorFor/);
  assert.match(socialRendererSource, /classicTeamColors !== false/);
  assert.match(rendererSource, /classicTeamColors !== false/);
  assert.match(classicOrbSource, /0:\s*"#0057ff"/, "Team 1 should use the distinct electric-blue outline");
  assert.match(classicOrbSource, /1:\s*"#e11d48"/, "Team 2 should use the red outline");
});

test("Orb Race setup keeps the new racer roster registry-driven in both teams", () => {
  for (const [id, name] of [["grappler", "GRAPPLER"], ["artists", "ARTIST"], ["pancake", "PANCAKE"], ["tree", "TREE"]]) {
    assert.ok(ORB_RACER_IDS.includes(id), `${id} should be registered for setup`);
    assert.equal(ORB_RACERS[id].name, name, `${id} should use the requested player-facing name`);
  }
  assert.match(
    mainSource,
    /\[elements\.raceTeamOneGrid, elements\.raceTeamTwoGrid\]\.forEach\(\(grid, teamIndex\)/,
    "both team grids should share the same picker renderer",
  );
  assert.match(
    mainSource,
    /grid\.innerHTML = ORB_RACER_IDS\.map\(\(id\) => optionMarkup\(id, teamIndex\)\)\.join\(""\)/,
    "new registry IDs should appear in both pickers automatically",
  );
  for (const [id, description] of Object.entries(pickerDescriptions)) {
    assert.match(mainSource, new RegExp(`id === "${id}"`), `${id} needs an explicit setup branch`);
    assert.match(mainSource, new RegExp(description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(mainSource, /<strong>\$\{racer\.name\}<\/strong>/, "the registry controls player-facing racer names");
});

test("new racers keep the standard per-orb options contract", () => {
  assert.match(mainSource, /data-race-count data-race-team="\$\{teamIndex\}" data-race-orb="\$\{id\}"/);
  assert.match(mainSource, /data-race-orb-scale data-race-team="\$\{teamIndex\}" data-race-orb="\$\{id\}"/);
  assert.match(mainSource, /data-race-option="fadingTrails"/);
  assert.match(mainSource, /data-race-option="solidTrails"/);
  assert.match(mainSource, /data-race-option="scalingDamage"/);
  assert.match(mainSource, /data-race-combo="\$\{abilityId\}"/);
  assert.match(mainSource, /raceTeamSelectionOrder\[teamIndex\]/, "selection order should remain URL/restart stable");
});

test("Orb Race Tournament is a peer format with a dedicated 1v1 roster and guided controls", () => {
  assert.match(indexSource, /id="tournamentRaceButton"/);
  assert.doesNotMatch(indexSource, /ENABLE TOURNAMENT/);
  assert.match(indexSource, /id="raceTeamBuilder"/);
  assert.match(mainSource, /elements\.raceTeamBuilder\.hidden = !orbRace \|\| enabled/);
  assert.match(indexSource, /id="raceTournamentSize"/);
  for (const size of [4, 8, 16, 32, 64]) {
    assert.match(indexSource, new RegExp(`value="${size}"`), `tournament picker should expose ${size}`);
  }
  assert.match(indexSource, /id="raceTournamentEntrants"/);
  assert.match(indexSource, /id="raceTournamentSeedingMode"[^>]*type="hidden"[^>]*value="random"/);
  assert.doesNotMatch(indexSource, /ORDERED SEED LIST/);
  assert.doesNotMatch(indexSource, /id="raceTournamentSeedList"/);
  assert.match(indexSource, /id="raceTournamentLayout" class="race-tournament-layout race-tournament-layout-single"/);
  assert.match(indexSource, /id="raceTournamentRecordingScope"/);
  assert.match(indexSource, /value="each-match"/);
  assert.match(indexSource, /value="whole-round"/);
  assert.match(indexSource, /value="whole-tournament"/);
  assert.match(indexSource, /id="raceTournamentLayerCount"/);
  assert.match(indexSource, /value="3">3 LAYERS/);
  assert.match(indexSource, /value="5" selected>5 LAYERS/);
  assert.match(indexSource, /id="raceTournamentFinalLayerHealth"/);
  assert.match(indexSource, /id="raceTournamentTitle"/);
  assert.match(indexSource, /id="raceTournamentRoundSelection"/);
  assert.match(indexSource, /id="raceTournamentSaveButton"/);
  assert.match(indexSource, /id="raceTournamentResumeButton"/);
  assert.match(indexSource, /id="raceTournamentOpenBracketButton"/);
  assert.match(indexSource, /id="raceTournamentRecordMatchButton"/);
  assert.match(indexSource, /id="raceTournamentValidation"[^>]*role="alert"/);
  assert.match(indexSource, /id="raceTournamentWizardPage1"/);
  assert.match(indexSource, /id="raceTournamentWizardPage2"/);
  assert.match(indexSource, /id="raceTournamentWizardPage3"/);
  assert.match(indexSource, /id="raceTournamentWizardNext1"/);
  assert.match(indexSource, /id="raceTournamentWizardBack2"/);
  assert.match(indexSource, /id="raceTournamentWizardNext2"/);
  assert.match(indexSource, /id="raceTournamentWizardBack3"/);
  assert.match(indexSource, /id="raceTournamentPortraitPreviewButton"/);
  assert.match(indexSource, /id="raceTournamentLandscapePreviewButton"/);
  assert.match(indexSource, /id="raceTournamentZoomOut"/);
  assert.match(indexSource, /id="raceTournamentZoomReset"/);
  assert.match(indexSource, /id="raceTournamentZoomIn"/);
  assert.match(indexSource, /id="nonTournamentSetupFields"/);
  assert.match(mainSource, /function raceTournamentDraft/);
  assert.match(mainSource, /validateRaceTournamentSettings\(raceTournamentDraft\(\)\)/);
  assert.match(mainSource, /elements\.launchButton\.disabled = enabled && \(tournamentWizardPage !== 3 \|\| !validation\.valid\)/);
  assert.match(mainSource, /function syncTournamentWizardPage/);
  assert.match(mainSource, /function setTournamentWizardPage/);
  assert.match(mainSource, /tournamentPreviewMode/);
  assert.match(mainSource, /let tournamentPreviewZoom = 1/);
  assert.match(mainSource, /function setTournamentPreviewZoom/);
  assert.match(mainSource, /raceTournamentStageZoom|race-tournament-stage-zoom/);
  assert.match(mainSource, /tournamentCameraTransform/);
  assert.match(mainSource, /function focusTournamentPreviewMatch/);
  assert.match(mainSource, /const durationMs = TOURNAMENT_MATCHUP_ZOOM_DURATION_MS/);
  assert.match(mainSource, /window\.requestAnimationFrame\(animate\)/);
  assert.match(mainSource, /camera\.style\.transform = `translate3d/);
  assert.match(mainSource, /START TOURNAMENT RECORDING/);
  assert.match(mainSource, /ensureTournamentEntrantDefaults\(\{ fill: true, trim: true \}\)/);
  assert.match(mainSource, /name="raceTournamentEntrant"/);
  assert.match(mainSource, /if \(!elements\.raceTournamentSeedList\) return/);
  assert.match(mainSource, /elements\.raceTournamentSeedList\?\.addEventListener/);
  assert.match(mainSource, /buildOrbRaceTournamentLayerPreset/);
  assert.match(mainSource, /syncTournamentPresetControls\(\{ forcePreset: true \}\)/);
  assert.match(mainSource, /elements\.raceTournamentRoundList\.addEventListener\("change"/);
  assert.match(mainSource, /classList\.toggle\("active", selectedRoundMode\)/);
  assert.match(mainSource, /setAttribute\("aria-pressed", String\(selectedRoundMode\)\)/);
  assert.match(mainSource, /const panelScrollTop = elements\.setupDialog\.querySelector\("\.setup-panel"\)\?\.scrollTop \?\? 0/);
  assert.match(mainSource, /restoreSetupDialogScroll\(panelScrollTop\)/);
  assert.match(mainSource, /raceTournament: settings\.gameplayMode === ORB_RACE_MODE \? settings\.raceTournament : null/);
  assert.match(mainSource, /selectedRaceFormat === "tournament"/);
  assert.match(mainSource, /function selectTournamentRace/);
  assert.match(mainSource, /function saveTournamentToBrowser/);
  assert.match(mainSource, /function resumeTournamentFromBrowser/);
  assert.match(mainSource, /function renderTournamentBracketPreview/);
  assert.match(mainSource, /function currentTournamentState/);
  assert.match(mainSource, /race-tournament-node-card/);
  assert.match(mainSource, /race-tournament-node-orb/);
  assert.match(mainSource, /label: racer \? racer\.name : "\?\?\?"/);
  assert.doesNotMatch(mainSource, /race-tournament-match-card|race-tournament-match-vs|function tournamentBracketEntryMarkup/);
  assert.doesNotMatch(stylesSource, /\.race-tournament-match-card|\.race-tournament-match-vs/);
  assert.match(mainSource, /createOrbRaceTournament\(\{ \.\.\.clean, seed: settings\.seed \}\)/);
  assert.match(mainSource, /winnerOrbId/);
  assert.match(mainSource, /currentTournamentState\(\) \|\| tournamentPreviewSourceState \|\| saved\?\.snapshot/);
  assert.match(mainSource, /savedPreviewState = clean \? createOrbRaceTournament\(\{ \.\.\.clean, seed: settings\.seed \}\)/);
  assert.match(mainSource, /const sideFor = \(match\) =>/);
  assert.match(mainSource, /const xFor = \(match, roundIndex\) =>/);
  assert.match(mainSource, /serializeOrbRaceTournament/);
  assert.match(mainSource, /deserializeOrbRaceTournament/);
  assert.match(mainSource, /tournamentState/);
  assert.match(mainSource, /tournamentWizardPage = 3/);
  assert.match(mainSource, /tournamentPreviewMode = "landscape"/);
  assert.match(mainSource, /prepareOrbRaceTournamentMatchRecording/);
  assert.match(mainSource, /STARTING PORTRAIT RECORDING/);
  assert.match(mainSource, /leftOrbId: match\.left\.orbId/);
  assert.match(mainSource, /rightOrbId: match\.right\.orbId/);
  assert.match(mainSource, /singleMatch: true/);
  assert.match(mainSource, /tournamentRecorder\.beginTournamentSession\(/);
  assert.match(mainSource, /tournamentRecorder\.onMatchIntro\(/);
  assert.match(mainSource, /function tournamentRecordingStateMatchesSettings/);
  assert.match(mainSource, /async function startTournamentRecordingWorkflow/);
  assert.match(mainSource, /if \(nextSettings\.raceTournament\) \{[\s\S]*?startTournamentRecordingWorkflow\(nextSettings/);
  assert.match(mainSource, /request: \{ automatic: true \}/);
  assert.match(mainSource, /async function requestSelectedTournamentRoundRecording/);
  assert.match(mainSource, /async function requestWholeTournamentRecording/);
  assert.match(mainSource, /void requestSelectedTournamentRoundRecording\(\)\.catch/);
  assert.match(mainSource, /void requestWholeTournamentRecording\(\)\.catch/);
  assert.match(mainSource, /event\.type === "race-tournament-match-result"/);
  assert.match(mainSource, /function finalizeTournamentRecordingBoundary/);
  assert.match(mainSource, /tournamentRecorder\.shouldStopAfterMatch/);
  assert.match(mainSource, /elements\.socialStopButton\.addEventListener\("click", \(\) => \{[\s\S]*?finalizeTournamentRecordingBoundary/);
  assert.match(mainSource, /socialRecordingResult = tournamentRecorder\.onRecorderResult\(result\)/);
  assert.match(mainSource, /function recordingResultSnapshot/);
  assert.match(mainSource, /const requestedFilename = socialRecordingResult\.filename/);
  assert.match(mainSource, /preserveTournamentSession: true/);
  assert.match(mainSource, /layerCount: 3/);
  assert.match(mainSource, /width: 1080, height: 1920/);
  assert.match(mainSource, /if \(!tournamentRecordingRequest\?\.direct \|\| tournamentRecordingIsContinuous\(\)\)/);
  assert.match(mainSource, /await startSocialRecording\(\)/);
  assert.match(mainSource, /function queueNextTournamentMatch/);
  assert.match(mainSource, /tournamentRecordingShouldContinueAfterPreview/);
  assert.match(mainSource, /if \(elements\.gameScreen\.hidden \|\| paused \|\| \(sim\.finished && !sim\.raceTournament\)\) return/);
  assert.match(mainSource, /preserveTournamentSession/);
  assert.match(mainSource, /tournamentSessionState/);
  assert.match(stylesSource, /\.race-tournament-panel/);
  assert.match(stylesSource, /\.race-tournament-entrant-section \.race-orb-grid[\s\S]*?overflow-y: auto/);
  assert.match(stylesSource, /\.race-tournament-layout[\s\S]*?grid-template-columns/);
  assert.match(stylesSource, /\.race-tournament-layout-single[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(stylesSource, /\.race-tournament-layout-single \.race-tournament-entrant-section \.race-orb-grid[\s\S]*?repeat\(3/);
  assert.match(stylesSource, /\.race-tournament-recording-actions \.quiet-button\.active/);
  assert.match(stylesSource, /\.race-tournament-camera[\s\S]*?transform-origin: top left/);
  assert.match(stylesSource, /\.race-length-picker[\s\S]*?grid-template-columns: repeat\(3/);
  assert.match(stylesSource, /\.race-tournament-node-orb[\s\S]*?border-radius: 50%/);
  assert.match(stylesSource, /\.race-tournament-node-name[\s\S]*?min-width: 0/);
});

test("continuous tournament recordings preserve MediaRecorder and hand off pan-to-next transitions", () => {
  assert.match(mainSource, /const TOURNAMENT_STATIC_BRACKET_DWELL_MS = 0/);
  assert.match(mainSource, /const TOURNAMENT_CAMERA_MOTION_MS = 1_000/);
  assert.match(mainSource, /const TOURNAMENT_CENTERED_MATCHUP_HOLD_MS = 1_750/);
  assert.match(mainSource, /const TOURNAMENT_MATCHUP_ZOOM_DURATION_MS = 2_750/);
  assert.match(mainSource, /const TOURNAMENT_INTER_MATCH_PAN_DURATION_MS = 2_750/);
  assert.match(mainSource, /function tournamentRecordingIsContinuous/);
  assert.match(mainSource, /function tournamentRecordingPresentationContract/);
  assert.match(mainSource, /transitionMode: mode/);
  assert.match(mainSource, /activeMatchId: resolvedToMatchId/);
  assert.match(mainSource, /cameraTransition:/);
  assert.match(mainSource, /type: panToNext \? "camera-pan" : "full-intro"/);
  assert.match(mainSource, /restartIntro: !panToNext/);
  assert.match(mainSource, /function createTournamentMatchTransition/);
  assert.match(mainSource, /const authoritativeTransition = nextMatch\.presentation\?\.cameraTransition/);
  assert.match(mainSource, /const isCameraPan = nextMatch\.presentation\?\.introMode === "camera-pan"/);
  assert.match(mainSource, /const fromMatchId = authoritativeTransition\.fromMatchId/);
  assert.match(mainSource, /const toMatchId = authoritativeTransition\.toMatchId/);
  assert.match(mainSource, /function tournamentTransitionForRender/);
  assert.match(mainSource, /const motionProgress = Math\.min\(1, elapsedMs \/ motionDurationMs\)/);
  assert.match(mainSource, /const holdProgress = Math\.min\(/);
  assert.match(mainSource, /holding: elapsedMs >= motionDurationMs && elapsedMs < durationMs/);
  assert.match(mainSource, /function alignFirstLongFormTournamentMatchup/);
  assert.match(mainSource, /const motionDuration = TOURNAMENT_CAMERA_MOTION_MS \/ 1000/);
  assert.match(mainSource, /const holdDuration = TOURNAMENT_CENTERED_MATCHUP_HOLD_MS \/ 1000/);
  assert.match(mainSource, /endAt: motionEndAt/);
  assert.match(mainSource, /duration: motionDuration/);
  assert.match(mainSource, /bracketIntroDuration: 0/);
  assert.match(mainSource, /function hydrateQueuedTournamentMatch/);
  assert.match(mainSource, /function cancelQueuedTournamentMatch/);
  assert.match(mainSource, /advanceOrbRaceTournamentPresentation\(tournament, battleAt\)/);
  assert.match(mainSource, /const transition = \{ \.\.\.tournamentTransition \};/);
  assert.match(mainSource, /transition,\n  \}\);/);
  assert.match(mainSource, /startSocialRecording\(\{ transitionOverride: transition \}\)/);
  assert.match(mainSource, /tournamentTransitionTimer = setTimeout\([\s\S]*?hydrateQueuedTournamentMatch,[\s\S]*?TOURNAMENT_INTER_MATCH_PAN_DURATION_MS/);
  assert.match(mainSource, /const tournamentHandoffActive = Boolean\(tournamentAdvancePending && tournamentTransition\)/);
  assert.match(mainSource, /!tournamentHandoffActive && \(!sim\.finished \|\| sim\.raceTournament\)/);
  assert.match(mainSource, /tournamentTransition: tournamentTransitionForRender\(now\)/);
  assert.match(mainSource, /recorderOptions: \{[\s\S]*?tournamentTransition: transition/);
  assert.match(mainSource, /segment\.presentation = \{ \.\.\.presentation \}/);
  assert.match(mainSource, /async function startSocialRecording\(\{ transitionOverride = null \} = \{\}\)/);
  assert.match(mainSource, /const transition = transitionOverride \|\| tournamentTransitionForRender\(\)/);
  assert.match(mainSource, /requestedPresentation\.toMatchId \|\| activeMatchId/);
  assert.match(mainSource, /if \(!tournamentRecordingRequest\?\.direct \|\| tournamentRecordingIsContinuous\(\)\)/);
  assert.match(mainSource, /socialRecorder\.machine\.state === RECORDER_STATES\.RECORDING/);
  assert.match(mainSource, /preserveTournamentRecording: true/);
  assert.match(mainSource, /transition: tournamentTransitionForRender\(\)/);
});

test("tournament preview uses one continuous second of motion followed by a 1.75 second hold", () => {
  assert.match(mainSource, /const durationMs = TOURNAMENT_MATCHUP_ZOOM_DURATION_MS/);
  assert.match(mainSource, /const motionDurationMs = TOURNAMENT_CAMERA_MOTION_MS/);
  assert.match(mainSource, /const motionProgress = Math\.min\(1, elapsedMs \/ motionDurationMs\)/);
  assert.match(mainSource, /progress: motionProgress/);
  assert.match(mainSource, /holding: elapsedMs >= motionDurationMs && elapsedMs < durationMs/);
  assert.match(mainSource, /data-camera-motion-duration="\$\{TOURNAMENT_CAMERA_MOTION_MS\}"/);
  assert.match(mainSource, /data-camera-hold-duration="\$\{TOURNAMENT_CENTERED_MATCHUP_HOLD_MS\}"/);
  assert.match(mainSource, /camera\.dataset\.cameraMotionProgress = String\(motionProgress\)/);
  assert.match(mainSource, /camera\.dataset\.cameraHolding = String\(Boolean\(holding\)\)/);
  assert.match(mainSource, /preview\.dataset\.cameraActiveMatchId = match\.id/);
  assert.match(mainSource, /preview\.dataset\.cameraFromMatchId = ""/);
  assert.match(mainSource, /preview\.dataset\.cameraToMatchId = match\.id/);
});

test("wide roster cards give long names and descriptions a contained text column", () => {
  assert.match(mainSource, /class="race-orb-copy"/);
  assert.match(stylesSource, /grid-template-columns: 46px minmax\(0, 1fr\)/);
  assert.match(stylesSource, /\.race-orb-copy[\s\S]*?overflow-wrap: anywhere/);
  assert.match(stylesSource, /\.race-orb-copy small[\s\S]*?line-height: 1\.15/);
});

test("render_game_to_text exposes current Grappler and Artist state", () => {
  for (const field of [
    "grapplerDamage",
    "grapplerShots",
    "grapplerHits",
    "grapplerCooldown",
    "grapplerProjectiles",
    "grapplerPull",
    "grapplerAnchor",
    "grapplerRope",
    "grapplerAttached",
    "grapplerLaunchSpeed",
    "grapplerMomentum",
    "raceAntimatterCountdown",
    "raceAntimatterDetonations",
    "raceAntimatterCollapseProgress",
    "raceAntimatterOpponentDestroyed",
    "raceAntimatterDustEffects",
    "raceTimeBombCycleElapsed",
    "raceTimeBombFreezeRemaining",
    "raceTimeBombCycleCount",
    "raceTimeBombPulseElapsed",
    "raceTimeBombPulseActive",
    "raceTimeBombPulseHitIds",
    "raceTimeBombInfiniteDamageRemaining",
    "raceTimeBombFreezeActive",
    "raceRealityNextSpawnIn",
    "raceRealitySpawnSequence",
    "raceRealitySpawns",
    "artistsPaintingName",
    "artistsPaintingDamage",
    "artistsPaintingsCompleted",
    "artistsAbilityProgress",
    "artistsActivePainting",
    "artistsPaintingEffects",
    "artistsDrawings",
    "artistsStormStrikes",
    "artistsSummons",
    "artistsHealingTotal",
    "artistsStormStrikeCount",
    "pancakeFlipCount",
    "pancakeFlipProgress",
    "pancakeFlipPhase",
    "pancakeSide",
    "pancakeHeldFor",
    "pancakeStackCount",
    "pancakeStackDamage",
    "pancakeActiveStack",
    "pancakeStacks",
    "pancakePatches",
    "pancakeButterMeteors",
    "pancakeButterMeteorCount",
    "pancakeButterHornActive",
    "treeRootsCharge",
    "treeRootsActive",
    "treeRootsTimeRemaining",
    "treeRootsFadeRemaining",
    "treeRootDamage",
    "treeRootDamagePerSecond",
    "treeRootDamagePerLayer",
    "treeRootLayerDrain",
    "treeSavedVelocity",
    "treeRootTicks",
    "rouletteAbilityIds",
    "rouletteAbsorbLevels",
  ]) {
    assert.match(mainSource, new RegExp(`\\b${field}\\s*:`), `${field} should be visible to browser inspection`);
  }
});
