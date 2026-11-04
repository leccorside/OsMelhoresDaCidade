'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  MessageCircle,
  Navigation,
  Star,
  Plus,
  Store,
  ExternalLink,
  Edit,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';

export default function MerchantDashboardPage() {
  const { user } = useAuthStore();

  // Dados mockados representativos da conta
  const stats = {
    totalViews: 4890,
    whatsappClicks: 342,
    directionsClicks: 189,
    ratingAverage: '4.9',
    publishedCount: 1,
    pendingCount: 0,
  };

  const myEstablishments = [
    {
      id: '1',
      name: 'Restaurante Nonna Mia',
      slug: 'restaurante-nonna-mia',
      category: 'Restaurantes & Gastronomia',
      city: 'Caldas Novas (GO)',
      status: 'PUBLISHED',
      ratingAverage: 4.9,
      ratingCount: 1240,
      viewsCount: 4890,
      whatsappClicks: 342,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Olá, {user?.name || 'Comerciante'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-1">
            Aqui está o desempenho dos seus estabelecimentos em tempo real.
          </p>
        </div>

        <Link href="/comerciante/estabelecimentos/novo">
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
            Cadastrar Novo Estabelecimento
          </Button>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#777777] uppercase tracking-wider">
              Visualizações
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#171717]">
            {stats.totalViews.toLocaleString('pt-BR')}
          </span>
          <span className="block text-[11px] text-[#10B981] font-semibold mt-1">
            +18% este mês
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#777777] uppercase tracking-wider">
              Cliques WhatsApp
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#171717]">
            {stats.whatsappClicks.toLocaleString('pt-BR')}
          </span>
          <span className="block text-[11px] text-[#10B981] font-semibold mt-1">
            Contatos diretos gerados
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#777777] uppercase tracking-wider">
              Como Chegar
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#171717]">
            {stats.directionsClicks.toLocaleString('pt-BR')}
          </span>
          <span className="block text-[11px] text-[#777777] mt-1">
            Rotas abertas no Maps
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#777777] uppercase tracking-wider">
              Avaliação Média
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#171717]">
            {stats.ratingAverage} <span className="text-sm font-normal text-[#777777]">/ 5.0</span>
          </span>
          <span className="block text-[11px] text-amber-600 font-semibold mt-1">
            Excelente reputação
          </span>
        </div>
      </div>

      {/* Meus Estabelecimentos Section */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-card overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#171717]">Meus Estabelecimentos</h2>
            <p className="text-xs text-[#777777] mt-0.5">
              Gerencie seus anúncios, horários de atendimento, fotos e cardápio.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F5F5] text-[#171717]">
            {myEstablishments.length} ativo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] text-[11px] font-bold text-[#777777] uppercase tracking-wider border-b border-[#E5E7EB]">
                <th className="p-4 pl-6">Estabelecimento</th>
                <th className="p-4">Cidade</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Status</th>
                <th className="p-4">Avaliação</th>
                <th className="p-4 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {myEstablishments.map((est) => (
                <tr key={est.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-4 pl-6">
                    <span className="font-bold text-[#171717] block text-sm">{est.name}</span>
                    <span className="text-[#777777] text-[11px]">{est.viewsCount} visualizações</span>
                  </td>
                  <td className="p-4 text-[#171717] font-medium">{est.city}</td>
                  <td className="p-4 text-[#777777]">{est.category}</td>
                  <td className="p-4">
                    {est.status === 'PUBLISHED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#10B981]/15 text-[#10B981]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        Em Moderação
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-[#F59E0B] font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{est.ratingAverage}</span>
                      <span className="text-[#777777] font-normal">({est.ratingCount})</span>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2">
                    <Link
                      href={`/caldas-novas/lugar/${est.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-[#171717] hover:bg-gray-100 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver</span>
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#171717] text-white hover:bg-black font-semibold"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

