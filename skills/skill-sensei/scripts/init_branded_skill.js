#!/usr/bin/env bun

import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BRAND_PROFILES = {
  piro: {
    accent: '#00c88a',
    bgStart: '#111827',
    bgEnd: '#1f2937',
    label: 'PI',
    watermarkAsset: 'assets/pirog-watermark.png',
  },
  tanaab: {
    accent: '#ffffff',
    bgStart: '#0f172a',
    bgEnd: '#134e4a',
    label: 'TN',
    watermarkAsset: 'assets/tanaab-watermark.svg',
  },
};

function usage(code = 0) {
  process.stdout
    .write(`Usage: init_branded_skill.js --brand <piro|tanaab> --slug <slug> --display-name <name> --description <text> [options]

Options:
  --prompt <text>        default prompt for agents/openai.yaml
  --output-dir <path>    parent directory for generated skills [default: skills]
  --force                overwrite an existing generated skill directory
`);
  process.exit(code);
}

function parseArgs(argv) {
  const parsed = { outputDir: 'skills', force: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--force') {
      parsed.force = true;
      continue;
    }

    if (!arg.startsWith('--')) {
      throw new Error(`Positional arguments are not supported: ${arg}`);
    }

    const key = arg.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    parsed[key.replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = value;
    index += 1;
  }

  return parsed;
}

function normalizeSlug(value) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/^(piro|tanaab)-/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    throw new Error('Slug must contain at least one letter or digit.');
  }

  return slug;
}

function makeSkillId(brand, slug) {
  return `${brand}-${slug}`;
}

function makeShortDescription(description) {
  const cleaned = description.trim().replace(/\.$/, '');
  if (cleaned.length <= 64) {
    return cleaned;
  }

  return `${cleaned.slice(0, 61).trimEnd()}...`;
}

function makeDefaultPrompt(skillId, description) {
  const cleaned = description.trim().replace(/\.$/, '');
  const normalized = cleaned ? `${cleaned[0].toLowerCase()}${cleaned.slice(1)}` : cleaned;
  return `Use $${skillId} when you need to ${normalized}.`;
}

function makeInitials(displayName) {
  const letters = displayName
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return letters || 'SK';
}

function quoteYaml(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function markdownTitle(displayName) {
  return displayName.trim();
}

function makeSkillMarkdown({ skillId, displayName, description }) {
  return `---
name: ${skillId}
description: ${description}
---

# ${markdownTitle(displayName)}

## Overview

${description}

## When to Use

- Add concrete trigger phrases here.
- Describe the task boundaries clearly.
- Call out nearby requests that should not trigger this skill.

## Workflow

1. Identify the inputs, context, and required resources.
2. Apply the preferred implementation or authoring pattern.
3. Validate the result before finishing.

## Bundled Resources

- Add scripts, references, and assets here as they are created.

## Validation

- Add the concrete checks needed before handing work back to the user.
`;
}

function makeOpenAiYaml({ displayName, shortDescription, defaultPrompt, iconPath }) {
  return `interface:
  display_name: ${quoteYaml(displayName)}
  short_description: ${quoteYaml(shortDescription)}
  icon_small: ${quoteYaml(iconPath)}
  icon_large: ${quoteYaml(iconPath)}
  default_prompt: ${quoteYaml(defaultPrompt)}
`;
}

function makeFallbackIconSvg({ displayName, skillId, brand }) {
  const profile = BRAND_PROFILES[brand];
  const initials = makeInitials(displayName);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-labelledby="title desc">
  <title id="title">${displayName}</title>
  <desc id="desc">Generated fallback icon for ${skillId}.</desc>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${profile.bgStart}" />
      <stop offset="100%" stop-color="${profile.bgEnd}" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="224" fill="url(#bg)" />
  <rect x="124" y="148" width="212" height="36" rx="18" fill="${profile.accent}" opacity="0.96" />
  <rect x="124" y="218" width="422" height="44" rx="22" fill="#f8fafc" opacity="0.94" />
  <rect x="124" y="290" width="334" height="28" rx="14" fill="#cbd5e1" opacity="0.72" />
  <text x="126" y="666" fill="#f8fafc" font-size="328" font-family="Menlo, Monaco, monospace" font-weight="700">${initials}</text>
  <circle cx="836" cy="822" r="116" fill="#ffffff" opacity="0.94" />
  <circle cx="836" cy="822" r="84" fill="${profile.accent}" />
  <text x="836" y="854" fill="#0f172a" text-anchor="middle" font-size="84" font-family="Menlo, Monaco, monospace" font-weight="700">${profile.label}</text>
</svg>
`;
}

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    usage(0);
  }

  const options = parseArgs(process.argv.slice(2));
  const brand = options.brand?.trim().toLowerCase();
  const slug = normalizeSlug(options.slug ?? '');
  const displayName = options.displayName?.trim();
  const description = options.description?.trim();

  if (!brand || !(brand in BRAND_PROFILES)) {
    throw new Error('Brand must be one of: piro, tanaab.');
  }

  if (!displayName) {
    throw new Error('Display name is required.');
  }

  if (!description) {
    throw new Error('Description is required.');
  }

  const skillId = makeSkillId(brand, slug);
  const skillDir = path.resolve(options.outputDir, skillId);
  const agentsDir = path.join(skillDir, 'agents');
  const assetsDir = path.join(skillDir, 'assets');
  const referencesDir = path.join(skillDir, 'references');
  const scriptsDir = path.join(skillDir, 'scripts');
  const fallbackIconPath = path.join(assetsDir, `${skillId}-icon.svg`);

  if ((await exists(skillDir)) && !options.force) {
    throw new Error(`Skill directory already exists: ${skillDir}`);
  }

  if (options.force) {
    await rm(skillDir, { force: true, recursive: true });
  }

  await mkdir(agentsDir, { recursive: true });
  await mkdir(assetsDir, { recursive: true });
  await mkdir(referencesDir, { recursive: true });
  await mkdir(scriptsDir, { recursive: true });

  const shortDescription = makeShortDescription(description);
  const defaultPrompt = options.prompt?.trim() || makeDefaultPrompt(skillId, description);

  await writeFile(path.join(skillDir, 'SKILL.md'), makeSkillMarkdown({ skillId, displayName, description }), 'utf8');
  await writeFile(
    path.join(agentsDir, 'openai.yaml'),
    makeOpenAiYaml({
      defaultPrompt,
      displayName,
      iconPath: `./assets/${skillId}-icon.svg`,
      shortDescription,
    }),
    'utf8',
  );
  await writeFile(fallbackIconPath, makeFallbackIconSvg({ brand, displayName, skillId }), 'utf8');

  const summary = [
    `Created ${skillId}`,
    `- ${path.join(skillDir, 'SKILL.md')}`,
    `- ${path.join(agentsDir, 'openai.yaml')}`,
    `- ${fallbackIconPath}`,
  ].join('\n');

  process.stdout.write(`${summary}\n`);
}

main().catch((error) => {
  process.stderr.write(`error: ${error.message}\n`);
  usage(1);
});
