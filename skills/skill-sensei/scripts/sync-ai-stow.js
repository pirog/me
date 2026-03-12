#!/usr/bin/env bun

import { spawn } from 'node:child_process';
import { access, lstat, readdir, readlink, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  REPO_ROOT,
  booleanFromEnv,
  commonTanaabEnvironmentVariables,
  createCli,
  extractCommonFlags,
} from '../../tanaab-coding-core/scripts/bun-cli-support.js';

const cli = createCli(import.meta.url);

function buildEnvironment() {
  return {
    dotfilesDir: process.env.TANAAB_STOW_DOTFILES_DIR?.trim() || path.join(REPO_ROOT, 'dotfiles'),
    packageName: process.env.TANAAB_STOW_PACKAGE?.trim() || 'ai',
    prune: booleanFromEnv(process.env.TANAAB_STOW_PRUNE, true),
    simulate: booleanFromEnv(process.env.TANAAB_STOW_SIMULATE, false),
    target: process.env.TANAAB_STOW_TARGET?.trim() || os.homedir(),
  };
}

function buildEnvironmentVariables() {
  return [
    ...commonTanaabEnvironmentVariables(),
    { label: 'TANAAB_STOW_TARGET', description: 'target home directory' },
    { label: 'TANAAB_STOW_DOTFILES_DIR', description: 'stow directory containing the ai package' },
    { label: 'TANAAB_STOW_PACKAGE', description: 'stow package name' },
    {
      label: 'TANAAB_STOW_SIMULATE',
      description: 'set to a truthy value to simulate the stow run',
    },
    {
      label: 'TANAAB_STOW_PRUNE',
      description: 'set to a truthy value to prune dangling links after restow',
    },
  ];
}

function usage(code = 0) {
  const environment = buildEnvironment();

  cli.showHelp(
    {
      description:
        "Restow the repo's ai dot package into a target home directory and prune dangling skill links.",
      environmentVariables: buildEnvironmentVariables(),
      options: [
        {
          label: '--target <path>',
          description: `target home directory ${cli.dim(`[default: ${environment.target}]`)}`,
        },
        {
          label: '--dotfiles-dir <path>',
          description: `stow dir containing the ai package ${cli.dim(`[default: ${environment.dotfilesDir}]`)}`,
        },
        {
          label: '--package <name>',
          description: `stow package name ${cli.dim(`[default: ${environment.packageName}]`)}`,
        },
        {
          label: '--simulate',
          description: `print the stow plan without writing changes ${cli.dim(`[default: ${environment.simulate ? 'on' : 'off'}]`)}`,
        },
        {
          label: '--no-prune',
          description: `skip dangling skill-link cleanup after restow ${cli.dim(`[default: ${environment.prune ? 'off' : 'on'}]`)}`,
        },
        { label: '--debug', description: 'show debug diagnostics' },
        { label: '-h, --help', description: 'show this message' },
        {
          label: '-V, --version',
          description: `show the repo version ${cli.dim(`[default: ${cli.version}]`)}`,
        },
      ],
      usage: `${cli.bold(cli.cliName)} [options]`,
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
  const stowArgs = ['--dir', options.dotfilesDir, '--target', options.target, '--restow'];

  if (options.simulate) {
    stowArgs.push('--simulate');
  }

  stowArgs.push(options.packageName);

  cli.log(
    '%s %s via stow into %s',
    cli.tp('syncing'),
    cli.ts(options.packageName),
    cli.ts(options.target),
  );
  cli.debug('running stow with args %O', stowArgs);
  await runStow(stowArgs);

  if (options.simulate) {
    cli.note('completed simulated stow run');
    return;
  }

  if (options.prune) {
    const skillRoots = [
      path.join(options.target, '.codex', 'skills'),
      path.join(options.target, '.openclaw', 'skills'),
    ];

    let removedLinks = 0;
    let removedDirs = 0;

    for (const skillRoot of skillRoots) {
      const counters = await pruneDanglingSymlinks(skillRoot);
      removedLinks += counters.removedLinks;
      removedDirs += counters.removedDirs;
    }

    cli.success(
      '%s %s dangling skill links and %s empty directories',
      cli.tp('pruned'),
      cli.ts(String(removedLinks)),
      cli.ts(String(removedDirs)),
    );
  }

  const summaries = await Promise.all([
    summarizePath(path.join(options.target, '.codex', 'skills')),
    summarizePath(path.join(options.target, '.openclaw', 'skills')),
  ]);

  cli.log(summaries.join('\n'));
}

main().catch((error) => {
  cli.error(error instanceof Error ? error.message : String(error));
  usage(1);
});
