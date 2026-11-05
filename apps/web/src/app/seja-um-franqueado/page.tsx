'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Calculator,
  Users,
  Smartphone,
  Layers,
  Award,
  Zap,
  HelpCircle,
  Loader2,
  Send,
  MapPin,
  ChevronRight,
  PieChart,
} from 'lucide-react';
import { createFranchiseLeadApi } from '@/lib/api';

export default function SejaUmFranqueadoPage() {
  // Simulador State
  const [cityPopulation, setCityPopulation] = useState<number>(80000);
  const [merchantsCount, setMerchantsCount] = useState<number>(45);
  const [averageTicket, setAverageTicket] = useState<number>(149);

  // Cálculos do Simulador (Franqueado retém 80% de split)
  const monthlyGrossRevenue = merchantsCount * averageTicket;
  const franchiseMonthlyNet = monthlyGrossRevenue * 0.8;
  const franchiseAnnualNet = franchiseMonthlyNet * 12;
  const estimatedInvestment = 15000;
  const roiMonths = Math.max(1, Math.round(estimatedInvestment / Math.max(1, franchiseMonthlyNet)));

  // Formulário State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: 'BA',
    capitalAvailable: 'R$ 15.000 a R$ 30.000',
    experience: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.city) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      await createFranchiseLeadApi(formData);
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao enviar inscrição. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-neutral-950 to-neutral-950 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            Expansão de Franquias Digitais Regionais
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Seja o Dono do Guia Oficial <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              Na Sua Cidade e Região
            </span>
          </h1>

          <p className="text-neutral-400 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Uma franquia de alta rentabilidade com tecnologia pronta, aplicativo PWA instalável, gateway de pagamento com split automático e <strong className="text-amber-400">80% de comissão recorrente</strong> em todos os planos de destaque vendidos.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#simulador"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Calculator className="w-5 h-5" />
              Simular Faturamento da Minha Cidade
            </a>
            <a
              href="#candidatura"
              className="px-8 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-sm transition-all flex items-center gap-2"
            >
              Candidatar-se à Praça
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* BADGES DE AUTORIDADE */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block uppercase font-bold tracking-wider">Comissão Fixa</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">80% da Receita</span>
              <p className="text-[11px] text-neutral-400 mt-0.5">Repasse direto por split</p>
            </div>
            <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block uppercase font-bold tracking-wider">Exclusividade</span>
              <span className="text-2xl font-black text-white mt-1 block">1 Franqueado</span>
              <p className="text-[11px] text-neutral-400 mt-0.5">Por comarca / município</p>
            </div>
            <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block uppercase font-bold tracking-wider">Tecnologia</span>
              <span className="text-2xl font-black text-white mt-1 block">100% Pronta</span>
              <p className="text-[11px] text-neutral-400 mt-0.5">Sem custos de TI ou servidores</p>
            </div>
            <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block uppercase font-bold tracking-wider">Retorno Médio</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">2 a 4 Meses</span>
              <p className="text-[11px] text-neutral-400 mt-0.5">Payback comprovado em praça</p>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULADOR INTERATIVO */}
      <section id="simulador" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-amber-500 block">
            Calculadora Interativa de Lucro
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Quanto Você Pode Lucrar Como Franqueado?
          </h2>
          <p className="text-neutral-400 text-sm max-w-2xl mx-auto">
            Ajuste os controles abaixo para simular o potencial de faturamento do seu município com base no número de assinantes VIP locais.
          </p>
        </div>

        <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* CONTROLES DESLIZANTES */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* População */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  População Estimada da Praça:
                </label>
                <span className="font-mono text-sm font-extrabold text-white">
                  {cityPopulation.toLocaleString('pt-BR')} habitantes
                </span>
              </div>
              <input
                type="range"
                min={15000}
                max={500000}
                step={5000}
                value={cityPopulation}
                onChange={(e) => setCityPopulation(Number(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>15.000 hab</span>
                <span>250.000 hab</span>
                <span>500.000+ hab</span>
              </div>
            </div>

            {/* Quantidade de Comércios VIPs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  Comércios VIPs Assinantes na Cidade:
                </label>
                <span className="font-mono text-lg font-black text-amber-400">
                  {merchantsCount} lojas ativas
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={merchantsCount}
                onChange={(e) => setMerchantsCount(Number(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>10 comércios</span>
                <span>75 comércios</span>
                <span>150 comércios</span>
              </div>
            </div>

            {/* Ticket Médio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Ticket Médio de Assinatura Mensal:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 79, label: 'Bronze VIP (R$ 79)' },
                  { value: 149, label: 'Prata VIP (R$ 149)' },
                  { value: 249, label: 'Ouro Master (R$ 249)' },
                ].map((ticket) => (
                  <button
                    key={ticket.value}
                    type="button"
                    onClick={() => setAverageTicket(ticket.value)}
                    className={`py-3 px-2 rounded-2xl border text-xs font-bold transition-all ${
                      averageTicket === ticket.value
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-md'
                        : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {ticket.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RESULTADOS DA SIMULAÇÃO */}
          <div className="lg:col-span-5 bg-gradient-to-b from-neutral-800/90 to-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-700 space-y-6">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block border-b border-neutral-700/80 pb-2">
              Projeção Financeira Franqueado
            </span>

            <div>
              <span className="text-xs text-neutral-400 block">Seu Lucro Líquido Mensal (80%):</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                R$ {franchiseMonthlyNet.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                Receita recorrente caindo todo mês via PIX
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-700/60">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase font-bold">Faturamento Anual</span>
                <span className="font-mono text-base font-black text-white mt-0.5 block">
                  R$ {franchiseAnnualNet.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase font-bold">Payback Estimado</span>
                <span className="font-mono text-base font-black text-amber-400 mt-0.5 block">
                  {roiMonths} {roiMonths === 1 ? 'mês' : 'meses'}
                </span>
              </div>
            </div>

            <a
              href="#candidatura"
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              Garantir Exclusividade da Minha Praça
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

      {/* VANTAGENS E DIFERENCIAIS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-neutral-800">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-amber-500 block">
            Por Que Escolher Nosso Modelo
          </span>
          <h2 className="text-3xl font-black text-white">
            Tudo o Que Você Precisa para Faturar Alto
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">App PWA & Portal Web</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              O consumidor instala o app no celular sem passar por lojas de aplicativos. Carregamento instantâneo e layout moderno.
            </p>
          </div>

          <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Split Bancário Automático</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Quando o comerciante paga via PIX ou Cartão pelo Asaas, 80% do valor vai automaticamente para a sua conta, sem burocracia.
            </p>
          </div>

          <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">CRM de Vendas Incluso</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Painel de prospecção com script comercial pronto para WhatsApp. Você só precisa negociar e cadastrar os lojistas.
            </p>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO DE CANDIDATURA */}
      <section id="candidatura" className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-neutral-800">
        <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-8 sm:p-12 shadow-2xl">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-amber-500 block">
              Processo Seletivo de Praças
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Candidate-se para Ser o Franqueado da Sua Cidade
            </h2>
            <p className="text-xs text-neutral-400">
              Preencha o formulário e nossa diretoria de expansão entrará em contato em até 24h úteis.
            </p>
          </div>

          {submitSuccess ? (
            <div className="p-8 bg-emerald-950/60 border border-emerald-500/40 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Candidatura Recebida com Sucesso!</h3>
              <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
                Parabéns pelo interesse! Já recebemos seus dados da cidade de <strong>{formData.city} - {formData.state}</strong>. Nossa equipe entrará em contato por WhatsApp para agendar a entrevista de apresentação.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-xs text-rose-300">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Mendes"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    placeholder="(77) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Cidade de Interesse *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Luís Eduardo Magalhães"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Estado (UF) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="BA"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Capital Disponível para Investimento</label>
                  <select
                    value={formData.capitalAvailable}
                    onChange={(e) => setFormData({ ...formData, capitalAvailable: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="R$ 10.000 a R$ 20.000">R$ 10.000 a R$ 20.000</option>
                    <option value="R$ 20.000 a R$ 40.000">R$ 20.000 a R$ 40.000</option>
                    <option value="Acima de R$ 40.000">Acima de R$ 40.000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Experiência Profissional</label>
                  <input
                    type="text"
                    placeholder="Ex: Comercial, Vendas, Gestor de Tráfego"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando Candidatura...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Minha Candidatura à Franquia
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 py-8 px-4 text-center text-xs text-neutral-500">
        <p>Os Melhores da Cidade — Programa Oficial de Franquias Digitais</p>
        <p className="mt-1">Todos os direitos reservados • Modelagem homologada com Split Asaas</p>
      </footer>

    </div>
  );
}
