import assert from 'node:assert/strict';

import stripStowSimulationNoise from '../utils/strip-stow-simulation-noise.js';

describe('utils/strip-stow-simulation-noise', () => {
  it('should treat a cancelled restow pair as an unchanged layout', () => {
    assert.equal(
      stripStowSimulationNoise(
        [
          'UNLINK: .codex/config.shared.toml',
          'LINK: .codex/config.shared.toml => ../../dotfiles/ai/.codex/config.shared.toml (reverts previous action)',
          'WARNING: in simulation mode so not modifying filesystem.',
        ].join('\n'),
      ),
      '',
    );
  });

  it('should preserve real link changes, unmatched unlinks, and conflicts', () => {
    const changes =
      'UNLINK: .codex/obsolete\nLINK: .codex/new => ../../dotfiles/ai/.codex/new\nWARNING! conflicts';
    assert.equal(stripStowSimulationNoise(changes), changes);
    const unmatched = 'LINK: .codex/new => ../../dotfiles/ai/.codex/new (reverts previous action)';
    assert.equal(stripStowSimulationNoise(unmatched), unmatched);
  });
});
