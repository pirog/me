import assert from 'node:assert/strict';
import { access, lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import pruneDanglingSymlinks from '../utils/prune-dangling-symlinks.js';

describe('utils/prune-dangling-symlinks', () => {
  let root;

  afterEach(async () => {
    if (root) await rm(root, { force: true, recursive: true });
    root = null;
  });

  it('should leave a missing skill root alone', async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'ai-sync-prune-'));
    assert.deepEqual(await pruneDanglingSymlinks(path.join(root, 'missing')), {
      removedDirs: 0,
      removedLinks: 0,
    });
  });

  for (const code of ['EACCES', 'EPERM', 'EIO', 'ELOOP']) {
    it(`should preserve a valid link and propagate ${code} from its target probe`, async () => {
      root = await mkdtemp(path.join(os.tmpdir(), 'ai-sync-prune-'));
      const target = path.join(root, 'target.txt');
      const validLink = path.join(root, 'valid-link');
      await writeFile(target, 'preserve me\n');
      await symlink(target, validLink);
      const failure = Object.assign(new Error('probe failed'), { code });

      await assert.rejects(
        pruneDanglingSymlinks(root, {
          checkAccess: async (targetPath) => {
            if (targetPath === validLink) throw failure;
            await access(targetPath);
          },
        }),
        (error) => error === failure,
      );
      assert.equal((await lstat(validLink)).isSymbolicLink(), true);
      assert.equal(await readFile(target, 'utf8'), 'preserve me\n');
    });

    it(`should propagate ${code} from the root probe instead of reporting success`, async () => {
      root = await mkdtemp(path.join(os.tmpdir(), 'ai-sync-prune-'));
      const failure = Object.assign(new Error('probe failed'), { code });
      await assert.rejects(
        pruneDanglingSymlinks(root, {
          checkAccess: async () => {
            throw failure;
          },
        }),
        (error) => error === failure,
      );
      assert.equal((await lstat(root)).isDirectory(), true);
    });
  }

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
