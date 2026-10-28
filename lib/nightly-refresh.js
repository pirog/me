import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import {
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  rmdir,
  unlink,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import isExpectedPluginOrigin from '../utils/is-expected-plugin-origin.js';
import nightlyRefreshCard from '../utils/nightly-refresh-card.js';

const ATTEMPT_MS = 15 * 60_000;
const BACKOFF_MS = [60_000, 120_000, 240_000];
const WINDOW_MS = 4 * ATTEMPT_MS + BACKOFF_MS.reduce((sum, value) => sum + value, 0);
const REPOSITORIES = ['openclaw-agent-system', 'canon', 'me'];
const CHECKS = {
  'doctor-before': ['healthy', 'drift', 'blocked'],
  install: ['healthy', 'applied', 'failed'],
  hooks: ['trusted', 'review-required', 'failed'],
  context: ['fresh', 'unverified', 'failed'],
  'doctor-after': ['healthy', 'drift', 'blocked'],
  automations: ['aligned', 'drift', 'blocked'],
  ...Object.fromEntries(
    REPOSITORIES.map((repo) => [`cache-${repo}`, ['aligned', 'drift', 'blocked']]),
  ),
};

class RefreshError extends Error {
  constructor(code, message, transient = false) {
    super(message);
    this.code = code;
    this.transient = transient;
  }
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function readJson(file) {
  try {
    if (!(await lstat(file)).isFile()) throw new Error('Expected a regular state file.');
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

async function saveJson(file, value) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
  await rename(temporary, file);
}

/** Bound subprocess time and capture; never persist raw provider output in the journal. */
async function execute(command, args, { cwd, timeoutMs }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(
      () => {
        timedOut = true;
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch {
          /* already exited */
        }
      },
      Math.max(1, timeoutMs),
    );
    child.stdout.on('data', (chunk) => {
      stdout = (stdout + chunk).slice(-65536);
    });
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk).slice(-65536);
    });
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });
  });
}

function alive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return true;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code !== 'ESRCH';
  }
}

async function withLock(directory, action) {
  const lock = `${directory}.lock`;
  try {
    await mkdir(lock, { mode: 0o700 });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    // No time-based stealing: an incomplete or live owner record requires inspection.
    const owner = await readJson(path.join(lock, 'owner.json'));
    if (!owner || alive(owner.pid))
      throw new RefreshError('busy', 'another maintenance command owns the lock');
    throw new RefreshError(
      'interrupted-lock',
      'an interrupted command left a lock; verify its child processes before removing only this maintenance lock',
    );
  }
  try {
    await saveJson(path.join(lock, 'owner.json'), { pid: process.pid });
    return await action();
  } finally {
    await unlink(path.join(lock, 'owner.json'));
    await rmdir(lock);
  }
}

function validateActivity(activity, now) {
  if (
    !activity ||
    !Number.isFinite(activity.observedAt) ||
    activity.observedAt > now ||
    now - activity.observedAt > 30_000 ||
    !Array.isArray(activity.activeThreads) ||
    activity.activeThreads.length ||
    activity.exclusive !== true
  ) {
    throw new RefreshError(
      'work-active',
      'exclusive maintenance access has not been established; leave active work and shared caches alone',
    );
  }
}

async function sources(state, request, context) {
  const { run, now, save } = context;
  if (state.status === 'failed') return state;
  validateActivity(request.activity, now());
  if (state.repositories.every((repo) => ['updated', 'unchanged'].includes(repo.status)))
    return state;
  if (state.retryAt && now() < state.retryAt) return state;
  if (now() >= state.deadline || state.attempts >= 4) {
    throw new RefreshError('budget-exhausted', 'the overnight retry budget is exhausted');
  }
  state.attempts += 1;
  state.attemptDeadline = Math.min(now() + ATTEMPT_MS, state.deadline);
  delete state.retryAt;
  delete state.problem;
  delete state.next;
  await save();
  const git = async (repo, args, fetch = false) => {
    if (now() >= state.attemptDeadline)
      throw new RefreshError('attempt-timeout', 'the 15-minute attempt limit was reached');
    const result = await run('git', args, {
      cwd: repo.root,
      timeoutMs: state.attemptDeadline - now(),
    });
    if (result.code !== 0 || result.timedOut) {
      const diagnostic = result.stderr ?? '';
      const denied = /permission|denied|authentication|credential|publickey|401|403/i.test(
        diagnostic,
      );
      const transient =
        fetch &&
        !denied &&
        !result.timedOut &&
        /could not resolve host|connection (?:timed out|reset)|temporary failure|unable to access.*(?:502|503|504)/i.test(
          diagnostic,
        );
      throw new RefreshError(
        result.timedOut ? 'attempt-timeout' : denied ? 'access-denied' : 'git-failed',
        `${repo.name}: ${result.timedOut ? 'command timed out' : denied ? 'access was denied' : transient ? 'temporary fetch failure' : 'Git operation failed'}`,
        transient,
      );
    }
    return result.stdout.trim();
  };
  const inspect = async (repo) => {
    const origin = await git(repo, ['remote', 'get-url', 'origin']);
    if (!isExpectedPluginOrigin(origin, repo.name))
      throw new RefreshError('origin-mismatch', `${repo.name}: unexpected origin`);
    if ((await git(repo, ['symbolic-ref', '--short', 'HEAD'])) !== 'main')
      throw new RefreshError('task-branch', `${repo.name}: checkout is not on main`);
    if (await git(repo, ['status', '--porcelain=v1', '--untracked-files=all']))
      throw new RefreshError('dirty-checkout', `${repo.name}: checkout has local work`);
    for (const marker of [
      'MERGE_HEAD',
      'CHERRY_PICK_HEAD',
      'REVERT_HEAD',
      'rebase-merge',
      'rebase-apply',
    ]) {
      const location = await git(repo, ['rev-parse', '--git-path', marker]);
      try {
        await lstat(path.resolve(repo.root, location));
      } catch (error) {
        if (error.code === 'ENOENT') continue;
        throw error;
      }
      throw new RefreshError(
        'git-in-progress',
        `${repo.name}: an unfinished Git operation needs attention`,
      );
    }
    const head = await git(repo, ['rev-parse', 'HEAD']);
    if (!/^[a-f0-9]{40,64}$/.test(head))
      throw new RefreshError('invalid-revision', `${repo.name}: invalid commit`);
    if (repo.before && ![repo.before, repo.target].includes(head))
      throw new RefreshError('source-changed', `${repo.name}: checkout changed during maintenance`);
    return head;
  };
  // Inspect the entire batch before advancing any checkout.
  for (const repo of state.repositories) {
    const head = await inspect(repo);
    repo.before ??= head;
    if (!repo.target) {
      await git(repo, ['fetch', '--no-tags', 'origin', 'refs/heads/main'], true);
      repo.target = await git(repo, ['rev-parse', 'FETCH_HEAD']);
      if (!/^[a-f0-9]{40,64}$/.test(repo.target))
        throw new RefreshError('invalid-revision', `${repo.name}: invalid fetched commit`);
    }
    await git(repo, ['merge-base', '--is-ancestor', head, repo.target]);
    await save();
  }
  for (const repo of state.repositories) {
    const head = await inspect(repo);
    if (head !== repo.target) await git(repo, ['merge', '--ff-only', '--no-edit', repo.target]);
    repo.after = await git(repo, ['rev-parse', 'HEAD']);
    if (repo.after !== repo.target)
      throw new RefreshError('source-changed', `${repo.name}: commit readback diverged`);
    repo.status = repo.after === repo.before ? 'unchanged' : 'updated';
    await save();
  }
  state.status = 'sources-ready';
  state.next =
    'continue the recorded doctor → install → trust/context → doctor and automation checks through their owning native skills';
  return state;
}

/**
 * Coordinate one instance's retained source refresh and externally verified lifecycle observations.
 * The caller supplies workspace/instance from trusted binding and an exclusive-access observation.
 * Native setup, hook trust, context refresh and scheduler writes remain with their owning skills.
 */
export default async function nightlyRefresh(request, options = {}) {
  const now = options.now ?? Date.now;
  const home = options.home ?? os.homedir();
  if (
    !request ||
    !['sources', 'record', 'report', 'resume'].includes(request.action) ||
    typeof request.workspace !== 'string' ||
    typeof request.instanceId !== 'string' ||
    !request.instanceId ||
    typeof request.instanceName !== 'string' ||
    !request.instanceName.trim() ||
    request.instanceName.length > 128 ||
    /[\r\n\0]/.test(request.instanceName) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(request.date ?? '')
  ) {
    throw new Error(
      'Expected action, bound workspace, installation instanceId and instanceName, and occurrence date.',
    );
  }
  const workspace = await realpath(request.workspace);
  const roots = REPOSITORIES.map((name) => ({
    name,
    root: name === 'me' ? workspace : path.join(home, 'tanaab', name),
  }));
  const base =
    options.stateRoot ?? path.join(home, '.local', 'state', 'piroplugin', 'nightly-refresh');
  await mkdir(base, { recursive: true, mode: 0o700 });
  const directory = path.join(base, digest(workspace));
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, `${digest(request.instanceId)}.json`);
  return withLock(directory, async () => {
    let state = await readJson(file);
    if (
      state &&
      (state.version !== 1 ||
        state.workspace !== workspace ||
        state.instanceId !== request.instanceId ||
        !Array.isArray(state.repositories) ||
        state.repositories.length !== roots.length ||
        state.repositories.some(
          (repo, index) => repo.name !== roots[index].name || repo.root !== roots[index].root,
        ) ||
        !state.checks ||
        !Number.isFinite(state.deadline) ||
        !Number.isInteger(state.attempts) ||
        state.attempts < 0 ||
        state.attempts > 4)
    ) {
      throw new Error('Maintenance journal is invalid; preserve it for inspection.');
    }
    if (
      !state ||
      (state.date !== request.date && ['complete', 'deferred'].includes(state.status))
    ) {
      state = {
        version: 1,
        workspace,
        instanceId: request.instanceId,
        instanceName: request.instanceName,
        date: request.date,
        trigger: request.trigger === 'scheduled' ? 'scheduled' : 'manual pilot',
        startedAt: now(),
        deadline: now() + WINDOW_MS,
        attempts: 0,
        status: 'pending',
        repositories: roots.map((repo) => ({ ...repo, status: 'pending' })),
        checks: {},
      };
    }
    // A readable-name change does not change journal ownership or erase progress.
    state.instanceName = request.instanceName;
    delete state.host;
    const save = () => saveJson(file, state);
    if (request.action === 'resume') {
      const previewDigest = digest(JSON.stringify(state));
      if (!request.digest)
        return {
          status: 'resume-preview',
          digest: previewDigest,
          state,
          report: nightlyRefreshCard(state),
        };
      if (
        request.digest !== previewDigest ||
        typeof request.reason !== 'string' ||
        !request.reason.trim() ||
        request.reason.length > 1000
      ) {
        throw new Error(
          'Resume requires the current preview digest and the operator-authorized recovery reason.',
        );
      }
      state.recovery = {
        at: now(),
        reason: request.reason,
        previousDate: state.date,
        previousProblem: state.problem,
      };
      state.date = request.date;
      state.deadline = now() + WINDOW_MS;
      state.attemptDeadline = now() + ATTEMPT_MS;
      state.attempts = 0;
      state.status = state.repositories.every((repo) =>
        ['updated', 'unchanged'].includes(repo.status),
      )
        ? 'checking'
        : 'pending';
      delete state.problem;
      delete state.next;
      delete state.retryAt;
      await save();
    }
    if (request.action === 'sources') {
      try {
        await sources(state, request, { run: options.run ?? execute, now, save });
      } catch (error) {
        if (!(error instanceof RefreshError)) throw error;
        state.problem = error.message;
        if (
          error.transient &&
          state.attempts < 4 &&
          now() + BACKOFF_MS[state.attempts - 1] < state.deadline
        ) {
          state.status = 'retry';
          state.retryAt = now() + BACKOFF_MS[state.attempts - 1];
          state.next = 'retry the same occurrence after retryAt; keep completed progress';
        } else {
          state.status = [
            'work-active',
            'dirty-checkout',
            'task-branch',
            'git-in-progress',
          ].includes(error.code)
            ? 'deferred'
            : 'failed';
          state.next =
            'resolve the reported condition before the next authorized attempt; never force, stash, reset, or bypass a denial';
        }
      }
      await save();
    }
    if (request.action === 'record') {
      const { check, status, evidence } = request;
      if (
        !CHECKS[check]?.includes(status) ||
        typeof evidence !== 'string' ||
        !evidence.trim() ||
        evidence.length > 1000
      ) {
        throw new Error('Expected a supported check/status and bounded, redacted observation.');
      }
      if (!['sources-ready', 'checking', 'complete'].includes(state.status))
        throw new Error('Source refresh must finish before recording lifecycle checks.');
      if (now() >= Math.min(state.deadline, state.attemptDeadline ?? state.deadline))
        throw new Error('Maintenance attempt expired; preserve partial observations.');
      state.checks[check] = { status, evidence, observedAt: now() };
      state.status = 'checking';
      if (status === 'failed' || status === 'blocked') {
        state.status = 'failed';
        state.problem = `${check}: ${status}`;
        state.next =
          'inspect the owning operation and its retained receipt; do not repeat a denied or uncertain write';
      } else if (
        Object.keys(CHECKS).every(
          (key) =>
            (!state.recovery || state.checks[key]?.observedAt >= state.recovery.at) &&
            (['healthy', 'applied', 'trusted', 'fresh', 'aligned'].includes(
              state.checks[key]?.status,
            ) ||
              (key === 'doctor-before' && state.checks[key]?.status === 'drift')),
        )
      ) {
        state.status = 'complete';
        delete state.next;
      }
      await save();
    }
    return {
      state,
      report: nightlyRefreshCard(state),
      journal: file,
      remainingMs: Math.max(
        0,
        Math.min(state.deadline, state.attemptDeadline ?? state.deadline) - now(),
      ),
    };
  });
}
