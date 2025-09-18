import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ContactAvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineIndicator?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-12 w-12 text-base';
};

const indicatorSizeClasses = {
  sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
  md: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
  lg: 'w-3 h-3 -bottom-0.5 -right-0.5',
  xl: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5';
};

// Generate consistent colors based on name
const getAvatarColor = (name: string) => {
  if (!name) return 'from-slate-400 to-slate-500';
  
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600', 
    'from-green-500 to-green-600',
    'from-pink-500 to-pink-600',
    'from-orange-500 to-orange-600',
    'from-teal-500 to-teal-600',
    'from-indigo-500 to-indigo-600',
    'from-red-500 to-red-600',
    'from-emerald-500 to-emerald-600',
    'from-violet-500 to-violet-600';
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string) => {
  if (!name) return '?';
  
  const words = name.trim().split(' ').filter(word => word.length > 0)
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
};

export const ContactAvatar: React.FC<ContactAvatarProps> = ({
  name,
  avatar,
  size = 'lg',
  showOnlineIndicator = false,
  className = ''
}) => {
  const initials = getInitials(name)
  const gradientColor = getAvatarColor(name)

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <Avatar className={`${sizeClasses[size]} ring-2 ring-white shadow-sm`}>
        {avatar && avatar.trim() && (
          <AvatarImage 
            src={avatar} 
            alt={`Avatar de ${name}`} 
            loading="lazy"
            className="object-cover"
            onError={(e) => {
              // Fallback when image fails to load - hide the image completely
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        )}
        <AvatarFallback className={`
          bg-gradient-to-br ${gradientColor} text-white font-bold
          flex items-center justify-center shadow-sm
          border-2 border-white
        `}>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {showOnlineIndicator && (
        <div className={`
          absolute ${indicatorSizeClasses[size]}
          bg-green-500 rounded-full border-2 border-white
          animate-pulse shadow-sm
        `} />
      )}
    </div>
  )
};
