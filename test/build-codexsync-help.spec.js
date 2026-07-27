import assert from 'node:assert/strict';

import buildCodexSyncHelp from '../utils/build-codexsync-help.js';

const cli = {
  bold: (value) => value,
  dim: (value) => value,
};

describe('utils/build-codexsync-help', () => {
  it('should expose commands, path defaults, and every managed path', () => {
    const help = buildCodexSyncHelp(cli, { cachePath: '/cache', repoRoot: '/repo' }, [
      '.codex-plugin',
      'skills',
    ]);

    assert.equal(help.usage, 'codexsync <check|validate|sync> [options]');
    assert.match(help.options[0].description, /\/repo/);
    assert.deepEqual(help.sections[1].lines, ['  .codex-plugin', '  skills']);
  });
});
