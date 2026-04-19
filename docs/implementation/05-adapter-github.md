# 05 — Adapter: GitHub

Covers: `src/adapters/github.ts`

---

## What it is

Talks to GitHub via the `gh` CLI. Handles all GitHub operations the workflows need.

## Dependencies

- `gh` CLI — must be installed and authenticated on the developer's machine
- Node `child_process` — to call gh commands
- Node `fs`, `os`, `crypto` — for writing temp files (see below)

## What it gives out

Four functions:

- `createPR(title, body, baseBranch)` — creates a PR, returns the PR URL
- `addComment(prUrl, body)` — posts a comment on the PR at the given URL
- `getMergedPRs(baseBranch, sinceDate?)` — returns list of PRs merged into baseBranch since a given date. Each item includes: PR number, title, URL, merged date, body
- `createRelease(tag, name, body, targetBranch)` — creates a GitHub release with a version tag

## Key decisions

- All PR/comment bodies are written to a temp file first, then passed via `--body-file` to gh CLI. This avoids shell escaping issues with multi-line markdown content.
- Temp files are always cleaned up after the command runs, success or failure.
- `getMergedPRs` returns only PRs that have the GCR marker comment `<!-- gcr-managed -->` in their body — this filters out non-GCR PRs from the release flow.
- Functions throw with a clear message if the gh CLI is not installed or not authenticated.

## What it does NOT do

No UI. No knowledge of ClickUp. Does not read config.

## Build order

Step 4. No dependencies on other project modules.
