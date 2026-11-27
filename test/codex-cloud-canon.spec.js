import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { reconcileCloudCanonSkills } from '../lib/codex-cloud-canon.js';
import { GENERATED_MARKER, checkCodexConfig, syncCodexConfig } from '../lib/codex-config-sync.js';

describe('lib/codex-cloud-canon', () => {
  let home;
  let cache;
  let configPath;

  beforeEach(async () => {
    home = await realpath(await mkdtemp(path.join(os.tmpdir(), 'me-cloud-canon-')));
    cache = path.join(home, 'plugins', 'cache', 'created-by-me-remote', 'tanaab');
    configPath = path.join(home, 'config.toml');
    await mkdir(cache, { recursive: true });
    await writeFile(configPath, '');
    await writeFile(
      path.join(cache, '.codex-remote-plugin-install.json'),
      JSON.stringify({
        schema_version: 1,
        remote_plugin_id: 'account-install-fixture',
      }),
    );
  });

  afterEach(async () => {
    await rm(home, { force: true, recursive: true });
  });

  async function addRelease(version, name) {
    const release = path.join(cache, version);
    const manifest = path.join(release, '.codex-plugin');
    const skill = path.join(release, 'skills', 'tools', name, 'SKILL.md');
    await mkdir(manifest, { recursive: true });
    await mkdir(path.dirname(skill), { recursive: true });
    await writeFile(
      path.join(manifest, 'plugin.json'),
      JSON.stringify({
        name: 'tanaab',
        repository: 'https://github.com/tanaabased/canon',
        version,
        skills: './skills',
      }),
    );
    await writeFile(skill, `---\nname: ${name}\ndescription: fixture\n---\n`);
    return skill;
  }

  it('should suppress only the account-delivered paths and reconcile a renamed skill on the next release', async () => {
    const cloudSkill = await addRelease('7.0.0', 'review');
    const localSkill = {
      path: path.join(
        home,
        'plugins',
        'cache',
        'pirostore',
        'tanaab',
        '7.0.0',
        'skills',
        'review',
        'SKILL.md',
      ),
      enabled: true,
    };
    const byName = { name: 'review', enabled: true };
    const plugins = {
      'tanaab@created-by-me-remote': { enabled: true },
      'tanaab@pirostore': { enabled: true },
    };
    let saved = {
      plugins,
      skills: { config: [localSkill, { path: cloudSkill, enabled: true }, byName] },
    };
    let version = 1;
    const connect = (_, use) =>
      use(async (method, params) => {
        if (method === 'config/read') {
          return {
            layers: [
              { name: { type: 'user', file: configPath }, config: saved, version: String(version) },
            ],
          };
        }
        assert.equal(method, 'config/batchWrite');
        assert.equal(params.expectedVersion, String(version));
        const [{ keyPath, value }] = params.edits;
        assert.equal(keyPath, 'skills.config');
        saved = { ...saved, skills: { config: value } };
        return { filePath: configPath, version: String(++version) };
      });

    assert.deepEqual(await reconcileCloudCanonSkills(home, connect), {
      status: 'updated',
      skills: 1,
    });
    assert.deepEqual(saved, {
      plugins,
      skills: { config: [localSkill, byName, { path: cloudSkill, enabled: false }] },
    });
    assert.deepEqual(await reconcileCloudCanonSkills(home, connect), {
      status: 'unchanged',
      skills: 1,
    });
    assert.equal(version, 2);

    await rename(path.join(cache, '7.0.0'), path.join(home, 'retired-release'));
    const renamedSkill = await addRelease('8.0.0', 'new-review');
    assert.deepEqual(await reconcileCloudCanonSkills(home, connect), {
      status: 'updated',
      skills: 1,
    });
    assert.deepEqual(saved.skills.config, [
      localSkill,
      byName,
      { path: cloudSkill, enabled: false },
      { path: renamedSkill, enabled: false },
    ]);
  });

  it('should stop before opening Codex when more than one Cloud Canon release is present', async () => {
    await addRelease('7.0.0', 'review');
    await addRelease('8.0.0', 'review');
    await assert.rejects(
      reconcileCloudCanonSkills(home, () => assert.fail('must not open Codex')),
      /exactly one materialized Cloud Canon release/,
    );
  });

  it('should retain reconciled exclusions when setup regenerates the local skills array', async () => {
    const cloudSkill = await addRelease('7.0.0', 'review');
    const localPath = path.join(home, 'config.local.toml');
    const sharedPath = path.join(home, 'config.shared.toml');
    const options = { localPath, sharedPath, outputPath: configPath };
    await writeFile(sharedPath, 'personality = "pragmatic"\n');
    await writeFile(localPath, '[[skills.config]]\nname = "unrelated"\nenabled = false\n');
    await writeFile(
      configPath,
      `# ${GENERATED_MARKER}\n[[skills.config]]\npath = ${JSON.stringify(cloudSkill)}\nenabled = false\n`,
    );
    await syncCodexConfig(options);
    const saved = globalThis.Bun.TOML.parse(await readFile(configPath, 'utf8'));
    assert.deepEqual(saved.skills.config, [
      { name: 'unrelated', enabled: false },
      { path: cloudSkill, enabled: false },
    ]);
    assert.equal(await checkCodexConfig(options), true);
  });
});
