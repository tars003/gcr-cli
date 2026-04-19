# 01 — Foundation

Covers: `package.json`, `tsconfig.json`

---

## What it is

The project skeleton. Defines all external libraries the project depends on and tells TypeScript how to compile.

## Dependencies

None. This is built first.

## What it sets up

**Runtime libraries**
- `@mariozechner/pi-ai` — Bedrock model registry
- `@mariozechner/pi-agent-core` — Agent runtime
- `@mariozechner/pi-coding-agent` — Agent session management
- `simple-git` — Git operations
- `axios` — HTTP client for ClickUp API
- `@inquirer/prompts` — Terminal prompts
- `chalk` — Terminal colours
- `ora` — Terminal spinners
- `commander` — CLI entry point

**Dev libraries**
- `typescript`
- `tsx` — runs TypeScript directly during development
- `@types/node`

**Scripts**
- `dev` — runs with tsx (development)
- `build` — compiles TypeScript to `dist/`
- `start` — runs compiled output

**TypeScript config**
- Target: ES2022
- Module: NodeNext (ESM)
- Strict: off
- Output: `dist/`

## Build order

Step 1. Nothing else can be installed or run until this exists.
