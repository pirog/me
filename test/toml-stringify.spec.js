import assert from 'node:assert/strict';

import { stringifyToml } from '../utils/toml-stringify.js';

describe('utils/toml-stringify', () => {
  it('should render root scalars and nested tables deterministically', () => {
    assert.equal(
      stringifyToml({
        personality: 'pragmatic',
        features: {
          memories: true,
          multi_agent: false,
        },
      }),
      'personality = "pragmatic"\n\n[features]\nmemories = true\nmulti_agent = false\n',
    );
  });

  it('should quote dotted keys and render table arrays', () => {
    assert.equal(
      stringifyToml({
        projects: [
          {
            'repo.path': {
              trust_level: 'trusted',
            },
          },
        ],
      }),
      '[[projects]]\n\n[projects."repo.path"]\ntrust_level = "trusted"\n',
    );
  });

  it('should preserve empty nested tables', () => {
    assert.equal(
      stringifyToml({
        desktop: {
          appearanceLightChromeTheme: {
            fonts: {},
          },
        },
      }),
      '[desktop.appearanceLightChromeTheme.fonts]\n',
    );
  });

  it('should preserve empty arrays instead of dropping them as empty table arrays', () => {
    const config = { empty: [], mcp_servers: { browser: { args: [] } } };
    const rendered = stringifyToml(config);
    assert.equal(rendered, 'empty = []\n\n[mcp_servers.browser]\nargs = []\n');
    assert.deepEqual(globalThis.Bun.TOML.parse(rendered), config);
  });
});
