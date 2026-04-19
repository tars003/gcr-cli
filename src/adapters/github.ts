import { execFileSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

export interface PullRequest {
  number: number;
  title: string;
  url: string;
  mergedAt: string;
  body: string;
}

const GCR_MARKER = '<!-- gcr-managed -->';

// ── Helpers ───────────────────────────────────────────────────────────────────

function writeTempFile(content: string): string {
  const file = join(tmpdir(), `gcr-${randomBytes(6).toString('hex')}.md`);
  writeFileSync(file, content, 'utf-8');
  return file;
}

function cleanUp(file: string): void {
  try { unlinkSync(file); } catch { /* ignore */ }
}

function gh(...args: string[]): string {
  try {
    return execFileSync('gh', args, { encoding: 'utf-8' }).trim();
  } catch (err: any) {
    const msg: string = err.stderr || err.message || String(err);
    if (msg.includes('not found') || msg.includes('not logged') || msg.includes('not installed')) {
      throw new Error('gh CLI not installed or not authenticated. Run: gh auth login');
    }
    throw new Error(msg);
  }
}

// ── Exports ───────────────────────────────────────────────────────────────────

export function createPR(title: string, body: string, baseBranch: string): string {
  const fullBody = `${GCR_MARKER}\n\n${body}`.trim();
  const bodyFile = writeTempFile(fullBody);
  try {
    return gh('pr', 'create', '--title', title, '--body-file', bodyFile, '--base', baseBranch);
  } finally {
    cleanUp(bodyFile);
  }
}

export function addComment(prUrl: string, body: string): void {
  const bodyFile = writeTempFile(body);
  try {
    gh('pr', 'comment', prUrl, '--body-file', bodyFile);
  } finally {
    cleanUp(bodyFile);
  }
}

export function getMergedPRs(baseBranch: string, sinceDate?: string): PullRequest[] {
  const args = [
    'pr', 'list',
    '--base', baseBranch,
    '--state', 'merged',
    '--json', 'number,title,url,mergedAt,body',
    '--limit', '50',
  ];
  if (sinceDate) {
    args.push('--search', `merged:>=${sinceDate}`);
  }
  const raw = gh(...args);
  const prs: PullRequest[] = JSON.parse(raw);
  return prs.filter(pr => pr.body?.includes(GCR_MARKER));
}

export function getPRComments(prNumber: number): string[] {
  const raw = gh('pr', 'view', String(prNumber), '--json', 'comments');
  const data = JSON.parse(raw);
  return (data.comments ?? []).map((c: any) => c.body as string);
}

export interface LastRelease {
  tag: string;
  date: string; // YYYY-MM-DD
}

export function getLastRelease(): LastRelease | null {
  try {
    const raw = gh('release', 'list', '--limit', '1', '--json', 'tagName,publishedAt');
    const releases = JSON.parse(raw);
    if (releases.length === 0) return null;
    return {
      tag:  releases[0].tagName as string,
      date: (releases[0].publishedAt as string).slice(0, 10),
    };
  } catch {
    return null;
  }
}

export function createRelease(tag: string, name: string, body: string, targetBranch: string): string {
  const bodyFile = writeTempFile(body);
  try {
    return gh('release', 'create', tag, '--title', name, '--notes-file', bodyFile, '--target', targetBranch);
  } finally {
    cleanUp(bodyFile);
  }
}
