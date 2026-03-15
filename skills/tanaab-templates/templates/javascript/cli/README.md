# Bun CLI Templates

- `bun-cli.js` is the starter for true Bun CLI entrypoints that need consistent `--help`, `--version`, and `--debug` handling plus shared stdout, stderr, and debug logging helpers.
- The starter uses `ansis` for `bold(text)`, `dim(text)`, `green(text)`, `red(text)`, `yellow(text)`, and extended `tp(text)` / `ts(text)` Tanaab colors, so built-in and branded styles come from one library.
- The starter also includes generic `note()` and `success()` status helpers so the branded pink and semantic green styles are exercised in a reusable way.
- The starter now follows the same precedence model as the Bash CLI template: explicit CLI option, then environment variable, then hardcoded default.
- The starter also includes a repeatable `--item` example backed by `TANAAB_ITEM=a,b` so multi-value option handling is scaffolded from the start.
- The starter keeps a top-level `let SCRIPT_VERSION;` placeholder plus fallback logic so `prepare-release-action` can stamp the built entrypoint with `version-injector --style js --version "<tag>"`.
- The default fallback chain now mirrors the shell starters: `git describe --tags --always --abbrev=1`, then `0.0.0-unreleased`.
- Copy the starter into a repository `bin/` directory and declare it in `package.json` as a real CLI entrypoint.
- Install the expected helper dependencies with `bun add ansis debug yargs-parser`.
- Replace `CLI_NAME`, `DEBUG_NAMESPACE`, `getScriptVersion()`, `buildDefaults()`, `buildEnvironment()`, `buildRepeatableOptions()`, `buildEnvironmentVariables()`, and `runCli()` with project-specific behavior.
- Extend the parser, `buildEnvironment()`, and help text only after deciding the CLI contract. Keep the generic flags unless there is a strong reason not to.
- `ansis` handles color detection and respects CLI color controls such as `NO_COLOR` and `FORCE_COLOR`, but the template intentionally omits those generic env vars from help text by default.
- The starter ships with `TANAAB_DEBUG`, `TANAAB_FORCE`, and `TANAAB_ITEM` as the initial repo-specific environment surface.
- Treat `SCRIPT_VERSION` as internal release metadata rather than a documented environment contract unless a specific repo intentionally opts into that behavior.
- When a repo releases compiled CLI artifacts, keep the `SCRIPT_VERSION` placeholder in the built entrypoint and stamp it during release rather than hardcoding ad hoc version strings in multiple places.
- The template preserves the broad `mvb.js` flow: imports, debug bootstrap, argv normalization, help and version short-circuits, resolved options, a main runner, and one final error boundary.
