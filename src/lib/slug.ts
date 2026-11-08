/**
 * Could this be a post or project slug? Lets a route 404 without a database round trip when a
 * scanner asks for /wp-login.php or /.env. Wider than slugify's output on purpose: older posts
 * use slugs like `Junior_Thesis`.
 */
export function isSlugLike(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(value);
}

/** URL slug from a title: lowercase, dashes, no punctuation. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
