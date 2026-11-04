'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MessageCircle,
  MapPin,
  Ticket,
  Star,
  Phone,
  Store,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Loader2,
  RefreshCw,
  ExternalLink,
  Award,
} from 'lucide-react';
import {
  fetchMerchantStats,
  MerchantStats,
  MerchantTimelinePoint,
} from '@/lib/api';

export default function MerchantStatsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeMetric, setActiveMetric] = useState<'views' | 'whatsapp' | 'directions' | 'vouchers'>('views');
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<MerchantTimelinePoint | null>(null);

  const loadStats = async (p = period) => {
    try {
      setLoading(true);
      const data = await fetchMerchantStats(p);
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats(period);
  }, [period]);

  const metrics = stats?.metrics || {
    totalListings: stats?.totalListings || 0,
    totalViews: stats?.totalViews || 0,
    totalWhatsappClicks: stats?.totalWhatsappClicks || 0,
    totalDirectionsClicks: stats?.totalDirectionsClicks || 0,
    totalPhoneClicks: stats?.totalPhoneClicks || 0,
    totalVouchersRedeemed: 0,
    overallRating: stats?.overallRating || '5.0',
    totalRatingReviews: 0,
    publishedListings: stats?.publishedListings || 0,
    pendingListings: stats?.pendingListings || 0,
  };

  const timeline = stats?.timeline || [];
  const listings = stats?.listings || [];

  // Cálculos do gráfico SVG
  const values = timeline.map((p) => p[activeMetric]);
  const maxValue = Math.max(...values, 5);

  const getMetricName = (key: string) => {
    switch (key) {
      case 'views':
        return 'Visualizações do Anúncio';
      case 'whatsapp':
        return 'Cliques no WhatsApp';
      case 'directions':
        return 'Rotas & Direções (Mapa)';
      case 'vouchers':
        return 'Vouchers Resgatados';
      default:
        return 'Métrica';
    }
  };

  const getMetricColor = (key: string) => {
    switch (key) {
      case 'views':
        return '#3B82F6'; // Blue
      case 'whatsapp':
        return '#10B981'; // Emerald
      case 'directions':
        return '#F59E0B'; // Amber
      case 'vouchers':
        return '#FF3B4F'; // Red
      default:
        return '#FF3B4F';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Topo / Cabeçalho */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link href="/comerciante" className="hover:text-gray-900 transition">
            Painel do Parceiro
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-semibold">Estatísticas & Desempenho</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-[#FF3B4F]" />
              Estatísticas & Relatórios de Desempenho
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Monitore visualizações, taxa de interesse de clientes, cliques no WhatsApp e resgate de promoções.
            </p>
          </div>

          {/* Seletor de Período */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-gray-200 shadow-xs self-start sm:self-auto">
            {[
              { id: '7d', label: '7 Dias' },
              { id: '30d', label: '30 Dias' },
              { id: '90d', label: '90 Dias' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  period === tab.id
                    ? 'bg-[#1C1B1B] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && !stats ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF3B4F]" />
          <span className="text-xs sm:text-sm font-semibold">Carregando métricas e histórico...</span>
        </div>
      ) : (
        <>
          {/* 4 CARDS HERO DE MÉTRICAS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Visualizações */}
            <div
              onClick={() => setActiveMetric('views')}
              className={`p-5 rounded-3xl border-2 transition cursor-pointer shadow-xs ${
                activeMetric === 'views'
                  ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Visualizações
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-black text-gray-900 mt-2 block">
                {metrics.totalViews.toLocaleString('pt-BR')}
              </span>
              <span className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Alcance no portal do guia
              </span>
            </div>

            {/* Cliques no WhatsApp */}
            <div
              onClick={() => setActiveMetric('whatsapp')}
              className={`p-5 rounded-3xl border-2 transition cursor-pointer shadow-xs ${
                activeMetric === 'whatsapp'
                  ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Leads WhatsApp
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-black text-gray-900 mt-2 block">
                {metrics.totalWhatsappClicks.toLocaleString('pt-BR')}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                Conversas iniciadas
              </span>
            </div>

            {/* Trajetos & Direções */}
            <div
              onClick={() => setActiveMetric('directions')}
              className={`p-5 rounded-3xl border-2 transition cursor-pointer shadow-xs ${
                activeMetric === 'directions'
                  ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-white border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Rotas & Direções
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-black text-gray-900 mt-2 block">
                {metrics.totalDirectionsClicks.toLocaleString('pt-BR')}
              </span>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                <Store className="w-3 h-3" />
                Visitas presenciais
              </span>
            </div>

            {/* Vouchers & Cupons Resgatados */}
            <div
              onClick={() => setActiveMetric('vouchers')}
              className={`p-5 rounded-3xl border-2 transition cursor-pointer shadow-xs ${
                activeMetric === 'vouchers'
                  ? 'bg-red-50/70 border-[#FF3B4F] ring-2 ring-[#FF3B4F]/20'
                  : 'bg-white border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Vouchers Resgatados
                </span>
                <div className="w-10 h-10 rounded-xl bg-red-100 text-[#FF3B4F] flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
              </div>
              <span className="text-3xl font-black text-gray-900 mt-2 block">
                {metrics.totalVouchersRedeemed.toLocaleString('pt-BR')}
              </span>
              <span className="text-[11px] text-red-700 font-semibold mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Engajamento de ofertas
              </span>
            </div>
          </section>

          {/* GRÁFICO INTERATIVO DE DESEMPENHO NO TEMPO */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  EVOLUÇÃO DIÁRIA
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5 flex items-center gap-2">
                  <span>{getMetricName(activeMetric)}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
                    {period === '7d' ? 'Últimos 7 dias' : period === '90d' ? 'Últimos 90 dias' : 'Últimos 30 dias'}
                  </span>
                </h3>
              </div>

              {/* Botões alternadores da métrica do gráfico */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'views', label: 'Views' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'directions', label: 'Rotas' },
                  { id: 'vouchers', label: 'Vouchers' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMetric(item.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeMetric === item.id
                        ? 'bg-[#1C1B1B] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gráfico SVG Responsivo */}
            <div className="relative pt-6">
              {hoveredPoint && (
                <div className="absolute top-0 right-4 bg-[#1C1B1B] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg animate-in fade-in">
                  <span>
                    {hoveredPoint.label}: {hoveredPoint[activeMetric]} {activeMetric}
                  </span>
                </div>
              )}

              <div className="h-64 w-full flex items-end gap-1 sm:gap-2 pt-8 pb-4 border-b border-gray-100">
                {timeline.map((point, idx) => {
                  const val = point[activeMetric];
                  const heightPercent = maxValue > 0 ? Math.max(8, (val / maxValue) * 100) : 8;
                  const isHovered = hoveredPoint?.date === point.date;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                    >
                      {/* Barra */}
                      <div
                        className="w-full rounded-t-lg transition-all duration-200"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: isHovered
                            ? '#1C1B1B'
                            : getMetricColor(activeMetric),
                          opacity: isHovered ? 1 : 0.85,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Rótulos de datas no eixo X */}
              <div className="flex justify-between pt-2 text-[10px] sm:text-xs font-semibold text-gray-400">
                <span>{timeline[0]?.label || ''}</span>
                <span>{timeline[Math.floor(timeline.length / 2)]?.label || ''}</span>
                <span>{timeline[timeline.length - 1]?.label || ''}</span>
              </div>
            </div>
          </section>

          {/* DESEMPENHO POR ESTABELECIMENTO */}
          {listings.length > 0 && (
            <section className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#FF3B4F]" />
                    Desempenho por Estabelecimento ({listings.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Compare os resultados individuais dos seus estabelecimentos cadastrados.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase font-extrabold tracking-wider">
                      <th className="pb-3">Estabelecimento</th>
                      <th className="pb-3 text-center">Visualizações</th>
                      <th className="pb-3 text-center">WhatsApp</th>
                      <th className="pb-3 text-center">Rotas</th>
                      <th className="pb-3 text-center">Vouchers</th>
                      <th className="pb-3 text-center">Nota Média</th>
                      <th className="pb-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listings.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                              {item.coverUrl ? (
                                <img
                                  src={item.coverUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Store className="w-5 h-5 m-2.5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{item.name}</span>
                              <span className="text-[11px] text-gray-400">/{item.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center font-bold text-gray-800">
                          {item.views.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-4 text-center font-bold text-emerald-600">
                          {item.whatsapp.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-4 text-center font-bold text-amber-600">
                          {item.directions.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-4 text-center font-bold text-[#FF3B4F]">
                          {item.vouchersCount}
                        </td>
                        <td className="py-4 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-gray-800">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{item.rating.toFixed(1)}</span>
                            <span className="text-gray-400 text-[10px]">({item.reviewsCount})</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <Link
                            href={`/caldas-novas/lugar/${item.slug}`}
                            target="_blank"
                            className="text-xs font-bold text-[#FF3B4F] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Ver Página</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* DICAS EDITORIAL PARA AUMENTAR CONVERSÃO */}
          <section className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 border border-orange-200/80 p-6 rounded-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF3B4F]" />
              <h3 className="text-sm font-extrabold text-gray-900">
                Dicas dos Especialistas para Multiplicar seus Resultados
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700">
              <div className="bg-white p-4 rounded-2xl border border-orange-200/60 shadow-xs space-y-1">
                <span className="font-bold text-gray-900 block">1. Fotos Atraentes</span>
                <p className="text-gray-600">
                  Estabelecimentos com pelo menos 5 fotos em alta resolução no mosaico recebem até 3.2x mais cliques no WhatsApp.
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-orange-200/60 shadow-xs space-y-1">
                <span className="font-bold text-gray-900 block">2. Cupons com Prazo</span>
                <p className="text-gray-600">
                  Promoções com data de término definida geram sensação de urgência e aceleram as decisões de compra.
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-orange-200/60 shadow-xs space-y-1">
                <span className="font-bold text-gray-900 block">3. Responda Avaliações</span>
                <p className="text-gray-600">
                  Estabelecimentos que respondem a todas as avaliações transmitem 87% mais confiabilidade para novos clientes.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
