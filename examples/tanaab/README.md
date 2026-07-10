# Tanaab Example

This example verifies repeatable Tanaab repository materialization, safe refresh behavior, and
manifest-driven Codex plugin link reconciliation. Local Git URL rewrites keep repository lifecycle
coverage deterministic while the workflow still runs the real `boot.sh` machine-seeding path.

This scenario is intended to run in CI by default. Do not run it locally unless the task explicitly
calls for a local Leia run.

## Setup

```bash
# should prepare a local canon origin with a codex plugin manifest
mkdir -p "$TMPDIR/canon-work/.codex-plugin"
git init -b main "$TMPDIR/canon-work"
git -C "$TMPDIR/canon-work" config user.email tanaabot@tanaab.dev
git -C "$TMPDIR/canon-work" config user.name tanaabot
printf '%s\n' '{"name":"tanaab"}' > "$TMPDIR/canon-work/.codex-plugin/plugin.json"
printf '%s\n' 'canon one' > "$TMPDIR/canon-work/state.txt"
git -C "$TMPDIR/canon-work" add .
git -C "$TMPDIR/canon-work" commit -m 'canon one'
printf '%s\n' 'canon two' > "$TMPDIR/canon-work/state.txt"
git -C "$TMPDIR/canon-work" commit -am 'canon two'
git clone --bare "$TMPDIR/canon-work" "$TMPDIR/canon-origin.git"

# should prepare a local non-plugin agentbox origin
mkdir -p "$TMPDIR/agentbox-work"
git init -b main "$TMPDIR/agentbox-work"
git -C "$TMPDIR/agentbox-work" config user.email tanaabot@tanaab.dev
git -C "$TMPDIR/agentbox-work" config user.name tanaabot
printf '%s\n' 'agentbox one' > "$TMPDIR/agentbox-work/state.txt"
git -C "$TMPDIR/agentbox-work" add .
git -C "$TMPDIR/agentbox-work" commit -m 'agentbox one'
printf '%s\n' 'agentbox two' > "$TMPDIR/agentbox-work/state.txt"
git -C "$TMPDIR/agentbox-work" commit -am 'agentbox two'
git clone --bare "$TMPDIR/agentbox-work" "$TMPDIR/agentbox-origin.git"

# should route tanaab ssh clones to the local origins
GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" git config --global protocol.file.allow always
GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" git config --global url."file://$TMPDIR/canon-origin.git".insteadOf git@github.com:tanaabased/canon.git
GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" git config --global url."file://$TMPDIR/agentbox-origin.git".insteadOf git@github.com:tanaabased/agentbox.git

# should prepare clean tanaab checkout and plugin targets
rm -rf "$HOME/tanaab/canon" "$HOME/tanaab/agentbox"
rm -f "$HOME/.codex/plugins/tanaab" "$HOME/.codex/plugins/agentbox-plugin"
rm -f "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/tanaab"
rm -f "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/agentbox-plugin"
test -n "$OPTOKEN"

# should clone two selected tanaab repositories
GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --tanaab canon \
  --tanaab agentbox
```

## Testing

```bash
# should materialize both selected repositories through their ssh identities
test -d "$HOME/tanaab/canon/.git"
test -d "$HOME/tanaab/agentbox/.git"
test "$(git -C "$HOME/tanaab/canon" remote get-url origin)" = "git@github.com:tanaabased/canon.git"
test "$(git -C "$HOME/tanaab/agentbox" remote get-url origin)" = "git@github.com:tanaabased/agentbox.git"

# should link only the repository that declares a codex plugin
test -L "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/tanaab"
test -L "$HOME/.codex/plugins/tanaab"
test "$(python3 -c 'import os, sys; print(os.path.realpath(sys.argv[1]))' "$HOME/.codex/plugins/tanaab")" = "$HOME/tanaab/canon"
! test -e "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/agentbox-plugin"
! test -L "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/agentbox-plugin"
! test -L "$HOME/.codex/plugins/agentbox-plugin"

# should prepare clean and dirty repository refresh states
git -C "$HOME/tanaab/canon" reset --hard HEAD^
git -C "$HOME/tanaab/agentbox" reset --hard HEAD^
printf '%s\n' 'local agentbox work' > "$HOME/tanaab/agentbox/local-work.txt"
mkdir -p "$HOME/tanaab/agentbox/.codex-plugin"
printf '%s\n' '{"name":"agentbox-plugin"}' > "$HOME/tanaab/agentbox/.codex-plugin/plugin.json"

# should fast-forward clean work and preserve dirty work while detecting a new plugin
GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --tanaab canon \
  --tanaab agentbox
test "$(git -C "$HOME/tanaab/canon" rev-parse HEAD)" = "$(git -C "$HOME/tanaab/canon" rev-parse origin/main)"
test "$(git -C "$HOME/tanaab/agentbox" rev-parse HEAD)" != "$(git -C "$HOME/tanaab/agentbox" rev-parse origin/main)"
test -f "$HOME/tanaab/agentbox/local-work.txt"
test -L "$HOME/.codex/plugins/agentbox-plugin"

# should remove a generated link when the checkout stops declaring a plugin
rm -f "$HOME/tanaab/agentbox/.codex-plugin/plugin.json"
GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" boot.sh \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test'
! test -e "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/agentbox-plugin"
! test -L "$PIROME_PAYLOAD_DIR/dotfiles/ai/.codex/plugins/agentbox-plugin"
! test -e "$HOME/.codex/plugins/agentbox-plugin"
! test -L "$HOME/.codex/plugins/agentbox-plugin"
```
