import React from 'react';
import { X, Home, BookOpen, Compass, Flame, Search, Bookmark, Bell, User, Settings, Info, Mail, ShieldCheck } from 'lucide-react';
import { ActiveTab, Profile, Category } from '../types';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: Profile | null;
  categories: Category[];
  setSelectedCategorySlug: (slug: string | null) => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  user,
  categories,
  setSelectedCategorySlug,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  const handleNav = (tab: ActiveTab, catSlug?: string | null) => {
    setActiveTab(tab);
    if (catSlug !== undefined) {
      setSelectedCategorySlug(catSlug);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-[85vw] max-w-xs sm:max-w-sm bg-white dark:bg-neutral-900 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out">
          
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <span className="font-editorial text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">PALE</span>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Plateforme de contenu multi-thèmes</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-950 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            
            <button
              onClick={() => handleNav('home')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${activeTab === 'home' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            >
              <Home className="w-5 h-5" />
              <span>Accueil</span>
            </button>

            <button
              onClick={() => handleNav('articles', null)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${activeTab === 'articles' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Tous les articles</span>
            </button>

            <button
              onClick={() => handleNav('trends')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${activeTab === 'trends' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            >
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Tendances</span>
            </button>

            <button
              onClick={() => handleNav('search')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${activeTab === 'search' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            >
              <Search className="w-5 h-5" />
              <span>Recherche avancée</span>
            </button>

            {/* Categories Submenu */}
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Catégories</p>
              <div className="mt-2 space-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleNav('articles', cat.slug)}
                    className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-neutral-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors flex items-center space-x-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-neutral-600"></span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-neutral-800 my-4"></div>

            <button
              onClick={() => user ? handleNav('saved') : onOpenAuth()}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${activeTab === 'saved' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            >
              <Bookmark className="w-5 h-5" />
              <span>Articles enregistrés</span>
            </button>

            <button
              onClick={() => user ? handleNav('notifications') : onOpenAuth()}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${activeTab === 'notifications' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            >
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => user ? handleNav('profile') : onOpenAuth()}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${activeTab === 'profile' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            >
              <User className="w-5 h-5" />
              <span>Mon profil</span>
            </button>

            <button
              onClick={() => handleNav('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${activeTab === 'settings' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            >
              <Settings className="w-5 h-5" />
              <span>Paramètres & Push</span>
            </button>

            <div className="border-t border-slate-100 dark:border-neutral-800 my-4"></div>

            <button
              onClick={() => handleNav('about')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${activeTab === 'about' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            >
              <Info className="w-5 h-5" />
              <span>À propos</span>
            </button>

            <button
              onClick={() => handleNav('contact')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${activeTab === 'contact' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            >
              <Mail className="w-5 h-5" />
              <span>Contact</span>
            </button>

            {/* ADMIN SECTION (Visible only if user is admin) */}
            {user?.role === 'admin' && (
              <div className="pt-2">
                <div className="p-1 mb-2 bg-slate-950 dark:bg-neutral-800 text-white rounded-xl">
                  <button
                    onClick={() => handleNav('admin')}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-bold text-sm bg-slate-900 dark:bg-neutral-700 hover:bg-slate-800 dark:hover:bg-neutral-600 transition-colors"
                  >
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Administration PALE</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer User preview or login */}
          <div className="p-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50">
            {user ? (
              <div className="flex items-center space-x-3">
                <UserAvatar
                  url={user.avatar_url}
                  name={user.full_name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.full_name}</p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-slate-600 dark:text-neutral-400 mb-2">Connectez-vous pour interagir (likes, commentaires...)</p>
                <button
                  onClick={() => { onOpenAuth(); onClose(); }}
                  className="w-full py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-semibold hover:opacity-90 transition-colors"
                >
                  Se connecter / S'inscrire
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
