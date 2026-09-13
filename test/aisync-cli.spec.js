import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import packageJson from '../package.json' with { type: 'json' };

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const AISYNC_PATH = path.join(REPO_ROOT, 'bin', 'aisync.js');
const BUN_EXECUTABLE = process.versions.bun ? process.execPath : 'bun';

describe('bin/aisync', () => {
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
