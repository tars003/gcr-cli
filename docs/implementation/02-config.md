# 02 — Config

Covers: `src/config.ts`

---

## What it is

The single place the app reads configuration from disk. Everything else asks this module for what it needs — nobody else reads files directly.

## Dependencies

Nothing from this project. Node `fs` only.

## What it reads

**`.gcr/config.json`** — lives in the project repo, version controlled
- Project name
- Branch names (staging, production)
- ClickUp list names and IDs
- AI model ID and AWS region

**`~/.config/gcr/credentials.json`** — lives on the machine, never committed
- ClickUp API key

**`.gcr/project-awareness.md`** — returns as a plain string
**`.gcr/clickup-awareness.md`** — returns as a plain string

## What it gives out

Four functions:
- `loadConfig()` — returns the parsed config object
- `loadCredentials()` — returns the parsed credentials object
- `loadProjectAwareness()` — returns the markdown file as a string
- `loadClickUpAwareness()` — returns the markdown file as a string

## Error behaviour

If any required file is missing, throw a clear human-readable error explaining what is missing and where it should be. No silent failures.

## Build order

Step 2. Built right after foundation. All adapters and workflows depend on this.
