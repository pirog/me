import assert from 'node:assert/strict';

import withoutOnePasswordTokenFallbacks from '../utils/without-one-password-token-fallbacks.js';

describe('skills/me-readiness/utils/without-one-password-token-fallbacks', () => {
  it('should return a sanitized clone without mutating the input', () => {
    const env = { OP_CONNECT_TOKEN: 'secret', PATH: '/bin' };

    assert.deepEqual(withoutOnePasswordTokenFallbacks(env), { PATH: '/bin' });
    assert.deepEqual(env, { OP_CONNECT_TOKEN: 'secret', PATH: '/bin' });
  });
});
