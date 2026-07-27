export default function extractRelativeMarkdownLinks(markdown) {
  const links = [];
  const pattern = /\[[^\]]*\]\(([^)]+)\)/g;

  for (const match of String(markdown ?? '').matchAll(pattern)) {
    const rawTarget = match[1].trim();
    const target = rawTarget.split(/\s+/)[0];
    if (
      !target ||
      target.startsWith('#') ||
      target.startsWith('mailto:') ||
      target.startsWith('data:') ||
      /^[a-z]+:\/\//i.test(target)
    ) {
      continue;
    }
    links.push(target);
  }

  return links;
}
