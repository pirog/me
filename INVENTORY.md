# Inventory

What `me` ships and which files own it. Start with the [README](./README.md) for setup and development,
or [Piroboot](./PIROBOOT.md) for bootstrap command usage.

## Components

### Dependencies

[`Brewfile`](./Brewfile) is the shopping list for applications and command-line tools.
Runtime requirements are declared in [`.node-version`](./.node-version) and [`.bun-version`](./.bun-version).

[`Brewfile.openclaw`](./Brewfile.openclaw) is a manually installed, optional bundle containing
`openclaw-cli`, `clawhub`, and the native OpenClaw app. Bootstrap and repeatable setup leave it alone;
it does not provision an agent identity, workspace, runtime configuration, or Gateway.

See [Piroboot](./PIROBOOT.md#bootstrap-behavior) for bootstrap behavior on existing hosts.

### Dotfiles

The shipped packages under [`dotfiles/`](./dotfiles/) are applied to `$HOME` with GNU Stow:

| Package                               | Provides                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`ai`](./dotfiles/ai)                 | Codex defaults, global agent guidance, pets, the Pirostore marketplace, and plugin links. |
| [`gh`](./dotfiles/gh)                 | GitHub CLI configuration.                                                                 |
| [`git`](./dotfiles/git)               | Git configuration, including the Lando-specific include.                                  |
| [`hyperdrive`](./dotfiles/hyperdrive) | Hyperdrive configuration.                                                                 |
| [`lando`](./dotfiles/lando)           | Lando configuration.                                                                      |
| [`ssh`](./dotfiles/ssh)               | SSH configuration and public keys.                                                        |
| [`theme`](./dotfiles/theme)           | The shared Tanaab color palette.                                                          |
| [`vim`](./dotfiles/vim)               | Native packages and a Tanaab theme that follows the terminal's ANSI palette.              |
| [`vscode`](./dotfiles/vscode)         | Settings and Tanaab / Tanaab Solarized light and dark themes.                             |
| [`warp`](./dotfiles/warp)             | Terminal settings and Tanaab / Tanaab Solarized light and dark themes.                    |
| [`zsh`](./dotfiles/zsh)               | Shell environment, history, and fallback prompt.                                          |

Codex TUI defaults to Tanaab Solarized Dark. When using another Warp theme, set `[tui].theme` to
`ansi` in [the shared configuration](./dotfiles/ai/.codex/config.shared.toml) so syntax and diff
colors follow the terminal instead of retaining dark-specific fills.

### Plugins

The `ai` dotpkg installs the [Pirostore catalog](./dotfiles/ai/.agents/plugins/marketplace.json)
and its local source links. Catalog entries are optional; making them available does not install or
enable them. The catalog owns the configured sources and versions.

| Plugin                                                                | Provides                                                               |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`agent-system`](https://github.com/tanaabased/openclaw-agent-system) | Profile binding, setup checks and repairs, and model routing.          |
| [`agentbox`](https://github.com/tanaabased/agentbox)                  | Agentbox host setup and diagnostic skills.                             |
| [`leia`](https://github.com/lando/leia)                               | Scenario skills and assets; projects manage their Leia CLI separately. |
| [`piroplugin`](./.codex-plugin/plugin.json)                           | Personal task lifecycle, skill authoring, and voice skills.            |
| [`tanaab`](https://github.com/tanaabased/canon)                       | Shared Tanaab authoring and project-management skills.                 |

### Skills

[`piroplugin`](./.codex-plugin/plugin.json) ships these skills for Codex. Invoke them by name;
each has a defined job, not a general license to meddle. Follow the links for workflows and approval boundaries.

For skills-only installation:

```sh
npx --yes --package=@tanaab/codex-tools@1 -- codex-tools install npm:@pirog/me@latest --marketplace pirostore
```

| Skill                                                         | Owns                                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [`piro-clean-up-task`](./skills/clean-up-task/)               | Archiving a finished task after checking that its work is preserved.                        |
| [`piro-feedback-reply`](./skills/feedback-reply/)             | concise public candidates using the shared voice, supplied evidence, and event context.     |
| [`piro-issue-assessment`](./skills/issue-assessment/)         | issue investigation and plans that compare local fixes with justified consolidation.        |
| [`piro-issue-implementation`](./skills/issue-implementation/) | authorized plans implemented with affected callers and existing/new contracts verified.     |
| [`piro-skill-author`](./skills/skill-author/)                 | Skill authoring and optimization.                                                           |
| [`piro-voice`](./skills/voice/)                               | approachable maintainer prose with practical skepticism, warmth, and geeky enthusiasm.      |
| [`piro-work-on-task`](./skills/work-on-task/)                 | Issue or PR assessment and planning in a Codex worktree, with policy-based model selection. |

the [profile](./.agent-system/agent.yaml) selects the three stage skills by qualified `piroplugin:`
name. assessment also consumes [consolidation guidance](./.agent-system/guidance/assessment.md);
implementation and feedback have no supplemental stage guidance. `debug: true` exposes the selected
instructions in private Agent System presentations. [piro-voice](./skills/voice/SKILL.md) remains the
shared voice; the reply skill owns composition rather than another voice definition.

authoring or validating these files does not activate the profile. the installed plugin must expose
the selected skills before the stable bound workspace selects them; guidance paths resolve from that
workspace. Agent System owns selection, authority, retention, recovery, and publication under its
[stage configuration contract](https://github.com/tanaabased/openclaw-agent-system/blob/main/MANIFEST.md#assessment-selection).
live activation and pilots are separate from skill authoring and developer cache synchronization.

### Configuration Files

These are the main configuration entrypoints, rather than every file in the profile.

| File                                                                               | Owns                                                                                      |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`.agent-system/agent.yaml`](./.agent-system/agent.yaml)                           | Identity, model profiles, setup, GitHub notification policy, and automation declarations. |
| [`GOALS.md`](./GOALS.md)                                                           | Direction, priorities, and deferrals.                                                     |
| [`dotfiles/ai/.codex/AGENTS.md`](./dotfiles/ai/.codex/AGENTS.md)                   | Global collaboration, voice, and change-discipline guidance.                              |
| [`dotfiles/ai/.codex/config.shared.toml`](./dotfiles/ai/.codex/config.shared.toml) | Portable Codex settings, including service tier and Fast mode.                            |
| `~/.codex/config.local.toml`                                                       | Machine-specific settings, including project trust and local paths.                       |
| `~/.codex/config.toml`                                                             | Generated output; edit its source inputs instead.                                         |

Local configuration may add settings, but cannot override exact keys owned by the shared file or
manifest's default model and effort. Me's model loader reads the owning profile to generate those
app defaults; Agent System resolves model and effort for individual tasks. Edit the sources rather
than the generated `~/.codex/config.toml`.
See [model routing](./references/model-routing.md) for task selection and fallback behavior, and
[Development](./README.md#development) for applying configuration and plugin changes.
