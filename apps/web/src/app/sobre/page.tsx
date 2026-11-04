import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Award, Compass, ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Quem Somos | Sobre a Plataforma Os Melhores da Cidade',
  description: 'Conheça o propósito, a história e os critérios editoriais do maior guia de cidades, turismo e gastronomia do Brasil.',
  canonical: '/sobre',
});

export default function SobrePage() {
  return (
    <>
      <Header currentCitySlug="caldas-novas" />

      <main className="flex-1 flex flex-col bg-[#FCF9F8] pb-16 sm:pb-0">
        <section className="py-16 sm:py-24 px-6 bg-gradient-to-b from-white to-[#FCF9F8] text-center border-b border-[#E5E7EB]">
          <div className="max-w-4xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF3B4F] bg-[#FFF1F2] px-3.5 py-1.5 rounded-full inline-block mb-4">
              Manifesto & Propósito
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight mb-6">
              Celebrando o que cada cidade brasileira tem de mais autêntico
            </h1>
            <p className="text-base sm:text-xl text-[#777777] leading-relaxed">
              <strong>Os Melhores da Cidade</strong> nasceu com a missão de conectar moradores e viajantes aos negócios locais que realmente fazem a diferença na gastronomia, hotelaria, cultura e serviços.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-16 w-full space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-[#FF3B4F]" />
              </div>
              <h3 className="font-bold text-lg text-[#171717] mb-2">Curadoria Editorial</h3>
              <p className="text-xs text-[#777777] leading-relaxed">
                Nossa equipe pesquisa, testa e avalia critérios de higiene, excelência no atendimento e história antes de destacar qualquer local.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-[#10B981]" />
              </div>
              <h3 className="font-bold text-lg text-[#171717] mb-2">Avaliações 100% Reais</h3>
              <p className="text-xs text-[#777777] leading-relaxed">
                Blindagem anti-bot e anti-spam. Permitimos apenas uma avaliação por usuário cadastrado em cada estabelecimento.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="font-bold text-lg text-[#171717] mb-2">Hiperlocalismo</h3>
              <p className="text-xs text-[#777777] leading-relaxed">
                Começamos em Caldas Novas (GO) e estamos expandindo com estrutura tecnológica para cobrir milhares de municípios do Brasil.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer currentCitySlug="caldas-novas" />
      <MobileNav currentCitySlug="caldas-novas" />
    </>
  );
}

