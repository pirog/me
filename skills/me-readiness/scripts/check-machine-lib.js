import { constants as fsConstants } from 'node:fs';
import { execFile as execFileCallback } from 'node:child_process';
import {
  access as defaultAccess,
  lstat as defaultLstat,
  readFile as defaultReadFile,
  readdir as defaultReaddir,
  realpath as defaultRealpath,
  stat as defaultStat,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFileCallback);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..');
const PRIVATE_CONFIG_MODE = 0o600;
const EXPECTED_TAILNET_NAME = 'tanaab.dev';
const MINIMUM_NODE_MAJOR_VERSION = 24;
const MINIMUM_ONEPASSWORD_ENVIRONMENT_CLI_VERSION = '2.33.0-beta.02';
const READINESS_AUTHORIZATION_CODE_KEY = 'READINESS_AUTHORIZATION_CODE';
const EXPECTED_READINESS_AUTHORIZATION_CODE_SHA256 =
  'a924fd4b1d47841c36ae7663db374cf040b913ffa56541fe0f345435e3cce267';
const ONEPASSWORD_ENVIRONMENT_VALIDATION_SCRIPT = `import { createHash } from "node:crypto";const value=process.env.${READINESS_AUTHORIZATION_CODE_KEY};const hash=value?createHash("sha256").update(value).digest("hex"):"";process.stdout.write(JSON.stringify({present:Boolean(value),matches:hash==="${EXPECTED_READINESS_AUTHORIZATION_CODE_SHA256}"}));`;

export const AGENTBOX_HEALTH_SCRIPT_PATH = '/opt/tanaab/agentbox/bin/health.sh';
export const AGENTBOX_HEALTH_PLIST_PATH = '/Library/LaunchDaemons/dev.tanaab.agentbox.health.plist';
export const EXPECTED_ONEPASSWORD_ENVIRONMENT_ID = 'zsstdfqknicwfv5glv76gd6tue';
export const REQUIRED_COMMANDS = ['brew', 'bun', 'curl', 'git', 'stow', 'zsh'];
export const ONEPASSWORD_TOKEN_ENV_KEYS = [
  'PIROME_OP_TOKEN',
  'TANAAB_OP_TOKEN',
  'OP_SERVICE_ACCOUNT_TOKEN',
  'OP_CONNECT_TOKEN',
  'OP_SESSION',
];
export const CHECK_BUCKET_ORDER = Object.freeze([
  'homebrew',
  'packages',
  'dotfiles',
  'manual_apps',
  'codex_plugins',
]);

const AGENTBOX_SKIPPED_CASKS = new Set(['1password', 'tailscale-app']);
const CHECK_BUCKET_BY_ID = new Map([
  ['command_brew', 'homebrew'],
  ['homebrew_writable', 'homebrew'],
  ['brewfile_readable', 'packages'],
  ['brewfile_formulas_installed', 'packages'],
  ['brewfile_casks_installed', 'packages'],
  ...REQUIRED_COMMANDS.filter((command) => command !== 'brew').map((command) => [
    `command_${command}`,
    'packages',
  ]),
  ['node_version', 'packages'],
  ['dotfiles_stowed', 'dotfiles'],
  ['vim_janus_runtime', 'dotfiles'],
  ['codex_generated_config', 'dotfiles'],
  ['command_op', 'manual_apps'],
  ['onepassword_cli_vault_access', 'manual_apps'],
  ['onepassword_environment_cli', 'manual_apps'],
  ['onepassword_environment_run', 'manual_apps'],
  ['command_tailscale', 'manual_apps'],
  ['command_tailscaled', 'manual_apps'],
  ['tailscale_status', 'manual_apps'],
  ['bootstrap_token_env', 'manual_apps'],
  ['codex_piroplugin_link', 'codex_plugins'],
]);
const CHECK_STATUSES = new Set(['pass', 'warn', 'fail']);

function makeCheck({ id, message, remediation, status }) {
  const bucket = CHECK_BUCKET_BY_ID.get(id);

  if (!bucket) {
    throw new Error(`No readiness bucket assigned for check ${id}.`);
  }

  if (!CHECK_STATUSES.has(status)) {
    throw new Error(`Unsupported readiness status ${status}.`);
  }

  const check = { bucket, id, status, message };
  if (status !== 'pass') {
    check.remediation = remediation;
  }

  return check;
}

function pass(id, message) {
  return makeCheck({ id, status: 'pass', message });
}

function warn(id, message, remediation) {
  return makeCheck({ id, status: 'warn', message, remediation });
}

function fail(id, message, remediation) {
  return makeCheck({ id, status: 'fail', message, remediation });
}

function formatMode(mode) {
  return `0${(mode & 0o777).toString(8)}`;
}

function formatErrorDetail(error) {
  const stderr = typeof error?.stderr === 'string' ? error.stderr : '';
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (stderr || message).replace(/\s+/g, ' ').trim();
}

function stripStowSimulationNoise(output) {
  return output
    .split(/\r?\n/)
    .filter((line) => line.trim() !== 'WARNING: in simulation mode so not modifying filesystem.')
    .join('\n')
    .trim();
}

function parseBrewfileEntries(brewfile) {
  const formulas = [];
  const casks = [];

  for (const line of brewfile.split(/\r?\n/)) {
    const formula = line.match(/^\s*brew\s+["']([^"']+)["']/)?.[1];
    const cask = line.match(/^\s*cask\s+["']([^"']+)["']/)?.[1];

    if (formula && !formulas.includes(formula)) {
      formulas.push(formula);
    }
    if (cask && !casks.includes(cask)) {
      casks.push(cask);
    }
  }

  return { casks, formulas };
}

async function defaultCommandExists(command) {
  try {
    await execFileAsync('which', [command], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function defaultExecFile(command, args, options = {}) {
  const { stderr, stdout } = await execFileAsync(command, args, {
    env: options.env ?? process.env,
    maxBuffer: 1024 * 1024,
    timeout: options.timeout ?? 10000,
  });

  return { stderr, stdout };
}

async function pathInfo(targetPath, deps) {
  try {
    return await deps.lstat(targetPath);
  } catch {
    return null;
  }
}

function onePasswordTokenEnvKeys(env) {
  return Object.keys(env).filter(
    (key) => ONEPASSWORD_TOKEN_ENV_KEYS.includes(key) || key.startsWith('OP_SESSION_'),
  );
}

function commandEnvWithoutOnePasswordTokenFallbacks(env) {
  const commandEnv = { ...env };
  for (const key of onePasswordTokenEnvKeys(env)) {
    delete commandEnv[key];
  }
  return commandEnv;
}

async function requiredCommandCheck(command, deps) {
  return (await deps.commandExists(command))
    ? pass(`command_${command}`, `Command "${command}" is available.`)
    : fail(
        `command_${command}`,
        `Command "${command}" is not available on PATH.`,
        'Rerun https://boot.pirog.me/boot.sh or install the missing Brewfile formula.',
      );
}

async function optionalCommandCheck(command, remediation, deps) {
  return (await deps.commandExists(command))
    ? pass(`command_${command}`, `Optional command "${command}" is available.`)
    : warn(
        `command_${command}`,
        `Optional command "${command}" is not available on PATH.`,
        remediation,
      );
}

function getCheck(checks, id) {
  return checks.find((check) => check.id === id);
}

async function agentboxHostInstalled(deps) {
  const [healthScript, healthPlist] = await Promise.all([
    pathInfo(AGENTBOX_HEALTH_SCRIPT_PATH, deps),
    pathInfo(AGENTBOX_HEALTH_PLIST_PATH, deps),
  ]);

  return Boolean(
    healthScript?.isFile?.() && (healthScript.mode & 0o111) !== 0 && healthPlist?.isFile?.(),
  );
}

async function appendHomebrewWritabilityCheck(checks, deps) {
  if (getCheck(checks, 'command_brew')?.status === 'fail') {
    checks.push(
      fail(
        'homebrew_writable',
        'Homebrew writability could not be checked because brew is missing.',
        'Install Homebrew for the current macOS user, then rerun the readiness helper.',
      ),
    );
    return;
  }

  const locations = [];
  try {
    for (const args of [['--prefix'], ['--cellar'], ['--cache']]) {
      const { stdout } = await deps.execFile('brew', args);
      locations.push(stdout.trim());
    }
  } catch {
    checks.push(
      fail(
        'homebrew_writable',
        'Homebrew could not report its prefix, Cellar, and cache locations.',
        'Repair the Homebrew installation for the current macOS user, then rerun brew doctor.',
      ),
    );
    return;
  }

  const unwritable = [];
  for (const location of locations) {
    try {
      await deps.access(location, fsConstants.W_OK);
    } catch {
      unwritable.push(location);
    }
  }

  checks.push(
    unwritable.length === 0
      ? pass('homebrew_writable', 'Homebrew prefix, Cellar, and cache are writable.')
      : fail(
          'homebrew_writable',
          `Homebrew location(s) are not writable: ${unwritable.join(', ')}.`,
          'Repair Homebrew permissions for the current macOS user, then rerun brew doctor.',
        ),
  );
}

async function brewPackageInstalled(type, name, deps) {
  try {
    await deps.execFile('brew', ['list', type === 'formula' ? '--formula' : '--cask', name]);
    return true;
  } catch {
    return false;
  }
}

async function appendBrewfileChecks(checks, repoRoot, agentboxHost, deps) {
  const brewfilePath = path.join(repoRoot, 'Brewfile');
  let brewfile;

  try {
    brewfile = await deps.readFile(brewfilePath, 'utf8');
  } catch {
    checks.push(
      fail(
        'brewfile_readable',
        `Brewfile was not readable at ${brewfilePath}.`,
        'Run this probe from the me checkout or rerun https://boot.pirog.me/boot.sh to materialize the repo.',
      ),
      fail(
        'brewfile_formulas_installed',
        'Brewfile formulas could not be checked because the Brewfile is unreadable.',
        'Restore the me checkout and rerun the readiness helper.',
      ),
      warn(
        'brewfile_casks_installed',
        'Brewfile casks could not be checked because the Brewfile is unreadable.',
        'Restore the me checkout and rerun the readiness helper.',
      ),
    );
    return;
  }

  checks.push(pass('brewfile_readable', 'Brewfile is readable.'));
  const { casks, formulas } = parseBrewfileEntries(brewfile);

  if (getCheck(checks, 'command_brew')?.status === 'fail') {
    checks.push(
      fail(
        'brewfile_formulas_installed',
        'Brewfile formulas could not be checked because brew is missing.',
        'Install Homebrew and rerun https://boot.pirog.me/boot.sh.',
      ),
      warn(
        'brewfile_casks_installed',
        'Brewfile casks could not be checked because brew is missing.',
        'Install Homebrew and rerun https://boot.pirog.me/boot.sh.',
      ),
    );
    return;
  }

  const missingFormulas = [];
  for (const formula of formulas) {
    if (!(await brewPackageInstalled('formula', formula, deps))) {
      missingFormulas.push(formula);
    }
  }
  checks.push(
    missingFormulas.length === 0
      ? pass(
          'brewfile_formulas_installed',
          `All ${formulas.length} Brewfile formulas are installed.`,
        )
      : fail(
          'brewfile_formulas_installed',
          `Missing Brewfile formula(s): ${missingFormulas.join(', ')}.`,
          'Rerun https://boot.pirog.me/boot.sh to install every required Brewfile formula.',
        ),
  );

  const checkedCasks = agentboxHost
    ? casks.filter((cask) => !AGENTBOX_SKIPPED_CASKS.has(cask))
    : casks;
  const missingCasks = [];
  for (const cask of checkedCasks) {
    if (!(await brewPackageInstalled('cask', cask, deps))) {
      missingCasks.push(cask);
    }
  }
  const agentboxNote = agentboxHost
    ? ' Agentbox intentionally skips 1password and tailscale-app.'
    : '';
  checks.push(
    missingCasks.length === 0
      ? pass(
          'brewfile_casks_installed',
          `All ${checkedCasks.length} applicable Brewfile casks are installed.${agentboxNote}`,
        )
      : warn(
          'brewfile_casks_installed',
          `Missing optional Brewfile cask(s): ${missingCasks.join(', ')}.${agentboxNote}`,
          'Rerun https://boot.pirog.me/boot.sh or install the optional applications you want on this machine.',
        ),
  );
}

async function appendRequiredCommandChecks(checks, deps) {
  for (const command of REQUIRED_COMMANDS.filter((entry) => entry !== 'brew')) {
    checks.push(await requiredCommandCheck(command, deps));
  }
}

async function appendNodeRuntimeCheck(checks, deps) {
  if (getCheck(checks, 'command_brew')?.status === 'fail') {
    checks.push(
      fail(
        'node_version',
        'The Homebrew node@24 runtime could not be checked because brew is missing.',
        'Install Homebrew and node@24 from the Brewfile.',
      ),
    );
    return;
  }

  try {
    const { stdout: prefixOutput } = await deps.execFile('brew', ['--prefix', 'node@24']);
    const nodePath = path.join(prefixOutput.trim(), 'bin', 'node');
    const { stdout: versionOutput } = await deps.execFile(nodePath, ['--version']);
    const version = versionOutput.trim();
    const major = Number.parseInt(version.replace(/^v/, '').split('.')[0] ?? '', 10);
    checks.push(
      major >= MINIMUM_NODE_MAJOR_VERSION
        ? pass('node_version', `Homebrew node@24 reports supported version ${version}.`)
        : fail(
            'node_version',
            `Homebrew node@24 reports version ${version || 'unknown'}, expected major version ${MINIMUM_NODE_MAJOR_VERSION} or newer.`,
            'Install or update node@24 from the Brewfile.',
          ),
    );
  } catch {
    checks.push(
      fail(
        'node_version',
        'The Homebrew node@24 binary could not be resolved or executed.',
        'Install or repair node@24 from the Brewfile.',
      ),
    );
  }
}

async function appendDotfileChecks(checks, repoRoot, homeDir, deps) {
  const dotfilesRoot = path.join(repoRoot, 'dotfiles');
  let packages;

  try {
    const entries = await deps.readdir(dotfilesRoot, { withFileTypes: true });
    packages = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    checks.push(
      fail(
        'dotfiles_stowed',
        `Dotfile packages could not be read from ${dotfilesRoot}.`,
        'Restore the me checkout and rerun https://boot.pirog.me/boot.sh.',
      ),
    );
    return;
  }

  if (getCheck(checks, 'command_stow')?.status === 'fail') {
    checks.push(
      fail(
        'dotfiles_stowed',
        'Dotfile installation could not be checked because stow is missing.',
        'Install Stow from the Brewfile and rerun https://boot.pirog.me/boot.sh.',
      ),
    );
    return;
  }

  try {
    const { stderr = '', stdout = '' } = await deps.execFile('stow', [
      '--simulate',
      '--verbose=1',
      '--dir',
      dotfilesRoot,
      '--target',
      homeDir,
      ...packages,
    ]);
    const changes = stripStowSimulationNoise(`${stdout}\n${stderr}`);
    checks.push(
      changes === ''
        ? pass('dotfiles_stowed', `All ${packages.length} dotfile packages are fully stowed.`)
        : fail(
            'dotfiles_stowed',
            'The repo-owned dotfile packages are not fully stowed into the current home directory.',
            'Rerun https://boot.pirog.me/boot.sh or run bun run ai:sync for the ai package, then rerun readiness.',
          ),
    );
  } catch {
    checks.push(
      fail(
        'dotfiles_stowed',
        'Stow could not simulate the complete repo-owned dotfile layout.',
        'Resolve Stow conflicts and rerun https://boot.pirog.me/boot.sh.',
      ),
    );
  }
}

async function appendVimJanusRuntimeCheck(checks, homeDir, deps) {
  const janusRuntimePath = path.join(homeDir, '.vim', 'janus', 'vim');
  const requiredFiles = [
    path.join(janusRuntimePath, 'core', 'before', 'plugin', 'janus.vim'),
    path.join(janusRuntimePath, 'core', 'plugins.vim'),
  ];
  const missing = [];

  for (const requiredFile of requiredFiles) {
    if (!(await pathInfo(requiredFile, deps))) {
      missing.push(requiredFile);
    }
  }

  checks.push(
    missing.length === 0
      ? pass('vim_janus_runtime', 'Janus runtime exists at ~/.vim/janus/vim.')
      : warn(
          'vim_janus_runtime',
          `Optional Janus runtime is incomplete: ${missing.join(', ')}.`,
          'Restore the Janus runtime at ~/.vim/janus/vim before relying on the Vim profile.',
        ),
  );
}

async function appendGeneratedConfigCheck(checks, homeDir, deps) {
  const generatedConfigPath = path.join(homeDir, '.codex', 'config.toml');
  try {
    const configStat = await deps.stat(generatedConfigPath);
    const mode = configStat.mode & 0o777;
    checks.push(
      mode === PRIVATE_CONFIG_MODE
        ? pass('codex_generated_config', '~/.codex/config.toml exists with private permissions.')
        : warn(
            'codex_generated_config',
            `~/.codex/config.toml exists with mode ${formatMode(configStat.mode)}, expected 0600.`,
            'Run bun run ai:sync from /Users/pirog/tanaab/me to regenerate Codex config with private permissions.',
          ),
    );
  } catch {
    checks.push(
      fail(
        'codex_generated_config',
        '~/.codex/config.toml is missing.',
        'Run bun run ai:sync from /Users/pirog/tanaab/me to generate Codex config.',
      ),
    );
  }
}

function checkOnePasswordEnvironmentRun(result) {
  if (!result || typeof result !== 'object') {
    return warn(
      'onepassword_environment_run',
      '1Password Environment readiness output was not a JSON object.',
      'Confirm the readiness Environment is accessible through 1Password Developer.',
    );
  }
  if (result.present !== true || result.matches !== true) {
    return warn(
      'onepassword_environment_run',
      result.present === true
        ? `${READINESS_AUTHORIZATION_CODE_KEY} did not match the expected readiness sentinel.`
        : `${READINESS_AUTHORIZATION_CODE_KEY} was not provided by the 1Password Environment.`,
      'Confirm the readiness Environment contains the expected authorization sentinel.',
    );
  }
  return pass(
    'onepassword_environment_run',
    '1Password Environment provided the expected readiness authorization sentinel.',
  );
}

function formatOnePasswordCommandError(error) {
  const detail = formatErrorDetail(error);
  return /couldn'?t connect to the 1Password desktop app/i.test(detail)
    ? {
        message: '1Password CLI could not connect to the desktop app from this process.',
        remediation:
          'If this was sandboxed, rerun readiness with unsandboxed local access. Otherwise open and unlock 1Password and enable CLI integration.',
      }
    : {
        message: '1Password CLI vault access check failed.',
        remediation: 'Open and unlock 1Password, enable CLI integration, then rerun op vault list.',
      };
}

async function appendOnePasswordChecks(checks, agentboxHost, env, deps) {
  checks.push(
    await optionalCommandCheck(
      'op',
      'Install the optional 1Password CLI beta cask if protected-resource access is needed.',
      deps,
    ),
  );

  if (agentboxHost) {
    checks.push(
      pass(
        'onepassword_cli_vault_access',
        'Desktop-backed vault access is not required on Agentbox.',
      ),
      pass(
        'onepassword_environment_cli',
        'Desktop Environment integration is not required on Agentbox.',
      ),
      pass(
        'onepassword_environment_run',
        'Desktop Environment authorization is not required on Agentbox.',
      ),
    );
    return;
  }

  if (getCheck(checks, 'command_op')?.status === 'warn') {
    checks.push(
      warn(
        'onepassword_cli_vault_access',
        '1Password vault access was not checked because op is missing.',
        'Install the optional 1Password CLI beta cask and configure desktop integration if needed.',
      ),
      warn(
        'onepassword_environment_cli',
        '1Password Environment support was not checked because op is missing.',
        'Install the optional 1Password CLI beta cask if Environment access is needed.',
      ),
      warn(
        'onepassword_environment_run',
        '1Password Environment authorization was not checked because op is missing.',
        'Install and configure 1Password Environment access if needed.',
      ),
    );
    return;
  }

  try {
    const { stdout } = await deps.execFile('op', ['vault', 'list', '--format', 'json'], {
      env: commandEnvWithoutOnePasswordTokenFallbacks(env),
    });
    const vaults = JSON.parse(stdout);
    checks.push(
      Array.isArray(vaults) && vaults.length > 0
        ? pass('onepassword_cli_vault_access', `1Password CLI can list ${vaults.length} vault(s).`)
        : warn(
            'onepassword_cli_vault_access',
            '1Password CLI cannot list vaults for a signed-in account.',
            'Open and unlock 1Password, enable CLI integration, then rerun op vault list.',
          ),
    );
  } catch (error) {
    const formatted = formatOnePasswordCommandError(error);
    checks.push(warn('onepassword_cli_vault_access', formatted.message, formatted.remediation));
  }

  let environmentCliSupported = false;
  try {
    await deps.execFile('op', ['environment', 'read', '--help'], {
      env: commandEnvWithoutOnePasswordTokenFallbacks(env),
    });
    environmentCliSupported = true;
    checks.push(
      pass('onepassword_environment_cli', '1Password CLI supports 1Password Environments.'),
    );
  } catch {
    checks.push(
      warn(
        'onepassword_environment_cli',
        '1Password Environment CLI support is unavailable.',
        `Install or update to 1Password CLI beta ${MINIMUM_ONEPASSWORD_ENVIRONMENT_CLI_VERSION} or newer.`,
      ),
    );
  }

  if (!environmentCliSupported) {
    checks.push(
      warn(
        'onepassword_environment_run',
        '1Password Environment authorization was not checked because CLI support is unavailable.',
        'Install the 1Password CLI beta and configure Environment access if needed.',
      ),
    );
    return;
  }

  try {
    const { stdout } = await deps.execFile(
      'op',
      [
        'run',
        '--environment',
        EXPECTED_ONEPASSWORD_ENVIRONMENT_ID,
        '--',
        'bun',
        '-e',
        ONEPASSWORD_ENVIRONMENT_VALIDATION_SCRIPT,
      ],
      { env: commandEnvWithoutOnePasswordTokenFallbacks(env) },
    );
    checks.push(checkOnePasswordEnvironmentRun(JSON.parse(stdout)));
  } catch {
    checks.push(
      warn(
        'onepassword_environment_run',
        '1Password Environment authorization check failed.',
        'Confirm desktop integration and readiness Environment access if protected resources are needed.',
      ),
    );
  }
}

function tailscaleRemediation(agentboxHost) {
  return agentboxHost
    ? 'Run the Agentbox health report and repair its managed tailscaled service if network access is needed.'
    : 'Open Tailscale and connect this machine to the tanaab.dev tailnet if network access is needed.';
}

function checkTailscaleStatus(status, agentboxHost) {
  const issues = [];
  if (!status || typeof status !== 'object') {
    issues.push('status output was not a JSON object');
  } else {
    if (status.BackendState !== 'Running') issues.push('backend is not running');
    if (status.Self?.Online !== true) issues.push('local node is not online');
    if (status.Self?.InNetworkMap !== true) issues.push('local node is not in the network map');
    if (!Array.isArray(status.TailscaleIPs) || status.TailscaleIPs.length === 0) {
      issues.push('no Tailscale IPs are assigned');
    }
    if (status.CurrentTailnet?.Name !== EXPECTED_TAILNET_NAME) {
      issues.push(`tailnet is "${String(status.CurrentTailnet?.Name ?? 'missing')}"`);
    }
  }

  return issues.length === 0
    ? pass('tailscale_status', `Tailscale is running on the ${EXPECTED_TAILNET_NAME} tailnet.`)
    : warn(
        'tailscale_status',
        `Tailscale is not ready: ${issues.join('; ')}.`,
        tailscaleRemediation(agentboxHost),
      );
}

async function appendTailscaleChecks(checks, agentboxHost, deps) {
  checks.push(await optionalCommandCheck('tailscale', tailscaleRemediation(agentboxHost), deps));

  if (agentboxHost) {
    checks.push(
      (await deps.commandExists('tailscaled'))
        ? pass('command_tailscaled', 'Optional Agentbox tailscaled command is available.')
        : warn(
            'command_tailscaled',
            'Agentbox tailscaled is not available on PATH.',
            tailscaleRemediation(true),
          ),
    );
  }

  if (getCheck(checks, 'command_tailscale')?.status === 'warn') {
    checks.push(
      warn(
        'tailscale_status',
        'Tailscale status was not checked because the tailscale command is missing.',
        tailscaleRemediation(agentboxHost),
      ),
    );
    return;
  }

  try {
    const { stdout } = await deps.execFile('tailscale', ['status', '--json']);
    checks.push(checkTailscaleStatus(JSON.parse(stdout), agentboxHost));
  } catch {
    checks.push(
      warn(
        'tailscale_status',
        'Tailscale status check failed.',
        tailscaleRemediation(agentboxHost),
      ),
    );
  }
}

function appendTokenFallbackCheck(checks, env) {
  const presentTokenKeys = onePasswordTokenEnvKeys(env);
  checks.push(
    presentTokenKeys.length === 0
      ? pass('bootstrap_token_env', 'No 1Password token fallback variables are present.')
      : warn(
          'bootstrap_token_env',
          `1Password token fallback variable(s) are still set: ${presentTokenKeys.join(', ')}.`,
          'Unset persistent 1Password token fallback variables when they are no longer needed.',
        ),
  );
}

async function appendCodexPluginCheck(checks, repoRoot, homeDir, deps) {
  const linkPath = path.join(homeDir, '.codex', 'plugins', 'piroplugin');
  const info = await pathInfo(linkPath, deps);
  if (!info?.isSymbolicLink?.()) {
    checks.push(
      fail(
        'codex_piroplugin_link',
        '~/.codex/plugins/piroplugin is missing or is not a symbolic link.',
        'Rerun https://boot.pirog.me/boot.sh or bun run ai:sync from the me checkout.',
      ),
    );
    return;
  }

  try {
    const [actualTarget, expectedTarget] = await Promise.all([
      deps.realpath(linkPath),
      deps.realpath(repoRoot),
    ]);
    checks.push(
      actualTarget === expectedTarget
        ? pass('codex_piroplugin_link', 'piroplugin is linked to the current me checkout.')
        : fail(
            'codex_piroplugin_link',
            `piroplugin resolves to ${actualTarget}, expected ${expectedTarget}.`,
            'Rerun https://boot.pirog.me/boot.sh or bun run ai:sync from the current me checkout.',
          ),
    );
  } catch {
    checks.push(
      fail(
        'codex_piroplugin_link',
        'piroplugin link target could not be resolved.',
        'Rerun https://boot.pirog.me/boot.sh or bun run ai:sync from the current me checkout.',
      ),
    );
  }
}

/**
 * Runs the read-only local readiness checks and returns the stable helper report.
 *
 * @param {object} [options] Runtime overrides and test seams for filesystem, command, and env access.
 * @returns {Promise<{ok: boolean, checks: Array<object>}>} Readiness report shaped as `{ ok, checks }`.
 */
export async function checkMachine(options = {}) {
  const deps = {
    access: defaultAccess,
    commandExists: defaultCommandExists,
    execFile: defaultExecFile,
    lstat: defaultLstat,
    readFile: defaultReadFile,
    readdir: defaultReaddir,
    realpath: defaultRealpath,
    stat: defaultStat,
    ...(options.deps ?? {}),
  };
  const env = options.env ?? process.env;
  const homeDir = options.homeDir ?? os.homedir();
  const repoRoot = options.repoRoot ?? DEFAULT_REPO_ROOT;
  const checks = [];
  const agentboxHost = await agentboxHostInstalled(deps);

  checks.push(await requiredCommandCheck('brew', deps));
  await appendHomebrewWritabilityCheck(checks, deps);
  await appendBrewfileChecks(checks, repoRoot, agentboxHost, deps);
  await appendRequiredCommandChecks(checks, deps);
  await appendNodeRuntimeCheck(checks, deps);
  await appendDotfileChecks(checks, repoRoot, homeDir, deps);
  await appendVimJanusRuntimeCheck(checks, homeDir, deps);
  await appendGeneratedConfigCheck(checks, homeDir, deps);
  await appendOnePasswordChecks(checks, agentboxHost, env, deps);
  await appendTailscaleChecks(checks, agentboxHost, deps);
  appendTokenFallbackCheck(checks, env);
  await appendCodexPluginCheck(checks, repoRoot, homeDir, deps);

  return {
    ok: !checks.some((check) => check.status === 'fail'),
    checks,
  };
}

export function formatReport(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}
