function normalizeString(value) {
  return typeof value === 'string' ? value.trim() || null : null;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Renders the generated OpenClaw presentation metadata block.
 *
 * @param {object} metadata OpenClaw presentation values.
 * @returns {string} Indented metadata.openclaw YAML.
 * @throws {Error} When the emoji is empty or the homepage is not HTTP(S).
 */
export default function renderOpenClawMetadataYaml({ emoji, homepage }) {
  const normalizedEmoji = normalizeString(emoji);
  const normalizedHomepage = normalizeString(homepage);

  if (!normalizedEmoji) throw new Error('OpenClaw emoji must not be empty.');
  if (normalizedHomepage && !isHttpUrl(normalizedHomepage)) {
    throw new Error('OpenClaw homepage must be an HTTP(S) URL.');
  }

  const lines = ['  openclaw:', `    emoji: ${JSON.stringify(normalizedEmoji)}`];
  if (normalizedHomepage) lines.push(`    homepage: ${JSON.stringify(normalizedHomepage)}`);
  return lines.join('\n');
}
