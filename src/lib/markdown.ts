import DOMPurify from 'dompurify';
import { Marked } from 'marked';
import { figureAlt } from '#lib/figure-alt.ts';

const marked = new Marked({ gfm: true, breaks: false }, figureAlt);

/**
 * Markdown → sanitized HTML in the browser, for the admin editors' live previews only. Public
 * pages render on the server (#lib/server/markdown.ts), so visitors never download marked or a
 * sanitizer. <script>, event handlers (onerror=…), javascript: URLs, <style>/<form> and inline
 * style attributes are stripped.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  // Without a DOM (e.g. on the server) DOMPurify returns its input unsanitized. Never allow that.
  if (!DOMPurify.isSupported) {
    throw new Error(
      'renderMarkdown from #lib/markdown.ts is browser-only; use #lib/server/markdown.ts'
    );
  }
  const html = await marked.parse(markdown);
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form'],
    FORBID_ATTR: ['style']
  });
}
