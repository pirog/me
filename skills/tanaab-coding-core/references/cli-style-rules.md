# CLI Style Rules

Use these rules when shaping CLI output for shell, PowerShell, and Bun or JavaScript tools in the Tanaab coding stack.
Treat this file as the primary home for shared CLI contract and output rules; language-specific skills should add only runtime- or shell-specific deltas instead of restating the full contract.

## Goals

- Keep Bash, PowerShell, and Bun CLIs visually consistent where the surrounding runtime conventions allow it.
- Color only the key action, target, or status word rather than whole sentences.
- Keep semantic status colors separate from brand accent colors.
- Preserve readable output when color is unavailable or disabled.

## Style Surface

- `bold`: emphasis for the command name, important status words, or compact inline emphasis.
- `dim`: supporting context such as defaults, parenthetical notes, or secondary hints.
- `green`: semantic success state such as `done`, `complete`, `installed`, or other positive final outcomes.
- `yellow`: semantic warning state such as `warn` or cautionary notices.
- `red`: semantic failure state such as `error` or fatal conditions.
- `tp`: Tanaab green `#00c88a` for section headers and key verbs such as `install`, `write`, `stow`, or `backup`.
- `ts`: Tanaab pink `#db2777` for important targets, focal nouns, or resolved destinations such as filenames, package groups, directories, or tool names.

## Help Output

- Print help sections in this order when they are present: `Usage`, `Options`, `Environment Variables`.
- Include an `Environment Variables` section only when the CLI defines tool-specific or repo-specific environment variables that are part of its documented contract.
- Wrap `Options` and `Environment Variables` section headers in the `tp` style when those sections are present.
- Back `--version` with a single `SCRIPT_VERSION` variable or an explicitly aligned equivalent rather than duplicating the reported version across helpers and help text.
- Use the same value-precedence order across Bash and Bun CLIs: explicit CLI option, environment variable override, then auto-detected or hardcoded default.
- For repeatable options, accept repeated CLI flags such as `--item a --item b` and represent environment defaults as comma-separated values such as `TANAAB_ITEM=a,b`.
- When a repeatable CLI option is provided at least once, it should replace the env-sourced list rather than append to it implicitly.
- Show computed defaults in `dim` styling when that improves clarity.
- Keep help text readable without color; color should reinforce structure, not carry it alone.

## Logging Rules

- In Bash and Bun CLIs, write normal command output to `stdout`.
- In Bash and Bun CLIs, write warnings, debug output, and failures to `stderr` when they are diagnostic rather than primary tool output.
- In PowerShell CLIs, prefer native PowerShell streams: `Write-Output` for primary output, `Write-Host` or `Write-Information` for display-only status text, `Write-Warning` for warnings, `Write-Debug` for debug output, and `Write-Error` plus `exit` or `throw` for failures.
- Use semantic colors for status labels such as `warn`, `error`, or `done`.
- Use `tp` on the key verb in an action message and `ts` on the key target or destination.
- Avoid coloring entire sentences unless the message is itself a compact status label.
- Prefer a small shared helper surface such as `log`, `note`, `success`, `warn`, `fail`, or their shell equivalents over ad hoc inline formatting.

## Implementation Notes

- In shell, prefer `tty_*` helpers or variables such as `tty_tp`, `tty_ts`, `tty_dim`, `tty_bold`, `tty_green`, `tty_red`, and `tty_yellow`.
- In PowerShell CLIs, prefer one small local helper layer that exposes the shared style names `bold`, `dim`, `green`, `red`, `yellow`, `tp`, and `ts` while still using conventional PowerShell parameters such as `-Force` and `-Help`.
- In PowerShell CLIs, prefer normalizing `-Debug`, repo-specific debug env vars, and an already-enabled `$DebugPreference` into native `Write-Debug` output rather than inventing a second debug channel.
- In PowerShell CLIs, prefer native PowerShell output, warning, debug, and error streams over raw console stdout or stderr writes unless the script is intentionally emulating an external non-PowerShell CLI.
- In Bun or JavaScript CLIs, prefer one shared styling mechanism for both semantic colors and branded colors so the calling code only deals with style names, not raw ANSI escapes.
- For package-level or user-facing Bun CLIs, the shared template can justify third-party CLI packages such as `ansis` and `yargs-parser`.
- For skill-local helper scripts under `skills/**/scripts/`, prefer the shared coding-core helper at `skills/tanaab-coding-core/scripts/bun-cli-support.js` plus built-in modules before adding extra CLI dependencies.
- For releasable or user-facing CLIs that may be stamped by `prepare-release-action`, keep one injection-friendly top-level `SCRIPT_VERSION` declaration or assignment line in the entrypoint so `version-injector` can update it in place.
- Treat `SCRIPT_VERSION` as internal release metadata rather than a documented environment contract unless a specific repo explicitly opts into that behavior.
- In Bun or JavaScript CLIs, prefer `let SCRIPT_VERSION;` plus a fallback initializer that resolves from git metadata or a hardcoded default when the unstamped source still needs a usable `--version` value.
- In shell CLIs, prefer a single top-level `SCRIPT_VERSION=...` assignment line that resolves environment override first, then git metadata, then a hardcoded unreleased fallback such as `0.0.0-unreleased` when the source script is not yet stamped.
- In PowerShell CLIs, prefer a single top-level `$SCRIPT_VERSION = ...` assignment line that resolves environment override first, then git metadata, then a hardcoded unreleased fallback such as `0.0.0-unreleased` when the source script is not yet stamped.
- Do not reassign `SCRIPT_VERSION` later in Bash or PowerShell entrypoints when release stamping is in scope.
- Do not list generic terminal control or debug env vars such as `NO_COLOR`, `FORCE_COLOR`, `DEBUG`, or `RUNNER_DEBUG` in help text unless the CLI defines a non-obvious contract around them.
- Respect terminal color controls such as `NO_COLOR` and `FORCE_COLOR` when the chosen library or helper layer supports them.
