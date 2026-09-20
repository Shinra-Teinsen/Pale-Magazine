import React, { useState, useEffect } from 'react';
import { Article, Profile } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Bookmark, WifiOff } from 'lucide-react';

interface SavedArticlesProps {
  articles: Article[];
  savedIds: string[];
  user: Profile | null;
  likedIds: string[];
  onSelectArticle: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleLike: (id: string) => void;
  onShare: (article: Article) => void;
  onOpenComments: (article: Article) => void;
  onOpenAuth: () => void;
}

export const SavedArticles: React.FC<SavedArticlesProps> = ({
  articles,
  savedIds,
  user,
  likedIds,
  onSelectArticle,
  onToggleSave,
  onToggleLike,
  onShare,
  onOpenComments,
  onOpenAuth
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Bookmark className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
        <h2 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-white">Articles enregistrés</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Veuillez vous connecter pour retrouver vos articles favoris enregistrés sur tous vos appareils.</p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-semibold shadow-md"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const savedArticles = articles.filter(a => savedIds.includes(a.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
            <Bookmark className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white">Mes articles enregistrés</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Retrouvez votre bibliothèque personnelle d'articles sauvegardés pour consultation hors-ligne</p>
          </div>
        </div>

        {!isOnline && (
          <div className="inline-flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-xl text-xs font-semibold">
            <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Mode hors-ligne actif — Consultation des articles en cache</span>
          </div>
        )}
      </div>

      {savedArticles.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <p className="text-neutral-600 dark:text-neutral-400 font-medium text-sm">Vous n'avez encore enregistré aucun article.</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Cliquez sur l'icône de signet sur n'importe quel article pour l'ajouter à vos favoris hors-ligne.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedArticles.map(article => (
            <ArticleCard
              key={article.id}
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
          ))}
        </div>
      )}

    </div>
  );
};
