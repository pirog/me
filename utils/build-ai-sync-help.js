import { commonTanaabEnvironmentVariables } from '../lib/bun-cli-support.js';
import buildAiSyncEnvironment from './build-ai-sync-environment.js';

const CLI_NAME = 'aisync';

function buildAiSyncEnvironmentVariables() {
  return [
    ...commonTanaabEnvironmentVariables(),
    { label: 'TANAAB_STOW_TARGET', description: 'target home directory' },
    { label: 'TANAAB_STOW_DOTFILES_DIR', description: 'stow directory containing the ai package' },
    { label: 'TANAAB_STOW_PACKAGE', description: 'stow package name' },
    {
      label: 'TANAAB_STOW_SIMULATE',
      description: 'set to a truthy value to simulate the stow run',
    },
    {
      label: 'TANAAB_STOW_PRUNE',
      description: 'set to a truthy value to prune dangling links after restow',
    },
    {
      label: 'TANAAB_CODEX_CONFIG_SYNC',
      description: 'set to a falsey value to skip generated Codex config sync',
    },
    {
      label: 'TANAAB_CODEX_CONFIG_SHARED',
      description: 'portable shared Codex config fragment',
    },
    {
      label: 'TANAAB_CODEX_CONFIG_LOCAL',
      description: 'machine-local Codex config fragment',
    },
    {
      label: 'TANAAB_CODEX_CONFIG_OUTPUT',
      description: 'generated Codex config output path',
    },
  ];
}

/**
 * Builds the aisync help contract from resolved defaults.
 *
 * @param {object} cli CLI presentation helpers.
 * @param {object} environment Resolved aisync defaults.
 * @returns {object} Help definition consumed by the shared CLI renderer.
 */
export default function buildAiSyncHelp(cli, environment = buildAiSyncEnvironment()) {
  return {
    description:
      "Restow the repo's ai dot package into a target home directory and prune dangling skill links.",
    environmentVariables: buildAiSyncEnvironmentVariables(),
    options: [
      {
        label: '--target <path>',
        description: `target home directory ${cli.dim(`[default: ${environment.target}]`)}`,
      },
      {
        label: '--dotfiles-dir <path>',
        description: `stow dir containing the ai package ${cli.dim(`[default: ${environment.dotfilesDir}]`)}`,
      },
      {
        label: '--package <name>',
        description: `stow package name ${cli.dim(`[default: ${environment.packageName}]`)}`,
      },
      {
        label: '--simulate',
        description: `print the stow plan without writing changes ${cli.dim(`[default: ${environment.simulate ? 'on' : 'off'}]`)}`,
      },
      {
        label: '--no-prune',
        description: `skip dangling skill-link cleanup after restow ${cli.dim(`[default: ${environment.prune ? 'off' : 'on'}]`)}`,
      },
      {
        label: '--no-codex-config',
        description: `skip generated Codex config sync ${cli.dim(`[default: ${environment.codexConfigSync ? 'off' : 'on'}]`)}`,
      },
      {
        label: '--codex-config-shared <path>',
        description: `portable shared Codex config fragment ${cli.dim(`[default: ${environment.codexConfigShared}]`)}`,
      },
      {
        label: '--codex-config-local <path>',
        description: `machine-local Codex config fragment ${cli.dim(`[default: ${environment.codexConfigLocal}]`)}`,
      },
      {
        label: '--codex-config-output <path>',
        description: `generated Codex config output path ${cli.dim(`[default: ${environment.codexConfigOutput}]`)}`,
      },
      { label: '--debug', description: 'show debug diagnostics' },
      { label: '-h, --help', description: 'show this message' },
      { label: '-V, --version', description: 'show the CLI version' },
    ],
    usage: `${cli.bold(CLI_NAME)} ${cli.dim('[options]')}`,
  };
}
