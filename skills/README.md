# shared skills

use this index to select an existing skill for the task. tanaabot and local agents share these
sources; they do not need separate copies. read the selected `SKILL.md` and its required references
before using it. a file's presence does not install its tools or authorize an action.

| skill                                                          | use it for                                                         | prerequisites                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| [`piro-issue-assessment`](./issue-assessment/SKILL.md)         | investigate an issue and prepare a complete plan                   | an operator-selected issue and source context; managed work retains its owning runtime                      |
| [`piro-issue-implementation`](./issue-implementation/SKILL.md) | implement an authorized plan                                       | an authorized checkout and the owning execution runtime; delegate from the cloud when these are unavailable |
| [`piro-feedback-reply`](./feedback-reply/SKILL.md)             | draft a feedback reply, assessment summary or delivery description | supplied facts and destination context; drafting does not publish                                           |
| [`piro-voice`](./voice/SKILL.md)                               | write Me documentation and prose explicitly authored for pirog     | its required maintainer-style reference; this is not tanaabot's chat voice                                  |
| [`piro-skill-author`](./skill-author/SKILL.md)                 | author or validate a profile skill                                 | the installed Canon skill tooling; reading this file does not install that dependency                       |

for the cloud pilot, follow
[tanaabot's loading procedure](https://github.com/pirog/me/blob/main/tanaabot/prompts/bootstrap.md).
load only the approved skills needed for the current task and their required same-revision
repository references. if a tool, external dependency or execution host is unavailable, report it
or delegate through an authorized route; do not pretend that reading instructions supplied it.
