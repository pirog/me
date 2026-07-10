# CLI Contract Example

This example keeps only basic Leia coverage on the shell-facing contract of `boot.sh`. It validates
the prepared wrapper's help and version output without running the full machine-seeding flow.

This scenario is intended to run in CI by default. Do not run it locally unless the task explicitly
calls for a local Leia run.

## Setup

```bash
# should prepare a temp directory for precedence checks
mkdir -p .tmp
```

## Testing

```bash
# should show the required op token flag in help output
boot.sh --help | grep -- '--op-token'

# should show the ssh key flag in help output
boot.sh --help | grep -- '--ssh-key'

# should show the tanaab flag in help output
boot.sh --help | grep -- '--tanaab'

# should show the default ssh key in help output
boot.sh --help | grep -F 'vmruk4ny353aly6tbom7z3v2hy/id_pirog,vmruk4ny353aly6tbom7z3v2hy/id_agentbox1'

# should show the default tanaab source in help output
boot.sh --help | grep -F '[default: ssh]'

# should show the PIROME_OP_TOKEN envvar in help output
boot.sh --help | grep -F 'PIROME_OP_TOKEN'

# should show the PIROME_SSH_KEY envvar in help output
boot.sh --help | grep -F 'PIROME_SSH_KEY'

# should show the PIROME_TANAAB envvar in help output
boot.sh --help | grep -F 'PIROME_TANAAB'

# should show the PIROME_FORCE envvar in help output
boot.sh --help | grep -F 'PIROME_FORCE'

# should show the PIROME_DEBUG envvar in help output
boot.sh --help | grep -F 'PIROME_DEBUG'

# should let PIROME_SSH_KEY override the displayed ssh key default
PIROME_SSH_KEY='example-vault/example-item:id_example' boot.sh --help | grep -F 'example-vault/example-item:id_example'

# should append PIROME_SSH_KEYS to the displayed ssh key default
PIROME_SSH_KEYS='example-vault/example-item:id_extra' boot.sh --help | grep -F 'vmruk4ny353aly6tbom7z3v2hy/id_pirog,vmruk4ny353aly6tbom7z3v2hy/id_agentbox1,example-vault/example-item:id_extra'

# should append PIROME_SSH_KEYS after PIROME_SSH_KEY when both are set
PIROME_SSH_KEY='example-vault/example-item:id_primary' PIROME_SSH_KEYS='example-vault/example-item:id_secondary' boot.sh --help | grep -F 'example-vault/example-item:id_primary,example-vault/example-item:id_secondary'

# should keep PIROME_SSH_KEYS hidden from help output
! boot.sh --help | grep -F 'PIROME_SSH_KEYS'

# should keep removed me source controls out of help output
! boot.sh --help | grep -F -- '--me'
! boot.sh --help | grep -F 'PIROME_ME'

# should keep the payload directory control out of help output
! boot.sh --help | grep -F 'PIROME_PAYLOAD_DIR'

# should let PIROME_TANAAB override the displayed tanaab default
PIROME_TANAAB='/tmp/example-tanaab-source' boot.sh --help | grep -F '/tmp/example-tanaab-source'

# should normalize semantic version tanaab defaults for display
boot.sh --tanaab 0.2.0 --help | grep -F 'v0.2.0'

# should let --tanaab override PIROME_TANAAB
PIROME_TANAAB='/tmp/example-tanaab-source' boot.sh --tanaab 0.2.0 --help | grep -F 'v0.2.0'

# should display falsey tanaab disable values in help output
boot.sh --tanaab false --help | grep -F 'false'

# should not mention the TANAAB_ envvar namespace in help output
! boot.sh --help | grep -F 'TANAAB_'

# should print a version string
test -n "$(boot.sh --version)"

# should reject the removed me source option
! boot.sh --me ssh > .tmp/invalid-me.log 2>&1
grep -F 'unrecognized option' .tmp/invalid-me.log

# should fail for an unknown option
! boot.sh --definitely-bogus > .tmp/invalid.log 2>&1

# should explain the unknown option failure
grep -F 'unrecognized option' .tmp/invalid.log
```

## Destroy tests

```bash
# should remove the example scratch directory
rm -rf .tmp
```
