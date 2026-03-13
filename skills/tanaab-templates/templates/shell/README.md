# Bash CLI Templates

- `bash-cli.sh` is the starter for Bash CLI entrypoints that need consistent `--help`, `--version`, `--debug`, and `--force` handling plus shared stdout, stderr, and debug logging helpers.
- The starter follows the shared CLI style rules: `Options` and any documented `Environment Variables` section use `tty_tp`, semantic status labels use `tty_green`, `tty_yellow`, and `tty_red`, and important targets can use `tty_ts`.
- The starter now includes a repeatable `--item` example backed by `TANAAB_ITEM=a,b`, using the same precedence model as the Bun template.
- The starter keeps a top-level `SCRIPT_VERSION=` assignment plus fallback logic so `prepare-release-action` can stamp the entrypoint with `version-injector --style sh --version "<tag>"`.
- The default fallback chain for unstamped source runs is `git describe --tags --always --abbrev=1`, then `0.0.0`.
- Copy the starter into a repository root or another explicit shell-entrypoint location and rename it to match the command it provides.
- Replace the top-of-file description, `SCRIPT_VERSION` fallback policy, `usage()`, `parse_args()`, and `run_cli()` with project-specific behavior.
- `--force` is included as a generic example of option > environment variable > default precedence. Remove it if the CLI does not need force mode.
- The repeatable `--item` / `TANAAB_ITEM` scaffold shows how to model multi-value options where repeated CLI flags replace env-provided defaults.
- Positional arguments are collected into `POSITIONALS`; either handle them explicitly or reject them before shipping.
- The starter respects `NO_COLOR` and `FORCE_COLOR` when deciding whether to emit ANSI styles, but those generic env vars are intentionally not listed in help output.
- Use the `Environment Variables` section only for CLI-specific or repo-specific env vars that are part of the script's documented contract.
- Treat `SCRIPT_VERSION` as internal release metadata rather than a documented environment contract unless a specific repo intentionally opts into that behavior.
- Run `shellcheck` on the final script after adapting the template.
