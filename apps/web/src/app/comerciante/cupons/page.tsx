'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Ticket,
  Percent,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  PauseCircle,
  PlayCircle,
  Trash2,
  Pencil,
  Copy,
  Users,
  DollarSign,
  Gift,
  AlertCircle,
  Loader2,
  ArrowRight,
  Store,
  Sparkles,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';
import {
  fetchMerchantCoupons,
  createMerchantCouponApi,
  updateMerchantCouponApi,
  toggleMerchantCouponStatusApi,
  deleteMerchantCouponApi,
  fetchMerchantListings,
  MerchantCouponItem,
  MerchantCouponsData,
  MerchantListing,
} from '@/lib/api';

export default function MerchantCouponsPage() {
  const [data, setData] = useState<MerchantCouponsData | null>(null);
  const [listings, setListings] = useState<MerchantListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtros
  const [selectedListingId, setSelectedListingId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Criação / Edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<MerchantCouponItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulário
  const [formData, setFormData] = useState({
    listingId: '',
    code: '',
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    discountUnit: '%',
    minSpend: '',
    maxUses: '',
    startDate: '',
    endDate: '',
    rules: '',
  });

  // Modal de Resgates (Claims)
  const [claimsModalCoupon, setClaimsModalCoupon] = useState<MerchantCouponItem | null>(null);

  // Modal de Confirmação de Exclusão
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; couponId: string; code: string }>({
    isOpen: false,
    couponId: '',
    code: '',
  });

  // Feedback automático
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // Carregar estabelecimentos do parceiro
  useEffect(() => {
    async function loadListings() {
      try {
        const list = await fetchMerchantListings();
        setListings(list);
        if (list.length > 0 && !formData.listingId) {
          setFormData((prev) => ({ ...prev, listingId: list[0].id }));
        }
      } catch (err) {
        console.error('Erro ao carregar estabelecimentos:', err);
      }
    }
    loadListings();
  }, []);

  // Carregar cupons
  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetchMerchantCoupons({
        listingId: selectedListingId !== 'all' ? selectedListingId : undefined,
        status: selectedStatus,
        search: searchTerm.trim() || undefined,
      });
      setData(res);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao carregar cupons promocionais.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [selectedListingId, selectedStatus]);

  // Buscar ao pressionar Enter ou limpar busca
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCoupons();
  };

  // Abrir modal de criação
  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      listingId: listings[0]?.id || '',
      code: '',
      title: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      discountUnit: '%',
      minSpend: '',
      maxUses: '',
      startDate: '',
      endDate: '',
      rules: '',
    });
    setModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEditModal = (coupon: MerchantCouponItem) => {
    setEditingCoupon(coupon);
    setFormData({
      listingId: coupon.listingId,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue !== null && coupon.discountValue !== undefined ? String(coupon.discountValue) : '',
      discountUnit: coupon.discountUnit || '%',
      minSpend: coupon.minSpend !== null && coupon.minSpend !== undefined ? String(coupon.minSpend) : '',
      maxUses: coupon.maxUses !== null && coupon.maxUses !== undefined ? String(coupon.maxUses) : '',
      startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
      endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
      rules: coupon.rules || '',
    });
    setModalOpen(true);
  };

  // Submissão do Formulário
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFeedback({ type: 'error', message: 'O título da promoção é obrigatório.' });
      return;
    }

    if (!editingCoupon && !formData.code.trim()) {
      setFeedback({ type: 'error', message: 'O código do cupom é obrigatório.' });
      return;
    }

    try {
      setSubmitting(true);
      if (editingCoupon) {
        await updateMerchantCouponApi(editingCoupon.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          discountType: formData.discountType,
          discountValue: formData.discountValue ? parseFloat(formData.discountValue) : undefined,
          discountUnit: formData.discountUnit || undefined,
          minSpend: formData.minSpend ? parseFloat(formData.minSpend) : undefined,
          maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          rules: formData.rules.trim() || undefined,
        });
        setFeedback({ type: 'success', message: 'Promoção atualizada com sucesso!' });
      } else {
        await createMerchantCouponApi({
          listingId: formData.listingId,
          code: formData.code.trim().toUpperCase(),
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          discountType: formData.discountType,
          discountValue: formData.discountValue ? parseFloat(formData.discountValue) : undefined,
          discountUnit: formData.discountUnit || undefined,
          minSpend: formData.minSpend ? parseFloat(formData.minSpend) : undefined,
          maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          rules: formData.rules.trim() || undefined,
        });
        setFeedback({ type: 'success', message: 'Novo cupom cadastrado com sucesso!' });
      }

      setModalOpen(false);
      await loadCoupons();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao salvar promoção.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Alternar Status (Ativo / Pausado)
  const handleToggleStatus = async (couponId: string) => {
    try {
      await toggleMerchantCouponStatusApi(couponId);
      setFeedback({ type: 'success', message: 'Status do cupom alterado com sucesso.' });
      await loadCoupons();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao alternar status.' });
    }
  };

  // Confirmar Exclusão
  const handleDeleteConfirm = async () => {
    try {
      await deleteMerchantCouponApi(deleteModal.couponId);
      setFeedback({ type: 'success', message: 'Cupom excluído com sucesso.' });
      setDeleteModal({ isOpen: false, couponId: '', code: '' });
      await loadCoupons();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao excluir cupom.' });
    }
  };

  // Copiar Código do Cupom
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setFeedback({ type: 'success', message: `Código "${code}" copiado para a área de transferência!` });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1B1B]">
      {/* Header Institucional */}
      <header className="border-b border-[#EADDD0] bg-[#1C1B1B] text-white py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#EADDD0]/70 mb-1">
              <Link href="/comerciante" className="hover:text-white transition">
                Painel do Parceiro
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#EADDD0]">Promoções & Cupons</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Ticket className="w-7 h-7 text-[#FF3B4F]" />
              Promoções & Cupons de Desconto
            </h1>
            <p className="text-xs sm:text-sm text-[#EADDD0]/80 mt-1">
              Crie ofertas exclusivas, atraia mais clientes para o seu estabelecimento e impulsione suas vendas no guia.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-[#FF3B4F] text-white font-bold text-xs sm:text-sm hover:bg-[#e03445] transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Criar Nova Promoção
            </button>
          </div>
        </div>
      </header>

      {/* Notificação Flutuante de Feedback */}
      {feedback && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div
            className={`p-4 rounded-xl flex items-center gap-3 border transition ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{feedback.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* CARDS DE MÉTRICAS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Promoções */}
          <div className="bg-white p-5 rounded-2xl border border-[#EADDD0]/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Total de Promoções
              </span>
              <span className="text-3xl font-black text-[#1C1B1B] mt-1 block">
                {data?.metrics?.totalCoupons || 0}
              </span>
              <span className="text-[11px] text-[#8C7A6B] mt-0.5 block">Campanhas cadastradas</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <Ticket className="w-6 h-6" />
            </div>
          </div>

          {/* Promoções Ativas */}
          <div className="bg-white p-5 rounded-2xl border border-[#EADDD0]/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Ofertas Ativas
              </span>
              <span className="text-3xl font-black text-emerald-600 mt-1 block">
                {data?.metrics?.activeCoupons || 0}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                Visíveis para os visitantes
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          {/* Vouchers Resgatados */}
          <div className="bg-white p-5 rounded-2xl border border-[#EADDD0]/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Vouchers Resgatados
              </span>
              <span className="text-3xl font-black text-[#1C1B1B] mt-1 block">
                {data?.metrics?.totalClaims || 0}
              </span>
              <span className="text-[11px] text-[#8C7A6B] mt-0.5 block">Clientes engajados</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Economia Estimada */}
          <div className="bg-white p-5 rounded-2xl border border-[#EADDD0]/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider block">
                Benefícios Gerados
              </span>
              <span className="text-2xl font-black text-[#FF3B4F] mt-1 block">
                R$ {Number(data?.metrics?.estimatedSavings || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-[#8C7A6B] mt-0.5 block">Em descontos fixos</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#FF3B4F]">
              <Gift className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* FILTROS E BUSCA */}
        <section className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EADDD0]/80 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Seletor de Estabelecimento */}
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-[#8C7A6B] shrink-0" />
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="bg-gray-50 border border-[#EADDD0] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1C1B1B] focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
              >
                <option value="all">Todos os Estabelecimentos</option>
                {listings.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Abas de Status */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0">
              {[
                { label: 'Todos', value: 'ALL' },
                { label: 'Ativos', value: 'ACTIVE' },
                { label: 'Pausados', value: 'PAUSED' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedStatus === tab.value
                      ? 'bg-[#1C1B1B] text-white shadow-xs'
                      : 'bg-gray-100 text-[#5C3F3F] hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Busca Textual */}
            <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-[#EADDD0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
              />
            </form>
          </div>
        </section>

        {/* LISTA / GRADE DE CUPONS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1C1B1B] flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#FF3B4F]" />
              Cupons Cadastrados ({data?.coupons?.length || 0})
            </h2>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-[#EADDD0]/80 shadow-xs flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF3B4F]" />
              <span className="text-xs sm:text-sm">Carregando promoções...</span>
            </div>
          ) : !data?.coupons || data.coupons.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#EADDD0]/80 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <Ticket className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-[#1C1B1B]">Nenhum cupom encontrado</h3>
                <p className="text-xs sm:text-sm text-[#8C7A6B] mt-1">
                  Você ainda não possui promoções cadastradas com os filtros selecionados. Crie sua primeira oferta agora mesmo!
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 rounded-xl bg-[#FF3B4F] text-white font-bold text-xs sm:text-sm hover:bg-[#e03445] transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Primeiro Cupom
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.coupons.map((coupon) => {
                const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date();
                const isActive = coupon.status === 'ACTIVE' && !isExpired;
                const isMaxReached = coupon.maxUses && coupon.usedCount >= coupon.maxUses;

                return (
                  <div
                    key={coupon.id}
                    className="bg-white rounded-2xl border border-[#EADDD0]/90 shadow-xs overflow-hidden flex flex-col justify-between transition hover:shadow-md"
                  >
                    {/* Topo do Card de Cupom */}
                    <div className="p-5 border-b border-dashed border-[#EADDD0] relative bg-gradient-to-br from-white via-white to-orange-50/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                            {coupon.listing?.title || coupon.listing?.name || 'Estabelecimento'}
                          </span>
                          <h3 className="text-base font-extrabold text-[#1C1B1B] mt-0.5 line-clamp-2">
                            {coupon.title}
                          </h3>
                        </div>

                        {/* Badge de Status */}
                        <div>
                          {isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                              Expirado
                            </span>
                          ) : isMaxReached ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              Esgotado
                            </span>
                          ) : isActive ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Ativo
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500">
                              Pausado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Destaque do Desconto */}
                      <div className="mt-4 flex items-center gap-3">
                        <div className="px-3.5 py-1.5 rounded-xl bg-[#1C1B1B] text-white font-black text-sm tracking-wider flex items-center gap-2">
                          <Percent className="w-4 h-4 text-[#FF3B4F]" />
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}% OFF`
                            : coupon.discountType === 'FIXED_AMOUNT'
                            ? `R$ ${coupon.discountValue} OFF`
                            : coupon.discountType === 'FREEBIE'
                            ? 'BRINDE / CORTESIA'
                            : coupon.discountUnit || 'PROMOÇÃO'}
                        </div>

                        {coupon.minSpend && (
                          <span className="text-[11px] text-[#8C7A6B] font-medium">
                            Consumo mín. R$ {Number(coupon.minSpend).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {coupon.description && (
                        <p className="text-xs text-[#5C3F3F] mt-3 line-clamp-2 leading-relaxed">
                          {coupon.description}
                        </p>
                      )}
                    </div>

                    {/* Meio: Código e Progresso */}
                    <div className="p-5 space-y-4 bg-white flex-1 flex flex-col justify-between">
                      {/* Código do Cupom com Botão de Copiar */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-orange-950 uppercase">CÓDIGO:</span>
                          <span className="font-mono font-black text-sm text-[#1C1B1B] tracking-wider">
                            {coupon.code}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          title="Copiar código"
                          className="p-1.5 rounded-lg text-orange-700 hover:bg-orange-200/60 transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Progresso de Usos */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-medium text-[#8C7A6B]">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {coupon.usedCount} {coupon.usedCount === 1 ? 'resgate' : 'resgates'}
                          </span>
                          {coupon.maxUses && (
                            <span>Limite: {coupon.maxUses} cupons</span>
                          )}
                        </div>
                        {coupon.maxUses && (
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Validade e Regras */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#8C7A6B]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {coupon.endDate
                            ? `Até ${new Date(coupon.endDate).toLocaleDateString('pt-BR')}`
                            : 'Sem prazo de término'}
                        </span>

                        {coupon.claims && coupon.claims.length > 0 && (
                          <button
                            onClick={() => setClaimsModalCoupon(coupon)}
                            className="text-xs font-bold text-[#FF3B4F] hover:underline"
                          >
                            Ver Resgates ({coupon.claims.length})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Rodapé: Ações */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleStatus(coupon.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                          coupon.status === 'ACTIVE'
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                        }`}
                      >
                        {coupon.status === 'ACTIVE' ? (
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

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(coupon)}
                          title="Editar cupom"
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, couponId: coupon.id, code: coupon.code })}
                          title="Excluir cupom"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1C1B1B] flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-[#FF3B4F]" />
                  {editingCoupon ? 'Editar Promoção' : 'Criar Nova Promoção'}
                </h3>
                <p className="text-xs text-[#8C7A6B] mt-0.5">
                  Preencha os dados da oferta especial para os visitantes do guia.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Estabelecimento */}
              {!editingCoupon && (
                <div>
                  <label className="block text-xs font-bold text-[#1C1B1B] mb-1">
                    Estabelecimento Anfitrião *
                  </label>
                  <select
                    value={formData.listingId}
                    onChange={(e) => setFormData({ ...formData, listingId: e.target.value })}
                    required
                    className="w-full bg-gray-50 border border-[#EADDD0] rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                  >
                    {listings.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Código e Título */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1B1B] mb-1">
                    Código do Cupom *
                  </label>
                  <input
                    type="text"
                    disabled={!!editingCoupon}
                    placeholder="Ex: CALDAS10, VERAO2026"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="w-full bg-gray-50 border border-[#EADDD0] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#FF3B4F] disabled:opacity-50"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Apenas letras e números</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1B1B] mb-1">
                    Tipo de Benefício *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-gray-50 border border-[#EADDD0] rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                  >
                    <option value="PERCENTAGE">Porcentagem (% OFF)</option>
                    <option value="FIXED_AMOUNT">Desconto Fixo (R$)</option>
                    <option value="FREEBIE">Brinde / Cortesia</option>
                    <option value="CUSTOM">Personalizado</option>
                  </select>
                </div>
              </div>

              {/* Título da Promoção */}
              <div>
                <label className="block text-xs font-bold text-[#1C1B1B] mb-1">
                  Título da Oferta *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 15% de Desconto no Almoço Executivo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full bg-gray-50 border border-[#EADDD0] rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>

              {/* Valor do Desconto e Consumo Mínimo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1B1B] mb-1">
                    Valor do Desconto {formData.discountType === 'PERCENTAGE' ? '(%)' : '(R$)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 15 ou 30.00"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full bg-gray-50 border border-[#EADDD0] rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1B1B] mb-1">
                    Consumo Mínimo (R$ opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 100.00"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                    className="w-full bg-gray-50 border border-[#EADDD0] rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                  />
                </div>
              </div>

              {/* Limite de Usos e Validade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1B1B] mb-1">
                    Limite Máximo de Cupons
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 50 (deixe vazio p/ ilimitado)"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full bg-gray-50 border border-[#EADDD0] rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1B1B] mb-1">
                    Data de Término / Validade
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-gray-50 border border-[#EADDD0] rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                  />
                </div>
              </div>

              {/* Descrição e Regras */}
              <div>
                <label className="block text-xs font-bold text-[#1C1B1B] mb-1">
                  Descrição dos Benefícios
                </label>
                <textarea
                  rows={2}
                  placeholder="Explique o que o cliente ganha ao apresentar este cupom..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-[#EADDD0] rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B1B] mb-1">
                  Regras e Restrições de Uso
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Válido de terça a sexta. Não cumulativo com outras promoções."
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  className="w-full bg-gray-50 border border-[#EADDD0] rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#FF3B4F] text-white text-xs sm:text-sm font-bold hover:bg-[#e03445] transition flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCoupon ? 'Salvar Alterações' : 'Criar Promoção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE RESGATES / VOUCHERS */}
      {claimsModalCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1C1B1B] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FF3B4F]" />
                  Resgates do Cupom {claimsModalCoupon.code}
                </h3>
                <p className="text-xs text-[#8C7A6B] mt-0.5">
                  Lista dos vouchers resgatados pelos visitantes do guia.
                </p>
              </div>
              <button
                onClick={() => setClaimsModalCoupon(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {!claimsModalCoupon.claims || claimsModalCoupon.claims.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">
                  Nenhum cliente resgatou este voucher ainda.
                </p>
              ) : (
                claimsModalCoupon.claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {claim.claimCode}
                      </span>
                      <span className="block text-xs font-bold text-[#1C1B1B] mt-1.5">
                        {claim.customerName || 'Cliente Guia'}
                      </span>
                      {claim.customerPhone && (
                        <span className="block text-[11px] text-gray-500">
                          Tel: {claim.customerPhone}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8C7A6B]">
                      {new Date(claim.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 text-right">
              <button
                onClick={() => setClaimsModalCoupon(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1C1B1B] text-white text-xs font-bold hover:bg-gray-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1B1B]">Excluir Cupom Promocional?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Tem certeza que deseja remover o cupom <strong>{deleteModal.code}</strong>? Os clientes não poderão mais resgatar esta oferta.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, couponId: '', code: '' })}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

