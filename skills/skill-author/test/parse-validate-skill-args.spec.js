import assert from 'node:assert/strict';

import parseValidateSkillArgs from '../utils/parse-validate-skill-args.js';

describe('skills/skill-author/utils/parse-validate-skill-args', () => {
  it('should parse validator values and help', () => {
    assert.deepEqual(parseValidateSkillArgs(['--skill-dir', '/skill', '--help']), {
      help: true,
      skillDir: '/skill',
    });
  });

  it('should reject missing values', () => {
    assert.throws(() => parseValidateSkillArgs(['--type']), /Missing value/);
  });
});
