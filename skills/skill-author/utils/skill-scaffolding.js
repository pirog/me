import path from 'node:path';

import { CANON_DESCRIPTION_PREFIX, CANON_SKILL_OWNER } from '../lib/skill-identity.js';

const CATEGORY_INFERENCE_RULES = [
  ['validation', /\b(validat|verify|lint|check)\w*/],
  ['testing', /\b(test|coverage|assert|spec)\w*/],
  ['skills', /\b(skill|template|scaffold|creator|author|initializer|standardiz)\w*/],
  ['frontend', /\b(frontend|vue|react|component|css|scss|tailwind|vitepress)\w*/],
  ['design', /\b(design|brand|visual|ui|ux)\w*/],
  ['docs', /\b(doc|docs|documentation|readme|markdown|mdx|copy)\w*/],
  ['release', /\b(release|version|changelog|publish)\w*/],
  ['shell', /\b(shell|bash|zsh|cli|terminal|command[- ]line)\w*/],
  ['integration', /\b(github|gitlab|openai|api|mcp|webhook|integration)\w*/],
  ['coding', /\b(code|coding|typescript|javascript|bun|node|function|library)\w*/],
  ['research', /\b(research|investigat|audit|analysis)\w*/],
  ['automation', /\b(automate|automation|cron|scheduled|job|workflow)\w*/],
  ['meta', /\b(meta|canon|convention|prompt|template|packag|refin|standard)\w*/],
];

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

export function normalizePirobasedDescription(value) {
  const trimmed = String(value ?? '').trim();
  const withoutPrefix = trimmed.replace(/^piro(?:[- ]?based)\s+/i, '');
  return `${CANON_DESCRIPTION_PREFIX}${withoutPrefix}`;
}

export function makeShortDescription(description) {
  const cleaned = normalizePirobasedDescription(description).replace(/\.$/, '');
  if (cleaned.length <= 64) return cleaned;

  const remainder = cleaned.slice(CANON_DESCRIPTION_PREFIX.length);
  const maxRemainderLength = 64 - CANON_DESCRIPTION_PREFIX.length - 3;
  return `${CANON_DESCRIPTION_PREFIX}${remainder.slice(0, maxRemainderLength).trimEnd()}...`;
}

export function makeDefaultPrompt(skillId, description) {
  const cleaned = String(description ?? '')
    .trim()
    .replace(/^piro(?:[- ]?based)\s+/i, '')
    .replace(/\.$/, '');
  const normalized = cleaned ? `${cleaned[0].toLowerCase()}${cleaned.slice(1)}` : cleaned;
  return `Use $${skillId} when you need to ${normalized}.`;
}

export function renderTemplate(template, replacements) {
  return String(template ?? '').replaceAll(
    /\{\{([a-z_]+)\}\}/g,
    (match, key) => replacements[key] ?? match,
  );
}

export function renderOpenClawMetadataYaml({ emoji, homepage }) {
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

export function makeOpenClawHomepage(repository, relativeSkillPath) {
  const rawRepository = typeof repository === 'string' ? repository : repository?.url;
  const normalizedPath = String(relativeSkillPath ?? '')
    .split(path.sep)
    .join('/')
    .replace(/^\/+|\/+$/g, '');
  let repositoryUrl = normalizeString(rawRepository);

  if (!repositoryUrl || !normalizedPath) return null;

  repositoryUrl = repositoryUrl
    .replace(/^git\+/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/^ssh:\/\/git@github\.com\//, 'https://github.com/')
    .replace(/\.git$/, '')
    .replace(/\/$/, '');

  try {
    const parsedRepository = new URL(repositoryUrl);
    if (parsedRepository.protocol !== 'https:' || parsedRepository.hostname !== 'github.com') {
      return null;
    }
  } catch {
    return null;
  }

  const encodedPath = normalizedPath.split('/').map(encodeURIComponent).join('/');
  return `${repositoryUrl}/tree/main/${encodedPath}`;
}

export function inferCategoryTag({ description = '', displayName = '', slug = '', type = '' }) {
  const haystack = `${displayName} ${description} ${slug}`.toLowerCase();

  for (const [tag, pattern] of CATEGORY_INFERENCE_RULES) {
    if (
      pattern.test(haystack) &&
      tag !== CANON_SKILL_OWNER &&
      tag !== String(type).trim().toLowerCase()
    ) {
      return tag;
    }
  }

  return null;
}
