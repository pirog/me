# manual synchronization preview

start with an explicit [bootstrap load](./bootstrap.md) using the operator-approved canonical repo
and paths. resolve `main` once and use that immutable revision for this prompt, the source load,
manifest validation, appearance asset and any subsequent preview/apply in this run. do not assume
the root cloud assistant or a scheduled chat already loaded the guidance.

after a complete load, prepare a read-only preview for the supported slice of
[the #131 pilot](https://github.com/pirog/me/issues/131):

1. inspect the available cloud name/registered-pet tools and current state. report unsupported or
   unverified fields. a PNG in this repository is not evidence of an arbitrary avatar setter.
2. resolve the logical appearance key through the separately verified private binding. keep cloud
   IDs, account bindings and applied-state records outside this public repo. do not assume a
   transient cloud workspace provides durable storage.
3. show the desired name/appearance, actual supported state and proposed difference, tied to the
   source SHA. if state already agrees, report a no-op without an upload or change. if configuration,
   assets or bindings are invalid/missing, report the problem and make no change.
4. stop at the preview unless the operator separately approves a concrete supported live apply.
   an upload requires its own approval and durable binding so retries cannot duplicate pets.

for an approved live apply, retain the same SHA and previewed inputs, verify the selected account
under [#133](https://github.com/pirog/me/issues/133), and use only the approved supported name/pet
operation. read back the result before reporting success or privately recording the applied SHA.
if the inputs change, prepare a new preview. recovery uses the previous approved revision through
the same explicit load/preview/approval/readback sequence.

this prompt creates no schedule and grants no ongoing apply authority. #131 owns fresh-context,
no-op, rollback, durable-state and later cloud-schedule proof, including agreement on supported
frequency, active window and timezone. it does not activate #156, #157 or #158, implement a self-sync
controller, or replace cloud execution with a Mac schedule. repository edits alone never expand
the operator's authorization.
