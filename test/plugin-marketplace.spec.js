import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const MARKETPLACE_PATH = path.resolve(
  import.meta.dirname,
  '..',
  'dotfiles',
  'ai',
  '.agents',
  'plugins',
  'marketplace.json',
);

async function loadMarketplace() {
  return JSON.parse(await readFile(MARKETPLACE_PATH, 'utf8'));
}

describe('Pirostore marketplace', () => {
  it('should preserve plugin ordering and pin Leia to the stable npm release', async () => {
    const marketplace = await loadMarketplace();

    assert.equal(marketplace.name, 'pirostore');
    assert.deepEqual(
      marketplace.plugins.map(({ name, category }) => ({ name, category })),
      [
        { name: 'piroplugin', category: 'Pirobased' },
        { name: 'agent-system', category: 'Tanaab-based' },
        { name: 'agentbox', category: 'Tanaab-based' },
        { name: 'tanaab', category: 'Tanaab-based' },
        { name: 'leia', category: 'Testing' },
      ],
    );
    assert.deepEqual(marketplace.plugins.at(-1), {
      name: 'leia',
      source: {
        source: 'npm',
        package: '@lando/leia',
        version: '2.0.0',
      },
      policy: {
        installation: 'AVAILABLE',
        authentication: 'ON_INSTALL',
      },
      category: 'Testing',
    });
  });
});
