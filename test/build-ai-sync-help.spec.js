import assert from 'node:assert/strict';

import buildAiSyncHelp from '../utils/build-ai-sync-help.js';

const cli = {
  bold: (value) => value,
  dim: (value) => value,
};

describe('utils/build-ai-sync-help', () => {
  it('should expose the public options and namespaced environment variables', () => {
    const help = buildAiSyncHelp(cli, {
      codexConfigLocal: '/home/.codex/config.local.toml',
      codexConfigOutput: '/home/.codex/config.toml',
      codexConfigShared: '/home/.codex/config.shared.toml',
      codexConfigSync: true,
      dotfilesDir: '/repo/dotfiles',
      packageName: 'ai',
      prune: true,
      simulate: false,
      target: '/home',
    });

    assert.equal(help.usage, 'aisync [options]');
    assert.ok(help.options.some((option) => option.label === '--no-codex-config'));
    assert.ok(
      help.environmentVariables.some((entry) => entry.label === 'TANAAB_CODEX_CONFIG_OUTPUT'),
    );
  });
});
