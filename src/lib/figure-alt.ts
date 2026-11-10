import type { MarkedExtension, Tokens } from 'marked';

/**
 * A paragraph holding an image is drawn as a figure (app.css, `.figures`): "fig. N" on the left
 * under the picture, and the image's alt text on the right. CSS can't read a child's attribute,
 * so the alt text is copied onto the paragraph as data-alt. The editor's placeholder alt ("image")
 * isn't a caption, so it's left off.
 */
export const figureAlt: MarkedExtension = {
  renderer: {
    paragraph(token: Tokens.Paragraph) {
      const body = this.parser.parseInline(token.tokens);
      const alt = token.tokens
        .filter((t): t is Tokens.Image => t.type === 'image')
        .map((t) => t.text.trim())
        .filter((text) => text && text.toLowerCase() !== 'image')
        .join(' · ');
      if (!alt) return `<p>${body}</p>\n`;
      return `<p data-alt="${escapeAttribute(alt)}">${body}</p>\n`;
    }
  }
};

function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
