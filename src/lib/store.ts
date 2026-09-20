import { useState, useEffect, useMemo } from 'react';
import { Article, Category, Comment, NotificationItem, Profile, RegisteredAccount, ActiveTab, ReportItem } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_COMMENTS, INITIAL_TAGS } from '../data/mockArticles';

// Local storage keys for persistent production storage
const LS_USER = 'pale_user';
const LS_ACCOUNTS = 'pale_accounts_production';
const LS_ARTICLES = 'pale_articles';
const LS_CATEGORIES = 'pale_categories';
const LS_COMMENTS = 'pale_comments';
const LS_NOTIFICATIONS = 'pale_notifications';
const LS_REPORTS = 'pale_reports';

// Strictly isolated per-account storage key generators
const getUserSavedKey = (userId: string) => `pale_user_${userId}_saved_articles`;
const getUserLikesKey = (userId: string) => `pale_user_${userId}_liked_articles`;
const getUserCommentLikesKey = (userId: string) => `pale_user_${userId}_comment_likes`;
const getUserReadNotifsKey = (userId: string) => `pale_user_${userId}_read_notifs`;

// Unique authorized admin email in the system
export const PRIMARY_ADMIN_EMAIL = 'mesyepyewo@gmail.com';

// Initial verified administrative account
const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'admin-main',
    email: PRIMARY_ADMIN_EMAIL,
    password: 'admin',
    full_name: 'Administrateur',
    avatar_url: '',
    bio: '',
    role: 'admin',
    push_notifications_enabled: true,
    created_at: '2026-01-01T00:00:00Z'
  }
];

export function useAppStore() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  
  // Real registered accounts list (Strict: only mesyepyewo@gmail.com has admin rights)
  const [accounts, setAccounts] = useState<RegisteredAccount[]>(() => {
    const saved = localStorage.getItem(LS_ACCOUNTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasMainAdmin = parsed.some(
            (acc: RegisteredAccount) => acc.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()
          );
          const sanitized = parsed.map((acc: RegisteredAccount) => {
            const isMainAdmin = acc.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
            return {
              ...acc,
              // If account had a fake unsplash avatar previously, clear it so user customizes it
              avatar_url: acc.avatar_url && acc.avatar_url.includes('unsplash.com/photo-153') ? '' : (acc.avatar_url || ''),
              bio: acc.bio && (acc.bio.includes('Rédactrice') || acc.bio.includes('Lecteur PALE') || acc.bio.includes('Administrateur Principal')) ? '' : (acc.bio || ''),
              role: isMainAdmin ? 'admin' : 'user'
            };
          });
          return hasMainAdmin ? sanitized : [...DEFAULT_ACCOUNTS, ...sanitized];
        }
      } catch {}
    }
    return DEFAULT_ACCOUNTS;
  });

  // Auth state
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem(LS_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const isMainAdmin = parsed.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
          return {
            ...parsed,
            avatar_url: parsed.avatar_url && parsed.avatar_url.includes('unsplash.com/photo-153') ? '' : (parsed.avatar_url || ''),
            bio: parsed.bio && (parsed.bio.includes('Rédactrice') || parsed.bio.includes('Lecteur PALE') || parsed.bio.includes('Administrateur Principal')) ? '' : (parsed.bio || ''),
            role: isMainAdmin ? 'admin' : 'user'
          };
        }
      } catch { return null; }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [shareModalArticle, setShareModalArticle] = useState<Article | null>(null);

  // Data states
  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem(LS_ARTICLES);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_ARTICLES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(LS_CATEGORIES);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CATEGORIES;
  });

  const [siteSettings, setSiteSettings] = useState(() => {
    const saved = localStorage.getItem('pale_site_settings');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return {
      siteTitle: 'MAGAZINE PALE',
      siteSubtitle: 'Plateforme éditoriale indépendante : Société, Lifestyle, Culture et Actualités.',
      announcementBanner: 'Nouvelle édition disponible — Découvrez nos publications.',
      heroBadge: 'ÉDITION OFFICIELLE'
    };
  });

  const [commentModalArticle, setCommentModalArticle] = useState<Article | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('pale_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  const updateSiteSettings = (newSettings: typeof siteSettings) => {
    if (!user || user.role !== 'admin') return;
    setSiteSettings(newSettings);
    showToast('Paramètres et titres du site mis à jour !');
  };

  const addCategoryAdmin = (name: string) => {
    if (!user || user.role !== 'admin') return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: Category = { id: 'cat-' + Date.now(), name, slug };
    setCategories([...categories, newCat]);
    showToast(`Catégorie "${name}" ajoutée !`);
  };

  const deleteCategoryAdmin = (catId: string) => {
    if (!user || user.role !== 'admin') return;
    setCategories(categories.filter(c => c.id !== catId));
    showToast('Catégorie supprimée.');
  };

  const updateArticleAdmin = (articleId: string, articleData: Partial<Article>) => {
    if (!user || user.role !== 'admin') return;
    setArticles(articles.map(a => a.id === articleId ? { ...a, ...articleData, updated_at: new Date().toISOString() } : a));
    showToast('Article mis à jour avec succès !');
  };

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem(LS_COMMENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_COMMENTS;
  });

  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    const savedUser = localStorage.getItem(LS_USER);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u?.id) {
          const s = localStorage.getItem(getUserSavedKey(u.id));
          if (s) return JSON.parse(s);
        }
      } catch {}
    }
    return [];
  });

  const [likedArticleIds, setLikedArticleIds] = useState<string[]>(() => {
    const savedUser = localStorage.getItem(LS_USER);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u?.id) {
          const l = localStorage.getItem(getUserLikesKey(u.id));
          if (l) return JSON.parse(l);
        }
      } catch {}
    }
    return [];
  });

  const [likedCommentIds, setLikedCommentIds] = useState<string[]>(() => {
    const savedUser = localStorage.getItem(LS_USER);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u?.id) {
          const c = localStorage.getItem(getUserCommentLikesKey(u.id));
          if (c) return JSON.parse(c);
        }
      } catch {}
    }
    return [];
  });

  const [userReadNotifIds, setUserReadNotifIds] = useState<string[]>(() => {
    const savedUser = localStorage.getItem(LS_USER);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u?.id) {
          const r = localStorage.getItem(getUserReadNotifsKey(u.id));
          if (r) return JSON.parse(r);
        }
      } catch {}
    }
    return [];
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('pale_dark_mode');
    if (saved !== null) {
      try { return JSON.parse(saved); } catch {}
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Helper to load isolated per-user account data
  const loadUserData = (userId: string) => {
    try {
      const s = localStorage.getItem(getUserSavedKey(userId));
      setSavedArticleIds(s ? JSON.parse(s) : []);
    } catch {
      setSavedArticleIds([]);
    }
    try {
      const l = localStorage.getItem(getUserLikesKey(userId));
      setLikedArticleIds(l ? JSON.parse(l) : []);
    } catch {
      setLikedArticleIds([]);
    }
    try {
      const c = localStorage.getItem(getUserCommentLikesKey(userId));
      setLikedCommentIds(c ? JSON.parse(c) : []);
    } catch {
      setLikedCommentIds([]);
    }
    try {
      const r = localStorage.getItem(getUserReadNotifsKey(userId));
      setUserReadNotifIds(r ? JSON.parse(r) : []);
    } catch {
      setUserReadNotifIds([]);
    }
  };

  // Helper to reset state when logged out
  const clearUserData = () => {
    setSavedArticleIds([]);
    setLikedArticleIds([]);
    setLikedCommentIds([]);
    setUserReadNotifIds([]);
  };

  // Re-sync isolated user state whenever the active account changes
  useEffect(() => {
    if (user?.id) {
      loadUserData(user.id);
    } else {
      clearUserData();
    }
  }, [user?.id]);

  // Persist user-specific data to user's isolated keys ONLY
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(getUserSavedKey(user.id), JSON.stringify(savedArticleIds));
    }
  }, [savedArticleIds, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(getUserLikesKey(user.id), JSON.stringify(likedArticleIds));
    }
  }, [likedArticleIds, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(getUserCommentLikesKey(user.id), JSON.stringify(likedCommentIds));
    }
  }, [likedCommentIds, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(getUserReadNotifsKey(user.id), JSON.stringify(userReadNotifIds));
    }
  }, [userReadNotifIds, user?.id]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('pale_dark_mode');
      if (saved === null) {
        setDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('pale_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const toggleLikeComment = (commentId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    // Règle stricte : on ne peut liker qu'une seule fois par compte
    if (likedCommentIds.includes(commentId)) {
      showToast('Vous avez déjà aimé ce commentaire ❤️');
      return;
    }
    const next = [...likedCommentIds, commentId];
    setLikedCommentIds(next);
    localStorage.setItem(getUserCommentLikesKey(user.id), JSON.stringify(next));
    setComments(comments.map(c => c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c));
    showToast('Vous aimez ce commentaire ❤️');
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(LS_NOTIFICATIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'notif-1',
        user_id: 'system',
        title: 'Bienvenue sur PALE',
        message: 'Découvrez notre plateforme moderne de contenu multi-thèmes.',
        type: 'admin_announcement',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];
  });

  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem(LS_REPORTS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [toastMessage] = useState<string | null>(null);

  // Pop-ups désactivés selon la demande de l'utilisateur
  const showToast = (_msg?: string) => {};

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_USER);
    }
  }, [user]);

  // Sync data to localStorage
  useEffect(() => {
    localStorage.setItem(LS_ARTICLES, JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem(LS_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LS_COMMENTS, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(LS_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(LS_REPORTS, JSON.stringify(reports));
  }, [reports]);

  // Real Authentication Actions
  const loginUser = (email: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = accounts.find(a => a.email.toLowerCase() === normalizedEmail);
    if (!found) {
      return { success: false, error: 'Aucun compte associé à cette adresse e-mail.' };
    }
    if (found.password && found.password !== password) {
      return { success: false, error: 'Mot de passe incorrect.' };
    }
    const { password: _, ...profile } = found;
    loadUserData(profile.id);
    setUser(profile);
    setAuthModalOpen(false);
    return { success: true };
  };

  const registerUser = (data: {
    fullName: string;
    email: string;
    password: string;
  }): { success: boolean; error?: string } => {
    const normalizedEmail = data.email.trim().toLowerCase();
    if (accounts.some(a => a.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Cette adresse e-mail est déjà utilisée.' };
    }
    // Strict authorization: public registrations can only ever be standard 'user'
    const newAccount: RegisteredAccount = {
      id: 'usr-' + Date.now(),
      email: normalizedEmail,
      password: data.password,
      full_name: data.fullName.trim(),
      avatar_url: '',
      bio: '',
      role: 'user',
      push_notifications_enabled: true,
      created_at: new Date().toISOString()
    };

    setAccounts(prev => [...prev, newAccount]);
    const { password: _, ...profile } = newAccount;
    clearUserData();
    setUser(profile);
    setAuthModalOpen(false);
    return { success: true };
  };

  const resetPassword = (email: string): { success: boolean; message: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = accounts.find(a => a.email.toLowerCase() === normalizedEmail);
    if (!found) {
      return { success: false, message: 'Aucun compte enregistré avec cette adresse e-mail.' };
    }
    return { success: true, message: `Un lien de réinitialisation sécurisé a été envoyé à ${normalizedEmail}.` };
  };

  const updateUserProfile = (updatedProfile: Profile) => {
    // Preserve database authorized role - cannot escalate via profile edit
    const existing = accounts.find(a => a.id === updatedProfile.id);
    const enforcedRole = existing ? existing.role : 'user';
    const sanitizedProfile: Profile = {
      ...updatedProfile,
      role: enforcedRole
    };
    setUser(sanitizedProfile);
    setAccounts(prev => prev.map(a => a.id === sanitizedProfile.id ? { ...a, ...sanitizedProfile } : a));
    showToast('Profil mis à jour ✨');
  };

  const logout = () => {
    setUser(null);
    clearUserData();
    setActiveTab('home');
  };

  const toggleSaveArticle = (articleId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const isSaved = savedArticleIds.includes(articleId);
    const next = isSaved 
      ? savedArticleIds.filter(id => id !== articleId) 
      : [...savedArticleIds, articleId];

    setSavedArticleIds(next);
    localStorage.setItem(getUserSavedKey(user.id), JSON.stringify(next));
  };

  const toggleLikeArticle = (articleId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    // Règle stricte : on ne peut liker qu'une seule fois par compte
    if (likedArticleIds.includes(articleId)) {
      showToast('Vous avez déjà aimé cet article ❤️');
      return;
    }
    const next = [...likedArticleIds, articleId];
    setLikedArticleIds(next);
    localStorage.setItem(getUserLikesKey(user.id), JSON.stringify(next));
    setArticles(articles.map(art => 
      art.id === articleId 
        ? { ...art, likes_count: art.likes_count + 1 } 
        : art
    ));
    showToast('Vous aimez cet article ❤️');
  };

  const incrementViewCount = (articleId: string) => {
    setArticles(articles.map(art => art.id === articleId ? { ...art, views_count: art.views_count + 1 } : art));
  };

  const addComment = (articleId: string, content: string, parentId?: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const newComment: Comment = {
      id: 'com-' + Date.now(),
      article_id: articleId,
      user_id: user.id,
      parent_id: parentId || null,
      content,
      likes_count: 0,
      created_at: new Date().toISOString(),
      user: user
    };
    setComments([newComment, ...comments]);
    setArticles(articles.map(art => art.id === articleId ? { ...art, comments_count: art.comments_count + 1 } : art));
  };

  const deleteComment = (commentId: string) => {
    if (!user) return;
    const target = comments.find(c => c.id === commentId);
    if (!target) return;
    // Strict isolation: only comment author or admin can delete
    if (target.user_id !== user.id && user.role !== 'admin') {
      return;
    }
    setComments(comments.filter(c => c.id !== commentId && c.parent_id !== commentId));
    setArticles(articles.map(art => art.id === target.article_id ? { ...art, comments_count: Math.max(0, art.comments_count - 1) } : art));
  };

  const reportComment = (commentId: string, reason: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const newReport: ReportItem = {
      id: 'rep-' + Date.now(),
      comment_id: commentId,
      user_id: user.id,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
      comment: comments.find(c => c.id === commentId),
      user: user
    };
    setReports([newReport, ...reports]);
    showToast('Commentaire signalé à l’administration.');
  };

  const publishArticleAdmin = (articleData: Partial<Article>) => {
    if (!user || user.role !== 'admin') {
      showToast('Action réservée à l’administrateur.');
      return;
    }
    const newArt: Article = {
      id: 'art-' + Date.now(),
      title: articleData.title || 'Nouvel article',
      slug: (articleData.title || 'nouvel-article').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content: articleData.content || '',
      excerpt: articleData.excerpt || '',
      cover_image: articleData.cover_image || '',
      category_id: articleData.category_id || categories[0]?.id || 'cat-1',
      author_id: user.id,
      status: articleData.status || 'published',
      published_at: articleData.status === 'published' ? new Date().toISOString() : undefined,
      is_featured: articleData.is_featured || false,
      quote_attribution: articleData.quote_attribution || '',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: user,
      category: categories.find(c => c.id === articleData.category_id) || categories[0]
    };

    setArticles([newArt, ...articles]);
    
    // Create notification for users if published
    if (newArt.status === 'published') {
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        user_id: 'all',
        title: 'Nouvelle publication 📰',
        message: `"${newArt.title}" vient d'être publié sur PALE.`,
        type: 'new_article',
        related_id: newArt.id,
        is_read: false,
        created_at: new Date().toISOString()
      };
      setNotifications([newNotif, ...notifications]);
    }

    showToast('Article enregistré et publié avec succès !');
  };

  const deleteArticleAdmin = (articleId: string) => {
    if (!user || user.role !== 'admin') return;
    setArticles(articles.filter(a => a.id !== articleId));
    showToast('Article supprimé.');
  };

  const broadcastAnnouncement = (title: string, message: string) => {
    if (!user || user.role !== 'admin') return;
    const ann: NotificationItem = {
      id: 'ann-' + Date.now(),
      user_id: 'all',
      title: `📢 ${title}`,
      message,
      type: 'admin_announcement',
      is_read: false,
      created_at: new Date().toISOString()
    };
    setNotifications([ann, ...notifications]);
    showToast('Annonce diffusée à tous les utilisateurs !');
  };

  const togglePushNotifications = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const current = user.push_notifications_enabled || false;
    const updated = { ...user, push_notifications_enabled: !current };
    setUser(updated);
  };

  // Strictly isolate notification visibility & read status per user account
  const userNotifications = useMemo(() => {
    if (!user) return [];
    return notifications
      .filter(n => n.user_id === 'all' || n.user_id === 'system' || n.user_id === user.id)
      .map(n => ({
        ...n,
        is_read: userReadNotifIds.includes(n.id) || n.is_read
      }));
  }, [notifications, user, userReadNotifIds]);

  const markNotificationRead = (notifId: string) => {
    if (!user) return;
    if (!userReadNotifIds.includes(notifId)) {
      const next = [...userReadNotifIds, notifId];
      setUserReadNotifIds(next);
      localStorage.setItem(getUserReadNotifsKey(user.id), JSON.stringify(next));
    }
  };

  const toggleNotificationRead = (notifId: string) => {
    if (!user) return;
    const isRead = userReadNotifIds.includes(notifId);
    const next = isRead 
      ? userReadNotifIds.filter(id => id !== notifId) 
      : [...userReadNotifIds, notifId];
    setUserReadNotifIds(next);
    localStorage.setItem(getUserReadNotifsKey(user.id), JSON.stringify(next));
  };

  const markAllNotificationsRead = () => {
    if (!user) return;
    const currentVisibleIds = userNotifications.map(n => n.id);
    const next = Array.from(new Set([...userReadNotifIds, ...currentVisibleIds]));
    setUserReadNotifIds(next);
    localStorage.setItem(getUserReadNotifsKey(user.id), JSON.stringify(next));
  };

  const resetAllData = () => {
    localStorage.clear();
    setArticles(INITIAL_ARTICLES);
    setCategories(INITIAL_CATEGORIES);
    setComments(INITIAL_COMMENTS);
    setSavedArticleIds([]);
    setLikedArticleIds([]);
    setUser(null);
    setNotifications([]);
    setReports([]);
    setSiteSettings({
      siteTitle: 'MAGAZINE PALE',
      siteSubtitle: 'Plateforme éditoriale indépendante : Société, Lifestyle, Culture et Actualités.',
      announcementBanner: 'Nouvelle édition disponible — Découvrez nos publications.',
      heroBadge: 'ÉDITION OFFICIELLE'
    });
    showToast('Application remise à zéro avec succès.');
  };

  return {
    activeTab,
    setActiveTab,
    selectedArticleId,
    setSelectedArticleId,
    selectedCategorySlug,
    setSelectedCategorySlug,
    user,
    setUser,
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    supabaseModalOpen,
    setSupabaseModalOpen,
    shareModalArticle,
    setShareModalArticle,
    articles,
    categories,
    comments,
    siteSettings,
    commentModalArticle,
    setCommentModalArticle,
    savedArticleIds,
    likedArticleIds,
    likedCommentIds,
    darkMode,
    notifications: userNotifications,
    reports,
    toastMessage,
    showToast,
    loginUser,
    registerUser,
    resetPassword,
    updateUserProfile,
    accounts,
    logout,
    toggleSaveArticle,
    toggleLikeArticle,
    toggleLikeComment,
    toggleDarkMode,
    incrementViewCount,
    addComment,
    deleteComment,
    reportComment,
    publishArticleAdmin,
    updateArticleAdmin,
    deleteArticleAdmin,
    addCategoryAdmin,
    deleteCategoryAdmin,
    updateSiteSettings,
    broadcastAnnouncement,
    togglePushNotifications,
    markNotificationRead,
    toggleNotificationRead,
    markAllNotificationsRead,
    resetAllData
  };
}
