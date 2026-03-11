# Routing Matrix

## Always-On Layer

- Activate `tanaab-coding-core` for every task in the stack.

## Primary Ownership Rules

- Pick one primary owning skill first.
- The primary owner controls the main artifact type and the main decision surface.
- Add companion skills only when the request clearly crosses into their surfaces.
- `tanaab-templates` is usually a companion, not a primary owner, unless the request is specifically about managing or creating reusable templates.

## Common Routes

- JavaScript, TypeScript, Bun, ESM, package metadata, bundling, JavaScript-backed CLI code, or JavaScript action code:
  `tanaab-javascript`
  Common companions: `tanaab-testing`, `tanaab-github-actions`, `tanaab-shell`, `tanaab-templates`

- Vue 3 components, VitePress 1 sites, `.vitepress/` theme work, SCSS, CSS, selectors, layout, tokens, design systems, or frontend tooling:
  `tanaab-frontend`
  Common companions: `tanaab-javascript`, `tanaab-testing`, `tanaab-templates`

- Shell scripts, command wrappers, CLI UX, help output, logging, exit behavior, or command-line safety:
  `tanaab-shell`
  Common companions: `tanaab-javascript`, `tanaab-testing`, `tanaab-github-actions`, `tanaab-release`, `tanaab-templates`

- GitHub Actions workflow YAML, reusable workflows, workflow permissions, workflow triggers, or GitHub-hosted CI triage:
  `tanaab-github-actions`
  Common companions: `tanaab-shell`, `tanaab-javascript`, `tanaab-testing`, `tanaab-release`, `tanaab-templates`

- Test implementation, coverage policy, test thresholds, or test-gate recommendations:
  `tanaab-testing`
  Common companions: `tanaab-javascript`, `tanaab-frontend`, `tanaab-shell`, `tanaab-github-actions`, `tanaab-release`, `tanaab-templates`

- Changelog drafting, release notes, release readiness, or release-facing metadata:
  `tanaab-release`
  Common companions: `tanaab-testing`, `tanaab-github-actions`, `tanaab-javascript`, `tanaab-shell`, `tanaab-templates`

- Reusable scaffolds, boilerplate, or reusable fragments:
  `tanaab-templates`
  Common companions: whichever primary owner requested reuse

## Collision Rules

- JavaScript CLI implementation vs CLI contract:
  `tanaab-javascript` owns JavaScript code.
  `tanaab-shell` owns CLI contract, help output, logging behavior, and wrapper behavior.

- Workflow YAML vs job-step internals:
  `tanaab-github-actions` owns workflow structure, triggers, permissions, and job topology.
  `tanaab-shell` owns shell step logic.
  `tanaab-javascript` owns JavaScript action code.

- Test content vs workflow placement:
  `tanaab-testing` owns tests, coverage policy, and test-threshold decisions.
  `tanaab-github-actions` owns workflow wiring for those gates.

- Release narrative vs release mechanics:
  `tanaab-release` owns changelog text, release notes, and release-readiness summaries.
  `tanaab-github-actions` owns release workflow mechanics.

- Templates vs source-of-truth behavior:
  `tanaab-templates` stores reusable implementations and fragments.
  Behavioral ownership remains with the specialized skill that defines the policy.

- Frontend structure, static-site defaults, and styling defaults:
  `tanaab-frontend` owns the decision to prefer Vue 3 for components, VitePress 1 for static sites, and SCSS for frontend styling.
  `tanaab-javascript` owns general runtime, package, bundling, and non-frontend JavaScript decisions.
