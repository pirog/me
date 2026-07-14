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
- Preserve the `schemaVersion: 2` separation between portable syntax roles and mode-level diff
  roles. Syntax markup owns inserted, deleted, and changed token colors; `modes.<mode>.diff` owns
  workbench diff foregrounds and backgrounds. Keep opacity application-specific by deriving alpha
  variants from canonical RGB values rather than adding translucent colors to the portable syntax
  contract.

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
- `Tanaab Light`: the Slate neutral ramp in reverse for workbench surfaces and text, with
  `modes.light` chromatic, diff, and terminal roles.
- `Tanaab Solarized Dark`: the Solarized neutral ramp with dark-mode chromatic roles.
- `Tanaab Solarized Light`: the Solarized neutral ramp with light-mode chromatic roles.

The brand primary and secondary roles intentionally rotate by mode:

- Dark mode uses green as primary and pink as secondary.
- Light mode uses pink as primary and green as secondary.

Use the active mode's primary for a small number of important interactive cues. Lexical syntax roles
rotate the green and pink landmarks with the mode: dark uses green for value declarations and
control flow with pink for callable, type, module, and construction keywords; light reverses those
two role groups. Universal semantic colors such as inserted, deleted, diagnostic, and source-control
states do not rotate with the brand priority.

Treat one shared syntax role model as the target across all four variants, with theme-specific
background and workbench surface ramps providing the mode distinction. The dark variants inherit
`themes/tanaab-dark-workbench-base.json`, which inherits
`themes/tanaab-syntax-color-theme.json`; the light variants inherit
`themes/tanaab-light-workbench-base.json`, which inherits
`themes/tanaab-syntax-light-color-theme.json`. The light syntax layer adds only the overrides needed
for light-background contrast and the intentional green-pink role rotation over the shared syntax
file. Keep each workbench base limited to the colors that are identical across its Slate and
Solarized variants, and keep each contributed theme limited to variant-specific overrides. VS Code
theme files do not provide palette variables, so do not duplicate identical mode-level workbench
colors in both final variants.

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
- In light mode, preserve the rotated brand relationship: use the canonical bright pink for compact
  actions, links, selected Activity Bar indicators, and verified-publisher icons, while green is
  reserved for notification and count badges. Use a dark badge foreground so the bright green
  remains legible.
- Keep source-control decorations semantically distinct without making every changed file a focal
  point. Untracked files may use the mode primary; modified files should use a subdued or
  translucent accent. Use canonical RGB values with an alpha channel for workbench overlays and
  decorations when opacity improves hierarchy.
- Treat yellow/gold as an accent, not a default syntax foreground. Use it selectively for function
  parameter declarations, escapes, warnings, modified states, and narrow markup or attribute roles.
- Treat cyan as a secondary accent suited to programming-language strings, regular expressions,
  sparse structured cues, and informational detail. Keep routine properties, object keys, braces,
  and square brackets on the shared light neutral so cyan supports the primary green/pink
  relationship rather than competing with it.
- Keep punctuation, operators, brackets, and delimiters neutral unless an active interaction needs
  emphasis.
- Do not rainbow-color bracket-pair depths. Render all normal bracket depths with the same light
  neutral and reserve error red for unexpected brackets. In the two dark variants, do not add a
  background fill or border to the currently matched pair; the bracket glyphs provide enough cue.
- Keep focus visible without relying on a hard saturated rectangle. Prefer muted borders, subtle
  fills, or a localized primary indicator appropriate to the control.
- In Solarized variants, use a translucent mode-primary overlay for selections, matching words, and
  similar editor interactions. Bracket matches remain fill- and border-free. Do not use the opaque
  dark-mode selection fill as a Solarized interaction color.

For syntax, preserve the scratchpad's role hierarchy without reproducing its color density. Across
both dark variants, keep variables, properties, function names, types, constants, punctuation, and
most identifiers on the shared neutral syntax ramp. Use chromatic roles as small lexical landmarks:

- Green for value declaration and storage words such as `const`, `let`, and `var`, plus structural
  control flow such as conditionals, loops, `return`, and `try` or `catch`.
- Pink for callable and type declaration words such as `function` and `class`, declaration modifiers
  such as `async`, `static`, and `extends`, and module or construction markers such as `import`,
  `export`, `from`, and `new`.
- Subdued blue-gray for callable names, calls, constructors, types, and classes. Keep this role close
  to the neutral ramp so it separates identifiers without becoming a third primary accent.
- Shared muted neutral for generic assignment, comparison, logical, arithmetic, and arrow operators.
- Cyan for strings and regular expressions in programming languages, while keeping JSON, YAML, and
  TOML strings neutral.
- Yellow for booleans, function parameter declarations, escapes, and `!important` style
  declarations rather than routine markup attributes, properties, numbers, or flags such as
  `!default`.
- Muted neutral for numeric literals so they remain legible without competing with semantic
  landmarks.
- Muted neutral italics for comments.

Keep JavaScript documentation blocks monochrome. Prose remains muted neutral italics; JSDoc tags
such as `@param` and `@returns` use the light neutral in bold; types, parameter names, and default
annotations use the same light neutral without introducing another hue.

A source file should read primarily as text with intentional color landmarks, not as an even
distribution of colors.

In the light syntax layer, reverse the dark lexical green and pink landmarks: value declarations and
structural control flow use pink, while callable or type declarations, module or construction
keywords use green. Apply the same priority rotation to sparse Markdown heading landmarks, but
preserve universal semantic colors such as green inserted markup.

For Vue single-file components, let embedded JavaScript or TypeScript inherit the shared programming
roles. Treat component and SFC wrapper tag names like subdued callable names, render them at 50%
opacity so prose or values remain dominant, and style their angle-bracket punctuation like structural
brackets. Directive and ordinary attribute names plus their shorthand markers use the active mode
primary, while `v-if` or `v-for` follow ordinary structural control flow. Keep interpolation
delimiters subdued like brackets while their expressions inherit
programming roles. In embedded styles, keep property names on the neutral property ramp, use the
active mode primary for selectors, keep structural braces or function parentheses subdued, and
reserve yellow for `!important` while `!default` follows the ordinary keyword role.

For shell scripts, map grammar-specific scopes back to the shared programming roles. Structural
control flow such as `if`, `then`, `for`, `do`, `case`, and `return` follows the control-flow role.
Function declaration names follow the callable declaration role, while commands, builtins, and
function calls retain the subdued callable color. Value declarations such as `local` and `declare`
follow JavaScript value-declaration keywords; variables remain neutral, positional parameters use
yellow, strings and patterns use cyan, and numbers use the muted numeric neutral. Keep grouping,
test, subshell, and parameter-expansion punctuation subdued like JavaScript brackets. Apply the
normal dark/light green and pink priority rotation to these roles.

## Syntax Development Workflow

Treat `themes/tanaab-syntax-color-theme.json` as the shared, generic-first TextMate syntax layer.
The dark workbench base inherits it directly. The light syntax layer inherits the shared layer, and
the light workbench base inherits the light syntax layer. Workbench themes must not carry duplicate
`tokenColors` arrays. Keep semantic highlighting disabled while these TextMate scopes are
authoritative.

Group selectors by semantic role rather than by language or by the color they happen to share. Add
grammar-specific selectors such as shell scopes to the existing value-declaration, control-flow,
callable, property, or punctuation rule when their meaning matches. Do not retain a language-named
rule that produces the same settings as an existing generic rule. Preserve explicit neutral
variable and constant rules when they override a broader parent scope, such as strings around shell
arguments or expansions; matching the default foreground does not by itself make a rule redundant.

Develop syntax as a role-first, fixture-driven loop rather than completing independent language
themes and attempting to merge them afterward:

1. Describe the intended semantic role, such as a parameter declaration, structural control-flow
   keyword, module keyword, property, string, or documentation tag.
2. Use **Developer: Inspect Editor Tokens and Scopes** in VS Code to identify the actual TextMate
   scopes emitted for a representative token.
3. Add or adjust the broadest appropriate generic scope in the shared syntax file.
4. Check that rule against at least one contrasting fixture before considering it stable.
5. Add a language-qualified selector only when a grammar reuses or omits generic scopes in a way
   that would make the broad rule incorrect elsewhere.

Use this fixture progression to broaden coverage without creating a section for every language:

1. JavaScript and TypeScript for declarations, parameters, control flow, modules, strings,
   comments, and JSDoc.
2. Vue for HTML templates, embedded JavaScript, attributes, and component CSS.
3. Standalone HTML and CSS for markup and styling scopes outside Vue embedding.
4. Shell for commands, variables, quoting, substitutions, and control flow from a substantially
   different grammar.
5. JSON, YAML, and TOML for structured-data keys, values, punctuation, and neutral strings.
6. Markdown for headings, prose, lists, links, quotes, and fenced code.

Classify each mismatch before editing:

- Same role and standard scope: change the shared generic rule.
- Same role but a different grammar scope: broaden the shared rule's selector list.
- Same scope with a genuinely different meaning: add a narrow, named language exception.
- A contrast problem caused by the workbench background: adjust or override the affected variant;
  do not fork the semantic role.

Every language-specific exception must be named for its intent and supported by a fixture that
demonstrates why a generic rule is insufficient. Periodically remove redundant exceptions when a
broader rule now covers them. A new language should look coherent before it receives any dedicated
rules; that is the primary test that the generic layer is working.

Markdown may use stronger structural landmarks because headings and list markers are sparse. In
Solarized Dark, use bright accent yellow for complete level-one headings, primary green for complete
level-two through level-six headings, and a small cyan cue for list markers. Bold and italic text
should inherit its surrounding foreground rather than introducing another chromatic role. Use cyan
for links. Render inline backtick code as neutral text on an obviously darker neutral surface. Give
fenced code the same darker surface while allowing its contents to inherit embedded language
syntax. Markdown tables may use that same darker token surface. A pure color theme cannot create a
full-width source-editor region behind a fenced block or table; that requires active editor
decorations, so keep the proof-of-concept extension declarative.

Keep JSON and YAML keys on one neutral property role regardless of nesting. In TOML, treat bracketed
table and array-table headers as structural: their names, dots, and brackets share the subdued
bracket color. Use yellow for booleans and a muted neutral for numbers across structured data. The
bundled JSON grammar groups `true`, `false`, and `null` under one literal scope, so keep that JSON
literal family together rather than pretending the theme can distinguish their text.

For Solarized variants, use the complete Solarized neutral ramp from `variants.solarized.base` for
backgrounds, surfaces, dividers, and neutral workbench text. Do not use the background ramp to fork
the shared syntax palette. Keep the canonical terminal roles rather than introducing a separate
chromatic palette.

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

- Parse `package.json` and every syntax, workbench-base, and contributed theme file as JSON.
- Verify every manifest theme path exists and its label and light/dark type match the theme file.
- Resolve every include chain and verify each contributed theme still produces its complete expected
  workbench and TextMate configuration.
- Verify theme color literals trace to `dotfiles/theme/colors.json`, allowing alpha suffixes.
- Run Prettier on the touched JSON and Markdown files and run `git diff --check`.
- Restow the `vscode` package when new files are added so file-level Stow links are created.
- Use **Developer: Reload Window** before evaluating manifest, icon, or theme changes in VS Code.

Visual review remains required before treating color mapping changes as settled. Check all four
variants in representative source, Markdown, JSON or YAML, diff, terminal, sidebar, panel, and
notification views.
