import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const MANAGED_PATHS = [
  '.codex-plugin',
  '.mcp.json',
  'AGENTS.md',
  'assets',
  'bin',
  'lib',
  'package.json',
  'skills',
  'utils',
];

async function readJson(targetPath) {
  return JSON.parse(await readFile(targetPath, 'utf8'));
}

export async function resolveCodexSyncContext({ cachePathOverride = null, repoRoot }) {
  const packageJson = await readJson(path.join(repoRoot, 'package.json'));
  const pluginJson = await readJson(path.join(repoRoot, '.codex-plugin', 'plugin.json'));

  return {
    cachePath:
      cachePathOverride ??
      path.join(
        os.homedir(),
        '.codex',
        'plugins',
        'cache',
        'pirostore',
        pluginJson.name,
        packageJson.version,
      ),
    repoRoot,
  };
}
