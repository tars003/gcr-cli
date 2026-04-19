# 06 — Adapter: ClickUp

Covers: `src/adapters/clickup.ts`

---

## What it is

Talks to the ClickUp REST API. Handles fetching tasks and writing release information back to tasks.

## Dependencies

- `axios`
- ClickUp API key from credentials

## What it gives out

Two functions:

- `getTasksFromList(listId, apiKey)` — fetches all open tasks from a given list. Returns array of `{ id, name, status, url }`. Excludes closed/done tasks.
- `updateTaskWithReleaseTag(taskId, releaseTag, apiKey)` — writes the release tag (e.g. `v1.4.0`) onto the ClickUp task as a comment.

## Key decisions

- `getTasksFromList` uses `include_closed: false` — done tasks are never relevant at PR creation time
- Only page 0 is fetched (first 100 tasks). Enough for any normal sprint or backlog.
- `updateTaskWithReleaseTag` posts a comment on the task rather than updating a custom field. Reason: comments work on every ClickUp workspace without custom field setup. The comment format is: `🚀 Released in v1.4.0`
- Both functions take `apiKey` as an argument rather than reading it themselves — the workflow passes it in from config.

## What it does NOT do

No UI. No knowledge of GitHub. Does not decide which list to fetch from — the workflow passes the list ID.

## Build order

Step 4. No dependencies on other project modules.
