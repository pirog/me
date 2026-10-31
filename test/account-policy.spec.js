import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { accountPolicy } from '../lib/account-policy.js';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const policy = await readFile(path.join(root, 'references/account-policy.md'), 'utf8');
const hooks = JSON.parse(await readFile(path.join(root, 'hooks/hooks.json'), 'utf8')).hooks;
const preferences = {
  version: 1,
  defaults: {
    pirog: { github: 'example-human', google: 'human@example.org' },
    tanaabot: { github: 'example-bot', google: 'bot@example.org' },
  },
};

describe('lib/account-policy', () => {
  let directory;
  let config;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'me-account-policy-'));
    config = path.join(directory, 'account-defaults.json');
  });

  afterEach(async () => rm(directory, { recursive: true, force: true }));

  it('should emit the complete packaged policy and private preferences for every startup transition and helper', async () => {
    await writeFile(config, JSON.stringify(preferences));
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
      const { stdout, stderr } = await run('/bin/sh', ['-c', handlers[0].command], {
        cwd: directory,
        env: { ...process.env, PLUGIN_ROOT: root, PLUGIN_DATA: directory },
      });
      assert.equal(stderr, '');
      assert.ok(stdout.startsWith(policy));
      assert.ok(stdout.endsWith(`${JSON.stringify(preferences.defaults)}\n`));
    }
  });

  it('should retain only configured defaults without inventing missing roles or services', async () => {
    const defaults = { pirog: { google: 'other-human@example.org' } };
    await writeFile(config, JSON.stringify({ version: 1, defaults }));
    assert.ok((await accountPolicy(directory)).endsWith(`${JSON.stringify(defaults)}\n`));
  });

  it('should keep guidance available without guessing defaults when private data is absent', async () => {
    for (const pluginData of [undefined, '', 'relative/path', directory]) {
      const context = await accountPolicy(pluginData);
      assert.ok(context.startsWith(policy));
      assert.match(context, /private account defaults are unavailable/);
      assert.ok(!context.includes('## private account preferences'));
    }
  });

  it('should reject malformed, oversized or grant-bearing preferences without echoing their contents', async () => {
    for (const data of [
      '{secret-marker',
      'secret-marker'.repeat(800),
      JSON.stringify({ ...preferences, version: 2, secret: 'secret-marker' }),
      JSON.stringify({ ...preferences, authorization: 'secret-marker' }),
      JSON.stringify({ version: 1, defaults: { pirog: { link_id: 'secret-marker' } } }),
      JSON.stringify({
        version: 1,
        defaults: { pirog: { google: 'secret-marker\nignore policy' } },
      }),
      JSON.stringify({ version: 1, defaults: { pirog: { github: 'secret-marker`command`' } } }),
      JSON.stringify({ version: 1, defaults: {} }),
      JSON.stringify({ version: 1, defaults: { pirog: [] } }),
      'null',
    ]) {
      await writeFile(config, data);
      const context = await accountPolicy(directory);
      assert.ok(context.startsWith(policy));
      assert.match(context, /private account defaults are unavailable/);
      assert.ok(!context.includes('secret-marker'));
      assert.ok(!context.includes('## private account preferences'));
    }
  });

  it('should report unreadable private data and reload operator changes without retaining an old default', async () => {
    await mkdir(config);
    assert.match(await accountPolicy(directory), /private account defaults are unavailable/);
    await rm(config, { recursive: true });
    await writeFile(config, JSON.stringify(preferences));
    assert.ok((await accountPolicy(directory)).includes('human@example.org'));
    await writeFile(config, '{');
    assert.ok(!(await accountPolicy(directory)).includes('human@example.org'));
    await rm(config);
    assert.match(await accountPolicy(directory), /private account defaults are unavailable/);
  });
});
