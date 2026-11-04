'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Compass } from 'lucide-react';
import { ListingCard } from '@/components/cards/ListingCard';

export default function UserFavoritesPage() {
  const favorites = [
    {
      id: '1',
      name: 'Restaurante Nonna Mia',
      slug: 'restaurante-nonna-mia',
      categoryName: 'Culinária Italiana & Colonial',
      neighborhood: 'Centro',
      priceTier: '$$$',
      ratingAverage: 4.9,
      ratingCount: 1240,
      isOpen: true,
      isFeatured: true,
      initialFavorited: true,
    },
    {
      id: '2',
      name: 'diRoma Acqua Park',
      slug: 'diroma-acqua-park',
      categoryName: 'Parque Aquático Termal',
      neighborhood: 'Solar de Caldas',
      priceTier: '$$$$',
      ratingAverage: 4.8,
      ratingCount: 3500,
      isOpen: true,
      isFeatured: true,
      initialFavorited: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#777777] hover:text-[#171717] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Painel
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight mt-2">
          Lugares Favoritos
        </h1>
        <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
          Lista rápida de estabelecimentos que você marcou com coração para consultar e visitar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((item) => (
          <ListingCard
            key={item.id}
            id={item.id}
            name={item.name}
            slug={item.slug}
            citySlug="caldas-novas"
            neighborhood={item.neighborhood}
            categoryName={item.categoryName}
            priceTier={item.priceTier}
            ratingAverage={item.ratingAverage}
            ratingCount={item.ratingCount}
            isOpen={item.isOpen}
            isFeatured={item.isFeatured}
            initialFavorited={item.initialFavorited}
          />
        ))}
      </div>
    </div>
  );
}

