import React from 'react';
import { Home, BookOpen, Search, Bookmark, User, LogIn } from 'lucide-react';
import { ActiveTab, Profile } from '../types';
import { UserAvatar } from './UserAvatar';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: Profile | null;
  savedCount: number;
  onOpenAuth: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  user,
  savedCount,
  onOpenAuth
}) => {
  return (
    <nav 
      aria-label="Navigation mobile"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-slate-200 dark:border-neutral-800 md:hidden transition-colors"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16 items-center px-2">
        {/* Accueil */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center h-full space-y-1 transition-colors relative ${
            activeTab === 'home' 
              ? 'text-slate-950 dark:text-white font-bold' 
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Accueil</span>
          {activeTab === 'home' && (
            <span className="absolute top-1 w-1.5 h-1.5 bg-slate-950 dark:bg-white rounded-full" />
          )}
        </button>

        {/* Explorer / Articles */}
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex flex-col items-center justify-center h-full space-y-1 transition-colors relative ${
            activeTab === 'articles' || activeTab === 'trends'
              ? 'text-slate-950 dark:text-white font-bold' 
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
          }`}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === 'articles' || activeTab === 'trends' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Articles</span>
          {(activeTab === 'articles' || activeTab === 'trends') && (
            <span className="absolute top-1 w-1.5 h-1.5 bg-slate-950 dark:bg-white rounded-full" />
          )}
        </button>

        {/* Recherche */}
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center justify-center h-full space-y-1 transition-colors relative ${
            activeTab === 'search' 
              ? 'text-slate-950 dark:text-white font-bold' 
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
          }`}
        >
          <Search className={`w-5 h-5 ${activeTab === 'search' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Recherche</span>
          {activeTab === 'search' && (
            <span className="absolute top-1 w-1.5 h-1.5 bg-slate-950 dark:bg-white rounded-full" />
          )}
        </button>

        {/* Favoris */}
        <button
          onClick={() => {
            if (!user) {
              onOpenAuth();
            } else {
              setActiveTab('saved');
            }
          }}
          className={`flex flex-col items-center justify-center h-full space-y-1 transition-colors relative ${
            activeTab === 'saved' 
              ? 'text-slate-950 dark:text-white font-bold' 
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
          }`}
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 ${activeTab === 'saved' ? 'fill-current stroke-[2.5]' : 'stroke-2'}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Favoris</span>
          {activeTab === 'saved' && (
            <span className="absolute top-1 w-1.5 h-1.5 bg-slate-950 dark:bg-white rounded-full" />
          )}
        </button>

        {/* Profil / Connexion */}
        <button
          onClick={() => {
            if (!user) {
              onOpenAuth();
            } else {
              setActiveTab('profile');
            }
          }}
          className={`flex flex-col items-center justify-center h-full space-y-1 transition-colors relative ${
            activeTab === 'profile' || activeTab === 'admin'
              ? 'text-slate-950 dark:text-white font-bold' 
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
          }`}
        >
          {user ? (
            <UserAvatar
              url={user.avatar_url}
              name={user.full_name}
              size="xs"
              className={`${activeTab === 'profile' || activeTab === 'admin' ? 'border-slate-950 dark:border-white ring-1 ring-slate-950' : 'border-slate-300'}`}
            />
          ) : (
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          )}
          <span className="text-[10px] tracking-tight truncate max-w-[50px]">
            {user ? 'Profil' : 'Compte'}
          </span>
          {(activeTab === 'profile' || activeTab === 'admin') && (
            <span className="absolute top-1 w-1.5 h-1.5 bg-slate-950 dark:bg-white rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
};
