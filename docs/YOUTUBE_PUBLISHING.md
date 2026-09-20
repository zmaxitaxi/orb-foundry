# YouTube Publishing

Orb Foundry's approved YouTube publishing contract is stored in
[`config/youtube-publishing.json`](../config/youtube-publishing.json).

## Current contract

- Timezone: `America/Los_Angeles` (Pacific time, including daylight-saving changes).
- `12:00 PM`: one long-form video and the first Short.
- `3:00 PM`: the second Short.
- Delivery mode: daily automated batches.
- Video approval: not required.
- Title: `{left} VS {right}`.
- Description hashtags: `#physics #shorts #simulation #satisfying`.
- Group matchups use the group label in the title instead of expanding every orb name.
- Supported content sources will be Orb Race and Orb Foundry, selected through the
  explicit `videoReady` allowlist.

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

The live publisher should run on a hosted GitHub Actions runner so it can operate
when the development computer is asleep or offline. Before enabling public
uploads, configure the approved roster and add these GitHub Actions secrets:

- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REFRESH_TOKEN`

OAuth credentials and refresh tokens must never be committed to the repository.
The publisher will use the YouTube Data API's resumable upload flow and will keep
its generated media under ignored `artifacts/` output.

## Validation

Validate the contract locally with:

```bash
npm run youtube:validate
```

The command reports the configured schedule and whether a video-ready roster has
been supplied. An empty roster is valid configuration but intentionally cannot
activate publishing.
