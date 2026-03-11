#!/usr/bin/env bun

import fs from 'node:fs';

const log = (message) => process.stdout.write(`${message}\n`);

// if script version is not set then do nothing
if (!process.env.SCRIPT_VERSION) {
  log('SCRIPT_VERSION not set, doing nothing');
  process.exit(0);
}

const VERSION = process.env.SCRIPT_VERSION;
const SCRIPT_PATHS = ['./dist/piroboot.sh', './dist/brewgen.sh'].map((path) => new URL(path, import.meta.url));

for (const SCRIPT_PATH of SCRIPT_PATHS) {
  // POSIX SCRIPT
  const POSIX_PREPENDER = `SCRIPT_VERSION="${VERSION}"`;
  const opsxScript = fs.readFileSync(SCRIPT_PATH, { encoding: 'utf8' });
  const vpsxScript = `${POSIX_PREPENDER}\n${opsxScript}`;
  fs.writeFileSync(SCRIPT_PATH, vpsxScript, { encoding: 'utf8' });

  // POSIX VALIDATE
  const upsxScript = fs.readFileSync(SCRIPT_PATH, { encoding: 'utf8' });
  if (!upsxScript.includes(POSIX_PREPENDER)) {
    throw Error(`${SCRIPT_PATH.pathname} does not seem to have the correct SCRIPT_VERSION=${VERSION}`);
  } else {
    log(`updated ${SCRIPT_PATH.pathname} to SCRIPT_VERSION=${VERSION}`);
  }
}
