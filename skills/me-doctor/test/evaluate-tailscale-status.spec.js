import assert from 'node:assert/strict';

import evaluateTailscaleStatus from '../utils/evaluate-tailscale-status.js';

const OPTIONS = {
  expectedTailnetName: 'tanaab.dev',
  remediation: 'Connect Tailscale.',
};

describe('skills/me-doctor/utils/evaluate-tailscale-status', () => {
  it('should pass a complete online status on the expected tailnet', () => {
    assert.deepEqual(
      evaluateTailscaleStatus(
        {
          BackendState: 'Running',
          CurrentTailnet: { Name: 'tanaab.dev' },
          Self: { InNetworkMap: true, Online: true },
          TailscaleIPs: ['100.64.0.1'],
        },
        OPTIONS,
      ),
      {
        message: 'Tailscale is running on the tanaab.dev tailnet.',
        status: 'pass',
      },
    );
  });

  it('should summarize every incomplete status condition', () => {
    const result = evaluateTailscaleStatus({}, OPTIONS);

    assert.equal(result.status, 'warn');
    assert.match(result.message, /backend is not running/);
    assert.match(result.message, /tailnet is "missing"/);
    assert.equal(result.remediation, 'Connect Tailscale.');
  });
});
