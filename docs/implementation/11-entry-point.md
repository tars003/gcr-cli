# 11 · Entry Point

`src/index.ts`

---

## What it does

The front door. Reads the current branch, shows a context-aware menu, routes to the right workflow with the terminal UI attached.

## Dependencies

- `src/adapters/git.ts` — getCurrentBranch
- `src/workflows/pr-create.ts` — prCreateFlow
- `src/workflows/release.ts` — releaseFlow
- `src/ui/terminal/index.ts` — terminalUI
- `commander` — CLI entry point, version flag, help flag

## Signature

Single `gcr` command. No subcommands.

## Sequence

1. `getCurrentBranch()`
2. Determine context:
   - Feature/fix/hotfix branch → highlight "Create PR"
   - Staging branch → highlight "Release"
   - Any branch → show all options
3. `ui.select` — show menu, default selection based on context
4. Route to selected workflow, passing `terminalUI`
5. Catch any unhandled error — `ui.display(err.message, 'error')` and exit with code 1

## Menu options

| Option | Value | Available on |
|---|---|---|
| Create PR | `pr` | any non-staging, non-production branch |
| Release | `release` | staging branch |

If on production branch — show a warning and exit. Nothing to do there.

## Key decisions

- Shebang at top of file (`#!/usr/bin/env node`) so the compiled binary is executable
- `commander` handles `--version` and `--help` automatically
- Branch detection failure (not in a git repo) — catch and show clear error
- Context is a hint, not a lock — all options always shown, most relevant one is default
