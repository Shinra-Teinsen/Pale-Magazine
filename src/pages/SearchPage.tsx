import React, { useState } from 'react';
import { Article, Category, Profile } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchPageProps {
  articles: Article[];
  categories: Category[];
  user: Profile | null;
  savedIds: string[];
  likedIds: string[];
  onSelectArticle: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleLike: (id: string) => void;
  onShare: (article: Article) => void;
  onOpenComments: (article: Article) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  articles,
  categories,
  user,
  savedIds,
  likedIds,
  onSelectArticle,
  onToggleSave,
  onToggleLike,
  onShare,
  onOpenComments
}) => {
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const filtered = articles.filter(article => {
    if (article.status !== 'published') return false;
    const matchesQuery = !query || 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase());
    const matchesCat = selectedCat === 'all' || article.category_id === selectedCat;
    return matchesQuery && matchesCat;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.views_count - a.views_count;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="font-editorial text-4xl font-black text-neutral-950 dark:text-white">Recherche avancée</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Trouvez instantanément les articles, analyses et thématiques qui vous passionnent.</p>
        
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par mot-clé, titre ou contenu..."
            className="w-full pl-12 pr-4 py-3.5 text-base bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            autoFocus
          />
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200"
          >
            <option value="recent">Plus récents</option>
            <option value="popular">Plus populaires (Vues)</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="pt-6">
        <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-6">
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-600 dark:text-neutral-400 font-medium text-sm">Aucun article ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(article => (
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

    </div>
  );
};
