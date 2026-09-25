import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** Fingerprint source inputs whose changes require a new plugin build. */
export default async function pluginSourceDigest(source, listing) {
  const files = listing
    .split('\0')
    .filter(
      (entry) =>
        /\.(?:[cm]?js|tsx?|json)$|^bun\.lock$/.test(entry) &&
        !/(?:^|\/)(?:test|tests|dist|node_modules)\//.test(entry),
    )
    .sort();
  const digest = createHash('sha256');
  for (const file of files) {
    digest.update(file);
    digest.update('\0');
    digest.update(await readFile(path.join(source, file)));
    digest.update('\0');
  }
  return digest.digest('hex');
}
