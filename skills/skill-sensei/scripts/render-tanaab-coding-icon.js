#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import os from 'node:os';
import { access, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  REPO_ROOT,
  commonTanaabEnvironmentVariables,
  createCli,
  extractCommonFlags,
} from '../../tanaab-coding-core/scripts/bun-cli-support.js';

const CANVAS_SIZE = 1024;
const DEFAULT_BASE_ICON = path.join(
  REPO_ROOT,
  'skills/tanaab-coding/assets/tanaab-coding-stack-base.png',
);
const cli = createCli(import.meta.url);

function buildEnvironment() {
  return {
    baseIcon: process.env.TANAAB_CODING_ICON_BASE_ICON?.trim() || DEFAULT_BASE_ICON,
    label: process.env.TANAAB_CODING_ICON_LABEL?.trim(),
    outputStem: process.env.TANAAB_CODING_ICON_OUTPUT_STEM?.trim(),
    title: process.env.TANAAB_CODING_ICON_TITLE?.trim(),
  };
}

function buildEnvironmentVariables() {
  return [
    ...commonTanaabEnvironmentVariables(),
    { label: 'TANAAB_CODING_ICON_TITLE', description: 'icon title text' },
    { label: 'TANAAB_CODING_ICON_LABEL', description: 'large bottom-left label text' },
    {
      label: 'TANAAB_CODING_ICON_OUTPUT_STEM',
      description: 'output stem without the .svg or .png extension',
    },
    { label: 'TANAAB_CODING_ICON_BASE_ICON', description: 'background base icon path' },
  ];
}

function usage(code = 0) {
  const environment = buildEnvironment();

  cli.showHelp(
    {
      description:
        'Render a stack-specific Tanaab coding icon from the shared coding stack base image.',
      environmentVariables: buildEnvironmentVariables(),
      options: [
        {
          label: '--base-icon <path>',
          description: `background base icon ${cli.dim(`[default: ${environment.baseIcon}]`)}`,
        },
        { label: '--debug', description: 'show debug diagnostics' },
        { label: '-h, --help', description: 'show this message' },
        {
          label: '-V, --version',
          description: `show the repo version ${cli.dim(`[default: ${cli.version}]`)}`,
        },
      ],
      usage: `${cli.bold(cli.cliName)} --title <title> --label <label> --output-stem <path> [options]`,
    },
    code,
  );
}

function parseArgs(argv) {
  const parsed = { ...buildEnvironment() };

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
