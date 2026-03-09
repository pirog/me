# Me

The purpose of `me` is to be able to seed a machine running `macos` version `26` or above with a base set of packages, access, id and skills so as to approximate me.

Specifically this means installing, maintaining, updating and managing:

- A consistent set of base `packages` with `brew`
- A bunch of `dotfiles` packages with `stow `
- Some `skills` that can _approximate_ and _cosplay_ my knowledge base and preferences
- Some needed access and identity files with `op`.

## Usage

The quickstart is to do the below.

```zsh
# clone repo
git clone git@github.com:pirog/me.git && cd me

# run script
./piroboot.sh
```

If you are looking to customize your install then [advanced usage](#advanced) is for you.

## Advanced

The installation script has various options but you will need to download the script and invoke it directly.

```zsh
# get usage info
bash piroboot.sh --help
```

### Usage

```zsh
TBD
```

Some notes on advanced usage:

#### Environment Variables

If you do not wish to download the script you can set options with environment variables and `curl` the script.

`TANAAB_BREWFILE` accepts a comma-separated list. `--brewfile` can be passed more than once. brewfiles may be local file paths or urls, and relative file paths are resolved from the current working directory.

`TANAAB_DOTPKG` accepts a comma-separated list of stow package paths. `--dotpkg` can be passed more than once. dot package paths are resolved from the current working directory, installed relative to `TANAAB_TARGET` or `--target`, and conflicting target files are backed up under `$TARGET/.tanaab-backups/` before stowing. `stow --dotfiles` is not currently implemented.

```zsh
TANAAB_BREWFILE=Brewfile.base,Brewfile.two
TANAAB_DOTPKG=dotfiles/git,dotfiles/zsh
TANAAB_DEBUG=0
TANAAB_TARGET="/somewhere-else"

```

#### Examples

These are equivalent commands and meant to demostrate environment variable usage vs direct invocation.

```zsh
# use envvars
TANAAB_BREWFILE=Brewfile.base,Brewfile.two \
TANAAB_DOTPKG=dotfiles/git,dotfiles/zsh \
TANAAB_DEBUG=1 \
  /bin/bash -c "$(curl -fsSL https://boot.pirog.me)"

# invoke directly
bash piroboot.sh --brewfile Brewfile.base --brewfile Brewfile.two --dotpkg dotfiles/git --dotpkg dotfiles/zsh --debug
```

## Development

This repo uses Bun for local tooling.

```zsh
bun install
bun run lint
bun run build
```

`bun run build` stages the release artifacts in `dist/` and prepends `SCRIPT_VERSION` when that environment variable is set.

The repo also includes `./brewgen.sh`, which generates a Brewfile from the current Homebrew state for selected package types such as `tap`, `cask`, and `brew`, and can exclude specific packages with `--exclude`.

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
