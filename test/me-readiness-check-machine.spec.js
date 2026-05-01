import assert from 'node:assert/strict';
import path from 'node:path';

import {
  BOOTSTRAP_TOKEN_ENV_KEYS,
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

function makeHealthyTailscaleStatus(overrides = {}) {
  return {
    BackendState: 'Running',
    TailscaleIPs: ['100.64.0.1'],
    CurrentTailnet: {
      Name: 'tanaab.dev',
    },
    Self: {
      InNetworkMap: true,
      Online: true,
    },
    ...overrides,
  };
}

function makeDeps({
  brewfile = ['cask "1password"', 'cask "1password-cli"', 'cask "tailscale"'].join('\n'),
  commands = REQUIRED_COMMANDS,
  configMode = 0o100600,
  execCalls,
  existingPaths,
  opExecError = false,
  symbolicLinks,
  tailscaleExecError = false,
  tailscaleStatus = makeHealthyTailscaleStatus(),
  tailscaleStdout,
  vaults = [{ id: 'vault' }],
} = {}) {
  const existing = new Set(
    existingPaths ?? [
      '/Applications/1Password.app',
      '/Applications/Tailscale.app',
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
    execFile(command, args, options = {}) {
      execCalls?.push({ args, command, options });

      if (command === 'op') {
        assert.deepEqual(args, ['vault', 'list', '--format', 'json']);

        if (opExecError) {
          throw opExecError instanceof Error ? opExecError : new Error('op failed');
        }

        return { stdout: JSON.stringify(vaults) };
      }

      if (command === 'tailscale') {
        assert.deepEqual(args, ['status', '--json']);

        if (tailscaleExecError) {
          throw tailscaleExecError instanceof Error
            ? tailscaleExecError
            : new Error('tailscale failed');
        }

        return { stdout: tailscaleStdout ?? JSON.stringify(tailscaleStatus) };
      }

      throw new Error(`unexpected command ${command}`);
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
        '/Applications/Tailscale.app',
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

  it('should emit the Homebrew command check first', async () => {
    const report = await runCheck({
      existingPaths: [
        '/Applications/1Password.app',
        '/Applications/Tailscale.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
    });

    assert.equal(report.checks[0].id, 'command_brew');
  });

  it('should include remediation for every warning and failure', async () => {
    const report = await runCheck({
      brewfile: 'cask "1password-cli"\n',
      commands: REQUIRED_COMMANDS.filter((command) => !['gh', 'tailscale'].includes(command)),
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
      vaults: [],
    });

    assert.equal(report.ok, false);

    for (const check of report.checks) {
      if (check.status !== 'pass') {
        assert.equal(typeof check.remediation, 'string', check.id);
        assert.notEqual(check.remediation.trim(), '', check.id);
      }
    }

    assert.ok(report.checks.some((check) => check.id === 'brewfile_cask_1password'));
    assert.ok(report.checks.some((check) => check.id === 'brewfile_cask_tailscale'));
    assert.ok(report.checks.some((check) => check.id === 'command_gh'));
    assert.ok(report.checks.some((check) => check.id === 'command_tailscale'));
    assert.ok(report.checks.some((check) => check.id === 'onepassword_app'));
    assert.ok(report.checks.some((check) => check.id === 'tailscale_app'));
    assert.ok(report.checks.some((check) => check.id === 'tailscale_status'));
    assert.ok(report.checks.some((check) => check.id === 'bootstrap_token_env'));
  });

  it('should not leak bootstrap token values in formatted JSON', async () => {
    const report = await runCheck({
      env: {
        OP_SERVICE_ACCOUNT_TOKEN: 'do-not-print-this-token',
      },
      existingPaths: [
        '/Applications/1Password.app',
        '/Applications/Tailscale.app',
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

  it('should call 1Password vault list without bootstrap token environment variables', async () => {
    const execCalls = [];

    await runCheck({
      env: {
        KEEP_ME: 'yes',
        OP_SERVICE_ACCOUNT_TOKEN: 'do-not-pass',
        PIROME_OP_TOKEN: 'do-not-pass',
        TANAAB_OP_TOKEN: 'do-not-pass',
      },
      execCalls,
      existingPaths: [
        '/Applications/1Password.app',
        '/Applications/Tailscale.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
    });

    const opCall = execCalls.find((call) => call.command === 'op');

    assert.deepEqual(opCall.args, ['vault', 'list', '--format', 'json']);
    assert.equal(opCall.options.env.KEEP_ME, 'yes');

    for (const key of BOOTSTRAP_TOKEN_ENV_KEYS) {
      assert.equal(Object.hasOwn(opCall.options.env, key), false, key);
    }
  });

  it('should emit parseable JSON with only supported statuses', async () => {
    const report = await runCheck({
      opExecError: true,
      existingPaths: [
        '/Applications/1Password.app',
        '/Applications/Tailscale.app',
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
      opExecError: Object.assign(new Error('op failed'), {
        stderr:
          "1Password CLI couldn't connect to the 1Password desktop app. To fix this, update the 1Password app.",
      }),
      existingPaths: [
        '/Applications/1Password.app',
        '/Applications/Tailscale.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
    });
    const accountCheck = report.checks.find((check) => check.id === 'onepassword_cli_vault_access');

    assert.equal(accountCheck.status, 'fail');
    assert.match(accountCheck.message, /could not connect/);
    assert.match(accountCheck.remediation, /unsandboxed local access/);
  });

  it('should fail when the Tailscale app is missing', async () => {
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
    const tailscaleAppCheck = report.checks.find((check) => check.id === 'tailscale_app');

    assert.equal(report.ok, false);
    assert.equal(tailscaleAppCheck.status, 'fail');
  });

  it('should fail Tailscale status when the command is missing', async () => {
    const report = await runCheck({
      commands: REQUIRED_COMMANDS.filter((command) => command !== 'tailscale'),
      existingPaths: [
        '/Applications/1Password.app',
        '/Applications/Tailscale.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
    });
    const commandCheck = report.checks.find((check) => check.id === 'command_tailscale');
    const statusCheck = report.checks.find((check) => check.id === 'tailscale_status');

    assert.equal(commandCheck.status, 'fail');
    assert.equal(statusCheck.status, 'fail');
    assert.match(statusCheck.message, /tailscale is missing/);
  });

  it('should fail Tailscale status when connected to the wrong tailnet', async () => {
    const report = await runCheck({
      existingPaths: [
        '/Applications/1Password.app',
        '/Applications/Tailscale.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
      tailscaleStatus: makeHealthyTailscaleStatus({
        CurrentTailnet: {
          Name: 'other.example',
        },
      }),
    });
    const statusCheck = report.checks.find((check) => check.id === 'tailscale_status');

    assert.equal(statusCheck.status, 'fail');
    assert.match(statusCheck.message, /other\.example/);
  });

  it('should fail Tailscale status when the local node is offline or not running', async () => {
    const report = await runCheck({
      existingPaths: [
        '/Applications/1Password.app',
        '/Applications/Tailscale.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
      tailscaleStatus: makeHealthyTailscaleStatus({
        BackendState: 'Stopped',
        Self: {
          InNetworkMap: false,
          Online: false,
        },
        TailscaleIPs: [],
      }),
    });
    const statusCheck = report.checks.find((check) => check.id === 'tailscale_status');

    assert.equal(statusCheck.status, 'fail');
    assert.match(statusCheck.message, /BackendState/);
    assert.match(statusCheck.message, /not online/);
    assert.match(statusCheck.message, /no Tailscale IPs/);
  });

  it('should fail Tailscale status when JSON output is invalid', async () => {
    const report = await runCheck({
      existingPaths: [
        '/Applications/1Password.app',
        '/Applications/Tailscale.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
      tailscaleStdout: '{not json',
    });
    const statusCheck = report.checks.find((check) => check.id === 'tailscale_status');

    assert.equal(statusCheck.status, 'fail');
    assert.match(statusCheck.message, /not parseable JSON/);
  });

  it('should identify Tailscale daemon connection failures as local access issues', async () => {
    const report = await runCheck({
      existingPaths: [
        '/Applications/1Password.app',
        '/Applications/Tailscale.app',
        makePath('.codex', 'AGENTS.md'),
        makePath('.codex', 'config.shared.toml'),
        makePath('.codex', 'plugins', 'piroplugin'),
        makePath('.codex', 'plugins', 'tanaab'),
        makePath('.codex', 'config.toml'),
      ],
      tailscaleExecError: Object.assign(new Error('tailscale failed'), {
        stderr:
          'failed to connect to local Tailscaled process and failed to enumerate processes while looking for it',
      }),
    });
    const statusCheck = report.checks.find((check) => check.id === 'tailscale_status');

    assert.equal(statusCheck.status, 'fail');
    assert.match(statusCheck.message, /local Tailscale service/);
    assert.match(statusCheck.remediation, /unsandboxed local access/);
  });
});
