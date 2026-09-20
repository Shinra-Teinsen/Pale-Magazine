import { useState, useEffect, useMemo, useCallback } from 'react';
import { Article, Category, Comment, NotificationItem, Profile, RegisteredAccount, ActiveTab, ReportItem } from '../types';
import { supabase, isSupabaseConfigured, PRIMARY_ADMIN_EMAIL } from './supabase';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_COMMENTS } from '../data/mockArticles';

export function useAppStore() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  
  // Real registered accounts list from Supabase profiles
  const [accounts, setAccounts] = useState<RegisteredAccount[]>([]);

  // Auth state directly from Supabase
  const [user, setUser] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [shareModalArticle, setShareModalArticle] = useState<Article | null>(null);
  const [commentModalArticle, setCommentModalArticle] = useState<Article | null>(null);

  // Core data states (backed by Supabase)
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  
  // User relational state from Supabase
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  const [likedArticleIds, setLikedArticleIds] = useState<string[]>([]);
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [userReadNotifIds, setUserReadNotifIds] = useState<string[]>([]);

  // Site settings
  const [siteSettings, setSiteSettings] = useState({
    siteTitle: 'MAGAZINE PALE',
    siteSubtitle: 'Plateforme éditoriale indépendante : Société, Lifestyle, Culture et Actualités.',
    announcementBanner: 'Nouvelle édition disponible — Découvrez nos publications.',
    heroBadge: 'ÉDITION OFFICIELLE'
  });

  // Dark mode (browser UI preference)
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const isAdminEmail = userEmail?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

      if (data) {
        const enforcedRole = isAdminEmail ? 'admin' : (data.role || 'user');
        // If user is mesyepyewo@gmail.com but role in table is not admin, update it in Supabase
        if (isAdminEmail && data.role !== 'admin') {
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
        }
        return {
          ...data,
          role: enforcedRole
        };
      }

      // If no profile exists yet, create one in Supabase
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

  // Load user data (likes, bookmarks, notifications) from Supabase
  const loadUserSupabaseData = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
      // 1. Saved articles
      const { data: savedData } = await supabase
        .from('saved_articles')
        .select('article_id')
        .eq('user_id', userId);
      if (savedData) {
        setSavedArticleIds(savedData.map(s => s.article_id));
      }

      // 2. Article likes
      const { data: likedData } = await supabase
        .from('article_likes')
        .select('article_id')
        .eq('user_id', userId);
      if (likedData) {
        setLikedArticleIds(likedData.map(l => l.article_id));
      }

      // 3. Comment likes
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

  // Fetch all main data from Supabase
  const fetchSupabaseData = useCallback(async () => {
    if (!supabase) {
      // If Supabase is not configured, load initial templates
      setCategories(INITIAL_CATEGORIES);
      setArticles(INITIAL_ARTICLES);
      setComments(INITIAL_COMMENTS);
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
      } else {
        setCategories(INITIAL_CATEGORIES);
      }

      // 2. Fetch Articles with Categories & Authors
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
      } else {
        // Fallback to initial articles if Supabase is connected but empty
        setArticles(INITIAL_ARTICLES);
      }

      // 3. Fetch Comments with Profiles
      const { data: comData, error: comErr } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (!comErr && comData && comData.length > 0) {
        setComments(comData);
      } else {
        setComments(INITIAL_COMMENTS);
      }

      // 4. Fetch Notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notifData && notifData.length > 0) {
        setNotifications(notifData);
      }

      // 5. Fetch Reports (if any)
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

      // 6. Fetch Accounts (profiles) for Admin
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesData) {
        setAccounts(profilesData);
      }

    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
    }
  }, []);

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchUserProfile(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata
        );
        setUser(profile);
        if (profile) {
          loadUserSupabaseData(profile.id);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(
          session.user.id,
          session.user.email || '',
          session.user.user_metadata
        );
        setUser(profile);
        if (profile) {
          loadUserSupabaseData(profile.id);
        }
      } else {
        setUser(null);
        setSavedArticleIds([]);
        setLikedArticleIds([]);
        setLikedCommentIds([]);
      }
    });

    // Fetch initial Supabase data
    fetchSupabaseData();

    return () => {
      subscription.unsubscribe();
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

  // Helper to format Supabase auth errors into friendly French messages
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
  // REAL SUPABASE AUTHENTICATION
  // ==========================================
  const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      setSupabaseModalOpen(true);
      return { success: false, error: 'Veuillez configurer vos identifiants Supabase pour vous connecter.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        return { success: false, error: formatAuthError(error.message) };
      }

      if (data.user) {
        const profile = await fetchUserProfile(
          data.user.id,
          data.user.email || email,
          data.user.user_metadata
        );
        setUser(profile);
        if (profile) {
          loadUserSupabaseData(profile.id);
        }
      }

      setAuthModalOpen(false);
      showToast('Connexion réussie !');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err?.message) };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      setSupabaseModalOpen(true);
      return { success: false, error: 'Veuillez connecter Supabase pour activer la connexion Google OAuth.' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) return { success: false, error: formatAuthError(error.message) };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatAuthError(err?.message) };
    }
  };

  const registerUser = async (data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      setSupabaseModalOpen(true);
      return { success: false, error: 'Veuillez configurer Supabase pour créer un compte utilisateur en production.' };
    }

    try {
      const normalizedEmail = data.email.trim().toLowerCase();
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
        setUser(profile);
      }

      if (authData.user && !authData.session) {
        return { 
          success: true, 
          message: 'Compte créé avec succès ! Si la confirmation par e-mail est activée dans Supabase, veuillez vérifier vos e-mails.' 
        };
      }

      setAuthModalOpen(false);
      showToast('Bienvenue sur PALE !');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erreur lors de l’inscription.' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, message: 'Supabase n’est pas encore configuré.' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: `Un lien de réinitialisation sécurisé a été envoyé par Supabase à ${email}.` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erreur lors de l’envoi du lien de réinitialisation.' };
    }
  };

  const updateUserProfile = async (updatedProfile: Profile) => {
    if (!user || !supabase) return;

    try {
      const enforcedRole = user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase() ? 'admin' : user.role;
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedProfile.full_name,
          avatar_url: updatedProfile.avatar_url,
          bio: updatedProfile.bio,
          push_notifications_enabled: updatedProfile.push_notifications_enabled,
          role: enforcedRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        showToast(`Erreur : ${error.message}`);
        return;
      }

      setUser({
        ...updatedProfile,
        role: enforcedRole
      });
      showToast('Profil mis à jour dans Supabase ✨');
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSavedArticleIds([]);
    setLikedArticleIds([]);
    setLikedCommentIds([]);
    setUserReadNotifIds([]);
    setActiveTab('home');
    showToast('Déconnexion effectuée.');
  };

  // ==========================================
  // ARTICLES & INTERACTION VIA SUPABASE
  // ==========================================
  const toggleSaveArticle = async (articleId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!supabase) return;

    const isSaved = savedArticleIds.includes(articleId);
    if (isSaved) {
      setSavedArticleIds(prev => prev.filter(id => id !== articleId));
      await supabase
        .from('saved_articles')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);
      showToast('Article retiré des favoris.');
    } else {
      setSavedArticleIds(prev => [...prev, articleId]);
      await supabase
        .from('saved_articles')
        .insert({ user_id: user.id, article_id: articleId });
      showToast('Article sauvegardé dans vos favoris !');
    }
  };

  const toggleLikeArticle = async (articleId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!supabase) return;

    // Strict 1-like rule per account
    if (likedArticleIds.includes(articleId)) {
      showToast('Vous avez déjà aimé cet article ❤️');
      return;
    }

    setLikedArticleIds(prev => [...prev, articleId]);
    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, likes_count: (art.likes_count || 0) + 1 } : art));

    try {
      await supabase
        .from('article_likes')
        .insert({ user_id: user.id, article_id: articleId });

      // Increment likes_count on article table
      const target = articles.find(a => a.id === articleId);
      if (target) {
        await supabase
          .from('articles')
          .update({ likes_count: (target.likes_count || 0) + 1 })
          .eq('id', articleId);
      }
      showToast('Vous aimez cet article ❤️');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLikeComment = async (commentId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!supabase) return;

    if (likedCommentIds.includes(commentId)) {
      showToast('Vous avez déjà aimé ce commentaire ❤️');
      return;
    }

    setLikedCommentIds(prev => [...prev, commentId]);
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes_count: (c.likes_count || 0) + 1 } : c));

    try {
      await supabase
        .from('comment_likes')
        .insert({ user_id: user.id, comment_id: commentId });

      const target = comments.find(c => c.id === commentId);
      if (target) {
        await supabase
          .from('comments')
          .update({ likes_count: (target.likes_count || 0) + 1 })
          .eq('id', commentId);
      }
      showToast('Vous aimez ce commentaire ❤️');
    } catch (err) {
      console.error(err);
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
          await supabase
            .from('articles')
            .update({ views_count: (target.views_count || 0) + 1 })
            .eq('id', articleId);
        }
      } catch (err) {
        // Silent view counter update
      }
    }
  };

  const addComment = async (articleId: string, content: string, parentId?: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!supabase) return;

    try {
      const newComPayload = {
        article_id: articleId,
        user_id: user.id,
        parent_id: parentId || null,
        content: content.trim(),
        likes_count: 0
      };

      const { data, error } = await supabase
        .from('comments')
        .insert(newComPayload)
        .select(`*, user:profiles(*)`)
        .single();

      if (error) {
        showToast(`Erreur : ${error.message}`);
        return;
      }

      if (data) {
        setComments(prev => [data, ...prev]);
        setArticles(prev => prev.map(art => art.id === articleId ? { ...art, comments_count: (art.comments_count || 0) + 1 } : art));
        showToast('Commentaire publié !');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user || !supabase) return;
    const target = comments.find(c => c.id === commentId);
    if (!target) return;
    if (target.user_id !== user.id && user.role !== 'admin') return;

    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (!error) {
        setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
        setArticles(prev => prev.map(art => art.id === target.article_id ? { ...art, comments_count: Math.max(0, (art.comments_count || 1) - 1) } : art));
        showToast('Commentaire supprimé.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const reportComment = async (commentId: string, reason: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          comment_id: commentId,
          user_id: user.id,
          reason,
          status: 'pending'
        })
        .select(`*, comment:comments(*), user:profiles(*)`)
        .single();

      if (!error && data) {
        setReports(prev => [data, ...prev]);
        showToast('Commentaire signalé à l’administration.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // ADMINISTRATION VIA SUPABASE
  // ==========================================
  const publishArticleAdmin = async (articleData: Partial<Article>) => {
    if (!user || user.role !== 'admin' || !supabase) {
      showToast('Action réservée à l’administrateur.');
      return;
    }

    try {
      const title = articleData.title || 'Nouvel article';
      const slug = (title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
      const defaultCatId = categories[0]?.id;

      const payload = {
        title,
        slug,
        content: articleData.content || '',
        excerpt: articleData.excerpt || '',
        cover_image: articleData.cover_image || '',
        category_id: articleData.category_id || defaultCatId,
        author_id: user.id,
        status: articleData.status || 'published',
        published_at: articleData.status === 'published' ? new Date().toISOString() : null,
        is_featured: articleData.is_featured || false,
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0
      };

      const { data, error } = await supabase
        .from('articles')
        .insert(payload)
        .select(`*, category:categories(*), author:profiles(*)`)
        .single();

      if (error) {
        showToast(`Erreur Supabase : ${error.message}`);
        return;
      }

      if (data) {
        setArticles(prev => [data, ...prev]);
        // Diffusion de notification
        await supabase.from('notifications').insert({
          user_id: 'all',
          title: 'Nouvelle publication 📰',
          message: `"${data.title}" vient d'être publié sur PALE.`,
          type: 'new_article',
          related_id: data.id,
          is_read: false
        });
        showToast('Article enregistré et publié dans Supabase !');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateArticleAdmin = async (articleId: string, articleData: Partial<Article>) => {
    if (!user || user.role !== 'admin' || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('articles')
        .update({
          ...articleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId)
        .select(`*, category:categories(*), author:profiles(*)`)
        .single();

      if (error) {
        showToast(`Erreur : ${error.message}`);
        return;
      }

      if (data) {
        setArticles(prev => prev.map(a => a.id === articleId ? data : a));
        showToast('Article mis à jour dans Supabase !');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteArticleAdmin = async (articleId: string) => {
    if (!user || user.role !== 'admin' || !supabase) return;

    try {
      const { error } = await supabase.from('articles').delete().eq('id', articleId);
      if (error) {
        showToast(`Erreur : ${error.message}`);
        return;
      }
      setArticles(prev => prev.filter(a => a.id !== articleId));
      showToast('Article supprimé de Supabase.');
    } catch (err) {
      console.error(err);
    }
  };

  const addCategoryAdmin = async (name: string) => {
    if (!user || user.role !== 'admin' || !supabase) return;

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { data, error } = await supabase
        .from('categories')
        .insert({ name, slug })
        .select()
        .single();

      if (error) {
        showToast(`Erreur : ${error.message}`);
        return;
      }

      if (data) {
        setCategories(prev => [...prev, data]);
        showToast(`Catégorie "${name}" ajoutée dans Supabase !`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategoryAdmin = async (catId: string) => {
    if (!user || user.role !== 'admin' || !supabase) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', catId);
      if (error) {
        showToast(`Erreur : ${error.message}`);
        return;
      }
      setCategories(prev => prev.filter(c => c.id !== catId));
      showToast('Catégorie supprimée de Supabase.');
    } catch (err) {
      console.error(err);
    }
  };

  const updateSiteSettings = (newSettings: typeof siteSettings) => {
    if (!user || user.role !== 'admin') return;
    setSiteSettings(newSettings);
    showToast('Paramètres du site mis à jour !');
  };

  const broadcastAnnouncement = async (title: string, message: string) => {
    if (!user || user.role !== 'admin' || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: 'all',
          title: `📢 ${title}`,
          message,
          type: 'admin_announcement',
          is_read: false
        })
        .select()
        .single();

      if (error) {
        showToast(`Erreur : ${error.message}`);
        return;
      }

      if (data) {
        setNotifications(prev => [data, ...prev]);
        showToast('Annonce diffusée en production à tous les lecteurs !');
      }
    } catch (err) {
      console.error(err);
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
      await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
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
      await supabase.from('notifications').update({ is_read: !isRead }).eq('id', notifId);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    const allIds = userNotifications.map(n => n.id);
    setUserReadNotifIds(allIds);
    if (supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    }
  };

  const resetAllData = () => {
    if (user?.role !== 'admin') return;
    fetchSupabaseData();
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
