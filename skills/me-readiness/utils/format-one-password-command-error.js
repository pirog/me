function formatErrorDetail(error) {
  const stderr = typeof error?.stderr === 'string' ? error.stderr : '';
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (stderr || message).replace(/\s+/g, ' ').trim();
}

/**
 * Converts a failed 1Password vault command into user-facing readiness guidance.
 *
 * @param {unknown} error Command failure.
 * @returns {{message: string, remediation: string}} Warning fields.
 */
export default function formatOnePasswordCommandError(error) {
  const detail = formatErrorDetail(error);
  return /couldn'?t connect to the 1Password desktop app/i.test(detail)
    ? {
        message: '1Password CLI could not connect to the desktop app from this process.',
        remediation:
          'If this was sandboxed, rerun readiness with unsandboxed local access. Otherwise open and unlock 1Password and enable CLI integration.',
      }
    : {
        message: '1Password CLI vault access check failed.',
        remediation: 'Open and unlock 1Password, enable CLI integration, then rerun op vault list.',
      };
}
