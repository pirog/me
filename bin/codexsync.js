#!/usr/bin/env bun

import { createCli } from '../lib/bun-cli-support.js';
import { runCodexSync } from '../lib/codexsync.js';

const cli = createCli(import.meta.url);

try {
  const ok = await runCodexSync({ argv: process.argv.slice(2), cli });
  if (!ok) process.exitCode = 1;
} catch (error) {
  cli.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
