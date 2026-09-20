import React from 'react';
import { Eye, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Article, Profile } from '../types';
import { UserAvatar } from './UserAvatar';

interface ArticleCardProps {
  article: Article;
  user: Profile | null;
  savedIds: string[];
  likedIds: string[];
  onSelect: (articleId: string) => void;
  onToggleSave: (articleId: string) => void;
  onToggleLike: (articleId: string) => void;
  onShare: (article: Article) => void;
  onOpenComments: (article: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  user,
  savedIds,
  likedIds,
  onSelect,
  onToggleSave,
  onToggleLike,
  onShare,
  onOpenComments
}) => {
  const isSaved = savedIds.includes(article.id);
  const isLiked = likedIds.includes(article.id);

  return (
    <div className="group bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-sm hover:shadow-xl dark:hover:shadow-neutral-950/60 transition-all duration-300 overflow-hidden flex flex-col">
      
      {/* Cover Image & Category Badge */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-neutral-800 cursor-pointer" onClick={() => onSelect(article.id)}>
        <img
          src={article.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xs border border-transparent dark:border-neutral-700">
            {article.category?.name || 'Général'}
          </span>
        </div>

        {/* Save Bookmark button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(article.id); }}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all ${isSaved ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-900' : 'bg-white/80 dark:bg-neutral-900/80 hover:bg-white dark:hover:bg-neutral-900 text-slate-800 dark:text-neutral-200'}`}
          title="Enregistrer"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Author & Date */}
          <div className="flex items-center space-x-3 mb-3">
            <UserAvatar
              url={article.author?.avatar_url}
              name={article.author?.full_name || 'Rédaction PALE'}
              size="sm"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">{article.author?.full_name || 'Rédaction PALE'}</span>
              <span className="text-slate-400 dark:text-neutral-500 mx-1.5">•</span>
              <span className="text-slate-500 dark:text-neutral-400">
                {new Date(article.published_at || article.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          {/* Quote attribution if present */}
          {article.quote_attribution && (
            <span className="inline-block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-md mb-2">
              💬 {article.quote_attribution}
            </span>
          )}

          {/* Title */}
          <h3 
            onClick={() => onSelect(article.id)}
            className="font-editorial text-xl font-bold text-slate-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer mb-2"
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-slate-600 dark:text-neutral-300 text-sm line-clamp-2 mb-6">
            {article.excerpt}
          </p>
        </div>

        {/* Footer Metrics */}
        <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1" title="Vues">
              <Eye className="w-4 h-4" />
              <span>{article.views_count}</span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(article.id);
              }}
              className={`flex items-center space-x-1 transition-colors ${isLiked ? 'text-rose-600 font-bold cursor-default' : 'hover:text-rose-600'}`}
              title={isLiked ? "Vous avez déjà aimé cet article (1 like par compte)" : "Aimer cet article"}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{article.likes_count}</span>
            </button>
            <button
              onClick={() => onOpenComments(article)}
              className="flex items-center space-x-1 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Voir les commentaires"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{article.comments_count}</span>
            </button>
          </div>

          <button
            onClick={() => onShare(article)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full text-slate-600 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white transition-colors"
            title="Partager"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
