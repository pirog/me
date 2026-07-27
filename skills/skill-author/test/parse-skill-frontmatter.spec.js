import assert from 'node:assert/strict';

import parseSkillFrontmatter from '../utils/parse-skill-frontmatter.js';

describe('skills/skill-author/utils/parse-skill-frontmatter', () => {
  it('should parse nested skill metadata without accepting body content', () => {
    const frontmatter = parseSkillFrontmatter(`---
name: piro-probe
metadata:
  tags:
    - pirog
    - generic
  openclaw:
    emoji: "🧩"
---
# Probe
`);

    assert.deepEqual(frontmatter, {
      metadata: {
        openclaw: { emoji: '🧩' },
        tags: ['pirog', 'generic'],
      },
      name: 'piro-probe',
    });
  });
});
