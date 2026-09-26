# Piroboot

Command usage, bootstrap behavior, and the full option reference for [`boot.sh`](./boot.sh).
Start with the [README](./README.md#quickstart) for first-time setup and the steps after bootstrap.

## Usage

For repeated use, install the script in a directory you manage on `PATH`:

```sh
mkdir -p "$HOME/.local/bin"
curl -fsSL https://boot.pirog.me/boot.sh -o "$HOME/.local/bin/piroboot"
chmod +x "$HOME/.local/bin/piroboot"

# select an ssh key and two tanaab repositories
piroboot \
  --op-token "$OP_TOKEN" \
  --ssh-key "vmruk4ny353aly6tbom7z3v2hy/id_pirog" \
  --tanaab canon \
  --tanaab agentbox

# show all options and environment variables
piroboot --help
```

## Bootstrap Behavior

[Bootbox](https://github.com/tanaabased/bootbox) prepares the prerequisites before `me` applies its
Brewfile and dotfiles. Without `--tanaab`, boot installs the configured SSH keys, Brewfile, and dotfiles.

On installed [`agentbox`](https://github.com/tanaabased/agentbox) hosts, `me` skips the 1Password and
Tailscale desktop apps but retains the beta 1Password CLI. Any host with the Homebrew `tailscale`
formula also skips `tailscale-app` to preserve its existing service. A source checkout alone does
not qualify as an installed Agentbox host.

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

| Field       | Value                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| Environment | `PIROME_TANAAB`                                                            |
| Default     | none                                                                       |
| Values      | Repeatable `repo[:codex-plugin[-build]]`; comma-separated environment list |
| Description | Clones or safely updates repositories from `@tanaabased`.                  |

The first CLI occurrence replaces the environment-sourced list. Additional occurrences append,
and duplicate names are collapsed while preserving their first position. The build suffix wins when
the same repo is selected more than once.

```sh
piroboot --op-token "$OP_TOKEN" --tanaab canon:codex-plugin --tanaab openclaw-agent-system:codex-plugin-build
PIROME_TANAAB="canon,agentbox" piroboot --op-token "$OP_TOKEN"
```

The action suffix installs frozen Bun dependencies without lifecycle scripts, then installs the
checkout with Codex Tools. `:codex-plugin-build` also runs `bun run build` first.

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
