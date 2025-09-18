import React from 'react';
import { useLoadingOptimizations } from './useLoadingOptimizations';

export interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  strokeWidth?: number;
  duration?: number;
  className?: string;
}

const sizeMap = {
  sm: 48,
  md: 64,
  lg: 80;
};

const strokeWidthMap = {
  sm: 3,
  md: 4,
  lg: 5;
};

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'md',
  color = '#3B82F6',
  strokeWidth,
  duration = 2,
  className = ''
}) => {
  const { prefersReducedMotion, shouldUseGPUAcceleration } = useLoadingOptimizations();
  
  const radius = sizeMap[size];
  const stroke = strokeWidth || strokeWidthMap[size];
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Create dash pattern for animated circle
  const strokeDasharray = `${circumference * 0.25} ${circumference * 0.75}`;
  
  // Adjust animation based on accessibility preferences
  const animationDuration = prefersReducedMotion ? duration * 3 : duration;
  const shouldAnimate = !prefersReducedMotion;

  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ 
        width: radius * 2, 
        height: radius * 2,
        willChange: 'transform'
      }}
    >
      <svg
        width={radius * 2}
        height={radius * 2}
        className={shouldAnimate ? 'animate-spin' : ''}
        style={{
          animationDuration: `${animationDuration}s`,
          animationTimingFunction: 'ease-in-out',
          transform: 'rotate(-90deg)',
          transformOrigin: 'center',
          ...(shouldUseGPUAcceleration && {
            willChange: 'transform',
            transform: 'rotate(-90deg) translateZ(0)'
          })
        }}
        role="img"
        aria-label="Carregando"
      >
        {/* Background circle */}
        <circle
          stroke={`${color}20`}
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        {/* Animated progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={strokeDasharray}
          strokeDashoffset="0"
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transformOrigin: 'center',
            willChange: 'stroke-dashoffset'
          }}
        />
      </svg>
    </div>
  );
};