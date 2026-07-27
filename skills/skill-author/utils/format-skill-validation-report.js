function formatList(title, items) {
  if (items.length === 0) {
    return `${title}: none`;
  }

  return `${title}:\n${items.map((item) => `- ${item}`).join('\n')}`;
}

/**
 * Renders a data-only skill validation result for command output.
 *
 * @param {{errors: string[], manualChecks: string[], skillDir: string, warnings: string[]}} result Validation result.
 * @returns {string} Stable human-readable report.
 */
export default function formatSkillValidationReport(result) {
  return [
    `skill: ${result.skillDir}`,
    `status: ${result.errors.length === 0 ? 'ok' : 'failed'}`,
    formatList('errors', result.errors),
    formatList('warnings', result.warnings),
    formatList('manual_checks', result.manualChecks),
  ].join('\n');
}
