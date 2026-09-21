import { createClient } from '@supabase/supabase-js';
import { Article, Category, Comment, NotificationItem, Profile, ReportItem, Tag } from '../types';
import { SITE_SUPABASE_CONFIG } from './supabaseConfig';

// Supabase environment variables & central site keys
const SUPABASE_URL_KEY = 'PALE_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'PALE_SUPABASE_ANON_KEY';
export const PRIMARY_ADMIN_EMAIL = 'mesyepyewo@gmail.com';

export function getSavedSupabaseCredentials() {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  
  // Priorité 1: Configuration globale du site (centralisée pour tous les appareils)
  // Priorité 2: Variables d'environnement de build/serveur
  // Priorité 3: Cache local admin (si configuré)
  const url = SITE_SUPABASE_CONFIG.url || envUrl || (typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_URL_KEY) : '') || '';
  const anonKey = SITE_SUPABASE_CONFIG.anonKey || envAnonKey || (typeof localStorage !== 'undefined' ? localStorage.getItem(SUPABASE_ANON_KEY) : '') || '';
  
  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
  }
}

export function clearSupabaseCredentials() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_ANON_KEY);
  }
}

const { url: initialUrl, anonKey: initialAnonKey } = getSavedSupabaseCredentials();

export const supabase = initialUrl && initialAnonKey 
  ? createClient(initialUrl, initialAnonKey, { 
      auth: { 
        persistSession: true, 
        autoRefreshToken: true,
        detectSessionInUrl: true
      } 
    })
  : null;

// Helper to check if Supabase is active
export function isSupabaseConfigured(): boolean {
  const creds = getSavedSupabaseCredentials();
  return Boolean(creds.url && creds.anonKey);
}

// SQL Schema script for the user to copy into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ==========================================================
-- PALE MAGAZINE - SUPABASE PRODUCTION DATABASE SCHEMA
-- Exécutez ce script dans votre éditeur SQL Supabase (SQL Editor)
-- ==========================================================

-- 1. Table Profiles (liée aux utilisateurs Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  bio text,
  role text default 'user' check (role in ('user', 'admin')),
  push_notifications_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Table Categories
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  slug text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Table Tags
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  slug text unique not null
);

-- 4. Table Articles
create table if not exists public.articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text not null,
  cover_image text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  status text default 'published' check (status in ('draft', 'scheduled', 'published', 'archived')),
  published_at timestamp with time zone default timezone('utc'::text, now()),
  scheduled_at timestamp with time zone,
  is_featured boolean default false,
  views_count integer default 0,
  likes_count integer default 0,
  comments_count integer default 0,
  shares_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Table Article Tags
create table if not exists public.article_tags (
  article_id uuid references public.articles(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- 6. Table Comments
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

-- 7. Table Article Likes
create table if not exists public.article_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, article_id)
);

-- 8. Table Comment Likes
create table if not exists public.comment_likes (
  user_id uuid references public.profiles(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, comment_id)
);

-- 9. Table Saved Articles
create table if not exists public.saved_articles (
  user_id uuid references public.profiles(id) on delete cascade,
  article_id uuid references public.articles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, article_id)
);

-- 10. Table Article Views
create table if not exists public.article_views (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Table Notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- user UUID or 'all'
  title text not null,
  message text not null,
  type text not null check (type in ('new_article', 'comment_reply', 'comment_like', 'admin_announcement')),
  related_id uuid,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Table Reports
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  comment_id uuid references public.comments(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Table Newsletters
create table if not exists public.newsletters (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ACTIVER ROW LEVEL SECURITY (RLS)
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
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.newsletters enable row level security;

-- POLITIQUES RLS IDEMPOTENTES (Suppression préalable pour éviter les erreurs)
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Categories are viewable by everyone" on public.categories;
drop policy if exists "Admin can manage categories" on public.categories;
create policy "Categories are viewable by everyone" on public.categories for select using (true);
create policy "Admin can manage categories" on public.categories for all using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

drop policy if exists "Articles are viewable by everyone" on public.articles;
drop policy if exists "Admin can manage articles" on public.articles;
create policy "Articles are viewable by everyone" on public.articles for select using (
  status = 'published' or auth.uid() in (select id from public.profiles where role = 'admin')
);
create policy "Admin can manage articles" on public.articles for all using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

drop policy if exists "Comments viewable by everyone" on public.comments;
drop policy if exists "Authenticated users can create comments" on public.comments;
drop policy if exists "Users can delete own comments or admin" on public.comments;
create policy "Comments viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can create comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments or admin" on public.comments for delete using (
  auth.uid() = user_id or auth.uid() in (select id from public.profiles where role = 'admin')
);

drop policy if exists "Article likes viewable by everyone" on public.article_likes;
drop policy if exists "Users can manage article likes" on public.article_likes;
create policy "Article likes viewable by everyone" on public.article_likes for select using (true);
create policy "Users can manage article likes" on public.article_likes for all using (auth.uid() = user_id);

drop policy if exists "Comment likes viewable by everyone" on public.comment_likes;
drop policy if exists "Users can manage comment likes" on public.comment_likes;
create policy "Comment likes viewable by everyone" on public.comment_likes for select using (true);
create policy "Users can manage comment likes" on public.comment_likes for all using (auth.uid() = user_id);

drop policy if exists "Saved articles own user" on public.saved_articles;
create policy "Saved articles own user" on public.saved_articles for all using (auth.uid() = user_id);

drop policy if exists "Article views insert" on public.article_views;
drop policy if exists "Article views select" on public.article_views;
create policy "Article views insert" on public.article_views for insert with check (true);
create policy "Article views select" on public.article_views for select using (true);

drop policy if exists "Notifications select" on public.notifications;
drop policy if exists "Notifications admin insert" on public.notifications;
drop policy if exists "Notifications update own" on public.notifications;
create policy "Notifications select" on public.notifications for select using (user_id = 'all' or auth.uid()::text = user_id);
create policy "Notifications admin insert" on public.notifications for insert with check (true);
create policy "Notifications update own" on public.notifications for update using (auth.uid()::text = user_id or user_id = 'all');

drop policy if exists "Reports insert" on public.reports;
drop policy if exists "Reports admin select" on public.reports;
create policy "Reports insert" on public.reports for insert with check (auth.uid() = user_id);
create policy "Reports admin select" on public.reports for all using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletters;
drop policy if exists "Admin can view newsletter subscribers" on public.newsletters;
create policy "Anyone can subscribe to newsletter" on public.newsletters for insert with check (true);
create policy "Admin can view newsletter subscribers" on public.newsletters for select using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

-- DÉCLENCHEUR AUTOMATIQUE : CRÉATION DE PROFIL & RÔLE ADMIN AUTOMATIQUE POUR mesyepyewo@gmail.com
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role, push_notifications_enabled)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.email),
    case when lower(new.email) = 'mesyepyewo@gmail.com' then 'admin' else 'user' end,
    true
  )
  on conflict (id) do update set
    role = case when lower(new.email) = 'mesyepyewo@gmail.com' then 'admin' else public.profiles.role end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- INSERTION DES CATÉGORIES INITIALES (Production Seed)
insert into public.categories (name, slug, description)
values
  ('Société', 'societe', 'Analyses sociologiques, débats et mouvements contemporains'),
  ('Lifestyle', 'lifestyle', 'Mode de vie, bien-être, voyage et tendances'),
  ('Culture', 'culture', 'Cinéma, littérature, musique et arts visuels'),
  ('Tendances', 'tendances', 'Innovations, médias, décryptages et avant-gardes')
on conflict (slug) do nothing;

-- ATTRIBUTION DIRECTE ADMIN SI L'UTILISATEUR EST DÉJÀ PRÉSENT
update public.profiles
set role = 'admin'
where lower(email) = 'mesyepyewo@gmail.com';
`;

