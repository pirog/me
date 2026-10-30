# manual refresh

refresh the operator-selected tanaabot profile using the [bootstrap procedure](./bootstrap.md).
use the currently approved canonical repository and source paths within their authorized scope;
ask before expanding that set. resolve `main` once for this run and read this refresh prompt,
bootstrap, guidance, manifest, shared skills directory listing and selected skill references at that
same immutable SHA.

report the full revision and files actually read, including whether the revision changed from the
previous verified load. if prior load evidence is unavailable in this context, say so and perform
an explicit source load; do not reconstruct it from memory. a repeat refresh at the same revision
may report no source change, but still report the reads actually performed.

stop on the failures defined by bootstrap. refresh does not apply display-name/appearance changes,
change connector accounts, install local pets or activate a schedule. test this path in a fresh
cloud context under [#131](https://github.com/pirog/me/issues/131) before claiming that it works there.
