#!/usr/bin/env bun

import { runSetup } from '../lib/setup.js';

process.exitCode = await runSetup(process.argv.slice(2), {
  report: (code) => process.stdout.write(`setup-report-v1 ${code}\n`),
});
