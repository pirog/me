# `me`

<p align="center">
  <img src="./assets/icon-large-circle.png" alt="pirog" width="180" />
</p>

<p align="center">
  <a href="https://github.com/pirog/me/releases"><img src="https://img.shields.io/github/v/release/pirog/me?include_prereleases&sort=semver" alt="Latest release" /></a>
  <a href="https://app.netlify.com/projects/pirog-boot-me/deploys"><img src="https://api.netlify.com/api/v1/badges/1150311b-5f04-4b40-a722-747abdc6fbf5/deploy-status" alt="Netlify Status" /></a>
  <img src="https://img.shields.io/badge/macOS-26%2B-111827" alt="macOS 26+" />
  <img src="https://img.shields.io/badge/Codex-piroplugin-00c88a" alt="Codex plugin: piroplugin" />
</p>

`me` gives a Mac pirog's tools, habits, and prejudices—and gives Codex a job beyond producing
agreeable paragraphs. Workstation setup, goal-driven planning, sensible model selection, and prose
with a pulse, all in one editable profile.

> Supports macOS 26 or newer.

## Overview

- Put the workstation in order: applications, dotfiles, and 1Password-backed SSH keys, with
  [Bootbox](https://github.com/tanaabased/bootbox) doing the bootstrap work.
- Choose work by its contribution to your goals, not its talent for filling an issue queue.
  Plan assigned or unassigned work and assess issues or PRs in dedicated Codex tasks.
- Reserve heavier task models for harder problems. Configure model and effort mappings once;
  override them when you have a reason.
- Give human-facing prose a point of view. Pirog Voice brings conviction and wit to replies,
  documentation, and GitHub discussions; the global guidance supplies the willingness to push back.
- Keep planning, closeout, and profile checks in working order, with explicit approval boundaries.
- Let Codex TUI, Vim, Visual Studio Code, and Warp look as though they belong on the same machine.

## Quickstart

Provide a 1Password service account token and run the hosted bootstrap:

```sh
/bin/bash -c "$(curl -fsSL https://boot.pirog.me/boot.sh)" piroboot \
  --op-token "$OP_TOKEN"
```

The default run installs the configured SSH keys and applies the Brewfile and dotfiles to `$HOME`.
Tanaab repositories are opt-in. Installed `agentbox` and formula-backed Tailscale hosts retain their
existing services; see [Dependencies](./ADVANCED.md#dependencies).

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

| Option       | Use                                                                         |
| ------------ | --------------------------------------------------------------------------- |
| `--op-token` | Authenticate private SSH-key retrieval.                                     |
| `--ssh-key`  | Select a `vault/item[:filename]`; repeat for multiple keys.                 |
| `--tanaab`   | Select a repository from `@tanaabased`; repeat for multiple repositories.   |
| `--yes`      | Accept the plan without prompts.                                            |
| `--force`    | Replace supported Bootbox targets and SSH keys, never repository checkouts. |
| `--debug`    | Show debug output with secrets masked.                                      |

See [CLI Options](./ADVANCED.md#cli-options) for defaults, environment variables, and checkout safety.

## After Bootstrap

- **1Password:** on desktop hosts, sign in, unlock, and enable Developer > Integrate with 1Password CLI
  and Show 1Password Developer experience. Keep the supplied beta CLI for 1Password Environments;
  check access with `op vault list`.
- **Tailscale:** if using the desktop app, sign in and join `tanaab.dev`. Leave formula-backed services
  in place; `tailscale status --json` should report the local node running and online.
- **Codex:** sign in and install `piroplugin` from Pirostore; install `tanaab` too if you selected Canon.
  Connect GitHub as `pirog` and monday.com as `Michael Pirog`.
- Ask Codex to run `$piro-automation check` and review the plan before approving live sync.
  Run `$piro-me-doctor` for read-only profile and automation-drift diagnosis; approve access prompts
  only when you intentionally requested the check.

## Components

| Component                                                | Includes                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Dependencies](./ADVANCED.md#dependencies)               | Base applications and runtimes, plus optional OpenClaw tooling.          |
| [Dotfiles](./ADVANCED.md#dotfiles)                       | Shell, editor, terminal, Git, SSH, and Codex configuration.              |
| [Skills](./ADVANCED.md#skills)                           | Planning, task lifecycle, model routing, Voice, and profile maintenance. |
| [Configuration Files](./ADVANCED.md#configuration-files) | Goals, actors, repository scope, automations, and shared model policy.   |

Find Work recommends unassigned issues; Plan Work organizes assigned work. Work on Task opens the
selected issue or PR for assessment, and Morning Closeout checks completed work and delegates safe
retirement to Clean Up Task. The point is to finish useful work, not administer an ever more exquisite queue.

To try routing, ask Codex to use `$piro-work-on-task` with an issue URL. It selects a model and
reasoning effort and explains the choice, including when its assessment differs from metadata.
The new task begins with assessment and planning; implementation still needs your go-ahead.

## Development

```sh
git clone git@github.com:pirog/me.git
cd me
bun install
bun run test
bun run lint
```

See [Utilities](./ADVANCED.md#utilities) to regenerate Codex configuration, refresh the plugin cache,
or validate automation definitions. `bun run build` and Leia scenarios are CI-owned by default:
they generate `dist/` or mutate macOS runner state.

## Issues, Questions and Support

Use the [GitHub issue queue](https://github.com/pirog/me/issues/new/choose) for bugs, regressions, or
feature requests.

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md) for release history and
[GitHub releases](https://github.com/pirog/me/releases) for published artifacts.

## Maintainers

- [@pirog](https://github.com/pirog)

## Contributors

<a href="https://github.com/pirog/me/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pirog/me" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
