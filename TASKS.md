# TASKS

## FINAL MANUAL TAZKZ

- @tanaab/emori
  - run test pass on agent-system

- @tanaab/openclaw-agent-system
  v0.2.1
  - clean up worktrees?
  - uh on ask policy?

  - v0.3.0
    - notification channel?
      - sanitize comments
    - CLI coloring
    - agent-system-init-config skill?
    - docs
    - what about guidance on completing an issue eg open PR etc?
    - release

  - v0.4.0
    - encrypted keys?
    - install script stuff
    - `gog` system
    - docs
    - release

  - `generic-tool` system?

  - cron
    - backups?
    - memory?

  - docs
    - ships with section?
    - agent tool api?

- @tanaab/canon
  - issue lifecyle docs?

  - issue MGMT STUFF ASAP?
    - milestone creation
    - issue creation|triage|etc
    - labels|fields|etc?

  - project author skill
    - suggest 3 good tags skill?
    - skill to autotag repos?

  - org standardizer?
    - list of repo tags
    - goals ands stuff?

  - add AGENTS.md to project optimization?

- @pirog/me
  - work-on-issue skill?
  - node 26?
  - repeat the Homebrew/Bun optimization pass on `pirobookx`: audit and remove any obsolete `/usr/local` Homebrew installation, prefer `/opt/homebrew` Bun, and verify the pinned version through readiness

## ISSUES 2 ADD

- @tanaab/openclaw-devguard
  - spec to issues?

- @tanaab/emori
  - brave search API?
  - discord
  - skill audit and trim?
  - automate emori improvements?
  - some plugins to install for her?
  - @tanaab/canon and openclaw skills?
  - backup system?
  - local postgres?
  - memories?
  - memory diffs
  - backup stuff memories?

  - incorporate log into memories system once we have backups?

  - other issues/goals
    - bootstrap.md.template?

- @tanaab/goals?
  - place for "hidden" tickets and goal setting?
  - better name?

- @pirog/me
  - issues
    - add github known hosts
    - blog like pirog skill
    - $me-readiness should actually be like $me-setup, $me-update and $me-doctor?
      - should also follow the "narrow remediation" path in `agentbox`

- @tanaab/codex-tools?
  - codex-sync?

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

- @tanaab/canon
  - "keeper of the faith"
    - some kind of tanaab-coach/advisor skill?
    - a brand enforcer skill (better as separate agent now?)
  - adoption of schema|error|cli frameworks?
  - organizatinal model for leia tests eg inputs|defaults|feature-x?
  - commit behavior?
    - if you have a list of things to do then commit one per list item
    - message syntax and formatting?

- @lando/leia
  - fix JS literals
  - ESM?
  - update canon guidance
  - Octal escape sequences are not allowed in template strings.

- @tanaab/openclaw-agent-system
  - public api
  - git encrypted keys?
  - approval mechamism for operator invocaiton
  - remove ~/.ssh/id_emori & ~/.ssh/config when we can
  - @tanaabased/config-system?
  - plugin installation?
  - dependencies eg `gh`?
  - personal workspace?
    - plugin to make each agent invocation run in its own shell? load OP env this way?

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

- @tanaab/<persona>-template
  - agent templates to see a repo
- @tanaabased/github-notification-channel

- @tanaab/component-playground
  - migrate tms one
    - decouple styling

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

- @tanaab/\*
  - change to @tanaab npm namespacing via project optimizer
  - bump to latest bun
  - spin off our codex-cache-refresh dev flow tools?
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
- @tanaab/config-system
- @tanaab/actions?
  - for reusable actions
  - release-npm
  - release-clawhub
  - release-github
  - npm-pack
  - ssh-key-gen
