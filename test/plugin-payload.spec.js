import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
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

describe('package.json plugin payload', () => {
  let temporary;
  let source;

  beforeEach(async () => {
    temporary = await mkdtemp(path.join(os.tmpdir(), 'me-plugin-payload-'));
    source = path.join(temporary, 'source');
    await mkdir(path.join(source, '.agent-system'), { recursive: true });
    await writeFile(path.join(source, 'package.json'), JSON.stringify(packageJson));
    await copyFile(path.join(repoRoot, '.gitignore'), path.join(source, '.gitignore'));
    for (const relative of configuration) {
      await copyFile(path.join(repoRoot, relative), path.join(source, relative));
    }
    for (const relative of [
      '.agent-system/backups/fixture/archive.json',
      '.agent-system/repositories/fixture.git/config',
      '.agent-system/worktrees/fixture/README.md',
      '.agent-system/local-only.yaml',
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
      ['pack', '--dry-run', '--ignore-scripts', '--json', '--cache', path.join(temporary, 'npm')],
      { cwd: source },
    );
    const payload = JSON.parse(result.stdout);
    const packages = Array.isArray(payload) ? payload : Object.values(payload);
    assert.equal(packages.length, 1);
    const [packed] = packages;
    assert.equal(packed.name, packageJson.name);
    assert.deepEqual(
      packed.files
        .map((file) => file.path)
        .filter((file) => file.startsWith('.agent-system/'))
        .sort(),
      configuration,
    );
  });

  it('should exclude runtime state from cache selection while retaining the shared configuration', async () => {
    const entries = await collectEntries(source, packageJson.codexTools);
    assert.deepEqual(
      [...entries.keys()].filter((file) => file.startsWith('.agent-system/')).sort(),
      configuration,
    );
  });
});
