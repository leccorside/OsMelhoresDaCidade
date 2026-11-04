'use client';

import React from 'react';
import Link from 'next/link';
import {
  Heart,
  Calendar,
  Star,
  MapPin,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ListingCard } from '@/components/cards/ListingCard';

export default function UserDashboardPage() {
  const { user } = useAuthStore();

  const mockFavorites = [
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

  const mockSavedEvents = [
    {
      id: 'evt-1',
      name: 'Caldas Country Festival 2025',
      slug: 'caldas-country-festival-2025',
      date: '14 e 15 de Novembro de 2025',
      location: 'Arena Caldas Music',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] text-[#FF3B4F] text-xs font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Perfil Verificado
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Bem-vindo(a), {user?.name || 'Visitante'}!
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-1">
            Sua cidade favorita atual é{' '}
            <strong className="text-[#171717]">Caldas Novas (GO)</strong>.
          </p>
        </div>

        <Link
          href="/caldas-novas/lugares"
          className="px-6 py-3 rounded-full bg-[#FF3B4F] text-white font-bold text-xs hover:bg-[#D91F35] transition shadow-card text-center"
        >
          Explorar Novos Lugares
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/app/favoritos"
          className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-card hover:shadow-hover transition block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#777777] uppercase">Lugares Favoritos</span>
            <div className="w-8 h-8 rounded-full bg-red-50 text-[#FF3B4F] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>
          <span className="text-2xl font-black text-[#171717]">{mockFavorites.length}</span>
          <span className="block text-[11px] text-[#777777] mt-1">Salvos para visitas</span>
        </Link>

        <Link
          href="/app/eventos"
          className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-card hover:shadow-hover transition block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#777777] uppercase">Eventos na Agenda</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-[#171717]">{mockSavedEvents.length}</span>
          <span className="block text-[11px] text-[#777777] mt-1">Shows e festivais</span>
        </Link>

        <Link
          href="/app/avaliacoes"
          className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-card hover:shadow-hover transition block"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#777777] uppercase">Minhas Avaliações</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <span className="text-2xl font-black text-[#171717]">1</span>
          <span className="block text-[11px] text-[#777777] mt-1">Opiniões publicadas</span>
        </Link>
      </div>

      {/* Lugares Favoritos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#171717]">Seus Estabelecimentos Favoritos</h2>
          <Link href="/app/favoritos" className="text-xs font-semibold text-[#FF3B4F] hover:underline">
            Ver todos &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mockFavorites.map((item) => (
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

      {/* Próximos Eventos Salvos */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#171717]">Próximos Eventos Salvos</h2>
          <Link href="/caldas-novas/eventos" className="text-xs text-[#FF3B4F] hover:underline">
            Explorar mais eventos
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {mockSavedEvents.map((evt) => (
            <div key={evt.id} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-[#171717]">{evt.name}</h3>
                <div className="flex items-center gap-3 text-xs text-[#777777] mt-1">
                  <span>{evt.date}</span>
                  <span>•</span>
                  <span>{evt.location}</span>
                </div>
              </div>
              <Link
                href={`/caldas-novas/eventos/${evt.slug}`}
                className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-[#171717] hover:bg-gray-50 transition"
              >
                Ver Detalhes
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

