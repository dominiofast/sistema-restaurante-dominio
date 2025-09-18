import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2';
  };

  const containerClasses = {
    sm: 'gap-1 p-2',
    md: 'gap-1.5 p-3',
    lg: 'gap-2 p-4';
  };

  return (
    <div className={cn(
      'flex items-center justify-center bg-muted rounded-lg',
      containerClasses[size],
      className
    )}>
      <div className="flex items-center gap-1">
        <div 
          className={cn(
            'bg-muted-foreground rounded-full animate-pulse',
            sizeClasses[size]
          )}
          style={{
            animation: 'typing-dot 1.4s infinite ease-in-out',
            animationDelay: '0ms'
          }}
        />
        <div 
          className={cn(
            'bg-muted-foreground rounded-full animate-pulse',
            sizeClasses[size]
          )}
          style={{
            animation: 'typing-dot 1.4s infinite ease-in-out',
            animationDelay: '200ms'
          }}
        />
        <div 
          className={cn(
            'bg-muted-foreground rounded-full animate-pulse',
            sizeClasses[size]
          )}
          style={{
            animation: 'typing-dot 1.4s infinite ease-in-out',
            animationDelay: '400ms'
          }}
        />
      </div>
    </div>
  );
};

interface TypingMessageProps {
  name: string;
  avatar?: string;
  className?: string;
}

export const TypingMessage: React.FC<TypingMessageProps> = ({
  name,
  avatar,
  className
}) => {
  return (
    <div className={cn('flex items-start gap-2 mb-4', className)}>
      <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium text-muted-foreground">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground mb-1">{name}</span>
        <TypingIndicator />
        <span className="text-xs text-muted-foreground mt-1">digitando...</span>
      </div>
    </div>
  );
};