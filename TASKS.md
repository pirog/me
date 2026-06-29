# FINAL THINGS

- @tanaabased/agentbox
  - update readme styling with badges and pilot light and dark modes?
  - update brewfile

  - setup user
    - openclaw:openclaw:avatar photo?
    - explicit brewgroup addition
    - authorized keys
    - autologin
  - dotfiles and marketplace?

  - openclaw onboarding
    - as openclaw user
    - auth choices
    - tailnet if applicable

  - codex plugin?
    - revisit plugin installation/upgrade etc
    - CODEX_LOCAL_DEBUG=true
    -
  - openclaw agentbox plugin?
    - check health and propose remediation?

  - readme/agents.md updates
    - agent box ideally should be run on a fresh install with only 1 admin account
    - improved options usage information
    - rework llms text?
    - agents.md guidance for updates?
    - manual codex setup steps?

  - long term
    - make script for ubuntu LTS?
    - caddy install
    - install and configure needed openclaw plugins eg agent-os?

- @tanaabased/emori
  - remove agentbox setup setuff
  - actual onboarding?
  - commit workspace stuff and do initial config pass

  - agents.md prefer CLI tools eg `gh`
    - add this into the BOOT.md check? check 1password access?

  - discord/imessage
  - backup memories?
  - automate emori improvements?
  - some plugins to install for her?

- @tanaabased/agent-system?
  - note you need to add ssh/signing keys to github first? or part of setup?
  - tracking codex plugin installation? add to clawhub?
  - `openclaw identity`
  - agent identity
  - agent add/remove/update/setup
  - agent signing/ssh transport
  - where are good places to store the OP_SA_TOKEN?
    - environment directly
    - .env file
    - keychain?
    - op-sdk could potentailly match agentids
  - also endpoints for these?
  - can openclaw plugins install other openclaw plugin or use them as deps
    - could my agentid cli install needed plugins after setup?
  - add humans as well?
  - agents.yaml can basically be the plugin config
  - backups and scheduling
    - setup creates cron job?
  - local mem0? podman for now or postgres directly
  - emori get issues to work on?

- @tanaabased/<persona>-template
  - agent templates to see a repo
- @tanaabased/github-notification-channel

- @tanaabased/\*
  - cli plugin installation now available in codex
  - known_hosts for github?
  - stdin -> script ruins NONINTERACTIVE for all hosted scripts!
  - refresh on readme structure wrt pics and badges
  - add similar badges + circle pic?
  - get emori to rework our repos for improved guidance on CLI usage and llms.txt?
  - pictures and badges inc netlify (use connector?) as needed
  - llm.txts
  - usage quickstart with bash -s
  - bun trusting
  - document personal agentbox cli example?
  - falsey shoudl include skip?
  - github known hosts for scripts that ssh clone eg pirog/me
  - run bootbox in --quiet mode for all wrapper scripts
  - helper tags for repos with similar flows?
    - canon list of tags?
    - bootbox
    - hosted-scripts

- @tanaabased/component-playground
  - migrate tms one
    - decouple styling

- @tanaabased/theme
  - markdown files for agents?
    - https://github.com/okineadev/vitepress-plugin-llms
  - accent colors

  - ELEMENTS
    - form page and lock down presentation?
    - toggle label centered?

    - "utils?"
      tms-visually-hidden
      tms-hidden-link

  - Components pass 2
    - external link arrow on TMSBox?
    - TMSTag?
    - TMSCard?
      - blog/work?

  - typography
  - colors
  - logo
    - remove default color in sidebare

  - CONTAINERS
    - light/dark for primary?

  - edit links/team/etc
  - lastUpdated?
  - "advanced usage" for things like component in component patterns?
    - or just different sections to "usage" (as subtheme), (docs patterns)
  - ARIA accessibility?
  - remove containers?
  - review all components against vue-skill and see if we can do more?

  - usage docs?

  - future
    - icon set that can also be distributed?
    - some kind of prompt or scripts to consolidate stylings?

    - robot switch
    - logo pass 2
      - more padding
      - png kit

- @tanaabased/bootbox
  - warning if keys exist?

- @tanaabased/canon
  - some kind of tanaab-coach/advisor skill?
  - a brand enforcer skill (better as agent now?)
  - vscode theme and shiki and warp styles?
  - issue manager|author?
  - work on issue skill?
  - milestone creator w/ monday syncher?
  - milestone form idea
  - repo standardization?
  - THEME stuff for fun?
  - release skill should always be against main unless explicitly said otherwise
  - skill to autotag repos
  - list of repo tags

- @tanaabased/website
  - rebase on THEME
  - get blog rolling
    - rss/etc

- @tanaabased/template-netscript
  - AGENTS.md starter
  - llms?

- @pirog/me
  - add codex cli
