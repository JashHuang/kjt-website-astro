# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 指令

- `npm run dev` — 啟動 Astro 開發伺服器
- `npm run build` — 建構生產版本（輸出至 `dist/`）
- `npm run preview` — 本地預覽生產版本
- 未配置 lint、型別檢查或測試腳本

## 技術棧

- **Astro 6** — 靜態網站生成（`output: 'static'`），啟用尾斜線
- **React 19** — 互動式元件（ArticleViewer、SearchBar、LanguageToggle）
- **Tailwind CSS v4** — 透過 `@tailwindcss/vite` Vite 外掛（非 PostCSS）
- **TypeScript** — 嚴格模式，`@/*` 路徑別名對應 `src/*`
- **部署** — Vercel（靜態匯出），透過 `astro-sitemap` 自動生成 sitemap

## 專案結構

```
src/
├── layouts/BaseLayout.astro    — 根 HTML 殼層（SEO meta、字型、頁尾、LanguageToggle）
├── pages/
│   ├── index.astro             — 首頁：英雄區、精選卡片、文章表格、分頁連結
│   ├── search.astro            — 客戶端全文搜尋（SearchBar 元件）
│   ├── 404.astro               — 自訂 404 頁面
│   ├── articles/[id].astro     — 文章詳情頁（SSG，每篇文章一個頁面）
│   ├── page/[page].astro       — 分頁文章列表（每頁 20 篇）
│   ├── category/[category]/    — 重新導向至 /category/:cat/1/
│   ├── category/[category]/[page].astro — 分頁分類列表
│   └── rss.xml.ts              — RSS 訂閱（最近 100 篇文章）
├── components/
│   ├── Header.astro            — 固定頂部導覽列
│   ├── Hero.astro              — 首頁英雄區，含統計資料
│   ├── ArticleCard.astro       — 精選文章卡片元件
│   ├── ArticleViewer.tsx       — 完整閱讀器：Markdown 渲染、語音朗讀、主題/字級/行距控制
│   ├── SearchBar.tsx           — 即時篩選的客戶端搜尋
│   └── LanguageToggle.tsx      — 繁體/簡體中文切換（opencc-js）
├── lib/
│   └── articles.ts             — 文章載入、解析、快取、分類推斷
└── styles/
    └── global.css              — Tailwind 匯入、自訂主題 token、工具類別

public/
├── bfnn_md/                    — Markdown 文章檔案（來源目錄 1）
├── bfnn_md2/                   — Markdown 文章檔案（來源目錄 2）
├── bfnn_md3/                   — Markdown 文章檔案（來源目錄 3）
├── 1981.files/, 0424.files/…  — 文章引用的舊版圖片資源
├── favicon.svg
├── icons.svg
└── robots.txt
```

## 架構

### 文章系統

- **來源**：`public/bfnn_md*` 目錄中約 2000+ 篇 markdown 檔案，編碼為 UTF-8 或 Big5（自動偵測）
- **解析**（[src/lib/articles.ts](src/lib/articles.ts)）：
  - `loadAllArticles()` — 讀取所有 markdown 檔案，解析中繼資料（標題、作者、分類），將結果快取至 `node_modules/.cache/articles-cache.json` 供後續建構使用
  - `loadArticleContent(article)` — 讀取單篇文章的原始 markdown 內容
  - 分類透過關鍵字比對（`CATEGORY_RULES`）推斷，預設為「修行指引」
  - 內容編碼：先嘗試 UTF-8，若偵測到替代字元（�）則改用 Big5 重新解碼
- **路由**：所有文章頁面在建構時透過 Astro 的 `getStaticPaths()` 預先渲染

### 主要客戶端元件

- **ArticleViewer**（[src/components/ArticleViewer.tsx](src/components/ArticleViewer.tsx)）— 全功能閱讀器：
  - ReactMarkdown 渲染（remark-gfm、rehype-raw）
  - 三種主題（暖金/紙本/夜讀）、五種字級、三種行距
  - 語音朗讀（TTS），逐段高亮並自動捲動跟隨
  - 閱讀位置透過 localStorage 持久化
- **LanguageToggle**（[src/components/LanguageToggle.tsx](src/components/LanguageToggle.tsx)）— 使用 opencc-js 在繁體與簡體中文之間轉換頁面文字，目標為帶有 `data-convert` 屬性的元素
- **SearchBar**（[src/components/SearchBar.tsx](src/components/SearchBar.tsx)）— 客戶端搜尋，篩選範圍涵蓋 id、標題、作者、摘要和分類

### 內容編碼處理

文章檔案可能為 UTF-8 或 Big5 編碼。[src/lib/articles.ts](src/lib/articles.ts) 中的 `decodeContent()` 函數處理此問題：先以 UTF-8 解碼，若發現替代字元則改以 Big5 重新解碼。`isCorrupted()` 檢查會過濾掉標題含有編碼異常的文章。

### SEO

- BaseLayout 中的 Open Graph / Twitter Card meta 標籤
- JSON-LD 結構化資料（WebSite schema）
- `/rss.xml` RSS 訂閱
- 透過 `astro-sitemap` 自動生成 sitemap
- 所有頁面設定 canonical URL
- `robots.txt` 允許所有爬蟲
