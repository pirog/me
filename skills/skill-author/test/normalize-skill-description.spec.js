import assert from 'node:assert/strict';

import normalizeSkillDescription, {
  makeShortSkillDescription,
  makeSkillDefaultPrompt,
} from '../utils/normalize-skill-description.js';

describe('skills/skill-author/utils/normalize-skill-description', () => {
  it('should normalize descriptions and derive bounded metadata text', () => {
    assert.equal(
      normalizeSkillDescription('Piro-based validate this surface'),
      'Pirobased validate this surface',
    );
    assert.ok(makeShortSkillDescription('x'.repeat(100)).length <= 64);
    assert.equal(
      makeSkillDefaultPrompt('piro-probe', 'Pirobased Validate this surface.'),
      'Use $piro-probe when you need to validate this surface.',
    );
  });
});
