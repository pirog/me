import { collectManagedEntries, pathExists, syncEntries } from './codexsync-cache.js';
import { diffHasChanges, summarizeDiff } from './codexsync-diff.js';
import { printCodexSyncDiffDetails, printCodexSyncPaths } from './codexsync-report.js';

export async function runCodexSyncSync({ cachePath, cli, repoRoot }) {
  const sourceEntries = await collectManagedEntries(repoRoot);
  const targetEntries = (await pathExists(cachePath))
    ? await collectManagedEntries(cachePath)
    : new Map();
  const postSyncDiff = await syncEntries({
    sourceEntries,
    sourceRoot: repoRoot,
    targetEntries,
    targetRoot: cachePath,
  });

  printCodexSyncPaths(cli, { cachePath, repoRoot });

  if (diffHasChanges(postSyncDiff)) {
    cli.error(
      'cache sync did not converge for managed plugin paths (%s)',
      summarizeDiff(postSyncDiff),
    );
    printCodexSyncDiffDetails(cli, postSyncDiff);
    return { diff: postSyncDiff, ok: false };
  }

  cli.success('managed plugin cache paths synced');
  cli.note('restart or reinstall Codex if refreshed plugin surfaces do not appear immediately');
  return { diff: postSyncDiff, ok: true };
}
