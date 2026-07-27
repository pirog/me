function unquoteYaml(value) {
  const trimmed = String(value ?? '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseYamlBlock(rawBlock) {
  const lines = String(rawBlock ?? '').split('\n');
  const indentOf = (line) => line.match(/^ */)?.[0].length ?? 0;
  const listPattern = (indent) => new RegExp(`^\\s{${indent}}-\\s+(.+)$`);
  const keyPattern = (indent) => new RegExp(`^\\s{${indent}}([A-Za-z][A-Za-z0-9_-]*):(.*)$`);

  function parseList(startIndex, indent) {
    const items = [];
    let index = startIndex;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }
      if (indentOf(line) < indent) break;

      const match = line.match(listPattern(indent));
      if (!match) break;
      items.push(unquoteYaml(match[1]));
      index += 1;
    }

    return { nextIndex: index, value: items };
  }

  function parseMap(startIndex, indent) {
    const entries = {};
    let index = startIndex;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }
      if (indentOf(line) < indent) break;

      const match = line.match(keyPattern(indent));
      if (!match) break;

      const [, key, rawValue] = match;
      const value = rawValue.trim();
      if (value) {
        entries[key] =
          value.startsWith('[') && value.endsWith(']')
            ? value
                .slice(1, -1)
                .split(',')
                .map((item) => unquoteYaml(item))
                .filter(Boolean)
            : unquoteYaml(value);
        index += 1;
        continue;
      }

      const nextLine = lines[index + 1];
      if (!nextLine || !nextLine.trim() || indentOf(nextLine) <= indent) {
        entries[key] = '';
        index += 1;
        continue;
      }

      if (nextLine.match(listPattern(indent + 2))) {
        const parsed = parseList(index + 1, indent + 2);
        entries[key] = parsed.value;
        index = parsed.nextIndex;
        continue;
      }

      if (nextLine.match(keyPattern(indent + 2))) {
        const parsed = parseMap(index + 1, indent + 2);
        entries[key] = parsed.value;
        index = parsed.nextIndex;
        continue;
      }

      entries[key] = '';
      index += 1;
    }

    return { nextIndex: index, value: entries };
  }

  return parseMap(0, 0).value;
}

export function splitLeadingSkillFrontmatter(content) {
  const match = String(content ?? '').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Template is missing leading template frontmatter.');
  }

  return {
    body: match[2],
    frontmatter: parseYamlBlock(match[1]),
  };
}

export default function parseSkillFrontmatter(content) {
  const match = String(content ?? '').match(/^---\n([\s\S]*?)\n---/);
  return match ? parseYamlBlock(match[1]) : null;
}
