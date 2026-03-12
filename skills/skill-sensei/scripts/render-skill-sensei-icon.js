#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import os from 'node:os';
import { access, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  commonTanaabEnvironmentVariables,
  createCli,
  extractCommonFlags,
} from '../../tanaab-coding-core/scripts/bun-cli-support.js';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(SCRIPT_DIR, '../assets');
const cli = createCli(import.meta.url);

const CANVAS_SIZE = 1024;
const BADGES = [
  {
    id: 'pirog',
    cx: 166,
    cy: 328,
    size: 118,
    ringColor: '#00c88a',
    bgColor: '#ffffff',
    watermarkPath: path.join(ASSETS_DIR, 'pirog-watermark.png'),
  },
  {
    id: 'tanaab',
    cx: 858,
    cy: 328,
    size: 118,
    ringColor: '#ffffff',
    bgColor: '#ffffff',
    watermarkPath: path.join(ASSETS_DIR, 'tanaab-watermark.svg'),
  },
];

function usage(code = 0) {
  cli.showHelp(
    {
      description: 'Generate the self-contained SVG and PNG assets for the Skill Sensei icon.',
      environmentVariables: commonTanaabEnvironmentVariables(),
      options: [
        { label: '--debug', description: 'show debug diagnostics' },
        { label: '-h, --help', description: 'show this message' },
        {
          label: '-V, --version',
          description: `show the repo version ${cli.dim(`[default: ${cli.version}]`)}`,
        },
      ],
      usage: `${cli.bold(cli.cliName)}`,
    },
    code,
  );
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
      [
        '-background',
        'none',
        '-density',
        '384',
        'svg:-',
        '-resize',
        `${CANVAS_SIZE}x${CANVAS_SIZE}`,
        `png32:${outputPath}`,
      ],
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
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'skill-sensei-icon-'));
  const tempSvgPath = path.join(tempDir, 'skill-sensei.svg');
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

function badgeMarkup({ id, cx, cy, size, ringColor, bgColor, watermarkHref }) {
  const radius = Math.round(size / 2);
  const imageX = cx - radius;
  const imageY = cy - radius;
  const ringRadius = radius + 10;
  const ringWidth = 10;

  return `  <g filter="url(#badge-shadow)">
    <circle cx="${cx}" cy="${cy}" r="${ringRadius}" fill="${bgColor}" fill-opacity="0.96" />
    <image href="${watermarkHref}" xlink:href="${watermarkHref}" x="${imageX}" y="${imageY}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-${id})" />
    <circle cx="${cx}" cy="${cy}" r="${ringRadius}" fill="none" stroke="${ringColor}" stroke-width="${ringWidth}" />
  </g>`;
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

  if (argv.length > 0) {
    throw new Error(`Positional arguments are not supported: ${argv.join(' ')}`);
  }

  const baseIconPath = path.join(ASSETS_DIR, 'skill-sensei-base.png');
  const svgOutputPath = path.join(ASSETS_DIR, 'skill-sensei.svg');
  const pngOutputPath = path.join(ASSETS_DIR, 'skill-sensei.png');
  cli.debug('rendering icon assets %O', { baseIconPath, pngOutputPath, svgOutputPath });

  const baseIconHref = await toDataUri(baseIconPath);
  const badges = await Promise.all(
    BADGES.map(async (badge) => ({
      ...badge,
      watermarkHref: await toDataUri(badge.watermarkPath),
    })),
  );

  const clipPaths = badges
    .map(({ id, cx, cy, size }) => {
      const radius = Math.round(size / 2);
      return `    <clipPath id="clip-${id}">
      <circle cx="${cx}" cy="${cy}" r="${radius}" />
    </clipPath>`;
    })
    .join('\n');

  const badgeGroups = badges.map((badge) => badgeMarkup(badge)).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" role="img" aria-labelledby="title desc">
  <title id="title">Skill Sensei</title>
  <desc id="desc">A sensei holding both the Pirog and Tanaab watermarks in open hands.</desc>
  <defs>
${clipPaths}
    <filter id="badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.18" />
    </filter>
  </defs>
  <image href="${baseIconHref}" xlink:href="${baseIconHref}" x="0" y="0" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" preserveAspectRatio="xMidYMid slice" />
${badgeGroups}
</svg>
`;

  await writeFile(svgOutputPath, svg, 'utf8');

  if (process.platform === 'darwin' && (await commandExists('qlmanage'))) {
    cli.debug('rasterizing with Quick Look into %s', pngOutputPath);
    await rasterizeWithQuickLook(svg, pngOutputPath);
  } else {
    cli.debug('rasterizing with ImageMagick into %s', pngOutputPath);
    await rasterizePng(svg, pngOutputPath);
  }

  cli.success('%s %s', cli.tp('wrote'), cli.ts(svgOutputPath));
  cli.success('%s %s', cli.tp('wrote'), cli.ts(pngOutputPath));
}

main().catch((error) => {
  cli.error(error instanceof Error ? error.message : String(error));
  usage(1);
});
