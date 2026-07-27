import assert from 'node:assert/strict';

import validateOpenClawMetadata from '../utils/validate-openclaw-metadata.js';

describe('skills/skill-author/utils/validate-openclaw-metadata', () => {
  it('should accept supported metadata and preserve an optional homepage', () => {
    assert.deepEqual(
      validateOpenClawMetadata({
        emoji: '🧪',
        homepage: 'https://example.com/skill',
        os: ['darwin'],
        requires: { bins: ['bun'] },
      }),
      { errors: [], warnings: [] },
    );
  });

  it('should report malformed gates and a missing stable homepage', () => {
    const findings = validateOpenClawMetadata({
      always: 'sometimes',
      emoji: '',
      os: ['plan9'],
      requires: { bins: 'bun' },
    });

    assert.match(findings.errors.join('\n'), /emoji must be a non-empty string/);
    assert.match(findings.errors.join('\n'), /darwin, linux, or win32/);
    assert.match(findings.errors.join('\n'), /requires\.bins must be a non-empty list/);
    assert.match(findings.errors.join('\n'), /always must be `true` or `false`/);
    assert.deepEqual(findings.warnings, [
      'Add metadata.openclaw.homepage when the skill has a stable public URL.',
    ]);
  });
});
