import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../dotfiles/zsh/.config/zsh/path.zsh', import.meta.url));
const supported = process.platform === 'darwin' && existsSync('/opt/homebrew/bin/brew');

(supported ? describe : describe.skip)('zsh PATH initialization', () => {
  let home;

  before(() => {
    home = mkdtempSync(path.join(os.tmpdir(), 'me-zsh-path-'));
  });

  after(() => {
    rmSync(home, { recursive: true, force: true });
  });

  function initialize(inherited, repetitions = 1) {
    return execFileSync(
      '/bin/zsh',
      [
        '-fc',
        'for ((i=0; i<$2; i++)); do source "$1"; done; print -l -- $path',
        'zsh',
        source,
        String(repetitions),
      ],
      {
        encoding: 'utf8',
        env: {
          HOME: home,
          PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/opt/homebrew/sbin',
          ...(inherited ? { HOMEBREW_PREFIX: '/opt/homebrew' } : {}),
        },
      },
    )
      .trim()
      .split('\n');
  }

  for (const inherited of [false, true]) {
    it(`should restore Homebrew precedence with ${inherited ? 'inherited' : 'unset'} HOMEBREW_PREFIX`, () => {
      const entries = initialize(inherited);
      const brew = entries.indexOf('/opt/homebrew/bin');
      assert.ok(brew >= 0);
      assert.ok(brew < entries.indexOf('/usr/local/bin'));
      assert.ok(brew < entries.indexOf('/usr/bin'));
    });
  }

  it('should preserve order without duplicates when initialized repeatedly', () => {
    const entries = initialize(true, 2);
    assert.deepEqual(entries, initialize(true));
    assert.equal(new Set(entries).size, entries.length);
  });
});
