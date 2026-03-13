# JavaScript Lint and Format Starter

Use this starter when you want one Bun-first lint and format baseline that can be reused across JavaScript, Bun, TypeScript, and Vue repositories.
It assumes the repo uses ESM by default, so the config files use `.js` and expect `"type": "module"` in `package.json`.

## Files

- `eslint.config.js`: shared Bun/ESM ESLint baseline for `.js`, `.mjs`, `.cjs`, and Mocha-style tests
- `prettier.config.js`: canonical standalone Prettier config used by editor, CI, and CLI formatting
- `.prettierignore`: canonical generated-file ignore list for `prettier . --check` or `--write`
- `snippets/typescript-eslint-layer.js`: optional TypeScript ESLint layer
- `snippets/vue-eslint-layer.js`: optional Vue ESLint layer

Copy these files together when standardizing a repo. If a repo already has lint or format config, align it to these files rather than inventing a separate local formatting baseline.

## Baseline Rules

- Use flat ESLint config at the repo root.
- Keep ESLint and Prettier ownership separate: ESLint handles code-quality and static-analysis rules, while Prettier handles formatting.
- Run Prettier with `prettier --check` or `prettier --write` instead of routing formatting through ESLint.
- Use one shared JS/Bun base, then add narrow overrides for CJS, tests, templates, TS, or Vue only when the repo actually needs them.
- Prefer `eslint-config-prettier` over `eslint-plugin-prettier` for shared repo defaults.
- Prefer `.js` config filenames in ESM repos; only fall back to `.mjs` when the repo cannot mark itself as ESM.
- Keep `node:` protocol usage and ESM defaults consistent across Bun repos.
- Treat `prettier.config.js` in this template as the formatting authority for shared repo defaults, including quote style. Do not start from generic Prettier defaults or invent a repo-local quote convention when standardizing.
- The shared ESLint 10 base intentionally avoids `eslint-plugin-import` until that package declares ESLint 10 support.

## Expected Scripts

```json
{
  "scripts": {
    "lint:eslint": "eslint .",
    "format:check": "prettier . --check --ignore-unknown",
    "format:write": "prettier . --write --ignore-unknown",
    "lint": "bun run lint:eslint && bun run format:check"
  }
}
```

Use this shape by default when standardizing a repo. If an existing repo already exposes equivalent scripts, keep the names aligned unless there is a strong repo-specific reason not to.

## Optional Layers

### TypeScript

- Add `snippets/typescript-eslint-layer.js` when the repo actually lints `.ts` or `.tsx`.
- Prefer the `typescript-eslint` meta package instead of separately managing parser and plugin packages.
- Start with `recommended` rules and add type-aware rules only after the repo proves the value of typed linting.
- Keep the TypeScript compiler version repo-owned; it should follow the repo build, not the lint template.

### Vue

- Add `snippets/vue-eslint-layer.js` when the repo lints `.vue` files.
- If the repo uses `<script lang="ts">`, merge the TypeScript layer first and point the Vue parser options at the TypeScript parser for those blocks.
- Keep docs-site or VitePress repos on the same ESLint base and only append the Vue layer where `.vue` files are present.

## Dependency Profiles

### Cross-project baseline

Use these shared baseline versions when you want one config that can still extend cleanly into the current Vue stack:

- `eslint@^10.0.3`
- `@eslint/js@^10.0.1`
- `eslint-config-prettier@^10.1.1`
- `globals@^17.4.0`
- `prettier@^3.5.3`

### Vue layer

These versions are validated by the current Vue-capable stack in `core-next`:

- `eslint-plugin-vue@^10.6.2`
- `vue-eslint-parser@^10.2.0`

### TypeScript layer

Use these packages when the repo actually lints TypeScript:

- `typescript-eslint`
- `typescript`

The stack does not yet have a single canonical `typescript-eslint` version pin because neither anchor repo currently ships that layer. Pin it deliberately in the consuming repo once a real TS project validates the combination.

## Version Tracking

- Track shared lint-stack versions in the consuming repo's `devDependencies`.
- Treat this README as the canonical dependency matrix for the starter.
- Only copy the profiles the repo actually enables.
- Update the template README and the consuming repo together when you deliberately advance the shared baseline.
- The current shared baseline targets ESLint 10. The shared config intentionally excludes `eslint-plugin-import` for now because that package does not yet declare ESLint 10 support in its package metadata.
