import { readFile } from 'node:fs/promises';

const DEFAULT_OPTIONS = Object.freeze({ encoding: 'utf8' });

function normalizeOptions(options = {}) {
  return { ...DEFAULT_OPTIONS, ...options };
}

function parseContents(contents) {
  return contents.trim();
}

export default async function loadFromPath(filePath, options = {}) {
  const normalizedOptions = normalizeOptions(options);
  const contents = await readFile(filePath, normalizedOptions);
  const parsedContents = parseContents(contents);

  if (parsedContents.length === 0) {
    return '';
  }

  return parsedContents;
}
