# `tanaabot`

<p align="center">
  <img src="./assets/tanaabot-l338-circle.png" alt="tanaabot" width="180" />
</p>

tanaabot's source home in Me: cloud-specific guidance, shared skills and compact artwork,
with manual loading and synchronization prompts for the cloud pilot.

## guidance

[AGENTS.md](./AGENTS.md) defines the cloud-specific task and execution boundaries.
[account scoping (#133)](https://github.com/pirog/me/issues/133) owns connector instructions and
enforcement; a profile or directory name does not select an account.

## voice

[voice.md](./voice.md) captures tanaabot's C-3PO-inspired conversational style. Me documentation
keeps the shared `piro-voice` house style.

## manifest

[manifest.yaml](./manifest.yaml) declares the desired display name, selected L3-38 appearance and
profile source paths. private account bindings, cloud IDs and applied state stay outside this repo.

## skills

reuse the parent [skills collection](../skills/) directly. read a selected skill's `SKILL.md` and
required references.

## prompts

[bootstrap](./prompts/bootstrap.md#start-a-manual-load) loads the profile explicitly into the
designated cloud chat; [refresh](./prompts/refresh.md) repeats that load. after these sources reach
`main`, review and paste the bootstrap entry prompt for the first manual load. both procedures
resolve one immutable revision and report the sources actually read.

[the cloud pilot (#131)](https://github.com/pirog/me/issues/131)
verifies manual and fresh-context loading before recurring work relies on it.

## automations

keep each job's instructions under `automations/<job>/prompt.md`. manual and scheduled runs use the
same job prompt and load the shared guidance first. future `automation.yaml` files will hold the
job's desired cadence, scope and logical destination beside its prompt; #131 must establish the
supported scheduling and private-state capabilities before schedule definitions can be applied.

| job             | source and status                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| appearance sync | [prompt](./automations/appearance-sync/prompt.md) available for manual preview; live apply and scheduled proof belong to [#131](https://github.com/pirog/me/issues/131) |
| ideas review    | planned in [#156](https://github.com/pirog/me/issues/156); proposed monthly review of Canon ideas against current needs                                                 |
| blocked issues  | planned in [#157](https://github.com/pirog/me/issues/157); proposed weekly review for renewed progress                                                                  |
| stale issues    | planned in [#158](https://github.com/pirog/me/issues/158); proposed monthly review, initially considering 90 days without substantive progress                          |

planned jobs have no prompt or schedule definition yet. the review issues own their exact timing,
private recommendation output and persistent chat destination; they do not automatically change
issues. the intended layout is one cloud chat per automation under `TANAABOT`, where supported.
installing Me or reading these files does not activate schedules or apply account/appearance setup.

## artwork

the **L3-38 spaceport circle is selected** in the manifest and shown above. the realistic
GitHub robot and colorful L3-37 pixel treatment remain available as alternatives.

all six images are 256×256 PNGs. each circular image matches its square's framing
and has transparent corners. the previews below display them at 128 pixels.

| set                   | square                                                                                     | circle                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| alternate realistic   | <img src="./assets/tanaabot.png" width="128" alt="realistic tanaabot square" />            | <img src="./assets/tanaabot-circle.png" width="128" alt="realistic tanaabot circle" />            |
| alternate L3-37 pixel | <img src="./assets/tanaabot-pixel.png" width="128" alt="L3-37 pixel tanaabot square" />    | <img src="./assets/tanaabot-pixel-circle.png" width="128" alt="L3-37 pixel tanaabot circle" />    |
| selected L3-38 pixel  | <img src="./assets/tanaabot-l338.png" width="128" alt="L3-38 spaceport tanaabot square" /> | <img src="./assets/tanaabot-l338-circle.png" width="128" alt="L3-38 spaceport tanaabot circle" /> |

only compact runtime images belong in `assets/`; source artwork and working renders belong
in the separately managed asset archive. these files do not install a pet or select
a live profile. existing L3-37/L3-38 local pets, plugin branding, and the human
profile's artwork retain their existing homes.

apply the selected appearance through the separate
[cloud appearance setup pilot (#131)](https://github.com/pirog/me/issues/131).
