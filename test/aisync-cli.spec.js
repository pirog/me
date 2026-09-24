import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import packageJson from '../package.json' with { type: 'json' };

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const AISYNC_PATH = path.join(REPO_ROOT, 'bin', 'aisync.js');
const BUN_EXECUTABLE = process.versions.bun ? process.execPath : 'bun';

describe('bin/aisync', () => {
  it('should reject unusable manifest defaults before attempting stow', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'me-aisync-profile-'));
    try {
      for (const entry of ['bin', 'lib', 'utils', 'package.json']) {
        await cp(path.join(REPO_ROOT, entry), path.join(root, entry), { recursive: true });
      }
      for (const profile of [
        { model: 'other/model', effort: 'high' },
        { model: 'openai/model', effort: 'ultra' },
      ]) {
        await writeFile(
          path.join(root, 'agent.yaml'),
          JSON.stringify({ 'schema-version': 1, models: { default: profile } }),
        );
        await assert.rejects(
          execFileAsync(BUN_EXECUTABLE, [path.join(root, 'bin', 'aisync.js')], {
            cwd: root,
            env: { ...process.env, PATH: '/nonexistent-aisync-test-bin' },
          }),
          (error) => {
            assert.match(error.stderr, /openai provider|effort must be/);
            assert.doesNotMatch(error.stdout, /syncing/);
            return true;
          },
        );
      }
    } finally {
      await rm(root, { recursive: true });
    }
  });

  it('should reject unknown options before attempting stow', async () => {
    await assert.rejects(
      execFileAsync(BUN_EXECUTABLE, [AISYNC_PATH, '--targte', '/tmp/unused-home'], {
        cwd: REPO_ROOT,
        env: { ...process.env, PATH: '/nonexistent-aisync-test-bin' },
      }),
      (error) => {
        assert.notEqual(error.code, 0);
        assert.match(error.stderr, /Unknown option: --targte/);
        assert.doesNotMatch(error.stdout, /syncing/);
        return true;
      },
    );
  });

  it('should expose help and version without running stow', async () => {
    const help = await execFileAsync(BUN_EXECUTABLE, [AISYNC_PATH, '--help'], { cwd: REPO_ROOT });
    const version = await execFileAsync(BUN_EXECUTABLE, [AISYNC_PATH, '--version'], {
      cwd: REPO_ROOT,
    });

    assert.match(help.stdout, /^Usage: aisync \[options\]/);
    assert.match(help.stdout, /--no-codex-config/);
    assert.equal(version.stdout.trim(), packageJson.version);
  });
});
