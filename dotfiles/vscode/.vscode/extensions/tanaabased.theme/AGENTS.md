# Tanaab-based VS Code Theme Guidance

## Scope

This file governs the `tanaabased.theme` Visual Studio Code extension. Keep extension-specific
theme mapping, generation, metadata, packaging, and visual-review policy here rather than in the
repository root guidance.

## Canonical Color Source

- Treat [`dotfiles/theme/colors.json`](../../../../theme/colors.json) as the canonical palette while
  this extension remains in `me`.
- Do not source colors from the separate `@tanaabased/theme` checkout during this proof of concept.
- Every RGB color used by a theme must trace to the canonical palette. Alpha variants of canonical
  colors are allowed for overlays and selection states.
- Do not invent replacement chromatic colors to improve one application in isolation. Update the
  canonical palette first when a shared color role is genuinely missing.

## Theme Contract

Maintain these four contributed themes and keep their manifest labels, file names, `type`, and
`uiTheme` values aligned:

- `Tanaab Dark`: `modes.dark` UI, syntax, diff, and terminal roles.
- `Tanaab Light`: `modes.light` UI, syntax, diff, and terminal roles.
- `Tanaab Solarized Dark`: the Solarized neutral ramp with dark-mode chromatic roles.
- `Tanaab Solarized Light`: the Solarized neutral ramp with light-mode chromatic roles.

Each theme must continue to cover:

- Workbench and editor UI colors.
- TextMate token scopes.
- Semantic token colors with semantic highlighting enabled.
- Diff, merge, diagnostics, and source-control states.
- Integrated-terminal normal and bright ANSI colors.

Preserve the canonical ANSI slot assignments. In particular, do not swap green and magenta to
change a shell executable color because that also changes diff and other semantic terminal output.

## Generation Direction

- Keep the four theme JSON files explicit and hand-reviewable while the mappings are still being
  refined.
- Do not introduce a generator until the mapping rules are stable or the task explicitly requests
  one.
- When a generator is introduced, keep it deterministic, commit its generated theme files, and make
  drift between inputs and outputs detectable through a narrow validation command.
- A generator should own theme color mappings only. It must not rewrite extension identity,
  descriptive metadata, documentation, support information, or artwork.

## Extension Metadata

- Preserve the extension ID `tanaabased.theme`, formed from publisher `tanaabased` and name `theme`.
- Keep version `0.0.1` during the proof of concept unless a task explicitly changes the versioning
  policy.
- Treat `package.json`, `README.md`, `CHANGELOG.md`, `SUPPORT.md`, `LICENSE`, and `images/icon.png` as
  Marketplace-facing surfaces.
- VS Code supports one Marketplace icon rather than light and dark icon variants. Keep it as a PNG
  of at least 128×128 pixels; the current source is 256×256.

## Validation

For theme or manifest changes, run the narrowest applicable checks:

- Parse `package.json` and all four theme files as JSON.
- Verify every manifest theme path exists and its label and light/dark type match the theme file.
- Verify theme color literals trace to `dotfiles/theme/colors.json`, allowing alpha suffixes.
- Run Prettier on the touched JSON and Markdown files and run `git diff --check`.
- Restow the `vscode` package when new files are added so file-level Stow links are created.
- Use **Developer: Reload Window** before evaluating manifest, icon, or theme changes in VS Code.

Visual review remains required before treating color mapping changes as settled. Check all four
variants in representative source, Markdown, JSON or YAML, diff, terminal, sidebar, panel, and
notification views.
