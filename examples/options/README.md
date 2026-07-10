# Options Example

This example keeps coverage on the shell-facing option contract of `boot.sh`. It runs the wrapper
with CLI flags, delegates into bootbox, and then verifies that the requested SSH keys were
installed and that the bootbox apply step used the workflow's `me` payload Brewfile and dotpkgs on
the default target directory. It also verifies
that the default `--tanaab ssh` flow materialized canon and stowed the `tanaab` plugin link through
the `ai` dotpkg, while still covering the wrapper-specific behavior of skipping an existing
destination key and continuing with the remaining requested keys.

This scenario is intended to run in CI by default. Do not run it locally unless the task explicitly
calls for a local Leia run.

## Setup

```bash
# should remove a core formula first
brew uninstall --formula --force stow || true

# should prepare the default ssh target directory
mkdir -p "$HOME/.ssh"

# should remove an existing me checkout target
rm -rf "$HOME/tanaab/me"

# should remove an existing tanaab canon checkout target
rm -rf "$HOME/tanaab/canon"

# should remove any previously installed tanaab plugin link
rm -f "$HOME/.codex/plugins/tanaab"

# should have the workflow me payload available
test "$PIROME_PAYLOAD_DIR" = "$GITHUB_WORKSPACE"
test -d "$PIROME_PAYLOAD_DIR/.git"

# should have the op token test secret available
test -n "$OPTOKEN"

# should run boot.sh successfully using options and the source-relative payload
env -u PIROME_PAYLOAD_DIR boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test'

# should skip an existing key and continue with the explicit workflow payload
boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test:id_test_options' \
  --debug
```

## Testing

```bash
# should ensure homebrew is installed
command -v brew >/dev/null

# should install core homebrew packages
command -v git >/dev/null && command -v jq >/dev/null && command -v stow >/dev/null && command -v op >/dev/null

# should satisfy the me payload Brewfile
brew bundle check --file "$PIROME_PAYLOAD_DIR/Brewfile" --no-upgrade

# should create the ssh directory
test -d "$HOME/.ssh"

# should protect the ssh directory permissions
test "$(stat -f '%Lp' "$HOME/.ssh")" = "700"

# should install the default ssh key filename from cli flags
test -f "$HOME/.ssh/id_test"

# should protect the default ssh key permissions
test "$(stat -f '%Lp' "$HOME/.ssh/id_test")" = "600"

# should install the overridden ssh key filename from cli flags
test -f "$HOME/.ssh/id_test_options"

# should protect the overridden ssh key permissions
test "$(stat -f '%Lp' "$HOME/.ssh/id_test_options")" = "600"

# should install the default ssh key material that matches the expected public key
test "$(ssh-keygen -y -f "$HOME/.ssh/id_test" | awk '{print $1 \" \" $2}')" = "$(awk '{print $1 \" \" $2}' id_test.pub)"

# should install the overridden ssh key material that matches the expected public key
test "$(ssh-keygen -y -f "$HOME/.ssh/id_test_options" | awk '{print $1 \" \" $2}')" = "$(awk '{print $1 \" \" $2}' id_test.pub)"

# should use the workflow me payload in place
test -d "$PIROME_PAYLOAD_DIR/.git"
test -f "$PIROME_PAYLOAD_DIR/boot.sh"
! test -e "$HOME/tanaab/me"

# should clone tanaab canon via ssh by default
test -d "$HOME/tanaab/canon/.git"

# should point the tanaab canon clone at the github ssh remote
test "$(git -C "$HOME/tanaab/canon" config --get remote.origin.url)" = "git@github.com:tanaabased/canon.git"

# should stow a representative hyperdrive config directory from the me payload
test -L "$HOME/.config/hyperdrive"
test "$(python3 -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$HOME/.config/hyperdrive")" = "$PIROME_PAYLOAD_DIR/dotfiles/hyperdrive/.config/hyperdrive"
test -f "$HOME/.config/hyperdrive/config.yaml"
cmp -s "$HOME/.config/hyperdrive/config.yaml" "$PIROME_PAYLOAD_DIR/dotfiles/hyperdrive/.config/hyperdrive/config.yaml"

# should stow a representative lando config directory from the me payload
test -L "$HOME/.config/lando"
test "$(python3 -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$HOME/.config/lando")" = "$PIROME_PAYLOAD_DIR/dotfiles/lando/.config/lando"
test -f "$HOME/.config/lando/config.yaml"
cmp -s "$HOME/.config/lando/config.yaml" "$PIROME_PAYLOAD_DIR/dotfiles/lando/.config/lando/config.yaml"

# should stow the tanaab plugin link into the target codex plugins directory
test -L "$HOME/.codex/plugins/tanaab"
test "$(python3 -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$HOME/.codex/plugins/tanaab")" = "$HOME/tanaab/canon"
```

## Destroy tests

```bash
# should remove representative stowed config directory symlinks
rm -f "$HOME/.config/hyperdrive" "$HOME/.config/lando"

# should remove the stowed tanaab plugin link
rm -f "$HOME/.codex/plugins/tanaab"
rm -f "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/tanaab"

# should remove the installed example ssh keys
rm -f "$HOME/.ssh/id_test" "$HOME/.ssh/id_test_options"

# should remove the cloned me and tanaab canon checkouts
rm -rf "$HOME/tanaab/me" "$HOME/tanaab/canon"
```
