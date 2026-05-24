import assert from 'node:assert/strict';
import path from 'node:path';

import {
  CHECK_BUCKET_ORDER,
  EXPECTED_ONEPASSWORD_ENVIRONMENT_ID,
  ONEPASSWORD_TOKEN_ENV_KEYS,
  REQUIRED_COMMANDS,
  checkMachine,
  formatReport,
} from '../skills/me-readiness/scripts/check-machine-lib.js';

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

function healthyExistingPaths(...missingPaths) {
  const missing = new Set(missingPaths);

  return [
    '/Applications/1Password.app',
    '/Applications/Tailscale.app',
    makePath('.vimrc'),
    makePath('.vimrc.before'),
    makePath('.vimrc.after'),
    makePath('.vim', 'janus', 'vim', 'core', 'before', 'plugin', 'janus.vim'),
    makePath('.vim', 'janus', 'vim', 'core', 'plugins.vim'),
    makePath('.codex', 'AGENTS.md'),
    makePath('.codex', 'config.shared.toml'),
    makePath('.codex', 'plugins', 'piroplugin'),
    makePath('.codex', 'plugins', 'tanaab'),
    makePath('.codex', 'config.toml'),
  ].filter((targetPath) => !missing.has(targetPath));
}

function makeDeps({
  brewfile = ['cask "1password"', 'cask "1password-cli@beta"', 'cask "tailscale"'].join('\n'),
  commands = REQUIRED_COMMANDS,
  configMode = 0o100600,
  environmentCliHelp = true,
  environmentExecError = false,
  environmentStdout,
  environmentValues = {
    matches: true,
    present: true,
  },
  execCalls,
  existingPaths,
  opExecError = false,
  opEnvironmentHelpError = false,
  symbolicLinks,
  tailscaleExecError = false,
  tailscaleStatus = makeHealthyTailscaleStatus(),
  tailscaleStdout,
  vaults = [{ id: 'vault' }],
} = {}) {
  const existing = new Set(existingPaths ?? healthyExistingPaths());
  const symlinks = new Set(
    symbolicLinks ?? [
      makePath('.codex', 'AGENTS.md'),
      makePath('.codex', 'config.shared.toml'),
      makePath('.vimrc'),
      makePath('.vimrc.before'),
      makePath('.vimrc.after'),
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

describe('skills/me-readiness/scripts/check-machine-lib', () => {
  it('should report readiness when every local check passes', async () => {
    const report = await runCheck({
      existingPaths: healthyExistingPaths(),
    });

    assert.equal(report.ok, true);
    assert.ok(report.checks.length > 0);
    assert.deepEqual([...new Set(report.checks.map((check) => check.status))], ['pass']);
  });

  it('should emit the Homebrew command check first', async () => {
    const report = await runCheck({
      existingPaths: healthyExistingPaths(),
    });

    assert.equal(report.checks[0].id, 'command_brew');
    assert.equal(report.checks[0].bucket, 'homebrew');
  });

  it('should assign stable buckets in readiness order', async () => {
    const report = await runCheck({
      existingPaths: healthyExistingPaths(),
    });
    const allowedBuckets = new Set(CHECK_BUCKET_ORDER);
    const bucketIndexes = report.checks.map((check) => {
      assert.ok(allowedBuckets.has(check.bucket), check.id);
      return CHECK_BUCKET_ORDER.indexOf(check.bucket);
    });

    assert.deepEqual([...new Set(report.checks.map((check) => check.bucket))], CHECK_BUCKET_ORDER);

    for (let index = 1; index < bucketIndexes.length; index += 1) {
      assert.ok(
        bucketIndexes[index] >= bucketIndexes[index - 1],
        `${report.checks[index - 1].id} should not run after ${report.checks[index].id}`,
      );
    }
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
    assert.ok(report.checks.some((check) => check.id === 'brewfile_cask_1password_cli_beta'));
    assert.ok(
      report.checks.some((check) => check.id === 'brewfile_cask_1password_cli_stable_absent'),
    );
    assert.ok(report.checks.some((check) => check.id === 'brewfile_cask_tailscale'));
    assert.ok(report.checks.some((check) => check.id === 'vimrc_link'));
    assert.ok(report.checks.some((check) => check.id === 'vim_janus_runtime'));
    assert.ok(report.checks.some((check) => check.id === 'command_gh'));
    assert.ok(report.checks.some((check) => check.id === 'command_tailscale'));
    assert.ok(report.checks.some((check) => check.id === 'onepassword_app'));
    assert.ok(report.checks.some((check) => check.id === 'onepassword_environment_cli'));
    assert.ok(report.checks.some((check) => check.id === 'onepassword_environment_run'));
    assert.ok(report.checks.some((check) => check.id === 'tailscale_app'));
    assert.ok(report.checks.some((check) => check.id === 'tailscale_status'));
    assert.ok(report.checks.some((check) => check.id === 'bootstrap_token_env'));
  });

  it('should not leak token fallback values in formatted JSON', async () => {
    const report = await runCheck({
      env: {
        OP_SERVICE_ACCOUNT_TOKEN: 'do-not-print-this-token',
      },
      existingPaths: healthyExistingPaths(),
    });

    const output = formatReport(report);

    assert.doesNotMatch(output, /do-not-print-this-token/);
    assert.match(output, /OP_SERVICE_ACCOUNT_TOKEN/);
  });

  it('should call 1Password vault list without token fallback environment variables', async () => {
    const execCalls = [];

    await runCheck({
      env: {
        KEEP_ME: 'yes',
        OP_CONNECT_TOKEN: 'do-not-pass',
        OP_SERVICE_ACCOUNT_TOKEN: 'do-not-pass',
        OP_SESSION: 'do-not-pass',
        OP_SESSION_tanaab: 'do-not-pass',
        PIROME_OP_TOKEN: 'do-not-pass',
        TANAAB_OP_TOKEN: 'do-not-pass',
      },
      execCalls,
      existingPaths: healthyExistingPaths(),
    });

    const opCall = execCalls.find((call) => call.command === 'op');

    assert.deepEqual(opCall.args, ['vault', 'list', '--format', 'json']);
    assert.equal(opCall.options.env.KEEP_ME, 'yes');

    for (const key of [...ONEPASSWORD_TOKEN_ENV_KEYS, 'OP_SESSION_tanaab']) {
      assert.equal(Object.hasOwn(opCall.options.env, key), false, key);
    }
  });

  it('should require the beta 1Password CLI cask and reject the stable cask', async () => {
    const report = await runCheck({
      brewfile: ['cask "1password"', 'cask "1password-cli"', 'cask "tailscale"'].join('\n'),
      existingPaths: healthyExistingPaths(),
    });
    const betaCheck = report.checks.find(
      (check) => check.id === 'brewfile_cask_1password_cli_beta',
    );
    const stableCheck = report.checks.find(
      (check) => check.id === 'brewfile_cask_1password_cli_stable_absent',
    );

    assert.equal(betaCheck.status, 'fail');
    assert.equal(stableCheck.status, 'fail');
    assert.match(stableCheck.remediation, /1password-cli@beta/);
  });

  it('should pass Vim readiness when stowed links and Janus runtime exist', async () => {
    const report = await runCheck({
      existingPaths: healthyExistingPaths(),
    });
    const vimChecks = report.checks.filter((check) => check.id.startsWith('vim'));

    assert.deepEqual(
      vimChecks.map((check) => [check.id, check.status]),
      [
        ['vimrc_link', 'pass'],
        ['vimrc_before_link', 'pass'],
        ['vimrc_after_link', 'pass'],
        ['vim_janus_runtime', 'pass'],
      ],
    );
  });

  it('should fail Vim readiness when the stowed vimrc link is missing', async () => {
    const report = await runCheck({
      existingPaths: healthyExistingPaths(makePath('.vimrc')),
    });
    const vimrcCheck = report.checks.find((check) => check.id === 'vimrc_link');

    assert.equal(report.ok, false);
    assert.equal(vimrcCheck.status, 'fail');
    assert.match(vimrcCheck.remediation, /restow/);
  });

  it('should fail Vim readiness when the external Janus runtime is missing', async () => {
    const report = await runCheck({
      existingPaths: healthyExistingPaths(
        makePath('.vim', 'janus', 'vim', 'core', 'before', 'plugin', 'janus.vim'),
      ),
    });
    const janusCheck = report.checks.find((check) => check.id === 'vim_janus_runtime');

    assert.equal(report.ok, false);
    assert.equal(janusCheck.status, 'fail');
    assert.match(janusCheck.remediation, /~\/\.vim\/janus\/vim/);
  });

  it('should fail 1Password Environment readiness when the beta CLI surface is missing', async () => {
    const report = await runCheck({
      environmentCliHelp: false,
      existingPaths: healthyExistingPaths(),
    });
    const cliCheck = report.checks.find((check) => check.id === 'onepassword_environment_cli');
    const runCheckResult = report.checks.find(
      (check) => check.id === 'onepassword_environment_run',
    );

    assert.equal(cliCheck.status, 'fail');
    assert.match(cliCheck.remediation, /1password-cli@beta/);
    assert.equal(runCheckResult.status, 'fail');
    assert.match(runCheckResult.message, /Environment CLI support is missing/);
  });

  it('should call op run environment without printing the authorization code', async () => {
    const execCalls = [];

    await runCheck({
      env: {
        KEEP_ME: 'yes',
        OP_CONNECT_TOKEN: 'do-not-pass',
        OP_SERVICE_ACCOUNT_TOKEN: 'do-not-pass',
        OP_SESSION: 'do-not-pass',
        OP_SESSION_tanaab: 'do-not-pass',
        PIROME_OP_TOKEN: 'do-not-pass',
        TANAAB_OP_TOKEN: 'do-not-pass',
      },
      execCalls,
      existingPaths: healthyExistingPaths(),
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
    assert.doesNotMatch(environmentCall.args[6], /console\.log|printenv/);
    assert.doesNotMatch(environmentCall.args[6], /READINESS_AUTHORIZATION_CODE=/);
    assert.match(
      environmentCall.args[6],
      /a924fd4b1d47841c36ae7663db374cf040b913ffa56541fe0f345435e3cce267/,
    );
    assert.equal(environmentCall.options.env.KEEP_ME, 'yes');

    for (const key of [...ONEPASSWORD_TOKEN_ENV_KEYS, 'OP_SESSION_tanaab']) {
      assert.equal(Object.hasOwn(environmentCall.options.env, key), false, key);
    }
  });

  it('should fail when the 1Password Environment authorization code is missing or wrong', async () => {
    const missingReport = await runCheck({
      environmentValues: {
        matches: false,
        present: false,
      },
      existingPaths: healthyExistingPaths(),
    });
    const wrongReport = await runCheck({
      environmentValues: {
        matches: false,
        present: true,
      },
      existingPaths: healthyExistingPaths(),
    });
    const missingCheck = missingReport.checks.find(
      (check) => check.id === 'onepassword_environment_run',
    );
    const wrongCheck = wrongReport.checks.find(
      (check) => check.id === 'onepassword_environment_run',
    );
    const output = `${formatReport(missingReport)}${formatReport(wrongReport)}`;

    assert.equal(missingCheck.status, 'fail');
    assert.match(missingCheck.message, /was not provided/);
    assert.equal(wrongCheck.status, 'fail');
    assert.match(wrongCheck.message, /did not match/);
    assert.doesNotMatch(output, /a924fd4b1d47841c36ae7663db374cf040b913ffa56541fe0f345435e3cce267/);
  });

  it('should identify 1Password Environment desktop app connection failures as local access issues', async () => {
    const report = await runCheck({
      environmentExecError: Object.assign(new Error('op environment failed'), {
        stderr:
          "1Password CLI couldn't connect to the 1Password desktop app. To fix this, update the 1Password app.",
      }),
      existingPaths: healthyExistingPaths(),
    });
    const environmentRunCheck = report.checks.find(
      (check) => check.id === 'onepassword_environment_run',
    );

    assert.equal(environmentRunCheck.status, 'fail');
    assert.match(environmentRunCheck.message, /could not connect/);
    assert.match(environmentRunCheck.remediation, /unsandboxed local access/);
  });

  it('should emit parseable JSON with only supported statuses', async () => {
    const report = await runCheck({
      opExecError: true,
      existingPaths: healthyExistingPaths(),
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
      existingPaths: healthyExistingPaths(),
    });
    const accountCheck = report.checks.find((check) => check.id === 'onepassword_cli_vault_access');

    assert.equal(accountCheck.status, 'fail');
    assert.match(accountCheck.message, /could not connect/);
    assert.match(accountCheck.remediation, /unsandboxed local access/);
  });

  it('should fail when the Tailscale app is missing', async () => {
    const report = await runCheck({
      existingPaths: healthyExistingPaths('/Applications/Tailscale.app'),
    });
    const tailscaleAppCheck = report.checks.find((check) => check.id === 'tailscale_app');

    assert.equal(report.ok, false);
    assert.equal(tailscaleAppCheck.status, 'fail');
  });

  it('should fail Tailscale status when the command is missing', async () => {
    const report = await runCheck({
      commands: REQUIRED_COMMANDS.filter((command) => command !== 'tailscale'),
      existingPaths: healthyExistingPaths(),
    });
    const commandCheck = report.checks.find((check) => check.id === 'command_tailscale');
    const statusCheck = report.checks.find((check) => check.id === 'tailscale_status');

    assert.equal(commandCheck.status, 'fail');
    assert.equal(statusCheck.status, 'fail');
    assert.match(statusCheck.message, /tailscale is missing/);
  });

  it('should fail Tailscale status when connected to the wrong tailnet', async () => {
    const report = await runCheck({
      existingPaths: healthyExistingPaths(),
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
      existingPaths: healthyExistingPaths(),
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
      existingPaths: healthyExistingPaths(),
      tailscaleStdout: '{not json',
    });
    const statusCheck = report.checks.find((check) => check.id === 'tailscale_status');

    assert.equal(statusCheck.status, 'fail');
    assert.match(statusCheck.message, /not parseable JSON/);
  });

  it('should identify Tailscale daemon connection failures as local access issues', async () => {
    const report = await runCheck({
      existingPaths: healthyExistingPaths(),
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
