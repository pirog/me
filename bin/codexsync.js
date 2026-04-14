#!/usr/bin/env bun

import {
  chmod,
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  readlink,
  rm,
  symlink,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { REPO_ROOT, createCli, extractCommonFlags } from '../scripts/bun-cli-support.js';

const CLI_NAME = 'codexsync';
const DEFAULT_REPO_ROOT = REPO_ROOT;
const IGNORED_NAMES = new Set(['.DS_Store', '.git', 'node_modules']);
const MANAGED_PATHS = [
  '.codex-plugin',
  '.mcp.json',
  'AGENTS.md',
  'assets',
  'bin',
  'package.json',
  'skills',
];
const MAX_DIFF_PREVIEW = 5;

const cli = createCli(import.meta.url);

function resolveArgValue(arg, key) {
  if (arg === key) {
    return null;
  }

  if (arg.startsWith(`${key}=`)) {
    return arg.slice(`${key}=`.length);
  }

  return undefined;
}

function parseArgs(argv) {
  const options = {
    cachePath: null,
    repoRoot: DEFAULT_REPO_ROOT,
  };
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    const repoRootValue = resolveArgValue(arg, '--repo-root');
    if (repoRootValue !== undefined) {
      const value = repoRootValue ?? argv[++index];
      if (!value) {
        throw new Error('Missing value for --repo-root.');
      }

      options.repoRoot = path.resolve(value);
      continue;
    }

    const cachePathValue = resolveArgValue(arg, '--cache-path');
    if (cachePathValue !== undefined) {
      const value = cachePathValue ?? argv[++index];
      if (!value) {
        throw new Error('Missing value for --cache-path.');
      }

      options.cachePath = path.resolve(value);
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    positionals.push(arg);
  }

  const [command = null, ...extraPositionals] = positionals;
  return { command, extraPositionals, options };
}

function setFailure(message, ...args) {
  cli.error(message, ...args);
  process.exitCode = 1;
}

async function pathExists(targetPath) {
  try {
    await lstat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(targetPath) {
  return JSON.parse(await readFile(targetPath, 'utf8'));
}

async function resolveCliContext(repoRoot, cachePathOverride) {
  const packageJson = await readJson(path.join(repoRoot, 'package.json'));
  const pluginJson = await readJson(path.join(repoRoot, '.codex-plugin', 'plugin.json'));

  return {
    cachePath:
      cachePathOverride ??
      path.join(
        os.homedir(),
        '.codex',
        'plugins',
        'cache',
        'pirostore',
        pluginJson.name,
        packageJson.version,
      ),
    repoRoot,
  };
}

function renderHelp({ cachePath, repoRoot }) {
  return cli.renderHelp({
    description:
      'Compare or refresh the plugin-owned Codex cache copy without treating repo-only dotfiles and bootstrap files as plugin inputs.',
    options: [
      {
        label: '--repo-root <path>',
        description: `repo root to compare from ${cli.dim(`[default: ${repoRoot}]`)}`,
      },
      {
        label: '--cache-path <path>',
        description: `cache copy to compare or sync ${cli.dim(`[default: ${cachePath}]`)}`,
      },
      { label: '--debug', description: 'show debug diagnostics' },
      { label: '-h, --help', description: 'show this message' },
      {
        label: '-V, --version',
        description: 'show the CLI version',
      },
    ],
    sections: [
      {
        heading: 'Commands',
        entries: [
          { label: 'check', description: 'report drift for plugin-managed cache paths only' },
          { label: 'sync', description: 'refresh the managed cache paths from the repo source' },
        ],
      },
      {
        heading: 'Managed Paths',
        lines: MANAGED_PATHS.map((managedPath) => `  ${managedPath}`),
      },
    ],
    usage: `${cli.bold(CLI_NAME)} <check|sync> [options]`,
  });
}

function previewPaths(paths) {
  if (paths.length <= MAX_DIFF_PREVIEW) {
    return paths;
  }

  return [...paths.slice(0, MAX_DIFF_PREVIEW), `... ${paths.length - MAX_DIFF_PREVIEW} more`];
}

function summarizeDiff(diff) {
  const parts = [];

  if (diff.changed.length > 0) {
    parts.push(`changed ${diff.changed.length}`);
  }

  if (diff.missing.length > 0) {
    parts.push(`missing ${diff.missing.length}`);
  }

  if (diff.extra.length > 0) {
    parts.push(`extra ${diff.extra.length}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'in sync';
}

function printDiffDetails(diff) {
  for (const [label, paths] of [
    ['changed', diff.changed],
    ['missing', diff.missing],
    ['extra', diff.extra],
  ]) {
    const preview = previewPaths(paths);
    if (preview.length === 0) {
      continue;
    }

    cli.log(`${label}:`);
    for (const entry of preview) {
      cli.log(`  ${entry}`);
    }
  }
}

async function collectManagedEntries(rootDir, entryMap = new Map()) {
  for (const managedPath of MANAGED_PATHS) {
    await collectEntry(rootDir, managedPath, entryMap);
  }

  return entryMap;
}

async function collectEntry(rootDir, relativePath, entryMap) {
  const absolutePath = path.join(rootDir, relativePath);

  let stats;
  try {
    stats = await lstat(absolutePath);
  } catch {
    return;
  }

  if (stats.isSymbolicLink()) {
    entryMap.set(relativePath, {
      target: await readlink(absolutePath),
      type: 'symlink',
    });
    return;
  }

  if (stats.isDirectory()) {
    entryMap.set(relativePath, { type: 'dir' });
    const dirents = await readdir(absolutePath, { withFileTypes: true });

    for (const dirent of dirents.sort((left, right) => left.name.localeCompare(right.name))) {
      if (IGNORED_NAMES.has(dirent.name)) {
        continue;
      }

      await collectEntry(rootDir, path.join(relativePath, dirent.name), entryMap);
    }

    return;
  }

  if (stats.isFile()) {
    entryMap.set(relativePath, {
      content: await readFile(absolutePath),
      mode: stats.mode & 0o777,
      type: 'file',
    });
  }
}

function diffEntries(sourceEntries, targetEntries) {
  const changed = [];
  const extra = [];
  const missing = [];

  for (const [relativePath, sourceEntry] of sourceEntries) {
    const targetEntry = targetEntries.get(relativePath);
    if (!targetEntry) {
      missing.push(relativePath);
      continue;
    }

    if (sourceEntry.type !== targetEntry.type) {
      changed.push(relativePath);
      continue;
    }

    if (sourceEntry.type === 'file') {
      if (
        sourceEntry.mode !== targetEntry.mode ||
        !sourceEntry.content.equals(targetEntry.content)
      ) {
        changed.push(relativePath);
      }

      continue;
    }

    if (sourceEntry.type === 'symlink' && sourceEntry.target !== targetEntry.target) {
      changed.push(relativePath);
    }
  }

  for (const relativePath of targetEntries.keys()) {
    if (!sourceEntries.has(relativePath)) {
      extra.push(relativePath);
    }
  }

  changed.sort((left, right) => left.localeCompare(right));
  extra.sort((left, right) => left.localeCompare(right));
  missing.sort((left, right) => left.localeCompare(right));

  return { changed, extra, missing };
}

async function ensureParentDirectory(targetPath) {
  await mkdir(path.dirname(targetPath), { recursive: true });
}

async function syncEntries({ sourceEntries, sourceRoot, targetEntries, targetRoot }) {
  const diff = diffEntries(sourceEntries, targetEntries);
  const extraPaths = [...diff.extra].sort((left, right) => {
    const leftDepth = left.split(path.sep).length;
    const rightDepth = right.split(path.sep).length;
    return rightDepth - leftDepth || right.length - left.length;
  });

  for (const relativePath of extraPaths) {
    await rm(path.join(targetRoot, relativePath), { force: true, recursive: true });
  }

  const sortedEntries = [...sourceEntries.entries()].sort(
    ([leftPath, leftEntry], [rightPath, rightEntry]) => {
      const leftDepth = leftPath.split(path.sep).length;
      const rightDepth = rightPath.split(path.sep).length;

      if (leftDepth !== rightDepth) {
        return leftDepth - rightDepth;
      }

      if (leftEntry.type === 'dir' && rightEntry.type !== 'dir') {
        return -1;
      }

      if (leftEntry.type !== 'dir' && rightEntry.type === 'dir') {
        return 1;
      }

      return leftPath.localeCompare(rightPath);
    },
  );

  await mkdir(targetRoot, { recursive: true });

  for (const [relativePath, sourceEntry] of sortedEntries) {
    const sourcePath = path.join(sourceRoot, relativePath);
    const targetPath = path.join(targetRoot, relativePath);

    if (sourceEntry.type === 'dir') {
      await mkdir(targetPath, { recursive: true });
      continue;
    }

    await ensureParentDirectory(targetPath);
    await rm(targetPath, { force: true, recursive: true });

    if (sourceEntry.type === 'symlink') {
      await symlink(sourceEntry.target, targetPath);
      continue;
    }

    await cp(sourcePath, targetPath, { force: true });
    await chmod(targetPath, sourceEntry.mode);
  }

  const refreshedTargetEntries = await collectManagedEntries(targetRoot);
  return diffEntries(sourceEntries, refreshedTargetEntries);
}

function printPaths({ cachePath, repoRoot }) {
  cli.log(`repo: ${repoRoot}`);
  cli.log(`cache: ${cachePath}`);
}

async function runCheck({ cachePath, repoRoot }) {
  const sourceEntries = await collectManagedEntries(repoRoot);
  const targetEntries = (await pathExists(cachePath))
    ? await collectManagedEntries(cachePath)
    : new Map();
  const diff = diffEntries(sourceEntries, targetEntries);

  printPaths({ cachePath, repoRoot });

  if (diff.changed.length === 0 && diff.missing.length === 0 && diff.extra.length === 0) {
    cli.success('managed plugin cache paths match source');
    return;
  }

  setFailure('cache drift detected for managed plugin paths (%s)', summarizeDiff(diff));
  printDiffDetails(diff);
}

async function runSync({ cachePath, repoRoot }) {
  const sourceEntries = await collectManagedEntries(repoRoot);
  const targetEntries = (await pathExists(cachePath))
    ? await collectManagedEntries(cachePath)
    : new Map();
  const postSyncDiff = await syncEntries({
    sourceEntries,
    sourceRoot: repoRoot,
    targetEntries,
    targetRoot: cachePath,
  });

  printPaths({ cachePath, repoRoot });

  if (
    postSyncDiff.changed.length > 0 ||
    postSyncDiff.missing.length > 0 ||
    postSyncDiff.extra.length > 0
  ) {
    setFailure(
      'cache sync did not converge for managed plugin paths (%s)',
      summarizeDiff(postSyncDiff),
    );
    printDiffDetails(postSyncDiff);
    return;
  }

  cli.success('managed plugin cache paths synced');
  cli.note('restart or reinstall Codex if refreshed plugin surfaces do not appear immediately');
}

async function main() {
  const { argv, flags } = extractCommonFlags(process.argv.slice(2));

  if (flags.debug) {
    cli.enableDebug();
  }

  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (error) {
    setFailure(error instanceof Error ? error.message : String(error));
    cli.log('');
    const context = await resolveCliContext(DEFAULT_REPO_ROOT, null);
    cli.log(renderHelp(context));
    return;
  }

  const context = await resolveCliContext(parsed.options.repoRoot, parsed.options.cachePath);

  if (flags.help) {
    cli.log(renderHelp(context));
    return;
  }

  if (flags.version) {
    cli.showVersion();
    return;
  }

  if (!parsed.command) {
    setFailure(`expected a command (${cli.ts('check')} or ${cli.ts('sync')})`);
    cli.log('');
    cli.log(renderHelp(context));
    return;
  }

  if (parsed.extraPositionals.length > 0) {
    setFailure(`unexpected positional arguments: ${parsed.extraPositionals.join(', ')}`);
    return;
  }

  if (parsed.command === 'check') {
    await runCheck(context);
    return;
  }

  if (parsed.command === 'sync') {
    await runSync(context);
    return;
  }

  setFailure(`unknown command: ${parsed.command}`);
}

main().catch((error) => {
  cli.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
