# YouTube Publishing

Orb Foundry's approved YouTube publishing contract is stored in
[`config/youtube-publishing.json`](../config/youtube-publishing.json).

## Current contract

- The external scheduler prepares one Classic Orb Foundry Short and one
  long-form video for noon and 3 PM Pacific. The release times follow
  daylight-saving changes.
- Regular slots run Classic 1v1 fights. The planner favors WDC, One Punch
  Man, Gojo, John Rod, One Above All, Knight, Ben 10, Darth Vader, and Luke
  Skywalker. Every Classic fighter except Grappler is eligible for duels.
- Friday at 3 PM, the long-form slot records one boss battle. The boss
  starts with exactly three times its current roster HP and faces three
  distinct challengers. The fight has a four-minute action minimum.
- Orb Racer can be selected for an on-demand Short through the same publisher.
  Grappler is excluded from its posting roster too.
- Shorts use 1080 × 1920 portrait. Long form uses the 1920 × 1080
  **ORB RACE LONG FORM** preset. Both use the black Classic theme, a large
  arena, and team outlines off. Each format uses one square and one circle
  per day. A manual run can choose either shape. Each video records one fight.
- Titles use `{left} VS {right}` with readable names. Orb Foundry asks who
  will win the battle. Orb Racer names the starting layer HP. All videos use
  `#physics #simulation #satisfying`. Shorts also use `#shorts`.
- Upload as private with the planned YouTube `publishAt` time. A slot's
  run tag prevents a second upload for the same date and time.

## Matchup and upload checks

1. Rotate the eligible roster with a two-day cooldown. For Classic, each
   day's pool draws three featured fighters and twelve others. Try pairs
   involving a featured fighter first and use distinct fighters within
   each format. A fighter can appear in both formats on the same day, but
   an exact duel cannot repeat. The Friday boss picks before the other long-form duel.
2. Simulate each candidate at the planned seed and settings. Live batches
   use the same Chrome executable that records the fight. Adjust starting
   HP when needed, then rerun the fight. A Classic preflight requires a
   completed result, at least four signature actions, and at most 40% HP
   remaining on the winning side. The action minimum, with a 5% planning
   buffer, is 25 seconds for a Short, 120 seconds for regular long form, and
   240 seconds for the Friday boss. The planner prefers normal speed and
   can slow the full recording when needed. Boss tuning can change the
   challengers' starting HP while the boss stays at exactly 3× base HP.
3. One Punch Man starts at 1 HP. His fights pass by showing at least four
   dodges of real attacks, a dodge in the final eight seconds, and at least
   two different landed attacks. One Punch Man is reserved for duels so his
   fixed HP and infinite dodges don't break the boss battle's health rules.
4. For an Orb Racer Short, use up to three ascending layers of at least
   500 HP each. Prefer a close finish. The bounded search can use its
   closest finished candidate if it passes the rest of the contract.
   Playback speed can extend one race to the action minimum.
5. Load the correct spoken announcer clips before recording. Check
   the final recording for at least one spoken sequence, the planned
   format, and the required duration. For Classic, verify that the recorded
   winning side, remaining HP, fight time, playback speed, and starting
   settings match the preflight.
6. Check the run tag and the approved metadata before uploading. A failed
   slot is reported separately so the other videos can still proceed.

Preview Friday's full batch locally. The dry run uses Node. Live Chrome
preflight can choose a different matchup if the engines resolve a collision
differently.

```bash
npm run youtube:publish -- --dry-run --batch --date=2026-11-13
```

Plan a manual Orb Racer Short:

```bash
npm run youtube:publish -- --dry-run --source=orb-race --slot=noon-short --date=2026-11-09
```

Plan a manual Orb Foundry Short with a circle:

```bash
npm run youtube:publish -- --dry-run --arena-shape=circle --slot=noon-short --date=2026-11-09
```

## Orb Racer roster source

The Orb Racer posting roster draws from the public Videos and Shorts listings for
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

The external scheduler needs to run the updated `main` branch and invoke
`npm run youtube:publish -- --batch` to prepare all four daily slots. GitHub Actions
is available for manual runs, with a source selector for Orb Foundry or
Orb Racer and a shape selector for Classic. The separate runner supplies
its own schedule and credentials.

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

The publisher renders the approved videos, transcodes them to MP4, and uses
the YouTube Data API's resumable upload flow. Generated files live under
ignored `artifacts/` output. Each batch prepares four private uploads with
Pacific `publishAt` times. YouTube releases them at those times.

The GitHub **Run workflow** menu defaults to `dry_run=true`. For a manual
recovery run with credentials configured, use `slot_id=batch`,
`content_source=orb-foundry`, and `dry_run=false`. The run tags protect
against duplicate uploads.

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
