'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Printer,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  Download,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { fetchInvoiceDetailsApi, InvoiceData } from '@/lib/api';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params?.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subscriptionId) return;

    async function loadInvoice() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInvoiceDetailsApi(subscriptionId);
        setInvoice(data);
      } catch (err: any) {
        setError(err.message || 'Não foi possível carregar os dados da fatura.');
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [subscriptionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-neutral-700 font-medium">Carregando dados oficiais da fatura...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-sm border border-neutral-200 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Fatura não encontrada</h2>
          <p className="text-sm text-neutral-500 mb-6">{error || 'Não foi possível localizar o documento fiscal desta assinatura.'}</p>
          <button
            onClick={() => router.push('/comerciante/planos')}
            className="w-full py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Meus Planos
          </button>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'PAID';
  const isPending = invoice.status === 'PENDING';

  return (
    <div className="min-h-screen bg-neutral-100/70 py-8 px-4 sm:px-6 font-sans">
      {/* BARRA SUPERIOR DE AÇÕES (Oculta na impressão) */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/80 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => router.push('/comerciante/planos')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Planos de Destaque
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar em PDF
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL A4 DA FATURA */}
      <div
        id="invoice-document"
        className="max-w-4xl mx-auto bg-white rounded-3xl sm:rounded-[2rem] shadow-xl border border-neutral-200/80 p-8 sm:p-12 text-neutral-800 print:shadow-none print:border-none print:p-6 print:rounded-none"
      >
        {/* CABEÇALHO DA FATURA */}
        <div className="border-b border-neutral-200 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                    Os Melhores da Cidade
                  </h1>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                    Portal & Guia Comercial Oficial
                  </p>
                </div>
              </div>

              <div className="mt-4 text-xs text-neutral-500 space-y-0.5 leading-relaxed">
                <p className="font-semibold text-neutral-700">{invoice.provider.name}</p>
                <p>CNPJ: {invoice.provider.cnpj} | {invoice.provider.address}</p>
                <p>E-mail: {invoice.provider.email} | Site: {invoice.provider.website}</p>
              </div>
            </div>

            {/* BOX NÚMERO E STATUS */}
            <div className="sm:text-right flex flex-col sm:items-end">
              <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
                Recibo / Fatura Oficial
              </span>
              <span className="text-2xl font-black text-neutral-900 tracking-tight mt-1 font-mono">
                {invoice.invoiceNumber}
              </span>

              <div className="mt-3">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    PAGAMENTO LIQUIDADO
                  </span>
                ) : isPending ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-300">
                    <Clock className="w-4 h-4 text-amber-600" />
                    AGUARDANDO PAGAMENTO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-neutral-100 text-neutral-700">
                    {invoice.statusLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* METADADOS DE DATA E TOMADOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-neutral-200">
          {/* TOMADOR DOS SERVIÇOS */}
          <div className="bg-neutral-50/70 p-6 rounded-2xl border border-neutral-200/60">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              Tomador dos Serviços (Contratante)
            </span>
            <h3 className="text-lg font-bold text-neutral-900">
              {invoice.customer.tradeName}
            </h3>
            {invoice.customer.companyName && invoice.customer.companyName !== invoice.customer.tradeName && (
              <p className="text-xs text-neutral-500 font-medium">{invoice.customer.companyName}</p>
            )}

            <div className="mt-4 space-y-1.5 text-xs text-neutral-600">
              <p>
                <span className="font-semibold text-neutral-700">CPF/CNPJ:</span> {invoice.customer.document}
              </p>
              <p>
                <span className="font-semibold text-neutral-700">Responsável:</span> {invoice.customer.contactName}
              </p>
              <p>
                <span className="font-semibold text-neutral-700">E-mail:</span> {invoice.customer.contactEmail}
              </p>
              <p>
                <span className="font-semibold text-neutral-700">Telefone:</span> {invoice.customer.contactPhone}
              </p>
              <p>
                <span className="font-semibold text-neutral-700">Endereço:</span> {invoice.customer.address}
              </p>
            </div>
          </div>

          {/* DADOS DA TRANSAÇÃO E VIGÊNCIA */}
          <div className="bg-neutral-50/70 p-6 rounded-2xl border border-neutral-200/60 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Informações de Liquidação & Vigência
              </span>

              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
                  <span className="font-semibold text-neutral-700">Data de Emissão:</span>
                  <span>{new Date(invoice.issueDate).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
                  <span className="font-semibold text-neutral-700">Data de Liquidação:</span>
                  <span>
                    {invoice.paidAt
                      ? new Date(invoice.paidAt).toLocaleDateString('pt-BR')
                      : 'Pendente de quitação'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
                  <span className="font-semibold text-neutral-700">Forma de Pagamento:</span>
                  <span className="font-bold text-neutral-800">
                    {invoice.service.paymentMethod} (Instantâneo)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-200/50">
                  <span className="font-semibold text-neutral-700">Ciclo de Cobrança:</span>
                  <span>{invoice.service.billingCycle}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-neutral-700">Período de Veiculação:</span>
                  <span className="font-medium text-emerald-800">
                    {new Date(invoice.service.periodStart).toLocaleDateString('pt-BR')} até{' '}
                    {invoice.service.periodEnd
                      ? new Date(invoice.service.periodEnd).toLocaleDateString('pt-BR')
                      : 'Indeterminado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs text-neutral-500">
              <span>Autenticação Digital:</span>
              <span className="font-mono font-bold text-neutral-700">{invoice.verificationCode}</span>
            </div>
          </div>
        </div>

        {/* DETALHAMENTO DOS SERVIÇOS PRESTADOS */}
        <div className="py-8 border-b border-neutral-200">
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
            Discriminação dos Serviços Prestados
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-100 text-neutral-600 text-xs font-bold uppercase">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Descrição do Serviço</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Ciclo</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                <tr>
                  <td className="py-4 px-4">
                    <p className="font-bold text-neutral-900">{invoice.service.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Estabelecimento veiculado:{' '}
                      <span className="font-semibold text-neutral-700">
                        {invoice.service.listingName}
                      </span>
                    </p>
                  </td>
                  <td className="py-4 px-4 font-semibold text-neutral-800">
                    {invoice.service.planName}
                  </td>
                  <td className="py-4 px-4 text-neutral-600">
                    {invoice.service.billingCycle}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-neutral-900 font-mono">
                    R$ {invoice.service.grossAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TOTALIZADORES */}
          <div className="mt-6 flex justify-end">
            <div className="w-full sm:w-72 bg-neutral-50 rounded-2xl p-4 border border-neutral-200/70 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600 text-xs">
                <span>Subtotal Bruto:</span>
                <span className="font-mono">R$ {invoice.service.grossAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 text-xs">
                <span>
                  Desconto / Isenções
                  {invoice.service.couponCode ? ` (${invoice.service.couponCode})` : ''}:
                </span>
                <span className={`font-mono ${invoice.service.discountAmount > 0 ? 'text-emerald-700 font-semibold' : ''}`}>
                  {invoice.service.discountAmount > 0 ? '- ' : ''}R$ {invoice.service.discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between items-center font-extrabold text-neutral-900 text-base">
                <span>Valor Líquido Pago:</span>
                <span className="text-emerald-700 font-mono">
                  R$ {invoice.service.netAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DECLARAÇÃO E VALIDAÇÃO FISCAL */}
        <div className="pt-8 space-y-6">
          <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Declaração Oficial de Quitação e Prestação de Serviços de Publicidade:
            </p>
            <p className="text-neutral-600">
              Declaramos para os devidos fins legais, fiscais e contábeis que os serviços de
              publicidade digital, hospedagem de página institucional e exibição de selo prioritário no
              Guia Os Melhores da Cidade foram regularmente contratados e ativados de acordo com os
              termos de uso aceitos pelo tomador.
            </p>
            {invoice.service.gatewayPaymentId && (
              <p className="mt-2 text-neutral-500 font-mono text-[11px]">
                Identificador Gateway (Asaas): {invoice.service.gatewayPaymentId}
              </p>
            )}
          </div>

          {/* RODAPÉ DO DOCUMENTO */}
          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div>
              Documento gerado eletronicamente em{' '}
              {new Date().toLocaleDateString('pt-BR')} às{' '}
              {new Date().toLocaleTimeString('pt-BR')}.
            </div>
            <div className="font-mono text-neutral-500">
              Chave: {invoice.verificationCode}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
