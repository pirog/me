---
name: piro-skill-author
description: Pirobased skill authoring, validation, and optimization using Canon's shared tooling with the piro namespace and presentation. Use when creating or maintaining skills for this profile.
license: MIT
metadata:
  type: meta
  owner: tanaab
  tags:
    - tanaab
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

apply piro's public identity to Canon's skill-authoring workflow. Canon owns the standard,
templates, scaffolder, and validator; this skill owns only the profile's customization.

## Required Reading

read and apply each applicable document before dependent work; reuse complete reads already in context.

- **Always:** locate `tanaab:tanaab-skill-author` in the available skill catalog, read its full
  `SKILL.md`, and follow its applicable Required Reading. resolve its references and scripts from
  that discovered installation. the [upstream source](https://github.com/tanaabased/canon/tree/main/skills/skill-author)
  identifies the dependency; a link or remembered path does not replace the installed instructions.
- **Before writing human-facing prose:** read and apply [piro-voice](../voice/SKILL.md).

if Canon is unavailable or lacks custom namespace/container support, report that setup blocker before
changing skills. do not recreate a local validator or silently fall back to a different contract.

## When to Use

create, standardize, validate, or optimize piro skills and their repository-local collection.

## When Not to Use

ordinary product work, task execution, or authoring for a project that selects a different identity.
use that project's own authoring policy instead.

## Evaluation Criteria

preserve piro's public names and presentation while applying Canon's current structural contract.
keep `metadata.owner: tanaab` and its tag as Canon provenance; they do not change the acting identity.

## Anti-Patterns

- no copied Canon templates, standards, scaffolding code, or validators.
- no hardcoded cache version, home directory, or sibling-checkout dependency.
- no renamed public skills or replacement branding merely to satisfy Canon defaults.

## Iteration Loop

follow Canon's authoring and validation loop with the customization below. validation-only requests
remain read-only; a successful structural check does not prove instruction-following behavior.

## Workflow

1. load the installed Canon Skill Author and its applicable policies. use its create, standardize,
   validate, or optimize workflow without repeating that workflow here.
2. for this plugin, pass `--namespace piro --container codex-plugin` to Canon's scaffolder and
   validator. retain unprefixed skill folders, `piro-` machine names and prompts, and `Pirobased`
   descriptions. for scaffolding, also pass `--brand-color '#db2777'` and an explicit pirog source
   homepage; choose the skill-specific display name, category, emoji, and prompt for the actual task.
3. preserve existing icons and interface metadata during migration. for a new skill in this plugin,
   replace Canon's generated `assets/` directory with a relative symlink to `../../assets`,
   following adjacent skills, and use `./assets/composer-icon.svg` and `./assets/icon-large.png`
   in `agents/openai.yaml`. do not leave Canon artwork
   under piro branding. npm preparation owns materializing these symlinks for publication.
4. run Canon's validator from the discovered installation with the explicit namespace and container.
   review warnings and manual checks, then complete the target repository's validation. keep draft
   changes uncommitted or unpublished whenever the operator requests review first.

## Optimization

inspect this customization and every affected skill against the installed Canon owner. reconcile
upstream capability changes here; remove redundant local policy instead of rebuilding the fork.
verify public identity, icon resolution, validation failures, and packaged assets after any migration.

## Bundled Resources

- `agents/openai.yaml` and `assets/`: piro discovery and presentation.
- [piro-voice](../voice/SKILL.md): shared human-facing expression.

## Validation

run the shared validator for every changed skill with the explicit piro namespace and plugin container.
verify preserved names, prompts, homepages, and icons separately from Canon provenance. exercise both
valid and invalid temporary fixtures before removing any existing local tooling; report structural,
packaging, and behavioral evidence separately.
