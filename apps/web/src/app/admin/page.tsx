'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  fetchAdminDashboardStats,
  fetchAdminPendingListings,
  updateAdminListingStatus,
  AdminDashboardStats,
} from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, pendingData] = await Promise.all([
        fetchAdminDashboardStats().catch(() => null),
        fetchAdminPendingListings().catch(() => []),
      ]);
      setStats(statsData);
      setPendingListings(pendingData);
    } catch (err) {
      console.error('Erro ao carregar dashboard admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    try {
      setActionLoading(id);
      await updateAdminListingStatus(id, 'PUBLISHED');
      setPendingListings((prev) => prev.filter((item) => item.id !== id));
      if (stats) setStats({ ...stats, pendingListings: Math.max(0, stats.pendingListings - 1) });
      setNotification(`"${name}" foi aprovado e publicado com sucesso!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Falha ao aprovar estabelecimento.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    const reason = prompt(`Motivo da rejeição de "${name}":`, 'Dados incompletos ou fotos inadequadas.');
    if (reason === null) return;

    try {
      setActionLoading(id);
      await updateAdminListingStatus(id, 'REJECTED', reason);
      setPendingListings((prev) => prev.filter((item) => item.id !== id));
      if (stats) setStats({ ...stats, pendingListings: Math.max(0, stats.pendingListings - 1) });
      setNotification(`"${name}" foi rejeitado.`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Falha ao rejeitar estabelecimento.');
    } finally {
      setActionLoading(null);
    }
  };

  const statCards = [
    {
      label: 'Usuários Cadastrados',
      value: stats?.totalUsers?.toLocaleString('pt-BR') ?? '—',
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Comerciantes Credenciados',
      value: stats?.totalMerchants?.toLocaleString('pt-BR') ?? '—',
      icon: Briefcase,
      color: 'text-emerald-400',
    },
    {
      label: 'Estabelecimentos no Banco',
      value: stats?.totalListings?.toLocaleString('pt-BR') ?? '—',
      icon: Store,
      color: 'text-amber-400',
    },
    {
      label: 'Aguardando Moderação',
      value: stats?.pendingListings?.toString() ?? pendingListings.length.toString(),
      icon: Clock,
      color: 'text-red-400',
      highlight: (stats?.pendingListings ?? pendingListings.length) > 0,
    },
    {
      label: 'Eventos na Agenda',
      value: stats?.totalEvents?.toLocaleString('pt-BR') ?? '—',
      icon: Calendar,
      color: 'text-purple-400',
    },
    {
      label: 'Cidades Habilitadas',
      value: `${stats?.activeCities ?? 1} (Caldas Novas)`,
      icon: MapPin,
      color: 'text-teal-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Painel de Controle Master
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Visão holística de todas as cidades, moderação editorial e performance do portal.
          </p>
        </div>

        <Link href="/admin/moderacao">
          <Button variant="primary" size="md" icon={<Clock className="w-4 h-4" />}>
            Abrir Central de Moderação ({pendingListings.length})
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="p-12 text-center bg-black/60 rounded-3xl border border-gray-800 shadow-card flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-[#FF3B4F] animate-spin" />
          <span className="text-xs text-gray-400">Carregando métricas da plataforma...</span>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className={`bg-black/60 rounded-3xl p-5 border shadow-card transition ${
                  s.highlight
                    ? 'border-red-500/40 shadow-red-500/5'
                    : 'border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {s.label}
                  </span>
                  <div className={`p-2 rounded-xl bg-white/5 ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-white">{s.value}</span>
                  {s.highlight && (
                    <Link
                      href="/admin/moderacao"
                      className="text-[11px] font-bold text-red-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Moderar</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fila de Moderação de Estabelecimentos */}
      <div className="bg-black/60 rounded-3xl border border-gray-800 shadow-card overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" />
              Fila Rápida de Moderação
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Anúncios submetidos pelos comerciantes aguardando validação editorial antes da publicação.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-950 text-red-400 border border-red-800/40">
              {pendingListings.length} pendentes
            </span>
            <Link href="/admin/moderacao">
              <Button variant="ghost" size="sm" className="text-gray-300">
                Ver Central Completa
              </Button>
            </Link>
          </div>
        </div>

        {pendingListings.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            <span>Nenhum estabelecimento pendente de moderação no momento. Tudo em dia!</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {pendingListings.map((item) => {
              const owner = item.owners?.[0]?.merchantProfile;
              const userOwner = owner?.user;
              const isWorking = actionLoading === item.id;

              return (
                <div
                  key={item.id}
                  className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{item.name}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-gray-300">
                        {item.category?.name || 'Gastronomia'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-400 mt-1">
                      <span>{item.city?.name || 'Caldas Novas'}</span>
                      <span>•</span>
                      <span>
                        Comerciante:{' '}
                        <strong className="text-gray-300">
                          {owner?.companyName || userOwner?.name || 'Parceiro'}
                        </strong>{' '}
                        {userOwner?.phone && `(${userOwner.phone})`}
                      </span>
                      <span>•</span>
                      <span className="text-amber-400">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => handleReject(item.id, item.name)}
                      disabled={isWorking}
                      className="px-4 py-2 rounded-xl border border-red-800/50 text-red-400 hover:bg-red-950/40 font-semibold text-xs transition"
                    >
                      Rejeitar
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, item.name)}
                      disabled={isWorking}
                      className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs transition shadow-card flex items-center gap-1.5"
                    >
                      {isWorking ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      <span>Aprovar e Publicar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
