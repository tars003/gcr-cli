# 06 · Adapter: ClickUp

`src/adapters/clickup.ts`

---

## What it does

Talks to the ClickUp REST API. Fetches tasks and writes release info back to tasks.

## Exports

| Function | Arguments | Returns |
|---|---|---|
| `getTasksFromList(listId, apiKey)` | strings | `Promise<ClickUpTask[]>` |
| `updateTaskWithReleaseTag(taskId, releaseTag, apiKey)` | strings | `Promise<void>` |

## ClickUpTask type

```
{ id, name, status, url }
```

## Key decisions

- `getTasksFromList` fetches page 0 only (100 tasks max) — enough for any normal sprint
- `include_closed: false` — done/closed tasks excluded
- `updateTaskWithReleaseTag` posts a comment on the task: `🚀 Released in v1.4.0`
- Uses comments (not custom fields) — works on every ClickUp workspace without extra setup
- Both functions receive `apiKey` as an argument — they do not read credentials themselves

## What it does NOT do

No UI. No knowledge of GitHub. Does not decide which list to use — the workflow passes the list ID.
