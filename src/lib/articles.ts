import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';

export interface Article {
  id: string;
  sourceDir: string;
  title: string;
  author: string;
  category: string;
  description: string;
}

export interface ArticleWithContent extends Article {
  content: string;
}

const PROJECT_ROOT = process.cwd();

export const SOURCE_DIRS = [
  { name: 'bfnn_md', path: join(PROJECT_ROOT, 'public/bfnn_md') },
  { name: 'bfnn_md2', path: join(PROJECT_ROOT, 'public/bfnn_md2') },
  { name: 'bfnn_md3', path: join(PROJECT_ROOT, 'public/bfnn_md3') },
];

const CATEGORY_RULES = [
  // 地藏法門（精確匹配，放最前避免被經典註釋吃掉）
  { category: '地藏法門', patterns: ['地藏'] },

  // 淨土法門
  { category: '淨土法門', patterns: ['淨土', '念佛', '阿彌陀佛', '往生', '彌陀', '極樂', '西方', '佛七', '助念', '臨終', '淨宗', '蓮宗'] },

  // 護生善行
  { category: '護生善行', patterns: ['放生', '護生', '素食', '戒殺', '吃素', '慈愛', '拜佛', '打坐', '朝聖'] },

  // 律學戒律
  { category: '律學戒律', patterns: ['五戒', '八關', '菩薩戒', '戒本', '律宗', '律學', '南山律', '朝暮課誦', '三皈依', '在家律學', '五戒表解', '五戒講義', '八關齋', '三皈依講義', '在家居士', '比丘', '沙彌'] },

  // 因果勸善
  { category: '因果勸善', patterns: ['了凡', '壽康', '百過格', '種善因得善果', '因果', '王鳳儀', '醒世', '業道輪迴', '報應實證', '太上', '感應篇', '勸善書', '陰德', '超度'] },

  // 傳記師承
  { category: '傳記師承', patterns: ['事蹟', '事略', '生平', '年譜', '追思', '能海', '雪廬', '李炳', '印公', '惟覺', '徹悟', '行策', '蓮池', '海濤', '法語', '師訓', '語錄', '述學', '開示', '講話', '雜談', '隨師', '訪美', '一生', '文集', '書札', '日記', '遊記'] },

  // 持咒儀軌
  { category: '持咒儀軌', patterns: ['大悲咒', '準提', '真言宗', '儀軌', '施食', '煙供', '持驗', '觀世音菩薩修持', '修持方法', '修持法', '慈悲的咒語', '千手', '藥師'] },

  // 孝道倫理
  { category: '孝道倫理', patterns: ['孝與', '孝道', '恩重', '恩德', '父母恩', '飲水思源', '孝順經典'] },

  // 佛教基礎
  { category: '佛教基礎', patterns: ['常識', '辭彙', '名詞', '入門', '初機', '學佛', '認識', '甚麼是', '概要', '基礎', '基本', '十四講', '居士', '問答', '答問'] },

  // 禪修開示（擴展匹配範圍）
  { category: '禪修開示', patterns: ['禪', '止觀', '坐禪', '參禪', '禪修', '楞嚴', '宗鏡', '大手印', '傳心', '六祖', '壇經', '悟心', '解脫歌', '當生', '佛境界', '契入佛'] },

  // 經典註釋（兜底，放最後）
  { category: '經典註釋', patterns: ['講記', '講義', '講錄', '經', '疏', '鈔', '註解', '科註', '玄義', '白話', '淺釋', '直解', '義疏', '講演錄', '攝論', '大意', '要義', '菁華', '校勘記', '釋疑', '通規', '論集', '選輯', '彙編', '選集', '法彙'] },
];

export const ALL_CATEGORIES = ['全部', '地藏法門', '經典註釋', '淨土法門', '護生善行', '律學戒律', '因果勸善', '傳記師承', '持咒儀軌', '孝道倫理', '佛教基礎', '禪修開示'];

const CACHE_FILE = join(PROJECT_ROOT, 'node_modules', '.cache', 'articles-cache.json');

function cleanLine(line: string) {
  return line
    .replace(/\r/g, '')
    .replace(/^\s*[*#>-\d.[\]()]+\s*/, '')
    .replace(/\*\*/g, '')
    .trim();
}

function isTableOfContentsLine(line: string) {
  return /^\[.+\]\(#.+\)$/.test(line.trim());
}

function inferCategory(...inputs: string[]) {
  const corpus = inputs.join(' ');
  const match = CATEGORY_RULES.find(({ patterns }) =>
    patterns.some((pattern) => corpus.includes(pattern))
  );
  return match?.category ?? '修行指引';
}

function summarize(text: string) {
  let clean = text
    .replace(/<[^>]*>/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[\^?\d*\]/g, '')
    .replace(/\(#[^)]+\)/g, '')
    .trim();
  if (!clean) return '';
  return clean.length > 72 ? `${clean.slice(0, 72).trim()}…` : clean;
}

function isCorrupted(text: string) {
  return /[�嚙锟]/.test(text);
}

function decodeContent(buffer: Buffer) {
  const utf8 = new TextDecoder('utf-8').decode(buffer);
  if (!utf8.includes('�')) {
    return utf8;
  }
  return new TextDecoder('big5').decode(buffer);
}

function parseArticle(id: string, content: string): Omit<Article, 'sourceDir'> | null {
  const rawLines = content.split('\n').map(cleanLine).filter(Boolean);
  const lines = rawLines.filter((line) => !isTableOfContentsLine(line));

  const title = lines[0] ?? `文章 ${id}`;
  if (isCorrupted(title)) {
    return null;
  }

  const subtitle = lines[1]?.startsWith('（') ? lines[1] : '';
  const authorIndex = subtitle ? 2 : 1;
  const author = lines[authorIndex] ?? '寬覺堂整理';
  const bodyStartIndex = authorIndex + 1;
  const descriptionSource =
    lines
      .slice(bodyStartIndex)
      .find((line) => line.length >= 18 && !line.startsWith('◎') && !line.startsWith('★')) ??
    `${title}${subtitle ? ` ${subtitle}` : ''}`;

  return {
    id,
    title,
    author,
    category: inferCategory(title, subtitle, author, descriptionSource),
    description: summarize(descriptionSource),
  };
}

export function loadAllArticles(): Article[] {
  if (existsSync(CACHE_FILE)) {
    const cached = readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(cached);
  }

  const articles: Article[] = [];

  for (const { name, path: sourcePath } of SOURCE_DIRS) {
    if (!existsSync(sourcePath)) continue;

    const entries = readdirSync(sourcePath, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => entry.name)
      .sort();

    for (const file of files) {
      const id = basename(file, '.md');
      const buffer = readFileSync(join(sourcePath, file));
      const content = decodeContent(buffer);
      const article = parseArticle(id, content);
      if (article) {
        articles.push({ ...article, sourceDir: name });
      }
    }
  }

  try {
    const cacheDir = join(PROJECT_ROOT, 'node_modules', '.cache');
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify(articles));
  } catch {
    // cache write is optional
  }

  return articles;
}

export function loadArticleContent(article: Article): string {
  const mdPath = join(PROJECT_ROOT, 'public', article.sourceDir, `${article.id}.md`);
  try {
    const buffer = readFileSync(mdPath);
    return decodeContent(buffer);
  } catch {
    return '# 內容載入失敗';
  }
}

export function getArticlesByCategory(articles: Article[], category: string): Article[] {
  if (category === '全部') return articles;
  return articles.filter((a) => a.category === category);
}

export function paginateArticles(articles: Article[], page: number, pageSize: number): Article[] {
  return articles.slice((page - 1) * pageSize, page * pageSize);
}

export function getTotalPages(articles: Article[], pageSize: number): number {
  return Math.ceil(articles.length / pageSize);
}
