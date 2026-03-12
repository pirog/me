import { readFile, writeFile } from 'node:fs/promises';

const SCRIPT_PATHS = ['./dist/piroboot.sh', './dist/brewgen.sh'];

function log(message) {
  process.stdout.write(`${message}\n`);
}

function getScriptVersion() {
  return process.env.SCRIPT_VERSION ?? null;
}

function getVersionLine(version) {
  return `SCRIPT_VERSION="${version}"`;
}

function resolveScriptUrls(paths) {
  return paths.map((scriptPath) => new URL(scriptPath, import.meta.url));
}

function prependVersion(contents, versionLine) {
  return `${versionLine}\n${contents}`;
}

function assertVersionLine(contents, versionLine, scriptUrl) {
  if (!contents.includes(versionLine)) {
    throw new Error(`${scriptUrl.pathname} does not seem to have the correct ${versionLine}`);
  }
}

async function updateScriptVersion(scriptUrl, version) {
  const versionLine = getVersionLine(version);
  const sourceContents = await readFile(scriptUrl, { encoding: 'utf8' });
  const updatedContents = prependVersion(sourceContents, versionLine);

  await writeFile(scriptUrl, updatedContents, { encoding: 'utf8' });

  const writtenContents = await readFile(scriptUrl, { encoding: 'utf8' });
  assertVersionLine(writtenContents, versionLine, scriptUrl);

  return scriptUrl.pathname;
}

async function main() {
  const version = getScriptVersion();

  if (!version) {
    log('SCRIPT_VERSION not set, doing nothing');
    return;
  }

  for (const scriptUrl of resolveScriptUrls(SCRIPT_PATHS)) {
    const scriptPath = await updateScriptVersion(scriptUrl, version);
    log(`updated ${scriptPath} to ${getVersionLine(version)}`);
  }
}

await main();
