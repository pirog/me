import { readFile } from 'node:fs/promises';
import path from 'node:path';

import validateModelRoutingPolicy from '../utils/validate-model-routing-policy.js';

/**
 * Read and validate the policy from the owning checkout or installed plugin root.
 *
 * @param {string | URL} root Repository/plugin root, not the task's working directory.
 * @returns {Promise<object>} Validated routing policy.
 * @throws {Error} When the policy cannot be read or validated.
 */
export async function loadModelRoutingPolicy(root = new URL('../', import.meta.url)) {
  const policyPath =
    root instanceof URL
      ? new URL('MODEL_ROUTING.yaml', root)
      : path.join(root, 'MODEL_ROUTING.yaml');
  return validateModelRoutingPolicy(globalThis.Bun.YAML.parse(await readFile(policyPath, 'utf8')));
}

/**
 * Project shared defaults into native Codex configuration keys.
 *
 * @param {object} policy Shared model policy.
 * @returns {object} Portable native model, effort, service-tier and Fast-feature settings.
 * @throws {Error} When the policy is invalid.
 */
export function modelRoutingConfig(policy) {
  const { defaults } = validateModelRoutingPolicy(policy);
  return {
    model: defaults.model,
    model_reasoning_effort: defaults.effort,
    service_tier: defaults['fast-mode'] ? 'fast' : 'default',
    features: { fast_mode: defaults['fast-mode'] },
  };
}
