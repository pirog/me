import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
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
      await mkdir(target);
      await writeFile(path.join(target, 'MODEL_ROUTING.yaml'), 'retired policy');
      await writeFile(path.join(target, 'ACTORS.md'), 'retired actor registry');
      await writeFile(path.join(target, 'WORK_REPOS.md'), 'retired repository registry');
      await writeFile(path.join(target, 'AUTOMATIONS.yaml'), 'retired schedules');
      await mkdir(path.join(target, 'bin'));
      await writeFile(path.join(target, 'bin', 'aisync.js'), 'retired sync command');
      await mkdir(path.join(target, 'automations'));
      await writeFile(path.join(target, 'automations', 'daily-work-plan.md'), 'retired prompt');
      await mkdir(path.join(target, 'skills', 'automation'), { recursive: true });
      await writeFile(path.join(target, 'skills', 'automation', 'SKILL.md'), 'retired sync skill');
      for (const skill of ['find-work', 'plan-work', 'morning-closeout']) {
        await mkdir(path.join(target, 'skills', skill), { recursive: true });
        await writeFile(path.join(target, 'skills', skill, 'SKILL.md'), 'retired planning skill');
      }
      assert.equal((await invoke('codex:sync')).ok, true);
      assert.equal((await invoke('codex:check')).ok, true);
      for (const relative of packageJson.codexTools.managedPaths) {
        if (
          [
            'ACTORS.md',
            'WORK_REPOS.md',
            'MODEL_ROUTING.yaml',
            'AUTOMATIONS.yaml',
            'automations',
            'bin',
          ].includes(relative)
        )
          continue;
        await lstat(path.join(target, relative));
      }
      await assert.rejects(lstat(path.join(target, 'MODEL_ROUTING.yaml')), { code: 'ENOENT' });
      for (const retired of [
        'ACTORS.md',
        'WORK_REPOS.md',
        'AUTOMATIONS.yaml',
        'automations',
        'bin',
        'skills/automation',
        'skills/find-work',
        'skills/plan-work',
        'skills/morning-closeout',
      ]) {
        await assert.rejects(lstat(path.join(target, retired)), { code: 'ENOENT' });
      }
      assert.deepEqual(
        await readFile(path.join(target, 'agent.yaml')),
        await readFile(path.join(repoRoot, 'agent.yaml')),
      );
      await assert.rejects(lstat(path.join(target, 'TASKS.md')), { code: 'ENOENT' });
      await assert.rejects(lstat(path.join(target, 'node_modules')), { code: 'ENOENT' });
    } finally {
      await rm(temporary, { recursive: true });
    }
  });
});
