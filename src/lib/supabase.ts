import { createClient } from '@supabase/supabase-js';
import { Article, Category, Comment, NotificationItem, Profile, ReportItem, Tag } from '../types';

// Supabase environment variables
const SUPABASE_URL_KEY = 'PALE_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'PALE_SUPABASE_ANON_KEY';

export function getSavedSupabaseCredentials() {
  const url = localStorage.getItem(SUPABASE_URL_KEY) || (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const anonKey = localStorage.getItem(SUPABASE_ANON_KEY) || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  return { url, anonKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
}

const { url: initialUrl, anonKey: initialAnonKey } = getSavedSupabaseCredentials();

export const supabase = initialUrl && initialAnonKey 
  ? createClient(initialUrl, initialAnonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

// Helper to check if Supabase is active
export function isSupabaseConfigured(): boolean {
  const creds = getSavedSupabaseCredentials();
  return Boolean(creds.url && creds.anonKey);
}

// SQL Schema script for the user to copy into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `
-- PALE Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  bio text,
  role text default 'user' check (role in ('user', 'admin')),
  push_notifications_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categories table
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  slug text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tags table
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  slug text unique not null
);

-- 4. Articles table
create table if not exists public.articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text not null,
  cover_image text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  status text default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  published_at timestamp with time zone,
  scheduled_at timestamp with time zone,
  is_featured boolean default false,
  views_count integer default 0,
  likes_count integer default 0,
  comments_count integer default 0,
  shares_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Article Tags junction table
create table if not exists public.article_tags (
  article_id uuid references public.articles(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- 6. Comments table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  likes_count integer default 0,
  is_reported boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Article Likes table (Unique constraint so user can like only once)
create table if not exists public.article_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, article_id)
);

-- 8. Comment Likes table
create table if not exists public.comment_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  primary key (user_id, comment_id)
);

-- 9. Saved Articles table
create table if not exists public.saved_articles (
  user_id uuid references public.profiles(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, article_id)
);

-- 10. Article Views table
create table if not exists public.article_views (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Article Shares table
create table if not exists public.article_shares (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  platform text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('new_article', 'comment_reply', 'comment_like', 'admin_announcement')),
  related_id uuid,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Push Subscriptions table
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Reports table
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  comment_id uuid references public.comments(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Admin Announcements table
create table if not exists public.admin_announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS ON ALL TABLES
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;
alter table public.comments enable row level security;
alter table public.article_likes enable row level security;
alter table public.comment_likes enable row level security;
alter table public.saved_articles enable row level security;
alter table public.article_views enable row level security;
alter table public.article_shares enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.reports enable row level security;
alter table public.admin_announcements enable row level security;

-- BASIC RLS POLICIES (Examples)
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Categories are viewable by everyone" on public.categories for select using (true);
create policy "Tags are viewable by everyone" on public.tags for select using (true);

create policy "Published articles viewable by everyone" on public.articles for select using (status = 'published' or auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admin can insert articles" on public.articles for insert with check (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admin can update articles" on public.articles for update using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admin can delete articles" on public.articles for delete using (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Comments viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can create comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments" on public.comments for update using (auth.uid() = user_id or auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Users can delete own comments or admin" on public.comments for delete using (auth.uid() = user_id or auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Saved articles own user" on public.saved_articles for all using (auth.uid() = user_id);
create policy "Article likes own user" on public.article_likes for all using (auth.uid() = user_id);
create policy "Notifications own user" on public.notifications for all using (auth.uid() = user_id);
`;
