import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import pruneDanglingSymlinks from '../utils/prune-dangling-symlinks.js';

describe('utils/prune-dangling-symlinks', () => {
  let root;

  afterEach(async () => {
    if (root) await rm(root, { force: true, recursive: true });
    root = null;
  });

  it('should prune only dangling links and newly empty descendant directories', async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'ai-sync-prune-'));
    const target = path.join(root, 'target.txt');
    const validLink = path.join(root, 'valid-link');
    const emptyAfterPrune = path.join(root, 'empty-after-prune');
    const danglingLink = path.join(emptyAfterPrune, 'dangling-link');

    await writeFile(target, 'target\n', 'utf8');
    await symlink(target, validLink);
    await mkdir(emptyAfterPrune);
    await symlink(path.join(root, 'missing-target'), danglingLink);

    assert.deepEqual(await pruneDanglingSymlinks(root), { removedDirs: 1, removedLinks: 1 });
    assert.equal((await lstat(validLink)).isSymbolicLink(), true);
    await assert.rejects(lstat(danglingLink), { code: 'ENOENT' });
    await assert.rejects(lstat(emptyAfterPrune), { code: 'ENOENT' });
  });
});
