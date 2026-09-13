import assert from 'node:assert/strict';
import path from 'node:path';

import buildAiSyncEnvironment from '../utils/build-ai-sync-environment.js';
import parseAiSyncArgs from '../utils/parse-ai-sync-args.js';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

describe('utils/parse-ai-sync-args', () => {
  const configPaths = [
    ['SHARED', 'shared', 'codexConfigShared', 'config.shared.toml'],
    ['LOCAL', 'local', 'codexConfigLocal', 'config.local.toml'],
    ['OUTPUT', 'output', 'codexConfigOutput', 'config.toml'],
  ];

  for (const [suffix, option, key, filename] of configPaths) {
    it(`should preserve the ${option} environment path with and without a target override`, () => {
      const environment = buildAiSyncEnvironment({
        env: { [`TANAAB_CODEX_CONFIG_${suffix}`]: ` /tmp/custom/${filename} ` },
        homedir: '/tmp/default-home',
      });
      const snapshot = structuredClone(environment);

      assert.equal(parseAiSyncArgs([], environment)[key], `/tmp/custom/${filename}`);
      const parsed = parseAiSyncArgs(['--target', '/tmp/new-home'], environment);
      assert.equal(parsed[key], `/tmp/custom/${filename}`);
      assert.equal(parsed.target, '/tmp/new-home');
      assert.equal(Object.hasOwn(parsed, 'explicitCodexConfigPaths'), false);
      assert.deepEqual(environment, snapshot);
    });

    it(`should let the ${option} CLI path override the environment in either argument order`, () => {
      const environment = buildAiSyncEnvironment({
        env: { [`TANAAB_CODEX_CONFIG_${suffix}`]: `/tmp/custom/${filename}` },
        homedir: '/tmp/default-home',
      });
      const flag = `--codex-config-${option}`;
      const value = `relative/${filename}`;
      for (const argv of [
        [flag, value, '--target', '/tmp/new-home'],
        ['--target', '/tmp/new-home', flag, value],
      ]) {
        assert.equal(parseAiSyncArgs(argv, environment)[key], path.resolve(value));
      }
    });

    it(`should retain an explicit ${option} default path but rebase a blank override`, () => {
      const original = `/tmp/default-home/.codex/${filename}`;
      for (const value of [original, '   ']) {
        const environment = buildAiSyncEnvironment({
          env: { [`TANAAB_CODEX_CONFIG_${suffix}`]: value },
          homedir: '/tmp/default-home',
        });
        const parsed = parseAiSyncArgs(['--target', '/tmp/new-home'], environment);
        assert.equal(
          parsed[key],
          value === original ? original : `/tmp/new-home/.codex/${filename}`,
        );
      }
    });
  }

  it('should map documented value options and let the last CLI value win', () => {
    const parsed = parseAiSyncArgs(
      [
        '--package',
        'first',
        '--package',
        'custom-ai',
        '--dotfiles-dir',
        './dotfiles',
        '--no-codex-config',
      ],
      buildAiSyncEnvironment({ env: { TANAAB_STOW_PACKAGE: 'environment-ai' } }),
    );

    assert.equal(parsed.packageName, 'custom-ai');
    assert.equal(parsed.dotfilesDir, path.resolve('dotfiles'));
    assert.equal(parsed.codexConfigSync, false);
  });

  it('should reject unknown options instead of creating unused or internal properties', () => {
    for (const flag of ['--targte', '--unknown', '--package-name', '--prune', '--__proto__']) {
      assert.throws(() => parseAiSyncArgs([flag, '/tmp/value']), /Unknown option/);
      assert.throws(() => parseAiSyncArgs([flag]), /Unknown option/);
    }
  });

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
