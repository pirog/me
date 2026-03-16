# EXAMPLE NAME Example

Use this starter when a repo needs a Leia-backed scenario that doubles as both executable coverage and durable example documentation.

Keep the scenario focused on one user-visible flow. Put any supporting fixtures beside this README in the same example directory.

## Setup

```bash
# should reset the example scratch directory
rm -rf .tmp && mkdir -p .tmp/home

# should run the prepared entrypoint against the example-local target
CI=1 NONINTERACTIVE=1 \
script-under-test.sh \
  --target "$(pwd)/.tmp/home" \
  > .tmp/setup.log 2>&1
```

## Testing

```bash
# should create the example-local target directory
test -d .tmp/home

# should leave behind the expected observable output
grep -F 'expected output' .tmp/setup.log
```

## Destroy tests

```bash
# should remove the example scratch directory
rm -rf .tmp
```

## Notes

- Keep assertions shell-native and focused on observable behavior, not internals.
- Use example-local `.tmp/` paths so cleanup is deterministic.
- Keep Leia tests inside fenced code blocks, start each test with `# should ...`, and use blank lines only between tests rather than inside a single test body.
- Add fixtures in this example directory when the scenario needs Brewfiles, dotpackages, keys, or other support files.
- If the real product surface is a generated `dist/` entrypoint, make the workflow put `dist/` on `PATH` before Leia runs.
- If the scenario mutates machine state, installs packages, or uses secrets, prefer CI-only execution on fresh runners.
