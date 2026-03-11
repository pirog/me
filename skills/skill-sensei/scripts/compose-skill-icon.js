#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import os from 'node:os';
import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function usage(code = 0) {
  process.stdout.write(`Usage: compose-skill-icon.js --base-icon <path> --watermark <path> --output <path> [options]

Options:
  --size <number>          output canvas size [default: 1024]
  --badge-scale <number>   watermark badge size relative to canvas [default: 0.28]
  --padding-scale <number> badge padding relative to canvas [default: 0.05]
  --ring-color <color>     badge ring color [default: #0f172a]
  --bg-color <color>       badge backing color [default: #ffffff]

Output formats:
  .svg                     writes the composed vector icon directly
  .png                     rasterizes the composed icon with ImageMagick
`);
  process.exit(code);
}

function parseArgs(argv) {
  const parsed = {
    size: 1024,
    badgeScale: 0.28,
    paddingScale: 0.05,
    ringColor: '#0f172a',
    bgColor: '#ffffff',
  };

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
      ['-background', 'none', '-density', '384', 'svg:-', '-resize', `${size}x${size}`, `png32:${outputPath}`],
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
    const child = spawn('qlmanage', ['-t', '-s', String(size), '-o', outputDir, inputPath], { stdio: ['ignore', 'ignore', 'pipe'] });
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
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    usage(0);
  }

  const options = parseArgs(process.argv.slice(2));
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
    await writeFile(outputPath, svg, 'utf8');
  } else {
    if (process.platform === 'darwin' && (await commandExists('qlmanage'))) {
      await rasterizeWithQuickLook(svg, outputPath, size);
    } else {
      await rasterizePng(svg, outputPath, size);
    }
  }

  process.stdout.write(`wrote ${outputPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`error: ${error.message}\n`);
  usage(1);
});
