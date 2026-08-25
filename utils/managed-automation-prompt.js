const MANAGED_PREFIX = 'Managed by pirog/me AUTOMATIONS.yaml';
const MANAGED_PATTERN =
  /^Managed by pirog\/me AUTOMATIONS\.yaml \(id: ([a-z0-9]+(?:-[a-z0-9]+)*)\)\.\n\n/;

/**
 * Add the stable repository ownership marker to an automation prompt.
 *
 * @param {string} manifestId Stable manifest task id.
 * @param {string} prompt User-authored prompt content.
 * @returns {string} Managed prompt sent to Codex.
 */
export function buildManagedAutomationPrompt(manifestId, prompt) {
  return `${MANAGED_PREFIX} (id: ${manifestId}).\n\n${prompt.trim()}`;
}

/**
 * Classify an automation prompt without claiming malformed markers.
 *
 * @param {string} prompt Automation prompt returned by Codex.
 * @returns {{managed: boolean, malformed: boolean, manifestId: string | null}} Marker result.
 */
export function parseManagedAutomationPrompt(prompt) {
  const value = String(prompt ?? '');
  const match = value.match(MANAGED_PATTERN);
  if (match) {
    return { managed: true, malformed: false, manifestId: match[1] };
  }

  return {
    managed: false,
    malformed: value.startsWith(MANAGED_PREFIX),
    manifestId: null,
  };
}
