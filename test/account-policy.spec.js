import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { accountPolicy } from '../lib/account-policy.js';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const policy = await readFile(path.join(root, 'references/account-policy.md'), 'utf8');
const hooks = JSON.parse(await readFile(path.join(root, 'hooks/hooks.json'), 'utf8')).hooks;

describe('lib/account-policy', () => {
  let directory;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'me-account-policy-'));
  });

  afterEach(async () => rm(directory, { recursive: true, force: true }));

  it('should emit the complete repo policy on startup transitions and helpers without private configuration', async () => {
    assert.equal(await accountPolicy(), policy);
    for (const [event, matcher] of [
      ...['startup', 'resume', 'clear', 'compact', 'fork'].map((source) => [
        'SessionStart',
        source,
      ]),
      ['SubagentStart', 'arbitrary-helper'],
    ]) {
      const handlers = hooks[event]
        .filter((group) => !group.matcher || new RegExp(group.matcher).test(matcher))
        .flatMap((group) => group.hooks);
      assert.equal(handlers.length, 1, `${event}:${matcher} must receive the policy once`);
      const env = { ...process.env, PLUGIN_ROOT: root };
      delete env.PLUGIN_DATA;
      const { stdout, stderr } = await run('/bin/sh', ['-c', handlers[0].command], {
        cwd: directory,
        env,
      });
      assert.equal(stderr, '');
      assert.equal(stdout, policy);
    }
  });

  it('should ignore obsolete private defaults rather than overriding or blocking the repo policy', async () => {
    for (const content of [
      JSON.stringify({ version: 1, defaults: { pirog: { github: 'unrelated-account' } } }),
      '{invalid-json',
    ]) {
      await writeFile(path.join(directory, 'account-defaults.json'), content);
      const { stdout, stderr } = await run(
        '/bin/sh',
        ['-c', hooks.SessionStart[0].hooks[0].command],
        {
          cwd: directory,
          env: { ...process.env, PLUGIN_ROOT: root, PLUGIN_DATA: directory },
        },
      );
      assert.equal(stderr, '');
      assert.equal(stdout, policy);
    }
  });
});
