export function safeHref(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {
    return null;
  }

  return null;
}

export function youtubeId(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] ?? '';
      return idPattern.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v') ?? '';
        return idPattern.test(id) ? id : null;
      }

      const parts = url.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'embed' || parts[0] === 'shorts') && parts[1] && idPattern.test(parts[1])) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

const idPattern = /^[A-Za-z0-9_-]{11}$/;

export function openLinks(html: string): string {
  return html.replaceAll(
    '<a href=',
    '<a class="quiet-link" target="_blank" rel="noopener noreferrer" href='
  );
}
