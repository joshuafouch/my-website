export function insertImageMarkdown(
  body: string,
  start: number,
  end: number,
  url: string,
  alt: string
): { body: string; cursor: number } {
  const safeAlt = (alt.trim() || 'image').replaceAll(/[[\]]/g, '').replaceAll(/\s+/g, ' ');
  const before = body.slice(0, start);
  const after = body.slice(end);
  const image = `![${safeAlt}](${url})`;
  const lead = breakBefore(before);
  const trail = breakAfter(after);
  const next = `${before}${lead}${image}${trail}${after}`;
  return { body: next, cursor: before.length + lead.length + image.length + trail.length };
}

function breakBefore(before: string): string {
  if (before.length === 0 || before.endsWith('\n\n')) return '';
  if (before.endsWith('\n')) return '\n';
  return '\n\n';
}

function breakAfter(after: string): string {
  if (after.length === 0 || after.startsWith('\n\n')) return '';
  if (after.startsWith('\n')) return '\n';
  return '\n\n';
}
