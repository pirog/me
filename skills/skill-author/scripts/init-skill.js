#!/usr/bin/env bun
/* eslint-disable no-console */

import { SKILLS_ROOT_DIR, formatSkillTypeIds } from '../lib/skill-contract.js';
import { initializeSkill } from '../lib/skill-scaffolder.js';
import formatSkillValidationReport from '../utils/format-skill-validation-report.js';
import parseInitSkillArgs from '../utils/parse-init-skill-args.js';
import { bold, dim, renderCliHelp } from '../utils/skill-cli.js';

function renderUsage() {
  return renderCliHelp({
    usage: `Usage: ${bold('init-skill.js')} ${dim('--type <type> --slug <slug> --display-name <name> --description <text> [options]')}`,
    summary:
      'Initialize a Pirobased skill from the canonical local full templates owned by piro-skill-author.',
    options: [
      `  --type <type>           skill type such as ${dim(formatSkillTypeIds())}`,
      '  --category-tag <tag>    category tag override; must add one tag beyond owner and type',
      '  --slug <slug>           skill slug without the piro- prefix',
      '  --display-name <name>   human-readable skill display name',
      '  --description <text>    skill description text',
      '  --prompt <text>         default prompt for agents/openai.yaml',
      '  --openclaw-emoji <emoji>      OpenClaw display emoji override',
      '  --openclaw-homepage <url>     OpenClaw public skill URL override',
      `  --output-dir <path>     parent directory for generated skills ${dim(`[default: ${SKILLS_ROOT_DIR}]`)}`,
      '  --force                 overwrite an existing generated skill directory',
      '  -h, --help              show this message',
    ],
  });
}

async function main() {
  const options = parseInitSkillArgs(process.argv.slice(2), SKILLS_ROOT_DIR);
  if (options.help) {
    console.log(renderUsage());
    return;
  }

  const { result, skillDir } = await initializeSkill(options);
  console.log(`Created skill at ${skillDir}`);
  if (result.warnings.length > 0 || result.manualChecks.length > 0) {
    console.log(formatSkillValidationReport(result));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(renderUsage());
  process.exitCode = 1;
});
