#!/usr/bin/env bun

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  commonTanaabEnvironmentVariables,
  createCli,
  extractCommonFlags,
} from '../../tanaab-coding-core/scripts/bun-cli-support.js';

const cli = createCli(import.meta.url);

const REQUIRED_HEADINGS = [
  '## Overview',
  '## When to Use',
  '## When Not to Use',
  '## Relationship to Other Skills',
  '## Workflow',
  '## Bundled Resources',
  '## Validation',
];

function buildEnvironment() {
  return {
    skillDir: process.env.TANAAB_SKILL_DIR?.trim(),
  };
}

function buildEnvironmentVariables() {
  return [
    ...commonTanaabEnvironmentVariables(),
    { label: 'TANAAB_SKILL_DIR', description: 'skill directory to validate' },
  ];
}

function usage(code = 0) {
  cli.showHelp(
    {
      description:
        'Validate branded skill structure, required headings, agent metadata, and icon references.',
      environmentVariables: buildEnvironmentVariables(),
      options: [
        { label: '--skill-dir <path>', description: 'skill directory to validate' },
        { label: '--debug', description: 'show debug diagnostics' },
        { label: '-h, --help', description: 'show this message' },
        {
          label: '-V, --version',
          description: `show the repo version ${cli.dim(`[default: ${cli.version}]`)}`,
        },
      ],
      usage: `${cli.bold(cli.cliName)} --skill-dir <path>`,
    },
    code,
  );
}

function parseArgs(argv) {
  const environment = buildEnvironment();
  const index = argv.indexOf('--skill-dir');
  const skillDir = index === -1 ? environment.skillDir : argv[index + 1];

  if (!skillDir) {
    throw new Error('Missing required --skill-dir argument.');
  }

  return { skillDir: path.resolve(skillDir) };
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
  const { argv, flags } = extractCommonFlags(process.argv.slice(2));

  if (flags.debug) {
    cli.enableDebug();
  }

  if (flags.help) {
    usage(0);
  }

  if (flags.version) {
    cli.showVersion();
    return;
  }

  const { skillDir } = parseArgs(argv);
  cli.debug('validating skill directory %s', skillDir);
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
    failures.push(
      `Frontmatter name must match folder name: expected ${skillId}, got ${name ?? 'missing'}`,
    );
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

  cli.success('%s %s', cli.tp('validated'), cli.ts(skillId));
}

main().catch((error) => {
  cli.error(error instanceof Error ? error.message : String(error));
  usage(1);
});
