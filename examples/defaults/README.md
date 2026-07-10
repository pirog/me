# Defaults Example

This example runs the real `boot.sh` machine-seeding flow once with default product behavior, then
verifies the resulting GitHub-hosted macOS runner state. The workflow provides the hidden payload
directory, required 1Password token, a safe test SSH key, and force mode so the test can prove
replacement of a conflicting key; Tanaab source, targets, and debug behavior stay on their defaults.

This scenario is intended to run in CI by default. Do not run it locally unless the task explicitly
calls for a local Leia run.

## Setup

```bash
# should remove a core formula first
brew uninstall --formula --force stow || true

# should prepare clean default checkout targets
rm -rf "$HOME/tanaab/me" "$HOME/tanaab/canon"
rm -f "$HOME/.codex/plugins/tanaab"

# should have the workflow me payload available
test "$PIROME_PAYLOAD_DIR" = "$GITHUB_WORKSPACE"
test -d "$PIROME_PAYLOAD_DIR/.git"

# should have the op token test secret available
test -n "$OPTOKEN"

# should run boot.sh once and overwrite a conflicting ssh key
mkdir -p "$HOME/.ssh"
printf '%s\n' 'not-a-private-key' > "$HOME/.ssh/id_test"
chmod 600 "$HOME/.ssh/id_test"
boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --force
```

## Testing

```bash
# should ensure homebrew is installed
command -v brew >/dev/null

# should install core homebrew packages
command -v git >/dev/null
command -v jq >/dev/null
command -v stow >/dev/null
command -v op >/dev/null

# should satisfy the me payload Brewfile
brew bundle check --file "$PIROME_PAYLOAD_DIR/Brewfile" --no-upgrade

# should protect the ssh directory permissions
test "$(stat -f '%Lp' "$HOME/.ssh")" = "700"

# should overwrite the conflicting ssh key
test -f "$HOME/.ssh/id_test"
test "$(stat -f '%Lp' "$HOME/.ssh/id_test")" = "600"
test "$(ssh-keygen -y -f "$HOME/.ssh/id_test" | awk '{print $1 " " $2}')" = "$(awk '{print $1 " " $2}' id_test.pub)"

# should use the workflow me payload in place
test -d "$PIROME_PAYLOAD_DIR/.git"
test -f "$PIROME_PAYLOAD_DIR/boot.sh"
! test -e "$HOME/tanaab/me"

# should clone tanaab canon via the default ssh source
test -d "$HOME/tanaab/canon/.git"
test "$(git -C "$HOME/tanaab/canon" config --get remote.origin.url)" = "git@github.com:tanaabased/canon.git"

# should stow the hyperdrive config from the me payload
test -L "$HOME/.config/hyperdrive"
test "$(python3 -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$HOME/.config/hyperdrive")" = "$PIROME_PAYLOAD_DIR/dotfiles/hyperdrive/.config/hyperdrive"
test -f "$HOME/.config/hyperdrive/config.yaml"
cmp -s "$HOME/.config/hyperdrive/config.yaml" "$PIROME_PAYLOAD_DIR/dotfiles/hyperdrive/.config/hyperdrive/config.yaml"

# should stow the lando config from the me payload
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

# should remove tanaab plugin links
rm -f "$HOME/.codex/plugins/tanaab"
rm -f "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/tanaab"

# should remove the installed example ssh key
rm -f "$HOME/.ssh/id_test"

# should remove cloned checkout targets
rm -rf "$HOME/tanaab/me" "$HOME/tanaab/canon"
```
