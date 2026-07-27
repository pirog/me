#!/usr/bin/env bun

import { runAiSync, buildAiSyncHelp } from '../lib/ai-sync.js';
import { createCli } from '../lib/bun-cli-support.js';

const cli = createCli(import.meta.url);

try {
  await runAiSync({ argv: process.argv.slice(2), cli });
} catch (error) {
  cli.error(error instanceof Error ? error.message : String(error));
  cli.showHelp(buildAiSyncHelp(cli), 1);
}
