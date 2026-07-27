/**
 * Replaces canonical lowercase template tokens while preserving unknown tokens.
 *
 * @param {string} template Template body.
 * @param {object} replacements Token values.
 * @returns {string} Rendered content.
 */
export default function renderSkillTemplate(template, replacements) {
  return String(template ?? '').replaceAll(
    /\{\{([a-z_]+)\}\}/g,
    (match, key) => replacements[key] ?? match,
  );
}
