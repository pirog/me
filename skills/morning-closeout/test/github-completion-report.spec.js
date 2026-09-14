import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  buildGithubCompletionReport,
  githubCompletionWindow,
} from '../lib/github-completion-report.js';

const FIXTURE_URL = new URL('./issue-58-regression.json', import.meta.url);

function baseInput(overrides = {}) {
  return {
    actor: 'pirog',
    githubCoverage: { complete: true, scopes: ['pirog/*', 'tanaabased/*'] },
    issueClosures: [],
    pullRequestMerges: [],
    repositoryPolicy: {
      excludedRepositories: ['tanaabased/big-test-bucket'],
      includedOwners: ['pirog', 'tanaabased'],
      includedRepositories: [],
    },
    runStartedAt: '2026-09-14T08:00:00.000Z',
    timeZone: 'America/New_York',
    ...overrides,
  };
}

function verifiedWorkSize(value) {
  return { source: 'connector-native', status: 'verified', value };
}

describe('skills/morning-closeout/lib/github-completion-report', () => {
  it('should preserve the issue 58 omission evidence and report its merge and closure separately', async () => {
    const fixture = JSON.parse(await readFile(FIXTURE_URL, 'utf8'));
    assert.deepEqual(fixture.baseline.archivedWorkReported, []);
    assert.equal(fixture.baseline.completedWorkSize, 0);

    const merge = buildGithubCompletionReport(fixture.mergeRun);
    assert.equal(merge.report.interval.start, '2026-09-10T04:00:00.000Z');
    assert.equal(merge.report.interval.queryStart, '2026-09-09T04:00:00.000Z');
    assert.deepEqual(merge.report.completedIssues, []);
    assert.deepEqual(
      merge.report.mergedChanges.map(({ source }) => source),
      ['pirog/me#61'],
    );
    assert.deepEqual(merge.report.completedWorkSize.exclusions, [
      { reason: 'pull-request-only', source: 'pirog/me#61' },
    ]);

    const closure = buildGithubCompletionReport(fixture.closureRun, merge.nextState);
    assert.deepEqual(
      closure.report.completedIssues.map(({ source }) => source),
      ['pirog/me#58'],
    );
    assert.deepEqual(closure.report.mergedChanges, []);
    assert.equal(closure.report.completedWorkSize.verifiedTotal, 0);
    assert.deepEqual(closure.report.completedWorkSize.exclusions, [
      {
        reason: 'body-only fallback is not verified native Work size',
        source: 'pirog/me#58',
        status: 'endpoint-unavailable',
      },
    ]);
  });

  it('should calculate the first and subsequent fixed discovery windows', () => {
    const first = githubCompletionWindow({
      runStartedAt: '2026-11-02T09:00:00.000Z',
      timeZone: 'America/New_York',
    });
    assert.deepEqual(first, {
      end: '2026-11-02T09:00:00.000Z',
      firstRun: true,
      queryStart: '2026-10-31T04:00:00.000Z',
      start: '2026-11-01T04:00:00.000Z',
      timeZone: 'America/New_York',
    });

    const next = githubCompletionWindow(
      {
        runStartedAt: '2026-11-03T09:00:00.000Z',
        timeZone: 'America/New_York',
      },
      {
        creditedIssues: {},
        cutoff: '2026-11-02T09:00:00.000Z',
        recentEvents: [],
        schemaVersion: 1,
        timeZone: 'America/New_York',
      },
    );
    assert.equal(next.start, '2026-11-02T09:00:00.000Z');
    assert.equal(next.queryStart, '2026-11-01T09:00:00.000Z');
  });

  it('should apply explicit attribution rules and exclude weak signals', () => {
    const input = baseInput({
      issueClosures: [
        {
          assignees: ['pirog', 'emoriwan'],
          closedAt: '2026-09-13T12:00:00.000Z',
          number: 1,
          repository: 'pirog/me',
          state: 'closed',
          title: 'shared issue',
          workSize: verifiedWorkSize(3),
        },
        {
          assignees: [],
          closedAt: '2026-09-13T13:00:00.000Z',
          deliveryPullRequests: [
            {
              author: 'pirog',
              mergedAt: '2026-09-13T12:30:00.000Z',
              number: 20,
              relationship: 'closes',
              repository: 'pirog/me',
              verified: true,
            },
          ],
          number: 2,
          repository: 'pirog/me',
          state: 'closed',
          title: 'unassigned delivered issue',
          workSize: verifiedWorkSize(5),
        },
        {
          assignees: ['emoriwan'],
          closedAt: '2026-09-13T14:00:00.000Z',
          deliveryPullRequests: [
            {
              author: 'pirog',
              mergedAt: '2026-09-13T13:30:00.000Z',
              number: 21,
              relationship: 'closes',
              repository: 'pirog/me',
              verified: true,
            },
          ],
          number: 3,
          repository: 'pirog/me',
          state: 'closed',
          title: 'other actor issue',
          workSize: verifiedWorkSize(8),
        },
      ],
      pullRequestMerges: [
        {
          assignees: [],
          author: 'emoriwan',
          linkedIssues: [
            {
              assignees: ['pirog'],
              number: 4,
              relationship: 'closes',
              repository: 'pirog/me',
              verified: true,
            },
          ],
          mergedAt: '2026-09-13T15:00:00.000Z',
          number: 22,
          repository: 'pirog/me',
          title: 'delivery for assigned issue',
        },
        {
          assignees: [],
          author: 'emoriwan',
          linkedIssues: [],
          mergedAt: '2026-09-13T16:00:00.000Z',
          number: 23,
          repository: 'pirog/me',
          title: 'merged by pirog is not enough',
        },
      ],
    });

    const { report } = buildGithubCompletionReport(input);
    assert.deepEqual(
      report.completedIssues.map(({ source }) => source),
      ['pirog/me#1', 'pirog/me#2'],
    );
    assert.deepEqual(report.completedIssues[0].attribution, {
      reasons: ['shared-assignment'],
      sharedWith: ['emoriwan'],
    });
    assert.deepEqual(report.completedIssues[1].attribution.reasons, [
      'unassigned-delivery:pirog/me#20',
    ]);
    assert.equal(report.completedWorkSize.verifiedTotal, 8);
    assert.deepEqual(report.mergedChanges[0].attribution.reasons, [
      'delivers-actor-assigned-issue:pirog/me#4',
    ]);
    assert.deepEqual(report.exclusions.issues, [
      {
        eventKey: 'issue-closed:pirog/me#3@2026-09-13T14:00:00.000Z',
        reason: 'assigned-only-to-other-actors',
        source: 'pirog/me#3',
      },
    ]);
    assert.deepEqual(report.exclusions.pullRequests, [
      {
        eventKey: 'pull-request-merged:pirog/me#23@2026-09-13T16:00:00.000Z',
        reason: 'unverified-attribution',
        source: 'pirog/me#23',
      },
    ]);
  });

  it('should report a reclosure without crediting the same issue twice', () => {
    const first = buildGithubCompletionReport(
      baseInput({
        issueClosures: [
          {
            assignees: ['pirog'],
            closedAt: '2026-09-13T12:00:00.000Z',
            number: 10,
            repository: 'pirog/me',
            state: 'closed',
            title: 'closed once',
            workSize: verifiedWorkSize(5),
          },
        ],
      }),
    );
    assert.equal(first.report.completedWorkSize.verifiedTotal, 5);

    const reopened = buildGithubCompletionReport(
      baseInput({
        issueClosures: [
          {
            assignees: ['pirog'],
            closedAt: '2026-09-14T12:00:00.000Z',
            number: 10,
            repository: 'pirog/me',
            state: 'open',
            title: 'reopened before the report',
            workSize: verifiedWorkSize(5),
          },
        ],
        runStartedAt: '2026-09-15T08:00:00.000Z',
      }),
      first.nextState,
    );
    assert.deepEqual(reopened.report.completedIssues, []);
    assert.equal(reopened.report.exclusions.issues[0].reason, 'reopened-before-run');

    const second = buildGithubCompletionReport(
      baseInput({
        issueClosures: [
          {
            assignees: ['pirog'],
            closedAt: '2026-09-15T12:00:00.000Z',
            number: 10,
            repository: 'pirog/me',
            state: 'closed',
            title: 'closed again',
            workSize: verifiedWorkSize(5),
          },
        ],
        runStartedAt: '2026-09-16T08:00:00.000Z',
      }),
      reopened.nextState,
    );
    assert.deepEqual(
      second.report.completedIssues.map(({ source }) => source),
      ['pirog/me#10'],
    );
    assert.equal(second.report.completedWorkSize.verifiedTotal, 0);
    assert.deepEqual(second.report.completedWorkSize.exclusions, [
      { reason: 'already-credited', source: 'pirog/me#10' },
    ]);
  });

  it('should span missed runs and reject incomplete GitHub discovery', () => {
    const friday = buildGithubCompletionReport(
      baseInput({ runStartedAt: '2026-09-11T08:00:00.000Z' }),
    );
    const monday = buildGithubCompletionReport(
      baseInput({
        pullRequestMerges: [
          {
            assignees: [],
            author: 'pirog',
            linkedIssues: [],
            mergedAt: '2026-09-13T17:00:00.000Z',
            number: 30,
            repository: 'pirog/me',
            title: 'weekend delivery',
          },
        ],
        runStartedAt: '2026-09-14T08:00:00.000Z',
      }),
      friday.nextState,
    );
    assert.equal(monday.report.interval.start, '2026-09-11T08:00:00.000Z');
    assert.deepEqual(
      monday.report.mergedChanges.map(({ source }) => source),
      ['pirog/me#30'],
    );

    assert.throws(
      () =>
        buildGithubCompletionReport(
          baseInput({ githubCoverage: { complete: false, scopes: ['pirog/*'] } }),
        ),
      { code: 'GITHUB_DISCOVERY_INCOMPLETE' },
    );
  });

  it('should enforce repository scope and reject contradictory duplicate events', () => {
    const excludedPullRequest = {
      assignees: ['pirog'],
      author: 'pirog',
      linkedIssues: [],
      mergedAt: '2026-09-13T12:00:00.000Z',
      number: 40,
      repository: 'tanaabased/big-test-bucket',
      title: 'fixture work',
    };
    const scoped = buildGithubCompletionReport(
      baseInput({ pullRequestMerges: [excludedPullRequest] }),
    );
    assert.deepEqual(scoped.report.mergedChanges, []);
    assert.equal(scoped.report.exclusions.pullRequests[0].reason, 'excluded-repository');

    assert.throws(
      () =>
        buildGithubCompletionReport(
          baseInput({
            pullRequestMerges: [
              excludedPullRequest,
              { ...excludedPullRequest, title: 'contradictory title' },
            ],
          }),
        ),
      { code: 'CONFLICTING_EVENT' },
    );
  });
});
