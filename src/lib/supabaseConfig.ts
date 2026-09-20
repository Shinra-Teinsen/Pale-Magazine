/**
 * PALE MAGAZINE — CONFIGURATION GLOBALE SUPABASE DU SITE
 * 
 * Cette configuration est UNIQUE pour l'ensemble du site.
 * Tous les appareils (smartphones, ordinateurs, tablettes) et tous les utilisateurs
 * se connectent automatiquement à cette même base de données.
 * 
 * Aucun visiteur ni lecteur n'est sollicité pour configurer Supabase.
 */

// Identifiants par défaut du projet Supabase
export const SITE_SUPABASE_CONFIG = {
  // Lit d'abord les variables d'environnement Vite (.env ou environnement de déploiement)
  url: ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim(),
  anonKey: ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim()
};
