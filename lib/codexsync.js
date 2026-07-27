import { REPO_ROOT, extractCommonFlags } from './bun-cli-support.js';
import { runCodexSyncCheck } from './codexsync-check.js';
import { MANAGED_PATHS, resolveCodexSyncContext } from './codexsync-context.js';
import { runCodexSyncSync } from './codexsync-sync.js';
import { runCodexSyncValidate } from './codexsync-validate.js';
import buildCodexSyncHelp from '../utils/build-codexsync-help.js';
import parseCodexSyncArgs from '../utils/parse-codexsync-args.js';

const COMMANDS = new Set(['check', 'validate', 'sync']);

async function dispatchCommand(command, context, cli) {
  const commandContext = { ...context, cli };

  if (command === 'check') return runCodexSyncCheck(commandContext);
  if (command === 'validate') return runCodexSyncValidate(commandContext);
  if (command === 'sync') return runCodexSyncSync(commandContext);
  return null;
}

/**
 * Runs one codexsync command without owning process termination.
 *
 * @param {object} options Raw arguments and CLI presentation boundary.
 * @returns {Promise<boolean>} Whether the command completed successfully.
 */
export async function runCodexSync({ argv = process.argv.slice(2), cli }) {
  const { argv: remainingArgv, flags } = extractCommonFlags(argv);
  if (flags.debug) cli.enableDebug();

  let parsed;
  try {
    parsed = parseCodexSyncArgs(remainingArgv, REPO_ROOT);
  } catch (error) {
    cli.error(error instanceof Error ? error.message : String(error));
    cli.log('');
    const context = await resolveCodexSyncContext({ repoRoot: REPO_ROOT });
    cli.log(cli.renderHelp(buildCodexSyncHelp(cli, context, MANAGED_PATHS)));
    return false;
  }

  const context = await resolveCodexSyncContext({
    cachePathOverride: parsed.options.cachePath,
    repoRoot: parsed.options.repoRoot,
  });

  if (flags.help) {
    cli.log(cli.renderHelp(buildCodexSyncHelp(cli, context, MANAGED_PATHS)));
    return true;
  }
  if (flags.version) {
    cli.showVersion();
    return true;
  }
  if (!parsed.command) {
    cli.error(
      `expected a command (${cli.ts('check')}, ${cli.ts('validate')}, or ${cli.ts('sync')})`,
    );
    cli.log('');
    cli.log(cli.renderHelp(buildCodexSyncHelp(cli, context, MANAGED_PATHS)));
    return false;
  }
  if (parsed.extraPositionals.length > 0) {
    cli.error(`unexpected positional arguments: ${parsed.extraPositionals.join(', ')}`);
    return false;
  }
  if (!COMMANDS.has(parsed.command)) {
    cli.error(`unknown command: ${parsed.command}`);
    return false;
  }

  const result = await dispatchCommand(parsed.command, context, cli);
  return result?.ok !== false;
}
