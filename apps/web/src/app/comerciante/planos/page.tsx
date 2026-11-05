'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Store,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  X,
  CreditCard,
  ChevronRight,
  Star,
  Flame,
  Award,
  FileText,
  Tag,
  Ticket,
  ArrowUpCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Eye,
  MessageCircle,
} from 'lucide-react';
import {
  fetchBillingPlansApi,
  fetchMerchantSubscriptionsApi,
  createCheckoutApi,
  confirmSubscriptionPaymentApi,
  fetchMerchantListings,
  validateSubscriptionCouponApi,
  calculatePlanChangeApi,
  createPlanChangeCheckoutApi,
  fetchMerchantRoiPerformanceApi,
  BillingPlan,
  MerchantSubscriptionItem,
  MerchantListing,
  CouponValidationResult,
  PlanChangeCalculation,
  MerchantRoiPerformanceData,
} from '@/lib/api';

export default function MerchantPlansPage() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<MerchantSubscriptionItem[]>([]);
  const [listings, setListings] = useState<MerchantListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<{
    subscriptionId: string;
    pixQrCode: string;
    price: number;
    billingCycle: string;
  } | null>(null);

  // Confirmação State
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Cupom de Desconto State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Upgrade / Pró-Rata State
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetSub, setTargetSub] = useState<MerchantSubscriptionItem | null>(null);
  const [targetNewPlan, setTargetNewPlan] = useState<string>('OURO_MASTER');
  const [targetNewCycle, setTargetNewCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [prorataCalc, setProrataCalc] = useState<PlanChangeCalculation | null>(null);
  const [prorataLoading, setProrataLoading] = useState(false);

  // Relatório de ROI State
  const [roiData, setRoiData] = useState<MerchantRoiPerformanceData | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, subsData, listingsData, roiRes] = await Promise.all([
        fetchBillingPlansApi(),
        fetchMerchantSubscriptionsApi(),
        fetchMerchantListings(),
        fetchMerchantRoiPerformanceApi().catch(() => null),
      ]);
      setPlans(plansData);
      setSubscriptions(subsData);
      setListings(listingsData);
      setRoiData(roiRes);
      if (listingsData.length > 0) {
        setSelectedListingId(listingsData[0].id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar dados de planos.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCheckout = (plan: BillingPlan) => {
    setSelectedPlan(plan);
    setCheckoutResult(null);
    setCopied(false);
    setFeedback(null);
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponError(null);
    setModalOpen(true);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !selectedPlan) return;
    try {
      setValidatingCoupon(true);
      setCouponError(null);
      const res = await validateSubscriptionCouponApi({
        code: couponInput.trim(),
        plan: selectedPlan.id,
        billingCycle,
      });
      setAppliedCoupon(res);
    } catch (err: any) {
      setCouponError(err.message || 'Cupom inválido ou expirado.');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handleOpenUpgrade = async (sub: MerchantSubscriptionItem) => {
    setTargetSub(sub);
    const nextPlan =
      sub.plan === 'BRONZE_DESTAQUE'
        ? 'PRATA_REGIONAL'
        : 'OURO_MASTER';
    setTargetNewPlan(nextPlan);
    setTargetNewCycle(sub.billingCycle as any || 'MONTHLY');
    setUpgradeModalOpen(true);
    setCouponInput('');
    setAppliedCoupon(null);
    setCouponError(null);

    try {
      setProrataLoading(true);
      const calc = await calculatePlanChangeApi({
        subscriptionId: sub.id,
        newPlan: nextPlan,
        newBillingCycle: sub.billingCycle || 'MONTHLY',
      });
      setProrataCalc(calc);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao calcular pró-rata.' });
    } finally {
      setProrataLoading(false);
    }
  };

  const handleRecalculateProrata = async (newPlan: string, newCycle: 'MONTHLY' | 'YEARLY') => {
    if (!targetSub) return;
    setTargetNewPlan(newPlan);
    setTargetNewCycle(newCycle);

    try {
      setProrataLoading(true);
      const calc = await calculatePlanChangeApi({
        subscriptionId: targetSub.id,
        newPlan,
        newBillingCycle: newCycle,
      });
      setProrataCalc(calc);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao recalcular pró-rata.' });
    } finally {
      setProrataLoading(false);
    }
  };

  const handleExecuteUpgrade = async () => {
    if (!targetSub) return;
    try {
      setCheckoutLoading(true);
      setFeedback(null);
      const res = await createPlanChangeCheckoutApi({
        subscriptionId: targetSub.id,
        newPlan: targetNewPlan,
        newBillingCycle: targetNewCycle,
        couponCode: appliedCoupon?.code,
      });

      setUpgradeModalOpen(false);
      setCheckoutResult({
        subscriptionId: res.subscriptionId,
        pixQrCode: res.pixQrCode,
        price: res.price,
        billingCycle: res.billingCycle,
      });
      setSelectedPlan(res.newPlan);
      setModalOpen(true);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao iniciar upgrade.' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleGenerateCheckout = async () => {
    if (!selectedPlan || !selectedListingId) return;

    try {
      setCheckoutLoading(true);
      setFeedback(null);
      const res = await createCheckoutApi({
        listingId: selectedListingId,
        plan: selectedPlan.id,
        billingCycle,
        paymentMethod: 'PIX',
        couponCode: appliedCoupon?.code,
      });

      setCheckoutResult({
        subscriptionId: res.subscriptionId,
        pixQrCode: res.pixQrCode,
        price: res.price,
        billingCycle: res.billingCycle,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao gerar cobrança PIX.' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleConfirmPayment = async (subscriptionId: string) => {
    try {
      setConfirming(true);
      setFeedback(null);
      const res = await confirmSubscriptionPaymentApi(subscriptionId);
      setFeedback({
        type: 'success',
        message: '🎉 Pagamento confirmado com sucesso! O selo de destaque já está ativo.',
      });
      setModalOpen(false);
      setCheckoutResult(null);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao confirmar pagamento.' });
    } finally {
      setConfirming(false);
    }
  };

  const copyPixCode = () => {
    if (checkoutResult?.pixQrCode) {
      navigator.clipboard.writeText(checkoutResult.pixQrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/comerciante" className="hover:text-neutral-900 transition-colors">
          Painel do Comerciante
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-neutral-900 font-medium">Planos de Destaque</span>
      </nav>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-950 p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-500/30">
            <Crown className="w-4 h-4 text-amber-400" />
            Visibilidade Máxima no Guia
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Multiplique seus clientes com os Planos de Destaque
          </h1>
          <p className="mt-3 text-neutral-300 text-sm sm:text-base leading-relaxed">
            Coloque o seu comércio no topo das buscas, conquiste o selo oficial verificado e atraia dezenas de clientes qualificados todos os dias direto pelo WhatsApp.
          </p>
        </div>

        {/* Fundo decorativo */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none flex items-center justify-end pr-10">
          <Crown className="w-72 h-72 text-amber-400" />
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.message}</div>
          <button
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Ciclo de Cobrança Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <div className="inline-flex p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              billingCycle === 'MONTHLY'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Faturamento Mensal
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              billingCycle === 'YEARLY'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>Faturamento Anual</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              2 meses grátis
            </span>
          </button>
        </div>
      </div>

      {/* Cards de Planos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-neutral-100 animate-pulse border border-neutral-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
            const monthlyEquivalent = billingCycle === 'YEARLY' ? plan.priceYearly / 12 : plan.priceMonthly;
            const isOuro = plan.id === 'OURO_MASTER';
            const isPrata = plan.id === 'PRATA_REGIONAL';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl ${
                  isOuro
                    ? 'bg-gradient-to-b from-amber-500/10 via-white to-amber-50/40 border-2 border-amber-500 shadow-xl shadow-amber-500/10'
                    : isPrata
                    ? 'bg-white border-2 border-sky-400 shadow-lg shadow-sky-400/5'
                    : 'bg-white border border-neutral-200 shadow-sm hover:border-neutral-300'
                }`}
              >
                {/* Badge de recomendação */}
                {plan.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    Mais Escolhido
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wider ${
                        isOuro
                          ? 'bg-amber-100 text-amber-800'
                          : isPrata
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-900/10 text-amber-900'
                      }`}
                    >
                      {plan.badge}
                    </span>
                    {isOuro && <Crown className="w-6 h-6 text-amber-500" />}
                    {isPrata && <Award className="w-6 h-6 text-sky-500" />}
                    {!isOuro && !isPrata && <Star className="w-6 h-6 text-amber-700" />}
                  </div>

                  <h3 className="text-2xl font-bold text-neutral-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>

                  {/* Preço */}
                  <div className="mt-6 pb-6 border-b border-neutral-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-neutral-500">R$</span>
                      <span className="text-4xl font-extrabold text-neutral-900 tracking-tight">
                        {monthlyEquivalent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm text-neutral-500 font-medium">/mês</span>
                    </div>
                    {billingCycle === 'YEARLY' && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Cobrado anualmente (R$ {price.toFixed(2)})
                      </p>
                    )}
                  </div>

                  {/* Recursos */}
                  <div className="mt-6 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      O que está incluso:
                    </p>
                    {plan.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm text-neutral-700">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isOuro ? 'text-amber-500' : isPrata ? 'text-sky-500' : 'text-emerald-500'
                          }`}
                        />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botão de Assinar */}
                <div className="mt-8 pt-4">
                  <button
                    onClick={() => handleOpenCheckout(plan)}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                      isOuro
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25 hover:shadow-amber-500/35 hover:-translate-y-0.5'
                        : isPrata
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-white hover:-translate-y-0.5'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
                    }`}
                  >
                    <span>Quero este plano</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Relatório de Desempenho e ROI dos Planos VIP */}
      {roiData && (
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
                <TrendingUp className="w-3.5 h-3.5" />
                Impacto Real do Plano de Destaque
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Retorno do seu Investimento (ROI) no Guia
              </h2>
              <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Comparativo oficial de desempenho do seu comércio contra a média de negócios sem plano de destaque na cidade.
              </p>
            </div>

            <Link
              href="/comerciante/estatisticas"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/10 shrink-0 self-start sm:self-auto"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              Métricas Detalhadas →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Visualizações */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <span>Alcance no Guia</span>
                <Eye className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{roiData.totals.views.toLocaleString('pt-BR')}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  +{roiData.benchmarks.viewsIncreasePercentage}%
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {roiData.benchmarks.viewsMultiplier}x mais visualizações que a média da cidade.
              </p>
            </div>

            {/* Contatos WhatsApp */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <span>Contatos WhatsApp</span>
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{roiData.totals.whatsapp.toLocaleString('pt-BR')}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  +{roiData.benchmarks.leadsIncreasePercentage}%
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {roiData.benchmarks.leadsMultiplier}x mais conversões no botão flutuante.
              </p>
            </div>

            {/* Custo por Lead */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                <span>Custo Médio p/ Lead</span>
                <Tag className="w-4 h-4 text-sky-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  R$ {roiData.financialRoi.costPerLead.toFixed(2)}
                </span>
                <span className="text-xs text-neutral-400 font-medium">/ contato</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Muito inferior ao custo por clique médio do Google/Meta Ads.
              </p>
            </div>

            {/* Estimativa de ROI */}
            <div className="bg-gradient-to-br from-amber-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-5 border border-amber-500/30">
              <div className="flex items-center justify-between text-amber-200 text-xs font-semibold uppercase tracking-wider">
                <span>Retorno Estimado</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-300 font-mono">
                  +{roiData.financialRoi.roiPercentage}%
                </span>
                <span className="text-xs font-bold text-emerald-300">ROI Alto</span>
              </div>
              <p className="text-xs text-neutral-300 mt-1">
                Estimativa de R$ {roiData.financialRoi.estimatedReturns.toFixed(2)} em novas vendas geradas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Histórico de Assinaturas e Destaques Ativos */}
      <div className="mt-12 bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Seus Estabelecimentos & Destaques Contratados
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Acompanhe os status dos seus planos ativos e prazos de renovação.
            </p>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-2xl">
            <Store className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-700">Nenhum plano ativo no momento</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1">
              Escolha um dos planos acima para ativar o selo de destaque no seu anúncio e começar a receber mais clientes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Estabelecimento</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Ciclo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Vigência Até</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {subscriptions.map((sub) => {
                  const isPaid = sub.status === 'PAID';
                  const isPending = sub.status === 'PENDING';

                  return (
                    <tr key={sub.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-neutral-900">
                        {sub.listing?.name || 'Estabelecimento Principal'}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-neutral-800">
                          {sub.plan.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-neutral-700 font-semibold">
                        R$ {Number(sub.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-neutral-500 capitalize">
                        {sub.billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'}
                      </td>
                      <td className="px-4 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Ativo
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Aguardando PIX
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
                            {sub.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-neutral-500">
                        {sub.endDate
                          ? new Date(sub.endDate).toLocaleDateString('pt-BR')
                          : 'Aguardando pagamento'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <button
                              onClick={() => handleConfirmPayment(sub.id)}
                              disabled={confirming}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              {confirming ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Zap className="w-3.5 h-3.5" />
                              )}
                              Confirmar PIX
                            </button>
                          )}

                          {isPaid && sub.plan !== 'OURO_MASTER' && (
                            <button
                              onClick={() => handleOpenUpgrade(sub)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors border border-amber-300"
                              title="Fazer Upgrade de Plano com Pró-Rata proporcional"
                            >
                              <ArrowUpCircle className="w-3.5 h-3.5 text-amber-600" />
                              Upgrade
                            </button>
                          )}

                          <Link
                            href={`/comerciante/fatura/${sub.id}`}
                            target="_blank"
                            title="Visualizar e Imprimir Recibo Oficial / Fatura em PDF"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors border border-neutral-200/80"
                          >
                            <FileText className="w-3.5 h-3.5 text-neutral-600" />
                            Recibo / PDF
                          </Link>

                          {isPaid && (
                            <Link
                              href={`/comerciante/estabelecimentos`}
                              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 ml-1 hidden sm:inline-block"
                            >
                              Ver anúncio →
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CHECKOUT PIX */}
      {modalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-100 max-h-[90vh] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => {
                setModalOpen(false);
                setCheckoutResult(null);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Assinar {selectedPlan.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  Ciclo {billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'} • Pagamento Instantâneo via PIX
                </p>
              </div>
            </div>

            {!checkoutResult ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-neutral-800 mb-2">
                    Selecione o estabelecimento para aplicar o Destaque:
                  </label>
                  {listings.length === 0 ? (
                    <p className="text-sm text-rose-600">
                      Você ainda não tem nenhum comércio cadastrado. Cadastre um estabelecimento primeiro.
                    </p>
                  ) : (
                    <select
                      value={selectedListingId}
                      onChange={(e) => setSelectedListingId(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
                    >
                      {listings.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.category?.name || 'Comércio'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Cupom Promocional */}
                <div className="bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/70">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-amber-500" />
                    Cupom Promocional de Desconto:
                  </label>

                  {!appliedCoupon ? (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Ex: PRIMEIRO_MES"
                          className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon || !couponInput.trim()}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          {validatingCoupon ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Tag className="w-3.5 h-3.5" />
                          )}
                          Aplicar
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-rose-600 font-medium">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-emerald-800 font-mono">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-emerald-700 ml-1.5 font-medium">
                            (-R$ {appliedCoupon.discountAmount.toFixed(2)})
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-neutral-400 hover:text-neutral-700 p-1"
                        title="Remover cupom"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Resumo de Valores */}
                <div className="bg-neutral-50 rounded-2xl p-4 space-y-2 border border-neutral-200/70 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Plano escolhido:</span>
                    <span className="font-semibold text-neutral-800">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Frequência:</span>
                    <span className="font-semibold text-neutral-800">
                      {billingCycle === 'YEARLY' ? 'Anual' : 'Mensal'}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <>
                      <div className="flex justify-between text-neutral-600 text-xs">
                        <span>Valor original:</span>
                        <span className="line-through font-mono">
                          R$ {(billingCycle === 'YEARLY' ? selectedPlan.priceYearly : selectedPlan.priceMonthly).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-emerald-700 text-xs font-semibold">
                        <span>Desconto ({appliedCoupon.code}):</span>
                        <span className="font-mono">- R$ {appliedCoupon.discountAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-neutral-900 font-bold pt-2 border-t border-neutral-200">
                    <span>Valor a pagar:</span>
                    <span className="text-lg text-emerald-600 font-mono">
                      R$ {appliedCoupon
                        ? appliedCoupon.finalPrice.toFixed(2)
                        : (billingCycle === 'YEARLY' ? selectedPlan.priceYearly : selectedPlan.priceMonthly).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGenerateCheckout}
                  disabled={checkoutLoading || listings.length === 0}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando QR Code PIX...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      Gerar Pagamento PIX
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* QR Code PIX Renderizado */
              <div className="space-y-6 text-center">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-sm">
                  <p className="font-bold">Chave PIX Dinâmica gerada com sucesso!</p>
                  <p className="text-xs mt-0.5 text-emerald-700">
                    Abra o app do seu banco, escolha <strong>PIX Copia e Cola</strong> ou aponte a câmera.
                  </p>
                </div>

                {/* QR Code Simulado com padrão SVG */}
                <div className="p-6 bg-white border-2 border-dashed border-neutral-300 rounded-3xl inline-block shadow-sm">
                  <div className="w-48 h-48 bg-neutral-900 rounded-2xl flex flex-col items-center justify-center text-white p-4 mx-auto">
                    <QrCode className="w-28 h-28 text-white mb-2" />
                    <span className="text-[10px] tracking-widest font-mono text-neutral-300 uppercase">
                      PIX OFICIAL BCB
                    </span>
                  </div>
                </div>

                {/* Código Copia e Cola */}
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Código PIX Copia e Cola:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={checkoutResult.pixQrCode}
                      className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 text-xs font-mono bg-neutral-50 text-neutral-700 truncate"
                    />
                    <button
                      onClick={copyPixCode}
                      className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Botão de Simulação Instantânea de Pagamento */}
                <div className="pt-2 border-t border-neutral-100">
                  <p className="text-xs text-neutral-400 mb-3">
                    Ambiente de Produção / Demonstração: Confirme o pagamento para ativar o selo imediatamente.
                  </p>
                  <button
                    onClick={() => handleConfirmPayment(checkoutResult.subscriptionId)}
                    disabled={confirming}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/25"
                  >
                    {confirming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validando recebimento...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Simular Confirmação do Pagamento PIX
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* MODAL DE UPGRADE / PRÓ-RATA */}
      {upgradeModalOpen && targetSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setUpgradeModalOpen(false);
                setTargetSub(null);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                <ArrowUpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Upgrade com Pró-Rata
                </h3>
                <p className="text-xs text-neutral-500">
                  {targetSub.listing?.name || 'Estabelecimento'} • Aproveite seus créditos restantes
                </p>
              </div>
            </div>

            {/* SELEÇÃO DO NOVO PLANO */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Escolha o Novo Plano Desejado:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {plans
                    .filter((p) => p.id !== targetSub.plan)
                    .map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleRecalculateProrata(p.id, targetNewCycle)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          targetNewPlan === p.id
                            ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-bold text-neutral-900 text-sm">{p.name}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          R$ {(targetNewCycle === 'YEARLY' ? p.priceYearly : p.priceMonthly).toFixed(2)}
                          /{targetNewCycle === 'YEARLY' ? 'ano' : 'mês'}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* CICLO TOGGLE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Ciclo de Cobrança:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => handleRecalculateProrata(targetNewPlan, 'MONTHLY')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      targetNewCycle === 'MONTHLY' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecalculateProrata(targetNewPlan, 'YEARLY')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      targetNewCycle === 'YEARLY' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'
                    }`}
                  >
                    Anual (2 meses grátis)
                  </button>
                </div>
              </div>

              {/* CARD DETALHADO DO PRÓ-RATA */}
              {prorataLoading ? (
                <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 text-center">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-neutral-500 font-medium">Calculando crédito residual proporcional...</p>
                </div>
              ) : prorataCalc ? (
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2.5 text-xs text-neutral-600">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                    <span className="font-medium">Plano Atual ({prorataCalc.currentPlan.name}):</span>
                    <span className="font-bold text-neutral-800">
                      {prorataCalc.currentPlan.daysRemaining} dias restantes
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span>Crédito Abatido do Plano Atual:</span>
                    <span className="font-mono">- R$ {prorataCalc.unusedCredit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Valor do Novo Plano ({prorataCalc.newPlan.name}):</span>
                    <span className="font-mono">R$ {prorataCalc.newPlan.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm font-extrabold text-neutral-900">
                    <span>Valor Proporcional a Pagar:</span>
                    <span className="text-base text-emerald-600 font-mono">
                      R$ {prorataCalc.amountToPay.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleExecuteUpgrade}
                disabled={checkoutLoading || prorataLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando PIX de Upgrade...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Confirmar Upgrade & Pagar via PIX
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

