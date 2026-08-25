import { collectManagedEntries, pathExists } from './codexsync-cache.js';
import { diffEntries, diffHasChanges, summarizeDiff } from './codexsync-diff.js';
import { printCodexSyncDiffDetails, printCodexSyncPaths } from './codexsync-report.js';

export async function runCodexSyncCheck({ cachePath, cli, repoRoot }) {
  const sourceEntries = await collectManagedEntries(repoRoot);
  const targetEntries = (await pathExists(cachePath))
    ? await collectManagedEntries(cachePath)
    : new Map();
  const diff = diffEntries(sourceEntries, targetEntries);

  printCodexSyncPaths(cli, { cachePath, repoRoot });

  if (!diffHasChanges(diff)) {
    cli.success('managed plugin cache paths match source');
    return { diff, ok: true };
  }

  cli.error('cache drift detected for managed plugin paths (%s)', summarizeDiff(diff));
  printCodexSyncDiffDetails(cli, diff);
  return { diff, ok: false };
}
