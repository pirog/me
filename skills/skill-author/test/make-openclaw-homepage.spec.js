import assert from 'node:assert/strict';

import makeOpenClawHomepage from '../utils/make-openclaw-homepage.js';

describe('skills/skill-author/utils/make-openclaw-homepage', () => {
  it('should normalize supported GitHub repository forms', () => {
    assert.equal(
      makeOpenClawHomepage('git@github.com:pirog/example.git', 'skills/example'),
      'https://github.com/pirog/example/tree/main/skills/example',
    );
    assert.equal(makeOpenClawHomepage('https://example.com/repo', 'skills/example'), null);
  });
});
