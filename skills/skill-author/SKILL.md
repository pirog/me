---
name: piro-skill-author
description: Pirobased authoring, standardization, validation, and optimization of canon skills. Use when a user wants to scaffold a new repo-local skill, standardize or optimize an existing skill or skill collection, or validate a canon skill directory against the current contract.
license: MIT
metadata:
  type: meta
  owner: pirog
  tags:
    - pirog
    - meta
    - skills
  openclaw:
    emoji: '🛠️'
    homepage: https://github.com/pirog/me/tree/main/skills/skill-author
    requires:
      bins:
        - bun
---

# Skill Author

## Overview

Use this skill when the skill itself is the artifact being created, standardized, validated, or optimized.

- `type` is the only variable identity input for new or standardized skills.
- Choose the narrowest type that fits; keep `generic` as the fallback.
- Validation is a first-class workflow phase and a valid standalone mode.
- Treat a workflow facet as a reusable path through one owned surface; retain and tailor `Optimization` for persistent surfaces and remove it for incident-specific, event-specific, or execution-only workflows.
- Apply the shared optimization operations as evidence-led lenses rather than required output fields, and reconcile contradictions before adding another representation.
- When multiple skills share a repository, review both each skill and the portfolio so overlap, fragmented variants, duplicated doctrine, and mega-skill behavior are visible.
- Let the shared standard define the base contract and let local templates and scripts own type-specific authoring behavior.
- Keep support material local unless it clearly passes the hoist test for repo-root canon, and apply that same ownership test to skill-local tests.
- For `coding` skills, define one owned code surface plus three lifecycle sections: `Documentation`, `Testing`, and `GitHub Actions Workflow`.
- In plugin-contained skill trees, keep the `piro-` machine id in frontmatter and prompts while omitting that prefix from the skill folder name.
- Generate `metadata.openclaw` presentation fields in `SKILL.md`; add eligibility gates only for real runtime dependencies of the generated skill.
- If the reusable artifact is really a whole starter repository with committed structure, scripts, examples, and docs that users adopt wholesale, challenge whether it should be a repo template instead of a live skill.
- When a skill implies durable, always-on repo policy, it may bundle `references/repo-agents-lines.md` as short copyable guidance for a target repo's `AGENTS.md`.

## When to Use

- Create a new skill from scratch.
- Choose or refine a skill's `type`.
- Standardize an existing skill's `SKILL.md`, `metadata.openclaw`, `agents/openai.yaml`, naming, or `metadata.owner`.
- Validate a newly created, standardized, or migrated skill directory.
- Review whether skill support material should stay local or be hoisted under the shared hoist test.
- Split a broad skill into narrower skills with clearer owned surfaces.
- Review whether a proposed skill surface is better expressed as a repo template than as a live skill.
- Review whether a skill should bundle short repo `AGENTS.md` lines because its surface implies durable ambient repo policy.
- Decide whether a new or standardized skill should retain and tailor the full template's optional `Optimization` facet.
- Optimize a repository-local collection of skills individually and collectively, including keep, reconcile, deduplicate, merge, split, extract, move, tighten, rename, or remove recommendations.

## When Not to Use

- Do not use this skill for ordinary work that merely happens inside an existing skill.
- Do not use this skill for a whole-project audit outside skill surfaces; use a project optimizer and let it select Skill Author when a skill collection is present.
- Do not treat shared references or helper CLIs as optional when they already cover the requested change.
- Do not force a live skill when the real reusable artifact is a whole starter repo that users should adopt directly.

## Evaluation Criteria

- Use the smallest type that clearly fits the skill's owned surface.
- Keep structure and metadata aligned with the shared canon contract.
- Keep validation results tied to the shared contract and canonical local templates rather than personal preference.
- Keep material local by default and hoist only on proven reuse, repo-wide contract status, or standalone human value.
- For `coding` skills, allow broad discovery language only when it still funnels into one dominant implementation pattern.
- Prefer a repo template when the reusable contract is a committed starter repository with structure, scripts, examples, and docs that users adopt as a whole; keep a live skill only for cross-repo decision-making that remains after the template choice.
- Bundle repo `AGENTS.md` lines only for durable always-on repo rules, not for conditional workflow steps that belong in the skill itself.
- Keep `Optimization` only when the skill owns persistent alignment, and make its read-only inspection, comparison, recommendation, authorized application, and verification boundaries specific to that surface.
- Make `Optimization` name the surface's highest-value concrete compliance checks instead of leaving generic labels that require an aggregator to guess which parts of the full skill contract matter.
- For a skill collection, compare surfaces collectively as well as individually. Merge only when the skills own the same underlying surface and differ mainly by mode, lifecycle, or output variant; preserve separate skills when tools, permissions, audiences, failure boundaries, or primary owners materially differ.

## Anti-Patterns

- Do not treat type selection as runtime routing.
- Do not keep a separate validator skill when validation is only a lifecycle phase of skill authoring.
- Do not use `generic` as the default when a narrower type clearly fits.
- Do not duplicate contract rules in skill prose when the standard or CLI already enforces them.
- Do not hoist a file to repo root just because it might be reused later.
- Do not let a `coding` skill accumulate multiple materially different documentation, testing, or GitHub Actions validation mechanisms unless the variations are minor flavors of one pattern.
- Do not keep a live skill whose main job is to restate one repo template's structure, scripts, examples, and docs.
- Do not use repo `AGENTS.md` guidance as a dumping ground for task-triggered workflow detail.
- Do not require `Optimization` for incident-specific or event-specific skills, and do not leave a generic template section untailored.
- Do not merge adjacent skills merely because they share vocabulary, and do not keep duplicated or contradictory doctrine in multiple skills when one clear owner can serve both.

## Iteration Loop

- Start with the smallest fitting type.
- Scaffold or patch the skill, then validate immediately.
- Run validation first when the request is validation-only.
- Tighten scope before adding new sections, resources, or hoisted canon.
- For `coding` skills, challenge the scope before adding a second materially different documentation, direct-test, or GitHub Actions workflow pattern.
- Challenge skill-vs-template ownership before adding doctrine for a surface that already looks like a reusable starter repo.
- Review optimization applicability before finalizing a new or standardized skill; retain and tailor the full-template section or remove it deliberately.
- When optimizing a collection, inventory every skill before proposing portfolio changes and prefer clarification, movement, or extraction before adding another skill.

## Workflow

1. Determine whether the task is create, standardize, validate, or optimize, and whether the target is one skill or a repository-local skill collection. Choose `type` whenever the task changes or asserts skill identity, and challenge whether the surface is really a live skill or would be better owned by a repo template.

2. Load only the needed shared references.

- Read [`../../references/skill-standard.md`](../../references/skill-standard.md) for the contract.
- Read [`../../references/optimization-operations.md`](../../references/optimization-operations.md) when optimizing a persistent skill or skill collection.
- Read the matching local template in [`./templates/`](./templates/) when type shape or default metadata needs review.

3. Scaffold or patch the skill.

- Use [`./scripts/init-skill.js`](./scripts/init-skill.js) when the task is a clean scaffold.
- Review the scaffolded `Optimization` section. Retain and tailor it when the skill can audit an existing persistent surface against durable canon; otherwise remove it.
- Patch manually when the task is a partial migration or standardization pass.
- Use [`./scripts/validate-skill.js`](./scripts/validate-skill.js) when the task is validation-only or when structural changes need objective confirmation.
- Keep generated OpenClaw emoji and homepage metadata under `metadata.openclaw` in `SKILL.md`; do not put it in `agents/openai.yaml`.
- Add `metadata.openclaw.requires`, `os`, `primaryEnv`, or installer hints only when the finished skill actually depends on them. The Bun-based authoring tool is not a Bun requirement for every generated skill.
- Keep support material local by default.
- Organize skill-owned JavaScript by role at the skill root: public commands in `bin/`, internal commands in `scripts/`, orchestration in `lib/`, independently testable units in `utils/`, and tests in `test/`.
- Keep skill-owned `test/` directories flat by default, with specs, fixtures, fakes, and support JavaScript as siblings.
- Hoist only when the file is reused across live surfaces, is a repo-wide contract or tooling surface, or has standalone human value.
- Review existing hoisted files with one meaningful live consumer for demotion.

4. Validate before finishing.

- Run [`./scripts/validate-skill.js`](./scripts/validate-skill.js) against the generated or updated skill.
- Fix every `[error]` before finishing.
- Review `[warn]` and `[manual]` results explicitly instead of treating them as silent success.
- Confirm the skill still owns one narrow surface and only references canon it actually needs.

## Optimization

- **Inspect:** Inventory every in-scope skill's discovery text, owned surface, type, metadata, section shape, bundled resources, code and test placement, Optimization applicability, and live consumers.
- **Compare:** Evaluate each skill against the shared standard and selected type template, then compare the collection for contradictions, duplicated doctrine, fragmented variants, unclear ownership, and mega-skill behavior; treat generic facet boilerplate as drift.
- **Recommend:** Label evidence-backed findings with the applicable shared operation. Preserve clear owners; reconcile contradictions; deduplicate or consolidate repeated doctrine; split overloaded skills; extract or move misplaced resources; tighten scope and discovery; and rename or remove only when identity or live use warrants it.
- **Apply:** After explicit authorization, make the smallest contract-aligned individual and portfolio changes, deliberately retain and tailor or remove each Optimization facet, and update every affected skill ID, prompt, link, metadata reference, and consumer.
- **Verify:** Run the existing validator for every surviving skill, review its manual checks, search for stale identities and references, and confirm the collection has clear non-contradictory ownership.

### Portfolio Review

- Inventory every local `SKILL.md` before deciding that a collection is aligned.
- Merge skills only when they own the same underlying surface and their differences are modes, lifecycle phases, or output variants of one contract.
- Keep skills separate when they require materially different tools, permissions, audiences, failure boundaries, or primary owners.
- Prefer move, extract, deduplicate, consolidate, or tighten before adding a new skill; split only when one skill owns genuinely separable surfaces.
- Treat rename and removal as identity migrations: prove the old identity is obsolete, update all consumers, and validate the resulting portfolio rather than only the edited directory.

## Bundled Resources

- [../../references/skill-standard.md](../../references/skill-standard.md): naming, structure, metadata, and validation contract
- [../../references/optimization-operations.md](../../references/optimization-operations.md): shared evidence-led operations for persistent-surface and portfolio optimization
- [./templates/meta.md](./templates/meta.md): canonical full-template model for `meta` skills; sibling templates define the other type shapes
- [./scripts/init-skill.js](./scripts/init-skill.js): deterministic scaffolder for canonical full templates
- [./scripts/validate-skill.js](./scripts/validate-skill.js): validation entrypoint for skill directories
- [./scripts/skill-author-lib.js](./scripts/skill-author-lib.js): shared local authoring and validation helpers

## Validation

- Confirm the new or updated skill has a distinct owned surface.
- Confirm the selected `type` is explicit and correct.
- Confirm the selected type order is correct.
- Confirm `coding` skills include `Documentation`, `Testing`, and `GitHub Actions Workflow` as the canonical lifecycle sections.
- Confirm validation-only requests are handled by the same surface rather than a separate validator skill.
- Confirm the surface is not better expressed as a repo template with the skill kept only as a thin discovery or adaptation layer, if needed.
- Confirm any bundled repo `AGENTS.md` lines stay short, ambient, and worth copying into a project repo.
- Confirm `metadata.openclaw` has useful presentation metadata and no invented runtime gates.
- Confirm bundled resources stay local unless they clearly pass the hoist test.
- Confirm any repo-root resources still justify being hoisted.
- Confirm `Optimization` is present and surface-specific when persistent alignment is owned, or intentionally omitted for incident-specific, event-specific, or execution-only workflows.
- Confirm every retained `Optimization` facet names the owned surface's highest-value compliance checks and routes into the full relevant skill contract and linked canon instead of relying on generic labels.
- When a collection is in scope, confirm every skill was reviewed individually and collectively for contradictions, duplicated doctrine, fragmented variants, unclear ownership, and mega-skill behavior.
- Run `validate-skill.js` and fix all `[error]` results before finishing.
