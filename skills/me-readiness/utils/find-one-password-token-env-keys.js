export const ONEPASSWORD_TOKEN_ENV_KEYS = [
  'PIROME_OP_TOKEN',
  'TANAAB_OP_TOKEN',
  'OP_SERVICE_ACCOUNT_TOKEN',
  'OP_CONNECT_TOKEN',
  'OP_SESSION',
];

/**
 * Finds 1Password token and session fallback keys without reading their values.
 *
 * @param {object} env Environment-like object.
 * @returns {string[]} Matching keys in object order.
 */
export default function findOnePasswordTokenEnvKeys(env) {
  return Object.keys(env).filter(
    (key) => ONEPASSWORD_TOKEN_ENV_KEYS.includes(key) || key.startsWith('OP_SESSION_'),
  );
}
