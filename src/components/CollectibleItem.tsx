
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
      color: 'bg-retro-neon-yellow',
      border: 'border-retro-arcade-black',
      symbol: '¤',
      textColor: 'text-retro-arcade-black',
      shadow: 'shadow-[0_0_8px_rgba(255,255,0,0.7)]',
      shapeClass: 'rounded-full' // Coins are round
    },
    key: {
      color: 'bg-retro-neon-blue',
      border: 'border-retro-arcade-black',
      symbol: '⚷',
      textColor: 'text-retro-arcade-black',
      shadow: 'shadow-[0_0_8px_rgba(0,255,255,0.7)]',
      shapeClass: '' // Keys are normal shapes
    },
    heart: {
      color: 'bg-retro-neon-pink',
      border: 'border-retro-arcade-black',
      symbol: '♥',
      textColor: 'text-retro-arcade-black',
      shadow: 'shadow-[0_0_8px_rgba(255,0,255,0.7)]',
      shapeClass: 'heart-shape' // Hearts use custom shape
    }
  };

  const style = collectibleStyles[type];

  return (
    <div className="flex items-center">
      <div
        className={cn(
          style.color,
          style.border,
          style.textColor,
          style.shadow,
          style.shapeClass,
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
        <span className="ml-2 font-pixel text-retro-neon-green">
          ×{count}
        </span>
      )}
    </div>
  );
};

export default CollectibleItem;
