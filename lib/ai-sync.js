import { spawn } from 'node:child_process';
import { lstat, readdir, readlink } from 'node:fs/promises';
import path from 'node:path';

import { extractCommonFlags } from './bun-cli-support.js';
import { syncCodexConfig } from './codex-config-sync.js';
import buildAiSyncHelp from '../utils/build-ai-sync-help.js';
import parseAiSyncArgs from '../utils/parse-ai-sync-args.js';
import pruneDanglingSymlinks from '../utils/prune-dangling-symlinks.js';

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

/**
 * Runs the aisync stow, pruning, and generated-config workflow.
 *
 * @param {object} options Raw arguments and CLI presentation boundary.
 * @returns {Promise<void>}
 */
export async function runAiSync({ argv = process.argv.slice(2), cli }) {
  const common = extractCommonFlags(argv);
  const { flags } = common;

  if (flags.debug) cli.enableDebug();
  if (flags.help) cli.showHelp(buildAiSyncHelp(cli), 0);
  if (flags.version) {
    cli.showVersion();
    return;
  }

  const options = parseAiSyncArgs(common.argv);
  cli.debug('resolved options %O', options);
  const stowArgs = [
    '--dir',
    options.dotfilesDir,
    '--target',
    options.target,
    '--restow',
    '--no-folding',
  ];

  if (options.simulate) stowArgs.push('--simulate');
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

  if (options.codexConfigSync) {
    const result = await syncCodexConfig({
      localPath: options.codexConfigLocal,
      outputPath: options.codexConfigOutput,
      sharedPath: options.codexConfigShared,
    });

    if (result.migratedLocal) {
      cli.note('migrated existing Codex config to %s', cli.ts(result.localPath));
    }

    cli.success('generated Codex config at %s', cli.ts(result.outputPath));
  } else {
    cli.note('skipped generated Codex config sync');
  }

  const summaries = await Promise.all([
    summarizePath(path.join(options.target, '.codex', 'skills')),
    summarizePath(path.join(options.target, '.openclaw', 'skills')),
    summarizePath(options.codexConfigOutput),
  ]);

  cli.log(summaries.join('\n'));
}
