# 03 · UI Contract

`src/ui/types.ts`

---

## What it does

Defines the shape every UI must implement. Workflows talk to this interface only — never to chalk, inquirer, or Ink directly. Swapping terminal for TUI means writing a new implementation of this, nothing else changes.

## The interface

**Input methods**

| Method | What it does | Returns |
|---|---|---|
| `confirm(message)` | Yes / no question | `Promise<boolean>` |
| `select(message, choices)` | Pick one from a list | `Promise<string>` |
| `multiselect(message, choices, preselected?)` | Pick many from a list, with optional pre-checks | `Promise<string[]>` |
| `input(message)` | Free text entry | `Promise<string>` |

**Output methods**

| Method | What it does |
|---|---|
| `display(text, style?)` | Print a line — styles: `default`, `success`, `warning`, `error`, `muted` |
| `startSpinner(message)` | Show a loading spinner |
| `stopSpinner(success, message?)` | Stop spinner with tick or cross |
| `stream(text)` | Print a chunk of text with no newline — used for streaming AI output |

## What it does NOT include

No imports, no implementation, no chalk, no Ink. Pure TypeScript interface only.
