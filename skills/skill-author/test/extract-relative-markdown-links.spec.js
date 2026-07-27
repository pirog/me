import assert from 'node:assert/strict';

import extractRelativeMarkdownLinks from '../utils/extract-relative-markdown-links.js';

describe('skills/skill-author/utils/extract-relative-markdown-links', () => {
  it('should return only relative Markdown targets', () => {
    assert.deepEqual(
      extractRelativeMarkdownLinks(
        '[local](./reference.md) [anchor](#part) [external](https://example.com)',
      ),
      ['./reference.md'],
    );
  });
});
