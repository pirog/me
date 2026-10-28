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

`me` gives a Mac pirog's tools, dotfiles, habits, and prejudices—and gives Codex a job beyond
producing agreeable paragraphs. workstation setup and GitHub-backed task work, in one editable profile.

use it as:

- an [operator profile](#operator-profile) to set up a computer for manual use as pirog.
- a [Codex binding](#codex-binding) to have Codex work with pirog's guidance and preferences,
  automate assigned GitHub issue work, and review pull requests on request.

**we recommend using both.**

requires macOS 26 or newer. see [Inventory](./INVENTORY.md) for what ships and
[Piroboot](./PIROBOOT.md) for bootstrap options.

## quickstart

for workstation and Codex setup, provide a 1Password service account token and run the hosted
bootstrap. it installs applications and dotfiles and retrieves the configured private SSH keys:

```sh
/bin/bash -c "$(curl -fsSL https://boot.pirog.me/boot.sh)" piroboot \
  --op-token "$OP_TOKEN" \
  --tanaab canon:codex-plugin \
  --tanaab openclaw-agent-system:codex-plugin-build
```

for workstation-only setup, omit the two `--tanaab` selections. see [Piroboot](./PIROBOOT.md)
for the full option reference.

for the skills alone, install `piroplugin` without running the machine bootstrap:

```sh
npx --yes --package=@tanaab/codex-tools@1 -- codex-tools install npm:@pirog/me@latest --marketplace pirostore
```

`piro-skill-author` also requires the Canon (`tanaab`) plugin for shared authoring and validation.

## after pirobooting

### operator profile

- **1Password:** sign in, unlock, and enable Developer > Integrate with 1Password CLI and
  Show 1Password Developer experience. keep the beta CLI for 1Password Environments;
  check access with `op vault list`.
- **Tailscale:** if using the desktop app, sign in and join `tanaab.dev`. leave formula-backed
  services in place; `tailscale status --json` should report the local node running and online.

### Codex binding

the quickstart's two `--tanaab` options install Agent System (`agent-system`) and Canon (`tanaab`).
sign into Codex, install `piroplugin` from Pirostore, and confirm all three plugins are enabled.

connect GitHub as `pirog` and monday.com as `Michael Pirog`. authorize Agent System's hook through
`/hooks`, start a fresh chat, and paste:

```text
Use $agent-system-codex-binding to bind this plugin to /Users/pirog/tanaab/me.
```

confirm the workspace containing [`.agent-system/agent.yaml`](./.agent-system/agent.yaml).
after binding, start a fresh chat and paste:

```text
Use $agent-system-doctor to check this workspace. Then use $agent-system-install
for any declared setup repairs and to reconcile its automations.
Run $agent-system-doctor again and report anything still unresolved.
```

## usage

### direct invocation

paste the prompt you need into Codex, replacing the placeholder:

```text
# start or resume an issue without assigning it or enabling scheduled intake
use $agent-system-task-launch to work on <issue URL>.

# review an existing PR through the temporary native startup route
start a review of <PR URL> using references/codex-task-access.md in the bound Me workspace.

# retire managed work without closing the GitHub issue
use $agent-system-task-retirement to clean up <issue URL>.

# check workspace readiness without applying repairs
use $agent-system-doctor to check this workspace.

# rewrite supplied prose in the shared voice
use $piro-voice to rewrite the following text: <text>.
```

see the [full cheat sheet](./INVENTORY.md#cheat-sheet) for maintenance and other prompts.
existing-PR startup and unmanaged chat cleanup follow the
[temporary native guidance](./references/codex-task-access.md#temporary-native-task-guidance).

### issue assignments

for automatic pickup, set up assignment intake once, then assign work through GitHub:

1. configure approved assigners, repository owners, and the workflow mode in the
   [profile](./.agent-system/agent.yaml). see Agent System's
   [GitHub workflow configuration](https://github.com/tanaabased/openclaw-agent-system/blob/main/MANIFEST.md#github-workflows).
2. use `$agent-system-install` to activate and reconcile intake, then `$agent-system-doctor` to
   check saved state. see the [Codex automation contract](https://github.com/tanaabased/openclaw-agent-system/blob/main/CODEX.md#repository-automations)
   for how scheduled jobs are managed.
3. have an approved assigner assign an eligible issue to `@pirog`. include a clear outcome,
   acceptance criteria, and a reproduction for bugs. follow progress in its Codex chat and review
   any resulting PR.

Doctor checks saved state; a successful scheduled run is separate evidence.

### nightly refresh

`nightly-refresh` is a disabled pilot for keeping Agent System, Canon, and Me current on each
activated Codex installation bound to this profile. it targets clean `main` checkouts at 02:00
`America/New_York` and produces one quoted morning report with commits, cache status, hook trust,
and setup results. the card uses the readable Agent System instance name in inline code;
installation IDs keep each instance's progress separate.

the source helper preserves interrupted progress and bounds transient retries. shared-cache
exclusion, native lifecycle deadlines, refreshed context, and the requested automation display name
still need their owning integrations before unattended activation. follow the
[pilot and recovery instructions](./references/nightly-refresh.md); do not enable the declaration
until those gates pass. the intended automation is `🔄 NIGHTLY REFRESH`, with a plain
`NIGHTLY REFRESH` chat beside `ISSUE ASSIGNMENTS` in `AGENT SYSTEM`.

## development

use the runtimes in [`.node-version`](./.node-version) and [`.bun-version`](./.bun-version):

```sh
# prepare the checkout
git clone git@github.com:pirog/me.git
cd me
bun install --frozen-lockfile --ignore-scripts

# run tests, lint, formatting, and ShellCheck
bun run test
bun run lint
```

edit the [source configuration](./INVENTORY.md#configuration-files), not generated files.
`bun run build` and Leia scenarios are CI-owned by default: they generate `dist/` or mutate macOS
runner state. read [the example guidance](./examples/AGENTS.md) before changing executable examples.

## support and releases

bring bugs, regressions, and feature requests to the [GitHub issue queue](https://github.com/pirog/me/issues/new/choose).
see [CHANGELOG.md](./CHANGELOG.md) and [GitHub releases](https://github.com/pirog/me/releases) for changes.
`piroplugin` releases ship through npm; see [plugin sources](./INVENTORY.md#plugins).

## maintainers

- [@pirog](https://github.com/pirog)

## contributors

<a href="https://github.com/pirog/me/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pirog/me" />
</a>

made with [contrib.rocks](https://contrib.rocks).
