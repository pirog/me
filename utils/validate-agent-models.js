const TIERS = ['low', 'medium', 'high'];

function assertKeys(value, keys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a mapping.`);
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) throw new Error(`${label} has an unknown key: ${key}`);
  }
}

/** Validate only the manifest model section; identity and runtime setup belong to Agent System. */
export default function validateAgentModels(models) {
  assertKeys(models, ['default', ...TIERS], 'models');
  const tiers = TIERS.filter((tier) => Object.hasOwn(models, tier));
  if (tiers.length !== 0 && tiers.length !== TIERS.length) {
    throw new Error('models must contain all complexity tiers or none.');
  }
  for (const name of ['default', ...tiers]) {
    const profile = models[name];
    assertKeys(profile, ['model', 'effort'], `models.${name}`);
    if (typeof profile.model !== 'string' || !/^[^/@\s]+\/[^@\s]+$/.test(profile.model)) {
      throw new Error(`models.${name}.model must be a provider-qualified model reference.`);
    }
    if (!['medium', 'high', 'xhigh'].includes(profile.effort)) {
      throw new Error(`models.${name}.effort must be medium, high, or xhigh.`);
    }
  }
  return models;
}
