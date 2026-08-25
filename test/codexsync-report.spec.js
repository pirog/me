import assert from 'node:assert/strict';

import { printCodexSyncDiffDetails, printCodexSyncPaths } from '../lib/codexsync-report.js';

describe('lib/codexsync-report', () => {
  it('should render paths and nonempty diff groups in contract order', () => {
    const lines = [];
    const cli = { log: (line) => lines.push(line) };

    printCodexSyncPaths(cli, { cachePath: '/cache', repoRoot: '/repo' });
    printCodexSyncDiffDetails(cli, {
      changed: ['changed.js'],
      extra: ['extra.js'],
      missing: [],
    });

    assert.deepEqual(lines, [
      'repo: /repo',
      'cache: /cache',
      'changed:',
      '  changed.js',
      'extra:',
      '  extra.js',
    ]);
  });
});
