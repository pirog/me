import assert from 'node:assert/strict';

import formatReadinessReport from '../utils/format-readiness-report.js';

describe('skills/me-readiness/utils/format-readiness-report', () => {
  it('should produce stable newline-terminated JSON', () => {
    assert.equal(
      formatReadinessReport({ checks: [], ok: true }),
      '{\n  "checks": [],\n  "ok": true\n}\n',
    );
  });
});
