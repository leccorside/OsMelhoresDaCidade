'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';

export default function UserReviewsPage() {
  const reviews = [
    {
      id: 'rev-1',
      listingName: 'Restaurante Nonna Mia',
      listingSlug: 'restaurante-nonna-mia',
      rating: 5,
      date: 'Há 2 semanas',
      comment:
        'Experiência sensacional! O rodízio colonial de massas e o galeto al primo canto estavam impecáveis. Atendimento acolhedor e ágil.',
      reply: 'Muito obrigado pela preferência e carinho! Esperamos você e sua família novamente em breve na Nonna Mia.',
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
          Minhas Avaliações
        </h1>
        <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
          Todas as opiniões e notas que você compartilhou para guiar a comunidade.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <Link
                  href={`/caldas-novas/lugar/${rev.listingSlug}`}
                  className="font-bold text-base text-[#171717] hover:text-[#FF3B4F] transition"
                >
                  {rev.listingName}
                </Link>
                <span className="text-xs text-[#777777] block sm:inline sm:ml-2">• {rev.date}</span>
              </div>
              <StarRating rating={rev.rating} size="sm" />
            </div>

            <p className="text-xs sm:text-sm text-[#171717] leading-relaxed">
              "{rev.comment}"
            </p>

            {rev.reply && (
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 text-xs text-[#777777] space-y-1">
                <span className="font-bold text-[#171717] block flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#FF3B4F]" />
                  Resposta do Proprietário:
                </span>
                <p className="italic">"{rev.reply}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

