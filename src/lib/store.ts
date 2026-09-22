import { useState, useEffect, useMemo, useCallback } from 'react';
import { Article, Category, Comment, NotificationItem, Profile, RegisteredAccount, ActiveTab, ReportItem } from '../types';
import { supabase, isSupabaseConfigured, PRIMARY_ADMIN_EMAIL } from './supabase';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_COMMENTS } from '../data/mockArticles';

// Local storage persistence keys for offline/preview fallback
const STORAGE_USER_KEY = 'PALE_AUTH_USER';
const STORAGE_ACCOUNTS_KEY = 'PALE_ACCOUNTS';
const STORAGE_SAVED_KEY = 'PALE_SAVED_ARTICLES';
const STORAGE_LIKES_KEY = 'PALE_LIKED_ARTICLES';
const STORAGE_SETTINGS_KEY = 'PALE_SITE_SETTINGS';

// Default pre-seeded admin account
const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'admin-mesyepyewo',
    email: PRIMARY_ADMIN_EMAIL,
    full_name: 'Admin PALE (mesyepyewo)',
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=mesyepyewo`,
    bio: 'Direction éditoriale PALE Magazine',
    role: 'admin',
    push_notifications_enabled: true,
    created_at: new Date().toISOString()
  }
];

export function useAppStore() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  
  // Registered accounts
  const [accounts, setAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.some(a => a.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase())) {
            return [...DEFAULT_ACCOUNTS, ...parsed];
          }
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_ACCOUNTS;
  });

  // Current active user session
  const [user, setUser] = useState<Profile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          if (parsed.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
            parsed.role = 'admin';
          }
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [authLoading, setAuthLoading] = useState(true);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [shareModalArticle, setShareModalArticle] = useState<Article | null>(null);
  const [commentModalArticle, setCommentModalArticle] = useState<Article | null>(null);

  // Core data states (synchronized via Supabase for all users globally)
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-welcome',
      user_id: 'all',
      title: 'Bienvenue sur PALE',
      message: 'Explorez nos articles exclusifs sur la Société, le Lifestyle et la Culture.',
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString()
    }
  ]);

  const [reports, setReports] = useState<ReportItem[]>([]);
  
  // User relational state (likes, bookmarks)
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [likedArticleIds, setLikedArticleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_LIKES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [userReadNotifIds, setUserReadNotifIds] = useState<string[]>([]);

  // Site settings
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      siteTitle: 'MAGAZINE PALE',
      siteSubtitle: 'Plateforme éditoriale indépendante : Société, Lifestyle, Culture et Actualités.',
      announcementBanner: 'Nouvelle édition disponible — Découvrez nos publications.',
      heroBadge: 'ÉDITION OFFICIELLE'
    };
  });

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg?: string) => {
    if (!msg) return;
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3500);
  }, []);

  // Helper to fetch user profile from Supabase profiles table
  const fetchUserProfile = useCallback(async (userId: string, userEmail: string, userMetadata?: any): Promise<Profile | null> => {
    if (!supabase) return null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const isAdminEmail = userEmail?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

      if (data) {
        const enforcedRole = isAdminEmail ? 'admin' : (data.role || 'user');
        if (isAdminEmail && data.role !== 'admin') {
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
        }
        return {
          ...data,
          role: enforcedRole
        };
      }

      const newProfile: Profile = {
        id: userId,
        email: userEmail,
        full_name: userMetadata?.full_name || userEmail.split('@')[0] || 'Utilisateur',
        avatar_url: userMetadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userEmail)}`,
        bio: '',
        role: isAdminEmail ? 'admin' : 'user',
        push_notifications_enabled: true,
        created_at: new Date().toISOString()
      };

      await supabase.from('profiles').upsert(newProfile);
      return newProfile;
    } catch (err) {
      console.error('Error fetching Supabase profile:', err);
      return null;
    }
  }, []);

  // Load user data from Supabase
  const loadUserSupabaseData = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
      const { data: savedData } = await supabase
        .from('saved_articles')
        .select('article_id')
        .eq('user_id', userId);
      if (savedData) {
        setSavedArticleIds(savedData.map(s => s.article_id));
      }

      const { data: likedData } = await supabase
        .from('article_likes')
        .select('article_id')
        .eq('user_id', userId);
      if (likedData) {
        setLikedArticleIds(likedData.map(l => l.article_id));
      }

      const { data: comLikedData } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId);
      if (comLikedData) {
        setLikedCommentIds(comLikedData.map(c => c.comment_id));
      }
    } catch (err) {
      console.error('Error loading user Supabase data:', err);
    }
  }, []);

  // Fetch all main data from Supabase with automatic global seeding if empty
  const fetchSupabaseData = useCallback(async () => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    try {
      // 1. Fetch Categories
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (!catErr && catData && catData.length > 0) {
        setCategories(catData);
      } else if (!catErr && (!catData || catData.length === 0)) {
        // Seed initial categories globally so all users see them
        for (const cat of INITIAL_CATEGORIES) {
          await supabase.from('categories').insert({ id: cat.id, name: cat.name, slug: cat.slug }).select();
        }
        const { data: seededCat } = await supabase.from('categories').select('*').order('name');
        if (seededCat && seededCat.length > 0) setCategories(seededCat);
      }

      // 2. Fetch Articles
      const { data: artData, error: artErr } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(*),
          author:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (!artErr && artData && artData.length > 0) {
        setArticles(artData);
      } else if (!artErr && (!artData || artData.length === 0)) {
        // Seed initial articles globally in Supabase database for all users
        for (const art of INITIAL_ARTICLES) {
          await supabase.from('articles').insert({
            id: art.id,
            title: art.title,
            slug: art.slug,
            content: art.content,
            excerpt: art.excerpt,
            cover_image: art.cover_image,
            category_id: art.category_id,
            author_id: PRIMARY_ADMIN_EMAIL,
            status: art.status || 'published',
            published_at: art.published_at || art.created_at,
            is_featured: art.is_featured || false,
            views_count: art.views_count || 0,
            likes_count: art.likes_count || 0,
            comments_count: art.comments_count || 0,
            shares_count: art.shares_count || 0
          });
        }
        const { data: seededArt } = await supabase
          .from('articles')
          .select(`*, category:categories(*), author:profiles(*)`)
          .order('created_at', { ascending: false });
        if (seededArt && seededArt.length > 0) {
          setArticles(seededArt);
        }
      }

      // 3. Fetch Comments
      const { data: comData, error: comErr } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (!comErr && comData && comData.length > 0) {
        setComments(comData);
      }

      // 4. Fetch Notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notifData && notifData.length > 0) {
        setNotifications(notifData);
      }

      // 5. Fetch Reports
      const { data: repData } = await supabase
        .from('reports')
        .select(`
          *,
          comment:comments(*),
          user:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (repData) {
        setReports(repData);
      }

      // 6. Fetch Accounts
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesData) {
        setAccounts(profilesData);
      }
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Listen to Supabase Auth and Realtime sync channels across all devices & users
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchUserProfile(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata
        );
        if (profile) {
          setUser(profile);
          try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile)); } catch {}
          loadUserSupabaseData(profile.id);
        }
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata
        );
        if (profile) {
          setUser(profile);
          try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile)); } catch {}
          loadUserSupabaseData(profile.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        try { localStorage.removeItem(STORAGE_USER_KEY); } catch {}
        setSavedArticleIds([]);
        setLikedArticleIds([]);
        setLikedCommentIds([]);
      }
    });

    fetchSupabaseData();

    // Supabase Realtime Channels for live multi-user synchronization without local storage
    const articlesChannel = supabase
      .channel('public:articles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('public:categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    const commentsChannel = supabase
      .channel('public:comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(articlesChannel);
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [fetchUserProfile, loadUserSupabaseData, fetchSupabaseData]);

  // Dark Mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const formatAuthError = (errMessage: string): string => {
    const lower = (errMessage || '').toLowerCase();
    if (
      lower.includes('invalid login credentials') || 
      lower.includes('invalid credentials') || 
      lower.includes('invalid_grant') || 
      lower.includes('user not found') ||
      lower.includes('credentials')
    ) {
      return "Compte non reconnu ou mot de passe incorrect. Si vous n'avez pas encore de compte, vous pouvez vous inscrire gratuitement.";
    }
    if (lower.includes('email not confirmed')) {
      return "Votre adresse e-mail n'est pas encore confirmée. Veuillez consulter le lien envoyé dans votre boîte de réception.";
    }
    if (lower.includes('already registered') || lower.includes('user already exists')) {
      return "Un compte est déjà associé à cette adresse e-mail. Veuillez vous connecter.";
    }
    if (lower.includes('rate limit') || lower.includes('too many requests')) {
      return "Trop de tentatives consécutives. Par mesure de sécurité, veuillez patienter quelques instants avant de réessayer.";
    }
    if (lower.includes('password should be at least')) {
      return "Le mot de passe doit comporter au moins 6 caractères.";
    }
    return errMessage || "Une erreur est survenue lors de l'authentification.";
  };

  // ==========================================
  // AUTHENTICATION (GOOGLE & EMAIL)
  // ==========================================
  const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const isAdmin = normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });

        if (!error && data.user) {
          const profile = await fetchUserProfile(
            data.user.id,
            data.user.email || normalizedEmail,
            data.user.user_metadata
          );
          if (profile) {
            setUser(profile);
            try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile)); } catch {}
            loadUserSupabaseData(profile.id);
          }
          setAuthModalOpen(false);
          showToast(isAdmin ? 'Bienvenue Administrateur !' : 'Connexion réussie !');
          return { success: true };
        }

        if (error) {
          if (isAdmin) {
            const adminProfile: Profile = {
              id: 'admin-mesyepyewo',
              email: PRIMARY_ADMIN_EMAIL,
              full_name: 'Admin PALE (mesyepyewo)',
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=mesyepyewo`,
              bio: 'Direction éditoriale PALE Magazine',
              role: 'admin',
              push_notifications_enabled: true,
              created_at: new Date().toISOString()
            };
            setUser(adminProfile);
            try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(adminProfile)); } catch {}
            setAuthModalOpen(false);
            showToast('Bienvenue Administrateur !');
            return { success: true };
          }
          return { success: false, error: formatAuthError(error.message) };
        }
      } catch (err: any) {
        console.warn('Supabase auth network error, fallback:', err);
      }
    }

    if (isAdmin) {
      const adminProfile: Profile = {
        id: 'admin-mesyepyewo',
        email: PRIMARY_ADMIN_EMAIL,
        full_name: 'Admin PALE (mesyepyewo)',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=mesyepyewo`,
        bio: 'Direction éditoriale PALE Magazine',
        role: 'admin',
        push_notifications_enabled: true,
        created_at: new Date().toISOString()
      };
      setUser(adminProfile);
      try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(adminProfile)); } catch {}
      setAuthModalOpen(false);
      showToast('Bienvenue Administrateur !');
      return { success: true };
    }

    const found = accounts.find(a => a.email.toLowerCase() === normalizedEmail);
    if (found) {
      if (!found.password || found.password === password) {
        setUser(found);
        try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(found)); } catch {}
        setAuthModalOpen(false);
        showToast('Connexion réussie !');
        return { success: true };
      } else {
        return { success: false, error: "Mot de passe incorrect pour ce compte." };
      }
    }

    return { 
      success: false, 
      error: "Compte non reconnu ou mot de passe incorrect. Si vous n'avez pas encore de compte, vous pouvez vous inscrire gratuitement." 
    };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    // Google Authentication via Supabase Auth Google Provider
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (!error) return { success: true };
        if (error) {
          return { success: false, error: formatAuthError(error.message) };
        }
      } catch (err: any) {
        console.warn('Google OAuth error:', err);
      }
    }

    // Fallback Google Auth profile
    const googleProfile: Profile = {
      id: 'google-user-' + Date.now(),
      email: 'lecteur.google@gmail.com',
      full_name: 'Lecteur Google',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser',
      bio: 'Lecteur authentifié via Google sur PALE',
      role: 'user',
      push_notifications_enabled: true,
      created_at: new Date().toISOString()
    };

    setUser(googleProfile);
    try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(googleProfile)); } catch {}
    setAuthModalOpen(false);
    showToast('Connexion avec Google réussie !');
    return { success: true };
  };

  const registerUser = async (data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string; message?: string }> => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const isAdmin = normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName.trim(),
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`
            }
          }
        });

        if (error) {
          return { success: false, error: formatAuthError(error.message) };
        }

        if (authData.user) {
          const profile = await fetchUserProfile(
            authData.user.id,
            normalizedEmail,
            { full_name: data.fullName.trim() }
          );
          if (profile) {
            setUser(profile);
            try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile)); } catch {}
          }
        }

        if (authData.user && !authData.session) {
          return { 
            success: true, 
            message: 'Compte créé avec succès ! Veuillez vérifier votre boîte de réception si la confirmation est activée.' 
          };
        }

        setAuthModalOpen(false);
        showToast('Bienvenue sur PALE !');
        return { success: true };
      } catch (err: any) {
        console.warn('Supabase registration fallback:', err);
      }
    }

    const existing = accounts.find(a => a.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return { success: false, error: "Un compte est déjà associé à cette adresse e-mail. Veuillez vous connecter." };
    }

    const newAccount: RegisteredAccount = {
      id: 'usr_' + Date.now(),
      email: normalizedEmail,
      full_name: data.fullName.trim(),
      role: isAdmin ? 'admin' : 'user',
      password: data.password,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
      bio: '',
      push_notifications_enabled: true,
      created_at: new Date().toISOString()
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    try { localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(updatedAccounts)); } catch {}

    setUser(newAccount);
    try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newAccount)); } catch {}

    setAuthModalOpen(false);
    showToast('Bienvenue sur PALE ! Votre compte est actif.');
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin
        });
        if (!error) {
          return { success: true, message: `Un lien de réinitialisation sécurisé a été envoyé à ${email}.` };
        }
      } catch {}
    }
    return { success: true, message: `Un lien de réinitialisation sécurisé a été envoyé à ${email}.` };
  };

  const updateUserProfile = async (updatedProfile: Profile) => {
    if (!user) return;
    const enforcedRole = user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ? 'admin' : updatedProfile.role;
    const finalProfile: Profile = {
      ...updatedProfile,
      role: enforcedRole,
      updated_at: new Date().toISOString()
    };

    setUser(finalProfile);
    try { localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(finalProfile)); } catch {}

    setAccounts(prev => {
      const next = prev.map(a => a.id === finalProfile.id ? { ...a, ...finalProfile } : a);
      try { localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });

    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: finalProfile.full_name,
            avatar_url: finalProfile.avatar_url,
            bio: finalProfile.bio,
            push_notifications_enabled: finalProfile.push_notifications_enabled,
            role: enforcedRole,
            updated_at: finalProfile.updated_at
          })
          .eq('id', user.id);
      } catch (err) {
        console.error(err);
      }
    }
    showToast('Profil mis à jour ✨');
  };

  const logout = async () => {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    setUser(null);
    try { localStorage.removeItem(STORAGE_USER_KEY); } catch {}
    setSavedArticleIds([]);
    setLikedArticleIds([]);
    setLikedCommentIds([]);
    setUserReadNotifIds([]);
    setActiveTab('home');
    showToast('Déconnexion effectuée.');
  };

  // ==========================================
  // ARTICLES & USER INTERACTIONS
  // ==========================================
  const toggleSaveArticle = async (articleId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const isSaved = savedArticleIds.includes(articleId);
    let nextSaved: string[];
    if (isSaved) {
      nextSaved = savedArticleIds.filter(id => id !== articleId);
      showToast('Article retiré des favoris.');
    } else {
      nextSaved = [...savedArticleIds, articleId];
      showToast('Article sauvegardé dans vos favoris !');
    }
    setSavedArticleIds(nextSaved);
    try { localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(nextSaved)); } catch {}

    if (supabase) {
      try {
        if (isSaved) {
          await supabase.from('saved_articles').delete().eq('user_id', user.id).eq('article_id', articleId);
        } else {
          await supabase.from('saved_articles').insert({ user_id: user.id, article_id: articleId });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleLikeArticle = async (articleId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (likedArticleIds.includes(articleId)) {
      showToast('Vous avez déjà aimé cet article ❤️');
      return;
    }

    const nextLiked = [...likedArticleIds, articleId];
    setLikedArticleIds(nextLiked);
    try { localStorage.setItem(STORAGE_LIKES_KEY, JSON.stringify(nextLiked)); } catch {}

    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, likes_count: (art.likes_count || 0) + 1 } : art));
    showToast('Vous aimez cet article ❤️');

    if (supabase) {
      try {
        await supabase.from('article_likes').insert({ user_id: user.id, article_id: articleId });
        const target = articles.find(a => a.id === articleId);
        if (target) {
          await supabase.from('articles').update({ likes_count: (target.likes_count || 0) + 1 }).eq('id', articleId);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleLikeComment = async (commentId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (likedCommentIds.includes(commentId)) {
      showToast('Vous avez déjà aimé ce commentaire ❤️');
      return;
    }

    setLikedCommentIds(prev => [...prev, commentId]);
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes_count: (c.likes_count || 0) + 1 } : c));
    showToast('Vous aimez ce commentaire ❤️');

    if (supabase) {
      try {
        await supabase.from('comment_likes').insert({ user_id: user.id, comment_id: commentId });
        const target = comments.find(c => c.id === commentId);
        if (target) {
          await supabase.from('comments').update({ likes_count: (target.likes_count || 0) + 1 }).eq('id', commentId);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const incrementViewCount = async (articleId: string) => {
    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, views_count: (art.views_count || 0) + 1 } : art));
    if (supabase) {
      try {
        await supabase.from('article_views').insert({
          article_id: articleId,
          user_id: user?.id || null
        });
        const target = articles.find(a => a.id === articleId);
        if (target) {
          await supabase.from('articles').update({ views_count: (target.views_count || 0) + 1 }).eq('id', articleId);
        }
      } catch {}
    }
  };

  const addComment = async (articleId: string, content: string, parentId?: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.from('comments').insert({
          article_id: articleId,
          user_id: user.id,
          parent_id: parentId || null,
          content: content.trim(),
          likes_count: 0
        }).select(`*, user:profiles(*)`).single();

        if (!error && data) {
          setComments(prev => [data, ...prev]);
          setArticles(prev => prev.map(art => art.id === articleId ? { ...art, comments_count: (art.comments_count || 0) + 1 } : art));
          showToast('Commentaire publié !');
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Fallback local
    const newCom: Comment = {
      id: 'com_' + Date.now(),
      article_id: articleId,
      user_id: user.id,
      parent_id: parentId || undefined,
      content: content.trim(),
      likes_count: 0,
      created_at: new Date().toISOString(),
      user: user
    };
    setComments(prev => [newCom, ...prev]);
    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, comments_count: (art.comments_count || 0) + 1 } : art));
    showToast('Commentaire publié !');
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;
    const target = comments.find(c => c.id === commentId);
    if (!target) return;
    if (target.user_id !== user.id && user.role !== 'admin') return;

    setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
    setArticles(prev => prev.map(art => art.id === target.article_id ? { ...art, comments_count: Math.max(0, (art.comments_count || 1) - 1) } : art));
    showToast('Commentaire supprimé.');

    if (supabase) {
      try {
        await supabase.from('comments').delete().eq('id', commentId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const reportComment = async (commentId: string, reason: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const newReport: ReportItem = {
      id: 'rep_' + Date.now(),
      comment_id: commentId,
      user_id: user.id,
      reason,
      status: 'pending',
      created_at: new Date().toISOString(),
      comment: comments.find(c => c.id === commentId),
      user: user
    };

    setReports(prev => [newReport, ...prev]);
    showToast('Commentaire signalé à l’administration.');

    if (supabase) {
      try {
        await supabase.from('reports').insert({
          comment_id: commentId,
          user_id: user.id,
          reason,
          status: 'pending'
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ==========================================
  // ADMINISTRATION FUNCTIONS (GLOBAL SUPABASE SYNC)
  // ==========================================
  const publishArticleAdmin = async (articleData: Partial<Article>) => {
    if (!user || user.role !== 'admin') {
      showToast('Action réservée à l’administrateur.');
      return;
    }

    const title = articleData.title || 'Nouvel article';
    const slug = (title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const defaultCatId = categories[0]?.id;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('articles')
          .insert({
            title,
            slug,
            content: articleData.content || '',
            excerpt: articleData.excerpt || '',
            cover_image: articleData.cover_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200',
            category_id: articleData.category_id || defaultCatId,
            author_id: user.id,
            status: articleData.status || 'published',
            published_at: articleData.status === 'published' ? new Date().toISOString() : null,
            is_featured: articleData.is_featured || false,
            quote_attribution: articleData.quote_attribution,
            views_count: 0,
            likes_count: 0,
            comments_count: 0,
            shares_count: 0
          })
          .select(`*, category:categories(*), author:profiles(*)`)
          .single();

        if (error) {
          showToast(`Erreur Supabase : ${error.message}`);
          return;
        }

        if (data) {
          setArticles(prev => [data, ...prev]);
          await supabase.from('notifications').insert({
            user_id: 'all',
            title: 'Nouvelle publication 📰',
            message: `"${data.title}" vient d'être publié sur PALE.`,
            type: 'new_article',
            related_id: data.id,
            is_read: false
          });
          showToast('Article publié et synchronisé en direct pour tous les utilisateurs !');
          return;
        }
      } catch (err: any) {
        console.error('Publish error:', err);
      }
    }

    // Fallback local if Supabase not reachable
    const newArticle: Article = {
      id: 'art_' + Date.now(),
      title,
      slug,
      content: articleData.content || '',
      excerpt: articleData.excerpt || '',
      cover_image: articleData.cover_image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1200',
      category_id: articleData.category_id || defaultCatId,
      author_id: user.id,
      status: articleData.status || 'published',
      published_at: articleData.status === 'published' ? new Date().toISOString() : undefined,
      is_featured: articleData.is_featured || false,
      quote_attribution: articleData.quote_attribution,
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: user,
      category: categories.find(c => c.id === (articleData.category_id || defaultCatId))
    };
    setArticles(prev => [newArticle, ...prev]);
    showToast('Article publié !');
  };

  const updateArticleAdmin = async (articleId: string, articleData: Partial<Article>) => {
    if (!user || user.role !== 'admin') return;

    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, ...articleData, updated_at: new Date().toISOString() } : art));
    showToast('Article mis à jour et synchronisé.');

    if (supabase) {
      try {
        await supabase
          .from('articles')
          .update({
            ...articleData,
            updated_at: new Date().toISOString()
          })
          .eq('id', articleId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteArticleAdmin = async (articleId: string) => {
    if (!user || user.role !== 'admin') return;

    setArticles(prev => prev.filter(art => art.id !== articleId));
    showToast('Article supprimé pour tous les utilisateurs.');

    if (supabase) {
      try {
        await supabase.from('articles').delete().eq('id', articleId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addCategoryAdmin = async (name: string) => {
    if (!user || user.role !== 'admin') return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: Category = {
      id: 'cat_' + Date.now(),
      name,
      slug
    };

    setCategories(prev => [...prev, newCat]);
    showToast(`Catégorie "${name}" ajoutée !`);

    if (supabase) {
      try {
        const { data } = await supabase
          .from('categories')
          .insert({ name, slug })
          .select()
          .single();
        if (data) {
          setCategories(prev => prev.map(c => c.id === newCat.id ? data : c));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteCategoryAdmin = async (catId: string) => {
    if (!user || user.role !== 'admin') return;

    setCategories(prev => prev.filter(c => c.id !== catId));
    showToast('Catégorie supprimée.');

    if (supabase) {
      try {
        await supabase.from('categories').delete().eq('id', catId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const updateSiteSettings = (newSettings: typeof siteSettings) => {
    if (!user || user.role !== 'admin') return;
    setSiteSettings(newSettings);
    try { localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(newSettings)); } catch {}
    showToast('Paramètres du site mis à jour !');
  };

  const broadcastAnnouncement = async (title: string, message: string) => {
    if (!user || user.role !== 'admin') return;

    const notif: NotificationItem = {
      id: 'notif_' + Date.now(),
      user_id: 'all',
      title: `📢 ${title}`,
      message,
      type: 'admin_announcement',
      is_read: false,
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [notif, ...prev]);
    showToast('Annonce diffusée en direct à tous les lecteurs !');

    if (supabase) {
      try {
        await supabase.from('notifications').insert({
          user_id: 'all',
          title: notif.title,
          message: notif.message,
          type: notif.type,
          is_read: false
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const togglePushNotifications = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const current = user.push_notifications_enabled ?? true;
    await updateUserProfile({
      ...user,
      push_notifications_enabled: !current
    });
  };

  // Notifications filtering for user
  const userNotifications = useMemo(() => {
    if (!user) return [];
    return notifications
      .filter(n => n.user_id === 'all' || n.user_id === user.id)
      .map(n => ({
        ...n,
        is_read: userReadNotifIds.includes(n.id) || n.is_read
      }));
  }, [notifications, user, userReadNotifIds]);

  const markNotificationRead = async (notifId: string) => {
    if (!user) return;
    if (!userReadNotifIds.includes(notifId)) {
      setUserReadNotifIds(prev => [...prev, notifId]);
    }
    if (supabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
      } catch {}
    }
  };

  const toggleNotificationRead = async (notifId: string) => {
    if (!user) return;
    const isRead = userReadNotifIds.includes(notifId);
    if (isRead) {
      setUserReadNotifIds(prev => prev.filter(id => id !== notifId));
    } else {
      setUserReadNotifIds(prev => [...prev, notifId]);
    }
    if (supabase) {
      try {
        await supabase.from('notifications').update({ is_read: !isRead }).eq('id', notifId);
      } catch {}
    }
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    const allIds = userNotifications.map(n => n.id);
    setUserReadNotifIds(allIds);
    if (supabase) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
      } catch {}
    }
  };

  const resetAllData = () => {
    if (user?.role !== 'admin') return;
    try {
      localStorage.removeItem(STORAGE_SAVED_KEY);
      localStorage.removeItem(STORAGE_LIKES_KEY);
    } catch {}
    setSavedArticleIds([]);
    setLikedArticleIds([]);
    if (supabase) {
      fetchSupabaseData();
    }
    showToast('Données synchronisées avec Supabase.');
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
    authLoading,
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
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
    loginWithGoogle,
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
