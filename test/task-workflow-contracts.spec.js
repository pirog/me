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

  it('should statically continue plan-only work under partial or unavailable task coverage', async () => {
    const planWork = await readFile(
      path.join(REPO_ROOT, 'skills', 'plan-work', 'SKILL.md'),
      'utf8',
    );

    assert.match(
      planWork,
      /Start current-host commitment discovery with `list_threads\(limit=50\)`/,
    );
    assert.match(planWork, /\*\*partial:\*\*[\s\S]*Map only exact visible commitments/);
    assert.match(planWork, /visible subtotal with incomplete coverage/);
    assert.match(planWork, /remaining and total capacity as\s+unknown/);
    assert.match(planWork, /\*\*unavailable:\*\*[\s\S]*clearly conditional issue recommendation/);
    assert.match(planWork, /recommend at most one issue/);
    assert.match(planWork, /partial or unavailable listing[\s\S]*blocks creation/);
  });

  it('should keep Morning Closeout GitHub reporting separate from task cleanup', async () => {
    const closeout = await readFile(
      path.join(REPO_ROOT, 'skills', 'morning-closeout', 'SKILL.md'),
      'utf8',
    );

    assert.match(closeout, /Discover completed issues and merged pull requests across/);
    assert.match(closeout, /exact interval `start < event <= end`/);
    assert.match(
      closeout,
      /unassigned issues with a verified delivery\s+pull request authored by `pirog`/,
    );
    assert.match(closeout, /Start current-host cleanup discovery with `list_threads\(limit=50\)`/);
    assert.match(closeout, /valid capped result is partial but usable/);
    assert.match(
      closeout,
      /Immediately before each archive-mode\s+handoff, read the exact target again/,
    );
    assert.match(closeout, /unavailable\s+or malformed listing blocks cleanup but leaves/);
  });

  it('should statically protect recurring tasks in both cleanup entrypoints', async () => {
    const contract = await readFile(
      path.join(REPO_ROOT, 'references/codex-task-access.md'),
      'utf8',
    );
    assert.match(contract, /including paused and unmanaged heartbeats/);
    assert.match(contract, /retain it even if its saved schedule is missing/);
    assert.match(contract, /Refresh this check immediately before archival/);
    assert.match(contract, /skip\s+cleanup/);
    for (const skill of ['clean-up-task', 'morning-closeout']) {
      const content = await readFile(path.join(REPO_ROOT, 'skills', skill, 'SKILL.md'), 'utf8');
      assert.match(content, /recurring-task preservation/);
    }
  });
});
