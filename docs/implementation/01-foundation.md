# 01 · Foundation

`package.json`, `tsconfig.json`

---

## What it does

Defines every external library the project needs and tells TypeScript how to compile. Run once — downloads everything.

## Runtime dependencies

| Package | Purpose |
|---|---|
| `@mariozechner/pi-ai` | Bedrock model via pi-mono |
| `@mariozechner/pi-agent-core` | Agent runtime via pi-mono |
| `@mariozechner/pi-coding-agent` | Agent session management via pi-mono |
| `simple-git` | Git operations |
| `axios` | HTTP client for ClickUp API |
| `@inquirer/prompts` | Terminal prompts |
| `chalk` | Terminal colours |
| `ora` | Terminal spinners |
| `commander` | CLI entry point |

## Dev dependencies

| Package | Purpose |
|---|---|
| `typescript` | Language |
| `tsx` | Run TypeScript directly in development |
| `@types/node` | Node type definitions |

## Scripts

| Script | What it does |
|---|---|
| `dev` | Runs `src/index.ts` directly via tsx |
| `build` | Compiles TypeScript to `dist/`, copies `src/prompts/` to `dist/prompts/` |
| `start` | Runs compiled output from `dist/` |

## TypeScript config

- Module system: NodeNext (ESM)
- Target: ES2022
- Strict: off
- Output: `dist/`
- Source: `src/`
