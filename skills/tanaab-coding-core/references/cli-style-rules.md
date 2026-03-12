# CLI Style Rules

Use these rules when shaping CLI output for shell and Bun or JavaScript tools in the Tanaab coding stack.

## Goals

- Keep Bash and Bun CLIs visually consistent.
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

- Print help sections in this order: `Usage`, `Options`, `Environment Variables`.
- Wrap `Options` and `Environment Variables` section headers in the `tp` style.
- Show computed defaults in `dim` styling when that improves clarity.
- Keep help text readable without color; color should reinforce structure, not carry it alone.

## Logging Rules

- Write normal command output to `stdout`.
- Write warnings, debug output, and failures to `stderr` when they are diagnostic rather than primary tool output.
- Use semantic colors for status labels such as `warn`, `error`, or `done`.
- Use `tp` on the key verb in an action message and `ts` on the key target or destination.
- Avoid coloring entire sentences unless the message is itself a compact status label.
- Prefer a small shared helper surface such as `log`, `note`, `success`, `warn`, `fail`, or their shell equivalents over ad hoc inline formatting.

## Implementation Notes

- In shell, prefer `tty_*` helpers or variables such as `tty_tp`, `tty_ts`, `tty_dim`, `tty_bold`, `tty_green`, `tty_red`, and `tty_yellow`.
- In Bun or JavaScript CLIs, prefer one shared styling mechanism for both semantic colors and branded colors so the calling code only deals with style names, not raw ANSI escapes.
- Respect terminal color controls such as `NO_COLOR` and `FORCE_COLOR` when the chosen library or helper layer supports them.
