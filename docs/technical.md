# GCR — Technical Document

> Read `what-we-are-building.md` first if you haven't.
> This document covers technical decisions, architecture, and flows.

---

## Two Commands

```
gcr              → PR creation flow   (run on a feature branch)
gcr release      → Release flow       (run on staging branch)
```

Everything else — config, adapters, AI — exists to serve these two commands.

---

## Tech Stack

| Concern | Tool | Why |
|---|---|---|
| Language | TypeScript / Node.js | Ecosystem, tooling, team familiarity |
| AI provider | AWS Bedrock (Claude) | Already have access, cost control via AWS |
| AI layer | `@mariozechner/pi-ai` | Wraps Bedrock natively, unified API, part of pi-mono |
| Agent runtime | `@mariozechner/pi-agent-core` | Agent class, tool calling, event streaming |
| Agent sessions | `@mariozechner/pi-coding-agent` | createAgentSession, AuthStorage, ModelRegistry |
| GitHub operations | `gh` CLI | Already installed, handles auth, battle-tested |
| ClickUp operations | ClickUp REST API (axios) | Direct, simple |
| Git operations | simple-git | Clean wrapper around git commands |
| Terminal UI | Plain terminal (readline / inquirer) | TUI comes later, get the logic right first |
| CLI parsing | commander | Extensible for subcommands as we grow |

### Why pi-mono and not raw Bedrock SDK

The raw Bedrock SDK (`@aws-sdk/client-bedrock-runtime`) just makes API calls.
`@mariozechner/pi-ai` wraps that SDK and adds a unified streaming API, model registry, and provider abstraction. `@mariozechner/pi-agent-core` adds the agent loop — tool calling, event system, message history.

The real reason: **session chaining**. When the agent reviews code and then matches tasks, both operations run in the same agent session. The AI already has its review analysis in memory when it matches tasks. We don't re-inject the diff. The context carries forward naturally. A raw API call can't do this cleanly.

Secondary reason: this project exists partly to learn pi-mono. Using it is the point.

---

## Configuration

### Per-project config — `.gcr/config.json`
Lives in the project repo. Version controlled. Committed alongside the code.

Contains:
- Project name
- Branch names (staging, production)
- ClickUp list names + IDs
- AI model ID and AWS region

### Per-machine credentials — `~/.config/gcr/credentials.json`
Lives on the developer's machine. Never committed.

Contains:
- ClickUp API key

### AWS credentials
Bedrock uses the standard AWS credential chain — `~/.aws/credentials` or environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`). No custom handling needed.

### Awareness files — `.gcr/project-awareness.md` and `.gcr/clickup-awareness.md`
Live in the project repo. Version controlled. Written once, updated as the project evolves.
These are injected into AI prompts. Quality of these files directly determines quality of AI output.

---

## PR Creation Flow — Technical Steps

**Trigger:** Developer runs `gcr` on a feature/fix branch.

1. Read `.gcr/config.json` and `~/.config/gcr/credentials.json`
2. Detect current branch via `git rev-parse --abbrev-ref HEAD`
3. Get commits: `git log staging..HEAD`
4. Get diff: `git diff staging...HEAD` (three dots — diff from common ancestor)
5. Warn if there are uncommitted changes (only committed changes are reviewed)
6. Load `project-awareness.md`
7. **Open agent session** (in-memory, Bedrock model)
8. Stream code review to terminal — user reads it as it comes
9. User confirms to proceed
10. Load `clickup-awareness.md`
11. User selects which ClickUp list to pull from (configured lists presented as a menu)
12. Fetch tasks from ClickUp API (open tasks only — excludes closed/done)
13. **Same agent session** — task matching prompt. Session already holds review context.
14. User sees AI-suggested tasks pre-selected in a multiselect — adjusts if needed
15. User types PR title
16. `gh pr create` creates the PR, returns PR URL
17. Post **Comment #1** on PR: linked ClickUp task names + URLs
18. Post **Comment #2** on PR: code review findings (skipped if no issues found)

**Session design:** Steps 8 and 13 run in the same agent session. The AI's review reasoning is already in context when it does task matching. This is intentional.

**Commit boundary:** We stop reading commits at the latest merge commit on staging. This works because direct pushes to staging are not allowed — every merge happens via PR, which creates a merge commit. `git log staging..HEAD` handles this correctly even if the developer has merged staging into their branch mid-way.

---

## Release Flow — Technical Steps

**Trigger:** Ajay runs `gcr release` on the staging branch.

1. Read config and credentials
2. Fetch PRs merged into staging since the last GitHub release tag
3. Filter to PRs that have GCR comment markers (so non-GCR PRs are ignored)
4. Present PR list to Ajay — multiselect to confirm which to include
5. Extract partial release notes comment from each selected PR
6. **Open agent session** — compile partial notes into cohesive release notes
7. Ajay reviews compiled notes in terminal, can edit
8. Agent suggests semver version bump based on PR types — Ajay confirms or overrides
9. Merge staging → production via `gh`
10. Create GitHub Release with version tag + compiled notes
11. Collect all ClickUp task IDs from across selected PR comments
12. Update each ClickUp task — write release tag (e.g. `v1.4.0`) to the task

**GCR-managed PR identification:** When GCR creates a PR, it posts a comment with a hidden marker line at the top: `<!-- gcr-managed -->`. The release flow uses this to filter which PRs to consider.

**Partial release notes:** Posted as a PR comment (with marker `<!-- gcr-release-notes -->`) at the time the developer creates the PR. These are extracted by the release flow.

---

## What We Are NOT Building Yet

The following are explicitly out of scope for the first version.

| Feature | Why deferred |
|---|---|
| TUI (Ink/React terminal UI) | Get the logic right first, skin it later |
| `gcr init` setup wizard | Manual config setup is fine for now |
| PR Review flow (Ajay reviewing PRs via CLI) | Nice to have, not the core pain |
| Auto-updating ClickUp status (IN PROGRESS → IN QA) | Opt-in feature, add later |
| Posting GitHub PR link back to ClickUp at PR creation time | Needs ClickUp write API, phase 2 |
| Multi-repo project support | Single repo for now |
| Slack / WhatsApp integration | Manual for now |

---

## Directory Structure

```
gcr-cli/
│
├── src/
│   ├── index.ts                   ← entry point, opens menu, routes to workflows
│   ├── config.ts                  ← loads config.json, credentials, awareness files
│   │
│   ├── adapters/                  ← external world, no UI, no workflow logic
│   │   ├── agent.ts               ← pi-mono session wrapper (Bedrock via pi-ai)
│   │   ├── git.ts                 ← simple-git (diff, commits, branch detection)
│   │   ├── github.ts              ← gh CLI wrapper (PR create, comments, releases)
│   │   └── clickup.ts             ← ClickUp REST API (fetch tasks, update tasks)
│   │
│   ├── workflows/                 ← pure logic, no UI imports, receives ui interface
│   │   ├── pr-create.ts           ← PR creation flow
│   │   ├── pr-review.ts           ← PR review flow (future)
│   │   ├── release.ts             ← release flow
│   │   └── init.ts                ← init / setup flow (future)
│   │
│   ├── ui/
│   │   ├── types.ts               ← the UI interface (the contract workflows talk to)
│   │   ├── terminal/              ← what we build now
│   │   │   ├── index.ts           ← implements UI interface
│   │   │   ├── prompts.ts         ← confirm, select, multiselect, input
│   │   │   └── display.ts         ← spinners, chalk output, formatting
│   │   └── tui/                   ← future Ink components, empty for now
│   │       ├── components/
│   │       └── screens/
│   │
│   └── prompts/                   ← AI prompt templates
│       ├── review-code.txt
│       ├── match-tasks.txt
│       ├── compile-release-notes.txt
│       └── suggest-version.txt
│
├── .gcr/                          ← example config for testing gcr on itself
│   ├── config.json
│   ├── project-awareness.md
│   └── clickup-awareness.md
│
├── docs/
│   ├── what-we-are-building.md
│   ├── technical.md
│   ├── DEVELOPMENT.md
│   ├── implementation/            ← per-module spec files (written before coding)
│   ├── guide/                     ← user-facing docs (written as we build)
│   │   ├── getting-started.md
│   │   ├── config-reference.md
│   │   └── commands.md
│   ├── references/                ← awareness file templates for projects
│   │   ├── project-awareness.md
│   │   └── clickup-awareness.md
│   └── conversations/
│
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

---

## Open Questions

These are not blockers but need a decision before the relevant module is built.

1. **Partial release notes timing** — Posted when developer creates PR, or when Ajay merges it? Current lean: at PR creation time, so the developer who knows the context writes them.
2. **ClickUp task update field** — When writing the release tag back to a ClickUp task, which field do we use? A comment, a custom field, or a tag? Depends on what the ClickUp API allows without extra setup.
3. **Version suggestion logic** — Does the AI suggest the version, or does Ajay always type it manually? Current lean: AI suggests, Ajay confirms.
