# 文章分類重構 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 `src/lib/articles.ts` 中的 `CATEGORY_RULES` 從 5 個規則擴展為 11 個規則，並將 `ALL_CATEGORIES` 同步更新，使 2,087 篇文章能分配到更精確的類別。

**Architecture:** 修改單一文件 `src/lib/articles.ts`，擴充 `CATEGORY_RULES` 陣列中的匹配規則和 `ALL_CATEGORIES` 列表。不改變解析邏輯，只調整分類關鍵字。

**Tech Stack:** TypeScript, Node.js fs modules

---

## 任務總覽

唯一要修改的檔案：`src/lib/articles.ts`

需要做的變更：
1. 擴充 `CATEGORY_RULES` 從 5 條規則到 11 條規則
2. 更新 `ALL_CATEGORIES` 從 7 個值到 12 個值
3. 調整規則順序（精確匹配優先於寬泛匹配）

## Task 1: 擴充 CATEGORY_RULES 和 ALL_CATEGORIES

**Files:**
- Modify: `src/lib/articles.ts:25-33`

### 步驟 1: 替換 CATEGORY_RULES 陣列

將現有 5 條規則替換為 11 條規則。規則順序很重要——更精確的模式放在前面，避免被寬泛模式先匹配。

替換 `CATEGORY_RULES`（第 25-31 行）為：

```typescript
const CATEGORY_RULES = [
  // 地藏法門（精確匹配，放最前避免被經典註釋吃掉）
  { category: '地藏法門', patterns: ['地藏'] },

  // 淨土法門（放第二位，優先於傳記師承/護生善行等）
  { category: '淨土法門', patterns: ['淨土', '念佛', '阿彌陀佛', '往生', '彌陀', '極樂', '西方', '佛七', '助念', '臨終', '淨宗', '蓮宗', '法語'] },

  // 護生善行（放第三位，優先於因果勸善，因為「戒殺」既是護生也是因果）
  { category: '護生善行', patterns: ['放生', '護生', '素食', '戒殺', '吃素', '慈愛'] },

  // 律學戒律（放第四位，優先於傳記師承，避免「律航法師」等人名誤匹配）
  { category: '律學戒律', patterns: ['五戒', '八關', '菩薩戒', '戒本', '律宗', '律學', '南山律', '朝暮課誦', '三皈依', '在家律學', '五戒表解', '五戒講義', '八關齋', '三皈依講義', '在家居士', '比丘', '沙彌'] },

  // 因果勸善
  { category: '因果勸善', patterns: ['了凡', '壽康', '百過格', '種善因得善果', '因果', '王鳳儀', '醒世', '業道輪迴', '報應實證'] },

  // 傳記師承（開示、問答、講話、傳記）
  { category: '傳記師承', patterns: ['事蹟', '事略', '年譜', '追思', '能海', '雪廬', '李炳', '印公', '惟覺', '徹悟', '行策', '蓮池', '海濤', '法語', '師訓', '語錄', '述學', '開示', '講話', '雜談', '隨師', '訪美', '一生'] },

  // 持咒儀軌
  { category: '持咒儀軌', patterns: ['大悲咒', '準提', '真言宗', '儀軌', '施食', '煙供', '持驗', '觀世音菩薩修持', '修持方法', '修持法', '慈悲的咒語'] },

  // 孝道倫理
  { category: '孝道倫理', patterns: ['孝與', '孝道', '恩重', '恩德', '父母恩', '飲水思源', '孝順經典'] },

  // 佛教基礎
  { category: '佛教基礎', patterns: ['常識', '辭彙', '名詞', '入門', '初機', '學佛', '佛學', '認識', '甚麼是', '概要', '基礎', '基本', '十四講', '居士'] },

  // 禪修開示（擴展匹配範圍）
  { category: '禪修開示', patterns: ['禪', '止觀', '坐禪', '參禪', '禪修', '楞嚴', '宗鏡', '大手印', '傳心', '六祖', '壇經', '悟心', '解脫歌', '當生', '佛境界', '契入佛'] },

  // 經典註釋（兜底，放最後）
  { category: '經典註釋', patterns: ['經', '疏', '鈔', '講記', '講義', '註解', '科註', '玄義', '白話', '淺釋', '講錄', '直解', '義疏', '講演錄', '研究', '攝論', '大意', '要義', '菁華', '校勘記', '釋疑', '通規', '論集', '選輯', '彙編', '選集', '法彙'] },
];
```

**模式設計原則：**
- 不使用單字模式（如 `傳`、`律`、`福`），避免誤匹配人名
- 淨土法門優先於傳記師承：如「印光大師護國息災法語」→ 淨土
- 律學戒律優先於傳記師承：如「律航法師傳戒」→ 律學（因為「傳戒」匹配）
- 護生善行優先於因果勸善：如「律航法師文記—戒殺」→ 護生（因為「戒殺」匹配）

### 步驟 2: 替換 ALL_CATEGORIES

將第 33 行的 `ALL_CATEGORIES` 替換為：

```typescript
export const ALL_CATEGORIES = ['全部', '經典註釋', '淨土法門', '地藏法門', '禪修開示', '律學戒律', '因果勸善', '傳記師承', '持咒儀軌', '孝道倫理', '佛教基礎', '護生善行'];
```

### 步驟 3: 運行 build 驗證

```bash
npm run build
```

預期：build 成功，無錯誤。

### 步驟 4: 驗證分類分佈

```bash
node -e "
const cache = require('./node_modules/.cache/articles-cache.json');
const cats = {};
cache.forEach(a => { cats[a.category] = (cats[a.category] || 0) + 1; });
Object.entries(cats).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(k + ': ' + v));
console.log('Total:', cache.length);
"
```

預期結果：
- 修行指引從 771 降至 ~30 以內
- 各分類篇數分佈：經典註釋 ~550-600, 淨土 ~280-320, 禪修 ~180-220, 傳記師承 ~70-90, 佛教基礎 ~80-110, 因果勸善 ~40-60, 地藏 ~100-119, 律學 ~30-45, 持咒 ~15-25, 孝道 ~5-15, 護生 ~25-30

### 步驟 5: 檢查未分類文章

```bash
node -e "
const cache = require('./node_modules/.cache/articles-cache.json');
const catchAll = cache.filter(a => a.category === '修行指引');
const titles = {};
catchAll.forEach(a => {
  const t = a.title.replace(/\*\*/g, '').trim().slice(0, 40);
  titles[t] = (titles[t] || 0) + 1;
});
Object.entries(titles).sort((a,b) => b[1]-a[1]).forEach(([t,v]) => console.log(t + ' (' + v + ')'));
console.log('修行指引 remaining:', catchAll.length);
"
```

預期：修行指引剩餘文章數 ≤ 30，且這些文章確實無法歸入其他類別。
