# 09 · Workflow: PR Create

`src/workflows/pr-create.ts`

---

## What it does

The PR creation sequence. Orchestrates all adapters in order. Receives a `UI` object — no direct terminal calls.

## Dependencies

- `src/config.ts` — loadConfig, loadCredentials, loadProjectAwareness, loadClickUpAwareness
- `src/adapters/git.ts` — getCurrentBranch, getDiff, getCommits, hasUncommittedChanges
- `src/adapters/agent.ts` — createSession, prompt, closeSession
- `src/adapters/clickup.ts` — getTasksFromList
- `src/adapters/github.ts` — createPR, addComment
- `src/ui/types.ts` — UI interface
- `src/prompts/review-code.txt`
- `src/prompts/match-tasks.txt`

## Signature

```ts
export async function prCreateFlow(ui: UI): Promise<void>
```

## Sequence

1. Load config, credentials, awareness files
2. Get current branch. Determine target = `config.branches.staging`
3. Check for uncommitted changes — warn via `ui.display()` if any, do not block
4. Get diff and commits against target branch
5. If diff is empty — tell user, exit cleanly
6. Open agent session (`createSession`)
7. Load `review-code.txt`, fill `{{projectAwareness}}` and `{{diff}}`
8. `ui.startSpinner('Reviewing code...')`
9. Call `agent.prompt()` passing `ui.stream` as `onDelta` — response streams live to terminal
10. `ui.stopSpinner(true)`
11. Show review output. Ask `ui.confirm('Continue to create PR?')` — exit if no
12. Show list selector `ui.select()` — choices from `config.clickup.lists`
13. `ui.startSpinner('Fetching tasks...')`
14. Call `getTasksFromList`. If it fails — warn, ask `ui.confirm('Continue without task linking?')` — exit if no
15. `ui.stopSpinner(true)`
16. Load `match-tasks.txt`, fill `{{clickupAwareness}}` and `{{tasks}}` — diff is already in session context, not re-injected
17. `ui.startSpinner('Matching tasks...')`
18. Call `agent.prompt()` — collect full response (no streaming needed here)
19. Parse response as JSON array of task IDs. If parse fails — show all tasks unselected
20. `ui.stopSpinner(true)`
21. Show `ui.multiselect()` with AI suggestions pre-checked
22. `ui.input('PR title:')`
23. `ui.startSpinner('Creating PR...')`
24. Call `createPR`. If it fails — show error, exit (nothing to roll back yet)
25. `ui.stopSpinner(true, prUrl)`
26. If tasks selected — `addComment` with formatted task list + `<!-- gcr-tasks -->`  marker
27. If review found issues — `addComment` with review findings + `<!-- gcr-review -->` marker
28. `closeSession`
29. `ui.display` summary — PR URL, tasks linked count

## Prompt placeholders

**review-code.txt**: `{{projectAwareness}}`, `{{diff}}`

**match-tasks.txt**: `{{clickupAwareness}}`, `{{tasks}}`
Tasks passed as `[id] [status] task name` — one per line, compact.

## Comment markers

| Comment | Marker | Used by |
|---|---|---|
| ClickUp tasks | `<!-- gcr-tasks -->` | Release flow (extracts task IDs) |
| Code review | `<!-- gcr-review -->` | Informational only |

## What it does NOT do

No chalk, no inquirer. All output and input goes through `ui`.
