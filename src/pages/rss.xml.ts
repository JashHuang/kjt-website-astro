import rss from '@astrojs/rss';
import { loadAllArticles } from '../lib/articles';

export async function GET() {
  const articles = loadAllArticles();
  return rss({
    title: '寬覺堂 - 佛法精選',
    description: '收錄佛教經典、高僧大德開示錄、修行指引等珍貴法寶',
    site: 'https://kjt-website.vercel.app',
    items: articles.slice(0, 100).map((a) => ({
      title: a.title,
      description: a.description,
      link: `/articles/${a.id}/`,
    })),
  });
}
