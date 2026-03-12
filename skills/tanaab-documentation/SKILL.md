---
name: tanaab-documentation
description: Guide README structure, inline code and API documentation, and the escalation path from repository README files to fuller documentation under the shared Tanaab coding structure.
---

# Tanaab Documentation

## Overview

Use this skill for repository documentation strategy and authoring within the Tanaab coding hierarchy. Own README structure, durable documentation surfaces, inline code and API documentation policy, and the decision to move from README-only documentation into fuller docs such as a VitePress site.

## When to Use

- The request targets `README.md` structure, repository onboarding docs, usage docs, configuration docs, or durable reference material.
- The task defines standards for inline code comments, API docs, or documentation completeness.
- The request needs a decision about whether information belongs in a README, inline docs, generated API docs, or a fuller documentation site.
- The task migrates documentation from a README into a docs site or restructures existing docs for clearer navigation.
- The user wants repo-wide documentation standards, section ordering, example style, or docs-surface rules.

## When Not to Use

- Do not use this skill for release notes, changelog-only work, or version-specific release readiness.
- Do not use this skill alone for VitePress theme, layout, styling, or frontend implementation details once the docs-site decision has already been made.
- Do not use this skill for raw implementation work that does not change documentation surfaces or documentation policy.
- Do not use this skill for GitHub Actions workflow mechanics, docs deployment wiring, or CI behavior unless documentation policy is also in scope.

## Relationship to Other Skills

- Assume `tanaab-coding-core` is active.
- Primary ownership: README structure, repository documentation standards, documentation information architecture, inline code and API documentation policy, and README-to-docs-site escalation decisions.
- Defer VitePress theme, layout, and styling implementation to `tanaab-frontend`.
- Defer JavaScript or TypeScript doc-generation tooling, runtime integration, and API extraction plumbing to `tanaab-javascript`.
- Defer release-note, changelog, and version-specific release narrative to `tanaab-release`.
- Defer workflow wiring and docs-site deployment mechanics to `tanaab-github-actions`.
- Pair with `tanaab-frontend` when documentation moves into VitePress or needs docs-site page implementation.
- Pair with `tanaab-javascript` when API docs or inline documentation touch JS or TS tooling, generation, or examples.
- Pair with `tanaab-release` when release work must update durable docs or when documentation readiness is part of release readiness.
- Pair with `tanaab-github-actions` when documentation changes require docs deployment or workflow updates.
- Use `tanaab-templates` when reusable README, docs-page, or documentation fragment templates are needed.

## Workflow

1. Confirm `tanaab-coding-core` is active.
2. Scope the documentation surface: README, inline docs, API docs, generated docs, durable docs pages, user audience, and whether the task is about standards, authoring, or migration.
3. Choose the smallest documentation surface that fully serves the need.
- Prefer a README for repository-level orientation, install or setup instructions, common usage, and concise reference.
- Prefer inline code or API docs for contracts, error behavior, non-obvious side effects, and behavior that must stay close to code.
- Escalate to fuller docs when the README becomes overloaded, multiple user journeys or navigation layers are needed, or durable reference material grows beyond one repo entrypoint.
4. Decide when a fuller docs site is warranted.
- Move beyond README-only documentation when the repository needs multiple durable pages, repeated cross-linking, long reference sections, or separate guides and reference surfaces.
- Do not split content into a docs site for polish alone when a focused README still serves the task cleanly.
- When a static docs site is justified, prefer VitePress 1 and hand implementation details to `tanaab-frontend`.
5. Shape repository docs for fast comprehension.
- Lead README content with what the project is, how to install or run it, and the most important usage path before deeper reference sections.
- Keep examples concrete, runnable, and close to the surface they explain.
- Prefer clear section titles and concise prose over dense narrative blocks.
6. Apply inline code and API documentation standards intentionally.
- Document public contracts, non-obvious invariants, side effects, error cases, and important integration expectations.
- Do not add comments that merely restate obvious code or repeat names without adding meaning.
- Keep API docs clear about inputs, outputs, side effects, and failure behavior.
7. Pull from `tanaab-frontend`, `tanaab-javascript`, `tanaab-release`, `tanaab-github-actions`, or `tanaab-templates` when the documentation task crosses those boundaries.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the documentation skill.
- [assets/tanaab-documentation-icon.svg](./assets/tanaab-documentation-icon.svg): generated fallback icon for the documentation skill.

## Validation

- Confirm `tanaab-coding-core` is active.
- Confirm the task is actually documentation-led.
- Confirm this skill stayed the primary owner only for README, docs-policy, or durable documentation surfaces.
- Confirm README content remains concise and repo-oriented rather than growing into an unstructured manual.
- Confirm inline code or API docs explain contracts and non-obvious behavior rather than narrating obvious implementation.
- Confirm any move from README to fuller docs is justified by documentation complexity rather than aesthetics alone.
- Confirm VitePress implementation details are handed to `tanaab-frontend` when they become a frontend task.
- Confirm release-only narrative is handed to `tanaab-release`.
- Confirm any template use came from `tanaab-templates`.
