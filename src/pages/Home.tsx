import React from 'react';
import { Article, Category, Profile } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';

interface HomeProps {
  articles: Article[];
  categories: Category[];
  user: Profile | null;
  savedIds: string[];
  likedIds: string[];
  siteSettings: {
    siteTitle: string;
    siteSubtitle: string;
    announcementBanner: string;
    heroBadge: string;
  };
  onSelectArticle: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleLike: (id: string) => void;
  onShare: (article: Article) => void;
  onOpenComments: (article: Article) => void;
  setActiveTab: (tab: any) => void;
  setSelectedCategorySlug: (slug: string | null) => void;
}

export const Home: React.FC<HomeProps> = ({
  articles,
  categories,
  user,
  savedIds,
  likedIds,
  siteSettings,
  onSelectArticle,
  onToggleSave,
  onToggleLike,
  onShare,
  onOpenComments,
  setActiveTab,
  setSelectedCategorySlug
}) => {
  const featuredArticles = articles.filter(a => a.is_featured && a.status === 'published');
  const recentArticles = articles.filter(a => a.status === 'published');
  const heroArticle = featuredArticles[0] || recentArticles[0];
  const secondaryFeatured = featuredArticles[1] || recentArticles[1];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Showit Blog Template Hero Banner */}
      <section className="bg-[#111111] text-white py-12 sm:py-20 px-4 sm:px-6 text-center border-b border-neutral-800 relative">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {user && (
            <div className="inline-flex items-center space-x-2 bg-emerald-950/80 text-emerald-300 text-xs px-3.5 py-1.5 rounded-full font-medium border border-emerald-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Bon retour parmi nous, {user.full_name} !</span>
            </div>
          )}
          <div>
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-emerald-400 font-semibold">{siteSettings.heroBadge}</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">{siteSettings.siteTitle}</h1>
          <p className="text-neutral-400 text-xs sm:text-sm tracking-wide font-medium max-w-xl mx-auto px-2">
            {siteSettings.siteSubtitle}
          </p>
          <div className="pt-1 sm:pt-2">
            <span className="inline-block bg-neutral-800 text-neutral-200 text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-full font-medium border border-neutral-700 max-w-full truncate">
              {siteSettings.announcementBanner}
            </span>
          </div>
        </div>
      </section>

      {/* Category Browse Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-4 sm:py-6 border-b border-neutral-200 dark:border-neutral-800 sm:flex-wrap sm:justify-center text-xs uppercase tracking-wider font-semibold text-neutral-600 dark:text-neutral-400 no-scrollbar w-full">
          <span className="text-neutral-400 dark:text-neutral-500 italic font-normal lowercase font-editorial text-base shrink-0 hidden sm:inline">Explorer le blog :</span>
          <button
            onClick={() => { setActiveTab('articles'); setSelectedCategorySlug(null); }}
            className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 sm:bg-transparent sm:hover:bg-transparent text-neutral-800 dark:text-neutral-200 sm:text-neutral-600 sm:dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveTab('articles'); setSelectedCategorySlug(cat.slug); }}
              className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 sm:bg-transparent sm:hover:bg-transparent text-neutral-800 dark:text-neutral-200 sm:text-neutral-600 sm:dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Asymmetrical Featured Article Section (Showit Style) */}
      {heroArticle && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 w-full overflow-hidden">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-0 w-full">
            
            {/* Image side */}
            <div 
              onClick={() => onSelectArticle(heroArticle.id)}
              className="lg:col-span-7 aspect-[16/11] overflow-hidden rounded-2xl shadow-xl cursor-pointer group bg-neutral-100 dark:bg-neutral-800 w-full"
            >
              <img
                src={heroArticle.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200'}
                alt={heroArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Overlapping Content Box */}
            <div className="lg:col-span-5 lg:-ml-12 z-10 bg-white dark:bg-neutral-900 p-6 sm:p-10 rounded-2xl shadow-xl dark:shadow-neutral-950/70 border border-neutral-200/80 dark:border-neutral-800 my-4 lg:my-0 transition-colors max-w-full">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mb-2 sm:mb-3 block">
                {heroArticle.category?.name || 'À LA UNE'}
              </span>
              <h2 
                onClick={() => onSelectArticle(heroArticle.id)}
                className="font-editorial text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-3 sm:mb-4 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer leading-snug sm:leading-tight break-words"
              >
                {heroArticle.title}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm mb-5 sm:mb-8 leading-relaxed line-clamp-3 break-words">
                {heroArticle.excerpt}
              </p>
              <button
                onClick={() => onSelectArticle(heroArticle.id)}
                className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-bold text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white pb-1 hover:opacity-70 transition-opacity"
              >
                <span>Lire l'article</span>
                <span>→</span>
              </button>
            </div>

          </div>
        </section>
      )}

      {/* Publications Récentes / Magazine Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">Derniers Articles</h2>
          <button
            onClick={() => setActiveTab('articles')}
            className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            Voir tout →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentArticles.map(article => (
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
      </section>

    </div>
  );
};
