import React, { useEffect, useState } from 'react';
import { Article, Profile, Comment } from '../types';
import { CommentSection } from '../components/CommentSection';
import { ArrowLeft, Eye, Heart, MessageCircle, Share2, Bookmark, Clock, Calendar, BookOpen, Minimize2 } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';
import { UserAvatar } from '../components/UserAvatar';
import { updateArticleMetaTags } from '../lib/meta';

interface ArticleDetailProps {
  articleId: string;
  articles: Article[];
  comments: Comment[];
  user: Profile | null;
  savedIds: string[];
  likedIds: string[];
  likedCommentIds: string[];
  onBack: () => void;
  onSelectArticle: (id: string) => void;
  onToggleSave: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleLikeComment: (id: string) => void;
  onIncrementView: (id: string) => void;
  onShare: (article: Article) => void;
  onAddComment: (articleId: string, content: string, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
  onReportComment: (commentId: string, reason: string) => void;
  onOpenAuth: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  articleId,
  articles,
  comments,
  user,
  savedIds,
  likedIds,
  likedCommentIds,
  onBack,
  onSelectArticle,
  onToggleSave,
  onToggleLike,
  onToggleLikeComment,
  onIncrementView,
  onShare,
  onAddComment,
  onDeleteComment,
  onReportComment,
  onOpenAuth
}) => {
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const article = articles.find(a => a.id === articleId);

  useEffect(() => {
    if (article) {
      onIncrementView(article.id);
      updateArticleMetaTags(article);
      window.scrollTo(0, 0);
    }
  }, [articleId]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Article introuvable</h2>
        <button onClick={onBack} className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const isSaved = savedIds.includes(article.id);
  const isLiked = likedIds.includes(article.id);
  const similarArticles = articles.filter(a => a.id !== article.id && a.category_id === article.category_id && a.status === 'published').slice(0, 3);

  // Estimated read time
  const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  // Reader Mode View
  if (isReaderMode) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF8F5] dark:bg-[#0f1115] text-[#1A1A1A] dark:text-[#F3F4F6] overflow-hidden transition-colors">
        {/* Fixed Full-Width Top Bar pinned to the very top */}
        <header className="sticky top-0 w-full z-40 bg-[#FAF8F5]/95 dark:bg-[#0f1115]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 py-3 shadow-xs shrink-0 transition-colors">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <span className="px-2.5 py-1 bg-neutral-200/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md shrink-0">
                Mode Épuré
              </span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate hidden sm:inline">
                {article.title}
              </span>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden md:inline font-medium">
                {readTime} min de lecture
              </span>
              <button
                onClick={() => setIsReaderMode(false)}
                className="flex items-center space-x-1.5 sm:space-x-2 px-3.5 sm:px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm"
              >
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Quitter <span className="hidden sm:inline">le mode épuré</span></span>
              </button>
            </div>
          </div>
          {/* Scroll progress bar aligned to the bottom of the fixed top bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-200 dark:bg-neutral-800">
            <div 
              className="h-full bg-neutral-900 dark:bg-white transition-all duration-75"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </header>

        {/* Scrollable Reader Content Container */}
        <div 
          className="flex-1 w-full overflow-y-auto px-4 sm:px-6 py-8 sm:py-12"
          onScroll={(e) => {
            const el = e.currentTarget;
            const total = el.scrollHeight - el.clientHeight;
            if (total > 0) {
              setScrollProgress((el.scrollTop / total) * 100);
            }
          }}
        >
          <div className="max-w-3xl mx-auto space-y-10 pb-24">
            {/* Article Header */}
            <div className="space-y-6 text-center max-w-2xl mx-auto pt-4">
              <span className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider rounded-full">
                {article.category?.name || 'Général'}
              </span>
              <h1 className="font-editorial text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white leading-tight">
                {article.title}
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 font-medium">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-center space-x-3 text-xs text-neutral-500 dark:text-neutral-400 pt-2">
                <span>{article.author?.full_name || 'Rédaction PALE'}</span>
                <span>•</span>
                <span>{readTime} min de lecture</span>
              </div>
            </div>

            {/* Cover Image */}
            {article.cover_image && (
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] max-h-[450px]">
                <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Reader Content (Larger font, centered/spacious) */}
            <div 
              className="prose prose-xl max-w-none text-neutral-900 dark:text-neutral-100 leading-loose space-y-8 font-sans text-lg sm:text-xl py-6"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Footer of Reader Mode */}
            <div className="pt-12 border-t border-neutral-200 dark:border-neutral-800 flex justify-center">
              <button
                onClick={() => setIsReaderMode(false)}
                className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-lg"
              >
                Quitter le mode épuré
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative overflow-hidden break-words">
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-200 dark:bg-neutral-800 z-50">
        <div 
          className="h-full bg-neutral-900 dark:bg-white transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-full text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <button
          onClick={() => setIsReaderMode(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-full text-xs font-semibold transition-colors shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>Mode lecture épuré</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        <span className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold uppercase tracking-wider rounded-full">
          {article.category?.name || 'Général'}
        </span>

        <h1 className="font-editorial text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white leading-tight">
          {article.title}
        </h1>

        <p className="text-lg text-neutral-600 dark:text-neutral-300 font-medium">
          {article.excerpt}
        </p>

        {/* Author & Meta */}
        <div className="flex items-center justify-center space-x-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <UserAvatar
            url={article.author?.avatar_url}
            name={article.author?.full_name || 'Rédaction PALE'}
            size="lg"
            className="shadow-xs"
          />
          <div className="text-left">
            <span className="font-bold text-sm text-neutral-900 dark:text-white block">{article.author?.full_name || 'Rédaction PALE'}</span>
            <div className="flex items-center space-x-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(article.published_at || article.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime} min de lecture</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Large Cover Image */}
      {article.cover_image && (
        <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] max-h-[500px]">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Stats Bar */}
      <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3.5 sm:p-4 border border-neutral-200 dark:border-neutral-700/80 grid grid-cols-2 sm:flex sm:items-center sm:justify-around gap-3 text-neutral-700 dark:text-neutral-300 text-xs font-semibold">
        <div className="flex items-center space-x-1.5" title="Vues">
          <Eye className="w-4 h-4 text-neutral-500" />
          <span>{article.views_count} vues</span>
        </div>
        <div className="flex items-center space-x-1.5" title="Likes">
          <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
          <span>{article.likes_count} likes</span>
        </div>
        <div className="flex items-center space-x-1.5" title="Commentaires">
          <MessageCircle className="w-4 h-4 text-neutral-500" />
          <span>{article.comments_count} coms</span>
        </div>
        <div className="flex items-center space-x-1.5" title="Partages">
          <Share2 className="w-4 h-4 text-neutral-500" />
          <span>{article.shares_count} partages</span>
        </div>
      </div>

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed space-y-6 font-sans"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Interaction Buttons Bar */}
      <div className="py-6 sm:py-8 border-y border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
        <button
          onClick={() => onToggleLike(article.id)}
          className={`flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs font-bold transition-all shadow-sm ${
            isLiked 
              ? 'bg-rose-600 text-white cursor-default' 
              : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white'
          }`}
          title={isLiked ? "Vous avez déjà aimé cet article (un seul like autorisé)" : "Aimer cet article"}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
          <span>{isLiked ? 'Aimé' : 'J’aime'} ({article.likes_count})</span>
        </button>

        <button
          onClick={() => onToggleSave(article.id)}
          className={`flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs font-bold transition-all shadow-sm ${isSaved ? 'bg-neutral-900 text-white' : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white'}`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          <span>{isSaved ? 'Enregistré' : 'Enregistrer'}</span>
        </button>

        <button
          onClick={() => onShare(article)}
          className="flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white rounded-full text-xs font-bold transition-all shadow-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>Partager</span>
        </button>
      </div>

      {/* Comments Section */}
      <CommentSection
        articleId={article.id}
        comments={comments}
        user={user}
        likedCommentIds={likedCommentIds}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
        onReportComment={onReportComment}
        onToggleLikeComment={onToggleLikeComment}
        onOpenAuth={onOpenAuth}
      />

      {/* Similar Articles */}
      {similarArticles.length > 0 && (
        <div className="mt-20 pt-12 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-white mb-8">Articles similaires</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarArticles.map(sim => (
              <ArticleCard
                key={sim.id}
                article={sim}
                user={user}
                savedIds={savedIds}
                likedIds={likedIds}
                onSelect={onSelectArticle}
                onToggleSave={onToggleSave}
                onToggleLike={onToggleLike}
                onShare={onShare}
              />
            ))}
          </div>
        </div>
      )}

    </article>
  );
};
