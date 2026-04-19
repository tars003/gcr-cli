# ClickUp Awareness — GCR Context Doc

> This file lives at `.gcr/clickup-awareness.md` in the repo root.
> GCR reads this to understand the ClickUp structure for this project before fetching tasks or matching them to a diff.
> Fill this out once per project during `gcr init`. Update it when your sprint structure changes.

---

## Workspace & Project

<!-- Top-level identifiers. Get these from your ClickUp URL or API. -->

- **Workspace name**: Acme Media
- **Workspace ID**: `1234567`
- **Space name**: Acme App Development
- **Space ID**: `7654321`

---

## Lists in use

<!-- Map human-readable names to ClickUp list IDs. GCR uses these IDs to fetch tasks.
     Add or remove rows as your project evolves. -->

| List name | List ID | Purpose |
|---|---|---|
| Backlog | `90123456` | All planned work not yet in a sprint |
| Bugs | `90123457` | Bug reports from QA and client |
| Sprint 1 | `90123458` | Current active sprint |
| Sprint 2 | `90123459` | Next sprint (being planned) |

> **Rule of thumb**: We do not create subtasks. All work is flat tasks within a list.
> The ClickUp API integration does not reliably fetch subtasks, so avoid them.

---

## Task status flow

<!-- What are the statuses tasks move through? List them in order. -->

```
TO DO → IN PROGRESS → IN QA → DONE
```

- **TO DO**: Ticket exists, not picked up yet
- **IN PROGRESS**: Developer is actively working on it
- **IN QA**: Code is in a PR or deployed to staging, QA (Swapnil) is verifying
- **DONE**: QA signed off, ticket closed

> GCR can optionally auto-move tasks from IN PROGRESS → IN QA when a PR is created.
> This is controlled by `autoUpdateStatus` in `.gcr/config.json`.

---

## Who creates and assigns tickets

<!-- Helps AI understand task ownership when matching tasks to a diff. -->

| Role | Person | What they do in ClickUp |
|---|---|---|
| Client | Sagar | Creates requests and feature asks |
| Product manager | Kushal | Refines tickets, adds acceptance criteria |
| Tech lead | Ajay | Moves tickets from planning → to do, assigns to devs |
| Developer | Darshan | Picks up tickets, moves to in progress |
| QA | Swapnil | Verifies in QA status, moves to done |

---

## Task naming conventions

<!-- How are tasks named in this project? Helps AI match a diff to the right task. -->

- Task names are written in plain English, not ticket codes
- Format is usually: `[Verb] [feature/area] — [brief detail]`
- Examples:
  - `Add music library to video ad player`
  - `Fix audio playback crash on Android`
  - `Update campaign budget validation rules`
- We do not use ticket number prefixes (no `CU-123` style names)

---

## How to find the right task for a PR

<!-- Guidance for the AI when doing task matching. -->

When GCR asks the AI to match a git diff to ClickUp tasks, it should:

1. Prioritise tasks in **IN PROGRESS** status — these are most likely what the dev was working on
2. Also consider **TO DO** tasks — the developer may have just picked it up
3. Ignore **DONE** tasks — these are already shipped
4. If no task matches the diff well, tell the developer explicitly rather than guessing
5. It is better to suggest one extra unrelated task than to miss the actual one — the developer will deselect it
6. Match on intent, not exact wording — a diff adding a music library API maps to "Add music library to video ad player" even if the words differ

---

## What to include in the PR task comment

<!-- When GCR posts linked tasks as a PR comment, format them like this. -->

```markdown
## Linked ClickUp Tasks

- Add music library to video ad player
  https://app.clickup.com/t/90123456/TASK_ID
- Fix audio playback crash on Android
  https://app.clickup.com/t/90123457/TASK_ID
```

---

## Lists to present to the developer during PR creation

<!-- Which lists should GCR show in the selection menu when a dev fires up GCR?
     Usually the active sprint + bugs. Backlog is rarely relevant at PR time. -->

Show these lists (in this order):
1. Sprint 1 (current)
2. Bugs
3. Backlog (as fallback)

---

## Notes on sprint structure

<!-- Any quirks specific to how this project uses ClickUp. -->

- We do not strictly follow sprint planning — most work lives in Backlog or Bugs
- Sprint lists exist but are sometimes not used if planning is informal that week
- If in doubt, fetch from Backlog + Bugs — that covers 80% of actual work
- We do not use ClickUp dependencies, watchers, or custom fields currently
