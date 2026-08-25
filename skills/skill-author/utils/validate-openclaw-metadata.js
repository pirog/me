const OPENCLAW_REQUIREMENT_LIST_KEYS = ['bins', 'anyBins', 'env', 'config'];
const OPENCLAW_SUPPORTED_OS = new Set(['darwin', 'linux', 'win32']);

function normalizeString(value) {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

function isHttpUrl(value) {
  const normalized = normalizeString(value);
  if (!normalized) return false;

  try {
    const parsed = new URL(normalized);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function validateStringList(value, fieldPath, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${fieldPath} must be a non-empty list of strings when present.`);
    return;
  }

  if (value.some((entry) => typeof entry !== 'string' || !entry.trim())) {
    errors.push(`${fieldPath} must contain only non-empty strings.`);
  }
}

/**
 * Validates the Piro OpenClaw skill metadata contract.
 *
 * @param {unknown} openClaw Parsed metadata.openclaw value.
 * @returns {{errors: string[], warnings: string[]}} Validation findings.
 */
export default function validateOpenClawMetadata(openClaw) {
  const errors = [];
  const warnings = [];

  if (!openClaw || typeof openClaw !== 'object' || Array.isArray(openClaw)) {
    errors.push('SKILL.md frontmatter metadata.openclaw must be a mapping.');
    return { errors, warnings };
  }

  if (!normalizeString(openClaw.emoji)) {
    errors.push('SKILL.md frontmatter metadata.openclaw.emoji must be a non-empty string.');
  }

  if (Object.hasOwn(openClaw, 'homepage')) {
    if (!isHttpUrl(openClaw.homepage)) {
      errors.push('SKILL.md frontmatter metadata.openclaw.homepage must be an HTTP(S) URL.');
    }
  } else {
    warnings.push('Add metadata.openclaw.homepage when the skill has a stable public URL.');
  }

  if (Object.hasOwn(openClaw, 'os')) {
    validateStringList(openClaw.os, 'metadata.openclaw.os', errors);
    if (
      Array.isArray(openClaw.os) &&
      openClaw.os.some((platform) => !OPENCLAW_SUPPORTED_OS.has(platform))
    ) {
      errors.push('metadata.openclaw.os may contain only darwin, linux, or win32.');
    }
  }

  if (Object.hasOwn(openClaw, 'always') && typeof openClaw.always !== 'boolean') {
    errors.push('metadata.openclaw.always must be `true` or `false` when present.');
  }

  if (Object.hasOwn(openClaw, 'primaryEnv') && !normalizeString(openClaw.primaryEnv)) {
    errors.push('metadata.openclaw.primaryEnv must be a non-empty string when present.');
  }

  if (Object.hasOwn(openClaw, 'requires')) {
    const requirements = openClaw.requires;
    if (!requirements || typeof requirements !== 'object' || Array.isArray(requirements)) {
      errors.push('metadata.openclaw.requires must be a mapping when present.');
    } else {
      for (const key of OPENCLAW_REQUIREMENT_LIST_KEYS) {
        if (Object.hasOwn(requirements, key)) {
          validateStringList(requirements[key], `metadata.openclaw.requires.${key}`, errors);
        }
      }
    }
  }

  if (Object.hasOwn(openClaw, 'install')) {
    if (!Array.isArray(openClaw.install) || openClaw.install.length === 0) {
      errors.push('metadata.openclaw.install must be a non-empty list when present.');
    }
  }

  return { errors, warnings };
}
