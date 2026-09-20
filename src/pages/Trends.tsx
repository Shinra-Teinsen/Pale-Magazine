import React from 'react';
import { Article, Profile } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Flame, Trophy } from 'lucide-react';

interface TrendsProps {
  articles: Article[];
  user: Profile | null;
  savedIds: string[];
  likedIds: string[];
  onSelectArticle: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleLike: (id: string) => void;
  onShare: (article: Article) => void;
  onOpenComments: (article: Article) => void;
}

export const Trends: React.FC<TrendsProps> = ({
  articles,
  user,
  savedIds,
  likedIds,
  onSelectArticle,
  onToggleSave,
  onToggleLike,
  onShare,
  onOpenComments
}) => {
  // Popularity scoring algorithm: views * 1 + likes * 3 + comments * 5 + shares * 4, adjusted by recency
  const scoredArticles = articles
    .filter(a => a.status === 'published')
    .map(article => {
      const daysOld = Math.max(1, (Date.now() - new Date(article.published_at || article.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const rawScore = (article.views_count * 1) + (article.likes_count * 3) + (article.comments_count * 5) + (article.shares_count * 4);
      const recencyFactor = Math.max(0.5, 10 / daysOld); // recency bonus
      return {
        ...article,
        score: Math.round(rawScore * recencyFactor)
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="flex items-center space-x-3 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white">Tendances & Top Contenus</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Les articles les plus populaires calculés par notre algorithme d'engagement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scoredArticles.map((article, index) => (
          <div key={article.id} className="relative">
            {index < 3 && (
              <div className="absolute -top-3 -left-3 z-10 w-9 h-9 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white dark:border-neutral-900">
                #{index + 1}
              </div>
            )}
            <ArticleCard
              article={article}
              user={user}
              savedIds={savedIds}
              likedIds={likedIds}
              onSelect={onSelectArticle}
              onToggleSave={onToggleSave}
              onToggleLike={onToggleLike}
              onShare={onShare}
              onOpenComments={onOpenComments}
            />
          </div>
        ))}
      </div>

    </div>
  );
};
