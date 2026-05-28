import { useState, useMemo } from 'react';

interface Article {
  id: string;
  sourceDir: string;
  title: string;
  author: string;
  category: string;
  description: string;
}

interface Props {
  articles: Article[];
}

export default function SearchBar({ articles }: Props) {
  const [keyword, setKeyword] = useState('');

  const results = useMemo(() => {
    if (!keyword.trim()) return [];
    const kw = keyword.trim().toLowerCase();
    return articles.filter((a) =>
      [a.id, a.title, a.author, a.description, a.category]
        .join(' ').toLowerCase().includes(kw)
    ).slice(0, 50);
  }, [keyword, articles]);

  return (
    <div>
      <label className="block mb-4">
        <span className="mb-3 block text-xl font-medium text-gray-700 md:mb-2 md:text-sm">關鍵字搜尋</span>
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜尋標題、法師、摘要…"
          aria-label="搜尋文章"
          autoComplete="off"
          className="w-full rounded-3xl border border-amber-200 bg-white/95 px-5 py-4 text-xl text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 md:rounded-2xl md:px-4 md:py-3 md:text-base"
        />
      </label>

      {results.length > 0 && (
        <div className="mt-4 space-y-3" aria-live="polite" role="status">
          <p className="text-lg text-gray-600">找到 {results.length} 篇相關文章</p>
          {results.map((a) => (
            <a
              key={`${a.sourceDir}-${a.id}`}
              href={`/articles/${a.id}/`}
              className="block p-4 rounded-2xl border border-amber-100 bg-white/80 hover:bg-amber-50/70 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-amber-600">#{a.id}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{a.category}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{a.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{a.author}</p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>
            </a>
          ))}
        </div>
      )}

      {keyword.trim() && results.length === 0 && (
        <p className="text-lg text-gray-500 mt-4">沒有找到符合「{keyword}」的文章</p>
      )}
    </div>
  );
}
