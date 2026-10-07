import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(root, '.agent-system', 'agent.yaml');
const yaml = async (file) => globalThis.Bun.YAML.parse(await readFile(file, 'utf8'));

describe('.agent-system/agent', () => {
  it('should declare only Codex self-assignment planning within the pinned owner scope', async () => {
    const manifest = await yaml(manifestPath);
    assert.equal(manifest['schema-version'], 1);
    assert.deepEqual(manifest.github, {
      host: 'github.com',
      username: 'pirog',
      notifications: {
        'schema-version': 2,
        runtimes: ['codex'],
        'interval-minutes': 5,
        'allowed-repository-owners': [
          { login: 'tanaabased', 'node-id': 'O_kgDODNGy1g' },
          { login: 'pirog', 'node-id': 'MDQ6VXNlcjcxMzQyNA==' },
          { login: 'lando', 'node-id': 'MDEyOk9yZ2FuaXphdGlvbjMxNjA1NTg0' },
        ],
        'issue-assignment': {
          mode: 'plan',
          allowed: [{ login: 'pirog', 'node-id': 'MDQ6VXNlcjcxMzQyNA==' }],
        },
      },
    });
  });

  it('should preserve workspace assets, adjacent setup files, and the disabled smoke test', async () => {
    const manifest = await yaml(manifestPath);
    assert.deepEqual(manifest.agent, {
      id: 'pirog',
      name: 'Mike Pirog',
      avatar: 'assets/icon-large-circle.png',
    });
    await access(path.join(root, manifest.agent.avatar));
    assert.equal(manifest.automations.length, 1);
    assert.equal(manifest.automations[0].id, 'smoke-test');
    assert.equal(manifest.automations[0].enabled, false);
    assert.deepEqual(manifest.automations[0].runtimes, ['codex']);
    assert.equal(manifest.automations[0].schedule, 'every 15 minutes');

    for (const section of ['setup-host', 'setup-agent']) {
      const setup = await yaml(path.resolve(path.dirname(manifestPath), manifest[section].file));
      assert.ok(setup.steps.length > 0);
      for (const step of setup.steps) {
        for (const operation of ['check', 'apply']) {
          assert.equal(step[operation].command, 'bun');
          assert.equal(step[operation].args[0], 'scripts/setup.js');
          assert.equal(step[operation].args[1], operation);
          await access(path.join(root, step[operation].args[0]));
        }
      }
    }
    for (const file of ['agent.yaml', 'setup-host.yaml', 'setup-agent.yaml']) {
      await assert.rejects(access(path.join(root, file)), { code: 'ENOENT' });
    }
  });
});
