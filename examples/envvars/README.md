# Envvars Example

This example keeps coverage on the shell-facing environment variable contract of `boot.sh`. It runs
the wrapper with environment variables, delegates into bootbox, and then verifies that the
requested SSH keys were installed into the default target directory. It also covers the
wrapper-specific behavior of allowing force mode to overwrite an existing destination key.

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

# should have the local me source repo available
test -d "$GITHUB_WORKSPACE/.git"

# should have the op token test secret available
test -n "$OPTOKEN"

# should run boot.sh successfully using envvars and force-overwrite a conflicting key
printf '%s\n' 'not-a-private-key' > "$HOME/.ssh/id_test_envvars"
chmod 600 "$HOME/.ssh/id_test_envvars"
PIROME_OP_TOKEN="$OPTOKEN" \
PIROME_FORCE=1 \
PIROME_SSH_KEY='omfsw2uztmi2xqpid5g3kiv6ba/id_test' \
PIROME_SSH_KEYS='omfsw2uztmi2xqpid5g3kiv6ba/id_test:id_test_envvars' \
PIROME_ME="$GITHUB_WORKSPACE" \
boot.sh
```

## Testing

```bash
# should ensure homebrew is installed
command -v brew >/dev/null

# should install core homebrew packages
command -v git >/dev/null && command -v jq >/dev/null && command -v stow >/dev/null && command -v op >/dev/null

# should create the ssh directory
test -d "$HOME/.ssh"

# should protect the ssh directory permissions
test "$(stat -f '%Lp' "$HOME/.ssh")" = "700"

# should install the default ssh key filename from envvars
test -f "$HOME/.ssh/id_test"

# should protect the default ssh key permissions
test "$(stat -f '%Lp' "$HOME/.ssh/id_test")" = "600"

# should install the overridden ssh key filename from envvars
test -f "$HOME/.ssh/id_test_envvars"

# should protect the overridden ssh key permissions
test "$(stat -f '%Lp' "$HOME/.ssh/id_test_envvars")" = "600"

# should install the default ssh key material that matches the expected public key
test "$(ssh-keygen -y -f "$HOME/.ssh/id_test" | awk '{print $1 \" \" $2}')" = "$(awk '{print $1 \" \" $2}' id_test.pub)"

# should install the overridden ssh key material that matches the expected public key
test "$(ssh-keygen -y -f "$HOME/.ssh/id_test_envvars" | awk '{print $1 \" \" $2}')" = "$(awk '{print $1 \" \" $2}' id_test.pub)"

# should clone me from the local workspace path
test -d "$HOME/tanaab/me/.git"

# should preserve the me wrapper entrypoint in the cloned repo
test -f "$HOME/tanaab/me/boot.sh"

# should point the me clone origin at the local workspace source
test "$(git -C "$HOME/tanaab/me" config --get remote.origin.url)" = "$GITHUB_WORKSPACE"
```

## Destroy tests

```bash
# should remove the installed example ssh keys
rm -f "$HOME/.ssh/id_test" "$HOME/.ssh/id_test_envvars"

# should remove the cloned me checkout
rm -rf "$HOME/tanaab/me"
```
