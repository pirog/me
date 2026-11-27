import { homedir } from 'node:os';
import path from 'node:path';

import { reconcileCloudCanonSkills } from '../lib/codex-cloud-canon.js';

try {
  const result = await reconcileCloudCanonSkills(
    process.env.CODEX_HOME || path.join(homedir(), '.codex'),
  );
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
  process.stderr.write(`Cloud Canon reconciliation failed. ${error.message}\n`);
  process.exitCode = 1;
}
