# 08 — Terminal UI

Covers: `src/ui/terminal/prompts.ts`, `src/ui/terminal/display.ts`, `src/ui/terminal/index.ts`

---

## What it is

The terminal implementation of the UI contract. Three files that together produce one object workflows can use to talk to the developer.

## Dependencies

- `@inquirer/prompts` — confirm, select, checkbox, input
- `chalk` — colours
- `ora` — spinners
- `src/ui/types.ts` — the interface this must implement

---

## prompts.ts

Wraps `@inquirer/prompts`. Implements the input side of the UI contract.

- `confirm(message)` → yes/no prompt
- `select(message, choices)` → single item selection from a list
- `multiselect(message, choices, preselected?)` → multiple item selection, with pre-checked items
- `input(message)` → free text input

No formatting, no colours here. Just input.

---

## display.ts

Wraps `chalk` and `ora`. Implements the output side of the UI contract.

- `display(text)` → prints a line. Supports variants: plain, success (green), warning (yellow), error (red), muted (grey)
- `startSpinner(message)` → starts a spinner
- `stopSpinner(success, message?)` → stops spinner with tick or cross

Also provides a `stream(text)` helper for printing AI response chunks as they arrive — no newline, just appends to current line.

---

## index.ts

Imports prompts and display, composes them into a single object that satisfies the `UI` interface from `src/ui/types.ts`. This is the only thing workflows import from this folder.

```
import { terminalUI } from './ui/terminal/index.js'
// then pass to workflow
await prCreateFlow(config, adapters, terminalUI)
```

## Build order

Step 5. Depends on `ui/types.ts`. Built after the contract is defined, before workflows.
