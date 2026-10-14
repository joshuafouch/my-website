import adapter from '@sveltejs/adapter-vercel';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex, escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import { defineConfig } from 'vite';

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

export default defineConfig({
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
      })
    })
  ]
});
