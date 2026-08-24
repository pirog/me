import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

import buildDoctorReport, {
  DOCTOR_CHECK_IDS,
  DOCTOR_GROUP_ORDER,
  DOCTOR_REMEDIATION_IDS,
  getDoctorCheckDefinition,
  getDoctorRemediation,
} from '../utils/build-doctor-report.js';

const SOURCE = {
  agentboxHost: false,
  homeDir: '/Users/tester',
  kind: 'live',
  repoRoot: '/repo/me',
};

describe('skills/me-doctor/utils/build-doctor-report', () => {
  it('should group failures and warnings into a stable diagnostic contract', () => {
    const report = buildDoctorReport(
      [
        {
          bucket: 'homebrew',
          id: 'command_brew',
          status: 'pass',
          message: 'Homebrew is available.',
        },
        {
          bucket: 'packages',
          id: 'brewfile_formulas_installed',
          status: 'fail',
          message: 'A formula is missing.',
          remediation: 'Legacy remediation.',
        },
        {
          bucket: 'manual_apps',
          id: 'tailscale_status',
          status: 'warn',
          message: 'Tailscale is disconnected.',
          remediation: 'Legacy remediation.',
        },
      ],
      SOURCE,
    );

    assert.equal(report.schemaVersion, 1);
    assert.equal(report.status, 'not_ready');
    assert.equal(report.ok, false);
    assert.deepEqual(report.source, SOURCE);
    assert.deepEqual(report.summary, { groups: 5, passed: 1, failed: 1, warnings: 1 });
    assert.deepEqual(
      report.groups.map((group) => group.id),
      DOCTOR_GROUP_ORDER,
    );
    assert.equal(report.issues[0].key, 'brewfile_formulas_installed');
    assert.equal(report.issues[0].remediation.kind, 'reconcile');
    assert.equal(report.warnings[0].key, 'tailscale_status');
    assert.equal(report.warnings[0].remediation.kind, 'manual');
  });

  it('should reject checks that are not declared in the catalog', () => {
    assert.throws(
      () =>
        buildDoctorReport(
          [{ bucket: 'unknown', id: 'unknown_check', status: 'fail', message: 'Unknown.' }],
          SOURCE,
        ),
      /No Me Doctor catalog entry/,
    );
  });

  it('should reject unknown statuses and contradictory groups', () => {
    assert.throws(
      () =>
        buildDoctorReport(
          [{ bucket: 'homebrew', id: 'command_brew', status: 'unknown', message: 'Unknown.' }],
          SOURCE,
        ),
      /Unsupported Me Doctor check status/,
    );
    assert.throws(
      () =>
        buildDoctorReport(
          [{ bucket: 'packages', id: 'command_brew', status: 'fail', message: 'Wrong group.' }],
          SOURCE,
        ),
      /reported group packages, expected homebrew/,
    );
  });

  it('should provide safe structured remediation for every declared check', () => {
    assert.deepEqual([...DOCTOR_REMEDIATION_IDS].sort(), [...DOCTOR_CHECK_IDS].sort());

    for (const id of DOCTOR_CHECK_IDS) {
      assert.equal(getDoctorCheckDefinition(id).id, id);
      const remediation = getDoctorRemediation(id);
      assert.ok(['command', 'investigate', 'manual', 'reconcile'].includes(remediation.kind), id);
      assert.notEqual(remediation.summary.trim(), '', id);
      assert.equal(typeof remediation.requiresConfirmation, 'boolean', id);

      if (remediation.command) {
        assert.doesNotMatch(remediation.command, /\{\{/);
        assert.equal(spawnSync('bash', ['-n', '-c', remediation.command]).status, 0, id);
      }
    }
  });
});
