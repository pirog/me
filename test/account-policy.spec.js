import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { chmod, mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  accountDefaultsFailure,
  inspectAccountDefaults,
  saveAccountDefaults,
} from '../lib/account-defaults.js';
import { accountPolicy } from '../lib/account-policy.js';
import { validateAccountDefaults } from '../utils/validate-account-defaults.js';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const policy = await readFile(path.join(root, 'references/account-policy.md'), 'utf8');
const hooks = JSON.parse(await readFile(path.join(root, 'hooks/hooks.json'), 'utf8')).hooks;
const preferences = () => ({
  version: 2,
  profiles: {
    pirog: {
      github: { default: '123', accounts: [{ id: '123', login: 'human-fixture' }] },
      google: {
        default: '456',
        accounts: [
          { id: '456', email: 'primary@example.test' },
          { id: '789', email: 'alternate@example.test' },
        ],
      },
    },
    tanaabot: { github: { default: '321', accounts: [{ id: '321', login: 'bot-fixture' }] } },
  },
});
const context = (output) =>
  JSON.parse(
    output.split('<piroplugin-account-context>\n')[1].split('\n</piroplugin-account-context>')[0],
  );

describe('account defaults and policy', () => {
  let directory;
  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'me-account-policy-'));
  });
  afterEach(async () => rm(directory, { recursive: true, force: true }));

  it('should save through the packaged command protocol and retain state after rejected input', async () => {
    const save = (data) =>
      new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [
          path.join(root, 'scripts/account-binding-task.js'),
          'save',
          '--plugin-data',
          directory,
        ]);
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (chunk) => {
          stdout += chunk;
        });
        child.stderr.on('data', (chunk) => {
          stderr += chunk;
        });
        child.on('error', reject);
        child.on('close', (code) => resolve({ code, stdout, stderr }));
        child.stdin.end(JSON.stringify(data));
      });
    const result = await save(preferences());
    assert.equal(result.code, 0);
    assert.deepEqual(JSON.parse(result.stdout).data, preferences());
    const rejected = await save({ token: 'private-token-fixture' });
    assert.equal(rejected.code, 1);
    assert.ok(!`${rejected.stdout}${rejected.stderr}`.includes('private-token-fixture'));
    assert.deepEqual((await inspectAccountDefaults(directory)).data, preferences());
  });

  it('should preserve defaults and alternatives through private save and hook readback', async () => {
    assert.equal((await inspectAccountDefaults(directory)).status, 'missing');
    const data = preferences();
    assert.deepEqual(await saveAccountDefaults(directory, data), { status: 'configured', data });
    assert.equal((await stat(path.join(directory, 'account-defaults.json'))).mode & 0o777, 0o600);
    const output = await accountPolicy(directory);
    assert.ok(output.startsWith(policy));
    assert.deepEqual(context(output).data, data);
    assert.equal(context(output).runtime.pluginData, directory);
    data.profiles.pirog.google.default = '789';
    await saveAccountDefaults(directory, data);
    assert.deepEqual((await inspectAccountDefaults(directory)).data, data);
  });

  it('should isolate an invalid provider and retain both profiles usable selections', async () => {
    const data = preferences();
    data.profiles.pirog.google.default = '999';
    await writeFile(path.join(directory, 'account-defaults.json'), JSON.stringify(data), {
      mode: 0o600,
    });
    const result = await inspectAccountDefaults(directory);
    assert.equal(result.status, 'partial');
    assert.deepEqual(result.data.profiles.pirog.github, preferences().profiles.pirog.github);
    assert.deepEqual(result.data.profiles.tanaabot, preferences().profiles.tanaabot);
    assert.equal(result.data.profiles.pirog.google, undefined);
    assert.deepEqual(result.issues, [
      { profile: 'pirog', provider: 'google', code: 'invalid-selection' },
    ]);
    assert.deepEqual(context(await accountPolicy(directory)).data, result.data);
    await assert.rejects(saveAccountDefaults(directory, data), /account-defaults-invalid/);
    assert.deepEqual(await inspectAccountDefaults(directory), result);
  });

  it('should isolate a malformed profile without exposing rejected contents', async () => {
    const data = preferences();
    data.profiles.tanaabot = 'private-rejected-value';
    data.profiles['private-unknown-profile'] = {};
    await writeFile(path.join(directory, 'account-defaults.json'), JSON.stringify(data), {
      mode: 0o600,
    });
    const result = await inspectAccountDefaults(directory);
    assert.equal(result.status, 'partial');
    assert.deepEqual(result.data.profiles.pirog, preferences().profiles.pirog);
    assert.ok(!JSON.stringify(result).includes('private-'));
  });

  it('should distinguish an empty file from a usable single-provider configuration', async () => {
    const empty = await saveAccountDefaults(directory, { version: 2, profiles: {} });
    assert.equal(empty.status, 'unconfigured');
    const data = {
      version: 2,
      profiles: { pirog: { github: preferences().profiles.pirog.github } },
    };
    assert.deepEqual(await saveAccountDefaults(directory, data), { status: 'configured', data });
  });

  it('should preserve account ids and other selections when identifying text changes', async () => {
    const data = preferences();
    await saveAccountDefaults(directory, data);
    data.profiles.pirog.github.accounts[0].login = 'renamed-human-fixture';
    data.profiles.pirog.google.accounts[0].email = 'renamed@example.test';
    assert.deepEqual((await saveAccountDefaults(directory, data)).data, data);
  });

  it('should accept additional accounts within the bounded file size', async () => {
    const data = preferences();
    data.profiles.pirog.google.accounts = Array.from({ length: 9 }, (_, index) => ({
      id: String(456 + index),
      email: `account${index}@example.test`,
    }));
    assert.deepEqual((await saveAccountDefaults(directory, data)).data, data);
  });

  it('should keep diagnostics actionable without exposing operating system details', () => {
    for (const [code, expected] of [
      ['EACCES', 'permission-denied'],
      ['EPERM', 'permission-denied'],
      ['EROFS', 'read-only'],
      ['EIO', 'io-failed'],
    ]) {
      assert.equal(
        accountDefaultsFailure(Object.assign(new Error('private path'), { code })),
        `account-defaults-${expected}`,
      );
    }
  });

  it('should emit policy and unresolved state without inventing runtime paths', async () => {
    const output = await accountPolicy();
    assert.ok(output.startsWith(policy));
    assert.equal(context(output).runtime, null);
    assert.equal(context(output).status, 'invalid');
    assert.equal(context(output).code, 'account-defaults-path-unavailable');
    assert.equal(context(output).guidePath, path.join(root, 'references/account-binding.md'));
  });

  it('should deliver saved preferences on startup transitions and helper hooks', async () => {
    await saveAccountDefaults(directory, preferences());
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
      assert.equal(handlers.length, 1);
      const { stdout, stderr } = await run('/bin/sh', ['-c', handlers[0].command], {
        cwd: os.tmpdir(),
        env: { ...process.env, PLUGIN_ROOT: root, PLUGIN_DATA: directory },
      });
      assert.equal(stderr, '');
      assert.ok(stdout.startsWith(policy));
      assert.deepEqual(context(stdout).data, preferences());
      assert.ok(stdout.length < handlers[0].additionalContextLimit);
    }
  });

  it('should reject malformed, legacy, oversized or nonprivate files without echoing contents', async () => {
    for (const content of [
      '{invalid private-value',
      JSON.stringify({ version: 1, defaults: {} }),
      'x'.repeat(8193),
    ]) {
      await writeFile(path.join(directory, 'account-defaults.json'), content, { mode: 0o600 });
      const output = await accountPolicy(directory);
      assert.equal(context(output).status, 'invalid');
      assert.equal(context(output).data, undefined);
      assert.ok(!output.includes('private-value'));
    }
    await saveAccountDefaults(directory, preferences());
    await chmod(path.join(directory, 'account-defaults.json'), 0o644);
    assert.deepEqual(await inspectAccountDefaults(directory), {
      status: 'invalid',
      code: 'account-defaults-unsafe-permissions',
    });
  });

  it('should reject permissions, tokens, connection ids and defaults outside the known accounts', async () => {
    const cases = [
      { ...preferences(), token: 'secret' },
      { version: 2, profiles: { unknown: {} } },
      { version: 2, profiles: { pirog: { permissions: [] } } },
    ];
    for (const patch of [
      { default: '999' },
      { accounts: [{ id: 'link_temporary', login: 'fixture' }] },
      { accounts: [{ id: '123', login: 'fixture', token: 'secret' }] },
      {
        accounts: [
          { id: '123', login: 'fixture' },
          { id: '123', login: 'other' },
        ],
      },
    ]) {
      const data = preferences();
      Object.assign(data.profiles.pirog.github, patch);
      cases.push(data);
    }
    await saveAccountDefaults(directory, preferences());
    for (const data of cases) {
      assert.throws(() => validateAccountDefaults(data), /account-defaults-invalid/);
      await assert.rejects(saveAccountDefaults(directory, data));
      assert.deepEqual((await inspectAccountDefaults(directory)).data, preferences());
    }
  });

  it('should refuse symlinked files and package-local private state', async () => {
    const target = path.join(directory, 'original.json');
    await writeFile(target, 'preserve me', { mode: 0o600 });
    await symlink(target, path.join(directory, 'account-defaults.json'));
    assert.equal((await inspectAccountDefaults(directory)).status, 'invalid');
    await assert.rejects(
      saveAccountDefaults(directory, preferences()),
      /account-defaults-invalid-file/,
    );
    assert.equal(await readFile(target, 'utf8'), 'preserve me');
    await assert.rejects(
      saveAccountDefaults(root, preferences()),
      /account-defaults-path-in-plugin/,
    );
    await assert.rejects(
      saveAccountDefaults('relative', preferences()),
      /account-defaults-path-unavailable/,
    );
  });
});
