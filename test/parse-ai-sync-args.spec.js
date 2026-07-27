import assert from 'node:assert/strict';
import path from 'node:path';

import buildAiSyncEnvironment from '../utils/build-ai-sync-environment.js';
import parseAiSyncArgs from '../utils/parse-ai-sync-args.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

describe('utils/parse-ai-sync-args', () => {
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

  it('should reject positional arguments and missing values', () => {
    assert.throws(() => parseAiSyncArgs(['target']), /Positional arguments/);
    assert.throws(() => parseAiSyncArgs(['--target']), /Missing value/);
  });
});
