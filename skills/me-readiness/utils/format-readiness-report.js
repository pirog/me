/**
 * Serializes a readiness report as stable newline-terminated JSON.
 *
 * @param {object} report Readiness report.
 * @returns {string} Pretty JSON with one trailing newline.
 */
export default function formatReadinessReport(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}
