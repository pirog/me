import { spawn } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import {
  access,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadAgentModels } from './agent-models.js';
import { checkCodexConfig } from './codex-config-sync.js';
import buildAiSyncEnvironment from '../utils/build-ai-sync-environment.js';
import isExpectedPluginOrigin from '../utils/is-expected-plugin-origin.js';
import pluginSourceDigest from '../utils/plugin-source-digest.js';
import stripStowSimulationNoise from '../utils/strip-stow-simulation-noise.js';

const DEFAULT_ROOT = fileURLToPath(new URL('../', import.meta.url));
const AGENTBOX_HEALTH = '/opt/tanaab/agentbox/bin/health.sh';
const AGENTBOX_PLIST = '/Library/LaunchDaemons/dev.tanaab.agentbox.health.plist';

class BlockedError extends Error {}

async function exists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function realDirectory(target) {
  try {
    return (await lstat(target)).isDirectory();
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function run(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk) => (stdout += chunk));
    child.stderr.setEncoding('utf8').on('data', (chunk) => (stderr += chunk));
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function required(command, args, options) {
  const result = await run(command, args, options);
  if (result.code !== 0) throw new BlockedError(`${command} failed (${result.code}).`);
  return result.stdout.trim();
}

async function brewEnvironment() {
  const skips = new Set((process.env.HOMEBREW_BUNDLE_CASK_SKIP ?? '').split(/\s+/).filter(Boolean));
  let agentboxHost;
  try {
    await access(AGENTBOX_HEALTH, fsConstants.X_OK);
    agentboxHost = (await stat(AGENTBOX_PLIST)).isFile();
  } catch {
    agentboxHost = false;
  }
  if (agentboxHost) {
    skips.add('1password');
    skips.add('tailscale-app');
  } else if ((await run('brew', ['list', '--formula', 'tailscale'])).code === 0) {
    skips.add('tailscale-app');
  }
  return { ...process.env, HOMEBREW_BUNDLE_CASK_SKIP: [...skips].join(' ') };
}

async function homebrewBunVersion() {
  const bunPrefix = await required('brew', ['--prefix', 'oven-sh/bun/bun']);
  const executable = await realpath(path.join(bunPrefix, 'bin', 'bun'));
  return required(executable, ['--version']);
}

async function checkBrewfile({ root }) {
  const brewfile = path.join(root, 'Brewfile');
  if (!(await exists(brewfile))) throw new BlockedError('Brewfile is missing.');
  const env = await brewEnvironment();
  const bundle = await run('brew', ['bundle', 'check', '--file', brewfile, '--no-upgrade'], {
    env,
  });
  if (bundle.code !== 0) return false;
  for (const command of ['brew', 'bun', 'curl', 'git', 'stow', 'zsh']) {
    if ((await run('/usr/bin/which', [command])).code !== 0) return false;
  }

  const expectedBun = (await readFile(path.join(root, '.bun-version'), 'utf8')).trim();
  if ((await homebrewBunVersion()) !== expectedBun) return false;

  const nodePrefix = await required('brew', ['--prefix', 'node@26']);
  const node = await required(path.join(nodePrefix, 'bin', 'node'), ['--version']);
  return /^v26\./.test(node);
}

async function applyBrewfile({ root }) {
  const env = await brewEnvironment();
  await required(
    'brew',
    ['bundle', 'install', '--file', path.join(root, 'Brewfile'), '--no-upgrade'],
    {
      env,
    },
  );
  const expectedBun = (await readFile(path.join(root, '.bun-version'), 'utf8')).trim();
  if ((await homebrewBunVersion()) !== expectedBun) {
    await required('brew', ['upgrade', 'oven-sh/bun/bun']);
  }
}

async function dotfilePackages(root) {
  return (await readdir(path.join(root, 'dotfiles'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function checkDotfiles({ root, home }) {
  for (const relative of ['.codex', '.codex/plugins']) {
    if (!(await realDirectory(path.join(home, relative)))) return false;
  }
  const result = await run('stow', [
    '--simulate',
    '--verbose=1',
    '--dir',
    path.join(root, 'dotfiles'),
    '--target',
    home,
    ...(await dotfilePackages(root)),
  ]);
  if (result.code !== 0) throw new BlockedError('Stow could not simulate the dotfile layout.');
  return stripStowSimulationNoise(`${result.stdout}\n${result.stderr}`) === '';
}

async function applyDotfiles({ root, home }) {
  for (const relative of ['.codex', '.codex/plugins']) {
    const target = path.join(home, relative);
    if (await exists(target)) {
      if (!(await realDirectory(target))) {
        throw new BlockedError(`Codex state path is not a real directory: ${target}`);
      }
    } else {
      await mkdir(target);
    }
  }
  await required('stow', [
    '--restow',
    '--no-folding',
    '--dir',
    path.join(root, 'dotfiles'),
    '--target',
    home,
    ...(await dotfilePackages(root)),
  ]);
}

async function checkConfig({ root, home }) {
  const options = buildAiSyncEnvironment({ repoRoot: root, homedir: home });
  return checkCodexConfig({
    sharedPath: options.codexConfigShared,
    localPath: options.codexConfigLocal,
    outputPath: options.codexConfigOutput,
    agentModels: await loadAgentModels(root),
  });
}

async function applyConfig({ root }) {
  await required('bun', ['run', 'ai:sync'], { cwd: root });
}

function pluginPaths({ root, home, repo, name }) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(repo) || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new BlockedError('Invalid source plugin declaration.');
  }
  return {
    source: repo === 'me' ? root : path.join(home, 'tanaab', repo),
    link: path.join(root, 'dotfiles', 'ai', '.codex', 'plugins', name),
  };
}

async function sourceLinkCurrent(link, source) {
  if (!(await exists(link))) return false;
  const stat = await lstat(link);
  if (!stat.isSymbolicLink()) throw new BlockedError(`Plugin source path is occupied: ${link}`);
  try {
    return (await realpath(link)) === (await realpath(source));
  } catch {
    return false;
  }
}

async function verifiedPluginSource(source, repo) {
  if (repo === 'me') return;
  const origin = await required('git', ['-C', source, 'config', '--get', 'remote.origin.url']);
  if (!isExpectedPluginOrigin(origin, repo)) {
    throw new BlockedError(`Unexpected origin for ${repo}.`);
  }
}

async function buildDigest(source) {
  const listing = await required('git', [
    '-C',
    source,
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '-z',
  ]);
  return pluginSourceDigest(source, listing);
}

async function buildCurrent(source) {
  const output = path.join(source, 'dist', 'codex', 'codex-runtime.js');
  const stamp = path.join(source, 'node_modules', '.cache', 'me-setup-build.sha256');
  if (!(await exists(output)) || !(await exists(stamp))) return false;
  return (await readFile(stamp, 'utf8')).trim() === (await buildDigest(source));
}

async function checkPlugin({ root, home, repo, name, optional, build }) {
  const { source, link } = pluginPaths({ root, home, repo, name });
  if (!(await exists(source))) {
    if (optional && !(await exists(link))) return true;
    throw new BlockedError(`Plugin source checkout is missing: ${source}`);
  }
  await verifiedPluginSource(source, repo);
  const cli = path.join(root, 'node_modules', '.bin', 'codex-tools');
  if (!(await exists(cli))) return false;
  const status = await run(cli, ['status', '--repo-root', source, '--json'], { cwd: source });
  let inspection;
  try {
    inspection = JSON.parse(status.stdout);
  } catch {
    throw new BlockedError(`Codex Tools returned invalid status for ${name}.`);
  }
  if (optional && inspection.inspection?.installed === false) return true;
  if (!(await sourceLinkCurrent(link, source))) return false;
  if (build && !(await buildCurrent(source))) return false;
  if (status.code !== 0) return false;
  if (
    !inspection.ok ||
    !inspection.inspection?.installed ||
    inspection.inspection.enabled !== true
  ) {
    return false;
  }
  const cache = await run(cli, ['cache', 'check', '--repo-root', source, '--json'], {
    cwd: source,
  });
  return cache.code === 0;
}

async function applyPlugin({ root, home, repo, name, optional, build }) {
  const { source, link } = pluginPaths({ root, home, repo, name });
  if (!(await exists(source))) {
    if (optional && !(await exists(link))) return;
    throw new BlockedError(`Plugin source checkout is missing: ${source}`);
  }
  await verifiedPluginSource(source, repo);
  if (await exists(link)) {
    if (!(await sourceLinkCurrent(link, source))) {
      throw new BlockedError(`Plugin source link points elsewhere: ${link}`);
    }
  } else {
    await mkdir(path.dirname(link), { recursive: true });
    await symlink(path.relative(path.dirname(link), source), link);
    await required('bun', ['run', 'ai:sync', '--no-codex-config'], { cwd: root });
  }

  await required('bun', ['install', '--frozen-lockfile', '--ignore-scripts'], { cwd: source });
  if (build) {
    await required('bun', ['run', 'build'], { cwd: source });
    const stamp = path.join(source, 'node_modules', '.cache', 'me-setup-build.sha256');
    await mkdir(path.dirname(stamp), { recursive: true });
    await writeFile(stamp, `${await buildDigest(source)}\n`, { mode: 0o600 });
  }
  const cli = path.join(source, 'node_modules', '.bin', 'codex-tools');
  const status = await run(cli, ['status', '--repo-root', source, '--json'], { cwd: source });
  let inspection;
  try {
    inspection = JSON.parse(status.stdout).inspection;
  } catch {
    throw new BlockedError(`Codex Tools returned invalid status for ${name}.`);
  }
  if (status.code > 1) throw new BlockedError(`Codex Tools could not inspect ${name}.`);
  if (!(inspection?.installed && inspection.enabled === true)) {
    await required(cli, ['install', source], { cwd: source });
  }
  await required(cli, ['cache', 'sync', '--repo-root', source], { cwd: source });
}

/** Run one declared Agent System setup step. Exit 1 means drift; 2 means blocked. */
export async function runSetup(argv, options = {}) {
  const [mode, step, ...extra] = argv;
  const context = { root: options.root ?? DEFAULT_ROOT, home: options.home ?? os.homedir() };
  const operations = {
    brewfile: [checkBrewfile, applyBrewfile],
    dotfiles: [checkDotfiles, applyDotfiles],
    config: [checkConfig, applyConfig],
    plugin: [checkPlugin, applyPlugin],
  };
  if (!['check', 'apply'].includes(mode) || !Object.hasOwn(operations, step)) return 2;
  if (step === 'plugin') {
    const [repo, name, ...flags] = extra;
    if (!repo || !name || flags.some((flag) => !['optional', 'build'].includes(flag))) return 2;
    Object.assign(context, {
      repo,
      name,
      optional: flags.includes('optional'),
      build: flags.includes('build'),
    });
  } else if (extra.length > 0) return 2;

  try {
    if (mode === 'apply') {
      await operations[step][1](context);
      return 0;
    }
    return (await operations[step][0](context)) ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${step}: ${message}\n`);
    return 2;
  }
}
