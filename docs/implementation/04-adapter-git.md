# 04 — Adapter: Git

Covers: `src/adapters/git.ts`

---

## What it is

Talks to git. Answers the questions the workflows need about the current repository state.

## Dependencies

- `simple-git`

## What it gives out

Four functions:

- `getCurrentBranch()` — returns the name of the current branch
- `getDiff(targetBranch)` — returns the full code diff between this branch and target using `git diff targetBranch...HEAD` (three dots — from common ancestor)
- `getCommits(targetBranch)` — returns the list of commits on this branch not yet in target, using `git log targetBranch..HEAD`
- `hasUncommittedChanges()` — returns true if there are uncommitted changes sitting in the working tree

## Key decisions

- Three-dot diff (`...`) is used for `getDiff` — this is what GitHub shows on a PR, diff from where the branch diverged
- Two-dot log (`..`) is used for `getCommits` — commits that exist here but not on target
- If target branch is not found locally, try with `origin/` prefix before failing
- `getCommits` returns an array of `{ hash, message }` objects, short hash only (7 chars)

## What it does NOT do

No UI, no config reading, no knowledge of staging/production branch names. It receives branch names as arguments — it does not decide which branches to compare.

## Build order

Step 4. No dependencies on other project modules.
