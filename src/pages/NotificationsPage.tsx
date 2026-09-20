import React from 'react';
import { NotificationItem, Profile } from '../types';
import { Bell, CheckCheck, Sparkles, MessageCircle, Heart, Newspaper, Check, RotateCcw } from 'lucide-react';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  user: Profile | null;
  onMarkAllRead: () => void;
  onMarkNotificationRead: (notificationId: string) => void;
  onToggleNotificationRead?: (notificationId: string) => void;
  onSelectArticle: (articleId: string) => void;
  onOpenAuth: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  user,
  onMarkAllRead,
  onMarkNotificationRead,
  onToggleNotificationRead,
  onSelectArticle,
  onOpenAuth
}) => {
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Bell className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
        <h2 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-white">Centre de notifications</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Connectez-vous pour consulter vos notifications et annonces.</p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-semibold shadow-md"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_article': return <Newspaper className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'comment_reply': return <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'comment_like': return <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />;
      default: return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const handleCardClick = (notif: NotificationItem) => {
    // Dès qu'on appuie sur la notification, elle est aussitôt marquée comme lue sans le faire à la main
    if (!notif.is_read) {
      onMarkNotificationRead(notif.id);
    }
    if (notif.related_id) {
      onSelectArticle(notif.related_id);
    }
  };

  const handleToggleClick = (e: React.MouseEvent, notif: NotificationItem) => {
    e.stopPropagation();
    if (onToggleNotificationRead) {
      onToggleNotificationRead(notif.id);
    } else {
      onMarkNotificationRead(notif.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-editorial text-3xl font-black text-neutral-950 dark:text-white">Notifications</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Restez informé des nouveautés et interactions</p>
          </div>
        </div>

        <button
          onClick={onMarkAllRead}
          className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Tout marquer comme lu</span>
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">Aucune notification pour le moment.</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleCardClick(notif)}
              className={`p-5 rounded-3xl border transition-all flex items-start space-x-4 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 ${
                notif.is_read 
                  ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-80' 
                  : 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700 shadow-sm ring-1 ring-neutral-900/5 dark:ring-white/5'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{notif.title}</h4>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">{notif.message}</p>
                {notif.related_id && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1.5 flex items-center space-x-1">
                    <span>Appuyez pour ouvrir l'article</span>
                    <span>→</span>
                  </p>
                )}
              </div>

              {/* Status indicator & toggle button */}
              <div className="flex items-center space-x-2 shrink-0 self-center">
                {!notif.is_read ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" title="Non lu" />
                ) : (
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium hidden sm:inline">Lu</span>
                )}
                <button
                  onClick={(e) => handleToggleClick(e, notif)}
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                  title={notif.is_read ? "Marquer comme non lu" : "Marquer comme lu"}
                >
                  {notif.is_read ? (
                    <RotateCcw className="w-3.5 h-3.5" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
