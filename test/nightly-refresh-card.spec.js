import assert from 'node:assert/strict';

import nightlyRefreshCard from '../utils/nightly-refresh-card.js';

function state() {
  return {
    host: 'pilot-mac',
    date: '2026-10-28',
    attempts: 1,
    trigger: 'manual pilot',
    status: 'complete',
    repositories: ['openclaw-agent-system', 'canon', 'me'].map((name) => ({
      name,
      before: 'a'.repeat(40),
      after: 'b'.repeat(40),
      status: 'updated',
    })),
    checks: Object.fromEntries(
      Object.entries({
        'doctor-before': 'drift',
        install: 'applied',
        hooks: 'trusted',
        context: 'fresh',
        'doctor-after': 'healthy',
        automations: 'aligned',
        'cache-openclaw-agent-system': 'aligned',
        'cache-canon': 'aligned',
        'cache-me': 'aligned',
      }).map(([key, status]) => [key, { status }]),
    ),
  };
}

describe('utils/nightly-refresh-card', () => {
  it('should quote the entire report and show commits, caches and separate lifecycle evidence', () => {
    const report = nightlyRefreshCard(state());
    assert.ok(report.split('\n').every((line) => line.startsWith('>')));
    assert.match(report, /## ✅ NIGHTLY REFRESH/);
    assert.match(report, /\| me \| updated \| `aaaaaaaa` → `bbbbbbbb` \| aligned \|/);
    assert.match(report, /\*\*doctor · before:\*\* drift/);
    assert.match(report, /\*\*fresh context:\*\* fresh/);
  });

  it('should warn when caches match but fresh context is unverified', () => {
    const input = state();
    input.checks.context.status = 'unverified';
    assert.match(nightlyRefreshCard(input), /## ⚠️ NIGHTLY REFRESH/);
    assert.doesNotMatch(nightlyRefreshCard(input), /— ready/);
  });

  it('should show an error for a failed operation even if earlier checks passed', () => {
    const input = state();
    input.status = 'failed';
    input.problem = 'native approval denied';
    assert.match(nightlyRefreshCard(input), /## ❌ NIGHTLY REFRESH/);
    assert.match(nightlyRefreshCard(input), /native approval denied/);
  });

  it('should keep untrusted labels inside the table and quote block', () => {
    const input = state();
    input.host = 'mac\n# injected <img>';
    input.repositories[0].name = 'repo|fake';
    const report = nightlyRefreshCard(input);
    assert.match(report, /repo&#124;fake/);
    assert.doesNotMatch(report, /<img>/);
    assert.ok(report.split('\n').every((line) => line.startsWith('>')));
  });
});
