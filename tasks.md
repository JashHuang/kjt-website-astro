# 執行計畫（依 SDD v2）

## 第一階段：無障礙與基礎優化 ✅

- [x] **1-1 SearchBar 無障礙** — 補 `aria-label`、`aria-live`、`autocomplete="off"`、`…` 字元
- [x] **1-2 FeaturedArticles SVG aria-hidden** — 閱讀全文箭頭 SVG 加 `aria-hidden`
- [x] **1-3 ArticleViewer 無障礙** — 齒輪按鈕 `aria-label`、TTS 控制紐 `aria-label`、`transition: all` → 具體屬性
- [x] **1-4 分類藥丸 focus ring** — 全站分類按鈕加 `focus-visible:ring-2`
- [x] **1-5 排版修正** — 全站 `...` → `…`、統計數字 `tabular-nums`、`text-wrap: balance`
- [x] **1-6 Hero SVG aria-hidden** — 英雄區 scroll-down 箭頭與裝飾 SVG

## 第二階段：卡片視圖遷移 ✅

- [x] **2-1 建立 ArticleCardGrid 元件** — 卡片含分類色條、標籤、標題、摘要、作者頭像
- [x] **2-2 替換首頁文章列表** — 首頁 `#articles` 表格區塊改為卡片 grid
- [x] **2-3 替換 /page/[page] 列表** — 分頁表格改為卡片 grid
- [x] **2-4 替換 /category/[category]/[page] 列表** — 分類分頁表格改為卡片 grid
- [x] **2-5 分類藥丸水平滾動** — `flex-wrap` → `overflow-x: auto`，補 `touch-manipulation`、`scrollbar-none`
- [x] **2-6 分類容器無障礙** — `role="tablist"` + `aria-label`

## 第三階段：深色模式 ✅

- [x] **3-1 全站 color-scheme 與 theme-color** — `<html>` 標籤與 `<meta>` 設定
- [x] **3-2 BaseLayout dark mode 樣式** — 背景、文字、卡片、按鈕的 `dark:` 變體
- [x] **3-3 Header / Hero dark mode** — 導航列與英雄區深色支援，含切換按鈕
- [x] **3-4 卡片列表 dark mode** — ArticleCardGrid、FeaturedArticles 深色支援
- [x] **3-5 深色模式切換開關** — 置於 Header，localStorage 持久化，FOUC 防護
- [ ] ~~**3-6 ArticleViewer 夜讀主題整併**~~ — 保留獨立設定（閱讀器內三主題為獨立功能，不與全站 dark mode 綁定）

## 第四階段：測試與部署 ✅

- [x] **4-1 鍵盤導航測試** — Tab 順序、focus ring 可見性
- [x] **4-2 響應式檢查** — Desktop / Tablet / Mobile 斷點
- [x] **4-3 建構驗證** — `npm run build` 2304 頁無錯誤
- [x] **4-4 最終審閱** — 與 SDD v2 逐條對照

## 未納入 SDD 的額外修正

- [x] **description HTML 清理** — `summarize()` 移除 HTML 標籤、Markdown 連結、註腳標記、`(#xxx)` 錨點引用
- [x] **ArticleViewer SEO 漸進增強** — SSR 靜態內容 + hydrate 後隱藏，避免重複顯示
- [x] **FeaturedArticles 隨機精選** — 每次 page reload 隨機抽 5 篇（`client:load`）
