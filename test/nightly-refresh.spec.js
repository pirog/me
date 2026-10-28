import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import nightlyRefresh from '../lib/nightly-refresh.js';

const git = (root, ...args) =>
  execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

describe('lib/nightly-refresh', () => {
  let home;
  let workspace;
  let now;
  let options;
  let request;

  beforeEach(async () => {
    home = await mkdtemp(path.join(os.tmpdir(), 'me-nightly-'));
    now = Date.parse('2026-10-28T06:00:00Z');
    workspace = path.join(home, 'tanaab', 'me');
    for (const name of ['openclaw-agent-system', 'canon', 'me']) {
      const root = path.join(home, 'tanaab', name);
      const remote = path.join(home, 'remotes', name);
      await mkdir(root, { recursive: true });
      git(root, 'init', '-b', 'main');
      git(root, 'config', 'user.name', 'Fixture');
      git(root, 'config', 'user.email', 'fixture@example.invalid');
      await writeFile(path.join(root, 'tracked'), 'before');
      git(root, '-c', 'commit.gpgsign=false', 'add', 'tracked');
      git(root, '-c', 'commit.gpgsign=false', 'commit', '-m', 'before');
      await mkdir(path.dirname(remote), { recursive: true });
      execFileSync('git', ['clone', '--bare', root, remote], { stdio: 'ignore' });
      const origin = `https://github.com/${name === 'me' ? 'pirog' : 'tanaabased'}/${name}.git`;
      git(root, 'remote', 'add', 'origin', origin);
      git(root, 'config', `url.${remote}.insteadOf`, origin);
      // Git's get-url expands insteadOf; the injected read below supplies the declared origin.
      git(root, 'config', 'fixture.origin', origin);
      await writeFile(path.join(root, 'tracked'), 'after');
      git(root, 'add', 'tracked');
      git(root, '-c', 'commit.gpgsign=false', 'commit', '-m', 'after');
      git(root, 'push', 'origin', 'main');
      git(root, 'reset', '--hard', 'HEAD~1');
    }
    const run = async (_command, args, { cwd }) => {
      try {
        return {
          code: 0,
          stdout:
            args.join(' ') === 'remote get-url origin'
              ? git(cwd, 'config', 'fixture.origin')
              : git(cwd, ...args),
          stderr: '',
        };
      } catch (error) {
        return {
          code: error.status,
          stdout: error.stdout ?? '',
          stderr: String(error.stderr ?? ''),
        };
      }
    };
    options = { home, now: () => now, run };
    request = {
      action: 'sources',
      workspace,
      instanceId: 'fixture-one',
      instanceName: 'fixture-mac',
      date: '2026-10-28',
      activity: { observedAt: now, activeThreads: [], exclusive: true },
    };
  });

  afterEach(async () => {
    await rm(home, { recursive: true, force: true });
  });

  it('should fast-forward exactly the three selected sources and retain before/after commits', async () => {
    const result = await nightlyRefresh(request, options);
    assert.equal(result.state.status, 'sources-ready');
    assert.ok(
      result.state.repositories.every(
        (repo) => repo.status === 'updated' && repo.before !== repo.after,
      ),
    );
    assert.match(result.report, /## ⚠️ NIGHTLY REFRESH/);
    assert.equal(await readFile(path.join(workspace, 'tracked'), 'utf8'), 'after');
  });

  it('should preserve untracked work and leave every source unchanged when the batch is dirty', async () => {
    await writeFile(path.join(workspace, 'scratch'), 'keep me');
    const result = await nightlyRefresh(request, options);
    assert.equal(result.state.status, 'deferred');
    for (const repo of result.state.repositories) {
      assert.equal(await readFile(path.join(repo.root, 'tracked'), 'utf8'), 'before');
    }
    assert.equal(await readFile(path.join(workspace, 'scratch'), 'utf8'), 'keep me');
  });

  it('should retain source progress under a renamed instance and require its readable name', async () => {
    await assert.rejects(
      nightlyRefresh({ ...request, instanceName: undefined }, options),
      /instanceName/,
    );
    const first = await nightlyRefresh(request, options);
    const renamed = await nightlyRefresh(
      { ...request, action: 'report', instanceName: 'renamed-mac' },
      options,
    );
    assert.equal(renamed.journal, first.journal);
    assert.deepEqual(renamed.state.repositories, first.state.repositories);
    assert.match(renamed.report, /\*\*instance:\*\* `renamed-mac`/);
    assert.doesNotMatch(renamed.report, /fixture-one|fixture-mac/);
  });

  it('should defer a task branch and unavailable exclusive-access evidence', async () => {
    git(workspace, 'checkout', '-b', 'task-work');
    assert.equal((await nightlyRefresh(request, options)).state.status, 'deferred');
    const noGate = {
      ...request,
      instanceId: 'fixture-two',
      activity: { ...request.activity, exclusive: false },
    };
    assert.equal((await nightlyRefresh(noGate, options)).state.attempts, 0);
  });

  it('should reject stale activity observations before executing Git', async () => {
    now += 31_000;
    const result = await nightlyRefresh(request, {
      ...options,
      run: () => {
        throw new Error('must not run');
      },
    });
    assert.equal(result.state.status, 'deferred');
  });

  it('should resume after an interruption without repeating a completed fast-forward', async () => {
    const run = options.run;
    let merges = 0;
    options.run = async (command, args, settings) => {
      if (args[0] === 'merge' && ++merges === 2) throw new Error('injected interruption');
      return run(command, args, settings);
    };
    await assert.rejects(nightlyRefresh(request, options), /injected interruption/);
    options.run = async (command, args, settings) => {
      if (args[0] === 'merge') merges += 1;
      return run(command, args, settings);
    };
    const result = await nightlyRefresh(request, options);
    assert.equal(result.state.status, 'sources-ready');
    assert.equal(merges, 4); // One completed, one interrupted before execution, two remaining.
    assert.equal(result.state.attempts, 2);
  });

  it('should retain transient retry state and obey backoff across invocations', async () => {
    const run = options.run;
    let fail = true;
    options.run = async (command, args, settings) => {
      if (args[0] === 'fetch' && fail) {
        fail = false;
        return { code: 128, stderr: 'Could not resolve host: fixture', stdout: '' };
      }
      return run(command, args, settings);
    };
    const first = await nightlyRefresh(request, options);
    assert.equal(first.state.status, 'retry');
    assert.equal(first.state.retryAt, now + 60_000);
    assert.equal((await nightlyRefresh(request, options)).state.attempts, 1);
    now += 60_000;
    request.activity.observedAt = now;
    const resumed = await nightlyRefresh(request, options);
    assert.equal(resumed.state.status, 'sources-ready');
    assert.equal(resumed.state.attempts, 2);
  });

  it('should retain denied access across later dates instead of treating it as transient', async () => {
    const run = options.run;
    options.run = async (command, args, settings) =>
      args[0] === 'fetch'
        ? { code: 128, stderr: 'Permission denied (publickey)', stdout: '' }
        : run(command, args, settings);
    assert.equal((await nightlyRefresh(request, options)).state.status, 'failed');
    const stale = await nightlyRefresh({ ...request, activity: undefined }, options);
    assert.equal(stale.state.status, 'failed');
    assert.match(stale.state.problem, /denied/);
    now += 86_400_000;
    request.date = '2026-10-29';
    request.activity.observedAt = now;
    const next = await nightlyRefresh(request, {
      ...options,
      run: () => {
        throw new Error('must not retry denial');
      },
    });
    assert.equal(next.state.status, 'failed');
    assert.equal(next.state.attempts, 1);
  });

  it('should serialize overlapping commands on the same source workspace', async () => {
    const run = options.run;
    let release;
    let entered;
    const started = new Promise((resolve) => {
      entered = resolve;
    });
    const waiting = new Promise((resolve) => {
      release = resolve;
    });
    const first = nightlyRefresh(request, {
      ...options,
      run: async (...args) => {
        entered();
        await waiting;
        return run(...args);
      },
    });
    await started;
    await assert.rejects(nightlyRefresh(request, options), /owns the lock/);
    release();
    await first;
  });

  it('should refuse lifecycle observations after the attempt deadline', async () => {
    await nightlyRefresh(request, options);
    now += 15 * 60_000;
    await assert.rejects(
      nightlyRefresh(
        {
          ...request,
          action: 'record',
          check: 'hooks',
          status: 'trusted',
          evidence: 'late readback',
        },
        options,
      ),
      /attempt expired/,
    );
  });

  it('should complete only with all lifecycle observations and report an unchanged next day', async () => {
    await nightlyRefresh(request, options);
    const checks = {
      'doctor-before': 'drift',
      install: 'applied',
      hooks: 'trusted',
      context: 'fresh',
      'doctor-after': 'healthy',
      automations: 'aligned',
      'cache-openclaw-agent-system': 'aligned',
      'cache-canon': 'aligned',
      'cache-me': 'aligned',
    };
    let result;
    for (const [check, status] of Object.entries(checks)) {
      result = await nightlyRefresh(
        { ...request, action: 'record', check, status, evidence: 'controlled fixture observation' },
        options,
      );
    }
    assert.equal(result.state.status, 'complete');
    assert.match(result.report, /## ✅ NIGHTLY REFRESH/);
    now += 86_400_000;
    const next = await nightlyRefresh(
      { ...request, date: '2026-10-29', activity: { ...request.activity, observedAt: now } },
      options,
    );
    assert.ok(next.state.repositories.every((repo) => repo.status === 'unchanged'));
    assert.deepEqual(next.state.checks, {});
    assert.match(next.report, /## ⚠️ NIGHTLY REFRESH/);
  });

  it('should isolate instance observations and never infer hook or setup health from source success', async () => {
    const first = await nightlyRefresh(request, options);
    const second = await nightlyRefresh(
      { ...request, action: 'report', instanceId: 'another-instance' },
      options,
    );
    assert.notEqual(first.journal, second.journal);
    assert.deepEqual(first.state.checks, {});
    await assert.rejects(
      nightlyRefresh(
        { ...request, action: 'record', check: 'hooks', status: 'trusted', evidence: '' },
        options,
      ),
      /observation/,
    );
    const recorded = await nightlyRefresh(
      {
        ...request,
        action: 'record',
        check: 'hooks',
        status: 'trusted',
        evidence: 'native CLI readback in controlled pilot',
      },
      options,
    );
    assert.equal(recorded.state.checks.hooks.status, 'trusted');
    assert.match(recorded.report, /## ⚠️ NIGHTLY REFRESH/);
  });

  it('should stop divergent source history without advancing any checkout', async () => {
    await writeFile(path.join(workspace, 'local'), 'local commit');
    git(workspace, 'add', 'local');
    git(workspace, '-c', 'commit.gpgsign=false', 'commit', '-m', 'local divergence');
    const result = await nightlyRefresh(request, options);
    assert.equal(result.state.status, 'failed');
    assert.ok(result.state.repositories.every((repo) => repo.after === undefined));
    assert.equal(await readFile(path.join(workspace, 'local'), 'utf8'), 'local commit');
  });

  it('should exhaust only the retained three-retry allowance', async () => {
    const run = options.run;
    options.run = async (command, args, settings) =>
      args[0] === 'fetch'
        ? { code: 128, stderr: 'Could not resolve host: fixture', stdout: '' }
        : run(command, args, settings);
    for (const delay of [60_000, 120_000, 240_000]) {
      assert.equal((await nightlyRefresh(request, options)).state.status, 'retry');
      now += delay;
      request.activity.observedAt = now;
    }
    const exhausted = await nightlyRefresh(request, options);
    assert.equal(exhausted.state.status, 'failed');
    assert.equal(exhausted.state.attempts, 4);
  });

  it('should require a current recovery preview and preserve completed source revisions', async () => {
    const first = await nightlyRefresh(request, options);
    await nightlyRefresh(
      {
        ...request,
        action: 'record',
        check: 'install',
        status: 'failed',
        evidence: 'deterministic build failure',
      },
      options,
    );
    const preview = await nightlyRefresh({ ...request, action: 'resume' }, options);
    await assert.rejects(
      nightlyRefresh(
        {
          ...request,
          action: 'resume',
          digest: 'stale',
          reason: 'operator resolved build failure',
        },
        options,
      ),
      /preview digest/,
    );
    const resumed = await nightlyRefresh(
      {
        ...request,
        action: 'resume',
        digest: preview.digest,
        reason: 'operator resolved build failure; native outcome reconciled',
      },
      options,
    );
    assert.deepEqual(resumed.state.repositories, first.state.repositories);
    assert.equal(resumed.state.checks.install.status, 'failed');
    assert.equal(resumed.state.attempts, 0);
  });
});
