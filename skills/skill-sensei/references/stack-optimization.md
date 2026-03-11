# Stack Optimization

Use this rubric when auditing or optimizing a skill stack such as `tanaab-coding`.

## Goals

- Keep the stack lean, concise, and easy to route.
- Remove duplicated doctrine, duplicated workflow steps, and duplicated validation language.
- Reduce ownership overlap and routing ambiguity.
- Prefer `merge`, `move`, `extract`, or `delete` before introducing a new skill.

## Classification Pass

For each skill, identify:

- primary owned surface
- doctrine that belongs in shared core
- routing logic that belongs in the stack router
- reusable fragments that belong in templates
- implementation guidance that truly belongs in that skill

## Admission Rules

- Do not add a new skill unless it owns a clearly distinct surface.
- Do not add a new skill if the content could just be a section in an existing skill.
- Do not add a new skill if the content is really doctrine for shared core.
- Do not add a new skill if the content is really routing logic for the stack router.
- Do not add a new skill if the content is really reusable boilerplate for templates.

## Exit Rules

- Merge a skill when most of its guidance is duplicated elsewhere.
- Merge a skill when its owned surface is too thin to justify a separate router target.
- Move content to shared core when it is doctrine rather than specialized behavior.
- Move content to the router when it is mostly about ownership boundaries or skill selection.
- Extract content to templates when it is reusable scaffolding rather than policy.
- Delete a skill when it no longer has a distinct primary owned surface after consolidation.

## Audit Output

Every stack audit should produce:

- current inventory
- overlap findings
- routing ambiguity findings
- `keep`, `merge into`, `move to core`, `move to router`, `extract to templates`, or `delete` for each skill
- an ordered implementation plan

## Validation

- Every retained skill should have a distinct primary owned surface.
- The router should be simpler after optimization, not more complex.
- Shared doctrine should move upward instead of being restated in multiple skills.
- Empty or placeholder skills should be challenged rather than preserved automatically.
