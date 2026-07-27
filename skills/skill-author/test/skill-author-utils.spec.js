import assert from 'node:assert/strict';

import extractRelativeMarkdownLinks from '../utils/extract-relative-markdown-links.js';
import hasOrderedSkillSections from '../utils/has-ordered-skill-sections.js';
import parseOpenAiSkillMetadata from '../utils/parse-openai-skill-metadata.js';
import parseSkillFrontmatter from '../utils/parse-skill-frontmatter.js';
import {
  makeOpenClawHomepage,
  normalizePirobasedDescription,
  renderOpenClawMetadataYaml,
} from '../utils/skill-scaffolding.js';

describe('skills/skill-author utilities', () => {
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

  it('should parse OpenAI interface, policy, and tool metadata', () => {
    const parsed = parseOpenAiSkillMetadata(`interface:
  display_name: "Probe"
policy:
  allow_implicit_invocation: false
dependencies:
  tools:
    - type: "mcp"
      value: "probe"
`);

    assert.deepEqual(parsed.interfaceValues, { display_name: 'Probe' });
    assert.deepEqual(parsed.policyValues, { allow_implicit_invocation: 'false' });
    assert.deepEqual(parsed.dependencyTools, [{ type: 'mcp', value: 'probe' }]);
    assert.equal(parsed.hasDependencyToolsSection, true);
  });

  it('should allow declared optional sections but reject reordered sections', () => {
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

  it('should keep scaffolding normalization and source URLs deterministic', () => {
    assert.equal(
      normalizePirobasedDescription('Piro-based validate this surface'),
      'Pirobased validate this surface',
    );
    assert.equal(
      makeOpenClawHomepage('git@github.com:pirog/example.git', 'skills/example'),
      'https://github.com/pirog/example/tree/main/skills/example',
    );
    assert.equal(renderOpenClawMetadataYaml({ emoji: '🧪' }), '  openclaw:\n    emoji: "🧪"');
  });

  it('should extract only relative Markdown links', () => {
    assert.deepEqual(
      extractRelativeMarkdownLinks(
        '[local](./reference.md) [anchor](#part) [external](https://example.com)',
      ),
      ['./reference.md'],
    );
  });
});
