/**
 * Serializes a Me Doctor report as stable newline-terminated JSON.
 *
 * @param {object} report Me Doctor report.
 * @returns {string} Pretty JSON with one trailing newline.
 */
export default function formatDoctorReport(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}
