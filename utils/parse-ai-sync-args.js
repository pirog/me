import path from 'node:path';

import buildAiSyncEnvironment from './build-ai-sync-environment.js';

/**
 * Applies aisync CLI options over resolved environment defaults.
 *
 * @param {string[]} argv Raw command arguments after common flags are removed.
 * @param {object} environment Resolved environment defaults.
 * @returns {object} Normalized aisync options.
 */
export default function parseAiSyncArgs(argv, environment = buildAiSyncEnvironment()) {
  const parsed = { ...environment };
  const explicitCodexConfigPaths = new Set();

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

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }

    const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
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
