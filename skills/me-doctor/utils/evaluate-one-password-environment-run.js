/**
 * Evaluates the data-only 1Password Environment authorization result.
 *
 * @param {unknown} result Parsed command output.
 * @param {string} authorizationCodeKey Expected environment key name.
 * @returns {{message: string, remediation?: string, status: 'pass' | 'warn'}} Check fields.
 */
export default function evaluateOnePasswordEnvironmentRun(result, authorizationCodeKey) {
  if (!result || typeof result !== 'object') {
    return {
      message: '1Password Environment readiness output was not a JSON object.',
      remediation: 'Confirm the readiness Environment is accessible through 1Password Developer.',
      status: 'warn',
    };
  }
  if (result.present !== true || result.matches !== true) {
    return {
      message:
        result.present === true
          ? `${authorizationCodeKey} did not match the expected readiness sentinel.`
          : `${authorizationCodeKey} was not provided by the 1Password Environment.`,
      remediation:
        'Confirm the readiness Environment contains the expected authorization sentinel.',
      status: 'warn',
    };
  }
  return {
    message: '1Password Environment provided the expected readiness authorization sentinel.',
    status: 'pass',
  };
}
