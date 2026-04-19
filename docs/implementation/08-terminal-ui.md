# 08 · Terminal UI

`src/ui/terminal/prompts.ts`, `src/ui/terminal/display.ts`, `src/ui/terminal/index.ts`

---

## What it does

Terminal implementation of the UI contract. Three files that together produce one object workflows use to talk to the developer.

## Dependencies

- `@inquirer/prompts` — confirm, select, checkbox, input
- `chalk` — colours and styles
- `ora` — spinner
- `src/ui/types.ts` — the interface this implements

---

## prompts.ts

Wraps `@inquirer/prompts`. Input side only.

- `confirm(message)` — yes/no
- `select(message, choices)` — pick one. Maps `Choice.label` → inquirer `name`
- `multiselect(message, choices, preselected?)` — pick many. Pre-checked via `preselected` values
- `input(message)` — free text

---

## display.ts

Wraps `chalk` and `ora`. Output side only.

- `display(text, style?)` — print a line with optional style
  - `default` — plain
  - `success` — green `✓`
  - `warning` — yellow `⚠`
  - `error` — red `✗`
  - `muted` — grey
- `startSpinner(message)` — starts a spinner, stored in module-level variable
- `stopSpinner(success, message?)` — stops with tick or cross
- `stream(text)` — `process.stdout.write(text)`, no newline — for AI streaming output

---

## index.ts

Imports prompts and display, composes into a single `UI` object that satisfies `src/ui/types.ts`. This is the only export workflows need.

```ts
import { terminalUI } from './ui/terminal/index.js'
```
