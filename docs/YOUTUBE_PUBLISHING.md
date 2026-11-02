# YouTube Publishing

Orb Foundry's approved YouTube publishing contract is stored in
[`config/youtube-publishing.json`](../config/youtube-publishing.json).

## Current contract

- Timezone: `America/Los_Angeles` (Pacific time, including daylight-saving changes).
- `12:00 PM`: one Short and one long-form video.
- `3:00 PM`: one Short and one long-form video.
- On Fridays, the 3:00 PM long-form slot is a full Orb Race tournament instead
  of a single matchup; the noon long-form remains a regular race.
- On Saturdays, the 3:00 PM long-form slot is the fixed Orb Race matchup
  Everyone VS Infinity. The noon long-form and both Shorts stay on the normal
  planner. Friday's tournament and this Saturday special share the afternoon
  long-form slot on different weekdays, so they do not collide.
- Classic mode is the product's Orb Foundry path. Channel copy that says
  "Orb Fighter" means that Classic / Orb Foundry path; the app does not gain a
  second mode name. Classic / Orb Foundry is Shorts-only. It must never be
  planned or uploaded as long-form.
- Each day has a deterministic 50% chance that one of its two Shorts is an Orb
  Foundry video. At most one Short per day uses Orb Foundry; otherwise both are
  Orb Race. Both daily long-form slots stay Orb Race. Friday's tournament and
  Saturday's Everyone VS Infinity are Orb Race long-form as well.
- Delivery mode: daily batch initiated by the separately configured scheduler.
- Upload mode: private uploads with YouTube `publishAt` scheduling, so the
  scheduler can prepare the videos before the Pacific release times.
- Video approval: not required.
- Title: `{left} VS {right}`, with readable title casing for orb and group names
  (for example, `Splodey VS Jackpot`, never `SPLODEY VS JACKPOT`). Saturday's
  special uses that same path, so the Everyone group label and Infinity's orb
  name render as `Everyone VS Infinity`. Friday tournaments are titled exactly
  `Who is the Best Orb?`.
- Description: `Who will break the {layerHealth} HP layer first, {left} or
  {right}?`, followed by `#physics #shorts #simulation #satisfying`.
  Saturday's special uses this long-form description with the first layer's HP.
- Orb Foundry Shorts and Friday tournaments use source-appropriate descriptions
  followed by the same required hashtags because they do not represent a single
  Orb Race layer matchup.
- Group matchups use the group label in the title instead of expanding every orb name.
- Orb Race and Orb Foundry each use their own explicit `videoReady` allowlist.
- Orb Foundry Shorts use a black theme, no team outlines, a large square arena,
  and the square social-video layout.
- The Orb Foundry allowlist excludes Fairy, Commander, Jackpot, Absorber,
  Grappler, Monster, Train, Snowball (`frost-ball`), Yingyang (`ying-yang`),
  Flash, Poison, and Charger.
- Announcer coverage is required for every battle recording. A battle is not
  video-ready if its intended announcer sequence is silent.
- Announcer routing is deterministic and context-aware: ordinary 1v1 and other
  non-split battles use the standard announcer sequence; split-wise announcer
  clips are reserved for a genuinely split presentation, such as an intentional
  left/right or team split. Mode-, matchup-, and phase-specific cues are used
  only when their context matches, with a generic announcer fallback when a
  specific clip is unavailable. Do not select announcers randomly or add split
  cues to a normal battle as decoration.

## Video quality contract

Every unattended video must satisfy the quality contract in
[`config/youtube-publishing.json`](../config/youtube-publishing.json):

- An orb stays on cooldown for at least two full publishing days. The planner
  also keeps same-day videos distinct when the roster allows it.
- A battle may be a 1v1 duel or a multi-orb team duel. The selected format and
  every stable orb ID are recorded in the export metadata.
- A Friday tournament uses 8–64 unique entrants from the Orb Race allowlist;
  the configured default is 16. It records the entire bracket, not a selected
  round or one rematch, and must run for at least 120 seconds. Tournament videos
  use five ascending layers, each at least 500 HP. The YouTube title is
  `Who is the Best Orb?`.
- Saturday's 3:00 PM long-form is Everyone versus Infinity. Everyone is every
  allowlisted Orb Race orb except Infinity; Infinity is alone on the right.
  The course is the fullest long-form profile the publisher already supports:
  `longformLayerCount` layers (50), and every layer is set to the top value in
  `layerStrengths.longform` (currently 32,000 HP). It does not use the Short
  course or the five-layer tournament course, and it does not apply the
  uneven-strength layer scale. The race is still one matchup and must meet the
  60-second action minimum through the normal playback rate. The close-battle
  margin is waived for this slot only, because the matchup is fixed and
  intentionally uneven. The Everyone roster is also exempt from the same-day
  no-repeat set: blocking every eligible orb would leave the other Saturday
  videos with no roster. Those other videos keep the rotating two-day cooldown
  and may overlap an orb that also appears in Everyone.
- Orb Foundry Shorts are generated from two unique allowlisted Classic orbs.
  Their preflight must produce a completed, close battle with at least 25
  seconds of live action before the browser exporter starts.
- The two-day no-repeat rotation is tracked separately for the Orb Race and
  Orb Foundry stable-ID rosters.
- Each regular battle video contains exactly one matchup. Shorts include at
  least 25 seconds of live race action; long-form includes at least 60 seconds. The planner
  preflights the chosen matchup and computes a deterministic action playback
  rate so the race itself—not a pause, end screen, or rematch—fills the target.
  Long-form courses expand to 50 ascending layers to provide a longer natural
  race before slow motion is applied. Race simulation starts only after the
  recorder is active. The exporter measures action time and matchup count, and
  rejects a clip if it misses either contract.
- Every layer starts at or above 500 HP. The profiles are ascending for Shorts
  and long-form. Shorts use no more than three layers. 500 is a floor, not a
  required first value.
- Before rendering, the planner runs the deterministic matchup through the same
  Orb Race simulation and prefers a finished battle whose progress margin and
  layer lead fit the configured close-battle thresholds. The search is capped
  at 128 attempts. A candidate whose spawned orbs or projectiles grow past the
  planning budget—Duplicator copies previously exhausted the heap—is abandoned
  and the next matchup is tried. If the capped search finds no battle inside
  those thresholds, it keeps the closest finished candidate and marks that plan
  as a bounded fallback. The fallback still has to be a finished race with the
  normal duration, layer, roster, and announcer rules. Unfinished and runaway
  candidates are not promoted. One slot that still cannot be planned does not
  cancel the other slots.
- When the estimated damage strength is very uneven, the shared layer profile is
  scaled upward (within the configured cap) so stronger matchups work through
  more HP. This is a balancing aid, not a replacement for the close-battle gate.
- The exported recording must include the selected announcer coverage for the
  matchup, battle phase, and outcome. If a specialized cue is missing, use its
  valid generic fallback; never silently omit the announcer layer. Split-wise
  audio is valid only when the presentation itself is split.

## Mandatory per-upload checklist

Every upload must pass this checklist in order. A failed item stops the run
before YouTube receives the video:

1. Select only stable IDs in the relevant `videoReady` allowlist. Orb Race
   matchups and tournament entrants must use the race roster; Orb Foundry
   matchups must use the Classic roster with every excluded ID rejected.
2. Enforce the two-full-day orb cooldown and keep same-day videos distinct
   within each game mode when the roster allows it. A single daily Foundry
   chance can replace only one of the two Short slots. Classic / Orb Foundry
   never replaces a long-form slot. Saturday's Everyone team is the documented
   overlap exception and does not consume the daily Orb Race roster.
3. Use either a 1v1 battle or an allowed multi-orb team battle; record every
   stable orb ID and team label in the export metadata. On tournament Fridays,
   reserve the approved tournament entrants first and keep other Orb Race
   videos to 1v1 so the daily roster does not repeat.
4. For a regular battle video, plan exactly one matchup whose live action fills
   the duration: at least 25 seconds for a Short and 60 seconds for long-form.
   Preflight the same normalized race options the exporter records, including
   regular speed when a setup omits it, then set the deterministic action
   playback rate so planned action is at least 5% longer than the minimum. Do
   not promote a finished battle that still cannot meet that duration. Use the
   50-layer long-form course where applicable. Saturday's Everyone VS Infinity
   video uses that same layer count with every layer at the top configured
   long-form HP. Do not restart, replay, or rematch the battle, and do not pad
   action time with a pause or static end screen. Verify the recorded action
   clock and exactly-one-match counter before upload. Friday tournaments are
   the explicit full-bracket exception and must pass step 9. Saturday's special
   remains a single matchup; only its close-battle margin and same-day roster
   overlap are waived.
5. Use no more than three layers for an Orb Race Short. Every Orb Race layer
   must be at least 500 HP, and Short layer HP must be ascending. Long-form
   uses its separate ascending profile. Orb Foundry Shorts instead use their
   explicit black/outline-free/large-square style and a preflighted Classic
   battle.
6. Run the deterministic preflight simulation and prefer a matchup that
   finishes within the configured close-battle progress and layer-lead limits.
   If the capped search has no in-limit battle, keep the closest finished
   candidate as a bounded fallback. Do not promote an unfinished or runaway result.
7. Load announcer assets before recording and verify that the exported recording
   contains an announcer sequence and at least one spoken announcer cue. Retry
   transient fetch, decode, and AudioContext resume failures, and do not start
   the recorder until the cues for that battle are buffered. Use
   context-aware standard cues for normal battles; use split-wise announcer audio
   only when the presentation is actually split. If a specialized cue is
   unavailable, use a valid generic spoken fallback. Procedural-only or silent
   announcer output is a hard failure.
8. Validate the complete generation spec before starting the browser recorder:
   the selected roster, teams, close-battle result, planned action rate and
   duration, layer profile, and announcer requirements must already match the
   contract. If preflight fails, do not render or upload that slot.
9. Transcode the accepted recording to MP4, preserve the metadata and run tag,
   and validate the final artifact again. For a tournament, confirm the
   complete bracket has exactly `entrants - 1` recorded matches, a champion,
   whole-tournament scope, at least 120 seconds, and one announcer sequence
   plus spoken cues for every match. Continuous bracket recordings keep that
   announcer proof across match resets, including camera-pan matches. For an
   Orb Foundry Short, verify Classic mode, both orb IDs,
   black theme, no outlines, square layout, and the large square arena. Reject
   any artifact whose metadata or announcer proof no longer matches the plan.
   Titles must use readable casing for orb/group names. Friday tournaments must
   be titled `Who is the Best Orb?`. Descriptions must contain the actual
   first-layer HP and both displayed matchup names before the required hashtags,
   except Friday tournaments and Orb Foundry Shorts, which use their own
   source descriptions plus those hashtags. A Friday tournament also gets a
   square custom thumbnail: a plain background and a grid containing every
   entrant orb, generated from the race orb colors already in the repo. The
   publisher writes that PNG next to the MP4 and calls `thumbnails.set` after
   the resumable upload. `youtube.upload` and `youtube.readonly` cannot set
   thumbnails. The OAuth helper also requests `youtube.force-ssl`. A refresh
   token minted before that scope was added is rejected by `thumbnails.set`;
   the private scheduled upload still succeeds, and the run logs
   `missing-oauth-scope` until `npm run youtube:oauth` is repeated and
   `YOUTUBE_REFRESH_TOKEN` is replaced. YouTube also requires a verified
   channel before it accepts a custom thumbnail.
10. Check YouTube for the run tag before upload. Upload only as private with the
    planned Pacific `publishAt` timestamp. Never upload after any checklist item
    fails.

## Channel-derived roster

The active roster is derived from the public Videos and Shorts listings for
[`OrbBattlegroundsSimulator`](https://www.youtube.com/@OrbBattlegroundSimulator).
Quantity markers and labels such as `(buffed)` are normalized to the matching
stable orb ID. Compound names such as `GRAVSLAMMY` remain group entries so the
title generator can use the channel's established naming.

The channel page reported 123 videos while the public listing metadata exposed
122 title entries during the review on 2026-09-19. The seven labels in
`rosterSource.unmappedObservedLabels` are preserved for follow-up but are not
active upload candidates until the codebase has matching stable IDs.

Only entries in `videoReady` are eligible for unattended publishing. An orb that
is not in that allowlist must not be selected for a YouTube batch.

## Activation requirements

The daily scheduler is configured separately from this repository. The GitHub
workflow `.github/workflows/youtube-publishing.yml` is manual-only; it does not
run on a cron schedule. Keep the external scheduler aligned with all four slots
in `config/youtube-publishing.json`, including Friday's tournament variant,
Saturday's Everyone VS Infinity long-form, and the daily Foundry decision.
Classic / Orb Foundry remains Shorts-only. A repo update does not change that
external bot's own schedule or credentials.

Create a Google Cloud OAuth client and enable the YouTube Data API v3. For
manual GitHub Actions runs, add these repository secrets:

- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REFRESH_TOKEN`

The one-time local refresh-token helper requests the upload and read-only
scopes needed to publish and detect duplicate scheduled runs, plus
`youtube.force-ssl` so `thumbnails.set` can attach the tournament thumbnail.
Tokens created with only `youtube.upload` and `youtube.readonly` can still
upload and schedule videos; they cannot set that thumbnail until the owner
runs the helper again and replaces the stored refresh token:

```bash
YOUTUBE_CLIENT_ID='...' \\
YOUTUBE_CLIENT_SECRET='...' \\
npm run youtube:oauth
```

The OAuth client redirect URI must include
`http://127.0.0.1:8787/oauth2callback`. Copy the printed refresh token into the
private repository's `YOUTUBE_REFRESH_TOKEN` Actions secret. The external
scheduler also needs equivalent credentials in its own secret store. OAuth
credentials and refresh tokens must never be committed to the repository.

The publisher uses the YouTube Data API's resumable upload flow. It renders
quality-gated Orb Race matchups, optional Orb Foundry Shorts, Friday's full
Orb Race tournament, and Saturday's Everyone VS Infinity long-form; transcodes
them to MP4; checks for the run tag before uploading; and stores generated
media only under ignored `artifacts/` output. Friday's tournament then tries
to set the generated entrant-grid thumbnail. A missing thumbnail scope or an
unverified channel does not cancel the private scheduled upload.
Each daily batch prepares four private uploads and sets their Pacific
`publishAt` times. YouTube then makes each video public without a second runner
invocation.

The workflow can be tested from GitHub's **Run workflow** menu. Manual runs
default to `dry_run=true`; set it to false only after the OAuth secrets and
Google Cloud project are ready. The local equivalent is:

```bash
npm run youtube:publish -- --dry-run --slot=noon-short --date=2026-09-19
```

To preview the complete daily batch, use:

```bash
npm run youtube:publish -- --batch --dry-run --date=2026-09-19
```

For a manual recovery run, dispatch the workflow with `slot_id=batch` and
`dry_run=false` to render and upload all four daily videos. The same run
tags protect against duplicate uploads.

The publisher does not bypass [YouTube's API project restrictions](https://developers.google.com/youtube/v3/docs/videos#video-upload). Private scheduled
uploads are intentional here; if Google applies an additional restriction, the
video remains private rather than being released early.

## Validation

Validate the contract locally with:

```bash
npm run youtube:validate
```

The command reports the configured schedule and whether a video-ready roster has
been supplied. An empty roster is valid configuration but intentionally cannot
activate publishing.
