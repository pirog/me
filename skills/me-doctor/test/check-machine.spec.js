import assert from 'node:assert/strict';
import path from 'node:path';

import {
  AGENTBOX_HEALTH_PLIST_PATH,
  AGENTBOX_HEALTH_SCRIPT_PATH,
  CHECK_BUCKET_ORDER,
  EXPECTED_ONEPASSWORD_ENVIRONMENT_ID,
  ONEPASSWORD_TOKEN_ENV_KEYS,
  REQUIRED_COMMANDS,
  checkMachine,
  formatReport,
} from '../lib/check-machine.js';

const HOME_DIR = '/Users/tester';
const REPO_ROOT = '/repo/me';
const DOTFILES_ROOT = path.join(REPO_ROOT, 'dotfiles');
const PLUGIN_LINK = path.join(HOME_DIR, '.codex', 'plugins', 'piroplugin');
const CONFIG_PATH = path.join(HOME_DIR, '.codex', 'config.toml');
const HOMEBREW_PREFIX = '/opt/homebrew';
const HOMEBREW_CELLAR = '/opt/homebrew/Cellar';
const HOMEBREW_CACHE = '/Users/tester/Library/Caches/Homebrew';
const BUN_PREFIX = '/opt/homebrew/opt/bun';
const BUN_PATH = path.join(BUN_PREFIX, 'bin', 'bun');
const BUN_REAL_PATH = '/opt/homebrew/Cellar/bun/1.3.14/bin/bun';
const LEGACY_BUN_PATH = path.join(HOME_DIR, '.bun', 'bin', 'bun');
const NODE_PREFIX = '/opt/homebrew/opt/node@26';
const NODE_PATH = path.join(NODE_PREFIX, 'bin', 'node');
const BUN_VERSION_PATH = path.join(REPO_ROOT, '.bun-version');

const DEFAULT_BREWFILE = [
  'cask "1password"',
  'cask "1password-cli@beta"',
  'cask "codex"',
  'cask "codex-app"',
  'cask "google-chrome"',
  'cask "tailscale-app"',
  'cask "visual-studio-code"',
  'cask "warp"',
  'brew "curl"',
  'brew "gh"',
  'brew "git"',
  'brew "imagemagick"',
  'brew "jq"',
  'brew "node@26"',
  'brew "python@3.14"',
  'brew "stow"',
  'brew "vim"',
  'brew "zsh"',
  'brew "oven-sh/bun/bun"',
].join('\n');
const DEFAULT_FORMULAS = [
  'curl',
  'gh',
  'git',
  'imagemagick',
  'jq',
  'node@26',
  'python@3.14',
  'stow',
  'vim',
  'zsh',
  'oven-sh/bun/bun',
];
const DEFAULT_CASKS = [
  '1password',
  '1password-cli@beta',
  'codex',
  'codex-app',
  'google-chrome',
  'tailscale-app',
  'visual-studio-code',
  'warp',
];
const DOTFILE_PACKAGES = ['ai', 'git', 'ssh', 'vim', 'zsh'];

function makeFileInfo({ executable = false, file = true, symbolicLink = false } = {}) {
  return {
    mode: executable ? 0o100755 : 0o100644,
    isFile() {
      return file;
    },
    isSymbolicLink() {
      return symbolicLink;
    },
  };
}

function makeDirectoryEntry(name) {
  return {
    name,
    isDirectory() {
      return true;
    },
  };
}

function healthyTailscaleStatus(overrides = {}) {
  return {
    BackendState: 'Running',
    CurrentTailnet: { Name: 'tanaab.dev' },
    Self: { InNetworkMap: true, Online: true },
    TailscaleIPs: ['100.64.0.1'],
    ...overrides,
  };
}

function makeDeps({
  agentbox = false,
  agentboxHealthExecutable = true,
  brewfile = DEFAULT_BREWFILE,
  bunVersion = '1.3.14',
  commands = [...REQUIRED_COMMANDS, 'op', 'tailscale'],
  configExists = true,
  configMode = 0o100600,
  dotfilePackages = DOTFILE_PACKAGES,
  environmentCliSupported = true,
  environmentResult = { matches: true, present: true },
  execCalls,
  installedCasks = DEFAULT_CASKS,
  installedFormulas = DEFAULT_FORMULAS,
  nodeVersion = 'v26.1.0',
  opError = false,
  pluginTarget = REPO_ROOT,
  stowError = false,
  stowOutput = '',
  tailscaleError = false,
  tailscaleStatus = healthyTailscaleStatus(),
  unwritablePaths = [],
  vaults = [{ id: 'vault' }],
} = {}) {
  const commandSet = new Set(commands);
  const caskSet = new Set(installedCasks);
  const formulaSet = new Set(installedFormulas);
  const unwritable = new Set(unwritablePaths);
  return {
    access(targetPath) {
      if (unwritable.has(targetPath)) {
        throw new Error(`not writable: ${targetPath}`);
      }
    },
    commandExists(command) {
      return commandSet.has(command);
    },
    execFile(command, args, options = {}) {
      execCalls?.push({ args, command, options });

      if (command === 'brew') {
        if (args[0] === '--prefix' && args[1] === 'node@26') {
          return { stdout: `${NODE_PREFIX}\n` };
        }
        if (args[0] === '--prefix' && args[1] === 'oven-sh/bun/bun') {
          return { stdout: `${BUN_PREFIX}\n` };
        }
        if (args[0] === '--prefix') return { stdout: `${HOMEBREW_PREFIX}\n` };
        if (args[0] === '--cellar') return { stdout: `${HOMEBREW_CELLAR}\n` };
        if (args[0] === '--cache') return { stdout: `${HOMEBREW_CACHE}\n` };
        if (args[0] === 'list' && args[1] === '--formula') {
          if (!formulaSet.has(args[2])) throw new Error(`missing formula ${args[2]}`);
          return { stdout: `${args[2]}\n` };
        }
        if (args[0] === 'list' && args[1] === '--cask') {
          if (!caskSet.has(args[2])) throw new Error(`missing cask ${args[2]}`);
          return { stdout: `${args[2]}\n` };
        }
      }

      if (command === NODE_PATH) {
        assert.deepEqual(args, ['--version']);
        return { stdout: `${nodeVersion}\n` };
      }

      if (command === 'stow') {
        if (stowError) throw new Error('stow conflict');
        return { stderr: stowOutput, stdout: '' };
      }

      if (command === 'op') {
        if (opError) throw new Error('op failed');
        if (args[0] === 'vault') return { stdout: JSON.stringify(vaults) };
        if (args[0] === 'environment') {
          if (!environmentCliSupported) throw new Error('unsupported');
          return { stdout: 'help' };
        }
        if (args[0] === 'run') {
          assert.equal(args[2], EXPECTED_ONEPASSWORD_ENVIRONMENT_ID);
          return { stdout: JSON.stringify(environmentResult) };
        }
      }

      if (command === 'tailscale') {
        if (tailscaleError) throw new Error('tailscale failed');
        return { stdout: JSON.stringify(tailscaleStatus) };
      }

      throw new Error(`unexpected command: ${command} ${args.join(' ')}`);
    },
    lstat(targetPath) {
      if (targetPath === AGENTBOX_HEALTH_SCRIPT_PATH && agentbox) {
        return makeFileInfo({ executable: agentboxHealthExecutable });
      }
      if (targetPath === AGENTBOX_HEALTH_PLIST_PATH && agentbox) {
        return makeFileInfo();
      }
      if (targetPath === PLUGIN_LINK) {
        return makeFileInfo({ symbolicLink: true });
      }
      throw new Error(`missing: ${targetPath}`);
    },
    readFile(targetPath) {
      if (targetPath === path.join(REPO_ROOT, 'Brewfile')) return brewfile;
      if (targetPath === BUN_VERSION_PATH && bunVersion !== null) return `${bunVersion}\n`;
      throw new Error(`missing: ${targetPath}`);
    },
    readdir(targetPath, options) {
      assert.equal(targetPath, DOTFILES_ROOT);
      assert.deepEqual(options, { withFileTypes: true });
      return dotfilePackages.map(makeDirectoryEntry);
    },
    realpath(targetPath) {
      if (targetPath === BUN_PATH || targetPath === BUN_REAL_PATH) return BUN_REAL_PATH;
      if (targetPath === LEGACY_BUN_PATH) return LEGACY_BUN_PATH;
      if (targetPath === PLUGIN_LINK) return pluginTarget;
      if (targetPath === REPO_ROOT) return REPO_ROOT;
      throw new Error(`unexpected realpath: ${targetPath}`);
    },
    stat(targetPath) {
      assert.equal(targetPath, CONFIG_PATH);
      if (!configExists) throw new Error('missing config');
      return { mode: configMode };
    },
  };
}

async function runCheck(options = {}) {
  return checkMachine({
    deps: makeDeps(options),
    env: options.env ?? {},
    homeDir: HOME_DIR,
    repoRoot: REPO_ROOT,
    runtimeExecutable: options.runtimeExecutable ?? BUN_REAL_PATH,
    runtimeVersion: options.runtimeVersion ?? '1.3.14',
  });
}

function findCheck(report, id) {
  const check = report.checks.find((entry) => entry.id === id);
  assert.ok(check, `missing check ${id}`);
  return check;
}

describe('skills/me-doctor/lib/check-machine', () => {
  it('reports ready when core profile and Codex integration checks pass', async () => {
    const report = await runCheck();

    assert.equal(report.ok, true);
    assert.equal(report.schemaVersion, 1);
    assert.equal(report.status, 'ready');
    assert.deepEqual(report.source, {
      agentboxHost: false,
      homeDir: HOME_DIR,
      kind: 'live',
      repoRoot: REPO_ROOT,
    });
    assert.equal(report.summary.failed, 0);
    assert.equal(report.summary.warnings, 0);
    assert.deepEqual(report.issues, []);
    assert.deepEqual(report.warnings, []);
    assert.deepEqual([...new Set(report.checks.map((check) => check.status))], ['pass']);
  });

  it('checks effective Homebrew writability instead of ownership', async () => {
    const report = await runCheck({ unwritablePaths: [HOMEBREW_CELLAR] });
    const check = findCheck(report, 'homebrew_writable');

    assert.equal(report.ok, false);
    assert.equal(check.status, 'fail');
    assert.match(check.message, /Cellar/);
  });

  it('treats every missing Brewfile formula as a hard failure', async () => {
    const report = await runCheck({
      installedFormulas: DEFAULT_FORMULAS.filter((formula) => formula !== 'imagemagick'),
    });
    const check = findCheck(report, 'brewfile_formulas_installed');

    assert.equal(report.ok, false);
    assert.equal(report.status, 'not_ready');
    assert.equal(check.status, 'fail');
    assert.match(check.message, /imagemagick/);
    assert.equal(
      report.issues.find((issue) => issue.key === check.id)?.remediation.kind,
      'reconcile',
    );
  });

  it('treats missing Brewfile casks as warnings', async () => {
    const report = await runCheck({
      installedCasks: DEFAULT_CASKS.filter((cask) => !['google-chrome', 'warp'].includes(cask)),
    });
    const check = findCheck(report, 'brewfile_casks_installed');

    assert.equal(report.ok, true);
    assert.equal(report.status, 'warning');
    assert.equal(check.status, 'warn');
    assert.match(check.message, /google-chrome/);
    assert.match(check.message, /warp/);
    assert.ok(report.warnings.some((warning) => warning.key === check.id));
  });

  it('excludes intentional Agentbox cask skips', async () => {
    const report = await runCheck({
      agentbox: true,
      commands: [...REQUIRED_COMMANDS, 'op', 'tailscale', 'tailscaled'],
      installedCasks: DEFAULT_CASKS.filter(
        (cask) => !['1password', 'tailscale-app'].includes(cask),
      ),
    });
    const check = findCheck(report, 'brewfile_casks_installed');

    assert.equal(check.status, 'pass');
    assert.match(check.message, /intentionally skips/);
  });

  it('requires the complete core command set', async () => {
    const report = await runCheck({
      commands: [...REQUIRED_COMMANDS.filter((command) => command !== 'bun'), 'op', 'tailscale'],
    });

    assert.equal(report.ok, false);
    assert.equal(findCheck(report, 'command_bun').status, 'fail');
  });

  it('should require the running Bun version to match .bun-version', async () => {
    const current = await runCheck();
    const stale = await runCheck({ runtimeVersion: '1.3.13' });
    const missingPin = await runCheck({ bunVersion: null });

    assert.equal(findCheck(current, 'bun_version').status, 'pass');
    assert.match(findCheck(current, 'bun_version').message, /1\.3\.14/);
    assert.equal(findCheck(stale, 'bun_version').status, 'fail');
    assert.match(findCheck(stale, 'bun_version').message, /expected 1\.3\.14/);
    assert.equal(findCheck(missingPin, 'bun_version').status, 'fail');
    assert.equal(stale.ok, false);
    assert.equal(missingPin.ok, false);
  });

  it('should require the running Bun executable to come from Homebrew', async () => {
    const current = await runCheck();
    const legacy = await runCheck({ runtimeExecutable: LEGACY_BUN_PATH });

    assert.equal(findCheck(current, 'bun_homebrew').status, 'pass');
    assert.match(findCheck(current, 'bun_homebrew').message, /Homebrew Bun/);
    assert.equal(findCheck(legacy, 'bun_homebrew').status, 'fail');
    assert.match(findCheck(legacy, 'bun_homebrew').message, new RegExp(LEGACY_BUN_PATH));
    assert.equal(legacy.ok, false);
  });

  it('accepts Node 26 or newer and rejects older Node', async () => {
    const current = await runCheck({ nodeVersion: 'v27.1.0' });
    const old = await runCheck({ nodeVersion: 'v25.9.0' });

    assert.equal(findCheck(current, 'node_version').status, 'pass');
    assert.equal(findCheck(old, 'node_version').status, 'fail');
    assert.equal(old.ok, false);
  });

  it('checks the Homebrew node@26 binary without depending on the inherited PATH', async () => {
    const execCalls = [];
    const report = await runCheck({ execCalls });
    const nodeCall = execCalls.find((call) => call.command === NODE_PATH);

    assert.equal(findCheck(report, 'node_version').status, 'pass');
    assert.deepEqual(nodeCall.args, ['--version']);
    assert.equal(REQUIRED_COMMANDS.includes('node'), false);
  });

  it('discovers and simulates every top-level dotfile package', async () => {
    const execCalls = [];
    const report = await runCheck({ execCalls });
    const stowCall = execCalls.find((call) => call.command === 'stow');

    assert.equal(findCheck(report, 'dotfiles_stowed').status, 'pass');
    assert.deepEqual(stowCall.args.slice(-DOTFILE_PACKAGES.length), DOTFILE_PACKAGES);
    assert.ok(stowCall.args.includes('--simulate'));
  });

  it('ignores GNU Stow simulation-mode noise when no changes are pending', async () => {
    const report = await runCheck({
      stowOutput: 'WARNING: in simulation mode so not modifying filesystem.\n',
    });

    assert.equal(findCheck(report, 'dotfiles_stowed').status, 'pass');
  });

  it('fails when Stow would change the installed dotfile layout', async () => {
    const report = await runCheck({ stowOutput: 'LINK: .zshrc => dotfiles/zsh/.zshrc' });

    assert.equal(report.ok, false);
    assert.equal(findCheck(report, 'dotfiles_stowed').status, 'fail');
  });

  it('keeps generated Codex configuration and piroplugin as hard requirements', async () => {
    const missingConfig = await runCheck({ configExists: false });
    const wrongPlugin = await runCheck({ pluginTarget: '/tmp/other-me' });

    assert.equal(missingConfig.ok, false);
    assert.equal(findCheck(missingConfig, 'codex_generated_config').status, 'fail');
    assert.equal(wrongPlugin.ok, false);
    assert.equal(findCheck(wrongPlugin, 'codex_piroplugin_link').status, 'fail');
  });

  it('treats missing 1Password capabilities as warnings', async () => {
    const report = await runCheck({
      commands: [...REQUIRED_COMMANDS, 'tailscale'],
    });

    assert.equal(report.ok, true);
    assert.equal(findCheck(report, 'command_op').status, 'warn');
    assert.equal(findCheck(report, 'onepassword_cli_vault_access').status, 'warn');
    assert.equal(findCheck(report, 'onepassword_environment_run').status, 'warn');
  });

  it('strips 1Password token fallbacks and never prints their values', async () => {
    const execCalls = [];
    const report = await runCheck({
      env: {
        KEEP_ME: 'yes',
        OP_SERVICE_ACCOUNT_TOKEN: 'do-not-print',
        OP_SESSION_tanaab: 'do-not-print',
      },
      execCalls,
    });
    const opCall = execCalls.find((call) => call.command === 'op');
    const output = formatReport(report);

    assert.equal(opCall.options.env.KEEP_ME, 'yes');
    for (const key of [...ONEPASSWORD_TOKEN_ENV_KEYS, 'OP_SESSION_tanaab']) {
      assert.equal(Object.hasOwn(opCall.options.env, key), false, key);
    }
    assert.doesNotMatch(output, /do-not-print/);
  });

  it('treats Tailscale connectivity failures as warnings', async () => {
    const report = await runCheck({
      tailscaleStatus: healthyTailscaleStatus({ BackendState: 'Stopped' }),
    });

    assert.equal(report.ok, true);
    assert.equal(findCheck(report, 'tailscale_status').status, 'warn');
  });

  it('treats missing Agentbox tailscaled as a warning', async () => {
    const report = await runCheck({ agentbox: true });

    assert.equal(report.ok, true);
    assert.equal(findCheck(report, 'command_tailscaled').status, 'warn');
  });

  it('requires executable Agentbox health markers before applying cask skips', async () => {
    const report = await runCheck({
      agentbox: true,
      agentboxHealthExecutable: false,
      installedCasks: DEFAULT_CASKS.filter((cask) => cask !== '1password'),
    });

    assert.equal(findCheck(report, 'brewfile_casks_installed').status, 'warn');
    assert.match(findCheck(report, 'brewfile_casks_installed').message, /1password/);
  });

  it('keeps check buckets stable and dependency ordered', async () => {
    const report = await runCheck();
    const indexes = report.checks.map((check) => CHECK_BUCKET_ORDER.indexOf(check.bucket));

    assert.deepEqual([...new Set(report.checks.map((check) => check.bucket))], CHECK_BUCKET_ORDER);
    assert.deepEqual(
      report.groups.map((group) => group.id),
      CHECK_BUCKET_ORDER,
    );
    for (let index = 1; index < indexes.length; index += 1) {
      assert.ok(indexes[index] >= indexes[index - 1]);
    }
  });

  it('includes remediation for every warning and failure', async () => {
    const report = await runCheck({
      configExists: false,
      installedCasks: [],
      installedFormulas: [],
      stowOutput: 'LINK: .zshrc',
      tailscaleError: true,
      unwritablePaths: [HOMEBREW_CACHE],
      vaults: [],
    });

    for (const check of report.checks.filter((entry) => entry.status !== 'pass')) {
      assert.equal(typeof check.remediation, 'string', check.id);
      assert.notEqual(check.remediation.trim(), '', check.id);
    }

    for (const diagnostic of [...report.issues, ...report.warnings]) {
      assert.ok(
        ['command', 'investigate', 'manual', 'reconcile'].includes(diagnostic.remediation.kind),
      );
      assert.equal(typeof diagnostic.remediation.summary, 'string');
      assert.equal(typeof diagnostic.remediation.requiresConfirmation, 'boolean');
    }
  });
});
