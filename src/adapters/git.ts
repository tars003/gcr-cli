import { simpleGit } from 'simple-git';

const git = simpleGit(process.cwd());

export interface Commit {
  hash: string;
  message: string;
}

export async function getCurrentBranch(): Promise<string> {
  const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
  return branch.trim();
}

export async function getDiff(targetBranch: string): Promise<string> {
  try {
    return await git.diff([`${targetBranch}...HEAD`]);
  } catch {
    return git.diff([`origin/${targetBranch}...HEAD`]);
  }
}

export async function getCommits(targetBranch: string): Promise<Commit[]> {
  try {
    const log = await git.log([`${targetBranch}..HEAD`]);
    return log.all.map(c => ({ hash: c.hash.slice(0, 7), message: c.message }));
  } catch {
    const log = await git.log([`origin/${targetBranch}..HEAD`]);
    return log.all.map(c => ({ hash: c.hash.slice(0, 7), message: c.message }));
  }
}

export async function hasUncommittedChanges(): Promise<boolean> {
  const status = await git.status();
  return !status.isClean();
}

export async function mergeBranches(from: string, to: string): Promise<void> {
  await git.checkout(to);
  await git.merge([from]);
  await git.push('origin', to);
}
