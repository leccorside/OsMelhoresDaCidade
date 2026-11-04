import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import {
  Store,
  TrendingUp,
  MessageCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = constructMetadata({
  title: 'Anuncie seu Negócio | Os Melhores da Cidade',
  description: 'Coloque sua empresa em evidência para milhares de turistas e moradores. Aumente contatos no WhatsApp e faturamento.',
  canonical: '/anuncie',
});

export default function AnunciePage() {
  const benefits = [
    {
      title: 'Posicionamento em Destaque',
      desc: 'Apareça no topo das buscas orgânicas da sua cidade e em categorias estratégicas como Restaurantes, Bares e Hotéis.',
      icon: TrendingUp,
    },
    {
      title: 'Cliques Diretos no WhatsApp',
      desc: 'Os clientes acessam seu cardápio, fotos e horários e entram em contato direto com você em 1 clique.',
      icon: MessageCircle,
    },
    {
      title: 'Painel com Métricas Reais',
      desc: 'Acompanhe visualizações do anúncio, cliques em Como Chegar e avaliações dos clientes em tempo real.',
      icon: Eye,
    },
    {
      title: 'Selo de Estabelecimento Verificado',
      desc: 'Passe credibilidade instantânea para turistas que estão visitando sua cidade pela primeira vez.',
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      <Header currentCitySlug="caldas-novas" />

      <main className="flex-1 flex flex-col bg-[#FCF9F8] pb-16 sm:pb-0">
        {/* Hero */}
        <section className="py-16 sm:py-24 px-6 bg-gradient-to-r from-[#171717] via-[#241F1F] to-[#171717] text-white text-center">
          <div className="max-w-4xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider bg-[#FF3B4F] text-white px-3.5 py-1.5 rounded-full inline-block mb-4">
              Solução para Comerciantes & Empresários
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              Coloque seu estabelecimento no radar de quem está pronto para comprar
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Moradores e turistas usam o guia oficial <strong>Os Melhores da Cidade</strong> diariamente para decidir onde comer, se hospedar e se divertir.
            </p>

            <Link href="/cadastro">
              <Button variant="primary" size="lg" className="px-10 py-4 text-base">
                Cadastrar Minha Empresa Agora
              </Button>
            </Link>
          </div>
        </section>

        {/* Benefícios Grid */}
        <section className="max-w-7xl mx-auto px-6 py-16 w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">
              Por que anunciar no guia oficial?
            </h2>
            <p className="text-xs sm:text-sm text-[#777777] mt-2">
              Transforme a presença digital do seu negócio em clientes reais entrando pela sua porta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] text-[#FF3B4F] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-[#171717] mb-2">{b.title}</h3>
                  <p className="text-xs text-[#777777] leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-14 px-6 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-4xl font-black text-[#171717]">
              Pronto para destacar sua empresa?
            </h2>
            <p className="text-sm text-[#777777] max-w-xl mx-auto">
              Crie sua conta de comerciante em menos de 2 minutos e submeta seu estabelecimento para nossa equipe.
            </p>
            <div className="pt-2">
              <Link href="/cadastro">
                <Button variant="primary" size="lg">
                  Criar Conta de Comerciante
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer currentCitySlug="caldas-novas" />
      <MobileNav currentCitySlug="caldas-novas" />
    </>
  );
}

