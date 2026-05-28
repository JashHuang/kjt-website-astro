# 網站 UI/UX 優化設計計畫 (SDD) v2

> 基於 Vercel Web Interface Guidelines 強化，2026-05-16 更新

## 1. 專案概述 (Project Overview)

### 1.1 背景與目標
目前的佛教主題網站擁有良好的基礎視覺氛圍（溫暖色調、傳統書法元素），但在頁面結構、視圖一致性以及行動裝置體驗上存在改進空間。本計畫旨在統一視覺語言，將過時的表格視圖轉換為現代化的卡片視圖，並優化搜尋與篩選機制，以提升用戶的瀏覽體驗與內容獲取效率。

### 1.2 核心痛點
- **視圖不一致**：表格視圖（Table View）與卡片視圖（Card View）風格割裂，表格視圖過於像後台系統。
- **導航擁擠**：分類篩選按鈕過多，在桌面端與行動端均造成版面壓力。
- **資訊密度不均**：卡片摘要過短，表格包含無意義的編號列。
- **搜尋框設計衝突**：不同頁面的搜尋框樣式不統一。
- **無障礙缺失**：缺少 aria-label、focus ring、鍵盤操作支援。
- **深色模式無支援**：夜間閱讀場景未被照顧。

---

## 2. 設計規範與標準 (Design System & Standards)

### 2.1 視覺與主題系統 (Visual & Theming)

#### 主色調（暖金基調，保留既有）
- **背景色**：暖米色/淺黃色（`#F5F0E6`），保持沉澱感
- **強調色**：amber-500 → orange-500 漸層（用於按鈕、CTA）
- **標籤色**：各法門對應不同漸層色（已實作於 `categoryColors`）

#### 深色模式新增
- `color-scheme: dark` 於 `<html>`（修正深色模式下 scrollbar、input 樣式）
- `<meta name="theme-color">` 隨主題動態切換
- Tailwind `dark:` 變體定義完整的深色彩盤：
  - 背景：slate-900 / slate-800
  - 文字：slate-100 / slate-300
  - 強調：amber-400 / cyan-400
  - 卡片：slate-800 / slate-750 border
- 參考 `ArticleViewer` 的夜讀主題作為全站深色模式基準

### 2.2 元件規範 (Component Specs)

#### A. 分類篩選列 (FilterBar / CategoryPills)

- **樣式**：藥丸形狀 (Pills) 按鈕，各法門對應不同背景色。
- **無障礙**：
  - 容器設 `role="tablist"` 搭配 `aria-label="文章分類篩選"`
  - 每個藥丸設 `role="tab"`、`aria-selected` 狀態
- **行為**：
  - **桌面端**：置於搜尋框下方，`overflow-x: auto` 單向水平滾動，隱藏 scrollbar
  - **行動端**：置於搜尋框下方，同上支援水平滾動
  - **觸控**：`touch-action: manipulation` 防止雙擊縮放延遲
  - **焦點**：`focus-visible:ring-2 focus-visible:ring-amber-400`
- **URL 同步**：當前選中的分類反映在 URL path 上（`/category/:name/`），支援直接分享與回退

#### B. 搜尋框 (SearchBar)

- **統一設計**：圓角矩形，淺灰色背景，搜尋圖標（`aria-hidden="true"`）。
- **無障礙**：
  - `<input>` 需有 `aria-label="搜尋文章"` 或關聯的 `<label>`
  - 搜尋結果容器需 `aria-live="polite"` 即時朗讀結果數量
- **功能增強**：
  - Placeholder：`"搜尋標題、法師、摘要…"`（結尾用 `…` 字元）
  - `autocomplete="off"`（非表單欄位，避免密碼管理員干擾）
  - 支援點擊後展開「熱門標籤」
- **URL 同步**：搜尋關鍵字同步至 `?q=` query parameter

#### C. 文章卡片 (ArticleCard)

- **結構**：
  1. **頂部**：法門標籤 (Tag)，顏色對應分類。
  2. **主體**：標題 (Bold) + 摘要（2-3 行，`line-clamp-*` 截斷）。
  3. **底部**：作者、`#id`（保留但可考慮淡化）。
- **互動**：
  - Hover 時陰影加深、`-translate-y-1` 微浮起
  - `focus-visible:ring-2` 鍵盤導航支援
  - SVG 圖標設 `aria-hidden="true"`
- **語意**：整個卡片用 `<a>` 包裹，內含 `<h3>` 標題（保持 heading hierarchy）

### 2.3 無障礙規範 (Accessibility)

| 項目 | 要求 |
| :--- | :--- |
| **語意 HTML** | 使用 `<button>` / `<a>` / `<nav>` / `<article>`，不用 `<div onClick>` |
| **標題層級** | 每個頁面一個 `<h1>`，依序使用 `h1`→`h2`→`h3`，不可跳級 |
| **aria-label** | 圖示按鈕（齒輪、搜尋）、導航區塊需提供 |
| **aria-hidden** | 裝飾性圖示（SVG icons）需設 `aria-hidden="true"` |
| **焦點指示** | 所有可互動元素需 `focus-visible:ring-*`，不可 `outline: none` 無替代 |
| **鍵盤操作** | 分類篩選支援方向鍵切換、Enter 選取 |
| **aria-live** | 搜尋結果、分頁切換等動態更新需 `aria-live="polite"` |
| **跳過連結** | 頁面頂部提供「跳到主要內容」的 skip link |

### 2.4 排版規範 (Typography)

- **標題**：保留傳統書法風格的襯線字體 (Serif)，建議 `text-wrap: balance` 防止 widow
- **內文**：無襯線字體 (Sans-serif)，確保易讀性
- **特殊字元**：
  - `…` 使用 `…` 字元，非三個句點 `...`
  - 引號使用彎引號 `""`，非直引號 `""`
  - 數字與單位間使用不換行空格：`10&nbsp;MB`
- **等寬數字**：表格/統計數字使用 `font-variant-numeric: tabular-nums` 確保對齊
- **載入狀態**：以 `…` 結尾，如 `"載入中…"`、`"搜尋中…"`

### 2.5 觸控與互動 (Touch & Interaction)

- 分類藥丸與卡片容器：`touch-action: manipulation`
- `-webkit-tap-highlight-color: transparent`
- 搜尋結果列表／分頁切換：無不需 `overscroll-behavior: contain`
- 避免 `autoFocus` 在行動裝置上使用

---

## 3. 響應式策略 (Responsive Strategy)

| 斷點 | 卡片列數 | 佈局行為 |
| :--- | :--- | :--- |
| Desktop (>1024px) | 3-4 列 | 搜尋框 + 水平藥丸 + 卡片 grid |
| Tablet (768-1024px) | 2 列 | 同上，卡片縮減 |
| Mobile (<768px) | 1 列 | 全寬卡片，藥丸水平滾動 |

---

## 4. 實施計畫 (Implementation Roadmap)

### 第一階段：無障礙與基礎優化（高優先級、低風險）

1. **補齊 aria-label 與 focus ring**
   - `SearchBar.tsx`：input 加 `aria-label`、結果容器 `aria-live`
   - `FeaturedArticles.tsx`：SVG 圖示 `aria-hidden`
   - `ArticleViewer.tsx`：齒輪按鈕 `aria-label`、TTS 控制紐
   - `index.astro` 分類藥丸：`role="tablist"` + `focus-visible`
2. **排版修正**
   - 全站 `...` → `…` 字元
   - 統計數字 `tabular-nums`
   - 標題 `text-wrap: balance`
3. **URL 狀態同步**（SearchBar 搜尋詞反映在 `?q=`）

### 第二階段：視圖遷移（卡片取代表格）

1. **建立 `ArticleCard` 統一元件**（React 版本，整合現有 `FeaturedArticles` 樣式）
2. **替換三處表格列表**：
   - `/page/[page]`
   - `/category/[category]/[page]`
   - 首頁 `#articles` 區塊
3. **分類篩選改為水平滾動**（取代 `flex-wrap`）

### 第三階段：深色模式

1. **全站 `color-scheme` 設定**
2. **擴充現有 ArticleViewer 夜讀主題為全站 dark mode**
3. **`<meta name="theme-color">` 動態切換**
4. **切換開關位置**（Header 或 Hero 區）

### 第四階段：測試與部署

1. **多裝置測試**：分類列在小螢幕上的滾動體驗、touch 行為
2. **鍵盤導航測試**：Tab 順序、focus ring 可見性
3. **VoiceOver / TalkBack 測試**：aria-label 正確朗讀
4. **上線部署**

---

## 5. 預期效益 (Expected Outcomes)

1. **體驗流暢度提升**：用戶不再需要在表格與卡片間切換，閱讀體驗更一致。
2. **行動端兼容性**：透過卡片佈局與滾動篩選，解決了手機版瀏覽困難的問題。
3. **資訊獲取效率**：更長的摘要和標籤展示讓用戶在點開前判斷內容相關性。
4. **無障礙合規**：符合 WCAG 基本要求，鍵盤與輔助技術用戶可完整操作。
5. **深色模式**：滿足夜間閱讀的舒適度需求。

---

## 6. 禁止事項（Anti-patterns）

引用自 Vercel Web Interface Guidelines：

- ❌ `outline: none` 沒有 `focus-visible` 替代方案
- ❌ 圖示按鈕缺少 `aria-label`
- ❌ `<div>` / `<span>` 綁 `onClick`（應用 `<button>`）
- ❌ `transition: all`（應列出具體屬性）
- ❌ 動畫缺少 `prefers-reduced-motion` 支援
- ❌ 圖片缺少 `width` / `height`（造成 CLS）
- ❌ 硬編碼日期/數字格式（應用 `Intl.*`）
- ❌ 表單輸入缺少 `<label>` 或 `aria-label`

---

**附錄：修改前後對比參考**

| 項目 | 現狀 (As-Is) | 建議狀態 (To-Be) |
| :--- | :--- | :--- |
| **列表呈現** | 傳統表格，含編號列 | 現代化卡片網格，含摘要與元數據 |
| **分類導航** | 按鈕擠壓，易換行 | 水平滾動容器，節省版面 |
| **搜尋框** | 樣式不統一 | 統一圓角設計 + aria-label + aria-live |
| **卡片摘要** | 文字過短，資訊量不足 | 增加至 2-3 行，line-clamp 截斷 |
| **無障礙** | 未處理 | aria-label、focus ring、鍵盤操作 |
| **深色模式** | 無 | 全站 dark mode 支援 |
| **URL 同步** | 無 | 搜尋詞 ?q=、分類反映在 path |
