'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface EventCardProps {
  id: string;
  name: string;
  slug: string;
  citySlug: string;
  categoryName: string;
  startDate: string; // ISO format
  startTime?: string;
  address?: string;
  isFree?: boolean;
  priceInfo?: string;
  coverUrl?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  name,
  slug,
  citySlug,
  categoryName,
  startDate,
  startTime,
  address,
  isFree = false,
  priceInfo,
  coverUrl,
}) => {
  const dateObj = new Date(startDate);
  const day = dateObj.toLocaleDateString('pt-BR', { day: '2-digit' });
  const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

  const href = `/${citySlug}/eventos/${slug}`;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] hover:shadow-hover hover:border-gray-300 transition-all duration-300 flex flex-col h-full">
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
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
            <Calendar className="w-8 h-8 opacity-40" />
          </div>
        )}

        {/* Calendar Badge */}
        <div className="absolute top-3 left-3 bg-white rounded-xl shadow-md p-1.5 min-w-[48px] text-center z-10">
          <span className="block text-[10px] font-bold text-[#FF3B4F] uppercase">{month}</span>
          <span className="block text-lg font-black text-[#171717] leading-none">{day}</span>
        </div>

        {/* Free / Price Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <Badge variant={isFree ? 'open' : 'price'}>
            {isFree ? 'Gratuito' : priceInfo || 'Ingressos'}
          </Badge>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-[#FF3B4F] uppercase tracking-wider block mb-1">
            {categoryName}
          </span>
          <Link href={href} className="block group-hover:text-[#FF3B4F] transition-colors">
            <h3 className="font-bold text-base sm:text-lg text-[#171717] tracking-tight line-clamp-2">
              {name}
            </h3>
          </Link>
        </div>

        <div className="pt-3 mt-3 border-t border-gray-100 text-xs text-[#777777] space-y-1">
          {startTime && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>A partir das {startTime}</span>
            </div>
          )}
          {address && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

