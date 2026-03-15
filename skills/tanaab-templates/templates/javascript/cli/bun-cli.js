#!/usr/bin/env bun

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { format, inspect } from 'node:util';

import ansis from 'ansis';
import Debug from 'debug';
import parser from 'yargs-parser';

const CLI_NAME = path.basename(process.argv[1] ?? 'bun-cli');
const DEBUG_NAMESPACE = '@scope/bun-cli';
const color = ansis.extend({
  tp: '#00c88a',
  ts: '#db2777',
});
const { bold, dim, green, red, tp, ts, yellow } = color;

function getScriptVersion() {
  try {
    return execFileSync('git', ['describe', '--tags', '--always', '--abbrev=1'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '0.0.0-unreleased';
  }
}

let SCRIPT_VERSION;

// Keep a single top-level placeholder so release automation can stamp the entrypoint in place.
if (!SCRIPT_VERSION) {
  SCRIPT_VERSION = getScriptVersion();
}

const CLI_VERSION = SCRIPT_VERSION;

const debug = Debug(DEBUG_NAMESPACE);

function valueEnabled(value) {
  switch (
    String(value ?? '')
      .trim()
      .toLowerCase()
  ) {
    case '':
    case '0':
    case 'false':
    case 'no':
    case 'off':
      return false;
    default:
      return true;
  }
}

function enabledDisplay(value) {
  return valueEnabled(value) ? 'on' : 'off';
}

function splitCsv(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function csvDisplay(values) {
  return values.length > 0 ? values.join(',') : 'none';
}

if (
  process.argv.includes('--debug') ||
  valueEnabled(process.env.TANAAB_DEBUG) ||
  process.env.RUNNER_DEBUG === '1'
) {
  Debug.enable(process.env.DEBUG ?? '*');
}

function normalizeMessage(message, stream) {
  if (typeof message === 'string') {
    return message;
  }

  return inspect(message, {
    colors: stream.isTTY,
    depth: 6,
  });
}

function writeLine(stream, message = '', ...args) {
  const normalizedMessage = normalizeMessage(message, stream);
  stream.write(format(normalizedMessage, ...args) + '\n');
}

function writeStatus(stream, label, colorize, message = '', ...args) {
  const normalizedMessage = normalizeMessage(message, stream);
  stream.write(`${bold(colorize(label))} ${format(normalizedMessage, ...args)}\n`);
}

function trace(message = '', ...args) {
  if (typeof message === 'string') {
    debug(message, ...args);
    return;
  }

  debug('%O', message);
}

function log(message = '', ...args) {
  writeLine(process.stdout, message, ...args);
}

function note(message = '', ...args) {
  writeStatus(process.stdout, 'note', ts, message, ...args);
}

function success(message = '', ...args) {
  writeStatus(process.stdout, 'done', green, message, ...args);
}

function warn(message = '', ...args) {
  writeStatus(process.stderr, 'warn', yellow, message, ...args);
}

function fail(message = '', exitCode = 1) {
  writeStatus(process.stderr, 'error', red, message);
  process.exit(exitCode);
}

function parseArgs(rawArgv) {
  const parserOptions = buildParserOptions();

  return parser(rawArgv, {
    alias: {
      help: ['h'],
      version: ['V'],
    },
    boolean: ['debug', 'force', 'help', 'version'],
    configuration: {
      'boolean-negation': true,
      'camel-case-expansion': false,
      'parse-numbers': false,
      'strip-aliased': true,
      'strip-dashed': true,
    },
    ...parserOptions,
  });
}

function buildDefaults() {
  return Object.freeze({
    force: false,
    item: [],
  });
}

function buildEnvironment() {
  return Object.freeze({
    force: valueEnabled(process.env.TANAAB_FORCE),
    item: splitCsv(process.env.TANAAB_ITEM),
  });
}

function buildParserOptions() {
  const repeatableOptions = [...buildRepeatableOptions()];
  if (repeatableOptions.length === 0) {
    return {};
  }

  return { array: repeatableOptions };
}

function buildRepeatableOptions() {
  return Object.freeze(['item']);
}

function buildEnvironmentVariables() {
  return [
    '  TANAAB_DEBUG    set to a truthy value to show debug messages',
    '  TANAAB_FORCE    set to a truthy value to enable force mode',
    `  TANAAB_ITEM     comma-separated repeatable items ${dim(`[default: ${csvDisplay(buildEnvironment().item)}]`)}`,
  ];
}

function toOptionKey(flag) {
  return flag.replace(/^--(?:no-)?/, '').replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function collectExplicitOptionKeys(rawArgv) {
  const explicitKeys = new Set();

  for (const arg of rawArgv) {
    if (!arg.startsWith('--')) {
      continue;
    }

    explicitKeys.add(toOptionKey(arg.split('=')[0]));
  }

  return explicitKeys;
}

function resolveInvocation(rawArgv, argv) {
  const defaults = buildDefaults();
  const environment = buildEnvironment();
  const repeatableOptions = new Set(buildRepeatableOptions());
  const explicitOptionKeys = collectExplicitOptionKeys(rawArgv);
  const positionals = [...argv._];
  const flagOptions = { ...argv };
  delete flagOptions._;
  delete flagOptions.help;
  delete flagOptions.version;
  const options = {
    ...defaults,
    ...environment,
  };

  for (const [key, value] of Object.entries(flagOptions)) {
    if (value === undefined) {
      continue;
    }

    if (typeof value === 'boolean' && value === false && !explicitOptionKeys.has(key)) {
      continue;
    }

    // Any CLI-provided repeatable flag replaces the env-seeded list for that option.
    if (
      Array.isArray(value) &&
      value.length === 0 &&
      !explicitOptionKeys.has(key) &&
      repeatableOptions.has(key)
    ) {
      continue;
    }

    options[key] = value;
  }

  return { defaults, environment, explicitOptionKeys, options, positionals, repeatableOptions };
}

function renderHelp() {
  const invocation = resolveInvocation([], parseArgs([]));
  const environmentVariables = buildEnvironmentVariables();
  const sections = [
    `Usage: ${bold(`${CLI_NAME} [options] [arguments...]`)}`,
    '',
    `${tp('Options')}:
  --force            enables force mode ${dim(`[default: ${enabledDisplay(invocation.options.force)}]`)}
  --item <value>     adds a repeatable item ${dim(`[default: ${csvDisplay(invocation.options.item)}]`)}
  --debug            shows debug messages
  -h, --help         displays this message
  -V, --version      shows the CLI version ${dim(`[default: ${CLI_VERSION}]`)}`,
  ];

  if (environmentVariables.length > 0) {
    sections.push('', `${tp('Environment Variables')}:\n${environmentVariables.join('\n')}`);
  }

  return sections.join('\n').trim();
}

async function runCli({ options, positionals }) {
  trace('running %s script version: %s', CLI_NAME, SCRIPT_VERSION);
  trace('resolved options %O', options);
  trace('received positionals %O', positionals);

  if (positionals.length > 0) {
    warn('handle or reject positional arguments before shipping this CLI');
  }

  note('received repeatable items: %s', csvDisplay(options.item));
  note('replace runCli() with project-specific behavior');
  success('wire your command execution flow here');
}

async function main(rawArgv) {
  const argv = parseArgs(rawArgv);

  if (argv.help) {
    log(renderHelp());
    return;
  }

  if (argv.version) {
    log(CLI_VERSION);
    return;
  }

  const invocation = resolveInvocation(rawArgv, argv);
  await runCli(invocation);
}

await main(process.argv.slice(2)).catch((error) => {
  const message = error instanceof Error ? error.message : error;
  trace(error);
  fail(message);
});
