# Bash CLI Templates

- `bash-cli.sh` is the starter for Bash CLI entrypoints that need consistent `--help`, `--version`, `--debug`, and `--force` handling plus shared stdout, stderr, and debug logging helpers.
- The starter follows the shared CLI style rules: `Options` and `Environment Variables` use `tty_tp`, semantic status labels use `tty_green`, `tty_yellow`, and `tty_red`, and important targets can use `tty_ts`.
- Copy the starter into a repository root or another explicit shell-entrypoint location and rename it to match the command it provides.
- Replace the top-of-file description, `SCRIPT_VERSION`, `usage()`, `parse_args()`, and `run_cli()` with project-specific behavior.
- `--force` is included as a generic example of option > environment variable > default precedence. Remove it if the CLI does not need force mode.
- Positional arguments are collected into `POSITIONALS`; either handle them explicitly or reject them before shipping.
- The starter respects `NO_COLOR` and `FORCE_COLOR` when deciding whether to emit ANSI styles.
- Run `shellcheck` on the final script after adapting the template.
