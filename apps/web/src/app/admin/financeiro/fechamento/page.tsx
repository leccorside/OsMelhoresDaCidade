'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Printer,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  CreditCard,
  QrCode,
  Building2,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import {
  fetchAdminMonthlyClosingReportApi,
  MonthlyClosingReportData,
} from '@/lib/api';

export default function MonthlyClosingReportPage() {
  const router = useRouter();

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);

  const [report, setReport] = useState<MonthlyClosingReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await fetchAdminMonthlyClosingReportApi(selectedYear, selectedMonth);
      setReport(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar relatório de fechamento mensal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedYear, selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 py-8 px-4 sm:px-6 font-sans">
      {/* BARRA SUPERIOR DE AÇÕES & FILTRO (Oculta na impressão) */}
      <div className="max-w-5xl mx-auto mb-6 print:hidden">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-200/80 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => router.push('/admin/financeiro')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel Financeiro
          </button>

          {/* Seletor de Período */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span>Competência:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent font-bold text-neutral-800 focus:outline-none cursor-pointer"
              >
                <option value={1}>Janeiro</option>
                <option value={2}>Fevereiro</option>
                <option value={3}>Março</option>
                <option value={4}>Abril</option>
                <option value={5}>Maio</option>
                <option value={6}>Junho</option>
                <option value={7}>Julho</option>
                <option value={8}>Agosto</option>
                <option value={9}>Setembro</option>
                <option value={10}>Outubro</option>
                <option value={11}>Novembro</option>
                <option value={12}>Dezembro</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent font-bold text-neutral-800 focus:outline-none cursor-pointer border-l border-neutral-200 pl-2"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Relatório / Salvar PDF
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="max-w-5xl mx-auto bg-white p-12 rounded-3xl shadow-sm border border-neutral-200 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-neutral-700 font-medium text-sm">
            Consolidando lançamentos e apurando fechamento contábil...
          </p>
        </div>
      ) : errorMsg || !report ? (
        <div className="max-w-5xl mx-auto bg-white p-12 rounded-3xl shadow-sm border border-neutral-200 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-neutral-900">Erro na apuração contábil</h2>
          <p className="text-xs text-neutral-500 mt-1">{errorMsg}</p>
        </div>
      ) : (
        /* DOCUMENTO OFICIAL DE FECHAMENTO CONTÁBIL (Layout A4 / Executivo) */
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden print:border-none print:shadow-none print:rounded-none print:p-0">
          
          {/* CABEÇALHO EXECUTIVO TIMBRADO */}
          <div className="border-b-2 border-neutral-900 p-8 bg-neutral-50/60">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-950 flex items-center justify-center text-amber-500 shadow-md shrink-0">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">
                    Demonstrativo Contábil Oficial
                  </span>
                  <h1 className="text-2xl font-black text-neutral-950 tracking-tight">
                    Relatório Consolidado de Fechamento Mensal
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Os Melhores da Cidade Plataforma Digital Ltda • CNPJ 48.912.834/0001-90
                  </p>
                </div>
              </div>

              <div className="sm:text-right bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  CÓDIGO DE FECHAMENTO
                </span>
                <span className="font-mono text-sm font-extrabold text-neutral-900 block mt-0.5">
                  {report.closingNumber}
                </span>
                <span className="text-[11px] font-bold text-amber-700 block mt-0.5">
                  Competência: {report.period.monthName} / {report.period.year}
                </span>
              </div>
            </div>
          </div>

          {/* CORPO DO RELATÓRIO */}
          <div className="p-8 space-y-8 text-neutral-800 text-sm">

            {/* 4 CARDS DE CONSOLIDAÇÃO FINANCEIRA */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Faturamento Bruto
                </span>
                <div className="text-xl font-black text-neutral-950 mt-1">
                  R$ {report.summary.grossRevenue.toFixed(2)}
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  {report.summary.transactionsCount} transações quitadas
                </p>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Repasse Franquias
                </span>
                <div className="text-xl font-black text-emerald-700 mt-1">
                  R$ {report.summary.franchiseCommissionTotal.toFixed(2)}
                </div>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  Splits de praças locais
                </p>
              </div>

              <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                  Receita Líquida Matriz
                </span>
                <div className="text-xl font-black text-sky-800 mt-1">
                  R$ {report.summary.platformNetRevenue.toFixed(2)}
                </div>
                <p className="text-[10px] text-sky-600 mt-0.5">
                  Retenção operacional
                </p>
              </div>

              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                  Ticket Médio
                </span>
                <div className="text-xl font-black text-purple-900 mt-1">
                  R$ {report.summary.averageTicket.toFixed(2)}
                </div>
                <p className="text-[10px] text-purple-600 mt-0.5">
                  Por assinatura VIP
                </p>
              </div>
            </div>

            {/* BREAKDOWN POR MEIO DE PAGAMENTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">PIX Instantâneo</span>
                    <span className="text-[11px] text-neutral-400">
                      {report.summary.methodStats.PIX?.count || 0} recebimentos
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono text-neutral-900 block">
                    R$ {(report.summary.methodStats.PIX?.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">Cartão de Crédito Gateway</span>
                    <span className="text-[11px] text-neutral-400">
                      {report.summary.methodStats.CREDIT_CARD?.count || 0} recebimentos
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono text-neutral-900 block">
                    R$ {(report.summary.methodStats.CREDIT_CARD?.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* RATEIO POR CIDADE / PRAÇA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-950 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  Demonstrativo Consolidado por Praça / Franquia
                </h3>
                <span className="text-xs text-neutral-500 font-mono">
                  {report.cityBreakdown.length} praças com movimento
                </span>
              </div>

              <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-600 uppercase font-bold border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-2.5">Cidade / UF</th>
                      <th className="px-4 py-2.5">Gestão / Franquia</th>
                      <th className="px-4 py-2.5">Transações</th>
                      <th className="px-4 py-2.5 text-right">Faturamento Bruto</th>
                      <th className="px-4 py-2.5 text-right">Comissão Franquia</th>
                      <th className="px-4 py-2.5 text-right">Retenção Matriz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {report.cityBreakdown.map((c, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50">
                        <td className="px-4 py-2.5 font-bold text-neutral-900">
                          {c.cityName} - {c.uf}
                        </td>
                        <td className="px-4 py-2.5 text-neutral-600">
                          {c.franchiseName}
                        </td>
                        <td className="px-4 py-2.5 font-mono">{c.transactionsCount}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-neutral-900">
                          R$ {c.grossAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700">
                          R$ {c.franchiseAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-sky-800">
                          R$ {c.platformAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LIVRO CAIXA / BALANCETE ANALÍTICO */}
            <div className="space-y-3 pt-2">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-950 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                Livro Caixa Analítico — Lançamentos do Mês
              </h3>

              {report.transactions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-2xl text-xs text-neutral-400">
                  Nenhum lançamento registrado no período selecionado.
                </div>
              ) : (
                <div className="overflow-x-auto border border-neutral-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-600 uppercase font-bold border-b border-neutral-200">
                      <tr>
                        <th className="px-3 py-2.5">Data</th>
                        <th className="px-3 py-2.5">Fatura</th>
                        <th className="px-3 py-2.5">Estabelecimento</th>
                        <th className="px-3 py-2.5">Plano</th>
                        <th className="px-3 py-2.5">Cidade</th>
                        <th className="px-3 py-2.5">Meio</th>
                        <th className="px-3 py-2.5 text-right">Bruto</th>
                        <th className="px-3 py-2.5 text-right">Franquia</th>
                        <th className="px-3 py-2.5 text-right">Matriz</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                      {report.transactions.map((t) => (
                        <tr key={t.paymentId} className="hover:bg-neutral-50/50">
                          <td className="px-3 py-2 text-neutral-500 whitespace-nowrap">
                            {new Date(t.paidAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-3 py-2 text-neutral-600 font-semibold">{t.invoiceNumber}</td>
                          <td className="px-3 py-2 font-sans font-bold text-neutral-900">{t.listingName}</td>
                          <td className="px-3 py-2 font-sans text-neutral-700">{t.plan}</td>
                          <td className="px-3 py-2 font-sans text-neutral-600">{t.cityName}</td>
                          <td className="px-3 py-2 font-sans">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 font-bold">
                              {t.paymentMethod}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-neutral-900">
                            R$ {t.grossAmount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-700">
                            R$ {t.franchiseAmount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-sky-800">
                            R$ {t.platformAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* CARIMBO DE FECHAMENTO CONTÁBIL & ASSINATURA */}
            <div className="pt-6 border-t-2 border-neutral-200 bg-neutral-50/70 p-6 rounded-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Termo de Conferência e Encerramento do Exercício Mensal</span>
              </div>

              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Certifico para os devidos fins contábeis e fiscais que os lançamentos acima discriminados representam a exata totalidade das receitas de publicidade e taxas de veiculação quitadas no portal durante a competência de {report.period.monthName}/{report.period.year}, devidamente conciliadas com o gateway de pagamentos Asaas e com as liquidações de split autorizadas.
              </p>

              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Hash SHA-256 do Livro Caixa:
                </span>
                <span className="font-mono text-[10px] text-neutral-700 break-all select-all font-semibold block mt-0.5">
                  {report.closingHash}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  Gerado em: {new Date(report.generatedAt).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
                <div>
                  <div className="w-56 h-0.5 bg-neutral-400 mb-2 mx-auto sm:mx-0"></div>
                  <span className="text-xs font-bold text-neutral-800 block">
                    Controladoria & Auditoria Financeira
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    Os Melhores da Cidade Plataforma Digital Ltda
                  </span>
                </div>

                <div>
                  <div className="w-56 h-0.5 bg-neutral-400 mb-2 mx-auto sm:mx-0"></div>
                  <span className="text-xs font-bold text-neutral-800 block">
                    Diretoria Executiva / CEO
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    Aprovado para fechamento contábil e fiscal
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RODAPÉ */}
          <div className="bg-neutral-900 text-neutral-400 px-8 py-3.5 text-[10px] flex justify-between items-center">
            <span>Os Melhores da Cidade — Sistema de Gestão Financeira Central</span>
            <span>Documento Contábil • Impresso Oficial</span>
          </div>

        </div>
      )}
    </div>
  );
}
