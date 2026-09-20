import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  url?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  url,
  name,
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-20 h-20 text-2xl'
  };

  const iconSizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-10 h-10'
  };

  if (url && url.trim().length > 0) {
    return (
      <img
        src={url}
        alt={name || 'Avatar utilisateur'}
        className={`${sizeMap[size]} rounded-full object-cover flex-shrink-0 border border-neutral-200 dark:border-neutral-700 ${className}`}
      />
    );
  }

  // Initial letter if name is available, otherwise default neutral User icon
  const initial = name && name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : null;

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold flex-shrink-0 select-none ${className}`}
      title={name || 'Utilisateur'}
    >
      {initial ? (
        <span>{initial}</span>
      ) : (
        <User className={iconSizeMap[size]} />
      )}
    </div>
  );
};
