import assert from 'node:assert/strict';
import path from 'node:path';

import codexConfigPaths from '../utils/codex-config-paths.js';

describe('utils/codex-config-paths', () => {
  it('should use the supplied home and ignore retired Stow controls', () => {
    assert.deepEqual(codexConfigPaths('/tmp/setup-home', { TANAAB_STOW_TARGET: '/tmp/other' }), {
      localPath: '/tmp/setup-home/.codex/config.local.toml',
      outputPath: '/tmp/setup-home/.codex/config.toml',
      sharedPath: '/tmp/setup-home/.codex/config.shared.toml',
    });
  });

  it('should retain explicit configuration paths and resolve blank values to defaults', () => {
    const paths = codexConfigPaths('/tmp/setup-home', {
      TANAAB_CODEX_CONFIG_LOCAL: ' ./custom-local.toml ',
      TANAAB_CODEX_CONFIG_OUTPUT: ' /tmp/output.toml ',
      TANAAB_CODEX_CONFIG_SHARED: '   ',
    });
    assert.equal(paths.localPath, path.resolve('custom-local.toml'));
    assert.equal(paths.outputPath, '/tmp/output.toml');
    assert.equal(paths.sharedPath, '/tmp/setup-home/.codex/config.shared.toml');
  });
});
