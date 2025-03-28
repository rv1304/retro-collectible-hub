
import React from 'react';
import { cn } from '@/lib/utils';

interface CollectibleItemProps {
  type: 'coin' | 'key' | 'heart';
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const CollectibleItem = ({ 
  type, 
  count, 
  size = 'md', 
  animated = true,
  className 
}: CollectibleItemProps) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  // Color and content based on type
  const collectibleStyles = {
    coin: {
      color: 'bg-retro-pixel-yellow',
      border: 'border-retro-pixel-brown',
      symbol: '¤'
    },
    key: {
      color: 'bg-retro-pixel-blue',
      border: 'border-retro-pixel-dark',
      symbol: '⚷'
    },
    heart: {
      color: 'bg-retro-pixel-red',
      border: 'border-retro-pixel-dark',
      symbol: '♥'
    }
  };

  const style = collectibleStyles[type];

  return (
    <div className="flex items-center">
      <div
        className={cn(
          style.color,
          style.border,
          'flex items-center justify-center border-2',
          'font-pixel select-none',
          animated && 'animate-pixel-float',
          sizeClasses[size],
          className
        )}
      >
        {style.symbol}
      </div>
      {count !== undefined && (
        <span className="ml-2 font-pixel text-retro-pixel-light">
          ×{count}
        </span>
      )}
    </div>
  );
};

export default CollectibleItem;
