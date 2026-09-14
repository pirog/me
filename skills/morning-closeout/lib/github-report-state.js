import { createHash } from 'node:crypto';
import { mkdir, open, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { normalizeGithubCompletionState } from './github-completion-report.js';

export function defaultGithubReportStatePath() {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  if (!path.isAbsolute(codexHome)) {
    throw new Error('CODEX_HOME must be absolute when set');
  }
  return path.join(codexHome, 'state', 'piroplugin', 'morning-closeout.json');
}

export function githubReportDigest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export async function readGithubReportState(statePath = defaultGithubReportStatePath()) {
  let content;
  try {
    content = await readFile(statePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }

  let value;
  try {
    value = JSON.parse(content);
  } catch {
    const error = new Error(`Morning Closeout state is not valid JSON: ${statePath}`);
    error.code = 'INVALID_STATE';
    throw error;
  }
  return normalizeGithubCompletionState(value);
}

export async function commitGithubReportState({
  expectedStateDigest,
  nextState,
  statePath = defaultGithubReportStatePath(),
}) {
  const directory = path.dirname(statePath);
  const lockPath = `${statePath}.lock`;
  const temporaryPath = `${statePath}.${process.pid}.${Date.now()}.tmp`;
  await mkdir(directory, { mode: 0o700, recursive: true });

  let lock;
  try {
    lock = await open(lockPath, 'wx', 0o600);
  } catch (error) {
    if (error.code === 'EEXIST') {
      const lockError = new Error(`Morning Closeout state is locked: ${statePath}`);
      lockError.code = 'STATE_LOCKED';
      throw lockError;
    }
    throw error;
  }

  try {
    const currentState = await readGithubReportState(statePath);
    if (githubReportDigest(currentState) !== expectedStateDigest) {
      const error = new Error('Morning Closeout state changed after the report was planned');
      error.code = 'STALE_STATE';
      throw error;
    }
    const normalizedState = normalizeGithubCompletionState(nextState);
    await writeFile(temporaryPath, `${JSON.stringify(normalizedState, null, 2)}\n`, {
      encoding: 'utf8',
      mode: 0o600,
    });
    await rename(temporaryPath, statePath);
    return normalizedState;
  } finally {
    await lock.close();
    await unlink(lockPath).catch((error) => {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    });
    await unlink(temporaryPath).catch((error) => {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    });
  }
}
