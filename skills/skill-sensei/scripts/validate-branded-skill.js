#!/usr/bin/env bun

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const REQUIRED_HEADINGS = [
  '## Overview',
  '## When to Use',
  '## When Not to Use',
  '## Relationship to Other Skills',
  '## Workflow',
  '## Bundled Resources',
  '## Validation',
];

function usage(code = 0) {
  process.stdout.write('Usage: validate-branded-skill.js --skill-dir <path>\n');
  process.exit(code);
}

function parseArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    usage(0);
  }

  const index = argv.indexOf('--skill-dir');
  if (index === -1 || !argv[index + 1]) {
    throw new Error('Missing required --skill-dir argument.');
  }

  return { skillDir: path.resolve(argv[index + 1]) };
}

async function fileExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function extractFrontmatterName(content) {
  const match = content.match(/^---\n(?:.*\n)*?name:\s*("?)([^"\n]+)\1/m);
  return match?.[2]?.trim();
}

function extractFrontmatterDescription(content) {
  const match = content.match(/^---\n(?:.*\n)*?description:\s*("?)([^"\n]+)\1/m);
  return match?.[2]?.trim();
}

function ensureHeadingOrder(content, failures) {
  let lastIndex = -1;

  for (const heading of REQUIRED_HEADINGS) {
    const index = content.indexOf(heading);
    if (index === -1) {
      failures.push(`Missing heading: ${heading}`);
      continue;
    }

    if (index < lastIndex) {
      failures.push(`Heading out of order: ${heading}`);
    }

    lastIndex = index;
  }
}

function parseOpenAiInterface(content) {
  const entries = {};

  for (const line of content.split('\n')) {
    const match = line.match(/^\s{2}([a-z_]+):\s*(.+)\s*$/);
    if (match) {
      entries[match[1]] = match[2].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    }
  }

  return entries;
}

async function main() {
  const { skillDir } = parseArgs(process.argv.slice(2));
  const failures = [];
  const skillId = path.basename(skillDir);
  const brandMatch = skillId.match(/^(piro|tanaab)-[a-z0-9-]+$/);

  if (!brandMatch) {
    failures.push(`Skill id must start with piro- or tanaab-: ${skillId}`);
  }

  const skillPath = path.join(skillDir, 'SKILL.md');
  const openAiPath = path.join(skillDir, 'agents', 'openai.yaml');

  if (!(await fileExists(skillPath))) {
    failures.push(`Missing file: ${skillPath}`);
  }

  if (!(await fileExists(openAiPath))) {
    failures.push(`Missing file: ${openAiPath}`);
  }

  if (failures.length > 0) {
    throw new Error(failures.join('\n'));
  }

  const skillContent = await readFile(skillPath, 'utf8');
  const openAiContent = await readFile(openAiPath, 'utf8');
  const name = extractFrontmatterName(skillContent);
  const description = extractFrontmatterDescription(skillContent);
  const iface = parseOpenAiInterface(openAiContent);

  if (name !== skillId) {
    failures.push(`Frontmatter name must match folder name: expected ${skillId}, got ${name ?? 'missing'}`);
  }

  if (!description) {
    failures.push('Frontmatter description is missing.');
  }

  ensureHeadingOrder(skillContent, failures);

  for (const key of ['display_name', 'short_description', 'default_prompt']) {
    if (!iface[key]) {
      failures.push(`agents/openai.yaml is missing interface.${key}`);
    }
  }

  for (const key of ['icon_small', 'icon_large']) {
    if (!iface[key]) {
      continue;
    }

    const iconPath = path.resolve(skillDir, iface[key]);
    if (!(await fileExists(iconPath))) {
      failures.push(`Icon file does not exist for ${key}: ${iconPath}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.join('\n'));
  }

  process.stdout.write(`ok: ${skillId}\n`);
}

main().catch((error) => {
  process.stderr.write(`error: ${error.message}\n`);
  usage(1);
});
