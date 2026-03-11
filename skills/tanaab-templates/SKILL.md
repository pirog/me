---
name: tanaab-templates
description: Manage reusable template files for Tanaab coding skills.
---

# Tanaab Templates

## Overview

Use this skill to manage reusable template files for the Tanaab coding hierarchy.

## When to Use

- A coding skill needs a reusable file, scaffold, snippet, or boilerplate pattern.
- The request should be satisfied by selecting or adapting a template rather than inventing structure from scratch.

## When Not to Use

- Do not use this skill for one-off implementation work that does not benefit from reuse.
- Do not create template content until the task explicitly calls for it.

## Relationship to Other Skills

- Support `tanaab-coding`, `tanaab-typescript`, `tanaab-css`, `tanaab-vue`, `tanaab-shell`, and `tanaab-github-actions`.
- Assume `tanaab-coding-core` is active when templates are applied to coding work.

## Workflow

1. Confirm which coding skill requested template support.
2. Inspect `templates/` for a reusable starting point that matches the request.
3. Select and adapt the relevant template when one exists.
4. If no suitable template exists, call out the gap rather than inventing a new template set implicitly.

## Bundled Resources

- [agents/openai.yaml](./agents/openai.yaml): UI metadata for the templates skill.
- [assets/tanaab-templates-icon.png](./assets/tanaab-templates-icon.png): UI icon for the templates skill.
- [templates/](./templates/): reserved location for reusable coding templates.

## Templates Directory

- `templates/` stores reusable code patterns and boilerplate for the Tanaab coding skills.
- No templates are scaffolded yet.

## Validation

- Confirm the request actually benefits from reuse.
- Confirm any selected template matches the calling skill and task.
- Confirm missing templates are reported as gaps rather than invented on the fly.
