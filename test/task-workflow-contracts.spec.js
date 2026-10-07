import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');

describe('manual task workflow contracts', () => {
  it('should statically define bounded lazy GitHub connector and CLI recovery', async () => {
    const contract = await readFile(
      path.join(REPO_ROOT, 'references', 'github-read-access.md'),
      'utf8',
    );

    assert.match(contract, /Prove connector access and CLI access independently/);
    assert.match(contract, /Do not preflight the CLI merely because it is a documented fallback/);
    assert.match(contract, /gh auth status/);
    assert.match(contract, /gh api user --jq \.login/);
    assert.match(contract, /network\/auth ambiguity rather than proof that the token is bad/);
    assert.match(contract, /authorized host execution context/);
    assert.match(contract, /zsh -lc/);
    assert.match(contract, /zsh -ilc/);
    assert.match(contract, /Do not cycle shell wrappers inside a restricted context/);
    assert.match(contract, /never run `gh auth login`/);
  });

  it('should statically define current Codex task access and bounded recovery', async () => {
    const contract = await readFile(
      path.join(REPO_ROOT, 'references', 'codex-task-access.md'),
      'utf8',
    );

    assert.match(contract, /list_threads\(limit=50\)/);
    assert.match(contract, /Do not begin with `limit=100`/);
    assert.match(contract, /correct\s+it once/);
    assert.match(contract, /maximum of\s+three total attempts/);
    assert.match(contract, /Do not\s+repeat the identical capped read/);
    assert.match(contract, /Call `read_thread` for each visible candidate/);
    assert.match(contract, /failed exact read[\s\S]*blocks that mutation/);
  });

  it('should statically protect recurring tasks during cleanup', async () => {
    const contract = await readFile(
      path.join(REPO_ROOT, 'references/codex-task-access.md'),
      'utf8',
    );
    assert.match(contract, /including paused and unmanaged heartbeats/);
    assert.match(contract, /retain it even if its saved schedule is missing/);
    assert.match(contract, /Refresh this check immediately before archival/);
    assert.match(contract, /skip\s+cleanup/);
    const content = await readFile(
      path.join(REPO_ROOT, 'skills', 'clean-up-task', 'SKILL.md'),
      'utf8',
    );
    assert.match(content, /recurring-task preservation/);
  });
});
