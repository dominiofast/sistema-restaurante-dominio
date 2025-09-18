import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProBadgeProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outline' | 'minimal';
}

export const ProBadge: React.FC<ProBadgeProps> = ({
    className,
    size = 'sm',
    variant = 'default'
}) => {
    const sizeClasses = {
        sm: 'text-xs px-1.5 py-0.5 gap-1',
        md: 'text-sm px-2 py-1 gap-1.5',
        lg: 'text-base px-3 py-1.5 gap-2';
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5';
    };

    const variantClasses = {
        default: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm',
        outline: 'border-2 border-amber-400 text-amber-600 bg-amber-50',
        minimal: 'bg-amber-100 text-amber-700';
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
            <Crown className={iconSizes[size]} />
            PRÓ
        </span>
    )
};
