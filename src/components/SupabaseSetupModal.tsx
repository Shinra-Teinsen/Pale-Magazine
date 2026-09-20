import React, { useState } from 'react';
import { X, Database, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, getSavedSupabaseCredentials, saveSupabaseCredentials, isSupabaseConfigured } from '../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const creds = getSavedSupabaseCredentials();
  const [url, setUrl] = useState(creds.url);
  const [anonKey, setAnonKey] = useState(creds.anonKey);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url, anonKey);
    showToast('Identifiants Supabase enregistrés avec succès !');
    window.location.reload();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    showToast('Script SQL copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Configuration Supabase & Base de données</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Connectez PALE à votre projet Supabase PostgreSQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-black dark:hover:text-white rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status banner */}
          <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${isSupabaseConfigured() ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'}`}>
            <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold">
                {isSupabaseConfigured() ? 'Supabase est configuré et actif !' : 'Stockage local persistant actif'}
              </p>
              <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">
                {isSupabaseConfigured() 
                  ? 'Vos données se synchronisent directement avec votre base de données Supabase.' 
                  : 'Vos données et comptes sont conservés en toute sécurité sur votre appareil, ou synchronisables avec vos identifiants Supabase ci-dessous.'}
              </p>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">1. Variables d'environnement Supabase</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Supabase URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full px-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Supabase Anon Key (Public API Key)</label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1..."
                  className="w-full px-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold text-xs rounded-xl shadow-xs transition-all"
              >
                Enregistrer et recharger
              </button>
            </div>
          </form>

          {/* SQL Schema Script Section */}
          <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">2. Script SQL de création des tables & RLS</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Copiez ce script et exécutez-le dans le SQL Editor de votre dashboard Supabase.</p>
              </div>
              <button
                onClick={handleCopySql}
                className="px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copié !' : 'Copier le script SQL'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 bg-neutral-900 dark:bg-neutral-950 text-neutral-200 text-xs font-mono rounded-2xl overflow-x-auto max-h-60 leading-relaxed border border-neutral-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>

          {/* Storage Buckets Info */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">3. Buckets Supabase Storage requis :</h4>
            <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 list-disc list-inside">
              <li><code className="bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">avatars</code> (Public) pour les photos de profil.</li>
              <li><code className="bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">article-covers</code> (Public) pour les images de couverture.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center space-x-1"
          >
            <span>Ouvrir le dashboard Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
