import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, Globe, Send, Mail } from 'lucide-react';
import { Article } from '../types';
import { updateArticleMetaTags } from '../lib/meta';

interface ShareModalProps {
  article: Article | null;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  article,
  onClose,
  showToast
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (article) {
      updateArticleMetaTags(article);
    }
  }, [article]);

  if (!article) return null;

  const currentUrl = window.location.href;
  const shareTitle = article.title;
  const shareExcerpt = article.excerpt || '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    showToast('Lien copié dans le presse-papier 🔗');
    setTimeout(() => setCopied(false), 3000);
  };

  const shareTo = (platform: string) => {
    let url = '';
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedExcerpt = encodeURIComponent(shareExcerpt);

    switch (platform) {
      case 'whatsapp': {
        const text = encodeURIComponent(`📰 *${shareTitle}*\n\n${shareExcerpt}\n\n🔗 Lire l'article : ${currentUrl}`);
        url = `https://api.whatsapp.com/send?text=${text}`;
        break;
      }
      case 'telegram': {
        const text = encodeURIComponent(`📰 *${shareTitle}*\n\n${shareExcerpt}`);
        url = `https://t.me/share/url?url=${encodedUrl}&text=${text}`;
        break;
      }
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'x': {
        const shortExcerpt = shareExcerpt.length > 120 ? shareExcerpt.slice(0, 120) + '...' : shareExcerpt;
        const text = encodeURIComponent(`${shareTitle}\n\n« ${shortExcerpt} »`);
        url = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;
        break;
      }
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${shareTitle}\n\n${shareExcerpt}\n\nLire l'article complet ici : ${currentUrl}`)}`;
        break;
      default:
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=450');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `${article.title}\n\n${article.excerpt}`,
          url: currentUrl,
        });
        showToast('Article partagé avec succès !');
      } catch {
        // cancelled or failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">Partager l'article</h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Aperçu avec image, titre et résumé inclus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-black dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Card Preview (Aperçu du partage) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <span>Aperçu de la carte partagée</span>
              <span className="text-[10px] uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md font-mono">Link Preview</span>
            </div>

            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 overflow-hidden shadow-xs">
              {/* Cover Image Preview */}
              <div className="relative aspect-[16/9] w-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <img
                  src={article.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800'}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-0.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase rounded-md tracking-wider">
                    {article.category?.name || 'PALE'}
                  </span>
                </div>
              </div>

              {/* Title & Résumé Preview */}
              <div className="p-4 space-y-2">
                <div className="flex items-center space-x-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                  <Globe className="w-3 h-3" />
                  <span className="font-mono truncate">pale.app/article/{article.id}</span>
                </div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug line-clamp-2">
                  {article.title}
                </h4>
                {article.excerpt && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Social Platform Grid */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Choisir une plateforme
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => shareTo('whatsapp')}
                className="p-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 font-semibold text-xs rounded-2xl flex flex-col items-center justify-center space-y-1 transition-colors border border-emerald-200 dark:border-emerald-800"
              >
                <span className="text-base">💬</span>
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => shareTo('x')}
                className="p-3 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs rounded-2xl flex flex-col items-center justify-center space-y-1 transition-colors shadow-xs"
              >
                <span className="text-base">𝕏</span>
                <span>X (Twitter)</span>
              </button>

              <button
                onClick={() => shareTo('facebook')}
                className="p-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-900 dark:text-blue-300 font-semibold text-xs rounded-2xl flex flex-col items-center justify-center space-y-1 transition-colors border border-blue-200 dark:border-blue-800"
              >
                <span className="text-base">📘</span>
                <span>Facebook</span>
              </button>

              <button
                onClick={() => shareTo('telegram')}
                className="p-3 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-900 dark:text-sky-300 font-semibold text-xs rounded-2xl flex flex-col items-center justify-center space-y-1 transition-colors border border-sky-200 dark:border-sky-800"
              >
                <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Telegram</span>
              </button>

              <button
                onClick={() => shareTo('linkedin')}
                className="p-3 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-300 font-semibold text-xs rounded-2xl flex flex-col items-center justify-center space-y-1 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">in</span>
                <span>LinkedIn</span>
              </button>

              <button
                onClick={() => shareTo('email')}
                className="p-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold text-xs rounded-2xl flex flex-col items-center justify-center space-y-1 transition-colors"
              >
                <Mail className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span>Email</span>
              </button>
            </div>

            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 mt-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Partager via les applications de votre appareil</span>
              </button>
            )}
          </div>

          {/* Direct Link Copy */}
          <div className="pt-1">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Lien direct vers l'article
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 px-3 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono text-neutral-600 dark:text-neutral-300 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center space-x-1.5 shrink-0 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
