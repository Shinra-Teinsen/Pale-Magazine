import React, { useState } from 'react';
import { Article, Category, Profile, ReportItem } from '../types';
import { ShieldCheck, Plus, Trash2, Edit3, Send, AlertTriangle, Users, BookOpen, Eye, Heart, MessageCircle, Share2, BarChart3, Megaphone, Settings, FolderTree, Tag } from 'lucide-react';
import { RichEditor } from '../components/RichEditor';

interface AdminDashboardProps {
  articles: Article[];
  categories: Category[];
  reports: ReportItem[];
  siteSettings: {
    siteTitle: string;
    siteSubtitle: string;
    announcementBanner: string;
    heroBadge: string;
  };
  user: Profile | null;
  onPublishArticle: (articleData: Partial<Article>) => void;
  onUpdateArticle: (articleId: string, articleData: Partial<Article>) => void;
  onDeleteArticle: (articleId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onBroadcastAnnouncement: (title: string, message: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateSiteSettings: (settings: any) => void;
  onResetData: () => void;
  showToast: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  articles,
  categories,
  reports,
  siteSettings,
  user,
  onPublishArticle,
  onUpdateArticle,
  onDeleteArticle,
  onDeleteComment,
  onBroadcastAnnouncement,
  onAddCategory,
  onDeleteCategory,
  onUpdateSiteSettings,
  onResetData,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'articles' | 'categories' | 'settings' | 'reports' | 'announcements'>('overview');
  const [editorOpen, setEditorOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);

  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const [settingsForm, setSettingsForm] = useState(siteSettings);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-600 dark:text-rose-400 mx-auto" />
        <h2 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-white">Accès restreint</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Cette section est strictement réservée à l'administrateur de PALE.</p>
      </div>
    );
  }

  // Calculate totals
  const totalViews = articles.reduce((acc, a) => acc + a.views_count, 0);
  const totalLikes = articles.reduce((acc, a) => acc + a.likes_count, 0);
  const totalComments = articles.reduce((acc, a) => acc + a.comments_count, 0);

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    onBroadcastAnnouncement(annTitle.trim(), annMessage.trim());
    setAnnTitle('');
    setAnnMessage('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteSettings(settingsForm);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
  };

  const handleSaveArticleFromEditor = (articleData: Partial<Article>) => {
    if (articleToEdit) {
      onUpdateArticle(articleToEdit.id, articleData);
    } else {
      onPublishArticle(articleData);
    }
    setArticleToEdit(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400 dark:text-emerald-600" />
          </div>
          <div className="min-w-0">
            <h1 className="font-editorial text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white truncate">Tableau de bord Admin</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-0.5">Contrôle total, édition des titres, annonces et publications</p>
          </div>
        </div>

        <button
          onClick={() => { setArticleToEdit(null); setEditorOpen(true); }}
          className="px-5 py-3 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un nouvel article</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 no-scrollbar w-full">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeSubTab === 'overview' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md' : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'}`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveSubTab('articles')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeSubTab === 'articles' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md' : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'}`}
        >
          Gestion des articles ({articles.length})
        </button>
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeSubTab === 'categories' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md' : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'}`}
        >
          Catégories ({categories.length})
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeSubTab === 'settings' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md' : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'}`}
        >
          Titres & Paramètres du site
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeSubTab === 'reports' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md' : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'}`}
        >
          Signalements ({reports.length})
        </button>
        <button
          onClick={() => setActiveSubTab('announcements')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeSubTab === 'announcements' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-md' : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800'}`}
        >
          Annonces & Push
        </button>
      </div>

      {/* Overview Section */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white">{articles.length}</p>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Articles publiés</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white">{totalViews}</p>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Vues totales</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white">{totalLikes}</p>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Likes totaux</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-neutral-900 dark:text-white">{totalComments}</p>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Commentaires</p>
            </div>
          </div>
        </div>
      )}

      {/* Articles Management */}
      {activeSubTab === 'articles' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">Gestion des publications</h3>
            <button
              onClick={() => { setArticleToEdit(null); setEditorOpen(true); }}
              className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              + Nouvel article
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/60 text-[11px] font-bold text-neutral-400 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                  <th className="p-4">Article</th>
                  <th className="p-4">Catégorie</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Vues</th>
                  <th className="p-4">Likes</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                {articles.map(article => (
                  <tr key={article.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <img src={article.cover_image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white line-clamp-1">{article.title}</p>
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{new Date(article.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-neutral-600 dark:text-neutral-300">{article.category?.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${article.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-neutral-700 dark:text-neutral-200">{article.views_count}</td>
                    <td className="p-4 font-mono font-bold text-neutral-700 dark:text-neutral-200">{article.likes_count}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => { setArticleToEdit(article); setEditorOpen(true); }}
                          className="p-2 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteArticle(article.id)}
                          className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Management */}
      {activeSubTab === 'categories' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">Gestion des Catégories</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Ajoutez ou supprimez des rubriques pour classer vos articles.</p>
            </div>
          </div>

          <form onSubmit={handleAddCategorySubmit} className="flex gap-3 max-w-xl">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nom de la nouvelle catégorie..."
              className="flex-1 px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              + Ajouter
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            {categories.map(cat => (
              <div key={cat.id} className="p-4 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-neutral-900 dark:text-white">{cat.name}</p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">slug: {cat.slug}</p>
                </div>
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  title="Supprimer la catégorie"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Site Settings & Titles Management */}
      {activeSubTab === 'settings' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">Titres, En-tête & Annonces du Site</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Modifiez en temps réel le titre principal, les sous-titres et les bannières.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Titre principal du Blog (Hero Title)</label>
              <input
                type="text"
                required
                value={settingsForm.siteTitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, siteTitle: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl font-editorial font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Sous-titre / Description de l'en-tête</label>
              <textarea
                rows={2}
                required
                value={settingsForm.siteSubtitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, siteSubtitle: e.target.value })}
                className="w-full p-4 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Bandeau d'annonce / Annonce haut de page</label>
              <input
                type="text"
                required
                value={settingsForm.announcementBanner}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementBanner: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Badge de section</label>
              <input
                type="text"
                required
                value={settingsForm.heroBadge}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl shadow-md transition-all"
            >
              Enregistrer les modifications du site
            </button>
          </form>

          <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 mt-8 space-y-4">
            <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400">Remettre l'application à zéro (Publication Clean State)</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Efface toutes les données locales, articles personnalisés et remet la plateforme à son état initial vierge avant publication.</p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir tout remettre à zéro ?')) {
                  onResetData();
                }
              }}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
            >
              Remettre tout à zéro
            </button>
          </div>
        </div>
      )}

      {/* Reports Moderation */}
      {activeSubTab === 'reports' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">Commentaires signalés</h3>
          {reports.length === 0 ? (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 py-12 text-center">Aucun signalement en attente. Tout est en ordre !</p>
          ) : (
            <div className="space-y-3">
              {reports.map(rep => (
                <div key={rep.id} className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-rose-900 dark:text-rose-300">Motif : {rep.reason}</p>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 italic">"{rep.comment?.content}"</p>
                  </div>
                  <button
                    onClick={() => rep.comment_id && onDeleteComment(rep.comment_id)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Supprimer le commentaire
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcements Broadcast */}
      {activeSubTab === 'announcements' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">Diffusion d'annonce officielle & Push</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Envoyez une notification instantanée à tous les utilisateurs de PALE.</p>
            </div>
          </div>

          <form onSubmit={handleSendAnnouncement} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Titre de l'annonce</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="ex: Grande mise à jour de rentrée"
                className="w-full px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="Contenu de l'annonce..."
                className="w-full p-4 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Diffuser l'annonce (Interne + Push)</span>
            </button>
          </form>
        </div>
      )}

      {/* Rich Editor Modal */}
      {editorOpen && (
        <RichEditor
          categories={categories}
          articleToEdit={articleToEdit || undefined}
          onSave={handleSaveArticleFromEditor}
          onClose={() => { setEditorOpen(false); setArticleToEdit(null); }}
        />
      )}

    </div>
  );
};
