import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from 'astro-sitemap';
import { renameSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

function renameSitemapIndex() {
  return {
    name: 'rename-sitemap-index',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const distDir = fileURLToPath(dir);
        const indexPath = resolve(distDir, 'sitemap-index.xml');
        const targetPath = resolve(distDir, 'sitemap.xml');
        try {
          renameSync(indexPath, targetPath);
        } catch { /* sitemap-index.xml not generated, skip */ }
        // 修正 HTML 中指向 sitemap-index.xml 的 <link> 標籤
        try {
          const htmlFiles = [];
          const walk = (dir) => {
            for (const entry of readdirSync(dir, { withFileTypes: true })) {
              const full = resolve(dir, entry.name);
              if (entry.isDirectory()) walk(full);
              else if (entry.name.endsWith('.html')) htmlFiles.push(full);
            }
          };
          walk(distDir);
          for (const filePath of htmlFiles) {
            let content = readFileSync(filePath, 'utf-8');
            if (content.includes('sitemap-index.xml')) {
              content = content.replaceAll('sitemap-index.xml', 'sitemap.xml');
              writeFileSync(filePath, content);
            }
          }
        } catch { /* skip */ }
      },
    },
  };
}

export default defineConfig({
  site: 'https://kjt-website.vercel.app',
  integrations: [react(), sitemap({ createLinkInHead: true }), renameSitemapIndex()],
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
