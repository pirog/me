# Inventory

What `me` ships and which files own it. Start with the [README](./README.md) for setup and development,
or [Piroboot](./PIROBOOT.md) for bootstrap command usage.

## Components

### Dependencies

[`Brewfile`](./Brewfile) is the shopping list for applications and command-line tools.
Runtime requirements are declared in [`.tool-versions`](./.tool-versions).

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
| [`piroplugin`](./.codex-plugin/plugin.json)                           | Personal workflow, planning, and voice skills.                         |
| [`tanaab`](https://github.com/tanaabased/canon)                       | Shared Tanaab authoring and project-management skills.                 |

### Skills

[`piroplugin`](./.codex-plugin/plugin.json) ships these skills for Codex. Invoke them by name;
each has a defined job, not a general license to meddle. Follow the links for workflows and approval boundaries.

| Skill                                                 | Owns                                                                                               |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`piro-automation`](./skills/automation/)             | Scheduled-task validation, drift checks, and approval-gated sync.                                  |
| [`piro-clean-up-task`](./skills/clean-up-task/)       | Archiving a finished task after checking that its work is preserved.                               |
| [`piro-find-work`](./skills/find-work/)               | Goal-aware recommendations for unassigned GitHub issues.                                           |
| [`piro-morning-closeout`](./skills/morning-closeout/) | Completed-work reporting and eligible task cleanup.                                                |
| [`piro-plan-work`](./skills/plan-work/)               | Assigned-work planning and queuing tasks you select.                                               |
| [`piro-skill-author`](./skills/skill-author/)         | Skill authoring and optimization.                                                                  |
| [`piro-voice`](./skills/voice/)                       | Human-facing prose with conviction, irreverence, and wit; code and structured data stay untouched. |
| [`piro-work-on-task`](./skills/work-on-task/)         | Issue or PR assessment and planning in a Codex worktree, with policy-based model selection.        |

### Configuration Files

These are the main configuration entrypoints, rather than every file in the profile.

| File                                                                               | Owns                                                                                |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`agent.yaml`](./agent.yaml)                                                       | Identity, model profiles, and repeatable setup checks and repairs for Agent System. |
| [`GOALS.md`](./GOALS.md)                                                           | Direction, priorities, and deferrals.                                               |
| [`ACTORS.md`](./ACTORS.md)                                                         | Reviewed work-planning actors and their goals sources.                              |
| [`WORK_REPOS.md`](./WORK_REPOS.md)                                                 | Repository priorities and discovery scope.                                          |
| [`AUTOMATIONS.yaml`](./AUTOMATIONS.yaml)                                           | Desired schedules, status, and prompt sources for managed Codex tasks.              |
| [`automations/`](./automations/)                                                   | Task prompts and shared readiness checks with bounded recovery and safety stops.    |
| [`dotfiles/ai/.codex/AGENTS.md`](./dotfiles/ai/.codex/AGENTS.md)                   | Global collaboration, voice, and change-discipline guidance.                        |
| [`dotfiles/ai/.codex/config.shared.toml`](./dotfiles/ai/.codex/config.shared.toml) | Portable Codex settings, including service tier and Fast mode.                      |
| `~/.codex/config.local.toml`                                                       | Machine-specific settings, including project trust and local paths.                 |
| `~/.codex/config.toml`                                                             | Generated output; edit its source inputs instead.                                   |

Local configuration may add settings, but cannot override exact keys owned by the shared file or
manifest's default model and effort. Edit those sources rather than the generated `~/.codex/config.toml`.
See [model routing](./references/model-routing.md) for task selection and fallback behavior, and
[Development](./README.md#development) for applying configuration and plugin changes.
