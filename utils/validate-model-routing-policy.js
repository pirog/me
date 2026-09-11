const EFFORTS = new Set(['medium', 'high', 'xhigh']);
const TIERS = ['low', 'medium', 'high'];

function assertKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a mapping.`);
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) throw new Error(`${label} has an unknown key: ${key}`);
  }
}

/**
 * Validate the portable, model-neutral tier policy without asserting host availability.
 *
 * @param {object} policy Parsed MODEL_ROUTING.yaml data.
 * @returns {object} The validated policy, without mutation.
 * @throws {Error} For malformed mappings, unsupported automatic efforts, or unexplained xhigh.
 */
export default function validateModelRoutingPolicy(policy) {
  assertKeys(policy, ['schema-version', 'defaults', 'allowed-efforts', 'complexity'], 'policy');
  if (policy['schema-version'] !== 1) throw new Error('policy schema-version must be 1.');
  const efforts = policy['allowed-efforts'];
  if (
    !Array.isArray(efforts) ||
    efforts.length === 0 ||
    new Set(efforts).size !== efforts.length ||
    efforts.some((effort) => !EFFORTS.has(effort))
  ) {
    throw new Error('allowed-efforts must be a nonempty unique subset of medium, high, xhigh.');
  }
  assertKeys(policy.complexity, TIERS, 'complexity');
  for (const [name, route] of [
    ['defaults', policy.defaults],
    ...TIERS.map((tier) => [`complexity.${tier}`, policy.complexity[tier]]),
  ]) {
    assertKeys(
      route,
      ['model', 'effort', 'reason', ...(name === 'defaults' ? ['fast-mode'] : [])],
      name,
    );
    if (typeof route.model !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(route.model)) {
      throw new Error(`${name}.model must be an exact nonempty model identifier.`);
    }
    if (!efforts.includes(route.effort)) throw new Error(`${name}.effort is not allowed.`);
    if (route.reason !== undefined && (typeof route.reason !== 'string' || !route.reason.trim())) {
      throw new Error(`${name}.reason must be a nonempty explanation.`);
    }
    if (route.effort === 'xhigh' && !route.reason) {
      throw new Error(`${name} requires a concrete reason for xhigh.`);
    }
  }
  if (typeof policy.defaults['fast-mode'] !== 'boolean') {
    throw new Error('defaults.fast-mode must be a boolean.');
  }
  return policy;
}
