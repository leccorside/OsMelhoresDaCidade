'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Search,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Store,
  Calendar,
  Users,
  Percent,
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  fetchAdminCoupons,
  updateAdminCouponStatusApi,
} from '@/lib/api';

export default function AdminCouponsPage() {
  const [data, setData] = useState<{
    metrics: { totalCoupons: number; activeCoupons: number; totalClaims: number };
    coupons: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminCoupons({
        status: statusFilter,
        search: searchTerm.trim() || undefined,
      });
      setData(res);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar cupons.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [statusFilter]);

  const handleToggleStatus = async (couponId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await updateAdminCouponStatusApi(couponId, nextStatus);
      setFeedback({
        type: 'success',
        message: `Status do cupom alterado para ${nextStatus === 'ACTIVE' ? 'Ativo' : 'Pausado'}.`,
      });
      await loadCoupons();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao alterar status.' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Topo / Breadcrumb */}
      <div className="pb-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin" className="hover:text-white transition">
              Painel Admin
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300 font-semibold">Moderação de Cupons</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-[#FF3B4F]" />
            Moderação Master de Cupons & Promoções
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Visão consolidada de todas as ofertas promocionais criadas pelos parceiros do guia.
          </p>
        </div>

        <button
          onClick={loadCoupons}
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 self-start sm:self-auto transition"
          title="Recarregar lista"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
              : 'bg-red-950/80 border border-red-800 text-red-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#1C1C1C] border border-gray-800">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Total de Campanhas
          </span>
          <span className="text-3xl font-black text-white mt-1 block">
            {data?.metrics?.totalCoupons || 0}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Cadastradas na plataforma</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1C1C1C] border border-gray-800">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Cupons Ativos
          </span>
          <span className="text-3xl font-black text-emerald-400 mt-1 block">
            {data?.metrics?.activeCoupons || 0}
          </span>
          <span className="text-[11px] text-emerald-500/80 mt-0.5 block">Disponíveis ao público</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1C1C1C] border border-gray-800">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Vouchers Resgatados
          </span>
          <span className="text-3xl font-black text-[#FF3B4F] mt-1 block">
            {data?.metrics?.totalClaims || 0}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Resgates efetuados</span>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="p-4 rounded-2xl bg-[#1C1C1C] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'ACTIVE', label: 'Ativos' },
            { id: 'PAUSED', label: 'Pausados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === tab.id
                  ? 'bg-[#FF3B4F] text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadCoupons();
          }}
          className="relative w-full sm:w-72"
        >
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código ou título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF3B4F]"
          />
        </form>
      </div>

      {/* TABELA DE MODERAÇÃO DE CUPONS */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-7 h-7 animate-spin text-[#FF3B4F]" />
            <span className="text-xs">Carregando promoções...</span>
          </div>
        ) : !data?.coupons || data.coupons.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            Nenhum cupom cadastrado encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                  <th className="p-4">Código / Oferta</th>
                  <th className="p-4">Estabelecimento</th>
                  <th className="p-4 text-center">Desconto</th>
                  <th className="p-4 text-center">Resgates</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Moderação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {data.coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/40 transition">
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-black text-white bg-gray-800 px-2 py-0.5 rounded text-[11px]">
                          {c.code}
                        </span>
                        <span className="font-bold text-gray-200 block mt-1">{c.title}</span>
                        {c.endDate && (
                          <span className="text-[10px] text-gray-500 block">
                            Válido até {new Date(c.endDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-gray-300 block">
                          {c.listing?.name || 'Estabelecimento'}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {c.listing?.city?.name || 'Caldas Novas'}, GO
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-center font-bold text-emerald-400">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% OFF`
                        : c.discountType === 'FIXED_AMOUNT'
                        ? `R$ ${c.discountValue} OFF`
                        : c.discountUnit || 'PROMOÇÃO'}
                    </td>

                    <td className="p-4 text-center font-bold text-white">
                      {c.usedCount || 0}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {c.status === 'ACTIVE' ? 'Ativo' : 'Pausado'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1.5 ${
                          c.status === 'ACTIVE'
                            ? 'bg-amber-950/80 text-amber-300 hover:bg-amber-900 border border-amber-800'
                            : 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                        }`}
                      >
                        {c.status === 'ACTIVE' ? (
                          <>
                            <PauseCircle className="w-3.5 h-3.5" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5" />
                            Ativar
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
