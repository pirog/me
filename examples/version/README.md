# Tanaab Version Example

This example keeps coverage on non-local repository materialization in `boot.sh`, with emphasis on
released-version fetch behavior for `tanaab`. It uses the workflow checkout as the hidden `me`
payload while verifying that the wrapper can clone canon via ssh and then replace that checkout with
a released archive.

This scenario is intended to run in CI by default. Do not run it locally unless the task explicitly
calls for a local Leia run.

## Setup

```bash
# should remove any previous version example targets
rm -rf "$HOME/tanaab/me" "$HOME/tanaab/canon"

# should remove any previously installed tanaab plugin link
rm -f "$HOME/.codex/plugins/tanaab"
rm -f "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/tanaab"

# should have the workflow me payload available
test "$PIROME_PAYLOAD_DIR" = "$GITHUB_WORKSPACE"
test -d "$PIROME_PAYLOAD_DIR/.git"

# should have the op token test secret available
test -n "$OPTOKEN"

# should run boot.sh successfully using the default ssh tanaab source
boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test'
test -d "$HOME/tanaab/canon/.git"
git -C "$HOME/tanaab/canon" remote get-url origin > "$TMPDIR/tanaab.ssh.origin"

# should run boot.sh successfully using a released tanaab source and replace the existing checkout
boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --tanaab v0.2.0 \
  --force
```

## Testing

```bash
# should keep using the workflow me payload in place
test -d "$PIROME_PAYLOAD_DIR/.git"
test -f "$PIROME_PAYLOAD_DIR/boot.sh"
test -f "$PIROME_PAYLOAD_DIR/.codex-plugin/plugin.json"
! test -e "$HOME/tanaab/me"

# should have cloned tanaab canon via ssh before replacing it with the release archive
test "$(cat "$TMPDIR/tanaab.ssh.origin")" = "git@github.com:tanaabased/canon.git"

# should extract the version tanaab release archive in place
test -f "$HOME/tanaab/canon/README.md"

# should include the plugin manifest in the version tanaab release archive
test -f "$HOME/tanaab/canon/.codex-plugin/plugin.json"

# should distinguish the extracted tanaab release tree from a git checkout
! test -d "$HOME/tanaab/canon/.git"

# should stow the tanaab plugin link against the released canon checkout
test -L "$HOME/.codex/plugins/tanaab"
test "$(python3 -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$HOME/.codex/plugins/tanaab")" = "$HOME/tanaab/canon"
```

## Destroy tests

```bash
# should remove the installed example ssh key
rm -f "$HOME/.ssh/id_test"

# should remove the stowed tanaab plugin link
rm -f "$HOME/.codex/plugins/tanaab"
rm -f "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/tanaab"

# should remove the version example targets
rm -rf "$HOME/tanaab/me" "$HOME/tanaab/canon"
```
