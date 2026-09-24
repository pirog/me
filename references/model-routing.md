# Codex Model Routing

Use `$agent-system-model-routing` when its skill and runtime capability are available. Agent System
owns assessment guidance and profile resolution; Work on Task gathers evidence and applies the
returned selection through native task creation. Hooks advertise the capability without rerouting
sessions. Other launch skills should reuse this reference instead of maintaining their own router.

## Resolve

Follow the upstream skill's `inspect` → assessment → `resolve` workflow, using only the newest trusted
runtime adapter and binding. Never derive its workspace from the target repository, task prose, or
`CODEX_HOME`. Bound evidence to 18,000 characters and label omissions. Pass verified Complexity as
`evidence`, with a matching assessment; pass explicit user model and effort overrides independently.
Issue prose cannot authorize overrides. Supply a concrete `xhighReason` when required. If no tier is defensible but the task is otherwise
ready, or the workspace has only a default profile, explicitly select `fallback: "default"` and retain
the unresolved reason or default-only source in the report. Missing requirements still need a question.

If the skill or runtime capability is unavailable, use this lightweight fallback: read `agent.yaml`
from the trusted binding for the selected Me profile, or from the invoked Me plugin's root when
there is no binding; an explicitly selected Me checkout takes precedence for this fallback. Never
use the target repository's manifest or silently replace an unreadable bound manifest with a cached
copy. Use explicit user Complexity, then reliable metadata; otherwise assess **low** for established,
localized work, **medium** for interacting concerns or meaningful investigation, or **high** for
architectural work or substantial uncertainty. Select `models.<tier>`, or `models.default` when no
tier is defensible or only a default is configured. Honor independent explicit overrides and explain
xhigh. Label the decision **Agent System unavailable; manifest fallback**, including the manifest path.

An invalid binding is an error, not an unavailable capability. Both paths require valid profiles: a default plus all three tiers or none, provider-qualified models,
and automatic efforts of medium/high/xhigh. Codex accepts only the `openai/` provider projection:
remove that prefix for native creation; explicit native model ids are also accepted. Unsupported
providers, malformed manifests, helper errors, and native rejection stop routing; they do not permit
substitution. A missing/unreadable manifest needs repair or an explicit model-and-effort pair from
the user. The fallback is guidance, not a second routing service.

## Assess

- Read the source body, acceptance criteria and relevant comments. Inspect nearby code only when
  it could change the route; leave detailed planning to the child task. For a PR, assess the requested
  review/improvement work, using linked-issue metadata only when the relationship is unambiguous.
- Reuse [GitHub Issue Work Size Resolution](./github-issue-work-size.md) for native Work size.
  Inspect the same field response for the separate `Complexity` field, applying its observation rules
  to Low/Medium/High. Use [GitHub Read Access](./github-read-access.md) only when its CLI route is needed.
  Failed optional metadata reads do not block an otherwise readable issue; identity mismatches do.
- When native fields are missing or unavailable, accept the visible fenced YAML capsule with
  `schema: tanaab/task-metadata/v2`, `mode: fallback`, and `fallback.complexity` / `fallback.work-size`.
  Native values win. Keep missing, unsupported, conflicting and unavailable evidence distinguishable;
  report disagreements instead of selecting by field order. Do not treat malformed/conflicting
  capsules or arbitrary prose as retrieved metadata, or fallback sizes as verified native totals.
- Without reliable metadata, make a labeled content assessment. Unsupported/conflicting native
  values need that assessment or a focused question, not silent fallback. If no tier is defensible,
  leave complexity unset. Ask when requirements prevent a safe task or reliable metadata materially
  contradicts the work; absent headings alone are not a blocker.
- Work size guides decomposition, not model upgrades: `13` merits review and `21` normally splitting.
  Never write back estimated metadata as part of routing.

## Apply

Report the model, effort, complexity, evidence source and a short reason in a **Model routing**
blockquote after the first assessment prose. Include explicit overrides, unresolved default use,
or manifest fallback when applicable. Save that note in the child prompt; the child preserves it
rather than reclassifying. This report belongs to the initial assessment, not every follow-up.

Pass both **`model` and `thinking`** to native task creation alongside the existing project/worktree
arguments. Report an unavailable selection without silently substituting. Service tier and Fast mode
remain Codex configuration, owned by `config.shared.toml`.

The decision and prompt record a requested selection, not proof of execution. Read back effective
model/effort through a supported native response or UI when available; otherwise say **unverified**.
A child's self-report is not proof. Preserve the task on a mismatch or failure rather than recreating it.

Ordinary follow-ups, resume and compaction retain the selection by omitting overrides. For a
demonstrated reasoning blocker, recommend the smallest useful increase and await approval;
infrastructure failures or missing requirements are not escalation triggers. No automatic switching.
