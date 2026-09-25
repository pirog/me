#!/usr/bin/env bun

import { runSetup } from '../lib/setup.js';

process.exitCode = await runSetup(process.argv.slice(2));
