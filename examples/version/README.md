# Version Example

This example keeps coverage on non-local repository materialization in `boot.sh`, with emphasis on
released-version fetch behavior. It currently verifies that the wrapper can clone `me` via ssh and
extract a released `me` archive into the expected target location, and it is shaped so future
version-backed surfaces such as `--tanaab` can extend it.

This scenario is intended to run in CI by default. Do not run it locally unless the task explicitly
calls for a local Leia run.

## Setup

```bash
# should remove any previous version example targets
rm -rf "$HOME/tanaab/me" "$HOME/tanaab/me.ssh" "$HOME/tanaab/me.version"

# should have the op token test secret available
test -n "$OPTOKEN"

# should run boot.sh successfully using the ssh me source
boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --me ssh
mv "$HOME/tanaab/me" "$HOME/tanaab/me.ssh"

# should run boot.sh successfully using the version me source
boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --me v0.3.1
mv "$HOME/tanaab/me" "$HOME/tanaab/me.version"
```

## Testing

```bash
# should clone me via ssh as a git checkout
test -d "$HOME/tanaab/me.ssh/.git"

# should point the ssh me checkout at the github ssh remote
test "$(git -C "$HOME/tanaab/me.ssh" remote get-url origin)" = "git@github.com:pirog/me.git"

# should preserve the wrapper entrypoint in the ssh me checkout
test -f "$HOME/tanaab/me.ssh/boot.sh"

# should extract the version me release archive
test -f "$HOME/tanaab/me.version/boot.sh"

# should include the plugin manifest in the version me release archive
test -f "$HOME/tanaab/me.version/.codex-plugin/plugin.json"

# should distinguish the extracted release tree from a git checkout
! test -d "$HOME/tanaab/me.version/.git"
```

## Destroy tests

```bash
# should remove the installed example ssh key
rm -f "$HOME/.ssh/id_test"

# should remove the version example targets
rm -rf "$HOME/tanaab/me" "$HOME/tanaab/me.ssh" "$HOME/tanaab/me.version"
```
