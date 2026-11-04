'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MOCK_PLACES_DETAILS } from '@/data/mockPlaceDetails';

export default function AdminEstabelecimentosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Transforma os mock places em array para visualização no admin
  const [placesList, setPlacesList] = useState(
    Object.values(MOCK_PLACES_DETAILS).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      categoryType: p.placeType,
      city: `${p.city} (${p.uf})`,
      neighborhood: p.neighborhood,
      priceTier: p.priceTier,
      rating: p.ratingAverage,
      reviewsCount: p.ratingCount,
      status: p.isOpen ? 'ATIVO' : 'PENDENTE',
      isFeatured: p.isFeatured,
      image: p.gallery[0]?.url || '',
    }))
  );

  const filteredPlaces = placesList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'todos' || p.categoryType === categoryFilter;

    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativos' && p.status === 'ATIVO') ||
      (statusFilter === 'pendentes' && p.status === 'PENDENTE') ||
      (statusFilter === 'destaques' && p.isFeatured);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o anúncio "${name}"?`)) {
      setPlacesList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setPlacesList((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'ATIVO' ? 'PENDENTE' : 'ATIVO' }
          : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Store className="w-7 h-7 text-[#FF3B4F]" />
            Gerenciamento de Estabelecimentos
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Cadastre, edite e gerencie anúncios de todas as categorias adaptadas (Parques, Hotéis, Restaurantes e Serviços).
          </p>
        </div>

        <Link
          href="/admin/estabelecimentos/novo"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF3B4F] hover:bg-[#E02639] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Estabelecimento</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-black/60 rounded-3xl p-5 border border-gray-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, bairro ou palavra-chave..."
              className="w-full bg-white/5 border border-gray-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF3B4F]"
            />
          </div>

          {/* Filtro de Categoria */}
          <div className="w-full md:w-64">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-gray-800 rounded-2xl px-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-[#FF3B4F] cursor-pointer"
            >
              <option value="todos">Todas as Categorias</option>
              <option value="attraction">🌊 Parques Aquáticos & Atrações</option>
              <option value="accommodation">🏨 Hotéis, Pousadas & Resorts</option>
              <option value="restaurant">🍽️ Restaurantes, Bares & Gastronomia</option>
              <option value="general">🛍️ Comércio & Serviços Gerais</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-800/80 text-xs">
          {[
            { id: 'todos', label: `Todos (${placesList.length})` },
            { id: 'ativos', label: `Ativos (${placesList.filter((p) => p.status === 'ATIVO').length})` },
            { id: 'pendentes', label: `Pendentes (${placesList.filter((p) => p.status === 'PENDENTE').length})` },
            { id: 'destaques', label: `Destaques Ouro (${placesList.filter((p) => p.isFeatured).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-white text-black'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Estabelecimentos Table */}
      <div className="bg-black/60 rounded-3xl border border-gray-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-800">
              <tr>
                <th className="py-4 px-6">Estabelecimento</th>
                <th className="py-4 px-4">Categoria / Tipo</th>
                <th className="py-4 px-4">Localização</th>
                <th className="py-4 px-4">Preço / Nota</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    Nenhum estabelecimento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredPlaces.map((place) => (
                  <tr key={place.id} className="hover:bg-white/[0.02] transition">
                    {/* Imagem + Nome */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 shrink-0 relative">
                          <img
                            src={place.image}
                            alt={place.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{place.name}</span>
                            {place.isFeatured && (
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-gray-500 text-[11px] font-mono">
                            /caldas-novas/lugar/{place.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-gray-200 font-medium">
                        {place.categoryType === 'attraction' && '🌊 Parque / Termas'}
                        {place.categoryType === 'accommodation' && '🏨 Hotel / Pousada'}
                        {place.categoryType === 'restaurant' && '🍽️ Restaurante'}
                        {place.categoryType === 'general' && '🛍️ Comércio'}
                      </span>
                    </td>

                    {/* Localização */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin className="w-3.5 h-3.5 text-[#FF3B4F] shrink-0" />
                        <span>{place.neighborhood}, {place.city}</span>
                      </div>
                    </td>

                    {/* Preço e Nota */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#FF3B4F]">{place.priceTier}</span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{place.rating.toFixed(1)}</span>
                          <span className="text-gray-500 font-normal text-[10px]">
                            ({place.reviewsCount})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(place.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          place.status === 'ATIVO'
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                        }`}
                      >
                        {place.status === 'ATIVO' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{place.status}</span>
                      </button>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/caldas-novas/lugar/${place.slug}`}
                          target="_blank"
                          title="Ver anúncio público ao vivo"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/admin/estabelecimentos/novo?edit=${place.slug}`}
                          title="Editar informações adaptadas"
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(place.id, place.name)}
                          title="Remover anúncio"
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

