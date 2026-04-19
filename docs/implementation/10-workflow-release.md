# 10 · Workflow: Release

`src/workflows/release.ts`

---

## What it does

The release sequence. Compiles release notes from merged PRs, creates a GitHub Release with a version tag, and writes the release tag back to every linked ClickUp task.

## Dependencies

- `src/config.ts` — loadConfig, loadCredentials, loadProjectAwareness, loadPrompt
- `src/adapters/git.ts` — mergeBranches
- `src/adapters/agent.ts` — createSession, prompt, closeSession
- `src/adapters/github.ts` — getMergedPRs, getPRComments, getLastReleaseDate, getLastReleaseTag, createRelease
- `src/adapters/clickup.ts` — updateTaskWithReleaseTag
- `src/ui/types.ts` — UI interface
- `src/prompts/compile-release-notes.txt`
- `src/prompts/suggest-version.txt`

## Note: github adapter addition needed

`getLastReleaseDate()` already exists. Need to add `getLastReleaseTag()` → `string | null` to the github adapter before building this workflow. One `gh release list` call returns both — return them together as `getLastRelease()` → `{ tag: string, date: string } | null`.

## Signature

```ts
export async function releaseFlow(ui: UI): Promise<void>
```

## Sequence

1. Load config and credentials
2. `getLastRelease()` — get last tag and date. If none, fetch all GCR PRs (no date filter)
3. `ui.display` last release info if found
4. `getMergedPRs(staging, sinceDate)` — GCR-managed PRs only
5. If no PRs found — tell user, exit cleanly
6. `ui.multiselect` — show PR titles, all pre-selected, user deselects any to exclude
7. For each selected PR — `getPRComments(pr.number)`, find comment containing `<!-- gcr-tasks -->`, extract task IDs JSON between markers
8. Collect all unique task IDs across selected PRs. Collect task names from the same comment.
9. Open agent session
10. Build release notes prompt — PR titles + task names + project awareness (tone/format guidance)
11. `ui.display('── Release Notes ──', 'muted')` then stream via `ui.stream`
12. `ui.display('\n')` after stream ends
13. `ui.confirm('Release notes look good?')` — exit if no
14. Build version suggestion prompt — last tag + PR titles (features vs fixes)
15. `ui.startSpinner` → call `agent.prompt` (no streaming) → `ui.stopSpinner`
16. Parse suggested version from response
17. `ui.input('Version tag:')` pre-filled with suggestion — user confirms or types different
18. `ui.confirm('Ready to release? This will merge staging → production.')` — exit if no
19. `ui.startSpinner('Merging staging → production...')` → `mergeBranches(staging, production)` → `ui.stopSpinner`
20. `ui.startSpinner('Creating GitHub release...')` → `createRelease(tag, tag, notes, production)` → `ui.stopSpinner`
21. For each task ID — `updateTaskWithReleaseTag(id, tag, apiKey)`. Show progress per task.
22. `ui.display` summary — release URL, PRs included, tasks tagged count

## Prompt placeholders

**compile-release-notes.txt**: `{{projectAwareness}}`, `{{prSummary}}`
`prSummary` = each PR as: `PR: <title>\nTasks: <task names comma separated>`

**suggest-version.txt**: `{{lastTag}}`, `{{prTitles}}`
`prTitles` = newline-separated list of PR titles

## Task ID extraction

From each PR's comments, find the comment containing `<!-- gcr-tasks -->`.
Extract JSON between `<!-- gcr-tasks -->` and `<!-- /gcr-tasks -->`.
Parse as string array of task IDs.
If no gcr-tasks comment found on a PR, skip task extraction for that PR.

## What it does NOT do

No chalk, no inquirer. All output and input goes through `ui`.
