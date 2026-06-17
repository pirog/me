# FINAL THINGS

## EMORI

- OC
  - actual onboarding?

  - commit workspace stuff and do initial config pass
    - add to tailnet and expose on all interafaces?
    - verify external connect?
  - handle --skip-bootstrap

  - readiness -> doctor (health plist deamon/wrapper?)
    - manual codex steps?
    - github connector?
    - netlify badge
    - add this into the BOOT.md check?

  - readme/agents.md updates

  - openclaw env handling
    - save invoking OP password in auth somewhere?
    - openclaw gateway install --wrapper <path>
    - emori should install launchd wrapper with op-env support
    - env.shellEnv enabled
    - .env in workspace
    - add to emori doctor checks

    - skipping auth?

  - ssh authorized user stuff?
    - liek agentbox add --authorized-key option
  - what about other ssh options?
  - openclaw.json onboarding commands?
    --reset and --reset full?
    --workspace

  - daemon launch when system does?
  - portability test wrt things like auth keys?

- initial EMORI setup
  - discord/imessage
  - local mem0?
  - backup memories
  - automate emori improvements?

- ISSUE STUFF
  - issue manager|author?
  - work on issue skill?
  - milestone creator w/ monday syncher?
  - milestone form idea
  - repo standardization?
  - emori get issues to work on?

  - subagents
    - environment vars for each via op run --environment? master wrapper?

- FIRST ISSUES
  - install tanaab repo into some kind of gitignored repo folder that is workspace specific?
  - get emori to rework our repos for improved guidance on CLI usage and llms.txt?
  - pictures and badges inc netlify (use connector?) as needed
  - llm.txt
  - usage quickstart with bash -s
  - bun trusting
  - document personal agentbox cli example?
  - falsey shoudl include skip?
  - release skill should always be against main unless explicitly said otherwise
  - github known hosts for scripts that ssh clone eg pirog/me
  - run bootbox in --quiet mode for all wrapper scripts
  - helper tags for repos with similar flows?
  - known_hosts for github?
  - stdin -> script ruins NONINTERACTIVE for all hosted scripts!

  - THEME stuff for fun?

- GitHub channel plugin?

## CANON

- vscode theme and shiki and warp styles?
- add similar badges + circle pic?

## THEME

- tanaab/component-playground
  - migrate tms one
    - decouple styling

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

## BOOTBOX

- warning if keys exist?

## CANON

- some kind of tanaab-coach/advisor skill?
- a brand enforcer skill

## WEBSITE

- rebase on THEME
- get blog rolling
  - rss/etc

## TEMPLATE-NETSCRIPT

- AGENTS.md starter
