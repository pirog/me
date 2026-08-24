import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { lstat, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..', '..');
const INIT_SKILL_PATH = path.join(REPO_ROOT, 'skills', 'skill-author', 'scripts', 'init-skill.js');
const VALIDATE_SKILL_PATH = path.join(
  REPO_ROOT,
  'skills',
  'skill-author',
  'scripts',
  'validate-skill.js',
);
const BUN_EXECUTABLE = process.versions.bun ? process.execPath : 'bun';
const DEFAULT_EMOJI_BY_TYPE = new Map([
  ['generic', '🧩'],
  ['coding', '💻'],
  ['integration', '🔌'],
  ['workflow', '🔁'],
  ['meta', '🛠️'],
]);

async function createGeneratedSkill({
  emoji,
  homepage,
  pluginRepository,
  sharedPluginAssets = false,
  slug = 'openclaw-probe',
  type = 'generic',
} = {}) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'piro-skill-author-'));
  const outputDir = path.join(tempRoot, 'skills');
  await mkdir(outputDir, { recursive: true });

  if (pluginRepository) {
    const manifestDir = path.join(tempRoot, '.codex-plugin');
    await mkdir(manifestDir, { recursive: true });
    await writeFile(
      path.join(manifestDir, 'plugin.json'),
      `${JSON.stringify({ repository: pluginRepository }, null, 2)}\n`,
      'utf8',
    );

    if (sharedPluginAssets) {
      const assetsDir = path.join(tempRoot, 'assets');
      await mkdir(assetsDir, { recursive: true });
      await Promise.all([
        writeFile(path.join(assetsDir, 'composer-icon.svg'), '<svg/>\n', 'utf8'),
        writeFile(path.join(assetsDir, 'icon-large.png'), 'shared icon\n'),
      ]);
    }
  }

  const args = [
    INIT_SKILL_PATH,
    '--type',
    type,
    '--slug',
    slug,
    '--display-name',
    'OpenClaw Probe',
    '--description',
    'generate and validate an OpenClaw-compatible skill',
    '--output-dir',
    outputDir,
  ];
  if (emoji) {
    args.push('--openclaw-emoji', emoji);
  }
  if (homepage) {
    args.push('--openclaw-homepage', homepage);
  }

  await execFileAsync(BUN_EXECUTABLE, args, {
    cwd: REPO_ROOT,
    maxBuffer: 1024 * 1024,
  });

  const folderName = pluginRepository ? slug : `piro-${slug}`;
  return {
    skillDir: path.join(outputDir, folderName),
    tempRoot,
  };
}

async function readGeneratedOpenClawMetadata(skillDir) {
  const skillContent = await readFile(path.join(skillDir, 'SKILL.md'), 'utf8');
  const openClawStart = skillContent.indexOf('  openclaw:\n');
  assert.notEqual(openClawStart, -1);
  const openClawLines = skillContent.slice(openClawStart).split('\n').slice(1);
  const metadata = {};

  for (const line of openClawLines) {
    if (!line.startsWith('    ')) {
      break;
    }

    const match = line.match(/^ {4}([A-Za-z][A-Za-z0-9_-]*):(?:\s+(.+))?$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    metadata[key] = rawValue ? JSON.parse(rawValue) : {};
  }

  return metadata;
}

async function validateGeneratedSkill(skillDir, type) {
  try {
    const { stdout, stderr } = await execFileAsync(
      BUN_EXECUTABLE,
      [VALIDATE_SKILL_PATH, '--skill-dir', skillDir, '--type', type],
      { cwd: REPO_ROOT, maxBuffer: 1024 * 1024 },
    );
    return { exitCode: 0, output: `${stdout}${stderr}` };
  } catch (error) {
    return {
      exitCode: Number(error.code) || 1,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

describe('skills/skill-author scaffolding', () => {
  const tempRoots = [];

  afterEach(async () => {
    await Promise.all(tempRoots.splice(0).map((tempRoot) => rm(tempRoot, { recursive: true })));
  });

  it('should generate OpenClaw presentation metadata for every canonical skill type', async () => {
    for (const [type, expectedEmoji] of DEFAULT_EMOJI_BY_TYPE) {
      const generated = await createGeneratedSkill({ slug: `${type}-probe`, type });
      tempRoots.push(generated.tempRoot);
      const openClaw = await readGeneratedOpenClawMetadata(generated.skillDir);
      const skillContent = await readFile(path.join(generated.skillDir, 'SKILL.md'), 'utf8');

      assert.equal(openClaw.emoji, expectedEmoji);
      assert.equal(openClaw.homepage, undefined);
      assert.equal(openClaw.requires, undefined);
      assert.match(skillContent, /\n## Optimization\n/);
    }
  });

  it('should allow execution-only skills to omit the optional Optimization facet', async () => {
    const generated = await createGeneratedSkill({ slug: 'execution-only', type: 'workflow' });
    tempRoots.push(generated.tempRoot);
    const skillPath = path.join(generated.skillDir, 'SKILL.md');
    const originalContent = await readFile(skillPath, 'utf8');
    const executionOnlyContent = originalContent.replace(
      /\n## Optimization\n[\s\S]*?(?=\n## Bundled Resources\n)/,
      '',
    );
    await writeFile(skillPath, executionOnlyContent, 'utf8');

    const validation = await validateGeneratedSkill(generated.skillDir, 'workflow');
    assert.equal(validation.exitCode, 0, validation.output);
  });

  it('should scaffold coding lifecycle and automation projection sections', async () => {
    const generated = await createGeneratedSkill({ slug: 'coding-lifecycle', type: 'coding' });
    tempRoots.push(generated.tempRoot);
    const skillPath = path.join(generated.skillDir, 'SKILL.md');
    const originalContent = await readFile(skillPath, 'utf8');

    assert.match(originalContent, /\n## Documentation\n/);
    assert.match(originalContent, /\n## Testing\n/);
    assert.match(originalContent, /\n## Deployment\n/);
    assert.match(originalContent, /\n## GitHub Actions\n/);
    assert.doesNotMatch(originalContent, /\n## GitHub Actions Workflow\n/);

    const withoutDeployment = originalContent.replace(
      /\n## Deployment\n[\s\S]*?(?=\n## GitHub Actions\n)/,
      '',
    );
    await writeFile(skillPath, withoutDeployment, 'utf8');

    const validation = await validateGeneratedSkill(generated.skillDir, 'coding');
    assert.equal(validation.exitCode, 0, validation.output);
  });

  it('should derive plugin skill homepages and honor explicit presentation overrides', async () => {
    const derived = await createGeneratedSkill({
      pluginRepository: 'https://github.com/pirog/example.git',
      slug: 'derived-homepage',
      type: 'coding',
    });
    const overridden = await createGeneratedSkill({
      emoji: '🧪',
      homepage: 'https://example.com/custom-skill',
      pluginRepository: 'https://github.com/pirog/example',
      slug: 'overridden-homepage',
      type: 'workflow',
    });
    tempRoots.push(derived.tempRoot, overridden.tempRoot);

    const derivedOpenClaw = await readGeneratedOpenClawMetadata(derived.skillDir);
    const overriddenOpenClaw = await readGeneratedOpenClawMetadata(overridden.skillDir);

    assert.equal(
      derivedOpenClaw.homepage,
      'https://github.com/pirog/example/tree/main/skills/derived-homepage',
    );
    assert.equal(overriddenOpenClaw.emoji, '🧪');
    assert.equal(overriddenOpenClaw.homepage, 'https://example.com/custom-skill');
  });

  it('should reuse shared presentation assets in a plugin that provides them', async () => {
    const generated = await createGeneratedSkill({
      pluginRepository: 'https://github.com/pirog/example',
      sharedPluginAssets: true,
      slug: 'shared-presentation',
    });
    tempRoots.push(generated.tempRoot);

    const openAiContent = await readFile(
      path.join(generated.skillDir, 'agents', 'openai.yaml'),
      'utf8',
    );

    assert.match(openAiContent, /icon_small: "\.\.\/\.\.\/assets\/composer-icon\.svg"/);
    assert.match(openAiContent, /icon_large: "\.\.\/\.\.\/assets\/icon-large\.png"/);
    await assert.rejects(lstat(path.join(generated.skillDir, 'assets')));
  });

  it('should reject missing or malformed OpenClaw metadata and accept real requirement gates', async () => {
    const generated = await createGeneratedSkill();
    tempRoots.push(generated.tempRoot);
    const skillPath = path.join(generated.skillDir, 'SKILL.md');
    const originalContent = await readFile(skillPath, 'utf8');

    await writeFile(
      skillPath,
      originalContent.replace(/\n {2}openclaw:\n {4}emoji: "🧩"/, ''),
      'utf8',
    );
    const missing = await validateGeneratedSkill(generated.skillDir, 'generic');
    assert.equal(missing.exitCode, 1);
    assert.match(missing.output, /metadata must contain 'openclaw'/);

    await writeFile(
      skillPath,
      originalContent.replace('    emoji: "🧩"', '    emoji: "🧩"\n    requires:\n      bins: bun'),
      'utf8',
    );
    const malformed = await validateGeneratedSkill(generated.skillDir, 'generic');
    assert.equal(malformed.exitCode, 1);
    assert.match(malformed.output, /metadata\.openclaw\.requires\.bins must be a non-empty list/);

    await writeFile(
      skillPath,
      originalContent.replace(
        '    emoji: "🧩"',
        [
          '    emoji: "🧩"',
          '    os:',
          '      - darwin',
          '    requires:',
          '      bins:',
          '        - bun',
          '      anyBins:',
          '        - node',
        ].join('\n'),
      ),
      'utf8',
    );
    const valid = await validateGeneratedSkill(generated.skillDir, 'generic');
    assert.equal(valid.exitCode, 0, valid.output);
  });
});
