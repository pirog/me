import assert from 'node:assert/strict';

import parseOpenAiSkillMetadata from '../utils/parse-openai-skill-metadata.js';

describe('skills/skill-author/utils/parse-openai-skill-metadata', () => {
  it('should parse interface, policy, and dependency tool metadata', () => {
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
    assert.deepEqual(parsed.policyValues, { allow_implicit_invocation: false });
    assert.deepEqual(parsed.dependencyTools, [{ type: 'mcp', value: 'probe' }]);
    assert.equal(parsed.hasDependencyToolsSection, true);
  });
});
