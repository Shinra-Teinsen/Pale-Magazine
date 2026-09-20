import React, { useState } from 'react';
import { Menu, Search, Bell, Bookmark, User, ShieldCheck, LogIn, Sparkles, Moon, Sun } from 'lucide-react';
import { Profile, NotificationItem, ActiveTab } from '../types';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  user: Profile | null;
  notifications: NotificationItem[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSidebar: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  notifications,
  activeTab,
  setActiveTab,
  onOpenSidebar,
  onOpenAuth,
  onLogout,
  darkMode,
  onToggleDarkMode
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: Menu button + Logo */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onOpenSidebar}
            className="p-2 text-slate-700 dark:text-neutral-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2 text-left group focus:outline-none"
          >
            <span className="font-editorial text-2xl sm:text-4xl font-black tracking-tighter text-slate-950 dark:text-white group-hover:opacity-90 transition-opacity">
              PALE
            </span>
            <span className="hidden sm:inline-block text-xs uppercase tracking-widest font-semibold px-2 py-0.5 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 rounded-full">
              Mag
            </span>
          </button>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 sm:p-2.5 rounded-full text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Search Button (desktop/tablet) */}
          <button
            onClick={() => setActiveTab('search')}
            className={`hidden sm:flex p-2.5 rounded-full transition-colors ${activeTab === 'search' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-900' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            title="Rechercher"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Saved Articles (desktop/tablet) */}
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth('login');
              } else {
                setActiveTab('saved');
              }
            }}
            className={`hidden sm:flex p-2.5 rounded-full transition-colors relative ${activeTab === 'saved' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-900' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            title="Articles enregistrés"
          >
            <Bookmark className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              if (!user) {
                onOpenAuth('login');
              } else {
                setActiveTab('notifications');
              }
            }}
            className={`p-2 sm:p-2.5 rounded-full transition-colors relative ${activeTab === 'notifications' ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-900' : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-1.5 p-1 sm:pl-1.5 sm:pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 transition-all"
              >
                <UserAvatar
                  url={user.avatar_url}
                  name={user.full_name}
                  size="sm"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-neutral-200 hidden md:inline-block max-w-[100px] truncate">
                  {user.full_name.split(' ')[0]}
                </span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-neutral-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="inline-flex items-center space-x-1 mt-1 text-[10px] font-bold bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-emerald-400 dark:text-emerald-600" />
                        <span>Administrateur</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => { setActiveTab('profile'); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Mon profil</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => { setActiveTab('admin'); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Administration</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 dark:border-neutral-800 my-1"></div>

                  <button
                    onClick={() => { onLogout(); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-neutral-300 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-3 sm:px-4.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-slate-950 dark:bg-white hover:opacity-90 text-white dark:text-slate-950 rounded-full shadow-sm transition-all"
              >
                S'inscrire
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
