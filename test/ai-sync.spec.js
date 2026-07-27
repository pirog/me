import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { lstat, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { buildAiSyncEnvironment, parseAiSyncArgs, pruneDanglingSymlinks } from '../lib/ai-sync.js';

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const AISYNC_PATH = path.join(REPO_ROOT, 'bin', 'aisync.js');
const BUN_EXECUTABLE = process.versions.bun ? process.execPath : 'bun';

describe('lib/ai-sync', () => {
  const tempRoots = [];

  afterEach(async () => {
    await Promise.all(
      tempRoots.splice(0).map((root) => rm(root, { force: true, recursive: true })),
    );
  });

  it('should resolve environment defaults from injectable host inputs', () => {
    const environment = buildAiSyncEnvironment({
      env: {
        TANAAB_CODEX_CONFIG_SYNC: 'false',
        TANAAB_STOW_PACKAGE: 'custom-ai',
        TANAAB_STOW_PRUNE: '0',
      },
      homedir: '/tmp/example-home',
      repoRoot: '/tmp/example-repo',
    });

    assert.equal(environment.target, '/tmp/example-home');
    assert.equal(environment.dotfilesDir, '/tmp/example-repo/dotfiles');
    assert.equal(environment.packageName, 'custom-ai');
    assert.equal(environment.prune, false);
    assert.equal(environment.codexConfigSync, false);
    assert.equal(environment.codexConfigOutput, '/tmp/example-home/.codex/config.toml');
  });

  it('should recompute implicit Codex paths when the target changes', () => {
    const parsed = parseAiSyncArgs(
      [
        '--target',
        '/tmp/alternate-home',
        '--codex-config-local',
        '/tmp/custom-local.toml',
        '--simulate',
        '--no-prune',
      ],
      buildAiSyncEnvironment({ env: {}, homedir: '/tmp/default-home', repoRoot: REPO_ROOT }),
    );

    assert.equal(parsed.target, '/tmp/alternate-home');
    assert.equal(parsed.codexConfigShared, '/tmp/alternate-home/.codex/config.shared.toml');
    assert.equal(parsed.codexConfigLocal, '/tmp/custom-local.toml');
    assert.equal(parsed.codexConfigOutput, '/tmp/alternate-home/.codex/config.toml');
    assert.equal(parsed.simulate, true);
    assert.equal(parsed.prune, false);
  });

  it('should prune only dangling links and newly empty descendant directories', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'ai-sync-prune-'));
    tempRoots.push(root);
    const target = path.join(root, 'target.txt');
    const validLink = path.join(root, 'valid-link');
    const emptyAfterPrune = path.join(root, 'empty-after-prune');
    const danglingLink = path.join(emptyAfterPrune, 'dangling-link');

    await writeFile(target, 'target\n', 'utf8');
    await symlink(target, validLink);
    await mkdir(emptyAfterPrune);
    await symlink(path.join(root, 'missing-target'), danglingLink);

    assert.deepEqual(await pruneDanglingSymlinks(root), { removedDirs: 1, removedLinks: 1 });
    assert.equal((await lstat(validLink)).isSymbolicLink(), true);
    await assert.rejects(lstat(danglingLink), { code: 'ENOENT' });
    await assert.rejects(lstat(emptyAfterPrune), { code: 'ENOENT' });
  });

  it('should expose help and version without running stow', async () => {
    const help = await execFileAsync(BUN_EXECUTABLE, [AISYNC_PATH, '--help'], { cwd: REPO_ROOT });
    const version = await execFileAsync(BUN_EXECUTABLE, [AISYNC_PATH, '--version'], {
      cwd: REPO_ROOT,
    });

    assert.match(help.stdout, /^Usage: aisync \[options\]/);
    assert.match(help.stdout, /--no-codex-config/);
    assert.equal(version.stdout.trim(), '1.0.0-beta.7');
  });
});
