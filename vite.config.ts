import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 7777, // Change the default port (e.g., 5173)
  },
  plugins: [tailwindcss(), sveltekit()]
});
