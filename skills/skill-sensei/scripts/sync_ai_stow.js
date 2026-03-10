#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import { access, lstat, readdir, readlink, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../..');

function usage(code = 0) {
  process.stdout.write(`Usage: sync_ai_stow.js [options]

Restow the repo's ai dot package into a target home directory and prune dangling skill links.

Options:
  --target <path>        target home directory [default: ${os.homedir()}]
  --dotfiles-dir <path>  stow dir containing the ai package [default: ${path.join(REPO_ROOT, 'dotfiles')}]
  --package <name>       stow package name [default: ai]
  --simulate             print the stow plan without writing changes
  --no-prune             skip dangling skill-link cleanup after restow
  --help                 show this message
`);
  process.exit(code);
}

function parseArgs(argv) {
  const parsed = {
    dotfilesDir: path.join(REPO_ROOT, 'dotfiles'),
    packageName: 'ai',
    prune: true,
    simulate: false,
    target: os.homedir(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      usage(0);
    }

    if (arg === '--simulate') {
      parsed.simulate = true;
      continue;
    }

    if (arg === '--no-prune') {
      parsed.prune = false;
      continue;
    }

    if (!arg.startsWith('--')) {
      throw new Error(`Positional arguments are not supported: ${arg}`);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }

    const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    parsed[key] = value;
    index += 1;
  }

  parsed.dotfilesDir = path.resolve(parsed.dotfilesDir);
  parsed.target = path.resolve(parsed.target);
  return parsed;
}

function runStow(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('stow', args, { stdio: 'inherit' });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`stow exited with status ${code}`));
    });
  });
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function pruneDanglingSymlinks(rootPath) {
  if (!(await pathExists(rootPath))) {
    return { removedDirs: 0, removedLinks: 0 };
  }

  const stat = await lstat(rootPath);
  if (!stat.isDirectory()) {
    return { removedDirs: 0, removedLinks: 0 };
  }

  const counters = { removedDirs: 0, removedLinks: 0 };

  async function visit(currentPath, preserveCurrent) {
    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);

      if (entry.isSymbolicLink()) {
        if (await pathExists(entryPath)) {
          continue;
        }

        await rm(entryPath, { force: true });
        counters.removedLinks += 1;
        continue;
      }

      if (entry.isDirectory()) {
        await visit(entryPath, false);
      }
    }

    if (preserveCurrent) {
      return;
    }

    const remainingEntries = await readdir(currentPath);
    if (remainingEntries.length === 0) {
      await rm(currentPath, { recursive: true, force: true });
      counters.removedDirs += 1;
    }
  }

  await visit(rootPath, true);
  return counters;
}

async function summarizePath(targetPath) {
  try {
    const stat = await lstat(targetPath);
    if (stat.isSymbolicLink()) {
      return `${targetPath} -> ${await readlink(targetPath)}`;
    }

    if (stat.isDirectory()) {
      const entries = await readdir(targetPath);
      return `${targetPath} [dir, ${entries.length} entries]`;
    }

    return `${targetPath} [file]`;
  } catch {
    return `${targetPath} [missing]`;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const stowArgs = ['--dir', options.dotfilesDir, '--target', options.target, '--restow'];

  if (options.simulate) {
    stowArgs.push('--simulate');
  }

  stowArgs.push(options.packageName);

  process.stdout.write(`syncing ${options.packageName} via stow into ${options.target}\n`);
  await runStow(stowArgs);

  if (options.simulate) {
    return;
  }

  if (options.prune) {
    const skillRoots = [path.join(options.target, '.codex', 'skills'), path.join(options.target, '.openclaw', 'skills')];

    let removedLinks = 0;
    let removedDirs = 0;

    for (const skillRoot of skillRoots) {
      const counters = await pruneDanglingSymlinks(skillRoot);
      removedLinks += counters.removedLinks;
      removedDirs += counters.removedDirs;
    }

    process.stdout.write(`pruned ${removedLinks} dangling skill links and ${removedDirs} empty directories\n`);
  }

  const summaries = await Promise.all([
    summarizePath(path.join(options.target, '.codex', 'skills')),
    summarizePath(path.join(options.target, '.openclaw', 'skills')),
  ]);

  process.stdout.write(`${summaries.join('\n')}\n`);
}

main().catch((error) => {
  process.stderr.write(`error: ${error.message}\n`);
  usage(1);
});
