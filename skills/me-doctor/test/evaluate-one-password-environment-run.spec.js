import assert from 'node:assert/strict';

import evaluateOnePasswordEnvironmentRun from '../utils/evaluate-one-password-environment-run.js';

describe('skills/me-doctor/utils/evaluate-one-password-environment-run', () => {
  it('should pass only the expected present and matching sentinel result', () => {
    assert.deepEqual(
      evaluateOnePasswordEnvironmentRun(
        { matches: true, present: true },
        'READINESS_AUTHORIZATION_CODE',
      ),
      {
        message: '1Password Environment provided the expected readiness authorization sentinel.',
        status: 'pass',
      },
    );
  });

  it('should distinguish missing and mismatched sentinel results', () => {
    assert.match(
      evaluateOnePasswordEnvironmentRun({}, 'READINESS_AUTHORIZATION_CODE').message,
      /was not provided/,
    );
    assert.match(
      evaluateOnePasswordEnvironmentRun(
        { matches: false, present: true },
        'READINESS_AUTHORIZATION_CODE',
      ).message,
      /did not match/,
    );
  });
});
