# `tanaabot`

<p align="center">
  <img src="./tanaabot-l338-circle.png" alt="tanaabot" width="180" />
</p>

tanaabot's source home in Me: cloud-specific guidance, shared skills and compact artwork,
with manual loading and synchronization prompts for the cloud pilot.

## inventory

| source                              | purpose                                                          |
| ----------------------------------- | ---------------------------------------------------------------- |
| [guidance](./AGENTS.md)             | cloud-specific task, account and execution boundaries            |
| [voice](./voice.md)                 | tanaabot's C-3PO-inspired conversational style                   |
| [shared skills](../skills/)         | the parent profile's skills, reused directly                     |
| [manifest](./manifest.yaml)         | desired display name, selected L3-38 appearance and source paths |
| [bootstrap](./prompts/bootstrap.md) | first manual load from one immutable revision                    |
| [refresh](./prompts/refresh.md)     | repeat the explicit source load                                  |
| [sync](./prompts/sync.md)           | preview supported appearance changes before an approved apply    |
| [artwork](#artwork)                 | selected avatar and retained alternatives                        |

## manual setup

review the [bootstrap prompt](./prompts/bootstrap.md#start-a-manual-load), then paste it into the
designated tanaabot cloud chat after these sources reach `main`. refresh and sync use the same
revision-pinned procedure; approve their prompt paths before loading them.

[the cloud pilot (#131)](https://github.com/pirog/me/issues/131) owns live loading/appearance
verification, private bindings, rollback and any separately approved schedule.
[account scoping (#133)](https://github.com/pirog/me/issues/133) owns connector instructions and
enforcement. installing Me or reading these files does not apply either setup.

## artwork

the **L3-38 spaceport circle is selected** in the manifest and shown above. the realistic
GitHub robot and colorful L3-37 pixel treatment remain available as alternatives.

all six images are 256×256 PNGs. each circular image matches its square's framing
and has transparent corners. the previews below display them at 128 pixels.

| set                   | square                                                                              | circle                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| alternate realistic   | <img src="./tanaabot.png" width="128" alt="realistic tanaabot square" />            | <img src="./tanaabot-circle.png" width="128" alt="realistic tanaabot circle" />            |
| alternate L3-37 pixel | <img src="./tanaabot-pixel.png" width="128" alt="L3-37 pixel tanaabot square" />    | <img src="./tanaabot-pixel-circle.png" width="128" alt="L3-37 pixel tanaabot circle" />    |
| selected L3-38 pixel  | <img src="./tanaabot-l338.png" width="128" alt="L3-38 spaceport tanaabot square" /> | <img src="./tanaabot-l338-circle.png" width="128" alt="L3-38 spaceport tanaabot circle" /> |

only compact runtime images belong here; source artwork and working renders belong
in the separately managed asset archive. these files do not install a pet or select
a live profile. existing L3-37/L3-38 local pets, plugin branding, and the human
profile's artwork retain their existing homes.

apply the selected appearance through the separate
[cloud appearance setup pilot (#131)](https://github.com/pirog/me/issues/131).
