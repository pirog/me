# Advanced

What you get, what you can change, and which command actually changes it. Start with the
[README](./README.md) for setup; this is the inventory and reference, not a second initiation ceremony.

## What Gets Installed

### Dependencies

[`Brewfile`](./Brewfile) is the shopping list for applications and command-line tools.
[Bootbox](https://github.com/tanaabased/bootbox) prepares the prerequisites before `me` applies it.
The profile and Me Doctor require Node 26, pinned in Homebrew and [`.tool-versions`](./.tool-versions).

[`Brewfile.openclaw`](./Brewfile.openclaw) is a manually installed, optional bundle containing
`openclaw-cli`, `clawhub`, and the native OpenClaw app. Bootstrap and Me Doctor leave it alone;
it does not provision an agent identity, workspace, runtime configuration, or Gateway.

On installed [`agentbox`](https://github.com/tanaabased/agentbox) hosts, `me` skips the 1Password and
Tailscale desktop apps but retains the beta 1Password CLI. Any host with the Homebrew `tailscale`
formula also skips `tailscale-app` to preserve its existing service. Detection requires both
`/opt/tanaab/agentbox/bin/health.sh` and
`/Library/LaunchDaemons/dev.tanaab.agentbox.health.plist`; a source checkout alone does not qualify.

### Dotfiles

Each package under [`dotfiles/`](./dotfiles/) is applied to `$HOME` with GNU Stow:

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

The `ai` dotpkg installs the Pirostore catalog and its local source links; it does not install or
enable plugins. Every entry is optional and selected in Codex. npm-backed plugins require the `npm`
CLI and its registry configuration; Codex downloads them without running package lifecycle scripts.

| Plugin                                                                | Source                        | Installation | Provides                                                               |
| --------------------------------------------------------------------- | ----------------------------- | ------------ | ---------------------------------------------------------------------- |
| [`piroplugin`](./.codex-plugin/plugin.json)                           | Local `me` checkout           | Optional     | Personal workflow, planning, voice, and machine-profile skills.        |
| [`agent-system`](https://github.com/tanaabased/openclaw-agent-system) | Verified local checkout       | Optional     | Pirog identity through Codex workspace binding.                        |
| [`agentbox`](https://github.com/tanaabased/agentbox)                  | Verified local checkout       | Optional     | Agentbox host setup and diagnostic skills.                             |
| [`tanaab`](https://github.com/tanaabased/canon)                       | Verified local Canon checkout | Optional     | Shared Tanaab authoring and project-management skills.                 |
| [`leia`](https://github.com/lando/leia)                               | `@lando/leia@2.0.0` from npm  | Optional     | Scenario skills and assets; projects manage their Leia CLI separately. |

### Skills

[`piroplugin`](./.codex-plugin/plugin.json) puts these skills to work in Codex. Invoke them by name;
each has a defined job, not a general license to meddle. Follow the links for workflows and approval boundaries.

| Skill                                                 | Owns                                                                                               |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`piro-automation`](./skills/automation/)             | Scheduled-task validation, drift checks, and approval-gated sync.                                  |
| [`piro-clean-up-task`](./skills/clean-up-task/)       | Archiving a finished task after checking that its work is preserved.                               |
| [`piro-find-work`](./skills/find-work/)               | Goal-aware recommendations for unassigned GitHub issues.                                           |
| [`piro-me-doctor`](./skills/me-doctor/)               | Read-only machine-profile and automation-drift diagnosis.                                          |
| [`piro-morning-closeout`](./skills/morning-closeout/) | Completed-work reporting and eligible task cleanup.                                                |
| [`piro-plan-work`](./skills/plan-work/)               | Assigned-work planning and queuing tasks you select.                                               |
| [`piro-skill-author`](./skills/skill-author/)         | Skill authoring and optimization.                                                                  |
| [`piro-voice`](./skills/voice/)                       | Human-facing prose with conviction, irreverence, and wit; code and structured data stay untouched. |
| [`piro-work-on-task`](./skills/work-on-task/)         | Issue or PR assessment and planning in a Codex worktree, with policy-based model selection.        |

### Configuration Files

| File                                                                               | Owns                                                                             |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`agent.yaml`](./agent.yaml)                                                       | Pirog identity for Agent System.                                                 |
| [`GOALS.md`](./GOALS.md)                                                           | Direction, priorities, and deferrals.                                            |
| [`ACTORS.md`](./ACTORS.md)                                                         | Reviewed work-planning actors and their goals sources.                           |
| [`WORK_REPOS.md`](./WORK_REPOS.md)                                                 | Repository priorities and discovery scope.                                       |
| [`MODEL_ROUTING.yaml`](./MODEL_ROUTING.yaml)                                       | Default model, reasoning effort, Fast mode, and complexity-tier mappings.        |
| [`AUTOMATIONS.yaml`](./AUTOMATIONS.yaml)                                           | Desired schedules, status, and prompt sources for managed Codex tasks.           |
| [`automations/`](./automations/)                                                   | Task prompts and shared readiness checks with bounded recovery and safety stops. |
| [`dotfiles/ai/.codex/AGENTS.md`](./dotfiles/ai/.codex/AGENTS.md)                   | Global collaboration, voice, and change-discipline guidance.                     |
| [`dotfiles/ai/.codex/config.shared.toml`](./dotfiles/ai/.codex/config.shared.toml) | Portable Codex settings not owned by the model policy.                           |
| `~/.codex/config.local.toml`                                                       | Machine-specific settings, including project trust and local paths.              |
| `~/.codex/config.toml`                                                             | Generated output; edit its source inputs instead.                                |

Local configuration may add settings, but cannot override exact keys owned by the shared file or
model policy. Work on Task uses native metadata when available and a labeled content assessment
when needed; explicit user choices take precedence. See [model routing](./references/model-routing.md)
for fallback metadata, selection verification, and escalation boundaries.

## CLI Options

CLI options override environment variables, which override defaults.

### `--ssh-key`

| Field       | Value                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| Environment | `PIROME_SSH_KEY`                                                                       |
| Default     | `vmruk4ny353aly6tbom7z3v2hy/id_pirog,vmruk4ny353aly6tbom7z3v2hy/id_agentbox1`          |
| Values      | Repeatable `vault/item[:filename]` option or comma-separated environment-variable list |
| Description | Installs private SSH keys from 1Password.                                              |

The optional filename overrides the destination filename under `~/.ssh`. Without it, the 1Password
item name is used.

### `--op-token`

| Field       | Value                                                       |
| ----------- | ----------------------------------------------------------- |
| Environment | `PIROME_OP_TOKEN`; falls back to `OP_SERVICE_ACCOUNT_TOKEN` |
| Default     | unset                                                       |
| Values      | 1Password service account token                             |
| Description | Authenticates private SSH-key retrieval from 1Password.     |

The token is required while the configured SSH-key list is non-empty. To avoid passing its value
as a command-line argument:

```sh
PIROME_OP_TOKEN="$OP_TOKEN" piroboot
```

Debug and planning output mask the token.

### `--tanaab`

| Field       | Value                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| Environment | `PIROME_TANAAB`                                                         |
| Default     | none                                                                    |
| Values      | Repeatable repository name or comma-separated environment-variable list |
| Description | Clones or safely updates repositories from `@tanaabased`.               |

The first CLI occurrence replaces the environment-sourced list. Additional occurrences append,
and duplicate names are collapsed while preserving their first position.

```sh
piroboot --op-token "$OP_TOKEN" --tanaab canon --tanaab agentbox
PIROME_TANAAB="canon,agentbox" piroboot --op-token "$OP_TOKEN"
```

Each name maps deterministically to `git@github.com:tanaabased/<repo>.git` and
`~/tanaab/<repo>`. Local paths, release versions, source selectors, and falsey disable values are
not supported.

Hosted runs use `~/tanaab/me`; running `boot.sh` from a valid source checkout uses it without updating it.
Existing canonical or selected Tanaab checkouts are refreshed only when clean, on `main`, tracking
`origin/main`, and connected to the expected origin. Otherwise local work is preserved.

### `-y`, `--yes`

| Field       | Value                                      |
| ----------- | ------------------------------------------ |
| Environment | `NONINTERACTIVE`                           |
| Default     | unset                                      |
| Values      | `--yes` or a truthy environment value      |
| Description | Accepts the plan and runs without prompts. |

### `--force`

| Field       | Value                                             |
| ----------- | ------------------------------------------------- |
| Environment | `PIROME_FORCE`                                    |
| Default     | off                                               |
| Values      | Flag or truthy environment value                  |
| Description | Allows supported existing targets to be replaced. |

`--force` applies to supported Bootbox operations and existing SSH-key destinations. It never
discards or replaces local work in `~/tanaab/me` or any Tanaab repository checkout.

### `--debug`

| Field       | Value                                  |
| ----------- | -------------------------------------- |
| Environment | `PIROME_DEBUG`                         |
| Default     | off                                    |
| Values      | Flag or truthy environment value       |
| Description | Shows detailed wrapper debug messages. |

Debug output masks the 1Password token and does not log raw arguments.

### `--version`

Prints the running wrapper version and exits.

### `-h`, `--help`

Prints the public CLI and environment-variable contract and exits.

### `CI`

| Field       | Value                                       |
| ----------- | ------------------------------------------- |
| Option      | none                                        |
| Default     | unset                                       |
| Values      | Truthy environment value                    |
| Description | Runs the wrapper in noninteractive CI mode. |

## Utilities

Run these from the `me` checkout. Pick the operation you need; running the whole block is not a
maintenance ritual.

```sh
# regenerate codex configuration and restow the ai dotfiles into your home directory
bun run ai:sync

# compare the installed plugin cache with the source
bun run codex:check

# refresh the installed plugin cache after source changes
bun run codex:sync

# verify that the refreshed cache matches
bun run codex:check

# validate scheduled-task definitions without changing live automations
bun run automations:validate

# compare saved automations with the manifest and current Codex defaults
bun run automations:check
```

- `ai:sync` changes installed configuration; `codex:sync` changes the plugin cache. After model-policy
  changes, use both and verify the defaults in a new task. Existing task selections remain unchanged.
- Cache scripts call the development dependency `@tanaab/codex-tools` directly; payload selection
  lives in `package.json#codexTools`. Use `bun run codex:sync --dry-run` to preview changes, or add
  `--cache-path <path> --missing-target create` for a disposable raw copy, not a plugin installation.
  Plugin validation runs through `tanaabased/actions/validate-codex-plugin@v1` in CI.
- To restow without regenerating configuration, use `bun run ai:sync --no-codex-config`.
- Saved automations require a separate `$piro-automation check` and approved reconciliation in Codex.
  Editing defaults or validating the manifest does not update them.
- `automations:check` reads saved settings without writing; exit 1 with a plan means drift.
  Ask `$piro-automation` to sync to apply the plan through Codex and check again. Model defaults are
  copied at sync time because the native tool currently requires explicit model and reasoning values.
- Restart Codex if it does not pick up refreshed plugin assets. OpenClaw settings are separate and
  are not changed by these utilities.
