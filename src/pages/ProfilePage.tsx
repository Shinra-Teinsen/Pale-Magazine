import React, { useState } from 'react';
import { Profile } from '../types';
import { User, Calendar, ShieldCheck, Camera, Save, Trash2 } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';

interface ProfilePageProps {
  user: Profile | null;
  setUser: (profile: Profile) => void;
  showToast: (msg: string) => void;
  onOpenAuth: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  setUser,
  showToast,
  onOpenAuth
}) => {
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <User className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
        <h2 className="font-editorial text-2xl font-bold text-neutral-900 dark:text-white">Mon profil</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Connectez-vous pour gérer votre profil et vos préférences.</p>
        <button onClick={onOpenAuth} className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-semibold shadow-md">
          Se connecter
        </button>
      </div>
    );
  }

  const [fullName, setFullName] = useState(user.full_name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Profile = {
      ...user,
      full_name: fullName,
      bio,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    };
    setUser(updated);
    showToast('Profil mis à jour avec succès ✨');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('L\'image est trop volumineuse (max 2 Mo)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setAvatarUrl(uploadEvent.target.result as string);
        showToast('Image chargée avec succès depuis votre appareil !');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center space-x-3 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-editorial text-3xl font-black text-neutral-950 dark:text-white">Mon profil</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Gérez vos informations personnelles et votre avatar</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        
        {/* Avatar preview and device upload */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative group">
            <UserAvatar
              url={avatarUrl}
              name={fullName || user.full_name}
              size="xl"
              className="shadow-md border-2 border-white dark:border-neutral-800 ring-2 ring-neutral-200 dark:ring-neutral-700"
            />
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                title="Supprimer la photo"
                className="absolute -top-1 -right-1 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex-1 space-y-3 w-full">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Photo de profil depuis votre appareil</label>
              <div className="flex items-center space-x-2">
                <label className="inline-flex items-center justify-center flex-1 px-4 py-2.5 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-all space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Choisir une photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="px-3 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded-xl transition-colors"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 dark:text-neutral-500 mb-1">Ou collez une URL d'image personnalisée</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://mon-image.com/avatar.jpg"
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Nom / Pseudonyme</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Adresse e-mail</label>
          <input
            type="email"
            disabled
            value={user.email}
            className="w-full px-4 py-3 text-sm bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Courte biographie</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Quelques mots sur vous..."
            className="w-full p-4 text-sm bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Calendar className="w-4 h-4" />
            <span>Membre depuis le {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>

      </form>

    </div>
  );
};
