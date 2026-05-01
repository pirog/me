import assert from 'node:assert/strict';
import path from 'node:path';

import {
  BOOTSTRAP_TOKEN_ENV_KEYS,
  EXPECTED_ONEPASSWORD_ENVIRONMENT_ID,
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
  environmentCliHelp = true,
  environmentExecError = false,
  environmentStdout,
  environmentValues = {
    GH_HOST: true,
    GH_TOKEN: true,
  },
  execCalls,
  existingPaths,
  meEnvKeys = ['GH_HOST=github.com', 'GH_TOKEN'].join('\n'),
  opExecError = false,
  opEnvironmentHelpError = false,
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
        if (args[0] === 'vault') {
          assert.deepEqual(args, ['vault', 'list', '--format', 'json']);

          if (opExecError) {
            throw opExecError instanceof Error ? opExecError : new Error('op failed');
          }

          return { stdout: JSON.stringify(vaults) };
        }

        if (args[0] === 'environment') {
          assert.deepEqual(args, ['environment', 'read', '--help']);

          if (opEnvironmentHelpError || !environmentCliHelp) {
            throw opEnvironmentHelpError instanceof Error
              ? opEnvironmentHelpError
              : new Error('unknown command "environment"');
          }

          return {
            stdout: 'Read environment variables from a 1Password Environment.\n',
          };
        }

        if (args[0] === 'run' && args[1] === '--environment') {
          assert.equal(args[2], EXPECTED_ONEPASSWORD_ENVIRONMENT_ID);
          assert.equal(args[3], '--');
          assert.equal(args[4], 'bun');
          assert.equal(args[5], '-e');
          assert.equal(typeof args[6], 'string');

          if (environmentExecError) {
            throw environmentExecError instanceof Error
              ? environmentExecError
              : new Error('op environment failed');
          }

          return { stdout: environmentStdout ?? JSON.stringify(environmentValues) };
        }

        throw new Error(`unexpected op args ${args.join(' ')}`);
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
      if (targetPath === path.join(REPO_ROOT, 'Brewfile')) {
        return brewfile;
      }

      if (targetPath === path.join(REPO_ROOT, 'me.env.keys')) {
        if (meEnvKeys === false) {
          throw new Error('missing me.env.keys');
        }

        return meEnvKeys;
      }

      throw new Error(`unexpected readFile ${targetPath}`);
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
      meEnvKeys: ['GH_HOST=wrong.example', 'GH_TOKEN=literal-token', 'EXTRA=value'].join('\n'),
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
    assert.ok(report.checks.some((check) => check.id === 'me_env_keys_shape'));
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

  it('should validate the expected me.env.keys contract', async () => {
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
    const readableCheck = report.checks.find((check) => check.id === 'me_env_keys_readable');
    const shapeCheck = report.checks.find((check) => check.id === 'me_env_keys_shape');

    assert.equal(readableCheck.status, 'pass');
    assert.equal(shapeCheck.status, 'pass');
  });

  it('should reject malformed duplicate and unexpected me.env.keys entries', async () => {
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
      meEnvKeys: ['GH_HOST=github.com', 'GH_HOST=github.com', 'bad-name', 'EXTRA=value'].join('\n'),
    });
    const shapeCheck = report.checks.find((check) => check.id === 'me_env_keys_shape');

    assert.equal(shapeCheck.status, 'fail');
    assert.match(shapeCheck.message, /duplicates GH_HOST/);
    assert.match(shapeCheck.message, /invalid environment variable name/);
    assert.match(shapeCheck.message, /unexpected key EXTRA/);
    assert.match(shapeCheck.message, /GH_TOKEN is missing/);
  });

  it('should reject literal GH_TOKEN values without leaking the value', async () => {
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
      meEnvKeys: ['GH_HOST=github.com', 'GH_TOKEN=do-not-print-this-token'].join('\n'),
    });
    const output = formatReport(report);
    const shapeCheck = report.checks.find((check) => check.id === 'me_env_keys_shape');

    assert.equal(shapeCheck.status, 'fail');
    assert.match(shapeCheck.message, /GH_TOKEN must be key-only/);
    assert.doesNotMatch(output, /do-not-print-this-token/);
  });

  it('should fail 1Password Environment readiness when the beta CLI surface is missing', async () => {
    const report = await runCheck({
      environmentCliHelp: false,
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
    const cliCheck = report.checks.find((check) => check.id === 'onepassword_environment_cli');
    const developerCheck = report.checks.find(
      (check) => check.id === 'onepassword_developer_experience',
    );
    const valuesCheck = report.checks.find(
      (check) => check.id === 'onepassword_environment_values',
    );

    assert.equal(cliCheck.status, 'fail');
    assert.match(cliCheck.remediation, /2\.33\.0-beta\.02/);
    assert.equal(developerCheck.status, 'fail');
    assert.match(developerCheck.remediation, /Show 1Password Developer experience/);
    assert.equal(valuesCheck.status, 'fail');
  });

  it('should fail 1Password Developer experience when Environment access fails', async () => {
    const report = await runCheck({
      environmentExecError: Object.assign(new Error('op environment failed'), {
        stderr: '1Password Developer experience is not enabled for Environments',
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
    const developerCheck = report.checks.find(
      (check) => check.id === 'onepassword_developer_experience',
    );
    const valuesCheck = report.checks.find(
      (check) => check.id === 'onepassword_environment_values',
    );

    assert.equal(developerCheck.status, 'fail');
    assert.match(developerCheck.remediation, /Show 1Password Developer experience/);
    assert.equal(valuesCheck.status, 'fail');
  });

  it('should call op run environment without bootstrap token environment variables', async () => {
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

    const environmentCall = execCalls.find(
      (call) => call.command === 'op' && call.args[0] === 'run' && call.args[1] === '--environment',
    );

    assert.deepEqual(environmentCall.args.slice(0, 6), [
      'run',
      '--environment',
      EXPECTED_ONEPASSWORD_ENVIRONMENT_ID,
      '--',
      'bun',
      '-e',
    ]);
    assert.doesNotMatch(environmentCall.args[6], /console\.log|printenv|GH_TOKEN=/);
    assert.equal(environmentCall.options.env.KEEP_ME, 'yes');

    for (const key of BOOTSTRAP_TOKEN_ENV_KEYS) {
      assert.equal(Object.hasOwn(environmentCall.options.env, key), false, key);
    }
  });

  it('should fail when 1Password Environment values are missing or wrong', async () => {
    const report = await runCheck({
      environmentValues: {
        GH_HOST: false,
        GH_TOKEN: false,
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
    const valuesCheck = report.checks.find(
      (check) => check.id === 'onepassword_environment_values',
    );

    assert.equal(valuesCheck.status, 'fail');
    assert.match(valuesCheck.message, /GH_HOST is not github\.com/);
    assert.match(valuesCheck.message, /GH_TOKEN is missing or empty/);
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
