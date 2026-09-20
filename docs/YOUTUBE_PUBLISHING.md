# YouTube Publishing

Orb Foundry's approved YouTube publishing contract is stored in
[`config/youtube-publishing.json`](../config/youtube-publishing.json).

## Current contract

- Timezone: `America/Los_Angeles` (Pacific time, including daylight-saving changes).
- `12:00 PM`: one long-form video and the first Short.
- `3:00 PM`: the second Short.
- Delivery mode: daily automated morning batch.
- Upload mode: private uploads with YouTube `publishAt` scheduling, so the
  hosted runner can prepare the videos before the Pacific release times.
- Video approval: not required.
- Title: `{left} VS {right}`.
- Description hashtags: `#physics #shorts #simulation #satisfying`.
- Group matchups use the group label in the title instead of expanding every orb name.
- Supported content sources will be Orb Race and Orb Foundry, selected through the
  explicit `videoReady` allowlist.

## Video quality contract

Every unattended video must satisfy the quality contract in
[`config/youtube-publishing.json`](../config/youtube-publishing.json):

- An orb stays on cooldown for at least two full publishing days. The planner
  also keeps all three videos on the same day distinct when the roster allows it.
- A battle may be a 1v1 duel or a multi-orb team duel. The selected format and
  every stable orb ID are recorded in the export metadata.
- Shorts are at least 25 seconds; long-form videos are at least 60 seconds.
  The browser recorder holds the winner reveal until the minimum is reached,
  and the exporter rejects a shorter recording.
- Every layer starts at or above 500 HP. The profiles are ascending for Shorts
  and long-form. 500 is a floor, not a required first value.
- Before rendering, the planner runs the deterministic matchup through the same
  Orb Race simulation and only accepts a finished battle whose progress margin
  and layer lead fit the configured close-battle thresholds.
- When the estimated damage strength is very uneven, the shared layer profile is
  scaled upward (within the configured cap) so stronger matchups work through
  more HP. This is a balancing aid, not a replacement for the close-battle gate.

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

The live publisher runs on the hosted GitHub Actions workflow
`.github/workflows/youtube-publishing.yml`, so it can operate when the
development computer is asleep or offline. It runs a morning batch in both
UTC positions needed for Pacific standard/daylight time, then sets YouTube's
publish times in `America/Los_Angeles` for noon and 3:00 PM.

Before enabling the scheduled uploads, create a Google Cloud OAuth client, enable the
YouTube Data API v3, and add these GitHub Actions secrets:

- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REFRESH_TOKEN`

The one-time local refresh-token helper requests the upload and read-only
scopes needed to publish and detect duplicate scheduled runs:

```bash
YOUTUBE_CLIENT_ID='...' \\
YOUTUBE_CLIENT_SECRET='...' \\
npm run youtube:oauth
```

The OAuth client redirect URI must include
`http://127.0.0.1:8787/oauth2callback`. Copy the printed refresh token into the
private repository's `YOUTUBE_REFRESH_TOKEN` Actions secret. OAuth credentials
and refresh tokens must never be committed to the repository.

The publisher uses the YouTube Data API's resumable upload flow. It renders a
deterministic, quality-gated Orb Race matchup from the active allowlist,
transcodes it to MP4, checks for the run tag before uploading, and stores
generated media only under ignored `artifacts/` output. Scheduled workflow runs
prepare all three daily videos in the morning, upload them as private, and set
their Pacific `publishAt` times. YouTube then makes each video public without a
second runner invocation.

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
