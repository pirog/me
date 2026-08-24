import assert from 'node:assert/strict';

import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  utimes,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { collectManagedEntries, syncEntries } from '../lib/codexsync-cache.js';

async function createRoots() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'piro-codexsync-cache-'));
  const sourceRoot = path.join(tempRoot, 'source');
  const targetRoot = path.join(tempRoot, 'target');
  await Promise.all([mkdir(sourceRoot), mkdir(targetRoot)]);
  return { sourceRoot, targetRoot, tempRoot };
}

async function syncRoots(sourceRoot, targetRoot) {
  const [sourceEntries, targetEntries] = await Promise.all([
    collectManagedEntries(sourceRoot),
    collectManagedEntries(targetRoot),
  ]);

  return syncEntries({ sourceEntries, sourceRoot, targetEntries, targetRoot });
}

describe('lib/codexsync-cache', () => {
  const tempRoots = [];

  afterEach(async () => {
    await Promise.all(tempRoots.splice(0).map((tempRoot) => rm(tempRoot, { recursive: true })));
  });

  it('should leave matching managed files untouched', async () => {
    const { sourceRoot, targetRoot, tempRoot } = await createRoots();
    tempRoots.push(tempRoot);
    const sourcePath = path.join(sourceRoot, '.mcp.json');
    const targetPath = path.join(targetRoot, '.mcp.json');
    await Promise.all([
      writeFile(sourcePath, '{"same":true}\n'),
      writeFile(targetPath, '{"same":true}\n'),
    ]);
    const preservedTime = new Date('2020-01-02T03:04:05.000Z');
    await utimes(targetPath, preservedTime, preservedTime);
    const before = await lstat(targetPath);

    const diff = await syncRoots(sourceRoot, targetRoot);
    const after = await lstat(targetPath);

    assert.deepEqual(diff, { changed: [], extra: [], missing: [] });
    assert.equal(after.ino, before.ino);
    assert.equal(after.mtimeMs, before.mtimeMs);
  });

  it('should update changed file content and mode', async () => {
    const { sourceRoot, targetRoot, tempRoot } = await createRoots();
    tempRoots.push(tempRoot);
    const sourcePath = path.join(sourceRoot, 'package.json');
    const targetPath = path.join(targetRoot, 'package.json');
    await Promise.all([writeFile(sourcePath, 'new\n'), writeFile(targetPath, 'old\n')]);
    await Promise.all([chmod(sourcePath, 0o640), chmod(targetPath, 0o600)]);

    const diff = await syncRoots(sourceRoot, targetRoot);
    const targetStats = await lstat(targetPath);

    assert.deepEqual(diff, { changed: [], extra: [], missing: [] });
    assert.equal(await readFile(targetPath, 'utf8'), 'new\n');
    assert.equal(targetStats.mode & 0o777, 0o640);
  });

  it('should add missing entries and remove extra entries', async () => {
    const { sourceRoot, targetRoot, tempRoot } = await createRoots();
    tempRoots.push(tempRoot);
    await mkdir(path.join(sourceRoot, 'skills', 'probe'), { recursive: true });
    await writeFile(path.join(sourceRoot, 'skills', 'probe', 'SKILL.md'), 'probe\n');
    await mkdir(path.join(targetRoot, 'skills', 'obsolete'), { recursive: true });
    await writeFile(path.join(targetRoot, 'skills', 'obsolete', 'SKILL.md'), 'obsolete\n');

    const diff = await syncRoots(sourceRoot, targetRoot);

    assert.deepEqual(diff, { changed: [], extra: [], missing: [] });
    assert.equal(
      await readFile(path.join(targetRoot, 'skills', 'probe', 'SKILL.md'), 'utf8'),
      'probe\n',
    );
    await assert.rejects(lstat(path.join(targetRoot, 'skills', 'obsolete')));
  });

  it('should copy shared references used by installed skills', async () => {
    const { sourceRoot, targetRoot, tempRoot } = await createRoots();
    tempRoots.push(tempRoot);
    await mkdir(path.join(sourceRoot, 'references'), { recursive: true });
    await mkdir(path.join(sourceRoot, 'skills', 'skill-author'), { recursive: true });
    await writeFile(path.join(sourceRoot, 'references', 'skill-standard.md'), '# Skill Standard\n');
    await writeFile(path.join(sourceRoot, 'skills', 'skill-author', 'SKILL.md'), 'author\n');

    const diff = await syncRoots(sourceRoot, targetRoot);
    const installedReferencePath = path.resolve(
      targetRoot,
      'skills',
      'skill-author',
      '../../references/skill-standard.md',
    );

    assert.deepEqual(diff, { changed: [], extra: [], missing: [] });
    assert.equal(await readFile(installedReferencePath, 'utf8'), '# Skill Standard\n');
  });

  it('should replace entries when their filesystem type changes', async () => {
    const { sourceRoot, targetRoot, tempRoot } = await createRoots();
    tempRoots.push(tempRoot);
    await mkdir(path.join(sourceRoot, 'assets'), { recursive: true });
    await writeFile(path.join(sourceRoot, 'assets', 'value.txt'), 'value\n');
    await symlink('elsewhere', path.join(targetRoot, 'assets'));

    const diff = await syncRoots(sourceRoot, targetRoot);
    const targetStats = await lstat(path.join(targetRoot, 'assets'));

    assert.deepEqual(diff, { changed: [], extra: [], missing: [] });
    assert.equal(targetStats.isDirectory(), true);
    assert.equal(await readFile(path.join(targetRoot, 'assets', 'value.txt'), 'utf8'), 'value\n');
  });
});
