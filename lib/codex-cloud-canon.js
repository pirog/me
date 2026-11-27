import { spawn } from 'node:child_process';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { isDeepStrictEqual } from 'node:util';

const cloudPluginPath = ['plugins', 'cache', 'created-by-me-remote', 'tanaab'];
const canonRepository = 'https://github.com/tanaabased/canon';

function within(directory, entry) {
  const relative = path.relative(directory, entry);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`);
}

async function readPackageJson(file) {
  if (file !== (await realpath(file))) throw new Error('Cloud Canon metadata uses a symlink.');
  return JSON.parse(await readFile(file, 'utf8'));
}

async function discoverCloudCanonSkills(codexHome) {
  const cache = path.join(codexHome, ...cloudPluginPath);
  if (cache !== (await realpath(cache))) throw new Error('Cloud Canon cache uses a symlink.');
  const receipt = await readPackageJson(path.join(cache, '.codex-remote-plugin-install.json'));
  if (
    receipt.schema_version !== 1 ||
    typeof receipt.remote_plugin_id !== 'string' ||
    !receipt.remote_plugin_id.trim()
  ) {
    throw new Error('Cloud Canon has no verified remote-install receipt.');
  }

  const versions = (await readdir(cache, { withFileTypes: true })).filter(
    (entry) => !entry.name.startsWith('.') && (entry.isDirectory() || entry.isSymbolicLink()),
  );
  if (versions.length !== 1 || !versions[0].isDirectory()) {
    throw new Error('Expected exactly one materialized Cloud Canon release.');
  }

  const version = versions[0].name;
  const release = path.join(cache, version);
  const manifest = await readPackageJson(path.join(release, '.codex-plugin', 'plugin.json'));
  if (
    manifest.name !== 'tanaab' ||
    manifest.repository !== canonRepository ||
    manifest.version !== version
  ) {
    throw new Error('The Cloud Canon release does not match the Canon manifest.');
  }

  const skills = path.resolve(release, manifest.skills ?? 'skills');
  if (!within(release, skills) || skills !== (await realpath(skills))) {
    throw new Error('The Cloud Canon skill directory is outside the verified release.');
  }
  const files = [];
  for await (const file of new globalThis.Bun.Glob('**/SKILL.md').scan({
    cwd: skills,
    absolute: true,
  })) {
    if (!(await lstat(file)).isFile() || file !== (await realpath(file))) {
      throw new Error('The Cloud Canon inventory contains a linked skill.');
    }
    files.push(file);
  }
  if (!files.length) throw new Error('The verified Cloud Canon release has no skills.');
  return files.sort();
}

function disableSkills(rules, skillPaths) {
  const selected = new Set(skillPaths);
  const existing = new Map();
  const unrelated = rules.filter((rule) => {
    if (rule.name !== undefined || !selected.has(rule.path)) return true;
    existing.set(rule.path, rule);
    return false;
  });
  return [
    ...unrelated,
    ...skillPaths.map((file) => ({ ...existing.get(file), path: file, enabled: false })),
  ];
}

export function preserveCloudCanonSkillExclusions(requiredConfig, installedConfig, codexHome) {
  const requiredRules = requiredConfig.skills?.config;
  const installedRules = installedConfig.skills?.config;
  if (!Array.isArray(requiredRules) || !Array.isArray(installedRules)) return requiredConfig;

  const cache = path.join(codexHome, ...cloudPluginPath);
  const exclusions = installedRules.filter(
    (rule) =>
      rule?.enabled === false &&
      rule.name === undefined &&
      typeof rule.path === 'string' &&
      path.isAbsolute(rule.path) &&
      path.basename(rule.path) === 'SKILL.md' &&
      within(cache, rule.path),
  );
  if (!exclusions.length) return requiredConfig;

  // Me's local fragment replaces arrays. carry the scheduled exclusions into its replacement.
  return {
    ...requiredConfig,
    skills: {
      ...requiredConfig.skills,
      config: disableSkills(requiredRules, [...new Set(exclusions.map((rule) => rule.path))]),
    },
  };
}

async function withAppServer(codexHome, use) {
  const server = spawn('codex', ['app-server', '--stdio', '--disable', 'remote_plugin'], {
    env: { ...process.env, CODEX_HOME: codexHome },
    stdio: ['pipe', 'pipe', 'ignore'],
    signal: AbortSignal.timeout(15_000),
  });
  let serverError;
  server.on('error', (error) => {
    serverError = error;
  });
  server.stdin.on('error', (error) => {
    serverError = error;
  });
  const closed = new Promise((resolve) => server.once('close', resolve));
  const lines = createInterface({ input: server.stdout })[Symbol.asyncIterator]();
  let id = 0;
  const call = async (method, params) => {
    const requestId = id++;
    await new Promise((resolve, reject) => {
      server.stdin.write(`${JSON.stringify({ id: requestId, method, params })}\n`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    for (let next = await lines.next(); !next.done; next = await lines.next()) {
      const message = JSON.parse(next.value);
      if (message.id !== requestId) continue;
      if (message.error) throw new Error(`Codex rejected ${method} (code ${message.error.code}).`);
      return message.result;
    }
    throw new Error(
      `Codex App Server stopped during ${method} (${serverError?.code ?? 'no response'}).`,
    );
  };

  try {
    await call('initialize', { clientInfo: { name: 'me-cloud-canon', version: '1' } });
    server.stdin.write('{"method":"initialized"}\n');
    return await use(call);
  } finally {
    server.stdin.end();
    await closed;
  }
}

export async function reconcileCloudCanonSkills(home, connect = withAppServer) {
  const codexHome = await realpath(home);
  const configPath = path.join(codexHome, 'config.toml');
  if (!(await lstat(configPath)).isFile())
    throw new Error('Codex config.toml is not a regular file.');
  const skillPaths = await discoverCloudCanonSkills(codexHome);

  return connect(codexHome, async (call) => {
    const read = async () => {
      const { layers } = await call('config/read', { includeLayers: true });
      const user = layers?.find(
        (layer) => layer.name.type === 'user' && layer.name.file === configPath,
      );
      if (!user?.version || user.disabledReason)
        throw new Error('Could not verify the local Codex config layer.');
      return user;
    };
    const { config, version } = await read();
    const current = config.skills?.config ?? [];
    const desired = disableSkills(current, skillPaths);
    if (!isDeepStrictEqual(skillPaths, await discoverCloudCanonSkills(codexHome))) {
      throw new Error('Cloud Canon changed during reconciliation.');
    }
    if (isDeepStrictEqual(desired, current))
      return { status: 'unchanged', skills: skillPaths.length };

    const receipt = await call('config/batchWrite', {
      edits: [{ keyPath: 'skills.config', value: desired, mergeStrategy: 'replace' }],
      expectedVersion: version,
    });
    const saved = await read();
    const expected = { ...config, skills: { ...config.skills, config: desired } };
    if (
      receipt.filePath !== configPath ||
      saved.version !== receipt.version ||
      !isDeepStrictEqual(saved.config, expected)
    ) {
      throw new Error(
        'Could not verify the saved Canon skill exclusions and preserved Codex settings.',
      );
    }
    return { status: 'updated', skills: skillPaths.length };
  });
}
