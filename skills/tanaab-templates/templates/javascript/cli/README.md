# Bun CLI Templates

- `bun-cli.js` is the starter for true Bun CLI entrypoints that need consistent `--help`, `--version`, and `--debug` handling plus shared stdout, stderr, and debug logging helpers.
- The starter uses `ansis` for `bold(text)`, `dim(text)`, `green(text)`, `red(text)`, `yellow(text)`, and extended `tp(text)` / `ts(text)` Tanaab colors, so built-in and branded styles come from one library.
- The starter also includes generic `note()` and `success()` status helpers so the branded pink and semantic green styles are exercised in a reusable way.
- The starter now follows the same precedence model as the Bash CLI template: explicit CLI option, then environment variable, then hardcoded default.
- The starter also includes a repeatable `--item` example backed by `TANAAB_ITEM=a,b` so multi-value option handling is scaffolded from the start.
- Copy the starter into a repository `bin/` directory and declare it in `package.json` as a real CLI entrypoint.
- Install the expected helper dependencies with `bun add ansis debug yargs-parser`.
- Replace `CLI_NAME`, `CLI_VERSION`, `DEBUG_NAMESPACE`, `buildDefaults()`, `buildEnvironment()`, `buildRepeatableOptions()`, `buildEnvironmentVariables()`, and `runCli()` with project-specific behavior.
- Extend the parser, `buildEnvironment()`, and help text only after deciding the CLI contract. Keep the generic flags unless there is a strong reason not to.
- `ansis` handles color detection and respects CLI color controls such as `NO_COLOR` and `FORCE_COLOR`, but the template intentionally omits those generic env vars from help text by default.
- The starter ships with `TANAAB_DEBUG`, `TANAAB_FORCE`, `TANAAB_ITEM`, and `SCRIPT_VERSION` as the initial repo-specific environment surface; rename or remove the repeatable `item` scaffold if the CLI does not need it.
- The template preserves the broad `mvb.js` flow: imports, debug bootstrap, argv normalization, help and version short-circuits, resolved options, a main runner, and one final error boundary.
