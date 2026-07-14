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
- Treat theme implementation as a feedback loop. When VS Code reveals a reusable missing role such
  as a divider, guide, control border, syntax role, or interaction state, add it to `colors.json`
  before using it throughout the extension.
- Prefer shared semantic additions under `ui`, `status`, `syntax`, `diff`, or `terminal`. Add a
  VS Code-specific palette section only when a useful color concept is genuinely application-only
  and cannot be expressed as a shared role without distorting the portable contract.

## Reference Hierarchy

Use these references in order when choosing or reviewing mappings:

1. `dotfiles/theme/colors.json` for all color values and dark, light, and Solarized roles.
2. The JavaScript and Vue images under `scratchpad/` for the intended relationships between syntax
   roles. Treat their saturation density as a starting point, not a requirement; Solarized variants
   should be substantially quieter.
3. The four files under `dotfiles/warp/.warp/themes/` for background, foreground, cursor, accent,
   and exact integrated-terminal ANSI mappings.
4. VS Code's built-in Solarized Dark theme for UX guidance around surface-separated explorer,
   activity bar, tabs, editor, search, terminal, and panel regions.
5. A live Visual Studio Code review for application-specific interaction states and layout chrome.

Do not copy a reference mechanically when it conflicts with a more authoritative role. The
scratchpad is visual guidance, while `colors.json` remains the color API.

## Theme Contract

Maintain these four contributed themes and keep their manifest labels, file names, `type`, and
`uiTheme` values aligned:

- `Tanaab Dark`: the Slate neutral ramp with dark-mode chromatic, diff, and terminal ANSI roles.
- `Tanaab Light`: `modes.light` UI, syntax, diff, and terminal roles.
- `Tanaab Solarized Dark`: the Solarized neutral ramp with dark-mode chromatic roles.
- `Tanaab Solarized Light`: the Solarized neutral ramp with light-mode chromatic roles.

The brand primary and secondary roles intentionally rotate by mode:

- Dark mode uses green as primary and pink as secondary.
- Light mode uses pink as primary and green as secondary.

Use the active mode's primary for a small number of important interactive cues. Syntax roles remain
semantic and come from that mode's `syntax` object; do not rotate syntax meanings independently of
the canonical mapping.

Each theme must continue to cover:

- Workbench and editor UI colors.
- TextMate token scopes.
- Semantic token colors where semantic highlighting is enabled. The two dark variants intentionally
  disable semantic highlighting so TextMate scopes remain authoritative for the cyan declaration
  versus pink control-flow distinction; do not re-enable it without preserving that lexical split.
- Diff, merge, diagnostics, and source-control states.
- Integrated-terminal normal and bright ANSI colors.

Preserve the canonical ANSI slot assignments. In particular, do not swap green and magenta to
change a shell executable color because that also changes diff and other semantic terminal output.

Keep the two dark variants structurally aligned. They should map the same VS Code UI roles to the
same relative neutral-ramp positions and differ primarily in their neutral family:

- `Tanaab Solarized Dark` uses `variants.solarized.base`, with editor and terminal background
  anchored to the Warp Solarized Dark background `#002d45` and raised surfaces at `#003851`.
- `Tanaab Dark` uses `variants.slate.base`, with editor and terminal background anchored to the
  accepted dark-gray reference at `#273238` and raised surfaces at `#283944`.

Both retain the canonical dark brand, status, diff, and chromatic ANSI colors. The Slate background
and first raised surface also anchor the separate Warp `Tanaab Dark` background and ANSI black slot
so the two applications share the same dark neutral foundation.

## Visual Direction

The target is calm, restrained, and mostly monochrome, with a few vivid Tanaab moments. Prefer
neutral hierarchy first and chromatic emphasis second.

- Build most of the workbench from the active mode's background, surface, raised surface,
  foreground, muted foreground, subtle foreground, and border ramp.
- Use subtle surface changes instead of borders to separate large regions whenever possible.
- When a border is needed, derive a low-opacity variant from the canonical border color. Avoid
  bright outlines around panels, groups, tabs, controls, and widgets.
- Follow the useful structural direction of VS Code's built-in Solarized Dark theme: distinguish the
  explorer, activity bar, tab strip, editor, search, terminal, status, and widget regions with
  adjacent neutral surfaces and restrained selection fills. Do not copy its color values or syntax
  mappings.
- Keep the tab strip and individual tabs effectively borderless. Use active and inactive background
  differences and text contrast instead of a box or bright top edge around the selected file.
- Keep rulers, indentation guides, whitespace markers, inactive selections, and similar structural
  aids visible but quiet. Active guides may gain modest contrast but should not become a focal
  point.
- Reserve saturated primary and secondary colors for small, meaningful states such as an active tab
  indicator, progress, a badge, a link, or a selected action. Avoid large saturated surfaces during
  ordinary editing; debugging or error states may be stronger when their semantics require it.
- Use the saturated mode primary for compact affirmative controls and trust cues such as primary
  buttons, extension install buttons, the selected Activity Bar indicator, and verified-publisher
  icons. A nearby hover state may use the canonical lighter primary. Keep these treatments compact
  so they balance, rather than compete with, secondary-pink notification badges.
- Keep source-control decorations semantically distinct without making every changed file a focal
  point. Untracked files may use the mode primary; modified files should use a subdued or
  translucent accent. Use canonical RGB values with an alpha channel for workbench overlays and
  decorations when opacity improves hierarchy.
- Treat yellow/gold as an accent, not a default syntax foreground. Use it selectively for numbers,
  constants, escapes, warnings, modified states, and narrow markup or attribute roles.
- Treat cyan as a secondary accent suited to properties, structured-data keys, parameters, and
  informational detail. It should support the primary green/pink relationship rather than compete
  with it.
- Keep punctuation, operators, brackets, and delimiters neutral unless an active interaction needs
  emphasis.
- Do not rainbow-color bracket-pair depths. Render all normal bracket depths with the same neutral
  punctuation color. Use a restrained selection fill and one mode-appropriate highlight only for
  the currently matched pair; reserve error red for unexpected brackets.
- Keep focus visible without relying on a hard saturated rectangle. Prefer muted borders, subtle
  fills, or a localized primary indicator appropriate to the control.
- In Solarized variants, use a translucent mode-primary overlay for selections, matching words,
  bracket matches, and similar editor interactions. Do not use the opaque dark-mode selection fill
  as a Solarized interaction color.

For syntax, preserve the scratchpad's role hierarchy without reproducing its color density. Across
both dark variants, keep variables, properties, function names, types, constants, punctuation, and
most identifiers on the active neutral ramp. Use the chromatic roles as small lexical landmarks:

- Cyan for declaration and storage words such as `const`, `let`, `var`, `function`, and `class`.
- Pink for control-flow keywords, imports or exports, and operators.
- Green for strings in programming languages, while keeping JSON, YAML, and TOML strings neutral.
- Yellow for declared parameters and escapes rather than every parameter reference or number.
- Muted neutral italics for comments.

A source file should read primarily as text with intentional color landmarks, not as an even
distribution of colors.

Markdown may use stronger structural landmarks because headings and list markers are sparse. In
Solarized Dark, use bright accent yellow for complete level-one headings, primary green for complete
level-two through level-six headings, and a small cyan cue for list markers. Bold and italic text
should inherit its surrounding foreground rather than introducing another chromatic role.

For Solarized variants, use the complete Solarized neutral ramp from `variants.solarized.base` for
backgrounds, surfaces, dividers, neutral text, and the majority of syntax roles. Use the corresponding
dark or light Tanaab chromatic roles as sparse landmarks and keep the canonical terminal roles rather
than introducing a separate chromatic palette.

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
