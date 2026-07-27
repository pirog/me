#!/usr/bin/env bun
/* eslint-disable no-console */

import { validateSkillDir } from '../lib/skill-validator.js';
import formatSkillValidationReport from '../utils/format-skill-validation-report.js';
import parseValidateSkillArgs from '../utils/parse-validate-skill-args.js';
import { bold, dim, renderCliHelp } from '../utils/skill-cli.js';

function renderUsage() {
  return renderCliHelp({
    usage: `Usage: ${bold('validate-skill.js')} ${dim('--skill-dir <path> [options]')}`,
    summary:
      'Validate a canon skill directory against references/skill-standard.md and the canonical local full templates owned by piro-skill-author.',
    options: [
      '  --skill-dir <path>      skill directory to validate',
      '  --type <type>           expected type override',
      '  -h, --help              show this message',
    ],
  });
}

async function main() {
  const options = parseValidateSkillArgs(process.argv.slice(2));
  if (options.help) {
    console.log(renderUsage());
    return;
  }

  const skillDir = String(options.skillDir ?? '').trim();
  if (!skillDir) throw new Error('Skill directory is required.');

  const result = await validateSkillDir(skillDir, { expectedType: options.type });
  console.log(formatSkillValidationReport(result));
  process.exitCode = result.errors.length === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(renderUsage());
  process.exitCode = 1;
});
