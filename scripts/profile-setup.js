#!/usr/bin/env bun

import { runProfileSetup } from '../lib/profile-setup.js';

process.exitCode = await runProfileSetup(process.argv.slice(2));
