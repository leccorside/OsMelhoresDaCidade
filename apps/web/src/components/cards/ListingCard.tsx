'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';

export interface ListingCardProps {
  id: string;
  name: string;
  slug: string;
  citySlug: string;
  neighborhood?: string;
  categoryName: string;
  priceTier?: string;
  ratingAverage: number;
  ratingCount: number;
  coverUrl?: string;
  isOpen?: boolean;
  isFeatured?: boolean;
  onFavoriteToggle?: (id: string, isFavorited: boolean) => void;
  initialFavorited?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  id,
  name,
  slug,
  citySlug,
  neighborhood,
  categoryName,
  priceTier = '$$',
  ratingAverage,
  ratingCount,
  coverUrl,
  isOpen = true,
  isFeatured = false,
  onFavoriteToggle,
  initialFavorited = false,
}) => {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !isFavorited;
    setIsFavorited(newState);
    onFavoriteToggle?.(id, newState);
  };

  const href = `/${citySlug}/lugar/${slug}`;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] hover:shadow-hover hover:border-gray-300 transition-all duration-300 flex flex-col h-full">
      {/* Media Header (16:10 aspect ratio) */}
      <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/10 to-amber-500/10 text-gray-400">
            <span className="text-sm font-medium">{categoryName}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge variant={isOpen ? 'open' : 'closed'} />
          {isFeatured && <Badge variant="featured">Destaque</Badge>}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#171717] hover:scale-110 active:scale-95 transition-all shadow-sm z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-[#FF3B4F] text-[#FF3B4F]' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Price Tier Overlay */}
        <div className="absolute bottom-3 right-3 z-10">
          <Badge variant="price">{priceTier}</Badge>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Neighborhood & Category */}
          <div className="flex items-center gap-1.5 text-xs text-[#777777] mb-1.5">
            {neighborhood && (
              <>
                <MapPin className="w-3.5 h-3.5 text-[#FF3B4F] shrink-0" />
                <span className="truncate">{neighborhood}</span>
                <span>•</span>
              </>
            )}
            <span className="font-medium text-[#171717]">{categoryName}</span>
          </div>

          {/* Establishment Name */}
          <Link href={href} className="block group-hover:text-[#FF3B4F] transition-colors">
            <h3 className="font-bold text-base sm:text-lg text-[#171717] tracking-tight line-clamp-1">
              {name}
            </h3>
          </Link>
        </div>

        {/* Ratings Footer */}
        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
          <StarRating rating={ratingAverage} count={ratingCount} size="sm" />
          <Link
            href={href}
            className="text-xs font-semibold text-[#FF3B4F] group-hover:translate-x-1 transition-transform inline-flex items-center"
          >
            Ver mais &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

