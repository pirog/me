import { previewPaths } from './codexsync-diff.js';

export function printCodexSyncPaths(cli, { cachePath, repoRoot }) {
  cli.log(`repo: ${repoRoot}`);
  cli.log(`cache: ${cachePath}`);
}

export function printCodexSyncDiffDetails(cli, diff) {
  for (const [label, paths] of [
    ['changed', diff.changed],
    ['missing', diff.missing],
    ['extra', diff.extra],
  ]) {
    const preview = previewPaths(paths);
    if (preview.length === 0) continue;

    cli.log(`${label}:`);
    for (const entry of preview) {
      cli.log(`  ${entry}`);
    }
  }
}
