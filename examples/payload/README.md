# Payload Example

This example verifies the automatic `me` payload fallback used when the prepared wrapper is not
running beside a source checkout and no explicit payload directory is set. It covers the initial
SSH clone, a safe fast-forward of a clean canonical checkout, and preservation of local work.

This scenario is intended to run in CI by default. Do not run it locally unless the task explicitly
calls for a local Leia run.

## Setup

```bash
# should prepare a standalone wrapper outside the source checkout
mkdir -p "$TMPDIR"
cp "$(command -v boot.sh)" "$TMPDIR/piroboot"
chmod 700 "$TMPDIR/piroboot"
git clone --bare "$GITHUB_WORKSPACE" "$TMPDIR/me-origin.git"
git --git-dir="$TMPDIR/me-origin.git" update-ref refs/heads/main "$GITHUB_SHA"
git --git-dir="$TMPDIR/me-origin.git" symbolic-ref HEAD refs/heads/main
GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" git config --global protocol.file.allow always
GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" git config --global url."file://$TMPDIR/me-origin.git".insteadOf git@github.com:pirog/me.git
rm -rf "$HOME/tanaab/me" "$HOME/tanaab/canon"
rm -f "$HOME/.codex/plugins/tanaab"
test -n "$OPTOKEN"

# should clone the canonical me payload via ssh
env -u PIROME_PAYLOAD_DIR GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" "$TMPDIR/piroboot" \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --tanaab off
```

## Testing

```bash
# should materialize the canonical me checkout
test -d "$HOME/tanaab/me/.git"
test -f "$HOME/tanaab/me/boot.sh"
test -f "$HOME/tanaab/me/Brewfile"
test -d "$HOME/tanaab/me/dotfiles"
test -f "$HOME/tanaab/me/.codex-plugin/plugin.json"
test "$(git -C "$HOME/tanaab/me" remote get-url origin)" = "git@github.com:pirog/me.git"

# should fast-forward a clean canonical main checkout
git -C "$HOME/tanaab/me" reset --hard origin/main^2
test "$(git -C "$HOME/tanaab/me" rev-parse HEAD)" != "$(git -C "$HOME/tanaab/me" rev-parse origin/main)"
env -u PIROME_PAYLOAD_DIR GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" "$TMPDIR/piroboot" \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --tanaab off
test "$(git -C "$HOME/tanaab/me" rev-parse HEAD)" = "$(git -C "$HOME/tanaab/me" rev-parse origin/main)"

# should preserve a dirty canonical checkout without updating it
git -C "$HOME/tanaab/me" reset --hard origin/main^2
printf '%s\n' 'local payload work' > "$HOME/tanaab/me/payload-local-work.txt"
payload_head="$(git -C "$HOME/tanaab/me" rev-parse HEAD)"
env -u PIROME_PAYLOAD_DIR GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" "$TMPDIR/piroboot" \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
  --tanaab off
test -f "$HOME/tanaab/me/payload-local-work.txt"
test "$(git -C "$HOME/tanaab/me" rev-parse HEAD)" = "$payload_head"
test "$(git -C "$HOME/tanaab/me" rev-parse HEAD)" != "$(git -C "$HOME/tanaab/me" rev-parse origin/main)"
```

## Destroy tests

```bash
# should remove payload example artifacts
rm -f "$HOME/.ssh/id_test"
rm -f "$HOME/.config/hyperdrive" "$HOME/.config/lando"
rm -rf "$HOME/tanaab/me" "$HOME/tanaab/canon" "$TMPDIR"
```
