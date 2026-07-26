# TASKS

## FINAL MANUAL TAZKZ

- @pirog/me
  - add metadata support for this in "create-skill"?
  - release?

- @tanaabased/canon
  - openclaw pluginify?
    - add metadata support for this in "create-skill"?

  - release skill should always be against main unless explicitly said otherwise

  - improve readme design wrt advanced?

  - js skills should work for ts as well?
    - must go into src but still allow top level bin and scripts?

  - optimizer pathway?
    - release authors should include docs/standardizer relaignment pass?
    - refactor plugins to be more dense? eg repo author -> repo standardizer?
    - refactor plugins with more and better defined "modes" (incliding optimize)
    - optimizer meta wrapper or prompt?
      - see /prompts?

- @tanaabased/openclaw-devguard
  - develop

- @tanaabased/openclaw-agent-system
  - create

- @tanaabased/emori
  - tanaab?
  - github_token integration?

- @tanaabased/canon
  - work-on-issue skill?

  - issue MGMT STUFF ASAP?
    - milestone creation
    - issue creation|triage|etc
    - labels|fields|etc?

  - repo setup/standardization skills
    - normal settings
    - branch protection
    - add tanabot 2 repo w write access
    - suggest 3 good tags skill
    - verify repo / repo audit
    - skill to autotag repos

  - org standardizer?
    - list of repo tags
    - goals ands stuff?

- @pirog/me
  - node 26?
  - repeat the Homebrew/Bun optimization pass on `pirobookx`: audit and remove any obsolete `/usr/local` Homebrew installation, prefer `/opt/homebrew` Bun, and verify the pinned version through readiness

## ISSUES 2 ADD

- @tanaabased/emori
  - brave search API?
  - discord
  - manual agent.yaml setup?
  - skill audit and trim?
  - automate emori improvements?
  - some plugins to install for her?
  - @tanaab/canon and openclaw skills?
  - backup system?
  - local postgres?
  - memories?
  - memory diffs
  - backup stuff memories?

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

- @tanaabased/agentbox
  - openclaw agentbox plugin?
  - add openclaw app via phone?

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

- @tanaabased/canon
  - longer term
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

- @tanaabased/agent-system?
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

- @tanaabased/<persona>-template
  - agent templates to see a repo
- @tanaabased/github-notification-channel

- @tanaabased/component-playground
  - migrate tms one
    - decouple styling

- @tanaabased/theme
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

- @tanaabased/bootbox
  - warning if keys exist?
  - make into bun cli as well?

- @tanaabased/website
  - rebase on THEME
  - get blog rolling
    - rss/etc

- @tanaabased/template-netscript
  - AGENTS.md starter
  - llms?

- @tanaabased/\*
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
