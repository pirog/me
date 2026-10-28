const checks = [
  ['doctor-before', 'doctor · before'],
  ['install', 'install'],
  ['hooks', 'hook trust'],
  ['context', 'fresh context'],
  ['doctor-after', 'doctor · after'],
  ['automations', 'saved automations'],
];
const healthy = new Set(['healthy', 'applied', 'trusted', 'fresh', 'aligned']);

function text(value) {
  return String(value ?? 'not checked')
    .replace(/[\r\n]+/g, ' ')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '&#124;')
    .replace(/[\\`*_[\]]/g, '\\$&');
}

function commit(value) {
  return /^[a-f0-9]{40,64}$/.test(value ?? '') ? `\`${value.slice(0, 8)}\`` : '—';
}

/** Render recorded observations, never infer live readiness from a source or cache update. */
export default function nightlyRefreshCard(state) {
  const complete =
    state.status === 'complete' &&
    state.repositories.length === 3 &&
    state.repositories.every((repo) => ['updated', 'unchanged'].includes(repo.status)) &&
    checks.every(
      ([key]) =>
        healthy.has(state.checks[key]?.status) ||
        (key === 'doctor-before' && state.checks[key]?.status === 'drift'),
    ) &&
    state.repositories.every((repo) => state.checks[`cache-${repo.name}`]?.status === 'aligned');
  const failed =
    state.status === 'failed' ||
    Object.values(state.checks).some((check) => check.status === 'failed');
  const icon = failed ? '❌' : complete && !state.problem ? '✅' : '⚠️';
  const outcome = failed ? 'needs attention' : complete && !state.problem ? 'ready' : 'incomplete';
  const lines = [
    `## ${icon} NIGHTLY REFRESH`,
    '',
    `**${text(state.host)} · ${text(state.date)}** — ${outcome}`,
    '',
    '| repository | source | commit | Codex cache |',
    '| :-- | :-- | :-- | :-- |',
    ...state.repositories.map((repo) => {
      const revision =
        repo.before && repo.after && repo.before !== repo.after
          ? `${commit(repo.before)} → ${commit(repo.after)}`
          : commit(repo.after ?? repo.before);
      return `| ${text(repo.name)} | ${text(repo.status)} | ${revision} | ${text(state.checks[`cache-${repo.name}`]?.status)} |`;
    }),
    '',
    ...checks.map(([key, label]) => `- **${label}:** ${text(state.checks[key]?.status)}`),
    '',
    `**attempts:** ${state.attempts} of 4 · **trigger:** ${text(state.trigger)}`,
  ];
  if (state.problem) lines.push('', `**attention:** ${text(state.problem)}`);
  if (state.next) lines.push('', `**next:** ${text(state.next)}`);
  return lines.map((line) => (line ? `> ${line}` : '>')).join('\n');
}
