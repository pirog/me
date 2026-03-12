#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import os from 'node:os';
import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  commonTanaabEnvironmentVariables,
  createCli,
  extractCommonFlags,
} from '../../tanaab-coding-core/scripts/bun-cli-support.js';

const cli = createCli(import.meta.url);

function buildEnvironment() {
  return {
    badgeScale: process.env.TANAAB_SKILL_ICON_BADGE_SCALE?.trim() || '0.28',
    baseIcon: process.env.TANAAB_SKILL_ICON_BASE_ICON?.trim(),
    bgColor: process.env.TANAAB_SKILL_ICON_BG_COLOR?.trim() || '#ffffff',
    output: process.env.TANAAB_SKILL_ICON_OUTPUT?.trim(),
    paddingScale: process.env.TANAAB_SKILL_ICON_PADDING_SCALE?.trim() || '0.05',
    ringColor: process.env.TANAAB_SKILL_ICON_RING_COLOR?.trim() || '#0f172a',
    size: process.env.TANAAB_SKILL_ICON_SIZE?.trim() || '1024',
    watermark: process.env.TANAAB_SKILL_ICON_WATERMARK?.trim(),
  };
}

function buildEnvironmentVariables() {
  return [
    ...commonTanaabEnvironmentVariables(),
    { label: 'TANAAB_SKILL_ICON_BASE_ICON', description: 'base icon input path' },
    { label: 'TANAAB_SKILL_ICON_WATERMARK', description: 'watermark input path' },
    { label: 'TANAAB_SKILL_ICON_OUTPUT', description: 'output path' },
    { label: 'TANAAB_SKILL_ICON_SIZE', description: 'output canvas size' },
    {
      label: 'TANAAB_SKILL_ICON_BADGE_SCALE',
      description: 'watermark badge size relative to canvas',
    },
    { label: 'TANAAB_SKILL_ICON_PADDING_SCALE', description: 'badge padding relative to canvas' },
    { label: 'TANAAB_SKILL_ICON_RING_COLOR', description: 'badge ring color' },
    { label: 'TANAAB_SKILL_ICON_BG_COLOR', description: 'badge backing color' },
  ];
}

function usage(code = 0) {
  const environment = buildEnvironment();

  cli.showHelp(
    {
      description: 'Compose a skill icon from a base icon plus a branded watermark badge.',
      environmentVariables: buildEnvironmentVariables(),
      options: [
        {
          label: '--size <number>',
          description: `output canvas size ${cli.dim(`[default: ${environment.size}]`)}`,
        },
        {
          label: '--badge-scale <number>',
          description: `watermark badge size relative to canvas ${cli.dim(`[default: ${environment.badgeScale}]`)}`,
        },
        {
          label: '--padding-scale <number>',
          description: `badge padding relative to canvas ${cli.dim(`[default: ${environment.paddingScale}]`)}`,
        },
        {
          label: '--ring-color <color>',
          description: `badge ring color ${cli.dim(`[default: ${environment.ringColor}]`)}`,
        },
        {
          label: '--bg-color <color>',
          description: `badge backing color ${cli.dim(`[default: ${environment.bgColor}]`)}`,
        },
        { label: '--debug', description: 'show debug diagnostics' },
        { label: '-h, --help', description: 'show this message' },
        {
          label: '-V, --version',
          description: `show the repo version ${cli.dim(`[default: ${cli.version}]`)}`,
        },
      ],
      sections: [
        {
          entries: [
            { label: '.svg', description: 'writes the composed vector icon directly' },
            {
              label: '.png',
              description:
                'rasterizes the composed icon with Quick Look on macOS or ImageMagick elsewhere',
            },
          ],
          heading: 'Output Formats',
        },
      ],
      usage: `${cli.bold(cli.cliName)} --base-icon <path> --watermark <path> --output <path> [options]`,
    },
    code,
  );
}

function parseArgs(argv) {
  const parsed = { ...buildEnvironment() };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

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

  if (!parsed.baseIcon || !parsed.watermark || !parsed.output) {
    throw new Error('Missing required arguments.');
  }

  parsed.size = Number(parsed.size);
  parsed.badgeScale = Number(parsed.badgeScale);
  parsed.paddingScale = Number(parsed.paddingScale);
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
  const mediaType = mediaTypeFor(assetPath);
  return `data:${mediaType};base64,${buffer.toString('base64')}`;
}

function toFileHref(assetPath) {
  return pathToFileURL(assetPath).href;
}

function outputFormatFor(outputPath) {
  const extension = path.extname(outputPath).toLowerCase();

  if (extension === '.svg') {
    return 'svg';
  }

  if (extension === '.png') {
    return 'png';
  }

  throw new Error(`Unsupported output format: ${extension || 'unknown'}`);
}

function rasterizePng(svg, outputPath, size) {
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
        `${size}x${size}`,
        `png32:${outputPath}`,
      ],
      { stdio: ['pipe', 'ignore', 'pipe'] },
    );

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

      reject(new Error(stderr.trim() || `magick exited with status ${code}`));
    });

    child.stdin.end(svg);
  });
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

function runQuickLookThumbnail(inputPath, size, outputDir) {
  return new Promise((resolve, reject) => {
    const child = spawn('qlmanage', ['-t', '-s', String(size), '-o', outputDir, inputPath], {
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

async function rasterizeWithQuickLook(svg, outputPath, size) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'skill-icon-'));
  const tempSvgPath = path.join(tempDir, `${path.basename(outputPath, '.png')}.svg`);
  const tempPngPath = `${tempSvgPath}.png`;

  try {
    await writeFile(tempSvgPath, svg, 'utf8');
    await runQuickLookThumbnail(tempSvgPath, size, tempDir);
    await access(tempPngPath);
    await rename(tempPngPath, outputPath);
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
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

  const options = parseArgs(argv);
  cli.debug('resolved options %O', options);
  const outputPath = path.resolve(options.output);
  const outputFormat = outputFormatFor(outputPath);
  const baseIconPath = path.resolve(options.baseIcon);
  const watermarkPath = path.resolve(options.watermark);
  const [baseIconHref, watermarkHref] =
    outputFormat === 'svg'
      ? await Promise.all([toDataUri(baseIconPath), toDataUri(watermarkPath)])
      : [toFileHref(baseIconPath), toFileHref(watermarkPath)];

  const size = options.size;
  const badgeSize = Math.round(size * options.badgeScale);
  const padding = Math.round(size * options.paddingScale);
  const radius = Math.round(badgeSize / 2);
  const cx = size - padding - radius;
  const cy = size - padding - radius;
  const badgeX = cx - radius;
  const badgeY = cy - radius;
  const ringRadius = radius + Math.round(size * 0.012);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <clipPath id="watermark-badge">
      <circle cx="${cx}" cy="${cy}" r="${radius}" />
    </clipPath>
  </defs>
  <image href="${baseIconHref}" xlink:href="${baseIconHref}" x="0" y="0" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" />
  <circle cx="${cx}" cy="${cy}" r="${ringRadius}" fill="${options.bgColor}" fill-opacity="0.94" />
  <image href="${watermarkHref}" xlink:href="${watermarkHref}" x="${badgeX}" y="${badgeY}" width="${badgeSize}" height="${badgeSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#watermark-badge)" />
  <circle cx="${cx}" cy="${cy}" r="${ringRadius}" fill="none" stroke="${options.ringColor}" stroke-width="${Math.max(10, Math.round(size * 0.012))}" />
</svg>
`;

  await mkdir(path.dirname(outputPath), { recursive: true });

  if (outputFormat === 'svg') {
    cli.debug('writing svg output to %s', outputPath);
    await writeFile(outputPath, svg, 'utf8');
  } else {
    if (process.platform === 'darwin' && (await commandExists('qlmanage'))) {
      cli.debug('rasterizing with Quick Look into %s', outputPath);
      await rasterizeWithQuickLook(svg, outputPath, size);
    } else {
      cli.debug('rasterizing with ImageMagick into %s', outputPath);
      await rasterizePng(svg, outputPath, size);
    }
  }

  cli.success('%s %s', cli.tp('wrote'), cli.ts(outputPath));
}

main().catch((error) => {
  cli.error(error instanceof Error ? error.message : String(error));
  usage(1);
});
