# TASKS

## AGENT SYSTEM

- big improvement branch before release?

- investigate backend support (file, redis, db, api?)

## PR REVIEW

- emori
  - check if work is in scope and if documentation is the least amount possible to achieve goal

- pirog
  - check if work has introduced unintended blockers or difficulties to the user being able to use agent system to move issues to completion

## REPOS

- @pirog/me
  - TANAABOT?
    - gh script and browser login?
    - monday automations redo?
    - artwork updates?

  - morning closeout?

  - better plans and reports?
  - read only email summarizer?
    - labeling for kids/tanaab/etc
  - school calender to gcalendar?

- @tanaab/canon
  - other ideas
    - openai platform memories?
    - store historic issues etc?
    - agent-system offload intake/task stuff to endpoint or something?
    - hosted redis/postgres/etc?

- @tanaab/openclaw-agent-system
  - 0.10.0
    - pr review
    - jev to score model?
    - me
    - later

  - ICEBOX
    - running gateway access warning?
    - public API for other plugins?
    - rework so everything is API endpoints?
    - API docs?
    - API endpoints
    - `generic-tool` system?
    - x.com tool?
    - agent-system/agent creation skill?
    - theme?
    - git encrypted keys?

- @tanaab/mmm
  - mmm milestones
  - jev account/alpaca accounts?

- @tanaab/devtool
  - runtime
    - CLI
      - hook for recipe file?
    - manifest?
    - tooling/cache?
    - components?
    - debug?
    - schema?
    - app/cli
    - runtime
    - plugins

  - release
    - new actions for code signing etc?

  - complete

## AGENTS

- temenos?
- setup TBD? admin/daily agent, reuse tanaabot?!
- discord

## EMORI ISSUES?

- @tanaab/component-playground
  - better description
  - redirects
  - about/project url?
  - optimizer? project stnadard?
  - domain setup?
  - release/trusted pub/netlify/etc
  - docs/deploy/netlify/build.env?
  - badges: 34a6ccb8-9d9f-44e7-a5bf-99a47fc54e5f

  - improved milestone new issues?

- @tanaab/agentbox
  - openclaw agentbox plugin?
  - format:write fix

  - need to install @tanaab/openclaw-agent-system globally once we have it?

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
  - go through all repos and normalize with new project skill

  - refresh on readme structure wrt pics and badges
    - get emori to rework our repos for improved guidance on CLI usage and llms.txt?
    - pictures and badges inc netlify (use connector?) as needed

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
    - known_hosts for github?

  - update all scripts that are fundamentally complex to bun cli?

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
