const MAX_DIFF_PREVIEW = 5;

export function diffEntries(sourceEntries, targetEntries) {
  const changed = [];
  const extra = [];
  const missing = [];

  for (const [relativePath, sourceEntry] of sourceEntries) {
    const targetEntry = targetEntries.get(relativePath);
    if (!targetEntry) {
      missing.push(relativePath);
      continue;
    }

    if (sourceEntry.type !== targetEntry.type) {
      changed.push(relativePath);
      continue;
    }

    if (sourceEntry.type === 'file') {
      if (
        sourceEntry.mode !== targetEntry.mode ||
        !sourceEntry.content.equals(targetEntry.content)
      ) {
        changed.push(relativePath);
      }

      continue;
    }

    if (sourceEntry.type === 'symlink' && sourceEntry.target !== targetEntry.target) {
      changed.push(relativePath);
    }
  }

  for (const relativePath of targetEntries.keys()) {
    if (!sourceEntries.has(relativePath)) {
      extra.push(relativePath);
    }
  }

  changed.sort((left, right) => left.localeCompare(right));
  extra.sort((left, right) => left.localeCompare(right));
  missing.sort((left, right) => left.localeCompare(right));

  return { changed, extra, missing };
}

export function diffHasChanges(diff) {
  return diff.changed.length > 0 || diff.missing.length > 0 || diff.extra.length > 0;
}

export function previewPaths(paths) {
  if (paths.length <= MAX_DIFF_PREVIEW) {
    return paths;
  }

  return [...paths.slice(0, MAX_DIFF_PREVIEW), `... ${paths.length - MAX_DIFF_PREVIEW} more`];
}

export function summarizeDiff(diff) {
  const parts = [];

  if (diff.changed.length > 0) {
    parts.push(`changed ${diff.changed.length}`);
  }

  if (diff.missing.length > 0) {
    parts.push(`missing ${diff.missing.length}`);
  }

  if (diff.extra.length > 0) {
    parts.push(`extra ${diff.extra.length}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'in sync';
}
