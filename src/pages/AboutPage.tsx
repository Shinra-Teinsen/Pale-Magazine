import React from 'react';
import { Sparkles, Shield, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold text-xs uppercase tracking-widest rounded-full">
          À propos de PALE
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-black text-neutral-950 dark:text-white">
          L'excellence éditoriale au carrefour des idées
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-base leading-relaxed">
          PALE est une plateforme moderne de contenu multi-thèmes conçue pour éveiller la curiosité, nourrir le débat intellectuel et inspirer les esprits créatifs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-neutral-200 dark:border-neutral-800">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Indépendance & Qualité</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Chaque article est rédigé avec rigueur et passion par notre rédaction et nos contributeurs experts.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Sécurité & Vie Privée</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Vos données personnelles sont protégées par des protocoles de chiffrement de pointe propulsés par Supabase.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center">
            <Award className="w-6 h-6 text-rose-400" />
          </div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Expérience Moderne</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Une interface mobile-first fluide, élégante et rapide, pensée pour le confort de lecture absolu.
          </p>
        </div>
      </div>

    </div>
  );
};
