import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

import { compileAutomationSchedule } from '../utils/compile-automation-schedule.js';

const ROOT_KEYS = new Set(['automations', 'schema-version']);
const TASK_KEYS = new Set([
  'enabled',
  'id',
  'local-project',
  'model',
  'name',
  'notification',
  'preflight-file',
  'prompt',
  'prompt-file',
  'reasoning',
  'schedule',
]);
const PROJECT_KEYS = new Set(['path']);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const MAX_INLINE_PROMPT_LINES = 25;
const NOTIFICATIONS = new Set(['all-runs', 'failed-runs-only']);
const REASONING_EFFORTS = new Set([
  'high',
  'low',
  'max',
  'medium',
  'minimal',
  'none',
  'ultra',
  'xhigh',
]);

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertKnownKeys(value, allowedKeys, label) {
  for (const key of Object.keys(value)) {
    if (!KEY_PATTERN.test(key)) {
      throw new Error(`${label} field must use kebab-case: ${key}`);
    }
    if (!allowedKeys.has(key)) {
      throw new Error(`${label} contains an unknown field: ${key}`);
    }
  }
}

function assertNonemptyString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} must be a nonempty string.`);
  }
}

async function resolveAutomationTextFile(repoRoot, relativePath, field) {
  assertNonemptyString(relativePath, field);
  if (path.isAbsolute(relativePath)) {
    throw new Error(`${field} must be relative to the repository root.`);
  }

  const promptsRoot = path.join(repoRoot, 'automations');
  const targetPath = path.resolve(repoRoot, relativePath);
  if (targetPath === promptsRoot || !targetPath.startsWith(`${promptsRoot}${path.sep}`)) {
    throw new Error(`${field} must stay under automations/.`);
  }

  let targetStats;
  try {
    targetStats = await lstat(targetPath);
  } catch {
    throw new Error(`${field} does not exist: ${relativePath}`);
  }
  if (!targetStats.isFile() && !targetStats.isSymbolicLink()) {
    throw new Error(`${field} must resolve to a regular file: ${relativePath}`);
  }

  let realPromptsRoot;
  let realTargetPath;
  try {
    [realPromptsRoot, realTargetPath] = await Promise.all([
      realpath(promptsRoot),
      realpath(targetPath),
    ]);
  } catch {
    throw new Error(`${field} cannot be resolved safely: ${relativePath}`);
  }
  if (
    realTargetPath === realPromptsRoot ||
    !realTargetPath.startsWith(`${realPromptsRoot}${path.sep}`)
  ) {
    throw new Error(`${field} resolves outside automations/: ${relativePath}`);
  }

  const content = await readFile(realTargetPath, 'utf8');
  assertNonemptyString(content, `resolved ${field} content`);
  return content.trim();
}

async function normalizeTask(rawTask, index, repoRoot) {
  const label = `automations[${index}]`;
  assertObject(rawTask, label);
  assertKnownKeys(rawTask, TASK_KEYS, label);

  assertNonemptyString(rawTask.id, `${label}.id`);
  if (!ID_PATTERN.test(rawTask.id)) {
    throw new Error(`${label}.id must use kebab-case.`);
  }
  assertNonemptyString(rawTask.name, `${label}.name`);
  if (typeof rawTask.enabled !== 'boolean') {
    throw new Error(`${label}.enabled must be true or false.`);
  }

  const hasInlinePrompt = rawTask.prompt !== undefined;
  const hasPromptFile = rawTask['prompt-file'] !== undefined;
  if (hasInlinePrompt === hasPromptFile) {
    throw new Error(`${label} must define exactly one of prompt or prompt-file.`);
  }
  let prompt;
  if (hasInlinePrompt) {
    assertNonemptyString(rawTask.prompt, `${label}.prompt`);
    prompt = rawTask.prompt.trim();
    const lineCount = prompt.split(/\r\n?|\n/u).length;
    if (lineCount > MAX_INLINE_PROMPT_LINES) {
      throw new Error(
        `${label}.prompt has ${lineCount} lines; inline prompts may contain at most ` +
          `${MAX_INLINE_PROMPT_LINES} lines. Use prompt-file under automations/.`,
      );
    }
  } else {
    prompt = await resolveAutomationTextFile(repoRoot, rawTask['prompt-file'], 'prompt-file');
  }

  if (rawTask['preflight-file'] !== undefined) {
    const preflight = await resolveAutomationTextFile(
      repoRoot,
      rawTask['preflight-file'],
      'preflight-file',
    );
    prompt = `${preflight}\n\n---\n\n${prompt}`;
  }

  if (rawTask.model !== undefined) {
    assertNonemptyString(rawTask.model, `${label}.model`);
  }
  if (rawTask.reasoning !== undefined && !REASONING_EFFORTS.has(rawTask.reasoning)) {
    throw new Error(`${label}.reasoning must be one of: ${[...REASONING_EFFORTS].join(', ')}.`);
  }
  if (rawTask.notification !== undefined && !NOTIFICATIONS.has(rawTask.notification)) {
    throw new Error(`${label}.notification must be one of: ${[...NOTIFICATIONS].join(', ')}.`);
  }

  let localProject = null;
  if (rawTask['local-project'] !== undefined) {
    assertObject(rawTask['local-project'], `${label}.local-project`);
    assertKnownKeys(rawTask['local-project'], PROJECT_KEYS, `${label}.local-project`);
    assertNonemptyString(rawTask['local-project'].path, `${label}.local-project.path`);
    if (!path.isAbsolute(rawTask['local-project'].path)) {
      throw new Error(`${label}.local-project.path must be absolute.`);
    }
    localProject = { path: path.normalize(rawTask['local-project'].path) };
  }

  let rrule;
  try {
    rrule = compileAutomationSchedule(rawTask.schedule);
  } catch (error) {
    throw new Error(`${label}.${error.message}`, { cause: error });
  }

  return {
    enabled: rawTask.enabled,
    id: rawTask.id,
    localProject,
    model: rawTask.model?.trim() ?? null,
    name: rawTask.name.trim(),
    notification: rawTask.notification ?? null,
    prompt,
    reasoning: rawTask.reasoning ?? null,
    rrule,
  };
}

/**
 * Parse and validate the repository automation manifest.
 *
 * Side effects: reads AUTOMATIONS.yaml and any declared prompt files.
 *
 * @param {object} [options] Manifest options.
 * @param {string} [options.manifestPath] Manifest path relative to the repository root.
 * @param {Function} [options.parseYaml] YAML parser override for tests.
 * @param {string} [options.repoRoot] Repository root.
 * @returns {Promise<{automations: object[], manifestPath: string, schemaVersion: number}>} Manifest.
 */
export async function loadAutomationManifest({
  manifestPath = 'AUTOMATIONS.yaml',
  parseYaml = globalThis.Bun?.YAML?.parse,
  repoRoot = process.cwd(),
} = {}) {
  const absoluteRepoRoot = path.resolve(repoRoot);
  const absoluteManifestPath = path.resolve(absoluteRepoRoot, manifestPath);
  if (
    absoluteManifestPath === absoluteRepoRoot ||
    !absoluteManifestPath.startsWith(`${absoluteRepoRoot}${path.sep}`)
  ) {
    throw new Error('automation manifest path must stay inside the repository root.');
  }

  if (typeof parseYaml !== 'function') {
    throw new Error('AUTOMATIONS.yaml validation requires Bun YAML support.');
  }

  let rawManifest;
  try {
    rawManifest = parseYaml(await readFile(absoluteManifestPath, 'utf8'));
  } catch (error) {
    throw new Error(`could not parse ${manifestPath}: ${error.message}`, { cause: error });
  }
  assertObject(rawManifest, 'automation manifest');
  assertKnownKeys(rawManifest, ROOT_KEYS, 'automation manifest');
  if (rawManifest['schema-version'] !== 1) {
    throw new Error('automation manifest schema-version must be 1.');
  }
  if (!Array.isArray(rawManifest.automations)) {
    throw new Error('automation manifest automations must be an array.');
  }

  const automations = [];
  const ids = new Set();
  for (const [index, rawTask] of rawManifest.automations.entries()) {
    const task = await normalizeTask(rawTask, index, absoluteRepoRoot);
    if (ids.has(task.id)) {
      throw new Error(`automation manifest contains duplicate id: ${task.id}`);
    }
    ids.add(task.id);
    automations.push(task);
  }

  return {
    automations,
    manifestPath: absoluteManifestPath,
    schemaVersion: 1,
  };
}
