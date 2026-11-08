/**
 * Sets the first letter of a write-up as a versal (`.initial` in app.css), like the opening of a
 * chapter in an old chant book.
 *
 * The opening paragraph is the first `<p>` after the first `<h2>` (posts open with a byline and
 * notes before their first section); without an `<h2>`, it is the first `<p>`. Only a paragraph
 * whose text starts with a letter qualifies, so a paragraph opening with bold or a link is skipped.
 * Takes rendered, sanitized HTML and adds only fixed markup around one letter.
 */
const OPENING = /<p>(\p{L})/gu;

export function withInitial(html: string): string {
  if (!html) return html;

  const heading = html.indexOf('<h2');
  let match: RegExpExecArray | null = null;
  if (heading !== -1) {
    OPENING.lastIndex = heading;
    match = OPENING.exec(html);
  }
  if (!match) {
    OPENING.lastIndex = 0;
    match = OPENING.exec(html);
  }
  if (!match) return html;

  const letter = match[1];
  // The visible letter is decorative; the hidden copy keeps the word whole for screen readers.
  const opening =
    `<p class="has-initial"><span class="initial" aria-hidden="true">${letter}</span>` +
    `<span class="sr-only">${letter}</span>`;
  return html.slice(0, match.index) + opening + html.slice(match.index + match[0].length);
}
