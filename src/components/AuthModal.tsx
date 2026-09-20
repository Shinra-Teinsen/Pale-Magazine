import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
  onLogin: (email: string, password: string) => { success: boolean; error?: string };
  onRegister: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => { success: boolean; error?: string };
  onForgotPassword: (email: string) => { success: boolean; message: string };
  showToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLogin,
  onRegister,
  onForgotPassword,
  showToast
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (mode === 'forgot') {
        const res = onForgotPassword(email);
        if (res.success) {
          setSuccessMessage(res.message);
        } else {
          setErrorMessage(res.message);
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMessage('Veuillez entrer votre nom complet.');
          return;
        }
        if (password.length < 4) {
          setErrorMessage('Le mot de passe doit comporter au moins 4 caractères.');
          return;
        }
        const res = onRegister({
          fullName: fullName.trim(),
          email: email.trim(),
          password
        });
        if (!res.success) {
          setErrorMessage(res.error || 'Erreur lors de la création du compte.');
        } else {
          onClose();
        }
      } else {
        // Login
        const res = onLogin(email.trim(), password);
        if (!res.success) {
          setErrorMessage(res.error || 'Identifiants invalides.');
        } else {
          onClose();
        }
      }
    }, 400);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between shrink-0">
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
              {mode === 'login' && 'Connexion'}
              {mode === 'signup' && 'Créer un compte'}
              {mode === 'forgot' && 'Mot de passe oublié'}
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {mode === 'login' && 'Accédez à votre espace, vos favoris et vos réactions.'}
              {mode === 'signup' && 'Rejoignez la plateforme éditoriale PALE.'}
              {mode === 'forgot' && 'Recevez un lien de réinitialisation sécurisé.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'login' 
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMessage(null); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signup' 
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Inscription
              </button>
            </div>
          )}

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Claire Varenne"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Mot de passe
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMessage(null); setSuccessMessage(null); }}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <span>
                {loading ? 'Traitement en cours...' : mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'Créer mon compte' : 'Envoyer le lien'}
              </span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Toggle Mode Footer */}
          <div className="text-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
            {mode === 'login' ? (
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Pas encore de compte ?{' '}
                <button 
                  onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }} 
                  className="font-bold text-neutral-900 dark:text-white hover:underline ml-1"
                >
                  Créer un compte
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Déjà inscrit ?{' '}
                <button 
                  onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }} 
                  className="font-bold text-neutral-900 dark:text-white hover:underline ml-1"
                >
                  Se connecter
                </button>
              </p>
            ) : (
              <button 
                onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }} 
                className="text-xs font-bold text-neutral-900 dark:text-white hover:underline"
              >
                ← Retour à la connexion
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
