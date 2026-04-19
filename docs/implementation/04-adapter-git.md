# 04 · Adapter: Git

`src/adapters/git.ts`

---

## What it does

Talks to git. Answers the questions workflows need about the current repo state.

## Exports

| Function | Arguments | Returns |
|---|---|---|
| `getCurrentBranch()` | — | `Promise<string>` |
| `getDiff(targetBranch)` | `targetBranch: string` | `Promise<string>` |
| `getCommits(targetBranch)` | `targetBranch: string` | `Promise<Commit[]>` |
| `hasUncommittedChanges()` | — | `Promise<boolean>` |

## Commit type

```
{ hash: string, message: string }
hash is short — 7 characters
```

## Key decisions

- `getDiff` uses three-dot syntax — `git diff targetBranch...HEAD` — diff from where branch diverged, matches what GitHub shows on a PR
- `getCommits` uses two-dot syntax — `git log targetBranch..HEAD` — commits on this branch not yet in target
- If target branch not found locally, retry with `origin/` prefix before throwing
- All functions operate on `process.cwd()`

## What it does NOT do

No UI. No config reading. Receives branch names as arguments — does not decide which branches to compare.
