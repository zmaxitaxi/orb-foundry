# Weekly self-improvement loop

Orb Foundry's game-improvement loop is a hosted, PR-producing workflow. It is
not an auto-merge bot and it never pushes directly to `main`.

## Contract

- Runs on a GitHub-hosted runner every Monday at `16:00 UTC` (8:00 AM PST or
  9:00 AM PDT) and can also be started with **Run workflow**.
- Selects at most one bounded, player-facing improvement per run.
- Reads `AGENTS.md`, `README.md`, the recent `progress.md` history, tests, and
  the current implementation before choosing work.
- Creates an isolated branch named `codex/weekly-improvement-<run id>`.
- Runs the full Node test suite, syntax checks, and the Playwright browser smoke
  check before opening a pull request.
- Pushes only the isolated branch and opens a PR against `main`.
- Leaves the PR for human review and approval; no merge or production publish
  is performed by this loop.

The workflow is deliberately bounded. A run that cannot identify a safe,
valuable change, or cannot verify its change, should produce no PR rather than
make speculative edits.

## Change-selection rules

The agent should prefer, in order:

1. A concrete player-facing bug or incomplete behavior already visible in the
   current code or recent progress log.
2. A focused improvement to an existing mode, recording flow, accessibility
   surface, or deterministic test seam.
3. A small supporting test or documentation improvement when it removes a
   demonstrated maintenance risk.

It should not start a broad redesign, invent a new product mode, rewrite
working systems for style, or touch unrelated generated media. Stable IDs,
seeded randomness, fixed-step simulation, and module ownership remain part of
the product contract.

## Activation

The workflow is dormant until the repository has an `OPENAI_API_KEY` Actions
secret. The official Codex GitHub Action uses that secret to run the remote
agent. Optional repository variables are supported:

- `CODEX_MODEL` — model override; leave unset to use the action default.
- `CODEX_REASONING_EFFORT` — reasoning-effort override; leave unset to use the
  action default.

Before relying on unattended PRs, protect `main` in GitHub so changes require
pull-request review and the `Orb Foundry CI / Tests and browser smoke` check.
The workflow itself only pushes its generated `codex/weekly-improvement-*`
branch, but branch protection is the final repository-level enforcement.
Because the PR is created by `GITHUB_TOKEN`, GitHub may place its first
pull-request workflow run in an approval-required state; approve that run once
from the PR page if GitHub requests it.
If the repository's Actions settings prohibit workflows from creating pull
requests, enable that repository setting before the first run.

## Updates and failure behavior

Each PR contains the agent's selected improvement, rationale, changed files,
tests, and limitations. A no-op run records that no safe change was found. A
failed verification leaves no publishable branch and is visible in the Actions
run; it does not bypass the review gate.

The media-publishing loop is separate. This workflow does not upload videos,
change the YouTube allowlist, or use publishing credentials.
