#!/usr/bin/env bun
/* eslint-disable no-console */

import path from 'node:path';

import { loadAutomationManifest } from '../../../lib/automation-manifest.js';
import { buildAutomationPlan } from '../../../lib/automation-plan.js';

function parseArgs(args) {
  const options = { command: args[0] ?? null, repoRoot: process.cwd() };
  for (let index = 1; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--repo-root') {
      options.repoRoot = args[index + 1];
      index += 1;
      continue;
    }
    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }
    throw new Error(`unknown argument: ${argument}`);
  }
  return options;
}

function usage() {
  return [
    'Usage: automation-task.js <validate|plan> [--repo-root <path>]',
    '',
    'Commands:',
    '  validate  validate AUTOMATIONS.yaml and resolved prompt files',
    '  plan      read observed automation JSON from stdin and emit a deterministic plan',
  ].join('\n');
}

async function readJsonStdin() {
  process.stdin.setEncoding('utf8');
  let content = '';
  for await (const chunk of process.stdin) {
    content += chunk;
  }
  if (!content.trim()) {
    throw new Error('plan requires JSON on stdin.');
  }
  return JSON.parse(content);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help || !options.command) {
    console.log(usage());
    return;
  }

  const repoRoot = path.resolve(options.repoRoot);
  const manifest = await loadAutomationManifest({ repoRoot });
  if (options.command === 'validate') {
    console.log(
      JSON.stringify({ automationCount: manifest.automations.length, ok: true, schemaVersion: 1 }),
    );
    return;
  }
  if (options.command === 'plan') {
    const input = await readJsonStdin();
    const plan = buildAutomationPlan({
      actualTasks: input.actualTasks,
      defaults: input.defaults,
      desiredTasks: manifest.automations,
      projects: input.projects ?? [],
    });
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  throw new Error(`unknown command: ${options.command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(usage());
  process.exitCode = 1;
});
