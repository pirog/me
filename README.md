# Me

The purpose of `me` is to be able to seed a machine running `macos` version `26` or above with a base set of packages, access, id and skills so as to approximate me.

The repo is currently transitioning from the legacy `piroboot.sh` script to a thinner hosted
`boot.sh` wrapper around bootbox. `boot.sh` is the served and tested entrypoint; `piroboot.sh`
remains in the repository as reference material while the wrapper-specific behavior is rebuilt.

Specifically this means installing, maintaining, updating and managing:

- A consistent set of base `packages` with `brew`
- A bunch of `dotfiles` packages with `stow `
- Some `skills` that can _approximate_ and _cosplay_ my knowledge base and preferences
- Some needed access and identity files with `op`.

## Usage

The current wrapper only owns the thin bootbox delegation layer: fetch the hosted script, apply the
wrapper-specific guards and planning flow, then invoke bootbox with the required 1Password token,
the default or requested SSH key, and any supported wrapper flags.

```zsh
# clone repo
git clone git@github.com:pirog/me.git && cd me && chmod +x boot.sh

# run script
bash boot.sh --op-token "$OP_TOKEN"
```

The wrapper currently supports `--op-token`, `--ssh-key`, `--yes`, `--force`, `--debug`,
`--version`, and `--help`. The me-specific execution plan that will sit on top of bootbox comes
next.

If you are looking to customize your install then [advanced usage](#advanced) is for you.

## Advanced

The installation script currently exposes only the wrapper-layer options, so the main advanced usage
surface is how you provide the token, SSH keys, and interactivity mode.

```zsh
# get usage info
bash boot.sh --help
```

Some notes on advanced usage:

#### Environment Variables

If you do not wish to download the script you can set options with environment variables and `curl`
the script.

```zsh
PIROME_OP_TOKEN="$OP_TOKEN"
PIROME_SSH_KEY="vmruk4ny353aly6tbom7z3v2hy/id_pirog"
PIROME_DEBUG=0
PIROME_FORCE=0
```

#### Examples

These are equivalent commands and meant to demostrate environment variable usage vs direct invocation.

```zsh
# use envvars
PIROME_OP_TOKEN="$OP_TOKEN" \
PIROME_SSH_KEY="vmruk4ny353aly6tbom7z3v2hy/id_pirog" \
PIROME_DEBUG=1 \
  /bin/bash -c "$(curl -fsSL https://boot.pirog.me/boot.sh)"

# invoke directly
bash boot.sh --op-token "$OP_TOKEN" --ssh-key vmruk4ny353aly6tbom7z3v2hy/id_pirog --debug
```

## Development

This repo uses Bun for local tooling.

Preferred local runtime versions are tracked in [`.bun-version`](./.bun-version) and [`.tool-versions`](./.tool-versions). Bun is the primary JavaScript runtime for repo tooling; Node is only kept as a compatibility reference entry for tool managers that expect it.

```zsh
bun install
bun run lint
bun run build
```

`bun run build` prepares the tracked `dist/` publish surface, including `boot.sh`, the
landing-page redirect, and the hosting metadata files used by deployment.

The repo also carries a minimal Leia-backed example at
[`examples/cli-contract/README.md`](./examples/cli-contract/README.md). That
scenario is intentionally basic and CI-owned: do not run Leia locally unless you explicitly need a
local Leia run for the task at hand. Normal local validation here is `bun run lint`, `bun run
build`, and static review, while CI exercises the prepared `dist/` entrypoint.

## Issues, Questions and Support

If you'd like to report a bug or submit a feature request then please [use the issue queue](https://github.com/pirog/me/issues/new/choose) in this repo.

## Changelog

We try to log all changes big and small in both [THE CHANGELOG](https://github.com/pirog/me/blob/main/CHANGELOG.md) and the [release notes](https://github.com/pirog/me/releases).

## Maintainers

- [@pirog](https://github.com/pirog)

## Contributors

<a href="https://github.com/pirog/me/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pirog/me" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
