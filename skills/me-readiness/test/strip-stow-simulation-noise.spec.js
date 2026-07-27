import assert from 'node:assert/strict';

import stripStowSimulationNoise from '../utils/strip-stow-simulation-noise.js';

describe('skills/me-readiness/utils/strip-stow-simulation-noise', () => {
  it('should remove only the simulation disclaimer', () => {
    assert.equal(
      stripStowSimulationNoise(
        'LINK: target\nWARNING: in simulation mode so not modifying filesystem.\n',
      ),
      'LINK: target',
    );
  });
});
