import assert from 'node:assert/strict';

import parseInitSkillArgs from '../utils/parse-init-skill-args.js';

describe('skills/skill-author/utils/parse-init-skill-args', () => {
  it('should parse defaults, values, force, and help', () => {
    assert.deepEqual(parseInitSkillArgs(['--slug', 'probe', '--force', '--help'], '/skills'), {
      force: true,
      help: true,
      outputDir: '/skills',
      slug: 'probe',
      type: 'generic',
    });
  });

  it('should reject positional arguments and missing values', () => {
    assert.throws(() => parseInitSkillArgs(['probe'], '/skills'), /Positional arguments/);
    assert.throws(() => parseInitSkillArgs(['--slug'], '/skills'), /Missing value/);
  });
});
