/**
 * Parse YAML through the Bun runtime required by Skill Author.
 *
 * @param {unknown} content YAML source text.
 * @returns {unknown} Parsed YAML value.
 * @throws {Error} When Bun YAML support is unavailable or the source is invalid.
 */
export default function parseYaml(content) {
  const parser = globalThis.Bun?.YAML?.parse;
  if (typeof parser !== 'function') {
    throw new Error('Skill Author requires Bun YAML support.');
  }

  return parser(String(content ?? ''));
}
