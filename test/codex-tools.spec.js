import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { lstat, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import packageJson from '../package.json' with { type: 'json' };

const run = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, '..');

describe('package.json Codex Tools integration', () => {
  it('should sync the declared Me payload through the shared CLI', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'me-cache-integration-'));
    try {
      const target = path.join(temporary, 'cache');
      const invoke = async (script, ...args) => {
        const result = await run(
          process.execPath,
          ['run', script, '--cache-path', target, '--missing-target', 'create', '--json', ...args],
          { cwd: repoRoot, env: { ...process.env, CODEX_HOME: path.join(temporary, 'home') } },
        );
        return JSON.parse(result.stdout);
      };

      assert.equal((await invoke('codex:sync', '--dry-run')).ok, true);
      await assert.rejects(lstat(target), { code: 'ENOENT' });
      assert.equal((await invoke('codex:sync')).ok, true);
      assert.equal((await invoke('codex:check')).ok, true);
      for (const relative of packageJson.codexTools.managedPaths) {
        await lstat(path.join(target, relative));
      }
      assert.deepEqual(
        await readFile(path.join(target, 'MODEL_ROUTING.yaml')),
        await readFile(path.join(repoRoot, 'MODEL_ROUTING.yaml')),
      );
      await assert.rejects(lstat(path.join(target, 'TASKS.md')), { code: 'ENOENT' });
      await assert.rejects(lstat(path.join(target, 'agent.yaml')), { code: 'ENOENT' });
      await assert.rejects(lstat(path.join(target, 'node_modules')), { code: 'ENOENT' });
    } finally {
      await rm(temporary, { recursive: true });
    }
  });
});
