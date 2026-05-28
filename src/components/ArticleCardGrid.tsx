import type { Article } from '@/lib/articles';

interface Props {
  articles: Article[];
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

export default function ArticleCardGrid({ articles }: Props) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {articles.map((article) => {
        const gradient = categoryColors[article.category] || 'from-gray-500 to-gray-600';
        return (
          <a
            key={`${article.sourceDir}-${article.id}`}
            href={`/articles/${article.id}/`}
            className="group block overflow-hidden rounded-2xl border border-white/50 bg-white/92 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800/90"
          >
            <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className={`inline-block rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-medium text-white ${gradient}`}>
                  {article.category}
                </span>
                <span className="text-sm text-gray-400 dark:text-slate-500">#{article.id}</span>
              </div>

              <h3 className="mb-2 font-chinese text-xl font-bold leading-snug text-gray-800 transition-colors group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-cyan-400">
                {article.title}
              </h3>

              <p className="mb-4 line-clamp-2 text-base leading-relaxed text-gray-600 dark:text-slate-300">
                {article.description}
              </p>

              <div className="flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-slate-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400">
                  <span className="text-xs font-medium text-white">{article.author.charAt(0)}</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-slate-300">{article.author}</span>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
