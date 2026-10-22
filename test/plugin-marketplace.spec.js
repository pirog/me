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

describe('marketplace static invariants', () => {
  it('should preserve the marketplace identity and documented plugin ordering', async () => {
    const marketplace = await loadMarketplace();
    assert.equal(marketplace.name, 'pirostore');
    const entries = marketplace.plugins.map(({ name, category }) => ({ name, category }));
    const rank = (category) => {
      if (category === 'Pirobased') return 0;
      if (category === 'Tanaab-based') return 1;
      return 2;
    };
    assert.deepEqual(
      entries,
      entries.toSorted((left, right) => {
        const categoryOrder = rank(left.category) - rank(right.category);
        if (categoryOrder) return categoryOrder;
        if (left.category !== right.category) return 0;
        return left.name.localeCompare(right.name);
      }),
    );
  });
});
