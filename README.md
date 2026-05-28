# 寬覺堂 (KJT-Website) — 現代化佛學電子書門戶

![寬覺堂](https://img.shields.io/badge/佛法-如燈-orange)
![Astro](https://img.shields.io/badge/框架-Astro%206-blue)
![React](https://img.shields.io/badge/前端-React%2019-blue)
![Vite](https://img.shields.io/badge/建置-Vite%206-purple)
![Tailwind CSS](https://img.shields.io/badge/樣式-Tailwind%204-teal)

「佛法如燈，照破千年暗。」

**[寬覺堂](https://kjt-website.vercel.app/)** 是一個致力於將經典佛學文獻以現代、美觀且易於閱讀的方式呈現的手機端友善 Web 應用。我們希望透過現代網頁技術，讓古老的經典散發出新的光芒，助益更多修學佛法的人士。

---

## 🙏 特別致謝與資料來源

本專案的所有文字資料、經論原文、法師開示錄等寶貴法寶，均源自 **[報佛恩網 (BFNN)](https://book.bfnn.org/)**。

我們在此致以最誠摯的謝意。報佛恩網長期以來致力於佛法資源的免費流通與無私彙整，是當代極其重要的數位藏經閣。本專案旨在將這些珍貴資料，以符合現代網路使用習慣（如響應式設計、即時搜尋、語音朗讀、簡繁轉換）的形式重新呈現，幫助法寶流通更加廣泛。

---

## ✨ 專案特點

1. **現代美學設計** — 採用暖色調調色盤與優雅的卡片式佈局，為讀者營造安靜、清淨的閱讀氛圍。
2. **一鍵簡繁切換** — 整合 OpenCC-JS，實現全站內容即時轉換，系統會記憶使用者的設定。
3. **語音朗讀支援** — 內建 TTS 語音朗讀功能，可自由選擇不同語音引擎，實現文字與音聲的無縫銜接。
4. **智慧檢索與過濾** — 支援即時關鍵字搜尋（標題、作者、分類、摘要）與分頁瀏覽功能。
5. **極致的閱讀體驗** — 提供 Markdown 渲染、三種閱讀主題（暖金、紙本、夜讀）、五種字級與三種行距調整。
6. **全平台響應式佈局** — 針對手機、平板與桌機進行了完美適配。
7. **SEO 優化** — Open Graph / Twitter Card、JSON-LD 結構化資料、自動 Sitemap、RSS 訂閱。

---

## 🛠 技術棧

| 類別 | 技術 |
|------|------|
| **框架** | [Astro 6](https://astro.build/)（靜態網站生成） |
| **前端** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)（嚴格模式） |
| **建置工具** | [Vite 6](https://vitejs.dev/)（Astro 內建） |
| **樣式系統** | [Tailwind CSS 4](https://tailwindcss.com/)（`@tailwindcss/vite` Vite 插件） |
| **內容渲染** | [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm + rehype-raw |
| **字體轉換** | [opencc-js](https://github.com/nicehash/opencc-js) |
| **語音技術** | Web Speech API |
| **路徑別名** | `@/*` → `src/*` |
| **部署** | [Vercel](https://vercel.com/)（靜態匯出） |

---

## 🚀 快速開始

### 環境需求
- Node.js（建議 v18 以上）
- npm

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 建構生產版本

```bash
npm run build
```

### 本地預覽生產版本

```bash
npm run preview
```

---

## 📂 專案結構

```
src/
├── layouts/
│   └── BaseLayout.astro        # 根 HTML 殼層（SEO meta、字型、頁尾）
├── pages/
│   ├── index.astro             # 首頁：英雄區、精選卡片、文章表格、分頁連結
│   ├── search.astro            # 客戶端全文搜尋（SearchBar 元件）
│   ├── 404.astro               # 自訂 404 頁面
│   ├── articles/[id].astro     # 文章詳情頁（SSG）
│   ├── page/[page].astro       # 分頁文章列表（每頁 20 篇）
│   ├── category/[category]/    # 分類頁面（含分頁）
│   └── rss.xml.ts              # RSS 訂閱（最近 100 篇文章）
├── components/
│   ├── Header.astro            # 固定頂部導覽列（含關於彈窗）
│   ├── Hero.astro              # 首頁英雄區，含統計資料
│   ├── ArticleCard.astro       # 文章卡片元件
│   ├── ArticleCardGrid.tsx     # 精選文章卡片網格（React 客戶端元件）
│   ├── FeaturedArticles.tsx    # 精選文章區塊（React 客戶端元件）
│   ├── ArticleViewer.tsx       # 完整閱讀器（React 客戶端元件）
│   ├── SearchBar.tsx           # 即時篩選的客戶端搜尋
│   └── LanguageToggle.tsx      # 繁體/簡體中文切換
├── lib/
│   └── articles.ts             # 文章載入、解析、快取、分類推斷
└── styles/
    └── global.css              # Tailwind 匯入、自訂主題 token、工具類別

public/
├── bfnn_md/                    # Markdown 文章檔案（來源目錄 1，約 2000+ 篇）
├── bfnn_md2/                   # Markdown 文章檔案（來源目錄 2）
├── bfnn_md3/                   # Markdown 文章檔案（來源目錄 3）
├── *.files/                    # 文章引用的舊版圖片資源
├── favicon.svg
├── icons.svg
└── robots.txt
```

---

## 🧠 架構說明

### 文章系統

- **來源**：`public/bfnn_md*` 目錄中約 2000+ 篇 Markdown 檔案，編碼為 UTF-8 或 Big5（自動偵測）
- **解析**（`src/lib/articles.ts`）：
  - `loadAllArticles()` — 讀取所有 Markdown 檔案，解析中繼資料（標題、作者、分類），將結果快取至 `node_modules/.cache/articles-cache.json`
  - `loadArticleContent(article)` — 讀取單篇文章的原始 Markdown 內容
  - 分類透過關鍵字比對（`CATEGORY_RULES`）推斷，共 11 個類別
- **路由**：所有文章頁面在建構時透過 Astro 的 `getStaticPaths()` 預先渲染

### 客戶端元件

- **ArticleViewer** — 全功能閱讀器：ReactMarkdown 渲染、三種主題（暖金/紙本/夜讀）、五種字級、三種行距、TTS 語音朗讀（逐段高亮並自動捲動）、閱讀位置 localStorage 持久化
- **LanguageToggle** — 使用 opencc-js 在繁體與簡體中文之間轉換頁面文字
- **SearchBar** — 客戶端搜尋，篩選範圍涵蓋 id、標題、作者、摘要和分類
- **ArticleCardGrid / FeaturedArticles** — 首頁精選文章展示

---

## 📜 版權聲明

本專案程式碼僅供學習與佛法流通使用。所有文章內容之著作權歸屬原作者或原始數位化單位所有。我們秉承佛法「廣種福田、無私流通」之精神，嚴禁將本專案用於任何商業營利目的。

願一切眾生離苦得樂，共證菩提。南無阿彌陀佛 🙏
