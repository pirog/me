import assert from 'node:assert/strict';

import formatDoctorReport from '../utils/format-doctor-report.js';

describe('skills/me-doctor/utils/format-doctor-report', () => {
  it('should produce stable newline-terminated JSON', () => {
    assert.equal(
      formatDoctorReport({ checks: [], ok: true }),
      '{\n  "checks": [],\n  "ok": true\n}\n',
    );
  });
});
