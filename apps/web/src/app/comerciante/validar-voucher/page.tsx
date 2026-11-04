'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  CheckCheck,
  Percent,
  User,
  Store,
  Calendar,
  FileText,
  Loader2,
  ArrowRight,
  ClipboardPaste,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  validateVoucherApi,
  redeemVoucherApi,
  VoucherValidationResult,
} from '@/lib/api';

export default function MerchantValidateVoucherPage() {
  const [claimCode, setClaimCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [voucherData, setVoucherData] = useState<VoucherValidationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Histórico local de baixas da sessão
  const [recentRedemptions, setRecentRedemptions] = useState<
    Array<{
      claimCode: string;
      title: string;
      customerName?: string;
      usedAt: string;
    }>
  >([]);

  // Consultar Voucher
  const handleValidate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!claimCode.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setVoucherData(null);

    try {
      setLoading(true);
      const res = await validateVoucherApi(claimCode.trim());
      setVoucherData(res);
      if (!res.isValid) {
        setErrorMsg(res.statusMessage);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao consultar voucher.');
    } finally {
      setLoading(false);
    }
  };

  // Colar da área de transferência
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const cleaned = text.trim().toUpperCase();
        setClaimCode(cleaned);
      }
    } catch (e) {}
  };

  // Dar Baixa Definitiva no Voucher
  const handleRedeem = async () => {
    if (!voucherData || !voucherData.claim.claimCode) return;

    setErrorMsg(null);
    try {
      setRedeeming(true);
      const res = await redeemVoucherApi(voucherData.claim.claimCode);
      setSuccessMsg(res.message);

      // Adicionar ao histórico recente
      setRecentRedemptions((prev) => [
        {
          claimCode: res.claimCode,
          title: res.coupon?.title || 'Cupom Promocional',
          customerName: res.customerName,
          usedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 4),
      ]);

      // Atualizar status do voucher para já utilizado
      setVoucherData((prev) =>
        prev
          ? {
              ...prev,
              isValid: false,
              status: 'ALREADY_USED',
              statusMessage: `Voucher utilizado com sucesso às ${new Date().toLocaleTimeString('pt-BR')}!`,
              claim: {
                ...prev.claim,
                usedAt: res.usedAt,
              },
            }
          : null
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao dar baixa no voucher.');
    } finally {
      setRedeeming(false);
    }
  };

  // Limpar e nova consulta
  const handleReset = () => {
    setClaimCode('');
    setVoucherData(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Topo / Breadcrumb */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link href="/comerciante" className="hover:text-gray-900 transition">
            Painel do Parceiro
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/comerciante/cupons" className="hover:text-gray-900 transition">
            Promoções & Cupons
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-semibold">Validador de Balcão (PDV)</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <QrCode className="w-7 h-7 text-[#FF3B4F]" />
              Validador de Vouchers no Balcão
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Consulte o voucher do cliente pelo código e confirme a baixa imediata no momento do atendimento.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-200 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            Frente de Caixa
          </span>
        </div>
      </div>

      {/* Box de Busca / Consulta do Voucher */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        <form onSubmit={handleValidate} className="space-y-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Digite o Código do Voucher do Cliente
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                required
                placeholder="Ex: VOUCH-PROM-8F2A"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                className="w-full bg-gray-50 border-2 border-gray-200 focus:border-[#FF3B4F] rounded-2xl px-5 py-3.5 text-base sm:text-lg font-mono font-black tracking-wider text-gray-900 focus:outline-none transition uppercase"
              />
              <button
                type="button"
                onClick={handlePaste}
                title="Colar da área de transferência"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-xs font-bold text-gray-700 transition flex items-center gap-1"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Colar
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !claimCode.trim()}
              className="px-7 py-3.5 rounded-2xl bg-[#FF3B4F] text-white font-bold text-sm hover:bg-[#e03445] transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Consultar Voucher
            </button>
          </div>
        </form>

        {/* MENSAGEM DE ERRO OU ALERTA */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="block font-bold">Atenção na Validação:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* MENSAGEM DE SUCESSO */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* RESULTADO DA CONSULTA DO VOUCHER */}
        {voucherData && (
          <div
            className={`rounded-3xl border-2 p-6 sm:p-8 space-y-6 transition ${
              voucherData.isValid
                ? 'bg-emerald-50/50 border-emerald-300'
                : voucherData.status === 'ALREADY_USED'
                ? 'bg-amber-50/50 border-amber-300'
                : 'bg-red-50/50 border-red-300'
            }`}
          >
            {/* Header do Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200/60">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    voucherData.isValid
                      ? 'bg-emerald-500 text-white'
                      : voucherData.status === 'ALREADY_USED'
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {voucherData.isValid ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : voucherData.status === 'ALREADY_USED' ? (
                    <Clock className="w-7 h-7" />
                  ) : (
                    <AlertCircle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                    STATUS DO VOUCHER
                  </span>
                  <h3
                    className={`text-lg sm:text-xl font-extrabold ${
                      voucherData.isValid
                        ? 'text-emerald-900'
                        : voucherData.status === 'ALREADY_USED'
                        ? 'text-amber-900'
                        : 'text-red-900'
                    }`}
                  >
                    {voucherData.isValid
                      ? 'VOUCHER VÁLIDO E PRONTO PARA USO'
                      : voucherData.status === 'ALREADY_USED'
                      ? 'VOUCHER JÁ UTILIZADO ANTERIORMENTE'
                      : 'VOUCHER NÃO AUTORIZADO'}
                  </h3>
                </div>
              </div>

              <span className="font-mono font-black text-sm px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-900 self-start sm:self-auto">
                {voucherData.claim.claimCode}
              </span>
            </div>

            {/* Dados do Desconto & Promoção */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Benefício / Desconto
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#FF3B4F]">
                    {voucherData.coupon.discountType === 'PERCENTAGE'
                      ? `${voucherData.coupon.discountValue}% OFF`
                      : voucherData.coupon.discountType === 'FIXED_AMOUNT'
                      ? `R$ ${voucherData.coupon.discountValue} OFF`
                      : voucherData.coupon.discountType === 'FREEBIE'
                      ? 'BRINDE / CORTESIA'
                      : voucherData.coupon.discountUnit || 'PROMOÇÃO'}
                  </span>
                  {voucherData.coupon.minSpend && (
                    <span className="text-xs text-gray-500 font-medium">
                      (mín. R$ {Number(voucherData.coupon.minSpend).toFixed(2)})
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-gray-900 block mt-1">
                  {voucherData.coupon.title}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">
                  Cliente & Estabelecimento
                </span>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>{voucherData.claim.customerName || 'Cliente Visitante'}</span>
                  {voucherData.claim.customerPhone && (
                    <span className="text-gray-500 font-normal">
                      • {voucherData.claim.customerPhone}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Store className="w-3.5 h-3.5 text-gray-400" />
                  <span>{voucherData.coupon.listing.name}</span>
                </div>
              </div>
            </div>

            {/* Regras e Observações */}
            {voucherData.coupon.rules && (
              <div className="bg-white p-4 rounded-2xl border border-gray-200 text-xs text-gray-600">
                <span className="font-bold text-gray-800 block mb-0.5">
                  Regras da Oferta:
                </span>
                <span>{voucherData.coupon.rules}</span>
              </div>
            )}

            {/* Botão de Ação: Dar Baixa */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Nova Consulta
              </button>

              {voucherData.isValid && (
                <button
                  type="button"
                  onClick={handleRedeem}
                  disabled={redeeming}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-md"
                >
                  {redeeming ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCheck className="w-5 h-5" />
                  )}
                  Confirmar & Dar Baixa no Voucher
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* HISTÓRICO RECENTE DE BAIXAS DA SESSÃO */}
      {recentRedemptions.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Vouchers Baixados Nesta Sessão
          </h3>
          <div className="divide-y divide-gray-100">
            {recentRedemptions.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                    {item.claimCode}
                  </span>
                  <span className="font-semibold text-gray-800">{item.title}</span>
                  {item.customerName && (
                    <span className="text-gray-500">• {item.customerName}</span>
                  )}
                </div>
                <span className="text-gray-400 font-medium">às {item.usedAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
