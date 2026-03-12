#!/usr/bin/env bun

import path from 'node:path';
import { format, inspect } from 'node:util';

import ansis from 'ansis';
import Debug from 'debug';
import parser from 'yargs-parser';

const CLI_NAME = path.basename(process.argv[1] ?? 'bun-cli');
const CLI_VERSION = '0.0.0';
const DEBUG_NAMESPACE = '@scope/bun-cli';
const color = ansis.extend({
  tp: '#00c88a',
  ts: '#db2777',
});
const { bold, dim, green, red, tp, ts, yellow } = color;

const debug = Debug(DEBUG_NAMESPACE);

if (process.argv.includes('--debug') || process.env.RUNNER_DEBUG === '1') {
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
  return parser(rawArgv, {
    alias: {
      help: ['h'],
      version: ['V'],
    },
    boolean: ['debug', 'help', 'version'],
    configuration: {
      'boolean-negation': true,
      'camel-case-expansion': false,
      'parse-numbers': false,
      'strip-aliased': true,
      'strip-dashed': true,
    },
  });
}

function buildDefaults() {
  return Object.freeze({});
}

function resolveInvocation(argv) {
  const defaults = buildDefaults();
  const positionals = [...argv._];
  const flagOptions = { ...argv };
  delete flagOptions._;
  const options = {
    ...defaults,
    ...flagOptions,
  };

  return { defaults, options, positionals };
}

function renderHelp() {
  return `
Usage: ${dim('[DEBUG=*]')} ${bold(`${CLI_NAME} [options] [arguments...]`)}

${tp('Options')}:
  --debug            shows debug messages
  -h, --help         displays this message
  -V, --version      shows the CLI version ${dim(`[default: ${CLI_VERSION}]`)}

${tp('Environment Variables')}:
  DEBUG              enables debug output for matching namespaces
  FORCE_COLOR        overrides detected color support
  NO_COLOR           disables color output
  RUNNER_DEBUG       enables debug output when set to 1
`.trim();
}

async function runCli({ options, positionals }) {
  trace('resolved options %O', options);
  trace('received positionals %O', positionals);

  if (positionals.length > 0) {
    warn('handle or reject positional arguments before shipping this CLI');
  }

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

  const invocation = resolveInvocation(argv);
  await runCli(invocation);
}

await main(process.argv.slice(2)).catch((error) => {
  const message = error instanceof Error ? error.message : error;
  trace(error);
  fail(message);
});
