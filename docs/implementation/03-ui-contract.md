# 03 — UI Contract

Covers: `src/ui/types.ts`

---

## What it is

A TypeScript interface that defines everything a UI must be able to do. Workflows talk to this interface, never to a specific UI implementation. This is what makes swapping terminal for TUI possible without touching workflow code.

## Dependencies

Nothing. Pure TypeScript types only.

## What it defines

A single `UI` interface with these methods:

**Input**
- `confirm(message)` — ask a yes/no question, return boolean
- `select(message, choices)` — show a list, user picks one, return the value
- `multiselect(message, choices, preselected?)` — show a list, user picks many, return array of values
- `input(message)` — user types a free text string, return it

**Output**
- `display(text)` — print a line of text
- `startSpinner(message)` — show a loading spinner with a message
- `stopSpinner(success, message?)` — stop spinner, show tick or cross

## What it does NOT include

No chalk, no Ink, no inquirer. Pure interface definition only. Implementations live in `ui/terminal/` and eventually `ui/tui/`.

## Build order

Step 3. Must exist before any terminal UI or workflow is written, because both depend on this shape.
