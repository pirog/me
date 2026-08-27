# Codex Task Access

Use this contract when a Piroplugin workflow needs to discover or read Codex tasks on the current
host. Listing is read-only evidence. It does not authorize task creation, archival, interruption,
pin changes, worktree cleanup, or another mutation.

## Listing and recovery

1. Start with the current supported maximum:

   ```text
   list_threads(limit=50)
   ```

   Do not begin with `limit=100`. If a future caller-originated argument mistake is rejected, correct
   it once from the validation response and retry once.

2. Treat a valid response with 50 non-pinned tasks and no cursor, total, or completeness marker as
   partial evidence. The operation succeeded, but hidden active or pending tasks may remain. Do not
   repeat the identical capped read merely to reconfirm the cap.

3. Retry a genuine transport failure, unavailable source, or malformed response within a maximum of
   three total attempts. Stop retrying when the same final result cannot become more trustworthy. An
   unavailable listing may be a soft degradation only for an owning read-only workflow that
   explicitly permits a conditional result; a malformed or untrustworthy final response is a hard
   failure.

## Exact task evidence

- Inspect the visible active, pending, and pinned candidates relevant to the workflow. Do not infer
  exact ownership, source, environment, state, or completion from listing titles or summaries.
- Call `read_thread` for each visible candidate before using it in a commitment, duplicate,
  eligibility, or preservation decision. Use the surfaced `hostId` when required.
- Under incomplete coverage, map only commitments proved by exact visible task reads. Report that
  unseen commitments may exist and never claim an empty or complete task surface.
- Missing optional task metadata may degrade one candidate. An ambiguous identity or untrustworthy
  exact read must not be converted into an empty state.

## Mutation boundary

A workflow may use partial coverage for an explicitly permitted read-only result. Immediately before
any later task creation, archival, or other mutation, repeat the owning workflow's strongest required
duplicate or target verification and read the exact target again. A failed exact read, ambiguous
target, unsafe environment, or destructive uncertainty blocks that mutation. Partial planning
coverage never carries forward as mutation authorization.

## Static scenarios

- `list_threads(limit=50)` returns fewer than 50 non-pinned tasks and trustworthy task records; use
  the exact visible reads under the owning workflow's normal completeness rules.
- A valid 50-result response has no pagination or completeness evidence; continue only where the
  owning read-only workflow permits partial coverage and report the limitation.
- The listing remains unavailable after bounded recovery; an owning plan-only workflow may return
  one conditional recommendation when it explicitly permits that degradation.
- The final listing is malformed or an exact target read fails immediately before mutation; stop at
  the hard safety boundary without changing task state.
