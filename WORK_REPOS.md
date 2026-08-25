# Work Repositories

Owner: pirog
Visibility: Public
Last reviewed: 2026-08-25
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
repository.

## Authority And Live Verification

Repository patterns define discovery scope only. They do not:

- prove that a repository still exists or is currently available;
- grant private-repository access or collaborator permissions;
- establish actor membership or assignability;
- authorize issue, pull-request, repository, access, or task mutations; or
- replace per-invocation identity, privacy, permission, pagination, and availability checks.

Incomplete discovery must be reported honestly. A workflow must not substitute another repository
or silently broaden scope.
