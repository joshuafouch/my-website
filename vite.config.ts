import adapter from '@sveltejs/adapter-vercel';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';

/**
 * CSP hashes for the inline scripts in src/app.html (the pre-paint theme/motion script). Kit only
 * hashes the scripts it injects itself, so these are computed from the file at build time and
 * always match its current contents.
 */
function appHtmlScriptHashes() {
  const html = readFileSync(new URL('./src/app.html', import.meta.url), 'utf8');
  return [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, body]) => `sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}` as const
  );
}

export default defineConfig(({ command, mode }) => {
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
    ssr: {
      // sanitize-html is CommonJS and require()s htmlparser2 12, which is ESM-only. Node 24 allows
      // that natively, but Vercel's function loader doesn't (ERR_REQUIRE_ESM → 500 on any page
      // that renders markdown), so bundle both and let Rollup resolve the require at build time.
      // Build only: the dev server doesn't convert CommonJS it inlines ("require is not defined").
      noExternal: command === 'build' ? ['sanitize-html', 'htmlparser2'] : []
    },
    plugins: [
      tailwindcss(),
      sveltekit({
        preprocess: [vitePreprocess()],
        adapter: adapter({
          runtime: 'nodejs24.x'
        }),
        // Hashes, not nonces: public pages are cached at the CDN, and a cached nonce would be the
        // same for every visitor. Kit hashes its own inline scripts per response; app.html's are
        // hashed above.
        csp: {
          mode: 'hash',
          directives: {
            'default-src': ['self'],
            'script-src': ['self', ...appHtmlScriptHashes()],
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
