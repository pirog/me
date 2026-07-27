---
template_type: workflow
default_category_tag: operations
default_openclaw_emoji: '🔁'
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

- Use for repeatable operational processes that may span tools but are not primarily coding or integration implementation.
- Keep the owned surface focused on one concrete workflow or handoff path.
- Prefer this type when sequence, checkpoints, and completion criteria matter more than implementation details.

## When Not to Use

- Do not use this type for skills whose main value is code change strategy or external-system interface handling.
- Do not let a workflow skill become a vague doctrine essay.

## Preconditions

- Confirm starting state, prerequisites, and blockers before beginning.
- State required approvals or missing context early.

## Workflow

1. Confirm the request matches this skill's operational surface.
2. Load only the canon, inputs, and checkpoints required for the workflow.
3. Execute the sequence in order and pause at explicit decision points.
4. Close only when completion criteria are met and surfaced clearly.

## Checkpoints

- Make review points, handoffs, or approvals explicit.
- Pause rather than guessing when a checkpoint depends on outside confirmation.

## Completion Criteria

- Define what finished looks like before closing the task.
- List the signals or artifacts that prove the workflow is complete.

## Optimization

Use the shared operation lenses—**keep**, **reconcile**, **deduplicate**, **consolidate/merge**, **split**, **extract**, **move**, **tighten**, and **remove**—only where they fit this workflow; do not manufacture changes to satisfy the list.

- **Inspect:** Inventory the current preconditions, sequence, checkpoints, handoffs, and completion evidence for this operational surface.
- **Compare:** Evaluate the observed workflow against its durable contract, including contradictory steps, duplicated paths, overloaded stages, misplaced responsibilities, and obsolete handoffs; classify unsupported paths as not applicable.
- **Recommend:** Preserve aligned stages; reconcile conflicting paths; and prioritize justified deduplication, consolidation, splitting, extraction, movement, tightening, or removal.
- **Apply:** After explicit authorization, change the smallest coherent part of the sequence while preserving required approvals and external boundaries.
- **Verify:** Re-run the relevant checkpoints and confirm the documented completion criteria prove the optimized workflow is complete.

## Bundled Resources

- List only the workflow-specific canon, scripts, templates, or assets this skill actually needs.
- Keep local resources local unless they clearly pass the hoist test.

## Validation

- Confirm preconditions, checkpoints, and completion criteria are all explicit.
- Validate that the sequence stayed narrow and did not absorb unrelated workflow surfaces.
