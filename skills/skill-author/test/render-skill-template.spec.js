import assert from 'node:assert/strict';

import renderSkillTemplate from '../utils/render-skill-template.js';

describe('skills/skill-author/utils/render-skill-template', () => {
  it('should replace known tokens and preserve unknown tokens', () => {
    assert.equal(
      renderSkillTemplate('{{name}} {{unknown}}', { name: 'Probe' }),
      'Probe {{unknown}}',
    );
  });
});
