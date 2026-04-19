# 05 · Adapter: GitHub

`src/adapters/github.ts`

---

## What it does

Talks to GitHub via the `gh` CLI. All GitHub operations the workflows need.

## Exports

| Function | Arguments | Returns |
|---|---|---|
| `createPR(title, body, baseBranch)` | strings | `string` — PR URL |
| `addComment(prUrl, body)` | strings | `void` |
| `getMergedPRs(baseBranch, sinceDate?)` | string, optional `YYYY-MM-DD` | `PullRequest[]` |
| `getPRComments(prNumber)` | number | `string[]` — comment bodies |
| `getLastReleaseDate()` | — | `string \| null` — `YYYY-MM-DD` |
| `createRelease(tag, name, body, targetBranch)` | strings | `string` — release URL |

## PullRequest type

```
{ number, title, url, mergedAt, body }
```

## Key decisions

- All multi-line content (PR body, comments, release notes) written to a temp file and passed via `--body-file`. Avoids shell escaping issues. Temp files cleaned up after every call.
- `createPR` prepends `<!-- gcr-managed -->` to every PR body — this marker is how the release flow identifies GCR-managed PRs.
- `getMergedPRs` fetches last 50 merged PRs and filters to those whose body contains `<!-- gcr-managed -->`.
- If `gh` is not installed or not authenticated, throw with a clear message.

## What it does NOT do

No UI. No git operations. Does not know about ClickUp.
