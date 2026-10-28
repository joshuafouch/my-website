export function highlightMarkdown(source: string): string {
  const lines = source.split('\n');
  let fence: '`' | '~' | null = null;

  return lines
    .map((line) => {
      const marker = fenceMarker(line);
      if (marker) {
        if (fence === null) fence = marker;
        else if (marker === fence) fence = null;
        return `<span class="md-code">${escapeHtml(line)}</span>`;
      }
      if (fence) return `<span class="md-code">${escapeHtml(line)}</span>`;
      return highlightLine(escapeHtml(line));
    })
    .join('\n');
}

function fenceMarker(line: string): '`' | '~' | null {
  if (/^```/.test(line)) return '`';
  if (/^~~~/.test(line)) return '~';
  return null;
}

function highlightLine(line: string): string {
  const heading = /^(#{1,6})(\s+\S.*)$/.exec(line);
  if (heading) {
    return `<span class="md-mark">${heading[1]}</span><span class="md-h">${highlightInline(heading[2])}</span>`;
  }

  const quote = /^(&gt;)(.*)$/.exec(line);
  if (quote) {
    return `<span class="md-mark">${quote[1]}</span><span class="md-quote">${highlightInline(quote[2])}</span>`;
  }

  const list = /^(\s*(?:[-*+]|\d+\.)\s+)(.*)$/.exec(line);
  if (list) {
    return `<span class="md-mark">${list[1]}</span>${highlightInline(list[2])}`;
  }

  if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(line)) {
    return `<span class="md-mark">${line}</span>`;
  }

  return highlightInline(line);
}

function highlightInline(text: string): string {
  const pattern =
    /(`[^`\n]+`)|(\*\*(?:\\.|[^*]|\*(?!\*))+\*\*|__(?:\\.|[^_]|_(?!_))+__)|(\*(?:\\.|[^*\n])+\*|_(?:\\.|[^_\n])+_)|(!\[[^\]]*\]\([^)\n]*\))|(\[[^\]]*\]\([^)\n]*\))/g;
  let html = '';
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    html += text.slice(cursor, index);
    const token = match[0];
    if (match[1]) html += `<span class="md-code">${token}</span>`;
    else if (match[2]) html += wrapPair(token, 2, 'md-strong');
    else if (match[3]) html += wrapPair(token, 1, 'md-em');
    else if (match[4]) html += wrapImage(token);
    else if (match[5]) html += wrapLink(token);
    cursor = index + token.length;
  }

  return html + text.slice(cursor);
}

function wrapPair(token: string, mark: number, kind: string): string {
  const edge = token.slice(0, mark);
  const body = token.slice(mark, -mark);
  return `<span class="md-mark">${edge}</span><span class="${kind}">${body}</span><span class="md-mark">${edge}</span>`;
}

function wrapImage(token: string): string {
  const altEnd = token.indexOf(']');
  return `<span class="md-img">${token.slice(0, altEnd + 1)}</span><span class="md-url">${token.slice(altEnd + 1)}</span>`;
}

function wrapLink(token: string): string {
  const labelEnd = token.indexOf(']');
  return `<span class="md-link">${token.slice(0, labelEnd + 1)}</span><span class="md-url">${token.slice(labelEnd + 1)}</span>`;
}

function escapeHtml(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
