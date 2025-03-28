
import React from 'react';
import { cn } from '@/lib/utils';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const PixelButton = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: PixelButtonProps) => {
  // Define color classes based on variant
  const colorClasses = {
    primary: 'bg-retro-pixel-blue hover:bg-retro-pixel-blue/90 border-retro-pixel-dark',
    secondary: 'bg-retro-pixel-purple hover:bg-retro-pixel-purple/90 border-retro-pixel-dark',
    success: 'bg-retro-pixel-green hover:bg-retro-pixel-green/90 border-retro-pixel-dark',
    danger: 'bg-retro-pixel-red hover:bg-retro-pixel-red/90 border-retro-pixel-dark',
  };

  // Define size classes
  const sizeClasses = {
    sm: 'py-1 px-2 text-xs',
    md: 'py-2 px-4 text-sm',
    lg: 'py-3 px-6 text-base',
  };

  return (
    <button
      className={cn(
        'font-pixel text-white transition-all duration-100',
        'border-b-4 border-r-4',
        'active:border-b-0 active:border-r-0',
        'active:translate-x-1 active:translate-y-1',
        'focus:outline-none',
        colorClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default PixelButton;
