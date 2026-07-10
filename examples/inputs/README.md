# Inputs Example

This example keeps lightweight, non-mutating coverage on the public `boot.sh` input surface. It
validates help text, displayed defaults, input validation, and option/environment precedence without
running the machine-seeding path. Mutating coverage lives in the defaults, payload, and version
examples.

## Setup

```bash
# should have prepared boot.sh on PATH
command -v boot.sh >/dev/null

# should prepare the example scratch directory
mkdir -p "$TMPDIR"
```

## Testing

```bash
# should show boot.sh usage
boot.sh --help | grep -F "Usage:"
boot.sh --help | grep -F "[NONINTERACTIVE=1]"
boot.sh --help | grep -F "[CI=1]"
boot.sh --help | grep -F "boot.sh [options]"

# should document public options
boot.sh --help | grep -F -- "--ssh-key"
boot.sh --help | grep -F -- "--op-token"
boot.sh --help | grep -F -- "--tanaab"
boot.sh --help | grep -F -- "--version"
boot.sh --help | grep -F -- "--debug"
boot.sh --help | grep -F -- "--force"
boot.sh --help | grep -F -- "--help"
boot.sh --help | grep -F -- "--yes"

# should document public environment variables
boot.sh --help | grep -F "PIROME_SSH_KEY      comma-separated list of 1password ssh keys"
boot.sh --help | grep -F "PIROME_OP_TOKEN     1password service account token"
boot.sh --help | grep -F "PIROME_TANAAB       source for ~/tanaab/canon"
boot.sh --help | grep -F "PIROME_FORCE        set to a truthy value"
boot.sh --help | grep -F "PIROME_DEBUG        set to a truthy value"
boot.sh --help | grep -F "NONINTERACTIVE      installs without prompting for user input"
boot.sh --help | grep -F "CI                  installs in CI mode"

# should keep hidden and removed inputs out of help
if boot.sh --help | grep -F -- "--ssh-keys"; then exit 1; fi
if boot.sh --help | grep -F "PIROME_SSH_KEYS"; then exit 1; fi
if boot.sh --help | grep -F -- "--me"; then exit 1; fi
if boot.sh --help | grep -F "PIROME_ME"; then exit 1; fi
if boot.sh --help | grep -F "PIROME_PAYLOAD_DIR"; then exit 1; fi
if boot.sh --help | grep -F "TANAAB_"; then exit 1; fi

# should show default input values
boot.sh --help | grep -F -- "--ssh-key" | grep -F "[default: vmruk4ny353aly6tbom7z3v2hy/id_pirog,vmruk4ny353aly6tbom7z3v2hy/id_agentbox1]"
boot.sh --help | grep -F -- "--op-token" | grep -F "[default: none]"
boot.sh --help | grep -F -- "--tanaab" | grep -F "[default: ssh]"
boot.sh --help | grep -F -- "--debug" | grep -F "[default: off]"
boot.sh --help | grep -F -- "--force" | grep -F "[default: off]"

# should show op token input precedence without leaking tokens
OP_SERVICE_ACCOUNT_TOKEN="service-token-example" boot.sh --help | grep -F -- "--op-token" | grep -F "[default: serv...mple]"
PIROME_OP_TOKEN="pirome-token-example" OP_SERVICE_ACCOUNT_TOKEN="service-token-example" boot.sh --help | grep -F -- "--op-token" | grep -F "[default: piro...mple]"
PIROME_OP_TOKEN="pirome-token-example" boot.sh --op-token "cli-token-example" --help | grep -F -- "--op-token" | grep -F "[default: cli-...mple]"
if PIROME_OP_TOKEN="pirome-token-example" boot.sh --op-token "cli-token-example" --help | grep -F "cli-token-example"; then exit 1; fi

# should show ssh key input precedence
PIROME_SSH_KEY="env-vault/env-item:id_env" boot.sh --help | grep -F -- "--ssh-key" | grep -F "[default: env-vault/env-item:id_env]"
PIROME_SSH_KEY="env-vault/env-item:id_env" PIROME_SSH_KEYS="extra-vault/extra-item:id_extra" boot.sh --help | grep -F -- "--ssh-key" | grep -F "[default: env-vault/env-item:id_env,extra-vault/extra-item:id_extra]"
PIROME_SSH_KEY="env-vault/env-item:id_env" boot.sh --ssh-key "cli-vault/cli-item:id_cli" --help | grep -F -- "--ssh-key" | grep -F "[default: cli-vault/cli-item:id_cli]"
if PIROME_SSH_KEY="env-vault/env-item:id_env" boot.sh --ssh-key "cli-vault/cli-item:id_cli" --help | grep -F "env-vault/env-item:id_env"; then exit 1; fi
boot.sh --ssh-key "cli-vault/first-item:id_first" --ssh-key "cli-vault/second-item:id_second" --help | grep -F -- "--ssh-key" | grep -F "[default: cli-vault/first-item:id_first,cli-vault/second-item:id_second]"
boot.sh --ssh-keys "cli-vault/first-item:id_first,cli-vault/second-item:id_second" --help | grep -F -- "--ssh-key" | grep -F "[default: cli-vault/first-item:id_first,cli-vault/second-item:id_second]"

# should show tanaab input precedence and normalization
PIROME_TANAAB="/tmp/env-tanaab" boot.sh --help | grep -F -- "--tanaab" | grep -F "[default: /tmp/env-tanaab]"
PIROME_TANAAB="/tmp/env-tanaab" boot.sh --tanaab 0.2.0 --help | grep -F -- "--tanaab" | grep -F "[default: v0.2.0]"
if PIROME_TANAAB="/tmp/env-tanaab" boot.sh --tanaab 0.2.0 --help | grep -F "/tmp/env-tanaab"; then exit 1; fi
boot.sh --tanaab false --help | grep -F -- "--tanaab" | grep -F "[default: false]"

# should show force and debug input precedence
PIROME_FORCE=1 boot.sh --help | grep -F -- "--force" | grep -F "[default: on]"
PIROME_DEBUG=1 boot.sh --help | grep -F -- "--debug" | grep -F "[default: on]"
PIROME_FORCE=off boot.sh --force --help | grep -F -- "--force" | grep -F "[default: on]"
PIROME_DEBUG=off boot.sh --debug --help | grep -F -- "--debug" | grep -F "[default: on]"
RUNNER_DEBUG=0 DEBUG=1 boot.sh --help | grep -F -- "--debug" | grep -F "[default: on]"

# should print a version string
test -n "$(boot.sh --version)"

# should fail when ssh key values are missing
set +e
output="$(boot.sh --ssh-key 2>&1)"
command_status="$?"
set -e
printf "%s\n" "$output"
printf "%s\n" "$output" | grep -F "option --ssh-key requires a value."
printf "%s\n" "$output" | grep -F "Usage:"
test "$command_status" -ne 0

# should fail when ssh key values are empty
set +e
output="$(boot.sh --ssh-key= 2>&1)"
command_status="$?"
set -e
printf "%s\n" "$output"
printf "%s\n" "$output" | grep -F "option --ssh-key must not be empty."
printf "%s\n" "$output" | grep -F "Usage:"
test "$command_status" -ne 0

# should fail when op token values are missing
set +e
output="$(boot.sh --op-token 2>&1)"
command_status="$?"
set -e
printf "%s\n" "$output"
printf "%s\n" "$output" | grep -F "option --op-token requires a value."
printf "%s\n" "$output" | grep -F "Usage:"
test "$command_status" -ne 0

# should fail when op token values are empty
set +e
output="$(boot.sh --op-token= 2>&1)"
command_status="$?"
set -e
printf "%s\n" "$output"
printf "%s\n" "$output" | grep -F "option --op-token must not be empty."
printf "%s\n" "$output" | grep -F "Usage:"
test "$command_status" -ne 0

# should fail when tanaab values are missing
set +e
output="$(boot.sh --tanaab 2>&1)"
command_status="$?"
set -e
printf "%s\n" "$output"
printf "%s\n" "$output" | grep -F "option --tanaab requires a value."
printf "%s\n" "$output" | grep -F "Usage:"
test "$command_status" -ne 0

# should fail when tanaab values are empty
set +e
output="$(boot.sh --tanaab= 2>&1)"
command_status="$?"
set -e
printf "%s\n" "$output"
printf "%s\n" "$output" | grep -F "option --tanaab must not be empty."
printf "%s\n" "$output" | grep -F "Usage:"
test "$command_status" -ne 0

# should reject the removed me source option
set +e
output="$(boot.sh --me ssh 2>&1)"
command_status="$?"
set -e
printf "%s\n" "$output"
printf "%s\n" "$output" | grep -F "unrecognized option --me"
printf "%s\n" "$output" | grep -F "Usage:"
test "$command_status" -ne 0

# should fail on unknown options with usage context
set +e
output="$(boot.sh --not-real 2>&1)"
command_status="$?"
set -e
printf "%s\n" "$output"
printf "%s\n" "$output" | grep -F "unrecognized option"
printf "%s\n" "$output" | grep -F "Usage:"
printf "%s\n" "$output" | grep -F "boot.sh [options]"
test "$command_status" -ne 0
```

## Destroy tests

```bash
# should remove the example scratch directory
rm -rf "$TMPDIR"
```
