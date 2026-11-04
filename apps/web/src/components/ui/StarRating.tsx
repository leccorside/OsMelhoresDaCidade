import React from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number;
  count?: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  count,
  showText = true,
  size = 'md',
  className = '',
}) => {
  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base font-bold',
  };

  const fullStars = Math.floor(rating);
  const roundedRating = Number(rating).toFixed(1);

  return (
    <div className={`inline-flex items-center gap-1.5 text-[#171717] ${className}`}>
      <div className="flex items-center text-[#F59E0B]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSizes[size]} ${
              star <= fullStars
                ? 'fill-current text-[#F59E0B]'
                : star - 0.5 <= rating
                ? 'fill-current text-[#F59E0B] opacity-70'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className={`${textSizes[size]} text-[#171717]`}>
          {roundedRating}
          {typeof count === 'number' && (
            <span className="text-[#777777] font-normal ml-1">({count.toLocaleString('pt-BR')})</span>
          )}
        </span>
      )}
    </div>
  );
};

