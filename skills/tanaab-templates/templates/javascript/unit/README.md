# JavaScript Unit Templates

- `transform-unit.js` is the default starter for pure or mostly pure transformations.
- `async-boundary-unit.js` is the starter for units that read from a boundary such as the filesystem and then hand parsed data to smaller helpers.
- Both templates prefer boundary normalization, early returns, straight-line derived constants, and minimal mutation.
- When imports are needed, group them in present built-in, external, and local blocks with a single blank line between blocks and sort each block by imported binding name.
