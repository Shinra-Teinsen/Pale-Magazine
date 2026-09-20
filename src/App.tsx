import React, { useState } from 'react';
import { useAppStore } from './lib/store';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AuthModal } from './components/AuthModal';
import { ShareModal } from './components/ShareModal';
import { CommentModal } from './components/CommentModal';
import { Home } from './pages/Home';
import { ArticlesList } from './pages/ArticlesList';
import { ArticleDetail } from './pages/ArticleDetail';
import { Trends } from './pages/Trends';
import { SearchPage } from './pages/SearchPage';
import { SavedArticles } from './pages/SavedArticles';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  const {
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
    shareModalArticle,
    setShareModalArticle,
    commentModalArticle,
    setCommentModalArticle,
    articles,
    categories,
    comments,
    siteSettings,
    savedArticleIds,
    likedArticleIds: likedIds,
    likedCommentIds,
    darkMode,
    notifications,
    reports,
    showToast,
    loginUser,
    registerUser,
    loginWithGoogle,
    resetPassword,
    updateUserProfile,
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
  } = useAppStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectArticle = (id: string) => {
    setSelectedArticleId(id);
    setActiveTab('article-detail');
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FAF8F5] dark:bg-[#0f1115] text-[#1A1A1A] dark:text-[#F3F4F6] flex flex-col font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-neutral-100 dark:selection:text-neutral-950 transition-colors duration-300">
      
      {/* Header */}
      <Header
        user={user}
        notifications={notifications}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenAuth={(mode) => { setAuthModalMode(mode); setAuthModalOpen(true); }}
        onLogout={logout}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        categories={categories}
        setSelectedCategorySlug={setSelectedCategorySlug}
        onOpenAuth={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {activeTab === 'home' && (
          <Home
            articles={articles}
            categories={categories}
            user={user}
            savedIds={savedArticleIds}
            likedIds={likedIds}
            siteSettings={siteSettings}
            onSelectArticle={handleSelectArticle}
            onToggleSave={toggleSaveArticle}
            onToggleLike={toggleLikeArticle}
            onShare={(art) => setShareModalArticle(art)}
            onOpenComments={(art) => setCommentModalArticle(art)}
            setActiveTab={setActiveTab}
            setSelectedCategorySlug={setSelectedCategorySlug}
          />
        )}

        {activeTab === 'articles' && (
          <ArticlesList
            articles={articles}
            categories={categories}
            selectedCategorySlug={selectedCategorySlug}
            setSelectedCategorySlug={setSelectedCategorySlug}
            user={user}
            savedIds={savedArticleIds}
            likedIds={likedIds}
            onSelectArticle={handleSelectArticle}
            onToggleSave={toggleSaveArticle}
            onToggleLike={toggleLikeArticle}
            onShare={(art) => setShareModalArticle(art)}
            onOpenComments={(art) => setCommentModalArticle(art)}
          />
        )}

        {activeTab === 'article-detail' && selectedArticleId && (
          <ArticleDetail
            articleId={selectedArticleId}
            articles={articles}
            comments={comments}
            user={user}
            savedIds={savedArticleIds}
            likedIds={likedIds}
            likedCommentIds={likedCommentIds}
            onBack={() => setActiveTab('home')}
            onSelectArticle={handleSelectArticle}
            onToggleSave={toggleSaveArticle}
            onToggleLike={toggleLikeArticle}
            onToggleLikeComment={toggleLikeComment}
            onIncrementView={incrementViewCount}
            onShare={(art) => setShareModalArticle(art)}
            onAddComment={addComment}
            onDeleteComment={deleteComment}
            onReportComment={reportComment}
            onOpenAuth={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
          />
        )}

        {activeTab === 'trends' && (
          <Trends
            articles={articles}
            user={user}
            savedIds={savedArticleIds}
            likedIds={likedIds}
            onSelectArticle={handleSelectArticle}
            onToggleSave={toggleSaveArticle}
            onToggleLike={toggleLikeArticle}
            onShare={(art) => setShareModalArticle(art)}
            onOpenComments={(art) => setCommentModalArticle(art)}
          />
        )}

        {activeTab === 'search' && (
          <SearchPage
            articles={articles}
            categories={categories}
            user={user}
            savedIds={savedArticleIds}
            likedIds={likedIds}
            onSelectArticle={handleSelectArticle}
            onToggleSave={toggleSaveArticle}
            onToggleLike={toggleLikeArticle}
            onShare={(art) => setShareModalArticle(art)}
            onOpenComments={(art) => setCommentModalArticle(art)}
          />
        )}

        {activeTab === 'saved' && (
          <SavedArticles
            articles={articles}
            savedIds={savedArticleIds}
            user={user}
            likedIds={likedIds}
            onSelectArticle={handleSelectArticle}
            onToggleSave={toggleSaveArticle}
            onToggleLike={toggleLikeArticle}
            onShare={(art) => setShareModalArticle(art)}
            onOpenComments={(art) => setCommentModalArticle(art)}
            onOpenAuth={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsPage
            notifications={notifications}
            user={user}
            onMarkAllRead={markAllNotificationsRead}
            onMarkNotificationRead={markNotificationRead}
            onToggleNotificationRead={toggleNotificationRead}
            onSelectArticle={handleSelectArticle}
            onOpenAuth={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            user={user}
            setUser={updateUserProfile}
            showToast={showToast}
            onOpenAuth={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            user={user}
            onTogglePush={togglePushNotifications}
            showToast={showToast}
            onOpenAuth={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage />
        )}

        {activeTab === 'contact' && (
          <ContactPage showToast={showToast} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            articles={articles}
            categories={categories}
            reports={reports}
            siteSettings={siteSettings}
            user={user}
            onPublishArticle={publishArticleAdmin}
            onUpdateArticle={updateArticleAdmin}
            onDeleteArticle={deleteArticleAdmin}
            onDeleteComment={deleteComment}
            onBroadcastAnnouncement={broadcastAnnouncement}
            onAddCategory={addCategoryAdmin}
            onDeleteCategory={deleteCategoryAdmin}
            onUpdateSiteSettings={updateSiteSettings}
            onResetData={resetAllData}
            showToast={showToast}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (iPhone / Android) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        savedCount={savedArticleIds.length}
        onOpenAuth={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 mt-16 sm:mt-20 py-10 sm:py-12 pb-24 md:pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="font-editorial text-2xl font-black text-neutral-900 dark:text-white">PALE</span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Plateforme moderne de contenu multi-thèmes.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center space-x-6 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <button onClick={() => setActiveTab('home')} className="hover:text-black dark:hover:text-white transition-colors">Accueil</button>
            <button onClick={() => setActiveTab('articles')} className="hover:text-black dark:hover:text-white transition-colors">Articles</button>
            <button onClick={() => setActiveTab('about')} className="hover:text-black dark:hover:text-white transition-colors">À propos</button>
            <button onClick={() => setActiveTab('contact')} className="hover:text-black dark:hover:text-white transition-colors">Contact</button>
          </div>
          <p className="text-xs text-neutral-400">© 2026 PALE Magazine. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onLogin={loginUser}
        onRegister={registerUser}
        onLoginWithGoogle={loginWithGoogle}
        onForgotPassword={resetPassword}
        showToast={showToast}
      />

      <ShareModal
        article={shareModalArticle}
        onClose={() => setShareModalArticle(null)}
        showToast={showToast}
      />

      {commentModalArticle && (
        <CommentModal
          article={commentModalArticle}
          comments={comments}
          user={user}
          likedCommentIds={likedCommentIds}
          onClose={() => setCommentModalArticle(null)}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
          onReportComment={reportComment}
          onToggleLikeComment={toggleLikeComment}
          onOpenAuth={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
        />
      )}

    </div>
  );
}
