# AGENTS.md

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

## Project Structure

- **Source**: `src/` — Astro pages, React components, layouts
- **Content**: `public/bfnn_md*/` — Markdown articles ( Buddhist content)
- **Build output**: `dist/` — Static files

## Tech Stack

- Astro 6 (static output, trailing slash enabled)
- React 19 (client components)
- Tailwind CSS v4 (via Vite plugin, not PostCSS)

## Architecture

- Articles are markdown files in `public/bfnn_md/`, `public/bfnn_md2/`, `public/bfnn_md3/`
- `src/lib/articles.ts` parses markdown files at build time, caches to `node_modules/.cache/articles-cache.json`
- Category inference uses keyword matching in `CATEGORY_RULES`
- Content encoding: tries UTF-8 first, falls back to Big5

## Notes

- No lint/typecheck/test scripts configured
- Sitemap auto-generated via `astro-sitemap`
- Site URL: `https://kjt-website.vercel.app`