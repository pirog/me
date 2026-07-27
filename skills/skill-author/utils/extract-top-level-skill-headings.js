function normalizeSectionHeading(heading) {
  return /^#\s/.test(heading) ? '# ' : heading;
}

export default function extractTopLevelSkillHeadings(content) {
  const headings = [];
  let inFence = false;

  for (const line of String(content ?? '').split('\n')) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (!inFence && /^#{1,2}\s/.test(line)) {
      headings.push(normalizeSectionHeading(line.trim()));
    }
  }

  return headings;
}
