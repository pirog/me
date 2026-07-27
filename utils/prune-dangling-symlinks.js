import { access, lstat, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes dangling descendant symlinks and directories emptied by that removal.
 *
 * @param {string} rootPath Root directory to preserve.
 * @returns {Promise<{removedDirs: number, removedLinks: number}>} Removal counts.
 */
export default async function pruneDanglingSymlinks(rootPath) {
  if (!(await pathExists(rootPath))) return { removedDirs: 0, removedLinks: 0 };

  const stat = await lstat(rootPath);
  if (!stat.isDirectory()) return { removedDirs: 0, removedLinks: 0 };

  const counters = { removedDirs: 0, removedLinks: 0 };

  async function visit(currentPath, preserveCurrent) {
    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);

      if (entry.isSymbolicLink()) {
        if (await pathExists(entryPath)) continue;
        await rm(entryPath, { force: true });
        counters.removedLinks += 1;
        continue;
      }

      if (entry.isDirectory()) await visit(entryPath, false);
    }

    if (preserveCurrent) return;

    const remainingEntries = await readdir(currentPath);
    if (remainingEntries.length === 0) {
      await rm(currentPath, { recursive: true, force: true });
      counters.removedDirs += 1;
    }
  }

  await visit(rootPath, true);
  return counters;
}
