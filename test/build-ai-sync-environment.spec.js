import assert from 'node:assert/strict';

import buildAiSyncEnvironment from '../utils/build-ai-sync-environment.js';

describe('utils/build-ai-sync-environment', () => {
  it('should resolve defaults from injectable host inputs', () => {
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
});
