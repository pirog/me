import path from 'node:path';

/** Resolve configuration paths for the same setup target during inspection and repair. */
export default function codexConfigPaths(home, env = process.env) {
  const codexDir = path.join(home, '.codex');
  return {
    localPath: path.resolve(
      env.TANAAB_CODEX_CONFIG_LOCAL?.trim() || path.join(codexDir, 'config.local.toml'),
    ),
    outputPath: path.resolve(
      env.TANAAB_CODEX_CONFIG_OUTPUT?.trim() || path.join(codexDir, 'config.toml'),
    ),
    sharedPath: path.resolve(
      env.TANAAB_CODEX_CONFIG_SHARED?.trim() || path.join(codexDir, 'config.shared.toml'),
    ),
  };
}
