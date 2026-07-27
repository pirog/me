/**
 * Builds the codexsync command help from its resolved cache context.
 *
 * @param {object} cli CLI presentation helpers.
 * @param {object} context Resolved repo and cache paths.
 * @param {string[]} managedPaths Paths managed by cache check and sync.
 * @returns {object} Help definition consumed by the shared CLI renderer.
 */
export default function buildCodexSyncHelp(cli, { cachePath, repoRoot }, managedPaths) {
  return {
    description: 'Validate Codex plugin inputs and compare or refresh the plugin-owned cache copy.',
    options: [
      {
        label: '--repo-root <path>',
        description: `repo root to compare from ${cli.dim(`[default: ${repoRoot}]`)}`,
      },
      {
        label: '--cache-path <path>',
        description: `cache copy to compare or sync; ignored by validate ${cli.dim(`[default: ${cachePath}]`)}`,
      },
      { label: '--debug', description: 'show debug diagnostics' },
      { label: '-h, --help', description: 'show this message' },
      { label: '-V, --version', description: 'show the CLI version' },
    ],
    sections: [
      {
        heading: 'Commands',
        entries: [
          { label: 'check', description: 'report drift for plugin-managed cache paths only' },
          {
            label: 'validate',
            description:
              'validate plugin manifest, skills, MCP stub, starter prompts, and workflow scripts',
          },
          { label: 'sync', description: 'refresh the managed cache paths from the repo source' },
        ],
      },
      {
        heading: 'Managed Paths',
        lines: managedPaths.map((managedPath) => `  ${managedPath}`),
      },
    ],
    usage: `${cli.bold('codexsync')} <check|validate|sync> ${cli.dim('[options]')}`,
  };
}
