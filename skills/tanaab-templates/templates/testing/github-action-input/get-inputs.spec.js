import assert from 'node:assert/strict';

import core from '@actions/core';

import getInputs from '../utils/get-inputs.js';

describe('utils/get-inputs', () => {
  const originalGetInput = core.getInput;
  const originalGetBooleanInput = core.getBooleanInput;
  const originalGetMultilineInput = core.getMultilineInput;
  const originalGithubActions = process.env.GITHUB_ACTIONS;
  const originalGithubToken = process.env.GITHUB_TOKEN;

  let inputValues;
  let booleanValues;
  let multilineValues;

  beforeEach(() => {
    inputValues = new Map();
    booleanValues = new Map();
    multilineValues = new Map();

    core.getInput = (name) => inputValues.get(name) ?? '';
    core.getBooleanInput = (name) => booleanValues.get(name) ?? false;
    core.getMultilineInput = (name) => multilineValues.get(name) ?? [];
  });

  afterEach(() => {
    core.getInput = originalGetInput;
    core.getBooleanInput = originalGetBooleanInput;
    core.getMultilineInput = originalGetMultilineInput;

    if (originalGithubActions === undefined) {
      delete process.env.GITHUB_ACTIONS;
    } else {
      process.env.GITHUB_ACTIONS = originalGithubActions;
    }

    if (originalGithubToken === undefined) {
      delete process.env.GITHUB_TOKEN;
    } else {
      process.env.GITHUB_TOKEN = originalGithubToken;
    }
  });

  it('should use defaults when not running in GitHub Actions', () => {
    delete process.env.GITHUB_ACTIONS;
    process.env.GITHUB_TOKEN = 'token-from-env';

    inputValues.set('message', 'release ready');
    multilineValues.set('targets', ['dist', 'docs']);

    const result = getInputs();

    assert.equal(result.message, 'release ready');
    assert.equal(result.dryRun, false);
    assert.equal(result.root, process.cwd());
    assert.equal(result.token, 'token-from-env');
    assert.deepEqual(result.targets, ['dist', 'docs']);
  });

  it('should read explicit values in GitHub Actions', () => {
    process.env.GITHUB_ACTIONS = 'true';
    delete process.env.GITHUB_TOKEN;

    inputValues.set('message', 'ship it');
    inputValues.set('root', '/tmp/workspace');
    inputValues.set('token', 'token-from-input');
    booleanValues.set('dry-run', true);
    multilineValues.set('targets', ['dist', 'docs']);

    const result = getInputs();

    assert.equal(result.message, 'ship it');
    assert.equal(result.dryRun, true);
    assert.equal(result.root, '/tmp/workspace');
    assert.equal(result.token, 'token-from-input');
    assert.deepEqual(result.targets, ['dist', 'docs']);
  });
});
