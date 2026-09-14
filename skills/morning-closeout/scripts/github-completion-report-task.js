import process from 'node:process';

import {
  buildGithubCompletionReport,
  githubCompletionWindow,
} from '../lib/github-completion-report.js';
import {
  commitGithubReportState,
  defaultGithubReportStatePath,
  githubReportDigest,
  readGithubReportState,
} from '../lib/github-report-state.js';

async function readStandardInput() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const content = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(content);
}

function writeJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const mode = process.argv[2];
  if (!['commit', 'plan', 'window'].includes(mode)) {
    throw new Error('Usage: bun github-completion-report-task.js <window|plan|commit>');
  }

  const input = await readStandardInput();
  const statePath = defaultGithubReportStatePath();
  const previousState = await readGithubReportState(statePath);
  if (mode === 'window') {
    writeJson({
      stateDigest: githubReportDigest(previousState),
      window: githubCompletionWindow(input, previousState),
    });
    return;
  }
  const result = buildGithubCompletionReport(input, previousState);
  const planDigest = githubReportDigest(result);

  if (mode === 'plan') {
    writeJson({ ...result, planDigest });
    return;
  }

  if (input.expectedPlanDigest !== planDigest) {
    const error = new Error('Morning Closeout report plan digest does not match');
    error.code = 'STALE_PLAN';
    throw error;
  }

  const committedState = await commitGithubReportState({
    expectedStateDigest: githubReportDigest(previousState),
    nextState: result.nextState,
    statePath,
  });
  writeJson({ committedCutoff: committedState.cutoff, planDigest, report: result.report });
}

main().catch((error) => {
  process.stderr.write(`${error.code ? `${error.code}: ` : ''}${error.message}\n`);
  process.exitCode = 1;
});
