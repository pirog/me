# TASKS

## FINAL MANUAL TAZKZ

- @tanaab/openclaw-agent-system
  - v0.4.0
    - notification channel rewrite

    - test

    - clean up diag tests and docs
      - comment presentation in channel docs and AGENT-PRES.md
      - try to break up tests more or make them more single focused?

    - release!

- @tanaab/emori
  - continue testing notifications

  - update goals?
    - finish fleshing out our canon/agent-system/emori/me repos
    - work on a bunch of random issues and milestones as a way to validate/bug fix/harden/imrpove our agent-sytem/canon/emori workflow

  - emori also text pirog when isuses are done?
  - iMessage me when no work left and bug me every few hours until i assign something?
  - send me a report of work ready for review every morning?
  - push back on irrelevant issues?
  - remove emori from main pushing?
  - emori release

## ISSUES 2 ADD

- @tanaab/emori
  - brave search API?
  - discord
  - skill audit and trim?
  - automate emori improvements?
  - some plugins to install for her?
  - backup system?
  - local postgres?
  - memories?
  - memory diffs
  - backup stuff memories?

  - incorporate log into memories system once we have backups?

  - other issues/goals
    - bootstrap.md.template?

- @tanaab/openclaw-agent-system
  - v0.5.0
    - last inbound in channel settings still has nothing
    - use model to customize assignment reciept

    - pr link?
    - cleanup task?

    - `notifications refresh --json` has some stdout bleed #38

    `/agent-system-update` doesnt work the way we wanted
    - investigate "legacy" issues do we need them still?
      - if so normalize them
      - otherwise remove them
    - other modes
      - work
      - auto
    - model router
    - CLI coloring
    - agent-system-init-config skill?
    - docs
    - what about guidance on completing an issue eg open PR etc?

  - issues
    - install script stuff
    - `gog` system
    - `generic-tool` system?
    - cron
      - backups?
      - memory?
    - public api
    - assigned to review support?
    - "random" comment anywhere support?
    - git encrypted keys?
    - API endpoints
    - backups and scheduling
      - setup creates cron job?
    - local mem0? podman for now or postgres directly

    - explore migration to MCP as base tooling layer?

- @tanaab/canon
  - milestone management?
  - issue decontructor?

  - how do we roll out issue templates?

  - add AGENTS.md to project optimization?

  - project author skill
    - suggest 3 good tags skill?
    - skill to autotag repos?

  - openclaw plugin?
    - make into `agent-system` native tools when AS API is available?
      - `tanaab_task_author`
      - `tanaab_github_issue_schema_author`
      - `tanaab_github_issue_form_author`

  - "keeper of the faith"
    - some kind of tanaab-coach/advisor skill?
    - a brand enforcer skill (better as separate agent now? need pull request reivew?)
  - adoption of schema|error|cli frameworks?

- @pirog/me
  - "normalize" existing agent-system issues?
  - work-on-issue skill?
  - issue to check "mergeable-work"
  - gh mobile app
  - node 26?
  - add github known hosts
  - blog like pirog skill
  - $me-readiness should actually be like $me-setup, $me-update and $me-doctor?
    - should also follow the "narrow remediation" path in `agentbox`

- @tanaab/codex-tools?
  - codex-sync utils?

- @lando/leia
  - fix JS literals
  - ESM?
  - update canon guidance
  - Octal escape sequences are not allowed in template strings.

- @tanaab/component-playground
  - migrate tms one
    - decouple styling

- @tanaab/\*
  - change to @tanaab npm namespacing via project optimizer
  - bump to latest bun
  - create @tanaabased/codex-plugin-validator-action@v1
  - update all scripts that are fundamentally complex to bun cli?
  - catch all email routing and AI triage?
  - cli plugin installation now available in codex
  - known_hosts for github?
  - hosted scripts with better macos.sh and unsupported.sh routing?
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

- @tanaab/utils
  - audit which in core-next are worth it?
    - merge?

- @tanaab/config-system
- @tanaab/actions?
  - for reusable actions
  - release-npm
  - release-clawhub
  - release-github
  - npm-pack
  - ssh-key-gen

- @tanaab/openclaw-devguard
  - spec to issues?

- @tanaab/goals?
  - place for "hidden" tickets and goal setting?
  - better name?

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

- @tanaab/<persona>-template
  - agent templates to see a repo

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

- @tanaab/bootbox
  - warning if keys exist?
  - make into bun cli as well?

- @tanaab/website
  - rebase on THEME
  - get blog rolling
    - rss/etc

- @tanaab/template-netscript
  - AGENTS.md starter
  - llms?
