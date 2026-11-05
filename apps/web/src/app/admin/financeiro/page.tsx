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
  Edit3,
  MapPin,
  Save,
  X,
  Layers,
  Send,
  MessageCircle,
} from 'lucide-react';
import {
  fetchAdminFinancialOverviewApi,
  fetchAdminCitySplitsApi,
  updateAdminCitySplitApi,
  fetchExpiringSubscriptionsApi,
  processSubscriptionRenewalsApi,
  FinancialOverviewData,
  CitySplitItem,
  ExpiringSubscriptionItem,
} from '@/lib/api';

export default function AdminFinancialPage() {
  const [data, setData] = useState<FinancialOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Franquias e Splits State
  const [cities, setCities] = useState<CitySplitItem[]>([]);
  const [editingCity, setEditingCity] = useState<CitySplitItem | null>(null);
  const [splitForm, setSplitForm] = useState<Partial<CitySplitItem>>({});
  const [savingSplit, setSavingSplit] = useState(false);
  const [splitFeedback, setSplitFeedback] = useState<string | null>(null);

  // Renovações & Notificações State
  const [expiringSubs, setExpiringSubs] = useState<ExpiringSubscriptionItem[]>([]);
  const [processingRenewals, setProcessingRenewals] = useState(false);
  const [renewalFeedback, setRenewalFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [res, citiesRes, expiringRes] = await Promise.all([
        fetchAdminFinancialOverviewApi(),
        fetchAdminCitySplitsApi().catch(() => []),
        fetchExpiringSubscriptionsApi(7).catch(() => []),
      ]);
      setData(res);
      setCities(citiesRes);
      setExpiringSubs(expiringRes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRenewals = async () => {
    try {
      setProcessingRenewals(true);
      setRenewalFeedback(null);
      const res = await processSubscriptionRenewalsApi();
      setRenewalFeedback(
        `Sucesso: ${res.emailsSent} e-mail(s) enviados e ${res.notificationsCreated} notificação(ões) registradas.`
      );
      // Recarrega lista atualizada
      const updated = await fetchExpiringSubscriptionsApi(7);
      setExpiringSubs(updated);
    } catch (err: any) {
      setRenewalFeedback(`Erro: ${err.message || 'Falha ao processar notificações.'}`);
    } finally {
      setProcessingRenewals(false);
    }
  };

  const handleOpenEditCity = (city: CitySplitItem) => {
    setEditingCity(city);
    setSplitForm({
      franchiseName: city.franchiseName || '',
      franchiseCnpj: city.franchiseCnpj || '',
      franchisePixKey: city.franchisePixKey || '',
      franchisePixType: city.franchisePixType || 'CNPJ',
      franchiseWalletId: city.franchiseWalletId || '',
      platformFeePercent: Number(city.platformFeePercent || 20),
      franchiseFeePercent: Number(city.franchiseFeePercent || 80),
      splitEnabled: city.splitEnabled ?? false,
    });
  };

  const handleSaveCitySplit = async () => {
    if (!editingCity) return;
    try {
      setSavingSplit(true);
      const updated = await updateAdminCitySplitApi(editingCity.id, splitForm);
      setCities((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
      setSplitFeedback(`Configurações de ${editingCity.name} atualizadas com sucesso!`);
      setEditingCity(null);
      setTimeout(() => setSplitFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações de split.');
    } finally {
      setSavingSplit(false);
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

      {/* Notificações & Lembretes de Vencimento de Assinatura (WhatsApp & E-mail) */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
              Retenção & Cobrança Ativa
            </div>
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Lembretes de Renovação & Vencimentos (WhatsApp & E-mail)
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Monitore estabelecimentos VIP prestes a vencer e dispare lembretes automáticos ou acione diretamente pelo WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleProcessRenewals}
              disabled={processingRenewals || expiringSubs.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-200 text-white font-bold text-xs shadow-sm transition-all"
            >
              {processingRenewals ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Disparar Avisos em Lote
                </>
              )}
            </button>
          </div>
        </div>

        {renewalFeedback && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            renewalFeedback.startsWith('Sucesso')
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            {renewalFeedback}
          </div>
        )}

        {expiringSubs.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-neutral-700">Tudo em dia!</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Nenhuma assinatura VIP com vencimento previsto para os próximos 7 dias.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Estabelecimento / Cidade</th>
                  <th className="px-4 py-3">Plano & Valor</th>
                  <th className="px-4 py-3">Vencimento</th>
                  <th className="px-4 py-3">Contato do Lojista</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {expiringSubs.map((item) => {
                  const isExpired = item.daysRemaining <= 0;
                  const isUrgent = item.daysRemaining <= 3;

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-bold text-neutral-900">{item.listingName}</div>
                        <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {item.cityName}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-neutral-800">{item.planName}</div>
                        <div className="text-xs text-neutral-500">
                          R$ {item.price.toFixed(2)} ({item.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'})
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isExpired
                              ? 'bg-rose-100 text-rose-800'
                              : isUrgent
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {item.statusDescription}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        <div className="font-bold text-neutral-800">{item.merchantName}</div>
                        <div className="text-neutral-500">{item.merchantEmail || 'Sem e-mail'}</div>
                        <div className="text-neutral-400 font-mono">{item.merchantPhone || 'Sem telefone'}</div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {item.whatsAppLink ? (
                          <a
                            href={item.whatsAppLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        ) : (
                          <span className="text-xs text-neutral-400 italic">Sem WhatsApp</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Franquias Regionais & Divisão de Receitas por Cidade (Split PIX / Asaas) */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2 border border-sky-200">
              <Layers className="w-3.5 h-3.5" />
              Gestão Multirregional & Franquias
            </div>
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600" />
              Franquias & Divisão de Receitas por Cidade (Split)
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Configure chaves PIX, wallet do Asaas e regras de repasse automático para os parceiros gestores locais.
            </p>
          </div>

          {splitFeedback && (
            <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {splitFeedback}
            </div>
          )}
        </div>

        {cities.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-2xl">
            <Building className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">Nenhuma cidade cadastrada no portal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Cidade / Estado</th>
                  <th className="px-4 py-3">Split Status</th>
                  <th className="px-4 py-3">Franquia Gestora</th>
                  <th className="px-4 py-3">Chave PIX Local</th>
                  <th className="px-4 py-3">Divisão de Receita</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {cities.map((city) => (
                  <tr key={city.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-neutral-900">
                      {city.name} - {city.state?.uf || 'BA'}
                      <span className="block text-xs font-normal text-neutral-400">
                        {city._count?.listings || 0} estabelecimentos
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {city.splitEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Split Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
                          100% Matriz
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-neutral-800 text-xs">
                      {city.franchiseName ? (
                        <div>
                          <p className="font-bold text-neutral-900">{city.franchiseName}</p>
                          <p className="text-neutral-400 font-mono text-[11px]">{city.franchiseCnpj || 'Sem CNPJ'}</p>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Administrado pela Matriz</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-neutral-600 font-mono text-xs">
                      {city.franchisePixKey ? (
                        <span>{city.franchisePixKey}</span>
                      ) : (
                        <span className="text-neutral-400 font-sans italic">Não configurada</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <span className="font-bold text-emerald-700 font-mono">
                        {city.franchiseFeePercent}% Local
                      </span>
                      <span className="text-neutral-400 mx-1">•</span>
                      <span className="font-bold text-neutral-700 font-mono">
                        {city.platformFeePercent}% Matriz
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleOpenEditCity(city)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
                        Configurar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIGURAÇÃO DE SPLIT DA CIDADE */}
      {editingCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingCity(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Configurar Franquia & Split
                </h3>
                <p className="text-xs text-neutral-500">
                  {editingCity.name} - {editingCity.state?.uf || 'BA'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Nome do Franqueado / Parceiro Regional:
                </label>
                <input
                  type="text"
                  value={splitForm.franchiseName || ''}
                  onChange={(e) => setSplitForm({ ...splitForm, franchiseName: e.target.value })}
                  placeholder="Ex: Franquia Regional Barreiras"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  CNPJ ou CPF do Franqueado:
                </label>
                <input
                  type="text"
                  value={splitForm.franchiseCnpj || ''}
                  onChange={(e) => setSplitForm({ ...splitForm, franchiseCnpj: e.target.value })}
                  placeholder="Ex: 00.000.000/0001-00"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Tipo de Chave PIX:
                  </label>
                  <select
                    value={splitForm.franchisePixType || 'CNPJ'}
                    onChange={(e) => setSplitForm({ ...splitForm, franchisePixType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="CNPJ">CNPJ</option>
                    <option value="CPF">CPF</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="PHONE">Telefone</option>
                    <option value="RANDOM">Chave Aleatória</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Chave PIX:
                  </label>
                  <input
                    type="text"
                    value={splitForm.franchisePixKey || ''}
                    onChange={(e) => setSplitForm({ ...splitForm, franchisePixKey: e.target.value })}
                    placeholder="Chave PIX para repasse"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Asaas Wallet ID (para Split Automático via API):
                </label>
                <input
                  type="text"
                  value={splitForm.franchiseWalletId || ''}
                  onChange={(e) => setSplitForm({ ...splitForm, franchiseWalletId: e.target.value })}
                  placeholder="Ex: c1a8e9d0-234b-4f5a-90ef..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    % Franqueado Local:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={splitForm.franchiseFeePercent ?? 80}
                    onChange={(e) => {
                      const f = Number(e.target.value);
                      setSplitForm({
                        ...splitForm,
                        franchiseFeePercent: f,
                        platformFeePercent: Math.max(0, 100 - f),
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-sm font-bold text-emerald-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    % Matriz Portal:
                  </label>
                  <input
                    type="number"
                    disabled
                    value={splitForm.platformFeePercent ?? 20}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-100 text-sm font-bold text-neutral-700 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="splitEnabledCheck"
                  checked={splitForm.splitEnabled || false}
                  onChange={(e) => setSplitForm({ ...splitForm, splitEnabled: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-neutral-300 focus:ring-sky-500"
                />
                <label htmlFor="splitEnabledCheck" className="text-xs font-bold text-neutral-800 cursor-pointer">
                  Habilitar Split Automático de Assinaturas para esta Cidade
                </label>
              </div>

              <button
                type="button"
                onClick={handleSaveCitySplit}
                disabled={savingSplit}
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
              >
                {savingSplit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando alterações...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Configurações da Cidade
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

