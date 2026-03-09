---
name: esmify
description: Migrate CommonJS JavaScript repositories to ESM with minimal behavior changes. Use when a user asks to convert require/module.exports code to import/export, update package/build metadata for ESM outputs, and standardize import ordering/style conventions.
---

# ESMify

## Overview

Use this skill to convert a codebase from CommonJS to ESM in a controlled way while preserving runtime behavior, CI compatibility, and bundle outputs.

## 1. Convert to ESM

1. Update package/build metadata for ESM outputs.

- Add `"type": "module"` in `package.json`.
- Add or update `main` and `exports` to point at the ESM entry output (for example `./dist/index.js`).
- Update bundling commands to emit ESM (for example `bun build ... --format=esm`).
- Keep artifact paths stable when workflows/actions depend on exact filenames (for example `dist/index.js`).

1. Rewrite module syntax.

- Replace `require(...)` with `import ... from ...`.
- Replace `module.exports = ...` with `export default ...`.
- Replace `exports.foo = ...` with named exports.
- Add explicit `.js` extension for local relative ESM imports.

1. Apply import grouping and ordering style in every file.

- Group 1: core runtime modules (`bun` or `node` built-ins).
- Group 2: third-party dependencies from `node_modules`.
- Group 3: local project imports.
- Separate each present group by exactly one blank line.
- In Group 1, prefix Node built-ins with `node:` (for example `node:fs`, `node:path`, `node:child_process`).
- Sort each group alphabetically by import name (default import name or imported binding).

1. Use this import style example.

```js
import fs from 'node:fs';
import path from 'node:path';

import core from '@actions/core';
import semverValid from 'semver/functions/valid.js';

import getInputs from './utils/get-inputs.js';
import parseTokens from './utils/parse-tokens.js';
```

1. Validate behavior after refactor.

- Run lint and fix style/regression issues.
- Rebuild distribution artifacts.
- Verify generated `dist` output is ESM-compatible and still executable in the target runtime.
- Re-run workflow/test commands used by CI.
