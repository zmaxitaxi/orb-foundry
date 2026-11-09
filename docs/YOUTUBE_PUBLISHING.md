# YouTube Publishing

Orb Foundry's approved YouTube publishing contract is stored in
[`config/youtube-publishing.json`](../config/youtube-publishing.json).

## Current contract

- The external scheduler prepares two Orb Foundry Shorts each day. YouTube
  releases them at noon and 3 PM Pacific, including daylight-saving changes.
- Both slots run Classic 1v1 fights. The planner favors WDC, One Punch Man,
  Gojo, John Rod, One Above All, Knight, Ben 10, Darth Vader, and Luke
  Skywalker. Every Classic fighter except Grappler is eligible.
- Orb Racer can be selected for an on-demand Short through the same publisher.
  Grappler is also excluded from its posting roster. The daily schedule
  contains only the two Orb Foundry Shorts.
- Record 1080 × 1920 portrait video with the black Classic theme, a large
  arena, and team outlines off. Each daily batch uses one square and one
  circle. A manual run can choose either shape. Each video records one fight.
- Titles use `{left} VS {right}` with readable names. Orb Foundry asks who
  will win the battle. Orb Racer names the starting layer HP. Both include
  `#physics #shorts #simulation #satisfying`.
- Upload as private with the planned YouTube `publishAt` time. A slot's
  run tag prevents a second upload for the same date and time.

## Matchup and upload checks

1. Rotate the eligible roster with a two-day cooldown. For Classic, each
   day's pool draws three featured fighters and twelve others. Try pairs
   involving a featured fighter first and use distinct fighters in the
   two Shorts.
2. Simulate each candidate at the planned seed and settings. Live batches
   use the same Chrome executable that records the fight. Adjust starting
   HP when needed, then rerun the fight. A Classic preflight requires a
   completed result, at least 25 seconds of live action with a 5% buffer,
   no more than 65 seconds of fight time, and at least four signature
   actions. The winner must have at most 40% HP remaining.
3. One Punch Man starts at 1 HP. His fights pass by showing at least four
   dodges of real attacks, a dodge in the final eight seconds, and at least
   two different landed attacks. These are dodge showcases.
4. For an Orb Racer Short, use up to three ascending layers of at least
   500 HP each. Prefer a close finish. The bounded search can use its
   closest finished candidate if it passes the rest of the contract.
   Playback speed can extend one race to the action minimum.
5. Load the correct spoken announcer clips before recording. Check
   the final recording for at least one spoken sequence, the planned
   portrait layout, and the required duration. For Classic, verify that
   the recorded winner, remaining HP, fight time, and starting settings
   match the preflight.
6. Check the run tag and the approved metadata before uploading. A failed
   slot is reported separately so the other Short can still proceed.

Preview both scheduled Shorts locally. The dry run uses Node. Live Chrome
preflight can choose a different matchup if the engines resolve a collision
differently.

```bash
npm run youtube:publish -- --dry-run --batch --date=2026-11-09
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
`npm run youtube:publish -- --batch` for the two daily Shorts. GitHub Actions
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

The publisher renders the approved Shorts, transcodes them to MP4, and uses
the YouTube Data API's resumable upload flow. Generated files live under
ignored `artifacts/` output. Each batch prepares two private uploads with
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
