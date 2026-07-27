import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const CODEXSYNC_PATH = path.join(REPO_ROOT, 'bin', 'codexsync.js');
const BUN_EXECUTABLE = process.versions.bun ? process.execPath : 'bun';

describe('bin/codexsync', () => {
  it('should expose help and version without running a command', async () => {
    const help = await execFileAsync(BUN_EXECUTABLE, [CODEXSYNC_PATH, '--help'], {
      cwd: REPO_ROOT,
    });
    const version = await execFileAsync(BUN_EXECUTABLE, [CODEXSYNC_PATH, '--version'], {
      cwd: REPO_ROOT,
    });

    assert.match(help.stdout, /^Usage: codexsync <check\|validate\|sync> \[options\]/);
    assert.match(help.stdout, /Managed Paths/);
    assert.equal(version.stdout.trim(), '1.0.0-beta.7');
  });

  it('should reject an unknown command with a nonzero exit status', async () => {
    await assert.rejects(
      execFileAsync(BUN_EXECUTABLE, [CODEXSYNC_PATH, 'unknown'], { cwd: REPO_ROOT }),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /unknown command: unknown/);
        return true;
      },
    );
  });
});
