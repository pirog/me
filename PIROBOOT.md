# Piroboot

the full option reference and host behavior for [`boot.sh`](./boot.sh).
start with the [README](./README.md#quickstart) for first-time setup and the steps after bootstrap.

## usage

for repeated use, install the script in a directory you manage on `PATH`:

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

## bootstrap behavior

[Bootbox](https://github.com/tanaabased/bootbox) prepares the prerequisites before `me` applies its
Brewfile and dotfiles. without `--tanaab`, boot installs the configured SSH keys, Brewfile, and dotfiles.

on installed [`agentbox`](https://github.com/tanaabased/agentbox) hosts, `me` skips the 1Password and
Tailscale desktop apps but retains the beta 1Password CLI. any host with the Homebrew `tailscale`
formula also skips `tailscale-app` to preserve its existing service. a source checkout alone does
not qualify as an installed Agentbox host.

## CLI options

CLI options override environment variables, which override defaults.

### `--ssh-key`

| field       | value                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| environment | `PIROME_SSH_KEY`                                                                       |
| default     | `vmruk4ny353aly6tbom7z3v2hy/id_pirog,vmruk4ny353aly6tbom7z3v2hy/id_agentbox1`          |
| values      | repeatable `vault/item[:filename]` option or comma-separated environment-variable list |
| description | installs private SSH keys from 1Password.                                              |

the optional filename selects the destination under `~/.ssh`; otherwise the 1Password item name is used.

### `--op-token`

| field       | value                                                       |
| ----------- | ----------------------------------------------------------- |
| environment | `PIROME_OP_TOKEN`; falls back to `OP_SERVICE_ACCOUNT_TOKEN` |
| default     | unset                                                       |
| values      | 1Password service account token                             |
| description | authenticates private SSH-key retrieval from 1Password.     |

a token is required when the SSH-key list is non-empty. to keep its value out of command-line arguments:

```sh
PIROME_OP_TOKEN="$OP_TOKEN" piroboot
```

debug and planning output mask the token; raw arguments are not logged.

### `--tanaab`

| field       | value                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| environment | `PIROME_TANAAB`                                                            |
| default     | none                                                                       |
| values      | repeatable `repo[:codex-plugin[-build]]`; comma-separated environment list |
| description | clones or safely updates repositories from `@tanaabased`.                  |

the first CLI selection replaces the environment list; later selections append. duplicates keep
their first position, and the build suffix wins when a repo is selected more than once.

```sh
piroboot --op-token "$OP_TOKEN" --tanaab canon:codex-plugin --tanaab openclaw-agent-system:codex-plugin-build
PIROME_TANAAB="canon,agentbox" piroboot --op-token "$OP_TOKEN"
```

the action suffix installs frozen Bun dependencies without lifecycle scripts, then installs the
checkout with Codex Tools. `:codex-plugin-build` also runs `bun run build` first.

each name maps to `git@github.com:tanaabased/<repo>.git` and
`~/tanaab/<repo>`. local paths, release versions, source selectors, and falsey disable values are
not supported.

hosted runs use `~/tanaab/me`; running `boot.sh` from a valid source checkout uses it without updating it.
existing canonical or selected Tanaab checkouts are refreshed only when clean, on `main`, tracking
`origin/main`, and connected to the expected origin. otherwise local work is preserved.

### `-y`, `--yes`

| field       | value                                      |
| ----------- | ------------------------------------------ |
| environment | `NONINTERACTIVE`                           |
| default     | unset                                      |
| values      | `--yes` or a truthy environment value      |
| description | accepts the plan and runs without prompts. |

### `--force`

| field       | value                                             |
| ----------- | ------------------------------------------------- |
| environment | `PIROME_FORCE`                                    |
| default     | off                                               |
| values      | flag or truthy environment value                  |
| description | allows supported existing targets to be replaced. |

`--force` applies to supported Bootbox operations and existing SSH-key destinations. it never
discards or replaces local work in `~/tanaab/me` or any Tanaab repository checkout.

### `--debug`

| field       | value                                  |
| ----------- | -------------------------------------- |
| environment | `PIROME_DEBUG`                         |
| default     | off                                    |
| values      | flag or truthy environment value       |
| description | shows detailed wrapper debug messages. |

see [token handling](#--op-token) for masking behavior.

### `--version`

prints the running wrapper version and exits.

### `-h`, `--help`

prints the public CLI and environment-variable contract and exits.

### `CI`

| field       | value                                       |
| ----------- | ------------------------------------------- |
| option      | none                                        |
| default     | unset                                       |
| values      | truthy environment value                    |
| description | runs the wrapper in noninteractive CI mode. |
