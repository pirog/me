# Shell CLI Templates

- `bash-cli.sh` is the starter for Bash CLI entrypoints that need consistent `--help`, `--version`, `--debug`, and `--force` handling plus shared stdout, stderr, and debug logging helpers.
- `powershell-cli.ps1` is the starter for PowerShell CLI entrypoints that need the same Tanaab color palette, `SCRIPT_VERSION` stamping contract, env-backed defaults, logging helpers, and help output shape while using conventional PowerShell parameters such as `-Force`, `-Item`, `-Debug`, `-Version`, and `-Help`.
- The PowerShell starter normalizes `-Debug`, `TANAAB_DEBUG`, `RUNNER_DEBUG`, and an already-enabled `$DebugPreference` into native `Write-Debug` behavior instead of inventing a separate debug stream contract.
- The PowerShell starter now follows native PowerShell stream guidance: `Write-Output` for primary output and help text, `Write-Host` for display-only status lines, `Write-Warning` for warnings, `Write-Debug` for debug output, and `Write-Error` plus `exit` for failures.
- Both starters follow the shared CLI style rules: `Options` and any documented `Environment Variables` section use `tp` or `tty_tp`, semantic status labels use `green` or `tty_green`, `yellow` or `tty_yellow`, and `red` or `tty_red`, and important targets can use `ts` or `tty_ts`.
- Both starters include a repeatable `item` example backed by `TANAAB_ITEM=a,b`, using the same precedence model as the Bun template.
- `bash-cli.sh` keeps a single top-level `SCRIPT_VERSION=` assignment line that resolves `SCRIPT_VERSION` from the environment first, then `git describe --tags --always --abbrev=1`, then `0.0.0-unreleased`, so `prepare-release-action` can stamp it with `version-injector --style sh --version "<tag>"`.
- `powershell-cli.ps1` keeps a single top-level `$SCRIPT_VERSION = ...` assignment line that resolves `$env:SCRIPT_VERSION` first, then `git describe --tags --always --abbrev=1`, then `0.0.0-unreleased`, so `prepare-release-action` can stamp it with `version-injector --style ps1 --version "<tag>"`.
- Copy the relevant starter into a repository root or another explicit entrypoint location and rename it to match the command it provides.
- Replace the top-of-file description, `SCRIPT_VERSION` fallback policy, help rendering, argument or parameter handling, and `run_cli()` or `Invoke-RunCli()` with project-specific behavior, but keep the stampable `SCRIPT_VERSION` assignment unique.
- `--force` and `-Force` are included as generic examples of option > environment variable > default precedence. Remove them if the CLI does not need force mode.
- The repeatable `--item` or `-Item` plus `TANAAB_ITEM` scaffold shows how to model multi-value options where explicit CLI input replaces env-provided defaults.
- Positional arguments are collected into `POSITIONALS` in Bash and `Positionals` in PowerShell; either handle them explicitly or reject them before shipping.
- Both starters respect `NO_COLOR` and `FORCE_COLOR` when deciding whether to emit ANSI styles, but those generic env vars are intentionally not listed in help output.
- Use the `Environment Variables` section only for CLI-specific or repo-specific env vars that are part of the script's documented contract.
- Treat `SCRIPT_VERSION` as internal release metadata rather than a documented environment contract unless a specific repo intentionally opts into that behavior.
- Run `shellcheck` on the final Bash script after adapting the template.
- If PowerShell is available, parse-check the final `.ps1` script before shipping, and run `PSScriptAnalyzer` when the repository already uses it.
