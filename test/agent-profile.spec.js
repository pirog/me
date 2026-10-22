import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(root, '.agent-system', 'agent.yaml');
const yaml = async (file) => globalThis.Bun.YAML.parse(await readFile(file, 'utf8'));

describe('agent profile static invariants', () => {
  it('should preserve workspace assets, adjacent setup files, and the disabled smoke test', async () => {
    const manifest = await yaml(manifestPath);
    await access(path.join(root, manifest.agent.avatar));
    const smokeTest = manifest.automations.find(({ id }) => id === 'smoke-test');
    if (smokeTest) assert.equal(smokeTest.enabled, false);

    for (const section of ['setup-host', 'setup-agent']) {
      const setup = await yaml(path.resolve(path.dirname(manifestPath), manifest[section].file));
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
