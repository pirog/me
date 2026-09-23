import { lstat, readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { parseManagedAutomationPrompt } from '../../../utils/managed-automation-prompt.js';

const FIELD_NAMES = {
  id: 'id',
  name: 'name',
  kind: 'kind',
  prompt: 'prompt',
  status: 'status',
  rrule: 'rrule',
  model: 'model',
  reasoning_effort: 'reasoningEffort',
  execution_environment: 'executionEnvironment',
  notification_policy: 'notificationPolicy',
  target_thread_id: 'targetThreadId',
};
const METADATA = ['version', 'target', 'cwds', 'created_at', 'updated_at'];

async function readToml(filePath) {
  const stat = await lstat(filePath);
  if (!stat.isFile()) throw new Error(`expected a regular saved file: ${filePath}`);
  return globalThis.Bun.TOML.parse(await readFile(filePath, 'utf8'));
}

function normalize(saved, id) {
  if (typeof saved.prompt !== 'string') throw new Error(`automation ${id} has no prompt.`);
  const marker = parseManagedAutomationPrompt(saved.prompt);
  if (marker.malformed) throw new Error(`automation ${id} has a malformed ownership marker.`);
  if (!marker.managed) return { id, prompt: saved.prompt };
  const heartbeat = saved.kind === 'heartbeat';
  const supportedTarget = heartbeat
    ? typeof saved.target_thread_id === 'string' &&
      !!saved.target_thread_id.trim() &&
      ['execution_environment', 'target', 'cwds', 'model', 'reasoning_effort'].every(
        (key) => saved[key] === undefined,
      )
    : saved.kind === 'cron' &&
      saved.target_thread_id === undefined &&
      saved.execution_environment === 'local' &&
      saved.target?.type === 'projectless' &&
      Object.keys(saved.target).length === 1 &&
      JSON.stringify(saved.cwds) === '["~"]';
  if (
    Object.keys(saved).some((key) => !Object.hasOwn(FIELD_NAMES, key) && !METADATA.includes(key)) ||
    saved.version !== 1 ||
    saved.id !== id ||
    !supportedTarget
  ) {
    throw new Error(
      `automation ${id} has unsupported saved settings; expected a v1 thread heartbeat or local projectless cron task.`,
    );
  }
  if (
    ['name', 'rrule'].some((key) => typeof saved[key] !== 'string' || !saved[key].trim()) ||
    !['ACTIVE', 'PAUSED'].includes(saved.status) ||
    (saved.model !== undefined && (typeof saved.model !== 'string' || !saved.model.trim())) ||
    (saved.reasoning_effort !== undefined &&
      !['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra'].includes(
        saved.reasoning_effort,
      )) ||
    (saved.notification_policy !== undefined && saved.notification_policy !== 'failed_runs_only')
  ) {
    throw new Error(`automation ${id} has invalid saved settings.`);
  }
  return {
    ...Object.fromEntries(
      Object.entries(FIELD_NAMES).map(([savedName, nativeName]) => [
        nativeName,
        saved[savedName] ?? null,
      ]),
    ),
    destination: heartbeat ? 'thread' : 'local',
    projectId: null,
  };
}

/** Read saved settings for the planner. Native tools own writes; files do not prove execution. */
export async function readAutomationState({
  codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex'),
} = {}) {
  const automationsRoot = path.join(codexHome, 'automations');
  if (!(await lstat(automationsRoot)).isDirectory()) {
    throw new Error(`expected a regular automation directory: ${automationsRoot}`);
  }
  const actualTasks = [];
  for (const entry of await readdir(automationsRoot, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`symlink in automation directory: ${entry.name}`);
    if (!entry.isDirectory()) continue;
    let saved;
    try {
      saved = await readToml(path.join(automationsRoot, entry.name, 'automation.toml'));
    } catch (error) {
      // Native deletion can leave a directory containing only run memory.
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    actualTasks.push(normalize(saved, entry.name));
  }
  const config = await readToml(path.join(codexHome, 'config.toml'));
  if (
    ['model', 'model_reasoning_effort'].some(
      (key) => typeof config[key] !== 'string' || !config[key].trim(),
    )
  ) {
    throw new Error('effective Codex config needs model and model_reasoning_effort defaults.');
  }
  return {
    actualTasks,
    defaults: { model: config.model, reasoningEffort: config.model_reasoning_effort },
  };
}
