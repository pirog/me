import { copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import formatSkillValidationReport from '../utils/format-skill-validation-report.js';
import inferSkillCategoryTag from '../utils/infer-skill-category-tag.js';
import makeOpenClawHomepage from '../utils/make-openclaw-homepage.js';
import normalizeSkillDescription, {
  makeShortSkillDescription,
  makeSkillDefaultPrompt,
} from '../utils/normalize-skill-description.js';
import renderOpenClawMetadataYaml from '../utils/render-openclaw-metadata-yaml.js';
import renderSkillTemplate from '../utils/render-skill-template.js';
import {
  CANON_SKILL_BRAND_COLOR,
  CANON_SKILL_LICENSE,
  CANON_SKILL_MACHINE_PREFIX_WITH_HYPHEN,
  CANON_SKILL_OWNER,
  SKILLS_ROOT_DIR,
  formatSkillTypeIds,
  getBundledLargeIconPath,
  getBundledSmallIconPath,
  getSkillType,
  isKebabCaseId,
  renderMetadataTagsYaml,
  stripSkillPrefix,
} from './skill-contract.js';
import { validateSkillDir } from './skill-validator.js';

function normalizeSlug(value) {
  const slug = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) throw new Error('Slug must contain at least one letter or digit.');
  return slug;
}

function quoteYaml(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function makeOpenAiYaml({
  displayName,
  shortDescription,
  defaultPrompt,
  iconSmall = './assets/icon-small.svg',
  iconLarge = './assets/icon-large.png',
}) {
  return `interface:
  display_name: ${quoteYaml(displayName)}
  short_description: ${quoteYaml(shortDescription)}
  icon_small: ${quoteYaml(iconSmall)}
  icon_large: ${quoteYaml(iconLarge)}
  brand_color: ${quoteYaml(CANON_SKILL_BRAND_COLOR)}
  default_prompt: ${quoteYaml(defaultPrompt)}
`;
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function deriveOpenClawHomepage(pluginManifestPath, pluginRoot, skillDir) {
  try {
    const manifest = JSON.parse(await readFile(pluginManifestPath, 'utf8'));
    return makeOpenClawHomepage(manifest.repository, path.relative(pluginRoot, skillDir));
  } catch {
    return null;
  }
}

/**
 * Creates and validates one skill from the canonical Piro type contract.
 *
 * @param {object} options Authored skill values and filesystem options.
 * @returns {Promise<{result: object, skillDir: string}>} Created path and validation report.
 */
export async function initializeSkill(options) {
  const type = String(options.type ?? '')
    .trim()
    .toLowerCase();
  const rawSlug = normalizeSlug(options.slug ?? '');
  const categoryTagOverride = String(options.categoryTag ?? '')
    .trim()
    .toLowerCase();
  const displayName = String(options.displayName ?? '').trim();
  const description = String(options.description ?? '').trim();

  if (!type) throw new Error('Type is required.');
  if (!displayName) throw new Error('Display name is required.');
  if (!description) throw new Error('Description is required.');

  const typeDefinition = getSkillType(type);
  if (!typeDefinition) {
    throw new Error(`Unknown type: ${type}. Allowed types: ${formatSkillTypeIds()}`);
  }
  if (categoryTagOverride && !isKebabCaseId(categoryTagOverride)) {
    throw new Error(
      `Category tag must use lowercase letters, digits, and hyphens only: ${categoryTagOverride}`,
    );
  }
  if (
    categoryTagOverride &&
    (categoryTagOverride === CANON_SKILL_OWNER || categoryTagOverride === type)
  ) {
    throw new Error('Category tag override must add one tag beyond owner and type.');
  }

  const normalizedDescription = normalizeSkillDescription(description);
  const slug = rawSlug.startsWith(CANON_SKILL_MACHINE_PREFIX_WITH_HYPHEN)
    ? rawSlug.slice(CANON_SKILL_MACHINE_PREFIX_WITH_HYPHEN.length)
    : rawSlug;
  const skillId = `${CANON_SKILL_MACHINE_PREFIX_WITH_HYPHEN}${slug}`;
  const inferredCategoryTag = inferSkillCategoryTag({
    description: normalizedDescription,
    displayName,
    slug: skillId,
    type,
  });
  const categoryTag =
    categoryTagOverride || inferredCategoryTag || typeDefinition.defaultCategoryTag;

  if (!categoryTag || !isKebabCaseId(categoryTag)) {
    throw new Error(`Category tag must be a kebab-case id: ${categoryTag || '<empty>'}`);
  }
  if (categoryTag === CANON_SKILL_OWNER || categoryTag === type) {
    throw new Error('Category tag must add one tag beyond owner and type.');
  }

  const tags = [CANON_SKILL_OWNER, type, categoryTag];
  const outputDir = path.resolve(options.outputDir ?? SKILLS_ROOT_DIR);
  const pluginRoot = path.resolve(outputDir, '..');
  const pluginManifestPath = path.join(pluginRoot, '.codex-plugin', 'plugin.json');
  const pluginContained = await pathExists(pluginManifestPath);
  const sharedPluginSmallIconPath = path.join(pluginRoot, 'assets', 'composer-icon.svg');
  const sharedPluginLargeIconPath = path.join(pluginRoot, 'assets', 'icon-large.png');
  const reuseSharedPluginIcons =
    pluginContained &&
    (await pathExists(sharedPluginSmallIconPath)) &&
    (await pathExists(sharedPluginLargeIconPath));
  const folderName = pluginContained ? stripSkillPrefix(skillId) : skillId;
  const skillDir = path.resolve(outputDir, folderName);
  const openClawHomepageOverride = String(options.openclawHomepage ?? '').trim();
  const openClawHomepage =
    openClawHomepageOverride ||
    (pluginContained
      ? await deriveOpenClawHomepage(pluginManifestPath, pluginRoot, skillDir)
      : null);
  const openClawMetadataYaml = renderOpenClawMetadataYaml({
    emoji: String(options.openclawEmoji ?? '').trim() || typeDefinition.defaultOpenClawEmoji,
    homepage: openClawHomepage,
  });

  if ((await pathExists(skillDir)) && !options.force) {
    throw new Error(`Skill directory already exists: ${skillDir}`);
  }
  if (options.force) await rm(skillDir, { force: true, recursive: true });

  const agentsDir = path.join(skillDir, 'agents');
  const assetsDir = path.join(skillDir, 'assets');
  await mkdir(agentsDir, { recursive: true });
  if (!reuseSharedPluginIcons) {
    await mkdir(assetsDir, { recursive: true });
  }

  const skillContent = renderSkillTemplate(typeDefinition.templateBody, {
    description: normalizedDescription,
    display_name: displayName,
    license: CANON_SKILL_LICENSE,
    metadata_tags_yaml: renderMetadataTagsYaml(tags),
    openclaw_metadata_yaml: openClawMetadataYaml,
    owner: CANON_SKILL_OWNER,
    skill_id: skillId,
    type,
  });
  const defaultPrompt =
    String(options.prompt ?? '').trim() || makeSkillDefaultPrompt(skillId, normalizedDescription);
  const openAiContent = makeOpenAiYaml({
    defaultPrompt,
    displayName,
    iconLarge: reuseSharedPluginIcons ? '../../assets/icon-large.png' : undefined,
    iconSmall: reuseSharedPluginIcons ? '../../assets/composer-icon.svg' : undefined,
    shortDescription: makeShortSkillDescription(normalizedDescription),
  });

  const writes = [
    writeFile(path.join(skillDir, 'SKILL.md'), skillContent, 'utf8'),
    writeFile(path.join(agentsDir, 'openai.yaml'), openAiContent, 'utf8'),
  ];
  if (!reuseSharedPluginIcons) {
    writes.push(
      copyFile(getBundledSmallIconPath(), path.join(assetsDir, 'icon-small.svg')),
      copyFile(getBundledLargeIconPath(), path.join(assetsDir, 'icon-large.png')),
    );
  }
  await Promise.all(writes);

  const result = await validateSkillDir(skillDir, { expectedType: type });
  if (result.errors.length > 0) {
    throw new Error(`Generated skill failed validation.\n${formatSkillValidationReport(result)}`);
  }

  return { result, skillDir };
}
