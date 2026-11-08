import { error } from '@sveltejs/kit';
import { url as origin } from '#lib/config.ts';
import type { RequestHandler } from './$types';

/** The public pages that aren't posts or projects. */
const PAGES = ['/', '/about/professional', '/about/personal', '/projects', '/blog', '/resume'];

type Entry = { path: string; lastmod?: string };

/**
 * Every public page, post and project. A public GET, so hooks.server.ts caches it at the CDN under
 * the content tag, and an admin save purges it along with the pages.
 */
export const GET: RequestHandler = async ({ locals }) => {
  const [posts, projects] = await Promise.all([
    locals.supabase.from('posts').select('slug, updated_at').eq('published', true),
    locals.supabase.from('projects').select('slug, updated_at').eq('published', true)
  ]);
  if (posts.error || projects.error) {
    console.error('Failed to build the sitemap', posts.error, projects.error);
    error(500, 'Failed to build the sitemap');
  }

  const entries: Entry[] = [
    ...PAGES.map((path) => ({ path })),
    ...(posts.data ?? []).map((post) => ({
      path: `/${encodeURIComponent(post.slug)}`,
      lastmod: post.updated_at.slice(0, 10)
    })),
    ...(projects.data ?? []).map((project) => ({
      path: `/projects/${encodeURIComponent(project.slug)}`,
      lastmod: project.updated_at.slice(0, 10)
    }))
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      ({ path, lastmod }) =>
        `  <url><loc>${origin}${path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
    ),
    '</urlset>',
    ''
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
