import { readFileSync } from 'node:fs';

const checkCatalog = JSON.parse(
  readFileSync(new URL('../references/checks.json', import.meta.url), 'utf8'),
);
const remediationCatalog = JSON.parse(
  readFileSync(new URL('../references/remediations.json', import.meta.url), 'utf8'),
);

export const DOCTOR_SCHEMA_VERSION = 1;
export const DOCTOR_GROUP_ORDER = Object.freeze(checkCatalog.groups.map((group) => group.id));

const CHECK_DEFINITIONS = new Map();
for (const group of checkCatalog.groups) {
  for (const check of group.checks) {
    if (CHECK_DEFINITIONS.has(check.id)) {
      throw new Error(`Duplicate Me Doctor check catalog entry ${check.id}.`);
    }
    CHECK_DEFINITIONS.set(check.id, { ...check, group: group.id, groupLabel: group.label });
  }
}

export const DOCTOR_CHECK_IDS = Object.freeze([...CHECK_DEFINITIONS.keys()]);
export const DOCTOR_REMEDIATION_IDS = Object.freeze(Object.keys(remediationCatalog));
const CHECK_STATUSES = new Set(['fail', 'pass', 'warn']);

function statusFor(checks) {
  if (checks.some((check) => check.status === 'fail')) return 'not_ready';
  if (checks.some((check) => check.status === 'warn')) return 'warning';
  return 'ready';
}

function remediationFor(id) {
  const remediation = remediationCatalog[id];
  if (!remediation) {
    return {
      kind: 'investigate',
      summary: 'Inspect the failing check before choosing a repair.',
      command: null,
      requiresConfirmation: false,
    };
  }

  return {
    kind: remediation.kind,
    summary: remediation.summary,
    command: remediation.command ?? null,
    requiresConfirmation: remediation.requiresConfirmation,
  };
}

export function getDoctorCheckDefinition(id) {
  const definition = CHECK_DEFINITIONS.get(id);
  if (!definition) {
    throw new Error(`No Me Doctor catalog entry assigned for check ${id}.`);
  }
  return definition;
}

export function getDoctorRemediation(id) {
  return remediationFor(id);
}

/**
 * Normalizes live profile checks into the versioned Me Doctor report contract.
 *
 * @param {Array<object>} checks Ordered live checks from the profile probe.
 * @param {object} source Non-secret facts about the live probe source.
 * @returns {object} Versioned, grouped diagnostic report.
 */
export default function buildDoctorReport(checks, source) {
  const checksByGroup = new Map(DOCTOR_GROUP_ORDER.map((id) => [id, []]));
  const normalizedChecks = checks.map((check) => {
    const definition = getDoctorCheckDefinition(check.id);
    if (!CHECK_STATUSES.has(check.status)) {
      throw new Error(`Unsupported Me Doctor check status ${check.status}.`);
    }
    if (check.bucket !== definition.group) {
      throw new Error(
        `Me Doctor check ${check.id} reported group ${check.bucket}, expected ${definition.group}.`,
      );
    }
    const normalized = { ...check, label: definition.label };
    checksByGroup.get(definition.group).push(normalized);
    return normalized;
  });

  const groups = checkCatalog.groups.map((definition) => {
    const groupChecks = checksByGroup.get(definition.id);
    const failed = groupChecks.filter((check) => check.status === 'fail').length;
    const warnings = groupChecks.filter((check) => check.status === 'warn').length;

    return {
      id: definition.id,
      label: definition.label,
      status: statusFor(groupChecks),
      passed: groupChecks.length - failed - warnings,
      failed,
      warnings,
      checks: groupChecks.map(({ id, label, message, status }) => ({
        id,
        label,
        status,
        message,
      })),
    };
  });

  const diagnosticsFor = (wantedStatus, severity) =>
    normalizedChecks
      .filter((check) => check.status === wantedStatus)
      .map((check) => {
        const definition = getDoctorCheckDefinition(check.id);
        return {
          severity,
          key: check.id,
          label: definition.label,
          group: definition.group,
          detail: check.message,
          remediation: remediationFor(check.id),
        };
      });

  const issues = diagnosticsFor('fail', 'failure');
  const warnings = diagnosticsFor('warn', 'warning');
  const status = statusFor(normalizedChecks);

  return {
    schemaVersion: DOCTOR_SCHEMA_VERSION,
    status,
    ok: status !== 'not_ready',
    source,
    summary: {
      groups: groups.length,
      passed: normalizedChecks.filter((check) => check.status === 'pass').length,
      failed: issues.length,
      warnings: warnings.length,
    },
    groups,
    issues,
    warnings,
    checks: normalizedChecks,
  };
}
