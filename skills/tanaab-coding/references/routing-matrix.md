# Routing Matrix

## Always-On Layer

- Activate `tanaab-coding-core` for every task in the stack.

## Primary Ownership Rules

- Pick one primary owning skill first.
- The primary owner controls the main artifact type and the main decision surface.
- Add companion skills only when the request clearly crosses into their surfaces.
- Do not add `tanaab-templates` by default; add it only when the task is explicitly about scaffolding, standardization, or extracting something clearly reusable.
- `tanaab-templates` is usually a companion, not a primary owner, unless the request is specifically about managing or creating reusable templates.

## Common Routes

- JavaScript, TypeScript, Bun, ESM, package metadata, bundling, JavaScript-backed CLI code, or JavaScript action code:
  `tanaab-javascript`
  Common companions: `tanaab-testing`, `tanaab-github-actions`, `tanaab-shell`

- Vue 3 components, VitePress 1 sites, `.vitepress/` theme work, SCSS, CSS, selectors, layout, tokens, design systems, or frontend tooling:
  `tanaab-frontend`
  Common companions: `tanaab-documentation`, `tanaab-javascript`, `tanaab-testing`

- Shell scripts, command wrappers, CLI UX, help output, logging, exit behavior, command-line safety, hosted raw shell script distribution, or generated `dist/` shell entrypoints served from a public URL:
  `tanaab-shell`
  Common companions: `tanaab-javascript`, `tanaab-testing`, `tanaab-github-actions`, `tanaab-release`

- GitHub Actions workflow YAML, reusable workflows, workflow permissions, workflow triggers, GitHub-hosted CI triage, fresh-runner example matrices, or release-shaped artifact smoke workflows:
  `tanaab-github-actions`
  Common companions: `tanaab-shell`, `tanaab-javascript`, `tanaab-testing`, `tanaab-release`

- Test implementation, coverage policy, test thresholds, test-gate recommendations, Leia-backed markdown scenarios, or CI-only destructive example suites:
  `tanaab-testing`
  Common companions: `tanaab-javascript`, `tanaab-frontend`, `tanaab-shell`, `tanaab-github-actions`, `tanaab-release`

- Changelog drafting, release notes, release readiness, or release-facing metadata:
  `tanaab-release`
  Common companions: `tanaab-testing`, `tanaab-github-actions`, `tanaab-javascript`, `tanaab-shell`

- README structure, repository docs, documentation information architecture, inline code docs, API docs, deciding when documentation should move beyond README files, or example READMEs that intentionally double as executable scenario docs:
  `tanaab-documentation`
  Common companions: `tanaab-frontend`, `tanaab-javascript`, `tanaab-release`, `tanaab-github-actions`

- Reusable scaffolds, boilerplate, or reusable fragments:
  `tanaab-templates`
  Common companions: whichever primary owner requested reuse

- Template support can accompany any primary owner when the task is explicitly about reusable structure, but it should not be treated as a default companion for ordinary implementation work.

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

- Leia scenarios vs workflow matrices vs example-doc shape:
  `tanaab-testing` owns Leia scenario content, assertions, and when executable examples are the right test surface.
  `tanaab-github-actions` owns fresh-runner example matrices, tempdir handling, and release-shaped smoke workflow wiring.
  `tanaab-documentation` owns when example READMEs intentionally double as durable scenario docs.
  `tanaab-shell` owns the hosted script contract and generated `dist/` entrypoint behavior those scenarios exercise.

- Release narrative vs release mechanics:
  `tanaab-release` owns changelog text, release notes, and release-readiness summaries.
  `tanaab-github-actions` owns release workflow mechanics.

- Durable docs policy vs release-specific narrative:
  `tanaab-documentation` owns README structure, durable docs surfaces, and docs-site escalation decisions.
  `tanaab-release` owns version-specific release notes, changelog text, and release-readiness narrative.

- Documentation information architecture vs docs-site implementation:
  `tanaab-documentation` owns documentation structure, audience fit, README-vs-docs decisions, and docs policy.
  `tanaab-frontend` owns VitePress theme, layout, styling, and frontend implementation once the docs site exists.

- Documentation expectations vs JavaScript doc tooling:
  `tanaab-documentation` owns API doc expectations, placement, and durable documentation policy.
  `tanaab-javascript` owns JSDoc or TSDoc syntax, extraction tooling, and JS or TS build integration when those surfaces are involved.

- Templates vs source-of-truth behavior:
  `tanaab-templates` stores reusable implementations and fragments.
  Behavioral ownership remains with the specialized skill that defines the policy.

- Frontend structure, static-site defaults, and styling defaults:
  `tanaab-frontend` owns the decision to prefer Vue 3 for components, VitePress 1 for static sites, and SCSS for frontend styling.
  `tanaab-javascript` owns general runtime, package, bundling, and non-frontend JavaScript decisions.
