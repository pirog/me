---
name: piro-issue-implementation
description: Pirobased implementation of an authorized issue plan, including shared behavior, affected callers, and contract verification. Use with an actionable plan and an existing authorized checkout.
license: MIT
metadata:
  type: workflow
  owner: tanaab
  tags:
    - tanaab
    - workflow
    - task-management
  openclaw:
    emoji: '🔁'
    homepage: 'https://github.com/pirog/me/tree/main/skills/issue-implementation'
---

# Issue Implementation

## Overview

carry an authorized issue plan through coherent changes and verification in the existing checkout.
adapt Agent System's substantive implementation method; the host owns authorization, selected
instructions, result adaptation, retention, recovery, and PR publication.

## Required Reading

read and apply each applicable document before dependent work; reuse complete reads already in context.

- **Before writing human-facing prose:** read and apply [piro-voice](../voice/SKILL.md).

## When to Use

- implement an actionable plan after the operator or trusted host authorizes the work.
- resume retained implementation with its existing checkout, plan, and progress.

## When Not to Use

- assess a new issue, perform independent PR review, or compose public feedback.
- repeat finished implementation when the host requests delivery only.
- create workflow authority, new chats/worktrees, or a separate publication route.

## Preconditions

- require the authorized plan and checkout, complete assessment when supplied, retained progress, and
  current trusted host instructions. a plan or quoted request alone grants no authority.
- read applicable repository guidance and required references before changes. inspect files and branch,
  reconcile partial work, and preserve the selected model/effort. missing consequential inputs stop
  dependent work; ordinary implementation choices do not need another approval.

## Workflow

1. trace the approved change through its current owner and affected callers. use relevant language,
   framework, testing, and documentation skills from the available catalog. follow the plan and local
   patterns; explain a material deviation when new evidence changes the approach.
2. implement the smallest coherent change that achieves the approved outcome. consolidate genuinely
   shared behavior and update every affected caller. a larger diff needs a concrete reduction in total
   complexity or independent implementations, not merely fewer lines. preserve distinct semantics;
   avoid speculative frameworks, switch-heavy helpers, and unrelated repository cleanup.
3. preserve unrelated edits and existing behavior. resolve routine obstacles independently, but ask
   when a consequential missing requirement changes scope or behavior. continue independent work and
   retain useful partial results while awaiting the answer.
4. correct the existing documentation owner when approved work changes a user-facing contract or makes
   guidance wrong. explain the reader need; omit incidental documentation edits. do not expand into a
   repository-wide rewrite because nearby prose could be nicer.
5. verify both existing and new contracts at their owning layers, including affected callers and
   meaningful failures. demonstrate a bug regression when practical. derive expectations from behavior,
   not copied implementation or prose. run required repository checks, fix failures introduced here,
   and distinguish baseline failures, unavailable checks, and untested live behavior. broaden validation
   only for a separate risk or repository requirement; do not rerun unchanged passing checks for ceremony.
6. review the final diff for correctness, scope, lost coverage, and unsupported claims. commit finished,
   validated work on the task branch when the authorized scope permits it, using repository conventions.
   preserve work if blocked. leave publication and recovery to the host's returned instructions.
7. return the complete substantive result: changed behavior and why, affected callers, actual validation
   and limits, commit identity when available, remaining work, and any blocker with its next action.
   retain partial progress and exact questions for clarification. do not shrink this source to the
   public summary or duplicate the host's result schema. the caller adapts the ordinary output into the
   current implementation contract and owns continuation, delivery, and presentation.

## Checkpoints

- changes follow the authorized approach; shared behavior has an inspected owner and updated callers.
- validation covers preserved and changed contracts, with unrun checks labeled honestly.
- no unrelated work or publication authority slipped into the change.

## Completion Criteria

return verified implementation or a concrete blocker with retained progress. distinguish local
completion, PR delivery, deployment, and merge; only claim what the evidence establishes.

## Bundled Resources

- [shared voice](../voice/SKILL.md): human-facing expression.
- [Agent System implementation method](https://github.com/tanaabased/openclaw-agent-system/blob/main/skills/issue-implementation/SKILL.md): upstream substantive method and host boundary.
- `agents/openai.yaml` and `assets/`: native discovery and presentation.

## Validation

compare the complete result against the plan, acceptance criteria, final diff, and actual check output.
stop once authorized work and required checks are complete; report adjacent improvements separately.
