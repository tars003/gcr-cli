# 09 — Workflow: PR Create

Covers: `src/workflows/pr-create.ts`

---

## What it is

The PR creation sequence. Orchestrates adapters and UI in the right order to take a developer from "I finished my feature" to "PR is live on GitHub with ClickUp tasks linked and code review posted."

## Dependencies

- `src/config.ts` — project config, credentials, awareness files
- `src/adapters/git.ts` — diff and commits
- `src/adapters/agent.ts` — code review and task matching
- `src/adapters/clickup.ts` — fetch tasks
- `src/adapters/github.ts` — create PR, post comments
- `src/ui/types.ts` — UI interface (receives this, does not import terminal directly)
- `src/prompts/review-code.txt` — loaded and passed to agent
- `src/prompts/match-tasks.txt` — loaded and passed to agent

## Sequence

1. Load config, credentials, awareness files
2. Get current branch and target branch (staging)
3. Warn if uncommitted changes exist
4. Get diff via git adapter (`git diff staging...HEAD`)
5. Get commits via git adapter (`git log staging..HEAD`)
6. Open agent session
7. Build review prompt (project awareness + diff) → stream to terminal via `ui.stream()`
8. Show review result. Ask developer: continue?
9. Show list of configured ClickUp lists → developer picks one
10. Fetch tasks from that list via ClickUp adapter
11. Build task matching prompt (review context already in session + tasks + clickup awareness)
12. Show AI-suggested tasks pre-selected → developer adjusts via `ui.multiselect()`
13. Developer types PR title via `ui.input()`
14. Create PR via GitHub adapter → get PR URL
15. Post Comment #1: linked ClickUp tasks (names + URLs) with `<!-- gcr-managed -->` marker
16. Post Comment #2: code review findings (skipped if AI found no issues)
17. Close agent session
18. Display PR URL and summary

## What it does NOT do

No direct terminal calls. No chalk, no inquirer. All UI goes through the `ui` parameter.

## Build order

Step 6. All adapters and terminal UI must exist before this is built.
