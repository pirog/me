# Work Repositories

Owner: pirog
Visibility: Public
Last reviewed: 2026-08-26
Review cadence: Weekly and when current priorities or supported scopes change

This file owns the reviewed repository-discovery policy used by Piroplugin work planning.
Repository entries define where a workflow may search; they do not grant access or authorize
mutations.

## Priority Repositories

These repositories represent the current shared work-system focus, in order:

1. `tanaabased/openclaw-agent-system`
2. `tanaabased/canon`
3. `pirog/me`
4. `tanaabased/emori`

Priority is a visible repository-relevance signal. It does not replace actor goals, readiness,
dependency order, human Priority, current workload, or capacity evidence. Workflows must still
exhaust discovery across every approved scope.

## Default Discovery Scopes

The following owner scopes are included by default:

- `tanaabased/*`
- `pirog/*`

Priority repositories are already included through these default scopes and do not need separate
search authorization.

## Excluded Repositories

The following exact repositories are excluded from work-planning candidate and workload discovery,
even when an included owner scope would otherwise match them:

- `tanaabased/big-test-bucket` — controlled manual and GitHub integration proof fixture; it does not
  contain actionable planning work.

Apply exclusions before fetching candidate or workload evidence. When an owner-wide query returns a
raw hit from an excluded repository, filter it at the repository boundary and report the repository,
reason, and filtered count rather than enumerating its issues or pull requests. Direct controlled
proof work through `$piro-work-on-task` remains separate from Plan Work and Find Work discovery.

## Current-Invocation Decision

`lando/*` is supported only after the user explicitly includes or excludes it for the current
invocation.

Silence, an earlier decision, stored preference, actor focus, or the appearance of Lando work in a
goals document is not a current decision.

## Explicit Narrowing

A user may narrow the current discovery scope with one or more exact:

- owners, such as `tanaabased`; or
- repositories, such as `tanaabased/canon`.

Narrowing intersects the reviewed scope. It does not add an otherwise unsupported owner or
repository and cannot re-include an excluded repository. An exact restriction that names an
excluded repository is a visible scope conflict, not permission to search it.

## Authority And Live Verification

Repository patterns define discovery scope only. They do not:

- prove that a repository still exists or is currently available;
- grant private-repository access or collaborator permissions;
- establish actor membership or assignability;
- authorize issue, pull-request, repository, access, or task mutations; or
- replace per-invocation identity, privacy, permission, pagination, and availability checks.

Every in-scope canonical source returned by planning discovery must receive one visible disposition.
Repository-level exclusions are reported separately and do not become candidate-level deferrals.

Incomplete discovery must be reported honestly. A workflow must not substitute another repository
or silently broaden scope.
