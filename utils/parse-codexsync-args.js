import path from 'node:path';

function resolveArgValue(arg, key) {
  if (arg === key) return null;
  if (arg.startsWith(`${key}=`)) return arg.slice(`${key}=`.length);
  return undefined;
}

/**
 * Parses codexsync command, path options, and extra positional arguments.
 *
 * @param {string[]} argv Arguments after common flags are removed.
 * @param {string} defaultRepoRoot Default source repository root.
 * @returns {object} Parsed command and options.
 */
export default function parseCodexSyncArgs(argv, defaultRepoRoot) {
  const options = { cachePath: null, repoRoot: defaultRepoRoot };
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    const repoRootValue = resolveArgValue(arg, '--repo-root');
    if (repoRootValue !== undefined) {
      const value = repoRootValue ?? argv[++index];
      if (!value) throw new Error('Missing value for --repo-root.');
      options.repoRoot = path.resolve(value);
      continue;
    }

    const cachePathValue = resolveArgValue(arg, '--cache-path');
    if (cachePathValue !== undefined) {
      const value = cachePathValue ?? argv[++index];
      if (!value) throw new Error('Missing value for --cache-path.');
      options.cachePath = path.resolve(value);
      continue;
    }

    if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    positionals.push(arg);
  }

  const [command = null, ...extraPositionals] = positionals;
  return { command, extraPositionals, options };
}
