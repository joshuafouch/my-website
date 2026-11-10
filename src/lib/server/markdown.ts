import { Marked } from 'marked';
import { figureAlt } from '#lib/figure-alt.ts';
import sanitizeHtml from 'sanitize-html';

const marked = new Marked({ gfm: true, breaks: false }, figureAlt);

/**
 * What markdown can produce, and nothing else. sanitize-html is a pure-JS parser (no jsdom), so
 * the server function stays light. Scripts, event handlers (onerror=…), <style>/<form>, inline
 * style attributes and non-http(s)/mailto/tel URLs are all dropped.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'blockquote', 'pre', 'code'],
    ...['ul', 'ol', 'li', 'a', 'img', 'em', 'strong', 'del', 's', 'sup', 'sub', 'input'],
    ...['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'span', 'div']
  ],
  allowedAttributes: {
    a: ['href', 'title'],
    // An image's alt text, copied up for its caption (#lib/figure-alt.ts).
    p: ['data-alt'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['class'],
    ol: ['start'],
    th: ['align'],
    td: ['align'],
    // GFM task lists: <input checked disabled type="checkbox">
    input: ['type', 'checked', 'disabled']
  },
  allowedClasses: { code: [/^language-[\w-]+$/] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  // Task-list checkboxes only, and never interactive.
  exclusiveFilter: (frame) =>
    frame.tag === 'input' &&
    !(frame.attribs.type === 'checkbox' && frame.attribs.disabled !== undefined),
  disallowedTagsMode: 'discard'
};

/** Markdown → HTML that is safe to pass to {@html}. Server-only; see #lib/markdown.ts for the browser. */
export async function renderMarkdown(markdown: string): Promise<string> {
  return sanitizeHtml(await marked.parse(markdown), OPTIONS);
}
