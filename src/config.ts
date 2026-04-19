import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GCRConfig {
  projectName: string;
  branches: {
    staging: string;
    production: string;
  };
  clickup: {
    lists: Array<{ name: string; id: string }>;
  };
  agent: {
    model: string;
    region: string;
  };
}

export interface Credentials {
  clickup: {
    apiKey: string;
  };
}

// ── Loaders ───────────────────────────────────────────────────────────────────

export function loadConfig(): GCRConfig {
  const path = join(process.cwd(), '.gcr', 'config.json');
  if (!existsSync(path)) {
    throw new Error(
      'Missing .gcr/config.json\n' +
      'Create a .gcr/ directory in your project root.\n' +
      'See docs/references/project-awareness.md for a template.'
    );
  }
  return JSON.parse(readFileSync(path, 'utf-8')) as GCRConfig;
}

export function loadCredentials(): Credentials {
  const path = join(homedir(), '.config', 'gcr', 'credentials.json');
  if (!existsSync(path)) {
    throw new Error(
      'Missing ~/.config/gcr/credentials.json\n' +
      'Create it with:\n' +
      '  mkdir -p ~/.config/gcr\n' +
      '  echo \'{ "clickup": { "apiKey": "YOUR_KEY" } }\' > ~/.config/gcr/credentials.json'
    );
  }
  return JSON.parse(readFileSync(path, 'utf-8')) as Credentials;
}

export function loadProjectAwareness(): string {
  const path = join(process.cwd(), '.gcr', 'project-awareness.md');
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf-8');
}

export function loadClickUpAwareness(): string {
  const path = join(process.cwd(), '.gcr', 'clickup-awareness.md');
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf-8');
}
