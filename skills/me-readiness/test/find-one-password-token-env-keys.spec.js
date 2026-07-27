import assert from 'node:assert/strict';

import findOnePasswordTokenEnvKeys from '../utils/find-one-password-token-env-keys.js';

describe('skills/me-readiness/utils/find-one-password-token-env-keys', () => {
  it('should identify known token and account-scoped session keys', () => {
    assert.deepEqual(
      findOnePasswordTokenEnvKeys({
        OP_SERVICE_ACCOUNT_TOKEN: 'secret',
        OP_SESSION_example: 'session',
        PATH: '/bin',
      }),
      ['OP_SERVICE_ACCOUNT_TOKEN', 'OP_SESSION_example'],
    );
  });
});
