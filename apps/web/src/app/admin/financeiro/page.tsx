'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Crown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  Loader2,
  Calendar,
  Building,
  RefreshCw,
} from 'lucide-react';
import {
  fetchAdminFinancialOverviewApi,
  FinancialOverviewData,
} from '@/lib/api';

export default function AdminFinancialPage() {
  const [data, setData] = useState<FinancialOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetchAdminFinancialOverviewApi();
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Exportar CSV
  const handleExportCSV = () => {
    if (!data || !data.transactions) return;

    const headers = ['ID,Estabelecimento,Empresa,Plano,Valor,Ciclo,Status,Data'];
    const rows = data.transactions.map((t) => [
      t.id,
      `"${t.listing?.name || ''}"`,
      `"${t.merchantProfile?.companyName || ''}"`,
      t.plan,
      t.price,
      t.billingCycle,
      t.status,
      new Date(t.createdAt).toLocaleDateString('pt-BR'),
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = (data?.transactions || []).filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const listingName = item.listing?.name?.toLowerCase() || '';
      const company = item.merchantProfile?.companyName?.toLowerCase() || '';
      const email = item.merchantProfile?.user?.email?.toLowerCase() || '';
      if (!listingName.includes(q) && !company.includes(q) && !email.includes(q)) return false;
    }
    return true;
  });

  const maxTimelineRevenue = Math.max(
    ...(data?.timeline?.map((t) => t.revenue) || [100]),
    100,
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </span>
            Financeiro & Faturamento Master
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Acompanhe as receitas das assinaturas de destaque, faturas e métricas do guia da cidade.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition-colors shadow-sm disabled:opacity-50"
            title="Recarregar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!data || data.transactions.length === 0}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório CSV
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Receita Total Acumulada
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            R${' '}
            {loading
              ? '---'
              : (data?.metrics?.totalRevenue || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
          </div>
          <p className="mt-2 text-xs text-neutral-400">Total liquidado desde o lançamento</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Receita Este Mês
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            R${' '}
            {loading
              ? '---'
              : (data?.metrics?.currentMonthRevenue || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
          </div>
          <p className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Faturamento recorrente ativo
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Assinaturas Ativas
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {loading ? '---' : data?.metrics?.activeSubscriptionsCount || 0}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
            <span>👑 Ouro: {data?.metrics?.planDistribution?.OURO_MASTER || 0}</span>
            <span>•</span>
            <span>⭐ Prata: {data?.metrics?.planDistribution?.PRATA_REGIONAL || 0}</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Cobranças Pendentes
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {loading ? '---' : data?.metrics?.pendingInvoicesCount || 0}
          </div>
          <p className="mt-2 text-xs text-amber-700 font-medium">Aguardando pagamento PIX</p>
        </div>
      </div>

      {/* Gráfico de Faturamento dos Últimos 6 Meses */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Evolução do Faturamento Mensal</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Receita consolidada das assinaturas de destaque nos últimos 6 meses
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Carregando gráfico...
          </div>
        ) : (
          <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2">
            {(data?.timeline || []).map((item, idx) => {
              const heightPct = Math.max(10, Math.round((item.revenue / maxTimelineRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[11px] font-bold text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    R$ {item.revenue.toFixed(0)}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[48px] rounded-t-2xl bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:brightness-110 transition-all shadow-sm"
                  />
                  <span className="text-xs font-semibold text-neutral-500 mt-2">{item.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabela de Transações e Assinaturas */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Todas as Cobranças & Assinaturas</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Registro auditável de planos emitidos e pagamentos no portal
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Busca */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar comércio, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 w-48 sm:w-60"
              />
            </div>

            {/* Filtro Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            >
              <option value="ALL">Todos os status</option>
              <option value="PAID">Pagos / Ativos</option>
              <option value="PENDING">Pendentes</option>
              <option value="EXPIRED">Expirados</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Carregando transações...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-neutral-200 rounded-2xl text-neutral-500 text-sm">
            Nenhuma transação encontrada com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Estabelecimento / Empresa</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Ciclo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Vigência Até</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredTransactions.map((sub) => {
                  const isPaid = sub.status === 'PAID';
                  const isPending = sub.status === 'PENDING';
                  const isOuro = sub.plan === 'OURO_MASTER';
                  const isPrata = sub.plan === 'PRATA_REGIONAL';

                  return (
                    <tr key={sub.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-neutral-900">
                          {sub.listing?.name || 'Sem estabelecimento'}
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          {sub.merchantProfile?.companyName || 'Lojista Parceiro'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isOuro
                              ? 'bg-amber-100 text-amber-800'
                              : isPrata
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-900/10 text-amber-900'
                          }`}
                        >
                          {isOuro && '👑'} {sub.plan.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-neutral-900">
                        R$ {Number(sub.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-neutral-500 capitalize text-xs">
                        {sub.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'}
                      </td>
                      <td className="px-4 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Pago / Ativo
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pendente PIX
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {sub.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-neutral-500">
                        {sub.endDate
                          ? new Date(sub.endDate).toLocaleDateString('pt-BR')
                          : 'Aguardando'}
                      </td>
                      <td className="px-4 py-4 text-xs text-neutral-400 text-right">
                        {new Date(sub.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

