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
  FileSpreadsheet,
  Radio,
  Trash2,
  Play,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  fetchAdminFinancialOverviewApi,
  fetchExpiringSubscriptionsApi,
  processSubscriptionRenewalsApi,
  sendInvoiceWhatsAppApi,
  FinancialOverviewData,
  ExpiringSubscriptionItem,
  fetchAdminWebhooksApi,
  createAdminWebhookApi,
  deleteAdminWebhookApi,
  testAdminWebhookApi,
  WebhookEndpointItem,
} from '@/lib/api';

export default function AdminFinancialPage() {
  const [data, setData] = useState<FinancialOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expiringSubs, setExpiringSubs] = useState<ExpiringSubscriptionItem[]>([]);
  const [processingRenewals, setProcessingRenewals] = useState(false);
  const [renewalFeedback, setRenewalFeedback] = useState<string | null>(null);
  const [sendingInvoiceWhatsAppId, setSendingInvoiceWhatsAppId] = useState<string | null>(null);
  const [sentInvoiceWhatsAppMap, setSentInvoiceWhatsAppMap] = useState<Record<string, string>>({});

  // Webhooks State
  const [webhooks, setWebhooks] = useState<WebhookEndpointItem[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookDesc, setWebhookDesc] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['SUBSCRIPTION_PAID']);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; status?: number; error?: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [res, expiringRes, whList] = await Promise.all([
        fetchAdminFinancialOverviewApi(),
        fetchExpiringSubscriptionsApi(7).catch(() => []),
        fetchAdminWebhooksApi().catch(() => []),
      ]);
      setData(res);
      setExpiringSubs(expiringRes);
      setWebhooks(whList);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar dados financeiros.');
    } finally {
      setLoading(false);
    }
  };

  


  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || webhookEvents.length === 0) return;
    try {
      setSavingWebhook(true);
      const created = await createAdminWebhookApi({
        url: webhookUrl.trim(),
        description: webhookDesc.trim() || undefined,
        events: webhookEvents,
      });
      setWebhooks([created, ...webhooks]);
      setWebhookUrl('');
      setWebhookDesc('');
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar webhook.');
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Deseja realmente remover este webhook de integração externa?')) return;
    try {
      await deleteAdminWebhookApi(id);
      setWebhooks(webhooks.filter((w) => w.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir webhook.');
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      setTestingWebhookId(id);
      setTestResult(null);
      const res = await testAdminWebhookApi(id);
      setTestResult({ id, success: res.success, status: res.status, error: res.error });
      setTimeout(() => setTestResult(null), 6000);
    } catch (err: any) {
      setTestResult({ id, success: false, error: err.message });
      setTimeout(() => setTestResult(null), 6000);
    } finally {
      setTestingWebhookId(null);
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

  const handleSendWhatsAppInvoice = async (subscriptionId: string, phone?: string) => {
    try {
      setSendingInvoiceWhatsAppId(subscriptionId);
      const res = await sendInvoiceWhatsAppApi(subscriptionId, phone);
      setSentInvoiceWhatsAppMap((prev) => ({
        ...prev,
        [subscriptionId]: `Fatura enviada com sucesso para +${res.phone || phone || 'contato'}!`,
      }));
    } catch (err: any) {
      alert(`Falha ao disparar fatura via WhatsApp: ${err.message || 'Erro inesperado'}`);
    } finally {
      setSendingInvoiceWhatsAppId(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Exportar CSV
  const handleExportCSV = () => {
    if (!data || !data.transactions || data.transactions.length === 0) {
      alert('Nenhuma transação financeira disponível para exportação.');
      return;
    }

    const headers = [
      'ID Assinatura',
      'Estabelecimento',
      'Empresa / Lojista',
      'Plano',
      'Valor (R$)',
      'Ciclo',
      'Status Pagamento',
      'Data de Criacao',
    ].map((c) => `"${c}"`).join(';');

    const escapeVal = (v: any) => {
      if (v === null || v === undefined) return '""';
      return `"${String(v).replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    };

    const rows = (filteredTransactions.length > 0 ? filteredTransactions : data.transactions).map((t) => [
      escapeVal(t.id),
      escapeVal(t.listing?.name || 'Sem estabelecimento'),
      escapeVal(t.merchantProfile?.companyName || 'Lojista'),
      escapeVal(t.plan),
      escapeVal(Number(t.price).toFixed(2)),
      escapeVal(t.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'),
      escapeVal(t.status === 'PAID' ? 'Pago / Ativo' : t.status),
      escapeVal(new Date(t.createdAt).toLocaleDateString('pt-BR')),
    ].join(';'));

    const csvContent = `\uFEFF${headers}\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_cobrancas_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppInvoice(item.id, item.merchantPhone)}
                            disabled={sendingInvoiceWhatsAppId === item.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all ${
                              sentInvoiceWhatsAppMap[item.id]
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title="Dispara fatura oficial em PDF, link web e PIX Copia e Cola pelo WhatsApp Bot"
                          >
                            {sendingInvoiceWhatsAppId === item.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Enviando...
                              </>
                            ) : sentInvoiceWhatsAppMap[item.id] ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                Cobrança Enviada
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                Enviar Fatura Bot
                              </>
                            )}
                          </button>

                          {item.whatsAppLink && (
                            <a
                              href={item.whatsAppLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
                              title="Abrir WhatsApp Web para contato manual"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </a>
                          )}
                        </div>
                        {sentInvoiceWhatsAppMap[item.id] && (
                          <div className="text-[10px] text-emerald-600 mt-1 font-semibold text-right">
                            {sentInvoiceWhatsAppMap[item.id]}
                          </div>
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

      {/* BLOCO DE WEBHOOKS & INTEGRAÇÕES EXTERNAS (CRMs / ZAPIER / MAKE) */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                Webhooks & Integrações Externas (CRMs / Zapier / Make)
              </h3>
              <p className="text-xs text-neutral-500">
                Disparo assíncrono de eventos com assinatura criptográfica HMAC SHA-256 no header X-Signature.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 self-start sm:self-auto">
            {webhooks.length} endpoints configurados
          </span>
        </div>

        {/* Formulário de Cadastro de Novo Webhook */}
        <form onSubmit={handleCreateWebhook} className="bg-neutral-50/70 p-5 rounded-2xl border border-neutral-200/80 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
            Cadastrar Novo Endpoint de Notificação:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">URL de Destino (POST):</label>
              <input
                type="url"
                required
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1">Descrição / Nome do Sistema:</label>
              <input
                type="text"
                placeholder="Ex: Zapier - Notificar Canal no Slack e HubSpot CRM"
                value={webhookDesc}
                onChange={(e) => setWebhookDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-4 text-xs">
              <span className="font-bold text-neutral-600">Eventos Assinados:</span>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-neutral-800">
                <input
                  type="checkbox"
                  checked={webhookEvents.includes('SUBSCRIPTION_PAID')}
                  onChange={(e) => {
                    if (e.target.checked) setWebhookEvents([...webhookEvents, 'SUBSCRIPTION_PAID']);
                    else setWebhookEvents(webhookEvents.filter((ev) => ev !== 'SUBSCRIPTION_PAID'));
                  }}
                  className="rounded text-purple-600"
                />
                SUBSCRIPTION_PAID (Pagamento Confirmado)
              </label>
              
            </div>

            <button
              type="submit"
              disabled={savingWebhook || !webhookUrl.trim() || webhookEvents.length === 0}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              {savingWebhook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Adicionar Webhook
            </button>
          </div>
        </form>

        {/* Listagem de Webhooks Ativos */}
        {webhooks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-2xl text-xs text-neutral-400">
            Nenhum webhook externo cadastrado. Cadastre um endpoint acima para enviar notificações em tempo real ao Zapier ou CRM.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">URL / Descrição</th>
                  <th className="px-4 py-3">Eventos</th>
                  <th className="px-4 py-3">Secret HMAC</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-neutral-900">{wh.description || 'Webhook'}</div>
                      <div className="font-mono text-[11px] text-neutral-500 truncate max-w-sm" title={wh.url}>
                        {wh.url}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {wh.events.map((ev) => (
                          <span key={ev} className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold font-mono text-[10px]">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-neutral-400">
                      ••••••••{wh.secret?.substring(wh.secret.length - 6) || ''}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        type="button"
                        disabled={testingWebhookId === wh.id}
                        onClick={() => handleTestWebhook(wh.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[11px] transition-colors border border-neutral-200"
                        title="Enviar ping de teste simulado"
                      >
                        {testingWebhookId === wh.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-purple-600" />
                        )}
                        Testar Ping
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir Webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {testResult && testResult.id === wh.id && (
                        <div className="mt-1 text-right">
                          {testResult.success ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                              <Check className="w-3 h-3" /> HTTP {testResult.status} OK
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600">
                              Falha: {testResult.error || 'Erro ' + testResult.status}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      
      {/* MODAL DE TRANSFERÊNCIA PIX PARA FRANQUIA */}
      </div>
  );
}