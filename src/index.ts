#!/usr/bin/env node
import { Command } from 'commander';
import { getCurrentBranch } from './adapters/git.js';
import { loadConfig } from './config.js';
import { prCreateFlow } from './workflows/pr-create.js';
import { releaseFlow } from './workflows/release.js';
import { terminalUI } from './ui/terminal/index.js';

const ui = terminalUI;

async function main(): Promise<void> {

  // ── Branch detection ───────────────────────────────────────────────────────
  let branch: string;
  try {
    branch = await getCurrentBranch();
  } catch {
    ui.display('Not in a git repository.', 'error');
    process.exit(1);
    return;
  }

  // ── Config ─────────────────────────────────────────────────────────────────
  let config: ReturnType<typeof loadConfig>;
  try {
    config = loadConfig();
  } catch (err: any) {
    ui.display(err.message, 'error');
    process.exit(1);
    return;
  }

  const { staging, production } = config.branches;

  // ── Guard: nothing to do on production ────────────────────────────────────
  if (branch === production) {
    ui.display(`You're on ${production}. Switch to a feature branch or ${staging} to use GCR.`, 'warning');
    process.exit(0);
    return;
  }

  // ── Context header ─────────────────────────────────────────────────────────
  ui.display(`Branch: ${branch}`, 'muted');
  ui.display('');

  // ── Menu — most relevant option first ─────────────────────────────────────
  const onStaging = branch === staging;

  const choices = onStaging
    ? [
        { label: 'Release', value: 'release' },
        { label: 'Create PR', value: 'pr' },
      ]
    : [
        { label: 'Create PR', value: 'pr' },
        { label: 'Release', value: 'release' },
      ];

  const action = await ui.select('What do you want to do?', choices);
  ui.display('');

  // ── Route ──────────────────────────────────────────────────────────────────
  if (action === 'pr') {
    await prCreateFlow(ui);
  } else {
    await releaseFlow(ui);
  }
}

// ── CLI entry ──────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('gcr')
  .description('Git ClickUp Release — link PRs, review code, compile releases')
  .version('0.1.0')
  .action(async () => {
    try {
      await main();
    } catch (err: any) {
      ui.display(err.message, 'error');
      process.exit(1);
    }
  });

program.parse();
