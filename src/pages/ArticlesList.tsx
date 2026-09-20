import React, { useState } from 'react';
import { Article, Category, Profile } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Search, Filter } from 'lucide-react';

interface ArticlesListProps {
  articles: Article[];
  categories: Category[];
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  user: Profile | null;
  savedIds: string[];
  likedIds: string[];
  onSelectArticle: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleLike: (id: string) => void;
  onShare: (article: Article) => void;
  onOpenComments: (article: Article) => void;
}

export const ArticlesList: React.FC<ArticlesListProps> = ({
  articles,
  categories,
  selectedCategorySlug,
  setSelectedCategorySlug,
  user,
  savedIds,
  likedIds,
  onSelectArticle,
  onToggleSave,
  onToggleLike,
  onShare,
  onOpenComments
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter(article => {
    if (article.status !== 'published') return false;
    const matchesCategory = !selectedCategorySlug || article.category?.slug === selectedCategorySlug;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div>
          <h1 className="font-editorial text-4xl font-black text-neutral-950 dark:text-white">Tous les articles</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">Explorez l’ensemble de nos publications et analyses</p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategorySlug(null)}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${!selectedCategorySlug ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md' : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'}`}
        >
          Tous les thèmes
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategorySlug(cat.slug)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedCategorySlug === cat.slug ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md' : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-neutral-600 dark:text-neutral-400 text-base font-medium">Aucun article ne correspond à votre recherche.</p>
          <button
            onClick={() => { setSelectedCategorySlug(null); setSearchQuery(''); }}
            className="mt-4 px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(article => (
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
