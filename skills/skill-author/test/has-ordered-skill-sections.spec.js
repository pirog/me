import assert from 'node:assert/strict';

import hasOrderedSkillSections from '../utils/has-ordered-skill-sections.js';

describe('skills/skill-author/utils/has-ordered-skill-sections', () => {
  it('should allow omitted optional sections and reject unexpected section order', () => {
    const sectionOrder = ['# ', '## Overview', '## Optimization', '## Validation'];
    const optionalHeadings = ['## Optimization'];
    const withoutOptimization = '# Probe\n\n## Overview\n\nBody.\n\n## Validation\n';

    assert.equal(
      hasOrderedSkillSections(withoutOptimization, sectionOrder, optionalHeadings),
      true,
    );
    assert.equal(
      hasOrderedSkillSections(
        withoutOptimization.replace('## Overview', '## Unexpected'),
        sectionOrder,
        optionalHeadings,
      ),
      false,
    );
  });
});
