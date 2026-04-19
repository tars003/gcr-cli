import type { UI } from '../ui/types.js';
import { loadConfig, loadCredentials, loadProjectAwareness, loadClickUpAwareness, loadPrompt } from '../config.js';
import { getCurrentBranch, getDiff, getCommits, hasUncommittedChanges } from '../adapters/git.js';
import { createSession, prompt, closeSession } from '../adapters/agent.js';
import { getTasksFromList, type ClickUpTask } from '../adapters/clickup.js';
import { createPR, addComment } from '../adapters/github.js';

export async function prCreateFlow(ui: UI): Promise<void> {

  // ── Config ─────────────────────────────────────────────────────────────────
  const config    = loadConfig();
  const creds     = loadCredentials();
  const awareness = loadProjectAwareness();
  const clickupAwareness = loadClickUpAwareness();
  const target    = config.branches.staging;

  // ── Branch & diff ──────────────────────────────────────────────────────────
  const branch = await getCurrentBranch();
  ui.display(`Branch: ${branch} → ${target}`, 'muted');

  if (await hasUncommittedChanges()) {
    ui.display('Uncommitted changes detected — only committed changes will be reviewed.', 'warning');
  }

  const diff    = await getDiff(target);
  const commits = await getCommits(target);

  if (!diff.trim()) {
    ui.display('No committed changes found against staging. Nothing to PR.', 'warning');
    return;
  }

  ui.display(`${commits.length} commit(s) · ${diff.length.toLocaleString()} chars\n`, 'muted');

  // ── Code review ────────────────────────────────────────────────────────────
  const session = await createSession(config.agent.model, config.agent.region);

  try {
    const reviewPrompt = loadPrompt('review-code', { projectAwareness: awareness, diff });

    ui.display('── Code Review ──────────────────────────────', 'muted');
    const reviewResult = await prompt(session, reviewPrompt, text => ui.stream(text));
    ui.display('\n');

    const hasIssues = reviewResult.trim() !== 'NO_ISSUES';
    if (!hasIssues) {
      ui.display('No issues found.', 'success');
    }

    ui.display('');
    const proceed = await ui.confirm('Continue to create PR?');
    if (!proceed) {
      ui.display('Cancelled.', 'muted');
      return;
    }

    // ── ClickUp tasks ──────────────────────────────────────────────────────
    const listChoice = await ui.select(
      'Pull tasks from which list?',
      config.clickup.lists.map(l => ({ label: l.name, value: l.id })),
    );

    let tasks: ClickUpTask[] = [];
    let taskFetchFailed = false;

    ui.startSpinner('Fetching tasks...');
    try {
      tasks = await getTasksFromList(listChoice, creds.clickup.apiKey);
      ui.stopSpinner(true, `${tasks.length} tasks fetched`);
    } catch (err: any) {
      ui.stopSpinner(false, `ClickUp fetch failed: ${err.message}`);
      taskFetchFailed = true;
      const skip = await ui.confirm('Continue without task linking?');
      if (!skip) return;
    }

    // ── Task matching ──────────────────────────────────────────────────────
    let suggestedIds: string[] = [];

    if (!taskFetchFailed && tasks.length > 0) {
      const taskLines = tasks.map(t => `[${t.id}] [${t.status}] ${t.name}`).join('\n');
      const matchPrompt = loadPrompt('match-tasks', {
        clickupAwareness,
        tasks: taskLines,
      });

      ui.startSpinner('Matching tasks...');
      const matchResult = await prompt(session, matchPrompt, () => {});
      ui.stopSpinner(true);

      try {
        suggestedIds = JSON.parse(matchResult.trim());
      } catch {
        ui.display('Could not parse task suggestions — showing all tasks unselected.', 'muted');
      }
    }

    // ── Task confirmation ──────────────────────────────────────────────────
    let selectedTasks: ClickUpTask[] = [];

    if (!taskFetchFailed && tasks.length > 0) {
      const selectedIds = await ui.multiselect(
        'Confirm linked tasks (AI pre-selected, adjust as needed):',
        tasks.map(t => ({ label: `[${t.status.toUpperCase()}] ${t.name}`, value: t.id })),
        suggestedIds,
      );
      selectedTasks = tasks.filter(t => selectedIds.includes(t.id));
    }

    // ── PR title ───────────────────────────────────────────────────────────
    const prTitle = await ui.input('PR title:');

    // ── Create PR ──────────────────────────────────────────────────────────
    ui.startSpinner('Creating PR...');
    let prUrl: string;
    try {
      prUrl = createPR(prTitle, '', target);
      ui.stopSpinner(true, prUrl);
    } catch (err: any) {
      ui.stopSpinner(false, `Failed to create PR: ${err.message}`);
      return;
    }

    // ── Comment #1: ClickUp tasks ──────────────────────────────────────────
    if (selectedTasks.length > 0) {
      ui.startSpinner('Linking ClickUp tasks...');
      try {
        addComment(prUrl, formatTasksComment(selectedTasks));
        ui.stopSpinner(true, 'Tasks linked');
      } catch (err: any) {
        ui.stopSpinner(false, `Task comment failed: ${err.message}`);
      }
    }

    // ── Comment #2: Code review ────────────────────────────────────────────
    if (hasIssues) {
      ui.startSpinner('Posting code review...');
      try {
        addComment(prUrl, formatReviewComment(reviewResult));
        ui.stopSpinner(true, 'Code review posted');
      } catch (err: any) {
        ui.stopSpinner(false, `Review comment failed: ${err.message}`);
      }
    }

    // ── Summary ────────────────────────────────────────────────────────────
    ui.display('');
    ui.display('PR created', 'success');
    ui.display(prUrl, 'muted');
    if (selectedTasks.length > 0) {
      ui.display(`${selectedTasks.length} task(s) linked`, 'muted');
    }

  } finally {
    closeSession(session);
  }
}

// ── Formatters ────────────────────────────────────────────────────────────────

function formatTasksComment(tasks: ClickUpTask[]): string {
  const lines = tasks.map(t => `- ${t.name}\n  ${t.url}`).join('\n');
  const ids   = JSON.stringify(tasks.map(t => t.id));
  return `## 🔗 Linked ClickUp Tasks\n\n${lines}\n\n<!-- gcr-tasks -->\n${ids}\n<!-- /gcr-tasks -->`;
}

function formatReviewComment(review: string): string {
  return `## 🤖 AI Code Review\n\n${review}\n\n<!-- gcr-review -->`;
}
