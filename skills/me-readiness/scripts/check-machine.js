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

export const REQUIRED_BREWFILE_CASKS = ['1password', '1password-cli'];
export const REQUIRED_COMMANDS = ['brew', 'bun', 'git', 'gh', 'op', 'stow'];
export const BOOTSTRAP_TOKEN_ENV_KEYS = [
  'PIROME_OP_TOKEN',
  'OP_SERVICE_ACCOUNT_TOKEN',
  'TANAAB_OP_TOKEN',
];

const CODEX_LINKS = [
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

function makeCheck({ id, message, remediation, status }) {
  const check = { id, status, message };

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

async function defaultExecFile(command, args) {
  const { stdout } = await execFileAsync(command, args, {
    maxBuffer: 1024 * 1024,
    timeout: 10000,
  });

  return { stdout };
}

function formatCommandError(error) {
  const stderr = typeof error?.stderr === 'string' ? error.stderr : '';
  const message = error instanceof Error ? error.message : String(error ?? '');
  const detail = (stderr || message).replace(/\s+/g, ' ').trim();

  if (/couldn'?t connect to the 1Password desktop app/i.test(detail)) {
    return {
      message: '1Password CLI could not connect to the 1Password desktop app from this process.',
      remediation:
        'If op account list --format json works in your terminal, rerun the readiness helper with unsandboxed local access from Codex. Otherwise open 1Password, sign in, unlock it, and enable Developer > Integrate with 1Password CLI.',
    };
  }

  return {
    message: '1Password CLI account visibility check failed.',
    remediation:
      'Open 1Password, sign in, unlock it, enable Developer > Integrate with 1Password CLI, then rerun op account list.',
  };
}

async function pathInfo(targetPath, deps) {
  try {
    return await deps.lstat(targetPath);
  } catch {
    return null;
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
          ? pass(
              `brewfile_cask_${cask.replace(/[^a-z0-9]+/g, '_')}`,
              `Brewfile includes cask "${cask}".`,
            )
          : fail(
              `brewfile_cask_${cask.replace(/[^a-z0-9]+/g, '_')}`,
              `Brewfile does not include cask "${cask}".`,
              'Update the Brewfile and rerun https://boot.pirog.me/boot.sh or install the missing Brewfile dependency.',
            ),
      );
    }
  }

  for (const command of REQUIRED_COMMANDS) {
    checks.push(
      (await deps.commandExists(command))
        ? pass(`command_${command}`, `Command "${command}" is available.`)
        : fail(
            `command_${command}`,
            `Command "${command}" is not available on PATH.`,
            'Rerun https://boot.pirog.me/boot.sh or install the missing Brewfile dependency.',
          ),
    );
  }

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

  if (checks.some((check) => check.id === 'command_op' && check.status === 'fail')) {
    checks.push(
      fail(
        'onepassword_cli_account',
        '1Password CLI account visibility could not be checked because op is missing.',
        'Install 1Password CLI, open 1Password, sign in, unlock it, and enable Developer > Integrate with 1Password CLI.',
      ),
    );
  } else {
    try {
      const { stdout } = await deps.execFile('op', ['account', 'list', '--format', 'json']);
      const accounts = JSON.parse(stdout);
      checks.push(
        Array.isArray(accounts) && accounts.length > 0
          ? pass('onepassword_cli_account', `1Password CLI can see ${accounts.length} account(s).`)
          : fail(
              'onepassword_cli_account',
              '1Password CLI cannot see a signed-in account.',
              'Open 1Password, sign in, unlock it, enable Developer > Integrate with 1Password CLI, then rerun op account list.',
            ),
      );
    } catch (error) {
      const formattedError = formatCommandError(error);
      checks.push(
        fail('onepassword_cli_account', formattedError.message, formattedError.remediation),
      );
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

  for (const link of CODEX_LINKS) {
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
