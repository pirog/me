import assert from 'node:assert/strict';

import { loadModelRoutingPolicy, modelRoutingConfig } from '../lib/model-routing-policy.js';
import validateModelRoutingPolicy from '../utils/validate-model-routing-policy.js';

describe('lib/model-routing-policy', () => {
  it('should retain the approved initial complexity mappings', async () => {
    const policy = await loadModelRoutingPolicy();
    assert.deepEqual(policy.complexity, {
      low: { model: 'gpt-5.6-terra', effort: 'medium' },
      medium: { model: 'gpt-5.6-sol', effort: 'high' },
      high: { model: 'gpt-6-astra', effort: 'high' },
    });
  });

  it('should project the approved defaults with Fast disabled', async () => {
    assert.deepEqual(modelRoutingConfig(await loadModelRoutingPolicy()), {
      model: 'gpt-6-astra',
      model_reasoning_effort: 'high',
      service_tier: 'default',
      features: { fast_mode: false },
    });
  });

  it('should allow configurable models and supported automatic efforts without mutating input', async () => {
    const policy = await loadModelRoutingPolicy();
    policy.defaults.model = 'future-model';
    policy.defaults.effort = 'medium';
    const before = structuredClone(policy);
    assert.equal(modelRoutingConfig(policy).model, 'future-model');
    assert.deepEqual(policy, before);
  });

  for (const [label, mutate] of [
    ['incomplete tiers', (policy) => delete policy.complexity.low],
    [
      'unknown tiers',
      (policy) => {
        policy.complexity.extreme = policy.complexity.high;
      },
    ],
    [
      'unsupported schema',
      (policy) => {
        policy['schema-version'] = 2;
      },
    ],
    [
      'unsupported automatic effort',
      (policy) => {
        policy.defaults.effort = 'ultra';
      },
    ],
    [
      'invalid effort allowlist',
      (policy) => {
        policy['allowed-efforts'] = ['ultra'];
      },
    ],
    [
      'duplicate effort allowlist',
      (policy) => {
        policy['allowed-efforts'] = ['high', 'high'];
      },
    ],
    [
      'malformed model',
      (policy) => {
        policy.defaults.model = 'model with spaces';
      },
    ],
    [
      'nonboolean Fast setting',
      (policy) => {
        policy.defaults['fast-mode'] = 'false';
      },
    ],
    [
      'unexplained xhigh',
      (policy) => {
        policy.complexity.high.effort = 'xhigh';
      },
    ],
  ]) {
    it(`should reject ${label}`, async () => {
      const policy = await loadModelRoutingPolicy();
      mutate(policy);
      assert.throws(() => validateModelRoutingPolicy(policy));
    });
  }

  it('should allow xhigh only with an explicit configured reason', async () => {
    const policy = await loadModelRoutingPolicy();
    policy.complexity.high.effort = 'xhigh';
    policy.complexity.high.reason = 'Operator-selected experiment for difficult proof obligations.';
    assert.equal(validateModelRoutingPolicy(policy).complexity.high.effort, 'xhigh');
  });
});
