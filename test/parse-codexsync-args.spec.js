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

  for (const option of ['--repo-root', '--cache-path']) {
    it(`should reject a missing ${option} value without swallowing the next flag`, () => {
      for (const next of [
        '--unknown',
        '--repo-root=/tmp/profile',
        '--cache-path=/tmp/cache',
        '-x',
      ]) {
        assert.throws(() => parseCodexSyncArgs(['sync', option, next], '/repo'), /Missing value/);
      }
      assert.throws(() => parseCodexSyncArgs(['sync', `${option}=`], '/repo'), /Missing value/);
    });

    it(`should preserve explicit equals and relative path syntax for ${option}`, () => {
      const key = option === '--repo-root' ? 'repoRoot' : 'cachePath';
      assert.equal(
        parseCodexSyncArgs(['check', `${option}=--literal`], '/repo').options[key],
        path.resolve('--literal'),
      );
      assert.equal(
        parseCodexSyncArgs(['check', option, './--literal'], '/repo').options[key],
        path.resolve('./--literal'),
      );
    });
  }
});
