# CLI Contract Example

This example keeps only basic Leia coverage on the shell-facing contract of `piroboot.sh` while the
wrapper rewrite is still pending. It validates the prepared entrypoint's help output, version
output, and unknown-option failure shape without running the full machine-seeding flow.

## Setup

```bash
# should reset the example scratch directory
rm -rf .tmp && mkdir -p .tmp
```

## Testing

```bash
# should show the brewfile flag in help output
piroboot.sh --help | grep -- '--brewfile'

# should show the dotpkg env var in help output
piroboot.sh --help | grep -- 'TANAAB_DOTPKG'

# should print a version string
test -n "$(piroboot.sh --version)"

# should fail for an unknown option
! piroboot.sh --definitely-bogus > .tmp/invalid.log 2>&1

# should explain the unknown option failure
grep -F 'Unrecognized option' .tmp/invalid.log
```

## Destroy tests

```bash
# should remove the example scratch directory
rm -rf .tmp
```
