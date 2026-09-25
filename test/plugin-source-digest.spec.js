import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import pluginSourceDigest from '../utils/plugin-source-digest.js';

describe('utils/plugin-source-digest', () => {
  it('changes for build inputs but ignores tests and generated output', async () => {
    const source = await mkdtemp(path.join(os.tmpdir(), 'me-plugin-digest-'));
    try {
      await mkdir(path.join(source, 'src'));
      await mkdir(path.join(source, 'test'));
      await mkdir(path.join(source, 'dist'));
      await writeFile(path.join(source, 'src', 'index.ts'), 'export const value = 1;\n');
      await writeFile(path.join(source, 'bun.lock'), 'lock 1\n');
      await writeFile(path.join(source, 'test', 'index.spec.ts'), 'test 1\n');
      await writeFile(path.join(source, 'dist', 'index.js'), 'build 1\n');
      const listing = ['test/index.spec.ts', 'dist/index.js', 'src/index.ts', 'bun.lock'].join(
        '\0',
      );
      const initial = await pluginSourceDigest(source, listing);

      await writeFile(path.join(source, 'test', 'index.spec.ts'), 'test 2\n');
      await writeFile(path.join(source, 'dist', 'index.js'), 'build 2\n');
      assert.equal(await pluginSourceDigest(source, listing), initial);

      await writeFile(path.join(source, 'src', 'index.ts'), 'export const value = 2;\n');
      assert.notEqual(await pluginSourceDigest(source, listing), initial);

      await writeFile(path.join(source, 'src', 'index.ts'), 'export const value = 1;\n');
      await writeFile(path.join(source, 'bun.lock'), 'lock 2\n');
      assert.notEqual(await pluginSourceDigest(source, listing), initial);
    } finally {
      await rm(source, { recursive: true, force: true });
    }
  });
});
