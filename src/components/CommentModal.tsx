import React from 'react';
import { X } from 'lucide-react';
import { Comment, Profile, Article } from '../types';
import { CommentSection } from './CommentSection';

interface CommentModalProps {
  article: Article;
  comments: Comment[];
  user: Profile | null;
  likedCommentIds: string[];
  onClose: () => void;
  onAddComment: (articleId: string, content: string, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
  onReportComment: (commentId: string, reason: string) => void;
  onToggleLikeComment: (commentId: string) => void;
  onOpenAuth: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  article,
  comments,
  user,
  likedCommentIds,
  onClose,
  onAddComment,
  onDeleteComment,
  onReportComment,
  onToggleLikeComment,
  onOpenAuth
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-neutral-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Commentaires</span>
            <h3 className="font-editorial text-xl font-bold text-neutral-950 dark:text-white line-clamp-1">{article.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CommentSection
          articleId={article.id}
          comments={comments}
          user={user}
          likedCommentIds={likedCommentIds}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          onReportComment={onReportComment}
          onToggleLikeComment={onToggleLikeComment}
          onOpenAuth={onOpenAuth}
        />
      </div>
    </div>
  );
};
