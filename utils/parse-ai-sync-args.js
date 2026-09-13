import path from 'node:path';

import buildAiSyncEnvironment from './build-ai-sync-environment.js';

const VALUE_OPTIONS = new Map([
  ['--target', 'target'],
  ['--dotfiles-dir', 'dotfilesDir'],
  ['--package', 'packageName'],
  ['--codex-config-shared', 'codexConfigShared'],
  ['--codex-config-local', 'codexConfigLocal'],
  ['--codex-config-output', 'codexConfigOutput'],
]);

/**
 * Applies aisync CLI options over resolved environment defaults.
 *
 * @param {string[]} argv Raw command arguments after common flags are removed.
 * @param {object} environment Resolved environment defaults.
 * @returns {object} Normalized aisync options.
 * @throws {Error} When an option is unknown or lacks a value, or an argument is positional.
 */
export default function parseAiSyncArgs(argv, environment = buildAiSyncEnvironment()) {
  const { explicitCodexConfigPaths: environmentPaths = [], ...parsed } = environment;
  const explicitCodexConfigPaths = new Set(environmentPaths);

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--simulate') {
      parsed.simulate = true;
      continue;
    }
    if (arg === '--no-prune') {
      parsed.prune = false;
      continue;
    }
    if (arg === '--no-codex-config') {
      parsed.codexConfigSync = false;
      continue;
    }
    if (!arg.startsWith('--')) {
      throw new Error(`Positional arguments are not supported: ${arg}`);
    }

    const key = VALUE_OPTIONS.get(arg);
    if (!key) throw new Error(`Unknown option: ${arg}`);

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }

    parsed[key] = value;
    if (['codexConfigShared', 'codexConfigLocal', 'codexConfigOutput'].includes(key)) {
      explicitCodexConfigPaths.add(key);
    }
    index += 1;
  }

  parsed.dotfilesDir = path.resolve(parsed.dotfilesDir);
  parsed.target = path.resolve(parsed.target);
  const codexDir = path.join(parsed.target, '.codex');
  if (!explicitCodexConfigPaths.has('codexConfigShared')) {
    parsed.codexConfigShared = path.join(codexDir, 'config.shared.toml');
  }
  if (!explicitCodexConfigPaths.has('codexConfigLocal')) {
    parsed.codexConfigLocal = path.join(codexDir, 'config.local.toml');
  }
  if (!explicitCodexConfigPaths.has('codexConfigOutput')) {
    parsed.codexConfigOutput = path.join(codexDir, 'config.toml');
  }
  parsed.codexConfigShared = path.resolve(parsed.codexConfigShared);
  parsed.codexConfigLocal = path.resolve(parsed.codexConfigLocal);
  parsed.codexConfigOutput = path.resolve(parsed.codexConfigOutput);
  return parsed;
}
