# Prompt: Generate project-awareness.md

Paste this into pi when you're inside your project directory.

---

```
I need you to generate a project-awareness.md file for my project.
This file will be used by an AI code reviewer — it tells the reviewer
what to look for, what to ignore, and how the codebase is structured.

Keep it lean and code-focused. No business logic, no product descriptions.
Think: what does a senior developer need to know to review a PR in this repo?

---

Step 1 — Explore the project. Read these in order:

1. Check if a docs/ directory exists. If it does, list what's in it and read
   anything that looks like architecture, conventions, or setup notes.
2. Read AGENTS.md if it exists at the root.
3. Read README.md if it exists.
4. Read package.json (or equivalent — pubspec.yaml, go.mod, etc.)
5. List the top two levels of the directory structure.
6. Read 2-3 representative source files from different parts of the codebase
   — pick files that look like they contain real application logic, not config.

Step 2 — Ask me these questions (and only these):

1. Are there things the team knowingly does that would look like bad practice
   to an outsider? (e.g. no tests, console.logs everywhere, commented-out code,
   loose TypeScript, etc.) — I want to tell the reviewer to ignore these.

2. What kinds of bugs or mistakes have actually bitten you in this codebase?
   What should the reviewer always watch out for?

3. Are there any files or areas where a mistake is especially costly?
   (e.g. billing, auth, migrations, payment processing)

4. Are there any terms in the code that have a specific meaning in this project
   that an outsider might misread? (e.g. "Flight", "Campaign", "Account")

Step 3 — Generate the file.

Using what you found in Step 1 and my answers from Step 2, write a
project-awareness.md with these sections:

## Tech Stack
List the main technologies. Be specific — framework, ORM, state management,
infra. One line per item. No descriptions needed.

## Repository Structure
A short annotated directory tree. Two levels deep. One line per folder
explaining what lives there. Skip boilerplate folders (node_modules, .git etc.)

## Coding Conventions
What does normal code look like here? Patterns the team follows.
Keep it to things that are actually visible in a diff.

## What to Flag in Code Review
Concrete things the reviewer should always catch. Based on my answers
about actual bugs and mistakes. Specific is better than generic.

## What to Ignore
Things that look wrong but are intentional in this project.
Based on my answers about team conventions.

## Sensitive Areas
Files or directories where extra scrutiny is warranted.
One line per area with a brief reason.

## Domain Vocabulary
A small table of terms that have project-specific meaning.
Only include terms that would cause misunderstanding if read literally.

---

Do Step 1 first, show me what you found, then ask the Step 2 questions.
Do not generate the file until I have answered.
```
