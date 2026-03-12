# Bun CLI Templates

- `bun-cli.js` is the starter for true Bun CLI entrypoints that need consistent `--help`, `--version`, and `--debug` handling plus shared stdout, stderr, and debug logging helpers.
- The starter uses `ansis` for `bold(text)`, `dim(text)`, `green(text)`, `red(text)`, `yellow(text)`, and extended `tp(text)` / `ts(text)` Tanaab colors, so built-in and branded styles come from one library.
- The starter also includes generic `note()` and `success()` status helpers so the branded pink and semantic green styles are exercised in a reusable way.
- Copy the starter into a repository `bin/` directory and declare it in `package.json` as a real CLI entrypoint.
- Install the expected helper dependencies with `bun add ansis debug yargs-parser`.
- Replace `CLI_NAME`, `CLI_VERSION`, `DEBUG_NAMESPACE`, `buildDefaults()`, `renderHelp()`, and `runCli()` with project-specific behavior.
- Extend the parser and help text only after deciding the CLI contract. Keep the generic flags unless there is a strong reason not to.
- `ansis` handles color detection and respects CLI color controls such as `NO_COLOR` and `FORCE_COLOR`.
- The template preserves the broad `mvb.js` flow: imports, debug bootstrap, argv normalization, help and version short-circuits, resolved options, a main runner, and one final error boundary.
