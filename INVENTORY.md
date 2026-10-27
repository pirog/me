# inventory

what ships and where to change it. start with the [README](./README.md) for setup and usage,
or [Piroboot](./PIROBOOT.md) for bootstrap options.

## dependencies

[`Brewfile`](./Brewfile) is the shopping list for applications and command-line tools.
runtime requirements are declared in [`.node-version`](./.node-version) and [`.bun-version`](./.bun-version).

[`Brewfile.openclaw`](./Brewfile.openclaw) is a manually installed, optional bundle containing
`openclaw-cli`, `clawhub`, and the native OpenClaw app. bootstrap and repeatable setup leave it alone;
it does not provision an agent identity, workspace, runtime configuration, or Gateway.

see [Piroboot](./PIROBOOT.md#bootstrap-behavior) for bootstrap behavior on existing hosts.

## dotfiles

the packages under [`dotfiles/`](./dotfiles/) are applied to `$HOME` with GNU Stow:

| package                               | provides                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`ai`](./dotfiles/ai)                 | Codex defaults, global agent guidance, pets, the Pirostore marketplace, and plugin links. |
| [`gh`](./dotfiles/gh)                 | GitHub CLI configuration.                                                                 |
| [`git`](./dotfiles/git)               | Git configuration, including the Lando-specific include.                                  |
| [`hyperdrive`](./dotfiles/hyperdrive) | Hyperdrive configuration.                                                                 |
| [`lando`](./dotfiles/lando)           | Lando configuration.                                                                      |
| [`ssh`](./dotfiles/ssh)               | SSH configuration and public keys.                                                        |
| [`theme`](./dotfiles/theme)           | the shared Tanaab color palette.                                                          |
| [`vim`](./dotfiles/vim)               | native packages and a Tanaab theme that follows the terminal's ANSI palette.              |
| [`vscode`](./dotfiles/vscode)         | settings and Tanaab / Tanaab Solarized light and dark themes.                             |
| [`warp`](./dotfiles/warp)             | terminal settings and Tanaab / Tanaab Solarized light and dark themes.                    |
| [`zsh`](./dotfiles/zsh)               | shell environment, history, and fallback prompt.                                          |

Codex TUI defaults to Tanaab Solarized Dark. when using another Warp theme, set `[tui].theme` to
`ansi` in [the shared configuration](./dotfiles/ai/.codex/config.shared.toml) so syntax and diff
colors follow the terminal instead of retaining dark-specific fills.

## plugins

the `ai` dotpkg installs the [Pirostore catalog](./dotfiles/ai/.agents/plugins/marketplace.json)
and local source links. entries are optional; catalog availability does not mean installed or enabled.
see the catalog for sources and versions.

| plugin                                                                | provides                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`agent-system`](https://github.com/tanaabased/openclaw-agent-system) | profile binding, setup checks and repairs, and model routing.             |
| [`agentbox`](https://github.com/tanaabased/agentbox)                  | Agentbox host setup and diagnostic skills.                                |
| [`leia`](https://github.com/lando/leia)                               | scenario skills and assets; projects manage their Leia CLI separately.    |
| [`piroplugin`](./.codex-plugin/plugin.json)                           | personal assessment, implementation, replies, skill authoring, and voice. |
| [`tanaab`](https://github.com/tanaabased/canon)                       | shared Tanaab authoring and project-management skills.                    |

## skills

[`piroplugin`](./.codex-plugin/plugin.json) ships these skills for Codex. invoke them by name;
each has a defined job, not a general license to meddle.

for skills-only installation, see the [Quickstart](./README.md#quickstart).

| skill                                                         | owns                                                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [`piro-feedback-reply`](./skills/feedback-reply/)             | concise public candidates using the shared voice, supplied evidence, and event context. |
| [`piro-issue-assessment`](./skills/issue-assessment/)         | issue investigation and plans that compare local fixes with justified consolidation.    |
| [`piro-issue-implementation`](./skills/issue-implementation/) | authorized plans implemented with affected callers and existing/new contracts verified. |
| [`piro-skill-author`](./skills/skill-author/)                 | piro customization of Canon's shared authoring and validation.                          |
| [`piro-voice`](./skills/voice/)                               | approachable maintainer prose with practical skepticism, warmth, and geeky enthusiasm.  |

the [profile](./.agent-system/agent.yaml) selects the assessment, implementation, and reply skills.
the installed plugin must expose them before the bound workspace selects them. see
[direct invocation](./README.md#direct-invocation) for task startup and retirement.

## automations

| work              | source and purpose                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| issue assignments | Agent System creates intake from `github.issue-assignment` policy; activate and reconcile it through Install. |
| `smoke-test`      | disabled; a 15-minute schedule for an explicitly authorized validation window.                                |

both are configured through the [profile](./.agent-system/agent.yaml), but issue intake is generated
by Agent System rather than listed under `automations`. see its
[Codex automation contract](https://github.com/tanaabased/openclaw-agent-system/blob/main/CODEX.md#repository-automations).

## configuration files

edit these sources to change the profile:

| file                                                                               | owns                                                                                      |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`.agent-system/agent.yaml`](./.agent-system/agent.yaml)                           | identity, model profiles, setup, GitHub notification policy, and automation declarations. |
| [`GOALS.md`](./GOALS.md)                                                           | direction, priorities, and deferrals.                                                     |
| [`dotfiles/ai/.codex/AGENTS.md`](./dotfiles/ai/.codex/AGENTS.md)                   | global collaboration, voice, and change-discipline guidance.                              |
| [`dotfiles/ai/.codex/config.shared.toml`](./dotfiles/ai/.codex/config.shared.toml) | portable Codex settings, including service tier and Fast mode.                            |
| `~/.codex/config.local.toml`                                                       | machine-specific settings, including project trust and local paths.                       |
| `~/.codex/config.toml`                                                             | generated output; edit its source inputs instead.                                         |

local configuration may add settings, but cannot override exact keys owned by the shared file or
the manifest's default model and effort. the model loader generates app defaults; Agent System
selects model and effort for individual tasks. see [model routing](./references/model-routing.md)
for task selection and fallback, and the [cheat sheet](#cheat-sheet) for applying changes.

## cheat sheet

pick the operation you need, not the whole block. terminal commands run from the source checkout;
paste Codex prompts into chat. `apply`, `codex:sync`, and Agent System Install change installed state.

```text
# terminal — work from the source checkout
cd /Users/pirog/tanaab/me

# terminal — run local tests, lint, formatting, and ShellCheck
bun run test
bun run lint

# terminal — check or install the base Homebrew inventory
bun scripts/setup.js check brewfile
bun scripts/setup.js apply brewfile

# terminal — check or restow dotfiles into your home directory
bun scripts/setup.js check dotfiles
bun scripts/setup.js apply dotfiles

# terminal — check or regenerate shared Codex settings and model defaults
bun scripts/setup.js check config
bun scripts/setup.js apply config

# terminal — check plugin-cache drift; sync after editing plugin source, then check again
bun run codex:check
bun run codex:sync
bun run codex:check

# Codex — inspect workspace readiness without applying repairs
use $agent-system-doctor to check this workspace.

# Codex — apply declared repairs and reconcile automations, then verify saved state
use $agent-system-install, then $agent-system-doctor. report anything still unresolved.

# Codex — bind this profile; confirm the target, then start a fresh chat
use $agent-system-codex-binding to bind this plugin to /Users/pirog/tanaab/me.

# Codex — start or resume one issue without assigning it or enabling scheduled intake
use $agent-system-task-launch to work on <issue URL>.

# Codex — retire managed work without closing the GitHub issue
use $agent-system-task-retirement to clean up <issue URL>.

# Codex — review an existing PR through the temporary native startup route
start a review of <PR URL> using references/codex-task-access.md in the bound Me workspace.

# Codex — author a skill using Canon with piro customization
use $piro-skill-author to create <skill name and purpose> in this repository.

# Codex — rewrite supplied prose in the shared voice
use $piro-voice to rewrite the following text: <text>.
```

after model-profile changes, apply `config` and sync the plugin cache, then check defaults in a fresh
Codex chat. existing chat selections stay unchanged. plugin sync does not reconcile automations;
Install owns that step. Doctor verifies saved state, not successful scheduled execution.
