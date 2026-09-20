import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  onRegister: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }> | { success: boolean; error?: string; message?: string };
  onLoginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  onForgotPassword: (email: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  showToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLogin,
  onRegister,
  onLoginWithGoogle,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const res = await onForgotPassword(email.trim());
        if (res.success) {
          setSuccessMessage(res.message);
        } else {
          setErrorMessage(res.message);
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMessage('Veuillez entrer votre nom complet.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
          setLoading(false);
          return;
        }
        const res = await onRegister({
          fullName: fullName.trim(),
          email: email.trim(),
          password
        });
        if (!res.success) {
          setErrorMessage(res.error || 'Erreur lors de la création du compte.');
        } else {
          if (res.message) {
            setSuccessMessage(res.message);
          } else {
            onClose();
          }
        }
      } else {
        // Login
        const res = await onLogin(email.trim(), password);
        if (!res.success) {
          const err = res.error || '';
          if (
            err.toLowerCase().includes('invalid login credentials') ||
            err.toLowerCase().includes('invalid credentials') ||
            err.toLowerCase().includes('invalid_grant') ||
            err.toLowerCase().includes('user not found') ||
            err.toLowerCase().includes('credentials')
          ) {
            setErrorMessage("Compte non reconnu ou mot de passe incorrect. Si vous n'avez pas encore de compte, vous pouvez vous inscrire gratuitement.");
          } else {
            setErrorMessage(err || "Compte non reconnu ou mot de passe incorrect.");
          }
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
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
              <div className="flex-1">
                <p>{errorMessage}</p>
                {mode === 'login' && errorMessage.includes('Compte non reconnu') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                    }}
                    className="mt-1.5 font-bold text-rose-900 dark:text-rose-200 underline hover:no-underline inline-block"
                  >
                    Créer un compte avec cet e-mail →
                  </button>
                )}
              </div>
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

          {/* Google Login Option */}
          {mode !== 'forgot' && (
            <>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-neutral-900 px-2 text-neutral-400">ou</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setErrorMessage(null);
                  const res = await onLoginWithGoogle();
                  setLoading(false);
                  if (!res.success) {
                    setErrorMessage(res.error || 'Erreur lors de la connexion avec Google.');
                  } else {
                    onClose();
                  }
                }}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 font-medium text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xs transition-all flex items-center justify-center space-x-2.5 min-h-[44px]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continuer avec Google</span>
              </button>
            </>
          )}

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
