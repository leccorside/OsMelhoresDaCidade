import React from 'react';
import { Sparkles } from 'lucide-react';

export interface BadgeProps {
  variant?: 'open' | 'closed' | 'featured' | 'category' | 'price';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'category', children, className = '' }) => {
  const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide';

  switch (variant) {
    case 'open':
      return (
        <span className={`${baseStyles} bg-[#10B981]/10 text-[#10B981] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          {children || 'Aberto agora'}
        </span>
      );
    case 'closed':
      return (
        <span className={`${baseStyles} bg-gray-100 text-gray-500 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          {children || 'Fechado no momento'}
        </span>
      );
    case 'featured':
      return (
        <span className={`${baseStyles} bg-[#F59E0B]/15 text-[#D97706] ${className}`}>
          <Sparkles className="w-3 h-3 text-[#F59E0B]" />
          {children || 'Destaque'}
        </span>
      );
    case 'price':
      return (
        <span className={`${baseStyles} bg-white/90 text-[#171717] backdrop-blur-sm shadow-sm ${className}`}>
          {children}
        </span>
      );
    case 'category':
    default:
      return (
        <span className={`${baseStyles} bg-[#F0EDED] text-[#5C3F3F] hover:bg-[#E5E2E1] transition ${className}`}>
          {children}
        </span>
      );
  }
};
