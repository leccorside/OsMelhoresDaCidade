'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileCheck,
  Printer,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  Loader2,
  Lock,
  ExternalLink,
  Award,
  Stamp,
  CheckCircle2,
} from 'lucide-react';
import { fetchSubscriptionContractApi, SubscriptionContractData } from '@/lib/api';

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const subscriptionId = params?.id as string;

  const [contract, setContract] = useState<SubscriptionContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subscriptionId) return;

    async function loadContract() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSubscriptionContractApi(subscriptionId);
        setContract(data);
      } catch (err: any) {
        setError(err.message || 'Não foi possível carregar o contrato de adesão.');
      } finally {
        setLoading(false);
      }
    }

    loadContract();
  }, [subscriptionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-neutral-700 font-medium">Carregando instrumento jurídico do contrato...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-sm border border-neutral-200 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Contrato não encontrado</h2>
          <p className="text-sm text-neutral-500 mb-6">{error || 'Não foi possível localizar o instrumento contratual desta assinatura.'}</p>
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

  const isPaid = contract.status === 'PAID';

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
            <span className="text-xs text-neutral-400 hidden sm:inline">
              Autenticado digitalmente via SHA-256
            </span>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Contrato / Salvar PDF
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENTO DO CONTRATO TIMBRADO (Layout para Visualização e Impressão A4) */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl sm:rounded-3xl shadow-lg border border-neutral-200 overflow-hidden print:border-none print:shadow-none print:rounded-none print:p-0">
        
        {/* CABEÇALHO TIMBRADO */}
        <div className="border-b-2 border-neutral-900 p-8 sm:p-10 bg-neutral-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-950 flex items-center justify-center text-amber-500 shadow-md">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 block">
                  Instrumento Jurídico Digital
                </span>
                <h1 className="text-2xl font-black text-neutral-950 tracking-tight">
                  Contrato de Adesão e Publicidade
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Prestação de Serviços de Divulgação Eletrônica e Destaque
                </p>
              </div>
            </div>

            <div className="sm:text-right bg-white p-3 rounded-2xl border border-neutral-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                N° DO CONTRATO
              </span>
              <span className="font-mono text-base font-extrabold text-neutral-900">
                {contract.contractNumber}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">
                Emitido em: {new Date(contract.issuedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* STATUS DA ADESÃO */}
        <div className="px-8 sm:px-10 py-4 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-900">
              Contrato Celebrado & Plano {contract.plan.name} Ativo
            </span>
          </div>
          <div className="text-xs font-mono text-emerald-800">
            Ciclo {contract.billingCycle} • Valor: R$ {contract.plan.price.toFixed(2)}
          </div>
        </div>

        {/* CORPO DO CONTRATO */}
        <div className="p-8 sm:p-10 space-y-8 text-neutral-800 text-sm leading-relaxed">

          {/* QUALIFICAÇÃO DAS PARTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50/70 p-6 rounded-2xl border border-neutral-200">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 block mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                CONTRATADA (Plataforma):
              </span>
              <p className="font-bold text-neutral-950">{contract.emitter.legalName}</p>
              <p className="text-xs text-neutral-600 mt-1">CNPJ: {contract.emitter.cnpj}</p>
              <p className="text-xs text-neutral-600">Sede: {contract.emitter.headquarters}</p>
              <p className="text-xs text-neutral-600">E-mail: {contract.emitter.email}</p>
              <p className="text-xs text-neutral-600">Website: {contract.emitter.website}</p>
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 block mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                CONTRATANTE (Estabelecimento):
              </span>
              <p className="font-bold text-neutral-950">{contract.contractor.legalName || contract.contractor.tradeName}</p>
              <p className="text-xs text-neutral-600 mt-1">CNPJ / CPF: {contract.contractor.document}</p>
              <p className="text-xs text-neutral-600">Endereço: {contract.contractor.address}</p>
              <p className="text-xs text-neutral-600">Representante: {contract.contractor.responsibleName}</p>
              {contract.contractor.responsiblePhone && (
                <p className="text-xs text-neutral-600">Contato: {contract.contractor.responsiblePhone}</p>
              )}
            </div>
          </div>

          {/* OBJETO & ANÚNCIO VINCULADO */}
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-amber-950">Estabelecimento Divulgado: </span>
              <span className="text-amber-900 font-semibold">{contract.listing.name}</span>
            </div>
            <div className="text-amber-900 font-medium">
              Praça / Cidade: <span className="font-bold">{contract.listing.city}</span>
            </div>
          </div>

          {/* CLÁUSULAS CONTRATUAIS */}
          <div className="space-y-6 pt-2">
            {contract.clauses.map((clause, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="font-black text-xs uppercase tracking-wider text-neutral-950">
                  {clause.title}
                </h3>
                <p className="text-xs text-neutral-700 text-justify leading-relaxed">
                  {clause.content}
                </p>
              </div>
            ))}
          </div>

          {/* CARIMBO DE ASSINATURA DIGITAL E VALIDADE JURÍDICA */}
          <div className="mt-10 pt-6 border-t-2 border-neutral-200 bg-neutral-50/80 p-6 rounded-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Assinatura Digital & Carimbo Eletrônico de Autenticidade Jurídica</span>
            </div>

            <p className="text-[11px] text-neutral-600 leading-relaxed">
              Documento celebrado em meio digital nos termos do Art. 10, § 2º da Medida Provisória nº 2.200-2, de 24 de agosto de 2001, possuindo plena validade jurídica, executividade e presunção de veracidade entre as partes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Hash Criptográfico SHA-256:
                </span>
                <span className="font-mono text-[10px] text-neutral-700 break-all select-all font-semibold block mt-1">
                  {contract.digitalSignatureHash}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Chave do Instrumento:
                </span>
                <span className="font-mono text-xs text-amber-700 font-extrabold block mt-1">
                  {contract.contractNumber}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">
                  Assinado em: {new Date(contract.issuedAt).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
              <div>
                <div className="w-48 h-0.5 bg-neutral-400 mb-2 mx-auto sm:mx-0"></div>
                <span className="text-[11px] font-bold text-neutral-800 block">
                  {contract.emitter.legalName}
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  CONTRATADA (Plataforma Digital)
                </span>
              </div>

              <div>
                <div className="w-48 h-0.5 bg-neutral-400 mb-2 mx-auto sm:mx-0"></div>
                <span className="text-[11px] font-bold text-neutral-800 block">
                  {contract.contractor.responsibleName}
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  CONTRATANTE ({contract.contractor.tradeName})
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RODAPÉ TIMBRADO */}
        <div className="bg-neutral-900 text-neutral-400 px-8 py-4 text-[10px] flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Os Melhores da Cidade — Guia Oficial e Destaque Comercial Digital</span>
          <span>Página 1 de 1 • Instrumento de Contrato Oficial</span>
        </div>

      </div>
    </div>
  );
}
