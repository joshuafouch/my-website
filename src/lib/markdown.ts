import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: false
});

/**
 * Markdown → HTML that is safe to pass to {@html}. Everything that renders markdown goes
 * through here, so output is always sanitized: <script>, event handlers (onerror=…),
 * javascript: URLs, <style>/<form> and inline style attributes are stripped.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const html = await marked.parse(markdown);
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form'],
    FORBID_ATTR: ['style']
  });
}
