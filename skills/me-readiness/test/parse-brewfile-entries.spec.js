import assert from 'node:assert/strict';

import parseBrewfileEntries from '../utils/parse-brewfile-entries.js';

describe('skills/me-readiness/utils/parse-brewfile-entries', () => {
  it('should collect unique formulas and casks in source order', () => {
    assert.deepEqual(
      parseBrewfileEntries('brew "git"\ncask \'codex\'\nbrew "git"\ntap "example/tap"\n'),
      { casks: ['codex'], formulas: ['git'] },
    );
  });
});
