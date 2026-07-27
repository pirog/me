import assert from 'node:assert/strict';

import extractTopLevelSkillHeadings from '../utils/extract-top-level-skill-headings.js';

describe('skills/skill-author/utils/extract-top-level-skill-headings', () => {
  it('should normalize the title and retain ordered h2 headings only', () => {
    assert.deepEqual(
      extractTopLevelSkillHeadings('# Probe\n\n## Overview\n\n### Detail\n\n## Validation\n'),
      ['# ', '## Overview', '## Validation'],
    );
  });
});
