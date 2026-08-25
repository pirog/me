import { createHash } from 'node:crypto';
import path from 'node:path';

import {
  buildManagedAutomationPrompt,
  parseManagedAutomationPrompt,
} from '../utils/managed-automation-prompt.js';

const EXPECTED_FIELDS = [
  'destination',
  'executionEnvironment',
  'kind',
  'model',
  'name',
  'notificationPolicy',
  'projectId',
  'prompt',
  'reasoningEffort',
  'rrule',
  'status',
];

function stableValue(value) {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, stableValue(nestedValue)]),
    );
  }
  return value;
}

function digestPlan(actions) {
  return createHash('sha256')
    .update(JSON.stringify(stableValue(actions)))
    .digest('hex');
}

function notificationPolicy(notification) {
  if (notification === 'all-runs') {
    return null;
  }
  if (notification === 'failed-runs-only') {
    return 'failed_runs_only';
  }
  return null;
}

function resolveProjectId(localProject, projects) {
  if (!localProject) {
    return null;
  }

  const expectedPath = path.normalize(localProject.path);
  const matches = projects.filter(
    (project) =>
      project.projectKind === 'local' &&
      typeof project.path === 'string' &&
      path.normalize(project.path) === expectedPath,
  );
  if (matches.length !== 1) {
    throw new Error(
      `local project path must match exactly one Codex local project: ${localProject.path} (matched ${matches.length}).`,
    );
  }
  if (typeof matches[0].projectId !== 'string' || !matches[0].projectId) {
    throw new Error(`matched Codex local project has no projectId: ${localProject.path}`);
  }
  return matches[0].projectId;
}

function expectedTask(task, defaults, projects) {
  const model = task.model ?? defaults.model;
  const reasoningEffort = task.reasoning ?? defaults.reasoningEffort;
  if (!model || !reasoningEffort) {
    throw new Error(`automation ${task.id} needs model and reasoning defaults from Codex config.`);
  }

  return {
    destination: 'local',
    executionEnvironment: 'local',
    kind: 'cron',
    model,
    name: task.name,
    notificationPolicy: notificationPolicy(task.notification),
    projectId: resolveProjectId(task.localProject, projects),
    prompt: buildManagedAutomationPrompt(task.id, task.prompt),
    reasoningEffort,
    rrule: task.rrule,
    status: task.enabled ? 'ACTIVE' : 'PAUSED',
  };
}

function comparableActual(actualTask) {
  return Object.fromEntries(EXPECTED_FIELDS.map((field) => [field, actualTask[field] ?? null]));
}

function changedFields(actual, expected) {
  return EXPECTED_FIELDS.filter((field) => actual[field] !== expected[field]);
}

function planManagedExisting(actual, expected, manifestId) {
  const normalizedActual = comparableActual(actual);
  const changes = changedFields(normalizedActual, expected);
  if (changes.length === 0) {
    return null;
  }

  const contentChanges = changes.filter((field) => field !== 'status');
  if (contentChanges.length === 0) {
    return {
      automationId: actual.id,
      changedFields: changes,
      expected,
      manifestId,
      type: expected.status === 'ACTIVE' ? 'resume' : 'pause',
    };
  }

  return {
    automationId: actual.id,
    changedFields: changes,
    expected,
    manifestId,
    type: 'update',
  };
}

/**
 * Build a deterministic reconciliation plan from desired and observed Codex tasks.
 *
 * @param {object} options Planning inputs.
 * @param {object[]} options.actualTasks Authoritative snapshots from automation view calls.
 * @param {{model: string, reasoningEffort: string}} options.defaults Codex defaults.
 * @param {object[]} options.desiredTasks Validated manifest tasks.
 * @param {object[]} [options.projects] Codex projects returned by list_projects.
 * @returns {{actions: object[], digest: string, summary: object}} Reconciliation plan.
 */
export function buildAutomationPlan({ actualTasks, defaults, desiredTasks, projects = [] }) {
  if (
    !Array.isArray(actualTasks) ||
    !Array.isArray(desiredTasks) ||
    !Array.isArray(projects) ||
    !defaults ||
    typeof defaults !== 'object' ||
    Array.isArray(defaults)
  ) {
    throw new Error('automation planning requires actualTasks, desiredTasks, and defaults.');
  }

  const managedTasks = new Map();
  let unmanagedCount = 0;
  for (const actualTask of actualTasks) {
    if (!actualTask || typeof actualTask !== 'object' || Array.isArray(actualTask)) {
      throw new Error('each observed automation must be an object.');
    }
    const marker = parseManagedAutomationPrompt(actualTask.prompt);
    if (marker.malformed) {
      throw new Error(
        `automation ${actualTask.id ?? '(unknown)'} has a malformed pirog/me marker.`,
      );
    }
    if (!marker.managed) {
      unmanagedCount += 1;
      continue;
    }
    if (typeof actualTask.id !== 'string' || !actualTask.id) {
      throw new Error(`managed automation ${marker.manifestId} has no automation id.`);
    }
    if (managedTasks.has(marker.manifestId)) {
      throw new Error(`multiple Codex automations claim manifest id: ${marker.manifestId}`);
    }
    managedTasks.set(marker.manifestId, actualTask);
  }

  const actions = [];
  const desiredIds = new Set();
  let unchanged = 0;
  for (const task of [...desiredTasks].sort((left, right) => left.id.localeCompare(right.id))) {
    desiredIds.add(task.id);
    const expected = expectedTask(task, defaults, projects);
    const actual = managedTasks.get(task.id);
    if (!actual) {
      actions.push({ expected, manifestId: task.id, type: 'create' });
      continue;
    }

    const action = planManagedExisting(actual, expected, task.id);
    if (action) {
      actions.push(action);
    } else {
      unchanged += 1;
    }
  }

  for (const [manifestId, actual] of [...managedTasks].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    if (!desiredIds.has(manifestId)) {
      actions.push({
        automationId: actual.id,
        manifestId,
        name: actual.name ?? null,
        type: 'delete',
      });
    }
  }

  const order = new Map([
    ['create', 0],
    ['update', 1],
    ['pause', 2],
    ['resume', 3],
    ['delete', 4],
  ]);
  actions.sort(
    (left, right) =>
      order.get(left.type) - order.get(right.type) ||
      left.manifestId.localeCompare(right.manifestId),
  );

  return {
    actions,
    digest: digestPlan(actions),
    summary: {
      changed: actions.filter((action) => ['pause', 'resume', 'update'].includes(action.type))
        .length,
      extra: actions.filter((action) => action.type === 'delete').length,
      missing: actions.filter((action) => action.type === 'create').length,
      unchanged,
      unmanaged: unmanagedCount,
    },
  };
}
