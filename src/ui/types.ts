// The UI contract. Workflows talk to this interface only.
// Terminal and TUI both implement this — workflows never import chalk, inquirer, or Ink directly.

export type DisplayStyle = 'default' | 'success' | 'warning' | 'error' | 'muted';

export interface Choice {
  label: string;
  value: string;
}

export interface UI {
  // ── Input ──────────────────────────────────────────────────────────────────
  confirm(message: string): Promise<boolean>;
  select(message: string, choices: Choice[]): Promise<string>;
  multiselect(message: string, choices: Choice[], preselected?: string[]): Promise<string[]>;
  input(message: string): Promise<string>;

  // ── Output ─────────────────────────────────────────────────────────────────
  display(text: string, style?: DisplayStyle): void;
  startSpinner(message: string): void;
  stopSpinner(success: boolean, message?: string): void;
  stream(text: string): void; // print chunk with no newline — for streaming AI output
}
