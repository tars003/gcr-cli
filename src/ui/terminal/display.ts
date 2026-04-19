import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import type { DisplayStyle } from '../types.js';

let spinner: Ora | null = null;

export function display(text: string, style?: DisplayStyle): void {
  switch (style) {
    case 'success': console.log(chalk.green(`✓ ${text}`)); break;
    case 'warning': console.log(chalk.yellow(`⚠ ${text}`)); break;
    case 'error':   console.log(chalk.red(`✗ ${text}`)); break;
    case 'muted':   console.log(chalk.gray(text)); break;
    default:        console.log(text);
  }
}

export function startSpinner(message: string): void {
  spinner = ora(message).start();
}

export function stopSpinner(success: boolean, message?: string): void {
  if (!spinner) return;
  if (success) {
    spinner.succeed(message);
  } else {
    spinner.fail(message);
  }
  spinner = null;
}

export function stream(text: string): void {
  process.stdout.write(text);
}
