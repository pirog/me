import { CANON_DESCRIPTION_PREFIX } from '../lib/skill-identity.js';

/**
 * Normalizes a description to the canonical owner prefix.
 *
 * @param {string} value Raw skill description.
 * @returns {string} Canonical description.
 */
export default function normalizeSkillDescription(value) {
  const trimmed = String(value ?? '').trim();
  const withoutPrefix = trimmed.replace(/^piro(?:[- ]?based)\s+/i, '');
  return `${CANON_DESCRIPTION_PREFIX}${withoutPrefix}`;
}

/**
 * Fits a canonical skill description into the OpenAI metadata length limit.
 *
 * @param {string} description Canonical or unprefixed skill description.
 * @returns {string} Description capped at 64 characters.
 */
export function makeShortSkillDescription(description) {
  const cleaned = normalizeSkillDescription(description).replace(/\.$/, '');
  if (cleaned.length <= 64) return cleaned;

  const remainder = cleaned.slice(CANON_DESCRIPTION_PREFIX.length);
  const maxRemainderLength = 64 - CANON_DESCRIPTION_PREFIX.length - 3;
  return `${CANON_DESCRIPTION_PREFIX}${remainder.slice(0, maxRemainderLength).trimEnd()}...`;
}

/**
 * Creates a default prompt that names the generated skill explicitly.
 *
 * @param {string} skillId Canonical owner-prefixed skill id.
 * @param {string} description Canonical or unprefixed skill description.
 * @returns {string} Default agent prompt.
 */
export function makeSkillDefaultPrompt(skillId, description) {
  const cleaned = String(description ?? '')
    .trim()
    .replace(/^piro(?:[- ]?based)\s+/i, '')
    .replace(/\.$/, '');
  const normalized = cleaned ? `${cleaned[0].toLowerCase()}${cleaned.slice(1)}` : cleaned;
  return `Use $${skillId} when you need to ${normalized}.`;
}
