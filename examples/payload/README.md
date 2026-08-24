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
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test'
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
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test'
test "$(git -C "$HOME/tanaab/me" rev-parse HEAD)" = "$(git -C "$HOME/tanaab/me" rev-parse origin/main)"

# should preserve a dirty canonical checkout without updating it
git -C "$HOME/tanaab/me" reset --hard origin/main^2
printf '%s\n' 'local payload work' > "$HOME/tanaab/me/payload-local-work.txt"
payload_head="$(git -C "$HOME/tanaab/me" rev-parse HEAD)"
env -u PIROME_PAYLOAD_DIR GIT_CONFIG_GLOBAL="$TMPDIR/gitconfig" "$TMPDIR/piroboot" \
  --op-token "$OPTOKEN" \
  --ssh-key 'omfsw2uztmi2xqpid5g3kiv6ba/id_test'
test -f "$HOME/tanaab/me/payload-local-work.txt"
test "$(git -C "$HOME/tanaab/me" rev-parse HEAD)" = "$payload_head"
test "$(git -C "$HOME/tanaab/me" rev-parse HEAD)" != "$(git -C "$HOME/tanaab/me" rev-parse origin/main)"

# should seed each published GitHub SSH known host exactly once across reruns
test "$(grep -xcF 'github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl' "$HOME/.ssh/known_hosts")" = "1"
test "$(grep -xcF 'github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=' "$HOME/.ssh/known_hosts")" = "1"
test "$(grep -xcF 'github.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk=' "$HOME/.ssh/known_hosts")" = "1"
```
