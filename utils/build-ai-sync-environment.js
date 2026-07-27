import os from 'node:os';
import path from 'node:path';

import { REPO_ROOT } from '../lib/bun-cli-support.js';
import { booleanFromEnv } from './boolean-from-env.js';

/**
 * Resolves aisync defaults from injectable host inputs.
 *
 * @param {object} options Host environment inputs.
 * @returns {object} Resolved aisync options.
 */
export default function buildAiSyncEnvironment({
  env = process.env,
  homedir = os.homedir(),
  repoRoot = REPO_ROOT,
} = {}) {
  const target = env.TANAAB_STOW_TARGET?.trim() || homedir;
  const codexDir = path.join(target, '.codex');

  return {
    codexConfigLocal:
      env.TANAAB_CODEX_CONFIG_LOCAL?.trim() || path.join(codexDir, 'config.local.toml'),
    codexConfigOutput: env.TANAAB_CODEX_CONFIG_OUTPUT?.trim() || path.join(codexDir, 'config.toml'),
    codexConfigShared:
      env.TANAAB_CODEX_CONFIG_SHARED?.trim() || path.join(codexDir, 'config.shared.toml'),
    codexConfigSync: booleanFromEnv(env.TANAAB_CODEX_CONFIG_SYNC, true),
    dotfilesDir: env.TANAAB_STOW_DOTFILES_DIR?.trim() || path.join(repoRoot, 'dotfiles'),
    packageName: env.TANAAB_STOW_PACKAGE?.trim() || 'ai',
    prune: booleanFromEnv(env.TANAAB_STOW_PRUNE, true),
    simulate: booleanFromEnv(env.TANAAB_STOW_SIMULATE, false),
    target,
  };
}
