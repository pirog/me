import { access, lstat, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

async function pathExists(targetPath, checkAccess) {
  try {
    await checkAccess(targetPath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

/**
 * Removes dangling descendant symlinks and directories emptied by that removal.
 *
 * @param {string} rootPath Root directory to preserve.
 * @param {object} [options] Injectable filesystem probe.
 * @param {Function} [options.checkAccess] Target access check; defaults to filesystem access.
 * @returns {Promise<{removedDirs: number, removedLinks: number}>} Removal counts.
 * @throws {Error} When filesystem access fails for a reason other than a missing target.
 */
export default async function pruneDanglingSymlinks(rootPath, { checkAccess = access } = {}) {
  if (!(await pathExists(rootPath, checkAccess))) return { removedDirs: 0, removedLinks: 0 };

  const stat = await lstat(rootPath);
  if (!stat.isDirectory()) return { removedDirs: 0, removedLinks: 0 };

  const counters = { removedDirs: 0, removedLinks: 0 };

  async function visit(currentPath, preserveCurrent) {
    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);

      if (entry.isSymbolicLink()) {
        if (await pathExists(entryPath, checkAccess)) continue;
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
