# Implementation Plan

Starting point. Each module gets its own spec doc when we're ready to build it.

---

## Modules

- [ ] **01 · Foundation** — `package.json`, `tsconfig.json`
- [ ] **02 · Config** — `src/config.ts`
- [ ] **03 · UI Contract** — `src/ui/types.ts`
- [ ] **04 · Adapter: Git** — `src/adapters/git.ts`
- [ ] **05 · Adapter: GitHub** — `src/adapters/github.ts`
- [ ] **06 · Adapter: ClickUp** — `src/adapters/clickup.ts`
- [ ] **07 · Adapter: Agent** — `src/adapters/agent.ts`
- [ ] **08 · Terminal UI** — `src/ui/terminal/`
- [ ] **09 · Workflow: PR Create** — `src/workflows/pr-create.ts`
- [ ] **10 · Workflow: Release** — `src/workflows/release.ts`
- [ ] **11 · Entry Point** — `src/index.ts`

---

## How this works

When we're ready to build a module:
1. We create `docs/implementation/XX-module-name.md` together
2. Ajay reads and approves it
3. We build it
4. Check the box
