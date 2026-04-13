# Version Example

This example keeps coverage on non-local repository materialization in `boot.sh`, with emphasis on
released-version fetch behavior. It verifies that the wrapper can clone `me` via ssh, then replace
that checkout in place with a released `me` archive, and it is shaped so future version-backed
surfaces such as `--tanaab` can extend it.

This scenario is intended to run in CI by default. Do not run it locally unless the task explicitly
calls for a local Leia run.

## Setup

```bash
# should remove any previous version example targets
rm -rf "$HOME/tanaab/me"

# should have the op token test secret available
test -n "$OPTOKEN"

# should run boot.sh successfully using the ssh me source
boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --me ssh
test -d "$HOME/tanaab/me/.git"
git -C "$HOME/tanaab/me" remote get-url origin > "$TMPDIR/me.ssh.origin"

# should run boot.sh successfully using the version me source and replace the existing me checkout
boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --me v0.3.1 \
  --force
```

## Testing

```bash
# should have cloned me via ssh before replacing it with the release archive
test "$(cat "$TMPDIR/me.ssh.origin")" = "git@github.com:pirog/me.git"

# should extract the version me release archive in place
test -f "$HOME/tanaab/me/boot.sh"

# should include the plugin manifest in the version me release archive
test -f "$HOME/tanaab/me/.codex-plugin/plugin.json"

# should distinguish the extracted release tree from a git checkout
! test -d "$HOME/tanaab/me/.git"
```

## Destroy tests

```bash
# should remove the installed example ssh key
rm -f "$HOME/.ssh/id_test"

# should remove the version example target
rm -rf "$HOME/tanaab/me"
```
