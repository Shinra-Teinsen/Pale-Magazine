import React, { useState } from 'react';
import { MessageCircle, Heart, Flag, Trash2, Reply, Send, ShieldAlert } from 'lucide-react';
import { Comment, Profile } from '../types';
import { UserAvatar } from './UserAvatar';

interface CommentSectionProps {
  articleId: string;
  comments: Comment[];
  user: Profile | null;
  likedCommentIds: string[];
  onAddComment: (articleId: string, content: string, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
  onReportComment: (commentId: string, reason: string) => void;
  onToggleLikeComment: (commentId: string) => void;
  onOpenAuth: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  articleId,
  comments,
  user,
  likedCommentIds,
  onAddComment,
  onDeleteComment,
  onReportComment,
  onToggleLikeComment,
  onOpenAuth
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reportModalCommentId, setReportModalCommentId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Contenu inapproprié');

  const articleComments = comments.filter(c => c.article_id === articleId && !c.parent_id);

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!newCommentText.trim()) return;
    onAddComment(articleId, newCommentText.trim());
    setNewCommentText('');
  };

  const handleReplySubmit = (parentId: string) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!replyText.trim()) return;
    onAddComment(articleId, replyText.trim(), parentId);
    setReplyText('');
    setReplyingToId(null);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalCommentId) return;
    onReportComment(reportModalCommentId, reportReason);
    setReportModalCommentId(null);
  };

  return (
    <section className="mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center space-x-3 mb-8">
        <MessageCircle className="w-6 h-6 text-neutral-900 dark:text-white" />
        <h3 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-white">
          Commentaires ({comments.filter(c => c.article_id === articleId).length})
        </h3>
      </div>

      {/* New Comment Input */}
      {user ? (
        <form onSubmit={handleMainSubmit} className="mb-10 bg-neutral-50 dark:bg-neutral-900/60 p-4 sm:p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start space-x-4">
            <UserAvatar
              url={user.avatar_url}
              name={user.full_name}
              size="lg"
            />
            <div className="flex-1">
              <textarea
                rows={3}
                required
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Partagez votre avis sur cet article..."
                className="w-full p-4 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-2"
                >
                  <span>Publier le commentaire</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 bg-neutral-50 dark:bg-neutral-900/60 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Vous devez être connecté pour participer à la discussion.</p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-2.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs rounded-xl transition-colors"
          >
            Se connecter ou s'inscrire
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {articleComments.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 italic text-center py-8">Aucun commentaire pour le moment. Soyez le premier à réagir !</p>
        ) : (
          articleComments.map(comment => {
            const replies = comments.filter(c => c.parent_id === comment.id);
            const isOwner = user?.id === comment.user_id || user?.role === 'admin';

            return (
              <div key={comment.id} className="bg-white dark:bg-neutral-900 p-5 sm:p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-4">
                
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserAvatar
                      url={comment.user?.avatar_url}
                      name={comment.user?.full_name}
                      size="md"
                    />
                    <div>
                      <span className="font-semibold text-sm text-neutral-900 dark:text-white">{comment.user?.full_name || 'Utilisateur'}</span>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        {new Date(comment.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {user && (
                      <button
                        onClick={() => setReportModalCommentId(comment.id)}
                        className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-rose-600 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        title="Signaler"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    )}
                    {isOwner && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-rose-600 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed pl-12">
                  {comment.content}
                </p>

                {/* Actions */}
                <div className="pl-12 flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                  {(() => {
                    const isCommentLiked = likedCommentIds.includes(comment.id);
                    return (
                      <button
                        onClick={() => onToggleLikeComment(comment.id)}
                        className={`flex items-center space-x-1 transition-colors ${isCommentLiked ? 'text-rose-600 font-bold cursor-default' : 'hover:text-rose-600'}`}
                        title={isCommentLiked ? "Vous avez déjà aimé ce commentaire (1 like par compte)" : "Aimer le commentaire"}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isCommentLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                        <span>{comment.likes_count}</span>
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                    className="flex items-center space-x-1 hover:text-black dark:hover:text-white transition-colors font-medium"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Répondre</span>
                  </button>
                </div>

                {/* Reply Form */}
                {replyingToId === comment.id && (
                  <div className="pl-12 pt-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Répondre à ${comment.user?.full_name}...`}
                        className="flex-1 p-3 text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                      />
                      <button
                        onClick={() => handleReplySubmit(comment.id)}
                        className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                      >
                        Répondre
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {replies.length > 0 && (
                  <div className="pl-12 pt-4 space-y-3 border-t border-neutral-100 dark:border-neutral-800 mt-4">
                    {replies.map(reply => (
                      <div key={reply.id} className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <UserAvatar
                              url={reply.user?.avatar_url}
                              name={reply.user?.full_name}
                              size="xs"
                            />
                            <span className="font-semibold text-xs text-neutral-900 dark:text-white">{reply.user?.full_name}</span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                              {new Date(reply.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          {(user?.id === reply.user_id || user?.role === 'admin') && (
                            <button
                              onClick={() => onDeleteComment(reply.id)}
                              className="text-neutral-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 pl-8">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Report Modal */}
      {reportModalCommentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center space-x-2 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h4 className="font-bold text-neutral-900 dark:text-white text-base">Signaler le commentaire</h4>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Pourquoi souhaitez-vous signaler ce commentaire à l'administrateur ?</p>
            
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-3 text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl"
            >
              <option value="Propos injurieux ou haineux">Propos injurieux ou haineux</option>
              <option value="Spam ou publicité">Spam ou publicité</option>
              <option value="Désinformation">Désinformation</option>
              <option value="Autre">Autre</option>
            </select>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setReportModalCommentId(null)}
                className="flex-1 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleReportSubmit}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                Envoyer le signalement
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
