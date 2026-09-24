import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmod, mkdtemp, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { runProfileSetup } from '../lib/profile-setup.js';

describe('lib/profile-setup', () => {
  it('should detect Brewfile and Bun pin drift without changing packages', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'me-profile-root-'));
    const home = await mkdtemp(path.join(os.tmpdir(), 'me-profile-home-'));
    const bin = path.join(home, 'bin');
    const bunPrefix = path.join(home, 'bun-formula');
    const nodePrefix = path.join(home, 'node-formula');
    await mkdir(bin);
    await mkdir(path.join(bunPrefix, 'bin'), { recursive: true });
    await mkdir(path.join(nodePrefix, 'bin'), { recursive: true });
    await symlink(process.execPath, path.join(bunPrefix, 'bin', 'bun'));
    await writeFile(path.join(nodePrefix, 'bin', 'node'), '#!/bin/sh\necho v26.1.0\n');
    await chmod(path.join(nodePrefix, 'bin', 'node'), 0o755);
    await writeFile(path.join(root, 'Brewfile'), 'brew "stow"\n');
    await writeFile(path.join(root, '.bun-version'), `${globalThis.Bun.version}\n`);
    const brew = path.join(bin, 'brew');
    await writeFile(
      brew,
      `#!/bin/sh\nif [ "$1" = list ]; then exit 1; fi\nif [ "$1" = bundle ]; then exit 0; fi\nif [ "$2" = oven-sh/bun/bun ]; then echo '${bunPrefix}'; exit 0; fi\nif [ "$2" = node@26 ]; then echo '${nodePrefix}'; exit 0; fi\nexit 2\n`,
    );
    await chmod(brew, 0o755);

    const originalPath = process.env.PATH;
    process.env.PATH = `${bin}:${originalPath}`;
    try {
      assert.equal(await runProfileSetup(['check', 'brewfile'], { root, home }), 0);
      await writeFile(path.join(root, '.bun-version'), '0.0.0\n');
      assert.equal(await runProfileSetup(['check', 'brewfile'], { root, home }), 1);
    } finally {
      process.env.PATH = originalPath;
    }
  });

  it('should distinguish an unchanged Stow simulation from pending links', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'me-profile-root-'));
    const home = await mkdtemp(path.join(os.tmpdir(), 'me-profile-home-'));
    const bin = path.join(home, 'bin');
    const stow = path.join(bin, 'stow');
    await mkdir(bin);
    await mkdir(path.join(root, 'dotfiles', 'ai'), { recursive: true });
    await writeFile(
      stow,
      '#!/bin/sh\necho "WARNING: in simulation mode so not modifying filesystem."\n',
    );
    await chmod(stow, 0o755);
    const originalPath = process.env.PATH;
    process.env.PATH = `${bin}:${originalPath}`;
    try {
      assert.equal(await runProfileSetup(['check', 'dotfiles'], { root, home }), 0);
      await writeFile(stow, '#!/bin/sh\necho "LINK: .codex/config.shared.toml"\n');
      assert.equal(await runProfileSetup(['check', 'dotfiles'], { root, home }), 1);
      const log = path.join(home, 'stow-args');
      await writeFile(stow, `#!/bin/sh\nprintf '%s\\n' "$@" > '${log}'\n`);
      assert.equal(await runProfileSetup(['apply', 'dotfiles'], { root, home }), 0);
      assert.match(await readFile(log, 'utf8'), /--restow/);
    } finally {
      process.env.PATH = originalPath;
    }
  });

  it('should skip a declared optional source plugin only when no checkout or link exists', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'me-profile-root-'));
    const home = await mkdtemp(path.join(os.tmpdir(), 'me-profile-home-'));
    const args = ['check', 'plugin', 'canon', 'tanaab', 'optional'];

    assert.equal(await runProfileSetup(args, { root, home }), 0);
    await mkdir(path.join(root, 'dotfiles', 'ai', '.codex', 'plugins'), { recursive: true });
    await symlink(
      'missing-source',
      path.join(root, 'dotfiles', 'ai', '.codex', 'plugins', 'tanaab'),
    );
    assert.equal(await runProfileSetup(args, { root, home }), 2);
  });

  it('should reject malformed step declarations before any work', async () => {
    assert.equal(await runProfileSetup(['check', 'plugin', '../canon', 'tanaab']), 2);
    assert.equal(await runProfileSetup(['check', 'dotfiles', 'unexpected']), 2);
    assert.equal(await runProfileSetup(['repair', 'dotfiles']), 2);
  });

  it('should check local plugin installation and cache drift', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'me-profile-root-'));
    const home = await mkdtemp(path.join(os.tmpdir(), 'me-profile-home-'));
    const source = path.join(home, 'tanaab', 'canon');
    const links = path.join(root, 'dotfiles', 'ai', '.codex', 'plugins');
    const cli = path.join(root, 'node_modules', '.bin', 'codex-tools');
    await mkdir(path.dirname(cli), { recursive: true });
    await mkdir(links, { recursive: true });
    execFileSync('git', ['init', '-q', source]);
    execFileSync('git', [
      '-C',
      source,
      'remote',
      'add',
      'origin',
      'git@github.com:tanaabased/canon.git',
    ]);
    await symlink(path.relative(links, source), path.join(links, 'tanaab'));
    await writeFile(
      cli,
      '#!/bin/sh\nif [ "$1" = status ]; then echo \'{"ok":true,"inspection":{"installed":true,"enabled":true}}\'; exit 0; fi\nexit 0\n',
    );
    await chmod(cli, 0o755);
    const args = ['check', 'plugin', 'canon', 'tanaab', 'optional'];
    assert.equal(await runProfileSetup(args, { root, home }), 0);

    await writeFile(
      cli,
      '#!/bin/sh\nif [ "$1" = status ]; then echo \'{"ok":true,"inspection":{"installed":true,"enabled":true}}\'; exit 0; fi\nexit 1\n',
    );
    assert.equal(await runProfileSetup(args, { root, home }), 1);

    await writeFile(
      cli,
      '#!/bin/sh\necho \'{"ok":false,"inspection":{"installed":false,"enabled":false}}\'\nexit 1\n',
    );
    assert.equal(await runProfileSetup(args, { root, home }), 0);
  });

  it('should sync an installed source plugin cache on apply', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'me-profile-root-'));
    const home = await mkdtemp(path.join(os.tmpdir(), 'me-profile-home-'));
    const links = path.join(root, 'dotfiles', 'ai', '.codex', 'plugins');
    const cli = path.join(root, 'node_modules', '.bin', 'codex-tools');
    const bin = path.join(home, 'bin');
    const log = path.join(home, 'codex-tools-args');
    await mkdir(links, { recursive: true });
    await mkdir(path.dirname(cli), { recursive: true });
    await mkdir(bin);
    await symlink(path.relative(links, root), path.join(links, 'piroplugin'));
    await writeFile(path.join(bin, 'bun'), '#!/bin/sh\nexit 0\n');
    await chmod(path.join(bin, 'bun'), 0o755);
    await writeFile(
      cli,
      `#!/bin/sh\nif [ "$1" = status ]; then echo '{"ok":true,"inspection":{"installed":true,"enabled":true}}'; exit 0; fi\nprintf '%s\\n' "$@" > '${log}'\n`,
    );
    await chmod(cli, 0o755);
    const originalPath = process.env.PATH;
    process.env.PATH = `${bin}:${originalPath}`;
    try {
      assert.equal(
        await runProfileSetup(['apply', 'plugin', 'me', 'piroplugin'], { root, home }),
        0,
      );
      assert.match(await readFile(log, 'utf8'), /^cache\nsync\n/);
    } finally {
      process.env.PATH = originalPath;
    }
  });
});
