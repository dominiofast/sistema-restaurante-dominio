import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface StatusToggleProps {
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  loading?: boolean;
  size?: 'sm' | 'default';
  showLabel?: boolean;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({
  isActive,
  onToggle,
  loading = false,
  size = 'default',
  showLabel = true
}) => {
  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={isActive}
        onCheckedChange={onToggle}
        disabled={loading}
        className={`${size === 'sm' ? 'h-4 w-8' : 'h-5 w-9'}`}
      />
      {showLabel && (
        <Badge 
          variant={isActive ? "default" : "secondary"}
          className={`
            ${size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2 py-1'}
            font-medium border-0
            ${isActive 
              ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground" 
              : "bg-muted text-muted-foreground"
            }
          `}
        >
          {isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      )}
    </div>
  )
};
