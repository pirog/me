import assert from 'node:assert/strict';

import formatOnePasswordCommandError from '../utils/format-one-password-command-error.js';

describe('skills/me-doctor/utils/format-one-password-command-error', () => {
  it('should distinguish desktop connectivity failures from ordinary vault failures', () => {
    assert.match(
      formatOnePasswordCommandError({ stderr: "couldn't connect to the 1Password desktop app" })
        .message,
      /could not connect to the desktop app/,
    );
    assert.equal(
      formatOnePasswordCommandError(new Error('unauthorized')).message,
      '1Password CLI vault access check failed.',
    );
  });
});
