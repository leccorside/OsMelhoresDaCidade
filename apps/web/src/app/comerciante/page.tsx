'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { fetchMerchantStats, fetchMerchantListings, MerchantStats } from '@/lib/api';

export default function MerchantDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [statsData, listingsData] = await Promise.all([
          fetchMerchantStats().catch(() => null),
          fetchMerchantListings().catch(() => []),
        ]);

        if (statsData) {
          setStats(statsData);
        } else {
          // Fallback caso seja nova conta sem dados ainda
          setStats({
            totalListings: listingsData.length,
            totalViews: listingsData.reduce((acc: number, l: any) => acc + (l.viewsCount || 0), 0),
            totalWhatsappClicks: listingsData.reduce((acc: number, l: any) => acc + (l.whatsappClicks || 0), 0),
            totalDirectionsClicks: listingsData.reduce((acc: number, l: any) => acc + (l.directionsClicks || 0), 0),
            totalPhoneClicks: listingsData.reduce((acc: number, l: any) => acc + (l.phoneClicks || 0), 0),
            overallRating: '5.0',
            publishedListings: listingsData.filter((l: any) => l.status === 'PUBLISHED').length,
            pendingListings: listingsData.filter((l: any) => l.status === 'PENDING').length,
          });
        }
        setListings(listingsData);
      } catch (err: any) {
        console.error('Erro ao carregar dados do comerciante:', err);
        setError(err.message || 'Falha ao conectar aos serviços do parceiro.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              Olá, {user?.name || 'Comerciante'} 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF3B4F]/10 text-[#FF3B4F]">
              Parceiro Oficial
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#777777] mt-1">
            Acompanhe o desempenho, cliques e interações dos seus estabelecimentos em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/comerciante/estabelecimentos/novo">
            <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
              Cadastrar Novo Estabelecimento
            </Button>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E7EB] shadow-card flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-[#FF3B4F] animate-spin" />
          <span className="text-xs font-semibold text-[#777777]">
            Carregando estatísticas e estabelecimentos do seu perfil...
          </span>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Não foi possível atualizar as métricas automaticamente ({error}). Exibindo dados locais.</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-2.5 py-1 rounded-lg bg-amber-200/60 font-bold hover:bg-amber-300 text-amber-900"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      {!loading && stats && (
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
              Alcance no guia da cidade
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
              {stats.totalWhatsappClicks.toLocaleString('pt-BR')}
            </span>
            <span className="block text-[11px] text-[#10B981] font-semibold mt-1">
              Conversões diretas
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#777777] uppercase tracking-wider">
                Rotas no Mapa
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#171717]">
              {stats.totalDirectionsClicks.toLocaleString('pt-BR')}
            </span>
            <span className="block text-[11px] text-[#777777] mt-1">
              Rotas abertas no Google Maps
            </span>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#E5E7EB] shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#777777] uppercase tracking-wider">
                Avaliação Geral
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-[#171717]">
              {stats.overallRating} <span className="text-sm font-normal text-[#777777]">/ 5.0</span>
            </span>
            <span className="block text-[11px] text-amber-600 font-semibold mt-1">
              {stats.publishedListings} no ar • {stats.pendingListings} em análise
            </span>
          </div>
        </div>
      )}

      {/* Meus Estabelecimentos Section */}
      {!loading && (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-card overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#171717]">Meus Estabelecimentos</h2>
              <p className="text-xs text-[#777777] mt-0.5">
                Gerencie seus anúncios, comodidades, contatos e acompanhe a moderação editorial.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F5F5F5] text-[#171717]">
                {listings.length} {listings.length === 1 ? 'estabelecimento' : 'estabelecimentos'}
              </span>
              <Link href="/comerciante/estabelecimentos">
                <Button variant="outline" size="sm">
                  Ver Todos
                </Button>
              </Link>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-[#777777] mb-3">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#171717]">Nenhum estabelecimento cadastrado ainda</h3>
              <p className="text-xs text-[#777777] max-w-sm mt-1 mb-5">
                Cadastre o seu primeiro negócio para começar a receber visitantes qualificados e mensagens no WhatsApp.
              </p>
              <Link href="/comerciante/estabelecimentos/novo">
                <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
                  Cadastrar Meu Primeiro Estabelecimento
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-[11px] font-bold text-[#777777] uppercase tracking-wider border-b border-[#E5E7EB]">
                    <th className="p-4 pl-6">Estabelecimento</th>
                    <th className="p-4">Cidade / Bairro</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Avaliação</th>
                    <th className="p-4 text-right pr-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {listings.map((est) => {
                    const citySlug = est.city?.slug || 'caldas-novas';
                    const cityName = est.city?.name || 'Caldas Novas';
                    const categoryName = est.category?.name || 'Gastronomia';
                    const isPublished = est.status === 'PUBLISHED';

                    return (
                      <tr key={est.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-4 pl-6">
                          <span className="font-bold text-[#171717] block text-sm">{est.name}</span>
                          <span className="text-[#777777] text-[11px]">
                            {(est.viewsCount || 0).toLocaleString('pt-BR')} visualizações • {est.whatsappClicks || 0} cliques WhatsApp
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-[#171717] font-medium block">{cityName}</span>
                          <span className="text-[11px] text-[#777777]">{est.neighborhood?.name || est.street || 'Centro'}</span>
                        </td>
                        <td className="p-4 text-[#777777] font-medium">{categoryName}</td>
                        <td className="p-4">
                          {isPublished ? (
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
                            <span>{est.ratingAverage || '5.0'}</span>
                            <span className="text-[#777777] font-normal">({est.ratingCount || est._count?.reviews || 0})</span>
                          </div>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          {isPublished && (
                            <Link
                              href={`/${citySlug}/lugar/${est.slug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-[#171717] hover:bg-gray-100 font-semibold"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Ver</span>
                            </Link>
                          )}
                          <Link
                            href={`/comerciante/estabelecimentos/novo?edit=${est.slug}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#171717] text-white hover:bg-black font-semibold"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
