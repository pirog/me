import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  commitGithubReportState,
  githubReportDigest,
  readGithubReportState,
} from '../lib/github-report-state.js';

function exampleState(cutoff = '2026-09-14T08:00:00.000Z') {
  return {
    creditedIssues: {},
    cutoff,
    recentEvents: [],
    schemaVersion: 1,
    timeZone: 'America/New_York',
  };
}

describe('skills/morning-closeout/lib/github-report-state', () => {
  let tempRoot;

  beforeEach(async () => {
    tempRoot = await mkdtemp(path.join(os.tmpdir(), 'piro-morning-closeout-'));
  });

  afterEach(async () => {
    await rm(tempRoot, { recursive: true });
  });

  it('should atomically create and read a versioned state file', async () => {
    const statePath = path.join(tempRoot, 'nested', 'state.json');
    const nextState = exampleState();
    const committed = await commitGithubReportState({
      expectedStateDigest: githubReportDigest(null),
      nextState,
      statePath,
    });

    assert.deepEqual(committed, nextState);
    assert.deepEqual(await readGithubReportState(statePath), nextState);
    assert.match(await readFile(statePath, 'utf8'), /"schemaVersion": 1/);
  });

  it('should refuse stale, locked, and malformed state', async () => {
    const statePath = path.join(tempRoot, 'state.json');
    await writeFile(statePath, `${JSON.stringify(exampleState())}\n`);

    await assert.rejects(
      commitGithubReportState({
        expectedStateDigest: githubReportDigest(null),
        nextState: exampleState('2026-09-15T08:00:00.000Z'),
        statePath,
      }),
      { code: 'STALE_STATE' },
    );

    await writeFile(`${statePath}.lock`, 'held\n');
    await assert.rejects(
      commitGithubReportState({
        expectedStateDigest: githubReportDigest(exampleState()),
        nextState: exampleState('2026-09-15T08:00:00.000Z'),
        statePath,
      }),
      { code: 'STATE_LOCKED' },
    );
    await rm(`${statePath}.lock`);

    await writeFile(statePath, 'not json\n');
    await assert.rejects(readGithubReportState(statePath), { code: 'INVALID_STATE' });
  });
});
