import assert from 'node:assert/strict';
import path from 'node:path';

import parseCodexSyncArgs from '../utils/parse-codexsync-args.js';

describe('utils/parse-codexsync-args', () => {
  it('should parse command, path forms, and extra positionals', () => {
    assert.deepEqual(
      parseCodexSyncArgs(
        ['check', '--repo-root=./repo', '--cache-path', './cache', 'extra'],
        '/default',
      ),
      {
        command: 'check',
        extraPositionals: ['extra'],
        options: {
          cachePath: path.resolve('./cache'),
          repoRoot: path.resolve('./repo'),
        },
      },
    );
  });

  it('should reject unknown options and missing path values', () => {
    assert.throws(() => parseCodexSyncArgs(['--unknown'], '/repo'), /Unknown option/);
    assert.throws(() => parseCodexSyncArgs(['--repo-root'], '/repo'), /Missing value/);
  });
});
