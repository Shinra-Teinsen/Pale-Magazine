import React from 'react';
import { Profile } from '../types';
import { Settings, Bell, Shield, Smartphone, Check } from 'lucide-react';

interface SettingsPageProps {
  user: Profile | null;
  onTogglePush: () => void;
  showToast: (msg: string) => void;
  onOpenAuth: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onTogglePush,
  showToast,
  onOpenAuth
}) => {
  const pushEnabled = user?.push_notifications_enabled || false;

  const handlePushToggle = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    onTogglePush();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center space-x-3 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-editorial text-3xl font-black text-neutral-950 dark:text-white">Paramètres & Notifications</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Gérez vos préférences de navigation et abonnements push</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm divide-y divide-neutral-100 dark:divide-neutral-800">
        
        {/* Push Notifications Setting */}
        <div className="p-6 sm:p-8 flex items-center justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-neutral-900 dark:text-white" />
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">Activer les notifications Push</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Recevez des alertes en temps réel sur vos appareils, même lorsque le site PALE est fermé en arrière-plan.
            </p>
          </div>

          <button
            onClick={handlePushToggle}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pushEnabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-800'}`}
          >
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-neutral-900 shadow-lg ring-0 transition duration-200 ease-in-out ${pushEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* PWA Info */}
        <div className="p-6 sm:p-8 flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Application PWA & Hors-ligne</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              PALE est conçue comme une Progressive Web App. Vous pouvez l'installer directement sur votre écran d'accueil mobile ou bureau pour une expérience fluide et rapide.
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="p-6 sm:p-8 flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Sécurité & Confidentialité</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Toutes vos données sont protégées par le chiffrement Supabase et les politiques de sécurité Row Level Security (RLS).
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
