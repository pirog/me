import path from 'node:path';
import { fileURLToPath } from 'node:url';

import bundledLargeIconImport from '../../../assets/icon-large.png';
import bundledSmallIconImport from '../../../assets/composer-icon.svg';
import codingTemplateText from '../templates/coding.md' with { type: 'text' };
import genericTemplateText from '../templates/generic.md' with { type: 'text' };
import integrationTemplateText from '../templates/integration.md' with { type: 'text' };
import metaTemplateText from '../templates/meta.md' with { type: 'text' };
import workflowTemplateText from '../templates/workflow.md' with { type: 'text' };
import extractTopLevelSkillHeadings from '../utils/extract-top-level-skill-headings.js';
import { splitLeadingSkillFrontmatter } from '../utils/parse-skill-frontmatter.js';
import {
  CANON_DESCRIPTION_PREFIX,
  CANON_SKILL_BRAND_COLOR,
  CANON_SKILL_LICENSE,
  CANON_SKILL_MACHINE_PREFIX,
  CANON_SKILL_MACHINE_PREFIX_WITH_HYPHEN,
  CANON_SKILL_OWNER,
} from './skill-identity.js';

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url));
const KEBAB_CASE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TEMPLATE_TEXT_IMPORTS = [
  genericTemplateText,
  codingTemplateText,
  integrationTemplateText,
  workflowTemplateText,
  metaTemplateText,
];

export {
  CANON_DESCRIPTION_PREFIX,
  CANON_SKILL_BRAND_COLOR,
  CANON_SKILL_LICENSE,
  CANON_SKILL_MACHINE_PREFIX,
  CANON_SKILL_MACHINE_PREFIX_WITH_HYPHEN,
  CANON_SKILL_OWNER,
};
export const SKILLS_ROOT_DIR = path.resolve(LIB_DIR, '..', '..');

function normalizedString(value) {
  return typeof value === 'string' ? value.trim() || null : null;
}

function normalizedLowercaseString(value) {
  return normalizedString(value)?.toLowerCase() ?? null;
}

function buildTemplateDefinition(templateContent) {
  const { body, frontmatter } = splitLeadingSkillFrontmatter(templateContent);
  const templateType = normalizedLowercaseString(frontmatter?.template_type);
  const defaultCategoryTag = normalizedLowercaseString(frontmatter?.default_category_tag);
  const defaultOpenClawEmoji = normalizedString(frontmatter?.default_openclaw_emoji);
  const optionalTopLevelHeadings = Array.isArray(frontmatter?.optional_top_level_headings)
    ? frontmatter.optional_top_level_headings.map((heading) =>
        /^#\s/.test(String(heading).trim()) ? '# ' : String(heading).trim(),
      )
    : [];

  if (!templateType || !defaultCategoryTag || !defaultOpenClawEmoji) {
    throw new Error(
      'Template metadata must include template_type, default_category_tag, and default_openclaw_emoji.',
    );
  }

  return {
    defaultCategoryTag,
    defaultOpenClawEmoji,
    id: templateType,
    optionalTopLevelHeadings,
    sectionOrder: extractTopLevelSkillHeadings(body),
    templateBody: body,
  };
}

export const SKILL_TEMPLATES = Object.freeze(
  Object.fromEntries(
    TEMPLATE_TEXT_IMPORTS.map((templateContent) => {
      const definition = buildTemplateDefinition(templateContent);
      return [definition.id, definition];
    }),
  ),
);

export const SKILL_TYPE_IDS = Object.keys(SKILL_TEMPLATES);

export function getSkillType(type) {
  const normalizedType = String(type ?? '')
    .trim()
    .toLowerCase();
  return SKILL_TEMPLATES[normalizedType] ?? null;
}

export function isKnownSkillType(type) {
  return getSkillType(type) !== null;
}

export function formatSkillTypeIds() {
  return SKILL_TYPE_IDS.join(', ');
}

export function isKebabCaseId(value) {
  return KEBAB_CASE_ID_PATTERN.test(String(value ?? '').trim());
}

function resolveImportedAssetPath(importedAssetPath) {
  return path.isAbsolute(importedAssetPath)
    ? importedAssetPath
    : path.resolve(LIB_DIR, importedAssetPath);
}

export function getBundledSmallIconPath() {
  return resolveImportedAssetPath(bundledSmallIconImport);
}

export function getBundledLargeIconPath() {
  return resolveImportedAssetPath(bundledLargeIconImport);
}

export function stripSkillPrefix(value) {
  const normalized = String(value ?? '').trim();
  return normalized.startsWith(CANON_SKILL_MACHINE_PREFIX_WITH_HYPHEN)
    ? normalized.slice(CANON_SKILL_MACHINE_PREFIX_WITH_HYPHEN.length)
    : normalized;
}

export function renderMetadataTagsYaml(tags) {
  return tags.map((tag) => `    - ${tag}`).join('\n');
}
