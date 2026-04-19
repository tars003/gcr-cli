# 10 — Workflow: Release

Covers: `src/workflows/release.ts`

---

## What it is

The release sequence. Orchestrates adapters and UI to take Ajay from "I want to cut a release" to "GitHub Release is live, ClickUp tasks are tagged."

## Dependencies

- `src/config.ts` — project config, credentials, awareness files
- `src/adapters/git.ts` — merge staging into production
- `src/adapters/agent.ts` — compile release notes, suggest version
- `src/adapters/github.ts` — fetch merged PRs, create release
- `src/adapters/clickup.ts` — update tasks with release tag
- `src/ui/types.ts` — UI interface
- `src/prompts/compile-release-notes.txt`
- `src/prompts/suggest-version.txt`

## Sequence

1. Load config and credentials
2. Fetch PRs merged into staging since last GitHub release, filtered to GCR-managed only
3. Show PR list → Ajay selects which to include via `ui.multiselect()`
4. Extract partial release notes comment from each selected PR
5. Collect all ClickUp task IDs linked across selected PRs
6. Open agent session
7. Build release notes prompt (all partial notes) → stream compiled notes to terminal
8. Ajay reviews. Ask: looks good?
9. Build version suggestion prompt (PR types and changes) → agent suggests semver bump
10. Show suggestion → Ajay confirms or types a different version via `ui.input()`
11. Merge staging → production via GitHub adapter
12. Create GitHub Release with version tag and compiled notes
13. For each collected ClickUp task ID → update task with release tag via ClickUp adapter
14. Close agent session
15. Display release URL and summary (how many PRs, how many tasks tagged)

## What it does NOT do

No direct terminal calls. No chalk, no inquirer. All UI goes through the `ui` parameter.

## Build order

Step 6. All adapters and terminal UI must exist before this is built. Can be built in parallel with `pr-create` workflow.
