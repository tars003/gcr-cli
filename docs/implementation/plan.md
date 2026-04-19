# Implementation Plan

Starting point. Each module gets its own spec doc when we're ready to build it.

---

## Modules

- [x] **01 · Foundation** — `package.json`, `tsconfig.json`
- [x] **02 · Config** — `src/config.ts`
- [x] **03 · UI Contract** — `src/ui/types.ts`
- [x] **04 · Adapter: Git** — `src/adapters/git.ts`
- [x] **05 · Adapter: GitHub** — `src/adapters/github.ts`
- [x] **06 · Adapter: ClickUp** — `src/adapters/clickup.ts`
- [x] **07 · Adapter: Agent** — `src/adapters/agent.ts`
- [x] **08 · Terminal UI** — `src/ui/terminal/`
- [x] **09 · Workflow: PR Create** — `src/workflows/pr-create.ts`
- [x] **10 · Workflow: Release** — `src/workflows/release.ts`
- [x] **11 · Entry Point** — `src/index.ts`

---

## How this works

When we're ready to build a module:
1. We create `docs/implementation/XX-module-name.md` together
2. Ajay reads and approves it
3. We build it
4. Check the box
