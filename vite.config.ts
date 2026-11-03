import adapter from '@sveltejs/adapter-vercel';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex, escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import { defineConfig, loadEnv } from 'vite';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
  extensions: ['.md'],
  highlight: {
    highlighter: async (code: string, lang: string | null | undefined = 'text') => {
      const highlighter = await createHighlighter({
        themes: ['poimandres'],
        langs: ['javascript', 'typescript']
      });
      await highlighter.loadLanguage('javascript', 'typescript');
      const html = escapeSvelte(
        highlighter.codeToHtml(code, { lang: lang ?? 'text', theme: 'poimandres' })
      );
      return `{@html \`${html}\` }`;
    }
  },
  remarkPlugins: [[remarkToc, { tight: true }]],
  rehypePlugins: [rehypeSlug]
};

export default defineConfig(({ mode }) => {
  // Supabase serves storage images and the resume PDF; allow only this project's origin.
  const { PUBLIC_SUPABASE_URL } = loadEnv(mode, '.', 'PUBLIC_');
  const supabase = PUBLIC_SUPABASE_URL ? new URL(PUBLIC_SUPABASE_URL).origin : '';
  if (!/^https:\/\/[^/]+\.[^/]+$/.test(supabase)) {
    throw new Error('PUBLIC_SUPABASE_URL must be an https URL to build the CSP');
  }
  const supabaseSource = supabase as `https://${string}.${string}`;

  return {
    server: {
      port: 7777 // Change the default port (e.g., 5173)
    },
    plugins: [
      tailwindcss(),
      sveltekit({
        extensions: ['.svelte', '.md'],
        preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
        adapter: adapter({
          runtime: 'nodejs24.x'
        }),
        // Pages are rendered per request, so 'auto' uses a fresh nonce on Kit's scripts and on
        // the app.html theme script (nonce="%sveltekit.nonce%").
        csp: {
          mode: 'auto',
          directives: {
            'default-src': ['self'],
            'script-src': ['self'],
            // Svelte SSR emits style="" attributes (style: directives, app.html wrapper).
            'style-src': ['self', 'unsafe-inline'],
            'img-src': ['self', 'data:', 'blob:', supabaseSource],
            'font-src': ['self'],
            'connect-src': ['self'],
            'frame-src': ['https://www.youtube-nocookie.com', supabaseSource, 'blob:'],
            'media-src': ['self', supabaseSource],
            'worker-src': ['self'],
            'object-src': ['none'],
            'base-uri': ['self'],
            'form-action': ['self'],
            'frame-ancestors': ['none'],
            'upgrade-insecure-requests': true
          }
        }
      })
    ]
  };
});
