# What We Are Building

GCR is a CLI tool that sits between your code editor and GitHub/ClickUp.

---

## The Problem

When a developer finishes a feature, they have to:
- Manually open GitHub and create a PR with a description
- Manually find which ClickUp tickets they were working on and paste links
- Wait for a senior dev to review it by hand

When it's release day (Wednesday / Saturday):
- Manually collect what changed across multiple PRs
- Manually write release notes
- Manually message the client on WhatsApp
- No permanent, structured record of what shipped and why

---

## What GCR Does

### Part 1 — Developer creates a PR

Developer types `gcr` on their feature branch.

The tool:
1. Reads the code changes (git diff)
2. AI reviews the code using **project knowledge** (more on this below)
3. Fetches open ClickUp tasks and AI suggests which ones this code is solving — developer just confirms
4. Creates the PR on GitHub automatically
5. Posts the confirmed ClickUp task links as a comment on the PR
6. Posts the code review findings as a comment on the PR

### Part 2 — Release day

Ajay types `gcr release`.

The tool:
1. Finds all PRs merged since the last release
2. Collects the partial release notes already sitting in each PR's comments
3. AI compiles them into clean, client-friendly release notes
4. Asks Ajay to confirm a version number (e.g. `v1.4.0`)
5. Merges staging into production
6. Creates a **GitHub Release** with that version tag and the compiled release notes
7. Goes back to every ClickUp task linked across those PRs and adds the release tag (e.g. `v1.4.0`) to the task — so the ticket permanently knows which release it shipped in

---

## The Two Knowledge Files

GCR reads two markdown files that live in `.gcr/` inside your project repo.
These are written once and updated as the project evolves.

### `project-awareness.md`
Tells the AI what kind of project it's looking at.
- What the product does
- Tech stack
- What to look for during code review (e.g. unhandled promises, missing null checks)
- What to ignore (e.g. console.logs are fine, no tests required)
- Domain vocabulary (so "Flight" and "Campaign" mean something to the AI)

### `clickup-awareness.md`
Tells the AI how ClickUp is structured for this project.
- Which lists exist and what they're for
- How tasks are typically named
- Which lists to look in when matching tasks to a diff
- Who does what (so the AI understands task ownership)

Better these files are written → better the AI performs on every operation.

---

## The End Result

- Sagar gets structured release notes automatically
- Every PR is permanently linked to the ClickUp tickets that caused it
- Every ClickUp ticket is permanently tagged with the release it shipped in
- Full traceability: release tag → PR → diff → ticket → original requirement
- Ajay stops writing WhatsApp messages on Wednesday evenings
