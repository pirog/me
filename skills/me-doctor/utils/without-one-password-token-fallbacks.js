import findOnePasswordTokenEnvKeys from './find-one-password-token-env-keys.js';

/**
 * Clones an environment without 1Password token or session fallbacks.
 *
 * @param {object} env Environment-like object.
 * @returns {object} Sanitized environment clone.
 */
export default function withoutOnePasswordTokenFallbacks(env) {
  const commandEnv = { ...env };
  for (const key of findOnePasswordTokenEnvKeys(env)) delete commandEnv[key];
  return commandEnv;
}
