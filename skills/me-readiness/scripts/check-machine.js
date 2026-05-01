#!/usr/bin/env bun

import { execFile as execFileCallback } from 'node:child_process';
import {
  lstat as defaultLstat,
  readFile as defaultReadFile,
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

export const REQUIRED_BREWFILE_CASKS = ['1password', '1password-cli', 'tailscale'];
export const REQUIRED_COMMANDS = ['brew', 'bun', 'git', 'gh', 'op', 'stow', 'tailscale'];
export const BOOTSTRAP_TOKEN_ENV_KEYS = [
  'PIROME_OP_TOKEN',
  'OP_SERVICE_ACCOUNT_TOKEN',
  'TANAAB_OP_TOKEN',
];
export const CHECK_BUCKET_ORDER = Object.freeze([
  'homebrew',
  'packages',
  'dotfiles',
  'manual_apps',
  'codex_plugins',
]);

const DOTFILE_LINKS = [
  {
    id: 'codex_agents_link',
    relativePath: ['.codex', 'AGENTS.md'],
    label: '~/.codex/AGENTS.md',
  },
  {
    id: 'codex_shared_config_link',
    relativePath: ['.codex', 'config.shared.toml'],
    label: '~/.codex/config.shared.toml',
  },
];

const CODEX_PLUGIN_LINKS = [
  {
    id: 'codex_piroplugin_link',
    relativePath: ['.codex', 'plugins', 'piroplugin'],
    label: '~/.codex/plugins/piroplugin',
  },
  {
    id: 'codex_tanaab_link',
    relativePath: ['.codex', 'plugins', 'tanaab'],
    label: '~/.codex/plugins/tanaab',
  },
];

function checkIdSegment(value) {
  return value.replace(/[^a-z0-9]+/g, '_');
}

const CHECK_BUCKET_BY_ID = new Map([
  ...REQUIRED_COMMANDS.map((command) => [
    `command_${command}`,
    command === 'brew' ? 'homebrew' : 'packages',
  ]),
  ['brewfile_readable', 'packages'],
  ...REQUIRED_BREWFILE_CASKS.map((cask) => [`brewfile_cask_${checkIdSegment(cask)}`, 'packages']),
  ['codex_agents_link', 'dotfiles'],
  ['codex_shared_config_link', 'dotfiles'],
  ['codex_generated_config', 'dotfiles'],
  ['onepassword_app', 'manual_apps'],
  ['onepassword_cli_vault_access', 'manual_apps'],
  ['tailscale_app', 'manual_apps'],
  ['tailscale_status', 'manual_apps'],
  ['bootstrap_token_env', 'manual_apps'],
  ['codex_piroplugin_link', 'codex_plugins'],
  ['codex_tanaab_link', 'codex_plugins'],
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

function hasCask(brewfile, cask) {
  return new RegExp(
    `^\\s*cask\\s+["']${cask.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`,
    'm',
  ).test(brewfile);
}

function formatMode(mode) {
  return `0${(mode & 0o777).toString(8)}`;
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
  const { stdout } = await execFileAsync(command, args, {
    env: options.env ?? process.env,
    maxBuffer: 1024 * 1024,
    timeout: options.timeout ?? 10000,
  });

  return { stdout };
}

function formatErrorDetail(error) {
  const stderr = typeof error?.stderr === 'string' ? error.stderr : '';
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (stderr || message).replace(/\s+/g, ' ').trim();
}

function formatOnePasswordCommandError(error) {
  const detail = formatErrorDetail(error);

  if (/couldn'?t connect to the 1Password desktop app/i.test(detail)) {
    return {
      message: '1Password CLI could not connect to the 1Password desktop app from this process.',
      remediation:
        'If op vault list --format json works in your terminal, rerun the readiness helper with unsandboxed local access from Codex. Otherwise open 1Password, sign in, unlock it, and enable Developer > Integrate with 1Password CLI.',
    };
  }

  return {
    message: '1Password CLI vault access check failed.',
    remediation:
      'Open 1Password, sign in, unlock it, enable Developer > Integrate with 1Password CLI, then rerun op vault list.',
  };
}

function formatTailscaleCommandError(error) {
  const detail = formatErrorDetail(error);

  if (/failed to connect to local Tailscaled|local tailscaled|tailscaled process/i.test(detail)) {
    return {
      message: 'Tailscale CLI could not connect to the local Tailscale service from this process.',
      remediation:
        'If tailscale status --json works in your terminal, rerun the readiness helper with unsandboxed local access from Codex. Otherwise open Tailscale, sign in, and connect this machine to the tanaab.dev tailnet.',
    };
  }

  return {
    message: 'Tailscale status check failed.',
    remediation:
      'Open Tailscale, sign in, connect this machine to the tanaab.dev tailnet, then rerun tailscale status --json.',
  };
}

async function pathInfo(targetPath, deps) {
  try {
    return await deps.lstat(targetPath);
  } catch {
    return null;
  }
}

function commandEnvWithoutBootstrapTokens(env) {
  const commandEnv = { ...env };

  for (const key of BOOTSTRAP_TOKEN_ENV_KEYS) {
    delete commandEnv[key];
  }

  return commandEnv;
}

async function commandCheck(command, deps) {
  return (await deps.commandExists(command))
    ? pass(`command_${command}`, `Command "${command}" is available.`)
    : fail(
        `command_${command}`,
        `Command "${command}" is not available on PATH.`,
        'Rerun https://boot.pirog.me/boot.sh or install the missing Brewfile dependency.',
      );
}

function getCheck(checks, id) {
  return checks.find((check) => check.id === id);
}

function checkTailscaleStatus(status) {
  if (!status || typeof status !== 'object') {
    return fail(
      'tailscale_status',
      'Tailscale status output was not a JSON object.',
      'Open Tailscale, sign in, connect this machine to the tanaab.dev tailnet, then rerun tailscale status --json.',
    );
  }

  const issues = [];
  const tailscaleIps = Array.isArray(status.TailscaleIPs) ? status.TailscaleIPs : [];
  const tailnetName = status.CurrentTailnet?.Name;

  if (status.BackendState !== 'Running') {
    issues.push(`BackendState is "${String(status.BackendState ?? 'missing')}"`);
  }

  if (status.Self?.Online !== true) {
    issues.push('local node is not online');
  }

  if (status.Self?.InNetworkMap !== true) {
    issues.push('local node is not in the network map');
  }

  if (tailscaleIps.length === 0) {
    issues.push('no Tailscale IPs are assigned');
  }

  if (tailnetName !== EXPECTED_TAILNET_NAME) {
    issues.push(`CurrentTailnet.Name is "${String(tailnetName ?? 'missing')}"`);
  }

  return issues.length === 0
    ? pass('tailscale_status', `Tailscale is running on the ${EXPECTED_TAILNET_NAME} tailnet.`)
    : fail(
        'tailscale_status',
        `Tailscale is not ready: ${issues.join('; ')}.`,
        'Open Tailscale, sign in, connect this machine to the tanaab.dev tailnet, then rerun tailscale status --json.',
      );
}

async function appendStowedLinkChecks(checks, links, homeDir, deps) {
  for (const link of links) {
    const targetPath = path.join(homeDir, ...link.relativePath);
    const info = await pathInfo(targetPath, deps);

    if (!info) {
      checks.push(
        fail(
          link.id,
          `${link.label} is missing.`,
          'Run bun run ai:sync from /Users/pirog/tanaab/me to restow the Codex dotfiles.',
        ),
      );
      continue;
    }

    checks.push(
      info.isSymbolicLink()
        ? pass(link.id, `${link.label} exists as a stowed link.`)
        : warn(
            link.id,
            `${link.label} exists but is not a symbolic link.`,
            'Run bun run ai:sync from /Users/pirog/tanaab/me to restow the Codex dotfiles.',
          ),
    );
  }
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

export async function checkMachine(options = {}) {
  const deps = {
    commandExists: defaultCommandExists,
    execFile: defaultExecFile,
    lstat: defaultLstat,
    readFile: defaultReadFile,
    stat: defaultStat,
    ...(options.deps ?? {}),
  };
  const env = options.env ?? process.env;
  const homeDir = options.homeDir ?? os.homedir();
  const repoRoot = options.repoRoot ?? DEFAULT_REPO_ROOT;
  const checks = [];

  checks.push(await commandCheck('brew', deps));

  const brewfilePath = path.join(repoRoot, 'Brewfile');
  let brewfile = '';

  try {
    brewfile = await deps.readFile(brewfilePath, 'utf8');
  } catch {
    checks.push(
      fail(
        'brewfile_readable',
        `Brewfile was not readable at ${brewfilePath}.`,
        'Run this probe from the me checkout or rerun https://boot.pirog.me/boot.sh to materialize the repo.',
      ),
    );
  }

  if (brewfile) {
    checks.push(pass('brewfile_readable', 'Brewfile is readable.'));
    for (const cask of REQUIRED_BREWFILE_CASKS) {
      checks.push(
        hasCask(brewfile, cask)
          ? pass(`brewfile_cask_${checkIdSegment(cask)}`, `Brewfile includes cask "${cask}".`)
          : fail(
              `brewfile_cask_${checkIdSegment(cask)}`,
              `Brewfile does not include cask "${cask}".`,
              'Update the Brewfile and rerun https://boot.pirog.me/boot.sh or install the missing Brewfile dependency.',
            ),
      );
    }
  }

  for (const command of REQUIRED_COMMANDS.filter((requiredCommand) => requiredCommand !== 'brew')) {
    checks.push(await commandCheck(command, deps));
  }

  await appendStowedLinkChecks(checks, DOTFILE_LINKS, homeDir, deps);
  await appendGeneratedConfigCheck(checks, homeDir, deps);

  const onePasswordAppPath = '/Applications/1Password.app';
  checks.push(
    (await pathInfo(onePasswordAppPath, deps))
      ? pass('onepassword_app', '1Password.app was found.')
      : fail(
          'onepassword_app',
          '1Password.app was not found.',
          'Rerun https://boot.pirog.me/boot.sh or install the 1Password desktop app, then open it and sign in.',
        ),
  );

  const tailscaleAppPath = '/Applications/Tailscale.app';
  checks.push(
    (await pathInfo(tailscaleAppPath, deps))
      ? pass('tailscale_app', 'Tailscale.app was found.')
      : fail(
          'tailscale_app',
          'Tailscale.app was not found.',
          'Rerun https://boot.pirog.me/boot.sh or install the Tailscale desktop app, then open it and sign in.',
        ),
  );

  if (getCheck(checks, 'command_op')?.status === 'fail') {
    checks.push(
      fail(
        'onepassword_cli_vault_access',
        '1Password CLI vault access could not be checked because op is missing.',
        'Install 1Password CLI, open 1Password, sign in, unlock it, and enable Developer > Integrate with 1Password CLI.',
      ),
    );
  } else {
    try {
      const { stdout } = await deps.execFile('op', ['vault', 'list', '--format', 'json'], {
        env: commandEnvWithoutBootstrapTokens(env),
      });
      const vaults = JSON.parse(stdout);
      checks.push(
        Array.isArray(vaults) && vaults.length > 0
          ? pass(
              'onepassword_cli_vault_access',
              `1Password CLI can list ${vaults.length} vault(s).`,
            )
          : fail(
              'onepassword_cli_vault_access',
              '1Password CLI cannot list vaults for a signed-in account.',
              'Open 1Password, sign in, unlock it, enable Developer > Integrate with 1Password CLI, then rerun op vault list.',
            ),
      );
    } catch (error) {
      const formattedError = formatOnePasswordCommandError(error);
      checks.push(
        fail('onepassword_cli_vault_access', formattedError.message, formattedError.remediation),
      );
    }
  }

  if (getCheck(checks, 'command_tailscale')?.status === 'fail') {
    checks.push(
      fail(
        'tailscale_status',
        'Tailscale status could not be checked because tailscale is missing.',
        'Install the Tailscale desktop app, sign in, connect this machine to the tanaab.dev tailnet, then rerun tailscale status --json.',
      ),
    );
  } else {
    try {
      const { stdout } = await deps.execFile('tailscale', ['status', '--json']);
      checks.push(checkTailscaleStatus(JSON.parse(stdout)));
    } catch (error) {
      if (error instanceof SyntaxError) {
        checks.push(
          fail(
            'tailscale_status',
            'Tailscale status output was not parseable JSON.',
            'Open Tailscale, sign in, connect this machine to the tanaab.dev tailnet, then rerun tailscale status --json.',
          ),
        );
      } else {
        const formattedError = formatTailscaleCommandError(error);
        checks.push(fail('tailscale_status', formattedError.message, formattedError.remediation));
      }
    }
  }

  const presentTokenKeys = BOOTSTRAP_TOKEN_ENV_KEYS.filter((key) => env[key]);
  checks.push(
    presentTokenKeys.length === 0
      ? pass('bootstrap_token_env', 'No bootstrap token environment variables are present.')
      : warn(
          'bootstrap_token_env',
          `Bootstrap token environment variable(s) are still set: ${presentTokenKeys.join(', ')}.`,
          'Unset bootstrap token environment variables after bootstrapping so long-lived shells do not keep service-account material.',
        ),
  );

  await appendStowedLinkChecks(checks, CODEX_PLUGIN_LINKS, homeDir, deps);

  return {
    ok: !checks.some((check) => check.status === 'fail'),
    checks,
  };
}

export function formatReport(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = await checkMachine();
  process.stdout.write(formatReport(report));
  process.exitCode = report.ok ? 0 : 1;
}
