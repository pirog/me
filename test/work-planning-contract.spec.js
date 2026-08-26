import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

async function read(relativePath) {
  return readFile(path.join(REPO_ROOT, relativePath), 'utf8');
}

describe('work-planning policy contracts', () => {
  it('should declare the exact proof-fixture repository exclusion', async () => {
    const policy = await read('WORK_REPOS.md');

    assert.match(policy, /^## Excluded Repositories$/m);
    assert.match(policy, /`tanaabased\/big-test-bucket`.*GitHub integration proof fixture/s);
    assert.match(policy, /cannot re-include an excluded repository/);
  });

  for (const skill of ['plan-work', 'find-work']) {
    it(`should require exclusions and exact-once candidate dispositions in ${skill}`, async () => {
      const contract = await read(`skills/${skill}/SKILL.md`);

      assert.match(contract, /remove every exact excluded repository/);
      assert.match(contract, /Require set equality between discovered canonical URLs/);
      assert.match(contract, /with no\s+duplicates/);
      assert.match(contract, /exact evidence-backed reason/);
    });
  }
});
