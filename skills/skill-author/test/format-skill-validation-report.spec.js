import assert from 'node:assert/strict';

import formatSkillValidationReport from '../utils/format-skill-validation-report.js';

describe('skills/skill-author/utils/format-skill-validation-report', () => {
  it('should render stable status and finding lists', () => {
    assert.equal(
      formatSkillValidationReport({
        errors: [],
        manualChecks: ['Review scope.'],
        skillDir: '/tmp/skill',
        warnings: ['Review metadata.'],
      }),
      [
        'skill: /tmp/skill',
        'status: ok',
        'errors: none',
        'warnings:\n- Review metadata.',
        'manual_checks:\n- Review scope.',
      ].join('\n'),
    );
  });
});
