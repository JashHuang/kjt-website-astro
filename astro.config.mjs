import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from 'astro-sitemap';

export default defineConfig({
  site: 'https://kjt-website.vercel.app',
  integrations: [react(), sitemap()],
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
