import { confirm, select, checkbox, input } from '@inquirer/prompts';
import type { Choice } from '../types.js';

export async function askConfirm(message: string): Promise<boolean> {
  return confirm({ message });
}

export async function askSelect(message: string, choices: Choice[]): Promise<string> {
  return select({
    message,
    choices: choices.map(c => ({ name: c.label, value: c.value })),
  });
}

export async function askMultiselect(
  message: string,
  choices: Choice[],
  preselected?: string[],
): Promise<string[]> {
  return checkbox({
    message,
    choices: choices.map(c => ({
      name: c.label,
      value: c.value,
      checked: preselected?.includes(c.value) ?? false,
    })),
  });
}

export async function askInput(message: string): Promise<string> {
  return input({ message });
}
