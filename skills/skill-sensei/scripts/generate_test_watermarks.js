#!/usr/bin/env bun

import { access, mkdir, readFile, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const BRAND_SKILL_DIR = path.resolve(SCRIPT_DIR, '..');
const SKILLS_DIR = path.resolve(BRAND_SKILL_DIR, '..');
const OUTPUT_DIR = path.join(BRAND_SKILL_DIR, 'assets', 'test-watermarks');
const COMPOSER_PATH = path.join(SCRIPT_DIR, 'compose_skill_icon.js');

const WATERMARKS = {
  piro: {
    file: path.join(BRAND_SKILL_DIR, 'assets', 'pirog-watermark.png'),
    ringColor: '#00c88a',
  },
  tanaab: {
    file: path.join(BRAND_SKILL_DIR, 'assets', 'tanaab-watermark.svg'),
    ringColor: '#ffffff',
  },
};

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

async function fileExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function findBaseIcon(skillDir) {
  const openAiPath = path.join(skillDir, 'agents', 'openai.yaml');
  const content = await readFile(openAiPath, 'utf8');
  const iface = parseOpenAiInterface(content);
  const candidates = [iface.icon_large, iface.icon_small].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = path.resolve(skillDir, candidate);
    if (await fileExists(resolved)) {
      return resolved;
    }
  }

  throw new Error(`No usable icon found in ${openAiPath}`);
}

function runCompose(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [COMPOSER_PATH, ...args], { stdio: 'pipe' });
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `compose exited with status ${code}`));
    });
  });
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const skillEntries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const skillDirs = skillEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const created = [];

  for (const skillId of skillDirs) {
    const skillDir = path.join(SKILLS_DIR, skillId);
    const skillPath = path.join(skillDir, 'SKILL.md');

    if (!(await fileExists(skillPath))) {
      continue;
    }

    const baseIcon = await findBaseIcon(skillDir);

    for (const [brand, settings] of Object.entries(WATERMARKS)) {
      const outputPath = path.join(OUTPUT_DIR, `${skillId}-${brand}.svg`);
      await runCompose(['--base-icon', baseIcon, '--watermark', settings.file, '--output', outputPath, '--ring-color', settings.ringColor]);
      created.push(outputPath);
    }
  }

  process.stdout.write(`created ${created.length} watermark tests in ${OUTPUT_DIR}\n`);
  for (const createdPath of created) {
    process.stdout.write(`- ${path.basename(createdPath)}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`error: ${error.message}\n`);
  process.exit(1);
});
