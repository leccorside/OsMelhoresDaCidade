'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Store,
  Calendar,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const [pendingListings, setPendingListings] = useState([
    {
      id: 'p-1',
      name: 'Choperia Boulevard Caldas',
      slug: 'choperia-boulevard-caldas',
      category: 'Bares & Chopperias',
      city: 'Caldas Novas (GO)',
      merchantName: 'Carlos Mendonça',
      merchantPhone: '(64) 99888-7777',
      createdAt: 'Hoje às 10:24',
    },
    {
      id: 'p-2',
      name: 'Pizzaria Forno a Lenha Bella Napoli',
      slug: 'pizzaria-bella-napoli',
      category: 'Restaurantes & Pizzarias',
      city: 'Caldas Novas (GO)',
      merchantName: 'Fernanda Oliveira',
      merchantPhone: '(64) 99111-2222',
      createdAt: 'Ontem às 18:40',
    },
  ]);

  const handleApprove = (id: string) => {
    setPendingListings((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReject = (id: string) => {
    setPendingListings((prev) => prev.filter((item) => item.id !== id));
  };

  const stats = [
    { label: 'Usuários Registrados', value: '1.420', icon: Users, color: 'text-blue-400' },
    { label: 'Comerciantes Credenciados', value: '86', icon: Briefcase, color: 'text-emerald-400' },
    { label: 'Estabelecimentos Ativos', value: '428', icon: Store, color: 'text-amber-400' },
    { label: 'Aguardando Moderação', value: pendingListings.length, icon: Clock, color: 'text-red-400' },
    { label: 'Eventos Cadastrados', value: '24', icon: Calendar, color: 'text-purple-400' },
    { label: 'Cidades Habilitadas', value: '1 (Caldas Novas)', icon: MapPin, color: 'text-teal-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Painel de Controle Master
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Visão holística de todas as cidades, moderação de comércios e performance do portal.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-black/60 rounded-3xl p-5 border border-gray-800 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {s.label}
                </span>
                <div className={`p-2 rounded-xl bg-white/5 ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-white">{s.value}</span>
            </div>
          );
        })}
      </div>

      {/* Fila de Moderação de Estabelecimentos */}
      <div className="bg-black/60 rounded-3xl border border-gray-800 shadow-card overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              Fila de Moderação de Estabelecimentos
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Anúncios submetidos pelos comerciantes para validação de dados e fotos antes da publicação.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800/40">
            {pendingListings.length} pendentes
          </span>
        </div>

        {pendingListings.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            Nenhum estabelecimento pendente de moderação no momento.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {pendingListings.map((item) => (
              <div key={item.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                <div>
                  <h3 className="font-bold text-base text-white">{item.name}</h3>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-400 mt-1">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.city}</span>
                    <span>•</span>
                    <span>Responsável: <strong className="text-gray-300">{item.merchantName}</strong> ({item.merchantPhone})</span>
                    <span>•</span>
                    <span className="text-amber-400">{item.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-4 py-2 rounded-xl border border-red-800/50 text-red-400 hover:bg-red-950/40 font-semibold text-xs transition"
                  >
                    Rejeitar
                  </button>
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs transition shadow-card flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Aprovar e Publicar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

