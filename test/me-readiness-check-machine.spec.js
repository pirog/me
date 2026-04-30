import assert from 'node:assert/strict';
import path from 'node:path';

import {
  REQUIRED_COMMANDS,
  checkMachine,
  formatReport,
} from '../skills/me-readiness/scripts/check-machine.js';

const HOME_DIR = '/Users/tester';
const REPO_ROOT = '/repo/me';

function makePath(...segments) {
  return path.join(HOME_DIR, ...segments);
}

function makeFileInfo({ symbolicLink = false } = {}) {
  return {
    isSymbolicLink() {
      return symbolicLink;
    },
  };
}

function makeDeps({
  accounts = [{ id: 'account' }],
  brewfile = ['cask "1password"', 'cask "1password-cli"'].join('\n'),
  commands = REQUIRED_COMMANDS,
  configMode = 0o100600,
  execError = false,
  existingPaths,
  symbolicLinks,
} = {}) {
  const existing = new Set(
    existingPaths ?? [
      '/Applications/1Password.app',
      makePath('.codex', 'AGENTS.md'),
      makePath('.codex', 'config.shared.toml'),
      makePath('.codex', 'plugins', 'piroplugin'),
      makePath('.codex', 'plugins', 'tanaab'),
    ],
  );
  const symlinks = new Set(
    symbolicLinks ?? [
      makePath('.codex', 'AGENTS.md'),
      makePath('.codex', 'config.shared.toml'),
      makePath('.codex', 'plugins', 'piroplugin'),
      makePath('.codex', 'plugins', 'tanaab'),
    ],
  );
  const commandSet = new Set(commands);

  return {
    commandExists(command) {
      return commandSet.has(command);
    },
    execFile(command, args) {
      assert.equal(command, 'op');
      assert.deepEqual(args, ['account', 'list', '--format', 'json']);

      if (execError) {
        throw execError instanceof Error ? execError : new Error('op failed');
      }

      return { stdout: JSON.stringify(accounts) };
    },
    lstat(targetPath) {
      if (!existing.has(targetPath)) {
        throw new Error(`missing ${targetPath}`);
      }

      return makeFileInfo({ symbolicLink: symlinks.has(targetPath) });
    },
    readFile(targetPath) {
      assert.equal(targetPath, path.join(REPO_ROOT, 'Brewfile'));
      return brewfile;
    },
    stat(targetPath) {
      assert.equal(targetPath, makePath('.codex', 'config.toml'));

      if (!existing.has(targetPath)) {
        throw new Error(`missing ${targetPath}`);
      }

      return { mode: configMode };
    },
  };
}

async function runCheck(options = {}) {
  return checkMachine({
    env: options.env ?? {},
    homeDir: HOME_DIR,
    repoRoot: REPO_ROOT,
    deps: makeDeps(options),
  });
}

describe('skills/me-readiness/scripts/check-machine', () => {
  it('should report readiness when every local check passes', async () => {
    const report = await runCheck({
      existingPaths: [
        '/Applications/1Password.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
    });

    assert.equal(report.ok, true);
    assert.ok(report.checks.length > 0);
    assert.deepEqual([...new Set(report.checks.map((check) => check.status))], ['pass']);
  });

  it('should include remediation for every warning and failure', async () => {
    const report = await runCheck({
      accounts: [],
      brewfile: 'cask "1password-cli"\n',
      commands: REQUIRED_COMMANDS.filter((command) => command !== 'gh'),
      configMode: 0o100644,
      env: {
        PIROME_OP_TOKEN: 'super-secret-token',
      },
      existingPaths: [
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
      symbolicLinks: [
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
      ],
    });

    assert.equal(report.ok, false);

    for (const check of report.checks) {
      if (check.status !== 'pass') {
        assert.equal(typeof check.remediation, 'string', check.id);
        assert.notEqual(check.remediation.trim(), '', check.id);
      }
    }

    assert.ok(report.checks.some((check) => check.id === 'brewfile_cask_1password'));
    assert.ok(report.checks.some((check) => check.id === 'command_gh'));
    assert.ok(report.checks.some((check) => check.id === 'onepassword_app'));
    assert.ok(report.checks.some((check) => check.id === 'bootstrap_token_env'));
  });

  it('should not leak bootstrap token values in formatted JSON', async () => {
    const report = await runCheck({
      env: {
        OP_SERVICE_ACCOUNT_TOKEN: 'do-not-print-this-token',
      },
      existingPaths: [
        '/Applications/1Password.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
    });

    const output = formatReport(report);

    assert.doesNotMatch(output, /do-not-print-this-token/);
    assert.match(output, /OP_SERVICE_ACCOUNT_TOKEN/);
  });

  it('should emit parseable JSON with only supported statuses', async () => {
    const report = await runCheck({
      execError: true,
      existingPaths: [
        '/Applications/1Password.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
    });

    const parsed = JSON.parse(formatReport(report));
    const statuses = new Set(parsed.checks.map((check) => check.status));

    assert.deepEqual([...statuses].sort(), ['fail', 'pass']);
  });

  it('should identify 1Password desktop app connection failures as local access issues', async () => {
    const report = await runCheck({
      execError: Object.assign(new Error('op failed'), {
        stderr:
          "1Password CLI couldn't connect to the 1Password desktop app. To fix this, update the 1Password app.",
      }),
      existingPaths: [
        '/Applications/1Password.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
    });
    const accountCheck = report.checks.find((check) => check.id === 'onepassword_cli_account');

    assert.equal(accountCheck.status, 'fail');
    assert.match(accountCheck.message, /could not connect/);
    assert.match(accountCheck.remediation, /unsandboxed local access/);
  });
});
