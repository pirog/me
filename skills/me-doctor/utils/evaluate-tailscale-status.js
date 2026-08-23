/**
 * Evaluates parsed Tailscale status without performing command or network access.
 *
 * @param {unknown} status Parsed `tailscale status --json` output.
 * @param {object} options Expected tailnet and remediation text.
 * @returns {{message: string, remediation?: string, status: 'pass' | 'warn'}} Check fields.
 */
export default function evaluateTailscaleStatus(status, { expectedTailnetName, remediation }) {
  const issues = [];
  if (!status || typeof status !== 'object') {
    issues.push('status output was not a JSON object');
  } else {
    if (status.BackendState !== 'Running') issues.push('backend is not running');
    if (status.Self?.Online !== true) issues.push('local node is not online');
    if (status.Self?.InNetworkMap !== true) issues.push('local node is not in the network map');
    if (!Array.isArray(status.TailscaleIPs) || status.TailscaleIPs.length === 0) {
      issues.push('no Tailscale IPs are assigned');
    }
    if (status.CurrentTailnet?.Name !== expectedTailnetName) {
      issues.push(`tailnet is "${String(status.CurrentTailnet?.Name ?? 'missing')}"`);
    }
  }

  return issues.length === 0
    ? {
        message: `Tailscale is running on the ${expectedTailnetName} tailnet.`,
        status: 'pass',
      }
    : {
        message: `Tailscale is not ready: ${issues.join('; ')}.`,
        remediation,
        status: 'warn',
      };
}
