import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import type { Article } from '@/lib/articles';

interface Props {
  article: Article;
  mdContent: string;
}

type ReaderTheme = 'warm' | 'paper' | 'night';
type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type LineHeight = 'tight' | 'relaxed' | 'airy';

const STORAGE_KEYS = {
  theme: 'bfnn-reader-theme',
  fontSize: 'bfnn-reader-font-size',
  lineHeight: 'bfnn-reader-line-height',
} as const;

const READING_POSITION_PREFIX = 'bfnn-reading-position';

const THEME_OPTIONS: Array<{
  id: ReaderTheme; label: string; shell: string; header: string; content: string;
  title: string; subtitle: string; footer: string; footerText: string;
  prose: string; paragraph: string; heading: string; strong: string;
  quote: string; link: string; controlIdle: string; controlActive: string;
}> = [
  {
    id: 'warm', label: '暖金',
    shell: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    header: 'bg-white/95 border-amber-200', content: 'bg-transparent',
    title: 'text-gray-800', subtitle: 'text-amber-600',
    footer: 'bg-white/95 border-amber-200', footerText: 'text-gray-500',
    prose: 'prose', paragraph: 'text-gray-700', heading: 'text-gray-800',
    strong: 'text-amber-700', quote: 'border-amber-400 bg-amber-50/70 text-gray-600',
    link: 'text-amber-600 hover:text-amber-700',
    controlIdle: 'bg-white/80 text-gray-700 hover:bg-white',
    controlActive: 'bg-amber-500 text-white shadow-lg shadow-amber-500/25',
  },
  {
    id: 'paper', label: '紙本',
    shell: 'reader-paper-shell',
    header: 'bg-[#f3ecdf]/95 border-stone-300', content: 'reader-paper-surface',
    title: 'text-stone-800', subtitle: 'text-stone-600',
    footer: 'bg-[#f3ecdf]/95 border-stone-300', footerText: 'text-stone-500',
    prose: 'prose', paragraph: 'text-stone-700', heading: 'text-stone-800',
    strong: 'text-stone-900', quote: 'border-stone-400 bg-stone-100/80 text-stone-600',
    link: 'text-stone-700 hover:text-stone-900',
    controlIdle: 'bg-[#faf5ea] text-stone-700 hover:bg-[#fffaf0]',
    controlActive: 'bg-stone-700 text-[#f7f1e5] shadow-lg shadow-stone-400/20',
  },
  {
    id: 'night', label: '夜讀',
    shell: 'bg-slate-900',
    header: 'bg-slate-900/95 border-slate-700', content: 'bg-slate-900',
    title: 'text-slate-100', subtitle: 'text-cyan-300',
    footer: 'bg-slate-900/95 border-slate-700', footerText: 'text-slate-400',
    prose: 'prose-invert', paragraph: 'text-slate-200', heading: 'text-slate-100',
    strong: 'text-cyan-300', quote: 'border-cyan-400 bg-slate-800 text-slate-300',
    link: 'text-cyan-300 hover:text-cyan-200',
    controlIdle: 'bg-slate-800 text-slate-200 hover:bg-slate-700',
    controlActive: 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20',
  },
];

const FONT_SIZE_OPTIONS: Array<{ id: FontSize; article: string; h1: string; h2: string; h3: string }> = [
  { id: 'xs', article: 'text-[20px] md:text-[16px]', h1: 'text-[2.5rem] md:text-[2rem]', h2: 'text-[2.1rem] md:text-[1.6rem]', h3: 'text-[1.75rem] md:text-[1.3rem]' },
  { id: 'sm', article: 'text-[24px] md:text-[18px]', h1: 'text-[3rem] md:text-[2.25rem]', h2: 'text-[2.5rem] md:text-[1.85rem]', h3: 'text-[2.1rem] md:text-[1.45rem]' },
  { id: 'md', article: 'text-[30px] md:text-[22px]', h1: 'text-[3.6rem] md:text-[2.7rem]', h2: 'text-[3rem] md:text-[2.2rem]', h3: 'text-[2.4rem] md:text-[1.7rem]' },
  { id: 'lg', article: 'text-[38px] md:text-[28px]', h1: 'text-[4.4rem] md:text-[3.2rem]', h2: 'text-[3.6rem] md:text-[2.55rem]', h3: 'text-[2.9rem] md:text-[2rem]' },
  { id: 'xl', article: 'text-[48px] md:text-[34px]', h1: 'text-[5.5rem] md:text-[3.8rem]', h2: 'text-[4.5rem] md:text-[3rem]', h3: 'text-[3.5rem] md:text-[2.35rem]' },
];

const LINE_HEIGHT_OPTIONS: Array<{ id: LineHeight; label: string; article: string; paragraph: string }> = [
  { id: 'tight', label: '緊密', article: 'leading-[1.7] md:leading-8', paragraph: 'leading-[1.7] md:leading-8' },
  { id: 'relaxed', label: '舒適', article: 'leading-[1.95] md:leading-9', paragraph: 'leading-[1.95] md:leading-9' },
  { id: 'airy', label: '寬鬆', article: 'leading-[2.2] md:leading-[2.1]', paragraph: 'leading-[2.2] md:leading-[2.1]' },
];

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, v: string) {
  try { localStorage.setItem(key, v); } catch {}
}

function getStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const v = safeGet(key);
  return v && allowed.includes(v as T) ? v as T : fallback;
}

export default function ArticleViewer({ article, mdContent }: Props) {
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>(() =>
    getStored(STORAGE_KEYS.theme, ['warm', 'paper', 'night'] as const, 'warm'));
  const [fontSize, setFontSize] = useState<FontSize>(() =>
    getStored(STORAGE_KEYS.fontSize, ['xs', 'sm', 'md', 'lg', 'xl'] as const, 'md'));
  const [lineHeight, setLineHeight] = useState<LineHeight>(() =>
    getStored(STORAGE_KEYS.lineHeight, ['tight', 'relaxed', 'airy'] as const, 'relaxed'));
  const [readingProgress, setReadingProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [currentChunkIndex, setCurrentChunkIndex] = useState(-1);
  const [showSettings, setShowSettings] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const ttsRef = useRef({ stopped: false, chunks: [] as string[], currentIndex: 0 });

  const articleStorageKey = `${READING_POSITION_PREFIX}:${article.sourceDir}:${article.id}`;

  useEffect(() => {
    safeSet(STORAGE_KEYS.theme, readerTheme);
  }, [readerTheme]);
  useEffect(() => {
    safeSet(STORAGE_KEYS.fontSize, fontSize);
  }, [fontSize]);
  useEffect(() => {
    safeSet(STORAGE_KEYS.lineHeight, lineHeight);
  }, [lineHeight]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      const zh = available.filter(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      setVoices(zh.length > 0 ? zh : available);
      const stored = safeGet('bfnn-reader-voice');
      if (stored && (zh.length > 0 ? zh : available).some(v => v.voiceURI === stored)) {
        setSelectedVoice(stored);
      } else if (zh.length > 0) {
        setSelectedVoice((zh.find(v => v.lang === 'zh-TW') || zh[0]).voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    if (selectedVoice) safeSet('bfnn-reader-voice', selectedVoice);
  }, [selectedVoice]);

  // Mount 時隱藏 SEO 的靜態內容，避免重複顯示
  useEffect(() => {
    const seo = document.getElementById('article-seo-content');
    if (seo) seo.style.display = 'none';
  }, []);

  useEffect(() => {
    if (!articleStorageKey) return;
    const stored = safeGet(articleStorageKey);
    if (!stored) return;
    try {
      const { scrollTop } = JSON.parse(stored);
      if (typeof scrollTop === 'number' && contentRef.current) {
        contentRef.current.scrollTop = scrollTop;
      }
    } catch {}
  }, [articleStorageKey]);

  const getChunks = () => {
    const container = articleRef.current;
    if (!container) return [];
    const els = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote'));
    return els.filter(el => el.textContent?.trim()).map(el => el.textContent!.trim());
  };

  const clearHighlights = () => {
    articleRef.current?.querySelectorAll('[data-tts-active]').forEach(el =>
      (el as HTMLElement).removeAttribute('data-tts-active'));
    setCurrentChunkIndex(-1);
  };

  useEffect(() => {
    const container = articleRef.current;
    if (!container) return;
    container.querySelectorAll('[data-tts-active]').forEach(el =>
      (el as HTMLElement).removeAttribute('data-tts-active'));
    if (currentChunkIndex < 0) return;
    const els = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote'))
      .filter(el => el.textContent?.trim());
    const target = els[currentChunkIndex] as HTMLElement | undefined;
    if (target) {
      target.setAttribute('data-tts-active', 'true');
      const scrollContainer = contentRef.current;
      if (scrollContainer) {
        requestAnimationFrame(() => {
          const cr = scrollContainer.getBoundingClientRect();
          const tr = target.getBoundingClientRect();
          scrollContainer.scrollTo({
            top: tr.top - cr.top + scrollContainer.scrollTop - cr.height / 2 + tr.height / 2,
            behavior: 'smooth',
          });
        });
      }
    }
  }, [currentChunkIndex]);

  const playChunk = (index: number) => {
    if (index < 0 || index >= ttsRef.current.chunks.length) {
      setIsPlaying(false); setIsPaused(false); setCurrentChunkIndex(-1);
      return;
    }
    ttsRef.current.stopped = false;
    ttsRef.current.currentIndex = index;
    setCurrentChunkIndex(index);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsRef.current.chunks[index]);
    if (selectedVoice) {
      const v = voices.find(vv => vv.voiceURI === selectedVoice);
      if (v) utterance.voice = v;
    }
    utterance.lang = 'zh-TW';
    utterance.rate = 1.0;
    utterance.onend = () => { if (!ttsRef.current.stopped) playChunk(index + 1); };
    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        setIsPlaying(false); setIsPaused(false);
      }
    };
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true); setIsPaused(false);
  };

  const startTTS = (fromVisible: boolean) => {
    if (!window.speechSynthesis) return;
    const chunks = getChunks();
    if (chunks.length === 0) return;
    ttsRef.current.chunks = chunks;
    let startIndex = 0;
    if (fromVisible && articleRef.current) {
      const cr = articleRef.current.getBoundingClientRect();
      const els = Array.from(articleRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote'))
        .filter(el => el.textContent?.trim());
      for (let i = 0; i < els.length; i++) {
        if (els[i].getBoundingClientRect().bottom > cr.top + 10) { startIndex = i; break; }
      }
    }
    playChunk(startIndex);
  };

  const handleTTS = () => {
    if (!window.speechSynthesis) { alert('您的瀏覽器不支援語音朗讀功能'); return; }
    if (isPlaying) {
      if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); }
      else { window.speechSynthesis.pause(); setIsPaused(true); }
      return;
    }
    startTTS(true);
  };

  const stopTTS = () => {
    ttsRef.current.stopped = true;
    window.speechSynthesis?.cancel();
    setIsPlaying(false); setIsPaused(false); setCurrentChunkIndex(-1);
  };

  const handleScroll = () => {
    const c = contentRef.current;
    if (!c) return;
    const max = Math.max(c.scrollHeight - c.clientHeight, 0);
    const p = max === 0 ? 0 : (c.scrollTop / max) * 100;
    setReadingProgress(Math.max(0, Math.min(100, p)));
    safeSet(articleStorageKey, JSON.stringify({ scrollTop: c.scrollTop }));
  };

  const theme = THEME_OPTIONS.find(t => t.id === readerTheme) ?? THEME_OPTIONS[0];
  const fs = FONT_SIZE_OPTIONS.find(f => f.id === fontSize) ?? FONT_SIZE_OPTIONS[2];
  const lh = LINE_HEIGHT_OPTIONS.find(l => l.id === lineHeight) ?? LINE_HEIGHT_OPTIONS[1];
  const fsIndex = FONT_SIZE_OPTIONS.findIndex(f => f.id === fontSize);

  return (
    <div className={`mt-8 rounded-3xl overflow-hidden shadow-2xl ${theme.shell}`}>
      {/* Header */}
      <div className={`flex flex-col border-b px-4 py-4 md:px-6 md:py-4 ${theme.header}`}>
        <div className="mb-2 h-1 overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full bg-black/25 transition-[width] duration-200" style={{ width: `${readingProgress}%` }} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className={`text-sm font-medium ${theme.subtitle}`}>#{article.id}</span>
            <h2 className={`truncate font-chinese text-2xl font-bold ${theme.title}`}>{article.title}</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            aria-label={showSettings ? '關閉設定' : '開啟設定'}
            className={`rounded-full p-3 transition md:p-2 ${showSettings ? theme.controlActive : theme.controlIdle}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {showSettings && (
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-500/20 mt-4">
            {/* TTS */}
            <div className="flex flex-wrap items-center gap-2">
              {voices.length > 0 && (
                <select
                  value={selectedVoice}
                  onChange={e => setSelectedVoice(e.target.value)}
                  className={`max-w-[150px] appearance-none truncate rounded-full border-none bg-transparent px-4 py-2 text-base font-medium outline-none transition md:px-3 md:py-1.5 md:text-sm ${theme.controlIdle}`}
                >
                  {voices.map(v => (
                    <option key={v.voiceURI} value={v.voiceURI} className="text-gray-800 bg-white">{v.name}</option>
                  ))}
                </select>
              )}
              <button type="button" onClick={handleTTS}
                aria-label={isPlaying ? (isPaused ? '繼續朗讀' : '暫停朗讀') : '從目前位置朗讀'}
                className={`rounded-full px-4 py-2 text-base font-medium transition md:px-3 md:py-1.5 md:text-sm ${isPlaying && !isPaused ? theme.controlActive : theme.controlIdle}`}>
                {isPlaying ? (isPaused ? '繼續' : '暫停') : '目前位置朗讀'}
              </button>
              {isPlaying && (
                <button type="button" onClick={stopTTS}
                  aria-label="停止朗讀"
                  className={`rounded-full px-4 py-2 text-base font-medium transition md:px-3 md:py-1.5 md:text-sm ${theme.controlIdle}`}>
                  停止
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold tracking-[0.2em] ${theme.footerText}`}>主題</span>
                <div className="flex gap-2">
                  {THEME_OPTIONS.map(t => (
                    <button key={t.id} type="button" onClick={() => setReaderTheme(t.id)}
                      className={`rounded-full px-4 py-2 text-base font-medium transition md:px-3 md:py-1.5 md:text-sm ${readerTheme === t.id ? theme.controlActive : theme.controlIdle}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold tracking-[0.2em] ${theme.footerText}`}>字級</span>
                <button type="button" onClick={() => setFontSize(FONT_SIZE_OPTIONS[Math.max(0, fsIndex - 1)].id)}
                  disabled={fsIndex === 0}
                  className={`rounded-full px-4 py-2 text-base font-medium transition disabled:opacity-40 md:px-3 md:py-1.5 md:text-sm ${theme.controlIdle}`}>-</button>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${theme.controlActive}`}>
                  <span className="font-bold text-lg">A</span>
                </div>
                <button type="button" onClick={() => setFontSize(FONT_SIZE_OPTIONS[Math.min(FONT_SIZE_OPTIONS.length - 1, fsIndex + 1)].id)}
                  disabled={fsIndex === FONT_SIZE_OPTIONS.length - 1}
                  className={`rounded-full px-4 py-2 text-base font-medium transition disabled:opacity-40 md:px-3 md:py-1.5 md:text-sm ${theme.controlIdle}`}>+</button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold tracking-[0.2em] ${theme.footerText}`}>行距</span>
                {LINE_HEIGHT_OPTIONS.map(l => (
                  <button key={l.id} type="button" onClick={() => setLineHeight(l.id)}
                    className={`rounded-full px-4 py-2 text-base font-medium transition md:px-3 md:py-1.5 md:text-sm ${lineHeight === l.id ? theme.controlActive : theme.controlIdle}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div ref={contentRef} onScroll={handleScroll}
        className={`overflow-y-auto max-h-[70vh] p-5 md:p-8 ${theme.content}`}>
        <article ref={articleRef} className={`prose prose-lg max-w-none font-chinese ${theme.prose} ${fs.article} ${lh.article}`}>
          <style>{`
            [data-tts-active="true"] {
              background-color: ${readerTheme === 'night' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(245, 158, 11, 0.15)'} !important;
              border-left: 4px solid ${readerTheme === 'night' ? '#22d3ee' : '#f59e0b'} !important;
              padding-left: 1rem !important;
              margin-left: -1rem !important;
              border-radius: 0 0.5rem 0.5rem 0 !important;
              transition: background-color 0.3s ease, border-color 0.3s ease, padding 0.3s ease, margin 0.3s ease, border-radius 0.3s ease !important;
            }
          `}</style>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ children }) => <h1 className={`mb-6 mt-8 font-bold ${theme.heading} ${fs.h1}`}>{children}</h1>,
              h2: ({ children }) => <h2 className={`mb-4 mt-8 font-bold ${theme.heading} ${fs.h2}`}>{children}</h2>,
              h3: ({ children }) => <h3 className={`mb-3 mt-6 font-bold ${theme.heading} ${fs.h3}`}>{children}</h3>,
              p: ({ children }) => <p className={`mb-4 ${theme.paragraph} ${lh.paragraph}`}>{children}</p>,
              strong: ({ children }) => <strong className={`font-bold ${theme.strong}`}>{children}</strong>,
              ul: ({ children }) => <ul className={`mb-4 list-disc list-inside ${theme.paragraph}`}>{children}</ul>,
              ol: ({ children }) => <ol className={`mb-4 list-decimal list-inside ${theme.paragraph}`}>{children}</ol>,
              li: ({ children }) => <li className={`${theme.paragraph} ${lh.paragraph}`}>{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className={`my-4 rounded-r-lg border-l-4 py-3 pl-4 italic ${theme.quote}`}>{children}</blockquote>
              ),
              a: ({ href, children, ...props }) => {
                const id = (props as any).id;
                if (href?.startsWith('#')) {
                  return <a href={href} className={`underline cursor-pointer ${theme.link}`}
                    onClick={(e) => { e.preventDefault();
                      const t = contentRef.current?.querySelector(`#${href.substring(1)}`);
                      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>{children}</a>;
                }
                if (id && (!children || (Array.isArray(children) && children.length === 0))) {
                  return <span id={id} className="invisible" aria-hidden="true" />;
                }
                return <a id={id} href={href} className={`underline ${theme.link}`} target="_blank" rel="noopener noreferrer">{children}</a>;
              },
            }}
          >
            {mdContent}
          </ReactMarkdown>
        </article>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between border-t px-4 py-4 md:px-6 ${theme.footer}`}>
        <div className={`text-base md:text-sm ${theme.footerText}`}>
          已閱讀 {Math.round(readingProgress)}%
        </div>
      </div>
    </div>
  );
}
