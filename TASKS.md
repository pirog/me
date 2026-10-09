# TASKS

## TAXES

- missing basis info

- hardship on withdrawals (health care?)
- hsa
- paid for health insurance

- child care

- business losses webconsulting/tax trading
- capital gains loses for TTS? april 2025?
- MTM

My understanding is that 475 election and tax trader status are not the same thing. So I think you might be conflating things there. I think as long as they're valid day trading losses, then they would go on Schedule C. I mean, the 475 election just has to do with, you know, being able to write off year end loses

## PIROG

- PRIORITY
  - agents/me
    - automations
      - get me to review PR for now
      - backups (needs gog)
      - morning report (closed, PRs needing review, next up?)
      - extra curricular activity?
      - automate emori improvements?
      - update agents
      - update canon
      - push back on irrelevant issues?
      - explain changes to my repo and canon?
      - rotate russian words and phrases?
      - backups (needs gog)
      - look for bugs and small tasks to do and then self assign
      - morning report (closed, PRs needing review, next up?)
      - extra curricular activity?
      - explain changes to my repo and canon?

- @tanaab/smutlord
  - lint and unit test guidance?
  - changelog and release stuff?
  - cannot send as emori imessage?

- @tanaab/openclaw-agent-system
  - 0.9.0
    - fixes?
    - CLI reboot
    - docs & release?

  - REBOOT
    - codex-system
      - leia tests?
      - gitignored local override?

      - better cards for doctor/install in codex?
      - heartbeat completed quietly message?
      - model block quote?

    - new approved-actors setups?
    - pr review?
    - me

    - later

  - ICEBOX
    - running gateway access
    - spacing in install/doctor
    - Agent-system-github below session?
    - update fixtures stuff

    - more voice to github comments?
    - standardized comment/intake/review card and assignment/context
    - approval issue stub/blocked?

    - discord setup?
    - pr-review flow
    - assigned to review support?

    - smaller things
      - backups for codex?
      - gog cred setup instructions?
      - timeout for example tests?
      - backup skill?

    - public API for other plugins?
    - rework so everything is API endpoints?
    - API docs?
    - API endpoints

    - plan mode, need to be able to transition to work mode with plan prompt injection?
    - complete auto flow?
    - `generic-tool` system?
    - x.com tool?
    - agent-system/agent creation skill?

    - pr link?
    - pr flow
    - decsision model with jev?
    - theme?
    - "random" comment anywhere support?
    - better voice actuator? rewrite messages?
    - add hooks reconciliation to doctor?
    - git encrypted keys?
    - logo for clients apps?

- @tanaab/canon
  - $tanaab-pr/task/etc-review
  - $tanaab-pr-fix
  - $tanaab-pr-optimize?
    - tools
    - alone optimization
  - $tanaab-canon-improve?
    - prompt canon?
    - refresh preferred tools?

  - codify better automation skills like task management/blocked/etc
  - some kind of blocked issue automation task?
  - jev tools?
  - install in openclaw?
  - update canon skill?
  - basically it updates lists every day?
  - update repo skill && automation?
  - company brain instead?

- @tanaab/emori
  - release as package?
  - install agent as openclaw plugin?

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

- @pirog/me
  - switch automation flows me#109
  - morning closeout?
  - audit skills? findwork/getwork?

  - better plans and reports?
  - read only email summarizer?
    - labeling for kids/tanaab/etc
  - blog like pirog skill
  - school calender to gcalendar?

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
