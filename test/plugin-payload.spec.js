import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { collectEntries } from '@tanaab/codex-tools';

import packageJson from '../package.json' with { type: 'json' };

const run = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, '..');
const configuration = [
  '.agent-system/agent.yaml',
  '.agent-system/setup-agent.yaml',
  '.agent-system/setup-host.yaml',
];
const accountPolicyFiles = [
  'hooks/hooks.json',
  'lib/account-policy.js',
  'references/account-policy.md',
  'scripts/account-policy-task.js',
];

describe('package.json plugin payload', () => {
  let temporary;
  let source;

  beforeEach(async () => {
    temporary = await mkdtemp(path.join(os.tmpdir(), 'me-plugin-payload-'));
    source = path.join(temporary, 'source');
    await mkdir(path.join(source, '.agent-system'), { recursive: true });
    await writeFile(path.join(source, 'package.json'), JSON.stringify(packageJson));
    await copyFile(path.join(repoRoot, '.gitignore'), path.join(source, '.gitignore'));
    for (const relative of ['.node-version', '.bun-version']) {
      await copyFile(path.join(repoRoot, relative), path.join(source, relative));
    }
    for (const relative of configuration) {
      await copyFile(path.join(repoRoot, relative), path.join(source, relative));
    }
    for (const relative of accountPolicyFiles) {
      await mkdir(path.dirname(path.join(source, relative)), { recursive: true });
      await copyFile(path.join(repoRoot, relative), path.join(source, relative));
    }
    for (const relative of [
      '.agent-system/backups/fixture/archive.json',
      '.agent-system/repositories/fixture.git/config',
      '.agent-system/worktrees/fixture/README.md',
      '.agent-system/local-only.yaml',
      '.private/account-defaults.json',
      'account-defaults.json',
    ]) {
      await mkdir(path.dirname(path.join(source, relative)), { recursive: true });
      await writeFile(path.join(source, relative), 'local runtime fixture');
    }
  });

  afterEach(async () => {
    await rm(temporary, { recursive: true, force: true });
  });

  it('should exclude runtime state from npm packages while retaining the shared configuration', async function () {
    this.timeout(10_000);
    const result = await run(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--cache', path.join(temporary, 'npm')],
      { cwd: source },
    );
    const payload = JSON.parse(result.stdout);
    const packages = Array.isArray(payload) ? payload : Object.values(payload);
    assert.equal(packages.length, 1);
    const [packed] = packages;
    assert.equal(packed.name, packageJson.name);
    const packedPaths = packed.files.map((file) => file.path);
    assert.ok(packedPaths.includes('.node-version'));
    assert.ok(packedPaths.includes('.bun-version'));
    assert.ok(!packedPaths.includes('.tool-versions'));
    assert.deepEqual(
      packedPaths.filter((file) => file.startsWith('.agent-system/')).sort(),
      configuration,
    );
    for (const file of accountPolicyFiles) assert.ok(packedPaths.includes(file));
    assert.ok(!packedPaths.some((file) => file.endsWith('account-defaults.json')));
    const unpacked = path.join(temporary, 'unpacked');
    await mkdir(unpacked);
    await run('tar', ['-xzf', path.join(source, packed.filename), '-C', unpacked]);
    const installed = path.join(unpacked, 'package');
    const hooks = JSON.parse(await readFile(path.join(installed, 'hooks/hooks.json'), 'utf8'));
    const { stdout } = await run('/bin/sh', ['-c', hooks.hooks.SessionStart[0].hooks[0].command], {
      cwd: temporary,
      env: { ...process.env, PLUGIN_ROOT: installed, PLUGIN_DATA: path.join(temporary, 'private') },
    });
    const policy = await readFile(path.join(installed, 'references/account-policy.md'), 'utf8');
    assert.ok(stdout.startsWith(policy));
    assert.match(stdout, /private account defaults are unavailable/);
  });

  it('should exclude runtime state from cache selection while retaining the shared configuration', async () => {
    const entries = await collectEntries(source, packageJson.codexTools);
    assert.deepEqual(
      [...entries.keys()].filter((file) => file.startsWith('.agent-system/')).sort(),
      configuration,
    );
    for (const file of accountPolicyFiles) assert.ok(entries.has(file));
    assert.ok(![...entries.keys()].some((file) => file.endsWith('account-defaults.json')));
  });
});
