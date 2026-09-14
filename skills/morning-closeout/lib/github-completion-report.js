const ALLOWED_WORK_SIZES = new Set([1, 2, 3, 5, 8, 13, 21]);
const EVENT_RETENTION_DAYS = 14;
const MAX_RECENT_EVENTS = 1000;
const QUERY_OVERLAP_HOURS = 24;
const STATE_SCHEMA_VERSION = 1;

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function asNonEmptyString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail('INVALID_INPUT', `${field} must be a non-empty string`);
  }
  return value.trim();
}

function asTimestamp(value, field) {
  const timestamp = asNonEmptyString(value, field);
  const milliseconds = Date.parse(timestamp);
  if (!Number.isFinite(milliseconds)) {
    fail('INVALID_INPUT', `${field} must be an ISO timestamp`);
  }
  return new Date(milliseconds).toISOString();
}

function asRepository(value, field = 'repository') {
  const repository = asNonEmptyString(value, field).toLowerCase();
  if (!/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/.test(repository)) {
    fail('INVALID_INPUT', `${field} must be an owner/repository slug`);
  }
  return repository;
}

function asIssueNumber(value, field = 'number') {
  if (!Number.isInteger(value) || value < 1) {
    fail('INVALID_INPUT', `${field} must be a positive integer`);
  }
  return value;
}

function normalizeLogins(values, field) {
  if (!Array.isArray(values)) {
    fail('INVALID_INPUT', `${field} must be an array`);
  }
  return [...new Set(values.map((value) => asNonEmptyString(value, field).toLowerCase()))].sort();
}

function normalizeRepositoryPolicy(policy) {
  if (!policy || typeof policy !== 'object') {
    fail('INVALID_INPUT', 'repositoryPolicy is required');
  }

  return {
    excludedRepositories: [
      ...new Set(
        (policy.excludedRepositories ?? []).map((repository) =>
          asRepository(repository, 'excludedRepositories'),
        ),
      ),
    ].sort(),
    includedOwners: [
      ...new Set(
        (policy.includedOwners ?? []).map((owner) =>
          asNonEmptyString(owner, 'includedOwners').toLowerCase(),
        ),
      ),
    ].sort(),
    includedRepositories: [
      ...new Set(
        (policy.includedRepositories ?? []).map((repository) =>
          asRepository(repository, 'includedRepositories'),
        ),
      ),
    ].sort(),
  };
}

function repositoryDisposition(repository, policy) {
  if (policy.excludedRepositories.includes(repository)) {
    return 'excluded-repository';
  }
  if (policy.includedRepositories.includes(repository)) {
    return 'included';
  }
  const owner = repository.split('/')[0];
  return policy.includedOwners.includes(owner) ? 'included' : 'outside-reviewed-scope';
}

function localDateParts(date, timeZone) {
  let formatter;
  try {
    formatter = new Intl.DateTimeFormat('en-CA', {
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
      hourCycle: 'h23',
      minute: '2-digit',
      month: '2-digit',
      second: '2-digit',
      timeZone,
      year: 'numeric',
    });
  } catch {
    fail('INVALID_INPUT', 'timeZone must be a valid IANA time zone');
  }

  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  );
}

function zonedMidnightIso({ day, month, year }, timeZone) {
  const targetUtc = Date.UTC(year, month - 1, day);
  let instant = targetUtc;

  for (let index = 0; index < 3; index += 1) {
    const observed = localDateParts(new Date(instant), timeZone);
    const observedUtc = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second,
    );
    instant -= observedUtc - targetUtc;
  }

  return new Date(instant).toISOString();
}

function previousLocalMidnight(runStartedAt, timeZone) {
  const current = localDateParts(new Date(runStartedAt), timeZone);
  const previousDate = new Date(
    Date.UTC(current.year, current.month - 1, current.day) - 86_400_000,
  );
  return zonedMidnightIso(
    {
      day: previousDate.getUTCDate(),
      month: previousDate.getUTCMonth() + 1,
      year: previousDate.getUTCFullYear(),
    },
    timeZone,
  );
}

function canonicalSource(repository, number) {
  return `${repository}#${number}`;
}

function eventKey(type, repository, number, occurredAt) {
  return `${type}:${canonicalSource(repository, number)}@${occurredAt}`;
}

function normalizeWorkSize(value, canonicalIssue) {
  if (!value || typeof value !== 'object') {
    return { reason: 'missing', status: 'missing' };
  }

  const status = asNonEmptyString(value.status, `${canonicalIssue}.workSize.status`);
  if (status !== 'verified') {
    return {
      reason: asNonEmptyString(value.reason ?? status, `${canonicalIssue}.workSize.reason`),
      status,
    };
  }

  if (!ALLOWED_WORK_SIZES.has(value.value)) {
    fail('INVALID_INPUT', `${canonicalIssue}.workSize.value is not canonical`);
  }

  const source = asNonEmptyString(value.source, `${canonicalIssue}.workSize.source`);
  if (!['connector-native', 'issue-field-values'].includes(source)) {
    fail('INVALID_INPUT', `${canonicalIssue}.workSize.source is unsupported`);
  }

  return { source, status, value: value.value };
}

function normalizeDeliveryPullRequests(values, field) {
  if (!Array.isArray(values)) {
    fail('INVALID_INPUT', `${field} must be an array`);
  }

  return values.map((pullRequest, index) => ({
    author: asNonEmptyString(pullRequest.author, `${field}[${index}].author`).toLowerCase(),
    mergedAt: asTimestamp(pullRequest.mergedAt, `${field}[${index}].mergedAt`),
    number: asIssueNumber(pullRequest.number, `${field}[${index}].number`),
    relationship: asNonEmptyString(pullRequest.relationship, `${field}[${index}].relationship`),
    repository: asRepository(pullRequest.repository, `${field}[${index}].repository`),
    verified: pullRequest.verified === true,
  }));
}

function normalizeLinkedIssues(values, field) {
  if (!Array.isArray(values)) {
    fail('INVALID_INPUT', `${field} must be an array`);
  }

  return values.map((issue, index) => ({
    assignees: normalizeLogins(issue.assignees, `${field}[${index}].assignees`),
    number: asIssueNumber(issue.number, `${field}[${index}].number`),
    relationship: asNonEmptyString(issue.relationship, `${field}[${index}].relationship`),
    repository: asRepository(issue.repository, `${field}[${index}].repository`),
    verified: issue.verified === true,
  }));
}

function normalizeIssueClosure(issue, index) {
  const repository = asRepository(issue.repository, `issueClosures[${index}].repository`);
  const number = asIssueNumber(issue.number, `issueClosures[${index}].number`);
  const canonicalIssue = canonicalSource(repository, number);
  const closedAt = asTimestamp(issue.closedAt, `issueClosures[${index}].closedAt`);
  const state = asNonEmptyString(issue.state, `issueClosures[${index}].state`).toLowerCase();
  if (!['closed', 'open'].includes(state)) {
    fail('INVALID_INPUT', `issueClosures[${index}].state must be open or closed`);
  }

  return {
    assignees: normalizeLogins(issue.assignees, `issueClosures[${index}].assignees`),
    closedAt,
    deliveryPullRequests: normalizeDeliveryPullRequests(
      issue.deliveryPullRequests ?? [],
      `issueClosures[${index}].deliveryPullRequests`,
    ),
    key: eventKey('issue-closed', repository, number, closedAt),
    number,
    repository,
    source: canonicalIssue,
    state,
    title: typeof issue.title === 'string' ? issue.title : '',
    type: 'issue-closed',
    workSize: normalizeWorkSize(issue.workSize, canonicalIssue),
  };
}

function normalizePullRequestMerge(pullRequest, index) {
  const repository = asRepository(pullRequest.repository, `pullRequestMerges[${index}].repository`);
  const number = asIssueNumber(pullRequest.number, `pullRequestMerges[${index}].number`);
  const mergedAt = asTimestamp(pullRequest.mergedAt, `pullRequestMerges[${index}].mergedAt`);

  return {
    assignees: normalizeLogins(pullRequest.assignees, `pullRequestMerges[${index}].assignees`),
    author: asNonEmptyString(
      pullRequest.author,
      `pullRequestMerges[${index}].author`,
    ).toLowerCase(),
    key: eventKey('pull-request-merged', repository, number, mergedAt),
    linkedIssues: normalizeLinkedIssues(
      pullRequest.linkedIssues ?? [],
      `pullRequestMerges[${index}].linkedIssues`,
    ),
    mergedAt,
    number,
    repository,
    source: canonicalSource(repository, number),
    title: typeof pullRequest.title === 'string' ? pullRequest.title : '',
    type: 'pull-request-merged',
  };
}

function compareEvents(left, right) {
  const leftTimestamp = left.closedAt ?? left.mergedAt;
  const rightTimestamp = right.closedAt ?? right.mergedAt;
  return leftTimestamp.localeCompare(rightTimestamp) || left.key.localeCompare(right.key);
}

function deduplicateEvents(events) {
  const byKey = new Map();
  for (const event of events) {
    const existing = byKey.get(event.key);
    if (existing && JSON.stringify(existing) !== JSON.stringify(event)) {
      fail('CONFLICTING_EVENT', `GitHub returned conflicting evidence for ${event.key}`);
    }
    byKey.set(event.key, event);
  }
  return [...byKey.values()].sort(compareEvents);
}

function normalizeState(value, timeZone) {
  if (value === null || value === undefined) {
    return null;
  }
  if (!value || typeof value !== 'object' || value.schemaVersion !== STATE_SCHEMA_VERSION) {
    fail('INVALID_STATE', `state schemaVersion must equal ${STATE_SCHEMA_VERSION}`);
  }

  const recentEvents = Array.isArray(value.recentEvents)
    ? value.recentEvents.map((event, index) => ({
        key: asNonEmptyString(event.key, `state.recentEvents[${index}].key`),
        occurredAt: asTimestamp(event.occurredAt, `state.recentEvents[${index}].occurredAt`),
      }))
    : fail('INVALID_STATE', 'state.recentEvents must be an array');

  if (!value.creditedIssues || typeof value.creditedIssues !== 'object') {
    fail('INVALID_STATE', 'state.creditedIssues must be an object');
  }

  const creditedIssues = Object.fromEntries(
    Object.entries(value.creditedIssues)
      .map(([issue, credit]) => {
        if (!/^[a-z0-9_.-]+\/[a-z0-9_.-]+#[1-9][0-9]*$/.test(issue)) {
          fail('INVALID_STATE', `state.creditedIssues contains invalid issue ${issue}`);
        }
        if (!credit || typeof credit !== 'object' || !ALLOWED_WORK_SIZES.has(credit.value)) {
          fail('INVALID_STATE', `state.creditedIssues.${issue} is invalid`);
        }
        return [
          issue,
          {
            creditedAt: asTimestamp(credit.creditedAt, `state.creditedIssues.${issue}.creditedAt`),
            eventKey: asNonEmptyString(credit.eventKey, `state.creditedIssues.${issue}.eventKey`),
            value: credit.value,
          },
        ];
      })
      .sort(([left], [right]) => left.localeCompare(right)),
  );

  return {
    creditedIssues,
    cutoff: asTimestamp(value.cutoff, 'state.cutoff'),
    recentEvents: deduplicateRecentEvents(recentEvents),
    schemaVersion: STATE_SCHEMA_VERSION,
    timeZone: asNonEmptyString(value.timeZone ?? timeZone, 'state.timeZone'),
  };
}

function deduplicateRecentEvents(events) {
  const byKey = new Map();
  for (const event of events) {
    const existing = byKey.get(event.key);
    if (existing && existing.occurredAt !== event.occurredAt) {
      fail('INVALID_STATE', `state contains conflicting evidence for ${event.key}`);
    }
    byKey.set(event.key, event);
  }
  return [...byKey.values()].sort(
    (left, right) =>
      left.occurredAt.localeCompare(right.occurredAt) || left.key.localeCompare(right.key),
  );
}

function issueAttribution(issue, actor, runStartedAt) {
  if (issue.assignees.includes(actor)) {
    return {
      reasons: [issue.assignees.length > 1 ? 'shared-assignment' : 'assigned-to-actor'],
      sharedWith: issue.assignees.filter((assignee) => assignee !== actor),
    };
  }

  if (issue.assignees.length === 0) {
    const delivery = issue.deliveryPullRequests.find(
      (pullRequest) =>
        pullRequest.verified &&
        pullRequest.author === actor &&
        pullRequest.mergedAt <= runStartedAt,
    );
    if (delivery) {
      return {
        reasons: [`unassigned-delivery:${canonicalSource(delivery.repository, delivery.number)}`],
        sharedWith: [],
      };
    }
  }

  return null;
}

function pullRequestAttribution(pullRequest, actor) {
  const reasons = [];
  if (pullRequest.author === actor) {
    reasons.push('authored-by-actor');
  }
  if (pullRequest.assignees.includes(actor)) {
    reasons.push('assigned-to-actor');
  }
  for (const issue of pullRequest.linkedIssues) {
    if (issue.verified && issue.assignees.includes(actor)) {
      reasons.push(
        `delivers-actor-assigned-issue:${canonicalSource(issue.repository, issue.number)}`,
      );
    }
  }

  return reasons.length > 0
    ? {
        reasons: [...new Set(reasons)].sort(),
        sharedWith: pullRequest.assignees.filter((assignee) => assignee !== actor),
      }
    : null;
}

function intervalContains(occurredAt, start, end) {
  return occurredAt > start && occurredAt <= end;
}

function githubUrl(type, repository, number) {
  const segment = type === 'issue-closed' ? 'issues' : 'pull';
  return `https://github.com/${repository}/${segment}/${number}`;
}

function reportIssue(issue, attribution) {
  return {
    assignees: issue.assignees,
    attribution,
    closedAt: issue.closedAt,
    eventKey: issue.key,
    number: issue.number,
    repository: issue.repository,
    source: issue.source,
    title: issue.title,
    url: githubUrl(issue.type, issue.repository, issue.number),
    workSize: issue.workSize,
  };
}

function reportPullRequest(pullRequest, attribution) {
  return {
    assignees: pullRequest.assignees,
    attribution,
    author: pullRequest.author,
    eventKey: pullRequest.key,
    mergedAt: pullRequest.mergedAt,
    number: pullRequest.number,
    repository: pullRequest.repository,
    source: pullRequest.source,
    title: pullRequest.title,
    url: githubUrl(pullRequest.type, pullRequest.repository, pullRequest.number),
  };
}

function buildNextState({ creditedIssues, events, previousState, runStartedAt, timeZone }) {
  const retentionFloor = new Date(
    Date.parse(runStartedAt) - EVENT_RETENTION_DAYS * 86_400_000,
  ).toISOString();
  const recentEvents = deduplicateRecentEvents([
    ...(previousState?.recentEvents ?? []),
    ...events.map((event) => ({
      key: event.key,
      occurredAt: event.closedAt ?? event.mergedAt,
    })),
  ])
    .filter((event) => event.occurredAt >= retentionFloor)
    .slice(-MAX_RECENT_EVENTS);

  return {
    creditedIssues: Object.fromEntries(
      Object.entries(creditedIssues).sort(([left], [right]) => left.localeCompare(right)),
    ),
    cutoff: runStartedAt,
    recentEvents,
    schemaVersion: STATE_SCHEMA_VERSION,
    timeZone,
  };
}

export function buildGithubCompletionReport(input, stateValue = null) {
  if (!input || typeof input !== 'object') {
    fail('INVALID_INPUT', 'input must be an object');
  }
  if (input.githubCoverage?.complete !== true) {
    fail('GITHUB_DISCOVERY_INCOMPLETE', 'GitHub discovery must be complete before reporting');
  }

  const actor = asNonEmptyString(input.actor, 'actor').toLowerCase();
  const runStartedAt = asTimestamp(input.runStartedAt, 'runStartedAt');
  const timeZone = asNonEmptyString(input.timeZone, 'timeZone');
  localDateParts(new Date(runStartedAt), timeZone);
  const policy = normalizeRepositoryPolicy(input.repositoryPolicy);
  const previousState = normalizeState(stateValue, timeZone);
  if (previousState && previousState.timeZone !== timeZone) {
    fail('INVALID_STATE', 'state timeZone does not match the current run');
  }

  const window = githubCompletionWindow({ runStartedAt, timeZone }, previousState);
  const intervalStart = window.start;

  const issueClosures = deduplicateEvents((input.issueClosures ?? []).map(normalizeIssueClosure));
  const pullRequestMerges = deduplicateEvents(
    (input.pullRequestMerges ?? []).map(normalizePullRequestMerge),
  );
  const recentKeys = new Set(previousState?.recentEvents.map(({ key }) => key) ?? []);
  const creditedIssues = { ...(previousState?.creditedIssues ?? {}) };
  const completedIssues = [];
  const mergedChanges = [];
  const issueExclusions = [];
  const pullRequestExclusions = [];
  const workSizeExclusions = [];
  const seenEvents = [];
  let verifiedTotal = 0;

  for (const issue of issueClosures) {
    const occurredAt = issue.closedAt;
    if (!intervalContains(occurredAt, intervalStart, runStartedAt)) {
      continue;
    }
    seenEvents.push(issue);
    const repositoryReason = repositoryDisposition(issue.repository, policy);
    if (repositoryReason !== 'included') {
      issueExclusions.push({ eventKey: issue.key, reason: repositoryReason, source: issue.source });
      continue;
    }
    if (issue.state !== 'closed') {
      issueExclusions.push({
        eventKey: issue.key,
        reason: 'reopened-before-run',
        source: issue.source,
      });
      continue;
    }
    if (recentKeys.has(issue.key)) {
      issueExclusions.push({
        eventKey: issue.key,
        reason: 'already-reported',
        source: issue.source,
      });
      continue;
    }
    const attribution = issueAttribution(issue, actor, runStartedAt);
    if (!attribution) {
      issueExclusions.push({
        eventKey: issue.key,
        reason:
          issue.assignees.length > 0 ? 'assigned-only-to-other-actors' : 'unverified-attribution',
        source: issue.source,
      });
      continue;
    }

    completedIssues.push(reportIssue(issue, attribution));
    if (creditedIssues[issue.source]) {
      workSizeExclusions.push({ reason: 'already-credited', source: issue.source });
    } else if (issue.workSize.status === 'verified') {
      verifiedTotal += issue.workSize.value;
      creditedIssues[issue.source] = {
        creditedAt: runStartedAt,
        eventKey: issue.key,
        value: issue.workSize.value,
      };
    } else {
      workSizeExclusions.push({
        reason: issue.workSize.reason,
        source: issue.source,
        status: issue.workSize.status,
      });
    }
  }

  for (const pullRequest of pullRequestMerges) {
    const occurredAt = pullRequest.mergedAt;
    if (!intervalContains(occurredAt, intervalStart, runStartedAt)) {
      continue;
    }
    seenEvents.push(pullRequest);
    const repositoryReason = repositoryDisposition(pullRequest.repository, policy);
    if (repositoryReason !== 'included') {
      pullRequestExclusions.push({
        eventKey: pullRequest.key,
        reason: repositoryReason,
        source: pullRequest.source,
      });
      continue;
    }
    if (recentKeys.has(pullRequest.key)) {
      pullRequestExclusions.push({
        eventKey: pullRequest.key,
        reason: 'already-reported',
        source: pullRequest.source,
      });
      continue;
    }
    const attribution = pullRequestAttribution(pullRequest, actor);
    if (!attribution) {
      pullRequestExclusions.push({
        eventKey: pullRequest.key,
        reason: 'unverified-attribution',
        source: pullRequest.source,
      });
      continue;
    }
    mergedChanges.push(reportPullRequest(pullRequest, attribution));
    workSizeExclusions.push({ reason: 'pull-request-only', source: pullRequest.source });
  }

  const nextState = buildNextState({
    creditedIssues,
    events: seenEvents,
    previousState,
    runStartedAt,
    timeZone,
  });

  return {
    nextState,
    report: {
      completedIssues,
      completedWorkSize: {
        exclusions: workSizeExclusions,
        verifiedTotal,
      },
      coverage: {
        github: 'complete',
        issueClosureEvents: issueClosures.length,
        pullRequestMergeEvents: pullRequestMerges.length,
        scopes: Array.isArray(input.githubCoverage.scopes) ? [...input.githubCoverage.scopes] : [],
      },
      exclusions: {
        issues: issueExclusions,
        pullRequests: pullRequestExclusions,
      },
      interval: {
        ...window,
      },
      mergedChanges,
    },
  };
}

export function githubCompletionWindow(input, stateValue = null) {
  if (!input || typeof input !== 'object') {
    fail('INVALID_INPUT', 'input must be an object');
  }
  const runStartedAt = asTimestamp(input.runStartedAt, 'runStartedAt');
  const timeZone = asNonEmptyString(input.timeZone, 'timeZone');
  localDateParts(new Date(runStartedAt), timeZone);
  const previousState = normalizeState(stateValue, timeZone);
  if (previousState && previousState.timeZone !== timeZone) {
    fail('INVALID_STATE', 'state timeZone does not match the current run');
  }

  const start = previousState?.cutoff ?? previousLocalMidnight(runStartedAt, timeZone);
  if (start > runStartedAt) {
    fail('INVALID_STATE', 'state cutoff is after the current run start');
  }

  return {
    end: runStartedAt,
    firstRun: previousState === null,
    queryStart: new Date(Date.parse(start) - QUERY_OVERLAP_HOURS * 3_600_000).toISOString(),
    start,
    timeZone,
  };
}

export function normalizeGithubCompletionState(value, timeZone = 'UTC') {
  return normalizeState(value, timeZone);
}
