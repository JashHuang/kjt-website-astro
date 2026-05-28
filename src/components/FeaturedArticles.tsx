import { useEffect, useState } from 'react';
import type { Article } from '@/lib/articles';

interface Props {
  allArticles: Article[];
}

const categoryColors: Record<string, string> = {
  '地藏法門': 'from-amber-500 to-yellow-500',
  '淨土法門': 'from-purple-500 to-indigo-500',
  '經典註釋': 'from-blue-500 to-cyan-500',
  '護生善行': 'from-green-500 to-emerald-500',
  '律學戒律': 'from-violet-500 to-purple-500',
  '因果勸善': 'from-orange-500 to-red-500',
  '傳記師承': 'from-cyan-500 to-blue-500',
  '持咒儀軌': 'from-fuchsia-500 to-pink-500',
  '孝道倫理': 'from-teal-500 to-green-500',
  '佛教基礎': 'from-sky-500 to-indigo-400',
  '禪修開示': 'from-emerald-500 to-teal-500',
  '修行指引': 'from-rose-500 to-pink-500',
};

export default function FeaturedArticles({ allArticles }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const shuffled = [...allArticles].sort(() => Math.random() - 0.5).slice(0, 5);
    setArticles(shuffled);
    setMounted(true);
  }, [allArticles]);

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2 xl:grid-cols-5">
      {articles.map((article) => {
        const gradient = categoryColors[article.category] || 'from-gray-500 to-gray-600';
        return (
          <a
            key={`${article.sourceDir}-${article.id}`}
            href={`/articles/${article.id}/`}
            className="group block cursor-pointer overflow-hidden rounded-3xl border border-white/50 bg-white/92 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl md:rounded-2xl md:bg-white/80 md:backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/90 dark:hover:bg-slate-800"
          >
            <div className={`h-2 bg-gradient-to-r ${gradient}`} />

            <div className="p-6 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className={`inline-block rounded-full bg-gradient-to-r px-3 py-1.5 text-sm font-medium text-white md:px-3 md:py-1 md:text-xs ${gradient}`}>
                  {article.category}
                </span>
                <span className="text-base text-gray-400 md:text-sm dark:text-slate-500">#{article.id}</span>
              </div>

              <h3 className="mb-3 font-chinese text-2xl font-bold leading-relaxed text-gray-800 transition-colors group-hover:text-amber-600 md:text-xl dark:text-slate-100 dark:group-hover:text-cyan-400">
                {article.title}
              </h3>

              <p className="mb-4 line-clamp-3 text-lg leading-relaxed text-gray-600 md:line-clamp-2 md:text-base dark:text-slate-300">
                {article.description}
              </p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 md:h-8 md:w-8">
                    <span className="text-base font-medium text-white md:text-sm">
                      {article.author.charAt(0)}
                    </span>
                  </div>
                  <span className="text-base font-medium text-gray-600 md:text-sm dark:text-slate-300">{article.author}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-base font-medium md:text-sm">閱讀全文</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="h-0 group-hover:h-16 transition-all duration-500 bg-gradient-to-t from-amber-50/50 to-transparent dark:from-cyan-500/10" />
          </a>
        );
      })}
    </div>
  );
}
