# `tanaabot`

<p align="center">
  <img src="./tanaabot-circle.png" alt="tanaabot" width="180" />
</p>

tanaabot's source home in Me: cloud-specific guidance, shared-skill pointers and compact artwork,
with manual loading and synchronization prompts for the cloud pilot.

these are reviewable source definitions. installing Me does not load them into the root cloud
assistant, select its connector account, change its appearance or activate a schedule.

the [voice file](./voice.md) is pending tanaabot's current source text. until that is supplied,
bootstrap and refresh must report an incomplete profile load.

## manual setup

the prompts target `main` after these source changes are merged. until then, review them in the PR;
a missing file on `main` is a failed load, not permission to substitute this branch.

in the designated tanaabot cloud chat, review the [scoped guidance](./AGENTS.md),
[chat voice](./voice.md) and [shared skill index](../skills/README.md). use this read-only entry
prompt after reviewing its exact source-path approval:

```text
use canonical pirog/me for a manual tanaabot bootstrap. i approve reading:
AGENTS.md
tanaabot/AGENTS.md
tanaabot/voice.md
tanaabot/manifest.yaml
tanaabot/prompts/bootstrap.md
tanaabot/tanaabot-circle.png
skills/README.md

resolve main once to one immutable commit SHA. read bootstrap.md again at that
SHA and follow its loading procedure using only these approved source files.
report the SHA, files actually read and any missing dependencies. stop before
any live account, appearance or schedule change. ask before adding task-specific
skills or their required reference files to the approved set.
```

use [refresh](./prompts/refresh.md) to repeat the explicit load and
[sync](./prompts/sync.md) for a dry-run-first appearance preview; approve the corresponding prompt
paths before loading them. [bootstrap](./prompts/bootstrap.md) owns the common loading procedure
and the small [manifest](./manifest.yaml) format.

[the #131 pilot](https://github.com/pirog/me/issues/131) consumes and tests these definitions in a
fresh cloud context. it owns private appearance bindings, supported live apply/readback, rollback
and any later separately approved cloud schedule. source validation here is not that live proof.

[scoped account instructions and setup/readback (#133)](https://github.com/pirog/me/issues/133)
own identity selection and enforcement. the issue includes the proposed cloud instruction; its
final repository home and guard verification remain with #133. do not treat a README or installed
profile as connector authorization.

## artwork

the **realistic set is primary**, preserving tanaabot's current GitHub robot. two
optional pixel treatments are available: L3-37 with the colorful rave background,
and L3-38 with the quieter spaceport background.

all six images are 256×256 PNGs. each circular image matches its square's framing
and has transparent corners. the previews below display them at 128 pixels.

| set                  | square                                                                              | circle                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| primary realistic    | <img src="./tanaabot.png" width="128" alt="realistic tanaabot square" />            | <img src="./tanaabot-circle.png" width="128" alt="realistic tanaabot circle" />            |
| optional L3-37 pixel | <img src="./tanaabot-pixel.png" width="128" alt="L3-37 pixel tanaabot square" />    | <img src="./tanaabot-pixel-circle.png" width="128" alt="L3-37 pixel tanaabot circle" />    |
| optional L3-38 pixel | <img src="./tanaabot-l338.png" width="128" alt="L3-38 spaceport tanaabot square" /> | <img src="./tanaabot-l338-circle.png" width="128" alt="L3-38 spaceport tanaabot circle" /> |

only compact runtime images belong here; source artwork and working renders belong
in the separately managed asset archive. these files do not install a pet or select
a live profile. existing L3-37/L3-38 local pets, plugin branding, and the human
profile's artwork retain their existing homes.

choose the artwork before the separate
[cloud appearance setup pilot (#131)](https://github.com/pirog/me/issues/131).
