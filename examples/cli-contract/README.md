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

# should show the default ssh key in help output
boot.sh --help | grep -F 'vmruk4ny353aly6tbom7z3v2hy/id_pirog,vmruk4ny353aly6tbom7z3v2hy/id_bootbox'

# should let TANAAB_SSH_KEY override the displayed ssh key default
TANAAB_SSH_KEY='example-vault/example-item:id_example' boot.sh --help | grep -F 'example-vault/example-item:id_example'

# should append TANAAB_SSH_KEYS to the displayed ssh key default
TANAAB_SSH_KEYS='example-vault/example-item:id_extra' boot.sh --help | grep -F 'vmruk4ny353aly6tbom7z3v2hy/id_pirog,vmruk4ny353aly6tbom7z3v2hy/id_bootbox,example-vault/example-item:id_extra'

# should append TANAAB_SSH_KEYS after TANAAB_SSH_KEY when both are set
TANAAB_SSH_KEY='example-vault/example-item:id_primary' TANAAB_SSH_KEYS='example-vault/example-item:id_secondary' boot.sh --help | grep -F 'example-vault/example-item:id_primary,example-vault/example-item:id_secondary'

# should keep TANAAB_SSH_KEYS hidden from help output
! boot.sh --help | grep -F 'TANAAB_SSH_KEYS'

# should print a version string
test -n "$(boot.sh --version)"

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
