import type { UI } from '../ui/types.js';
import { loadConfig, loadCredentials, loadProjectAwareness, loadPrompt } from '../config.js';
import { mergeBranches } from '../adapters/git.js';
import { createSession, prompt, closeSession } from '../adapters/agent.js';
import { getMergedPRs, getPRComments, getLastRelease, createRelease, type PullRequest } from '../adapters/github.js';
import { updateTaskWithReleaseTag } from '../adapters/clickup.js';

export async function releaseFlow(ui: UI): Promise<void> {

  // ── Config ─────────────────────────────────────────────────────────────────
  const config      = loadConfig();
  const creds       = loadCredentials();
  const awareness   = loadProjectAwareness();
  const staging     = config.branches.staging;
  const production  = config.branches.production;

  // ── Last release ───────────────────────────────────────────────────────────
  const lastRelease = getLastRelease();
  if (lastRelease) {
    ui.display(`Last release: ${lastRelease.tag} on ${lastRelease.date}`, 'muted');
  } else {
    ui.display('No previous release found — fetching all merged PRs.', 'muted');
  }

  // ── Fetch merged PRs ───────────────────────────────────────────────────────
  ui.startSpinner('Fetching merged PRs...');
  let prs: PullRequest[];
  try {
    prs = getMergedPRs(staging, lastRelease?.date);
    ui.stopSpinner(true, `${prs.length} PR(s) found`);
  } catch (err: any) {
    ui.stopSpinner(false, `Failed to fetch PRs: ${err.message}`);
    return;
  }

  if (prs.length === 0) {
    ui.display('No merged GCR-managed PRs found since last release.', 'warning');
    return;
  }

  ui.display('');

  // ── PR selection ───────────────────────────────────────────────────────────
  const selectedNumbers = await ui.multiselect(
    'Select PRs to include in this release:',
    prs.map(pr => ({ label: pr.title, value: String(pr.number) })),
    prs.map(pr => String(pr.number)), // all pre-selected
  );

  const selectedPRs = prs.filter(pr => selectedNumbers.includes(String(pr.number)));

  if (selectedPRs.length === 0) {
    ui.display('No PRs selected. Exiting.', 'warning');
    return;
  }

  // ── Extract task IDs and names from PR comments ────────────────────────────
  ui.startSpinner('Reading PR comments...');
  const prData: Array<{ pr: PullRequest; taskIds: string[]; taskNames: string[] }> = [];

  for (const pr of selectedPRs) {
    const comments  = getPRComments(pr.number);
    const taskIds   = extractTaskIds(comments);
    const taskNames = extractTaskNames(comments);
    prData.push({ pr, taskIds, taskNames });
  }

  const allTaskIds = [...new Set(prData.flatMap(d => d.taskIds))];
  ui.stopSpinner(true, `${allTaskIds.length} linked task(s) found`);
  ui.display('');

  // ── Compile release notes ──────────────────────────────────────────────────
  const session = await createSession(config.agent.model, config.agent.region);

  try {
    const prSummary = prData
      .map(d => {
        const tasks = d.taskNames.length > 0 ? d.taskNames.join(', ') : 'No linked tasks';
        return `PR: ${d.pr.title}\nTasks: ${tasks}`;
      })
      .join('\n\n');

    const notesPrompt = loadPrompt('compile-release-notes', { projectAwareness: awareness, prSummary });

    ui.display('── Release Notes ────────────────────────────', 'muted');
    const compiledNotes = await prompt(session, notesPrompt, text => ui.stream(text));
    ui.display('\n');

    const proceed = await ui.confirm('Release notes look good?');
    if (!proceed) {
      ui.display('Cancelled.', 'muted');
      return;
    }

    // ── Version suggestion ───────────────────────────────────────────────────
    const prTitles        = selectedPRs.map(pr => `- ${pr.title}`).join('\n');
    const lastTag         = lastRelease?.tag ?? 'v0.0.0';
    const versionPrompt   = loadPrompt('suggest-version', { lastTag, prTitles });

    ui.startSpinner('Suggesting version...');
    const suggestedVersion = (await prompt(session, versionPrompt, () => {})).trim();
    ui.stopSpinner(true, `Suggested: ${suggestedVersion}`);

    const inputVersion  = await ui.input(`Version tag (leave blank to use ${suggestedVersion}):`);
    const finalVersion  = inputVersion.trim() || suggestedVersion;

    ui.display('');

    const confirm = await ui.confirm(
      `Release ${finalVersion} — merge ${staging} → ${production} and create GitHub release?`
    );
    if (!confirm) {
      ui.display('Cancelled.', 'muted');
      return;
    }

    // ── Merge ────────────────────────────────────────────────────────────────
    ui.startSpinner(`Merging ${staging} → ${production}...`);
    try {
      await mergeBranches(staging, production);
      ui.stopSpinner(true, 'Merged');
    } catch (err: any) {
      ui.stopSpinner(false, `Merge failed: ${err.message}`);
      return;
    }

    // ── GitHub release ────────────────────────────────────────────────────────
    ui.startSpinner('Creating GitHub release...');
    let releaseUrl: string;
    try {
      releaseUrl = createRelease(finalVersion, finalVersion, compiledNotes, production);
      ui.stopSpinner(true, releaseUrl);
    } catch (err: any) {
      ui.stopSpinner(false, `Release creation failed: ${err.message}`);
      return;
    }

    // ── Tag ClickUp tasks ─────────────────────────────────────────────────────
    if (allTaskIds.length > 0) {
      ui.display('');
      ui.display(`Tagging ${allTaskIds.length} ClickUp task(s) with ${finalVersion}...`, 'muted');

      for (const taskId of allTaskIds) {
        try {
          await updateTaskWithReleaseTag(taskId, finalVersion, creds.clickup.apiKey);
          ui.display(`  ✓ ${taskId}`, 'muted');
        } catch {
          ui.display(`  ✗ ${taskId} — failed to update`, 'warning');
        }
      }
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    ui.display('');
    ui.display(`Released ${finalVersion}`, 'success');
    ui.display(releaseUrl, 'muted');
    ui.display(`${selectedPRs.length} PR(s) · ${allTaskIds.length} task(s) tagged`, 'muted');

  } finally {
    closeSession(session);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractTaskIds(comments: string[]): string[] {
  for (const comment of comments) {
    const match = comment.match(/<!-- gcr-tasks -->\n?([\s\S]*?)\n?<!-- \/gcr-tasks -->/);
    if (match) {
      try { return JSON.parse(match[1].trim()); } catch { return []; }
    }
  }
  return [];
}

function extractTaskNames(comments: string[]): string[] {
  for (const comment of comments) {
    if (!comment.includes('<!-- gcr-tasks -->')) continue;
    return comment
      .split('\n')
      .filter(line => line.startsWith('- ') && !line.includes('http'))
      .map(line => line.slice(2).trim());
  }
  return [];
}
