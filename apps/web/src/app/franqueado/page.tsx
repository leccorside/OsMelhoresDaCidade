'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  TrendingUp,
  DollarSign,
  Crown,
  Store,
  Users,
  Search,
  Filter,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Layers,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import {
  fetchFranchiseOverviewApi,
  fetchFranchiseMerchantsApi,
  fetchFranchiseSubscriptionsApi,
  FranchiseOverviewData,
  FranchiseMerchantItem,
  FranchiseSubscriptionItem,
} from '@/lib/api';

export default function FranqueadoPage() {
  const [activeTab, setActiveTab] = useState<'merchants' | 'splits'>('merchants');
  const [overview, setOverview] = useState<FranchiseOverviewData | null>(null);
  const [merchants, setMerchants] = useState<FranchiseMerchantItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<FranchiseSubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [overviewData, merchantsData, subsData] = await Promise.all([
        fetchFranchiseOverviewApi(),
        fetchFranchiseMerchantsApi({ search: searchTerm, status: statusFilter }),
        fetchFranchiseSubscriptionsApi(),
      ]);
      setOverview(overviewData);
      setMerchants(merchantsData);
      setSubscriptions(subsData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar dados do franqueado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho da Franquia */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-200">
                    Franquia Regional Autorizada
                  </span>
                  {overview?.city.splitEnabled && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Split Ativo
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1 flex items-center gap-2">
                  {overview?.city.name} - {overview?.city.uf}
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  {overview?.city.franchiseName} • CNPJ: {overview?.city.franchiseCnpj || 'Não cadastrado'}
                </p>
              </div>
            </div>

            {/* Split Info Card */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center gap-6 self-start md:self-auto">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Regra de Divisão (Split)
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg font-black text-emerald-700">
                    {overview?.city.franchiseFeePercent}%
                  </span>
                  <span className="text-xs text-neutral-500 font-semibold">Franqueado Local</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-sm font-bold text-neutral-600">
                    {overview?.city.platformFeePercent}% Matriz
                  </span>
                </div>
              </div>
              <div className="border-l border-neutral-200 pl-4 hidden sm:block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Chave PIX
                </span>
                <span className="text-xs font-mono font-bold text-neutral-700">
                  {overview?.city.franchisePixKey || 'Não cadastrada'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* 4 Cards de Métricas do Franqueado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Faturamento Total */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
              <span>Faturamento Total do Mês</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-3 text-3xl font-black text-neutral-900">
              R$ {overview ? overview.stats.monthlyRevenue.toFixed(2) : '0,00'}
            </div>
            <p className="text-xs text-neutral-400 mt-1">Total bruto arrecadado na praça</p>
          </div>

          {/* Sua Comissão Estimada */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-600/10">
            <div className="flex items-center justify-between text-emerald-100 text-xs font-semibold uppercase tracking-wider">
              <span>Sua Comissão ({overview?.city.franchiseFeePercent}%)</span>
              <TrendingUp className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="mt-3 text-3xl font-black text-white">
              R$ {overview ? overview.stats.franchiseCommission.toFixed(2) : '0,00'}
            </div>
            <p className="text-xs text-emerald-100/80 mt-1">Líquido estimado a receber via split</p>
          </div>

          {/* Estabelecimentos Cadastrados */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
              <span>Comércios na Cidade</span>
              <Store className="w-5 h-5 text-sky-600" />
            </div>
            <div className="mt-3 text-3xl font-black text-neutral-900">
              {overview?.stats.totalListings || 0}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {overview?.stats.publishedListings || 0} publicados • {overview?.stats.pendingListings || 0} pendentes
            </p>
          </div>

          {/* Assinaturas VIP Ativas */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
              <span>Assinaturas VIP Ativas</span>
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-3 text-3xl font-black text-neutral-900">
              {overview?.stats.activeVipCount || 0}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {overview?.stats.vipPlansBreakdown.ouro || 0} Ouro • {overview?.stats.vipPlansBreakdown.prata || 0} Prata • {overview?.stats.vipPlansBreakdown.bronze || 0} Bronze
            </p>
          </div>
        </div>

        {/* Abas e Listagem */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
          {/* Header de Abas */}
          <div className="border-b border-neutral-200 px-6 sm:px-8 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('merchants')}
                className={`pb-4 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'merchants'
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Store className="w-4 h-4" />
                Comércios da Sua Praça ({merchants.length})
              </button>
              <button
                onClick={() => setActiveTab('splits')}
                className={`pb-4 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'splits'
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <PieChart className="w-4 h-4" />
                Extrato de Splits & Assinaturas ({subscriptions.length})
              </button>
            </div>

            {activeTab === 'merchants' && (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 pb-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar comércio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl border border-neutral-200 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1.5 px-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ALL">Todos status</option>
                  <option value="PUBLISHED">Publicados</option>
                  <option value="PENDING">Pendentes</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
                >
                  Filtrar
                </button>
              </form>
            )}
          </div>

          {/* Conteúdo da Aba Comércios */}
          {activeTab === 'merchants' && (
            <div className="p-6 sm:p-8">
              {loading ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                </div>
              ) : merchants.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-2xl">
                  <Store className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-700">Nenhum comércio localizado</p>
                  <p className="text-xs text-neutral-400 mt-1">Ajuste os filtros de busca para encontrar os estabelecimentos.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">Estabelecimento</th>
                        <th className="px-4 py-3">Categoria</th>
                        <th className="px-4 py-3">Responsável</th>
                        <th className="px-4 py-3">Status do Plano</th>
                        <th className="px-4 py-3">Publicação</th>
                        <th className="px-4 py-3 rounded-r-xl text-right">Ação Direta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {merchants.map((m) => (
                        <tr key={m.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-bold text-neutral-900">{m.name}</div>
                            <div className="text-xs text-neutral-400">{m.address || 'Sem endereço'}</div>
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                            {m.categoryName}
                          </td>
                          <td className="px-4 py-4 text-xs">
                            <div className="font-bold text-neutral-800">{m.ownerName}</div>
                            <div className="text-neutral-500 font-mono">{m.phone || 'Sem telefone'}</div>
                          </td>
                          <td className="px-4 py-4">
                            {m.isVip ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                <Crown className="w-3 h-3 text-amber-600" />
                                {m.currentPlan.replace('_', ' ')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600">
                                Gratuito
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                m.status === 'PUBLISHED'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {m.status === 'PUBLISHED' ? 'Publicado' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {m.whatsAppLink ? (
                              <a
                                href={m.whatsAppLink}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Conteúdo da Aba Splits */}
          {activeTab === 'splits' && (
            <div className="p-6 sm:p-8">
              {subscriptions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-2xl">
                  <PieChart className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-700">Nenhum repasse registrado ainda</p>
                  <p className="text-xs text-neutral-400 mt-1">Assim que comerciantes contratarem planos na sua cidade, os splits aparecerão aqui.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">Estabelecimento</th>
                        <th className="px-4 py-3">Plano</th>
                        <th className="px-4 py-3">Valor Bruto</th>
                        <th className="px-4 py-3">Sua Parte ({overview?.city.franchiseFeePercent}%)</th>
                        <th className="px-4 py-3">Parte Matriz ({overview?.city.platformFeePercent}%)</th>
                        <th className="px-4 py-3 rounded-r-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {subscriptions.map((s) => (
                        <tr key={s.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-bold text-neutral-900">{s.listingName}</div>
                            <div className="text-xs text-neutral-400">{s.merchantName}</div>
                          </td>
                          <td className="px-4 py-4 text-xs font-medium text-neutral-800">
                            {s.plan.replace('_', ' ')} ({s.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'})
                          </td>
                          <td className="px-4 py-4 font-semibold text-neutral-900">
                            R$ {s.grossAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 font-bold text-emerald-700">
                            R$ {s.franchiseCut.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-xs text-neutral-500">
                            R$ {s.platformCut.toFixed(2)}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                s.status === 'PAID'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {s.status === 'PAID' ? 'Liquidado' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
