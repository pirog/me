import assert from 'node:assert/strict';

import renderOpenClawMetadataYaml from '../utils/render-openclaw-metadata-yaml.js';

describe('skills/skill-author/utils/render-openclaw-metadata-yaml', () => {
  it('should render required and optional presentation metadata', () => {
    assert.equal(
      renderOpenClawMetadataYaml({ emoji: '🧪', homepage: 'https://example.com/skill' }),
      ['  openclaw:', '    emoji: "🧪"', '    homepage: "https://example.com/skill"'].join('\n'),
    );
  });

  it('should reject invalid presentation metadata', () => {
    assert.throws(() => renderOpenClawMetadataYaml({ emoji: '' }), /must not be empty/);
    assert.throws(
      () => renderOpenClawMetadataYaml({ emoji: '🧪', homepage: 'not-a-url' }),
      /HTTP\(S\)/,
    );
  });
});
