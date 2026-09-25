import assert from 'node:assert/strict';

import isExpectedPluginOrigin from '../utils/is-expected-plugin-origin.js';

describe('utils/is-expected-plugin-origin', () => {
  it('accepts only the intended Tanaab checkout', () => {
    assert.equal(isExpectedPluginOrigin('git@github.com:tanaabased/canon.git', 'canon'), true);
    assert.equal(isExpectedPluginOrigin('https://github.com/tanaabased/canon', 'canon'), true);
    assert.equal(isExpectedPluginOrigin('git@github.com:elsewhere/canon.git', 'canon'), false);
    assert.equal(
      isExpectedPluginOrigin('git@github.com:tanaabased/canon-extra.git', 'canon'),
      false,
    );
  });
});
