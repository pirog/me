#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import os from 'node:os';
import { access, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../..');
const CANVAS_SIZE = 1024;

function usage(code = 0) {
  process.stdout.write(`Usage: render-tanaab-coding-icon.js --title <title> --label <label> --output-stem <path> [options]

Options:
  --base-icon <path>   background base icon [default: skills/tanaab-coding/assets/tanaab-coding-stack-base.png]
  --help               show this message
`);
  process.exit(code);
}

function parseArgs(argv) {
  const parsed = {
    baseIcon: path.join(REPO_ROOT, 'skills/tanaab-coding/assets/tanaab-coding-stack-base.png'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      usage(0);
    }

    if (!arg.startsWith('--')) {
      throw new Error(`Positional arguments are not supported: ${arg}`);
    }

    const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }

    parsed[key] = value;
    index += 1;
  }

  if (!parsed.title || !parsed.label || !parsed.outputStem) {
    throw new Error('Missing required arguments.');
  }

  parsed.baseIcon = path.resolve(parsed.baseIcon);
  parsed.outputStem = path.resolve(parsed.outputStem);
  return parsed;
}

function mediaTypeFor(assetPath) {
  const extension = path.extname(assetPath).toLowerCase();

  switch (extension) {
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    default:
      throw new Error(`Unsupported image format: ${extension || 'unknown'}`);
  }
}

async function toDataUri(assetPath) {
  const buffer = await readFile(assetPath);
  return `data:${mediaTypeFor(assetPath)};base64,${buffer.toString('base64')}`;
}

async function commandExists(command) {
  try {
    await new Promise((resolve, reject) => {
      const child = spawn('which', [command], { stdio: 'ignore' });
      child.on('error', reject);
      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(new Error(`${command} not found`));
      });
    });
    return true;
  } catch {
    return false;
  }
}

function rasterizePng(svg, outputPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'magick',
      ['-background', 'none', '-density', '384', 'svg:-', '-resize', `${CANVAS_SIZE}x${CANVAS_SIZE}`, `png32:${outputPath}`],
      { stdio: ['pipe', 'ignore', 'pipe'] },
    );

    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `magick exited with status ${code}`));
    });

    child.stdin.end(svg);
  });
}

function runQuickLookThumbnail(inputPath, outputDir) {
  return new Promise((resolve, reject) => {
    const child = spawn('qlmanage', ['-t', '-s', String(CANVAS_SIZE), '-o', outputDir, inputPath], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `qlmanage exited with status ${code}`));
    });
  });
}

async function rasterizeWithQuickLook(svg, outputPath) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'tanaab-coding-icon-'));
  const tempSvgPath = path.join(tempDir, `${path.basename(outputPath, '.png')}.svg`);
  const tempPngPath = `${tempSvgPath}.png`;

  try {
    await writeFile(tempSvgPath, svg, 'utf8');
    await runQuickLookThumbnail(tempSvgPath, tempDir);
    await access(tempPngPath);
    await rename(tempPngPath, outputPath);
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

function labelFontSize() {
  return 273;
}

function labelLetterSpacing() {
  return '0.04em';
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const svgOutputPath = `${options.outputStem}.svg`;
  const pngOutputPath = `${options.outputStem}.png`;
  const baseHref = await toDataUri(options.baseIcon);
  const labelSize = labelFontSize(options.label);
  const letterSpacing = labelLetterSpacing(options.label);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" role="img" aria-labelledby="title desc">
  <title id="title">${options.title}</title>
  <desc id="desc">Shared Tanaab coding icon for ${options.title}, composited on the shared Tanaab coding stack base icon.</desc>
  <defs>
    <filter id="label-shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#ffffff" flood-opacity="0.42" />
    </filter>
  </defs>
  <image href="${baseHref}" xlink:href="${baseHref}" x="0" y="0" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" preserveAspectRatio="xMidYMid slice" />
  <text x="34" y="946" fill="#db2777" text-anchor="start" font-size="${labelSize}" font-family="Anton, Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" font-weight="900" letter-spacing="${letterSpacing}" filter="url(#label-shadow)">${options.label}</text>
</svg>
`;

  await writeFile(svgOutputPath, svg, 'utf8');

  if (process.platform === 'darwin' && (await commandExists('qlmanage'))) {
    await rasterizeWithQuickLook(svg, pngOutputPath);
  } else {
    await rasterizePng(svg, pngOutputPath);
  }

  process.stdout.write(`wrote ${svgOutputPath}\n`);
  process.stdout.write(`wrote ${pngOutputPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`error: ${error.message}\n`);
  usage(1);
});
