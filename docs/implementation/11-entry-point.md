# 11 — Entry Point

Covers: `src/index.ts`

---

## What it is

The front door. Reads context, shows a menu, routes to the right workflow with the terminal UI attached.

## Dependencies

- `src/config.ts`
- `src/adapters/git.ts` — to detect current branch
- `src/workflows/pr-create.ts`
- `src/workflows/release.ts`
- `src/ui/terminal/index.ts` — the terminal UI implementation
- `commander` — CLI entry point

## What it does

1. Reads the current branch
2. Builds a menu of available actions based on context:
   - On a feature/fix branch → "Create PR" is shown first
   - On staging branch → "Release" is shown first
   - Always shows all valid options
3. Developer navigates and selects
4. Instantiates the terminal UI object
5. Calls the selected workflow, passing in the terminal UI

## Menu options (current)

- **Create PR** — runs `pr-create` workflow (available on feature/fix branches)
- **Release** — runs `release` workflow (available on staging branch)

## Menu options (future, not built yet)

- Review PRs
- Settings / Init

## Key decisions

- Context-awareness is soft — it highlights the most relevant option but does not block other options. A developer on staging can still choose "Create PR" if needed.
- `commander` is used so `gcr --version` and `gcr --help` work out of the box.
- The entry point does not contain any business logic. It only reads context, shows menu, and delegates.

## Build order

Step 7. Last thing built. Everything else must exist first.
