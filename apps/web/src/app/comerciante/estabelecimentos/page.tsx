'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Store,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Clock,
  CheckCircle2,
  Star,
  Eye,
  MessageCircle,
  Navigation,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchMerchantListings } from '@/lib/api';

export default function MerchantListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PUBLISHED' | 'PENDING'>('TODOS');

  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMerchantListings();
        setListings(data);
      } catch (err: any) {
        console.error('Erro ao carregar estabelecimentos:', err);
        setError(err.message || 'Falha ao buscar estabelecimentos do parceiro.');
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch =
        search.trim() === '' ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.shortDescription?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'TODOS' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [listings, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: listings.length,
      published: listings.filter((l) => l.status === 'PUBLISHED').length,
      pending: listings.filter((l) => l.status === 'PENDING').length,
    };
  }, [listings]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/comerciante"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#777777] hover:text-[#171717] transition mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Meus Estabelecimentos
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
            Gerencie as informações comerciais, fotos, cardápios e status de publicação.
          </p>
        </div>

        <Link href="/comerciante/estabelecimentos/novo">
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
            Cadastrar Novo Estabelecimento
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setStatusFilter('TODOS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'TODOS'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-gray-100 text-[#777777] hover:bg-gray-200'
            }`}
          >
            <span>Todos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('PUBLISHED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'PUBLISHED'
                ? 'bg-[#10B981] text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Publicados</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {counts.published}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Em Moderação</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {counts.pending}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F]"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E7EB] shadow-card flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-[#FF3B4F] animate-spin" />
          <span className="text-xs font-semibold text-[#777777]">
            Carregando seus estabelecimentos...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content list */}
      {!loading && (
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-card overflow-hidden">
          {filteredListings.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-[#777777] mb-3">
                <Store className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#171717]">Nenhum estabelecimento encontrado</h3>
              <p className="text-xs text-[#777777] max-w-sm mt-1 mb-5">
                {search || statusFilter !== 'TODOS'
                  ? 'Nenhum resultado corresponde aos filtros selecionados.'
                  : 'Você ainda não cadastrou nenhum estabelecimento.'}
              </p>
              <Link href="/comerciante/estabelecimentos/novo">
                <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
                  Cadastrar Estabelecimento
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] text-[11px] font-bold text-[#777777] uppercase tracking-wider border-b border-[#E5E7EB]">
                    <th className="p-4 pl-6">Estabelecimento</th>
                    <th className="p-4">Localização</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Estatísticas</th>
                    <th className="p-4 text-right pr-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredListings.map((est) => {
                    const citySlug = est.city?.slug || 'caldas-novas';
                    const cityName = est.city?.name || 'Caldas Novas';
                    const categoryName = est.category?.name || 'Gastronomia';
                    const isPublished = est.status === 'PUBLISHED';
                    const coverImg = est.images?.[0]?.url;

                    return (
                      <tr key={est.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            {coverImg ? (
                              <img
                                src={coverImg}
                                alt={est.name}
                                className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                <Building2 className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-[#171717] block text-sm">{est.name}</span>
                              <span className="text-[#777777] text-[11px] block line-clamp-1">
                                {est.shortDescription || 'Sem descrição cadastrada'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[#171717] font-medium block">{cityName}</span>
                          <span className="text-[11px] text-[#777777]">
                            {est.neighborhood?.name || est.street || 'Centro'}
                          </span>
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
                          <div className="space-y-1 text-[11px]">
                            <div className="flex items-center gap-1 text-[#F59E0B] font-bold">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{est.ratingAverage || '5.0'}</span>
                              <span className="text-gray-400 font-normal">({est.ratingCount || 0})</span>
                            </div>
                            <div className="text-gray-500">
                              <span>{(est.viewsCount || 0).toLocaleString('pt-BR')} visualizações</span>
                            </div>
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

