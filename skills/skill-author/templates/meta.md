---
template_type: meta
default_category_tag: skills
default_openclaw_emoji: '🛠️'
optional_top_level_headings:
  - '## Optimization'
---
---
name: {{skill_id}}
description: {{description}}
license: {{license}}
metadata:
  type: {{type}}
  owner: {{owner}}
  tags:
{{metadata_tags_yaml}}
{{openclaw_metadata_yaml}}
---

# {{display_name}}

## Overview

{{description}}

## When to Use

- Use for skills that create, refine, validate, package, or audit other skills, prompts, templates, or conventions.
- Keep the owned surface focused on one canon-facing artifact family.
- Prefer this type when consistency, structure, or contract enforcement matters more than implementation detail.

## When Not to Use

- Do not use this type for ordinary product work that merely references canon.
- Do not widen a meta skill into a router or a broad keep/merge/delete planner without a specific owned surface.

## Evaluation Criteria

- Check structure, naming, and consistency against shared canon.
- Prefer small, composable outputs over broad surfaces.

## Anti-Patterns

- Avoid router behavior, overlapping ownership, or duplicated doctrine.
- Treat repeated ambiguity as a signal to split or simplify.

## Iteration Loop

- Start with the smallest coherent change.
- Re-evaluate after validation before widening scope.

## Workflow

1. Confirm the request matches this skill's canon-facing surface.
2. Load only the shared standard and local resources required for the task.
3. Create, standardize, or validate using the narrowest reliable approach.
4. Re-run validation before finishing and surface any manual review points.

## Optimization

Use the shared operation lenses—**keep**, **reconcile**, **deduplicate**, **consolidate/merge**, **split**, **extract**, **move**, **tighten**, and **remove**—only where they fit this artifact family; do not manufacture changes to satisfy the list.

- **Inspect:** Inventory the existing artifact family, discovery metadata, structure, bundled resources, and validation evidence owned by this skill.
- **Compare:** Evaluate each artifact and the collection against the shared contract and canonical template, including contradictions, duplicated doctrine, fragmented variants, overloaded owners, misplaced resources, and obsolete identities.
- **Recommend:** Preserve clear owners; reconcile conflicting contracts; and prioritize justified merging, splitting, extraction, movement, tightening, or removal without turning the skill into a router.
- **Apply:** After explicit authorization, make the smallest contract-aligned change and keep reusable support at its nearest justified owner.
- **Verify:** Run the existing validator, review manual checks, and confirm the optimized artifact still owns one clear surface.

## Bundled Resources

- List only the canon-facing files, scripts, templates, or assets this skill actually needs.
- Keep local resources local unless they clearly pass the hoist test.

## Validation

- Confirm the artifact still owns one narrow canon-facing surface.
- Validate that structure, naming, and local-vs-hoisted placement match the shared contract.
