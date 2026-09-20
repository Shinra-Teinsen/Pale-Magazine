export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  push_notifications_enabled?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RegisteredAccount extends Profile {
  password?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  category_id: string;
  author_id: string;
  status: ArticleStatus;
  published_at?: string;
  scheduled_at?: string;
  is_featured?: boolean; // À la une
  quote_attribution?: string; // Titrage si paroles/réflexion d'une autre personne
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: Profile;
  category?: Category;
  tags?: Tag[];
  is_liked_by_user?: boolean;
  is_saved_by_user?: boolean;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  likes_count: number;
  is_reported?: boolean;
  created_at: string;
  updated_at?: string;
  user?: Profile;
  replies?: Comment[];
  is_liked_by_user?: boolean;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'new_article' | 'comment_reply' | 'comment_like' | 'admin_announcement';
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface ReportItem {
  id: string;
  comment_id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  comment?: Comment;
  user?: Profile;
}

export interface AdminAnnouncement {
  id: string;
  title: string;
  message: string;
  created_by: string;
  created_at: string;
}

export type ActiveTab = 
  | 'home' 
  | 'articles' 
  | 'article-detail' 
  | 'categories' 
  | 'trends' 
  | 'search' 
  | 'saved' 
  | 'notifications' 
  | 'profile' 
  | 'settings' 
  | 'about' 
  | 'contact' 
  | 'admin';
