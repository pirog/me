import assert from 'node:assert/strict';

import inferSkillCategoryTag from '../utils/infer-skill-category-tag.js';

describe('skills/skill-author/utils/infer-skill-category-tag', () => {
  it('should infer the first non-owner category distinct from the selected type', () => {
    assert.equal(
      inferSkillCategoryTag({
        description: 'Pirobased validate skill templates',
        displayName: 'Skill Validator',
        slug: 'piro-skill-validator',
        type: 'meta',
      }),
      'validation',
    );
  });
});
