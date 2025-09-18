import React from 'react';
import { cn } from '@/lib/utils';

interface ComingSoonBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'minimal';
}

export const ComingSoonBadge: React.FC<ComingSoonBadgeProps> = ({ 
  className, 
  size = 'sm', 
  variant = 'default' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5';
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-sm',
    outline: 'border-2 border-blue-400 text-blue-600 bg-blue-50',
    minimal: 'bg-blue-100 text-blue-700';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold uppercase tracking-wide',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      BREVE
    </span>
  )
};
