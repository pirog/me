# TASKS

## PIROG

- @tanaab/emori
  - docs, do we need setup?
  - emphasis beltalowda creol
  - release as package?

  - cron jobs?

  - backup stuff memories?
  - backup system?

  - skill audit and trim?
  - automate emori improvements?
  - install agent as openclaw plugin?

  - push back on irrelevant issues?

  - other issues/goals
    - bootstrap.md.template?

- @tanaab/canon
  - vue skill updates
    - testing?
    - actions?
  - codex skill updates
    - testing with codex cli?
    - actions?
  - install in openclaw?
  - update canon skill?
  - basically it updates lists every day?
  - update repo skill && automation?
  - agent-system/agent creation skill?
  - some kind of blocked issue automation task?
  - codify better automation skills like task management/blocked/etc

- @tanaab/openclaw-agent-system
  - 0.8.0
    - backups
    - setup-file?
    - `gog` tool

    - cron/automations?
    - theme?
    - better voice actuator? rewrite messages?
    - add hooks reconciliation to doctor?

  - 0.9.0
    - `generic-tool` system?
    - pr-review flow
    - complete issue + plan flow
      - plan mode need to be able to transition to work mode with plan prompt injection?
    - complete auto flow?

  - 0.10.0
    - decsision model with jev?

  - pr link?
  - pr flow

  - assigned to review support?
  - "random" comment anywhere support?
  - git encrypted keys?
  - API endpoints
  - backups and scheduling
    - setup creates cron job?
  - explore migration to MCP as base tooling layer?
  - macos backups?

- @pirog/me
  - morning closeout?
  - better plans and reports?
  - read only email summarizer?
  - blog like pirog skill

## AGENTS

- setup SMUTLORD bug fixer agent
- setup TEMENOS canon enforcement && PR agent
- setup TBD? admin/daily agent
- discord

## EMORI ISSUES?

- @tanaab/actions
  - audit for codex-publish then remove?

- @tanaab/component-playground
  - redirects
  - about/project url?
  - optimizer? project stnadard?
  - domain setup?
  - release/trusted pub/netlify/etc
  - docs/deploy/netlify/build.env?

  - badges: 34a6ccb8-9d9f-44e7-a5bf-99a47fc54e5f

  - add to vue/vite skill?
  - improved milestone new issues?

- @tanaab/agentbox
  - openclaw agentbox plugin?
  - format:write fix

  - need to install @tanaabased/agent-system globally once we have it?

  - longer term
    - make this into a bun binary?
    - hub netlify site on get.tanaab.sh (or elsewhere)
      - use a product catalog .yaml to generate needed metadata files?
    - milestone -> rework as a bun CLI?
    - with tailscale serve we cannot use \*.tanaab.net addresses yet/
    - make script for ubuntu LTS?
    - caddy install
    - install and configure needed openclaw plugins eg agent-os?

- @tanaab/bootbox
  - warning if keys exist?
  - make into bun cli as well?

- @tanaab/template-netscript
  - AGENTS.md starter
  - llms?

- @tanaab/goals?
  - place for "hidden" tickets and goal setting?
  - better name?

## TEMENOS ISSUES?

- @tanaab/\*
  - updates to node-version/bun-version?
  - go through all repos and normalize with new project skill
  - change to @tanaab npm namespacing via project optimizer
  - bump to latest bun
  - create @tanaabased/codex-plugin-validator-action@v1
  - update all scripts that are fundamentally complex to bun cli?
  - catch all email routing and AI triage?
  - cli plugin installation now available in codex
  - known_hosts for github?
  - refresh on readme structure wrt pics and badges
  - get emori to rework our repos for improved guidance on CLI usage and llms.txt?
  - pictures and badges inc netlify (use connector?) as needed

  - document personal agentbox cli example?
  - falsey shoudl include skip?
  - helper tags for repos with similar flows?
    - canon list of tags?
    - bootbox
    - hosted-scripts

  - hosted-script concerns
    - run bootbox in --quiet mode for all wrapper scripts
    - usage quickstart with bash -s
    - bun trusting
    - llm.txts
    - add similar badges + circle pic?
    - stdin -> script ruins NONINTERACTIVE for all hosted scripts!
    - hosted scripts with better macos.sh and unsupported.sh routing?
    - readme?

## MILESTONE 1

- @tanaab/theme
  - codex terminal theme?
  - update to latest default theme
  - markdown files for agents?
    - https://github.com/okineadev/vitepress-plugin-llms
  - accent colors
  - move pirog/me themes over here and add symlinks in dot/packages?

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

- @tanaab/website
  - rebase on THEME
  - get blog rolling
    - rss/etc
